/**
 * MusicViz — greenfield Vite + TS + Three entry
 * High-impact minimalism (DesLauriers), Boller flower, Teoxoy rings
 * FIXED: meters, demo CORS fallback, Spotify playlist auto-source, all buttons wired
 */
import './style.css'
import { AudioEngine } from './core/AudioEngine'
import { Palette } from './core/Palette'
import { FluidSim } from './render/FluidSim'
import { FractalEngine } from './render/FractalEngine'
import { GeometryEngine } from './render/GeometryEngine'
import { buildRegistry } from './modes/registry'
import { mountPanel } from './ui/Panel'
import { XRManager } from './xr/XRManager'
import * as THREE from 'three'

const app = document.querySelector<HTMLDivElement>('#app')!

// --- layout (minimal, DesLauriers) ---
app.innerHTML = `
  <div id="stage">
    <canvas id="fluid" class="stage"></canvas>
    <canvas id="fractal" class="stage"></canvas>
    <canvas id="geo" class="stage"></canvas>
  </div>
  <div id="ui-root"></div>
  <div id="flash"><div class="fname"></div><div class="fgroup"></div></div>
  <div id="toast"></div>
`

const fluidCanvas = document.getElementById('fluid') as HTMLCanvasElement
const fractalCanvas = document.getElementById('fractal') as HTMLCanvasElement
const geoCanvas = document.getElementById('geo') as HTMLCanvasElement
const uiRoot = document.getElementById('ui-root') as HTMLDivElement

const palette = new Palette()
const audio = new AudioEngine()
const fluid = new FluidSim(fluidCanvas)
const fractal = new FractalEngine(fractalCanvas, palette)
const geometry = new GeometryEngine(geoCanvas, palette)

const MODES = buildRegistry()
let modeIdx = 0
const state = {
  motion: 0.55, reactivity: 1, depth: 1, interact: 1, fractalFold: -1,
  detail: 0.6, zoom: 1, pan: { x: 0, y: 0 },
  evt: [{ x: 0, y: 0, at: -1e9, kind: 0 }, { x: 0, y: 0, at: -1e9, kind: 0 }],
}

// Spotify embed helpers — paste any link and it becomes an auto source
function parseSpotify(input: string): { type: string; id: string } | null {
  const s = input.trim()
  // spotify:playlist:abc
  let m = s.match(/spotify:(playlist|album|track|artist|show|episode):([A-Za-z0-9]+)/)
  if (m) return { type: m[1], id: m[2] }
  // https://open.spotify.com/playlist/abc?si=...
  m = s.match(/open\.spotify\.com\/(playlist|album|track|artist|show|episode)\/([A-Za-z0-9]+)/)
  if (m) return { type: m[1], id: m[2] }
  // https://open.spotify.com/embed/playlist/abc
  m = s.match(/embed\/(playlist|album|track|artist|show|episode)\/([A-Za-z0-9]+)/)
  if (m) return { type: m[1], id: m[2] }
  return null
}
function spotifyEmbedUrl(input: string): string | null {
  const p = parseSpotify(input); if (!p) return null
  // embed playlist/album/track all work; use light theme dark
  return `https://open.spotify.com/embed/${p.type}/${p.id}?utm_source=generator&theme=0`
}
let spotifyEmbedSrc = localStorage.getItem('mv.spotify.embed') || 'https://open.spotify.com/embed/playlist/37i9dQZF1DX0XUsuxWHRQd?utm_source=generator'

