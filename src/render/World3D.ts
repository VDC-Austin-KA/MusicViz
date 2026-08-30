/**
 * World3D — the 3D flight renderer.
 *
 * Holds one scene, the camera, and the two ways of moving through it (desktop bird
 * flight and WebXR 6DOF). The scene *content* comes from worlds3d.ts — a different
 * bespoke world per visualizer mode, swapped by setWorld().
 */
import * as THREE from 'three'
import { Palette } from '../core/Palette'
import { WORLDS, WorldSpec } from './worlds3d'

export class World3D {
  private renderer: THREE.WebGLRenderer
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private palette: Palette

  private group = new THREE.Group()
  private spec: WorldSpec | null = null
  private worldId = ''
  private store: any = {}

  private xrSession: XRSession | null = null
  private refSpace: XRReferenceSpace | null = null
  private xrActive = false
  private onXRChange?: (active: boolean) => void

  private flightActive = false
  private pos = new THREE.Vector3(0, 0, 18)
  private vel = new THREE.Vector3()
  private euler = new THREE.Euler(0, 0, 0, 'YXZ')
  private keys: Record<string, boolean> = {}
  private locked = false

  constructor(canvas: HTMLCanvasElement, palette: Palette) {
    this.palette = palette
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    this.renderer.xr.enabled = true

    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x03030a)
    this.scene.add(this.group)

    this.camera = new THREE.PerspectiveCamera(72, window.innerWidth / window.innerHeight, 0.1, 600)
    this.camera.position.copy(this.pos)

