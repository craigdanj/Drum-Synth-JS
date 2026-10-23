# Drum Synth JS

Version **1.4.0**.

A small, dependency-free JavaScript drum synthesizer. Design percussion, play it with Web Audio, and export the same sound as a WAV file. No recordings, audio assets, build step, or runtime dependencies required.

## Included

- Thirteen example kits, including two Indian packs plus West African, Middle Eastern, and Latin percussion, with named sounds and dedicated grooves.
- Eight compatible voice slots: kick, snare, clap, closed/open hi-hats, tom, rim and cowbell.
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

The demo opens with **West African Percussion** and a one-bar audition pattern using all eight sounds. Press **Play groove** to hear it. The **All 8 groove** button reloads it; **Starter beat** loads the simpler pattern. Kit switching keeps the pattern and tempo. Enable **Use intensity** for the sample groove’s accents and ghost hits; when unchecked, all enabled steps play at 100% intensity.

Click **Enable audio**, then play the pads. A/S/D/F/G/H/J/K trigger voices; Space toggles the sequencer when focus is outside a form control. Choose a pad to edit its sound. Export dry WAV downloads a mono 44.1 kHz sample without playback effects; Save preset downloads the voice parameters, sends, and shared effect settings as JSON. The demo pauses when the tab is hidden.

Serve the repository root, not just the demo folder. ES modules require HTTP; do not open the HTML with `file://`. The demo can also be served by GitHub Pages from the repository root at `/demo/`.

## Browser usage

Copy `src/drum-synth.js` into your project, or install a local checkout with `npm install /path/to/drum-synth-js`. The package name is a proposed name; this project has not been published to npm.

```html
<button id="kick">Play kick</button>
<script type="module">
  import { DrumSynth } from './src/drum-synth.js';
  const drums = new DrumSynth({ volume: 0.65 });
  drums.configure('kick', {
    frequency: 48, decay: 0.7, pitchDrop: 3.5, drive: 1.2
  });
  document.querySelector('#kick').onclick = async () => {
    await drums.resume(); // Unlock audio from a click/tap.
    drums.trigger('kick', { velocity: 0.9 });
  };
</script>
```

For bundlers, use `import { DrumSynth } from 'drum-synth-js'` after installing the local package. The package is ESM-only; there is no CommonJS or global script build.

### Scheduling and routing

```js
const context = new AudioContext();
const bus = context.createGain();
bus.gain.value = 0.6;
bus.connect(context.destination);
const drums = new DrumSynth({ context, destination: bus, maxVoices: 32 });
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

`when` is an absolute `AudioContext.currentTime` value in seconds. Past times play immediately. A handle's `stop()` is idempotent and fades over 5 ms. At the polyphony limit, the oldest scheduled/playing voice is stopped. Hi-hat choking is enabled by default with a configurable fade. Existing delay/reverb tails can ring after the dry hat is choked. Use a short lookahead scheduler for a sequencer (as in the demo); background timers can be throttled.

### Export samples without a browser

```js
import { writeFile } from 'node:fs/promises';
import { render, encodeWav } from './src/drum-synth.js';
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
| `new DrumSynth({ context?, destination?, volume?, maxVoices?, chokeEnabled?, chokeFade?, effects? })` | Creates playback engine. Master volume defaults to 0.7; maxVoices to 32 (integer 1–128). Destination must belong to the context. |
| `resume()` | Unlock/resume the context; call within a user gesture. |
| `configure(voice, partialParams)` | Merge changes into a voice; returns the engine. |
| `getParams(voice)` | Return a copy of the current voice parameters. |
| `trigger(voice, { when?, velocity?, pan?, params? })` | Schedule hit; returns `{ voice, when, stop() }`. Velocity 0–1; pan -1–1. Overrides affect only this hit. |
| `setVolume(0…1)` | Smoothly change master gain; returns engine. |
| `getEffects()` / `setEffects(partialSettings)` | Read a copy of, or merge validated updates into, the shared effect settings. |
| `clearEffects()` | Clear both wet tails; future trigger calls can feed fresh effects. |
| `stopAll()` | Stop all active and future scheduled hits and clear effect tails. |
| `dispose()` | Stop hits, clear cache, disconnect output, close only an internally created context. Idempotent promise. |
| `render(voice, params?, { sampleRate?, velocity? })` | Render mono PCM. Sample rate integer 8000–96000 (default 44100); velocity 0–1 (default 1). |
| `encodeWav({ samples, sampleRate })` | Encode mono 16-bit WAV; samples must be a nonempty Float32Array. |

`context` and `output` are exposed for clock access and routing. Internal buffers are cached (up to 64 parameter combinations). Master gain, pan, and delay/reverb sends affect playback only, not exported samples. Keep master gain conservative when layering voices: the output bus does not include a limiter.

## Design and limits

