# MusicViz — Development Roadmap

> Step-by-step from architectural reference (MusicFluid) to next-gen platform. See `ARCHITECTURE.md` for stack + diagram.

## Phase 0 — Audit (Done)
- [x] Audited 47 modes, 7-band adaptive normalizer, `EXT_color_buffer_float`, curved-screen XR, picker-once capture
- [x] Documented architecture + inspirations (Boller flower, Teoxoy geometry, DesLauriers minimalism)

## Phase 1 — Next-Gen Audio (Done)
- [x] `js/audio.js`: `DEMO_TRACKS` (3 CORS rave 128/140/150 BPM), `useDemo()/nextDemo()`, `useMediaElement(src)`, `useYouTube(url)` stub, `getUniforms()` (bass/mid/treble/presence/etc. for shader uniforms)
- [x] `index.html`: **Demo Rave** one-click no-login + Next + Stop, YouTube/audio URL field, hint note
- [x] `server.js`: `/api/demo` + `/api/youtube` (501 with fallback hint, pluggable yt-dlp)
- Peak detection via `band.hit/onset`, multi-band flux/centroid already spans bass→air; `getUniforms()` now drives WebGL uniforms per frame

## Phase 2 — Fluid Dynamics Enhanced (Done)
- [x] `js/fluid.js`: `AUDIO_CURL_GAIN/DISS_GAIN/RADIUS_GAIN`, `applyAudioParams(m,k)`, multi-touch `pointer.pointers[]` (each finger = splat, 2nd finger repel)
- [x] `FluidLayers.pointer` loops over pointers, audioBoost `1 + presence.env*0.6 + bass.env*0.4`
- [x] `js/app.js`: touchPrev Map, `syncMultiPointer()`, multi-finger fluid sculpt; expand `FLUID_KEEP` to 5 modes (was 1)
- Forces react per-band: `presence→vorticity`, `mid→dissipation`, `bass→radius`, `beat→central kick`

## Phase 3 — Fractals Expanded (Done)
- [x] `js/fractal.js`: `morph` + `morphRate` (LFO via centroid), `flyThrough` + `flyOffset` + `flySpeed` (camera drift audio-coupled), `setMorph/setMorphRate/setFlyThrough/getFlyOffset`
- [x] `juliaSeed()` braked walk now modulated by `morph*0.15` rad + `slowBand[4]*0.5` speed; `index.html`: morph slider, morph-rate, fly-through toggle + speed
- [x] Fly-through feeds `state.pan` via XR worldOffset or auto-drift; deep audio coupling via `slowBand`/`fluxBand`/`onsetBand` triple

## Phase 4 — Geometry & Hybrid New Modes (Done)
- [x] `js/geometry.js` NEW: `GeometryEngine` + `GeometryModes` 7 modes
  - `Bloom Flower` (Boller: petal count = mid, twist = lowMid, thrust = bass, edge = highMid, grain = air)
  - `Orbit Rings` (Teoxoy: clean instanced rings)
  - `Neon Tunnel`, `Hex Pulse` (DesLauriers minimal depth)
  - `Kaleidoscope`
  - `Bloom Grid (Hybrid)` + `Fractal Mandala (Hybrid)` — geometry seeds `FluidEngine.splat` (hybrid fluid-geometry)
- [x] `index.html`: `<canvas id="geometry-canvas">`, `style.css`: z-index; `js/app.js`: registry + canvas toggling + frame loop branch

## Phase 5 — WebXR Rebuilt 6DOF (Done)
- [x] `js/xr-next.js` NEW: 300-line rebuilt module, true 6DOF
  - WorldOffset flight (thumbstick XY + grip drag), sphere-cap `R=3.2m YAW 160° PITCH 96°`
  - Controller targetRay → screen/panel hits + spatial fluid splat at tip (`spatialSplat`)
  - Hand tracking pinch (thumb-index <2cm) + grip drag, `onPinch/onWorldMove` hooks
  - Fallback to legacy `xr.js` via `XR_ACTIVE = XRNext||XR`
  - `js/app.js`: `XR_ACTIVE` wrapper, worldOffset → fractal pan, VR button shows `Enter VR 6DOF`
- Legacy `js/xr.js` retained as fallback; `xr-next` adds fly-through fractals + controller fluid manipulation

## Phase 6 — UI/UX Modernized (Done)
- [x] Sleek control drawer (existing 16px blur/saturate 140% panel, dvh, safe-area), `geometry-canvas` stage switching seamless
- [x] Modular `ModeRegistry` 60+ modes (5 fluid ⊃ 20 fractals ⊃ 6 viz2D ⊃ 7 geometry/hybrid), grouped optgroups
- [x] Real-time GUI: viscosity/dissipation/curl + fractal detail/morph/fly speed + palette/chroma + layer depth/adaptive/attack/release + motion/react/smooth + pointer interact; per-engine dimming via `data-engine-only`
- [x] Demo hint after 2.2s if idle, toast for morph/fly changes, meters 7 bars + bpm/centroid

## Phase 7 — Polish & Ship
- [ ] `npm start` smoketest (`/api/demo` + `/health` + index embeds new files)
- [ ] Optional: `importmap` for Three.js when WebGPU fluid ships
- [ ] Deploy: `git push` to `VDC-Austin-KA/MusicViz`, Railway `SOLOIST_API_KEY` + optional `YT_API_KEY`
- [ ] Docs: `docs/ARCHITECTURE.md` + this roadmap + `PROTOTYPES.md` shader gallery

### Tech Notes Used
- `analyser.minDecibels=-95, maxDecibels=-10` headroom, `peak-preserving Reinhard c/(1+peak)`, `half-float LINEAR` core GL2, `vt` motion clock vs `wall`
- BPM median 16 beats, `flux/centroid/spread`, `chroma[12]` fifths order, 64 log bands `25→17000Hz`
- `SPLAT_BUDGET 26`, `SIM 256 / DYE 1024`, DPR cap 1.5 mobile, 2500ms perf watchdog

### Next After Ship (Future)
- WebGPU compute fluid (`three/webgpu` TSL) + 3D fluid volume `Data3DTexture 64³`
- SDF raymarch fractal cubes for true stereo depth (vs sphere-cap)
- Three.js `OrbitControls` geometry editor for user-built modes
- `yt-dlp` server resolver + Spotify Web Playback SDK PKCE token swap
