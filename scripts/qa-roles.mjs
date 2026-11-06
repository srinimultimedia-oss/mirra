// Local-only synthetic QA identities. Never deploy this server or use it as authentication.
import http from 'node:http';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync,writeFileSync} from 'node:fs';
import {readFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {Readable} from 'node:stream';
import {Board} from '../src/model.mjs';
import {newTable,addRecords} from '../src/tables.mjs';
import {changesBetween} from '../src/changes.mjs';
import {boardAPI} from '../cloud/lib/board-service.ts';

const root=resolve(import.meta.dirname,'..'),port=Number(process.env.MIRRA_QA_PORT||4180),origin=`http://127.0.0.1:${port}`;
if(!Number.isInteger(port)||port<1024||port>65535)throw Error('Invalid QA port');
const sql=new DatabaseSync(':memory:');sql.exec('PRAGMA foreign_keys=ON');
for(const file of readdirSync(resolve(root,'cloud/drizzle')).filter(f=>f.endsWith('.sql')).sort())sql.exec(readFileSync(resolve(root,'cloud/drizzle',file),'utf8'));
let batchTail=Promise.resolve();
const db={prepare(query){return{bind(...args){return{async first(){return sql.prepare(query).get(...args)||null;},async all(){return{results:sql.prepare(query).all(...args)};},async run(){return{meta:{changes:Number(sql.prepare(query).run(...args).changes)}};}};}};},batch(statements){const run=batchTail.then(async()=>{sql.exec('BEGIN');try{const result=[];for(const statement of statements)result.push(await statement.run());sql.exec('COMMIT');return result;}catch(error){sql.exec('ROLLBACK');throw error;}});batchTail=run.catch(()=>{});return run;}};
const identities=Object.fromEntries(['owner','editor','commenter','viewer','outsider'].map(role=>[role,{id:'qa-'+role,email:role+'@fixture.invalid'}]));
const accountOverrides=new Map(),lostCreateResponses=new Set();
const blockedStreams=new Set(),streamResponses=new Map(),streamMetrics=new Map();
async function fixtureRequest(path,body,method='POST'){return boardAPI(new Request(origin+'/api/'+path,{method,headers:{origin,'Content-Type':'application/json','oai-authenticated-user-id':identities.owner.id,'oai-authenticated-user-email':identities.owner.email},...(body===undefined?{}:{body:JSON.stringify(body)})}),db);}
const board=new Board();board.doc.name='Role fixture — synthetic QA only';
board.add('sticky',100,100,{text:'Protected note',w:180,h:160});
board.add('table',340,100,{text:'Protected table',w:700,h:320,fill:'#ffffff',table:addRecords(newTable(),[{title:'Protected record',estimate:5}]).table});
const created=await fixtureRequest('boards',{doc:board.doc});if(!created.ok)throw Error(await created.text());const snapshot=await created.json();
for(const role of ['editor','commenter','viewer']){const result=await fixtureRequest(`boards/${snapshot.id}/members`,{email:identities[role].email,role});if(!result.ok)throw Error(await result.text());}
const urls=Object.fromEntries(Object.keys(identities).map(role=>[role,`${origin}/public/index.html?qa-role=${role}#cloud/${snapshot.id}`]));
const types={'.html':'text/html','.css':'text/css','.mjs':'text/javascript','.json':'application/json'};
const server=http.createServer(async(req,res)=>{
  try{
    const url=new URL(req.url,origin);
    if(url.pathname==='/qa/storage'){
      let message='Ready.';if(req.method==='POST'){const current=await(await fixtureRequest('boards/'+snapshot.id,undefined,'GET')).json(),remote=new Board(current.doc);remote.add('shape',110,350,{text:'Synthetic peer edit',fill:'#c7edcc'});const result=await fixtureRequest('boards/'+snapshot.id+'/changes',{operationId:crypto.randomUUID(),changes:changesBetween(current.doc,remote.doc)});message=result.ok?'Synthetic peer edit sent.':'Synthetic peer edit rejected.';}
      res.writeHead(200,{'Content-Type':'text/html','Cache-Control':'no-store'});return res.end(`<!doctype html><html lang="en"><title>Synthetic storage control</title><h1>Synthetic storage control</h1><p>Disposable local QA origin only. Fill and remove only named QA buffers; existing app data stays in place.</p><p role="status" id="status">${message}</p><button id="fill">Fill disposable device storage</button><button id="clear">Remove QA storage buffers</button><form method="post"><button>Send synthetic peer edit</button></form><script>const prefix='mirra.qa.quota.',status=document.getElementById('status');document.getElementById('fill').onclick=()=>{let count=0,last='';for(const size of [65536,1024,1]){while(count<10000){try{localStorage.setItem(prefix+count,'x'.repeat(size));count++;}catch(error){last=error.name;break;}}}status.textContent='Filled '+count+' QA buffers; storage rejected writes with '+last;};document.getElementById('clear').onclick=()=>{const keys=Object.keys(localStorage).filter(key=>key.startsWith(prefix));for(const key of keys)localStorage.removeItem(key);status.textContent='Removed '+keys.length+' QA buffers; app data retained.';};</script>`);
    }
    if(url.pathname==='/qa/connection'){
      let input=new URLSearchParams();if(req.method==='POST'){const chunks=[];for await(const chunk of req)chunks.push(chunk);input=new URLSearchParams(Buffer.concat(chunks).toString());}
      const channel=input.get('channel')||url.searchParams.get('channel')||'connection-check';if(!/^[a-zA-Z0-9_-]{1,50}$/.test(channel)){res.writeHead(400);return res.end('Invalid QA channel');}
      if(input.get('action')==='disconnect'){blockedStreams.add(channel);for(const response of streamResponses.get(channel)||[])response.destroy();}else if(input.get('action')==='restore')blockedStreams.delete(channel);
      const metrics=streamMetrics.get(channel)||{opened:0,renewed:0};res.writeHead(200,{'Content-Type':'text/html','Cache-Control':'no-store'});return res.end(`<!doctype html><html lang="en"><title>Synthetic connection control</title><h1>Synthetic connection control</h1><p>Disposable local QA only; this does not change production connectivity.</p><p role="status">Channel ${channel}: ${blockedStreams.has(channel)?'disconnected':'connected'}. Opened streams: ${metrics.opened}. Planned renewals: ${metrics.renewed}.</p><form method="post"><input type="hidden" name="channel" value="${channel}"><button name="action" value="disconnect">Disconnect cloud connection</button><button name="action" value="restore">Restore cloud connection</button></form>`);
    }
    if(url.pathname==='/qa/account'){
      let input=new URLSearchParams();if(req.method==='POST'){const chunks=[];for await(const chunk of req)chunks.push(chunk);input=new URLSearchParams(Buffer.concat(chunks).toString());}
      const channel=input.get('channel')||url.searchParams.get('channel')||'account-switch';
      if(!/^[a-zA-Z0-9_-]{1,50}$/.test(channel)){res.writeHead(400);return res.end('Invalid QA channel');}
      const role=input.get('role');if(role&&Object.hasOwn(identities,role))accountOverrides.set(channel,role);
      res.writeHead(200,{'Content-Type':'text/html','Cache-Control':'no-store'});return res.end(`<!doctype html><html lang="en"><title>Synthetic identity control</title><h1>Synthetic identity control</h1><p>Local QA only. This is not production authentication.</p><p role="status">Channel ${channel}: ${accountOverrides.get(channel)||'original identity'}</p><form method="post"><input type="hidden" name="channel" value="${channel}">${Object.keys(identities).map(value=>`<button name="role" value="${value}">Switch to ${value}</button>`).join('')}</form></html>`);
    }
    if(url.pathname.startsWith('/api/')){
      const context=new URL(req.headers.referer||origin),role=accountOverrides.get(context.searchParams.get('qa-channel'))||context.searchParams.get('qa-role')||'owner',user=identities[role]||identities.outsider;
      const streamChannel=context.searchParams.get('qa-channel');if(blockedStreams.has(streamChannel)&&(url.pathname.endsWith('/events')||url.pathname.endsWith('/changes')&&req.method==='POST')){res.writeHead(503,{'Content-Type':'application/json'});return res.end(JSON.stringify({error:'Synthetic cloud connection interrupted'}));}
      const chunks=[];let size=0;for await(const chunk of req){size+=chunk.length;if(size>4_000_000){res.writeHead(413);return res.end('QA request too large');}chunks.push(chunk);}
      const headers=new Headers(req.headers);headers.set('oai-authenticated-user-id',user.id);headers.set('oai-authenticated-user-email',user.email);
      if(url.pathname==='/api/boards'&&req.method==='POST'&&context.searchParams.get('qa-delay')==='create')await new Promise(resolve=>setTimeout(resolve,750));
      if(/\/members$/.test(url.pathname)&&['POST','DELETE'].includes(req.method)&&context.searchParams.get('qa-delay')==='members')await new Promise(resolve=>setTimeout(resolve,3000));
      if(/\/voting\/[^/]+\/ballot$/.test(url.pathname)&&req.method==='PUT'&&context.searchParams.get('qa-delay')==='ballot')await new Promise(resolve=>setTimeout(resolve,3000));
      const response=await boardAPI(new Request(url,{method:req.method,headers,...(!['GET','HEAD'].includes(req.method)?{body:Buffer.concat(chunks)}:{})}),db);
      if(url.pathname==='/api/boards'&&req.method==='POST'&&response.ok&&context.searchParams.get('qa-delay')==='lost-create'){
        const operationId=JSON.parse(Buffer.concat(chunks).toString()).operationId,key=user.id+':'+operationId;
        if(!lostCreateResponses.has(key)){lostCreateResponses.add(key);res.writeHead(502,{'Content-Type':'application/json'});return res.end(JSON.stringify({error:'Simulated gateway response lost after creation committed'}));}
      }
      res.writeHead(response.status,Object.fromEntries(response.headers));if(!response.body)return res.end();const stream=Readable.fromWeb(response.body);
      if(url.pathname.endsWith('/events')&&streamChannel&&response.ok){const metrics=streamMetrics.get(streamChannel)||{opened:0,renewed:0};metrics.opened++;streamMetrics.set(streamChannel,metrics);const responses=streamResponses.get(streamChannel)||new Set();responses.add(res);streamResponses.set(streamChannel,responses);stream.on('data',chunk=>{if(chunk.toString().includes('event: renew\n'))metrics.renewed++;});res.on('close',()=>responses.delete(res));}
      res.on('close',()=>stream.destroy());stream.on('error',()=>res.destroy());return stream.pipe(res);
    }
    const pathname=decodeURIComponent(url.pathname),file=resolve(root,'.'+(pathname==='/'?'/public/index.html':pathname));
    if(!file.startsWith(root+sep)||!['public','src'].some(dir=>file.startsWith(resolve(root,dir)+sep))){res.writeHead(403);return res.end('Forbidden');}
    const body=await readFile(file);res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(body);
  }catch(error){res.writeHead(500);res.end('QA fixture error');process.stderr.write(String(error)+'\n');}
});
server.listen(port,'127.0.0.1',()=>{writeFileSync(resolve(root,`replica/qa-fixtures/roles-${port}.json`),JSON.stringify({synthetic:true,boardId:snapshot.id,urls},null,2));process.stdout.write(JSON.stringify({synthetic:true,boardId:snapshot.id,urls})+'\n');});
