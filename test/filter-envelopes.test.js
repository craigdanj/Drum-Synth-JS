import test from 'node:test';
import assert from 'node:assert/strict';
import {render,PARAMS,PRESETS} from '../src/drum-synth.js';
const noise={bodyLevel:0,noiseLevel:.2,transientLevel:0,noiseHighpass:0,noiseLowpass:2000,noiseDecay:1,noiseFilterEnvDecay:.2};
test('zero envelope amounts ignore decay and preserve static audio',()=>{
 for(const voice of Object.keys(PRESETS))assert.deepEqual(render(voice),render(voice,{noiseFilterEnvAmount:0,noiseFilterEnvDecay:.005,metalFilterEnvAmount:0,metalFilterEnvDecay:3}));
});
test('noise sweeps brighten or darken the attack, then converge toward the base filter',()=>{
 const a=render('snare',{...noise,noiseFilterEnvAmount:2}).samples,b=render('snare',{...noise,noiseFilterEnvAmount:-2}).samples;
 const energy=(x,start,end)=>x.slice(start,end).reduce((sum,v)=>sum+v*v,0);
 assert.ok(energy(a,0,441)>energy(b,0,441)*2);
 let diff=0;for(let i=22050;i<26460;i++)diff=Math.max(diff,Math.abs(a[i]-b[i]));assert.ok(diff<.00001);
 assert.notDeepEqual(a,render('snare',{...noise,noiseFilterEnvAmount:2,noiseFilterEnvDecay:.6}).samples);
});
test('metal sweeps and decay change isolated hats at full strength',()=>{
 const p={noiseLevel:0,bodyLevel:.4,transientLevel:0,metalHighpass:0,metalLowpass:2000,metalFilterEnvDecay:.2};
 const a=render('openHat',{...p,metalFilterEnvAmount:2}).samples;
 assert.notDeepEqual(a,render('openHat',{...p,metalFilterEnvAmount:-2}).samples);
 assert.notDeepEqual(a,render('openHat',{...p,metalFilterEnvAmount:2,metalFilterEnvDecay:.6}).samples);
 assert.deepEqual(a,render('openHat',{...p,metalFilterEnvAmount:2}).samples);
});
test('envelopes affect only their own layers and do not lengthen the hit',()=>{
 const p={noiseLevel:0,transientLevel:0};
 assert.deepEqual(render('snare',p),render('snare',{...p,noiseFilterEnvAmount:4,metalFilterEnvAmount:4}));
 const n={bodyLevel:0,transientLevel:0};assert.deepEqual(render('openHat',n),render('openHat',{...n,metalFilterEnvAmount:4}));
 for(const voice of ['snare','openHat'])assert.equal(render(voice).duration,render(voice,{noiseFilterEnvAmount:4,metalFilterEnvAmount:-4,noiseFilterEnvDecay:3,metalFilterEnvDecay:3}).duration);
});
test('fast resonant sweeps remain finite at rate and cutoff extremes',()=>{
 for(const sampleRate of [8000,44100,96000])for(const amount of [-4,4])for(const cutoff of [20,20000]) {
  const p={noiseResonance:1,noiseLowpass:cutoff,metalLowpass:cutoff,noiseFilterEnvAmount:amount,metalFilterEnvAmount:amount,noiseFilterEnvDecay:.005,metalFilterEnvDecay:.005};
  const a=render('openHat',p,{sampleRate}).samples;assert.ok(a.every(x=>Number.isFinite(x)&&Math.abs(x)<=1));assert.equal(Math.abs(a.at(-1)),0);
 }
});
test('new envelope bounds reject invalid inputs',()=>{
 for(const key of ['noiseFilterEnvAmount','noiseFilterEnvDecay','metalFilterEnvAmount','metalFilterEnvDecay']) {
  const [min,max]=PARAMS[key];for(const value of [min-1,max+1,NaN,Infinity])assert.throws(()=>render('snare',{[key]:value}));
 }
});
