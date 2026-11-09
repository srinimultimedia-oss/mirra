import {visualBox,frameContains} from './geometry.mjs';

// Broad-phase bounds only discard impossible candidates. The existing rotated
// corner test remains the final authority, including its boundary tolerance.
const MARGIN=1e-5,LEAF_SIZE=8;
const rank=(a,b)=>a.frame.id.localeCompare(b.frame.id)||a.order-b.order;
const earlier=(a,b)=>a.minArea-b.minArea||rank(a.first,b.first);
function build(entries){
 if(!entries.length)return null;
 const node={x1:Infinity,y1:Infinity,x2:-Infinity,y2:-Infinity,minArea:Infinity,maxArea:-Infinity};
 let cx1=Infinity,cy1=Infinity,cx2=-Infinity,cy2=-Infinity;
 for(const e of entries){node.x1=Math.min(node.x1,e.x1);node.y1=Math.min(node.y1,e.y1);node.x2=Math.max(node.x2,e.x2);node.y2=Math.max(node.y2,e.y2);node.minArea=Math.min(node.minArea,e.area);node.maxArea=Math.max(node.maxArea,e.area);if(!node.first||rank(e,node.first)<0)node.first=e;cx1=Math.min(cx1,e.cx);cx2=Math.max(cx2,e.cx);cy1=Math.min(cy1,e.cy);cy2=Math.max(cy2,e.cy);}
 if(entries.length<=LEAF_SIZE){node.entries=entries;return node;}
 const axis=cx2-cx1>=cy2-cy1?'cx':'cy';entries.sort((a,b)=>a[axis]-b[axis]||a.area-b.area||rank(a,b));
 const middle=entries.length>>1;node.left=build(entries.slice(0,middle));node.right=build(entries.slice(middle));return node;
}
function push(heap,node){let at=heap.length;heap.push(node);while(at){const parent=(at-1)>>1;if(earlier(heap[parent],node)<=0)break;heap[at]=heap[parent];at=parent;}heap[at]=node;}
function pop(heap){const first=heap[0],last=heap.pop();if(heap.length){let at=0;while(at*2+1<heap.length){let child=at*2+1;if(child+1<heap.length&&earlier(heap[child+1],heap[child])<0)child++;if(earlier(heap[child],last)>=0)break;heap[at]=heap[child];at=child;}heap[at]=last;}return first;}

export function frameIndex(frames){
 const entries=frames.map((frame,order)=>{const box=visualBox(frame);return{frame,order,area:frame.w*frame.h,cx:frame.x+frame.w/2,cy:frame.y+frame.h/2,x1:box.x-MARGIN,y1:box.y-MARGIN,x2:box.x+box.w+MARGIN,y2:box.y+box.h+MARGIN};}),byId=new Map(entries.map(e=>[e.frame.id,e])),root=build(entries);
 return{containing(item){
  const x=item.x+item.w/2,y=item.y+item.h/2,area=item.w*item.h,preferred=byId.get(item.parentId);let best,bestArea=Infinity;
  if(preferred&&preferred.area>area&&preferred.frame.id!==item.id&&frameContains(preferred.frame,item)){best=preferred;bestArea=preferred.area;}
  const eligible=node=>node&&node.maxArea>area&&node.minArea<=bestArea&&!(best&&node.minArea===bestArea&&(best===preferred||rank(node.first,best)>=0))&&x>=node.x1&&x<=node.x2&&y>=node.y1&&y<=node.y2;
  if(!eligible(root))return best?.frame;
  const heap=[];push(heap,root);
  while(heap.length){
   const node=pop(heap);if(!eligible(node))continue;
   if(node.entries){for(const e of node.entries){
    if(e.frame.id===item.id||e.area<=area||e.area>bestArea||x<e.x1||x>e.x2||y<e.y1||y>e.y2||!frameContains(e.frame,item))continue;
    if(!best||e.area<bestArea||e.area===bestArea&&best!==preferred&&rank(e,best)<0){best=e;bestArea=e.area;}
   }}else{if(eligible(node.left))push(heap,node.left);if(eligible(node.right))push(heap,node.right);}
  }
  return best?.frame;
 }};
}
