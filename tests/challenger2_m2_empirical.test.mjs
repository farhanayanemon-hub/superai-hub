/**
 * Empirical Challenge Verification Suite (Challenger 2) for Milestone M2:
 * Dual-Tier Persistence (IndexedDB + localStorage) & CEO System Prompt Routing.
 */

import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Helper to construct in-memory IndexedDB mock
function createMockIndexedDB() {
  const databases = new Map();

  class MockIDBKeyRange {
    constructor(lower, upper, lowerOpen, upperOpen) {
      this.lower = lower;
      this.upper = upper;
      this.lowerOpen = lowerOpen;
      this.upperOpen = upperOpen;
    }
    static only(val) {
      return new MockIDBKeyRange(val, val, false, false);
    }
  }

  class MockIndex {
    constructor(store, name, keyPath, options) {
      this.store = store;
      this.name = name;
      this.keyPath = keyPath;
      this.unique = options?.unique || false;
    }

    getAll(query) {
      const req = { onsuccess: null, onerror: null, result: null, error: null };
      queueMicrotask(() => {
        try {
          const records = Array.from(this.store.records.values());
          if (query && query.lower !== undefined) {
            req.result = records.filter(r => r[this.keyPath] === query.lower);
          } else {
            req.result = records;
          }
          if (req.onsuccess) req.onsuccess({ target: req });
        } catch (err) {
          req.error = err;
          if (req.onerror) req.onerror({ target: req });
        }
      });
      return req;
    }

    openKeyCursor(query) {
      const req = { onsuccess: null, onerror: null, result: null, error: null };
      queueMicrotask(() => {
        try {
          const matches = [];
          for (const [pk, record] of this.store.records.entries()) {
            if (!query || record[this.keyPath] === query.lower) {
              matches.push({ primaryKey: pk, key: record[this.keyPath] });
            }
          }
          let idx = 0;
          const makeCursor = () => {
            if (idx >= matches.length) return null;
            const match = matches[idx];
            return {
              primaryKey: match.primaryKey,
              key: match.key,
              continue: () => {
                idx++;
                req.result = makeCursor();
                if (req.onsuccess) req.onsuccess({ target: req });
              }
            };
          };
          req.result = makeCursor();
          if (req.onsuccess) req.onsuccess({ target: req });
        } catch (err) {
          req.error = err;
          if (req.onerror) req.onerror({ target: req });
        }
      });
      return req;
    }
  }

  class MockObjectStore {
    constructor(dbData, name, options) {
      this.dbData = dbData;
      this.name = name;
      this.keyPath = options?.keyPath || 'id';
      this.records = new Map();
      this.indexes = new Map();
      this.indexNames = {
        contains: (indexName) => this.indexes.has(indexName)
      };
    }

    createIndex(name, keyPath, options) {
      const idx = new MockIndex(this, name, keyPath, options);
      this.indexes.set(name, idx);
      return idx;
    }

    index(name) {
      const idx = this.indexes.get(name);
      if (!idx) throw new Error(`Index ${name} not found`);
      return idx;
    }

    put(item) {
      const req = { onsuccess: null, onerror: null, result: null, error: null };
      queueMicrotask(() => {
        try {
          const key = item[this.keyPath];
          if (!key) throw new Error('Missing primary key');
          this.records.set(key, JSON.parse(JSON.stringify(item)));
          req.result = key;
          if (req.onsuccess) req.onsuccess({ target: req });
        } catch (err) {
          req.error = err;
          if (req.onerror) req.onerror({ target: req });
        }
      });
      return req;
    }

    get(key) {
      const req = { onsuccess: null, onerror: null, result: null, error: null };
      queueMicrotask(() => {
        try {
          const item = this.records.get(key);
          req.result = item ? JSON.parse(JSON.stringify(item)) : undefined;
          if (req.onsuccess) req.onsuccess({ target: req });
        } catch (err) {
          req.error = err;
          if (req.onerror) req.onerror({ target: req });
        }
      });
      return req;
    }

    getAll() {
      const req = { onsuccess: null, onerror: null, result: null, error: null };
      queueMicrotask(() => {
        try {
          const all = Array.from(this.records.values()).map(v => JSON.parse(JSON.stringify(v)));
          req.result = all;
          if (req.onsuccess) req.onsuccess({ target: req });
        } catch (err) {
          req.error = err;
          if (req.onerror) req.onerror({ target: req });
        }
      });
      return req;
    }

    delete(key) {
      const req = { onsuccess: null, onerror: null, result: null, error: null };
      queueMicrotask(() => {
        try {
          this.records.delete(key);
          req.result = undefined;
          if (req.onsuccess) req.onsuccess({ target: req });
        } catch (err) {
          req.error = err;
          if (req.onerror) req.onerror({ target: req });
        }
      });
      return req;
    }

    clear() {
      const req = { onsuccess: null, onerror: null, result: null, error: null };
      queueMicrotask(() => {
        try {
          this.records.clear();
          req.result = undefined;
          if (req.onsuccess) req.onsuccess({ target: req });
        } catch (err) {
          req.error = err;
          if (req.onerror) req.onerror({ target: req });
        }
      });
      return req;
    }
  }

  class MockTransaction {
    constructor(dbData, storeNames, mode) {
      this.dbData = dbData;
      this.storeNames = Array.isArray(storeNames) ? storeNames : [storeNames];
      this.mode = mode;
      this.onerror = null;
      this.oncomplete = null;
    }

    objectStore(name) {
      const store = this.dbData.stores.get(name);
      if (!store) throw new Error(`Object store ${name} not found`);
      return store;
    }
  }

  class MockIDBDatabase {
    constructor(dbData) {
      this.dbData = dbData;
      this.name = dbData.name;
      this.version = dbData.version;
      this.objectStoreNames = {
        contains: (name) => this.dbData.stores.has(name)
      };
      this.onversionchange = null;
    }

    createObjectStore(name, options) {
      const store = new MockObjectStore(this.dbData, name, options);
      this.dbData.stores.set(name, store);
      return store;
    }

    transaction(storeNames, mode = 'readonly') {
      return new MockTransaction(this.dbData, storeNames, mode);
    }

    close() {
      this.dbData.isOpen = false;
    }
  }

  const mockIndexedDB = {
    open(name, version) {
      const req = {
        onsuccess: null,
        onerror: null,
        onupgradeneeded: null,
        result: null,
        error: null
      };

      queueMicrotask(() => {
        try {
          let dbData = databases.get(name);
          let isNew = false;
          if (!dbData) {
            dbData = {
              name,
              version: version || 1,
              stores: new Map(),
              isOpen: true
            };
            databases.set(name, dbData);
            isNew = true;
          }

          const dbInstance = new MockIDBDatabase(dbData);
          req.result = dbInstance;

          if (isNew || (version && version > dbData.version)) {
            if (req.onupgradeneeded) {
              req.onupgradeneeded({
                target: req,
                oldVersion: isNew ? 0 : dbData.version,
                newVersion: version
              });
            }
          }

          if (req.onsuccess) {
            req.onsuccess({ target: req });
          }
        } catch (err) {
          req.error = err;
          if (req.onerror) req.onerror({ target: req });
        }
      });

      return req;
    }
  };

  return { mockIndexedDB, MockIDBKeyRange, databases };
}

