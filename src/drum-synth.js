/** Drum Synth JS — deterministic percussion synthesis. MIT License. */
export const TRANSIENT_TYPES = Object.freeze(['noise', 'tonal', 'blend']);
export const RESONANCE_VOICES = Object.freeze(['kick', 'snare', 'tom', 'rim', 'cowbell']);
export const FM_VOICES = Object.freeze(['kick', 'snare', 'tom', 'rim', 'cowbell']);
export const BODY_WAVEFORMS = Object.freeze(['sine', 'triangle', 'square', 'saw']);
export const BODY_WAVEFORM_VOICES = Object.freeze(['kick', 'snare', 'tom', 'rim', 'cowbell']);
export const PARAMS = Object.freeze({
  frequency: [25, 4000, 1], decay: [0.03, 3, 0.01], attack: [0.0005, 0.1, 0.0005],
  pitchDrop: [0, 8, 0.05], pitchDecay: [0.005, 0.5, 0.005], tone: [0, 1, 0.01],
  pitchSweepSemitones: [-48, 48, .1], pitchCurve: [.25, 4, .05],
  noiseHighpass: [0, 18000, 10], noiseLowpass: [20, 20000, 10], noiseResonance: [0, 1, .01],
  noise: [0, 1, 0.01], snap: [0, 1, 0.01], drive: [0, 10, 0.1],
  bodyLevel: [0, 1, 0.01], bodyDecay: [0.03, 3, 0.01],
  bodyPulseWidth: [.05, .95, .01], bodyWaveformMix: [0, 1, .01],
  noiseLevel: [0, 1, 0.01], noiseAttack: [0.0005, 0.1, 0.0005], noiseDecay: [0.03, 3, 0.01],
  transientTone: [0, 1, .01], transientFrequency: [40, 12000, 10], transientMix: [0, 1, .01],
  transientLevel: [0, 1, 0.01], transientDecay: [0.001, 0.3, 0.001],
  burstCount: [1, 8, 1], burstSpacing: [.002, .06, .001], burstDecay: [.003, .12, .001],
  tailLevel: [0, 1, .01], tailDecay: [.03, 3, .01], burstVariation: [0, 1, .01],
  metalMix: [0, 1, .01], metalDetune: [0, 100, 1], metalDamping: [0, 1, .01],
  metalHighpass: [0, 18000, 10], metalLowpass: [20, 20000, 10],
  noiseFilterEnvAmount: [-4, 4, .05], noiseFilterEnvDecay: [.005, 3, .005],
  metalFilterEnvAmount: [-4, 4, .05], metalFilterEnvDecay: [.005, 3, .005],
  velocityToBrightness: [0, 1, .01], velocityToTransient: [0, 1, .01],
  ...Object.fromEntries([1, 2, 3].flatMap(n => [
    [`resonance${n}Ratio`, [.5, 8, .01]], [`resonance${n}Level`, [0, 1, .01]], [`resonance${n}Decay`, [.01, 3, .01]]
  ])),
  fmDepth: [0, 4, .01], fmRatio: [.25, 8, .01], fmDecay: [.005, 3, .005],
  volume: [0, 1, 0.01], seed: [1, 4294967295, 1],
  delaySend: [0, 1, .01], reverbSend: [0, 1, .01]
});
for (const range of Object.values(PARAMS)) Object.freeze(range);
const common = { frequency: 150, decay: 0.25, attack: 0.001, pitchDrop: 0.5,
  pitchDecay: 0.03, tone: 0.6, noise: 0.5, snap: 0.2, drive: 0, volume: 0.8, seed: 42 };
