import test from 'node:test';
import assert from 'node:assert/strict';
import {render,resolveParams,PARAMS,PRESETS} from '../src/drum-synth.js';
import {INDIAN_PERCUSSION,KIT_INDIAN,KITS,INDIAN_GROOVE,INDIAN_LABELS,INDIAN_PERCUSSION_2,KIT_INDIAN_2,INDIAN_2_GROOVE,INDIAN_2_LABELS} from '../src/kits.js';
const energy = samples => samples.reduce((sum,s)=>sum+s*s,0);
for (const [kitId,sounds,kit,groove,labels] of [
  ['indian',INDIAN_PERCUSSION,KIT_INDIAN,INDIAN_GROOVE,INDIAN_LABELS],
  ['indian-2',INDIAN_PERCUSSION_2,KIT_INDIAN_2,INDIAN_2_GROOVE,INDIAN_2_LABELS]
]) test(`${kitId}: eight named, frozen, distinct and playable instruments`,()=>{
  assert.equal(KITS[kitId],kit);
  assert.deepEqual(Object.keys(kit),Object.keys(PRESETS));
  const fingerprints=new Set();
  for(const [id,{name,voice,params}] of Object.entries(sounds)) {
    assert.equal(labels[voice],name);assert.equal(kit[voice],params);
    assert.ok(Object.isFrozen(params));assert.deepEqual(resolveParams(voice,params),params);
    const a=render(voice,params);assert.deepEqual(a,render(voice,params));
    fingerprints.add(JSON.stringify([...a.samples.slice(0,200)]));
    for(const sampleRate of [8000,44100,96000])for(const velocity of [0,.35,1]) {
      const b=render(voice,params,{sampleRate,velocity});
      assert.ok(b.samples.every(s=>Number.isFinite(s)&&Math.abs(s)<1),id);
      assert.equal(Math.abs(b.samples[0]),0);assert.equal(Math.abs(b.samples.at(-1)),0);
      assert.ok(velocity===0 ? energy(b.samples)===0 : energy(b.samples)>1e-4,id);
    }
    assert.equal(groove[voice].length,16);
    assert.ok(groove[voice].some(v=>v>0));
    assert.ok(groove[voice].every(v=>[0,.35,.65,1].includes(v)));
  }
  assert.equal(fingerprints.size,8);
});
test('muted tabla has substantially less late energy than the open stroke',()=>{
  const open=INDIAN_PERCUSSION.tablaOpen, muted=INDIAN_PERCUSSION.tablaMuted;
  const a=render(open.voice,open.params),b=render(muted.voice,muted.params);
  assert.ok(b.duration<a.duration*.25);
  assert.ok(energy(b.samples.slice(2205)) < energy(a.samples.slice(2205))*.03);
});
const pure={bodyModel:'modal',frequency:100,bodyLevel:.3,bodyDecay:2,noiseLevel:0,transientLevel:0,pitchSweepSemitones:0,strikePosition:0};
function hz(samples,from,to,sampleRate=44100) {
  const crossings=[];
  for(let i=Math.floor(from*sampleRate);i<Math.floor(to*sampleRate);i++)if(samples[i]<=0&&samples[i+1]>0)crossings.push(i);
  return (crossings.length-1)*sampleRate/(crossings.at(-1)-crossings[0]);
}
test('pressure bend rises to the requested interval and returns to the original tuning',()=>{
  const params={...pure,pitchBendSemitones:7,pitchBendTime:.14,pitchBendRelease:.34};
  const a=render('tom',params).samples;
  assert.ok(hz(a,.115,.165)>142);assert.ok(hz(a,.115,.165)<152);
  assert.ok(Math.abs(hz(a,.5,.65)-100)<1);
  const down=render('tom',{...params,pitchBendSemitones:-7}).samples;
  assert.ok(hz(down,.11,.18)<72);
  assert.deepEqual(render('tom',pure),render('tom',{...pure,pitchBendTime:.5,pitchBendRelease:2}));
});
test('modal damping shortens ringing, and position changes partial balance',()=>{
  const p={...pure,resonance1Ratio:3,resonance1Level:.5,resonance1Decay:1.5};
  const open=render('clap',p),muted=render('clap',{...p,damping:.8});
  assert.ok(muted.duration<open.duration*.15);
  assert.ok(energy(muted.samples.slice(2205))<energy(open.samples.slice(2205))*.01);
  const edge=render('clap',{...p,strikePosition:1});
  assert.notDeepEqual(open.samples,edge.samples);
  // Position favours upper partials; a third partial crosses zero more often at the edge.
  assert.ok(hz(edge.samples,.02,.09)>hz(open.samples,.02,.09));
});
test('modal synthesis works in every slot and ignores classic sources',()=>{
  const p={...pure,resonance4Ratio:4,resonance4Level:.2,resonance4Decay:.3,resonance5Level:.1};
  const expected=render('kick',p);
  for(const voice of Object.keys(PRESETS)) {
    // Full resolved params remove voice-specific noise/filter defaults.
    assert.deepEqual(render(voice,resolveParams('kick',p)),expected);
    assert.deepEqual(render(voice,{...resolveParams('kick',p),fmDepth:4,bodyWaveform:'saw',metalMix:0,burstCount:8}),expected);
  }
  assert.notDeepEqual(expected,render('kick',{...p,resonance4Level:0,resonance5Level:0}));
});
test('new model and gesture parameters validate and neutral settings preserve classic output',()=>{
  for(const bodyModel of [null,'tabla',1,undefined])assert.throws(()=>resolveParams('tom',{bodyModel}));
  for(const key of ['strikePosition','damping','pitchBendSemitones','pitchBendTime','pitchBendRelease']) {
    const [min,max]=PARAMS[key];for(const value of [null,NaN,Infinity,min-1,max+1])assert.throws(()=>resolveParams('tom',{[key]:value}));
  }
  for(const voice of Object.keys(PRESETS))assert.deepEqual(render(voice),render(voice,{bodyModel:'classic',strikePosition:1,damping:1,pitchBendSemitones:0,resonance4Level:0,resonance5Level:0}));
});

