/**
 * VRPanel — the in-headset control surface.
 *
 * DOM UI does not exist inside an immersive XR session, so the whole drawer is drawn
 * onto a 2D canvas, mapped onto a world-space plane, and hit-tested by converting the
 * controller ray's UV back into canvas pixels. One canvas, one plane, one region list.
 *
 * Collapsed it shrinks to a title bar with the Exit VR button still reachable.
 */
import * as THREE from 'three'

const W = 1024, H = 700

export type SliderKey = 'gain' | 'motion' | 'react' | 'fly'

export type VRPanelActions = {
  exitVR(): void
  setMode(idx: number): void
  stepMode(d: number): void
  randomMode(): void
  setPalette(name: string): void
  setSlider(key: SliderKey, value: number): void
  demo(): void
  demoNext(): void
  demoStop(): void
}

export type VRPanelState = {
  modes: { name: string }[]
  modeIdx: number
  palettes: string[]
  palette: string
  sliders: Record<SliderKey, { v: number; min: number; max: number; label: string; fmt: (v: number) => string }>
  track: string
  bpm: number
  live: boolean
  meters: number[]
}

type Region = { id: string; x: number; y: number; w: number; h: number; slider?: SliderKey }

const PER_PAGE = 8

export class VRPanel {
  readonly mesh: THREE.Mesh
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private tex: THREE.CanvasTexture
  private regions: Region[] = []
  private hovered: string | null = null
  private collapsed = false
  private page = 0
  private sig = ''
  private lastDraw = 0
  private state: VRPanelState | null = null
  private acts: VRPanelActions

