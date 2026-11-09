export class TimerCompletion{
  constructor(){this.scope=null;this.lastKey=null;this.armed=null;this.notified=new Set();this.wasActive=false;}
  remember(key){this.notified.add(key);if(this.notified.size>256)this.notified.delete(this.notified.values().next().value);}
  observe({scope,timer,remaining,active}){
    const key=timer?.state==='running'?`${timer.runId}:${timer.endsAt}`:null;
    if(scope!==this.scope){this.scope=scope;this.lastKey=key;this.armed=active&&remaining>0?key:null;this.notified.clear();if(key&&remaining===0)this.remember(key);this.wasActive=active;return false;}
    if(!active){this.lastKey=key;this.armed=null;this.wasActive=false;return false;}
    if(!this.wasActive){this.lastKey=key;this.armed=remaining>0?key:null;if(key&&remaining===0)this.remember(key);this.wasActive=true;return false;}
    const notify=!!key&&remaining===0&&!this.notified.has(key)&&(this.armed===key||key!==this.lastKey);
    this.armed=key&&remaining>0?key:null;this.lastKey=key;if(notify)this.remember(key);return notify;
  }
}
