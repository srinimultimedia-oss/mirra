import {test} from 'node:test';
import assert from 'node:assert/strict';
import {SaveStatus,deviceSaveStatus} from '../src/save-status.mjs';
import {LocalLibrary,LIBRARY_KEY} from '../src/library.mjs';
import {Board} from '../src/model.mjs';

test('leaving cloud replaces both visible status and tooltip, ignoring late old-session updates',()=>{
 const element={textContent:'',title:''},indicator=new SaveStatus(message=>element.textContent=element.title=message),device={},cloud={},otherAccount={};
 indicator.select(device,deviceSaveStatus({hasSavedBoard:true}));indicator.select(cloud,'Live · cloud saved');
 indicator.select(device,deviceSaveStatus({hasSavedBoard:true}));
 assert.equal(indicator.update(cloud,'Offline · draft kept on this device'),false);
 assert.deepEqual(element,{textContent:'Saved on this device',title:'Saved on this device'});
 indicator.select(otherAccount,'Live · read only');assert.equal(indicator.update(cloud,'Live · cloud saved'),false);assert.equal(element.title,'Live · read only');
 indicator.update(otherAccount,'Connection interrupted · retrying');assert.equal(element.textContent,element.title);assert.match(element.title,/interrupted/);
});
test('unavailable device storage never claims a successful device save',()=>{
 assert.equal(deviceSaveStatus({hasSavedBoard:true,storageError:true}),'Storage could not be restored');
 assert.match(deviceSaveStatus({hasSavedBoard:true,blocked:true}),/^Not saved/);
 assert.match(deviceSaveStatus(),/^Not saved/);
 assert.equal(deviceSaveStatus({hasSavedBoard:true}),'Saved on this device');
});
test('quota failure retains unsaved board, durable library and failure status until a real retry succeeds',()=>{
 const values=new Map(),storage={getItem:key=>values.get(key)??null,setItem(key,value){if(this.fail)throw Error('Quota exceeded');values.set(key,value);}},library=new LocalLibrary(storage),board=new Board(library.get().doc),source={},shown=[],indicator=new SaveStatus(message=>shown.push(message));
 indicator.select(source,deviceSaveStatus({hasSavedBoard:true}));const before=storage.getItem(LIBRARY_KEY),revision=library.state.revision;
 board.add('sticky',10,20,{text:'Retain café'});storage.fail=true;
 assert.throws(()=>library.save(board.doc),/Quota/);indicator.update(source,'Save failed — export your board');
 assert.equal(library.state.revision,revision);assert.equal(storage.getItem(LIBRARY_KEY),before);assert.equal(board.doc.items[0].text,'Retain café');assert.match(shown.at(-1),/^Save failed/);
 storage.fail=false;library.save(board.doc);indicator.update(source,'Saved on this device');assert.equal(new LocalLibrary(storage).get().doc.items[0].text,'Retain café');assert.equal(shown.at(-1),'Saved on this device');
});
test('a different tab changes durable library while a stale tab retains its unsaved content and warning',()=>{
 const values=new Map(),storage={getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)},left=new LocalLibrary(storage),right=new LocalLibrary(storage),board=new Board(left.get().doc),source={},shown=[],indicator=new SaveStatus(message=>shown.push(message));
 indicator.select(source,deviceSaveStatus({hasSavedBoard:true}));board.add('sticky',0,0,{text:'Unsent tab'});right.rename(right.state.activeId,'Other tab saved');indicator.update(source,'Changed in another tab');
 assert.throws(()=>left.save(board.doc),/another tab/);assert.equal(new LocalLibrary(storage).get().doc.name,'Other tab saved');assert.equal(board.doc.items[0].text,'Unsent tab');assert.equal(shown.at(-1),'Changed in another tab');
});
