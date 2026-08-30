/**
 * MusicViz — Greenfield Vite + TS + Three.js Immersive Music Visualizer
 * Features:
 * - Dynamic range audio normalization & 0-friction music streaming
 * - Multi-engine visualizers: Fluid, Fractal, Geometry, Warp Tunnel, Cyber Grid, Particles
 * - Full interactive zoom (wheel/slider/pinch), fly-through navigation, pan, and real-time parameter controls
 */
import './style.css'
import { AudioEngine } from './core/AudioEngine'
import { Palette } from './core/Palette'
import { FluidSim } from './render/FluidSim'
import { FractalEngine } from './render/FractalEngine'
import { GeometryEngine } from './render/GeometryEngine'
import { WarpEngine } from './render/WarpEngine'
import { CyberGridEngine } from './render/CyberGridEngine'
import { buildRegistry } from './modes/registry'
import { mountPanel } from './ui/Panel'
import { World3D } from './render/World3D'
import { WORLDS, setWorldQuality } from './render/worlds3d'
import { VRPanel, VRPanelState } from './xr/VRPanel'

const app = document.querySelector<HTMLDivElement>('#app')!

// --- Layout HTML ---
app.innerHTML = `
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
`

const fluidCanvas = document.getElementById('fluid') as HTMLCanvasElement
const fractalCanvas = document.getElementById('fractal') as HTMLCanvasElement
const geoCanvas = document.getElementById('geo') as HTMLCanvasElement
const warpCanvas = document.getElementById('warp') as HTMLCanvasElement
const cyberCanvas = document.getElementById('cyber') as HTMLCanvasElement
const w3dCanvas = document.getElementById('world3d') as HTMLCanvasElement
const uiRoot = document.getElementById('ui-root') as HTMLDivElement

const palette = new Palette()
const audio = new AudioEngine()
const fluid = new FluidSim(fluidCanvas)
const fractal = new FractalEngine(fractalCanvas, palette)
const geometry = new GeometryEngine(geoCanvas, palette)
const warp = new WarpEngine(warpCanvas, palette)
const cyber = new CyberGridEngine(cyberCanvas, palette)
const w3d = new World3D(w3dCanvas, palette)

// Standalone headset browsers (Meta Quest, Pico) run a mobile GPU at two eyes x 72-90Hz
// and expose no tab/system audio capture. Both facts change how the app behaves.
const IS_HEADSET_BROWSER = /OculusBrowser|Quest|Pico|VR/i.test(navigator.userAgent)
const CAN_CAPTURE_TAB = !!(navigator.mediaDevices as any)?.getDisplayMedia
if (IS_HEADSET_BROWSER) setWorldQuality(0.35)

const MODES = buildRegistry()
let modeIdx = 0
const state = {
  motion: 0.55,
  reactivity: 1.0,
  depth: 1.0,
  interact: 1.0,
  fractalFold: -1,
  detail: 0.6,
  zoom: 1.0,
  pan: { x: 0, y: 0 },
  flyThrough: false,
  flySpeed: 1.0,
  evt: [{ x: 0, y: 0, at: -1e9, kind: 0 }, { x: 0, y: 0, at: -1e9, kind: 0 }],
}

// Spotify embed helpers — paste any link and it becomes an auto source
function parseSpotify(input: string): { type: string; id: string } | null {
  const s = input.trim()
  let m = s.match(/spotify:(playlist|album|track|artist|show|episode):([A-Za-z0-9]+)/)
  if (m) return { type: m[1], id: m[2] }
  m = s.match(/open\.spotify\.com\/(playlist|album|track|artist|show|episode)\/([A-Za-z0-9]+)/)
  if (m) return { type: m[1], id: m[2] }
  m = s.match(/embed\/(playlist|album|track|artist|show|episode)\/([A-Za-z0-9]+)/)
  if (m) return { type: m[1], id: m[2] }
  return null
}
function spotifyEmbedUrl(input: string): string | null {
  const p = parseSpotify(input); if (!p) return null
  return `https://open.spotify.com/embed/${p.type}/${p.id}?utm_source=generator&theme=0`
}
const DEFAULT_SPOTIFY = 'https://open.spotify.com/playlist/1gGHjgHQTT8ae4vm8F8gZG'
let spotifyEmbedSrc = localStorage.getItem('mv.spotify.embed') || spotifyEmbedUrl(DEFAULT_SPOTIFY)!

