const patterns=Object.freeze({drift:[261.63,329.63,392,329.63],pulse:[220,261.63,329.63,261.63]});
export class TimerAudio{
  constructor({createContext=()=>new (globalThis.AudioContext||globalThis.webkitAudioContext)(),repeat=(fn,ms)=>setInterval(fn,ms),cancel=id=>clearInterval(id)}={}){this.createContext=createContext;this.repeat=repeat;this.cancel=cancel;this.context=null;this.enabled=false;this.busy=false;this.musicKey=null;this.loop=null;this.musicNodes=new Set();this.chimeNodes=new Set();this.generation=0;this.scope=null;}
  get state(){return!this.enabled?'muted':this.context?.state==='running'?'ready':'suspended';}
  async setEnabled(enabled){
    if(enabled&&this.busy)return;const generation=++this.generation;
    if(!enabled){this.enabled=false;this.stopMusic();this.stopNodes(this.chimeNodes);return;}
    this.busy=true;
    try{this.context??=this.createContext();await this.context.resume();if(generation!==this.generation)return;if(this.context.state!=='running')throw Error('Sound is blocked. Try enabling it again.');this.enabled=true;}
    catch(problem){if(generation!==this.generation)return;this.enabled=false;this.stopMusic();throw Error('Timer sound is unavailable: '+problem.message);}
    finally{this.busy=false;}
  }
  stopNodes(nodes){for(const node of nodes){try{node.oscillator.stop();}catch{}try{node.oscillator.disconnect();node.gain.disconnect();}catch{}}nodes.clear();}
  stopMusic(){if(this.loop!==null)this.cancel(this.loop);this.loop=null;this.musicKey=null;this.stopNodes(this.musicNodes);}
  tone(frequency,when,duration,volume,type,nodes){const oscillator=this.context.createOscillator(),gain=this.context.createGain(),node={oscillator,gain};oscillator.type=type;oscillator.frequency.setValueAtTime(frequency,when);gain.gain.setValueAtTime(.0001,when);gain.gain.linearRampToValueAtTime(volume,when+.03);gain.gain.exponentialRampToValueAtTime(.0001,when+duration);oscillator.connect(gain);gain.connect(this.context.destination);nodes.add(node);oscillator.onended=()=>{nodes.delete(node);oscillator.disconnect();gain.disconnect();};oscillator.start(when);oscillator.stop(when+duration+.02);}
  phrase(track){const start=this.context.currentTime+.02;patterns[track].forEach((frequency,index)=>this.tone(frequency,start+index,.7,.035,track==='pulse'?'triangle':'sine',this.musicNodes));}
  sync({timer,remaining,scope,active=true}){if(scope!==this.scope||!active){this.stopNodes(this.chimeNodes);this.scope=scope;}const track=timer?.music||'none',wanted=active&&this.enabled&&this.context?.state==='running'&&timer?.state==='running'&&remaining>0&&Object.hasOwn(patterns,track)?`${scope}:${timer.runId}:${track}`:null;if(wanted===this.musicKey)return;this.stopMusic();if(wanted){this.musicKey=wanted;this.phrase(track);this.loop=this.repeat(()=>{if(this.enabled&&this.context?.state==='running')this.phrase(track);},4000);}}
  chime(){if(!this.enabled||this.context?.state!=='running')return false;this.stopNodes(this.chimeNodes);const start=this.context.currentTime+.02;[523.25,659.25,783.99].forEach((frequency,index)=>this.tone(frequency,start+index*.18,.5,.07,'sine',this.chimeNodes));return true;}
  close(){this.generation++;this.enabled=false;this.stopMusic();this.stopNodes(this.chimeNodes);void this.context?.close();}
}
