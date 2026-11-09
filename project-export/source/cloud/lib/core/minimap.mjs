import{visualBox,resolveEndpoint,connectorGeometry}from'./geometry.mjs';
const finite=value=>typeof value==='number'&&Number.isFinite(value);
function extent(points){let x=Infinity,y=Infinity,right=-Infinity,bottom=-Infinity;for(const p of points){x=Math.min(x,p.x);y=Math.min(y,p.y);right=Math.max(right,p.x);bottom=Math.max(bottom,p.y);}return{x,y,w:Math.max(1,right-x),h:Math.max(1,bottom-y)};}
export function overviewGeometry(items){
  const byId=new Map(items.map(item=>[item.id,item]));return items.map(item=>{
    if(item.type==='connector'){const from=resolveEndpoint(byId,item.from),to=resolveEndpoint(byId,item.to);if(!from||!to)return null;const g=connectorGeometry(from,to,item.route);return{id:item.id,type:item.type,fill:item.stroke||item.fill,box:extent([g.a,g.b]),path:g.path};}
    if(item.type==='pen'){const angle=(item.rotation||0)*Math.PI/180,c=Math.cos(angle),s=Math.sin(angle),cx=item.w/2,cy=item.h/2,points=item.points.map(([x,y])=>({x:item.x+cx+(x-cx)*c-(y-cy)*s,y:item.y+cy+(x-cx)*s+(y-cy)*c}));return{id:item.id,type:item.type,fill:item.stroke||item.fill,box:extent(points),path:points.map((p,i)=>`${i?'L':'M'}${p.x} ${p.y}`).join(' ')};}
    return{id:item.id,type:item.type,fill:item.fill,box:visualBox(item)};
  }).filter(Boolean);
}
export function worldViewport(camera,viewport){
  if(![camera.x,camera.y,camera.z,viewport.width,viewport.height].every(finite)||camera.z<=0||viewport.width<=0||viewport.height<=0)throw Error('Invalid minimap viewport');
  const box={x:-camera.x/camera.z,y:-camera.y/camera.z,w:viewport.width/camera.z,h:viewport.height/camera.z};if(!Object.values(box).every(finite))throw Error('Minimap viewport exceeds numeric limits');return box;
}
export function overviewProjection(nodes,camera,viewport,{width=240,height=150,padding=8}={}){
  if(![width,height,padding].every(finite)||padding<0||width<=padding*2||height<=padding*2)throw Error('Invalid minimap size');
  const view=worldViewport(camera,viewport);let x=view.x,y=view.y,right=view.x+view.w,bottom=view.y+view.h;
  for(const node of nodes){const b=node.box;if(![b.x,b.y,b.w,b.h].every(finite)||b.w<0||b.h<0)throw Error('Invalid minimap object');x=Math.min(x,b.x);y=Math.min(y,b.y);right=Math.max(right,b.x+b.w);bottom=Math.max(bottom,b.y+b.h);}
  const bounds={x,y,w:Math.max(1,right-x),h:Math.max(1,bottom-y)},scale=Math.min((width-padding*2)/bounds.w,(height-padding*2)/bounds.h),offsetX=(width-bounds.w*scale)/2-bounds.x*scale,offsetY=(height-bounds.h*scale)/2-bounds.y*scale;
  return{width,height,bounds,scale,offsetX,offsetY};
}
export function projectBox(box,p){return{x:box.x*p.scale+p.offsetX,y:box.y*p.scale+p.offsetY,w:box.w*p.scale,h:box.h*p.scale};}
export function overviewPoint(point,p){if(![point.x,point.y,p.scale,p.offsetX,p.offsetY].every(finite)||p.scale<=0)throw Error('Invalid minimap point');return{x:(point.x-p.offsetX)/p.scale,y:(point.y-p.offsetY)/p.scale};}
export function cameraAt(camera,viewport,point){worldViewport(camera,viewport);if(![point.x,point.y].every(finite))throw Error('Invalid camera target');const next={x:viewport.width/2-point.x*camera.z,y:viewport.height/2-point.y*camera.z,z:camera.z};if(!Object.values(next).every(finite))throw Error('Camera target exceeds numeric limits');return next;}
export function panOverview(camera,viewport,key,shift=false){const view=worldViewport(camera,viewport),step=shift?1:.25,dx=key==='ArrowLeft'?-view.w*step:key==='ArrowRight'?view.w*step:0,dy=key==='ArrowUp'?-view.h*step:key==='ArrowDown'?view.h*step:0;return cameraAt(camera,viewport,{x:view.x+view.w/2+dx,y:view.y+view.h/2+dy});}