function current() { return MODES[modeIdx] }
function activeCanvas() {
  const e = current().engine
  if (e === 'fractal') return fractalCanvas
  if (e === 'geometry') return geoCanvas
  if (e === 'warp') return warpCanvas
  if (e === 'cyber') return cyberCanvas
  if (e === 'world3d') return w3dCanvas
  return fluidCanvas
}

function applyMode(idx: number) {
  if (idx < 0) idx = MODES.length - 1; if (idx >= MODES.length) idx = 0
  modeIdx = idx; const m = MODES[idx]

  const selDrawer = document.getElementById('sel-mode') as HTMLSelectElement
  const selHud = document.getElementById('hud-sel-mode') as HTMLSelectElement
  if (selDrawer) selDrawer.value = String(idx)
  if (selHud) selHud.value = String(idx)

  fluidCanvas.classList.toggle('inactive', m.engine !== 'fluid')
  fractalCanvas.classList.toggle('inactive', m.engine !== 'fractal')
  geoCanvas.classList.toggle('inactive', m.engine !== 'geometry')
  warpCanvas.classList.toggle('inactive', m.engine !== 'warp')
  cyberCanvas.classList.toggle('inactive', m.engine !== 'cyber')
  w3dCanvas.classList.toggle('inactive', m.engine !== 'world3d')
  if (m.engine === 'world3d') { w3d.setWorld((m as any).world); w3d.resize() }

  if (m.engine === 'fluid') { fluid.resize(); if ((m as any).physics) { const p: any = (m as any).physics; fluid.config.DENSITY_DISSIPATION = p.diss; fluid.config.CURL = p.vort; fluid.config.VISCOSITY = p.visc; fluid.config.SPLAT_RADIUS = p.radius } fluid.clear() }
  if (m.engine === 'fractal') fractal.resize()
  if (m.engine === 'geometry') { geometry.resize(); geometry.setMode(m as any) }
  if (m.engine === 'warp') warp.resize()
  if (m.engine === 'cyber') cyber.resize()

  localStorage.setItem('mv.mode', m.id)
  const flash = document.getElementById('flash')!; flash.querySelector('.fname')!.textContent = m.name; flash.querySelector('.fgroup')!.textContent = m.group; flash.classList.add('show'); setTimeout(() => flash.classList.remove('show'), 1600)
}
function stepMode(d: number) { applyMode(modeIdx + d) }
function randomMode() { let i: number; do { i = Math.floor(Math.random() * MODES.length) } while (i === modeIdx); applyMode(i) }

// --- Pointer & Pan Navigation ---
const pointer: any = { x: 0.5, y: 0.5, sy: 0.5, vx: 0, vy: 0, down: false, active: false, moving: false, repel: false, pointers: [] }
let lastPx = 0, lastPy = 0, havePointer = false, moveFrames = 0
function pointerMove(x: number, y: number) {
  const el = activeCanvas(); const cw = (el as any).clientWidth || innerWidth, ch = (el as any).clientHeight || innerHeight
  const nx = x / cw, ny = 1 - y / ch; if (!havePointer) { lastPx = nx; lastPy = ny; havePointer = true }
  pointer.vx = nx - lastPx; pointer.vy = ny - lastPy; lastPx = nx; lastPy = ny; pointer.x = nx; pointer.y = ny; pointer.sy = y / ch; pointer.active = true
  if (Math.abs(pointer.vx) > 0.0008 || Math.abs(pointer.vy) > 0.0008) moveFrames = 6
  if (pointer.down) {
    state.pan.x -= (pointer.vx * (cw / ch)) / Math.max(0.01, state.zoom)
    state.pan.y -= pointer.vy / Math.max(0.01, state.zoom)
  }
}
function updatePointer() {
  if (moveFrames > 0) { moveFrames--; pointer.moving = true } else { pointer.moving = false; pointer.vx *= 0.85; pointer.vy *= 0.85 }
  if (pointer.pointers.length) for (const p of pointer.pointers) { if (moveFrames > 0) p.moving = true; else { p.moving = false; p.vx *= 0.85; p.vy *= 0.85 } }
}
window.addEventListener('mousemove', e => { pointerMove(e.clientX, e.clientY); pointer.pointers = [{ ...pointer }] })
window.addEventListener('mousedown', e => { if ((e.target as HTMLElement).closest?.('#panel') || (e.target as HTMLElement).closest?.('#top-hud')) return; pointer.down = true; pointer.repel = e.shiftKey || e.button === 2; pointer.pointers = [{ ...pointer }] })
window.addEventListener('mouseup', () => { pointer.down = false; pointer.pointers = [] })
window.addEventListener('touchstart', e => {
  if ((e.target as HTMLElement).closest?.('#panel') || (e.target as HTMLElement).closest?.('#top-hud')) return
  const t = e.touches[0]; if (!t) return; pointer.down = true; pointer.repel = e.touches.length > 1
  const nx = t.clientX / innerWidth, ny = 1 - t.clientY / innerHeight; pointer.x = nx; pointer.y = ny; pointer.sy = t.clientY / innerHeight; pointer.active = true; pointer.pointers = [{ ...pointer }]
  pointerMove(t.clientX, t.clientY)
}, { passive: true })
window.addEventListener('touchmove', e => { const t = e.touches[0]; if (t) pointerMove(t.clientX, t.clientY) }, { passive: true })
window.addEventListener('touchend', () => { pointer.down = false; pointer.pointers = [] }, { passive: true })

