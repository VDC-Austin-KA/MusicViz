/**
 * CyberGridEngine — Quantum Cyber Grid & Synthwave Horizon Mode
 * 3D synthwave landscape with audio FFT spectrum elevation terrain,
 * pulsating horizon sun, audio-reactive grid glow, zoom, and floating data particles.
 */
import { Palette } from '../core/Palette'

const vs = `#version 300 es
precision highp float;
in vec2 aPosition;
void main() { gl_Position = vec4(aPosition, 0.0, 1.0); }`

const fs = `#version 300 es
precision highp float;
out vec4 fragColor;

uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform float uBass;
uniform float uMid;
uniform float uTreble;
uniform float uEnergy;
uniform float uBeatPulse;
uniform float uZoom;
uniform vec2 uPan;
uniform float uSpeedScale;
uniform float uDetail;
uniform float uSpectrum[16];
uniform sampler2D uPal;
uniform float uPalShift;

vec3 samplePal(float t) {
  return texture(uPal, vec2(fract(t + uPalShift), 0.5)).rgb;
}

mat2 rot(float a) {
  float c = cos(a), s = sin(a);
  return mat2(c, -s, s, c);
}

void main() {
  vec2 uv = (gl_FragCoord.xy / uRes - 0.5) * vec2(uRes.x / uRes.y, 1.0);
  vec2 mouseOffset = (uMouse - 0.5) * 0.3;
  uv += mouseOffset - uPan;
  uv /= max(0.001, uZoom);

  vec3 col = vec3(0.02, 0.01, 0.05); // Deep space background

  // Horizon line
  float horizon = -0.05 + sin(uTime * 0.5) * 0.02;

  if (uv.y > horizon) {
    // Sky region: Synthwave Pulsing Horizon Sun & Starfield
    vec2 sunPos = vec2(0.0, horizon + 0.28);
    float sunDist = length(uv - sunPos);
    float sunRadius = (0.22 + uBass * 0.08 + uBeatPulse * 0.05) * min(2.0, max(0.5, uZoom));

    if (sunDist < sunRadius) {
      // Horizontal sun cuts
      float cut = step(0.015, fract((uv.y - sunPos.y + sunRadius) * (20.0 + uDetail * 20.0)));
      vec3 sunCol = mix(vec3(1.0, 0.2, 0.5), vec3(1.0, 0.8, 0.1), (uv.y - sunPos.y + sunRadius) / (sunRadius * 2.0));
      col = mix(col, sunCol, cut);
    } else {
      // Sun glow halo
      float halo = smoothstep(sunRadius + 0.3, sunRadius, sunDist) * (0.6 + uBass * 0.8);
      col += vec3(0.9, 0.1, 0.6) * halo;
    }

    // Sky gradient & stars
    float skyGrad = smoothstep(horizon, 0.6, uv.y);
    col = mix(col, samplePal(skyGrad * 0.4 + uTime * 0.02) * 0.3, 0.4);

    vec2 starUV = floor(uv * (30.0 + uDetail * 30.0));
    float starHash = fract(sin(dot(starUV, vec2(12.9898, 78.233))) * 43758.5453);
    float star = step(0.96 - uTreble * 0.03, starHash) * (0.3 + 0.7 * sin(uTime * 8.0 + starHash * 6.28));
    col += vec3(star) * vec3(0.6, 0.8, 1.0);
  } else {
    // Ground region: 3D Cyber Grid Perspective Projection
    float pY = (horizon - uv.y) + 0.001;
    float z = 1.0 / pY; // Depth projection
    vec2 p3d = vec2(uv.x * z, z + uTime * (1.5 + uBass * 2.0) * uSpeedScale);

    // Spectrum elevation displacement mapping along grid x
    float specIdx = clamp(abs(p3d.x) * 1.5, 0.0, 15.0);
    int idx = int(specIdx);
    float specVal = uSpectrum[idx];
    float elevation = specVal * 0.6 * (0.5 + 0.5 * sin(p3d.y * 0.5));

    // Grid lines calculation
    vec2 gridUV = fract(p3d);
    float lineX = smoothstep(0.06 + elevation * 0.08, 0.01, abs(gridUV.x - 0.5));
    float lineY = smoothstep(0.06 + elevation * 0.08, 0.01, abs(gridUV.y - 0.5));
    float grid = max(lineX, lineY);

    // Fog fading toward horizon
    float fog = smoothstep(0.0, 0.8, (horizon - uv.y) * 4.0);
    vec3 gridCol = samplePal(z * 0.03 + uTime * 0.02) * (1.2 + uBeatPulse * 1.0);

    col = mix(col, gridCol * (grid + elevation * 0.8), fog);

    // Ground glow pulse
    col += vec3(0.0, 0.8, 1.0) * (0.04 / (horizon - uv.y)) * (0.3 + uBass * 0.7);
  }

  // Tone mapping
  col = col / (1.0 + col);
  col = pow(col, vec3(1.0 / 2.2));

  fragColor = vec4(col, 1.0);
}`

