import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {spawnSync} from 'node:child_process';
import {mkdtemp, mkdir, writeFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {Readable} from 'node:stream';
import {fileURLToPath} from 'node:url';
import {readSidebarPreference,writeSidebarPreference} from '../cloud/lib/sidebar-preference.mjs';
import {connectorPreview} from '../cloud/scripts/vite/connector-preview-plugin.mjs';
const require=createRequire(new URL('../cloud/package.json',import.meta.url));

test('sidebar preferences preserve false/true, expire, and tolerate malformed or blocked storage',()=>{
 const values=new Map();const storage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)};
 assert.equal(readSidebarPreference(storage,1000),null);
 for(const open of [false,true]){writeSidebarPreference(storage,open,1000);assert.equal(readSidebarPreference(storage,1001),open);}
 assert.equal(readSidebarPreference(storage,1000+7*86400000),null);
 const key=[...values.keys()][0];for(const bad of ['{','null','{"open":"false","expiresAt":2000}','{"open":false,"expiresAt":1e100}']){values.set(key,bad);assert.equal(readSidebarPreference(storage,1000),null);}
 const blocked={getItem(){throw Error('Blocked')},setItem(){throw Error('Quota')}};
 assert.equal(readSidebarPreference(blocked),null);assert.doesNotThrow(()=>writeSidebarPreference(blocked,false));
});

test('connector preview applies a deny-all CSP to rejected, failed and successful JSON responses',async()=>{
 const directory=await mkdtemp(join(tmpdir(),'mirra-preview-security-'));
 try{
  const plugin=connectorPreview(),handlers=new Map();plugin.configResolved({root:directory});
  plugin.configureServer({config:{server:{port:5179}},middlewares:{use:(path,fn)=>handlers.set(path,fn)}});
  const source=plugin.load.call({environment:{name:'ssr'}},'\0virtual:sites-connector-preview',{ssr:true});
  const token=source.match(/"X-Sites-Preview": "([0-9a-f-]+)"/)[1];
  const invoke=async(path,method,authorized,body='')=>{
   const request=Readable.from([Buffer.from(body)]);request.method=method;request.headers={'content-length':String(Buffer.byteLength(body)),...(authorized?{'x-sites-preview':token}:{})};
   const headers=new Map();let payload;const response={statusCode:200,setHeader:(k,v)=>headers.set(k.toLowerCase(),v),end:value=>{payload=JSON.parse(value)}};
   await handlers.get(path)(request,response);
   assert.equal(headers.get('content-security-policy'),"default-src 'none'; frame-ancestors 'none'; base-uri 'none'");assert.equal(headers.get('x-content-type-options'),'nosniff');assert.equal(headers.get('cache-control'),'no-store');assert.ok(headers.get('strict-transport-security').includes('max-age=31536000'));
   return {status:response.statusCode,payload};
  };
  const context='/__sites_connector_preview/context',action='/__sites_connector_preview/invoke';
  for(const endpoint of [context,action])assert.equal((await invoke(endpoint,'GET',false)).status,403);
  assert.equal((await invoke(context,'GET',true)).payload.status,'binding_unavailable');
  const root=join(directory,'.sites-runtime','connector-preview');await mkdir(root,{recursive:true});
  await writeFile(join(root,'session.json'),JSON.stringify({id:'12345678-1234-1234-1234-123456789abc',timeoutMs:100,expiresAt:Date.now()+10000,connectorIds:['test-connector']}));
  assert.deepEqual((await invoke(context,'GET',true)).payload,{status:'success',connectors:[{connectorId:'test-connector',policy:'enabled',tools:null}]});
  assert.equal((await invoke(action,'POST',true,'{')).payload.status,'binding_unavailable');
 }finally{await rm(directory,{recursive:true,force:true});}
});

test('braces depth, cyclic and oversized AST attacks fail with explicit limits in isolated execution',()=>{
 const script=`const assert=require('node:assert/strict');const braces=require(${JSON.stringify(require.resolve('braces'))});
 const deep='{'.repeat(4000)+'a'+'}'.repeat(4000);
 for(const method of ['parse','compile','expand','stringify'])assert.throws(()=>braces[method](deep,{maxLength:Infinity,rangeLimit:false}),/safe depth/);
 let ast={type:'root',nodes:[]},node=ast;for(let i=0;i<5000;i++){const child={type:'brace',nodes:[]};node.nodes.push(child);node=child;}
 for(const method of ['compile','expand','stringify'])assert.throws(()=>braces[method](ast),/safe depth/);
 const cycle={type:'root',nodes:[]};cycle.nodes.push(cycle);
 for(const method of ['compile','expand','stringify'])assert.throws(()=>braces[method](cycle),/cycle/);
 assert.throws(()=>braces.compile({type:'root',nodes:Array.from({length:65537},()=>({type:'text',value:'a'}))}),/safe node/);
 console.log('BRACES_LIMIT_PASS');`;
 const result=spawnSync(process.execPath,['-e',script],{timeout:3000,encoding:'utf8'});assert.ifError(result.error);assert.equal(result.status,0,result.stderr);assert.match(result.stdout,/BRACES_LIMIT_PASS/);
});

test('patched braces retains ranges, nested alternatives, escaped literals, micromatch and fast-glob compatibility',()=>{
 const braces=require('braces'),micromatch=require('micromatch');
 assert.deepEqual(braces.expand('src/{a,{b,c}}/{1..2}.js'),['src/a/1.js','src/a/2.js','src/b/1.js','src/b/2.js','src/c/1.js','src/c/2.js']);
 assert.equal(braces.compile('src/{a,b}.js'),'src/(a|b).js');
 assert.deepEqual(braces.expand('\\{literal\\}'),['{literal}']);
 assert.deepEqual(micromatch(['a.js','b.ts','c.css'],'*.{js,ts}'),['a.js','b.ts']);
 assert.deepEqual(micromatch.braceExpand('x{01..03}'),['x01','x02','x03']);
 const matches=require('fast-glob').sync(['app/**/*.{ts,tsx}','!**/node_modules/**'],{cwd:fileURLToPath(new URL('../cloud/',import.meta.url))});assert.ok(matches.some(x=>x.endsWith('page.tsx')));
});
