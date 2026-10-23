/** Sound packs built from Drum Synth voices. 808-inspired, not hardware emulation. */
import { PRESETS, resolveParams } from './drum-synth.js';
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
  kick: {fmDepth:0.16, fmRatio:1, fmDecay:0.025, resonance1Ratio:2, resonance1Level:0.09, resonance1Decay:0.13, resonance2Ratio:3, resonance2Level:0.025, resonance2Decay:0.045, transientType:'blend', transientTone:0.65, transientFrequency:850, transientMix:0.6, noiseFilterEnvAmount:0.7, noiseFilterEnvDecay:0.035, velocityToBrightness:0.2, velocityToTransient:0.65, pitchSweepSemitones:22, pitchCurve:1.25, noiseHighpass:80, noiseLowpass:1900, noiseResonance:0.05, bodyLevel:.98, bodyDecay:.65, noiseLevel:.025, noiseAttack:.0005, noiseDecay:.04, transientLevel:.22, transientDecay:.01},
  snare: {fmDepth:0.25, fmRatio:1.7, fmDecay:0.04, resonance1Ratio:1.82, resonance1Level:0.18, resonance1Decay:0.09, resonance2Ratio:2.61, resonance2Level:0.09, resonance2Decay:0.045, transientType:'blend', transientTone:0.9, transientFrequency:2200, transientMix:0.15, noiseFilterEnvAmount:1.2, noiseFilterEnvDecay:0.2, velocityToBrightness:0.6, velocityToTransient:0.65, pitchSweepSemitones:4, pitchCurve:1.2, noiseHighpass:1050, noiseLowpass:4600, noiseResonance:0.16, bodyLevel:.34, bodyDecay:.13, noiseLevel:.7, noiseAttack:.002, noiseDecay:.32, transientLevel:.25, transientDecay:.011},
  clap: {transientType:'noise', transientTone:0.8, transientFrequency:1600, transientMix:0.5, noiseFilterEnvAmount:1.15, noiseFilterEnvDecay:0.25, velocityToBrightness:0.5, velocityToTransient:0.5, burstCount:4, burstSpacing:.01, burstDecay:.017, tailLevel:.42, tailDecay:.26, burstVariation:.28, pitchSweepSemitones:0, pitchCurve:1, noiseHighpass:1100, noiseLowpass:4000, noiseResonance:0.2, bodyLevel:.025, bodyDecay:.075, noiseLevel:.93, noiseAttack:.0015, noiseDecay:.29, transientLevel:.25, transientDecay:.008},
  closedHat: {transientType:'noise', transientTone:0.95, transientFrequency:1600, transientMix:0.5, noiseFilterEnvAmount:0.6, noiseFilterEnvDecay:0.055, metalFilterEnvAmount:0.8, metalFilterEnvDecay:0.065, velocityToBrightness:0.65, velocityToTransient:0.45, metalMix:0.48, metalDetune:28, metalDamping:0.65, metalHighpass:3200, metalLowpass:8500, pitchSweepSemitones:0, pitchCurve:1, noiseHighpass:6200, noiseLowpass:9500, noiseResonance:0.08, bodyLevel:.4, bodyDecay:.045, noiseLevel:.58, noiseAttack:.0005, noiseDecay:.09, transientLevel:.045, transientDecay:.005},
  openHat: {transientType:'noise', transientTone:0.9, transientFrequency:1600, transientMix:0.5, noiseFilterEnvAmount:0.75, noiseFilterEnvDecay:0.35, metalFilterEnvAmount:0.95, metalFilterEnvDecay:0.42, velocityToBrightness:0.55, velocityToTransient:0.35, metalMix:0.52, metalDetune:35, metalDamping:0.42, metalHighpass:2200, metalLowpass:7500, pitchSweepSemitones:0, pitchCurve:1, noiseHighpass:4500, noiseLowpass:8200, noiseResonance:0.1, bodyLevel:.4, bodyDecay:.38, noiseLevel:.58, noiseAttack:.002, noiseDecay:.78, transientLevel:.045, transientDecay:.008},
  tom: {fmDepth:0.65, fmRatio:1.4, fmDecay:0.1, resonance1Ratio:1.59, resonance1Level:0.16, resonance1Decay:0.27, resonance2Ratio:2.14, resonance2Level:0.08, resonance2Decay:0.12, resonance3Ratio:2.92, resonance3Level:0.035, resonance3Decay:0.055, transientType:'blend', transientTone:0.5, transientFrequency:420, transientMix:0.75, noiseFilterEnvAmount:0.65, noiseFilterEnvDecay:0.065, velocityToBrightness:0.25, velocityToTransient:0.55, pitchSweepSemitones:9, pitchCurve:1.15, noiseHighpass:500, noiseLowpass:3000, noiseResonance:0.06, bodyLevel:.96, bodyDecay:.56, noiseLevel:.075, noiseAttack:.0005, noiseDecay:.065, transientLevel:.1, transientDecay:.009},
  rim: {fmDepth:0.45, fmRatio:2.3, fmDecay:0.025, resonance1Ratio:1.73, resonance1Level:0.18, resonance1Decay:0.045, resonance2Ratio:3.83, resonance2Level:0.11, resonance2Decay:0.025, transientType:'tonal', transientTone:1, transientFrequency:1700, transientMix:0.5, noiseFilterEnvAmount:0.6, noiseFilterEnvDecay:0.04, velocityToBrightness:0.25, velocityToTransient:0.65, pitchSweepSemitones:1.2, pitchCurve:1.5, noiseHighpass:1700, noiseLowpass:5500, noiseResonance:0.12, bodyLevel:.9, bodyDecay:.085, noiseLevel:.12, noiseAttack:.0005, noiseDecay:.035, transientLevel:.4, transientDecay:.005},
  cowbell: {fmDepth:0.7, fmRatio:1.48, fmDecay:0.14, resonance1Ratio:2.08, resonance1Level:0.14, resonance1Decay:0.19, resonance2Ratio:3.37, resonance2Level:0.08, resonance2Decay:0.08, resonance3Ratio:4.73, resonance3Level:0.035, resonance3Decay:0.04, transientType:'blend', transientTone:0.75, transientFrequency:2400, transientMix:0.6, noiseFilterEnvAmount:0.5, noiseFilterEnvDecay:0.06, velocityToBrightness:0.15, velocityToTransient:0.45, pitchSweepSemitones:0, pitchCurve:1, noiseHighpass:2400, noiseLowpass:7000, noiseResonance:0.04, bodyLevel:.98, bodyDecay:.32, noiseLevel:.025, noiseAttack:.0005, noiseDecay:.04, transientLevel:.09, transientDecay:.007}
});
export const KIT_808_REFINED = refine(KIT_808, {
  kick: {fmDepth:0.06, fmRatio:1, fmDecay:0.015, resonance1Ratio:2, resonance1Level:0.045, resonance1Decay:0.075, transientType:'tonal', transientTone:1, transientFrequency:480, transientMix:0.5, noiseFilterEnvAmount:0, noiseFilterEnvDecay:0.04, velocityToBrightness:0.2, velocityToTransient:0.65, pitchSweepSemitones:15, pitchCurve:1.35, noiseHighpass:0, noiseLowpass:1800, noiseResonance:0, bodyLevel:1, bodyDecay:1.65, noiseLevel:0, noiseAttack:.0005, noiseDecay:.03, transientLevel:.045, transientDecay:.008},
  snare: {fmDepth:0.16, fmRatio:1.5, fmDecay:0.03, resonance1Ratio:1.71, resonance1Level:0.14, resonance1Decay:0.075, resonance2Ratio:2.43, resonance2Level:0.055, resonance2Decay:0.035, transientType:'blend', transientTone:0.82, transientFrequency:1900, transientMix:0.2, noiseFilterEnvAmount:1.15, noiseFilterEnvDecay:0.17, velocityToBrightness:0.6, velocityToTransient:0.65, pitchSweepSemitones:2, pitchCurve:1.25, noiseHighpass:1300, noiseLowpass:4000, noiseResonance:0.18, bodyLevel:.44, bodyDecay:.14, noiseLevel:.6, noiseAttack:.0015, noiseDecay:.37, transientLevel:.16, transientDecay:.009},
  clap: {transientType:'noise', transientTone:0.75, transientFrequency:1600, transientMix:0.5, noiseFilterEnvAmount:1.1, noiseFilterEnvDecay:0.23, velocityToBrightness:0.5, velocityToTransient:0.5, burstCount:3, burstSpacing:.012, burstDecay:.009, tailLevel:.6, tailDecay:.34, burstVariation:.06, pitchSweepSemitones:0, pitchCurve:1, noiseHighpass:1200, noiseLowpass:3600, noiseResonance:0.22, bodyLevel:0, bodyDecay:.06, noiseLevel:1, noiseAttack:.001, noiseDecay:.32, transientLevel:.07, transientDecay:.006},
  closedHat: {transientType:'noise', transientTone:1, transientFrequency:1600, transientMix:0.5, noiseFilterEnvAmount:0.55, noiseFilterEnvDecay:0.045, metalFilterEnvAmount:0.7, metalFilterEnvDecay:0.055, velocityToBrightness:0.65, velocityToTransient:0.45, metalMix:0.62, metalDetune:9, metalDamping:0.72, metalHighpass:5400, metalLowpass:9500, pitchSweepSemitones:0, pitchCurve:1, noiseHighpass:7200, noiseLowpass:10500, noiseResonance:0.08, bodyLevel:.72, bodyDecay:.04, noiseLevel:.28, noiseAttack:.0005, noiseDecay:.075, transientLevel:.018, transientDecay:.004},
  openHat: {transientType:'noise', transientTone:0.94, transientFrequency:1600, transientMix:0.5, noiseFilterEnvAmount:0.65, noiseFilterEnvDecay:0.32, metalFilterEnvAmount:0.85, metalFilterEnvDecay:0.38, velocityToBrightness:0.55, velocityToTransient:0.35, metalMix:0.6, metalDetune:12, metalDamping:0.45, metalHighpass:4200, metalLowpass:8800, pitchSweepSemitones:0, pitchCurve:1, noiseHighpass:5800, noiseLowpass:9000, noiseResonance:0.12, bodyLevel:.67, bodyDecay:.48, noiseLevel:.33, noiseAttack:.0015, noiseDecay:.9, transientLevel:.018, transientDecay:.006},
  tom: {fmDepth:0.45, fmRatio:1.5, fmDecay:0.08, resonance1Ratio:1.48, resonance1Level:0.12, resonance1Decay:0.22, resonance2Ratio:2.05, resonance2Level:0.055, resonance2Decay:0.095, transientType:'tonal', transientTone:1, transientFrequency:330, transientMix:0.5, noiseFilterEnvAmount:0.6, noiseFilterEnvDecay:0.05, velocityToBrightness:0.25, velocityToTransient:0.55, pitchSweepSemitones:5, pitchCurve:1.15, noiseHighpass:650, noiseLowpass:2800, noiseResonance:0.05, bodyLevel:.985, bodyDecay:.64, noiseLevel:.025, noiseAttack:.0005, noiseDecay:.045, transientLevel:.045, transientDecay:.007},
  rim: {fmDepth:0.3, fmRatio:2.1, fmDecay:0.02, resonance1Ratio:2.13, resonance1Level:0.13, resonance1Decay:0.035, resonance2Ratio:3.71, resonance2Level:0.075, resonance2Decay:0.02, transientType:'blend', transientTone:0.7, transientFrequency:2100, transientMix:0.8, noiseFilterEnvAmount:0.55, noiseFilterEnvDecay:0.035, velocityToBrightness:0.25, velocityToTransient:0.65, pitchSweepSemitones:0, pitchCurve:1, noiseHighpass:2100, noiseLowpass:5800, noiseResonance:0.08, bodyLevel:.96, bodyDecay:.06, noiseLevel:.04, noiseAttack:.0005, noiseDecay:.03, transientLevel:.1, transientDecay:.004},
  cowbell: {fmDepth:0.4, fmRatio:1.5, fmDecay:0.1, resonance1Ratio:2.96, resonance1Level:0.12, resonance1Decay:0.17, resonance2Ratio:4.18, resonance2Level:0.06, resonance2Decay:0.065, transientType:'tonal', transientTone:1, transientFrequency:2600, transientMix:0.5, noiseFilterEnvAmount:0, noiseFilterEnvDecay:0.08, velocityToBrightness:0.15, velocityToTransient:0.45, pitchSweepSemitones:0, pitchCurve:1, noiseHighpass:2000, noiseLowpass:9000, noiseResonance:0.04, bodyLevel:1, bodyDecay:.41, noiseLevel:0, noiseAttack:.0005, noiseDecay:.03, transientLevel:.018, transientDecay:.005}
});
// Additional sound packs use independent layer settings, with all eight voice slots.
export const KIT_ELECTRO_FM = refine(PRESETS, {
  kick: {bodyWaveform:'triangle', bodyWaveformMix:0.3, velocityToBrightness:0.45, velocityToTransient:0.55, frequency:55, bodyLevel:.95, bodyDecay:.48, noiseLevel:.015, noiseDecay:.03, pitchSweepSemitones:27, pitchDecay:.025, pitchCurve:1.4, fmDepth:.85, fmRatio:1.5, fmDecay:.07, transientType:'blend', transientFrequency:1250, transientTone:.8, transientMix:.6, transientLevel:.2, transientDecay:.006, drive:.35, volume:.77, resonance1Ratio:2, resonance1Level:.08, resonance1Decay:.08},
  snare: {bodyWaveform:'square', bodyPulseWidth:0.42, bodyWaveformMix:0.35, velocityToBrightness:0.45, velocityToTransient:0.55, frequency:205, bodyLevel:0.53, bodyDecay:.19, noiseLevel:.48, noiseAttack:.001, noiseDecay:.23, noiseHighpass:1400, noiseLowpass:4300, noiseResonance:.25, noiseFilterEnvAmount:1.3, noiseFilterEnvDecay:.17, pitchSweepSemitones:7, pitchDecay:.035, fmDepth:1.1, fmRatio:2.4, fmDecay:.12, transientType:'blend', transientFrequency:2600, transientMix:.35, transientLevel:.22, transientDecay:.008, drive:.35, volume:.64, resonance1Ratio:2.71, resonance1Level:.14, resonance1Decay:.11},
  clap: {velocityToBrightness:0.45, velocityToTransient:0.55, bodyLevel:0, noiseLevel:.9, noiseAttack:.0005, burstCount:3, burstSpacing:.009, burstDecay:.012, tailLevel:.4, tailDecay:.2, burstVariation:.03, noiseHighpass:1800, noiseLowpass:4900, noiseResonance:.28, noiseFilterEnvAmount:1.1, noiseFilterEnvDecay:.12, transientLevel:.1, transientTone:.9, transientDecay:.005, drive:.45, volume:.61},
  closedHat: {velocityToBrightness:0.45, velocityToTransient:0.55, frequency:720, bodyLevel:.65, bodyDecay:.055, noiseLevel:.42, noiseAttack:.0005, noiseDecay:.06, metalMix:.58, metalDetune:22, metalDamping:.72, metalHighpass:4200, metalLowpass:9500, metalFilterEnvAmount:.7, metalFilterEnvDecay:.04, noiseHighpass:5000, noiseLowpass:11000, noiseFilterEnvAmount:.5, noiseFilterEnvDecay:.04, transientLevel:.025, transientDecay:.004, drive:.25, volume:.42},
  openHat: {velocityToBrightness:0.45, velocityToTransient:0.55, frequency:720, bodyLevel:.62, bodyDecay:.38, noiseLevel:.33, noiseAttack:.001, noiseDecay:.6, metalMix:.64, metalDetune:26, metalDamping:.32, metalHighpass:4200, metalLowpass:8500, metalFilterEnvAmount:1, metalFilterEnvDecay:.3, noiseHighpass:5200, noiseLowpass:9200, noiseFilterEnvAmount:.8, noiseFilterEnvDecay:.35, transientLevel:.025, transientDecay:.005, drive:.25, volume:.36},
  tom: {bodyWaveform:'saw', bodyWaveformMix:0.28, velocityToBrightness:0.45, velocityToTransient:0.55, frequency:145, bodyLevel:0.87, bodyDecay:.62, noiseLevel:.025, noiseDecay:.035, pitchSweepSemitones:19, pitchDecay:.08, pitchCurve:.8, fmDepth:1.4, fmRatio:1.4, fmDecay:.24, transientType:'tonal', transientFrequency:650, transientLevel:.14, transientDecay:.012, resonance1Ratio:2.41, resonance1Level:.16, resonance1Decay:.32, resonance2Ratio:3.17, resonance2Level:.06, resonance2Decay:.16, drive:0.18, volume:.63},
  rim: {bodyWaveform:'square', bodyPulseWidth:0.32, bodyWaveformMix:0.5, velocityToBrightness:0.45, velocityToTransient:0.55, frequency:870, bodyLevel:0.82, bodyDecay:.13, noiseLevel:.05, noiseDecay:.03, pitchSweepSemitones:3, pitchDecay:.01, fmDepth:0.9, fmRatio:3.1, fmDecay:.055, transientType:'tonal', transientFrequency:2900, transientLevel:.23, transientDecay:.005, resonance1Ratio:1.73, resonance1Level:.17, resonance1Decay:.09, drive:.3, volume:.5},
  cowbell: {bodyWaveform:'square', bodyPulseWidth:0.5, bodyWaveformMix:0.48, tone:0.45, velocityToBrightness:0.45, velocityToTransient:0.55, frequency:410, bodyLevel:0.86, bodyDecay:.66, noiseLevel:0, pitchSweepSemitones:0, fmDepth:1.65, fmRatio:1.41, fmDecay:.42, transientType:'tonal', transientFrequency:2150, transientLevel:.09, transientDecay:.007, resonance1Ratio:2.76, resonance1Level:.22, resonance1Decay:.48, resonance2Ratio:4.12, resonance2Level:.09, resonance2Decay:.18, drive:0.1, volume:.51}
});
export const KIT_MINIMAL = refine(PRESETS, {
  kick: {velocityToBrightness:0.3, velocityToTransient:0.4, frequency:61, bodyLevel:.96, bodyDecay:.22, noiseLevel:0, pitchSweepSemitones:9, pitchDecay:.012, pitchCurve:1.5, fmDepth:0, tone:.05, transientType:'tonal', transientFrequency:380, transientLevel:.045, transientDecay:.004, drive:0, volume:.78},
  snare: {velocityToBrightness:0.3, velocityToTransient:0.4, frequency:235, bodyLevel:.38, bodyDecay:.055, noiseLevel:.48, noiseAttack:.0005, noiseDecay:.085, noiseHighpass:1300, noiseLowpass:3500, noiseFilterEnvAmount:.6, noiseFilterEnvDecay:.035, pitchSweepSemitones:1, pitchDecay:.01, fmDepth:.08, fmRatio:2, fmDecay:.012, transientType:'blend', transientTone:.55, transientFrequency:1500, transientMix:.35, transientLevel:.12, transientDecay:.004, drive:0, volume:.65},
  clap: {velocityToBrightness:0.3, velocityToTransient:0.4, bodyLevel:0, noiseLevel:.82, noiseAttack:.0005, burstCount:2, burstSpacing:.005, burstDecay:.006, tailLevel:.13, tailDecay:.065, burstVariation:0, noiseHighpass:1700, noiseLowpass:4300, noiseResonance:.08, noiseFilterEnvAmount:.4, noiseFilterEnvDecay:.025, transientLevel:.035, transientTone:.65, transientDecay:.003, drive:0, volume:.62},
  closedHat: {velocityToBrightness:0.3, velocityToTransient:0.4, frequency:480, bodyLevel:.24, bodyDecay:.03, noiseLevel:.6, noiseAttack:.0005, noiseDecay:.035, metalMix:.4, metalDetune:7, metalDamping:.95, metalHighpass:6200, metalLowpass:10000, noiseHighpass:6500, noiseLowpass:11000, transientLevel:.01, transientDecay:.002, drive:0, volume:.36},
  openHat: {velocityToBrightness:0.3, velocityToTransient:0.4, frequency:480, bodyLevel:.25, bodyDecay:.12, noiseLevel:.6, noiseAttack:.001, noiseDecay:.22, metalMix:.42, metalDetune:9, metalDamping:.8, metalHighpass:5600, metalLowpass:8500, metalFilterEnvAmount:.4, metalFilterEnvDecay:.09, noiseHighpass:5600, noiseLowpass:9000, noiseFilterEnvAmount:.35, noiseFilterEnvDecay:.12, transientLevel:.01, transientDecay:.003, drive:0, volume:.36},
  tom: {velocityToBrightness:0.3, velocityToTransient:0.4, frequency:175, bodyLevel:.9, bodyDecay:.17, noiseLevel:0, pitchSweepSemitones:3, pitchDecay:.015, fmDepth:0, transientType:'tonal', transientFrequency:410, transientLevel:.065, transientDecay:.006, resonance1Ratio:1.59, resonance1Level:.07, resonance1Decay:.08, drive:0, volume:.67},
  rim: {velocityToBrightness:0.3, velocityToTransient:0.4, frequency:1100, bodyLevel:.56, bodyDecay:.035, noiseLevel:0, pitchSweepSemitones:0, fmDepth:0, transientType:'tonal', transientFrequency:2050, transientLevel:.18, transientDecay:.003, drive:0, volume:.61},
  cowbell: {velocityToBrightness:0.3, velocityToTransient:0.4, frequency:690, bodyLevel:.8, bodyDecay:.12, noiseLevel:0, pitchSweepSemitones:0, tone:.15, fmDepth:.1, fmRatio:2, fmDecay:.02, transientType:'tonal', transientFrequency:1800, transientLevel:.045, transientDecay:.004, resonance1Ratio:2, resonance1Level:.045, resonance1Decay:.06, drive:0, volume:.55}
});
export const KIT_INDUSTRIAL = refine(PRESETS, {
  kick: {bodyWaveform:'saw', bodyWaveformMix:0.32, velocityToBrightness:0.25, velocityToTransient:0.35, frequency:43, bodyLevel:.94, bodyDecay:.85, noiseLevel:.12, noiseAttack:.0005, noiseDecay:.065, noiseHighpass:100, noiseLowpass:1800, noiseFilterEnvAmount:1.6, noiseFilterEnvDecay:.05, pitchSweepSemitones:31, pitchDecay:.04, pitchCurve:1.2, fmDepth:1.3, fmRatio:1.7, fmDecay:.11, transientType:'blend', transientTone:.95, transientFrequency:1400, transientMix:.35, transientLevel:.32, transientDecay:.01, drive:2.7, volume:.62, resonance1Ratio:2.13, resonance1Level:.13, resonance1Decay:.2},
  snare: {bodyWaveform:'saw', bodyWaveformMix:0.5, velocityToBrightness:0.25, velocityToTransient:0.35, frequency:155, bodyLevel:0.56, bodyDecay:.24, noiseLevel:.83, noiseAttack:.0005, noiseDecay:.5, noiseHighpass:650, noiseLowpass:3800, noiseResonance:.4, noiseFilterEnvAmount:1.6, noiseFilterEnvDecay:.35, pitchSweepSemitones:5, pitchDecay:.03, fmDepth:1.8, fmRatio:2.71, fmDecay:.2, transientType:'blend', transientTone:1, transientFrequency:2400, transientMix:.25, transientLevel:.3, transientDecay:.012, drive:2, volume:.51, resonance1Ratio:1.83, resonance1Level:.25, resonance1Decay:.18},
  clap: {velocityToBrightness:0.25, velocityToTransient:0.35, bodyLevel:.04, bodyDecay:.08, noiseLevel:1, noiseAttack:.001, burstCount:5, burstSpacing:.017, burstDecay:.022, tailLevel:.67, tailDecay:.48, burstVariation:.45, noiseHighpass:800, noiseLowpass:3200, noiseResonance:.38, noiseFilterEnvAmount:1.9, noiseFilterEnvDecay:.3, transientLevel:.19, transientTone:.9, transientDecay:.009, drive:2, volume:.47},
  closedHat: {velocityToBrightness:0.25, velocityToTransient:0.35, frequency:580, bodyLevel:.75, bodyDecay:.085, noiseLevel:.43, noiseAttack:.0005, noiseDecay:.11, metalMix:.66, metalDetune:85, metalDamping:.55, metalHighpass:2600, metalLowpass:8500, metalFilterEnvAmount:1.1, metalFilterEnvDecay:.07, noiseHighpass:3600, noiseLowpass:7600, noiseResonance:.2, noiseFilterEnvAmount:.9, noiseFilterEnvDecay:.08, transientLevel:.07, transientDecay:.004, drive:1.8, volume:.29},
  openHat: {velocityToBrightness:0.25, velocityToTransient:0.35, frequency:580, bodyLevel:.8, bodyDecay:.72, noiseLevel:.45, noiseAttack:.002, noiseDecay:1.05, metalMix:.68, metalDetune:95, metalDamping:.18, metalHighpass:2200, metalLowpass:6500, metalFilterEnvAmount:1.3, metalFilterEnvDecay:.6, noiseHighpass:2700, noiseLowpass:6700, noiseResonance:.2, noiseFilterEnvAmount:1, noiseFilterEnvDecay:.65, transientLevel:.06, transientDecay:.007, drive:1.6, volume:.3},
  tom: {bodyWaveform:'saw', bodyWaveformMix:0.4, velocityToBrightness:0.25, velocityToTransient:0.35, frequency:105, bodyLevel:.94, bodyDecay:.82, noiseLevel:.12, noiseDecay:.15, noiseHighpass:700, noiseLowpass:3400, pitchSweepSemitones:15, pitchDecay:.095, pitchCurve:.75, fmDepth:2.1, fmRatio:1.73, fmDecay:.4, transientType:'blend', transientTone:.8, transientFrequency:570, transientMix:.6, transientLevel:.22, transientDecay:.012, resonance1Ratio:1.87, resonance1Level:.23, resonance1Decay:.6, resonance2Ratio:3.43, resonance2Level:.13, resonance2Decay:.32, drive:1.9, volume:.51},
  rim: {bodyWaveform:'square', bodyPulseWidth:0.28, bodyWaveformMix:0.6, velocityToBrightness:0.25, velocityToTransient:0.35, frequency:530, bodyLevel:.95, bodyDecay:.25, noiseLevel:.16, noiseDecay:.075, noiseHighpass:1800, noiseLowpass:6000, pitchSweepSemitones:0, fmDepth:2.1, fmRatio:3.17, fmDecay:.14, transientType:'blend', transientTone:1, transientFrequency:3100, transientMix:.7, transientLevel:.27, transientDecay:.007, resonance1Ratio:2.41, resonance1Level:.26, resonance1Decay:.21, resonance2Ratio:4.37, resonance2Level:.11, resonance2Decay:.1, drive:1.8, volume:.44},
  cowbell: {bodyWaveform:'square', bodyPulseWidth:0.4, bodyWaveformMix:0.7, tone:0.4, velocityToBrightness:0.25, velocityToTransient:0.35, frequency:325, bodyLevel:.95, bodyDecay:1.1, noiseLevel:.06, noiseDecay:.2, pitchSweepSemitones:0, fmDepth:2.4, fmRatio:2.37, fmDecay:.7, transientType:'blend', transientTone:.9, transientFrequency:1950, transientMix:.65, transientLevel:.15, transientDecay:.009, resonance1Ratio:1.91, resonance1Level:.28, resonance1Decay:.9, resonance2Ratio:3.79, resonance2Level:.17, resonance2Decay:.5, resonance3Ratio:5.13, resonance3Level:.08, resonance3Decay:.22, drive:1.3, volume:.43}
});

