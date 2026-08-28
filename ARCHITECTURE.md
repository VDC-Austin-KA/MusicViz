# MusicViz — Next-Gen Architecture

> Ground-up immersive, music-reactive web platform. `MusicFluid` used strictly as architectural reference. Goal: vastly superior modern visual platform with new rendering modes, interactive mechanics, and WebXR.

**Inspirations:** Sonia Boller Audible Visuals (frequency-specific reactivity + flower GUI feel), Teoxoy Audio Visualizer (clean striking geometry), Matt DesLauriers Codevember #21 (high-impact minimalism + fluid motion).

---

## 1. Tech Stack (2026 Modern)

| Layer | Choice | Rationale |
|---|---|---|
| **Runtime** | `TypeScript` (vanilla JS compat) via ES modules + `Vite` optional | Type safe audio metrics contract, HMR for shader iteration. Current code is vanilla IIFE; new modules use `importmaps` for zero-build fallback |
| **Render** | `Three.js r162` (`three/webgpu` TSL) + raw `WebGL2` (`#version 300 es`) | Three for geometry/hybrid/WebXR scene graph; raw WebGL2 for fluid & fractal full-screen passes where graph overhead hurts. WebGPU for fluid compute (2-4× vs frag advection) with graceful fallback to `EXT_color_buffer_float` |
| **Shaders** | `GLSL 300 es` → `WGSL` via `TSL` | Share fluid/fractal logic. Fluid Navier-Stokes stays ping-pong `RGBA16F`; fractal uses `out vec4 fragColor` + SDF raymarch |
| **Audio** | `Web Audio API` + `AudioWorklet` | `AnalyserNode fftSize=4096, smoothingTimeConstant=smoothing, minDecibels=-95, maxDecibels=-10` (proven). Worklet for BPM/chroma to avoid main thread jank. 7 perceptual bands + 64 log-spaced bins + chroma + flux/centroid/spread |
| **State/UI** | `Tweakpane 4` for dev + custom minimalist drawer for prod (inspired by Boller flower: one knob, inertia) | Replaces 500-line static panel while keeping single-file deploy. `zustand` signals for `mode/speed/palette` |
| **XR** | `WebXR Device API` via `THREE.WebXRManager` | True 6DOF fly-through fractals, spatial controller fluid injection, hand-tracking pinch. `local-floor` + `hand-tracking` |
| **Audio Sources** | `getDisplayMedia` (System/Tab), `getUserMedia` (Mic), `HTMLAudioElement` (File + Default Rave), `Spotify Web Playback SDK` (PKCE token swap on server), `YouTube proxy` (server resolves `youtube.com/watch?v=` → CORS `opus` stream) | Default rave `demo-rave-140bpm.mp3` (CORS) pre-elected so cold-start is zero friction. DRM wall on `open.spotify.com` iframe is respected: capture via tab capture (`preferCurrentTab`) not `createMediaElementSource` on cross-origin frame |
| **Deploy** | `Node 18+`, `ws` for `/soloist/ws` proxy, `Railway` + `R2` for audio CDN | Reuse `server.js` static + `SOLOIST_API_KEY` daemon spawn. `soloist --ws 127.0.0.1:9090 --data-dir /tmp/soloist-data` proxied as `wss://host/soloist/ws` |

**Preserved from MusicFluid:** `rangeNorm()` floor/ceil adaptive normalizer with `MIN_SPAN=0.06` guard (prevents dead steady band), `BAND_DEFS` 7 roles (`swell/thrust/twist/count/edge/rim/grain`), `SPLAT_BUDGET=26`, peak-preserving Reinhard `c/(1+peak)` + `deepen()`, `dpr` cap 1.5 mobile, `vt` motion-scaled clock vs `wall` wall-clock split.

---

## 2. System Diagram

```
[Audio Sources] ──> MediaStream / MediaElement -> GainTrim -> AnalyserNode
    │ System/Tab Mic/File/DefaultRave/Spotify/YouTube
    │                                    │
    │                          AudioEngine.update(now)
    │                          64 bins (log 25→17000Hz) + 7 bands + chroma + beat
    │                                    │
    ▼                                    ▼
Palette (LUT texture) <─── metrics ───> ModeRegistry (47 → 60+ modes)
    │                                    ├─ FluidEngine (FBO/WebGPU) ─┐
    │                                    ├─ FractalEngine (GLSL SDF)  │
    │                                    ├─ GeometryEngine (Three)   ─┼─> Canvas ─> XR Present ─> HMD
    │                                    └─ HybridEngine              ┘              │
    │                                                                              Pointer/XR Controller ─> evtA/B + 3D splat
    └─ Tweakpane Drawer --------------------------------------------------------------> synth/autoLevel/meters
```

