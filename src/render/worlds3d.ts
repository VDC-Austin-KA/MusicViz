/**
 * worlds3d — one bespoke 3D world per 2D visualizer mode.
 *
 * Every entry re-imagines that mode's core idea as real geometry you can fly through,
 * rather than projecting the flat version onto a surface. The 2D originals are untouched;
 * these are separate modes rendered by World3D.
 */
import * as THREE from 'three'
import { Palette } from '../core/Palette'

export type BuildCtx = { group: THREE.Group; palette: Palette; store: any }
export type UpdateCtx = {
  group: THREE.Group; palette: Palette; store: any
  t: number; dt: number
  bass: number; mid: number; treble: number
  beat: boolean; beatPulse: number; level: number
  bands: Float32Array
}
export type WorldSpec = {
  build(c: BuildCtx): void
  update(u: UpdateCtx): void
  /** camera start, and how far you can see */
  spawn?: [number, number, number]
  bg?: number
  fog?: number
}

const TAU = Math.PI * 2

// --- shared primitives ---------------------------------------------------
export function col(p: Palette, t: number): THREE.Color {
  const c = p.sample(((t % 1) + 1) % 1)
  return new THREE.Color(c.r, c.g, c.b)
}
function glowMat(color: THREE.Color | number, opacity = 0.8, wireframe = false) {
  return new THREE.MeshBasicMaterial({
    color, transparent: true, opacity, wireframe,
    blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide
  })
}
function lineMat(color: THREE.Color | number, opacity = 0.8) {
  return new THREE.LineBasicMaterial({ color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false })
}
function pointsMat(size: number, opacity = 0.9) {
  return new THREE.PointsMaterial({ size, vertexColors: true, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false })
}
/** band energy at normalised position 0..1 across the spectrum */
function bandAt(b: Float32Array, u: number) {
  if (!b || !b.length) return 0
  return b[Math.max(0, Math.min(b.length - 1, Math.floor(u * b.length)))] || 0
}
/** point cloud from a generator; fn fills position, returns colour ramp position 0..1 */
function cloud(n: number, palette: Palette, size: number, fn: (i: number, v: THREE.Vector3) => number) {
  const pos = new Float32Array(n * 3), colr = new Float32Array(n * 3), v = new THREE.Vector3()
  for (let i = 0; i < n; i++) {
    const ramp = fn(i, v.set(0, 0, 0))
    pos[i * 3] = v.x; pos[i * 3 + 1] = v.y; pos[i * 3 + 2] = v.z
    const c = col(palette, ramp)
    colr[i * 3] = c.r; colr[i * 3 + 1] = c.g; colr[i * 3 + 2] = c.b
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  g.setAttribute('color', new THREE.BufferAttribute(colr, 3))
  return new THREE.Points(g, pointsMat(size))
}
// =========================================================================
// WARP · Hyperspace corridor — rings and light-streaks tearing past you
// =========================================================================
const hyperspaceWarp: WorldSpec = {
  spawn: [0, 0, 0], fog: 0.012,
  build({ group, palette, store }) {
    store.rings = []
    const geo = new THREE.TorusGeometry(6, 0.09, 8, 72)
    for (let i = 0; i < 44; i++) {
      const r = new THREE.Mesh(geo, glowMat(col(palette, i / 44), 0.7))
      r.position.z = -i * 6
      group.add(r); store.rings.push(r)
    }
    store.streaks = cloud(2600, palette, 0.16, (_i, v) => {
      const a = Math.random() * TAU, rad = 4 + Math.random() * 22
      v.set(Math.cos(a) * rad, Math.sin(a) * rad, -Math.random() * 264)
      return Math.random()
    })
    group.add(store.streaks)
  },
  update({ store, palette, t, dt, bass, mid, beatPulse }) {
    const speed = (26 + bass * 90) * dt
    store.rings.forEach((r: THREE.Mesh, i: number) => {
      r.position.z += speed
      if (r.position.z > 8) r.position.z -= 264
      const s = 1 + Math.sin(t * 2 + i * 0.4) * 0.1 + bass * 0.4
      r.scale.set(s, s, 1)
      r.rotation.z += (0.2 + mid) * dt
      ;(r.material as THREE.MeshBasicMaterial).color.copy(col(palette, t * 0.06 + i * 0.03))
    })
    const sp = store.streaks.geometry.attributes.position
    for (let i = 0; i < sp.count; i++) {
      let z = sp.getZ(i) + speed * 2.2
      if (z > 8) z -= 264
      sp.setZ(i, z)
    }
    sp.needsUpdate = true
    store.streaks.material.size = 0.12 + beatPulse * 0.2
  }
}

// =========================================================================
// CYBER · Synthwave grid — neon sun over an FFT-displaced wire horizon
// =========================================================================
const quantumGrid: WorldSpec = {
  spawn: [0, 3, 10], fog: 0.009,
  build({ group, palette, store }) {
    store.geo = new THREE.PlaneGeometry(220, 220, 72, 72)
    const grid = new THREE.Mesh(store.geo, new THREE.MeshBasicMaterial({
      color: col(palette, 0.7), wireframe: true, transparent: true, opacity: 0.55
    }))
    grid.rotation.x = -Math.PI / 2; grid.position.y = -6
    group.add(grid); store.grid = grid

    store.sun = new THREE.Mesh(new THREE.CircleGeometry(26, 64), glowMat(col(palette, 0.05), 0.5))
    store.sun.position.set(0, 12, -110)
    group.add(store.sun)
    // scanlines across the sun
    for (let i = 0; i < 9; i++) {
      const bar = new THREE.Mesh(new THREE.PlaneGeometry(60, 1.2), glowMat(0x000000, 0.9))
      ;(bar.material as THREE.MeshBasicMaterial).blending = THREE.NormalBlending
      bar.position.set(0, 1 + i * 2.4, -109.5)
      group.add(bar)
    }
  },
  update({ store, palette, t, dt, bass, bands, beatPulse }) {
    const p = store.geo.attributes.position
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i)
      const d = Math.hypot(x, y) / 110
      const e = bandAt(bands, d)
      p.setZ(i, Math.sin(d * 12 - t * 3) * (1 + bass * 5) + e * 14)
    }
    p.needsUpdate = true
    store.grid.position.z = ((t * (12 + bass * 26)) % 3) - 3
    ;(store.grid.material as THREE.MeshBasicMaterial).color.copy(col(palette, t * 0.04 + 0.6))
    const s = 1 + bass * 0.25 + beatPulse * 0.1
    store.sun.scale.set(s, s, 1)
    ;(store.sun.material as THREE.MeshBasicMaterial).color.copy(col(palette, t * 0.03))
    store.sun.position.y = 12 + Math.sin(t * 0.5) * dt * 0
  }
}