// Shared settings establish each palette; every slot then receives its own voice design.
const palette = (shared, voices) => refine(PRESETS, Object.fromEntries(
  Object.keys(PRESETS).map(voice => [voice, {...shared, ...voices[voice]}])
));
export const KIT_DEEP_DUB = palette({
  drive:.08, pitchSweepSemitones:0, fmDepth:0, tone:.2,
  transientType:'tonal', transientLevel:.035, transientDecay:.008,
  velocityToBrightness:.55, velocityToTransient:.6
}, {
  kick: {frequency:42, bodyLevel:1, bodyDecay:1.35, noiseLevel:0, pitchSweepSemitones:10, pitchDecay:.035, pitchCurve:1.4, transientFrequency:220, transientLevel:.025, fmDepth:.04, fmRatio:1, fmDecay:.025, volume:.84},
  snare: {frequency:165, bodyLevel:.5, bodyDecay:.2, noiseLevel:.54, noiseAttack:.004, noiseDecay:.34, noiseHighpass:550, noiseLowpass:2200, noiseResonance:.1, noiseFilterEnvAmount:.55, noiseFilterEnvDecay:.15, transientType:'blend', transientTone:.25, transientFrequency:850, transientMix:.6, transientLevel:.065, resonance1Ratio:1.72, resonance1Level:.1, resonance1Decay:.12, volume:.68},
  clap: {bodyLevel:0, noiseLevel:.88, noiseAttack:.003, burstCount:3, burstSpacing:.015, burstDecay:.018, tailLevel:.5, tailDecay:.4, burstVariation:.18, noiseHighpass:600, noiseLowpass:2400, noiseResonance:.14, noiseFilterEnvAmount:.55, noiseFilterEnvDecay:.25, transientType:'noise', transientTone:.3, transientLevel:.025, volume:.66},
  closedHat: {frequency:360, bodyLevel:.38, bodyDecay:.06, noiseLevel:.55, noiseAttack:.0015, noiseDecay:.1, metalMix:.4, metalDetune:14, metalDamping:.9, metalHighpass:2400, metalLowpass:5200, noiseHighpass:2500, noiseLowpass:5600, noiseFilterEnvAmount:.3, noiseFilterEnvDecay:.045, transientType:'noise', transientTone:.35, transientLevel:.01, transientDecay:.003, volume:.46},
  openHat: {frequency:360, bodyLevel:.4, bodyDecay:.48, noiseLevel:.54, noiseAttack:.004, noiseDecay:.85, metalMix:.43, metalDetune:18, metalDamping:.62, metalHighpass:1900, metalLowpass:4500, metalFilterEnvAmount:.45, metalFilterEnvDecay:.4, noiseHighpass:2000, noiseLowpass:4800, noiseFilterEnvAmount:.4, noiseFilterEnvDecay:.5, transientType:'noise', transientTone:.35, transientLevel:.012, transientDecay:.005, volume:.42},
  tom: {bodyWaveform:'triangle', bodyWaveformMix:0.25, frequency:82, bodyLevel:.96, bodyDecay:.95, noiseLevel:.025, noiseAttack:.002, noiseDecay:.065, noiseHighpass:350, noiseLowpass:1600, pitchSweepSemitones:4, pitchDecay:.07, transientFrequency:240, transientLevel:.05, resonance1Ratio:1.53, resonance1Level:.13, resonance1Decay:.55, resonance2Ratio:2.09, resonance2Level:.04, resonance2Decay:.18, fmDepth:.1, fmRatio:1.5, fmDecay:.06, volume:.71},
  rim: {frequency:440, bodyLevel:.85, bodyDecay:.15, noiseLevel:.025, noiseDecay:.04, noiseHighpass:600, noiseLowpass:2400, transientFrequency:780, transientLevel:.12, transientDecay:.006, resonance1Ratio:1.61, resonance1Level:.14, resonance1Decay:.22, volume:.57},
  cowbell: {bodyWaveform:'triangle', bodyWaveformMix:0.3, frequency:280, bodyLevel:.94, bodyDecay:.95, noiseLevel:0, transientFrequency:620, transientLevel:.04, fmDepth:.16, fmRatio:1.5, fmDecay:.14, resonance1Ratio:2, resonance1Level:.12, resonance1Decay:.7, resonance2Ratio:2.83, resonance2Level:.04, resonance2Decay:.25, volume:.57}
});
export const KIT_RETRO_ARCADE = palette({
  drive:.3, noiseAttack:.0005, attack:.0005, transientType:'tonal', transientLevel:.1,
  transientDecay:.004, velocityToBrightness:.3, velocityToTransient:.35
}, {
  kick: {bodyWaveform:'triangle', bodyWaveformMix:0.85, frequency:67, bodyLevel:.94, bodyDecay:.27, noiseLevel:0, tone:0.25, pitchSweepSemitones:36, pitchDecay:.025, pitchCurve:.8, fmDepth:0.3, fmRatio:2, fmDecay:.04, transientFrequency:1900, transientLevel:.08, volume:.74},
  snare: {bodyWaveform:'square', bodyPulseWidth:0.25, bodyWaveformMix:0.6, frequency:320, bodyLevel:.55, bodyDecay:.095, noiseLevel:.6, noiseDecay:.125, noiseHighpass:1800, noiseLowpass:7600, noiseResonance:.3, noiseFilterEnvAmount:1.1, noiseFilterEnvDecay:.075, pitchSweepSemitones:16, pitchDecay:.025, fmDepth:0.8, fmRatio:3, fmDecay:.065, transientType:'blend', transientTone:1, transientFrequency:3500, transientMix:.45, transientLevel:.18, volume:.59},
  clap: {bodyLevel:0, noiseLevel:.9, burstCount:4, burstSpacing:.006, burstDecay:.006, tailLevel:.23, tailDecay:.11, burstVariation:0, noiseHighpass:2300, noiseLowpass:6400, noiseResonance:.3, noiseFilterEnvAmount:-1.4, noiseFilterEnvDecay:.07, transientType:'noise', transientTone:1, transientLevel:.12, volume:.64},
  closedHat: {frequency:1050, bodyLevel:.65, bodyDecay:.035, noiseLevel:.38, noiseDecay:.04, pitchSweepSemitones:0, metalMix:.62, metalDetune:0, metalDamping:.82, metalHighpass:5000, metalLowpass:13000, noiseHighpass:6500, noiseLowpass:15000, transientType:'noise', transientTone:1, transientLevel:.035, transientDecay:.002, volume:.43},
  openHat: {frequency:1050, bodyLevel:.64, bodyDecay:.22, noiseLevel:.36, noiseDecay:.34, pitchSweepSemitones:0, metalMix:.64, metalDetune:3, metalDamping:.45, metalHighpass:3800, metalLowpass:9500, metalFilterEnvAmount:1.3, metalFilterEnvDecay:.16, noiseHighpass:4600, noiseLowpass:11500, noiseFilterEnvAmount:.6, noiseFilterEnvDecay:.2, transientType:'noise', transientTone:1, transientLevel:.03, volume:.39},
  tom: {bodyWaveform:'square', bodyPulseWidth:0.5, bodyWaveformMix:1, drive:0.1, frequency:235, bodyLevel:0.8, bodyDecay:.42, noiseLevel:0, pitchSweepSemitones:-19, pitchDecay:.065, pitchCurve:.8, fmDepth:0.28, fmRatio:2, fmDecay:.12, transientFrequency:1150, transientLevel:.075, resonance1Ratio:2, resonance1Level:.1, resonance1Decay:.14, volume:.63},
  rim: {bodyWaveform:'square', bodyPulseWidth:0.15, bodyWaveformMix:0.9, drive:0.08, frequency:1500, bodyLevel:.9, bodyDecay:.055, noiseLevel:0, pitchSweepSemitones:12, pitchDecay:.008, pitchCurve:1.7, fmDepth:0.1, fmRatio:2.5, fmDecay:.018, transientFrequency:3900, transientLevel:.17, volume:.68},
  cowbell: {bodyWaveform:'square', bodyPulseWidth:0.25, bodyWaveformMix:0.9, drive:0.1, frequency:780, bodyLevel:.9, bodyDecay:.39, noiseLevel:0, tone:0.3, pitchSweepSemitones:7, pitchDecay:.055, fmDepth:0.4, fmRatio:2, fmDecay:.22, transientFrequency:3100, transientLevel:.065, resonance1Ratio:2, resonance1Level:.15, resonance1Decay:.28, resonance2Ratio:3, resonance2Level:.055, resonance2Decay:.12, volume:.51}
});
export const KIT_SOFT_DUSTY = palette({
  drive:.18, attack:.003, pitchSweepSemitones:0, tone:.12, fmDepth:0,
  transientType:'noise', transientTone:.22, transientLevel:.035, transientDecay:.006,
  velocityToBrightness:.65, velocityToTransient:.75
}, {
  kick: {bodyWaveform:'triangle', bodyWaveformMix:0.35, frequency:57, attack:.004, bodyLevel:.95, bodyDecay:.38, noiseLevel:.012, noiseAttack:.002, noiseDecay:.06, noiseHighpass:0, noiseLowpass:750, pitchSweepSemitones:7, pitchDecay:.022, pitchCurve:1.4, transientType:'blend', transientFrequency:270, transientMix:.8, transientLevel:.028, volume:.82},
  snare: {frequency:180, bodyLevel:.42, bodyDecay:.1, noiseLevel:.64, noiseAttack:.006, noiseDecay:.19, noiseHighpass:550, noiseLowpass:1900, noiseResonance:.08, noiseFilterEnvAmount:.35, noiseFilterEnvDecay:.075, transientType:'blend', transientFrequency:950, transientMix:.25, transientLevel:.055, resonance1Ratio:1.62, resonance1Level:.07, resonance1Decay:.07, volume:.74},
  clap: {bodyLevel:0, noiseLevel:.85, noiseAttack:.004, burstCount:3, burstSpacing:.012, burstDecay:.014, tailLevel:.32, tailDecay:.18, burstVariation:.35, noiseHighpass:750, noiseLowpass:2300, noiseResonance:.07, transientLevel:.018, volume:.73},
  closedHat: {frequency:430, bodyLevel:.24, bodyDecay:.04, noiseLevel:.65, noiseAttack:.002, noiseDecay:.065, metalMix:.32, metalDetune:35, metalDamping:.95, metalHighpass:2600, metalLowpass:4400, noiseHighpass:2900, noiseLowpass:5200, transientLevel:.007, transientDecay:.003, drive:.08, volume:.55},
  openHat: {frequency:430, bodyLevel:.25, bodyDecay:.19, noiseLevel:.64, noiseAttack:.005, noiseDecay:.34, metalMix:.34, metalDetune:42, metalDamping:.82, metalHighpass:2200, metalLowpass:3800, metalFilterEnvAmount:.3, metalFilterEnvDecay:.12, noiseHighpass:2400, noiseLowpass:4500, noiseFilterEnvAmount:.25, noiseFilterEnvDecay:.17, transientLevel:.009, drive:.08, volume:.51},
  tom: {bodyWaveform:'triangle', bodyWaveformMix:0.5, frequency:135, bodyLevel:.91, bodyDecay:.29, noiseLevel:.035, noiseAttack:.003, noiseDecay:.055, noiseHighpass:450, noiseLowpass:1400, pitchSweepSemitones:3, pitchDecay:.035, transientType:'tonal', transientFrequency:340, transientLevel:.035, resonance1Ratio:1.55, resonance1Level:.07, resonance1Decay:.12, volume:.72},
  rim: {frequency:660, bodyLevel:.77, bodyDecay:.055, noiseLevel:.025, noiseAttack:.002, noiseDecay:.035, noiseHighpass:850, noiseLowpass:2500, transientType:'blend', transientFrequency:1200, transientMix:.8, transientLevel:.075, transientDecay:.005, volume:.67},
  cowbell: {frequency:465, bodyLevel:.85, bodyDecay:.21, noiseLevel:.01, noiseAttack:.003, noiseDecay:.04, noiseHighpass:1400, noiseLowpass:3100, transientType:'tonal', transientFrequency:950, transientLevel:.028, resonance1Ratio:2.04, resonance1Level:.05, resonance1Decay:.1, volume:.61}
});

