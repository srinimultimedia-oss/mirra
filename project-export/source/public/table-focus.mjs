// Stable accessible names identify controls across table rerenders.
export function captureTableFocus(dialog){
 const active=dialog.ownerDocument.activeElement;
 if(!dialog.contains(active))return null;
 const label=active.getAttribute('aria-label');if(!label)return null;
 return{label,start:active.selectionStart,end:active.selectionEnd};
}
export function restoreTableFocus(dialog,state){
 if(!state)return false;
 const target=[...dialog.querySelectorAll('[aria-label]')].find(node=>node.getAttribute('aria-label')===state.label&&!node.disabled&&node.getClientRects().length);
 if(!target)return false;
 target.focus({preventScroll:true});
 if(Number.isInteger(state.start)&&Number.isInteger(state.end)&&typeof target.setSelectionRange==='function')try{target.setSelectionRange(state.start,state.end);}catch{}
 return true;
}
export function tabTableCell(event,dialog){
 const input=event.target;
 if(event.key!=='Tab'||event.ctrlKey||event.altKey||event.metaKey||!input.closest('.records-grid')||!['text','number','url'].includes(input.type))return false;
 const controls=[...dialog.querySelectorAll('input,select,textarea,button,summary,a[href]')].filter(node=>!node.disabled&&node.tabIndex>=0&&node.getClientRects().length);
 const index=controls.indexOf(input);if(index<0)return false;
 const next=controls[(index+(event.shiftKey?-1:1)+controls.length)%controls.length],label=next.getAttribute('aria-label');
 // Unlabelled controls retain native navigation, rather than guessing a target.
 if(!label)return false;
 event.preventDefault();input.blur();
 restoreTableFocus(dialog,{label});return true;
}
