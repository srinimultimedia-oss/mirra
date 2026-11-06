const LIMIT=2e7;
export function validateViewport(value){if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).sort().join(',')!=='h,w,x,y'||![value.x,value.y,value.w,value.h].every(Number.isFinite)||Math.abs(value.x)>LIMIT||Math.abs(value.y)>LIMIT||value.w<=0||value.h<=0||value.w>LIMIT||value.h>LIMIT)throw Error('Invalid shared viewport');return{x:value.x,y:value.y,w:value.w,h:value.h};}
export function viewportForCamera(camera,size){if(!camera||![camera.x,camera.y,camera.z,size?.width,size?.height].every(Number.isFinite)||camera.z<.05||camera.z>4||size.width<=0||size.height<=0)throw Error('Invalid camera viewport');return validateViewport({x:-camera.x/camera.z,y:-camera.y/camera.z,w:size.width/camera.z,h:size.height/camera.z});}
export function cameraForViewport(value,size){const view=validateViewport(value);if(![size?.width,size?.height].every(Number.isFinite)||size.width<=0||size.height<=0)throw Error('Invalid follower viewport');const z=Math.max(.05,Math.min(4,size.width/view.w,size.height/view.h));return{x:size.width/2-(view.x+view.w/2)*z,y:size.height/2-(view.y+view.h/2)*z,z};}
export function followViewport(people,target,self){const byId=new Map(people.map(person=>[person.client_id,person])),seen=new Set([self]);let id=target;while(id){if(seen.has(id))return null;seen.add(id);const person=byId.get(id);if(!person)return null;try{validateViewport(person.viewport);}catch{return null;}if(!person.followingClientId)return structuredClone(person.viewport);id=person.followingClientId;}return null;}
export class FollowController{
 constructor(){this.scope=null;this.target=null;}
 sync(scope){if(scope!==this.scope){this.scope=scope;this.target=null;}}
 start(id,{scope,self,people}){this.sync(scope);if(!followViewport(people,id,self))throw Error('This collaborator’s view is unavailable');this.target=id;}
 stop(){const stopped=this.target!==null;this.target=null;return stopped;}
 update({scope,self,people,size,active=true}){this.sync(scope);if(!active){this.stop();return null;}if(!this.target)return null;const view=followViewport(people,this.target,self);if(!view){this.stop();return null;}return cameraForViewport(view,size);}
}