test('mridangam muted stroke is shorter and new pack differs from Indian I',()=>{
  const a=INDIAN_PERCUSSION_2.mridangamTreble,b=INDIAN_PERCUSSION_2.mridangamMuted;
  const open=render(a.voice,a.params),muted=render(b.voice,b.params);
  assert.ok(muted.duration<open.duration*.25);
  assert.ok(energy(muted.samples.slice(2205))<energy(open.samples.slice(2205))*.03);
  for(const voice of Object.keys(PRESETS))assert.notDeepEqual(render(voice,KIT_INDIAN_2[voice]),render(voice,KIT_INDIAN[voice]));
  assert.notDeepEqual(INDIAN_2_GROOVE,INDIAN_GROOVE);
});
test('Indian II groove has headroom with accents and with full intensity',()=>{
  const sampleRate=44100,stepSeconds=60/108/4;
  for(const dynamic of [true,false]) {
    const mix=new Float32Array(Math.ceil(sampleRate*7));
    for(const {voice,params} of Object.values(INDIAN_PERCUSSION_2))for(let step=0;step<32;step++) {
      const v=INDIAN_2_GROOVE[voice][step%16];if(!v)continue;
      const sound=render(voice,params,{sampleRate,velocity:dynamic?v:1}).samples;
      const offset=Math.round(step*stepSeconds*sampleRate);
      for(let i=0;i<sound.length&&offset+i<mix.length;i++)mix[offset+i]+=sound[i]*.7;
    }
    const peak=mix.reduce((m,v)=>Math.max(m,Math.abs(v)),0);
    assert.ok(peak>.1 && peak<.95,`default master peak ${peak}`);
  }
});
