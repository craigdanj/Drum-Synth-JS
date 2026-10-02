import test from 'node:test';
import assert from 'node:assert/strict';
import {DrumSynth, render, resolveParams, PRESETS, EFFECT_PARAMS, DEFAULT_EFFECTS} from '../src/drum-synth.js';

function context(sampleRate=44100) {
  const nodes=[],buffers=[],sources=[];
  const param=value=>({value,calls:[],setTargetAtTime(v,t,k){this.value=v;this.calls.push(['target',v,t,k]);},setValueAtTime(v,t){this.value=v;this.calls.push(['set',v,t]);},cancelScheduledValues(t){this.calls.push(['cancel',t]);},linearRampToValueAtTime(v,t){this.value=v;this.calls.push(['ramp',v,t]);}});
  const node=kind=>{
    const n={kind,connections:[],disconnected:false,connect(to){this.connections.push(to);},disconnect(){this.connections=[];this.disconnected=true;}};
    nodes.push(n);return n;
  };
  return {nodes,buffers,sources,sampleRate,currentTime:2,state:'running',destination:{},
    createGain(){return Object.assign(node('gain'),{gain:param(1)});},
    createStereoPanner(){return Object.assign(node('pan'),{pan:param(0)});},
    createDelay(maxDelayTime){return Object.assign(node('delay'),{maxDelayTime,delayTime:param(0)});},
    createBiquadFilter(){return Object.assign(node('filter'),{type:'lowpass',frequency:param(350),Q:param(1)});},
    createConvolver(){return Object.assign(node('convolver'),{buffer:null,normalize:true});},
    createBuffer(channels,length,rate){
      const data=Array.from({length:channels},()=>new Float32Array(length));
      const b={numberOfChannels:channels,length,sampleRate:rate,duration:length/rate,
        getChannelData(c){return data[c];},copyToChannel(s,c){data[c].set(s);}};
      buffers.push(b);return b;
    },
    createBufferSource(){const s=Object.assign(node('source'),{start(t){this.startTime=t;},stop(t){this.stopTime=t;}});sources.push(s);return s;},
    async close(){this.state='closed';}
  };
}

test('dry defaults require no effects nodes and offline rendering ignores sends exactly',()=>{
  const c=context();delete c.createDelay;delete c.createConvolver;delete c.createBiquadFilter;
  const s=new DrumSynth({context:c});s.trigger('kick');assert.equal(s._effects,null);
  for(const voice of Object.keys(PRESETS)){
    assert.equal(PRESETS[voice].delaySend,0);assert.equal(PRESETS[voice].reverbSend,0);
    assert.deepEqual(render(voice),render(voice,{delaySend:1,reverbSend:1}));
  }
});

test('per-hit sends branch after velocity and pan while dry output stays connected',()=>{
  const c=context(),s=new DrumSynth({context:c,volume:.4});
  s.trigger('snare',{when:5,velocity:.35,pan:-.6,params:{delaySend:.25,reverbSend:.6}});
  const r=[...s._playbacks.values()][0],source=c.sources[0],panner=r.gain.connections[0];
  assert.equal(source.startTime,5);assert.equal(r.gain.gain.value,.35);assert.equal(panner.pan.value,-.6);
  assert.equal(panner.connections[0],s.output);assert.equal(s.output.gain.value,.4);
  assert.equal(r.sends.length,2);assert.equal(r.sends[0].gain.value,.25);assert.equal(r.sends[1].gain.value,.6);
  assert.equal(r.sends[0].connections[0],s._effects.delayInput);assert.equal(r.sends[1].connections[0],s._effects.reverbInput);
  assert.ok(panner.connections.includes(r.sends[0]));assert.ok(panner.connections.includes(r.sends[1]));
  assert.deepEqual(source.buffer.getChannelData(0),render('snare').samples);
});

