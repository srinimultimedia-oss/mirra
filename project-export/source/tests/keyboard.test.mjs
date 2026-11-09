import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {Board} from '../src/model.mjs';
import {presentationKey} from '../public/presentation.mjs';
const app=readFileSync(new URL('../public/app.mjs',import.meta.url),'utf8');
const start=app.indexOf("document.addEventListener('keydown',e=>{");
const end=app.indexOf('\nlet dashView=',start);
assert.ok(start>=0&&end>start);
function fixture(){
 const board=new Board();const id=board.add('sticky',0,0,{text:'Keyboard note'});board.past=[];
 const calls={edit:0,changed:0,created:0,prevented:0};
 const canvas={closest:()=>null};
 const context={presentationKey,document:{addEventListener:(_,handler)=>context.handler=handler},$:()=>({hidden:false}),board,selected:[id],canvas,presentation:-1,writable:()=>true,canComment:()=>true,edit:()=>calls.edit++,changed:()=>calls.changed++,render:()=>{},setTool:()=>{},panel:()=>{},endGesture:()=>{},endPresentation:()=>{},toast:()=>{},tool:'sticky',innerWidth:1280,innerHeight:720,world:p=>p,createAt:()=>calls.created++};
 vm.runInNewContext(app.slice(start,end),context);
 function press(key,target=canvas,extra={}){context.handler({key,target,ctrlKey:false,metaKey:false,shiftKey:false,defaultPrevented:false,preventDefault:()=>calls.prevented++,...extra});}
 // Model actual closest semantics for the target types used by these controller tests.
 const target=(tag,role=null,editable=false)=>({closest:selector=>selector.split(',').some(part=>{part=part.trim();if(part===tag)return true;if(part==='[role="'+role+'"]')return true;if(part.startsWith('[contenteditable]')&&editable)return true;return false;})?{}:null});
 return{board,id,calls,press,target,context};
}
test('Enter and arrow keys on native buttons and links do not edit or move the canvas selection',()=>{for(const tag of ['button','a']){const f=fixture();f.press('Enter',f.target(tag));f.press('ArrowRight',f.target(tag));assert.equal(f.calls.edit,0);assert.equal(f.calls.created,0);assert.equal(f.board.doc.items[0].x,0);assert.equal(f.calls.prevented,0);}});
test('custom buttons and editable regions retain their own keys without canvas commands',()=>{for(const target of [['span','button',false],['div',null,true]]){const f=fixture();f.press('Enter',f.target(...target));f.press('Delete',f.target(...target));assert.equal(f.calls.edit,0);assert.equal(f.board.doc.items.length,1);assert.equal(f.calls.prevented,0);}});
test('already handled keyboard events do not execute a second board command',()=>{const f=fixture();f.press('Delete',undefined,{defaultPrevented:true});assert.equal(f.board.doc.items.length,1);assert.equal(f.calls.changed,0);});
test('canvas Enter creates with creation tool and edits with Select; arrows move with undo',()=>{const f=fixture();f.press('Enter');assert.equal(f.calls.created,1);f.context.tool='select';f.press('Enter');assert.equal(f.calls.edit,1);f.press('ArrowRight');assert.equal(f.board.doc.items[0].x,1);f.board.undo();assert.equal(f.board.doc.items[0].x,0);});
test('native text controls remain isolated and read-only canvas cannot mutate',()=>{const f=fixture();for(const tag of ['input','textarea','select','dialog'])f.press('Delete',f.target(tag));assert.equal(f.board.doc.items.length,1);f.context.writable=()=>false;f.press('Delete');assert.equal(f.board.doc.items.length,1);assert.equal(f.calls.changed,0);});

test('actual keyboard handler routes presentation controls and preserves modified and editable keys',()=>{const f=fixture(),moves=[];f.context.presentation=0;f.context.movePresentation=offset=>moves.push(offset);f.context.showFrame=index=>moves.push(index);f.context.endPresentation=()=>moves.push('end');f.press('ArrowRight',f.target('button'));f.press('ArrowLeft',f.target('button'));f.press('Home',f.target('button'));f.press('Escape',f.target('button'));assert.deepEqual(moves,[1,-1,0,'end']);f.press('ArrowRight',f.target('button'),{ctrlKey:true});f.press('ArrowRight',f.target('input'));f.press('ArrowRight',f.canvas,{ctrlKey:true});assert.deepEqual(moves,[1,-1,0,'end']);assert.equal(f.board.doc.items[0].x,0);});

test('keyboard movement of a partially locked group reports an error without saving',()=>{const f=fixture(),peer=f.board.add('shape',300,0),messages=[];f.board.group([f.id,peer]);f.board.update([peer],{locked:true});f.context.toast=text=>messages.push(text);const before=f.board.serialize();assert.doesNotThrow(()=>f.press('ArrowRight'));assert.equal(f.board.serialize(),before);assert.equal(f.calls.changed,0);assert.match(messages[0],/Unlock/);});
