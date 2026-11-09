import{validateDocument}from'./model.mjs';
import{SharedClock}from'./clock.mjs';
import{changesBetween,applyChanges,equal}from'./changes.mjs';
export async function cloudRequest(path,{method='GET',body,userId}={}){
  const response=await fetch('/api/'+path,{method,signal:AbortSignal.timeout(10000),headers:{...(body?{'Content-Type':'application/json'}:{}),...(userId?{'X-Mirra-User':userId}:{})},...(body?{body:JSON.stringify(body)}:{})});
  let data;
  try{data=await response.json();}
  catch{
    const status=response.ok?(response.redirected?401:502):response.status;
    const message=status===401?'Sign in again to reconnect to cloud':status===403?'Cloud access is unavailable':'Cloud returned an unreadable response. Try again.';
    throw Object.assign(new Error(message),{status});
  }
  if(!data||typeof data!=='object'||Array.isArray(data))throw Object.assign(new Error('Cloud returned an invalid response. Try again.'),{status:response.ok?502:response.status});
  if(!response.ok)throw Object.assign(new Error(typeof data.error==='string'?data.error:'Cloud request failed'),{status:response.status,data});return data;
}
export class CloudSession{
  constructor(snapshot,{onDocument=()=>{},onStatus=()=>{},onPresence=()=>{},onAttention=()=>{},onComments=()=>{},onVoting=()=>{},getViewport=()=>null,getFollowing=()=>null,request=cloudRequest,events=true,saveDraft}={}){
    this.onAttention=onAttention;
    this.getViewport=getViewport;this.getFollowing=getFollowing;
    this.base=structuredClone(snapshot);this.local=validateDocument(snapshot.doc);this.onDocument=onDocument;this.saveDraft=saveDraft;this.onStatus=message=>{this.lastStatus=message;onStatus(this.deviceBackupError?message.replaceAll('kept on this device','kept only in this tab').replace('Your device draft is preserved.','Your unsent changes remain in this tab.')+' · Device backup unavailable; export before reloading':message);};this.onPresence=onPresence;this.onComments=onComments;this.request=request;this.clientId=crypto.randomUUID();this.closed=false;this.conflict=null;this.pending=null;this.inflight=null;
    this.onVoting=onVoting;this.clock=new SharedClock();this.clock.synchronize(snapshot.serverTime);
    if(events)this.connect();this.onStatus(this.canEdit?'Cloud saved':'Cloud · read only');
  }
  get canEdit(){return!this.closed&&['owner','editor'].includes(this.base.role)&&!this.conflict;}
  acceptUser(userId){if(!this.base.userId||userId===this.base.userId)return true;this.conflict=Object.assign(Error('Account changed. Reload before continuing. Your device draft is preserved.'),{status:401});this.close();this.onStatus(this.conflict.message);return false;}
  connect(){
    if(this.closed||this.source)return;this.openEvents();
    this.presenceTimer=setInterval(()=>{void this.presence().catch(()=>{});},10000);void this.presence().catch(()=>{});
  }
  reportLiveStatus(){
    if(this.closed||this.conflict)return;
    const dirty=!!this.pending||!equal(this.base.doc,this.local);
    this.onStatus(this.saveErrorStatus||(this.streamState==='interrupted'?'Connection interrupted · '+(dirty?'unsaved changes kept on this device':'retrying'):dirty?(this.inflight?'Saving to cloud…':'Cloud update pending'):this.streamState==='refreshing'?'Refreshing live connection…':this.canEdit?'Live · cloud saved':'Live · read only'));
  }
  openEvents(){
    if(this.closed)return;this.disconnectedSource=null;const source=this.source=new EventSource(`/api/boards/${this.base.id}/events?revision=${this.base.revision}&clientId=${this.clientId}`),active=()=>!this.closed&&this.source===source&&this.disconnectedSource!==source;
    source.addEventListener('board',event=>{if(!active())return;try{const snapshot=JSON.parse(event.data);if(!this.acceptUser(snapshot.userId))return;if(this.inflight){if(!this.remote||snapshot.revision>=this.remote.revision)this.remote=snapshot;}else this.receive(snapshot);}catch(error){if(!this.conflict)this.onStatus(error.message);}});
    source.addEventListener('presence',event=>{if(!active())return;try{this.onPresence(JSON.parse(event.data).filter(p=>p.client_id!==this.clientId));}catch{}});
    source.addEventListener('attention',event=>{if(!active())return;try{this.receiveAttention(JSON.parse(event.data));}catch{}});
    source.addEventListener('comments',event=>{if(!active())return;try{const data=JSON.parse(event.data);if(this.acceptUser(data.userId))this.onComments(data);}catch{}});
    source.addEventListener('voting',event=>{if(!active())return;try{const data=JSON.parse(event.data);if(data.boardId!==this.base.id)return;if(this.acceptUser(data.userId)){this.clock.synchronize(data.serverTime);this.onVoting(data);}}catch{}});
    source.addEventListener('renew',event=>{if(!active())return;try{const data=JSON.parse(event.data);if(data.boardId!==this.base.id||!this.acceptUser(data.userId))return;source.close();this.streamState='refreshing';this.reportLiveStatus();this.openEvents();}catch{if(active()){this.streamState='interrupted';this.reportLiveStatus();}}});
    source.addEventListener('revoked',()=>{if(!active())return;this.conflict=Error('Access unavailable. Export your unsaved work.');this.close();this.onStatus(this.conflict.message);});
    source.onerror=()=>{if(!active())return;this.streamState='interrupted';this.reportLiveStatus();if(source.readyState===2){source.close();this.disconnectedSource=source;this.reconnectDelay=Math.min(30000,this.reconnectDelay?this.reconnectDelay*2:1000);clearTimeout(this.reconnectTimer);this.reconnectTimer=setTimeout(()=>{if(!this.closed&&this.source===source)this.openEvents();},this.reconnectDelay);}};
    source.onopen=()=>{if(!active())return;this.streamState='live';this.reconnectDelay=0;clearTimeout(this.reconnectTimer);this.reportLiveStatus();if(this.pending&&this.canEdit&&!this.inflight)void this.flush().catch(()=>{});};
  }
  viewportChanged(){if(this.closed)return;const signature=JSON.stringify([this.getViewport(),this.getFollowing()]);if(signature===this.viewportSignature)return;this.viewportSignature=signature;if(this.viewportTimer)return;this.viewportTimer=setTimeout(()=>{this.viewportTimer=null;void this.presence().catch(()=>{});},Math.max(0,500-(Date.now()-(this.lastPresenceAt||0))));}
  receiveAttention(data){if(this.closed||!data||data.boardId!==this.base.id||data.clientId!==this.clientId)return false;if(!this.acceptUser(data.userId))return false;if(typeof data.id!=='string'||!/^[a-zA-Z0-9-]{10,100}$/.test(data.id)||typeof data.from!=='string'||!/^[a-zA-Z0-9-]{10,100}$/.test(data.from)||data.from===this.clientId||![data.createdAt,data.serverTime].every(Number.isFinite)||data.createdAt>data.serverTime||data.serverTime-data.createdAt>=15000||this.attentionId===data.id)return false;this.attentionId=data.id;this.onAttention(data);return true;}
  async bring(target){if(!this.canEdit)throw Error('Editing permission is required to bring collaborators');await this.presence();if(this.closed)throw Error('The board session closed');const data=await this.request(`boards/${this.base.id}/attention`,{method:'POST',userId:this.base.userId,body:{clientId:this.clientId,target}});if(this.closed||data.boardId!==this.base.id||!this.acceptUser(data.userId))throw Error('The board or account changed');return data;}
  async presence(point){if(this.closed)return;if(point)this.cursor=point;this.lastPresenceAt=Date.now();await this.request(`boards/${this.base.id}/presence`,{method:'POST',userId:this.base.userId,body:{clientId:this.clientId,...this.cursor,viewport:this.getViewport(),followingClientId:this.getFollowing()}});}
  receive(snapshot){
    if(this.closed||this.conflict)return;
    if(!this.acceptUser(snapshot.userId))return;
    if(snapshot.revision<this.base.revision)return;
    this.clock.synchronize(snapshot.serverTime);
    if(snapshot.revision===this.base.revision){if(snapshot.role!==this.base.role){this.base.role=snapshot.role;this.reportLiveStatus();this.onDocument(structuredClone(this.local));}return;}
    try{const pending=changesBetween(this.base.doc,this.local),next=applyChanges(snapshot.doc,pending);this.base=structuredClone(snapshot);this.local=next;this.onDocument(structuredClone(next));this.reportLiveStatus();}
    catch(error){this.conflict=error;this.remote=snapshot;this.onStatus('Edit conflict · export draft or reload cloud');}
  }
  writeDeviceBackup(){if(typeof this.saveDraft!=='function'||this.closed||!['owner','editor'].includes(this.base.role))return false;try{this.saveDraft(structuredClone(this.base),structuredClone(this.local));this.deviceBackupError=null;return true;}catch(error){this.deviceBackupError=error||Error('Device backup unavailable');return false;}}
  retryDeviceBackup(){if(this.closed)return false;const saved=this.writeDeviceBackup();if(this.lastStatus)this.onStatus(this.lastStatus);return saved;}
  setDocument(doc){if(!this.canEdit)throw Error('This cloud board is read-only or has an unresolved conflict');this.local=validateDocument(doc);this.writeDeviceBackup();this.onStatus('Saving to cloud…');clearTimeout(this.saveTimer);this.saveTimer=setTimeout(()=>{void this.flush().catch(()=>{});},250);}
  async flush(){
    if(this.inflight){await this.inflight;if(!equal(this.base.doc,this.local))return this.flush();return;}
    if(this.conflict)throw this.conflict;if(this.closed)return;
    clearTimeout(this.saveTimer);
    this.inflight=(async()=>{
      while(!this.closed){
        if(!this.pending){const changes=changesBetween(this.base.doc,this.local);if(!changes.length)break;this.pending={operationId:crypto.randomUUID(),changes,sent:structuredClone(this.local)};}
        const pending=this.pending;
        let snapshot;try{snapshot=await this.request(`boards/${this.base.id}/changes`,{method:'POST',userId:this.base.userId,body:{operationId:pending.operationId,changes:pending.changes}});}
        catch(error){if(this.closed)return;if([400,401,403,404,409,413].includes(error.status)){this.conflict=error;if(error.status===401)this.close();this.onStatus(`${error.message} · export draft`);}else{this.saveErrorStatus='Offline · draft kept on this device';this.reportLiveStatus();clearTimeout(this.retryTimer);this.retryDelay=Math.min(30000,(this.retryDelay||1000)*2);this.retryTimer=setTimeout(()=>{if(!this.closed)void this.flush().catch(()=>{});},this.retryDelay);}throw error;}
        if(this.closed)return;
        if(!this.acceptUser(snapshot.userId))throw this.conflict;
        this.clock.synchronize(snapshot.serverTime);
        const later=changesBetween(pending.sent,this.local);
        try{this.local=applyChanges(snapshot.doc,later);}catch(error){this.conflict=error;this.onStatus('Edit conflict · draft kept on this device');throw error;}
        this.base=structuredClone(snapshot);this.pending=null;this.saveErrorStatus=null;this.retryDelay=0;clearTimeout(this.retryTimer);this.writeDeviceBackup();this.onDocument(structuredClone(this.local));
        if(this.remote){const remote=this.remote;this.remote=null;this.receive(remote);if(this.conflict)throw this.conflict;}
      }
      this.reportLiveStatus();
    })();
    try{await this.inflight;}finally{this.inflight=null;}
  }
  close(){this.closed=true;clearTimeout(this.viewportTimer);clearTimeout(this.saveTimer);clearTimeout(this.retryTimer);clearTimeout(this.reconnectTimer);clearInterval(this.presenceTimer);this.source?.close();if(typeof navigator!=='undefined'&&navigator.sendBeacon)navigator.sendBeacon(`/api/boards/${this.base.id}/presence`,JSON.stringify({clientId:this.clientId,leaving:true}));}
}


