/**
 * WarpEngine — Hyperspace Warp Tunnel Mode
 * Raymarched 3D Warp Tunnel with audio-reactive speed lines, chromatic aberration,
 * bass-driven field of view pulses, zoom, and neon light rings.
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
uniform sampler2D uPal;
uniform float uPalShift;

#define PI 3.14159265359

vec3 samplePal(float t) {
  return texture(uPal, vec2(fract(t + uPalShift), 0.5)).rgb;
}

mat2 rot(float a) {
  float c = cos(a), s = sin(a);
  return mat2(c, -s, s, c);
}

void main() {
  vec2 uv = (gl_FragCoord.xy / uRes - 0.5) * vec2(uRes.x / uRes.y, 1.0);
  vec2 mouseOffset = (uMouse - 0.5) * 0.4;
  uv += mouseOffset - uPan;
  uv /= max(0.001, uZoom);

  float radius = length(uv);
  float angle = atan(uv.y, uv.x);

  // Field of View & Warp Speed driven by audio bass, beat pulse, and speed scale
  float speed = uTime * (0.8 + uBass * 2.2 + uBeatPulse * 1.5) * uSpeedScale;
  float z = 1.0 / (radius + 0.02);

  vec2 tunnelUV = vec2(angle / (2.0 * PI) + 0.5, z + speed);
  tunnelUV.x *= (6.0 + floor(uDetail * 6.0)); // Detail lines

  // Grid pattern & speed lines
  float gridLines = smoothstep(0.04, 0.08, abs(fract(tunnelUV.x) - 0.5));
  float ringPulse = smoothstep(0.1, 0.25, abs(fract(tunnelUV.y * 0.5) - 0.5));

  // Starfield particle specks
  vec2 starUV = floor(tunnelUV * 12.0);
  float starHash = fract(sin(dot(starUV, vec2(12.9898, 78.233))) * 43758.5453);
  float star = step(0.94 - uTreble * 0.05, starHash) * (0.5 + 0.5 * sin(uTime * 10.0 + starHash * 6.28));

  // Color gradient sample
  float palIdx = z * 0.08 + uTime * 0.05;
  vec3 baseColor = samplePal(palIdx);

  vec3 col = baseColor * (gridLines * 0.4 + ringPulse * 0.8 + star * 1.5);
  col += vec3(0.1, 0.5, 1.0) * (0.15 / (radius + 0.05)) * (0.4 + uBass * 0.8);
  col *= smoothstep(0.0, 0.15, radius); // Center tunnel glow

  // Vignette
  col *= smoothstep(1.4, 0.3, radius);

  // Chromatic aberration on beat hit
  if (uBeatPulse > 0.3) {
    col.r += samplePal(palIdx + 0.04).r * uBeatPulse * 0.3;
    col.b += samplePal(palIdx - 0.04).b * uBeatPulse * 0.3;
  }

  // Tone mapping
  col = col / (1.0 + col);
  col = pow(col, vec3(1.0 / 2.2));

  fragColor = vec4(col, 1.0);
}`

export class WarpEngine {
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
      console.error('WarpEngine shader fail:', this.gl.getShaderInfoLog(fsShader))
      return false
    }

    this.prog = this.gl.createProgram()!
    this.gl.attachShader(this.prog, vsShader)
    this.gl.attachShader(this.prog, fsShader)
    this.gl.bindAttribLocation(this.prog, 0, 'aPosition')
    this.gl.linkProgram(this.prog)

    const names = ['uRes', 'uTime', 'uMouse', 'uBass', 'uMid', 'uTreble', 'uEnergy', 'uBeatPulse', 'uZoom', 'uPan', 'uSpeedScale', 'uDetail', 'uPal', 'uPalShift']
    names.forEach(n => this.uniforms[n] = this.gl!.getUniformLocation(this.prog!, n)!)

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

    this.gl.activeTexture(this.gl.TEXTURE0)
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.palTex)
    this.gl.uniform1i(this.uniforms.uPal, 0)

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.quad)
    this.gl.vertexAttribPointer(0, 2, this.gl.FLOAT, false, 0, 0)
    this.gl.enableVertexAttribArray(0)
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 3)
  }
}
