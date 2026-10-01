export type Voice = 'kick' | 'snare' | 'clap' | 'closedHat' | 'openHat' | 'tom' | 'rim' | 'cowbell';
export interface Params { burstCount: number; burstSpacing: number; burstDecay: number; tailLevel: number; tailDecay: number; burstVariation: number; pitchSweepSemitones: number; pitchCurve: number; noiseHighpass: number; noiseLowpass: number; noiseResonance: number; bodyLevel: number; bodyDecay: number; noiseLevel: number; noiseAttack: number; noiseDecay: number; transientLevel: number; transientDecay: number; frequency: number; decay: number; attack: number; pitchDrop: number; pitchDecay: number; tone: number; noise: number; snap: number; drive: number; volume: number; seed: number; }
export interface RenderedAudio { samples: Float32Array; sampleRate: number; duration: number; }
export interface TriggerOptions { when?: number; velocity?: number; pan?: number; params?: Partial<Params>; }
export interface VoiceHandle { readonly voice: Voice; readonly when: number; stop(): void; }
export const PARAMS: Readonly<Record<keyof Params, readonly [number, number, number]>>;
export const PRESETS: Readonly<Record<Voice, Readonly<Params>>>;
export function resolveParams(voice: Voice, overrides?: Partial<Params>): Params;
export function render(voice: Voice, overrides?: Partial<Params>, options?: { sampleRate?: number; velocity?: number }): RenderedAudio;
export function encodeWav(audio: { samples: Float32Array; sampleRate: number }): ArrayBuffer;
export class DrumForge {
  constructor(options?: { context?: AudioContext; destination?: AudioNode; volume?: number; maxVoices?: number });
  readonly context: AudioContext;
  readonly output: GainNode;
  resume(): Promise<void>;
  setVolume(volume: number): this;
  configure(voice: Voice, params: Partial<Params>): this;
  getParams(voice: Voice): Params;
  trigger(voice: Voice, options?: TriggerOptions): VoiceHandle;
  stopAll(): void;
  dispose(): Promise<void>;
}
export default DrumForge;