**Contract `ctx` (mutated per frame, no GC):**
```ts
ctx = { t:vt, dt, m:metrics, k:reactivity, depth:layerDepth, interact, layerOn, pointer, band(key), n(key), e(key) }
```

---

## 3. Module Breakdown

### core/audio — `js/audio.js` (evolved)
- 7 `BAND_DEFS` (subBass 20-60, bass 60-160, lowMid 160-400, mid 400-1200, highMid 1200-3200, presence 3200-7000, air 7000-16000)
- 64 `bandEdges` log-spaced, per-bin `binRange` floor/ceil + `rangeNorm`, per-band `env` attack `0.55` release `0.08`, `onset` rise>0.05
- `flux` (broadband), `centroid/spread`, `chroma[12]` + `chromaPeak`, `beat` via `mean + sensitivity*stdDev` over 60-frame history, `bpm` median 16 beats
- `autoLevel` target RMS `0.34`, backs off at `saturation>0.25`, `GATE=0.02`
- **New:** `useDemo()` (preloaded `demo-rave-140bpm.mp3` + `crossOrigin anonymous`), `useYouTube(url)` (server fetch → audio element), `useSpotifyElement()` (tab capture friendly), `setSynthetic(true)` fallback
- Metrics: `level, energy, beat, beatPulse, live, synthetic, saturation, autoGain`

### render/fluid — `js/fluid.js`
- `baseVertexShader` full-triangle, `splat/advection/divergence/curl/vorticity/pressure/gradSub/display` (display carries `uFractal` fold)
- `SIM_RESOLUTION 256`, `DYE_RESOLUTION 1024`, `half-float LINEAR` (core WebGL2, no `OES_texture_float_linear` on iOS)
- `FluidLayers` registry: `swell/orbiters/filaments/sparkle/spectrumRing/chromaPetals/attractor + pointer`
- **Upgrades:** audio-coupled `vort = CURL + presence.env*25*k`, `diss = max(0.90, DENSITY_DISSIPATION - mid.env*0.03*k)`, `fold` fractal param, `multi-touch` (2 fingers = repel), `viscosity` via pressure clear

### render/fractal — `js/fractal.js`
- `COMMON` preamble: `uRes/uTime/uMouse/uEvtA/B/uHover/uWall/uRole/uBg/uBand[7]/uFlux[7]/uOnset[7]/uEnergy/uDetail/uZoom/uPan/uSeed/uPal`
- `SCENES` lazy-compiled per id (`vec3 scene(vec2 uv)`). Shared `pal()`, `kale()`, `fbm()`, `speck()`, `freqKey()`, `evtWarp()` (20 click effects), `hoverWarp()` (7), `background()` (8)
- **Upgrades:** `juliaSeed()` CPU-integrated walk with brake at connectivity (`exp((r-0.85)*40)`), `countB()/twist()/swell()` roles, `detail` slider drives iteration budget, `zoom` log `pow(10, v/100)` to 1e6×, `lockOn` feature tracking by structure not pixel, fly-through `tMod = mod(uTime*0.022,15), zoom=pow(2,t)` for Mandelbrot valley dive

### render/geometry — `js/geometry.js` (New)
- **Flower** (Boller): `petals = 5+floor(countB()*5)*2`, `radius = 0.15+fi*0.125+flx(i)*0.055`, `orn = pow(0.5+0.5*cos(a*(3+fi*2)), 1.5+flx(i)*5)` — one `flowerComplexity` knob.
- **Orbit Rings** (Teoxoy): instanced `RingGeometry` count=`mid` band, scale=`flx(i)*1.5`, hue=`bandHue(i)`
- **Neon Tunnel / Hex Pulse / Kaleidoscope** — SDF + `kale()` with audio `countB()` petal variance
- Hybrids: fluid `splat` driven by geometry vertex positions (`Hybrid: Fluid Bloom` where geometry spawns fluid dye)

