/** Sound packs built from Drum Forge voices. 808-inspired, not hardware emulation. */
import { PRESETS } from './drum-forge.js';
const patches = {
  kick: { frequency: 48, decay: 1.4, pitchDrop: 1.65, pitchDecay: .018, tone: .08, noise: 0, snap: .055, drive: .15, volume: .86 },
  snare: { frequency: 172, decay: .29, pitchDrop: .12, pitchDecay: .012, tone: .72, noise: .64, snap: .22, drive: .25, volume: .68 },
  clap: { frequency: 1100, decay: .25, pitchDrop: 0, tone: .55, noise: 1, snap: .12, drive: .25, volume: .66 },
  closedHat: { frequency: 610, decay: .055, pitchDrop: 0, tone: .94, noise: .3, snap: .025, drive: .1, volume: .32 },
  openHat: { frequency: 610, decay: .72, pitchDrop: 0, tone: .88, noise: .36, snap: .025, drive: .1, volume: .34 },
  tom: { frequency: 92, decay: .52, pitchDrop: .3, pitchDecay: .022, tone: .22, noise: .015, snap: .06, drive: .05, volume: .7 },
  rim: { frequency: 820, decay: .045, pitchDrop: 0, tone: .62, noise: .045, snap: .15, drive: .3, volume: .58 },
  cowbell: { frequency: 540, decay: .34, pitchDrop: 0, tone: .95, noise: 0, snap: .025, drive: .6, volume: .48 }
};
export const KIT_808 = Object.freeze(Object.fromEntries(Object.entries(PRESETS).map(([voice, params]) => [voice, Object.freeze({...params, ...patches[voice]})])));
export const KITS = Object.freeze({ original: PRESETS, '808': KIT_808 });