function current() { return MODES[modeIdx] }
function activeCanvas() {
  const e = current().engine
  if (e === 'fractal') return fractalCanvas
  if (e === 'geometry') return geoCanvas
  return fluidCanvas
}
function applyMode(idx: number) {
  if (idx < 0) idx = MODES.length - 1; if (idx >= MODES.length) idx = 0
  modeIdx = idx; const m = MODES[idx]
  const sel = document.getElementById('sel-mode') as HTMLSelectElement
  if (sel) sel.value = String(idx)
  fluidCanvas.classList.toggle('inactive', m.engine !== 'fluid')
  fractalCanvas.classList.toggle('inactive', m.engine !== 'fractal')
  geoCanvas.classList.toggle('inactive', m.engine !== 'geometry')
  if (m.engine === 'fluid') { fluid.resize(); if ((m as any).physics) { const p: any = (m as any).physics; fluid.config.DENSITY_DISSIPATION = p.diss; fluid.config.CURL = p.vort; fluid.config.VISCOSITY = p.visc; fluid.config.SPLAT_RADIUS = p.radius } fluid.clear() }
  if (m.engine === 'fractal') fractal.resize()
  if (m.engine === 'geometry') { geometry.resize(); geometry.setMode(m as any) }
  localStorage.setItem('mv.mode', m.id)
  const flash = document.getElementById('flash')!; flash.querySelector('.fname')!.textContent = m.name; flash.querySelector('.fgroup')!.textContent = m.group; flash.classList.add('show'); setTimeout(() => flash.classList.remove('show'), 1600)
}
function stepMode(d: number) { applyMode(modeIdx + d) }
function randomMode() { let i: number; do { i = Math.floor(Math.random() * MODES.length) } while (i === modeIdx); applyMode(i) }

// --- pointer ---
const pointer: any = { x: 0.5, y: 0.5, sy: 0.5, vx: 0, vy: 0, down: false, active: false, moving: false, repel: false, pointers: [] }
let lastPx = 0, lastPy = 0, havePointer = false, moveFrames = 0
function pointerMove(x: number, y: number) {
  const el = activeCanvas(); const cw = (el as any).clientWidth || innerWidth, ch = (el as any).clientHeight || innerHeight
  const nx = x / cw, ny = 1 - y / ch; if (!havePointer) { lastPx = nx; lastPy = ny; havePointer = true }
  pointer.vx = nx - lastPx; pointer.vy = ny - lastPy; lastPx = nx; lastPy = ny; pointer.x = nx; pointer.y = ny; pointer.sy = y / ch; pointer.active = true
  if (Math.abs(pointer.vx) > 0.0008 || Math.abs(pointer.vy) > 0.0008) moveFrames = 6
  if (pointer.down && current().engine === 'fractal') { state.pan.x -= pointer.vx * (cw / ch) / state.zoom; state.pan.y -= pointer.vy / state.zoom }
}
function updatePointer() {
  if (moveFrames > 0) { moveFrames--; pointer.moving = true } else { pointer.moving = false; pointer.vx *= 0.85; pointer.vy *= 0.85 }
  if (pointer.pointers.length) for (const p of pointer.pointers) { if (moveFrames > 0) p.moving = true; else { p.moving = false; p.vx *= 0.85; p.vy *= 0.85 } }
}
window.addEventListener('mousemove', e => { pointerMove(e.clientX, e.clientY); pointer.pointers = [{ ...pointer }] })
window.addEventListener('mousedown', e => { if ((e.target as HTMLElement).closest?.('#panel')) return; pointer.down = true; pointer.repel = e.shiftKey || e.button === 2; pointer.pointers = [{ ...pointer }] })
window.addEventListener('mouseup', () => { pointer.down = false; pointer.pointers = [] })
window.addEventListener('touchstart', e => {
  if ((e.target as HTMLElement).closest?.('#panel')) return
  const t = e.touches[0]; if (!t) return; pointer.down = true; pointer.repel = e.touches.length > 1
  const nx = t.clientX / innerWidth, ny = 1 - t.clientY / innerHeight; pointer.x = nx; pointer.y = ny; pointer.sy = t.clientY / innerHeight; pointer.active = true; pointer.pointers = [{ ...pointer }]
  pointerMove(t.clientX, t.clientY)
}, { passive: true })
window.addEventListener('touchmove', e => { const t = e.touches[0]; if (t) pointerMove(t.clientX, t.clientY) }, { passive: true })
window.addEventListener('touchend', () => { pointer.down = false; pointer.pointers = [] }, { passive: true })

