# MusicViz — Next-Gen Immersive Music Reactive Platform

> **Ground-up, highly immersive music-reactive web platform** built from `MusicFluid` as architectural reference, now vastly superior. Modern WebGL2/WebGPU shaders, multi-band rave-ready audio, true 6DOF WebXR, minimalist geometry + hybrid visuals, and zero-friction demo stream.

Inspirations: **Sonia Boller Audible Visuals** (frequency-specific reactivity + flower GUI feel) · **Teoxoy Audio Visualizer** (clean striking geometry) · **Matt DesLauriers Codevember #21** (high-impact minimalism + fluid motion).

**Live demo target:** Railway `wss://host/soloist/ws` + demo rave one-click (no login) · `npm start` at `http://127.0.0.1:8080`

---

## ⚡ Zero-Friction Instant Demo

The killer new path — **no Spotify, no picker**:

- Tap **▶ Demo Rave** (CORS `energy-115010.mp3` 140 BPM, pixabay) — analyser wired via `createMediaElementSource` with `crossOrigin anonymous`. Next/Stop cycles 3 rave tracks (128/140/150 BPM). Auto-selects `Bloom Grid` hybrid for instant wow.
- Or paste **YouTube / direct MP3 URL** (`https://youtube.com/watch?v=…` or `… .mp3`) — server resolves via `/api/youtube?id=` if `YT_API_KEY` set, else hints tab capture fallback.
- Beats display via synthetic fallback when silent (`Simulated beat when silent`).

This solves the cold-start problem: high-energy electronic/rave pre-loaded, `MASTER_GAIN` + adaptive range already tuned.

---

## 🎨 Next-Gen Highlights vs. MusicFluid Baseline

| Feature | Before (MusicFluid 47 modes) | After (MusicViz 60+ modes) |
|---|---|---|
| **Audio** | Loopback capture only (System/Mic/File), picker once, synthetic fallback | + Default rave demo (CORS), + YouTube/direct URL, + `getUniforms()` multi-band shader driver (bass/mids/treble/presence/etc), `/api/demo` |
| **Fluid** | Vorticity/dissipation fixed, single pointer | Audio-coupled (`presence→vorticity`, `mid→dissipation`, `bass→radius`), **multi-touch** (each finger = splat, 2nd finger repel), `applyAudioParams()`, 5 curated modes |
| **Fractals** | Static seed walk braked at connectivity | **Realtime morph** (`morph`/`morphRate` LFO via centroid) + **continuous fly-through** (drift auto-panned, audio-coupled), sliders + toggle, `flyOffset` also from XR worldOffset |
| **Geometry** | 8 Geometry viz2d only via awesome-audio-vis canon | **NEW `GeometryEngine` 7 modes**: `Bloom Flower` (Boller: petal count=mid, twist=lowMid), `Orbit Rings` (Teoxoy), `Neon Tunnel/Hex Pulse` (DesLauriers), `Kaleidoscope`, + **Hybrids** (`Bloom Grid` & `Fractal Mandala` seeding fluid dye) |
| **WebXR** | Curved 150°×84° screen at 2.6 m, separate XR GL context, ray → canvas UV | **Rebuilt 6DOF `xr-next.js`**: `R=3.2m 160°×96°`, `worldOffset` flight via thumbstick + grip drag, spatial fluid splats at controller tip, hand-tracking pinch (<2cm) → dye, `spatialSplat`/`onPinch` hooks, fallback to legacy `xr.js` |
| **UI** | Slide-out panel, dvh safe-area, chunky touch targets | Same panel + **Demo Rave + YouTube rows**, fractal morph/fly controls, geometry stage, hybrid indication, auto demo hint if idle 2.2s |

---

## Tech Stack (2026 Modern)

