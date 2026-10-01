import test from 'node:test';
import assert from 'node:assert/strict';
import {render,PARAMS,PRESETS} from '../src/drum-forge.js';
const base={bodyLevel:.5,noiseLevel:.5,transientLevel:0,bodyDecay:.5,noiseDecay:.5,metalMix:.5,metalDetune:10,metalDamping:.2,metalHighpass:1000,metalLowpass:16000};
test('five metallic controls alter both hats deterministically',()=>{
 for(const voice of ['closedHat','openHat']) {
  const a=render(voice,base);assert.deepEqual(a,render(voice,base));
  for(const [key,value] of Object.entries({metalMix:.8,metalDetune:80,metalDamping:.9,metalHighpass:6500,metalLowpass:3500}))assert.notDeepEqual(a.samples,render(voice,{...base,[key]:value}).samples,key);
 }
});
test('balance endpoints isolate layers and preserve the separate transient',()=>{
 for(const voice of ['closedHat','openHat']) {
  const noise={...base,metalMix:0};
  assert.deepEqual(render(voice,noise),render(voice,{...noise,metalDetune:80,metalDamping:1,metalHighpass:18000,metalLowpass:20}));
  const metal={...base,metalMix:1};
  assert.deepEqual(render(voice,metal),render(voice,{...metal,noiseHighpass:18000,noiseLowpass:20,noiseResonance:1}));
  assert.ok(render(voice,{...base,metalMix:0,noiseLevel:0}).samples.every(s=>s===0));
  assert.ok(render(voice,{...base,metalMix:1,bodyLevel:0}).samples.every(s=>s===0));
  assert.ok(render(voice,{...base,metalMix:1,bodyLevel:0,transientLevel:.5}).samples.some(s=>Math.abs(s)>.01));
 }
});
test('damping lowers late metallic energy',()=>{
 const p={...base,metalMix:1,metalDamping:0};
 const energy=a=>a.slice(4410,11025).reduce((s,x)=>s+x*x,0);
 assert.ok(energy(render('openHat',{...p,metalDamping:1}).samples)<energy(render('openHat',p).samples));
});
test('metallic settings leave other voices unchanged',()=>{
 for(const voice of Object.keys(PRESETS).filter(v=>!v.includes('Hat')))assert.deepEqual(render(voice),render(voice,{metalMix:0,metalDetune:100,metalDamping:1,metalHighpass:18000,metalLowpass:20}));
});
test('metallic controls validate and pitched harmonics remain finite at all supported rates',()=>{
 for(const key of ['metalMix','metalDetune','metalDamping','metalHighpass','metalLowpass']) {
  const [min,max]=PARAMS[key];for(const value of [min-1,max+1,NaN,Infinity])assert.throws(()=>render('openHat',{[key]:value}));
 }
 for(const sampleRate of [8000,44100,48000,96000])for(const frequency of [25,4000]) {
  const a=render('openHat',{...base,frequency,metalDetune:100,pitchSweepSemitones:48,metalHighpass:18000,metalLowpass:20000},{sampleRate}).samples;
  assert.ok(a.every(s=>Number.isFinite(s)&&Math.abs(s)<=1));assert.equal(Math.abs(a.at(-1)),0);
 }
});
