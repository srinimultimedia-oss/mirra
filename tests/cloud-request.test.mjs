import {test} from 'node:test';
import assert from 'node:assert/strict';
import {cloudRequest,CloudSession} from '../src/cloud-client.mjs';
import {Board} from '../src/model.mjs';

test('HTML authentication and upstream errors preserve actionable HTTP status',async t=>{
  for(const status of [401,403,502]){
    t.mock.method(globalThis,'fetch',async()=>new Response('<html>Service response</html>',{status,headers:{'Content-Type':'text/html'}}));
    await assert.rejects(cloudRequest('boards'),error=>error.status===status&&/sign in|access|cloud/i.test(error.message));
    t.mock.restoreAll();
  }
});
test('a login redirect is reported as expired authentication rather than a network outage',async t=>{
  t.mock.method(globalThis,'fetch',async()=>({status:200,ok:true,redirected:true,url:'https://auth.openai.com/log-in',headers:new Headers({'Content-Type':'text/html'}),json:async()=>{throw new SyntaxError('Unexpected token <');}}));
  await assert.rejects(cloudRequest('boards'),error=>error.status===401&&/sign in/i.test(error.message));
});
test('invalid successful response is not accepted as a cloud snapshot',async t=>{
  for(const response of [new Response('not json',{status:200}),new Response('null',{headers:{'Content-Type':'application/json'}})]){
    t.mock.method(globalThis,'fetch',async()=>response);
    await assert.rejects(cloudRequest('boards'),error=>error.status===502);
    t.mock.restoreAll();
  }
});
test('expired authentication stops automatic mutation retries and retains the unsaved document',async t=>{
  t.mock.method(globalThis,'fetch',async()=>new Response('<html>Log in</html>',{status:401}));
  const b=new Board();const id=b.add('sticky',0,0);const session=new CloudSession({id:'test',doc:b.doc,revision:0,role:'editor'},{events:false});
  try{b.update([id],{text:'Unsaved draft'});session.setDocument(b.doc);await assert.rejects(session.flush());assert.equal(session.conflict?.status,401);assert.equal(session.canEdit,false);assert.equal(session.local.items[0].text,'Unsaved draft');assert.equal(session.retryTimer,undefined);}finally{session.close();}
});
test('valid JSON success and structured conflicts keep their payloads',async t=>{
  t.mock.method(globalThis,'fetch',async()=>Response.json({revision:3,doc:{name:'Saved'}}));
  assert.deepEqual(await cloudRequest('boards/test'),{revision:3,doc:{name:'Saved'}});
  t.mock.restoreAll();
  const data={error:'Concurrent edit',snapshot:{revision:4},conflicts:[{field:'text'}]};
  t.mock.method(globalThis,'fetch',async()=>Response.json(data,{status:409}));
  await assert.rejects(cloudRequest('boards/test/changes',{method:'POST',body:{changes:[]}}),error=>error.status===409&&error.message==='Concurrent edit'&&error.data.snapshot.revision===4);
});
test('bound cloud requests carry the expected authenticated subject',async t=>{let headers;t.mock.method(globalThis,'fetch',async(_url,options)=>{headers=options.headers;return Response.json({ok:true});});await cloudRequest('boards/test',{userId:'alice'});assert.equal(new Headers(headers).get('X-Mirra-User'),'alice');});