// --- Mouse Wheel & Touch Pinch Zoom ---
window.addEventListener('wheel', (e) => {
  if ((e.target as HTMLElement).closest?.('#panel') || (e.target as HTMLElement).closest?.('#top-hud')) return
  e.preventDefault()
  const factor = e.deltaY < 0 ? 1.12 : 0.89
  state.zoom = Math.max(0.1, Math.min(50, state.zoom * factor))
  const zoomSlider = document.getElementById('s-zoom') as HTMLInputElement
  const zoomVal = document.getElementById('v-zoom')
  if (zoomSlider && zoomVal) {
    zoomSlider.value = String(Math.round(Math.log10(state.zoom) * 100))
    zoomVal.textContent = state.zoom.toFixed(2) + '×'
  }
}, { passive: false })

let touchStartDist = 0
let touchStartZoom = 1
window.addEventListener('touchstart', (e) => {
  if ((e.target as HTMLElement).closest?.('#panel') || (e.target as HTMLElement).closest?.('#top-hud')) return
  if (e.touches.length === 2) {
    touchStartDist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY)
    touchStartZoom = state.zoom
  }
}, { passive: true })

window.addEventListener('touchmove', (e) => {
  if ((e.target as HTMLElement).closest?.('#panel') || (e.target as HTMLElement).closest?.('#top-hud')) return
  if (e.touches.length === 2 && touchStartDist > 0) {
    const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY)
    const factor = dist / touchStartDist
    state.zoom = Math.max(0.1, Math.min(50, touchStartZoom * factor))
    const zoomSlider = document.getElementById('s-zoom') as HTMLInputElement
    const zoomVal = document.getElementById('v-zoom')
    if (zoomSlider && zoomVal) {
      zoomSlider.value = String(Math.round(Math.log10(state.zoom) * 100))
      zoomVal.textContent = state.zoom.toFixed(2) + '×'
    }
  }
}, { passive: true })

// --- Spotify Embed Helper ---
function loadSpotifyEmbed(url: string) {
  const embedUrl = spotifyEmbedUrl(url) || spotifyEmbedSrc
  if (embedUrl !== url) spotifyEmbedSrc = embedUrl
  else if (url.startsWith('http')) spotifyEmbedSrc = url
  localStorage.setItem('mv.spotify.embed', spotifyEmbedSrc)
  const iframe = document.getElementById('sp-embed') as HTMLIFrameElement
  const wrap = document.getElementById('sp-embed-wrap') as HTMLElement
  if (iframe) { iframe.src = spotifyEmbedSrc; if (wrap) wrap.style.display = 'block'; }
  const input = document.getElementById('sp-url') as HTMLInputElement
  if (input) input.value = url
}

function toast(msg: string, isErr = false) {
  const el = document.getElementById('toast')!
  el.textContent = msg
  el.className = isErr ? 'show err' : 'show'
  setTimeout(() => (el.className = ''), isErr ? 5000 : 2800)
  console.log('[MusicViz]', msg)
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => toast('Fullscreen request denied', true))
  } else {
    document.exitFullscreen().catch(() => {})
  }
}

