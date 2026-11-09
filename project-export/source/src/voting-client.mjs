import{equal}from'./changes.mjs';
import{VotingRecovery}from'./voting-recovery.mjs';
export class VotingClient{
  constructor({boardId,userId,request,onChange=()=>{},storage}){Object.assign(this,{boardId,userId,request,onChange,sessions:[],view:null,selectedId:null,pending:false,loading:false,error:'',retryRequest:null,conflict:null,closed:false,generation:0});
    this.recoveryEnabled=storage!==undefined;this.recovery=new VotingRecovery(storage,{boardId,userId});const entry=this.recovery.entry;
    if(entry){this.selectedId=entry.sessionId;this.actionError=true;this.error=entry.error||'Recovered an unconfirmed ballot. Review the latest saved votes before retrying.';const body={revision:entry.revision,votes:entry.votes,done:entry.done};if(entry.phase==='uncertain')this.retryRequest={path:`boards/${boardId}/voting/${entry.sessionId}/ballot`,method:'PUT',sessionId:entry.sessionId,body};else{this.conflict={votes:entry.votes,done:entry.done};this.conflictSessionId=entry.sessionId;}}
  }
  keep(operation,phase,error=''){if(operation.method!=='PUT'||!this.recoveryEnabled)return;try{this.recovery.save({sessionId:operation.sessionId,phase,...operation.body,error:error.slice(0,2000)});}catch(problem){this.recovery.error='Voting reload recovery failed: '+problem.message;}}
  emit(){if(!this.closed)this.onChange(this);}
  accept(data){if(data.userId!==this.userId){this.blocked=true;throw Object.assign(Error('Account changed. Reload before continuing.'),{status:401});}return data;}
  async refresh(){
    if(this.closed||this.blocked)return;if(this.pending)return;const generation=++this.generation;this.loading=true;this.emit();
    try{const list=this.accept(await this.request(`boards/${this.boardId}/voting`,{userId:this.userId}));if(this.closed||generation!==this.generation)return;
      const pinned=this.conflictSessionId||this.retryRequest?.sessionId;
      const id=pinned||(this.selectedId&&list.sessions.some(s=>s.id===this.selectedId)?this.selectedId:(list.sessions.find(s=>s.status==='active')||list.sessions[0])?.id);
      const view=id?this.accept(await this.request(`boards/${this.boardId}/voting/${id}`,{userId:this.userId})):null;
      if(this.closed||generation!==this.generation)return;this.sessions=list.sessions;this.selectedId=id||null;this.view=view;
      const pending=this.retryRequest;if(pending?.method==='PUT'&&view?.session.id===pending.sessionId&&view.own.revision>pending.body.revision&&equal(view.own.votes,pending.body.votes)&&view.own.done===pending.body.done){this.recovery.clear();this.retryRequest=null;this.actionError=false;this.error='';}
      else if(pending?.method==='PUT'&&view?.session.id===pending.sessionId&&view.session.status==='ended'){this.retryRequest=null;this.conflict={votes:pending.body.votes,done:pending.body.done};this.conflictSessionId=pending.sessionId;this.error='The session ended before this ballot was confirmed. Compare your intended votes with the results.';this.actionError=true;this.keep(pending,'rejected',this.error);}
      if(!this.retryRequest&&!this.conflict&&!this.actionError)this.error='';
    }catch(error){if(!this.closed&&generation===this.generation)this.error=error.message;}finally{if(!this.closed&&generation===this.generation){this.loading=false;this.emit();}}
  }
  async select(id){if(this.pending||this.retryRequest||this.conflict)return;this.selectedId=id;await this.refresh();}
  async perform(path,body,method='POST'){
    if(this.closed||this.blocked||this.pending||this.retryRequest||this.conflict)return;const operation={path,body:structuredClone(body),method,...(method==='PUT'?{sessionId:this.view?.session.id||path.split('/').at(-2)}:{})};return this.send(operation);
  }
  async send(operation){
    if(this.closed||this.blocked||this.pending)return;++this.generation;this.loading=false;this.pending=true;this.error='';this.actionError=false;this.retryRequest=null;this.keep(operation,'uncertain');this.emit();
    try{const data=this.accept(await this.request(operation.path,{method:operation.method,body:operation.body,userId:this.userId}));if(this.closed)return;this.view=data;this.selectedId=data.session.id;this.conflict=null;this.conflictSessionId=null;if(operation.method==='PUT')this.recovery.clear();}
    catch(error){if(this.closed)return;this.error=error.message;this.actionError=true;
      if(error.status===401)this.blocked=true;
      if([400,409].includes(error.status)&&operation.method==='PUT'){try{if(error.data?.snapshot)this.view=this.accept(error.data.snapshot);this.conflict={votes:operation.body.votes,done:operation.body.done};this.conflictSessionId=operation.sessionId;this.keep(operation,'rejected',error.message);}catch(identityError){this.error=identityError.message;}}
      else if(!error.status||error.status>=500||error.status===429)this.retryRequest=operation;
    }finally{if(!this.closed){this.pending=false;this.emit();await this.refresh();}}
  }
  retry(){const operation=this.retryRequest;if(!operation)return;this.retryRequest=null;return this.send(operation);}
  async discard(){if(this.pending)return;if(!this.recovery.clear()){this.emit();return false;}this.retryRequest=null;this.conflict=null;this.conflictSessionId=null;this.actionError=false;this.error='';await this.refresh();return true;}
  reviewedBallot(){if(!this.conflict||!this.view||this.view.session.id!==this.conflictSessionId||this.view.session.status!=='active'||this.closed||this.blocked||this.pending)return;const draft=this.conflict;this.conflict=null;this.conflictSessionId=null;return this.perform(`boards/${this.boardId}/voting/${this.view.session.id}/ballot`,{...draft,revision:this.view.own.revision},'PUT');}
  close(){this.closed=true;++this.generation;}
}
