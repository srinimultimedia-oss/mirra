import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Board, bounds } from '../src/model.mjs';
test('create edit move serialize and restore items', () => {
  const b = new Board(), id = b.add('sticky', -50, 100);
  b.update([id], { text: 'A real idea ✨', fill: '#abcdef' }); b.move([id], 20, -30);
  const c = Board.parse(b.serialize()); assert.deepEqual(c.doc, b.doc); assert.equal(c.doc.items[0].x, -30); assert.equal(c.doc.items[0].y, 70);
});
test('atomic undo and redo, with redo invalidated by a new edit', () => {
  const b = new Board(), id = b.add('shape', 0, 0); b.update([id], {text: 'new'});
  b.undo(); assert.equal(b.doc.items[0].text, ''); b.redo(); assert.equal(b.doc.items[0].text, 'new');
  b.undo(); b.move([id], 1, 1); assert.equal(b.redo(), false);
});
test('invalid updates roll back without changing history', () => {
  const b = new Board(), id = b.add('sticky', 0, 0); const before = b.serialize(), count = b.past.length;
  assert.throws(() => b.update([id], { w: -1 })); assert.equal(b.serialize(), before); assert.equal(b.past.length, count);
  assert.throws(() => b.update([id], { x: NaN })); assert.throws(() => b.update([id], { fill: 'url(javascript:evil)' }));
});
test('deleting an endpoint removes connections, undo restores them', () => {
  const b = new Board(), a = b.add('shape', 0, 0), c = b.add('shape', 200, 0);
  b.add('connector', 0, 0, { from: a, to: c }); b.remove([a]); assert.equal(b.doc.items.length, 1);
  b.undo(); assert.equal(b.doc.items.length, 3);
});
test('duplicating a connected selection remaps endpoint ids', () => {
  const b = new Board(), a = b.add('shape', 0, 0), c = b.add('shape', 200, 0);
  b.add('connector', 0, 0, { from: a, to: c }); const copied = b.duplicate([a,c]);
  const connector = b.doc.items.find(i => copied.includes(i.id) && i.type === 'connector');
  assert.ok(copied.includes(connector.from)); assert.ok(copied.includes(connector.to)); assert.notEqual(connector.from, a);
});
test('locked items resist move and deletion', () => {
  const b = new Board(), id = b.add('shape', 0, 0, {locked:true}); b.move([id],10,10); b.remove([id]); assert.equal(b.doc.items[0].x, 0); assert.equal(b.doc.items.length, 1);
});
test('alignment and stacking work across selections', () => {
  const b = new Board(), a = b.add('shape', -20, 10), c = b.add('shape', 200, 80);
  b.align([a,c], 'left'); assert.equal(b.doc.items[1].x,-20); b.reorder([a],true); assert.equal(b.doc.items.at(-1).id,a);
  assert.deepEqual(bounds([]),{x:0,y:0,w:1,h:1});
});
test('malformed imports, duplicate ids and dangling connections fail', () => {
  const b = new Board(); const a = b.add('shape',0,0); const doc = structuredClone(b.doc); doc.items.push({...doc.items[0]});
  assert.throws(() => new Board(doc)); assert.throws(() => Board.parse('{'));
  assert.throws(() => b.add('connector',0,0,{from:a,to:'missing'})); assert.equal(b.doc.items.length,1);
  assert.throws(() => b.add('pen',0,0,{points:[[Infinity,0]]}));
  assert.throws(() => b.add('pen',0,0));
  assert.throws(() => b.add('pen',0,0,{points:[[0,0]]}));
});
test('nested frames move their descendants once and undo restores every position',()=>{
  const b=new Board(),outer=b.add('frame',0,0,{w:800,h:600}),inner=b.add('frame',50,50,{w:400,h:300}),note=b.add('sticky',100,100,{w:100,h:100});
  assert.equal(b.doc.items.find(i=>i.id===inner).parentId,outer);assert.equal(b.doc.items.find(i=>i.id===note).parentId,inner);
  b.move([outer,inner],20,30);assert.equal(b.doc.items.find(i=>i.id===note).x,120);assert.equal(b.doc.items.find(i=>i.id===inner).x,70);
  b.undo();assert.equal(b.doc.items.find(i=>i.id===note).x,100);
  b.move([note],1000,0);assert.equal(b.doc.items.find(i=>i.id===note).parentId,undefined);
});
test('copying a frame copies its children and retains independent parent relationships',()=>{
  const b=new Board(),frame=b.add('frame',0,0,{w:800,h:600}),note=b.add('sticky',100,100);const copies=b.duplicate([frame]);
  assert.equal(copies.length,2);const child=b.doc.items.find(i=>copies.includes(i.id)&&i.type==='sticky'),parent=b.doc.items.find(i=>copies.includes(i.id)&&i.type==='frame');
  assert.equal(child.parentId,parent.id);assert.equal(b.doc.items.find(i=>i.id===note).parentId,frame);
  b.move([parent.id],100,0);assert.equal(b.doc.items.find(i=>i.id===note).x,100);assert.equal(child.id,b.doc.items.find(i=>copies.includes(i.id)&&i.type==='sticky').id);
});
test('groups select move duplicate delete and ungroup as coherent selections',()=>{
  const b=new Board(),a=b.add('shape',0,0),c=b.add('shape',200,0);b.group([a,c]);assert.equal(b.selection([a]).length,2);
  b.move([a],20,30);assert.equal(b.doc.items[1].x,220);const copy=b.duplicate([a]);assert.equal(copy.length,2);assert.notEqual(b.doc.items[0].groupId,b.doc.items.find(i=>i.id===copy[0]).groupId);
  b.ungroup(copy);assert.equal(b.selection([copy[0]]).length,1);b.remove([a]);assert.equal(b.doc.items.length,2);
});
test('grouping rejects objects on different frames and frame selection encloses content',()=>{
  const b=new Board();b.add('frame',0,0,{w:600,h:400});const a=b.add('shape',50,50),c=b.add('shape',1000,0);
  assert.throws(()=>b.group([a,c]),/different frames/);const id=b.frameSelection([a]);assert.equal(b.doc.items.find(i=>i.id===a).parentId,id);
  b.remove([id]);assert.ok(b.doc.items.some(i=>i.id===a));
});
test('cyclic frame imports are rejected',()=>{
  const b=new Board(),a=b.add('frame',0,0),c=b.add('frame',300,0);const doc=structuredClone(b.doc);doc.items[0].parentId=c;doc.items[1].parentId=a;
  assert.throws(()=>new Board(doc),/Cyclic/);
});
test('moving a locked frame does not move its unlocked descendants',()=>{
  const b=new Board(),frame=b.add('frame',0,0,{w:800,h:600,locked:true}),note=b.add('sticky',100,100);b.move([frame],20,30);
  assert.equal(b.doc.items.find(i=>i.id===frame).x,0);assert.equal(b.doc.items.find(i=>i.id===note).x,100);
});
