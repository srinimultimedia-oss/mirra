export function presentationFrame(items,state,offset=0){
 const frames=items.filter(item=>item.type==='frame'&&!item.parentId);if(!frames.length)return null;
 const found=frames.findIndex(frame=>frame.id===state.id),base=found>=0?found:Math.max(0,Math.min(state.index,frames.length-1)),index=((base+offset)%frames.length+frames.length)%frames.length;
 return{id:frames[index].id,index,count:frames.length,frame:frames[index]};
}
export function presentationKey(event,active){
 if(!active||event.defaultPrevented||event.ctrlKey||event.altKey||event.metaKey||event.target.closest('input,textarea,select,dialog,[contenteditable]:not([contenteditable="false"])'))return null;
 return{ArrowRight:'next',ArrowLeft:'previous',Home:'first',End:'last',Escape:'end'}[event.key]||null;
}
