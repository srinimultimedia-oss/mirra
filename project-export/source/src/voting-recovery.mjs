const id=value=>typeof value==='string'&&/^[a-zA-Z0-9-]{10,100}$/.test(value);
export const votingRecoveryKey=({userId,boardId})=>'mirra.voting.intent.v1:'+JSON.stringify([userId,boardId]);
function validate(value,scope){
  if(!value||value.version!==1||value.userId!==scope.userId||value.boardId!==scope.boardId||!id(value.sessionId)||!['uncertain','rejected'].includes(value.phase)||!Number.isSafeInteger(value.revision)||value.revision<0||typeof value.done!=='boolean'||!value.votes||typeof value.votes!=='object'||Array.isArray(value.votes)||typeof value.error!=='string'||value.error.length>2000)throw Error('Stored voting recovery could not be read. Copy it before clearing.');
  let total=0;const entries=Object.entries(value.votes);for(const[key,count]of entries){if(!key||!Number.isSafeInteger(count)||count<1||count>99)throw Error('Stored voting allocation is invalid. Copy it before clearing.');total+=count;}if(total>99)throw Error('Stored voting allocation exceeds its limit. Copy it before clearing.');
  return{version:1,userId:scope.userId,boardId:scope.boardId,sessionId:value.sessionId,phase:value.phase,revision:value.revision,votes:Object.fromEntries(entries),done:value.done,error:value.error};
}
export class VotingRecovery{
  constructor(storage,scope){this.storage=storage;this.scope=scope;this.key=votingRecoveryKey(scope);this.raw=null;this.entry=null;this.error='';this.corrupt=false;
    if(storage===null){this.error='Voting reload recovery is unavailable in this tab. Copy unsaved votes before closing.';return;}if(!storage)return;
    try{this.raw=storage.getItem(this.key);if(this.raw!==null){if(this.raw.length>4_000_000)throw Error('Stored voting recovery is too large. Copy it before clearing.');this.entry=validate(JSON.parse(this.raw),scope);}}
    catch(error){this.corrupt=this.raw!==null;this.error=this.corrupt?'Stored voting recovery could not be read. Copy it before clearing.':'Voting reload recovery is unavailable. Copy unsaved votes before closing.';}
  }
  unchanged(){if(this.storage.getItem(this.key)!==this.raw)throw Error('Voting recovery changed in another panel. Existing stored data was preserved.');}
  save(value){this.entry=validate({...value,version:1,...this.scope},this.scope);if(!this.storage)return true;
    try{if(this.corrupt)throw Error('Unreadable voting recovery was preserved. Copy it before clearing.');this.unchanged();const raw=JSON.stringify(this.entry);this.storage.setItem(this.key,raw);this.raw=raw;this.error='';return true;}
    catch(error){this.error='Could not keep voting recovery: '+error.message+' Copy your current intent before closing.';return false;}
  }
  clear(){if(!this.storage){this.entry=null;return true;}
    try{this.unchanged();if(this.raw!==null)this.storage.removeItem(this.key);this.raw=null;this.entry=null;this.corrupt=false;this.error='';return true;}
    catch(error){this.error='Could not clear voting recovery: '+error.message;return false;}
  }
  copy(){return JSON.stringify({scope:this.scope,currentIntent:this.entry,storedBytes:this.raw},null,2);}
}
