import http from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
const root=path.resolve('public');
const handler=createRequire(import.meta.url)('../api/satellites.js');
const offline=process.argv.includes('--offline');
const types={'.html':'text/html','.css':'text/css','.mjs':'text/javascript','.jpg':'image/jpeg'};
http.createServer(async(req,res)=>{
  try{
    const url=new URL(req.url,'http://localhost');
    if(url.pathname==='/api/satellites'){
      if(offline){res.setHeader('Content-Type','application/json');res.end(JSON.stringify({status:'unavailable',message:'Offline development mode',records:[]}));return;}
      return await handler(req,res);
    }
    const file=path.resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));
    if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
    const bytes=await readFile(file);res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.end(bytes);
  }catch{res.writeHead(404).end();}
}).listen(8081,'127.0.0.1',()=>console.log('Preview: http://127.0.0.1:8081'+(offline?' (offline feed)':'')));
