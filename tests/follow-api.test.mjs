import{test}from'node:test';import assert from'node:assert/strict';import{DatabaseSync}from'node:sqlite';import{readFileSync,readdirSync}from'node:fs';import{boardAPI}from'../cloud/lib/board-service.ts';import{Board}from'../src/model.mjs';import{changesBetween}from'../src/changes.mjs';
function database(){const sql=new DatabaseSync(':memory:');sql.exec('PRAGMA foreign_keys=ON');for(const file of readdirSync(new URL('../cloud/drizzle',import.meta.url)).filter(f=>f.endsWith('.sql')).sort())sql.exec(readFileSync(new URL('../cloud/drizzle/'+file,import.meta.url),'utf8'));let tail=Promise.resolve();const db={prepare(query){return{bind(...args){return{async first(){return sql.prepare(query).get(...args)||null;},async all(){return{results:sql.prepare(query).all(...args)};},async run(){return{meta:{changes:Number(sql.prepare(query).run(...args).changes)}};}};}};},batch(statements){const run=tail.then(async()=>{sql.exec('BEGIN');try{const result=[];for(const statement of statements)result.push(await statement.run());sql.exec('COMMIT');return result;}catch(error){sql.exec('ROLLBACK');throw error;}});tail=run.catch(()=>{});return run;}};return{db,sql};}
const request=(db,user,path,method='GET',body)=>boardAPI(new Request('https://mirra.example/api/'+path,{method,headers:{Origin:'https://mirra.example','Content-Type':'application/json','oai-authenticated-user-id':user,'oai-authenticated-user-email':user+'@example.test'},...(body?{body:JSON.stringify(body)}:{})}),db);
async function fixture(){const f=database(),b=new Board(),ids=Array.from({length:4},(_,i)=>b.add('shape',i*20,i*10,{text:String(i)}));const snapshot=await(await request(f.db,'owner','boards','POST',{doc:b.doc})).json(),path='boards/'+snapshot.id;for(const role of ['editor','viewer'])await request(f.db,'owner',path+'/members','POST',{email:role+'@example.test',role});return{...f,b,ids,snapshot,path};}
const viewport={x:100,y:-200,w:800,h:600},ownerId='owner-client-123',editorId='editor-client-123',viewerId='viewer-client-123';
const presence=(f,user,clientId,extra={})=>request(f.db,user,f.path+'/presence','POST',{clientId,viewport,...extra});
test('all roles share authenticated ephemeral viewports without board revisions',async()=>{
 const f=await fixture(),before={...f.sql.prepare('SELECT * FROM boards').get()};
 assert.equal((await presence(f,'owner',ownerId)).status,200);
 assert.equal((await presence(f,'editor',editorId,{followingClientId:ownerId})).status,200);
 assert.equal((await presence(f,'viewer',viewerId,{followingClientId:editorId,name:'Spoof'})).status,200);
 const rows=f.sql.prepare('SELECT * FROM presence ORDER BY user_id').all();assert.equal(rows.length,3);assert.equal(rows.find(r=>r.user_id==='viewer').name,'viewer');assert.equal(rows.find(r=>r.user_id==='viewer').following_client_id,editorId);
 assert.deepEqual(JSON.parse(rows[0].viewport),viewport);assert.deepEqual({...f.sql.prepare('SELECT * FROM boards').get()},before);
 const stream=await request(f.db,'viewer',f.path+'/events'),reader=stream.body.getReader();let text='';
 while(!text.includes('event: presence'))text+=new TextDecoder().decode((await reader.read()).value);
 const event=JSON.parse(text.split('event: presence\ndata: ')[1].split('\n\n')[0]);assert.equal(event.find(p=>p.client_id===editorId).followingClientId,ownerId);assert.deepEqual(event[0].viewport,viewport);assert.equal(event[0].user_id,undefined);await reader.cancel();f.sql.close();
});
test('invalid geometry, self-follow, foreign clients and cross-board targets fail',async()=>{
 const f=await fixture();assert.equal((await presence(f,'owner',ownerId)).status,200);
 for(const invalid of [{viewport:{...viewport,w:0}},{viewport:{...viewport,x:2e7+1}},{viewport:{...viewport,extra:1}},{followingClientId:ownerId},{followingClientId:'short'},{viewport:null,followingClientId:editorId}])assert.equal((await presence(f,'owner',ownerId,invalid)).status,400);
 assert.equal((await presence(f,'outsider',editorId)).status,404);assert.equal((await presence(f,'editor',ownerId,{x:999})).status,409);assert.equal(f.sql.prepare('SELECT x FROM presence WHERE client_id=?').get(ownerId).x,null);
 const other=await(await request(f.db,'owner','boards','POST',{doc:f.b.doc})).json();
 assert.equal((await request(f.db,'owner','boards/'+other.id+'/presence','POST',{clientId:editorId,viewport,followingClientId:ownerId})).status,409);assert.equal(f.sql.prepare('SELECT count(*) AS n FROM presence').get().n,1);f.sql.close();
});
test('atomic opposing follows reject cycles and expired or departed targets',async()=>{
 const f=await fixture();await presence(f,'owner',ownerId);await presence(f,'editor',editorId);
 const results=await Promise.all([presence(f,'owner',ownerId,{followingClientId:editorId}),presence(f,'editor',editorId,{followingClientId:ownerId})]);assert.deepEqual(results.map(r=>r.status).sort(),[200,409]);
 await presence(f,'owner',ownerId,{followingClientId:null});await presence(f,'editor',editorId,{followingClientId:ownerId});assert.equal((await presence(f,'owner',ownerId,{followingClientId:editorId})).status,409);
 f.sql.prepare('UPDATE presence SET seen_at=? WHERE client_id=?').run(Date.now()-26000,ownerId);assert.equal((await presence(f,'viewer',viewerId,{followingClientId:editorId})).status,409);
 await presence(f,'owner',ownerId);await presence(f,'owner',ownerId,{leaving:true});assert.equal((await presence(f,'viewer',viewerId,{followingClientId:ownerId})).status,409);f.sql.close();
});
