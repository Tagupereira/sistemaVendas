const CACHE = 'delicias-v1';

const arquivos=['./','./index.html','./manifest.json'];

self.addEventListener('install', (event)=>{

    self.waitUntil(
        caches.open(CACHE).then(cache => cache.addAll(arquivos))
    );
    console.log('PWA instalado');
    self.skipWaiting();

});

self.addEventListener('activate',(event)=>{

    event.waitUntil(caches.keys().then(keys =>{
            return Promise.all(keys.map(key =>{
                if(key !== CACHE){
                    return caches.delete(key);
                }
            }));
        })
    
        );
        clients.claim()

});

self.addEventListener('fetch', event => {

    event.respondWith(fetch(event.request).catch(() => {

            return caches.match(event.request);

        })

    );

});