// Synthesized interpretations; each named instrument also exposes its compatible slot.
const indianBase = {
  bodyModel:'modal', bodyLevel:.75, bodyDecay:.7, attack:.001,
  strikePosition:.55, damping:.02, pitchSweepSemitones:0, pitchDecay:.012,
  pitchBendSemitones:0, pitchBendTime:.12, pitchBendRelease:.28,
  noiseLevel:.018, noiseAttack:.0005, noiseDecay:.035,
  noiseHighpass:650, noiseLowpass:4200, noiseResonance:0,
  transientType:'blend', transientMix:.7, transientFrequency:1500,
  transientTone:.55, transientLevel:.12, transientDecay:.005,
  velocityToBrightness:.35, velocityToTransient:.65,
  tone:0, drive:0, volume:.72, fmDepth:0, delaySend:0, reverbSend:0
};
const indianSounds = [
  ['bayanBass','Bayan bass','kick', {
    frequency:92, bodyDecay:1.05, strikePosition:.2, damping:.035,
    pitchSweepSemitones:1.3, transientFrequency:380, transientLevel:.08,
    resonance1Ratio:2, resonance1Level:.24, resonance1Decay:.55,
    resonance2Ratio:3, resonance2Level:.12, resonance2Decay:.32,
    resonance3Ratio:4.05, resonance3Level:.045, resonance3Decay:.13, volume:0.7
  }],
  ['tablaOpen','Tabla open','snare', {
    frequency:262, bodyDecay:1.1, strikePosition:.7, damping:.015,
    bodyLevel:.63, transientFrequency:1950, transientLevel:.16,
    resonance1Ratio:2, resonance1Level:.62, resonance1Decay:.9,
    resonance2Ratio:3, resonance2Level:.38, resonance2Decay:.58,
    resonance3Ratio:4.02, resonance3Level:.2, resonance3Decay:.32,
    resonance4Ratio:5.05, resonance4Level:.11, resonance4Decay:.16,
    resonance5Ratio:6.12, resonance5Level:.055, resonance5Decay:.08, volume:0.62
  }],
  ['tablaMuted','Tabla muted','clap', {
    frequency:262, bodyDecay:1.1, strikePosition:.85, damping:.85,
    bodyLevel:.56, noiseLevel:.11, noiseDecay:.04,
    transientFrequency:2200, transientMix:.4, transientLevel:.24, transientDecay:.004,
    resonance1Ratio:2, resonance1Level:.62, resonance1Decay:.9,
    resonance2Ratio:3, resonance2Level:.38, resonance2Decay:.58,
    resonance3Ratio:4.02, resonance3Level:.2, resonance3Decay:.32,
    resonance4Ratio:5.05, resonance4Level:.11, resonance4Decay:.16,
    resonance5Ratio:6.12, resonance5Level:.055, resonance5Decay:.08, volume:0.65
  }],
  ['dholakTreble','Dholak treble','closedHat', {
    frequency:310, bodyDecay:.5, strikePosition:.7, damping:.12,
    pitchSweepSemitones:1.8, bodyLevel:.72, noiseLevel:.085, noiseDecay:.055,
    transientFrequency:1750, transientLevel:.15, transientMix:.5,
    resonance1Ratio:1.59, resonance1Level:.4, resonance1Decay:.3,
    resonance2Ratio:2.14, resonance2Level:.22, resonance2Decay:.2,
    resonance3Ratio:2.65, resonance3Level:.1, resonance3Decay:.09,
    resonance4Ratio:3.6, resonance4Level:.05, resonance4Decay:.05, volume:0.62
  }],
  ['manjira','Manjira','openHat', {
    frequency:1450, bodyDecay:1.65, strikePosition:.8, damping:.01,
    bodyLevel:.42, noiseLevel:.035, noiseDecay:.065, noiseHighpass:3500, noiseLowpass:11000,
    transientFrequency:5200, transientMix:.3, transientTone:.9, transientLevel:.11,
    resonance1Ratio:1.47, resonance1Level:.65, resonance1Decay:1.35,
    resonance2Ratio:2.09, resonance2Level:.38, resonance2Decay:1.05,
    resonance3Ratio:2.56, resonance3Level:.3, resonance3Decay:.7,
    resonance4Ratio:3.71, resonance4Level:.18, resonance4Decay:.4,
    resonance5Ratio:5.18, resonance5Level:.1, resonance5Decay:.21, volume:0.47
  }],
  ['bayanBend','Bayan bend','tom', {
    frequency:92, bodyDecay:1.55, strikePosition:.25, damping:.02,
    pitchBendSemitones:7, pitchBendTime:.14, pitchBendRelease:.34,
    transientFrequency:380, transientLevel:.08,
    resonance1Ratio:2, resonance1Level:.26, resonance1Decay:.75,
    resonance2Ratio:3, resonance2Level:.13, resonance2Decay:.45,
    resonance3Ratio:4.05, resonance3Level:.045, resonance3Decay:.16, volume:0.7
  }],
  ['dholakBass','Dholak bass','rim', {
    frequency:135, bodyDecay:.7, strikePosition:.3, damping:.06,
    pitchSweepSemitones:3.5, pitchDecay:.023, noiseLevel:.045,
    transientFrequency:620, transientLevel:.14, transientMix:.6,
    resonance1Ratio:1.59, resonance1Level:.35, resonance1Decay:.48,
    resonance2Ratio:2.14, resonance2Level:.2, resonance2Decay:.25,
    resonance3Ratio:2.92, resonance3Level:.09, resonance3Decay:.11, volume:0.68
  }],
  ['ghatam','Ghatam','cowbell', {
    frequency:420, bodyDecay:.22, strikePosition:.6, damping:.025,
    bodyLevel:.7, noiseLevel:.025, transientFrequency:2600, transientLevel:.21, transientMix:.85,
    resonance1Ratio:1.46, resonance1Level:.48, resonance1Decay:.14,
    resonance2Ratio:2.32, resonance2Level:.33, resonance2Decay:.09,
    resonance3Ratio:3.17, resonance3Level:.18, resonance3Decay:.055,
    resonance4Ratio:4.73, resonance4Level:.09, resonance4Decay:.035, volume:0.59
  }]
];
export const INDIAN_PERCUSSION = Object.freeze(Object.fromEntries(indianSounds.map(([id,name,voice,patch]) =>
  [id, Object.freeze({name, voice, params:Object.freeze(resolveParams(voice, {...indianBase,...patch}))})])));
