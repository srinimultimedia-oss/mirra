const prefix='mirra.object-text.v1.',types=['sticky','text','shape','frame','card','connector'];
export function objectDraftKey(scope,id){if(typeof scope!=='string'||!scope||typeof id!=='string'||!id)throw Error('Object draft identity unavailable');return prefix+encodeURIComponent(JSON.stringify([scope,id]));}
function validate(entry){if(!entry||!types.includes(entry.type)||typeof entry.before!=='string'||entry.before.length>100000||typeof entry.raw!=='string'||entry.raw.length>100000)throw Error('Invalid object text draft');return structuredClone({type:entry.type,before:entry.before,raw:entry.raw});}
export class ObjectDraft{
 constructor(storage,scope,id,{key}={}){const identityKey=objectDraftKey(scope,id);Object.assign(this,{storage,scope,id,key:key??identityKey,entry:null,blocked:false,error:''});try{if(!storage)throw Error('No storage');const raw=storage.getItem(this.key);if(raw===null)return;try{const data=JSON.parse(raw);if(data.version!==1)throw Error('Unsupported version');this.entry=validate(data);}catch{this.blocked=true;this.error='Stored text recovery could not be read. Its original bytes are preserved; export them from Board menu.';}}catch{this.error='Text recovery is unavailable. Export unsent text before reloading.';}}
 set(entry){this.entry=validate(entry);this.persist();}
 remove(){this.entry=null;this.persist();}
 persist(){if(this.blocked)return;try{if(!this.storage)throw Error('No storage');if(this.entry)this.storage.setItem(this.key,JSON.stringify({version:1,...this.entry}));else this.storage.removeItem(this.key);this.error='';}catch{this.error=this.entry?'Unsent text is kept in memory only. Export it before reloading.':this.stored()!==null?'Stored text recovery could not be cleared. Export it from Board menu.':'';}}
 stored(){try{return this.storage?.getItem(this.key)??null;}catch{return null;}}
 serialize(){return JSON.stringify({version:1,scope:this.scope,id:this.id,...this.entry});}
}
export function listObjectDrafts(storage,scope,live=[]){
 const groups=new Map();try{if(storage)for(let i=0;i<storage.length;i++){const key=storage.key(i);if(!key?.startsWith(prefix))continue;let parts;try{parts=JSON.parse(decodeURIComponent(key.slice(prefix.length)));if(!Array.isArray(parts)||parts.length!==2||parts[0]!==scope||objectDraftKey(...parts)!==key)continue;}catch{continue;}const draft=new ObjectDraft(storage,...parts);if(draft.entry||draft.error)groups.set(key,draft);}}catch{}
 for(const draft of live)if(draft.scope===scope){if(draft.entry||draft.blocked||draft.stored()!==null)groups.set(draft.key,draft);else groups.delete(draft.key);}
 return[...groups.values()];
}
