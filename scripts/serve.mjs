import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
const root = resolve(import.meta.dirname, '..');
const types = { '.html': 'text/html', '.css': 'text/css', '.mjs': 'text/javascript', '.json': 'application/json' };
const server = http.createServer(async (req,res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const file = resolve(root, '.' + (pathname === '/' ? '/public/index.html' : pathname));
    if (!file.startsWith(root + sep) || !['public','src'].some(dir => file.startsWith(resolve(root,dir)+sep))) { res.writeHead(403); return res.end('Forbidden'); }
    const body = await readFile(file); res.writeHead(200, {'Content-Type': types[extname(file)] || 'application/octet-stream', 'Cache-Control':'no-store', 'X-Content-Type-Options':'nosniff'}); res.end(body);
  } catch { res.writeHead(404); res.end('Not found'); }
});
server.listen(Number(process.env.PORT || 4173),'127.0.0.1',() => console.log(`Mirra local preview: http://127.0.0.1:${server.address().port}`));
