/**
 * Palette — TS greenfield, HDR + album sampling + TSL-ready LUT
 */

type RGB = { r: number; g: number; b: number }

const SETS: Record<string, string[] | null> = {
  rainbow: null,
  neon: ['#ff005c', '#b400ff', '#00e5ff', '#00ff9d', '#ff005c'],
  vapor: ['#ff71ce', '#01cdfe', '#05ffa1', '#b967ff', '#ff71ce'],
  sunset: ['#f72585', '#ff6d00', '#ffba08', '#ff2e63', '#f72585'],
  ice: ['#03045e', '#0077b6', '#00b4d8', '#caf0f8', '#03045e'],
  magma: ['#0b0014', '#3b0f70', '#8c2981', '#de4968', '#fe9f6d', '#fcfdbf', '#0b0014'],
  ember: ['#1a0000', '#9d0208', '#dc2f02', '#f48c06', '#ffba08', '#1a0000'],
  forest: ['#004b23', '#008000', '#38b000', '#9ef01a', '#ccff33', '#004b23'],
  mono: ['#101014', '#4a4a55', '#9a9aa8', '#ffffff', '#101014'],
  gold: ['#2b1700', '#7f4f00', '#d4a017', '#ffd966', '#fff4cc', '#2b1700'],
  oceanic: ['#012a4a', '#2a6f97', '#61a5c2', '#a9d6e5', '#012a4a'],
  candy: ['#ff9ff3', '#feca57', '#48dbfb', '#1dd1a1', '#ff6b6b', '#ff9ff3'],
  aurora: ['#011627', '#0b7a75', '#2ec4b6', '#a7f3d0', '#7b2ff7', '#011627'],
  prism: ['#ff0040', '#ff8c00', '#ffee00', '#00ff66', '#00c3ff', '#7a00ff', '#ff0040'],
  dusk: ['#0d1b2a', '#415a77', '#a06cd5', '#ff8fab', '#ffd6a5', '#0d1b2a'],
  toxic: ['#020d00', '#1b998b', '#78ff00', '#d0ff14', '#f6ff8f', '#020d00'],
  royal: ['#10002b', '#3c096c', '#7b2cbf', '#c77dff', '#e0aaff', '#10002b'],
  infrared: ['#000000', '#4a0e4e', '#c9184a', '#ff4d00', '#ffd500', '#ffffff', '#000000'],
  album: ['#00b4d8', '#90e0ef', '#0077b6', '#00b4d8'],
}

function hexToRgb(hex: string): RGB {
  const n = parseInt(hex.slice(1), 16)
  return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 }
}
const cache: Record<string, RGB[]> = {}
function stopsFor(name: string, albumStops: RGB[] | null): RGB[] {
  if (name === 'album' && albumStops) return albumStops
  if (!cache[name]) cache[name] = (SETS[name] || SETS.neon!)!.map(hexToRgb)
  return cache[name]
}
function hueToRgb(p: number, q: number, t: number) {
  if (t < 0) t += 1; if (t > 1) t -= 1
  if (t < 1 / 6) return p + (q - p) * 6 * t
  if (t < 1 / 2) return q
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
  return p
}
function hsl(h: number, s: number, l: number): RGB {
  h -= Math.floor(h); let r: number, g: number, b: number
  if (s === 0) r = g = b = l
  else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hueToRgb(p, q, h + 1 / 3); g = hueToRgb(p, q, h); b = hueToRgb(p, q, h - 1 / 3)
  }
  return { r, g, b }
}

export class Palette {
  private name = 'rainbow'
  private speed = 1
  private albumStops: RGB[] | null = null
  private chromaDrive = 0
  private chromaOffset = 0
  names = Object.keys(SETS)
  set(n: string) { if (SETS[n] !== undefined) this.name = n }
  get() { return this.name }
  setSpeed(v: number) { this.speed = v }
  setChromaDrive(v: number) { this.chromaDrive = Math.max(0, Math.min(1, v)) }
  hasAlbum() { return !!this.albumStops }

  sample(t: number): RGB {
    t -= Math.floor(t)
    if (this.name === 'rainbow') return hsl(t, 0.85, 0.55)
    const stops = stopsFor(this.name, this.albumStops)
    const scaled = t * (stops.length - 1)
    const i = Math.floor(scaled), f = scaled - i
    const a = stops[i], b = stops[Math.min(stops.length - 1, i + 1)]
    return { r: a.r + (b.r - a.r) * f, g: a.g + (b.g - a.g) * f, b: a.b + (b.b - a.b) * f }
  }
  css(t: number, a?: number): string {
    const c = this.sample(t); const r = Math.round(c.r * 255), g = Math.round(c.g * 255), b = Math.round(c.b * 255)
    return a === undefined ? `rgb(${r},${g},${b})` : `rgba(${r},${g},${b},${a})`
  }
  hdr(t: number, k?: number): RGB {
    const c = this.sample(t); const s = (k === undefined ? 4.5 : k) * 0.6
    return { r: c.r * s, g: c.g * s, b: c.b * s }
  }
  flow(offset?: number, timeScale?: number): number {
    const t = Date.now() * 0.00003 * this.speed * (timeScale || 1) + (offset || 0)
    if (this.chromaDrive <= 0) return t
    return t * (1 - this.chromaDrive) + (this.chromaOffset + (offset || 0)) * this.chromaDrive
  }
  updateMusic(m: any) {
    if (!m) return
    let d = m.chromaPeak / 12 - this.chromaOffset
    if (d > 0.5) d -= 1; else if (d < -0.5) d += 1
    this.chromaOffset = (this.chromaOffset + d * 0.05 + 1) % 1
  }
  fromImage(img: HTMLImageElement): boolean {
    try {
      const c = document.createElement('canvas'), n = 40; c.width = n; c.height = n
      const g = c.getContext('2d', { willReadFrequently: true })!
      g.drawImage(img, 0, 0, n, n); const data = g.getImageData(0, 0, n, n).data
      const buckets: Record<string, any> = {}
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i], gg = data[i + 1], b = data[i + 2]; const max = Math.max(r, gg, b), min = Math.min(r, gg, b)
        const sat = max === 0 ? 0 : (max - min) / max; const lum = (r + gg + b) / 765
        if (lum < 0.06 || lum > 0.97) continue; const key = (r >> 6) + ',' + (gg >> 6) + ',' + (b >> 6); const w = 1 + sat * 3
        const e = buckets[key] || (buckets[key] = { r: 0, g: 0, b: 0, w: 0 }); e.r += r * w; e.g += gg * w; e.b += b * w; e.w += w
      }
      const list = Object.keys(buckets).map(k => buckets[k]).sort((a, b) => b.w - a.w).slice(0, 5).map((e: any) => ({ r: e.r / e.w / 255, g: e.g / e.w / 255, b: e.b / e.w / 255 }))
      if (list.length < 2) return false; list.push(list[0]); this.albumStops = list; return true
    } catch { return false }
  }
  // WebGPU TSL LUT texture (256×1)
  createLUTTexture(gl: WebGL2RenderingContext): WebGLTexture {
    const w = 256, data = new Uint8Array(w * 4)
    for (let i = 0; i < w; i++) { const c = this.sample(i / w); data[i * 4] = Math.round(c.r * 255); data[i * 4 + 1] = Math.round(c.g * 255); data[i * 4 + 2] = Math.round(c.b * 255); data[i * 4 + 3] = 255 }
    const tex = gl.createTexture()!; gl.bindTexture(gl.TEXTURE_2D, tex); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, data); return tex
  }
}