export const PRESETS = Object.freeze(Object.fromEntries(Object.entries({
  kick: { frequency: 52, decay: 0.55, pitchDrop: 3, noise: 0.02, snap: 0.35, tone: 0.3 },
  snare: { frequency: 185, decay: 0.24, noise: 0.75, snap: 0.4 },
  clap: { frequency: 900, decay: 0.2, noise: 0.95, tone: 0.65, snap: 0.65 },
  closedHat: { frequency: 420, decay: 0.07, noise: 0.65, tone: 0.9, pitchDrop: 0, snap: 0.1 },
  openHat: { frequency: 420, decay: 0.65, noise: 0.65, tone: 0.85, pitchDrop: 0, snap: 0.1 },
  tom: { frequency: 115, decay: 0.45, pitchDrop: 0.8, noise: 0.06, tone: 0.4 },
  rim: { frequency: 720, decay: 0.065, pitchDrop: 0.1, noise: 0.15, snap: 0.7 },
  cowbell: { frequency: 560, decay: 0.25, pitchDrop: 0, noise: 0.02, tone: 0.75, snap: 0.2 }
}).map(([key, value]) => [key, Object.freeze(mergeParams({...common, noiseHighpass: key === 'kick' ? 0 : key.includes('Hat') ? 2500 : 700}, value))])));
const TAU = Math.PI * 2;
function object(value, name) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new TypeError(`${name} must be an object`);
}
function number(value, min, max, name) {
  if (!Number.isFinite(value) || value < min || value > max) throw new RangeError(`${name} must be between ${min} and ${max}`);
  return value;
}
function keys(value, allowed) {
  for (const key of Object.keys(value)) if (!allowed.includes(key)) throw new TypeError(`Unknown option: ${key}`);
}
// Legacy macros update their corresponding layers; explicit layer values win.
function mergeParams(base, overrides) {
  const p = { ...base, ...overrides };
  const legacy = (key) => Object.hasOwn(overrides, key);
  const layer = (key, macro, value) => {
    if (!Object.hasOwn(overrides, key) && (legacy(macro) || p[key] === undefined)) p[key] = value;
  };
  layer('pitchSweepSemitones', 'pitchDrop', 12 * Math.log2(1 + p.pitchDrop));
  layer('noiseLowpass', 'tone', 500 + p.tone * 14500);
  p.pitchCurve ??= 1; p.noiseResonance ??= 0;
  layer('bodyLevel', 'noise', 1 - p.noise);
  layer('noiseLevel', 'noise', p.noise);
  layer('bodyDecay', 'decay', p.decay);
  layer('noiseDecay', 'decay', p.decay);
  layer('noiseAttack', 'attack', p.attack);
  layer('tailDecay', 'noiseDecay', p.noiseDecay);
  if (legacy('decay') && !legacy('noiseDecay') && !legacy('tailDecay')) p.tailDecay = p.noiseDecay;
  p.burstCount ??= 3; p.burstSpacing ??= .012; p.burstDecay ??= .012;
  p.noiseFilterEnvAmount ??= 0; p.noiseFilterEnvDecay ??= .15;
  p.metalFilterEnvAmount ??= 0; p.metalFilterEnvDecay ??= .15;
  p.velocityToBrightness ??= 0; p.velocityToTransient ??= 0;
  if (p.fmDepth === undefined) p.fmDepth = 0;
  if (p.fmRatio === undefined) p.fmRatio = 2;
  if (p.fmDecay === undefined) p.fmDecay = .08;
  if (p.bodyWaveform === undefined) p.bodyWaveform = 'sine';
  if (p.bodyPulseWidth === undefined) p.bodyPulseWidth = .5;
  if (p.bodyWaveformMix === undefined) p.bodyWaveformMix = 1;
  if (p.delaySend === undefined) p.delaySend = 0;
  if (p.reverbSend === undefined) p.reverbSend = 0;
  p.metalMix ??= .5; p.metalDetune ??= 12; p.metalDamping ??= .3;
  p.metalHighpass ??= 1800; p.metalLowpass ??= 14500;
  p.tailLevel ??= .55; p.burstVariation ??= 0;
  if (p.transientType === undefined) p.transientType = 'noise'; p.transientTone ??= 1; p.transientFrequency ??= 1600; p.transientMix ??= .5;
  layer('transientLevel', 'snap', p.snap);
  if (p.transientDecay === undefined) p.transientDecay = 6.907755 * .003;
  for (const [index, ratio] of [1.5, 2.37, 3.1].entries()) {
    const n=index+1;
    if (p[`resonance${n}Ratio`] === undefined) p[`resonance${n}Ratio`] = ratio;
    if (p[`resonance${n}Level`] === undefined) p[`resonance${n}Level`] = 0;
    if (p[`resonance${n}Decay`] === undefined) p[`resonance${n}Decay`] = .2;
  }
  return p;
}
export function resolveParams(voice, overrides = {}) {
  if (!Object.hasOwn(PRESETS, voice)) throw new TypeError(`Unknown voice: ${voice}`);
  object(overrides, 'parameters'); keys(overrides, [...Object.keys(PARAMS), 'transientType', 'bodyWaveform']);
  if (Object.hasOwn(overrides, 'transientType') && !TRANSIENT_TYPES.includes(overrides.transientType)) throw new TypeError('transientType must be noise, tonal, or blend');
  if (Object.hasOwn(overrides, 'bodyWaveform') && !BODY_WAVEFORMS.includes(overrides.bodyWaveform)) throw new TypeError('bodyWaveform must be sine, triangle, square, or saw');
  const params = mergeParams(PRESETS[voice], overrides);
  for (const [key, [min, max]] of Object.entries(PARAMS)) number(params[key], min, max, key);
  if (!TRANSIENT_TYPES.includes(params.transientType)) throw new TypeError('transientType must be noise, tonal, or blend');
  if (!BODY_WAVEFORMS.includes(params.bodyWaveform)) throw new TypeError('bodyWaveform must be sine, triangle, square, or saw');
  if (!Number.isInteger(params.burstCount)) throw new RangeError('burstCount must be an integer');
  if (!Number.isInteger(params.seed)) throw new RangeError('seed must be an integer');
  return params;
}

