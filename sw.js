const CACHE_NAME = "pwa-demo-cache-v1",
  urlsToCache = [
    "./",
    "./?utm=homescreen",
    "./index.html",
    "./index.html?utm=homescreen",
    "./style.css",
    "./script.js",
    "./sw.js",
    "./favicon.ico",
    "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.13.0/css/fontawesome.min.css",
  ];

self.addEventListener("install", (e) => {
  console.log("Evento: SW Instalado");
  e.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Archivos en cache");
        return cache.addAll(urlsToCache);
      })
      .catch((err) => console.log("Fallo registro de cache", err))
  );
});

self.addEventListener("activate", (e) => {
  console.log("Evento: SW Activado");
  const cacheList = [CACHE_NAME];

  e.waitUntil(
    caches
      .keys()
      .then((cachesNames) => {
        return Promise.all(
          cachesNames.map((cacheName) => {
            if (cacheList.indexOf(cacheName) === -1) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log("El cache esta limpio y actualizado");
        return self.clients.claim();
      })
      .catch()
  );
});

self.addEventListener("fetch", (e) => {
  console.log("Evento: SW Recuperando");
  e.respondWith(
    caches.match(e.request).then((res) => {
      if (res) {
        return res;
      }

      return fetch(e.request).then((res) => {
        let resToCache = res.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache
            .put(e.resquest, resToCache)
            .catch((err) => console.log(`${e.request.url}: ${err.message}`));
        });
        return res;
      });
    })
  );
});

self.addEventListener("push", (e) => {
  console.log("Evento: Push");

  let title = "Push Notificación Demo";
  options = {
    body: "Click para regresar a la aplicación",
    icon: "./img/icon_192x192.png",
    vibrate: [100, 50, 100],
    data: { id: 1 },
    actions: [
      {
        action: "Si",
        title: "Amo esta aplicación :)",
        icon: "./img/icon_192x192.png",
      },
      {
        action: "No",
        title: "No me gusta esta aplicación :)",
        icon: "./img/icon_192x192.png",
      },
    ],
  };
  e.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (e) => {
//   console.log(e);

  if (e.action == "Si") {
    console.log("AMO esta aplicacion");
    clients.openWindow("https://www.instagram.com/robertramosastudillo");
  } else if (e.action == "No") {
    console.log("No me gusta esta aplicacion");
  }

// e.notitication.close();
// e.notitication.onclose();

});

self.addEventListener("sync", e => {
  console.log("Evento: Sincronización de Fondo", e);

  // Revisamos que la etiqueta de sincronización sea la que definimos o la que emulan las devtools
  if(e.tag === "github" || e.tag === "test-tag-from-devtools"){
    e.waitUntil(
      // Comprobamos todas las pestañas abiertas y les enviamos postMessage
      self.clients.matchAll()
      .then(all => {
        return all.map(client => {
          return client.postMessage("online")
        })
      })
      .catch(err => console.log(err))
    )
  }
})

// self.addEventListener("message", (e) => {
//   console.log(e);
//   console.log("Desde la Sincronización de Fondo", e.data);
//   fetchGitHubUser(localStorage.getItem("github"), true)
// })