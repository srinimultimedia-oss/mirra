export const FRAME_PRESETS=Object.freeze([
  {label:'Wide · 16:9',w:640,h:360},
  {label:'Classic · 4:3',w:640,h:480},
  {label:'Square · 1:1',w:480,h:480},
  {label:'Portrait paper · A4',w:595,h:842},
  {label:'Landscape paper · A4',w:842,h:595},
  {label:'Phone · 6:13',w:360,h:780},
].map(Object.freeze));

export function frameSize(w,h){
  if(![w,h].every(value=>typeof value==='number'&&Number.isInteger(value)&&value>=1&&value<=100000))throw Error('Frame dimensions must be whole numbers from 1 to 100,000.');
  return{w,h};
}

export function mountFramePresets(body,{size,canEdit,onChoose}){
  const choose=(w,h)=>{if(canEdit())onChoose(frameSize(w,h));};
  const intro=document.createElement('p');intro.textContent='Choose a ratio, then place the frame on your board.';body.append(intro);
  for(const preset of FRAME_PRESETS){const button=document.createElement('button');button.textContent=`${preset.label} · ${preset.w} × ${preset.h}`;button.dataset.mutation='true';button.disabled=!canEdit();button.onclick=()=>choose(preset.w,preset.h);body.append(button);}
  const form=document.createElement('form'),heading=document.createElement('h3'),fields=document.createElement('div');heading.textContent='Custom size';fields.className='fieldgrid';
  const inputs=['Width','Height'].map((name,index)=>{const label=document.createElement('label'),input=document.createElement('input');label.textContent=name;input.type='number';input.min='1';input.max='100000';input.step='1';input.required=true;input.value=String(index?size.h:size.w);input.setAttribute('aria-label',`Frame ${name.toLowerCase()}`);label.append(input);fields.append(label);return input;});
  const error=document.createElement('p');error.className='formerror';error.setAttribute('role','alert');
  const swap=document.createElement('button');swap.type='button';swap.textContent='Swap width and height';swap.onclick=()=>{const previous=inputs[0].value;inputs[0].value=inputs[1].value;inputs[1].value=previous;error.textContent='';};
  const submit=document.createElement('button');submit.type='submit';submit.textContent='Use custom frame';submit.dataset.mutation='true';submit.disabled=!canEdit();
  form.onsubmit=event=>{event.preventDefault();try{choose(...inputs.map(input=>input.valueAsNumber));}catch(problem){error.textContent=problem.message;}};
  form.append(heading,fields,swap,error,submit);body.append(form);body.querySelector('button')?.focus();
}
