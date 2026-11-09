import {captureTableForms,restoreTableForms,clearTableForm} from '/public/table-forms.mjs';
import {tablePreviewStyles} from '/public/table-preview-style.mjs';
import {captureTableFocus,restoreTableFocus,tabTableCell} from '/public/table-focus.mjs';
import {TableDrafts,cellState,metadataState,tableDraftKey} from '/src/table-drafts.mjs';
import {equal} from '/src/changes.mjs';
import{FIELD_TYPES,newTable,validateTable,mutateTable,addRecords,updateRecords,removeRecords,duplicateRecords,editField,removeField,validateFilter,recordView,aggregate,timeline,displayCell}from'/src/tables.mjs';
const node=(tag,text,props={})=>{const el=document.createElement(tag);if(text!==undefined)el.textContent=text;Object.assign(el,props);return el;};
const option=(value,label=value)=>node('option',label,{value});
const select=(label,options,value,onchange)=>{const el=node('select',undefined,{'ariaLabel':label});for(const[value,label]of options)el.append(option(value,label));el.value=value;el.onchange=()=>{if(onchange(el.value)===false)el.value=value;};return el;};
function parseCell(field,value,validity){if(validity?.badInput)throw Error('Enter a complete, valid '+(field.type==='date'?'date':'number')+'. Your saved value has not changed.');if(field.type==='checkbox'){const normalized=typeof value==='string'?value.trim().toLowerCase():value;if(normalized===true||normalized==='true')return true;if(normalized===false||normalized==='false'||normalized==='')return false;throw Error('Enter true or false for a checkbox');}if(value==='')return null;if(field.type==='number'){const number=Number(value);if(!Number.isFinite(number))throw Error('Enter a finite number');return number;}return value;}
export class TableEditor{
  constructor(dialog,{getItem,commit,writable,rename=()=>{},selectedItems=()=>[],createCards=()=>{},download=()=>{},undo=()=>{},drafts=null,draftStorage=null,draftContext={mode:'device',boardId:'unsaved',tableId:'table'}}){this.dialog=dialog;this.getItem=getItem;this.commit=commit;this.writable=writable;this.rename=rename;this.selectedItems=selectedItems;this.createCards=createCards;this.download=download;this.undo=undo;this.drafts=drafts?.key===tableDraftKey(draftContext)?drafts:new TableDrafts(draftStorage,draftContext);this.selected=new Set();this.filters=[];this.logic='all';this.sortBy='';this.direction='asc';this.groupBy='';this.mode='table';this.formValues=new Map();this.render();this.dialog.onkeydown=event=>tabTableCell(event,this.dialog);}
  current(){const item=this.getItem();if(!item||item.type!=='table')throw Error('This table no longer exists');return item;}
  change(operation,{afterCommit=()=>{}}={}){try{if(!this.writable()||this.current().locked)throw Error('This table is read only');const table=operation(this.current().table);this.commit(validateTable(table));afterCommit();this.message='';this.render();return true;}catch(error){this.error.textContent=error.message;return false;}}
  rememberCell(record,field,input){
    const previous=this.drafts.get(record.id,field.id);
    this.drafts.set({recordId:record.id,fieldId:field.id,type:previous?.type||field.type,raw:field.type==='checkbox'?input.checked:input.value,badInput:Boolean(input.validity?.badInput),before:previous?.before||cellState(record,field.id),fieldName:field.name,recordName:previous?.recordName||String(record.cells.title||record.id)});
    this.renderDrafts();
  }
  commitCell(recordId,fieldId){
    const draft=this.drafts.get(recordId,fieldId);if(!draft)return true;
    try{
      const item=this.current();if(!this.writable()||item.locked)throw Error('This table is read only. Your draft is preserved.');
      const field=item.table.fields.find(f=>f.id===fieldId),record=item.table.records.find(r=>r.id===recordId);
      if(!record)throw Error('This record was removed. Export your unsent draft.');
      if(!field||field.type!==draft.type)throw Error('This field changed or was removed. Export your unsent draft.');
      const next=parseCell(field,draft.raw,{badInput:draft.badInput});
      if(!equal(cellState(record,fieldId),draft.before)&&!equal(record.cells[fieldId],next))throw Error('This cell changed in another client. Your draft is preserved below.');
      const saved=this.change(t=>updateRecords(t,[recordId],{[fieldId]:next}),{afterCommit:()=>this.drafts.remove(recordId,fieldId)});
      if(!saved)throw Error(this.error.textContent||'The cell could not be saved');return true;
    }catch(error){this.drafts.set({...draft,error:error.message});this.message=error.message;this.error.textContent=error.message;this.renderDrafts();return false;}
  }
  bindMetadata(input,fieldId,property,source,label){
    const before=metadataState(source,property),pending=this.drafts.getMetadata(fieldId,property);
    if(pending){if(property==='hidden')input.checked=!pending.raw;else input.value=pending.raw;}
    const remember=()=>{try{const previous=this.drafts.getMetadata(fieldId,property);this.drafts.setMetadata({fieldId,property,label:previous?.label||label,raw:property==='hidden'?!input.checked:input.value,before:previous?.before||before});this.renderDrafts();return true;}catch(error){this.message=error.message;this.error.textContent=error.message;return false;}};
    input.oninput=remember;input.onchange=()=>{if(remember())this.commitMetadata(fieldId,property);};
  }
  metadataSource(fieldId,property){
    const item=this.current();if(fieldId===null){if(property!=='text')throw Error('Invalid title edit');return{item,object:item};}
    const field=item.table.fields.find(field=>field.id===fieldId);if(!field)throw Error('This field was removed. Export your unsent edit.');
    if(!['name','type','hidden','options','format','currency'].includes(property)||property==='options'&&field.type!=='select'||['format','currency'].includes(property)&&field.type!=='number')throw Error('This field type changed. Export your unsent edit.');
    return{item,object:field};
  }
  commitMetadata(fieldId,property){
    const draft=this.drafts.getMetadata(fieldId,property);if(!draft)return true;
    try{
      const {item,object}=this.metadataSource(fieldId,property);if(!this.writable()||item.locked)throw Error('This table is read only. Your edit is preserved.');
      const next=property==='options'?draft.raw.split(',').map(value=>value.trim()).filter(Boolean):property==='currency'?draft.raw.toUpperCase():draft.raw;
      if(fieldId===null&&next.length>500)throw Error('Use a table title of 500 characters or fewer');
      if(!equal(metadataState(object,property),draft.before)&&!equal(object[property],next))throw Error('This setting changed in another client. Your edit is preserved below.');
      if(fieldId===null){this.rename(next);this.drafts.removeMetadata(fieldId,property);this.message='';this.render();return true;}
      const changes={[property]:next};if(property==='type'&&next==='select')changes.options=object.options||['Ready','In progress','Complete'];if(property==='format'&&next==='currency'&&!object.currency)changes.currency='USD';
      const saved=this.change(table=>editField(table,fieldId,changes),{afterCommit:()=>this.drafts.removeMetadata(fieldId,property)});if(!saved)throw Error(this.error.textContent||'The setting could not be saved');return true;
    }catch(error){this.drafts.setMetadata({...draft,error:error.message});this.message=error.message;this.error.textContent=error.message;this.renderDrafts();return false;}
  }
  renderDrafts(table){
    if(!this.draftArea)return;
    if(!table)try{table=this.current().table;}catch{}
    const entries=this.drafts.all(),metadata=this.drafts.metadataAll();this.draftArea.replaceChildren();this.draftArea.hidden=!this.drafts.size&&!this.drafts.storageError;
    this.draftStatus=node('p',this.drafts.size+' unsent table edit(s) · kept in this tab',{role:'status'});this.draftArea.append(this.draftStatus);
    if(this.drafts.storageError)this.draftArea.append(node('p',this.drafts.storageError,{className:'formerror',role:'alert'}));
    if(!this.drafts.size)return;
    this.draftArea.append(this.action('Export unsent edits',()=>this.download('mirra-unsent-table-edits.json',this.drafts.serialize(),'application/json')));
    for(const draft of entries){
      const card=node('details'),summary=node('summary',draft.fieldName+' · '+draft.recordName),record=table?.records.find(r=>r.id===draft.recordId),field=table?.fields.find(f=>f.id===draft.fieldId),compatible=record&&field?.type===draft.type;
      const raw=draft.badInput?'Incomplete native '+draft.type+' input — re-enter the value before applying.':String(draft.raw);
      card.append(summary,node('p',draft.error||(!compatible?'The original record or field is no longer available.':'Draft input has not been saved.')));
      const unsentLabel=node('label','Your unsent input');unsentLabel.append(node('textarea',undefined,{value:raw,readOnly:true,rows:2,ariaLabel:'Unsent '+draft.fieldName+' for '+draft.recordId}));card.append(unsentLabel);
      if(compatible){const latestLabel=node('label','Latest saved value');latestLabel.append(node('textarea',undefined,{value:String(record.cells[draft.fieldId]??''),readOnly:true,rows:2,ariaLabel:'Latest saved '+draft.fieldName+' for '+draft.recordId}));card.append(latestLabel);}
      card.append(this.action('Use latest as baseline',()=>{try{const latest=this.current().table.records.find(r=>r.id===draft.recordId);if(!latest)throw Error('This record was removed. Export your unsent draft.');this.drafts.set({...draft,before:cellState(latest,draft.fieldId),error:''});this.message='Latest saved value is the new baseline. Review your draft before applying.';this.render();}catch(error){this.error.textContent=error.message;}},{disabled:!compatible||!this.writable()}),
        this.action('Apply draft',()=>this.commitCell(draft.recordId,draft.fieldId),{disabled:!compatible||!this.writable()||draft.badInput}),
        this.action('Discard draft',()=>{this.drafts.remove(draft.recordId,draft.fieldId);this.message='';this.render();}));this.draftArea.append(card);
    }
    for(const draft of metadata){
      let latest=null,compatible=false,editable=false;try{const source=this.metadataSource(draft.fieldId,draft.property);latest=source.object;compatible=true;editable=this.writable()&&!source.item.locked;}catch{}
      const card=node('details'),summary=node('summary',draft.label+' draft');card.append(summary,node('p',draft.error||(!compatible?'The original table or field is no longer available.':'This edit has not been saved.')));
      const rawLabel=node('label','Your unsent input');rawLabel.append(node('textarea',undefined,{value:String(draft.raw),readOnly:true,rows:2,ariaLabel:'Unsent '+draft.label}));card.append(rawLabel);
      if(compatible){const value=latest[draft.property],savedLabel=node('label','Latest saved value');savedLabel.append(node('textarea',undefined,{value:Array.isArray(value)?value.join(', '):String(value??''),readOnly:true,rows:2,ariaLabel:'Latest saved '+draft.label}));card.append(savedLabel);}
      card.append(this.action('Use latest metadata as baseline',()=>{try{const current=this.metadataSource(draft.fieldId,draft.property).object;this.drafts.setMetadata({...draft,before:metadataState(current,draft.property),error:''});this.message='Review your edit against the latest saved value before applying.';this.render();}catch(error){this.error.textContent=error.message;}},{disabled:!compatible||!editable}),
        this.action('Apply metadata draft',()=>this.commitMetadata(draft.fieldId,draft.property),{disabled:!compatible||!editable}),
        this.action('Discard metadata draft',()=>{this.drafts.removeMetadata(draft.fieldId,draft.property);this.message='';this.render();}));this.draftArea.append(card);
    }
  }
  controlField(id,displayed){const before=displayed.fields.find(field=>field.id===id),latest=this.current().table.fields.find(field=>field.id===id);if(!before||!latest||before.type!==latest.type)throw Error('This field changed or was removed. Copy the value, reopen the table, and choose a field.');return latest;}
  addSelectedNotes(){try{const item=this.current();if(!this.writable()||item.locked)throw Error('This table is read only');const field=item.table.fields.find(f=>f.type==='text');if(!field)throw Error('Add a text field first');const notes=this.selectedItems().filter(i=>['sticky','card'].includes(i.type));if(!notes.length)throw Error('Select canvas notes or cards along with the table first');return this.change(t=>addRecords(t,notes.map(i=>({[field.id]:i.text}))).table);}catch(error){this.error.textContent=error.message;return false;}}
  convertSelected(){try{const item=this.current();if(!this.writable()||item.locked)throw Error('This table is read only');const records=item.table.records.filter(record=>this.selected.has(record.id));if(!records.length)throw Error('Select records first');this.createCards(records,item.table.fields);return true;}catch(error){this.error.textContent=error.message;return false;}}
  exportCSV(){try{const table=this.current().table,visible=table.fields.filter(field=>!field.hidden),view=recordView(table,{filters:this.filters,logic:this.logic,sortBy:this.sortBy||null,direction:this.direction,groupBy:this.groupBy||null});const cell=value=>{let text=String(value??'');if(typeof value!=='number'&&/^[\s]*[=+@-]/.test(text))text="'"+text;return'"'+text.replaceAll('"','""')+'"';};const csv=[visible.map(field=>cell(field.name)).join(','),...view.records.map(record=>visible.map(field=>cell(record.cells[field.id])).join(','))].join('\r\n');this.download('mirra-table.csv',csv,'text/csv;charset=utf-8');return true;}catch(error){this.error.textContent=error.message;return false;}}
  action(label,handler,{disabled=false}={}){const button=node('button',label,{type:'button',disabled});button.onclick=handler;return button;}
  render(){
    const focused=captureTableFocus(this.dialog);if(this.renderedState!==undefined)this.formValues=captureTableForms(this.dialog);
    let item;try{item=this.current();}catch(error){this.error=node('p',error.message,{role:'alert'});this.dialog.replaceChildren(node('h2','Unsent table recovery'),this.error,this.action('Close',()=>this.dialog.close()));this.draftArea=node('section',undefined,{className:'table-draft-recovery',ariaLabel:'Unsent table edits'});this.dialog.append(this.draftArea);this.renderDrafts();return;}
    const table=item.table,canEdit=this.writable()&&!item.locked,visible=table.fields.filter(f=>!f.hidden),scrollerBefore=this.dialog.querySelector('.table-scroll'),scroll=scrollerBefore?.scrollTop||0,horizontalScroll=scrollerBefore?.scrollLeft||0,dialogScroll=this.dialog.scrollTop,schemaOpen=this.dialog.querySelector('details.table-schema')?.open||false;
    this.renderedState=JSON.stringify([item,canEdit]);
    this.selected=new Set([...this.selected].filter(id=>table.records.some(r=>r.id===id)));this.filters=this.filters.filter(f=>table.fields.some(field=>field.id===f.field));if(!table.fields.some(f=>f.id===this.sortBy))this.sortBy='';if(!table.fields.some(f=>f.id===this.groupBy))this.groupBy='';
    this.dialog.replaceChildren();const header=node('header',undefined,{className:'table-editor-head'}),heading=node('div'),title=node('input',undefined,{value:item.text||'Table',ariaLabel:'Table title',maxLength:500,readOnly:!canEdit});this.bindMetadata(title,null,'text',item,'Table title');title.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();title.blur();}};heading.append(node('p','STRUCTURED WORK',{className:'eyebrow'}),title);header.append(heading,this.action('Undo last board edit',()=>{this.undo();this.render();},{disabled:!canEdit}),this.action('Close table',()=>this.dialog.close()));this.dialog.append(header);
    this.error=node('p',this.message||'',{className:'formerror',role:'alert'});this.dialog.append(this.error);
    this.draftArea=node('section',undefined,{className:'table-draft-recovery',ariaLabel:'Unsent table edits'});this.dialog.append(this.draftArea);this.renderDrafts(table);
    const controls=node('div',undefined,{className:'table-controls'});
    controls.append(select('Table view',[['table','Table'],['timeline','Timeline']],this.mode,value=>{this.mode=value;this.render();}),select('Sort table',[['','No sort'],...table.fields.map(f=>[f.id,'Sort: '+f.name])],this.sortBy,value=>{this.sortBy=value;this.render();}),select('Sort direction',[['asc','Ascending'],['desc','Descending']],this.direction,value=>{this.direction=value;this.render();}),select('Group records',[['','No grouping'],...table.fields.map(f=>[f.id,'Group: '+f.name])],this.groupBy,value=>{this.groupBy=value;this.render();}));
    controls.append(this.action('Add record',()=>this.change(t=>addRecords(t,[{}]).table),{disabled:!canEdit}),this.action('Duplicate selected',()=>this.change(t=>duplicateRecords(t,[...this.selected])),{disabled:!canEdit||!this.selected.size}),this.action('Remove selected',()=>this.change(t=>removeRecords(t,[...this.selected])),{disabled:!canEdit||!this.selected.size}));this.dialog.append(controls);
    const filterArea=node('div',undefined,{className:'table-filter-controls'}),filterField=select('Filter field',table.fields.map(f=>[f.id,f.name]),table.fields[0].id,()=>{}),filterOp=select('Filter operation',[['contains','Contains'],['eq','Equals'],['neq','Does not equal'],['gt','Greater than'],['gte','At least'],['lt','Less than'],['lte','At most'],['empty','Is empty'],['notEmpty','Is filled']],'contains',()=>{}),filterValue=node('input',undefined,{placeholder:'Filter value',ariaLabel:'Filter value'});
    filterArea.append(select('Filter logic',[['all','Match all'],['any','Match any']],this.logic,value=>{this.logic=value;this.render();}),filterField,filterOp,filterValue,this.action('Add filter',()=>{try{const field=this.controlField(filterField.value,table);const filter=validateFilter(this.current().table,{field:field.id,type:field.type,op:filterOp.value,value:['empty','notEmpty'].includes(filterOp.value)?undefined:filterOp.value==='contains'?filterValue.value:parseCell(field,filterValue.value)});this.filters.push(filter);filterValue.value='';this.render();}catch(error){this.error.textContent=error.message;}}),this.action('Clear filters',()=>{this.filters=[];this.render();}));
    for(const [index,filter]of this.filters.entries())filterArea.append(this.action(`${table.fields.find(f=>f.id===filter.field)?.name} ${filter.op} ${filter.value??''} ×`,()=>{this.filters.splice(index,1);this.render();}));this.dialog.append(filterArea);
    let view;try{view=recordView(table,{filters:this.filters,logic:this.logic,sortBy:this.sortBy||null,direction:this.direction,groupBy:this.groupBy||null});}catch(error){this.error.textContent=error.message;view={records:[],groups:new Map()};}
    const meta=node('div',undefined,{className:'table-meta'});meta.append(node('span',`${view.records.length} of ${table.records.length} records · ${this.selected.size} selected`));
    meta.append(this.action('Add selected notes as records',()=>this.addSelectedNotes(),{disabled:!canEdit}),this.action('Selected records to cards',()=>this.convertSelected(),{disabled:!canEdit||!this.selected.size}),this.action('Export CSV',()=>this.exportCSV()));this.dialog.append(meta);
    const scroller=node('div',undefined,{className:'table-scroll'});this.dialog.append(scroller);
    if(this.mode==='timeline'){
      const dates=table.fields.filter(f=>f.type==='date');if(dates.length<2)scroller.append(node('p','Add start and end date fields to use the timeline.'));else try{const data=timeline(table,view.records,dates.find(f=>f.id==='start')?.id||dates[0].id,dates.find(f=>f.id==='end')?.id||dates[1].id);const title=table.fields.find(f=>f.type==='text');for(const row of data.rows){const track=node('div',undefined,{className:'timeline-row'});track.append(node('span',row.record.cells[title?.id]||'Untitled record'));const bar=node('div',undefined,{className:'timeline-track'}),pill=node('span',`${new Date(row.start).toISOString().slice(0,10)} → ${new Date(row.end).toISOString().slice(0,10)}`,{className:'timeline-pill'});pill.style.left=row.left+'%';pill.style.width=row.width+'%';bar.append(pill);track.append(bar);scroller.append(track);}if(!data.rows.length)scroller.append(node('p','Records need valid start and end dates to appear here.'));}catch(error){scroller.append(node('p',error.message,{className:'formerror'}));}
    }else{
      for(const[group,records]of view.groups){if(this.groupBy)scroller.append(node('h3',`${group} · ${records.length}`));const grid=node('table',undefined,{className:'records-grid'}),thead=node('thead'),headingRow=node('tr');const checkCell=node('th'),all=node('input',undefined,{type:'checkbox',ariaLabel:'Select visible records',checked:records.length>0&&records.every(r=>this.selected.has(r.id))});all.onchange=()=>{records.forEach(r=>all.checked?this.selected.add(r.id):this.selected.delete(r.id));this.render();};checkCell.append(all);headingRow.append(checkCell);for(const field of visible)headingRow.append(node('th',field.name));headingRow.append(node('th','Blocked by'));thead.append(headingRow);grid.append(thead);const tbody=node('tbody');
        for(const record of records){const tr=node('tr'),checkTD=node('td'),check=node('input',undefined,{type:'checkbox',ariaLabel:`Select record ${record.id}`,checked:this.selected.has(record.id)});check.onchange=()=>{check.checked?this.selected.add(record.id):this.selected.delete(record.id);this.render();};checkTD.append(check);tr.append(checkTD);
          for(const field of visible){const td=node('td'),value=record.cells[field.id];let input;if(field.type==='select')input=select(`${field.name} for ${record.id}`,[['','—'],...field.options.map(o=>[o,o])],value||'',()=>{});else input=node('input',undefined,{type:field.type==='checkbox'?'checkbox':field.type==='number'?'number':field.type==='date'?'date':field.type==='link'?'url':'text',ariaLabel:`${field.name} for ${record.id}`,...(field.type==='checkbox'?{checked:Boolean(value)}:{value:value??''}),...(field.type==='number'?{step:'any'}:{})});input.disabled=!canEdit;
            const pending=this.drafts.get(record.id,field.id);if(pending&&pending.type===field.type){if(field.type==='checkbox')input.checked=Boolean(pending.raw);else if(field.type!=='select'||field.options.includes(pending.raw)||pending.raw==='')input.value=pending.raw;}
            input.oninput=()=>this.rememberCell(record,field,input);input.onchange=()=>{const pending=this.drafts.get(record.id,field.id);if(!pending)this.rememberCell(record,field,input);this.commitCell(record.id,field.id);};input.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();input.blur();}};td.append(input);if(field.type==='number'&&field.format!=='number'&&value!==undefined&&value!==null){const hint=node('small',displayCell(field,value));td.append(hint);if(field.format==='percent'){const progress=node('progress',undefined,{max:100,value:Math.max(0,Math.min(100,value))});td.append(progress);}}tr.append(td);
          }
          const deps=node('td'),dependency=select(`Add dependency for ${record.id}`,[['','Add blocker…'],...table.records.filter(r=>r.id!==record.id&&!record.blockedBy.includes(r.id)).map(r=>[r.id,r.cells[table.fields.find(f=>f.type==='text')?.id]||r.id])],'',value=>{if(value)this.change(t=>mutateTable(t,d=>d.records.find(r=>r.id===record.id).blockedBy.push(value)));});dependency.disabled=!canEdit;deps.append(dependency);for(const id of record.blockedBy)deps.append(this.action((table.records.find(r=>r.id===id)?.cells.title||'Blocker')+' ×',()=>this.change(t=>mutateTable(t,d=>{const r=d.records.find(r=>r.id===record.id);r.blockedBy=r.blockedBy.filter(x=>x!==id);})),{disabled:!canEdit}));tr.append(deps);tbody.append(tr);
        }grid.append(tbody);scroller.append(grid);
      }if(!view.records.length)scroller.append(node('p','No matching records. Add a record or adjust the filters.'));
    }scroller.scrollTop=scroll;
    const calculate=node('div',undefined,{className:'table-calculations'}),numeric=table.fields.filter(f=>f.type==='number');for(const field of numeric){const values=['sum','average','min','max'].map(kind=>`${kind}: ${aggregate(table,field.id,kind,view.records)??'—'}`).join(' · ');calculate.append(node('span',`${field.name} — ${values}`));}this.dialog.append(calculate);
    const bulk=node('div',undefined,{className:'table-bulk-controls'}),bulkField=select('Bulk edit field',table.fields.map(f=>[f.id,f.name]),table.fields[0].id,()=>{}),bulkValue=node('input',undefined,{placeholder:'New value',ariaLabel:'Bulk cell value'});bulk.append(bulkField,bulkValue,this.action('Apply to selected',()=>{try{const field=this.controlField(bulkField.value,table),value=parseCell(field,bulkValue.value);this.change(t=>updateRecords(t,[...this.selected],{[field.id]:value}));}catch(error){this.error.textContent=error.message;}},{disabled:!canEdit||!this.selected.size}));this.dialog.append(bulk);
    const schema=node('details',undefined,{open:schemaOpen,className:'table-schema'}),summary=node('summary','Fields and formats');schema.append(summary);const fieldList=node('div',undefined,{className:'table-field-list'});
    for(const field of table.fields){const row=node('div'),name=node('input',undefined,{value:field.name,ariaLabel:`Field name ${field.id}`,disabled:!canEdit});this.bindMetadata(name,field.id,'name',field,'Name · '+field.name);const type=select(`Field type ${field.id}`,FIELD_TYPES.map(t=>[t,t]),field.type,()=>{});this.bindMetadata(type,field.id,'type',field,'Type · '+field.name);type.disabled=!canEdit;const visibility=node('input',undefined,{type:'checkbox',checked:!field.hidden,ariaLabel:`Show field ${field.name}`,disabled:!canEdit});this.bindMetadata(visibility,field.id,'hidden',field,'Visibility · '+field.name);row.append(name,type,visibility,this.action('Remove field',()=>this.change(t=>removeField(t,field.id)),{disabled:!canEdit||table.fields.length===1}));
      if(field.type==='select'){const options=node('input',undefined,{value:field.options.join(', '),ariaLabel:`Options for ${field.name}`,disabled:!canEdit});this.bindMetadata(options,field.id,'options',field,'Options · '+field.name);row.append(options);}
      if(field.type==='number'){const format=select(`Number format ${field.name}`,[['number','Number'],['percent','Percent / progress'],['currency','Currency']],field.format||'number',()=>{});this.bindMetadata(format,field.id,'format',field,'Format · '+field.name);format.disabled=!canEdit;row.append(format);if(field.format==='currency'){const currency=node('input',undefined,{value:field.currency||'USD',maxLength:3,ariaLabel:`Currency for ${field.name}`,disabled:!canEdit});this.bindMetadata(currency,field.id,'currency',field,'Currency · '+field.name);row.append(currency);}}
      fieldList.append(row);
    }
    const addRow=node('div'),fieldName=node('input',undefined,{placeholder:'Field name',ariaLabel:'New field name'}),fieldType=select('New field type',FIELD_TYPES.map(t=>[t,t]),'text',()=>{});
    const addField=()=>this.change(t=>mutateTable(t,d=>{d.fields.push({id:crypto.randomUUID(),name:fieldName.value,type:fieldType.value,...(fieldType.value==='select'?{options:['Option 1','Option 2']}:{})});}),{afterCommit:()=>clearTableForm(this.dialog,'New field name')});
    addRow.append(fieldName,fieldType,this.action('Add field',addField,{disabled:!canEdit}));fieldList.append(addRow);schema.append(fieldList);this.dialog.append(schema);
    const scrollerAfter=this.dialog.querySelector('.table-scroll');if(scrollerAfter){scrollerAfter.scrollTop=scroll;scrollerAfter.scrollLeft=horizontalScroll;}this.dialog.scrollTop=dialogScroll;restoreTableForms(this.dialog,this.formValues);restoreTableFocus(this.dialog,focused);
  }
  refresh(){const active=document.activeElement;if(this.dialog.open&&!(this.dialog.contains(active)&&active.matches('input,textarea,select'))){let state;try{const item=this.current();state=JSON.stringify([item,this.writable()&&!item.locked]);}catch{}if(state!==this.renderedState)this.render();}}
}
export function tablePreview(item,measure){
 const container=node('div',undefined,{className:'canvas-table-preview'}),title=node('strong',item.text||'Table'),caption=node('small',`${item.table.records.length} records · Double-click to edit`);container.append(title,caption);
 const grid=node('table'),head=node('tr'),fields=item.table.fields.filter(f=>!f.hidden).slice(0,5);
 for(const field of fields)head.append(node('th',field.name));grid.append(head);
 for(const record of item.table.records.slice(0,5)){const row=node('tr');for(const field of fields)row.append(node('td',displayCell(field,record.cells[field.id])||'—'));grid.append(row);}container.append(grid);
 const appearance=tablePreviewStyles(item,measure);if(appearance){Object.assign(container.style,appearance.container);Object.assign(title.style,appearance.title);Object.assign(caption.style,appearance.caption);for(const cell of grid.querySelectorAll('th'))Object.assign(cell.style,appearance.header);for(const cell of grid.querySelectorAll('td'))Object.assign(cell.style,appearance.cell);}
 return container;
}

