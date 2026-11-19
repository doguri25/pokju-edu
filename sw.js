/* 폭주 구구단 offline cache. tools/build.mjs copies this to /sw.js with VERSION set from the built page, so every new build installs afresh.
   The game page is network-first: online it is always the newest build, offline (or a network that hangs for 4 s) it is the last copy kept.
   Google Fonts are kept as they are used (font files never change; their stylesheet is refreshed behind the cached copy).
   The other pages in the repository (dist/, mockup/) are left to the network. */
var VERSION = '3b1af1f1acc5', PAGE = 'pokju-page-' + VERSION, FONTS = 'pokju-fonts';
var BASE = new URL('./', self.location).href, HOME = new URL('./', self.location).pathname;
var SHELL = ['./', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/maskable-512.png', './icons/apple-touch-icon.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(PAGE).then(function (c) { return c.addAll(SHELL); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k.indexOf('pokju-page-') === 0 && k !== PAGE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

function keep(name, key, res) { var cp = res.clone(); return caches.open(name).then(function (c) { return c.put(key, cp); }).catch(function () {}); }

function page(e) {
  var net = fetch(e.request).then(function (res) { if (res.ok && res.type === 'basic') e.waitUntil(keep(PAGE, BASE, res)); return res; });
  e.waitUntil(net.catch(function () {}));
  return caches.match(BASE).then(function (hit) {
    if (!hit) return net;
    return new Promise(function (done) {
      var t = setTimeout(function () { done(hit); }, 4000);
      net.then(function (res) { clearTimeout(t); done(res.ok || res.type === 'opaqueredirect' ? res : hit); }, function () { clearTimeout(t); done(hit); });
    });
  });
}

function cacheFirst(e, name) {
  return caches.match(e.request, { ignoreVary: true }).then(function (hit) {
    return hit || fetch(e.request).then(function (res) { if (res.ok) e.waitUntil(keep(name, e.request, res)); return res; });
  });
}

function refreshBehind(e) {
  var net = fetch(e.request).then(function (res) { if (res.ok) e.waitUntil(keep(FONTS, e.request, res)); return res; });
  e.waitUntil(net.catch(function () {}));
  return caches.match(e.request, { ignoreVary: true }).then(function (hit) { return hit || net; });
}

/* the page's first visit fetched its fonts before this cache was running: it sends their addresses, and they are kept now */
self.addEventListener('message', function (e) {
  var list = e.data && e.data.keep;
  if (!Array.isArray(list)) return;
  e.waitUntil(caches.open(FONTS).then(function (c) {
    return Promise.all(list.filter(function (u) { return typeof u === 'string' && /^https:\/\/fonts\.(googleapis|gstatic)\.com\//.test(u); }).slice(0, 200).map(function (u) {
      return c.match(u, { ignoreVary: true }).then(function (hit) { return hit || fetch(u, { mode: 'cors', credentials: 'omit' }).then(function (res) { if (res.ok) return c.put(u, res); }); }).catch(function () {});
    }));
  }));
});

self.addEventListener('fetch', function (e) {
  var r = e.request, u = new URL(r.url);
  if (r.method !== 'GET') return;
  if (u.origin === self.location.origin) {
    if (r.mode === 'navigate') { if (u.pathname === HOME || u.pathname === HOME + 'index.html') e.respondWith(page(e)); return; }
    if (u.pathname === HOME + 'manifest.webmanifest' || u.pathname.indexOf(HOME + 'icons/') === 0) e.respondWith(cacheFirst(e, PAGE));
    return;
  }
  if (u.origin === 'https://fonts.gstatic.com') e.respondWith(cacheFirst(e, FONTS));
  else if (u.origin === 'https://fonts.googleapis.com') e.respondWith(refreshBehind(e));
});
