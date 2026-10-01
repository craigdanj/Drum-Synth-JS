# Drum Forge JS

A small, dependency-free JavaScript drum synthesizer. Design percussion, play it with Web Audio, and export the same sound as a WAV file. No recordings, audio assets, build step, or runtime dependencies required.

## Included

- Eight voices: kick, snare, clap, closed/open hi-hats, tom, rim and cowbell.
- Pitch, pitch envelope, attack, decay, brightness, noise, transient, drive and level controls.
- Seeded noise for reproducible samples; mono floating-point PCM and 16-bit WAV export.
- Audio-clock scheduling, velocity, stereo panning, polyphony limits and cleanup.
- Responsive demo with keyboard pads, waveform, sound designer and 16-step sequencer.
- ES module, TypeScript declarations, automated tests, CI and an MIT license.

These are stylized electronic percussion voices, not acoustic drum emulations.

## Run the demo

Use Node.js 20 or later. No `npm install` is necessary.

```sh
npm start
# Open http://localhost:8080
```

Click **Enable audio**, then play the pads. A/S/D/F/G/H/J/K trigger voices; Space toggles the sequencer when focus is outside a form control. Choose a pad to edit its sound. Export WAV downloads a mono 44.1 kHz sample; Save preset downloads its parameters as JSON. The demo pauses when the tab is hidden.

Serve the repository root, not just the demo folder. ES modules require HTTP; do not open the HTML with `file://`. The demo can also be served by GitHub Pages from the repository root at `/demo/`.

## Browser usage

Copy `src/drum-forge.js` into your project, or install a local checkout with `npm install /path/to/drum-forge-js`. The package name is a proposed name; this project has not been published to npm.

```html
<button id="kick">Play kick</button>
<script type="module">
  import { DrumForge } from './src/drum-forge.js';
  const drums = new DrumForge({ volume: 0.65 });
  drums.configure('kick', {
    frequency: 48, decay: 0.7, pitchDrop: 3.5, drive: 1.2
  });
  document.querySelector('#kick').onclick = async () => {
    await drums.resume(); // Unlock audio from a click/tap.
    drums.trigger('kick', { velocity: 0.9 });
  };
</script>
```

For bundlers, use `import { DrumForge } from 'drum-forge-js'` after installing the local package. The package is ESM-only; there is no CommonJS or global script build.

### Scheduling and routing

```js
const context = new AudioContext();
const bus = context.createGain();
bus.gain.value = 0.6;
bus.connect(context.destination);
const drums = new DrumForge({ context, destination: bus, maxVoices: 32 });
await drums.resume(); // Call from a user gesture.
const start = context.currentTime + 0.1;
drums.trigger('kick', { when: start });
drums.trigger('closedHat', { when: start + 0.25, pan: -0.2 });
const handle = drums.trigger('snare', {
  when: start + 0.5, velocity: 0.8, params: { tone: 0.75 }
});
// handle.stop(); // Cancel a future hit or fade a playing hit.
// drums.stopAll();
// await drums.dispose();
```

`when` is an absolute `AudioContext.currentTime` value in seconds. Past times play immediately. A handle's `stop()` is idempotent and fades over 5 ms. At the polyphony limit, the oldest scheduled/playing voice is stopped. No automatic hi-hat choking is applied; keep and stop the open-hat handle if you want that behavior. Use a short lookahead scheduler for a sequencer (as in the demo); background timers can be throttled.

### Export samples without a browser

```js
import { writeFile } from 'node:fs/promises';
import { render, encodeWav } from './src/drum-forge.js';
const audio = render('snare', { decay: 0.32, noise: 0.85, seed: 123 }, {
  sampleRate: 48000, velocity: 0.9
});
await writeFile('snare.wav', Buffer.from(encodeWav(audio)));
```

```sh
npm run samples  # Generate all eight default WAVs in samples/
```