// =========================================================================
// FRACTAL · Plasma vortex — a swirling volumetric whirlpool of particles
// =========================================================================
const plasmaVortex: WorldSpec = {
  spawn: [0, 0, 26], fog: 0.006,
  build({ group, palette, store }) {
    const N = 14000
    store.seed = new Float32Array(N * 3)
    store.pts = cloud(N, palette, 0.13, (i, v) => {
      const arm = i % 3, u = i / N
      const a = u * TAU * 9 + arm * (TAU / 3)
      const rad = 2 + u * 20
      const h = (Math.random() - 0.5) * (1 + u * 7)
      v.set(Math.cos(a) * rad, h, Math.sin(a) * rad)
      store.seed[i * 3] = rad; store.seed[i * 3 + 1] = a; store.seed[i * 3 + 2] = h
      return u
    })
    group.add(store.pts)
  },
  update({ store, t, dt, bass, mid, treble, beatPulse }) {
    const p = store.pts.geometry.attributes.position, s = store.seed
    const swirl = (0.35 + mid * 2.2) * dt
    for (let i = 0; i < p.count; i++) {
      const rad = s[i * 3] * (1 + bass * 0.35)
      const a = (s[i * 3 + 1] += swirl * (1.6 - s[i * 3] / 26))
      p.setXYZ(i, Math.cos(a) * rad, s[i * 3 + 2] * (1 + treble * 1.4) + Math.sin(t + a) * 0.6, Math.sin(a) * rad)
    }
    p.needsUpdate = true
    store.pts.material.size = 0.11 + beatPulse * 0.16
    store.pts.rotation.x = Math.sin(t * 0.2) * 0.3
  }
}

