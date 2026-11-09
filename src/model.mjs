import {SHAPES,visualBox,connectorGeometry,resolveEndpoint,translateFreeEndpoints} from './geometry.mjs';
import {frameIndex} from './frame-index.mjs';
import {validateTable} from './tables.mjs';
import {validateTimer,transitionTimer} from './timer.mjs';
import {validateTags,applyTagAction,portableTags} from './tags.mjs';
import {validateCellGrid} from './spreadsheet-paste.mjs';
export const TYPES = new Set(['sticky', 'text', 'shape', 'frame', 'connector', 'pen', 'card', 'table']);
export const MAX_BOARD_ITEMS = 100000;
const clone = value => structuredClone(value);
const finite = n => typeof n === 'number' && Number.isFinite(n) && Math.abs(n) <= 1e7;
export function validateDocument(doc) {
  if (!doc || doc.version !== 1 || typeof doc.name !== 'string' || doc.name.length > 500 || !Array.isArray(doc.items) || doc.items.length > MAX_BOARD_ITEMS) throw Error('Invalid board document');
  const itemsById = new Map();
  validateTags(doc);
  if(Object.hasOwn(doc,'timer'))validateTimer(doc.timer);
  for (const item of doc.items) {
    if (!item || typeof item.id !== 'string' || !item.id || itemsById.has(item.id) || !TYPES.has(item.type)) throw Error('Invalid or duplicate item');
    itemsById.set(item.id,item);
    if (![item.x, item.y, item.w, item.h].every(finite) || item.w < 1 || item.h < 1) throw Error('Invalid item geometry');
    if (typeof item.text !== 'string' || item.text.length > 100000 || typeof item.fill !== 'string' || !/^#[0-9a-f]{6}$/i.test(item.fill)) throw Error('Invalid item content');
    for(const key of ['textColor','stroke'])if(item[key]!==undefined&&(typeof item[key]!=='string'||!/^#[0-9a-f]{6}$/i.test(item[key])))throw Error('Invalid style color');
    for(const [key,min,max] of [['fontSize',8,200],['strokeWidth',0,20],['rotation',-360,360],['opacity',0,1]])if(item[key]!==undefined&&(!finite(item[key])||item[key]<min||item[key]>max))throw Error(`Invalid ${key}`);
    for(const key of ['bold','italic','underline','autoFont','locked','background'])if(item[key]!==undefined&&typeof item[key]!=='boolean')throw Error(`Invalid ${key}`);
    if(item.shape!==undefined&&!SHAPES.includes(item.shape))throw Error('Invalid shape');
    if(item.textAlign!==undefined&&!['left','center','right'].includes(item.textAlign))throw Error('Invalid text alignment');
    if(item.route!==undefined&&!['straight','orthogonal','curve'].includes(item.route))throw Error('Invalid connector routing');
    if(item.lineStyle!==undefined&&!['solid','dashed','dotted'].includes(item.lineStyle))throw Error('Invalid line style');
    if(item.arrow!==undefined&&!['none','end','both'].includes(item.arrow))throw Error('Invalid arrow style');
    if(item.fontFamily!==undefined&&!['sans','serif','mono'].includes(item.fontFamily))throw Error('Invalid font family');
    if(item.type==='table')validateTable(item.table);
    if (item.type === 'pen' && (!Array.isArray(item.points) || item.points.length < 2)) throw Error('A drawing requires at least two points');
    if (item.points !== undefined && (!Array.isArray(item.points) || item.points.length > 100000 || item.points.some(p => !Array.isArray(p) || p.length !== 2 || !p.every(finite)))) throw Error('Invalid drawing');
  }
  for (const item of doc.items) if (item.type === 'connector') {
    const valid=endpoint=>typeof endpoint==='string'?itemsById.has(endpoint):endpoint&&typeof endpoint==='object'&&!Array.isArray(endpoint)&&Object.keys(endpoint).length===2&&finite(endpoint.x)&&finite(endpoint.y);
    if (!valid(item.from) || !valid(item.to) || (typeof item.from==='string'&&item.from === item.to)) throw Error('Invalid connector endpoints');
  }
  for (const item of doc.items) {
    if (item.groupId !== undefined && (typeof item.groupId !== 'string' || !item.groupId)) throw Error('Invalid group');
    if (item.parentId !== undefined) {
      const parent = itemsById.get(item.parentId);
      if (!parent || parent.type !== 'frame' || parent.id === item.id) throw Error('Invalid frame parent');
    }
  }
  // Each parent edge is visited once, including forward references and deep
  // chains. Do not recurse: valid imported boards can exceed the call stack.
  const complete=new Set();
  for(const item of doc.items){
    if(complete.has(item.id))continue;
    const path=new Set();let node=item;
    for(let depth=0;depth<MAX_BOARD_ITEMS&&node&&!complete.has(node.id);depth++){
      if(path.has(node.id))throw Error('Cyclic frame nesting');
      path.add(node.id);node=itemsById.get(node.parentId);
    }
    if(node&&!complete.has(node.id))throw Error('Cyclic frame nesting or hierarchy limit exceeded');
    for(const id of path)complete.add(id);
  }
  return clone(doc);
}
export function reconcileFrames(doc) {
  const index=frameIndex(doc.items.filter(i=>i.type==='frame'));
  for (const item of doc.items) {
    if(item.type==='connector')continue;
    const parent=index.containing(item);
    if(parent)item.parentId=parent.id;else delete item.parentId;
  }
}
export function bounds(items,context=items) {
  if (!items.length) return { x: 0, y: 0, w: 1, h: 1 };
  const originals=context;items=items.map(item=>{if(item.type==='connector'){const from=resolveEndpoint(originals,item.from),to=resolveEndpoint(originals,item.to);if(from&&to){const {a,b}=connectorGeometry(from,to,item.route);return{x:Math.min(a.x,b.x),y:Math.min(a.y,b.y),w:Math.max(1,Math.abs(a.x-b.x)),h:Math.max(1,Math.abs(a.y-b.y))};}}return visualBox(item);});
  const x = Math.min(...items.map(i => i.x)), y = Math.min(...items.map(i => i.y));
  return { x, y, w: Math.max(...items.map(i => i.x + i.w)) - x, h: Math.max(...items.map(i => i.y + i.h)) - y };
}
export class Board {
  constructor(doc = { version: 1, name: 'Untitled board', items: [] }) {
    this.doc = validateDocument(doc); reconcileFrames(this.doc); this.past = []; this.future = [];
  }
  transact(fn) {
    const before = clone(this.doc);
    try { fn(this.doc); this.doc = validateDocument(this.doc); }
    catch (error) { this.doc = before; throw error; }
    if (JSON.stringify(before) === JSON.stringify(this.doc)) return false;
    this.past.push(before); if (this.past.length > 100) this.past.shift(); this.future = []; return true;
  }
  add(type, x, y, props = {}) {
    const id = crypto.randomUUID();
    this.transact(doc => {doc.items.push({ id, type, x, y, w: 180, h: 140, text: '', fill: '#f6e49b', ...props, id, type });reconcileFrames(doc);});
    return id;
  }
  update(ids, props) { this.transact(doc => { for (const item of doc.items) if (ids.includes(item.id)&&(!item.locked||(Object.keys(props).length===1&&typeof props.locked==='boolean'))) Object.assign(item, props);reconcileFrames(doc); }); }
  tags(action){let result;this.transact(doc=>{result=applyTagAction(doc,action);});return result;}
  replace(document){const next=validateDocument(document);return this.transact(doc=>{for(const key of Object.keys(doc))delete doc[key];Object.assign(doc,next);reconcileFrames(doc);});}
  selection(ids, {descendants=false}={}) {
    const result=new Set(ids),groups=new Set(this.doc.items.filter(i=>result.has(i.id)&&i.groupId).map(i=>i.groupId));
    for(const i of this.doc.items)if(groups.has(i.groupId))result.add(i.id);
    if(descendants){
      const children=new Map();for(const item of this.doc.items)if(item.parentId){if(!children.has(item.parentId))children.set(item.parentId,[]);children.get(item.parentId).push(item.id);}
      const queue=[...result];for(let index=0;index<queue.length;index++)for(const id of children.get(queue[index])||[])if(!result.has(id)){result.add(id);queue.push(id);}
    }
    return [...result];
  }
  movementSelection(ids){
    const selected=new Set(ids),byId=new Map(this.doc.items.map(item=>[item.id,item]));
    const roots=ids.filter(id=>{const item=byId.get(id);if(!item||item.locked)return false;let parent=byId.get(item.parentId);while(parent){if(selected.has(parent.id)&&parent.locked)return false;parent=byId.get(parent.parentId);}return true;});
    const expanded=this.selection(roots,{descendants:true});if(this.doc.items.some(item=>expanded.includes(item.id)&&item.locked))throw Error('Unlock grouped or framed objects before moving');return expanded;
  }
  move(ids, dx, dy) {const expanded=this.movementSelection(ids);this.transact(doc=>{for(const item of doc.items)if(expanded.includes(item.id)){if(item.type==='connector')translateFreeEndpoints(item,dx,dy);else{item.x+=dx;item.y+=dy;}}reconcileFrames(doc);});}

  remove(ids) {
    const expanded=this.selection(ids);
    this.transact(doc=>{
      const byId=new Map(doc.items.map(item=>[item.id,item])),removed=new Set(expanded.filter(id=>!byId.get(id)?.locked));
      doc.items=doc.items.filter(item=>!removed.has(item.id)&&!(item.type==='connector'&&(removed.has(item.from)||removed.has(item.to))));
      const frames=new Set(doc.items.filter(item=>item.type==='frame').map(item=>item.id)),ancestors=new Map();
      const survivingParent=id=>{
        const path=[];let parent=id;
        while(parent!==undefined&&!frames.has(parent)&&!ancestors.has(parent)){path.push(parent);parent=byId.get(parent)?.parentId;}
        const result=frames.has(parent)?parent:ancestors.get(parent);for(const entry of path)ancestors.set(entry,result);return result;
      };
      for(const item of doc.items)if(item.type==='connector'&&item.parentId!==undefined&&!frames.has(item.parentId)){
        const parent=survivingParent(item.parentId);if(parent===undefined)delete item.parentId;else item.parentId=parent;
      }
      reconcileFrames(doc);
    });
  }
  duplicate(ids) {
    const raw=this.copySelection(ids),source=JSON.parse(raw);if(!source.items.length)return[];const box=bounds(source.items);return this.pasteSelection(raw,box.x+24,box.y+24);
  }
  copySelection(ids) {
    const expanded=new Set(this.selection(ids,{descendants:true})),included=new Set(this.doc.items.filter(i=>expanded.has(i.id)&&i.type!=='connector').map(i=>i.id)),byId=new Map(this.doc.items.map(i=>[i.id,i]));
    const items=this.doc.items.filter(i=>i.type==='connector'?(expanded.has(i.id)||(included.has(i.from)&&included.has(i.to))):included.has(i.id)).map(item=>{
      const copy=clone(item);if(copy.parentId&&!included.has(copy.parentId))delete copy.parentId;
      if(item.type==='connector'){const geometry=connectorGeometry(resolveEndpoint(byId,item.from),resolveEndpoint(byId,item.to),item.route);for(const [key,point]of [['from',geometry.a],['to',geometry.b]])if(!included.has(item[key]))copy[key]=point;}
      return copy;
    });
    const tagIds=new Set(items.flatMap(item=>item.tagIds||[])),tags=this.doc.tags?.filter(tag=>tagIds.has(tag.id));return JSON.stringify({version:1,name:'Selection',items,...(tags?.length?{tags}: {})});
  }
  pasteSelection(json,x,y) {
    const source=validateDocument(JSON.parse(json));if(!source.items.length)return[];
    const box=bounds(source.items),map=new Map(source.items.map(i=>[i.id,crypto.randomUUID()])),groups=new Map(source.items.filter(i=>i.groupId).map(i=>[i.groupId,crypto.randomUUID()]));
    const endpoint=value=>typeof value==='string'?map.get(value):{x:value.x+x-box.x,y:value.y+y-box.y};
    const items=source.items.map(i=>({...clone(i),id:map.get(i.id),x:i.x+x-box.x,y:i.y+y-box.y,locked:false,...(i.parentId?{parentId:map.get(i.parentId)}:{}),...(i.groupId?{groupId:groups.get(i.groupId)}:{}),...(i.type==='connector'?{from:endpoint(i.from),to:endpoint(i.to)}:{})}));
    this.transact(doc=>{portableTags(source,doc,items);doc.items.push(...items);reconcileFrames(doc);});return items.map(i=>i.id);
  }
  bulkStickies(text,x,y,{fill='#f6e49b',columns=4}={}) {
    if(typeof text!=='string'||!Number.isInteger(columns)||columns<1||columns>12)throw Error('Invalid bulk input');
    const lines=text.split(/\r?\n/).map(line=>line.trim()).filter(Boolean);if(!lines.length||lines.length>500||lines.some(line=>line.length>3000))throw Error('Enter 1–500 non-empty lines, each up to 3000 characters');
    const items=lines.map((text,index)=>({id:crypto.randomUUID(),type:'sticky',x:x+(index%columns)*200,y:y+Math.floor(index/columns)*170,w:180,h:150,fill,text,autoFont:true}));
    this.transact(doc=>{doc.items.push(...items);reconcileFrames(doc);});return items.map(i=>i.id);
  }
  pasteCells(rows,x,y,{fill='#f6e49b',w=180,h=180,gap=20}={}){
    validateCellGrid(rows);if(![x,y,w,h,gap].every(finite)||w<1||h<1||gap<0)throw Error('Invalid spreadsheet note layout');
    const items=rows.flatMap((row,r)=>row.map((text,c)=>({id:crypto.randomUUID(),type:'sticky',x:x+c*(w+gap),y:y+r*(h+gap),w,h,fill,text,autoFont:true})));
    this.transact(doc=>{doc.items.push(...items);reconcileFrames(doc);});return items.map(item=>item.id);
  }
  clearableContent(ids) {const selected=new Set(this.selection(ids));return this.doc.items.filter(i=>selected.has(i.id)&&!i.locked&&['sticky','shape','card'].includes(i.type)&&(i.text||i.tagIds!==undefined)).map(i=>i.id);}
  clearContent(ids) {const targets=new Set(this.clearableContent(ids));return this.transact(doc=>{for(const i of doc.items)if(targets.has(i.id)){i.text='';delete i.tagIds;}});}
  stickyShapeTargets(ids){if(!Array.isArray(ids)||!ids.length)throw Error('Select existing unlocked sticky notes');const expanded=this.selection(ids),byId=new Map(this.doc.items.map(item=>[item.id,item])),notes=expanded.map(id=>byId.get(id));if(notes.some(item=>!item||item.type!=='sticky'||item.locked))throw Error('Select existing unlocked sticky notes');return notes;}
  canSetStickyShape(ids,shape){try{if(!['square','wide'].includes(shape))return false;return this.stickyShapeTargets(ids).some(item=>item.w!==item.h*(shape==='wide'?12/7:1)||item.shape&&item.shape!=='rectangle');}catch{return false;}}
  setStickyShape(ids,shape){if(!['square','wide'].includes(shape))throw Error('Unknown sticky shape');const targets=new Set(this.stickyShapeTargets(ids).map(item=>item.id));return this.transact(doc=>{for(const item of doc.items)if(targets.has(item.id)){const width=item.h*(shape==='wide'?12/7:1);if(item.w!==width){item.x+=(item.w-width)/2;item.w=width;}if(item.shape&&item.shape!=='rectangle')delete item.shape;}reconcileFrames(doc);});}
  resize(id,w,h) {
    const item=this.doc.items.find(i=>i.id===id);if(!item||item.locked||item.type==='connector')throw Error('Select an unlocked object to resize');
    this.transact(doc=>{const target=doc.items.find(i=>i.id===id),sx=w/target.w,sy=h/target.h;if(target.type==='pen')target.points=target.points.map(p=>[p[0]*sx,p[1]*sy]);target.w=w;target.h=h;reconcileFrames(doc);});
  }
  group(ids) {
    const expanded=this.selection(ids),items=this.doc.items.filter(i=>expanded.includes(i.id));
    if(items.length<2)throw Error('Select at least two objects to group');
    if(items.some(i=>i.locked))throw Error('Unlock the selected objects before grouping');
    if(new Set(items.map(i=>i.parentId||null)).size>1)throw Error('Objects on different frames cannot be grouped');
    const groupId=crypto.randomUUID();this.transact(doc=>{for(const i of doc.items)if(expanded.includes(i.id))i.groupId=groupId;});return expanded;
  }
  ungroup(ids) {const expanded=this.selection(ids);if(this.doc.items.some(i=>expanded.includes(i.id)&&i.locked))throw Error('Unlock the selected objects before ungrouping');this.transact(doc=>{for(const i of doc.items)if(expanded.includes(i.id))delete i.groupId;});return expanded;}
  frameSelection(ids) {
    const expanded=this.selection(ids,{descendants:true}),items=this.doc.items.filter(i=>expanded.includes(i.id)&&i.type!=='connector');
    if(!items.length)throw Error('Select objects to put in a frame');const box=bounds(items);
    return this.add('frame',box.x-32,box.y-40,{w:box.w+64,h:box.h+72,text:'New frame',fill:'#ffffff'});
  }
  align(ids, axis) {
    if(!['left','center','right','top','middle','bottom'].includes(axis))throw Error('Unknown alignment');
    const selected=new Set(this.selection(ids)),byId=new Map(this.doc.items.map(item=>[item.id,item]));
    const roots=this.doc.items.filter(item=>{if(!selected.has(item.id)||item.locked||item.type==='connector')return false;let parent=byId.get(item.parentId);while(parent){if(selected.has(parent.id))return false;parent=byId.get(parent.parentId);}return true;});
    const groups=new Map();for(const item of roots){const key=item.groupId?'group:'+item.groupId:'item:'+item.id;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(item);}
    const units=[...groups.values()].map(items=>({items,box:bounds(items),ids:new Set(this.selection(items.map(item=>item.id),{descendants:true}))}));
    if(units.some(unit=>this.doc.items.some(item=>unit.ids.has(item.id)&&item.locked)))throw Error('Unlock grouped or framed objects before aligning');
    const box=bounds(roots),moves=new Map();for(const unit of units){const own=unit.box,dx=axis==='left'?box.x-own.x:axis==='center'?box.x+(box.w-own.w)/2-own.x:axis==='right'?box.x+box.w-own.w-own.x:0,dy=axis==='top'?box.y-own.y:axis==='middle'?box.y+(box.h-own.h)/2-own.y:axis==='bottom'?box.y+box.h-own.h-own.y:0;for(const id of unit.ids)moves.set(id,{dx,dy});}
    this.transact(doc=>{for(const item of doc.items){const move=moves.get(item.id);if(move){if(item.type==='connector')translateFreeEndpoints(item,move.dx,move.dy);else{item.x+=move.dx;item.y+=move.dy;}}}reconcileFrames(doc);});
  }
  stackingOrder(ids, action) {
    action=action===true?'front':action===false?'back':action;if(!['front','back','forward','backward'].includes(action))throw Error('Unknown stacking action');
    const expanded=new Set(this.selection(ids)),groups=new Set(this.doc.items.filter(i=>expanded.has(i.id)&&i.groupId&&i.type!=='frame').map(i=>i.groupId));
    if(this.doc.items.some(i=>i.locked&&groups.has(i.groupId)))throw Error('Unlock grouped objects before changing their stacking order');
    const selected=new Set(this.doc.items.filter(i=>expanded.has(i.id)&&i.type!=='frame'&&!i.locked).map(i=>i.id));let widgets=this.doc.items.filter(i=>i.type!=='frame');
    if(action==='front'||action==='back'){const chosen=widgets.filter(i=>selected.has(i.id)),rest=widgets.filter(i=>!selected.has(i.id));widgets=action==='front'?[...rest,...chosen]:[...chosen,...rest];}
    else if(action==='forward'){for(let i=widgets.length-2;i>=0;i--)if(selected.has(widgets[i].id)&&!selected.has(widgets[i+1].id))[widgets[i],widgets[i+1]]=[widgets[i+1],widgets[i]];}
    else for(let i=1;i<widgets.length;i++)if(selected.has(widgets[i].id)&&!selected.has(widgets[i-1].id))[widgets[i],widgets[i-1]]=[widgets[i-1],widgets[i]];
    let at=0;return this.doc.items.map(i=>i.type==='frame'?i:widgets[at++]);
  }
  canReorder(ids,action){try{return this.stackingOrder(ids,action).some((item,index)=>item.id!==this.doc.items[index].id);}catch{return false;}}
  reorder(ids, action) {const ordered=this.stackingOrder(ids,action);return this.transact(doc=>{doc.items=ordered;});}
  orderFrames(ids) {
    const frames=this.doc.items.filter(item=>item.type==='frame'&&!item.parentId),byId=new Map(frames.map(item=>[item.id,item]));
    if(!Array.isArray(ids)||ids.length!==frames.length||new Set(ids).size!==ids.length||ids.some(id=>!byId.has(id)))throw Error('Frame order must include each root frame exactly once');
    this.transact(doc=>{let index=0;doc.items=doc.items.map(item=>byId.has(item.id)?byId.get(ids[index++]):item);});
  }
  timer(action,now=Date.now()){this.transact(doc=>{const next=transitionTimer(doc.timer,action,now);if(next===undefined)delete doc.timer;else doc.timer=next;});}
  undo() { if (!this.past.length) return false; this.future.push(clone(this.doc)); this.doc = this.past.pop(); return true; }
  redo() { if (!this.future.length) return false; this.past.push(clone(this.doc)); this.doc = this.future.pop(); return true; }
  serialize() { return JSON.stringify(this.doc); }
  static parse(json) { return new Board(JSON.parse(json)); }
}
