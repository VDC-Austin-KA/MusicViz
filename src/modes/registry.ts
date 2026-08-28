import { GeometryModes } from '../render/GeometryEngine'

// Central mode registry — modular swapping Fluid / Fractal / Geometry / Hybrid
export type Engine = 'fluid' | 'fractal' | 'geometry' | 'viz2d'

export interface Mode {
  id: string; name: string; group: string
  engine: Engine
  shader?: string
  physics?: { diss: number; vort: number; visc: number; radius: number }
  fractal?: number
  detail?: number
  timeScale?: number
  palSpeed?: number
  // drive for fluid engines
  drive?: (ctx: any) => void
  // draw for geometry/viz2d
  draw?: (g: any, W: number, H: number, t: number, m: any, S: any, env: any) => void
}

// Fluid curated subset (expandable)
export const fluidModes: Mode[] = [
  { id: 'julia-flow', name: 'Julia Bloom Flow', group: 'Fluid · Fractal', engine: 'fluid', physics: { diss: 0.988, vort: 16, visc: 0.10, radius: 0.055 } },
  { id: 'spectrum-fountain', name: 'Spectrum Fountain', group: 'Fluid · Spectral', engine: 'fluid', physics: { diss: 0.972, vort: 28, visc: 0.18, radius: 0.16 } },
  { id: 'kaleidofluid', name: 'Kaleidofluid', group: 'Fluid · Symmetry', engine: 'fluid', fractal: 0.35, physics: { diss: 0.984, vort: 38, visc: 0.20, radius: 0.18 } },
  { id: 'attractor-bloom', name: 'Attractor Bloom', group: 'Fluid · Fractal', engine: 'fluid', fractal: 0.2, physics: { diss: 0.991, vort: 34, visc: 0.10, radius: 0.10 } },
]

export const fractalModes: Mode[] = [
  { id: 'julia-bloom', name: 'Julia Bloom', group: 'Fractal · Endless', engine: 'fractal', shader: 'julia', detail: 0.65, timeScale: 0.0001, palSpeed: 0.0002 },
  { id: 'mandala', name: 'Third Eye', group: 'Reactive · Mandala', engine: 'fractal', shader: 'mandala', detail: 0.6 },
  { id: 'portal', name: 'Portal Descent', group: 'Reactive · Mandala', engine: 'fractal', shader: 'mandala', detail: 0.6 },
]

export function buildRegistry(): Mode[] {
  const out: Mode[] = []
  fluidModes.forEach(m => out.push(m))
  fractalModes.forEach(m => out.push(m))
  GeometryModes.forEach(m => out.push({ ...m, engine: 'geometry' } as Mode))
  return out
}
