const CACHE = 'DeliUp-v2';

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

self.addEventListener("fetch", event => {

    const url = new URL(event.request.url);

    if(url.hostname === "script.google.com"){
        return; // deixa o navegador fazer a requisição normalmente
    }

    event.respondWith(

        fetch(event.request)

        .catch(async ()=>{

            const cache = await caches.match(event.request);

            if(cache){

                return cache;

            }

            return new Response("Offline",{

                status:503,
                statusText:"Offline"

            });

        })

    );

});