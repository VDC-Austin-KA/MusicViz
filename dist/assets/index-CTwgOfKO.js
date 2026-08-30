(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))n(r);new MutationObserver(r=>{for(const s of r)if(s.type==="childList")for(const o of s.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&n(o)}).observe(document,{childList:!0,subtree:!0});function t(r){const s={};return r.integrity&&(s.integrity=r.integrity),r.referrerPolicy&&(s.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?s.credentials="include":r.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function n(r){if(r.ep)return;r.ep=!0;const s=t(r);fetch(r.href,s)}})();const qn=[{key:"subBass",lo:20,hi:60},{key:"bass",lo:60,hi:160},{key:"lowMid",lo:160,hi:400},{key:"mid",lo:400,hi:1200},{key:"highMid",lo:1200,hi:3200},{key:"presence",lo:3200,hi:7e3},{key:"air",lo:7e3,hi:16e3}],Yn=[{id:"rave-140",title:"Rave Energy 140 BPM",artist:"Pixabay · Energy",url:"https://cdn.pixabay.com/download/audio/2021/08/09/audio_0625c1539c.mp3?filename=energy-115010.mp3",bpm:140},{id:"rave-128",title:"Neon Pulse 128 BPM",artist:"Pixabay · Epic",url:"https://cdn.pixabay.com/download/audio/2022/03/24/audio_d1718ab41b.mp3?filename=electronic-rock-112719.mp3",bpm:128},{id:"rave-150",title:"Hyper Drive 150 BPM",artist:"Pixabay · Hyper",url:"https://cdn.pixabay.com/download/audio/2022/10/30/audio_8ef11c7db6.mp3?filename=cyberpunk-138757.mp3",bpm:150}],it=64,Pn=1024,Hi=12,Nl=60,Fl=.3,Ol=.008,Bl=.3,zl=.008,Fr=.06,Gl=.02,Hl=.34,kl=.15,Vl=12;function zt(i){return i<0?0:i>1?1:i}function ki(i,e){if(i.ceil+=(e>i.ceil?Fl:Ol)*(e-i.ceil),i.floor+=(e<i.floor?Bl:zl)*(e-i.floor),i.ceil<Gl)return 0;let t=i.floor,n=i.ceil;if(n-t<Fr){const r=(n+t)*.5;t=r-Fr*.5,n=r+Fr*.5}return zt((e-t)/(n-t))}class Wl{static _rangeNorm=ki;BAND_COUNT=it;WAVE_COUNT=Pn;ctx=null;analyser=null;gainTrim=null;freqData=null;waveData=null;sourceNode=null;stream=null;mediaEl=null;captureKind="none";started=!1;sourceLabel="none";lastSoundAt=0;beatTimes=[];lastBeatAt=0;synth={enabled:!0,bpm:120,phase:0,seed:Math.random()*1e3};demoIdx=0;bands;metrics;bandEdges=null;bandDefBins=null;chromaMap=null;binPeak=new Float32Array(it);binPrev=new Float32Array(it);binRange=Array.from({length:it},()=>({floor:0,ceil:0}));energyRange={floor:0,ceil:0};driveHistory=new Array(Nl).fill(0);autoGain=1;config={gain:1.2,sensitivity:1.5,smoothing:.82,adaptive:1,autoLevel:!1,attack:.55,release:.08};onStatusCb=()=>{};constructor(){const e={};qn.forEach(t=>e[t.key]={key:t.key,raw:0,level:0,norm:0,env:0,onset:0,peak:0,floor:0,ceil:0,prev:0,hit:!1}),this.bands=e,this.metrics={bass:0,lowMid:0,mid:0,highMid:0,treble:0,band:e,bands:new Float32Array(it),bandsNorm:new Float32Array(it),onsets:new Float32Array(it),peaks:new Float32Array(it),wave:new Float32Array(Pn),chroma:new Float32Array(Hi),chromaPeak:0,centroid:.5,spread:.5,flux:0,level:0,saturation:0,autoGain:1,energy:0,beat:!1,beatPulse:0,beatCount:0,bpm:0,live:!1,synthetic:!0}}ensureContext(){if(this.ctx)return this.ctx;const e=window.AudioContext||window.webkitAudioContext;return this.ctx=new e,this.analyser=this.ctx.createAnalyser(),this.analyser.fftSize=4096,this.analyser.smoothingTimeConstant=this.config.smoothing,this.analyser.minDecibels=-95,this.analyser.maxDecibels=-10,this.gainTrim=this.ctx.createGain(),this.gainTrim.gain.value=1,this.gainTrim.connect(this.analyser),this.freqData=new Uint8Array(this.analyser.frequencyBinCount),this.waveData=new Uint8Array(this.analyser.fftSize),this.started=!0,this.ctx}unlock(){this.ensureContext(),this.ctx.state==="suspended"&&this.ctx.resume();try{const e=this.ctx.createBuffer(1,1,22050),t=this.ctx.createBufferSource();t.buffer=e,t.connect(this.ctx.destination),t.start(0)}catch{}}resume(){this.ctx&&this.ctx.state==="suspended"&&this.ctx.resume()}disconnect(){if(this.sourceNode){try{this.sourceNode.disconnect()}catch{}this.sourceNode=null}if(this.stream&&(this.stream.getTracks().forEach(e=>e.stop()),this.stream=null),this.mediaEl){try{this.mediaEl.pause()}catch{}this.mediaEl=null}this.sourceLabel="none",this.captureKind="none",this.metrics.live=!1}resetAdaptive(){for(let e=0;e<it;e++)this.binPeak[e]=0,this.binRange[e].floor=0,this.binRange[e].ceil=0;qn.forEach(e=>{const t=this.bands[e.key];t.peak=0,t.floor=0,t.ceil=0}),this.energyRange.floor=0,this.energyRange.ceil=0,this.autoGain=1,this.gainTrim&&(this.gainTrim.gain.value=1)}attachStream(e,t){this.ensureContext(),this.disconnect(),this.resume(),this.stream=e,this.sourceNode=this.ctx.createMediaStreamSource(e),this.sourceNode.connect(this.gainTrim),this.sourceLabel=t,this.lastSoundAt=performance.now(),this.resetAdaptive(),e.getTracks().forEach(n=>n.addEventListener("ended",()=>{this.stream===e&&(this.disconnect(),this.onStatusCb("ended",t))})),this.onStatusCb("connected",t)}hasLiveCapture(){return this.captureKind==="display"&&this.stream&&this.stream.getAudioTracks().some(e=>e.readyState==="live")}isStarted(){return this.started}sourceLabelStr(){return this.sourceLabel}onStatus(e){this.onStatusCb=e}setSynthetic(e,t){this.synth.enabled=!!e,t&&(this.synth.bpm=t),this.metrics.synthetic=this.synth.enabled}setAutoLevel(e){this.config.autoLevel=!!e,!e&&this.gainTrim&&(this.autoGain=1,this.gainTrim.gain.value=1)}setSmoothing(e){this.config.smoothing=e,this.analyser&&(this.analyser.smoothingTimeConstant=e)}async useMicrophone(){try{const e=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:!1,noiseSuppression:!1,autoGainControl:!1},video:!1});return this.attachStream(e,"microphone"),this.captureKind="mic",!0}catch{return this.onStatusCb("error","Microphone access was denied."),!1}}async useSystemAudio(e,t){if(!t&&this.hasLiveCapture())return this.sourceLabel=e||this.sourceLabel,this.resetAdaptive(),this.onStatusCb("connected",this.sourceLabel+" (already capturing)"),!0;if(!navigator.mediaDevices||!navigator.mediaDevices.getDisplayMedia)return this.onStatusCb("error","This browser cannot capture system audio."),!1;try{const n=await navigator.mediaDevices.getDisplayMedia({preferCurrentTab:!0,systemAudio:"include",video:!0,audio:{echoCancellation:!1,noiseSuppression:!1,autoGainControl:!1}});return n.getAudioTracks().length===0?(n.getTracks().forEach(r=>r.stop()),this.onStatusCb("error",'No audio track shared — tick "Share system audio" / "Share tab audio"'),!1):(n.getVideoTracks().forEach(r=>r.stop()),this.attachStream(n,e||"system audio"),this.captureKind="display",n.getAudioTracks().forEach(r=>r.addEventListener("ended",()=>this.captureKind="none")),!0)}catch{return this.onStatusCb("error","System audio capture was cancelled."),!1}}useFile(e){this.ensureContext(),this.disconnect(),this.resume();const t=new Audio;return t.src=URL.createObjectURL(e),t.crossOrigin="anonymous",t.loop=!0,this.mediaEl=t,this.sourceNode=this.ctx.createMediaElementSource(t),this.sourceNode.connect(this.gainTrim),this.sourceNode.connect(this.ctx.destination),this.sourceLabel="file: "+e.name,this.captureKind="file",this.resetAdaptive(),t.play().catch(()=>this.onStatusCb("error","Could not play that file.")),this.lastSoundAt=performance.now(),this.onStatusCb("connected",this.sourceLabel),t}useMediaElement(e,t,n){this.ensureContext(),this.disconnect(),this.resume();const r=new Audio;r.crossOrigin="anonymous",r.loop=!!n?.loop,r.autoplay=!!n?.autoplay,n?.volume!==void 0&&(r.volume=n.volume),r.src=e,this.mediaEl=r;try{this.sourceNode=this.ctx.createMediaElementSource(r),this.sourceNode.connect(this.gainTrim),this.sourceNode.connect(this.ctx.destination)}catch(o){console.warn("createMediaElementSource CORS fallback",o),this.onStatusCb("error","Audio CORS blocked — using synthesized rave (visuals fully reactive). Try File/System audio.");try{r.src=e,r.play().catch(()=>{})}catch{}return this.sourceLabel=t+" (CORS fallback)",this.captureKind=n?.kind||"file",this.resetAdaptive(),this.setSynthetic(!0),this.synth.bpm=140,this.lastSoundAt=performance.now(),this.onStatusCb("connected",this.sourceLabel),r}this.sourceLabel=t,this.captureKind=n?.kind||"file",this.resetAdaptive();const s=r.play();return s&&s.catch&&s.catch(o=>this.onStatusCb("error","Tap Play to start audio ("+(o?.message||"autoplay blocked")+")")),this.lastSoundAt=performance.now(),this.onStatusCb("connected",this.sourceLabel),r.addEventListener("error",()=>{this.onStatusCb("error","Audio load failed — switched to synth."),this.setSynthetic(!0)}),r}useSynthRave(e=140){this.ensureContext(),this.disconnect(),this.resume(),this.resetAdaptive(),this.synth.bpm=e,this.setSynthetic(!1);const t=this.ctx,n=t.createGain();n.gain.value=.42,n.connect(this.gainTrim),n.connect(t.destination);let r=0;const s=()=>{if(this.captureKind!=="demo")return;const o=t.currentTime,a=t.createOscillator();a.frequency.value=55;const l=t.createGain();a.connect(l),l.connect(n),l.gain.setValueAtTime(1,o),l.gain.exponentialRampToValueAtTime(.01,o+.18),a.start(o),a.stop(o+.2);const c=t.createOscillator();c.type="sawtooth",c.frequency.value=110+Math.sin(r)*8;const u=t.createGain();if(c.connect(u),u.connect(n),u.gain.setValueAtTime(.18,o),u.gain.linearRampToValueAtTime(.02,o+.22),c.start(o),c.stop(o+.23),Math.random()<.7){const h=t.createOscillator();h.frequency.value=8e3;const p=t.createGain();h.connect(p),p.connect(n),p.gain.setValueAtTime(.08,o+.05),p.gain.exponentialRampToValueAtTime(.001,o+.09),h.start(o+.05),h.stop(o+.1)}r+=.22,setTimeout(s,6e4/e)};return this.captureKind="demo",s(),this.mediaEl=new Audio,this.sourceLabel=`synth-rave ${e} BPM`,this.lastSoundAt=performance.now(),this.onStatusCb("connected",this.sourceLabel),this.mediaEl}useDemo(e){typeof e=="number"&&(this.demoIdx=(e%Yn.length+Yn.length)%Yn.length);const t=Yn[this.demoIdx];try{const n=this.useMediaElement(t.url,"demo: "+t.title+" — "+t.artist,{loop:!0,kind:"demo"});return this.synth.bpm=t.bpm,this.setSynthetic(!1),this.gainTrim&&(this.gainTrim.gain.value=1.1),this.sourceLabel.includes("CORS fallback")&&this.useSynthRave(t.bpm),n}catch{return this.useSynthRave(Yn[this.demoIdx].bpm)}}nextDemo(){return this.demoIdx=(this.demoIdx+1)%Yn.length,this.useDemo(this.demoIdx)}async useYouTube(e){const t=(e||"").match(/(?:v=|\.be\/|embed\/)([A-Za-z0-9_-]{11})/);if(!t)return this.onStatusCb("error","That does not look like a YouTube link. Paste a full youtube.com/watch?v= URL."),null;const n=t[1];try{const r=await fetch("/api/youtube?id="+encodeURIComponent(n));if(r.ok){const s=await r.json();if(s&&s.audioUrl)return this.useMediaElement(s.audioUrl,"youtube: "+(s.title||n),{loop:!1,kind:"youtube"})}}catch{}return this.onStatusCb("error","Direct YouTube audio not available on this host. Use Demo Rave / File / System capture (tab audio)."),null}getUniforms(){return{bass:this.bands.bass?.norm||0,mid:this.bands.mid?.norm||0,treble:this.bands.air?.norm||0,lowMid:this.bands.lowMid?.norm||0,highMid:this.bands.highMid?.norm||0,presence:this.bands.presence?.norm||0,subBass:this.bands.subBass?.norm||0,energy:this.metrics.energy,beat:this.metrics.beat?1:0,beatPulse:this.metrics.beatPulse,centroid:this.metrics.centroid,flux:this.metrics.flux,level:this.metrics.level}}buildMaps(){const e=this.ctx.sampleRate/2,t=this.analyser.frequencyBinCount,n=25,r=Math.min(17e3,e);this.bandEdges=new Int32Array(it+1);for(let o=0;o<=it;o++){const a=n*Math.pow(r/n,o/it);this.bandEdges[o]=Math.min(t-1,Math.max(1,Math.round(a/e*t)))}for(let o=1;o<=it;o++)this.bandEdges[o]<=this.bandEdges[o-1]&&(this.bandEdges[o]=this.bandEdges[o-1]+1);this.bandDefBins=qn.map(o=>[Math.max(1,Math.floor(o.lo/e*t)),Math.min(t-1,Math.ceil(o.hi/e*t))]),this.chromaMap=new Int8Array(t).fill(-1);const s=e/t;for(let o=1;o<t;o++){const a=o*s;if(a<65||a>2100)continue;const l=69+12*Math.log2(a/440);this.chromaMap[o]=(Math.round(l)%12+12)%12}}updateAutoLevel(e,t){if(!this.config.autoLevel||!this.gainTrim)return;if(t>.25)this.autoGain*=.97;else if(e>.0015)this.autoGain*=1+(Hl-e)*.06;else return;this.autoGain=Math.max(kl,Math.min(Vl,this.autoGain));const n=this.autoGain,r=this.gainTrim.gain.value;this.gainTrim.gain.value=r+(n-r)*.1}update(e){if(!this.started||!this.analyser)return this.synth.enabled&&this.synthesize(e),this.metrics;this.bandEdges||this.buildMaps(),this.analyser.getByteFrequencyData(this.freqData),this.analyser.getByteTimeDomainData(this.waveData);const t=this.config.gain;let n=0,r=0,s=0,o=0;for(let g=0;g<it;g++){const d=this.bandEdges[g],f=this.bandEdges[g+1];let b=0;for(let A=d;A<f;A++)b+=this.freqData[A],this.freqData[A]>250&&o++;const M=1+Math.pow(g/it,1.4)*.45,y=zt(b/Math.max(1,f-d)/255*t*M);this.metrics.bands[g]+=(y-this.metrics.bands[g])*.45;const P=y-this.binPrev[g];P>0&&(n+=P),this.metrics.onsets[g]=Math.max(this.metrics.onsets[g]*.86,P>.035?zt(P*6):0),this.binPrev[g]=y;const w=ki(this.binRange[g],y);this.binPeak[g]=this.binRange[g].ceil,this.metrics.bandsNorm[g]=y+(w-y)*this.config.adaptive,this.metrics.peaks[g]=Math.max(this.metrics.peaks[g]*.965,this.metrics.bands[g]),r+=g*y,s+=y}this.metrics.flux=zt(n/6);const a=s>.001?r/s/it:.5;this.metrics.centroid+=(a-this.metrics.centroid)*.12;let l=0;if(s>.001){for(let g=0;g<it;g++)l+=Math.abs(g/it-a)*this.metrics.bands[g];l/=s}this.metrics.spread+=(zt(l*3)-this.metrics.spread)*.1;for(let g=0;g<qn.length;g++){const d=this.bands[qn[g].key],f=this.bandDefBins[g];let b=0;for(let w=f[0];w<=f[1];w++)b+=this.freqData[w];const M=g>3?1+(g-3)*.12:1,y=zt(b/Math.max(1,f[1]-f[0]+1)/255*t*M);d.raw=y,d.level+=(y-d.level)*.4,d.norm=d.raw+(ki(d,y)-d.raw)*this.config.adaptive,d.env+=d.norm>d.env?(d.norm-d.env)*this.config.attack:(d.norm-d.env)*this.config.release;const P=y-d.prev;d.hit=P>.05&&d.norm>.35,d.onset=Math.max(d.onset*.85,d.hit?zt(P*7):0),d.prev=y}this.metrics.bass=this.bands.bass.norm,this.metrics.lowMid=this.bands.lowMid.norm,this.metrics.mid=this.bands.mid.norm,this.metrics.highMid=this.bands.highMid.norm,this.metrics.treble=this.bands.air.norm;for(let g=0;g<Hi;g++)this.metrics.chroma[g]*=.82;let c=0;for(let g=1;g<this.chromaMap.length;g++){const d=this.chromaMap[g];if(d<0)continue;const f=this.freqData[g]/255;this.metrics.chroma[d]+=f*.18,c+=f}let u=0;for(let g=1;g<Hi;g++)this.metrics.chroma[g]>this.metrics.chroma[u]&&(u=g);c>.5&&(this.metrics.chromaPeak=u);let h=0;const p=this.waveData.length/Pn;for(let g=0;g<Pn;g++){const d=(this.waveData[Math.floor(g*p)]-128)/128;this.metrics.wave[g]=d,h+=d*d}const m=Math.sqrt(h/Pn);this.metrics.level=zt(m*2.2*t),this.metrics.saturation=o/Math.max(1,this.bandEdges[it]-this.bandEdges[0]),this.metrics.autoGain=this.gainTrim?this.gainTrim.gain.value:1,this.updateAutoLevel(m,this.metrics.saturation),this.metrics.energy=this.metrics.level+(ki(this.energyRange,this.metrics.level)-this.metrics.level)*this.config.adaptive,this.detectBeat(e),this.metrics.level>.012&&(this.lastSoundAt=e);const _=e-this.lastSoundAt<2200;return _!==this.metrics.live&&this.sourceLabel!=="none"&&(this.metrics.live=_,this.onStatusCb(_?"audible":"silent",this.sourceLabel)),this.synth.enabled&&!_&&this.synthesize(e),this.metrics}detectBeat(e){const t=Math.max(this.bands.subBass.norm,this.bands.bass.norm);this.driveHistory.shift(),this.driveHistory.push(t);let n=0;for(let c=0;c<this.driveHistory.length;c++)n+=this.driveHistory[c];n/=this.driveHistory.length;let r=0;for(let c=0;c<this.driveHistory.length;c++){const u=this.driveHistory[c]-n;r+=u*u}const s=Math.sqrt(r/this.driveHistory.length),o=n+this.config.sensitivity*s,a=this.bands.bass.hit||this.bands.subBass.hit,l=t>o&&t>.25&&a&&e-this.lastBeatAt>180;if(this.metrics.beat=l,l){if(this.lastBeatAt){const c=e-this.lastBeatAt;if(c>250&&c<1500){this.beatTimes.push(c),this.beatTimes.length>16&&this.beatTimes.shift();const u=this.beatTimes.slice().sort((h,p)=>h-p);this.metrics.bpm=Math.round(6e4/u[u.length>>1]),this.synth.bpm=this.metrics.bpm}}this.lastBeatAt=e,this.metrics.beatCount++,this.metrics.beatPulse=1}else this.metrics.beatPulse*=.9}synthesize(e){const t=e/1e3,n=60/this.synth.bpm,r=this.synth.phase;this.synth.phase=t%n/n;const s=this.synth.phase<r,o=Math.pow(1-this.synth.phase,2.4),a=this.synth.seed,l={subBass:.3+o*.62,bass:.26+o*.6+Math.sin(t*.7+a)*.06,lowMid:.24+o*.32+Math.sin(t*1.3+a)*.1,mid:.26+Math.sin(t*2.1+a)*.18+o*.2,highMid:.22+Math.sin(t*3.3+a*1.7)*.17+o*.16,presence:.2+Math.abs(Math.sin(t*4.2+a*2))*.24+o*.14,air:.18+Math.abs(Math.sin(t*5.1+a*2.3))*.28+o*.12};qn.forEach(u=>{const h=this.bands[u.key],p=zt(l[u.key]);h.raw=p,h.level=p,h.norm=p,h.env+=p>h.env?(p-h.env)*this.config.attack:(p-h.env)*this.config.release,h.hit=s&&(u.key==="bass"||u.key==="subBass"),h.onset=Math.max(h.onset*.85,h.hit?1:0)}),this.metrics.bass=this.bands.bass.norm,this.metrics.lowMid=this.bands.lowMid.norm,this.metrics.mid=this.bands.mid.norm,this.metrics.highMid=this.bands.highMid.norm,this.metrics.treble=this.bands.air.norm,this.metrics.level=zt(.25+o*.4),this.metrics.energy=this.metrics.level,this.metrics.flux=o*.8,this.metrics.centroid=.4+Math.sin(t*.3)*.15,this.metrics.spread=.5;for(let u=0;u<it;u++){const h=u/it,p=Math.pow(1-h,1.15),m=.5+.5*Math.sin(t*(1.2+h*5)+u*.5+a),_=zt(p*(.35+.65*m)*(.55+o*.75));this.metrics.bands[u]+=(_-this.metrics.bands[u])*.3,this.metrics.bandsNorm[u]=zt(_/(p+.15)),this.metrics.onsets[u]=Math.max(this.metrics.onsets[u]*.86,s?Math.random()*.7:0),this.metrics.peaks[u]=Math.max(this.metrics.peaks[u]*.965,this.metrics.bands[u])}for(let u=0;u<Pn;u++){const h=u/Pn;this.metrics.wave[u]=Math.sin(h*Math.PI*2*3+t*4)*.4*(.4+o)+Math.sin(h*Math.PI*2*11+t*9)*.16*this.metrics.treble+Math.sin(h*Math.PI*2*27+t*3)*.06}for(let u=0;u<Hi;u++)this.metrics.chroma[u]*=.9;const c=Math.floor((t*.25+a)%12);this.metrics.chroma[c]=Math.min(1,this.metrics.chroma[c]+.3),this.metrics.chromaPeak=c,this.metrics.beat=s,s?(this.metrics.beatCount++,this.metrics.beatPulse=1):this.metrics.beatPulse*=.9,this.metrics.bpm=this.synth.bpm}}const xr={rainbow:null,neon:["#ff005c","#b400ff","#00e5ff","#00ff9d","#ff005c"],vapor:["#ff71ce","#01cdfe","#05ffa1","#b967ff","#ff71ce"],sunset:["#f72585","#ff6d00","#ffba08","#ff2e63","#f72585"],ice:["#03045e","#0077b6","#00b4d8","#caf0f8","#03045e"],magma:["#0b0014","#3b0f70","#8c2981","#de4968","#fe9f6d","#fcfdbf","#0b0014"],ember:["#1a0000","#9d0208","#dc2f02","#f48c06","#ffba08","#1a0000"],forest:["#004b23","#008000","#38b000","#9ef01a","#ccff33","#004b23"],mono:["#101014","#4a4a55","#9a9aa8","#ffffff","#101014"],gold:["#2b1700","#7f4f00","#d4a017","#ffd966","#fff4cc","#2b1700"],oceanic:["#012a4a","#2a6f97","#61a5c2","#a9d6e5","#012a4a"],candy:["#ff9ff3","#feca57","#48dbfb","#1dd1a1","#ff6b6b","#ff9ff3"],aurora:["#011627","#0b7a75","#2ec4b6","#a7f3d0","#7b2ff7","#011627"],prism:["#ff0040","#ff8c00","#ffee00","#00ff66","#00c3ff","#7a00ff","#ff0040"],dusk:["#0d1b2a","#415a77","#a06cd5","#ff8fab","#ffd6a5","#0d1b2a"],toxic:["#020d00","#1b998b","#78ff00","#d0ff14","#f6ff8f","#020d00"],royal:["#10002b","#3c096c","#7b2cbf","#c77dff","#e0aaff","#10002b"],infrared:["#000000","#4a0e4e","#c9184a","#ff4d00","#ffd500","#ffffff","#000000"],album:["#00b4d8","#90e0ef","#0077b6","#00b4d8"]};function Xl(i){const e=parseInt(i.slice(1),16);return{r:(e>>16&255)/255,g:(e>>8&255)/255,b:(e&255)/255}}const Or={};function ql(i,e){return i==="album"&&e?e:(Or[i]||(Or[i]=(xr[i]||xr.neon).map(Xl)),Or[i])}function Br(i,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?i+(e-i)*6*t:t<1/2?e:t<2/3?i+(e-i)*(2/3-t)*6:i}function Yl(i,e,t){i-=Math.floor(i);let n,r,s;{const o=t+e-t*e,a=2*t-o;n=Br(a,o,i+1/3),r=Br(a,o,i),s=Br(a,o,i-1/3)}return{r:n,g:r,b:s}}class $l{name="rainbow";speed=1;albumStops=null;chromaDrive=0;chromaOffset=0;names=Object.keys(xr);set(e){xr[e]!==void 0&&(this.name=e)}get(){return this.name}setSpeed(e){this.speed=e}setChromaDrive(e){this.chromaDrive=Math.max(0,Math.min(1,e))}hasAlbum(){return!!this.albumStops}sample(e){if(e-=Math.floor(e),this.name==="rainbow")return Yl(e,.85,.55);const t=ql(this.name,this.albumStops),n=e*(t.length-1),r=Math.floor(n),s=n-r,o=t[r],a=t[Math.min(t.length-1,r+1)];return{r:o.r+(a.r-o.r)*s,g:o.g+(a.g-o.g)*s,b:o.b+(a.b-o.b)*s}}css(e,t){const n=this.sample(e),r=Math.round(n.r*255),s=Math.round(n.g*255),o=Math.round(n.b*255);return t===void 0?`rgb(${r},${s},${o})`:`rgba(${r},${s},${o},${t})`}hdr(e,t){const n=this.sample(e),r=(t===void 0?4.5:t)*.6;return{r:n.r*r,g:n.g*r,b:n.b*r}}flow(e,t){const n=Date.now()*3e-5*this.speed*(t||1)+(e||0);return this.chromaDrive<=0?n:n*(1-this.chromaDrive)+(this.chromaOffset+(e||0))*this.chromaDrive}updateMusic(e){if(!e)return;let t=e.chromaPeak/12-this.chromaOffset;t>.5?t-=1:t<-.5&&(t+=1),this.chromaOffset=(this.chromaOffset+t*.05+1)%1}fromImage(e){try{const t=document.createElement("canvas"),n=40;t.width=n,t.height=n;const r=t.getContext("2d",{willReadFrequently:!0});r.drawImage(e,0,0,n,n);const s=r.getImageData(0,0,n,n).data,o={};for(let l=0;l<s.length;l+=4){const c=s[l],u=s[l+1],h=s[l+2],p=Math.max(c,u,h),m=Math.min(c,u,h),_=p===0?0:(p-m)/p,g=(c+u+h)/765;if(g<.06||g>.97)continue;const d=(c>>6)+","+(u>>6)+","+(h>>6),f=1+_*3,b=o[d]||(o[d]={r:0,g:0,b:0,w:0});b.r+=c*f,b.g+=u*f,b.b+=h*f,b.w+=f}const a=Object.keys(o).map(l=>o[l]).sort((l,c)=>c.w-l.w).slice(0,5).map(l=>({r:l.r/l.w/255,g:l.g/l.w/255,b:l.b/l.w/255}));return a.length<2?!1:(a.push(a[0]),this.albumStops=a,!0)}catch{return!1}}createLUTTexture(e){const n=new Uint8Array(1024);for(let s=0;s<256;s++){const o=this.sample(s/256);n[s*4]=Math.round(o.r*255),n[s*4+1]=Math.round(o.g*255),n[s*4+2]=Math.round(o.b*255),n[s*4+3]=255}const r=e.createTexture();return e.bindTexture(e.TEXTURE_2D,r),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,256,1,0,e.RGBA,e.UNSIGNED_BYTE,n),r}}function ua(i,e,t){const n=i.createShader(e);if(i.shaderSource(n,t),i.compileShader(n),!i.getShaderParameter(n,i.COMPILE_STATUS))throw new Error(i.getShaderInfoLog(n)||"compile fail");return n}class Qt{constructor(e,t,n){this.gl=e;const r=ua(e,e.VERTEX_SHADER,t),s=ua(e,e.FRAGMENT_SHADER,n);if(this.program=e.createProgram(),e.attachShader(this.program,r),e.attachShader(this.program,s),e.bindAttribLocation(this.program,0,"aPosition"),e.linkProgram(this.program),!e.getProgramParameter(this.program,e.LINK_STATUS))throw new Error(e.getProgramInfoLog(this.program)||"link fail");const o=e.getProgramParameter(this.program,e.ACTIVE_UNIFORMS);for(let a=0;a<o;a++){const l=e.getActiveUniform(this.program,a);this.uniforms[l.name]=e.getUniformLocation(this.program,l.name)}}program;uniforms={};bind(){this.gl.useProgram(this.program)}}const en=`#version 300 es
precision highp float; in vec2 aPosition; out vec2 vUv;
void main(){ vUv=aPosition*0.5+0.5; gl_Position=vec4(aPosition,0.0,1.0); }`,Kl=`#version 300 es
precision highp float; in vec2 vUv; out vec4 fragColor;
uniform sampler2D uTarget; uniform float uAspectRatio; uniform vec3 uColor; uniform vec2 uPoint; uniform float uRadius;
void main(){ vec2 p=vUv-uPoint; p.x*=uAspectRatio; vec3 splat=exp(-dot(p,p)/uRadius)*uColor; vec3 base=texture(uTarget,vUv).xyz; fragColor=vec4(base+splat,1.0); }`,Zl=`#version 300 es
precision highp float; in vec2 vUv; out vec4 fragColor;
uniform sampler2D uVelocity; uniform sampler2D uSource; uniform vec2 uTexelSize; uniform float uDt; uniform float uDissipation;
void main(){ vec2 coord=vUv - uDt*texture(uVelocity,vUv).xy*uTexelSize; fragColor=uDissipation*texture(uSource,coord); }`,jl=`#version 300 es
precision highp float; in vec2 vUv; out vec4 fragColor; uniform sampler2D uVelocity; uniform vec2 uTexelSize;
void main(){ float L=texture(uVelocity,vUv-vec2(uTexelSize.x,0.0)).x; float R=texture(uVelocity,vUv+vec2(uTexelSize.x,0.0)).x; float T=texture(uVelocity,vUv+vec2(0.0,uTexelSize.y)).y; float B=texture(uVelocity,vUv-vec2(0.0,uTexelSize.y)).y; fragColor=vec4(0.5*(R-L+T-B),0.0,0.0,1.0); }`,Jl=`#version 300 es
precision highp float; in vec2 vUv; out vec4 fragColor; uniform sampler2D uVelocity; uniform vec2 uTexelSize;
void main(){ float L=texture(uVelocity,vUv-vec2(uTexelSize.x,0.0)).y; float R=texture(uVelocity,vUv+vec2(uTexelSize.x,0.0)).y; float T=texture(uVelocity,vUv+vec2(0.0,uTexelSize.y)).x; float B=texture(uVelocity,vUv-vec2(0.0,uTexelSize.y)).x; fragColor=vec4(0.5*(R-L-T+B),0.0,0.0,1.0); }`,Ql=`#version 300 es
precision highp float; in vec2 vUv; out vec4 fragColor; uniform sampler2D uVelocity; uniform sampler2D uCurl; uniform vec2 uTexelSize; uniform float uCurlScale; uniform float uDt;
void main(){
 float L=texture(uCurl,vUv-vec2(uTexelSize.x,0.0)).x; float R=texture(uCurl,vUv+vec2(uTexelSize.x,0.0)).x; float T=texture(uCurl,vUv+vec2(0.0,uTexelSize.y)).x; float B=texture(uCurl,vUv-vec2(0.0,uTexelSize.y)).x; float C=texture(uCurl,vUv).x;
 vec2 force=0.5*vec2(abs(T)-abs(B), abs(R)-abs(L)); float l=length(force)+0.00001; force=(force/l)*uCurlScale*C; force.y*=-1.0;
 vec2 vel=texture(uVelocity,vUv).xy; fragColor=vec4(vel+force*uDt,0.0,1.0);
}`,ec=`#version 300 es
precision highp float; in vec2 vUv; out vec4 fragColor; uniform sampler2D uPressure; uniform sampler2D uDivergence; uniform vec2 uTexelSize;
void main(){ float L=texture(uPressure,vUv-vec2(uTexelSize.x,0.0)).x; float R=texture(uPressure,vUv+vec2(uTexelSize.x,0.0)).x; float T=texture(uPressure,vUv+vec2(0.0,uTexelSize.y)).x; float B=texture(uPressure,vUv-vec2(0.0,uTexelSize.y)).x; float div=texture(uDivergence,vUv).x; fragColor=vec4((L+R+B+T-div)*0.25,0.0,0.0,1.0); }`,tc=`#version 300 es
precision highp float; in vec2 vUv; out vec4 fragColor; uniform sampler2D uPressure; uniform sampler2D uVelocity; uniform vec2 uTexelSize;
void main(){ float L=texture(uPressure,vUv-vec2(uTexelSize.x,0.0)).x; float R=texture(uPressure,vUv+vec2(uTexelSize.x,0.0)).x; float T=texture(uPressure,vUv+vec2(0.0,uTexelSize.y)).x; float B=texture(uPressure,vUv-vec2(0.0,uTexelSize.y)).x; vec2 v=texture(uVelocity,vUv).xy; v-=vec2(R-L,T-B)*0.5; fragColor=vec4(v,0.0,1.0); }`,nc=`#version 300 es
precision highp float; in vec2 vUv; out vec4 fragColor; uniform sampler2D uTexture; uniform float uExposure; uniform float uFractal; uniform float uTime; uniform float uAspect;
vec2 fold(vec2 p,float amt,float t){ for(int i=0;i<4;i++){ p=abs(p)-0.42*amt; float a=t*0.05+float(i)*0.7; float c=cos(a), s=sin(a); p=mat2(c,-s,s,c)*p; p*=1.0+0.26*amt; } return p; }
void main(){
 vec2 uv=vUv;
 if(uFractal>0.001){ vec2 p=(vUv-0.5)*vec2(uAspect,1.0); vec2 f=fold(p,uFractal,uTime); uv=mix(vUv, fract(f/vec2(uAspect,1.0)+0.5), uFractal); }
 vec3 c=texture(uTexture,uv).rgb*uExposure; float peak=max(c.r,max(c.g,c.b)); vec3 m=c/(1.0+peak); m=pow(m, vec3(1.0/2.2)); fragColor=vec4(m,1.0);
}`,ic=`#version 300 es
precision highp float; in vec2 vUv; out vec4 fragColor; uniform sampler2D uTexture; uniform float uValue;
void main(){ fragColor=uValue*texture(uTexture,vUv); }`;class rc{canvas;gl=null;useWGSL=!1;config={SIM_RESOLUTION:256,DYE_RESOLUTION:1024,DENSITY_DISSIPATION:.98,VELOCITY_DISSIPATION:.98,PRESSURE_ITERATIONS:20,CURL:30,VISCOSITY:.3,SPLAT_RADIUS:.25,BLOOM:1,SPLAT_BUDGET:26,AUDIO_CURL_GAIN:28,AUDIO_DISS_GAIN:.035,AUDIO_RADIUS_GAIN:.1};quad=null;progs={};density;velocity;pressure;divergence;curl;splatsThisFrame=0;ready=!1;constructor(e){this.canvas=e}init(){return this.gl=this.canvas.getContext("webgl2",{alpha:!1,depth:!1,stencil:!1,antialias:!1}),!this.gl||!this.gl.getExtension("EXT_color_buffer_float")?!1:(navigator.gpu&&(this.useWGSL=!1),this.quad=this.gl.createBuffer(),this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.quad),this.gl.bufferData(this.gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),this.gl.STATIC_DRAW),this.progs.clear=new Qt(this.gl,en,ic),this.progs.splat=new Qt(this.gl,en,Kl),this.progs.advect=new Qt(this.gl,en,Zl),this.progs.divergence=new Qt(this.gl,en,jl),this.progs.curl=new Qt(this.gl,en,Jl),this.progs.vorticity=new Qt(this.gl,en,Ql),this.progs.pressure=new Qt(this.gl,en,ec),this.progs.gradSub=new Qt(this.gl,en,tc),this.progs.display=new Qt(this.gl,en,nc),this.ready=!0,this.resize(),!0)}resize(){if(!this.gl)return;const e=window.MF_MOBILE?1.5:2,t=Math.min(window.devicePixelRatio||1,e),n=this.canvas.clientWidth||window.innerWidth,r=this.canvas.clientHeight||window.innerHeight,s=Math.max(1,Math.floor(n*t)),o=Math.max(1,Math.floor(r*t));(this.canvas.width!==s||this.canvas.height!==o)&&(this.canvas.width=s,this.canvas.height=o,this.initFBOs())}createFBO(e,t,n,r,s,o){const a=this.gl;a.activeTexture(a.TEXTURE0);const l=a.createTexture();a.bindTexture(a.TEXTURE_2D,l),a.texParameteri(a.TEXTURE_2D,a.TEXTURE_MIN_FILTER,o),a.texParameteri(a.TEXTURE_2D,a.TEXTURE_MAG_FILTER,o),a.texParameteri(a.TEXTURE_2D,a.TEXTURE_WRAP_S,a.CLAMP_TO_EDGE),a.texParameteri(a.TEXTURE_2D,a.TEXTURE_WRAP_T,a.CLAMP_TO_EDGE),a.texImage2D(a.TEXTURE_2D,0,n,e,t,0,r,s,null);const c=a.createFramebuffer();return a.bindFramebuffer(a.FRAMEBUFFER,c),a.framebufferTexture2D(a.FRAMEBUFFER,a.COLOR_ATTACHMENT0,a.TEXTURE_2D,l,0),a.viewport(0,0,e,t),a.clear(a.COLOR_BUFFER_BIT),{texture:l,fbo:c,width:e,height:t,attach(u){return a.activeTexture(a.TEXTURE0+u),a.bindTexture(a.TEXTURE_2D,l),u}}}createDoubleFBO(e,t,n,r,s,o){let a=this.createFBO(e,t,n,r,s,o),l=this.createFBO(e,t,n,r,s,o);return{get read(){return a},set read(c){a=c},get write(){return l},set write(c){l=c},swap(){const c=a;a=l,l=c}}}initFBOs(){const e=this.gl,t=e.LINEAR,n=this.canvas.height/this.canvas.width,r=this.config.SIM_RESOLUTION,s=Math.max(1,Math.round(this.config.SIM_RESOLUTION*n)),o=this.config.DYE_RESOLUTION,a=Math.max(1,Math.round(this.config.DYE_RESOLUTION*n));this.density=this.createDoubleFBO(o,a,e.RGBA16F,e.RGBA,e.HALF_FLOAT,t),this.velocity=this.createDoubleFBO(r,s,e.RG16F,e.RG,e.HALF_FLOAT,t),this.pressure=this.createDoubleFBO(r,s,e.R16F,e.RED,e.HALF_FLOAT,e.NEAREST),this.divergence=this.createFBO(r,s,e.R16F,e.RED,e.HALF_FLOAT,e.NEAREST),this.curl=this.createFBO(r,s,e.R16F,e.RED,e.HALF_FLOAT,e.NEAREST)}renderQuad(e){const t=this.gl;t.bindFramebuffer(t.FRAMEBUFFER,e?e.fbo:null),e?t.viewport(0,0,e.width,e.height):t.viewport(0,0,t.drawingBufferWidth,t.drawingBufferHeight),t.bindBuffer(t.ARRAY_BUFFER,this.quad),t.vertexAttribPointer(0,2,t.FLOAT,!1,0,0),t.enableVertexAttribArray(0),t.drawArrays(t.TRIANGLES,0,3)}beginFrame(){this.splatsThisFrame=0}splatsUsed(){return this.splatsThisFrame}splat(e,t,n,r,s,o){if(!this.ready||this.splatsThisFrame>=this.config.SPLAT_BUDGET)return!1;this.splatsThisFrame++;const a=this.progs.splat;a.bind();const l=this.config.SPLAT_RADIUS*(o||1)/100,c=this.gl;return c.uniform1f(a.uniforms.uAspectRatio,this.canvas.width/this.canvas.height),c.uniform2f(a.uniforms.uPoint,e,t),c.uniform1f(a.uniforms.uRadius,l),c.uniform1i(a.uniforms.uTarget,this.velocity.read.attach(0)),c.uniform3f(a.uniforms.uColor,n,r,0),this.renderQuad(this.velocity.write),this.velocity.swap(),c.uniform1i(a.uniforms.uTarget,this.density.read.attach(0)),c.uniform3f(a.uniforms.uColor,s.r,s.g,s.b),this.renderQuad(this.density.write),this.density.swap(),!0}clear(){if(!this.ready)return;const e=this.progs.clear;e.bind(),this.gl.uniform1i(e.uniforms.uTexture,this.density.read.attach(0)),this.gl.uniform1f(e.uniforms.uValue,0),this.renderQuad(this.density.write),this.density.swap(),this.gl.uniform1i(e.uniforms.uTexture,this.velocity.read.attach(0)),this.gl.uniform1f(e.uniforms.uValue,0),this.renderQuad(this.velocity.write),this.velocity.swap()}applyAudioParams(e,t){if(!e)return{vort:this.config.CURL,diss:this.config.DENSITY_DISSIPATION};const n=this.config.CURL+e.band.presence.env*this.config.AUDIO_CURL_GAIN*(t||1),r=Math.max(.88,this.config.DENSITY_DISSIPATION-e.band.mid.env*this.config.AUDIO_DISS_GAIN*(t||1));return{vort:n,diss:r}}solve(e,t,n,r,s){const o=[1/this.velocity.read.width,1/this.velocity.read.height];let a;a=this.progs.curl,a.bind(),this.gl.uniform2f(a.uniforms.uTexelSize,o[0],o[1]),this.gl.uniform1i(a.uniforms.uVelocity,this.velocity.read.attach(0)),this.renderQuad(this.curl),a=this.progs.vorticity,a.bind(),this.gl.uniform2f(a.uniforms.uTexelSize,o[0],o[1]),this.gl.uniform1i(a.uniforms.uVelocity,this.velocity.read.attach(0)),this.gl.uniform1i(a.uniforms.uCurl,this.curl.attach(1)),this.gl.uniform1f(a.uniforms.uCurlScale,t),this.gl.uniform1f(a.uniforms.uDt,e),this.renderQuad(this.velocity.write),this.velocity.swap(),a=this.progs.advect,a.bind(),this.gl.uniform2f(a.uniforms.uTexelSize,o[0],o[1]),this.gl.uniform1i(a.uniforms.uVelocity,this.velocity.read.attach(0)),this.gl.uniform1i(a.uniforms.uSource,this.velocity.read.attach(0)),this.gl.uniform1f(a.uniforms.uDt,e),this.gl.uniform1f(a.uniforms.uDissipation,this.config.VELOCITY_DISSIPATION),this.renderQuad(this.velocity.write),this.velocity.swap(),this.gl.uniform1i(a.uniforms.uVelocity,this.velocity.read.attach(0)),this.gl.uniform1i(a.uniforms.uSource,this.density.read.attach(1)),this.gl.uniform1f(a.uniforms.uDissipation,n),this.renderQuad(this.density.write),this.density.swap(),a=this.progs.divergence,a.bind(),this.gl.uniform2f(a.uniforms.uTexelSize,o[0],o[1]),this.gl.uniform1i(a.uniforms.uVelocity,this.velocity.read.attach(0)),this.renderQuad(this.divergence),a=this.progs.clear,a.bind(),this.gl.uniform1i(a.uniforms.uTexture,this.pressure.read.attach(0)),this.gl.uniform1f(a.uniforms.uValue,this.config.VISCOSITY),this.renderQuad(this.pressure.write),this.pressure.swap(),a=this.progs.pressure,a.bind(),this.gl.uniform2f(a.uniforms.uTexelSize,o[0],o[1]),this.gl.uniform1i(a.uniforms.uDivergence,this.divergence.attach(0));for(let l=0;l<this.config.PRESSURE_ITERATIONS;l++)this.gl.uniform1i(a.uniforms.uPressure,this.pressure.read.attach(1)),this.renderQuad(this.pressure.write),this.pressure.swap();a=this.progs.gradSub,a.bind(),this.gl.uniform2f(a.uniforms.uTexelSize,o[0],o[1]),this.gl.uniform1i(a.uniforms.uPressure,this.pressure.read.attach(0)),this.gl.uniform1i(a.uniforms.uVelocity,this.velocity.read.attach(1)),this.renderQuad(this.velocity.write),this.velocity.swap(),a=this.progs.display,a.bind(),this.gl.uniform1i(a.uniforms.uTexture,this.density.read.attach(0)),this.gl.uniform1f(a.uniforms.uExposure,this.config.BLOOM),this.gl.uniform1f(a.uniforms.uFractal,r||0),this.gl.uniform1f(a.uniforms.uTime,(s||0)*.001),this.gl.uniform1f(a.uniforms.uAspect,this.canvas.width/this.canvas.height),this.renderQuad(null)}isReady(){return this.ready}}const sc=`#version 300 es
precision highp float; in vec2 aPosition; void main(){ gl_Position=vec4(aPosition,0.0,1.0); }`,ac=`#version 300 es
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
`,oc={julia:`
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
  }`},lc=`
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
}`;class cc{gl=null;canvas;quad=null;palTex=null;ready=!1;programs={};palette;slowBand=new Float32Array(7);fluxBand=new Float32Array(7);onsetBand=new Float32Array(7);slowEnergy=0;fluxEnergy=0;slowCentroid=0;fluxCentroid=0;morph=0;morphRate=0;flyThrough=!1;flySpeed=.04;flyPhase=0;flyOffset={x:0,y:0};seedAngle=0;seedTime=null;seed={x:.7,y:0};constructor(e,t){this.canvas=e,this.palette=t}init(){return this.gl=this.canvas.getContext("webgl2",{alpha:!1}),this.gl?(this.quad=this.gl.createBuffer(),this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.quad),this.gl.bufferData(this.gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),this.gl.STATIC_DRAW),this.palTex=this.gl.createTexture(),this.updatePalette(),this.ready=!0,this.resize(),!0):!1}resize(){if(!this.gl)return;const e=Math.min(window.devicePixelRatio||1,window.MF_MOBILE?1.5:2),t=Math.max(1,Math.floor((this.canvas.clientWidth||window.innerWidth)*e)),n=Math.max(1,Math.floor((this.canvas.clientHeight||window.innerHeight)*e));(this.canvas.width!==t||this.canvas.height!==n)&&(this.canvas.width=t,this.canvas.height=n)}updatePalette(){if(!this.gl||!this.palTex)return;const e=this.gl,t=256,n=new Uint8Array(t*4);for(let r=0;r<t;r++){const s=this.palette.sample(r/t);n[r*4]=Math.round(s.r*255),n[r*4+1]=Math.round(s.g*255),n[r*4+2]=Math.round(s.b*255),n[r*4+3]=255}e.bindTexture(e.TEXTURE_2D,this.palTex),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,t,1,0,e.RGBA,e.UNSIGNED_BYTE,n)}getProgram(e){if(this.programs[e]!==void 0)return this.programs[e];const t=oc[e];if(!t)return this.programs[e]=null,null;const n=this.gl.createShader(this.gl.VERTEX_SHADER);this.gl.shaderSource(n,sc),this.gl.compileShader(n);const r=ac+`
`+t+`
`+lc,s=this.gl.createShader(this.gl.FRAGMENT_SHADER);if(this.gl.shaderSource(s,r),this.gl.compileShader(s),!this.gl.getShaderParameter(s,this.gl.COMPILE_STATUS))return console.error(this.gl.getShaderInfoLog(s)),this.programs[e]=null,null;const o=this.gl.createProgram();if(this.gl.attachShader(o,n),this.gl.attachShader(o,s),this.gl.bindAttribLocation(o,0,"aPosition"),this.gl.linkProgram(o),!this.gl.getProgramParameter(o,this.gl.LINK_STATUS))return console.error(this.gl.getProgramInfoLog(o)),this.programs[e]=null,null;const a={},l=this.gl.getProgramParameter(o,this.gl.ACTIVE_UNIFORMS);for(let u=0;u<l;u++){const h=this.gl.getActiveUniform(o,u);a[h.name]=this.gl.getUniformLocation(o,h.name)}const c={prog:o,u:a};return this.programs[e]=c,c}updateAudio(e,t){if(e){for(let n=0;n<7;n++){const r=e.band[Object.keys(e.band)[n]];r&&(this.slowBand[n]+=(r.norm-this.slowBand[n])*.004,this.fluxBand[n]+=(r.norm-this.fluxBand[n])*.18,this.onsetBand[n]=Math.max(this.onsetBand[n]*.88,r.onset))}this.slowEnergy+=(e.energy-this.slowEnergy)*.004,this.fluxEnergy+=(e.energy-this.fluxEnergy)*.18,this.slowCentroid+=(e.centroid-this.slowCentroid)*.004,this.fluxCentroid+=(e.centroid-this.fluxCentroid)*.12,this.flyThrough&&e&&(this.flyPhase+=.016*this.flySpeed*(.6+e.energy*1.2),this.flyOffset.x+=Math.cos(this.flyPhase)*8e-4*(.5+this.slowBand[2]),this.flyOffset.y+=Math.sin(this.flyPhase*1.3)*6e-4*(.5+this.slowBand[0])),this.morphRate!==0&&(this.morph=.5+.5*Math.sin(performance.now()*3e-4*this.morphRate+this.slowCentroid*6.283))}}juliaSeed(e,t,n){if(this.updateAudio(t,n??e),e===this.seedTime)return this.seed;const r=this.seedTime===null?0:Math.min(Math.max(e-this.seedTime,0),1e3);this.seedTime=e;const s=.7+this.slowBand[1]*.16+this.slowBand[0]*.07+this.morph*.15,o=this.slowCentroid*3+this.slowBand[3]*1.2+this.morph*.8;this.seedAngle+=.022*(r/1e3)*(1+this.slowBand[4]*.5);const a=this.seedAngle+o;return this.seed.x=Math.cos(a)*s,this.seed.y=Math.sin(a)*s,this.seed}render(e,t,n,r){if(!this.ready)return!1;const s=this.getProgram(e.shader||"julia");if(!s)return!1;const o=this.gl,a=s.u;this.updatePalette(),this.updateAudio(t,r.stamp??r.time),o.useProgram(s.prog),o.viewport(0,0,this.canvas.width,this.canvas.height),o.uniform2f(a.uRes,this.canvas.width,this.canvas.height),o.uniform1f(a.uTime,(r.time||0)*.001),o.uniform2f(a.uMouse,n.x,n.y),o.uniform1f(a.uMouseDown,n.down?1:0),o.uniform1f(a.uInteract,r.interact??1);const l=r.events||[];for(let c=0;c<2;c++){const u=l[c],h=c===0?a.uEvtA:a.uEvtB;u&&u.kind>0&&u.age>=0&&u.age<6?o.uniform4f(h,u.x,u.y,u.age,u.kind):o.uniform4f(h,0,0,0,0)}o.uniform1f(a.uWall,(r.wall||0)*.001),o.uniform1f(a.uRole,r.role??1),o.uniform1f(a.uKey,r.key?1:0),o.uniform1f(a.uHover,r.hover??1),o.uniform1f(a.uBg,r.bg||0),o.uniform1f(a.uBgAmt,r.bgAmt??1),o.uniform2f(a.uSeed,this.seed.x,this.seed.y),o.uniform1f(a.uEnergy,this.slowEnergy),o.uniform1f(a.uEnergyFast,this.fluxEnergy),o.uniform1f(a.uCentroid,this.fluxCentroid),o.uniform1f(a.uBeat,t.beatPulse),o.uniform1f(a.uDetail,r.detail??.6),o.uniform1f(a.uZoom,r.zoom??1),o.uniform2f(a.uPan,r.pan?.x||0,r.pan?.y||0),o.uniform1f(a.uContrast,r.contrast??1),o.uniform1f(a.uPalShift,this.palette.flow(0,e.palSpeed??.01)%1),o.uniform1f(a.uMorph,this.morph),o.uniform1f(a.uFly,this.flyThrough?1:0);for(let c=0;c<7;c++)o.uniform1f(a["uBand["+c+"]"],this.slowBand[c]),o.uniform1f(a["uFlux["+c+"]"],this.fluxBand[c]),o.uniform1f(a["uOnset["+c+"]"],this.onsetBand[c]);return o.activeTexture(o.TEXTURE0),o.bindTexture(o.TEXTURE_2D,this.palTex),o.uniform1i(a.uPal,0),o.bindBuffer(o.ARRAY_BUFFER,this.quad),o.vertexAttribPointer(0,2,o.FLOAT,!1,0,0),o.enableVertexAttribArray(0),o.drawArrays(o.TRIANGLES,0,3),!0}setMorph(e){this.morph=Math.max(0,Math.min(1,e))}setMorphRate(e){this.morphRate=e}setFlyThrough(e,t){this.flyThrough=!!e,t!==void 0&&(this.flySpeed=t),e||(this.flyOffset.x=0,this.flyOffset.y=0)}isFlyThrough(){return this.flyThrough}}/**
 * @license
 * Copyright 2010-2023 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const Os="162",uc=0,ha=1,hc=2,ko=1,dc=2,on=3,Tn=0,wt=1,Xt=2,Sn=0,fi=1,ys=2,da=3,fa=4,fc=5,zn=100,pc=101,mc=102,pa=103,ma=104,gc=200,_c=201,vc=202,xc=203,Es=204,bs=205,Mc=206,Sc=207,yc=208,Ec=209,bc=210,Tc=211,Ac=212,wc=213,Rc=214,Cc=0,Pc=1,Lc=2,Mr=3,Dc=4,Uc=5,Ic=6,Nc=7,Vo=0,Fc=1,Oc=2,yn=0,Bc=1,zc=2,Gc=3,Hc=4,kc=5,Vc=6,Wc=7,Wo=300,gi=301,_i=302,Ts=303,As=304,Rr=306,ws=1e3,qt=1001,Rs=1002,yt=1003,ga=1004,Ti=1005,Tt=1006,zr=1007,Hn=1008,En=1009,Xc=1010,qc=1011,Bs=1012,Xo=1013,Mn=1014,ln=1015,Di=1016,qo=1017,Yo=1018,Vn=1020,Yc=1021,Yt=1023,$c=1024,Kc=1025,Wn=1026,vi=1027,Zc=1028,$o=1029,jc=1030,Ko=1031,Zo=1033,Gr=33776,Hr=33777,kr=33778,Vr=33779,_a=35840,va=35841,xa=35842,Ma=35843,jo=36196,Sa=37492,ya=37496,Ea=37808,ba=37809,Ta=37810,Aa=37811,wa=37812,Ra=37813,Ca=37814,Pa=37815,La=37816,Da=37817,Ua=37818,Ia=37819,Na=37820,Fa=37821,Wr=36492,Oa=36494,Ba=36495,Jc=36283,za=36284,Ga=36285,Ha=36286,Qc=3200,eu=3201,tu=0,nu=1,xn="",Zt="srgb",wn="srgb-linear",zs="display-p3",Cr="display-p3-linear",Sr="linear",je="srgb",yr="rec709",Er="p3",$n=7680,ka=519,iu=512,ru=513,su=514,Jo=515,au=516,ou=517,lu=518,cu=519,Va=35044,Wa="300 es",Cs=1035,un=2e3,br=2001;class Mi{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){if(this._listeners===void 0)return!1;const n=this._listeners;return n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){if(this._listeners===void 0)return;const r=this._listeners[e];if(r!==void 0){const s=r.indexOf(t);s!==-1&&r.splice(s,1)}}dispatchEvent(e){if(this._listeners===void 0)return;const n=this._listeners[e.type];if(n!==void 0){e.target=this;const r=n.slice(0);for(let s=0,o=r.length;s<o;s++)r[s].call(this,e);e.target=null}}}const _t=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],gr=Math.PI/180,Ps=180/Math.PI;function Ii(){const i=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(_t[i&255]+_t[i>>8&255]+_t[i>>16&255]+_t[i>>24&255]+"-"+_t[e&255]+_t[e>>8&255]+"-"+_t[e>>16&15|64]+_t[e>>24&255]+"-"+_t[t&63|128]+_t[t>>8&255]+"-"+_t[t>>16&255]+_t[t>>24&255]+_t[n&255]+_t[n>>8&255]+_t[n>>16&255]+_t[n>>24&255]).toLowerCase()}function At(i,e,t){return Math.max(e,Math.min(t,i))}function uu(i,e){return(i%e+e)%e}function Xr(i,e,t){return(1-t)*i+t*e}function Xa(i){return(i&i-1)===0&&i!==0}function Ls(i){return Math.pow(2,Math.floor(Math.log(i)/Math.LN2))}function Ai(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("Invalid component type.")}}function bt(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("Invalid component type.")}}class Ve{constructor(e=0,t=0){Ve.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,n=this.y,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6],this.y=r[1]*t+r[4]*n+r[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(At(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const n=Math.cos(t),r=Math.sin(t),s=this.x-e.x,o=this.y-e.y;return this.x=s*n-o*r+e.x,this.y=s*r+o*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class Ie{constructor(e,t,n,r,s,o,a,l,c){Ie.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,r,s,o,a,l,c)}set(e,t,n,r,s,o,a,l,c){const u=this.elements;return u[0]=e,u[1]=r,u[2]=a,u[3]=t,u[4]=s,u[5]=l,u[6]=n,u[7]=o,u[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,r=t.elements,s=this.elements,o=n[0],a=n[3],l=n[6],c=n[1],u=n[4],h=n[7],p=n[2],m=n[5],_=n[8],g=r[0],d=r[3],f=r[6],b=r[1],M=r[4],y=r[7],P=r[2],w=r[5],A=r[8];return s[0]=o*g+a*b+l*P,s[3]=o*d+a*M+l*w,s[6]=o*f+a*y+l*A,s[1]=c*g+u*b+h*P,s[4]=c*d+u*M+h*w,s[7]=c*f+u*y+h*A,s[2]=p*g+m*b+_*P,s[5]=p*d+m*M+_*w,s[8]=p*f+m*y+_*A,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[1],r=e[2],s=e[3],o=e[4],a=e[5],l=e[6],c=e[7],u=e[8];return t*o*u-t*a*c-n*s*u+n*a*l+r*s*c-r*o*l}invert(){const e=this.elements,t=e[0],n=e[1],r=e[2],s=e[3],o=e[4],a=e[5],l=e[6],c=e[7],u=e[8],h=u*o-a*c,p=a*l-u*s,m=c*s-o*l,_=t*h+n*p+r*m;if(_===0)return this.set(0,0,0,0,0,0,0,0,0);const g=1/_;return e[0]=h*g,e[1]=(r*c-u*n)*g,e[2]=(a*n-r*o)*g,e[3]=p*g,e[4]=(u*t-r*l)*g,e[5]=(r*s-a*t)*g,e[6]=m*g,e[7]=(n*l-c*t)*g,e[8]=(o*t-n*s)*g,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,r,s,o,a){const l=Math.cos(s),c=Math.sin(s);return this.set(n*l,n*c,-n*(l*o+c*a)+o+e,-r*c,r*l,-r*(-c*o+l*a)+a+t,0,0,1),this}scale(e,t){return this.premultiply(qr.makeScale(e,t)),this}rotate(e){return this.premultiply(qr.makeRotation(-e)),this}translate(e,t){return this.premultiply(qr.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,n=e.elements;for(let r=0;r<9;r++)if(t[r]!==n[r])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}}const qr=new Ie;function Qo(i){for(let e=i.length-1;e>=0;--e)if(i[e]>=65535)return!0;return!1}function Tr(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function hu(){const i=Tr("canvas");return i.style.display="block",i}const qa={};function du(i){i in qa||(qa[i]=!0,console.warn(i))}const Ya=new Ie().set(.8224621,.177538,0,.0331941,.9668058,0,.0170827,.0723974,.9105199),$a=new Ie().set(1.2249401,-.2249404,0,-.0420569,1.0420571,0,-.0196376,-.0786361,1.0982735),Vi={[wn]:{transfer:Sr,primaries:yr,toReference:i=>i,fromReference:i=>i},[Zt]:{transfer:je,primaries:yr,toReference:i=>i.convertSRGBToLinear(),fromReference:i=>i.convertLinearToSRGB()},[Cr]:{transfer:Sr,primaries:Er,toReference:i=>i.applyMatrix3($a),fromReference:i=>i.applyMatrix3(Ya)},[zs]:{transfer:je,primaries:Er,toReference:i=>i.convertSRGBToLinear().applyMatrix3($a),fromReference:i=>i.applyMatrix3(Ya).convertLinearToSRGB()}},fu=new Set([wn,Cr]),$e={enabled:!0,_workingColorSpace:wn,get workingColorSpace(){return this._workingColorSpace},set workingColorSpace(i){if(!fu.has(i))throw new Error(`Unsupported working color space, "${i}".`);this._workingColorSpace=i},convert:function(i,e,t){if(this.enabled===!1||e===t||!e||!t)return i;const n=Vi[e].toReference,r=Vi[t].fromReference;return r(n(i))},fromWorkingColorSpace:function(i,e){return this.convert(i,this._workingColorSpace,e)},toWorkingColorSpace:function(i,e){return this.convert(i,e,this._workingColorSpace)},getPrimaries:function(i){return Vi[i].primaries},getTransfer:function(i){return i===xn?Sr:Vi[i].transfer}};function pi(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function Yr(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}let Kn;class el{static getDataURL(e){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let t;if(e instanceof HTMLCanvasElement)t=e;else{Kn===void 0&&(Kn=Tr("canvas")),Kn.width=e.width,Kn.height=e.height;const n=Kn.getContext("2d");e instanceof ImageData?n.putImageData(e,0,0):n.drawImage(e,0,0,e.width,e.height),t=Kn}return t.width>2048||t.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",e),t.toDataURL("image/jpeg",.6)):t.toDataURL("image/png")}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=Tr("canvas");t.width=e.width,t.height=e.height;const n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);const r=n.getImageData(0,0,e.width,e.height),s=r.data;for(let o=0;o<s.length;o++)s[o]=pi(s[o]/255)*255;return n.putImageData(r,0,0),t}else if(e.data){const t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(pi(t[n]/255)*255):t[n]=pi(t[n]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let pu=0;class tl{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:pu++}),this.uuid=Ii(),this.data=e,this.dataReady=!0,this.version=0}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const n={uuid:this.uuid,url:""},r=this.data;if(r!==null){let s;if(Array.isArray(r)){s=[];for(let o=0,a=r.length;o<a;o++)r[o].isDataTexture?s.push($r(r[o].image)):s.push($r(r[o]))}else s=$r(r);n.url=s}return t||(e.images[this.uuid]=n),n}}function $r(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?el.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let mu=0;class Rt extends Mi{constructor(e=Rt.DEFAULT_IMAGE,t=Rt.DEFAULT_MAPPING,n=qt,r=qt,s=Tt,o=Hn,a=Yt,l=En,c=Rt.DEFAULT_ANISOTROPY,u=xn){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:mu++}),this.uuid=Ii(),this.name="",this.source=new tl(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=r,this.magFilter=s,this.minFilter=o,this.anisotropy=c,this.format=a,this.internalFormat=null,this.type=l,this.offset=new Ve(0,0),this.repeat=new Ve(1,1),this.center=new Ve(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Ie,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.needsPMREMUpdate=!1}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const n={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==Wo)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case ws:e.x=e.x-Math.floor(e.x);break;case qt:e.x=e.x<0?0:1;break;case Rs:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case ws:e.y=e.y-Math.floor(e.y);break;case qt:e.y=e.y<0?0:1;break;case Rs:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}}Rt.DEFAULT_IMAGE=null;Rt.DEFAULT_MAPPING=Wo;Rt.DEFAULT_ANISOTROPY=1;class mt{constructor(e=0,t=0,n=0,r=1){mt.prototype.isVector4=!0,this.x=e,this.y=t,this.z=n,this.w=r}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,r){return this.x=e,this.y=t,this.z=n,this.w=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,n=this.y,r=this.z,s=this.w,o=e.elements;return this.x=o[0]*t+o[4]*n+o[8]*r+o[12]*s,this.y=o[1]*t+o[5]*n+o[9]*r+o[13]*s,this.z=o[2]*t+o[6]*n+o[10]*r+o[14]*s,this.w=o[3]*t+o[7]*n+o[11]*r+o[15]*s,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,r,s;const l=e.elements,c=l[0],u=l[4],h=l[8],p=l[1],m=l[5],_=l[9],g=l[2],d=l[6],f=l[10];if(Math.abs(u-p)<.01&&Math.abs(h-g)<.01&&Math.abs(_-d)<.01){if(Math.abs(u+p)<.1&&Math.abs(h+g)<.1&&Math.abs(_+d)<.1&&Math.abs(c+m+f-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const M=(c+1)/2,y=(m+1)/2,P=(f+1)/2,w=(u+p)/4,A=(h+g)/4,I=(_+d)/4;return M>y&&M>P?M<.01?(n=0,r=.707106781,s=.707106781):(n=Math.sqrt(M),r=w/n,s=A/n):y>P?y<.01?(n=.707106781,r=0,s=.707106781):(r=Math.sqrt(y),n=w/r,s=I/r):P<.01?(n=.707106781,r=.707106781,s=0):(s=Math.sqrt(P),n=A/s,r=I/s),this.set(n,r,s,t),this}let b=Math.sqrt((d-_)*(d-_)+(h-g)*(h-g)+(p-u)*(p-u));return Math.abs(b)<.001&&(b=1),this.x=(d-_)/b,this.y=(h-g)/b,this.z=(p-u)/b,this.w=Math.acos((c+m+f-1)/2),this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this.w=Math.max(e.w,Math.min(t.w,this.w)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this.w=Math.max(e,Math.min(t,this.w)),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class gu extends Mi{constructor(e=1,t=1,n={}){super(),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=1,this.scissor=new mt(0,0,e,t),this.scissorTest=!1,this.viewport=new mt(0,0,e,t);const r={width:e,height:t,depth:1};n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Tt,depthBuffer:!0,stencilBuffer:!1,depthTexture:null,samples:0,count:1},n);const s=new Rt(r,n.mapping,n.wrapS,n.wrapT,n.magFilter,n.minFilter,n.format,n.type,n.anisotropy,n.colorSpace);s.flipY=!1,s.generateMipmaps=n.generateMipmaps,s.internalFormat=n.internalFormat,this.textures=[];const o=n.count;for(let a=0;a<o;a++)this.textures[a]=s.clone(),this.textures[a].isRenderTargetTexture=!0;this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.depthTexture=n.depthTexture,this.samples=n.samples}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let r=0,s=this.textures.length;r<s;r++)this.textures[r].image.width=e,this.textures[r].image.height=t,this.textures[r].image.depth=n;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let n=0,r=e.textures.length;n<r;n++)this.textures[n]=e.textures[n].clone(),this.textures[n].isRenderTargetTexture=!0;const t=Object.assign({},e.texture.image);return this.texture.source=new tl(t),this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class Xn extends gu{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}}class nl extends Rt{constructor(e=null,t=1,n=1,r=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:r},this.magFilter=yt,this.minFilter=yt,this.wrapR=qt,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class _u extends Rt{constructor(e=null,t=1,n=1,r=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:r},this.magFilter=yt,this.minFilter=yt,this.wrapR=qt,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Ni{constructor(e=0,t=0,n=0,r=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=r}static slerpFlat(e,t,n,r,s,o,a){let l=n[r+0],c=n[r+1],u=n[r+2],h=n[r+3];const p=s[o+0],m=s[o+1],_=s[o+2],g=s[o+3];if(a===0){e[t+0]=l,e[t+1]=c,e[t+2]=u,e[t+3]=h;return}if(a===1){e[t+0]=p,e[t+1]=m,e[t+2]=_,e[t+3]=g;return}if(h!==g||l!==p||c!==m||u!==_){let d=1-a;const f=l*p+c*m+u*_+h*g,b=f>=0?1:-1,M=1-f*f;if(M>Number.EPSILON){const P=Math.sqrt(M),w=Math.atan2(P,f*b);d=Math.sin(d*w)/P,a=Math.sin(a*w)/P}const y=a*b;if(l=l*d+p*y,c=c*d+m*y,u=u*d+_*y,h=h*d+g*y,d===1-a){const P=1/Math.sqrt(l*l+c*c+u*u+h*h);l*=P,c*=P,u*=P,h*=P}}e[t]=l,e[t+1]=c,e[t+2]=u,e[t+3]=h}static multiplyQuaternionsFlat(e,t,n,r,s,o){const a=n[r],l=n[r+1],c=n[r+2],u=n[r+3],h=s[o],p=s[o+1],m=s[o+2],_=s[o+3];return e[t]=a*_+u*h+l*m-c*p,e[t+1]=l*_+u*p+c*h-a*m,e[t+2]=c*_+u*m+a*p-l*h,e[t+3]=u*_-a*h-l*p-c*m,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,r){return this._x=e,this._y=t,this._z=n,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const n=e._x,r=e._y,s=e._z,o=e._order,a=Math.cos,l=Math.sin,c=a(n/2),u=a(r/2),h=a(s/2),p=l(n/2),m=l(r/2),_=l(s/2);switch(o){case"XYZ":this._x=p*u*h+c*m*_,this._y=c*m*h-p*u*_,this._z=c*u*_+p*m*h,this._w=c*u*h-p*m*_;break;case"YXZ":this._x=p*u*h+c*m*_,this._y=c*m*h-p*u*_,this._z=c*u*_-p*m*h,this._w=c*u*h+p*m*_;break;case"ZXY":this._x=p*u*h-c*m*_,this._y=c*m*h+p*u*_,this._z=c*u*_+p*m*h,this._w=c*u*h-p*m*_;break;case"ZYX":this._x=p*u*h-c*m*_,this._y=c*m*h+p*u*_,this._z=c*u*_-p*m*h,this._w=c*u*h+p*m*_;break;case"YZX":this._x=p*u*h+c*m*_,this._y=c*m*h+p*u*_,this._z=c*u*_-p*m*h,this._w=c*u*h-p*m*_;break;case"XZY":this._x=p*u*h-c*m*_,this._y=c*m*h-p*u*_,this._z=c*u*_+p*m*h,this._w=c*u*h+p*m*_;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+o)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const n=t/2,r=Math.sin(n);return this._x=e.x*r,this._y=e.y*r,this._z=e.z*r,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,n=t[0],r=t[4],s=t[8],o=t[1],a=t[5],l=t[9],c=t[2],u=t[6],h=t[10],p=n+a+h;if(p>0){const m=.5/Math.sqrt(p+1);this._w=.25/m,this._x=(u-l)*m,this._y=(s-c)*m,this._z=(o-r)*m}else if(n>a&&n>h){const m=2*Math.sqrt(1+n-a-h);this._w=(u-l)/m,this._x=.25*m,this._y=(r+o)/m,this._z=(s+c)/m}else if(a>h){const m=2*Math.sqrt(1+a-n-h);this._w=(s-c)/m,this._x=(r+o)/m,this._y=.25*m,this._z=(l+u)/m}else{const m=2*Math.sqrt(1+h-n-a);this._w=(o-r)/m,this._x=(s+c)/m,this._y=(l+u)/m,this._z=.25*m}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<Number.EPSILON?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(At(this.dot(e),-1,1)))}rotateTowards(e,t){const n=this.angleTo(e);if(n===0)return this;const r=Math.min(1,t/n);return this.slerp(e,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const n=e._x,r=e._y,s=e._z,o=e._w,a=t._x,l=t._y,c=t._z,u=t._w;return this._x=n*u+o*a+r*c-s*l,this._y=r*u+o*l+s*a-n*c,this._z=s*u+o*c+n*l-r*a,this._w=o*u-n*a-r*l-s*c,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);const n=this._x,r=this._y,s=this._z,o=this._w;let a=o*e._w+n*e._x+r*e._y+s*e._z;if(a<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,a=-a):this.copy(e),a>=1)return this._w=o,this._x=n,this._y=r,this._z=s,this;const l=1-a*a;if(l<=Number.EPSILON){const m=1-t;return this._w=m*o+t*this._w,this._x=m*n+t*this._x,this._y=m*r+t*this._y,this._z=m*s+t*this._z,this.normalize(),this}const c=Math.sqrt(l),u=Math.atan2(c,a),h=Math.sin((1-t)*u)/c,p=Math.sin(t*u)/c;return this._w=o*h+this._w*p,this._x=n*h+this._x*p,this._y=r*h+this._y*p,this._z=s*h+this._z*p,this._onChangeCallback(),this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),r=Math.sqrt(1-n),s=Math.sqrt(n);return this.set(r*Math.sin(e),r*Math.cos(e),s*Math.sin(t),s*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class U{constructor(e=0,t=0,n=0){U.prototype.isVector3=!0,this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Ka.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Ka.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,n=this.y,r=this.z,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6]*r,this.y=s[1]*t+s[4]*n+s[7]*r,this.z=s[2]*t+s[5]*n+s[8]*r,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,n=this.y,r=this.z,s=e.elements,o=1/(s[3]*t+s[7]*n+s[11]*r+s[15]);return this.x=(s[0]*t+s[4]*n+s[8]*r+s[12])*o,this.y=(s[1]*t+s[5]*n+s[9]*r+s[13])*o,this.z=(s[2]*t+s[6]*n+s[10]*r+s[14])*o,this}applyQuaternion(e){const t=this.x,n=this.y,r=this.z,s=e.x,o=e.y,a=e.z,l=e.w,c=2*(o*r-a*n),u=2*(a*t-s*r),h=2*(s*n-o*t);return this.x=t+l*c+o*h-a*u,this.y=n+l*u+a*c-s*h,this.z=r+l*h+s*u-o*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,n=this.y,r=this.z,s=e.elements;return this.x=s[0]*t+s[4]*n+s[8]*r,this.y=s[1]*t+s[5]*n+s[9]*r,this.z=s[2]*t+s[6]*n+s[10]*r,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const n=e.x,r=e.y,s=e.z,o=t.x,a=t.y,l=t.z;return this.x=r*l-s*a,this.y=s*o-n*l,this.z=n*a-r*o,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return Kr.copy(this).projectOnVector(e),this.sub(Kr)}reflect(e){return this.sub(Kr.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(At(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y,r=this.z-e.z;return t*t+n*n+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){const r=Math.sin(t)*e;return this.x=r*Math.sin(n),this.y=Math.cos(t)*e,this.z=r*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),r=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=r,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const Kr=new U,Ka=new Ni;class Fi{constructor(e=new U(1/0,1/0,1/0),t=new U(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(Ht.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(Ht.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const n=Ht.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const n=e.geometry;if(n!==void 0){const s=n.getAttribute("position");if(t===!0&&s!==void 0&&e.isInstancedMesh!==!0)for(let o=0,a=s.count;o<a;o++)e.isMesh===!0?e.getVertexPosition(o,Ht):Ht.fromBufferAttribute(s,o),Ht.applyMatrix4(e.matrixWorld),this.expandByPoint(Ht);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),Wi.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),Wi.copy(n.boundingBox)),Wi.applyMatrix4(e.matrixWorld),this.union(Wi)}const r=e.children;for(let s=0,o=r.length;s<o;s++)this.expandByObject(r[s],t);return this}containsPoint(e){return!(e.x<this.min.x||e.x>this.max.x||e.y<this.min.y||e.y>this.max.y||e.z<this.min.z||e.z>this.max.z)}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return!(e.max.x<this.min.x||e.min.x>this.max.x||e.max.y<this.min.y||e.min.y>this.max.y||e.max.z<this.min.z||e.min.z>this.max.z)}intersectsSphere(e){return this.clampPoint(e.center,Ht),Ht.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(wi),Xi.subVectors(this.max,wi),Zn.subVectors(e.a,wi),jn.subVectors(e.b,wi),Jn.subVectors(e.c,wi),fn.subVectors(jn,Zn),pn.subVectors(Jn,jn),Ln.subVectors(Zn,Jn);let t=[0,-fn.z,fn.y,0,-pn.z,pn.y,0,-Ln.z,Ln.y,fn.z,0,-fn.x,pn.z,0,-pn.x,Ln.z,0,-Ln.x,-fn.y,fn.x,0,-pn.y,pn.x,0,-Ln.y,Ln.x,0];return!Zr(t,Zn,jn,Jn,Xi)||(t=[1,0,0,0,1,0,0,0,1],!Zr(t,Zn,jn,Jn,Xi))?!1:(qi.crossVectors(fn,pn),t=[qi.x,qi.y,qi.z],Zr(t,Zn,jn,Jn,Xi))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Ht).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Ht).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(tn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),tn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),tn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),tn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),tn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),tn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),tn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),tn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(tn),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}}const tn=[new U,new U,new U,new U,new U,new U,new U,new U],Ht=new U,Wi=new Fi,Zn=new U,jn=new U,Jn=new U,fn=new U,pn=new U,Ln=new U,wi=new U,Xi=new U,qi=new U,Dn=new U;function Zr(i,e,t,n,r){for(let s=0,o=i.length-3;s<=o;s+=3){Dn.fromArray(i,s);const a=r.x*Math.abs(Dn.x)+r.y*Math.abs(Dn.y)+r.z*Math.abs(Dn.z),l=e.dot(Dn),c=t.dot(Dn),u=n.dot(Dn);if(Math.max(-Math.max(l,c,u),Math.min(l,c,u))>a)return!1}return!0}const vu=new Fi,Ri=new U,jr=new U;class Oi{constructor(e=new U,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const n=this.center;t!==void 0?n.copy(t):vu.setFromPoints(e).getCenter(n);let r=0;for(let s=0,o=e.length;s<o;s++)r=Math.max(r,n.distanceToSquared(e[s]));return this.radius=Math.sqrt(r),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Ri.subVectors(e,this.center);const t=Ri.lengthSq();if(t>this.radius*this.radius){const n=Math.sqrt(t),r=(n-this.radius)*.5;this.center.addScaledVector(Ri,r/n),this.radius+=r}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(jr.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Ri.copy(e.center).add(jr)),this.expandByPoint(Ri.copy(e.center).sub(jr))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}}const nn=new U,Jr=new U,Yi=new U,mn=new U,Qr=new U,$i=new U,es=new U;class Gs{constructor(e=new U,t=new U(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,nn)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=nn.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(nn.copy(this.origin).addScaledVector(this.direction,t),nn.distanceToSquared(e))}distanceSqToSegment(e,t,n,r){Jr.copy(e).add(t).multiplyScalar(.5),Yi.copy(t).sub(e).normalize(),mn.copy(this.origin).sub(Jr);const s=e.distanceTo(t)*.5,o=-this.direction.dot(Yi),a=mn.dot(this.direction),l=-mn.dot(Yi),c=mn.lengthSq(),u=Math.abs(1-o*o);let h,p,m,_;if(u>0)if(h=o*l-a,p=o*a-l,_=s*u,h>=0)if(p>=-_)if(p<=_){const g=1/u;h*=g,p*=g,m=h*(h+o*p+2*a)+p*(o*h+p+2*l)+c}else p=s,h=Math.max(0,-(o*p+a)),m=-h*h+p*(p+2*l)+c;else p=-s,h=Math.max(0,-(o*p+a)),m=-h*h+p*(p+2*l)+c;else p<=-_?(h=Math.max(0,-(-o*s+a)),p=h>0?-s:Math.min(Math.max(-s,-l),s),m=-h*h+p*(p+2*l)+c):p<=_?(h=0,p=Math.min(Math.max(-s,-l),s),m=p*(p+2*l)+c):(h=Math.max(0,-(o*s+a)),p=h>0?s:Math.min(Math.max(-s,-l),s),m=-h*h+p*(p+2*l)+c);else p=o>0?-s:s,h=Math.max(0,-(o*p+a)),m=-h*h+p*(p+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,h),r&&r.copy(Jr).addScaledVector(Yi,p),m}intersectSphere(e,t){nn.subVectors(e.center,this.origin);const n=nn.dot(this.direction),r=nn.dot(nn)-n*n,s=e.radius*e.radius;if(r>s)return null;const o=Math.sqrt(s-r),a=n-o,l=n+o;return l<0?null:a<0?this.at(l,t):this.at(a,t)}intersectsSphere(e){return this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){const n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,r,s,o,a,l;const c=1/this.direction.x,u=1/this.direction.y,h=1/this.direction.z,p=this.origin;return c>=0?(n=(e.min.x-p.x)*c,r=(e.max.x-p.x)*c):(n=(e.max.x-p.x)*c,r=(e.min.x-p.x)*c),u>=0?(s=(e.min.y-p.y)*u,o=(e.max.y-p.y)*u):(s=(e.max.y-p.y)*u,o=(e.min.y-p.y)*u),n>o||s>r||((s>n||isNaN(n))&&(n=s),(o<r||isNaN(r))&&(r=o),h>=0?(a=(e.min.z-p.z)*h,l=(e.max.z-p.z)*h):(a=(e.max.z-p.z)*h,l=(e.min.z-p.z)*h),n>l||a>r)||((a>n||n!==n)&&(n=a),(l<r||r!==r)&&(r=l),r<0)?null:this.at(n>=0?n:r,t)}intersectsBox(e){return this.intersectBox(e,nn)!==null}intersectTriangle(e,t,n,r,s){Qr.subVectors(t,e),$i.subVectors(n,e),es.crossVectors(Qr,$i);let o=this.direction.dot(es),a;if(o>0){if(r)return null;a=1}else if(o<0)a=-1,o=-o;else return null;mn.subVectors(this.origin,e);const l=a*this.direction.dot($i.crossVectors(mn,$i));if(l<0)return null;const c=a*this.direction.dot(Qr.cross(mn));if(c<0||l+c>o)return null;const u=-a*mn.dot(es);return u<0?null:this.at(u/o,s)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class rt{constructor(e,t,n,r,s,o,a,l,c,u,h,p,m,_,g,d){rt.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,r,s,o,a,l,c,u,h,p,m,_,g,d)}set(e,t,n,r,s,o,a,l,c,u,h,p,m,_,g,d){const f=this.elements;return f[0]=e,f[4]=t,f[8]=n,f[12]=r,f[1]=s,f[5]=o,f[9]=a,f[13]=l,f[2]=c,f[6]=u,f[10]=h,f[14]=p,f[3]=m,f[7]=_,f[11]=g,f[15]=d,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new rt().fromArray(this.elements)}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){const t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){const t=this.elements,n=e.elements,r=1/Qn.setFromMatrixColumn(e,0).length(),s=1/Qn.setFromMatrixColumn(e,1).length(),o=1/Qn.setFromMatrixColumn(e,2).length();return t[0]=n[0]*r,t[1]=n[1]*r,t[2]=n[2]*r,t[3]=0,t[4]=n[4]*s,t[5]=n[5]*s,t[6]=n[6]*s,t[7]=0,t[8]=n[8]*o,t[9]=n[9]*o,t[10]=n[10]*o,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,n=e.x,r=e.y,s=e.z,o=Math.cos(n),a=Math.sin(n),l=Math.cos(r),c=Math.sin(r),u=Math.cos(s),h=Math.sin(s);if(e.order==="XYZ"){const p=o*u,m=o*h,_=a*u,g=a*h;t[0]=l*u,t[4]=-l*h,t[8]=c,t[1]=m+_*c,t[5]=p-g*c,t[9]=-a*l,t[2]=g-p*c,t[6]=_+m*c,t[10]=o*l}else if(e.order==="YXZ"){const p=l*u,m=l*h,_=c*u,g=c*h;t[0]=p+g*a,t[4]=_*a-m,t[8]=o*c,t[1]=o*h,t[5]=o*u,t[9]=-a,t[2]=m*a-_,t[6]=g+p*a,t[10]=o*l}else if(e.order==="ZXY"){const p=l*u,m=l*h,_=c*u,g=c*h;t[0]=p-g*a,t[4]=-o*h,t[8]=_+m*a,t[1]=m+_*a,t[5]=o*u,t[9]=g-p*a,t[2]=-o*c,t[6]=a,t[10]=o*l}else if(e.order==="ZYX"){const p=o*u,m=o*h,_=a*u,g=a*h;t[0]=l*u,t[4]=_*c-m,t[8]=p*c+g,t[1]=l*h,t[5]=g*c+p,t[9]=m*c-_,t[2]=-c,t[6]=a*l,t[10]=o*l}else if(e.order==="YZX"){const p=o*l,m=o*c,_=a*l,g=a*c;t[0]=l*u,t[4]=g-p*h,t[8]=_*h+m,t[1]=h,t[5]=o*u,t[9]=-a*u,t[2]=-c*u,t[6]=m*h+_,t[10]=p-g*h}else if(e.order==="XZY"){const p=o*l,m=o*c,_=a*l,g=a*c;t[0]=l*u,t[4]=-h,t[8]=c*u,t[1]=p*h+g,t[5]=o*u,t[9]=m*h-_,t[2]=_*h-m,t[6]=a*u,t[10]=g*h+p}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(xu,e,Mu)}lookAt(e,t,n){const r=this.elements;return Lt.subVectors(e,t),Lt.lengthSq()===0&&(Lt.z=1),Lt.normalize(),gn.crossVectors(n,Lt),gn.lengthSq()===0&&(Math.abs(n.z)===1?Lt.x+=1e-4:Lt.z+=1e-4,Lt.normalize(),gn.crossVectors(n,Lt)),gn.normalize(),Ki.crossVectors(Lt,gn),r[0]=gn.x,r[4]=Ki.x,r[8]=Lt.x,r[1]=gn.y,r[5]=Ki.y,r[9]=Lt.y,r[2]=gn.z,r[6]=Ki.z,r[10]=Lt.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,r=t.elements,s=this.elements,o=n[0],a=n[4],l=n[8],c=n[12],u=n[1],h=n[5],p=n[9],m=n[13],_=n[2],g=n[6],d=n[10],f=n[14],b=n[3],M=n[7],y=n[11],P=n[15],w=r[0],A=r[4],I=r[8],q=r[12],x=r[1],T=r[5],Y=r[9],$=r[13],R=r[2],V=r[6],H=r[10],K=r[14],k=r[3],X=r[7],Z=r[11],ie=r[15];return s[0]=o*w+a*x+l*R+c*k,s[4]=o*A+a*T+l*V+c*X,s[8]=o*I+a*Y+l*H+c*Z,s[12]=o*q+a*$+l*K+c*ie,s[1]=u*w+h*x+p*R+m*k,s[5]=u*A+h*T+p*V+m*X,s[9]=u*I+h*Y+p*H+m*Z,s[13]=u*q+h*$+p*K+m*ie,s[2]=_*w+g*x+d*R+f*k,s[6]=_*A+g*T+d*V+f*X,s[10]=_*I+g*Y+d*H+f*Z,s[14]=_*q+g*$+d*K+f*ie,s[3]=b*w+M*x+y*R+P*k,s[7]=b*A+M*T+y*V+P*X,s[11]=b*I+M*Y+y*H+P*Z,s[15]=b*q+M*$+y*K+P*ie,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[4],r=e[8],s=e[12],o=e[1],a=e[5],l=e[9],c=e[13],u=e[2],h=e[6],p=e[10],m=e[14],_=e[3],g=e[7],d=e[11],f=e[15];return _*(+s*l*h-r*c*h-s*a*p+n*c*p+r*a*m-n*l*m)+g*(+t*l*m-t*c*p+s*o*p-r*o*m+r*c*u-s*l*u)+d*(+t*c*h-t*a*m-s*o*h+n*o*m+s*a*u-n*c*u)+f*(-r*a*u-t*l*h+t*a*p+r*o*h-n*o*p+n*l*u)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){const r=this.elements;return e.isVector3?(r[12]=e.x,r[13]=e.y,r[14]=e.z):(r[12]=e,r[13]=t,r[14]=n),this}invert(){const e=this.elements,t=e[0],n=e[1],r=e[2],s=e[3],o=e[4],a=e[5],l=e[6],c=e[7],u=e[8],h=e[9],p=e[10],m=e[11],_=e[12],g=e[13],d=e[14],f=e[15],b=h*d*c-g*p*c+g*l*m-a*d*m-h*l*f+a*p*f,M=_*p*c-u*d*c-_*l*m+o*d*m+u*l*f-o*p*f,y=u*g*c-_*h*c+_*a*m-o*g*m-u*a*f+o*h*f,P=_*h*l-u*g*l-_*a*p+o*g*p+u*a*d-o*h*d,w=t*b+n*M+r*y+s*P;if(w===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const A=1/w;return e[0]=b*A,e[1]=(g*p*s-h*d*s-g*r*m+n*d*m+h*r*f-n*p*f)*A,e[2]=(a*d*s-g*l*s+g*r*c-n*d*c-a*r*f+n*l*f)*A,e[3]=(h*l*s-a*p*s-h*r*c+n*p*c+a*r*m-n*l*m)*A,e[4]=M*A,e[5]=(u*d*s-_*p*s+_*r*m-t*d*m-u*r*f+t*p*f)*A,e[6]=(_*l*s-o*d*s-_*r*c+t*d*c+o*r*f-t*l*f)*A,e[7]=(o*p*s-u*l*s+u*r*c-t*p*c-o*r*m+t*l*m)*A,e[8]=y*A,e[9]=(_*h*s-u*g*s-_*n*m+t*g*m+u*n*f-t*h*f)*A,e[10]=(o*g*s-_*a*s+_*n*c-t*g*c-o*n*f+t*a*f)*A,e[11]=(u*a*s-o*h*s-u*n*c+t*h*c+o*n*m-t*a*m)*A,e[12]=P*A,e[13]=(u*g*r-_*h*r+_*n*p-t*g*p-u*n*d+t*h*d)*A,e[14]=(_*a*r-o*g*r-_*n*l+t*g*l+o*n*d-t*a*d)*A,e[15]=(o*h*r-u*a*r+u*n*l-t*h*l-o*n*p+t*a*p)*A,this}scale(e){const t=this.elements,n=e.x,r=e.y,s=e.z;return t[0]*=n,t[4]*=r,t[8]*=s,t[1]*=n,t[5]*=r,t[9]*=s,t[2]*=n,t[6]*=r,t[10]*=s,t[3]*=n,t[7]*=r,t[11]*=s,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],r=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,r))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const n=Math.cos(t),r=Math.sin(t),s=1-n,o=e.x,a=e.y,l=e.z,c=s*o,u=s*a;return this.set(c*o+n,c*a-r*l,c*l+r*a,0,c*a+r*l,u*a+n,u*l-r*o,0,c*l-r*a,u*l+r*o,s*l*l+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,r,s,o){return this.set(1,n,s,0,e,1,o,0,t,r,1,0,0,0,0,1),this}compose(e,t,n){const r=this.elements,s=t._x,o=t._y,a=t._z,l=t._w,c=s+s,u=o+o,h=a+a,p=s*c,m=s*u,_=s*h,g=o*u,d=o*h,f=a*h,b=l*c,M=l*u,y=l*h,P=n.x,w=n.y,A=n.z;return r[0]=(1-(g+f))*P,r[1]=(m+y)*P,r[2]=(_-M)*P,r[3]=0,r[4]=(m-y)*w,r[5]=(1-(p+f))*w,r[6]=(d+b)*w,r[7]=0,r[8]=(_+M)*A,r[9]=(d-b)*A,r[10]=(1-(p+g))*A,r[11]=0,r[12]=e.x,r[13]=e.y,r[14]=e.z,r[15]=1,this}decompose(e,t,n){const r=this.elements;let s=Qn.set(r[0],r[1],r[2]).length();const o=Qn.set(r[4],r[5],r[6]).length(),a=Qn.set(r[8],r[9],r[10]).length();this.determinant()<0&&(s=-s),e.x=r[12],e.y=r[13],e.z=r[14],kt.copy(this);const c=1/s,u=1/o,h=1/a;return kt.elements[0]*=c,kt.elements[1]*=c,kt.elements[2]*=c,kt.elements[4]*=u,kt.elements[5]*=u,kt.elements[6]*=u,kt.elements[8]*=h,kt.elements[9]*=h,kt.elements[10]*=h,t.setFromRotationMatrix(kt),n.x=s,n.y=o,n.z=a,this}makePerspective(e,t,n,r,s,o,a=un){const l=this.elements,c=2*s/(t-e),u=2*s/(n-r),h=(t+e)/(t-e),p=(n+r)/(n-r);let m,_;if(a===un)m=-(o+s)/(o-s),_=-2*o*s/(o-s);else if(a===br)m=-o/(o-s),_=-o*s/(o-s);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return l[0]=c,l[4]=0,l[8]=h,l[12]=0,l[1]=0,l[5]=u,l[9]=p,l[13]=0,l[2]=0,l[6]=0,l[10]=m,l[14]=_,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(e,t,n,r,s,o,a=un){const l=this.elements,c=1/(t-e),u=1/(n-r),h=1/(o-s),p=(t+e)*c,m=(n+r)*u;let _,g;if(a===un)_=(o+s)*h,g=-2*h;else if(a===br)_=s*h,g=-1*h;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return l[0]=2*c,l[4]=0,l[8]=0,l[12]=-p,l[1]=0,l[5]=2*u,l[9]=0,l[13]=-m,l[2]=0,l[6]=0,l[10]=g,l[14]=-_,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(e){const t=this.elements,n=e.elements;for(let r=0;r<16;r++)if(t[r]!==n[r])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}}const Qn=new U,kt=new rt,xu=new U(0,0,0),Mu=new U(1,1,1),gn=new U,Ki=new U,Lt=new U,Za=new rt,ja=new Ni;class dn{constructor(e=0,t=0,n=0,r=dn.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=r}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,r=this._order){return this._x=e,this._y=t,this._z=n,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){const r=e.elements,s=r[0],o=r[4],a=r[8],l=r[1],c=r[5],u=r[9],h=r[2],p=r[6],m=r[10];switch(t){case"XYZ":this._y=Math.asin(At(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-u,m),this._z=Math.atan2(-o,s)):(this._x=Math.atan2(p,c),this._z=0);break;case"YXZ":this._x=Math.asin(-At(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(a,m),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-h,s),this._z=0);break;case"ZXY":this._x=Math.asin(At(p,-1,1)),Math.abs(p)<.9999999?(this._y=Math.atan2(-h,m),this._z=Math.atan2(-o,c)):(this._y=0,this._z=Math.atan2(l,s));break;case"ZYX":this._y=Math.asin(-At(h,-1,1)),Math.abs(h)<.9999999?(this._x=Math.atan2(p,m),this._z=Math.atan2(l,s)):(this._x=0,this._z=Math.atan2(-o,c));break;case"YZX":this._z=Math.asin(At(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-u,c),this._y=Math.atan2(-h,s)):(this._x=0,this._y=Math.atan2(a,m));break;case"XZY":this._z=Math.asin(-At(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(p,c),this._y=Math.atan2(a,s)):(this._x=Math.atan2(-u,m),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return Za.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Za,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return ja.setFromEuler(this),this.setFromQuaternion(ja,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}dn.DEFAULT_ORDER="XYZ";class il{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let Su=0;const Ja=new U,ei=new Ni,rn=new rt,Zi=new U,Ci=new U,yu=new U,Eu=new Ni,Qa=new U(1,0,0),eo=new U(0,1,0),to=new U(0,0,1),bu={type:"added"},Tu={type:"removed"},ts={type:"childadded",child:null},ns={type:"childremoved",child:null};class Et extends Mi{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Su++}),this.uuid=Ii(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=Et.DEFAULT_UP.clone();const e=new U,t=new dn,n=new Ni,r=new U(1,1,1);function s(){n.setFromEuler(t,!1)}function o(){t.setFromQuaternion(n,void 0,!1)}t._onChange(s),n._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:r},modelViewMatrix:{value:new rt},normalMatrix:{value:new Ie}}),this.matrix=new rt,this.matrixWorld=new rt,this.matrixAutoUpdate=Et.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=Et.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new il,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return ei.setFromAxisAngle(e,t),this.quaternion.multiply(ei),this}rotateOnWorldAxis(e,t){return ei.setFromAxisAngle(e,t),this.quaternion.premultiply(ei),this}rotateX(e){return this.rotateOnAxis(Qa,e)}rotateY(e){return this.rotateOnAxis(eo,e)}rotateZ(e){return this.rotateOnAxis(to,e)}translateOnAxis(e,t){return Ja.copy(e).applyQuaternion(this.quaternion),this.position.add(Ja.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Qa,e)}translateY(e){return this.translateOnAxis(eo,e)}translateZ(e){return this.translateOnAxis(to,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(rn.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?Zi.copy(e):Zi.set(e,t,n);const r=this.parent;this.updateWorldMatrix(!0,!1),Ci.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?rn.lookAt(Ci,Zi,this.up):rn.lookAt(Zi,Ci,this.up),this.quaternion.setFromRotationMatrix(rn),r&&(rn.extractRotation(r.matrixWorld),ei.setFromRotationMatrix(rn),this.quaternion.premultiply(ei.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.parent!==null&&e.parent.remove(e),e.parent=this,this.children.push(e),e.dispatchEvent(bu),ts.child=e,this.dispatchEvent(ts),ts.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Tu),ns.child=e,this.dispatchEvent(ns),ns.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),rn.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),rn.multiply(e.parent.matrixWorld)),e.applyMatrix4(rn),this.add(e),e.updateWorldMatrix(!1,!0),this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,r=this.children.length;n<r;n++){const o=this.children[n].getObjectByProperty(e,t);if(o!==void 0)return o}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);const r=this.children;for(let s=0,o=r.length;s<o;s++)r[s].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ci,e,yu),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ci,Eu,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);const t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let n=0,r=t.length;n<r;n++){const s=t[n];(s.matrixWorldAutoUpdate===!0||e===!0)&&s.updateMatrixWorld(e)}}updateWorldMatrix(e,t){const n=this.parent;if(e===!0&&n!==null&&n.matrixWorldAutoUpdate===!0&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix),t===!0){const r=this.children;for(let s=0,o=r.length;s<o;s++){const a=r[s];a.matrixWorldAutoUpdate===!0&&a.updateWorldMatrix(!1,!0)}}}toJSON(e){const t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});const r={};r.uuid=this.uuid,r.type=this.type,this.name!==""&&(r.name=this.name),this.castShadow===!0&&(r.castShadow=!0),this.receiveShadow===!0&&(r.receiveShadow=!0),this.visible===!1&&(r.visible=!1),this.frustumCulled===!1&&(r.frustumCulled=!1),this.renderOrder!==0&&(r.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(r.matrixAutoUpdate=!1),this.isInstancedMesh&&(r.type="InstancedMesh",r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type="BatchedMesh",r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.visibility=this._visibility,r.active=this._active,r.bounds=this._bounds.map(a=>({boxInitialized:a.boxInitialized,boxMin:a.box.min.toArray(),boxMax:a.box.max.toArray(),sphereInitialized:a.sphereInitialized,sphereRadius:a.sphere.radius,sphereCenter:a.sphere.center.toArray()})),r.maxGeometryCount=this._maxGeometryCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.geometryCount=this._geometryCount,r.matricesTexture=this._matricesTexture.toJSON(e),this.boundingSphere!==null&&(r.boundingSphere={center:r.boundingSphere.center.toArray(),radius:r.boundingSphere.radius}),this.boundingBox!==null&&(r.boundingBox={min:r.boundingBox.min.toArray(),max:r.boundingBox.max.toArray()}));function s(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=s(e.geometries,this.geometry);const a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){const l=a.shapes;if(Array.isArray(l))for(let c=0,u=l.length;c<u;c++){const h=l[c];s(e.shapes,h)}else s(e.shapes,l)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(s(e.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const a=[];for(let l=0,c=this.material.length;l<c;l++)a.push(s(e.materials,this.material[l]));r.material=a}else r.material=s(e.materials,this.material);if(this.children.length>0){r.children=[];for(let a=0;a<this.children.length;a++)r.children.push(this.children[a].toJSON(e).object)}if(this.animations.length>0){r.animations=[];for(let a=0;a<this.animations.length;a++){const l=this.animations[a];r.animations.push(s(e.animations,l))}}if(t){const a=o(e.geometries),l=o(e.materials),c=o(e.textures),u=o(e.images),h=o(e.shapes),p=o(e.skeletons),m=o(e.animations),_=o(e.nodes);a.length>0&&(n.geometries=a),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),u.length>0&&(n.images=u),h.length>0&&(n.shapes=h),p.length>0&&(n.skeletons=p),m.length>0&&(n.animations=m),_.length>0&&(n.nodes=_)}return n.object=r,n;function o(a){const l=[];for(const c in a){const u=a[c];delete u.metadata,l.push(u)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){const r=e.children[n];this.add(r.clone())}return this}}Et.DEFAULT_UP=new U(0,1,0);Et.DEFAULT_MATRIX_AUTO_UPDATE=!0;Et.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const Vt=new U,sn=new U,is=new U,an=new U,ti=new U,ni=new U,no=new U,rs=new U,ss=new U,as=new U;class $t{constructor(e=new U,t=new U,n=new U){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,r){r.subVectors(n,t),Vt.subVectors(e,t),r.cross(Vt);const s=r.lengthSq();return s>0?r.multiplyScalar(1/Math.sqrt(s)):r.set(0,0,0)}static getBarycoord(e,t,n,r,s){Vt.subVectors(r,t),sn.subVectors(n,t),is.subVectors(e,t);const o=Vt.dot(Vt),a=Vt.dot(sn),l=Vt.dot(is),c=sn.dot(sn),u=sn.dot(is),h=o*c-a*a;if(h===0)return s.set(0,0,0),null;const p=1/h,m=(c*l-a*u)*p,_=(o*u-a*l)*p;return s.set(1-m-_,_,m)}static containsPoint(e,t,n,r){return this.getBarycoord(e,t,n,r,an)===null?!1:an.x>=0&&an.y>=0&&an.x+an.y<=1}static getInterpolation(e,t,n,r,s,o,a,l){return this.getBarycoord(e,t,n,r,an)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(s,an.x),l.addScaledVector(o,an.y),l.addScaledVector(a,an.z),l)}static isFrontFacing(e,t,n,r){return Vt.subVectors(n,t),sn.subVectors(e,t),Vt.cross(sn).dot(r)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,r){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[r]),this}setFromAttributeAndIndices(e,t,n,r){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,r),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Vt.subVectors(this.c,this.b),sn.subVectors(this.a,this.b),Vt.cross(sn).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return $t.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return $t.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,r,s){return $t.getInterpolation(e,this.a,this.b,this.c,t,n,r,s)}containsPoint(e){return $t.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return $t.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const n=this.a,r=this.b,s=this.c;let o,a;ti.subVectors(r,n),ni.subVectors(s,n),rs.subVectors(e,n);const l=ti.dot(rs),c=ni.dot(rs);if(l<=0&&c<=0)return t.copy(n);ss.subVectors(e,r);const u=ti.dot(ss),h=ni.dot(ss);if(u>=0&&h<=u)return t.copy(r);const p=l*h-u*c;if(p<=0&&l>=0&&u<=0)return o=l/(l-u),t.copy(n).addScaledVector(ti,o);as.subVectors(e,s);const m=ti.dot(as),_=ni.dot(as);if(_>=0&&m<=_)return t.copy(s);const g=m*c-l*_;if(g<=0&&c>=0&&_<=0)return a=c/(c-_),t.copy(n).addScaledVector(ni,a);const d=u*_-m*h;if(d<=0&&h-u>=0&&m-_>=0)return no.subVectors(s,r),a=(h-u)/(h-u+(m-_)),t.copy(r).addScaledVector(no,a);const f=1/(d+g+p);return o=g*f,a=p*f,t.copy(n).addScaledVector(ti,o).addScaledVector(ni,a)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}const rl={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},_n={h:0,s:0,l:0},ji={h:0,s:0,l:0};function os(i,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?i+(e-i)*6*t:t<1/2?e:t<2/3?i+(e-i)*6*(2/3-t):i}class We{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){const r=e;r&&r.isColor?this.copy(r):typeof r=="number"?this.setHex(r):typeof r=="string"&&this.setStyle(r)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Zt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,$e.toWorkingColorSpace(this,t),this}setRGB(e,t,n,r=$e.workingColorSpace){return this.r=e,this.g=t,this.b=n,$e.toWorkingColorSpace(this,r),this}setHSL(e,t,n,r=$e.workingColorSpace){if(e=uu(e,1),t=At(t,0,1),n=At(n,0,1),t===0)this.r=this.g=this.b=n;else{const s=n<=.5?n*(1+t):n+t-n*t,o=2*n-s;this.r=os(o,s,e+1/3),this.g=os(o,s,e),this.b=os(o,s,e-1/3)}return $e.toWorkingColorSpace(this,r),this}setStyle(e,t=Zt){function n(s){s!==void 0&&parseFloat(s)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(e)){let s;const o=r[1],a=r[2];switch(o){case"rgb":case"rgba":if(s=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(s[4]),this.setRGB(Math.min(255,parseInt(s[1],10))/255,Math.min(255,parseInt(s[2],10))/255,Math.min(255,parseInt(s[3],10))/255,t);if(s=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(s[4]),this.setRGB(Math.min(100,parseInt(s[1],10))/100,Math.min(100,parseInt(s[2],10))/100,Math.min(100,parseInt(s[3],10))/100,t);break;case"hsl":case"hsla":if(s=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(s[4]),this.setHSL(parseFloat(s[1])/360,parseFloat(s[2])/100,parseFloat(s[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(e)){const s=r[1],o=s.length;if(o===3)return this.setRGB(parseInt(s.charAt(0),16)/15,parseInt(s.charAt(1),16)/15,parseInt(s.charAt(2),16)/15,t);if(o===6)return this.setHex(parseInt(s,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Zt){const n=rl[e.toLowerCase()];return n!==void 0?this.setHex(n,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=pi(e.r),this.g=pi(e.g),this.b=pi(e.b),this}copyLinearToSRGB(e){return this.r=Yr(e.r),this.g=Yr(e.g),this.b=Yr(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Zt){return $e.fromWorkingColorSpace(vt.copy(this),e),Math.round(At(vt.r*255,0,255))*65536+Math.round(At(vt.g*255,0,255))*256+Math.round(At(vt.b*255,0,255))}getHexString(e=Zt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=$e.workingColorSpace){$e.fromWorkingColorSpace(vt.copy(this),t);const n=vt.r,r=vt.g,s=vt.b,o=Math.max(n,r,s),a=Math.min(n,r,s);let l,c;const u=(a+o)/2;if(a===o)l=0,c=0;else{const h=o-a;switch(c=u<=.5?h/(o+a):h/(2-o-a),o){case n:l=(r-s)/h+(r<s?6:0);break;case r:l=(s-n)/h+2;break;case s:l=(n-r)/h+4;break}l/=6}return e.h=l,e.s=c,e.l=u,e}getRGB(e,t=$e.workingColorSpace){return $e.fromWorkingColorSpace(vt.copy(this),t),e.r=vt.r,e.g=vt.g,e.b=vt.b,e}getStyle(e=Zt){$e.fromWorkingColorSpace(vt.copy(this),e);const t=vt.r,n=vt.g,r=vt.b;return e!==Zt?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${r.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(r*255)})`}offsetHSL(e,t,n){return this.getHSL(_n),this.setHSL(_n.h+e,_n.s+t,_n.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(_n),e.getHSL(ji);const n=Xr(_n.h,ji.h,t),r=Xr(_n.s,ji.s,t),s=Xr(_n.l,ji.l,t);return this.setHSL(n,r,s),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,n=this.g,r=this.b,s=e.elements;return this.r=s[0]*t+s[3]*n+s[6]*r,this.g=s[1]*t+s[4]*n+s[7]*r,this.b=s[2]*t+s[5]*n+s[8]*r,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const vt=new We;We.NAMES=rl;let Au=0;class Si extends Mi{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Au++}),this.uuid=Ii(),this.name="",this.type="Material",this.blending=fi,this.side=Tn,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Es,this.blendDst=bs,this.blendEquation=zn,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new We(0,0,0),this.blendAlpha=0,this.depthFunc=Mr,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=ka,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=$n,this.stencilZFail=$n,this.stencilZPass=$n,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBuild(){}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const n=e[t];if(n===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}const r=this[t];if(r===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}r&&r.isColor?r.set(n):r&&r.isVector3&&n&&n.isVector3?r.copy(n):this[t]=n}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const n={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==fi&&(n.blending=this.blending),this.side!==Tn&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==Es&&(n.blendSrc=this.blendSrc),this.blendDst!==bs&&(n.blendDst=this.blendDst),this.blendEquation!==zn&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==Mr&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==ka&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==$n&&(n.stencilFail=this.stencilFail),this.stencilZFail!==$n&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==$n&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function r(s){const o=[];for(const a in s){const l=s[a];delete l.metadata,o.push(l)}return o}if(t){const s=r(e.textures),o=r(e.images);s.length>0&&(n.textures=s),o.length>0&&(n.images=o)}return n}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let n=null;if(t!==null){const r=t.length;n=new Array(r);for(let s=0;s!==r;++s)n[s]=t[s].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}}class ui extends Si{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new We(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new dn,this.combine=Vo,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const at=new U,Ji=new Ve;class Gt{constructor(e,t,n=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=Va,this._updateRange={offset:0,count:-1},this.updateRanges=[],this.gpuType=ln,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}get updateRange(){return du("THREE.BufferAttribute: updateRange() is deprecated and will be removed in r169. Use addUpdateRange() instead."),this._updateRange}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let r=0,s=this.itemSize;r<s;r++)this.array[e+r]=t.array[n+r];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)Ji.fromBufferAttribute(this,t),Ji.applyMatrix3(e),this.setXY(t,Ji.x,Ji.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)at.fromBufferAttribute(this,t),at.applyMatrix3(e),this.setXYZ(t,at.x,at.y,at.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)at.fromBufferAttribute(this,t),at.applyMatrix4(e),this.setXYZ(t,at.x,at.y,at.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)at.fromBufferAttribute(this,t),at.applyNormalMatrix(e),this.setXYZ(t,at.x,at.y,at.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)at.fromBufferAttribute(this,t),at.transformDirection(e),this.setXYZ(t,at.x,at.y,at.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=Ai(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=bt(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=Ai(t,this.array)),t}setX(e,t){return this.normalized&&(t=bt(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=Ai(t,this.array)),t}setY(e,t){return this.normalized&&(t=bt(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=Ai(t,this.array)),t}setZ(e,t){return this.normalized&&(t=bt(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=Ai(t,this.array)),t}setW(e,t){return this.normalized&&(t=bt(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=bt(t,this.array),n=bt(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,r){return e*=this.itemSize,this.normalized&&(t=bt(t,this.array),n=bt(n,this.array),r=bt(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this}setXYZW(e,t,n,r,s){return e*=this.itemSize,this.normalized&&(t=bt(t,this.array),n=bt(n,this.array),r=bt(r,this.array),s=bt(s,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this.array[e+3]=s,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==Va&&(e.usage=this.usage),e}}class sl extends Gt{constructor(e,t,n){super(new Uint16Array(e),t,n)}}class al extends Gt{constructor(e,t,n){super(new Uint32Array(e),t,n)}}class ot extends Gt{constructor(e,t,n){super(new Float32Array(e),t,n)}}let wu=0;const Bt=new rt,ls=new Et,ii=new U,Dt=new Fi,Pi=new Fi,ht=new U;class Ct extends Mi{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:wu++}),this.uuid=Ii(),this.name="",this.type="BufferGeometry",this.index=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(Qo(e)?al:sl)(e,1):this.index=e,this}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const n=this.attributes.normal;if(n!==void 0){const s=new Ie().getNormalMatrix(e);n.applyNormalMatrix(s),n.needsUpdate=!0}const r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(e),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return Bt.makeRotationFromQuaternion(e),this.applyMatrix4(Bt),this}rotateX(e){return Bt.makeRotationX(e),this.applyMatrix4(Bt),this}rotateY(e){return Bt.makeRotationY(e),this.applyMatrix4(Bt),this}rotateZ(e){return Bt.makeRotationZ(e),this.applyMatrix4(Bt),this}translate(e,t,n){return Bt.makeTranslation(e,t,n),this.applyMatrix4(Bt),this}scale(e,t,n){return Bt.makeScale(e,t,n),this.applyMatrix4(Bt),this}lookAt(e){return ls.lookAt(e),ls.updateMatrix(),this.applyMatrix4(ls.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(ii).negate(),this.translate(ii.x,ii.y,ii.z),this}setFromPoints(e){const t=[];for(let n=0,r=e.length;n<r;n++){const s=e[n];t.push(s.x,s.y,s.z||0)}return this.setAttribute("position",new ot(t,3)),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Fi);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new U(-1/0,-1/0,-1/0),new U(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,r=t.length;n<r;n++){const s=t[n];Dt.setFromBufferAttribute(s),this.morphTargetsRelative?(ht.addVectors(this.boundingBox.min,Dt.min),this.boundingBox.expandByPoint(ht),ht.addVectors(this.boundingBox.max,Dt.max),this.boundingBox.expandByPoint(ht)):(this.boundingBox.expandByPoint(Dt.min),this.boundingBox.expandByPoint(Dt.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Oi);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new U,1/0);return}if(e){const n=this.boundingSphere.center;if(Dt.setFromBufferAttribute(e),t)for(let s=0,o=t.length;s<o;s++){const a=t[s];Pi.setFromBufferAttribute(a),this.morphTargetsRelative?(ht.addVectors(Dt.min,Pi.min),Dt.expandByPoint(ht),ht.addVectors(Dt.max,Pi.max),Dt.expandByPoint(ht)):(Dt.expandByPoint(Pi.min),Dt.expandByPoint(Pi.max))}Dt.getCenter(n);let r=0;for(let s=0,o=e.count;s<o;s++)ht.fromBufferAttribute(e,s),r=Math.max(r,n.distanceToSquared(ht));if(t)for(let s=0,o=t.length;s<o;s++){const a=t[s],l=this.morphTargetsRelative;for(let c=0,u=a.count;c<u;c++)ht.fromBufferAttribute(a,c),l&&(ii.fromBufferAttribute(e,c),ht.add(ii)),r=Math.max(r,n.distanceToSquared(ht))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const n=t.position,r=t.normal,s=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Gt(new Float32Array(4*n.count),4));const o=this.getAttribute("tangent"),a=[],l=[];for(let I=0;I<n.count;I++)a[I]=new U,l[I]=new U;const c=new U,u=new U,h=new U,p=new Ve,m=new Ve,_=new Ve,g=new U,d=new U;function f(I,q,x){c.fromBufferAttribute(n,I),u.fromBufferAttribute(n,q),h.fromBufferAttribute(n,x),p.fromBufferAttribute(s,I),m.fromBufferAttribute(s,q),_.fromBufferAttribute(s,x),u.sub(c),h.sub(c),m.sub(p),_.sub(p);const T=1/(m.x*_.y-_.x*m.y);isFinite(T)&&(g.copy(u).multiplyScalar(_.y).addScaledVector(h,-m.y).multiplyScalar(T),d.copy(h).multiplyScalar(m.x).addScaledVector(u,-_.x).multiplyScalar(T),a[I].add(g),a[q].add(g),a[x].add(g),l[I].add(d),l[q].add(d),l[x].add(d))}let b=this.groups;b.length===0&&(b=[{start:0,count:e.count}]);for(let I=0,q=b.length;I<q;++I){const x=b[I],T=x.start,Y=x.count;for(let $=T,R=T+Y;$<R;$+=3)f(e.getX($+0),e.getX($+1),e.getX($+2))}const M=new U,y=new U,P=new U,w=new U;function A(I){P.fromBufferAttribute(r,I),w.copy(P);const q=a[I];M.copy(q),M.sub(P.multiplyScalar(P.dot(q))).normalize(),y.crossVectors(w,q);const T=y.dot(l[I])<0?-1:1;o.setXYZW(I,M.x,M.y,M.z,T)}for(let I=0,q=b.length;I<q;++I){const x=b[I],T=x.start,Y=x.count;for(let $=T,R=T+Y;$<R;$+=3)A(e.getX($+0)),A(e.getX($+1)),A(e.getX($+2))}}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new Gt(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let p=0,m=n.count;p<m;p++)n.setXYZ(p,0,0,0);const r=new U,s=new U,o=new U,a=new U,l=new U,c=new U,u=new U,h=new U;if(e)for(let p=0,m=e.count;p<m;p+=3){const _=e.getX(p+0),g=e.getX(p+1),d=e.getX(p+2);r.fromBufferAttribute(t,_),s.fromBufferAttribute(t,g),o.fromBufferAttribute(t,d),u.subVectors(o,s),h.subVectors(r,s),u.cross(h),a.fromBufferAttribute(n,_),l.fromBufferAttribute(n,g),c.fromBufferAttribute(n,d),a.add(u),l.add(u),c.add(u),n.setXYZ(_,a.x,a.y,a.z),n.setXYZ(g,l.x,l.y,l.z),n.setXYZ(d,c.x,c.y,c.z)}else for(let p=0,m=t.count;p<m;p+=3)r.fromBufferAttribute(t,p+0),s.fromBufferAttribute(t,p+1),o.fromBufferAttribute(t,p+2),u.subVectors(o,s),h.subVectors(r,s),u.cross(h),n.setXYZ(p+0,u.x,u.y,u.z),n.setXYZ(p+1,u.x,u.y,u.z),n.setXYZ(p+2,u.x,u.y,u.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)ht.fromBufferAttribute(e,t),ht.normalize(),e.setXYZ(t,ht.x,ht.y,ht.z)}toNonIndexed(){function e(a,l){const c=a.array,u=a.itemSize,h=a.normalized,p=new c.constructor(l.length*u);let m=0,_=0;for(let g=0,d=l.length;g<d;g++){a.isInterleavedBufferAttribute?m=l[g]*a.data.stride+a.offset:m=l[g]*u;for(let f=0;f<u;f++)p[_++]=c[m++]}return new Gt(p,u,h)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new Ct,n=this.index.array,r=this.attributes;for(const a in r){const l=r[a],c=e(l,n);t.setAttribute(a,c)}const s=this.morphAttributes;for(const a in s){const l=[],c=s[a];for(let u=0,h=c.length;u<h;u++){const p=c[u],m=e(p,n);l.push(m)}t.morphAttributes[a]=l}t.morphTargetsRelative=this.morphTargetsRelative;const o=this.groups;for(let a=0,l=o.length;a<l;a++){const c=o[a];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){const e={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){const l=this.parameters;for(const c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const n=this.attributes;for(const l in n){const c=n[l];e.data.attributes[l]=c.toJSON(e.data)}const r={};let s=!1;for(const l in this.morphAttributes){const c=this.morphAttributes[l],u=[];for(let h=0,p=c.length;h<p;h++){const m=c[h];u.push(m.toJSON(e.data))}u.length>0&&(r[l]=u,s=!0)}s&&(e.data.morphAttributes=r,e.data.morphTargetsRelative=this.morphTargetsRelative);const o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));const a=this.boundingSphere;return a!==null&&(e.data.boundingSphere={center:a.center.toArray(),radius:a.radius}),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const n=e.index;n!==null&&this.setIndex(n.clone(t));const r=e.attributes;for(const c in r){const u=r[c];this.setAttribute(c,u.clone(t))}const s=e.morphAttributes;for(const c in s){const u=[],h=s[c];for(let p=0,m=h.length;p<m;p++)u.push(h[p].clone(t));this.morphAttributes[c]=u}this.morphTargetsRelative=e.morphTargetsRelative;const o=e.groups;for(let c=0,u=o.length;c<u;c++){const h=o[c];this.addGroup(h.start,h.count,h.materialIndex)}const a=e.boundingBox;a!==null&&(this.boundingBox=a.clone());const l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const io=new rt,Un=new Gs,Qi=new Oi,ro=new U,ri=new U,si=new U,ai=new U,cs=new U,er=new U,tr=new Ve,nr=new Ve,ir=new Ve,so=new U,ao=new U,oo=new U,rr=new U,sr=new U;class Nt extends Et{constructor(e=new Ct,t=new ui){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const r=t[n[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,o=r.length;s<o;s++){const a=r[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=s}}}}getVertexPosition(e,t){const n=this.geometry,r=n.attributes.position,s=n.morphAttributes.position,o=n.morphTargetsRelative;t.fromBufferAttribute(r,e);const a=this.morphTargetInfluences;if(s&&a){er.set(0,0,0);for(let l=0,c=s.length;l<c;l++){const u=a[l],h=s[l];u!==0&&(cs.fromBufferAttribute(h,e),o?er.addScaledVector(cs,u):er.addScaledVector(cs.sub(t),u))}t.add(er)}return t}raycast(e,t){const n=this.geometry,r=this.material,s=this.matrixWorld;r!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Qi.copy(n.boundingSphere),Qi.applyMatrix4(s),Un.copy(e.ray).recast(e.near),!(Qi.containsPoint(Un.origin)===!1&&(Un.intersectSphere(Qi,ro)===null||Un.origin.distanceToSquared(ro)>(e.far-e.near)**2))&&(io.copy(s).invert(),Un.copy(e.ray).applyMatrix4(io),!(n.boundingBox!==null&&Un.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,Un)))}_computeIntersections(e,t,n){let r;const s=this.geometry,o=this.material,a=s.index,l=s.attributes.position,c=s.attributes.uv,u=s.attributes.uv1,h=s.attributes.normal,p=s.groups,m=s.drawRange;if(a!==null)if(Array.isArray(o))for(let _=0,g=p.length;_<g;_++){const d=p[_],f=o[d.materialIndex],b=Math.max(d.start,m.start),M=Math.min(a.count,Math.min(d.start+d.count,m.start+m.count));for(let y=b,P=M;y<P;y+=3){const w=a.getX(y),A=a.getX(y+1),I=a.getX(y+2);r=ar(this,f,e,n,c,u,h,w,A,I),r&&(r.faceIndex=Math.floor(y/3),r.face.materialIndex=d.materialIndex,t.push(r))}}else{const _=Math.max(0,m.start),g=Math.min(a.count,m.start+m.count);for(let d=_,f=g;d<f;d+=3){const b=a.getX(d),M=a.getX(d+1),y=a.getX(d+2);r=ar(this,o,e,n,c,u,h,b,M,y),r&&(r.faceIndex=Math.floor(d/3),t.push(r))}}else if(l!==void 0)if(Array.isArray(o))for(let _=0,g=p.length;_<g;_++){const d=p[_],f=o[d.materialIndex],b=Math.max(d.start,m.start),M=Math.min(l.count,Math.min(d.start+d.count,m.start+m.count));for(let y=b,P=M;y<P;y+=3){const w=y,A=y+1,I=y+2;r=ar(this,f,e,n,c,u,h,w,A,I),r&&(r.faceIndex=Math.floor(y/3),r.face.materialIndex=d.materialIndex,t.push(r))}}else{const _=Math.max(0,m.start),g=Math.min(l.count,m.start+m.count);for(let d=_,f=g;d<f;d+=3){const b=d,M=d+1,y=d+2;r=ar(this,o,e,n,c,u,h,b,M,y),r&&(r.faceIndex=Math.floor(d/3),t.push(r))}}}}function Ru(i,e,t,n,r,s,o,a){let l;if(e.side===wt?l=n.intersectTriangle(o,s,r,!0,a):l=n.intersectTriangle(r,s,o,e.side===Tn,a),l===null)return null;sr.copy(a),sr.applyMatrix4(i.matrixWorld);const c=t.ray.origin.distanceTo(sr);return c<t.near||c>t.far?null:{distance:c,point:sr.clone(),object:i}}function ar(i,e,t,n,r,s,o,a,l,c){i.getVertexPosition(a,ri),i.getVertexPosition(l,si),i.getVertexPosition(c,ai);const u=Ru(i,e,t,n,ri,si,ai,rr);if(u){r&&(tr.fromBufferAttribute(r,a),nr.fromBufferAttribute(r,l),ir.fromBufferAttribute(r,c),u.uv=$t.getInterpolation(rr,ri,si,ai,tr,nr,ir,new Ve)),s&&(tr.fromBufferAttribute(s,a),nr.fromBufferAttribute(s,l),ir.fromBufferAttribute(s,c),u.uv1=$t.getInterpolation(rr,ri,si,ai,tr,nr,ir,new Ve)),o&&(so.fromBufferAttribute(o,a),ao.fromBufferAttribute(o,l),oo.fromBufferAttribute(o,c),u.normal=$t.getInterpolation(rr,ri,si,ai,so,ao,oo,new U),u.normal.dot(n.direction)>0&&u.normal.multiplyScalar(-1));const h={a,b:l,c,normal:new U,materialIndex:0};$t.getNormal(ri,si,ai,h.normal),u.face=h}return u}class yi extends Ct{constructor(e=1,t=1,n=1,r=1,s=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:r,heightSegments:s,depthSegments:o};const a=this;r=Math.floor(r),s=Math.floor(s),o=Math.floor(o);const l=[],c=[],u=[],h=[];let p=0,m=0;_("z","y","x",-1,-1,n,t,e,o,s,0),_("z","y","x",1,-1,n,t,-e,o,s,1),_("x","z","y",1,1,e,n,t,r,o,2),_("x","z","y",1,-1,e,n,-t,r,o,3),_("x","y","z",1,-1,e,t,n,r,s,4),_("x","y","z",-1,-1,e,t,-n,r,s,5),this.setIndex(l),this.setAttribute("position",new ot(c,3)),this.setAttribute("normal",new ot(u,3)),this.setAttribute("uv",new ot(h,2));function _(g,d,f,b,M,y,P,w,A,I,q){const x=y/A,T=P/I,Y=y/2,$=P/2,R=w/2,V=A+1,H=I+1;let K=0,k=0;const X=new U;for(let Z=0;Z<H;Z++){const ie=Z*T-$;for(let he=0;he<V;he++){const Ce=he*x-Y;X[g]=Ce*b,X[d]=ie*M,X[f]=R,c.push(X.x,X.y,X.z),X[g]=0,X[d]=0,X[f]=w>0?1:-1,u.push(X.x,X.y,X.z),h.push(he/A),h.push(1-Z/I),K+=1}}for(let Z=0;Z<I;Z++)for(let ie=0;ie<A;ie++){const he=p+ie+V*Z,Ce=p+ie+V*(Z+1),z=p+(ie+1)+V*(Z+1),J=p+(ie+1)+V*Z;l.push(he,Ce,J),l.push(Ce,z,J),k+=6}a.addGroup(m,k,q),m+=k,p+=K}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new yi(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}function xi(i){const e={};for(const t in i){e[t]={};for(const n in i[t]){const r=i[t][n];r&&(r.isColor||r.isMatrix3||r.isMatrix4||r.isVector2||r.isVector3||r.isVector4||r.isTexture||r.isQuaternion)?r.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=r.clone():Array.isArray(r)?e[t][n]=r.slice():e[t][n]=r}}return e}function Mt(i){const e={};for(let t=0;t<i.length;t++){const n=xi(i[t]);for(const r in n)e[r]=n[r]}return e}function Cu(i){const e=[];for(let t=0;t<i.length;t++)e.push(i[t].clone());return e}function ol(i){return i.getRenderTarget()===null?i.outputColorSpace:$e.workingColorSpace}const Pu={clone:xi,merge:Mt};var Lu=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Du=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class An extends Si{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Lu,this.fragmentShader=Du,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={derivatives:!1,fragDepth:!1,drawBuffers:!1,shaderTextureLOD:!1,clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=xi(e.uniforms),this.uniformsGroups=Cu(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const r in this.uniforms){const o=this.uniforms[r].value;o&&o.isTexture?t.uniforms[r]={type:"t",value:o.toJSON(e).uuid}:o&&o.isColor?t.uniforms[r]={type:"c",value:o.getHex()}:o&&o.isVector2?t.uniforms[r]={type:"v2",value:o.toArray()}:o&&o.isVector3?t.uniforms[r]={type:"v3",value:o.toArray()}:o&&o.isVector4?t.uniforms[r]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?t.uniforms[r]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?t.uniforms[r]={type:"m4",value:o.toArray()}:t.uniforms[r]={value:o}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const n={};for(const r in this.extensions)this.extensions[r]===!0&&(n[r]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}}class ll extends Et{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new rt,this.projectionMatrix=new rt,this.projectionMatrixInverse=new rt,this.coordinateSystem=un}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const vn=new U,lo=new Ve,co=new Ve;class Ut extends ll{constructor(e=50,t=1,n=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=r,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=Ps*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(gr*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Ps*2*Math.atan(Math.tan(gr*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){vn.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(vn.x,vn.y).multiplyScalar(-e/vn.z),vn.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(vn.x,vn.y).multiplyScalar(-e/vn.z)}getViewSize(e,t){return this.getViewBounds(e,lo,co),t.subVectors(co,lo)}setViewOffset(e,t,n,r,s,o){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=s,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(gr*.5*this.fov)/this.zoom,n=2*t,r=this.aspect*n,s=-.5*r;const o=this.view;if(this.view!==null&&this.view.enabled){const l=o.fullWidth,c=o.fullHeight;s+=o.offsetX*r/l,t-=o.offsetY*n/c,r*=o.width/l,n*=o.height/c}const a=this.filmOffset;a!==0&&(s+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(s,s+r,t,t-n,e,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}const oi=-90,li=1;class Uu extends Et{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;const r=new Ut(oi,li,e,t);r.layers=this.layers,this.add(r);const s=new Ut(oi,li,e,t);s.layers=this.layers,this.add(s);const o=new Ut(oi,li,e,t);o.layers=this.layers,this.add(o);const a=new Ut(oi,li,e,t);a.layers=this.layers,this.add(a);const l=new Ut(oi,li,e,t);l.layers=this.layers,this.add(l);const c=new Ut(oi,li,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[n,r,s,o,a,l]=t;for(const c of t)this.remove(c);if(e===un)n.up.set(0,1,0),n.lookAt(1,0,0),r.up.set(0,1,0),r.lookAt(-1,0,0),s.up.set(0,0,-1),s.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===br)n.up.set(0,-1,0),n.lookAt(-1,0,0),r.up.set(0,-1,0),r.lookAt(1,0,0),s.up.set(0,0,1),s.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:n,activeMipmapLevel:r}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[s,o,a,l,c,u]=this.children,h=e.getRenderTarget(),p=e.getActiveCubeFace(),m=e.getActiveMipmapLevel(),_=e.xr.enabled;e.xr.enabled=!1;const g=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,e.setRenderTarget(n,0,r),e.render(t,s),e.setRenderTarget(n,1,r),e.render(t,o),e.setRenderTarget(n,2,r),e.render(t,a),e.setRenderTarget(n,3,r),e.render(t,l),e.setRenderTarget(n,4,r),e.render(t,c),n.texture.generateMipmaps=g,e.setRenderTarget(n,5,r),e.render(t,u),e.setRenderTarget(h,p,m),e.xr.enabled=_,n.texture.needsPMREMUpdate=!0}}class cl extends Rt{constructor(e,t,n,r,s,o,a,l,c,u){e=e!==void 0?e:[],t=t!==void 0?t:gi,super(e,t,n,r,s,o,a,l,c,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class Iu extends Xn{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const n={width:e,height:e,depth:1},r=[n,n,n,n,n,n];this.texture=new cl(r,t.mapping,t.wrapS,t.wrapT,t.magFilter,t.minFilter,t.format,t.type,t.anisotropy,t.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=t.generateMipmaps!==void 0?t.generateMipmaps:!1,this.texture.minFilter=t.minFilter!==void 0?t.minFilter:Tt}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const n={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},r=new yi(5,5,5),s=new An({name:"CubemapFromEquirect",uniforms:xi(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:wt,blending:Sn});s.uniforms.tEquirect.value=t;const o=new Nt(r,s),a=t.minFilter;return t.minFilter===Hn&&(t.minFilter=Tt),new Uu(1,10,this).update(e,o),t.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(e,t,n,r){const s=e.getRenderTarget();for(let o=0;o<6;o++)e.setRenderTarget(this,o),e.clear(t,n,r);e.setRenderTarget(s)}}const us=new U,Nu=new U,Fu=new Ie;class On{constructor(e=new U(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,r){return this.normal.set(e,t,n),this.constant=r,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){const r=us.subVectors(n,t).cross(Nu.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(r,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){const n=e.delta(us),r=this.normal.dot(n);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const s=-(e.start.dot(this.normal)+this.constant)/r;return s<0||s>1?null:t.copy(e.start).addScaledVector(n,s)}intersectsLine(e){const t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const n=t||Fu.getNormalMatrix(e),r=this.coplanarPoint(us).applyMatrix4(e),s=this.normal.applyMatrix3(n).normalize();return this.constant=-r.dot(s),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const In=new Oi,or=new U;class ul{constructor(e=new On,t=new On,n=new On,r=new On,s=new On,o=new On){this.planes=[e,t,n,r,s,o]}set(e,t,n,r,s,o){const a=this.planes;return a[0].copy(e),a[1].copy(t),a[2].copy(n),a[3].copy(r),a[4].copy(s),a[5].copy(o),this}copy(e){const t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=un){const n=this.planes,r=e.elements,s=r[0],o=r[1],a=r[2],l=r[3],c=r[4],u=r[5],h=r[6],p=r[7],m=r[8],_=r[9],g=r[10],d=r[11],f=r[12],b=r[13],M=r[14],y=r[15];if(n[0].setComponents(l-s,p-c,d-m,y-f).normalize(),n[1].setComponents(l+s,p+c,d+m,y+f).normalize(),n[2].setComponents(l+o,p+u,d+_,y+b).normalize(),n[3].setComponents(l-o,p-u,d-_,y-b).normalize(),n[4].setComponents(l-a,p-h,d-g,y-M).normalize(),t===un)n[5].setComponents(l+a,p+h,d+g,y+M).normalize();else if(t===br)n[5].setComponents(a,h,g,M).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),In.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),In.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(In)}intersectsSprite(e){return In.center.set(0,0,0),In.radius=.7071067811865476,In.applyMatrix4(e.matrixWorld),this.intersectsSphere(In)}intersectsSphere(e){const t=this.planes,n=e.center,r=-e.radius;for(let s=0;s<6;s++)if(t[s].distanceToPoint(n)<r)return!1;return!0}intersectsBox(e){const t=this.planes;for(let n=0;n<6;n++){const r=t[n];if(or.x=r.normal.x>0?e.max.x:e.min.x,or.y=r.normal.y>0?e.max.y:e.min.y,or.z=r.normal.z>0?e.max.z:e.min.z,r.distanceToPoint(or)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}function hl(){let i=null,e=!1,t=null,n=null;function r(s,o){t(s,o),n=i.requestAnimationFrame(r)}return{start:function(){e!==!0&&t!==null&&(n=i.requestAnimationFrame(r),e=!0)},stop:function(){i.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(s){t=s},setContext:function(s){i=s}}}function Ou(i,e){const t=e.isWebGL2,n=new WeakMap;function r(c,u){const h=c.array,p=c.usage,m=h.byteLength,_=i.createBuffer();i.bindBuffer(u,_),i.bufferData(u,h,p),c.onUploadCallback();let g;if(h instanceof Float32Array)g=i.FLOAT;else if(h instanceof Uint16Array)if(c.isFloat16BufferAttribute)if(t)g=i.HALF_FLOAT;else throw new Error("THREE.WebGLAttributes: Usage of Float16BufferAttribute requires WebGL2.");else g=i.UNSIGNED_SHORT;else if(h instanceof Int16Array)g=i.SHORT;else if(h instanceof Uint32Array)g=i.UNSIGNED_INT;else if(h instanceof Int32Array)g=i.INT;else if(h instanceof Int8Array)g=i.BYTE;else if(h instanceof Uint8Array)g=i.UNSIGNED_BYTE;else if(h instanceof Uint8ClampedArray)g=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+h);return{buffer:_,type:g,bytesPerElement:h.BYTES_PER_ELEMENT,version:c.version,size:m}}function s(c,u,h){const p=u.array,m=u._updateRange,_=u.updateRanges;if(i.bindBuffer(h,c),m.count===-1&&_.length===0&&i.bufferSubData(h,0,p),_.length!==0){for(let g=0,d=_.length;g<d;g++){const f=_[g];t?i.bufferSubData(h,f.start*p.BYTES_PER_ELEMENT,p,f.start,f.count):i.bufferSubData(h,f.start*p.BYTES_PER_ELEMENT,p.subarray(f.start,f.start+f.count))}u.clearUpdateRanges()}m.count!==-1&&(t?i.bufferSubData(h,m.offset*p.BYTES_PER_ELEMENT,p,m.offset,m.count):i.bufferSubData(h,m.offset*p.BYTES_PER_ELEMENT,p.subarray(m.offset,m.offset+m.count)),m.count=-1),u.onUploadCallback()}function o(c){return c.isInterleavedBufferAttribute&&(c=c.data),n.get(c)}function a(c){c.isInterleavedBufferAttribute&&(c=c.data);const u=n.get(c);u&&(i.deleteBuffer(u.buffer),n.delete(c))}function l(c,u){if(c.isGLBufferAttribute){const p=n.get(c);(!p||p.version<c.version)&&n.set(c,{buffer:c.buffer,type:c.type,bytesPerElement:c.elementSize,version:c.version});return}c.isInterleavedBufferAttribute&&(c=c.data);const h=n.get(c);if(h===void 0)n.set(c,r(c,u));else if(h.version<c.version){if(h.size!==c.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");s(h.buffer,c,u),h.version=c.version}}return{get:o,remove:a,update:l}}class Bi extends Ct{constructor(e=1,t=1,n=1,r=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:r};const s=e/2,o=t/2,a=Math.floor(n),l=Math.floor(r),c=a+1,u=l+1,h=e/a,p=t/l,m=[],_=[],g=[],d=[];for(let f=0;f<u;f++){const b=f*p-o;for(let M=0;M<c;M++){const y=M*h-s;_.push(y,-b,0),g.push(0,0,1),d.push(M/a),d.push(1-f/l)}}for(let f=0;f<l;f++)for(let b=0;b<a;b++){const M=b+c*f,y=b+c*(f+1),P=b+1+c*(f+1),w=b+1+c*f;m.push(M,y,w),m.push(y,P,w)}this.setIndex(m),this.setAttribute("position",new ot(_,3)),this.setAttribute("normal",new ot(g,3)),this.setAttribute("uv",new ot(d,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Bi(e.width,e.height,e.widthSegments,e.heightSegments)}}var Bu=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,zu=`#ifdef USE_ALPHAHASH
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
#endif`,Gu=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Hu=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,ku=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Vu=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Wu=`#ifdef USE_AOMAP
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
#endif`,Xu=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,qu=`#ifdef USE_BATCHING
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
#endif`,Yu=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( batchId );
#endif`,$u=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Ku=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Zu=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,ju=`#ifdef USE_IRIDESCENCE
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
#endif`,Ju=`#ifdef USE_BUMPMAP
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
#endif`,Qu=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,eh=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,th=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,nh=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,ih=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,rh=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,sh=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )
	varying vec3 vColor;
#endif`,ah=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif`,oh=`#define PI 3.141592653589793
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
} // validated`,lh=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,ch=`vec3 transformedNormal = objectNormal;
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
#endif`,uh=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,hh=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,dh=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,fh=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,ph="gl_FragColor = linearToOutputTexel( gl_FragColor );",mh=`
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
}`,gh=`#ifdef USE_ENVMAP
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
#endif`,_h=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,vh=`#ifdef USE_ENVMAP
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
#endif`,xh=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,Mh=`#ifdef USE_ENVMAP
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
#endif`,Sh=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,yh=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Eh=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,bh=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Th=`#ifdef USE_GRADIENTMAP
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
}`,Ah=`#ifdef USE_LIGHTMAP
	vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
	vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
	reflectedLight.indirectDiffuse += lightMapIrradiance;
#endif`,wh=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Rh=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Ch=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Ph=`uniform bool receiveShadow;
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
#endif`,Lh=`#ifdef USE_ENVMAP
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
#endif`,Dh=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Uh=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Ih=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Nh=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Fh=`PhysicalMaterial material;
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
#endif`,Oh=`struct PhysicalMaterial {
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
}`,Bh=`
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
#endif`,zh=`#if defined( RE_IndirectDiffuse )
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
#endif`,Gh=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Hh=`#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )
	gl_FragDepthEXT = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,kh=`#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Vh=`#ifdef USE_LOGDEPTHBUF
	#ifdef USE_LOGDEPTHBUF_EXT
		varying float vFragDepth;
		varying float vIsPerspective;
	#else
		uniform float logDepthBufFC;
	#endif
#endif`,Wh=`#ifdef USE_LOGDEPTHBUF
	#ifdef USE_LOGDEPTHBUF_EXT
		vFragDepth = 1.0 + gl_Position.w;
		vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
	#else
		if ( isPerspectiveMatrix( projectionMatrix ) ) {
			gl_Position.z = log2( max( EPSILON, gl_Position.w + 1.0 ) ) * logDepthBufFC - 1.0;
			gl_Position.z *= gl_Position.w;
		}
	#endif
#endif`,Xh=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );
	
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,qh=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Yh=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,$h=`#if defined( USE_POINTS_UV )
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
#endif`,Kh=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Zh=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,jh=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[MORPHTARGETS_COUNT];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Jh=`#if defined( USE_MORPHCOLORS ) && defined( MORPHTARGETS_TEXTURE )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Qh=`#ifdef USE_MORPHNORMALS
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
#endif`,ed=`#ifdef USE_MORPHTARGETS
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
#endif`,td=`#ifdef USE_MORPHTARGETS
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
#endif`,nd=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,id=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,rd=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,sd=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,ad=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,od=`#ifdef USE_NORMALMAP
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
#endif`,ld=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,cd=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,ud=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,hd=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,dd=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,fd=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,pd=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,md=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,gd=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,_d=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,vd=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,xd=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Md=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,Sd=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,yd=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,Ed=`float getShadowMask() {
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
}`,bd=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Td=`#ifdef USE_SKINNING
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
#endif`,Ad=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,wd=`#ifdef USE_SKINNING
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
#endif`,Rd=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,Cd=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Pd=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Ld=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,Dd=`#ifdef USE_TRANSMISSION
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
#endif`,Ud=`#ifdef USE_TRANSMISSION
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
#endif`,Id=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Nd=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Fd=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Od=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const Bd=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,zd=`uniform sampler2D t2D;
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
}`,Gd=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Hd=`#ifdef ENVMAP_TYPE_CUBE
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
}`,kd=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Vd=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Wd=`#include <common>
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
}`,Xd=`#if DEPTH_PACKING == 3200
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
}`,qd=`#define DISTANCE
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
}`,Yd=`#define DISTANCE
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
}`,$d=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Kd=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Zd=`uniform float scale;
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
}`,jd=`uniform vec3 diffuse;
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
}`,Jd=`#include <common>
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
}`,Qd=`uniform vec3 diffuse;
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
}`,ef=`#define LAMBERT
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
}`,tf=`#define LAMBERT
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
}`,nf=`#define MATCAP
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
}`,rf=`#define MATCAP
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
}`,sf=`#define NORMAL
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
}`,af=`#define NORMAL
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
}`,of=`#define PHONG
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
}`,lf=`#define PHONG
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
}`,cf=`#define STANDARD
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
}`,uf=`#define STANDARD
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
}`,hf=`#define TOON
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
}`,df=`#define TOON
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
}`,ff=`uniform float size;
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
}`,pf=`uniform vec3 diffuse;
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
}`,mf=`#include <common>
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
}`,gf=`uniform vec3 color;
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
}`,_f=`uniform float rotation;
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
}`,vf=`uniform vec3 diffuse;
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
}`,Ue={alphahash_fragment:Bu,alphahash_pars_fragment:zu,alphamap_fragment:Gu,alphamap_pars_fragment:Hu,alphatest_fragment:ku,alphatest_pars_fragment:Vu,aomap_fragment:Wu,aomap_pars_fragment:Xu,batching_pars_vertex:qu,batching_vertex:Yu,begin_vertex:$u,beginnormal_vertex:Ku,bsdfs:Zu,iridescence_fragment:ju,bumpmap_pars_fragment:Ju,clipping_planes_fragment:Qu,clipping_planes_pars_fragment:eh,clipping_planes_pars_vertex:th,clipping_planes_vertex:nh,color_fragment:ih,color_pars_fragment:rh,color_pars_vertex:sh,color_vertex:ah,common:oh,cube_uv_reflection_fragment:lh,defaultnormal_vertex:ch,displacementmap_pars_vertex:uh,displacementmap_vertex:hh,emissivemap_fragment:dh,emissivemap_pars_fragment:fh,colorspace_fragment:ph,colorspace_pars_fragment:mh,envmap_fragment:gh,envmap_common_pars_fragment:_h,envmap_pars_fragment:vh,envmap_pars_vertex:xh,envmap_physical_pars_fragment:Lh,envmap_vertex:Mh,fog_vertex:Sh,fog_pars_vertex:yh,fog_fragment:Eh,fog_pars_fragment:bh,gradientmap_pars_fragment:Th,lightmap_fragment:Ah,lightmap_pars_fragment:wh,lights_lambert_fragment:Rh,lights_lambert_pars_fragment:Ch,lights_pars_begin:Ph,lights_toon_fragment:Dh,lights_toon_pars_fragment:Uh,lights_phong_fragment:Ih,lights_phong_pars_fragment:Nh,lights_physical_fragment:Fh,lights_physical_pars_fragment:Oh,lights_fragment_begin:Bh,lights_fragment_maps:zh,lights_fragment_end:Gh,logdepthbuf_fragment:Hh,logdepthbuf_pars_fragment:kh,logdepthbuf_pars_vertex:Vh,logdepthbuf_vertex:Wh,map_fragment:Xh,map_pars_fragment:qh,map_particle_fragment:Yh,map_particle_pars_fragment:$h,metalnessmap_fragment:Kh,metalnessmap_pars_fragment:Zh,morphinstance_vertex:jh,morphcolor_vertex:Jh,morphnormal_vertex:Qh,morphtarget_pars_vertex:ed,morphtarget_vertex:td,normal_fragment_begin:nd,normal_fragment_maps:id,normal_pars_fragment:rd,normal_pars_vertex:sd,normal_vertex:ad,normalmap_pars_fragment:od,clearcoat_normal_fragment_begin:ld,clearcoat_normal_fragment_maps:cd,clearcoat_pars_fragment:ud,iridescence_pars_fragment:hd,opaque_fragment:dd,packing:fd,premultiplied_alpha_fragment:pd,project_vertex:md,dithering_fragment:gd,dithering_pars_fragment:_d,roughnessmap_fragment:vd,roughnessmap_pars_fragment:xd,shadowmap_pars_fragment:Md,shadowmap_pars_vertex:Sd,shadowmap_vertex:yd,shadowmask_pars_fragment:Ed,skinbase_vertex:bd,skinning_pars_vertex:Td,skinning_vertex:Ad,skinnormal_vertex:wd,specularmap_fragment:Rd,specularmap_pars_fragment:Cd,tonemapping_fragment:Pd,tonemapping_pars_fragment:Ld,transmission_fragment:Dd,transmission_pars_fragment:Ud,uv_pars_fragment:Id,uv_pars_vertex:Nd,uv_vertex:Fd,worldpos_vertex:Od,background_vert:Bd,background_frag:zd,backgroundCube_vert:Gd,backgroundCube_frag:Hd,cube_vert:kd,cube_frag:Vd,depth_vert:Wd,depth_frag:Xd,distanceRGBA_vert:qd,distanceRGBA_frag:Yd,equirect_vert:$d,equirect_frag:Kd,linedashed_vert:Zd,linedashed_frag:jd,meshbasic_vert:Jd,meshbasic_frag:Qd,meshlambert_vert:ef,meshlambert_frag:tf,meshmatcap_vert:nf,meshmatcap_frag:rf,meshnormal_vert:sf,meshnormal_frag:af,meshphong_vert:of,meshphong_frag:lf,meshphysical_vert:cf,meshphysical_frag:uf,meshtoon_vert:hf,meshtoon_frag:df,points_vert:ff,points_frag:pf,shadow_vert:mf,shadow_frag:gf,sprite_vert:_f,sprite_frag:vf},ne={common:{diffuse:{value:new We(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Ie},alphaMap:{value:null},alphaMapTransform:{value:new Ie},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Ie}},envmap:{envMap:{value:null},envMapRotation:{value:new Ie},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Ie}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Ie}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Ie},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Ie},normalScale:{value:new Ve(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Ie},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Ie}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Ie}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Ie}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new We(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new We(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Ie},alphaTest:{value:0},uvTransform:{value:new Ie}},sprite:{diffuse:{value:new We(16777215)},opacity:{value:1},center:{value:new Ve(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Ie},alphaMap:{value:null},alphaMapTransform:{value:new Ie},alphaTest:{value:0}}},jt={basic:{uniforms:Mt([ne.common,ne.specularmap,ne.envmap,ne.aomap,ne.lightmap,ne.fog]),vertexShader:Ue.meshbasic_vert,fragmentShader:Ue.meshbasic_frag},lambert:{uniforms:Mt([ne.common,ne.specularmap,ne.envmap,ne.aomap,ne.lightmap,ne.emissivemap,ne.bumpmap,ne.normalmap,ne.displacementmap,ne.fog,ne.lights,{emissive:{value:new We(0)}}]),vertexShader:Ue.meshlambert_vert,fragmentShader:Ue.meshlambert_frag},phong:{uniforms:Mt([ne.common,ne.specularmap,ne.envmap,ne.aomap,ne.lightmap,ne.emissivemap,ne.bumpmap,ne.normalmap,ne.displacementmap,ne.fog,ne.lights,{emissive:{value:new We(0)},specular:{value:new We(1118481)},shininess:{value:30}}]),vertexShader:Ue.meshphong_vert,fragmentShader:Ue.meshphong_frag},standard:{uniforms:Mt([ne.common,ne.envmap,ne.aomap,ne.lightmap,ne.emissivemap,ne.bumpmap,ne.normalmap,ne.displacementmap,ne.roughnessmap,ne.metalnessmap,ne.fog,ne.lights,{emissive:{value:new We(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Ue.meshphysical_vert,fragmentShader:Ue.meshphysical_frag},toon:{uniforms:Mt([ne.common,ne.aomap,ne.lightmap,ne.emissivemap,ne.bumpmap,ne.normalmap,ne.displacementmap,ne.gradientmap,ne.fog,ne.lights,{emissive:{value:new We(0)}}]),vertexShader:Ue.meshtoon_vert,fragmentShader:Ue.meshtoon_frag},matcap:{uniforms:Mt([ne.common,ne.bumpmap,ne.normalmap,ne.displacementmap,ne.fog,{matcap:{value:null}}]),vertexShader:Ue.meshmatcap_vert,fragmentShader:Ue.meshmatcap_frag},points:{uniforms:Mt([ne.points,ne.fog]),vertexShader:Ue.points_vert,fragmentShader:Ue.points_frag},dashed:{uniforms:Mt([ne.common,ne.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Ue.linedashed_vert,fragmentShader:Ue.linedashed_frag},depth:{uniforms:Mt([ne.common,ne.displacementmap]),vertexShader:Ue.depth_vert,fragmentShader:Ue.depth_frag},normal:{uniforms:Mt([ne.common,ne.bumpmap,ne.normalmap,ne.displacementmap,{opacity:{value:1}}]),vertexShader:Ue.meshnormal_vert,fragmentShader:Ue.meshnormal_frag},sprite:{uniforms:Mt([ne.sprite,ne.fog]),vertexShader:Ue.sprite_vert,fragmentShader:Ue.sprite_frag},background:{uniforms:{uvTransform:{value:new Ie},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Ue.background_vert,fragmentShader:Ue.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Ie}},vertexShader:Ue.backgroundCube_vert,fragmentShader:Ue.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Ue.cube_vert,fragmentShader:Ue.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Ue.equirect_vert,fragmentShader:Ue.equirect_frag},distanceRGBA:{uniforms:Mt([ne.common,ne.displacementmap,{referencePosition:{value:new U},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Ue.distanceRGBA_vert,fragmentShader:Ue.distanceRGBA_frag},shadow:{uniforms:Mt([ne.lights,ne.fog,{color:{value:new We(0)},opacity:{value:1}}]),vertexShader:Ue.shadow_vert,fragmentShader:Ue.shadow_frag}};jt.physical={uniforms:Mt([jt.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Ie},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Ie},clearcoatNormalScale:{value:new Ve(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Ie},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Ie},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Ie},sheen:{value:0},sheenColor:{value:new We(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Ie},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Ie},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Ie},transmissionSamplerSize:{value:new Ve},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Ie},attenuationDistance:{value:0},attenuationColor:{value:new We(0)},specularColor:{value:new We(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Ie},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Ie},anisotropyVector:{value:new Ve},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Ie}}]),vertexShader:Ue.meshphysical_vert,fragmentShader:Ue.meshphysical_frag};const lr={r:0,b:0,g:0},Nn=new dn,xf=new rt;function Mf(i,e,t,n,r,s,o){const a=new We(0);let l=s===!0?0:1,c,u,h=null,p=0,m=null;function _(d,f){let b=!1,M=f.isScene===!0?f.background:null;M&&M.isTexture&&(M=(f.backgroundBlurriness>0?t:e).get(M)),M===null?g(a,l):M&&M.isColor&&(g(M,1),b=!0);const y=i.xr.getEnvironmentBlendMode();y==="additive"?n.buffers.color.setClear(0,0,0,1,o):y==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,o),(i.autoClear||b)&&i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil),M&&(M.isCubeTexture||M.mapping===Rr)?(u===void 0&&(u=new Nt(new yi(1,1,1),new An({name:"BackgroundCubeMaterial",uniforms:xi(jt.backgroundCube.uniforms),vertexShader:jt.backgroundCube.vertexShader,fragmentShader:jt.backgroundCube.fragmentShader,side:wt,depthTest:!1,depthWrite:!1,fog:!1})),u.geometry.deleteAttribute("normal"),u.geometry.deleteAttribute("uv"),u.onBeforeRender=function(P,w,A){this.matrixWorld.copyPosition(A.matrixWorld)},Object.defineProperty(u.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),r.update(u)),Nn.copy(f.backgroundRotation),Nn.x*=-1,Nn.y*=-1,Nn.z*=-1,M.isCubeTexture&&M.isRenderTargetTexture===!1&&(Nn.y*=-1,Nn.z*=-1),u.material.uniforms.envMap.value=M,u.material.uniforms.flipEnvMap.value=M.isCubeTexture&&M.isRenderTargetTexture===!1?-1:1,u.material.uniforms.backgroundBlurriness.value=f.backgroundBlurriness,u.material.uniforms.backgroundIntensity.value=f.backgroundIntensity,u.material.uniforms.backgroundRotation.value.setFromMatrix4(xf.makeRotationFromEuler(Nn)),u.material.toneMapped=$e.getTransfer(M.colorSpace)!==je,(h!==M||p!==M.version||m!==i.toneMapping)&&(u.material.needsUpdate=!0,h=M,p=M.version,m=i.toneMapping),u.layers.enableAll(),d.unshift(u,u.geometry,u.material,0,0,null)):M&&M.isTexture&&(c===void 0&&(c=new Nt(new Bi(2,2),new An({name:"BackgroundMaterial",uniforms:xi(jt.background.uniforms),vertexShader:jt.background.vertexShader,fragmentShader:jt.background.fragmentShader,side:Tn,depthTest:!1,depthWrite:!1,fog:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),r.update(c)),c.material.uniforms.t2D.value=M,c.material.uniforms.backgroundIntensity.value=f.backgroundIntensity,c.material.toneMapped=$e.getTransfer(M.colorSpace)!==je,M.matrixAutoUpdate===!0&&M.updateMatrix(),c.material.uniforms.uvTransform.value.copy(M.matrix),(h!==M||p!==M.version||m!==i.toneMapping)&&(c.material.needsUpdate=!0,h=M,p=M.version,m=i.toneMapping),c.layers.enableAll(),d.unshift(c,c.geometry,c.material,0,0,null))}function g(d,f){d.getRGB(lr,ol(i)),n.buffers.color.setClear(lr.r,lr.g,lr.b,f,o)}return{getClearColor:function(){return a},setClearColor:function(d,f=1){a.set(d),l=f,g(a,l)},getClearAlpha:function(){return l},setClearAlpha:function(d){l=d,g(a,l)},render:_}}function Sf(i,e,t,n){const r=i.getParameter(i.MAX_VERTEX_ATTRIBS),s=n.isWebGL2?null:e.get("OES_vertex_array_object"),o=n.isWebGL2||s!==null,a={},l=d(null);let c=l,u=!1;function h(R,V,H,K,k){let X=!1;if(o){const Z=g(K,H,V);c!==Z&&(c=Z,m(c.object)),X=f(R,K,H,k),X&&b(R,K,H,k)}else{const Z=V.wireframe===!0;(c.geometry!==K.id||c.program!==H.id||c.wireframe!==Z)&&(c.geometry=K.id,c.program=H.id,c.wireframe=Z,X=!0)}k!==null&&t.update(k,i.ELEMENT_ARRAY_BUFFER),(X||u)&&(u=!1,I(R,V,H,K),k!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,t.get(k).buffer))}function p(){return n.isWebGL2?i.createVertexArray():s.createVertexArrayOES()}function m(R){return n.isWebGL2?i.bindVertexArray(R):s.bindVertexArrayOES(R)}function _(R){return n.isWebGL2?i.deleteVertexArray(R):s.deleteVertexArrayOES(R)}function g(R,V,H){const K=H.wireframe===!0;let k=a[R.id];k===void 0&&(k={},a[R.id]=k);let X=k[V.id];X===void 0&&(X={},k[V.id]=X);let Z=X[K];return Z===void 0&&(Z=d(p()),X[K]=Z),Z}function d(R){const V=[],H=[],K=[];for(let k=0;k<r;k++)V[k]=0,H[k]=0,K[k]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:V,enabledAttributes:H,attributeDivisors:K,object:R,attributes:{},index:null}}function f(R,V,H,K){const k=c.attributes,X=V.attributes;let Z=0;const ie=H.getAttributes();for(const he in ie)if(ie[he].location>=0){const z=k[he];let J=X[he];if(J===void 0&&(he==="instanceMatrix"&&R.instanceMatrix&&(J=R.instanceMatrix),he==="instanceColor"&&R.instanceColor&&(J=R.instanceColor)),z===void 0||z.attribute!==J||J&&z.data!==J.data)return!0;Z++}return c.attributesNum!==Z||c.index!==K}function b(R,V,H,K){const k={},X=V.attributes;let Z=0;const ie=H.getAttributes();for(const he in ie)if(ie[he].location>=0){let z=X[he];z===void 0&&(he==="instanceMatrix"&&R.instanceMatrix&&(z=R.instanceMatrix),he==="instanceColor"&&R.instanceColor&&(z=R.instanceColor));const J={};J.attribute=z,z&&z.data&&(J.data=z.data),k[he]=J,Z++}c.attributes=k,c.attributesNum=Z,c.index=K}function M(){const R=c.newAttributes;for(let V=0,H=R.length;V<H;V++)R[V]=0}function y(R){P(R,0)}function P(R,V){const H=c.newAttributes,K=c.enabledAttributes,k=c.attributeDivisors;H[R]=1,K[R]===0&&(i.enableVertexAttribArray(R),K[R]=1),k[R]!==V&&((n.isWebGL2?i:e.get("ANGLE_instanced_arrays"))[n.isWebGL2?"vertexAttribDivisor":"vertexAttribDivisorANGLE"](R,V),k[R]=V)}function w(){const R=c.newAttributes,V=c.enabledAttributes;for(let H=0,K=V.length;H<K;H++)V[H]!==R[H]&&(i.disableVertexAttribArray(H),V[H]=0)}function A(R,V,H,K,k,X,Z){Z===!0?i.vertexAttribIPointer(R,V,H,k,X):i.vertexAttribPointer(R,V,H,K,k,X)}function I(R,V,H,K){if(n.isWebGL2===!1&&(R.isInstancedMesh||K.isInstancedBufferGeometry)&&e.get("ANGLE_instanced_arrays")===null)return;M();const k=K.attributes,X=H.getAttributes(),Z=V.defaultAttributeValues;for(const ie in X){const he=X[ie];if(he.location>=0){let Ce=k[ie];if(Ce===void 0&&(ie==="instanceMatrix"&&R.instanceMatrix&&(Ce=R.instanceMatrix),ie==="instanceColor"&&R.instanceColor&&(Ce=R.instanceColor)),Ce!==void 0){const z=Ce.normalized,J=Ce.itemSize,ce=t.get(Ce);if(ce===void 0)continue;const Ee=ce.buffer,ge=ce.type,de=ce.bytesPerElement,Xe=n.isWebGL2===!0&&(ge===i.INT||ge===i.UNSIGNED_INT||Ce.gpuType===Xo);if(Ce.isInterleavedBufferAttribute){const be=Ce.data,D=be.stride,dt=Ce.offset;if(be.isInstancedInterleavedBuffer){for(let ve=0;ve<he.locationSize;ve++)P(he.location+ve,be.meshPerAttribute);R.isInstancedMesh!==!0&&K._maxInstanceCount===void 0&&(K._maxInstanceCount=be.meshPerAttribute*be.count)}else for(let ve=0;ve<he.locationSize;ve++)y(he.location+ve);i.bindBuffer(i.ARRAY_BUFFER,Ee);for(let ve=0;ve<he.locationSize;ve++)A(he.location+ve,J/he.locationSize,ge,z,D*de,(dt+J/he.locationSize*ve)*de,Xe)}else{if(Ce.isInstancedBufferAttribute){for(let be=0;be<he.locationSize;be++)P(he.location+be,Ce.meshPerAttribute);R.isInstancedMesh!==!0&&K._maxInstanceCount===void 0&&(K._maxInstanceCount=Ce.meshPerAttribute*Ce.count)}else for(let be=0;be<he.locationSize;be++)y(he.location+be);i.bindBuffer(i.ARRAY_BUFFER,Ee);for(let be=0;be<he.locationSize;be++)A(he.location+be,J/he.locationSize,ge,z,J*de,J/he.locationSize*be*de,Xe)}}else if(Z!==void 0){const z=Z[ie];if(z!==void 0)switch(z.length){case 2:i.vertexAttrib2fv(he.location,z);break;case 3:i.vertexAttrib3fv(he.location,z);break;case 4:i.vertexAttrib4fv(he.location,z);break;default:i.vertexAttrib1fv(he.location,z)}}}}w()}function q(){Y();for(const R in a){const V=a[R];for(const H in V){const K=V[H];for(const k in K)_(K[k].object),delete K[k];delete V[H]}delete a[R]}}function x(R){if(a[R.id]===void 0)return;const V=a[R.id];for(const H in V){const K=V[H];for(const k in K)_(K[k].object),delete K[k];delete V[H]}delete a[R.id]}function T(R){for(const V in a){const H=a[V];if(H[R.id]===void 0)continue;const K=H[R.id];for(const k in K)_(K[k].object),delete K[k];delete H[R.id]}}function Y(){$(),u=!0,c!==l&&(c=l,m(c.object))}function $(){l.geometry=null,l.program=null,l.wireframe=!1}return{setup:h,reset:Y,resetDefaultState:$,dispose:q,releaseStatesOfGeometry:x,releaseStatesOfProgram:T,initAttributes:M,enableAttribute:y,disableUnusedAttributes:w}}function yf(i,e,t,n){const r=n.isWebGL2;let s;function o(u){s=u}function a(u,h){i.drawArrays(s,u,h),t.update(h,s,1)}function l(u,h,p){if(p===0)return;let m,_;if(r)m=i,_="drawArraysInstanced";else if(m=e.get("ANGLE_instanced_arrays"),_="drawArraysInstancedANGLE",m===null){console.error("THREE.WebGLBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.");return}m[_](s,u,h,p),t.update(h,s,p)}function c(u,h,p){if(p===0)return;const m=e.get("WEBGL_multi_draw");if(m===null)for(let _=0;_<p;_++)this.render(u[_],h[_]);else{m.multiDrawArraysWEBGL(s,u,0,h,0,p);let _=0;for(let g=0;g<p;g++)_+=h[g];t.update(_,s,1)}}this.setMode=o,this.render=a,this.renderInstances=l,this.renderMultiDraw=c}function Ef(i,e,t){let n;function r(){if(n!==void 0)return n;if(e.has("EXT_texture_filter_anisotropic")===!0){const A=e.get("EXT_texture_filter_anisotropic");n=i.getParameter(A.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else n=0;return n}function s(A){if(A==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";A="mediump"}return A==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}const o=typeof WebGL2RenderingContext<"u"&&i.constructor.name==="WebGL2RenderingContext";let a=t.precision!==void 0?t.precision:"highp";const l=s(a);l!==a&&(console.warn("THREE.WebGLRenderer:",a,"not supported, using",l,"instead."),a=l);const c=o||e.has("WEBGL_draw_buffers"),u=t.logarithmicDepthBuffer===!0,h=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),p=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),m=i.getParameter(i.MAX_TEXTURE_SIZE),_=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),g=i.getParameter(i.MAX_VERTEX_ATTRIBS),d=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),f=i.getParameter(i.MAX_VARYING_VECTORS),b=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),M=p>0,y=o||e.has("OES_texture_float"),P=M&&y,w=o?i.getParameter(i.MAX_SAMPLES):0;return{isWebGL2:o,drawBuffers:c,getMaxAnisotropy:r,getMaxPrecision:s,precision:a,logarithmicDepthBuffer:u,maxTextures:h,maxVertexTextures:p,maxTextureSize:m,maxCubemapSize:_,maxAttributes:g,maxVertexUniforms:d,maxVaryings:f,maxFragmentUniforms:b,vertexTextures:M,floatFragmentTextures:y,floatVertexTextures:P,maxSamples:w}}function bf(i){const e=this;let t=null,n=0,r=!1,s=!1;const o=new On,a=new Ie,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(h,p){const m=h.length!==0||p||n!==0||r;return r=p,n=h.length,m},this.beginShadows=function(){s=!0,u(null)},this.endShadows=function(){s=!1},this.setGlobalState=function(h,p){t=u(h,p,0)},this.setState=function(h,p,m){const _=h.clippingPlanes,g=h.clipIntersection,d=h.clipShadows,f=i.get(h);if(!r||_===null||_.length===0||s&&!d)s?u(null):c();else{const b=s?0:n,M=b*4;let y=f.clippingState||null;l.value=y,y=u(_,p,M,m);for(let P=0;P!==M;++P)y[P]=t[P];f.clippingState=y,this.numIntersection=g?this.numPlanes:0,this.numPlanes+=b}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function u(h,p,m,_){const g=h!==null?h.length:0;let d=null;if(g!==0){if(d=l.value,_!==!0||d===null){const f=m+g*4,b=p.matrixWorldInverse;a.getNormalMatrix(b),(d===null||d.length<f)&&(d=new Float32Array(f));for(let M=0,y=m;M!==g;++M,y+=4)o.copy(h[M]).applyMatrix4(b,a),o.normal.toArray(d,y),d[y+3]=o.constant}l.value=d,l.needsUpdate=!0}return e.numPlanes=g,e.numIntersection=0,d}}function Tf(i){let e=new WeakMap;function t(o,a){return a===Ts?o.mapping=gi:a===As&&(o.mapping=_i),o}function n(o){if(o&&o.isTexture){const a=o.mapping;if(a===Ts||a===As)if(e.has(o)){const l=e.get(o).texture;return t(l,o.mapping)}else{const l=o.image;if(l&&l.height>0){const c=new Iu(l.height);return c.fromEquirectangularTexture(i,o),e.set(o,c),o.addEventListener("dispose",r),t(c.texture,o.mapping)}else return null}}return o}function r(o){const a=o.target;a.removeEventListener("dispose",r);const l=e.get(a);l!==void 0&&(e.delete(a),l.dispose())}function s(){e=new WeakMap}return{get:n,dispose:s}}class Af extends ll{constructor(e=-1,t=1,n=1,r=-1,s=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=r,this.near=s,this.far=o,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,r,s,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=s,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,r=(this.top+this.bottom)/2;let s=n-e,o=n+e,a=r+t,l=r-t;if(this.view!==null&&this.view.enabled){const c=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;s+=c*this.view.offsetX,o=s+c*this.view.width,a-=u*this.view.offsetY,l=a-u*this.view.height}this.projectionMatrix.makeOrthographic(s,o,a,l,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}const hi=4,uo=[.125,.215,.35,.446,.526,.582],Gn=20,hs=new Af,ho=new We;let ds=null,fs=0,ps=0;const Bn=(1+Math.sqrt(5))/2,ci=1/Bn,fo=[new U(1,1,1),new U(-1,1,1),new U(1,1,-1),new U(-1,1,-1),new U(0,Bn,ci),new U(0,Bn,-ci),new U(ci,0,Bn),new U(-ci,0,Bn),new U(Bn,ci,0),new U(-Bn,ci,0)];class po{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,n=.1,r=100){ds=this._renderer.getRenderTarget(),fs=this._renderer.getActiveCubeFace(),ps=this._renderer.getActiveMipmapLevel(),this._setSize(256);const s=this._allocateTargets();return s.depthBuffer=!0,this._sceneToCubeUV(e,n,r,s),t>0&&this._blur(s,0,0,t),this._applyPMREM(s),this._cleanup(s),s}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=_o(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=go(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(ds,fs,ps),e.scissorTest=!1,cr(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===gi||e.mapping===_i?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),ds=this._renderer.getRenderTarget(),fs=this._renderer.getActiveCubeFace(),ps=this._renderer.getActiveMipmapLevel();const n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:Tt,minFilter:Tt,generateMipmaps:!1,type:Di,format:Yt,colorSpace:wn,depthBuffer:!1},r=mo(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=mo(e,t,n);const{_lodMax:s}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=wf(s)),this._blurMaterial=Rf(s,e,t)}return r}_compileMaterial(e){const t=new Nt(this._lodPlanes[0],e);this._renderer.compile(t,hs)}_sceneToCubeUV(e,t,n,r){const a=new Ut(90,1,t,n),l=[1,-1,1,1,1,1],c=[1,1,1,-1,-1,-1],u=this._renderer,h=u.autoClear,p=u.toneMapping;u.getClearColor(ho),u.toneMapping=yn,u.autoClear=!1;const m=new ui({name:"PMREM.Background",side:wt,depthWrite:!1,depthTest:!1}),_=new Nt(new yi,m);let g=!1;const d=e.background;d?d.isColor&&(m.color.copy(d),e.background=null,g=!0):(m.color.copy(ho),g=!0);for(let f=0;f<6;f++){const b=f%3;b===0?(a.up.set(0,l[f],0),a.lookAt(c[f],0,0)):b===1?(a.up.set(0,0,l[f]),a.lookAt(0,c[f],0)):(a.up.set(0,l[f],0),a.lookAt(0,0,c[f]));const M=this._cubeSize;cr(r,b*M,f>2?M:0,M,M),u.setRenderTarget(r),g&&u.render(_,a),u.render(e,a)}_.geometry.dispose(),_.material.dispose(),u.toneMapping=p,u.autoClear=h,e.background=d}_textureToCubeUV(e,t){const n=this._renderer,r=e.mapping===gi||e.mapping===_i;r?(this._cubemapMaterial===null&&(this._cubemapMaterial=_o()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=go());const s=r?this._cubemapMaterial:this._equirectMaterial,o=new Nt(this._lodPlanes[0],s),a=s.uniforms;a.envMap.value=e;const l=this._cubeSize;cr(t,0,0,3*l,2*l),n.setRenderTarget(t),n.render(o,hs)}_applyPMREM(e){const t=this._renderer,n=t.autoClear;t.autoClear=!1;for(let r=1;r<this._lodPlanes.length;r++){const s=Math.sqrt(this._sigmas[r]*this._sigmas[r]-this._sigmas[r-1]*this._sigmas[r-1]),o=fo[(r-1)%fo.length];this._blur(e,r-1,r,s,o)}t.autoClear=n}_blur(e,t,n,r,s){const o=this._pingPongRenderTarget;this._halfBlur(e,o,t,n,r,"latitudinal",s),this._halfBlur(o,e,n,n,r,"longitudinal",s)}_halfBlur(e,t,n,r,s,o,a){const l=this._renderer,c=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const u=3,h=new Nt(this._lodPlanes[r],c),p=c.uniforms,m=this._sizeLods[n]-1,_=isFinite(s)?Math.PI/(2*m):2*Math.PI/(2*Gn-1),g=s/_,d=isFinite(s)?1+Math.floor(u*g):Gn;d>Gn&&console.warn(`sigmaRadians, ${s}, is too large and will clip, as it requested ${d} samples when the maximum is set to ${Gn}`);const f=[];let b=0;for(let A=0;A<Gn;++A){const I=A/g,q=Math.exp(-I*I/2);f.push(q),A===0?b+=q:A<d&&(b+=2*q)}for(let A=0;A<f.length;A++)f[A]=f[A]/b;p.envMap.value=e.texture,p.samples.value=d,p.weights.value=f,p.latitudinal.value=o==="latitudinal",a&&(p.poleAxis.value=a);const{_lodMax:M}=this;p.dTheta.value=_,p.mipInt.value=M-n;const y=this._sizeLods[r],P=3*y*(r>M-hi?r-M+hi:0),w=4*(this._cubeSize-y);cr(t,P,w,3*y,2*y),l.setRenderTarget(t),l.render(h,hs)}}function wf(i){const e=[],t=[],n=[];let r=i;const s=i-hi+1+uo.length;for(let o=0;o<s;o++){const a=Math.pow(2,r);t.push(a);let l=1/a;o>i-hi?l=uo[o-i+hi-1]:o===0&&(l=0),n.push(l);const c=1/(a-2),u=-c,h=1+c,p=[u,u,h,u,h,h,u,u,h,h,u,h],m=6,_=6,g=3,d=2,f=1,b=new Float32Array(g*_*m),M=new Float32Array(d*_*m),y=new Float32Array(f*_*m);for(let w=0;w<m;w++){const A=w%3*2/3-1,I=w>2?0:-1,q=[A,I,0,A+2/3,I,0,A+2/3,I+1,0,A,I,0,A+2/3,I+1,0,A,I+1,0];b.set(q,g*_*w),M.set(p,d*_*w);const x=[w,w,w,w,w,w];y.set(x,f*_*w)}const P=new Ct;P.setAttribute("position",new Gt(b,g)),P.setAttribute("uv",new Gt(M,d)),P.setAttribute("faceIndex",new Gt(y,f)),e.push(P),r>hi&&r--}return{lodPlanes:e,sizeLods:t,sigmas:n}}function mo(i,e,t){const n=new Xn(i,e,t);return n.texture.mapping=Rr,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function cr(i,e,t,n,r){i.viewport.set(e,t,n,r),i.scissor.set(e,t,n,r)}function Rf(i,e,t){const n=new Float32Array(Gn),r=new U(0,1,0);return new An({name:"SphericalGaussianBlur",defines:{n:Gn,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:r}},vertexShader:Hs(),fragmentShader:`

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
		`,blending:Sn,depthTest:!1,depthWrite:!1})}function go(){return new An({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Hs(),fragmentShader:`

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
		`,blending:Sn,depthTest:!1,depthWrite:!1})}function _o(){return new An({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Hs(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Sn,depthTest:!1,depthWrite:!1})}function Hs(){return`

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
	`}function Cf(i){let e=new WeakMap,t=null;function n(a){if(a&&a.isTexture){const l=a.mapping,c=l===Ts||l===As,u=l===gi||l===_i;if(c||u)if(a.isRenderTargetTexture&&a.needsPMREMUpdate===!0){a.needsPMREMUpdate=!1;let h=e.get(a);return t===null&&(t=new po(i)),h=c?t.fromEquirectangular(a,h):t.fromCubemap(a,h),e.set(a,h),h.texture}else{if(e.has(a))return e.get(a).texture;{const h=a.image;if(c&&h&&h.height>0||u&&h&&r(h)){t===null&&(t=new po(i));const p=c?t.fromEquirectangular(a):t.fromCubemap(a);return e.set(a,p),a.addEventListener("dispose",s),p.texture}else return null}}}return a}function r(a){let l=0;const c=6;for(let u=0;u<c;u++)a[u]!==void 0&&l++;return l===c}function s(a){const l=a.target;l.removeEventListener("dispose",s);const c=e.get(l);c!==void 0&&(e.delete(l),c.dispose())}function o(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:n,dispose:o}}function Pf(i){const e={};function t(n){if(e[n]!==void 0)return e[n];let r;switch(n){case"WEBGL_depth_texture":r=i.getExtension("WEBGL_depth_texture")||i.getExtension("MOZ_WEBGL_depth_texture")||i.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":r=i.getExtension("EXT_texture_filter_anisotropic")||i.getExtension("MOZ_EXT_texture_filter_anisotropic")||i.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":r=i.getExtension("WEBGL_compressed_texture_s3tc")||i.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":r=i.getExtension("WEBGL_compressed_texture_pvrtc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:r=i.getExtension(n)}return e[n]=r,r}return{has:function(n){return t(n)!==null},init:function(n){n.isWebGL2?(t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance")):(t("WEBGL_depth_texture"),t("OES_texture_float"),t("OES_texture_half_float"),t("OES_texture_half_float_linear"),t("OES_standard_derivatives"),t("OES_element_index_uint"),t("OES_vertex_array_object"),t("ANGLE_instanced_arrays")),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture")},get:function(n){const r=t(n);return r===null&&console.warn("THREE.WebGLRenderer: "+n+" extension not supported."),r}}}function Lf(i,e,t,n){const r={},s=new WeakMap;function o(h){const p=h.target;p.index!==null&&e.remove(p.index);for(const _ in p.attributes)e.remove(p.attributes[_]);for(const _ in p.morphAttributes){const g=p.morphAttributes[_];for(let d=0,f=g.length;d<f;d++)e.remove(g[d])}p.removeEventListener("dispose",o),delete r[p.id];const m=s.get(p);m&&(e.remove(m),s.delete(p)),n.releaseStatesOfGeometry(p),p.isInstancedBufferGeometry===!0&&delete p._maxInstanceCount,t.memory.geometries--}function a(h,p){return r[p.id]===!0||(p.addEventListener("dispose",o),r[p.id]=!0,t.memory.geometries++),p}function l(h){const p=h.attributes;for(const _ in p)e.update(p[_],i.ARRAY_BUFFER);const m=h.morphAttributes;for(const _ in m){const g=m[_];for(let d=0,f=g.length;d<f;d++)e.update(g[d],i.ARRAY_BUFFER)}}function c(h){const p=[],m=h.index,_=h.attributes.position;let g=0;if(m!==null){const b=m.array;g=m.version;for(let M=0,y=b.length;M<y;M+=3){const P=b[M+0],w=b[M+1],A=b[M+2];p.push(P,w,w,A,A,P)}}else if(_!==void 0){const b=_.array;g=_.version;for(let M=0,y=b.length/3-1;M<y;M+=3){const P=M+0,w=M+1,A=M+2;p.push(P,w,w,A,A,P)}}else return;const d=new(Qo(p)?al:sl)(p,1);d.version=g;const f=s.get(h);f&&e.remove(f),s.set(h,d)}function u(h){const p=s.get(h);if(p){const m=h.index;m!==null&&p.version<m.version&&c(h)}else c(h);return s.get(h)}return{get:a,update:l,getWireframeAttribute:u}}function Df(i,e,t,n){const r=n.isWebGL2;let s;function o(m){s=m}let a,l;function c(m){a=m.type,l=m.bytesPerElement}function u(m,_){i.drawElements(s,_,a,m*l),t.update(_,s,1)}function h(m,_,g){if(g===0)return;let d,f;if(r)d=i,f="drawElementsInstanced";else if(d=e.get("ANGLE_instanced_arrays"),f="drawElementsInstancedANGLE",d===null){console.error("THREE.WebGLIndexedBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.");return}d[f](s,_,a,m*l,g),t.update(_,s,g)}function p(m,_,g){if(g===0)return;const d=e.get("WEBGL_multi_draw");if(d===null)for(let f=0;f<g;f++)this.render(m[f]/l,_[f]);else{d.multiDrawElementsWEBGL(s,_,0,a,m,0,g);let f=0;for(let b=0;b<g;b++)f+=_[b];t.update(f,s,1)}}this.setMode=o,this.setIndex=c,this.render=u,this.renderInstances=h,this.renderMultiDraw=p}function Uf(i){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(s,o,a){switch(t.calls++,o){case i.TRIANGLES:t.triangles+=a*(s/3);break;case i.LINES:t.lines+=a*(s/2);break;case i.LINE_STRIP:t.lines+=a*(s-1);break;case i.LINE_LOOP:t.lines+=a*s;break;case i.POINTS:t.points+=a*s;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",o);break}}function r(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:r,update:n}}function If(i,e){return i[0]-e[0]}function Nf(i,e){return Math.abs(e[1])-Math.abs(i[1])}function Ff(i,e,t){const n={},r=new Float32Array(8),s=new WeakMap,o=new mt,a=[];for(let c=0;c<8;c++)a[c]=[c,0];function l(c,u,h){const p=c.morphTargetInfluences;if(e.isWebGL2===!0){const _=u.morphAttributes.position||u.morphAttributes.normal||u.morphAttributes.color,g=_!==void 0?_.length:0;let d=s.get(u);if(d===void 0||d.count!==g){let $=function(){T.dispose(),s.delete(u),u.removeEventListener("dispose",$)};var m=$;d!==void 0&&d.texture.dispose();const f=u.morphAttributes.position!==void 0,b=u.morphAttributes.normal!==void 0,M=u.morphAttributes.color!==void 0,y=u.morphAttributes.position||[],P=u.morphAttributes.normal||[],w=u.morphAttributes.color||[];let A=0;f===!0&&(A=1),b===!0&&(A=2),M===!0&&(A=3);let I=u.attributes.position.count*A,q=1;I>e.maxTextureSize&&(q=Math.ceil(I/e.maxTextureSize),I=e.maxTextureSize);const x=new Float32Array(I*q*4*g),T=new nl(x,I,q,g);T.type=ln,T.needsUpdate=!0;const Y=A*4;for(let R=0;R<g;R++){const V=y[R],H=P[R],K=w[R],k=I*q*4*R;for(let X=0;X<V.count;X++){const Z=X*Y;f===!0&&(o.fromBufferAttribute(V,X),x[k+Z+0]=o.x,x[k+Z+1]=o.y,x[k+Z+2]=o.z,x[k+Z+3]=0),b===!0&&(o.fromBufferAttribute(H,X),x[k+Z+4]=o.x,x[k+Z+5]=o.y,x[k+Z+6]=o.z,x[k+Z+7]=0),M===!0&&(o.fromBufferAttribute(K,X),x[k+Z+8]=o.x,x[k+Z+9]=o.y,x[k+Z+10]=o.z,x[k+Z+11]=K.itemSize===4?o.w:1)}}d={count:g,texture:T,size:new Ve(I,q)},s.set(u,d),u.addEventListener("dispose",$)}if(c.isInstancedMesh===!0&&c.morphTexture!==null)h.getUniforms().setValue(i,"morphTexture",c.morphTexture,t);else{let f=0;for(let M=0;M<p.length;M++)f+=p[M];const b=u.morphTargetsRelative?1:1-f;h.getUniforms().setValue(i,"morphTargetBaseInfluence",b),h.getUniforms().setValue(i,"morphTargetInfluences",p)}h.getUniforms().setValue(i,"morphTargetsTexture",d.texture,t),h.getUniforms().setValue(i,"morphTargetsTextureSize",d.size)}else{const _=p===void 0?0:p.length;let g=n[u.id];if(g===void 0||g.length!==_){g=[];for(let y=0;y<_;y++)g[y]=[y,0];n[u.id]=g}for(let y=0;y<_;y++){const P=g[y];P[0]=y,P[1]=p[y]}g.sort(Nf);for(let y=0;y<8;y++)y<_&&g[y][1]?(a[y][0]=g[y][0],a[y][1]=g[y][1]):(a[y][0]=Number.MAX_SAFE_INTEGER,a[y][1]=0);a.sort(If);const d=u.morphAttributes.position,f=u.morphAttributes.normal;let b=0;for(let y=0;y<8;y++){const P=a[y],w=P[0],A=P[1];w!==Number.MAX_SAFE_INTEGER&&A?(d&&u.getAttribute("morphTarget"+y)!==d[w]&&u.setAttribute("morphTarget"+y,d[w]),f&&u.getAttribute("morphNormal"+y)!==f[w]&&u.setAttribute("morphNormal"+y,f[w]),r[y]=A,b+=A):(d&&u.hasAttribute("morphTarget"+y)===!0&&u.deleteAttribute("morphTarget"+y),f&&u.hasAttribute("morphNormal"+y)===!0&&u.deleteAttribute("morphNormal"+y),r[y]=0)}const M=u.morphTargetsRelative?1:1-b;h.getUniforms().setValue(i,"morphTargetBaseInfluence",M),h.getUniforms().setValue(i,"morphTargetInfluences",r)}}return{update:l}}function Of(i,e,t,n){let r=new WeakMap;function s(l){const c=n.render.frame,u=l.geometry,h=e.get(l,u);if(r.get(h)!==c&&(e.update(h),r.set(h,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",a)===!1&&l.addEventListener("dispose",a),r.get(l)!==c&&(t.update(l.instanceMatrix,i.ARRAY_BUFFER),l.instanceColor!==null&&t.update(l.instanceColor,i.ARRAY_BUFFER),r.set(l,c))),l.isSkinnedMesh){const p=l.skeleton;r.get(p)!==c&&(p.update(),r.set(p,c))}return h}function o(){r=new WeakMap}function a(l){const c=l.target;c.removeEventListener("dispose",a),t.remove(c.instanceMatrix),c.instanceColor!==null&&t.remove(c.instanceColor)}return{update:s,dispose:o}}class dl extends Rt{constructor(e,t,n,r,s,o,a,l,c,u){if(u=u!==void 0?u:Wn,u!==Wn&&u!==vi)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");n===void 0&&u===Wn&&(n=Mn),n===void 0&&u===vi&&(n=Vn),super(null,r,s,o,a,l,u,n,c),this.isDepthTexture=!0,this.image={width:e,height:t},this.magFilter=a!==void 0?a:yt,this.minFilter=l!==void 0?l:yt,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}}const fl=new Rt,pl=new dl(1,1);pl.compareFunction=Jo;const ml=new nl,gl=new _u,_l=new cl,vo=[],xo=[],Mo=new Float32Array(16),So=new Float32Array(9),yo=new Float32Array(4);function Ei(i,e,t){const n=i[0];if(n<=0||n>0)return i;const r=e*t;let s=vo[r];if(s===void 0&&(s=new Float32Array(r),vo[r]=s),e!==0){n.toArray(s,0);for(let o=1,a=0;o!==e;++o)a+=t,i[o].toArray(s,a)}return s}function lt(i,e){if(i.length!==e.length)return!1;for(let t=0,n=i.length;t<n;t++)if(i[t]!==e[t])return!1;return!0}function ct(i,e){for(let t=0,n=e.length;t<n;t++)i[t]=e[t]}function Pr(i,e){let t=xo[e];t===void 0&&(t=new Int32Array(e),xo[e]=t);for(let n=0;n!==e;++n)t[n]=i.allocateTextureUnit();return t}function Bf(i,e){const t=this.cache;t[0]!==e&&(i.uniform1f(this.addr,e),t[0]=e)}function zf(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(lt(t,e))return;i.uniform2fv(this.addr,e),ct(t,e)}}function Gf(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(i.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(lt(t,e))return;i.uniform3fv(this.addr,e),ct(t,e)}}function Hf(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(lt(t,e))return;i.uniform4fv(this.addr,e),ct(t,e)}}function kf(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(lt(t,e))return;i.uniformMatrix2fv(this.addr,!1,e),ct(t,e)}else{if(lt(t,n))return;yo.set(n),i.uniformMatrix2fv(this.addr,!1,yo),ct(t,n)}}function Vf(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(lt(t,e))return;i.uniformMatrix3fv(this.addr,!1,e),ct(t,e)}else{if(lt(t,n))return;So.set(n),i.uniformMatrix3fv(this.addr,!1,So),ct(t,n)}}function Wf(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(lt(t,e))return;i.uniformMatrix4fv(this.addr,!1,e),ct(t,e)}else{if(lt(t,n))return;Mo.set(n),i.uniformMatrix4fv(this.addr,!1,Mo),ct(t,n)}}function Xf(i,e){const t=this.cache;t[0]!==e&&(i.uniform1i(this.addr,e),t[0]=e)}function qf(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(lt(t,e))return;i.uniform2iv(this.addr,e),ct(t,e)}}function Yf(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(lt(t,e))return;i.uniform3iv(this.addr,e),ct(t,e)}}function $f(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(lt(t,e))return;i.uniform4iv(this.addr,e),ct(t,e)}}function Kf(i,e){const t=this.cache;t[0]!==e&&(i.uniform1ui(this.addr,e),t[0]=e)}function Zf(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(lt(t,e))return;i.uniform2uiv(this.addr,e),ct(t,e)}}function jf(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(lt(t,e))return;i.uniform3uiv(this.addr,e),ct(t,e)}}function Jf(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(lt(t,e))return;i.uniform4uiv(this.addr,e),ct(t,e)}}function Qf(i,e,t){const n=this.cache,r=t.allocateTextureUnit();n[0]!==r&&(i.uniform1i(this.addr,r),n[0]=r);const s=this.type===i.SAMPLER_2D_SHADOW?pl:fl;t.setTexture2D(e||s,r)}function ep(i,e,t){const n=this.cache,r=t.allocateTextureUnit();n[0]!==r&&(i.uniform1i(this.addr,r),n[0]=r),t.setTexture3D(e||gl,r)}function tp(i,e,t){const n=this.cache,r=t.allocateTextureUnit();n[0]!==r&&(i.uniform1i(this.addr,r),n[0]=r),t.setTextureCube(e||_l,r)}function np(i,e,t){const n=this.cache,r=t.allocateTextureUnit();n[0]!==r&&(i.uniform1i(this.addr,r),n[0]=r),t.setTexture2DArray(e||ml,r)}function ip(i){switch(i){case 5126:return Bf;case 35664:return zf;case 35665:return Gf;case 35666:return Hf;case 35674:return kf;case 35675:return Vf;case 35676:return Wf;case 5124:case 35670:return Xf;case 35667:case 35671:return qf;case 35668:case 35672:return Yf;case 35669:case 35673:return $f;case 5125:return Kf;case 36294:return Zf;case 36295:return jf;case 36296:return Jf;case 35678:case 36198:case 36298:case 36306:case 35682:return Qf;case 35679:case 36299:case 36307:return ep;case 35680:case 36300:case 36308:case 36293:return tp;case 36289:case 36303:case 36311:case 36292:return np}}function rp(i,e){i.uniform1fv(this.addr,e)}function sp(i,e){const t=Ei(e,this.size,2);i.uniform2fv(this.addr,t)}function ap(i,e){const t=Ei(e,this.size,3);i.uniform3fv(this.addr,t)}function op(i,e){const t=Ei(e,this.size,4);i.uniform4fv(this.addr,t)}function lp(i,e){const t=Ei(e,this.size,4);i.uniformMatrix2fv(this.addr,!1,t)}function cp(i,e){const t=Ei(e,this.size,9);i.uniformMatrix3fv(this.addr,!1,t)}function up(i,e){const t=Ei(e,this.size,16);i.uniformMatrix4fv(this.addr,!1,t)}function hp(i,e){i.uniform1iv(this.addr,e)}function dp(i,e){i.uniform2iv(this.addr,e)}function fp(i,e){i.uniform3iv(this.addr,e)}function pp(i,e){i.uniform4iv(this.addr,e)}function mp(i,e){i.uniform1uiv(this.addr,e)}function gp(i,e){i.uniform2uiv(this.addr,e)}function _p(i,e){i.uniform3uiv(this.addr,e)}function vp(i,e){i.uniform4uiv(this.addr,e)}function xp(i,e,t){const n=this.cache,r=e.length,s=Pr(t,r);lt(n,s)||(i.uniform1iv(this.addr,s),ct(n,s));for(let o=0;o!==r;++o)t.setTexture2D(e[o]||fl,s[o])}function Mp(i,e,t){const n=this.cache,r=e.length,s=Pr(t,r);lt(n,s)||(i.uniform1iv(this.addr,s),ct(n,s));for(let o=0;o!==r;++o)t.setTexture3D(e[o]||gl,s[o])}function Sp(i,e,t){const n=this.cache,r=e.length,s=Pr(t,r);lt(n,s)||(i.uniform1iv(this.addr,s),ct(n,s));for(let o=0;o!==r;++o)t.setTextureCube(e[o]||_l,s[o])}function yp(i,e,t){const n=this.cache,r=e.length,s=Pr(t,r);lt(n,s)||(i.uniform1iv(this.addr,s),ct(n,s));for(let o=0;o!==r;++o)t.setTexture2DArray(e[o]||ml,s[o])}function Ep(i){switch(i){case 5126:return rp;case 35664:return sp;case 35665:return ap;case 35666:return op;case 35674:return lp;case 35675:return cp;case 35676:return up;case 5124:case 35670:return hp;case 35667:case 35671:return dp;case 35668:case 35672:return fp;case 35669:case 35673:return pp;case 5125:return mp;case 36294:return gp;case 36295:return _p;case 36296:return vp;case 35678:case 36198:case 36298:case 36306:case 35682:return xp;case 35679:case 36299:case 36307:return Mp;case 35680:case 36300:case 36308:case 36293:return Sp;case 36289:case 36303:case 36311:case 36292:return yp}}class bp{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=ip(t.type)}}class Tp{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=Ep(t.type)}}class Ap{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){const r=this.seq;for(let s=0,o=r.length;s!==o;++s){const a=r[s];a.setValue(e,t[a.id],n)}}}const ms=/(\w+)(\])?(\[|\.)?/g;function Eo(i,e){i.seq.push(e),i.map[e.id]=e}function wp(i,e,t){const n=i.name,r=n.length;for(ms.lastIndex=0;;){const s=ms.exec(n),o=ms.lastIndex;let a=s[1];const l=s[2]==="]",c=s[3];if(l&&(a=a|0),c===void 0||c==="["&&o+2===r){Eo(t,c===void 0?new bp(a,i,e):new Tp(a,i,e));break}else{let h=t.map[a];h===void 0&&(h=new Ap(a),Eo(t,h)),t=h}}}class _r{constructor(e,t){this.seq=[],this.map={};const n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let r=0;r<n;++r){const s=e.getActiveUniform(t,r),o=e.getUniformLocation(t,s.name);wp(s,o,this)}}setValue(e,t,n,r){const s=this.map[t];s!==void 0&&s.setValue(e,n,r)}setOptional(e,t,n){const r=t[n];r!==void 0&&this.setValue(e,n,r)}static upload(e,t,n,r){for(let s=0,o=t.length;s!==o;++s){const a=t[s],l=n[a.id];l.needsUpdate!==!1&&a.setValue(e,l.value,r)}}static seqWithValue(e,t){const n=[];for(let r=0,s=e.length;r!==s;++r){const o=e[r];o.id in t&&n.push(o)}return n}}function bo(i,e,t){const n=i.createShader(e);return i.shaderSource(n,t),i.compileShader(n),n}const Rp=37297;let Cp=0;function Pp(i,e){const t=i.split(`
`),n=[],r=Math.max(e-6,0),s=Math.min(e+6,t.length);for(let o=r;o<s;o++){const a=o+1;n.push(`${a===e?">":" "} ${a}: ${t[o]}`)}return n.join(`
`)}function Lp(i){const e=$e.getPrimaries($e.workingColorSpace),t=$e.getPrimaries(i);let n;switch(e===t?n="":e===Er&&t===yr?n="LinearDisplayP3ToLinearSRGB":e===yr&&t===Er&&(n="LinearSRGBToLinearDisplayP3"),i){case wn:case Cr:return[n,"LinearTransferOETF"];case Zt:case zs:return[n,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space:",i),[n,"LinearTransferOETF"]}}function To(i,e,t){const n=i.getShaderParameter(e,i.COMPILE_STATUS),r=i.getShaderInfoLog(e).trim();if(n&&r==="")return"";const s=/ERROR: 0:(\d+)/.exec(r);if(s){const o=parseInt(s[1]);return t.toUpperCase()+`

`+r+`

`+Pp(i.getShaderSource(e),o)}else return r}function Dp(i,e){const t=Lp(e);return`vec4 ${i}( vec4 value ) { return ${t[0]}( ${t[1]}( value ) ); }`}function Up(i,e){let t;switch(e){case Bc:t="Linear";break;case zc:t="Reinhard";break;case Gc:t="OptimizedCineon";break;case Hc:t="ACESFilmic";break;case Vc:t="AgX";break;case Wc:t="Neutral";break;case kc:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+i+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}function Ip(i){return[i.extensionDerivatives||i.envMapCubeUVHeight||i.bumpMap||i.normalMapTangentSpace||i.clearcoatNormalMap||i.flatShading||i.alphaToCoverage||i.shaderID==="physical"?"#extension GL_OES_standard_derivatives : enable":"",(i.extensionFragDepth||i.logarithmicDepthBuffer)&&i.rendererExtensionFragDepth?"#extension GL_EXT_frag_depth : enable":"",i.extensionDrawBuffers&&i.rendererExtensionDrawBuffers?"#extension GL_EXT_draw_buffers : require":"",(i.extensionShaderTextureLOD||i.envMap||i.transmission)&&i.rendererExtensionShaderTextureLod?"#extension GL_EXT_shader_texture_lod : enable":""].filter(di).join(`
`)}function Np(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(di).join(`
`)}function Fp(i){const e=[];for(const t in i){const n=i[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function Op(i,e){const t={},n=i.getProgramParameter(e,i.ACTIVE_ATTRIBUTES);for(let r=0;r<n;r++){const s=i.getActiveAttrib(e,r),o=s.name;let a=1;s.type===i.FLOAT_MAT2&&(a=2),s.type===i.FLOAT_MAT3&&(a=3),s.type===i.FLOAT_MAT4&&(a=4),t[o]={type:s.type,location:i.getAttribLocation(e,o),locationSize:a}}return t}function di(i){return i!==""}function Ao(i,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return i.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function wo(i,e){return i.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const Bp=/^[ \t]*#include +<([\w\d./]+)>/gm;function Ds(i){return i.replace(Bp,Gp)}const zp=new Map([["encodings_fragment","colorspace_fragment"],["encodings_pars_fragment","colorspace_pars_fragment"],["output_fragment","opaque_fragment"]]);function Gp(i,e){let t=Ue[e];if(t===void 0){const n=zp.get(e);if(n!==void 0)t=Ue[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("Can not resolve #include <"+e+">")}return Ds(t)}const Hp=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Ro(i){return i.replace(Hp,kp)}function kp(i,e,t,n){let r="";for(let s=parseInt(e);s<parseInt(t);s++)r+=n.replace(/\[\s*i\s*\]/g,"[ "+s+" ]").replace(/UNROLLED_LOOP_INDEX/g,s);return r}function Co(i){let e=`precision ${i.precision} float;
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
#define LOW_PRECISION`),e}function Vp(i){let e="SHADOWMAP_TYPE_BASIC";return i.shadowMapType===ko?e="SHADOWMAP_TYPE_PCF":i.shadowMapType===dc?e="SHADOWMAP_TYPE_PCF_SOFT":i.shadowMapType===on&&(e="SHADOWMAP_TYPE_VSM"),e}function Wp(i){let e="ENVMAP_TYPE_CUBE";if(i.envMap)switch(i.envMapMode){case gi:case _i:e="ENVMAP_TYPE_CUBE";break;case Rr:e="ENVMAP_TYPE_CUBE_UV";break}return e}function Xp(i){let e="ENVMAP_MODE_REFLECTION";if(i.envMap)switch(i.envMapMode){case _i:e="ENVMAP_MODE_REFRACTION";break}return e}function qp(i){let e="ENVMAP_BLENDING_NONE";if(i.envMap)switch(i.combine){case Vo:e="ENVMAP_BLENDING_MULTIPLY";break;case Fc:e="ENVMAP_BLENDING_MIX";break;case Oc:e="ENVMAP_BLENDING_ADD";break}return e}function Yp(i){const e=i.envMapCubeUVHeight;if(e===null)return null;const t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),7*16)),texelHeight:n,maxMip:t}}function $p(i,e,t,n){const r=i.getContext(),s=t.defines;let o=t.vertexShader,a=t.fragmentShader;const l=Vp(t),c=Wp(t),u=Xp(t),h=qp(t),p=Yp(t),m=t.isWebGL2?"":Ip(t),_=Np(t),g=Fp(s),d=r.createProgram();let f,b,M=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(f=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(di).join(`
`),f.length>0&&(f+=`
`),b=[m,"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(di).join(`
`),b.length>0&&(b+=`
`)):(f=[Co(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+u:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors&&t.isWebGL2?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0&&t.isWebGL2?"#define MORPHTARGETS_TEXTURE":"",t.morphTargetsCount>0&&t.isWebGL2?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0&&t.isWebGL2?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.useLegacyLights?"#define LEGACY_LIGHTS":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.logarithmicDepthBuffer&&t.rendererExtensionFragDepth?"#define USE_LOGDEPTHBUF_EXT":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#if ( defined( USE_MORPHTARGETS ) && ! defined( MORPHTARGETS_TEXTURE ) )","	attribute vec3 morphTarget0;","	attribute vec3 morphTarget1;","	attribute vec3 morphTarget2;","	attribute vec3 morphTarget3;","	#ifdef USE_MORPHNORMALS","		attribute vec3 morphNormal0;","		attribute vec3 morphNormal1;","		attribute vec3 morphNormal2;","		attribute vec3 morphNormal3;","	#else","		attribute vec3 morphTarget4;","		attribute vec3 morphTarget5;","		attribute vec3 morphTarget6;","		attribute vec3 morphTarget7;","	#endif","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(di).join(`
`),b=[m,Co(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+u:"",t.envMap?"#define "+h:"",p?"#define CUBEUV_TEXEL_WIDTH "+p.texelWidth:"",p?"#define CUBEUV_TEXEL_HEIGHT "+p.texelHeight:"",p?"#define CUBEUV_MAX_MIP "+p.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.useLegacyLights?"#define LEGACY_LIGHTS":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.logarithmicDepthBuffer&&t.rendererExtensionFragDepth?"#define USE_LOGDEPTHBUF_EXT":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==yn?"#define TONE_MAPPING":"",t.toneMapping!==yn?Ue.tonemapping_pars_fragment:"",t.toneMapping!==yn?Up("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",Ue.colorspace_pars_fragment,Dp("linearToOutputTexel",t.outputColorSpace),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(di).join(`
`)),o=Ds(o),o=Ao(o,t),o=wo(o,t),a=Ds(a),a=Ao(a,t),a=wo(a,t),o=Ro(o),a=Ro(a),t.isWebGL2&&t.isRawShaderMaterial!==!0&&(M=`#version 300 es
`,f=[_,"precision mediump sampler2DArray;","#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+f,b=["precision mediump sampler2DArray;","#define varying in",t.glslVersion===Wa?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===Wa?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+b);const y=M+f+o,P=M+b+a,w=bo(r,r.VERTEX_SHADER,y),A=bo(r,r.FRAGMENT_SHADER,P);r.attachShader(d,w),r.attachShader(d,A),t.index0AttributeName!==void 0?r.bindAttribLocation(d,0,t.index0AttributeName):t.morphTargets===!0&&r.bindAttribLocation(d,0,"position"),r.linkProgram(d);function I(Y){if(i.debug.checkShaderErrors){const $=r.getProgramInfoLog(d).trim(),R=r.getShaderInfoLog(w).trim(),V=r.getShaderInfoLog(A).trim();let H=!0,K=!0;if(r.getProgramParameter(d,r.LINK_STATUS)===!1)if(H=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(r,d,w,A);else{const k=To(r,w,"vertex"),X=To(r,A,"fragment");console.error("THREE.WebGLProgram: Shader Error "+r.getError()+" - VALIDATE_STATUS "+r.getProgramParameter(d,r.VALIDATE_STATUS)+`

Material Name: `+Y.name+`
Material Type: `+Y.type+`

Program Info Log: `+$+`
`+k+`
`+X)}else $!==""?console.warn("THREE.WebGLProgram: Program Info Log:",$):(R===""||V==="")&&(K=!1);K&&(Y.diagnostics={runnable:H,programLog:$,vertexShader:{log:R,prefix:f},fragmentShader:{log:V,prefix:b}})}r.deleteShader(w),r.deleteShader(A),q=new _r(r,d),x=Op(r,d)}let q;this.getUniforms=function(){return q===void 0&&I(this),q};let x;this.getAttributes=function(){return x===void 0&&I(this),x};let T=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return T===!1&&(T=r.getProgramParameter(d,Rp)),T},this.destroy=function(){n.releaseStatesOfProgram(this),r.deleteProgram(d),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=Cp++,this.cacheKey=e,this.usedTimes=1,this.program=d,this.vertexShader=w,this.fragmentShader=A,this}let Kp=0;class Zp{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){const t=e.vertexShader,n=e.fragmentShader,r=this._getShaderStage(t),s=this._getShaderStage(n),o=this._getShaderCacheForMaterial(e);return o.has(r)===!1&&(o.add(r),r.usedTimes++),o.has(s)===!1&&(o.add(s),s.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){const t=this.shaderCache;let n=t.get(e);return n===void 0&&(n=new jp(e),t.set(e,n)),n}}class jp{constructor(e){this.id=Kp++,this.code=e,this.usedTimes=0}}function Jp(i,e,t,n,r,s,o){const a=new il,l=new Zp,c=new Set,u=[],h=r.isWebGL2,p=r.logarithmicDepthBuffer,m=r.vertexTextures;let _=r.precision;const g={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function d(x){return c.add(x),x===0?"uv":`uv${x}`}function f(x,T,Y,$,R){const V=$.fog,H=R.geometry,K=x.isMeshStandardMaterial?$.environment:null,k=(x.isMeshStandardMaterial?t:e).get(x.envMap||K),X=k&&k.mapping===Rr?k.image.height:null,Z=g[x.type];x.precision!==null&&(_=r.getMaxPrecision(x.precision),_!==x.precision&&console.warn("THREE.WebGLProgram.getParameters:",x.precision,"not supported, using",_,"instead."));const ie=H.morphAttributes.position||H.morphAttributes.normal||H.morphAttributes.color,he=ie!==void 0?ie.length:0;let Ce=0;H.morphAttributes.position!==void 0&&(Ce=1),H.morphAttributes.normal!==void 0&&(Ce=2),H.morphAttributes.color!==void 0&&(Ce=3);let z,J,ce,Ee;if(Z){const Ke=jt[Z];z=Ke.vertexShader,J=Ke.fragmentShader}else z=x.vertexShader,J=x.fragmentShader,l.update(x),ce=l.getVertexShaderID(x),Ee=l.getFragmentShaderID(x);const ge=i.getRenderTarget(),de=R.isInstancedMesh===!0,Xe=R.isBatchedMesh===!0,be=!!x.map,D=!!x.matcap,dt=!!k,ve=!!x.aoMap,Oe=!!x.lightMap,Me=!!x.bumpMap,He=!!x.normalMap,Ne=!!x.displacementMap,Be=!!x.emissiveMap,tt=!!x.metalnessMap,E=!!x.roughnessMap,v=x.anisotropy>0,G=x.clearcoat>0,W=x.iridescence>0,Q=x.sheen>0,j=x.transmission>0,Pe=v&&!!x.anisotropyMap,Se=G&&!!x.clearcoatMap,re=G&&!!x.clearcoatNormalMap,ae=G&&!!x.clearcoatRoughnessMap,Le=W&&!!x.iridescenceMap,ee=W&&!!x.iridescenceThicknessMap,st=Q&&!!x.sheenColorMap,ze=Q&&!!x.sheenRoughnessMap,_e=!!x.specularMap,fe=!!x.specularColorMap,pe=!!x.specularIntensityMap,ke=j&&!!x.transmissionMap,we=j&&!!x.thicknessMap,Je=!!x.gradientMap,C=!!x.alphaMap,se=x.alphaTest>0,F=!!x.alphaHash,te=!!x.extensions;let oe=yn;x.toneMapped&&(ge===null||ge.isXRRenderTarget===!0)&&(oe=i.toneMapping);const Ge={isWebGL2:h,shaderID:Z,shaderType:x.type,shaderName:x.name,vertexShader:z,fragmentShader:J,defines:x.defines,customVertexShaderID:ce,customFragmentShaderID:Ee,isRawShaderMaterial:x.isRawShaderMaterial===!0,glslVersion:x.glslVersion,precision:_,batching:Xe,instancing:de,instancingColor:de&&R.instanceColor!==null,instancingMorph:de&&R.morphTexture!==null,supportsVertexTextures:m,outputColorSpace:ge===null?i.outputColorSpace:ge.isXRRenderTarget===!0?ge.texture.colorSpace:wn,alphaToCoverage:!!x.alphaToCoverage,map:be,matcap:D,envMap:dt,envMapMode:dt&&k.mapping,envMapCubeUVHeight:X,aoMap:ve,lightMap:Oe,bumpMap:Me,normalMap:He,displacementMap:m&&Ne,emissiveMap:Be,normalMapObjectSpace:He&&x.normalMapType===nu,normalMapTangentSpace:He&&x.normalMapType===tu,metalnessMap:tt,roughnessMap:E,anisotropy:v,anisotropyMap:Pe,clearcoat:G,clearcoatMap:Se,clearcoatNormalMap:re,clearcoatRoughnessMap:ae,iridescence:W,iridescenceMap:Le,iridescenceThicknessMap:ee,sheen:Q,sheenColorMap:st,sheenRoughnessMap:ze,specularMap:_e,specularColorMap:fe,specularIntensityMap:pe,transmission:j,transmissionMap:ke,thicknessMap:we,gradientMap:Je,opaque:x.transparent===!1&&x.blending===fi&&x.alphaToCoverage===!1,alphaMap:C,alphaTest:se,alphaHash:F,combine:x.combine,mapUv:be&&d(x.map.channel),aoMapUv:ve&&d(x.aoMap.channel),lightMapUv:Oe&&d(x.lightMap.channel),bumpMapUv:Me&&d(x.bumpMap.channel),normalMapUv:He&&d(x.normalMap.channel),displacementMapUv:Ne&&d(x.displacementMap.channel),emissiveMapUv:Be&&d(x.emissiveMap.channel),metalnessMapUv:tt&&d(x.metalnessMap.channel),roughnessMapUv:E&&d(x.roughnessMap.channel),anisotropyMapUv:Pe&&d(x.anisotropyMap.channel),clearcoatMapUv:Se&&d(x.clearcoatMap.channel),clearcoatNormalMapUv:re&&d(x.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:ae&&d(x.clearcoatRoughnessMap.channel),iridescenceMapUv:Le&&d(x.iridescenceMap.channel),iridescenceThicknessMapUv:ee&&d(x.iridescenceThicknessMap.channel),sheenColorMapUv:st&&d(x.sheenColorMap.channel),sheenRoughnessMapUv:ze&&d(x.sheenRoughnessMap.channel),specularMapUv:_e&&d(x.specularMap.channel),specularColorMapUv:fe&&d(x.specularColorMap.channel),specularIntensityMapUv:pe&&d(x.specularIntensityMap.channel),transmissionMapUv:ke&&d(x.transmissionMap.channel),thicknessMapUv:we&&d(x.thicknessMap.channel),alphaMapUv:C&&d(x.alphaMap.channel),vertexTangents:!!H.attributes.tangent&&(He||v),vertexColors:x.vertexColors,vertexAlphas:x.vertexColors===!0&&!!H.attributes.color&&H.attributes.color.itemSize===4,pointsUvs:R.isPoints===!0&&!!H.attributes.uv&&(be||C),fog:!!V,useFog:x.fog===!0,fogExp2:!!V&&V.isFogExp2,flatShading:x.flatShading===!0,sizeAttenuation:x.sizeAttenuation===!0,logarithmicDepthBuffer:p,skinning:R.isSkinnedMesh===!0,morphTargets:H.morphAttributes.position!==void 0,morphNormals:H.morphAttributes.normal!==void 0,morphColors:H.morphAttributes.color!==void 0,morphTargetsCount:he,morphTextureStride:Ce,numDirLights:T.directional.length,numPointLights:T.point.length,numSpotLights:T.spot.length,numSpotLightMaps:T.spotLightMap.length,numRectAreaLights:T.rectArea.length,numHemiLights:T.hemi.length,numDirLightShadows:T.directionalShadowMap.length,numPointLightShadows:T.pointShadowMap.length,numSpotLightShadows:T.spotShadowMap.length,numSpotLightShadowsWithMaps:T.numSpotLightShadowsWithMaps,numLightProbes:T.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:x.dithering,shadowMapEnabled:i.shadowMap.enabled&&Y.length>0,shadowMapType:i.shadowMap.type,toneMapping:oe,useLegacyLights:i._useLegacyLights,decodeVideoTexture:be&&x.map.isVideoTexture===!0&&$e.getTransfer(x.map.colorSpace)===je,premultipliedAlpha:x.premultipliedAlpha,doubleSided:x.side===Xt,flipSided:x.side===wt,useDepthPacking:x.depthPacking>=0,depthPacking:x.depthPacking||0,index0AttributeName:x.index0AttributeName,extensionDerivatives:te&&x.extensions.derivatives===!0,extensionFragDepth:te&&x.extensions.fragDepth===!0,extensionDrawBuffers:te&&x.extensions.drawBuffers===!0,extensionShaderTextureLOD:te&&x.extensions.shaderTextureLOD===!0,extensionClipCullDistance:te&&x.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:te&&x.extensions.multiDraw===!0&&n.has("WEBGL_multi_draw"),rendererExtensionFragDepth:h||n.has("EXT_frag_depth"),rendererExtensionDrawBuffers:h||n.has("WEBGL_draw_buffers"),rendererExtensionShaderTextureLod:h||n.has("EXT_shader_texture_lod"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:x.customProgramCacheKey()};return Ge.vertexUv1s=c.has(1),Ge.vertexUv2s=c.has(2),Ge.vertexUv3s=c.has(3),c.clear(),Ge}function b(x){const T=[];if(x.shaderID?T.push(x.shaderID):(T.push(x.customVertexShaderID),T.push(x.customFragmentShaderID)),x.defines!==void 0)for(const Y in x.defines)T.push(Y),T.push(x.defines[Y]);return x.isRawShaderMaterial===!1&&(M(T,x),y(T,x),T.push(i.outputColorSpace)),T.push(x.customProgramCacheKey),T.join()}function M(x,T){x.push(T.precision),x.push(T.outputColorSpace),x.push(T.envMapMode),x.push(T.envMapCubeUVHeight),x.push(T.mapUv),x.push(T.alphaMapUv),x.push(T.lightMapUv),x.push(T.aoMapUv),x.push(T.bumpMapUv),x.push(T.normalMapUv),x.push(T.displacementMapUv),x.push(T.emissiveMapUv),x.push(T.metalnessMapUv),x.push(T.roughnessMapUv),x.push(T.anisotropyMapUv),x.push(T.clearcoatMapUv),x.push(T.clearcoatNormalMapUv),x.push(T.clearcoatRoughnessMapUv),x.push(T.iridescenceMapUv),x.push(T.iridescenceThicknessMapUv),x.push(T.sheenColorMapUv),x.push(T.sheenRoughnessMapUv),x.push(T.specularMapUv),x.push(T.specularColorMapUv),x.push(T.specularIntensityMapUv),x.push(T.transmissionMapUv),x.push(T.thicknessMapUv),x.push(T.combine),x.push(T.fogExp2),x.push(T.sizeAttenuation),x.push(T.morphTargetsCount),x.push(T.morphAttributeCount),x.push(T.numDirLights),x.push(T.numPointLights),x.push(T.numSpotLights),x.push(T.numSpotLightMaps),x.push(T.numHemiLights),x.push(T.numRectAreaLights),x.push(T.numDirLightShadows),x.push(T.numPointLightShadows),x.push(T.numSpotLightShadows),x.push(T.numSpotLightShadowsWithMaps),x.push(T.numLightProbes),x.push(T.shadowMapType),x.push(T.toneMapping),x.push(T.numClippingPlanes),x.push(T.numClipIntersection),x.push(T.depthPacking)}function y(x,T){a.disableAll(),T.isWebGL2&&a.enable(0),T.supportsVertexTextures&&a.enable(1),T.instancing&&a.enable(2),T.instancingColor&&a.enable(3),T.instancingMorph&&a.enable(4),T.matcap&&a.enable(5),T.envMap&&a.enable(6),T.normalMapObjectSpace&&a.enable(7),T.normalMapTangentSpace&&a.enable(8),T.clearcoat&&a.enable(9),T.iridescence&&a.enable(10),T.alphaTest&&a.enable(11),T.vertexColors&&a.enable(12),T.vertexAlphas&&a.enable(13),T.vertexUv1s&&a.enable(14),T.vertexUv2s&&a.enable(15),T.vertexUv3s&&a.enable(16),T.vertexTangents&&a.enable(17),T.anisotropy&&a.enable(18),T.alphaHash&&a.enable(19),T.batching&&a.enable(20),x.push(a.mask),a.disableAll(),T.fog&&a.enable(0),T.useFog&&a.enable(1),T.flatShading&&a.enable(2),T.logarithmicDepthBuffer&&a.enable(3),T.skinning&&a.enable(4),T.morphTargets&&a.enable(5),T.morphNormals&&a.enable(6),T.morphColors&&a.enable(7),T.premultipliedAlpha&&a.enable(8),T.shadowMapEnabled&&a.enable(9),T.useLegacyLights&&a.enable(10),T.doubleSided&&a.enable(11),T.flipSided&&a.enable(12),T.useDepthPacking&&a.enable(13),T.dithering&&a.enable(14),T.transmission&&a.enable(15),T.sheen&&a.enable(16),T.opaque&&a.enable(17),T.pointsUvs&&a.enable(18),T.decodeVideoTexture&&a.enable(19),T.alphaToCoverage&&a.enable(20),x.push(a.mask)}function P(x){const T=g[x.type];let Y;if(T){const $=jt[T];Y=Pu.clone($.uniforms)}else Y=x.uniforms;return Y}function w(x,T){let Y;for(let $=0,R=u.length;$<R;$++){const V=u[$];if(V.cacheKey===T){Y=V,++Y.usedTimes;break}}return Y===void 0&&(Y=new $p(i,T,x,s),u.push(Y)),Y}function A(x){if(--x.usedTimes===0){const T=u.indexOf(x);u[T]=u[u.length-1],u.pop(),x.destroy()}}function I(x){l.remove(x)}function q(){l.dispose()}return{getParameters:f,getProgramCacheKey:b,getUniforms:P,acquireProgram:w,releaseProgram:A,releaseShaderCache:I,programs:u,dispose:q}}function Qp(){let i=new WeakMap;function e(s){let o=i.get(s);return o===void 0&&(o={},i.set(s,o)),o}function t(s){i.delete(s)}function n(s,o,a){i.get(s)[o]=a}function r(){i=new WeakMap}return{get:e,remove:t,update:n,dispose:r}}function em(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.material.id!==e.material.id?i.material.id-e.material.id:i.z!==e.z?i.z-e.z:i.id-e.id}function Po(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.z!==e.z?e.z-i.z:i.id-e.id}function Lo(){const i=[];let e=0;const t=[],n=[],r=[];function s(){e=0,t.length=0,n.length=0,r.length=0}function o(h,p,m,_,g,d){let f=i[e];return f===void 0?(f={id:h.id,object:h,geometry:p,material:m,groupOrder:_,renderOrder:h.renderOrder,z:g,group:d},i[e]=f):(f.id=h.id,f.object=h,f.geometry=p,f.material=m,f.groupOrder=_,f.renderOrder=h.renderOrder,f.z=g,f.group=d),e++,f}function a(h,p,m,_,g,d){const f=o(h,p,m,_,g,d);m.transmission>0?n.push(f):m.transparent===!0?r.push(f):t.push(f)}function l(h,p,m,_,g,d){const f=o(h,p,m,_,g,d);m.transmission>0?n.unshift(f):m.transparent===!0?r.unshift(f):t.unshift(f)}function c(h,p){t.length>1&&t.sort(h||em),n.length>1&&n.sort(p||Po),r.length>1&&r.sort(p||Po)}function u(){for(let h=e,p=i.length;h<p;h++){const m=i[h];if(m.id===null)break;m.id=null,m.object=null,m.geometry=null,m.material=null,m.group=null}}return{opaque:t,transmissive:n,transparent:r,init:s,push:a,unshift:l,finish:u,sort:c}}function tm(){let i=new WeakMap;function e(n,r){const s=i.get(n);let o;return s===void 0?(o=new Lo,i.set(n,[o])):r>=s.length?(o=new Lo,s.push(o)):o=s[r],o}function t(){i=new WeakMap}return{get:e,dispose:t}}function nm(){const i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new U,color:new We};break;case"SpotLight":t={position:new U,direction:new U,color:new We,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new U,color:new We,distance:0,decay:0};break;case"HemisphereLight":t={direction:new U,skyColor:new We,groundColor:new We};break;case"RectAreaLight":t={color:new We,position:new U,halfWidth:new U,halfHeight:new U};break}return i[e.id]=t,t}}}function im(){const i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ve};break;case"SpotLight":t={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ve};break;case"PointLight":t={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ve,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[e.id]=t,t}}}let rm=0;function sm(i,e){return(e.castShadow?2:0)-(i.castShadow?2:0)+(e.map?1:0)-(i.map?1:0)}function am(i,e){const t=new nm,n=im(),r={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let u=0;u<9;u++)r.probe.push(new U);const s=new U,o=new rt,a=new rt;function l(u,h){let p=0,m=0,_=0;for(let Y=0;Y<9;Y++)r.probe[Y].set(0,0,0);let g=0,d=0,f=0,b=0,M=0,y=0,P=0,w=0,A=0,I=0,q=0;u.sort(sm);const x=h===!0?Math.PI:1;for(let Y=0,$=u.length;Y<$;Y++){const R=u[Y],V=R.color,H=R.intensity,K=R.distance,k=R.shadow&&R.shadow.map?R.shadow.map.texture:null;if(R.isAmbientLight)p+=V.r*H*x,m+=V.g*H*x,_+=V.b*H*x;else if(R.isLightProbe){for(let X=0;X<9;X++)r.probe[X].addScaledVector(R.sh.coefficients[X],H);q++}else if(R.isDirectionalLight){const X=t.get(R);if(X.color.copy(R.color).multiplyScalar(R.intensity*x),R.castShadow){const Z=R.shadow,ie=n.get(R);ie.shadowBias=Z.bias,ie.shadowNormalBias=Z.normalBias,ie.shadowRadius=Z.radius,ie.shadowMapSize=Z.mapSize,r.directionalShadow[g]=ie,r.directionalShadowMap[g]=k,r.directionalShadowMatrix[g]=R.shadow.matrix,y++}r.directional[g]=X,g++}else if(R.isSpotLight){const X=t.get(R);X.position.setFromMatrixPosition(R.matrixWorld),X.color.copy(V).multiplyScalar(H*x),X.distance=K,X.coneCos=Math.cos(R.angle),X.penumbraCos=Math.cos(R.angle*(1-R.penumbra)),X.decay=R.decay,r.spot[f]=X;const Z=R.shadow;if(R.map&&(r.spotLightMap[A]=R.map,A++,Z.updateMatrices(R),R.castShadow&&I++),r.spotLightMatrix[f]=Z.matrix,R.castShadow){const ie=n.get(R);ie.shadowBias=Z.bias,ie.shadowNormalBias=Z.normalBias,ie.shadowRadius=Z.radius,ie.shadowMapSize=Z.mapSize,r.spotShadow[f]=ie,r.spotShadowMap[f]=k,w++}f++}else if(R.isRectAreaLight){const X=t.get(R);X.color.copy(V).multiplyScalar(H),X.halfWidth.set(R.width*.5,0,0),X.halfHeight.set(0,R.height*.5,0),r.rectArea[b]=X,b++}else if(R.isPointLight){const X=t.get(R);if(X.color.copy(R.color).multiplyScalar(R.intensity*x),X.distance=R.distance,X.decay=R.decay,R.castShadow){const Z=R.shadow,ie=n.get(R);ie.shadowBias=Z.bias,ie.shadowNormalBias=Z.normalBias,ie.shadowRadius=Z.radius,ie.shadowMapSize=Z.mapSize,ie.shadowCameraNear=Z.camera.near,ie.shadowCameraFar=Z.camera.far,r.pointShadow[d]=ie,r.pointShadowMap[d]=k,r.pointShadowMatrix[d]=R.shadow.matrix,P++}r.point[d]=X,d++}else if(R.isHemisphereLight){const X=t.get(R);X.skyColor.copy(R.color).multiplyScalar(H*x),X.groundColor.copy(R.groundColor).multiplyScalar(H*x),r.hemi[M]=X,M++}}b>0&&(e.isWebGL2?i.has("OES_texture_float_linear")===!0?(r.rectAreaLTC1=ne.LTC_FLOAT_1,r.rectAreaLTC2=ne.LTC_FLOAT_2):(r.rectAreaLTC1=ne.LTC_HALF_1,r.rectAreaLTC2=ne.LTC_HALF_2):i.has("OES_texture_float_linear")===!0?(r.rectAreaLTC1=ne.LTC_FLOAT_1,r.rectAreaLTC2=ne.LTC_FLOAT_2):i.has("OES_texture_half_float_linear")===!0?(r.rectAreaLTC1=ne.LTC_HALF_1,r.rectAreaLTC2=ne.LTC_HALF_2):console.error("THREE.WebGLRenderer: Unable to use RectAreaLight. Missing WebGL extensions.")),r.ambient[0]=p,r.ambient[1]=m,r.ambient[2]=_;const T=r.hash;(T.directionalLength!==g||T.pointLength!==d||T.spotLength!==f||T.rectAreaLength!==b||T.hemiLength!==M||T.numDirectionalShadows!==y||T.numPointShadows!==P||T.numSpotShadows!==w||T.numSpotMaps!==A||T.numLightProbes!==q)&&(r.directional.length=g,r.spot.length=f,r.rectArea.length=b,r.point.length=d,r.hemi.length=M,r.directionalShadow.length=y,r.directionalShadowMap.length=y,r.pointShadow.length=P,r.pointShadowMap.length=P,r.spotShadow.length=w,r.spotShadowMap.length=w,r.directionalShadowMatrix.length=y,r.pointShadowMatrix.length=P,r.spotLightMatrix.length=w+A-I,r.spotLightMap.length=A,r.numSpotLightShadowsWithMaps=I,r.numLightProbes=q,T.directionalLength=g,T.pointLength=d,T.spotLength=f,T.rectAreaLength=b,T.hemiLength=M,T.numDirectionalShadows=y,T.numPointShadows=P,T.numSpotShadows=w,T.numSpotMaps=A,T.numLightProbes=q,r.version=rm++)}function c(u,h){let p=0,m=0,_=0,g=0,d=0;const f=h.matrixWorldInverse;for(let b=0,M=u.length;b<M;b++){const y=u[b];if(y.isDirectionalLight){const P=r.directional[p];P.direction.setFromMatrixPosition(y.matrixWorld),s.setFromMatrixPosition(y.target.matrixWorld),P.direction.sub(s),P.direction.transformDirection(f),p++}else if(y.isSpotLight){const P=r.spot[_];P.position.setFromMatrixPosition(y.matrixWorld),P.position.applyMatrix4(f),P.direction.setFromMatrixPosition(y.matrixWorld),s.setFromMatrixPosition(y.target.matrixWorld),P.direction.sub(s),P.direction.transformDirection(f),_++}else if(y.isRectAreaLight){const P=r.rectArea[g];P.position.setFromMatrixPosition(y.matrixWorld),P.position.applyMatrix4(f),a.identity(),o.copy(y.matrixWorld),o.premultiply(f),a.extractRotation(o),P.halfWidth.set(y.width*.5,0,0),P.halfHeight.set(0,y.height*.5,0),P.halfWidth.applyMatrix4(a),P.halfHeight.applyMatrix4(a),g++}else if(y.isPointLight){const P=r.point[m];P.position.setFromMatrixPosition(y.matrixWorld),P.position.applyMatrix4(f),m++}else if(y.isHemisphereLight){const P=r.hemi[d];P.direction.setFromMatrixPosition(y.matrixWorld),P.direction.transformDirection(f),d++}}}return{setup:l,setupView:c,state:r}}function Do(i,e){const t=new am(i,e),n=[],r=[];function s(){n.length=0,r.length=0}function o(h){n.push(h)}function a(h){r.push(h)}function l(h){t.setup(n,h)}function c(h){t.setupView(n,h)}return{init:s,state:{lightsArray:n,shadowsArray:r,lights:t},setupLights:l,setupLightsView:c,pushLight:o,pushShadow:a}}function om(i,e){let t=new WeakMap;function n(s,o=0){const a=t.get(s);let l;return a===void 0?(l=new Do(i,e),t.set(s,[l])):o>=a.length?(l=new Do(i,e),a.push(l)):l=a[o],l}function r(){t=new WeakMap}return{get:n,dispose:r}}class lm extends Si{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Qc,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class cm extends Si{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}const um=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,hm=`uniform sampler2D shadow_pass;
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
}`;function dm(i,e,t){let n=new ul;const r=new Ve,s=new Ve,o=new mt,a=new lm({depthPacking:eu}),l=new cm,c={},u=t.maxTextureSize,h={[Tn]:wt,[wt]:Tn,[Xt]:Xt},p=new An({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Ve},radius:{value:4}},vertexShader:um,fragmentShader:hm}),m=p.clone();m.defines.HORIZONTAL_PASS=1;const _=new Ct;_.setAttribute("position",new Gt(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const g=new Nt(_,p),d=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=ko;let f=this.type;this.render=function(w,A,I){if(d.enabled===!1||d.autoUpdate===!1&&d.needsUpdate===!1||w.length===0)return;const q=i.getRenderTarget(),x=i.getActiveCubeFace(),T=i.getActiveMipmapLevel(),Y=i.state;Y.setBlending(Sn),Y.buffers.color.setClear(1,1,1,1),Y.buffers.depth.setTest(!0),Y.setScissorTest(!1);const $=f!==on&&this.type===on,R=f===on&&this.type!==on;for(let V=0,H=w.length;V<H;V++){const K=w[V],k=K.shadow;if(k===void 0){console.warn("THREE.WebGLShadowMap:",K,"has no shadow.");continue}if(k.autoUpdate===!1&&k.needsUpdate===!1)continue;r.copy(k.mapSize);const X=k.getFrameExtents();if(r.multiply(X),s.copy(k.mapSize),(r.x>u||r.y>u)&&(r.x>u&&(s.x=Math.floor(u/X.x),r.x=s.x*X.x,k.mapSize.x=s.x),r.y>u&&(s.y=Math.floor(u/X.y),r.y=s.y*X.y,k.mapSize.y=s.y)),k.map===null||$===!0||R===!0){const ie=this.type!==on?{minFilter:yt,magFilter:yt}:{};k.map!==null&&k.map.dispose(),k.map=new Xn(r.x,r.y,ie),k.map.texture.name=K.name+".shadowMap",k.camera.updateProjectionMatrix()}i.setRenderTarget(k.map),i.clear();const Z=k.getViewportCount();for(let ie=0;ie<Z;ie++){const he=k.getViewport(ie);o.set(s.x*he.x,s.y*he.y,s.x*he.z,s.y*he.w),Y.viewport(o),k.updateMatrices(K,ie),n=k.getFrustum(),y(A,I,k.camera,K,this.type)}k.isPointLightShadow!==!0&&this.type===on&&b(k,I),k.needsUpdate=!1}f=this.type,d.needsUpdate=!1,i.setRenderTarget(q,x,T)};function b(w,A){const I=e.update(g);p.defines.VSM_SAMPLES!==w.blurSamples&&(p.defines.VSM_SAMPLES=w.blurSamples,m.defines.VSM_SAMPLES=w.blurSamples,p.needsUpdate=!0,m.needsUpdate=!0),w.mapPass===null&&(w.mapPass=new Xn(r.x,r.y)),p.uniforms.shadow_pass.value=w.map.texture,p.uniforms.resolution.value=w.mapSize,p.uniforms.radius.value=w.radius,i.setRenderTarget(w.mapPass),i.clear(),i.renderBufferDirect(A,null,I,p,g,null),m.uniforms.shadow_pass.value=w.mapPass.texture,m.uniforms.resolution.value=w.mapSize,m.uniforms.radius.value=w.radius,i.setRenderTarget(w.map),i.clear(),i.renderBufferDirect(A,null,I,m,g,null)}function M(w,A,I,q){let x=null;const T=I.isPointLight===!0?w.customDistanceMaterial:w.customDepthMaterial;if(T!==void 0)x=T;else if(x=I.isPointLight===!0?l:a,i.localClippingEnabled&&A.clipShadows===!0&&Array.isArray(A.clippingPlanes)&&A.clippingPlanes.length!==0||A.displacementMap&&A.displacementScale!==0||A.alphaMap&&A.alphaTest>0||A.map&&A.alphaTest>0){const Y=x.uuid,$=A.uuid;let R=c[Y];R===void 0&&(R={},c[Y]=R);let V=R[$];V===void 0&&(V=x.clone(),R[$]=V,A.addEventListener("dispose",P)),x=V}if(x.visible=A.visible,x.wireframe=A.wireframe,q===on?x.side=A.shadowSide!==null?A.shadowSide:A.side:x.side=A.shadowSide!==null?A.shadowSide:h[A.side],x.alphaMap=A.alphaMap,x.alphaTest=A.alphaTest,x.map=A.map,x.clipShadows=A.clipShadows,x.clippingPlanes=A.clippingPlanes,x.clipIntersection=A.clipIntersection,x.displacementMap=A.displacementMap,x.displacementScale=A.displacementScale,x.displacementBias=A.displacementBias,x.wireframeLinewidth=A.wireframeLinewidth,x.linewidth=A.linewidth,I.isPointLight===!0&&x.isMeshDistanceMaterial===!0){const Y=i.properties.get(x);Y.light=I}return x}function y(w,A,I,q,x){if(w.visible===!1)return;if(w.layers.test(A.layers)&&(w.isMesh||w.isLine||w.isPoints)&&(w.castShadow||w.receiveShadow&&x===on)&&(!w.frustumCulled||n.intersectsObject(w))){w.modelViewMatrix.multiplyMatrices(I.matrixWorldInverse,w.matrixWorld);const $=e.update(w),R=w.material;if(Array.isArray(R)){const V=$.groups;for(let H=0,K=V.length;H<K;H++){const k=V[H],X=R[k.materialIndex];if(X&&X.visible){const Z=M(w,X,q,x);w.onBeforeShadow(i,w,A,I,$,Z,k),i.renderBufferDirect(I,null,$,Z,w,k),w.onAfterShadow(i,w,A,I,$,Z,k)}}}else if(R.visible){const V=M(w,R,q,x);w.onBeforeShadow(i,w,A,I,$,V,null),i.renderBufferDirect(I,null,$,V,w,null),w.onAfterShadow(i,w,A,I,$,V,null)}}const Y=w.children;for(let $=0,R=Y.length;$<R;$++)y(Y[$],A,I,q,x)}function P(w){w.target.removeEventListener("dispose",P);for(const I in c){const q=c[I],x=w.target.uuid;x in q&&(q[x].dispose(),delete q[x])}}}function fm(i,e,t){const n=t.isWebGL2;function r(){let C=!1;const se=new mt;let F=null;const te=new mt(0,0,0,0);return{setMask:function(oe){F!==oe&&!C&&(i.colorMask(oe,oe,oe,oe),F=oe)},setLocked:function(oe){C=oe},setClear:function(oe,Ge,Ke,ft,Ft){Ft===!0&&(oe*=ft,Ge*=ft,Ke*=ft),se.set(oe,Ge,Ke,ft),te.equals(se)===!1&&(i.clearColor(oe,Ge,Ke,ft),te.copy(se))},reset:function(){C=!1,F=null,te.set(-1,0,0,0)}}}function s(){let C=!1,se=null,F=null,te=null;return{setTest:function(oe){oe?de(i.DEPTH_TEST):Xe(i.DEPTH_TEST)},setMask:function(oe){se!==oe&&!C&&(i.depthMask(oe),se=oe)},setFunc:function(oe){if(F!==oe){switch(oe){case Cc:i.depthFunc(i.NEVER);break;case Pc:i.depthFunc(i.ALWAYS);break;case Lc:i.depthFunc(i.LESS);break;case Mr:i.depthFunc(i.LEQUAL);break;case Dc:i.depthFunc(i.EQUAL);break;case Uc:i.depthFunc(i.GEQUAL);break;case Ic:i.depthFunc(i.GREATER);break;case Nc:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}F=oe}},setLocked:function(oe){C=oe},setClear:function(oe){te!==oe&&(i.clearDepth(oe),te=oe)},reset:function(){C=!1,se=null,F=null,te=null}}}function o(){let C=!1,se=null,F=null,te=null,oe=null,Ge=null,Ke=null,ft=null,Ft=null;return{setTest:function(Ze){C||(Ze?de(i.STENCIL_TEST):Xe(i.STENCIL_TEST))},setMask:function(Ze){se!==Ze&&!C&&(i.stencilMask(Ze),se=Ze)},setFunc:function(Ze,xt,Kt){(F!==Ze||te!==xt||oe!==Kt)&&(i.stencilFunc(Ze,xt,Kt),F=Ze,te=xt,oe=Kt)},setOp:function(Ze,xt,Kt){(Ge!==Ze||Ke!==xt||ft!==Kt)&&(i.stencilOp(Ze,xt,Kt),Ge=Ze,Ke=xt,ft=Kt)},setLocked:function(Ze){C=Ze},setClear:function(Ze){Ft!==Ze&&(i.clearStencil(Ze),Ft=Ze)},reset:function(){C=!1,se=null,F=null,te=null,oe=null,Ge=null,Ke=null,ft=null,Ft=null}}}const a=new r,l=new s,c=new o,u=new WeakMap,h=new WeakMap;let p={},m={},_=new WeakMap,g=[],d=null,f=!1,b=null,M=null,y=null,P=null,w=null,A=null,I=null,q=new We(0,0,0),x=0,T=!1,Y=null,$=null,R=null,V=null,H=null;const K=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let k=!1,X=0;const Z=i.getParameter(i.VERSION);Z.indexOf("WebGL")!==-1?(X=parseFloat(/^WebGL (\d)/.exec(Z)[1]),k=X>=1):Z.indexOf("OpenGL ES")!==-1&&(X=parseFloat(/^OpenGL ES (\d)/.exec(Z)[1]),k=X>=2);let ie=null,he={};const Ce=i.getParameter(i.SCISSOR_BOX),z=i.getParameter(i.VIEWPORT),J=new mt().fromArray(Ce),ce=new mt().fromArray(z);function Ee(C,se,F,te){const oe=new Uint8Array(4),Ge=i.createTexture();i.bindTexture(C,Ge),i.texParameteri(C,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(C,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let Ke=0;Ke<F;Ke++)n&&(C===i.TEXTURE_3D||C===i.TEXTURE_2D_ARRAY)?i.texImage3D(se,0,i.RGBA,1,1,te,0,i.RGBA,i.UNSIGNED_BYTE,oe):i.texImage2D(se+Ke,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,oe);return Ge}const ge={};ge[i.TEXTURE_2D]=Ee(i.TEXTURE_2D,i.TEXTURE_2D,1),ge[i.TEXTURE_CUBE_MAP]=Ee(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),n&&(ge[i.TEXTURE_2D_ARRAY]=Ee(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),ge[i.TEXTURE_3D]=Ee(i.TEXTURE_3D,i.TEXTURE_3D,1,1)),a.setClear(0,0,0,1),l.setClear(1),c.setClear(0),de(i.DEPTH_TEST),l.setFunc(Mr),Ne(!1),Be(ha),de(i.CULL_FACE),Me(Sn);function de(C){p[C]!==!0&&(i.enable(C),p[C]=!0)}function Xe(C){p[C]!==!1&&(i.disable(C),p[C]=!1)}function be(C,se){return m[C]!==se?(i.bindFramebuffer(C,se),m[C]=se,n&&(C===i.DRAW_FRAMEBUFFER&&(m[i.FRAMEBUFFER]=se),C===i.FRAMEBUFFER&&(m[i.DRAW_FRAMEBUFFER]=se)),!0):!1}function D(C,se){let F=g,te=!1;if(C){F=_.get(se),F===void 0&&(F=[],_.set(se,F));const oe=C.textures;if(F.length!==oe.length||F[0]!==i.COLOR_ATTACHMENT0){for(let Ge=0,Ke=oe.length;Ge<Ke;Ge++)F[Ge]=i.COLOR_ATTACHMENT0+Ge;F.length=oe.length,te=!0}}else F[0]!==i.BACK&&(F[0]=i.BACK,te=!0);if(te)if(t.isWebGL2)i.drawBuffers(F);else if(e.has("WEBGL_draw_buffers")===!0)e.get("WEBGL_draw_buffers").drawBuffersWEBGL(F);else throw new Error("THREE.WebGLState: Usage of gl.drawBuffers() require WebGL2 or WEBGL_draw_buffers extension")}function dt(C){return d!==C?(i.useProgram(C),d=C,!0):!1}const ve={[zn]:i.FUNC_ADD,[pc]:i.FUNC_SUBTRACT,[mc]:i.FUNC_REVERSE_SUBTRACT};if(n)ve[pa]=i.MIN,ve[ma]=i.MAX;else{const C=e.get("EXT_blend_minmax");C!==null&&(ve[pa]=C.MIN_EXT,ve[ma]=C.MAX_EXT)}const Oe={[gc]:i.ZERO,[_c]:i.ONE,[vc]:i.SRC_COLOR,[Es]:i.SRC_ALPHA,[bc]:i.SRC_ALPHA_SATURATE,[yc]:i.DST_COLOR,[Mc]:i.DST_ALPHA,[xc]:i.ONE_MINUS_SRC_COLOR,[bs]:i.ONE_MINUS_SRC_ALPHA,[Ec]:i.ONE_MINUS_DST_COLOR,[Sc]:i.ONE_MINUS_DST_ALPHA,[Tc]:i.CONSTANT_COLOR,[Ac]:i.ONE_MINUS_CONSTANT_COLOR,[wc]:i.CONSTANT_ALPHA,[Rc]:i.ONE_MINUS_CONSTANT_ALPHA};function Me(C,se,F,te,oe,Ge,Ke,ft,Ft,Ze){if(C===Sn){f===!0&&(Xe(i.BLEND),f=!1);return}if(f===!1&&(de(i.BLEND),f=!0),C!==fc){if(C!==b||Ze!==T){if((M!==zn||w!==zn)&&(i.blendEquation(i.FUNC_ADD),M=zn,w=zn),Ze)switch(C){case fi:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case ys:i.blendFunc(i.ONE,i.ONE);break;case da:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case fa:i.blendFuncSeparate(i.ZERO,i.SRC_COLOR,i.ZERO,i.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",C);break}else switch(C){case fi:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case ys:i.blendFunc(i.SRC_ALPHA,i.ONE);break;case da:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case fa:i.blendFunc(i.ZERO,i.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",C);break}y=null,P=null,A=null,I=null,q.set(0,0,0),x=0,b=C,T=Ze}return}oe=oe||se,Ge=Ge||F,Ke=Ke||te,(se!==M||oe!==w)&&(i.blendEquationSeparate(ve[se],ve[oe]),M=se,w=oe),(F!==y||te!==P||Ge!==A||Ke!==I)&&(i.blendFuncSeparate(Oe[F],Oe[te],Oe[Ge],Oe[Ke]),y=F,P=te,A=Ge,I=Ke),(ft.equals(q)===!1||Ft!==x)&&(i.blendColor(ft.r,ft.g,ft.b,Ft),q.copy(ft),x=Ft),b=C,T=!1}function He(C,se){C.side===Xt?Xe(i.CULL_FACE):de(i.CULL_FACE);let F=C.side===wt;se&&(F=!F),Ne(F),C.blending===fi&&C.transparent===!1?Me(Sn):Me(C.blending,C.blendEquation,C.blendSrc,C.blendDst,C.blendEquationAlpha,C.blendSrcAlpha,C.blendDstAlpha,C.blendColor,C.blendAlpha,C.premultipliedAlpha),l.setFunc(C.depthFunc),l.setTest(C.depthTest),l.setMask(C.depthWrite),a.setMask(C.colorWrite);const te=C.stencilWrite;c.setTest(te),te&&(c.setMask(C.stencilWriteMask),c.setFunc(C.stencilFunc,C.stencilRef,C.stencilFuncMask),c.setOp(C.stencilFail,C.stencilZFail,C.stencilZPass)),E(C.polygonOffset,C.polygonOffsetFactor,C.polygonOffsetUnits),C.alphaToCoverage===!0?de(i.SAMPLE_ALPHA_TO_COVERAGE):Xe(i.SAMPLE_ALPHA_TO_COVERAGE)}function Ne(C){Y!==C&&(C?i.frontFace(i.CW):i.frontFace(i.CCW),Y=C)}function Be(C){C!==uc?(de(i.CULL_FACE),C!==$&&(C===ha?i.cullFace(i.BACK):C===hc?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):Xe(i.CULL_FACE),$=C}function tt(C){C!==R&&(k&&i.lineWidth(C),R=C)}function E(C,se,F){C?(de(i.POLYGON_OFFSET_FILL),(V!==se||H!==F)&&(i.polygonOffset(se,F),V=se,H=F)):Xe(i.POLYGON_OFFSET_FILL)}function v(C){C?de(i.SCISSOR_TEST):Xe(i.SCISSOR_TEST)}function G(C){C===void 0&&(C=i.TEXTURE0+K-1),ie!==C&&(i.activeTexture(C),ie=C)}function W(C,se,F){F===void 0&&(ie===null?F=i.TEXTURE0+K-1:F=ie);let te=he[F];te===void 0&&(te={type:void 0,texture:void 0},he[F]=te),(te.type!==C||te.texture!==se)&&(ie!==F&&(i.activeTexture(F),ie=F),i.bindTexture(C,se||ge[C]),te.type=C,te.texture=se)}function Q(){const C=he[ie];C!==void 0&&C.type!==void 0&&(i.bindTexture(C.type,null),C.type=void 0,C.texture=void 0)}function j(){try{i.compressedTexImage2D.apply(i,arguments)}catch(C){console.error("THREE.WebGLState:",C)}}function Pe(){try{i.compressedTexImage3D.apply(i,arguments)}catch(C){console.error("THREE.WebGLState:",C)}}function Se(){try{i.texSubImage2D.apply(i,arguments)}catch(C){console.error("THREE.WebGLState:",C)}}function re(){try{i.texSubImage3D.apply(i,arguments)}catch(C){console.error("THREE.WebGLState:",C)}}function ae(){try{i.compressedTexSubImage2D.apply(i,arguments)}catch(C){console.error("THREE.WebGLState:",C)}}function Le(){try{i.compressedTexSubImage3D.apply(i,arguments)}catch(C){console.error("THREE.WebGLState:",C)}}function ee(){try{i.texStorage2D.apply(i,arguments)}catch(C){console.error("THREE.WebGLState:",C)}}function st(){try{i.texStorage3D.apply(i,arguments)}catch(C){console.error("THREE.WebGLState:",C)}}function ze(){try{i.texImage2D.apply(i,arguments)}catch(C){console.error("THREE.WebGLState:",C)}}function _e(){try{i.texImage3D.apply(i,arguments)}catch(C){console.error("THREE.WebGLState:",C)}}function fe(C){J.equals(C)===!1&&(i.scissor(C.x,C.y,C.z,C.w),J.copy(C))}function pe(C){ce.equals(C)===!1&&(i.viewport(C.x,C.y,C.z,C.w),ce.copy(C))}function ke(C,se){let F=h.get(se);F===void 0&&(F=new WeakMap,h.set(se,F));let te=F.get(C);te===void 0&&(te=i.getUniformBlockIndex(se,C.name),F.set(C,te))}function we(C,se){const te=h.get(se).get(C);u.get(se)!==te&&(i.uniformBlockBinding(se,te,C.__bindingPointIndex),u.set(se,te))}function Je(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),n===!0&&(i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null)),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),p={},ie=null,he={},m={},_=new WeakMap,g=[],d=null,f=!1,b=null,M=null,y=null,P=null,w=null,A=null,I=null,q=new We(0,0,0),x=0,T=!1,Y=null,$=null,R=null,V=null,H=null,J.set(0,0,i.canvas.width,i.canvas.height),ce.set(0,0,i.canvas.width,i.canvas.height),a.reset(),l.reset(),c.reset()}return{buffers:{color:a,depth:l,stencil:c},enable:de,disable:Xe,bindFramebuffer:be,drawBuffers:D,useProgram:dt,setBlending:Me,setMaterial:He,setFlipSided:Ne,setCullFace:Be,setLineWidth:tt,setPolygonOffset:E,setScissorTest:v,activeTexture:G,bindTexture:W,unbindTexture:Q,compressedTexImage2D:j,compressedTexImage3D:Pe,texImage2D:ze,texImage3D:_e,updateUBOMapping:ke,uniformBlockBinding:we,texStorage2D:ee,texStorage3D:st,texSubImage2D:Se,texSubImage3D:re,compressedTexSubImage2D:ae,compressedTexSubImage3D:Le,scissor:fe,viewport:pe,reset:Je}}function pm(i,e,t,n,r,s,o){const a=r.isWebGL2,l=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,c=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),u=new Ve,h=new WeakMap;let p;const m=new WeakMap;let _=!1;try{_=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(E,v){return _?new OffscreenCanvas(E,v):Tr("canvas")}function d(E,v,G,W){let Q=1;const j=tt(E);if((j.width>W||j.height>W)&&(Q=W/Math.max(j.width,j.height)),Q<1||v===!0)if(typeof HTMLImageElement<"u"&&E instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&E instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&E instanceof ImageBitmap||typeof VideoFrame<"u"&&E instanceof VideoFrame){const Pe=v?Ls:Math.floor,Se=Pe(Q*j.width),re=Pe(Q*j.height);p===void 0&&(p=g(Se,re));const ae=G?g(Se,re):p;return ae.width=Se,ae.height=re,ae.getContext("2d").drawImage(E,0,0,Se,re),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+j.width+"x"+j.height+") to ("+Se+"x"+re+")."),ae}else return"data"in E&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+j.width+"x"+j.height+")."),E;return E}function f(E){const v=tt(E);return Xa(v.width)&&Xa(v.height)}function b(E){return a?!1:E.wrapS!==qt||E.wrapT!==qt||E.minFilter!==yt&&E.minFilter!==Tt}function M(E,v){return E.generateMipmaps&&v&&E.minFilter!==yt&&E.minFilter!==Tt}function y(E){i.generateMipmap(E)}function P(E,v,G,W,Q=!1){if(a===!1)return v;if(E!==null){if(i[E]!==void 0)return i[E];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+E+"'")}let j=v;if(v===i.RED&&(G===i.FLOAT&&(j=i.R32F),G===i.HALF_FLOAT&&(j=i.R16F),G===i.UNSIGNED_BYTE&&(j=i.R8)),v===i.RED_INTEGER&&(G===i.UNSIGNED_BYTE&&(j=i.R8UI),G===i.UNSIGNED_SHORT&&(j=i.R16UI),G===i.UNSIGNED_INT&&(j=i.R32UI),G===i.BYTE&&(j=i.R8I),G===i.SHORT&&(j=i.R16I),G===i.INT&&(j=i.R32I)),v===i.RG&&(G===i.FLOAT&&(j=i.RG32F),G===i.HALF_FLOAT&&(j=i.RG16F),G===i.UNSIGNED_BYTE&&(j=i.RG8)),v===i.RG_INTEGER&&(G===i.UNSIGNED_BYTE&&(j=i.RG8UI),G===i.UNSIGNED_SHORT&&(j=i.RG16UI),G===i.UNSIGNED_INT&&(j=i.RG32UI),G===i.BYTE&&(j=i.RG8I),G===i.SHORT&&(j=i.RG16I),G===i.INT&&(j=i.RG32I)),v===i.RGBA){const Pe=Q?Sr:$e.getTransfer(W);G===i.FLOAT&&(j=i.RGBA32F),G===i.HALF_FLOAT&&(j=i.RGBA16F),G===i.UNSIGNED_BYTE&&(j=Pe===je?i.SRGB8_ALPHA8:i.RGBA8),G===i.UNSIGNED_SHORT_4_4_4_4&&(j=i.RGBA4),G===i.UNSIGNED_SHORT_5_5_5_1&&(j=i.RGB5_A1)}return(j===i.R16F||j===i.R32F||j===i.RG16F||j===i.RG32F||j===i.RGBA16F||j===i.RGBA32F)&&e.get("EXT_color_buffer_float"),j}function w(E,v,G){return M(E,G)===!0||E.isFramebufferTexture&&E.minFilter!==yt&&E.minFilter!==Tt?Math.log2(Math.max(v.width,v.height))+1:E.mipmaps!==void 0&&E.mipmaps.length>0?E.mipmaps.length:E.isCompressedTexture&&Array.isArray(E.image)?v.mipmaps.length:1}function A(E){return E===yt||E===ga||E===Ti?i.NEAREST:i.LINEAR}function I(E){const v=E.target;v.removeEventListener("dispose",I),x(v),v.isVideoTexture&&h.delete(v)}function q(E){const v=E.target;v.removeEventListener("dispose",q),Y(v)}function x(E){const v=n.get(E);if(v.__webglInit===void 0)return;const G=E.source,W=m.get(G);if(W){const Q=W[v.__cacheKey];Q.usedTimes--,Q.usedTimes===0&&T(E),Object.keys(W).length===0&&m.delete(G)}n.remove(E)}function T(E){const v=n.get(E);i.deleteTexture(v.__webglTexture);const G=E.source,W=m.get(G);delete W[v.__cacheKey],o.memory.textures--}function Y(E){const v=n.get(E);if(E.depthTexture&&E.depthTexture.dispose(),E.isWebGLCubeRenderTarget)for(let W=0;W<6;W++){if(Array.isArray(v.__webglFramebuffer[W]))for(let Q=0;Q<v.__webglFramebuffer[W].length;Q++)i.deleteFramebuffer(v.__webglFramebuffer[W][Q]);else i.deleteFramebuffer(v.__webglFramebuffer[W]);v.__webglDepthbuffer&&i.deleteRenderbuffer(v.__webglDepthbuffer[W])}else{if(Array.isArray(v.__webglFramebuffer))for(let W=0;W<v.__webglFramebuffer.length;W++)i.deleteFramebuffer(v.__webglFramebuffer[W]);else i.deleteFramebuffer(v.__webglFramebuffer);if(v.__webglDepthbuffer&&i.deleteRenderbuffer(v.__webglDepthbuffer),v.__webglMultisampledFramebuffer&&i.deleteFramebuffer(v.__webglMultisampledFramebuffer),v.__webglColorRenderbuffer)for(let W=0;W<v.__webglColorRenderbuffer.length;W++)v.__webglColorRenderbuffer[W]&&i.deleteRenderbuffer(v.__webglColorRenderbuffer[W]);v.__webglDepthRenderbuffer&&i.deleteRenderbuffer(v.__webglDepthRenderbuffer)}const G=E.textures;for(let W=0,Q=G.length;W<Q;W++){const j=n.get(G[W]);j.__webglTexture&&(i.deleteTexture(j.__webglTexture),o.memory.textures--),n.remove(G[W])}n.remove(E)}let $=0;function R(){$=0}function V(){const E=$;return E>=r.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+E+" texture units while this GPU supports only "+r.maxTextures),$+=1,E}function H(E){const v=[];return v.push(E.wrapS),v.push(E.wrapT),v.push(E.wrapR||0),v.push(E.magFilter),v.push(E.minFilter),v.push(E.anisotropy),v.push(E.internalFormat),v.push(E.format),v.push(E.type),v.push(E.generateMipmaps),v.push(E.premultiplyAlpha),v.push(E.flipY),v.push(E.unpackAlignment),v.push(E.colorSpace),v.join()}function K(E,v){const G=n.get(E);if(E.isVideoTexture&&Ne(E),E.isRenderTargetTexture===!1&&E.version>0&&G.__version!==E.version){const W=E.image;if(W===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(W.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{ce(G,E,v);return}}t.bindTexture(i.TEXTURE_2D,G.__webglTexture,i.TEXTURE0+v)}function k(E,v){const G=n.get(E);if(E.version>0&&G.__version!==E.version){ce(G,E,v);return}t.bindTexture(i.TEXTURE_2D_ARRAY,G.__webglTexture,i.TEXTURE0+v)}function X(E,v){const G=n.get(E);if(E.version>0&&G.__version!==E.version){ce(G,E,v);return}t.bindTexture(i.TEXTURE_3D,G.__webglTexture,i.TEXTURE0+v)}function Z(E,v){const G=n.get(E);if(E.version>0&&G.__version!==E.version){Ee(G,E,v);return}t.bindTexture(i.TEXTURE_CUBE_MAP,G.__webglTexture,i.TEXTURE0+v)}const ie={[ws]:i.REPEAT,[qt]:i.CLAMP_TO_EDGE,[Rs]:i.MIRRORED_REPEAT},he={[yt]:i.NEAREST,[ga]:i.NEAREST_MIPMAP_NEAREST,[Ti]:i.NEAREST_MIPMAP_LINEAR,[Tt]:i.LINEAR,[zr]:i.LINEAR_MIPMAP_NEAREST,[Hn]:i.LINEAR_MIPMAP_LINEAR},Ce={[iu]:i.NEVER,[cu]:i.ALWAYS,[ru]:i.LESS,[Jo]:i.LEQUAL,[su]:i.EQUAL,[lu]:i.GEQUAL,[au]:i.GREATER,[ou]:i.NOTEQUAL};function z(E,v,G){if(v.type===ln&&e.has("OES_texture_float_linear")===!1&&(v.magFilter===Tt||v.magFilter===zr||v.magFilter===Ti||v.magFilter===Hn||v.minFilter===Tt||v.minFilter===zr||v.minFilter===Ti||v.minFilter===Hn)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),G?(i.texParameteri(E,i.TEXTURE_WRAP_S,ie[v.wrapS]),i.texParameteri(E,i.TEXTURE_WRAP_T,ie[v.wrapT]),(E===i.TEXTURE_3D||E===i.TEXTURE_2D_ARRAY)&&i.texParameteri(E,i.TEXTURE_WRAP_R,ie[v.wrapR]),i.texParameteri(E,i.TEXTURE_MAG_FILTER,he[v.magFilter]),i.texParameteri(E,i.TEXTURE_MIN_FILTER,he[v.minFilter])):(i.texParameteri(E,i.TEXTURE_WRAP_S,i.CLAMP_TO_EDGE),i.texParameteri(E,i.TEXTURE_WRAP_T,i.CLAMP_TO_EDGE),(E===i.TEXTURE_3D||E===i.TEXTURE_2D_ARRAY)&&i.texParameteri(E,i.TEXTURE_WRAP_R,i.CLAMP_TO_EDGE),(v.wrapS!==qt||v.wrapT!==qt)&&console.warn("THREE.WebGLRenderer: Texture is not power of two. Texture.wrapS and Texture.wrapT should be set to THREE.ClampToEdgeWrapping."),i.texParameteri(E,i.TEXTURE_MAG_FILTER,A(v.magFilter)),i.texParameteri(E,i.TEXTURE_MIN_FILTER,A(v.minFilter)),v.minFilter!==yt&&v.minFilter!==Tt&&console.warn("THREE.WebGLRenderer: Texture is not power of two. Texture.minFilter should be set to THREE.NearestFilter or THREE.LinearFilter.")),v.compareFunction&&(i.texParameteri(E,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(E,i.TEXTURE_COMPARE_FUNC,Ce[v.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(v.magFilter===yt||v.minFilter!==Ti&&v.minFilter!==Hn||v.type===ln&&e.has("OES_texture_float_linear")===!1||a===!1&&v.type===Di&&e.has("OES_texture_half_float_linear")===!1)return;if(v.anisotropy>1||n.get(v).__currentAnisotropy){const W=e.get("EXT_texture_filter_anisotropic");i.texParameterf(E,W.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(v.anisotropy,r.getMaxAnisotropy())),n.get(v).__currentAnisotropy=v.anisotropy}}}function J(E,v){let G=!1;E.__webglInit===void 0&&(E.__webglInit=!0,v.addEventListener("dispose",I));const W=v.source;let Q=m.get(W);Q===void 0&&(Q={},m.set(W,Q));const j=H(v);if(j!==E.__cacheKey){Q[j]===void 0&&(Q[j]={texture:i.createTexture(),usedTimes:0},o.memory.textures++,G=!0),Q[j].usedTimes++;const Pe=Q[E.__cacheKey];Pe!==void 0&&(Q[E.__cacheKey].usedTimes--,Pe.usedTimes===0&&T(v)),E.__cacheKey=j,E.__webglTexture=Q[j].texture}return G}function ce(E,v,G){let W=i.TEXTURE_2D;(v.isDataArrayTexture||v.isCompressedArrayTexture)&&(W=i.TEXTURE_2D_ARRAY),v.isData3DTexture&&(W=i.TEXTURE_3D);const Q=J(E,v),j=v.source;t.bindTexture(W,E.__webglTexture,i.TEXTURE0+G);const Pe=n.get(j);if(j.version!==Pe.__version||Q===!0){t.activeTexture(i.TEXTURE0+G);const Se=$e.getPrimaries($e.workingColorSpace),re=v.colorSpace===xn?null:$e.getPrimaries(v.colorSpace),ae=v.colorSpace===xn||Se===re?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,v.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,v.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,v.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,ae);const Le=b(v)&&f(v.image)===!1;let ee=d(v.image,Le,!1,r.maxTextureSize);ee=Be(v,ee);const st=f(ee)||a,ze=s.convert(v.format,v.colorSpace);let _e=s.convert(v.type),fe=P(v.internalFormat,ze,_e,v.colorSpace,v.isVideoTexture);z(W,v,st);let pe;const ke=v.mipmaps,we=a&&v.isVideoTexture!==!0&&fe!==jo,Je=Pe.__version===void 0||Q===!0,C=j.dataReady,se=w(v,ee,st);if(v.isDepthTexture)fe=i.DEPTH_COMPONENT,a?v.type===ln?fe=i.DEPTH_COMPONENT32F:v.type===Mn?fe=i.DEPTH_COMPONENT24:v.type===Vn?fe=i.DEPTH24_STENCIL8:fe=i.DEPTH_COMPONENT16:v.type===ln&&console.error("WebGLRenderer: Floating point depth texture requires WebGL2."),v.format===Wn&&fe===i.DEPTH_COMPONENT&&v.type!==Bs&&v.type!==Mn&&(console.warn("THREE.WebGLRenderer: Use UnsignedShortType or UnsignedIntType for DepthFormat DepthTexture."),v.type=Mn,_e=s.convert(v.type)),v.format===vi&&fe===i.DEPTH_COMPONENT&&(fe=i.DEPTH_STENCIL,v.type!==Vn&&(console.warn("THREE.WebGLRenderer: Use UnsignedInt248Type for DepthStencilFormat DepthTexture."),v.type=Vn,_e=s.convert(v.type))),Je&&(we?t.texStorage2D(i.TEXTURE_2D,1,fe,ee.width,ee.height):t.texImage2D(i.TEXTURE_2D,0,fe,ee.width,ee.height,0,ze,_e,null));else if(v.isDataTexture)if(ke.length>0&&st){we&&Je&&t.texStorage2D(i.TEXTURE_2D,se,fe,ke[0].width,ke[0].height);for(let F=0,te=ke.length;F<te;F++)pe=ke[F],we?C&&t.texSubImage2D(i.TEXTURE_2D,F,0,0,pe.width,pe.height,ze,_e,pe.data):t.texImage2D(i.TEXTURE_2D,F,fe,pe.width,pe.height,0,ze,_e,pe.data);v.generateMipmaps=!1}else we?(Je&&t.texStorage2D(i.TEXTURE_2D,se,fe,ee.width,ee.height),C&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,ee.width,ee.height,ze,_e,ee.data)):t.texImage2D(i.TEXTURE_2D,0,fe,ee.width,ee.height,0,ze,_e,ee.data);else if(v.isCompressedTexture)if(v.isCompressedArrayTexture){we&&Je&&t.texStorage3D(i.TEXTURE_2D_ARRAY,se,fe,ke[0].width,ke[0].height,ee.depth);for(let F=0,te=ke.length;F<te;F++)pe=ke[F],v.format!==Yt?ze!==null?we?C&&t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,F,0,0,0,pe.width,pe.height,ee.depth,ze,pe.data,0,0):t.compressedTexImage3D(i.TEXTURE_2D_ARRAY,F,fe,pe.width,pe.height,ee.depth,0,pe.data,0,0):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):we?C&&t.texSubImage3D(i.TEXTURE_2D_ARRAY,F,0,0,0,pe.width,pe.height,ee.depth,ze,_e,pe.data):t.texImage3D(i.TEXTURE_2D_ARRAY,F,fe,pe.width,pe.height,ee.depth,0,ze,_e,pe.data)}else{we&&Je&&t.texStorage2D(i.TEXTURE_2D,se,fe,ke[0].width,ke[0].height);for(let F=0,te=ke.length;F<te;F++)pe=ke[F],v.format!==Yt?ze!==null?we?C&&t.compressedTexSubImage2D(i.TEXTURE_2D,F,0,0,pe.width,pe.height,ze,pe.data):t.compressedTexImage2D(i.TEXTURE_2D,F,fe,pe.width,pe.height,0,pe.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):we?C&&t.texSubImage2D(i.TEXTURE_2D,F,0,0,pe.width,pe.height,ze,_e,pe.data):t.texImage2D(i.TEXTURE_2D,F,fe,pe.width,pe.height,0,ze,_e,pe.data)}else if(v.isDataArrayTexture)we?(Je&&t.texStorage3D(i.TEXTURE_2D_ARRAY,se,fe,ee.width,ee.height,ee.depth),C&&t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,ee.width,ee.height,ee.depth,ze,_e,ee.data)):t.texImage3D(i.TEXTURE_2D_ARRAY,0,fe,ee.width,ee.height,ee.depth,0,ze,_e,ee.data);else if(v.isData3DTexture)we?(Je&&t.texStorage3D(i.TEXTURE_3D,se,fe,ee.width,ee.height,ee.depth),C&&t.texSubImage3D(i.TEXTURE_3D,0,0,0,0,ee.width,ee.height,ee.depth,ze,_e,ee.data)):t.texImage3D(i.TEXTURE_3D,0,fe,ee.width,ee.height,ee.depth,0,ze,_e,ee.data);else if(v.isFramebufferTexture){if(Je)if(we)t.texStorage2D(i.TEXTURE_2D,se,fe,ee.width,ee.height);else{let F=ee.width,te=ee.height;for(let oe=0;oe<se;oe++)t.texImage2D(i.TEXTURE_2D,oe,fe,F,te,0,ze,_e,null),F>>=1,te>>=1}}else if(ke.length>0&&st){if(we&&Je){const F=tt(ke[0]);t.texStorage2D(i.TEXTURE_2D,se,fe,F.width,F.height)}for(let F=0,te=ke.length;F<te;F++)pe=ke[F],we?C&&t.texSubImage2D(i.TEXTURE_2D,F,0,0,ze,_e,pe):t.texImage2D(i.TEXTURE_2D,F,fe,ze,_e,pe);v.generateMipmaps=!1}else if(we){if(Je){const F=tt(ee);t.texStorage2D(i.TEXTURE_2D,se,fe,F.width,F.height)}C&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,ze,_e,ee)}else t.texImage2D(i.TEXTURE_2D,0,fe,ze,_e,ee);M(v,st)&&y(W),Pe.__version=j.version,v.onUpdate&&v.onUpdate(v)}E.__version=v.version}function Ee(E,v,G){if(v.image.length!==6)return;const W=J(E,v),Q=v.source;t.bindTexture(i.TEXTURE_CUBE_MAP,E.__webglTexture,i.TEXTURE0+G);const j=n.get(Q);if(Q.version!==j.__version||W===!0){t.activeTexture(i.TEXTURE0+G);const Pe=$e.getPrimaries($e.workingColorSpace),Se=v.colorSpace===xn?null:$e.getPrimaries(v.colorSpace),re=v.colorSpace===xn||Pe===Se?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,v.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,v.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,v.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,re);const ae=v.isCompressedTexture||v.image[0].isCompressedTexture,Le=v.image[0]&&v.image[0].isDataTexture,ee=[];for(let F=0;F<6;F++)!ae&&!Le?ee[F]=d(v.image[F],!1,!0,r.maxCubemapSize):ee[F]=Le?v.image[F].image:v.image[F],ee[F]=Be(v,ee[F]);const st=ee[0],ze=f(st)||a,_e=s.convert(v.format,v.colorSpace),fe=s.convert(v.type),pe=P(v.internalFormat,_e,fe,v.colorSpace),ke=a&&v.isVideoTexture!==!0,we=j.__version===void 0||W===!0,Je=Q.dataReady;let C=w(v,st,ze);z(i.TEXTURE_CUBE_MAP,v,ze);let se;if(ae){ke&&we&&t.texStorage2D(i.TEXTURE_CUBE_MAP,C,pe,st.width,st.height);for(let F=0;F<6;F++){se=ee[F].mipmaps;for(let te=0;te<se.length;te++){const oe=se[te];v.format!==Yt?_e!==null?ke?Je&&t.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+F,te,0,0,oe.width,oe.height,_e,oe.data):t.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+F,te,pe,oe.width,oe.height,0,oe.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):ke?Je&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+F,te,0,0,oe.width,oe.height,_e,fe,oe.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+F,te,pe,oe.width,oe.height,0,_e,fe,oe.data)}}}else{if(se=v.mipmaps,ke&&we){se.length>0&&C++;const F=tt(ee[0]);t.texStorage2D(i.TEXTURE_CUBE_MAP,C,pe,F.width,F.height)}for(let F=0;F<6;F++)if(Le){ke?Je&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+F,0,0,0,ee[F].width,ee[F].height,_e,fe,ee[F].data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+F,0,pe,ee[F].width,ee[F].height,0,_e,fe,ee[F].data);for(let te=0;te<se.length;te++){const Ge=se[te].image[F].image;ke?Je&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+F,te+1,0,0,Ge.width,Ge.height,_e,fe,Ge.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+F,te+1,pe,Ge.width,Ge.height,0,_e,fe,Ge.data)}}else{ke?Je&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+F,0,0,0,_e,fe,ee[F]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+F,0,pe,_e,fe,ee[F]);for(let te=0;te<se.length;te++){const oe=se[te];ke?Je&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+F,te+1,0,0,_e,fe,oe.image[F]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+F,te+1,pe,_e,fe,oe.image[F])}}}M(v,ze)&&y(i.TEXTURE_CUBE_MAP),j.__version=Q.version,v.onUpdate&&v.onUpdate(v)}E.__version=v.version}function ge(E,v,G,W,Q,j){const Pe=s.convert(G.format,G.colorSpace),Se=s.convert(G.type),re=P(G.internalFormat,Pe,Se,G.colorSpace);if(!n.get(v).__hasExternalTextures){const Le=Math.max(1,v.width>>j),ee=Math.max(1,v.height>>j);Q===i.TEXTURE_3D||Q===i.TEXTURE_2D_ARRAY?t.texImage3D(Q,j,re,Le,ee,v.depth,0,Pe,Se,null):t.texImage2D(Q,j,re,Le,ee,0,Pe,Se,null)}t.bindFramebuffer(i.FRAMEBUFFER,E),He(v)?l.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,W,Q,n.get(G).__webglTexture,0,Me(v)):(Q===i.TEXTURE_2D||Q>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&Q<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,W,Q,n.get(G).__webglTexture,j),t.bindFramebuffer(i.FRAMEBUFFER,null)}function de(E,v,G){if(i.bindRenderbuffer(i.RENDERBUFFER,E),v.depthBuffer&&!v.stencilBuffer){let W=a===!0?i.DEPTH_COMPONENT24:i.DEPTH_COMPONENT16;if(G||He(v)){const Q=v.depthTexture;Q&&Q.isDepthTexture&&(Q.type===ln?W=i.DEPTH_COMPONENT32F:Q.type===Mn&&(W=i.DEPTH_COMPONENT24));const j=Me(v);He(v)?l.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,j,W,v.width,v.height):i.renderbufferStorageMultisample(i.RENDERBUFFER,j,W,v.width,v.height)}else i.renderbufferStorage(i.RENDERBUFFER,W,v.width,v.height);i.framebufferRenderbuffer(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.RENDERBUFFER,E)}else if(v.depthBuffer&&v.stencilBuffer){const W=Me(v);G&&He(v)===!1?i.renderbufferStorageMultisample(i.RENDERBUFFER,W,i.DEPTH24_STENCIL8,v.width,v.height):He(v)?l.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,W,i.DEPTH24_STENCIL8,v.width,v.height):i.renderbufferStorage(i.RENDERBUFFER,i.DEPTH_STENCIL,v.width,v.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.RENDERBUFFER,E)}else{const W=v.textures;for(let Q=0;Q<W.length;Q++){const j=W[Q],Pe=s.convert(j.format,j.colorSpace),Se=s.convert(j.type),re=P(j.internalFormat,Pe,Se,j.colorSpace),ae=Me(v);G&&He(v)===!1?i.renderbufferStorageMultisample(i.RENDERBUFFER,ae,re,v.width,v.height):He(v)?l.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,ae,re,v.width,v.height):i.renderbufferStorage(i.RENDERBUFFER,re,v.width,v.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function Xe(E,v){if(v&&v.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(i.FRAMEBUFFER,E),!(v.depthTexture&&v.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");(!n.get(v.depthTexture).__webglTexture||v.depthTexture.image.width!==v.width||v.depthTexture.image.height!==v.height)&&(v.depthTexture.image.width=v.width,v.depthTexture.image.height=v.height,v.depthTexture.needsUpdate=!0),K(v.depthTexture,0);const W=n.get(v.depthTexture).__webglTexture,Q=Me(v);if(v.depthTexture.format===Wn)He(v)?l.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,W,0,Q):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,W,0);else if(v.depthTexture.format===vi)He(v)?l.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,W,0,Q):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,W,0);else throw new Error("Unknown depthTexture format")}function be(E){const v=n.get(E),G=E.isWebGLCubeRenderTarget===!0;if(E.depthTexture&&!v.__autoAllocateDepthBuffer){if(G)throw new Error("target.depthTexture not supported in Cube render targets");Xe(v.__webglFramebuffer,E)}else if(G){v.__webglDepthbuffer=[];for(let W=0;W<6;W++)t.bindFramebuffer(i.FRAMEBUFFER,v.__webglFramebuffer[W]),v.__webglDepthbuffer[W]=i.createRenderbuffer(),de(v.__webglDepthbuffer[W],E,!1)}else t.bindFramebuffer(i.FRAMEBUFFER,v.__webglFramebuffer),v.__webglDepthbuffer=i.createRenderbuffer(),de(v.__webglDepthbuffer,E,!1);t.bindFramebuffer(i.FRAMEBUFFER,null)}function D(E,v,G){const W=n.get(E);v!==void 0&&ge(W.__webglFramebuffer,E,E.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),G!==void 0&&be(E)}function dt(E){const v=E.texture,G=n.get(E),W=n.get(v);E.addEventListener("dispose",q);const Q=E.textures,j=E.isWebGLCubeRenderTarget===!0,Pe=Q.length>1,Se=f(E)||a;if(Pe||(W.__webglTexture===void 0&&(W.__webglTexture=i.createTexture()),W.__version=v.version,o.memory.textures++),j){G.__webglFramebuffer=[];for(let re=0;re<6;re++)if(a&&v.mipmaps&&v.mipmaps.length>0){G.__webglFramebuffer[re]=[];for(let ae=0;ae<v.mipmaps.length;ae++)G.__webglFramebuffer[re][ae]=i.createFramebuffer()}else G.__webglFramebuffer[re]=i.createFramebuffer()}else{if(a&&v.mipmaps&&v.mipmaps.length>0){G.__webglFramebuffer=[];for(let re=0;re<v.mipmaps.length;re++)G.__webglFramebuffer[re]=i.createFramebuffer()}else G.__webglFramebuffer=i.createFramebuffer();if(Pe)if(r.drawBuffers)for(let re=0,ae=Q.length;re<ae;re++){const Le=n.get(Q[re]);Le.__webglTexture===void 0&&(Le.__webglTexture=i.createTexture(),o.memory.textures++)}else console.warn("THREE.WebGLRenderer: WebGLMultipleRenderTargets can only be used with WebGL2 or WEBGL_draw_buffers extension.");if(a&&E.samples>0&&He(E)===!1){G.__webglMultisampledFramebuffer=i.createFramebuffer(),G.__webglColorRenderbuffer=[],t.bindFramebuffer(i.FRAMEBUFFER,G.__webglMultisampledFramebuffer);for(let re=0;re<Q.length;re++){const ae=Q[re];G.__webglColorRenderbuffer[re]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,G.__webglColorRenderbuffer[re]);const Le=s.convert(ae.format,ae.colorSpace),ee=s.convert(ae.type),st=P(ae.internalFormat,Le,ee,ae.colorSpace,E.isXRRenderTarget===!0),ze=Me(E);i.renderbufferStorageMultisample(i.RENDERBUFFER,ze,st,E.width,E.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+re,i.RENDERBUFFER,G.__webglColorRenderbuffer[re])}i.bindRenderbuffer(i.RENDERBUFFER,null),E.depthBuffer&&(G.__webglDepthRenderbuffer=i.createRenderbuffer(),de(G.__webglDepthRenderbuffer,E,!0)),t.bindFramebuffer(i.FRAMEBUFFER,null)}}if(j){t.bindTexture(i.TEXTURE_CUBE_MAP,W.__webglTexture),z(i.TEXTURE_CUBE_MAP,v,Se);for(let re=0;re<6;re++)if(a&&v.mipmaps&&v.mipmaps.length>0)for(let ae=0;ae<v.mipmaps.length;ae++)ge(G.__webglFramebuffer[re][ae],E,v,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+re,ae);else ge(G.__webglFramebuffer[re],E,v,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+re,0);M(v,Se)&&y(i.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(Pe){for(let re=0,ae=Q.length;re<ae;re++){const Le=Q[re],ee=n.get(Le);t.bindTexture(i.TEXTURE_2D,ee.__webglTexture),z(i.TEXTURE_2D,Le,Se),ge(G.__webglFramebuffer,E,Le,i.COLOR_ATTACHMENT0+re,i.TEXTURE_2D,0),M(Le,Se)&&y(i.TEXTURE_2D)}t.unbindTexture()}else{let re=i.TEXTURE_2D;if((E.isWebGL3DRenderTarget||E.isWebGLArrayRenderTarget)&&(a?re=E.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY:console.error("THREE.WebGLTextures: THREE.Data3DTexture and THREE.DataArrayTexture only supported with WebGL2.")),t.bindTexture(re,W.__webglTexture),z(re,v,Se),a&&v.mipmaps&&v.mipmaps.length>0)for(let ae=0;ae<v.mipmaps.length;ae++)ge(G.__webglFramebuffer[ae],E,v,i.COLOR_ATTACHMENT0,re,ae);else ge(G.__webglFramebuffer,E,v,i.COLOR_ATTACHMENT0,re,0);M(v,Se)&&y(re),t.unbindTexture()}E.depthBuffer&&be(E)}function ve(E){const v=f(E)||a,G=E.textures;for(let W=0,Q=G.length;W<Q;W++){const j=G[W];if(M(j,v)){const Pe=E.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:i.TEXTURE_2D,Se=n.get(j).__webglTexture;t.bindTexture(Pe,Se),y(Pe),t.unbindTexture()}}}function Oe(E){if(a&&E.samples>0&&He(E)===!1){const v=E.textures,G=E.width,W=E.height;let Q=i.COLOR_BUFFER_BIT;const j=[],Pe=E.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,Se=n.get(E),re=v.length>1;if(re)for(let ae=0;ae<v.length;ae++)t.bindFramebuffer(i.FRAMEBUFFER,Se.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ae,i.RENDERBUFFER,null),t.bindFramebuffer(i.FRAMEBUFFER,Se.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+ae,i.TEXTURE_2D,null,0);t.bindFramebuffer(i.READ_FRAMEBUFFER,Se.__webglMultisampledFramebuffer),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,Se.__webglFramebuffer);for(let ae=0;ae<v.length;ae++){j.push(i.COLOR_ATTACHMENT0+ae),E.depthBuffer&&j.push(Pe);const Le=Se.__ignoreDepthValues!==void 0?Se.__ignoreDepthValues:!1;if(Le===!1&&(E.depthBuffer&&(Q|=i.DEPTH_BUFFER_BIT),E.stencilBuffer&&(Q|=i.STENCIL_BUFFER_BIT)),re&&i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,Se.__webglColorRenderbuffer[ae]),Le===!0&&(i.invalidateFramebuffer(i.READ_FRAMEBUFFER,[Pe]),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[Pe])),re){const ee=n.get(v[ae]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,ee,0)}i.blitFramebuffer(0,0,G,W,0,0,G,W,Q,i.NEAREST),c&&i.invalidateFramebuffer(i.READ_FRAMEBUFFER,j)}if(t.bindFramebuffer(i.READ_FRAMEBUFFER,null),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),re)for(let ae=0;ae<v.length;ae++){t.bindFramebuffer(i.FRAMEBUFFER,Se.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ae,i.RENDERBUFFER,Se.__webglColorRenderbuffer[ae]);const Le=n.get(v[ae]).__webglTexture;t.bindFramebuffer(i.FRAMEBUFFER,Se.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+ae,i.TEXTURE_2D,Le,0)}t.bindFramebuffer(i.DRAW_FRAMEBUFFER,Se.__webglMultisampledFramebuffer)}}function Me(E){return Math.min(r.maxSamples,E.samples)}function He(E){const v=n.get(E);return a&&E.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&v.__useRenderToTexture!==!1}function Ne(E){const v=o.render.frame;h.get(E)!==v&&(h.set(E,v),E.update())}function Be(E,v){const G=E.colorSpace,W=E.format,Q=E.type;return E.isCompressedTexture===!0||E.isVideoTexture===!0||E.format===Cs||G!==wn&&G!==xn&&($e.getTransfer(G)===je?a===!1?e.has("EXT_sRGB")===!0&&W===Yt?(E.format=Cs,E.minFilter=Tt,E.generateMipmaps=!1):v=el.sRGBToLinear(v):(W!==Yt||Q!==En)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",G)),v}function tt(E){return typeof HTMLImageElement<"u"&&E instanceof HTMLImageElement?(u.width=E.naturalWidth||E.width,u.height=E.naturalHeight||E.height):typeof VideoFrame<"u"&&E instanceof VideoFrame?(u.width=E.displayWidth,u.height=E.displayHeight):(u.width=E.width,u.height=E.height),u}this.allocateTextureUnit=V,this.resetTextureUnits=R,this.setTexture2D=K,this.setTexture2DArray=k,this.setTexture3D=X,this.setTextureCube=Z,this.rebindTextures=D,this.setupRenderTarget=dt,this.updateRenderTargetMipmap=ve,this.updateMultisampleRenderTarget=Oe,this.setupDepthRenderbuffer=be,this.setupFrameBufferTexture=ge,this.useMultisampledRTT=He}function mm(i,e,t){const n=t.isWebGL2;function r(s,o=xn){let a;const l=$e.getTransfer(o);if(s===En)return i.UNSIGNED_BYTE;if(s===qo)return i.UNSIGNED_SHORT_4_4_4_4;if(s===Yo)return i.UNSIGNED_SHORT_5_5_5_1;if(s===Xc)return i.BYTE;if(s===qc)return i.SHORT;if(s===Bs)return i.UNSIGNED_SHORT;if(s===Xo)return i.INT;if(s===Mn)return i.UNSIGNED_INT;if(s===ln)return i.FLOAT;if(s===Di)return n?i.HALF_FLOAT:(a=e.get("OES_texture_half_float"),a!==null?a.HALF_FLOAT_OES:null);if(s===Yc)return i.ALPHA;if(s===Yt)return i.RGBA;if(s===$c)return i.LUMINANCE;if(s===Kc)return i.LUMINANCE_ALPHA;if(s===Wn)return i.DEPTH_COMPONENT;if(s===vi)return i.DEPTH_STENCIL;if(s===Cs)return a=e.get("EXT_sRGB"),a!==null?a.SRGB_ALPHA_EXT:null;if(s===Zc)return i.RED;if(s===$o)return i.RED_INTEGER;if(s===jc)return i.RG;if(s===Ko)return i.RG_INTEGER;if(s===Zo)return i.RGBA_INTEGER;if(s===Gr||s===Hr||s===kr||s===Vr)if(l===je)if(a=e.get("WEBGL_compressed_texture_s3tc_srgb"),a!==null){if(s===Gr)return a.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(s===Hr)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(s===kr)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(s===Vr)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(a=e.get("WEBGL_compressed_texture_s3tc"),a!==null){if(s===Gr)return a.COMPRESSED_RGB_S3TC_DXT1_EXT;if(s===Hr)return a.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(s===kr)return a.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(s===Vr)return a.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(s===_a||s===va||s===xa||s===Ma)if(a=e.get("WEBGL_compressed_texture_pvrtc"),a!==null){if(s===_a)return a.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(s===va)return a.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(s===xa)return a.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(s===Ma)return a.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(s===jo)return a=e.get("WEBGL_compressed_texture_etc1"),a!==null?a.COMPRESSED_RGB_ETC1_WEBGL:null;if(s===Sa||s===ya)if(a=e.get("WEBGL_compressed_texture_etc"),a!==null){if(s===Sa)return l===je?a.COMPRESSED_SRGB8_ETC2:a.COMPRESSED_RGB8_ETC2;if(s===ya)return l===je?a.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:a.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(s===Ea||s===ba||s===Ta||s===Aa||s===wa||s===Ra||s===Ca||s===Pa||s===La||s===Da||s===Ua||s===Ia||s===Na||s===Fa)if(a=e.get("WEBGL_compressed_texture_astc"),a!==null){if(s===Ea)return l===je?a.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:a.COMPRESSED_RGBA_ASTC_4x4_KHR;if(s===ba)return l===je?a.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:a.COMPRESSED_RGBA_ASTC_5x4_KHR;if(s===Ta)return l===je?a.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:a.COMPRESSED_RGBA_ASTC_5x5_KHR;if(s===Aa)return l===je?a.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:a.COMPRESSED_RGBA_ASTC_6x5_KHR;if(s===wa)return l===je?a.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:a.COMPRESSED_RGBA_ASTC_6x6_KHR;if(s===Ra)return l===je?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:a.COMPRESSED_RGBA_ASTC_8x5_KHR;if(s===Ca)return l===je?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:a.COMPRESSED_RGBA_ASTC_8x6_KHR;if(s===Pa)return l===je?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:a.COMPRESSED_RGBA_ASTC_8x8_KHR;if(s===La)return l===je?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:a.COMPRESSED_RGBA_ASTC_10x5_KHR;if(s===Da)return l===je?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:a.COMPRESSED_RGBA_ASTC_10x6_KHR;if(s===Ua)return l===je?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:a.COMPRESSED_RGBA_ASTC_10x8_KHR;if(s===Ia)return l===je?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:a.COMPRESSED_RGBA_ASTC_10x10_KHR;if(s===Na)return l===je?a.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:a.COMPRESSED_RGBA_ASTC_12x10_KHR;if(s===Fa)return l===je?a.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:a.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(s===Wr||s===Oa||s===Ba)if(a=e.get("EXT_texture_compression_bptc"),a!==null){if(s===Wr)return l===je?a.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:a.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(s===Oa)return a.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(s===Ba)return a.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(s===Jc||s===za||s===Ga||s===Ha)if(a=e.get("EXT_texture_compression_rgtc"),a!==null){if(s===Wr)return a.COMPRESSED_RED_RGTC1_EXT;if(s===za)return a.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(s===Ga)return a.COMPRESSED_RED_GREEN_RGTC2_EXT;if(s===Ha)return a.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return s===Vn?n?i.UNSIGNED_INT_24_8:(a=e.get("WEBGL_depth_texture"),a!==null?a.UNSIGNED_INT_24_8_WEBGL:null):i[s]!==void 0?i[s]:null}return{convert:r}}class gm extends Ut{constructor(e=[]){super(),this.isArrayCamera=!0,this.cameras=e}}class cn extends Et{constructor(){super(),this.isGroup=!0,this.type="Group"}}const _m={type:"move"};class gs{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new cn,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new cn,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new U,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new U),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new cn,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new U,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new U),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let r=null,s=null,o=null;const a=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){o=!0;for(const g of e.hand.values()){const d=t.getJointPose(g,n),f=this._getHandJoint(c,g);d!==null&&(f.matrix.fromArray(d.transform.matrix),f.matrix.decompose(f.position,f.rotation,f.scale),f.matrixWorldNeedsUpdate=!0,f.jointRadius=d.radius),f.visible=d!==null}const u=c.joints["index-finger-tip"],h=c.joints["thumb-tip"],p=u.position.distanceTo(h.position),m=.02,_=.005;c.inputState.pinching&&p>m+_?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&p<=m-_&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(s=t.getPose(e.gripSpace,n),s!==null&&(l.matrix.fromArray(s.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,s.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(s.linearVelocity)):l.hasLinearVelocity=!1,s.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(s.angularVelocity)):l.hasAngularVelocity=!1));a!==null&&(r=t.getPose(e.targetRaySpace,n),r===null&&s!==null&&(r=s),r!==null&&(a.matrix.fromArray(r.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,r.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(r.linearVelocity)):a.hasLinearVelocity=!1,r.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(r.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(_m)))}return a!==null&&(a.visible=r!==null),l!==null&&(l.visible=s!==null),c!==null&&(c.visible=o!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const n=new cn;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}}const vm=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,xm=`
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

}`;class Mm{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t,n){if(this.texture===null){const r=new Rt,s=e.properties.get(r);s.__webglTexture=t.texture,(t.depthNear!=n.depthNear||t.depthFar!=n.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=r}}render(e,t){if(this.texture!==null){if(this.mesh===null){const n=t.cameras[0].viewport,r=new An({extensions:{fragDepth:!0},vertexShader:vm,fragmentShader:xm,uniforms:{depthColor:{value:this.texture},depthWidth:{value:n.z},depthHeight:{value:n.w}}});this.mesh=new Nt(new Bi(20,20),r)}e.render(this.mesh,t)}}reset(){this.texture=null,this.mesh=null}}class Sm extends Mi{constructor(e,t){super();const n=this;let r=null,s=1,o=null,a="local-floor",l=1,c=null,u=null,h=null,p=null,m=null,_=null;const g=new Mm,d=t.getContextAttributes();let f=null,b=null;const M=[],y=[],P=new Ve;let w=null;const A=new Ut;A.layers.enable(1),A.viewport=new mt;const I=new Ut;I.layers.enable(2),I.viewport=new mt;const q=[A,I],x=new gm;x.layers.enable(1),x.layers.enable(2);let T=null,Y=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(z){let J=M[z];return J===void 0&&(J=new gs,M[z]=J),J.getTargetRaySpace()},this.getControllerGrip=function(z){let J=M[z];return J===void 0&&(J=new gs,M[z]=J),J.getGripSpace()},this.getHand=function(z){let J=M[z];return J===void 0&&(J=new gs,M[z]=J),J.getHandSpace()};function $(z){const J=y.indexOf(z.inputSource);if(J===-1)return;const ce=M[J];ce!==void 0&&(ce.update(z.inputSource,z.frame,c||o),ce.dispatchEvent({type:z.type,data:z.inputSource}))}function R(){r.removeEventListener("select",$),r.removeEventListener("selectstart",$),r.removeEventListener("selectend",$),r.removeEventListener("squeeze",$),r.removeEventListener("squeezestart",$),r.removeEventListener("squeezeend",$),r.removeEventListener("end",R),r.removeEventListener("inputsourceschange",V);for(let z=0;z<M.length;z++){const J=y[z];J!==null&&(y[z]=null,M[z].disconnect(J))}T=null,Y=null,g.reset(),e.setRenderTarget(f),m=null,p=null,h=null,r=null,b=null,Ce.stop(),n.isPresenting=!1,e.setPixelRatio(w),e.setSize(P.width,P.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(z){s=z,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(z){a=z,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||o},this.setReferenceSpace=function(z){c=z},this.getBaseLayer=function(){return p!==null?p:m},this.getBinding=function(){return h},this.getFrame=function(){return _},this.getSession=function(){return r},this.setSession=async function(z){if(r=z,r!==null){if(f=e.getRenderTarget(),r.addEventListener("select",$),r.addEventListener("selectstart",$),r.addEventListener("selectend",$),r.addEventListener("squeeze",$),r.addEventListener("squeezestart",$),r.addEventListener("squeezeend",$),r.addEventListener("end",R),r.addEventListener("inputsourceschange",V),d.xrCompatible!==!0&&await t.makeXRCompatible(),w=e.getPixelRatio(),e.getSize(P),r.renderState.layers===void 0||e.capabilities.isWebGL2===!1){const J={antialias:r.renderState.layers===void 0?d.antialias:!0,alpha:!0,depth:d.depth,stencil:d.stencil,framebufferScaleFactor:s};m=new XRWebGLLayer(r,t,J),r.updateRenderState({baseLayer:m}),e.setPixelRatio(1),e.setSize(m.framebufferWidth,m.framebufferHeight,!1),b=new Xn(m.framebufferWidth,m.framebufferHeight,{format:Yt,type:En,colorSpace:e.outputColorSpace,stencilBuffer:d.stencil})}else{let J=null,ce=null,Ee=null;d.depth&&(Ee=d.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,J=d.stencil?vi:Wn,ce=d.stencil?Vn:Mn);const ge={colorFormat:t.RGBA8,depthFormat:Ee,scaleFactor:s};h=new XRWebGLBinding(r,t),p=h.createProjectionLayer(ge),r.updateRenderState({layers:[p]}),e.setPixelRatio(1),e.setSize(p.textureWidth,p.textureHeight,!1),b=new Xn(p.textureWidth,p.textureHeight,{format:Yt,type:En,depthTexture:new dl(p.textureWidth,p.textureHeight,ce,void 0,void 0,void 0,void 0,void 0,void 0,J),stencilBuffer:d.stencil,colorSpace:e.outputColorSpace,samples:d.antialias?4:0});const de=e.properties.get(b);de.__ignoreDepthValues=p.ignoreDepthValues}b.isXRRenderTarget=!0,this.setFoveation(l),c=null,o=await r.requestReferenceSpace(a),Ce.setContext(r),Ce.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode};function V(z){for(let J=0;J<z.removed.length;J++){const ce=z.removed[J],Ee=y.indexOf(ce);Ee>=0&&(y[Ee]=null,M[Ee].disconnect(ce))}for(let J=0;J<z.added.length;J++){const ce=z.added[J];let Ee=y.indexOf(ce);if(Ee===-1){for(let de=0;de<M.length;de++)if(de>=y.length){y.push(ce),Ee=de;break}else if(y[de]===null){y[de]=ce,Ee=de;break}if(Ee===-1)break}const ge=M[Ee];ge&&ge.connect(ce)}}const H=new U,K=new U;function k(z,J,ce){H.setFromMatrixPosition(J.matrixWorld),K.setFromMatrixPosition(ce.matrixWorld);const Ee=H.distanceTo(K),ge=J.projectionMatrix.elements,de=ce.projectionMatrix.elements,Xe=ge[14]/(ge[10]-1),be=ge[14]/(ge[10]+1),D=(ge[9]+1)/ge[5],dt=(ge[9]-1)/ge[5],ve=(ge[8]-1)/ge[0],Oe=(de[8]+1)/de[0],Me=Xe*ve,He=Xe*Oe,Ne=Ee/(-ve+Oe),Be=Ne*-ve;J.matrixWorld.decompose(z.position,z.quaternion,z.scale),z.translateX(Be),z.translateZ(Ne),z.matrixWorld.compose(z.position,z.quaternion,z.scale),z.matrixWorldInverse.copy(z.matrixWorld).invert();const tt=Xe+Ne,E=be+Ne,v=Me-Be,G=He+(Ee-Be),W=D*be/E*tt,Q=dt*be/E*tt;z.projectionMatrix.makePerspective(v,G,W,Q,tt,E),z.projectionMatrixInverse.copy(z.projectionMatrix).invert()}function X(z,J){J===null?z.matrixWorld.copy(z.matrix):z.matrixWorld.multiplyMatrices(J.matrixWorld,z.matrix),z.matrixWorldInverse.copy(z.matrixWorld).invert()}this.updateCamera=function(z){if(r===null)return;g.texture!==null&&(z.near=g.depthNear,z.far=g.depthFar),x.near=I.near=A.near=z.near,x.far=I.far=A.far=z.far,(T!==x.near||Y!==x.far)&&(r.updateRenderState({depthNear:x.near,depthFar:x.far}),T=x.near,Y=x.far,A.near=T,A.far=Y,I.near=T,I.far=Y,A.updateProjectionMatrix(),I.updateProjectionMatrix(),z.updateProjectionMatrix());const J=z.parent,ce=x.cameras;X(x,J);for(let Ee=0;Ee<ce.length;Ee++)X(ce[Ee],J);ce.length===2?k(x,A,I):x.projectionMatrix.copy(A.projectionMatrix),Z(z,x,J)};function Z(z,J,ce){ce===null?z.matrix.copy(J.matrixWorld):(z.matrix.copy(ce.matrixWorld),z.matrix.invert(),z.matrix.multiply(J.matrixWorld)),z.matrix.decompose(z.position,z.quaternion,z.scale),z.updateMatrixWorld(!0),z.projectionMatrix.copy(J.projectionMatrix),z.projectionMatrixInverse.copy(J.projectionMatrixInverse),z.isPerspectiveCamera&&(z.fov=Ps*2*Math.atan(1/z.projectionMatrix.elements[5]),z.zoom=1)}this.getCamera=function(){return x},this.getFoveation=function(){if(!(p===null&&m===null))return l},this.setFoveation=function(z){l=z,p!==null&&(p.fixedFoveation=z),m!==null&&m.fixedFoveation!==void 0&&(m.fixedFoveation=z)},this.hasDepthSensing=function(){return g.texture!==null};let ie=null;function he(z,J){if(u=J.getViewerPose(c||o),_=J,u!==null){const ce=u.views;m!==null&&(e.setRenderTargetFramebuffer(b,m.framebuffer),e.setRenderTarget(b));let Ee=!1;ce.length!==x.cameras.length&&(x.cameras.length=0,Ee=!0);for(let de=0;de<ce.length;de++){const Xe=ce[de];let be=null;if(m!==null)be=m.getViewport(Xe);else{const dt=h.getViewSubImage(p,Xe);be=dt.viewport,de===0&&(e.setRenderTargetTextures(b,dt.colorTexture,p.ignoreDepthValues?void 0:dt.depthStencilTexture),e.setRenderTarget(b))}let D=q[de];D===void 0&&(D=new Ut,D.layers.enable(de),D.viewport=new mt,q[de]=D),D.matrix.fromArray(Xe.transform.matrix),D.matrix.decompose(D.position,D.quaternion,D.scale),D.projectionMatrix.fromArray(Xe.projectionMatrix),D.projectionMatrixInverse.copy(D.projectionMatrix).invert(),D.viewport.set(be.x,be.y,be.width,be.height),de===0&&(x.matrix.copy(D.matrix),x.matrix.decompose(x.position,x.quaternion,x.scale)),Ee===!0&&x.cameras.push(D)}const ge=r.enabledFeatures;if(ge&&ge.includes("depth-sensing")){const de=h.getDepthInformation(ce[0]);de&&de.isValid&&de.texture&&g.init(e,de,r.renderState)}}for(let ce=0;ce<M.length;ce++){const Ee=y[ce],ge=M[ce];Ee!==null&&ge!==void 0&&ge.update(Ee,J,c||o)}g.render(e,x),ie&&ie(z,J),J.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:J}),_=null}const Ce=new hl;Ce.setAnimationLoop(he),this.setAnimationLoop=function(z){ie=z},this.dispose=function(){}}}const Fn=new dn,ym=new rt;function Em(i,e){function t(d,f){d.matrixAutoUpdate===!0&&d.updateMatrix(),f.value.copy(d.matrix)}function n(d,f){f.color.getRGB(d.fogColor.value,ol(i)),f.isFog?(d.fogNear.value=f.near,d.fogFar.value=f.far):f.isFogExp2&&(d.fogDensity.value=f.density)}function r(d,f,b,M,y){f.isMeshBasicMaterial||f.isMeshLambertMaterial?s(d,f):f.isMeshToonMaterial?(s(d,f),h(d,f)):f.isMeshPhongMaterial?(s(d,f),u(d,f)):f.isMeshStandardMaterial?(s(d,f),p(d,f),f.isMeshPhysicalMaterial&&m(d,f,y)):f.isMeshMatcapMaterial?(s(d,f),_(d,f)):f.isMeshDepthMaterial?s(d,f):f.isMeshDistanceMaterial?(s(d,f),g(d,f)):f.isMeshNormalMaterial?s(d,f):f.isLineBasicMaterial?(o(d,f),f.isLineDashedMaterial&&a(d,f)):f.isPointsMaterial?l(d,f,b,M):f.isSpriteMaterial?c(d,f):f.isShadowMaterial?(d.color.value.copy(f.color),d.opacity.value=f.opacity):f.isShaderMaterial&&(f.uniformsNeedUpdate=!1)}function s(d,f){d.opacity.value=f.opacity,f.color&&d.diffuse.value.copy(f.color),f.emissive&&d.emissive.value.copy(f.emissive).multiplyScalar(f.emissiveIntensity),f.map&&(d.map.value=f.map,t(f.map,d.mapTransform)),f.alphaMap&&(d.alphaMap.value=f.alphaMap,t(f.alphaMap,d.alphaMapTransform)),f.bumpMap&&(d.bumpMap.value=f.bumpMap,t(f.bumpMap,d.bumpMapTransform),d.bumpScale.value=f.bumpScale,f.side===wt&&(d.bumpScale.value*=-1)),f.normalMap&&(d.normalMap.value=f.normalMap,t(f.normalMap,d.normalMapTransform),d.normalScale.value.copy(f.normalScale),f.side===wt&&d.normalScale.value.negate()),f.displacementMap&&(d.displacementMap.value=f.displacementMap,t(f.displacementMap,d.displacementMapTransform),d.displacementScale.value=f.displacementScale,d.displacementBias.value=f.displacementBias),f.emissiveMap&&(d.emissiveMap.value=f.emissiveMap,t(f.emissiveMap,d.emissiveMapTransform)),f.specularMap&&(d.specularMap.value=f.specularMap,t(f.specularMap,d.specularMapTransform)),f.alphaTest>0&&(d.alphaTest.value=f.alphaTest);const b=e.get(f),M=b.envMap,y=b.envMapRotation;if(M&&(d.envMap.value=M,Fn.copy(y),Fn.x*=-1,Fn.y*=-1,Fn.z*=-1,M.isCubeTexture&&M.isRenderTargetTexture===!1&&(Fn.y*=-1,Fn.z*=-1),d.envMapRotation.value.setFromMatrix4(ym.makeRotationFromEuler(Fn)),d.flipEnvMap.value=M.isCubeTexture&&M.isRenderTargetTexture===!1?-1:1,d.reflectivity.value=f.reflectivity,d.ior.value=f.ior,d.refractionRatio.value=f.refractionRatio),f.lightMap){d.lightMap.value=f.lightMap;const P=i._useLegacyLights===!0?Math.PI:1;d.lightMapIntensity.value=f.lightMapIntensity*P,t(f.lightMap,d.lightMapTransform)}f.aoMap&&(d.aoMap.value=f.aoMap,d.aoMapIntensity.value=f.aoMapIntensity,t(f.aoMap,d.aoMapTransform))}function o(d,f){d.diffuse.value.copy(f.color),d.opacity.value=f.opacity,f.map&&(d.map.value=f.map,t(f.map,d.mapTransform))}function a(d,f){d.dashSize.value=f.dashSize,d.totalSize.value=f.dashSize+f.gapSize,d.scale.value=f.scale}function l(d,f,b,M){d.diffuse.value.copy(f.color),d.opacity.value=f.opacity,d.size.value=f.size*b,d.scale.value=M*.5,f.map&&(d.map.value=f.map,t(f.map,d.uvTransform)),f.alphaMap&&(d.alphaMap.value=f.alphaMap,t(f.alphaMap,d.alphaMapTransform)),f.alphaTest>0&&(d.alphaTest.value=f.alphaTest)}function c(d,f){d.diffuse.value.copy(f.color),d.opacity.value=f.opacity,d.rotation.value=f.rotation,f.map&&(d.map.value=f.map,t(f.map,d.mapTransform)),f.alphaMap&&(d.alphaMap.value=f.alphaMap,t(f.alphaMap,d.alphaMapTransform)),f.alphaTest>0&&(d.alphaTest.value=f.alphaTest)}function u(d,f){d.specular.value.copy(f.specular),d.shininess.value=Math.max(f.shininess,1e-4)}function h(d,f){f.gradientMap&&(d.gradientMap.value=f.gradientMap)}function p(d,f){d.metalness.value=f.metalness,f.metalnessMap&&(d.metalnessMap.value=f.metalnessMap,t(f.metalnessMap,d.metalnessMapTransform)),d.roughness.value=f.roughness,f.roughnessMap&&(d.roughnessMap.value=f.roughnessMap,t(f.roughnessMap,d.roughnessMapTransform)),e.get(f).envMap&&(d.envMapIntensity.value=f.envMapIntensity)}function m(d,f,b){d.ior.value=f.ior,f.sheen>0&&(d.sheenColor.value.copy(f.sheenColor).multiplyScalar(f.sheen),d.sheenRoughness.value=f.sheenRoughness,f.sheenColorMap&&(d.sheenColorMap.value=f.sheenColorMap,t(f.sheenColorMap,d.sheenColorMapTransform)),f.sheenRoughnessMap&&(d.sheenRoughnessMap.value=f.sheenRoughnessMap,t(f.sheenRoughnessMap,d.sheenRoughnessMapTransform))),f.clearcoat>0&&(d.clearcoat.value=f.clearcoat,d.clearcoatRoughness.value=f.clearcoatRoughness,f.clearcoatMap&&(d.clearcoatMap.value=f.clearcoatMap,t(f.clearcoatMap,d.clearcoatMapTransform)),f.clearcoatRoughnessMap&&(d.clearcoatRoughnessMap.value=f.clearcoatRoughnessMap,t(f.clearcoatRoughnessMap,d.clearcoatRoughnessMapTransform)),f.clearcoatNormalMap&&(d.clearcoatNormalMap.value=f.clearcoatNormalMap,t(f.clearcoatNormalMap,d.clearcoatNormalMapTransform),d.clearcoatNormalScale.value.copy(f.clearcoatNormalScale),f.side===wt&&d.clearcoatNormalScale.value.negate())),f.iridescence>0&&(d.iridescence.value=f.iridescence,d.iridescenceIOR.value=f.iridescenceIOR,d.iridescenceThicknessMinimum.value=f.iridescenceThicknessRange[0],d.iridescenceThicknessMaximum.value=f.iridescenceThicknessRange[1],f.iridescenceMap&&(d.iridescenceMap.value=f.iridescenceMap,t(f.iridescenceMap,d.iridescenceMapTransform)),f.iridescenceThicknessMap&&(d.iridescenceThicknessMap.value=f.iridescenceThicknessMap,t(f.iridescenceThicknessMap,d.iridescenceThicknessMapTransform))),f.transmission>0&&(d.transmission.value=f.transmission,d.transmissionSamplerMap.value=b.texture,d.transmissionSamplerSize.value.set(b.width,b.height),f.transmissionMap&&(d.transmissionMap.value=f.transmissionMap,t(f.transmissionMap,d.transmissionMapTransform)),d.thickness.value=f.thickness,f.thicknessMap&&(d.thicknessMap.value=f.thicknessMap,t(f.thicknessMap,d.thicknessMapTransform)),d.attenuationDistance.value=f.attenuationDistance,d.attenuationColor.value.copy(f.attenuationColor)),f.anisotropy>0&&(d.anisotropyVector.value.set(f.anisotropy*Math.cos(f.anisotropyRotation),f.anisotropy*Math.sin(f.anisotropyRotation)),f.anisotropyMap&&(d.anisotropyMap.value=f.anisotropyMap,t(f.anisotropyMap,d.anisotropyMapTransform))),d.specularIntensity.value=f.specularIntensity,d.specularColor.value.copy(f.specularColor),f.specularColorMap&&(d.specularColorMap.value=f.specularColorMap,t(f.specularColorMap,d.specularColorMapTransform)),f.specularIntensityMap&&(d.specularIntensityMap.value=f.specularIntensityMap,t(f.specularIntensityMap,d.specularIntensityMapTransform))}function _(d,f){f.matcap&&(d.matcap.value=f.matcap)}function g(d,f){const b=e.get(f).light;d.referencePosition.value.setFromMatrixPosition(b.matrixWorld),d.nearDistance.value=b.shadow.camera.near,d.farDistance.value=b.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:r}}function bm(i,e,t,n){let r={},s={},o=[];const a=t.isWebGL2?i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS):0;function l(b,M){const y=M.program;n.uniformBlockBinding(b,y)}function c(b,M){let y=r[b.id];y===void 0&&(_(b),y=u(b),r[b.id]=y,b.addEventListener("dispose",d));const P=M.program;n.updateUBOMapping(b,P);const w=e.render.frame;s[b.id]!==w&&(p(b),s[b.id]=w)}function u(b){const M=h();b.__bindingPointIndex=M;const y=i.createBuffer(),P=b.__size,w=b.usage;return i.bindBuffer(i.UNIFORM_BUFFER,y),i.bufferData(i.UNIFORM_BUFFER,P,w),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,M,y),y}function h(){for(let b=0;b<a;b++)if(o.indexOf(b)===-1)return o.push(b),b;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function p(b){const M=r[b.id],y=b.uniforms,P=b.__cache;i.bindBuffer(i.UNIFORM_BUFFER,M);for(let w=0,A=y.length;w<A;w++){const I=Array.isArray(y[w])?y[w]:[y[w]];for(let q=0,x=I.length;q<x;q++){const T=I[q];if(m(T,w,q,P)===!0){const Y=T.__offset,$=Array.isArray(T.value)?T.value:[T.value];let R=0;for(let V=0;V<$.length;V++){const H=$[V],K=g(H);typeof H=="number"||typeof H=="boolean"?(T.__data[0]=H,i.bufferSubData(i.UNIFORM_BUFFER,Y+R,T.__data)):H.isMatrix3?(T.__data[0]=H.elements[0],T.__data[1]=H.elements[1],T.__data[2]=H.elements[2],T.__data[3]=0,T.__data[4]=H.elements[3],T.__data[5]=H.elements[4],T.__data[6]=H.elements[5],T.__data[7]=0,T.__data[8]=H.elements[6],T.__data[9]=H.elements[7],T.__data[10]=H.elements[8],T.__data[11]=0):(H.toArray(T.__data,R),R+=K.storage/Float32Array.BYTES_PER_ELEMENT)}i.bufferSubData(i.UNIFORM_BUFFER,Y,T.__data)}}}i.bindBuffer(i.UNIFORM_BUFFER,null)}function m(b,M,y,P){const w=b.value,A=M+"_"+y;if(P[A]===void 0)return typeof w=="number"||typeof w=="boolean"?P[A]=w:P[A]=w.clone(),!0;{const I=P[A];if(typeof w=="number"||typeof w=="boolean"){if(I!==w)return P[A]=w,!0}else if(I.equals(w)===!1)return I.copy(w),!0}return!1}function _(b){const M=b.uniforms;let y=0;const P=16;for(let A=0,I=M.length;A<I;A++){const q=Array.isArray(M[A])?M[A]:[M[A]];for(let x=0,T=q.length;x<T;x++){const Y=q[x],$=Array.isArray(Y.value)?Y.value:[Y.value];for(let R=0,V=$.length;R<V;R++){const H=$[R],K=g(H),k=y%P;k!==0&&P-k<K.boundary&&(y+=P-k),Y.__data=new Float32Array(K.storage/Float32Array.BYTES_PER_ELEMENT),Y.__offset=y,y+=K.storage}}}const w=y%P;return w>0&&(y+=P-w),b.__size=y,b.__cache={},this}function g(b){const M={boundary:0,storage:0};return typeof b=="number"||typeof b=="boolean"?(M.boundary=4,M.storage=4):b.isVector2?(M.boundary=8,M.storage=8):b.isVector3||b.isColor?(M.boundary=16,M.storage=12):b.isVector4?(M.boundary=16,M.storage=16):b.isMatrix3?(M.boundary=48,M.storage=48):b.isMatrix4?(M.boundary=64,M.storage=64):b.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",b),M}function d(b){const M=b.target;M.removeEventListener("dispose",d);const y=o.indexOf(M.__bindingPointIndex);o.splice(y,1),i.deleteBuffer(r[M.id]),delete r[M.id],delete s[M.id]}function f(){for(const b in r)i.deleteBuffer(r[b]);o=[],r={},s={}}return{bind:l,update:c,dispose:f}}class ks{constructor(e={}){const{canvas:t=hu(),context:n=null,depth:r=!0,stencil:s=!0,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:u="default",failIfMajorPerformanceCaveat:h=!1}=e;this.isWebGLRenderer=!0;let p;n!==null?p=n.getContextAttributes().alpha:p=o;const m=new Uint32Array(4),_=new Int32Array(4);let g=null,d=null;const f=[],b=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=Zt,this._useLegacyLights=!1,this.toneMapping=yn,this.toneMappingExposure=1;const M=this;let y=!1,P=0,w=0,A=null,I=-1,q=null;const x=new mt,T=new mt;let Y=null;const $=new We(0);let R=0,V=t.width,H=t.height,K=1,k=null,X=null;const Z=new mt(0,0,V,H),ie=new mt(0,0,V,H);let he=!1;const Ce=new ul;let z=!1,J=!1,ce=null;const Ee=new rt,ge=new Ve,de=new U,Xe={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};function be(){return A===null?K:1}let D=n;function dt(S,L){for(let O=0;O<S.length;O++){const B=S[O],N=t.getContext(B,L);if(N!==null)return N}return null}try{const S={alpha:!0,depth:r,stencil:s,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:u,failIfMajorPerformanceCaveat:h};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${Os}`),t.addEventListener("webglcontextlost",Je,!1),t.addEventListener("webglcontextrestored",C,!1),t.addEventListener("webglcontextcreationerror",se,!1),D===null){const L=["webgl2","webgl","experimental-webgl"];if(M.isWebGL1Renderer===!0&&L.shift(),D=dt(L,S),D===null)throw dt(L)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}typeof WebGLRenderingContext<"u"&&D instanceof WebGLRenderingContext&&console.warn("THREE.WebGLRenderer: WebGL 1 support was deprecated in r153 and will be removed in r163."),D.getShaderPrecisionFormat===void 0&&(D.getShaderPrecisionFormat=function(){return{rangeMin:1,rangeMax:1,precision:1}})}catch(S){throw console.error("THREE.WebGLRenderer: "+S.message),S}let ve,Oe,Me,He,Ne,Be,tt,E,v,G,W,Q,j,Pe,Se,re,ae,Le,ee,st,ze,_e,fe,pe;function ke(){ve=new Pf(D),Oe=new Ef(D,ve,e),ve.init(Oe),_e=new mm(D,ve,Oe),Me=new fm(D,ve,Oe),He=new Uf(D),Ne=new Qp,Be=new pm(D,ve,Me,Ne,Oe,_e,He),tt=new Tf(M),E=new Cf(M),v=new Ou(D,Oe),fe=new Sf(D,ve,v,Oe),G=new Lf(D,v,He,fe),W=new Of(D,G,v,He),ee=new Ff(D,Oe,Be),re=new bf(Ne),Q=new Jp(M,tt,E,ve,Oe,fe,re),j=new Em(M,Ne),Pe=new tm,Se=new om(ve,Oe),Le=new Mf(M,tt,E,Me,W,p,l),ae=new dm(M,W,Oe),pe=new bm(D,He,Oe,Me),st=new yf(D,ve,He,Oe),ze=new Df(D,ve,He,Oe),He.programs=Q.programs,M.capabilities=Oe,M.extensions=ve,M.properties=Ne,M.renderLists=Pe,M.shadowMap=ae,M.state=Me,M.info=He}ke();const we=new Sm(M,D);this.xr=we,this.getContext=function(){return D},this.getContextAttributes=function(){return D.getContextAttributes()},this.forceContextLoss=function(){const S=ve.get("WEBGL_lose_context");S&&S.loseContext()},this.forceContextRestore=function(){const S=ve.get("WEBGL_lose_context");S&&S.restoreContext()},this.getPixelRatio=function(){return K},this.setPixelRatio=function(S){S!==void 0&&(K=S,this.setSize(V,H,!1))},this.getSize=function(S){return S.set(V,H)},this.setSize=function(S,L,O=!0){if(we.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}V=S,H=L,t.width=Math.floor(S*K),t.height=Math.floor(L*K),O===!0&&(t.style.width=S+"px",t.style.height=L+"px"),this.setViewport(0,0,S,L)},this.getDrawingBufferSize=function(S){return S.set(V*K,H*K).floor()},this.setDrawingBufferSize=function(S,L,O){V=S,H=L,K=O,t.width=Math.floor(S*O),t.height=Math.floor(L*O),this.setViewport(0,0,S,L)},this.getCurrentViewport=function(S){return S.copy(x)},this.getViewport=function(S){return S.copy(Z)},this.setViewport=function(S,L,O,B){S.isVector4?Z.set(S.x,S.y,S.z,S.w):Z.set(S,L,O,B),Me.viewport(x.copy(Z).multiplyScalar(K).round())},this.getScissor=function(S){return S.copy(ie)},this.setScissor=function(S,L,O,B){S.isVector4?ie.set(S.x,S.y,S.z,S.w):ie.set(S,L,O,B),Me.scissor(T.copy(ie).multiplyScalar(K).round())},this.getScissorTest=function(){return he},this.setScissorTest=function(S){Me.setScissorTest(he=S)},this.setOpaqueSort=function(S){k=S},this.setTransparentSort=function(S){X=S},this.getClearColor=function(S){return S.copy(Le.getClearColor())},this.setClearColor=function(){Le.setClearColor.apply(Le,arguments)},this.getClearAlpha=function(){return Le.getClearAlpha()},this.setClearAlpha=function(){Le.setClearAlpha.apply(Le,arguments)},this.clear=function(S=!0,L=!0,O=!0){let B=0;if(S){let N=!1;if(A!==null){const le=A.texture.format;N=le===Zo||le===Ko||le===$o}if(N){const le=A.texture.type,me=le===En||le===Mn||le===Bs||le===Vn||le===qo||le===Yo,xe=Le.getClearColor(),ye=Le.getClearAlpha(),Fe=xe.r,Ae=xe.g,Re=xe.b;me?(m[0]=Fe,m[1]=Ae,m[2]=Re,m[3]=ye,D.clearBufferuiv(D.COLOR,0,m)):(_[0]=Fe,_[1]=Ae,_[2]=Re,_[3]=ye,D.clearBufferiv(D.COLOR,0,_))}else B|=D.COLOR_BUFFER_BIT}L&&(B|=D.DEPTH_BUFFER_BIT),O&&(B|=D.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),D.clear(B)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",Je,!1),t.removeEventListener("webglcontextrestored",C,!1),t.removeEventListener("webglcontextcreationerror",se,!1),Pe.dispose(),Se.dispose(),Ne.dispose(),tt.dispose(),E.dispose(),W.dispose(),fe.dispose(),pe.dispose(),Q.dispose(),we.dispose(),we.removeEventListener("sessionstart",Ft),we.removeEventListener("sessionend",Ze),ce&&(ce.dispose(),ce=null),xt.stop()};function Je(S){S.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),y=!0}function C(){console.log("THREE.WebGLRenderer: Context Restored."),y=!1;const S=He.autoReset,L=ae.enabled,O=ae.autoUpdate,B=ae.needsUpdate,N=ae.type;ke(),He.autoReset=S,ae.enabled=L,ae.autoUpdate=O,ae.needsUpdate=B,ae.type=N}function se(S){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",S.statusMessage)}function F(S){const L=S.target;L.removeEventListener("dispose",F),te(L)}function te(S){oe(S),Ne.remove(S)}function oe(S){const L=Ne.get(S).programs;L!==void 0&&(L.forEach(function(O){Q.releaseProgram(O)}),S.isShaderMaterial&&Q.releaseShaderCache(S))}this.renderBufferDirect=function(S,L,O,B,N,le){L===null&&(L=Xe);const me=N.isMesh&&N.matrixWorld.determinant()<0,xe=Ll(S,L,O,B,N);Me.setMaterial(B,me);let ye=O.index,Fe=1;if(B.wireframe===!0){if(ye=G.getWireframeAttribute(O),ye===void 0)return;Fe=2}const Ae=O.drawRange,Re=O.attributes.position;let nt=Ae.start*Fe,Pt=(Ae.start+Ae.count)*Fe;le!==null&&(nt=Math.max(nt,le.start*Fe),Pt=Math.min(Pt,(le.start+le.count)*Fe)),ye!==null?(nt=Math.max(nt,0),Pt=Math.min(Pt,ye.count)):Re!=null&&(nt=Math.max(nt,0),Pt=Math.min(Pt,Re.count));const ut=Pt-nt;if(ut<0||ut===1/0)return;fe.setup(N,B,xe,O,ye);let Jt,et=st;if(ye!==null&&(Jt=v.get(ye),et=ze,et.setIndex(Jt)),N.isMesh)B.wireframe===!0?(Me.setLineWidth(B.wireframeLinewidth*be()),et.setMode(D.LINES)):et.setMode(D.TRIANGLES);else if(N.isLine){let De=B.linewidth;De===void 0&&(De=1),Me.setLineWidth(De*be()),N.isLineSegments?et.setMode(D.LINES):N.isLineLoop?et.setMode(D.LINE_LOOP):et.setMode(D.LINE_STRIP)}else N.isPoints?et.setMode(D.POINTS):N.isSprite&&et.setMode(D.TRIANGLES);if(N.isBatchedMesh)et.renderMultiDraw(N._multiDrawStarts,N._multiDrawCounts,N._multiDrawCount);else if(N.isInstancedMesh)et.renderInstances(nt,ut,N.count);else if(O.isInstancedBufferGeometry){const De=O._maxInstanceCount!==void 0?O._maxInstanceCount:1/0,Dr=Math.min(O.instanceCount,De);et.renderInstances(nt,ut,Dr)}else et.render(nt,ut)};function Ge(S,L,O){S.transparent===!0&&S.side===Xt&&S.forceSinglePass===!1?(S.side=wt,S.needsUpdate=!0,Gi(S,L,O),S.side=Tn,S.needsUpdate=!0,Gi(S,L,O),S.side=Xt):Gi(S,L,O)}this.compile=function(S,L,O=null){O===null&&(O=S),d=Se.get(O),d.init(),b.push(d),O.traverseVisible(function(N){N.isLight&&N.layers.test(L.layers)&&(d.pushLight(N),N.castShadow&&d.pushShadow(N))}),S!==O&&S.traverseVisible(function(N){N.isLight&&N.layers.test(L.layers)&&(d.pushLight(N),N.castShadow&&d.pushShadow(N))}),d.setupLights(M._useLegacyLights);const B=new Set;return S.traverse(function(N){const le=N.material;if(le)if(Array.isArray(le))for(let me=0;me<le.length;me++){const xe=le[me];Ge(xe,O,N),B.add(xe)}else Ge(le,O,N),B.add(le)}),b.pop(),d=null,B},this.compileAsync=function(S,L,O=null){const B=this.compile(S,L,O);return new Promise(N=>{function le(){if(B.forEach(function(me){Ne.get(me).currentProgram.isReady()&&B.delete(me)}),B.size===0){N(S);return}setTimeout(le,10)}ve.get("KHR_parallel_shader_compile")!==null?le():setTimeout(le,10)})};let Ke=null;function ft(S){Ke&&Ke(S)}function Ft(){xt.stop()}function Ze(){xt.start()}const xt=new hl;xt.setAnimationLoop(ft),typeof self<"u"&&xt.setContext(self),this.setAnimationLoop=function(S){Ke=S,we.setAnimationLoop(S),S===null?xt.stop():xt.start()},we.addEventListener("sessionstart",Ft),we.addEventListener("sessionend",Ze),this.render=function(S,L){if(L!==void 0&&L.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(y===!0)return;S.matrixWorldAutoUpdate===!0&&S.updateMatrixWorld(),L.parent===null&&L.matrixWorldAutoUpdate===!0&&L.updateMatrixWorld(),we.enabled===!0&&we.isPresenting===!0&&(we.cameraAutoUpdate===!0&&we.updateCamera(L),L=we.getCamera()),S.isScene===!0&&S.onBeforeRender(M,S,L,A),d=Se.get(S,b.length),d.init(),b.push(d),Ee.multiplyMatrices(L.projectionMatrix,L.matrixWorldInverse),Ce.setFromProjectionMatrix(Ee),J=this.localClippingEnabled,z=re.init(this.clippingPlanes,J),g=Pe.get(S,f.length),g.init(),f.push(g),Kt(S,L,0,M.sortObjects),g.finish(),M.sortObjects===!0&&g.sort(k,X),this.info.render.frame++,z===!0&&re.beginShadows();const O=d.state.shadowsArray;if(ae.render(O,S,L),z===!0&&re.endShadows(),this.info.autoReset===!0&&this.info.reset(),(we.enabled===!1||we.isPresenting===!1||we.hasDepthSensing()===!1)&&Le.render(g,S),d.setupLights(M._useLegacyLights),L.isArrayCamera){const B=L.cameras;for(let N=0,le=B.length;N<le;N++){const me=B[N];ra(g,S,me,me.viewport)}}else ra(g,S,L);A!==null&&(Be.updateMultisampleRenderTarget(A),Be.updateRenderTargetMipmap(A)),S.isScene===!0&&S.onAfterRender(M,S,L),fe.resetDefaultState(),I=-1,q=null,b.pop(),b.length>0?d=b[b.length-1]:d=null,f.pop(),f.length>0?g=f[f.length-1]:g=null};function Kt(S,L,O,B){if(S.visible===!1)return;if(S.layers.test(L.layers)){if(S.isGroup)O=S.renderOrder;else if(S.isLOD)S.autoUpdate===!0&&S.update(L);else if(S.isLight)d.pushLight(S),S.castShadow&&d.pushShadow(S);else if(S.isSprite){if(!S.frustumCulled||Ce.intersectsSprite(S)){B&&de.setFromMatrixPosition(S.matrixWorld).applyMatrix4(Ee);const me=W.update(S),xe=S.material;xe.visible&&g.push(S,me,xe,O,de.z,null)}}else if((S.isMesh||S.isLine||S.isPoints)&&(!S.frustumCulled||Ce.intersectsObject(S))){const me=W.update(S),xe=S.material;if(B&&(S.boundingSphere!==void 0?(S.boundingSphere===null&&S.computeBoundingSphere(),de.copy(S.boundingSphere.center)):(me.boundingSphere===null&&me.computeBoundingSphere(),de.copy(me.boundingSphere.center)),de.applyMatrix4(S.matrixWorld).applyMatrix4(Ee)),Array.isArray(xe)){const ye=me.groups;for(let Fe=0,Ae=ye.length;Fe<Ae;Fe++){const Re=ye[Fe],nt=xe[Re.materialIndex];nt&&nt.visible&&g.push(S,me,nt,O,de.z,Re)}}else xe.visible&&g.push(S,me,xe,O,de.z,null)}}const le=S.children;for(let me=0,xe=le.length;me<xe;me++)Kt(le[me],L,O,B)}function ra(S,L,O,B){const N=S.opaque,le=S.transmissive,me=S.transparent;d.setupLightsView(O),z===!0&&re.setGlobalState(M.clippingPlanes,O),le.length>0&&Pl(N,le,L,O),B&&Me.viewport(x.copy(B)),N.length>0&&zi(N,L,O),le.length>0&&zi(le,L,O),me.length>0&&zi(me,L,O),Me.buffers.depth.setTest(!0),Me.buffers.depth.setMask(!0),Me.buffers.color.setMask(!0),Me.setPolygonOffset(!1)}function Pl(S,L,O,B){if((O.isScene===!0?O.overrideMaterial:null)!==null)return;const le=Oe.isWebGL2;ce===null&&(ce=new Xn(1,1,{generateMipmaps:!0,type:ve.has("EXT_color_buffer_half_float")?Di:En,minFilter:Hn,samples:le?4:0})),M.getDrawingBufferSize(ge),le?ce.setSize(ge.x,ge.y):ce.setSize(Ls(ge.x),Ls(ge.y));const me=M.getRenderTarget();M.setRenderTarget(ce),M.getClearColor($),R=M.getClearAlpha(),R<1&&M.setClearColor(16777215,.5),M.clear();const xe=M.toneMapping;M.toneMapping=yn,zi(S,O,B),Be.updateMultisampleRenderTarget(ce),Be.updateRenderTargetMipmap(ce);let ye=!1;for(let Fe=0,Ae=L.length;Fe<Ae;Fe++){const Re=L[Fe],nt=Re.object,Pt=Re.geometry,ut=Re.material,Jt=Re.group;if(ut.side===Xt&&nt.layers.test(B.layers)){const et=ut.side;ut.side=wt,ut.needsUpdate=!0,sa(nt,O,B,Pt,ut,Jt),ut.side=et,ut.needsUpdate=!0,ye=!0}}ye===!0&&(Be.updateMultisampleRenderTarget(ce),Be.updateRenderTargetMipmap(ce)),M.setRenderTarget(me),M.setClearColor($,R),M.toneMapping=xe}function zi(S,L,O){const B=L.isScene===!0?L.overrideMaterial:null;for(let N=0,le=S.length;N<le;N++){const me=S[N],xe=me.object,ye=me.geometry,Fe=B===null?me.material:B,Ae=me.group;xe.layers.test(O.layers)&&sa(xe,L,O,ye,Fe,Ae)}}function sa(S,L,O,B,N,le){S.onBeforeRender(M,L,O,B,N,le),S.modelViewMatrix.multiplyMatrices(O.matrixWorldInverse,S.matrixWorld),S.normalMatrix.getNormalMatrix(S.modelViewMatrix),N.onBeforeRender(M,L,O,B,S,le),N.transparent===!0&&N.side===Xt&&N.forceSinglePass===!1?(N.side=wt,N.needsUpdate=!0,M.renderBufferDirect(O,L,B,N,S,le),N.side=Tn,N.needsUpdate=!0,M.renderBufferDirect(O,L,B,N,S,le),N.side=Xt):M.renderBufferDirect(O,L,B,N,S,le),S.onAfterRender(M,L,O,B,N,le)}function Gi(S,L,O){L.isScene!==!0&&(L=Xe);const B=Ne.get(S),N=d.state.lights,le=d.state.shadowsArray,me=N.state.version,xe=Q.getParameters(S,N.state,le,L,O),ye=Q.getProgramCacheKey(xe);let Fe=B.programs;B.environment=S.isMeshStandardMaterial?L.environment:null,B.fog=L.fog,B.envMap=(S.isMeshStandardMaterial?E:tt).get(S.envMap||B.environment),B.envMapRotation=B.environment!==null&&S.envMap===null?L.environmentRotation:S.envMapRotation,Fe===void 0&&(S.addEventListener("dispose",F),Fe=new Map,B.programs=Fe);let Ae=Fe.get(ye);if(Ae!==void 0){if(B.currentProgram===Ae&&B.lightsStateVersion===me)return oa(S,xe),Ae}else xe.uniforms=Q.getUniforms(S),S.onBuild(O,xe,M),S.onBeforeCompile(xe,M),Ae=Q.acquireProgram(xe,ye),Fe.set(ye,Ae),B.uniforms=xe.uniforms;const Re=B.uniforms;return(!S.isShaderMaterial&&!S.isRawShaderMaterial||S.clipping===!0)&&(Re.clippingPlanes=re.uniform),oa(S,xe),B.needsLights=Ul(S),B.lightsStateVersion=me,B.needsLights&&(Re.ambientLightColor.value=N.state.ambient,Re.lightProbe.value=N.state.probe,Re.directionalLights.value=N.state.directional,Re.directionalLightShadows.value=N.state.directionalShadow,Re.spotLights.value=N.state.spot,Re.spotLightShadows.value=N.state.spotShadow,Re.rectAreaLights.value=N.state.rectArea,Re.ltc_1.value=N.state.rectAreaLTC1,Re.ltc_2.value=N.state.rectAreaLTC2,Re.pointLights.value=N.state.point,Re.pointLightShadows.value=N.state.pointShadow,Re.hemisphereLights.value=N.state.hemi,Re.directionalShadowMap.value=N.state.directionalShadowMap,Re.directionalShadowMatrix.value=N.state.directionalShadowMatrix,Re.spotShadowMap.value=N.state.spotShadowMap,Re.spotLightMatrix.value=N.state.spotLightMatrix,Re.spotLightMap.value=N.state.spotLightMap,Re.pointShadowMap.value=N.state.pointShadowMap,Re.pointShadowMatrix.value=N.state.pointShadowMatrix),B.currentProgram=Ae,B.uniformsList=null,Ae}function aa(S){if(S.uniformsList===null){const L=S.currentProgram.getUniforms();S.uniformsList=_r.seqWithValue(L.seq,S.uniforms)}return S.uniformsList}function oa(S,L){const O=Ne.get(S);O.outputColorSpace=L.outputColorSpace,O.batching=L.batching,O.instancing=L.instancing,O.instancingColor=L.instancingColor,O.instancingMorph=L.instancingMorph,O.skinning=L.skinning,O.morphTargets=L.morphTargets,O.morphNormals=L.morphNormals,O.morphColors=L.morphColors,O.morphTargetsCount=L.morphTargetsCount,O.numClippingPlanes=L.numClippingPlanes,O.numIntersection=L.numClipIntersection,O.vertexAlphas=L.vertexAlphas,O.vertexTangents=L.vertexTangents,O.toneMapping=L.toneMapping}function Ll(S,L,O,B,N){L.isScene!==!0&&(L=Xe),Be.resetTextureUnits();const le=L.fog,me=B.isMeshStandardMaterial?L.environment:null,xe=A===null?M.outputColorSpace:A.isXRRenderTarget===!0?A.texture.colorSpace:wn,ye=(B.isMeshStandardMaterial?E:tt).get(B.envMap||me),Fe=B.vertexColors===!0&&!!O.attributes.color&&O.attributes.color.itemSize===4,Ae=!!O.attributes.tangent&&(!!B.normalMap||B.anisotropy>0),Re=!!O.morphAttributes.position,nt=!!O.morphAttributes.normal,Pt=!!O.morphAttributes.color;let ut=yn;B.toneMapped&&(A===null||A.isXRRenderTarget===!0)&&(ut=M.toneMapping);const Jt=O.morphAttributes.position||O.morphAttributes.normal||O.morphAttributes.color,et=Jt!==void 0?Jt.length:0,De=Ne.get(B),Dr=d.state.lights;if(z===!0&&(J===!0||S!==q)){const Ot=S===q&&B.id===I;re.setState(B,S,Ot)}let Qe=!1;B.version===De.__version?(De.needsLights&&De.lightsStateVersion!==Dr.state.version||De.outputColorSpace!==xe||N.isBatchedMesh&&De.batching===!1||!N.isBatchedMesh&&De.batching===!0||N.isInstancedMesh&&De.instancing===!1||!N.isInstancedMesh&&De.instancing===!0||N.isSkinnedMesh&&De.skinning===!1||!N.isSkinnedMesh&&De.skinning===!0||N.isInstancedMesh&&De.instancingColor===!0&&N.instanceColor===null||N.isInstancedMesh&&De.instancingColor===!1&&N.instanceColor!==null||N.isInstancedMesh&&De.instancingMorph===!0&&N.morphTexture===null||N.isInstancedMesh&&De.instancingMorph===!1&&N.morphTexture!==null||De.envMap!==ye||B.fog===!0&&De.fog!==le||De.numClippingPlanes!==void 0&&(De.numClippingPlanes!==re.numPlanes||De.numIntersection!==re.numIntersection)||De.vertexAlphas!==Fe||De.vertexTangents!==Ae||De.morphTargets!==Re||De.morphNormals!==nt||De.morphColors!==Pt||De.toneMapping!==ut||Oe.isWebGL2===!0&&De.morphTargetsCount!==et)&&(Qe=!0):(Qe=!0,De.__version=B.version);let Rn=De.currentProgram;Qe===!0&&(Rn=Gi(B,L,N));let la=!1,bi=!1,Ur=!1;const gt=Rn.getUniforms(),Cn=De.uniforms;if(Me.useProgram(Rn.program)&&(la=!0,bi=!0,Ur=!0),B.id!==I&&(I=B.id,bi=!0),la||q!==S){gt.setValue(D,"projectionMatrix",S.projectionMatrix),gt.setValue(D,"viewMatrix",S.matrixWorldInverse);const Ot=gt.map.cameraPosition;Ot!==void 0&&Ot.setValue(D,de.setFromMatrixPosition(S.matrixWorld)),Oe.logarithmicDepthBuffer&&gt.setValue(D,"logDepthBufFC",2/(Math.log(S.far+1)/Math.LN2)),(B.isMeshPhongMaterial||B.isMeshToonMaterial||B.isMeshLambertMaterial||B.isMeshBasicMaterial||B.isMeshStandardMaterial||B.isShaderMaterial)&&gt.setValue(D,"isOrthographic",S.isOrthographicCamera===!0),q!==S&&(q=S,bi=!0,Ur=!0)}if(N.isSkinnedMesh){gt.setOptional(D,N,"bindMatrix"),gt.setOptional(D,N,"bindMatrixInverse");const Ot=N.skeleton;Ot&&(Oe.floatVertexTextures?(Ot.boneTexture===null&&Ot.computeBoneTexture(),gt.setValue(D,"boneTexture",Ot.boneTexture,Be)):console.warn("THREE.WebGLRenderer: SkinnedMesh can only be used with WebGL 2. With WebGL 1 OES_texture_float and vertex textures support is required."))}N.isBatchedMesh&&(gt.setOptional(D,N,"batchingTexture"),gt.setValue(D,"batchingTexture",N._matricesTexture,Be));const Ir=O.morphAttributes;if((Ir.position!==void 0||Ir.normal!==void 0||Ir.color!==void 0&&Oe.isWebGL2===!0)&&ee.update(N,O,Rn),(bi||De.receiveShadow!==N.receiveShadow)&&(De.receiveShadow=N.receiveShadow,gt.setValue(D,"receiveShadow",N.receiveShadow)),B.isMeshGouraudMaterial&&B.envMap!==null&&(Cn.envMap.value=ye,Cn.flipEnvMap.value=ye.isCubeTexture&&ye.isRenderTargetTexture===!1?-1:1),bi&&(gt.setValue(D,"toneMappingExposure",M.toneMappingExposure),De.needsLights&&Dl(Cn,Ur),le&&B.fog===!0&&j.refreshFogUniforms(Cn,le),j.refreshMaterialUniforms(Cn,B,K,H,ce),_r.upload(D,aa(De),Cn,Be)),B.isShaderMaterial&&B.uniformsNeedUpdate===!0&&(_r.upload(D,aa(De),Cn,Be),B.uniformsNeedUpdate=!1),B.isSpriteMaterial&&gt.setValue(D,"center",N.center),gt.setValue(D,"modelViewMatrix",N.modelViewMatrix),gt.setValue(D,"normalMatrix",N.normalMatrix),gt.setValue(D,"modelMatrix",N.matrixWorld),B.isShaderMaterial||B.isRawShaderMaterial){const Ot=B.uniformsGroups;for(let Nr=0,Il=Ot.length;Nr<Il;Nr++)if(Oe.isWebGL2){const ca=Ot[Nr];pe.update(ca,Rn),pe.bind(ca,Rn)}else console.warn("THREE.WebGLRenderer: Uniform Buffer Objects can only be used with WebGL 2.")}return Rn}function Dl(S,L){S.ambientLightColor.needsUpdate=L,S.lightProbe.needsUpdate=L,S.directionalLights.needsUpdate=L,S.directionalLightShadows.needsUpdate=L,S.pointLights.needsUpdate=L,S.pointLightShadows.needsUpdate=L,S.spotLights.needsUpdate=L,S.spotLightShadows.needsUpdate=L,S.rectAreaLights.needsUpdate=L,S.hemisphereLights.needsUpdate=L}function Ul(S){return S.isMeshLambertMaterial||S.isMeshToonMaterial||S.isMeshPhongMaterial||S.isMeshStandardMaterial||S.isShadowMaterial||S.isShaderMaterial&&S.lights===!0}this.getActiveCubeFace=function(){return P},this.getActiveMipmapLevel=function(){return w},this.getRenderTarget=function(){return A},this.setRenderTargetTextures=function(S,L,O){Ne.get(S.texture).__webglTexture=L,Ne.get(S.depthTexture).__webglTexture=O;const B=Ne.get(S);B.__hasExternalTextures=!0,B.__autoAllocateDepthBuffer=O===void 0,B.__autoAllocateDepthBuffer||ve.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),B.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(S,L){const O=Ne.get(S);O.__webglFramebuffer=L,O.__useDefaultFramebuffer=L===void 0},this.setRenderTarget=function(S,L=0,O=0){A=S,P=L,w=O;let B=!0,N=null,le=!1,me=!1;if(S){const ye=Ne.get(S);ye.__useDefaultFramebuffer!==void 0?(Me.bindFramebuffer(D.FRAMEBUFFER,null),B=!1):ye.__webglFramebuffer===void 0?Be.setupRenderTarget(S):ye.__hasExternalTextures&&Be.rebindTextures(S,Ne.get(S.texture).__webglTexture,Ne.get(S.depthTexture).__webglTexture);const Fe=S.texture;(Fe.isData3DTexture||Fe.isDataArrayTexture||Fe.isCompressedArrayTexture)&&(me=!0);const Ae=Ne.get(S).__webglFramebuffer;S.isWebGLCubeRenderTarget?(Array.isArray(Ae[L])?N=Ae[L][O]:N=Ae[L],le=!0):Oe.isWebGL2&&S.samples>0&&Be.useMultisampledRTT(S)===!1?N=Ne.get(S).__webglMultisampledFramebuffer:Array.isArray(Ae)?N=Ae[O]:N=Ae,x.copy(S.viewport),T.copy(S.scissor),Y=S.scissorTest}else x.copy(Z).multiplyScalar(K).floor(),T.copy(ie).multiplyScalar(K).floor(),Y=he;if(Me.bindFramebuffer(D.FRAMEBUFFER,N)&&Oe.drawBuffers&&B&&Me.drawBuffers(S,N),Me.viewport(x),Me.scissor(T),Me.setScissorTest(Y),le){const ye=Ne.get(S.texture);D.framebufferTexture2D(D.FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_CUBE_MAP_POSITIVE_X+L,ye.__webglTexture,O)}else if(me){const ye=Ne.get(S.texture),Fe=L||0;D.framebufferTextureLayer(D.FRAMEBUFFER,D.COLOR_ATTACHMENT0,ye.__webglTexture,O||0,Fe)}I=-1},this.readRenderTargetPixels=function(S,L,O,B,N,le,me){if(!(S&&S.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let xe=Ne.get(S).__webglFramebuffer;if(S.isWebGLCubeRenderTarget&&me!==void 0&&(xe=xe[me]),xe){Me.bindFramebuffer(D.FRAMEBUFFER,xe);try{const ye=S.texture,Fe=ye.format,Ae=ye.type;if(Fe!==Yt&&_e.convert(Fe)!==D.getParameter(D.IMPLEMENTATION_COLOR_READ_FORMAT)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}const Re=Ae===Di&&(ve.has("EXT_color_buffer_half_float")||Oe.isWebGL2&&ve.has("EXT_color_buffer_float"));if(Ae!==En&&_e.convert(Ae)!==D.getParameter(D.IMPLEMENTATION_COLOR_READ_TYPE)&&!(Ae===ln&&(Oe.isWebGL2||ve.has("OES_texture_float")||ve.has("WEBGL_color_buffer_float")))&&!Re){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}L>=0&&L<=S.width-B&&O>=0&&O<=S.height-N&&D.readPixels(L,O,B,N,_e.convert(Fe),_e.convert(Ae),le)}finally{const ye=A!==null?Ne.get(A).__webglFramebuffer:null;Me.bindFramebuffer(D.FRAMEBUFFER,ye)}}},this.copyFramebufferToTexture=function(S,L,O=0){const B=Math.pow(2,-O),N=Math.floor(L.image.width*B),le=Math.floor(L.image.height*B);Be.setTexture2D(L,0),D.copyTexSubImage2D(D.TEXTURE_2D,O,0,0,S.x,S.y,N,le),Me.unbindTexture()},this.copyTextureToTexture=function(S,L,O,B=0){const N=L.image.width,le=L.image.height,me=_e.convert(O.format),xe=_e.convert(O.type);Be.setTexture2D(O,0),D.pixelStorei(D.UNPACK_FLIP_Y_WEBGL,O.flipY),D.pixelStorei(D.UNPACK_PREMULTIPLY_ALPHA_WEBGL,O.premultiplyAlpha),D.pixelStorei(D.UNPACK_ALIGNMENT,O.unpackAlignment),L.isDataTexture?D.texSubImage2D(D.TEXTURE_2D,B,S.x,S.y,N,le,me,xe,L.image.data):L.isCompressedTexture?D.compressedTexSubImage2D(D.TEXTURE_2D,B,S.x,S.y,L.mipmaps[0].width,L.mipmaps[0].height,me,L.mipmaps[0].data):D.texSubImage2D(D.TEXTURE_2D,B,S.x,S.y,me,xe,L.image),B===0&&O.generateMipmaps&&D.generateMipmap(D.TEXTURE_2D),Me.unbindTexture()},this.copyTextureToTexture3D=function(S,L,O,B,N=0){if(M.isWebGL1Renderer){console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: can only be used with WebGL2.");return}const le=Math.round(S.max.x-S.min.x),me=Math.round(S.max.y-S.min.y),xe=S.max.z-S.min.z+1,ye=_e.convert(B.format),Fe=_e.convert(B.type);let Ae;if(B.isData3DTexture)Be.setTexture3D(B,0),Ae=D.TEXTURE_3D;else if(B.isDataArrayTexture||B.isCompressedArrayTexture)Be.setTexture2DArray(B,0),Ae=D.TEXTURE_2D_ARRAY;else{console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: only supports THREE.DataTexture3D and THREE.DataTexture2DArray.");return}D.pixelStorei(D.UNPACK_FLIP_Y_WEBGL,B.flipY),D.pixelStorei(D.UNPACK_PREMULTIPLY_ALPHA_WEBGL,B.premultiplyAlpha),D.pixelStorei(D.UNPACK_ALIGNMENT,B.unpackAlignment);const Re=D.getParameter(D.UNPACK_ROW_LENGTH),nt=D.getParameter(D.UNPACK_IMAGE_HEIGHT),Pt=D.getParameter(D.UNPACK_SKIP_PIXELS),ut=D.getParameter(D.UNPACK_SKIP_ROWS),Jt=D.getParameter(D.UNPACK_SKIP_IMAGES),et=O.isCompressedTexture?O.mipmaps[N]:O.image;D.pixelStorei(D.UNPACK_ROW_LENGTH,et.width),D.pixelStorei(D.UNPACK_IMAGE_HEIGHT,et.height),D.pixelStorei(D.UNPACK_SKIP_PIXELS,S.min.x),D.pixelStorei(D.UNPACK_SKIP_ROWS,S.min.y),D.pixelStorei(D.UNPACK_SKIP_IMAGES,S.min.z),O.isDataTexture||O.isData3DTexture?D.texSubImage3D(Ae,N,L.x,L.y,L.z,le,me,xe,ye,Fe,et.data):B.isCompressedArrayTexture?D.compressedTexSubImage3D(Ae,N,L.x,L.y,L.z,le,me,xe,ye,et.data):D.texSubImage3D(Ae,N,L.x,L.y,L.z,le,me,xe,ye,Fe,et),D.pixelStorei(D.UNPACK_ROW_LENGTH,Re),D.pixelStorei(D.UNPACK_IMAGE_HEIGHT,nt),D.pixelStorei(D.UNPACK_SKIP_PIXELS,Pt),D.pixelStorei(D.UNPACK_SKIP_ROWS,ut),D.pixelStorei(D.UNPACK_SKIP_IMAGES,Jt),N===0&&B.generateMipmaps&&D.generateMipmap(Ae),Me.unbindTexture()},this.initTexture=function(S){S.isCubeTexture?Be.setTextureCube(S,0):S.isData3DTexture?Be.setTexture3D(S,0):S.isDataArrayTexture||S.isCompressedArrayTexture?Be.setTexture2DArray(S,0):Be.setTexture2D(S,0),Me.unbindTexture()},this.resetState=function(){P=0,w=0,A=null,Me.reset(),fe.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return un}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorSpace=e===zs?"display-p3":"srgb",t.unpackColorSpace=$e.workingColorSpace===Cr?"display-p3":"srgb"}get useLegacyLights(){return console.warn("THREE.WebGLRenderer: The property .useLegacyLights has been deprecated. Migrate your lighting according to the following guide: https://discourse.threejs.org/t/updates-to-lighting-in-three-js-r155/53733."),this._useLegacyLights}set useLegacyLights(e){console.warn("THREE.WebGLRenderer: The property .useLegacyLights has been deprecated. Migrate your lighting according to the following guide: https://discourse.threejs.org/t/updates-to-lighting-in-three-js-r155/53733."),this._useLegacyLights=e}}class Tm extends ks{}Tm.prototype.isWebGL1Renderer=!0;class vl extends Et{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new dn,this.environmentRotation=new dn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),t.object.environmentRotation=this.environmentRotation.toArray(),t}}class xl extends Si{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new We(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}}const Uo=new U,Io=new U,No=new rt,_s=new Gs,ur=new Oi;class Am extends Et{constructor(e=new Ct,t=new xl){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,n=[0];for(let r=1,s=t.count;r<s;r++)Uo.fromBufferAttribute(t,r-1),Io.fromBufferAttribute(t,r),n[r]=n[r-1],n[r]+=Uo.distanceTo(Io);e.setAttribute("lineDistance",new ot(n,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){const n=this.geometry,r=this.matrixWorld,s=e.params.Line.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),ur.copy(n.boundingSphere),ur.applyMatrix4(r),ur.radius+=s,e.ray.intersectsSphere(ur)===!1)return;No.copy(r).invert(),_s.copy(e.ray).applyMatrix4(No);const a=s/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=new U,u=new U,h=new U,p=new U,m=this.isLineSegments?2:1,_=n.index,d=n.attributes.position;if(_!==null){const f=Math.max(0,o.start),b=Math.min(_.count,o.start+o.count);for(let M=f,y=b-1;M<y;M+=m){const P=_.getX(M),w=_.getX(M+1);if(c.fromBufferAttribute(d,P),u.fromBufferAttribute(d,w),_s.distanceSqToSegment(c,u,p,h)>l)continue;p.applyMatrix4(this.matrixWorld);const I=e.ray.origin.distanceTo(p);I<e.near||I>e.far||t.push({distance:I,point:h.clone().applyMatrix4(this.matrixWorld),index:M,face:null,faceIndex:null,object:this})}}else{const f=Math.max(0,o.start),b=Math.min(d.count,o.start+o.count);for(let M=f,y=b-1;M<y;M+=m){if(c.fromBufferAttribute(d,M),u.fromBufferAttribute(d,M+1),_s.distanceSqToSegment(c,u,p,h)>l)continue;p.applyMatrix4(this.matrixWorld);const w=e.ray.origin.distanceTo(p);w<e.near||w>e.far||t.push({distance:w,point:h.clone().applyMatrix4(this.matrixWorld),index:M,face:null,faceIndex:null,object:this})}}}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const r=t[n[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,o=r.length;s<o;s++){const a=r[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=s}}}}}const Fo=new U,Oo=new U;class wm extends Am{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,n=[];for(let r=0,s=t.count;r<s;r+=2)Fo.fromBufferAttribute(t,r),Oo.fromBufferAttribute(t,r+1),n[r]=r===0?0:n[r-1],n[r+1]=n[r]+Fo.distanceTo(Oo);e.setAttribute("lineDistance",new ot(n,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class Ml extends Si{constructor(e){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new We(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}const Bo=new rt,Us=new Gs,hr=new Oi,dr=new U;class Rm extends Et{constructor(e=new Ct,t=new Ml){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}raycast(e,t){const n=this.geometry,r=this.matrixWorld,s=e.params.Points.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),hr.copy(n.boundingSphere),hr.applyMatrix4(r),hr.radius+=s,e.ray.intersectsSphere(hr)===!1)return;Bo.copy(r).invert(),Us.copy(e.ray).applyMatrix4(Bo);const a=s/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=n.index,h=n.attributes.position;if(c!==null){const p=Math.max(0,o.start),m=Math.min(c.count,o.start+o.count);for(let _=p,g=m;_<g;_++){const d=c.getX(_);dr.fromBufferAttribute(h,d),zo(dr,d,l,r,e,t,this)}}else{const p=Math.max(0,o.start),m=Math.min(h.count,o.start+o.count);for(let _=p,g=m;_<g;_++)dr.fromBufferAttribute(h,_),zo(dr,_,l,r,e,t,this)}}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const r=t[n[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,o=r.length;s<o;s++){const a=r[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=s}}}}}function zo(i,e,t,n,r,s,o){const a=Us.distanceSqToPoint(i);if(a<t){const l=new U;Us.closestPointToPoint(i,l),l.applyMatrix4(n);const c=r.ray.origin.distanceTo(l);if(c<r.near||c>r.far)return;s.push({distance:c,distanceToRay:Math.sqrt(a),point:l,index:e,face:null,object:o})}}class Vs extends Ct{constructor(e=1,t=32,n=0,r=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:e,segments:t,thetaStart:n,thetaLength:r},t=Math.max(3,t);const s=[],o=[],a=[],l=[],c=new U,u=new Ve;o.push(0,0,0),a.push(0,0,1),l.push(.5,.5);for(let h=0,p=3;h<=t;h++,p+=3){const m=n+h/t*r;c.x=e*Math.cos(m),c.y=e*Math.sin(m),o.push(c.x,c.y,c.z),a.push(0,0,1),u.x=(o[p]/e+1)/2,u.y=(o[p+1]/e+1)/2,l.push(u.x,u.y)}for(let h=1;h<=t;h++)s.push(h,h+1,0);this.setIndex(s),this.setAttribute("position",new ot(o,3)),this.setAttribute("normal",new ot(a,3)),this.setAttribute("uv",new ot(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Vs(e.radius,e.segments,e.thetaStart,e.thetaLength)}}class Ws extends Ct{constructor(e=1,t=1,n=1,r=32,s=1,o=!1,a=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:r,heightSegments:s,openEnded:o,thetaStart:a,thetaLength:l};const c=this;r=Math.floor(r),s=Math.floor(s);const u=[],h=[],p=[],m=[];let _=0;const g=[],d=n/2;let f=0;b(),o===!1&&(e>0&&M(!0),t>0&&M(!1)),this.setIndex(u),this.setAttribute("position",new ot(h,3)),this.setAttribute("normal",new ot(p,3)),this.setAttribute("uv",new ot(m,2));function b(){const y=new U,P=new U;let w=0;const A=(t-e)/n;for(let I=0;I<=s;I++){const q=[],x=I/s,T=x*(t-e)+e;for(let Y=0;Y<=r;Y++){const $=Y/r,R=$*l+a,V=Math.sin(R),H=Math.cos(R);P.x=T*V,P.y=-x*n+d,P.z=T*H,h.push(P.x,P.y,P.z),y.set(V,A,H).normalize(),p.push(y.x,y.y,y.z),m.push($,1-x),q.push(_++)}g.push(q)}for(let I=0;I<r;I++)for(let q=0;q<s;q++){const x=g[q][I],T=g[q+1][I],Y=g[q+1][I+1],$=g[q][I+1];u.push(x,T,$),u.push(T,Y,$),w+=6}c.addGroup(f,w,0),f+=w}function M(y){const P=_,w=new Ve,A=new U;let I=0;const q=y===!0?e:t,x=y===!0?1:-1;for(let Y=1;Y<=r;Y++)h.push(0,d*x,0),p.push(0,x,0),m.push(.5,.5),_++;const T=_;for(let Y=0;Y<=r;Y++){const R=Y/r*l+a,V=Math.cos(R),H=Math.sin(R);A.x=q*H,A.y=d*x,A.z=q*V,h.push(A.x,A.y,A.z),p.push(0,x,0),w.x=V*.5+.5,w.y=H*.5*x+.5,m.push(w.x,w.y),_++}for(let Y=0;Y<r;Y++){const $=P+Y,R=T+Y;y===!0?u.push(R,R+1,$):u.push(R+1,R,$),I+=3}c.addGroup(f,I,y===!0?1:2),f+=I}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Ws(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}const fr=new U,pr=new U,vs=new U,mr=new $t;class Cm extends Ct{constructor(e=null,t=1){if(super(),this.type="EdgesGeometry",this.parameters={geometry:e,thresholdAngle:t},e!==null){const r=Math.pow(10,4),s=Math.cos(gr*t),o=e.getIndex(),a=e.getAttribute("position"),l=o?o.count:a.count,c=[0,0,0],u=["a","b","c"],h=new Array(3),p={},m=[];for(let _=0;_<l;_+=3){o?(c[0]=o.getX(_),c[1]=o.getX(_+1),c[2]=o.getX(_+2)):(c[0]=_,c[1]=_+1,c[2]=_+2);const{a:g,b:d,c:f}=mr;if(g.fromBufferAttribute(a,c[0]),d.fromBufferAttribute(a,c[1]),f.fromBufferAttribute(a,c[2]),mr.getNormal(vs),h[0]=`${Math.round(g.x*r)},${Math.round(g.y*r)},${Math.round(g.z*r)}`,h[1]=`${Math.round(d.x*r)},${Math.round(d.y*r)},${Math.round(d.z*r)}`,h[2]=`${Math.round(f.x*r)},${Math.round(f.y*r)},${Math.round(f.z*r)}`,!(h[0]===h[1]||h[1]===h[2]||h[2]===h[0]))for(let b=0;b<3;b++){const M=(b+1)%3,y=h[b],P=h[M],w=mr[u[b]],A=mr[u[M]],I=`${y}_${P}`,q=`${P}_${y}`;q in p&&p[q]?(vs.dot(p[q].normal)<=s&&(m.push(w.x,w.y,w.z),m.push(A.x,A.y,A.z)),p[q]=null):I in p||(p[I]={index0:c[b],index1:c[M],normal:vs.clone()})}}for(const _ in p)if(p[_]){const{index0:g,index1:d}=p[_];fr.fromBufferAttribute(a,g),pr.fromBufferAttribute(a,d),m.push(fr.x,fr.y,fr.z),m.push(pr.x,pr.y,pr.z)}this.setAttribute("position",new ot(m,3))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}}class Xs extends Ct{constructor(e=.5,t=1,n=32,r=1,s=0,o=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:e,outerRadius:t,thetaSegments:n,phiSegments:r,thetaStart:s,thetaLength:o},n=Math.max(3,n),r=Math.max(1,r);const a=[],l=[],c=[],u=[];let h=e;const p=(t-e)/r,m=new U,_=new Ve;for(let g=0;g<=r;g++){for(let d=0;d<=n;d++){const f=s+d/n*o;m.x=h*Math.cos(f),m.y=h*Math.sin(f),l.push(m.x,m.y,m.z),c.push(0,0,1),_.x=(m.x/t+1)/2,_.y=(m.y/t+1)/2,u.push(_.x,_.y)}h+=p}for(let g=0;g<r;g++){const d=g*(n+1);for(let f=0;f<n;f++){const b=f+d,M=b,y=b+n+1,P=b+n+2,w=b+1;a.push(M,y,w),a.push(y,P,w)}}this.setIndex(a),this.setAttribute("position",new ot(l,3)),this.setAttribute("normal",new ot(c,3)),this.setAttribute("uv",new ot(u,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Xs(e.innerRadius,e.outerRadius,e.thetaSegments,e.phiSegments,e.thetaStart,e.thetaLength)}}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:Os}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=Os);class Pm{renderer=null;scene=null;camera=null;canvas;palette;mode=null;meshes=[];clock=0;constructor(e,t){this.canvas=e,this.palette=t}init(){try{return this.renderer=new ks({canvas:this.canvas,antialias:!0,alpha:!1}),this.renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2)),this.scene=new vl,this.scene.background=new We(0),this.camera=new Ut(60,1,.1,100),this.camera.position.z=3.2,this.resize(),!0}catch{return!1}}resize(){if(!this.renderer||!this.camera)return;const e=this.canvas.clientWidth||window.innerWidth,t=this.canvas.clientHeight||window.innerHeight,n=Math.min(window.devicePixelRatio||1,2);this.renderer.setSize(e,t,!1),this.renderer.setPixelRatio(n),this.canvas.width=Math.floor(e*n),this.canvas.height=Math.floor(t*n),this.camera.aspect=e/t,this.camera.updateProjectionMatrix()}setMode(e){this.mode=e,this.clear(),this.scene&&(e.id==="flower"?this.buildFlower():e.id==="orbit-rings"?this.buildRings():e.id==="neon-tunnel"?this.buildTunnel():e.id==="hex-pulse"?this.buildHex():e.id==="kaleido"?this.buildKaleido():e.id==="cosmic-nebula"?this.buildNebula():e.id.startsWith("hybrid")||e.id==="bloom-grid"?this.buildHybrid():this.buildFlower())}clear(){this.scene&&(this.meshes.forEach(e=>this.scene.remove(e)),this.meshes=[])}buildNebula(){const t=new Ct,n=new Float32Array(2e3*3),r=new Float32Array(2e3*3);for(let a=0;a<2e3;a++){const l=.2+Math.random()*2.2,c=Math.random()*Math.PI*2,u=(Math.random()-.5)*Math.PI*.8;n[a*3]=l*Math.cos(c)*Math.cos(u),n[a*3+1]=l*Math.sin(u),n[a*3+2]=l*Math.sin(c)*Math.cos(u);const h=this.palette.sample(Math.random());r[a*3]=h.r,r[a*3+1]=h.g,r[a*3+2]=h.b}t.setAttribute("position",new Gt(n,3)),t.setAttribute("color",new Gt(r,3));const s=new Ml({size:.04,vertexColors:!0,transparent:!0,opacity:.8,blending:ys}),o=new Rm(t,s);this.scene.add(o),this.meshes.push(o)}buildFlower(){const e=new cn,t=9;for(let n=0;n<t;n++){const r=new Vs(.18,32,0,Math.PI*.9),s=new ui({color:16711772,transparent:!0,opacity:.55,side:Xt}),o=new Nt(r,s);o.rotation.z=n/t*Math.PI*2,o.position.set(Math.cos(o.rotation.z)*.35,Math.sin(o.rotation.z)*.35,0),o.rotation.x=.5,e.add(o)}this.scene.add(e),this.meshes.push(e)}buildRings(){const e=new cn;for(let t=0;t<5;t++){const n=new Xs(.35+t*.18,.37+t*.18,128),r=new ui({color:58879,transparent:!0,opacity:.45,side:Xt}),s=new Nt(n,r);s.rotation.x=Math.PI*.15*t,e.add(s)}this.scene.add(e),this.meshes.push(e)}buildTunnel(){const e=new cn;for(let t=0;t<12;t++){const n=.2+t*.16,r=new yi(n,n,.04),s=new Cm(r),o=new xl({color:9494767,transparent:!0,opacity:.6-t*.04}),a=new wm(s,o);a.position.z=-t*.28,e.add(a)}this.scene.add(e),this.meshes.push(e)}buildHex(){const e=new cn,t=8*6;for(let n=0;n<t;n++){const r=new Ws(.08,.08,.1,6),s=new ui({color:7929600,transparent:!0,opacity:.52}),o=new Nt(r,s),a=n%8-3.5,l=Math.floor(n/8)-3;o.position.set(a*.28,l*.32,0),e.add(o)}this.scene.add(e),this.meshes.push(e)}buildKaleido(){const e=new cn,t=6;for(let n=0;n<t;n++){const r=new Bi(1.8,.04),s=new ui({color:13073919,transparent:!0,opacity:.6}),o=new Nt(r,s);o.rotation.z=n/t*Math.PI,e.add(o)}this.scene.add(e),this.meshes.push(e)}buildHybrid(){this.buildFlower()}frame(e,t,n){if(!this.renderer||!this.scene||!this.camera)return;this.clock=e;const r=t.band,s=r.bass?.norm||0,o=r.mid?.norm||0,a=r.air?.onset||0,l=Math.max(.1,n.zoom||1),c=(n.pan?.x||0)*3,u=(n.pan?.y||0)*3;let h=0;n.flyThrough&&(h=Math.sin(e*5e-4*(n.flySpeed||1))*.8),this.camera.position.set(c+h,u,3.2/l+Math.sin(e*2e-4)*.3),this.camera.lookAt(c,u,0);const p=this.mode?.id;if(p==="flower"){const m=this.meshes[0];m&&(m.rotation.z+=35e-5+o*.0012,m.scale.setScalar(.9+s*.55+t.beatPulse*.12)),this.scene.background=new We().setHSL(performance.now()*3e-5%1,.85,.06+a*.04)}else if(p==="orbit-rings")this.meshes[0]?.children.forEach((m,_)=>{m.rotation.z+=12e-5*(1+_*.2)+o*.001,m.scale.setScalar(1+t.bandsNorm[_*4]*.12)});else if(p==="neon-tunnel")this.meshes[0]?.children.forEach((m,_)=>{m.position.z+=.002+s*.006,m.position.z>1&&(m.position.z=-3.5)});else if(p==="hex-pulse")this.meshes[0]?.children.forEach((m,_)=>{const g=t.bandsNorm[_%64];m.scale.setScalar(.6+g*.9),m.rotation.y+=.005+g*.02});else if(p==="kaleido")this.meshes[0]?.rotation.set(0,0,e*12e-5);else if(p==="cosmic-nebula"&&this.meshes[0]){this.meshes[0].rotation.y+=.001+o*.003,this.meshes[0].rotation.z+=5e-4+s*.002;const m=1+s*.35+t.beatPulse*.15;this.meshes[0].scale.set(m,m,m)}if(p?.startsWith("hybrid")||p==="bloom-grid"){const m=window.FluidSimInstance;if(m&&m.isReady&&m.isReady()&&t.beat){const _=Math.random()*Math.PI*2;m.splat(.5+Math.cos(_)*.12,.5+Math.sin(_)*.12,Math.cos(_)*12,Math.sin(_)*12,this.palette.hdr(Math.random(),3.2))}}this.renderer.render(this.scene,this.camera)}}const Lm=[{id:"flower",name:"Bloom Flower",group:"Geometry · Organic"},{id:"orbit-rings",name:"Orbit Rings",group:"Geometry · Minimal"},{id:"neon-tunnel",name:"Neon Tunnel",group:"Geometry · Minimal"},{id:"hex-pulse",name:"Hex Pulse",group:"Geometry · Lattice"},{id:"kaleido",name:"Kaleidoscope",group:"Geometry · Symmetry"},{id:"cosmic-nebula",name:"Cosmic Dust Nebula",group:"Particle · 3D Vortex"},{id:"bloom-grid",name:"Bloom Grid (Hybrid)",group:"Hybrid · Fluid-Geometry"},{id:"hybrid-mandala",name:"Fractal Mandala (Hybrid)",group:"Hybrid · Fractal-Geometry"}],Dm=`#version 300 es
precision highp float;
in vec2 aPosition;
void main() { gl_Position = vec4(aPosition, 0.0, 1.0); }`,Um=`#version 300 es
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
}`;class Im{gl=null;canvas;palette;prog=null;quad=null;palTex=null;uniforms={};ready=!1;constructor(e,t){this.canvas=e,this.palette=t}init(){if(this.gl=this.canvas.getContext("webgl2",{alpha:!1}),!this.gl)return!1;const e=this.gl.createShader(this.gl.VERTEX_SHADER);this.gl.shaderSource(e,Dm),this.gl.compileShader(e);const t=this.gl.createShader(this.gl.FRAGMENT_SHADER);return this.gl.shaderSource(t,Um),this.gl.compileShader(t),this.gl.getShaderParameter(t,this.gl.COMPILE_STATUS)?(this.prog=this.gl.createProgram(),this.gl.attachShader(this.prog,e),this.gl.attachShader(this.prog,t),this.gl.bindAttribLocation(this.prog,0,"aPosition"),this.gl.linkProgram(this.prog),["uRes","uTime","uMouse","uBass","uMid","uTreble","uEnergy","uBeatPulse","uZoom","uPan","uSpeedScale","uDetail","uPal","uPalShift"].forEach(r=>this.uniforms[r]=this.gl.getUniformLocation(this.prog,r)),this.quad=this.gl.createBuffer(),this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.quad),this.gl.bufferData(this.gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),this.gl.STATIC_DRAW),this.palTex=this.gl.createTexture(),this.updatePalette(),this.ready=!0,this.resize(),!0):(console.error("WarpEngine shader fail:",this.gl.getShaderInfoLog(t)),!1)}resize(){if(!this.gl)return;const e=Math.min(window.devicePixelRatio||1,2),t=Math.floor((this.canvas.clientWidth||window.innerWidth)*e),n=Math.floor((this.canvas.clientHeight||window.innerHeight)*e);(this.canvas.width!==t||this.canvas.height!==n)&&(this.canvas.width=t,this.canvas.height=n)}updatePalette(){if(!this.gl||!this.palTex)return;const e=256,t=new Uint8Array(e*4);for(let n=0;n<e;n++){const r=this.palette.sample(n/e);t[n*4]=Math.round(r.r*255),t[n*4+1]=Math.round(r.g*255),t[n*4+2]=Math.round(r.b*255),t[n*4+3]=255}this.gl.bindTexture(this.gl.TEXTURE_2D,this.palTex),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_MIN_FILTER,this.gl.LINEAR),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_MAG_FILTER,this.gl.LINEAR),this.gl.texImage2D(this.gl.TEXTURE_2D,0,this.gl.RGBA,e,1,0,this.gl.RGBA,this.gl.UNSIGNED_BYTE,t)}render(e,t,n,r={}){!this.ready||!this.gl||!this.prog||(this.updatePalette(),this.gl.useProgram(this.prog),this.gl.viewport(0,0,this.canvas.width,this.canvas.height),this.gl.uniform2f(this.uniforms.uRes,this.canvas.width,this.canvas.height),this.gl.uniform1f(this.uniforms.uTime,e*.001),this.gl.uniform2f(this.uniforms.uMouse,n.x,n.y),this.gl.uniform1f(this.uniforms.uBass,t.bass||0),this.gl.uniform1f(this.uniforms.uMid,t.mid||0),this.gl.uniform1f(this.uniforms.uTreble,t.treble||0),this.gl.uniform1f(this.uniforms.uEnergy,t.energy||0),this.gl.uniform1f(this.uniforms.uBeatPulse,t.beatPulse||0),this.gl.uniform1f(this.uniforms.uZoom,r.zoom??1),this.gl.uniform2f(this.uniforms.uPan,r.pan?.x||0,r.pan?.y||0),this.gl.uniform1f(this.uniforms.uSpeedScale,(r.flySpeed??1)*(r.fly?1.6:1)),this.gl.uniform1f(this.uniforms.uDetail,r.detail??.6),this.gl.uniform1f(this.uniforms.uPalShift,this.palette.flow(0,.01)%1),this.gl.activeTexture(this.gl.TEXTURE0),this.gl.bindTexture(this.gl.TEXTURE_2D,this.palTex),this.gl.uniform1i(this.uniforms.uPal,0),this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.quad),this.gl.vertexAttribPointer(0,2,this.gl.FLOAT,!1,0,0),this.gl.enableVertexAttribArray(0),this.gl.drawArrays(this.gl.TRIANGLES,0,3))}}const Nm=`#version 300 es
precision highp float;
in vec2 aPosition;
void main() { gl_Position = vec4(aPosition, 0.0, 1.0); }`,Fm=`#version 300 es
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
}`;class Om{gl=null;canvas;palette;prog=null;quad=null;palTex=null;uniforms={};ready=!1;constructor(e,t){this.canvas=e,this.palette=t}init(){if(this.gl=this.canvas.getContext("webgl2",{alpha:!1}),!this.gl)return!1;const e=this.gl.createShader(this.gl.VERTEX_SHADER);this.gl.shaderSource(e,Nm),this.gl.compileShader(e);const t=this.gl.createShader(this.gl.FRAGMENT_SHADER);if(this.gl.shaderSource(t,Fm),this.gl.compileShader(t),!this.gl.getShaderParameter(t,this.gl.COMPILE_STATUS))return console.error("CyberGridEngine shader fail:",this.gl.getShaderInfoLog(t)),!1;this.prog=this.gl.createProgram(),this.gl.attachShader(this.prog,e),this.gl.attachShader(this.prog,t),this.gl.bindAttribLocation(this.prog,0,"aPosition"),this.gl.linkProgram(this.prog),["uRes","uTime","uMouse","uBass","uMid","uTreble","uEnergy","uBeatPulse","uZoom","uPan","uSpeedScale","uDetail","uPal","uPalShift"].forEach(r=>this.uniforms[r]=this.gl.getUniformLocation(this.prog,r));for(let r=0;r<16;r++)this.uniforms[`uSpectrum[${r}]`]=this.gl.getUniformLocation(this.prog,`uSpectrum[${r}]`);return this.quad=this.gl.createBuffer(),this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.quad),this.gl.bufferData(this.gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),this.gl.STATIC_DRAW),this.palTex=this.gl.createTexture(),this.updatePalette(),this.ready=!0,this.resize(),!0}resize(){if(!this.gl)return;const e=Math.min(window.devicePixelRatio||1,2),t=Math.floor((this.canvas.clientWidth||window.innerWidth)*e),n=Math.floor((this.canvas.clientHeight||window.innerHeight)*e);(this.canvas.width!==t||this.canvas.height!==n)&&(this.canvas.width=t,this.canvas.height=n)}updatePalette(){if(!this.gl||!this.palTex)return;const e=256,t=new Uint8Array(e*4);for(let n=0;n<e;n++){const r=this.palette.sample(n/e);t[n*4]=Math.round(r.r*255),t[n*4+1]=Math.round(r.g*255),t[n*4+2]=Math.round(r.b*255),t[n*4+3]=255}this.gl.bindTexture(this.gl.TEXTURE_2D,this.palTex),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_MIN_FILTER,this.gl.LINEAR),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_MAG_FILTER,this.gl.LINEAR),this.gl.texImage2D(this.gl.TEXTURE_2D,0,this.gl.RGBA,e,1,0,this.gl.RGBA,this.gl.UNSIGNED_BYTE,t)}render(e,t,n,r={}){if(!(!this.ready||!this.gl||!this.prog)){if(this.updatePalette(),this.gl.useProgram(this.prog),this.gl.viewport(0,0,this.canvas.width,this.canvas.height),this.gl.uniform2f(this.uniforms.uRes,this.canvas.width,this.canvas.height),this.gl.uniform1f(this.uniforms.uTime,e*.001),this.gl.uniform2f(this.uniforms.uMouse,n.x,n.y),this.gl.uniform1f(this.uniforms.uBass,t.bass||0),this.gl.uniform1f(this.uniforms.uMid,t.mid||0),this.gl.uniform1f(this.uniforms.uTreble,t.treble||0),this.gl.uniform1f(this.uniforms.uEnergy,t.energy||0),this.gl.uniform1f(this.uniforms.uBeatPulse,t.beatPulse||0),this.gl.uniform1f(this.uniforms.uZoom,r.zoom??1),this.gl.uniform2f(this.uniforms.uPan,r.pan?.x||0,r.pan?.y||0),this.gl.uniform1f(this.uniforms.uSpeedScale,(r.flySpeed??1)*(r.fly?1.6:1)),this.gl.uniform1f(this.uniforms.uDetail,r.detail??.6),this.gl.uniform1f(this.uniforms.uPalShift,this.palette.flow(0,.01)%1),t.bandsNorm)for(let s=0;s<16;s++){const o=t.bandsNorm[s*4]||0,a=this.uniforms[`uSpectrum[${s}]`];a&&this.gl.uniform1f(a,o)}this.gl.activeTexture(this.gl.TEXTURE0),this.gl.bindTexture(this.gl.TEXTURE_2D,this.palTex),this.gl.uniform1i(this.uniforms.uPal,0),this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.quad),this.gl.vertexAttribPointer(0,2,this.gl.FLOAT,!1,0,0),this.gl.enableVertexAttribArray(0),this.gl.drawArrays(this.gl.TRIANGLES,0,3)}}}const Bm=[{id:"hyperspace-warp",name:"Hyperspace Warp Tunnel",group:"Warp · Hyperspace",engine:"warp"}],zm=[{id:"quantum-grid",name:"Quantum Cyber Grid",group:"Cyber · Synthwave",engine:"cyber"}],Gm=[{id:"julia-flow",name:"Julia Bloom Flow",group:"Fluid · Kinetic",engine:"fluid",physics:{diss:.988,vort:16,visc:.1,radius:.055}},{id:"spectrum-fountain",name:"Spectrum Fountain",group:"Fluid · Spectral",engine:"fluid",physics:{diss:.972,vort:28,visc:.18,radius:.16}},{id:"kaleidofluid",name:"Kaleidofluid",group:"Fluid · Symmetry",engine:"fluid",fractal:.35,physics:{diss:.984,vort:38,visc:.2,radius:.18}},{id:"attractor-bloom",name:"Attractor Bloom",group:"Fluid · Kinetic",engine:"fluid",fractal:.2,physics:{diss:.991,vort:34,visc:.1,radius:.1}}],Hm=[{id:"plasma-vortex",name:"Plasma Vortex",group:"Fractal · Psychedelic",engine:"fractal",shader:"plasma",detail:.75,timeScale:1e-4,palSpeed:3e-4},{id:"sacred-geometry",name:"Sacred Geometry",group:"Geometry · Sacred",engine:"fractal",shader:"sacred",detail:.7,timeScale:1e-4,palSpeed:2e-4},{id:"julia-bloom",name:"Julia Bloom",group:"Fractal · Endless",engine:"fractal",shader:"julia",detail:.65,timeScale:1e-4,palSpeed:2e-4},{id:"mandala",name:"Third Eye Mandala",group:"Fractal · Endless",engine:"fractal",shader:"mandala",detail:.6}];function km(){const i=[];return Bm.forEach(e=>i.push(e)),zm.forEach(e=>i.push(e)),Hm.forEach(e=>i.push(e)),Gm.forEach(e=>i.push(e)),Lm.forEach(e=>i.push({...e,engine:"geometry"})),i}function Vm(i,e,t){i.innerHTML=`
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
      <button id="b-hud-fs" class="hud-btn" title="Toggle Fullscreen ( F )">⛶</button>
    </div>
  </header>

  <button id="ptoggle" aria-label="Toggle Control Drawer">‹</button>

  <aside id="panel">
    <div class="ph">
      <span class="pt">Visualizer Control Drawer</span>
      <span class="phint">H hide · F full · R random</span>
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
      <div class="sh"><span class="chev">▼</span>Visualizer Mode & Palette</div>
      <div class="sb">
        <label>Animation Mode <span id="mode-count"></span></label>
        <select id="sel-mode"></select>
        <div class="grid3" style="margin-top:6px;">
          <button id="b-prev">‹ Prev</button>
          <button id="b-rand">Random</button>
          <button id="b-next">Next ›</button>
        </div>
        <button id="b-vr" hidden style="width:100%;margin-top:8px;">Enter WebXR 6DOF</button>
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
        <label>Zoom Level <span id="v-zoom">1.00×</span><input id="s-zoom" type="range" min="-100" max="600" step="1" value="0"/></label>
        <label>Fractal Seed Morph <span id="v-morph">0%</span><input id="s-morph" type="range" min="0" max="100" step="1" value="0"/></label>
        <label>Auto-Morph Speed <span id="v-morph-rate">0%</span><input id="s-morph-rate" type="range" min="0" max="100" step="5" value="0"/></label>
        <button id="b-reset-view" style="width:100%; margin-top:6px;">Reset Camera View</button>
        <label class="row" style="margin-top:10px;"><span>Fly-Through Drift</span><button id="sw-fly" class="switch"></button></label>
        <label>Flight Speed <span id="v-fly">1.0×</span><input id="s-fly" type="range" min="0.2" max="3" step="0.1" value="1.0"/></label>
      </div>
    </section>
  </aside>
  `;const n=l=>i.querySelector(`#${l}`);n("ptoggle")?.addEventListener("click",()=>i.querySelector("#panel").classList.toggle("collapsed")),i.querySelectorAll(".sh").forEach(l=>l.addEventListener("click",()=>l.parentElement.classList.toggle("collapsed"))),n("b-sys")?.addEventListener("click",t.onSystem),n("b-mic")?.addEventListener("click",t.onMic),n("b-file")?.addEventListener("click",()=>i.querySelector("#f-input").click()),i.querySelector("#f-input")?.addEventListener("change",l=>{l.target.files[0]&&t.onFile(l.target.files[0])}),n("b-demo")?.addEventListener("click",t.onDemo),n("b-demo-next")?.addEventListener("click",t.onDemoNext),n("b-demo-stop")?.addEventListener("click",t.onDemoStop),n("b-yt")?.addEventListener("click",()=>{const l=i.querySelector("#yt-url").value.trim();l&&t.onYouTube(l)}),i.querySelector("#yt-url")?.addEventListener("keydown",l=>{if(l.key==="Enter"){l.preventDefault();const c=i.querySelector("#yt-url").value.trim();c&&t.onYouTube(c)}}),n("b-sp")?.addEventListener("click",()=>{const l=i.querySelector("#sp-url").value.trim();l&&t.onSpotify(l)}),i.querySelector("#sp-url")?.addEventListener("keydown",l=>{if(l.key==="Enter"){l.preventDefault();const c=i.querySelector("#sp-url").value.trim();c&&t.onSpotify(c)}}),n("b-sp-capture")?.addEventListener("click",t.onSpotifyCapture),n("b-prev")?.addEventListener("click",()=>t.onMode(-1)),n("b-next")?.addEventListener("click",()=>t.onMode(1)),n("b-rand")?.addEventListener("click",t.onRandom),n("b-hud-prev")?.addEventListener("click",()=>t.onMode(-1)),n("b-hud-next")?.addEventListener("click",()=>t.onMode(1)),n("b-hud-rand")?.addEventListener("click",t.onRandom),n("b-hud-fs")?.addEventListener("click",t.onFullscreen);const r=i.querySelector("#sel-mode"),s=i.querySelector("#hud-sel-mode"),o={};e.forEach((l,c)=>{if(!o[l.group]){const p=document.createElement("optgroup");p.label=l.group,r.appendChild(p),o[l.group]=p}const u=document.createElement("option");u.value=String(c),u.textContent=l.name,o[l.group].appendChild(u);const h=document.createElement("option");h.value=String(c),h.textContent=l.name,s.appendChild(h)});const a=i.querySelector("#mode-count");return a&&(a.textContent=e.length+" modes"),r.addEventListener("change",l=>{const c=parseInt(l.target.value,10);s.value=String(c),t.onMode(c)}),s.addEventListener("change",l=>{const c=parseInt(l.target.value,10);r.value=String(c),t.onMode(c)}),{root:i,$:n}}class Wm{renderer;scene;camera;session=null;refSpace=null;eyeY=1.5;worldOffset=new U(0,0,0);flySpeed=1.4;pendingCb=null;onChange;constructor(e,t,n){this.renderer=e,this.scene=t,this.camera=n,this.renderer.xr.enabled=!0}async available(){if(!navigator.xr||!navigator.xr.isSessionSupported)return!1;try{return await navigator.xr.isSessionSupported("immersive-vr")}catch{return!1}}isActive(){return!!this.session}async start(e){this.onChange=e,this.session=await navigator.xr.requestSession("immersive-vr",{optionalFeatures:["local-floor","bounded-floor","hand-tracking"]}),await this.renderer.xr.setSession(this.session);try{this.refSpace=await this.session.requestReferenceSpace("local-floor"),this.eyeY=1.5}catch{this.refSpace=await this.session.requestReferenceSpace("local"),this.eyeY=0}return this.session.addEventListener("end",()=>{this.session=null,this.refSpace=null,this.onChange&&this.onChange(!1);const t=this.pendingCb;this.pendingCb=null,t&&requestAnimationFrame(t)}),this.onChange&&this.onChange(!0),this.session}stop(){this.session&&this.session.end()}setFlySpeed(e){this.flySpeed=e}getWorldOffset(){return this.worldOffset.clone()}resetWorld(){this.worldOffset.set(0,0,0)}handleInput(e){if(!this.session||!this.refSpace)return;const t=Array.from(this.session.inputSources||[]);for(const n of t){if(n.gamepad?.axes){const r=n.gamepad.axes[0]||0,s=n.gamepad.axes[1]||0,o=.18;if(Math.abs(r)>o||Math.abs(s)>o){const a=this.flySpeed*.016;this.worldOffset.x-=r*a,this.worldOffset.z-=s*a;const l=n.gamepad.axes[3]||0;Math.abs(l)>o&&(this.worldOffset.y-=l*a*.6)}}n.gripSpace&&n.gamepad?.buttons[1]?.pressed&&e.getPose(n.gripSpace,this.refSpace)&&(this.worldOffset.x+=(Math.random()-.5)*.002),n.hand}this.scene.position.copy(this.worldOffset)}raf(e){this.pendingCb=e,this.session?this.session.requestAnimationFrame((t,n)=>{this.pendingCb=null,e(t,n)}):requestAnimationFrame(e)}}const Xm=document.querySelector("#app");Xm.innerHTML=`
  <div id="stage">
    <canvas id="fluid" class="stage"></canvas>
    <canvas id="fractal" class="stage"></canvas>
    <canvas id="geo" class="stage"></canvas>
    <canvas id="warp" class="stage"></canvas>
    <canvas id="cyber" class="stage"></canvas>
  </div>
  <div id="ui-root"></div>
  <div id="flash"><div class="fname"></div><div class="fgroup"></div></div>
  <div id="toast"></div>
`;const qs=document.getElementById("fluid"),Ys=document.getElementById("fractal"),$s=document.getElementById("geo"),Ks=document.getElementById("warp"),Zs=document.getElementById("cyber"),qm=document.getElementById("ui-root"),It=new $l,Ye=new Wl,pt=new rc(qs),bn=new cc(Ys,It),Ar=new Pm($s,It),js=new Im(Ks,It),Js=new Om(Zs,It),hn=km();let Lr=0;const ue={motion:.55,reactivity:1,depth:1,interact:1,fractalFold:-1,detail:.6,zoom:1,pan:{x:0,y:0},flyThrough:!1,flySpeed:1,evt:[{x:0,y:0,at:-1e9,kind:0},{x:0,y:0,at:-1e9,kind:0}]};function Ym(i){const e=i.trim();let t=e.match(/spotify:(playlist|album|track|artist|show|episode):([A-Za-z0-9]+)/);return t?{type:t[1],id:t[2]}:(t=e.match(/open\.spotify\.com\/(playlist|album|track|artist|show|episode)\/([A-Za-z0-9]+)/),t?{type:t[1],id:t[2]}:(t=e.match(/embed\/(playlist|album|track|artist|show|episode)\/([A-Za-z0-9]+)/),t?{type:t[1],id:t[2]}:null))}function Sl(i){const e=Ym(i);return e?`https://open.spotify.com/embed/${e.type}/${e.id}?utm_source=generator&theme=0`:null}let Li=localStorage.getItem("mv.spotify.embed")||"https://open.spotify.com/embed/playlist/37i9dQZF1DX0XUsuxWHRQd?utm_source=generator";function yl(){return hn[Lr]}function $m(){const i=yl().engine;return i==="fractal"?Ys:i==="geometry"?$s:i==="warp"?Ks:i==="cyber"?Zs:qs}function Ui(i){i<0&&(i=hn.length-1),i>=hn.length&&(i=0),Lr=i;const e=hn[i],t=document.getElementById("sel-mode"),n=document.getElementById("hud-sel-mode");if(t&&(t.value=String(i)),n&&(n.value=String(i)),qs.classList.toggle("inactive",e.engine!=="fluid"),Ys.classList.toggle("inactive",e.engine!=="fractal"),$s.classList.toggle("inactive",e.engine!=="geometry"),Ks.classList.toggle("inactive",e.engine!=="warp"),Zs.classList.toggle("inactive",e.engine!=="cyber"),e.engine==="fluid"){if(pt.resize(),e.physics){const s=e.physics;pt.config.DENSITY_DISSIPATION=s.diss,pt.config.CURL=s.vort,pt.config.VISCOSITY=s.visc,pt.config.SPLAT_RADIUS=s.radius}pt.clear()}e.engine==="fractal"&&bn.resize(),e.engine==="geometry"&&(Ar.resize(),Ar.setMode(e)),e.engine==="warp"&&js.resize(),e.engine==="cyber"&&Js.resize(),localStorage.setItem("mv.mode",e.id);const r=document.getElementById("flash");r.querySelector(".fname").textContent=e.name,r.querySelector(".fgroup").textContent=e.group,r.classList.add("show"),setTimeout(()=>r.classList.remove("show"),1600)}function Is(i){Ui(Lr+i)}function El(){let i;do i=Math.floor(Math.random()*hn.length);while(i===Lr);Ui(i)}const Te={x:.5,y:.5,sy:.5,vx:0,vy:0,down:!1,active:!1,moving:!1,repel:!1,pointers:[]};let xs=0,Ms=0,Go=!1,vr=0;function Qs(i,e){const t=$m(),n=t.clientWidth||innerWidth,r=t.clientHeight||innerHeight,s=i/n,o=1-e/r;Go||(xs=s,Ms=o,Go=!0),Te.vx=s-xs,Te.vy=o-Ms,xs=s,Ms=o,Te.x=s,Te.y=o,Te.sy=e/r,Te.active=!0,(Math.abs(Te.vx)>8e-4||Math.abs(Te.vy)>8e-4)&&(vr=6),Te.down&&(ue.pan.x-=Te.vx*(n/r)/Math.max(.01,ue.zoom),ue.pan.y-=Te.vy/Math.max(.01,ue.zoom))}function Km(){if(vr>0?(vr--,Te.moving=!0):(Te.moving=!1,Te.vx*=.85,Te.vy*=.85),Te.pointers.length)for(const i of Te.pointers)vr>0?i.moving=!0:(i.moving=!1,i.vx*=.85,i.vy*=.85)}window.addEventListener("mousemove",i=>{Qs(i.clientX,i.clientY),Te.pointers=[{...Te}]});window.addEventListener("mousedown",i=>{i.target.closest?.("#panel")||i.target.closest?.("#top-hud")||(Te.down=!0,Te.repel=i.shiftKey||i.button===2,Te.pointers=[{...Te}])});window.addEventListener("mouseup",()=>{Te.down=!1,Te.pointers=[]});window.addEventListener("touchstart",i=>{if(i.target.closest?.("#panel")||i.target.closest?.("#top-hud"))return;const e=i.touches[0];if(!e)return;Te.down=!0,Te.repel=i.touches.length>1;const t=e.clientX/innerWidth,n=1-e.clientY/innerHeight;Te.x=t,Te.y=n,Te.sy=e.clientY/innerHeight,Te.active=!0,Te.pointers=[{...Te}],Qs(e.clientX,e.clientY)},{passive:!0});window.addEventListener("touchmove",i=>{const e=i.touches[0];e&&Qs(e.clientX,e.clientY)},{passive:!0});window.addEventListener("touchend",()=>{Te.down=!1,Te.pointers=[]},{passive:!0});window.addEventListener("wheel",i=>{if(i.target.closest?.("#panel")||i.target.closest?.("#top-hud"))return;i.preventDefault();const e=i.deltaY<0?1.12:.89;ue.zoom=Math.max(.1,Math.min(50,ue.zoom*e));const t=document.getElementById("s-zoom"),n=document.getElementById("v-zoom");t&&n&&(t.value=String(Math.round(Math.log10(ue.zoom)*100)),n.textContent=ue.zoom.toFixed(2)+"×")},{passive:!1});let Ns=0,bl=1;window.addEventListener("touchstart",i=>{i.target.closest?.("#panel")||i.target.closest?.("#top-hud")||i.touches.length===2&&(Ns=Math.hypot(i.touches[0].clientX-i.touches[1].clientX,i.touches[0].clientY-i.touches[1].clientY),bl=ue.zoom)},{passive:!0});window.addEventListener("touchmove",i=>{if(!(i.target.closest?.("#panel")||i.target.closest?.("#top-hud"))&&i.touches.length===2&&Ns>0){const t=Math.hypot(i.touches[0].clientX-i.touches[1].clientX,i.touches[0].clientY-i.touches[1].clientY)/Ns;ue.zoom=Math.max(.1,Math.min(50,bl*t));const n=document.getElementById("s-zoom"),r=document.getElementById("v-zoom");n&&r&&(n.value=String(Math.round(Math.log10(ue.zoom)*100)),r.textContent=ue.zoom.toFixed(2)+"×")}},{passive:!0});function Zm(i){const e=Sl(i)||Li;e!==i?Li=e:i.startsWith("http")&&(Li=i),localStorage.setItem("mv.spotify.embed",Li);const t=document.getElementById("sp-embed"),n=document.getElementById("sp-embed-wrap");t&&(t.src=Li,n&&(n.style.display="block"));const r=document.getElementById("sp-url");r&&(r.value=i)}function qe(i,e=!1){const t=document.getElementById("toast");t.textContent=i,t.className=e?"show err":"show",setTimeout(()=>t.className="",e?5e3:2800),console.log("[MusicViz]",i)}function Tl(){document.fullscreenElement?document.exitFullscreen().catch(()=>{}):document.documentElement.requestFullscreen().catch(()=>qe("Fullscreen request denied",!0))}Vm(qm,hn,{onMode:i=>{i===1||i===-1?Is(i):Ui(i)},onRandom:El,onFullscreen:Tl,onDemo:async()=>{Ye.unlock();let i=null;try{i=Ye.useDemo(0)}catch(r){console.warn("demo useDemo throw",r)}let e=!1;if(i){const r=()=>{e=!0,Ye.setSynthetic(!0),qe("Demo stream blocked — fallback to WebAudio rave.",!0)};i.addEventListener("error",r,{once:!0}),setTimeout(()=>{i.removeEventListener("error",r),!e&&i&&i.paused&&qe("Demo needs tap to play")},1300)}qe("Demo Rave 140 BPM • High dynamic range active");const t=hn.findIndex(r=>r.id==="hyperspace-warp");t>=0&&Ui(t),It.set("vapor");const n=document.getElementById("sel-pal");n&&(n.value="vapor")},onDemoNext:()=>{try{Ye.nextDemo(),qe("Next Demo Rave track loaded")}catch{qe("Next demo failed",!0)}},onDemoStop:()=>{try{Ye.disconnect?.()}catch{}Ye.setSynthetic(!0),qe("Demo stopped — pick System/Mic/File/Spotify")},onYouTube:async i=>{if(i.match(/\.(mp3|ogg|wav|m4a)(\?|$)/i)){try{Ye.unlock(),Ye.useMediaElement(i,"url: "+i,{loop:!0}),qe("Streaming Audio URL")}catch{qe("URL play failed",!0)}return}Ye.unlock(),await Ye.useYouTube(i)?qe("YouTube audio stream loaded"):qe("YouTube: paste direct MP3 URL or use Demo/System",!0)},onSpotify:i=>{if(!Sl(i)){qe("Invalid Spotify link (playlist/album/track)",!0);return}Zm(i),qe('Spotify loaded — hit "Listen to this player" then Share tab audio'),document.getElementById("sp-embed-wrap")?.scrollIntoView({behavior:"smooth",block:"nearest"})},onSpotifyCapture:async()=>{if(Ye.unlock(),Ye.hasLiveCapture?.()){qe("Using existing capture — hit play in Spotify player");return}await Ye.useSystemAudio?.("Spotify player",!0)?qe("Listening to Spotify player — hit play above"):qe('Confirm THIS tab + tick "Share tab audio"',!0)},onSystem:async()=>{Ye.unlock(),await Ye.useSystemAudio(null,!0)?qe("System audio linked"):qe("System capture cancelled",!0)},onMic:async()=>{Ye.unlock(),await Ye.useMicrophone()?qe("Microphone linked"):qe("Mic access denied",!0)},onFile:i=>{Ye.unlock(),Ye.useFile(i),qe("Playing local file: "+i.name)}});["s-gain","s-motion","s-react","s-interact","s-diss","s-vort","s-detail","s-zoom","s-morph","s-morph-rate","s-fly"].forEach(i=>{const e=document.getElementById(i);if(!e)return;const t={"s-gain":"v-gain","s-motion":"v-motion","s-react":"v-react","s-interact":"v-interact","s-diss":"v-diss","s-vort":"v-vort","s-detail":"v-detail","s-zoom":"v-zoom","s-morph":"v-morph","s-morph-rate":"v-morph-rate","s-fly":"v-fly"};e.addEventListener("input",()=>{const n=parseFloat(e.value),r=document.getElementById(t[i]);i==="s-gain"&&(Ye.config.gain=n,r&&(r.textContent=n.toFixed(1))),i==="s-motion"&&(ue.motion=n,r&&(r.textContent=n.toFixed(2)+"×")),i==="s-react"&&(ue.reactivity=n,Ye.config.sensitivity=1.5*n,r&&(r.textContent=n.toFixed(1))),i==="s-interact"&&(ue.interact=n/100,r&&(r.textContent=Math.round(n)+"%")),i==="s-diss"&&(pt.config.DENSITY_DISSIPATION=n,r&&(r.textContent=n.toFixed(3))),i==="s-vort"&&(pt.config.CURL=n,r&&(r.textContent=String(Math.round(n)))),i==="s-detail"&&(ue.detail=n/100,r&&(r.textContent=Math.round(n)+"%")),i==="s-zoom"&&(ue.zoom=Math.pow(10,n/100),r&&(r.textContent=(ue.zoom<1e3?ue.zoom.toFixed(ue.zoom<10?2:0):ue.zoom.toExponential(1))+"×")),i==="s-morph"&&(bn.setMorph(n/100),r&&(r.textContent=Math.round(n)+"%")),i==="s-morph-rate"&&(bn.setMorphRate(n/100*2),r&&(r.textContent=Math.round(n)+"%")),i==="s-fly"&&(ue.flySpeed=n,bn.setFlyThrough(ue.flyThrough,n),r&&(r.textContent=n.toFixed(1)+"×"))})});document.getElementById("sw-fly")?.addEventListener("click",i=>{const e=i.currentTarget,t=!e.classList.contains("on");e.classList.toggle("on",t),ue.flyThrough=t;const n=document.getElementById("s-fly"),r=n?parseFloat(n.value):1;ue.flySpeed=r,bn.setFlyThrough(t,r),qe(t?"Fly-Through Mode ON — automatic flight drift active":"Fly-Through Mode OFF")});document.getElementById("sel-pal")?.addEventListener("change",i=>{const e=i.target.value;It.set(e),localStorage.setItem("mv.palette",e),qe("Palette: "+e)});document.getElementById("b-reset-view")?.addEventListener("click",()=>{ue.pan.x=0,ue.pan.y=0,ue.zoom=1;const i=document.getElementById("s-zoom");i&&(i.value="0",i.dispatchEvent(new Event("input"))),qe("Camera view reset")});window.addEventListener("keydown",i=>{if(!(i.target instanceof HTMLInputElement||i.target instanceof HTMLSelectElement)){if(i.key==="f"||i.key==="F")Tl();else if(i.key==="h"||i.key==="H")document.getElementById("panel")?.classList.toggle("collapsed");else if(i.key==="[")Is(-1);else if(i.key==="]")Is(1);else if(i.key==="r"||i.key==="R")El();else if(i.key==="p"||i.key==="P"){const e=document.getElementById("sel-pal");if(e){const t=(e.selectedIndex+1)%e.options.length;e.selectedIndex=t,e.dispatchEvent(new Event("change"))}}}});let wr=!1,ea=!1,ta=!1,na=!1,ia=!1;try{wr=pt.init()}catch(i){console.error("fluid init fail",i)}try{ea=bn.init()}catch(i){console.error("fractal init fail",i)}try{ta=Ar.init()}catch(i){console.error("geo init fail",i)}try{na=js.init()}catch(i){console.error("warp init fail",i)}try{ia=Js.init()}catch(i){console.error("cyber init fail",i)}!wr&&!ea&&!ta&&!na&&!ia&&qe("WebGL2 unavailable — please check WebGL support",!0);const jm=localStorage.getItem("mv.mode");let Fs=hn.findIndex(i=>i.id===jm);Fs<0&&(Fs=0);Ui(Fs);const Ss=localStorage.getItem("mv.palette");if(Ss){It.set(Ss);const i=document.getElementById("sel-pal");i&&(i.value=Ss)}Ye.setSynthetic(!0);Ye.onStatus((i,e)=>{const t=document.querySelector("#s-status .dot"),n=document.getElementById("s-text"),r=document.getElementById("hud-track-name");!t||!n||(i==="connected"||i==="audible"?(t.className="dot live",n.textContent="Listening to "+e,r&&(r.textContent=e),Ye.setSynthetic(!1)):i==="silent"?(t.className="dot warn",n.textContent="Connected but silent — "+e):i==="ended"?(t.className="dot",n.textContent="Capture stopped",Ye.setSynthetic(!0)):i==="error"&&(t.className="dot err",n.textContent=e,qe(e,!0)))});const mi=()=>{Ye.unlock(),window.removeEventListener("touchend",mi),window.removeEventListener("mousedown",mi),window.removeEventListener("keydown",mi)};window.addEventListener("touchend",mi,{passive:!0});window.addEventListener("mousedown",mi);window.addEventListener("keydown",mi);const Jm=document.createElement("canvas"),Al=new ks({canvas:Jm,antialias:!0,alpha:!1});Al.setPixelRatio(Math.min(devicePixelRatio,2));const wl=new vl;wl.background=new We(0);const Rl=new Ut(60,innerWidth/innerHeight,.1,100);Rl.position.z=2;const kn=new Wm(Al,wl,Rl);kn.available().then(i=>{const e=document.getElementById("b-vr");!i||!e||(e.hidden=!1,e.addEventListener("click",async()=>{if(kn.isActive())kn.stop();else try{await kn.start(t=>{e.textContent=t?"Exit VR":"Enter VR 6DOF"}),qe("6DOF: thumbstick fly · grip drag · pinch")}catch(t){qe("VR failed: "+t.message,!0)}}))});let Ho=performance.now(),Wt=0;const St={t:0,dt:0,m:null,k:1,depth:1,interact:1,zoom:1,pan:{x:0,y:0},flyThrough:!1,flySpeed:1,detail:.6,layerOn:{sub:!0,mid:!0,high:!0,air:!0},pointer:Te,band:i=>St.m.band[i],n:i=>St.m.band[i].norm,e:i=>St.m.band[i].env};function Cl(i,e){const t=Math.min((i-Ho)/1e3,.033)*ue.motion;Ho=i,Wt+=t*1e3;const n=Ye.update(i);It.updateMusic(n),Km(),St.t=Wt,St.dt=t,St.m=n,St.k=ue.reactivity,St.depth=ue.depth,St.interact=ue.interact,St.zoom=ue.zoom,St.pan=ue.pan,St.flyThrough=ue.flyThrough,St.flySpeed=ue.flySpeed,St.detail=ue.detail;const r=yl();try{if(r.engine==="fluid"&&wr){pt.beginFrame();const o=n.band.bass.norm,a=n.band.mid.norm;if(r.id==="spectrum-fountain"){const u=n.bandsNorm.length/24;for(let h=0;h<12;h++){const p=n.bandsNorm[Math.floor(h*u)];p<.12||pt.splat((h+.5)/24,.03,(Math.random()-.5)*3,p*78*ue.reactivity,It.hdr(h/24*.8,3.2),.6+p)}}else{const c=Wt*9e-4*(.5+a*1.6);for(let u=0;u<3;u++){const h=c+Math.PI*2*(u/3),p=(.26+o*.12)*Math.min(2,ue.zoom);pt.splat(.5+Math.cos(h)*p,.5+Math.sin(h)*p,-Math.sin(h)*8*ue.reactivity,Math.cos(h)*8*ue.reactivity,It.hdr(.33+u/3*.1,3),.8)}}if(Te.active&&ue.interact>0)for(const c of Te.pointers.length?Te.pointers:[Te])c.active&&pt.splat(c.x,c.y,c.vx*5*ue.interact,c.vy*5*ue.interact,It.hdr(0,1),1);const l=pt.applyAudioParams(n,ue.reactivity);pt.solve(t,l.vort,l.diss,ue.fractalFold>=0?ue.fractalFold:r.fractal||0,Wt)}else if(r.engine==="fractal"&&ea){const o=Wt*(r.timeScale??1);bn.juliaSeed(Wt*1e-4,n,Wt),bn.render(r,n,Te,{time:o,stamp:Wt,interact:ue.interact,detail:ue.detail,zoom:ue.zoom,pan:ue.pan,hover:1,bg:1,bgAmt:1,wall:i,key:!1,role:1,events:ue.evt.map(a=>({x:a.x,y:a.y,kind:a.kind,age:(i-a.at)/1e3}))})}else r.engine==="geometry"&&ta?(Ar.frame(Wt,n,St),(r.id.startsWith("hybrid")||r.id==="bloom-grid")&&n.beat&&wr&&pt.splat(.5,.5,(Math.random()-.5)*10,(Math.random()-.5)*10,It.hdr(Math.random(),3.2))):r.engine==="warp"&&na?js.render(Wt,n,Te,{zoom:ue.zoom,pan:ue.pan,fly:ue.flyThrough,flySpeed:ue.flySpeed,detail:ue.detail,motion:ue.motion}):r.engine==="cyber"&&ia&&Js.render(Wt,n,Te,{zoom:ue.zoom,pan:ue.pan,fly:ue.flyThrough,flySpeed:ue.flySpeed,detail:ue.detail,motion:ue.motion})}catch(o){console.error("frame error",o)}document.querySelectorAll("#meters i").forEach(o=>{const a=o.dataset.band,l=n.band[a];o.style.height=Math.min(100,(l?l.env:0)*100)+"%"});const s=document.getElementById("bpm");s&&n.bpm&&(s.textContent=`Tempo ${n.bpm} BPM${n.synthetic&&!n.live?" (synth)":""} · centroid ${Math.round(n.centroid*100)}%`),e&&kn.handleInput(e),kn.raf(Cl)}kn.raf(Cl);window.FluidSimInstance=pt;window.audio=Ye;window.palette=It;console.log("[MusicViz] Next-Gen platform booted — modes count:",hn.length);
//# sourceMappingURL=index-CTwgOfKO.js.map
