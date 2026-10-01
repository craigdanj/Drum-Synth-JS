import test from 'node:test';
import assert from 'node:assert/strict';
import { PRESETS, render } from '../src/drum-forge.js';
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
