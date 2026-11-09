export const SHAPES=['rectangle','rounded','ellipse','diamond','triangle','hexagon','parallelogram'];
export function shapeGeometry(shape,w,h){
  if(shape==='ellipse')return{tag:'ellipse',attrs:{cx:w/2,cy:h/2,rx:w/2,ry:h/2}};
  const vertices={diamond:[[w/2,0],[w,h/2],[w/2,h],[0,h/2]],triangle:[[w/2,0],[w,h],[0,h]],hexagon:[[w*.25,0],[w*.75,0],[w,h/2],[w*.75,h],[w*.25,h],[0,h/2]],parallelogram:[[w*.2,0],[w,0],[w*.8,h],[0,h]]}[shape];
  if(vertices)return{tag:'polygon',attrs:{points:vertices.map(p=>p.join(',')).join(' ')},vertices};
  return{tag:'rect',attrs:{width:w,height:h,rx:shape==='rounded'?Math.min(20,w/4,h/4):2},vertices:[[0,0],[w,0],[w,h],[0,h]]};
}
export function center(item){return{x:item.x+item.w/2,y:item.y+item.h/2};}
export function resolveEndpoint(items,endpoint){return typeof endpoint==='string'?(items instanceof Map?items.get(endpoint):items.find(item=>item.id===endpoint)):{...endpoint,w:0,h:0};}
export function translateFreeEndpoints(item,dx,dy){if(item.type==='connector')for(const key of ['from','to'])if(typeof item[key]!=='string'){item[key]={x:item[key].x+dx,y:item[key].y+dy};}}
function rotate(x,y,angle){const c=Math.cos(angle),s=Math.sin(angle);return{x:x*c-y*s,y:x*s+y*c};}
export function localDelta(dx,dy,degrees=0){return rotate(dx,dy,-degrees*Math.PI/180);}
export function frameContains(frame,item){
 const epsilon=1e-7;
 if(!(frame.rotation||item.rotation))return item.x>=frame.x-epsilon&&item.y>=frame.y-epsilon&&item.x+item.w<=frame.x+frame.w+epsilon&&item.y+item.h<=frame.y+frame.h+epsilon;
 const fc=center(frame),ic=center(item),angle=(item.rotation||0)*Math.PI/180;
 return[[-item.w/2,-item.h/2],[item.w/2,-item.h/2],[item.w/2,item.h/2],[-item.w/2,item.h/2]].every(([x,y])=>{const offset=rotate(x,y,angle),point=localDelta(ic.x+offset.x-fc.x,ic.y+offset.y-fc.y,frame.rotation);return Math.abs(point.x)<=frame.w/2+epsilon&&Math.abs(point.y)<=frame.h/2+epsilon;});
}
export function resizedOrigin(item,w,h){const dw=(w-item.w)/2,dh=(h-item.h)/2,shift=rotate(dw,dh,(item.rotation||0)*Math.PI/180);return{x:item.x+shift.x-dw,y:item.y+shift.y-dh};}
export function edgePoint(item,toward){
  const c=center(item),r=(item.rotation||0)*Math.PI/180,v=rotate(toward.x-c.x,toward.y-c.y,-r);
  if(Math.abs(v.x)+Math.abs(v.y)<1e-9)return c;
  let t=Infinity;
  if(item.shape==='ellipse')t=1/Math.sqrt((v.x/(item.w/2))**2+(v.y/(item.h/2))**2);
  else{
    const vertices=shapeGeometry(item.shape,item.w,item.h).vertices;
    for(let i=0;i<vertices.length;i++){
      const a={x:vertices[i][0]-item.w/2,y:vertices[i][1]-item.h/2},b={x:vertices[(i+1)%vertices.length][0]-item.w/2,y:vertices[(i+1)%vertices.length][1]-item.h/2},d={x:b.x-a.x,y:b.y-a.y};
      const cross=v.x*d.y-v.y*d.x;if(Math.abs(cross)<1e-9)continue;
      const ray=(a.x*d.y-a.y*d.x)/cross,u=(a.x*v.y-a.y*v.x)/cross;
      if(ray>=0&&u>=-1e-9&&u<=1+1e-9)t=Math.min(t,ray);
    }
  }
  if(!Number.isFinite(t))return c;const p=rotate(v.x*t,v.y*t,r);return{x:c.x+p.x,y:c.y+p.y};
}
export function connectorGeometry(from,to,route='straight'){
  const a=edgePoint(from,center(to)),b=edgePoint(to,center(from)),mid={x:(a.x+b.x)/2,y:(a.y+b.y)/2};
  const path=route==='orthogonal'?`M${a.x} ${a.y} H${mid.x} V${b.y} H${b.x}`:route==='curve'?`M${a.x} ${a.y} C${mid.x} ${a.y} ${mid.x} ${b.y} ${b.x} ${b.y}`:`M${a.x} ${a.y} L${b.x} ${b.y}`;
  return{a,b,mid,path};
}
export function visualBox(item){
  if(item.type==='connector'&&typeof item.from==='object'&&typeof item.to==='object'){const x=Math.min(item.from.x,item.to.x),y=Math.min(item.from.y,item.to.y);return{x,y,w:Math.max(1,Math.abs(item.to.x-item.from.x)),h:Math.max(1,Math.abs(item.to.y-item.from.y))};}
  const c=center(item),angle=(item.rotation||0)*Math.PI/180;
  const points=[[-item.w/2,-item.h/2],[item.w/2,-item.h/2],[item.w/2,item.h/2],[-item.w/2,item.h/2]].map(p=>rotate(p[0],p[1],angle));
  const x=Math.min(...points.map(p=>p.x))+c.x,y=Math.min(...points.map(p=>p.y))+c.y;
  return{x,y,w:Math.max(...points.map(p=>p.x))+c.x-x,h:Math.max(...points.map(p=>p.y))+c.y-y};
}
