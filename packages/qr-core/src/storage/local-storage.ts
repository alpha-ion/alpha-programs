/**
 * Local Storage Provider
 * 
 * Implements storage using IndexedDB with localStorage fallback.
 */

import type {
  QRCodeRecord,
  QRListOptions,
  QRStorageProvider,
} from '@repo/qr-types';

// ============================================================================
// IndexedDB Provider
// ============================================================================

const DB_NAME = 'qr-generator-db';
const DB_VERSION = 1;
const STORE_NAME = 'qr-codes';

export class IndexedDBProvider implements QRStorageProvider {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  private async init(): Promise<void> {
    if (this.db) return;
    
    if (this.initPromise) {
      await this.initPromise;
      return;
    }

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('createdAt', 'createdAt', { unique: false });
          store.createIndex('contentType', 'contentType', { unique: false });
          store.createIndex('favorite', 'metadata.favorite', { unique: false });
        }
      };
    });

    await this.initPromise;
  }

  async save(record: QRCodeRecord): Promise<void> {
    await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(record);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async get(id: string): Promise<QRCodeRecord | null> {
    await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  async list(options: QRListOptions = {}): Promise<QRCodeRecord[]> {
    await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        let results = request.result || [];

        // Filter by content type
        if (options.contentType) {
          results = results.filter(r => r.contentType === options.contentType);
        }

        // Filter by favorite
        if (options.favorite !== undefined) {
          results = results.filter(r => r.metadata.favorite === options.favorite);
        }

        // Filter by tags
        if (options.tags && options.tags.length > 0) {
          results = results.filter(r => 
            r.metadata.tags?.some((tag: string) => options.tags!.includes(tag))
          );
        }

        // Sort
        const sortBy = options.sortBy || 'createdAt';
        const sortOrder = options.sortOrder || 'desc';
        
        results.sort((a, b) => {
          const aVal = sortBy === 'name' ? a.metadata.name || '' : a[sortBy];
          const bVal = sortBy === 'name' ? b.metadata.name || '' : b[sortBy];
          
          if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
          if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
          return 0;
        });

        // Pagination
        const offset = options.offset || 0;
        const limit = options.limit;
        
        if (limit) {
          results = results.slice(offset, offset + limit);
        } else if (offset) {
          results = results.slice(offset);
        }

        resolve(results);
      };
    });
  }

  async update(id: string, updates: Partial<QRCodeRecord>): Promise<void> {
    const existing = await this.get(id);
    if (!existing) {
      throw new Error(`Record ${id} not found`);
    }

    const updated: QRCodeRecord = {
      ...existing,
      ...updates,
      id: existing.id, // Preserve ID
      updatedAt: Date.now(),
    };

    await this.save(updated);
  }

  async delete(id: string): Promise<void> {
    await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async clear(): Promise<void> {
    await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async export(): Promise<QRCodeRecord[]> {
    return this.list();
  }

  async import(records: QRCodeRecord[]): Promise<void> {
    for (const record of records) {
      await this.save(record);
    }
  }

  async getStats(): Promise<{
    count: number;
    size: number;
    oldestRecord?: number;
    newestRecord?: number;
  }> {
    const all = await this.list();
    
    const timestamps = all.map(r => r.createdAt).sort((a, b) => a - b);
    const size = JSON.stringify(all).length;

    return {
      count: all.length,
      size,
      oldestRecord: timestamps[0],
      newestRecord: timestamps[timestamps.length - 1],
    };
  }
}

// ============================================================================
// LocalStorage Provider (Fallback)
// ============================================================================

const LS_KEY = 'qr-generator-records';

export class LocalStorageProvider implements QRStorageProvider {
  private async getAll(): Promise<QRCodeRecord[]> {
    try {
      const data = localStorage.getItem(LS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private async saveAll(records: QRCodeRecord[]): Promise<void> {
    localStorage.setItem(LS_KEY, JSON.stringify(records));
  }

  async save(record: QRCodeRecord): Promise<void> {
    const all = await this.getAll();
    const index = all.findIndex(r => r.id === record.id);
    
    if (index >= 0) {
      all[index] = record;
    } else {
      all.push(record);
    }
    
    await this.saveAll(all);
  }

  async get(id: string): Promise<QRCodeRecord | null> {
    const all = await this.getAll();
    return all.find(r => r.id === id) || null;
  }

  async list(options: QRListOptions = {}): Promise<QRCodeRecord[]> {
    let results = await this.getAll();

    // Apply filters (same as IndexedDB)
    if (options.contentType) {
      results = results.filter(r => r.contentType === options.contentType);
    }

    if (options.favorite !== undefined) {
      results = results.filter(r => r.metadata.favorite === options.favorite);
    }

    if (options.tags && options.tags.length > 0) {
      results = results.filter(r => 
        r.metadata.tags?.some((tag: string) => options.tags!.includes(tag))
      );
    }

    // Sort
    const sortBy = options.sortBy || 'createdAt';
    const sortOrder = options.sortOrder || 'desc';
    
    results.sort((a, b) => {
      const aVal = sortBy === 'name' ? a.metadata.name || '' : a[sortBy];
      const bVal = sortBy === 'name' ? b.metadata.name || '' : b[sortBy];
      
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    // Pagination
    const offset = options.offset || 0;
    const limit = options.limit;
    
    if (limit) {
      results = results.slice(offset, offset + limit);
    } else if (offset) {
      results = results.slice(offset);
    }

    return results;
  }

  async update(id: string, updates: Partial<QRCodeRecord>): Promise<void> {
    const existing = await this.get(id);
    if (!existing) {
      throw new Error(`Record ${id} not found`);
    }

    const updated: QRCodeRecord = {
      ...existing,
      ...updates,
      id: existing.id,
      updatedAt: Date.now(),
    };

    await this.save(updated);
  }

  async delete(id: string): Promise<void> {
    const all = await this.getAll();
    const filtered = all.filter(r => r.id !== id);
    await this.saveAll(filtered);
  }

  async clear(): Promise<void> {
    localStorage.removeItem(LS_KEY);
  }

  async export(): Promise<QRCodeRecord[]> {
    return this.getAll();
  }

  async import(records: QRCodeRecord[]): Promise<void> {
    const existing = await this.getAll();
    const merged = [...existing];
    
    for (const record of records) {
      const index = merged.findIndex(r => r.id === record.id);
      if (index >= 0) {
        merged[index] = record;
      } else {
        merged.push(record);
      }
    }
    
    await this.saveAll(merged);
  }

  async getStats(): Promise<{
    count: number;
    size: number;
    oldestRecord?: number;
    newestRecord?: number;
  }> {
    const all = await this.getAll();
    const timestamps = all.map(r => r.createdAt).sort((a, b) => a - b);
    const size = JSON.stringify(all).length;

    return {
      count: all.length,
      size,
      oldestRecord: timestamps[0],
      newestRecord: timestamps[timestamps.length - 1],
    };
  }
}

// ============================================================================
// Storage Factory
// ============================================================================

export async function createStorageProvider(): Promise<QRStorageProvider> {
  // Try IndexedDB first
  if (typeof window !== 'undefined' && 'indexedDB' in window) {
    try {
      const provider = new IndexedDBProvider();
      await provider.getStats(); // Test if it works
      return provider;
    } catch (error) {
      console.warn('IndexedDB not available, falling back to localStorage', error);
    }
  }

  // Fallback to localStorage
  return new LocalStorageProvider();
}
