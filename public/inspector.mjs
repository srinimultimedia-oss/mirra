import {Board} from '../src/model.mjs';
import {frameTitleDefaults} from './frame-title.mjs';
import {tablePreviewDefaults} from './table-preview-style.mjs';
import {equal} from '../src/changes.mjs';
export const numericProps=['x','y','w','h','rotation','opacity','fontSize','strokeWidth'];
export const booleanProps=['bold','italic','underline','autoFont','background'];
export const valueProps=['fill','stroke','textColor','fontFamily','textAlign','shape','route','arrow','lineStyle'];
export function inspectorDisplayed(item){const defaults={rotation:0,opacity:1,fontSize:item.type==='table'?tablePreviewDefaults.fontSize:item.type==='text'?22:item.type==='connector'?14:item.type==='frame'?frameTitleDefaults.fontSize:17,strokeWidth:item.type==='connector'?2:item.type==='pen'?3:1,stroke:item.type==='connector'||item.type==='pen'?item.fill:'#a5b8ae',textColor:item.type==='table'?tablePreviewDefaults.textColor:item.type==='frame'?frameTitleDefaults.textColor:'#22372f',fontFamily:'sans',textAlign:item.type==='table'?tablePreviewDefaults.textAlign:item.type==='frame'?frameTitleDefaults.textAlign:item.type==='text'?'left':'center',shape:'rectangle',route:'straight',arrow:'end',lineStyle:'solid'};return Object.fromEntries([...numericProps,...booleanProps,...valueProps].map(key=>[key,booleanProps.includes(key)?Boolean(item[key]):String(item[key]??defaults[key]??'')]));}
export function editableProperty(type,key){if(key==='background'&&type!=='text')return false;if(type==='connector'&&['x','y','w','h','rotation'].includes(key))return false;if(type==='pen'&&['fontSize','textColor','fontFamily','textAlign',...booleanProps].includes(key))return false;if(key==='shape'&&type!=='shape')return false;if(['route','arrow'].includes(key)&&type!=='connector')return false;return true;}
export function applyInspector(doc,state,values,scope){
 if(!state||scope!==state.scope)throw Error('The board or account changed. Copy your input before closing.');
 const item=doc.items.find(item=>item.id===state.original.id);if(!item||item.locked)throw Error('Select an unlocked object');if(item.type!==state.original.type)throw Error('This object changed type. Export your previous property edits.');
 const changes={};for(const key of [...numericProps,...booleanProps,...valueProps]){
  if(!editableProperty(item.type,key)||values[key]===state.displayed[key])continue;
  const raw=values[key],value=numericProps.includes(key)?Number(raw):raw;if(numericProps.includes(key)&&(raw===''||!Number.isFinite(value)))throw Error('Enter a finite '+key+' value');
  const before=Object.hasOwn(state.original,key)?{value:state.original[key]}:{},current=Object.hasOwn(item,key)?{value:item[key]}:{};
  if(!equal(before,current)&&!equal(item[key],value))throw Error('Property '+key+' changed in another client. Your edits are preserved. Review the latest properties before applying.');
  if(equal(item[key],value))continue;
  changes[key]=value;
 }
 if(!Object.keys(changes).length)return null;
 if(item.type==='text'&&('fill'in changes||'stroke'in changes)&&!Object.hasOwn(changes,'background')){const before=Object.hasOwn(state.original,'background')?{value:state.original.background}:{},current=Object.hasOwn(item,'background')?{value:item.background}:{};if(!equal(before,current)&&item.background!==true)throw Error('Property background changed in another client. Your edits are preserved. Review the latest properties before applying.');changes.background=true;}
 const temp=new Board(doc),geometry=['x','y','w','h'];
 if('x'in changes||'y'in changes)temp.move([item.id],(changes.x??item.x)-item.x,(changes.y??item.y)-item.y);
 if('w'in changes||'h'in changes)temp.resize(item.id,changes.w??item.w,changes.h??item.h);
 for(const key of geometry)delete changes[key];
 if(Object.keys(changes).length)temp.update([item.id],changes);
 return temp.doc;
}
