// A cloud callback can outlive a navigation. Only the selected source may
// describe the active board's persistence state.
export class SaveStatus {
 constructor(paint){this.paint=paint;this.source=null;}
 select(source,message){this.source=source;this.update(source,message);}
 update(source,message){if(source!==this.source)return false;if(typeof message!=='string'||!message.trim())throw Error('A save status message is required');this.paint(message);return true;}
}
export function deviceSaveStatus({storageError=false,blocked=false,hasSavedBoard=false}={}){
 if(storageError)return 'Storage could not be restored';
 if(blocked)return 'Not saved — export to keep changes';
 return hasSavedBoard?'Saved on this device':'Not saved — export to keep changes';
}
