import { mkdir, writeFile } from 'node:fs/promises';
import { PRESETS, render, encodeWav } from '../src/drum-forge.js';
await mkdir(new URL('../samples/', import.meta.url), { recursive: true });
for (const voice of Object.keys(PRESETS)) {
  await writeFile(new URL(`../samples/${voice}.wav`, import.meta.url), Buffer.from(encodeWav(render(voice))));
  console.log(`Rendered ${voice}.wav`);
}

// Additional sound pack; original examples remain unchanged.
const { KIT_808 } = await import('../src/kits.js');
await mkdir(new URL('../samples/808/', import.meta.url), { recursive: true });
for (const [voice, params] of Object.entries(KIT_808)) {
  await writeFile(new URL(`../samples/808/${voice}.wav`, import.meta.url), Buffer.from(encodeWav(render(voice, params))));
}