### xr — `js/xr.js` (Rebuilt)
- **Before:** single 2D canvas upload to `R=2.6m, YAW=150°, PITCH=84°` sphere-cap `SEG 48×28`, panel `640×320` `2D canvas` → texture. Valid for flat shader passes, no 6DOF.
- **Now:** `THREE.WebXRManager` + `XRSession` 6DOF rig. Fluid volume `Data3DTexture 64³` with WebGPU compute advection; fractal SDF raymarch cubes; controllers `targetRaySpace` → `hitPanel/hitScreen` → `pointerMove/press`; `hand-tracking` pinch; free-fly `thumbstick` + `grip` to inject fluid. `raf()` routes `session.requestAnimationFrame` when presenting.

### ui — `js/app.js` + `style.css`
- Slide-out panel `var(--panel-w) 330px`, `backdrop-filter blur(16px) saturate(140%)`, `dvh` + `safe-area-inset`. Mode `select` grouped, `H` hide, `F` fullscreen, `R` random, `1-4` layers, `←→` mode, `Space` play/pause soloist.
- **New:** `Demo` button (one-click rave + auto `Listen`), `YouTube` paste field, palette `album` sampling from `np-art` canvas histogram, meters 7 `i[data-band]` height=`env*100%`, `autoGain` `×` readout + clipping, performance auto-downgrade (`SIM_RESOLUTION 128` if fps<40 over 2500ms).

---

## 4. Prototype Shader Snippets

See `js/shaders/` (inline in `fluid.js`/`fractal.js`/`geometry.js`) — key excerpts in Section 3. Full 20-scene catalogue in `js/fractal.js:SCENES` + 7 fluid drives + 6 geometry.

---

## 5. Roadmap

**P0 Audit** (done): analyzed 47 modes, 7 bands, capture picker-once, `MAX_DECIBELS -10` saturation fix.

**P1 Audio Next** (this release): default rave auto-play, YouTube proxy helper, multi-band peak detection, `useDemo`/`useYouTube` added to `AudioEngine`.

**P2 Fluid Next**: audio-coupled physics (treble→vorticity, mid→dissipation), fractal fold exposure mix, 3 new automated drivers (Lissajous/ Chladni/ Perlin).

**P3 Fractal Next**: realtime Julia morph (`uSeed` + `juliaSeed` brake), continuous fly-through (Mandel valley + phoenix), pan anchored to cursor.

**P4 Geometry & Hybrid** (this release): `js/geometry.js` with Flower/Tunnel/Hex/Grid + Hybrid Fluid-Geometry.

**P5 XR Next** (this release): `js/xr-next.js` 6DOF rebuilt — `local-floor` + sphere-cap fallback, volumetric fluid, SDF fractal, hand tracking.

**P6 Polish**: Tweakpane polish, performance HUD, snapshot, responsive `coarse-pointer` (40×108 handle, 22px thumb).

---

## 6. Risks

- iOS `getDisplayMedia` no audio → Mic + Soloist split (README documents).
- DRM iframe cannot be captured → default hosted audio / server proxy, not frame scraping.
- `OES_texture_float_linear` missing on iOS → `LINEAR` half-float is core GL2.
- Soloist build expiry exit 10 → auto re-download via `scripts/ensure-soloist.js`.

---

## 7. File Map

```
index.html          markup (stages: fluid/fractal/viz2d/geometry)
style.css           design system
js/palette.js       LUT + album histogram
js/audio.js         capture + 64-band analysis + beat/BPM + synth
js/fluid.js         solver + layers + modes (Julia Bloom Flow++)
js/fractal.js       scene engine + 20 scenes + click/hover/backgrounds
js/geometry.js      NEW — Three/Canvas minimal geometry + hybrids
js/viz2d.js         canvas-2D (aurora/spectrogram/radial/chroma/bursts/ribbon)
js/xr.js            legacy 2D-in-VR
js/xr-next.js       NEW — true 6DOF spatial
js/spotify.js       Soloist WebSocket bridge
js/app.js           registry, loop (vt clock), wiring
server.js           static + soloist spawn + /soloist/ws proxy
```

*Generated for VDC-Austin-KA/MusicViz. See `/docs` for visuals.*
