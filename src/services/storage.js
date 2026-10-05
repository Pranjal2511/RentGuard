// Simple browser storage helper for prototype session persistence
const memoryStore = new Map();

function isStorageAvailable() {
  try {
    const testKey = "__rentguard_test__";
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

const hasLocalStorage = typeof window !== "undefined" && isStorageAvailable();

export const storage = {
  get(key, defaultValue = null) {
    if (hasLocalStorage) {
      try {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
      } catch (err) {
        console.warn(`Error reading key "${key}" from localStorage:`, err);
        return defaultValue;
      }
    }
    return memoryStore.has(key) ? memoryStore.get(key) : defaultValue;
  },

  set(key, value) {
    if (hasLocalStorage) {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
        return;
      } catch (err) {
        console.warn(`Error writing key "${key}" to localStorage:`, err);
      }
    }
    memoryStore.set(key, value);
  },

  remove(key) {
    if (hasLocalStorage) {
      try {
        window.localStorage.removeItem(key);
        return;
      } catch (err) {
        console.warn(`Error removing key "${key}" from localStorage:`, err);
      }
    }
    memoryStore.delete(key);
  },

  clear() {
    if (hasLocalStorage) {
      try {
        window.localStorage.clear();
      } catch {
        // ignore
      }
    }
    memoryStore.clear();
  },
};
