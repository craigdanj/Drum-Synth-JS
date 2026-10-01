import test from 'node:test';
import assert from 'node:assert/strict';
import { PRESETS, PARAMS, render, encodeWav, resolveParams } from '../src/drum-forge.js';
for (const voice of Object.keys(PRESETS)) {
  test(`${voice}: finite, bounded, audible, deterministic, tapered PCM`, () => {
    const a=render(voice), b=render(voice); assert.deepEqual(a.samples,b.samples);
    assert.equal(a.samples[0],0); assert.equal(Math.abs(a.samples.at(-1)),0);
    let energy=0, tail=0;
    a.samples.forEach((s,i)=>{assert.ok(Number.isFinite(s)&&Math.abs(s)<=1);energy+=s*s;if(i>a.samples.length-441)tail+=s*s;});
    assert.ok(energy/a.samples.length>1e-5);assert.ok(tail/441<energy/a.samples.length*.02);
    assert.equal(a.duration,a.samples.length/a.sampleRate);
  });
}
test('velocity scales signal, including exact silence',()=>{
  const a=render('kick'),b=render('kick',{}, {velocity:.5}),c=render('snare',{}, {velocity:0});
  a.samples.forEach((s,i)=>assert.equal(b.samples[i],s*.5));assert.ok(c.samples.every(s=>s===0));
});
test('seed changes noise and overrides do not mutate presets',()=>{
  assert.notDeepEqual(render('snare',{seed:1}).samples,render('snare',{seed:2}).samples);
  const p=resolveParams('kick',{frequency:80});p.volume=0;assert.equal(PRESETS.kick.frequency,52);assert.equal(PRESETS.kick.volume,.8);
});
test('bad voices, nonfinite values, unknown keys, fractions and bounds fail',()=>{
  for(const v of ['toString','__proto__','unknown'])assert.throws(()=>render(v));
  for(const p of [null,[],{tone:NaN},{decay:Infinity},{frequency:0},{seed:1.1},{frequncy:100}])assert.throws(()=>render('kick',p));
  for(const o of [{sampleRate:0},{sampleRate:44100.5},{velocity:2},{foo:1}])assert.throws(()=>render('kick',{},o));
});
test('parameter extremes are finite at minimum and maximum sample rates',()=>{
  for(const voice of Object.keys(PRESETS))for(const edge of [0,1]) {
    const p=Object.fromEntries(Object.entries(PARAMS).map(([k,r])=>[k,r[edge]]));
    for(const sampleRate of [8000,96000])assert.ok(render(voice,p,{sampleRate}).samples.every(s=>Number.isFinite(s)&&Math.abs(s)<=1));
  }
});
test('WAV header, frame count, signed endpoints and clipping are correct',()=>{
  const wav=encodeWav({samples:new Float32Array([-2,-1,0,1,2]),sampleRate:48000}),v=new DataView(wav);
  assert.equal(new TextDecoder().decode(wav.slice(0,4)),'RIFF');assert.equal(v.getUint32(4,true),46);
  assert.equal(v.getUint16(22,true),1);assert.equal(v.getUint32(24,true),48000);assert.equal(v.getUint32(40,true),10);
  assert.deepEqual(Array.from({length:5},(_,i)=>v.getInt16(44+i*2,true)),[-32768,-32768,0,32767,32767]);
  assert.throws(()=>encodeWav({samples:new Float32Array([NaN]),sampleRate:44100}));
});
