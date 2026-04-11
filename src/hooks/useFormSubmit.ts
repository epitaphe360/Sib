import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';

interface UseFormSubmitOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook useFormSubmit - Gestion centralisée de la soumission des formulaires
 * 
 * Fournit :
 * - Gestion du chargement
 * - Gestion des erreurs
 * - Notifications toast
 * - Appels API
 */
export const useFormSubmit = (options?: UseFormSubmitOptions) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const submit = useCallback(
    async (endpoint: string, data: any) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Erreur lors de la soumission');
        }

        const result = await response.json();
        toast.success('Formulaire envoyé avec succès !');
        options?.onSuccess?.(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Erreur inconnue');
        setError(error);
        toast.error(error.message);
        options?.onError?.(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [options]
  );

  return {
    submit,
    isLoading,
    error,
  };
};