export const KIT_INDIAN = Object.freeze(Object.fromEntries(Object.values(INDIAN_PERCUSSION).map(({voice,params}) => [voice,params])));
export const INDIAN_LABELS = Object.freeze(Object.fromEntries(Object.values(INDIAN_PERCUSSION).map(({voice,name}) => [voice,name])));
// A contemporary 16-step audition pattern, not a traditional tala/theka transcription.
const indianHits = {
  kick:{0:1,8:.65}, snare:{0:.65,3:.65,6:1,10:.65,14:1},
  clap:{2:.35,7:.65,11:.35,15:.65}, closedHat:{2:.65,6:.35,10:.65,14:.35},
  openHat:{0:.35,8:.35}, tom:{12:.65}, rim:{4:.65,12:.35}, cowbell:{5:.35,9:.65,13:.35}
};
export const INDIAN_GROOVE = Object.freeze(Object.fromEntries(Object.entries(indianHits).map(([voice,hits]) =>
  [voice,Object.freeze(Array.from({length:16},(_,step) => hits[step] ?? 0))])));

// Indian Percussion II: complementary drum articulations and a bell cluster.
const indian2Sounds = [
  ['mridangamBass','Mridangam bass','kick', {
    frequency:82, bodyLevel:.83, bodyDecay:1.15, strikePosition:.22, damping:.025,
    pitchSweepSemitones:2, pitchDecay:.025,
    pitchBendSemitones:-3, pitchBendTime:.09, pitchBendRelease:.2,
    noiseLevel:.03, transientFrequency:460, transientLevel:.11, transientMix:.8,
    resonance1Ratio:2, resonance1Level:.26, resonance1Decay:.7,
    resonance2Ratio:3.02, resonance2Level:.14, resonance2Decay:.42,
    resonance3Ratio:4.08, resonance3Level:.06, resonance3Decay:.19, volume:.65
  }],
  ['mridangamTreble','Mridangam treble','snare', {
    frequency:196, bodyLevel:.68, bodyDecay:.9, strikePosition:.64, damping:.025,
    transientFrequency:1380, transientLevel:.19, transientMix:.75, noiseLevel:.035,
    resonance1Ratio:2, resonance1Level:.56, resonance1Decay:.72,
    resonance2Ratio:3, resonance2Level:.4, resonance2Decay:.48,
    resonance3Ratio:4.03, resonance3Level:.23, resonance3Decay:.29,
    resonance4Ratio:5.08, resonance4Level:.12, resonance4Decay:.14,
    resonance5Ratio:6.18, resonance5Level:.06, resonance5Decay:.07, volume:.59
  }],
  ['mridangamMuted','Mridangam muted','clap', {
    frequency:196, bodyLevel:.62, bodyDecay:.9, strikePosition:.84, damping:.78,
    noiseLevel:.14, noiseDecay:.035, noiseHighpass:900, noiseLowpass:4800,
    transientFrequency:1850, transientLevel:.25, transientMix:.48, transientDecay:.004,
    resonance1Ratio:2, resonance1Level:.56, resonance1Decay:.72,
    resonance2Ratio:3, resonance2Level:.4, resonance2Decay:.48,
    resonance3Ratio:4.03, resonance3Level:.23, resonance3Decay:.29,
    resonance4Ratio:5.08, resonance4Level:.12, resonance4Decay:.14,
    resonance5Ratio:6.18, resonance5Level:.06, resonance5Decay:.07, volume:.61
  }],
  ['kanjiraSlap','Kanjira slap','closedHat', {
    frequency:220, bodyLevel:.56, bodyDecay:.37, strikePosition:.8, damping:.14,
    pitchSweepSemitones:4.5, pitchDecay:.018, pitchCurve:1.4,
    noiseLevel:.28, noiseDecay:.095, noiseHighpass:1000, noiseLowpass:6200,
    noiseFilterEnvAmount:1.2, noiseFilterEnvDecay:.035,
    transientFrequency:2300, transientLevel:.27, transientMix:.3, transientTone:.78,
    resonance1Ratio:1.59, resonance1Level:.34, resonance1Decay:.24,
    resonance2Ratio:2.14, resonance2Level:.2, resonance2Decay:.16,
    resonance3Ratio:2.92, resonance3Level:.12, resonance3Decay:.08,
    resonance4Ratio:6.3, resonance4Level:.08, resonance4Decay:.23,
    resonance5Ratio:7.7, resonance5Level:.06, resonance5Decay:.19, volume:.6
  }],
  ['ghungroo','Ghungroo','openHat', {
    bodyModel:'classic', frequency:1070, bodyLevel:.62, attack:.006, bodyDecay:.46,
    metalMix:.84, metalDetune:68, metalDamping:.16, metalHighpass:1150, metalLowpass:9600,
    metalFilterEnvAmount:.4, metalFilterEnvDecay:.13,
    noiseLevel:.2, noiseAttack:.009, noiseDecay:.24, noiseHighpass:2400, noiseLowpass:8200,
    transientType:'noise', transientTone:.85, transientLevel:.07, transientDecay:.009,
    velocityToBrightness:.55, volume:.52
  }],
  ['dholBass','Dhol bass','tom', {
    frequency:67, bodyLevel:.9, bodyDecay:.88, strikePosition:.3, damping:.015,
    pitchSweepSemitones:8, pitchDecay:.033, pitchCurve:1.2,
    noiseLevel:.075, noiseDecay:.07, noiseHighpass:320, noiseLowpass:3600,
    transientFrequency:760, transientLevel:.22, transientMix:.55, transientDecay:.007,
    resonance1Ratio:1.59, resonance1Level:.34, resonance1Decay:.5,
    resonance2Ratio:2.14, resonance2Level:.21, resonance2Decay:.3,
    resonance3Ratio:2.92, resonance3Level:.11, resonance3Decay:.15,
    resonance4Ratio:3.7, resonance4Level:.045, resonance4Decay:.075, volume:.68
  }],
  ['dholTreble','Dhol treble','rim', {
    frequency:285, bodyLevel:.68, bodyDecay:.4, strikePosition:.83, damping:.08,
    pitchSweepSemitones:4, pitchDecay:.015,
    noiseLevel:.17, noiseDecay:.085, noiseHighpass:1400, noiseLowpass:7300,
    noiseFilterEnvAmount:.8, noiseFilterEnvDecay:.04,
    transientFrequency:3100, transientLevel:.28, transientMix:.58, transientTone:.8,
    resonance1Ratio:1.59, resonance1Level:.42, resonance1Decay:.26,
    resonance2Ratio:2.14, resonance2Level:.26, resonance2Decay:.16,
    resonance3Ratio:2.65, resonance3Level:.15, resonance3Decay:.09,
    resonance4Ratio:3.6, resonance4Level:.09, resonance4Decay:.05, volume:.6
  }],
  ['khanjari','Khanjari','cowbell', {
    frequency:340, bodyLevel:.43, bodyDecay:.17, strikePosition:.75, damping:0,
    pitchSweepSemitones:1.2, pitchDecay:.012,
    noiseLevel:.22, noiseAttack:.002, noiseDecay:.24, noiseHighpass:1800, noiseLowpass:6500,
    noiseFilterEnvAmount:.6, noiseFilterEnvDecay:.09,
    transientFrequency:2500, transientLevel:.16, transientMix:.35, transientTone:.7,
    resonance1Ratio:1.58, resonance1Level:.26, resonance1Decay:.12,
    resonance2Ratio:2.19, resonance2Level:.14, resonance2Decay:.08,
    resonance3Ratio:4.13, resonance3Level:.2, resonance3Decay:.27,
    resonance4Ratio:6.8, resonance4Level:.15, resonance4Decay:.35,
    resonance5Ratio:7.57, resonance5Level:.09, resonance5Decay:.22, volume:.59
  }]
];
export const INDIAN_PERCUSSION_2 = Object.freeze(Object.fromEntries(indian2Sounds.map(([id,name,voice,patch]) =>
  [id, Object.freeze({name, voice, params:Object.freeze(resolveParams(voice, {...indianBase,...patch}))})])));
