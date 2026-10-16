import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const ENGINE_DIR = path.join(ROOT_DIR, 'whatsapp-engine');
const DIST_DIR = path.join(ENGINE_DIR, 'dist');
const TEST_PORT = 4099;
const ENGINE_BASE_URL = `http://localhost:${TEST_PORT}`;

describe('Milestone M1 Empirical Stress & Challenge Suite: WhatsApp Engine & Channel API', () => {

  // =========================================================================
  // 1. PHONE NUMBER VALIDATION & SANITIZATION STRESS HARNESS
  // =========================================================================
  describe('Phone Number Validation & Sanitization Rigor', () => {
    let BaileysManager;

    before(async () => {
      const mod = await import(pathToFileURL(path.join(DIST_DIR, 'baileysManager.js')).href);
      BaileysManager = mod.BaileysManager;
    });

    it('should reject non-string and empty inputs with digits-only requirement', async () => {
      const bm = new BaileysManager();
      const invalidTypes = [
        null,
        undefined,
        1234567890,
        true,
        false,
        {},
        [],
        '',
        NaN
      ];

      for (const input of invalidTypes) {
        await assert.rejects(
          async () => {
            await bm.requestPairingCode(input);
          },
          (err) => {
            assert.strictEqual(err.name, 'Error');
            assert.strictEqual(
              err.message,
              'Valid phone number with country code is required (digits only)',
              `Input ${JSON.stringify(input)} produced unexpected error: ${err.message}`
            );
            return true;
          }
        );
      }
    });

    it('should reject inputs containing fewer than 8 digits after sanitization', async () => {
      const bm = new BaileysManager();
      const shortOrNonDigitInputs = [
        ' ',
        '     ',
        'abcdefghij',
        '+-()/',
        '1',
        '12',
        '123',
        '1234',
        '12345',
        '123456',
        '1234567', // 7 digits (boundary - 1)
        'abc1234',  // letters + 4 digits
        '+1 (23) 45', // symbols + 5 digits
        '-- 777 --'
      ];

      for (const input of shortOrNonDigitInputs) {
        await assert.rejects(
          async () => {
            await bm.requestPairingCode(input);
          },
          (err) => {
            assert.strictEqual(
              err.message,
              'Valid phone number with country code is required (minimum 8 digits)',
              `Input "${input}" produced unexpected error: ${err.message}`
            );
            return true;
          }
        );
      }
    });

    it('should sanitize diverse international formats to digits-only and pass to socket', async () => {
      const bm = new BaileysManager();

      // Intercept the internal socket to observe the exact cleanNumber passed to requestPairingCode
      let capturedCleanNumber = null;
      let pairingCodeCalled = false;

      bm.sock = {
        authState: { creds: { registered: false } },
        requestPairingCode: async (cleanNumber) => {
          capturedCleanNumber = cleanNumber;
          pairingCodeCalled = true;
          return '1234-5678';
        }
      };

      const testCases = [
        { raw: '12345678', expected: '12345678' }, // Exact 8-digit boundary
        { raw: '+1 (555) 234-5678', expected: '15552345678' }, // US formatted
        { raw: '+880 1712-345678', expected: '8801712345678' }, // Bangladesh formatted
        { raw: '+44 7911 123456', expected: '447911123456' }, // UK formatted
        { raw: '+91 98765-43210', expected: '919876543210' }, // India formatted
        { raw: '  0049 (0) 30 1234567  ', expected: '00490301234567' }, // Germany formatted with whitespace
        { raw: '+81-3-1234-5678', expected: '81312345678' }, // Japan formatted
        { raw: 'tel:+1-800-555-0199', expected: '18005550199' }, // URI formatted
        { raw: '999999999999999', expected: '999999999999999' } // 15-digit E.164 max
      ];

      for (const tc of testCases) {
        pairingCodeCalled = false;
        capturedCleanNumber = null;

        const code = await bm.requestPairingCode(tc.raw);
        assert.strictEqual(code, '1234-5678');
        assert.strictEqual(pairingCodeCalled, true);
        assert.strictEqual(
          capturedCleanNumber,
          tc.expected,
          `Input "${tc.raw}" sanitized to "${capturedCleanNumber}", expected "${tc.expected}"`
        );
      }
    });

    it('should reject pairing code request when WhatsApp session is already connected', async () => {
      const bm = new BaileysManager();
      bm.status = 'connected';

      await assert.rejects(
        async () => {
          await bm.requestPairingCode('15552345678');
        },
        (err) => {
          assert.strictEqual(err.message, 'WhatsApp session is already connected');
          return true;
        }
      );
    });

    it('should reject pairing code request when account is already registered', async () => {
      const bm = new BaileysManager();
      bm.sock = {
        authState: { creds: { registered: true } },
        requestPairingCode: async () => 'CODE'
      };

      await assert.rejects(
        async () => {
          await bm.requestPairingCode('15552345678');
        },
        (err) => {
          assert.strictEqual(err.message, 'Account is already registered');
          return true;
        }
      );
    });
  });

  // =========================================================================
  // 2. DISCONNECT CREDENTIAL WIPING & 500MS AUTO-RESTART LIFECYCLE
  // =========================================================================
  describe('Disconnect Credential Wiping & 500ms Auto-Restart Lifecycle', () => {
    let BaileysManager;
    let authDir;

    before(async () => {
      const mod = await import(pathToFileURL(path.join(DIST_DIR, 'baileysManager.js')).href);
      BaileysManager = mod.BaileysManager;
      const configMod = await import(pathToFileURL(path.join(DIST_DIR, 'config.js')).href);
      authDir = configMod.AUTH_DIR;
    });

    it('should completely purge AUTH_DIR credentials and recreate an empty directory', async () => {
      const bm = new BaileysManager();

      // Mock active state
      bm.status = 'connected';
      bm.userJid = '15551234567@s.whatsapp.net';
      bm.currentQrRaw = 'mock_qr_raw';
      bm.currentQrDataUrl = 'data:image/png;base64,mock';

      let logoutCalled = false;
      bm.sock = {
        logout: async () => {
          logoutCalled = true;
        }
      };

      // Populate AUTH_DIR with simulated session credential files
      if (!fs.existsSync(authDir)) {
        fs.mkdirSync(authDir, { recursive: true });
      }
      fs.writeFileSync(path.join(authDir, 'creds.json'), JSON.stringify({ noiseKey: 'test', registrationId: 123 }));
      fs.writeFileSync(path.join(authDir, 'app-state-sync-key-1.json'), 'sync_key_bytes');
      fs.mkdirSync(path.join(authDir, 'subkeys'), { recursive: true });
      fs.writeFileSync(path.join(authDir, 'subkeys', 'key-2.json'), 'subkey_bytes');

      assert.ok(fs.readdirSync(authDir).length > 0, 'AUTH_DIR must contain files prior to disconnect');

      // Execute disconnect
      await bm.disconnect();

      // Invariants Check:
      // 1. Socket was logged out
      assert.strictEqual(logoutCalled, true, 'Socket logout() must be called');
      assert.strictEqual(bm.sock, null, 'Socket reference must be nullified');

      // 2. In-memory state was reset
      const status = bm.getStatus();
      assert.strictEqual(status.status, 'disconnected');
      assert.strictEqual(status.userJid, null);
      assert.strictEqual(status.hasQr, false);
      assert.strictEqual(bm.getQrDataUrl(), null);

      // 3. AUTH_DIR was completely wiped and recreated empty
      assert.ok(fs.existsSync(authDir), 'AUTH_DIR must exist after disconnect');
      const remainingFiles = fs.readdirSync(authDir);
      assert.deepStrictEqual(
        remainingFiles,
        [],
        `AUTH_DIR must be completely empty after disconnect, found: ${JSON.stringify(remainingFiles)}`
      );
    });

    it('should survive stale logout errors gracefully without crashing or throwing', async () => {
      const bm = new BaileysManager();
      bm.sock = {
        logout: async () => {
          throw new Error('Connection closed prematurely / stale socket');
        }
      };

      // Must not throw
      await bm.disconnect();
      assert.strictEqual(bm.sock, null);
      assert.strictEqual(bm.getStatus().status, 'disconnected');
    });

    it('should trigger start() auto-restart within 500ms after disconnect', async () => {
      const bm = new BaileysManager();

      let autoRestartInvoked = false;
      bm.start = async () => {
        autoRestartInvoked = true;
      };

      await bm.disconnect();

      // Immediately after disconnect (before 500ms timer fires)
      assert.strictEqual(autoRestartInvoked, false, 'Auto-restart must not have fired immediately');

      // Wait 600ms (exceeding 500ms timer)
      await new Promise((resolve) => setTimeout(resolve, 600));

      assert.strictEqual(
        autoRestartInvoked,
        true,
        'Auto-restart start() must be triggered after 500ms timer expires'
      );
    });

    it('should handle rapid consecutive disconnect calls idempotently without race conditions', async () => {
      const bm = new BaileysManager();

      // Run 5 rapid disconnects concurrently
      await Promise.all([
        bm.disconnect(),
        bm.disconnect(),
        bm.disconnect(),
        bm.disconnect(),
        bm.disconnect()
      ]);

      const status = bm.getStatus();
      assert.strictEqual(status.status, 'disconnected');
      assert.strictEqual(status.userJid, null);
      assert.ok(fs.existsSync(authDir));
    });
  });

  // =========================================================================
  // 3. SERVER HTTP ENDPOINT VERIFICATION HARNESS
  // =========================================================================
  describe('Express Server HTTP API Endpoints', () => {
    let serverProcess = null;

    before(async () => {
      // Spawn whatsapp-engine server on isolated TEST_PORT
      serverProcess = spawn(process.execPath, [path.join(DIST_DIR, 'server.js')], {
        cwd: ENGINE_DIR,
        env: {
          ...process.env,
          PORT: String(TEST_PORT),
          NODE_ENV: 'test'
        },
        stdio: 'pipe'
      });

      // Wait until server is listening
      let listening = false;
      for (let attempt = 0; attempt < 30; attempt++) {
        try {
          const res = await fetch(`${ENGINE_BASE_URL}/`);
          if (res.ok) {
            listening = true;
            break;
          }
        } catch {
          // keep waiting
        }
        await new Promise((r) => setTimeout(r, 200));
      }

      if (!listening) {
        throw new Error(`Server failed to start on ${ENGINE_BASE_URL} within 6 seconds`);
      }
    });

    after(() => {
      if (serverProcess && serverProcess.pid) {
        try {
          spawn('taskkill', ['/pid', String(serverProcess.pid), '/f', '/t']);
        } catch {
          serverProcess.kill('SIGKILL');
        }
      }
    });

    it('GET / should return service info and catalog containing POST /api/session/pairing-code', async () => {
      const res = await fetch(`${ENGINE_BASE_URL}/`);
      assert.strictEqual(res.status, 200);
      const data = await res.json();

      assert.strictEqual(data.service, 'SuperAI Hub WhatsApp Self-Assistant Engine');
      assert.ok(Array.isArray(data.endpoints));
      assert.ok(
        data.endpoints.includes('POST /api/session/pairing-code'),
        'Endpoints catalog must explicitly include POST /api/session/pairing-code'
      );
      assert.ok(data.endpoints.includes('POST /api/session/disconnect'));
      assert.ok(data.endpoints.includes('GET /api/status'));
    });

    it('GET /api/status should return engine connection status contract', async () => {
      const res = await fetch(`${ENGINE_BASE_URL}/api/status`);
      assert.strictEqual(res.status, 200);
      const data = await res.json();

      assert.ok(typeof data.status === 'string');
      assert.ok('userJid' in data);
      assert.ok(typeof data.hasQr === 'boolean');
    });

    it('GET /api/qr should return QR code endpoint payload', async () => {
      const res = await fetch(`${ENGINE_BASE_URL}/api/qr`);
      assert.strictEqual(res.status, 200);
      const data = await res.json();

      assert.ok(typeof data.status === 'string');
      assert.ok('qrDataUrl' in data);
    });

    it('POST /api/session/start should return 200 success response', async () => {
      const res = await fetch(`${ENGINE_BASE_URL}/api/session/start`, {
        method: 'POST'
      });
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
    });

    it('POST /api/session/pairing-code should reject empty body with HTTP 400', async () => {
      const res = await fetch(`${ENGINE_BASE_URL}/api/session/pairing-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      assert.strictEqual(res.status, 400);
      const data = await res.json();
      assert.strictEqual(data.success, false);
      assert.strictEqual(data.error, 'phoneNumber is required');
    });

    it('POST /api/session/pairing-code should reject non-string phoneNumber with HTTP 400', async () => {
      const res = await fetch(`${ENGINE_BASE_URL}/api/session/pairing-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: 1234567890 })
      });
      assert.strictEqual(res.status, 400);
      const data = await res.json();
      assert.strictEqual(data.success, false);
      assert.strictEqual(data.error, 'phoneNumber is required');
    });

    it('POST /api/session/pairing-code should reject short phone number (< 8 digits) with HTTP 500', async () => {
      const res = await fetch(`${ENGINE_BASE_URL}/api/session/pairing-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: '12345' })
      });
      assert.strictEqual(res.status, 500);
      const data = await res.json();
      assert.strictEqual(data.success, false);
      assert.strictEqual(
        data.error,
        'Valid phone number with country code is required (minimum 8 digits)'
      );
    });

    it('POST /api/session/pairing-code should reject non-digit strings with HTTP 500', async () => {
      const res = await fetch(`${ENGINE_BASE_URL}/api/session/pairing-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: 'abcdefghij' })
      });
      assert.strictEqual(res.status, 500);
      const data = await res.json();
      assert.strictEqual(data.success, false);
      assert.strictEqual(
        data.error,
        'Valid phone number with country code is required (minimum 8 digits)'
      );
    });

    it('POST /api/session/pairing-code should reject whitespace-only phoneNumber with HTTP 500', async () => {
      const res = await fetch(`${ENGINE_BASE_URL}/api/session/pairing-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: '          ' })
      });
      assert.strictEqual(res.status, 500);
      const data = await res.json();
      assert.strictEqual(data.success, false);
      assert.strictEqual(
        data.error,
        'Valid phone number with country code is required (minimum 8 digits)'
      );
    });

    it('POST /api/session/pairing-code should gracefully reject request with no body or no content-type', async () => {
      const res = await fetch(`${ENGINE_BASE_URL}/api/session/pairing-code`, {
        method: 'POST'
      });
      assert.ok(res.status >= 400, `Expected HTTP status >= 400, got ${res.status}`);
    });

    it('POST /api/session/pairing-code with valid number attempts companion registration', async () => {
      const res = await fetch(`${ENGINE_BASE_URL}/api/session/pairing-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: '+1 (555) 234-5678' })
      });
      // When offline or waiting for handshake, it returns 500 with socket error or 200 with code
      assert.ok([200, 500].includes(res.status));
      const data = await res.json();
      if (res.status === 200) {
        assert.ok(data.pairingCode);
      } else {
        assert.strictEqual(data.success, false);
        assert.ok(typeof data.error === 'string');
      }
    });

    it('POST /api/session/disconnect should return 200 and wipe session', async () => {
      const res = await fetch(`${ENGINE_BASE_URL}/api/session/disconnect`, {
        method: 'POST'
      });
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.message, 'Session disconnected');
    });

    it('GET /api/qr/stream SSE should provide text/event-stream headers', async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);

      try {
        const res = await fetch(`${ENGINE_BASE_URL}/api/qr/stream`, {
          signal: controller.signal
        });
        assert.strictEqual(res.status, 200);
        assert.ok(
          res.headers.get('content-type')?.includes('text/event-stream'),
          'Content-Type must be text/event-stream'
        );
      } finally {
        clearTimeout(timeout);
        controller.abort();
      }
    });

    it('POST /api/chat/test should validate required message field', async () => {
      const res = await fetch(`${ENGINE_BASE_URL}/api/chat/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      assert.strictEqual(res.status, 400);
      const data = await res.json();
      assert.strictEqual(data.error, 'message field is required');
    });
  });

  // =========================================================================
  // 4. FRONTEND CLIENT SERVICE CONTRACT VERIFICATION (whatsappApi.ts)
  // =========================================================================
  describe('Frontend WhatsApp Client Service Contract (whatsappApi.ts)', () => {
    it('should export all required client interaction methods with resilient error handling', async () => {
      const clientFile = path.join(ROOT_DIR, 'web', 'src', 'lib', 'services', 'whatsappApi.ts');
      assert.ok(fs.existsSync(clientFile), 'whatsappApi.ts must exist');

      const content = fs.readFileSync(clientFile, 'utf-8');

      // Verify required method signatures are implemented
      assert.ok(content.includes('requestPairingCode(phoneNumber: string)'), 'Must implement requestPairingCode');
      assert.ok(content.includes('triggerDisconnect()'), 'Must implement triggerDisconnect');
      assert.ok(content.includes('triggerSessionStart()'), 'Must implement triggerSessionStart');
      assert.ok(content.includes('getStatus()'), 'Must implement getStatus');
      assert.ok(content.includes('getQr()'), 'Must implement getQr');
      assert.ok(content.includes('initStream()'), 'Must implement initStream');
      assert.ok(content.includes('closeStream()'), 'Must implement closeStream');

      // Verify endpoint targets
      assert.ok(content.includes('/api/session/pairing-code'), 'Must target /api/session/pairing-code');
      assert.ok(content.includes('/api/session/disconnect'), 'Must target /api/session/disconnect');
      assert.ok(content.includes('/api/qr/stream'), 'Must target /api/qr/stream');
      assert.ok(content.includes('/api/status'), 'Must target /api/status');
      assert.ok(content.includes('/api/qr'), 'Must target /api/qr');
    });
  });

  after(() => {
    setTimeout(() => process.exit(0), 100).unref();
  });

});
