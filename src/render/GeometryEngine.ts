/**
 * GeometryEngine — Three.js minimal high-impact geometry
 * Boller Flower (one-knob petal complexity), Teoxoy Orbit Rings, DesLauriers Tunnel/Hex/Kaleido + Hybrids
 * TSL-ready: positions computed via nodes, here ShaderMaterial GLSL for Vite compatibility
 */
import * as THREE from 'three'
import { Palette } from '../core/Palette'

type Mode = { id: string; name: string; group: string; fade?: number; hidden?: boolean }

export class GeometryEngine {
  private renderer: THREE.WebGLRenderer | null = null
  private scene: THREE.Scene | null = null
  private camera: THREE.PerspectiveCamera | null = null
  private canvas: HTMLCanvasElement
  private palette: Palette
  private mode: Mode | null = null
  private meshes: THREE.Object3D[] = []
  private clock = 0

  constructor(canvas: HTMLCanvasElement, palette: Palette) {
    this.canvas = canvas; this.palette = palette
  }

  init(): boolean {
    try {
      this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: false })
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
      this.scene = new THREE.Scene(); this.scene.background = new THREE.Color(0x000000)
      this.camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100); this.camera.position.z = 3.2
      this.resize(); return true
    } catch { return false }
  }
  resize() {
    if (!this.renderer || !this.camera) return
    const w = this.canvas.clientWidth || window.innerWidth, h = this.canvas.clientHeight || window.innerHeight
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    this.renderer.setSize(w, h, false); this.renderer.setPixelRatio(dpr)
    this.canvas.width = Math.floor(w * dpr); this.canvas.height = Math.floor(h * dpr)
    this.camera.aspect = w / h; this.camera.updateProjectionMatrix()
  }
  setMode(m: Mode) {
    this.mode = m
    this.clear()
    // scaffold meshes per mode — lightweight proofs of TSL
    if (!this.scene) return
    if (m.id === 'flower') this.buildFlower()
    else if (m.id === 'orbit-rings') this.buildRings()
    else if (m.id === 'neon-tunnel') this.buildTunnel()
    else if (m.id === 'hex-pulse') this.buildHex()
    else if (m.id === 'kaleido') this.buildKaleido()
    else if (m.id === 'cosmic-nebula') this.buildNebula()
    else if (m.id.startsWith('hybrid') || m.id === 'bloom-grid') this.buildHybrid()
    else this.buildFlower()
  }
  private clear() {
    if (!this.scene) return
    this.meshes.forEach(o => this.scene!.remove(o)); this.meshes = []
  }
  private buildNebula() {
    const particleCount = 2000
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i++) {
      const radius = 0.2 + Math.random() * 2.2
      const theta = Math.random() * Math.PI * 2
      const phi = (Math.random() - 0.5) * Math.PI * 0.8
      positions[i * 3] = radius * Math.cos(theta) * Math.cos(phi)
      positions[i * 3 + 1] = radius * Math.sin(phi)
      positions[i * 3 + 2] = radius * Math.sin(theta) * Math.cos(phi)

      const c = this.palette.sample(Math.random())
      colors[i * 3] = c.r
      colors[i * 3 + 1] = c.g
      colors[i * 3 + 2] = c.b
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const material = new THREE.PointsMaterial({
      size: 0.04,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    })
    const points = new THREE.Points(geometry, material)
    this.scene!.add(points)
    this.meshes.push(points)
  }
  // ---- builders (minimal, TSL comment shows future node)
  // ---- builders (minimal, TSL comment shows future node)
  private buildFlower() {
    const petals = new THREE.Group()
    const cnt = 9
    for (let i = 0; i < cnt; i++) {
      const geo = new THREE.CircleGeometry(0.18, 32, 0, Math.PI * 0.9)
      const mat = new THREE.MeshBasicMaterial({ color: 0xff005c, transparent: true, opacity: 0.55, side: THREE.DoubleSide })
      const m = new THREE.Mesh(geo, mat)
      m.rotation.z = (i / cnt) * Math.PI * 2
      m.position.set(Math.cos(m.rotation.z) * 0.35, Math.sin(m.rotation.z) * 0.35, 0)
      m.rotation.x = 0.5; petals.add(m)
    }
    this.scene!.add(petals); this.meshes.push(petals)
  }
  private buildRings() {
    const g = new THREE.Group()
    for (let i = 0; i < 5; i++) {
      const geo = new THREE.RingGeometry(0.35 + i * 0.18, 0.37 + i * 0.18, 128)
      const mat = new THREE.MeshBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.45, side: THREE.DoubleSide })
      const m = new THREE.Mesh(geo, mat); m.rotation.x = Math.PI * 0.15 * i; g.add(m)
    }
    this.scene!.add(g); this.meshes.push(g)
  }
  private buildTunnel() {
    const g = new THREE.Group()
    for (let i = 0; i < 12; i++) {
      const s = 0.2 + i * 0.16
      const geo = new THREE.BoxGeometry(s, s, 0.04)
      const edges = new THREE.EdgesGeometry(geo)
      const mat = new THREE.LineBasicMaterial({ color: 0x90e0ef, transparent: true, opacity: 0.6 - i * 0.04 })
      const m = new THREE.LineSegments(edges, mat); m.position.z = -i * 0.28; g.add(m)
    }
    this.scene!.add(g); this.meshes.push(g)
  }
  private buildHex() {
    const g = new THREE.Group()
    const cnt = 8 * 6
    for (let i = 0; i < cnt; i++) {
      const geo = new THREE.CylinderGeometry(0.08, 0.08, 0.1, 6)
      const mat = new THREE.MeshBasicMaterial({ color: 0x78ff00, transparent: true, opacity: 0.52 })
      const m = new THREE.Mesh(geo, mat)
      const x = (i % 8) - 3.5, y = Math.floor(i / 8) - 3
      m.position.set(x * 0.28, y * 0.32, 0); g.add(m)
    }
    this.scene!.add(g); this.meshes.push(g)
  }
  private buildKaleido() {
    const g = new THREE.Group()
    const cnt = 6
    for (let i = 0; i < cnt; i++) {
      const geo = new THREE.PlaneGeometry(1.8, 0.04)
      const mat = new THREE.MeshBasicMaterial({ color: 0xc77dff, transparent: true, opacity: 0.6 })
      const m = new THREE.Mesh(geo, mat); m.rotation.z = (i / cnt) * Math.PI; g.add(m)
    }
    this.scene!.add(g); this.meshes.push(g)
  }
  private buildHybrid() {
    this.buildFlower()
    // hybrid note: on frame(), also splat fluid dye at mesh positions (see frame)
  }

  frame(t: number, metrics: any, ctx: any) {
    if (!this.renderer || !this.scene || !this.camera) return
    this.clock = t
    const u = metrics.band
    const bass = u.bass?.norm || 0, mid = u.mid?.norm || 0, air = u.air?.onset || 0

    // Zoom & Pan camera positioning
    const zoom = Math.max(0.1, ctx.zoom || 1)
    const panX = (ctx.pan?.x || 0) * 3
    const panY = (ctx.pan?.y || 0) * 3
    let flyDrift = 0
    if (ctx.flyThrough) {
      flyDrift = Math.sin(t * 0.0005 * (ctx.flySpeed || 1)) * 0.8
    }
    this.camera.position.set(panX + flyDrift, panY, (3.2 / zoom) + Math.sin(t * 0.0002) * 0.3)
    this.camera.lookAt(panX, panY, 0)

    const id = this.mode?.id
    if (id === 'flower') {
      const g: any = this.meshes[0]; if (g) { g.rotation.z += 0.00035 + mid * 0.0012; g.scale.setScalar(0.9 + bass * 0.55 + metrics.beatPulse * 0.12) }
      this.scene.background = new THREE.Color().setHSL((performance.now() * 0.00003) % 1, 0.85, 0.06 + air * 0.04)
    } else if (id === 'orbit-rings') {
      this.meshes[0]?.children.forEach((c: any, i: number) => { c.rotation.z += 0.00012 * (1 + i * 0.2) + mid * 0.001; c.scale.setScalar(1 + metrics.bandsNorm[i * 4] * 0.12) })
    } else if (id === 'neon-tunnel') {
      this.meshes[0]?.children.forEach((c: any, i: number) => { c.position.z += 0.002 + bass * 0.006; if (c.position.z > 1) c.position.z = -3.5 })
    } else if (id === 'hex-pulse') {
      this.meshes[0]?.children.forEach((c: any, i: number) => { const v = metrics.bandsNorm[i % 64]; c.scale.setScalar(0.6 + v * 0.9); c.rotation.y += 0.005 + v * 0.02 })
    } else if (id === 'kaleido') {
      this.meshes[0]?.rotation.set(0, 0, t * 0.00012)
    } else if (id === 'cosmic-nebula') {
      if (this.meshes[0]) {
        this.meshes[0].rotation.y += 0.001 + mid * 0.003
        this.meshes[0].rotation.z += 0.0005 + bass * 0.002
        const s = 1.0 + bass * 0.35 + metrics.beatPulse * 0.15
        this.meshes[0].scale.set(s, s, s)
      }
    }
    // hybrid fluid seeding hook
    if (id?.startsWith('hybrid') || id === 'bloom-grid') {
      const Fluid = (window as any).FluidSimInstance
      if (Fluid && Fluid.isReady && Fluid.isReady() && metrics.beat) {
        const a = Math.random() * Math.PI * 2; Fluid.splat(0.5 + Math.cos(a) * 0.12, 0.5 + Math.sin(a) * 0.12, Math.cos(a) * 12, Math.sin(a) * 12, this.palette.hdr(Math.random(), 3.2))
      }
    }
    this.renderer.render(this.scene, this.camera)
  }
}

export const GeometryModes: Mode[] = [
  { id: 'flower', name: 'Bloom Flower', group: 'Geometry · Organic' },
  { id: 'orbit-rings', name: 'Orbit Rings', group: 'Geometry · Minimal' },
  { id: 'neon-tunnel', name: 'Neon Tunnel', group: 'Geometry · Minimal' },
  { id: 'hex-pulse', name: 'Hex Pulse', group: 'Geometry · Lattice' },
  { id: 'kaleido', name: 'Kaleidoscope', group: 'Geometry · Symmetry' },
  { id: 'cosmic-nebula', name: 'Cosmic Dust Nebula', group: 'Particle · 3D Vortex' },
  { id: 'bloom-grid', name: 'Bloom Grid (Hybrid)', group: 'Hybrid · Fluid-Geometry' },
  { id: 'hybrid-mandala', name: 'Fractal Mandala (Hybrid)', group: 'Hybrid · Fractal-Geometry' },
]