// Full-strength hits retain the preset; softer hits darken and soften their attack.
function velocityParams(p, velocity) {
  const brightness = 2 ** (-3 * p.velocityToBrightness * (1 - velocity));
  return {...p,
    noiseLowpass:Math.max(20, p.noiseLowpass * brightness),
    metalLowpass:Math.max(20, p.metalLowpass * brightness),
    transientLevel:p.transientLevel * (1 - p.velocityToTransient * (1 - velocity))
  };
}
/** Render mono PCM. Layer decay times reach roughly -60 dB; see README for onset semantics. */
export function render(voice, overrides = {}, options = {}) {
  let p = resolveParams(voice, overrides);
  object(options, 'render options'); keys(options, ['sampleRate', 'velocity']);
  const sampleRate = number(options.sampleRate ?? 44100, 8000, 96000, 'sampleRate');
  if (!Number.isInteger(sampleRate)) throw new RangeError('sampleRate must be an integer');
  const velocity = number(options.velocity ?? 1, 0, 1, 'velocity');
  p = velocityParams(p, velocity);
  const isHat = voice === 'closedHat' || voice === 'openHat';
  // Centered balance preserves the independent layer levels at 0.5.
  const metalGain = isHat ? 2 * p.metalMix : 1;
  const noiseGain = isHat ? 2 * (1 - p.metalMix) : 1;
  const isClap = voice === 'clap';
  const resonances = RESONANCE_VOICES.includes(voice) ? [1,2,3].map(n => ({
    ratio:p[`resonance${n}Ratio`], level:p[`resonance${n}Level`], decay:p[`resonance${n}Decay`]
  })).filter(r => r.level > 0) : [];
  const bodyEnd = p.attack + Math.max(p.bodyDecay, ...resonances.map(r => r.decay));
  // Separate random stream: changing burst structure never shifts the noise sequence.
  let burstSeed = ((p.seed ^ 0x9e3779b9) >>> 0) || 1;
  const randomBurst = () => {
    burstSeed ^= burstSeed << 13; burstSeed ^= burstSeed >>> 17; burstSeed ^= burstSeed << 5;
    return (burstSeed >>> 0) / 4294967296;
  };
  let onset = 0;
  const bursts = isClap ? Array.from({length:p.burstCount}, (_,i) => {
    if (i) onset += p.burstSpacing * (1 + (randomBurst() * 2 - 1) * .35 * p.burstVariation);
    return {time:onset, gain:(.85 ** i) * (1 + (randomBurst() * 2 - 1) * .2 * p.burstVariation)};
  }) : [];
  const tailStart = isClap ? onset + p.burstSpacing : 0;
  const noiseEnd = isClap ? Math.max(onset + p.noiseAttack + p.burstDecay,
    p.tailLevel > 0 ? tailStart + p.noiseAttack + p.tailDecay : 0) : p.noiseAttack + p.noiseDecay;
  const duration = Math.max(p.bodyLevel * metalGain > 0 ? bodyEnd : 0,
    p.noiseLevel * noiseGain > 0 ? noiseEnd : 0,
    p.transientLevel > 0 ? p.transientDecay : 0, .03) + .015;
  const samples = new Float32Array(Math.ceil(duration * sampleRate));
  let seed = p.seed >>> 0, phase = 0, low = 0, bodyLow = 0, dcIn = 0, dcOut = 0;
  const cutoff = Math.min(sampleRate * 0.4, p.noiseLowpass);
  let alpha = 1 - Math.exp(-TAU * cutoff / sampleRate);
  const hpAlpha = 1 - Math.exp(-TAU * Math.min(sampleRate * .4, p.noiseHighpass) / sampleRate);
  // Parallel resonant low-pass, blended with the original one-pole at zero resonance.
  const w = TAU * cutoff / sampleRate, c = Math.cos(w), q = .70710678 + 7.3 * p.noiseResonance;
  const a = Math.sin(w) / (2 * q), a0 = 1 + a;
  let b0 = (1 - c) / 2 / a0, b1 = (1 - c) / a0, b2 = b0;
  let a1 = -2 * c / a0, a2 = (1 - a) / a0;
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  let metalLP = 1 - Math.exp(-TAU * Math.min(sampleRate * .4, p.metalLowpass) / sampleRate);
  const metalHP = 1 - Math.exp(-TAU * Math.min(sampleRate * .4, p.metalHighpass) / sampleRate);
  let metalLow = 0, metalBass = 0;
  // Odd-harmonic oscillator bank: six inharmonic ratios with symmetric fixed detuning.
  const ratios = [1, 1.342, 1.79, 2.13, 2.67, 3.17];
  const offsets = [-1, .6, -.35, 1, -.7, .45];
  const partials = isHat ? ratios.flatMap((ratio,index) => [1,3,5,7].map(harmonic => ({
    ratio:ratio * 2 ** (offsets[index] * p.metalDetune / 1200) * harmonic,
    amplitude:1 / harmonic
  }))) : [];
  const transientCutoff = Math.min(sampleRate * .4, 200 * 100 ** p.transientTone);
  const transientAlpha = 1 - Math.exp(-TAU * transientCutoff / sampleRate);
  const transientBypass = p.transientTone ** 8;
  const transientHz = Math.min(sampleRate * .4, p.transientFrequency);
  let transientLow = 0;
  const sweepRatio = 2 ** (p.pitchSweepSemitones / 12) - 1;
  const fmEnabled = FM_VOICES.includes(voice) && p.fmDepth > 0;
  let fmPhase = 0, modulatorPhase = 0;
  const sine = (mult) => Math.sin((fmEnabled ? fmPhase : phase) * mult);
  const shapeEnabled = BODY_WAVEFORM_VOICES.includes(voice) && p.bodyLevel > 0
    && p.bodyWaveform !== 'sine' && p.bodyWaveformMix > 0;
  // Finite Fourier series, with no DC term. Square duty cycle is centered on the
  // sine peak, so a 50% square and the sine blend share fundamental phase.
  const harmonics = shapeEnabled ? Array.from({length:32}, (_,i) => {
    const n = i + 1;
    if (p.bodyWaveform === 'triangle') return [n % 2 ? 8 / (Math.PI ** 2) * (-1) ** ((n - 1) / 2) / n ** 2 : 0, 0];
    if (p.bodyWaveform === 'saw') return [2 / Math.PI * (-1) ** (n + 1) / n, 0];
    const a = 4 * Math.sin(Math.PI * n * p.bodyPulseWidth) / (Math.PI * n)
      / (2 * Math.max(p.bodyPulseWidth, 1 - p.bodyPulseWidth));
    return [a * Math.sin(n * Math.PI / 2), a * Math.cos(n * Math.PI / 2)];
  }) : [];
  let bodyBandwidth = 0, fmMargin = 0;
  const oscillator = shapeEnabled ? mult => {
    const angle = (fmEnabled ? fmPhase : phase) * mult;
    const fundamental = Math.sin(angle), cosine = Math.cos(angle);
    let sn = fundamental, cs = cosine, shaped = 0;
    for (let i = 0; i < harmonics.length; i++) {
      // Leave room for FM sidebands as well as each harmonic's carrier. This is
      // a conservative bandwidth estimate, not an alias-free guarantee for FM.
      const edge = (i + 1) * bodyBandwidth * mult + fmMargin;
      if (edge >= sampleRate * .45) break;
      const fade = Math.min(1, (sampleRate * .45 - edge) / (sampleRate * .1));
      const taper = fade * fade * (3 - 2 * fade);
      shaped += (harmonics[i][0] * sn + harmonics[i][1] * cs) * taper;
      const nextSin = sn * cosine + cs * fundamental;
      cs = cs * cosine - sn * fundamental; sn = nextSin;
    }
    return fundamental * (1 - p.bodyWaveformMix) + shaped * p.bodyWaveformMix;
  } : sine;
  const env = (t, attack, decay) => t < 0 ? 0 : Math.min(1, t / attack) * Math.exp(-6.907755 * Math.max(0, t - attack) / decay);
  const clapNoiseEnv = t => bursts.reduce((sum, burst) => sum + burst.gain * env(t - burst.time, p.noiseAttack, p.burstDecay), 0)
    + p.tailLevel * env(t - tailStart, p.noiseAttack, p.tailDecay);
  for (let i = 0; i < samples.length; i++) {
    const t = i / sampleRate;
    // Octave offsets decay toward zero; the base cutoff is already velocity-adjusted.
    if (p.noiseFilterEnvAmount !== 0) {
      const movingCutoff = Math.max(20, Math.min(sampleRate * .4,
        p.noiseLowpass * 2 ** (p.noiseFilterEnvAmount * Math.exp(-6.907755 * t / p.noiseFilterEnvDecay))));
      alpha = 1 - Math.exp(-TAU * movingCutoff / sampleRate);
      const angle = TAU * movingCutoff / sampleRate, cosine = Math.cos(angle);
      const resonanceAlpha = Math.sin(angle) / (2 * q), divisor = 1 + resonanceAlpha;
      b0 = (1 - cosine) / 2 / divisor; b1 = (1 - cosine) / divisor; b2 = b0;
      a1 = -2 * cosine / divisor; a2 = (1 - resonanceAlpha) / divisor;
    }
    if (isHat && p.metalFilterEnvAmount !== 0) {
      const movingCutoff = Math.max(20, Math.min(sampleRate * .4,
        p.metalLowpass * 2 ** (p.metalFilterEnvAmount * Math.exp(-6.907755 * t / p.metalFilterEnvDecay))));
      metalLP = 1 - Math.exp(-TAU * movingCutoff / sampleRate);
    }
    seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5;
    const white = (seed >>> 0) / 2147483648 - 1;
    low += alpha * (white - low);
    const resonant = b0 * white + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
    x2 = x1; x1 = white; y2 = y1; y1 = resonant;
    const filtered = low * (1 - p.noiseResonance) + resonant * p.noiseResonance;
    bodyLow += hpAlpha * (filtered - bodyLow);
    const brightNoise = filtered - bodyLow;
    const f = Math.min(sampleRate * 0.18, p.frequency * (1 + sweepRatio * Math.exp(-((t / p.pitchDecay) ** p.pitchCurve))));
    phase += TAU * f / sampleRate;
    bodyBandwidth = f; fmMargin = 0;
    if (fmEnabled) {
      const modulatorHz = Math.min(sampleRate * .2, f * p.fmRatio);
      modulatorPhase += TAU * modulatorHz / sampleRate;
      const index = p.fmDepth * Math.exp(-6.907755 * t / p.fmDecay);
      // Limit fundamental deviation near the sample-rate ceiling; negative instantaneous
      // frequencies are valid through-zero FM and do not require rectification.
      const deviation = Math.min(index * modulatorHz, Math.max(0, sampleRate * .4 - f));
      fmPhase += TAU * (f + deviation * Math.sin(modulatorPhase)) / sampleRate;
      bodyBandwidth += deviation;
      fmMargin = Math.min(1, index) * modulatorHz * 2;
    }
    let body, noise = brightNoise;
    switch (voice) {
      case 'kick': body = oscillator(1) + p.tone * 0.18 * oscillator(2); break;
      case 'tom': body = 0.8 * oscillator(1) + 0.2 * oscillator(1.5); break;
      case 'snare': body = 0.65 * oscillator(1) + 0.35 * oscillator(1.47); break;
      case 'clap':
        body = 0.25 * sine(1);
        break;
      case 'rim': body = (oscillator(1) + oscillator(2.37) * 0.7 + oscillator(3.1) * 0.3) / 2; break;
      case 'cowbell': body = (oscillator(1) + oscillator(1.48) + p.tone * 0.3 * (oscillator(3) + oscillator(4.44))) / 2.6; break;
      default: {
        let metal = 0;
        for (const partial of partials) {
          // Fade partials out before Nyquist, including during pitch sweeps.
          const taper = Math.max(0, Math.min(1, (sampleRate * .45 - f * partial.ratio) / (sampleRate * .05)));
          const damping = Math.exp(-p.metalDamping * 3 * Math.max(0, partial.ratio - 1) * t / p.bodyDecay);
          metal += sine(partial.ratio) * partial.amplitude * taper * damping;
        }
        metalLow += metalLP * (metal / 3.5 - metalLow);
        metalBass += metalHP * (metalLow - metalBass);
        body = metalLow - metalBass;
      }
    }
    transientLow += transientAlpha * (white - transientLow);
    const clickNoise = p.transientTone === 1 ? white : transientLow + (white - transientLow) * transientBypass;
    const knock = Math.sin(TAU * transientHz * t);
    const impact = p.transientType === 'noise' ? clickNoise : p.transientType === 'tonal' ? knock
      : clickNoise * (1 - p.transientMix) + knock * p.transientMix;
    const transient = impact * p.transientLevel * Math.exp(-6.907755 * t / p.transientDecay) * Math.min(1, t / 0.0005);
    let bodySignal = body * env(t, p.attack, p.bodyDecay);
    for (const resonance of resonances) {
      const taper = Math.max(0, Math.min(1, (sampleRate * .45 - f * resonance.ratio) / (sampleRate * .05)));
      bodySignal += Math.sin(phase * resonance.ratio) * resonance.level * taper * env(t, p.attack, resonance.decay);
    }
    let value = metalGain * p.bodyLevel * bodySignal + noiseGain * p.noiseLevel * noise * (isClap ? clapNoiseEnv(t) : env(t, p.noiseAttack, p.noiseDecay)) + transient;
    // DC blocker, saturation, and a final fade prevent offset and truncation clicks.
    const dc = value - dcIn + 0.995 * dcOut; dcIn = value; dcOut = dc;
    value = Math.tanh(dc * (1 + p.drive)) / Math.tanh(1 + p.drive);
    const fade = Math.min(1, (samples.length - 1 - i) / (sampleRate * 0.01));
    samples[i] = Math.max(-1, Math.min(1, value * p.volume * velocity * fade));
  }
  return { samples, sampleRate, duration: samples.length / sampleRate };
}

