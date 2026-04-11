import { useEffect, useCallback } from 'react';

interface UseFormAutoSaveOptions<T> {
  key: string;
  data: T;
  delay?: number; // délai en ms avant sauvegarde
  excludeFields?: string[]; // SECURITY: Fields to exclude from auto-save (e.g., passwords)
}

export function useFormAutoSave<T>({ key, data, delay = 1000, excludeFields = [] }: UseFormAutoSaveOptions<T>) {
  const saveToLocalStorage = useCallback(() => {
    try {
      // SECURITY: Filter out sensitive fields before saving
      const dataToSave = { ...data } as any;

      excludeFields.forEach(field => {
        if (field in dataToSave) {
          delete dataToSave[field];
        }
      });

      const serializedData = JSON.stringify(dataToSave);
      localStorage.setItem(key, serializedData);
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde:', error);
    }
  }, [key, data, excludeFields]);

  const loadFromLocalStorage = useCallback((): T | null => {
    try {
      const serializedData = localStorage.getItem(key);
      if (serializedData) {
        return JSON.parse(serializedData) as T;
      }
      return null;
    } catch (error) {
      console.error('❌ Erreur lors du chargement:', error);
      return null;
    }
  }, [key]);

  const clearLocalStorage = useCallback(() => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('❌ Erreur lors de la suppression:', error);
    }
  }, [key]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveToLocalStorage();
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [data, delay, saveToLocalStorage]);

  return {
    saveToLocalStorage,
    loadFromLocalStorage,
    clearLocalStorage,
  };
}
