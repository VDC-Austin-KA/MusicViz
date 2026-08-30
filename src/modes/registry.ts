import { GeometryModes } from '../render/GeometryEngine'

// Central mode registry — modular swapping Warp / Cyber / Fluid / Fractal / Geometry / Hybrid,
// each with a matching bespoke 3D fly-through twin (engine 'world3d').
export type Engine = 'world3d' | 'fluid' | 'fractal' | 'geometry' | 'warp' | 'cyber' | 'viz2d'

export interface Mode {
  id: string; name: string; group: string
  engine: Engine
  shader?: string
  physics?: { diss: number; vort: number; visc: number; radius: number }
  fractal?: number
  detail?: number
  timeScale?: number
  palSpeed?: number
  /** for engine 'world3d': which world in worlds3d.ts to build (the 2D mode's id) */
  world?: string
  drive?: (ctx: any) => void
  draw?: (g: any, W: number, H: number, t: number, m: any, S: any, env: any) => void
}

export const warpModes: Mode[] = [
  { id: 'hyperspace-warp', name: 'Hyperspace Warp Tunnel', group: 'Warp · Hyperspace', engine: 'warp' },
]

export const cyberModes: Mode[] = [
  { id: 'quantum-grid', name: 'Quantum Cyber Grid', group: 'Cyber · Synthwave', engine: 'cyber' },
]

export const fluidModes: Mode[] = [
  { id: 'julia-flow', name: 'Julia Bloom Flow', group: 'Fluid · Kinetic', engine: 'fluid', physics: { diss: 0.988, vort: 16, visc: 0.10, radius: 0.055 } },
  { id: 'spectrum-fountain', name: 'Spectrum Fountain', group: 'Fluid · Spectral', engine: 'fluid', physics: { diss: 0.972, vort: 28, visc: 0.18, radius: 0.16 } },
  { id: 'kaleidofluid', name: 'Kaleidofluid', group: 'Fluid · Symmetry', engine: 'fluid', fractal: 0.35, physics: { diss: 0.984, vort: 38, visc: 0.20, radius: 0.18 } },
  { id: 'attractor-bloom', name: 'Attractor Bloom', group: 'Fluid · Kinetic', engine: 'fluid', fractal: 0.2, physics: { diss: 0.991, vort: 34, visc: 0.10, radius: 0.10 } },
]

export const fractalModes: Mode[] = [
  { id: 'plasma-vortex', name: 'Plasma Vortex', group: 'Fractal · Psychedelic', engine: 'fractal', shader: 'plasma', detail: 0.75, timeScale: 0.0001, palSpeed: 0.0003 },
  { id: 'sacred-geometry', name: 'Sacred Geometry', group: 'Geometry · Sacred', engine: 'fractal', shader: 'sacred', detail: 0.70, timeScale: 0.0001, palSpeed: 0.0002 },
  { id: 'julia-bloom', name: 'Julia Bloom', group: 'Fractal · Endless', engine: 'fractal', shader: 'julia', detail: 0.65, timeScale: 0.0001, palSpeed: 0.0002 },
  { id: 'mandala', name: 'Third Eye Mandala', group: 'Fractal · Endless', engine: 'fractal', shader: 'mandala', detail: 0.6 },
]

/** the 3D twin of a 2D mode — same idea, rebuilt as geometry you fly through */
function twin3D(m: Mode): Mode {
  return {
    id: m.id + '-3d',
    name: m.name + ' 3D',
    group: m.group.split(' · ')[0] + ' · 3D Flight',
    engine: 'world3d',
    world: m.id,
  }
}

export function buildRegistry(): Mode[] {
  const flat: Mode[] = []
  warpModes.forEach(m => flat.push(m))
  cyberModes.forEach(m => flat.push(m))
  fractalModes.forEach(m => flat.push(m))
  fluidModes.forEach(m => flat.push(m))
  GeometryModes.forEach(m => flat.push({ ...m, engine: 'geometry' } as Mode))
  // Originals first and unchanged, then one bespoke 3D world for each of them.
  return [...flat, ...flat.map(twin3D)]
}