/** Encode render() output as a mono 16-bit PCM RIFF/WAV ArrayBuffer. */
export function encodeWav(audio) {
  object(audio, 'audio');
  const { samples, sampleRate } = audio;
  if (!(samples instanceof Float32Array) || !samples.length) throw new TypeError('samples must be a nonempty Float32Array');
  number(sampleRate, 8000, 96000, 'sampleRate');
  if (!Number.isInteger(sampleRate)) throw new RangeError('sampleRate must be an integer');
  if (samples.length > (0xffffffff - 36) / 2) throw new RangeError('WAV is too large');
  const buffer = new ArrayBuffer(44 + samples.length * 2), view = new DataView(buffer);
  const str = (offset, s) => [...s].forEach((c, i) => view.setUint8(offset + i, c.charCodeAt(0)));
  str(0, 'RIFF'); view.setUint32(4, buffer.byteLength - 8, true); str(8, 'WAVE'); str(12, 'fmt ');
  view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true); view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true); view.setUint16(34, 16, true); str(36, 'data');
  view.setUint32(40, samples.length * 2, true);
  samples.forEach((sample, i) => {
    if (!Number.isFinite(sample)) throw new TypeError('samples must be finite');
    const s = Math.max(-1, Math.min(1, sample));
    view.setInt16(44 + i * 2, Math.round(s * (s < 0 ? 32768 : 32767)), true);
  });
  return buffer;
}

