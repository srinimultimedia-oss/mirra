import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Board,bounds} from '../src/model.mjs';
import {edgePoint,connectorGeometry,shapeGeometry,SHAPES,localDelta,resizedOrigin} from '../src/geometry.mjs';
import {autoFontSize,wrappedLines} from '../src/typography.mjs';
const near=(actual,expected)=>assert.ok(Math.abs(actual-expected)<1e-7,`${actual} != ${expected}`);
test('styles persist and invalid style changes roll back atomically',()=>{
  const b=new Board(),id=b.add('shape',10,20,{shape:'diamond'});b.update([id],{fontSize:24,bold:true,italic:true,underline:true,textColor:'#123456',rotation:45,opacity:.6,lineStyle:'dashed',strokeWidth:3});
  assert.deepEqual(Board.parse(b.serialize()).doc,b.doc);const before=b.serialize();
  for(const patch of [{fontSize:0},{opacity:2},{rotation:Infinity},{shape:'malicious'},{textAlign:'invalid'},{stroke:'url(evil)'},{bold:'true'},{route:'unknown'},{fontFamily:'arbitrary css'}]){assert.throws(()=>b.update([id],patch));assert.equal(b.serialize(),before);}
  b.undo();assert.equal(b.doc.items[0].rotation,undefined);b.redo();assert.equal(b.doc.items[0].rotation,45);
});
test('rotated visual bounds include every rotated corner',()=>{
  const box=bounds([{x:0,y:0,w:200,h:100,rotation:90}]);near(box.x,50);near(box.y,-50);near(box.w,100);near(box.h,200);
  const delta=localDelta(0,20,90);near(delta.x,20);near(delta.y,0);
  const origin=resizedOrigin({x:0,y:0,w:200,h:100,rotation:90},240,120);near(origin.x,-30);near(origin.y,10);
});
test('connections attach to rectangle ellipse diamond and rotated edges',()=>{
  const item={x:0,y:0,w:200,h:100};let p=edgePoint(item,{x:1000,y:50});near(p.x,200);near(p.y,50);
  p=edgePoint({...item,shape:'ellipse'},{x:1000,y:50});near(p.x,200);near(p.y,50);
  p=edgePoint({...item,shape:'diamond'},{x:1000,y:1000});near(Math.abs((p.x-100)/100)+Math.abs((p.y-50)/50),1);
  p=edgePoint({...item,rotation:90},{x:1000,y:50});near(p.x,150);near(p.y,50);
  for(const shape of SHAPES){const geometry=shapeGeometry(shape,200,100);assert.ok(['rect','ellipse','polygon'].includes(geometry.tag));const edge=edgePoint({...item,shape},{x:1000,y:1000});assert.ok(Number.isFinite(edge.x)&&Number.isFinite(edge.y));}
});
test('route geometry follows moved endpoints and handles coincident centers',()=>{
  const a={x:0,y:0,w:100,h:100},b={x:300,y:100,w:100,h:100};
  assert.match(connectorGeometry(a,b,'orthogonal').path,/ H.* V/);assert.match(connectorGeometry(a,b,'curve').path,/ C/);
  assert.notEqual(connectorGeometry(a,b).path,connectorGeometry(a,{...b,x:500}).path);assert.deepEqual(edgePoint(a,{x:50,y:50}),{x:50,y:50});
});
test('clipboard copies frame descendants and connections and remaps parent and group ids',()=>{
  const source=new Board(),frame=source.add('frame',0,0,{w:800,h:600}),a=source.add('shape',50,50),b=source.add('shape',300,50);source.group([a,b]);source.add('connector',0,0,{from:a,to:b});
  const selection=source.copySelection([frame]),dest=new Board(),ids=dest.pasteSelection(selection,1000,1000);assert.equal(ids.length,4);assert.equal(source.doc.items.length,4);
  const copiedFrame=dest.doc.items.find(i=>i.type==='frame'),copiedShapes=dest.doc.items.filter(i=>i.type==='shape'),line=dest.doc.items.find(i=>i.type==='connector');
  assert.ok(copiedShapes.every(i=>i.parentId===copiedFrame.id));assert.equal(copiedShapes[0].groupId,copiedShapes[1].groupId);assert.notEqual(copiedShapes[0].groupId,source.doc.items.find(i=>i.id===a).groupId);
  assert.ok(ids.includes(line.from)&&ids.includes(line.to));assert.ok(!ids.includes(a));dest.undo();assert.equal(dest.doc.items.length,0);dest.redo();assert.equal(dest.doc.items.length,4);
});
test('copying a single child detaches external parent and invalid clipboard data is rejected',()=>{
  const b=new Board();b.add('frame',0,0,{w:800,h:600});const note=b.add('sticky',50,50);const copied=JSON.parse(b.copySelection([note]));assert.equal(copied.items[0].parentId,undefined);
  const before=b.serialize();assert.throws(()=>b.pasteSelection('{',100,100));assert.equal(b.serialize(),before);
});
test('bulk notes trim blank lines use a grid and form one undo step',()=>{
  const b=new Board(),ids=b.bulkStickies(' One\n\nTwo\r\n Three ',0,0,{columns:2});assert.equal(ids.length,3);assert.deepEqual(b.doc.items.map(i=>i.text),['One','Two','Three']);assert.equal(b.doc.items[2].x,0);assert.equal(b.doc.items[2].y,170);b.undo();assert.equal(b.doc.items.length,0);b.redo();assert.equal(b.doc.items.length,3);
});
test('invalid bulk input rejects the whole operation with no partial notes',()=>{
  const b=new Board();for(const text of ['', '\n ', 'x'.repeat(3001),Array(501).fill('note').join('\n')])assert.throws(()=>b.bulkStickies(text,0,0));assert.equal(b.doc.items.length,0);
  assert.throws(()=>b.bulkStickies('valid\nnotes',0,0,{fill:'bad'}));assert.equal(b.doc.items.length,0);
});
test('numeric resize scales pen points and invalid sizing preserves original geometry',()=>{
  const b=new Board(),id=b.add('pen',0,0,{w:100,h:100,points:[[0,0],[100,100]]});b.resize(id,200,50);assert.deepEqual(b.doc.items[0].points,[[0,0],[200,50]]);const before=b.serialize();assert.throws(()=>b.resize(id,-1,50));assert.equal(b.serialize(),before);
});
test('locked styles resist edits and clear content affects only supported unlocked widgets',()=>{
  const b=new Board(),a=b.add('sticky',0,0,{text:'Keep',locked:true}),c=b.add('shape',300,0,{text:'Clear'}),t=b.add('text',0,300,{text:'Text stays'});
  b.update([a],{fill:'#ffffff'});assert.equal(b.doc.items[0].fill,'#f6e49b');b.clearContent([a,c,t]);assert.deepEqual(b.doc.items.map(i=>i.text),['Keep','','Text stays']);b.update([a],{locked:false});b.clearContent([a]);assert.equal(b.doc.items[0].text,'');
});
test('automatic text sizing shrinks for long text and accounts for explicit newlines',()=>{
  const measure=(text,size)=>Array.from(text).length*size*.6;
  assert.equal(wrappedLines('a\nb',100,12,measure),2);const short=autoFontSize('Hi',150,120,measure),long=autoFontSize('A longer block of text that should fit within this note',150,120,measure);assert.ok(short>long);assert.ok(long>=8);assert.ok(wrappedLines('A longer block of text that should fit within this note',150,long,measure)*long*1.35<=120);
  assert.equal(wrappedLines('aa aa aa',4,1,text=>text.length),3);
  const dense=autoFontSize('word '.repeat(600),150,150,measure);assert.ok(dense<8);assert.ok(wrappedLines('word '.repeat(600),150,dense,measure)*dense*1.35<=150);
});
