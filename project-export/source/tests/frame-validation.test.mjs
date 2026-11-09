import {test} from 'node:test';import assert from 'node:assert/strict';
import {Board,validateDocument} from '../src/model.mjs';
function item(id,type='frame',parentId){return{id,type,x:0,y:0,w:100,h:100,text:'café',fill:'#ffffff',...(parentId===undefined?{}:{parentId})};}
function document(items){return{version:1,name:'Frame graph',items};}
test('forward references, disconnected trees and connector endpoints retain exact input data',()=>{
 const doc=document([item('child','sticky','inner'),item('other'),item('inner','frame','outer'),item('outer'),{...item('link','connector'),from:'child',to:'other',parentId:'outer'}]),before=JSON.stringify(doc),validated=validateDocument(doc);
 assert.equal(JSON.stringify(doc),before);assert.equal(JSON.stringify(validated),before);validated.items[0].text='Independent output';assert.equal(doc.items[0].text,'café');
});
test('missing, non-frame, self, disconnected cycle and forward cycle reject without mutation',()=>{
 for(const items of [[item('a','frame','missing')],[item('a','frame','b'),item('b','sticky')],[item('a','frame','a')],[item('root'),item('a','frame','b'),item('b','frame','a')],[item('leaf','shape','a'),item('a','frame','b'),item('b','frame','c'),item('c','frame','a')]]){const doc=document(items),before=JSON.stringify(doc);assert.throws(()=>validateDocument(doc),/frame parent|Cyclic/);assert.equal(JSON.stringify(doc),before);}
});
test('a large shared ancestry graph validates every branch and still detects a later disconnected cycle',()=>{
 const frames=Array.from({length:500},(_,i)=>item('f'+i,'frame',i?'f'+(i-1):undefined)),leaves=Array.from({length:1000},(_,i)=>item('n'+i,'sticky','f499')),doc=document([...leaves,...frames]);assert.equal(validateDocument(doc).items.length,1500);doc.items.push(item('bad-a','frame','bad-b'),item('bad-b','frame','bad-a'));assert.throws(()=>validateDocument(doc),/Cyclic/);
});
test('invalid hierarchy transactions preserve document and undo/redo history',()=>{
 const board=new Board(),outer=board.add('frame',0,0,{w:500,h:500}),inner=board.add('frame',20,20,{w:300,h:300});board.add('sticky',50,50);board.undo();const before=structuredClone({doc:board.doc,past:board.past,future:board.future});
 assert.throws(()=>board.transact(doc=>{doc.items.find(i=>i.id===outer).parentId=inner;}),/Cyclic/);assert.deepEqual({doc:board.doc,past:board.past,future:board.future},before);
});
test('indexed validation agrees with independent parent walks across deterministic generated graphs',()=>{
 let seed=20261106;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 function reference(items){for(const entry of items){if(entry.parentId===undefined)continue;const parent=items.find(i=>i.id===entry.parentId);if(!parent||parent.type!=='frame'||parent===entry)return false;const seen=new Set([entry.id]);let node=parent;while(node){if(seen.has(node.id))return false;seen.add(node.id);node=items.find(i=>i.id===node.parentId);}}return true;}
 for(let run=0;run<2000;run++){const items=Array.from({length:20},(_,i)=>item('i'+i,random()<.8?'frame':'shape'));for(const entry of items)if(random()<.6)entry.parentId=random()<.05?'missing':'i'+Math.floor(random()*items.length);let accepted=true;try{validateDocument(document(items));}catch{accepted=false;}assert.equal(accepted,reference(items),'generated graph '+run);}
});
