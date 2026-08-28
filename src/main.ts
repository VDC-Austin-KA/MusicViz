/**
 * MusicViz — greenfield Vite + TS + Three entry
 * High-impact minimalism (DesLauriers), Boller flower, Teoxoy rings
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
  ;(document.getElementById('sel-mode') as HTMLSelectElement).value = String(idx)
  fluidCanvas.classList.toggle('inactive', m.engine !== 'fluid')
  fractalCanvas.classList.toggle('inactive', m.engine !== 'fractal')
  geoCanvas.classList.toggle('inactive', m.engine !== 'geometry')
  if (m.engine === 'fluid') { fluid.resize(); if (m.physics) { fluid.config.DENSITY_DISSIPATION = m.physics.diss; fluid.config.CURL = m.physics.vort; fluid.config.VISCOSITY = m.physics.visc; fluid.config.SPLAT_RADIUS = m.physics.radius } fluid.clear() }
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
  const el = activeCanvas(); const cw = el.clientWidth || innerWidth, ch = el.clientHeight || innerHeight
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

// --- UI ---
mountPanel(uiRoot, MODES, {
  onMode: (v) => { if (v === 1 || v === -1) stepMode(v); else applyMode(v) },
  onRandom: randomMode,
  onDemo: async () => { audio.unlock(); audio.useDemo(0); toast('Demo rave — 140 BPM, analyser wired'); applyMode(MODES.findIndex(m => m.id === 'bloom-grid')) },
  onDemoNext: () => { audio.nextDemo(); toast('Next demo') },
  onDemoStop: () => { (audio as any).disconnect?.(); toast('Demo stopped') },
  onYouTube: async (url) => { const el = await audio.useYouTube(url); if (el) toast('YouTube wired') },
  onSystem: async () => { if (await audio.useSystemAudio(null as any, true)) toast('System audio linked') },
  onMic: async () => { if (await audio.useMicrophone()) toast('Microphone linked') },
  onFile: (f) => { audio.useFile(f); toast('Playing ' + f.name) },
})

// sliders
;(['s-gain', 's-motion', 's-react', 's-interact', 's-diss', 's-vort', 's-detail', 's-zoom', 's-morph', 's-morph-rate', 's-fly'] as const).forEach(id => {
  const el = document.getElementById(id) as HTMLInputElement; if (!el) return
  el.addEventListener('input', () => {
    const v = parseFloat(el.value)
    if (id === 's-gain') (audio as any).config.gain = v
    if (id === 's-motion') state.motion = v
    if (id === 's-react') state.reactivity = v
    if (id === 's-interact') state.interact = v / 100
    if (id === 's-diss') fluid.config.DENSITY_DISSIPATION = v
    if (id === 's-vort') fluid.config.CURL = v
    if (id === 's-detail') state.detail = v / 100
    if (id === 's-zoom') state.zoom = Math.pow(10, v / 100)
    if (id === 's-morph') fractal.setMorph(v / 100)
    if (id === 's-morph-rate') fractal.setMorphRate(v / 100 * 2)
    if (id === 's-fly') fractal.setFlyThrough(fractal.isFlyThrough(), v)
  })
})
document.getElementById('sw-fly')?.addEventListener('click', (e) => {
  const on = !(e.currentTarget as HTMLElement).classList.contains('on')
  ;(e.currentTarget as HTMLElement).classList.toggle('on', on)
  fractal.setFlyThrough(on, parseFloat((document.getElementById('s-fly') as HTMLInputElement).value)); toast(on ? 'Fly-through ON' : 'Fly-through OFF')
})

function toast(msg: string) {
  const el = document.getElementById('toast')!; el.textContent = msg; el.classList.add('show'); setTimeout(() => el.classList.remove('show'), 2500)
}

// --- boot ---
fluid.init(); fractal.init(); geometry.init()
const saved = localStorage.getItem('mv.mode'); let sIdx = MODES.findIndex(m => m.id === saved); if (sIdx < 0) sIdx = 0; applyMode(sIdx)
audio.onStatus((k, d) => {
  const dot = document.querySelector('#s-status .dot') as HTMLElement; const txt = document.getElementById('s-text')!
  if (k === 'connected' || k === 'audible') { dot.className = 'dot live'; txt.textContent = 'Listening to ' + d }
  else if (k === 'error') { dot.className = 'dot err'; txt.textContent = d }
})

// --- Three scene for XR (also drives geometry when in VR) ---
const threeCanvas = document.createElement('canvas')
const threeRenderer = new THREE.WebGLRenderer({ canvas: threeCanvas, antialias: true, alpha: false })
threeRenderer.setPixelRatio(Math.min(devicePixelRatio, 2))
const threeScene = new THREE.Scene(); threeScene.background = new THREE.Color(0x000000)
const threeCamera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 100); threeCamera.position.z = 2
const xr = new XRManager(threeRenderer, threeScene, threeCamera)
xr.available().then(ok => { const b = document.getElementById('b-vr') as HTMLButtonElement; if (!ok || !b) return; b.hidden = false; b.addEventListener('click', async () => { if (xr.isActive()) xr.stop(); else { try { await xr.start((active) => { b.textContent = active ? 'Exit VR' : 'Enter VR 6DOF' }); toast('6DOF: thumbstick fly · grip drag · pinch') } catch (e: any) { toast('VR failed: ' + (e as Error).message) } } }) })

// --- loop (vt motion clock) ---
let last = performance.now(), vt = 0
const ctx: any = { t: 0, dt: 0, m: null, k: 1, depth: 1, interact: 1, layerOn: { sub: true, mid: true, high: true, air: true }, pointer, band: (k: string) => ctx.m.band[k], n: (k: string) => ctx.m.band[k].norm, e: (k: string) => ctx.m.band[k].env }

function loop(now: number, xrFrame?: any) {
  const dt = Math.min((now - last) / 1000, 0.033) * state.motion; last = now; vt += dt * 1000
  const m = audio.update(now); (palette as any).updateMusic(m); updatePointer()
  ctx.t = vt; ctx.dt = dt; ctx.m = m; ctx.k = state.reactivity; ctx.depth = state.depth; ctx.interact = state.interact

  const mode = current()
  // fluid driver: simple demo drive if mode has no custom drive
  if (mode.engine === 'fluid') {
    fluid.beginFrame()
    // minimal audio-reactive splat if no mode drive
    const bass = m.band.bass.norm, mid = m.band.mid.norm
    if (mode.id === 'spectrum-fountain') {
      const N = 24, step = m.bandsNorm.length / N
      for (let i = 0; i < 12; i++) { const v = m.bandsNorm[Math.floor(i * step)]; if (v < 0.12) continue; fluid.splat((i + 0.5) / N, 0.03, (Math.random() - 0.5) * 3, v * 78 * state.reactivity, palette.hdr(i / N * 0.8, 3.2), 0.6 + v) }
    } else {
      // default orbiting
      const t = vt * 0.0009 * (0.5 + mid * 1.6); for (let i = 0; i < 3; i++) { const a = t + Math.PI * 2 * (i / 3); const r = 0.26 + bass * 0.12; fluid.splat(0.5 + Math.cos(a) * r, 0.5 + Math.sin(a) * r, -Math.sin(a) * 8 * state.reactivity, Math.cos(a) * 8 * state.reactivity, palette.hdr(0.33 + i / 3 * 0.1, 3), 0.8) }
    }
    // pointer
    if (pointer.active && state.interact > 0) for (const p of (pointer.pointers.length ? pointer.pointers : [pointer])) if (p.active) fluid.splat(p.x, p.y, p.vx * 5 * state.interact, p.vy * 5 * state.interact, palette.hdr(0, 1), 1.0)
    const ap = fluid.applyAudioParams(m, state.reactivity); fluid.solve(dt, ap.vort, ap.diss, state.fractalFold >= 0 ? state.fractalFold : (mode.fractal || 0), vt)
  } else if (mode.engine === 'fractal') {
    const ft = vt * (mode.timeScale ?? 1); fractal.juliaSeed(vt * 0.0001, m, vt)
    fractal.render(mode as any, m, pointer, { time: ft, stamp: vt, interact: state.interact, detail: state.detail, zoom: state.zoom, pan: state.pan, hover: 1, bg: 1, bgAmt: 1, wall: now, key: false, role: 1, events: state.evt.map((e: any) => ({ x: e.x, y: e.y, kind: e.kind, age: (now - e.at) / 1000 })) })
  } else if (mode.engine === 'geometry') {
    geometry.frame(vt, m, ctx)
    // keep fluid warm for hybrid
    if ((mode.id as string).startsWith('hybrid') && m.beat) fluid.splat(0.5, 0.5, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10, palette.hdr(Math.random(), 3.2))
  }

  // meters
  document.querySelectorAll('#meters i').forEach(el => {
    const band = (el as HTMLElement).dataset.band as any; const key = band === 'sub' ? 'subBass' : band === 'low' ? 'lowMid' : band === 'hi' ? 'highMid' : band === 'pres' ? 'presence' : band
    const b = (m.band as any)[key]; (el as HTMLElement).style.height = Math.min(100, (b ? b.env : 0) * 100) + '%'
  })
  const bpmEl = document.getElementById('bpm'); if (bpmEl && m.bpm) bpmEl.textContent = `Tempo ${m.bpm} BPM · centroid ${Math.round(m.centroid * 100)}%`

  if (xrFrame) xr.handleInput(xrFrame)
  xr.raf(loop as any)
}
xr.raf(loop as any)

// expose for hybrid fluid seeding
;(window as any).FluidSimInstance = fluid