`render()` is synchronous and returns `{ samples: Float32Array, sampleRate, duration }`. It requires no AudioContext and works in Node or a worker. Identical inputs reproduce the same noise sequence; floating-point results may differ slightly across JS engines. `encodeWav()` returns an `ArrayBuffer` with a mono, little-endian, 16-bit PCM WAV. It clips values outside [-1, 1] and rejects nonfinite samples.

## Parameters

All parameter objects reject unknown keys, nonfinite values and out-of-range values. `PRESETS` exposes frozen defaults; `resolveParams(voice, overrides)` returns a validated copy. `PARAMS` exposes `[minimum, maximum, UI step]` triples. UI steps are guidance, not quantization constraints, except `seed` must be an integer.

| Parameter | Range | Meaning |
|---|---|---|
| `frequency` | 25–4000 Hz | Base tonal frequency; metallic partials vary by voice |
| `decay` | 0.03–3 s | Envelope time to approximately -60 dB after attack |
| `attack` | 0.0005–0.1 s | Envelope fade-in |
| `pitchDrop` | 0–8 | Initial extra frequency multiplier; start = frequency × (1 + pitchDrop) |
| `pitchDecay` | 0.005–0.5 s | Pitch sweep time constant |
| `tone` | 0–1 | Noise brightness; also changes kick/cowbell harmonics |
| `noise` | 0–1 | Tonal body to filtered-noise blend |
| `snap` | 0–1 | Independent short noise transient amount |
| `drive` | 0–10 | Soft-saturation intensity |
| `volume` | 0–1 | Per-voice output gain |
| `seed` | 1–4294967295 | Integer noise seed |

The transient has its own short envelope, so it remains audible with a long body attack. Clap layers four delayed envelopes. Render length is attack + decay + 15 ms (plus 36 ms for clap), with a final fade. Changing brightness on a pure tonal voice may have little effect; parameters act on the components actually present in that voice.

## API

| Method / option | Behavior |
|---|---|
| `new DrumForge({ context?, destination?, volume?, maxVoices? })` | Creates playback engine. Master volume defaults to 0.7; maxVoices to 32 (integer 1–128). Destination must belong to the context. |
| `resume()` | Unlock/resume the context; call within a user gesture. |
| `configure(voice, partialParams)` | Merge changes into a voice; returns the engine. |
| `getParams(voice)` | Return a copy of the current voice parameters. |
| `trigger(voice, { when?, velocity?, pan?, params? })` | Schedule hit; returns `{ voice, when, stop() }`. Velocity 0–1; pan -1–1. Overrides affect only this hit. |
| `setVolume(0…1)` | Smoothly change master gain; returns engine. |
| `stopAll()` | Stop all active and future scheduled hits. |
| `dispose()` | Stop hits, clear cache, disconnect output, close only an internally created context. Idempotent promise. |
| `render(voice, params?, { sampleRate?, velocity? })` | Render mono PCM. Sample rate integer 8000–96000 (default 44100); velocity 0–1 (default 1). |
| `encodeWav({ samples, sampleRate })` | Encode mono 16-bit WAV; samples must be a nonempty Float32Array. |

`context` and `output` are exposed for clock access and routing. Internal buffers are cached (up to 64 parameter combinations). Master gain and pan affect playback only, not exported samples. Keep master gain conservative when layering voices: the output bus does not include a limiter.

## Design and limits

