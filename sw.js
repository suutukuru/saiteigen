/* オフライン用キャッシュ。ファイルを更新したら VERSION を上げてください。 */
const VERSION = 'v0.10.1';
const CACHE = 'saiteigen-' + VERSION;
const ASSETS = [
  './', './index.html', './css/style.css',
  './js/data.js', './js/content.js', './js/map.js', './js/trouble.js', './js/judge.js', './js/series/prep.js', './js/series/kizukai.js', './js/series/nakayoku.js', './js/ai-draft/01-05.js', './js/ai-draft/06-10.js', './js/ai-draft/11-14.js', './js/app.js',
  './manifest.webmanifest', './icons/icon.svg', './icons/apple-touch-icon.png',
  './icons/icon-192.png', './icons/icon-512.png'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
// ネットワーク優先（最新を取得）→ 失敗したらキャッシュ。オフラインでも起動できます。
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
      return res;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('./index.html')))
  );
});