/** Shared playback effects; send amounts live in the individual voice Params. */
export const EFFECT_PARAMS = Object.freeze(Object.fromEntries(Object.entries({
  delayTime: [.01, 2, .005], delayFeedback: [0, .85, .01],
  delayTone: [200, 18000, 10], delayLevel: [0, 1, .01],
  reverbDecay: [.1, 6, .1], reverbPreDelay: [0, .2, .001],
  reverbTone: [200, 18000, 10], reverbLevel: [0, 1, .01]
}).map(([name, range]) => [name, Object.freeze(range)])));
export const DEFAULT_EFFECTS = Object.freeze({enabled:true, delayTime:.3, delayFeedback:.32,
  delayTone:4500, delayLevel:.35, reverbDecay:1.6, reverbPreDelay:.015,
  reverbTone:6500, reverbLevel:.3});
function resolveEffects(base, overrides) {
  object(overrides, 'effects'); keys(overrides, ['enabled', ...Object.keys(EFFECT_PARAMS)]);
  const p = {...base, ...overrides};
  if (typeof p.enabled !== 'boolean') throw new TypeError('effects.enabled must be boolean');
  for (const [key, [min, max]] of Object.entries(EFFECT_PARAMS)) number(p[key], min, max, `effects.${key}`);
  return p;
}
function reverbImpulse(context, decay) {
  // Two independent seeded noise channels: no downloads and stable timbre on rebuild.
  const length = Math.ceil(context.sampleRate * decay), buffer = context.createBuffer(2, length, context.sampleRate);
  for (let channel = 0; channel < 2; channel++) {
    const samples = buffer.getChannelData(channel);
    let seed = channel === 0 ? 0x12345678 : 0x87654321, low = 0;
    const alpha = 1 - Math.exp(-TAU * Math.min(8000, context.sampleRate * .4) / context.sampleRate);
    for (let i = 0; i < length; i++) {
      seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5;
      low += alpha * ((seed >>> 0) / 2147483648 - 1 - low);
      const t = i / context.sampleRate;
      samples[i] = low * Math.exp(-6.907755 * t / decay) * Math.min(1, t / .005)
        * Math.min(1, (length - 1 - i) / (context.sampleRate * .01));
    }
  }
  return buffer;
}
class SendEffects {
  constructor(context, output, settings) {
    this.context = context; this.nodes = [];
    const add = node => { this.nodes.push(node); return node; };
    try {
      this.delayInput = add(context.createGain());
      this.delay = add(context.createDelay(2));
      this.delayFilter = add(context.createBiquadFilter()); this.delayFilter.type = 'lowpass'; this.delayFilter.Q.value = -3.0103;
      this.feedback = add(context.createGain()); this.delayReturn = add(context.createGain());
      this.delayInput.connect(this.delay); this.delay.connect(this.delayFilter);
      this.delayFilter.connect(this.feedback); this.feedback.connect(this.delay);
      this.delayFilter.connect(this.delayReturn); this.delayReturn.connect(output);
      this.reverbInput = add(context.createGain()); this.preDelay = add(context.createDelay(.2));
      this.convolver = add(context.createConvolver()); this.convolver.normalize = true;
      this.reverbFilter = add(context.createBiquadFilter()); this.reverbFilter.type = 'lowpass'; this.reverbFilter.Q.value = -3.0103;
      this.reverbReturn = add(context.createGain());
      this.reverbInput.connect(this.preDelay); this.preDelay.connect(this.convolver);
      this.convolver.connect(this.reverbFilter); this.reverbFilter.connect(this.reverbReturn); this.reverbReturn.connect(output);
      this.update(settings, true);
    } catch (error) { this.dispose(); throw error; }
  }
  update(p, initial = false) {
    // Construct the potentially large buffer before changing any live settings.
    const impulse = initial || p.reverbDecay !== this.settings.reverbDecay ? reverbImpulse(this.context, p.reverbDecay) : null;
    const set = (param, value) => {
      if (initial) param.value = value;
      else param.setTargetAtTime(value, this.context.currentTime, .015);
    };
    const cutoff = hz => Math.min(hz, this.context.sampleRate * .45);
    set(this.delay.delayTime, p.delayTime); set(this.feedback.gain, p.delayFeedback);
    set(this.delayFilter.frequency, cutoff(p.delayTone)); set(this.delayReturn.gain, p.delayLevel);
    set(this.preDelay.delayTime, p.reverbPreDelay); set(this.reverbFilter.frequency, cutoff(p.reverbTone));
    set(this.reverbReturn.gain, p.reverbLevel);
    if (impulse) this.convolver.buffer = impulse;
    this.settings = {...p};
  }
  dispose() { for (const node of this.nodes) node.disconnect(); this.nodes = []; }
}