// --- Spotify embed lifecycle ---
function loadSpotifyEmbed(url: string) {
  const embedUrl = spotifyEmbedUrl(url) || spotifyEmbedSrc
  if (embedUrl !== url) spotifyEmbedSrc = embedUrl
  else if (url.startsWith('http')) spotifyEmbedSrc = url
  localStorage.setItem('mv.spotify.embed', spotifyEmbedSrc)
  const iframe = document.getElementById('sp-embed') as HTMLIFrameElement
  const wrap = document.getElementById('sp-embed-wrap') as HTMLElement
  if (iframe) { iframe.src = spotifyEmbedSrc; if (wrap) wrap.style.display = 'block'; }
  // also sync legacy if present
  const input = document.getElementById('sp-url') as HTMLInputElement
  if (input) input.value = url
}

function toast(msg: string, isErr = false) {
  const el = document.getElementById('toast')!
  el.textContent = msg
  el.className = isErr ? 'show err' : 'show'
  setTimeout(() => (el.className = ''), isErr ? 5000 : 2800)
  // also console for debugging
  console.log('[MusicViz]', msg)
}

// --- UI ---
mountPanel(uiRoot, MODES, {
  onMode: (v) => { if (v === 1 || v === -1) stepMode(v); else applyMode(v) },
  onRandom: randomMode,
  onDemo: async () => {
    audio.unlock()
    // robust demo: try MP3, but guarantee analyser moves even if CORS fails
    let el: any = null
    try { el = audio.useDemo(0); } catch (e) { console.warn('demo useDemo throw', e) }
    // If element errors quickly (CORS), synth will keep visuals alive; ensure synth off so real analyser drives if succeeds
    // Watch for error event within 1200ms and fallback to synth-driven rave oscillator
    let failed = false
    if (el) {
      const onErr = () => { failed = true; console.warn('demo MP3 CORS fail, fallback to WebAudio rave'); audio.setSynthetic(true); toast('Demo stream blocked by CORS — using synthesized rave (visuals still reactive). Tap File or System for real audio.', true) }
      el.addEventListener('error', onErr, { once: true })
      setTimeout(() => { el.removeEventListener('error', onErr); if (!failed && el && el.paused) { toast('Demo needs tap to play — click again') } }, 1300)
    }
    toast('Demo rave — 140 BPM • analyser wired (no login)')
    // pick a high-energy mode
    const idx = MODES.findIndex(m => m.id === 'bloom-grid')
    if (idx >= 0) applyMode(idx)
    // ensure palette is vivid
    ;(palette as any).set('vapor')
    const sel = document.getElementById('sel-pal') as HTMLSelectElement
    if (sel) sel.value = 'vapor'
  },
  onDemoNext: () => {
    try { audio.nextDemo(); toast('Next demo — ' + ((audio as any).DEMO_TRACKS?.[0]?.title || 'track')) } catch { toast('Next demo failed', true) }
  },
  onDemoStop: () => {
    try { (audio as any).disconnect?.() } catch {}
    audio.setSynthetic(true)
    toast('Demo stopped — pick System/Mic/File or Spotify')
  },
  onYouTube: async (url) => {
    // direct MP3 -> immediate
    if (url.match(/\.(mp3|ogg|wav|m4a)(\?|$)/i)) {
      try { audio.unlock(); (audio as any).useMediaElement(url, 'url: ' + url, { loop: true }); toast('Streaming MP3 — ' + url.slice(0, 48)) } catch { toast('URL play failed', true) }
      return
    }
    audio.unlock()
    const el = await audio.useYouTube(url)
    if (el) toast('YouTube wired — server resolver')
    else toast('YouTube: paste https://youtube.com/watch?v=… or use Demo/System', true)
  },
  onSpotify: (url) => {
    const embed = spotifyEmbedUrl(url)
    if (!embed) { toast('That does not look like a Spotify link (playlist/album/track)', true); return }
    loadSpotifyEmbed(url)
    toast('Spotify loaded — hit “Listen to this player” then Share tab audio')
    // auto scroll to embed
    document.getElementById('sp-embed-wrap')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  },
  onSpotifyCapture: async () => {
    audio.unlock()
    // reuse hasLiveCapture if already
    const already = (audio as any).hasLiveCapture?.()
    if (already) { toast('Using existing capture — hit play in Spotify embed'); return }
    const ok = await (audio as any).useSystemAudio?.('Spotify player', true)
    if (ok) toast('Listening to Spotify player — hit play above')
    else toast('Confirm THIS tab + tick “Share tab audio” (once)', true)
  },
  onSystem: async () => {
    audio.unlock()
    if (await audio.useSystemAudio(null as any, true)) toast('System audio linked — play something and it reacts')
    else toast('System capture cancelled or unavailable', true)
  },
  onMic: async () => {
    audio.unlock()
    if (await audio.useMicrophone()) toast('Microphone linked — speak/play out loud')
    else toast('Mic denied', true)
  },
  onFile: (f) => {
    audio.unlock()
    audio.useFile(f); toast('Playing ' + f.name)
  },
})

