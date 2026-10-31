const L=[0,1,2,3],U=[6,7,8,9],ALL=[0,1,2,3,4,5,6,7,8,9],E=1e-9;
function extreme(f,set,i){const a=set.map(d=>({d,v:f[d]})).sort((x,y)=>x.v-y.v||x.d-y.d);if(a[i+1]&&Math.abs(a[i].v-a[i+1].v)<E)return null;return a[i]?.d??null;}
function distribution(f,s){return s.filter(d=>f[d]<9.7).length>=3&&s.every(d=>f[d]<10.5);}
function baseline(f,special,group){if(!distribution(f,group))return{ok:false,reason:"FREQUENCY_FILTER"};const red=extreme(f,ALL,0),yellow=extreme(f,ALL,1);if(red===null)return{ok:false,reason:"TIED_RED_BAR"};if(!special.includes(red))return{ok:false,reason:"RED_OUTSIDE_ALLOWED_SET"};if(red===special[0]){if(yellow===null||!group.includes(yellow))return{ok:false,reason:"YELLOW_RULE_FAILED"};return{ok:true,target:yellow,red,yellow};}if(group.includes(red))return{ok:true,target:red,red,yellow};const target=extreme(f,group,0);return target===null?{ok:false,reason:"TIED_BASELINE"}:{ok:true,target,red,yellow};}
export function selectOver3(f){return baseline(f,[4,0,1,2,3],L);}
export function selectUnder6(f){return baseline(f,[5,6,7,8,9],U);}
class Sequence {
 constructor(kind,emit=()=>{}){this.kind=kind;this.emit=emit;this.reset("INITIAL");}
 reset(reason){this.state="MONITORING";this.target=null;this.p0=null;this.snap=null;this.emit({type:"strategy_reset",strategy:this.kind,reason});}
 onTick(d,f,ready){if(!ready)return null;const over=this.kind==="OVER3",group=over?L:U,interrupt=over?[4,5,6,7,8,9]:[0,1,2,3,4,5],trigger=over?[6,7,8,9]:[0,1,2,3];if(this.state==="MONITORING"){const b=(over?selectOver3:selectUnder6)(f);if(b.ok){this.target=b.target;this.p0=f[b.target];this.state="WAITING_FIRST_INCREASE";this.emit({type:"baseline_selected",strategy:this.kind,...b,p0:this.p0});}return null;}
 if(this.state==="WAITING_FIRST_INCREASE"){if(f[this.target]<this.p0-.2-E)return this.reset("BASELINE_DROPPED");if(f[this.target]>=this.p0+.1-E){this.snap=[...f];this.state=over?"WAITING_SECOND_LOWER_INCREASE":"WAITING_SECOND_UPPER_INCREASE";this.emit({type:"first_increase_confirmed",strategy:this.kind,target:this.target});}return null;}
 if(this.state.startsWith("WAITING_SECOND")){if(interrupt.includes(d))return this.reset(over?"UPPER_INTERRUPT":"LOWER_INTERRUPT");const found=group.find(x=>f[x]>=this.snap[x]+.1-E);if(found!==undefined){this.state="READY_TO_EXECUTE";this.emit({type:"second_increase_confirmed",strategy:this.kind,digit:found});}return null;}
 if(this.state==="READY_TO_EXECUTE"){if(trigger.includes(d)){const order={contractType:over?"DIGITOVER":"DIGITUNDER",barrier:over?"3":"6",duration:1,durationUnit:"t",strategy:this.kind,target:this.target};this.reset("ORDER_SIGNALLED");return order;}this.reset("TRIGGER_MISSED");}return null;}
}
export class Over3Strategy extends Sequence{constructor(e){super("OVER3",e);}}
export class Under6Strategy extends Sequence{constructor(e){super("UNDER6",e);}}
