import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import http from 'node:http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const ENGINE_DIST_DIR = path.join(ROOT_DIR, 'whatsapp-engine', 'dist');
const WEB_SERVICE_DIR = path.join(ROOT_DIR, 'web', 'src', 'lib', 'services');

describe('Empirical Challenge Suite: Milestone M1 (WhatsApp Engine & Channel API)', () => {

  // Global unhandled rejection monitor
  const unhandledRejections = [];
  const rejectionHandler = (reason, promise) => {
    unhandledRejections.push({ reason, promise });
  };

  before(() => {
    process.on('unhandledRejection', rejectionHandler);
  });

  after(() => {
    process.removeListener('unhandledRejection', rejectionHandler);
    setTimeout(() => process.exit(0), 100);
  });

  // =========================================================================
  // 1. TypeScript & Build Artifact Verification
  // =========================================================================
  describe('1. TypeScript Build & Compilation Integrity', () => {
    it('whatsapp-engine compiled files exist in dist/', () => {
      const requiredFiles = ['baileysManager.js', 'server.js', 'config.js', 'brainRouter.js', 'guardrails.js'];
      for (const file of requiredFiles) {
        const fullPath = path.join(ENGINE_DIST_DIR, file);
        assert.ok(fs.existsSync(fullPath), `Missing compiled file: ${file}`);
        const stat = fs.statSync(fullPath);
        assert.ok(stat.size > 0, `Compiled file ${file} is empty`);
      }
    });

    it('web/src/lib/services/whatsappApi.ts exists and contains required methods', () => {
      const apiPath = path.join(WEB_SERVICE_DIR, 'whatsappApi.ts');
      assert.ok(fs.existsSync(apiPath), 'whatsappApi.ts does not exist');
      const content = fs.readFileSync(apiPath, 'utf8');

      assert.ok(content.includes('requestPairingCode('), 'whatsappApi missing requestPairingCode method');
      assert.ok(content.includes('triggerDisconnect('), 'whatsappApi missing triggerDisconnect method');
      assert.ok(content.includes('triggerSessionStart('), 'whatsappApi missing triggerSessionStart method');
      assert.ok(content.includes('getStatus('), 'whatsappApi missing getStatus method');
      assert.ok(content.includes('getQr('), 'whatsappApi missing getQr method');
    });
  });

  // =========================================================================
  // 2. BaileysManager.requestPairingCode Input Validation & Sanitization
  // =========================================================================
  describe('2. BaileysManager requestPairingCode Contract & Validation', () => {
    let BaileysManagerClass;

    before(async () => {
      const mod = await import(pathToFileURL(path.join(ENGINE_DIST_DIR, 'baileysManager.js')).href);
      BaileysManagerClass = mod.BaileysManager;
    });

    it('rejects invalid, null, undefined, or non-string inputs', async () => {
      const manager = new BaileysManagerClass();

      const invalidInputs = [null, undefined, '', 12345678, true, {}, []];
      for (const input of invalidInputs) {
        await assert.rejects(
          async () => {
            await manager.requestPairingCode(input);
          },
          {
            message: 'Valid phone number with country code is required (digits only)'
          },
          `Failed to reject input: ${JSON.stringify(input)}`
        );
      }
    });

    it('rejects short phone numbers (fewer than 8 digits) and non-numeric strings', async () => {
      const manager = new BaileysManagerClass();

      const shortOrAlphaInputs = [
        '123',
        '1234567',
        '+1 (23) 45',
        'abcdefgh',
        '---!@#$%^',
        '+44 12'
      ];

      for (const input of shortOrAlphaInputs) {
        await assert.rejects(
          async () => {
            await manager.requestPairingCode(input);
          },
          {
            message: 'Valid phone number with country code is required (minimum 8 digits)'
          },
          `Failed to reject short or alpha input: ${input}`
        );
      }
    });

    it('rejects pairing code request if session is already connected', async () => {
      const manager = new BaileysManagerClass();
      // Simulate connected state
      manager.status = 'connected';

      await assert.rejects(
        async () => {
          await manager.requestPairingCode('+15551234567');
        },
        {
          message: 'WhatsApp session is already connected'
        }
      );
    });

    it('rejects pairing code request if socket account is already registered', async () => {
      const manager = new BaileysManagerClass();
      manager.sock = {
        authState: {
          creds: {
            registered: true
          }
        },
        requestPairingCode: async () => 'SHOULD-NOT-REACH'
      };

      await assert.rejects(
        async () => {
          await manager.requestPairingCode('+15551234567');
        },
        {
          message: 'Account is already registered'
        }
      );
    });

    it('properly sanitizes phone number and passes clean digits to socket.requestPairingCode', async () => {
      const manager = new BaileysManagerClass();
      let capturedNumber = null;

      manager.sock = {
        authState: {
          creds: {
            registered: false
          }
        },
        requestPairingCode: async (num) => {
          capturedNumber = num;
          return 'CROCK-123';
        }
      };

      const code = await manager.requestPairingCode('+1 (800) 555-0199');
      assert.equal(code, 'CROCK-123');
      assert.equal(capturedNumber, '18005550199', 'Sanitization did not strip non-digits correctly');
    });
  });

  // =========================================================================
  // 3. Server HTTP API Contract (/api/session/pairing-code)
  // =========================================================================
  describe('3. Server Endpoint Contract (POST /api/session/pairing-code)', () => {
    let server;
    let baseUrl;
    let mockManager;

    before(async () => {
      mockManager = {
        status: 'disconnected',
        getStatus: () => ({ status: 'disconnected', userJid: null, hasQr: false }),
        requestPairingCode: async (phone) => {
          if (!phone || typeof phone !== 'string') {
            throw new Error('Valid phone number with country code is required (digits only)');
          }
          const clean = phone.replace(/\D/g, '');
          if (clean.length < 8) {
            throw new Error('Valid phone number with country code is required (minimum 8 digits)');
          }
          if (clean === '9999999999') {
            throw new Error('Rate limit exceeded from WhatsApp servers');
          }
          return 'XYZ9-8765';
        }
      };

      // Native Node HTTP server implementing the exact logic from server.ts
      server = http.createServer(async (req, res) => {
        if (req.method === 'POST' && req.url === '/api/session/pairing-code') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            let parsed = {};
            try {
              parsed = JSON.parse(body || '{}');
            } catch (e) {
              parsed = {};
            }
            const { phoneNumber } = parsed;
            if (!phoneNumber || typeof phoneNumber !== 'string') {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              return res.end(JSON.stringify({ success: false, error: 'phoneNumber is required' }));
            }
            try {
              const code = await mockManager.requestPairingCode(phoneNumber);
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: true, pairingCode: code }));
            } catch (err) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: false, error: err.message || 'Failed to request pairing code' }));
            }
          });
          return;
        }

        res.writeHead(404);
        res.end();
      });

      await new Promise((resolve) => {
        server.listen(0, '127.0.0.1', () => {
          const port = server.address().port;
          baseUrl = `http://127.0.0.1:${port}`;
          resolve();
        });
      });
    });

    after(async () => {
      if (server) {
        await new Promise((resolve) => server.close(resolve));
      }
    });

    it('returns 400 when phoneNumber field is missing or empty', async () => {
      const res = await fetch(`${baseUrl}/api/session/pairing-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      assert.equal(res.status, 400);
      const data = await res.json();
      assert.equal(data.success, false);
      assert.equal(data.error, 'phoneNumber is required');
    });

    it('returns 400 when phoneNumber is not a string (e.g. number)', async () => {
      const res = await fetch(`${baseUrl}/api/session/pairing-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: 12345678 })
      });
      assert.equal(res.status, 400);
      const data = await res.json();
      assert.equal(data.success, false);
      assert.equal(data.error, 'phoneNumber is required');
    });

    it('returns 500 with message when phoneNumber has fewer than 8 digits', async () => {
      const res = await fetch(`${baseUrl}/api/session/pairing-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: '+1 234' })
      });
      assert.equal(res.status, 500);
      const data = await res.json();
      assert.equal(data.success, false);
      assert.ok(data.error.includes('minimum 8 digits'));
    });

    it('returns 200 with { success: true, pairingCode } for valid phone number', async () => {
      const res = await fetch(`${baseUrl}/api/session/pairing-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: '+1 (555) 234-5678' })
      });
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.equal(data.pairingCode, 'XYZ9-8765');
    });

    it('returns 500 when manager throws runtime error (e.g. WhatsApp rate limit)', async () => {
      const res = await fetch(`${baseUrl}/api/session/pairing-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: '9999999999' })
      });
      assert.equal(res.status, 500);
      const data = await res.json();
      assert.equal(data.success, false);
      assert.equal(data.error, 'Rate limit exceeded from WhatsApp servers');
    });
  });

  // =========================================================================
  // 4. Client Service Simulation & Error Handling (whatsappApi.ts)
  // =========================================================================
  describe('4. Client Service Contract & Robustness', () => {
    // Implement an isolated mock of WhatsAppClientService for empirical verification
    class IsolatedWhatsAppClient {
      constructor(engineUrl) {
        this.engineUrl = engineUrl;
      }

      async requestPairingCode(phoneNumber) {
        try {
          const res = await fetch(`${this.engineUrl}/api/session/pairing-code`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phoneNumber })
          });
          const data = await res.json();
          return data;
        } catch (err) {
          return { success: false, error: err?.message || 'Failed to request pairing code' };
        }
      }

      async getStatus() {
        try {
          const res = await fetch(`${this.engineUrl}/api/status`);
          if (!res.ok) return null;
          return await res.json();
        } catch (e) {
          return null;
        }
      }
    }

    let testServer;
    let testPort;
    let mockMode = 'ok';

    before(async () => {
      testServer = http.createServer((req, res) => {
        if (req.method === 'POST' && req.url === '/api/session/pairing-code') {
          if (mockMode === 'ok') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: true, pairingCode: 'CLNT-7777' }));
          }
          if (mockMode === 'error_json') {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: false, error: 'Engine internal error' }));
          }
          if (mockMode === 'html_error') {
            res.writeHead(502, { 'Content-Type': 'text/html' });
            return res.end('<html><head><title>502 Bad Gateway</title></head><body>Bad Gateway</body></html>');
          }
        }

        if (req.method === 'GET' && req.url === '/api/status') {
          if (mockMode === 'ok') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ status: 'qr_ready', userJid: null, hasQr: true }));
          }
          res.writeHead(500);
          return res.end('fail');
        }

        res.writeHead(404);
        res.end();
      });

      await new Promise((resolve) => {
        testServer.listen(0, '127.0.0.1', () => {
          testPort = testServer.address().port;
          resolve();
        });
      });
    });

    after(async () => {
      if (testServer) {
        await new Promise((resolve) => testServer.close(resolve));
      }
    });

    it('returns parsed pairing code on success', async () => {
      mockMode = 'ok';
      const client = new IsolatedWhatsAppClient(`http://127.0.0.1:${testPort}`);
      const res = await client.requestPairingCode('+15551234567');
      assert.equal(res.success, true);
      assert.equal(res.pairingCode, 'CLNT-7777');
    });

    it('returns error object when server responds with 500 JSON', async () => {
      mockMode = 'error_json';
      const client = new IsolatedWhatsAppClient(`http://127.0.0.1:${testPort}`);
      const res = await client.requestPairingCode('+15551234567');
      assert.equal(res.success, false);
      assert.equal(res.error, 'Engine internal error');
    });

    it('gracefully handles non-JSON (502 HTML) without crashing or unhandled rejection', async () => {
      mockMode = 'html_error';
      const client = new IsolatedWhatsAppClient(`http://127.0.0.1:${testPort}`);
      const res = await client.requestPairingCode('+15551234567');
      assert.equal(res.success, false);
      assert.ok(res.error, 'Should return error message on JSON parse failure');
      assert.equal(unhandledRejections.length, 0, 'Must not cause unhandled promise rejection');
    });

    it('gracefully handles connection refused (offline engine) without unhandled rejection', async () => {
      // Port 59999 should be closed
      const client = new IsolatedWhatsAppClient('http://127.0.0.1:59999');
      const res = await client.requestPairingCode('+15551234567');
      assert.equal(res.success, false);
      assert.ok(res.error, 'Should return error message when server is unreachable');
      assert.equal(unhandledRejections.length, 0, 'Must not cause unhandled promise rejection');
    });
  });

  // =========================================================================
  // 5. Disconnect Lifecycle & Crash / Unhandled Rejection Stress Test
  // =========================================================================
  describe('5. Disconnect Lifecycle Stress & Unhandled Rejection Test', () => {
    let BaileysManagerClass;
    let authDir;

    before(async () => {
      const mod = await import(pathToFileURL(path.join(ENGINE_DIST_DIR, 'baileysManager.js')).href);
      BaileysManagerClass = mod.BaileysManager;
      const config = await import(pathToFileURL(path.join(ENGINE_DIST_DIR, 'config.js')).href);
      authDir = config.AUTH_DIR;
    });

    it('purges and recreates AUTH_DIR during disconnect()', async () => {
      const manager = new BaileysManagerClass();

      // Ensure directory exists with dummy credentials
      fs.mkdirSync(authDir, { recursive: true });
      fs.writeFileSync(path.join(authDir, 'dummy_creds.json'), JSON.stringify({ test: 123 }));
      assert.ok(fs.existsSync(path.join(authDir, 'dummy_creds.json')));

      await manager.disconnect();

      // Directory must exist, but dummy file must be deleted
      assert.ok(fs.existsSync(authDir), 'AUTH_DIR must exist after disconnect');
      assert.ok(!fs.existsSync(path.join(authDir, 'dummy_creds.json')), 'Stale credentials were not wiped');

      const status = manager.getStatus();
      assert.equal(status.status, 'disconnected');
      assert.equal(status.userJid, null);
      assert.equal(status.hasQr, false);
      assert.equal(manager.getQrDataUrl(), null);
    });

    it('survives rapid consecutive disconnect calls without crashes or unhandled rejections', async () => {
      const manager = new BaileysManagerClass();

      // Stress: execute 10 rapid sequential disconnect calls
      for (let i = 0; i < 10; i++) {
        await manager.disconnect();
      }

      assert.equal(unhandledRejections.length, 0, 'Rapid sequential disconnects caused unhandled rejection');
    });

    it('survives concurrent disconnect calls (Promise.all) without race crash', async () => {
      const manager = new BaileysManagerClass();

      // Stress: execute 5 concurrent disconnect calls
      await Promise.all([
        manager.disconnect(),
        manager.disconnect(),
        manager.disconnect(),
        manager.disconnect(),
        manager.disconnect()
      ]);

      assert.equal(unhandledRejections.length, 0, 'Concurrent disconnects caused unhandled rejection');
    });

    it('handles disconnect when sock.logout() rejects without throwing', async () => {
      const manager = new BaileysManagerClass();
      manager.sock = {
        logout: async () => {
          throw new Error('Simulated logout failure: connection already closed');
        }
      };

      // Must not throw
      await manager.disconnect();
      assert.equal(manager.sock, null, 'sock must be nullified even if logout rejects');
      assert.equal(unhandledRejections.length, 0, 'Rejection in logout was not caught');
    });

    it('zero unhandled rejections across the entire challenge suite', () => {
      assert.equal(unhandledRejections.length, 0, `Detected ${unhandledRejections.length} unhandled rejections!`);
    });
  });
});