- **Build:** Vite optional, ES modules, `node --check` clean, `ws` proxy
- **Render:** Three.js-capable (`three/webgpu` TSL path), raw `WebGL2 #version 300 es` for fluid/fractal passes (shared GLSL→WGSL), `RGBA16F LINEAR` half-float (core GL2, no `OES_texture_float_linear` on iOS)
- **Shaders:** Fluid Navier-Stokes ping-pong + `fold()` fractal display, fractal `COMMON` preamble (`uBand[7]/uFlux/uOnset/uSeed/uZoom/uPan`), geometry Canvas2D instanced
- **Audio:** Web Audio `Analyser fftSize 4096, minDecibels -95, maxDecibels -10`, `rangeNorm()` floor/ceil `MIN_SPAN 0.06` guard (prevents dead band), 64 log bins `25→17000Hz`, 12-chroma fifths, `flux/centroid/spread`, `BPM median 16 beats`
- **XR:** WebXR `immersive-vr`, `local-floor` (fallback `local`), `hand-tracking`, `WebGL2 xrCompatible`
- **Server:** Node 18+, static + `soloist --ws 127.0.0.1:9090` proxy at `/soloist/ws`, `/soloist/status` + `/api/demo` + `/api/youtube` (501 fallback)

See `ARCHITECTURE.md` + `docs/ARCHITECTURE.md` for diagram + file map, `ROADMAP.md` for phases, `PROTOTYPES.md` for shader snippets.

---

## Modes (60+)

**Fluid — WebGL2 Navier-Stokes (5 curated, expandable to 19)**
Julia Bloom Flow · Spectrum Fountain · Nebula Bloom · Kaleidofluid · Attractor Bloom · *(+ Electric Vortex/Double Helix/Black Hole etc. hidden)*

**Fractal — Full-screen GLSL (20+ scenes)**
Julia Bloom · Julia Solid · Third Eye · Rift · Portal · Nebula Drift · Aurora Veil · Liquid Chrome · Ink Membrane · Liquid Spectrum · Spectrum Bloom · Standing Waves · Lattice Rain · Spiral Arms · Seven Suns · Strata · Chime Field · Iris · Spectral Weave · Crystal Cells · Hex Resonance · Truchet Weave · Gyroid Chamber · Menger Bloom · *(Mandelbrot/Kaleido IFS/Apollonian hidden)*

**Geometry — Minimalist + Organic (5)**
Bloom Flower · Orbit Rings · Neon Tunnel · Hex Pulse · Kaleidoscope

**Hybrid — Cross-Engine (2)**
Bloom Grid (Fluid-Geometry) · Fractal Mandala (Fractal-Geometry) — geometry seeds fluid dye

**Spectrum/Waveform/Atmosphere (8)**
Aurora Curtains · Spectrogram · Radial Spectrum · Vectorscope · Chroma Wheel · Onset Bursts · Waveform Ribbon · *(+ 20 more via viz2d)*

---

## Running it

```bash
npm start          # http://127.0.0.1:8080 (+ /soloist/ws proxy if SOLOIST_API_KEY is set)
# With daemon:
SOLOIST_API_KEY=... SOLOIST_DEVICE_NAME="MusicViz" npm start
# Check:
curl http://127.0.0.1:8080/api/demo | jq
curl http://127.0.0.1:8080/soloist/status | jq
```

Node 18+, `ws` for proxy, `soloist` binary downloaded from `https://soloist-builds.spotifycdn.com/soloist_release_<arch>.tar.gz`.
`server.js` binds `0.0.0.0:$PORT`.

**Railway**
- New repo: `VDC-Austin-KA/MusicViz` (pushed from `MusicFluid` reference)
- Detects `package.json` → `npm start`; `server.js` binds `0.0.0.0:$PORT`.
- Variables: `SOLOIST_API_KEY` (required), optional `SOLOIST_DEVICE_NAME`, `YT_API_KEY` (YouTube resolver)

---

## Controls

| Key | Touch | VR 6DOF | Action |
|---|---|---|---|
| `H` | Handle tap / swipe L/R | — | Show/hide panel |
| `←→` | Swipe U/D | Thumbstick / mode buttons | Next/prev mode |
| `F` | — | — | Fullscreen |
| `R` | — | Grip+Trigger | Random mode |
| `C` | — | — | Clear fluid |
| `1-4` | — | — | Toggle layers Sub/Mid/High/Air |
| Drag | 1-finger drag / 2-finger repel | Trigger drag | Paint fluid / bend field + fractal pan |
| Pinch | Two fingers | Thumb-index pinch | Sparkle fluid / chroma petal |
| — | — | Grip drag | Fly through fractal / move world |

---

## Architecture & Docs

