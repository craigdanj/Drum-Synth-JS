# Changelog

## 1.1.0 — 2026-10-02

- Added independent delay and reverb sends to every voice, with shared filtered feedback delay and generated stereo convolution reverb.
- Added eight global effect controls, bypass, tail clearing, and typed getEffects/setEffects/clearEffects APIs.
- Added explained demo controls, Try space audition settings, Dry kit, and effect settings in preset JSON. WAV exports are explicitly labeled dry.
- Preserved dry synthesis output and avoided duplicate cached samples when only sends change.
- Added effects routing, validation, impulse-response, bypass, choking, and cleanup tests.

## 1.0.0 — 2026-10-01

- Added an All 8 groove demo pattern featuring every instrument, loaded on opening with a dedicated reload button and optional intensity dynamics.

- Released as Drum Synth JS, with the `drum-synth-js` package, `DrumSynth` class, and `drum-synth.js` entry point.

- Added bodyWaveform (sine/triangle/square/saw), bodyPulseWidth, and bodyWaveformMix for tonal voices, with harmonic limiting and exact sine/bypass compatibility.
- Added demo explanations, conditional waveform controls, TypeScript declarations, and usage notes.
- Retuned 19 voices across Electro / FM, Retro Arcade, Industrial, Deep / Dub, and Soft / Dusty, and regenerated WAVs.

- Added Deep / Dub, Retro Arcade, and Soft / Dusty kits with 24 new WAV samples and typed preset exports.
- Expanded the demo to eight kits, opening on Deep / Dub, with existing editing, intensity, choking, and export controls.

- Added Electro / FM, Minimal, and Industrial kits with 24 new WAV samples and TypeScript declarations for kit exports.
- Expanded demo to five kits with independent editing, reset, descriptions, and existing export/sequencer controls.

- Enabled tuned FM on kick, snare, tom, rim, and cowbell in both current kits and regenerated those samples.

- Added decaying FM depth, ratio, and decay for tonal drum bodies, with demo controls and usage notes.
- FM defaults to off and preserves current kit audio exactly.

- Added three independently tuned and enveloped body resonances for kicks, snares, toms, rims, and cowbells.
- Retuned those voices in both current kits, regenerated samples, and added explanations in the demo and README.

- Added noise/tonal/blended transient character with independent noise tone, knock frequency, and blend amount.
- Retuned current kit impacts and added conditional demo controls and usage explanations.

- Added independent noise and metallic low-pass envelopes with signed octave amounts and decay controls.
- Retuned current kits for evolving brightness and regenerated WAV examples.

- Added brightness/transient velocity response and enabled it in current demo kits.
- Added Hit strength audition/export control and per-step soft/normal/accent velocities. Full-strength samples remain unchanged.

- Added scheduled hi-hat choking, enabled by default with a configurable 5 ms fade, plus demo controls.
- Added cancellation-aware handling for pending closures and out-of-order hits. Single-hit WAVs are unchanged.

- Added richer odd-harmonic hat synthesis, metallic balance, detuning, damping, and independent metal filters.
- Retuned both kits’ open and closed hats and added a hat-only Metallic source section.

- Redesigned clap noise as independent bursts and wash, with six clap-only controls and seeded variation.
- Retuned both current clap presets; regenerated samples and added clap structure UI.

- Added semitone pitch sweeps, pitch curves, independent noise high/low-pass filters, and low-pass resonance.
- Retuned current demo kits and regenerated their WAV samples; preserved legacy parameter mappings.

- Simplified demo to the two refined kits; removed previous-kit options, A/B controls, and comparison notes.

- Added refined versions of both kits, 16 additional WAV samples, A/B audition controls, and per-voice refinement notes. Previous kits remain unchanged.

- Added seven independent body, noise, and transient controls, typed API support, grouped demo controls, and legacy macro compatibility.
- Verified unchanged PCM for all 16 kit defaults; added layer isolation, duration, validation, and playback compatibility tests.

- Added an 808-inspired preset pack and demo kit selector, with independent edits and pack-aware reset/export.
- Added a portable standalone demo and eight 808-inspired WAV examples.

### Initial implementation

- Initial eight-voice percussion synthesizer and deterministic PCM renderer.
- Configurable envelopes, pitch, noise, brightness, transient and saturation.
- Browser playback with velocity, panning, scheduling, caching and cleanup.
- WAV export, TypeScript declarations, interactive sequencer demo and tests.