// =========================================================================
// FRACTAL · Sacred solids — the five platonics nested and counter-rotating
// =========================================================================
const sacredGeometry: WorldSpec = {
  spawn: [0, 0, 16],
  build({ group, palette, store }) {
    const geos = [
      new THREE.TetrahedronGeometry(2.2), new THREE.BoxGeometry(3.2, 3.2, 3.2),
      new THREE.OctahedronGeometry(4.4), new THREE.DodecahedronGeometry(5.8),
      new THREE.IcosahedronGeometry(7.4)
    ]
    store.solids = geos.map((g, i) => {
      const m = new THREE.Mesh(g, glowMat(col(palette, i / 5), 0.55, true))
      group.add(m); return m
    })
    // the field they float in
    store.halo = cloud(2200, palette, 0.09, (_i, v) => {
      const a = Math.random() * TAU, b = Math.acos(2 * Math.random() - 1), r = 9 + Math.random() * 16
      v.set(r * Math.sin(b) * Math.cos(a), r * Math.sin(b) * Math.sin(a), r * Math.cos(b))
      return Math.random()
    })
    group.add(store.halo)
  },
  update({ store, palette, t, dt, bands, beatPulse }) {
    store.solids.forEach((m: THREE.Mesh, i: number) => {
      const e = bandAt(bands, i / 5)
      const dir = i % 2 ? 1 : -1
      m.rotation.x += dir * (0.1 + e * 0.9) * dt
      m.rotation.y += dir * (0.14 + e * 0.7) * dt
      const s = 1 + e * 0.45 + beatPulse * 0.12
      m.scale.setScalar(s)
      ;(m.material as THREE.MeshBasicMaterial).color.copy(col(palette, t * 0.05 + i / 5))
      ;(m.material as THREE.MeshBasicMaterial).opacity = 0.35 + e * 0.5
    })
    store.halo.rotation.y += 0.05 * dt
  }
}

// =========================================================================
// FRACTAL · Julia bloom — a mandelbulb-style escape-time point cloud
// =========================================================================
const juliaBloom: WorldSpec = {
  spawn: [0, 0, 9], fog: 0.02,
  build({ group, palette, store }) {
    const pos: number[] = [], ramp: number[] = []
    const P = 8
    for (let attempt = 0; attempt < 260000 && pos.length < 30000; attempt++) {
      const x0 = (Math.random() - 0.5) * 2.6, y0 = (Math.random() - 0.5) * 2.6, z0 = (Math.random() - 0.5) * 2.6
      let x = x0, y = y0, z = z0, it = 0
      for (; it < 7; it++) {
        const r = Math.hypot(x, y, z)
        if (r > 2) break
        const th = Math.acos(z / (r || 1e-9)) * P, ph = Math.atan2(y, x) * P, rp = Math.pow(r, P)
        x = rp * Math.sin(th) * Math.cos(ph) + x0
        y = rp * Math.sin(th) * Math.sin(ph) + y0
        z = rp * Math.cos(th) + z0
      }
      if (it >= 7) { pos.push(x0 * 2.4, y0 * 2.4, z0 * 2.4); ramp.push(Math.hypot(x0, y0, z0) / 1.3) }
    }
    const n = ramp.length
    const pa = new Float32Array(pos), ca = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) { const c = col(palette, ramp[i]); ca[i * 3] = c.r; ca[i * 3 + 1] = c.g; ca[i * 3 + 2] = c.b }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pa, 3))
    g.setAttribute('color', new THREE.BufferAttribute(ca, 3))
    store.bulb = new THREE.Points(g, pointsMat(0.05))
    group.add(store.bulb)
    store.base = pa.slice()
  },
  update({ store, t, dt, bass, mid, treble, beatPulse }) {
    store.bulb.rotation.y += (0.12 + mid * 0.6) * dt
    store.bulb.rotation.x = Math.sin(t * 0.23) * 0.4
    // breathe the cloud along each axis so the bloom actually blooms
    store.bulb.scale.set(1 + bass * 0.5, 1 + treble * 0.4, 1 + mid * 0.45)
    store.bulb.material.size = 0.045 + beatPulse * 0.06
  }
}

// =========================================================================
// FRACTAL · Mandala — concentric petal shells you fall through
// =========================================================================
const mandala: WorldSpec = {
  spawn: [0, 0, 20],
  build({ group, palette, store }) {
    store.shells = []
    for (let s = 0; s < 7; s++) {
      const shell = new THREE.Group()
      const n = 8 + s * 4, rad = 3 + s * 2.6
      const geo = new THREE.CircleGeometry(1.1 + s * 0.1, 3)
      for (let i = 0; i < n; i++) {
        const a = (i / n) * TAU
        const petal = new THREE.Mesh(geo, glowMat(col(palette, s / 7), 0.5, s % 2 === 0))
        petal.position.set(Math.cos(a) * rad, Math.sin(a) * rad, -s * 3)
        petal.rotation.z = a
        shell.add(petal)
      }
      group.add(shell); store.shells.push(shell)
    }
  },
  update({ store, palette, t, dt, bands, bass }) {
    store.shells.forEach((sh: THREE.Group, s: number) => {
      const e = bandAt(bands, s / 7)
      sh.rotation.z += (s % 2 ? 1 : -1) * (0.12 + e * 1.1) * dt
      sh.scale.setScalar(1 + e * 0.4 + bass * 0.15)
      sh.position.z = ((t * 6 + s * 3) % 21) - 12
      sh.children.forEach(c => (((c as THREE.Mesh).material as THREE.MeshBasicMaterial).color.copy(col(palette, t * 0.05 + s / 7))))
    })
  }
}

