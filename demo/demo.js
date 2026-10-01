import { DrumForge, PRESETS, PARAMS, render, encodeWav } from '../src/drum-forge.js';
import { KIT_ORIGINAL_REFINED, KIT_808_REFINED } from '../src/kits.js';
const $ = id => document.getElementById(id);
const voices = Object.keys(PRESETS), names = ['Kick','Snare','Clap','Closed hat','Open hat','Tom','Rim','Cowbell'];
const shortcuts = 'asdfghjk';
const demoKits = {'original-refined': KIT_ORIGINAL_REFINED, '808-refined': KIT_808_REFINED};
let activeKit = '808-refined';
const edits = Object.fromEntries(Object.entries(demoKits).map(([id, presets]) => [id, structuredClone(presets)]));
let kit = edits[activeKit];
let selected = 'kick', synth, running = false, timer, step = 0, nextTime = 0, queue = [], bpm = 96;
let pattern = starter();
function starter() { return voices.map((v,i) => Array.from({length:16},(_,s) => (i===0&&[0,6,8,14].includes(s))||(i===1&&[4,12].includes(s))||(i===3&&s%2===0)||(i===4&&s===15))); }
function status(message) { $('status').textContent = message; }
async function enable() {
  if (!synth) synth = new DrumForge({ volume: Number($('master').value) });
  await synth.resume(); status('Audio ready'); $('enable').textContent = 'Audio enabled';
}
function guarded(fn) { return async (...args) => { try { await fn(...args); } catch(error) { status(error.message); } }; }
async function hit(voice) {
  await enable(); synth.trigger(voice, { params: kit[voice] }); flash(voice);
}
function flash(voice) { const pad = document.querySelector(`[data-voice="${voice}"]`); pad.classList.add('hit'); setTimeout(()=>pad.classList.remove('hit'),100); }
voices.forEach((voice,i) => {
  const pad = document.createElement('button'); pad.className='pad'; pad.dataset.voice=voice;
  pad.innerHTML=`<span class="pad-top"><span class="number">0${i+1}</span><span>${shortcuts[i].toUpperCase()}</span></span><span>${names[i]}</span>`;
  pad.onclick=guarded(async()=>{ select(voice); await hit(voice); }); $('pads').append(pad);
});
const groups = [
  ['Tone & pitch', {frequency:'Frequency',pitchSweepSemitones:'Pitch sweep',pitchDecay:'Sweep time',pitchCurve:'Sweep curve',tone:'Body tone'}],
  ['Body', {bodyLevel:'Body level',attack:'Body attack',bodyDecay:'Body decay'}],
  ['Noise', {noiseLevel:'Noise level',noiseAttack:'Noise attack',noiseDecay:'Noise decay'}],
  ['Noise filter', {noiseHighpass:'High-pass',noiseLowpass:'Low-pass',noiseResonance:'Resonance'}],
  ['Transient', {transientLevel:'Transient level',transientDecay:'Transient decay'}],
  ['Output', {drive:'Drive',volume:'Level'}]
];
function format(key,value) { return ['attack','bodyDecay','noiseAttack','noiseDecay','transientDecay','pitchDecay'].includes(key) ? `${Math.round(value*1000)} ms` : ['frequency','noiseHighpass','noiseLowpass'].includes(key) ? `${Math.round(value)} Hz` : key==='pitchSweepSemitones' ? `${value.toFixed(1)} st` : value.toFixed(2); }
function select(voice) {
  selected=voice; $('voice-title').textContent=names[voices.indexOf(voice)];
  document.querySelectorAll('.pad').forEach(p=>{p.classList.toggle('selected',p.dataset.voice===voice);p.setAttribute('aria-pressed',String(p.dataset.voice===voice));});
  $('controls').replaceChildren();
  for(const [group, labels] of groups) {
    const heading=document.createElement('h3');heading.className='control-group';heading.textContent=group;$('controls').append(heading);
    for(const [key,label] of Object.entries(labels)) {
    const [min,max,increment]=PARAMS[key], wrapper=document.createElement('div'); wrapper.className='control';
    wrapper.innerHTML=`<label for="param-${key}">${label}<output id="value-${key}">${format(key,kit[voice][key])}</output></label><input id="param-${key}" type="range" min="${min}" max="${max}" step="${increment}" value="${kit[voice][key]}">`;
    wrapper.querySelector('input').oninput=event=>{kit[voice][key]=Number(event.target.value);$(`value-${key}`).value=format(key,kit[voice][key]);draw();};
    $('controls').append(wrapper);
  }
  }
  draw();
}
function draw() {
  const {samples}=render(selected,kit[selected]); const canvas=$('wave');
  const width=canvas.clientWidth||450, height=82, dpr=devicePixelRatio||1;
  canvas.width=width*dpr;canvas.height=height*dpr;
  const ctx=canvas.getContext('2d');ctx.scale(dpr,dpr);ctx.clearRect(0,0,width,height);
  ctx.strokeStyle='#353e2d';ctx.beginPath();ctx.moveTo(0,height/2);ctx.lineTo(width,height/2);ctx.stroke();
  ctx.strokeStyle='#d4f67a';ctx.beginPath();
  for(let x=0;x<width;x++){let min=0,max=0;const a=Math.floor(x*samples.length/width),b=Math.floor((x+1)*samples.length/width);for(let i=a;i<b;i++){min=Math.min(min,samples[i]);max=Math.max(max,samples[i]);}ctx.moveTo(x,height/2+min*35);ctx.lineTo(x,height/2+max*35);}ctx.stroke();
}
function buildGrid() {
  $('grid').replaceChildren(); const numbers=document.createElement('div');numbers.className='row numbers';numbers.innerHTML='<span></span>'+Array.from({length:16},(_,i)=>`<span>${i+1}</span>`).join('');$('grid').append(numbers);
  voices.forEach((voice,i)=>{const row=document.createElement('div');row.className='row';const label=document.createElement('span');label.className='row-label';label.textContent=names[i];row.append(label);
    pattern[i].forEach((enabled,s)=>{const button=document.createElement('button');button.className=`step ${s%4===0?'beat':''} ${enabled?'on':''}`;button.dataset.step=s;button.setAttribute('aria-label',`${names[i]} step ${s+1}`);button.setAttribute('aria-pressed',String(enabled));button.onclick=()=>{pattern[i][s]=!pattern[i][s];button.classList.toggle('on',pattern[i][s]);button.setAttribute('aria-pressed',String(pattern[i][s]));};row.append(button);});$('grid').append(row);
  });
}
function schedule() {
  if(!running)return;
  // If the tab was throttled, restart from now instead of emitting a burst of old hits.
  if(nextTime<synth.context.currentTime)nextTime=synth.context.currentTime+.02;
  while(nextTime<synth.context.currentTime+.1){
    voices.forEach((voice,i)=>{if(pattern[i][step])synth.trigger(voice,{when:nextTime,params:kit[voice],velocity:step%4===0?1:.82});});
    queue.push({time:nextTime,step});step=(step+1)%16;nextTime+=60/bpm/4;
  }
}
function stop() {running=false;clearInterval(timer);queue=[];if(synth)synth.stopAll();$('play').textContent='Play groove';$('play').setAttribute('aria-pressed','false');document.querySelectorAll('.current').forEach(e=>e.classList.remove('current'));}
async function toggle() {if(running){stop();return;}await enable();running=true;step=0;nextTime=synth.context.currentTime+.06;$('play').textContent='Stop groove';$('play').setAttribute('aria-pressed','true');schedule();timer=setInterval(schedule,25);}
function animate(){if(running&&synth){while(queue.length&&queue[0].time<=synth.context.currentTime){const event=queue.shift();document.querySelectorAll('.step').forEach(e=>e.classList.toggle('current',Number(e.dataset.step)===event.step));}}requestAnimationFrame(animate);}
function download(data,type,name){const url=URL.createObjectURL(new Blob([data],{type}));const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
$('enable').onclick=guarded(enable);$('audition').onclick=guarded(()=>hit(selected));$('play').onclick=guarded(toggle);
$('master').oninput=()=>synth?.setVolume(Number($('master').value));
$('bpm').onchange=()=>{const value=Number($('bpm').value);bpm=Number.isFinite(value)?Math.max(40,Math.min(240,value)):110;$('bpm').value=bpm;};
$('reset').onclick=()=>{kit[selected]={...demoKits[activeKit][selected]};select(selected);};
async function changeKit(id) {
  const resume = running; stop(); activeKit=id; kit=edits[activeKit]; $('kit').value=id;
  select(selected);
  const name=id.startsWith('808') ? '808-inspired' : 'Drum Forge';
  $('pack-description').textContent = `${name} kit · shaped pitch sweeps, independent layers, and focused noise filters.`;
  if(resume) await toggle();
  status(`${name} kit loaded`);
}
$('kit').onchange=guarded(()=>changeKit($('kit').value));
$('clear').onclick=()=>{pattern=voices.map(()=>Array(16).fill(false));buildGrid();};$('restore').onclick=()=>{pattern=starter();buildGrid();};
$('export').onclick=guarded(()=>{download(encodeWav(render(selected,kit[selected])),'audio/wav',`drum-forge-${activeKit}-${selected}.wav`);status('WAV exported');});
$('preset').onclick=()=>download(JSON.stringify({kit:activeKit,voice:selected,params:kit[selected]},null,2),'application/json',`${activeKit}-${selected}-preset.json`);
document.addEventListener('keydown',guarded(async event=>{if(event.repeat||event.ctrlKey||event.metaKey||event.altKey||['INPUT','BUTTON','TEXTAREA','SELECT'].includes(event.target.tagName))return;const index=shortcuts.indexOf(event.key.toLowerCase());if(index>=0){event.preventDefault();select(voices[index]);await hit(voices[index]);}else if(event.code==='Space'){event.preventDefault();await toggle();}}));
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
window.addEventListener('resize',draw);window.addEventListener('pagehide',()=>{stop();synth?.dispose();synth=undefined;});
select(selected);buildGrid();animate();
