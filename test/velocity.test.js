import test from 'node:test';
import assert from 'node:assert/strict';
import {DrumForge,render,PRESETS} from '../src/drum-forge.js';
import {KIT_808_REFINED,KIT_ORIGINAL_REFINED} from '../src/kits.js';
test('full strength preserves presets and zero strength stays silent',()=>{
 for(const kit of [KIT_808_REFINED,KIT_ORIGINAL_REFINED])for(const [voice,p] of Object.entries(kit)) {
  assert.deepEqual(render(voice,p),render(voice,{...p,velocityToBrightness:0,velocityToTransient:0}));
  assert.ok(render(voice,p,{velocity:0}).samples.every(s=>s===0));
 }
});
test('brightness response alters noise and metallic layers at soft velocity',()=>{
 for(const [voice,p] of [['snare',{bodyLevel:0,noiseLevel:.8,transientLevel:0}],['openHat',{bodyLevel:.8,noiseLevel:0,transientLevel:0}]]) {
  const a=render(voice,p,{velocity:.35}).samples,b=render(voice,{...p,velocityToBrightness:1},{velocity:.35}).samples;
  assert.notDeepEqual(a,b);assert.deepEqual(b,render(voice,{...p,velocityToBrightness:1},{velocity:.35}).samples);
 }
});
test('transient response softens an isolated attack without affecting other layers',()=>{
 const p={bodyLevel:0,noiseLevel:0,transientLevel:.5};
 const energy=a=>a.reduce((s,x)=>s+x*x,0);
 assert.ok(energy(render('kick',{...p,velocityToTransient:1},{velocity:.3}).samples)<energy(render('kick',p,{velocity:.3}).samples));
 assert.deepEqual(render('snare',{transientLevel:0},{velocity:.4}),render('snare',{transientLevel:0,velocityToTransient:1},{velocity:.4}));
});
test('live cached buffers with gain match offline rendering; velocity is not applied twice',()=>{
 const buffers=[],sources=[],gains=[];
 const param=()=>({value:1,setValueAtTime(){},cancelScheduledValues(){},linearRampToValueAtTime(){}});
 const node=()=>({connect(){},disconnect(){}});
 const ctx={sampleRate:44100,currentTime:0,destination:{},createGain(){const n={...node(),gain:param()};gains.push(n);return n;},createStereoPanner(){return {...node(),pan:param()};},createBuffer(c,n,r){const b={duration:n/r,copyToChannel(s){this.samples=s.slice();}};buffers.push(b);return b;},createBufferSource(){const n={...node(),start(){},stop(){}};sources.push(n);return n;}};
 const s=new DrumForge({context:ctx});const p=KIT_808_REFINED.snare;
 for(const v of [.35,.65,1,.35]) {
  s.trigger('snare',{params:p,velocity:v});
  const expected=render('snare',p,{velocity:v}).samples,actual=sources.at(-1).buffer.samples;
  for(let i=0;i<actual.length;i++)assert.ok(Math.abs(actual[i]*gains.at(-1).gain.value-expected[i])<1e-7);
 }
 assert.equal(buffers.length,3);
 const legacy=new DrumForge({context:ctx});legacy.trigger('kick',{velocity:.3});legacy.trigger('kick',{velocity:.7});assert.equal(legacy.cache.size,1);
});
test('response controls reject invalid values without mutating presets',()=>{
 for(const key of ['velocityToBrightness','velocityToTransient'])for(const v of [-1,2,NaN,Infinity])assert.throws(()=>render('snare',{[key]:v}));
 assert.equal(PRESETS.snare.velocityToBrightness,0);
});
