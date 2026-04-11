import { lazy, ComponentType } from 'react';

/**
 * A wrapper for React.lazy that handles chunk loading errors.
 * This happens when a new version of the app is deployed and the browser
 * tries to load an old chunk that no longer exists on the server.
 */
type AsyncComponent = Promise<{ default: ComponentType<any> }>;
type ComponentImporter = () => AsyncComponent;

export const lazyRetry = (componentImport: ComponentImporter) =>
  lazy(async () => {
    try {
      return await componentImport();
    } catch (error) {
      // Don't log as error to avoid confusing users, just warn
      console.warn('Chunk load failed, attempting recovery:', error);

      // SSR safety check
      if (typeof window === 'undefined') {
        throw error;
      }

      // If any error occurs during lazy load, we assume it's a deployment mismatch
      // and force a hard refresh to get the latest version of the app.
      let lastRetry: string | null = null;
      try {
        lastRetry = window.sessionStorage.getItem('last-lazy-retry');
      } catch {
        // sessionStorage may not be available in private browsing
      }
      const now = Date.now();
      const lastRetryTime = lastRetry ? parseInt(lastRetry, 10) : 0;

      // Only retry once every 5 seconds (reduced from 10)
      if (!lastRetry || isNaN(lastRetryTime) || (now - lastRetryTime) > 5000) {
        try {
          window.sessionStorage.setItem('last-lazy-retry', now.toString());
        } catch {
          // Ignore storage errors
        }
        console.warn('Deployment mismatch detected. Refreshing app...');
        
        // Unregister service workers before reloading
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.getRegistrations().then((registrations) => {
            for (const registration of registrations) {
              registration.unregister();
            }
          }).catch(() => {
            // Silently ignore service worker cleanup errors
          });
        }
        
        // Force refresh by appending a timestamp
        const url = new URL(window.location.href);
        url.searchParams.set('v', now.toString());
        window.location.replace(url.toString());
        
        // Return a promise that never resolves to keep Suspense active
        // and prevent ErrorBoundary from showing the error while reloading
        return new Promise<AsyncComponent>(() => {});
      }
      
      throw error;
    }
  });