// =========================================================================
// FLUID · Julia flow — advected ribbon streams through a curl field
// =========================================================================
const juliaFlow: WorldSpec = {
  spawn: [0, 0, 22], fog: 0.01,
  build({ group, palette, store }) {
    store.streams = []
    const LEN = 90
    for (let s = 0; s < 30; s++) {
      const pos = new Float32Array(LEN * 3)
      const a = Math.random() * TAU, r = 3 + Math.random() * 10
      const head = new THREE.Vector3(Math.cos(a) * r, (Math.random() - 0.5) * 10, Math.sin(a) * r)
      for (let i = 0; i < LEN; i++) { pos[i * 3] = head.x; pos[i * 3 + 1] = head.y; pos[i * 3 + 2] = head.z }
      const g = new THREE.BufferGeometry()
      g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
      const line = new THREE.Line(g, lineMat(col(palette, s / 30), 0.75))
      group.add(line)
      store.streams.push({ line, head, len: LEN })
    }
  },
  update({ store, palette, t, dt, bass, mid, treble }) {
    const step = (2.2 + bass * 7) * dt
    store.streams.forEach((st: any, s: number) => {
      const h = st.head
      // curl-ish noise field: cheap trig curl, swirls harder with mids
      const k = 0.18, sw = 0.6 + mid * 2.4
      h.x += Math.sin(h.y * k + t * sw) * step
      h.y += Math.sin(h.z * k + t * sw * 1.3) * step * (0.6 + treble)
      h.z += Math.sin(h.x * k + t * sw * 0.7) * step
      const lim = 16
      if (Math.abs(h.x) > lim) h.x *= -0.92
      if (Math.abs(h.y) > lim) h.y *= -0.92
      if (Math.abs(h.z) > lim) h.z *= -0.92
      // shift trail down one slot, write new head
      const p = st.line.geometry.attributes.position, arr = p.array as Float32Array
      arr.copyWithin(3, 0, (st.len - 1) * 3)
      arr[0] = h.x; arr[1] = h.y; arr[2] = h.z
      p.needsUpdate = true
      ;(st.line.material as THREE.LineBasicMaterial).color.copy(col(palette, t * 0.06 + s / 30))
    })
  }
}

// =========================================================================
// FLUID · Spectrum fountain — a colosseum of FFT bars erupting around you
// =========================================================================
const spectrumFountain: WorldSpec = {
  spawn: [0, 4, 0],
  build({ group, palette, store }) {
    const N = 64
    store.n = N
    const geo = new THREE.BoxGeometry(0.7, 1, 0.7)
    geo.translate(0, 0.5, 0) // grow upward from the floor
    store.bars = new THREE.InstancedMesh(geo, new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.9 }), N)
    group.add(store.bars)
    store.dummy = new THREE.Object3D()
    for (let i = 0; i < N; i++) store.bars.setColorAt(i, col(palette, i / N))
    const floor = new THREE.Mesh(new THREE.RingGeometry(4, 30, 64), glowMat(col(palette, 0.5), 0.14))
    floor.rotation.x = -Math.PI / 2
    group.add(floor)
    store.spray = cloud(1800, palette, 0.1, (_i, v) => {
      const a = Math.random() * TAU
      v.set(Math.cos(a) * 14, Math.random() * 20, Math.sin(a) * 14)
      return Math.random()
    })
    group.add(store.spray)
  },
  update({ store, palette, t, dt, bands, beatPulse }) {
    const N = store.n, d = store.dummy
    for (let i = 0; i < N; i++) {
      const a = (i / N) * TAU
      const e = bandAt(bands, i / N)
      d.position.set(Math.cos(a) * 14, 0, Math.sin(a) * 14)
      d.rotation.set(0, -a, 0)
      d.scale.set(1, 0.4 + e * 26, 1)
      d.updateMatrix()
      store.bars.setMatrixAt(i, d.matrix)
      store.bars.setColorAt(i, col(palette, t * 0.05 + i / N))
    }
    store.bars.instanceMatrix.needsUpdate = true
    if (store.bars.instanceColor) store.bars.instanceColor.needsUpdate = true
    // spray falls, respawns at the rim on beats
    const p = store.spray.geometry.attributes.position
    for (let i = 0; i < p.count; i++) {
      let y = p.getY(i) - (3 + beatPulse * 22) * dt
      if (y < 0) y = 18 + Math.random() * 6
      p.setY(i, y)
    }
    p.needsUpdate = true
  }
}

