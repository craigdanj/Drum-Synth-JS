import test from 'node:test';
import assert from 'node:assert/strict';
import {render, resolveParams, BODY_WAVEFORMS, BODY_WAVEFORM_VOICES, PRESETS, PARAMS} from '../src/drum-synth.js';
import {KITS} from '../src/kits.js';
const isolated = {bodyLevel:.6, noiseLevel:0, transientLevel:0, pitchSweepSemitones:0,
  tone:0, frequency:220, bodyDecay:.3, fmDepth:0};

test('waveform defaults preserve sine; a zero blend restores the exact original body', () => {
  for (const voice of Object.keys(PRESETS)) {
    const p = resolveParams(voice);
    assert.equal(p.bodyWaveform, 'sine'); assert.equal(p.bodyPulseWidth, .5); assert.equal(p.bodyWaveformMix, 1);
    const original = render(voice);
    assert.deepEqual(original, render(voice, {bodyWaveform:'sine',bodyPulseWidth:.05,bodyWaveformMix:.3}));
    for (const bodyWaveform of BODY_WAVEFORMS) {
      assert.deepEqual(original, render(voice, {bodyWaveform,bodyWaveformMix:0,bodyPulseWidth:.15}));
    }
  }
});

test('all tonal voices support distinct, deterministic waveforms and intermediate blends', () => {
  for (const voice of BODY_WAVEFORM_VOICES) {
    const sounds = BODY_WAVEFORMS.map(bodyWaveform => render(voice,{...isolated,bodyWaveform}));
    for (let i=0;i<sounds.length;i++) {
      assert.deepEqual(sounds[i],render(voice,{...isolated,bodyWaveform:BODY_WAVEFORMS[i]}));
      for(let j=0;j<i;j++)assert.notDeepEqual(sounds[i].samples,sounds[j].samples);
    }
    const half=render(voice,{...isolated,bodyWaveform:'square',bodyWaveformMix:.5});
    assert.notDeepEqual(half.samples,sounds[0].samples);assert.notDeepEqual(half.samples,sounds[2].samples);
    assert.equal(half.duration,sounds[0].duration);
  }
});

test('pulse width changes only square and does not affect clap or hats', () => {
  for(const bodyWaveform of BODY_WAVEFORMS) {
    const a=render('tom',{...isolated,bodyWaveform,bodyPulseWidth:.5});
    const b=render('tom',{...isolated,bodyWaveform,bodyPulseWidth:.2});
    if(bodyWaveform==='square')assert.notDeepEqual(a.samples,b.samples);else assert.deepEqual(a,b);
  }
  for(const voice of ['clap','closedHat','openHat']) {
    assert.deepEqual(render(voice),render(voice,{bodyWaveform:'saw',bodyPulseWidth:.05,bodyWaveformMix:1}));
  }
});

test('waveforms leave noise, impact, and independently added resonances alone', () => {
  for(const voice of BODY_WAVEFORM_VOICES) {
    assert.deepEqual(render(voice,{bodyLevel:0}),render(voice,{bodyLevel:0,bodyWaveform:'square'}));
  }
  // After the short main body dies away, the longer resonance keeps the same tone.
  const p={...isolated,bodyDecay:.03,resonance1Level:.5,resonance1Decay:1,resonance1Ratio:1.7};
  const a=render('kick',p).samples,b=render('kick',{...p,bodyWaveform:'saw'}).samples;
  let difference=0;
  for(let i=22050;i<30000;i++)difference=Math.max(difference,Math.abs(a[i]-b[i]));
  assert.ok(difference<1e-7);
});

test('waveform enums and numeric controls reject invalid inputs', () => {
  for(const bodyWaveform of ['pulse','Sine','',null,undefined,1,{},[]])assert.throws(()=>resolveParams('kick',{bodyWaveform}));
  for(const key of ['bodyPulseWidth','bodyWaveformMix']) {
    const [min,max]=PARAMS[key];
    for(const v of [min-.001,max+.001,NaN,Infinity,null,'0.5'])assert.throws(()=>resolveParams('kick',{[key]:v}));
    for(const v of [min,max])assert.equal(resolveParams('kick',{[key]:v})[key],v);
  }
});

test('waveforms remain finite, bounded, and tapered with extreme pitch and FM', () => {
  for(const sampleRate of [8000,44100,96000])for(const bodyWaveform of BODY_WAVEFORMS.slice(1))for(const bodyPulseWidth of [.05,.95]) {
    const a=render('cowbell',{bodyWaveform,bodyPulseWidth,frequency:4000,pitchSweepSemitones:48,
      fmDepth:4,fmRatio:8,fmDecay:3},{sampleRate}).samples;
    assert.ok(a.every(x=>Number.isFinite(x)&&Math.abs(x)<=1));
    assert.equal(a[0],0);assert.equal(Math.abs(a.at(-1)),0);
  }
});

function magnitude(samples,hz,sampleRate,start,length) {
  let re=0,im=0;
  for(let j=0;j<length;j++) {
    const x=samples[start+j]*(.5-.5*Math.cos(2*Math.PI*j/(length-1)));
    const angle=2*Math.PI*hz*j/sampleRate;
    re+=x*Math.cos(angle);im+=x*Math.sin(angle);
  }
  return Math.hypot(re,im);
}
test('high-pitched shaped oscillators suppress harmonics that would fold into the audible band', () => {
  // At 16 kHz, the fourth/fifth harmonics of 2.5 kHz would alias to 6/3.5 kHz.
  // Low input gain avoids conflating source aliasing with the output saturator.
  for(const bodyWaveform of ['triangle','square','saw']) {
    const sampleRate=16000;
    const {samples}=render('kick',{...isolated,bodyWaveform,frequency:2500,bodyLevel:.001,
      bodyDecay:3,drive:0,volume:1},{sampleRate});
    const fundamental=magnitude(samples,2500,sampleRate,4000,8000);
    for(const hz of [3500,6000])assert.ok(magnitude(samples,hz,sampleRate,4000,8000)/fundamental<.0001,`${bodyWaveform}: ${hz} Hz alias`);
    if(bodyWaveform==='saw')assert.ok(magnitude(samples,5000,sampleRate,4000,8000)/fundamental>.4);
  }
});

test('square is hollow at 50% duty and narrower pulses add even harmonics', () => {
  const p={...isolated,bodyWaveform:'square',frequency:250,bodyLevel:.001,bodyDecay:3,drive:0,volume:1};
  const square=render('kick',p,{sampleRate:16000}).samples;
  const pulse=render('kick',{...p,bodyPulseWidth:.25},{sampleRate:16000}).samples;
  const ratio=s=>magnitude(s,500,16000,4000,8000)/magnitude(s,250,16000,4000,8000);
  assert.ok(ratio(square)<.001);assert.ok(ratio(pulse)>.5);
});

test('retuned patches use shapes audibly while unretuned kits retain sine defaults', () => {
  let count=0;
  for(const [id,kit] of Object.entries(KITS))for(const [voice,p] of Object.entries(kit)) {
    if(p.bodyWaveform==='sine')continue;
    count++;assert.ok(BODY_WAVEFORM_VOICES.includes(voice));
    assert.notDeepEqual(render(voice,p).samples,render(voice,{...p,bodyWaveformMix:0}).samples,`${id}/${voice}`);
  }
  assert.equal(count,19);
  for(const id of ['original-refined','808-refined','minimal'])for(const p of Object.values(KITS[id]))assert.equal(p.bodyWaveform,'sine');
});
