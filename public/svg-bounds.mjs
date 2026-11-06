import {visualBox} from '../src/geometry.mjs';
export function svgExportBox(items,measure=()=>null){
 const boxes=items.map(item=>{let box;try{box=measure(item);}catch{}if(!box||![box.x,box.y,box.width,box.height].every(Number.isFinite)||box.width<0||box.height<0||box.width+box.height===0)return visualBox(item);
  if(item.type==='connector')return{x:box.x,y:box.y,w:box.width,h:box.height};
  const angle=(item.rotation||0)*Math.PI/180,c=Math.cos(angle),s=Math.sin(angle),cx=item.w/2,cy=item.h/2;
  const points=[[box.x,box.y],[box.x+box.width,box.y],[box.x,box.y+box.height],[box.x+box.width,box.y+box.height]].map(([x,y])=>({x:item.x+cx+(x-cx)*c-(y-cy)*s,y:item.y+cy+(x-cx)*s+(y-cy)*c})),x=Math.min(...points.map(p=>p.x)),y=Math.min(...points.map(p=>p.y));return{x,y,w:Math.max(...points.map(p=>p.x))-x,h:Math.max(...points.map(p=>p.y))-y};
 });
 if(!boxes.length)return{x:-30,y:-30,w:61,h:61};
 const padding=Math.max(30,...items.map(item=>item.type==='connector'&&(item.arrow||'end')!=='none'?(item.strokeWidth??2)*10:(item.strokeWidth??1)/2)),x=Math.min(...boxes.map(box=>box.x)),y=Math.min(...boxes.map(box=>box.y));
 return{x:x-padding,y:y-padding,w:Math.max(...boxes.map(box=>box.x+box.w))-x+padding*2,h:Math.max(...boxes.map(box=>box.y+box.h))-y+padding*2};
}
