import test from 'node:test';
import assert from 'node:assert/strict';
import {render,resolveParams,PARAMS,PRESETS} from '../src/drum-forge.js';
const base={bodyLevel:0,noiseLevel:.6,transientLevel:0,burstCount:3,burstSpacing:.015,burstDecay:.012,tailLevel:.4,tailDecay:.3,burstVariation:0};
test('each clap control alters its sound',()=>{
 const a=render('clap',base).samples;
 for(const [key,value] of Object.entries({burstCount:5,burstSpacing:.025,burstDecay:.025,tailLevel:.8,tailDecay:.7,burstVariation:.6}))
  assert.notDeepEqual(a,render('clap',{...base,[key]:value}).samples,key);
});
test('tail settings leave the initial bursts unchanged',()=>{
 const a=render('clap',base),b=render('clap',{...base,tailLevel:.9,tailDecay:1});
 assert.deepEqual(a.samples.slice(0,Math.floor(.045*44100)),b.samples.slice(0,Math.floor(.045*44100)));
 assert.ok(b.duration>a.duration);
 const dry=render('clap',{...base,tailLevel:0});
 assert.ok(dry.duration<a.duration);
});
test('burst count does not advance the underlying noise stream',()=>{
 const a=render('clap',base),b=render('clap',{...base,burstCount:6});
 assert.deepEqual(a.samples.slice(0,Math.floor(.014*44100)),b.samples.slice(0,Math.floor(.014*44100)));
});
test('variation and seed render deterministically with full tapered tails',()=>{
 for(const sampleRate of [8000,44100,96000]) {
  const p={...base,burstCount:8,burstSpacing:.06,burstVariation:1,tailDecay:1};
  const a=render('clap',p,{sampleRate});assert.deepEqual(a,render('clap',p,{sampleRate}));
  assert.notDeepEqual(a.samples,render('clap',{...p,seed:43},{sampleRate}).samples);
  assert.ok(a.samples.every(s=>Number.isFinite(s)&&Math.abs(s)<=1));
  assert.equal(Math.abs(a.samples.at(-1)),0);
  const tail=a.samples.slice(-Math.floor(sampleRate*.01));assert.ok(tail.every(s=>Math.abs(s)<.001));
 }
});
test('clap controls leave other voices and isolated clap body unchanged',()=>{
 const p={burstCount:8,burstSpacing:.06,burstDecay:.12,tailLevel:1,tailDecay:3,burstVariation:1};
 for(const voice of Object.keys(PRESETS).filter(v=>v!=='clap'))assert.deepEqual(render(voice),render(voice,p));
 const body={noiseLevel:0,transientLevel:0};assert.deepEqual(render('clap',body),render('clap',{...body,...p}));
});
test('clap controls validate count and ranges; old decay can set tail decay',()=>{
 assert.throws(()=>render('clap',{burstCount:2.5}));
 for(const key of ['burstCount','burstSpacing','burstDecay','tailLevel','tailDecay','burstVariation']) {
  const [min,max]=PARAMS[key];for(const value of [min-1,max+1,NaN,Infinity])assert.throws(()=>render('clap',{[key]:value}));
 }
 assert.equal(resolveParams('clap',{noiseDecay:.8}).tailDecay,.8);
 assert.equal(resolveParams('clap',{decay:.7}).tailDecay,.7);
 assert.equal(resolveParams('clap',{noiseDecay:.8,tailDecay:.2}).tailDecay,.2);
});
