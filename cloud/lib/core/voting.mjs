export const MAX_VOTING_MS=7*24*60*60*1000;
const integer=value=>typeof value==='number'&&Number.isSafeInteger(value);
export function validateVotingConfig(input,items){
  if(!input||typeof input!=='object'||typeof input.title!=='string'||!input.title.trim()||input.title.length>500||!integer(input.votesPerPerson)||input.votesPerPerson<1||input.votesPerPerson>99||typeof input.singlePerItem!=='boolean'||!integer(input.durationMs)||input.durationMs<1000||input.durationMs>MAX_VOTING_MS)throw Error('Invalid voting setup');
  const eligible=new Set(items.map(item=>item.id));
  if(!Array.isArray(input.itemIds)||!input.itemIds.length||input.itemIds.length>100000||new Set(input.itemIds).size!==input.itemIds.length||[...input.itemIds].some(id=>typeof id!=='string'||!eligible.has(id)))throw Error('Choose existing objects for voting');
  return{title:input.title.trim(),votesPerPerson:input.votesPerPerson,singlePerItem:input.singlePerItem,durationMs:input.durationMs,itemIds:[...input.itemIds]};
}
export function validateBallot(votes,session,{previous={},currentItemIds=session.itemIds}={}){
  if(!votes||typeof votes!=='object'||Array.isArray(votes))throw Error('Invalid ballot');
  const entries=Object.entries(votes),eligible=new Set(session.itemIds),current=new Set(currentItemIds);let total=0;
  if(entries.length>session.votesPerPerson)throw Error('Vote budget exceeded');
  for(const[id,count]of entries){if(!eligible.has(id)||!integer(count)||count<1||count>99||session.singlePerItem&&count>1)throw Error('Invalid vote allocation');if(!current.has(id)&&count>(Object.hasOwn(previous,id)?previous[id]:0))throw Error('This voting object was removed');total+=count;}
  if(total>session.votesPerPerson)throw Error('Vote budget exceeded');
  return Object.fromEntries(entries);
}
export function votingStatus(session,now=Date.now()){return session.status==='active'&&session.endsAt<=now?'ended':session.status;}
export function votingResults(participants){const totals=new Map();for(const participant of participants)for(const[id,count]of Object.entries(participant.votes))totals.set(id,(totals.get(id)||0)+count);return[...totals].map(([itemId,votes])=>({itemId,votes})).sort((a,b)=>b.votes-a.votes||a.itemId.localeCompare(b.itemId));}
export function votingView(session,participants,{userId,role},now=Date.now()){
  const status=votingStatus(session,now),canManage=['owner','editor'].includes(role)&&(role==='owner'||session.facilitatorId===userId),self=participants.find(participant=>participant.userId===userId);
  return{userId,serverTime:now,session:{id:session.id,title:session.title,itemIds:[...session.itemIds],votesPerPerson:session.votesPerPerson,singlePerItem:session.singlePerItem,durationMs:session.durationMs,createdAt:session.createdAt,endsAt:session.endsAt,status,revision:session.revision,canManage},own:{joined:!!self,votes:structuredClone(self?.votes||{}),revision:self?.revision||0,done:!!self?.done},progress:participants.map(participant=>({name:participant.name,done:!!participant.done,...(canManage?{used:Object.values(participant.votes).reduce((sum,count)=>sum+count,0)}:{})})),...(status==='ended'?{results:votingResults(participants)}:{})};
}