export const KIT_INDIAN_2 = Object.freeze(Object.fromEntries(Object.values(INDIAN_PERCUSSION_2).map(({voice,params}) => [voice,params])));
export const INDIAN_2_LABELS = Object.freeze(Object.fromEntries(Object.values(INDIAN_PERCUSSION_2).map(({voice,name}) => [voice,name])));
// A mixed-instrument demo groove, not a traditional tala or regional ensemble transcription.
const indian2Hits = {
  kick:{0:1,7:.65,10:.65}, snare:{2:.65,5:1,8:.65,14:1},
  clap:{3:.35,6:.65,11:.35,15:.65}, closedHat:{1:.35,5:.65,9:.35,13:.65},
  openHat:{0:.35,4:.35,8:.35,12:.35}, tom:{4:1,12:1},
  rim:{6:.65,10:.35,14:.65}, cowbell:{2:.35,7:.35,11:.65,15:.35}
};
export const INDIAN_2_GROOVE = Object.freeze(Object.fromEntries(Object.entries(indian2Hits).map(([voice,hits]) =>
  [voice,Object.freeze(Array.from({length:16},(_,step) => hits[step] ?? 0))])));

// Cross-tradition audition palette; these are synthesized interpretations.
const westAfricanBase = {
  bodyModel:'modal', frequency:180, bodyLevel:.7, bodyDecay:.6, attack:.001,
  strikePosition:.55, damping:.03, pitchSweepSemitones:0, pitchDecay:.018,
  pitchBendSemitones:0, pitchBendTime:.1, pitchBendRelease:.27,
  noiseLevel:.025, noiseAttack:.0005, noiseDecay:.04,
  noiseHighpass:700, noiseLowpass:5000, noiseResonance:0,
  transientType:'blend', transientMix:.65, transientFrequency:1500,
  transientTone:.65, transientLevel:.13, transientDecay:.005,
  velocityToBrightness:.4, velocityToTransient:.65,
  tone:0, drive:0, volume:.6, fmDepth:0, delaySend:0, reverbSend:0
};
const westAfricanSounds = [
  ['djembeBass','Djembe bass','kick', {
    frequency:77, bodyLevel:.9, bodyDecay:.76, strikePosition:.12, damping:.025,
    pitchSweepSemitones:3.5, pitchDecay:.028, noiseLevel:.035, noiseLowpass:2600,
    transientFrequency:490, transientLevel:.12, transientMix:.8,
    resonance1Ratio:1.59, resonance1Level:.28, resonance1Decay:.4,
    resonance2Ratio:2.14, resonance2Level:.13, resonance2Decay:.22,
    resonance3Ratio:2.92, resonance3Level:.05, resonance3Decay:.1, volume:.66
  }],
  ['djembeTone','Djembe tone','snare', {
    frequency:220, bodyLevel:.72, bodyDecay:.64, strikePosition:.75, damping:.03,
    pitchSweepSemitones:1.2, pitchDecay:.014, noiseLevel:.045, noiseDecay:.045,
    transientFrequency:1700, transientLevel:.18, transientMix:.75,
    resonance1Ratio:1.59, resonance1Level:.5, resonance1Decay:.44,
    resonance2Ratio:2.14, resonance2Level:.31, resonance2Decay:.29,
    resonance3Ratio:2.65, resonance3Level:.17, resonance3Decay:.16,
    resonance4Ratio:3.6, resonance4Level:.08, resonance4Decay:.08, volume:.61
  }],
  ['djembeSlap','Djembe slap','clap', {
    frequency:220, bodyLevel:.43, bodyDecay:.4, strikePosition:1, damping:.32,
    pitchSweepSemitones:2.5, pitchDecay:.008,
    noiseLevel:.3, noiseDecay:.065, noiseHighpass:1700, noiseLowpass:9000,
    noiseFilterEnvAmount:1, noiseFilterEnvDecay:.03,
    transientFrequency:3600, transientLevel:.3, transientMix:.2, transientTone:.9, transientDecay:.004,
    resonance1Ratio:1.59, resonance1Level:.25, resonance1Decay:.25,
    resonance2Ratio:2.14, resonance2Level:.35, resonance2Decay:.18,
    resonance3Ratio:2.65, resonance3Level:.38, resonance3Decay:.13,
    resonance4Ratio:3.6, resonance4Level:.4, resonance4Decay:.1,
    resonance5Ratio:5.4, resonance5Level:.22, resonance5Decay:.06, volume:.65
  }],
  ['shekere','Shekere','closedHat', {
    frequency:165, bodyLevel:.085, bodyDecay:.12, attack:.004, strikePosition:.4, damping:.12,
    noiseLevel:.86, noiseAttack:.012, noiseDecay:.25, noiseHighpass:1500, noiseLowpass:9500,
    noiseFilterEnvAmount:.6, noiseFilterEnvDecay:.12,
    transientType:'noise', transientTone:.75, transientLevel:.065, transientDecay:.012,
    velocityToBrightness:.65, resonance1Ratio:2.31, resonance1Level:.12, resonance1Decay:.075,
    resonance2Ratio:3.67, resonance2Level:.07, resonance2Decay:.05, volume:.5
  }],
  ['gankoguiHigh','Gankogui high','openHat', {
    frequency:960, bodyLevel:.49, bodyDecay:.74, strikePosition:.78, damping:.015,
    noiseLevel:.008, transientFrequency:3800, transientLevel:.14, transientMix:.85,
    resonance1Ratio:1.43, resonance1Level:.52, resonance1Decay:.56,
    resonance2Ratio:2.13, resonance2Level:.34, resonance2Decay:.4,
    resonance3Ratio:2.71, resonance3Level:.2, resonance3Decay:.22,
    resonance4Ratio:3.87, resonance4Level:.1, resonance4Decay:.11,
    resonance5Ratio:5.26, resonance5Level:.05, resonance5Decay:.065, volume:.48
  }],
  ['talkingDrumOpen','Talking drum open','tom', {
    frequency:155, bodyLevel:.77, bodyDecay:1.05, strikePosition:.45, damping:.025,
    noiseLevel:.035, transientFrequency:1100, transientLevel:.16, transientMix:.7,
    resonance1Ratio:1.59, resonance1Level:.33, resonance1Decay:.67,
    resonance2Ratio:2.14, resonance2Level:.2, resonance2Decay:.43,
    resonance3Ratio:2.92, resonance3Level:.11, resonance3Decay:.23,
    resonance4Ratio:3.7, resonance4Level:.05, resonance4Decay:.11, volume:.62
  }],
  ['talkingDrumBend','Talking drum bend','rim', {
    frequency:155, bodyLevel:.77, bodyDecay:1.05, strikePosition:.45, damping:.025,
    pitchBendSemitones:12, pitchBendTime:.1, pitchBendRelease:.27,
    noiseLevel:.035, transientFrequency:1100, transientLevel:.16, transientMix:.7,
    resonance1Ratio:1.59, resonance1Level:.33, resonance1Decay:.67,
    resonance2Ratio:2.14, resonance2Level:.2, resonance2Decay:.43,
    resonance3Ratio:2.92, resonance3Level:.11, resonance3Decay:.23,
    resonance4Ratio:3.7, resonance4Level:.05, resonance4Decay:.11, volume:.62
  }],
  ['gankoguiLow','Gankogui low','cowbell', {
    frequency:620, bodyLevel:.53, bodyDecay:1, strikePosition:.7, damping:.015,
    noiseLevel:.008, transientFrequency:2600, transientLevel:.13, transientMix:.85,
    resonance1Ratio:1.43, resonance1Level:.52, resonance1Decay:.75,
    resonance2Ratio:2.13, resonance2Level:.34, resonance2Decay:.5,
    resonance3Ratio:2.71, resonance3Level:.2, resonance3Decay:.3,
    resonance4Ratio:3.87, resonance4Level:.1, resonance4Decay:.15,
    resonance5Ratio:5.26, resonance5Level:.05, resonance5Decay:.08, volume:.51
  }]
];
export const WEST_AFRICAN_PERCUSSION = Object.freeze(Object.fromEntries(westAfricanSounds.map(([id,name,voice,patch]) =>
  [id, Object.freeze({name, voice, params:Object.freeze(resolveParams(voice, {...westAfricanBase,...patch}))})])));