- `ARCHITECTURE.md` — stack, diagram, modules, prototype snippets, roadmap
- `docs/ARCHITECTURE.md` — identical for GitHub Pages
- `ROADMAP.md` — P0–P7 phases
- `PROTOTYPES.md` — shader galleries (flower, tunnel, fold, xr-next)
- `js/audio.js` — `DEMO_TRACKS`, `useDemo`, `useYouTube`, `getUniforms`
- `js/fluid.js` — `applyAudioParams`, multi-pointer
- `js/fractal.js` — `morph`/`flyThrough`
- `js/geometry.js` — new engine + hybrids
- `js/xr-next.js` — 6DOF rebuilt
- `js/app.js` — registry 60+ modes, multi-touch, demo hints, `XR_ACTIVE`
- `server.js` — `/api/demo`, `/api/youtube`
- `style.css` — geometry canvas stage

---

## MusicFluid Reference — retained docs below

> Original 47-mode docs preserved; MusicViz is strictly architectural reference → vastly superior.

# MusicFluid (Reference)

An audio-reactive visualizer: a WebGL2 fluid simulation plus a canvas-2D engine,
**47 modes**, Spotify Soloist playback control, and a slide-away control panel.

---

## Spotify Soloist setup

MusicFluid now uses **Spotify Soloist** — a headless Linux daemon that appears as a
Spotify Connect device — instead of the browser PKCE Client ID flow. The previous
`Client ID + Redirect URI + PKCE` code has been removed (see git history).

### 1. Get a Soloist API key

1. Open **https://developer.spotify.com/dashboard/soloist** → generate an API key.
   The account that generates it must have **Premium**.
2. Treat it like a secret: don't commit it, don't embed it in client code, don't
   paste it in public issues. Each user generates their own. It is passed to the
   `soloist` binary at startup via `--api-key "$SOLOIST_API_KEY"`.

Docs:
- Overview: https://developer.spotify.com/documentation/soloist
- Getting started: https://developer.spotify.com/documentation/soloist/tutorials/getting-started
- Authentication: https://developer.spotify.com/documentation/soloist/concepts/authentication
- Downloads (arm64/arm32/x86_64, builds expire after 90 days, exit 10): https://developer.spotify.com/documentation/soloist/reference/downloads-and-updates
- WebSocket API: https://developer.spotify.com/documentation/soloist/reference/websocket-api
- Basic integration: https://developer.spotify.com/documentation/soloist/howtos/basic-integration
- CLI: https://developer.spotify.com/documentation/soloist/reference/command-line

### 2. Railway (hosted — viz.up.railway.app)

The Railway service runs the daemon **inside the same container** as the Node static
server. The server downloads the x86_64 binary on boot from the URL above, spawns

```
soloist --device-name "$SOLOIST_DEVICE_NAME" --api-key "$SOLOIST_API_KEY" \
        --ws 127.0.0.1:9090 --data-dir /tmp/soloist-data --cache-dir /tmp/soloist-cache
```

and proxies its WebSocket at `wss://viz.up.railway.app/soloist/ws` → `ws://127.0.0.1:9090`.

The browser never sends the API key to Spotify — the daemon did at startup.

Setup:

1. In Railway → your project (`proactive-youthfulness` / `MusicFluid`) → **Variables**, add:
   | Variable | Example | Required |
   |---|---|---|
   | `SOLOIST_API_KEY` | `abc123…` | Yes |
   | `SOLOIST_DEVICE_NAME` | `MusicFluid Railway` | No (defaults) |
   | `SOLOIST_WS` | `127.0.0.1:9090` | No |
   | `SOLOIST_DATA_DIR` | `/tmp/soloist-data` | No |
   | `SOLOIST_CACHE_DIR` | `/tmp/soloist-cache` | No |

2. Redeploy. Check **https://viz.up.railway.app/soloist/status** — it should show
   `running: true`, `ws: 127.0.0.1:9090`, `publicWsUrl: wss://viz.up.railway.app/soloist/ws`.

3. In MusicFluid open the **Spotify Soloist** panel → the WebSocket field will
   auto-default to `wss://viz.up.railway.app/soloist/ws`; hit **Connect & open dashboard**.

4. **Pair once:** open the Spotify app on the same account → device picker →
   select `MusicFluid Railway`. The session is stored in the daemon's data dir.