The renderer combines integrated sine oscillators, inharmonic partials, filtered seeded noise, exponential envelopes, DC blocking and soft saturation. Playback uses AudioBufferSourceNode → GainNode → StereoPannerNode → master GainNode. This follows the [Web Audio API](https://www.w3.org/TR/webaudio/) scheduling model.

Samples are generated on the calling thread and cached during playback. Rendering many long sounds or changing parameters every hit can block the UI: pre-render in a worker for heavier workloads. This is not a continuously modulated AudioWorklet synthesizer. Changes apply to subsequent hits. Extreme pitches/drive, especially at low sample rates, can alias; this version does not oversample. No effects chain, MIDI input, sample loading or acoustic modeling is included.

Browser playback requires AudioContext and StereoPannerNode; use a current Chrome, Firefox, Edge or Safari. Automated validation includes Node DSP and mocked playback tests. A browser executable could not be installed in the creation environment, so browser playback, visual layout and physical audio output still need manual checks.

## Development

```sh
npm test          # DSP, validation, WAV and playback lifecycle tests
npm run check     # JavaScript syntax checks
npm pack --dry-run
```

Tests use Node's built-in runner. Playback unit tests use a mock context; synthesis tests check all voice outputs, parameter extremes, deterministic noise, velocity, envelope tails and WAV bytes. No npm dependencies or generated lockfile are needed. CI runs Node 20 and 22.

```text
src/                 Engine + TypeScript declarations
demo/                Interactive sound designer and sequencer
scripts/             Local server and batch sample exporter
test/                Automated tests
samples/             Generated WAV examples (in downloadable archive)
.github/             CI, issue templates and pull request template
```

Before publishing to npm, check name availability and add your GitHub repository URL to `package.json`. This archive is ready to commit to a new GitHub repository; it does not create or publish one automatically.

## License

MIT © 2026 Craig Johnson. Generated audio is yours to use; no source recordings are included.

## 808-inspired sound pack

The demo opens with **808-inspired** selected at 96 BPM. Press **Play groove** or tap individual pads to hear it. Choose **808-inspired** or **Drum Forge** from the pack selector; edits are retained separately for each kit during the session. Reset voice restores the selected pack's settings. WAV and preset exports include your active pack and edits.

This is a preset-based interpretation using the existing eight synthesis algorithms, not a circuit-accurate TR-808 emulation. It includes kick, snare, clap, closed/open hats, low tom, rim, and cowbell. No recordings are required. The engine API and original defaults remain unchanged.

Import `KIT_808` from `./src/kits.js` and use `drums.trigger('kick', { params: KIT_808.kick })`. Run `npm run samples` to render both packs. Run `node scripts/build-demo.mjs` to create `demo/standalone.html`, which you can open directly in a browser without a server.

## Independent sound layers

The demo groups the new controls under Body, Noise, and Transient. Each level ranges from 0 to 1; set it to zero to mute that layer. Levels are independent, not a crossfade. All layers pass through the existing shared DC blocker and saturation, so their combined level also affects drive character.

| Parameter | Range | Meaning |
|---|---|---|
| `bodyLevel` | 0–1 | Tonal component level |
| `bodyDecay` | 0.03–3 seconds | Body envelope decay to approximately -60 dB after attack |
| `noiseLevel` | 0–1 | Noise component level |
| `noiseAttack` | 0.0005–0.1 seconds | Noise envelope attack |
| `noiseDecay` | 0.03–3 seconds | Noise envelope decay to approximately -60 dB after attack |
| `transientLevel` | 0–1 | Initial noise-click level |
| `transientDecay` | 0.001–0.3 seconds | Transient exponential decay time to approximately -60 dB from onset |

`attack` remains the body attack. The transient retains its original 0.5 ms onset ramp. Clap body and noise retain their four-burst structure, now with separate envelopes. Render duration follows the longest enabled layer, including clap bursts and the final fade; muted layers do not lengthen the sample.

Example: short snare body with a longer rattle:

```js
drums.trigger('snare', { params: {
  bodyLevel: 0.4, bodyDecay: 0.12,
  noiseLevel: 0.7, noiseAttack: 0.002, noiseDecay: 0.6,
  transientLevel: 0.25, transientDecay: 0.012
} });
```

### Compatibility

Original and 808-inspired defaults preserve their previous rendered PCM. Old parameter-only presets continue working. The legacy `noise` macro sets `bodyLevel = 1 - noise` and `noiseLevel = noise`; `decay` sets both body/noise decay; `snap` sets transient level; `attack` also sets noise attack unless an explicit `noiseAttack` is supplied. Explicit layer values in the same call take priority. This applies to `render`, `resolveParams`, `configure`, and per-hit `trigger` parameters. Macro fields are retained for compatibility and are not recalculated from independent layer edits. When overriding a fully resolved preset object, change its explicit layer fields, or use a partial macro update through `configure`.

The demo exposes the independent controls in place of Noise mix, shared Decay, and Transient amount. Reset restores the active pack's voice. Exported JSON includes all seven new values.

## Demo sound packs

The demo offers two kits: **808-inspired** and **Drum Forge**, both using the refined layer presets. Tap a pad to audition and edit it, or press **Play groove**. Switching packs restarts a playing groove with the same pattern and tempo. Edits are retained separately for each kit; **Reset voice** restores the selected kit’s preset.

`KIT_ORIGINAL_REFINED` and `KIT_808_REFINED` are exported from `src/kits.js`. Their WAVs are in `samples/original-refined/` and `samples/808-refined/`. Earlier presets remain available in the plugin API for compatibility but are no longer offered in the demo.

## Pitch shaping and independent noise filters

| Parameter | Range | Meaning |
|---|---|---|
| `pitchSweepSemitones` | -48 to +48 st | Starting pitch offset from `frequency`; positive falls, negative rises, zero stays fixed |
| `pitchCurve` | 0.25–4 | Shape of pitch settling; 1 retains the original exponential shape |
| `noiseHighpass` | 0–18000 Hz | Noise high-pass cutoff; 0 bypasses this stage |
| `noiseLowpass` | 20–20000 Hz | Noise low-pass cutoff |
| `noiseResonance` | 0–1 | Adds emphasis around the **low-pass** cutoff, independent of the high-pass |

The pitch envelope is defined in frequency-ratio space:

`frequencyAtTime = frequency * (1 + (2 ** (pitchSweepSemitones / 12) - 1) * exp(-(time / pitchDecay) ** pitchCurve))`

`pitchDecay` is the time at which the frequency offset reaches 1/e of its starting value. Curves above 1 hold the offset more initially and settle faster after that point; curves below 1 start moving faster but settle more gradually. Frequency is capped at 0.18 times the sample rate, as before; extreme sweeps may hit that ceiling. This is not an anti-aliased oscillator redesign.

Noise passes through a low-pass stage then the high-pass stage before its amplitude envelope. Resonance smoothly blends the original one-pole low-pass into a two-pole resonant low-pass whose Q increases from approximately 0.707 to 8.007. At zero resonance, the original low-pass behavior is retained. Cutoffs are internally capped at 0.4 times the render sample rate for stable low-rate rendering. High-pass can exceed low-pass; this heavily attenuates the noise rather than throwing an error. Resonance can increase perceived loudness.

These filters affect only the noise layer, not the body or the separate transient. If `noiseLevel` is zero, noise-filter changes are inaudible. Likewise, `pitchCurve` has no audible effect when the pitch sweep is zero.

### Updated demo kits

Both current kits use explicit pitch and noise-filter settings: kicks use shaped pitch settling, snares and claps use focused noise bands with modest resonance, hats use higher noise high-pass cutoffs, and toms use defined semitone bends. Some noise-free voices retain their sound because noise-filter settings do not affect them. The demo still offers only **808-inspired** and **Drum Forge**; no old/new comparison controls were added. Regenerated WAVs are included in each refined sample folder.

### Legacy mapping

`pitchDrop` remains supported and maps to `pitchSweepSemitones = 12 * log2(1 + pitchDrop)`. The legacy `tone` macro still maps noise low-pass to `500 + tone * 14500` Hz. Explicit new parameters in the same call win. These mappings also apply to partial `configure()` and per-hit `trigger()` overrides. The demo edits complete resolved presets, so its **Body tone** slider and **Noise filter** section operate independently. Earlier API presets retain their previous default sound; the current demo kits are intentionally retuned.

```js
drums.trigger('snare', {params: {
  pitchSweepSemitones: 2,
  pitchCurve: 1.25,
  noiseHighpass: 1300,
  noiseLowpass: 8500,
  noiseResonance: 0.18
}});
```
