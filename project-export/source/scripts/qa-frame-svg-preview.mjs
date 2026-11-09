import {securityHeaders} from '../src/security-headers.mjs';
// Loopback-only artifact inspection; never included in cloud publication.
import http from 'node:http';
import {readFileSync} from 'node:fs';
const file=new URL('../replica/qa-frame-typography.svg',import.meta.url);
http.createServer((req,res)=>{for(const [key,value]of Object.entries(securityHeaders()))res.setHeader(key,value);if(req.url!=='/frame.svg'){res.writeHead(404);return res.end();}res.writeHead(200,{'Content-Type':'image/svg+xml','Cache-Control':'no-store'});res.end(readFileSync(file));}).listen(4186,'127.0.0.1',()=>process.stdout.write('Frame SVG preview: http://127.0.0.1:4186/frame.svg\n'));
