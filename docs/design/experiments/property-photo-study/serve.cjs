// Local-only study server. Serves the preview, public photo/font assets and built baseline.
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../../../..');
const types={'.html':'text/html','.css':'text/css','.js':'text/javascript','.webp':'image/webp','.jpg':'image/jpeg','.woff2':'font/woff2','.svg':'image/svg+xml','.png':'image/png','.json':'application/json'};
http.createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost');let base,relative;
 if(url.pathname==='/property.json'){const p=JSON.parse(fs.readFileSync(path.join(root,'src/_data/properties-fallback.json'))).find(p=>p.slug==='dockside-dreams');res.setHeader('Content-Type','application/json');res.end(JSON.stringify({name:p.name,photography:p.photography}));return;}
 if(url.pathname.startsWith('/images/')){base=root;relative=url.pathname.slice(1);}
 else if(url.pathname.startsWith('/assets/fonts/')){base=path.join(root,'src');relative=url.pathname.slice(1);}
 else if(url.pathname.startsWith('/baseline/')){base=path.join(root,'_site');relative=url.pathname.slice(10);}
 else if(['/','/index.html','/study.css','/gallery.js'].includes(url.pathname)){base=__dirname;relative=url.pathname==='/'?'index.html':url.pathname.slice(1);}
 else {base=path.join(root,'_site');relative=url.pathname.slice(1);}
 const file=path.resolve(base,relative.endsWith('/')?relative+'index.html':relative);
 if(!file.startsWith(base+path.sep)){res.writeHead(403);res.end();return;}
 fs.readFile(file,(err,data)=>{if(err){res.writeHead(404);res.end('Not found');return;}res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.setHeader('Cache-Control','no-store');res.end(data);});
}).listen(8793,'127.0.0.1',()=>console.log('Photo study: http://127.0.0.1:8793/'));
