import test from 'node:test';
import assert from 'node:assert/strict';
import {render,PARAMS,TRANSIENT_TYPES} from '../src/drum-synth.js';
const p={bodyLevel:0,noiseLevel:0,transientLevel:.6,transientDecay:.04};
test('blend endpoints match noise and tonal modes exactly',()=>{
 assert.deepEqual(render('kick',{...p,transientType:'noise'}),render('kick',{...p,transientType:'blend',transientMix:0}));
 assert.deepEqual(render('kick',{...p,transientType:'tonal'}),render('kick',{...p,transientType:'blend',transientMix:1}));
});
test('tone shapes noise and frequency shapes the independent knock',()=>{
 assert.notDeepEqual(render('kick',{...p,transientTone:0}),render('kick',{...p,transientTone:1}));
 assert.notDeepEqual(render('kick',{...p,transientType:'tonal',transientFrequency:300}),render('kick',{...p,transientType:'tonal',transientFrequency:3000}));
 assert.deepEqual(render('kick',{...p,transientType:'tonal',frequency:40,pitchSweepSemitones:0}),render('kick',{...p,transientType:'tonal',frequency:2000,pitchSweepSemitones:48}));
});
test('irrelevant controls do not affect an isolated impact',()=>{
 assert.deepEqual(render('snare',p),render('snare',{...p,transientFrequency:100,transientMix:1}));
 assert.deepEqual(render('snare',{...p,transientType:'tonal'}),render('snare',{...p,transientType:'tonal',transientTone:0,seed:123,transientMix:0}));
 assert.deepEqual(render('snare',{transientLevel:0}),render('snare',{transientLevel:0,transientType:'blend',transientFrequency:100,transientTone:.1}));
});
test('all impact types are deterministic, finite, and tapered at supported rates',()=>{
 for(const transientType of TRANSIENT_TYPES)for(const sampleRate of [8000,44100,96000]) {
  const params={...p,transientType,transientFrequency:12000};
  const a=render('rim',params,{sampleRate});assert.deepEqual(a,render('rim',params,{sampleRate}));
  assert.ok(a.samples.every(x=>Number.isFinite(x)&&Math.abs(x)<=1));assert.equal(a.samples[0],0);assert.equal(Math.abs(a.samples.at(-1)),0);
 }
});
test('character parameters reject invalid enum and numeric values',()=>{
 for(const transientType of ['square','',1,{},null])assert.throws(()=>render('kick',{transientType}));
 for(const key of ['transientTone','transientFrequency','transientMix']) {
  const [min,max]=PARAMS[key];for(const value of [min-1,max+1,NaN,Infinity])assert.throws(()=>render('kick',{[key]:value}));
 }
});
