import {test} from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import vm from 'node:vm';
import {Board} from '../src/model.mjs';import {changesBetween,applyChanges} from '../src/changes.mjs';import {CloudSession} from '../src/cloud-client.mjs';
const item=(id,type='shape',extra={})=>({id,type,x:10,y:10,w:50,h:50,text:id,fill:'#ffffff',...extra});
const doc=items=>({version:1,name:'Head insertion',items});
test('inserting multiple objects at the head preserves the requested document order',()=>{
 const before=doc([item('a'),item('b')]),after=doc([item('first'),item('second'),...before.items]);assert.deepEqual(applyChanges(before,changesBetween(before,after)),after);
});
test('head insertion retains concurrent creations and idempotent retries',()=>{
 const before=doc([item('a'),item('b')]),after=doc([item('head'),...before.items]),remote=doc([...before.items,item('peer')]),changes=changesBetween(before,after),merged=applyChanges(remote,changes);assert.deepEqual(merged.items.map(i=>i.id),['head','a','b','peer']);assert.deepEqual(applyChanges(merged,changes),merged);
});
test('missing or legacy undefined anchors retain append fallback',()=>{
 for(const afterId of ['gone',undefined]){const before=doc([item('a')]),result=applyChanges(before,[{kind:'create',id:'new',item:item('new'),afterId}]);assert.deepEqual(result.items.map(i=>i.id),['a','new']);}
});
test('actual application callback retains import Undo after cloud frame deletion and restoration',async()=>{
 const app=readFileSync(new URL('../public/app.mjs',import.meta.url),'utf8'),start=app.indexOf('      onDocument(doc){',app.indexOf('async function openCloud(')),end=app.indexOf('\n      onStatus(',start);assert.ok(start>=0&&end>start);
 const original=doc([item('original')]),board=new Board(original),context={board,gesture:null,deferredCloud:null,selected:[],changesBetween,applyChanges,render:()=>{}},onDocument=vm.runInNewContext('({'+app.slice(start,end)+'}).onDocument',context);
 let server={id:'test-board',userId:'alice',role:'owner',revision:0,doc:original};const session=new CloudSession(server,{events:false,onDocument,request:async(_path,{body})=>{server={...server,revision:server.revision+1,doc:applyChanges(server.doc,body.changes)};return structuredClone(server);}});
 const imported=doc([item('outer','frame',{x:0,y:0,w:800,h:600}),item('inner','frame',{x:20,y:20,w:500,h:400}),item('a'),item('b','sticky',{x:200}),item('line','connector',{x:0,y:0,w:1,h:1,from:'a',to:'b',parentId:'inner'})]);
 try{board.replace(imported);const accepted=structuredClone(board.doc);session.setDocument(board.doc);await session.flush();board.remove(['outer','inner']);session.setDocument(board.doc);await session.flush();board.undo();session.setDocument(board.doc);await session.flush();assert.deepEqual(board.doc,accepted);assert.equal(board.past.length,1);board.undo();assert.deepEqual(board.doc,original);session.setDocument(board.doc);await session.flush();assert.deepEqual(server.doc,original);board.redo();assert.deepEqual(board.doc,accepted);}finally{session.close();}
});