export class CyberGridEngine {
  private gl: WebGL2RenderingContext | null = null
  private canvas: HTMLCanvasElement
  private palette: Palette
  private prog: WebGLProgram | null = null
  private quad: WebGLBuffer | null = null
  private palTex: WebGLTexture | null = null
  private uniforms: Record<string, WebGLUniformLocation> = {}
  private ready = false

  constructor(canvas: HTMLCanvasElement, palette: Palette) {
    this.canvas = canvas
    this.palette = palette
  }

  init(): boolean {
    this.gl = this.canvas.getContext('webgl2', { alpha: false }) as any
    if (!this.gl) return false

    const vsShader = this.gl.createShader(this.gl.VERTEX_SHADER)!
    this.gl.shaderSource(vsShader, vs)
    this.gl.compileShader(vsShader)

    const fsShader = this.gl.createShader(this.gl.FRAGMENT_SHADER)!
    this.gl.shaderSource(fsShader, fs)
    this.gl.compileShader(fsShader)
    if (!this.gl.getShaderParameter(fsShader, this.gl.COMPILE_STATUS)) {
      console.error('CyberGridEngine shader fail:', this.gl.getShaderInfoLog(fsShader))
      return false
    }

    this.prog = this.gl.createProgram()!
    this.gl.attachShader(this.prog, vsShader)
    this.gl.attachShader(this.prog, fsShader)
    this.gl.bindAttribLocation(this.prog, 0, 'aPosition')
    this.gl.linkProgram(this.prog)

    const names = ['uRes', 'uTime', 'uMouse', 'uBass', 'uMid', 'uTreble', 'uEnergy', 'uBeatPulse', 'uZoom', 'uPan', 'uSpeedScale', 'uDetail', 'uPal', 'uPalShift']
    names.forEach(n => this.uniforms[n] = this.gl!.getUniformLocation(this.prog!, n)!)
    for (let i = 0; i < 16; i++) {
      this.uniforms[`uSpectrum[${i}]`] = this.gl!.getUniformLocation(this.prog!, `uSpectrum[${i}]`)!
    }

    this.quad = this.gl.createBuffer()
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.quad)
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), this.gl.STATIC_DRAW)

    this.palTex = this.gl.createTexture()
    this.updatePalette()

    this.ready = true
    this.resize()
    return true
  }

  resize() {
    if (!this.gl) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const w = Math.floor((this.canvas.clientWidth || window.innerWidth) * dpr)
    const h = Math.floor((this.canvas.clientHeight || window.innerHeight) * dpr)
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w
      this.canvas.height = h
    }
  }

  private updatePalette() {
    if (!this.gl || !this.palTex) return
    const w = 256, data = new Uint8Array(w * 4)
    for (let i = 0; i < w; i++) {
      const c = this.palette.sample(i / w)
      data[i * 4] = Math.round(c.r * 255)
      data[i * 4 + 1] = Math.round(c.g * 255)
      data[i * 4 + 2] = Math.round(c.b * 255)
      data[i * 4 + 3] = 255
    }
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.palTex)
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR)
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR)
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, w, 1, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, data)
  }

  render(t: number, metrics: any, pointer: any, opts: any = {}) {
    if (!this.ready || !this.gl || !this.prog) return
    this.updatePalette()

    this.gl.useProgram(this.prog)
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height)

    this.gl.uniform2f(this.uniforms.uRes, this.canvas.width, this.canvas.height)
    this.gl.uniform1f(this.uniforms.uTime, t * 0.001)
    this.gl.uniform2f(this.uniforms.uMouse, pointer.x, pointer.y)
    this.gl.uniform1f(this.uniforms.uBass, metrics.bass || 0)
    this.gl.uniform1f(this.uniforms.uMid, metrics.mid || 0)
    this.gl.uniform1f(this.uniforms.uTreble, metrics.treble || 0)
    this.gl.uniform1f(this.uniforms.uEnergy, metrics.energy || 0)
    this.gl.uniform1f(this.uniforms.uBeatPulse, metrics.beatPulse || 0)
    this.gl.uniform1f(this.uniforms.uZoom, opts.zoom ?? 1)
    this.gl.uniform2f(this.uniforms.uPan, opts.pan?.x || 0, opts.pan?.y || 0)
    this.gl.uniform1f(this.uniforms.uSpeedScale, (opts.flySpeed ?? 1.0) * (opts.fly ? 1.6 : 1.0))
    this.gl.uniform1f(this.uniforms.uDetail, opts.detail ?? 0.6)
    this.gl.uniform1f(this.uniforms.uPalShift, (this.palette as any).flow(0, 0.01) % 1)

    if (metrics.bandsNorm) {
      for (let i = 0; i < 16; i++) {
        const val = metrics.bandsNorm[i * 4] || 0
        const loc = this.uniforms[`uSpectrum[${i}]`]
        if (loc) this.gl.uniform1f(loc, val)
      }
    }

    this.gl.activeTexture(this.gl.TEXTURE0)
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.palTex)
    this.gl.uniform1i(this.uniforms.uPal, 0)

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.quad)
    this.gl.vertexAttribPointer(0, 2, this.gl.FLOAT, false, 0, 0)
    this.gl.enableVertexAttribArray(0)
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 3)
  }
}
