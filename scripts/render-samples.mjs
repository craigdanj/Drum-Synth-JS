import { mkdir, writeFile } from 'node:fs/promises';
import { PRESETS, render, encodeWav } from '../src/drum-synth.js';
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

const { KIT_ORIGINAL_REFINED, KIT_808_REFINED, KIT_ELECTRO_FM, KIT_MINIMAL, KIT_INDUSTRIAL, KIT_DEEP_DUB, KIT_RETRO_ARCADE, KIT_SOFT_DUSTY } = await import('../src/kits.js');
for (const [pack, presets] of Object.entries({'original-refined': KIT_ORIGINAL_REFINED, '808-refined': KIT_808_REFINED, 'electro-fm': KIT_ELECTRO_FM, minimal: KIT_MINIMAL, industrial: KIT_INDUSTRIAL, 'deep-dub': KIT_DEEP_DUB, 'retro-arcade': KIT_RETRO_ARCADE, 'soft-dusty': KIT_SOFT_DUSTY})) {
  await mkdir(new URL(`../samples/${pack}/`, import.meta.url), {recursive:true});
  for (const [voice, params] of Object.entries(presets)) {
    await writeFile(new URL(`../samples/${pack}/${voice}.wav`, import.meta.url), Buffer.from(encodeWav(render(voice, params))));
  }
}
