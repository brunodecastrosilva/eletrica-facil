// Elétrica Fácil · uso sem internet (modelo do Projeto Integrador).
// Arquivos do app: busca a versão nova primeiro e usa a guardada se estiver sem internet.
// Bibliotecas (QR code, PDF, fontes) têm versão fixa: usa a guardada.
// O cache leva a versão do app (package.json); cada app só apaga as próprias cópias antigas,
// porque os apps do projeto dividem o mesmo endereço (github.io).
const CACHE = 'eletrica-facil-2.8.0';
const APP = ['./', './index.html', './comum/kit-facil.js', './comum/kit-facil.css', './manifest.webmanifest', './icons/apple-touch-icon.png', './icons/icon-192.png'];
const LIBS = ['cdnjs.cloudflare.com', 'fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(APP)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('eletrica-facil-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === location.origin) {
    // só responde pelo que é deste app (os outros apps do mesmo endereço têm o próprio service worker)
    if (!url.pathname.startsWith(new URL('./', self.registration.scope).pathname)) return;
    e.respondWith(fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: true, cacheName: CACHE }).then(r => r || caches.match('./index.html', { cacheName: CACHE }))));
  } else if (LIBS.includes(url.hostname)) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
      const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return res;
    })));
  }
  // o resto (API do GitHub da sincronização, envio de avaliações) passa direto pela rede
});
