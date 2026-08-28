/**
 * AudioEngine — next-gen TS port, greenfield Vite + Three
 * Preserves MusicFluid's proven adaptive rangeNorm (floor/ceil MIN_SPAN guard)
 * Adds: DEMO rave zero-friction, YouTube proxy, getUniforms() for TSL shaders
 */

export type BandKey = 'subBass' | 'bass' | 'lowMid' | 'mid' | 'highMid' | 'presence' | 'air'

export interface BandDef { key: BandKey; lo: number; hi: number }
export interface Band {
  key: BandKey
  raw: number
  level: number
  norm: number
  env: number
  onset: number
  peak: number
  floor: number
  ceil: number
  prev: number
  hit: boolean
}

export interface Metrics {
  bass: number; lowMid: number; mid: number; highMid: number; treble: number
  band: Record<BandKey, Band>
  bands: Float32Array
  bandsNorm: Float32Array
  onsets: Float32Array
  peaks: Float32Array
  wave: Float32Array
  chroma: Float32Array
  chromaPeak: number
  centroid: number; spread: number
  flux: number; level: number; saturation: number; autoGain: number; energy: number
  beat: boolean; beatPulse: number; beatCount: number; bpm: number
  live: boolean; synthetic: boolean
}

export const BAND_DEFS: BandDef[] = [
  { key: 'subBass', lo: 20, hi: 60 },
  { key: 'bass', lo: 60, hi: 160 },
  { key: 'lowMid', lo: 160, hi: 400 },
  { key: 'mid', lo: 400, hi: 1200 },
  { key: 'highMid', lo: 1200, hi: 3200 },
  { key: 'presence', lo: 3200, hi: 7000 },
  { key: 'air', lo: 7000, hi: 16000 },
]

export const DEMO_TRACKS = [
  { id: 'rave-140', title: 'Rave Energy 140 BPM', artist: 'Pixabay · Energy', url: 'https://cdn.pixabay.com/download/audio/2021/08/09/audio_0625c1539c.mp3?filename=energy-115010.mp3', bpm: 140 },
  { id: 'rave-128', title: 'Neon Pulse 128 BPM', artist: 'Pixabay · Epic', url: 'https://cdn.pixabay.com/download/audio/2022/03/24/audio_d1718ab41b.mp3?filename=electronic-rock-112719.mp3', bpm: 128 },
  { id: 'rave-150', title: 'Hyper Drive 150 BPM', artist: 'Pixabay · Hyper', url: 'https://cdn.pixabay.com/download/audio/2022/10/30/audio_8ef11c7db6.mp3?filename=cyberpunk-138757.mp3', bpm: 150 },
] as const

const BAND_COUNT = 64, WAVE_COUNT = 1024, CHROMA = 12, HISTORY = 60
const CEIL_ATTACK = 0.3, CEIL_RELEASE = 0.008, FLOOR_ATTACK = 0.3, FLOOR_RELEASE = 0.008, MIN_SPAN = 0.06, GATE = 0.02
const TARGET_LEVEL = 0.34, GAIN_MIN = 0.15, GAIN_MAX = 12

function clamp01(v: number) { return v < 0 ? 0 : v > 1 ? 1 : v }

function rangeNorm(r: { floor: number; ceil: number }, v: number): number {
  r.ceil += (v > r.ceil ? CEIL_ATTACK : CEIL_RELEASE) * (v - r.ceil)
  r.floor += (v < r.floor ? FLOOR_ATTACK : FLOOR_RELEASE) * (v - r.floor)
  if (r.ceil < GATE) return 0
  let lo = r.floor, hi = r.ceil
  if (hi - lo < MIN_SPAN) { const mid = (hi + lo) * 0.5; lo = mid - MIN_SPAN * 0.5; hi = mid + MIN_SPAN * 0.5 }
  return clamp01((v - lo) / (hi - lo))
}

export class AudioEngine {
  BAND_COUNT = BAND_COUNT; WAVE_COUNT = WAVE_COUNT