// =========================================================================
// FLUID · Kaleidofluid — a 12-fold mirrored shard chamber
// =========================================================================
const kaleidofluid: WorldSpec = {
  spawn: [0, 0, 14],
  build({ group, palette, store }) {
    store.wedges = []
    const F = 12
    for (let f = 0; f < F; f++) {
      const wedge = new THREE.Group()
      wedge.rotation.z = (f / F) * TAU
      wedge.scale.x = f % 2 ? -1 : 1 // true mirror on alternating wedges
      for (let i = 0; i < 5; i++) {
        const shard = new THREE.Mesh(
          new THREE.ConeGeometry(0.6 + i * 0.18, 3 + i, 3),
          glowMat(col(palette, i / 5), 0.45)
        )
        shard.position.set(2.5 + i * 2.1, i * 0.7, -i * 1.4)
        wedge.add(shard)
      }
      group.add(wedge); store.wedges.push(wedge)
    }
  },
  update({ store, palette, t, dt, bass, mid, bands }) {
    store.wedges.forEach((w: THREE.Group, f: number) => {
      w.rotation.z += (0.2 + mid * 1.4) * dt * (f % 2 ? -1 : 1)
      w.children.forEach((c, i) => {
        const e = bandAt(bands, i / 5)
        c.position.x = 2.5 + i * 2.1 + e * 4 + bass * 2
        c.rotation.z = Math.sin(t * 1.4 + i) * (0.4 + e)
        ;((c as THREE.Mesh).material as THREE.MeshBasicMaterial).color.copy(col(palette, t * 0.07 + i / 5 + f * 0.02))
      })
    })
  }
}

