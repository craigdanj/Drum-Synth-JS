import test from 'node:test';
import assert from 'node:assert/strict';
import { PRESETS, render } from '../src/drum-synth.js';
import { KIT_808 } from '../src/kits.js';
test('808 pack renders eight distinct, deterministic, finite, tapered sounds', () => {
  assert.deepEqual(Object.keys(KIT_808), Object.keys(PRESETS));
  for (const [voice, params] of Object.entries(KIT_808)) {
    const a = render(voice, params).samples;
    assert.deepEqual(a, render(voice, params).samples);
    assert.notDeepEqual(a, render(voice).samples);
    assert.ok(a.every(s => Number.isFinite(s) && Math.abs(s) <= 1));
    assert.ok(a.reduce((sum, s) => sum + s*s, 0) / a.length > 1e-5);
    assert.equal(a[0], 0); assert.equal(Math.abs(a.at(-1)), 0);
  }
});

test('both refined kits produce distinct finite audio and preserve tuning and output gain', async()=>{
  const {KITS}=await import('../src/kits.js');
  for(const base of ['original','808'])for(const voice of Object.keys(PRESETS)) {
    const old=KITS[base][voice], fresh=KITS[`${base}-refined`][voice];
    assert.equal(fresh.frequency,old.frequency);assert.equal(fresh.volume,old.volume);
    const a=render(voice,fresh).samples;
    assert.notDeepEqual(a,render(voice,old).samples);
    assert.deepEqual(a,render(voice,fresh).samples);
    assert.ok(a.every(s=>Number.isFinite(s)&&Math.abs(s)<=1));
    assert.ok(a.some(s=>Math.abs(s)>.01));assert.equal(Math.abs(a.at(-1)),0);
  }
});