export const KIT_WEST_AFRICAN = Object.freeze(Object.fromEntries(Object.values(WEST_AFRICAN_PERCUSSION).map(({voice,params}) => [voice,params])));
export const WEST_AFRICAN_LABELS = Object.freeze(Object.fromEntries(Object.values(WEST_AFRICAN_PERCUSSION).map(({voice,name}) => [voice,name])));
// Original 16-step audition groove, not a transcription of a traditional rhythm.
const westAfricanHits = {
  kick:{0:1,6:.65,10:.65}, snare:{2:.65,5:1,9:.65,14:1},
  clap:{3:.65,7:1,11:.65,15:1}, closedHat:{0:.35,2:.65,4:.35,6:.65,8:.35,10:.65,12:.35,14:.65},
  openHat:{3:.35,7:.35,10:.35,14:.35}, tom:{4:.65},
  rim:{12:.65}, cowbell:{0:.35,8:.35}
};
export const WEST_AFRICAN_GROOVE = Object.freeze(Object.fromEntries(Object.entries(westAfricanHits).map(([voice,hits]) =>
  [voice,Object.freeze(Array.from({length:16},(_,step) => hits[step] ?? 0))])));

const middleEasternBase = {
  bodyModel:'modal', frequency:180, bodyLevel:.7, bodyDecay:.55, attack:.001,
  strikePosition:.6, damping:.04, pitchSweepSemitones:0, pitchDecay:.015,
  noiseLevel:.035, noiseAttack:.0005, noiseDecay:.04, noiseHighpass:800, noiseLowpass:5200,
  transientType:'blend', transientMix:.65, transientTone:.7, transientFrequency:1800,
  transientLevel:.15, transientDecay:.005, velocityToBrightness:.4, velocityToTransient:.6,
  tone:0, drive:0, volume:.6, delaySend:0, reverbSend:0
};
const middleEasternSounds = [
  ['darbukaDoum','Darbuka doum','kick', {
    frequency:108, bodyLevel:.86, bodyDecay:.68, strikePosition:.2, damping:.02,
    pitchSweepSemitones:3, pitchDecay:.024, noiseLevel:.025,
    transientFrequency:620, transientMix:.8, transientLevel:.11,
    resonance1Ratio:1.59, resonance1Level:.34, resonance1Decay:.4,
    resonance2Ratio:2.14, resonance2Level:.17, resonance2Decay:.21,
    resonance3Ratio:2.92, resonance3Level:.08, resonance3Decay:.1, volume:.66
  }],
  ['darbukaTek','Darbuka tek','snare', {
    frequency:355, bodyLevel:.65, bodyDecay:.3, strikePosition:.85, damping:.06,
    pitchSweepSemitones:1.8, pitchDecay:.01, transientFrequency:2700, transientLevel:.23,
    noiseLevel:.075, noiseDecay:.045, noiseHighpass:1700, noiseLowpass:7000,
    resonance1Ratio:1.59, resonance1Level:.46, resonance1Decay:.2,
    resonance2Ratio:2.14, resonance2Level:.29, resonance2Decay:.12,
    resonance3Ratio:2.65, resonance3Level:.15, resonance3Decay:.07,
    resonance4Ratio:3.6, resonance4Level:.08, resonance4Decay:.04, volume:.6
  }],
  ['darbukaSlap','Darbuka slap','clap', {
    frequency:355, bodyLevel:.4, bodyDecay:.26, strikePosition:1, damping:.36,
    noiseLevel:.33, noiseDecay:.065, noiseHighpass:2100, noiseLowpass:10500,
    noiseFilterEnvAmount:.8, noiseFilterEnvDecay:.025,
    transientFrequency:4100, transientLevel:.32, transientMix:.22, transientTone:.95, transientDecay:.003,
    resonance1Ratio:1.59, resonance1Level:.26, resonance1Decay:.18,
    resonance2Ratio:2.14, resonance2Level:.38, resonance2Decay:.13,
    resonance3Ratio:2.65, resonance3Level:.3, resonance3Decay:.09,
    resonance4Ratio:3.6, resonance4Level:.2, resonance4Decay:.05, volume:.62
  }],
  ['riqTap','Riq tap','closedHat', {
    frequency:320, bodyLevel:.48, bodyDecay:.18, damping:.01, strikePosition:.7,
    noiseLevel:.16, noiseDecay:.15, noiseHighpass:2000, noiseLowpass:7200,
    transientFrequency:2100, transientLevel:.2, transientMix:.6,
    resonance1Ratio:1.59, resonance1Level:.3, resonance1Decay:.12,
    resonance2Ratio:2.14, resonance2Level:.14, resonance2Decay:.07,
    resonance3Ratio:4.67, resonance3Level:.2, resonance3Decay:.3,
    resonance4Ratio:6.3, resonance4Level:.15, resonance4Decay:.23,
    resonance5Ratio:7.81, resonance5Level:.08, resonance5Decay:.15, volume:.56
  }],
  ['riqShake','Riq shake','openHat', {
    bodyModel:'classic', frequency:680, bodyLevel:.56, attack:.004, bodyDecay:.34,
    metalMix:.72, metalDetune:42, metalDamping:.3, metalHighpass:2200, metalLowpass:10500,
    metalFilterEnvAmount:.65, metalFilterEnvDecay:.13,
    noiseLevel:.38, noiseAttack:.007, noiseDecay:.28, noiseHighpass:3200, noiseLowpass:10000,
    transientType:'noise', transientTone:.85, transientLevel:.075, transientDecay:.01,
    velocityToBrightness:.6, volume:.49
  }],
  ['dafBass','Daf bass','tom', {
    frequency:94, bodyLevel:.84, bodyDecay:1.2, strikePosition:.24, damping:.025,
    pitchSweepSemitones:2.5, pitchDecay:.035, noiseLevel:.13, noiseAttack:.004, noiseDecay:.3,
    noiseHighpass:1000, noiseLowpass:4300, transientFrequency:500, transientLevel:.12,
    resonance1Ratio:1.59, resonance1Level:.33, resonance1Decay:.73,
    resonance2Ratio:2.14, resonance2Level:.2, resonance2Decay:.41,
    resonance3Ratio:2.92, resonance3Level:.1, resonance3Decay:.22, volume:.63
  }],
  ['dafEdge','Daf edge','rim', {
    frequency:188, bodyLevel:.61, bodyDecay:.38, strikePosition:.85, damping:.12,
    noiseLevel:.2, noiseDecay:.18, noiseHighpass:1700, noiseLowpass:5600,
    transientFrequency:1600, transientLevel:.22, transientMix:.45,
    resonance1Ratio:1.59, resonance1Level:.41, resonance1Decay:.27,
    resonance2Ratio:2.14, resonance2Level:.26, resonance2Decay:.17,
    resonance3Ratio:2.92, resonance3Level:.13, resonance3Decay:.09, volume:.6
  }],
  ['fingerCymbals','Finger cymbals','cowbell', {
    frequency:1850, bodyLevel:.4, bodyDecay:1.12, strikePosition:.85, damping:.01,
    noiseLevel:.009, noiseHighpass:3800, noiseLowpass:12000,
    transientFrequency:5800, transientLevel:.12, transientMix:.8, transientTone:.9,
    resonance1Ratio:1.48, resonance1Level:.55, resonance1Decay:.9,
    resonance2Ratio:2.17, resonance2Level:.33, resonance2Decay:.65,
    resonance3Ratio:2.81, resonance3Level:.2, resonance3Decay:.4,
    resonance4Ratio:3.92, resonance4Level:.11, resonance4Decay:.22,
    resonance5Ratio:5.3, resonance5Level:.06, resonance5Decay:.12, volume:.45
  }]
];
export const MIDDLE_EASTERN_PERCUSSION = Object.freeze(Object.fromEntries(middleEasternSounds.map(([id,name,voice,patch]) =>
  [id,Object.freeze({name,voice,params:Object.freeze(resolveParams(voice,{...middleEasternBase,...patch}))})])));
