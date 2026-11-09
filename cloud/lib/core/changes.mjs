import {validateDocument,reconcileFrames} from './model.mjs';
const fields=new Set(['type','x','y','w','h','text','fill','points','from','to','shape','groupId','parentId','locked','rotation','opacity','stroke','strokeWidth','lineStyle','arrow','route','textColor','fontSize','fontFamily','textAlign','bold','italic','underline','autoFont','background','table','tagIds']);
const canonical=value=>value===undefined?'undefined':value===null||typeof value!=='object'?JSON.stringify(value):Array.isArray(value)?'['+value.map(canonical).join(',')+']':'{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+canonical(value[k])).join(',')+'}';
export const equal=(a,b)=>canonical(a)===canonical(b);
const state=(object,key)=>Object.hasOwn(object,key)?{present:true,value:structuredClone(object[key])}:{present:false};
function tableUpdates(before,after){
  const updates=[];if(!equal(before.fields,after.fields))updates.push({key:'table',path:['fields'],before:state(before,'fields'),after:state(after,'fields')});
  const previous=new Map(before.records.map(r=>[r.id,r])),next=new Map(after.records.map(r=>[r.id,r]));
  for(const id of new Set([...previous.keys(),...next.keys()])){
    const a=previous.get(id),b=next.get(id);
    if(!a||!b){updates.push({key:'table',path:['records',id],before:a?{present:true,value:a}:{present:false},after:b?{present:true,value:b}:{present:false}});continue;}
    for(const field of new Set([...Object.keys(a.cells),...Object.keys(b.cells)]))if(!equal(state(a.cells,field),state(b.cells,field)))updates.push({key:'table',path:['records',id,'cells',field],before:state(a.cells,field),after:state(b.cells,field)});
    if(!equal(a.blockedBy,b.blockedBy))updates.push({key:'table',path:['records',id,'blockedBy'],before:state(a,'blockedBy'),after:state(b,'blockedBy')});
  }return updates;
}
export function changesBetween(before,after){
  validateDocument(before);validateDocument(after);const old=new Map(before.items.map(i=>[i.id,i])),next=new Map(after.items.map(i=>[i.id,i]));const changes=[];
  for(const item of before.items)if(!next.has(item.id))changes.push({kind:'delete',id:item.id,before:item});
  for(const [index,item]of after.items.entries()){
    const previous=old.get(item.id);
    if(!previous){changes.push({kind:'create',id:item.id,item,afterId:after.items[index-1]?.id||null});continue;}
    const updates=[];for(const key of new Set([...Object.keys(previous),...Object.keys(item)]))if(key!=='id'&&!equal(state(previous,key),state(item,key))){if(key==='table'&&previous.type==='table'&&item.type==='table')updates.push(...tableUpdates(previous.table,item.table));else updates.push({key,before:state(previous,key),after:state(item,key)});}
    if(updates.length)changes.push({kind:'update',id:item.id,updates});
  }
  if(before.name!==after.name)changes.push({kind:'name',before:before.name,after:after.name});
  if(!equal(state(before,'timer'),state(after,'timer')))changes.push({kind:'timer',before:state(before,'timer'),after:state(after,'timer')});
  if(!equal(state(before,'tags'),state(after,'tags')))changes.push({kind:'tags',before:state(before,'tags'),after:state(after,'tags')});
  const beforeOrder=before.items.filter(i=>next.has(i.id)).map(i=>i.id),afterOrder=after.items.filter(i=>old.has(i.id)).map(i=>i.id);
  if(!equal(beforeOrder,afterOrder))changes.push({kind:'order',before:beforeOrder,after:afterOrder});
  return changes;
}
export class Conflict extends Error{constructor(conflicts){super('Concurrent edits conflict. Your unsaved work is preserved.');this.conflicts=conflicts;}}
export function applyChanges(document,changes){
  if(!Array.isArray(changes)||changes.length>10000)throw Error('Invalid changes');
  const doc=structuredClone(document),conflicts=[];
  for(const change of changes){
    if(!change||typeof change.kind!=='string')throw Error('Invalid operation');
    const index=doc.items.findIndex(i=>i.id===change.id),item=doc.items[index];
    if(change.kind==='create'){
      if(change.id!==change.item?.id)throw Error('Invalid create');
      if(item){if(!equal(item,change.item))conflicts.push({id:change.id,field:'create'});continue;}
      const anchor=doc.items.findIndex(i=>i.id===change.afterId);doc.items.splice(change.afterId===null?0:anchor<0?doc.items.length:anchor+1,0,structuredClone(change.item));
    }else if(change.kind==='delete'){
      if(!item)continue;if(!equal(item,change.before))conflicts.push({id:change.id,field:'delete'});else doc.items.splice(index,1);
    }else if(change.kind==='update'){
      if(!item){conflicts.push({id:change.id,field:'deleted'});continue;}
      if(!Array.isArray(change.updates)||change.updates.length>50000)throw Error('Invalid field updates');
      for(const update of change.updates){
        if(!fields.has(update.key)||typeof update.before?.present!=='boolean'||typeof update.after?.present!=='boolean')throw Error('Invalid field update');
        if(update.path){
          if(update.key!=='table'||item.type!=='table'||!Array.isArray(update.path))throw Error('Invalid nested update');
          const path=update.path;let current,write;
          if(path.length===1&&path[0]==='fields'){current=state(item.table,'fields');write=()=>{if(!update.after.present)throw Error('Table fields are required');item.table.fields=structuredClone(update.after.value);};}
          else if(path[0]==='records'&&typeof path[1]==='string'&&/^[a-zA-Z0-9_-]{1,100}$/.test(path[1])){
            const at=item.table.records.findIndex(r=>r.id===path[1]),record=item.table.records[at];
            if(path.length===2){current=record?{present:true,value:structuredClone(record)}:{present:false};write=()=>{if(update.after.present){if(update.after.value?.id!==path[1])throw Error('Invalid record id');if(at<0)item.table.records.push(structuredClone(update.after.value));else item.table.records[at]=structuredClone(update.after.value);}else if(at>=0)item.table.records.splice(at,1);};}
            else if(!record){conflicts.push({id:change.id,field:path.join('.')});continue;}
            else if(path.length===3&&path[2]==='blockedBy'){current=state(record,'blockedBy');write=()=>{if(!update.after.present)throw Error('Dependencies are required');record.blockedBy=structuredClone(update.after.value);};}
            else if(path.length===4&&path[2]==='cells'&&typeof path[3]==='string'&&!['__proto__','constructor','prototype'].includes(path[3])){current=state(record.cells,path[3]);write=()=>{if(update.after.present){if(!item.table.fields.some(f=>f.id===path[3]))throw Error('Unknown cell field');record.cells[path[3]]=structuredClone(update.after.value);}else delete record.cells[path[3]];};}
          }
          if(!write)throw Error('Invalid table update path');if(equal(current,update.after))continue;if(!equal(current,update.before)){conflicts.push({id:change.id,field:path.join('.')});continue;}write();continue;
        }
        const current=state(item,update.key);if(equal(current,update.after))continue;
        if(!equal(current,update.before)){conflicts.push({id:change.id,field:update.key});continue;}
        if(update.key==='tagIds'&&item.locked){conflicts.push({id:change.id,field:'tagIds lock'});continue;}
        if(update.after.present)item[update.key]=structuredClone(update.after.value);else delete item[update.key];
      }
    }else if(change.kind==='tags'){
      if(typeof change.before?.present!=='boolean'||typeof change.after?.present!=='boolean'||change.after.present&&!Array.isArray(change.after.value))throw Error('Invalid tag catalog change');
      const current=state(doc,'tags');if(equal(current,change.after))continue;
      if(!equal(current,change.before)){conflicts.push({field:'tags'});continue;}
      const after=change.after.present?change.after.value:[],removed=(doc.tags||[]).filter(tag=>!after.some(next=>next.id===tag.id)),modified=(doc.tags||[]).filter(tag=>!after.some(next=>equal(next,tag)));
      if(doc.items.some(item=>item.tagIds?.some(id=>removed.some(tag=>tag.id===id)))){conflicts.push({field:'tag references'});continue;}
      if(doc.items.some(item=>item.locked&&item.tagIds?.some(id=>modified.some(tag=>tag.id===id)))){conflicts.push({field:'tag locks'});continue;}
      if(change.after.present)doc.tags=structuredClone(after);else delete doc.tags;
    }else if(change.kind==='timer'){
      if(typeof change.before?.present!=='boolean'||typeof change.after?.present!=='boolean')throw Error('Invalid timer change');
      const current=state(doc,'timer');if(equal(current,change.after))continue;
      if(!equal(current,change.before))conflicts.push({field:'timer'});else if(change.after.present)doc.timer=structuredClone(change.after.value);else delete doc.timer;
    }else if(change.kind==='name'){
      if(doc.name!==change.before&&doc.name!==change.after)conflicts.push({field:'name'});else doc.name=change.after;
    }else if(change.kind==='order'){
      if(!Array.isArray(change.before)||!Array.isArray(change.after)||new Set(change.before).size!==change.before.length||!equal([...change.before].sort(),[...change.after].sort()))throw Error('Invalid stacking order');
      const set=new Set(change.before),present=doc.items.filter(i=>set.has(i.id));
      if(!equal(present.map(i=>i.id),change.before)&&!equal(present.map(i=>i.id),change.after)){conflicts.push({field:'order'});continue;}
      const map=new Map(present.map(i=>[i.id,i]));let order=0;doc.items=doc.items.map(i=>set.has(i.id)?map.get(change.after[order++]):i);
    }else throw Error('Unknown operation');
  }
  if(conflicts.length)throw new Conflict(conflicts);
  validateDocument(doc);reconcileFrames(doc);return validateDocument(doc);
}
