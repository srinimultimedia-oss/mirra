import {spawnSync} from 'node:child_process';import assert from 'node:assert/strict';
const code=`import {Board} from './src/model.mjs';
const n=30000,frame=(id,x,y,w,h)=>({id,type:'frame',x,y,w,h,text:'',fill:'#ffffff'}),start=performance.now();
let items=Array.from({length:n},(_,i)=>frame('f'+i,0,0,n-i+1,n-i+1)),board=new Board({version:1,name:'Nested',items});
if(board.doc.items[0].parentId!==undefined)throw Error('Root unexpectedly nested');for(let i=1;i<n;i++)if(board.doc.items[i].parentId!=='f'+(i-1))throw Error('Nested parent changed');
const nestedMs=performance.now()-start;items=[];
for(let i=0;i<n;i++){const x=i%100*200,y=Math.floor(i/100)*200;items.push(frame('f'+i,x,y,100,100),{...frame('n'+i,x+10,y+10,20,20),type:'sticky'});}
board=new Board({version:1,name:'Disjoint',items});for(let i=0;i<n;i++){if(board.doc.items[i*2].parentId!==undefined||board.doc.items[i*2+1].parentId!=='f'+i)throw Error('Disjoint containment changed');}
const disjointMs=performance.now()-start-nestedMs;items=[];
for(let i=0;i<n;i++)items.push(frame('f'+i,0,0,100,100),{...frame('n'+i,10,10,20,20),type:'sticky',...(i%2?{parentId:'f'+i}:{})});
board=new Board({version:1,name:'Coincident',items});for(let i=0;i<n;i++)if(board.doc.items[i*2+1].parentId!==(i%2?'f'+i:'f0'))throw Error('Coincident tie changed');
console.log(JSON.stringify({nested:n,disjointPairs:n,coincidentPairs:n,nestedMs,disjointMs,totalMs:performance.now()-start}));`;
const result=spawnSync(process.execPath,['--input-type=module','-e',code],{cwd:new URL('..',import.meta.url),encoding:'utf8',timeout:5000,maxBuffer:10000});assert.ifError(result.error);assert.equal(result.status,0,result.stderr);const metrics=JSON.parse(result.stdout);assert.equal(metrics.nested,30000);assert.equal(metrics.disjointPairs,30000);assert.equal(metrics.coincidentPairs,30000);assert.ok(metrics.totalMs<5000);console.log('FRAME_CONTAINMENT_SCALE_PASS '+JSON.stringify(metrics));