export const KIT_MIDDLE_EASTERN = Object.freeze(Object.fromEntries(Object.values(MIDDLE_EASTERN_PERCUSSION).map(({voice,params})=>[voice,params])));
export const MIDDLE_EASTERN_LABELS = Object.freeze(Object.fromEntries(Object.values(MIDDLE_EASTERN_PERCUSSION).map(({voice,name})=>[voice,name])));
// Original mixed-instrument audition pattern; not a named traditional iqa'.
const middleEasternHits = {
  kick:{0:1,6:.65,8:1}, snare:{2:.65,7:.65,10:1,14:.65}, clap:{3:.35,11:.65,15:.65},
  closedHat:{1:.35,5:.65,9:.35,13:.65}, openHat:{4:.35,12:.35},
  tom:{4:.65}, rim:{12:.65}, cowbell:{0:.35,8:.35}
};
export const MIDDLE_EASTERN_GROOVE = Object.freeze(Object.fromEntries(Object.entries(middleEasternHits).map(([voice,hits])=>
  [voice,Object.freeze(Array.from({length:16},(_,step)=>hits[step]??0))])));

const latinBase = {
  bodyModel:'modal', frequency:200, bodyLevel:.7, bodyDecay:.5, attack:.001,
  strikePosition:.6, damping:.04, pitchSweepSemitones:0, pitchDecay:.015,
  noiseLevel:.035, noiseAttack:.0005, noiseDecay:.04, noiseHighpass:900, noiseLowpass:5500,
  transientType:'blend', transientMix:.7, transientTone:.65, transientFrequency:1900,
  transientLevel:.15, transientDecay:.005, velocityToBrightness:.4, velocityToTransient:.65,
  tone:0, drive:0, volume:.6, delaySend:0, reverbSend:0
};
const latinSounds = [
  ['congaOpen','Conga open','kick', {
    frequency:174, bodyLevel:.8, bodyDecay:.79, strikePosition:.52, damping:.025,
    pitchSweepSemitones:2.2, pitchDecay:.021, transientFrequency:1050, transientLevel:.15,
    resonance1Ratio:1.59, resonance1Level:.38, resonance1Decay:.5,
    resonance2Ratio:2.14, resonance2Level:.22, resonance2Decay:.3,
    resonance3Ratio:2.92, resonance3Level:.11, resonance3Decay:.16,
    resonance4Ratio:3.6, resonance4Level:.055, resonance4Decay:.07, volume:.64
  }],
  ['congaSlap','Conga slap','snare', {
    frequency:174, bodyLevel:.44, bodyDecay:.3, strikePosition:1, damping:.3,
    noiseLevel:.29, noiseDecay:.06, noiseHighpass:1800, noiseLowpass:8500,
    noiseFilterEnvAmount:.9, noiseFilterEnvDecay:.028,
    transientFrequency:3200, transientLevel:.3, transientMix:.25, transientTone:.85, transientDecay:.004,
    resonance1Ratio:1.59, resonance1Level:.26, resonance1Decay:.2,
    resonance2Ratio:2.14, resonance2Level:.35, resonance2Decay:.15,
    resonance3Ratio:2.92, resonance3Level:.35, resonance3Decay:.1,
    resonance4Ratio:4.1, resonance4Level:.2, resonance4Decay:.06, volume:.64
  }],
  ['guiro','Güiro','clap', {
    bodyModel:'classic', bodyLevel:0, noiseLevel:.9, noiseAttack:.0005,
    burstCount:8, burstSpacing:.019, burstDecay:.014, burstVariation:.12,
    tailLevel:.09, tailDecay:.04, noiseHighpass:850, noiseLowpass:5100, noiseResonance:.2,
    noiseFilterEnvAmount:.6, noiseFilterEnvDecay:.18,
    transientType:'noise', transientTone:.55, transientLevel:.025, transientDecay:.003,
    velocityToBrightness:.5, volume:.57
  }],
  ['maracas','Maracas','closedHat', {
    frequency:210, bodyLevel:.04, bodyDecay:.09, attack:.002, damping:.15,
    noiseLevel:.95, noiseAttack:.006, noiseDecay:.16, noiseHighpass:2600, noiseLowpass:12000,
    noiseFilterEnvAmount:.6, noiseFilterEnvDecay:.07,
    transientType:'noise', transientTone:.9, transientLevel:.065, transientDecay:.006,
    velocityToBrightness:.6, volume:.47
  }],
  ['claves','Claves','openHat', {
    frequency:2200, bodyLevel:.53, bodyDecay:.065, strikePosition:.65, damping:0,
    noiseLevel:.008, noiseHighpass:3000, noiseLowpass:9500,
    transientType:'tonal', transientFrequency:3800, transientLevel:.19, transientDecay:.002,
    resonance1Ratio:2.76, resonance1Level:.25, resonance1Decay:.035,
    resonance2Ratio:5.4, resonance2Level:.08, resonance2Decay:.018, volume:.47
  }],
  ['bongoLow','Bongo low','tom', {
    frequency:260, bodyLevel:.72, bodyDecay:.42, strikePosition:.6, damping:.04,
    pitchSweepSemitones:2.4, pitchDecay:.013, transientFrequency:1750, transientLevel:.19,
    resonance1Ratio:1.59, resonance1Level:.4, resonance1Decay:.28,
    resonance2Ratio:2.14, resonance2Level:.22, resonance2Decay:.16,
    resonance3Ratio:2.92, resonance3Level:.11, resonance3Decay:.085, volume:.6
  }],
  ['bongoHigh','Bongo high','rim', {
    frequency:390, bodyLevel:.68, bodyDecay:.31, strikePosition:.72, damping:.045,
    pitchSweepSemitones:2.4, pitchDecay:.013, transientFrequency:2550, transientLevel:.2,
    resonance1Ratio:1.59, resonance1Level:.4, resonance1Decay:.21,
    resonance2Ratio:2.14, resonance2Level:.22, resonance2Decay:.12,
    resonance3Ratio:2.92, resonance3Level:.11, resonance3Decay:.06, volume:.56
  }],
  ['timbale','Timbale','cowbell', {
    frequency:305, bodyLevel:.66, bodyDecay:.58, strikePosition:.8, damping:.015,
    pitchSweepSemitones:2, pitchDecay:.01, noiseLevel:.12, noiseDecay:.065,
    noiseHighpass:2000, noiseLowpass:9000,
    transientFrequency:3900, transientLevel:.27, transientMix:.65, transientTone:.85,
    resonance1Ratio:1.59, resonance1Level:.42, resonance1Decay:.4,
    resonance2Ratio:2.14, resonance2Level:.29, resonance2Decay:.24,
    resonance3Ratio:3.18, resonance3Level:.22, resonance3Decay:.37,
    resonance4Ratio:4.71, resonance4Level:.13, resonance4Decay:.19,
    resonance5Ratio:6.3, resonance5Level:.07, resonance5Decay:.09, volume:.56
  }]
];
export const LATIN_PERCUSSION = Object.freeze(Object.fromEntries(latinSounds.map(([id,name,voice,patch]) =>
  [id,Object.freeze({name,voice,params:Object.freeze(resolveParams(voice,{...latinBase,...patch}))})])));
