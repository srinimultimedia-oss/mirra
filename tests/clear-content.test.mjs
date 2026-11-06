import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Board} from '../src/model.mjs';
import {newTable} from '../src/tables.mjs';
test('clear content removes text and tag assignments while retaining catalog style identity and structure',()=>{
 const b=new Board(),f=b.add('frame',0,0,{w:1000,h:700,text:'Frame'}),a=b.add('sticky',100,100,{text:'Café 🚀',rotation:25,fill:'#123456',bold:true}),c=b.add('card',400,100,{text:'Card'}),s=b.add('shape',700,100,{text:'Shape',shape:'diamond'});b.group([a,c,s]);const tag=b.tags({kind:'create',name:'Reusable',ids:[a]}),before=structuredClone(b.doc),history=b.past.length;
 b.clearContent([a]);assert.equal(b.past.length,history+1);for(const id of [a,c,s]){const old=before.items.find(i=>i.id===id),expected={...old,text:''};delete expected.tagIds;assert.deepEqual(b.doc.items.find(i=>i.id===id),expected);}assert.deepEqual(b.doc.tags,[{id:tag,name:'Reusable'}]);assert.deepEqual(b.doc.items.find(i=>i.id===f),before.items.find(i=>i.id===f));const after=b.serialize();b.undo();assert.deepEqual(b.doc,before);b.redo();assert.equal(b.serialize(),after);assert.deepEqual(Board.parse(after).doc,b.doc);
});
test('mixed selection skips locked and unsupported widgets without clearing frame descendants or consuming empty undo steps',()=>{
 const b=new Board(),locked=b.add('sticky',10,10,{text:'Locked',locked:true}),text=b.add('text',250,10,{text:'Keep text'}),table=b.add('table',500,10,{text:'Table',table:newTable()}),frame=b.add('frame',0,400,{text:'Keep frame',w:700,h:600}),child=b.add('sticky',50,450,{text:'Keep child'}),shape=b.add('shape',800,100,{text:'Remove'});const before=structuredClone(b.doc);b.clearContent([locked,text,table,frame,shape]);for(const id of [locked,text,table,frame,child])assert.deepEqual(b.doc.items.find(i=>i.id===id),before.items.find(i=>i.id===id));assert.equal(b.doc.items.find(i=>i.id===shape).text,'');const history=b.past.length;assert.deepEqual(b.clearableContent([locked,text,table,frame,shape,'missing']),[]);assert.equal(b.clearContent([locked,text,table,frame,shape]),false);assert.equal(b.past.length,history);
});
test('empty tagged notes are clearable and clearing assignments leaves other note bindings reusable',()=>{
 const b=new Board(),a=b.add('sticky',0,0),c=b.add('sticky',250,0),tag=b.tags({kind:'create',name:'Tag',ids:[a,c]});assert.deepEqual(b.clearableContent([a]),[a]);b.clearContent([a]);assert.equal(b.doc.items[0].tagIds,undefined);assert.deepEqual(b.doc.items[1].tagIds,[tag]);b.tags({kind:'assign',tagId:tag,ids:[a],enabled:true});assert.deepEqual(b.doc.items[0].tagIds,[tag]);
});
