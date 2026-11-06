import {test} from 'node:test';import assert from 'node:assert/strict';
import {Board,reconcileFrames} from '../src/model.mjs';import {frameContains} from '../src/geometry.mjs';
const item=(id,type,x,y,w,h,extra={})=>({id,type,x,y,w,h,text:'café',fill:'#ffffff',...extra});
function exhaustive(doc){const frames=doc.items.filter(i=>i.type==='frame');for(const entry of doc.items){if(entry.type==='connector')continue;const parent=frames.filter(f=>f.id!==entry.id&&f.w*f.h>entry.w*entry.h&&frameContains(f,entry)).sort((a,b)=>a.w*a.h-b.w*b.h||(a.id===entry.parentId?-1:b.id===entry.parentId?1:a.id.localeCompare(b.id)))[0];if(parent)entry.parentId=parent.id;else delete entry.parentId;}return doc;}
function compare(items){const actual={version:1,name:'Containment',items:structuredClone(items)},expected=exhaustive(structuredClone(actual));reconcileFrames(actual);assert.deepEqual(actual,expected);return actual;}
test('rotation, smallest enclosing frame, preferred equal-area parent and unchanged connector metadata',()=>{
 const items=[item('a','frame',0,0,400,400),item('b','frame',0,0,400,400),item('inner','frame',40,40,100,100),item('note','sticky',60,60,20,20,{parentId:'b'}),item('tie','shape',200,200,20,20,{parentId:'b'}),item('rot','frame',800,100,400,200,{rotation:45}),item('rot-note','sticky',950,160,100,80,{rotation:45}),{...item('link','connector',0,0,1,1,{parentId:'b'}),from:'note',to:'rot-note'}];
 const doc=compare(items);assert.equal(doc.items.find(i=>i.id==='note').parentId,'inner');assert.equal(doc.items.find(i=>i.id==='tie').parentId,'b');assert.equal(doc.items.find(i=>i.id==='rot-note').parentId,'rot');assert.deepEqual(doc.items.at(-1),items.at(-1));
});
test('stable source order survives locale-equivalent ID ties and input reordering',()=>{
 const a=item('é','frame',0,0,400,400),b=item('e\u0301','frame',0,0,400,400),other=Array.from({length:30},(_,i)=>item('extra'+i,'frame',1000+i*200,0,100,100)),note=item('note','sticky',20,20,20,20);
 for(const entries of [[a,b,...other,note],[b,a,...other,note],[...other,b,a,note]])compare(entries);
 assert.equal(compare([b,a,...other,note]).items.at(-1).parentId,b.id);
});
test('axis-aligned and rotated tolerance boundaries, negative coordinates and very large valid geometry match exact rules',()=>{
 const frames=[item('large','frame',-10000000,-10000000,10000000,10000000,{rotation:37}),item('axis','frame',-300,-300,200,200),item('turned','frame',500,500,100,100,{rotation:45})],notes=[];
 for(const delta of [-2e-7,-5e-8,0,5e-8,2e-7])notes.push(item('n'+delta,'sticky',-300+delta,-250,20,20));
 for(const delta of [-2e-7,-5e-8,0,5e-8,2e-7]){const offset=(45+delta)/Math.sqrt(2);notes.push(item('rot-edge'+delta,'shape',545+offset,545+offset,10,10,{rotation:45}));}
 notes.push(item('large-center','sticky',-5000001,-5000001,2,2,{rotation:37}));
 notes.push(item('inside-turned','shape',540,540,20,20,{rotation:45}),item('outside-turned','shape',500,500,90,90));compare([...frames,...notes]);compare([item('same','frame',0,0,20,20),item('equal','sticky',0,0,20,20,{parentId:'same'})]);
});
test('deterministic generated boards match exhaustive containment across overlapping and rotated layouts',()=>{
 let seed=1793923200;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 for(let run=0;run<500;run++){const frames=Array.from({length:35},(_,i)=>item('f'+i,'frame',Math.floor(random()*1000)-500,Math.floor(random()*1000)-500,50+Math.floor(random()*600),50+Math.floor(random()*600),{rotation:random()*720-360})),notes=Array.from({length:35},(_,i)=>item('n'+i,'sticky',Math.floor(random()*1000)-500,Math.floor(random()*1000)-500,10+Math.floor(random()*60),10+Math.floor(random()*60),{rotation:random()*720-360,...(random()<.7?{parentId:'f'+Math.floor(random()*frames.length)}:{})}));compare([...frames,...notes]);}
});
test('index rebuilds after frame movement and Undo restores parent assignments and content',()=>{
 const board=new Board({version:1,name:'Moving',items:[item('frame','frame',0,0,400,400),item('note','sticky',20,20,40,40)]}),before=structuredClone(board.doc);board.move(['frame'],100,50);assert.equal(board.doc.items.find(i=>i.id==='note').x,120);assert.equal(board.doc.items.find(i=>i.id==='note').parentId,'frame');assert.deepEqual(board.doc,exhaustive(structuredClone(board.doc)));board.undo();assert.deepEqual(board.doc,before);board.update(['frame'],{x:500});assert.equal(board.doc.items.find(i=>i.id==='note').parentId,undefined);
});