  private ctx: AudioContext | null = null
  private analyser: AnalyserNode | null = null
  private gainTrim: GainNode | null = null
  private freqData: Uint8Array | null = null
  private waveData: Uint8Array | null = null
  private sourceNode: MediaStreamAudioSourceNode | MediaElementAudioSourceNode | null = null
  private stream: MediaStream | null = null
  private mediaEl: HTMLAudioElement | null = null
  private captureKind: 'display' | 'mic' | 'file' | 'demo' | 'youtube' | 'none' = 'none'
  private started = false
  private sourceLabel = 'none'
  private lastSoundAt = 0
  private beatTimes: number[] = []
  private lastBeatAt = 0
  private synth = { enabled: true, bpm: 120, phase: 0, seed: Math.random() * 1000 }
  private demoIdx = 0

  private bands: Record<BandKey, Band>
  metrics: Metrics

  // per-bin adaptive
  private bandEdges: Int32Array | null = null
  private bandDefBins: [number, number][] | null = null
  private chromaMap: Int8Array | null = null
  private binPeak = new Float32Array(BAND_COUNT)
  private binPrev = new Float32Array(BAND_COUNT)
  private binRange = Array.from({ length: BAND_COUNT }, () => ({ floor: 0, ceil: 0 }))
  private energyRange = { floor: 0, ceil: 0 }
  private driveHistory = new Array(HISTORY).fill(0)
  private autoGain = 1

  config = { gain: 1.2, sensitivity: 1.5, smoothing: 0.82, adaptive: 1.0, autoLevel: false, attack: 0.55, release: 0.08 }
  private onStatusCb: (k: string, d: string) => void = () => {}

  constructor() {
    const bands = {} as Record<BandKey, Band>
    BAND_DEFS.forEach(d => bands[d.key] = { key: d.key, raw: 0, level: 0, norm: 0, env: 0, onset: 0, peak: 0, floor: 0, ceil: 0, prev: 0, hit: false })
    this.bands = bands
    this.metrics = {
      bass: 0, lowMid: 0, mid: 0, highMid: 0, treble: 0,
      band: bands,
      bands: new Float32Array(BAND_COUNT),
      bandsNorm: new Float32Array(BAND_COUNT),
      onsets: new Float32Array(BAND_COUNT),
      peaks: new Float32Array(BAND_COUNT),
      wave: new Float32Array(WAVE_COUNT),
      chroma: new Float32Array(CHROMA),
      chromaPeak: 0, centroid: 0.5, spread: 0.5, flux: 0, level: 0, saturation: 0, autoGain: 1, energy: 0,
      beat: false, beatPulse: 0, beatCount: 0, bpm: 0, live: false, synthetic: true
    }
  }

  private ensureContext(): AudioContext {
    if (this.ctx) return this.ctx
    const AC: any = (window as any).AudioContext || (window as any).webkitAudioContext
    this.ctx = new AC()
    this.analyser = this.ctx!.createAnalyser()
    this.analyser.fftSize = 4096
    this.analyser.smoothingTimeConstant = this.config.smoothing
    this.analyser.minDecibels = -95
    this.analyser.maxDecibels = -10
    this.gainTrim = this.ctx!.createGain()
    this.gainTrim.gain.value = 1
    this.gainTrim.connect(this.analyser)
    this.freqData = new Uint8Array(this.analyser.frequencyBinCount)
    this.waveData = new Uint8Array(this.analyser.fftSize)
    this.started = true
    return this.ctx!
  }

  unlock() {
    this.ensureContext()
    if (this.ctx!.state === 'suspended') this.ctx!.resume()
    try { const buf = this.ctx!.createBuffer(1, 1, 22050); const s = this.ctx!.createBufferSource(); s.buffer = buf; s.connect(this.ctx!.destination); s.start(0) } catch {}
  }
  resume() { if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume() }

