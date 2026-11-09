// Local-only synthetic SVG inspection. Never part of the hosted application.
import http from 'node:http';import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';import {fileURLToPath} from 'node:url';
import {securityHeaders} from '../src/security-headers.mjs';
export function createArtifactServer(file){
 return http.createServer((req,res)=>{
  for(const [key,value]of Object.entries(securityHeaders()))res.setHeader(key,value);
  const target=req.url==='/artifact.svg'?file:/^\/qa-[a-z0-9-]+\.svg$/.test(req.url)?new URL('../replica/'+req.url.slice(1),import.meta.url):null;
  if(!target){res.writeHead(404);return res.end();}let bytes;try{bytes=readFileSync(target);}catch{res.writeHead(404);return res.end();}
  res.writeHead(200,{'Content-Type':'image/svg+xml','Cache-Control':'no-store'});res.end(bytes);
 });
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const [portText,name]=process.argv.slice(2),port=Number(portText);
 if(!Number.isInteger(port)||port<1024||port>65535||!/^qa-[a-z0-9-]+\.svg$/.test(name))throw Error('Provide a loopback port and a synthetic QA SVG basename');
 const file=new URL('../replica/'+name,import.meta.url);readFileSync(file);
 createArtifactServer(file).listen(port,'127.0.0.1',()=>process.stdout.write(`QA SVG: http://127.0.0.1:${port}/artifact.svg\n`));
}
