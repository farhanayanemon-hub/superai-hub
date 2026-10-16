/**
 * OfflineStorageService - Zero-dependency native window.indexedDB persistence wrapper.
 * Provides unbounded local storage for chat messages and base64 attachments.
 * Fully SSR-safe: all methods safely no-op when window is undefined.
 */

export interface StoredMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  sessionId?: string;
  toolMatched?: string;
  imageUrl?: string;
  status?: 'sending' | 'done' | 'error';
  provider?: string;
  [key: string]: any;
}

export interface StoredAttachment {
  id: string;
  dataUrl: string;
  timestamp: string;
  metadata?: any;
  [key: string]: any;
}

const DB_NAME = 'EzboAgentsChatDB';
const DB_VERSION = 1;

class OfflineStorageService {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private getDB(): Promise<IDBDatabase> {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return Promise.reject(new Error('IndexedDB is unavailable in SSR/current environment'));
    }

    if (this.dbPromise) {
      return this.dbPromise;
    }

    this.dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
      try {
        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
          const db = (event.target as IDBOpenDBRequest).result;

          if (!db.objectStoreNames.contains('messages')) {
            const msgStore = db.createObjectStore('messages', { keyPath: 'id' });
            msgStore.createIndex('timestamp', 'timestamp', { unique: false });
            msgStore.createIndex('sessionId', 'sessionId', { unique: false });
          }

          if (!db.objectStoreNames.contains('attachments')) {
            const attachStore = db.createObjectStore('attachments', { keyPath: 'id' });
            attachStore.createIndex('timestamp', 'timestamp', { unique: false });
          }
        };

        request.onsuccess = () => {
          const db = request.result;
          db.onversionchange = () => {
            db.close();
            this.dbPromise = null;
          };
          resolve(db);
        };

        request.onerror = () => {
          this.dbPromise = null;
          reject(request.error || new Error('Failed to open IndexedDB'));
        };
      } catch (err) {
        this.dbPromise = null;
        reject(err);
      }
    });

    return this.dbPromise;
  }

  /**
   * Save a chat message to IndexedDB.
   */
  async saveMessage(msg: any): Promise<void> {
    if (typeof window === 'undefined') return;
    if (!msg) return;

    try {
      const db = await this.getDB();
      const messageToSave: StoredMessage = {
        ...msg,
        id: msg.id || `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        sessionId: msg.sessionId || 'default',
        timestamp: msg.timestamp || new Date().toISOString()
      };

      return new Promise<void>((resolve, reject) => {
        const tx = db.transaction('messages', 'readwrite');
        const store = tx.objectStore('messages');
        const req = store.put(messageToSave);

        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
        tx.onerror = () => reject(tx.error);
      });
    } catch (err) {
      console.warn('[offlineStorage] saveMessage error:', err);
    }
  }

  /**
   * Retrieve all messages, optionally filtered by sessionId.
   */
  async getAllMessages(sessionId?: string): Promise<any[]> {
    if (typeof window === 'undefined') return [];

    try {
      const db = await this.getDB();
      return new Promise<any[]>((resolve, reject) => {
        const tx = db.transaction('messages', 'readonly');
        const store = tx.objectStore('messages');

        let req: IDBRequest<any[]>;
        if (sessionId && store.indexNames.contains('sessionId')) {
          const index = store.index('sessionId');
          req = index.getAll(IDBKeyRange.only(sessionId));
        } else {
          req = store.getAll();
        }

        req.onsuccess = () => {
          let results = req.result || [];
          if (sessionId && !store.indexNames.contains('sessionId')) {
            results = results.filter((m: any) => m.sessionId === sessionId);
          }
          // Sort in chronological order
          results.sort((a: any, b: any) => {
            const timeA = new Date(a.timestamp || 0).getTime();
            const timeB = new Date(b.timestamp || 0).getTime();
            if (isNaN(timeA) || isNaN(timeB)) return 0;
            return timeA - timeB;
          });
          resolve(results);
        };

        req.onerror = () => reject(req.error);
        tx.onerror = () => reject(tx.error);
      });
    } catch (err) {
      console.warn('[offlineStorage] getAllMessages error:', err);
      return [];
    }
  }

  /**
   * Clear messages, optionally filtered by sessionId.
   */
  async clearMessages(sessionId?: string): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      const db = await this.getDB();
      return new Promise<void>((resolve, reject) => {
        const tx = db.transaction('messages', 'readwrite');
        const store = tx.objectStore('messages');

        if (!sessionId) {
          const req = store.clear();
          req.onsuccess = () => resolve();
          req.onerror = () => reject(req.error);
        } else {
          if (store.indexNames.contains('sessionId')) {
            const index = store.index('sessionId');
            const req = index.openKeyCursor(IDBKeyRange.only(sessionId));
            req.onsuccess = () => {
              const cursor = req.result;
              if (cursor) {
                store.delete(cursor.primaryKey);
                cursor.continue();
              } else {
                resolve();
              }
            };
            req.onerror = () => reject(req.error);
          } else {
            const req = store.openCursor();
            req.onsuccess = () => {
              const cursor = req.result;
              if (cursor) {
                if (cursor.value.sessionId === sessionId) {
                  cursor.delete();
                }
                cursor.continue();
              } else {
                resolve();
              }
            };
            req.onerror = () => reject(req.error);
          }
        }

        tx.onerror = () => reject(tx.error);
      });
    } catch (err) {
      console.warn('[offlineStorage] clearMessages error:', err);
    }
  }

  /**
   * Save an attachment (base64 image, prompt metadata, etc.) to IndexedDB.
   */
  async saveAttachment(id: string, dataUrl: string, metadata?: any): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      const db = await this.getDB();
      const attachment: StoredAttachment = {
        id,
        dataUrl,
        metadata: metadata || {},
        timestamp: new Date().toISOString()
      };

      return new Promise<void>((resolve, reject) => {
        const tx = db.transaction('attachments', 'readwrite');
        const store = tx.objectStore('attachments');
        const req = store.put(attachment);

        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
        tx.onerror = () => reject(tx.error);
      });
    } catch (err) {
      console.warn('[offlineStorage] saveAttachment error:', err);
    }
  }

  /**
   * Retrieve an attachment by its id.
   */
  async getAttachment(id: string): Promise<any> {
    if (typeof window === 'undefined') return null;

    try {
      const db = await this.getDB();
      return new Promise<any>((resolve, reject) => {
        const tx = db.transaction('attachments', 'readonly');
        const store = tx.objectStore('attachments');
        const req = store.get(id);

        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
        tx.onerror = () => reject(tx.error);
      });
    } catch (err) {
      console.warn('[offlineStorage] getAttachment error:', err);
      return null;
    }
  }
}

export const offlineStorage = new OfflineStorageService();

// Standalone exported wrapper methods
export const saveMessage = (msg: any): Promise<void> => offlineStorage.saveMessage(msg);
export const getAllMessages = (sessionId?: string): Promise<any[]> => offlineStorage.getAllMessages(sessionId);
export const clearMessages = (sessionId?: string): Promise<void> => offlineStorage.clearMessages(sessionId);
export const saveAttachment = (id: string, dataUrl: string, metadata?: any): Promise<void> =>
  offlineStorage.saveAttachment(id, dataUrl, metadata);
export const getAttachment = (id: string): Promise<any> => offlineStorage.getAttachment(id);
