import {validateDocument} from './model.mjs';

export function deviceDraftKey(snapshot,kind='board',context=''){
  if(typeof snapshot?.userId!=='string'||!snapshot.userId||typeof snapshot.id!=='string'||!snapshot.id)throw Error('Cloud identity unavailable. Export your work before reloading.');
  if(!['board','comment'].includes(kind)||typeof context!=='string')throw Error('Invalid draft context');
  return 'mirra.device-draft.v2.'+encodeURIComponent(JSON.stringify([snapshot.userId,snapshot.id,kind,context]));
}
export function saveCloudDraft(storage,snapshot,doc,context=''){
  if(!['owner','editor'].includes(snapshot.role))throw Error('This cloud board is read-only');
  if(!Number.isSafeInteger(snapshot.revision)||snapshot.revision<0)throw Error('Invalid draft revision');
  const key=deviceDraftKey(snapshot,'board',context),draft={version:2,userId:snapshot.userId,boardId:snapshot.id,revision:snapshot.revision,...(context?{context}:{}),doc:validateDocument(doc)};
  storage.setItem(key,JSON.stringify(draft));return draft;
}
function parseCloudDraft(raw,snapshot,context){
  const draft=JSON.parse(raw);
  if(draft?.version!==2||draft.userId!==snapshot.userId||draft.boardId!==snapshot.id||(draft.context??'')!==context||!Number.isSafeInteger(draft.revision)||draft.revision<0)throw Error('Device draft could not be verified. It has been preserved.');
  return{...draft,doc:validateDocument(draft.doc)};
}
export function readCloudDraft(storage,snapshot,context=''){const raw=storage.getItem(deviceDraftKey(snapshot,'board',context));return raw===null?null:parseCloudDraft(raw,snapshot,context);}
const prefix='mirra.device-draft.v2.';
function partsFor(key){try{if(!key?.startsWith(prefix))return null;const parts=JSON.parse(decodeURIComponent(key.slice(prefix.length)));return Array.isArray(parts)&&parts.length===4&&parts[2]==='board'&&parts.every(part=>typeof part==='string')?parts:null;}catch{return null;}}
export function listCloudDrafts(storage,snapshot,{excludeContext}={}){
  deviceDraftKey(snapshot);const entries=[];for(let index=0;index<storage.length;index++){const key=storage.key(index),parts=partsFor(key);if(!parts||parts[0]!==snapshot.userId||parts[1]!==snapshot.id||parts[3]===excludeContext)continue;const raw=storage.getItem(key);if(raw===null)continue;try{const draft=parseCloudDraft(raw,snapshot,parts[3]);entries.push({context:parts[3],raw,doc:draft.doc,revision:draft.revision});}catch(error){let foreign=false;try{const value=JSON.parse(raw);foreign=typeof value?.userId==='string'&&value.userId!==snapshot.userId||typeof value?.boardId==='string'&&value.boardId!==snapshot.id;}catch{}entries.push({context:parts[3],raw:foreign?null:raw,error:error.message,...(foreign?{unavailable:true}:{})});}}return entries.sort((a,b)=>a.context.localeCompare(b.context));
}
export function forkCloudDrafts(storage,from,to){
  if(!from||from===to)return;const copies=[];for(let index=0;index<storage.length;index++){const key=storage.key(index),parts=partsFor(key);if(!parts||parts[3]!==from)continue;const snapshot={userId:parts[0],id:parts[1]},draft=parseCloudDraft(storage.getItem(key),snapshot,from),target=deviceDraftKey(snapshot,'board',to);if(storage.getItem(target)!==null)throw Error('The new tab already has a backup. Existing copies were preserved.');copies.push([target,JSON.stringify({...draft,context:to})]);}for(const[key,value]of copies)storage.setItem(key,value);
}
// Legacy drafts have no account identity. Use only for an explicit local export;
// never feed this data into automatic recovery or a cloud save.
export function readLegacyCloudDraft(storage,boardId){
  const raw=storage.getItem('mirra.cloud.draft.'+boardId);if(raw===null)return null;
  const draft=JSON.parse(raw);return{doc:validateDocument(draft.doc)};
}