// load saved embed on boot
setTimeout(() => {
  const iframe = document.getElementById('sp-embed') as HTMLIFrameElement
  if (iframe && spotifyEmbedSrc) {
    iframe.src = spotifyEmbedSrc
    const wrap = document.getElementById('sp-embed-wrap') as HTMLElement
    if (wrap && localStorage.getItem('mv.spotify.embed')) wrap.style.display = 'block'
  }
}, 100)

// sliders
;(['s-gain', 's-motion', 's-react', 's-interact', 's-diss', 's-vort', 's-detail', 's-zoom', 's-morph', 's-morph-rate', 's-fly'] as const).forEach(id => {
  const el = document.getElementById(id) as HTMLInputElement; if (!el) return
  const labelMap: Record<string, string> = { 's-gain': 'v-gain', 's-motion': 'v-motion', 's-react': 'v-react', 's-interact': 'v-interact', 's-diss': 'v-diss', 's-vort': 'v-vort', 's-detail': 'v-detail', 's-zoom': 'v-zoom', 's-morph': 'v-morph', 's-morph-rate': 'v-morph-rate', 's-fly': 'v-fly' }
  el.addEventListener('input', () => {
    const v = parseFloat(el.value)
    const lab = document.getElementById(labelMap[id])
    if (id === 's-gain') { (audio as any).config.gain = v; if (lab) lab.textContent = v.toFixed(1) }
    if (id === 's-motion') { state.motion = v; if (lab) lab.textContent = v.toFixed(2) + '×' }
    if (id === 's-react') { state.reactivity = v; if (lab) lab.textContent = v.toFixed(1) }
    if (id === 's-interact') { state.interact = v / 100; if (lab) lab.textContent = Math.round(v) + '%' }
    if (id === 's-diss') { fluid.config.DENSITY_DISSIPATION = v; if (lab) lab.textContent = v.toFixed(3) }
    if (id === 's-vort') { fluid.config.CURL = v; if (lab) lab.textContent = String(Math.round(v)) }
    if (id === 's-detail') { state.detail = v / 100; if (lab) lab.textContent = Math.round(v) + '%' }
    if (id === 's-zoom') { state.zoom = Math.pow(10, v / 100); if (lab) lab.textContent = (state.zoom < 1000 ? state.zoom.toFixed(state.zoom < 10 ? 2 : 0) : state.zoom.toExponential(1)) + '×' }
    if (id === 's-morph') { fractal.setMorph(v / 100); if (lab) lab.textContent = Math.round(v) + '%' }
    if (id === 's-morph-rate') { fractal.setMorphRate(v / 100 * 2); if (lab) lab.textContent = Math.round(v) + '%' }
    if (id === 's-fly') { fractal.setFlyThrough(fractal.isFlyThrough(), v); if (lab) lab.textContent = v.toFixed(1) + '×' }
  })
})
document.getElementById('sw-fly')?.addEventListener('click', (e) => {
  const el = e.currentTarget as HTMLElement; const on = !el.classList.contains('on')
  el.classList.toggle('on', on)
  const flyEl = document.getElementById('s-fly') as HTMLInputElement
  fractal.setFlyThrough(on, parseFloat(flyEl.value)); toast(on ? 'Fly-through ON — drift through fractals (audio-coupled)' : 'Fly-through OFF')
})
// palette
document.getElementById('sel-pal')?.addEventListener('change', (e) => {
  const v = (e.target as HTMLSelectElement).value
  ;(palette as any).set(v)
  localStorage.setItem('mv.palette', v)
  toast('Palette: ' + v)
})
// reset view
document.getElementById('b-reset-view')?.addEventListener('click', () => {
  state.pan.x = 0; state.pan.y = 0; state.zoom = 1
  const s = document.getElementById('s-zoom') as HTMLInputElement
  if (s) { s.value = '0'; s.dispatchEvent(new Event('input')) }
  toast('View reset')
})

