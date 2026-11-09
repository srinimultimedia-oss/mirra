export function mountFrameSequence(body,{frames,writable,onMove,onOpen,onPresent,onCreate}){
  const focused=body.contains(document.activeElement)?{id:document.activeElement.dataset.frameId,action:document.activeElement.dataset.frameAction}:null;
  body.replaceChildren();
  const intro=document.createElement('p');intro.textContent=frames.length?'Root frames appear in this order when presenting. Nested frames stay within their parent.':'Add frames to build a presentation.';body.append(intro);
  const buttons=[];
  function button(parent,label,action,id,key,{mutation=false,boundary=false}={}){const b=document.createElement('button');b.type='button';b.textContent=label;b.dataset.frameId=id||'';b.dataset.frameAction=key;if(mutation&&!boundary)b.dataset.mutation='true';b.disabled=boundary||(mutation&&!writable);b.onclick=action;parent.append(b);buttons.push(b);return b;}
  if(!frames.length)button(body,'Choose frame sizes',onCreate,'','create',{mutation:true});
  frames.forEach((frame,index)=>{const group=document.createElement('fieldset'),legend=document.createElement('legend');group.className='frame-sequence-item';legend.textContent=`${index+1} · ${frame.text||'Untitled frame'}`;group.append(legend);const label=`${index+1} · ${frame.text||'Untitled frame'}`;button(group,'Go to frame · '+label,()=>onOpen(frame.id),frame.id,'view');button(group,'Present from here · '+label,()=>onPresent(frame.id),frame.id,'present');button(group,'Move earlier · '+label,()=>onMove(frame.id,-1),frame.id,'earlier',{mutation:true,boundary:index===0});button(group,'Move later · '+label,()=>onMove(frame.id,1),frame.id,'later',{mutation:true,boundary:index===frames.length-1});body.append(group);});
  if(focused?.id){const target=buttons.find(b=>b.dataset.frameId===focused.id&&b.dataset.frameAction===focused.action&&!b.disabled)||buttons.find(b=>b.dataset.frameId===focused.id);target?.focus();}
}
