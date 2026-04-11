// SIPORTS 2026 - Service Worker for Web Push Notifications
// This service worker handles push notifications ONLY
// It does NOT cache any assets to prevent stale content issues

const CACHE_VERSION = 'siports-v3-20260216';

// Install event - skip waiting immediately, no caching
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker v3...');
  // Clear ALL old caches and skip waiting
  event.waitUntil(
    caches.keys().then((names) => {
      return Promise.all(names.map((name) => caches.delete(name)));
    }).then(() => self.skipWaiting())
  );
});

// Activate event - clean up ALL caches and claim clients
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker v3...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - ALWAYS go to network, never serve from cache
self.addEventListener('fetch', (event) => {
  // Let all requests go directly to the network
  // Do NOT intercept or cache anything
  return;
});

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received:', event);

  let notificationData = {
    title: 'SIPORTS 2026',
    body: 'Vous avez une nouvelle notification',
    icon: '/logo192.png',
    badge: '/badge-72x72.png',
    vibrate: [200, 100, 200],
    tag: 'siports-notification',
    requireInteraction: false,
    data: {}
  };

  // Parse push data if available
  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        ...notificationData,
        title: data.title || notificationData.title,
        body: data.body || data.message || notificationData.body,
        icon: data.icon || notificationData.icon,
        badge: data.badge || notificationData.badge,
        tag: data.tag || notificationData.tag,
        requireInteraction: data.requireInteraction || notificationData.requireInteraction,
        data: data.data || data,
        actions: data.actions || []
      };
    } catch (error) {
      console.error('[SW] Error parsing push data:', error);
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      vibrate: notificationData.vibrate,
      tag: notificationData.tag,
      requireInteraction: notificationData.requireInteraction,
      data: notificationData.data,
      actions: notificationData.actions
    })
  );
});

// Notification click event - handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event);

  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  // Handle notification action buttons
  if (event.action) {
    switch (event.action) {
      case 'view':
        // Open the relevant page
        break;
      case 'dismiss':
        // Just close, already handled above
        return;
      default:
        break;
    }
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }

        // If not, open a new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Background sync event - sync data when connection is restored
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);

  if (event.tag === 'sync-appointments') {
    event.waitUntil(syncAppointments());
  } else if (event.tag === 'sync-messages') {
    event.waitUntil(syncMessages());
  }
});

// Helper function to sync appointments
async function syncAppointments() {
  try {
    // Get pending appointment updates from IndexedDB
    // Send to server
    // Clear pending updates
    console.log('[SW] Syncing appointments...');
  } catch (error) {
    console.error('[SW] Error syncing appointments:', error);
    throw error; // Retry
  }
}

// Helper function to sync messages
async function syncMessages() {
  try {
    // Get pending messages from IndexedDB
    // Send to server
    // Clear pending messages
    console.log('[SW] Syncing messages...');
  } catch (error) {
    console.error('[SW] Error syncing messages:', error);
    throw error; // Retry
  }
}

// Message event - handle messages from the app
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then((cache) => cache.addAll(event.data.urls))
    );
  }
});

console.log('[SW] Service Worker loaded successfully');
