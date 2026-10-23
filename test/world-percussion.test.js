import test from 'node:test';
import assert from 'node:assert/strict';
import {render,resolveParams,PRESETS,encodeWav} from '../src/drum-synth.js';
import {KITS,KIT_WEST_AFRICAN,WEST_AFRICAN_PERCUSSION,WEST_AFRICAN_LABELS,WEST_AFRICAN_GROOVE,
 KIT_MIDDLE_EASTERN,MIDDLE_EASTERN_PERCUSSION,MIDDLE_EASTERN_LABELS,MIDDLE_EASTERN_GROOVE,
 KIT_LATIN,LATIN_PERCUSSION,LATIN_LABELS,LATIN_GROOVE} from '../src/kits.js';
const packs=[
 ['west-african',KIT_WEST_AFRICAN,WEST_AFRICAN_PERCUSSION,WEST_AFRICAN_LABELS,WEST_AFRICAN_GROOVE,112],
 ['middle-eastern',KIT_MIDDLE_EASTERN,MIDDLE_EASTERN_PERCUSSION,MIDDLE_EASTERN_LABELS,MIDDLE_EASTERN_GROOVE,104],
 ['latin',KIT_LATIN,LATIN_PERCUSSION,LATIN_LABELS,LATIN_GROOVE,116]
];
const energy=a=>a.reduce((s,x)=>s+x*x,0);
for(const [id,kit,sounds,labels,groove,bpm] of packs) {
 test(`${id}: eight named, distinct, deterministic sounds with valid PCM and WAVs`,()=>{
  assert.equal(KITS[id],kit);assert.ok(Object.isFrozen(kit)&&Object.isFrozen(sounds));
  assert.deepEqual(Object.keys(kit),Object.keys(PRESETS));
  const signatures=new Set();
  for(const [name,{voice,params}] of Object.entries(sounds)) {
   assert.equal(kit[voice],params);assert.equal(labels[voice],sounds[name].name);
   assert.ok(Object.isFrozen(params));assert.deepEqual(params,resolveParams(voice,params));
   const a=render(voice,params);assert.deepEqual(a,render(voice,params));
   signatures.add(JSON.stringify([...a.samples.slice(0,256)]));
   assert.equal(encodeWav(a).byteLength,44+a.samples.length*2);
   for(const sampleRate of [8000,44100,96000])for(const velocity of [0,.35,1]) {
    const b=render(voice,params,{sampleRate,velocity}).samples;
    assert.ok(b.every(s=>Number.isFinite(s)&&Math.abs(s)<1),name);
    assert.equal(Math.abs(b[0]),0);assert.equal(Math.abs(b.at(-1)),0);
    assert.ok(velocity===0 ? energy(b)===0 : energy(b)>1e-4,name);
   }
   assert.ok(Object.isFrozen(groove[voice]));assert.equal(groove[voice].length,16);
   assert.ok(groove[voice].some(v=>v>0));assert.ok(groove[voice].every(v=>[0,.35,.65,1].includes(v)));
  }
  assert.equal(signatures.size,8);
 });
 test(`${id}: groove leaves headroom with full intensity and accents`,()=>{
  const rate=44100,stepTime=60/bpm/4;
  for(const accents of [true,false]) {
   const mix=new Float32Array(rate*8);
   for(const {voice,params} of Object.values(sounds))for(let step=0;step<32;step++) {
    const v=groove[voice][step%16];if(!v)continue;
    const a=render(voice,params,{velocity:accents?v:1}).samples,start=Math.round(step*stepTime*rate);
    for(let i=0;i<a.length&&start+i<mix.length;i++)mix[start+i]+=.7*a[i];
   }
   const peak=mix.reduce((m,v)=>Math.max(m,Math.abs(v)),0);
   assert.ok(peak>.1&&peak<.95,`${id} master peak ${peak}`);
  }
 });
}
test('talking-drum bend is an audible gesture with an exact neutral bypass',()=>{
 const open=WEST_AFRICAN_PERCUSSION.talkingDrumOpen,bend=WEST_AFRICAN_PERCUSSION.talkingDrumBend;
 const a=render(open.voice,open.params);
 assert.notDeepEqual(a,render(bend.voice,bend.params));
 assert.deepEqual(a,render(bend.voice,{...bend.params,pitchBendSemitones:0}));
});
test('slaps have shorter tails than their open-tone partners',()=>{
 for(const [sounds,openId,slapId] of [[WEST_AFRICAN_PERCUSSION,'djembeTone','djembeSlap'],
  [MIDDLE_EASTERN_PERCUSSION,'darbukaTek','darbukaSlap'],[LATIN_PERCUSSION,'congaOpen','congaSlap']]) {
  const open=sounds[openId],slap=sounds[slapId];
  const a=render(open.voice,open.params),b=render(slap.voice,slap.params);
  assert.ok(b.duration<a.duration*.6,slapId);
  assert.ok(energy(b.samples.slice(4410))<energy(a.samples.slice(4410))*.1,slapId);
 }
});
test('guiro has repeated scrape pulses with adjustable tooth spacing',()=>{
 const {voice,params}=LATIN_PERCUSSION.guiro;
 const p={...params,burstVariation:0,transientLevel:0,tailLevel:0};
 const a=render(voice,p).samples,rate=44100;
 for(let n=1;n<7;n++) {
  const at=n*p.burstSpacing;
  const hit=energy(a.slice(Math.floor((at+.001)*rate),Math.floor((at+.005)*rate)));
  const gap=energy(a.slice(Math.floor((at+.014)*rate),Math.floor((at+.018)*rate)));
  assert.ok(hit>gap*3,`scrape ridge ${n}`);
 }
 assert.notDeepEqual(a,render(voice,{...p,burstSpacing:.03}).samples);
});
