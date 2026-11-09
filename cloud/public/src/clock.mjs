export class SharedClock{
  constructor({wall=()=>Date.now(),monotonic=()=>performance.now()}={}){this.wall=wall;this.monotonic=monotonic;this.anchor=null;this.lastSample=-1;}
  synchronize(serverTime){if(!Number.isSafeInteger(serverTime)||serverTime<0||serverTime<=this.lastSample)return false;this.lastSample=serverTime;this.anchor={serverTime:this.anchor?Math.max(serverTime,this.now()):serverTime,elapsed:this.monotonic()};return true;}
  now(){return this.anchor?Math.floor(this.anchor.serverTime+Math.max(0,this.monotonic()-this.anchor.elapsed)):this.wall();}
}
