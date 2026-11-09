import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
const code=`import {Board} from './src/model.mjs';
const count=30000,items=Array.from({length:count},(_,i)=>({id:'f'+i,type:'frame',x:0,y:0,w:count-i+1,h:count-i+1,text:'',fill:'#ffffff',...(i?{parentId:'f'+(i-1)}:{})})).reverse();
const board=new Board({version:1,name:'Reverse nested selection',items}),before=board.serialize(),started=performance.now(),selected=board.selection(['f0'],{descendants:true});
if(selected.length!==count||new Set(selected).size!==count||!selected.includes('f'+(count-1))||board.serialize()!==before)throw Error('Selection membership or source changed');
console.log(JSON.stringify({count,elapsedMs:performance.now()-started}));`;
const result=spawnSync(process.execPath,['--input-type=module','-e',code],{cwd:new URL('..',import.meta.url),encoding:'utf8',timeout:5000,maxBuffer:10000});
assert.ifError(result.error);assert.equal(result.status,0,result.stderr);const metrics=JSON.parse(result.stdout);assert.equal(metrics.count,30000);assert.ok(metrics.elapsedMs<5000);console.log('DESCENDANT_SELECTION_SCALE_PASS '+JSON.stringify(metrics));
