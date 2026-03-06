const CACHE_NAME='top-lanchonete-v1'
const ASSETS=[
  'index.html',
  'admin.html',
  'style.css',
  'app.js',
  'admin.js',
  'manifest.json',
  'icon.png'
]

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(ASSETS)))
})

self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k))))
  )
})

self.addEventListener('fetch',e=>{
  const req=e.request
  e.respondWith(
    caches.match(req).then(res=> res || fetch(req).then(r=>{
      const copy=r.clone()
      if(req.method==='GET' && (req.url.startsWith(self.location.origin))){
        caches.open(CACHE_NAME).then(c=>c.put(req,copy)).catch(()=>{})
      }
      return r
    }).catch(()=>res))
  )
})
