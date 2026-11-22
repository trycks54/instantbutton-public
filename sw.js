// Offline assets for Instant Button v1.9.6 with 35 licensed-by-user-supplied MP3s.
const CACHE = 'instant-button-v1.9.6-27';
const SHELL = ['./', './index.html', './manifest.webmanifest',
  './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png',
  './objects/object-1307.png', './objects/object-1308.png', './objects/object-1309.png',
  './objects/cockroach.gif',
  './sounds/01.mp3',
  './sounds/02.mp3',
  './sounds/03.mp3',
  './sounds/04.mp3',
  './sounds/05.mp3',
  './sounds/06.mp3',
  './sounds/07.mp3',
  './sounds/08.mp3',
  './sounds/09.mp3',
  './sounds/10.mp3',
  './sounds/11.mp3',
  './sounds/12.mp3',
  './sounds/13.mp3',
  './sounds/14.mp3',
  './sounds/15.mp3',
  './sounds/16.mp3',
  './sounds/17.mp3',
  './sounds/18.mp3',
  './sounds/19.mp3',
  './sounds/20.mp3',
  './sounds/21.mp3',
  './sounds/22.mp3',
  './sounds/23.mp3',
  './sounds/24.mp3',
  './sounds/25.mp3',
  './sounds/26.mp3',
  './sounds/27.mp3',
  './sounds/28.mp3',
  './sounds/29.mp3',
  './sounds/30.mp3',
  './sounds/31.mp3',
  './sounds/32.mp3',
  './sounds/33.mp3',
  './sounds/34.mp3',
  './sounds/35.mp3'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL.map(url =>
    url === './' || url === './index.html' ? new Request(url, {cache:'reload'}) : url
  ))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  // iOS Safari often requests MP3s using byte ranges. Serve the requested
  // range from the offline cache so audio still plays with no connection.
  const range = request.headers.get('range');
  if (range && new URL(request.url).pathname.toLowerCase().endsWith('.mp3')) {
    event.respondWith(caches.match(request.url).then(async cached => {
      if (!cached) return fetch(request);
      const bytes = await cached.arrayBuffer();
      const match = /^bytes=(\d*)-(\d*)$/.exec(range);
      if (!match) return cached;
      const size = bytes.byteLength;
      const suffix = !match[1] && match[2];
      const start = suffix ? Math.max(0, size - Number(match[2])) : Math.min(size-1, Number(match[1] || 0));
      const end = suffix ? size-1 : match[2] ? Math.min(size-1, Number(match[2])) : size-1;
      if (start > end || size === 0) return new Response(null,{status:416,headers:{'Content-Range':'bytes */'+size}});
      return new Response(bytes.slice(start, end+1), {status:206,headers:{
        'Content-Type':'audio/mpeg', 'Accept-Ranges':'bytes',
        'Content-Range':`bytes ${start}-${end}/${size}`,
        'Content-Length':String(end-start+1)
      }});
    }));
    return;
  }
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request, {cache:'no-cache'}).then(response => {
      if (response.ok) { const copy=response.clone(); caches.open(CACHE).then(cache => cache.put('./index.html',copy)); }
      return response;
    }).catch(() => caches.match('./index.html')));
    return;
  }
  event.respondWith(caches.match(request).then(cached => cached || fetch(request).then(response => {
    if(response.ok) { const copy=response.clone(); caches.open(CACHE).then(cache => cache.put(request,copy)); }
    return response;
  })));
});
