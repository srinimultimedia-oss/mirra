import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validateViewport,viewportForCamera,cameraForViewport,followViewport,FollowController} from '../src/follow.mjs';
const view={x:100,y:-200,w:800,h:600};
const people=[{client_id:'leader',viewport:view},{client_id:'middle',viewport:{x:0,y:0,w:100,h:100},followingClientId:'leader'}];
test('camera round trip preserves world rectangle and centered aspect fit',()=>{
 const camera=cameraForViewport(view,{width:800,height:600});
 assert.deepEqual(viewportForCamera(camera,{width:800,height:600}),view);
 const narrow=cameraForViewport(view,{width:400,height:800});
 assert.equal(narrow.z,.5);
 assert.deepEqual(viewportForCamera(narrow,{width:400,height:800}),{x:100,y:-700,w:800,h:1600});
 assert.equal(cameraForViewport({x:0,y:0,w:1,h:1},{width:800,height:600}).z,4);
 assert.equal(cameraForViewport({x:0,y:0,w:2e7,h:2e7},{width:100,height:100}).z,.05);
});
test('invalid shared geometry and camera sizes fail closed',()=>{
 for(const invalid of [null,[],{}, {...view,x:NaN},{...view,y:Infinity},{...view,w:0},{...view,h:-1},{...view,x:2e7+1},{...view,w:2e7+1},{...view,z:1}])assert.throws(()=>validateViewport(invalid));
 for(const size of [{width:0,height:600},{width:100,height:NaN},null]){assert.throws(()=>cameraForViewport(view,size));assert.throws(()=>viewportForCamera({x:0,y:0,z:1},size));}
 for(const z of [0,.049,4.01,Infinity])assert.throws(()=>viewportForCamera({x:0,y:0,z},{width:800,height:600}));
});
test('follow chains resolve ultimate view without aspect feedback or source mutation',()=>{
 const before=structuredClone(people),result=followViewport(people,'middle','self');
 assert.deepEqual(result,view);result.x=999;assert.deepEqual(people,before);
 assert.equal(followViewport(people,'missing','self'),null);
 assert.equal(followViewport(people,'leader','leader'),null);
 assert.equal(followViewport([{client_id:'a',viewport:view,followingClientId:'b'},{client_id:'b',viewport:view,followingClientId:'a'}],'a','self'),null);
 assert.equal(followViewport([{client_id:'a',viewport:view,followingClientId:'self'}],'a','self'),null);
 assert.equal(followViewport([{client_id:'a',viewport:{...view,w:0}}],'a','self'),null);
});
test('scope changes, inactive sessions, departure and explicit stop clear follow safely',()=>{
 const controller=new FollowController(),input={scope:'alice/board/session',self:'self',people,size:{width:800,height:600}};
 controller.start('middle',input);assert.deepEqual(controller.update(input),cameraForViewport(view,input.size));
 assert.equal(controller.stop(),true);assert.equal(controller.stop(),false);assert.equal(controller.update(input),null);
 controller.start('leader',input);assert.equal(controller.update({...input,scope:'alice/other/session'}),null);assert.equal(controller.target,null);
 controller.start('leader',input);assert.equal(controller.update({...input,active:false}),null);assert.equal(controller.target,null);
 controller.start('leader',input);assert.equal(controller.update({...input,people:[]}),null);assert.equal(controller.target,null);
 assert.throws(()=>controller.start('missing',input));assert.equal(controller.target,null);
});
import {CloudSession} from '../src/cloud-client.mjs';
import {Board} from '../src/model.mjs';
test('viewport publishing coalesces camera changes and reads latest account-bound metadata',async t=>{
 t.mock.timers.enable({apis:['setTimeout','Date']});const requests=[],doc=new Board().doc;let viewport={...view},following=null;
 const session=new CloudSession({id:'board',userId:'alice',role:'viewer',revision:3,doc},{events:false,getViewport:()=>viewport,getFollowing:()=>following,request:async(path,options)=>{requests.push({path,...structuredClone(options)});return{};}});
 session.viewportChanged();viewport={...view,x:300};following='leader';session.viewportChanged();t.mock.timers.tick(500);await Promise.resolve();
 assert.equal(requests.length,1);assert.equal(requests[0].userId,'alice');assert.deepEqual(requests[0].body.viewport,viewport);assert.equal(requests[0].body.followingClientId,'leader');assert.equal(requests[0].path,'boards/board/presence');assert.deepEqual(session.local,doc);assert.equal(session.base.revision,3);
 session.viewportChanged();t.mock.timers.tick(500);assert.equal(requests.length,1);
 viewport={...view,x:500};session.viewportChanged();session.close();t.mock.timers.tick(1000);assert.equal(requests.length,1);
});
