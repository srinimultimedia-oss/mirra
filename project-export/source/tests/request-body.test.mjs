import {test} from 'node:test';import assert from 'node:assert/strict';
import {readJSONObject,MAX_REQUEST_BYTES} from '../cloud/lib/request-body.ts';
const encode=text=>new TextEncoder().encode(text);
function streamed(chunks,{cancel=()=>{},fail=false,headers={}}={}){let index=0;return new Request('https://mirra.test/api/test',{method:'POST',headers,duplex:'half',body:new ReadableStream({pull(controller){if(index<chunks.length)controller.enqueue(chunks[index++]);else if(fail)controller.error(fail===true?Error('Private network detail'):fail);else controller.close();},cancel})});}
const status=code=>error=>error.status===code;
test('UTF-8 decoding handles every split of multibyte text without replacement or corruption',async()=>{
 const value={title:'café 界 🚀',nested:{enabled:true},items:[1,2]},bytes=encode(JSON.stringify(value));
 for(let i=1;i<bytes.length;i++)assert.deepEqual(await readJSONObject(streamed([bytes.slice(0,i),bytes.slice(i)])),value);
 assert.deepEqual(await readJSONObject(streamed([...bytes].map(byte=>new Uint8Array([byte])))),value);
});
test('actual byte boundary is inclusive and ignores misleading content-length',async()=>{
 assert.equal(MAX_REQUEST_BYTES,4000000);const bytes=encode('{"text":"界"}');
 assert.deepEqual(await readJSONObject(streamed([bytes],{headers:{'Content-Length':'99999999'}}),{limit:bytes.length}),{text:'界'});
 await assert.rejects(readJSONObject(streamed([bytes],{headers:{'Content-Length':'1'}}),{limit:bytes.length-1}),status(413));
 for(const limit of [0,-1,Infinity,1.5,MAX_REQUEST_BYTES+1])await assert.rejects(readJSONObject(streamed([bytes]),{limit}),/Invalid request byte limit/);
});
test('reader cancels oversized streams before draining and does not await a stalled cancel handler',async()=>{
 let pulled=0,cancelled=false;const request=new Request('https://mirra.test/',{method:'POST',duplex:'half',body:new ReadableStream({pull(c){pulled++;c.enqueue(new Uint8Array(100));},cancel(){cancelled=true;return new Promise(()=>{});}})});
 await assert.rejects(readJSONObject(request,{limit:150}),status(413));assert.equal(cancelled,true);assert.ok(pulled<=3);assert.equal(request.body.locked,false);
});
test('empty malformed non-object invalid UTF-8 and interrupted bodies are client errors',async()=>{
 for(const text of ['', '{', 'null','[]','"text"','false','12'])await assert.rejects(readJSONObject(streamed([encode(text)])),status(400));
 for(const bytes of [new Uint8Array([0xff]),new Uint8Array([0xe7,0x95])])await assert.rejects(readJSONObject(streamed([bytes])),status(400));
 await assert.rejects(readJSONObject(streamed([encode('{"text":')],{fail:true})),error=>error.status===400&&!error.message.includes('Private network detail'));
 for(const code of [400,413,500])await assert.rejects(readJSONObject(streamed([],{fail:Object.assign(Error('Private network detail'),{status:code})})),error=>error.status===400&&!error.message.includes('Private network detail'));
 await assert.rejects(readJSONObject(new Request('https://mirra.test/',{method:'POST'})),status(400));
});
