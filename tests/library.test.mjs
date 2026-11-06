import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LocalLibrary, LIBRARY_KEY } from '../src/library.mjs';
import { Board } from '../src/model.mjs';
function memory(){const map=new Map();return{getItem:key=>map.get(key)??null,setItem:(key,value)=>map.set(key,value)};}
test('legacy board migrates without removing the recovery copy',()=>{
  const storage=memory(),b=new Board();b.add('sticky',10,20,{text:'Preserve this'});storage.setItem('mirra.board.v1',b.serialize());
  const library=new LocalLibrary(storage);assert.deepEqual(library.get().doc,b.doc);assert.equal(storage.getItem('mirra.board.v1'),b.serialize());
  assert.deepEqual(new LocalLibrary(storage).get().doc,b.doc);
});
test('create and switch boards preserve independent documents',()=>{
  const storage=memory(),library=new LocalLibrary(storage);const first=library.state.activeId,b=new Board(library.get().doc);b.add('shape',0,0);library.save(b.doc);
  const second=library.create('Second');assert.equal(library.get().doc.items.length,0);library.open(first);assert.equal(library.get().doc.items.length,1);assert.equal(library.get(second).doc.name,'Second');
  assert.equal(new LocalLibrary(storage).state.activeId,first);
});
test('copies remain independent and preserve connector references within each board',()=>{
  const library=new LocalLibrary(memory()),b=new Board(library.get().doc);const a=b.add('shape',0,0),c=b.add('shape',100,100);b.add('connector',0,0,{from:a,to:c});library.save(b.doc);
  const original=library.state.activeId,copy=library.duplicate(original);library.open(copy);const copied=new Board(library.get().doc);copied.update([a],{text:'Copied only'});library.save(copied.doc);
  assert.equal(library.get(original).doc.items[0].text,'');assert.equal(library.get(copy).doc.items[0].text,'Copied only');
});
test('star search sort rename spaces trash and restore work without losing board content',()=>{
  let time=100;const library=new LocalLibrary(memory(),()=>++time),first=library.state.activeId;
  library.rename(first,'Roadmap');library.star(first);const space=library.addSpace('Planning');library.move(first,space);library.create('Brainstorm');
  assert.equal(library.list({view:'starred',query:'road'})[0].id,first);assert.equal(library.list({spaceId:space}).length,1);assert.equal(library.list({sort:'name'})[0].doc.name,'Brainstorm');
  library.open(first);library.trash(first);assert.equal(library.state.activeId,null);assert.equal(library.list().length,1);assert.equal(library.list({view:'trash'}).length,1);assert.throws(()=>library.open(first));
  library.restore(first);library.open(first);assert.equal(library.get().spaceId,space);assert.equal(library.get().starred,true);
});
test('stale library snapshots cannot overwrite a newer revision',()=>{
  const storage=memory(),a=new LocalLibrary(storage),b=new LocalLibrary(storage);a.create('New work');const before=storage.getItem(LIBRARY_KEY);
  assert.throws(()=>b.create('Stale tab'),/another tab/);assert.equal(storage.getItem(LIBRARY_KEY),before);assert.equal(b.state.boards.length,1);
});
test('quota errors leave persisted and in-memory data unchanged',()=>{
  const storage=memory(),library=new LocalLibrary(storage),before=structuredClone(library.state),raw=storage.getItem(LIBRARY_KEY);storage.setItem=()=>{throw Error('Quota exceeded');};
  assert.throws(()=>library.create('Cannot save'),/Quota/);assert.deepEqual(library.state,before);assert.equal(storage.getItem(LIBRARY_KEY),raw);
});
test('corrupt library and invalid mutations fail rather than silently replace work',()=>{
  const storage=memory();storage.setItem(LIBRARY_KEY,'broken');assert.throws(()=>new LocalLibrary(storage));
  const library=new LocalLibrary(memory()),before=structuredClone(library.state);assert.throws(()=>library.move(library.state.activeId,'missing'));assert.throws(()=>library.rename(library.state.activeId,''));assert.throws(()=>library.create('x'.repeat(501)));assert.deepEqual(library.state,before);
});
