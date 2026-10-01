import test from 'node:test';
import assert from 'node:assert/strict';
import {render,FM_VOICES,PRESETS,PARAMS} from '../src/drum-synth.js';
const body={noiseLevel:0,transientLevel:0,pitchSweepSemitones:0,frequency:160,bodyDecay:.6};
test('FM depth zero ignores ratio and decay on all voices',()=>{
 for(const voice of Object.keys(PRESETS))assert.deepEqual(render(voice),render(voice,{fmDepth:0,fmRatio:7.31,fmDecay:3}));
});
test('depth ratio and decay shape each supported voice deterministically',()=>{
 for(const voice of FM_VOICES) {
  const p={...body,fmDepth:1,fmRatio:1.4,fmDecay:.12};const a=render(voice,p);
  assert.deepEqual(a,render(voice,p));assert.notDeepEqual(a.samples,render(voice,body).samples);
  for(const change of [{fmDepth:2},{fmRatio:2.7},{fmDecay:.5}])assert.notDeepEqual(a.samples,render(voice,{...p,...change}).samples);
  assert.equal(a.duration,render(voice,body).duration);
 }
});
test('FM leaves isolated noise and transients unchanged and is ignored by clap/hats',()=>{
 for(const voice of FM_VOICES)assert.deepEqual(render(voice,{bodyLevel:0}),render(voice,{bodyLevel:0,fmDepth:4}));
 for(const voice of ['clap','closedHat','openHat'])assert.deepEqual(render(voice),render(voice,{fmDepth:4,fmRatio:8,fmDecay:3}));
});
test('modulation decays: late cycle count returns to the base pitch',()=>{
 const p={...body,frequency:200,tone:0,bodyDecay:1,fmDepth:3,fmRatio:1.4,fmDecay:.05};
 const samples=render('kick',p).samples;
 let crossings=0;for(let i=22051;i<26460;i++)if(samples[i-1]<=0&&samples[i]>0)crossings++;
 assert.ok(crossings>=19&&crossings<=21);
});
test('FM validates bounds and remains finite across sample rates at extremes',()=>{
 for(const key of ['fmDepth','fmRatio','fmDecay']) {const [min,max]=PARAMS[key];for(const value of [min-1,max+1,NaN,Infinity,null])assert.throws(()=>render('tom',{[key]:value}));}
 for(const sampleRate of [8000,44100,96000])for(const frequency of [25,4000]) {
  const a=render('cowbell',{frequency,pitchSweepSemitones:48,fmDepth:4,fmRatio:8,fmDecay:3},{sampleRate}).samples;
  assert.ok(a.every(x=>Number.isFinite(x)&&Math.abs(x)<=1));assert.equal(a[0],0);assert.equal(Math.abs(a.at(-1)),0);
 }
});
