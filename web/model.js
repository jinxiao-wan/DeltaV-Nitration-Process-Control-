// New, dimensionless teaching model. No reactor kinetics or DeltaV runtime connection.
export const clamp=(x,lo=0,hi=100)=>Math.max(lo,Math.min(hi,x));
export class PI{
 constructor(kp,ki){this.kp=kp;this.ki=ki;this.integral=0;}
 track(output,error,bias=0){this.integral=output-bias-this.kp*error;}
 update(error,dt,bias=0,lo=0,hi=100){const next=this.integral+this.ki*error*dt;const raw=bias+this.kp*error+next;const out=clamp(raw,lo,hi);if(raw===out||(raw>hi&&error<0)||(raw<lo&&error>0))this.integral=next;return out;}
}
export class ProcessDemo{
 constructor({strategy='cascade',running=false}={}){
  this.strategy=strategy;this.time=0;this.sp=50;this.ratio=0.8;this.flowA=running?50:0;this.flowB=running?40:0;this.temperature=running?50:20;this.valveA=running?50:0;this.valveB=running?40:0;this.flowSP=running?50:0;this.ramp=running?100:0;
  this.state=running?'RUNNING':'IDLE';this.utilityReady=true;this.signalHealthy=true;this.tripReason='';this.disturbance=0;this.heatDisturbance=0;this.elapsedStage=0;this.events=[];this.alarms=[];this.history=[];
  this.master=new PI(2.3,.12);this.inner=new PI(2,.7);this.follower=new PI(2,.6);this.direct=new PI(2.3,.12);this.trackControllers();this.record();
 }
 event(message){this.events.unshift({time:this.time,message});this.events=this.events.slice(0,100);}
 trackControllers(){const err=this.sp-this.temperature;const bias=(this.sp-20)/.6;this.master.track(this.flowSP,err,bias);this.direct.track(this.valveA,err,bias);this.inner.track(this.valveA,this.flowSP-this.flowA,this.flowSP);this.follower.track(this.valveB,this.ratio*this.flowA-this.flowB,this.ratio*this.flowA);}
 setStrategy(value){if(!['single','cascade'].includes(value))throw Error('Unknown strategy');if(value!==this.strategy){this.strategy=value;this.trackControllers();this.event('Strategy changed to '+value);}}
 setSetpoint(value){if(!Number.isFinite(value)||value<35||value>65)throw Error('Setpoint must be 35–65 normalized units');this.sp=value;this.event('Normalized temperature setpoint changed to '+value);}
 setRatio(value){if(!Number.isFinite(value)||value<.5||value>1.2)throw Error('Ratio must be 0.5–1.2');this.ratio=value;this.event('Demonstration ratio changed to '+value);}
 start(){if(this.state!=='IDLE'){this.event('Start rejected: reset to IDLE first');return false;}if(!this.utilityReady||!this.signalHealthy){this.event('Start blocked: permissives not ready');return false;}this.state='CHECKS';this.elapsedStage=0;this.event('Start requested: checking simulated permissives');return true;}
 stop(){if(this.state==='TRIPPED')return;this.state='IDLE';this.valveA=0;this.valveB=0;this.ramp=0;this.flowSP=0;this.trackControllers();this.event('Stopped; simulated valves commanded closed');}
 trip(reason){if(this.state==='TRIPPED')return;this.state='TRIPPED';this.tripReason=reason;this.valveA=0;this.valveB=0;this.event('TRIP: '+reason);}
 resetTrip(){if(this.state!=='TRIPPED')return false;if(!this.utilityReady||!this.signalHealthy||this.temperature>=70){this.event('Reset blocked: restore permissives and temperature below 70');return false;}this.state='IDLE';this.tripReason='';this.ramp=0;this.flowSP=0;this.trackControllers();this.event('Trip reset; a separate start is required');return true;}
 setQuality(healthy){this.signalHealthy=healthy;this.event(healthy?'Signal quality restored':'Signal quality set BAD');if(!healthy&&['CHECKS','RAMPING','RUNNING'].includes(this.state))this.trip('Bad temperature signal');this.updateAlarms();}
 setUtility(ready){this.utilityReady=ready;this.event(ready?'Utility permissive ready':'Utility permissive removed');if(!ready&&['CHECKS','RAMPING','RUNNING'].includes(this.state))this.trip('Utility permissive lost');this.updateAlarms();}
 setDisturbance(flow=0,heat=0){if(!Number.isFinite(flow)||!Number.isFinite(heat))throw Error('Invalid disturbance');this.disturbance=clamp(flow,-30,30);this.heatDisturbance=clamp(heat,-30,30);this.event('Demonstration disturbance: flow '+this.disturbance+', heat '+this.heatDisturbance);}
 updateAlarms(){this.alarms=[];if(this.temperature>=65)this.alarms.push({id:'TEMP_HIGH',severity:'HIGH',message:'Normalized temperature above 65'});if(!this.signalHealthy)this.alarms.push({id:'SIGNAL_BAD',severity:'HIGH',message:'Temperature signal quality BAD'});if(!this.utilityReady)this.alarms.push({id:'UTILITY_LOST',severity:'HIGH',message:'Utility permissive missing'});if(this.state==='TRIPPED')this.alarms.push({id:'TRIP_LATCHED',severity:'TRIP',message:this.tripReason});}
 step(dt=.1){if(!Number.isFinite(dt)||dt<=0||dt>.5)throw Error('Step must be >0 and <=0.5');this.time+=dt;this.elapsedStage+=dt;
  if(['CHECKS','RAMPING','RUNNING'].includes(this.state)&&(!this.utilityReady||!this.signalHealthy))this.trip(!this.signalHealthy?'Bad temperature signal':'Utility permissive lost');
  if(this.state==='CHECKS'&&this.elapsedStage>=2){this.state='RAMPING';this.ramp=0;this.elapsedStage=0;this.event('Checks complete; normalized ramp begins');}
  if(this.state==='RAMPING'){this.ramp=Math.min(100,this.ramp+5*dt);this.flowSP=Math.min((this.sp-20)/.6,this.ramp);this.valveA=this.inner.update(this.flowSP-this.flowA,dt,this.flowSP);if(this.ramp>=100){this.state='RUNNING';this.trackControllers();this.event('Ramp complete; controller RUNNING');}}
  if(this.state==='RUNNING'){const err=this.sp-this.temperature,bias=(this.sp-20)/.6;if(this.strategy==='cascade'){this.flowSP=this.master.update(err,dt,bias);this.valveA=this.inner.update(this.flowSP-this.flowA,dt,this.flowSP);}else{this.valveA=this.direct.update(err,dt,bias);this.flowSP=this.valveA;}}
  if(['RUNNING','RAMPING'].includes(this.state))this.valveB=this.follower.update(this.ratio*this.flowA-this.flowB,dt,this.ratio*this.flowA);else{this.valveA=0;this.valveB=0;}
  const flowing=['RUNNING','RAMPING'].includes(this.state);const targetA=flowing?clamp(this.valveA+this.disturbance):0;const targetB=flowing?this.valveB:0;
  this.flowA+=(targetA-this.flowA)*(1-Math.exp(-dt/2));this.flowB+=(targetB-this.flowB)*(1-Math.exp(-dt/2.5));
  const targetT=20+.6*this.flowA+(flowing?this.heatDisturbance:0);this.temperature+=(targetT-this.temperature)*(1-Math.exp(-dt/15));
  if(this.temperature>=80&&['RAMPING','RUNNING'].includes(this.state))this.trip('Normalized temperature reached 80');
  this.updateAlarms();this.record();return this.snapshot();
 }
 snapshot(){return {time:this.time,state:this.state,sp:this.sp,temperature:this.temperature,flowA:this.flowA,flowB:this.flowB,flowSP:this.flowSP,valveA:this.valveA,valveB:this.valveB,ratio:this.ratio,actualRatio:this.flowA>.1?this.flowB/this.flowA:null,tripReason:this.tripReason};}
 record(){this.history.push(this.snapshot());if(this.history.length>1800)this.history.shift();}
 run(seconds,dt=.1){for(let i=0;i<Math.round(seconds/dt);i++)this.step(dt);return this.snapshot();}
}
export function compareScenario(){const result=[];for(const strategy of ['single','cascade']){const model=new ProcessDemo({strategy,running:true});model.setDisturbance(-15,0);let iae=0,peak=0;for(let i=0;i<1200;i++){model.step(.1);const e=Math.abs(model.sp-model.temperature);iae+=e*.1;peak=Math.max(peak,e);}result.push({strategy,iae,peak,history:model.history});}return result;}
export function csv(rows){return 'time_s,state,temperature_normalized,temperature_sp_normalized,flow_a_normalized,flow_b_normalized,flow_a_sp_normalized,valve_a_pct,valve_b_pct,ratio_sp\n'+rows.map(x=>[x.time.toFixed(2),x.state,x.temperature.toFixed(4),x.sp,x.flowA.toFixed(4),x.flowB.toFixed(4),x.flowSP.toFixed(4),x.valveA.toFixed(4),x.valveB.toFixed(4),x.ratio].join(',')).join('\n')+'\n';}
