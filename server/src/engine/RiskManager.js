export class RiskManager {
  constructor({baseStake=1,multiplier=2,maxLosses=2,maxTrades=6}={}){if(!(baseStake>0)||multiplier<1)throw Error("Invalid risk configuration");Object.assign(this,{baseStake,multiplier,maxLosses,maxTrades});this.losses=0;this.trades=0;this.paused=false;this.reason=null;}
  canTrade(){return !this.paused&&this.trades<this.maxTrades&&this.losses<this.maxLosses;}
  stake(){return Number((this.baseStake*this.multiplier**this.losses).toFixed(8));}
  settle(profit){if(!Number.isFinite(profit))throw Error("Invalid settlement");this.trades++;this.losses=profit<0?this.losses+1:0;if(this.losses>=this.maxLosses){this.paused=true;this.reason="MAX_CONSECUTIVE_LOSSES";}else if(this.trades>=this.maxTrades){this.paused=true;this.reason="MAX_SESSION_TRADES";}return this.snapshot();}
  snapshot(){return{trades:this.trades,consecutiveLosses:this.losses,nextStake:this.stake(),paused:this.paused,reason:this.reason,maxTrades:this.maxTrades,maxConsecutiveLosses:this.maxLosses};}
}