// =========================================================================
// FLUID · Attractor bloom — a live Lorenz strange attractor in space
// =========================================================================
const attractorBloom: WorldSpec = {
  spawn: [0, 0, 60], fog: 0.004,
  build({ group, palette, store }) {
    const N = 12000
    const pos = new Float32Array(N * 3), colr = new Float32Array(N * 3)
    let x = 0.1, y = 0, z = 0
    const a = 10, b = 28, c = 8 / 3, h = 0.006
    for (let i = 0; i < N; i++) {
      const dx = a * (y - x), dy = x * (b - z) - y, dz = x * y - c * z
      x += dx * h; y += dy * h; z += dz * h
      pos[i * 3] = x; pos[i * 3 + 1] = z - 26; pos[i * 3 + 2] = y
      const cc = col(palette, i / N)
      colr[i * 3] = cc.r; colr[i * 3 + 1] = cc.g; colr[i * 3 + 2] = cc.b
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('color', new THREE.BufferAttribute(colr, 3))
    store.path = new THREE.Line(g, new THREE.LineBasicMaterial({
      vertexColors: true, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false
    }))
    store.path.scale.setScalar(1.4)
    group.add(store.path)
  },
  update({ store, t, dt, bass, mid, beatPulse }) {
    store.path.rotation.y += (0.1 + mid * 0.5) * dt
    store.path.rotation.z = Math.sin(t * 0.17) * 0.25
    const s = 1.4 + bass * 0.5 + beatPulse * 0.15
    store.path.scale.setScalar(s)
    store.path.material.opacity = 0.5 + beatPulse * 0.5
  }
}

// =========================================================================
// GEOMETRY · Bloom flower — petals that open on the bass
// =========================================================================
const flower: WorldSpec = {
  spawn: [0, 2, 15],
  build({ group, palette, store }) {
    store.layers = []
    for (let l = 0; l < 4; l++) {
      const layer = new THREE.Group()
      const n = 6 + l * 3
      for (let i = 0; i < n; i++) {
        const petal = new THREE.Mesh(new THREE.CircleGeometry(2.2 + l * 0.7, 12, 0, Math.PI), glowMat(col(palette, l / 4), 0.42))
        petal.position.y = 0
        petal.rotation.z = (i / n) * TAU
        layer.add(new THREE.Group().add(petal))
      }
      layer.position.y = l * 0.35
      group.add(layer); store.layers.push(layer)
    }
    store.core = new THREE.Mesh(new THREE.SphereGeometry(1.1, 24, 16), glowMat(col(palette, 0.15), 0.9))
    group.add(store.core)
  },
  update({ store, palette, t, dt, bass, mid, bands, beatPulse }) {
    store.layers.forEach((layer: THREE.Group, l: number) => {
      const e = bandAt(bands, l / 4)
      layer.rotation.y += (l % 2 ? 1 : -1) * (0.15 + e * 0.9) * dt
      // open the petals outward with bass
      const open = 0.35 + bass * 1.0 + e * 0.5
      layer.children.forEach((holder, i) => {
        holder.rotation.x = open + Math.sin(t * 1.5 + i + l) * 0.08
        const petal = holder.children[0] as THREE.Mesh
        ;(petal.material as THREE.MeshBasicMaterial).color.copy(col(palette, t * 0.05 + l / 4))
      })
    })
    store.core.scale.setScalar(1 + bass * 0.6 + beatPulse * 0.25)
    ;(store.core.material as THREE.MeshBasicMaterial).color.copy(col(palette, t * 0.1 + mid * 0.2))
  }
}

// =========================================================================
// GEOMETRY · Orbit rings — a gyroscope with satellites on every axis
// =========================================================================
const orbitRings: WorldSpec = {
  spawn: [0, 0, 20],
  build({ group, palette, store }) {
    store.rings = []
    for (let i = 0; i < 6; i++) {
      const holder = new THREE.Group()
      const rad = 3 + i * 1.9
      const ring = new THREE.Mesh(new THREE.TorusGeometry(rad, 0.06, 8, 96), glowMat(col(palette, i / 6), 0.75))
      holder.add(ring)
      const sat = new THREE.Mesh(new THREE.SphereGeometry(0.34, 16, 12), glowMat(col(palette, i / 6 + 0.5), 1))
      sat.position.x = rad
      holder.add(sat)
      holder.rotation.set(Math.random() * TAU, Math.random() * TAU, Math.random() * TAU)
      group.add(holder)
      store.rings.push({ holder, ring, sat, rad, phase: Math.random() * TAU })
    }
  },
  update({ store, palette, t, dt, bands, beatPulse }) {
    store.rings.forEach((r: any, i: number) => {
      const e = bandAt(bands, i / 6)
      r.holder.rotation.x += (0.12 + e * 0.8) * dt * (i % 2 ? 1 : -1)
      r.holder.rotation.y += (0.18 + e * 0.5) * dt
      r.phase += (1 + e * 6) * dt
      const rad = r.rad * (1 + e * 0.25)
      r.sat.position.set(Math.cos(r.phase) * rad, Math.sin(r.phase) * rad, 0)
      r.sat.scale.setScalar(1 + beatPulse * 0.8)
      r.ring.scale.setScalar(1 + e * 0.25)
      ;(r.ring.material as THREE.MeshBasicMaterial).color.copy(col(palette, t * 0.05 + i / 6))
    })
  }
}

// =========================================================================
// GEOMETRY · Neon tunnel — square-section corridor with a twist
// =========================================================================
const neonTunnel: WorldSpec = {
  spawn: [0, 0, 0], fog: 0.014,
  build({ group, palette, store }) {
    store.loops = []
    const pts = [
      new THREE.Vector3(-5, -5, 0), new THREE.Vector3(5, -5, 0),
      new THREE.Vector3(5, 5, 0), new THREE.Vector3(-5, 5, 0), new THREE.Vector3(-5, -5, 0)
    ]
    const geo = new THREE.BufferGeometry().setFromPoints(pts)
    for (let i = 0; i < 46; i++) {
      const l = new THREE.Line(geo, lineMat(col(palette, i / 46), 0.8))
      l.position.z = -i * 5
      group.add(l); store.loops.push(l)
    }
  },
  update({ store, palette, t, dt, bass, mid, bands }) {
    const speed = (18 + bass * 60) * dt
    store.loops.forEach((l: THREE.Line, i: number) => {
      l.position.z += speed
      if (l.position.z > 6) l.position.z -= 230
      const depth = (-l.position.z) / 230
      const e = bandAt(bands, depth)
      l.rotation.z = t * (0.3 + mid) + depth * 4
      l.scale.setScalar(0.7 + e * 1.4 + bass * 0.3)
      ;(l.material as THREE.LineBasicMaterial).color.copy(col(palette, t * 0.08 + depth))
    })
  }
}

// =========================================================================
// GEOMETRY · Hex pulse — a hex-packed lattice of columns per frequency
// =========================================================================
const hexPulse: WorldSpec = {
  spawn: [0, 8, 22],
  build({ group, palette, store }) {
    const cells: { x: number; z: number; u: number }[] = []
    const R = 1.15, rows = 15
    for (let q = -rows; q <= rows; q++) {
      for (let r = -rows; r <= rows; r++) {
        const x = R * 1.5 * q
        const z = R * Math.sqrt(3) * (r + q / 2)
        const d = Math.hypot(x, z)
        if (d > 26) continue
        cells.push({ x, z, u: d / 26 })
      }
    }
    store.cells = cells
    const geo = new THREE.CylinderGeometry(R * 0.9, R * 0.9, 1, 6)
    geo.translate(0, 0.5, 0)
    store.mesh = new THREE.InstancedMesh(geo, new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.85 }), cells.length)
    group.add(store.mesh)
    store.dummy = new THREE.Object3D()
    cells.forEach((c, i) => store.mesh.setColorAt(i, col(palette, c.u)))
  },
  update({ store, palette, t, bands, beatPulse }) {
    const d = store.dummy
    store.cells.forEach((c: any, i: number) => {
      const e = bandAt(bands, c.u)
      const h = 0.3 + e * 16 + Math.sin(t * 3 - c.u * 9) * (0.5 + beatPulse * 2)
      d.position.set(c.x, 0, c.z)
      d.scale.set(1, Math.max(0.1, h), 1)
      d.rotation.set(0, 0, 0)
      d.updateMatrix()
      store.mesh.setMatrixAt(i, d.matrix)
      store.mesh.setColorAt(i, col(palette, t * 0.05 + c.u))
    })
    store.mesh.instanceMatrix.needsUpdate = true
    if (store.mesh.instanceColor) store.mesh.instanceColor.needsUpdate = true
  }
}