5. Use transport (play/pause/next/prev/seek) from MusicFluid; the daemon is the
   active Connect device. `/soloist/status` streams the daemon's log.

Notes:
- The daemon's WebSocket has no auth/TLS/Origin checks by design (local surface only).
  The Railway proxy adds no extra auth either — protect it via Railway private
  networking if needed.
- Data is in `/tmp` (ephemeral). To persist the Connect session across deploys,
  attach a Railway volume and set `SOLOIST_DATA_DIR` to its mount.
- Builds expire 90 days after their date. The server restarts and re-downloads on
  exit code 10. Otherwise check the build with `soloist --version`.
- `npm start` still serves `wss://viz.up.railway.app/soloist/ws` locally; unknown
  paths fall back to `index.html`.

### 3. Local Linux / Raspberry Pi

```bash
# Pick arch: arm64 (aarch64), arm32 (armv7l), x86_64
curl --fail --location -o soloist.tar.gz https://soloist-builds.spotifycdn.com/soloist_release_arm64.tar.gz
tar -xzf soloist.tar.gz
sudo install -m 755 soloist /usr/local/bin/soloist

# Run with key and WebSocket:
soloist --device-name "MusicFluid" --api-key "$SOLOIST_API_KEY" --ws 127.0.0.1:9090

# Or let MusicFluid's server launch it:
SOLOIST_API_KEY=... npm start   # serves http://127.0.0.1:8080 + proxies /soloist/ws
```

Then in MusicFluid set the WebSocket to `127.0.0.1:9090` (default) or a LAN IP
if the daemon is on another box, and hit Connect. Pair via Connect as above.
`ws.addr` / `ws.port` are written in the data dir for discovery; `soloist ctl`
also uses them.

### 4. Browser panel

- **Soloist API key** — saved in `localStorage mf.soloist.key` for reference only.
  On Railway the real value is `SOLOIST_API_KEY` env; the browser field is just a reminder.
- **Soloist WebSocket** — `mf.soloist.ws`. Railway auto-detects `wss://<host>/soloist/ws`; local defaults to `127.0.0.1:9090`.
- **Connect & open dashboard** → opens the WebSocket *and* pops the dashboard window.
- **Status** → opens `/soloist/status`. Setup notes live behind the collapsed
  *Setup & daemon notes* summary so the panel stays a control surface, not a manual.
- Soloist connection failures are reported **once**, then retried quietly with backoff;
  the state shows in the hint line rather than as a stream of red toasts.

### 5. The dashboard window — `/soloist.html`

The full control surface, in its own window (the panel keeps a mini transport).
It runs the same `js/spotify.js` client over its own WebSocket, so it keeps
working when the visualizer tab is backgrounded, and reconnects with backoff if
the daemon restarts.

Cover art · title / artist / album / context · draggable seek · play, pause,
next, prev · shuffle · repeat (off → context → track) · volume · live **Up next**
queue · **Play** / **Queue** by Spotify URI · **Activate** / **Deactivate** the
Connect device. `Space` toggles playback, `Shift+←/→` skip.

Open it directly at `/soloist.html`, or `/soloist.html?ws=<host:port>` to pin an
endpoint. There is no search — Soloist's WebSocket API has none; paste a URI
(Spotify app → track → Share → Copy Spotify URI) or queue from the app.

Parsing of the daemon's `Entity` frames is covered by
`node scripts/test-soloist-parse.js`.

---

## Levels: why every band used to sit pinned at full

Two independent faults made the meters read maxed-out and the visuals stop reacting.

1. **The normaliser divided by a peak it had just raised.** `peak = max(v, peak*decay)`
   followed by `v / peak` reports exactly `1.0` for every new maximum, and on a
   compressed master a band sits at its own recent peak more or less permanently.
   Measured on a loud 0.72–0.95 band: mean **0.93**, min **0.78**, spread **0.22** —
   the whole signal crushed into the top fifth of the scale.
2. **`analyser.maxDecibels` was `-20`.** A normal master runs well above that, so most
   bins saturated at 255 before normalisation ever ran.

Now each band normalises across its own **dynamic range** — a floor and a ceiling that
close in at the same slow rate — rather than against a bare maximum. The same signal
reads mean **0.60**, min **0.00**, spread **1.00**.