// --- boot ---
let fluidOk = false, fractalOk = false, geoOk = false
try { fluidOk = fluid.init() } catch (e) { console.error('fluid init fail', e) }
try { fractalOk = fractal.init() } catch (e) { console.error('fractal init fail', e) }
try { geoOk = geometry.init() } catch (e) { console.error('geo init fail', e) }
if (!fluidOk && !fractalOk && !geoOk) {
  toast('WebGL2 unavailable — try Chrome/Edge', true)
  const stage = document.getElementById('stage')!
  stage.innerHTML = '<div style="display:grid; place-items:center; height:100%; color:#ff4d4d; text-align:center; padding:20px;"><h2>WebGL2 unavailable</h2><p>Fluid/fractal need WebGL2 + EXT_color_buffer_float.<br/>Geometry fallback still works.</p></div>'
}
const saved = localStorage.getItem('mv.mode'); let sIdx = MODES.findIndex(m => m.id === saved); if (sIdx < 0) sIdx = 0; applyMode(sIdx)
const savedPal = localStorage.getItem('mv.palette'); if (savedPal) { (palette as any).set(savedPal); const sel = document.getElementById('sel-pal') as HTMLSelectElement; if (sel) sel.value = savedPal }

// ensure synthetic is on until real source connects — so visuals never freeze
audio.setSynthetic(true)
audio.onStatus((k: string, d: string) => {
  const dot = document.querySelector('#s-status .dot') as HTMLElement
  const txt = document.getElementById('s-text') as HTMLElement
  if (!dot || !txt) return
  if (k === 'connected' || k === 'audible') { dot.className = 'dot live'; txt.textContent = 'Listening to ' + d; audio.setSynthetic(false) }
  else if (k === 'silent') { dot.className = 'dot warn'; txt.textContent = 'Connected but silent — ' + d }
  else if (k === 'ended') { dot.className = 'dot'; txt.textContent = 'Capture stopped'; audio.setSynthetic(true) }
  else if (k === 'error') { dot.className = 'dot err'; txt.textContent = d; toast(d, true) }
})

// unlock on first gesture (iOS)
const unlock = () => { audio.unlock(); window.removeEventListener('touchend', unlock); window.removeEventListener('mousedown', unlock); window.removeEventListener('keydown', unlock) }
window.addEventListener('touchend', unlock, { passive: true } as any)
window.addEventListener('mousedown', unlock as any)
window.addEventListener('keydown', unlock as any)

// --- Three scene for XR (also drives geometry when in VR) ---
const threeCanvas = document.createElement('canvas')
const threeRenderer = new THREE.WebGLRenderer({ canvas: threeCanvas, antialias: true, alpha: false })
threeRenderer.setPixelRatio(Math.min(devicePixelRatio, 2))
const threeScene = new THREE.Scene(); threeScene.background = new THREE.Color(0x000000)
const threeCamera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 100); threeCamera.position.z = 2
const xr = new XRManager(threeRenderer, threeScene, threeCamera)
xr.available().then(ok => {
  const b = document.getElementById('b-vr') as HTMLButtonElement
  if (!ok || !b) return
  b.hidden = false
  b.addEventListener('click', async () => {
    if (xr.isActive()) xr.stop()
    else {
      try {
        await xr.start((active: boolean) => { b.textContent = active ? 'Exit VR' : 'Enter VR 6DOF' })
        toast('6DOF: thumbstick fly · grip drag · pinch')
      } catch (e: any) { toast('VR failed: ' + (e as Error).message, true) }
    }
  })
})

// --- loop (vt motion clock) ---
let last = performance.now(), vt = 0
const ctx: any = { t: 0, dt: 0, m: null, k: 1, depth: 1, interact: 1, layerOn: { sub: true, mid: true, high: true, air: true }, pointer, band: (k: string) => ctx.m.band[k], n: (k: string) => ctx.m.band[k].norm, e: (k: string) => ctx.m.band[k].env }

