import { Board, validateDocument } from './model.mjs';

export const LIBRARY_KEY = 'mirra.library.v1';
const clone = value => structuredClone(value);
function validateLibrary(value) {
  if (!value || value.version !== 1 || !Number.isSafeInteger(value.revision) || value.revision < 0 || !Array.isArray(value.boards) || !Array.isArray(value.spaces)) throw Error('Invalid board library');
  const ids = new Set(), spaces = new Set();
  for (const space of value.spaces) {
    if (!space || typeof space.id !== 'string' || !space.id || spaces.has(space.id) || typeof space.name !== 'string' || !space.name.trim() || space.name.length > 200) throw Error('Invalid space');
    spaces.add(space.id);
  }
  for (const entry of value.boards) {
    if (!entry || typeof entry.id !== 'string' || !entry.id || ids.has(entry.id)) throw Error('Invalid board entry');
    ids.add(entry.id); validateDocument(entry.doc);
    if (!['createdAt','updatedAt','openedAt'].every(k => Number.isSafeInteger(entry[k]) && entry[k] >= 0) || (entry.deletedAt !== null && (!Number.isSafeInteger(entry.deletedAt) || entry.deletedAt < 0)) || typeof entry.starred !== 'boolean' || (entry.spaceId !== null && !spaces.has(entry.spaceId))) throw Error('Invalid board metadata');
  }
  if (value.activeId !== null && !value.boards.some(b => b.id === value.activeId && b.deletedAt === null)) throw Error('Invalid active board');
  return clone(value);
}

// This is device-local persistence, not a multiuser database. Revision checks
// detect stale snapshots; they do not replace server-side concurrency control.
export class LocalLibrary {
  constructor(storage, now = () => Date.now()) {
    this.storage = storage; this.now = now;
    this.raw = storage.getItem(LIBRARY_KEY);
    if (this.raw !== null) this.state = validateLibrary(JSON.parse(this.raw));
    else {
      const legacy = storage.getItem('mirra.board.v1');
      const doc = legacy ? validateDocument(JSON.parse(legacy)) : new Board().doc;
      const entry = this.entry(doc);
      const initial = {version:1,revision:0,activeId:entry.id,spaces:[],boards:[entry]};
      const raw = JSON.stringify(initial);
      storage.setItem(LIBRARY_KEY, raw); // Keep legacy data as a recovery copy.
      this.state = initial; this.raw = raw;
    }
  }
  entry(doc) {
    const time = this.now();
    return {id:crypto.randomUUID(),doc:validateDocument(doc),createdAt:time,updatedAt:time,openedAt:time,deletedAt:null,starred:false,spaceId:null};
  }
  commit(change) {
    if (this.storage.getItem(LIBRARY_KEY) !== this.raw) throw Error('This library changed in another tab. Export unsaved work, then reload.');
    const next = clone(this.state); change(next); next.revision++;
    const validated = validateLibrary(next), raw = JSON.stringify(validated);
    this.storage.setItem(LIBRARY_KEY, raw); // A quota failure never advances memory.
    this.state = validated; this.raw = raw;
  }
  get(id = this.state.activeId) {
    const entry = this.state.boards.find(b => b.id === id);
    if (!entry) throw Error('Board does not exist'); return clone(entry);
  }
  save(doc) {
    const valid = validateDocument(doc), id = this.state.activeId;
    this.commit(state => { const entry=state.boards.find(b=>b.id===id&&b.deletedAt===null);if(!entry)throw Error('Open a board before saving');entry.doc=valid;entry.updatedAt=this.now(); });
  }
  create(name = 'Untitled board', spaceId = null) {
    const entry=this.entry({version:1,name,items:[]});entry.spaceId=spaceId;
    this.commit(state=>{state.boards.push(entry);state.activeId=entry.id;});return entry.id;
  }
  open(id) { this.commit(state=>{const entry=state.boards.find(b=>b.id===id&&b.deletedAt===null);if(!entry)throw Error('Board is in trash or missing');state.activeId=id;entry.openedAt=this.now();});return this.get(id); }
  rename(id,name) { if(typeof name!=='string'||!name.trim()||name.length>500)throw Error('Enter a board name between 1 and 500 characters');this.commit(state=>{const entry=state.boards.find(b=>b.id===id);if(!entry)throw Error('Board does not exist');entry.doc.name=name.trim();entry.updatedAt=this.now();}); }
  star(id) { this.commit(state=>{const entry=state.boards.find(b=>b.id===id);if(!entry)throw Error('Board does not exist');entry.starred=!entry.starred;}); }
  duplicate(id) {
    const original=this.get(id),entry=this.entry({...original.doc,name:`${original.doc.name.slice(0,490)} — copy`});entry.spaceId=original.spaceId;
    this.commit(state=>state.boards.push(entry));return entry.id;
  }
  trash(id) { this.commit(state=>{const entry=state.boards.find(b=>b.id===id);if(!entry)throw Error('Board does not exist');entry.deletedAt=this.now();if(state.activeId===id)state.activeId=null;}); }
  restore(id) { this.commit(state=>{const entry=state.boards.find(b=>b.id===id);if(!entry)throw Error('Board does not exist');entry.deletedAt=null;}); }
  addSpace(name) { if(typeof name!=='string'||!name.trim()||name.length>200)throw Error('Enter a space name between 1 and 200 characters');const id=crypto.randomUUID();this.commit(state=>state.spaces.push({id,name:name.trim()}));return id; }
  move(id,spaceId) { this.commit(state=>{if(spaceId!==null&&!state.spaces.some(s=>s.id===spaceId))throw Error('Space does not exist');const entry=state.boards.find(b=>b.id===id);if(!entry)throw Error('Board does not exist');entry.spaceId=spaceId;}); }
  list({query='',view='recent',spaceId=null,sort='opened'}={}) {
    return clone(this.state.boards.filter(b=>(view==='trash'?b.deletedAt!==null:b.deletedAt===null)&&(view!=='starred'||b.starred)&&(spaceId===null||b.spaceId===spaceId)&&b.doc.name.toLowerCase().includes(query.toLowerCase())).sort((a,b)=>sort==='name'?a.doc.name.localeCompare(b.doc.name):sort==='updated'?b.updatedAt-a.updatedAt:b.openedAt-a.openedAt));
  }
}
