const CACHE = 'terra-tactics-ex-v139';
const ASSETS = ['./manifest.json', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => {
    // index.html（約28MB）は先読みしない。更新チェックを軽く・速く終えるため（初回表示時にfetch側でキャッシュされる）
    e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
    e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
    if (e.request.method !== 'GET') return;
    if (new URL(e.request.url).pathname.endsWith('/sw.js')) return; // バージョンチェック用は常にネットワークから取得
    e.respondWith(
        caches.match(e.request, { ignoreSearch: true }).then(hit => hit || fetch(e.request).then(res => {
            const copy = res.clone();
            caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
            return res;
        }).catch(() => caches.match('./index.html')))
    );
});
