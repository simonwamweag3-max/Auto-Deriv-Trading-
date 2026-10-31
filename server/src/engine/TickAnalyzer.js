export class TickAnalyzer {
  constructor(size=1000){if(!Number.isInteger(size)||size<1)throw Error("Invalid window size");this.size=size;this.ticks=[];this.counts=Array(10).fill(0);}
  push(d){if(!Number.isInteger(d)||d<0||d>9)throw Error("Digit must be 0..9");const before=this.frequencies();this.ticks.push(d);this.counts[d]++;if(this.ticks.length>this.size)this.counts[this.ticks.shift()]--;const after=this.frequencies();return{digit:d,previous:before,frequencies:after,spike:after[d]-before[d]>=.1-1e-9,sampleSize:this.ticks.length,ready:this.ticks.length===this.size};}
  frequencies(){const n=this.ticks.length||1;return this.counts.map(c=>c/n*100);}
  snapshot(){return{frequencies:this.frequencies(),sampleSize:this.ticks.length,windowSize:this.size,ready:this.ticks.length===this.size};}
}