A floor/ceiling pair was tried once before and abandoned because a steady band collapsed
its span to nothing and went dead. That failure is real but not inherent: a `MIN_SPAN`
guard widens the span around its own centre (locally, for the division only — writing it
back inflates the ceiling past the silence gate and makes near-silence read 0.5), so a
dead-steady band settles at mid-scale instead of pegging.

**Auto-level** (**off** by default — switch it on in *Audio Source*) handles placement
rather than shape:
it drives the input trim toward a target RMS so a quiet stream and a mastered-loud one
both land inside the analyser's window, and backs off hard when bins start clipping. The
current trim shows next to the switch (`×1.43`), and leaving it off keeps manual
*Master gain* in charge. Measured end to end: a quiet test signal settled at ×1.43, a loud one at
×0.74, with all seven bands mid-scale and moving in both cases.

Covered by `node scripts/test-audio-range.js`.

---

## Why capture needs a picker, and how often

**A page cannot tap the Spotify player's audio internally. This is not a missing
feature — it is a wall.** Two separate ones, in fact:

- The player is a **cross-origin iframe** (`open.spotify.com`). Web Audio's
  `createMediaElementSource` only accepts a same-origin (or CORS-cleared) element, and
  there is no API that captures a frame's output. The `getDisplayMedia` prompt *is* the
  security boundary — skipping it is precisely what the browser exists to prevent.
- The stream is **DRM-protected** (the PlayReady/Widevine warnings the embed logs).
  EME-protected media cannot be captured even same-origin, so no same-origin rehost or
  proxy would help either.

Soloist is further out of reach still: its audio is decoded on the *daemon's* output,
possibly on another machine entirely, so there is nothing in the page to route.

What *is* fixable is being asked **repeatedly**, and that is fixed:

- The picker opens **once**. An existing live capture is reused by both Spotify buttons,
  with no further prompts — verified as 1 prompt across 3 consecutive requests.
- Chrome is asked to preselect **this tab** (`preferCurrentTab`), so the one prompt is a
  confirm rather than a hunt through a window list.
- If a capture is ended from the browser's own sharing bar, the stale stream is dropped
  so the next request prompts properly instead of feeding silence.
- **System** deliberately always re-opens the picker, so a wrong pick can be corrected.

The zero-prompt paths, if you want no dialog at all: **File** (drag in a local track) and
**Mic**, which asks once via the standard permission prompt and is then remembered by the
browser for the site.

---

## How the audio actually reaches the visualizer

This is worth understanding, because Soloist makes it less direct than you would expect.

**Soloist audio stays on the daemon's output** (HDMI/DAC/Bluetooth on the Pi or Railway host) and is not exposed to the browser's Web Audio API. The browser cannot attach an `AnalyserNode` to it.

So MusicFluid splits the job:

| Concern | Source |
|---|---|
| Login, now-playing, cover art, transport | Soloist WebSocket (`auth_state`, `playback_state`, `position_sync`, `play`/`pause`/`seek`/`set_volume`/…) |
| Playing the music | Soloist daemon as a Connect device (or any device via Connect) |
| The actual spectrum | **Loopback capture** of your system/tab audio |

To get real reactivity, click **Spotify (Soloist)** under *Audio Source* and tick
**“Share system audio”** (or **“Share tab audio”**) in the browser's picker. That one
button connects the Connect device *and* opens the capture path in the right order —
it is **System** capture on desktop and **Mic** on phones, chosen for you. **System**,
**Mic** and **File** are still there if you want to pick the path yourself.

If you skip that step, the **“Simulated beat when silent”** switch keeps the visuals
moving on a tempo-driven synthetic envelope rather than freezing on a black screen.

Notes:
- **Chrome / Edge on Windows** can share full system audio. On macOS, Chrome can share
  *tab* audio — play Soloist in a browser tab via **Activate Soloist** and share that tab.
- **Premium** is required (Soloist key generation needs Premium, and Connect control does).
- **Microphone** and **File** work as sources too, and need none of the above.
- On Railway the daemon's audio comes out of the *server*, so there is nothing local to
  capture. Play to a Connect device on your own machine, or use Mic / the simulated beat.

---

## Spotify Player — paste a playlist, listen to it

A source in its own right, in its own panel section, with **no dependency on Soloist** —
use it when the daemon is unreachable or you just want something that works.