  private disconnect() {
    if (this.sourceNode) { try { this.sourceNode.disconnect() } catch {} this.sourceNode = null }
    if (this.stream) { this.stream.getTracks().forEach(t => t.stop()); this.stream = null }
    if (this.mediaEl) { try { this.mediaEl.pause(); } catch {} this.mediaEl = null }
    this.sourceLabel = 'none'; this.captureKind = 'none'; this.metrics.live = false
  }
  private resetAdaptive() {
    for (let i = 0; i < BAND_COUNT; i++) { this.binPeak[i] = 0; this.binRange[i].floor = 0; this.binRange[i].ceil = 0 }
    BAND_DEFS.forEach(d => { const b = this.bands[d.key]; b.peak = 0; b.floor = 0; b.ceil = 0 })
    this.energyRange.floor = 0; this.energyRange.ceil = 0
    this.autoGain = 1; if (this.gainTrim) this.gainTrim.gain.value = 1
  }
  private attachStream(s: MediaStream, label: string) {
    this.ensureContext(); this.disconnect(); this.resume()
    this.stream = s; this.sourceNode = this.ctx!.createMediaStreamSource(s); this.sourceNode.connect(this.gainTrim!)
    this.sourceLabel = label; this.lastSoundAt = performance.now(); this.resetAdaptive()
    s.getTracks().forEach(t => t.addEventListener('ended', () => { if (this.stream === s) { this.disconnect(); this.onStatusCb('ended', label) } }))
    this.onStatusCb('connected', label)
  }

  hasLiveCapture() { return this.captureKind === 'display' && this.stream && this.stream.getAudioTracks().some(t => t.readyState === 'live') }
  isStarted() { return this.started }
  sourceLabelStr() { return this.sourceLabel }
  onStatus(fn: (k: string, d: string) => void) { this.onStatusCb = fn }
  setSynthetic(on: boolean, bpm?: number) { this.synth.enabled = !!on; if (bpm) this.synth.bpm = bpm; this.metrics.synthetic = this.synth.enabled }
  setAutoLevel(on: boolean) { this.config.autoLevel = !!on; if (!on && this.gainTrim) { this.autoGain = 1; this.gainTrim.gain.value = 1 } }
  setSmoothing(v: number) { this.config.smoothing = v; if (this.analyser) this.analyser.smoothingTimeConstant = v }

