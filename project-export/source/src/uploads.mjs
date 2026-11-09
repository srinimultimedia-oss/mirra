import {validateDocument} from './model.mjs';
const sha256=async text=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text)))).map(n=>n.toString(16).padStart(2,'0')).join('');

export function uploadIntentKey({userId,sourceId},digest){
  if(typeof userId!=='string'||!userId||typeof sourceId!=='string'||!sourceId||!/^[a-f0-9]{64}$/.test(digest))throw Error('Cloud upload identity is unavailable');
  return 'mirra.cloud-upload.v1.'+encodeURIComponent(JSON.stringify([userId,sourceId,digest]));
}
export async function prepareCloudUpload(storage,identity,document){
  const doc=validateDocument(document),serialized=JSON.stringify(doc);
  const digest=await sha256(serialized),operationId=await sha256(JSON.stringify([identity.userId,identity.sourceId,digest]));
  const key=uploadIntentKey(identity,digest),raw=storage.getItem(key);
  let intent;
  if(raw!==null){
    intent=JSON.parse(raw);
    if(intent?.version!==1||intent.userId!==identity.userId||intent.sourceId!==identity.sourceId||intent.digest!==digest||intent.operationId!==operationId)throw Error('Upload recovery data could not be verified. It has been preserved.');
  }else{
    intent={version:1,...identity,digest,operationId};
    storage.setItem(key,JSON.stringify(intent));
  }
  return{...intent,doc};
}