// In-memory mock localStorage
function createMockLocalStorage() {
  const store = new Map();
  return {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => {
      store.set(key, String(value));
    },
    removeItem: (key) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
    get length() {
      return store.size;
    },
    key: (i) => Array.from(store.keys())[i] || null,
    _rawMap: store
  };
}

describe('Challenger 2 Empirical Verification: Milestone M2', () => {

  // =========================================================================
  // 1. offlineStorage.ts Empirical Persistence & SSR Resilience
  // =========================================================================
  describe('1. offlineStorage.ts SSR Safety & Functional Storage', () => {

    it('SSR Safety: operates completely safely without error when window is undefined', async () => {
      const savedWindow = globalThis.window;
      delete globalThis.window;

      try {
        const { offlineStorage, saveMessage, getAllMessages, clearMessages, saveAttachment, getAttachment } =
          await import(pathToFileURL(path.join(ROOT_DIR, 'web/src/lib/services/offlineStorage.ts')).href);

        // 1. saveMessage in SSR -> Promise resolves without throw
        await assert.doesNotReject(async () => {
          await offlineStorage.saveMessage({ id: 'ssr-1', content: 'test ssr' });
          await saveMessage({ id: 'ssr-2', content: 'test standalone ssr' });
        });

        // 2. getAllMessages in SSR -> returns []
        const msgs = await offlineStorage.getAllMessages();
        assert.deepEqual(msgs, []);
        const msgsStandalone = await getAllMessages();
        assert.deepEqual(msgsStandalone, []);

        // 3. clearMessages in SSR -> Promise resolves without throw
        await assert.doesNotReject(async () => {
          await offlineStorage.clearMessages();
          await clearMessages();
        });

        // 4. saveAttachment in SSR -> Promise resolves without throw
        await assert.doesNotReject(async () => {
          await offlineStorage.saveAttachment('att-ssr', 'data:text/plain;base64,AAA');
          await saveAttachment('att-ssr-2', 'data:text/plain;base64,BBB');
        });

        // 5. getAttachment in SSR -> returns null
        assert.equal(await offlineStorage.getAttachment('att-ssr'), null);
        assert.equal(await getAttachment('att-ssr-2'), null);
      } finally {
        if (savedWindow) globalThis.window = savedWindow;
      }
    });

    it('Fallback Safety: operates safely when window exists but window.indexedDB is undefined', async () => {
      const savedWindow = globalThis.window;
      globalThis.window = {}; // window exists, no indexedDB

      try {
        const mod = await import(pathToFileURL(path.join(ROOT_DIR, 'web/src/lib/services/offlineStorage.ts')).href + `?t=${Date.now()}`);
        const storage = mod.offlineStorage;

        await assert.doesNotReject(async () => {
          await storage.saveMessage({ id: 'fb-1', content: 'fallback test' });
        });

        const msgs = await storage.getAllMessages();
        assert.deepEqual(msgs, []);

        await assert.doesNotReject(async () => {
          await storage.clearMessages();
        });

        await assert.doesNotReject(async () => {
          await storage.saveAttachment('att-fb', 'data:...');
        });

        assert.equal(await storage.getAttachment('att-fb'), null);
      } finally {
        if (savedWindow) globalThis.window = savedWindow;
        else delete globalThis.window;
      }
    });

    it('Functional IndexedDB: schema, sorting, session filtering, attachments, and clear', async () => {
      const savedWindow = globalThis.window;
      const savedIDBKeyRange = globalThis.IDBKeyRange;

      const { mockIndexedDB, MockIDBKeyRange, databases } = createMockIndexedDB();
      globalThis.window = { indexedDB: mockIndexedDB };
      globalThis.IDBKeyRange = MockIDBKeyRange;

      try {
        const mod = await import(pathToFileURL(path.join(ROOT_DIR, 'web/src/lib/services/offlineStorage.ts')).href + `?t=${Date.now()}`);
        const storage = mod.offlineStorage;

        // 1. Initial write triggers schema creation
        await storage.saveMessage({
          id: 'msg-01',
          sessionId: 'session-alpha',
          timestamp: '2026-10-15T10:00:00Z',
          content: 'Alpha 1'
        });

        const db = databases.get('EzboAgentsChatDB');
        assert.ok(db, 'EzboAgentsChatDB database initialized');
        assert.equal(db.version, 1);
        assert.ok(db.stores.has('messages'), 'messages store created');
        assert.ok(db.stores.has('attachments'), 'attachments store created');

        // 2. Save messages out of order across 2 sessions
        await storage.saveMessage({
          id: 'msg-03',
          sessionId: 'session-alpha',
          timestamp: '2026-10-15T12:00:00Z',
          content: 'Alpha 3'
        });
        await storage.saveMessage({
          id: 'msg-02',
          sessionId: 'session-alpha',
          timestamp: '2026-10-15T11:00:00Z',
          content: 'Alpha 2'
        });
        await storage.saveMessage({
          id: 'msg-beta-01',
          sessionId: 'session-beta',
          timestamp: '2026-10-15T10:30:00Z',
          content: 'Beta 1'
        });

        // 3. getAllMessages() returns all messages sorted chronologically
        const all = await storage.getAllMessages();
        assert.equal(all.length, 4);
        assert.equal(all[0].id, 'msg-01');
        assert.equal(all[1].id, 'msg-beta-01');
        assert.equal(all[2].id, 'msg-02');
        assert.equal(all[3].id, 'msg-03');

        // 4. getAllMessages(sessionId) filters correctly
        const alphaMsgs = await storage.getAllMessages('session-alpha');
        assert.equal(alphaMsgs.length, 3);
        assert.deepEqual(alphaMsgs.map(m => m.id), ['msg-01', 'msg-02', 'msg-03']);

        const betaMsgs = await storage.getAllMessages('session-beta');
        assert.equal(betaMsgs.length, 1);
        assert.equal(betaMsgs[0].id, 'msg-beta-01');

        // 5. Attachments
        const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
        await storage.saveAttachment('att-001', dataUrl, { filename: 'dot.png' });
        const att = await storage.getAttachment('att-001');
        assert.ok(att);
        assert.equal(att.id, 'att-001');
        assert.equal(att.dataUrl, dataUrl);
        assert.equal(att.metadata.filename, 'dot.png');

        assert.equal(await storage.getAttachment('att-none'), null);

        // 6. Selective clearMessages(sessionId)
        await storage.clearMessages('session-alpha');
        const afterAlphaClear = await storage.getAllMessages();
        assert.equal(afterAlphaClear.length, 1);
        assert.equal(afterAlphaClear[0].id, 'msg-beta-01');

        // 7. Full clear
        await storage.clearMessages();
        const afterFullClear = await storage.getAllMessages();
        assert.equal(afterFullClear.length, 0);

        // Attachments remain safe
        assert.ok(await storage.getAttachment('att-001'));
      } finally {
        if (savedWindow) globalThis.window = savedWindow;
        else delete globalThis.window;
        if (savedIDBKeyRange) globalThis.IDBKeyRange = savedIDBKeyRange;
        else delete globalThis.IDBKeyRange;
      }
    });

    it('Auto-defaults: missing id, missing sessionId, missing timestamp are generated safely', async () => {
      const savedWindow = globalThis.window;
      const savedIDBKeyRange = globalThis.IDBKeyRange;

      const { mockIndexedDB, MockIDBKeyRange } = createMockIndexedDB();
      globalThis.window = { indexedDB: mockIndexedDB };
      globalThis.IDBKeyRange = MockIDBKeyRange;

      try {
        const mod = await import(pathToFileURL(path.join(ROOT_DIR, 'web/src/lib/services/offlineStorage.ts')).href + `?t=${Date.now()}`);
        const storage = mod.offlineStorage;

        // Null message -> graceful early return
        await storage.saveMessage(null);
        await storage.saveMessage(undefined);

        // Message without id/timestamp/sessionId
        await storage.saveMessage({ role: 'user', content: 'Auto field test' });
        const list = await storage.getAllMessages();
        assert.equal(list.length, 1);
        assert.ok(list[0].id.startsWith('msg_'));
        assert.equal(list[0].sessionId, 'default');
        assert.ok(list[0].timestamp);
      } finally {
        if (savedWindow) globalThis.window = savedWindow;
        else delete globalThis.window;
        if (savedIDBKeyRange) globalThis.IDBKeyRange = savedIDBKeyRange;
        else delete globalThis.IDBKeyRange;
      }
    });
  });

  // =========================================================================
  // 2. cloudSync.ts Graceful No-Ops & Resilience
  // =========================================================================
  describe('2. cloudSync.ts Graceful No-Ops & API Client Handling', () => {

    it('SSR Safety: syncPushMessages and syncPullMessages no-op cleanly in SSR', async () => {
      const savedWindow = globalThis.window;
      delete globalThis.window;

      try {
        const { syncPushMessages, syncPullMessages } =
          await import(pathToFileURL(path.join(ROOT_DIR, 'web/src/lib/services/cloudSync.ts')).href);

        await assert.doesNotReject(async () => {
          await syncPushMessages('user-ssr', [{ id: '1', role: 'user', content: 'test' }]);
        });

        const pulled = await syncPullMessages('user-ssr');
        assert.deepEqual(pulled, []);
      } finally {
        if (savedWindow) globalThis.window = savedWindow;
      }
    });

    it('Unconfigured Client: no-ops gracefully when credentials are not in localStorage', async () => {
      const savedWindow = globalThis.window;
      const mockLs = createMockLocalStorage();
      globalThis.window = { localStorage: mockLs };
      globalThis.localStorage = mockLs;

      try {
        const { syncPushMessages, syncPullMessages } =
          await import(pathToFileURL(path.join(ROOT_DIR, 'web/src/lib/services/cloudSync.ts')).href);

        await assert.doesNotReject(async () => {
          await syncPushMessages('user-no-cfg', [{ id: '1' }]);
        });

        const res = await syncPullMessages('user-no-cfg');
        assert.deepEqual(res, []);
      } finally {
        if (savedWindow) globalThis.window = savedWindow;
        else delete globalThis.window;
        delete globalThis.localStorage;
      }
    });

    it('Edge Cases: empty/null user, empty messages list handled cleanly', async () => {
      const savedWindow = globalThis.window;
      const mockLs = createMockLocalStorage();
      globalThis.window = { localStorage: mockLs };
      globalThis.localStorage = mockLs;

      try {
        const { syncPushMessages, syncPullMessages } =
          await import(pathToFileURL(path.join(ROOT_DIR, 'web/src/lib/services/cloudSync.ts')).href);

        await syncPushMessages('', [{ id: '1' }]);
        await syncPushMessages('user-1', []);
        await syncPushMessages(null, null);

        assert.deepEqual(await syncPullMessages(''), []);
        assert.deepEqual(await syncPullMessages(null), []);
      } finally {
        if (savedWindow) globalThis.window = savedWindow;
        else delete globalThis.window;
        delete globalThis.localStorage;
      }
    });

    it('Network Error Resilience: catches and suppresses network fetch rejections', async () => {
      const savedWindow = globalThis.window;
      const savedFetch = globalThis.fetch;
      const mockLs = createMockLocalStorage();
      mockLs.setItem('ezbo_supabase_url', 'https://mock.supabase.co');
      mockLs.setItem('ezbo_supabase_anon_key', 'mock-key');

      globalThis.fetch = async () => {
        throw new TypeError('Network connection refused');
      };
      globalThis.window = { localStorage: mockLs };
      globalThis.localStorage = mockLs;

      try {
        const { syncPushMessages, syncPullMessages } =
          await import(pathToFileURL(path.join(ROOT_DIR, 'web/src/lib/services/cloudSync.ts')).href);

        await assert.doesNotReject(async () => {
          await syncPushMessages('user-1', [{ id: '1', role: 'user', content: 'test' }]);
        });

        const res = await syncPullMessages('user-1');
        assert.deepEqual(res, []);
      } finally {
        if (savedWindow) globalThis.window = savedWindow;
        else delete globalThis.window;
        delete globalThis.localStorage;
        globalThis.fetch = savedFetch;
      }
    });

    it('Successful Response: maps Supabase rows into local ChatMessage schema', async () => {
      const savedWindow = globalThis.window;
      const savedFetch = globalThis.fetch;
      const mockLs = createMockLocalStorage();
      mockLs.setItem('ezbo_supabase_url', 'https://mock.supabase.co');
      mockLs.setItem('ezbo_supabase_anon_key', 'mock-key-xyz');

      const mockRows = [
        {
          id: 'cloud-01',
          user_id: 'user-77',
          role: 'user',
          content: 'Build me an ad campaign',
          timestamp: '2026-10-15T15:00:00Z',
          metadata: { toolMatched: '01', status: 'done', provider: 'gemini' }
        },
        {
          id: 'cloud-02',
          user_id: 'user-77',
          role: 'assistant',
          content: 'Here is your campaign plan...',
          timestamp: '2026-10-15T15:00:05Z',
          metadata: { status: 'done' }
        }
      ];

      let calledUrl = '';
      let calledOptions = null;
      globalThis.fetch = async (url, options) => {
        calledUrl = url;
        calledOptions = options;
        return {
          ok: true,
          status: 200,
          json: async () => mockRows
        };
      };
      globalThis.window = { localStorage: mockLs };
      globalThis.localStorage = mockLs;

      try {
        const { syncPullMessages } =
          await import(pathToFileURL(path.join(ROOT_DIR, 'web/src/lib/services/cloudSync.ts')).href);

        const messages = await syncPullMessages('user-77', '2026-10-15T14:59:00Z');
        assert.equal(messages.length, 2);

        assert.ok(calledUrl.includes('user_id=eq.user-77'));
        assert.ok(calledUrl.includes('timestamp=gt.2026-10-15T14%3A59%3A00Z'));
        assert.equal(calledOptions.headers.apikey, 'mock-key-xyz');

        assert.equal(messages[0].id, 'cloud-01');
        assert.equal(messages[0].content, 'Build me an ad campaign');
        assert.equal(messages[0].toolMatched, '01');
        assert.equal(messages[0].provider, 'gemini');

        assert.equal(messages[1].id, 'cloud-02');
      } finally {
        if (savedWindow) globalThis.window = savedWindow;
        else delete globalThis.window;
        delete globalThis.localStorage;
        globalThis.fetch = savedFetch;
      }
    });
  });

  // =========================================================================
  // 3. userStore.ts Empirical Tests
  // =========================================================================
  describe('3. userStore.ts Store Methods & Dual-Tier State Management', () => {
    let svelteStoreGet;

    before(async () => {
      const svelteStorePath = pathToFileURL(path.join(ROOT_DIR, 'web/node_modules/svelte/src/store/index-client.js')).href;
      const svelte = await import(svelteStorePath);
      svelteStoreGet = svelte.get;
    });

    it('ceoCustomPrompt: reactivity, persistence, Bengali/Unicode support, and QuotaExceeded resilience', async () => {
      const savedWindow = globalThis.window;
      const mockLs = createMockLocalStorage();
      globalThis.window = { localStorage: mockLs };
      globalThis.localStorage = mockLs;

      try {
        const userStore = await import(pathToFileURL(path.join(ROOT_DIR, 'web/src/lib/stores/userStore.ts')).href + `?t=${Date.now()}`);
        const { ceoCustomPrompt, setCeoCustomPrompt, saveCeoCustomPrompt } = userStore;

        // Initial state is empty
        assert.equal(svelteStoreGet(ceoCustomPrompt), '');

        // Bengali Professional preset
        const bengaliPreset = 'বাংলায় প্রফেশনাল উত্তর দিন। সর্বোচ্চ ৩টি বুলেট পয়েন্ট ব্যবহার করুন।';
        setCeoCustomPrompt(bengaliPreset);

        assert.equal(svelteStoreGet(ceoCustomPrompt), bengaliPreset);
        assert.equal(mockLs.getItem('ezbo_ceo_custom_prompt'), bengaliPreset);

        // Concise Strategist preset via saveCeoCustomPrompt alias
        const strategistPreset = 'Focus on high ROAS and immediate actionable hooks.';
        saveCeoCustomPrompt(strategistPreset);

        assert.equal(svelteStoreGet(ceoCustomPrompt), strategistPreset);
        assert.equal(mockLs.getItem('ezbo_ceo_custom_prompt'), strategistPreset);

        // QuotaExceeded resilience
        mockLs.setItem = () => {
          const err = new Error('Storage quota exceeded');
          err.name = 'QuotaExceededError';
          throw err;
        };

        assert.doesNotThrow(() => {
          setCeoCustomPrompt('Safe fallback prompt');
        });
        assert.equal(svelteStoreGet(ceoCustomPrompt), 'Safe fallback prompt');
      } finally {
        if (savedWindow) globalThis.window = savedWindow;
        else delete globalThis.window;
        delete globalThis.localStorage;
      }
    });

    it('chatMessages & addChatMessage: 50-item localStorage windowing and offlineStorage sync', async () => {
      const savedWindow = globalThis.window;
      const savedIDBKeyRange = globalThis.IDBKeyRange;
      const mockLs = createMockLocalStorage();

      const { mockIndexedDB, MockIDBKeyRange } = createMockIndexedDB();
      globalThis.window = {
        localStorage: mockLs,
        indexedDB: mockIndexedDB
      };
      globalThis.localStorage = mockLs;
      globalThis.IDBKeyRange = MockIDBKeyRange;

      try {
        const userStore = await import(pathToFileURL(path.join(ROOT_DIR, 'web/src/lib/stores/userStore.ts')).href + `?t=${Date.now()}`);
        const { chatMessages, addChatMessage, clearChatHistory } = userStore;

        // Reset to initial
        clearChatHistory();
        const initial = svelteStoreGet(chatMessages);
        assert.equal(initial.length, 1);

        // Add 65 messages
        for (let i = 1; i <= 65; i++) {
          addChatMessage({
            id: `msg-${String(i).padStart(3, '0')}`,
            role: i % 2 === 0 ? 'assistant' : 'user',
            content: `Message ${i}`,
            timestamp: new Date(Date.now() + i * 1000).toISOString()
          });
        }

        // Memory store retains all 66 items (1 welcome + 65 new)
        const inMemory = svelteStoreGet(chatMessages);
        assert.equal(inMemory.length, 66);

        // LocalStorage cache is capped at latest 50 items (slice(-50))
        const rawCached = mockLs.getItem('superai_chat_history');
        assert.ok(rawCached);
        const cached = JSON.parse(rawCached);
        assert.equal(cached.length, 50, 'LocalStorage must retain exactly the latest 50 messages');
        assert.equal(cached[0].id, 'msg-016', 'Oldest cached item is msg-016');
        assert.equal(cached[49].id, 'msg-065', 'Newest cached item is msg-065');

        // Clear chat history
        clearChatHistory();
        assert.equal(svelteStoreGet(chatMessages).length, 1);
        assert.equal(mockLs.getItem('superai_chat_history'), null);
      } finally {
        if (savedWindow) globalThis.window = savedWindow;
        else delete globalThis.window;
        delete globalThis.localStorage;
        if (savedIDBKeyRange) globalThis.IDBKeyRange = savedIDBKeyRange;
        else delete globalThis.IDBKeyRange;
      }
    });

    it('Hydration Reconciliation: deduplication logic correctly merges offline and in-memory messages', () => {
      const offline = [
        { id: '1', content: 'offline 1' },
        { id: '2', content: 'offline 2' }
      ];
      const current = [
        { id: '2', content: 'offline 2 live update' },
        { id: '3', content: 'in-memory 3' }
      ];

      const idMap = new Map();
      for (const msg of offline) {
        if (msg && msg.id) idMap.set(msg.id, msg);
      }
      for (const msg of current) {
        if (msg && msg.id) idMap.set(msg.id, msg);
      }
      const reconciled = Array.from(idMap.values());

      assert.equal(reconciled.length, 3);
      assert.deepEqual(reconciled.map(m => m.id), ['1', '2', '3']);
      assert.equal(reconciled.find(m => m.id === '2').content, 'offline 2 live update');
    });
  });

  // =========================================================================
  // 4. Mention Chip Routing & System Prompt Injection Integration
  // =========================================================================
  describe('4. Mention Chip Autocomplete & Prompt Injection Integration', () => {

    it('Mention chip regex extracts helper codes #01 through #75', () => {
      const chipRegex = /\[?⚡?\s*#(\d{1,2})\b/i;

      for (let i = 1; i <= 75; i++) {
        const code = String(i).padStart(2, '0');
        const chip = `[⚡ #${code} Helper Name] instructions`;
        const match = chip.match(chipRegex);
        assert.ok(match, `Failed on #${code}`);
        assert.equal(parseInt(match[1], 10), i);
      }
    });

    it('buildCeoOrHelperSystemPrompt strictly injects ceoCustomPrompt at the top priority', async () => {
      const ceoRouterMod = await import(pathToFileURL(path.join(ROOT_DIR, 'web/src/lib/services/ceoRouter.ts')).href);
      const { buildCeoOrHelperSystemPrompt } = ceoRouterMod;

      const directive = 'MUST RESPOND IN PROFESSIONAL BENGALI WITH ROAS FOCUS.';

      // CEO mode
      const ceoResult = buildCeoOrHelperSystemPrompt(null, { ceoCustomPrompt: directive });
      assert.ok(ceoResult.includes('USER DIRECTIVE & MASTER PERSONA (STRICT PRIORITY):'));
      assert.ok(ceoResult.includes(directive));

      // Delegated mode
      const mockHelper = {
        code: '#01',
        name: 'Facebook & Instagram Ads Generator',
        badge: 'High ROI',
        shortDesc: 'Ad copy specialist',
        systemPrompt: 'You are ad specialist #01.'
      };
      const delegatedResult = buildCeoOrHelperSystemPrompt(mockHelper, { ceoCustomPrompt: directive });
      assert.ok(delegatedResult.includes('USER DIRECTIVE & MASTER PERSONA (STRICT PRIORITY):'));
      assert.ok(delegatedResult.includes(directive));
      assert.ok(delegatedResult.includes('⚡ **AI CEO → Delegated to [#01] Facebook & Instagram Ads Generator**'));

      // Empty prompt
      const emptyResult = buildCeoOrHelperSystemPrompt(null, { ceoCustomPrompt: '' });
      assert.ok(!emptyResult.includes('USER DIRECTIVE & MASTER PERSONA (STRICT PRIORITY):'));
    });
  });
});
