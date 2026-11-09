const labels=new Set(['Filter field','Filter operation','Filter value','Bulk edit field','Bulk cell value','New field name','New field type']);
const controls=dialog=>[...dialog.querySelectorAll('input[aria-label],select[aria-label]')];
export function captureTableForms(dialog){
 return new Map(controls(dialog).filter(node=>labels.has(node.getAttribute('aria-label'))).map(node=>[node.getAttribute('aria-label'),node.value]));
}
export function restoreTableForms(dialog,state){
 for(const node of controls(dialog)){
  const label=node.getAttribute('aria-label');if(!labels.has(label)||!state.has(label))continue;
  const value=state.get(label);
  if(node.tagName==='SELECT'&&![...node.options].some(option=>option.value===value)){
   const missing=dialog.ownerDocument.createElement('option');missing.value=value;missing.textContent='Unavailable option — choose another';missing.disabled=true;node.append(missing);
  }
  node.value=value;
 }
}
export function clearTableForm(dialog,label){
 if(!labels.has(label))return false;const node=controls(dialog).find(node=>node.getAttribute('aria-label')===label);if(!node)return false;node.value='';return true;
}
