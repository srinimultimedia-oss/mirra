export function parseRoute(hash) {
  if (!hash || hash === '#home') return {kind:'home',hash:'#home'};
  const match = /^#(board|cloud)\/([a-zA-Z0-9_-]{1,100})$/.exec(hash);
  return match ? {kind:match[1],id:match[2],hash} : null;
}

export class HistoryNavigation {
  constructor({current,getHash,openBoard,openCloud,home,restore,onError=()=>{}}) {
    Object.assign(this,{current,getHash,openBoard,openCloud,home,restore,onError});
    this.queue=Promise.resolve();this.active=false;
  }
  navigate(hash) {
    const run=async()=>{
      const route=parseRoute(hash);
      if(route?.hash===this.current())return true;
      this.active=true;
      try {
        if(!route)throw Error('Unknown board address');
        if(route.kind==='home')await this.home();
        else if(route.kind==='board')await this.openBoard(route.id);
        else await this.openCloud(route.id);
        return this.current()===route.hash;
      } catch(error){this.onError(error);return false;}
      finally {
        this.active=false;
        // A newer Back/Forward request may already be queued. Do not replace it.
        if(this.getHash()===hash&&this.current()!==route?.hash)this.restore(this.current());
      }
    };
    const result=this.queue.then(run);this.queue=result.catch(()=>{});return result;
  }
}
