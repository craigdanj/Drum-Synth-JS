/** Sound packs built from Drum Forge voices. 808-inspired, not hardware emulation. */
import { PRESETS, resolveParams } from './drum-forge.js';
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
export const KIT_808 = Object.freeze(Object.fromEntries(Object.entries(PRESETS).map(([voice, params]) => [voice, Object.freeze(resolveParams(voice, patches[voice]))])));
// Current sound packs with voice-specific envelope designs.
const refine = (base, changes) => Object.freeze(Object.fromEntries(Object.entries(base).map(([voice, params]) => [voice, Object.freeze(resolveParams(voice, {...params, ...changes[voice]}))])));
export const KIT_ORIGINAL_REFINED = refine(PRESETS, {
  kick: {velocityToBrightness:0.2, velocityToTransient:0.65, pitchSweepSemitones:22, pitchCurve:1.25, noiseHighpass:80, noiseLowpass:2600, noiseResonance:0.05, bodyLevel:.98, bodyDecay:.65, noiseLevel:.025, noiseAttack:.0005, noiseDecay:.04, transientLevel:.22, transientDecay:.01},
  snare: {velocityToBrightness:0.6, velocityToTransient:0.65, pitchSweepSemitones:4, pitchCurve:1.2, noiseHighpass:1050, noiseLowpass:9800, noiseResonance:0.16, bodyLevel:.34, bodyDecay:.13, noiseLevel:.7, noiseAttack:.002, noiseDecay:.32, transientLevel:.25, transientDecay:.011},
  clap: {velocityToBrightness:0.5, velocityToTransient:0.5, burstCount:4, burstSpacing:.01, burstDecay:.017, tailLevel:.42, tailDecay:.26, burstVariation:.28, pitchSweepSemitones:0, pitchCurve:1, noiseHighpass:1100, noiseLowpass:7600, noiseResonance:0.2, bodyLevel:.025, bodyDecay:.075, noiseLevel:.93, noiseAttack:.0015, noiseDecay:.29, transientLevel:.25, transientDecay:.008},
  closedHat: {velocityToBrightness:0.65, velocityToTransient:0.45, metalMix:0.48, metalDetune:28, metalDamping:0.65, metalHighpass:3200, metalLowpass:12500, pitchSweepSemitones:0, pitchCurve:1, noiseHighpass:6200, noiseLowpass:14500, noiseResonance:0.08, bodyLevel:.4, bodyDecay:.045, noiseLevel:.58, noiseAttack:.0005, noiseDecay:.09, transientLevel:.045, transientDecay:.005},
  openHat: {velocityToBrightness:0.55, velocityToTransient:0.35, metalMix:0.52, metalDetune:35, metalDamping:0.42, metalHighpass:2200, metalLowpass:14500, pitchSweepSemitones:0, pitchCurve:1, noiseHighpass:4500, noiseLowpass:13000, noiseResonance:0.1, bodyLevel:.4, bodyDecay:.38, noiseLevel:.58, noiseAttack:.002, noiseDecay:.78, transientLevel:.045, transientDecay:.008},
  tom: {velocityToBrightness:0.25, velocityToTransient:0.55, pitchSweepSemitones:9, pitchCurve:1.15, noiseHighpass:500, noiseLowpass:4500, noiseResonance:0.06, bodyLevel:.96, bodyDecay:.56, noiseLevel:.075, noiseAttack:.0005, noiseDecay:.065, transientLevel:.1, transientDecay:.009},
  rim: {velocityToBrightness:0.25, velocityToTransient:0.65, pitchSweepSemitones:1.2, pitchCurve:1.5, noiseHighpass:1700, noiseLowpass:8200, noiseResonance:0.12, bodyLevel:.9, bodyDecay:.085, noiseLevel:.12, noiseAttack:.0005, noiseDecay:.035, transientLevel:.4, transientDecay:.005},
  cowbell: {velocityToBrightness:0.15, velocityToTransient:0.45, pitchSweepSemitones:0, pitchCurve:1, noiseHighpass:2400, noiseLowpass:10000, noiseResonance:0.04, bodyLevel:.98, bodyDecay:.32, noiseLevel:.025, noiseAttack:.0005, noiseDecay:.04, transientLevel:.09, transientDecay:.007}
});
export const KIT_808_REFINED = refine(KIT_808, {
  kick: {velocityToBrightness:0.2, velocityToTransient:0.65, pitchSweepSemitones:15, pitchCurve:1.35, noiseHighpass:0, noiseLowpass:1800, noiseResonance:0, bodyLevel:1, bodyDecay:1.65, noiseLevel:0, noiseAttack:.0005, noiseDecay:.03, transientLevel:.045, transientDecay:.008},
  snare: {velocityToBrightness:0.6, velocityToTransient:0.65, pitchSweepSemitones:2, pitchCurve:1.25, noiseHighpass:1300, noiseLowpass:8500, noiseResonance:0.18, bodyLevel:.44, bodyDecay:.14, noiseLevel:.6, noiseAttack:.0015, noiseDecay:.37, transientLevel:.16, transientDecay:.009},
  clap: {velocityToBrightness:0.5, velocityToTransient:0.5, burstCount:3, burstSpacing:.012, burstDecay:.009, tailLevel:.6, tailDecay:.34, burstVariation:.06, pitchSweepSemitones:0, pitchCurve:1, noiseHighpass:1200, noiseLowpass:6800, noiseResonance:0.22, bodyLevel:0, bodyDecay:.06, noiseLevel:1, noiseAttack:.001, noiseDecay:.32, transientLevel:.07, transientDecay:.006},
  closedHat: {velocityToBrightness:0.65, velocityToTransient:0.45, metalMix:0.62, metalDetune:9, metalDamping:0.72, metalHighpass:5400, metalLowpass:15500, pitchSweepSemitones:0, pitchCurve:1, noiseHighpass:7200, noiseLowpass:15000, noiseResonance:0.08, bodyLevel:.72, bodyDecay:.04, noiseLevel:.28, noiseAttack:.0005, noiseDecay:.075, transientLevel:.018, transientDecay:.004},
  openHat: {velocityToBrightness:0.55, velocityToTransient:0.35, metalMix:0.6, metalDetune:12, metalDamping:0.45, metalHighpass:4200, metalLowpass:16000, pitchSweepSemitones:0, pitchCurve:1, noiseHighpass:5800, noiseLowpass:13500, noiseResonance:0.12, bodyLevel:.67, bodyDecay:.48, noiseLevel:.33, noiseAttack:.0015, noiseDecay:.9, transientLevel:.018, transientDecay:.006},
  tom: {velocityToBrightness:0.25, velocityToTransient:0.55, pitchSweepSemitones:5, pitchCurve:1.15, noiseHighpass:650, noiseLowpass:4200, noiseResonance:0.05, bodyLevel:.985, bodyDecay:.64, noiseLevel:.025, noiseAttack:.0005, noiseDecay:.045, transientLevel:.045, transientDecay:.007},
  rim: {velocityToBrightness:0.25, velocityToTransient:0.65, pitchSweepSemitones:0, pitchCurve:1, noiseHighpass:2100, noiseLowpass:8500, noiseResonance:0.08, bodyLevel:.96, bodyDecay:.06, noiseLevel:.04, noiseAttack:.0005, noiseDecay:.03, transientLevel:.1, transientDecay:.004},
  cowbell: {velocityToBrightness:0.15, velocityToTransient:0.45, pitchSweepSemitones:0, pitchCurve:1, noiseHighpass:2000, noiseLowpass:9000, noiseResonance:0.04, bodyLevel:1, bodyDecay:.41, noiseLevel:0, noiseAttack:.0005, noiseDecay:.03, transientLevel:.018, transientDecay:.005}
});
export const KITS = Object.freeze({ original: PRESETS, '808': KIT_808, 'original-refined': KIT_ORIGINAL_REFINED, '808-refined': KIT_808_REFINED });
export const REFINEMENT_NOTES = Object.freeze({
  kick:'Longer low body, with a shorter, softer click. The original kit also sheds its noise earlier.',
  snare:'Shorter tonal body with a longer independent rattle and a less dominant initial click.',
  clap:'Independent short noise bursts and a trailing wash, with deterministic timing and strength variation.',
  closedHat:'Shorter metallic ring followed by a small noise tail, with less initial click.',
  openHat:'Metallic tone fades before the longer noise tail; the noise has a slightly softer onset.',
  tom:'Longer tonal body, brief impact noise, and a shorter click.',
  rim:'Slightly longer resonant knock with a much shorter click and noise burst.',
  cowbell:'Longer tonal ring with less initial click; the original kit’s noise fades earlier.'
});
