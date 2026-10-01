import { DrumSynth, PRESETS, PARAMS, RESONANCE_VOICES, FM_VOICES, BODY_WAVEFORM_VOICES, render, encodeWav } from '../src/drum-synth.js';
import { KIT_ORIGINAL_REFINED, KIT_808_REFINED, KIT_ELECTRO_FM, KIT_MINIMAL, KIT_INDUSTRIAL, KIT_DEEP_DUB, KIT_RETRO_ARCADE, KIT_SOFT_DUSTY } from '../src/kits.js';
const $ = id => document.getElementById(id);
const voices = Object.keys(PRESETS), names = ['Kick','Snare','Clap','Closed hat','Open hat','Tom','Rim','Cowbell'];
const shortcuts = 'asdfghjk';
const demoKits = {'original-refined': KIT_ORIGINAL_REFINED, '808-refined': KIT_808_REFINED, 'electro-fm': KIT_ELECTRO_FM, minimal: KIT_MINIMAL, industrial: KIT_INDUSTRIAL, 'deep-dub': KIT_DEEP_DUB, 'retro-arcade': KIT_RETRO_ARCADE, 'soft-dusty': KIT_SOFT_DUSTY};
const kitInfo = {
  'original-refined':['Drum Synth','Shaped pitch sweeps, independent layers, and focused noise filters.'],
  '808-refined':['808-inspired','Deep bass drums, crisp claps, and tightly tuned metallic hats.'],
  'electro-fm':['Electro / FM','Triangle-weighted kicks, pulse snares, and FM percussion with sharper waveforms.'],
  minimal:['Minimal','Short thumps, dry claps, delicate hats, and tiny tonal clicks.'],
  'deep-dub':['Deep / Dub','Rounded low drums, dark hats, muted claps, and lingering percussion.'],
  'retro-arcade':['Retro Arcade','Square-wave bleeps, narrow pulse tones, and triangle kicks with game-inspired pitch sweeps.'],
  'soft-dusty':['Soft / Dusty','Gentle attacks, dark rattles, damped hats, and soft tonal knocks.'],
  industrial:['Industrial','Saw-driven kicks and snares, pulse-metal clangs, and detuned hats.']
};
let activeKit = 'deep-dub';
const edits = Object.fromEntries(Object.entries(demoKits).map(([id, presets]) => [id, structuredClone(presets)]));
let kit = edits[activeKit];
let selected = 'kick', synth, running = false, timer, step = 0, nextTime = 0, queue = [], bpm = 96;
let pattern = starter();
const hitStrength = () => Number($('hit-strength').value) / 100;
function starter() { return voices.map((v,i) => Array.from({length:16},(_,s) => {
  const on=(i===0&&[0,6,8,14].includes(s))||(i===1&&[4,12].includes(s))||(i===3&&s%2===0)||(i===4&&s===15);
  return on ? (s%4===0 ? 1 : .65) : (i===1&&s===11 ? .35 : 0);
})); }

