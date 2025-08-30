
import { useState, useEffect, useCallback } from 'react';
import { SavedConversation } from '../types';

const DB_NAME = 'VoiceAssistantDB';
const CONVERSATIONS_STORE_NAME = 'conversations';
const API_KEYS_STORE_NAME = 'apiKeys';
const DB_VERSION = 2; // Version 2 includes the apiKeys store

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
      if (!db.objectStoreNames.contains(CONVERSATIONS_STORE_NAME)) {
        db.createObjectStore(CONVERSATIONS_STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains(API_KEYS_STORE_NAME)) {
        db.createObjectStore(API_KEYS_STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

export const useIndexedDB = () => {
  const [conversations, setConversations] = useState<SavedConversation[]>([]);

  const getConversations = useCallback(async () => {
    const db = await initDB();
    const transaction = db.transaction(CONVERSATIONS_STORE_NAME, 'readonly');
    const store = transaction.objectStore(CONVERSATIONS_STORE_NAME);
    const request = store.getAll();

    return new Promise<SavedConversation[]>((resolve, reject) => {
      request.onerror = (event) => {
        console.error('Failed to get conversations:', event);
        reject('Failed to get conversations');
      };
      request.onsuccess = () => {
        const result = request.result.map(c => ({
          ...c,
          userAudioUrl: c.userAudio ? URL.createObjectURL(c.userAudio) : undefined,
          assistantAudioUrl: c.assistantAudio ? URL.createObjectURL(c.assistantAudio) : undefined
        })).sort((a,b) => b.id - a.id);
        setConversations(result);
        resolve(result);
      };
    });
  }, []);

  const addConversation = async (conversation: Omit<SavedConversation, 'id' | 'userAudioUrl' | 'assistantAudioUrl'> & { userAudio?: Blob, assistantAudio?: Blob }) => {
    const db = await initDB();
    const transaction = db.transaction(CONVERSATIONS_STORE_NAME, 'readwrite');
    const store = transaction.objectStore(CONVERSATIONS_STORE_NAME);
    const request = store.add(conversation);

    return new Promise<void>((resolve, reject) => {
      request.onerror = (event) => {
        console.error('Failed to add conversation:', event);
        reject('Failed to add conversation');
      };
      request.onsuccess = () => {
        getConversations(); // Refresh list after adding
        resolve();
      };
    });
  };

  useEffect(() => {
    initDB().then(getConversations);
  }, [getConversations]);

  return { conversations, addConversation, getConversations };
};
