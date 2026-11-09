import {test} from 'node:test';import assert from 'node:assert/strict';import {Board,validateDocument} from '../src/model.mjs';import {changesBetween,applyChanges} from '../src/changes.mjs';
const item=(id,type,x,y,w,h,extra={})=>({id,type,x,y,w,h,text:id+' café',fill:'#ffffff',...extra});
function fixture(){return new Board({version:1,name:'Frame deletion',items:[item('outer','frame',0,0,1000,800),item('inner','frame',50,50,500,400),item('a','shape',100,100,80,80),item('b','sticky',300,100,80,80),item('attached','connector',0,0,1,1,{from:'a',to:'b',parentId:'inner'}),item('free','connector',0,0,1,1,{from:{x:150,y:250},to:{x:350,y:250},parentId:'inner',locked:true})]});}
test('deleting inner frame reparents explicit connectors while retaining content geometry and undo',()=>{
 const board=fixture(),before=structuredClone(board.doc);board.remove(['inner']);validateDocument(board.doc);for(const id of ['attached','free']){const original=before.items.find(i=>i.id===id),current=board.doc.items.find(i=>i.id===id);assert.deepEqual(current,{...original,parentId:'outer'});}assert.equal(board.doc.items.length,5);assert.deepEqual(applyChanges(before,changesBetween(before,board.doc)),board.doc);board.undo();assert.deepEqual(board.doc,before);board.redo();assert.equal(board.doc.items.find(i=>i.id==='free').parentId,'outer');
});
test('deleting all owning frames clears connector ownership but keeps locked and portable contents',()=>{
 const board=fixture(),before=structuredClone(board.doc);board.remove(['outer','inner']);assert.equal(board.doc.items.length,4);for(const id of ['a','b','attached','free']){const original=structuredClone(before.items.find(i=>i.id===id));delete original.parentId;assert.deepEqual(board.doc.items.find(i=>i.id===id),original);}validateDocument(board.doc);board.undo();assert.deepEqual(board.doc,before);
});
test('surviving nested owners and locked frames keep their connector ownership unchanged',()=>{
 const board=fixture();board.update(['inner'],{locked:true});board.remove(['outer','inner']);assert.ok(board.doc.items.some(i=>i.id==='inner'));assert.equal(board.doc.items.find(i=>i.id==='attached').parentId,'inner');assert.equal(board.doc.items.find(i=>i.id==='free').parentId,'inner');assert.equal(board.doc.items.find(i=>i.id==='inner').parentId,undefined);validateDocument(board.doc);
});
test('selected connectors and endpoint-dependent lines still delete while free lines survive frame removal',()=>{
 const board=fixture();board.remove(['inner','a']);assert.equal(board.doc.items.some(i=>i.id==='a'||i.id==='attached'),false);assert.ok(board.doc.items.some(i=>i.id==='free'));assert.equal(board.doc.items.find(i=>i.id==='free').parentId,'outer');board.update(['free'],{locked:false});board.remove(['free']);assert.equal(board.doc.items.some(i=>i.id==='free'),false);validateDocument(board.doc);
});
test('deleting multiple intermediate owners finds the nearest surviving frame ancestor',()=>{
 const board=fixture(),middle=board.add('frame',20,20,{w:750,h:600});assert.equal(board.doc.items.find(i=>i.id==='inner').parentId,middle);board.remove(['inner',middle]);for(const id of ['attached','free'])assert.equal(board.doc.items.find(i=>i.id===id).parentId,'outer');validateDocument(board.doc);
});
test('many connectors sharing a deep deleted frame chain keep their endpoints and Undo data',()=>{
 const frames=Array.from({length:1000},(_,i)=>item('f'+i,'frame',0,0,1001-i,1001-i)),lines=Array.from({length:2000},(_,i)=>item('l'+i,'connector',0,0,1,1,{from:{x:1,y:1},to:{x:2,y:2},parentId:'f999',locked:!!(i%2)})),board=new Board({version:1,name:'Shared deletion ancestry',items:[...frames,...lines]}),before=structuredClone(board.doc);board.remove(frames.map(f=>f.id));assert.equal(board.doc.items.length,2000);for(const line of board.doc.items){assert.equal(line.parentId,undefined);assert.deepEqual(line.from,{x:1,y:1});assert.deepEqual(line.to,{x:2,y:2});}board.undo();assert.deepEqual(board.doc,before);
});
