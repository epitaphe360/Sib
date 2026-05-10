/**
 * usePushNotifications Hook
 *
 * Initializes Firebase Cloud Messaging and registers service worker for push notifications
 * Called on app startup to set up push notification support
 *
 * Features:
 * - Registers service worker
 * - Requests notification permission
 * - Initializes Firebase messaging
 * - Listens for foreground notifications
 * - Handles notification clicks
 */

import { useEffect, useRef } from 'react';
import { useAuthStore } from '../store/authStore';

export function usePushNotifications() {
  const isInitializedRef = useRef(false);
  const { user } = useAuthStore();

  useEffect(() => {
    // Only initialize once and only if user is authenticated
    if (isInitializedRef.current || !user) {
      return;
    }

    isInitializedRef.current = true;

    async function initializePushNotifications() {
      try {
        const { default: PushNotificationService } = await import('../services/pushNotificationService');

        // Check if browser supports push notifications
        if (!PushNotificationService.isNotificationSupported()) {
          return;
        }

        // Register service worker for handling background notifications
        try {
          if ('serviceWorker' in navigator) {
            const registration = await navigator.serviceWorker.register(
              '/firebase-messaging-sw.js',
              { scope: '/' }
            );
          }
        } catch (swError) {
          // Continue even if service worker fails - web push might still work
        }

        // Initialize Firebase Cloud Messaging
        const initialized = await PushNotificationService.initialize();

        if (initialized) {

          // Set up listener for foreground notifications
          PushNotificationService.onNotificationReceived((notification) => {

            // You can add custom handling here, such as:
            // - Showing in-app notification toast
            // - Updating app state
            // - Playing notification sound
          });
        } else {
        }
      } catch (error) {
        console.error('❌ Error initializing push notifications:', error);
        // Non-blocking error - app continues to work
      }
    }

    // Delay initialization slightly to avoid blocking app startup
    const timeoutId = setTimeout(initializePushNotifications, 500);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [user]);
}