function status(message) { $('status').textContent = message; }
async function enable() {
  if (!synth) synth = new DrumSynth({ volume: Number($('master').value), chokeEnabled:$('choke-enabled').checked, chokeFade:Number($('choke-fade').value)/1000 });
  await synth.resume(); status('Audio ready'); $('enable').textContent = 'Audio enabled';
}
function guarded(fn) { return async (...args) => { try { await fn(...args); } catch(error) { status(error.message); } }; }
async function hit(voice) {
  await enable(); synth.trigger(voice, { params: kit[voice], velocity:hitStrength() }); flash(voice);
}
function flash(voice) { const pad = document.querySelector(`[data-voice="${voice}"]`); pad.classList.add('hit'); setTimeout(()=>pad.classList.remove('hit'),100); }
voices.forEach((voice,i) => {
  const pad = document.createElement('button'); pad.className='pad'; pad.dataset.voice=voice;
  pad.innerHTML=`<span class="pad-top"><span class="number">0${i+1}</span><span>${shortcuts[i].toUpperCase()}</span></span><span>${names[i]}</span>`;
  pad.onclick=guarded(async()=>{ select(voice); await hit(voice); }); $('pads').append(pad);
});
const groups = [
  ['Tone & pitch', {frequency:'Frequency',pitchSweepSemitones:'Pitch sweep',pitchDecay:'Sweep time',pitchCurve:'Sweep curve',tone:'Body tone'}],
  ['Body oscillator', {bodyWaveform:'Waveform (raw tonal character)',bodyWaveformMix:'Shape blend (original → selected wave)',bodyPulseWidth:'Pulse width (square shape / hollow tone)'}],
  ['FM synthesis', {fmDepth:'FM depth (0 = off)',fmRatio:'FM ratio (× body frequency)',fmDecay:'FM decay (attack complexity)'}],
  ['Body', {bodyLevel:'Body level',attack:'Body attack',bodyDecay:'Body decay'}],
  ...[1,2,3].map(n=>[`Body resonance ${n}`, {[`resonance${n}Ratio`]:'Pitch ratio (× body frequency)',[`resonance${n}Level`]:'Added resonance level', [`resonance${n}Decay`]:'Ring decay'}]),
  ['Noise', {noiseLevel:'Noise level',noiseAttack:'Noise attack',noiseDecay:'Noise decay'}],
  ['Clap structure', {burstCount:'Burst count',burstSpacing:'Burst spacing',burstDecay:'Burst decay',tailLevel:'Tail level',tailDecay:'Tail decay',burstVariation:'Burst variation'}],
  ['Metallic source', {metalMix:'Metal / noise balance',metalDetune:'Detune',metalDamping:'Damping',metalHighpass:'Metal high-pass',metalLowpass:'Metal low-pass',metalFilterEnvAmount:'Metal sweep (+ bright / − dark start)',metalFilterEnvDecay:'Metal sweep decay'}],
  ['Noise filter', {noiseHighpass:'High-pass',noiseLowpass:'Low-pass',noiseResonance:'Resonance',noiseFilterEnvAmount:'Noise sweep (+ bright / − dark start)',noiseFilterEnvDecay:'Noise sweep decay'}],
  ['Transient', {transientType:'Impact type',transientTone:'Noise tone (dark → bright)',transientFrequency:'Knock frequency',transientMix:'Blend (noise → tonal)',transientLevel:'Transient level',transientDecay:'Transient decay'}],
  ['Velocity response', {velocityToBrightness:'Brightness response (darker on softer hits)',velocityToTransient:'Transient response (gentler click on softer hits)'}],
  ['Output', {drive:'Drive',volume:'Level'}]
];
function format(key,value) { if(key==='bodyWaveformMix' || key==='bodyPulseWidth') return `${Math.round(value*100)}%`; if(key==='fmRatio') return `${value.toFixed(2)}×`;  if(/^resonance.*Ratio$/.test(key)) return `${value.toFixed(2)}×`; if(/^resonance.*Decay$/.test(key)) return `${Math.round(value*1000)} ms`; if(key.endsWith('FilterEnvAmount')) return `${value>0?'+':''}${value.toFixed(2)} oct`;  if(key==='metalDetune') return `${value} cents`; if(key==='metalMix') return `${Math.round(value*100)}% metal`; if(key==='burstCount') return String(value); return ['fmDecay','noiseFilterEnvDecay','metalFilterEnvDecay','burstSpacing','burstDecay','tailDecay','attack','bodyDecay','noiseAttack','noiseDecay','transientDecay','pitchDecay'].includes(key) ? `${Math.round(value*1000)} ms` : ['transientFrequency','frequency','noiseHighpass','noiseLowpass','metalHighpass','metalLowpass'].includes(key) ? `${Math.round(value)} Hz` : key==='pitchSweepSemitones' ? `${value.toFixed(1)} st` : value.toFixed(2); }
function select(voice) {
  selected=voice; $('voice-title').textContent=names[voices.indexOf(voice)];
  document.querySelectorAll('.pad').forEach(p=>{p.classList.toggle('selected',p.dataset.voice===voice);p.setAttribute('aria-pressed',String(p.dataset.voice===voice));});
  $('controls').replaceChildren();
  for(const [group, labels] of groups) {
    if(group==='Body oscillator' && !BODY_WAVEFORM_VOICES.includes(voice)) continue;
    if(group==='FM synthesis' && !FM_VOICES.includes(voice)) continue;
    if(group.startsWith('Body resonance') && !RESONANCE_VOICES.includes(voice)) continue;
    if(group==='Metallic source' && !voice.includes('Hat')) continue;
    if(group==='Clap structure' && voice!=='clap') continue;
    const heading=document.createElement('h3');heading.className='control-group';heading.textContent=group;$('controls').append(heading);
    if(group==='Body oscillator') {const note=document.createElement('p');note.className='control-note';note.id='oscillator-help';note.textContent='Sine is round; triangle adds gentle edges; square is hollow; saw is buzzy. Blend 0% keeps the original sine-based body; 100% uses the selected wave. Pulse width only affects square (50% is symmetric). Raise Body level to hear it; works at 100% hit strength. Added resonances keep their sine tone.';$('controls').append(note);}
    if(group==='Noise filter' || group==='Metallic source') {
      const note=document.createElement('p');note.className='control-note';note.textContent='Sweep starts brighter (+) or darker (−), then returns to the low-pass setting. Amount 0 disables it. Works at 100% hit strength too.';$('controls').append(note);
    }
    if(group==='FM synthesis') {const note=document.createElement('p');note.className='control-note';note.textContent='Adds a complex or metallic attack to the original tonal body. Depth 0 is off; larger depth adds more modulation. Ratio changes character; decay sets how quickly it settles. Try Tom: depth 1, ratio 1.4, decay 120 ms. Works at 100% intensity.';$('controls').append(note);}
    if(group==='Body resonance 1') {const note=document.createElement('p');note.className='control-note';note.textContent='Add up to three ringing tones to the existing body. Ratio follows body pitch; each tone has its own decay. Level 0 disables a tone. Body level controls them all.';$('controls').append(note);}
    if(group==='Transient') {const note=document.createElement('p');note.className='control-note';note.textContent='Shapes the initial impact, even at 100% strength. Raise Transient level to hear it clearly; it does not change the drum body.';$('controls').append(note);}
    if(group==='Velocity response') {
      const note=document.createElement('p');note.className='control-note';note.id='velocity-help';
      note.textContent='Only affects hits below 100% strength. Higher values soften quiet hits more. Try 35% Hit strength and compare 0 with 1. In the sequencer, each step uses its own strength.';
      $('controls').append(note);
    }
    for(const [key,label] of Object.entries(labels)) {
    if(voice==='clap' && key==='noiseDecay') continue;
    if(key==='bodyWaveform') {
      const wrapper=document.createElement('div');wrapper.className='control';
      wrapper.innerHTML='<label for="param-bodyWaveform">Waveform (raw tonal character)</label><select id="param-bodyWaveform" aria-describedby="oscillator-help"><option value="sine">Sine (round)</option><option value="triangle">Triangle (gentle edges)</option><option value="square">Square / pulse (hollow)</option><option value="saw">Saw (buzzy)</option></select>';
      const input=wrapper.querySelector('select');input.value=kit[voice].bodyWaveform;
      input.onchange=()=>{kit[voice].bodyWaveform=input.value;select(voice);};$('controls').append(wrapper);continue;
    }
    if(key==='bodyWaveformMix' && kit[voice].bodyWaveform==='sine') continue;
    if(key==='bodyPulseWidth' && kit[voice].bodyWaveform!=='square') continue;
    if(key==='transientType') {
      const wrapper=document.createElement('div');wrapper.className='control';
      wrapper.innerHTML='<label for="param-transientType">Impact type</label><select id="param-transientType"><option value="noise">Noise click</option><option value="tonal">Tonal knock</option><option value="blend">Noise + tonal blend</option></select>';
      const input=wrapper.querySelector('select');input.value=kit[voice].transientType;
      input.onchange=()=>{kit[voice].transientType=input.value;select(voice);};$('controls').append(wrapper);continue;
    }
    if(key==='transientTone' && kit[voice].transientType==='tonal') continue;
    if(key==='transientFrequency' && kit[voice].transientType==='noise') continue;
    if(key==='transientMix' && kit[voice].transientType!=='blend') continue;
    const [min,max,increment]=PARAMS[key], wrapper=document.createElement('div'); wrapper.className='control';
    wrapper.innerHTML=`<label for="param-${key}"><span>${label}</span><output id="value-${key}">${format(key,kit[voice][key])}</output></label><input id="param-${key}" type="range" min="${min}" max="${max}" step="${increment}" value="${kit[voice][key]}">`;
    if(group==='Velocity response') wrapper.querySelector('input').setAttribute('aria-describedby','velocity-help');
    if(group==='Body oscillator') wrapper.querySelector('input').setAttribute('aria-describedby','oscillator-help');
    wrapper.querySelector('input').oninput=event=>{kit[voice][key]=Number(event.target.value);$(`value-${key}`).value=format(key,kit[voice][key]);draw();};
    $('controls').append(wrapper);
  }
  }
  draw();
}
function draw() {
  const {samples}=render(selected,kit[selected],{velocity:hitStrength()}); const canvas=$('wave');
  const width=canvas.clientWidth||450, height=82, dpr=devicePixelRatio||1;
  canvas.width=width*dpr;canvas.height=height*dpr;
  const ctx=canvas.getContext('2d');ctx.scale(dpr,dpr);ctx.clearRect(0,0,width,height);
  ctx.strokeStyle='#353e2d';ctx.beginPath();ctx.moveTo(0,height/2);ctx.lineTo(width,height/2);ctx.stroke();
  ctx.strokeStyle='#d4f67a';ctx.beginPath();
  for(let x=0;x<width;x++){let min=0,max=0;const a=Math.floor(x*samples.length/width),b=Math.floor((x+1)*samples.length/width);for(let i=a;i<b;i++){min=Math.min(min,samples[i]);max=Math.max(max,samples[i]);}ctx.moveTo(x,height/2+min*35);ctx.lineTo(x,height/2+max*35);}ctx.stroke();
}
function buildGrid() {
  $('intensity-hint').textContent=$('use-intensity').checked
    ? 'Click a step to cycle: off → soft · (35%) → normal •• (65%) → accent ! (100%) → off.'
    : 'Click a step to toggle off / 100% intensity. Enable Use intensity for soft, normal, and accented hits.';
  $('grid').replaceChildren(); const numbers=document.createElement('div');numbers.className='row numbers';numbers.innerHTML='<span></span>'+Array.from({length:16},(_,i)=>`<span>${i+1}</span>`).join('');$('grid').append(numbers);
  voices.forEach((voice,i)=>{const row=document.createElement('div');row.className='row';const label=document.createElement('span');label.className='row-label';label.textContent=names[i];row.append(label);
    pattern[i].forEach((velocity,s)=>{
      const button=document.createElement('button');button.className=`step ${s%4===0?'beat':''}`;button.dataset.step=s;
      const update=()=>{
        const v=pattern[i][s] ? ($('use-intensity').checked ? pattern[i][s] : 1) : 0;button.classList.toggle('on',v>0);
        button.dataset.velocity=String(v);button.textContent=v===0?'':v===.35?'·':v===.65?'••':'!';
        const label=`${names[i]} step ${s+1}: ${v===0?'off':Math.round(v*100)+'% strength'}`;
        button.setAttribute('aria-label',label);button.setAttribute('aria-pressed',String(v>0));button.title=label;
      };
      button.onclick=()=>{
        if($('use-intensity').checked){const levels=[0,.35,.65,1];pattern[i][s]=levels[(levels.indexOf(pattern[i][s])+1)%levels.length];}
        else pattern[i][s]=pattern[i][s] ? 0 : 1;
        update();
      };
      update();row.append(button);
    });$('grid').append(row);
  });
}
function schedule() {
  if(!running)return;
  // If the tab was throttled, restart from now instead of emitting a burst of old hits.
  if(nextTime<synth.context.currentTime)nextTime=synth.context.currentTime+.02;
  while(nextTime<synth.context.currentTime+.1){
    voices.forEach((voice,i)=>{if(pattern[i][step])synth.trigger(voice,{when:nextTime,params:kit[voice],velocity:$('use-intensity').checked ? pattern[i][step] : 1});});
    queue.push({time:nextTime,step});step=(step+1)%16;nextTime+=60/bpm/4;
  }
}
function stop() {running=false;clearInterval(timer);queue=[];if(synth)synth.stopAll();$('play').textContent='Play groove';$('play').setAttribute('aria-pressed','false');document.querySelectorAll('.current').forEach(e=>e.classList.remove('current'));}
async function toggle() {if(running){stop();return;}await enable();running=true;step=0;nextTime=synth.context.currentTime+.06;$('play').textContent='Stop groove';$('play').setAttribute('aria-pressed','true');schedule();timer=setInterval(schedule,25);}
function animate(){if(running&&synth){while(queue.length&&queue[0].time<=synth.context.currentTime){const event=queue.shift();document.querySelectorAll('.step').forEach(e=>e.classList.toggle('current',Number(e.dataset.step)===event.step));}}requestAnimationFrame(animate);}
function download(data,type,name){const url=URL.createObjectURL(new Blob([data],{type}));const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
$('enable').onclick=guarded(enable);$('audition').onclick=guarded(()=>hit(selected));$('play').onclick=guarded(toggle);
$('choke-enabled').onchange=()=>synth?.setChoke({chokeEnabled:$('choke-enabled').checked});
$('choke-fade').oninput=()=>{const ms=Number($('choke-fade').value);$('choke-value').value=`${ms} ms`;synth?.setChoke({chokeFade:ms/1000});};
$('hit-strength').oninput=()=>{$('hit-strength-value').value=`${$('hit-strength').value}%`;draw();};
$('master').oninput=()=>synth?.setVolume(Number($('master').value));
$('bpm').onchange=()=>{const value=Number($('bpm').value);bpm=Number.isFinite(value)?Math.max(40,Math.min(240,value)):110;$('bpm').value=bpm;};
$('reset').onclick=()=>{kit[selected]={...demoKits[activeKit][selected]};select(selected);};
async function changeKit(id) {
  const resume = running; stop(); activeKit=id; kit=edits[activeKit]; $('kit').value=id;
  select(selected);
  const [name,description]=kitInfo[id];
  $('pack-description').textContent = description;
  if(resume) await toggle();
  status(`${name} kit loaded`);
}
$('kit').onchange=guarded(()=>changeKit($('kit').value));
$('use-intensity').onchange=buildGrid;
$('clear').onclick=()=>{pattern=voices.map(()=>Array(16).fill(0));buildGrid();};$('restore').onclick=()=>{pattern=starter();buildGrid();};
$('export').onclick=guarded(()=>{download(encodeWav(render(selected,kit[selected],{velocity:hitStrength()})),'audio/wav',`drum-synth-${activeKit}-${selected}-v${Math.round(hitStrength()*100)}.wav`);status('WAV exported');});
$('preset').onclick=()=>download(JSON.stringify({kit:activeKit,voice:selected,params:kit[selected]},null,2),'application/json',`${activeKit}-${selected}-preset.json`);
document.addEventListener('keydown',guarded(async event=>{if(event.repeat||event.ctrlKey||event.metaKey||event.altKey||['INPUT','BUTTON','TEXTAREA','SELECT'].includes(event.target.tagName))return;const index=shortcuts.indexOf(event.key.toLowerCase());if(index>=0){event.preventDefault();select(voices[index]);await hit(voices[index]);}else if(event.code==='Space'){event.preventDefault();await toggle();}}));
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
window.addEventListener('resize',draw);window.addEventListener('pagehide',()=>{stop();synth?.dispose();synth=undefined;});
select(selected);buildGrid();animate();
