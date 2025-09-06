// sw.js - Service Worker
const CACHE_NAME = 'quizmaster-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    '/js/utils.js',
    '/js/quiz.js',
    '/js/review.js',
    '/js/settings.js',
    '/js/profile.js',
    '/js/leaderboard.js',
    '/manifest.json',
    '/assets/icon.png',
    '/assets/default-dp.png',
    '/assets/click.mp3',
    '/data/questions.json'
];

// Install event
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
    );
});

// Fetch event
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return cached version or fetch from network
                return response || fetch(event.request);
            })
    );
});

// Activate event
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});