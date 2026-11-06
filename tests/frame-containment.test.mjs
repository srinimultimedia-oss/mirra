import {test} from 'node:test';import assert from 'node:assert/strict';import {Board} from '../src/model.mjs';
const item=(id,type,x,y,w,h,props={})=>({id,type,x,y,w,h,text:id,fill:'#ffffff',...props});
test('Frame Selection owns the rotated object it visibly encloses and moves it once',()=>{
 const board=new Board(),shape=board.add('shape',100,100,{w:200,h:100,rotation:45}),frame=board.frameSelection([shape]);assert.equal(board.doc.items.find(i=>i.id===shape).parentId,frame);const before=structuredClone(board.doc);board.move([frame],31,-19);const moved=board.doc.items.find(i=>i.id===shape);assert.equal(moved.x,131);assert.equal(moved.y,81);assert.equal(moved.rotation,45);board.undo();assert.deepEqual(board.doc,before);
});
test('rotated frame membership uses actual boundary rather than original or enclosing rectangles',()=>{
 const board=new Board({version:1,name:'Rotation',items:[item('frame','frame',0,0,200,100,{rotation:45}),item('inside','shape',95,45,10,10),item('outside','shape',185,5,10,10),item('beyond-original','shape',67,-38,6,6)]});
 assert.equal(board.doc.items.find(i=>i.id==='inside').parentId,'frame');assert.equal(board.doc.items.find(i=>i.id==='beyond-original').parentId,'frame');assert.equal(board.doc.items.find(i=>i.id==='outside').parentId,undefined);
});
test('nested rotated frames retain their contents during ancestor movement and Undo',()=>{
 const board=new Board({version:1,name:'Nested rotation',items:[item('outer','frame',0,0,600,400,{rotation:30}),item('inner','frame',200,150,200,100,{rotation:30}),item('note','sticky',280,180,40,40,{rotation:30})]}),before=structuredClone(board.doc);
 assert.equal(board.doc.items.find(i=>i.id==='inner').parentId,'outer');assert.equal(board.doc.items.find(i=>i.id==='note').parentId,'inner');
 for(const selected of [['outer'],['outer','inner']]){board.move(selected,40,70);for(const original of before.items){const moved=board.doc.items.find(i=>i.id===original.id);assert.equal(moved.x,original.x+40);assert.equal(moved.y,original.y+70);assert.equal(moved.rotation,30);}board.undo();assert.deepEqual(board.doc,before);}
});
test('locked rotated contents prevent moving the surrounding frame without partial changes',()=>{
 const board=new Board({version:1,name:'Locked rotation',items:[item('frame','frame',0,0,200,100,{rotation:45}),item('locked','shape',67,-38,6,6,{locked:true})]}),before=structuredClone({doc:board.doc,past:board.past,future:board.future});assert.equal(board.doc.items.find(i=>i.id==='locked').parentId,'frame');assert.throws(()=>board.move(['frame'],50,60),/Unlock/);assert.deepEqual({doc:board.doc,past:board.past,future:board.future},before);
});