  async useMicrophone() {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }, video: false })
      this.attachStream(s, 'microphone'); this.captureKind = 'mic'; return true
    } catch { this.onStatusCb('error', 'Microphone access was denied.'); return false }
  }

  async useSystemAudio(label?: string, force?: boolean) {
    if (!force && this.hasLiveCapture()) { this.sourceLabel = label || this.sourceLabel; this.resetAdaptive(); this.onStatusCb('connected', this.sourceLabel + ' (already capturing)'); return true }
    if (!navigator.mediaDevices || !(navigator.mediaDevices as any).getDisplayMedia) { this.onStatusCb('error', 'This browser cannot capture system audio.'); return false }
    try {
      const s: MediaStream = await (navigator.mediaDevices as any).getDisplayMedia({ preferCurrentTab: true, systemAudio: 'include', video: true, audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } })
      if (s.getAudioTracks().length === 0) { s.getTracks().forEach(t => t.stop()); this.onStatusCb('error', 'No audio track shared — tick "Share system audio" / "Share tab audio"'); return false }
      s.getVideoTracks().forEach(t => t.stop()); this.attachStream(s, label || 'system audio'); this.captureKind = 'display'
      s.getAudioTracks().forEach(t => t.addEventListener('ended', () => this.captureKind = 'none'))
      return true
    } catch { this.onStatusCb('error', 'System audio capture was cancelled.'); return false }
  }

  useFile(file: File) {
    this.ensureContext(); this.disconnect(); this.resume()
    const el = new Audio(); el.src = URL.createObjectURL(file); el.crossOrigin = 'anonymous'; el.loop = true
    this.mediaEl = el; this.sourceNode = this.ctx!.createMediaElementSource(el); this.sourceNode.connect(this.gainTrim!); this.sourceNode.connect(this.ctx!.destination)
    this.sourceLabel = 'file: ' + file.name; this.captureKind = 'file'; this.resetAdaptive()
    el.play().catch(() => this.onStatusCb('error', 'Could not play that file.')); this.lastSoundAt = performance.now(); this.onStatusCb('connected', this.sourceLabel); return el
  }
  useMediaElement(src: string, label: string, opts?: { loop?: boolean; autoplay?: boolean; volume?: number; kind?: any }) {
    this.ensureContext(); this.disconnect(); this.resume()
    const el = new Audio(); el.crossOrigin = 'anonymous'; el.loop = !!opts?.loop; el.autoplay = !!opts?.autoplay; if (opts?.volume !== undefined) el.volume = opts.volume; el.src = src
    this.mediaEl = el; this.sourceNode = this.ctx!.createMediaElementSource(el); this.sourceNode.connect(this.gainTrim!); this.sourceNode.connect(this.ctx!.destination)
    this.sourceLabel = label; this.captureKind = opts?.kind || 'file'; this.resetAdaptive()
    const p = el.play(); if (p && (p as any).catch) (p as any).catch((e: any) => this.onStatusCb('error', 'Tap Play to start audio (' + (e?.message || 'autoplay blocked') + ')'))
    this.lastSoundAt = performance.now(); this.onStatusCb('connected', this.sourceLabel); el.addEventListener('error', () => this.onStatusCb('error', 'Audio load failed — CORS or network. Try another track.')); return el
  }
  useDemo(idx?: number) {
    if (typeof idx === 'number') this.demoIdx = ((idx % DEMO_TRACKS.length) + DEMO_TRACKS.length) % DEMO_TRACKS.length
    const track = DEMO_TRACKS[this.demoIdx]; const el = this.useMediaElement(track.url, 'demo: ' + track.title + ' — ' + track.artist, { loop: true, kind: 'demo' as any }); this.synth.bpm = track.bpm; this.setSynthetic(false); if (this.gainTrim) this.gainTrim.gain.value = 1.1; return el
  }
  nextDemo() { this.demoIdx = (this.demoIdx + 1) % DEMO_TRACKS.length; return this.useDemo(this.demoIdx) }
  async useYouTube(youtubeUrl: string) {
    const idMatch = (youtubeUrl || '').match(/(?:v=|\.be\/|embed\/)([A-Za-z0-9_-]{11})/)
    if (!idMatch) { this.onStatusCb('error', 'That does not look like a YouTube link. Paste a full youtube.com/watch?v= URL.'); return null }
    const videoId = idMatch[1]
    try { const r = await fetch('/api/youtube?id=' + encodeURIComponent(videoId)); if (r.ok) { const j: any = await r.json(); if (j && j.audioUrl) return this.useMediaElement(j.audioUrl, 'youtube: ' + (j.title || videoId), { loop: false, kind: 'youtube' as any }) } } catch {}
    this.onStatusCb('error', 'Direct YouTube audio not available on this host. Use Demo Rave / File / System capture (tab audio).'); return null
  }

  // Multi-band uniform snapshot for TSL/GLSL
  getUniforms() {
    return {
      bass: this.bands.bass?.norm || 0, mid: this.bands.mid?.norm || 0, treble: this.bands.air?.norm || 0,
      lowMid: this.bands.lowMid?.norm || 0, highMid: this.bands.highMid?.norm || 0,
      presence: this.bands.presence?.norm || 0, subBass: this.bands.subBass?.norm || 0,
      energy: this.metrics.energy, beat: this.metrics.beat ? 1 : 0, beatPulse: this.metrics.beatPulse,
      centroid: this.metrics.centroid, flux: this.metrics.flux, level: this.metrics.level
    }
  }

  // internal mappers
  private buildMaps() {
    const nyquist = this.ctx!.sampleRate / 2; const bins = this.analyser!.frequencyBinCount; const fMin = 25, fMax = Math.min(17000, nyquist)
    this.bandEdges = new Int32Array(BAND_COUNT + 1)
    for (let i = 0; i <= BAND_COUNT; i++) { const f = fMin * Math.pow(fMax / fMin, i / BAND_COUNT); this.bandEdges[i] = Math.min(bins - 1, Math.max(1, Math.round(f / nyquist * bins))) }
    for (let i = 1; i <= BAND_COUNT; i++) if (this.bandEdges[i] <= this.bandEdges[i - 1]) this.bandEdges[i] = this.bandEdges[i - 1] + 1
    this.bandDefBins = BAND_DEFS.map(d => [Math.max(1, Math.floor(d.lo / nyquist * bins)), Math.min(bins - 1, Math.ceil(d.hi / nyquist * bins))] as [number, number])
    this.chromaMap = new Int8Array(bins).fill(-1); const binHz = nyquist / bins
    for (let b = 1; b < bins; b++) { const f = b * binHz; if (f < 65 || f > 2100) continue; const midi = 69 + 12 * Math.log2(f / 440); this.chromaMap[b] = ((Math.round(midi) % 12) + 12) % 12 }
  }

  private updateAutoLevel(rawLevel: number, saturation: number) {
    if (!this.config.autoLevel || !this.gainTrim) return
    if (saturation > 0.25) this.autoGain *= 0.97
    else if (rawLevel > 0.0015) this.autoGain *= 1 + (TARGET_LEVEL - rawLevel) * 0.06
    else return
    this.autoGain = Math.max(GAIN_MIN, Math.min(GAIN_MAX, this.autoGain))
    const target = this.autoGain, cur = this.gainTrim.gain.value
    this.gainTrim.gain.value = cur + (target - cur) * 0.1
  }

  update(now: number): Metrics {
    if (!this.started || !this.analyser) { if (this.synth.enabled) this.synthesize(now); return this.metrics }
    if (!this.bandEdges) this.buildMaps()
    this.analyser!.getByteFrequencyData(this.freqData as any)
    this.analyser!.getByteTimeDomainData(this.waveData as any)
    const g = this.config.gain
    let flux = 0, weighted = 0, total = 0, hot = 0
    for (let i = 0; i < BAND_COUNT; i++) {
      const lo = this.bandEdges![i], hi = this.bandEdges![i + 1]; let sum = 0
      for (let b = lo; b < hi; b++) { sum += this.freqData![b]; if (this.freqData![b] > 250) hot++ }
      const v = clamp01(sum / Math.max(1, hi - lo) / 255 * g)
      this.metrics.bands[i] += (v - this.metrics.bands[i]) * 0.45
      const d = v - this.binPrev[i]; if (d > 0) flux += d
      this.metrics.onsets[i] = Math.max(this.metrics.onsets[i] * 0.86, d > 0.035 ? clamp01(d * 6) : 0); this.binPrev[i] = v
      const n = rangeNorm(this.binRange[i], v); this.binPeak[i] = this.binRange[i].ceil; this.metrics.bandsNorm[i] = v + (n - v) * this.config.adaptive
      this.metrics.peaks[i] = Math.max(this.metrics.peaks[i] * 0.965, this.metrics.bands[i])
      weighted += i * v; total += v
    }
    this.metrics.flux = clamp01(flux / 6)
    const centroidRaw = total > 0.001 ? weighted / total / BAND_COUNT : 0.5
    this.metrics.centroid += (centroidRaw - this.metrics.centroid) * 0.12
    let dev = 0; if (total > 0.001) { for (let i = 0; i < BAND_COUNT; i++) dev += Math.abs(i / BAND_COUNT - centroidRaw) * this.metrics.bands[i]; dev /= total }
    this.metrics.spread += (clamp01(dev * 3) - this.metrics.spread) * 0.1

    for (let k = 0; k < BAND_DEFS.length; k++) {
      const b = this.bands[BAND_DEFS[k].key], range = this.bandDefBins![k]
      let sum = 0; for (let i = range[0]; i <= range[1]; i++) sum += this.freqData![i]
      const raw = clamp01(sum / Math.max(1, range[1] - range[0] + 1) / 255 * g)
      b.raw = raw; b.level += (raw - b.level) * 0.4; b.norm = b.raw + (rangeNorm(b, raw) - b.raw) * this.config.adaptive
      b.env += b.norm > b.env ? (b.norm - b.env) * this.config.attack : (b.norm - b.env) * this.config.release
      const rise = raw - b.prev; b.hit = rise > 0.05 && b.norm > 0.35; b.onset = Math.max(b.onset * 0.85, b.hit ? clamp01(rise * 7) : 0); b.prev = raw
    }
    this.metrics.bass = this.bands.bass.norm; this.metrics.lowMid = this.bands.lowMid.norm; this.metrics.mid = this.bands.mid.norm; this.metrics.highMid = this.bands.highMid.norm; this.metrics.treble = this.bands.air.norm

    for (let i = 0; i < CHROMA; i++) this.metrics.chroma[i] *= 0.82
    let chromaTotal = 0
    for (let b = 1; b < this.chromaMap!.length; b++) { const c = this.chromaMap![b]; if (c < 0) continue; const v = this.freqData![b] / 255; this.metrics.chroma[c] += v * 0.18; chromaTotal += v }
    let best = 0; for (let i = 1; i < CHROMA; i++) if (this.metrics.chroma[i] > this.metrics.chroma[best]) best = i
    if (chromaTotal > 0.5) this.metrics.chromaPeak = best

    let rms = 0; const step = this.waveData!.length / WAVE_COUNT
    for (let i = 0; i < WAVE_COUNT; i++) { const v = (this.waveData![Math.floor(i * step)] - 128) / 128; this.metrics.wave[i] = v; rms += v * v }
    const rawLevel = Math.sqrt(rms / WAVE_COUNT)
    this.metrics.level = clamp01(rawLevel * 2.2 * g)
    this.metrics.saturation = hot / Math.max(1, this.bandEdges![BAND_COUNT] - this.bandEdges![0])
    this.metrics.autoGain = this.gainTrim ? this.gainTrim.gain.value : 1
    this.updateAutoLevel(rawLevel, this.metrics.saturation)
    this.metrics.energy = this.metrics.level + (rangeNorm(this.energyRange, this.metrics.level) - this.metrics.level) * this.config.adaptive
    this.detectBeat(now)
    if (this.metrics.level > 0.012) this.lastSoundAt = now
    const audible = (now - this.lastSoundAt) < 2200
    if (audible !== this.metrics.live && this.sourceLabel !== 'none') { this.metrics.live = audible; this.onStatusCb(audible ? 'audible' : 'silent', this.sourceLabel) }
    if (this.synth.enabled && !audible) this.synthesize(now)
    return this.metrics
  }

  private detectBeat(now: number) {
    const drive = Math.max(this.bands.subBass.norm, this.bands.bass.norm)
    this.driveHistory.shift(); this.driveHistory.push(drive)
    let mean = 0; for (let i = 0; i < this.driveHistory.length; i++) mean += this.driveHistory[i]; mean /= this.driveHistory.length
    let varSum = 0; for (let i = 0; i < this.driveHistory.length; i++) { const d = this.driveHistory[i] - mean; varSum += d * d }
    const stdDev = Math.sqrt(varSum / this.driveHistory.length)
    const threshold = mean + this.config.sensitivity * stdDev
    const onsetHit = this.bands.bass.hit || this.bands.subBass.hit
    const hit = drive > threshold && drive > 0.25 && onsetHit && (now - this.lastBeatAt) > 180
    this.metrics.beat = hit
    if (hit) {
      if (this.lastBeatAt) {
        const interval = now - this.lastBeatAt
        if (interval > 250 && interval < 1500) { this.beatTimes.push(interval); if (this.beatTimes.length > 16) this.beatTimes.shift(); const s = this.beatTimes.slice().sort((a, b) => a - b); this.metrics.bpm = Math.round(60000 / s[s.length >> 1]); this.synth.bpm = this.metrics.bpm }
      }
      this.lastBeatAt = now; this.metrics.beatCount++; this.metrics.beatPulse = 1
    } else this.metrics.beatPulse *= 0.90
  }

  private synthesize(now: number) {
    const t = now / 1000; const beatLen = 60 / this.synth.bpm; const prev = this.synth.phase; this.synth.phase = (t % beatLen) / beatLen; const wrapped = this.synth.phase < prev; const env = Math.pow(1 - this.synth.phase, 2.4); const o = this.synth.seed
    const vals: any = { subBass: 0.30 + env * 0.62, bass: 0.26 + env * 0.60 + Math.sin(t * 0.7 + o) * 0.06, lowMid: 0.24 + env * 0.32 + Math.sin(t * 1.3 + o) * 0.10, mid: 0.26 + Math.sin(t * 2.1 + o) * 0.18 + env * 0.20, highMid: 0.22 + Math.sin(t * 3.3 + o * 1.7) * 0.17 + env * 0.16, presence: 0.20 + Math.abs(Math.sin(t * 4.2 + o * 2)) * 0.24 + env * 0.14, air: 0.18 + Math.abs(Math.sin(t * 5.1 + o * 2.3)) * 0.28 + env * 0.12 }
    BAND_DEFS.forEach(d => { const b = this.bands[d.key]; const v = clamp01(vals[d.key]); b.raw = v; b.level = v; b.norm = v; b.env += v > b.env ? (v - b.env) * this.config.attack : (v - b.env) * this.config.release; b.hit = wrapped && (d.key === 'bass' || d.key === 'subBass'); b.onset = Math.max(b.onset * 0.85, b.hit ? 1 : 0) })
    this.metrics.bass = this.bands.bass.norm; this.metrics.lowMid = this.bands.lowMid.norm; this.metrics.mid = this.bands.mid.norm; this.metrics.highMid = this.bands.highMid.norm; this.metrics.treble = this.bands.air.norm
    this.metrics.level = clamp01(0.25 + env * 0.4); this.metrics.energy = this.metrics.level; this.metrics.flux = env * 0.8; this.metrics.centroid = 0.4 + Math.sin(t * 0.3) * 0.15; this.metrics.spread = 0.5
    for (let i = 0; i < BAND_COUNT; i++) { const n = i / BAND_COUNT; const shape = Math.pow(1 - n, 1.15); const wob = 0.5 + 0.5 * Math.sin(t * (1.2 + n * 5) + i * 0.5 + o); const v = clamp01(shape * (0.35 + 0.65 * wob) * (0.55 + env * 0.75)); this.metrics.bands[i] += (v - this.metrics.bands[i]) * 0.3; this.metrics.bandsNorm[i] = clamp01(v / (shape + 0.15)); this.metrics.onsets[i] = Math.max(this.metrics.onsets[i] * 0.86, wrapped ? Math.random() * 0.7 : 0); this.metrics.peaks[i] = Math.max(this.metrics.peaks[i] * 0.965, this.metrics.bands[i]) }
    for (let i = 0; i < WAVE_COUNT; i++) { const p = i / WAVE_COUNT; this.metrics.wave[i] = Math.sin(p * Math.PI * 2 * 3 + t * 4) * 0.4 * (0.4 + env) + Math.sin(p * Math.PI * 2 * 11 + t * 9) * 0.16 * this.metrics.treble + Math.sin(p * Math.PI * 2 * 27 + t * 3) * 0.06 }
    for (let i = 0; i < CHROMA; i++) this.metrics.chroma[i] *= 0.9; const pc = Math.floor((t * 0.25 + o) % 12); this.metrics.chroma[pc] = Math.min(1, this.metrics.chroma[pc] + 0.3); this.metrics.chromaPeak = pc
    this.metrics.beat = wrapped; if (wrapped) { this.metrics.beatCount++; this.metrics.beatPulse = 1 } else this.metrics.beatPulse *= 0.9; this.metrics.bpm = this.synth.bpm
  }
}
