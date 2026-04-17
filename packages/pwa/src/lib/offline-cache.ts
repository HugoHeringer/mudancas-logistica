import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'mudancas-pwa';
const DB_VERSION = 1;

interface CachedData {
  key: string;
  data: any;
  timestamp: number;
}

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('cache')) {
          db.createObjectStore('cache', { keyPath: 'key' });
        }
      },
    });
  }
  return dbPromise;
}

export async function cacheSet(key: string, data: any): Promise<void> {
  const db = await getDB();
  await db.put('cache', { key, data, timestamp: Date.now() });
}

export async function cacheGet<T = any>(key: string): Promise<T | null> {
  const db = await getDB();
  const entry = await db.get('cache', key) as CachedData | undefined;
  return entry ? (entry.data as T) : null;
}

export async function cacheRemove(key: string): Promise<void> {
  const db = await getDB();
  await db.delete('cache', key);
}
