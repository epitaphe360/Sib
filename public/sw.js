// SIB 2026 — Unified Service Worker: Offline Caching + Push Notifications
// CDC requirement: PWA / mode offline réel
// Strategy: Cache-First for static assets, Network-First for API data

const CACHE_NAME = 'sib2026-v1';
const API_CACHE_NAME = 'sib2026-api-v1';

// Static assets to pre-cache
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
];

// Patterns that bypass caching entirely (auth / payment)
const BYPASS_PATTERNS = [
  /supabase\.co\/auth/,
  /paypal\.com/,
  /api-m\./,
];

// API patterns to cache with network-first strategy
const API_CACHE_PATTERNS = [
  /\/rest\/v1\/exhibitors/,
  /\/rest\/v1\/events/,
  /\/rest\/v1\/pavilions/,
  /\/rest\/v1\/articles/,
  /\/rest\/v1\/speakers/,
  /\/rest\/v1\/partners/,
];

// ─── Install ──────────────────────────────────────────────────────────────────

self.addEventListener('install', (event) => {
  console.log('[SW] SIB 2026 service worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Pre-cache partial failure:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// ─── Activate ────────────────────────────────────────────────────────────────

self.addEventListener('activate', (event) => {
  console.log('[SW] SIB 2026 service worker activating...');
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((n) => n !== CACHE_NAME && n !== API_CACHE_NAME)
          .map((n) => {
            console.log('[SW] Removing old cache:', n);
            return caches.delete(n);
          })
      )
    ).then(() => self.clients.claim())
  );
});

// ─── Fetch ────────────────────────────────────────────────────────────────────

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;
  if (!['http:', 'https:'].includes(url.protocol)) return;
  if (BYPASS_PATTERNS.some((re) => re.test(request.url))) return;

  // API data: network-first, short stale fallback
  if (API_CACHE_PATTERNS.some((re) => re.test(request.url))) {
    event.respondWith(networkFirstWithCache(request, API_CACHE_NAME));
    return;
  }

  // Static assets: cache-first
  if (url.pathname.match(/\.(js|css|woff2?|ttf|eot|png|jpg|jpeg|svg|ico|webp|gif)$/)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // HTML navigation: network-first, offline shell fallback
  if (request.mode === 'navigate') {
    event.respondWith(navigationHandler(request));
  }
});

// ─── Caching Strategies ───────────────────────────────────────────────────────

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Offline — resource not cached', { status: 503 });
  }
}

async function networkFirstWithCache(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const headers = new Headers(response.headers);
      headers.set('sw-cached-at', Date.now().toString());
      const cache = await caches.open(cacheName);
      const stored = new Response(await response.clone().arrayBuffer(), {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
      cache.put(request, stored);
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) {
      console.log('[SW] Serving stale API cache for:', request.url);
      return cached;
    }
    return new Response(JSON.stringify({ error: 'offline' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

async function navigationHandler(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request) || await caches.match('/');
    if (cached) return cached;
    return new Response(
      `<!doctype html><html lang="fr"><head><meta charset="utf-8">
      <meta name="viewport" content="width=device-width">
      <title>SIB 2026 - Hors ligne</title>
      <style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f8fafc}
      .box{text-align:center;padding:2rem;max-width:380px}h1{color:#1e40af}p{color:#6b7280}</style>
      </head><body><div class="box">
      <h1>SIB 2026</h1><p>Mode hors ligne – vérifiez votre connexion internet.</p>
      <button onclick="location.reload()" style="margin-top:1rem;padding:.75rem 1.5rem;background:#1e40af;color:white;border:none;border-radius:.5rem;cursor:pointer">
      Réessayer</button></div></body></html>`,
      { status: 200, headers: { 'Content-Type': 'text/html;charset=utf-8' } }
    );
  }
}



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
