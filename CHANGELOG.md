## Unreleased

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

# Changelog

## 0.1.0 — 2026-09-30

- Initial eight-voice percussion synthesizer and deterministic PCM renderer.
- Configurable envelopes, pitch, noise, brightness, transient and saturation.
- Browser playback with velocity, panning, scheduling, caching and cleanup.
- WAV export, TypeScript declarations, interactive sequencer demo and tests.