test('all instruments share the two buses and send-only edits reuse dry buffers',()=>{
  const c=context(),s=new DrumSynth({context:c});s.trigger('kick');
  const dry=c.sources[0].buffer;
  s.configure('kick',{delaySend:.2,reverbSend:.3});s.trigger('kick');
  const fx=s._effects;assert.equal(c.sources[1].buffer,dry);assert.equal(s.cache.size,1);
  s.trigger('kick',{params:{delaySend:.8,reverbSend:0}});s.trigger('tom',{params:{reverbSend:.4}});
  assert.equal(s._effects,fx);assert.equal(c.nodes.filter(n=>n.kind==='convolver').length,1);
  assert.equal(s.getParams('kick').delaySend,.2);
  assert.equal([...s._playbacks.values()][2].sends.length,1);
});

test('delay feedback is filtered, wet-only, bounded, and routed through master gain',()=>{
  const c=context(8000),s=new DrumSynth({context:c,effects:{delayFeedback:.85,delayTime:2,delayTone:18000}});
  s.trigger('rim',{params:{delaySend:1}});const f=s._effects;
  assert.deepEqual(f.delayInput.connections,[f.delay]);assert.deepEqual(f.delay.connections,[f.delayFilter]);
  assert.deepEqual(f.feedback.connections,[f.delay]);assert.equal(f.feedback.gain.value,.85);
  assert.deepEqual(f.delayReturn.connections,[s.output]);assert.equal(f.delay.delayTime.value,2);
  assert.equal(f.delay.maxDelayTime,2);assert.equal(f.delayFilter.frequency.value,3600);
  assert.ok(f.delayFilter.Q.value<=-3.0103);assert.equal(f.delayFilter.type,'lowpass');
  assert.ok(f.delayFilter.connections.includes(f.feedback));assert.ok(f.delayFilter.connections.includes(f.delayReturn));
});

test('reverb has pre-delay, deterministic stereo impulse, bounded samples and fading tail',()=>{
  for(const rate of [8000,44100,96000]){
    const c=context(rate),s=new DrumSynth({context:c,effects:{reverbDecay:.4,reverbPreDelay:.08}});
    s.trigger('clap',{params:{reverbSend:.4}});const f=s._effects,b=f.convolver.buffer;
    assert.equal(b.numberOfChannels,2);assert.equal(b.length,Math.ceil(rate*.4));assert.equal(b.sampleRate,rate);
    assert.deepEqual(f.reverbInput.connections,[f.preDelay]);assert.equal(f.preDelay.delayTime.value,.08);
    assert.deepEqual(f.preDelay.connections,[f.convolver]);assert.deepEqual(f.convolver.connections,[f.reverbFilter]);
    assert.deepEqual(f.reverbReturn.connections,[s.output]);assert.equal(f.convolver.normalize,true);
    assert.notDeepEqual(b.getChannelData(0),b.getChannelData(1));
    for(let ch=0;ch<2;ch++){
      const a=b.getChannelData(ch);assert.ok(a.every(x=>Number.isFinite(x)&&Math.abs(x)<=1));
      assert.equal(Math.abs(a[0]),0);assert.equal(Math.abs(a.at(-1)),0);
      const energy=(start,end)=>a.slice(start,end).reduce((n,x)=>n+x*x,0);
      assert.ok(energy(0,Math.floor(a.length/4))>100*energy(Math.floor(a.length*.75),a.length));
    }
    s.clearEffects();s.trigger('clap',{params:{reverbSend:.4}});
    assert.deepEqual(b.getChannelData(0),s._effects.convolver.buffer.getChannelData(0));
  }
});

test('effect changes merge, smooth continuous controls, and rebuild only the changed reverb length',()=>{
  const c=context(),s=new DrumSynth({context:c});s.trigger('tom',{params:{reverbSend:.4}});
  const f=s._effects,ir=f.convolver.buffer;
  s.setEffects({delayTime:.45,delayLevel:.2,reverbTone:1200});
  assert.equal(f.delay.delayTime.value,.45);assert.equal(f.delayReturn.gain.value,.2);
  assert.equal(f.reverbFilter.frequency.value,1200);assert.equal(f.convolver.buffer,ir);
  assert.equal(f.delay.delayTime.calls[0][0],'target');
  s.setEffects({reverbDecay:2.2});assert.notEqual(f.convolver.buffer,ir);assert.ok(Math.abs(f.convolver.buffer.duration-2.2)<=1/c.sampleRate+1e-12);
  const copy=s.getEffects();copy.delayTime=1;assert.equal(s.getEffects().delayTime,.45);
  assert.equal(s.getEffects().reverbTone,1200);
});