// =========================================================================
// GEOMETRY · Kaleidoscope — a rosette of mirrored prisms around you
// =========================================================================
const kaleido: WorldSpec = {
  spawn: [0, 0, 12],
  build({ group, palette, store }) {
    store.arms = []
    const F = 16
    for (let f = 0; f < F; f++) {
      const arm = new THREE.Group()
      arm.rotation.z = (f / F) * TAU
      for (let i = 0; i < 4; i++) {
        const prism = new THREE.Mesh(new THREE.BoxGeometry(0.5, 3.4, 0.5), glowMat(col(palette, i / 4), 0.5))
        prism.position.set(3 + i * 2.4, 0, (i % 2 ? 1 : -1) * 2)
        arm.add(prism)
      }
      group.add(arm); store.arms.push(arm)
    }
  },
  update({ store, palette, t, dt, mid, bands, beatPulse }) {
    store.arms.forEach((arm: THREE.Group, f: number) => {
      arm.rotation.z += (0.25 + mid * 1.6) * dt
      arm.rotation.y = Math.sin(t * 0.6 + f * 0.4) * 0.5
      arm.children.forEach((c, i) => {
        const e = bandAt(bands, i / 4)
        c.scale.set(1 + e * 1.5, 1 + e * 2.5, 1 + e * 1.5)
        c.rotation.y += (0.4 + e * 2) * dt
        ;((c as THREE.Mesh).material as THREE.MeshBasicMaterial).color.copy(col(palette, t * 0.09 + i / 4 + f * 0.03))
        ;((c as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = 0.3 + e * 0.6 + beatPulse * 0.1
      })
    })
  }
}

// =========================================================================
// PARTICLE · Cosmic nebula — a drifting volumetric dust cloud
// =========================================================================
const cosmicNebula: WorldSpec = {
  spawn: [0, 0, 34], fog: 0.005,
  build({ group, palette, store }) {
    const N = 22000
    store.pts = cloud(N, palette, 0.14, (_i, v) => {
      // clustered gaussian lobes make it read as nebula rather than noise
      const lobe = Math.floor(Math.random() * 3)
      const cx = [0, 12, -11][lobe], cy = [0, 5, -6][lobe], cz = [0, -8, 7][lobe]
      const g = () => (Math.random() + Math.random() + Math.random() - 1.5) * 9
      v.set(cx + g(), cy + g() * 0.6, cz + g())
      return Math.min(1, v.length() / 26)
    })
    group.add(store.pts)
    store.core = new THREE.Mesh(new THREE.SphereGeometry(1.6, 24, 16), glowMat(col(palette, 0.1), 0.6))
    group.add(store.core)
  },
  update({ store, palette, t, dt, bass, mid, treble, beatPulse }) {
    store.pts.rotation.y += (0.03 + mid * 0.25) * dt
    store.pts.rotation.x = Math.sin(t * 0.11) * 0.2
    store.pts.scale.setScalar(1 + bass * 0.22)
    store.pts.material.size = 0.11 + treble * 0.16 + beatPulse * 0.1
    store.core.scale.setScalar(1 + bass * 1.4 + beatPulse * 0.5)
    ;(store.core.material as THREE.MeshBasicMaterial).color.copy(col(palette, t * 0.08))
  }
}

// =========================================================================
// HYBRID · Bloom grid — a cube field rippling out from the centre
// =========================================================================
const bloomGrid: WorldSpec = {
  spawn: [0, 10, 26],
  build({ group, palette, store }) {
    const S = 26
    store.s = S
    store.mesh = new THREE.InstancedMesh(
      new THREE.BoxGeometry(0.85, 0.85, 0.85),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.9 }), S * S
    )
    group.add(store.mesh)
    store.dummy = new THREE.Object3D()
    for (let i = 0; i < S * S; i++) store.mesh.setColorAt(i, col(palette, i / (S * S)))
  },
  update({ store, palette, t, bands, bass, beatPulse }) {
    const S = store.s, d = store.dummy, half = (S - 1) / 2
    for (let i = 0; i < S * S; i++) {
      const gx = (i % S) - half, gz = Math.floor(i / S) - half
      const dist = Math.hypot(gx, gz) / (half * 1.42)
      const e = bandAt(bands, dist)
      const y = Math.sin(dist * 10 - t * 4) * (1 + bass * 6) + e * 12
      d.position.set(gx * 1.5, y, gz * 1.5)
      d.rotation.set(y * 0.1, t * 0.5 + dist * 3, 0)
      d.scale.setScalar(0.6 + e * 2 + beatPulse * 0.3)
      d.updateMatrix()
      store.mesh.setMatrixAt(i, d.matrix)
      store.mesh.setColorAt(i, col(palette, t * 0.05 + dist))
    }
    store.mesh.instanceMatrix.needsUpdate = true
    if (store.mesh.instanceColor) store.mesh.instanceColor.needsUpdate = true
  }
}

