const CACHE_NAME = 'sky-stone-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/js/config.js',
  '/js/timeCheck.js',
  '/js/tooltip.js',
  '/js/statusBar.js',
  '/js/calendarRender.js',
  '/js/calendarExport.js',
  '/js/calendarUI.js',
  '/js/calendarCore.js',
  '/js/calendar.js',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/font-awesome@4.7.0/css/font-awesome.min.css'
];

// 安装阶段：预缓存核心资源
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// 激活阶段：清理旧缓存
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) return caches.delete(cache);
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 请求拦截：缓存优先，网络后备
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});