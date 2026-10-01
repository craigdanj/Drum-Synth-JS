import test from 'node:test';
import assert from 'node:assert/strict';
import {render,RESONANCE_VOICES,PARAMS} from '../src/drum-synth.js';
const base={noiseLevel:0,transientLevel:0,bodyDecay:.05,bodyLevel:.4,pitchSweepSemitones:0};
test('each resonance slot adds deterministic sound with adjustable ratio and level',()=>{
 for(const voice of RESONANCE_VOICES)for(const n of [1,2,3]) {
  const p={...base,[`resonance${n}Level`]:.3,[`resonance${n}Decay`]:.2};
  const a=render(voice,p);assert.notDeepEqual(a,render(voice,base));assert.deepEqual(a,render(voice,p));
  assert.notDeepEqual(a.samples,render(voice,{...p,[`resonance${n}Ratio`]:4.7}).samples);
  assert.notDeepEqual(a.samples,render(voice,{...p,[`resonance${n}Level`]:.1}).samples);
 }
});
test('long active resonance tails survive short body decay; inactive tails add no duration',()=>{
 const a=render('tom',base),b=render('tom',{...base,resonance1Level:.3,resonance1Decay:.8});
 assert.ok(b.duration>.8);assert.ok(b.samples.slice(4410,8820).some(s=>Math.abs(s)>.001));
 assert.equal(Math.abs(b.samples.at(-1)),0);
 assert.deepEqual(a,render('tom',{...base,resonance1Decay:3,resonance2Decay:3,resonance3Decay:3}));
});
test('body level mutes resonances without changing noise or transient output',()=>{
 const p={bodyLevel:0};assert.deepEqual(render('snare',p),render('snare',{...p,resonance1Level:1,resonance1Decay:3}));
});
test('clap and hats ignore body resonances',()=>{
 for(const voice of ['clap','closedHat','openHat'])assert.deepEqual(render(voice),render(voice,{resonance1Level:1,resonance1Decay:3,resonance2Level:1,resonance3Level:1}));
});
test('resonance validation and high-frequency rendering are safe',()=>{
 for(const key of Object.keys(PARAMS).filter(k=>k.startsWith('resonance'))) {
  const [min,max]=PARAMS[key];for(const value of [min-1,max+1,NaN,Infinity,null])assert.throws(()=>render('tom',{[key]:value}));
 }
 for(const sampleRate of [8000,44100,96000]) {
  const a=render('rim',{frequency:4000,pitchSweepSemitones:48,resonance1Ratio:8,resonance1Level:1,resonance2Level:1,resonance3Level:1},{sampleRate}).samples;
  assert.ok(a.every(x=>Number.isFinite(x)&&Math.abs(x)<=1));assert.equal(Math.abs(a.at(-1)),0);
 }
});
