self.addEventListener('install', (event)=>{

    self.skipWaiting();
    console.log('PWA instalado');

});

self.addEventListener('activate',(event)=>{

    event.waitUntil(clients.claim());

});