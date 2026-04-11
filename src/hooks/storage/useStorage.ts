import { useState, useCallback } from 'react';
import { StorageService } from '../../services/storage/storageService';

interface UseStorageOptions {
  bucket?: string;
  folder?: string;
  maxSizeMB?: number;
  acceptedTypes?: string[];
}

interface UseStorageReturn {
  uploadFile: (file: File) => Promise<string>;
  uploadFiles: (files: File[]) => Promise<string[]>;
  deleteFile: (url: string) => Promise<boolean>;
  listFiles: () => Promise<{name: string; url: string; size: number; createdAt: string}[]>;
  loading: boolean;
  error: string | null;
  progress: number;
  clearError: () => void;
}

/**
 * Hook personnalisé pour faciliter l'utilisation du service de stockage dans les composants
 */
export const useStorage = (options: UseStorageOptions = {}): UseStorageReturn => {
  const {
    bucket = 'images',
    folder = '',
    maxSizeMB = 5,
    acceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const validateFile = useCallback((file: File): boolean => {
    // Vérifier la taille
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setError(`Le fichier "${file.name}" dépasse la taille maximale de ${maxSizeMB}MB`);
      return false;
    }

    // Vérifier le type
    if (acceptedTypes.length > 0 && !acceptedTypes.includes(file.type)) {
      setError(`Le type de fichier "${file.type}" n'est pas accepté. Types acceptés: ${acceptedTypes.join(', ')}`);
      return false;
    }

    return true;
  }, [maxSizeMB, acceptedTypes]);

  const uploadFile = useCallback(async (file: File): Promise<string> => {
    if (!validateFile(file)) {
      return Promise.reject(new Error('Validation du fichier échouée'));
    }

    setLoading(true);
    setError(null);
    setProgress(0);

    try {
      // Note: Les buckets sont créés via les migrations SQL

      // Simuler la progression par incréments fixes
      const interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + 10;
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 300);

      // Télécharger le fichier
      const url = await StorageService.uploadImage(file, bucket, folder);

      // Progression complète
      clearInterval(interval);
      setProgress(100);

      return url;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err) || 'Erreur lors du téléchargement du fichier';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
      // Réinitialiser la progression après un délai
      setTimeout(() => {
        setProgress(0);
      }, 1000);
    }
  }, [bucket, folder, validateFile]);

  const uploadFiles = useCallback(async (files: File[]): Promise<string[]> => {
    // Valider tous les fichiers d'abord
    const validFiles = files.filter(validateFile);

    if (validFiles.length !== files.length) {
      return Promise.reject(new Error('Certains fichiers n\'ont pas passé la validation'));
    }

    setLoading(true);
    setError(null);
    setProgress(0);

    try {
      // Note: Les buckets sont créés via les migrations SQL

      // Télécharger les fichiers avec progression
      const totalFiles = validFiles.length;
      let completedFiles = 0;

      const updateProgress = () => {
        completedFiles++;
        setProgress(Math.round((completedFiles / totalFiles) * 100));
      };

      const uploadPromises = validFiles.map(async (file) => {
        const url = await StorageService.uploadImage(file, bucket, folder);
        updateProgress();
        return url;
      });

      return Promise.all(uploadPromises);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err) || 'Erreur lors du téléchargement des fichiers';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
      // Réinitialiser la progression après un délai
      setTimeout(() => {
        setProgress(0);
      }, 1000);
    }
  }, [bucket, folder, validateFile]);

  const deleteFile = useCallback(async (url: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      // Extract file path from URL for deletion
      const urlParts = url.split('/');
      const filePath = urlParts.slice(-2).join('/'); // Get folder/filename or just filename
      await StorageService.deleteFile(filePath, bucket);
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err) || 'Erreur lors de la suppression du fichier';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [bucket]);

  const listFiles = useCallback(async (): Promise<{name: string; url: string; size: number; createdAt: string}[]> => {
    setLoading(true);
    setError(null);

    try {
      const files = await StorageService.listFiles(bucket, folder);
      return files;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err) || 'Erreur lors de la récupération des fichiers';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [bucket, folder]);

  return {
    uploadFile,
    uploadFiles,
    deleteFile,
    listFiles,
    loading,
    error,
    progress,
    clearError
  };
};

export default useStorage;

