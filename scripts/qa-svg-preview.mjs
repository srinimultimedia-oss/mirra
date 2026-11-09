import {securityHeaders} from '../src/security-headers.mjs';
// Local-only artifact renderer fixture; excluded from cloud publication.
import http from 'node:http';import {readFileSync} from 'node:fs';
const path=new URL('../replica/qa-label-export.svg',import.meta.url);
http.createServer((req,res)=>{for(const [key,value]of Object.entries(securityHeaders()))res.setHeader(key,value);if(req.url!=='/'&&req.url!=='/export.svg'){res.writeHead(404);return res.end();}res.writeHead(200,{'Content-Type':'image/svg+xml','Cache-Control':'no-store'});res.end(readFileSync(path));}).listen(4185,'127.0.0.1',()=>process.stdout.write('SVG QA preview: http://127.0.0.1:4185/export.svg\n'));
