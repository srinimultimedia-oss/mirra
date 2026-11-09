export const MAX_NOTE_TAGS=8,MAX_BOARD_TAGS=1000;
export const tagNameKey=name=>name.normalize('NFKC').trim().toLowerCase();
export function tagName(value){if(typeof value!=='string'||!value.trim()||value.trim().length>100)throw Error('Enter a tag name of 1–100 characters');return value.trim();}
export function validateTags(doc){
  if(doc.tags!==undefined&&(!Array.isArray(doc.tags)||doc.tags.length>MAX_BOARD_TAGS))throw Error('Invalid tag catalog');
  const ids=new Set(),names=new Set();for(const tag of doc.tags||[]){if(!tag||typeof tag.id!=='string'||!tag.id||tag.id.length>100||typeof tag.name!=='string'||tagName(tag.name)!==tag.name||ids.has(tag.id)||names.has(tagNameKey(tag.name)))throw Error('Invalid or duplicate tag');ids.add(tag.id);names.add(tagNameKey(tag.name));}
  for(const item of doc.items)if(item&&item.tagIds!==undefined){if(item.type!=='sticky'||!Array.isArray(item.tagIds)||item.tagIds.length>MAX_NOTE_TAGS||new Set(item.tagIds).size!==item.tagIds.length||[...item.tagIds].some(id=>!ids.has(id)))throw Error('Sticky notes support up to eight existing tags');}
}
function notes(doc,ids){if(!Array.isArray(ids)||!ids.length)throw Error('Select sticky notes');const selected=[...new Set(ids)].map(id=>doc.items.find(item=>item.id===id));if(selected.some(item=>!item||item.type!=='sticky'||item.locked))throw Error('Select existing unlocked sticky notes');return selected;}
export function applyTagAction(doc,action){
  if(!action||typeof action.kind!=='string')throw Error('Invalid tag action');
  if(action.kind==='create'){
    const name=tagName(action.name);if((doc.tags||[]).some(tag=>tagNameKey(tag.name)===tagNameKey(name)))throw Error('A tag with this name already exists');if((doc.tags?.length||0)>=MAX_BOARD_TAGS)throw Error('The board tag limit has been reached');
    const id=action.id||crypto.randomUUID();if(typeof id!=='string'||!id||id.length>100||(doc.tags||[]).some(tag=>tag.id===id))throw Error('Invalid tag id');const selected=action.ids?.length?notes(doc,action.ids):[];
    if(selected.some(item=>(item.tagIds?.length||0)>=MAX_NOTE_TAGS))throw Error('A sticky note already has eight tags');(doc.tags??=[]).push({id,name});for(const item of selected)(item.tagIds??=[]).push(id);return id;
  }
  const tag=doc.tags?.find(tag=>tag.id===action.tagId);if(!tag)throw Error('This tag no longer exists');
  if(action.kind==='assign'){
    if(typeof action.enabled!=='boolean')throw Error('Choose whether to add or remove the tag');const selected=notes(doc,action.ids);if(action.enabled&&selected.some(item=>!item.tagIds?.includes(tag.id)&&(item.tagIds?.length||0)>=MAX_NOTE_TAGS))throw Error('A sticky note already has eight tags');
    for(const item of selected){if(action.enabled){if(!item.tagIds?.includes(tag.id))(item.tagIds??=[]).push(tag.id);}else if(item.tagIds){item.tagIds=item.tagIds.filter(id=>id!==tag.id);if(!item.tagIds.length)delete item.tagIds;}}return;
  }
  if(!['rename','delete'].includes(action.kind))throw Error('Unknown tag action');
  if(doc.items.some(item=>item.locked&&item.tagIds?.includes(tag.id)))throw Error('Unlock tagged notes before changing this tag globally');
  if(action.kind==='rename'){const name=tagName(action.name);if(doc.tags.some(other=>other.id!==tag.id&&tagNameKey(other.name)===tagNameKey(name)))throw Error('A tag with this name already exists');tag.name=name;return;}
  for(const item of doc.items)if(item.tagIds){item.tagIds=item.tagIds.filter(id=>id!==tag.id);if(!item.tagIds.length)delete item.tagIds;}doc.tags=doc.tags.filter(other=>other.id!==tag.id);if(!doc.tags.length)delete doc.tags;
}
export function portableTags(source,target,items){
  const referenced=new Set(items.flatMap(item=>item.tagIds||[])),catalog=target.tags??[],mapping=new Map();
  for(const tag of source.tags||[])if(referenced.has(tag.id)){const existing=catalog.find(other=>tagNameKey(other.name)===tagNameKey(tag.name));if(existing)mapping.set(tag.id,existing.id);else{const id=catalog.some(other=>other.id===tag.id)?crypto.randomUUID():tag.id;catalog.push({id,name:tag.name});mapping.set(tag.id,id);}}
  if(catalog.length)target.tags=catalog;for(const item of items)if(item.tagIds)item.tagIds=item.tagIds.map(id=>mapping.get(id));
}
