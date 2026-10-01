import test from 'node:test';
import assert from 'node:assert/strict';
import {render,resolveParams,PARAMS} from '../src/drum-forge.js';
const noiseOnly={bodyLevel:0,noiseLevel:.1,transientLevel:0,noiseDecay:.3,noiseHighpass:0,noiseLowpass:16000};
const energy=a=>a.reduce((sum,s)=>sum+s*s,0)/a.length;
test('legacy pitch and tone map to new controls; explicit settings win',()=>{
 const p=resolveParams('kick',{pitchDrop:3,tone:.5});assert.equal(p.pitchSweepSemitones,24);assert.equal(p.noiseLowpass,7750);
 const q=resolveParams('kick',{pitchDrop:3,pitchSweepSemitones:-12,tone:1,noiseLowpass:2000});
 assert.equal(q.pitchSweepSemitones,-12);assert.equal(q.noiseLowpass,2000);
 assert.deepEqual(render('kick',{pitchDrop:3}),render('kick',{pitchSweepSemitones:24,pitchCurve:1}));
});
test('pitch controls support rising and falling sweeps and different curves',()=>{
 const p={frequency:150,bodyLevel:.5,bodyDecay:.6,noiseLevel:0,transientLevel:0,tone:0,pitchDecay:.08};
 const crossings=(a,start,end)=>{let n=0;for(let i=Math.floor(start*44100)+1;i<end*44100;i++)if(a[i-1]<=0&&a[i]>0)n++;return n;};
 const rise=render('kick',{...p,pitchSweepSemitones:-24}).samples;
 const fall=render('kick',{...p,pitchSweepSemitones:24}).samples;
 assert.ok(crossings(rise,0,.05)<crossings(rise,.3,.35));
 assert.ok(crossings(fall,0,.05)>crossings(fall,.3,.35));
 assert.notDeepEqual(fall,render('kick',{...p,pitchSweepSemitones:24,pitchCurve:2}).samples);
});
test('noise filters attenuate noise and resonance changes its spectrum',()=>{
 const wide=render('snare',noiseOnly).samples;
 assert.ok(energy(render('snare',{...noiseOnly,noiseLowpass:700}).samples)<energy(wide)*.3);
 assert.ok(energy(render('snare',{...noiseOnly,noiseHighpass:7000}).samples)<energy(wide)*.5);
 assert.notDeepEqual(render('snare',{...noiseOnly,noiseLowpass:3000}).samples,render('snare',{...noiseOnly,noiseLowpass:3000,noiseResonance:.5}).samples);
});
test('filters leave isolated body unchanged; pitch leaves isolated noise unchanged',()=>{
 const p={bodyLevel:.5,noiseLevel:0,transientLevel:0};
 assert.deepEqual(render('snare',p),render('snare',{...p,noiseHighpass:100,noiseLowpass:1000,noiseResonance:1}));
 assert.deepEqual(render('snare',noiseOnly),render('snare',{...noiseOnly,pitchSweepSemitones:-36,pitchCurve:3}));
});
test('resonant filters stay finite at cutoff corners and different sample rates',()=>{
 for(const sampleRate of [8000,44100,48000,96000])for(const noiseLowpass of [20,1000,20000])for(const noiseHighpass of [0,18000]) {
  const a=render('snare',{...noiseOnly,noiseLowpass,noiseHighpass,noiseResonance:1},{sampleRate}).samples;
  assert.ok(a.every(s=>Number.isFinite(s)&&Math.abs(s)<=1));assert.equal(Math.abs(a.at(-1)),0);
 }
});
test('all new parameters validate bounds and nonfinite inputs',()=>{
 for(const key of ['pitchSweepSemitones','pitchCurve','noiseHighpass','noiseLowpass','noiseResonance']) {
  const [min,max]=PARAMS[key];for(const value of [min-1,max+1,NaN,Infinity])assert.throws(()=>render('kick',{[key]:value}));
 }
});
