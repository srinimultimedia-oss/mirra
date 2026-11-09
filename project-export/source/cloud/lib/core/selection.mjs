import {bounds} from './model.mjs';
export function marqueeSelection(items,rectangle){
 const {x,y,w,h}=rectangle;if(![x,y,w,h].every(Number.isFinite)||w<0||h<0)throw Error('Invalid selection rectangle');
 const context=new Map(items.map(item=>[item.id,item])),epsilon=1e-7;
 return items.filter(item=>{const box=bounds([item],context);return box.x>=x-epsilon&&box.y>=y-epsilon&&box.x+box.w<=x+w+epsilon&&box.y+box.h<=y+h+epsilon;}).map(item=>item.id);
}
