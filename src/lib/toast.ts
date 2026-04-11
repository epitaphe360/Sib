/**
 * Unified Toast Wrapper
 * 
 * Ce fichier unifie l'utilisation des toasts dans l'application.
 * Utilise sonner comme système de toast principal.
 * 
 * USAGE:
 * import { toast } from '@/lib/toast';
 * toast.success('Message');
 * toast.error('Erreur');
 */

import { toast as sonnerToast } from 'sonner';

export const toast = {
  success: (message: string, options?: { id?: string; duration?: number }) => {
    return sonnerToast.success(message, {
      id: options?.id,
      duration: options?.duration || 4000,
    });
  },
  
  error: (message: string, options?: { id?: string; duration?: number }) => {
    return sonnerToast.error(message, {
      id: options?.id,
      duration: options?.duration || 5000,
    });
  },
  
  info: (message: string, options?: { id?: string; duration?: number }) => {
    return sonnerToast.info(message, {
      id: options?.id,
      duration: options?.duration || 4000,
    });
  },
  
  warning: (message: string, options?: { id?: string; duration?: number }) => {
    return sonnerToast.warning(message, {
      id: options?.id,
      duration: options?.duration || 4000,
    });
  },
  
  loading: (message: string, options?: { id?: string }) => {
    return sonnerToast.loading(message, {
      id: options?.id,
    });
  },
  
  dismiss: (toastId?: string) => {
    return sonnerToast.dismiss(toastId);
  },
  
  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ) => {
    return sonnerToast.promise(promise, messages);
  },
};

export default toast;
