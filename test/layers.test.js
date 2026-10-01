import test from 'node:test';
import assert from 'node:assert/strict';
import { render, resolveParams } from '../src/drum-synth.js';
const muted = {bodyLevel:0,noiseLevel:0,transientLevel:0};
test('all three layers can be muted independently',()=>{
 assert.ok(render('snare',muted).samples.every(s=>s===0));
 for(const level of ['bodyLevel','noiseLevel','transientLevel']) {
  assert.ok(render('snare',{...muted,[level]:.7}).samples.some(s=>Math.abs(s)>.01));
 }
});
test('muted layers do not influence another layer or its duration',()=>{
 for(const voice of ['snare','clap']) {
  const p={...muted,bodyLevel:.8};
  assert.deepEqual(render(voice,p),render(voice,{...p,noiseAttack:.1,noiseDecay:3,transientDecay:.3}));
  const n={...muted,noiseLevel:.8};
  assert.deepEqual(render(voice,n),render(voice,{...n,bodyDecay:3,transientDecay:.3}));
 }
});
test('each envelope control changes its layer and long tails are retained',()=>{
 for(const [key,level,short,long] of [['bodyDecay','bodyLevel',.08,1],['noiseDecay','noiseLevel',.08,1],['noiseAttack','noiseLevel',.001,.08],['transientDecay','transientLevel',.005,.2]]) {
  const a=render('snare',{...muted,[level]:.7,[key]:short});
  const b=render('snare',{...muted,[level]:.7,[key]:long});
  assert.notDeepEqual(a.samples,b.samples);assert.ok(b.duration>a.duration);
  assert.equal(Math.abs(b.samples.at(-1)),0);
 }
});
test('legacy macros map to layers and explicit layer overrides take priority',()=>{
 const p=resolveParams('snare',{noise:.3,decay:.8,attack:.02,snap:.4,bodyDecay:.2,noiseLevel:.9});
 assert.equal(p.bodyLevel,.7);assert.equal(p.noiseLevel,.9);assert.equal(p.bodyDecay,.2);
 assert.equal(p.noiseDecay,.8);assert.equal(p.noiseAttack,.02);assert.equal(p.transientLevel,.4);
});
test('new controls reject invalid values',()=>{
 for(const key of ['bodyLevel','bodyDecay','noiseLevel','noiseAttack','noiseDecay','transientLevel','transientDecay'])
  for(const value of [-1,NaN,Infinity,100])assert.throws(()=>render('kick',{[key]:value}));
});
