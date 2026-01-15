self.addEventListener('install', (event)=>{
  self.skipWaiting();
});

self.addEventListener('activate', (event)=>{
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event)=>{
  const { request } = event;
  const url = new URL(request.url);

  const isEventPath = url.pathname.endsWith('/event');

  if (isEventPath && request.method === 'OPTIONS') {
    event.respondWith(new Response(null, { status: 204 }));
    return;
  }

  if (isEventPath && request.method === 'POST') {
    event.respondWith((async()=>{
      try {
        const body = await request.clone().json().catch(()=>null);
        const response = { status: 'ok', id: Date.now(), received: body };
        return new Response(JSON.stringify(response), { status: 200, headers: { 'Content-Type': 'application/json' } });
      } catch (e) {
        return new Response(JSON.stringify({ status: 'error' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
    })());
    return;
  }

  // Default pass-through
  event.respondWith(fetch(request));
});