function loop(now: number, xrFrame?: any) {
  const dt = Math.min((now - last) / 1000, 0.033) * state.motion; last = now; vt += dt * 1000
  const m = audio.update(now); (palette as any).updateMusic(m); updatePointer()
  ctx.t = vt; ctx.dt = dt; ctx.m = m; ctx.k = state.reactivity; ctx.depth = state.depth; ctx.interact = state.interact

  const mode = current()
  try {
    if (mode.engine === 'fluid' && fluidOk) {
      fluid.beginFrame()
      const bass = m.band.bass.norm, mid = m.band.mid.norm
      if ((mode as any).id === 'spectrum-fountain') {
        const N = 24, step = m.bandsNorm.length / N
        for (let i = 0; i < 12; i++) { const v = m.bandsNorm[Math.floor(i * step)]; if (v < 0.12) continue; fluid.splat((i + 0.5) / N, 0.03, (Math.random() - 0.5) * 3, v * 78 * state.reactivity, palette.hdr(i / N * 0.8, 3.2), 0.6 + v) }
      } else {
        const t = vt * 0.0009 * (0.5 + mid * 1.6); for (let i = 0; i < 3; i++) { const a = t + Math.PI * 2 * (i / 3); const r = 0.26 + bass * 0.12; fluid.splat(0.5 + Math.cos(a) * r, 0.5 + Math.sin(a) * r, -Math.sin(a) * 8 * state.reactivity, Math.cos(a) * 8 * state.reactivity, palette.hdr(0.33 + i / 3 * 0.1, 3), 0.8) }
      }
      if (pointer.active && state.interact > 0) for (const p of (pointer.pointers.length ? pointer.pointers : [pointer])) if (p.active) fluid.splat(p.x, p.y, p.vx * 5 * state.interact, p.vy * 5 * state.interact, palette.hdr(0, 1), 1.0)
      const ap = fluid.applyAudioParams(m, state.reactivity); fluid.solve(dt, ap.vort, ap.diss, state.fractalFold >= 0 ? state.fractalFold : ((mode as any).fractal || 0), vt)
    } else if (mode.engine === 'fractal' && fractalOk) {
      const ft = vt * ((mode as any).timeScale ?? 1); fractal.juliaSeed(vt * 0.0001, m, vt)
      fractal.render(mode as any, m, pointer, { time: ft, stamp: vt, interact: state.interact, detail: state.detail, zoom: state.zoom, pan: state.pan, hover: 1, bg: 1, bgAmt: 1, wall: now, key: false, role: 1, events: state.evt.map((e: any) => ({ x: e.x, y: e.y, kind: e.kind, age: (now - e.at) / 1000 })) })
    } else if (mode.engine === 'geometry' && geoOk) {
      geometry.frame(vt, m, ctx)
      if ((mode.id as string).startsWith('hybrid') || (mode as any).id === 'bloom-grid') {
        if (m.beat && fluidOk) fluid.splat(0.5, 0.5, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10, palette.hdr(Math.random(), 3.2))
      }
    }
  } catch (e) { console.error('frame error', e) }

  // meters — now correct keys (subBass etc.)
  document.querySelectorAll('#meters i').forEach(el => {
    const band = (el as HTMLElement).dataset.band as any
    const b = (m.band as any)[band]
    ;(el as HTMLElement).style.height = Math.min(100, (b ? b.env : 0) * 100) + '%'
  })
  const bpmEl = document.getElementById('bpm'); if (bpmEl && m.bpm) bpmEl.textContent = `Tempo ${m.bpm} BPM${m.synthetic && !m.live ? ' (synthetic)' : ''} · centroid ${Math.round(m.centroid * 100)}%`

  if (xrFrame) xr.handleInput(xrFrame)
  xr.raf(loop as any)
}
xr.raf(loop as any)

// expose for hybrid fluid seeding + debug
;(window as any).FluidSimInstance = fluid
;(window as any).audio = audio
;(window as any).palette = palette
console.log('[MusicViz] greenfield booted — modes:', MODES.map(m => m.id).join(', '))
