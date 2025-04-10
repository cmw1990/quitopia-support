// Service Worker for Easier Focus PWA
const CACHE_NAME = 'easier-focus-cache-v1';
const ASSETS_TO_CACHE = [
  '/easier-focus/',
  '/easier-focus/index.html',
  '/easier-focus/manifest.json',
  '/easier-focus/icons/favicon.ico',
  '/easier-focus/sounds/bell.mp3',
  '/easier-focus/icons/icon-72x72.png',
  '/easier-focus/icons/icon-96x96.png',
  '/easier-focus/icons/icon-128x128.png',
  '/easier-focus/icons/icon-144x144.png',
  '/easier-focus/icons/icon-152x152.png',
  '/easier-focus/icons/icon-192x192.png',
  '/easier-focus/icons/icon-384x384.png',
  '/easier-focus/icons/icon-512x512.png',
  '/easier-focus/icons/maskable-icon.png'
];

// When the service worker is installed
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Installing');
  
  // Cache all static assets
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[ServiceWorker] Caching app shell');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => {
        console.log('[ServiceWorker] Install completed');
        return self.skipWaiting();
      })
  );
});

// When the service worker is activated
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activating');
  
  // Clean up old caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((cacheName) => {
          return cacheName !== CACHE_NAME;
        }).map((cacheName) => {
          console.log('[ServiceWorker] Deleting old cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      console.log('[ServiceWorker] Activated');
      return self.clients.claim();
    })
  );
});

// Intercept network requests
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  // Skip Supabase API requests (don't cache them)
  if (event.request.url.includes('/rest/v1/') || 
      event.request.url.includes('/auth/v1/')) {
    return;
  }
  
  // Handle asset requests - cache first, network fallback
  if (event.request.method === 'GET') {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          // Return cached response if available
          if (response) {
            return response;
          }
          
          // Otherwise, fetch from network
          return fetch(event.request)
            .then((networkResponse) => {
              // Don't cache non-successful responses
              if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                return networkResponse;
              }
              
              // Cache the fetched response
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseToCache);
              });
              
              return networkResponse;
            })
            .catch((error) => {
              console.error('[ServiceWorker] Fetch failed:', error);
              
              // For navigational requests, return offline page
              if (event.request.mode === 'navigate') {
                return caches.match('/easier-focus/offline.html');
              }
              
              return new Response('Network error', { status: 408, headers: new Headers({ 'Content-Type': 'text/plain' }) });
            });
        })
    );
  }
});

// Handle background sync for offline data
self.addEventListener('sync', (event) => {
  console.log('[ServiceWorker] Background Sync event:', event.tag);
  
  if (event.tag === 'focus-session-sync') {
    event.waitUntil(syncFocusSessions());
  } else if (event.tag === 'task-sync') {
    event.waitUntil(syncTasks());
  }
});

// Sync focus sessions from IndexedDB to Supabase
async function syncFocusSessions() {
  try {
    // Open IndexedDB
    const db = await openIndexedDB();
    
    // Get focus sessions that need to be synced
    const sessions = await getUnsynedFocusSessions(db);
    
    for (const session of sessions) {
      // Try to sync with server
      const synced = await syncSessionWithServer(session);
      
      if (synced) {
        // Mark as synced in IndexedDB
        await markSessionAsSynced(db, session.id);
      }
    }
    
    return Promise.resolve();
  } catch (error) {
    console.error('[ServiceWorker] Error syncing focus sessions:', error);
    return Promise.reject(error);
  }
}

// Sync tasks from IndexedDB to Supabase
async function syncTasks() {
  try {
    // Open IndexedDB
    const db = await openIndexedDB();
    
    // Get tasks that need to be synced
    const tasks = await getUnsynedTasks(db);
    
    for (const task of tasks) {
      // Try to sync with server
      const synced = await syncTaskWithServer(task);
      
      if (synced) {
        // Mark as synced in IndexedDB
        await markTaskAsSynced(db, task.id);
      }
    }
    
    return Promise.resolve();
  } catch (error) {
    console.error('[ServiceWorker] Error syncing tasks:', error);
    return Promise.reject(error);
  }
}

// Helper: Open IndexedDB
function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('EasierFocusDB', 1);
    
    request.onerror = (event) => {
      reject('Error opening IndexedDB');
    };
    
    request.onsuccess = (event) => {
      resolve(event.target.result);
    };
    
    // This will only run if the database doesn't exist or needs upgrade
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains('focusSessions')) {
        const sessionStore = db.createObjectStore('focusSessions', { keyPath: 'id' });
        sessionStore.createIndex('synced', 'synced', { unique: false });
      }
      
      if (!db.objectStoreNames.contains('tasks')) {
        const taskStore = db.createObjectStore('tasks', { keyPath: 'id' });
        taskStore.createIndex('synced', 'synced', { unique: false });
      }
    };
  });
}

