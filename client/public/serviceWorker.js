/* eslint-disable no-restricted-globals */

const CACHE_NAME = 'salespro-v1';
const RUNTIME_CACHE = 'salespro-runtime-v1';

// Assets to cache on install
const PRECACHE_ASSETS = [
    '/',
    '/index.html',
    '/static/js/bundle.js',
    '/static/css/main.css',
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    '/offline.html'
];

// Install event - precache assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[ServiceWorker] Precaching assets');
                return cache.addAll(PRECACHE_ASSETS);
            })
            .then(() => {
                console.log('[ServiceWorker] Skip waiting');
                return self.skipWaiting();
            })
    );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
    const currentCaches = [CACHE_NAME, RUNTIME_CACHE];

    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return cacheNames.filter(
                    (cacheName) => !currentCaches.includes(cacheName)
                );
            })
            .then((cachesToDelete) => {
                return Promise.all(
                    cachesToDelete.map((cacheToDelete) => {
                        console.log('[ServiceWorker] Deleting old cache:', cacheToDelete);
                        return caches.delete(cacheToDelete);
                    })
                );
            })
            .then(() => {
                console.log('[ServiceWorker] Claiming clients');
                return self.clients.claim();
            })
    );
});

// Network strategies
const strategies = {
    // Cache first, then network (for static assets)
    cacheFirst: async (request) => {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        try {
            const networkResponse = await fetch(request);
            if (networkResponse.ok) {
                const cache = await caches.open(RUNTIME_CACHE);
                cache.put(request, networkResponse.clone());
            }
            return networkResponse;
        } catch (error) {
            // Return offline page for navigation requests
            if (request.mode === 'navigate') {
                return caches.match('/offline.html');
            }
            throw error;
        }
    },

    // Network first, then cache (for API calls)
    networkFirst: async (request) => {
        try {
            const networkResponse = await fetch(request);
            if (networkResponse.ok) {
                const cache = await caches.open(RUNTIME_CACHE);
                cache.put(request, networkResponse.clone());
            }
            return networkResponse;
        } catch (error) {
            const cachedResponse = await caches.match(request);
            if (cachedResponse) {
                return cachedResponse;
            }
            throw error;
        }
    },

    // Network only (for real-time data)
    networkOnly: async (request) => {
        return fetch(request);
    }
};

// Fetch event - handle requests
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip cross-origin requests
    if (!url.origin.includes(self.location.origin)) {
        return;
    }

    // API calls - network first
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(strategies.networkFirst(request));
        return;
    }

    // Static assets and navigation - cache first
    if (
        request.destination === 'style' ||
        request.destination === 'script' ||
        request.destination === 'image' ||
        request.destination === 'font' ||
        request.mode === 'navigate'
    ) {
        event.respondWith(strategies.cacheFirst(request));
        return;
    }

    // Default - network first
    event.respondWith(strategies.networkFirst(request));
});

// Push notification event
self.addEventListener('push', (event) => {
    const data = event.data?.json() || {};

    const options = {
        body: data.body || 'You have a new notification',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        vibrate: [200, 100, 200],
        data: {
            url: data.url || '/',
            dateOfArrival: Date.now(),
            primaryKey: data.orderId || 1
        },
        actions: [
            {
                action: 'open',
                title: 'View Details'
            },
            {
                action: 'close',
                title: 'Dismiss'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(
            data.title || 'SalesPro',
            options
        )
    );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'close') {
        return;
    }

    const urlToOpen = event.notification.data?.url || '/';

    event.waitUntil(
        self.clients.matchAll({ type: 'window' })
            .then((windowClients) => {
                // Check if there is already a window open
                for (const client of windowClients) {
                    if (client.url === urlToOpen && 'focus' in client) {
                        return client.focus();
                    }
                }
                // Open new window
                if (self.clients.openWindow) {
                    return self.clients.openWindow(urlToOpen);
                }
            })
    );
});

// Background sync for offline orders
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-orders') {
        event.waitUntil(syncPendingOrders());
    }
});

async function syncPendingOrders() {
    try {
        const db = await openDatabase();
        const pendingOrders = await db.getAll('pendingOrders');

        for (const order of pendingOrders) {
            try {
                const response = await fetch('/api/orders', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(order)
                });

                if (response.ok) {
                    await db.delete('pendingOrders', order.id);
                }
            } catch (error) {
                console.error('[ServiceWorker] Failed to sync order:', error);
            }
        }
    } catch (error) {
        console.error('[ServiceWorker] Sync failed:', error);
    }
}

// Simple IndexedDB helper
function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('SalesProOffline', 1);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('pendingOrders')) {
                db.createObjectStore('pendingOrders', { keyPath: 'id' });
            }
        };

        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });
}