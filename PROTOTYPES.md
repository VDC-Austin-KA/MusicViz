# MusicViz — Prototype Shader & Script Snippets

> Key visualization modes: Fluid, Dynamic Fractals, Minimalist Geometry, Hybrid. Full sources in `js/fluid.js`, `js/fractal.js`, `js/geometry.js`, `js/xr-next.js`.

## 1. Multi-Band Audio Analyzer → Shader Uniforms (`js/audio.js`)

```ts
// 7 perceptual bands: subBass 20-60, bass 60-160, lowMid 160-400, mid 400-1200, highMid 1200-3200, presence 3200-7000, air 7000-16000
// 64 log-spaced bins 25→17000Hz, chroma[12] fifths order, flux/centroid/spread, beat via 60-frame mean+stdDev
getUniforms() => ({ bass, mid, treble, lowMid, highMid, presence, subBass, energy, beat, beatPulse, centroid, flux })

// Demo zero-friction: CORS rave tracks wired via createMediaElementSource with crossOrigin='anonymous'
const DEMO_TRACKS = [
  { id:'rave-140', title:'Rave Energy 140 BPM', url:'https://cdn.pixabay.com/download/audio/2021/08/09/audio_0625c1539c.mp3?filename=energy-115010.mp3', bpm:140 },
  { id:'rave-128', title:'Neon Pulse 128 BPM', bpm:128, ... },
  { id:'rave-150', title:'Hyper Drive 150 BPM', bpm:150, ... }
];
useDemo(0) -> AudioElement -> gainTrim -> analyser ->metrics (no picker)
useYouTube(url) -> /api/youtube?id= → audioUrl || hint tab capture
```

## 2. Fluid — Audio-Coupled + Multi-Touch (`js/fluid.js`)

```glsl
// display fold (self-similar detail) + peak-preserving Reinhard
vec2 fold(vec2 p,float amt,float t){ for(int i=0;i<4;i++){ p=abs(p)-0.42*amt; float a=t*0.05+float(i)*0.7; p=mat2(cos(a),-sin(a),sin(a),cos(a))*p; p*=1.0+0.26*amt; } return p; }
vec3 c=texture(uTexture, fract(fold((vUv-0.5)*vec2(uAspect,1.0), uFractal, uTime)/vec2(uAspect,1.0)+0.5)).rgb * uExposure;
float peak=max(c.r,max(c.g,c.b)); vec3 mapped=c/(1.0+peak); mapped=pow(mapped, vec3(1.0/2.2));
```
```js
// audio forces: treble→vorticity, mid→dissipation, bass→radius, budget 26
applyAudioParams(m,k) => ({ vort: CURL + presence.env*AUDIO_CURL_GAIN*k, diss: max(0.88, DENSITY_DISSIPATION - mid.env*AUDIO_DISS_GAIN*k) })
pointer(c){ for(const pt of c.pointer.pointers||[c.pointer]){ const s=c.interact*(1+presence.env*0.6+bass.env*0.4); if(pt.moving) F.splat(pt.x,pt.y, pt.vx*5*s,pt.vy*5*s, col(...)); if(pt.down) for(...) F.splat(pt.x+cos(a)*0.04, pt.y+sin(a)*0.04, cos(a)*push, sin(a)*push, ...) } }
```

## 3. Fractal — Real-time Morph + Fly-Through (`js/fractal.js`)

```glsl
// COMMON uniforms: uBand[7] (slow ~8s), uFlux[7] (mid ~0.3s), uOnset[7] (transient), uSeed (Julia), uZoom/uPan, uDetail
// swell/thrust/twist/count/edge/rim/grain roles map bands to structure, not tint
vec3 scene(vec2 uv){
  vec2 k = uSeed + (uMouse-0.5)*0.007*uInteract; // subtle steer
  k += vec2(cos(uTime*0.006), sin(uTime*0.006)) * uFlux[1]*0.08; // audio morph
  vec2 z = uv*1.9; float trap=1e9, n=0.0; float maxIt=60.0+uDetail*110.0;
  for(...){ z=cmul(z,z)+k; if(dot(z,z)>64.0) break; n+=1.0; }
  return escapeShade(n,maxIt,z,trap, uTime*0.006, 0.45, 0.6+uBand[5]*2.4) * (0.55+uEnergy*0.9);
}
```
```js
// CPU braked walk: slows 1000× at connectivity boundary via bisection, morph modulates rad/drift
let morph=0, morphRate=0, flyThrough=false, flyOffset={x:0,y:0};
juliaSeed(t,m){ morph=0.5+0.5*sin(t*0.0003*morphRate+centroid*6.28); flyOffset.x+=cos(flyPhase)*0.0008*(0.5+slowBand[2]); /* ... */ rad=0.70+slowBand[1]*0.16+slowBand[0]*0.07+morph*0.15; seed.x=cos(ang)*rad; }
setMorph(v), setMorphRate(v), setFlyThrough(on,speed), getFlyOffset()
```

