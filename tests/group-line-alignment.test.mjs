import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Board} from '../src/model.mjs';

function fixture(){const b=new Board(),a=b.add('shape',500,200,{w:100,h:100}),c=b.add('shape',700,200,{w:100,h:100}),other=b.add('shape',0,0,{w:100,h:100});const line=b.add('connector',0,0,{from:{x:550,y:250},to:{x:750,y:250},text:''});b.group([a,c,line]);return{b,a,c,other,line};}
test('group alignment translates free endpoints by the same displacement as member shapes and Undo restores them',()=>{const{b,a,c,other,line}=fixture(),before=b.serialize();b.align([a,other],'left');const get=id=>b.doc.items.find(i=>i.id===id);assert.equal(get(a).x,0);assert.equal(get(c).x,200);assert.deepEqual(get(line).from,{x:50,y:250});assert.deepEqual(get(line).to,{x:250,y:250});b.undo();assert.equal(b.serialize(),before);b.redo();assert.deepEqual(get(line).from,{x:50,y:250});assert.deepEqual(Board.parse(b.serialize()).doc,b.doc);});
test('mixed attached and free endpoints translate only the free point during vertical group alignment',()=>{const{b,a,other,line}=fixture();b.update([line],{from:a});b.align([a,other],'top');const get=id=>b.doc.items.find(i=>i.id===id);assert.equal(get(a).y,0);assert.equal(get(line).from,a);assert.deepEqual(get(line).to,{x:750,y:50});});
test('locked grouped portable connector prevents partial alignment',()=>{const{b,a,other,line}=fixture();b.update([line],{locked:true});const before=b.serialize(),history=b.past.length;assert.throws(()=>b.align([a,other],'left'),/Unlock/);assert.equal(b.serialize(),before);assert.equal(b.past.length,history);});
