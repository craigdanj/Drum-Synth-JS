import test from 'node:test';
import assert from 'node:assert/strict';
import {PRESETS,resolveParams,render,encodeWav} from '../src/drum-synth.js';
import {KITS,KIT_ELECTRO_FM,KIT_MINIMAL,KIT_INDUSTRIAL,KIT_DEEP_DUB,KIT_RETRO_ARCADE,KIT_SOFT_DUSTY,KIT_ORIGINAL_REFINED} from '../src/kits.js';
const packs={'electro-fm':KIT_ELECTRO_FM,minimal:KIT_MINIMAL,industrial:KIT_INDUSTRIAL,'deep-dub':KIT_DEEP_DUB,'retro-arcade':KIT_RETRO_ARCADE,'soft-dusty':KIT_SOFT_DUSTY};
for(const [id,kit] of Object.entries(packs))test(`${id}: eight valid, distinct, deterministic sounds and WAVs`,()=>{
 assert.equal(KITS[id],kit);assert.ok(Object.isFrozen(kit));assert.deepEqual(Object.keys(kit),Object.keys(PRESETS));
 for(const [voice,params] of Object.entries(kit)) {
  assert.deepEqual(resolveParams(voice,params),params);assert.ok(Object.isFrozen(params));
  const a=render(voice,params);assert.deepEqual(a,render(voice,params));
  assert.notDeepEqual(a.samples,render(voice,KIT_ORIGINAL_REFINED[voice]).samples);
  assert.ok(a.samples.every(s=>Number.isFinite(s)&&Math.abs(s)<1));assert.ok(a.samples.some(s=>Math.abs(s)>.01));
  assert.equal(a.samples[0],0);assert.equal(Math.abs(a.samples.at(-1)),0);
  assert.equal(encodeWav(a).byteLength,44+a.samples.length*2);
  for(const sampleRate of [8000,96000])assert.ok(render(voice,params,{sampleRate,velocity:.35}).samples.every(s=>Number.isFinite(s)&&Math.abs(s)<=1));
 }
});
test('each new pack is different and minimal tails are shorter than industrial tails',()=>{
 for(const voice of Object.keys(PRESETS)) {
  const e=render(voice,KIT_ELECTRO_FM[voice]),m=render(voice,KIT_MINIMAL[voice]),i=render(voice,KIT_INDUSTRIAL[voice]);
  assert.notDeepEqual(e.samples,m.samples);assert.notDeepEqual(e.samples,i.samples);assert.notDeepEqual(m.samples,i.samples);assert.ok(m.duration<i.duration);
 }
});
