import {ObjectDraft,objectDraftKey} from './object-drafts.mjs';
export function titleDraftKey(scope){objectDraftKey(scope,'board-name');return'mirra.board-name.v1.'+encodeURIComponent(scope);}
export function titleDraft(storage,scope){const draft=new ObjectDraft(storage,scope,'board-name',{key:titleDraftKey(scope)});if(draft.blocked)draft.error='Stored board-name recovery could not be read. Export its original bytes before reloading.';return draft;}
