/** Drum Forge JS — deterministic percussion synthesis. MIT License. */
export const PARAMS = Object.freeze({
  frequency: [25, 4000, 1], decay: [0.03, 3, 0.01], attack: [0.0005, 0.1, 0.0005],
  pitchDrop: [0, 8, 0.05], pitchDecay: [0.005, 0.5, 0.005], tone: [0, 1, 0.01],
  pitchSweepSemitones: [-48, 48, .1], pitchCurve: [.25, 4, .05],
  noiseHighpass: [0, 18000, 10], noiseLowpass: [20, 20000, 10], noiseResonance: [0, 1, .01],
  noise: [0, 1, 0.01], snap: [0, 1, 0.01], drive: [0, 10, 0.1],
  bodyLevel: [0, 1, 0.01], bodyDecay: [0.03, 3, 0.01],
  noiseLevel: [0, 1, 0.01], noiseAttack: [0.0005, 0.1, 0.0005], noiseDecay: [0.03, 3, 0.01],
  transientLevel: [0, 1, 0.01], transientDecay: [0.001, 0.3, 0.001],
  volume: [0, 1, 0.01], seed: [1, 4294967295, 1]
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
  layer('transientLevel', 'snap', p.snap);
  if (p.transientDecay === undefined) p.transientDecay = 6.907755 * .003;
  return p;
}
export function resolveParams(voice, overrides = {}) {
  if (!Object.hasOwn(PRESETS, voice)) throw new TypeError(`Unknown voice: ${voice}`);
  object(overrides, 'parameters'); keys(overrides, Object.keys(PARAMS));
  const params = mergeParams(PRESETS[voice], overrides);
  for (const [key, [min, max]] of Object.entries(PARAMS)) number(params[key], min, max, key);
  if (!Number.isInteger(params.seed)) throw new RangeError('seed must be an integer');
  return params;
}

/** Render mono PCM. Layer decay times reach roughly -60 dB; see README for onset semantics. */
export function render(voice, overrides = {}, options = {}) {
  const p = resolveParams(voice, overrides);
  object(options, 'render options'); keys(options, ['sampleRate', 'velocity']);
  const sampleRate = number(options.sampleRate ?? 44100, 8000, 96000, 'sampleRate');
  if (!Number.isInteger(sampleRate)) throw new RangeError('sampleRate must be an integer');
  const velocity = number(options.velocity ?? 1, 0, 1, 'velocity');
  const burstTail = voice === 'clap' ? 0.036 : 0;
  const duration = Math.max(p.bodyLevel > 0 ? p.attack + p.bodyDecay + burstTail : 0,
    p.noiseLevel > 0 ? p.noiseAttack + p.noiseDecay + burstTail : 0,
    p.transientLevel > 0 ? p.transientDecay : 0, .03) + .015;
  const samples = new Float32Array(Math.ceil(duration * sampleRate));
  let seed = p.seed >>> 0, phase = 0, low = 0, bodyLow = 0, dcIn = 0, dcOut = 0;
  const cutoff = Math.min(sampleRate * 0.4, p.noiseLowpass);
  const alpha = 1 - Math.exp(-TAU * cutoff / sampleRate);
  const hpAlpha = 1 - Math.exp(-TAU * Math.min(sampleRate * .4, p.noiseHighpass) / sampleRate);
  // Parallel resonant low-pass, blended with the original one-pole at zero resonance.
  const w = TAU * cutoff / sampleRate, c = Math.cos(w), q = .70710678 + 7.3 * p.noiseResonance;
  const a = Math.sin(w) / (2 * q), a0 = 1 + a;
  const b0 = (1 - c) / 2 / a0, b1 = (1 - c) / a0, b2 = b0;
  const a1 = -2 * c / a0, a2 = (1 - a) / a0;
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  const sweepRatio = 2 ** (p.pitchSweepSemitones / 12) - 1;
  const sine = (mult) => Math.sin(phase * mult);
  const env = (t, attack, decay) => t < 0 ? 0 : Math.min(1, t / attack) * Math.exp(-6.907755 * Math.max(0, t - attack) / decay);
  const layerEnv = (t, attack, decay) => voice === 'clap'
    ? (env(t, attack, decay) + .8 * env(t - .012, attack, decay) + .65 * env(t - .024, attack, decay) + env(t - .036, attack, decay)) / 2
    : env(t, attack, decay);
  for (let i = 0; i < samples.length; i++) {
    const t = i / sampleRate;
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
    let body, noise = brightNoise;
    switch (voice) {
      case 'kick': body = sine(1) + p.tone * 0.18 * sine(2); break;
      case 'tom': body = 0.8 * sine(1) + 0.2 * sine(1.5); break;
      case 'snare': body = 0.65 * sine(1) + 0.35 * sine(1.47); break;
      case 'clap':
        body = 0.25 * sine(1);
        break;
      case 'rim': body = (sine(1) + sine(2.37) * 0.7 + sine(3.1) * 0.3) / 2; break;
      case 'cowbell': body = (sine(1) + sine(1.48) + p.tone * 0.3 * (sine(3) + sine(4.44))) / 2.6; break;
      default: body = [1, 1.342, 1.79, 2.13, 2.67, 3.17].reduce((sum, m) => sum + sine(m), 0) / 3;
    }
    const transient = white * p.transientLevel * Math.exp(-6.907755 * t / p.transientDecay) * Math.min(1, t / 0.0005);
    let value = p.bodyLevel * body * layerEnv(t, p.attack, p.bodyDecay) + p.noiseLevel * noise * layerEnv(t, p.noiseAttack, p.noiseDecay) + transient;
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

export class DrumForge {
  constructor(options = {}) {
    object(options, 'options'); keys(options, ['context', 'destination', 'volume', 'maxVoices']);
    const volume = number(options.volume ?? 0.7, 0, 1, 'volume');
    this.maxVoices = number(options.maxVoices ?? 32, 1, 128, 'maxVoices');
    if (!Number.isInteger(this.maxVoices)) throw new RangeError('maxVoices must be an integer');
    const AudioContext = globalThis.AudioContext || globalThis.webkitAudioContext;
    if (!options.context && !AudioContext) throw new Error('Web Audio is unavailable; use render() in Node.js');
    this.context = options.context ?? new AudioContext();
    this.ownsContext = !options.context; this.disposed = false; this.active = new Set();
    this.output = this.context.createGain(); this.output.gain.value = volume;
    this.output.connect(options.destination ?? this.context.destination);
    this.kit = Object.fromEntries(Object.entries(PRESETS).map(([k, v]) => [k, { ...v }]));
    this.cache = new Map();
  }
  _assert() { if (this.disposed) throw new Error('DrumForge has been disposed'); }
  async resume() { this._assert(); if (this.context.state === 'suspended') await this.context.resume(); }
  setVolume(value) {
    this._assert(); number(value, 0, 1, 'volume');
    this.output.gain.setTargetAtTime(value, this.context.currentTime, 0.01); return this;
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
    const key = JSON.stringify([voice, p]);
    let buffer = this.cache.get(key);
    if (!buffer) {
      const audio = render(voice, p, { sampleRate: this.context.sampleRate });
      buffer = this.context.createBuffer(1, audio.samples.length, audio.sampleRate);
      buffer.copyToChannel(audio.samples, 0);
      if (this.cache.size >= 64) this.cache.delete(this.cache.keys().next().value);
      this.cache.set(key, buffer);
    }
    while (this.active.size >= this.maxVoices) this.active.values().next().value.stop();
    const source = this.context.createBufferSource(), gain = this.context.createGain(), panner = this.context.createStereoPanner();
    source.buffer = buffer; gain.gain.value = velocity; panner.pan.value = pan;
    source.connect(gain); gain.connect(panner); panner.connect(this.output);
    let stopped = false;
    const cleanup = () => { source.disconnect(); gain.disconnect(); panner.disconnect(); this.active.delete(handle); };
    const handle = { voice, when, stop: () => {
      if (stopped) return; stopped = true;
      const now = this.context.currentTime;
      gain.gain.cancelScheduledValues(now); gain.gain.setValueAtTime(gain.gain.value, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.005); source.stop(now + 0.006);
      this.active.delete(handle);
    } };
    source.onended = cleanup; this.active.add(handle); source.start(when);
    return handle;
  }
  stopAll() { this._assert(); for (const h of [...this.active]) h.stop(); }
  async dispose() {
    if (this.disposed) return;
    this.stopAll(); this.disposed = true; this.cache.clear(); this.output.disconnect();
    if (this.ownsContext && this.context.state !== 'closed') await this.context.close();
  }
}
function resolveOverride(params = {}) { object(params, 'params'); return params; }
export default DrumForge;