    window.addEventListener('keydown', e => { this.keys[e.code] = true })
    window.addEventListener('keyup', e => { this.keys[e.code] = false })
    window.addEventListener('mousemove', e => {
      if (!this.locked || !this.flightActive) return
      this.euler.y -= e.movementX * 0.0022
      this.euler.x -= e.movementY * 0.0022
      this.euler.x = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, this.euler.x))
    })
    document.addEventListener('pointerlockchange', () => {
      this.locked = document.pointerLockElement !== null
      // Esc releases the pointer — land the bird rather than leave it flying blind.
      if (!this.locked) this.flightActive = false
    })
  }

  // --- world swapping ---
  setWorld(id: string) {
    if (id === this.worldId) return
    this.disposeWorld()
    this.spec = WORLDS[id] || null
    this.worldId = id
    this.store = {}
    if (!this.spec) return
    this.spec.build({ group: this.group, palette: this.palette, store: this.store })
    this.scene.fog = this.spec.fog ? new THREE.FogExp2(this.spec.bg ?? 0x03030a, this.spec.fog) : null
    this.scene.background = new THREE.Color(this.spec.bg ?? 0x03030a)
    const s = this.spec.spawn || [0, 0, 18]
    this.pos.set(s[0], s[1], s[2])
    this.vel.set(0, 0, 0)
    this.euler.set(0, 0, 0)
  }

  private disposeWorld() {
    this.group.traverse(o => {
      const a = o as any
      a.geometry?.dispose?.()
      const m = a.material
      if (Array.isArray(m)) m.forEach((x: any) => x.dispose?.())
      else m?.dispose?.()
    })
    this.group.clear()
  }

  // --- WebXR ---
  async isVRAvailable(): Promise<boolean> {
    if (!navigator.xr || !(navigator.xr as any).isSessionSupported) return false
    try { return await (navigator.xr as any).isSessionSupported('immersive-vr') } catch { return false }
  }
  isVRActive() { return this.xrActive && !!this.xrSession }

  async startVR(onChange?: (active: boolean) => void) {
    this.onXRChange = onChange
    if (!navigator.xr) throw new Error('WebXR not supported in this browser')
    this.xrSession = await (navigator.xr as any).requestSession('immersive-vr', {
      optionalFeatures: ['local-floor', 'bounded-floor', 'hand-tracking']
    })
    await this.renderer.xr.setSession(this.xrSession as any)
    try { this.refSpace = await (this.xrSession as any).requestReferenceSpace('local-floor') }
    catch { this.refSpace = await (this.xrSession as any).requestReferenceSpace('local') }
    this.xrActive = true
    onChange?.(true)
    this.xrSession!.addEventListener('end', () => {
      this.xrActive = false; this.xrSession = null; this.refSpace = null
      this.onXRChange?.(false)
    })
    return this.xrSession
  }
  stopVR() { if (this.xrSession) (this.xrSession as any).end() }

  // --- desktop bird flight ---
  requestFlightPointerLock() { this.flightActive = true; document.body.requestPointerLock?.() }
  setDesktopFlight(active: boolean) {
    this.flightActive = active
    if (active) document.body.requestPointerLock?.()
    else if (this.locked) document.exitPointerLock?.()
  }
  isDesktopFlightActive() { return this.flightActive }
  toggleDesktopFlight(): boolean { this.setDesktopFlight(!this.flightActive); return this.flightActive }

  private flyDesktop(dt: number, speedScale: number) {
    const fwd = new THREE.Vector3(0, 0, -1).applyEuler(this.euler)
    const right = new THREE.Vector3(1, 0, 0).applyEuler(this.euler)
    const up = new THREE.Vector3(0, 1, 0)
    const a = new THREE.Vector3()
    const boost = (this.keys['ShiftLeft'] || this.keys['ShiftRight']) ? 2.5 : 1
    if (this.keys['KeyW'] || this.keys['ArrowUp']) a.add(fwd)
    if (this.keys['KeyS'] || this.keys['ArrowDown']) a.sub(fwd)
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) a.sub(right)
    if (this.keys['KeyD'] || this.keys['ArrowRight']) a.add(right)
    if (this.keys['Space']) a.add(up)
    if (this.keys['KeyC'] || this.keys['ControlLeft']) a.sub(up)
    if (a.lengthSq() > 0) this.vel.lerp(a.normalize().multiplyScalar(14 * boost * speedScale), 0.1)
    else this.vel.multiplyScalar(0.92) // air drag
    this.pos.addScaledVector(this.vel, dt)
    this.camera.position.copy(this.pos)
    this.camera.quaternion.setFromEuler(this.euler)
  }

  private flyXR(dt: number, speedScale: number) {
    if (!this.xrSession) return
    for (const src of Array.from((this.xrSession as any).inputSources || []) as any[]) {
      const gp = src.gamepad
      if (!gp) continue
      const ax = gp.axes[2] ?? gp.axes[0] ?? 0, ay = gp.axes[3] ?? gp.axes[1] ?? 0
      if (Math.abs(ax) > 0.15 || Math.abs(ay) > 0.15) {
        const dir = new THREE.Vector3(ax, 0, ay).applyQuaternion(this.camera.quaternion)
        this.pos.addScaledVector(dir, 10 * speedScale * dt)
      }
      // trigger = soar in whatever direction you're looking
      const trig = gp.buttons?.[0]
      if (trig?.pressed) {
        const gaze = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion)
        this.pos.addScaledVector(gaze, 20 * (trig.value || 1) * speedScale * dt)
      }
    }
    // in XR the headset owns the camera; we move the world under the rig instead
    this.group.position.set(-this.pos.x, -this.pos.y, -this.pos.z)
  }

  resize() {
    const w = window.innerWidth, h = window.innerHeight
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(w, h, false)
  }

  // Three's loop drives rAF on desktop and the XRSession loop once in VR — one loop, both worlds.
  setLoop(cb: (t: number, frame?: XRFrame) => void) {
    this.renderer.setAnimationLoop(cb as any)
  }

  render(m: any, dt: number, speedScale = 1) {
    if (!this.spec) return
    if (this.isVRActive()) this.flyXR(dt, speedScale)
    else if (this.flightActive) this.flyDesktop(dt, speedScale)
    else {
      // idle: a slow drift so the world reads as 3D before you take the controls
      const t = performance.now() * 0.00016
      const s = this.spec.spawn || [0, 0, 18]
      this.camera.position.set(s[0] + Math.sin(t) * 4, s[1] + Math.cos(t * 0.8) * 2, s[2] + Math.cos(t) * 4)
      this.camera.lookAt(0, 0, this.spec.spawn ? this.spec.spawn[2] - 20 : 0)
    }

    const b = m?.band
    this.spec.update({
      group: this.group, palette: this.palette, store: this.store,
      t: performance.now() * 0.001, dt: Math.max(0.001, dt),
      bass: b ? b.bass.norm : 0,
      mid: b ? b.mid.norm : 0,
      treble: b ? b.air.norm : 0,
      beat: !!m?.beat, beatPulse: m?.beatPulse || 0, level: m?.level || 0,
      bands: m?.bandsNorm || new Float32Array(0)
    })

    this.renderer.render(this.scene, this.camera)
  }
}
