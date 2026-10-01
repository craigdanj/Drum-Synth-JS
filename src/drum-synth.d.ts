export type Voice = 'kick' | 'snare' | 'clap' | 'closedHat' | 'openHat' | 'tom' | 'rim' | 'cowbell';
export type BodyWaveform = 'sine' | 'triangle' | 'square' | 'saw';
export const BODY_WAVEFORMS: readonly BodyWaveform[];
export const BODY_WAVEFORM_VOICES: readonly Voice[];
export type TransientType = 'noise' | 'tonal' | 'blend';
export const TRANSIENT_TYPES: readonly TransientType[];
export const RESONANCE_VOICES: readonly Voice[];
export const FM_VOICES: readonly Voice[];
export interface Params { bodyWaveform: BodyWaveform; bodyPulseWidth: number; bodyWaveformMix: number; fmDepth: number; fmRatio: number; fmDecay: number; resonance1Ratio: number; resonance1Level: number; resonance1Decay: number; resonance2Ratio: number; resonance2Level: number; resonance2Decay: number; resonance3Ratio: number; resonance3Level: number; resonance3Decay: number; transientType: TransientType; transientTone: number; transientFrequency: number; transientMix: number; noiseFilterEnvAmount: number; noiseFilterEnvDecay: number; metalFilterEnvAmount: number; metalFilterEnvDecay: number; velocityToBrightness: number; velocityToTransient: number; metalMix: number; metalDetune: number; metalDamping: number; metalHighpass: number; metalLowpass: number; burstCount: number; burstSpacing: number; burstDecay: number; tailLevel: number; tailDecay: number; burstVariation: number; pitchSweepSemitones: number; pitchCurve: number; noiseHighpass: number; noiseLowpass: number; noiseResonance: number; bodyLevel: number; bodyDecay: number; noiseLevel: number; noiseAttack: number; noiseDecay: number; transientLevel: number; transientDecay: number; frequency: number; decay: number; attack: number; pitchDrop: number; pitchDecay: number; tone: number; noise: number; snap: number; drive: number; volume: number; seed: number; }
export interface RenderedAudio { samples: Float32Array; sampleRate: number; duration: number; }
export interface TriggerOptions { when?: number; velocity?: number; pan?: number; params?: Partial<Params>; }
export interface VoiceHandle { readonly voice: Voice; readonly when: number; stop(): void; }
export const PARAMS: Readonly<Record<Exclude<keyof Params, 'transientType' | 'bodyWaveform'>, readonly [number, number, number]>>;
export const PRESETS: Readonly<Record<Voice, Readonly<Params>>>;
export function resolveParams(voice: Voice, overrides?: Partial<Params>): Params;
export function render(voice: Voice, overrides?: Partial<Params>, options?: { sampleRate?: number; velocity?: number }): RenderedAudio;
export function encodeWav(audio: { samples: Float32Array; sampleRate: number }): ArrayBuffer;
export class DrumSynth {
  constructor(options?: { context?: AudioContext; destination?: AudioNode; volume?: number; maxVoices?: number; chokeEnabled?: boolean; chokeFade?: number });
  readonly context: AudioContext;
  readonly output: GainNode;
  resume(): Promise<void>;
  setVolume(volume: number): this;
  setChoke(options?: { chokeEnabled?: boolean; chokeFade?: number }): this;
  readonly chokeEnabled: boolean;
  readonly chokeFade: number;
  configure(voice: Voice, params: Partial<Params>): this;
  getParams(voice: Voice): Params;
  trigger(voice: Voice, options?: TriggerOptions): VoiceHandle;
  stopAll(): void;
  dispose(): Promise<void>;
}
export default DrumSynth;