test('effects and sends validate atomically, including constructor and disabled settings',()=>{
  const c=context(),s=new DrumSynth({context:c});const before=s.getEffects();
  for(const [key,[min,max]] of Object.entries(EFFECT_PARAMS))for(const value of [min-.01,max+.01,NaN,Infinity,null,undefined,'1']){
    assert.throws(()=>s.setEffects({[key]:value}));assert.deepEqual(s.getEffects(),before);
  }
  for(const bad of [null,[],{enabled:1},{enabled:null},{typo:1},{enabled:false,delayFeedback:1}])assert.throws(()=>s.setEffects(bad));
  assert.throws(()=>new DrumSynth({context:c,effects:null}));
  for(const key of ['delaySend','reverbSend'])for(const value of [-.01,1.01,NaN,Infinity,null])assert.throws(()=>resolveParams('snare',{[key]:value}));
  assert.ok(Object.isFrozen(EFFECT_PARAMS));assert.ok(Object.isFrozen(EFFECT_PARAMS.delayTime));assert.ok(Object.isFrozen(DEFAULT_EFFECTS));
});

test('bypass clears wet audio and preserves settings for subsequent enabled hits',()=>{
  const c=context(),s=new DrumSynth({context:c,effects:{delayTime:.6}});s.configure('rim',{delaySend:.5});
  s.trigger('rim');const old=s._effects,nodes=[...old.nodes],record=[...s._playbacks.values()][0];
  s.setEffects({enabled:false});assert.equal(s._effects,null);assert.ok(nodes.every(n=>n.disconnected));
  assert.ok(record.sends.every(n=>n.disconnected));assert.equal(record.source.disconnected,false);
  s.trigger('rim');assert.equal(s._effects,null);assert.equal([...s._playbacks.values()].at(-1).sends.length,0);
  s.setEffects({enabled:true});s.trigger('rim');assert.notEqual(s._effects,old);
  assert.equal(s._effects.delay.delayTime.value,.6);assert.equal(s.getParams('rim').delaySend,.5);
});

test('natural voice completion releases send nodes but leaves wet tails running',()=>{
  const c=context(),s=new DrumSynth({context:c});s.trigger('clap',{params:{delaySend:.3,reverbSend:.3}});
  const r=[...s._playbacks.values()][0],fx=s._effects;r.source.onended();
  assert.ok(r.sends.every(n=>n.disconnected));assert.equal(s.active.size,0);
  assert.equal(s._effects,fx);assert.ok(fx.nodes.every(n=>!n.disconnected));
  s.clearEffects();assert.equal(s._effects,null);
});

test('choking and cancellation act before sends; stopAll and dispose clear effect graphs',async()=>{
  const c=context(),s=new DrumSynth({context:c});const h=s.trigger('openHat',{when:5,params:{delaySend:.4,reverbSend:.2}});
  const r=[...s._playbacks.values()][0];s.trigger('closedHat',{when:5.1});
  assert.equal(r.chokeAt,5.1);assert.ok(Math.abs(r.source.stopTime-5.105)<1e-12);
  assert.ok(r.gain.gain.calls.some(x=>x[0]==='ramp'&&x[1]===0));
  h.stop();assert.ok(r.source.stopTime<5);const nodes=[...s._effects.nodes];s.stopAll();
  assert.equal(s._effects,null);assert.ok(nodes.every(n=>n.disconnected));assert.equal(s.active.size,0);
  s.trigger('rim',{params:{delaySend:.1}});await s.dispose();
  assert.equal(s._effects,null);assert.equal(c.state,'running');assert.equal(s.output.disconnected,true);
  for(const fn of [()=>s.getEffects(),()=>s.setEffects({}),()=>s.clearEffects()])assert.throws(fn);
});
