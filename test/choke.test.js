import test from 'node:test';
import assert from 'node:assert/strict';
import {DrumForge} from '../src/drum-forge.js';
function setup(options={}) {
 const sources=[],gains=[];
 const param=()=>({value:1,events:[],setTargetAtTime(v,t){this.events.push(['target',v,t]);},setValueAtTime(v,t){this.events.push(['set',v,t]);},cancelScheduledValues(t){this.events.push(['cancel',t]);},linearRampToValueAtTime(v,t){this.events.push(['ramp',v,t]);}});
 const node=()=>({connect(){},disconnect(){this.disconnected=true;}});
 const ctx={currentTime:5,sampleRate:44100,state:'running',destination:{},createGain(){const n={...node(),gain:param()};gains.push(n);return n;},createStereoPanner(){return {...node(),pan:param()};},createBuffer(c,n,r){return {duration:n/r,copyToChannel(){}};},createBufferSource(){const n={...node(),stops:[],start(t){this.started=t;},stop(t){this.stops.push(t);}};sources.push(n);return n;}};
 return {ctx,sources,gains,s:new DrumForge({context:ctx,...options})};
}
test('choke uses scheduled time and velocity without cutting later open hats',()=>{
 const {s,sources,gains}=setup();s.trigger('openHat',{when:8,velocity:.6});s.trigger('openHat',{when:8.3});s.trigger('closedHat',{when:8.2});
 assert.equal(sources[0].stops.at(-1),8.205);assert.equal(sources[1].stops.length,0);
 assert.ok(gains[1].gain.events.some(e=>e[0]==='set'&&e[1]===.6&&e[2]===8.2));
 assert.deepEqual(gains[1].gain.events.at(-1),['ramp',0,8.205]);assert.equal(s.active.size,3);
});
test('out-of-order and simultaneous scheduling select earliest eligible closure',()=>{
 const {s,sources}=setup();s.trigger('closedHat',{when:8.3});s.trigger('openHat',{when:8});
 assert.equal(sources[1].stops.at(-1),8.3+.005);s.trigger('closedHat',{when:8.1});assert.equal(sources[1].stops.at(-1),8.105);
 s.trigger('openHat',{when:8.1});assert.equal(sources[3].stops.at(-1),8.105);
});
test('cancelled future closed hat restores open hat or selects next closure',()=>{
 const {s,sources}=setup();s.trigger('openHat',{when:8});const first=s.trigger('closedHat',{when:8.1});const second=s.trigger('closedHat',{when:8.2});
 first.stop();assert.equal(sources[0].stops.at(-1),8.205);second.stop();assert.equal(sources[0].stops.at(-1),8+sources[0].buffer.duration);
});
test('disable and fade changes update pending closures; started fades are retained',()=>{
 const {s,sources,ctx}=setup();s.trigger('openHat',{when:8});s.trigger('closedHat',{when:8.1});
 s.setChoke({chokeFade:.02});assert.equal(sources[0].stops.at(-1),8.12);
 s.setChoke({chokeEnabled:false});assert.equal(sources[0].stops.at(-1),8+sources[0].buffer.duration);
 s.setChoke({chokeEnabled:true});assert.equal(sources[0].stops.at(-1),8.12);
 ctx.currentTime=8.11;s.setChoke({chokeEnabled:false});assert.equal(sources[0].stops.at(-1),8.12);
});
test('live pads choke immediately and manual stop/dispose still cancel scheduled audio',async()=>{
 const {s,sources,ctx}=setup();const open=s.trigger('openHat');s.trigger('closedHat');assert.equal(sources[0].stops.at(-1),5.005);
 ctx.currentTime=5.002;open.stop();assert.equal(sources[0].stops.at(-1),5.008);
 s.trigger('openHat',{when:9});s.trigger('closedHat',{when:9.2});await s.dispose();assert.equal(s.active.size,0);assert.equal(s._playbacks.size,0);
 for(const source of sources){source.onended();assert.equal(source.disconnected,true);}
});
test('disabled mode, unrelated voices, and elapsed closed hits do not choke',()=>{
 const {s,sources,ctx}=setup({chokeEnabled:false});s.trigger('openHat');s.trigger('closedHat');assert.equal(sources[0].stops.length,0);
 ctx.currentTime=5.1;s.setChoke({chokeEnabled:true});assert.equal(sources[0].stops.length,0);
 s.trigger('snare');assert.equal(sources[0].stops.length,0);
});
test('choke options validate atomically and reject writes after disposal',async()=>{
 for(const opts of [{chokeEnabled:'yes'},{chokeFade:0},{chokeFade:NaN},{chokeFade:.2}])assert.throws(()=>setup(opts));
 const {s}=setup();assert.throws(()=>s.setChoke({chokeEnabled:false,chokeFade:NaN}));assert.equal(s.chokeEnabled,true);
 assert.throws(()=>s.setChoke({typo:1}));await s.dispose();assert.throws(()=>s.setChoke({chokeEnabled:false}));
});
