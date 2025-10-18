/**
 * Service Worker Registration
 * Enables offline functionality and caching
 */

export interface ServiceWorkerStatus {
  registered: boolean;
  installing: boolean;
  waiting: boolean;
  active: boolean;
  error?: string;
}

let registration: ServiceWorkerRegistration | null = null;

/**
 * Register service worker
 */
export async function registerServiceWorker(): Promise<ServiceWorkerStatus> {
  // Only register in production or if explicitly requested
  if (import.meta.env.DEV) {
    console.log('[SW] Service worker disabled in development mode');
    return {
      registered: false,
      installing: false,
      waiting: false,
      active: false,
      error: 'Disabled in development'
    };
  }

  // Check if service workers are supported
  if (!('serviceWorker' in navigator)) {
    console.warn('[SW] Service workers not supported in this browser');
    return {
      registered: false,
      installing: false,
      waiting: false,
      active: false,
      error: 'Not supported'
    };
  }

  try {
    console.log('[SW] Registering service worker...');

    registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    });

    console.log('[SW] Service worker registered successfully');

    // Handle updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration!.installing;
      console.log('[SW] Update found, new worker installing...');

      newWorker?.addEventListener('statechange', () => {
        console.log('[SW] Worker state changed:', newWorker.state);

        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // New service worker available, prompt user to refresh
          console.log('[SW] New version available!');
          notifyUserOfUpdate();
        }
      });
    });

    // Check current status
    const status = getServiceWorkerStatus(registration);
    
    // Listen for controller change (new SW activated)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('[SW] Controller changed, reloading page...');
      window.location.reload();
    });

    return status;

  } catch (error) {
    console.error('[SW] Registration failed:', error);
    return {
      registered: false,
      installing: false,
      waiting: false,
      active: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Unregister service worker
 */
export async function unregisterServiceWorker(): Promise<boolean> {
  if (!registration) {
    const reg = await navigator.serviceWorker.getRegistration();
    if (reg) {
      registration = reg;
    }
  }

  if (registration) {
    const success = await registration.unregister();
    console.log('[SW] Unregistered:', success);
    return success;
  }

  return false;
}

/**
 * Get current service worker status
 */
function getServiceWorkerStatus(reg: ServiceWorkerRegistration): ServiceWorkerStatus {
  return {
    registered: true,
    installing: reg.installing !== null,
    waiting: reg.waiting !== null,
    active: reg.active !== null
  };
}

/**
 * Notify user of available update
 */
function notifyUserOfUpdate() {
  // Create notification
  const message = 'A new version of Astrobiomers is available!';
  
  // Simple browser notification
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Astrobiomers Update', {
      body: message,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'app-update'
    });
  }

  // Console log for development
  console.log('[SW] Update available:', message);

  // You could also dispatch a custom event for the UI to handle
  window.dispatchEvent(new CustomEvent('sw-update-available', {
    detail: { message }
  }));
}

/**
 * Skip waiting and activate new service worker immediately
 */
export async function skipWaiting() {
  if (registration?.waiting) {
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  }
}

/**
 * Clear all caches
 */
export async function clearCaches(): Promise<boolean> {
  if (!('caches' in window)) {
    return false;
  }

  try {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(cacheName => caches.delete(cacheName))
    );
    console.log('[SW] All caches cleared');
    return true;
  } catch (error) {
    console.error('[SW] Failed to clear caches:', error);
    return false;
  }
}

/**
 * Get total cache size
 */
export async function getCacheSize(): Promise<number> {
  if (!registration) {
    return 0;
  }

  return new Promise((resolve) => {
    const channel = new MessageChannel();
    
    channel.port1.onmessage = (event) => {
      resolve(event.data.size || 0);
    };

    registration.active?.postMessage(
      { type: 'GET_CACHE_SIZE' },
      [channel.port2]
    );

    // Timeout after 5 seconds
    setTimeout(() => resolve(0), 5000);
  });
}

/**
 * Check if app is currently offline
 */
export function isOffline(): boolean {
  return !navigator.onLine;
}

/**
 * Listen for online/offline events
 */
export function watchConnectionStatus(
  onOnline?: () => void,
  onOffline?: () => void
) {
  window.addEventListener('online', () => {
    console.log('[SW] App is online');
    onOnline?.();
  });

  window.addEventListener('offline', () => {
    console.log('[SW] App is offline');
    onOffline?.();
  });

  // Return cleanup function
  return () => {
    window.removeEventListener('online', onOnline || (() => {}));
    window.removeEventListener('offline', onOffline || (() => {}));
  };
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.warn('[SW] Notifications not supported');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission;
  }

  return Notification.permission;
}

/**
 * Show a notification (requires permission)
 */
export async function showNotification(
  title: string,
  options?: NotificationOptions
): Promise<void> {
  const permission = await requestNotificationPermission();

  if (permission === 'granted') {
    if (registration) {
      await registration.showNotification(title, options);
    } else {
      new Notification(title, options);
    }
  }
}

// Auto-register on import (optional)
if (import.meta.env.PROD) {
  registerServiceWorker().then(status => {
    console.log('[SW] Initial status:', status);
  });
}
