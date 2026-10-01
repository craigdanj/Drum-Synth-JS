import test from 'node:test';
import assert from 'node:assert/strict';
import { DrumForge } from '../src/drum-forge.js';
function context(){
  const nodes=[],param=()=>({value:1,setTargetAtTime(v){this.value=v;},setValueAtTime(v){this.value=v;},cancelScheduledValues(){},linearRampToValueAtTime(){}});
  const node=()=>{const n={gain:param(),pan:param(),connect(){},disconnect(){this.disconnected=true;},start(t){this.startTime=t;},stop(t){this.stopTime=t;}};nodes.push(n);return n;};
  return {nodes,currentTime:5,sampleRate:44100,state:'suspended',destination:{},createGain:node,createBufferSource:node,createStereoPanner:node,createBuffer(c,n,r){return {copyToChannel(s){assert.equal(s.length,n);},sampleRate:r};},async resume(){this.state='running';},async close(){this.state='closed';}};
}
test('scheduling, cancellation, cache, polyphony and disposal',async()=>{
  const ctx=context(),s=new DrumForge({context:ctx,maxVoices:2});await s.resume();assert.equal(ctx.state,'running');
  const a=s.trigger('kick',{when:8});s.trigger('snare',{when:9});s.trigger('kick',{when:10});
  assert.equal(s.active.size,2);assert.equal(s.cache.size,2);assert.equal(ctx.nodes[1].startTime,8);assert.equal(ctx.nodes[1].stopTime,5.006);
  a.stop();s.stopAll();assert.equal(s.active.size,0);
  for(const node of ctx.nodes)node.onended?.();
  assert.ok(ctx.nodes.slice(1).every(n=>n.disconnected));
  await s.dispose();await s.dispose();assert.equal(ctx.state,'running');assert.throws(()=>s.trigger('kick'));
});
test('kit edits merge; invalid values are rejected; past times clamp to now',()=>{
  const ctx=context(),s=new DrumForge({context:ctx});s.configure('kick',{frequency:80});s.configure('kick',{decay:.7});assert.equal(s.getParams('kick').frequency,80);
  s.trigger('kick',{when:0});assert.equal(ctx.nodes[1].startTime,5);
  assert.throws(()=>s.trigger('kick',{pan:2}));assert.throws(()=>s.trigger('kick',{params:{typo:1}}));assert.throws(()=>s.setVolume(-1));
  assert.throws(()=>new DrumForge({context:ctx,maxVoices:1.5}));
});
