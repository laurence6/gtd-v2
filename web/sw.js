// service worker
"use strict";

const CACHE_NAME = "gtd-cache";
const URLS_TO_CACHE = [
    "./",
    "./gtd.css",
    "./gtd.js",
    "./idb.js",
    "./vue.js",
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(cache => { cache.addAll(URLS_TO_CACHE); })
        .catch(err => { console.error(err); })
    )
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(keys.map(key => {
                if (key !== CACHE_NAME) {
                    return caches.delete(key);
                }
            }));
        })
    );
    return self.clients.claim();
});

self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request)
        .then(response => response || fetch(event.request))
    )
});