// --- UI Panel Mounting ---
mountPanel(uiRoot, MODES, {
  onMode: (v) => { if (v === 1 || v === -1) stepMode(v); else applyMode(v) },
  onRandom: randomMode,
  onFullscreen: toggleFullscreen,
  onVR: () => enterVR(),
  onBirdFly: () => toggleBirdFlight(),
  onDemo: async () => {
    audio.unlock()
    let el: any = null
    try { el = audio.useDemo(0); } catch (e) { console.warn('demo useDemo throw', e) }
    let failed = false
    if (el) {
      const onErr = () => { failed = true; audio.setSynthetic(true); toast('Demo stream blocked — fallback to WebAudio rave.', true) }
      el.addEventListener('error', onErr, { once: true })
      setTimeout(() => { el.removeEventListener('error', onErr); if (!failed && el && el.paused) { toast('Demo needs tap to play') } }, 1300)
    }
    toast('Demo Rave 140 BPM • High dynamic range active')
    const idx = MODES.findIndex(m => m.id === 'hyperspace-warp')
    if (idx >= 0) applyMode(idx)
    ;(palette as any).set('vapor')
    const sel = document.getElementById('sel-pal') as HTMLSelectElement
    if (sel) sel.value = 'vapor'
  },
  onDemoNext: () => {
    try { audio.nextDemo(); toast('Next Demo Rave track loaded') } catch { toast('Next demo failed', true) }
  },
  onDemoStop: () => {
    try { (audio as any).disconnect?.() } catch {}
    audio.setSynthetic(true)
    toast('Demo stopped — pick System/Mic/File/Spotify')
  },
  onYouTube: async (url) => {
    if (url.match(/\.(mp3|ogg|wav|m4a)(\?|$)/i)) {
      try { audio.unlock(); (audio as any).useMediaElement(url, 'url: ' + url, { loop: true }); toast('Streaming Audio URL') } catch { toast('URL play failed', true) }
      return
    }
    audio.unlock()
    const el = await audio.useYouTube(url)
    if (el) toast('YouTube audio stream loaded')
    else toast('YouTube: paste direct MP3 URL or use Demo/System', true)
  },
  onSpotify: (url) => {
    const embed = spotifyEmbedUrl(url)
    if (!embed) { toast('Invalid Spotify link (playlist/album/track)', true); return }
    loadSpotifyEmbed(url)
    toast('Spotify loaded — hit "Listen to this player" then Share tab audio')
    document.getElementById('sp-embed-wrap')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  },
  onSpotifyCapture: async () => {
    audio.unlock()
    const already = (audio as any).hasLiveCapture?.()
    if (already) { toast('Using existing capture — hit play in Spotify player'); return }
    const ok = await (audio as any).useSystemAudio?.('Spotify player', true)
    if (ok) toast('Listening to Spotify player — hit play above')
    else toast('Confirm THIS tab + tick "Share tab audio"', true)
  },
  onSystem: async () => {
    audio.unlock()
    if (await audio.useSystemAudio(null as any, true)) toast('System audio linked')
    else toast('System capture cancelled', true)
  },
  onMic: async () => {
    audio.unlock()
    if (await audio.useMicrophone()) toast('Microphone linked')
    else toast('Mic access denied', true)
  },
  onFile: (f) => {
    audio.unlock()
    audio.useFile(f); toast('Playing local file: ' + f.name)
  },
})

// --- Sliders Wiring ---
;(['s-gain', 's-motion', 's-react', 's-interact', 's-diss', 's-vort', 's-detail', 's-zoom', 's-morph', 's-morph-rate', 's-fly'] as const).forEach(id => {
  const el = document.getElementById(id) as HTMLInputElement; if (!el) return
  const labelMap: Record<string, string> = { 's-gain': 'v-gain', 's-motion': 'v-motion', 's-react': 'v-react', 's-interact': 'v-interact', 's-diss': 'v-diss', 's-vort': 'v-vort', 's-detail': 'v-detail', 's-zoom': 'v-zoom', 's-morph': 'v-morph', 's-morph-rate': 'v-morph-rate', 's-fly': 'v-fly' }
  el.addEventListener('input', () => {
    const v = parseFloat(el.value)
    const lab = document.getElementById(labelMap[id])
    if (id === 's-gain') { (audio as any).config.gain = v; if (lab) lab.textContent = v.toFixed(1) }
    if (id === 's-motion') { state.motion = v; if (lab) lab.textContent = v.toFixed(2) + '×' }
    if (id === 's-react') { state.reactivity = v; (audio as any).config.sensitivity = 1.5 * v; if (lab) lab.textContent = v.toFixed(1) }
    if (id === 's-interact') { state.interact = v / 100; if (lab) lab.textContent = Math.round(v) + '%' }
    if (id === 's-diss') { fluid.config.DENSITY_DISSIPATION = v; if (lab) lab.textContent = v.toFixed(3) }
    if (id === 's-vort') { fluid.config.CURL = v; if (lab) lab.textContent = String(Math.round(v)) }
    if (id === 's-detail') { state.detail = v / 100; if (lab) lab.textContent = Math.round(v) + '%' }
    if (id === 's-zoom') { state.zoom = Math.pow(10, v / 100); if (lab) lab.textContent = (state.zoom < 1000 ? state.zoom.toFixed(state.zoom < 10 ? 2 : 0) : state.zoom.toExponential(1)) + '×' }
    if (id === 's-morph') { fractal.setMorph(v / 100); if (lab) lab.textContent = Math.round(v) + '%' }
    if (id === 's-morph-rate') { fractal.setMorphRate(v / 100 * 2); if (lab) lab.textContent = Math.round(v) + '%' }
    if (id === 's-fly') { state.flySpeed = v; fractal.setFlyThrough(state.flyThrough, v); if (lab) lab.textContent = v.toFixed(1) + '×' }
  })
})

