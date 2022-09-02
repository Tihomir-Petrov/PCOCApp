'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "version.json": "af2f4cefba5836fcdfe3d1847ad2034b",
"index.html": "a8e486ca468fb4c5f38ad5079a2a376c",
"/": "a8e486ca468fb4c5f38ad5079a2a376c",
"main.dart.js": "28b0854578f462fa7b7e11c56ade6bd2",
"flutter.js": "eb2682e33f25cd8f1fc59011497c35f8",
"favicon.png": "5dcef449791fa27946b3d35ad8803796",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"manifest.json": "cef8e861bf384804361016530ef64e90",
"assets/AssetManifest.json": "49045e3c4b87904f918cbb39dfc091e4",
"assets/NOTICES": "df426836d9f365a3cf03ea0b09ed3536",
"assets/FontManifest.json": "7b2a36307916a9721811788013e65289",
"assets/packages/flutter_dropzone_web/assets/flutter_dropzone.js": "0266ef445553f45f6e45344556cfd6fd",
"assets/fonts/MaterialIcons-Regular.otf": "95db9098c58fd6db106f1116bae85a0b",
"assets/assets/flags/argentina.png": "094a887f3c05e99edafc549d32e3947b",
"assets/assets/flags/england.png": "c958acbf71ed315cebb7b5b8859033f0",
"assets/assets/flags/ecuador.png": "5a414d2f7bc62915544ca5cc6fe279cb",
"assets/assets/flags/senegal.png": "9ba943420d8e4526171502f6a18fdf33",
"assets/assets/flags/qatar.png": "bf5af4ec9ec2d8a57a094861cd539c51",
"assets/assets/flags/germany.png": "557d0a9aeb0e302a98796cee77e2805e",
"assets/assets/flags/spain.png": "2cd8afc8aadea278ab1ddd9b495b77d1",
"assets/assets/flags/paraguay.png": "fb959f1b29cdba9922b124eecb4b7070",
"assets/assets/flags/italy.png": "ad489ca177d082a1b854d66462b6b9cb",
"assets/assets/flags/brasil.png": "af189cf4ddd9f25140639da2e3495dee",
"assets/assets/flags/netherlands.png": "ee8e1fd2eccabb690c2d9fba4e87dbd0",
"assets/assets/flags/uruguay.png": "8cf9afabd710b1f3d07783ebab849f6f",
"assets/assets/Seat.svg": "e0ca51545452181eaeab342978457a52",
"assets/assets/dashboard.svg": "4344b7fe5790d92bae385b2835c3d657",
"assets/assets/stadiums/khalifa_stadium.png": "14d2376e9919d3a8cd8a003a7cf9fbc3",
"assets/assets/stadiums/al_thumama_stadium.jpeg": "bc79bf899af2497081a917f3b051fe87",
"assets/assets/stadiums/al_bayt_stadium.png": "07836a13334c722515fb827f348b007c",
"assets/assets/logo.png": "5f505f929dbda104144520217d471c7d",
"assets/assets/guests.svg": "9ab8d8e7cd13d36dfccad41a484e3238",
"assets/assets/passport_placeholder.png": "42697d8f823bf41d2b1b5251b38a6156",
"assets/assets/guests/guest_1.png": "357036815d88f4d62124aa690eb181e6",
"assets/assets/guests/guest_3.png": "0121c69f3f14ff0234125275970e50ba",
"assets/assets/guests/guest_2.png": "ec03e14be1eac538349420cb1c34a01c",
"assets/assets/guests/guest_6.png": "d88201249596f49893c86ab33cf44af2",
"assets/assets/guests/guest_5.png": "2fe44f3c242ad98dd1021bc3ab0ffc17",
"assets/assets/guests/guest_4.png": "861233487868e03e03fe26b419e46ef9",
"canvaskit/canvaskit.js": "c2b4e5f3d7a3d82aed024e7249a78487",
"canvaskit/profiling/canvaskit.js": "ae2949af4efc61d28a4a80fffa1db900",
"canvaskit/profiling/canvaskit.wasm": "95e736ab31147d1b2c7b25f11d4c32cd",
"canvaskit/canvaskit.wasm": "4b83d89d9fecbea8ca46f2f760c5a9ba"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache.
        return response || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
