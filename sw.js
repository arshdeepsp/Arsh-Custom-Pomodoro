/* Timers PWA service worker.
   - Caches the app shell so it works offline.
   - Handles taps on triggered alarm notifications (focus/open the app).
   The actual alarm scheduling uses Notification Triggers (showTrigger), which
   the OS fires on time even when the browser/app is closed — no SW timers needed. */

const CACHE = 'timers-v1';
const SHELL = [
  './Pomodoro.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE).then(c=> c.addAll(SHELL)).then(()=> self.skipWaiting()));
});

self.addEventListener('activate', e=>{
  e.waitUntil(
    caches.keys().then(keys=> Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
      .then(()=> self.clients.claim())
  );
});

self.addEventListener('fetch', e=>{
  const url = new URL(e.request.url);
  if(url.origin !== self.location.origin) return;       // let cross-origin (fonts) hit network
  e.respondWith(
    caches.match(e.request).then(hit=> hit || fetch(e.request).then(res=>{
      const copy = res.clone();
      caches.open(CACHE).then(c=> c.put(e.request, copy)).catch(()=>{});
      return res;
    }).catch(()=> hit))
  );
});

// Tap a fired alarm → focus the app (or open it if closed).
self.addEventListener('notificationclick', e=>{
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({type:'window', includeUncontrolled:true}).then(list=>{
      for(const c of list){ if('focus' in c) return c.focus(); }
      if(self.clients.openWindow) return self.clients.openWindow('./Pomodoro.html');
    })
  );
});
