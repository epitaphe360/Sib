export const migratePersistedStorage = (newKey: string, legacyKey: string) => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  const currentValue = window.localStorage.getItem(newKey);
  if (currentValue !== null) {
    return;
  }

  const legacyValue = window.localStorage.getItem(legacyKey);
  if (legacyValue === null) {
    return;
  }

  window.localStorage.setItem(newKey, legacyValue);
  window.localStorage.removeItem(legacyKey);
};