document.getElementById('sw-fly')?.addEventListener('click', (e) => {
  const el = e.currentTarget as HTMLElement
  const on = !el.classList.contains('on')
  el.classList.toggle('on', on)
  state.flyThrough = on
  const flyEl = document.getElementById('s-fly') as HTMLInputElement
  const speed = flyEl ? parseFloat(flyEl.value) : 1.0
  state.flySpeed = speed
  fractal.setFlyThrough(on, speed)
  toast(on ? 'Fly-Through Mode ON — automatic flight drift active' : 'Fly-Through Mode OFF')
})

document.getElementById('sel-pal')?.addEventListener('change', (e) => {
  const v = (e.target as HTMLSelectElement).value
  ;(palette as any).set(v)
  localStorage.setItem('mv.palette', v)
  toast('Palette: ' + v)
})

document.getElementById('b-reset-view')?.addEventListener('click', () => {
  state.pan.x = 0; state.pan.y = 0; state.zoom = 1
  const s = document.getElementById('s-zoom') as HTMLInputElement
  if (s) { s.value = '0'; s.dispatchEvent(new Event('input')) }
  toast('Camera view reset')
})

// --- Keyboard Hotkeys ---
window.addEventListener('keydown', (e) => {
  if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return
  if (e.key === 'f' || e.key === 'F') { toggleFullscreen() }
  else if (e.key === 'h' || e.key === 'H') { document.getElementById('panel')?.classList.toggle('collapsed') }
  else if (e.key === '[') { stepMode(-1) }
  else if (e.key === ']') { stepMode(1) }
  else if (e.key === 'r' || e.key === 'R') { randomMode() }
  else if (e.key === 'v' || e.key === 'V') { toggleBirdFlight() }
  else if (e.key === 'p' || e.key === 'P') {
    const sel = document.getElementById('sel-pal') as HTMLSelectElement
    if (sel) {
      const idx = (sel.selectedIndex + 1) % sel.options.length
      sel.selectedIndex = idx
      sel.dispatchEvent(new Event('change'))
    }
  }
})

// --- Engine Boot ---
let fluidOk = false, fractalOk = false, geoOk = false, warpOk = false, cyberOk = false
try { fluidOk = fluid.init() } catch (e) { console.error('fluid init fail', e) }
try { fractalOk = fractal.init() } catch (e) { console.error('fractal init fail', e) }
try { geoOk = geometry.init() } catch (e) { console.error('geo init fail', e) }
try { warpOk = warp.init() } catch (e) { console.error('warp init fail', e) }
try { cyberOk = cyber.init() } catch (e) { console.error('cyber init fail', e) }

if (!fluidOk && !fractalOk && !geoOk && !warpOk && !cyberOk) {
  toast('WebGL2 unavailable — please check WebGL support', true)
}

// Pre-fill the Spotify player so it's one click from playing
loadSpotifyEmbed(localStorage.getItem('mv.spotify.embed') || DEFAULT_SPOTIFY)

const saved = localStorage.getItem('mv.mode'); let sIdx = MODES.findIndex(m => m.id === saved); if (sIdx < 0) sIdx = 0; applyMode(sIdx)
const savedPal = localStorage.getItem('mv.palette'); if (savedPal) { (palette as any).set(savedPal); const sel = document.getElementById('sel-pal') as HTMLSelectElement; if (sel) sel.value = savedPal }

audio.setSynthetic(true)
audio.onStatus((k: string, d: string) => {
  const dot = document.querySelector('#s-status .dot') as HTMLElement
  const txt = document.getElementById('s-text') as HTMLElement
  const hudTrack = document.getElementById('hud-track-name') as HTMLElement
  if (!dot || !txt) return
  if (k === 'connected' || k === 'audible') {
    dot.className = 'dot live'
    txt.textContent = 'Listening to ' + d
    if (hudTrack) hudTrack.textContent = d
    audio.setSynthetic(false)
  } else if (k === 'silent') {
    dot.className = 'dot warn'
    txt.textContent = 'Connected but silent — ' + d
  } else if (k === 'ended') {
    dot.className = 'dot'
    txt.textContent = 'Capture stopped'
    audio.setSynthetic(true)
  } else if (k === 'error') {
    dot.className = 'dot err'
    txt.textContent = d
    toast(d, true)
  }
})