// =========================================================================
// HYBRID · Fractal mandala — rings of rings of rings, recursive
// =========================================================================
const hybridMandala: WorldSpec = {
  spawn: [0, 0, 24],
  build({ group, palette, store }) {
    store.levels = []
    // level 0: a ring of nodes; each node carries its own smaller ring, and so on
    const makeLevel = (parent: THREE.Object3D, depth: number, radius: number): THREE.Group[] => {
      if (depth > 2) return []
      const holders: THREE.Group[] = []
      const n = [6, 5, 4][depth]
      for (let i = 0; i < n; i++) {
        const a = (i / n) * TAU
        const holder = new THREE.Group()
        holder.position.set(Math.cos(a) * radius, Math.sin(a) * radius, 0)
        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(radius * 0.42, 0.05 + 0.05 / (depth + 1), 6, 40),
          glowMat(col(palette, depth / 3 + i / n * 0.2), 0.6)
        )
        holder.add(ring)
        parent.add(holder)
        holders.push(holder)
        makeLevel(holder, depth + 1, radius * 0.42)
      }
      store.levels[depth] = (store.levels[depth] || []).concat(holders)
      return holders
    }
    const root = new THREE.Group()
    group.add(root)
    store.root = root
    makeLevel(root, 0, 9)
  },
  update({ store, palette, t, dt, bands, bass, beatPulse }) {
    store.root.rotation.z += (0.08 + bass * 0.5) * dt
    store.levels.forEach((lvl: THREE.Group[], depth: number) => {
      const e = bandAt(bands, depth / 3)
      lvl.forEach((h, i) => {
        h.rotation.z += (depth % 2 ? -1 : 1) * (0.2 + e * 2.2) * dt
        h.scale.setScalar(1 + e * 0.35 + beatPulse * 0.08)
        const ring = h.children[0] as THREE.Mesh
        ;(ring.material as THREE.MeshBasicMaterial).color.copy(col(palette, t * 0.06 + depth * 0.3 + i * 0.02))
      })
    })
  }
}

// =========================================================================
export const WORLDS: Record<string, WorldSpec> = {
  'hyperspace-warp': hyperspaceWarp,
  'quantum-grid': quantumGrid,
  'plasma-vortex': plasmaVortex,
  'sacred-geometry': sacredGeometry,
  'julia-bloom': juliaBloom,
  'mandala': mandala,
  'julia-flow': juliaFlow,
  'spectrum-fountain': spectrumFountain,
  'kaleidofluid': kaleidofluid,
  'attractor-bloom': attractorBloom,
  'flower': flower,
  'orbit-rings': orbitRings,
  'neon-tunnel': neonTunnel,
  'hex-pulse': hexPulse,
  'kaleido': kaleido,
  'cosmic-nebula': cosmicNebula,
  'bloom-grid': bloomGrid,
  'hybrid-mandala': hybridMandala,
}