The renderer combines integrated sine oscillators, inharmonic partials, filtered seeded noise, exponential envelopes, DC blocking and soft saturation. Dry playback uses AudioBufferSourceNode → GainNode → StereoPannerNode → master GainNode. Per-hit send gains branch after the panner to shared delay and reverb buses; their returns also feed the master gain. This follows the [Web Audio API](https://www.w3.org/TR/webaudio/) scheduling model.

Samples are generated on the calling thread and cached during playback. Rendering many long sounds or changing parameters every hit can block the UI: pre-render in a worker for heavier workloads. This is not a continuously modulated AudioWorklet synthesizer. Changes apply to subsequent hits. Extreme pitches/drive, especially at low sample rates, can alias; this version does not oversample. Shared delay and reverb sends are available for Web Audio playback. MIDI input, sample loading, and acoustic modeling are not included.

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

The demo opens with **West African Percussion** selected at 112 BPM. Press **Play groove** or tap individual pads to hear it. Choose any of the thirteen kits from the pack selector; edits are retained separately for each kit during the session. Reset voice restores the selected pack's settings. WAV and preset exports include your active pack and edits.

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

`attack` remains the body attack. The transient retains its original 0.5 ms onset ramp. Claps use the dedicated burst-and-tail noise design described below; the tonal body has its own single envelope. Render duration follows the longest enabled layer, including clap bursts and the final fade; muted layers do not lengthen the sample.

Example: short snare body with a longer rattle:

```js
drums.trigger('snare', { params: {
  bodyLevel: 0.4, bodyDecay: 0.12,
  noiseLevel: 0.7, noiseAttack: 0.002, noiseDecay: 0.6,
  transientLevel: 0.25, transientDecay: 0.012
} });
```

### Compatibility

Earlier layer and pitch/filter updates preserved default PCM; the clap and metallic-source redesigns intentionally change clap and hi-hat rendering. Old parameter-only presets continue working. The legacy `noise` macro sets `bodyLevel = 1 - noise` and `noiseLevel = noise`; `decay` sets both body/noise decay; `snap` sets transient level; `attack` also sets noise attack unless an explicit `noiseAttack` is supplied. Explicit layer values in the same call take priority. This applies to `render`, `resolveParams`, `configure`, and per-hit `trigger` parameters. Macro fields are retained for compatibility and are not recalculated from independent layer edits. When overriding a fully resolved preset object, change its explicit layer fields, or use a partial macro update through `configure`.

The demo exposes the independent controls in place of Noise mix, shared Decay, and Transient amount. Reset restores the active pack's voice. Exported JSON includes all seven new values.

## Demo sound packs

The demo offers thirteen kits: **West African Percussion**, **Middle Eastern Percussion**, **Latin Percussion**, **Indian Percussion II**, **Indian Percussion**, **Deep / Dub**, **Retro Arcade**, **Soft / Dusty**, **Electro / FM**, **Minimal**, **Industrial**, **Drum Synth**, and **808-inspired**. The last two retain their refined presets. Tap a pad to audition and edit it, or press **Play groove**. Switching packs restarts a playing groove with the same pattern and tempo. Edits are retained separately for each kit; **Reset voice** restores the selected kit’s preset.

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

Both current kits use explicit pitch and noise-filter settings: kicks use shaped pitch settling, snares and claps use focused noise bands with modest resonance, hats use higher noise high-pass cutoffs, and toms use defined semitone bends. Some noise-free voices retain their sound because noise-filter settings do not affect them. The demo still offers only **808-inspired** and **Drum Synth**; no old/new comparison controls were added. Regenerated WAVs are included in each refined sample folder.

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

## Clap structure

Select **Clap** in the demo to show the six clap-only controls. Other voices ignore these controls. Noise level controls the complete burst-and-tail layer; set it to zero to mute both. The filtered noise source is shared, with separate amplitude envelopes for the burst cluster and wash.

| Parameter | Range | Meaning |
|---|---|---|
| `burstCount` | 1–8, integer | Number of initial noise bursts |
| `burstSpacing` | 0.002–0.06 seconds | Nominal time between bursts |
| `burstDecay` | 0.003–0.12 seconds | Each burst's decay to approximately -60 dB after attack |
| `tailLevel` | 0–1 | Trailing wash level relative to noise level; zero disables it |
| `tailDecay` | 0.03–3 seconds | Wash decay to approximately -60 dB after attack |
| `burstVariation` | 0–1 | Seeded timing and strength variation |

Each burst uses `noiseAttack`, with successively reduced strength (0.85 raised to the burst index). The wash starts one nominal spacing interval after the final burst. At maximum variation, inter-burst intervals vary by up to ±35% and burst strengths by up to ±20%. The first burst starts at zero. A separate seeded random stream keeps the burst design from shifting the underlying noise sequence. Repeated hits with the same seed remain identical; changing the seed changes the realization.

The tonal body uses one body envelope, and the transient remains an independent initial click. Export length includes the last varied burst, the enabled wash, and the final fade. The six controls do not affect other voices.

For clap, `noiseDecay` remains an API alias for `tailDecay`; `decay` also updates it via the legacy mapping unless an explicit `tailDecay` is supplied. Explicit fields win in resolved preset objects. The demo hides Noise decay for Clap and exposes Burst decay and Tail decay instead. Existing presets still load, but clap audio intentionally changes from the previous fixed four-envelope design.

### Retuned claps

- **Drum Synth:** four bursts, 10 ms spacing, 17 ms burst decay, 28% variation, 42% wash level, 260 ms wash decay.
- **808-inspired:** three bursts, 12 ms spacing, 9 ms burst decay, 6% variation, 60% wash level, 340 ms wash decay.

These are synthesis interpretations, not circuit-accurate emulations. Updated WAVs are included in both refined kit folders.

```js
drums.trigger('clap', {params: {
  burstCount: 3, burstSpacing: 0.012, burstDecay: 0.009,
  tailLevel: 0.6, tailDecay: 0.34, burstVariation: 0.06
}});
```

## Metallic hi-hat source

Select **Closed hat** or **Open hat** to show **Metallic source** controls. Six inharmonically related oscillators now contribute up to four odd harmonics each (1, 3, 5, 7), giving a richer metallic body than the earlier six-sine mixture. Harmonics fade out between 0.40 and 0.45 times the sample rate to reduce source aliasing, including during sweeps. Subsequent saturation is unchanged and is not oversampled.

| Parameter | Range | Meaning |
|---|---|---|
| `metalMix` | 0–1 | Balance from noise toward metal; 0.5 preserves the independent layer gains |
| `metalDetune` | 0–100 cents | Amount of fixed signed detuning across the six oscillators |
| `metalDamping` | 0–1 | Additional decay of higher metallic partials; 0 leaves only the body envelope |
| `metalHighpass` | 0–18000 Hz | Removes low metallic ringing; 0 bypasses the high-pass stage |
| `metalLowpass` | 20–20000 Hz | Softens high metallic partials |

The balance applies `2 * metalMix` to Body level and `2 * (1 - metalMix)` to Noise level. It does not change the stored levels or the transient. With equal body/noise levels, the sum of the nominal gains stays constant, but this is not loudness normalization; different sources and envelopes have different energy. With unequal layer levels, changing balance can also change the total gain. A layer whose own level is zero remains silent at every balance setting. Body level and decay shape the metallic layer; Noise level and decay shape the hiss.

Metal filters are one-pole low-pass then high-pass, independent of the noise filters, with effective cutoffs capped at 0.4 times sample rate. A high-pass above the low-pass is allowed and strongly attenuates the metallic layer. Damping adds frequency-dependent exponential decay scaled by Body decay, so higher partials fade faster without lengthening the tail. Fixed detuning preserves deterministic rendering and does not vary from hit to hit.

Both demo kits' open and closed hats have been retuned. Drum Synth uses a wider detune spread; the 808-inspired kit favors a tighter, more metallic balance and higher metal high-pass cutoffs. Closed hats use more damping than open hats. This intentionally changes hat rendering for existing presets while preserving the parameter API. Other voices ignore these five settings. Hi-hat choking is available as a playback feature, described below.

```js
drums.trigger('openHat', {params: {
  metalMix: 0.6, metalDetune: 12, metalDamping: 0.45,
  metalHighpass: 4200, metalLowpass: 16000
}});
```

## Hi-hat choking

Choking is enabled by default: a closed hat fades any overlapping open hats to silence. The demo includes a **Hi-hat choking** toggle and **Fade** slider (1–100 ms, default 5 ms), applying to pads and the sequencer. To hear the effect clearly, play an open hat, then a closed hat before its tail finishes; repeat with choking disabled.

```js
const drums = new DrumSynth({chokeEnabled: true, chokeFade: 0.005});
drums.setChoke({chokeEnabled: false});
drums.setChoke({chokeEnabled: true, chokeFade: 0.012});
```

These are playback settings, not synthesis parameters: they do not belong in `params`, affect `render()`, or alter exported single-hit WAVs. Fade is specified in seconds in the API. The toggle and fade setting are not included in per-voice preset exports.

Closures use the audio clock at the closed hit’s scheduled time, not the time `trigger()` is called. Future open hats starting after that closed hit remain unaffected. A closed and open hat at the same timestamp give the closed hat priority, regardless of scheduling order. Scheduling a closed hit before its corresponding open hit in code is supported; the earliest eligible overlapping closure wins. A zero-velocity closed trigger still counts as a closure gesture.

Cancelling a future closed hit with its handle’s `stop()` restores the affected open hat or selects the next scheduled closure. Changing fade or disabling choking updates pending closures; a fade that has already begun is not reversed. Enabling choking does not replay past closed-hit events. `stopAll()`, individual stops, voice stealing, and disposal still cancel sources, including those with a future choke scheduled. Fading voices remain tracked until they end or are explicitly stopped.

Automated tests cover scheduling, out-of-order and simultaneous hits, cancellation, disabled mode, live pads, cleanup, and option validation using an instrumented Web Audio mock. Browser playback and listening checks remain unverified in this environment.

## Velocity-sensitive sound and sequencer accents

Two per-voice controls are available under **Velocity response**:

- `velocityToBrightness` (0–1): soft hits lower noise and metallic low-pass cutoffs. The multiplier is `2 ** (-3 * amount * (1 - velocity))`, with a minimum cutoff of 20 Hz. This shapes noise and hats' metallic bodies; it does not change other tonal bodies or the transient filter.
- `velocityToTransient` (0–1): soft hits reduce transient level by `1 - amount * (1 - velocity)` before shared saturation.

Full velocity (1) preserves the preset sound. Zero response preserves volume-only velocity behavior; engine defaults use zero for compatibility. Both current demo kits have modest response amounts enabled. Velocity zero renders silence. Normal amplitude scaling still happens once, in addition to the timbre response. Live playback caches buffers by effective sound parameters, then applies velocity gain; WAV rendering uses the same response and gain. Pitch and decay response are not part of this update.

Use **Hit strength** to audition pads or Play sound at 1–100%. The waveform and exported WAV follow this setting; WAV filenames include the strength. It does not set sequencer velocity, and preset JSON stores response parameters rather than audition strength.

The sequencer’s **Use intensity** checkbox is unchecked by default. In this mode, clicks toggle off / 100%, and every enabled step plays at 100%. When checked, each step cycles through **off → soft (35%) → normal (65%) → accent (100%) → off** when clicked or keyboard-activated. Existing per-step strengths are retained while intensity is disabled and restored when re-enabled, unless you edit those steps. Symbols and labels show the currently effective strength. Changes apply to subsequently scheduled hits. Symbols, colors, and accessible labels indicate its strength. Starter beat includes quieter offbeats and a ghost snare. Clear and Starter beat reset velocities; kit switching preserves the sequence. Set both response controls to zero to hear volume-only differences.

```js
drums.configure('snare', {velocityToBrightness: 0.6, velocityToTransient: 0.65});
drums.trigger('snare', {velocity: 0.35});
const softSample = render('snare', {
  velocityToBrightness: 0.6, velocityToTransient: 0.65
}, {velocity: 0.35});
```

## Filter envelopes: brightness changes within a hit

These controls move a layer's low-pass cutoff during each hit, including at **100% Hit strength**. They differ from Velocity response, which changes the sound according to how softly the hit is played.

| Parameter | Range | Meaning |
|---|---|---|
| `noiseFilterEnvAmount` | -4 to +4 octaves | Noise low-pass starting offset; + starts brighter, − starts darker, 0 disables the sweep |
| `noiseFilterEnvDecay` | 0.005–3 seconds | Time for the noise cutoff offset to fall to 0.1% of its initial octave amount |
| `metalFilterEnvAmount` | -4 to +4 octaves | Metallic low-pass starting offset; applies only to hats |
| `metalFilterEnvDecay` | 0.005–3 seconds | Time for the metallic cutoff offset to fall to 0.1% of its initial octave amount |

For either layer, the moving cutoff is:

`baseLowpass * 2 ** (amount * exp(-6.907755 * time / decay))`

The result is limited to 20 Hz–0.4 times the render sample rate. For example, a 4000 Hz base and +1 octave start at 8000 Hz, then settle toward 4000 Hz. A -1 octave start is 2000 Hz. The sweep is continuous from hit onset; clap bursts do not retrigger it. Both one-pole and resonant noise-filter paths follow the same moving cutoff. The metallic envelope moves only the metallic low-pass; high-pass settings remain fixed. These controls do not extend the amplitude envelope or exported sample duration.

Velocity brightness response adjusts the base low-pass first, then the filter envelope sweeps around that adjusted base. Amount 0 preserves the existing static path exactly, regardless of envelope decay. The engine's base presets default to 0; current demo kits deliberately use nonzero envelopes where useful.

### Hearing and tuning the effect

Select Snare, leave Hit strength at 100%, and try Noise low-pass at 4000 Hz, Noise sweep at +2 octaves, and Noise sweep decay at 300 ms. Compare with amount 0. For an open hat, try the same with Metal low-pass and Metal sweep. Positive amounts give a bright opening that darkens; negative amounts create a darker opening that brightens.

A sweep can be subtle if its layer is quiet, its cutoff is already capped, or the high-pass removes most of that frequency region. Noise envelopes do nothing when Noise level is 0; metallic envelopes do nothing when the hat's metallic layer is muted. They do not alter a kick's tonal body or the separate transient click.

### Retuned kits

Snares and claps now start with brighter noise and settle into darker tails. Closed hats use brief noise/metal sweeps; open hats use longer independent sweeps. Audible noise layers in kicks, toms, rims, and cowbells receive smaller sweeps. The noise-free 808-inspired kick and cowbell retain neutral noise-envelope amounts. Both kits' WAV sample folders have been regenerated. All four parameters are stored in preset JSON and covered by the TypeScript declarations.

```js
drums.trigger('openHat', {params: {
  noiseLowpass: 9000, noiseFilterEnvAmount: 0.65, noiseFilterEnvDecay: 0.32,
  metalLowpass: 8800, metalFilterEnvAmount: 0.85, metalFilterEnvDecay: 0.38
}});
```

## Transient character: shape the initial impact

The **Transient** section now offers **Noise click**, **Tonal knock**, and **Noise + tonal blend**. These change the brief initial impact at every intensity, including 100%. They do not replace the drum body, snare rattle, or clap burst cluster.

| Parameter | Values / range | Purpose |
|---|---|---|
| `transientType` | `'noise'`, `'tonal'`, `'blend'` | Choose the impact source |
| `transientTone` | 0–1 | Dark-to-bright tone of the noise portion |
| `transientFrequency` | 40–12000 Hz | Frequency of the separate sine-wave knock |
| `transientMix` | 0–1 | Blend only: 0 is noise, 1 is tonal, 0.5 mixes both equally |

Existing Transient level and Transient decay shape all three types. The 0.5 ms onset ramp is retained. Knock frequency is independent of the main Frequency and Pitch sweep controls and is capped at 0.4 times the render sample rate. Noise tone uses a low-pass cutoff from 200 to 20000 Hz (also sample-rate capped), with progressively more unfiltered noise as tone approaches 1. Tone 1 preserves the original white-noise click exactly. The blend is linear, so perceived loudness can vary between modes.

The demo hides Knock frequency for noise-only impacts, Noise tone for tonal-only impacts, and Blend outside blend mode. Transient velocity response softens whichever impact type is selected; the Noise and Metal filter envelopes do not process this separate layer.

To hear the difference clearly, set Hit strength to 100%, raise Transient level to around 0.6, and compare the types. Try a 400 Hz knock for a low impact or 2000 Hz for a sharper one. If the transient is hard to distinguish, temporarily lower Body level and Noise level. Level 0 mutes every transient type.

Current kits use blended or tonal kicks and toms, tonal/blended rims and cowbells, mostly noise snares with a small tonal component, and noise claps/hats. Their WAVs have been regenerated. Base API defaults remain noise / tone 1 for backward-compatible sound. Preset JSON includes the new settings. `PARAMS` remains numeric-range metadata; the exported `TRANSIENT_TYPES` array provides the enum choices for custom interfaces. TypeScript declarations include `TransientType`.

```js
drums.trigger('tom', {params: {
  transientType: 'blend', transientTone: 0.5,
  transientFrequency: 420, transientMix: 0.75,
  transientLevel: 0.3, transientDecay: 0.012
}});
```

## Adjustable body resonances

Kicks, snares, toms, rims, and cowbells now have **five additional ringing tones** mixed with the existing body. These are synthesized tonal components, not a resonant effect applied to external audio. The original body structure stays intact; the extra tones let you add shell-like ring, harmonics, or less harmonic metallic character.

Each slot (`1` through `5`) provides:

| Parameter | Range | Purpose |
|---|---|---|
| `resonance1Ratio` | 0.5–8 | Frequency multiplier relative to the body's instantaneous pitch |
| `resonance1Level` | 0–1 | Added tone level; 0 disables this slot |
| `resonance1Decay` | 0.01–3 seconds | Independent ring decay to approximately -60 dB after attack |

The same names with `2`, `3`, `4`, or `5` select the other slots. A ratio of 2 is one octave above the body; 0.5 is one octave below. Non-integer ratios such as 1.59 or 2.37 create less harmonic ringing. The extra tones follow Frequency, Pitch sweep, and Pitch bend; their attack uses Body attack. Body level controls the original body and every added resonance together. Body decay only sets the original body's decay; each added resonance has its own decay, so it can ring after the original body has faded.

The enabled tones extend rendering to include the longest ring, with the existing end fade. Muted slots do not lengthen exports. Frequency components taper out between 0.40 and 0.45 times the sample rate to reduce folding at extreme ratios and pitches; this does not make the existing saturation or original body fully anti-aliased. Added tones are not automatically normalized, so raising several levels increases loudness and drives the shared saturation harder.

The demo shows **Body resonance 1–5** for the five classic tonal voices, and for every slot using the modal body model. Classic claps and hats ignore these controls; classic hats retain their separate Metallic source controls. All base engine presets default to zero added resonance levels, preserving their earlier sound. The Drum Synth and 808-inspired kits are retuned with moderate levels: subtle kick harmonics, short snare/rim rings, and more pronounced tom/cowbell resonances. Preset exports, WAV rendering, cache keys, and TypeScript declarations include all fifteen resonance parameters. `RESONANCE_VOICES` exports the classic supported voice names; modal bodies support them in every slot.

### Try it

Select Tom, lower Noise level and Transient level temporarily, and set Body decay to 100 ms. Set resonance 1 level to 0.3, ratio to 1.59, and ring decay to 600 ms. The additional tone should ring after the main body fades. Change the ratio to hear its pitch move, or set its level to 0 to remove it. This works at 100% intensity.

```js
drums.trigger('tom', {params: {
  bodyDecay: 0.1,
  resonance1Ratio: 1.59, resonance1Level: 0.3, resonance1Decay: 0.6,
  resonance2Ratio: 2.14, resonance2Level: 0.12, resonance2Decay: 0.2,
  resonance3Level: 0
}});
```

## FM synthesis

**FM synthesis** is available on kick, snare, tom, rim, and cowbell. A sine modulator varies the instantaneous frequency of the original tonal body, adding sidebands and a more complex attack. The modulation fades so the body settles back toward its base pitch. Clap and hats ignore these controls.

| Parameter | Range | Purpose |
|---|---|---|
| `fmDepth` | 0–4 | Initial modulation index; 0 bypasses FM exactly |
| `fmRatio` | 0.25–8 | Modulator frequency divided by the instantaneous body frequency |
| `fmDecay` | 0.005–3 seconds | Time for the modulation index to drop to 0.1% of its initial amount |

The modulator tracks the body's pitch sweep. Its frequency is `bodyFrequency * fmRatio`; frequency deviation is `fmDepth * modulatorFrequency` times an exponential envelope. Positive and negative deviations are integrated into the body oscillator phase, allowing through-zero FM. Each existing body partial follows the modulated body phase. Added Body resonances, Noise, and the separate Transient remain unmodulated; they still share the final output processing. FM decay does not extend the amplitude envelope or exported sample length.

The modulator frequency is capped at 0.2 times the render sample rate, and fundamental deviation is limited to the available headroom below 0.4 times sample rate. These limits keep extreme modulation manageable, but this is not an oversampled or fully band-limited FM engine: high pitches, high ratios, and large depth can still produce aliasing from sidebands or harmonics. Moderate settings are a good starting point.

### Hear the effect

Select **Tom**, use Hit strength 100%, and set **FM depth 1**, **FM ratio 1.4**, **FM decay 120 ms**. Compare depth 0 and 1. Integer ratios tend toward harmonic textures; fractional ratios often give less pitched, metallic results. Short decay emphasizes the attack; longer decay makes the complex tone linger. Keep Body level audible—FM cannot be heard when Body level is 0. Lower Noise and Transient levels temporarily if they mask it.

The Drum Synth and 808-inspired demo kits use FM on their five tonal voices as listed below. Reset voice restores those tuned FM values. Set FM depth to 0 to hear the same preset without modulation. Base engine presets still default to FM off. FM is included in saved preset JSON, WAV exports, cache keys, velocity-aware playback, and TypeScript declarations. `FM_VOICES` exports the supported voice list.

```js
drums.trigger('tom', {params: {
  fmDepth: 1, fmRatio: 1.4, fmDecay: 0.12
}});
```

### FM-tuned demo instruments

Both kits use short modulation envelopes to add attack character while retaining a simpler decaying body. The 808-inspired kit uses smaller depths to keep its character restrained. These are sound-design choices for auditioning, not listening-verified hardware emulations.

| Voice | Drum Synth: depth / ratio / decay | 808-inspired: depth / ratio / decay | Intended character |
|---|---|---|---|
| Kick | 0.16 / 1 / 25 ms | 0.06 / 1 / 15 ms | Subtle attack edge, quickly settling low body |
| Snare | 0.25 / 1.7 / 40 ms | 0.16 / 1.5 / 30 ms | More complex tonal attack beneath the noise |
| Tom | 0.65 / 1.4 / 100 ms | 0.45 / 1.5 / 80 ms | More pronounced electronic, ringing attack |
| Rim | 0.45 / 2.3 / 25 ms | 0.30 / 2.1 / 20 ms | Brief metallic knock |
| Cowbell | 0.70 / 1.48 / 140 ms | 0.40 / 1.5 / 100 ms | Richer clang that settles into the existing ring |

Claps and hats retain their existing sounds. Only the three FM settings changed in the retuned voices; all existing gain, pitch, resonance, and envelope settings were retained. Updated WAVs are included in both refined sample folders. To compare manually, play a voice, set FM depth to 0, then use Reset voice to restore its tuned setting.

## Electro / FM, Minimal, and Industrial sound packs

All three new packs contain eight editable voices: kick, snare, clap, closed hat, open hat, tom, rim, and cowbell. The voice slots remain consistent across kits, so you can switch packs while keeping your sequence and tempo. Current edits are retained independently for each pack during the session; Reset voice restores the selected pack’s factory sound.

| Pack | Character | Useful sounds to audition |
|---|---|---|
| Electro / FM | Stronger decaying FM, pitch sweeps, resonant noise, bright metallic hats | Tom for laser-like pitch movement, cowbell for synthetic bell tones, snare for a metallic body |
| Minimal | Short envelopes, restrained modulation, dry claps, small tonal clicks | Kick, rim, and clap for compact percussion; open hat for a short hiss |
| Industrial | Driven low drums, detuned hats, longer resonances and stronger FM | Kick and snare for driven attacks; rim and cowbell for metallic clangs |

These are synthesized sound-design presets, not recordings or hardware emulations. Industrial uses the existing saturation, not a new bitcrusher or effect. The packs use velocity brightness/transient response, which is audible below full strength. Enable Use intensity for sequencer dynamics. Hi-hat choking works in every kit. Kit switching does not change BPM or your pattern.

The demo now starts on Deep / Dub. All kit options remain available, including the unchanged Drum Synth and 808-inspired packs. The 24 additional 44.1 kHz mono WAVs are in `samples/electro-fm/`, `samples/minimal/`, and `samples/industrial/`. Run `npm run samples` to regenerate them. WAV export from the demo uses the active voice edits and Hit strength.

```js
import { DrumSynth } from './src/drum-synth.js';
import { KIT_ELECTRO_FM, KIT_MINIMAL, KIT_INDUSTRIAL } from './src/kits.js';

const drums = new DrumSynth();
// Call resume() within a user gesture before playback.
await drums.resume();
drums.trigger('tom', {params: KIT_ELECTRO_FM.tom, velocity: 0.8});

// Or configure an entire pack once:
for (const [voice, params] of Object.entries(KIT_INDUSTRIAL)) {
  drums.configure(voice, params);
}
drums.trigger('kick');
```

All pack objects are immutable; clone a voice or pass a spread object to customize it. `KITS` also exposes the IDs `electro-fm`, `minimal`, and `industrial`. The `src/kits.d.ts` declarations describe all pack exports.

Validation covers all 24 sounds: parameter resolution, deterministic output, finite bounded samples, WAV encoding, distinctness from other kits, and rendering at 8/44.1/96 kHz. Browser playback and subjective listening have not been verified in this environment.

## Deep / Dub, Retro Arcade, and Soft / Dusty sound packs

Each pack adds eight editable voices in the same slots as the existing kits. Select a pack to audition its sounds or play your current sequence. Choose Deep / Dub from the sound-pack selector. Switching packs preserves the pattern, tempo, and each pack’s session edits; Reset voice restores that pack’s preset.

| Pack | Character | Useful sounds to audition |
|---|---|---|
| Deep / Dub | Low rounded kicks, dark snares and hats, muted claps, long tonal tails | Kick for sub weight, tom for low resonances, cowbell for a lingering ring |
| Retro Arcade | Fast pitch sweeps, bright noise bursts, tonal clicks, and FM bleeps | Tom for an upward pitch sweep, rim for a short blip, cowbell for a game-inspired ring |
| Soft / Dusty | Softer attacks, filtered noise, damped hats, and muted tonal percussion | Snare and clap for dark rattles, rim for a small knock, hats for soft texture |

These palettes use the existing synthesis controls. Deep / Dub does not add delay or reverb; Soft / Dusty does not add vinyl crackle; Retro Arcade is game-inspired rather than an exact sound-chip emulation. Use Hit strength or enable Use intensity in the sequencer to hear each preset’s velocity response. Hat choking is supported across all packs.

The 24 additional 44.1 kHz mono WAVs are in `samples/deep-dub/`, `samples/retro-arcade/`, and `samples/soft-dusty/`. Regenerate them with `npm run samples`, or export an edited voice from the demo.

```js
import { KIT_DEEP_DUB, KIT_RETRO_ARCADE, KIT_SOFT_DUSTY, KITS } from './src/kits.js';

// With an initialized DrumSynth instance:
drums.trigger('kick', {params: KIT_DEEP_DUB.kick});
drums.trigger('tom', {params: KIT_RETRO_ARCADE.tom, velocity: 0.8});
drums.configure('snare', KIT_SOFT_DUSTY.snare);

// Registry IDs: 'deep-dub', 'retro-arcade', and 'soft-dusty'.
const editableKick = {...KITS['deep-dub'].kick, bodyDecay: 0.8};
```

The kit exports are immutable and have TypeScript declarations. Automated checks cover all new voices for parameter resolution, determinism, finite bounded output, audible signal, WAV encoding, and rendering at 8/44.1/96 kHz. Browser playback and subjective listening remain unverified in this environment.

## Body oscillator shape

`bodyWaveform`, `bodyPulseWidth`, and `bodyWaveformMix` change the tonal sources in **kick, snare, tom, rim, and cowbell**. Each voice keeps its existing oscillator pitch ratios and body envelope. FM modulates the selected shape. The extra body resonances remain sine tones with their own envelopes. Clap and hat sources ignore these three controls; they keep their dedicated noise/metal synthesis.

| Parameter | Values / range | Default | Meaning |
|---|---|---|---|
| `bodyWaveform` | `sine`, `triangle`, `square`, `saw` | `sine` | Sine is round, triangle has gentle edges, square is hollow, and saw is buzzy |
| `bodyPulseWidth` | 0.05–0.95 | 0.5 | Square/pulse duty cycle; 0.5 is symmetric. Moving away from 0.5 changes the harmonic balance and gives a more nasal tone. Ignored by other waveforms |
| `bodyWaveformMix` | 0–1 | 1 | Blends the original sine-based body with the selected waveform: 0 keeps the original body, 1 uses the selected shape throughout |

Sine remains the API default and preserves the previous engine output exactly. The blend defaults to 1 so selecting another waveform immediately changes the source. With sine selected, pulse width and blend have no effect. Blend 0 exactly bypasses waveform shaping, including when FM is enabled. This restores the sine-based source for the **current** parameter settings; it does not undo other preset retuning.

In the demo, look under **Body oscillator**. The blend appears for triangle, square, and saw; Pulse width appears only for square. These controls work at 100% Hit strength. Body level must be above zero; a loud noise layer can mask the change. For a clear audition, select **Retro Arcade → Tom**, compare Shape blend at 0% and 100%, then compare Pulse width at 50% and 25%. With the waveform set to sine, the controls that have no effect are hidden. Labels and these explanations are included here for the detailed usage notes.

```js
// Use the same settings with render(), configure(), or trigger() parameters.
const params = {
  bodyWaveform: 'square',
  bodyPulseWidth: 0.25,
  bodyWaveformMix: 0.65,
  bodyLevel: 0.8,
  noiseLevel: 0,
  transientLevel: 0.08,
  fmDepth: 0.3
};
drums.trigger('tom', {params});
const wav = encodeWav(render('tom', params));
```

`BODY_WAVEFORMS` exposes the enum choices and `BODY_WAVEFORM_VOICES` lists supported voices. Numeric ranges remain in `PARAMS`; TypeScript exposes `BodyWaveform` and all three fields on `Params`. Configuration, per-hit overrides, cached playback, WAV export, and preset JSON all include the new settings. Invalid enum values and out-of-range numeric values are rejected.

### Preset retuning

19 voices across five kits now use oscillator shapes. Their WAV samples have been regenerated. Levels, FM depth, and drive were adjusted where useful alongside the new shape settings.

| Kit | Updated voices | Approach |
|---|---|---|
| Electro / FM | Kick, snare, tom, rim, cowbell | A mild triangle kick, pulse snares/rims/bells, and a little saw in the tom; reduced FM in several voices leaves room for the waveform harmonics |
| Retro Arcade | Kick, snare, tom, rim, cowbell | Triangle kick, strongly square/pulse percussion, and lower FM so the pulse character is more exposed |
| Industrial | Kick, snare, tom, rim, cowbell | Saw blends in the low drums, pulse rims/bells, with reduced drive to balance the richer source |
| Deep / Dub | Tom, cowbell | Subtle triangle blends retain a rounded low-frequency character |
| Soft / Dusty | Kick, tom | Gentle triangle blends add a little edge without switching to a bright pulse or saw |

Drum Synth, 808-inspired, and Minimal presets retain their previous audio. All claps and hats are unchanged. Each edited voice can still be reset to its retuned factory preset.

### Oscillator implementation and limits

The new shapes use a finite Fourier series of up to 32 harmonics, with no DC term. A smooth taper removes upper harmonics between 35% and 45% of the sample rate, recalculated during pitch sweeps. A conservative FM bandwidth estimate also reduces the available harmonics during strong modulation. Pulse wave amplitude is scaled to avoid a large peak increase at narrow widths; perceived loudness can still change with shape and width. Low-note shapes are intentionally rounded by the 32-harmonic limit.

This reduces oscillator aliasing; it does not make the whole instrument alias-free. Strong FM and the existing output saturation can still generate additional high-frequency content. Sine mode and blend 0 follow the unchanged legacy source path. The extra resonances retain their existing bandwidth protection.

Background on harmonic-sum synthesis: [Julius O. Smith, Additive Synthesis](https://www.dsprelated.com/freebooks/sasp/Additive_Synthesis.html).

Automated checks cover bypass compatibility, waveform and width differences, layer isolation, spectral suppression of folded harmonics, validation, extreme FM/pitch at 8/44.1/96 kHz, configuration, caching, and JSON round trips. Browser playback and subjective listening remain unverified in this environment.


## Delay and reverb sends

Every voice has two additional playback parameters: `delaySend` and `reverbSend`, each from **0 to 1**, defaulting to **0**. A send routes a copy of the drum to a shared effect while retaining its dry sound. Send values are stored in the voice preset, work with `configure()` and per-hit overrides, and are captured when `trigger()` is called. They do not alter the cached dry sample or the output of `render()`.

Version 1.4.0 accepts **73 per-voice parameters**: 70 numeric settings and three enum choices, including the two effect sends. Shared effects have **eight numeric settings and one enabled flag**, configured separately from the voices.

### Hear the effects in the demo

1. Click **Try space** in the Delay & reverb panel beside the sequencer.
2. Press **Play groove**, or tap a pad. The example keeps the kick dry and adds modest space to the other instruments.
3. Select an instrument and adjust its **Delay send** and **Reverb send** at the top of the voice controls.
4. Adjust the shared return levels to change the overall echo and room volume. Use **Enable effects** to bypass the wet sound, **Clear tails** to silence lingering effects, or **Dry kit** to zero both sends for every voice in the selected kit.

Try space sets an eighth-note delay using the BPM at the moment you click it. Delay time is otherwise a free millisecond control and does not automatically follow subsequent tempo changes. Per-voice sends are retained separately for each kit during the session. Shared settings apply across kits. Reset voice restores that voice’s factory sends of zero. Stopping the groove, switching kits, and hiding the page clear the shared tails.

### Shared effect settings

| Setting | Range | Default | Meaning |
|---|---|---|---|
| `enabled` | Boolean | `true` | Bypass both effects when false and discard existing wet tails; dry playback continues |
| `delayTime` | 0.01–2 seconds | 0.3 | Time between echoes |
| `delayFeedback` | 0–0.85 | 0.32 | Amount fed back for further repeats; zero produces one echo |
| `delayTone` | 200–18000 Hz | 4500 | Low-pass cutoff in the repeat/feedback path; lower values make repeats darker |
| `delayLevel` | 0–1 | 0.35 | Shared delay return level |
| `reverbDecay` | 0.1–6 seconds | 1.6 | Duration of the generated decaying room response |
| `reverbPreDelay` | 0–0.2 seconds | 0.015 | Gap before the reverberation begins |
| `reverbTone` | 200–18000 Hz | 6500 | Low-pass cutoff on the reverberation |
| `reverbLevel` | 0–1 | 0.3 | Shared reverb return level |

The reverb uses a deterministic stereo noise impulse generated locally, so no recorded impulse response or network request is needed. Filter cutoffs are limited to 45% of the context sample rate. The delay’s tone filter is non-resonant and feedback is capped below unity. Continuous controls are smoothed; changing delay time can bend the pitch of existing repeats. Reverb length updates on slider release in the demo and replaces the previous response, which can cut its existing tail.

```js
import { DrumSynth, DEFAULT_EFFECTS, EFFECT_PARAMS } from './src/drum-synth.js';

const drums = new DrumSynth({
  volume: 0.6,
  effects: { delayTime: 0.3125, delayFeedback: 0.35, reverbDecay: 1.8 }
});

drums.configure('snare', { delaySend: 0.15, reverbSend: 0.3 });
drums.configure('rim', { delaySend: 0.4, reverbSend: 0.1 });

// Call from a click or tap handler:
await drums.resume();
drums.trigger('snare');
drums.trigger('tom', { velocity: 0.7, params: { reverbSend: 0.4 } });

// Return changes affect existing tails as well as subsequent hits.
drums.setEffects({ reverbTone: 3200, reverbLevel: 0.25 });
const settings = drums.getEffects(); // independent copy

drums.clearEffects();             // discard wet tails; keep settings
// drums.setEffects({ enabled: false }); // dry playback; sends are retained
// drums.setEffects({ enabled: true });  // effects on subsequent trigger calls
// drums.stopAll();                     // stop dry voices and clear wet tails
```

`DEFAULT_EFFECTS` and numeric `EFFECT_PARAMS` ranges are frozen metadata exports. `setEffects()` merges updates and returns the instance. Invalid keys, nonfinite/out-of-range values, and non-boolean `enabled` values are rejected before applying updates. Effects buses are allocated lazily when an enabled nonzero send is first triggered.

Both sends follow hit velocity, pan, and the voice’s stop/choke gain. Choking or stopping one voice prevents further input from that voice, while audio already in a shared effect can continue to ring. `clearEffects()` disconnects wet sends from currently playing and already queued hits; subsequent `trigger()` calls recreate the buses with the retained settings. It does not stop the dry voices. `stopAll()` also cancels the dry voices. Disposal releases the effects graph along with the engine’s other resources.

**Export scope:** these effects are Web Audio playback effects. `render()`, `encodeWav()`, the waveform display, and bundled WAVs remain dry. The demo labels its button **Export dry WAV**. Save preset includes `{ kit, voice, params, effects }`; to restore it programmatically, pass `params` to `configure()` and `effects` to `setEffects()`. This release does not add a demo preset import button or wet WAV export.

Wet returns add to the dry mix before master volume. The output bus has no limiter, so reduce master volume or return levels if a dense groove becomes too loud. Sound presets keep zero sends until you edit them or click Try space.

Effects tests cover routing, shared buses, dry-buffer cache reuse, validation, deterministic stereo impulses, smoothed updates, bypass, choking/cancellation, and resource cleanup. Browser playback and subjective listening remain unverified in this environment.


## Indian Percussion (v1.2.0)

Choose **Indian Percussion** in the demo, then press **Indian I groove → Play groove**. The groove button sets 96 BPM and enables Use intensity so you hear accents and lighter strokes. It selects all eight sounds in a contemporary 16-step audition pattern, not a traditional tala/theka transcription. Choosing a kit from the dropdown preserves the current pattern, tempo, and intensity preference.

| Named preset | Demo pad / API slot | Character |
|---|---|---|
| `bayanBass` | Bayan bass / `kick` | Low, rounded resonance |
| `tablaOpen` | Tabla open / `snare` | Tuned dayan-inspired ring with near-harmonic partials |
| `tablaMuted` | Tabla muted / `clap` | Damped companion stroke with a short impact |
| `dholakTreble` | Dholak treble / `closedHat` | Higher skin tone with a brief noisy attack |
| `manjira` | Manjira / `openHat` | Bright, inharmonic cymbal ring |
| `bayanBend` | Bayan bend / `tom` | Bass tone that bends up and returns |
| `dholakBass` | Dholak bass / `rim` | Low skin tone with a short pitch drop |
| `ghatam` | Ghatam / `cowbell` | Short clay-pot-inspired knock and ring |

These are synthesized interpretations made from resonant tones, noise, and transients. They are not sampled instruments or exact physical models. The pad labels reflect the instruments; the eight existing API slots remain stable for sequencers. No knowledge of the slot mapping is required when using the named preset API:

```js
import { DrumSynth, render } from './src/drum-synth.js';
import { INDIAN_PERCUSSION, KIT_INDIAN, INDIAN_GROOVE } from './src/kits.js';
// With an installed package, the presets are also exported from 'drum-synth-js/kits'.
const drums = new DrumSynth();
const sound = INDIAN_PERCUSSION.bayanBend;
// In a click handler:
await drums.resume();
drums.trigger(sound.voice, {params:sound.params, velocity:.85});
// Offline rendering works without Web Audio:
const audio = render(sound.voice, {...sound.params, pitchBendSemitones:5});
// Optional: configure every slot for an existing sequencer.
for (const [voice, params] of Object.entries(KIT_INDIAN)) drums.configure(voice, params);
// INDIAN_GROOVE[voice] is a frozen 16-step array of velocity values.
```

`KITS.indian` contains the same kit. `INDIAN_LABELS` maps slots to display names. Presets and groove data are frozen; copy values before editing. `npm run samples` writes eight named WAVs to `samples/indian/`. Save preset includes the instrument name, slot, parameters, and shared effects.

### New sound controls

| Parameter | Range / default | What it changes |
|---|---|---|
| `bodyModel` | `classic` (default), `modal` | Classic uses the original drum algorithm. Modal uses a sine fundamental plus up to five independent ringing tones in any slot. |
| `strikePosition` | 0–1 / 0.5 | Modal only: centre (0) favours the fundamental; edge (1) increases upper tones relative to it. Change active resonance levels to shape the result. |
| `damping` | 0–1 / 0 | Modal only: shortens the body and higher resonances, turning an open stroke into a muted one. |
| `pitchBendSemitones` | −24–24 / 0 | Additional pitch gesture; positive bends up, negative bends down. Zero bypasses the gesture. Works in both models. |
| `pitchBendTime` | 0.005–0.5 seconds / 0.1 | Time from the hit to the maximum bend. |
| `pitchBendRelease` | 0.01–2 seconds / 0.25 | Time from maximum bend back to the underlying pitch. |
| `resonance4Ratio`, `resonance5Ratio` | 0.5–8 / 4.2, 5.4 | Two extra partial frequencies relative to body pitch. |
| `resonance4Level`, `resonance5Level` | 0–1 / 0 | Extra partial levels. Zero disables them. |
| `resonance4Decay`, `resonance5Decay` | 0.01–3 seconds / 0.2 | Extra partial ringing times before modal damping. |

Try **Bayan bend** with bend amount **0 versus +7 semitones**. Compare **Tabla open** and **Tabla muted**, or raise Damping on Tabla open. Move Strike position from centre to edge to change its partial balance. These controls work at full intensity; the separate velocity response settings are heard on softer hits.

Modal damping divides each decay by `1 + 12 * damping * sqrt(partialRatio)` (the fundamental uses ratio 1). Strike position scales the fundamental by `1 - 0.55 * position` and the extra partials by `0.25 + 0.75 * position`. These are perceptual approximations, not simulations of a measured membrane. The pitch bend uses smooth half-cosine rise/return segments and multiplies the existing pitch sweep. It does not extend the note: raise Body decay or Ring decay if the gesture outlasts the sound. The existing sample-rate pitch cap still applies.

Modal mode replaces the classic oscillator, clap bursts, and hat metal bank. FM, waveform, Body tone, clap structure, and metal-source settings are inactive in that mode, so the demo hides them. Body, noise, transient, velocity, sends, pitch, and resonance controls remain available. Modal hits do not participate in hi-hat choking, even when using the `closedHat` or `openHat` slots. Classic hats keep their normal choking behavior.

All older presets default to the classic model, zero pitch bend, and zero levels in resonance slots 4–5. Their rendered WAVs remain byte-identical to v1.1.0. The new synthesis controls and named kit API include TypeScript declarations and tests. Browser playback and subjective listening remain unverified in this environment.


## Indian Percussion II (v1.3.0)

Choose the second Indian pack, or press **Indian II groove → Play groove** to hear all eight instruments at 108 BPM with Use intensity enabled. **Indian I groove** loads the first pack and its original 96 BPM pattern. **All 8 groove** loads the pattern for the selected kit. Switching the pack dropdown preserves your current pattern, tempo, and intensity preference, and retains each kit's sound edits separately.

| Named preset | Demo pad / API slot | Sound design |
|---|---|---|
| `mridangamBass` | Mridangam bass / `kick` | Low body with harmonic ringing and a small downward bend |
| `mridangamTreble` | Mridangam treble / `snare` | Tuned, open stroke with five upper resonances |
| `mridangamMuted` | Mridangam muted / `clap` | Short, damped companion to the open treble stroke |
| `kanjiraSlap` | Kanjira slap / `closedHat` | Sharp skin impact, brief pitch sweep, and upper ringing tones |
| `ghungroo` | Ghungroo / `openHat` | Detuned metallic bell cluster with a soft rattling tail |
| `dholBass` | Dhol bass / `tom` | Deep, forceful drum body with a stick-like transient |
| `dholTreble` | Dhol treble / `rim` | Brighter drum strike with short inharmonic ringing |
| `khanjari` | Khanjari / `cowbell` | Short frame-drum body with a brighter jingle-like tail |

These presets are synthesized interpretations. The groove combines the instruments for auditioning; it is not a traditional tala transcription or a recreation of a particular ensemble. The first Indian pack and all older kits retain their sounds. Eight new mono WAVs are included in `samples/indian-2/`; regenerate them with `npm run samples`.

```js
import { DrumSynth, render } from './src/drum-synth.js';
import { INDIAN_PERCUSSION_2, KIT_INDIAN_2, INDIAN_2_LABELS, INDIAN_2_GROOVE } from './src/kits.js';
// Installed-package preset imports also work from 'drum-synth-js/kits'.
const drums = new DrumSynth();
const sound = INDIAN_PERCUSSION_2.mridangamTreble;
// From a user gesture:
await drums.resume();
drums.trigger(sound.voice, {params:sound.params, velocity:.8});
// Offline: adjust damping to create a shorter articulation.
const audio = render(sound.voice, {...sound.params, damping:.3});
// For an existing eight-lane sequencer:
for (const [voice,params] of Object.entries(KIT_INDIAN_2)) drums.configure(voice,params);
// Labels and 16-step velocity arrays are keyed by the same slots.
```

`KITS['indian-2']` references the new kit. The named preset, label, and groove maps are frozen; copy them before editing. Existing scheduling, per-hit velocity, panning, effect sends, dry WAV export, and JSON preset export work with both packs.

Seven sounds use the modal body model and its strike/damping controls. **Ghungroo uses the classic metallic bank**: adjust Metal detune for bell spread, Metal damping for high-frequency decay, Body decay for ringing length, and Noise level/decay for the rattling tail. Its modal strike/damping controls are therefore hidden. The modal kanjira does not choke the ghungroo, and the demo hides hi-hat choking controls when the kit lacks a pair of classic hat sources.

The parameter count remains 73; this release builds on the existing synthesis controls. Automated checks cover both packs at 8, 44.1, and 96 kHz, deterministic PCM, muted/open articulation, groove headroom at the default master level, and bell/choke interaction. Browser listening remains unverified.

Instrument references used for the design vocabulary: [The Met: Musical Instruments of the Indian Subcontinent](https://www.metmuseum.org/essays/musical-instruments-of-the-indian-subcontinent), [Hartenberger Collection: Mridangam](https://wmic.net/india-mridangam/), and [Kanjira](https://wmic.net/india-kanjira/). Preset tuning is our synthesis design, not a measured acoustic model from those sources.


## West African, Middle Eastern, and Latin percussion (v1.4.0)

Three new packs add 24 named sounds and 24 WAV examples. The demo now contains 13 selectable kits (104 current sounds); the sample archive also retains 16 legacy examples, for 120 WAVs in total. The engine still has 73 per-voice parameters. These packs use the existing modal, noise, transient, metallic, and noise-burst sources.

### Listen to the packs

- **West African groove → Play groove** loads the West African kit at 112 BPM.
- **Middle Eastern groove → Play groove** loads the Middle Eastern kit at 104 BPM.
- **Latin groove → Play groove** loads the Latin kit at 116 BPM.

Each groove button enables Use intensity and loads an original 16-step pattern using all eight sounds. The patterns demonstrate the presets; they are not transcriptions of named traditional rhythms or recreations of specific ensembles. The palettes draw from several instruments and traditions within each broad region. Each sound is a synthesized interpretation rather than a sampled or measured acoustic model.

The sound-pack dropdown preserves the current pattern, BPM, and intensity preference. **All 8 groove** reloads the pattern for the selected kit without changing the tempo. Per-kit edits, Reset voice, named JSON preset export, effect sends, and dry WAV export work with all packs.

### Instrument and API slot map

| Existing slot | West African | Middle Eastern | Latin |
|---|---|---|---|
| `kick` | Djembe bass | Darbuka doum | Conga open |
| `snare` | Djembe tone | Darbuka tek | Conga slap |
| `clap` | Djembe slap | Darbuka slap | Güiro |
| `closedHat` | Shekere | Riq tap | Maracas |
| `openHat` | Gankogui high | Riq shake | Claves |
| `tom` | Talking drum open | Daf bass | Bongo low |
| `rim` | Talking drum bend | Daf edge | Bongo high |
| `cowbell` | Gankogui low | Finger cymbals | Timbale |

Named preset maps expose the real display names and their compatible slots, so applications need not maintain this mapping themselves:

| Pack ID | Named presets | Kit | Labels | Groove |
|---|---|---|---|---|
| `west-african` | `WEST_AFRICAN_PERCUSSION` | `KIT_WEST_AFRICAN` | `WEST_AFRICAN_LABELS` | `WEST_AFRICAN_GROOVE` |
| `middle-eastern` | `MIDDLE_EASTERN_PERCUSSION` | `KIT_MIDDLE_EASTERN` | `MIDDLE_EASTERN_LABELS` | `MIDDLE_EASTERN_GROOVE` |
| `latin` | `LATIN_PERCUSSION` | `KIT_LATIN` | `LATIN_LABELS` | `LATIN_GROOVE` |

The corresponding named preset keys are:

- West African: `djembeBass`, `djembeTone`, `djembeSlap`, `shekere`, `gankoguiHigh`, `talkingDrumOpen`, `talkingDrumBend`, `gankoguiLow`.
- Middle Eastern: `darbukaDoum`, `darbukaTek`, `darbukaSlap`, `riqTap`, `riqShake`, `dafBass`, `dafEdge`, `fingerCymbals`.
- Latin: `congaOpen`, `congaSlap`, `guiro`, `maracas`, `claves`, `bongoLow`, `bongoHigh`, `timbale`.

```js
import { DrumSynth, render } from './src/drum-synth.js';
import { WEST_AFRICAN_PERCUSSION, MIDDLE_EASTERN_PERCUSSION, LATIN_PERCUSSION, KITS } from './src/kits.js';
// Installed-package presets are also available from 'drum-synth-js/kits'.
const drums = new DrumSynth();
const sound = WEST_AFRICAN_PERCUSSION.talkingDrumBend;
// Inside a click or other user gesture:
await drums.resume();
drums.trigger(sound.voice, {params:sound.params, velocity:.8});
const scrape = LATIN_PERCUSSION.guiro;
const audio = render(scrape.voice, {...scrape.params, burstSpacing:.03});
// Configure an existing eight-lane sequencer:
for (const [voice,params] of Object.entries(KITS['middle-eastern'])) drums.configure(voice,params);
```

Preset, kit, label, and groove maps are frozen. Groove values are 16-step velocity arrays keyed by slot; copy them before editing. All named exports include TypeScript declarations.

### Shape the new sounds

**West African:** compare Djembe bass, tone, and slap. Slap has a shorter ring and brighter noise/transient components. Strike position changes the modal partial balance; Damping shortens the ring. Talking drum bend rises by 12 semitones over 100 ms and returns over 270 ms. Set Bend amount to 0 to match its open companion, or use a negative amount for a downward gesture. Gankogui low/high use different base tunings and inharmonic resonance banks. Shekere is mostly filtered noise with a small gourd-like tonal body; Noise attack and Noise decay shape the shake.

**Middle Eastern:** Darbuka doum emphasises the low body, tek the edge ring, and slap a short, bright impact. Riq tap combines a short skin tone with upper resonances and noise. Riq shake uses the classic metallic bank: Metal mix, detune, damping, and Body decay shape its jingles. Daf bass/edge have different body and noise balances. Finger cymbals use high inharmonic modes; adjust the resonance decay times to change the ring.

**Latin:** Conga open/slap contrast a ringing body and a damped impact. Bongo low/high provide two tunings and decay lengths. Timbale adds longer upper resonances; Claves is a short tonal knock. Maracas uses a fast filtered-noise envelope. Güiro reuses the classic clap source's burst envelope as a sequence of scrape ridges: Burst count sets ridge count (up to eight), Burst spacing controls scrape speed, Burst decay controls each rasp, and Tail level adds residual rubbing. The demo explains these under **Güiro scrape**. A single rendered scrape has finite length; repeated sequencer hits can form a longer pattern.

The modal shaker/hand-drum slots do not choke the bells, jingles, or claves. Older kit audio is unchanged. `npm run samples` writes the named WAVs to `samples/west-african/`, `samples/middle-eastern/`, and `samples/latin/`.

Validation covers deterministic and bounded audio at 8, 44.1, and 96 kHz, zero-velocity silence, WAV encoding, articulation differences, pitch-bend bypass, repeated scrape pulses, groove headroom, and choke interaction. Browser playback and subjective listening remain unverified in this environment.

Instrument references for the design vocabulary: [The Met: Jembe](https://www.metmuseum.org/art/collection/search/503286), [Grinnell: Gankogui](https://omeka-s.grinnell.edu/s/MusicalInstruments/item/966), [The Met: Riqq](https://www.metmuseum.org/art/collection/search/504421), and [Smithsonian: Güiro](https://americanhistory.si.edu/collections/object/nmah_602447). Preset ratios, timings, and the audition grooves are our sound-design choices, not measurements taken from those sources.
