(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))n(s);new MutationObserver(s=>{for(const r of s)if(r.type==="childList")for(const o of r.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&n(o)}).observe(document,{childList:!0,subtree:!0});function t(s){const r={};return s.integrity&&(r.integrity=s.integrity),s.referrerPolicy&&(r.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?r.credentials="include":s.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function n(s){if(s.ep)return;s.ep=!0;const r=t(s);fetch(s.href,r)}})();const ii=[{key:"subBass",lo:20,hi:60},{key:"bass",lo:60,hi:160},{key:"lowMid",lo:160,hi:400},{key:"mid",lo:400,hi:1200},{key:"highMid",lo:1200,hi:3200},{key:"presence",lo:3200,hi:7e3},{key:"air",lo:7e3,hi:16e3}],si=[{id:"rave-140",title:"Rave Energy 140 BPM",artist:"Pixabay · Energy",url:"https://cdn.pixabay.com/download/audio/2021/08/09/audio_0625c1539c.mp3?filename=energy-115010.mp3",bpm:140},{id:"rave-128",title:"Neon Pulse 128 BPM",artist:"Pixabay · Epic",url:"https://cdn.pixabay.com/download/audio/2022/03/24/audio_d1718ab41b.mp3?filename=electronic-rock-112719.mp3",bpm:128},{id:"rave-150",title:"Hyper Drive 150 BPM",artist:"Pixabay · Hyper",url:"https://cdn.pixabay.com/download/audio/2022/10/30/audio_8ef11c7db6.mp3?filename=cyberpunk-138757.mp3",bpm:150}],lt=64,On=1024,ns=12,hc=60,dc=.3,fc=.008,pc=.3,mc=.008,tr=.06,gc=.02,_c=.34,vc=.15,xc=12;function Xt(i){return i<0?0:i>1?1:i}function is(i,e){if(i.ceil+=(e>i.ceil?dc:fc)*(e-i.ceil),i.floor+=(e<i.floor?pc:mc)*(e-i.floor),i.ceil<gc)return 0;let t=i.floor,n=i.ceil;if(n-t<tr){const s=(n+t)*.5;t=s-tr*.5,n=s+tr*.5}return Xt((e-t)/(n-t))}class Mc{static _rangeNorm=is;BAND_COUNT=lt;WAVE_COUNT=On;ctx=null;analyser=null;gainTrim=null;freqData=null;waveData=null;sourceNode=null;stream=null;mediaEl=null;captureKind="none";started=!1;sourceLabel="none";lastSoundAt=0;beatTimes=[];lastBeatAt=0;synth={enabled:!0,bpm:120,phase:0,seed:Math.random()*1e3};demoIdx=0;bands;metrics;bandEdges=null;bandDefBins=null;chromaMap=null;binPeak=new Float32Array(lt);binPrev=new Float32Array(lt);binRange=Array.from({length:lt},()=>({floor:0,ceil:0}));energyRange={floor:0,ceil:0};driveHistory=new Array(hc).fill(0);autoGain=1;config={gain:1.2,sensitivity:1.5,smoothing:.82,adaptive:1,autoLevel:!1,attack:.55,release:.08};onStatusCb=()=>{};constructor(){const e={};ii.forEach(t=>e[t.key]={key:t.key,raw:0,level:0,norm:0,env:0,onset:0,peak:0,floor:0,ceil:0,prev:0,hit:!1}),this.bands=e,this.metrics={bass:0,lowMid:0,mid:0,highMid:0,treble:0,band:e,bands:new Float32Array(lt),bandsNorm:new Float32Array(lt),onsets:new Float32Array(lt),peaks:new Float32Array(lt),wave:new Float32Array(On),chroma:new Float32Array(ns),chromaPeak:0,centroid:.5,spread:.5,flux:0,level:0,saturation:0,autoGain:1,energy:0,beat:!1,beatPulse:0,beatCount:0,bpm:0,live:!1,synthetic:!0}}ensureContext(){if(this.ctx)return this.ctx;const e=window.AudioContext||window.webkitAudioContext;return this.ctx=new e,this.analyser=this.ctx.createAnalyser(),this.analyser.fftSize=4096,this.analyser.smoothingTimeConstant=this.config.smoothing,this.analyser.minDecibels=-95,this.analyser.maxDecibels=-10,this.gainTrim=this.ctx.createGain(),this.gainTrim.gain.value=1,this.gainTrim.connect(this.analyser),this.freqData=new Uint8Array(this.analyser.frequencyBinCount),this.waveData=new Uint8Array(this.analyser.fftSize),this.started=!0,this.ctx}unlock(){this.ensureContext(),this.ctx.state==="suspended"&&this.ctx.resume();try{const e=this.ctx.createBuffer(1,1,22050),t=this.ctx.createBufferSource();t.buffer=e,t.connect(this.ctx.destination),t.start(0)}catch{}}resume(){this.ctx&&this.ctx.state==="suspended"&&this.ctx.resume()}disconnect(){if(this.sourceNode){try{this.sourceNode.disconnect()}catch{}this.sourceNode=null}if(this.stream&&(this.stream.getTracks().forEach(e=>e.stop()),this.stream=null),this.mediaEl){try{this.mediaEl.pause()}catch{}this.mediaEl=null}this.sourceLabel="none",this.captureKind="none",this.metrics.live=!1}resetAdaptive(){for(let e=0;e<lt;e++)this.binPeak[e]=0,this.binRange[e].floor=0,this.binRange[e].ceil=0;ii.forEach(e=>{const t=this.bands[e.key];t.peak=0,t.floor=0,t.ceil=0}),this.energyRange.floor=0,this.energyRange.ceil=0,this.autoGain=1,this.gainTrim&&(this.gainTrim.gain.value=1)}attachStream(e,t){this.ensureContext(),this.disconnect(),this.resume(),this.stream=e,this.sourceNode=this.ctx.createMediaStreamSource(e),this.sourceNode.connect(this.gainTrim),this.sourceLabel=t,this.lastSoundAt=performance.now(),this.resetAdaptive(),e.getTracks().forEach(n=>n.addEventListener("ended",()=>{this.stream===e&&(this.disconnect(),this.onStatusCb("ended",t))})),this.onStatusCb("connected",t)}hasLiveCapture(){return this.captureKind==="display"&&this.stream&&this.stream.getAudioTracks().some(e=>e.readyState==="live")}isStarted(){return this.started}sourceLabelStr(){return this.sourceLabel}onStatus(e){this.onStatusCb=e}setSynthetic(e,t){this.synth.enabled=!!e,t&&(this.synth.bpm=t),this.metrics.synthetic=this.synth.enabled}setAutoLevel(e){this.config.autoLevel=!!e,!e&&this.gainTrim&&(this.autoGain=1,this.gainTrim.gain.value=1)}setSmoothing(e){this.config.smoothing=e,this.analyser&&(this.analyser.smoothingTimeConstant=e)}async useMicrophone(){try{const e=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:!1,noiseSuppression:!1,autoGainControl:!1},video:!1});return this.attachStream(e,"microphone"),this.captureKind="mic",!0}catch{return this.onStatusCb("error","Microphone access was denied."),!1}}async useSystemAudio(e,t){if(!t&&this.hasLiveCapture())return this.sourceLabel=e||this.sourceLabel,this.resetAdaptive(),this.onStatusCb("connected",this.sourceLabel+" (already capturing)"),!0;if(!navigator.mediaDevices||!navigator.mediaDevices.getDisplayMedia)return this.onStatusCb("error","This browser cannot capture system audio."),!1;try{const n=await navigator.mediaDevices.getDisplayMedia({preferCurrentTab:!0,systemAudio:"include",video:!0,audio:{echoCancellation:!1,noiseSuppression:!1,autoGainControl:!1}});return n.getAudioTracks().length===0?(n.getTracks().forEach(s=>s.stop()),this.onStatusCb("error",'No audio track shared — tick "Share system audio" / "Share tab audio"'),!1):(n.getVideoTracks().forEach(s=>s.stop()),this.attachStream(n,e||"system audio"),this.captureKind="display",n.getAudioTracks().forEach(s=>s.addEventListener("ended",()=>this.captureKind="none")),!0)}catch{return this.onStatusCb("error","System audio capture was cancelled."),!1}}useFile(e){this.ensureContext(),this.disconnect(),this.resume();const t=new Audio;return t.src=URL.createObjectURL(e),t.crossOrigin="anonymous",t.loop=!0,this.mediaEl=t,this.sourceNode=this.ctx.createMediaElementSource(t),this.sourceNode.connect(this.gainTrim),this.sourceNode.connect(this.ctx.destination),this.sourceLabel="file: "+e.name,this.captureKind="file",this.resetAdaptive(),t.play().catch(()=>this.onStatusCb("error","Could not play that file.")),this.lastSoundAt=performance.now(),this.onStatusCb("connected",this.sourceLabel),t}useMediaElement(e,t,n){this.ensureContext(),this.disconnect(),this.resume();const s=new Audio;s.crossOrigin="anonymous",s.loop=!!n?.loop,s.autoplay=!!n?.autoplay,n?.volume!==void 0&&(s.volume=n.volume),s.src=e,this.mediaEl=s;try{this.sourceNode=this.ctx.createMediaElementSource(s),this.sourceNode.connect(this.gainTrim),this.sourceNode.connect(this.ctx.destination)}catch(o){console.warn("createMediaElementSource CORS fallback",o),this.onStatusCb("error","Audio CORS blocked — using synthesized rave (visuals fully reactive). Try File/System audio.");try{s.src=e,s.play().catch(()=>{})}catch{}return this.sourceLabel=t+" (CORS fallback)",this.captureKind=n?.kind||"file",this.resetAdaptive(),this.setSynthetic(!0),this.synth.bpm=140,this.lastSoundAt=performance.now(),this.onStatusCb("connected",this.sourceLabel),s}this.sourceLabel=t,this.captureKind=n?.kind||"file",this.resetAdaptive();const r=s.play();return r&&r.catch&&r.catch(o=>this.onStatusCb("error","Tap Play to start audio ("+(o?.message||"autoplay blocked")+")")),this.lastSoundAt=performance.now(),this.onStatusCb("connected",this.sourceLabel),s.addEventListener("error",()=>{this.onStatusCb("error","Audio load failed — switched to synth."),this.setSynthetic(!0)}),s}useSynthRave(e=140){this.ensureContext(),this.disconnect(),this.resume(),this.resetAdaptive(),this.synth.bpm=e,this.setSynthetic(!1);const t=this.ctx,n=t.createGain();n.gain.value=.42,n.connect(this.gainTrim),n.connect(t.destination);let s=0;const r=()=>{if(this.captureKind!=="demo")return;const o=t.currentTime,a=t.createOscillator();a.frequency.value=55;const l=t.createGain();a.connect(l),l.connect(n),l.gain.setValueAtTime(1,o),l.gain.exponentialRampToValueAtTime(.01,o+.18),a.start(o),a.stop(o+.2);const c=t.createOscillator();c.type="sawtooth",c.frequency.value=110+Math.sin(s)*8;const u=t.createGain();if(c.connect(u),u.connect(n),u.gain.setValueAtTime(.18,o),u.gain.linearRampToValueAtTime(.02,o+.22),c.start(o),c.stop(o+.23),Math.random()<.7){const h=t.createOscillator();h.frequency.value=8e3;const d=t.createGain();h.connect(d),d.connect(n),d.gain.setValueAtTime(.08,o+.05),d.gain.exponentialRampToValueAtTime(.001,o+.09),h.start(o+.05),h.stop(o+.1)}s+=.22,setTimeout(r,6e4/e)};return this.captureKind="demo",r(),this.mediaEl=new Audio,this.sourceLabel=`synth-rave ${e} BPM`,this.lastSoundAt=performance.now(),this.onStatusCb("connected",this.sourceLabel),this.mediaEl}useDemo(e){typeof e=="number"&&(this.demoIdx=(e%si.length+si.length)%si.length);const t=si[this.demoIdx];try{const n=this.useMediaElement(t.url,"demo: "+t.title+" — "+t.artist,{loop:!0,kind:"demo"});return this.synth.bpm=t.bpm,this.setSynthetic(!1),this.gainTrim&&(this.gainTrim.gain.value=1.1),this.sourceLabel.includes("CORS fallback")&&this.useSynthRave(t.bpm),n}catch{return this.useSynthRave(si[this.demoIdx].bpm)}}nextDemo(){return this.demoIdx=(this.demoIdx+1)%si.length,this.useDemo(this.demoIdx)}async useYouTube(e){const t=(e||"").match(/(?:v=|\.be\/|embed\/)([A-Za-z0-9_-]{11})/);if(!t)return this.onStatusCb("error","That does not look like a YouTube link. Paste a full youtube.com/watch?v= URL."),null;const n=t[1];try{const s=await fetch("/api/youtube?id="+encodeURIComponent(n));if(s.ok){const r=await s.json();if(r&&r.audioUrl)return this.useMediaElement(r.audioUrl,"youtube: "+(r.title||n),{loop:!1,kind:"youtube"})}}catch{}return this.onStatusCb("error","Direct YouTube audio not available on this host. Use Demo Rave / File / System capture (tab audio)."),null}getUniforms(){return{bass:this.bands.bass?.norm||0,mid:this.bands.mid?.norm||0,treble:this.bands.air?.norm||0,lowMid:this.bands.lowMid?.norm||0,highMid:this.bands.highMid?.norm||0,presence:this.bands.presence?.norm||0,subBass:this.bands.subBass?.norm||0,energy:this.metrics.energy,beat:this.metrics.beat?1:0,beatPulse:this.metrics.beatPulse,centroid:this.metrics.centroid,flux:this.metrics.flux,level:this.metrics.level}}buildMaps(){const e=this.ctx.sampleRate/2,t=this.analyser.frequencyBinCount,n=25,s=Math.min(17e3,e);this.bandEdges=new Int32Array(lt+1);for(let o=0;o<=lt;o++){const a=n*Math.pow(s/n,o/lt);this.bandEdges[o]=Math.min(t-1,Math.max(1,Math.round(a/e*t)))}for(let o=1;o<=lt;o++)this.bandEdges[o]<=this.bandEdges[o-1]&&(this.bandEdges[o]=this.bandEdges[o-1]+1);this.bandDefBins=ii.map(o=>[Math.max(1,Math.floor(o.lo/e*t)),Math.min(t-1,Math.ceil(o.hi/e*t))]),this.chromaMap=new Int8Array(t).fill(-1);const r=e/t;for(let o=1;o<t;o++){const a=o*r;if(a<65||a>2100)continue;const l=69+12*Math.log2(a/440);this.chromaMap[o]=(Math.round(l)%12+12)%12}}updateAutoLevel(e,t){if(!this.config.autoLevel||!this.gainTrim)return;if(t>.25)this.autoGain*=.97;else if(e>.0015)this.autoGain*=1+(_c-e)*.06;else return;this.autoGain=Math.max(vc,Math.min(xc,this.autoGain));const n=this.autoGain,s=this.gainTrim.gain.value;this.gainTrim.gain.value=s+(n-s)*.1}update(e){if(!this.started||!this.analyser)return this.synth.enabled&&this.synthesize(e),this.metrics;this.bandEdges||this.buildMaps(),this.analyser.getByteFrequencyData(this.freqData),this.analyser.getByteTimeDomainData(this.waveData);const t=this.config.gain;let n=0,s=0,r=0,o=0;for(let _=0;_<lt;_++){const p=this.bandEdges[_],f=this.bandEdges[_+1];let y=0;for(let A=p;A<f;A++)y+=this.freqData[A],this.freqData[A]>250&&o++;const M=1+Math.pow(_/lt,1.4)*.45,S=Xt(y/Math.max(1,f-p)/255*t*M);this.metrics.bands[_]+=(S-this.metrics.bands[_])*.45;const R=S-this.binPrev[_];R>0&&(n+=R),this.metrics.onsets[_]=Math.max(this.metrics.onsets[_]*.86,R>.035?Xt(R*6):0),this.binPrev[_]=S;const w=is(this.binRange[_],S);this.binPeak[_]=this.binRange[_].ceil,this.metrics.bandsNorm[_]=S+(w-S)*this.config.adaptive,this.metrics.peaks[_]=Math.max(this.metrics.peaks[_]*.965,this.metrics.bands[_]),s+=_*S,r+=S}this.metrics.flux=Xt(n/6);const a=r>.001?s/r/lt:.5;this.metrics.centroid+=(a-this.metrics.centroid)*.12;let l=0;if(r>.001){for(let _=0;_<lt;_++)l+=Math.abs(_/lt-a)*this.metrics.bands[_];l/=r}this.metrics.spread+=(Xt(l*3)-this.metrics.spread)*.1;for(let _=0;_<ii.length;_++){const p=this.bands[ii[_].key],f=this.bandDefBins[_];let y=0;for(let w=f[0];w<=f[1];w++)y+=this.freqData[w];const M=_>3?1+(_-3)*.12:1,S=Xt(y/Math.max(1,f[1]-f[0]+1)/255*t*M);p.raw=S,p.level+=(S-p.level)*.4,p.norm=p.raw+(is(p,S)-p.raw)*this.config.adaptive,p.env+=p.norm>p.env?(p.norm-p.env)*this.config.attack:(p.norm-p.env)*this.config.release;const R=S-p.prev;p.hit=R>.05&&p.norm>.35,p.onset=Math.max(p.onset*.85,p.hit?Xt(R*7):0),p.prev=S}this.metrics.bass=this.bands.bass.norm,this.metrics.lowMid=this.bands.lowMid.norm,this.metrics.mid=this.bands.mid.norm,this.metrics.highMid=this.bands.highMid.norm,this.metrics.treble=this.bands.air.norm;for(let _=0;_<ns;_++)this.metrics.chroma[_]*=.82;let c=0;for(let _=1;_<this.chromaMap.length;_++){const p=this.chromaMap[_];if(p<0)continue;const f=this.freqData[_]/255;this.metrics.chroma[p]+=f*.18,c+=f}let u=0;for(let _=1;_<ns;_++)this.metrics.chroma[_]>this.metrics.chroma[u]&&(u=_);c>.5&&(this.metrics.chromaPeak=u);let h=0;const d=this.waveData.length/On;for(let _=0;_<On;_++){const p=(this.waveData[Math.floor(_*d)]-128)/128;this.metrics.wave[_]=p,h+=p*p}const m=Math.sqrt(h/On);this.metrics.level=Xt(m*2.2*t),this.metrics.saturation=o/Math.max(1,this.bandEdges[lt]-this.bandEdges[0]),this.metrics.autoGain=this.gainTrim?this.gainTrim.gain.value:1,this.updateAutoLevel(m,this.metrics.saturation),this.metrics.energy=this.metrics.level+(is(this.energyRange,this.metrics.level)-this.metrics.level)*this.config.adaptive,this.detectBeat(e),this.metrics.level>.012&&(this.lastSoundAt=e);const g=e-this.lastSoundAt<2200;return g!==this.metrics.live&&this.sourceLabel!=="none"&&(this.metrics.live=g,this.onStatusCb(g?"audible":"silent",this.sourceLabel)),this.synth.enabled&&!g&&this.synthesize(e),this.metrics}detectBeat(e){const t=Math.max(this.bands.subBass.norm,this.bands.bass.norm);this.driveHistory.shift(),this.driveHistory.push(t);let n=0;for(let c=0;c<this.driveHistory.length;c++)n+=this.driveHistory[c];n/=this.driveHistory.length;let s=0;for(let c=0;c<this.driveHistory.length;c++){const u=this.driveHistory[c]-n;s+=u*u}const r=Math.sqrt(s/this.driveHistory.length),o=n+this.config.sensitivity*r,a=this.bands.bass.hit||this.bands.subBass.hit,l=t>o&&t>.25&&a&&e-this.lastBeatAt>180;if(this.metrics.beat=l,l){if(this.lastBeatAt){const c=e-this.lastBeatAt;if(c>250&&c<1500){this.beatTimes.push(c),this.beatTimes.length>16&&this.beatTimes.shift();const u=this.beatTimes.slice().sort((h,d)=>h-d);this.metrics.bpm=Math.round(6e4/u[u.length>>1]),this.synth.bpm=this.metrics.bpm}}this.lastBeatAt=e,this.metrics.beatCount++,this.metrics.beatPulse=1}else this.metrics.beatPulse*=.9}synthesize(e){const t=e/1e3,n=60/this.synth.bpm,s=this.synth.phase;this.synth.phase=t%n/n;const r=this.synth.phase<s,o=Math.pow(1-this.synth.phase,2.4),a=this.synth.seed,l={subBass:.3+o*.62,bass:.26+o*.6+Math.sin(t*.7+a)*.06,lowMid:.24+o*.32+Math.sin(t*1.3+a)*.1,mid:.26+Math.sin(t*2.1+a)*.18+o*.2,highMid:.22+Math.sin(t*3.3+a*1.7)*.17+o*.16,presence:.2+Math.abs(Math.sin(t*4.2+a*2))*.24+o*.14,air:.18+Math.abs(Math.sin(t*5.1+a*2.3))*.28+o*.12};ii.forEach(u=>{const h=this.bands[u.key],d=Xt(l[u.key]);h.raw=d,h.level=d,h.norm=d,h.env+=d>h.env?(d-h.env)*this.config.attack:(d-h.env)*this.config.release,h.hit=r&&(u.key==="bass"||u.key==="subBass"),h.onset=Math.max(h.onset*.85,h.hit?1:0)}),this.metrics.bass=this.bands.bass.norm,this.metrics.lowMid=this.bands.lowMid.norm,this.metrics.mid=this.bands.mid.norm,this.metrics.highMid=this.bands.highMid.norm,this.metrics.treble=this.bands.air.norm,this.metrics.level=Xt(.25+o*.4),this.metrics.energy=this.metrics.level,this.metrics.flux=o*.8,this.metrics.centroid=.4+Math.sin(t*.3)*.15,this.metrics.spread=.5;for(let u=0;u<lt;u++){const h=u/lt,d=Math.pow(1-h,1.15),m=.5+.5*Math.sin(t*(1.2+h*5)+u*.5+a),g=Xt(d*(.35+.65*m)*(.55+o*.75));this.metrics.bands[u]+=(g-this.metrics.bands[u])*.3,this.metrics.bandsNorm[u]=Xt(g/(d+.15)),this.metrics.onsets[u]=Math.max(this.metrics.onsets[u]*.86,r?Math.random()*.7:0),this.metrics.peaks[u]=Math.max(this.metrics.peaks[u]*.965,this.metrics.bands[u])}for(let u=0;u<On;u++){const h=u/On;this.metrics.wave[u]=Math.sin(h*Math.PI*2*3+t*4)*.4*(.4+o)+Math.sin(h*Math.PI*2*11+t*9)*.16*this.metrics.treble+Math.sin(h*Math.PI*2*27+t*3)*.06}for(let u=0;u<ns;u++)this.metrics.chroma[u]*=.9;const c=Math.floor((t*.25+a)%12);this.metrics.chroma[c]=Math.min(1,this.metrics.chroma[c]+.3),this.metrics.chromaPeak=c,this.metrics.beat=r,r?(this.metrics.beatCount++,this.metrics.beatPulse=1):this.metrics.beatPulse*=.9,this.metrics.bpm=this.synth.bpm}}const Ns={rainbow:null,neon:["#ff005c","#b400ff","#00e5ff","#00ff9d","#ff005c"],vapor:["#ff71ce","#01cdfe","#05ffa1","#b967ff","#ff71ce"],sunset:["#f72585","#ff6d00","#ffba08","#ff2e63","#f72585"],ice:["#03045e","#0077b6","#00b4d8","#caf0f8","#03045e"],magma:["#0b0014","#3b0f70","#8c2981","#de4968","#fe9f6d","#fcfdbf","#0b0014"],ember:["#1a0000","#9d0208","#dc2f02","#f48c06","#ffba08","#1a0000"],forest:["#004b23","#008000","#38b000","#9ef01a","#ccff33","#004b23"],mono:["#101014","#4a4a55","#9a9aa8","#ffffff","#101014"],gold:["#2b1700","#7f4f00","#d4a017","#ffd966","#fff4cc","#2b1700"],oceanic:["#012a4a","#2a6f97","#61a5c2","#a9d6e5","#012a4a"],candy:["#ff9ff3","#feca57","#48dbfb","#1dd1a1","#ff6b6b","#ff9ff3"],aurora:["#011627","#0b7a75","#2ec4b6","#a7f3d0","#7b2ff7","#011627"],prism:["#ff0040","#ff8c00","#ffee00","#00ff66","#00c3ff","#7a00ff","#ff0040"],dusk:["#0d1b2a","#415a77","#a06cd5","#ff8fab","#ffd6a5","#0d1b2a"],toxic:["#020d00","#1b998b","#78ff00","#d0ff14","#f6ff8f","#020d00"],royal:["#10002b","#3c096c","#7b2cbf","#c77dff","#e0aaff","#10002b"],infrared:["#000000","#4a0e4e","#c9184a","#ff4d00","#ffd500","#ffffff","#000000"],album:["#00b4d8","#90e0ef","#0077b6","#00b4d8"]};function yc(i){const e=parseInt(i.slice(1),16);return{r:(e>>16&255)/255,g:(e>>8&255)/255,b:(e&255)/255}}const nr={};function Sc(i,e){return i==="album"&&e?e:(nr[i]||(nr[i]=(Ns[i]||Ns.neon).map(yc)),nr[i])}function ir(i,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?i+(e-i)*6*t:t<1/2?e:t<2/3?i+(e-i)*(2/3-t)*6:i}function Ec(i,e,t){i-=Math.floor(i);let n,s,r;{const o=t+e-t*e,a=2*t-o;n=ir(a,o,i+1/3),s=ir(a,o,i),r=ir(a,o,i-1/3)}return{r:n,g:s,b:r}}class bc{name="rainbow";speed=1;albumStops=null;chromaDrive=0;chromaOffset=0;names=Object.keys(Ns);set(e){Ns[e]!==void 0&&(this.name=e)}get(){return this.name}setSpeed(e){this.speed=e}setChromaDrive(e){this.chromaDrive=Math.max(0,Math.min(1,e))}hasAlbum(){return!!this.albumStops}sample(e){if(e-=Math.floor(e),this.name==="rainbow")return Ec(e,.85,.55);const t=Sc(this.name,this.albumStops),n=e*(t.length-1),s=Math.floor(n),r=n-s,o=t[s],a=t[Math.min(t.length-1,s+1)];return{r:o.r+(a.r-o.r)*r,g:o.g+(a.g-o.g)*r,b:o.b+(a.b-o.b)*r}}css(e,t){const n=this.sample(e),s=Math.round(n.r*255),r=Math.round(n.g*255),o=Math.round(n.b*255);return t===void 0?`rgb(${s},${r},${o})`:`rgba(${s},${r},${o},${t})`}hdr(e,t){const n=this.sample(e),s=(t===void 0?4.5:t)*.6;return{r:n.r*s,g:n.g*s,b:n.b*s}}flow(e,t){const n=Date.now()*3e-5*this.speed*(t||1)+(e||0);return this.chromaDrive<=0?n:n*(1-this.chromaDrive)+(this.chromaOffset+(e||0))*this.chromaDrive}updateMusic(e){if(!e)return;let t=e.chromaPeak/12-this.chromaOffset;t>.5?t-=1:t<-.5&&(t+=1),this.chromaOffset=(this.chromaOffset+t*.05+1)%1}fromImage(e){try{const t=document.createElement("canvas"),n=40;t.width=n,t.height=n;const s=t.getContext("2d",{willReadFrequently:!0});s.drawImage(e,0,0,n,n);const r=s.getImageData(0,0,n,n).data,o={};for(let l=0;l<r.length;l+=4){const c=r[l],u=r[l+1],h=r[l+2],d=Math.max(c,u,h),m=Math.min(c,u,h),g=d===0?0:(d-m)/d,_=(c+u+h)/765;if(_<.06||_>.97)continue;const p=(c>>6)+","+(u>>6)+","+(h>>6),f=1+g*3,y=o[p]||(o[p]={r:0,g:0,b:0,w:0});y.r+=c*f,y.g+=u*f,y.b+=h*f,y.w+=f}const a=Object.keys(o).map(l=>o[l]).sort((l,c)=>c.w-l.w).slice(0,5).map(l=>({r:l.r/l.w/255,g:l.g/l.w/255,b:l.b/l.w/255}));return a.length<2?!1:(a.push(a[0]),this.albumStops=a,!0)}catch{return!1}}createLUTTexture(e){const n=new Uint8Array(1024);for(let r=0;r<256;r++){const o=this.sample(r/256);n[r*4]=Math.round(o.r*255),n[r*4+1]=Math.round(o.g*255),n[r*4+2]=Math.round(o.b*255),n[r*4+3]=255}const s=e.createTexture();return e.bindTexture(e.TEXTURE_2D,s),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,256,1,0,e.RGBA,e.UNSIGNED_BYTE,n),s}}function Oa(i,e,t){const n=i.createShader(e);if(i.shaderSource(n,t),i.compileShader(n),!i.getShaderParameter(n,i.COMPILE_STATUS))throw new Error(i.getShaderInfoLog(n)||"compile fail");return n}class hn{constructor(e,t,n){this.gl=e;const s=Oa(e,e.VERTEX_SHADER,t),r=Oa(e,e.FRAGMENT_SHADER,n);if(this.program=e.createProgram(),e.attachShader(this.program,s),e.attachShader(this.program,r),e.bindAttribLocation(this.program,0,"aPosition"),e.linkProgram(this.program),!e.getProgramParameter(this.program,e.LINK_STATUS))throw new Error(e.getProgramInfoLog(this.program)||"link fail");const o=e.getProgramParameter(this.program,e.ACTIVE_UNIFORMS);for(let a=0;a<o;a++){const l=e.getActiveUniform(this.program,a);this.uniforms[l.name]=e.getUniformLocation(this.program,l.name)}}program;uniforms={};bind(){this.gl.useProgram(this.program)}}const dn=`#version 300 es
precision highp float; in vec2 aPosition; out vec2 vUv;
void main(){ vUv=aPosition*0.5+0.5; gl_Position=vec4(aPosition,0.0,1.0); }`,Tc=`#version 300 es
precision highp float; in vec2 vUv; out vec4 fragColor;
uniform sampler2D uTarget; uniform float uAspectRatio; uniform vec3 uColor; uniform vec2 uPoint; uniform float uRadius;
void main(){ vec2 p=vUv-uPoint; p.x*=uAspectRatio; vec3 splat=exp(-dot(p,p)/uRadius)*uColor; vec3 base=texture(uTarget,vUv).xyz; fragColor=vec4(base+splat,1.0); }`,Ac=`#version 300 es
precision highp float; in vec2 vUv; out vec4 fragColor;
uniform sampler2D uVelocity; uniform sampler2D uSource; uniform vec2 uTexelSize; uniform float uDt; uniform float uDissipation;
void main(){ vec2 coord=vUv - uDt*texture(uVelocity,vUv).xy*uTexelSize; fragColor=uDissipation*texture(uSource,coord); }`,wc=`#version 300 es
precision highp float; in vec2 vUv; out vec4 fragColor; uniform sampler2D uVelocity; uniform vec2 uTexelSize;
void main(){ float L=texture(uVelocity,vUv-vec2(uTexelSize.x,0.0)).x; float R=texture(uVelocity,vUv+vec2(uTexelSize.x,0.0)).x; float T=texture(uVelocity,vUv+vec2(0.0,uTexelSize.y)).y; float B=texture(uVelocity,vUv-vec2(0.0,uTexelSize.y)).y; fragColor=vec4(0.5*(R-L+T-B),0.0,0.0,1.0); }`,Rc=`#version 300 es
precision highp float; in vec2 vUv; out vec4 fragColor; uniform sampler2D uVelocity; uniform vec2 uTexelSize;
void main(){ float L=texture(uVelocity,vUv-vec2(uTexelSize.x,0.0)).y; float R=texture(uVelocity,vUv+vec2(uTexelSize.x,0.0)).y; float T=texture(uVelocity,vUv+vec2(0.0,uTexelSize.y)).x; float B=texture(uVelocity,vUv-vec2(0.0,uTexelSize.y)).x; fragColor=vec4(0.5*(R-L-T+B),0.0,0.0,1.0); }`,Cc=`#version 300 es
precision highp float; in vec2 vUv; out vec4 fragColor; uniform sampler2D uVelocity; uniform sampler2D uCurl; uniform vec2 uTexelSize; uniform float uCurlScale; uniform float uDt;
void main(){
 float L=texture(uCurl,vUv-vec2(uTexelSize.x,0.0)).x; float R=texture(uCurl,vUv+vec2(uTexelSize.x,0.0)).x; float T=texture(uCurl,vUv+vec2(0.0,uTexelSize.y)).x; float B=texture(uCurl,vUv-vec2(0.0,uTexelSize.y)).x; float C=texture(uCurl,vUv).x;
 vec2 force=0.5*vec2(abs(T)-abs(B), abs(R)-abs(L)); float l=length(force)+0.00001; force=(force/l)*uCurlScale*C; force.y*=-1.0;
 vec2 vel=texture(uVelocity,vUv).xy; fragColor=vec4(vel+force*uDt,0.0,1.0);
}`,Pc=`#version 300 es
precision highp float; in vec2 vUv; out vec4 fragColor; uniform sampler2D uPressure; uniform sampler2D uDivergence; uniform vec2 uTexelSize;
void main(){ float L=texture(uPressure,vUv-vec2(uTexelSize.x,0.0)).x; float R=texture(uPressure,vUv+vec2(uTexelSize.x,0.0)).x; float T=texture(uPressure,vUv+vec2(0.0,uTexelSize.y)).x; float B=texture(uPressure,vUv-vec2(0.0,uTexelSize.y)).x; float div=texture(uDivergence,vUv).x; fragColor=vec4((L+R+B+T-div)*0.25,0.0,0.0,1.0); }`,Lc=`#version 300 es
precision highp float; in vec2 vUv; out vec4 fragColor; uniform sampler2D uPressure; uniform sampler2D uVelocity; uniform vec2 uTexelSize;
void main(){ float L=texture(uPressure,vUv-vec2(uTexelSize.x,0.0)).x; float R=texture(uPressure,vUv+vec2(uTexelSize.x,0.0)).x; float T=texture(uPressure,vUv+vec2(0.0,uTexelSize.y)).x; float B=texture(uPressure,vUv-vec2(0.0,uTexelSize.y)).x; vec2 v=texture(uVelocity,vUv).xy; v-=vec2(R-L,T-B)*0.5; fragColor=vec4(v,0.0,1.0); }`,Dc=`#version 300 es
precision highp float; in vec2 vUv; out vec4 fragColor; uniform sampler2D uTexture; uniform float uExposure; uniform float uFractal; uniform float uTime; uniform float uAspect;
vec2 fold(vec2 p,float amt,float t){ for(int i=0;i<4;i++){ p=abs(p)-0.42*amt; float a=t*0.05+float(i)*0.7; float c=cos(a), s=sin(a); p=mat2(c,-s,s,c)*p; p*=1.0+0.26*amt; } return p; }
void main(){
 vec2 uv=vUv;
 if(uFractal>0.001){ vec2 p=(vUv-0.5)*vec2(uAspect,1.0); vec2 f=fold(p,uFractal,uTime); uv=mix(vUv, fract(f/vec2(uAspect,1.0)+0.5), uFractal); }
 vec3 c=texture(uTexture,uv).rgb*uExposure; float peak=max(c.r,max(c.g,c.b)); vec3 m=c/(1.0+peak); m=pow(m, vec3(1.0/2.2)); fragColor=vec4(m,1.0);
}`,Uc=`#version 300 es
precision highp float; in vec2 vUv; out vec4 fragColor; uniform sampler2D uTexture; uniform float uValue;
void main(){ fragColor=uValue*texture(uTexture,vUv); }`;class Ic{canvas;gl=null;useWGSL=!1;config={SIM_RESOLUTION:256,DYE_RESOLUTION:1024,DENSITY_DISSIPATION:.98,VELOCITY_DISSIPATION:.98,PRESSURE_ITERATIONS:20,CURL:30,VISCOSITY:.3,SPLAT_RADIUS:.25,BLOOM:1,SPLAT_BUDGET:26,AUDIO_CURL_GAIN:28,AUDIO_DISS_GAIN:.035,AUDIO_RADIUS_GAIN:.1};quad=null;progs={};density;velocity;pressure;divergence;curl;splatsThisFrame=0;ready=!1;constructor(e){this.canvas=e}init(){return this.gl=this.canvas.getContext("webgl2",{alpha:!1,depth:!1,stencil:!1,antialias:!1}),!this.gl||!this.gl.getExtension("EXT_color_buffer_float")?!1:(navigator.gpu&&(this.useWGSL=!1),this.quad=this.gl.createBuffer(),this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.quad),this.gl.bufferData(this.gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),this.gl.STATIC_DRAW),this.progs.clear=new hn(this.gl,dn,Uc),this.progs.splat=new hn(this.gl,dn,Tc),this.progs.advect=new hn(this.gl,dn,Ac),this.progs.divergence=new hn(this.gl,dn,wc),this.progs.curl=new hn(this.gl,dn,Rc),this.progs.vorticity=new hn(this.gl,dn,Cc),this.progs.pressure=new hn(this.gl,dn,Pc),this.progs.gradSub=new hn(this.gl,dn,Lc),this.progs.display=new hn(this.gl,dn,Dc),this.ready=!0,this.resize(),!0)}resize(){if(!this.gl)return;const e=window.MF_MOBILE?1.5:2,t=Math.min(window.devicePixelRatio||1,e),n=this.canvas.clientWidth||window.innerWidth,s=this.canvas.clientHeight||window.innerHeight,r=Math.max(1,Math.floor(n*t)),o=Math.max(1,Math.floor(s*t));(this.canvas.width!==r||this.canvas.height!==o)&&(this.canvas.width=r,this.canvas.height=o,this.initFBOs())}createFBO(e,t,n,s,r,o){const a=this.gl;a.activeTexture(a.TEXTURE0);const l=a.createTexture();a.bindTexture(a.TEXTURE_2D,l),a.texParameteri(a.TEXTURE_2D,a.TEXTURE_MIN_FILTER,o),a.texParameteri(a.TEXTURE_2D,a.TEXTURE_MAG_FILTER,o),a.texParameteri(a.TEXTURE_2D,a.TEXTURE_WRAP_S,a.CLAMP_TO_EDGE),a.texParameteri(a.TEXTURE_2D,a.TEXTURE_WRAP_T,a.CLAMP_TO_EDGE),a.texImage2D(a.TEXTURE_2D,0,n,e,t,0,s,r,null);const c=a.createFramebuffer();return a.bindFramebuffer(a.FRAMEBUFFER,c),a.framebufferTexture2D(a.FRAMEBUFFER,a.COLOR_ATTACHMENT0,a.TEXTURE_2D,l,0),a.viewport(0,0,e,t),a.clear(a.COLOR_BUFFER_BIT),{texture:l,fbo:c,width:e,height:t,attach(u){return a.activeTexture(a.TEXTURE0+u),a.bindTexture(a.TEXTURE_2D,l),u}}}createDoubleFBO(e,t,n,s,r,o){let a=this.createFBO(e,t,n,s,r,o),l=this.createFBO(e,t,n,s,r,o);return{get read(){return a},set read(c){a=c},get write(){return l},set write(c){l=c},swap(){const c=a;a=l,l=c}}}initFBOs(){const e=this.gl,t=e.LINEAR,n=this.canvas.height/this.canvas.width,s=this.config.SIM_RESOLUTION,r=Math.max(1,Math.round(this.config.SIM_RESOLUTION*n)),o=this.config.DYE_RESOLUTION,a=Math.max(1,Math.round(this.config.DYE_RESOLUTION*n));this.density=this.createDoubleFBO(o,a,e.RGBA16F,e.RGBA,e.HALF_FLOAT,t),this.velocity=this.createDoubleFBO(s,r,e.RG16F,e.RG,e.HALF_FLOAT,t),this.pressure=this.createDoubleFBO(s,r,e.R16F,e.RED,e.HALF_FLOAT,e.NEAREST),this.divergence=this.createFBO(s,r,e.R16F,e.RED,e.HALF_FLOAT,e.NEAREST),this.curl=this.createFBO(s,r,e.R16F,e.RED,e.HALF_FLOAT,e.NEAREST)}renderQuad(e){const t=this.gl;t.bindFramebuffer(t.FRAMEBUFFER,e?e.fbo:null),e?t.viewport(0,0,e.width,e.height):t.viewport(0,0,t.drawingBufferWidth,t.drawingBufferHeight),t.bindBuffer(t.ARRAY_BUFFER,this.quad),t.vertexAttribPointer(0,2,t.FLOAT,!1,0,0),t.enableVertexAttribArray(0),t.drawArrays(t.TRIANGLES,0,3)}beginFrame(){this.splatsThisFrame=0}splatsUsed(){return this.splatsThisFrame}splat(e,t,n,s,r,o){if(!this.ready||this.splatsThisFrame>=this.config.SPLAT_BUDGET)return!1;this.splatsThisFrame++;const a=this.progs.splat;a.bind();const l=this.config.SPLAT_RADIUS*(o||1)/100,c=this.gl;return c.uniform1f(a.uniforms.uAspectRatio,this.canvas.width/this.canvas.height),c.uniform2f(a.uniforms.uPoint,e,t),c.uniform1f(a.uniforms.uRadius,l),c.uniform1i(a.uniforms.uTarget,this.velocity.read.attach(0)),c.uniform3f(a.uniforms.uColor,n,s,0),this.renderQuad(this.velocity.write),this.velocity.swap(),c.uniform1i(a.uniforms.uTarget,this.density.read.attach(0)),c.uniform3f(a.uniforms.uColor,r.r,r.g,r.b),this.renderQuad(this.density.write),this.density.swap(),!0}clear(){if(!this.ready)return;const e=this.progs.clear;e.bind(),this.gl.uniform1i(e.uniforms.uTexture,this.density.read.attach(0)),this.gl.uniform1f(e.uniforms.uValue,0),this.renderQuad(this.density.write),this.density.swap(),this.gl.uniform1i(e.uniforms.uTexture,this.velocity.read.attach(0)),this.gl.uniform1f(e.uniforms.uValue,0),this.renderQuad(this.velocity.write),this.velocity.swap()}applyAudioParams(e,t){if(!e)return{vort:this.config.CURL,diss:this.config.DENSITY_DISSIPATION};const n=this.config.CURL+e.band.presence.env*this.config.AUDIO_CURL_GAIN*(t||1),s=Math.max(.88,this.config.DENSITY_DISSIPATION-e.band.mid.env*this.config.AUDIO_DISS_GAIN*(t||1));return{vort:n,diss:s}}solve(e,t,n,s,r){const o=[1/this.velocity.read.width,1/this.velocity.read.height];let a;a=this.progs.curl,a.bind(),this.gl.uniform2f(a.uniforms.uTexelSize,o[0],o[1]),this.gl.uniform1i(a.uniforms.uVelocity,this.velocity.read.attach(0)),this.renderQuad(this.curl),a=this.progs.vorticity,a.bind(),this.gl.uniform2f(a.uniforms.uTexelSize,o[0],o[1]),this.gl.uniform1i(a.uniforms.uVelocity,this.velocity.read.attach(0)),this.gl.uniform1i(a.uniforms.uCurl,this.curl.attach(1)),this.gl.uniform1f(a.uniforms.uCurlScale,t),this.gl.uniform1f(a.uniforms.uDt,e),this.renderQuad(this.velocity.write),this.velocity.swap(),a=this.progs.advect,a.bind(),this.gl.uniform2f(a.uniforms.uTexelSize,o[0],o[1]),this.gl.uniform1i(a.uniforms.uVelocity,this.velocity.read.attach(0)),this.gl.uniform1i(a.uniforms.uSource,this.velocity.read.attach(0)),this.gl.uniform1f(a.uniforms.uDt,e),this.gl.uniform1f(a.uniforms.uDissipation,this.config.VELOCITY_DISSIPATION),this.renderQuad(this.velocity.write),this.velocity.swap(),this.gl.uniform1i(a.uniforms.uVelocity,this.velocity.read.attach(0)),this.gl.uniform1i(a.uniforms.uSource,this.density.read.attach(1)),this.gl.uniform1f(a.uniforms.uDissipation,n),this.renderQuad(this.density.write),this.density.swap(),a=this.progs.divergence,a.bind(),this.gl.uniform2f(a.uniforms.uTexelSize,o[0],o[1]),this.gl.uniform1i(a.uniforms.uVelocity,this.velocity.read.attach(0)),this.renderQuad(this.divergence),a=this.progs.clear,a.bind(),this.gl.uniform1i(a.uniforms.uTexture,this.pressure.read.attach(0)),this.gl.uniform1f(a.uniforms.uValue,this.config.VISCOSITY),this.renderQuad(this.pressure.write),this.pressure.swap(),a=this.progs.pressure,a.bind(),this.gl.uniform2f(a.uniforms.uTexelSize,o[0],o[1]),this.gl.uniform1i(a.uniforms.uDivergence,this.divergence.attach(0));for(let l=0;l<this.config.PRESSURE_ITERATIONS;l++)this.gl.uniform1i(a.uniforms.uPressure,this.pressure.read.attach(1)),this.renderQuad(this.pressure.write),this.pressure.swap();a=this.progs.gradSub,a.bind(),this.gl.uniform2f(a.uniforms.uTexelSize,o[0],o[1]),this.gl.uniform1i(a.uniforms.uPressure,this.pressure.read.attach(0)),this.gl.uniform1i(a.uniforms.uVelocity,this.velocity.read.attach(1)),this.renderQuad(this.velocity.write),this.velocity.swap(),a=this.progs.display,a.bind(),this.gl.uniform1i(a.uniforms.uTexture,this.density.read.attach(0)),this.gl.uniform1f(a.uniforms.uExposure,this.config.BLOOM),this.gl.uniform1f(a.uniforms.uFractal,s||0),this.gl.uniform1f(a.uniforms.uTime,(r||0)*.001),this.gl.uniform1f(a.uniforms.uAspect,this.canvas.width/this.canvas.height),this.renderQuad(null)}isReady(){return this.ready}}const Nc=`#version 300 es
precision highp float; in vec2 aPosition; void main(){ gl_Position=vec4(aPosition,0.0,1.0); }`,Fc=`#version 300 es
precision highp float; out vec4 fragColor;
uniform vec2 uRes; uniform float uTime; uniform vec2 uMouse; uniform float uMouseDown; uniform float uInteract;
uniform vec4 uEvtA; uniform vec4 uEvtB; uniform float uHover; uniform float uWall; uniform float uRole; uniform float uKey;
uniform float uBg; uniform float uBgAmt; uniform float uBand[7]; uniform float uFlux[7]; uniform float uOnset[7];
uniform float uEnergy; uniform float uEnergyFast; uniform float uCentroid; uniform float uBeat; uniform float uDetail; uniform float uZoom; uniform vec2 uPan; uniform vec2 uSeed; uniform float uContrast; uniform sampler2D uPal; uniform float uPalShift;
uniform float uMorph; uniform float uFly; // next-gen morph/fly
#define PI 3.1415926535
#define TAU 6.2831853071
vec2 gSuv;
vec3 pal(float t){ return texture(uPal, vec2(fract(t+uPalShift),0.5)).rgb; }
mat2 rot(float a){ float c=cos(a), s=sin(a); return mat2(c,-s,s,c); }
vec2 cmul(vec2 a, vec2 b){ return vec2(a.x*b.x-a.y*b.y, a.x*b.y+a.y*b.x); }
float bnd(int i){ return uBand[i]; } float flx(int i){ return uFlux[i]; } float ons(int i){ return uOnset[i]; }
float hash21(vec2 p){ vec3 p3=fract(vec3(p.xyx)*0.1031); p3+=dot(p3,p3.yzx+33.33); return fract((p3.x+p3.y)*p3.z); }
float vnoise(vec2 p){ vec2 i=floor(p), f=fract(p); vec2 u=f*f*(3.0-2.0*f); float a=hash21(i), b=hash21(i+vec2(1.0,0.0)); float c=hash21(i+vec2(0.0,1.0)), d=hash21(i+vec2(1.0,1.0)); return mix(mix(a,b,u.x), mix(c,d,u.x), u.y); }
vec3 deepen(vec3 c,float k){ float l=max(c.r,max(c.g,c.b)); if(l<=1e-5) return c; return c*pow(l,k)/l; }
float vig(float k){ return smoothstep(1.25,0.15,length(gSuv)*k); }
// ... (speck, freqKey, evtWarp, hoverWarp, background trimmed for brevity — full 500-line COMMON lives in legacy, here we keep minimal core)
`,Oc={julia:`
vec3 scene(vec2 uv){
  vec2 k=uSeed + (uMouse-0.5)*0.007*uInteract + vec2(cos(uTime*0.006),sin(uTime*0.006))*uFlux[1]*0.08;
  // morph blends toward bunny tweak via radius
  k += uMorph*vec2(0.12, -0.08);
  vec2 z=uv*1.9*(1.0+uMorph*0.3);
  float trap=1e9, n=0.0; float maxIt=60.0+uDetail*110.0;
  for(int i=0;i<220;i++){ if(float(i)>=maxIt) break; z=cmul(z,z)+k; trap=min(trap, abs(length(z)-0.7-uBand[5]*0.5)); if(dot(z,z)>64.0) break; n+=1.0; }
  float ni=clamp(n/maxIt,0.0,1.0); if(ni>0.995) return vec3(0.0);
  float sm=n - log2(max(log2(dot(z,z)),1.0));
  vec3 col=pal(sm*0.055*1.0+uTime*0.006)* (0.20+0.80*pow(ni,0.7))*1.3;
  col += pal(0.45)*exp(-trap*30.0)* (0.35+uBand[6]*1.4);
  return col*(0.55+uEnergy*0.9)*(1.0+uFly*0.2);
}`,mandel:`
vec3 scene(vec2 uv){
  float t=mod(uTime*0.022*(1.0+uFly*0.5),15.0); float zoom=pow(2.0,t);
  vec2 centre=vec2(-0.743643887037151,0.13182590420533)+ (uMouse-0.5)*(0.6/zoom)*uInteract + uFly*vec2(sin(uTime*0.01),cos(uTime*0.012))*0.04;
  vec2 c=centre+uv*(1.6/zoom);
  vec2 z=vec2(0.0); float n=0.0; float maxIt=min(315.0,90.0+uDetail*170.0+uBand[1]*60.0+max(0.0,log2(uZoom))*12.0);
  for(int i=0;i<320;i++){ if(float(i)>=maxIt) break; z=cmul(z,z)+c; if(dot(z,z)>256.0) break; n+=1.0; }
  float ni=clamp(n/maxIt,0.0,1.0); if(ni>0.995) return vec3(0.0);
  vec3 col=pal(n*0.055*0.01+uTime*0.01)* (0.3+pow(ni,0.7))*1.2; return col*(0.6+uEnergy*0.9);
}`,mandala:"vec3 scene(vec2 uv){ vec2 p=uv*1.6; float petals=6.0+floor(uBand[3]*5.0)*2.0; p=rot(uBand[2]*1.4)*p; float r=length(p); vec3 col=vec3(0.0); for(int i=0;i<7;i++){ float fi=float(i); float rr=0.15+fi*0.125+uFlux[i]*0.055; float w=mix(0.020,0.005,uFlux[4])+0.022*uFlux[i]; float ring=w/(abs(r-rr)+w); ring*=ring; col+=pal(fi/7.0*0.85+uTime*0.012)*ring*0.6; } return deepen(col,1.7)*vig(0.85); }",plasma:`vec3 scene(vec2 uv){
    vec2 p = uv * 2.5;
    float t = uTime * 0.4 + uEnergy * 0.5;
    for (int i = 1; i < 5; i++) {
      float fi = float(i);
      p += vec2(sin(fi * p.y + t + uBand[1] * 2.0), cos(fi * p.x + t + uBand[3] * 2.0)) * 0.45;
    }
    float v = sin(p.x + t) + cos(p.y + t) + uBand[0] * 1.5;
    vec3 col = pal(v * 0.15 + uTime * 0.01) * (0.8 + uBeat * 0.4);
    col += vec3(0.1, 0.4, 0.9) * exp(-abs(v) * 2.0) * (0.5 + uBand[5]);
    return col * vig(0.9);
  }`,sacred:`vec3 scene(vec2 uv){
    vec2 p = uv * 2.0;
    float r = length(p);
    float a = atan(p.y, p.x);
    float sym = 6.0 + floor(uBand[2] * 6.0);
    a = mod(a, TAU / sym) - PI / sym;
    vec2 pSym = vec2(cos(a), sin(a)) * r;
    vec3 col = vec3(0.0);
    for (int i = 0; i < 6; i++) {
      float fi = float(i);
      float circleDist = abs(length(pSym - vec2(0.3 + fi * 0.12, 0.0)) - 0.25);
      float line = smoothstep(0.02, 0.005, circleDist);
      col += pal(fi / 6.0 + uTime * 0.01) * line * (0.6 + uBand[i] * 0.8);
    }
    return col * (0.8 + uEnergy * 0.6) * vig(0.85);
  }`},Bc=`
void main(){
  vec2 uv = (gl_FragCoord.xy / uRes - 0.5) * vec2(uRes.x/uRes.y, 1.0);
  uv = (uv - uPan) / max(0.001, uZoom);
  if (uFly > 0.5) {
    uv += vec2(sin(uTime * 0.4) * 0.2, cos(uTime * 0.35) * 0.2);
  }
  gSuv = uv;
  vec3 col = scene(uv);
  // tone
  float peak=max(col.r,max(col.g,col.b)); col = col/(1.0+peak); col=pow(col, vec3(1.0/2.2));
  fragColor=vec4(col,1.0);
}`;class zc{gl=null;canvas;quad=null;palTex=null;ready=!1;programs={};palette;slowBand=new Float32Array(7);fluxBand=new Float32Array(7);onsetBand=new Float32Array(7);slowEnergy=0;fluxEnergy=0;slowCentroid=0;fluxCentroid=0;morph=0;morphRate=0;flyThrough=!1;flySpeed=.04;flyPhase=0;flyOffset={x:0,y:0};seedAngle=0;seedTime=null;seed={x:.7,y:0};constructor(e,t){this.canvas=e,this.palette=t}init(){return this.gl=this.canvas.getContext("webgl2",{alpha:!1}),this.gl?(this.quad=this.gl.createBuffer(),this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.quad),this.gl.bufferData(this.gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),this.gl.STATIC_DRAW),this.palTex=this.gl.createTexture(),this.updatePalette(),this.ready=!0,this.resize(),!0):!1}resize(){if(!this.gl)return;const e=Math.min(window.devicePixelRatio||1,window.MF_MOBILE?1.5:2),t=Math.max(1,Math.floor((this.canvas.clientWidth||window.innerWidth)*e)),n=Math.max(1,Math.floor((this.canvas.clientHeight||window.innerHeight)*e));(this.canvas.width!==t||this.canvas.height!==n)&&(this.canvas.width=t,this.canvas.height=n)}updatePalette(){if(!this.gl||!this.palTex)return;const e=this.gl,t=256,n=new Uint8Array(t*4);for(let s=0;s<t;s++){const r=this.palette.sample(s/t);n[s*4]=Math.round(r.r*255),n[s*4+1]=Math.round(r.g*255),n[s*4+2]=Math.round(r.b*255),n[s*4+3]=255}e.bindTexture(e.TEXTURE_2D,this.palTex),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,t,1,0,e.RGBA,e.UNSIGNED_BYTE,n)}getProgram(e){if(this.programs[e]!==void 0)return this.programs[e];const t=Oc[e];if(!t)return this.programs[e]=null,null;const n=this.gl.createShader(this.gl.VERTEX_SHADER);this.gl.shaderSource(n,Nc),this.gl.compileShader(n);const s=Fc+`
`+t+`
`+Bc,r=this.gl.createShader(this.gl.FRAGMENT_SHADER);if(this.gl.shaderSource(r,s),this.gl.compileShader(r),!this.gl.getShaderParameter(r,this.gl.COMPILE_STATUS))return console.error(this.gl.getShaderInfoLog(r)),this.programs[e]=null,null;const o=this.gl.createProgram();if(this.gl.attachShader(o,n),this.gl.attachShader(o,r),this.gl.bindAttribLocation(o,0,"aPosition"),this.gl.linkProgram(o),!this.gl.getProgramParameter(o,this.gl.LINK_STATUS))return console.error(this.gl.getProgramInfoLog(o)),this.programs[e]=null,null;const a={},l=this.gl.getProgramParameter(o,this.gl.ACTIVE_UNIFORMS);for(let u=0;u<l;u++){const h=this.gl.getActiveUniform(o,u);a[h.name]=this.gl.getUniformLocation(o,h.name)}const c={prog:o,u:a};return this.programs[e]=c,c}updateAudio(e,t){if(e){for(let n=0;n<7;n++){const s=e.band[Object.keys(e.band)[n]];s&&(this.slowBand[n]+=(s.norm-this.slowBand[n])*.004,this.fluxBand[n]+=(s.norm-this.fluxBand[n])*.18,this.onsetBand[n]=Math.max(this.onsetBand[n]*.88,s.onset))}this.slowEnergy+=(e.energy-this.slowEnergy)*.004,this.fluxEnergy+=(e.energy-this.fluxEnergy)*.18,this.slowCentroid+=(e.centroid-this.slowCentroid)*.004,this.fluxCentroid+=(e.centroid-this.fluxCentroid)*.12,this.flyThrough&&e&&(this.flyPhase+=.016*this.flySpeed*(.6+e.energy*1.2),this.flyOffset.x+=Math.cos(this.flyPhase)*8e-4*(.5+this.slowBand[2]),this.flyOffset.y+=Math.sin(this.flyPhase*1.3)*6e-4*(.5+this.slowBand[0])),this.morphRate!==0&&(this.morph=.5+.5*Math.sin(performance.now()*3e-4*this.morphRate+this.slowCentroid*6.283))}}juliaSeed(e,t,n){if(this.updateAudio(t,n??e),e===this.seedTime)return this.seed;const s=this.seedTime===null?0:Math.min(Math.max(e-this.seedTime,0),1e3);this.seedTime=e;const r=.7+this.slowBand[1]*.16+this.slowBand[0]*.07+this.morph*.15,o=this.slowCentroid*3+this.slowBand[3]*1.2+this.morph*.8;this.seedAngle+=.022*(s/1e3)*(1+this.slowBand[4]*.5);const a=this.seedAngle+o;return this.seed.x=Math.cos(a)*r,this.seed.y=Math.sin(a)*r,this.seed}render(e,t,n,s){if(!this.ready)return!1;const r=this.getProgram(e.shader||"julia");if(!r)return!1;const o=this.gl,a=r.u;this.updatePalette(),this.updateAudio(t,s.stamp??s.time),o.useProgram(r.prog),o.viewport(0,0,this.canvas.width,this.canvas.height),o.uniform2f(a.uRes,this.canvas.width,this.canvas.height),o.uniform1f(a.uTime,(s.time||0)*.001),o.uniform2f(a.uMouse,n.x,n.y),o.uniform1f(a.uMouseDown,n.down?1:0),o.uniform1f(a.uInteract,s.interact??1);const l=s.events||[];for(let c=0;c<2;c++){const u=l[c],h=c===0?a.uEvtA:a.uEvtB;u&&u.kind>0&&u.age>=0&&u.age<6?o.uniform4f(h,u.x,u.y,u.age,u.kind):o.uniform4f(h,0,0,0,0)}o.uniform1f(a.uWall,(s.wall||0)*.001),o.uniform1f(a.uRole,s.role??1),o.uniform1f(a.uKey,s.key?1:0),o.uniform1f(a.uHover,s.hover??1),o.uniform1f(a.uBg,s.bg||0),o.uniform1f(a.uBgAmt,s.bgAmt??1),o.uniform2f(a.uSeed,this.seed.x,this.seed.y),o.uniform1f(a.uEnergy,this.slowEnergy),o.uniform1f(a.uEnergyFast,this.fluxEnergy),o.uniform1f(a.uCentroid,this.fluxCentroid),o.uniform1f(a.uBeat,t.beatPulse),o.uniform1f(a.uDetail,s.detail??.6),o.uniform1f(a.uZoom,s.zoom??1),o.uniform2f(a.uPan,s.pan?.x||0,s.pan?.y||0),o.uniform1f(a.uContrast,s.contrast??1),o.uniform1f(a.uPalShift,this.palette.flow(0,e.palSpeed??.01)%1),o.uniform1f(a.uMorph,this.morph),o.uniform1f(a.uFly,this.flyThrough?1:0);for(let c=0;c<7;c++)o.uniform1f(a["uBand["+c+"]"],this.slowBand[c]),o.uniform1f(a["uFlux["+c+"]"],this.fluxBand[c]),o.uniform1f(a["uOnset["+c+"]"],this.onsetBand[c]);return o.activeTexture(o.TEXTURE0),o.bindTexture(o.TEXTURE_2D,this.palTex),o.uniform1i(a.uPal,0),o.bindBuffer(o.ARRAY_BUFFER,this.quad),o.vertexAttribPointer(0,2,o.FLOAT,!1,0,0),o.enableVertexAttribArray(0),o.drawArrays(o.TRIANGLES,0,3),!0}setMorph(e){this.morph=Math.max(0,Math.min(1,e))}setMorphRate(e){this.morphRate=e}setFlyThrough(e,t){this.flyThrough=!!e,t!==void 0&&(this.flySpeed=t),e||(this.flyOffset.x=0,this.flyOffset.y=0)}isFlyThrough(){return this.flyThrough}}/**
 * @license
 * Copyright 2010-2023 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const na="162",Gc=0,Ba=1,Hc=2,vl=1,kc=2,vn=3,Dn=0,Nt=1,qt=2,Rn=0,Kn=1,Jn=2,za=3,Ga=4,Vc=5,qn=100,Wc=101,Xc=102,Ha=103,ka=104,qc=200,Yc=201,$c=202,Kc=203,kr=204,Vr=205,jc=206,Zc=207,Jc=208,Qc=209,eu=210,tu=211,nu=212,iu=213,su=214,ru=0,au=1,ou=2,Fs=3,lu=4,cu=5,uu=6,hu=7,xl=0,du=1,fu=2,Cn=0,pu=1,mu=2,gu=3,_u=4,vu=5,xu=6,Mu=7,Ml=300,Ai=301,wi=302,Wr=303,Xr=304,Ws=306,qr=1e3,Jt=1001,Yr=1002,Mt=1003,Va=1004,Oi=1005,Dt=1006,sr=1007,$n=1008,Pn=1009,yu=1010,Su=1011,ia=1012,yl=1013,wn=1014,on=1015,qi=1016,Sl=1017,El=1018,jn=1020,Eu=1021,Qt=1023,bu=1024,Tu=1025,Zn=1026,Ri=1027,bl=1028,Tl=1029,Au=1030,Al=1031,wl=1033,rr=33776,ar=33777,or=33778,lr=33779,Wa=35840,Xa=35841,qa=35842,Ya=35843,Rl=36196,$a=37492,Ka=37496,ja=37808,Za=37809,Ja=37810,Qa=37811,eo=37812,to=37813,no=37814,io=37815,so=37816,ro=37817,ao=37818,oo=37819,lo=37820,co=37821,cr=36492,uo=36494,ho=36495,wu=36283,fo=36284,po=36285,mo=36286,Ru=3200,Cu=3201,Pu=0,Lu=1,An="",rn="srgb",In="srgb-linear",sa="display-p3",Xs="display-p3-linear",Os="linear",et="srgb",Bs="rec709",zs="p3",ri=7680,go=519,Du=512,Uu=513,Iu=514,Cl=515,Nu=516,Fu=517,Ou=518,Bu=519,_o=35044,vo="300 es",$r=1035,xn=2e3,Gs=2001;class Li{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){if(this._listeners===void 0)return!1;const n=this._listeners;return n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){if(this._listeners===void 0)return;const s=this._listeners[e];if(s!==void 0){const r=s.indexOf(t);r!==-1&&s.splice(r,1)}}dispatchEvent(e){if(this._listeners===void 0)return;const n=this._listeners[e.type];if(n!==void 0){e.target=this;const s=n.slice(0);for(let r=0,o=s.length;r<o;r++)s[r].call(this,e);e.target=null}}}const bt=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Ds=Math.PI/180,Kr=180/Math.PI;function $i(){const i=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(bt[i&255]+bt[i>>8&255]+bt[i>>16&255]+bt[i>>24&255]+"-"+bt[e&255]+bt[e>>8&255]+"-"+bt[e>>16&15|64]+bt[e>>24&255]+"-"+bt[t&63|128]+bt[t>>8&255]+"-"+bt[t>>16&255]+bt[t>>24&255]+bt[n&255]+bt[n>>8&255]+bt[n>>16&255]+bt[n>>24&255]).toLowerCase()}function Ut(i,e,t){return Math.max(e,Math.min(t,i))}function zu(i,e){return(i%e+e)%e}function ur(i,e,t){return(1-t)*i+t*e}function xo(i){return(i&i-1)===0&&i!==0}function jr(i){return Math.pow(2,Math.floor(Math.log(i)/Math.LN2))}function Bi(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("Invalid component type.")}}function Lt(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("Invalid component type.")}}class He{constructor(e=0,t=0){He.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,n=this.y,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6],this.y=s[1]*t+s[4]*n+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(Ut(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const n=Math.cos(t),s=Math.sin(t),r=this.x-e.x,o=this.y-e.y;return this.x=r*n-o*s+e.x,this.y=r*s+o*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class Ie{constructor(e,t,n,s,r,o,a,l,c){Ie.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,o,a,l,c)}set(e,t,n,s,r,o,a,l,c){const u=this.elements;return u[0]=e,u[1]=s,u[2]=a,u[3]=t,u[4]=r,u[5]=l,u[6]=n,u[7]=o,u[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,s=t.elements,r=this.elements,o=n[0],a=n[3],l=n[6],c=n[1],u=n[4],h=n[7],d=n[2],m=n[5],g=n[8],_=s[0],p=s[3],f=s[6],y=s[1],M=s[4],S=s[7],R=s[2],w=s[5],A=s[8];return r[0]=o*_+a*y+l*R,r[3]=o*p+a*M+l*w,r[6]=o*f+a*S+l*A,r[1]=c*_+u*y+h*R,r[4]=c*p+u*M+h*w,r[7]=c*f+u*S+h*A,r[2]=d*_+m*y+g*R,r[5]=d*p+m*M+g*w,r[8]=d*f+m*S+g*A,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],u=e[8];return t*o*u-t*a*c-n*r*u+n*a*l+s*r*c-s*o*l}invert(){const e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],u=e[8],h=u*o-a*c,d=a*l-u*r,m=c*r-o*l,g=t*h+n*d+s*m;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);const _=1/g;return e[0]=h*_,e[1]=(s*c-u*n)*_,e[2]=(a*n-s*o)*_,e[3]=d*_,e[4]=(u*t-s*l)*_,e[5]=(s*r-a*t)*_,e[6]=m*_,e[7]=(n*l-c*t)*_,e[8]=(o*t-n*r)*_,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,s,r,o,a){const l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*o+c*a)+o+e,-s*c,s*l,-s*(-c*o+l*a)+a+t,0,0,1),this}scale(e,t){return this.premultiply(hr.makeScale(e,t)),this}rotate(e){return this.premultiply(hr.makeRotation(-e)),this}translate(e,t){return this.premultiply(hr.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,n=e.elements;for(let s=0;s<9;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}}const hr=new Ie;function Pl(i){for(let e=i.length-1;e>=0;--e)if(i[e]>=65535)return!0;return!1}function Hs(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function Gu(){const i=Hs("canvas");return i.style.display="block",i}const Mo={};function Hu(i){i in Mo||(Mo[i]=!0,console.warn(i))}const yo=new Ie().set(.8224621,.177538,0,.0331941,.9668058,0,.0170827,.0723974,.9105199),So=new Ie().set(1.2249401,-.2249404,0,-.0420569,1.0420571,0,-.0196376,-.0786361,1.0982735),ss={[In]:{transfer:Os,primaries:Bs,toReference:i=>i,fromReference:i=>i},[rn]:{transfer:et,primaries:Bs,toReference:i=>i.convertSRGBToLinear(),fromReference:i=>i.convertLinearToSRGB()},[Xs]:{transfer:Os,primaries:zs,toReference:i=>i.applyMatrix3(So),fromReference:i=>i.applyMatrix3(yo)},[sa]:{transfer:et,primaries:zs,toReference:i=>i.convertSRGBToLinear().applyMatrix3(So),fromReference:i=>i.applyMatrix3(yo).convertLinearToSRGB()}},ku=new Set([In,Xs]),je={enabled:!0,_workingColorSpace:In,get workingColorSpace(){return this._workingColorSpace},set workingColorSpace(i){if(!ku.has(i))throw new Error(`Unsupported working color space, "${i}".`);this._workingColorSpace=i},convert:function(i,e,t){if(this.enabled===!1||e===t||!e||!t)return i;const n=ss[e].toReference,s=ss[t].fromReference;return s(n(i))},fromWorkingColorSpace:function(i,e){return this.convert(i,this._workingColorSpace,e)},toWorkingColorSpace:function(i,e){return this.convert(i,e,this._workingColorSpace)},getPrimaries:function(i){return ss[i].primaries},getTransfer:function(i){return i===An?Os:ss[i].transfer}};function bi(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function dr(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}let ai;class Ll{static getDataURL(e){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let t;if(e instanceof HTMLCanvasElement)t=e;else{ai===void 0&&(ai=Hs("canvas")),ai.width=e.width,ai.height=e.height;const n=ai.getContext("2d");e instanceof ImageData?n.putImageData(e,0,0):n.drawImage(e,0,0,e.width,e.height),t=ai}return t.width>2048||t.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",e),t.toDataURL("image/jpeg",.6)):t.toDataURL("image/png")}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=Hs("canvas");t.width=e.width,t.height=e.height;const n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);const s=n.getImageData(0,0,e.width,e.height),r=s.data;for(let o=0;o<r.length;o++)r[o]=bi(r[o]/255)*255;return n.putImageData(s,0,0),t}else if(e.data){const t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(bi(t[n]/255)*255):t[n]=bi(t[n]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let Vu=0;class Dl{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:Vu++}),this.uuid=$i(),this.data=e,this.dataReady=!0,this.version=0}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let o=0,a=s.length;o<a;o++)s[o].isDataTexture?r.push(fr(s[o].image)):r.push(fr(s[o]))}else r=fr(s);n.url=r}return t||(e.images[this.uuid]=n),n}}function fr(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?Ll.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let Wu=0;class Pt extends Li{constructor(e=Pt.DEFAULT_IMAGE,t=Pt.DEFAULT_MAPPING,n=Jt,s=Jt,r=Dt,o=$n,a=Qt,l=Pn,c=Pt.DEFAULT_ANISOTROPY,u=An){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Wu++}),this.uuid=$i(),this.name="",this.source=new Dl(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=o,this.anisotropy=c,this.format=a,this.internalFormat=null,this.type=l,this.offset=new He(0,0),this.repeat=new He(1,1),this.center=new He(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Ie,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.needsPMREMUpdate=!1}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const n={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==Ml)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case qr:e.x=e.x-Math.floor(e.x);break;case Jt:e.x=e.x<0?0:1;break;case Yr:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case qr:e.y=e.y-Math.floor(e.y);break;case Jt:e.y=e.y<0?0:1;break;case Yr:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}}Pt.DEFAULT_IMAGE=null;Pt.DEFAULT_MAPPING=Ml;Pt.DEFAULT_ANISOTROPY=1;class St{constructor(e=0,t=0,n=0,s=1){St.prototype.isVector4=!0,this.x=e,this.y=t,this.z=n,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,s){return this.x=e,this.y=t,this.z=n,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,n=this.y,s=this.z,r=this.w,o=e.elements;return this.x=o[0]*t+o[4]*n+o[8]*s+o[12]*r,this.y=o[1]*t+o[5]*n+o[9]*s+o[13]*r,this.z=o[2]*t+o[6]*n+o[10]*s+o[14]*r,this.w=o[3]*t+o[7]*n+o[11]*s+o[15]*r,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,s,r;const l=e.elements,c=l[0],u=l[4],h=l[8],d=l[1],m=l[5],g=l[9],_=l[2],p=l[6],f=l[10];if(Math.abs(u-d)<.01&&Math.abs(h-_)<.01&&Math.abs(g-p)<.01){if(Math.abs(u+d)<.1&&Math.abs(h+_)<.1&&Math.abs(g+p)<.1&&Math.abs(c+m+f-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const M=(c+1)/2,S=(m+1)/2,R=(f+1)/2,w=(u+d)/4,A=(h+_)/4,D=(g+p)/4;return M>S&&M>R?M<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(M),s=w/n,r=A/n):S>R?S<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(S),n=w/s,r=D/s):R<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(R),n=A/r,s=D/r),this.set(n,s,r,t),this}let y=Math.sqrt((p-g)*(p-g)+(h-_)*(h-_)+(d-u)*(d-u));return Math.abs(y)<.001&&(y=1),this.x=(p-g)/y,this.y=(h-_)/y,this.z=(d-u)/y,this.w=Math.acos((c+m+f-1)/2),this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this.w=Math.max(e.w,Math.min(t.w,this.w)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this.w=Math.max(e,Math.min(t,this.w)),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class Xu extends Li{constructor(e=1,t=1,n={}){super(),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=1,this.scissor=new St(0,0,e,t),this.scissorTest=!1,this.viewport=new St(0,0,e,t);const s={width:e,height:t,depth:1};n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Dt,depthBuffer:!0,stencilBuffer:!1,depthTexture:null,samples:0,count:1},n);const r=new Pt(s,n.mapping,n.wrapS,n.wrapT,n.magFilter,n.minFilter,n.format,n.type,n.anisotropy,n.colorSpace);r.flipY=!1,r.generateMipmaps=n.generateMipmaps,r.internalFormat=n.internalFormat,this.textures=[];const o=n.count;for(let a=0;a<o;a++)this.textures[a]=r.clone(),this.textures[a].isRenderTargetTexture=!0;this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.depthTexture=n.depthTexture,this.samples=n.samples}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=e,this.textures[s].image.height=t,this.textures[s].image.depth=n;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let n=0,s=e.textures.length;n<s;n++)this.textures[n]=e.textures[n].clone(),this.textures[n].isRenderTargetTexture=!0;const t=Object.assign({},e.texture.image);return this.texture.source=new Dl(t),this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class Qn extends Xu{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}}class Ul extends Pt{constructor(e=null,t=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=Mt,this.minFilter=Mt,this.wrapR=Jt,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class qu extends Pt{constructor(e=null,t=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=Mt,this.minFilter=Mt,this.wrapR=Jt,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Ki{constructor(e=0,t=0,n=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=s}static slerpFlat(e,t,n,s,r,o,a){let l=n[s+0],c=n[s+1],u=n[s+2],h=n[s+3];const d=r[o+0],m=r[o+1],g=r[o+2],_=r[o+3];if(a===0){e[t+0]=l,e[t+1]=c,e[t+2]=u,e[t+3]=h;return}if(a===1){e[t+0]=d,e[t+1]=m,e[t+2]=g,e[t+3]=_;return}if(h!==_||l!==d||c!==m||u!==g){let p=1-a;const f=l*d+c*m+u*g+h*_,y=f>=0?1:-1,M=1-f*f;if(M>Number.EPSILON){const R=Math.sqrt(M),w=Math.atan2(R,f*y);p=Math.sin(p*w)/R,a=Math.sin(a*w)/R}const S=a*y;if(l=l*p+d*S,c=c*p+m*S,u=u*p+g*S,h=h*p+_*S,p===1-a){const R=1/Math.sqrt(l*l+c*c+u*u+h*h);l*=R,c*=R,u*=R,h*=R}}e[t]=l,e[t+1]=c,e[t+2]=u,e[t+3]=h}static multiplyQuaternionsFlat(e,t,n,s,r,o){const a=n[s],l=n[s+1],c=n[s+2],u=n[s+3],h=r[o],d=r[o+1],m=r[o+2],g=r[o+3];return e[t]=a*g+u*h+l*m-c*d,e[t+1]=l*g+u*d+c*h-a*m,e[t+2]=c*g+u*m+a*d-l*h,e[t+3]=u*g-a*h-l*d-c*m,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,s){return this._x=e,this._y=t,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const n=e._x,s=e._y,r=e._z,o=e._order,a=Math.cos,l=Math.sin,c=a(n/2),u=a(s/2),h=a(r/2),d=l(n/2),m=l(s/2),g=l(r/2);switch(o){case"XYZ":this._x=d*u*h+c*m*g,this._y=c*m*h-d*u*g,this._z=c*u*g+d*m*h,this._w=c*u*h-d*m*g;break;case"YXZ":this._x=d*u*h+c*m*g,this._y=c*m*h-d*u*g,this._z=c*u*g-d*m*h,this._w=c*u*h+d*m*g;break;case"ZXY":this._x=d*u*h-c*m*g,this._y=c*m*h+d*u*g,this._z=c*u*g+d*m*h,this._w=c*u*h-d*m*g;break;case"ZYX":this._x=d*u*h-c*m*g,this._y=c*m*h+d*u*g,this._z=c*u*g-d*m*h,this._w=c*u*h+d*m*g;break;case"YZX":this._x=d*u*h+c*m*g,this._y=c*m*h+d*u*g,this._z=c*u*g-d*m*h,this._w=c*u*h-d*m*g;break;case"XZY":this._x=d*u*h-c*m*g,this._y=c*m*h-d*u*g,this._z=c*u*g+d*m*h,this._w=c*u*h+d*m*g;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+o)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const n=t/2,s=Math.sin(n);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,n=t[0],s=t[4],r=t[8],o=t[1],a=t[5],l=t[9],c=t[2],u=t[6],h=t[10],d=n+a+h;if(d>0){const m=.5/Math.sqrt(d+1);this._w=.25/m,this._x=(u-l)*m,this._y=(r-c)*m,this._z=(o-s)*m}else if(n>a&&n>h){const m=2*Math.sqrt(1+n-a-h);this._w=(u-l)/m,this._x=.25*m,this._y=(s+o)/m,this._z=(r+c)/m}else if(a>h){const m=2*Math.sqrt(1+a-n-h);this._w=(r-c)/m,this._x=(s+o)/m,this._y=.25*m,this._z=(l+u)/m}else{const m=2*Math.sqrt(1+h-n-a);this._w=(o-s)/m,this._x=(r+c)/m,this._y=(l+u)/m,this._z=.25*m}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<Number.EPSILON?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(Ut(this.dot(e),-1,1)))}rotateTowards(e,t){const n=this.angleTo(e);if(n===0)return this;const s=Math.min(1,t/n);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const n=e._x,s=e._y,r=e._z,o=e._w,a=t._x,l=t._y,c=t._z,u=t._w;return this._x=n*u+o*a+s*c-r*l,this._y=s*u+o*l+r*a-n*c,this._z=r*u+o*c+n*l-s*a,this._w=o*u-n*a-s*l-r*c,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);const n=this._x,s=this._y,r=this._z,o=this._w;let a=o*e._w+n*e._x+s*e._y+r*e._z;if(a<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,a=-a):this.copy(e),a>=1)return this._w=o,this._x=n,this._y=s,this._z=r,this;const l=1-a*a;if(l<=Number.EPSILON){const m=1-t;return this._w=m*o+t*this._w,this._x=m*n+t*this._x,this._y=m*s+t*this._y,this._z=m*r+t*this._z,this.normalize(),this}const c=Math.sqrt(l),u=Math.atan2(c,a),h=Math.sin((1-t)*u)/c,d=Math.sin(t*u)/c;return this._w=o*h+this._w*d,this._x=n*h+this._x*d,this._y=s*h+this._y*d,this._z=r*h+this._z*d,this._onChangeCallback(),this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(e),s*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class P{constructor(e=0,t=0,n=0){P.prototype.isVector3=!0,this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Eo.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Eo.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6]*s,this.y=r[1]*t+r[4]*n+r[7]*s,this.z=r[2]*t+r[5]*n+r[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,n=this.y,s=this.z,r=e.elements,o=1/(r[3]*t+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*t+r[4]*n+r[8]*s+r[12])*o,this.y=(r[1]*t+r[5]*n+r[9]*s+r[13])*o,this.z=(r[2]*t+r[6]*n+r[10]*s+r[14])*o,this}applyQuaternion(e){const t=this.x,n=this.y,s=this.z,r=e.x,o=e.y,a=e.z,l=e.w,c=2*(o*s-a*n),u=2*(a*t-r*s),h=2*(r*n-o*t);return this.x=t+l*c+o*h-a*u,this.y=n+l*u+a*c-r*h,this.z=s+l*h+r*u-o*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[4]*n+r[8]*s,this.y=r[1]*t+r[5]*n+r[9]*s,this.z=r[2]*t+r[6]*n+r[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const n=e.x,s=e.y,r=e.z,o=t.x,a=t.y,l=t.z;return this.x=s*l-r*a,this.y=r*o-n*l,this.z=n*a-s*o,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return pr.copy(this).projectOnVector(e),this.sub(pr)}reflect(e){return this.sub(pr.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(Ut(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y,s=this.z-e.z;return t*t+n*n+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){const s=Math.sin(t)*e;return this.x=s*Math.sin(n),this.y=Math.cos(t)*e,this.z=s*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const pr=new P,Eo=new Ki;class ti{constructor(e=new P(1/0,1/0,1/0),t=new P(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint($t.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint($t.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const n=$t.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const n=e.geometry;if(n!==void 0){const r=n.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let o=0,a=r.count;o<a;o++)e.isMesh===!0?e.getVertexPosition(o,$t):$t.fromBufferAttribute(r,o),$t.applyMatrix4(e.matrixWorld),this.expandByPoint($t);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),rs.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),rs.copy(n.boundingBox)),rs.applyMatrix4(e.matrixWorld),this.union(rs)}const s=e.children;for(let r=0,o=s.length;r<o;r++)this.expandByObject(s[r],t);return this}containsPoint(e){return!(e.x<this.min.x||e.x>this.max.x||e.y<this.min.y||e.y>this.max.y||e.z<this.min.z||e.z>this.max.z)}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return!(e.max.x<this.min.x||e.min.x>this.max.x||e.max.y<this.min.y||e.min.y>this.max.y||e.max.z<this.min.z||e.min.z>this.max.z)}intersectsSphere(e){return this.clampPoint(e.center,$t),$t.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(zi),as.subVectors(this.max,zi),oi.subVectors(e.a,zi),li.subVectors(e.b,zi),ci.subVectors(e.c,zi),Mn.subVectors(li,oi),yn.subVectors(ci,li),Bn.subVectors(oi,ci);let t=[0,-Mn.z,Mn.y,0,-yn.z,yn.y,0,-Bn.z,Bn.y,Mn.z,0,-Mn.x,yn.z,0,-yn.x,Bn.z,0,-Bn.x,-Mn.y,Mn.x,0,-yn.y,yn.x,0,-Bn.y,Bn.x,0];return!mr(t,oi,li,ci,as)||(t=[1,0,0,0,1,0,0,0,1],!mr(t,oi,li,ci,as))?!1:(os.crossVectors(Mn,yn),t=[os.x,os.y,os.z],mr(t,oi,li,ci,as))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,$t).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize($t).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(fn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),fn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),fn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),fn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),fn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),fn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),fn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),fn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(fn),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}}const fn=[new P,new P,new P,new P,new P,new P,new P,new P],$t=new P,rs=new ti,oi=new P,li=new P,ci=new P,Mn=new P,yn=new P,Bn=new P,zi=new P,as=new P,os=new P,zn=new P;function mr(i,e,t,n,s){for(let r=0,o=i.length-3;r<=o;r+=3){zn.fromArray(i,r);const a=s.x*Math.abs(zn.x)+s.y*Math.abs(zn.y)+s.z*Math.abs(zn.z),l=e.dot(zn),c=t.dot(zn),u=n.dot(zn);if(Math.max(-Math.max(l,c,u),Math.min(l,c,u))>a)return!1}return!0}const Yu=new ti,Gi=new P,gr=new P;class ni{constructor(e=new P,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const n=this.center;t!==void 0?n.copy(t):Yu.setFromPoints(e).getCenter(n);let s=0;for(let r=0,o=e.length;r<o;r++)s=Math.max(s,n.distanceToSquared(e[r]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Gi.subVectors(e,this.center);const t=Gi.lengthSq();if(t>this.radius*this.radius){const n=Math.sqrt(t),s=(n-this.radius)*.5;this.center.addScaledVector(Gi,s/n),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(gr.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Gi.copy(e.center).add(gr)),this.expandByPoint(Gi.copy(e.center).sub(gr))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}}const pn=new P,_r=new P,ls=new P,Sn=new P,vr=new P,cs=new P,xr=new P;class ra{constructor(e=new P,t=new P(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,pn)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=pn.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(pn.copy(this.origin).addScaledVector(this.direction,t),pn.distanceToSquared(e))}distanceSqToSegment(e,t,n,s){_r.copy(e).add(t).multiplyScalar(.5),ls.copy(t).sub(e).normalize(),Sn.copy(this.origin).sub(_r);const r=e.distanceTo(t)*.5,o=-this.direction.dot(ls),a=Sn.dot(this.direction),l=-Sn.dot(ls),c=Sn.lengthSq(),u=Math.abs(1-o*o);let h,d,m,g;if(u>0)if(h=o*l-a,d=o*a-l,g=r*u,h>=0)if(d>=-g)if(d<=g){const _=1/u;h*=_,d*=_,m=h*(h+o*d+2*a)+d*(o*h+d+2*l)+c}else d=r,h=Math.max(0,-(o*d+a)),m=-h*h+d*(d+2*l)+c;else d=-r,h=Math.max(0,-(o*d+a)),m=-h*h+d*(d+2*l)+c;else d<=-g?(h=Math.max(0,-(-o*r+a)),d=h>0?-r:Math.min(Math.max(-r,-l),r),m=-h*h+d*(d+2*l)+c):d<=g?(h=0,d=Math.min(Math.max(-r,-l),r),m=d*(d+2*l)+c):(h=Math.max(0,-(o*r+a)),d=h>0?r:Math.min(Math.max(-r,-l),r),m=-h*h+d*(d+2*l)+c);else d=o>0?-r:r,h=Math.max(0,-(o*d+a)),m=-h*h+d*(d+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,h),s&&s.copy(_r).addScaledVector(ls,d),m}intersectSphere(e,t){pn.subVectors(e.center,this.origin);const n=pn.dot(this.direction),s=pn.dot(pn)-n*n,r=e.radius*e.radius;if(s>r)return null;const o=Math.sqrt(r-s),a=n-o,l=n+o;return l<0?null:a<0?this.at(l,t):this.at(a,t)}intersectsSphere(e){return this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){const n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,s,r,o,a,l;const c=1/this.direction.x,u=1/this.direction.y,h=1/this.direction.z,d=this.origin;return c>=0?(n=(e.min.x-d.x)*c,s=(e.max.x-d.x)*c):(n=(e.max.x-d.x)*c,s=(e.min.x-d.x)*c),u>=0?(r=(e.min.y-d.y)*u,o=(e.max.y-d.y)*u):(r=(e.max.y-d.y)*u,o=(e.min.y-d.y)*u),n>o||r>s||((r>n||isNaN(n))&&(n=r),(o<s||isNaN(s))&&(s=o),h>=0?(a=(e.min.z-d.z)*h,l=(e.max.z-d.z)*h):(a=(e.max.z-d.z)*h,l=(e.min.z-d.z)*h),n>l||a>s)||((a>n||n!==n)&&(n=a),(l<s||s!==s)&&(s=l),s<0)?null:this.at(n>=0?n:s,t)}intersectsBox(e){return this.intersectBox(e,pn)!==null}intersectTriangle(e,t,n,s,r){vr.subVectors(t,e),cs.subVectors(n,e),xr.crossVectors(vr,cs);let o=this.direction.dot(xr),a;if(o>0){if(s)return null;a=1}else if(o<0)a=-1,o=-o;else return null;Sn.subVectors(this.origin,e);const l=a*this.direction.dot(cs.crossVectors(Sn,cs));if(l<0)return null;const c=a*this.direction.dot(vr.cross(Sn));if(c<0||l+c>o)return null;const u=-a*Sn.dot(xr);return u<0?null:this.at(u/o,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class it{constructor(e,t,n,s,r,o,a,l,c,u,h,d,m,g,_,p){it.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,o,a,l,c,u,h,d,m,g,_,p)}set(e,t,n,s,r,o,a,l,c,u,h,d,m,g,_,p){const f=this.elements;return f[0]=e,f[4]=t,f[8]=n,f[12]=s,f[1]=r,f[5]=o,f[9]=a,f[13]=l,f[2]=c,f[6]=u,f[10]=h,f[14]=d,f[3]=m,f[7]=g,f[11]=_,f[15]=p,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new it().fromArray(this.elements)}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){const t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){const t=this.elements,n=e.elements,s=1/ui.setFromMatrixColumn(e,0).length(),r=1/ui.setFromMatrixColumn(e,1).length(),o=1/ui.setFromMatrixColumn(e,2).length();return t[0]=n[0]*s,t[1]=n[1]*s,t[2]=n[2]*s,t[3]=0,t[4]=n[4]*r,t[5]=n[5]*r,t[6]=n[6]*r,t[7]=0,t[8]=n[8]*o,t[9]=n[9]*o,t[10]=n[10]*o,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,n=e.x,s=e.y,r=e.z,o=Math.cos(n),a=Math.sin(n),l=Math.cos(s),c=Math.sin(s),u=Math.cos(r),h=Math.sin(r);if(e.order==="XYZ"){const d=o*u,m=o*h,g=a*u,_=a*h;t[0]=l*u,t[4]=-l*h,t[8]=c,t[1]=m+g*c,t[5]=d-_*c,t[9]=-a*l,t[2]=_-d*c,t[6]=g+m*c,t[10]=o*l}else if(e.order==="YXZ"){const d=l*u,m=l*h,g=c*u,_=c*h;t[0]=d+_*a,t[4]=g*a-m,t[8]=o*c,t[1]=o*h,t[5]=o*u,t[9]=-a,t[2]=m*a-g,t[6]=_+d*a,t[10]=o*l}else if(e.order==="ZXY"){const d=l*u,m=l*h,g=c*u,_=c*h;t[0]=d-_*a,t[4]=-o*h,t[8]=g+m*a,t[1]=m+g*a,t[5]=o*u,t[9]=_-d*a,t[2]=-o*c,t[6]=a,t[10]=o*l}else if(e.order==="ZYX"){const d=o*u,m=o*h,g=a*u,_=a*h;t[0]=l*u,t[4]=g*c-m,t[8]=d*c+_,t[1]=l*h,t[5]=_*c+d,t[9]=m*c-g,t[2]=-c,t[6]=a*l,t[10]=o*l}else if(e.order==="YZX"){const d=o*l,m=o*c,g=a*l,_=a*c;t[0]=l*u,t[4]=_-d*h,t[8]=g*h+m,t[1]=h,t[5]=o*u,t[9]=-a*u,t[2]=-c*u,t[6]=m*h+g,t[10]=d-_*h}else if(e.order==="XZY"){const d=o*l,m=o*c,g=a*l,_=a*c;t[0]=l*u,t[4]=-h,t[8]=c*u,t[1]=d*h+_,t[5]=o*u,t[9]=m*h-g,t[2]=g*h-m,t[6]=a*u,t[10]=_*h+d}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose($u,e,Ku)}lookAt(e,t,n){const s=this.elements;return Bt.subVectors(e,t),Bt.lengthSq()===0&&(Bt.z=1),Bt.normalize(),En.crossVectors(n,Bt),En.lengthSq()===0&&(Math.abs(n.z)===1?Bt.x+=1e-4:Bt.z+=1e-4,Bt.normalize(),En.crossVectors(n,Bt)),En.normalize(),us.crossVectors(Bt,En),s[0]=En.x,s[4]=us.x,s[8]=Bt.x,s[1]=En.y,s[5]=us.y,s[9]=Bt.y,s[2]=En.z,s[6]=us.z,s[10]=Bt.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,s=t.elements,r=this.elements,o=n[0],a=n[4],l=n[8],c=n[12],u=n[1],h=n[5],d=n[9],m=n[13],g=n[2],_=n[6],p=n[10],f=n[14],y=n[3],M=n[7],S=n[11],R=n[15],w=s[0],A=s[4],D=s[8],k=s[12],v=s[1],T=s[5],q=s[9],$=s[13],C=s[2],W=s[6],H=s[10],K=s[14],V=s[3],Y=s[7],j=s[11],ie=s[15];return r[0]=o*w+a*v+l*C+c*V,r[4]=o*A+a*T+l*W+c*Y,r[8]=o*D+a*q+l*H+c*j,r[12]=o*k+a*$+l*K+c*ie,r[1]=u*w+h*v+d*C+m*V,r[5]=u*A+h*T+d*W+m*Y,r[9]=u*D+h*q+d*H+m*j,r[13]=u*k+h*$+d*K+m*ie,r[2]=g*w+_*v+p*C+f*V,r[6]=g*A+_*T+p*W+f*Y,r[10]=g*D+_*q+p*H+f*j,r[14]=g*k+_*$+p*K+f*ie,r[3]=y*w+M*v+S*C+R*V,r[7]=y*A+M*T+S*W+R*Y,r[11]=y*D+M*q+S*H+R*j,r[15]=y*k+M*$+S*K+R*ie,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[4],s=e[8],r=e[12],o=e[1],a=e[5],l=e[9],c=e[13],u=e[2],h=e[6],d=e[10],m=e[14],g=e[3],_=e[7],p=e[11],f=e[15];return g*(+r*l*h-s*c*h-r*a*d+n*c*d+s*a*m-n*l*m)+_*(+t*l*m-t*c*d+r*o*d-s*o*m+s*c*u-r*l*u)+p*(+t*c*h-t*a*m-r*o*h+n*o*m+r*a*u-n*c*u)+f*(-s*a*u-t*l*h+t*a*d+s*o*h-n*o*d+n*l*u)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){const s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=n),this}invert(){const e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],u=e[8],h=e[9],d=e[10],m=e[11],g=e[12],_=e[13],p=e[14],f=e[15],y=h*p*c-_*d*c+_*l*m-a*p*m-h*l*f+a*d*f,M=g*d*c-u*p*c-g*l*m+o*p*m+u*l*f-o*d*f,S=u*_*c-g*h*c+g*a*m-o*_*m-u*a*f+o*h*f,R=g*h*l-u*_*l-g*a*d+o*_*d+u*a*p-o*h*p,w=t*y+n*M+s*S+r*R;if(w===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const A=1/w;return e[0]=y*A,e[1]=(_*d*r-h*p*r-_*s*m+n*p*m+h*s*f-n*d*f)*A,e[2]=(a*p*r-_*l*r+_*s*c-n*p*c-a*s*f+n*l*f)*A,e[3]=(h*l*r-a*d*r-h*s*c+n*d*c+a*s*m-n*l*m)*A,e[4]=M*A,e[5]=(u*p*r-g*d*r+g*s*m-t*p*m-u*s*f+t*d*f)*A,e[6]=(g*l*r-o*p*r-g*s*c+t*p*c+o*s*f-t*l*f)*A,e[7]=(o*d*r-u*l*r+u*s*c-t*d*c-o*s*m+t*l*m)*A,e[8]=S*A,e[9]=(g*h*r-u*_*r-g*n*m+t*_*m+u*n*f-t*h*f)*A,e[10]=(o*_*r-g*a*r+g*n*c-t*_*c-o*n*f+t*a*f)*A,e[11]=(u*a*r-o*h*r-u*n*c+t*h*c+o*n*m-t*a*m)*A,e[12]=R*A,e[13]=(u*_*s-g*h*s+g*n*d-t*_*d-u*n*p+t*h*p)*A,e[14]=(g*a*s-o*_*s-g*n*l+t*_*l+o*n*p-t*a*p)*A,e[15]=(o*h*s-u*a*s+u*n*l-t*h*l-o*n*d+t*a*d)*A,this}scale(e){const t=this.elements,n=e.x,s=e.y,r=e.z;return t[0]*=n,t[4]*=s,t[8]*=r,t[1]*=n,t[5]*=s,t[9]*=r,t[2]*=n,t[6]*=s,t[10]*=r,t[3]*=n,t[7]*=s,t[11]*=r,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,s))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const n=Math.cos(t),s=Math.sin(t),r=1-n,o=e.x,a=e.y,l=e.z,c=r*o,u=r*a;return this.set(c*o+n,c*a-s*l,c*l+s*a,0,c*a+s*l,u*a+n,u*l-s*o,0,c*l-s*a,u*l+s*o,r*l*l+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,s,r,o){return this.set(1,n,r,0,e,1,o,0,t,s,1,0,0,0,0,1),this}compose(e,t,n){const s=this.elements,r=t._x,o=t._y,a=t._z,l=t._w,c=r+r,u=o+o,h=a+a,d=r*c,m=r*u,g=r*h,_=o*u,p=o*h,f=a*h,y=l*c,M=l*u,S=l*h,R=n.x,w=n.y,A=n.z;return s[0]=(1-(_+f))*R,s[1]=(m+S)*R,s[2]=(g-M)*R,s[3]=0,s[4]=(m-S)*w,s[5]=(1-(d+f))*w,s[6]=(p+y)*w,s[7]=0,s[8]=(g+M)*A,s[9]=(p-y)*A,s[10]=(1-(d+_))*A,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,n){const s=this.elements;let r=ui.set(s[0],s[1],s[2]).length();const o=ui.set(s[4],s[5],s[6]).length(),a=ui.set(s[8],s[9],s[10]).length();this.determinant()<0&&(r=-r),e.x=s[12],e.y=s[13],e.z=s[14],Kt.copy(this);const c=1/r,u=1/o,h=1/a;return Kt.elements[0]*=c,Kt.elements[1]*=c,Kt.elements[2]*=c,Kt.elements[4]*=u,Kt.elements[5]*=u,Kt.elements[6]*=u,Kt.elements[8]*=h,Kt.elements[9]*=h,Kt.elements[10]*=h,t.setFromRotationMatrix(Kt),n.x=r,n.y=o,n.z=a,this}makePerspective(e,t,n,s,r,o,a=xn){const l=this.elements,c=2*r/(t-e),u=2*r/(n-s),h=(t+e)/(t-e),d=(n+s)/(n-s);let m,g;if(a===xn)m=-(o+r)/(o-r),g=-2*o*r/(o-r);else if(a===Gs)m=-o/(o-r),g=-o*r/(o-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return l[0]=c,l[4]=0,l[8]=h,l[12]=0,l[1]=0,l[5]=u,l[9]=d,l[13]=0,l[2]=0,l[6]=0,l[10]=m,l[14]=g,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(e,t,n,s,r,o,a=xn){const l=this.elements,c=1/(t-e),u=1/(n-s),h=1/(o-r),d=(t+e)*c,m=(n+s)*u;let g,_;if(a===xn)g=(o+r)*h,_=-2*h;else if(a===Gs)g=r*h,_=-1*h;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return l[0]=2*c,l[4]=0,l[8]=0,l[12]=-d,l[1]=0,l[5]=2*u,l[9]=0,l[13]=-m,l[2]=0,l[6]=0,l[10]=_,l[14]=-g,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(e){const t=this.elements,n=e.elements;for(let s=0;s<16;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}}const ui=new P,Kt=new it,$u=new P(0,0,0),Ku=new P(1,1,1),En=new P,us=new P,Bt=new P,bo=new it,To=new Ki;class ln{constructor(e=0,t=0,n=0,s=ln.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,s=this._order){return this._x=e,this._y=t,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){const s=e.elements,r=s[0],o=s[4],a=s[8],l=s[1],c=s[5],u=s[9],h=s[2],d=s[6],m=s[10];switch(t){case"XYZ":this._y=Math.asin(Ut(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-u,m),this._z=Math.atan2(-o,r)):(this._x=Math.atan2(d,c),this._z=0);break;case"YXZ":this._x=Math.asin(-Ut(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(a,m),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-h,r),this._z=0);break;case"ZXY":this._x=Math.asin(Ut(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-h,m),this._z=Math.atan2(-o,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-Ut(h,-1,1)),Math.abs(h)<.9999999?(this._x=Math.atan2(d,m),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-o,c));break;case"YZX":this._z=Math.asin(Ut(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-u,c),this._y=Math.atan2(-h,r)):(this._x=0,this._y=Math.atan2(a,m));break;case"XZY":this._z=Math.asin(-Ut(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(a,r)):(this._x=Math.atan2(-u,m),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return bo.makeRotationFromQuaternion(e),this.setFromRotationMatrix(bo,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return To.setFromEuler(this),this.setFromQuaternion(To,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}ln.DEFAULT_ORDER="XYZ";class Il{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let ju=0;const Ao=new P,hi=new Ki,mn=new it,hs=new P,Hi=new P,Zu=new P,Ju=new Ki,wo=new P(1,0,0),Ro=new P(0,1,0),Co=new P(0,0,1),Qu={type:"added"},eh={type:"removed"},Mr={type:"childadded",child:null},yr={type:"childremoved",child:null};class _t extends Li{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:ju++}),this.uuid=$i(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=_t.DEFAULT_UP.clone();const e=new P,t=new ln,n=new Ki,s=new P(1,1,1);function r(){n.setFromEuler(t,!1)}function o(){t.setFromQuaternion(n,void 0,!1)}t._onChange(r),n._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new it},normalMatrix:{value:new Ie}}),this.matrix=new it,this.matrixWorld=new it,this.matrixAutoUpdate=_t.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=_t.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Il,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return hi.setFromAxisAngle(e,t),this.quaternion.multiply(hi),this}rotateOnWorldAxis(e,t){return hi.setFromAxisAngle(e,t),this.quaternion.premultiply(hi),this}rotateX(e){return this.rotateOnAxis(wo,e)}rotateY(e){return this.rotateOnAxis(Ro,e)}rotateZ(e){return this.rotateOnAxis(Co,e)}translateOnAxis(e,t){return Ao.copy(e).applyQuaternion(this.quaternion),this.position.add(Ao.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(wo,e)}translateY(e){return this.translateOnAxis(Ro,e)}translateZ(e){return this.translateOnAxis(Co,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(mn.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?hs.copy(e):hs.set(e,t,n);const s=this.parent;this.updateWorldMatrix(!0,!1),Hi.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?mn.lookAt(Hi,hs,this.up):mn.lookAt(hs,Hi,this.up),this.quaternion.setFromRotationMatrix(mn),s&&(mn.extractRotation(s.matrixWorld),hi.setFromRotationMatrix(mn),this.quaternion.premultiply(hi.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.parent!==null&&e.parent.remove(e),e.parent=this,this.children.push(e),e.dispatchEvent(Qu),Mr.child=e,this.dispatchEvent(Mr),Mr.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(eh),yr.child=e,this.dispatchEvent(yr),yr.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),mn.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),mn.multiply(e.parent.matrixWorld)),e.applyMatrix4(mn),this.add(e),e.updateWorldMatrix(!1,!0),this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,s=this.children.length;n<s;n++){const o=this.children[n].getObjectByProperty(e,t);if(o!==void 0)return o}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);const s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Hi,e,Zu),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Hi,Ju,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);const t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let n=0,s=t.length;n<s;n++){const r=t[n];(r.matrixWorldAutoUpdate===!0||e===!0)&&r.updateMatrixWorld(e)}}updateWorldMatrix(e,t){const n=this.parent;if(e===!0&&n!==null&&n.matrixWorldAutoUpdate===!0&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix),t===!0){const s=this.children;for(let r=0,o=s.length;r<o;r++){const a=s[r];a.matrixWorldAutoUpdate===!0&&a.updateWorldMatrix(!1,!0)}}}toJSON(e){const t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});const s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.visibility=this._visibility,s.active=this._active,s.bounds=this._bounds.map(a=>({boxInitialized:a.boxInitialized,boxMin:a.box.min.toArray(),boxMax:a.box.max.toArray(),sphereInitialized:a.sphereInitialized,sphereRadius:a.sphere.radius,sphereCenter:a.sphere.center.toArray()})),s.maxGeometryCount=this._maxGeometryCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.geometryCount=this._geometryCount,s.matricesTexture=this._matricesTexture.toJSON(e),this.boundingSphere!==null&&(s.boundingSphere={center:s.boundingSphere.center.toArray(),radius:s.boundingSphere.radius}),this.boundingBox!==null&&(s.boundingBox={min:s.boundingBox.min.toArray(),max:s.boundingBox.max.toArray()}));function r(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(e.geometries,this.geometry);const a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){const l=a.shapes;if(Array.isArray(l))for(let c=0,u=l.length;c<u;c++){const h=l[c];r(e.shapes,h)}else r(e.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const a=[];for(let l=0,c=this.material.length;l<c;l++)a.push(r(e.materials,this.material[l]));s.material=a}else s.material=r(e.materials,this.material);if(this.children.length>0){s.children=[];for(let a=0;a<this.children.length;a++)s.children.push(this.children[a].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let a=0;a<this.animations.length;a++){const l=this.animations[a];s.animations.push(r(e.animations,l))}}if(t){const a=o(e.geometries),l=o(e.materials),c=o(e.textures),u=o(e.images),h=o(e.shapes),d=o(e.skeletons),m=o(e.animations),g=o(e.nodes);a.length>0&&(n.geometries=a),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),u.length>0&&(n.images=u),h.length>0&&(n.shapes=h),d.length>0&&(n.skeletons=d),m.length>0&&(n.animations=m),g.length>0&&(n.nodes=g)}return n.object=s,n;function o(a){const l=[];for(const c in a){const u=a[c];delete u.metadata,l.push(u)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){const s=e.children[n];this.add(s.clone())}return this}}_t.DEFAULT_UP=new P(0,1,0);_t.DEFAULT_MATRIX_AUTO_UPDATE=!0;_t.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const jt=new P,gn=new P,Sr=new P,_n=new P,di=new P,fi=new P,Po=new P,Er=new P,br=new P,Tr=new P;class en{constructor(e=new P,t=new P,n=new P){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,s){s.subVectors(n,t),jt.subVectors(e,t),s.cross(jt);const r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(e,t,n,s,r){jt.subVectors(s,t),gn.subVectors(n,t),Sr.subVectors(e,t);const o=jt.dot(jt),a=jt.dot(gn),l=jt.dot(Sr),c=gn.dot(gn),u=gn.dot(Sr),h=o*c-a*a;if(h===0)return r.set(0,0,0),null;const d=1/h,m=(c*l-a*u)*d,g=(o*u-a*l)*d;return r.set(1-m-g,g,m)}static containsPoint(e,t,n,s){return this.getBarycoord(e,t,n,s,_n)===null?!1:_n.x>=0&&_n.y>=0&&_n.x+_n.y<=1}static getInterpolation(e,t,n,s,r,o,a,l){return this.getBarycoord(e,t,n,s,_n)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,_n.x),l.addScaledVector(o,_n.y),l.addScaledVector(a,_n.z),l)}static isFrontFacing(e,t,n,s){return jt.subVectors(n,t),gn.subVectors(e,t),jt.cross(gn).dot(s)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,s){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,n,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return jt.subVectors(this.c,this.b),gn.subVectors(this.a,this.b),jt.cross(gn).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return en.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return en.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,s,r){return en.getInterpolation(e,this.a,this.b,this.c,t,n,s,r)}containsPoint(e){return en.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return en.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const n=this.a,s=this.b,r=this.c;let o,a;di.subVectors(s,n),fi.subVectors(r,n),Er.subVectors(e,n);const l=di.dot(Er),c=fi.dot(Er);if(l<=0&&c<=0)return t.copy(n);br.subVectors(e,s);const u=di.dot(br),h=fi.dot(br);if(u>=0&&h<=u)return t.copy(s);const d=l*h-u*c;if(d<=0&&l>=0&&u<=0)return o=l/(l-u),t.copy(n).addScaledVector(di,o);Tr.subVectors(e,r);const m=di.dot(Tr),g=fi.dot(Tr);if(g>=0&&m<=g)return t.copy(r);const _=m*c-l*g;if(_<=0&&c>=0&&g<=0)return a=c/(c-g),t.copy(n).addScaledVector(fi,a);const p=u*g-m*h;if(p<=0&&h-u>=0&&m-g>=0)return Po.subVectors(r,s),a=(h-u)/(h-u+(m-g)),t.copy(s).addScaledVector(Po,a);const f=1/(p+_+d);return o=_*f,a=d*f,t.copy(n).addScaledVector(di,o).addScaledVector(fi,a)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}const Nl={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},bn={h:0,s:0,l:0},ds={h:0,s:0,l:0};function Ar(i,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?i+(e-i)*6*t:t<1/2?e:t<2/3?i+(e-i)*6*(2/3-t):i}class Ve{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){const s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=rn){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,je.toWorkingColorSpace(this,t),this}setRGB(e,t,n,s=je.workingColorSpace){return this.r=e,this.g=t,this.b=n,je.toWorkingColorSpace(this,s),this}setHSL(e,t,n,s=je.workingColorSpace){if(e=zu(e,1),t=Ut(t,0,1),n=Ut(n,0,1),t===0)this.r=this.g=this.b=n;else{const r=n<=.5?n*(1+t):n+t-n*t,o=2*n-r;this.r=Ar(o,r,e+1/3),this.g=Ar(o,r,e),this.b=Ar(o,r,e-1/3)}return je.toWorkingColorSpace(this,s),this}setStyle(e,t=rn){function n(r){r!==void 0&&parseFloat(r)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let r;const o=s[1],a=s[2];switch(o){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){const r=s[1],o=r.length;if(o===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(o===6)return this.setHex(parseInt(r,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=rn){const n=Nl[e.toLowerCase()];return n!==void 0?this.setHex(n,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=bi(e.r),this.g=bi(e.g),this.b=bi(e.b),this}copyLinearToSRGB(e){return this.r=dr(e.r),this.g=dr(e.g),this.b=dr(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=rn){return je.fromWorkingColorSpace(Tt.copy(this),e),Math.round(Ut(Tt.r*255,0,255))*65536+Math.round(Ut(Tt.g*255,0,255))*256+Math.round(Ut(Tt.b*255,0,255))}getHexString(e=rn){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=je.workingColorSpace){je.fromWorkingColorSpace(Tt.copy(this),t);const n=Tt.r,s=Tt.g,r=Tt.b,o=Math.max(n,s,r),a=Math.min(n,s,r);let l,c;const u=(a+o)/2;if(a===o)l=0,c=0;else{const h=o-a;switch(c=u<=.5?h/(o+a):h/(2-o-a),o){case n:l=(s-r)/h+(s<r?6:0);break;case s:l=(r-n)/h+2;break;case r:l=(n-s)/h+4;break}l/=6}return e.h=l,e.s=c,e.l=u,e}getRGB(e,t=je.workingColorSpace){return je.fromWorkingColorSpace(Tt.copy(this),t),e.r=Tt.r,e.g=Tt.g,e.b=Tt.b,e}getStyle(e=rn){je.fromWorkingColorSpace(Tt.copy(this),e);const t=Tt.r,n=Tt.g,s=Tt.b;return e!==rn?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(e,t,n){return this.getHSL(bn),this.setHSL(bn.h+e,bn.s+t,bn.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(bn),e.getHSL(ds);const n=ur(bn.h,ds.h,t),s=ur(bn.s,ds.s,t),r=ur(bn.l,ds.l,t);return this.setHSL(n,s,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,n=this.g,s=this.b,r=e.elements;return this.r=r[0]*t+r[3]*n+r[6]*s,this.g=r[1]*t+r[4]*n+r[7]*s,this.b=r[2]*t+r[5]*n+r[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const Tt=new Ve;Ve.NAMES=Nl;let th=0;class Di extends Li{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:th++}),this.uuid=$i(),this.name="",this.type="Material",this.blending=Kn,this.side=Dn,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=kr,this.blendDst=Vr,this.blendEquation=qn,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Ve(0,0,0),this.blendAlpha=0,this.depthFunc=Fs,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=go,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=ri,this.stencilZFail=ri,this.stencilZPass=ri,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBuild(){}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const n=e[t];if(n===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}const s=this[t];if(s===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[t]=n}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const n={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==Kn&&(n.blending=this.blending),this.side!==Dn&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==kr&&(n.blendSrc=this.blendSrc),this.blendDst!==Vr&&(n.blendDst=this.blendDst),this.blendEquation!==qn&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==Fs&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==go&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==ri&&(n.stencilFail=this.stencilFail),this.stencilZFail!==ri&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==ri&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){const o=[];for(const a in r){const l=r[a];delete l.metadata,o.push(l)}return o}if(t){const r=s(e.textures),o=s(e.images);r.length>0&&(n.textures=r),o.length>0&&(n.images=o)}return n}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let n=null;if(t!==null){const s=t.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}}class nn extends Di{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Ve(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new ln,this.combine=xl,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const ut=new P,fs=new He;class ht{constructor(e,t,n=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=_o,this._updateRange={offset:0,count:-1},this.updateRanges=[],this.gpuType=on,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}get updateRange(){return Hu("THREE.BufferAttribute: updateRange() is deprecated and will be removed in r169. Use addUpdateRange() instead."),this._updateRange}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[e+s]=t.array[n+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)fs.fromBufferAttribute(this,t),fs.applyMatrix3(e),this.setXY(t,fs.x,fs.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)ut.fromBufferAttribute(this,t),ut.applyMatrix3(e),this.setXYZ(t,ut.x,ut.y,ut.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)ut.fromBufferAttribute(this,t),ut.applyMatrix4(e),this.setXYZ(t,ut.x,ut.y,ut.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)ut.fromBufferAttribute(this,t),ut.applyNormalMatrix(e),this.setXYZ(t,ut.x,ut.y,ut.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)ut.fromBufferAttribute(this,t),ut.transformDirection(e),this.setXYZ(t,ut.x,ut.y,ut.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=Bi(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=Lt(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=Bi(t,this.array)),t}setX(e,t){return this.normalized&&(t=Lt(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=Bi(t,this.array)),t}setY(e,t){return this.normalized&&(t=Lt(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=Bi(t,this.array)),t}setZ(e,t){return this.normalized&&(t=Lt(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=Bi(t,this.array)),t}setW(e,t){return this.normalized&&(t=Lt(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=Lt(t,this.array),n=Lt(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,s){return e*=this.itemSize,this.normalized&&(t=Lt(t,this.array),n=Lt(n,this.array),s=Lt(s,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this}setXYZW(e,t,n,s,r){return e*=this.itemSize,this.normalized&&(t=Lt(t,this.array),n=Lt(n,this.array),s=Lt(s,this.array),r=Lt(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==_o&&(e.usage=this.usage),e}}class Fl extends ht{constructor(e,t,n){super(new Uint16Array(e),t,n)}}class Ol extends ht{constructor(e,t,n){super(new Uint32Array(e),t,n)}}class Ze extends ht{constructor(e,t,n){super(new Float32Array(e),t,n)}}let nh=0;const Wt=new it,wr=new _t,pi=new P,zt=new ti,ki=new ti,mt=new P;class rt extends Li{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:nh++}),this.uuid=$i(),this.name="",this.type="BufferGeometry",this.index=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(Pl(e)?Ol:Fl)(e,1):this.index=e,this}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const n=this.attributes.normal;if(n!==void 0){const r=new Ie().getNormalMatrix(e);n.applyNormalMatrix(r),n.needsUpdate=!0}const s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return Wt.makeRotationFromQuaternion(e),this.applyMatrix4(Wt),this}rotateX(e){return Wt.makeRotationX(e),this.applyMatrix4(Wt),this}rotateY(e){return Wt.makeRotationY(e),this.applyMatrix4(Wt),this}rotateZ(e){return Wt.makeRotationZ(e),this.applyMatrix4(Wt),this}translate(e,t,n){return Wt.makeTranslation(e,t,n),this.applyMatrix4(Wt),this}scale(e,t,n){return Wt.makeScale(e,t,n),this.applyMatrix4(Wt),this}lookAt(e){return wr.lookAt(e),wr.updateMatrix(),this.applyMatrix4(wr.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(pi).negate(),this.translate(pi.x,pi.y,pi.z),this}setFromPoints(e){const t=[];for(let n=0,s=e.length;n<s;n++){const r=e[n];t.push(r.x,r.y,r.z||0)}return this.setAttribute("position",new Ze(t,3)),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new ti);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new P(-1/0,-1/0,-1/0),new P(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,s=t.length;n<s;n++){const r=t[n];zt.setFromBufferAttribute(r),this.morphTargetsRelative?(mt.addVectors(this.boundingBox.min,zt.min),this.boundingBox.expandByPoint(mt),mt.addVectors(this.boundingBox.max,zt.max),this.boundingBox.expandByPoint(mt)):(this.boundingBox.expandByPoint(zt.min),this.boundingBox.expandByPoint(zt.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new ni);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new P,1/0);return}if(e){const n=this.boundingSphere.center;if(zt.setFromBufferAttribute(e),t)for(let r=0,o=t.length;r<o;r++){const a=t[r];ki.setFromBufferAttribute(a),this.morphTargetsRelative?(mt.addVectors(zt.min,ki.min),zt.expandByPoint(mt),mt.addVectors(zt.max,ki.max),zt.expandByPoint(mt)):(zt.expandByPoint(ki.min),zt.expandByPoint(ki.max))}zt.getCenter(n);let s=0;for(let r=0,o=e.count;r<o;r++)mt.fromBufferAttribute(e,r),s=Math.max(s,n.distanceToSquared(mt));if(t)for(let r=0,o=t.length;r<o;r++){const a=t[r],l=this.morphTargetsRelative;for(let c=0,u=a.count;c<u;c++)mt.fromBufferAttribute(a,c),l&&(pi.fromBufferAttribute(e,c),mt.add(pi)),s=Math.max(s,n.distanceToSquared(mt))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const n=t.position,s=t.normal,r=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new ht(new Float32Array(4*n.count),4));const o=this.getAttribute("tangent"),a=[],l=[];for(let D=0;D<n.count;D++)a[D]=new P,l[D]=new P;const c=new P,u=new P,h=new P,d=new He,m=new He,g=new He,_=new P,p=new P;function f(D,k,v){c.fromBufferAttribute(n,D),u.fromBufferAttribute(n,k),h.fromBufferAttribute(n,v),d.fromBufferAttribute(r,D),m.fromBufferAttribute(r,k),g.fromBufferAttribute(r,v),u.sub(c),h.sub(c),m.sub(d),g.sub(d);const T=1/(m.x*g.y-g.x*m.y);isFinite(T)&&(_.copy(u).multiplyScalar(g.y).addScaledVector(h,-m.y).multiplyScalar(T),p.copy(h).multiplyScalar(m.x).addScaledVector(u,-g.x).multiplyScalar(T),a[D].add(_),a[k].add(_),a[v].add(_),l[D].add(p),l[k].add(p),l[v].add(p))}let y=this.groups;y.length===0&&(y=[{start:0,count:e.count}]);for(let D=0,k=y.length;D<k;++D){const v=y[D],T=v.start,q=v.count;for(let $=T,C=T+q;$<C;$+=3)f(e.getX($+0),e.getX($+1),e.getX($+2))}const M=new P,S=new P,R=new P,w=new P;function A(D){R.fromBufferAttribute(s,D),w.copy(R);const k=a[D];M.copy(k),M.sub(R.multiplyScalar(R.dot(k))).normalize(),S.crossVectors(w,k);const T=S.dot(l[D])<0?-1:1;o.setXYZW(D,M.x,M.y,M.z,T)}for(let D=0,k=y.length;D<k;++D){const v=y[D],T=v.start,q=v.count;for(let $=T,C=T+q;$<C;$+=3)A(e.getX($+0)),A(e.getX($+1)),A(e.getX($+2))}}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new ht(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let d=0,m=n.count;d<m;d++)n.setXYZ(d,0,0,0);const s=new P,r=new P,o=new P,a=new P,l=new P,c=new P,u=new P,h=new P;if(e)for(let d=0,m=e.count;d<m;d+=3){const g=e.getX(d+0),_=e.getX(d+1),p=e.getX(d+2);s.fromBufferAttribute(t,g),r.fromBufferAttribute(t,_),o.fromBufferAttribute(t,p),u.subVectors(o,r),h.subVectors(s,r),u.cross(h),a.fromBufferAttribute(n,g),l.fromBufferAttribute(n,_),c.fromBufferAttribute(n,p),a.add(u),l.add(u),c.add(u),n.setXYZ(g,a.x,a.y,a.z),n.setXYZ(_,l.x,l.y,l.z),n.setXYZ(p,c.x,c.y,c.z)}else for(let d=0,m=t.count;d<m;d+=3)s.fromBufferAttribute(t,d+0),r.fromBufferAttribute(t,d+1),o.fromBufferAttribute(t,d+2),u.subVectors(o,r),h.subVectors(s,r),u.cross(h),n.setXYZ(d+0,u.x,u.y,u.z),n.setXYZ(d+1,u.x,u.y,u.z),n.setXYZ(d+2,u.x,u.y,u.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)mt.fromBufferAttribute(e,t),mt.normalize(),e.setXYZ(t,mt.x,mt.y,mt.z)}toNonIndexed(){function e(a,l){const c=a.array,u=a.itemSize,h=a.normalized,d=new c.constructor(l.length*u);let m=0,g=0;for(let _=0,p=l.length;_<p;_++){a.isInterleavedBufferAttribute?m=l[_]*a.data.stride+a.offset:m=l[_]*u;for(let f=0;f<u;f++)d[g++]=c[m++]}return new ht(d,u,h)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new rt,n=this.index.array,s=this.attributes;for(const a in s){const l=s[a],c=e(l,n);t.setAttribute(a,c)}const r=this.morphAttributes;for(const a in r){const l=[],c=r[a];for(let u=0,h=c.length;u<h;u++){const d=c[u],m=e(d,n);l.push(m)}t.morphAttributes[a]=l}t.morphTargetsRelative=this.morphTargetsRelative;const o=this.groups;for(let a=0,l=o.length;a<l;a++){const c=o[a];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){const e={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){const l=this.parameters;for(const c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const n=this.attributes;for(const l in n){const c=n[l];e.data.attributes[l]=c.toJSON(e.data)}const s={};let r=!1;for(const l in this.morphAttributes){const c=this.morphAttributes[l],u=[];for(let h=0,d=c.length;h<d;h++){const m=c[h];u.push(m.toJSON(e.data))}u.length>0&&(s[l]=u,r=!0)}r&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);const o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));const a=this.boundingSphere;return a!==null&&(e.data.boundingSphere={center:a.center.toArray(),radius:a.radius}),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const n=e.index;n!==null&&this.setIndex(n.clone(t));const s=e.attributes;for(const c in s){const u=s[c];this.setAttribute(c,u.clone(t))}const r=e.morphAttributes;for(const c in r){const u=[],h=r[c];for(let d=0,m=h.length;d<m;d++)u.push(h[d].clone(t));this.morphAttributes[c]=u}this.morphTargetsRelative=e.morphTargetsRelative;const o=e.groups;for(let c=0,u=o.length;c<u;c++){const h=o[c];this.addGroup(h.start,h.count,h.materialIndex)}const a=e.boundingBox;a!==null&&(this.boundingBox=a.clone());const l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const Lo=new it,Gn=new ra,ps=new ni,Do=new P,mi=new P,gi=new P,_i=new P,Rr=new P,ms=new P,gs=new He,_s=new He,vs=new He,Uo=new P,Io=new P,No=new P,xs=new P,Ms=new P;class Ye extends _t{constructor(e=new rt,t=new nn){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){const a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}getVertexPosition(e,t){const n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,o=n.morphTargetsRelative;t.fromBufferAttribute(s,e);const a=this.morphTargetInfluences;if(r&&a){ms.set(0,0,0);for(let l=0,c=r.length;l<c;l++){const u=a[l],h=r[l];u!==0&&(Rr.fromBufferAttribute(h,e),o?ms.addScaledVector(Rr,u):ms.addScaledVector(Rr.sub(t),u))}t.add(ms)}return t}raycast(e,t){const n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),ps.copy(n.boundingSphere),ps.applyMatrix4(r),Gn.copy(e.ray).recast(e.near),!(ps.containsPoint(Gn.origin)===!1&&(Gn.intersectSphere(ps,Do)===null||Gn.origin.distanceToSquared(Do)>(e.far-e.near)**2))&&(Lo.copy(r).invert(),Gn.copy(e.ray).applyMatrix4(Lo),!(n.boundingBox!==null&&Gn.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,Gn)))}_computeIntersections(e,t,n){let s;const r=this.geometry,o=this.material,a=r.index,l=r.attributes.position,c=r.attributes.uv,u=r.attributes.uv1,h=r.attributes.normal,d=r.groups,m=r.drawRange;if(a!==null)if(Array.isArray(o))for(let g=0,_=d.length;g<_;g++){const p=d[g],f=o[p.materialIndex],y=Math.max(p.start,m.start),M=Math.min(a.count,Math.min(p.start+p.count,m.start+m.count));for(let S=y,R=M;S<R;S+=3){const w=a.getX(S),A=a.getX(S+1),D=a.getX(S+2);s=ys(this,f,e,n,c,u,h,w,A,D),s&&(s.faceIndex=Math.floor(S/3),s.face.materialIndex=p.materialIndex,t.push(s))}}else{const g=Math.max(0,m.start),_=Math.min(a.count,m.start+m.count);for(let p=g,f=_;p<f;p+=3){const y=a.getX(p),M=a.getX(p+1),S=a.getX(p+2);s=ys(this,o,e,n,c,u,h,y,M,S),s&&(s.faceIndex=Math.floor(p/3),t.push(s))}}else if(l!==void 0)if(Array.isArray(o))for(let g=0,_=d.length;g<_;g++){const p=d[g],f=o[p.materialIndex],y=Math.max(p.start,m.start),M=Math.min(l.count,Math.min(p.start+p.count,m.start+m.count));for(let S=y,R=M;S<R;S+=3){const w=S,A=S+1,D=S+2;s=ys(this,f,e,n,c,u,h,w,A,D),s&&(s.faceIndex=Math.floor(S/3),s.face.materialIndex=p.materialIndex,t.push(s))}}else{const g=Math.max(0,m.start),_=Math.min(l.count,m.start+m.count);for(let p=g,f=_;p<f;p+=3){const y=p,M=p+1,S=p+2;s=ys(this,o,e,n,c,u,h,y,M,S),s&&(s.faceIndex=Math.floor(p/3),t.push(s))}}}}function ih(i,e,t,n,s,r,o,a){let l;if(e.side===Nt?l=n.intersectTriangle(o,r,s,!0,a):l=n.intersectTriangle(s,r,o,e.side===Dn,a),l===null)return null;Ms.copy(a),Ms.applyMatrix4(i.matrixWorld);const c=t.ray.origin.distanceTo(Ms);return c<t.near||c>t.far?null:{distance:c,point:Ms.clone(),object:i}}function ys(i,e,t,n,s,r,o,a,l,c){i.getVertexPosition(a,mi),i.getVertexPosition(l,gi),i.getVertexPosition(c,_i);const u=ih(i,e,t,n,mi,gi,_i,xs);if(u){s&&(gs.fromBufferAttribute(s,a),_s.fromBufferAttribute(s,l),vs.fromBufferAttribute(s,c),u.uv=en.getInterpolation(xs,mi,gi,_i,gs,_s,vs,new He)),r&&(gs.fromBufferAttribute(r,a),_s.fromBufferAttribute(r,l),vs.fromBufferAttribute(r,c),u.uv1=en.getInterpolation(xs,mi,gi,_i,gs,_s,vs,new He)),o&&(Uo.fromBufferAttribute(o,a),Io.fromBufferAttribute(o,l),No.fromBufferAttribute(o,c),u.normal=en.getInterpolation(xs,mi,gi,_i,Uo,Io,No,new P),u.normal.dot(n.direction)>0&&u.normal.multiplyScalar(-1));const h={a,b:l,c,normal:new P,materialIndex:0};en.getNormal(mi,gi,_i,h.normal),u.face=h}return u}class cn extends rt{constructor(e=1,t=1,n=1,s=1,r=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:s,heightSegments:r,depthSegments:o};const a=this;s=Math.floor(s),r=Math.floor(r),o=Math.floor(o);const l=[],c=[],u=[],h=[];let d=0,m=0;g("z","y","x",-1,-1,n,t,e,o,r,0),g("z","y","x",1,-1,n,t,-e,o,r,1),g("x","z","y",1,1,e,n,t,s,o,2),g("x","z","y",1,-1,e,n,-t,s,o,3),g("x","y","z",1,-1,e,t,n,s,r,4),g("x","y","z",-1,-1,e,t,-n,s,r,5),this.setIndex(l),this.setAttribute("position",new Ze(c,3)),this.setAttribute("normal",new Ze(u,3)),this.setAttribute("uv",new Ze(h,2));function g(_,p,f,y,M,S,R,w,A,D,k){const v=S/A,T=R/D,q=S/2,$=R/2,C=w/2,W=A+1,H=D+1;let K=0,V=0;const Y=new P;for(let j=0;j<H;j++){const ie=j*T-$;for(let he=0;he<W;he++){const Ce=he*v-q;Y[_]=Ce*y,Y[p]=ie*M,Y[f]=C,c.push(Y.x,Y.y,Y.z),Y[_]=0,Y[p]=0,Y[f]=w>0?1:-1,u.push(Y.x,Y.y,Y.z),h.push(he/A),h.push(1-j/D),K+=1}}for(let j=0;j<D;j++)for(let ie=0;ie<A;ie++){const he=d+ie+W*j,Ce=d+ie+W*(j+1),z=d+(ie+1)+W*(j+1),J=d+(ie+1)+W*j;l.push(he,Ce,J),l.push(Ce,z,J),V+=6}a.addGroup(m,V,k),m+=V,d+=K}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new cn(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}function Ci(i){const e={};for(const t in i){e[t]={};for(const n in i[t]){const s=i[t][n];s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)?s.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=s.clone():Array.isArray(s)?e[t][n]=s.slice():e[t][n]=s}}return e}function Rt(i){const e={};for(let t=0;t<i.length;t++){const n=Ci(i[t]);for(const s in n)e[s]=n[s]}return e}function sh(i){const e=[];for(let t=0;t<i.length;t++)e.push(i[t].clone());return e}function Bl(i){return i.getRenderTarget()===null?i.outputColorSpace:je.workingColorSpace}const rh={clone:Ci,merge:Rt};var ah=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,oh=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class Un extends Di{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=ah,this.fragmentShader=oh,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={derivatives:!1,fragDepth:!1,drawBuffers:!1,shaderTextureLOD:!1,clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Ci(e.uniforms),this.uniformsGroups=sh(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const s in this.uniforms){const o=this.uniforms[s].value;o&&o.isTexture?t.uniforms[s]={type:"t",value:o.toJSON(e).uuid}:o&&o.isColor?t.uniforms[s]={type:"c",value:o.getHex()}:o&&o.isVector2?t.uniforms[s]={type:"v2",value:o.toArray()}:o&&o.isVector3?t.uniforms[s]={type:"v3",value:o.toArray()}:o&&o.isVector4?t.uniforms[s]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?t.uniforms[s]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?t.uniforms[s]={type:"m4",value:o.toArray()}:t.uniforms[s]={value:o}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const n={};for(const s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}}class zl extends _t{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new it,this.projectionMatrix=new it,this.projectionMatrixInverse=new it,this.coordinateSystem=xn}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const Tn=new P,Fo=new He,Oo=new He;class Gt extends zl{constructor(e=50,t=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=Kr*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(Ds*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Kr*2*Math.atan(Math.tan(Ds*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){Tn.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Tn.x,Tn.y).multiplyScalar(-e/Tn.z),Tn.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Tn.x,Tn.y).multiplyScalar(-e/Tn.z)}getViewSize(e,t){return this.getViewBounds(e,Fo,Oo),t.subVectors(Oo,Fo)}setViewOffset(e,t,n,s,r,o){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(Ds*.5*this.fov)/this.zoom,n=2*t,s=this.aspect*n,r=-.5*s;const o=this.view;if(this.view!==null&&this.view.enabled){const l=o.fullWidth,c=o.fullHeight;r+=o.offsetX*s/l,t-=o.offsetY*n/c,s*=o.width/l,n*=o.height/c}const a=this.filmOffset;a!==0&&(r+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,t,t-n,e,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}const vi=-90,xi=1;class lh extends _t{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;const s=new Gt(vi,xi,e,t);s.layers=this.layers,this.add(s);const r=new Gt(vi,xi,e,t);r.layers=this.layers,this.add(r);const o=new Gt(vi,xi,e,t);o.layers=this.layers,this.add(o);const a=new Gt(vi,xi,e,t);a.layers=this.layers,this.add(a);const l=new Gt(vi,xi,e,t);l.layers=this.layers,this.add(l);const c=new Gt(vi,xi,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[n,s,r,o,a,l]=t;for(const c of t)this.remove(c);if(e===xn)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===Gs)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[r,o,a,l,c,u]=this.children,h=e.getRenderTarget(),d=e.getActiveCubeFace(),m=e.getActiveMipmapLevel(),g=e.xr.enabled;e.xr.enabled=!1;const _=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,e.setRenderTarget(n,0,s),e.render(t,r),e.setRenderTarget(n,1,s),e.render(t,o),e.setRenderTarget(n,2,s),e.render(t,a),e.setRenderTarget(n,3,s),e.render(t,l),e.setRenderTarget(n,4,s),e.render(t,c),n.texture.generateMipmaps=_,e.setRenderTarget(n,5,s),e.render(t,u),e.setRenderTarget(h,d,m),e.xr.enabled=g,n.texture.needsPMREMUpdate=!0}}class Gl extends Pt{constructor(e,t,n,s,r,o,a,l,c,u){e=e!==void 0?e:[],t=t!==void 0?t:Ai,super(e,t,n,s,r,o,a,l,c,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class ch extends Qn{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const n={width:e,height:e,depth:1},s=[n,n,n,n,n,n];this.texture=new Gl(s,t.mapping,t.wrapS,t.wrapT,t.magFilter,t.minFilter,t.format,t.type,t.anisotropy,t.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=t.generateMipmaps!==void 0?t.generateMipmaps:!1,this.texture.minFilter=t.minFilter!==void 0?t.minFilter:Dt}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new cn(5,5,5),r=new Un({name:"CubemapFromEquirect",uniforms:Ci(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Nt,blending:Rn});r.uniforms.tEquirect.value=t;const o=new Ye(s,r),a=t.minFilter;return t.minFilter===$n&&(t.minFilter=Dt),new lh(1,10,this).update(e,o),t.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(e,t,n,s){const r=e.getRenderTarget();for(let o=0;o<6;o++)e.setRenderTarget(this,o),e.clear(t,n,s);e.setRenderTarget(r)}}const Cr=new P,uh=new P,hh=new Ie;class Wn{constructor(e=new P(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,s){return this.normal.set(e,t,n),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){const s=Cr.subVectors(n,t).cross(uh.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){const n=e.delta(Cr),s=this.normal.dot(n);if(s===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const r=-(e.start.dot(this.normal)+this.constant)/s;return r<0||r>1?null:t.copy(e.start).addScaledVector(n,r)}intersectsLine(e){const t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const n=t||hh.getNormalMatrix(e),s=this.coplanarPoint(Cr).applyMatrix4(e),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const Hn=new ni,Ss=new P;class Hl{constructor(e=new Wn,t=new Wn,n=new Wn,s=new Wn,r=new Wn,o=new Wn){this.planes=[e,t,n,s,r,o]}set(e,t,n,s,r,o){const a=this.planes;return a[0].copy(e),a[1].copy(t),a[2].copy(n),a[3].copy(s),a[4].copy(r),a[5].copy(o),this}copy(e){const t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=xn){const n=this.planes,s=e.elements,r=s[0],o=s[1],a=s[2],l=s[3],c=s[4],u=s[5],h=s[6],d=s[7],m=s[8],g=s[9],_=s[10],p=s[11],f=s[12],y=s[13],M=s[14],S=s[15];if(n[0].setComponents(l-r,d-c,p-m,S-f).normalize(),n[1].setComponents(l+r,d+c,p+m,S+f).normalize(),n[2].setComponents(l+o,d+u,p+g,S+y).normalize(),n[3].setComponents(l-o,d-u,p-g,S-y).normalize(),n[4].setComponents(l-a,d-h,p-_,S-M).normalize(),t===xn)n[5].setComponents(l+a,d+h,p+_,S+M).normalize();else if(t===Gs)n[5].setComponents(a,h,_,M).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Hn.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),Hn.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Hn)}intersectsSprite(e){return Hn.center.set(0,0,0),Hn.radius=.7071067811865476,Hn.applyMatrix4(e.matrixWorld),this.intersectsSphere(Hn)}intersectsSphere(e){const t=this.planes,n=e.center,s=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(e){const t=this.planes;for(let n=0;n<6;n++){const s=t[n];if(Ss.x=s.normal.x>0?e.max.x:e.min.x,Ss.y=s.normal.y>0?e.max.y:e.min.y,Ss.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(Ss)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}function kl(){let i=null,e=!1,t=null,n=null;function s(r,o){t(r,o),n=i.requestAnimationFrame(s)}return{start:function(){e!==!0&&t!==null&&(n=i.requestAnimationFrame(s),e=!0)},stop:function(){i.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){i=r}}}function dh(i,e){const t=e.isWebGL2,n=new WeakMap;function s(c,u){const h=c.array,d=c.usage,m=h.byteLength,g=i.createBuffer();i.bindBuffer(u,g),i.bufferData(u,h,d),c.onUploadCallback();let _;if(h instanceof Float32Array)_=i.FLOAT;else if(h instanceof Uint16Array)if(c.isFloat16BufferAttribute)if(t)_=i.HALF_FLOAT;else throw new Error("THREE.WebGLAttributes: Usage of Float16BufferAttribute requires WebGL2.");else _=i.UNSIGNED_SHORT;else if(h instanceof Int16Array)_=i.SHORT;else if(h instanceof Uint32Array)_=i.UNSIGNED_INT;else if(h instanceof Int32Array)_=i.INT;else if(h instanceof Int8Array)_=i.BYTE;else if(h instanceof Uint8Array)_=i.UNSIGNED_BYTE;else if(h instanceof Uint8ClampedArray)_=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+h);return{buffer:g,type:_,bytesPerElement:h.BYTES_PER_ELEMENT,version:c.version,size:m}}function r(c,u,h){const d=u.array,m=u._updateRange,g=u.updateRanges;if(i.bindBuffer(h,c),m.count===-1&&g.length===0&&i.bufferSubData(h,0,d),g.length!==0){for(let _=0,p=g.length;_<p;_++){const f=g[_];t?i.bufferSubData(h,f.start*d.BYTES_PER_ELEMENT,d,f.start,f.count):i.bufferSubData(h,f.start*d.BYTES_PER_ELEMENT,d.subarray(f.start,f.start+f.count))}u.clearUpdateRanges()}m.count!==-1&&(t?i.bufferSubData(h,m.offset*d.BYTES_PER_ELEMENT,d,m.offset,m.count):i.bufferSubData(h,m.offset*d.BYTES_PER_ELEMENT,d.subarray(m.offset,m.offset+m.count)),m.count=-1),u.onUploadCallback()}function o(c){return c.isInterleavedBufferAttribute&&(c=c.data),n.get(c)}function a(c){c.isInterleavedBufferAttribute&&(c=c.data);const u=n.get(c);u&&(i.deleteBuffer(u.buffer),n.delete(c))}function l(c,u){if(c.isGLBufferAttribute){const d=n.get(c);(!d||d.version<c.version)&&n.set(c,{buffer:c.buffer,type:c.type,bytesPerElement:c.elementSize,version:c.version});return}c.isInterleavedBufferAttribute&&(c=c.data);const h=n.get(c);if(h===void 0)n.set(c,s(c,u));else if(h.version<c.version){if(h.size!==c.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");r(h.buffer,c,u),h.version=c.version}}return{get:o,remove:a,update:l}}class ei extends rt{constructor(e=1,t=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:s};const r=e/2,o=t/2,a=Math.floor(n),l=Math.floor(s),c=a+1,u=l+1,h=e/a,d=t/l,m=[],g=[],_=[],p=[];for(let f=0;f<u;f++){const y=f*d-o;for(let M=0;M<c;M++){const S=M*h-r;g.push(S,-y,0),_.push(0,0,1),p.push(M/a),p.push(1-f/l)}}for(let f=0;f<l;f++)for(let y=0;y<a;y++){const M=y+c*f,S=y+c*(f+1),R=y+1+c*(f+1),w=y+1+c*f;m.push(M,S,w),m.push(S,R,w)}this.setIndex(m),this.setAttribute("position",new Ze(g,3)),this.setAttribute("normal",new Ze(_,3)),this.setAttribute("uv",new Ze(p,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new ei(e.width,e.height,e.widthSegments,e.heightSegments)}}var fh=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,ph=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,mh=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,gh=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,_h=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,vh=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,xh=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,Mh=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,yh=`#ifdef USE_BATCHING
	attribute float batchId;
	uniform highp sampler2D batchingTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,Sh=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( batchId );
#endif`,Eh=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,bh=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Th=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,Ah=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,wh=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,Rh=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,Ch=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Ph=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Lh=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Dh=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,Uh=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,Ih=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )
	varying vec3 vColor;
#endif`,Nh=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif`,Fh=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
float luminance( const in vec3 rgb ) {
	const vec3 weights = vec3( 0.2126729, 0.7151522, 0.0721750 );
	return dot( weights, rgb );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,Oh=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,Bh=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,zh=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Gh=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Hh=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,kh=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Vh="gl_FragColor = linearToOutputTexel( gl_FragColor );",Wh=`
const mat3 LINEAR_SRGB_TO_LINEAR_DISPLAY_P3 = mat3(
	vec3( 0.8224621, 0.177538, 0.0 ),
	vec3( 0.0331941, 0.9668058, 0.0 ),
	vec3( 0.0170827, 0.0723974, 0.9105199 )
);
const mat3 LINEAR_DISPLAY_P3_TO_LINEAR_SRGB = mat3(
	vec3( 1.2249401, - 0.2249404, 0.0 ),
	vec3( - 0.0420569, 1.0420571, 0.0 ),
	vec3( - 0.0196376, - 0.0786361, 1.0982735 )
);
vec4 LinearSRGBToLinearDisplayP3( in vec4 value ) {
	return vec4( value.rgb * LINEAR_SRGB_TO_LINEAR_DISPLAY_P3, value.a );
}
vec4 LinearDisplayP3ToLinearSRGB( in vec4 value ) {
	return vec4( value.rgb * LINEAR_DISPLAY_P3_TO_LINEAR_SRGB, value.a );
}
vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}
vec4 LinearToLinear( in vec4 value ) {
	return value;
}
vec4 LinearTosRGB( in vec4 value ) {
	return sRGBTransferOETF( value );
}`,Xh=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,qh=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,Yh=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,$h=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,Kh=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,jh=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Zh=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Jh=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Qh=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,ed=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,td=`#ifdef USE_LIGHTMAP
	vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
	vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
	reflectedLight.indirectDiffuse += lightMapIrradiance;
#endif`,nd=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,id=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,sd=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,rd=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	#if defined ( LEGACY_LIGHTS )
		if ( cutoffDistance > 0.0 && decayExponent > 0.0 ) {
			return pow( saturate( - lightDistance / cutoffDistance + 1.0 ), decayExponent );
		}
		return 1.0;
	#else
		float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
		if ( cutoffDistance > 0.0 ) {
			distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
		}
		return distanceFalloff;
	#endif
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,ad=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,od=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,ld=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,cd=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,ud=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,hd=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,dd=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,fd=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,pd=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,md=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,gd=`#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )
	gl_FragDepthEXT = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,_d=`#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,vd=`#ifdef USE_LOGDEPTHBUF
	#ifdef USE_LOGDEPTHBUF_EXT
		varying float vFragDepth;
		varying float vIsPerspective;
	#else
		uniform float logDepthBufFC;
	#endif
#endif`,xd=`#ifdef USE_LOGDEPTHBUF
	#ifdef USE_LOGDEPTHBUF_EXT
		vFragDepth = 1.0 + gl_Position.w;
		vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
	#else
		if ( isPerspectiveMatrix( projectionMatrix ) ) {
			gl_Position.z = log2( max( EPSILON, gl_Position.w + 1.0 ) ) * logDepthBufFC - 1.0;
			gl_Position.z *= gl_Position.w;
		}
	#endif
#endif`,Md=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );
	
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,yd=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Sd=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,Ed=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,bd=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Td=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Ad=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[MORPHTARGETS_COUNT];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,wd=`#if defined( USE_MORPHCOLORS ) && defined( MORPHTARGETS_TEXTURE )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Rd=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	#ifdef MORPHTARGETS_TEXTURE
		for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
			if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
		}
	#else
		objectNormal += morphNormal0 * morphTargetInfluences[ 0 ];
		objectNormal += morphNormal1 * morphTargetInfluences[ 1 ];
		objectNormal += morphNormal2 * morphTargetInfluences[ 2 ];
		objectNormal += morphNormal3 * morphTargetInfluences[ 3 ];
	#endif
#endif`,Cd=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
	#endif
	#ifdef MORPHTARGETS_TEXTURE
		#ifndef USE_INSTANCING_MORPH
			uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
		#endif
		uniform sampler2DArray morphTargetsTexture;
		uniform ivec2 morphTargetsTextureSize;
		vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
			int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
			int y = texelIndex / morphTargetsTextureSize.x;
			int x = texelIndex - y * morphTargetsTextureSize.x;
			ivec3 morphUV = ivec3( x, y, morphTargetIndex );
			return texelFetch( morphTargetsTexture, morphUV, 0 );
		}
	#else
		#ifndef USE_MORPHNORMALS
			uniform float morphTargetInfluences[ 8 ];
		#else
			uniform float morphTargetInfluences[ 4 ];
		#endif
	#endif
#endif`,Pd=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	#ifdef MORPHTARGETS_TEXTURE
		for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
			if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
		}
	#else
		transformed += morphTarget0 * morphTargetInfluences[ 0 ];
		transformed += morphTarget1 * morphTargetInfluences[ 1 ];
		transformed += morphTarget2 * morphTargetInfluences[ 2 ];
		transformed += morphTarget3 * morphTargetInfluences[ 3 ];
		#ifndef USE_MORPHNORMALS
			transformed += morphTarget4 * morphTargetInfluences[ 4 ];
			transformed += morphTarget5 * morphTargetInfluences[ 5 ];
			transformed += morphTarget6 * morphTargetInfluences[ 6 ];
			transformed += morphTarget7 * morphTargetInfluences[ 7 ];
		#endif
	#endif
#endif`,Ld=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,Dd=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,Ud=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Id=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Nd=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,Fd=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,Od=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Bd=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,zd=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Gd=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Hd=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,kd=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;
const vec3 PackFactors = vec3( 256. * 256. * 256., 256. * 256., 256. );
const vec4 UnpackFactors = UnpackDownscale / vec4( PackFactors, 1. );
const float ShiftRight8 = 1. / 256.;
vec4 packDepthToRGBA( const in float v ) {
	vec4 r = vec4( fract( v * PackFactors ), v );
	r.yzw -= r.xyz * ShiftRight8;	return r * PackUpscale;
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors );
}
vec2 packDepthToRG( in highp float v ) {
	return packDepthToRGBA( v ).yx;
}
float unpackRGToDepth( const in highp vec2 v ) {
	return unpackRGBAToDepth( vec4( v.xy, 0.0, 0.0 ) );
}
vec4 pack2HalfToRGBA( vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,Vd=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Wd=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Xd=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,qd=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Yd=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,$d=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Kd=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return shadow;
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
		vec3 lightToPosition = shadowCoord.xyz;
		float dp = ( length( lightToPosition ) - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );		dp += shadowBias;
		vec3 bd3D = normalize( lightToPosition );
		#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
			vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
			return (
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
			) * ( 1.0 / 9.0 );
		#else
			return texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
		#endif
	}
#endif`,jd=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,Zd=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,Jd=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,Qd=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,ef=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,tf=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,nf=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,sf=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,rf=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,af=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,of=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 OptimizedCineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	float startCompression = 0.8 - 0.04;
	float desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min(color.r, min(color.g, color.b));
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max(color.r, max(color.g, color.b));
	if (peak < startCompression) return color;
	float d = 1. - startCompression;
	float newPeak = 1. - d * d / (peak + d - startCompression);
	color *= newPeak / peak;
	float g = 1. - 1. / (desaturation * (peak - newPeak) + 1.);
	return mix(color, vec3(1, 1, 1), g);
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,lf=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,cf=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
		vec3 refractedRayExit = position + transmissionRay;
		vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
		vec2 refractionCoords = ndcPos.xy / ndcPos.w;
		refractionCoords += 1.0;
		refractionCoords /= 2.0;
		vec4 transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
		vec3 transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,uf=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,hf=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,df=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,ff=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const pf=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,mf=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,gf=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,_f=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,vf=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,xf=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Mf=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,yf=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#endif
}`,Sf=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,Ef=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,bf=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Tf=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Af=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,wf=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Rf=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,Cf=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Pf=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Lf=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Df=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,Uf=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,If=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,Nf=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,Ff=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Of=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Bf=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,zf=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Gf=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Hf=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,kf=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,Vf=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Wf=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Xf=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,qf=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );
	vec2 scale;
	scale.x = length( vec3( modelMatrix[ 0 ].x, modelMatrix[ 0 ].y, modelMatrix[ 0 ].z ) );
	scale.y = length( vec3( modelMatrix[ 1 ].x, modelMatrix[ 1 ].y, modelMatrix[ 1 ].z ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Yf=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Ue={alphahash_fragment:fh,alphahash_pars_fragment:ph,alphamap_fragment:mh,alphamap_pars_fragment:gh,alphatest_fragment:_h,alphatest_pars_fragment:vh,aomap_fragment:xh,aomap_pars_fragment:Mh,batching_pars_vertex:yh,batching_vertex:Sh,begin_vertex:Eh,beginnormal_vertex:bh,bsdfs:Th,iridescence_fragment:Ah,bumpmap_pars_fragment:wh,clipping_planes_fragment:Rh,clipping_planes_pars_fragment:Ch,clipping_planes_pars_vertex:Ph,clipping_planes_vertex:Lh,color_fragment:Dh,color_pars_fragment:Uh,color_pars_vertex:Ih,color_vertex:Nh,common:Fh,cube_uv_reflection_fragment:Oh,defaultnormal_vertex:Bh,displacementmap_pars_vertex:zh,displacementmap_vertex:Gh,emissivemap_fragment:Hh,emissivemap_pars_fragment:kh,colorspace_fragment:Vh,colorspace_pars_fragment:Wh,envmap_fragment:Xh,envmap_common_pars_fragment:qh,envmap_pars_fragment:Yh,envmap_pars_vertex:$h,envmap_physical_pars_fragment:ad,envmap_vertex:Kh,fog_vertex:jh,fog_pars_vertex:Zh,fog_fragment:Jh,fog_pars_fragment:Qh,gradientmap_pars_fragment:ed,lightmap_fragment:td,lightmap_pars_fragment:nd,lights_lambert_fragment:id,lights_lambert_pars_fragment:sd,lights_pars_begin:rd,lights_toon_fragment:od,lights_toon_pars_fragment:ld,lights_phong_fragment:cd,lights_phong_pars_fragment:ud,lights_physical_fragment:hd,lights_physical_pars_fragment:dd,lights_fragment_begin:fd,lights_fragment_maps:pd,lights_fragment_end:md,logdepthbuf_fragment:gd,logdepthbuf_pars_fragment:_d,logdepthbuf_pars_vertex:vd,logdepthbuf_vertex:xd,map_fragment:Md,map_pars_fragment:yd,map_particle_fragment:Sd,map_particle_pars_fragment:Ed,metalnessmap_fragment:bd,metalnessmap_pars_fragment:Td,morphinstance_vertex:Ad,morphcolor_vertex:wd,morphnormal_vertex:Rd,morphtarget_pars_vertex:Cd,morphtarget_vertex:Pd,normal_fragment_begin:Ld,normal_fragment_maps:Dd,normal_pars_fragment:Ud,normal_pars_vertex:Id,normal_vertex:Nd,normalmap_pars_fragment:Fd,clearcoat_normal_fragment_begin:Od,clearcoat_normal_fragment_maps:Bd,clearcoat_pars_fragment:zd,iridescence_pars_fragment:Gd,opaque_fragment:Hd,packing:kd,premultiplied_alpha_fragment:Vd,project_vertex:Wd,dithering_fragment:Xd,dithering_pars_fragment:qd,roughnessmap_fragment:Yd,roughnessmap_pars_fragment:$d,shadowmap_pars_fragment:Kd,shadowmap_pars_vertex:jd,shadowmap_vertex:Zd,shadowmask_pars_fragment:Jd,skinbase_vertex:Qd,skinning_pars_vertex:ef,skinning_vertex:tf,skinnormal_vertex:nf,specularmap_fragment:sf,specularmap_pars_fragment:rf,tonemapping_fragment:af,tonemapping_pars_fragment:of,transmission_fragment:lf,transmission_pars_fragment:cf,uv_pars_fragment:uf,uv_pars_vertex:hf,uv_vertex:df,worldpos_vertex:ff,background_vert:pf,background_frag:mf,backgroundCube_vert:gf,backgroundCube_frag:_f,cube_vert:vf,cube_frag:xf,depth_vert:Mf,depth_frag:yf,distanceRGBA_vert:Sf,distanceRGBA_frag:Ef,equirect_vert:bf,equirect_frag:Tf,linedashed_vert:Af,linedashed_frag:wf,meshbasic_vert:Rf,meshbasic_frag:Cf,meshlambert_vert:Pf,meshlambert_frag:Lf,meshmatcap_vert:Df,meshmatcap_frag:Uf,meshnormal_vert:If,meshnormal_frag:Nf,meshphong_vert:Ff,meshphong_frag:Of,meshphysical_vert:Bf,meshphysical_frag:zf,meshtoon_vert:Gf,meshtoon_frag:Hf,points_vert:kf,points_frag:Vf,shadow_vert:Wf,shadow_frag:Xf,sprite_vert:qf,sprite_frag:Yf},ne={common:{diffuse:{value:new Ve(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Ie},alphaMap:{value:null},alphaMapTransform:{value:new Ie},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Ie}},envmap:{envMap:{value:null},envMapRotation:{value:new Ie},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Ie}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Ie}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Ie},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Ie},normalScale:{value:new He(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Ie},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Ie}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Ie}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Ie}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Ve(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Ve(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Ie},alphaTest:{value:0},uvTransform:{value:new Ie}},sprite:{diffuse:{value:new Ve(16777215)},opacity:{value:1},center:{value:new He(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Ie},alphaMap:{value:null},alphaMapTransform:{value:new Ie},alphaTest:{value:0}}},an={basic:{uniforms:Rt([ne.common,ne.specularmap,ne.envmap,ne.aomap,ne.lightmap,ne.fog]),vertexShader:Ue.meshbasic_vert,fragmentShader:Ue.meshbasic_frag},lambert:{uniforms:Rt([ne.common,ne.specularmap,ne.envmap,ne.aomap,ne.lightmap,ne.emissivemap,ne.bumpmap,ne.normalmap,ne.displacementmap,ne.fog,ne.lights,{emissive:{value:new Ve(0)}}]),vertexShader:Ue.meshlambert_vert,fragmentShader:Ue.meshlambert_frag},phong:{uniforms:Rt([ne.common,ne.specularmap,ne.envmap,ne.aomap,ne.lightmap,ne.emissivemap,ne.bumpmap,ne.normalmap,ne.displacementmap,ne.fog,ne.lights,{emissive:{value:new Ve(0)},specular:{value:new Ve(1118481)},shininess:{value:30}}]),vertexShader:Ue.meshphong_vert,fragmentShader:Ue.meshphong_frag},standard:{uniforms:Rt([ne.common,ne.envmap,ne.aomap,ne.lightmap,ne.emissivemap,ne.bumpmap,ne.normalmap,ne.displacementmap,ne.roughnessmap,ne.metalnessmap,ne.fog,ne.lights,{emissive:{value:new Ve(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Ue.meshphysical_vert,fragmentShader:Ue.meshphysical_frag},toon:{uniforms:Rt([ne.common,ne.aomap,ne.lightmap,ne.emissivemap,ne.bumpmap,ne.normalmap,ne.displacementmap,ne.gradientmap,ne.fog,ne.lights,{emissive:{value:new Ve(0)}}]),vertexShader:Ue.meshtoon_vert,fragmentShader:Ue.meshtoon_frag},matcap:{uniforms:Rt([ne.common,ne.bumpmap,ne.normalmap,ne.displacementmap,ne.fog,{matcap:{value:null}}]),vertexShader:Ue.meshmatcap_vert,fragmentShader:Ue.meshmatcap_frag},points:{uniforms:Rt([ne.points,ne.fog]),vertexShader:Ue.points_vert,fragmentShader:Ue.points_frag},dashed:{uniforms:Rt([ne.common,ne.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Ue.linedashed_vert,fragmentShader:Ue.linedashed_frag},depth:{uniforms:Rt([ne.common,ne.displacementmap]),vertexShader:Ue.depth_vert,fragmentShader:Ue.depth_frag},normal:{uniforms:Rt([ne.common,ne.bumpmap,ne.normalmap,ne.displacementmap,{opacity:{value:1}}]),vertexShader:Ue.meshnormal_vert,fragmentShader:Ue.meshnormal_frag},sprite:{uniforms:Rt([ne.sprite,ne.fog]),vertexShader:Ue.sprite_vert,fragmentShader:Ue.sprite_frag},background:{uniforms:{uvTransform:{value:new Ie},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Ue.background_vert,fragmentShader:Ue.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Ie}},vertexShader:Ue.backgroundCube_vert,fragmentShader:Ue.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Ue.cube_vert,fragmentShader:Ue.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Ue.equirect_vert,fragmentShader:Ue.equirect_frag},distanceRGBA:{uniforms:Rt([ne.common,ne.displacementmap,{referencePosition:{value:new P},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Ue.distanceRGBA_vert,fragmentShader:Ue.distanceRGBA_frag},shadow:{uniforms:Rt([ne.lights,ne.fog,{color:{value:new Ve(0)},opacity:{value:1}}]),vertexShader:Ue.shadow_vert,fragmentShader:Ue.shadow_frag}};an.physical={uniforms:Rt([an.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Ie},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Ie},clearcoatNormalScale:{value:new He(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Ie},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Ie},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Ie},sheen:{value:0},sheenColor:{value:new Ve(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Ie},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Ie},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Ie},transmissionSamplerSize:{value:new He},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Ie},attenuationDistance:{value:0},attenuationColor:{value:new Ve(0)},specularColor:{value:new Ve(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Ie},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Ie},anisotropyVector:{value:new He},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Ie}}]),vertexShader:Ue.meshphysical_vert,fragmentShader:Ue.meshphysical_frag};const Es={r:0,b:0,g:0},kn=new ln,$f=new it;function Kf(i,e,t,n,s,r,o){const a=new Ve(0);let l=r===!0?0:1,c,u,h=null,d=0,m=null;function g(p,f){let y=!1,M=f.isScene===!0?f.background:null;M&&M.isTexture&&(M=(f.backgroundBlurriness>0?t:e).get(M)),M===null?_(a,l):M&&M.isColor&&(_(M,1),y=!0);const S=i.xr.getEnvironmentBlendMode();S==="additive"?n.buffers.color.setClear(0,0,0,1,o):S==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,o),(i.autoClear||y)&&i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil),M&&(M.isCubeTexture||M.mapping===Ws)?(u===void 0&&(u=new Ye(new cn(1,1,1),new Un({name:"BackgroundCubeMaterial",uniforms:Ci(an.backgroundCube.uniforms),vertexShader:an.backgroundCube.vertexShader,fragmentShader:an.backgroundCube.fragmentShader,side:Nt,depthTest:!1,depthWrite:!1,fog:!1})),u.geometry.deleteAttribute("normal"),u.geometry.deleteAttribute("uv"),u.onBeforeRender=function(R,w,A){this.matrixWorld.copyPosition(A.matrixWorld)},Object.defineProperty(u.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),s.update(u)),kn.copy(f.backgroundRotation),kn.x*=-1,kn.y*=-1,kn.z*=-1,M.isCubeTexture&&M.isRenderTargetTexture===!1&&(kn.y*=-1,kn.z*=-1),u.material.uniforms.envMap.value=M,u.material.uniforms.flipEnvMap.value=M.isCubeTexture&&M.isRenderTargetTexture===!1?-1:1,u.material.uniforms.backgroundBlurriness.value=f.backgroundBlurriness,u.material.uniforms.backgroundIntensity.value=f.backgroundIntensity,u.material.uniforms.backgroundRotation.value.setFromMatrix4($f.makeRotationFromEuler(kn)),u.material.toneMapped=je.getTransfer(M.colorSpace)!==et,(h!==M||d!==M.version||m!==i.toneMapping)&&(u.material.needsUpdate=!0,h=M,d=M.version,m=i.toneMapping),u.layers.enableAll(),p.unshift(u,u.geometry,u.material,0,0,null)):M&&M.isTexture&&(c===void 0&&(c=new Ye(new ei(2,2),new Un({name:"BackgroundMaterial",uniforms:Ci(an.background.uniforms),vertexShader:an.background.vertexShader,fragmentShader:an.background.fragmentShader,side:Dn,depthTest:!1,depthWrite:!1,fog:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),s.update(c)),c.material.uniforms.t2D.value=M,c.material.uniforms.backgroundIntensity.value=f.backgroundIntensity,c.material.toneMapped=je.getTransfer(M.colorSpace)!==et,M.matrixAutoUpdate===!0&&M.updateMatrix(),c.material.uniforms.uvTransform.value.copy(M.matrix),(h!==M||d!==M.version||m!==i.toneMapping)&&(c.material.needsUpdate=!0,h=M,d=M.version,m=i.toneMapping),c.layers.enableAll(),p.unshift(c,c.geometry,c.material,0,0,null))}function _(p,f){p.getRGB(Es,Bl(i)),n.buffers.color.setClear(Es.r,Es.g,Es.b,f,o)}return{getClearColor:function(){return a},setClearColor:function(p,f=1){a.set(p),l=f,_(a,l)},getClearAlpha:function(){return l},setClearAlpha:function(p){l=p,_(a,l)},render:g}}function jf(i,e,t,n){const s=i.getParameter(i.MAX_VERTEX_ATTRIBS),r=n.isWebGL2?null:e.get("OES_vertex_array_object"),o=n.isWebGL2||r!==null,a={},l=p(null);let c=l,u=!1;function h(C,W,H,K,V){let Y=!1;if(o){const j=_(K,H,W);c!==j&&(c=j,m(c.object)),Y=f(C,K,H,V),Y&&y(C,K,H,V)}else{const j=W.wireframe===!0;(c.geometry!==K.id||c.program!==H.id||c.wireframe!==j)&&(c.geometry=K.id,c.program=H.id,c.wireframe=j,Y=!0)}V!==null&&t.update(V,i.ELEMENT_ARRAY_BUFFER),(Y||u)&&(u=!1,D(C,W,H,K),V!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,t.get(V).buffer))}function d(){return n.isWebGL2?i.createVertexArray():r.createVertexArrayOES()}function m(C){return n.isWebGL2?i.bindVertexArray(C):r.bindVertexArrayOES(C)}function g(C){return n.isWebGL2?i.deleteVertexArray(C):r.deleteVertexArrayOES(C)}function _(C,W,H){const K=H.wireframe===!0;let V=a[C.id];V===void 0&&(V={},a[C.id]=V);let Y=V[W.id];Y===void 0&&(Y={},V[W.id]=Y);let j=Y[K];return j===void 0&&(j=p(d()),Y[K]=j),j}function p(C){const W=[],H=[],K=[];for(let V=0;V<s;V++)W[V]=0,H[V]=0,K[V]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:W,enabledAttributes:H,attributeDivisors:K,object:C,attributes:{},index:null}}function f(C,W,H,K){const V=c.attributes,Y=W.attributes;let j=0;const ie=H.getAttributes();for(const he in ie)if(ie[he].location>=0){const z=V[he];let J=Y[he];if(J===void 0&&(he==="instanceMatrix"&&C.instanceMatrix&&(J=C.instanceMatrix),he==="instanceColor"&&C.instanceColor&&(J=C.instanceColor)),z===void 0||z.attribute!==J||J&&z.data!==J.data)return!0;j++}return c.attributesNum!==j||c.index!==K}function y(C,W,H,K){const V={},Y=W.attributes;let j=0;const ie=H.getAttributes();for(const he in ie)if(ie[he].location>=0){let z=Y[he];z===void 0&&(he==="instanceMatrix"&&C.instanceMatrix&&(z=C.instanceMatrix),he==="instanceColor"&&C.instanceColor&&(z=C.instanceColor));const J={};J.attribute=z,z&&z.data&&(J.data=z.data),V[he]=J,j++}c.attributes=V,c.attributesNum=j,c.index=K}function M(){const C=c.newAttributes;for(let W=0,H=C.length;W<H;W++)C[W]=0}function S(C){R(C,0)}function R(C,W){const H=c.newAttributes,K=c.enabledAttributes,V=c.attributeDivisors;H[C]=1,K[C]===0&&(i.enableVertexAttribArray(C),K[C]=1),V[C]!==W&&((n.isWebGL2?i:e.get("ANGLE_instanced_arrays"))[n.isWebGL2?"vertexAttribDivisor":"vertexAttribDivisorANGLE"](C,W),V[C]=W)}function w(){const C=c.newAttributes,W=c.enabledAttributes;for(let H=0,K=W.length;H<K;H++)W[H]!==C[H]&&(i.disableVertexAttribArray(H),W[H]=0)}function A(C,W,H,K,V,Y,j){j===!0?i.vertexAttribIPointer(C,W,H,V,Y):i.vertexAttribPointer(C,W,H,K,V,Y)}function D(C,W,H,K){if(n.isWebGL2===!1&&(C.isInstancedMesh||K.isInstancedBufferGeometry)&&e.get("ANGLE_instanced_arrays")===null)return;M();const V=K.attributes,Y=H.getAttributes(),j=W.defaultAttributeValues;for(const ie in Y){const he=Y[ie];if(he.location>=0){let Ce=V[ie];if(Ce===void 0&&(ie==="instanceMatrix"&&C.instanceMatrix&&(Ce=C.instanceMatrix),ie==="instanceColor"&&C.instanceColor&&(Ce=C.instanceColor)),Ce!==void 0){const z=Ce.normalized,J=Ce.itemSize,ue=t.get(Ce);if(ue===void 0)continue;const Ee=ue.buffer,ge=ue.type,de=ue.bytesPerElement,$e=n.isWebGL2===!0&&(ge===i.INT||ge===i.UNSIGNED_INT||Ce.gpuType===yl);if(Ce.isInterleavedBufferAttribute){const be=Ce.data,I=be.stride,vt=Ce.offset;if(be.isInstancedInterleavedBuffer){for(let ve=0;ve<he.locationSize;ve++)R(he.location+ve,be.meshPerAttribute);C.isInstancedMesh!==!0&&K._maxInstanceCount===void 0&&(K._maxInstanceCount=be.meshPerAttribute*be.count)}else for(let ve=0;ve<he.locationSize;ve++)S(he.location+ve);i.bindBuffer(i.ARRAY_BUFFER,Ee);for(let ve=0;ve<he.locationSize;ve++)A(he.location+ve,J/he.locationSize,ge,z,I*de,(vt+J/he.locationSize*ve)*de,$e)}else{if(Ce.isInstancedBufferAttribute){for(let be=0;be<he.locationSize;be++)R(he.location+be,Ce.meshPerAttribute);C.isInstancedMesh!==!0&&K._maxInstanceCount===void 0&&(K._maxInstanceCount=Ce.meshPerAttribute*Ce.count)}else for(let be=0;be<he.locationSize;be++)S(he.location+be);i.bindBuffer(i.ARRAY_BUFFER,Ee);for(let be=0;be<he.locationSize;be++)A(he.location+be,J/he.locationSize,ge,z,J*de,J/he.locationSize*be*de,$e)}}else if(j!==void 0){const z=j[ie];if(z!==void 0)switch(z.length){case 2:i.vertexAttrib2fv(he.location,z);break;case 3:i.vertexAttrib3fv(he.location,z);break;case 4:i.vertexAttrib4fv(he.location,z);break;default:i.vertexAttrib1fv(he.location,z)}}}}w()}function k(){q();for(const C in a){const W=a[C];for(const H in W){const K=W[H];for(const V in K)g(K[V].object),delete K[V];delete W[H]}delete a[C]}}function v(C){if(a[C.id]===void 0)return;const W=a[C.id];for(const H in W){const K=W[H];for(const V in K)g(K[V].object),delete K[V];delete W[H]}delete a[C.id]}function T(C){for(const W in a){const H=a[W];if(H[C.id]===void 0)continue;const K=H[C.id];for(const V in K)g(K[V].object),delete K[V];delete H[C.id]}}function q(){$(),u=!0,c!==l&&(c=l,m(c.object))}function $(){l.geometry=null,l.program=null,l.wireframe=!1}return{setup:h,reset:q,resetDefaultState:$,dispose:k,releaseStatesOfGeometry:v,releaseStatesOfProgram:T,initAttributes:M,enableAttribute:S,disableUnusedAttributes:w}}function Zf(i,e,t,n){const s=n.isWebGL2;let r;function o(u){r=u}function a(u,h){i.drawArrays(r,u,h),t.update(h,r,1)}function l(u,h,d){if(d===0)return;let m,g;if(s)m=i,g="drawArraysInstanced";else if(m=e.get("ANGLE_instanced_arrays"),g="drawArraysInstancedANGLE",m===null){console.error("THREE.WebGLBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.");return}m[g](r,u,h,d),t.update(h,r,d)}function c(u,h,d){if(d===0)return;const m=e.get("WEBGL_multi_draw");if(m===null)for(let g=0;g<d;g++)this.render(u[g],h[g]);else{m.multiDrawArraysWEBGL(r,u,0,h,0,d);let g=0;for(let _=0;_<d;_++)g+=h[_];t.update(g,r,1)}}this.setMode=o,this.render=a,this.renderInstances=l,this.renderMultiDraw=c}function Jf(i,e,t){let n;function s(){if(n!==void 0)return n;if(e.has("EXT_texture_filter_anisotropic")===!0){const A=e.get("EXT_texture_filter_anisotropic");n=i.getParameter(A.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else n=0;return n}function r(A){if(A==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";A="mediump"}return A==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}const o=typeof WebGL2RenderingContext<"u"&&i.constructor.name==="WebGL2RenderingContext";let a=t.precision!==void 0?t.precision:"highp";const l=r(a);l!==a&&(console.warn("THREE.WebGLRenderer:",a,"not supported, using",l,"instead."),a=l);const c=o||e.has("WEBGL_draw_buffers"),u=t.logarithmicDepthBuffer===!0,h=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),d=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),m=i.getParameter(i.MAX_TEXTURE_SIZE),g=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),_=i.getParameter(i.MAX_VERTEX_ATTRIBS),p=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),f=i.getParameter(i.MAX_VARYING_VECTORS),y=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),M=d>0,S=o||e.has("OES_texture_float"),R=M&&S,w=o?i.getParameter(i.MAX_SAMPLES):0;return{isWebGL2:o,drawBuffers:c,getMaxAnisotropy:s,getMaxPrecision:r,precision:a,logarithmicDepthBuffer:u,maxTextures:h,maxVertexTextures:d,maxTextureSize:m,maxCubemapSize:g,maxAttributes:_,maxVertexUniforms:p,maxVaryings:f,maxFragmentUniforms:y,vertexTextures:M,floatFragmentTextures:S,floatVertexTextures:R,maxSamples:w}}function Qf(i){const e=this;let t=null,n=0,s=!1,r=!1;const o=new Wn,a=new Ie,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(h,d){const m=h.length!==0||d||n!==0||s;return s=d,n=h.length,m},this.beginShadows=function(){r=!0,u(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(h,d){t=u(h,d,0)},this.setState=function(h,d,m){const g=h.clippingPlanes,_=h.clipIntersection,p=h.clipShadows,f=i.get(h);if(!s||g===null||g.length===0||r&&!p)r?u(null):c();else{const y=r?0:n,M=y*4;let S=f.clippingState||null;l.value=S,S=u(g,d,M,m);for(let R=0;R!==M;++R)S[R]=t[R];f.clippingState=S,this.numIntersection=_?this.numPlanes:0,this.numPlanes+=y}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function u(h,d,m,g){const _=h!==null?h.length:0;let p=null;if(_!==0){if(p=l.value,g!==!0||p===null){const f=m+_*4,y=d.matrixWorldInverse;a.getNormalMatrix(y),(p===null||p.length<f)&&(p=new Float32Array(f));for(let M=0,S=m;M!==_;++M,S+=4)o.copy(h[M]).applyMatrix4(y,a),o.normal.toArray(p,S),p[S+3]=o.constant}l.value=p,l.needsUpdate=!0}return e.numPlanes=_,e.numIntersection=0,p}}function ep(i){let e=new WeakMap;function t(o,a){return a===Wr?o.mapping=Ai:a===Xr&&(o.mapping=wi),o}function n(o){if(o&&o.isTexture){const a=o.mapping;if(a===Wr||a===Xr)if(e.has(o)){const l=e.get(o).texture;return t(l,o.mapping)}else{const l=o.image;if(l&&l.height>0){const c=new ch(l.height);return c.fromEquirectangularTexture(i,o),e.set(o,c),o.addEventListener("dispose",s),t(c.texture,o.mapping)}else return null}}return o}function s(o){const a=o.target;a.removeEventListener("dispose",s);const l=e.get(a);l!==void 0&&(e.delete(a),l.dispose())}function r(){e=new WeakMap}return{get:n,dispose:r}}class tp extends zl{constructor(e=-1,t=1,n=1,s=-1,r=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=s,this.near=r,this.far=o,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,s,r,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2;let r=n-e,o=n+e,a=s+t,l=s-t;if(this.view!==null&&this.view.enabled){const c=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,o=r+c*this.view.width,a-=u*this.view.offsetY,l=a-u*this.view.height}this.projectionMatrix.makeOrthographic(r,o,a,l,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}const Si=4,Bo=[.125,.215,.35,.446,.526,.582],Yn=20,Pr=new tp,zo=new Ve;let Lr=null,Dr=0,Ur=0;const Xn=(1+Math.sqrt(5))/2,Mi=1/Xn,Go=[new P(1,1,1),new P(-1,1,1),new P(1,1,-1),new P(-1,1,-1),new P(0,Xn,Mi),new P(0,Xn,-Mi),new P(Mi,0,Xn),new P(-Mi,0,Xn),new P(Xn,Mi,0),new P(-Xn,Mi,0)];class Ho{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,n=.1,s=100){Lr=this._renderer.getRenderTarget(),Dr=this._renderer.getActiveCubeFace(),Ur=this._renderer.getActiveMipmapLevel(),this._setSize(256);const r=this._allocateTargets();return r.depthBuffer=!0,this._sceneToCubeUV(e,n,s,r),t>0&&this._blur(r,0,0,t),this._applyPMREM(r),this._cleanup(r),r}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Wo(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Vo(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(Lr,Dr,Ur),e.scissorTest=!1,bs(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===Ai||e.mapping===wi?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Lr=this._renderer.getRenderTarget(),Dr=this._renderer.getActiveCubeFace(),Ur=this._renderer.getActiveMipmapLevel();const n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:Dt,minFilter:Dt,generateMipmaps:!1,type:qi,format:Qt,colorSpace:In,depthBuffer:!1},s=ko(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=ko(e,t,n);const{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=np(r)),this._blurMaterial=ip(r,e,t)}return s}_compileMaterial(e){const t=new Ye(this._lodPlanes[0],e);this._renderer.compile(t,Pr)}_sceneToCubeUV(e,t,n,s){const a=new Gt(90,1,t,n),l=[1,-1,1,1,1,1],c=[1,1,1,-1,-1,-1],u=this._renderer,h=u.autoClear,d=u.toneMapping;u.getClearColor(zo),u.toneMapping=Cn,u.autoClear=!1;const m=new nn({name:"PMREM.Background",side:Nt,depthWrite:!1,depthTest:!1}),g=new Ye(new cn,m);let _=!1;const p=e.background;p?p.isColor&&(m.color.copy(p),e.background=null,_=!0):(m.color.copy(zo),_=!0);for(let f=0;f<6;f++){const y=f%3;y===0?(a.up.set(0,l[f],0),a.lookAt(c[f],0,0)):y===1?(a.up.set(0,0,l[f]),a.lookAt(0,c[f],0)):(a.up.set(0,l[f],0),a.lookAt(0,0,c[f]));const M=this._cubeSize;bs(s,y*M,f>2?M:0,M,M),u.setRenderTarget(s),_&&u.render(g,a),u.render(e,a)}g.geometry.dispose(),g.material.dispose(),u.toneMapping=d,u.autoClear=h,e.background=p}_textureToCubeUV(e,t){const n=this._renderer,s=e.mapping===Ai||e.mapping===wi;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=Wo()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Vo());const r=s?this._cubemapMaterial:this._equirectMaterial,o=new Ye(this._lodPlanes[0],r),a=r.uniforms;a.envMap.value=e;const l=this._cubeSize;bs(t,0,0,3*l,2*l),n.setRenderTarget(t),n.render(o,Pr)}_applyPMREM(e){const t=this._renderer,n=t.autoClear;t.autoClear=!1;for(let s=1;s<this._lodPlanes.length;s++){const r=Math.sqrt(this._sigmas[s]*this._sigmas[s]-this._sigmas[s-1]*this._sigmas[s-1]),o=Go[(s-1)%Go.length];this._blur(e,s-1,s,r,o)}t.autoClear=n}_blur(e,t,n,s,r){const o=this._pingPongRenderTarget;this._halfBlur(e,o,t,n,s,"latitudinal",r),this._halfBlur(o,e,n,n,s,"longitudinal",r)}_halfBlur(e,t,n,s,r,o,a){const l=this._renderer,c=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const u=3,h=new Ye(this._lodPlanes[s],c),d=c.uniforms,m=this._sizeLods[n]-1,g=isFinite(r)?Math.PI/(2*m):2*Math.PI/(2*Yn-1),_=r/g,p=isFinite(r)?1+Math.floor(u*_):Yn;p>Yn&&console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${p} samples when the maximum is set to ${Yn}`);const f=[];let y=0;for(let A=0;A<Yn;++A){const D=A/_,k=Math.exp(-D*D/2);f.push(k),A===0?y+=k:A<p&&(y+=2*k)}for(let A=0;A<f.length;A++)f[A]=f[A]/y;d.envMap.value=e.texture,d.samples.value=p,d.weights.value=f,d.latitudinal.value=o==="latitudinal",a&&(d.poleAxis.value=a);const{_lodMax:M}=this;d.dTheta.value=g,d.mipInt.value=M-n;const S=this._sizeLods[s],R=3*S*(s>M-Si?s-M+Si:0),w=4*(this._cubeSize-S);bs(t,R,w,3*S,2*S),l.setRenderTarget(t),l.render(h,Pr)}}function np(i){const e=[],t=[],n=[];let s=i;const r=i-Si+1+Bo.length;for(let o=0;o<r;o++){const a=Math.pow(2,s);t.push(a);let l=1/a;o>i-Si?l=Bo[o-i+Si-1]:o===0&&(l=0),n.push(l);const c=1/(a-2),u=-c,h=1+c,d=[u,u,h,u,h,h,u,u,h,h,u,h],m=6,g=6,_=3,p=2,f=1,y=new Float32Array(_*g*m),M=new Float32Array(p*g*m),S=new Float32Array(f*g*m);for(let w=0;w<m;w++){const A=w%3*2/3-1,D=w>2?0:-1,k=[A,D,0,A+2/3,D,0,A+2/3,D+1,0,A,D,0,A+2/3,D+1,0,A,D+1,0];y.set(k,_*g*w),M.set(d,p*g*w);const v=[w,w,w,w,w,w];S.set(v,f*g*w)}const R=new rt;R.setAttribute("position",new ht(y,_)),R.setAttribute("uv",new ht(M,p)),R.setAttribute("faceIndex",new ht(S,f)),e.push(R),s>Si&&s--}return{lodPlanes:e,sizeLods:t,sigmas:n}}function ko(i,e,t){const n=new Qn(i,e,t);return n.texture.mapping=Ws,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function bs(i,e,t,n,s){i.viewport.set(e,t,n,s),i.scissor.set(e,t,n,s)}function ip(i,e,t){const n=new Float32Array(Yn),s=new P(0,1,0);return new Un({name:"SphericalGaussianBlur",defines:{n:Yn,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:aa(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:Rn,depthTest:!1,depthWrite:!1})}function Vo(){return new Un({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:aa(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:Rn,depthTest:!1,depthWrite:!1})}function Wo(){return new Un({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:aa(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Rn,depthTest:!1,depthWrite:!1})}function aa(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function sp(i){let e=new WeakMap,t=null;function n(a){if(a&&a.isTexture){const l=a.mapping,c=l===Wr||l===Xr,u=l===Ai||l===wi;if(c||u)if(a.isRenderTargetTexture&&a.needsPMREMUpdate===!0){a.needsPMREMUpdate=!1;let h=e.get(a);return t===null&&(t=new Ho(i)),h=c?t.fromEquirectangular(a,h):t.fromCubemap(a,h),e.set(a,h),h.texture}else{if(e.has(a))return e.get(a).texture;{const h=a.image;if(c&&h&&h.height>0||u&&h&&s(h)){t===null&&(t=new Ho(i));const d=c?t.fromEquirectangular(a):t.fromCubemap(a);return e.set(a,d),a.addEventListener("dispose",r),d.texture}else return null}}}return a}function s(a){let l=0;const c=6;for(let u=0;u<c;u++)a[u]!==void 0&&l++;return l===c}function r(a){const l=a.target;l.removeEventListener("dispose",r);const c=e.get(l);c!==void 0&&(e.delete(l),c.dispose())}function o(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:n,dispose:o}}function rp(i){const e={};function t(n){if(e[n]!==void 0)return e[n];let s;switch(n){case"WEBGL_depth_texture":s=i.getExtension("WEBGL_depth_texture")||i.getExtension("MOZ_WEBGL_depth_texture")||i.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":s=i.getExtension("EXT_texture_filter_anisotropic")||i.getExtension("MOZ_EXT_texture_filter_anisotropic")||i.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":s=i.getExtension("WEBGL_compressed_texture_s3tc")||i.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":s=i.getExtension("WEBGL_compressed_texture_pvrtc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:s=i.getExtension(n)}return e[n]=s,s}return{has:function(n){return t(n)!==null},init:function(n){n.isWebGL2?(t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance")):(t("WEBGL_depth_texture"),t("OES_texture_float"),t("OES_texture_half_float"),t("OES_texture_half_float_linear"),t("OES_standard_derivatives"),t("OES_element_index_uint"),t("OES_vertex_array_object"),t("ANGLE_instanced_arrays")),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture")},get:function(n){const s=t(n);return s===null&&console.warn("THREE.WebGLRenderer: "+n+" extension not supported."),s}}}function ap(i,e,t,n){const s={},r=new WeakMap;function o(h){const d=h.target;d.index!==null&&e.remove(d.index);for(const g in d.attributes)e.remove(d.attributes[g]);for(const g in d.morphAttributes){const _=d.morphAttributes[g];for(let p=0,f=_.length;p<f;p++)e.remove(_[p])}d.removeEventListener("dispose",o),delete s[d.id];const m=r.get(d);m&&(e.remove(m),r.delete(d)),n.releaseStatesOfGeometry(d),d.isInstancedBufferGeometry===!0&&delete d._maxInstanceCount,t.memory.geometries--}function a(h,d){return s[d.id]===!0||(d.addEventListener("dispose",o),s[d.id]=!0,t.memory.geometries++),d}function l(h){const d=h.attributes;for(const g in d)e.update(d[g],i.ARRAY_BUFFER);const m=h.morphAttributes;for(const g in m){const _=m[g];for(let p=0,f=_.length;p<f;p++)e.update(_[p],i.ARRAY_BUFFER)}}function c(h){const d=[],m=h.index,g=h.attributes.position;let _=0;if(m!==null){const y=m.array;_=m.version;for(let M=0,S=y.length;M<S;M+=3){const R=y[M+0],w=y[M+1],A=y[M+2];d.push(R,w,w,A,A,R)}}else if(g!==void 0){const y=g.array;_=g.version;for(let M=0,S=y.length/3-1;M<S;M+=3){const R=M+0,w=M+1,A=M+2;d.push(R,w,w,A,A,R)}}else return;const p=new(Pl(d)?Ol:Fl)(d,1);p.version=_;const f=r.get(h);f&&e.remove(f),r.set(h,p)}function u(h){const d=r.get(h);if(d){const m=h.index;m!==null&&d.version<m.version&&c(h)}else c(h);return r.get(h)}return{get:a,update:l,getWireframeAttribute:u}}function op(i,e,t,n){const s=n.isWebGL2;let r;function o(m){r=m}let a,l;function c(m){a=m.type,l=m.bytesPerElement}function u(m,g){i.drawElements(r,g,a,m*l),t.update(g,r,1)}function h(m,g,_){if(_===0)return;let p,f;if(s)p=i,f="drawElementsInstanced";else if(p=e.get("ANGLE_instanced_arrays"),f="drawElementsInstancedANGLE",p===null){console.error("THREE.WebGLIndexedBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.");return}p[f](r,g,a,m*l,_),t.update(g,r,_)}function d(m,g,_){if(_===0)return;const p=e.get("WEBGL_multi_draw");if(p===null)for(let f=0;f<_;f++)this.render(m[f]/l,g[f]);else{p.multiDrawElementsWEBGL(r,g,0,a,m,0,_);let f=0;for(let y=0;y<_;y++)f+=g[y];t.update(f,r,1)}}this.setMode=o,this.setIndex=c,this.render=u,this.renderInstances=h,this.renderMultiDraw=d}function lp(i){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,o,a){switch(t.calls++,o){case i.TRIANGLES:t.triangles+=a*(r/3);break;case i.LINES:t.lines+=a*(r/2);break;case i.LINE_STRIP:t.lines+=a*(r-1);break;case i.LINE_LOOP:t.lines+=a*r;break;case i.POINTS:t.points+=a*r;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",o);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:n}}function cp(i,e){return i[0]-e[0]}function up(i,e){return Math.abs(e[1])-Math.abs(i[1])}function hp(i,e,t){const n={},s=new Float32Array(8),r=new WeakMap,o=new St,a=[];for(let c=0;c<8;c++)a[c]=[c,0];function l(c,u,h){const d=c.morphTargetInfluences;if(e.isWebGL2===!0){const g=u.morphAttributes.position||u.morphAttributes.normal||u.morphAttributes.color,_=g!==void 0?g.length:0;let p=r.get(u);if(p===void 0||p.count!==_){let $=function(){T.dispose(),r.delete(u),u.removeEventListener("dispose",$)};var m=$;p!==void 0&&p.texture.dispose();const f=u.morphAttributes.position!==void 0,y=u.morphAttributes.normal!==void 0,M=u.morphAttributes.color!==void 0,S=u.morphAttributes.position||[],R=u.morphAttributes.normal||[],w=u.morphAttributes.color||[];let A=0;f===!0&&(A=1),y===!0&&(A=2),M===!0&&(A=3);let D=u.attributes.position.count*A,k=1;D>e.maxTextureSize&&(k=Math.ceil(D/e.maxTextureSize),D=e.maxTextureSize);const v=new Float32Array(D*k*4*_),T=new Ul(v,D,k,_);T.type=on,T.needsUpdate=!0;const q=A*4;for(let C=0;C<_;C++){const W=S[C],H=R[C],K=w[C],V=D*k*4*C;for(let Y=0;Y<W.count;Y++){const j=Y*q;f===!0&&(o.fromBufferAttribute(W,Y),v[V+j+0]=o.x,v[V+j+1]=o.y,v[V+j+2]=o.z,v[V+j+3]=0),y===!0&&(o.fromBufferAttribute(H,Y),v[V+j+4]=o.x,v[V+j+5]=o.y,v[V+j+6]=o.z,v[V+j+7]=0),M===!0&&(o.fromBufferAttribute(K,Y),v[V+j+8]=o.x,v[V+j+9]=o.y,v[V+j+10]=o.z,v[V+j+11]=K.itemSize===4?o.w:1)}}p={count:_,texture:T,size:new He(D,k)},r.set(u,p),u.addEventListener("dispose",$)}if(c.isInstancedMesh===!0&&c.morphTexture!==null)h.getUniforms().setValue(i,"morphTexture",c.morphTexture,t);else{let f=0;for(let M=0;M<d.length;M++)f+=d[M];const y=u.morphTargetsRelative?1:1-f;h.getUniforms().setValue(i,"morphTargetBaseInfluence",y),h.getUniforms().setValue(i,"morphTargetInfluences",d)}h.getUniforms().setValue(i,"morphTargetsTexture",p.texture,t),h.getUniforms().setValue(i,"morphTargetsTextureSize",p.size)}else{const g=d===void 0?0:d.length;let _=n[u.id];if(_===void 0||_.length!==g){_=[];for(let S=0;S<g;S++)_[S]=[S,0];n[u.id]=_}for(let S=0;S<g;S++){const R=_[S];R[0]=S,R[1]=d[S]}_.sort(up);for(let S=0;S<8;S++)S<g&&_[S][1]?(a[S][0]=_[S][0],a[S][1]=_[S][1]):(a[S][0]=Number.MAX_SAFE_INTEGER,a[S][1]=0);a.sort(cp);const p=u.morphAttributes.position,f=u.morphAttributes.normal;let y=0;for(let S=0;S<8;S++){const R=a[S],w=R[0],A=R[1];w!==Number.MAX_SAFE_INTEGER&&A?(p&&u.getAttribute("morphTarget"+S)!==p[w]&&u.setAttribute("morphTarget"+S,p[w]),f&&u.getAttribute("morphNormal"+S)!==f[w]&&u.setAttribute("morphNormal"+S,f[w]),s[S]=A,y+=A):(p&&u.hasAttribute("morphTarget"+S)===!0&&u.deleteAttribute("morphTarget"+S),f&&u.hasAttribute("morphNormal"+S)===!0&&u.deleteAttribute("morphNormal"+S),s[S]=0)}const M=u.morphTargetsRelative?1:1-y;h.getUniforms().setValue(i,"morphTargetBaseInfluence",M),h.getUniforms().setValue(i,"morphTargetInfluences",s)}}return{update:l}}function dp(i,e,t,n){let s=new WeakMap;function r(l){const c=n.render.frame,u=l.geometry,h=e.get(l,u);if(s.get(h)!==c&&(e.update(h),s.set(h,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",a)===!1&&l.addEventListener("dispose",a),s.get(l)!==c&&(t.update(l.instanceMatrix,i.ARRAY_BUFFER),l.instanceColor!==null&&t.update(l.instanceColor,i.ARRAY_BUFFER),s.set(l,c))),l.isSkinnedMesh){const d=l.skeleton;s.get(d)!==c&&(d.update(),s.set(d,c))}return h}function o(){s=new WeakMap}function a(l){const c=l.target;c.removeEventListener("dispose",a),t.remove(c.instanceMatrix),c.instanceColor!==null&&t.remove(c.instanceColor)}return{update:r,dispose:o}}class Vl extends Pt{constructor(e,t,n,s,r,o,a,l,c,u){if(u=u!==void 0?u:Zn,u!==Zn&&u!==Ri)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");n===void 0&&u===Zn&&(n=wn),n===void 0&&u===Ri&&(n=jn),super(null,s,r,o,a,l,u,n,c),this.isDepthTexture=!0,this.image={width:e,height:t},this.magFilter=a!==void 0?a:Mt,this.minFilter=l!==void 0?l:Mt,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}}const Wl=new Pt,Xl=new Vl(1,1);Xl.compareFunction=Cl;const ql=new Ul,Yl=new qu,$l=new Gl,Xo=[],qo=[],Yo=new Float32Array(16),$o=new Float32Array(9),Ko=new Float32Array(4);function Ui(i,e,t){const n=i[0];if(n<=0||n>0)return i;const s=e*t;let r=Xo[s];if(r===void 0&&(r=new Float32Array(s),Xo[s]=r),e!==0){n.toArray(r,0);for(let o=1,a=0;o!==e;++o)a+=t,i[o].toArray(r,a)}return r}function dt(i,e){if(i.length!==e.length)return!1;for(let t=0,n=i.length;t<n;t++)if(i[t]!==e[t])return!1;return!0}function ft(i,e){for(let t=0,n=e.length;t<n;t++)i[t]=e[t]}function qs(i,e){let t=qo[e];t===void 0&&(t=new Int32Array(e),qo[e]=t);for(let n=0;n!==e;++n)t[n]=i.allocateTextureUnit();return t}function fp(i,e){const t=this.cache;t[0]!==e&&(i.uniform1f(this.addr,e),t[0]=e)}function pp(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(dt(t,e))return;i.uniform2fv(this.addr,e),ft(t,e)}}function mp(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(i.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(dt(t,e))return;i.uniform3fv(this.addr,e),ft(t,e)}}function gp(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(dt(t,e))return;i.uniform4fv(this.addr,e),ft(t,e)}}function _p(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(dt(t,e))return;i.uniformMatrix2fv(this.addr,!1,e),ft(t,e)}else{if(dt(t,n))return;Ko.set(n),i.uniformMatrix2fv(this.addr,!1,Ko),ft(t,n)}}function vp(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(dt(t,e))return;i.uniformMatrix3fv(this.addr,!1,e),ft(t,e)}else{if(dt(t,n))return;$o.set(n),i.uniformMatrix3fv(this.addr,!1,$o),ft(t,n)}}function xp(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(dt(t,e))return;i.uniformMatrix4fv(this.addr,!1,e),ft(t,e)}else{if(dt(t,n))return;Yo.set(n),i.uniformMatrix4fv(this.addr,!1,Yo),ft(t,n)}}function Mp(i,e){const t=this.cache;t[0]!==e&&(i.uniform1i(this.addr,e),t[0]=e)}function yp(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(dt(t,e))return;i.uniform2iv(this.addr,e),ft(t,e)}}function Sp(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(dt(t,e))return;i.uniform3iv(this.addr,e),ft(t,e)}}function Ep(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(dt(t,e))return;i.uniform4iv(this.addr,e),ft(t,e)}}function bp(i,e){const t=this.cache;t[0]!==e&&(i.uniform1ui(this.addr,e),t[0]=e)}function Tp(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(dt(t,e))return;i.uniform2uiv(this.addr,e),ft(t,e)}}function Ap(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(dt(t,e))return;i.uniform3uiv(this.addr,e),ft(t,e)}}function wp(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(dt(t,e))return;i.uniform4uiv(this.addr,e),ft(t,e)}}function Rp(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);const r=this.type===i.SAMPLER_2D_SHADOW?Xl:Wl;t.setTexture2D(e||r,s)}function Cp(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture3D(e||Yl,s)}function Pp(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTextureCube(e||$l,s)}function Lp(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture2DArray(e||ql,s)}function Dp(i){switch(i){case 5126:return fp;case 35664:return pp;case 35665:return mp;case 35666:return gp;case 35674:return _p;case 35675:return vp;case 35676:return xp;case 5124:case 35670:return Mp;case 35667:case 35671:return yp;case 35668:case 35672:return Sp;case 35669:case 35673:return Ep;case 5125:return bp;case 36294:return Tp;case 36295:return Ap;case 36296:return wp;case 35678:case 36198:case 36298:case 36306:case 35682:return Rp;case 35679:case 36299:case 36307:return Cp;case 35680:case 36300:case 36308:case 36293:return Pp;case 36289:case 36303:case 36311:case 36292:return Lp}}function Up(i,e){i.uniform1fv(this.addr,e)}function Ip(i,e){const t=Ui(e,this.size,2);i.uniform2fv(this.addr,t)}function Np(i,e){const t=Ui(e,this.size,3);i.uniform3fv(this.addr,t)}function Fp(i,e){const t=Ui(e,this.size,4);i.uniform4fv(this.addr,t)}function Op(i,e){const t=Ui(e,this.size,4);i.uniformMatrix2fv(this.addr,!1,t)}function Bp(i,e){const t=Ui(e,this.size,9);i.uniformMatrix3fv(this.addr,!1,t)}function zp(i,e){const t=Ui(e,this.size,16);i.uniformMatrix4fv(this.addr,!1,t)}function Gp(i,e){i.uniform1iv(this.addr,e)}function Hp(i,e){i.uniform2iv(this.addr,e)}function kp(i,e){i.uniform3iv(this.addr,e)}function Vp(i,e){i.uniform4iv(this.addr,e)}function Wp(i,e){i.uniform1uiv(this.addr,e)}function Xp(i,e){i.uniform2uiv(this.addr,e)}function qp(i,e){i.uniform3uiv(this.addr,e)}function Yp(i,e){i.uniform4uiv(this.addr,e)}function $p(i,e,t){const n=this.cache,s=e.length,r=qs(t,s);dt(n,r)||(i.uniform1iv(this.addr,r),ft(n,r));for(let o=0;o!==s;++o)t.setTexture2D(e[o]||Wl,r[o])}function Kp(i,e,t){const n=this.cache,s=e.length,r=qs(t,s);dt(n,r)||(i.uniform1iv(this.addr,r),ft(n,r));for(let o=0;o!==s;++o)t.setTexture3D(e[o]||Yl,r[o])}function jp(i,e,t){const n=this.cache,s=e.length,r=qs(t,s);dt(n,r)||(i.uniform1iv(this.addr,r),ft(n,r));for(let o=0;o!==s;++o)t.setTextureCube(e[o]||$l,r[o])}function Zp(i,e,t){const n=this.cache,s=e.length,r=qs(t,s);dt(n,r)||(i.uniform1iv(this.addr,r),ft(n,r));for(let o=0;o!==s;++o)t.setTexture2DArray(e[o]||ql,r[o])}function Jp(i){switch(i){case 5126:return Up;case 35664:return Ip;case 35665:return Np;case 35666:return Fp;case 35674:return Op;case 35675:return Bp;case 35676:return zp;case 5124:case 35670:return Gp;case 35667:case 35671:return Hp;case 35668:case 35672:return kp;case 35669:case 35673:return Vp;case 5125:return Wp;case 36294:return Xp;case 36295:return qp;case 36296:return Yp;case 35678:case 36198:case 36298:case 36306:case 35682:return $p;case 35679:case 36299:case 36307:return Kp;case 35680:case 36300:case 36308:case 36293:return jp;case 36289:case 36303:case 36311:case 36292:return Zp}}class Qp{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=Dp(t.type)}}class em{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=Jp(t.type)}}class tm{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){const s=this.seq;for(let r=0,o=s.length;r!==o;++r){const a=s[r];a.setValue(e,t[a.id],n)}}}const Ir=/(\w+)(\])?(\[|\.)?/g;function jo(i,e){i.seq.push(e),i.map[e.id]=e}function nm(i,e,t){const n=i.name,s=n.length;for(Ir.lastIndex=0;;){const r=Ir.exec(n),o=Ir.lastIndex;let a=r[1];const l=r[2]==="]",c=r[3];if(l&&(a=a|0),c===void 0||c==="["&&o+2===s){jo(t,c===void 0?new Qp(a,i,e):new em(a,i,e));break}else{let h=t.map[a];h===void 0&&(h=new tm(a),jo(t,h)),t=h}}}class Us{constructor(e,t){this.seq=[],this.map={};const n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let s=0;s<n;++s){const r=e.getActiveUniform(t,s),o=e.getUniformLocation(t,r.name);nm(r,o,this)}}setValue(e,t,n,s){const r=this.map[t];r!==void 0&&r.setValue(e,n,s)}setOptional(e,t,n){const s=t[n];s!==void 0&&this.setValue(e,n,s)}static upload(e,t,n,s){for(let r=0,o=t.length;r!==o;++r){const a=t[r],l=n[a.id];l.needsUpdate!==!1&&a.setValue(e,l.value,s)}}static seqWithValue(e,t){const n=[];for(let s=0,r=e.length;s!==r;++s){const o=e[s];o.id in t&&n.push(o)}return n}}function Zo(i,e,t){const n=i.createShader(e);return i.shaderSource(n,t),i.compileShader(n),n}const im=37297;let sm=0;function rm(i,e){const t=i.split(`
`),n=[],s=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let o=s;o<r;o++){const a=o+1;n.push(`${a===e?">":" "} ${a}: ${t[o]}`)}return n.join(`
`)}function am(i){const e=je.getPrimaries(je.workingColorSpace),t=je.getPrimaries(i);let n;switch(e===t?n="":e===zs&&t===Bs?n="LinearDisplayP3ToLinearSRGB":e===Bs&&t===zs&&(n="LinearSRGBToLinearDisplayP3"),i){case In:case Xs:return[n,"LinearTransferOETF"];case rn:case sa:return[n,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space:",i),[n,"LinearTransferOETF"]}}function Jo(i,e,t){const n=i.getShaderParameter(e,i.COMPILE_STATUS),s=i.getShaderInfoLog(e).trim();if(n&&s==="")return"";const r=/ERROR: 0:(\d+)/.exec(s);if(r){const o=parseInt(r[1]);return t.toUpperCase()+`

`+s+`

`+rm(i.getShaderSource(e),o)}else return s}function om(i,e){const t=am(e);return`vec4 ${i}( vec4 value ) { return ${t[0]}( ${t[1]}( value ) ); }`}function lm(i,e){let t;switch(e){case pu:t="Linear";break;case mu:t="Reinhard";break;case gu:t="OptimizedCineon";break;case _u:t="ACESFilmic";break;case xu:t="AgX";break;case Mu:t="Neutral";break;case vu:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+i+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}function cm(i){return[i.extensionDerivatives||i.envMapCubeUVHeight||i.bumpMap||i.normalMapTangentSpace||i.clearcoatNormalMap||i.flatShading||i.alphaToCoverage||i.shaderID==="physical"?"#extension GL_OES_standard_derivatives : enable":"",(i.extensionFragDepth||i.logarithmicDepthBuffer)&&i.rendererExtensionFragDepth?"#extension GL_EXT_frag_depth : enable":"",i.extensionDrawBuffers&&i.rendererExtensionDrawBuffers?"#extension GL_EXT_draw_buffers : require":"",(i.extensionShaderTextureLOD||i.envMap||i.transmission)&&i.rendererExtensionShaderTextureLod?"#extension GL_EXT_shader_texture_lod : enable":""].filter(Ei).join(`
`)}function um(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Ei).join(`
`)}function hm(i){const e=[];for(const t in i){const n=i[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function dm(i,e){const t={},n=i.getProgramParameter(e,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){const r=i.getActiveAttrib(e,s),o=r.name;let a=1;r.type===i.FLOAT_MAT2&&(a=2),r.type===i.FLOAT_MAT3&&(a=3),r.type===i.FLOAT_MAT4&&(a=4),t[o]={type:r.type,location:i.getAttribLocation(e,o),locationSize:a}}return t}function Ei(i){return i!==""}function Qo(i,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return i.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function el(i,e){return i.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const fm=/^[ \t]*#include +<([\w\d./]+)>/gm;function Zr(i){return i.replace(fm,mm)}const pm=new Map([["encodings_fragment","colorspace_fragment"],["encodings_pars_fragment","colorspace_pars_fragment"],["output_fragment","opaque_fragment"]]);function mm(i,e){let t=Ue[e];if(t===void 0){const n=pm.get(e);if(n!==void 0)t=Ue[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("Can not resolve #include <"+e+">")}return Zr(t)}const gm=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function tl(i){return i.replace(gm,_m)}function _m(i,e,t,n){let s="";for(let r=parseInt(e);r<parseInt(t);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function nl(i){let e=`precision ${i.precision} float;
	precision ${i.precision} int;
	precision ${i.precision} sampler2D;
	precision ${i.precision} samplerCube;
	`;return i.isWebGL2&&(e+=`precision ${i.precision} sampler3D;
		precision ${i.precision} sampler2DArray;
		precision ${i.precision} sampler2DShadow;
		precision ${i.precision} samplerCubeShadow;
		precision ${i.precision} sampler2DArrayShadow;
		precision ${i.precision} isampler2D;
		precision ${i.precision} isampler3D;
		precision ${i.precision} isamplerCube;
		precision ${i.precision} isampler2DArray;
		precision ${i.precision} usampler2D;
		precision ${i.precision} usampler3D;
		precision ${i.precision} usamplerCube;
		precision ${i.precision} usampler2DArray;
		`),i.precision==="highp"?e+=`
#define HIGH_PRECISION`:i.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:i.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}function vm(i){let e="SHADOWMAP_TYPE_BASIC";return i.shadowMapType===vl?e="SHADOWMAP_TYPE_PCF":i.shadowMapType===kc?e="SHADOWMAP_TYPE_PCF_SOFT":i.shadowMapType===vn&&(e="SHADOWMAP_TYPE_VSM"),e}function xm(i){let e="ENVMAP_TYPE_CUBE";if(i.envMap)switch(i.envMapMode){case Ai:case wi:e="ENVMAP_TYPE_CUBE";break;case Ws:e="ENVMAP_TYPE_CUBE_UV";break}return e}function Mm(i){let e="ENVMAP_MODE_REFLECTION";if(i.envMap)switch(i.envMapMode){case wi:e="ENVMAP_MODE_REFRACTION";break}return e}function ym(i){let e="ENVMAP_BLENDING_NONE";if(i.envMap)switch(i.combine){case xl:e="ENVMAP_BLENDING_MULTIPLY";break;case du:e="ENVMAP_BLENDING_MIX";break;case fu:e="ENVMAP_BLENDING_ADD";break}return e}function Sm(i){const e=i.envMapCubeUVHeight;if(e===null)return null;const t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),7*16)),texelHeight:n,maxMip:t}}function Em(i,e,t,n){const s=i.getContext(),r=t.defines;let o=t.vertexShader,a=t.fragmentShader;const l=vm(t),c=xm(t),u=Mm(t),h=ym(t),d=Sm(t),m=t.isWebGL2?"":cm(t),g=um(t),_=hm(r),p=s.createProgram();let f,y,M=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(f=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,_].filter(Ei).join(`
`),f.length>0&&(f+=`
`),y=[m,"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,_].filter(Ei).join(`
`),y.length>0&&(y+=`
`)):(f=[nl(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,_,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+u:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors&&t.isWebGL2?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0&&t.isWebGL2?"#define MORPHTARGETS_TEXTURE":"",t.morphTargetsCount>0&&t.isWebGL2?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0&&t.isWebGL2?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.useLegacyLights?"#define LEGACY_LIGHTS":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.logarithmicDepthBuffer&&t.rendererExtensionFragDepth?"#define USE_LOGDEPTHBUF_EXT":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#if ( defined( USE_MORPHTARGETS ) && ! defined( MORPHTARGETS_TEXTURE ) )","	attribute vec3 morphTarget0;","	attribute vec3 morphTarget1;","	attribute vec3 morphTarget2;","	attribute vec3 morphTarget3;","	#ifdef USE_MORPHNORMALS","		attribute vec3 morphNormal0;","		attribute vec3 morphNormal1;","		attribute vec3 morphNormal2;","		attribute vec3 morphNormal3;","	#else","		attribute vec3 morphTarget4;","		attribute vec3 morphTarget5;","		attribute vec3 morphTarget6;","		attribute vec3 morphTarget7;","	#endif","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Ei).join(`
`),y=[m,nl(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,_,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+u:"",t.envMap?"#define "+h:"",d?"#define CUBEUV_TEXEL_WIDTH "+d.texelWidth:"",d?"#define CUBEUV_TEXEL_HEIGHT "+d.texelHeight:"",d?"#define CUBEUV_MAX_MIP "+d.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.useLegacyLights?"#define LEGACY_LIGHTS":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.logarithmicDepthBuffer&&t.rendererExtensionFragDepth?"#define USE_LOGDEPTHBUF_EXT":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==Cn?"#define TONE_MAPPING":"",t.toneMapping!==Cn?Ue.tonemapping_pars_fragment:"",t.toneMapping!==Cn?lm("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",Ue.colorspace_pars_fragment,om("linearToOutputTexel",t.outputColorSpace),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(Ei).join(`
`)),o=Zr(o),o=Qo(o,t),o=el(o,t),a=Zr(a),a=Qo(a,t),a=el(a,t),o=tl(o),a=tl(a),t.isWebGL2&&t.isRawShaderMaterial!==!0&&(M=`#version 300 es
`,f=[g,"precision mediump sampler2DArray;","#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+f,y=["precision mediump sampler2DArray;","#define varying in",t.glslVersion===vo?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===vo?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+y);const S=M+f+o,R=M+y+a,w=Zo(s,s.VERTEX_SHADER,S),A=Zo(s,s.FRAGMENT_SHADER,R);s.attachShader(p,w),s.attachShader(p,A),t.index0AttributeName!==void 0?s.bindAttribLocation(p,0,t.index0AttributeName):t.morphTargets===!0&&s.bindAttribLocation(p,0,"position"),s.linkProgram(p);function D(q){if(i.debug.checkShaderErrors){const $=s.getProgramInfoLog(p).trim(),C=s.getShaderInfoLog(w).trim(),W=s.getShaderInfoLog(A).trim();let H=!0,K=!0;if(s.getProgramParameter(p,s.LINK_STATUS)===!1)if(H=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,p,w,A);else{const V=Jo(s,w,"vertex"),Y=Jo(s,A,"fragment");console.error("THREE.WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(p,s.VALIDATE_STATUS)+`

Material Name: `+q.name+`
Material Type: `+q.type+`

Program Info Log: `+$+`
`+V+`
`+Y)}else $!==""?console.warn("THREE.WebGLProgram: Program Info Log:",$):(C===""||W==="")&&(K=!1);K&&(q.diagnostics={runnable:H,programLog:$,vertexShader:{log:C,prefix:f},fragmentShader:{log:W,prefix:y}})}s.deleteShader(w),s.deleteShader(A),k=new Us(s,p),v=dm(s,p)}let k;this.getUniforms=function(){return k===void 0&&D(this),k};let v;this.getAttributes=function(){return v===void 0&&D(this),v};let T=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return T===!1&&(T=s.getProgramParameter(p,im)),T},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(p),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=sm++,this.cacheKey=e,this.usedTimes=1,this.program=p,this.vertexShader=w,this.fragmentShader=A,this}let bm=0;class Tm{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){const t=e.vertexShader,n=e.fragmentShader,s=this._getShaderStage(t),r=this._getShaderStage(n),o=this._getShaderCacheForMaterial(e);return o.has(s)===!1&&(o.add(s),s.usedTimes++),o.has(r)===!1&&(o.add(r),r.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){const t=this.shaderCache;let n=t.get(e);return n===void 0&&(n=new Am(e),t.set(e,n)),n}}class Am{constructor(e){this.id=bm++,this.code=e,this.usedTimes=0}}function wm(i,e,t,n,s,r,o){const a=new Il,l=new Tm,c=new Set,u=[],h=s.isWebGL2,d=s.logarithmicDepthBuffer,m=s.vertexTextures;let g=s.precision;const _={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function p(v){return c.add(v),v===0?"uv":`uv${v}`}function f(v,T,q,$,C){const W=$.fog,H=C.geometry,K=v.isMeshStandardMaterial?$.environment:null,V=(v.isMeshStandardMaterial?t:e).get(v.envMap||K),Y=V&&V.mapping===Ws?V.image.height:null,j=_[v.type];v.precision!==null&&(g=s.getMaxPrecision(v.precision),g!==v.precision&&console.warn("THREE.WebGLProgram.getParameters:",v.precision,"not supported, using",g,"instead."));const ie=H.morphAttributes.position||H.morphAttributes.normal||H.morphAttributes.color,he=ie!==void 0?ie.length:0;let Ce=0;H.morphAttributes.position!==void 0&&(Ce=1),H.morphAttributes.normal!==void 0&&(Ce=2),H.morphAttributes.color!==void 0&&(Ce=3);let z,J,ue,Ee;if(j){const Je=an[j];z=Je.vertexShader,J=Je.fragmentShader}else z=v.vertexShader,J=v.fragmentShader,l.update(v),ue=l.getVertexShaderID(v),Ee=l.getFragmentShaderID(v);const ge=i.getRenderTarget(),de=C.isInstancedMesh===!0,$e=C.isBatchedMesh===!0,be=!!v.map,I=!!v.matcap,vt=!!V,ve=!!v.aoMap,Be=!!v.lightMap,Me=!!v.bumpMap,We=!!v.normalMap,Ne=!!v.displacementMap,ze=!!v.emissiveMap,at=!!v.metalnessMap,b=!!v.roughnessMap,x=v.anisotropy>0,G=v.clearcoat>0,X=v.iridescence>0,Q=v.sheen>0,Z=v.transmission>0,Pe=x&&!!v.anisotropyMap,ye=G&&!!v.clearcoatMap,se=G&&!!v.clearcoatNormalMap,ae=G&&!!v.clearcoatRoughnessMap,Le=X&&!!v.iridescenceMap,ee=X&&!!v.iridescenceThicknessMap,ct=Q&&!!v.sheenColorMap,Ge=Q&&!!v.sheenRoughnessMap,_e=!!v.specularMap,fe=!!v.specularColorMap,pe=!!v.specularIntensityMap,Xe=Z&&!!v.transmissionMap,we=Z&&!!v.thicknessMap,tt=!!v.gradientMap,L=!!v.alphaMap,re=v.alphaTest>0,F=!!v.alphaHash,te=!!v.extensions;let oe=Cn;v.toneMapped&&(ge===null||ge.isXRRenderTarget===!0)&&(oe=i.toneMapping);const ke={isWebGL2:h,shaderID:j,shaderType:v.type,shaderName:v.name,vertexShader:z,fragmentShader:J,defines:v.defines,customVertexShaderID:ue,customFragmentShaderID:Ee,isRawShaderMaterial:v.isRawShaderMaterial===!0,glslVersion:v.glslVersion,precision:g,batching:$e,instancing:de,instancingColor:de&&C.instanceColor!==null,instancingMorph:de&&C.morphTexture!==null,supportsVertexTextures:m,outputColorSpace:ge===null?i.outputColorSpace:ge.isXRRenderTarget===!0?ge.texture.colorSpace:In,alphaToCoverage:!!v.alphaToCoverage,map:be,matcap:I,envMap:vt,envMapMode:vt&&V.mapping,envMapCubeUVHeight:Y,aoMap:ve,lightMap:Be,bumpMap:Me,normalMap:We,displacementMap:m&&Ne,emissiveMap:ze,normalMapObjectSpace:We&&v.normalMapType===Lu,normalMapTangentSpace:We&&v.normalMapType===Pu,metalnessMap:at,roughnessMap:b,anisotropy:x,anisotropyMap:Pe,clearcoat:G,clearcoatMap:ye,clearcoatNormalMap:se,clearcoatRoughnessMap:ae,iridescence:X,iridescenceMap:Le,iridescenceThicknessMap:ee,sheen:Q,sheenColorMap:ct,sheenRoughnessMap:Ge,specularMap:_e,specularColorMap:fe,specularIntensityMap:pe,transmission:Z,transmissionMap:Xe,thicknessMap:we,gradientMap:tt,opaque:v.transparent===!1&&v.blending===Kn&&v.alphaToCoverage===!1,alphaMap:L,alphaTest:re,alphaHash:F,combine:v.combine,mapUv:be&&p(v.map.channel),aoMapUv:ve&&p(v.aoMap.channel),lightMapUv:Be&&p(v.lightMap.channel),bumpMapUv:Me&&p(v.bumpMap.channel),normalMapUv:We&&p(v.normalMap.channel),displacementMapUv:Ne&&p(v.displacementMap.channel),emissiveMapUv:ze&&p(v.emissiveMap.channel),metalnessMapUv:at&&p(v.metalnessMap.channel),roughnessMapUv:b&&p(v.roughnessMap.channel),anisotropyMapUv:Pe&&p(v.anisotropyMap.channel),clearcoatMapUv:ye&&p(v.clearcoatMap.channel),clearcoatNormalMapUv:se&&p(v.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:ae&&p(v.clearcoatRoughnessMap.channel),iridescenceMapUv:Le&&p(v.iridescenceMap.channel),iridescenceThicknessMapUv:ee&&p(v.iridescenceThicknessMap.channel),sheenColorMapUv:ct&&p(v.sheenColorMap.channel),sheenRoughnessMapUv:Ge&&p(v.sheenRoughnessMap.channel),specularMapUv:_e&&p(v.specularMap.channel),specularColorMapUv:fe&&p(v.specularColorMap.channel),specularIntensityMapUv:pe&&p(v.specularIntensityMap.channel),transmissionMapUv:Xe&&p(v.transmissionMap.channel),thicknessMapUv:we&&p(v.thicknessMap.channel),alphaMapUv:L&&p(v.alphaMap.channel),vertexTangents:!!H.attributes.tangent&&(We||x),vertexColors:v.vertexColors,vertexAlphas:v.vertexColors===!0&&!!H.attributes.color&&H.attributes.color.itemSize===4,pointsUvs:C.isPoints===!0&&!!H.attributes.uv&&(be||L),fog:!!W,useFog:v.fog===!0,fogExp2:!!W&&W.isFogExp2,flatShading:v.flatShading===!0,sizeAttenuation:v.sizeAttenuation===!0,logarithmicDepthBuffer:d,skinning:C.isSkinnedMesh===!0,morphTargets:H.morphAttributes.position!==void 0,morphNormals:H.morphAttributes.normal!==void 0,morphColors:H.morphAttributes.color!==void 0,morphTargetsCount:he,morphTextureStride:Ce,numDirLights:T.directional.length,numPointLights:T.point.length,numSpotLights:T.spot.length,numSpotLightMaps:T.spotLightMap.length,numRectAreaLights:T.rectArea.length,numHemiLights:T.hemi.length,numDirLightShadows:T.directionalShadowMap.length,numPointLightShadows:T.pointShadowMap.length,numSpotLightShadows:T.spotShadowMap.length,numSpotLightShadowsWithMaps:T.numSpotLightShadowsWithMaps,numLightProbes:T.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:v.dithering,shadowMapEnabled:i.shadowMap.enabled&&q.length>0,shadowMapType:i.shadowMap.type,toneMapping:oe,useLegacyLights:i._useLegacyLights,decodeVideoTexture:be&&v.map.isVideoTexture===!0&&je.getTransfer(v.map.colorSpace)===et,premultipliedAlpha:v.premultipliedAlpha,doubleSided:v.side===qt,flipSided:v.side===Nt,useDepthPacking:v.depthPacking>=0,depthPacking:v.depthPacking||0,index0AttributeName:v.index0AttributeName,extensionDerivatives:te&&v.extensions.derivatives===!0,extensionFragDepth:te&&v.extensions.fragDepth===!0,extensionDrawBuffers:te&&v.extensions.drawBuffers===!0,extensionShaderTextureLOD:te&&v.extensions.shaderTextureLOD===!0,extensionClipCullDistance:te&&v.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:te&&v.extensions.multiDraw===!0&&n.has("WEBGL_multi_draw"),rendererExtensionFragDepth:h||n.has("EXT_frag_depth"),rendererExtensionDrawBuffers:h||n.has("WEBGL_draw_buffers"),rendererExtensionShaderTextureLod:h||n.has("EXT_shader_texture_lod"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:v.customProgramCacheKey()};return ke.vertexUv1s=c.has(1),ke.vertexUv2s=c.has(2),ke.vertexUv3s=c.has(3),c.clear(),ke}function y(v){const T=[];if(v.shaderID?T.push(v.shaderID):(T.push(v.customVertexShaderID),T.push(v.customFragmentShaderID)),v.defines!==void 0)for(const q in v.defines)T.push(q),T.push(v.defines[q]);return v.isRawShaderMaterial===!1&&(M(T,v),S(T,v),T.push(i.outputColorSpace)),T.push(v.customProgramCacheKey),T.join()}function M(v,T){v.push(T.precision),v.push(T.outputColorSpace),v.push(T.envMapMode),v.push(T.envMapCubeUVHeight),v.push(T.mapUv),v.push(T.alphaMapUv),v.push(T.lightMapUv),v.push(T.aoMapUv),v.push(T.bumpMapUv),v.push(T.normalMapUv),v.push(T.displacementMapUv),v.push(T.emissiveMapUv),v.push(T.metalnessMapUv),v.push(T.roughnessMapUv),v.push(T.anisotropyMapUv),v.push(T.clearcoatMapUv),v.push(T.clearcoatNormalMapUv),v.push(T.clearcoatRoughnessMapUv),v.push(T.iridescenceMapUv),v.push(T.iridescenceThicknessMapUv),v.push(T.sheenColorMapUv),v.push(T.sheenRoughnessMapUv),v.push(T.specularMapUv),v.push(T.specularColorMapUv),v.push(T.specularIntensityMapUv),v.push(T.transmissionMapUv),v.push(T.thicknessMapUv),v.push(T.combine),v.push(T.fogExp2),v.push(T.sizeAttenuation),v.push(T.morphTargetsCount),v.push(T.morphAttributeCount),v.push(T.numDirLights),v.push(T.numPointLights),v.push(T.numSpotLights),v.push(T.numSpotLightMaps),v.push(T.numHemiLights),v.push(T.numRectAreaLights),v.push(T.numDirLightShadows),v.push(T.numPointLightShadows),v.push(T.numSpotLightShadows),v.push(T.numSpotLightShadowsWithMaps),v.push(T.numLightProbes),v.push(T.shadowMapType),v.push(T.toneMapping),v.push(T.numClippingPlanes),v.push(T.numClipIntersection),v.push(T.depthPacking)}function S(v,T){a.disableAll(),T.isWebGL2&&a.enable(0),T.supportsVertexTextures&&a.enable(1),T.instancing&&a.enable(2),T.instancingColor&&a.enable(3),T.instancingMorph&&a.enable(4),T.matcap&&a.enable(5),T.envMap&&a.enable(6),T.normalMapObjectSpace&&a.enable(7),T.normalMapTangentSpace&&a.enable(8),T.clearcoat&&a.enable(9),T.iridescence&&a.enable(10),T.alphaTest&&a.enable(11),T.vertexColors&&a.enable(12),T.vertexAlphas&&a.enable(13),T.vertexUv1s&&a.enable(14),T.vertexUv2s&&a.enable(15),T.vertexUv3s&&a.enable(16),T.vertexTangents&&a.enable(17),T.anisotropy&&a.enable(18),T.alphaHash&&a.enable(19),T.batching&&a.enable(20),v.push(a.mask),a.disableAll(),T.fog&&a.enable(0),T.useFog&&a.enable(1),T.flatShading&&a.enable(2),T.logarithmicDepthBuffer&&a.enable(3),T.skinning&&a.enable(4),T.morphTargets&&a.enable(5),T.morphNormals&&a.enable(6),T.morphColors&&a.enable(7),T.premultipliedAlpha&&a.enable(8),T.shadowMapEnabled&&a.enable(9),T.useLegacyLights&&a.enable(10),T.doubleSided&&a.enable(11),T.flipSided&&a.enable(12),T.useDepthPacking&&a.enable(13),T.dithering&&a.enable(14),T.transmission&&a.enable(15),T.sheen&&a.enable(16),T.opaque&&a.enable(17),T.pointsUvs&&a.enable(18),T.decodeVideoTexture&&a.enable(19),T.alphaToCoverage&&a.enable(20),v.push(a.mask)}function R(v){const T=_[v.type];let q;if(T){const $=an[T];q=rh.clone($.uniforms)}else q=v.uniforms;return q}function w(v,T){let q;for(let $=0,C=u.length;$<C;$++){const W=u[$];if(W.cacheKey===T){q=W,++q.usedTimes;break}}return q===void 0&&(q=new Em(i,T,v,r),u.push(q)),q}function A(v){if(--v.usedTimes===0){const T=u.indexOf(v);u[T]=u[u.length-1],u.pop(),v.destroy()}}function D(v){l.remove(v)}function k(){l.dispose()}return{getParameters:f,getProgramCacheKey:y,getUniforms:R,acquireProgram:w,releaseProgram:A,releaseShaderCache:D,programs:u,dispose:k}}function Rm(){let i=new WeakMap;function e(r){let o=i.get(r);return o===void 0&&(o={},i.set(r,o)),o}function t(r){i.delete(r)}function n(r,o,a){i.get(r)[o]=a}function s(){i=new WeakMap}return{get:e,remove:t,update:n,dispose:s}}function Cm(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.material.id!==e.material.id?i.material.id-e.material.id:i.z!==e.z?i.z-e.z:i.id-e.id}function il(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.z!==e.z?e.z-i.z:i.id-e.id}function sl(){const i=[];let e=0;const t=[],n=[],s=[];function r(){e=0,t.length=0,n.length=0,s.length=0}function o(h,d,m,g,_,p){let f=i[e];return f===void 0?(f={id:h.id,object:h,geometry:d,material:m,groupOrder:g,renderOrder:h.renderOrder,z:_,group:p},i[e]=f):(f.id=h.id,f.object=h,f.geometry=d,f.material=m,f.groupOrder=g,f.renderOrder=h.renderOrder,f.z=_,f.group=p),e++,f}function a(h,d,m,g,_,p){const f=o(h,d,m,g,_,p);m.transmission>0?n.push(f):m.transparent===!0?s.push(f):t.push(f)}function l(h,d,m,g,_,p){const f=o(h,d,m,g,_,p);m.transmission>0?n.unshift(f):m.transparent===!0?s.unshift(f):t.unshift(f)}function c(h,d){t.length>1&&t.sort(h||Cm),n.length>1&&n.sort(d||il),s.length>1&&s.sort(d||il)}function u(){for(let h=e,d=i.length;h<d;h++){const m=i[h];if(m.id===null)break;m.id=null,m.object=null,m.geometry=null,m.material=null,m.group=null}}return{opaque:t,transmissive:n,transparent:s,init:r,push:a,unshift:l,finish:u,sort:c}}function Pm(){let i=new WeakMap;function e(n,s){const r=i.get(n);let o;return r===void 0?(o=new sl,i.set(n,[o])):s>=r.length?(o=new sl,r.push(o)):o=r[s],o}function t(){i=new WeakMap}return{get:e,dispose:t}}function Lm(){const i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new P,color:new Ve};break;case"SpotLight":t={position:new P,direction:new P,color:new Ve,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new P,color:new Ve,distance:0,decay:0};break;case"HemisphereLight":t={direction:new P,skyColor:new Ve,groundColor:new Ve};break;case"RectAreaLight":t={color:new Ve,position:new P,halfWidth:new P,halfHeight:new P};break}return i[e.id]=t,t}}}function Dm(){const i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new He};break;case"SpotLight":t={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new He};break;case"PointLight":t={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new He,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[e.id]=t,t}}}let Um=0;function Im(i,e){return(e.castShadow?2:0)-(i.castShadow?2:0)+(e.map?1:0)-(i.map?1:0)}function Nm(i,e){const t=new Lm,n=Dm(),s={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let u=0;u<9;u++)s.probe.push(new P);const r=new P,o=new it,a=new it;function l(u,h){let d=0,m=0,g=0;for(let q=0;q<9;q++)s.probe[q].set(0,0,0);let _=0,p=0,f=0,y=0,M=0,S=0,R=0,w=0,A=0,D=0,k=0;u.sort(Im);const v=h===!0?Math.PI:1;for(let q=0,$=u.length;q<$;q++){const C=u[q],W=C.color,H=C.intensity,K=C.distance,V=C.shadow&&C.shadow.map?C.shadow.map.texture:null;if(C.isAmbientLight)d+=W.r*H*v,m+=W.g*H*v,g+=W.b*H*v;else if(C.isLightProbe){for(let Y=0;Y<9;Y++)s.probe[Y].addScaledVector(C.sh.coefficients[Y],H);k++}else if(C.isDirectionalLight){const Y=t.get(C);if(Y.color.copy(C.color).multiplyScalar(C.intensity*v),C.castShadow){const j=C.shadow,ie=n.get(C);ie.shadowBias=j.bias,ie.shadowNormalBias=j.normalBias,ie.shadowRadius=j.radius,ie.shadowMapSize=j.mapSize,s.directionalShadow[_]=ie,s.directionalShadowMap[_]=V,s.directionalShadowMatrix[_]=C.shadow.matrix,S++}s.directional[_]=Y,_++}else if(C.isSpotLight){const Y=t.get(C);Y.position.setFromMatrixPosition(C.matrixWorld),Y.color.copy(W).multiplyScalar(H*v),Y.distance=K,Y.coneCos=Math.cos(C.angle),Y.penumbraCos=Math.cos(C.angle*(1-C.penumbra)),Y.decay=C.decay,s.spot[f]=Y;const j=C.shadow;if(C.map&&(s.spotLightMap[A]=C.map,A++,j.updateMatrices(C),C.castShadow&&D++),s.spotLightMatrix[f]=j.matrix,C.castShadow){const ie=n.get(C);ie.shadowBias=j.bias,ie.shadowNormalBias=j.normalBias,ie.shadowRadius=j.radius,ie.shadowMapSize=j.mapSize,s.spotShadow[f]=ie,s.spotShadowMap[f]=V,w++}f++}else if(C.isRectAreaLight){const Y=t.get(C);Y.color.copy(W).multiplyScalar(H),Y.halfWidth.set(C.width*.5,0,0),Y.halfHeight.set(0,C.height*.5,0),s.rectArea[y]=Y,y++}else if(C.isPointLight){const Y=t.get(C);if(Y.color.copy(C.color).multiplyScalar(C.intensity*v),Y.distance=C.distance,Y.decay=C.decay,C.castShadow){const j=C.shadow,ie=n.get(C);ie.shadowBias=j.bias,ie.shadowNormalBias=j.normalBias,ie.shadowRadius=j.radius,ie.shadowMapSize=j.mapSize,ie.shadowCameraNear=j.camera.near,ie.shadowCameraFar=j.camera.far,s.pointShadow[p]=ie,s.pointShadowMap[p]=V,s.pointShadowMatrix[p]=C.shadow.matrix,R++}s.point[p]=Y,p++}else if(C.isHemisphereLight){const Y=t.get(C);Y.skyColor.copy(C.color).multiplyScalar(H*v),Y.groundColor.copy(C.groundColor).multiplyScalar(H*v),s.hemi[M]=Y,M++}}y>0&&(e.isWebGL2?i.has("OES_texture_float_linear")===!0?(s.rectAreaLTC1=ne.LTC_FLOAT_1,s.rectAreaLTC2=ne.LTC_FLOAT_2):(s.rectAreaLTC1=ne.LTC_HALF_1,s.rectAreaLTC2=ne.LTC_HALF_2):i.has("OES_texture_float_linear")===!0?(s.rectAreaLTC1=ne.LTC_FLOAT_1,s.rectAreaLTC2=ne.LTC_FLOAT_2):i.has("OES_texture_half_float_linear")===!0?(s.rectAreaLTC1=ne.LTC_HALF_1,s.rectAreaLTC2=ne.LTC_HALF_2):console.error("THREE.WebGLRenderer: Unable to use RectAreaLight. Missing WebGL extensions.")),s.ambient[0]=d,s.ambient[1]=m,s.ambient[2]=g;const T=s.hash;(T.directionalLength!==_||T.pointLength!==p||T.spotLength!==f||T.rectAreaLength!==y||T.hemiLength!==M||T.numDirectionalShadows!==S||T.numPointShadows!==R||T.numSpotShadows!==w||T.numSpotMaps!==A||T.numLightProbes!==k)&&(s.directional.length=_,s.spot.length=f,s.rectArea.length=y,s.point.length=p,s.hemi.length=M,s.directionalShadow.length=S,s.directionalShadowMap.length=S,s.pointShadow.length=R,s.pointShadowMap.length=R,s.spotShadow.length=w,s.spotShadowMap.length=w,s.directionalShadowMatrix.length=S,s.pointShadowMatrix.length=R,s.spotLightMatrix.length=w+A-D,s.spotLightMap.length=A,s.numSpotLightShadowsWithMaps=D,s.numLightProbes=k,T.directionalLength=_,T.pointLength=p,T.spotLength=f,T.rectAreaLength=y,T.hemiLength=M,T.numDirectionalShadows=S,T.numPointShadows=R,T.numSpotShadows=w,T.numSpotMaps=A,T.numLightProbes=k,s.version=Um++)}function c(u,h){let d=0,m=0,g=0,_=0,p=0;const f=h.matrixWorldInverse;for(let y=0,M=u.length;y<M;y++){const S=u[y];if(S.isDirectionalLight){const R=s.directional[d];R.direction.setFromMatrixPosition(S.matrixWorld),r.setFromMatrixPosition(S.target.matrixWorld),R.direction.sub(r),R.direction.transformDirection(f),d++}else if(S.isSpotLight){const R=s.spot[g];R.position.setFromMatrixPosition(S.matrixWorld),R.position.applyMatrix4(f),R.direction.setFromMatrixPosition(S.matrixWorld),r.setFromMatrixPosition(S.target.matrixWorld),R.direction.sub(r),R.direction.transformDirection(f),g++}else if(S.isRectAreaLight){const R=s.rectArea[_];R.position.setFromMatrixPosition(S.matrixWorld),R.position.applyMatrix4(f),a.identity(),o.copy(S.matrixWorld),o.premultiply(f),a.extractRotation(o),R.halfWidth.set(S.width*.5,0,0),R.halfHeight.set(0,S.height*.5,0),R.halfWidth.applyMatrix4(a),R.halfHeight.applyMatrix4(a),_++}else if(S.isPointLight){const R=s.point[m];R.position.setFromMatrixPosition(S.matrixWorld),R.position.applyMatrix4(f),m++}else if(S.isHemisphereLight){const R=s.hemi[p];R.direction.setFromMatrixPosition(S.matrixWorld),R.direction.transformDirection(f),p++}}}return{setup:l,setupView:c,state:s}}function rl(i,e){const t=new Nm(i,e),n=[],s=[];function r(){n.length=0,s.length=0}function o(h){n.push(h)}function a(h){s.push(h)}function l(h){t.setup(n,h)}function c(h){t.setupView(n,h)}return{init:r,state:{lightsArray:n,shadowsArray:s,lights:t},setupLights:l,setupLightsView:c,pushLight:o,pushShadow:a}}function Fm(i,e){let t=new WeakMap;function n(r,o=0){const a=t.get(r);let l;return a===void 0?(l=new rl(i,e),t.set(r,[l])):o>=a.length?(l=new rl(i,e),a.push(l)):l=a[o],l}function s(){t=new WeakMap}return{get:n,dispose:s}}class Om extends Di{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Ru,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class Bm extends Di{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}const zm=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Gm=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function Hm(i,e,t){let n=new Hl;const s=new He,r=new He,o=new St,a=new Om({depthPacking:Cu}),l=new Bm,c={},u=t.maxTextureSize,h={[Dn]:Nt,[Nt]:Dn,[qt]:qt},d=new Un({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new He},radius:{value:4}},vertexShader:zm,fragmentShader:Gm}),m=d.clone();m.defines.HORIZONTAL_PASS=1;const g=new rt;g.setAttribute("position",new ht(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const _=new Ye(g,d),p=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=vl;let f=this.type;this.render=function(w,A,D){if(p.enabled===!1||p.autoUpdate===!1&&p.needsUpdate===!1||w.length===0)return;const k=i.getRenderTarget(),v=i.getActiveCubeFace(),T=i.getActiveMipmapLevel(),q=i.state;q.setBlending(Rn),q.buffers.color.setClear(1,1,1,1),q.buffers.depth.setTest(!0),q.setScissorTest(!1);const $=f!==vn&&this.type===vn,C=f===vn&&this.type!==vn;for(let W=0,H=w.length;W<H;W++){const K=w[W],V=K.shadow;if(V===void 0){console.warn("THREE.WebGLShadowMap:",K,"has no shadow.");continue}if(V.autoUpdate===!1&&V.needsUpdate===!1)continue;s.copy(V.mapSize);const Y=V.getFrameExtents();if(s.multiply(Y),r.copy(V.mapSize),(s.x>u||s.y>u)&&(s.x>u&&(r.x=Math.floor(u/Y.x),s.x=r.x*Y.x,V.mapSize.x=r.x),s.y>u&&(r.y=Math.floor(u/Y.y),s.y=r.y*Y.y,V.mapSize.y=r.y)),V.map===null||$===!0||C===!0){const ie=this.type!==vn?{minFilter:Mt,magFilter:Mt}:{};V.map!==null&&V.map.dispose(),V.map=new Qn(s.x,s.y,ie),V.map.texture.name=K.name+".shadowMap",V.camera.updateProjectionMatrix()}i.setRenderTarget(V.map),i.clear();const j=V.getViewportCount();for(let ie=0;ie<j;ie++){const he=V.getViewport(ie);o.set(r.x*he.x,r.y*he.y,r.x*he.z,r.y*he.w),q.viewport(o),V.updateMatrices(K,ie),n=V.getFrustum(),S(A,D,V.camera,K,this.type)}V.isPointLightShadow!==!0&&this.type===vn&&y(V,D),V.needsUpdate=!1}f=this.type,p.needsUpdate=!1,i.setRenderTarget(k,v,T)};function y(w,A){const D=e.update(_);d.defines.VSM_SAMPLES!==w.blurSamples&&(d.defines.VSM_SAMPLES=w.blurSamples,m.defines.VSM_SAMPLES=w.blurSamples,d.needsUpdate=!0,m.needsUpdate=!0),w.mapPass===null&&(w.mapPass=new Qn(s.x,s.y)),d.uniforms.shadow_pass.value=w.map.texture,d.uniforms.resolution.value=w.mapSize,d.uniforms.radius.value=w.radius,i.setRenderTarget(w.mapPass),i.clear(),i.renderBufferDirect(A,null,D,d,_,null),m.uniforms.shadow_pass.value=w.mapPass.texture,m.uniforms.resolution.value=w.mapSize,m.uniforms.radius.value=w.radius,i.setRenderTarget(w.map),i.clear(),i.renderBufferDirect(A,null,D,m,_,null)}function M(w,A,D,k){let v=null;const T=D.isPointLight===!0?w.customDistanceMaterial:w.customDepthMaterial;if(T!==void 0)v=T;else if(v=D.isPointLight===!0?l:a,i.localClippingEnabled&&A.clipShadows===!0&&Array.isArray(A.clippingPlanes)&&A.clippingPlanes.length!==0||A.displacementMap&&A.displacementScale!==0||A.alphaMap&&A.alphaTest>0||A.map&&A.alphaTest>0){const q=v.uuid,$=A.uuid;let C=c[q];C===void 0&&(C={},c[q]=C);let W=C[$];W===void 0&&(W=v.clone(),C[$]=W,A.addEventListener("dispose",R)),v=W}if(v.visible=A.visible,v.wireframe=A.wireframe,k===vn?v.side=A.shadowSide!==null?A.shadowSide:A.side:v.side=A.shadowSide!==null?A.shadowSide:h[A.side],v.alphaMap=A.alphaMap,v.alphaTest=A.alphaTest,v.map=A.map,v.clipShadows=A.clipShadows,v.clippingPlanes=A.clippingPlanes,v.clipIntersection=A.clipIntersection,v.displacementMap=A.displacementMap,v.displacementScale=A.displacementScale,v.displacementBias=A.displacementBias,v.wireframeLinewidth=A.wireframeLinewidth,v.linewidth=A.linewidth,D.isPointLight===!0&&v.isMeshDistanceMaterial===!0){const q=i.properties.get(v);q.light=D}return v}function S(w,A,D,k,v){if(w.visible===!1)return;if(w.layers.test(A.layers)&&(w.isMesh||w.isLine||w.isPoints)&&(w.castShadow||w.receiveShadow&&v===vn)&&(!w.frustumCulled||n.intersectsObject(w))){w.modelViewMatrix.multiplyMatrices(D.matrixWorldInverse,w.matrixWorld);const $=e.update(w),C=w.material;if(Array.isArray(C)){const W=$.groups;for(let H=0,K=W.length;H<K;H++){const V=W[H],Y=C[V.materialIndex];if(Y&&Y.visible){const j=M(w,Y,k,v);w.onBeforeShadow(i,w,A,D,$,j,V),i.renderBufferDirect(D,null,$,j,w,V),w.onAfterShadow(i,w,A,D,$,j,V)}}}else if(C.visible){const W=M(w,C,k,v);w.onBeforeShadow(i,w,A,D,$,W,null),i.renderBufferDirect(D,null,$,W,w,null),w.onAfterShadow(i,w,A,D,$,W,null)}}const q=w.children;for(let $=0,C=q.length;$<C;$++)S(q[$],A,D,k,v)}function R(w){w.target.removeEventListener("dispose",R);for(const D in c){const k=c[D],v=w.target.uuid;v in k&&(k[v].dispose(),delete k[v])}}}function km(i,e,t){const n=t.isWebGL2;function s(){let L=!1;const re=new St;let F=null;const te=new St(0,0,0,0);return{setMask:function(oe){F!==oe&&!L&&(i.colorMask(oe,oe,oe,oe),F=oe)},setLocked:function(oe){L=oe},setClear:function(oe,ke,Je,xt,kt){kt===!0&&(oe*=xt,ke*=xt,Je*=xt),re.set(oe,ke,Je,xt),te.equals(re)===!1&&(i.clearColor(oe,ke,Je,xt),te.copy(re))},reset:function(){L=!1,F=null,te.set(-1,0,0,0)}}}function r(){let L=!1,re=null,F=null,te=null;return{setTest:function(oe){oe?de(i.DEPTH_TEST):$e(i.DEPTH_TEST)},setMask:function(oe){re!==oe&&!L&&(i.depthMask(oe),re=oe)},setFunc:function(oe){if(F!==oe){switch(oe){case ru:i.depthFunc(i.NEVER);break;case au:i.depthFunc(i.ALWAYS);break;case ou:i.depthFunc(i.LESS);break;case Fs:i.depthFunc(i.LEQUAL);break;case lu:i.depthFunc(i.EQUAL);break;case cu:i.depthFunc(i.GEQUAL);break;case uu:i.depthFunc(i.GREATER);break;case hu:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}F=oe}},setLocked:function(oe){L=oe},setClear:function(oe){te!==oe&&(i.clearDepth(oe),te=oe)},reset:function(){L=!1,re=null,F=null,te=null}}}function o(){let L=!1,re=null,F=null,te=null,oe=null,ke=null,Je=null,xt=null,kt=null;return{setTest:function(Qe){L||(Qe?de(i.STENCIL_TEST):$e(i.STENCIL_TEST))},setMask:function(Qe){re!==Qe&&!L&&(i.stencilMask(Qe),re=Qe)},setFunc:function(Qe,wt,sn){(F!==Qe||te!==wt||oe!==sn)&&(i.stencilFunc(Qe,wt,sn),F=Qe,te=wt,oe=sn)},setOp:function(Qe,wt,sn){(ke!==Qe||Je!==wt||xt!==sn)&&(i.stencilOp(Qe,wt,sn),ke=Qe,Je=wt,xt=sn)},setLocked:function(Qe){L=Qe},setClear:function(Qe){kt!==Qe&&(i.clearStencil(Qe),kt=Qe)},reset:function(){L=!1,re=null,F=null,te=null,oe=null,ke=null,Je=null,xt=null,kt=null}}}const a=new s,l=new r,c=new o,u=new WeakMap,h=new WeakMap;let d={},m={},g=new WeakMap,_=[],p=null,f=!1,y=null,M=null,S=null,R=null,w=null,A=null,D=null,k=new Ve(0,0,0),v=0,T=!1,q=null,$=null,C=null,W=null,H=null;const K=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let V=!1,Y=0;const j=i.getParameter(i.VERSION);j.indexOf("WebGL")!==-1?(Y=parseFloat(/^WebGL (\d)/.exec(j)[1]),V=Y>=1):j.indexOf("OpenGL ES")!==-1&&(Y=parseFloat(/^OpenGL ES (\d)/.exec(j)[1]),V=Y>=2);let ie=null,he={};const Ce=i.getParameter(i.SCISSOR_BOX),z=i.getParameter(i.VIEWPORT),J=new St().fromArray(Ce),ue=new St().fromArray(z);function Ee(L,re,F,te){const oe=new Uint8Array(4),ke=i.createTexture();i.bindTexture(L,ke),i.texParameteri(L,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(L,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let Je=0;Je<F;Je++)n&&(L===i.TEXTURE_3D||L===i.TEXTURE_2D_ARRAY)?i.texImage3D(re,0,i.RGBA,1,1,te,0,i.RGBA,i.UNSIGNED_BYTE,oe):i.texImage2D(re+Je,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,oe);return ke}const ge={};ge[i.TEXTURE_2D]=Ee(i.TEXTURE_2D,i.TEXTURE_2D,1),ge[i.TEXTURE_CUBE_MAP]=Ee(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),n&&(ge[i.TEXTURE_2D_ARRAY]=Ee(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),ge[i.TEXTURE_3D]=Ee(i.TEXTURE_3D,i.TEXTURE_3D,1,1)),a.setClear(0,0,0,1),l.setClear(1),c.setClear(0),de(i.DEPTH_TEST),l.setFunc(Fs),Ne(!1),ze(Ba),de(i.CULL_FACE),Me(Rn);function de(L){d[L]!==!0&&(i.enable(L),d[L]=!0)}function $e(L){d[L]!==!1&&(i.disable(L),d[L]=!1)}function be(L,re){return m[L]!==re?(i.bindFramebuffer(L,re),m[L]=re,n&&(L===i.DRAW_FRAMEBUFFER&&(m[i.FRAMEBUFFER]=re),L===i.FRAMEBUFFER&&(m[i.DRAW_FRAMEBUFFER]=re)),!0):!1}function I(L,re){let F=_,te=!1;if(L){F=g.get(re),F===void 0&&(F=[],g.set(re,F));const oe=L.textures;if(F.length!==oe.length||F[0]!==i.COLOR_ATTACHMENT0){for(let ke=0,Je=oe.length;ke<Je;ke++)F[ke]=i.COLOR_ATTACHMENT0+ke;F.length=oe.length,te=!0}}else F[0]!==i.BACK&&(F[0]=i.BACK,te=!0);if(te)if(t.isWebGL2)i.drawBuffers(F);else if(e.has("WEBGL_draw_buffers")===!0)e.get("WEBGL_draw_buffers").drawBuffersWEBGL(F);else throw new Error("THREE.WebGLState: Usage of gl.drawBuffers() require WebGL2 or WEBGL_draw_buffers extension")}function vt(L){return p!==L?(i.useProgram(L),p=L,!0):!1}const ve={[qn]:i.FUNC_ADD,[Wc]:i.FUNC_SUBTRACT,[Xc]:i.FUNC_REVERSE_SUBTRACT};if(n)ve[Ha]=i.MIN,ve[ka]=i.MAX;else{const L=e.get("EXT_blend_minmax");L!==null&&(ve[Ha]=L.MIN_EXT,ve[ka]=L.MAX_EXT)}const Be={[qc]:i.ZERO,[Yc]:i.ONE,[$c]:i.SRC_COLOR,[kr]:i.SRC_ALPHA,[eu]:i.SRC_ALPHA_SATURATE,[Jc]:i.DST_COLOR,[jc]:i.DST_ALPHA,[Kc]:i.ONE_MINUS_SRC_COLOR,[Vr]:i.ONE_MINUS_SRC_ALPHA,[Qc]:i.ONE_MINUS_DST_COLOR,[Zc]:i.ONE_MINUS_DST_ALPHA,[tu]:i.CONSTANT_COLOR,[nu]:i.ONE_MINUS_CONSTANT_COLOR,[iu]:i.CONSTANT_ALPHA,[su]:i.ONE_MINUS_CONSTANT_ALPHA};function Me(L,re,F,te,oe,ke,Je,xt,kt,Qe){if(L===Rn){f===!0&&($e(i.BLEND),f=!1);return}if(f===!1&&(de(i.BLEND),f=!0),L!==Vc){if(L!==y||Qe!==T){if((M!==qn||w!==qn)&&(i.blendEquation(i.FUNC_ADD),M=qn,w=qn),Qe)switch(L){case Kn:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Jn:i.blendFunc(i.ONE,i.ONE);break;case za:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Ga:i.blendFuncSeparate(i.ZERO,i.SRC_COLOR,i.ZERO,i.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",L);break}else switch(L){case Kn:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Jn:i.blendFunc(i.SRC_ALPHA,i.ONE);break;case za:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Ga:i.blendFunc(i.ZERO,i.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",L);break}S=null,R=null,A=null,D=null,k.set(0,0,0),v=0,y=L,T=Qe}return}oe=oe||re,ke=ke||F,Je=Je||te,(re!==M||oe!==w)&&(i.blendEquationSeparate(ve[re],ve[oe]),M=re,w=oe),(F!==S||te!==R||ke!==A||Je!==D)&&(i.blendFuncSeparate(Be[F],Be[te],Be[ke],Be[Je]),S=F,R=te,A=ke,D=Je),(xt.equals(k)===!1||kt!==v)&&(i.blendColor(xt.r,xt.g,xt.b,kt),k.copy(xt),v=kt),y=L,T=!1}function We(L,re){L.side===qt?$e(i.CULL_FACE):de(i.CULL_FACE);let F=L.side===Nt;re&&(F=!F),Ne(F),L.blending===Kn&&L.transparent===!1?Me(Rn):Me(L.blending,L.blendEquation,L.blendSrc,L.blendDst,L.blendEquationAlpha,L.blendSrcAlpha,L.blendDstAlpha,L.blendColor,L.blendAlpha,L.premultipliedAlpha),l.setFunc(L.depthFunc),l.setTest(L.depthTest),l.setMask(L.depthWrite),a.setMask(L.colorWrite);const te=L.stencilWrite;c.setTest(te),te&&(c.setMask(L.stencilWriteMask),c.setFunc(L.stencilFunc,L.stencilRef,L.stencilFuncMask),c.setOp(L.stencilFail,L.stencilZFail,L.stencilZPass)),b(L.polygonOffset,L.polygonOffsetFactor,L.polygonOffsetUnits),L.alphaToCoverage===!0?de(i.SAMPLE_ALPHA_TO_COVERAGE):$e(i.SAMPLE_ALPHA_TO_COVERAGE)}function Ne(L){q!==L&&(L?i.frontFace(i.CW):i.frontFace(i.CCW),q=L)}function ze(L){L!==Gc?(de(i.CULL_FACE),L!==$&&(L===Ba?i.cullFace(i.BACK):L===Hc?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):$e(i.CULL_FACE),$=L}function at(L){L!==C&&(V&&i.lineWidth(L),C=L)}function b(L,re,F){L?(de(i.POLYGON_OFFSET_FILL),(W!==re||H!==F)&&(i.polygonOffset(re,F),W=re,H=F)):$e(i.POLYGON_OFFSET_FILL)}function x(L){L?de(i.SCISSOR_TEST):$e(i.SCISSOR_TEST)}function G(L){L===void 0&&(L=i.TEXTURE0+K-1),ie!==L&&(i.activeTexture(L),ie=L)}function X(L,re,F){F===void 0&&(ie===null?F=i.TEXTURE0+K-1:F=ie);let te=he[F];te===void 0&&(te={type:void 0,texture:void 0},he[F]=te),(te.type!==L||te.texture!==re)&&(ie!==F&&(i.activeTexture(F),ie=F),i.bindTexture(L,re||ge[L]),te.type=L,te.texture=re)}function Q(){const L=he[ie];L!==void 0&&L.type!==void 0&&(i.bindTexture(L.type,null),L.type=void 0,L.texture=void 0)}function Z(){try{i.compressedTexImage2D.apply(i,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function Pe(){try{i.compressedTexImage3D.apply(i,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function ye(){try{i.texSubImage2D.apply(i,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function se(){try{i.texSubImage3D.apply(i,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function ae(){try{i.compressedTexSubImage2D.apply(i,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function Le(){try{i.compressedTexSubImage3D.apply(i,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function ee(){try{i.texStorage2D.apply(i,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function ct(){try{i.texStorage3D.apply(i,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function Ge(){try{i.texImage2D.apply(i,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function _e(){try{i.texImage3D.apply(i,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function fe(L){J.equals(L)===!1&&(i.scissor(L.x,L.y,L.z,L.w),J.copy(L))}function pe(L){ue.equals(L)===!1&&(i.viewport(L.x,L.y,L.z,L.w),ue.copy(L))}function Xe(L,re){let F=h.get(re);F===void 0&&(F=new WeakMap,h.set(re,F));let te=F.get(L);te===void 0&&(te=i.getUniformBlockIndex(re,L.name),F.set(L,te))}function we(L,re){const te=h.get(re).get(L);u.get(re)!==te&&(i.uniformBlockBinding(re,te,L.__bindingPointIndex),u.set(re,te))}function tt(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),n===!0&&(i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null)),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),d={},ie=null,he={},m={},g=new WeakMap,_=[],p=null,f=!1,y=null,M=null,S=null,R=null,w=null,A=null,D=null,k=new Ve(0,0,0),v=0,T=!1,q=null,$=null,C=null,W=null,H=null,J.set(0,0,i.canvas.width,i.canvas.height),ue.set(0,0,i.canvas.width,i.canvas.height),a.reset(),l.reset(),c.reset()}return{buffers:{color:a,depth:l,stencil:c},enable:de,disable:$e,bindFramebuffer:be,drawBuffers:I,useProgram:vt,setBlending:Me,setMaterial:We,setFlipSided:Ne,setCullFace:ze,setLineWidth:at,setPolygonOffset:b,setScissorTest:x,activeTexture:G,bindTexture:X,unbindTexture:Q,compressedTexImage2D:Z,compressedTexImage3D:Pe,texImage2D:Ge,texImage3D:_e,updateUBOMapping:Xe,uniformBlockBinding:we,texStorage2D:ee,texStorage3D:ct,texSubImage2D:ye,texSubImage3D:se,compressedTexSubImage2D:ae,compressedTexSubImage3D:Le,scissor:fe,viewport:pe,reset:tt}}function Vm(i,e,t,n,s,r,o){const a=s.isWebGL2,l=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,c=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),u=new He,h=new WeakMap;let d;const m=new WeakMap;let g=!1;try{g=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function _(b,x){return g?new OffscreenCanvas(b,x):Hs("canvas")}function p(b,x,G,X){let Q=1;const Z=at(b);if((Z.width>X||Z.height>X)&&(Q=X/Math.max(Z.width,Z.height)),Q<1||x===!0)if(typeof HTMLImageElement<"u"&&b instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&b instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&b instanceof ImageBitmap||typeof VideoFrame<"u"&&b instanceof VideoFrame){const Pe=x?jr:Math.floor,ye=Pe(Q*Z.width),se=Pe(Q*Z.height);d===void 0&&(d=_(ye,se));const ae=G?_(ye,se):d;return ae.width=ye,ae.height=se,ae.getContext("2d").drawImage(b,0,0,ye,se),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+Z.width+"x"+Z.height+") to ("+ye+"x"+se+")."),ae}else return"data"in b&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+Z.width+"x"+Z.height+")."),b;return b}function f(b){const x=at(b);return xo(x.width)&&xo(x.height)}function y(b){return a?!1:b.wrapS!==Jt||b.wrapT!==Jt||b.minFilter!==Mt&&b.minFilter!==Dt}function M(b,x){return b.generateMipmaps&&x&&b.minFilter!==Mt&&b.minFilter!==Dt}function S(b){i.generateMipmap(b)}function R(b,x,G,X,Q=!1){if(a===!1)return x;if(b!==null){if(i[b]!==void 0)return i[b];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+b+"'")}let Z=x;if(x===i.RED&&(G===i.FLOAT&&(Z=i.R32F),G===i.HALF_FLOAT&&(Z=i.R16F),G===i.UNSIGNED_BYTE&&(Z=i.R8)),x===i.RED_INTEGER&&(G===i.UNSIGNED_BYTE&&(Z=i.R8UI),G===i.UNSIGNED_SHORT&&(Z=i.R16UI),G===i.UNSIGNED_INT&&(Z=i.R32UI),G===i.BYTE&&(Z=i.R8I),G===i.SHORT&&(Z=i.R16I),G===i.INT&&(Z=i.R32I)),x===i.RG&&(G===i.FLOAT&&(Z=i.RG32F),G===i.HALF_FLOAT&&(Z=i.RG16F),G===i.UNSIGNED_BYTE&&(Z=i.RG8)),x===i.RG_INTEGER&&(G===i.UNSIGNED_BYTE&&(Z=i.RG8UI),G===i.UNSIGNED_SHORT&&(Z=i.RG16UI),G===i.UNSIGNED_INT&&(Z=i.RG32UI),G===i.BYTE&&(Z=i.RG8I),G===i.SHORT&&(Z=i.RG16I),G===i.INT&&(Z=i.RG32I)),x===i.RGBA){const Pe=Q?Os:je.getTransfer(X);G===i.FLOAT&&(Z=i.RGBA32F),G===i.HALF_FLOAT&&(Z=i.RGBA16F),G===i.UNSIGNED_BYTE&&(Z=Pe===et?i.SRGB8_ALPHA8:i.RGBA8),G===i.UNSIGNED_SHORT_4_4_4_4&&(Z=i.RGBA4),G===i.UNSIGNED_SHORT_5_5_5_1&&(Z=i.RGB5_A1)}return(Z===i.R16F||Z===i.R32F||Z===i.RG16F||Z===i.RG32F||Z===i.RGBA16F||Z===i.RGBA32F)&&e.get("EXT_color_buffer_float"),Z}function w(b,x,G){return M(b,G)===!0||b.isFramebufferTexture&&b.minFilter!==Mt&&b.minFilter!==Dt?Math.log2(Math.max(x.width,x.height))+1:b.mipmaps!==void 0&&b.mipmaps.length>0?b.mipmaps.length:b.isCompressedTexture&&Array.isArray(b.image)?x.mipmaps.length:1}function A(b){return b===Mt||b===Va||b===Oi?i.NEAREST:i.LINEAR}function D(b){const x=b.target;x.removeEventListener("dispose",D),v(x),x.isVideoTexture&&h.delete(x)}function k(b){const x=b.target;x.removeEventListener("dispose",k),q(x)}function v(b){const x=n.get(b);if(x.__webglInit===void 0)return;const G=b.source,X=m.get(G);if(X){const Q=X[x.__cacheKey];Q.usedTimes--,Q.usedTimes===0&&T(b),Object.keys(X).length===0&&m.delete(G)}n.remove(b)}function T(b){const x=n.get(b);i.deleteTexture(x.__webglTexture);const G=b.source,X=m.get(G);delete X[x.__cacheKey],o.memory.textures--}function q(b){const x=n.get(b);if(b.depthTexture&&b.depthTexture.dispose(),b.isWebGLCubeRenderTarget)for(let X=0;X<6;X++){if(Array.isArray(x.__webglFramebuffer[X]))for(let Q=0;Q<x.__webglFramebuffer[X].length;Q++)i.deleteFramebuffer(x.__webglFramebuffer[X][Q]);else i.deleteFramebuffer(x.__webglFramebuffer[X]);x.__webglDepthbuffer&&i.deleteRenderbuffer(x.__webglDepthbuffer[X])}else{if(Array.isArray(x.__webglFramebuffer))for(let X=0;X<x.__webglFramebuffer.length;X++)i.deleteFramebuffer(x.__webglFramebuffer[X]);else i.deleteFramebuffer(x.__webglFramebuffer);if(x.__webglDepthbuffer&&i.deleteRenderbuffer(x.__webglDepthbuffer),x.__webglMultisampledFramebuffer&&i.deleteFramebuffer(x.__webglMultisampledFramebuffer),x.__webglColorRenderbuffer)for(let X=0;X<x.__webglColorRenderbuffer.length;X++)x.__webglColorRenderbuffer[X]&&i.deleteRenderbuffer(x.__webglColorRenderbuffer[X]);x.__webglDepthRenderbuffer&&i.deleteRenderbuffer(x.__webglDepthRenderbuffer)}const G=b.textures;for(let X=0,Q=G.length;X<Q;X++){const Z=n.get(G[X]);Z.__webglTexture&&(i.deleteTexture(Z.__webglTexture),o.memory.textures--),n.remove(G[X])}n.remove(b)}let $=0;function C(){$=0}function W(){const b=$;return b>=s.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+b+" texture units while this GPU supports only "+s.maxTextures),$+=1,b}function H(b){const x=[];return x.push(b.wrapS),x.push(b.wrapT),x.push(b.wrapR||0),x.push(b.magFilter),x.push(b.minFilter),x.push(b.anisotropy),x.push(b.internalFormat),x.push(b.format),x.push(b.type),x.push(b.generateMipmaps),x.push(b.premultiplyAlpha),x.push(b.flipY),x.push(b.unpackAlignment),x.push(b.colorSpace),x.join()}function K(b,x){const G=n.get(b);if(b.isVideoTexture&&Ne(b),b.isRenderTargetTexture===!1&&b.version>0&&G.__version!==b.version){const X=b.image;if(X===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(X.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{ue(G,b,x);return}}t.bindTexture(i.TEXTURE_2D,G.__webglTexture,i.TEXTURE0+x)}function V(b,x){const G=n.get(b);if(b.version>0&&G.__version!==b.version){ue(G,b,x);return}t.bindTexture(i.TEXTURE_2D_ARRAY,G.__webglTexture,i.TEXTURE0+x)}function Y(b,x){const G=n.get(b);if(b.version>0&&G.__version!==b.version){ue(G,b,x);return}t.bindTexture(i.TEXTURE_3D,G.__webglTexture,i.TEXTURE0+x)}function j(b,x){const G=n.get(b);if(b.version>0&&G.__version!==b.version){Ee(G,b,x);return}t.bindTexture(i.TEXTURE_CUBE_MAP,G.__webglTexture,i.TEXTURE0+x)}const ie={[qr]:i.REPEAT,[Jt]:i.CLAMP_TO_EDGE,[Yr]:i.MIRRORED_REPEAT},he={[Mt]:i.NEAREST,[Va]:i.NEAREST_MIPMAP_NEAREST,[Oi]:i.NEAREST_MIPMAP_LINEAR,[Dt]:i.LINEAR,[sr]:i.LINEAR_MIPMAP_NEAREST,[$n]:i.LINEAR_MIPMAP_LINEAR},Ce={[Du]:i.NEVER,[Bu]:i.ALWAYS,[Uu]:i.LESS,[Cl]:i.LEQUAL,[Iu]:i.EQUAL,[Ou]:i.GEQUAL,[Nu]:i.GREATER,[Fu]:i.NOTEQUAL};function z(b,x,G){if(x.type===on&&e.has("OES_texture_float_linear")===!1&&(x.magFilter===Dt||x.magFilter===sr||x.magFilter===Oi||x.magFilter===$n||x.minFilter===Dt||x.minFilter===sr||x.minFilter===Oi||x.minFilter===$n)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),G?(i.texParameteri(b,i.TEXTURE_WRAP_S,ie[x.wrapS]),i.texParameteri(b,i.TEXTURE_WRAP_T,ie[x.wrapT]),(b===i.TEXTURE_3D||b===i.TEXTURE_2D_ARRAY)&&i.texParameteri(b,i.TEXTURE_WRAP_R,ie[x.wrapR]),i.texParameteri(b,i.TEXTURE_MAG_FILTER,he[x.magFilter]),i.texParameteri(b,i.TEXTURE_MIN_FILTER,he[x.minFilter])):(i.texParameteri(b,i.TEXTURE_WRAP_S,i.CLAMP_TO_EDGE),i.texParameteri(b,i.TEXTURE_WRAP_T,i.CLAMP_TO_EDGE),(b===i.TEXTURE_3D||b===i.TEXTURE_2D_ARRAY)&&i.texParameteri(b,i.TEXTURE_WRAP_R,i.CLAMP_TO_EDGE),(x.wrapS!==Jt||x.wrapT!==Jt)&&console.warn("THREE.WebGLRenderer: Texture is not power of two. Texture.wrapS and Texture.wrapT should be set to THREE.ClampToEdgeWrapping."),i.texParameteri(b,i.TEXTURE_MAG_FILTER,A(x.magFilter)),i.texParameteri(b,i.TEXTURE_MIN_FILTER,A(x.minFilter)),x.minFilter!==Mt&&x.minFilter!==Dt&&console.warn("THREE.WebGLRenderer: Texture is not power of two. Texture.minFilter should be set to THREE.NearestFilter or THREE.LinearFilter.")),x.compareFunction&&(i.texParameteri(b,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(b,i.TEXTURE_COMPARE_FUNC,Ce[x.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(x.magFilter===Mt||x.minFilter!==Oi&&x.minFilter!==$n||x.type===on&&e.has("OES_texture_float_linear")===!1||a===!1&&x.type===qi&&e.has("OES_texture_half_float_linear")===!1)return;if(x.anisotropy>1||n.get(x).__currentAnisotropy){const X=e.get("EXT_texture_filter_anisotropic");i.texParameterf(b,X.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(x.anisotropy,s.getMaxAnisotropy())),n.get(x).__currentAnisotropy=x.anisotropy}}}function J(b,x){let G=!1;b.__webglInit===void 0&&(b.__webglInit=!0,x.addEventListener("dispose",D));const X=x.source;let Q=m.get(X);Q===void 0&&(Q={},m.set(X,Q));const Z=H(x);if(Z!==b.__cacheKey){Q[Z]===void 0&&(Q[Z]={texture:i.createTexture(),usedTimes:0},o.memory.textures++,G=!0),Q[Z].usedTimes++;const Pe=Q[b.__cacheKey];Pe!==void 0&&(Q[b.__cacheKey].usedTimes--,Pe.usedTimes===0&&T(x)),b.__cacheKey=Z,b.__webglTexture=Q[Z].texture}return G}function ue(b,x,G){let X=i.TEXTURE_2D;(x.isDataArrayTexture||x.isCompressedArrayTexture)&&(X=i.TEXTURE_2D_ARRAY),x.isData3DTexture&&(X=i.TEXTURE_3D);const Q=J(b,x),Z=x.source;t.bindTexture(X,b.__webglTexture,i.TEXTURE0+G);const Pe=n.get(Z);if(Z.version!==Pe.__version||Q===!0){t.activeTexture(i.TEXTURE0+G);const ye=je.getPrimaries(je.workingColorSpace),se=x.colorSpace===An?null:je.getPrimaries(x.colorSpace),ae=x.colorSpace===An||ye===se?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,x.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,x.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,x.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,ae);const Le=y(x)&&f(x.image)===!1;let ee=p(x.image,Le,!1,s.maxTextureSize);ee=ze(x,ee);const ct=f(ee)||a,Ge=r.convert(x.format,x.colorSpace);let _e=r.convert(x.type),fe=R(x.internalFormat,Ge,_e,x.colorSpace,x.isVideoTexture);z(X,x,ct);let pe;const Xe=x.mipmaps,we=a&&x.isVideoTexture!==!0&&fe!==Rl,tt=Pe.__version===void 0||Q===!0,L=Z.dataReady,re=w(x,ee,ct);if(x.isDepthTexture)fe=i.DEPTH_COMPONENT,a?x.type===on?fe=i.DEPTH_COMPONENT32F:x.type===wn?fe=i.DEPTH_COMPONENT24:x.type===jn?fe=i.DEPTH24_STENCIL8:fe=i.DEPTH_COMPONENT16:x.type===on&&console.error("WebGLRenderer: Floating point depth texture requires WebGL2."),x.format===Zn&&fe===i.DEPTH_COMPONENT&&x.type!==ia&&x.type!==wn&&(console.warn("THREE.WebGLRenderer: Use UnsignedShortType or UnsignedIntType for DepthFormat DepthTexture."),x.type=wn,_e=r.convert(x.type)),x.format===Ri&&fe===i.DEPTH_COMPONENT&&(fe=i.DEPTH_STENCIL,x.type!==jn&&(console.warn("THREE.WebGLRenderer: Use UnsignedInt248Type for DepthStencilFormat DepthTexture."),x.type=jn,_e=r.convert(x.type))),tt&&(we?t.texStorage2D(i.TEXTURE_2D,1,fe,ee.width,ee.height):t.texImage2D(i.TEXTURE_2D,0,fe,ee.width,ee.height,0,Ge,_e,null));else if(x.isDataTexture)if(Xe.length>0&&ct){we&&tt&&t.texStorage2D(i.TEXTURE_2D,re,fe,Xe[0].width,Xe[0].height);for(let F=0,te=Xe.length;F<te;F++)pe=Xe[F],we?L&&t.texSubImage2D(i.TEXTURE_2D,F,0,0,pe.width,pe.height,Ge,_e,pe.data):t.texImage2D(i.TEXTURE_2D,F,fe,pe.width,pe.height,0,Ge,_e,pe.data);x.generateMipmaps=!1}else we?(tt&&t.texStorage2D(i.TEXTURE_2D,re,fe,ee.width,ee.height),L&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,ee.width,ee.height,Ge,_e,ee.data)):t.texImage2D(i.TEXTURE_2D,0,fe,ee.width,ee.height,0,Ge,_e,ee.data);else if(x.isCompressedTexture)if(x.isCompressedArrayTexture){we&&tt&&t.texStorage3D(i.TEXTURE_2D_ARRAY,re,fe,Xe[0].width,Xe[0].height,ee.depth);for(let F=0,te=Xe.length;F<te;F++)pe=Xe[F],x.format!==Qt?Ge!==null?we?L&&t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,F,0,0,0,pe.width,pe.height,ee.depth,Ge,pe.data,0,0):t.compressedTexImage3D(i.TEXTURE_2D_ARRAY,F,fe,pe.width,pe.height,ee.depth,0,pe.data,0,0):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):we?L&&t.texSubImage3D(i.TEXTURE_2D_ARRAY,F,0,0,0,pe.width,pe.height,ee.depth,Ge,_e,pe.data):t.texImage3D(i.TEXTURE_2D_ARRAY,F,fe,pe.width,pe.height,ee.depth,0,Ge,_e,pe.data)}else{we&&tt&&t.texStorage2D(i.TEXTURE_2D,re,fe,Xe[0].width,Xe[0].height);for(let F=0,te=Xe.length;F<te;F++)pe=Xe[F],x.format!==Qt?Ge!==null?we?L&&t.compressedTexSubImage2D(i.TEXTURE_2D,F,0,0,pe.width,pe.height,Ge,pe.data):t.compressedTexImage2D(i.TEXTURE_2D,F,fe,pe.width,pe.height,0,pe.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):we?L&&t.texSubImage2D(i.TEXTURE_2D,F,0,0,pe.width,pe.height,Ge,_e,pe.data):t.texImage2D(i.TEXTURE_2D,F,fe,pe.width,pe.height,0,Ge,_e,pe.data)}else if(x.isDataArrayTexture)we?(tt&&t.texStorage3D(i.TEXTURE_2D_ARRAY,re,fe,ee.width,ee.height,ee.depth),L&&t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,ee.width,ee.height,ee.depth,Ge,_e,ee.data)):t.texImage3D(i.TEXTURE_2D_ARRAY,0,fe,ee.width,ee.height,ee.depth,0,Ge,_e,ee.data);else if(x.isData3DTexture)we?(tt&&t.texStorage3D(i.TEXTURE_3D,re,fe,ee.width,ee.height,ee.depth),L&&t.texSubImage3D(i.TEXTURE_3D,0,0,0,0,ee.width,ee.height,ee.depth,Ge,_e,ee.data)):t.texImage3D(i.TEXTURE_3D,0,fe,ee.width,ee.height,ee.depth,0,Ge,_e,ee.data);else if(x.isFramebufferTexture){if(tt)if(we)t.texStorage2D(i.TEXTURE_2D,re,fe,ee.width,ee.height);else{let F=ee.width,te=ee.height;for(let oe=0;oe<re;oe++)t.texImage2D(i.TEXTURE_2D,oe,fe,F,te,0,Ge,_e,null),F>>=1,te>>=1}}else if(Xe.length>0&&ct){if(we&&tt){const F=at(Xe[0]);t.texStorage2D(i.TEXTURE_2D,re,fe,F.width,F.height)}for(let F=0,te=Xe.length;F<te;F++)pe=Xe[F],we?L&&t.texSubImage2D(i.TEXTURE_2D,F,0,0,Ge,_e,pe):t.texImage2D(i.TEXTURE_2D,F,fe,Ge,_e,pe);x.generateMipmaps=!1}else if(we){if(tt){const F=at(ee);t.texStorage2D(i.TEXTURE_2D,re,fe,F.width,F.height)}L&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,Ge,_e,ee)}else t.texImage2D(i.TEXTURE_2D,0,fe,Ge,_e,ee);M(x,ct)&&S(X),Pe.__version=Z.version,x.onUpdate&&x.onUpdate(x)}b.__version=x.version}function Ee(b,x,G){if(x.image.length!==6)return;const X=J(b,x),Q=x.source;t.bindTexture(i.TEXTURE_CUBE_MAP,b.__webglTexture,i.TEXTURE0+G);const Z=n.get(Q);if(Q.version!==Z.__version||X===!0){t.activeTexture(i.TEXTURE0+G);const Pe=je.getPrimaries(je.workingColorSpace),ye=x.colorSpace===An?null:je.getPrimaries(x.colorSpace),se=x.colorSpace===An||Pe===ye?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,x.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,x.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,x.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,se);const ae=x.isCompressedTexture||x.image[0].isCompressedTexture,Le=x.image[0]&&x.image[0].isDataTexture,ee=[];for(let F=0;F<6;F++)!ae&&!Le?ee[F]=p(x.image[F],!1,!0,s.maxCubemapSize):ee[F]=Le?x.image[F].image:x.image[F],ee[F]=ze(x,ee[F]);const ct=ee[0],Ge=f(ct)||a,_e=r.convert(x.format,x.colorSpace),fe=r.convert(x.type),pe=R(x.internalFormat,_e,fe,x.colorSpace),Xe=a&&x.isVideoTexture!==!0,we=Z.__version===void 0||X===!0,tt=Q.dataReady;let L=w(x,ct,Ge);z(i.TEXTURE_CUBE_MAP,x,Ge);let re;if(ae){Xe&&we&&t.texStorage2D(i.TEXTURE_CUBE_MAP,L,pe,ct.width,ct.height);for(let F=0;F<6;F++){re=ee[F].mipmaps;for(let te=0;te<re.length;te++){const oe=re[te];x.format!==Qt?_e!==null?Xe?tt&&t.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+F,te,0,0,oe.width,oe.height,_e,oe.data):t.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+F,te,pe,oe.width,oe.height,0,oe.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):Xe?tt&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+F,te,0,0,oe.width,oe.height,_e,fe,oe.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+F,te,pe,oe.width,oe.height,0,_e,fe,oe.data)}}}else{if(re=x.mipmaps,Xe&&we){re.length>0&&L++;const F=at(ee[0]);t.texStorage2D(i.TEXTURE_CUBE_MAP,L,pe,F.width,F.height)}for(let F=0;F<6;F++)if(Le){Xe?tt&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+F,0,0,0,ee[F].width,ee[F].height,_e,fe,ee[F].data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+F,0,pe,ee[F].width,ee[F].height,0,_e,fe,ee[F].data);for(let te=0;te<re.length;te++){const ke=re[te].image[F].image;Xe?tt&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+F,te+1,0,0,ke.width,ke.height,_e,fe,ke.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+F,te+1,pe,ke.width,ke.height,0,_e,fe,ke.data)}}else{Xe?tt&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+F,0,0,0,_e,fe,ee[F]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+F,0,pe,_e,fe,ee[F]);for(let te=0;te<re.length;te++){const oe=re[te];Xe?tt&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+F,te+1,0,0,_e,fe,oe.image[F]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+F,te+1,pe,_e,fe,oe.image[F])}}}M(x,Ge)&&S(i.TEXTURE_CUBE_MAP),Z.__version=Q.version,x.onUpdate&&x.onUpdate(x)}b.__version=x.version}function ge(b,x,G,X,Q,Z){const Pe=r.convert(G.format,G.colorSpace),ye=r.convert(G.type),se=R(G.internalFormat,Pe,ye,G.colorSpace);if(!n.get(x).__hasExternalTextures){const Le=Math.max(1,x.width>>Z),ee=Math.max(1,x.height>>Z);Q===i.TEXTURE_3D||Q===i.TEXTURE_2D_ARRAY?t.texImage3D(Q,Z,se,Le,ee,x.depth,0,Pe,ye,null):t.texImage2D(Q,Z,se,Le,ee,0,Pe,ye,null)}t.bindFramebuffer(i.FRAMEBUFFER,b),We(x)?l.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,X,Q,n.get(G).__webglTexture,0,Me(x)):(Q===i.TEXTURE_2D||Q>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&Q<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,X,Q,n.get(G).__webglTexture,Z),t.bindFramebuffer(i.FRAMEBUFFER,null)}function de(b,x,G){if(i.bindRenderbuffer(i.RENDERBUFFER,b),x.depthBuffer&&!x.stencilBuffer){let X=a===!0?i.DEPTH_COMPONENT24:i.DEPTH_COMPONENT16;if(G||We(x)){const Q=x.depthTexture;Q&&Q.isDepthTexture&&(Q.type===on?X=i.DEPTH_COMPONENT32F:Q.type===wn&&(X=i.DEPTH_COMPONENT24));const Z=Me(x);We(x)?l.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,Z,X,x.width,x.height):i.renderbufferStorageMultisample(i.RENDERBUFFER,Z,X,x.width,x.height)}else i.renderbufferStorage(i.RENDERBUFFER,X,x.width,x.height);i.framebufferRenderbuffer(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.RENDERBUFFER,b)}else if(x.depthBuffer&&x.stencilBuffer){const X=Me(x);G&&We(x)===!1?i.renderbufferStorageMultisample(i.RENDERBUFFER,X,i.DEPTH24_STENCIL8,x.width,x.height):We(x)?l.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,X,i.DEPTH24_STENCIL8,x.width,x.height):i.renderbufferStorage(i.RENDERBUFFER,i.DEPTH_STENCIL,x.width,x.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.RENDERBUFFER,b)}else{const X=x.textures;for(let Q=0;Q<X.length;Q++){const Z=X[Q],Pe=r.convert(Z.format,Z.colorSpace),ye=r.convert(Z.type),se=R(Z.internalFormat,Pe,ye,Z.colorSpace),ae=Me(x);G&&We(x)===!1?i.renderbufferStorageMultisample(i.RENDERBUFFER,ae,se,x.width,x.height):We(x)?l.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,ae,se,x.width,x.height):i.renderbufferStorage(i.RENDERBUFFER,se,x.width,x.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function $e(b,x){if(x&&x.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(i.FRAMEBUFFER,b),!(x.depthTexture&&x.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");(!n.get(x.depthTexture).__webglTexture||x.depthTexture.image.width!==x.width||x.depthTexture.image.height!==x.height)&&(x.depthTexture.image.width=x.width,x.depthTexture.image.height=x.height,x.depthTexture.needsUpdate=!0),K(x.depthTexture,0);const X=n.get(x.depthTexture).__webglTexture,Q=Me(x);if(x.depthTexture.format===Zn)We(x)?l.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,X,0,Q):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,X,0);else if(x.depthTexture.format===Ri)We(x)?l.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,X,0,Q):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,X,0);else throw new Error("Unknown depthTexture format")}function be(b){const x=n.get(b),G=b.isWebGLCubeRenderTarget===!0;if(b.depthTexture&&!x.__autoAllocateDepthBuffer){if(G)throw new Error("target.depthTexture not supported in Cube render targets");$e(x.__webglFramebuffer,b)}else if(G){x.__webglDepthbuffer=[];for(let X=0;X<6;X++)t.bindFramebuffer(i.FRAMEBUFFER,x.__webglFramebuffer[X]),x.__webglDepthbuffer[X]=i.createRenderbuffer(),de(x.__webglDepthbuffer[X],b,!1)}else t.bindFramebuffer(i.FRAMEBUFFER,x.__webglFramebuffer),x.__webglDepthbuffer=i.createRenderbuffer(),de(x.__webglDepthbuffer,b,!1);t.bindFramebuffer(i.FRAMEBUFFER,null)}function I(b,x,G){const X=n.get(b);x!==void 0&&ge(X.__webglFramebuffer,b,b.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),G!==void 0&&be(b)}function vt(b){const x=b.texture,G=n.get(b),X=n.get(x);b.addEventListener("dispose",k);const Q=b.textures,Z=b.isWebGLCubeRenderTarget===!0,Pe=Q.length>1,ye=f(b)||a;if(Pe||(X.__webglTexture===void 0&&(X.__webglTexture=i.createTexture()),X.__version=x.version,o.memory.textures++),Z){G.__webglFramebuffer=[];for(let se=0;se<6;se++)if(a&&x.mipmaps&&x.mipmaps.length>0){G.__webglFramebuffer[se]=[];for(let ae=0;ae<x.mipmaps.length;ae++)G.__webglFramebuffer[se][ae]=i.createFramebuffer()}else G.__webglFramebuffer[se]=i.createFramebuffer()}else{if(a&&x.mipmaps&&x.mipmaps.length>0){G.__webglFramebuffer=[];for(let se=0;se<x.mipmaps.length;se++)G.__webglFramebuffer[se]=i.createFramebuffer()}else G.__webglFramebuffer=i.createFramebuffer();if(Pe)if(s.drawBuffers)for(let se=0,ae=Q.length;se<ae;se++){const Le=n.get(Q[se]);Le.__webglTexture===void 0&&(Le.__webglTexture=i.createTexture(),o.memory.textures++)}else console.warn("THREE.WebGLRenderer: WebGLMultipleRenderTargets can only be used with WebGL2 or WEBGL_draw_buffers extension.");if(a&&b.samples>0&&We(b)===!1){G.__webglMultisampledFramebuffer=i.createFramebuffer(),G.__webglColorRenderbuffer=[],t.bindFramebuffer(i.FRAMEBUFFER,G.__webglMultisampledFramebuffer);for(let se=0;se<Q.length;se++){const ae=Q[se];G.__webglColorRenderbuffer[se]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,G.__webglColorRenderbuffer[se]);const Le=r.convert(ae.format,ae.colorSpace),ee=r.convert(ae.type),ct=R(ae.internalFormat,Le,ee,ae.colorSpace,b.isXRRenderTarget===!0),Ge=Me(b);i.renderbufferStorageMultisample(i.RENDERBUFFER,Ge,ct,b.width,b.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+se,i.RENDERBUFFER,G.__webglColorRenderbuffer[se])}i.bindRenderbuffer(i.RENDERBUFFER,null),b.depthBuffer&&(G.__webglDepthRenderbuffer=i.createRenderbuffer(),de(G.__webglDepthRenderbuffer,b,!0)),t.bindFramebuffer(i.FRAMEBUFFER,null)}}if(Z){t.bindTexture(i.TEXTURE_CUBE_MAP,X.__webglTexture),z(i.TEXTURE_CUBE_MAP,x,ye);for(let se=0;se<6;se++)if(a&&x.mipmaps&&x.mipmaps.length>0)for(let ae=0;ae<x.mipmaps.length;ae++)ge(G.__webglFramebuffer[se][ae],b,x,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+se,ae);else ge(G.__webglFramebuffer[se],b,x,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+se,0);M(x,ye)&&S(i.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(Pe){for(let se=0,ae=Q.length;se<ae;se++){const Le=Q[se],ee=n.get(Le);t.bindTexture(i.TEXTURE_2D,ee.__webglTexture),z(i.TEXTURE_2D,Le,ye),ge(G.__webglFramebuffer,b,Le,i.COLOR_ATTACHMENT0+se,i.TEXTURE_2D,0),M(Le,ye)&&S(i.TEXTURE_2D)}t.unbindTexture()}else{let se=i.TEXTURE_2D;if((b.isWebGL3DRenderTarget||b.isWebGLArrayRenderTarget)&&(a?se=b.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY:console.error("THREE.WebGLTextures: THREE.Data3DTexture and THREE.DataArrayTexture only supported with WebGL2.")),t.bindTexture(se,X.__webglTexture),z(se,x,ye),a&&x.mipmaps&&x.mipmaps.length>0)for(let ae=0;ae<x.mipmaps.length;ae++)ge(G.__webglFramebuffer[ae],b,x,i.COLOR_ATTACHMENT0,se,ae);else ge(G.__webglFramebuffer,b,x,i.COLOR_ATTACHMENT0,se,0);M(x,ye)&&S(se),t.unbindTexture()}b.depthBuffer&&be(b)}function ve(b){const x=f(b)||a,G=b.textures;for(let X=0,Q=G.length;X<Q;X++){const Z=G[X];if(M(Z,x)){const Pe=b.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:i.TEXTURE_2D,ye=n.get(Z).__webglTexture;t.bindTexture(Pe,ye),S(Pe),t.unbindTexture()}}}function Be(b){if(a&&b.samples>0&&We(b)===!1){const x=b.textures,G=b.width,X=b.height;let Q=i.COLOR_BUFFER_BIT;const Z=[],Pe=b.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ye=n.get(b),se=x.length>1;if(se)for(let ae=0;ae<x.length;ae++)t.bindFramebuffer(i.FRAMEBUFFER,ye.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ae,i.RENDERBUFFER,null),t.bindFramebuffer(i.FRAMEBUFFER,ye.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+ae,i.TEXTURE_2D,null,0);t.bindFramebuffer(i.READ_FRAMEBUFFER,ye.__webglMultisampledFramebuffer),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,ye.__webglFramebuffer);for(let ae=0;ae<x.length;ae++){Z.push(i.COLOR_ATTACHMENT0+ae),b.depthBuffer&&Z.push(Pe);const Le=ye.__ignoreDepthValues!==void 0?ye.__ignoreDepthValues:!1;if(Le===!1&&(b.depthBuffer&&(Q|=i.DEPTH_BUFFER_BIT),b.stencilBuffer&&(Q|=i.STENCIL_BUFFER_BIT)),se&&i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,ye.__webglColorRenderbuffer[ae]),Le===!0&&(i.invalidateFramebuffer(i.READ_FRAMEBUFFER,[Pe]),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[Pe])),se){const ee=n.get(x[ae]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,ee,0)}i.blitFramebuffer(0,0,G,X,0,0,G,X,Q,i.NEAREST),c&&i.invalidateFramebuffer(i.READ_FRAMEBUFFER,Z)}if(t.bindFramebuffer(i.READ_FRAMEBUFFER,null),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),se)for(let ae=0;ae<x.length;ae++){t.bindFramebuffer(i.FRAMEBUFFER,ye.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ae,i.RENDERBUFFER,ye.__webglColorRenderbuffer[ae]);const Le=n.get(x[ae]).__webglTexture;t.bindFramebuffer(i.FRAMEBUFFER,ye.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+ae,i.TEXTURE_2D,Le,0)}t.bindFramebuffer(i.DRAW_FRAMEBUFFER,ye.__webglMultisampledFramebuffer)}}function Me(b){return Math.min(s.maxSamples,b.samples)}function We(b){const x=n.get(b);return a&&b.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&x.__useRenderToTexture!==!1}function Ne(b){const x=o.render.frame;h.get(b)!==x&&(h.set(b,x),b.update())}function ze(b,x){const G=b.colorSpace,X=b.format,Q=b.type;return b.isCompressedTexture===!0||b.isVideoTexture===!0||b.format===$r||G!==In&&G!==An&&(je.getTransfer(G)===et?a===!1?e.has("EXT_sRGB")===!0&&X===Qt?(b.format=$r,b.minFilter=Dt,b.generateMipmaps=!1):x=Ll.sRGBToLinear(x):(X!==Qt||Q!==Pn)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",G)),x}function at(b){return typeof HTMLImageElement<"u"&&b instanceof HTMLImageElement?(u.width=b.naturalWidth||b.width,u.height=b.naturalHeight||b.height):typeof VideoFrame<"u"&&b instanceof VideoFrame?(u.width=b.displayWidth,u.height=b.displayHeight):(u.width=b.width,u.height=b.height),u}this.allocateTextureUnit=W,this.resetTextureUnits=C,this.setTexture2D=K,this.setTexture2DArray=V,this.setTexture3D=Y,this.setTextureCube=j,this.rebindTextures=I,this.setupRenderTarget=vt,this.updateRenderTargetMipmap=ve,this.updateMultisampleRenderTarget=Be,this.setupDepthRenderbuffer=be,this.setupFrameBufferTexture=ge,this.useMultisampledRTT=We}function Wm(i,e,t){const n=t.isWebGL2;function s(r,o=An){let a;const l=je.getTransfer(o);if(r===Pn)return i.UNSIGNED_BYTE;if(r===Sl)return i.UNSIGNED_SHORT_4_4_4_4;if(r===El)return i.UNSIGNED_SHORT_5_5_5_1;if(r===yu)return i.BYTE;if(r===Su)return i.SHORT;if(r===ia)return i.UNSIGNED_SHORT;if(r===yl)return i.INT;if(r===wn)return i.UNSIGNED_INT;if(r===on)return i.FLOAT;if(r===qi)return n?i.HALF_FLOAT:(a=e.get("OES_texture_half_float"),a!==null?a.HALF_FLOAT_OES:null);if(r===Eu)return i.ALPHA;if(r===Qt)return i.RGBA;if(r===bu)return i.LUMINANCE;if(r===Tu)return i.LUMINANCE_ALPHA;if(r===Zn)return i.DEPTH_COMPONENT;if(r===Ri)return i.DEPTH_STENCIL;if(r===$r)return a=e.get("EXT_sRGB"),a!==null?a.SRGB_ALPHA_EXT:null;if(r===bl)return i.RED;if(r===Tl)return i.RED_INTEGER;if(r===Au)return i.RG;if(r===Al)return i.RG_INTEGER;if(r===wl)return i.RGBA_INTEGER;if(r===rr||r===ar||r===or||r===lr)if(l===et)if(a=e.get("WEBGL_compressed_texture_s3tc_srgb"),a!==null){if(r===rr)return a.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(r===ar)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(r===or)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(r===lr)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(a=e.get("WEBGL_compressed_texture_s3tc"),a!==null){if(r===rr)return a.COMPRESSED_RGB_S3TC_DXT1_EXT;if(r===ar)return a.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(r===or)return a.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(r===lr)return a.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(r===Wa||r===Xa||r===qa||r===Ya)if(a=e.get("WEBGL_compressed_texture_pvrtc"),a!==null){if(r===Wa)return a.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(r===Xa)return a.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(r===qa)return a.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(r===Ya)return a.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(r===Rl)return a=e.get("WEBGL_compressed_texture_etc1"),a!==null?a.COMPRESSED_RGB_ETC1_WEBGL:null;if(r===$a||r===Ka)if(a=e.get("WEBGL_compressed_texture_etc"),a!==null){if(r===$a)return l===et?a.COMPRESSED_SRGB8_ETC2:a.COMPRESSED_RGB8_ETC2;if(r===Ka)return l===et?a.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:a.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(r===ja||r===Za||r===Ja||r===Qa||r===eo||r===to||r===no||r===io||r===so||r===ro||r===ao||r===oo||r===lo||r===co)if(a=e.get("WEBGL_compressed_texture_astc"),a!==null){if(r===ja)return l===et?a.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:a.COMPRESSED_RGBA_ASTC_4x4_KHR;if(r===Za)return l===et?a.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:a.COMPRESSED_RGBA_ASTC_5x4_KHR;if(r===Ja)return l===et?a.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:a.COMPRESSED_RGBA_ASTC_5x5_KHR;if(r===Qa)return l===et?a.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:a.COMPRESSED_RGBA_ASTC_6x5_KHR;if(r===eo)return l===et?a.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:a.COMPRESSED_RGBA_ASTC_6x6_KHR;if(r===to)return l===et?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:a.COMPRESSED_RGBA_ASTC_8x5_KHR;if(r===no)return l===et?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:a.COMPRESSED_RGBA_ASTC_8x6_KHR;if(r===io)return l===et?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:a.COMPRESSED_RGBA_ASTC_8x8_KHR;if(r===so)return l===et?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:a.COMPRESSED_RGBA_ASTC_10x5_KHR;if(r===ro)return l===et?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:a.COMPRESSED_RGBA_ASTC_10x6_KHR;if(r===ao)return l===et?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:a.COMPRESSED_RGBA_ASTC_10x8_KHR;if(r===oo)return l===et?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:a.COMPRESSED_RGBA_ASTC_10x10_KHR;if(r===lo)return l===et?a.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:a.COMPRESSED_RGBA_ASTC_12x10_KHR;if(r===co)return l===et?a.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:a.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(r===cr||r===uo||r===ho)if(a=e.get("EXT_texture_compression_bptc"),a!==null){if(r===cr)return l===et?a.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:a.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(r===uo)return a.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(r===ho)return a.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(r===wu||r===fo||r===po||r===mo)if(a=e.get("EXT_texture_compression_rgtc"),a!==null){if(r===cr)return a.COMPRESSED_RED_RGTC1_EXT;if(r===fo)return a.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(r===po)return a.COMPRESSED_RED_GREEN_RGTC2_EXT;if(r===mo)return a.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return r===jn?n?i.UNSIGNED_INT_24_8:(a=e.get("WEBGL_depth_texture"),a!==null?a.UNSIGNED_INT_24_8_WEBGL:null):i[r]!==void 0?i[r]:null}return{convert:s}}class Xm extends Gt{constructor(e=[]){super(),this.isArrayCamera=!0,this.cameras=e}}class gt extends _t{constructor(){super(),this.isGroup=!0,this.type="Group"}}const qm={type:"move"};class Nr{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new gt,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new gt,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new P,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new P),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new gt,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new P,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new P),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let s=null,r=null,o=null;const a=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){o=!0;for(const _ of e.hand.values()){const p=t.getJointPose(_,n),f=this._getHandJoint(c,_);p!==null&&(f.matrix.fromArray(p.transform.matrix),f.matrix.decompose(f.position,f.rotation,f.scale),f.matrixWorldNeedsUpdate=!0,f.jointRadius=p.radius),f.visible=p!==null}const u=c.joints["index-finger-tip"],h=c.joints["thumb-tip"],d=u.position.distanceTo(h.position),m=.02,g=.005;c.inputState.pinching&&d>m+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&d<=m-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1));a!==null&&(s=t.getPose(e.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(a.matrix.fromArray(s.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,s.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(s.linearVelocity)):a.hasLinearVelocity=!1,s.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(s.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(qm)))}return a!==null&&(a.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=o!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const n=new gt;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}}const Ym=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,$m=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepthEXT = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepthEXT = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class Km{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t,n){if(this.texture===null){const s=new Pt,r=e.properties.get(s);r.__webglTexture=t.texture,(t.depthNear!=n.depthNear||t.depthFar!=n.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=s}}render(e,t){if(this.texture!==null){if(this.mesh===null){const n=t.cameras[0].viewport,s=new Un({extensions:{fragDepth:!0},vertexShader:Ym,fragmentShader:$m,uniforms:{depthColor:{value:this.texture},depthWidth:{value:n.z},depthHeight:{value:n.w}}});this.mesh=new Ye(new ei(20,20),s)}e.render(this.mesh,t)}}reset(){this.texture=null,this.mesh=null}}class jm extends Li{constructor(e,t){super();const n=this;let s=null,r=1,o=null,a="local-floor",l=1,c=null,u=null,h=null,d=null,m=null,g=null;const _=new Km,p=t.getContextAttributes();let f=null,y=null;const M=[],S=[],R=new He;let w=null;const A=new Gt;A.layers.enable(1),A.viewport=new St;const D=new Gt;D.layers.enable(2),D.viewport=new St;const k=[A,D],v=new Xm;v.layers.enable(1),v.layers.enable(2);let T=null,q=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(z){let J=M[z];return J===void 0&&(J=new Nr,M[z]=J),J.getTargetRaySpace()},this.getControllerGrip=function(z){let J=M[z];return J===void 0&&(J=new Nr,M[z]=J),J.getGripSpace()},this.getHand=function(z){let J=M[z];return J===void 0&&(J=new Nr,M[z]=J),J.getHandSpace()};function $(z){const J=S.indexOf(z.inputSource);if(J===-1)return;const ue=M[J];ue!==void 0&&(ue.update(z.inputSource,z.frame,c||o),ue.dispatchEvent({type:z.type,data:z.inputSource}))}function C(){s.removeEventListener("select",$),s.removeEventListener("selectstart",$),s.removeEventListener("selectend",$),s.removeEventListener("squeeze",$),s.removeEventListener("squeezestart",$),s.removeEventListener("squeezeend",$),s.removeEventListener("end",C),s.removeEventListener("inputsourceschange",W);for(let z=0;z<M.length;z++){const J=S[z];J!==null&&(S[z]=null,M[z].disconnect(J))}T=null,q=null,_.reset(),e.setRenderTarget(f),m=null,d=null,h=null,s=null,y=null,Ce.stop(),n.isPresenting=!1,e.setPixelRatio(w),e.setSize(R.width,R.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(z){r=z,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(z){a=z,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||o},this.setReferenceSpace=function(z){c=z},this.getBaseLayer=function(){return d!==null?d:m},this.getBinding=function(){return h},this.getFrame=function(){return g},this.getSession=function(){return s},this.setSession=async function(z){if(s=z,s!==null){if(f=e.getRenderTarget(),s.addEventListener("select",$),s.addEventListener("selectstart",$),s.addEventListener("selectend",$),s.addEventListener("squeeze",$),s.addEventListener("squeezestart",$),s.addEventListener("squeezeend",$),s.addEventListener("end",C),s.addEventListener("inputsourceschange",W),p.xrCompatible!==!0&&await t.makeXRCompatible(),w=e.getPixelRatio(),e.getSize(R),s.renderState.layers===void 0||e.capabilities.isWebGL2===!1){const J={antialias:s.renderState.layers===void 0?p.antialias:!0,alpha:!0,depth:p.depth,stencil:p.stencil,framebufferScaleFactor:r};m=new XRWebGLLayer(s,t,J),s.updateRenderState({baseLayer:m}),e.setPixelRatio(1),e.setSize(m.framebufferWidth,m.framebufferHeight,!1),y=new Qn(m.framebufferWidth,m.framebufferHeight,{format:Qt,type:Pn,colorSpace:e.outputColorSpace,stencilBuffer:p.stencil})}else{let J=null,ue=null,Ee=null;p.depth&&(Ee=p.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,J=p.stencil?Ri:Zn,ue=p.stencil?jn:wn);const ge={colorFormat:t.RGBA8,depthFormat:Ee,scaleFactor:r};h=new XRWebGLBinding(s,t),d=h.createProjectionLayer(ge),s.updateRenderState({layers:[d]}),e.setPixelRatio(1),e.setSize(d.textureWidth,d.textureHeight,!1),y=new Qn(d.textureWidth,d.textureHeight,{format:Qt,type:Pn,depthTexture:new Vl(d.textureWidth,d.textureHeight,ue,void 0,void 0,void 0,void 0,void 0,void 0,J),stencilBuffer:p.stencil,colorSpace:e.outputColorSpace,samples:p.antialias?4:0});const de=e.properties.get(y);de.__ignoreDepthValues=d.ignoreDepthValues}y.isXRRenderTarget=!0,this.setFoveation(l),c=null,o=await s.requestReferenceSpace(a),Ce.setContext(s),Ce.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode};function W(z){for(let J=0;J<z.removed.length;J++){const ue=z.removed[J],Ee=S.indexOf(ue);Ee>=0&&(S[Ee]=null,M[Ee].disconnect(ue))}for(let J=0;J<z.added.length;J++){const ue=z.added[J];let Ee=S.indexOf(ue);if(Ee===-1){for(let de=0;de<M.length;de++)if(de>=S.length){S.push(ue),Ee=de;break}else if(S[de]===null){S[de]=ue,Ee=de;break}if(Ee===-1)break}const ge=M[Ee];ge&&ge.connect(ue)}}const H=new P,K=new P;function V(z,J,ue){H.setFromMatrixPosition(J.matrixWorld),K.setFromMatrixPosition(ue.matrixWorld);const Ee=H.distanceTo(K),ge=J.projectionMatrix.elements,de=ue.projectionMatrix.elements,$e=ge[14]/(ge[10]-1),be=ge[14]/(ge[10]+1),I=(ge[9]+1)/ge[5],vt=(ge[9]-1)/ge[5],ve=(ge[8]-1)/ge[0],Be=(de[8]+1)/de[0],Me=$e*ve,We=$e*Be,Ne=Ee/(-ve+Be),ze=Ne*-ve;J.matrixWorld.decompose(z.position,z.quaternion,z.scale),z.translateX(ze),z.translateZ(Ne),z.matrixWorld.compose(z.position,z.quaternion,z.scale),z.matrixWorldInverse.copy(z.matrixWorld).invert();const at=$e+Ne,b=be+Ne,x=Me-ze,G=We+(Ee-ze),X=I*be/b*at,Q=vt*be/b*at;z.projectionMatrix.makePerspective(x,G,X,Q,at,b),z.projectionMatrixInverse.copy(z.projectionMatrix).invert()}function Y(z,J){J===null?z.matrixWorld.copy(z.matrix):z.matrixWorld.multiplyMatrices(J.matrixWorld,z.matrix),z.matrixWorldInverse.copy(z.matrixWorld).invert()}this.updateCamera=function(z){if(s===null)return;_.texture!==null&&(z.near=_.depthNear,z.far=_.depthFar),v.near=D.near=A.near=z.near,v.far=D.far=A.far=z.far,(T!==v.near||q!==v.far)&&(s.updateRenderState({depthNear:v.near,depthFar:v.far}),T=v.near,q=v.far,A.near=T,A.far=q,D.near=T,D.far=q,A.updateProjectionMatrix(),D.updateProjectionMatrix(),z.updateProjectionMatrix());const J=z.parent,ue=v.cameras;Y(v,J);for(let Ee=0;Ee<ue.length;Ee++)Y(ue[Ee],J);ue.length===2?V(v,A,D):v.projectionMatrix.copy(A.projectionMatrix),j(z,v,J)};function j(z,J,ue){ue===null?z.matrix.copy(J.matrixWorld):(z.matrix.copy(ue.matrixWorld),z.matrix.invert(),z.matrix.multiply(J.matrixWorld)),z.matrix.decompose(z.position,z.quaternion,z.scale),z.updateMatrixWorld(!0),z.projectionMatrix.copy(J.projectionMatrix),z.projectionMatrixInverse.copy(J.projectionMatrixInverse),z.isPerspectiveCamera&&(z.fov=Kr*2*Math.atan(1/z.projectionMatrix.elements[5]),z.zoom=1)}this.getCamera=function(){return v},this.getFoveation=function(){if(!(d===null&&m===null))return l},this.setFoveation=function(z){l=z,d!==null&&(d.fixedFoveation=z),m!==null&&m.fixedFoveation!==void 0&&(m.fixedFoveation=z)},this.hasDepthSensing=function(){return _.texture!==null};let ie=null;function he(z,J){if(u=J.getViewerPose(c||o),g=J,u!==null){const ue=u.views;m!==null&&(e.setRenderTargetFramebuffer(y,m.framebuffer),e.setRenderTarget(y));let Ee=!1;ue.length!==v.cameras.length&&(v.cameras.length=0,Ee=!0);for(let de=0;de<ue.length;de++){const $e=ue[de];let be=null;if(m!==null)be=m.getViewport($e);else{const vt=h.getViewSubImage(d,$e);be=vt.viewport,de===0&&(e.setRenderTargetTextures(y,vt.colorTexture,d.ignoreDepthValues?void 0:vt.depthStencilTexture),e.setRenderTarget(y))}let I=k[de];I===void 0&&(I=new Gt,I.layers.enable(de),I.viewport=new St,k[de]=I),I.matrix.fromArray($e.transform.matrix),I.matrix.decompose(I.position,I.quaternion,I.scale),I.projectionMatrix.fromArray($e.projectionMatrix),I.projectionMatrixInverse.copy(I.projectionMatrix).invert(),I.viewport.set(be.x,be.y,be.width,be.height),de===0&&(v.matrix.copy(I.matrix),v.matrix.decompose(v.position,v.quaternion,v.scale)),Ee===!0&&v.cameras.push(I)}const ge=s.enabledFeatures;if(ge&&ge.includes("depth-sensing")){const de=h.getDepthInformation(ue[0]);de&&de.isValid&&de.texture&&_.init(e,de,s.renderState)}}for(let ue=0;ue<M.length;ue++){const Ee=S[ue],ge=M[ue];Ee!==null&&ge!==void 0&&ge.update(Ee,J,c||o)}_.render(e,v),ie&&ie(z,J),J.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:J}),g=null}const Ce=new kl;Ce.setAnimationLoop(he),this.setAnimationLoop=function(z){ie=z},this.dispose=function(){}}}const Vn=new ln,Zm=new it;function Jm(i,e){function t(p,f){p.matrixAutoUpdate===!0&&p.updateMatrix(),f.value.copy(p.matrix)}function n(p,f){f.color.getRGB(p.fogColor.value,Bl(i)),f.isFog?(p.fogNear.value=f.near,p.fogFar.value=f.far):f.isFogExp2&&(p.fogDensity.value=f.density)}function s(p,f,y,M,S){f.isMeshBasicMaterial||f.isMeshLambertMaterial?r(p,f):f.isMeshToonMaterial?(r(p,f),h(p,f)):f.isMeshPhongMaterial?(r(p,f),u(p,f)):f.isMeshStandardMaterial?(r(p,f),d(p,f),f.isMeshPhysicalMaterial&&m(p,f,S)):f.isMeshMatcapMaterial?(r(p,f),g(p,f)):f.isMeshDepthMaterial?r(p,f):f.isMeshDistanceMaterial?(r(p,f),_(p,f)):f.isMeshNormalMaterial?r(p,f):f.isLineBasicMaterial?(o(p,f),f.isLineDashedMaterial&&a(p,f)):f.isPointsMaterial?l(p,f,y,M):f.isSpriteMaterial?c(p,f):f.isShadowMaterial?(p.color.value.copy(f.color),p.opacity.value=f.opacity):f.isShaderMaterial&&(f.uniformsNeedUpdate=!1)}function r(p,f){p.opacity.value=f.opacity,f.color&&p.diffuse.value.copy(f.color),f.emissive&&p.emissive.value.copy(f.emissive).multiplyScalar(f.emissiveIntensity),f.map&&(p.map.value=f.map,t(f.map,p.mapTransform)),f.alphaMap&&(p.alphaMap.value=f.alphaMap,t(f.alphaMap,p.alphaMapTransform)),f.bumpMap&&(p.bumpMap.value=f.bumpMap,t(f.bumpMap,p.bumpMapTransform),p.bumpScale.value=f.bumpScale,f.side===Nt&&(p.bumpScale.value*=-1)),f.normalMap&&(p.normalMap.value=f.normalMap,t(f.normalMap,p.normalMapTransform),p.normalScale.value.copy(f.normalScale),f.side===Nt&&p.normalScale.value.negate()),f.displacementMap&&(p.displacementMap.value=f.displacementMap,t(f.displacementMap,p.displacementMapTransform),p.displacementScale.value=f.displacementScale,p.displacementBias.value=f.displacementBias),f.emissiveMap&&(p.emissiveMap.value=f.emissiveMap,t(f.emissiveMap,p.emissiveMapTransform)),f.specularMap&&(p.specularMap.value=f.specularMap,t(f.specularMap,p.specularMapTransform)),f.alphaTest>0&&(p.alphaTest.value=f.alphaTest);const y=e.get(f),M=y.envMap,S=y.envMapRotation;if(M&&(p.envMap.value=M,Vn.copy(S),Vn.x*=-1,Vn.y*=-1,Vn.z*=-1,M.isCubeTexture&&M.isRenderTargetTexture===!1&&(Vn.y*=-1,Vn.z*=-1),p.envMapRotation.value.setFromMatrix4(Zm.makeRotationFromEuler(Vn)),p.flipEnvMap.value=M.isCubeTexture&&M.isRenderTargetTexture===!1?-1:1,p.reflectivity.value=f.reflectivity,p.ior.value=f.ior,p.refractionRatio.value=f.refractionRatio),f.lightMap){p.lightMap.value=f.lightMap;const R=i._useLegacyLights===!0?Math.PI:1;p.lightMapIntensity.value=f.lightMapIntensity*R,t(f.lightMap,p.lightMapTransform)}f.aoMap&&(p.aoMap.value=f.aoMap,p.aoMapIntensity.value=f.aoMapIntensity,t(f.aoMap,p.aoMapTransform))}function o(p,f){p.diffuse.value.copy(f.color),p.opacity.value=f.opacity,f.map&&(p.map.value=f.map,t(f.map,p.mapTransform))}function a(p,f){p.dashSize.value=f.dashSize,p.totalSize.value=f.dashSize+f.gapSize,p.scale.value=f.scale}function l(p,f,y,M){p.diffuse.value.copy(f.color),p.opacity.value=f.opacity,p.size.value=f.size*y,p.scale.value=M*.5,f.map&&(p.map.value=f.map,t(f.map,p.uvTransform)),f.alphaMap&&(p.alphaMap.value=f.alphaMap,t(f.alphaMap,p.alphaMapTransform)),f.alphaTest>0&&(p.alphaTest.value=f.alphaTest)}function c(p,f){p.diffuse.value.copy(f.color),p.opacity.value=f.opacity,p.rotation.value=f.rotation,f.map&&(p.map.value=f.map,t(f.map,p.mapTransform)),f.alphaMap&&(p.alphaMap.value=f.alphaMap,t(f.alphaMap,p.alphaMapTransform)),f.alphaTest>0&&(p.alphaTest.value=f.alphaTest)}function u(p,f){p.specular.value.copy(f.specular),p.shininess.value=Math.max(f.shininess,1e-4)}function h(p,f){f.gradientMap&&(p.gradientMap.value=f.gradientMap)}function d(p,f){p.metalness.value=f.metalness,f.metalnessMap&&(p.metalnessMap.value=f.metalnessMap,t(f.metalnessMap,p.metalnessMapTransform)),p.roughness.value=f.roughness,f.roughnessMap&&(p.roughnessMap.value=f.roughnessMap,t(f.roughnessMap,p.roughnessMapTransform)),e.get(f).envMap&&(p.envMapIntensity.value=f.envMapIntensity)}function m(p,f,y){p.ior.value=f.ior,f.sheen>0&&(p.sheenColor.value.copy(f.sheenColor).multiplyScalar(f.sheen),p.sheenRoughness.value=f.sheenRoughness,f.sheenColorMap&&(p.sheenColorMap.value=f.sheenColorMap,t(f.sheenColorMap,p.sheenColorMapTransform)),f.sheenRoughnessMap&&(p.sheenRoughnessMap.value=f.sheenRoughnessMap,t(f.sheenRoughnessMap,p.sheenRoughnessMapTransform))),f.clearcoat>0&&(p.clearcoat.value=f.clearcoat,p.clearcoatRoughness.value=f.clearcoatRoughness,f.clearcoatMap&&(p.clearcoatMap.value=f.clearcoatMap,t(f.clearcoatMap,p.clearcoatMapTransform)),f.clearcoatRoughnessMap&&(p.clearcoatRoughnessMap.value=f.clearcoatRoughnessMap,t(f.clearcoatRoughnessMap,p.clearcoatRoughnessMapTransform)),f.clearcoatNormalMap&&(p.clearcoatNormalMap.value=f.clearcoatNormalMap,t(f.clearcoatNormalMap,p.clearcoatNormalMapTransform),p.clearcoatNormalScale.value.copy(f.clearcoatNormalScale),f.side===Nt&&p.clearcoatNormalScale.value.negate())),f.iridescence>0&&(p.iridescence.value=f.iridescence,p.iridescenceIOR.value=f.iridescenceIOR,p.iridescenceThicknessMinimum.value=f.iridescenceThicknessRange[0],p.iridescenceThicknessMaximum.value=f.iridescenceThicknessRange[1],f.iridescenceMap&&(p.iridescenceMap.value=f.iridescenceMap,t(f.iridescenceMap,p.iridescenceMapTransform)),f.iridescenceThicknessMap&&(p.iridescenceThicknessMap.value=f.iridescenceThicknessMap,t(f.iridescenceThicknessMap,p.iridescenceThicknessMapTransform))),f.transmission>0&&(p.transmission.value=f.transmission,p.transmissionSamplerMap.value=y.texture,p.transmissionSamplerSize.value.set(y.width,y.height),f.transmissionMap&&(p.transmissionMap.value=f.transmissionMap,t(f.transmissionMap,p.transmissionMapTransform)),p.thickness.value=f.thickness,f.thicknessMap&&(p.thicknessMap.value=f.thicknessMap,t(f.thicknessMap,p.thicknessMapTransform)),p.attenuationDistance.value=f.attenuationDistance,p.attenuationColor.value.copy(f.attenuationColor)),f.anisotropy>0&&(p.anisotropyVector.value.set(f.anisotropy*Math.cos(f.anisotropyRotation),f.anisotropy*Math.sin(f.anisotropyRotation)),f.anisotropyMap&&(p.anisotropyMap.value=f.anisotropyMap,t(f.anisotropyMap,p.anisotropyMapTransform))),p.specularIntensity.value=f.specularIntensity,p.specularColor.value.copy(f.specularColor),f.specularColorMap&&(p.specularColorMap.value=f.specularColorMap,t(f.specularColorMap,p.specularColorMapTransform)),f.specularIntensityMap&&(p.specularIntensityMap.value=f.specularIntensityMap,t(f.specularIntensityMap,p.specularIntensityMapTransform))}function g(p,f){f.matcap&&(p.matcap.value=f.matcap)}function _(p,f){const y=e.get(f).light;p.referencePosition.value.setFromMatrixPosition(y.matrixWorld),p.nearDistance.value=y.shadow.camera.near,p.farDistance.value=y.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function Qm(i,e,t,n){let s={},r={},o=[];const a=t.isWebGL2?i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS):0;function l(y,M){const S=M.program;n.uniformBlockBinding(y,S)}function c(y,M){let S=s[y.id];S===void 0&&(g(y),S=u(y),s[y.id]=S,y.addEventListener("dispose",p));const R=M.program;n.updateUBOMapping(y,R);const w=e.render.frame;r[y.id]!==w&&(d(y),r[y.id]=w)}function u(y){const M=h();y.__bindingPointIndex=M;const S=i.createBuffer(),R=y.__size,w=y.usage;return i.bindBuffer(i.UNIFORM_BUFFER,S),i.bufferData(i.UNIFORM_BUFFER,R,w),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,M,S),S}function h(){for(let y=0;y<a;y++)if(o.indexOf(y)===-1)return o.push(y),y;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function d(y){const M=s[y.id],S=y.uniforms,R=y.__cache;i.bindBuffer(i.UNIFORM_BUFFER,M);for(let w=0,A=S.length;w<A;w++){const D=Array.isArray(S[w])?S[w]:[S[w]];for(let k=0,v=D.length;k<v;k++){const T=D[k];if(m(T,w,k,R)===!0){const q=T.__offset,$=Array.isArray(T.value)?T.value:[T.value];let C=0;for(let W=0;W<$.length;W++){const H=$[W],K=_(H);typeof H=="number"||typeof H=="boolean"?(T.__data[0]=H,i.bufferSubData(i.UNIFORM_BUFFER,q+C,T.__data)):H.isMatrix3?(T.__data[0]=H.elements[0],T.__data[1]=H.elements[1],T.__data[2]=H.elements[2],T.__data[3]=0,T.__data[4]=H.elements[3],T.__data[5]=H.elements[4],T.__data[6]=H.elements[5],T.__data[7]=0,T.__data[8]=H.elements[6],T.__data[9]=H.elements[7],T.__data[10]=H.elements[8],T.__data[11]=0):(H.toArray(T.__data,C),C+=K.storage/Float32Array.BYTES_PER_ELEMENT)}i.bufferSubData(i.UNIFORM_BUFFER,q,T.__data)}}}i.bindBuffer(i.UNIFORM_BUFFER,null)}function m(y,M,S,R){const w=y.value,A=M+"_"+S;if(R[A]===void 0)return typeof w=="number"||typeof w=="boolean"?R[A]=w:R[A]=w.clone(),!0;{const D=R[A];if(typeof w=="number"||typeof w=="boolean"){if(D!==w)return R[A]=w,!0}else if(D.equals(w)===!1)return D.copy(w),!0}return!1}function g(y){const M=y.uniforms;let S=0;const R=16;for(let A=0,D=M.length;A<D;A++){const k=Array.isArray(M[A])?M[A]:[M[A]];for(let v=0,T=k.length;v<T;v++){const q=k[v],$=Array.isArray(q.value)?q.value:[q.value];for(let C=0,W=$.length;C<W;C++){const H=$[C],K=_(H),V=S%R;V!==0&&R-V<K.boundary&&(S+=R-V),q.__data=new Float32Array(K.storage/Float32Array.BYTES_PER_ELEMENT),q.__offset=S,S+=K.storage}}}const w=S%R;return w>0&&(S+=R-w),y.__size=S,y.__cache={},this}function _(y){const M={boundary:0,storage:0};return typeof y=="number"||typeof y=="boolean"?(M.boundary=4,M.storage=4):y.isVector2?(M.boundary=8,M.storage=8):y.isVector3||y.isColor?(M.boundary=16,M.storage=12):y.isVector4?(M.boundary=16,M.storage=16):y.isMatrix3?(M.boundary=48,M.storage=48):y.isMatrix4?(M.boundary=64,M.storage=64):y.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",y),M}function p(y){const M=y.target;M.removeEventListener("dispose",p);const S=o.indexOf(M.__bindingPointIndex);o.splice(S,1),i.deleteBuffer(s[M.id]),delete s[M.id],delete r[M.id]}function f(){for(const y in s)i.deleteBuffer(s[y]);o=[],s={},r={}}return{bind:l,update:c,dispose:f}}class oa{constructor(e={}){const{canvas:t=Gu(),context:n=null,depth:s=!0,stencil:r=!0,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:u="default",failIfMajorPerformanceCaveat:h=!1}=e;this.isWebGLRenderer=!0;let d;n!==null?d=n.getContextAttributes().alpha:d=o;const m=new Uint32Array(4),g=new Int32Array(4);let _=null,p=null;const f=[],y=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=rn,this._useLegacyLights=!1,this.toneMapping=Cn,this.toneMappingExposure=1;const M=this;let S=!1,R=0,w=0,A=null,D=-1,k=null;const v=new St,T=new St;let q=null;const $=new Ve(0);let C=0,W=t.width,H=t.height,K=1,V=null,Y=null;const j=new St(0,0,W,H),ie=new St(0,0,W,H);let he=!1;const Ce=new Hl;let z=!1,J=!1,ue=null;const Ee=new it,ge=new He,de=new P,$e={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};function be(){return A===null?K:1}let I=n;function vt(E,U){for(let O=0;O<E.length;O++){const B=E[O],N=t.getContext(B,U);if(N!==null)return N}return null}try{const E={alpha:!0,depth:s,stencil:r,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:u,failIfMajorPerformanceCaveat:h};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${na}`),t.addEventListener("webglcontextlost",tt,!1),t.addEventListener("webglcontextrestored",L,!1),t.addEventListener("webglcontextcreationerror",re,!1),I===null){const U=["webgl2","webgl","experimental-webgl"];if(M.isWebGL1Renderer===!0&&U.shift(),I=vt(U,E),I===null)throw vt(U)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}typeof WebGLRenderingContext<"u"&&I instanceof WebGLRenderingContext&&console.warn("THREE.WebGLRenderer: WebGL 1 support was deprecated in r153 and will be removed in r163."),I.getShaderPrecisionFormat===void 0&&(I.getShaderPrecisionFormat=function(){return{rangeMin:1,rangeMax:1,precision:1}})}catch(E){throw console.error("THREE.WebGLRenderer: "+E.message),E}let ve,Be,Me,We,Ne,ze,at,b,x,G,X,Q,Z,Pe,ye,se,ae,Le,ee,ct,Ge,_e,fe,pe;function Xe(){ve=new rp(I),Be=new Jf(I,ve,e),ve.init(Be),_e=new Wm(I,ve,Be),Me=new km(I,ve,Be),We=new lp(I),Ne=new Rm,ze=new Vm(I,ve,Me,Ne,Be,_e,We),at=new ep(M),b=new sp(M),x=new dh(I,Be),fe=new jf(I,ve,x,Be),G=new ap(I,x,We,fe),X=new dp(I,G,x,We),ee=new hp(I,Be,ze),se=new Qf(Ne),Q=new wm(M,at,b,ve,Be,fe,se),Z=new Jm(M,Ne),Pe=new Pm,ye=new Fm(ve,Be),Le=new Kf(M,at,b,Me,X,d,l),ae=new Hm(M,X,Be),pe=new Qm(I,We,Be,Me),ct=new Zf(I,ve,We,Be),Ge=new op(I,ve,We,Be),We.programs=Q.programs,M.capabilities=Be,M.extensions=ve,M.properties=Ne,M.renderLists=Pe,M.shadowMap=ae,M.state=Me,M.info=We}Xe();const we=new jm(M,I);this.xr=we,this.getContext=function(){return I},this.getContextAttributes=function(){return I.getContextAttributes()},this.forceContextLoss=function(){const E=ve.get("WEBGL_lose_context");E&&E.loseContext()},this.forceContextRestore=function(){const E=ve.get("WEBGL_lose_context");E&&E.restoreContext()},this.getPixelRatio=function(){return K},this.setPixelRatio=function(E){E!==void 0&&(K=E,this.setSize(W,H,!1))},this.getSize=function(E){return E.set(W,H)},this.setSize=function(E,U,O=!0){if(we.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}W=E,H=U,t.width=Math.floor(E*K),t.height=Math.floor(U*K),O===!0&&(t.style.width=E+"px",t.style.height=U+"px"),this.setViewport(0,0,E,U)},this.getDrawingBufferSize=function(E){return E.set(W*K,H*K).floor()},this.setDrawingBufferSize=function(E,U,O){W=E,H=U,K=O,t.width=Math.floor(E*O),t.height=Math.floor(U*O),this.setViewport(0,0,E,U)},this.getCurrentViewport=function(E){return E.copy(v)},this.getViewport=function(E){return E.copy(j)},this.setViewport=function(E,U,O,B){E.isVector4?j.set(E.x,E.y,E.z,E.w):j.set(E,U,O,B),Me.viewport(v.copy(j).multiplyScalar(K).round())},this.getScissor=function(E){return E.copy(ie)},this.setScissor=function(E,U,O,B){E.isVector4?ie.set(E.x,E.y,E.z,E.w):ie.set(E,U,O,B),Me.scissor(T.copy(ie).multiplyScalar(K).round())},this.getScissorTest=function(){return he},this.setScissorTest=function(E){Me.setScissorTest(he=E)},this.setOpaqueSort=function(E){V=E},this.setTransparentSort=function(E){Y=E},this.getClearColor=function(E){return E.copy(Le.getClearColor())},this.setClearColor=function(){Le.setClearColor.apply(Le,arguments)},this.getClearAlpha=function(){return Le.getClearAlpha()},this.setClearAlpha=function(){Le.setClearAlpha.apply(Le,arguments)},this.clear=function(E=!0,U=!0,O=!0){let B=0;if(E){let N=!1;if(A!==null){const le=A.texture.format;N=le===wl||le===Al||le===Tl}if(N){const le=A.texture.type,me=le===Pn||le===wn||le===ia||le===jn||le===Sl||le===El,xe=Le.getClearColor(),Se=Le.getClearAlpha(),Fe=xe.r,Ae=xe.g,Re=xe.b;me?(m[0]=Fe,m[1]=Ae,m[2]=Re,m[3]=Se,I.clearBufferuiv(I.COLOR,0,m)):(g[0]=Fe,g[1]=Ae,g[2]=Re,g[3]=Se,I.clearBufferiv(I.COLOR,0,g))}else B|=I.COLOR_BUFFER_BIT}U&&(B|=I.DEPTH_BUFFER_BIT),O&&(B|=I.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),I.clear(B)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",tt,!1),t.removeEventListener("webglcontextrestored",L,!1),t.removeEventListener("webglcontextcreationerror",re,!1),Pe.dispose(),ye.dispose(),Ne.dispose(),at.dispose(),b.dispose(),X.dispose(),fe.dispose(),pe.dispose(),Q.dispose(),we.dispose(),we.removeEventListener("sessionstart",kt),we.removeEventListener("sessionend",Qe),ue&&(ue.dispose(),ue=null),wt.stop()};function tt(E){E.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),S=!0}function L(){console.log("THREE.WebGLRenderer: Context Restored."),S=!1;const E=We.autoReset,U=ae.enabled,O=ae.autoUpdate,B=ae.needsUpdate,N=ae.type;Xe(),We.autoReset=E,ae.enabled=U,ae.autoUpdate=O,ae.needsUpdate=B,ae.type=N}function re(E){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",E.statusMessage)}function F(E){const U=E.target;U.removeEventListener("dispose",F),te(U)}function te(E){oe(E),Ne.remove(E)}function oe(E){const U=Ne.get(E).programs;U!==void 0&&(U.forEach(function(O){Q.releaseProgram(O)}),E.isShaderMaterial&&Q.releaseShaderCache(E))}this.renderBufferDirect=function(E,U,O,B,N,le){U===null&&(U=$e);const me=N.isMesh&&N.matrixWorld.determinant()<0,xe=oc(E,U,O,B,N);Me.setMaterial(B,me);let Se=O.index,Fe=1;if(B.wireframe===!0){if(Se=G.getWireframeAttribute(O),Se===void 0)return;Fe=2}const Ae=O.drawRange,Re=O.attributes.position;let ot=Ae.start*Fe,Ot=(Ae.start+Ae.count)*Fe;le!==null&&(ot=Math.max(ot,le.start*Fe),Ot=Math.min(Ot,(le.start+le.count)*Fe)),Se!==null?(ot=Math.max(ot,0),Ot=Math.min(Ot,Se.count)):Re!=null&&(ot=Math.max(ot,0),Ot=Math.min(Ot,Re.count));const pt=Ot-ot;if(pt<0||pt===1/0)return;fe.setup(N,B,xe,O,Se);let un,st=ct;if(Se!==null&&(un=x.get(Se),st=Ge,st.setIndex(un)),N.isMesh)B.wireframe===!0?(Me.setLineWidth(B.wireframeLinewidth*be()),st.setMode(I.LINES)):st.setMode(I.TRIANGLES);else if(N.isLine){let De=B.linewidth;De===void 0&&(De=1),Me.setLineWidth(De*be()),N.isLineSegments?st.setMode(I.LINES):N.isLineLoop?st.setMode(I.LINE_LOOP):st.setMode(I.LINE_STRIP)}else N.isPoints?st.setMode(I.POINTS):N.isSprite&&st.setMode(I.TRIANGLES);if(N.isBatchedMesh)st.renderMultiDraw(N._multiDrawStarts,N._multiDrawCounts,N._multiDrawCount);else if(N.isInstancedMesh)st.renderInstances(ot,pt,N.count);else if(O.isInstancedBufferGeometry){const De=O._maxInstanceCount!==void 0?O._maxInstanceCount:1/0,Zs=Math.min(O.instanceCount,De);st.renderInstances(ot,pt,Zs)}else st.render(ot,pt)};function ke(E,U,O){E.transparent===!0&&E.side===qt&&E.forceSinglePass===!1?(E.side=Nt,E.needsUpdate=!0,ts(E,U,O),E.side=Dn,E.needsUpdate=!0,ts(E,U,O),E.side=qt):ts(E,U,O)}this.compile=function(E,U,O=null){O===null&&(O=E),p=ye.get(O),p.init(),y.push(p),O.traverseVisible(function(N){N.isLight&&N.layers.test(U.layers)&&(p.pushLight(N),N.castShadow&&p.pushShadow(N))}),E!==O&&E.traverseVisible(function(N){N.isLight&&N.layers.test(U.layers)&&(p.pushLight(N),N.castShadow&&p.pushShadow(N))}),p.setupLights(M._useLegacyLights);const B=new Set;return E.traverse(function(N){const le=N.material;if(le)if(Array.isArray(le))for(let me=0;me<le.length;me++){const xe=le[me];ke(xe,O,N),B.add(xe)}else ke(le,O,N),B.add(le)}),y.pop(),p=null,B},this.compileAsync=function(E,U,O=null){const B=this.compile(E,U,O);return new Promise(N=>{function le(){if(B.forEach(function(me){Ne.get(me).currentProgram.isReady()&&B.delete(me)}),B.size===0){N(E);return}setTimeout(le,10)}ve.get("KHR_parallel_shader_compile")!==null?le():setTimeout(le,10)})};let Je=null;function xt(E){Je&&Je(E)}function kt(){wt.stop()}function Qe(){wt.start()}const wt=new kl;wt.setAnimationLoop(xt),typeof self<"u"&&wt.setContext(self),this.setAnimationLoop=function(E){Je=E,we.setAnimationLoop(E),E===null?wt.stop():wt.start()},we.addEventListener("sessionstart",kt),we.addEventListener("sessionend",Qe),this.render=function(E,U){if(U!==void 0&&U.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(S===!0)return;E.matrixWorldAutoUpdate===!0&&E.updateMatrixWorld(),U.parent===null&&U.matrixWorldAutoUpdate===!0&&U.updateMatrixWorld(),we.enabled===!0&&we.isPresenting===!0&&(we.cameraAutoUpdate===!0&&we.updateCamera(U),U=we.getCamera()),E.isScene===!0&&E.onBeforeRender(M,E,U,A),p=ye.get(E,y.length),p.init(),y.push(p),Ee.multiplyMatrices(U.projectionMatrix,U.matrixWorldInverse),Ce.setFromProjectionMatrix(Ee),J=this.localClippingEnabled,z=se.init(this.clippingPlanes,J),_=Pe.get(E,f.length),_.init(),f.push(_),sn(E,U,0,M.sortObjects),_.finish(),M.sortObjects===!0&&_.sort(V,Y),this.info.render.frame++,z===!0&&se.beginShadows();const O=p.state.shadowsArray;if(ae.render(O,E,U),z===!0&&se.endShadows(),this.info.autoReset===!0&&this.info.reset(),(we.enabled===!1||we.isPresenting===!1||we.hasDepthSensing()===!1)&&Le.render(_,E),p.setupLights(M._useLegacyLights),U.isArrayCamera){const B=U.cameras;for(let N=0,le=B.length;N<le;N++){const me=B[N];La(_,E,me,me.viewport)}}else La(_,E,U);A!==null&&(ze.updateMultisampleRenderTarget(A),ze.updateRenderTargetMipmap(A)),E.isScene===!0&&E.onAfterRender(M,E,U),fe.resetDefaultState(),D=-1,k=null,y.pop(),y.length>0?p=y[y.length-1]:p=null,f.pop(),f.length>0?_=f[f.length-1]:_=null};function sn(E,U,O,B){if(E.visible===!1)return;if(E.layers.test(U.layers)){if(E.isGroup)O=E.renderOrder;else if(E.isLOD)E.autoUpdate===!0&&E.update(U);else if(E.isLight)p.pushLight(E),E.castShadow&&p.pushShadow(E);else if(E.isSprite){if(!E.frustumCulled||Ce.intersectsSprite(E)){B&&de.setFromMatrixPosition(E.matrixWorld).applyMatrix4(Ee);const me=X.update(E),xe=E.material;xe.visible&&_.push(E,me,xe,O,de.z,null)}}else if((E.isMesh||E.isLine||E.isPoints)&&(!E.frustumCulled||Ce.intersectsObject(E))){const me=X.update(E),xe=E.material;if(B&&(E.boundingSphere!==void 0?(E.boundingSphere===null&&E.computeBoundingSphere(),de.copy(E.boundingSphere.center)):(me.boundingSphere===null&&me.computeBoundingSphere(),de.copy(me.boundingSphere.center)),de.applyMatrix4(E.matrixWorld).applyMatrix4(Ee)),Array.isArray(xe)){const Se=me.groups;for(let Fe=0,Ae=Se.length;Fe<Ae;Fe++){const Re=Se[Fe],ot=xe[Re.materialIndex];ot&&ot.visible&&_.push(E,me,ot,O,de.z,Re)}}else xe.visible&&_.push(E,me,xe,O,de.z,null)}}const le=E.children;for(let me=0,xe=le.length;me<xe;me++)sn(le[me],U,O,B)}function La(E,U,O,B){const N=E.opaque,le=E.transmissive,me=E.transparent;p.setupLightsView(O),z===!0&&se.setGlobalState(M.clippingPlanes,O),le.length>0&&ac(N,le,U,O),B&&Me.viewport(v.copy(B)),N.length>0&&es(N,U,O),le.length>0&&es(le,U,O),me.length>0&&es(me,U,O),Me.buffers.depth.setTest(!0),Me.buffers.depth.setMask(!0),Me.buffers.color.setMask(!0),Me.setPolygonOffset(!1)}function ac(E,U,O,B){if((O.isScene===!0?O.overrideMaterial:null)!==null)return;const le=Be.isWebGL2;ue===null&&(ue=new Qn(1,1,{generateMipmaps:!0,type:ve.has("EXT_color_buffer_half_float")?qi:Pn,minFilter:$n,samples:le?4:0})),M.getDrawingBufferSize(ge),le?ue.setSize(ge.x,ge.y):ue.setSize(jr(ge.x),jr(ge.y));const me=M.getRenderTarget();M.setRenderTarget(ue),M.getClearColor($),C=M.getClearAlpha(),C<1&&M.setClearColor(16777215,.5),M.clear();const xe=M.toneMapping;M.toneMapping=Cn,es(E,O,B),ze.updateMultisampleRenderTarget(ue),ze.updateRenderTargetMipmap(ue);let Se=!1;for(let Fe=0,Ae=U.length;Fe<Ae;Fe++){const Re=U[Fe],ot=Re.object,Ot=Re.geometry,pt=Re.material,un=Re.group;if(pt.side===qt&&ot.layers.test(B.layers)){const st=pt.side;pt.side=Nt,pt.needsUpdate=!0,Da(ot,O,B,Ot,pt,un),pt.side=st,pt.needsUpdate=!0,Se=!0}}Se===!0&&(ze.updateMultisampleRenderTarget(ue),ze.updateRenderTargetMipmap(ue)),M.setRenderTarget(me),M.setClearColor($,C),M.toneMapping=xe}function es(E,U,O){const B=U.isScene===!0?U.overrideMaterial:null;for(let N=0,le=E.length;N<le;N++){const me=E[N],xe=me.object,Se=me.geometry,Fe=B===null?me.material:B,Ae=me.group;xe.layers.test(O.layers)&&Da(xe,U,O,Se,Fe,Ae)}}function Da(E,U,O,B,N,le){E.onBeforeRender(M,U,O,B,N,le),E.modelViewMatrix.multiplyMatrices(O.matrixWorldInverse,E.matrixWorld),E.normalMatrix.getNormalMatrix(E.modelViewMatrix),N.onBeforeRender(M,U,O,B,E,le),N.transparent===!0&&N.side===qt&&N.forceSinglePass===!1?(N.side=Nt,N.needsUpdate=!0,M.renderBufferDirect(O,U,B,N,E,le),N.side=Dn,N.needsUpdate=!0,M.renderBufferDirect(O,U,B,N,E,le),N.side=qt):M.renderBufferDirect(O,U,B,N,E,le),E.onAfterRender(M,U,O,B,N,le)}function ts(E,U,O){U.isScene!==!0&&(U=$e);const B=Ne.get(E),N=p.state.lights,le=p.state.shadowsArray,me=N.state.version,xe=Q.getParameters(E,N.state,le,U,O),Se=Q.getProgramCacheKey(xe);let Fe=B.programs;B.environment=E.isMeshStandardMaterial?U.environment:null,B.fog=U.fog,B.envMap=(E.isMeshStandardMaterial?b:at).get(E.envMap||B.environment),B.envMapRotation=B.environment!==null&&E.envMap===null?U.environmentRotation:E.envMapRotation,Fe===void 0&&(E.addEventListener("dispose",F),Fe=new Map,B.programs=Fe);let Ae=Fe.get(Se);if(Ae!==void 0){if(B.currentProgram===Ae&&B.lightsStateVersion===me)return Ia(E,xe),Ae}else xe.uniforms=Q.getUniforms(E),E.onBuild(O,xe,M),E.onBeforeCompile(xe,M),Ae=Q.acquireProgram(xe,Se),Fe.set(Se,Ae),B.uniforms=xe.uniforms;const Re=B.uniforms;return(!E.isShaderMaterial&&!E.isRawShaderMaterial||E.clipping===!0)&&(Re.clippingPlanes=se.uniform),Ia(E,xe),B.needsLights=cc(E),B.lightsStateVersion=me,B.needsLights&&(Re.ambientLightColor.value=N.state.ambient,Re.lightProbe.value=N.state.probe,Re.directionalLights.value=N.state.directional,Re.directionalLightShadows.value=N.state.directionalShadow,Re.spotLights.value=N.state.spot,Re.spotLightShadows.value=N.state.spotShadow,Re.rectAreaLights.value=N.state.rectArea,Re.ltc_1.value=N.state.rectAreaLTC1,Re.ltc_2.value=N.state.rectAreaLTC2,Re.pointLights.value=N.state.point,Re.pointLightShadows.value=N.state.pointShadow,Re.hemisphereLights.value=N.state.hemi,Re.directionalShadowMap.value=N.state.directionalShadowMap,Re.directionalShadowMatrix.value=N.state.directionalShadowMatrix,Re.spotShadowMap.value=N.state.spotShadowMap,Re.spotLightMatrix.value=N.state.spotLightMatrix,Re.spotLightMap.value=N.state.spotLightMap,Re.pointShadowMap.value=N.state.pointShadowMap,Re.pointShadowMatrix.value=N.state.pointShadowMatrix),B.currentProgram=Ae,B.uniformsList=null,Ae}function Ua(E){if(E.uniformsList===null){const U=E.currentProgram.getUniforms();E.uniformsList=Us.seqWithValue(U.seq,E.uniforms)}return E.uniformsList}function Ia(E,U){const O=Ne.get(E);O.outputColorSpace=U.outputColorSpace,O.batching=U.batching,O.instancing=U.instancing,O.instancingColor=U.instancingColor,O.instancingMorph=U.instancingMorph,O.skinning=U.skinning,O.morphTargets=U.morphTargets,O.morphNormals=U.morphNormals,O.morphColors=U.morphColors,O.morphTargetsCount=U.morphTargetsCount,O.numClippingPlanes=U.numClippingPlanes,O.numIntersection=U.numClipIntersection,O.vertexAlphas=U.vertexAlphas,O.vertexTangents=U.vertexTangents,O.toneMapping=U.toneMapping}function oc(E,U,O,B,N){U.isScene!==!0&&(U=$e),ze.resetTextureUnits();const le=U.fog,me=B.isMeshStandardMaterial?U.environment:null,xe=A===null?M.outputColorSpace:A.isXRRenderTarget===!0?A.texture.colorSpace:In,Se=(B.isMeshStandardMaterial?b:at).get(B.envMap||me),Fe=B.vertexColors===!0&&!!O.attributes.color&&O.attributes.color.itemSize===4,Ae=!!O.attributes.tangent&&(!!B.normalMap||B.anisotropy>0),Re=!!O.morphAttributes.position,ot=!!O.morphAttributes.normal,Ot=!!O.morphAttributes.color;let pt=Cn;B.toneMapped&&(A===null||A.isXRRenderTarget===!0)&&(pt=M.toneMapping);const un=O.morphAttributes.position||O.morphAttributes.normal||O.morphAttributes.color,st=un!==void 0?un.length:0,De=Ne.get(B),Zs=p.state.lights;if(z===!0&&(J===!0||E!==k)){const Vt=E===k&&B.id===D;se.setState(B,E,Vt)}let nt=!1;B.version===De.__version?(De.needsLights&&De.lightsStateVersion!==Zs.state.version||De.outputColorSpace!==xe||N.isBatchedMesh&&De.batching===!1||!N.isBatchedMesh&&De.batching===!0||N.isInstancedMesh&&De.instancing===!1||!N.isInstancedMesh&&De.instancing===!0||N.isSkinnedMesh&&De.skinning===!1||!N.isSkinnedMesh&&De.skinning===!0||N.isInstancedMesh&&De.instancingColor===!0&&N.instanceColor===null||N.isInstancedMesh&&De.instancingColor===!1&&N.instanceColor!==null||N.isInstancedMesh&&De.instancingMorph===!0&&N.morphTexture===null||N.isInstancedMesh&&De.instancingMorph===!1&&N.morphTexture!==null||De.envMap!==Se||B.fog===!0&&De.fog!==le||De.numClippingPlanes!==void 0&&(De.numClippingPlanes!==se.numPlanes||De.numIntersection!==se.numIntersection)||De.vertexAlphas!==Fe||De.vertexTangents!==Ae||De.morphTargets!==Re||De.morphNormals!==ot||De.morphColors!==Ot||De.toneMapping!==pt||Be.isWebGL2===!0&&De.morphTargetsCount!==st)&&(nt=!0):(nt=!0,De.__version=B.version);let Nn=De.currentProgram;nt===!0&&(Nn=ts(B,U,N));let Na=!1,Fi=!1,Js=!1;const Et=Nn.getUniforms(),Fn=De.uniforms;if(Me.useProgram(Nn.program)&&(Na=!0,Fi=!0,Js=!0),B.id!==D&&(D=B.id,Fi=!0),Na||k!==E){Et.setValue(I,"projectionMatrix",E.projectionMatrix),Et.setValue(I,"viewMatrix",E.matrixWorldInverse);const Vt=Et.map.cameraPosition;Vt!==void 0&&Vt.setValue(I,de.setFromMatrixPosition(E.matrixWorld)),Be.logarithmicDepthBuffer&&Et.setValue(I,"logDepthBufFC",2/(Math.log(E.far+1)/Math.LN2)),(B.isMeshPhongMaterial||B.isMeshToonMaterial||B.isMeshLambertMaterial||B.isMeshBasicMaterial||B.isMeshStandardMaterial||B.isShaderMaterial)&&Et.setValue(I,"isOrthographic",E.isOrthographicCamera===!0),k!==E&&(k=E,Fi=!0,Js=!0)}if(N.isSkinnedMesh){Et.setOptional(I,N,"bindMatrix"),Et.setOptional(I,N,"bindMatrixInverse");const Vt=N.skeleton;Vt&&(Be.floatVertexTextures?(Vt.boneTexture===null&&Vt.computeBoneTexture(),Et.setValue(I,"boneTexture",Vt.boneTexture,ze)):console.warn("THREE.WebGLRenderer: SkinnedMesh can only be used with WebGL 2. With WebGL 1 OES_texture_float and vertex textures support is required."))}N.isBatchedMesh&&(Et.setOptional(I,N,"batchingTexture"),Et.setValue(I,"batchingTexture",N._matricesTexture,ze));const Qs=O.morphAttributes;if((Qs.position!==void 0||Qs.normal!==void 0||Qs.color!==void 0&&Be.isWebGL2===!0)&&ee.update(N,O,Nn),(Fi||De.receiveShadow!==N.receiveShadow)&&(De.receiveShadow=N.receiveShadow,Et.setValue(I,"receiveShadow",N.receiveShadow)),B.isMeshGouraudMaterial&&B.envMap!==null&&(Fn.envMap.value=Se,Fn.flipEnvMap.value=Se.isCubeTexture&&Se.isRenderTargetTexture===!1?-1:1),Fi&&(Et.setValue(I,"toneMappingExposure",M.toneMappingExposure),De.needsLights&&lc(Fn,Js),le&&B.fog===!0&&Z.refreshFogUniforms(Fn,le),Z.refreshMaterialUniforms(Fn,B,K,H,ue),Us.upload(I,Ua(De),Fn,ze)),B.isShaderMaterial&&B.uniformsNeedUpdate===!0&&(Us.upload(I,Ua(De),Fn,ze),B.uniformsNeedUpdate=!1),B.isSpriteMaterial&&Et.setValue(I,"center",N.center),Et.setValue(I,"modelViewMatrix",N.modelViewMatrix),Et.setValue(I,"normalMatrix",N.normalMatrix),Et.setValue(I,"modelMatrix",N.matrixWorld),B.isShaderMaterial||B.isRawShaderMaterial){const Vt=B.uniformsGroups;for(let er=0,uc=Vt.length;er<uc;er++)if(Be.isWebGL2){const Fa=Vt[er];pe.update(Fa,Nn),pe.bind(Fa,Nn)}else console.warn("THREE.WebGLRenderer: Uniform Buffer Objects can only be used with WebGL 2.")}return Nn}function lc(E,U){E.ambientLightColor.needsUpdate=U,E.lightProbe.needsUpdate=U,E.directionalLights.needsUpdate=U,E.directionalLightShadows.needsUpdate=U,E.pointLights.needsUpdate=U,E.pointLightShadows.needsUpdate=U,E.spotLights.needsUpdate=U,E.spotLightShadows.needsUpdate=U,E.rectAreaLights.needsUpdate=U,E.hemisphereLights.needsUpdate=U}function cc(E){return E.isMeshLambertMaterial||E.isMeshToonMaterial||E.isMeshPhongMaterial||E.isMeshStandardMaterial||E.isShadowMaterial||E.isShaderMaterial&&E.lights===!0}this.getActiveCubeFace=function(){return R},this.getActiveMipmapLevel=function(){return w},this.getRenderTarget=function(){return A},this.setRenderTargetTextures=function(E,U,O){Ne.get(E.texture).__webglTexture=U,Ne.get(E.depthTexture).__webglTexture=O;const B=Ne.get(E);B.__hasExternalTextures=!0,B.__autoAllocateDepthBuffer=O===void 0,B.__autoAllocateDepthBuffer||ve.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),B.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(E,U){const O=Ne.get(E);O.__webglFramebuffer=U,O.__useDefaultFramebuffer=U===void 0},this.setRenderTarget=function(E,U=0,O=0){A=E,R=U,w=O;let B=!0,N=null,le=!1,me=!1;if(E){const Se=Ne.get(E);Se.__useDefaultFramebuffer!==void 0?(Me.bindFramebuffer(I.FRAMEBUFFER,null),B=!1):Se.__webglFramebuffer===void 0?ze.setupRenderTarget(E):Se.__hasExternalTextures&&ze.rebindTextures(E,Ne.get(E.texture).__webglTexture,Ne.get(E.depthTexture).__webglTexture);const Fe=E.texture;(Fe.isData3DTexture||Fe.isDataArrayTexture||Fe.isCompressedArrayTexture)&&(me=!0);const Ae=Ne.get(E).__webglFramebuffer;E.isWebGLCubeRenderTarget?(Array.isArray(Ae[U])?N=Ae[U][O]:N=Ae[U],le=!0):Be.isWebGL2&&E.samples>0&&ze.useMultisampledRTT(E)===!1?N=Ne.get(E).__webglMultisampledFramebuffer:Array.isArray(Ae)?N=Ae[O]:N=Ae,v.copy(E.viewport),T.copy(E.scissor),q=E.scissorTest}else v.copy(j).multiplyScalar(K).floor(),T.copy(ie).multiplyScalar(K).floor(),q=he;if(Me.bindFramebuffer(I.FRAMEBUFFER,N)&&Be.drawBuffers&&B&&Me.drawBuffers(E,N),Me.viewport(v),Me.scissor(T),Me.setScissorTest(q),le){const Se=Ne.get(E.texture);I.framebufferTexture2D(I.FRAMEBUFFER,I.COLOR_ATTACHMENT0,I.TEXTURE_CUBE_MAP_POSITIVE_X+U,Se.__webglTexture,O)}else if(me){const Se=Ne.get(E.texture),Fe=U||0;I.framebufferTextureLayer(I.FRAMEBUFFER,I.COLOR_ATTACHMENT0,Se.__webglTexture,O||0,Fe)}D=-1},this.readRenderTargetPixels=function(E,U,O,B,N,le,me){if(!(E&&E.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let xe=Ne.get(E).__webglFramebuffer;if(E.isWebGLCubeRenderTarget&&me!==void 0&&(xe=xe[me]),xe){Me.bindFramebuffer(I.FRAMEBUFFER,xe);try{const Se=E.texture,Fe=Se.format,Ae=Se.type;if(Fe!==Qt&&_e.convert(Fe)!==I.getParameter(I.IMPLEMENTATION_COLOR_READ_FORMAT)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}const Re=Ae===qi&&(ve.has("EXT_color_buffer_half_float")||Be.isWebGL2&&ve.has("EXT_color_buffer_float"));if(Ae!==Pn&&_e.convert(Ae)!==I.getParameter(I.IMPLEMENTATION_COLOR_READ_TYPE)&&!(Ae===on&&(Be.isWebGL2||ve.has("OES_texture_float")||ve.has("WEBGL_color_buffer_float")))&&!Re){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}U>=0&&U<=E.width-B&&O>=0&&O<=E.height-N&&I.readPixels(U,O,B,N,_e.convert(Fe),_e.convert(Ae),le)}finally{const Se=A!==null?Ne.get(A).__webglFramebuffer:null;Me.bindFramebuffer(I.FRAMEBUFFER,Se)}}},this.copyFramebufferToTexture=function(E,U,O=0){const B=Math.pow(2,-O),N=Math.floor(U.image.width*B),le=Math.floor(U.image.height*B);ze.setTexture2D(U,0),I.copyTexSubImage2D(I.TEXTURE_2D,O,0,0,E.x,E.y,N,le),Me.unbindTexture()},this.copyTextureToTexture=function(E,U,O,B=0){const N=U.image.width,le=U.image.height,me=_e.convert(O.format),xe=_e.convert(O.type);ze.setTexture2D(O,0),I.pixelStorei(I.UNPACK_FLIP_Y_WEBGL,O.flipY),I.pixelStorei(I.UNPACK_PREMULTIPLY_ALPHA_WEBGL,O.premultiplyAlpha),I.pixelStorei(I.UNPACK_ALIGNMENT,O.unpackAlignment),U.isDataTexture?I.texSubImage2D(I.TEXTURE_2D,B,E.x,E.y,N,le,me,xe,U.image.data):U.isCompressedTexture?I.compressedTexSubImage2D(I.TEXTURE_2D,B,E.x,E.y,U.mipmaps[0].width,U.mipmaps[0].height,me,U.mipmaps[0].data):I.texSubImage2D(I.TEXTURE_2D,B,E.x,E.y,me,xe,U.image),B===0&&O.generateMipmaps&&I.generateMipmap(I.TEXTURE_2D),Me.unbindTexture()},this.copyTextureToTexture3D=function(E,U,O,B,N=0){if(M.isWebGL1Renderer){console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: can only be used with WebGL2.");return}const le=Math.round(E.max.x-E.min.x),me=Math.round(E.max.y-E.min.y),xe=E.max.z-E.min.z+1,Se=_e.convert(B.format),Fe=_e.convert(B.type);let Ae;if(B.isData3DTexture)ze.setTexture3D(B,0),Ae=I.TEXTURE_3D;else if(B.isDataArrayTexture||B.isCompressedArrayTexture)ze.setTexture2DArray(B,0),Ae=I.TEXTURE_2D_ARRAY;else{console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: only supports THREE.DataTexture3D and THREE.DataTexture2DArray.");return}I.pixelStorei(I.UNPACK_FLIP_Y_WEBGL,B.flipY),I.pixelStorei(I.UNPACK_PREMULTIPLY_ALPHA_WEBGL,B.premultiplyAlpha),I.pixelStorei(I.UNPACK_ALIGNMENT,B.unpackAlignment);const Re=I.getParameter(I.UNPACK_ROW_LENGTH),ot=I.getParameter(I.UNPACK_IMAGE_HEIGHT),Ot=I.getParameter(I.UNPACK_SKIP_PIXELS),pt=I.getParameter(I.UNPACK_SKIP_ROWS),un=I.getParameter(I.UNPACK_SKIP_IMAGES),st=O.isCompressedTexture?O.mipmaps[N]:O.image;I.pixelStorei(I.UNPACK_ROW_LENGTH,st.width),I.pixelStorei(I.UNPACK_IMAGE_HEIGHT,st.height),I.pixelStorei(I.UNPACK_SKIP_PIXELS,E.min.x),I.pixelStorei(I.UNPACK_SKIP_ROWS,E.min.y),I.pixelStorei(I.UNPACK_SKIP_IMAGES,E.min.z),O.isDataTexture||O.isData3DTexture?I.texSubImage3D(Ae,N,U.x,U.y,U.z,le,me,xe,Se,Fe,st.data):B.isCompressedArrayTexture?I.compressedTexSubImage3D(Ae,N,U.x,U.y,U.z,le,me,xe,Se,st.data):I.texSubImage3D(Ae,N,U.x,U.y,U.z,le,me,xe,Se,Fe,st),I.pixelStorei(I.UNPACK_ROW_LENGTH,Re),I.pixelStorei(I.UNPACK_IMAGE_HEIGHT,ot),I.pixelStorei(I.UNPACK_SKIP_PIXELS,Ot),I.pixelStorei(I.UNPACK_SKIP_ROWS,pt),I.pixelStorei(I.UNPACK_SKIP_IMAGES,un),N===0&&B.generateMipmaps&&I.generateMipmap(Ae),Me.unbindTexture()},this.initTexture=function(E){E.isCubeTexture?ze.setTextureCube(E,0):E.isData3DTexture?ze.setTexture3D(E,0):E.isDataArrayTexture||E.isCompressedArrayTexture?ze.setTexture2DArray(E,0):ze.setTexture2D(E,0),Me.unbindTexture()},this.resetState=function(){R=0,w=0,A=null,Me.reset(),fe.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return xn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorSpace=e===sa?"display-p3":"srgb",t.unpackColorSpace=je.workingColorSpace===Xs?"display-p3":"srgb"}get useLegacyLights(){return console.warn("THREE.WebGLRenderer: The property .useLegacyLights has been deprecated. Migrate your lighting according to the following guide: https://discourse.threejs.org/t/updates-to-lighting-in-three-js-r155/53733."),this._useLegacyLights}set useLegacyLights(e){console.warn("THREE.WebGLRenderer: The property .useLegacyLights has been deprecated. Migrate your lighting according to the following guide: https://discourse.threejs.org/t/updates-to-lighting-in-three-js-r155/53733."),this._useLegacyLights=e}}class eg extends oa{}eg.prototype.isWebGL1Renderer=!0;class la{constructor(e,t=25e-5){this.isFogExp2=!0,this.name="",this.color=new Ve(e),this.density=t}clone(){return new la(this.color,this.density)}toJSON(){return{type:"FogExp2",name:this.name,color:this.color.getHex(),density:this.density}}}class Kl extends _t{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new ln,this.environmentRotation=new ln,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),t.object.environmentRotation=this.environmentRotation.toArray(),t}}class tg extends Pt{constructor(e=null,t=1,n=1,s,r,o,a,l,c=Mt,u=Mt,h,d){super(null,o,a,l,c,u,s,r,h,d),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class al extends ht{constructor(e,t,n,s=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=s}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){const e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}}const yi=new it,ol=new it,Ts=[],ll=new ti,ng=new it,Vi=new Ye,Wi=new ni;class ca extends Ye{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new al(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let s=0;s<n;s++)this.setMatrixAt(s,ng)}computeBoundingBox(){const e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new ti),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,yi),ll.copy(e.boundingBox).applyMatrix4(yi),this.boundingBox.union(ll)}computeBoundingSphere(){const e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new ni),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,yi),Wi.copy(e.boundingSphere).applyMatrix4(yi),this.boundingSphere.union(Wi)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){const n=t.morphTargetInfluences,s=this.morphTexture.source.data.data,r=n.length+1,o=e*r+1;for(let a=0;a<n.length;a++)n[a]=s[o+a]}raycast(e,t){const n=this.matrixWorld,s=this.count;if(Vi.geometry=this.geometry,Vi.material=this.material,Vi.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Wi.copy(this.boundingSphere),Wi.applyMatrix4(n),e.ray.intersectsSphere(Wi)!==!1))for(let r=0;r<s;r++){this.getMatrixAt(r,yi),ol.multiplyMatrices(n,yi),Vi.matrixWorld=ol,Vi.raycast(e,Ts);for(let o=0,a=Ts.length;o<a;o++){const l=Ts[o];l.instanceId=r,l.object=this,t.push(l)}Ts.length=0}}setColorAt(e,t){this.instanceColor===null&&(this.instanceColor=new al(new Float32Array(this.instanceMatrix.count*3),3)),t.toArray(this.instanceColor.array,e*3)}setMatrixAt(e,t){t.toArray(this.instanceMatrix.array,e*16)}setMorphAt(e,t){const n=t.morphTargetInfluences,s=n.length+1;this.morphTexture===null&&(this.morphTexture=new tg(new Float32Array(s*this.count),s,this.count,bl,on));const r=this.morphTexture.source.data.data;let o=0;for(let c=0;c<n.length;c++)o+=n[c];const a=this.geometry.morphTargetsRelative?1:1-o,l=s*e;r[l]=a,r.set(n,l+1)}updateMorphTargets(){}dispose(){this.dispatchEvent({type:"dispose"})}}class Ys extends Di{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new Ve(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}}const cl=new P,ul=new P,hl=new it,Fr=new ra,As=new ni;class $s extends _t{constructor(e=new rt,t=new Ys){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,n=[0];for(let s=1,r=t.count;s<r;s++)cl.fromBufferAttribute(t,s-1),ul.fromBufferAttribute(t,s),n[s]=n[s-1],n[s]+=cl.distanceTo(ul);e.setAttribute("lineDistance",new Ze(n,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){const n=this.geometry,s=this.matrixWorld,r=e.params.Line.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),As.copy(n.boundingSphere),As.applyMatrix4(s),As.radius+=r,e.ray.intersectsSphere(As)===!1)return;hl.copy(s).invert(),Fr.copy(e.ray).applyMatrix4(hl);const a=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=new P,u=new P,h=new P,d=new P,m=this.isLineSegments?2:1,g=n.index,p=n.attributes.position;if(g!==null){const f=Math.max(0,o.start),y=Math.min(g.count,o.start+o.count);for(let M=f,S=y-1;M<S;M+=m){const R=g.getX(M),w=g.getX(M+1);if(c.fromBufferAttribute(p,R),u.fromBufferAttribute(p,w),Fr.distanceSqToSegment(c,u,d,h)>l)continue;d.applyMatrix4(this.matrixWorld);const D=e.ray.origin.distanceTo(d);D<e.near||D>e.far||t.push({distance:D,point:h.clone().applyMatrix4(this.matrixWorld),index:M,face:null,faceIndex:null,object:this})}}else{const f=Math.max(0,o.start),y=Math.min(p.count,o.start+o.count);for(let M=f,S=y-1;M<S;M+=m){if(c.fromBufferAttribute(p,M),u.fromBufferAttribute(p,M+1),Fr.distanceSqToSegment(c,u,d,h)>l)continue;d.applyMatrix4(this.matrixWorld);const w=e.ray.origin.distanceTo(d);w<e.near||w>e.far||t.push({distance:w,point:h.clone().applyMatrix4(this.matrixWorld),index:M,face:null,faceIndex:null,object:this})}}}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){const a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}}const dl=new P,fl=new P;class ig extends $s{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,n=[];for(let s=0,r=t.count;s<r;s+=2)dl.fromBufferAttribute(t,s),fl.fromBufferAttribute(t,s+1),n[s]=s===0?0:n[s-1],n[s+1]=n[s]+dl.distanceTo(fl);e.setAttribute("lineDistance",new Ze(n,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class ua extends Di{constructor(e){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new Ve(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}const pl=new it,Jr=new ra,ws=new ni,Rs=new P;class ha extends _t{constructor(e=new rt,t=new ua){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}raycast(e,t){const n=this.geometry,s=this.matrixWorld,r=e.params.Points.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),ws.copy(n.boundingSphere),ws.applyMatrix4(s),ws.radius+=r,e.ray.intersectsSphere(ws)===!1)return;pl.copy(s).invert(),Jr.copy(e.ray).applyMatrix4(pl);const a=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=n.index,h=n.attributes.position;if(c!==null){const d=Math.max(0,o.start),m=Math.min(c.count,o.start+o.count);for(let g=d,_=m;g<_;g++){const p=c.getX(g);Rs.fromBufferAttribute(h,p),ml(Rs,p,l,s,e,t,this)}}else{const d=Math.max(0,o.start),m=Math.min(h.count,o.start+o.count);for(let g=d,_=m;g<_;g++)Rs.fromBufferAttribute(h,g),ml(Rs,g,l,s,e,t,this)}}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){const a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}}function ml(i,e,t,n,s,r,o){const a=Jr.distanceSqToPoint(i);if(a<t){const l=new P;Jr.closestPointToPoint(i,l),l.applyMatrix4(n);const c=s.ray.origin.distanceTo(l);if(c<s.near||c>s.far)return;r.push({distance:c,distanceToRay:Math.sqrt(a),point:l,index:e,face:null,object:o})}}class Ii extends rt{constructor(e=1,t=32,n=0,s=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:e,segments:t,thetaStart:n,thetaLength:s},t=Math.max(3,t);const r=[],o=[],a=[],l=[],c=new P,u=new He;o.push(0,0,0),a.push(0,0,1),l.push(.5,.5);for(let h=0,d=3;h<=t;h++,d+=3){const m=n+h/t*s;c.x=e*Math.cos(m),c.y=e*Math.sin(m),o.push(c.x,c.y,c.z),a.push(0,0,1),u.x=(o[d]/e+1)/2,u.y=(o[d+1]/e+1)/2,l.push(u.x,u.y)}for(let h=1;h<=t;h++)r.push(h,h+1,0);this.setIndex(r),this.setAttribute("position",new Ze(o,3)),this.setAttribute("normal",new Ze(a,3)),this.setAttribute("uv",new Ze(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Ii(e.radius,e.segments,e.thetaStart,e.thetaLength)}}class ji extends rt{constructor(e=1,t=1,n=1,s=32,r=1,o=!1,a=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:s,heightSegments:r,openEnded:o,thetaStart:a,thetaLength:l};const c=this;s=Math.floor(s),r=Math.floor(r);const u=[],h=[],d=[],m=[];let g=0;const _=[],p=n/2;let f=0;y(),o===!1&&(e>0&&M(!0),t>0&&M(!1)),this.setIndex(u),this.setAttribute("position",new Ze(h,3)),this.setAttribute("normal",new Ze(d,3)),this.setAttribute("uv",new Ze(m,2));function y(){const S=new P,R=new P;let w=0;const A=(t-e)/n;for(let D=0;D<=r;D++){const k=[],v=D/r,T=v*(t-e)+e;for(let q=0;q<=s;q++){const $=q/s,C=$*l+a,W=Math.sin(C),H=Math.cos(C);R.x=T*W,R.y=-v*n+p,R.z=T*H,h.push(R.x,R.y,R.z),S.set(W,A,H).normalize(),d.push(S.x,S.y,S.z),m.push($,1-v),k.push(g++)}_.push(k)}for(let D=0;D<s;D++)for(let k=0;k<r;k++){const v=_[k][D],T=_[k+1][D],q=_[k+1][D+1],$=_[k][D+1];u.push(v,T,$),u.push(T,q,$),w+=6}c.addGroup(f,w,0),f+=w}function M(S){const R=g,w=new He,A=new P;let D=0;const k=S===!0?e:t,v=S===!0?1:-1;for(let q=1;q<=s;q++)h.push(0,p*v,0),d.push(0,v,0),m.push(.5,.5),g++;const T=g;for(let q=0;q<=s;q++){const C=q/s*l+a,W=Math.cos(C),H=Math.sin(C);A.x=k*H,A.y=p*v,A.z=k*W,h.push(A.x,A.y,A.z),d.push(0,v,0),w.x=W*.5+.5,w.y=H*.5*v+.5,m.push(w.x,w.y),g++}for(let q=0;q<s;q++){const $=R+q,C=T+q;S===!0?u.push(C,C+1,$):u.push(C+1,C,$),D+=3}c.addGroup(f,D,S===!0?1:2),f+=D}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new ji(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class da extends ji{constructor(e=1,t=1,n=32,s=1,r=!1,o=0,a=Math.PI*2){super(0,e,t,n,s,r,o,a),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:n,heightSegments:s,openEnded:r,thetaStart:o,thetaLength:a}}static fromJSON(e){return new da(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class Ni extends rt{constructor(e=[],t=[],n=1,s=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:e,indices:t,radius:n,detail:s};const r=[],o=[];a(s),c(n),u(),this.setAttribute("position",new Ze(r,3)),this.setAttribute("normal",new Ze(r.slice(),3)),this.setAttribute("uv",new Ze(o,2)),s===0?this.computeVertexNormals():this.normalizeNormals();function a(y){const M=new P,S=new P,R=new P;for(let w=0;w<t.length;w+=3)m(t[w+0],M),m(t[w+1],S),m(t[w+2],R),l(M,S,R,y)}function l(y,M,S,R){const w=R+1,A=[];for(let D=0;D<=w;D++){A[D]=[];const k=y.clone().lerp(S,D/w),v=M.clone().lerp(S,D/w),T=w-D;for(let q=0;q<=T;q++)q===0&&D===w?A[D][q]=k:A[D][q]=k.clone().lerp(v,q/T)}for(let D=0;D<w;D++)for(let k=0;k<2*(w-D)-1;k++){const v=Math.floor(k/2);k%2===0?(d(A[D][v+1]),d(A[D+1][v]),d(A[D][v])):(d(A[D][v+1]),d(A[D+1][v+1]),d(A[D+1][v]))}}function c(y){const M=new P;for(let S=0;S<r.length;S+=3)M.x=r[S+0],M.y=r[S+1],M.z=r[S+2],M.normalize().multiplyScalar(y),r[S+0]=M.x,r[S+1]=M.y,r[S+2]=M.z}function u(){const y=new P;for(let M=0;M<r.length;M+=3){y.x=r[M+0],y.y=r[M+1],y.z=r[M+2];const S=p(y)/2/Math.PI+.5,R=f(y)/Math.PI+.5;o.push(S,1-R)}g(),h()}function h(){for(let y=0;y<o.length;y+=6){const M=o[y+0],S=o[y+2],R=o[y+4],w=Math.max(M,S,R),A=Math.min(M,S,R);w>.9&&A<.1&&(M<.2&&(o[y+0]+=1),S<.2&&(o[y+2]+=1),R<.2&&(o[y+4]+=1))}}function d(y){r.push(y.x,y.y,y.z)}function m(y,M){const S=y*3;M.x=e[S+0],M.y=e[S+1],M.z=e[S+2]}function g(){const y=new P,M=new P,S=new P,R=new P,w=new He,A=new He,D=new He;for(let k=0,v=0;k<r.length;k+=9,v+=6){y.set(r[k+0],r[k+1],r[k+2]),M.set(r[k+3],r[k+4],r[k+5]),S.set(r[k+6],r[k+7],r[k+8]),w.set(o[v+0],o[v+1]),A.set(o[v+2],o[v+3]),D.set(o[v+4],o[v+5]),R.copy(y).add(M).add(S).divideScalar(3);const T=p(R);_(w,v+0,y,T),_(A,v+2,M,T),_(D,v+4,S,T)}}function _(y,M,S,R){R<0&&y.x===1&&(o[M]=y.x-1),S.x===0&&S.z===0&&(o[M]=R/2/Math.PI+.5)}function p(y){return Math.atan2(y.z,-y.x)}function f(y){return Math.atan2(-y.y,Math.sqrt(y.x*y.x+y.z*y.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Ni(e.vertices,e.indices,e.radius,e.details)}}class fa extends Ni{constructor(e=1,t=0){const n=(1+Math.sqrt(5))/2,s=1/n,r=[-1,-1,-1,-1,-1,1,-1,1,-1,-1,1,1,1,-1,-1,1,-1,1,1,1,-1,1,1,1,0,-s,-n,0,-s,n,0,s,-n,0,s,n,-s,-n,0,-s,n,0,s,-n,0,s,n,0,-n,0,-s,n,0,-s,-n,0,s,n,0,s],o=[3,11,7,3,7,15,3,15,13,7,19,17,7,17,6,7,6,15,17,4,8,17,8,10,17,10,6,8,0,16,8,16,2,8,2,10,0,12,1,0,1,18,0,18,16,6,10,2,6,2,13,6,13,15,2,16,18,2,18,3,2,3,13,18,1,9,18,9,11,18,11,3,4,14,12,4,12,0,4,0,8,11,9,5,11,5,19,11,19,7,19,5,14,19,14,4,19,4,17,1,12,14,1,14,5,1,5,9];super(r,o,e,t),this.type="DodecahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new fa(e.radius,e.detail)}}const Cs=new P,Ps=new P,Or=new P,Ls=new en;class sg extends rt{constructor(e=null,t=1){if(super(),this.type="EdgesGeometry",this.parameters={geometry:e,thresholdAngle:t},e!==null){const s=Math.pow(10,4),r=Math.cos(Ds*t),o=e.getIndex(),a=e.getAttribute("position"),l=o?o.count:a.count,c=[0,0,0],u=["a","b","c"],h=new Array(3),d={},m=[];for(let g=0;g<l;g+=3){o?(c[0]=o.getX(g),c[1]=o.getX(g+1),c[2]=o.getX(g+2)):(c[0]=g,c[1]=g+1,c[2]=g+2);const{a:_,b:p,c:f}=Ls;if(_.fromBufferAttribute(a,c[0]),p.fromBufferAttribute(a,c[1]),f.fromBufferAttribute(a,c[2]),Ls.getNormal(Or),h[0]=`${Math.round(_.x*s)},${Math.round(_.y*s)},${Math.round(_.z*s)}`,h[1]=`${Math.round(p.x*s)},${Math.round(p.y*s)},${Math.round(p.z*s)}`,h[2]=`${Math.round(f.x*s)},${Math.round(f.y*s)},${Math.round(f.z*s)}`,!(h[0]===h[1]||h[1]===h[2]||h[2]===h[0]))for(let y=0;y<3;y++){const M=(y+1)%3,S=h[y],R=h[M],w=Ls[u[y]],A=Ls[u[M]],D=`${S}_${R}`,k=`${R}_${S}`;k in d&&d[k]?(Or.dot(d[k].normal)<=r&&(m.push(w.x,w.y,w.z),m.push(A.x,A.y,A.z)),d[k]=null):D in d||(d[D]={index0:c[y],index1:c[M],normal:Or.clone()})}}for(const g in d)if(d[g]){const{index0:_,index1:p}=d[g];Cs.fromBufferAttribute(a,_),Ps.fromBufferAttribute(a,p),m.push(Cs.x,Cs.y,Cs.z),m.push(Ps.x,Ps.y,Ps.z)}this.setAttribute("position",new Ze(m,3))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}}class pa extends Ni{constructor(e=1,t=0){const n=(1+Math.sqrt(5))/2,s=[-1,n,0,1,n,0,-1,-n,0,1,-n,0,0,-1,n,0,1,n,0,-1,-n,0,1,-n,n,0,-1,n,0,1,-n,0,-1,-n,0,1],r=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(s,r,e,t),this.type="IcosahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new pa(e.radius,e.detail)}}class ma extends Ni{constructor(e=1,t=0){const n=[1,0,0,-1,0,0,0,1,0,0,-1,0,0,0,1,0,0,-1],s=[0,2,4,0,4,3,0,3,5,0,5,2,1,2,5,1,5,3,1,3,4,1,4,2];super(n,s,e,t),this.type="OctahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new ma(e.radius,e.detail)}}class Ks extends rt{constructor(e=.5,t=1,n=32,s=1,r=0,o=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:e,outerRadius:t,thetaSegments:n,phiSegments:s,thetaStart:r,thetaLength:o},n=Math.max(3,n),s=Math.max(1,s);const a=[],l=[],c=[],u=[];let h=e;const d=(t-e)/s,m=new P,g=new He;for(let _=0;_<=s;_++){for(let p=0;p<=n;p++){const f=r+p/n*o;m.x=h*Math.cos(f),m.y=h*Math.sin(f),l.push(m.x,m.y,m.z),c.push(0,0,1),g.x=(m.x/t+1)/2,g.y=(m.y/t+1)/2,u.push(g.x,g.y)}h+=d}for(let _=0;_<s;_++){const p=_*(n+1);for(let f=0;f<n;f++){const y=f+p,M=y,S=y+n+1,R=y+n+2,w=y+1;a.push(M,S,w),a.push(S,R,w)}}this.setIndex(a),this.setAttribute("position",new Ze(l,3)),this.setAttribute("normal",new Ze(c,3)),this.setAttribute("uv",new Ze(u,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Ks(e.innerRadius,e.outerRadius,e.thetaSegments,e.phiSegments,e.thetaStart,e.thetaLength)}}class Zi extends rt{constructor(e=1,t=32,n=16,s=0,r=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:s,phiLength:r,thetaStart:o,thetaLength:a},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));const l=Math.min(o+a,Math.PI);let c=0;const u=[],h=new P,d=new P,m=[],g=[],_=[],p=[];for(let f=0;f<=n;f++){const y=[],M=f/n;let S=0;f===0&&o===0?S=.5/t:f===n&&l===Math.PI&&(S=-.5/t);for(let R=0;R<=t;R++){const w=R/t;h.x=-e*Math.cos(s+w*r)*Math.sin(o+M*a),h.y=e*Math.cos(o+M*a),h.z=e*Math.sin(s+w*r)*Math.sin(o+M*a),g.push(h.x,h.y,h.z),d.copy(h).normalize(),_.push(d.x,d.y,d.z),p.push(w+S,1-M),y.push(c++)}u.push(y)}for(let f=0;f<n;f++)for(let y=0;y<t;y++){const M=u[f][y+1],S=u[f][y],R=u[f+1][y],w=u[f+1][y+1];(f!==0||o>0)&&m.push(M,S,w),(f!==n-1||l<Math.PI)&&m.push(S,R,w)}this.setIndex(m),this.setAttribute("position",new Ze(g,3)),this.setAttribute("normal",new Ze(_,3)),this.setAttribute("uv",new Ze(p,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Zi(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}}class ga extends Ni{constructor(e=1,t=0){const n=[1,1,1,-1,-1,1,-1,1,-1,1,-1,-1],s=[2,1,0,0,3,2,1,3,0,2,3,1];super(n,s,e,t),this.type="TetrahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new ga(e.radius,e.detail)}}class Ji extends rt{constructor(e=1,t=.4,n=12,s=48,r=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:e,tube:t,radialSegments:n,tubularSegments:s,arc:r},n=Math.floor(n),s=Math.floor(s);const o=[],a=[],l=[],c=[],u=new P,h=new P,d=new P;for(let m=0;m<=n;m++)for(let g=0;g<=s;g++){const _=g/s*r,p=m/n*Math.PI*2;h.x=(e+t*Math.cos(p))*Math.cos(_),h.y=(e+t*Math.cos(p))*Math.sin(_),h.z=t*Math.sin(p),a.push(h.x,h.y,h.z),u.x=e*Math.cos(_),u.y=e*Math.sin(_),d.subVectors(h,u).normalize(),l.push(d.x,d.y,d.z),c.push(g/s),c.push(m/n)}for(let m=1;m<=n;m++)for(let g=1;g<=s;g++){const _=(s+1)*m+g-1,p=(s+1)*(m-1)+g-1,f=(s+1)*(m-1)+g,y=(s+1)*m+g;o.push(_,p,y),o.push(p,f,y)}this.setIndex(o),this.setAttribute("position",new Ze(a,3)),this.setAttribute("normal",new Ze(l,3)),this.setAttribute("uv",new Ze(c,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Ji(e.radius,e.tube,e.radialSegments,e.tubularSegments,e.arc)}}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:na}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=na);class rg{renderer=null;scene=null;camera=null;canvas;palette;mode=null;meshes=[];clock=0;constructor(e,t){this.canvas=e,this.palette=t}init(){try{return this.renderer=new oa({canvas:this.canvas,antialias:!0,alpha:!1}),this.renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2)),this.scene=new Kl,this.scene.background=new Ve(0),this.camera=new Gt(60,1,.1,100),this.camera.position.z=3.2,this.resize(),!0}catch{return!1}}resize(){if(!this.renderer||!this.camera)return;const e=this.canvas.clientWidth||window.innerWidth,t=this.canvas.clientHeight||window.innerHeight,n=Math.min(window.devicePixelRatio||1,2);this.renderer.setSize(e,t,!1),this.renderer.setPixelRatio(n),this.canvas.width=Math.floor(e*n),this.canvas.height=Math.floor(t*n),this.camera.aspect=e/t,this.camera.updateProjectionMatrix()}setMode(e){this.mode=e,this.clear(),this.scene&&(e.id==="flower"?this.buildFlower():e.id==="orbit-rings"?this.buildRings():e.id==="neon-tunnel"?this.buildTunnel():e.id==="hex-pulse"?this.buildHex():e.id==="kaleido"?this.buildKaleido():e.id==="cosmic-nebula"?this.buildNebula():e.id.startsWith("hybrid")||e.id==="bloom-grid"?this.buildHybrid():this.buildFlower())}clear(){this.scene&&(this.meshes.forEach(e=>this.scene.remove(e)),this.meshes=[])}buildNebula(){const t=new rt,n=new Float32Array(2e3*3),s=new Float32Array(2e3*3);for(let a=0;a<2e3;a++){const l=.2+Math.random()*2.2,c=Math.random()*Math.PI*2,u=(Math.random()-.5)*Math.PI*.8;n[a*3]=l*Math.cos(c)*Math.cos(u),n[a*3+1]=l*Math.sin(u),n[a*3+2]=l*Math.sin(c)*Math.cos(u);const h=this.palette.sample(Math.random());s[a*3]=h.r,s[a*3+1]=h.g,s[a*3+2]=h.b}t.setAttribute("position",new ht(n,3)),t.setAttribute("color",new ht(s,3));const r=new ua({size:.04,vertexColors:!0,transparent:!0,opacity:.8,blending:Jn}),o=new ha(t,r);this.scene.add(o),this.meshes.push(o)}buildFlower(){const e=new gt,t=9;for(let n=0;n<t;n++){const s=new Ii(.18,32,0,Math.PI*.9),r=new nn({color:16711772,transparent:!0,opacity:.55,side:qt}),o=new Ye(s,r);o.rotation.z=n/t*Math.PI*2,o.position.set(Math.cos(o.rotation.z)*.35,Math.sin(o.rotation.z)*.35,0),o.rotation.x=.5,e.add(o)}this.scene.add(e),this.meshes.push(e)}buildRings(){const e=new gt;for(let t=0;t<5;t++){const n=new Ks(.35+t*.18,.37+t*.18,128),s=new nn({color:58879,transparent:!0,opacity:.45,side:qt}),r=new Ye(n,s);r.rotation.x=Math.PI*.15*t,e.add(r)}this.scene.add(e),this.meshes.push(e)}buildTunnel(){const e=new gt;for(let t=0;t<12;t++){const n=.2+t*.16,s=new cn(n,n,.04),r=new sg(s),o=new Ys({color:9494767,transparent:!0,opacity:.6-t*.04}),a=new ig(r,o);a.position.z=-t*.28,e.add(a)}this.scene.add(e),this.meshes.push(e)}buildHex(){const e=new gt,t=8*6;for(let n=0;n<t;n++){const s=new ji(.08,.08,.1,6),r=new nn({color:7929600,transparent:!0,opacity:.52}),o=new Ye(s,r),a=n%8-3.5,l=Math.floor(n/8)-3;o.position.set(a*.28,l*.32,0),e.add(o)}this.scene.add(e),this.meshes.push(e)}buildKaleido(){const e=new gt,t=6;for(let n=0;n<t;n++){const s=new ei(1.8,.04),r=new nn({color:13073919,transparent:!0,opacity:.6}),o=new Ye(s,r);o.rotation.z=n/t*Math.PI,e.add(o)}this.scene.add(e),this.meshes.push(e)}buildHybrid(){this.buildFlower()}frame(e,t,n){if(!this.renderer||!this.scene||!this.camera)return;this.clock=e;const s=t.band,r=s.bass?.norm||0,o=s.mid?.norm||0,a=s.air?.onset||0,l=Math.max(.1,n.zoom||1),c=(n.pan?.x||0)*3,u=(n.pan?.y||0)*3;let h=0;n.flyThrough&&(h=Math.sin(e*5e-4*(n.flySpeed||1))*.8),this.camera.position.set(c+h,u,3.2/l+Math.sin(e*2e-4)*.3),this.camera.lookAt(c,u,0);const d=this.mode?.id;if(d==="flower"){const m=this.meshes[0];m&&(m.rotation.z+=35e-5+o*.0012,m.scale.setScalar(.9+r*.55+t.beatPulse*.12)),this.scene.background=new Ve().setHSL(performance.now()*3e-5%1,.85,.06+a*.04)}else if(d==="orbit-rings")this.meshes[0]?.children.forEach((m,g)=>{m.rotation.z+=12e-5*(1+g*.2)+o*.001,m.scale.setScalar(1+t.bandsNorm[g*4]*.12)});else if(d==="neon-tunnel")this.meshes[0]?.children.forEach((m,g)=>{m.position.z+=.002+r*.006,m.position.z>1&&(m.position.z=-3.5)});else if(d==="hex-pulse")this.meshes[0]?.children.forEach((m,g)=>{const _=t.bandsNorm[g%64];m.scale.setScalar(.6+_*.9),m.rotation.y+=.005+_*.02});else if(d==="kaleido")this.meshes[0]?.rotation.set(0,0,e*12e-5);else if(d==="cosmic-nebula"&&this.meshes[0]){this.meshes[0].rotation.y+=.001+o*.003,this.meshes[0].rotation.z+=5e-4+r*.002;const m=1+r*.35+t.beatPulse*.15;this.meshes[0].scale.set(m,m,m)}if(d?.startsWith("hybrid")||d==="bloom-grid"){const m=window.FluidSimInstance;if(m&&m.isReady&&m.isReady()&&t.beat){const g=Math.random()*Math.PI*2;m.splat(.5+Math.cos(g)*.12,.5+Math.sin(g)*.12,Math.cos(g)*12,Math.sin(g)*12,this.palette.hdr(Math.random(),3.2))}}this.renderer.render(this.scene,this.camera)}}const ag=[{id:"flower",name:"Bloom Flower",group:"Geometry · Organic"},{id:"orbit-rings",name:"Orbit Rings",group:"Geometry · Minimal"},{id:"neon-tunnel",name:"Neon Tunnel",group:"Geometry · Minimal"},{id:"hex-pulse",name:"Hex Pulse",group:"Geometry · Lattice"},{id:"kaleido",name:"Kaleidoscope",group:"Geometry · Symmetry"},{id:"cosmic-nebula",name:"Cosmic Dust Nebula",group:"Particle · 3D Vortex"},{id:"bloom-grid",name:"Bloom Grid (Hybrid)",group:"Hybrid · Fluid-Geometry"},{id:"hybrid-mandala",name:"Fractal Mandala (Hybrid)",group:"Hybrid · Fractal-Geometry"}],og=`#version 300 es
precision highp float;
in vec2 aPosition;
void main() { gl_Position = vec4(aPosition, 0.0, 1.0); }`,lg=`#version 300 es
precision highp float;
out vec4 fragColor;

uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform float uBass;
uniform float uMid;
uniform float uTreble;
uniform float uEnergy;
uniform float uBeatPulse;
uniform float uZoom;
uniform vec2 uPan;
uniform float uSpeedScale;
uniform float uDetail;
uniform sampler2D uPal;
uniform float uPalShift;

#define PI 3.14159265359

vec3 samplePal(float t) {
  return texture(uPal, vec2(fract(t + uPalShift), 0.5)).rgb;
}

mat2 rot(float a) {
  float c = cos(a), s = sin(a);
  return mat2(c, -s, s, c);
}

void main() {
  vec2 uv = (gl_FragCoord.xy / uRes - 0.5) * vec2(uRes.x / uRes.y, 1.0);
  vec2 mouseOffset = (uMouse - 0.5) * 0.4;
  uv += mouseOffset - uPan;
  uv /= max(0.001, uZoom);

  float radius = length(uv);
  float angle = atan(uv.y, uv.x);

  // Field of View & Warp Speed driven by audio bass, beat pulse, and speed scale
  float speed = uTime * (0.8 + uBass * 2.2 + uBeatPulse * 1.5) * uSpeedScale;
  float z = 1.0 / (radius + 0.02);

  vec2 tunnelUV = vec2(angle / (2.0 * PI) + 0.5, z + speed);
  tunnelUV.x *= (6.0 + floor(uDetail * 6.0)); // Detail lines

  // Grid pattern & speed lines
  float gridLines = smoothstep(0.04, 0.08, abs(fract(tunnelUV.x) - 0.5));
  float ringPulse = smoothstep(0.1, 0.25, abs(fract(tunnelUV.y * 0.5) - 0.5));

  // Starfield particle specks
  vec2 starUV = floor(tunnelUV * 12.0);
  float starHash = fract(sin(dot(starUV, vec2(12.9898, 78.233))) * 43758.5453);
  float star = step(0.94 - uTreble * 0.05, starHash) * (0.5 + 0.5 * sin(uTime * 10.0 + starHash * 6.28));

  // Color gradient sample
  float palIdx = z * 0.08 + uTime * 0.05;
  vec3 baseColor = samplePal(palIdx);

  vec3 col = baseColor * (gridLines * 0.4 + ringPulse * 0.8 + star * 1.5);
  col += vec3(0.1, 0.5, 1.0) * (0.15 / (radius + 0.05)) * (0.4 + uBass * 0.8);
  col *= smoothstep(0.0, 0.15, radius); // Center tunnel glow

  // Vignette
  col *= smoothstep(1.4, 0.3, radius);

  // Chromatic aberration on beat hit
  if (uBeatPulse > 0.3) {
    col.r += samplePal(palIdx + 0.04).r * uBeatPulse * 0.3;
    col.b += samplePal(palIdx - 0.04).b * uBeatPulse * 0.3;
  }

  // Tone mapping
  col = col / (1.0 + col);
  col = pow(col, vec3(1.0 / 2.2));

  fragColor = vec4(col, 1.0);
}`;class cg{gl=null;canvas;palette;prog=null;quad=null;palTex=null;uniforms={};ready=!1;constructor(e,t){this.canvas=e,this.palette=t}init(){if(this.gl=this.canvas.getContext("webgl2",{alpha:!1}),!this.gl)return!1;const e=this.gl.createShader(this.gl.VERTEX_SHADER);this.gl.shaderSource(e,og),this.gl.compileShader(e);const t=this.gl.createShader(this.gl.FRAGMENT_SHADER);return this.gl.shaderSource(t,lg),this.gl.compileShader(t),this.gl.getShaderParameter(t,this.gl.COMPILE_STATUS)?(this.prog=this.gl.createProgram(),this.gl.attachShader(this.prog,e),this.gl.attachShader(this.prog,t),this.gl.bindAttribLocation(this.prog,0,"aPosition"),this.gl.linkProgram(this.prog),["uRes","uTime","uMouse","uBass","uMid","uTreble","uEnergy","uBeatPulse","uZoom","uPan","uSpeedScale","uDetail","uPal","uPalShift"].forEach(s=>this.uniforms[s]=this.gl.getUniformLocation(this.prog,s)),this.quad=this.gl.createBuffer(),this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.quad),this.gl.bufferData(this.gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),this.gl.STATIC_DRAW),this.palTex=this.gl.createTexture(),this.updatePalette(),this.ready=!0,this.resize(),!0):(console.error("WarpEngine shader fail:",this.gl.getShaderInfoLog(t)),!1)}resize(){if(!this.gl)return;const e=Math.min(window.devicePixelRatio||1,2),t=Math.floor((this.canvas.clientWidth||window.innerWidth)*e),n=Math.floor((this.canvas.clientHeight||window.innerHeight)*e);(this.canvas.width!==t||this.canvas.height!==n)&&(this.canvas.width=t,this.canvas.height=n)}updatePalette(){if(!this.gl||!this.palTex)return;const e=256,t=new Uint8Array(e*4);for(let n=0;n<e;n++){const s=this.palette.sample(n/e);t[n*4]=Math.round(s.r*255),t[n*4+1]=Math.round(s.g*255),t[n*4+2]=Math.round(s.b*255),t[n*4+3]=255}this.gl.bindTexture(this.gl.TEXTURE_2D,this.palTex),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_MIN_FILTER,this.gl.LINEAR),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_MAG_FILTER,this.gl.LINEAR),this.gl.texImage2D(this.gl.TEXTURE_2D,0,this.gl.RGBA,e,1,0,this.gl.RGBA,this.gl.UNSIGNED_BYTE,t)}render(e,t,n,s={}){!this.ready||!this.gl||!this.prog||(this.updatePalette(),this.gl.useProgram(this.prog),this.gl.viewport(0,0,this.canvas.width,this.canvas.height),this.gl.uniform2f(this.uniforms.uRes,this.canvas.width,this.canvas.height),this.gl.uniform1f(this.uniforms.uTime,e*.001),this.gl.uniform2f(this.uniforms.uMouse,n.x,n.y),this.gl.uniform1f(this.uniforms.uBass,t.bass||0),this.gl.uniform1f(this.uniforms.uMid,t.mid||0),this.gl.uniform1f(this.uniforms.uTreble,t.treble||0),this.gl.uniform1f(this.uniforms.uEnergy,t.energy||0),this.gl.uniform1f(this.uniforms.uBeatPulse,t.beatPulse||0),this.gl.uniform1f(this.uniforms.uZoom,s.zoom??1),this.gl.uniform2f(this.uniforms.uPan,s.pan?.x||0,s.pan?.y||0),this.gl.uniform1f(this.uniforms.uSpeedScale,(s.flySpeed??1)*(s.fly?1.6:1)),this.gl.uniform1f(this.uniforms.uDetail,s.detail??.6),this.gl.uniform1f(this.uniforms.uPalShift,this.palette.flow(0,.01)%1),this.gl.activeTexture(this.gl.TEXTURE0),this.gl.bindTexture(this.gl.TEXTURE_2D,this.palTex),this.gl.uniform1i(this.uniforms.uPal,0),this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.quad),this.gl.vertexAttribPointer(0,2,this.gl.FLOAT,!1,0,0),this.gl.enableVertexAttribArray(0),this.gl.drawArrays(this.gl.TRIANGLES,0,3))}}const ug=`#version 300 es
precision highp float;
in vec2 aPosition;
void main() { gl_Position = vec4(aPosition, 0.0, 1.0); }`,hg=`#version 300 es
precision highp float;
out vec4 fragColor;

uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform float uBass;
uniform float uMid;
uniform float uTreble;
uniform float uEnergy;
uniform float uBeatPulse;
uniform float uZoom;
uniform vec2 uPan;
uniform float uSpeedScale;
uniform float uDetail;
uniform float uSpectrum[16];
uniform sampler2D uPal;
uniform float uPalShift;

vec3 samplePal(float t) {
  return texture(uPal, vec2(fract(t + uPalShift), 0.5)).rgb;
}

mat2 rot(float a) {
  float c = cos(a), s = sin(a);
  return mat2(c, -s, s, c);
}

void main() {
  vec2 uv = (gl_FragCoord.xy / uRes - 0.5) * vec2(uRes.x / uRes.y, 1.0);
  vec2 mouseOffset = (uMouse - 0.5) * 0.3;
  uv += mouseOffset - uPan;
  uv /= max(0.001, uZoom);

  vec3 col = vec3(0.02, 0.01, 0.05); // Deep space background

  // Horizon line
  float horizon = -0.05 + sin(uTime * 0.5) * 0.02;

  if (uv.y > horizon) {
    // Sky region: Synthwave Pulsing Horizon Sun & Starfield
    vec2 sunPos = vec2(0.0, horizon + 0.28);
    float sunDist = length(uv - sunPos);
    float sunRadius = (0.22 + uBass * 0.08 + uBeatPulse * 0.05) * min(2.0, max(0.5, uZoom));

    if (sunDist < sunRadius) {
      // Horizontal sun cuts
      float cut = step(0.015, fract((uv.y - sunPos.y + sunRadius) * (20.0 + uDetail * 20.0)));
      vec3 sunCol = mix(vec3(1.0, 0.2, 0.5), vec3(1.0, 0.8, 0.1), (uv.y - sunPos.y + sunRadius) / (sunRadius * 2.0));
      col = mix(col, sunCol, cut);
    } else {
      // Sun glow halo
      float halo = smoothstep(sunRadius + 0.3, sunRadius, sunDist) * (0.6 + uBass * 0.8);
      col += vec3(0.9, 0.1, 0.6) * halo;
    }

    // Sky gradient & stars
    float skyGrad = smoothstep(horizon, 0.6, uv.y);
    col = mix(col, samplePal(skyGrad * 0.4 + uTime * 0.02) * 0.3, 0.4);

    vec2 starUV = floor(uv * (30.0 + uDetail * 30.0));
    float starHash = fract(sin(dot(starUV, vec2(12.9898, 78.233))) * 43758.5453);
    float star = step(0.96 - uTreble * 0.03, starHash) * (0.3 + 0.7 * sin(uTime * 8.0 + starHash * 6.28));
    col += vec3(star) * vec3(0.6, 0.8, 1.0);
  } else {
    // Ground region: 3D Cyber Grid Perspective Projection
    float pY = (horizon - uv.y) + 0.001;
    float z = 1.0 / pY; // Depth projection
    vec2 p3d = vec2(uv.x * z, z + uTime * (1.5 + uBass * 2.0) * uSpeedScale);

    // Spectrum elevation displacement mapping along grid x
    float specIdx = clamp(abs(p3d.x) * 1.5, 0.0, 15.0);
    int idx = int(specIdx);
    float specVal = uSpectrum[idx];
    float elevation = specVal * 0.6 * (0.5 + 0.5 * sin(p3d.y * 0.5));

    // Grid lines calculation
    vec2 gridUV = fract(p3d);
    float lineX = smoothstep(0.06 + elevation * 0.08, 0.01, abs(gridUV.x - 0.5));
    float lineY = smoothstep(0.06 + elevation * 0.08, 0.01, abs(gridUV.y - 0.5));
    float grid = max(lineX, lineY);

    // Fog fading toward horizon
    float fog = smoothstep(0.0, 0.8, (horizon - uv.y) * 4.0);
    vec3 gridCol = samplePal(z * 0.03 + uTime * 0.02) * (1.2 + uBeatPulse * 1.0);

    col = mix(col, gridCol * (grid + elevation * 0.8), fog);

    // Ground glow pulse
    col += vec3(0.0, 0.8, 1.0) * (0.04 / (horizon - uv.y)) * (0.3 + uBass * 0.7);
  }

  // Tone mapping
  col = col / (1.0 + col);
  col = pow(col, vec3(1.0 / 2.2));

  fragColor = vec4(col, 1.0);
}`;class dg{gl=null;canvas;palette;prog=null;quad=null;palTex=null;uniforms={};ready=!1;constructor(e,t){this.canvas=e,this.palette=t}init(){if(this.gl=this.canvas.getContext("webgl2",{alpha:!1}),!this.gl)return!1;const e=this.gl.createShader(this.gl.VERTEX_SHADER);this.gl.shaderSource(e,ug),this.gl.compileShader(e);const t=this.gl.createShader(this.gl.FRAGMENT_SHADER);if(this.gl.shaderSource(t,hg),this.gl.compileShader(t),!this.gl.getShaderParameter(t,this.gl.COMPILE_STATUS))return console.error("CyberGridEngine shader fail:",this.gl.getShaderInfoLog(t)),!1;this.prog=this.gl.createProgram(),this.gl.attachShader(this.prog,e),this.gl.attachShader(this.prog,t),this.gl.bindAttribLocation(this.prog,0,"aPosition"),this.gl.linkProgram(this.prog),["uRes","uTime","uMouse","uBass","uMid","uTreble","uEnergy","uBeatPulse","uZoom","uPan","uSpeedScale","uDetail","uPal","uPalShift"].forEach(s=>this.uniforms[s]=this.gl.getUniformLocation(this.prog,s));for(let s=0;s<16;s++)this.uniforms[`uSpectrum[${s}]`]=this.gl.getUniformLocation(this.prog,`uSpectrum[${s}]`);return this.quad=this.gl.createBuffer(),this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.quad),this.gl.bufferData(this.gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),this.gl.STATIC_DRAW),this.palTex=this.gl.createTexture(),this.updatePalette(),this.ready=!0,this.resize(),!0}resize(){if(!this.gl)return;const e=Math.min(window.devicePixelRatio||1,2),t=Math.floor((this.canvas.clientWidth||window.innerWidth)*e),n=Math.floor((this.canvas.clientHeight||window.innerHeight)*e);(this.canvas.width!==t||this.canvas.height!==n)&&(this.canvas.width=t,this.canvas.height=n)}updatePalette(){if(!this.gl||!this.palTex)return;const e=256,t=new Uint8Array(e*4);for(let n=0;n<e;n++){const s=this.palette.sample(n/e);t[n*4]=Math.round(s.r*255),t[n*4+1]=Math.round(s.g*255),t[n*4+2]=Math.round(s.b*255),t[n*4+3]=255}this.gl.bindTexture(this.gl.TEXTURE_2D,this.palTex),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_MIN_FILTER,this.gl.LINEAR),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_MAG_FILTER,this.gl.LINEAR),this.gl.texImage2D(this.gl.TEXTURE_2D,0,this.gl.RGBA,e,1,0,this.gl.RGBA,this.gl.UNSIGNED_BYTE,t)}render(e,t,n,s={}){if(!(!this.ready||!this.gl||!this.prog)){if(this.updatePalette(),this.gl.useProgram(this.prog),this.gl.viewport(0,0,this.canvas.width,this.canvas.height),this.gl.uniform2f(this.uniforms.uRes,this.canvas.width,this.canvas.height),this.gl.uniform1f(this.uniforms.uTime,e*.001),this.gl.uniform2f(this.uniforms.uMouse,n.x,n.y),this.gl.uniform1f(this.uniforms.uBass,t.bass||0),this.gl.uniform1f(this.uniforms.uMid,t.mid||0),this.gl.uniform1f(this.uniforms.uTreble,t.treble||0),this.gl.uniform1f(this.uniforms.uEnergy,t.energy||0),this.gl.uniform1f(this.uniforms.uBeatPulse,t.beatPulse||0),this.gl.uniform1f(this.uniforms.uZoom,s.zoom??1),this.gl.uniform2f(this.uniforms.uPan,s.pan?.x||0,s.pan?.y||0),this.gl.uniform1f(this.uniforms.uSpeedScale,(s.flySpeed??1)*(s.fly?1.6:1)),this.gl.uniform1f(this.uniforms.uDetail,s.detail??.6),this.gl.uniform1f(this.uniforms.uPalShift,this.palette.flow(0,.01)%1),t.bandsNorm)for(let r=0;r<16;r++){const o=t.bandsNorm[r*4]||0,a=this.uniforms[`uSpectrum[${r}]`];a&&this.gl.uniform1f(a,o)}this.gl.activeTexture(this.gl.TEXTURE0),this.gl.bindTexture(this.gl.TEXTURE_2D,this.palTex),this.gl.uniform1i(this.uniforms.uPal,0),this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.quad),this.gl.vertexAttribPointer(0,2,this.gl.FLOAT,!1,0,0),this.gl.enableVertexAttribArray(0),this.gl.drawArrays(this.gl.TRIANGLES,0,3)}}}const fg=[{id:"hyperspace-warp",name:"Hyperspace Warp Tunnel",group:"Warp · Hyperspace",engine:"warp"}],pg=[{id:"quantum-grid",name:"Quantum Cyber Grid",group:"Cyber · Synthwave",engine:"cyber"}],mg=[{id:"julia-flow",name:"Julia Bloom Flow",group:"Fluid · Kinetic",engine:"fluid",physics:{diss:.988,vort:16,visc:.1,radius:.055}},{id:"spectrum-fountain",name:"Spectrum Fountain",group:"Fluid · Spectral",engine:"fluid",physics:{diss:.972,vort:28,visc:.18,radius:.16}},{id:"kaleidofluid",name:"Kaleidofluid",group:"Fluid · Symmetry",engine:"fluid",fractal:.35,physics:{diss:.984,vort:38,visc:.2,radius:.18}},{id:"attractor-bloom",name:"Attractor Bloom",group:"Fluid · Kinetic",engine:"fluid",fractal:.2,physics:{diss:.991,vort:34,visc:.1,radius:.1}}],gg=[{id:"plasma-vortex",name:"Plasma Vortex",group:"Fractal · Psychedelic",engine:"fractal",shader:"plasma",detail:.75,timeScale:1e-4,palSpeed:3e-4},{id:"sacred-geometry",name:"Sacred Geometry",group:"Geometry · Sacred",engine:"fractal",shader:"sacred",detail:.7,timeScale:1e-4,palSpeed:2e-4},{id:"julia-bloom",name:"Julia Bloom",group:"Fractal · Endless",engine:"fractal",shader:"julia",detail:.65,timeScale:1e-4,palSpeed:2e-4},{id:"mandala",name:"Third Eye Mandala",group:"Fractal · Endless",engine:"fractal",shader:"mandala",detail:.6}];function _g(i){return{id:i.id+"-3d",name:i.name+" 3D",group:i.group.split(" · ")[0]+" · 3D Flight",engine:"world3d",world:i.id}}function vg(){const i=[];return fg.forEach(e=>i.push(e)),pg.forEach(e=>i.push(e)),gg.forEach(e=>i.push(e)),mg.forEach(e=>i.push(e)),ag.forEach(e=>i.push({...e,engine:"geometry"})),[...i,...i.map(_g)]}function xg(i,e,t){i.innerHTML=`
  <header id="top-hud">
    <div class="hud-brand">
      <span class="hud-logo">MusicViz</span>
      <span id="hud-track-name" class="hud-track">Demo Rave 140 BPM</span>
    </div>
    <div class="hud-controls">
      <button id="b-hud-prev" class="hud-btn" title="Previous Mode ( [ )">‹</button>
      <select id="hud-sel-mode" style="max-width: 140px; padding: 4px 8px; font-size: 11px;"></select>
      <button id="b-hud-next" class="hud-btn" title="Next Mode ( ] )">›</button>
      <button id="b-hud-rand" class="hud-btn" title="Random Mode ( R )">🔀</button>
      <button id="b-hud-fly" class="hud-btn primary" title="Toggle 3D Bird Flight Simulator ( V )">🕊️ Fly</button>
      <button id="b-hud-vr" class="hud-btn accent" title="Enter WebXR VR ( 6DOF Flight )">🥽 VR</button>
      <button id="b-hud-fs" class="hud-btn" title="Toggle Fullscreen ( F )">⛶</button>
    </div>
  </header>

  <button id="ptoggle" aria-label="Toggle Control Drawer">‹</button>

  <aside id="panel">
    <div class="ph">
      <span class="pt">Visualizer Control Drawer</span>
      <span class="phint">H hide · F full · V fly · R random</span>
    </div>

    <section class="sec" data-sec="source">
      <div class="sh"><span class="chev">▼</span>Audio Source & Input</div>
      <div class="sb">
        <div class="grid3">
          <button id="b-sys" class="primary">System</button>
          <button id="b-mic">Mic</button>
          <button id="b-file">File</button>
        </div>
        <input id="f-input" type="file" accept="audio/*" hidden />
        <div class="card">
          <label>Instant Demo — 0-friction rave <span id="demo-label" class="hint">140 BPM</span></label>
          <div class="grid3">
            <button id="b-demo" class="accent">▶ Demo Rave</button>
            <button id="b-demo-next">Next</button>
            <button id="b-demo-stop">■ Stop</button>
          </div>
          <div class="note">Pre-loaded high-energy electronic track drives analyser directly.</div>
        </div>
        <div class="card" style="border-color: rgba(29,185,84,0.35); background: rgba(29,185,84,0.08);">
          <label>Spotify Player — paste playlist link</label>
          <div class="row">
            <input id="sp-url" placeholder="https://open.spotify.com/playlist/..." />
            <button id="b-sp" class="primary" style="background:#1db954; border-color:#1db954; color:#06210f; font-weight:700;">Load</button>
          </div>
          <div id="sp-embed-wrap" style="display:none; margin-top:8px;">
            <iframe id="sp-embed" style="border-radius:12px; width:100%; height:320px; border:0; background:#121212;" src="about:blank" loading="lazy" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe>
            <button id="b-sp-capture" class="primary" style="width:100%; margin-top:8px; background:#1db954; border-color:#1db954; color:#06210f;">Listen to this player (tab capture)</button>
          </div>
        </div>
        <div class="card">
          <label>YouTube / Direct MP3 URL</label>
          <div class="row">
            <input id="yt-url" placeholder="https://youtube.com/watch?v=... or direct .mp3 URL" />
            <button id="b-yt">Play</button>
          </div>
        </div>
        <div class="status" id="s-status"><span class="dot"></span><span id="s-text">No audio source</span></div>
        <div id="meters" class="meters">
          ${[["subBass","Sub"],["bass","Bass"],["lowMid","Low"],["mid","Mid"],["highMid","Hi"],["presence","Pres"],["air","Air"]].map(([l,c])=>`<div class="meter"><div class="bar"><i data-band="${l}"></i></div><span>${c}</span></div>`).join("")}
        </div>
        <div id="bpm" class="note">Tempo — 120 BPM</div>
      </div>
    </section>

    <section class="sec" data-sec="visual">
      <div class="sh"><span class="chev">▼</span>Visualizer Mode & Spatial VR</div>
      <div class="sb">
        <label>Animation Mode <span id="mode-count"></span></label>
        <select id="sel-mode"></select>
        <div class="grid3" style="margin-top:6px;">
          <button id="b-prev">‹ Prev</button>
          <button id="b-rand">Random</button>
          <button id="b-next">Next ›</button>
        </div>

        <div class="card" style="margin-top:10px; background:rgba(0, 240, 255, 0.08); border-color:rgba(0, 240, 255, 0.3);">
          <label style="color:#00f0ff; font-weight:700;">🥽 3D Spatial VR & Bird Flight</label>
          <button id="b-vr" class="accent" style="width:100%; margin-top:4px;">Enter WebXR VR (6DOF Headset Flight)</button>
          <button id="b-bird-fly" class="primary" style="width:100%; margin-top:6px;">🕊️ 3D Bird Flight Simulator (WASD / Look)</button>
          <div class="note" style="margin-top:6px; font-size:10px;">Fly like a bird in full 3D space through floating cosmic stars, cyber terrain, and glowing warp corridors!</div>
        </div>

        <label>Color Palette</label>
        <select id="sel-pal">
          <option value="rainbow">Rainbow Cycle</option>
          <option value="neon">Neon Psychedelic</option>
          <option value="vapor">Vaporwave</option>
          <option value="aurora">Aurora Borealis</option>
          <option value="magma">Magma Inferno</option>
          <option value="mono">Cyber Monochrome</option>
          <option value="album">Album Art Dynamic</option>
        </select>
      </div>
    </section>

    <section class="sec" data-sec="react">
      <div class="sh"><span class="chev">▼</span>Audio Reactivity & Gain</div>
      <div class="sb">
        <label>Master Gain <span id="v-gain">1.2</span><input id="s-gain" type="range" min="0.2" max="4" step="0.1" value="1.2"/></label>
        <label>Motion Speed <span id="v-motion">0.55×</span><input id="s-motion" type="range" min="0.15" max="2" step="0.05" value="0.55"/></label>
        <label>Beat Reaction Sensitivity <span id="v-react">1.0</span><input id="s-react" type="range" min="0.2" max="2.5" step="0.1" value="1.0"/></label>
      </div>
    </section>

    <section class="sec" data-sec="interact">
      <div class="sh"><span class="chev">▼</span>Interactive Forces</div>
      <div class="sb">
        <label>Pointer Force Influence <span id="v-interact">100%</span><input id="s-interact" type="range" min="0" max="200" step="5" value="100"/></label>
        <div class="note">Drag/touch to paint fluid forces • Shift-click to repel • Double click for pulse</div>
        <label>Fluid Dissipation <span id="v-diss">0.980</span><input id="s-diss" type="range" min="0.900" max="0.999" step="0.001" value="0.98"/></label>
        <label>Fluid Vorticity (Curl) <span id="v-vort">30</span><input id="s-vort" type="range" min="0" max="60" step="1" value="30"/></label>
      </div>
    </section>

    <section class="sec" data-sec="fractal">
      <div class="sh"><span class="chev">▼</span>Fractal & Raymarching Settings</div>
      <div class="sb">
        <label>Shader Detail <span id="v-detail">60%</span><input id="s-detail" type="range" min="10" max="100" step="5" value="60"/></label>
        <label>Zoom Level <span id="v-zoom">1.00×</span><input id="s-zoom" type="range" min="-100" max="200" step="1" value="0"/></label>
        <label>Fractal Seed Morph <span id="v-morph">0%</span><input id="s-morph" type="range" min="0" max="100" step="1" value="0"/></label>
        <label>Auto-Morph Speed <span id="v-morph-rate">0%</span><input id="s-morph-rate" type="range" min="0" max="100" step="5" value="0"/></label>
        <button id="b-reset-view" style="width:100%; margin-top:6px;">Reset Camera View</button>
        <label class="row" style="margin-top:10px;"><span>Fly-Through Drift</span><button id="sw-fly" class="switch"></button></label>
        <label>Flight Speed <span id="v-fly">1.0×</span><input id="s-fly" type="range" min="0.2" max="3" step="0.1" value="1.0"/></label>
      </div>
    </section>
  </aside>
  `;const n=l=>i.querySelector(`#${l}`);n("ptoggle")?.addEventListener("click",()=>i.querySelector("#panel").classList.toggle("collapsed")),i.querySelectorAll(".sh").forEach(l=>l.addEventListener("click",()=>l.parentElement.classList.toggle("collapsed"))),n("b-sys")?.addEventListener("click",t.onSystem),n("b-mic")?.addEventListener("click",t.onMic),n("b-file")?.addEventListener("click",()=>i.querySelector("#f-input").click()),i.querySelector("#f-input")?.addEventListener("change",l=>{l.target.files[0]&&t.onFile(l.target.files[0])}),n("b-demo")?.addEventListener("click",t.onDemo),n("b-demo-next")?.addEventListener("click",t.onDemoNext),n("b-demo-stop")?.addEventListener("click",t.onDemoStop),n("b-yt")?.addEventListener("click",()=>{const l=i.querySelector("#yt-url").value.trim();l&&t.onYouTube(l)}),i.querySelector("#yt-url")?.addEventListener("keydown",l=>{if(l.key==="Enter"){l.preventDefault();const c=i.querySelector("#yt-url").value.trim();c&&t.onYouTube(c)}}),n("b-sp")?.addEventListener("click",()=>{const l=i.querySelector("#sp-url").value.trim();l&&t.onSpotify(l)}),i.querySelector("#sp-url")?.addEventListener("keydown",l=>{if(l.key==="Enter"){l.preventDefault();const c=i.querySelector("#sp-url").value.trim();c&&t.onSpotify(c)}}),n("b-sp-capture")?.addEventListener("click",t.onSpotifyCapture),n("b-prev")?.addEventListener("click",()=>t.onMode(-1)),n("b-next")?.addEventListener("click",()=>t.onMode(1)),n("b-rand")?.addEventListener("click",t.onRandom),n("b-hud-prev")?.addEventListener("click",()=>t.onMode(-1)),n("b-hud-next")?.addEventListener("click",()=>t.onMode(1)),n("b-hud-rand")?.addEventListener("click",t.onRandom),n("b-hud-fs")?.addEventListener("click",t.onFullscreen),n("b-hud-vr")?.addEventListener("click",t.onVR),n("b-hud-fly")?.addEventListener("click",t.onBirdFly),n("b-vr")?.addEventListener("click",t.onVR),n("b-bird-fly")?.addEventListener("click",t.onBirdFly);const s=i.querySelector("#sel-mode"),r=i.querySelector("#hud-sel-mode"),o={};e.forEach((l,c)=>{if(!o[l.group]){const d=document.createElement("optgroup");d.label=l.group,s.appendChild(d),o[l.group]=d}const u=document.createElement("option");u.value=String(c),u.textContent=l.name,o[l.group].appendChild(u);const h=document.createElement("option");h.value=String(c),h.textContent=l.name,r.appendChild(h)});const a=i.querySelector("#mode-count");return a&&(a.textContent=e.length+" modes"),s.addEventListener("change",l=>{const c=parseInt(l.target.value,10);r.value=String(c),t.onMode(c)}),r.addEventListener("change",l=>{const c=parseInt(l.target.value,10);s.value=String(c),t.onMode(c)}),{root:i,$:n}}const At=Math.PI*2;function Oe(i,e){const t=i.sample((e%1+1)%1);return new Ve(t.r,t.g,t.b)}function Ft(i,e=.8,t=!1){return new nn({color:i,transparent:!0,opacity:e,wireframe:t,blending:Jn,depthWrite:!1,side:qt})}function jl(i,e=.8){return new Ys({color:i,transparent:!0,opacity:e,blending:Jn,depthWrite:!1})}function Zl(i,e=.9){return new ua({size:i,vertexColors:!0,transparent:!0,opacity:e,blending:Jn,depthWrite:!1})}function Yt(i,e){return!i||!i.length?0:i[Math.max(0,Math.min(i.length-1,Math.floor(e*i.length)))]||0}function Qi(i,e,t,n){const s=new Float32Array(i*3),r=new Float32Array(i*3),o=new P;for(let l=0;l<i;l++){const c=n(l,o.set(0,0,0));s[l*3]=o.x,s[l*3+1]=o.y,s[l*3+2]=o.z;const u=Oe(e,c);r[l*3]=u.r,r[l*3+1]=u.g,r[l*3+2]=u.b}const a=new rt;return a.setAttribute("position",new ht(s,3)),a.setAttribute("color",new ht(r,3)),new ha(a,Zl(t))}const Mg={spawn:[0,0,0],fog:.012,build({group:i,palette:e,store:t}){t.rings=[];const n=new Ji(6,.09,8,72);for(let s=0;s<44;s++){const r=new Ye(n,Ft(Oe(e,s/44),.7));r.position.z=-s*6,i.add(r),t.rings.push(r)}t.streaks=Qi(2600,e,.16,(s,r)=>{const o=Math.random()*At,a=4+Math.random()*22;return r.set(Math.cos(o)*a,Math.sin(o)*a,-Math.random()*264),Math.random()}),i.add(t.streaks)},update({store:i,palette:e,t,dt:n,bass:s,mid:r,beatPulse:o}){const a=(26+s*90)*n;i.rings.forEach((c,u)=>{c.position.z+=a,c.position.z>8&&(c.position.z-=264);const h=1+Math.sin(t*2+u*.4)*.1+s*.4;c.scale.set(h,h,1),c.rotation.z+=(.2+r)*n,c.material.color.copy(Oe(e,t*.06+u*.03))});const l=i.streaks.geometry.attributes.position;for(let c=0;c<l.count;c++){let u=l.getZ(c)+a*2.2;u>8&&(u-=264),l.setZ(c,u)}l.needsUpdate=!0,i.streaks.material.size=.12+o*.2}},yg={spawn:[0,3,10],fog:.009,build({group:i,palette:e,store:t}){t.geo=new ei(220,220,72,72);const n=new Ye(t.geo,new nn({color:Oe(e,.7),wireframe:!0,transparent:!0,opacity:.55}));n.rotation.x=-Math.PI/2,n.position.y=-6,i.add(n),t.grid=n,t.sun=new Ye(new Ii(26,64),Ft(Oe(e,.05),.5)),t.sun.position.set(0,12,-110),i.add(t.sun);for(let s=0;s<9;s++){const r=new Ye(new ei(60,1.2),Ft(0,.9));r.material.blending=Kn,r.position.set(0,1+s*2.4,-109.5),i.add(r)}},update({store:i,palette:e,t,dt:n,bass:s,bands:r,beatPulse:o}){const a=i.geo.attributes.position;for(let c=0;c<a.count;c++){const u=a.getX(c),h=a.getY(c),d=Math.hypot(u,h)/110,m=Yt(r,d);a.setZ(c,Math.sin(d*12-t*3)*(1+s*5)+m*14)}a.needsUpdate=!0,i.grid.position.z=t*(12+s*26)%3-3,i.grid.material.color.copy(Oe(e,t*.04+.6));const l=1+s*.25+o*.1;i.sun.scale.set(l,l,1),i.sun.material.color.copy(Oe(e,t*.03)),i.sun.position.y=12+Math.sin(t*.5)*n*0}},Sg={spawn:[0,0,26],fog:.006,build({group:i,palette:e,store:t}){t.seed=new Float32Array(14e3*3),t.pts=Qi(14e3,e,.13,(s,r)=>{const o=s%3,a=s/14e3,l=a*At*9+o*(At/3),c=2+a*20,u=(Math.random()-.5)*(1+a*7);return r.set(Math.cos(l)*c,u,Math.sin(l)*c),t.seed[s*3]=c,t.seed[s*3+1]=l,t.seed[s*3+2]=u,a}),i.add(t.pts)},update({store:i,t:e,dt:t,bass:n,mid:s,treble:r,beatPulse:o}){const a=i.pts.geometry.attributes.position,l=i.seed,c=(.35+s*2.2)*t;for(let u=0;u<a.count;u++){const h=l[u*3]*(1+n*.35),d=l[u*3+1]+=c*(1.6-l[u*3]/26);a.setXYZ(u,Math.cos(d)*h,l[u*3+2]*(1+r*1.4)+Math.sin(e+d)*.6,Math.sin(d)*h)}a.needsUpdate=!0,i.pts.material.size=.11+o*.16,i.pts.rotation.x=Math.sin(e*.2)*.3}},Eg={spawn:[0,0,16],build({group:i,palette:e,store:t}){const n=[new ga(2.2),new cn(3.2,3.2,3.2),new ma(4.4),new fa(5.8),new pa(7.4)];t.solids=n.map((s,r)=>{const o=new Ye(s,Ft(Oe(e,r/5),.55,!0));return i.add(o),o}),t.halo=Qi(2200,e,.09,(s,r)=>{const o=Math.random()*At,a=Math.acos(2*Math.random()-1),l=9+Math.random()*16;return r.set(l*Math.sin(a)*Math.cos(o),l*Math.sin(a)*Math.sin(o),l*Math.cos(a)),Math.random()}),i.add(t.halo)},update({store:i,palette:e,t,dt:n,bands:s,beatPulse:r}){i.solids.forEach((o,a)=>{const l=Yt(s,a/5),c=a%2?1:-1;o.rotation.x+=c*(.1+l*.9)*n,o.rotation.y+=c*(.14+l*.7)*n;const u=1+l*.45+r*.12;o.scale.setScalar(u),o.material.color.copy(Oe(e,t*.05+a/5)),o.material.opacity=.35+l*.5}),i.halo.rotation.y+=.05*n}},bg={spawn:[0,0,9],fog:.02,build({group:i,palette:e,store:t}){const n=[],s=[];for(let u=0;u<26e4&&n.length<3e4;u++){const h=(Math.random()-.5)*2.6,d=(Math.random()-.5)*2.6,m=(Math.random()-.5)*2.6;let g=h,_=d,p=m,f=0;for(;f<7;f++){const y=Math.hypot(g,_,p);if(y>2)break;const M=Math.acos(p/(y||1e-9))*8,S=Math.atan2(_,g)*8,R=Math.pow(y,8);g=R*Math.sin(M)*Math.cos(S)+h,_=R*Math.sin(M)*Math.sin(S)+d,p=R*Math.cos(M)+m}f>=7&&(n.push(h*2.4,d*2.4,m*2.4),s.push(Math.hypot(h,d,m)/1.3))}const o=s.length,a=new Float32Array(n),l=new Float32Array(o*3);for(let u=0;u<o;u++){const h=Oe(e,s[u]);l[u*3]=h.r,l[u*3+1]=h.g,l[u*3+2]=h.b}const c=new rt;c.setAttribute("position",new ht(a,3)),c.setAttribute("color",new ht(l,3)),t.bulb=new ha(c,Zl(.05)),i.add(t.bulb),t.base=a.slice()},update({store:i,t:e,dt:t,bass:n,mid:s,treble:r,beatPulse:o}){i.bulb.rotation.y+=(.12+s*.6)*t,i.bulb.rotation.x=Math.sin(e*.23)*.4,i.bulb.scale.set(1+n*.5,1+r*.4,1+s*.45),i.bulb.material.size=.045+o*.06}},Tg={spawn:[0,0,20],build({group:i,palette:e,store:t}){t.shells=[];for(let n=0;n<7;n++){const s=new gt,r=8+n*4,o=3+n*2.6,a=new Ii(1.1+n*.1,3);for(let l=0;l<r;l++){const c=l/r*At,u=new Ye(a,Ft(Oe(e,n/7),.5,n%2===0));u.position.set(Math.cos(c)*o,Math.sin(c)*o,-n*3),u.rotation.z=c,s.add(u)}i.add(s),t.shells.push(s)}},update({store:i,palette:e,t,dt:n,bands:s,bass:r}){i.shells.forEach((o,a)=>{const l=Yt(s,a/7);o.rotation.z+=(a%2?1:-1)*(.12+l*1.1)*n,o.scale.setScalar(1+l*.4+r*.15),o.position.z=(t*6+a*3)%21-12,o.children.forEach(c=>c.material.color.copy(Oe(e,t*.05+a/7)))})}},Ag={spawn:[0,0,22],fog:.01,build({group:i,palette:e,store:t}){t.streams=[];const n=90;for(let s=0;s<30;s++){const r=new Float32Array(n*3),o=Math.random()*At,a=3+Math.random()*10,l=new P(Math.cos(o)*a,(Math.random()-.5)*10,Math.sin(o)*a);for(let h=0;h<n;h++)r[h*3]=l.x,r[h*3+1]=l.y,r[h*3+2]=l.z;const c=new rt;c.setAttribute("position",new ht(r,3));const u=new $s(c,jl(Oe(e,s/30),.75));i.add(u),t.streams.push({line:u,head:l,len:n})}},update({store:i,palette:e,t,dt:n,bass:s,mid:r,treble:o}){const a=(2.2+s*7)*n;i.streams.forEach((l,c)=>{const u=l.head,h=.18,d=.6+r*2.4;u.x+=Math.sin(u.y*h+t*d)*a,u.y+=Math.sin(u.z*h+t*d*1.3)*a*(.6+o),u.z+=Math.sin(u.x*h+t*d*.7)*a;const m=16;Math.abs(u.x)>m&&(u.x*=-.92),Math.abs(u.y)>m&&(u.y*=-.92),Math.abs(u.z)>m&&(u.z*=-.92);const g=l.line.geometry.attributes.position,_=g.array;_.copyWithin(3,0,(l.len-1)*3),_[0]=u.x,_[1]=u.y,_[2]=u.z,g.needsUpdate=!0,l.line.material.color.copy(Oe(e,t*.06+c/30))})}},wg={spawn:[0,4,0],build({group:i,palette:e,store:t}){t.n=64;const s=new cn(.7,1,.7);s.translate(0,.5,0),t.bars=new ca(s,new nn({transparent:!0,opacity:.9}),64),i.add(t.bars),t.dummy=new _t;for(let o=0;o<64;o++)t.bars.setColorAt(o,Oe(e,o/64));const r=new Ye(new Ks(4,30,64),Ft(Oe(e,.5),.14));r.rotation.x=-Math.PI/2,i.add(r),t.spray=Qi(1800,e,.1,(o,a)=>{const l=Math.random()*At;return a.set(Math.cos(l)*14,Math.random()*20,Math.sin(l)*14),Math.random()}),i.add(t.spray)},update({store:i,palette:e,t,dt:n,bands:s,beatPulse:r}){const o=i.n,a=i.dummy;for(let c=0;c<o;c++){const u=c/o*At,h=Yt(s,c/o);a.position.set(Math.cos(u)*14,0,Math.sin(u)*14),a.rotation.set(0,-u,0),a.scale.set(1,.4+h*26,1),a.updateMatrix(),i.bars.setMatrixAt(c,a.matrix),i.bars.setColorAt(c,Oe(e,t*.05+c/o))}i.bars.instanceMatrix.needsUpdate=!0,i.bars.instanceColor&&(i.bars.instanceColor.needsUpdate=!0);const l=i.spray.geometry.attributes.position;for(let c=0;c<l.count;c++){let u=l.getY(c)-(3+r*22)*n;u<0&&(u=18+Math.random()*6),l.setY(c,u)}l.needsUpdate=!0}},Rg={spawn:[0,0,14],build({group:i,palette:e,store:t}){t.wedges=[];const n=12;for(let s=0;s<n;s++){const r=new gt;r.rotation.z=s/n*At,r.scale.x=s%2?-1:1;for(let o=0;o<5;o++){const a=new Ye(new da(.6+o*.18,3+o,3),Ft(Oe(e,o/5),.45));a.position.set(2.5+o*2.1,o*.7,-o*1.4),r.add(a)}i.add(r),t.wedges.push(r)}},update({store:i,palette:e,t,dt:n,bass:s,mid:r,bands:o}){i.wedges.forEach((a,l)=>{a.rotation.z+=(.2+r*1.4)*n*(l%2?-1:1),a.children.forEach((c,u)=>{const h=Yt(o,u/5);c.position.x=2.5+u*2.1+h*4+s*2,c.rotation.z=Math.sin(t*1.4+u)*(.4+h),c.material.color.copy(Oe(e,t*.07+u/5+l*.02))})})}},Cg={spawn:[0,0,60],fog:.004,build({group:i,palette:e,store:t}){const s=new Float32Array(36e3),r=new Float32Array(12e3*3);let o=.1,a=0,l=0;const c=10,u=28,h=8/3,d=.006;for(let g=0;g<12e3;g++){const _=c*(a-o),p=o*(u-l)-a,f=o*a-h*l;o+=_*d,a+=p*d,l+=f*d,s[g*3]=o,s[g*3+1]=l-26,s[g*3+2]=a;const y=Oe(e,g/12e3);r[g*3]=y.r,r[g*3+1]=y.g,r[g*3+2]=y.b}const m=new rt;m.setAttribute("position",new ht(s,3)),m.setAttribute("color",new ht(r,3)),t.path=new $s(m,new Ys({vertexColors:!0,transparent:!0,opacity:.85,blending:Jn,depthWrite:!1})),t.path.scale.setScalar(1.4),i.add(t.path)},update({store:i,t:e,dt:t,bass:n,mid:s,beatPulse:r}){i.path.rotation.y+=(.1+s*.5)*t,i.path.rotation.z=Math.sin(e*.17)*.25;const o=1.4+n*.5+r*.15;i.path.scale.setScalar(o),i.path.material.opacity=.5+r*.5}},Pg={spawn:[0,2,15],build({group:i,palette:e,store:t}){t.layers=[];for(let n=0;n<4;n++){const s=new gt,r=6+n*3;for(let o=0;o<r;o++){const a=new Ye(new Ii(2.2+n*.7,12,0,Math.PI),Ft(Oe(e,n/4),.42));a.position.y=0,a.rotation.z=o/r*At,s.add(new gt().add(a))}s.position.y=n*.35,i.add(s),t.layers.push(s)}t.core=new Ye(new Zi(1.1,24,16),Ft(Oe(e,.15),.9)),i.add(t.core)},update({store:i,palette:e,t,dt:n,bass:s,mid:r,bands:o,beatPulse:a}){i.layers.forEach((l,c)=>{const u=Yt(o,c/4);l.rotation.y+=(c%2?1:-1)*(.15+u*.9)*n;const h=.35+s*1+u*.5;l.children.forEach((d,m)=>{d.rotation.x=h+Math.sin(t*1.5+m+c)*.08,d.children[0].material.color.copy(Oe(e,t*.05+c/4))})}),i.core.scale.setScalar(1+s*.6+a*.25),i.core.material.color.copy(Oe(e,t*.1+r*.2))}},Lg={spawn:[0,0,20],build({group:i,palette:e,store:t}){t.rings=[];for(let n=0;n<6;n++){const s=new gt,r=3+n*1.9,o=new Ye(new Ji(r,.06,8,96),Ft(Oe(e,n/6),.75));s.add(o);const a=new Ye(new Zi(.34,16,12),Ft(Oe(e,n/6+.5),1));a.position.x=r,s.add(a),s.rotation.set(Math.random()*At,Math.random()*At,Math.random()*At),i.add(s),t.rings.push({holder:s,ring:o,sat:a,rad:r,phase:Math.random()*At})}},update({store:i,palette:e,t,dt:n,bands:s,beatPulse:r}){i.rings.forEach((o,a)=>{const l=Yt(s,a/6);o.holder.rotation.x+=(.12+l*.8)*n*(a%2?1:-1),o.holder.rotation.y+=(.18+l*.5)*n,o.phase+=(1+l*6)*n;const c=o.rad*(1+l*.25);o.sat.position.set(Math.cos(o.phase)*c,Math.sin(o.phase)*c,0),o.sat.scale.setScalar(1+r*.8),o.ring.scale.setScalar(1+l*.25),o.ring.material.color.copy(Oe(e,t*.05+a/6))})}},Dg={spawn:[0,0,0],fog:.014,build({group:i,palette:e,store:t}){t.loops=[];const n=[new P(-5,-5,0),new P(5,-5,0),new P(5,5,0),new P(-5,5,0),new P(-5,-5,0)],s=new rt().setFromPoints(n);for(let r=0;r<46;r++){const o=new $s(s,jl(Oe(e,r/46),.8));o.position.z=-r*5,i.add(o),t.loops.push(o)}},update({store:i,palette:e,t,dt:n,bass:s,mid:r,bands:o}){const a=(18+s*60)*n;i.loops.forEach((l,c)=>{l.position.z+=a,l.position.z>6&&(l.position.z-=230);const u=-l.position.z/230,h=Yt(o,u);l.rotation.z=t*(.3+r)+u*4,l.scale.setScalar(.7+h*1.4+s*.3),l.material.color.copy(Oe(e,t*.08+u))})}},Ug={spawn:[0,8,22],build({group:i,palette:e,store:t}){const n=[];for(let a=-15;a<=15;a++)for(let l=-15;l<=15;l++){const c=1.7249999999999999*a,u=1.15*Math.sqrt(3)*(l+a/2),h=Math.hypot(c,u);h>26||n.push({x:c,z:u,u:h/26})}t.cells=n;const o=new ji(1.15*.9,1.15*.9,1,6);o.translate(0,.5,0),t.mesh=new ca(o,new nn({transparent:!0,opacity:.85}),n.length),i.add(t.mesh),t.dummy=new _t,n.forEach((a,l)=>t.mesh.setColorAt(l,Oe(e,a.u)))},update({store:i,palette:e,t,bands:n,beatPulse:s}){const r=i.dummy;i.cells.forEach((o,a)=>{const c=.3+Yt(n,o.u)*16+Math.sin(t*3-o.u*9)*(.5+s*2);r.position.set(o.x,0,o.z),r.scale.set(1,Math.max(.1,c),1),r.rotation.set(0,0,0),r.updateMatrix(),i.mesh.setMatrixAt(a,r.matrix),i.mesh.setColorAt(a,Oe(e,t*.05+o.u))}),i.mesh.instanceMatrix.needsUpdate=!0,i.mesh.instanceColor&&(i.mesh.instanceColor.needsUpdate=!0)}},Ig={spawn:[0,0,12],build({group:i,palette:e,store:t}){t.arms=[];const n=16;for(let s=0;s<n;s++){const r=new gt;r.rotation.z=s/n*At;for(let o=0;o<4;o++){const a=new Ye(new cn(.5,3.4,.5),Ft(Oe(e,o/4),.5));a.position.set(3+o*2.4,0,(o%2?1:-1)*2),r.add(a)}i.add(r),t.arms.push(r)}},update({store:i,palette:e,t,dt:n,mid:s,bands:r,beatPulse:o}){i.arms.forEach((a,l)=>{a.rotation.z+=(.25+s*1.6)*n,a.rotation.y=Math.sin(t*.6+l*.4)*.5,a.children.forEach((c,u)=>{const h=Yt(r,u/4);c.scale.set(1+h*1.5,1+h*2.5,1+h*1.5),c.rotation.y+=(.4+h*2)*n,c.material.color.copy(Oe(e,t*.09+u/4+l*.03)),c.material.opacity=.3+h*.6+o*.1})})}},Ng={spawn:[0,0,34],fog:.005,build({group:i,palette:e,store:t}){t.pts=Qi(22e3,e,.14,(s,r)=>{const o=Math.floor(Math.random()*3),a=[0,12,-11][o],l=[0,5,-6][o],c=[0,-8,7][o],u=()=>(Math.random()+Math.random()+Math.random()-1.5)*9;return r.set(a+u(),l+u()*.6,c+u()),Math.min(1,r.length()/26)}),i.add(t.pts),t.core=new Ye(new Zi(1.6,24,16),Ft(Oe(e,.1),.6)),i.add(t.core)},update({store:i,palette:e,t,dt:n,bass:s,mid:r,treble:o,beatPulse:a}){i.pts.rotation.y+=(.03+r*.25)*n,i.pts.rotation.x=Math.sin(t*.11)*.2,i.pts.scale.setScalar(1+s*.22),i.pts.material.size=.11+o*.16+a*.1,i.core.scale.setScalar(1+s*1.4+a*.5),i.core.material.color.copy(Oe(e,t*.08))}},Fg={spawn:[0,10,26],build({group:i,palette:e,store:t}){t.s=26,t.mesh=new ca(new cn(.85,.85,.85),new nn({transparent:!0,opacity:.9}),26*26),i.add(t.mesh),t.dummy=new _t;for(let s=0;s<26*26;s++)t.mesh.setColorAt(s,Oe(e,s/(26*26)))},update({store:i,palette:e,t,bands:n,bass:s,beatPulse:r}){const o=i.s,a=i.dummy,l=(o-1)/2;for(let c=0;c<o*o;c++){const u=c%o-l,h=Math.floor(c/o)-l,d=Math.hypot(u,h)/(l*1.42),m=Yt(n,d),g=Math.sin(d*10-t*4)*(1+s*6)+m*12;a.position.set(u*1.5,g,h*1.5),a.rotation.set(g*.1,t*.5+d*3,0),a.scale.setScalar(.6+m*2+r*.3),a.updateMatrix(),i.mesh.setMatrixAt(c,a.matrix),i.mesh.setColorAt(c,Oe(e,t*.05+d))}i.mesh.instanceMatrix.needsUpdate=!0,i.mesh.instanceColor&&(i.mesh.instanceColor.needsUpdate=!0)}},Og={spawn:[0,0,24],build({group:i,palette:e,store:t}){t.levels=[];const n=(r,o,a)=>{if(o>2)return[];const l=[],c=[6,5,4][o];for(let u=0;u<c;u++){const h=u/c*At,d=new gt;d.position.set(Math.cos(h)*a,Math.sin(h)*a,0);const m=new Ye(new Ji(a*.42,.05+.05/(o+1),6,40),Ft(Oe(e,o/3+u/c*.2),.6));d.add(m),r.add(d),l.push(d),n(d,o+1,a*.42)}return t.levels[o]=(t.levels[o]||[]).concat(l),l},s=new gt;i.add(s),t.root=s,n(s,0,9)},update({store:i,palette:e,t,dt:n,bands:s,bass:r,beatPulse:o}){i.root.rotation.z+=(.08+r*.5)*n,i.levels.forEach((a,l)=>{const c=Yt(s,l/3);a.forEach((u,h)=>{u.rotation.z+=(l%2?-1:1)*(.2+c*2.2)*n,u.scale.setScalar(1+c*.35+o*.08),u.children[0].material.color.copy(Oe(e,t*.06+l*.3+h*.02))})})}},Jl={"hyperspace-warp":Mg,"quantum-grid":yg,"plasma-vortex":Sg,"sacred-geometry":Eg,"julia-bloom":bg,mandala:Tg,"julia-flow":Ag,"spectrum-fountain":wg,kaleidofluid:Rg,"attractor-bloom":Cg,flower:Pg,"orbit-rings":Lg,"neon-tunnel":Dg,"hex-pulse":Ug,kaleido:Ig,"cosmic-nebula":Ng,"bloom-grid":Fg,"hybrid-mandala":Og};class Bg{renderer;scene;camera;palette;group=new gt;spec=null;worldId="";store={};xrSession=null;refSpace=null;xrActive=!1;onXRChange;flightActive=!1;pos=new P(0,0,18);vel=new P;euler=new ln(0,0,0,"YXZ");keys={};locked=!1;constructor(e,t){this.palette=t,this.renderer=new oa({canvas:e,antialias:!0,powerPreference:"high-performance"}),this.renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2)),this.renderer.xr.enabled=!0,this.scene=new Kl,this.scene.background=new Ve(197386),this.scene.add(this.group),this.camera=new Gt(72,window.innerWidth/window.innerHeight,.1,600),this.camera.position.copy(this.pos),window.addEventListener("keydown",n=>{this.keys[n.code]=!0}),window.addEventListener("keyup",n=>{this.keys[n.code]=!1}),window.addEventListener("mousemove",n=>{!this.locked||!this.flightActive||(this.euler.y-=n.movementX*.0022,this.euler.x-=n.movementY*.0022,this.euler.x=Math.max(-Math.PI/2.2,Math.min(Math.PI/2.2,this.euler.x)))}),document.addEventListener("pointerlockchange",()=>{this.locked=document.pointerLockElement!==null,this.locked||(this.flightActive=!1)})}setWorld(e){if(e===this.worldId||(this.disposeWorld(),this.spec=Jl[e]||null,this.worldId=e,this.store={},!this.spec))return;this.spec.build({group:this.group,palette:this.palette,store:this.store}),this.scene.fog=this.spec.fog?new la(this.spec.bg??197386,this.spec.fog):null,this.scene.background=new Ve(this.spec.bg??197386);const t=this.spec.spawn||[0,0,18];this.pos.set(t[0],t[1],t[2]),this.vel.set(0,0,0),this.euler.set(0,0,0)}disposeWorld(){this.group.traverse(e=>{const t=e;t.geometry?.dispose?.();const n=t.material;Array.isArray(n)?n.forEach(s=>s.dispose?.()):n?.dispose?.()}),this.group.clear()}async isVRAvailable(){if(!navigator.xr||!navigator.xr.isSessionSupported)return!1;try{return await navigator.xr.isSessionSupported("immersive-vr")}catch{return!1}}isVRActive(){return this.xrActive&&!!this.xrSession}async startVR(e){if(this.onXRChange=e,!navigator.xr)throw new Error("WebXR not supported in this browser");this.xrSession=await navigator.xr.requestSession("immersive-vr",{optionalFeatures:["local-floor","bounded-floor","hand-tracking"]}),await this.renderer.xr.setSession(this.xrSession);try{this.refSpace=await this.xrSession.requestReferenceSpace("local-floor")}catch{this.refSpace=await this.xrSession.requestReferenceSpace("local")}return this.xrActive=!0,e?.(!0),this.xrSession.addEventListener("end",()=>{this.xrActive=!1,this.xrSession=null,this.refSpace=null,this.onXRChange?.(!1)}),this.xrSession}stopVR(){this.xrSession&&this.xrSession.end()}requestFlightPointerLock(){this.flightActive=!0,document.body.requestPointerLock?.()}setDesktopFlight(e){this.flightActive=e,e?document.body.requestPointerLock?.():this.locked&&document.exitPointerLock?.()}isDesktopFlightActive(){return this.flightActive}toggleDesktopFlight(){return this.setDesktopFlight(!this.flightActive),this.flightActive}flyDesktop(e,t){const n=new P(0,0,-1).applyEuler(this.euler),s=new P(1,0,0).applyEuler(this.euler),r=new P(0,1,0),o=new P,a=this.keys.ShiftLeft||this.keys.ShiftRight?2.5:1;(this.keys.KeyW||this.keys.ArrowUp)&&o.add(n),(this.keys.KeyS||this.keys.ArrowDown)&&o.sub(n),(this.keys.KeyA||this.keys.ArrowLeft)&&o.sub(s),(this.keys.KeyD||this.keys.ArrowRight)&&o.add(s),this.keys.Space&&o.add(r),(this.keys.KeyC||this.keys.ControlLeft)&&o.sub(r),o.lengthSq()>0?this.vel.lerp(o.normalize().multiplyScalar(14*a*t),.1):this.vel.multiplyScalar(.92),this.pos.addScaledVector(this.vel,e),this.camera.position.copy(this.pos),this.camera.quaternion.setFromEuler(this.euler)}flyXR(e,t){if(this.xrSession){for(const n of Array.from(this.xrSession.inputSources||[])){const s=n.gamepad;if(!s)continue;const r=s.axes[2]??s.axes[0]??0,o=s.axes[3]??s.axes[1]??0;if(Math.abs(r)>.15||Math.abs(o)>.15){const l=new P(r,0,o).applyQuaternion(this.camera.quaternion);this.pos.addScaledVector(l,10*t*e)}const a=s.buttons?.[0];if(a?.pressed){const l=new P(0,0,-1).applyQuaternion(this.camera.quaternion);this.pos.addScaledVector(l,20*(a.value||1)*t*e)}}this.group.position.set(-this.pos.x,-this.pos.y,-this.pos.z)}}resize(){const e=window.innerWidth,t=window.innerHeight;this.camera.aspect=e/t,this.camera.updateProjectionMatrix(),this.renderer.setSize(e,t,!1)}setLoop(e){this.renderer.setAnimationLoop(e)}render(e,t,n=1){if(!this.spec)return;if(this.isVRActive())this.flyXR(t,n);else if(this.flightActive)this.flyDesktop(t,n);else{const r=performance.now()*16e-5,o=this.spec.spawn||[0,0,18];this.camera.position.set(o[0]+Math.sin(r)*4,o[1]+Math.cos(r*.8)*2,o[2]+Math.cos(r)*4),this.camera.lookAt(0,0,this.spec.spawn?this.spec.spawn[2]-20:0)}const s=e?.band;this.spec.update({group:this.group,palette:this.palette,store:this.store,t:performance.now()*.001,dt:Math.max(.001,t),bass:s?s.bass.norm:0,mid:s?s.mid.norm:0,treble:s?s.air.norm:0,beat:!!e?.beat,beatPulse:e?.beatPulse||0,level:e?.level||0,bands:e?.bandsNorm||new Float32Array(0)}),this.renderer.render(this.scene,this.camera)}}const zg=document.querySelector("#app");zg.innerHTML=`
  <div id="stage">
    <canvas id="fluid" class="stage"></canvas>
    <canvas id="fractal" class="stage"></canvas>
    <canvas id="geo" class="stage"></canvas>
    <canvas id="warp" class="stage"></canvas>
    <canvas id="cyber" class="stage"></canvas>
    <canvas id="world3d" class="stage"></canvas>
  </div>
  <div id="ui-root"></div>
  <div id="flash"><div class="fname"></div><div class="fgroup"></div></div>
  <div id="toast"></div>
`;const _a=document.getElementById("fluid"),va=document.getElementById("fractal"),xa=document.getElementById("geo"),Ma=document.getElementById("warp"),ya=document.getElementById("cyber"),Sa=document.getElementById("world3d"),Gg=document.getElementById("ui-root"),It=new bc,Ke=new Mc,yt=new Ic(_a),Ln=new zc(va,It),ks=new rg(xa,It),Ea=new cg(Ma,It),ba=new dg(ya,It),tn=new Bg(Sa,It),Ht=vg();let js=0;const ce={motion:.55,reactivity:1,depth:1,interact:1,fractalFold:-1,detail:.6,zoom:1,pan:{x:0,y:0},flyThrough:!1,flySpeed:1,evt:[{x:0,y:0,at:-1e9,kind:0},{x:0,y:0,at:-1e9,kind:0}]};function Hg(i){const e=i.trim();let t=e.match(/spotify:(playlist|album|track|artist|show|episode):([A-Za-z0-9]+)/);return t?{type:t[1],id:t[2]}:(t=e.match(/open\.spotify\.com\/(playlist|album|track|artist|show|episode)\/([A-Za-z0-9]+)/),t?{type:t[1],id:t[2]}:(t=e.match(/embed\/(playlist|album|track|artist|show|episode)\/([A-Za-z0-9]+)/),t?{type:t[1],id:t[2]}:null))}function Ta(i){const e=Hg(i);return e?`https://open.spotify.com/embed/${e.type}/${e.id}?utm_source=generator&theme=0`:null}const Ql="https://open.spotify.com/playlist/1gGHjgHQTT8ae4vm8F8gZG";let Xi=localStorage.getItem("mv.spotify.embed")||Ta(Ql);function Yi(){return Ht[js]}function kg(){const i=Yi().engine;return i==="fractal"?va:i==="geometry"?xa:i==="warp"?Ma:i==="cyber"?ya:i==="world3d"?Sa:_a}function Pi(i){i<0&&(i=Ht.length-1),i>=Ht.length&&(i=0),js=i;const e=Ht[i],t=document.getElementById("sel-mode"),n=document.getElementById("hud-sel-mode");if(t&&(t.value=String(i)),n&&(n.value=String(i)),_a.classList.toggle("inactive",e.engine!=="fluid"),va.classList.toggle("inactive",e.engine!=="fractal"),xa.classList.toggle("inactive",e.engine!=="geometry"),Ma.classList.toggle("inactive",e.engine!=="warp"),ya.classList.toggle("inactive",e.engine!=="cyber"),Sa.classList.toggle("inactive",e.engine!=="world3d"),e.engine==="world3d"&&(tn.setWorld(e.world),tn.resize()),e.engine==="fluid"){if(yt.resize(),e.physics){const r=e.physics;yt.config.DENSITY_DISSIPATION=r.diss,yt.config.CURL=r.vort,yt.config.VISCOSITY=r.visc,yt.config.SPLAT_RADIUS=r.radius}yt.clear()}e.engine==="fractal"&&Ln.resize(),e.engine==="geometry"&&(ks.resize(),ks.setMode(e)),e.engine==="warp"&&Ea.resize(),e.engine==="cyber"&&ba.resize(),localStorage.setItem("mv.mode",e.id);const s=document.getElementById("flash");s.querySelector(".fname").textContent=e.name,s.querySelector(".fgroup").textContent=e.group,s.classList.add("show"),setTimeout(()=>s.classList.remove("show"),1600)}function Qr(i){Pi(js+i)}function ec(){let i;do i=Math.floor(Math.random()*Ht.length);while(i===js);Pi(i)}const Te={x:.5,y:.5,sy:.5,vx:0,vy:0,down:!1,active:!1,moving:!1,repel:!1,pointers:[]};let Br=0,zr=0,gl=!1,Is=0;function Aa(i,e){const t=kg(),n=t.clientWidth||innerWidth,s=t.clientHeight||innerHeight,r=i/n,o=1-e/s;gl||(Br=r,zr=o,gl=!0),Te.vx=r-Br,Te.vy=o-zr,Br=r,zr=o,Te.x=r,Te.y=o,Te.sy=e/s,Te.active=!0,(Math.abs(Te.vx)>8e-4||Math.abs(Te.vy)>8e-4)&&(Is=6),Te.down&&(ce.pan.x-=Te.vx*(n/s)/Math.max(.01,ce.zoom),ce.pan.y-=Te.vy/Math.max(.01,ce.zoom))}function Vg(){if(Is>0?(Is--,Te.moving=!0):(Te.moving=!1,Te.vx*=.85,Te.vy*=.85),Te.pointers.length)for(const i of Te.pointers)Is>0?i.moving=!0:(i.moving=!1,i.vx*=.85,i.vy*=.85)}window.addEventListener("mousemove",i=>{Aa(i.clientX,i.clientY),Te.pointers=[{...Te}]});window.addEventListener("mousedown",i=>{i.target.closest?.("#panel")||i.target.closest?.("#top-hud")||(Te.down=!0,Te.repel=i.shiftKey||i.button===2,Te.pointers=[{...Te}])});window.addEventListener("mouseup",()=>{Te.down=!1,Te.pointers=[]});window.addEventListener("touchstart",i=>{if(i.target.closest?.("#panel")||i.target.closest?.("#top-hud"))return;const e=i.touches[0];if(!e)return;Te.down=!0,Te.repel=i.touches.length>1;const t=e.clientX/innerWidth,n=1-e.clientY/innerHeight;Te.x=t,Te.y=n,Te.sy=e.clientY/innerHeight,Te.active=!0,Te.pointers=[{...Te}],Aa(e.clientX,e.clientY)},{passive:!0});window.addEventListener("touchmove",i=>{const e=i.touches[0];e&&Aa(e.clientX,e.clientY)},{passive:!0});window.addEventListener("touchend",()=>{Te.down=!1,Te.pointers=[]},{passive:!0});window.addEventListener("wheel",i=>{if(i.target.closest?.("#panel")||i.target.closest?.("#top-hud"))return;i.preventDefault();const e=i.deltaY<0?1.12:.89;ce.zoom=Math.max(.1,Math.min(50,ce.zoom*e));const t=document.getElementById("s-zoom"),n=document.getElementById("v-zoom");t&&n&&(t.value=String(Math.round(Math.log10(ce.zoom)*100)),n.textContent=ce.zoom.toFixed(2)+"×")},{passive:!1});let ea=0,tc=1;window.addEventListener("touchstart",i=>{i.target.closest?.("#panel")||i.target.closest?.("#top-hud")||i.touches.length===2&&(ea=Math.hypot(i.touches[0].clientX-i.touches[1].clientX,i.touches[0].clientY-i.touches[1].clientY),tc=ce.zoom)},{passive:!0});window.addEventListener("touchmove",i=>{if(!(i.target.closest?.("#panel")||i.target.closest?.("#top-hud"))&&i.touches.length===2&&ea>0){const t=Math.hypot(i.touches[0].clientX-i.touches[1].clientX,i.touches[0].clientY-i.touches[1].clientY)/ea;ce.zoom=Math.max(.1,Math.min(50,tc*t));const n=document.getElementById("s-zoom"),s=document.getElementById("v-zoom");n&&s&&(n.value=String(Math.round(Math.log10(ce.zoom)*100)),s.textContent=ce.zoom.toFixed(2)+"×")}},{passive:!0});function nc(i){const e=Ta(i)||Xi;e!==i?Xi=e:i.startsWith("http")&&(Xi=i),localStorage.setItem("mv.spotify.embed",Xi);const t=document.getElementById("sp-embed"),n=document.getElementById("sp-embed-wrap");t&&(t.src=Xi,n&&(n.style.display="block"));const s=document.getElementById("sp-url");s&&(s.value=i)}function qe(i,e=!1){const t=document.getElementById("toast");t.textContent=i,t.className=e?"show err":"show",setTimeout(()=>t.className="",e?5e3:2800),console.log("[MusicViz]",i)}function ic(){document.fullscreenElement?document.exitFullscreen().catch(()=>{}):document.documentElement.requestFullscreen().catch(()=>qe("Fullscreen request denied",!0))}xg(Gg,Ht,{onMode:i=>{i===1||i===-1?Qr(i):Pi(i)},onRandom:ec,onFullscreen:ic,onVR:()=>Xg(),onBirdFly:()=>rc(),onDemo:async()=>{Ke.unlock();let i=null;try{i=Ke.useDemo(0)}catch(s){console.warn("demo useDemo throw",s)}let e=!1;if(i){const s=()=>{e=!0,Ke.setSynthetic(!0),qe("Demo stream blocked — fallback to WebAudio rave.",!0)};i.addEventListener("error",s,{once:!0}),setTimeout(()=>{i.removeEventListener("error",s),!e&&i&&i.paused&&qe("Demo needs tap to play")},1300)}qe("Demo Rave 140 BPM • High dynamic range active");const t=Ht.findIndex(s=>s.id==="hyperspace-warp");t>=0&&Pi(t),It.set("vapor");const n=document.getElementById("sel-pal");n&&(n.value="vapor")},onDemoNext:()=>{try{Ke.nextDemo(),qe("Next Demo Rave track loaded")}catch{qe("Next demo failed",!0)}},onDemoStop:()=>{try{Ke.disconnect?.()}catch{}Ke.setSynthetic(!0),qe("Demo stopped — pick System/Mic/File/Spotify")},onYouTube:async i=>{if(i.match(/\.(mp3|ogg|wav|m4a)(\?|$)/i)){try{Ke.unlock(),Ke.useMediaElement(i,"url: "+i,{loop:!0}),qe("Streaming Audio URL")}catch{qe("URL play failed",!0)}return}Ke.unlock(),await Ke.useYouTube(i)?qe("YouTube audio stream loaded"):qe("YouTube: paste direct MP3 URL or use Demo/System",!0)},onSpotify:i=>{if(!Ta(i)){qe("Invalid Spotify link (playlist/album/track)",!0);return}nc(i),qe('Spotify loaded — hit "Listen to this player" then Share tab audio'),document.getElementById("sp-embed-wrap")?.scrollIntoView({behavior:"smooth",block:"nearest"})},onSpotifyCapture:async()=>{if(Ke.unlock(),Ke.hasLiveCapture?.()){qe("Using existing capture — hit play in Spotify player");return}await Ke.useSystemAudio?.("Spotify player",!0)?qe("Listening to Spotify player — hit play above"):qe('Confirm THIS tab + tick "Share tab audio"',!0)},onSystem:async()=>{Ke.unlock(),await Ke.useSystemAudio(null,!0)?qe("System audio linked"):qe("System capture cancelled",!0)},onMic:async()=>{Ke.unlock(),await Ke.useMicrophone()?qe("Microphone linked"):qe("Mic access denied",!0)},onFile:i=>{Ke.unlock(),Ke.useFile(i),qe("Playing local file: "+i.name)}});["s-gain","s-motion","s-react","s-interact","s-diss","s-vort","s-detail","s-zoom","s-morph","s-morph-rate","s-fly"].forEach(i=>{const e=document.getElementById(i);if(!e)return;const t={"s-gain":"v-gain","s-motion":"v-motion","s-react":"v-react","s-interact":"v-interact","s-diss":"v-diss","s-vort":"v-vort","s-detail":"v-detail","s-zoom":"v-zoom","s-morph":"v-morph","s-morph-rate":"v-morph-rate","s-fly":"v-fly"};e.addEventListener("input",()=>{const n=parseFloat(e.value),s=document.getElementById(t[i]);i==="s-gain"&&(Ke.config.gain=n,s&&(s.textContent=n.toFixed(1))),i==="s-motion"&&(ce.motion=n,s&&(s.textContent=n.toFixed(2)+"×")),i==="s-react"&&(ce.reactivity=n,Ke.config.sensitivity=1.5*n,s&&(s.textContent=n.toFixed(1))),i==="s-interact"&&(ce.interact=n/100,s&&(s.textContent=Math.round(n)+"%")),i==="s-diss"&&(yt.config.DENSITY_DISSIPATION=n,s&&(s.textContent=n.toFixed(3))),i==="s-vort"&&(yt.config.CURL=n,s&&(s.textContent=String(Math.round(n)))),i==="s-detail"&&(ce.detail=n/100,s&&(s.textContent=Math.round(n)+"%")),i==="s-zoom"&&(ce.zoom=Math.pow(10,n/100),s&&(s.textContent=(ce.zoom<1e3?ce.zoom.toFixed(ce.zoom<10?2:0):ce.zoom.toExponential(1))+"×")),i==="s-morph"&&(Ln.setMorph(n/100),s&&(s.textContent=Math.round(n)+"%")),i==="s-morph-rate"&&(Ln.setMorphRate(n/100*2),s&&(s.textContent=Math.round(n)+"%")),i==="s-fly"&&(ce.flySpeed=n,Ln.setFlyThrough(ce.flyThrough,n),s&&(s.textContent=n.toFixed(1)+"×"))})});document.getElementById("sw-fly")?.addEventListener("click",i=>{const e=i.currentTarget,t=!e.classList.contains("on");e.classList.toggle("on",t),ce.flyThrough=t;const n=document.getElementById("s-fly"),s=n?parseFloat(n.value):1;ce.flySpeed=s,Ln.setFlyThrough(t,s),qe(t?"Fly-Through Mode ON — automatic flight drift active":"Fly-Through Mode OFF")});document.getElementById("sel-pal")?.addEventListener("change",i=>{const e=i.target.value;It.set(e),localStorage.setItem("mv.palette",e),qe("Palette: "+e)});document.getElementById("b-reset-view")?.addEventListener("click",()=>{ce.pan.x=0,ce.pan.y=0,ce.zoom=1;const i=document.getElementById("s-zoom");i&&(i.value="0",i.dispatchEvent(new Event("input"))),qe("Camera view reset")});window.addEventListener("keydown",i=>{if(!(i.target instanceof HTMLInputElement||i.target instanceof HTMLSelectElement)){if(i.key==="f"||i.key==="F")ic();else if(i.key==="h"||i.key==="H")document.getElementById("panel")?.classList.toggle("collapsed");else if(i.key==="[")Qr(-1);else if(i.key==="]")Qr(1);else if(i.key==="r"||i.key==="R")ec();else if(i.key==="v"||i.key==="V")rc();else if(i.key==="p"||i.key==="P"){const e=document.getElementById("sel-pal");if(e){const t=(e.selectedIndex+1)%e.options.length;e.selectedIndex=t,e.dispatchEvent(new Event("change"))}}}});let Vs=!1,wa=!1,Ra=!1,Ca=!1,Pa=!1;try{Vs=yt.init()}catch(i){console.error("fluid init fail",i)}try{wa=Ln.init()}catch(i){console.error("fractal init fail",i)}try{Ra=ks.init()}catch(i){console.error("geo init fail",i)}try{Ca=Ea.init()}catch(i){console.error("warp init fail",i)}try{Pa=ba.init()}catch(i){console.error("cyber init fail",i)}!Vs&&!wa&&!Ra&&!Ca&&!Pa&&qe("WebGL2 unavailable — please check WebGL support",!0);nc(localStorage.getItem("mv.spotify.embed")||Ql);const Wg=localStorage.getItem("mv.mode");let ta=Ht.findIndex(i=>i.id===Wg);ta<0&&(ta=0);Pi(ta);const Gr=localStorage.getItem("mv.palette");if(Gr){It.set(Gr);const i=document.getElementById("sel-pal");i&&(i.value=Gr)}Ke.setSynthetic(!0);Ke.onStatus((i,e)=>{const t=document.querySelector("#s-status .dot"),n=document.getElementById("s-text"),s=document.getElementById("hud-track-name");!t||!n||(i==="connected"||i==="audible"?(t.className="dot live",n.textContent="Listening to "+e,s&&(s.textContent=e),Ke.setSynthetic(!1)):i==="silent"?(t.className="dot warn",n.textContent="Connected but silent — "+e):i==="ended"?(t.className="dot",n.textContent="Capture stopped",Ke.setSynthetic(!0)):i==="error"&&(t.className="dot err",n.textContent=e,qe(e,!0)))});const Ti=()=>{Ke.unlock(),window.removeEventListener("touchend",Ti),window.removeEventListener("mousedown",Ti),window.removeEventListener("keydown",Ti)};window.addEventListener("touchend",Ti,{passive:!0});window.addEventListener("mousedown",Ti);window.addEventListener("keydown",Ti);function sc(){if(Yi().engine==="world3d")return!0;const i=Ht.findIndex(e=>e.engine==="world3d"&&e.world===Yi().id);return i<0?!1:(Pi(i),!0)}async function Xg(){if(tn.isVRActive()){tn.stopVR();return}if(!sc()){qe("This mode has no 3D version",!0);return}if(!await tn.isVRAvailable()){qe("No VR headset detected — starting 3D bird flight instead",!0),tn.setDesktopFlight(!0);return}try{await tn.startVR(i=>{const e=document.getElementById("b-vr");e&&(e.textContent=i?"Exit VR":"Enter WebXR VR (6DOF Headset Flight)")}),qe("6DOF flight — thumbstick to fly · trigger to soar in gaze direction")}catch(i){qe("VR failed: "+i.message,!0)}}function rc(){if(!sc()){qe("This mode has no 3D version",!0);return}const i=tn.toggleDesktopFlight();qe(i?"Bird flight ON — WASD fly · mouse look · Space/C up-down · Shift boost · Esc to land":"Bird flight OFF")}window.addEventListener("resize",()=>{Yi().engine==="world3d"&&tn.resize()});let _l=performance.now(),Zt=0;const Ct={t:0,dt:0,m:null,k:1,depth:1,interact:1,zoom:1,pan:{x:0,y:0},flyThrough:!1,flySpeed:1,detail:.6,layerOn:{sub:!0,mid:!0,high:!0,air:!0},pointer:Te,band:i=>Ct.m.band[i],n:i=>Ct.m.band[i].norm,e:i=>Ct.m.band[i].env};function qg(i,e){const t=Math.min((i-_l)/1e3,.033)*ce.motion;_l=i,Zt+=t*1e3;const n=Ke.update(i);It.updateMusic(n),Vg(),Ct.t=Zt,Ct.dt=t,Ct.m=n,Ct.k=ce.reactivity,Ct.depth=ce.depth,Ct.interact=ce.interact,Ct.zoom=ce.zoom,Ct.pan=ce.pan,Ct.flyThrough=ce.flyThrough,Ct.flySpeed=ce.flySpeed,Ct.detail=ce.detail;const s=Yi();try{if(s.engine==="world3d")tn.render(n,t,ce.flySpeed);else if(s.engine==="fluid"&&Vs){yt.beginFrame();const o=n.band.bass.norm,a=n.band.mid.norm;if(s.id==="spectrum-fountain"){const u=n.bandsNorm.length/24;for(let h=0;h<12;h++){const d=n.bandsNorm[Math.floor(h*u)];d<.12||yt.splat((h+.5)/24,.03,(Math.random()-.5)*3,d*78*ce.reactivity,It.hdr(h/24*.8,3.2),.6+d)}}else{const c=Zt*9e-4*(.5+a*1.6);for(let u=0;u<3;u++){const h=c+Math.PI*2*(u/3),d=(.26+o*.12)*Math.min(2,ce.zoom);yt.splat(.5+Math.cos(h)*d,.5+Math.sin(h)*d,-Math.sin(h)*8*ce.reactivity,Math.cos(h)*8*ce.reactivity,It.hdr(.33+u/3*.1,3),.8)}}if(Te.active&&ce.interact>0)for(const c of Te.pointers.length?Te.pointers:[Te])c.active&&yt.splat(c.x,c.y,c.vx*5*ce.interact,c.vy*5*ce.interact,It.hdr(0,1),1);const l=yt.applyAudioParams(n,ce.reactivity);yt.solve(t,l.vort,l.diss,ce.fractalFold>=0?ce.fractalFold:s.fractal||0,Zt)}else if(s.engine==="fractal"&&wa){const o=Zt*(s.timeScale??1);Ln.juliaSeed(Zt*1e-4,n,Zt),Ln.render(s,n,Te,{time:o,stamp:Zt,interact:ce.interact,detail:ce.detail,zoom:ce.zoom,pan:ce.pan,hover:1,bg:1,bgAmt:1,wall:i,key:!1,role:1,events:ce.evt.map(a=>({x:a.x,y:a.y,kind:a.kind,age:(i-a.at)/1e3}))})}else s.engine==="geometry"&&Ra?(ks.frame(Zt,n,Ct),(s.id.startsWith("hybrid")||s.id==="bloom-grid")&&n.beat&&Vs&&yt.splat(.5,.5,(Math.random()-.5)*10,(Math.random()-.5)*10,It.hdr(Math.random(),3.2))):s.engine==="warp"&&Ca?Ea.render(Zt,n,Te,{zoom:ce.zoom,pan:ce.pan,fly:ce.flyThrough,flySpeed:ce.flySpeed,detail:ce.detail,motion:ce.motion}):s.engine==="cyber"&&Pa&&ba.render(Zt,n,Te,{zoom:ce.zoom,pan:ce.pan,fly:ce.flyThrough,flySpeed:ce.flySpeed,detail:ce.detail,motion:ce.motion})}catch(o){console.error("frame error",o)}document.querySelectorAll("#meters i").forEach(o=>{const a=o.dataset.band,l=n.band[a];o.style.height=Math.min(100,(l?l.env:0)*100)+"%"});const r=document.getElementById("bpm");r&&n.bpm&&(r.textContent=`Tempo ${n.bpm} BPM${n.synthetic&&!n.live?" (synth)":""} · centroid ${Math.round(n.centroid*100)}%`)}tn.setLoop(qg);window.FluidSimInstance=yt;window.audio=Ke;window.palette=It;const Hr=Ht.filter(i=>i.engine==="world3d"&&!Jl[i.world]).map(i=>i.id);Hr.length&&(console.error("[MusicViz] 3D worlds missing:",Hr),qe("Missing 3D worlds: "+Hr.join(", "),!0));console.log("[MusicViz] Next-Gen platform booted — modes:",Ht.length,"(2D:",Ht.filter(i=>i.engine!=="world3d").length,"· 3D:",Ht.filter(i=>i.engine==="world3d").length+")");
//# sourceMappingURL=index-C5VD7C3J.js.map
