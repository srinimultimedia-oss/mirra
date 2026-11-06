import {test} from 'node:test';import assert from 'node:assert/strict';import {CloudSession} from '../src/cloud-client.mjs';import {Board} from '../src/model.mjs';import {FollowController} from '../src/follow.mjs';
const view={x:100,y:200,w:800,h:600},leader='leader-client-123';
function fixture(options={}){return new CloudSession({id:'board',userId:'alice',doc:new Board().doc,role:'owner',revision:4},{events:false,...options});}
function message(session,patch={}){return{userId:'alice',boardId:'board',clientId:session.clientId,id:'attention-command-123',from:leader,createdAt:1000,serverTime:1500,...patch};}
test('attention is scoped, time-limited and consumed once; local stop is never undone by replay',()=>{
 const controller=new FollowController(),people=[{client_id:leader,viewport:view}],context={scope:'alice/board',self:'self',people,size:{width:800,height:600}},session=fixture({onAttention:data=>controller.start(data.from,context)}),before=structuredClone(session.local);
 for(const patch of [{boardId:'other'},{clientId:'other-client'},{createdAt:2000},{createdAt:0,serverTime:15000},{createdAt:NaN},{from:session.clientId},{id:'short'}])assert.equal(session.receiveAttention(message(session,patch)),false);
 assert.equal(session.receiveAttention(message(session)),true);assert.deepEqual(controller.update(context),{x:-100,y:-200,z:1});controller.stop();assert.equal(session.receiveAttention(message(session)),false);assert.equal(controller.update(context),null);assert.deepEqual(session.local,before);assert.equal(session.base.revision,4);session.close();assert.equal(session.receiveAttention(message(session,{id:'attention-command-456'})),false);
});
test('foreign identity in a matching client/board event closes the session without navigation',()=>{
 let delivered=0;const session=fixture({onAttention:()=>delivered++});assert.equal(session.receiveAttention(message(session,{userId:'bob'})),false);assert.equal(session.closed,true);assert.equal(delivered,0);
});
test('stream renewal cannot replay a stopped bring or deliver retired-source commands',t=>{
 const sources=[];class Events{constructor(url){this.url=url;this.handlers={};sources.push(this);}addEventListener(name,fn){this.handlers[name]=fn;}close(){this.closed=true;}emit(name,data){this.handlers[name]({data:JSON.stringify(data)});}}
 const previous=globalThis.EventSource;globalThis.EventSource=Events;t.after(()=>{if(previous===undefined)delete globalThis.EventSource;else globalThis.EventSource=previous;});let delivered=0;const session=fixture({events:true,onAttention:()=>delivered++,request:async()=>({})});try{const first=session.source;assert.match(first.url,new RegExp('clientId='+session.clientId));first.emit('attention',message(session));assert.equal(delivered,1);first.emit('renew',{boardId:'board',userId:'alice'});assert.notEqual(session.source,first);session.source.emit('attention',message(session));first.emit('attention',message(session,{id:'attention-command-456'}));assert.equal(delivered,1);session.source.emit('attention',message(session,{id:'attention-command-456'}));assert.equal(delivered,2);}finally{session.close();}
});
test('bring refreshes own viewport first, binds account/client and rejects readonly or closed sessions',async()=>{
 const calls=[],session=fixture({getViewport:()=>view,request:async(path,options)=>{calls.push({path,...structuredClone(options)});return path.endsWith('/attention')?{userId:'alice',boardId:'board',count:2}:{};}}),before=structuredClone(session.local);
 assert.equal((await session.bring('all')).count,2);assert.deepEqual(calls.map(c=>c.path),['boards/board/presence','boards/board/attention']);assert.deepEqual(calls[0].body.viewport,view);assert.equal(calls[1].body.clientId,session.clientId);assert.equal(calls[1].userId,'alice');assert.deepEqual(session.local,before);session.close();await assert.rejects(session.bring('all'),/permission/);
 const viewer=fixture({role:'viewer'});viewer.base.role='viewer';await assert.rejects(viewer.bring('all'),/permission/);viewer.close();
});
