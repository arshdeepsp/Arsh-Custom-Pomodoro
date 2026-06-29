/* Timers PWA service worker.
   - Network-first for the app page so updates show up as soon as you redeploy
     (falls back to cache when offline).
   - Stale-while-revalidate for static assets (icons/manifest): fast, self-updating.
   - Handles taps on triggered alarm notifications (focus/open the app).
   Alarm scheduling uses Notification Triggers (showTrigger), which the OS fires
   on time even when the browser/app is closed — no SW timers needed. */

const CACHE = 'timers-v3';                 // bump this string whenever you redeploy
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
  const req = e.request;
  const url = new URL(req.url);
  if(url.origin !== self.location.origin) return;          // let cross-origin (fonts) hit network

  const isDoc = req.mode === 'navigate' || url.pathname.endsWith('.html');

  if(isDoc){
    // network-first: always try for the freshest page, fall back to cache offline
    e.respondWith(
      fetch(req).then(res=>{
        const copy = res.clone();
        caches.open(CACHE).then(c=> c.put(req, copy)).catch(()=>{});
        return res;
      }).catch(()=> caches.match(req).then(hit=> hit || caches.match('./Pomodoro.html')))
    );
    return;
  }

  // everything else: stale-while-revalidate
  e.respondWith(
    caches.match(req).then(hit=>{
      const net = fetch(req).then(res=>{
        const copy = res.clone();
        caches.open(CACHE).then(c=> c.put(req, copy)).catch(()=>{});
        return res;
      }).catch(()=> hit);
      return hit || net;
    })
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
