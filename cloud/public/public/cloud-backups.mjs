import{listCloudDrafts}from'../src/drafts.mjs';
export function mountCloudBackups({parent,storage,getSession,context,download}){
 const node=(tag,text)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;return e;},section=node('details'),summary=node('summary'),intro=node('p','Review backups from this tab, other tabs and earlier versions before restoring them. Reviewing or downloading does not change this board.'),list=node('div');section.className='other-backups';section.hidden=true;section.append(summary,intro,list);parent.append(section);
 const dialog=node('dialog');dialog.id='backupreview';dialog.setAttribute('aria-labelledby','backupreviewheading');const heading=node('h2','Review device backup');heading.id='backupreviewheading';const notice=node('p'),raw=node('textarea');raw.readOnly=true;raw.setAttribute('aria-label','Backup JSON');raw.spellcheck=false;const actions=node('div');actions.className='dialogbuttons';const save=node('button','Download reviewed backup'),close=node('button','Close backup review');actions.append(save,close);dialog.append(heading,notice,raw,actions);document.body.append(dialog);let captured=null,opener=null;
 save.onclick=()=>{if(captured)download(captured.error?'mirra-backup-recovery.txt':'mirra-backup-review.json',raw.value,captured.error?'text/plain;charset=utf-8':'application/json');};close.onclick=()=>dialog.close();dialog.addEventListener('close',()=>{raw.value='';captured=null;if(opener?.isConnected)opener.focus();opener=null;});
 function reset(){section.hidden=true;list.replaceChildren();}
 function refresh(){
  reset();const source=getSession();if(!source||source.closed)return;
  try{const entries=listCloudDrafts(storage(),source.base);if(!entries.length)return;section.hidden=false;summary.textContent=`Device backups (${entries.length})`;
   for(const[index,entry]of entries.entries()){
    const label=entry.context===context()?'This tab':entry.context?'Other tab':'Earlier shared backup',button=node('button',`${label} ${index+1} · ${entry.error?'needs recovery':'revision '+entry.revision}`);button.disabled=!!entry.unavailable;if(entry.unavailable)button.title='This backup has a different account or board identity. Its bytes were left untouched.';
    button.onclick=()=>{if(getSession()!==source||source.closed)return;captured=entry;opener=button;notice.textContent=entry.error?'This backup could not be validated. Its original bytes are preserved for recovery.':`Revision ${entry.revision} · ${entry.doc.items.length} objects. Preview: ${Array.from(entry.doc.items.find(item=>item.text)?.text||'No text content').slice(0,80).join('')}. Reviewing does not change the board.`;raw.value=entry.error?entry.raw:JSON.stringify(entry.doc,null,2);raw.setSelectionRange(0,0);dialog.showModal();raw.focus();raw.scrollTop=0;};list.append(button);
   }
  }catch{section.hidden=false;summary.textContent='Device backups';list.textContent='Device backups could not be read. Existing data was left in place.';}
 }
 return{reset,refresh};
}
