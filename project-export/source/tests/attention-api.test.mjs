import{test}from'node:test';import assert from'node:assert/strict';import{DatabaseSync}from'node:sqlite';import{readFileSync,readdirSync}from'node:fs';import{boardAPI}from'../cloud/lib/board-service.ts';import{Board}from'../src/model.mjs';import{changesBetween}from'../src/changes.mjs';
function database(){const sql=new DatabaseSync(':memory:');sql.exec('PRAGMA foreign_keys=ON');for(const file of readdirSync(new URL('../cloud/drizzle',import.meta.url)).filter(f=>f.endsWith('.sql')).sort())sql.exec(readFileSync(new URL('../cloud/drizzle/'+file,import.meta.url),'utf8'));let tail=Promise.resolve();const db={prepare(query){return{bind(...args){return{async first(){return sql.prepare(query).get(...args)||null;},async all(){return{results:sql.prepare(query).all(...args)};},async run(){return{meta:{changes:Number(sql.prepare(query).run(...args).changes)}};}};}};},batch(statements){const run=tail.then(async()=>{sql.exec('BEGIN');try{const result=[];for(const statement of statements)result.push(await statement.run());sql.exec('COMMIT');return result;}catch(error){sql.exec('ROLLBACK');throw error;}});tail=run.catch(()=>{});return run;}};return{db,sql};}
const request=(db,user,path,method='GET',body)=>boardAPI(new Request('https://mirra.example/api/'+path,{method,headers:{Origin:'https://mirra.example','Content-Type':'application/json','oai-authenticated-user-id':user,'oai-authenticated-user-email':user+'@example.test'},...(body?{body:JSON.stringify(body)}:{})}),db);
async function fixture(){const f=database(),b=new Board(),ids=Array.from({length:4},(_,i)=>b.add('shape',i*20,i*10,{text:String(i)}));const snapshot=await(await request(f.db,'owner','boards','POST',{doc:b.doc})).json(),path='boards/'+snapshot.id;for(const role of ['editor','viewer'])await request(f.db,'owner',path+'/members','POST',{email:role+'@example.test',role});return{...f,b,ids,snapshot,path};}
const viewport={x:100,y:-200,w:800,h:600},ownerId='owner-client-123',editorId='editor-client-123',viewerId='viewer-client-123';
const presence=(f,user,clientId,extra={})=>request(f.db,user,f.path+'/presence','POST',{clientId,viewport,...extra});
const bring=(f,user,clientId,target)=>request(f.db,user,f.path+'/attention','POST',{clientId,target});
test('owner and editor commands address only current board clients without document history changes',async()=>{
 const f=await fixture();for(const[user,id]of [['owner',ownerId],['editor',editorId],['viewer',viewerId]])await presence(f,user,id);
 const before={...f.sql.prepare('SELECT * FROM boards').get()};
 let result=await bring(f,'owner',ownerId,viewerId);assert.equal(result.status,200);assert.equal((await result.json()).count,1);
 assert.equal(f.sql.prepare('SELECT attention_from FROM presence WHERE client_id=?').get(viewerId).attention_from,ownerId);
 assert.equal(f.sql.prepare('SELECT attention_id FROM presence WHERE client_id=?').get(editorId).attention_id,null);
 result=await bring(f,'editor',editorId,'all');assert.equal(result.status,200);assert.equal((await result.json()).count,2);
 assert.equal(f.sql.prepare('SELECT attention_from FROM presence WHERE client_id=?').get(ownerId).attention_from,editorId);assert.deepEqual({...f.sql.prepare('SELECT * FROM boards').get()},before);f.sql.close();
});
test('viewers commenters outsiders spoofed clients cross-board and expired clients cannot issue commands',async()=>{
 const f=await fixture();await request(f.db,'owner',f.path+'/members','POST',{email:'commenter@example.test',role:'commenter'});await presence(f,'owner',ownerId);await presence(f,'viewer',viewerId);
 for(const user of ['viewer','commenter'])assert.equal((await bring(f,user,viewerId,'all')).status,403);
 assert.equal((await bring(f,'outsider',ownerId,'all')).status,404);assert.equal((await bring(f,'editor',ownerId,'all')).status,409);
 for(const target of ['short',ownerId,null,{},'../secret'])assert.equal((await bring(f,'owner',ownerId,target)).status,400);
 const other=await(await request(f.db,'owner','boards','POST',{doc:f.b.doc})).json();assert.equal((await request(f.db,'owner','boards/'+other.id+'/attention','POST',{clientId:ownerId,target:viewerId})).status,409);
 f.sql.prepare('UPDATE presence SET seen_at=? WHERE client_id=?').run(Date.now()-26000,ownerId);assert.equal((await bring(f,'owner',ownerId,'all')).status,409);
 assert.equal(f.sql.prepare('SELECT count(*) AS n FROM presence WHERE attention_id IS NOT NULL').get().n,0);f.sql.close();
});
async function readAttention(f,user,clientId){const response=await request(f.db,user,f.path+'/events?clientId='+clientId),reader=response.body.getReader();let text='';while(!text.includes('event: comments')){const part=await reader.read();if(part.done)break;text+=new TextDecoder().decode(part.value);}await reader.cancel();return text;}
test('attention stream is scoped to recipient identity and expires; normal presence cannot erase or spoof commands',async()=>{
 const f=await fixture();await presence(f,'owner',ownerId);await presence(f,'viewer',viewerId);await bring(f,'owner',ownerId,viewerId);
 await presence(f,'viewer',viewerId,{attentionId:'spoofed-command',attentionFrom:editorId});
 let text=await readAttention(f,'viewer',viewerId);assert.match(text,/event: attention/);const data=JSON.parse(text.split('event: attention\ndata: ')[1].split('\n\n')[0]);assert.equal(data.from,ownerId);assert.equal(data.clientId,viewerId);assert.equal(data.userId,'viewer');assert.notEqual(data.id,'spoofed-command');
 text=await readAttention(f,'editor',viewerId);assert.doesNotMatch(text,/event: attention/);
 f.sql.prepare('UPDATE presence SET attention_at=? WHERE client_id=?').run(Date.now()-16000,viewerId);text=await readAttention(f,'viewer',viewerId);assert.doesNotMatch(text,/event: attention/);f.sql.close();
});
test('revocation immediately before command commit prevents attention writes',async()=>{
 const f=await fixture();await presence(f,'editor',editorId);await presence(f,'viewer',viewerId);const prepare=f.db.prepare.bind(f.db);let revoked=false;f.db.prepare=query=>{if(!revoked&&query.startsWith('UPDATE presence SET attention_id')){revoked=true;f.sql.prepare('DELETE FROM members WHERE board_id=? AND email=?').run(f.snapshot.id,'editor@example.test');}return prepare(query);};assert.equal((await bring(f,'editor',editorId,'all')).status,404);assert.equal(f.sql.prepare('SELECT count(*) AS n FROM presence WHERE attention_id IS NOT NULL').get().n,0);f.sql.close();
});
test('attention rate limit is separate and expired targets are excluded',async()=>{
 const f=await fixture();await presence(f,'owner',ownerId);await presence(f,'viewer',viewerId);await presence(f,'editor',editorId);f.sql.prepare('UPDATE presence SET seen_at=? WHERE client_id=?').run(Date.now()-26000,editorId);let result=await bring(f,'owner',ownerId,'all');assert.equal((await result.json()).count,1);for(let i=1;i<60;i++)assert.equal((await bring(f,'owner',ownerId,viewerId)).status,200);assert.equal((await bring(f,'owner',ownerId,viewerId)).status,429);assert.equal((await presence(f,'owner',ownerId)).status,200);f.sql.close();
});
