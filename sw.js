/*Source: https://developers.google.com/web/fundamentals/primers/service-workers/*/
var staticCacheName = 'mws-static-v1';
/**
 * Install Service worker and cache all pages required for offline access.
 */
self.addEventListener('install', (event) => {
	event.waitUntil(caches.open(staticCacheName).then((cache) => {
		return cache.addAll(['./', '/index.html', '/restaurant.html',
			'js/main.js', 'js/restaurant_info.js', 'js/dbhelper.js',
			'css/styles.css',
			'img/1.jpg', 'img/2.jpg', 'img/3.jpg', 'img/4.jpg', 'img/5.jpg', 'img/6.jpg', 'img/7.jpg', 'img/8.jpg', 'img/9.jpg', 'img/10.jpg',
			'data/restaurants.json',
			'https://unpkg.com/leaflet@1.3.1/dist/leaflet.css',
			'https://unpkg.com/leaflet@1.3.1/dist/leaflet.js',
		]);
	}));
});

/**
 * Activate Service worker and delete old cache.
 */
self.addEventListener('activate', (event) => {
	event.waitUntil(caches.keys().then((cacheNames) => {
		return Promise.all(cacheNames.filter((cacheName) => {
			return cacheName.startsWith('mws-') && cacheName != staticCacheName;
		}).map((cacheName) => {
			return caches.delete(cacheName);
		}));
	}));
});

/***
 * Fetch all requests and match against the cache
 */
self.addEventListener('fetch', (event) => {
	event.respondWith(caches.match(event.request).then((response) => {
		/**
		 * If we have a matching response, we return the cached value,
		 * else an error response.
		 */
		return response ||
			caches.open(staticCacheName).then((cache) => {
				return fetch(event.request).then((response) => {
					if (response.status === 404) {
						console.log("Page not found.");
						return new Response("Page not found.")
					}
					/**
					 * We can use clone() for new response requests.
					 */
					else {
						return fetch(event.request).then(
							function (response) {
								let responseClone = response.clone();

								caches.open(staticCacheName)
									.then(
										function (cache) {
											cache.put(event.request, responseClone);
										}
									);
								return response;
							}
						);
					}
				});
			});
	}).catch(function () {
		// If both(cache miss and n/w fetch) fail, show a generic fallback:
		return new Response("You seems to be offline, and we didn't find any old cache for the URL.")
	}));
});

/**
 * listen for the "message" event, and call
 * skipWaiting if you get the appropriate message
 */
self.addEventListener('message', (event) => {
	if (event.data) {
		console.log('Messgae received:' + event.data);
		self.skipWaiting();
	}
});
