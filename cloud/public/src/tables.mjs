export const FIELD_TYPES=['text','number','checkbox','select','date','person','link'];
const safeId=value=>typeof value==='string'&&/^[a-zA-Z0-9_-]{1,100}$/.test(value)&&!['__proto__','constructor','prototype'].includes(value);
const dateOK=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value+'T00:00:00Z'))&&new Date(value+'T00:00:00Z').toISOString().slice(0,10)===value;
export function validCell(field,value){
  if(value===null||value===undefined||value==='')return true;
  if(field.type==='number')return typeof value==='number'&&Number.isFinite(value);
  if(field.type==='checkbox')return typeof value==='boolean';
  if(field.type==='select')return typeof value==='string'&&field.options.includes(value);
  if(field.type==='date')return dateOK(value);
  if(field.type==='link'){if(typeof value!=='string'||value.length>10000)return false;try{return['http:','https:'].includes(new URL(value).protocol);}catch{return false;}}
  return typeof value==='string'&&value.length<=10000;
}
export function validateTable(table){
  if(!table||table.version!==1||!Array.isArray(table.fields)||!table.fields.length||table.fields.length>50||!Array.isArray(table.records)||table.records.length>5000)throw Error('Invalid table');
  const fields=new Map(),records=new Map();
  for(const field of table.fields){
    if(!field||!safeId(field.id)||fields.has(field.id)||typeof field.name!=='string'||!field.name.trim()||field.name.length>200||!FIELD_TYPES.includes(field.type))throw Error('Invalid table field');
    if(field.hidden!==undefined&&typeof field.hidden!=='boolean')throw Error('Invalid field visibility');
    if(field.type==='select'&&(!Array.isArray(field.options)||!field.options.length||field.options.length>100||field.options.some(o=>typeof o!=='string'||!o.trim()||o.length>200)||new Set(field.options).size!==field.options.length))throw Error('Invalid select options');
    if(field.format!==undefined&&!['number','percent','currency'].includes(field.format))throw Error('Invalid number format');
    if(field.currency!==undefined&&!/^[A-Z]{3}$/.test(field.currency))throw Error('Invalid currency');
    fields.set(field.id,field);
  }
  for(const record of table.records){
    if(!record||!safeId(record.id)||records.has(record.id)||!record.cells||typeof record.cells!=='object'||Array.isArray(record.cells))throw Error('Invalid table record');
    for(const[key,value]of Object.entries(record.cells))if(!fields.has(key)||!validCell(fields.get(key),value))throw Error('Invalid table cell');
    if(!Array.isArray(record.blockedBy)||record.blockedBy.length>500||new Set(record.blockedBy).size!==record.blockedBy.length)throw Error('Invalid record dependencies');
    records.set(record.id,record);
  }
  for(const record of table.records)for(const id of record.blockedBy)if(id===record.id||!records.has(id))throw Error('Missing or self-referencing dependency');
  const visited=new Set(),active=new Set();
  for(const record of table.records){
    if(visited.has(record.id))continue;const stack=[{id:record.id,exit:false}];
    while(stack.length){const node=stack.pop();if(node.exit){active.delete(node.id);visited.add(node.id);continue;}if(visited.has(node.id))continue;if(active.has(node.id))throw Error('Cyclic record dependencies');active.add(node.id);stack.push({id:node.id,exit:true});for(const id of records.get(node.id).blockedBy)stack.push({id,exit:false});}
  }
  return structuredClone(table);
}
export function newTable(){return{version:1,fields:[{id:'title',name:'Work item',type:'text'},{id:'status',name:'Stage',type:'select',options:['Ready','In progress','Complete']},{id:'assignee',name:'Assignee',type:'person'},{id:'start',name:'Start date',type:'date'},{id:'end',name:'End date',type:'date'},{id:'estimate',name:'Estimate',type:'number',format:'number'},{id:'done',name:'Done',type:'checkbox'}],records:[]};}
export function mutateTable(table,operation){const next=validateTable(table);operation(next);return validateTable(next);}
export function addRecords(table,rows){
  const ids=[];const next=mutateTable(table,doc=>{for(const cells of rows){const id=crypto.randomUUID();ids.push(id);doc.records.push({id,cells:structuredClone(cells),blockedBy:[]});}});return{table:next,ids};
}
export function updateRecords(table,ids,cells){for(const[key,value]of Object.entries(cells)){const field=table.fields.find(f=>f.id===key);if(!field||!validCell(field,value))throw Error('Invalid table cell update');}return mutateTable(table,doc=>{for(const record of doc.records)if(ids.includes(record.id))for(const[key,value]of Object.entries(cells))record.cells[key]=structuredClone(value);});}
export function removeRecords(table,ids){return mutateTable(table,doc=>{doc.records=doc.records.filter(r=>!ids.includes(r.id));for(const record of doc.records)record.blockedBy=record.blockedBy.filter(id=>!ids.includes(id));});}
export function duplicateRecords(table,ids){const map=new Map(ids.map(id=>[id,crypto.randomUUID()]));return mutateTable(table,doc=>{doc.records.push(...doc.records.filter(r=>map.has(r.id)).map(r=>({...structuredClone(r),id:map.get(r.id),blockedBy:r.blockedBy.map(id=>map.get(id)||id)})));});}
export function editField(table,id,changes){return mutateTable(table,doc=>{const field=doc.fields.find(f=>f.id===id);if(!field)throw Error('Field not found');Object.assign(field,changes,{id});});}
export function removeField(table,id){return mutateTable(table,doc=>{if(doc.fields.length===1)throw Error('A table needs at least one field');doc.fields=doc.fields.filter(f=>f.id!==id);for(const record of doc.records)delete record.cells[id];});}
export function displayCell(field,value){
  if(value===null||value===undefined||value==='')return'';
  if(field.type==='checkbox')return value?'✓':'—';
  if(field.type==='number'){if(field.format==='currency')return new Intl.NumberFormat(undefined,{style:'currency',currency:field.currency||'USD',maximumFractionDigits:2}).format(value);return field.format==='percent'?`${value}%`:String(value);}
  return String(value);
}
export function validateFilter(table,filter){
  const field=table.fields.find(field=>field.id===filter?.field);
  if(!field||!['contains','eq','neq','gt','gte','lt','lte','empty','notEmpty'].includes(filter.op))throw Error('Invalid table filter');
  if(filter.type!==undefined&&filter.type!==field.type)throw Error('A filtered field changed type. Remove that filter and choose its new value.');
  if(['empty','notEmpty'].includes(filter.op))return structuredClone(filter);
  if(filter.op==='contains'){if(typeof filter.value!=='string'||filter.value.length>10000)throw Error('Enter filter text');return structuredClone(filter);}
  if(field.type==='checkbox'&&!['eq','neq'].includes(filter.op))throw Error('Use Equals or Does not equal for a checkbox');
  if(filter.value===null||filter.value===undefined||filter.value===''&&!['text','person'].includes(field.type)||!validCell(field,filter.value))throw Error('Enter a valid '+field.type+' filter value for '+field.name);
  return structuredClone(filter);
}
export function recordView(table,{filters=[],logic='all',sortBy=null,direction='asc',groupBy=null}={}){
  const fields=new Map(table.fields.map(f=>[f.id,f]));
  for(const filter of filters)validateFilter(table,filter);
  if(sortBy&&!fields.has(sortBy)||groupBy&&!fields.has(groupBy))throw Error('Unknown view field');
  const matches=(record,filter)=>{const value=record.cells[filter.field],empty=value===null||value===undefined||value==='';if(filter.op==='empty')return empty;if(filter.op==='notEmpty')return!empty;if(filter.op==='contains')return String(value??'').toLowerCase().includes(String(filter.value).toLowerCase());if(filter.op==='eq')return value===filter.value;if(filter.op==='neq')return value!==filter.value;if(empty)return false;return filter.op==='gt'?value>filter.value:filter.op==='gte'?value>=filter.value:filter.op==='lt'?value<filter.value:value<=filter.value;};
  let records=table.records.filter(record=>!filters.length||(logic==='any'?filters.some(f=>matches(record,f)):filters.every(f=>matches(record,f))));
  if(sortBy)records=[...records].sort((a,b)=>{const x=a.cells[sortBy],y=b.cells[sortBy],emptyX=x===null||x===undefined||x==='',emptyY=y===null||y===undefined||y==='';if(emptyX||emptyY)return emptyX===emptyY?0:emptyX?1:-1;const diff=typeof x==='number'?x-y:typeof x==='boolean'?Number(x)-Number(y):String(x).localeCompare(String(y));return direction==='desc'?-diff:diff;});
  const groups=new Map();for(const record of records){const label=groupBy?displayCell(fields.get(groupBy),record.cells[groupBy])||'Unassigned':'All records';if(!groups.has(label))groups.set(label,[]);groups.get(label).push(record);}
  return{records,groups};
}
export function aggregate(table,fieldId,kind,records=table.records){
  const field=table.fields.find(f=>f.id===fieldId);if(!field)throw Error('Field not found');const filled=records.map(r=>r.cells[fieldId]).filter(v=>v!==null&&v!==undefined&&v!=='');
  if(kind==='count')return filled.length;if(field.type!=='number'||!['sum','average','min','max'].includes(kind))throw Error('A numeric calculation needs a number field');const values=filled.filter(v=>typeof v==='number');if(kind==='sum')return values.reduce((a,b)=>a+b,0);if(!values.length)return null;return kind==='average'?values.reduce((a,b)=>a+b,0)/values.length:kind==='min'?Math.min(...values):Math.max(...values);
}
export function timeline(table,records=table.records,startField='start',endField='end'){
  const rows=records.filter(r=>dateOK(r.cells[startField])&&dateOK(r.cells[endField])).map(record=>({record,start:Date.parse(record.cells[startField]+'T00:00:00Z'),end:Date.parse(record.cells[endField]+'T00:00:00Z')}));
  if(rows.some(r=>r.end<r.start))throw Error('An end date is earlier than its start date');if(!rows.length)return{rows:[],start:0,end:0};const start=Math.min(...rows.map(r=>r.start)),end=Math.max(...rows.map(r=>r.end))+86400000,span=Math.max(86400000,end-start);return{start,end,rows:rows.map(r=>({...r,left:(r.start-start)/span*100,width:(r.end-r.start+86400000)/span*100}))};
}