## 4. Geometry — Boller Flower + Teoxoy Rings + Hybrid (`js/geometry.js`)

```js
// FLOWER: mid→petals, lowMid→twist, bass→radius, highMid→edge, air→sparkle
draw(g,W,H,t,m,S,env){
  const cx=W/2, cy=H/2, base=Math.min(W,H)*0.18*env.depth;
  const petals=5+Math.floor(m.band.mid.env*6)*2, twist=m.band.lowMid.env*1.8 + t*0.00035, thrust=m.band.bass.env;
  for(let p=0;p<petals;p++){ const a0=TAU*p/petals+twist, r=base*(0.72+thrust*0.55)*(1+m.beatPulse*0.18);
    g.beginPath(); g.moveTo(cx,cy); g.quadraticCurveTo(..., xTip,yTip); g.fillStyle=col(p/petals*0.78+P.flow(...), 0.18+edge*0.45); g.fill(); g.stroke(); }
}
// ORBIT RINGS: minimal high-impact (Teoxoy)
for(let i=0;i<count;i++){ const r=maxR*(0.18+i/count*0.72+bandsNorm[...]*0.12*k); g.beginPath(); g.arc(cx,cy,r,...); g.strokeStyle=col(...); g.lineWidth=1.5+highMid.env*4.5; g.stroke(); }
// HYBRID: geometry → fluid dye
if(FluidEngine.isReady()) for(const b of top6Bins) if(Math.random()<0.55) FluidEngine.splat(x,y, rand*f, rand*f, hdr(hue,3.2));
```

## 5. WebXR 6DOF (`js/xr-next.js`)

```js
// WorldOffset flight: thumbstick XY → XZ, grip drag → XYZ, panel/world meshes translated by worldOffset
const R=3.2, YAW=160°, PITCH=96°; const worldOffset={x:0,y:0,z:0};
hitScreen(o,d){ // sphere intersection with worldOffset centre
  const px=o[0]-sx, py=o[1]-eyeY-sy, pz=o[2]-sz; const b=2*(px*d[0]+...), c=px*px+...-R*R; disc=b*b-4*c;
}
handleInput(frame){
  for(src of inputSources){ pose=frame.getPose(targetRaySpace, refSpace); o=..., d=-m[8..10];
    if(gamepad.axes) worldOffset.x-=ax*speed, worldOffset.z-=ay*speed; // fly
    if(grip && buttons[1].pressed) worldOffset += gripDelta*0.9; // drag
    if(hand){ pinch=dist(thumbTip,indexTip)<0.022; if(pinch) onPinch(u,v); }
    screen=hitScreen(o,d); if(screen){ pointerMove(screen.u*W, screen.v*H); spatialSplat(screen.hx,... , d*6); }
  }
}
frame(xrFrame){ viewerPose → layer.framebuffer → drawView(viewProj) with worldOffset translation; upload geometry/fluid/fractal canvas as screenTex; draw panelMesh + rays; }
raf(cb){ session ? session.requestAnimationFrame(wrap(cb)) : window.requestAnimationFrame(wrap(cb)); }
```

## 6. Fluid Layers Example (Sonia Boller flower → Fluid coupling)

```js
// FluidLayers.chromaPetals: 12 petals one per pitch class, two per frame, hue = i/12
// Hybrid mandala uses same petals but also splats fluid on beat
chromaPetals(c,o){ for(k=0;k<2;k++){ i=(idx+k)%12; if(ch[i]<0.25) continue; a=TAU*i/12-Math.PI/2+t*0.00005; r=0.38+v*0.06; F.splat(0.5+cos(a)*r, 0.5+sin(a)*r, -cos(a)*f,-sin(a)*f, hdr(i/12,4+v*2),0.5); } }
```

## How to Run Prototypes
- `npm start` → `http://127.0.0.1:8080` → **Demo Rave** (no login) → try `Bloom Flower` / `Orbit Rings` / `Hybrid Mandala` / `Julia Bloom` (morph+fly toggles)
- `F` fullscreen, `1-4` layers, `H` hide, `R` random, drag/two-finger sculpt fluid, thumbstick+ grip in VR
- `/api/demo` lists CORS tracks, `/soloist/status` shows daemon
```

