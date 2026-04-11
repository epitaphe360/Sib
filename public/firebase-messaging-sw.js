/**
 * FIREBASE CLOUD MESSAGING SERVICE WORKER
 * Handles background push notifications
 * 
 * This service worker:
 * - Receives messages when app is not open
 * - Shows notifications
 * - Handles notification clicks
 * - Syncs data in background
 */

// Try to load Firebase with error handling
try {
  // Use compat versions for older global firebase syntax
  importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
  importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');
} catch (error) {
  console.error('[firebase-messaging-sw] Failed to load Firebase scripts:', error);
}

// Initialize Firebase in service worker (graceful)
let messaging = null;

const firebaseConfig = {
  apiKey: 'AIzaSyDvQxZ1234567890-abcdefghijklmnop', // Will be injected
  authDomain: 'siport-2026.firebaseapp.com',
  projectId: 'siport-2026',
  storageBucket: 'siport-2026.appspot.com',
  messagingSenderId: '123456789000',
  appId: '1:123456789000:web:abcdef1234567890',
};

// Safely initialize if Firebase is available
if (typeof firebase !== 'undefined') {
  try {
    firebase.initializeApp(firebaseConfig);
    messaging = firebase.messaging();
  } catch (error) {
    console.warn('Firebase initialization in SW failed:', error);
  }
}

/**
 * Handle background messages
 */
if (messaging) {
  messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw] Received background message:', payload);

  const { notification, data } = payload;

  const notificationTitle = notification?.title || 'SIPORT 2026';
  const notificationOptions = {
    body: notification?.body || '',
    icon: notification?.icon || '/logo.png',
    badge: '/badge-icon.png',
    tag: data?.type || 'default',
    requireInteraction: false,
    actions: [
      {
        action: 'open',
        title: 'Ouvrir',
      },
    ],
    data: data || {},
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
  });
}

/**
 * Handle notification clicks
 */
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw] Notification clicked:', event.notification);

  event.notification.close();

  const data = event.notification.data || {};
  const action = data.action || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window/tab open with the target URL
      for (const client of clientList) {
        if (client.url === action && 'focus' in client) {
          return client.focus();
        }
      }

      // If not, open a new window/tab with the target URL
      if (clients.openWindow) {
        return clients.openWindow(action);
      }
    })
  );
});

/**
 * Handle notification close
 */
self.addEventListener('notificationclose', (event) => {
  console.log('[firebase-messaging-sw] Notification closed:', event.notification);
});

/**
 * Handle service worker activation
 */
self.addEventListener('activate', (event) => {
  console.log('[firebase-messaging-sw] Service worker activated');
  event.waitUntil(clients.claim());
});

/**
 * Handle service worker installation
 */
self.addEventListener('install', (event) => {
  console.log('[firebase-messaging-sw] Service worker installed');
  self.skipWaiting();
});
