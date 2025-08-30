import { ApiKeys } from '../types';

const DB_NAME = 'VoiceAssistantDB';
const STORE_NAME = 'apiKeys';
const DB_VERSION = 2; // Increment version to trigger onupgradeneeded

let db: IDBDatabase | null = null;

const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) {
      return resolve(db);
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('IndexedDB error:', event);
      reject('IndexedDB error');
    };

    request.onsuccess = (event) => {
      db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

export const saveApiKeys = async (keys: ApiKeys): Promise<void> => {
  const db = await initDB();
  const transaction = db.transaction(STORE_NAME, 'readwrite');
  const store = transaction.objectStore(STORE_NAME);
  // Use a fixed key 'userApiKeys' to always update the same record.
  store.put({ ...keys, id: 'userApiKeys' });

  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => {
      resolve();
    };
    transaction.onerror = (event) => {
      console.error('Failed to save API keys:', event);
      reject('Failed to save API keys');
    };
  });
};

export const getApiKeys = async (): Promise<ApiKeys | null> => {
  const db = await initDB();
  const transaction = db.transaction(STORE_NAME, 'readonly');
  const store = transaction.objectStore(STORE_NAME);
  const request = store.get('userApiKeys');

  return new Promise((resolve, reject) => {
    request.onerror = (event) => {
      console.error('Failed to get API keys:', event);
      reject('Failed to get API keys');
    };
    request.onsuccess = () => {
      resolve(request.result as ApiKeys | null);
    };
  });
};