1. Paste any Spotify link into the field under the player and hit **Load**. Share links
   (`https://open.spotify.com/playlist/<id>?si=…`), `/intl-xx/` paths, embed URLs and
   `spotify:playlist:<id>` URIs all parse; playlists, albums, tracks, artists, shows and
   episodes are all accepted. The choice is remembered in `localStorage mf.spotify.embed`,
   and *reset to default* restores the built-in playlist.
2. Hit **Listen to this player** (or **Spotify Player** in *Audio Source*). Pick **this
   tab** in the browser's picker and tick **“Share tab audio”**.
3. Press play in the embed. The visualizer is now reacting to it.

Because the embed plays in *this tab* rather than on the daemon's output, tab capture
reaches the analyser directly — which is why this is the reliable path. Full tracks need
a Premium session on `open.spotify.com` in the same browser; without one it previews 30 s.

---

## VR (WebXR) — Legacy

Next-gen replaces this with `js/xr-next.js` 6DOF; legacy docs:

**Enter VR** appears in the *Visualizer* section when the browser reports an
`immersive-vr` device (Quest browser, or a tethered headset in Chrome/Edge). WebXR
needs a secure context, so use the Railway URL or `localhost` — plain-HTTP LAN
addresses will not offer it.

Inside, the visualizer is painted onto a curved 150°×84° screen at 2.6 m, with a
floating control panel below it: track, artist, progress, transport, mode prev /
random / next, and **Exit VR**.

---

## On iPhone / iPad

The app is built for touch, but iOS removes one thing the desktop flow depends on,
so the route is different.

**There is no system audio capture on iOS.** Safari's `getDisplayMedia` does not
deliver audio, and no iOS browser exposes a loopback device — every browser on iOS
runs on WebKit, so Chrome and Firefox behave identically here. The **System** button
is therefore disabled on iOS rather than left to fail silently.

What works instead, and works well:

1. Start the track in the **Spotify app**, playing out of the **speaker** (not headphones).
2. Open MusicFluid in Safari and tap **Mic**, then allow microphone access.
3. The visuals now react to the room — which is the real audio, not an approximation.
4. Connect to Soloist here as well: the transport controls and now-playing panel
   drive the Soloist daemon over its WebSocket, so you can skip tracks from
   the visualizer without leaving it.

Raise **Master gain** if the level meters read low — a phone mic across a room is
quieter than a line input. If iOS reroutes audio when the mic opens (it switches to
the play-and-record session, which can pull output away from Bluetooth headphones),
that is expected OS behaviour, and it is why speaker playback is the recommendation.

---

## Modes (Reference)

47 in total, grouped in the picker. Now 60+ with Geometry/Hybrid.

## Controls

Same as before + Demo Rave + YouTube.

---

## Layout

```
index.html        markup (now + geometry-canvas, Demo Rave, YouTube field, morph/fly)
style.css         all styling (geometry stage z-index)
js/palette.js     colour ramps + album-art sampling
js/audio.js       capture, FFT, 64-band analysis, beat/BPM, synthetic fallback (+ DEMO_TRACKS/useDemo/useYouTube/getUniforms)
js/fluid.js       WebGL2 solver + the 19 fluid modes (+ audio-coupled applyAudioParams, multi-touch pointers[])
js/fractal.js     canvas-2D engine + the 28 2D modes (actually fractal registry 20+)
js/geometry.js    NEW — GeometryEngine + 7 minimalist/hybrid modes (Flower, Rings, Tunnel, etc.)
js/viz2d.js       canvas-2D engine (aurora/spectrogram/radial/chroma/bursts/ribbon)
js/spotify.js     Soloist WebSocket bridge
js/xr.js          legacy curved-screen XR
js/xr-next.js     NEW — true 6DOF spatial XR (worldOffset, hand-tracking, spatial splats)
js/app.js         mode registry (60+), render loop (vt clock), UI wiring (Demo+YouTube+morph/fly, multi-touch)
server.js         static server + Soloist daemon + /soloist/ws proxy + /api/demo + /api/youtube
scripts/ensure-soloist.js  arch-aware binary download
ARCHITECTURE.md   next-gen stack + diagram
ROADMAP.md
PROTOTYPES.md
```