// Unlock Audio on First User Interaction
const unlock = () => { audio.unlock(); window.removeEventListener('touchend', unlock); window.removeEventListener('mousedown', unlock); window.removeEventListener('keydown', unlock) }
window.addEventListener('touchend', unlock, { passive: true } as any)
window.addEventListener('mousedown', unlock as any)
window.addEventListener('keydown', unlock as any)

// --- 3D Spatial World: VR headset flight + desktop bird flight ---
/** Jump to the 3D twin of whatever 2D mode is showing, so VR/flight always has a world. */
function enter3D(): boolean {
  if (current().engine === 'world3d') return true
  const i = MODES.findIndex(m => m.engine === 'world3d' && m.world === current().id)
  if (i < 0) return false
  applyMode(i)
  return true
}

/**
 * Tab audio capture always shows a browser picker, and getDisplayMedia cannot be called
 * from inside an immersive session at all — so we take that one prompt here, on the flat
 * page, before the headset goes on. The MediaStream outlives the XR session, so Spotify
 * (or any tab audio) keeps feeding the analyser with zero prompts once you are in VR,
 * including across repeated enter/exit.
 */
async function armVRAudio(): Promise<boolean> {
  if (audio.hasLiveCapture()) return true
  audio.unlock()
  return !!(await (audio as any).useSystemAudio?.('Spotify player', false))
}

/**
 * A standalone headset browser has no getDisplayMedia at all — there is no tab or
 * system audio to capture, and no desktop to capture it from. Give VR a source that
 * needs no permission whatsoever instead of entering to silence.
 */
function ensureHeadsetAudio() {
  if (audio.hasLiveCapture()) return
  if (lastMetrics && !lastMetrics.synthetic) return // an <audio> source is already feeding
  audio.unlock()
  document.getElementById('b-demo')?.dispatchEvent(new Event('click'))
  toast('Headset browser cannot capture tab audio — started the demo track')
}

/** Why can't we go to VR? Say the actual reason instead of "no headset". */
function vrBlockReason(): string | null {
  if (!window.isSecureContext) return 'WebXR needs a secure page — open this over https:// (http only works on localhost)'
  if (!navigator.xr) return 'This browser has no WebXR. On Quest use the built-in Meta Browser.'
  return null
}

async function enterVR() {
  if (w3d.isVRActive()) { w3d.stopVR(); return }
  if (!enter3D()) { toast('This mode has no 3D version', true); return }

  const blocked = vrBlockReason()
  if (blocked) { toast(blocked, true); return }

  if (!(await w3d.isVRAvailable())) {
    toast('No VR headset detected — starting 3D bird flight instead', true)
    w3d.setDesktopFlight(true)
    return
  }

  if (CAN_CAPTURE_TAB) {
    // Arm the audio first. requestSession needs its own fresh click, so we stop here
    // and let the next press launch — one extra tap, and never a prompt inside VR.
    if (!audio.hasLiveCapture()) {
      const armed = await armVRAudio()
      toast(armed
        ? 'Audio armed — press Enter VR again to launch (no more prompts)'
        : 'No tab audio armed — VR will use the demo/synth source', !armed)
      if (armed) return
    }
  } else {
    ensureHeadsetAudio()
  }
  try {
    await w3d.startVR((active: boolean) => {
      const b = document.getElementById('b-vr') as HTMLButtonElement
      if (b) b.textContent = active ? 'Exit VR' : 'Enter WebXR VR (6DOF Headset Flight)'
    })
    toast('6DOF flight — thumbstick to fly · trigger to soar in gaze direction')
  } catch (e) { toast('VR failed: ' + (e as Error).message, true) }
}

function toggleBirdFlight() {
  if (!enter3D()) { toast('This mode has no 3D version', true); return }
  const on = w3d.toggleDesktopFlight()
  toast(on ? 'Bird flight ON — WASD fly · mouse look · Space/C up-down · Shift boost · Esc to land' : 'Bird flight OFF')
}

window.addEventListener('resize', () => { if (current().engine === 'world3d') w3d.resize() })

