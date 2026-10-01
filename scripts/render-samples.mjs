import { mkdir, writeFile } from 'node:fs/promises';
import { PRESETS, render, encodeWav } from '../src/drum-forge.js';
await mkdir(new URL('../samples/', import.meta.url), { recursive: true });
for (const voice of Object.keys(PRESETS)) {
  await writeFile(new URL(`../samples/${voice}.wav`, import.meta.url), Buffer.from(encodeWav(render(voice))));
  console.log(`Rendered ${voice}.wav`);
}
