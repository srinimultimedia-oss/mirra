import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Board,validateDocument} from '../src/model.mjs';
import {changesBetween,applyChanges} from '../src/changes.mjs';
const object=(id,type='shape',extra={})=>({id,type,x:100,y:100,w:100,h:100,text:id,fill:'#ffffff',...extra});
const fixture=()=>new Board({version:1,name:'Clipboard order',items:[object('frame','frame',{x:0,y:0,w:800,h:600}),object('a'),object('attached','connector',{from:'a',to:'b',parentId:'frame'}),object('b','sticky',{x:400}),object('free','connector',{from:{x:150,y:350},to:{x:450,y:350},parentId:'frame',locked:true}),object('c','text',{x:200,y:400})]});
const names=doc=>doc.items.map(i=>i.text);
test('copy preserves interleaved implicitly included connectors in source order',()=>{
 const board=fixture(),before=structuredClone(board.doc),copied=JSON.parse(board.copySelection(['c','b','a']));
 assert.deepEqual(names(copied),['a','attached','b','c']);validateDocument(copied);assert.equal(copied.items[1].parentId,undefined);assert.deepEqual(board.doc,before);
});
test('copying a frame preserves all descendant stacking and valid connector ownership',()=>{
 const board=fixture(),copied=JSON.parse(board.copySelection(['frame']));assert.deepEqual(names(copied),names(board.doc));validateDocument(copied);assert.equal(copied.items.find(i=>i.id==='free').parentId,'frame');
});
test('duplicate preserves source order and remaps frame parents and attached endpoints',()=>{
 const board=fixture(),before=structuredClone(board.doc),ids=board.duplicate(['frame']),copies=board.doc.items.filter(i=>ids.includes(i.id)),byName=new Map(copies.map(i=>[i.text,i]));
 assert.deepEqual(copies.map(i=>i.text),names(before));assert.equal(new Set(board.doc.items.map(i=>i.id)).size,12);assert.equal(byName.get('attached').from,byName.get('a').id);assert.equal(byName.get('attached').to,byName.get('b').id);assert.equal(byName.get('free').parentId,byName.get('frame').id);assert.equal(byName.get('free').locked,false);
 assert.deepEqual(applyChanges(before,changesBetween(before,board.doc)),board.doc);const after=structuredClone(board.doc);board.undo();assert.deepEqual(board.doc,before);board.redo();assert.deepEqual(board.doc,after);
});
test('connector-only copy detaches external parents and endpoints without changing line order',()=>{
 const board=fixture(),copied=JSON.parse(board.copySelection(['free','attached']));assert.deepEqual(names(copied),['attached','free']);validateDocument(copied);for(const item of copied.items){assert.equal(item.parentId,undefined);assert.equal(typeof item.from,'object');assert.equal(typeof item.to,'object');}
});
test('cross-board paste retains ordering above existing content and source bytes stay unchanged',()=>{
 const source=fixture(),raw=source.copySelection(['frame']),target=new Board({version:1,name:'Destination',items:[object('existing')]}),before=structuredClone(target.doc),ids=target.pasteSelection(raw,1000,1200);
 assert.deepEqual(names(target.doc),['existing',...names(source.doc)]);assert.equal(ids.length,6);assert.equal(source.copySelection(['frame']),raw);assert.deepEqual(applyChanges(before,changesBetween(before,target.doc)),target.doc);
});