// Helper: Get unsynced focus sessions
function getUnsynedFocusSessions(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['focusSessions'], 'readonly');
    const store = transaction.objectStore('focusSessions');
    const index = store.index('synced');
    const request = index.getAll(0); // 0 = false/not synced
    
    request.onsuccess = (event) => {
      resolve(event.target.result);
    };
    
    request.onerror = (event) => {
      reject('Error getting unsynced focus sessions');
    };
  });
}

// Helper: Get unsynced tasks
function getUnsynedTasks(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['tasks'], 'readonly');
    const store = transaction.objectStore('tasks');
    const index = store.index('synced');
    const request = index.getAll(0); // 0 = false/not synced
    
    request.onsuccess = (event) => {
      resolve(event.target.result);
    };
    
    request.onerror = (event) => {
      reject('Error getting unsynced tasks');
    };
  });
}

// Helper: Sync session with server
async function syncSessionWithServer(session) {
  try {
    const authToken = await getAuthToken();
    
    if (!authToken) {
      return false; // Can't sync without auth
    }
    
    const response = await fetch(`${self.location.origin}/rest/v1/focus_sessions8`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(session.data)
    });
    
    return response.ok;
  } catch (error) {
    console.error('[ServiceWorker] Error syncing session with server:', error);
    return false;
  }
}

// Helper: Sync task with server
async function syncTaskWithServer(task) {
  try {
    const authToken = await getAuthToken();
    
    if (!authToken) {
      return false; // Can't sync without auth
    }
    
    const response = await fetch(`${self.location.origin}/rest/v1/tasks8`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(task.data)
    });
    
    return response.ok;
  } catch (error) {
    console.error('[ServiceWorker] Error syncing task with server:', error);
    return false;
  }
}

// Helper: Mark session as synced
function markSessionAsSynced(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['focusSessions'], 'readwrite');
    const store = transaction.objectStore('focusSessions');
    const request = store.get(id);
    
    request.onsuccess = (event) => {
      const session = event.target.result;
      session.synced = 1;
      
      const updateRequest = store.put(session);
      
      updateRequest.onsuccess = () => {
        resolve(true);
      };
      
      updateRequest.onerror = () => {
        reject('Error updating session sync status');
      };
    };
    
    request.onerror = () => {
      reject('Error getting session to mark as synced');
    };
  });
}

// Helper: Mark task as synced
function markTaskAsSynced(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['tasks'], 'readwrite');
    const store = transaction.objectStore('tasks');
    const request = store.get(id);
    
    request.onsuccess = (event) => {
      const task = event.target.result;
      task.synced = 1;
      
      const updateRequest = store.put(task);
      
      updateRequest.onsuccess = () => {
        resolve(true);
      };
      
      updateRequest.onerror = () => {
        reject('Error updating task sync status');
      };
    };
    
    request.onerror = () => {
      reject('Error getting task to mark as synced');
    };
  });
}

// Helper: Get auth token from IndexedDB
function getAuthToken() {
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open('EasierFocusDB', 1);
      
      request.onsuccess = (event) => {
        const db = event.target.result;
        
        if (!db.objectStoreNames.contains('auth')) {
          resolve(null);
          return;
        }
        
        const transaction = db.transaction(['auth'], 'readonly');
        const store = transaction.objectStore('auth');
        const request = store.get('token');
        
        request.onsuccess = (event) => {
          const token = event.target.result ? event.target.result.value : null;
          resolve(token);
        };
        
        request.onerror = () => {
          resolve(null);
        };
      };
      
      request.onerror = () => {
        resolve(null);
      };
    } catch (error) {
      console.error('[ServiceWorker] Error getting auth token:', error);
      resolve(null);
    }
  });
}

// Handle push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  try {
    const data = event.data.json();
    
    const options = {
      body: data.body || 'New notification',
      icon: '/easier-focus/icons/icon-192x192.png',
      badge: '/easier-focus/icons/badge-96x96.png',
      data: {
        url: data.url || '/easier-focus/'
      },
      actions: data.actions || []
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'Easier Focus', options)
    );
  } catch (error) {
    console.error('[ServiceWorker] Error handling push:', error);
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action) {
    // Handle specific actions
    console.log('[ServiceWorker] Notification action clicked:', event.action);
  } else {
    // Handle notification click
    const urlToOpen = event.notification.data.url || '/easier-focus/';
    
    event.waitUntil(
      clients.matchAll({ type: 'window' })
        .then((clientList) => {
          // Check if there's already a window open
          for (const client of clientList) {
            if (client.url === urlToOpen && 'focus' in client) {
              return client.focus();
            }
          }
          
          // Otherwise open new window
          return clients.openWindow(urlToOpen);
        })
    );
  }
});

console.log('[ServiceWorker] Service worker registered'); 