/**
 * Secure Storage Module
 * Fallback from localStorage to IndexedDB when Tracking Prevention blocks access
 * Handles Edge/Safari tracking prevention gracefully
 */

const DB_NAME = 'sib-storage';
const STORE_NAME = 'keystore';

let dbInstance: IDBDatabase | null = null;

/**
 * Initialize IndexedDB
 */
async function initializeDB(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onerror = () => {
      console.error('IndexedDB initialization failed');
      reject(new Error('IndexedDB not available'));
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };
  });
}

/**
 * Set value in IndexedDB
 */
async function setInIndexedDB(key: string, value: string): Promise<void> {
  try {
    const db = await initializeDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const objectStore = transaction.objectStore(STORE_NAME);
    objectStore.put(value, key);

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (error) {
    console.warn('IndexedDB setItem failed:', error);
    throw error;
  }
}

/**
 * Get value from IndexedDB
 */
async function getFromIndexedDB(key: string): Promise<string | null> {
  try {
    const db = await initializeDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const objectStore = transaction.objectStore(STORE_NAME);
    const request = objectStore.get(key);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        resolve(request.result || null);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.warn('IndexedDB getItem failed:', error);
    return null;
  }
}

/**
 * Remove value from IndexedDB
 */
async function removeFromIndexedDB(key: string): Promise<void> {
  try {
    const db = await initializeDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const objectStore = transaction.objectStore(STORE_NAME);
    objectStore.delete(key);

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (error) {
    console.warn('IndexedDB removeItem failed:', error);
    throw error;
  }
}

/**
 * Clear all values from IndexedDB
 */
async function clearIndexedDB(): Promise<void> {
  try {
    const db = await initializeDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const objectStore = transaction.objectStore(STORE_NAME);
    objectStore.clear();

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (error) {
    console.warn('IndexedDB clear failed:', error);
    throw error;
  }
}

/**
 * Check if localStorage is available
 */
function isLocalStorageAvailable(): boolean {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch (error) {
    console.warn('⚠️ localStorage not available (Tracking Prevention or quota exceeded)');
    return false;
  }
}

/**
 * Secure Storage API - with fallback to IndexedDB
 */
export const secureStorage = {
  /**
   * Set item (localStorage first, fallback to IndexedDB)
   */
  setItem: async (key: string, value: string): Promise<void> => {
    // Try localStorage first
    if (isLocalStorageAvailable()) {
      try {
        localStorage.setItem(key, value);
        console.log(`✅ [localStorage] Set: ${key}`);
        return;
      } catch (error) {
        console.warn(`⚠️ localStorage.setItem failed for ${key}, falling back to IndexedDB`, error);
      }
    }

    // Fallback to IndexedDB
    try {
      await setInIndexedDB(key, value);
      console.log(`✅ [IndexedDB] Set: ${key}`);
    } catch (error) {
      console.error('❌ Both localStorage and IndexedDB failed:', error);
      throw error;
    }
  },

  /**
   * Get item (localStorage first, fallback to IndexedDB)
   */
  getItem: async (key: string): Promise<string | null> => {
    // Try localStorage first
    if (isLocalStorageAvailable()) {
      try {
        const value = localStorage.getItem(key);
        if (value) {
          console.log(`✅ [localStorage] Get: ${key}`);
          return value;
        }
      } catch (error) {
        console.warn(`⚠️ localStorage.getItem failed for ${key}, falling back to IndexedDB`, error);
      }
    }

    // Fallback to IndexedDB
    try {
      const value = await getFromIndexedDB(key);
      if (value) {
        console.log(`✅ [IndexedDB] Get: ${key}`);
      }
      return value;
    } catch (error) {
      console.error('❌ Both localStorage and IndexedDB failed:', error);
      return null;
    }
  },

  /**
   * Remove item (from both localStorage and IndexedDB)
   */
  removeItem: async (key: string): Promise<void> => {
    // Remove from localStorage
    if (isLocalStorageAvailable()) {
      try {
        localStorage.removeItem(key);
        console.log(`✅ [localStorage] Removed: ${key}`);
      } catch (error) {
        console.warn(`⚠️ localStorage.removeItem failed for ${key}`, error);
      }
    }

    // Remove from IndexedDB
    try {
      await removeFromIndexedDB(key);
      console.log(`✅ [IndexedDB] Removed: ${key}`);
    } catch (error) {
      console.warn(`⚠️ IndexedDB.removeItem failed for ${key}`, error);
    }
  },

  /**
   * Clear all items (from both localStorage and IndexedDB)
   */
  clear: async (): Promise<void> => {
    // Clear localStorage
    if (isLocalStorageAvailable()) {
      try {
        localStorage.clear();
        console.log('✅ [localStorage] Cleared');
      } catch (error) {
        console.warn('⚠️ localStorage.clear failed', error);
      }
    }

    // Clear IndexedDB
    try {
      await clearIndexedDB();
      console.log('✅ [IndexedDB] Cleared');
    } catch (error) {
      console.warn('⚠️ IndexedDB.clear failed', error);
    }
  },

  /**
   * Synchronously get item (for critical operations that can't be async)
   * WARNING: Only works with localStorage, IndexedDB is not synchronous
   */
  getItemSync: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn(`⚠️ localStorage.getItem failed for ${key}`, error);
      return null;
    }
  },

  /**
   * Check if storage is available
   */
  isAvailable: (): boolean => {
    return isLocalStorageAvailable();
  },
};

export default secureStorage;