  constructor(actions: VRPanelActions) {
    this.acts = actions
    this.canvas = document.createElement('canvas')
    this.canvas.width = W; this.canvas.height = H
    this.ctx = this.canvas.getContext('2d')!
    this.tex = new THREE.CanvasTexture(this.canvas)
    this.tex.minFilter = THREE.LinearFilter
    this.tex.magFilter = THREE.LinearFilter
    this.mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1.4, 1.4 * (H / W)),
      new THREE.MeshBasicMaterial({ map: this.tex, transparent: true, depthWrite: false, side: THREE.DoubleSide })
    )
    this.mesh.renderOrder = 999
  }

  setHover(id: string | null) { if (id !== this.hovered) { this.hovered = id; this.sig = '' } }
  isCollapsed() { return this.collapsed }

  /** Soft-follow: the panel only chases you once you have looked well away from it. */
  follow(camera: THREE.Camera, dt: number) {
    const camPos = camera.getWorldPosition(new THREE.Vector3())
    const fwd = camera.getWorldDirection(new THREE.Vector3())
    const target = camPos.clone().addScaledVector(fwd, 1.5)
    target.y -= 0.12
    const toPanel = this.mesh.position.clone().sub(camPos)
    const off = toPanel.lengthSq() < 1e-6 ? 99 : fwd.angleTo(toPanel.normalize())
    // 32° dead zone so it stays put while you look around, then eases back into view
    if (off > 0.56) this.mesh.position.lerp(target, Math.min(1, dt * 2.2))
    else if (this.mesh.position.distanceTo(camPos) > 3) this.mesh.position.copy(target)
    this.mesh.lookAt(camPos)
  }

  placeInFrontOf(camera: THREE.Camera) {
    const camPos = camera.getWorldPosition(new THREE.Vector3())
    const fwd = camera.getWorldDirection(new THREE.Vector3())
    this.mesh.position.copy(camPos).addScaledVector(fwd, 1.5)
    this.mesh.position.y -= 0.12
    this.mesh.lookAt(camPos)
  }

  /** canvas-space hit test from a UV on the plane */
  hit(uv: THREE.Vector2): string | null {
    const x = uv.x * W, y = (1 - uv.y) * H
    for (const r of this.regions) if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) return r.id
    return null
  }

  /** run whatever the ray was pointing at */
  activate(uv: THREE.Vector2) {
    const x = uv.x * W, y = (1 - uv.y) * H
    const r = this.regions.find(r => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h)
    if (!r || !this.state) return
    const s = this.state
    if (r.slider) {
      const cfg = s.sliders[r.slider]
      const u = Math.max(0, Math.min(1, (x - r.x) / r.w))
      this.acts.setSlider(r.slider, cfg.min + u * (cfg.max - cfg.min))
    }
    else if (r.id === 'collapse') this.collapsed = !this.collapsed
    else if (r.id === 'exit') this.acts.exitVR()
    else if (r.id === 'prev') this.acts.stepMode(-1)
    else if (r.id === 'next') this.acts.stepMode(1)
    else if (r.id === 'rand') this.acts.randomMode()
    else if (r.id === 'page-') this.page = Math.max(0, this.page - 1)
    else if (r.id === 'page+') this.page = Math.min(Math.ceil(s.modes.length / PER_PAGE) - 1, this.page + 1)
    else if (r.id === 'demo') this.acts.demo()
    else if (r.id === 'demo-next') this.acts.demoNext()
    else if (r.id === 'demo-stop') this.acts.demoStop()
    else if (r.id.startsWith('mode:')) this.acts.setMode(parseInt(r.id.slice(5), 10))
    else if (r.id.startsWith('pal:')) this.acts.setPalette(r.id.slice(4))
    this.sig = ''
  }

  update(state: VRPanelState, now: number) {
    this.state = state
    // Keep the mode grid on the page holding the active mode
    const sig = [
      this.collapsed, this.hovered, this.page, state.modeIdx, state.palette, state.track, state.live,
      ...(Object.keys(state.sliders) as SliderKey[]).map(k => state.sliders[k].v.toFixed(2))
    ].join('|')
    // redraw on change, plus ~10fps for the meters and tempo readout
    if (sig !== this.sig || now - this.lastDraw > 100) {
      this.sig = sig; this.lastDraw = now
      this.draw(state)
      this.tex.needsUpdate = true
    }
  }

  // --- drawing -----------------------------------------------------------
  private box(x: number, y: number, w: number, h: number, r = 10) {
    const c = this.ctx
    c.beginPath()
    if ((c as any).roundRect) (c as any).roundRect(x, y, w, h, r)
    else c.rect(x, y, w, h)
  }
  private btn(id: string, label: string, x: number, y: number, w: number, h: number, o?: { on?: boolean; accent?: boolean; size?: number }) {
    const c = this.ctx, hot = this.hovered === id
    this.box(x, y, w, h)
    c.fillStyle = o?.accent
      ? (hot ? 'rgba(255,72,110,0.55)' : 'rgba(255,72,110,0.3)')
      : o?.on ? (hot ? 'rgba(0,240,255,0.5)' : 'rgba(0,240,255,0.3)')
        : (hot ? 'rgba(255,255,255,0.24)' : 'rgba(255,255,255,0.08)')
    c.fill()
    c.strokeStyle = hot ? 'rgba(0,240,255,0.95)' : 'rgba(255,255,255,0.2)'
    c.lineWidth = 2; c.stroke()
    c.fillStyle = o?.on ? '#0ff' : '#e9edff'
    c.font = `600 ${o?.size || 25}px system-ui, -apple-system, sans-serif`
    c.textAlign = 'center'; c.textBaseline = 'middle'
    c.fillText(label, x + w / 2, y + h / 2 + 1)
    this.regions.push({ id, x, y, w, h })
  }
  private label(text: string, x: number, y: number, size = 20, color = '#7f8db5', align: CanvasTextAlign = 'left') {
    const c = this.ctx
    c.fillStyle = color; c.font = `700 ${size}px system-ui, -apple-system, sans-serif`
    c.textAlign = align; c.textBaseline = 'middle'
    c.fillText(text, x, y)
  }

  private draw(s: VRPanelState) {
    const c = this.ctx
    this.regions = []
    c.clearRect(0, 0, W, H)

    const bodyH = this.collapsed ? 84 : H
    // shell
    this.box(0, 0, W, bodyH, 18)
    c.fillStyle = 'rgba(8,10,22,0.88)'; c.fill()
    c.strokeStyle = 'rgba(0,240,255,0.35)'; c.lineWidth = 3; c.stroke()

    // header
    this.btn('collapse', this.collapsed ? '▸' : '▾', 18, 14, 60, 56)
    this.label('MusicViz', 96, 42, 28, '#ffffff')
    const status = s.live ? s.track : s.track + '  (no live audio)'
    this.label(status.slice(0, 42), 250, 42, 21, s.live ? '#00f0ff' : '#ffb04a')
    if (s.bpm) this.label(`${s.bpm} BPM`, 700, 42, 21, '#7f8db5')
    this.btn('exit', '✕  Exit VR', W - 210, 14, 192, 56, { accent: true })

    if (this.collapsed) return

    // --- mode ---
    this.label('MODE', 24, 108)
    this.btn('prev', '‹', 24, 128, 64, 56)
    this.btn('next', '›', 96, 128, 64, 56)
    this.btn('rand', '⟲ Random', 168, 128, 150, 56)
    this.label(s.modes[s.modeIdx]?.name || '', 334, 156, 26, '#ffffff')

    const pages = Math.max(1, Math.ceil(s.modes.length / PER_PAGE))
    this.page = Math.min(this.page, pages - 1)
    const start = this.page * PER_PAGE
    const cw = 235, ch = 56
    for (let i = 0; i < PER_PAGE; i++) {
      const idx = start + i
      if (idx >= s.modes.length) break
      const x = 24 + (i % 4) * (cw + 12), y = 198 + Math.floor(i / 4) * (ch + 10)
      const name = s.modes[idx].name
      this.btn('mode:' + idx, name.length > 20 ? name.slice(0, 19) + '…' : name, x, y, cw, ch, { on: idx === s.modeIdx, size: 20 })
    }
    this.btn('page-', '‹ Page', 24, 326, 120, 44, { size: 20 })
    this.label(`${this.page + 1} / ${pages}   ·   ${s.modes.length} modes`, W / 2, 348, 20, '#7f8db5', 'center')
    this.btn('page+', 'Page ›', W - 144, 326, 120, 44, { size: 20 })

    // --- palette ---
    this.label('PALETTE', 24, 396)
    const pw = Math.floor((W - 48 - 6 * 10) / 7)
    s.palettes.slice(0, 7).forEach((p, i) => {
      this.btn('pal:' + p, p, 24 + i * (pw + 10), 414, pw, 50, { on: p === s.palette, size: 20 })
    })

    // --- sliders ---
    const keys: SliderKey[] = ['gain', 'motion', 'react', 'fly']
    keys.forEach((k, i) => {
      const cfg = s.sliders[k]
      const y = 492 + i * 46, trackX = 250, trackW = 620, h = 36
      this.label(cfg.label, 24, y + h / 2, 21, '#e9edff')
      this.box(trackX, y + 10, trackW, 16, 8)
      c.fillStyle = 'rgba(255,255,255,0.1)'; c.fill()
      const u = Math.max(0, Math.min(1, (cfg.v - cfg.min) / (cfg.max - cfg.min)))
      this.box(trackX, y + 10, Math.max(6, trackW * u), 16, 8)
      c.fillStyle = this.hovered === 'sl:' + k ? '#4ff8ff' : '#00c8dd'; c.fill()
      c.beginPath(); c.arc(trackX + trackW * u, y + 18, 13, 0, Math.PI * 2)
      c.fillStyle = '#ffffff'; c.fill()
      this.label(cfg.fmt(cfg.v), 900, y + h / 2, 21, '#00f0ff')
      this.regions.push({ id: 'sl:' + k, x: trackX, y, w: trackW, h, slider: k })
    })

    // --- audio ---
    this.label('AUDIO', 24, 648)
    this.btn('demo', '▶ Demo', 100, 626, 150, 50, { size: 21 })
    this.btn('demo-next', 'Next', 260, 626, 110, 50, { size: 21 })
    this.btn('demo-stop', '■ Stop', 380, 626, 110, 50, { size: 21 })
    const mx = 520, mw = W - 24 - mx, bw = mw / s.meters.length
    s.meters.forEach((v, i) => {
      const bh = Math.max(3, Math.min(1, v) * 46)
      c.fillStyle = `hsl(${190 + i * 14} 100% ${45 + v * 25}%)`
      c.fillRect(mx + i * bw + 2, 674 - bh, bw - 5, bh)
    })
  }

  dispose() {
    this.tex.dispose()
    this.mesh.geometry.dispose()
    ;(this.mesh.material as THREE.Material).dispose()
  }

  /**
   * Round-trips UV → canvas → region → action for the controls that must not break:
   * Exit VR (reachable expanded *and* collapsed) and slider value mapping.
   * Returns a list of failures; empty means healthy.
   */
  static selfCheck(): string[] {
    const errs: string[] = []
    const fired: string[] = []
    const p = new VRPanel({
      exitVR: () => fired.push('exit'),
      setMode: i => fired.push('mode:' + i),
      stepMode: d => fired.push('step:' + d),
      randomMode: () => fired.push('rand'),
      setPalette: n => fired.push('pal:' + n),
      setSlider: (k, v) => fired.push(`sl:${k}:${v.toFixed(2)}`),
      demo: () => fired.push('demo'), demoNext: () => { }, demoStop: () => { },
    })
    const sl = (label: string, min: number, max: number, v: number) =>
      ({ v, min, max, label, fmt: (x: number) => x.toFixed(2) })
    const st: VRPanelState = {
      modes: Array.from({ length: 36 }, (_, i) => ({ name: 'Mode ' + i })), modeIdx: 3,
      palettes: ['rainbow', 'neon', 'vapor', 'aurora', 'magma', 'mono', 'album'], palette: 'neon',
      sliders: { gain: sl('Gain', 0.2, 4, 1.2), motion: sl('Motion', 0.15, 2, 0.55), react: sl('React', 0.2, 2.5, 1), fly: sl('Fly', 0.2, 3, 1) },
      track: 'test', bpm: 128, live: true, meters: [0, 0, 0, 0, 0, 0, 0],
    }
    const uv = (x: number, y: number) => new THREE.Vector2(x / W, 1 - y / H)

    p.update(st, 0)
    const exitUV = uv(W - 210 + 96, 42)
    if (p.hit(exitUV) !== 'exit') errs.push('Exit VR region missing when expanded')
    p.activate(exitUV)
    if (!fired.includes('exit')) errs.push('Exit VR did not fire')

    // far right of the gain track must map to (near) the maximum
    p.activate(uv(250 + 620 - 3, 492 + 18))
    if (!fired.some(f => /^sl:gain:(3\.9|4\.00)/.test(f))) errs.push('slider UV mapping wrong: ' + fired.join(','))

    // the whole point of collapsing: Exit VR must survive it
    p.activate(uv(48, 42))
    p.update(st, 200)
    if (!p.isCollapsed()) errs.push('collapse toggle did not take')
    if (p.hit(exitUV) !== 'exit') errs.push('Exit VR unreachable while collapsed')

    p.dispose()
    return errs
  }
}
