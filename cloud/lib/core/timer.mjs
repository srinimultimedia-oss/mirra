export const MAX_TIMER_MS=24*60*60*1000;
export const TIMER_MUSIC=Object.freeze(['none','drift','pulse']);
const integer=value=>typeof value==='number'&&Number.isSafeInteger(value)&&value>=0;
const keys=['runId','state','durationMs','remainingMs','endsAt'];
export function validateTimer(timer){
  if(!timer||typeof timer!=='object'||Array.isArray(timer)||Object.keys(timer).some(key=>![...keys,'music'].includes(key))||keys.some(key=>!Object.hasOwn(timer,key))||typeof timer.runId!=='string'||!/^[a-zA-Z0-9_-]{1,100}$/.test(timer.runId)||!['running','paused','stopped'].includes(timer.state)||!integer(timer.durationMs)||timer.durationMs<1000||timer.durationMs>MAX_TIMER_MS||!integer(timer.remainingMs)||timer.remainingMs>MAX_TIMER_MS)throw Error('Invalid session timer');
  if(Object.hasOwn(timer,'music')&&!TIMER_MUSIC.includes(timer.music))throw Error('Invalid timer music');
  if(timer.state==='running'?!integer(timer.endsAt):timer.endsAt!==null)throw Error('Invalid timer deadline');
  if(timer.state==='stopped'&&timer.remainingMs!==timer.durationMs)throw Error('Invalid stopped timer');
  return structuredClone(timer);
}
export function timerRemaining(timer,now=Date.now()){
  if(!integer(now))throw Error('Invalid timer clock');
  if(!timer)return 0;validateTimer(timer);
  return timer.state==='running'?Math.min(MAX_TIMER_MS,Math.max(0,timer.endsAt-now)):timer.remainingMs;
}
export function transitionTimer(timer,action,now=Date.now()){
  if(!integer(now)||!action||typeof action!=='object')throw Error('Invalid timer action');
  if(timer)validateTimer(timer);
  if(action.kind==='clear')return undefined;
  if(action.kind==='start'){
    if(!integer(action.durationMs)||action.durationMs<1000||action.durationMs>MAX_TIMER_MS)throw Error('Set a timer from 1 second to 24 hours');
    const music=Object.hasOwn(action,'music')?action.music:'none';if(!TIMER_MUSIC.includes(music))throw Error('Invalid timer music');
    return validateTimer({runId:crypto.randomUUID(),state:'running',durationMs:action.durationMs,remainingMs:action.durationMs,endsAt:now+action.durationMs,...(music==='none'?{}:{music})});
  }
  if(!timer)throw Error('Start a timer first');
  const next=structuredClone(timer),remaining=timerRemaining(timer,now);
  if(action.kind==='music'){
    if(!TIMER_MUSIC.includes(action.music))throw Error('Invalid timer music');if(action.music==='none')delete next.music;else next.music=action.music;
  }else if(action.kind==='pause'){
    if(timer.state!=='running')throw Error('Only a running timer can be paused');
    next.state='paused';next.remainingMs=remaining;next.endsAt=null;
  }else if(action.kind==='resume'){
    if(timer.state!=='paused'||remaining===0)throw Error('Only a paused timer with time left can resume');
    next.state='running';next.endsAt=now+remaining;
  }else if(action.kind==='stop'||action.kind==='reset'){
    next.state='stopped';next.remainingMs=timer.durationMs;next.endsAt=null;
  }else if(action.kind==='add'){
    if(!integer(action.amountMs)||action.amountMs<1000||action.amountMs>MAX_TIMER_MS||timer.state==='stopped'||remaining+action.amountMs>MAX_TIMER_MS)throw Error('Cannot add that amount of timer time');
    next.remainingMs=remaining+action.amountMs;if(timer.state==='running')next.endsAt=now+next.remainingMs;
  }else throw Error('Unknown timer action');
  return validateTimer(next);
}