export const KIT_LATIN = Object.freeze(Object.fromEntries(Object.values(LATIN_PERCUSSION).map(({voice,params})=>[voice,params])));
export const LATIN_LABELS = Object.freeze(Object.fromEntries(Object.values(LATIN_PERCUSSION).map(({voice,name})=>[voice,name])));
// Original 16-step audition pattern; not a complete son/salsa ensemble transcription.
const latinHits = {
  kick:{0:.65,6:1,10:.65,14:1}, snare:{4:.65,12:.65}, clap:{2:.35,10:.35},
  closedHat:{0:.35,2:.35,4:.35,6:.35,8:.35,10:.35,12:.35,14:.35},
  openHat:{0:.65,6:.65,12:.65}, tom:{3:.65,11:.65}, rim:{5:.65,9:.35,15:.65}, cowbell:{7:.65,13:.35}
};
export const LATIN_GROOVE = Object.freeze(Object.fromEntries(Object.entries(latinHits).map(([voice,hits])=>
  [voice,Object.freeze(Array.from({length:16},(_,step)=>hits[step]??0))])));

export const KITS = Object.freeze({ 'middle-eastern':KIT_MIDDLE_EASTERN, latin:KIT_LATIN, 'west-african':KIT_WEST_AFRICAN, 'indian-2':KIT_INDIAN_2, indian:KIT_INDIAN, original: PRESETS, '808': KIT_808, 'original-refined': KIT_ORIGINAL_REFINED, '808-refined': KIT_808_REFINED, 'electro-fm': KIT_ELECTRO_FM, minimal: KIT_MINIMAL, industrial: KIT_INDUSTRIAL, 'deep-dub': KIT_DEEP_DUB, 'retro-arcade': KIT_RETRO_ARCADE, 'soft-dusty': KIT_SOFT_DUSTY });
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
