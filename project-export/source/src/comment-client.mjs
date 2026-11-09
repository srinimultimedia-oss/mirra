import {deviceDraftKey,forkCloudDrafts} from './drafts.mjs';
const clientKey='mirra.comment.client',prefix='mirra.device-draft.v2.';
export function forkCommentDrafts(storage,from,to){
 const copies=[];
 for(let index=0;index<storage.length;index++){
  const key=storage.key(index);if(!key?.startsWith(prefix))continue;
  let parts;try{parts=JSON.parse(decodeURIComponent(key.slice(prefix.length)));}catch{continue;}
  if(!Array.isArray(parts)||parts.length!==4||parts[2]!=='comment'||typeof parts[3]!=='string'||!parts[3].startsWith(from+':'))continue;
  const draft=JSON.parse(storage.getItem(key));
  if(draft?.version!==1||draft.clientId!==from||typeof draft.text!=='string'||!draft.context)throw Error('The original tab has an unreadable comment draft. It has been preserved.');
  copies.push([deviceDraftKey({userId:parts[0],id:parts[1]},'comment',to+':'+parts[3].slice(from.length+1)),JSON.stringify({...draft,clientId:to})]);
 }
 for(const[key,value]of copies)storage.setItem(key,value);
}
// A live document owns its recovery namespace. A duplicate gets a non-destructive copy.
export async function claimCommentClient(session,storage,locks,uuid=()=>crypto.randomUUID()){
 const previous=session.getItem(clientKey);let clientId=previous||uuid(),release=()=>{},held;
 const acquire=id=>new Promise((resolve,reject)=>{
  const request=locks.request('mirra.comment-client.'+id,{ifAvailable:true},lock=>{
   if(!lock){resolve(false);return;}
   return new Promise(done=>{release=done;resolve(true);});
  });request.catch(reject);held=request;
 });
 if(locks?.request){
  if(!await acquire(clientId)){
   clientId=uuid();if(!await acquire(clientId))throw Error('Could not isolate this tab’s comment drafts. Copy drafts before closing.');
   try{forkCommentDrafts(storage,previous,clientId);forkCloudDrafts(storage,previous,clientId);}catch(error){release();throw error;}
  }
 }else{
  // Without cross-document locks, fresh namespaces still isolate duplicates.
  clientId=uuid();if(previous){forkCommentDrafts(storage,previous,clientId);forkCloudDrafts(storage,previous,clientId);}
 }
 try{session.setItem(clientKey,clientId);}catch(error){release();throw error;}
 return{clientId,release:async()=>{release();await held;}};
}
