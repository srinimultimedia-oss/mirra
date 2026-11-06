import {FIELD_TYPES} from './tables.mjs';
const copy=value=>structuredClone(value);
const cellKey=(recordId,fieldId)=>JSON.stringify([recordId,fieldId]);
const metaKey=(fieldId,property)=>JSON.stringify([fieldId,property]);
const metaProperties=new Set(['name','type','hidden','options','format','currency']);
export function tableDraftKey(context){
 if(!context||!['cloud','device'].includes(context.mode)||typeof context.boardId!=='string'||!context.boardId||typeof context.tableId!=='string'||!context.tableId||context.mode==='cloud'&&(typeof context.userId!=='string'||!context.userId))throw Error('Table draft identity unavailable');
 return 'mirra.table-input.v1.'+encodeURIComponent(JSON.stringify([context.mode,context.mode==='cloud'?context.userId:'',context.boardId,context.tableId]));
}
function valid(entry){
 if(!entry||typeof entry.recordId!=='string'||!entry.recordId||typeof entry.fieldId!=='string'||!entry.fieldId||!FIELD_TYPES.includes(entry.type)||!['string','boolean'].includes(typeof entry.raw)||typeof entry.raw==='string'&&entry.raw.length>10000||typeof entry.badInput!=='boolean'||!entry.before||typeof entry.before.present!=='boolean'||entry.before.present&&!['string','number','boolean'].includes(typeof entry.before.value)&&entry.before.value!==null||typeof entry.fieldName!=='string'||typeof entry.recordName!=='string'||entry.error!==undefined&&typeof entry.error!=='string')throw Error('Unsent table drafts could not be read. The saved bytes have been preserved.');
 return copy(entry);
}
export const cellState=(record,fieldId)=>Object.hasOwn(record.cells,fieldId)?{present:true,value:copy(record.cells[fieldId])}:{present:false};
export const metadataState=(object,property)=>Object.hasOwn(object,property)?{present:true,value:copy(object[property])}:{present:false};
function validMetadata(entry){
 const value=entry?.before?.value,validBefore=value===null||typeof value==='string'||typeof value==='boolean'||Array.isArray(value)&&value.every(item=>typeof item==='string');
 if(!entry||!(entry.fieldId===null&&entry.property==='text'||typeof entry.fieldId==='string'&&entry.fieldId&&metaProperties.has(entry.property))||(entry.property==='hidden'?typeof entry.raw!=='boolean':typeof entry.raw!=='string')||typeof entry.raw==='string'&&entry.raw.length>(entry.property==='options'?25000:10000)||typeof entry.label!=='string'||!entry.before||typeof entry.before.present!=='boolean'||entry.before.present&&!validBefore||entry.error!==undefined&&typeof entry.error!=='string')throw Error('Unsent table metadata could not be read. The saved bytes have been preserved.');
 return copy(entry);
}
export class TableDrafts{
 constructor(storage,context){
  this.storage=storage;this.context=copy(context);this.key=tableDraftKey(context);this.entries=new Map();this.metadata=new Map();this.storageError='';this.blocked=false;
  if(!storage){this.storageError='Draft storage is unavailable. Export unsent edits before reloading.';return;}
  try{const raw=storage.getItem(this.key);if(raw===null)return;const data=JSON.parse(raw);if(![1,2].includes(data?.version)||!Array.isArray(data.entries)||data.version===2&&!Array.isArray(data.metadata)||data.version===1&&data.metadata!==undefined)throw Error('Invalid draft data');for(const entry of data.entries.map(valid)){const key=cellKey(entry.recordId,entry.fieldId);if(this.entries.has(key))throw Error('Duplicate draft cell');this.entries.set(key,entry);}for(const entry of (data.metadata||[]).map(validMetadata)){const key=metaKey(entry.fieldId,entry.property);if(this.metadata.has(key))throw Error('Duplicate metadata draft');this.metadata.set(key,entry);}}
  catch{this.entries.clear();this.metadata.clear();this.blocked=true;this.storageError='Unsent table drafts could not be read. The saved bytes have been preserved. Export current drafts before reloading.';}
 }
 all(){return[...this.entries.values()].map(copy);}
 get(recordId,fieldId){const entry=this.entries.get(cellKey(recordId,fieldId));return entry?copy(entry):null;}
 set(entry){const next=valid(entry);this.entries.set(cellKey(next.recordId,next.fieldId),next);this.persist();return copy(next);}
 remove(recordId,fieldId){this.entries.delete(cellKey(recordId,fieldId));this.persist();}
 get size(){return this.entries.size+this.metadata.size;}
 metadataAll(){return[...this.metadata.values()].map(copy);}
 getMetadata(fieldId,property){const entry=this.metadata.get(metaKey(fieldId,property));return entry?copy(entry):null;}
 setMetadata(entry){const next=validMetadata(entry);this.metadata.set(metaKey(next.fieldId,next.property),next);this.persist();return copy(next);}
 removeMetadata(fieldId,property){this.metadata.delete(metaKey(fieldId,property));this.persist();}
 serialize(){return JSON.stringify({version:2,entries:this.all(),metadata:this.metadataAll()});}
 persist(){
  if(this.blocked)return;
  try{if(!this.storage)throw Error('No storage');if(this.size)this.storage.setItem(this.key,this.serialize());else this.storage.removeItem(this.key);this.storageError='';}
  catch{this.storageError='Unsent edits are kept in memory only. Export drafts before reloading.';}
 }
}
export function listTableDrafts(storage,scope,liveDrafts=[]){
 // Reuse the same validation and canonical namespace as individual editors.
 tableDraftKey({...scope,tableId:'scope-check'});
 const matches=context=>context.mode===scope.mode&&context.boardId===scope.boardId&&(scope.mode!=='cloud'||context.userId===scope.userId);
 const groups=new Map();
 if(storage)for(let index=0;index<storage.length;index++){
  const key=storage.key(index),prefix='mirra.table-input.v1.';if(!key?.startsWith(prefix))continue;
  let parts,context;try{parts=JSON.parse(decodeURIComponent(key.slice(prefix.length)));if(!Array.isArray(parts)||parts.length!==4)continue;context={mode:parts[0],userId:parts[1],boardId:parts[2],tableId:parts[3]};if(tableDraftKey(context)!==key||!matches(context))continue;}catch{continue;}
  const drafts=new TableDrafts(storage,context);if(drafts.size||drafts.storageError)groups.set(key,{context,drafts,raw:storage.getItem(key)});
 }
 for(const drafts of liveDrafts)if(drafts?.context&&matches(drafts.context)){
  if(drafts.size||drafts.storageError)groups.set(drafts.key,{context:copy(drafts.context),drafts,raw:storage?.getItem(drafts.key)??null});
  else groups.delete(drafts.key);
 }
 return[...groups.values()];
}
