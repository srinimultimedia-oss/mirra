import {deviceDraftKey} from './drafts.mjs';
const contextId=context=>context.editId||context.parentId||'new';
export const commentDraftKey=(snapshot,clientId,context)=>{if(typeof clientId!=='string'||!clientId)throw Error('Comment draft session unavailable');return deviceDraftKey(snapshot,'comment',clientId+':'+contextId(context));};
function validate(draft,context){if(!draft||typeof draft.text!=='string'||draft.text.length>10000||!draft.context||contextId(draft.context)!==contextId(context))throw Error('Comment draft could not be restored. It has been preserved.');return draft;}
export function readCommentDraft(storage,snapshot,clientId,context){
  const key=commentDraftKey(snapshot,clientId,context),raw=storage.getItem(key);
  if(raw!==null){const draft=validate(JSON.parse(raw),context);if(draft.clientId!==clientId||draft.version!==1)throw Error('Comment draft session mismatch');return draft;}
  const previousKey=deviceDraftKey(snapshot,'comment',contextId(context)),previous=storage.getItem(previousKey);if(previous===null)return null;
  const draft={...validate(JSON.parse(previous),context),version:1,clientId};
  storage.setItem(key,JSON.stringify(draft));storage.removeItem(previousKey);return draft;
}
export function saveCommentDraft(storage,snapshot,clientId,context,text){const draft=validate({version:1,clientId,context:structuredClone(context),text},context);storage.setItem(commentDraftKey(snapshot,clientId,context),JSON.stringify(draft));return draft;}