export class DrumSynth {
  constructor(options = {}) {
    object(options, 'options'); keys(options, ['context', 'destination', 'volume', 'maxVoices', 'chokeEnabled', 'chokeFade', 'effects']);
    this._effectSettings = resolveEffects(DEFAULT_EFFECTS, options.effects === undefined ? {} : options.effects);
    this._effects = null;
    const volume = number(options.volume ?? 0.7, 0, 1, 'volume');
    this.maxVoices = number(options.maxVoices ?? 32, 1, 128, 'maxVoices');
    if (!Number.isInteger(this.maxVoices)) throw new RangeError('maxVoices must be an integer');
    const chokeEnabled = options.chokeEnabled ?? true;
    if (typeof chokeEnabled !== 'boolean') throw new TypeError('chokeEnabled must be boolean');
    this.chokeEnabled = chokeEnabled;
    this.chokeFade = number(options.chokeFade ?? .005, .001, .1, 'chokeFade');
    this._playbacks = new Map();
    const AudioContext = globalThis.AudioContext || globalThis.webkitAudioContext;
    if (!options.context && !AudioContext) throw new Error('Web Audio is unavailable; use render() in Node.js');
    this.context = options.context ?? new AudioContext();
    this.ownsContext = !options.context; this.disposed = false; this.active = new Set();
    this.output = this.context.createGain(); this.output.gain.value = volume;
    this.output.connect(options.destination ?? this.context.destination);
    this.kit = Object.fromEntries(Object.entries(PRESETS).map(([k, v]) => [k, { ...v }]));
    this.cache = new Map();
  }
  _assert() { if (this.disposed) throw new Error('DrumSynth has been disposed'); }
  async resume() { this._assert(); if (this.context.state === 'suspended') await this.context.resume(); }
  setVolume(value) {
    this._assert(); number(value, 0, 1, 'volume');
    this.output.gain.setTargetAtTime(value, this.context.currentTime, 0.01); return this;
  }
  getEffects() { this._assert(); return {...this._effectSettings}; }
  setEffects(overrides = {}) {
    this._assert();
    const settings = resolveEffects(this._effectSettings, overrides);
    if (!settings.enabled) this.clearEffects();
    else this._effects?.update(settings);
    this._effectSettings = settings; return this;
  }
  /** Clear shared wet tails without changing the settings or dry voices. */
  clearEffects() {
    this._assert();
    this._effects?.dispose(); this._effects = null;
    // Detach sends from the discarded bus, including already scheduled hits.
    for (const record of this._playbacks.values()) {
      for (const send of record.sends) send.disconnect();
    }
    return this;
  }
  setChoke(options = {}) {
    this._assert(); object(options, 'choke options'); keys(options, ['chokeEnabled', 'chokeFade']);
    const enabled = options.chokeEnabled ?? this.chokeEnabled;
    if (typeof enabled !== 'boolean') throw new TypeError('chokeEnabled must be boolean');
    const fade = number(options.chokeFade ?? this.chokeFade, .001, .1, 'chokeFade');
    this.chokeEnabled = enabled; this.chokeFade = fade; this._refreshChokes(); return this;
  }
  _refreshChokes() {
    const now = this.context.currentTime;
    const closed = [...this._playbacks.values()].filter(r => r.voice === 'closedHat');
    for (const r of this._playbacks.values()) {
      if (r.voice !== 'openHat' || r.chokeAt <= now) continue; // A started closure is irreversible.
      let at = Infinity;
      if (this.chokeEnabled) for (const c of closed) {
        if (c.when >= now && c.when >= r.when && c.when < r.end) at = Math.min(at, c.when);
      }
      const end = Math.min(r.end, at + this.chokeFade);
      if (at === r.chokeAt && end === r.chokeEnd) continue;
      r.gain.gain.cancelScheduledValues(now);
      r.gain.gain.setValueAtTime(r.velocity, now);
      if (Number.isFinite(at)) {
        r.gain.gain.setValueAtTime(r.velocity, Math.max(now, at));
        r.gain.gain.linearRampToValueAtTime(0, end);
        r.source.stop(end);
      } else if (Number.isFinite(r.chokeAt)) {
        // Replacing a future stop restores a cancelled pending closure.
        r.source.stop(r.end);
      }
      r.chokeAt = at; r.chokeEnd = end;
    }
  }
  configure(voice, params) {
    this._assert(); resolveParams(voice, params);
    this.kit[voice] = resolveParams(voice, mergeParams(this.kit[voice], params)); return this;
  }
  getParams(voice) { this._assert(); resolveParams(voice); return { ...this.kit[voice] }; }
  /** Schedule on the audio clock; call resume() in a user gesture first. */
  trigger(voice, options = {}) {
    this._assert(); object(options, 'trigger options'); keys(options, ['when', 'velocity', 'pan', 'params']);
    const p = resolveParams(voice, mergeParams(this.getParams(voice), resolveOverride(options.params)));
    const when = Math.max(this.context.currentTime, number(options.when ?? this.context.currentTime, 0, Number.MAX_VALUE, 'when'));
    const velocity = number(options.velocity ?? 1, 0, 1, 'velocity');
    const pan = number(options.pan ?? 0, -1, 1, 'pan');
    const effective = velocityParams(p, velocity);
    const {delaySend, reverbSend, ...dryParams} = effective;
    const key = JSON.stringify([voice, dryParams]);
    if (this._effectSettings.enabled && (delaySend > 0 || reverbSend > 0) && !this._effects) {
      this._effects = new SendEffects(this.context, this.output, this._effectSettings);
    }
    let buffer = this.cache.get(key);
    if (!buffer) {
      const audio = render(voice, effective, { sampleRate: this.context.sampleRate });
      buffer = this.context.createBuffer(1, audio.samples.length, audio.sampleRate);
      buffer.copyToChannel(audio.samples, 0);
      if (this.cache.size >= 64) this.cache.delete(this.cache.keys().next().value);
      this.cache.set(key, buffer);
    }
    while (this.active.size >= this.maxVoices) this.active.values().next().value.stop();
    const source = this.context.createBufferSource(), gain = this.context.createGain(), panner = this.context.createStereoPanner();
    source.buffer = buffer; gain.gain.value = velocity; panner.pan.value = pan;
    source.connect(gain); gain.connect(panner); panner.connect(this.output);
    const sends = [];
    if (this._effects) for (const [amount, input] of [[delaySend, this._effects.delayInput], [reverbSend, this._effects.reverbInput]]) {
      if (amount === 0) continue;
      const send = this.context.createGain(); send.gain.value = amount;
      panner.connect(send); send.connect(input); sends.push(send);
    }
    let stopped = false;
    const record = {voice, when, velocity, source, gain, sends, end:when + buffer.duration, chokeAt:Infinity, chokeEnd:Infinity};
    const cleanup = () => {
      stopped = true; source.disconnect(); gain.disconnect(); panner.disconnect();
      for (const send of sends) send.disconnect();
      this.active.delete(handle); this._playbacks.delete(handle); this._refreshChokes();
    };
    const handle = { voice, when, stop: () => {
      if (stopped) return; stopped = true;
      const now = this.context.currentTime;
      const current = now < record.chokeAt ? velocity : velocity * Math.max(0, (record.chokeEnd - now) / Math.max(.000001, record.chokeEnd - record.chokeAt));
      gain.gain.cancelScheduledValues(now); gain.gain.setValueAtTime(current, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.005); source.stop(now + 0.006);
      this.active.delete(handle); this._playbacks.delete(handle); this._refreshChokes();
    } };
    source.onended = cleanup; this.active.add(handle); this._playbacks.set(handle, record);
    source.start(when); this._refreshChokes();
    return handle;
  }
  stopAll() { this._assert(); for (const h of [...this.active]) h.stop(); this.clearEffects(); }
  async dispose() {
    if (this.disposed) return;
    this.stopAll(); this.disposed = true; this.cache.clear(); this.output.disconnect();
    if (this.ownsContext && this.context.state !== 'closed') await this.context.close();
  }
}
function resolveOverride(params = {}) { object(params, 'params'); return params; }
export default DrumSynth;