// --- in-headset control panel ---
// Actions drive the existing DOM controls rather than re-implementing them, so the
// flat drawer and the VR panel can never disagree about what a control does.
function driveSlider(id: string, v: number) {
  const el = document.getElementById(id) as HTMLInputElement
  if (!el) return
  el.value = String(v)
  el.dispatchEvent(new Event('input'))
}
const PALETTES = ['rainbow', 'neon', 'vapor', 'aurora', 'magma', 'mono', 'album']
const METER_BANDS = ['subBass', 'bass', 'lowMid', 'mid', 'highMid', 'presence', 'air']
const VR_SLIDERS: Record<string, { id: string; min: number; max: number; label: string; fmt: (v: number) => string }> = {
  gain: { id: 's-gain', min: 0.2, max: 4, label: 'Master Gain', fmt: v => v.toFixed(1) },
  motion: { id: 's-motion', min: 0.15, max: 2, label: 'Motion Speed', fmt: v => v.toFixed(2) + '×' },
  react: { id: 's-react', min: 0.2, max: 2.5, label: 'Beat Reaction', fmt: v => v.toFixed(1) },
  fly: { id: 's-fly', min: 0.2, max: 3, label: 'Flight Speed', fmt: v => v.toFixed(1) + '×' },
}

const vrPanel = new VRPanel({
  exitVR: () => w3d.stopVR(),
  setMode: (i) => applyMode(i),
  stepMode: (d) => stepMode(d),
  randomMode: () => randomMode(),
  setPalette: (name) => {
    const sel = document.getElementById('sel-pal') as HTMLSelectElement
    if (sel) { sel.value = name; sel.dispatchEvent(new Event('change')) }
  },
  setSlider: (k, v) => driveSlider(VR_SLIDERS[k].id, v),
  demo: () => document.getElementById('b-demo')?.dispatchEvent(new Event('click')),
  demoNext: () => document.getElementById('b-demo-next')?.dispatchEvent(new Event('click')),
  demoStop: () => document.getElementById('b-demo-stop')?.dispatchEvent(new Event('click')),
})

let lastMetrics: any = null
w3d.setPanel(vrPanel, (): VRPanelState => {
  const mm = lastMetrics
  const sliders: any = {}
  for (const k of Object.keys(VR_SLIDERS)) {
    const cfg = VR_SLIDERS[k]
    const el = document.getElementById(cfg.id) as HTMLInputElement
    sliders[k] = { v: el ? parseFloat(el.value) : cfg.min, min: cfg.min, max: cfg.max, label: cfg.label, fmt: cfg.fmt }
  }
  return {
    modes: MODES,
    modeIdx,
    palettes: PALETTES,
    palette: (palette as any).get?.() || 'rainbow',
    sliders,
    track: document.getElementById('hud-track-name')?.textContent || 'No audio source',
    bpm: mm?.bpm || 0,
    live: !!mm?.live,
    meters: METER_BANDS.map(b => mm?.band?.[b]?.env || 0),
  }
})

// --- Main Render Loop ---
let last = performance.now(), vt = 0
const ctx: any = {
  t: 0,
  dt: 0,
  m: null,
  k: 1,
  depth: 1,
  interact: 1,
  zoom: 1,
  pan: { x: 0, y: 0 },
  flyThrough: false,
  flySpeed: 1,
  detail: 0.6,
  layerOn: { sub: true, mid: true, high: true, air: true },
  pointer,
  band: (k: string) => ctx.m.band[k],
  n: (k: string) => ctx.m.band[k].norm,
  e: (k: string) => ctx.m.band[k].env
}

