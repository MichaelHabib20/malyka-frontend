import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import mitt from 'mitt';

type pendingRequestCountEvent = {
  pendingRequestCount: number;
};
interface PendingRequest {
  endpoint: string;
  method: string;
  data: any;
  timestamp: number;
}

interface MyDB extends DBSchema {
  offlineData: {
    key: string;
    value: any;
    indexes: { 'by-timestamp': number };
  };
  pendingRequests: {
    key: number;
    value: PendingRequest;
  };
}

class OfflineStore {
  private static instance: OfflineStore;
  private db: IDBPDatabase<MyDB> | null = null;
  private dbName = 'offlineStore';
  private version = 1;
  // private isSyncing = false;
  public pendingRequestCountEmitter = mitt<pendingRequestCountEvent>();
  private constructor() {
    this.initDB();
  }

  public static getInstance(): OfflineStore {
    if (!OfflineStore.instance) {
      OfflineStore.instance = new OfflineStore();
    }
    return OfflineStore.instance;
  }

  private async initDB() {
    try {
      this.db = await openDB<MyDB>(this.dbName, this.version, {
        upgrade(db) {
          if (!db.objectStoreNames.contains('offlineData')) {
            const offlineStore = db.createObjectStore('offlineData', { keyPath: 'id' });
            offlineStore.createIndex('by-timestamp', 'timestamp');
          }
          if (!db.objectStoreNames.contains('pendingRequests')) {
            db.createObjectStore('pendingRequests', { keyPath: 'id', autoIncrement: true });
          }
        },
      });
    } catch (error) {
      console.error('Error initializing IndexedDB:', error);
    }
  }

  // Store data locally
  public async saveData(key: string, data: any): Promise<void> {
    if (!this.db) await this.initDB();
    try {
      await this.db?.put('offlineData', {
        id: key,
        value: data,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Error saving data:', error);
      throw error;
    }
  }

  // Retrieve data from local store
  public async getData(key: string): Promise<any | null> {
    if (!this.db) await this.initDB();
    try {
      const data = await this.db?.get('offlineData', key);
      return data?.value || null;
    } catch (error) {
      console.error('Error retrieving data:', error);
      throw error;
    }
  }

  // Store pending request for later sync
  public async storePendingRequest(endpoint: string, method: string, data: any): Promise<void> {
    if (!this.db) await this.initDB();
    try {
      const plainData = { ...data };
      await this.db?.add('pendingRequests', {
        endpoint,
        method,
        data: plainData,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error storing pending request:', error);
      throw error;
    }
  }

  // Get all pending requests
  public async getPendingRequests(): Promise<Array<{ id: number } & PendingRequest>> {
    if (!this.db) await this.initDB();
    try {
      const requests = await this.db?.getAll('pendingRequests') || [];
      return requests.map((request, index) => ({
        id: index + 1, // Convert to 1-based index
        ...request
      }));
    } catch (error) {
      console.error('Error getting pending requests:', error);
      throw error;
    }
  }
  public async  getPendingRequestCount(): Promise<number> {
    if (!this.db) await this.initDB();
    try {
      const requests = await this.db?.getAll('pendingRequests') || [];
      const count = requests.length;
      this.pendingRequestCountEmitter.emit('pendingRequestCount', count); // 👈 emit update event
      return count;
    } catch (error) {
      console.error('Error counting pending requests:', error);
      throw error;
    }
  }
  // Remove a pending request after successful sync
  public async removePendingRequest(id: number): Promise<void> {
    if (!this.db) await this.initDB();
    try {
      await this.db?.delete('pendingRequests', id);
      await this.getPendingRequestCount();
    } catch (error) {
      console.error('Error removing pending request:', error);
      throw error;
    }
  }

  // Clear all pending requests (for testing or error recovery)
  public async clearPendingRequests(): Promise<void> {
    if (!this.db) await this.initDB();
    try {
      await this.db?.clear('pendingRequests');
    } catch (error) {
      console.error('Error clearing pending requests:', error);
      throw error;
    }
  }
}

export const offlineStore = OfflineStore.getInstance(); 