function loop(now: number, xrFrame?: any) {
  const dt = Math.min((now - last) / 1000, 0.033) * state.motion; last = now; vt += dt * 1000
  const m = audio.update(now); (palette as any).updateMusic(m); updatePointer()
  lastMetrics = m
  ctx.t = vt
  ctx.dt = dt
  ctx.m = m
  ctx.k = state.reactivity
  ctx.depth = state.depth
  ctx.interact = state.interact
  ctx.zoom = state.zoom
  ctx.pan = state.pan
  ctx.flyThrough = state.flyThrough
  ctx.flySpeed = state.flySpeed
  ctx.detail = state.detail

  const mode = current()
  try {
    if (mode.engine === 'world3d') {
      w3d.render(m, dt, state.flySpeed)
    } else if (mode.engine === 'fluid' && fluidOk) {
      fluid.beginFrame()
      const bass = m.band.bass.norm, mid = m.band.mid.norm
      if ((mode as any).id === 'spectrum-fountain') {
        const N = 24, step = m.bandsNorm.length / N
        for (let i = 0; i < 12; i++) {
          const v = m.bandsNorm[Math.floor(i * step)]
          if (v < 0.12) continue
          fluid.splat((i + 0.5) / N, 0.03, (Math.random() - 0.5) * 3, v * 78 * state.reactivity, palette.hdr(i / N * 0.8, 3.2), 0.6 + v)
        }
      } else {
        const t = vt * 0.0009 * (0.5 + mid * 1.6)
        for (let i = 0; i < 3; i++) {
          const a = t + Math.PI * 2 * (i / 3)
          const r = (0.26 + bass * 0.12) * Math.min(2.0, state.zoom)
          fluid.splat(0.5 + Math.cos(a) * r, 0.5 + Math.sin(a) * r, -Math.sin(a) * 8 * state.reactivity, Math.cos(a) * 8 * state.reactivity, palette.hdr(0.33 + i / 3 * 0.1, 3), 0.8)
        }
      }
      if (pointer.active && state.interact > 0) {
        for (const p of (pointer.pointers.length ? pointer.pointers : [pointer])) {
          if (p.active) fluid.splat(p.x, p.y, p.vx * 5 * state.interact, p.vy * 5 * state.interact, palette.hdr(0, 1), 1.0)
        }
      }
      const ap = fluid.applyAudioParams(m, state.reactivity)
      fluid.solve(dt, ap.vort, ap.diss, state.fractalFold >= 0 ? state.fractalFold : ((mode as any).fractal || 0), vt)
    } else if (mode.engine === 'fractal' && fractalOk) {
      const ft = vt * ((mode as any).timeScale ?? 1)
      fractal.juliaSeed(vt * 0.0001, m, vt)
      fractal.render(mode as any, m, pointer, {
        time: ft,
        stamp: vt,
        interact: state.interact,
        detail: state.detail,
        zoom: state.zoom,
        pan: state.pan,
        hover: 1,
        bg: 1,
        bgAmt: 1,
        wall: now,
        key: false,
        role: 1,
        events: state.evt.map((e: any) => ({ x: e.x, y: e.y, kind: e.kind, age: (now - e.at) / 1000 }))
      })
    } else if (mode.engine === 'geometry' && geoOk) {
      geometry.frame(vt, m, ctx)
      if ((mode.id as string).startsWith('hybrid') || (mode as any).id === 'bloom-grid') {
        if (m.beat && fluidOk) fluid.splat(0.5, 0.5, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10, palette.hdr(Math.random(), 3.2))
      }
    } else if (mode.engine === 'warp' && warpOk) {
      warp.render(vt, m, pointer, {
        zoom: state.zoom,
        pan: state.pan,
        fly: state.flyThrough,
        flySpeed: state.flySpeed,
        detail: state.detail,
        motion: state.motion
      })
    } else if (mode.engine === 'cyber' && cyberOk) {
      cyber.render(vt, m, pointer, {
        zoom: state.zoom,
        pan: state.pan,
        fly: state.flyThrough,
        flySpeed: state.flySpeed,
        detail: state.detail,
        motion: state.motion
      })
    }
  } catch (e) { console.error('frame error', e) }

  // Update EQ meters
  document.querySelectorAll('#meters i').forEach(el => {
    const band = (el as HTMLElement).dataset.band as any
    const b = (m.band as any)[band]
    ;(el as HTMLElement).style.height = Math.min(100, (b ? b.env : 0) * 100) + '%'
  })
  const bpmEl = document.getElementById('bpm'); if (bpmEl && m.bpm) bpmEl.textContent = `Tempo ${m.bpm} BPM${m.synthetic && !m.live ? ' (synth)' : ''} · centroid ${Math.round(m.centroid * 100)}%`

}
w3d.setLoop(loop)

;(window as any).FluidSimInstance = fluid
;(window as any).audio = audio
;(window as any).palette = palette
if ((import.meta as any).env?.DEV) {
  const errs = VRPanel.selfCheck()
  if (errs.length) { console.error('[MusicViz] VR panel self-check FAILED:', errs); toast('VR panel broken: ' + errs[0], true) }
  else console.log('[MusicViz] VR panel self-check OK')
}

// Every 2D mode must have a 3D twin with a real world behind it — shout if one is missing.
const missing3D = MODES.filter(m => m.engine === 'world3d' && !WORLDS[(m as any).world]).map(m => m.id)
if (missing3D.length) { console.error('[MusicViz] 3D worlds missing:', missing3D); toast('Missing 3D worlds: ' + missing3D.join(', '), true) }

console.log('[MusicViz] Next-Gen platform booted — modes:', MODES.length,
  '(2D:', MODES.filter(m => m.engine !== 'world3d').length, '· 3D:', MODES.filter(m => m.engine === 'world3d').length + ')')
