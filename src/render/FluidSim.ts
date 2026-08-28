/**
 * FluidSim — WebGL2 Navier-Stokes + WebGPU compute scaffold
 * Greenfield TS, TSL-ready. Falls back to FBO fragment passes (proven).
 * Exposes splat() + applyAudioParams() for audio-reactive forces & multi-touch.
 */
import { Palette } from '../core/Palette'

type FBO = { texture: WebGLTexture; fbo: WebGLFramebuffer; width: number; height: number; attach(id: number): number }
type DoubleFBO = { read: FBO; write: FBO; swap(): void }

function createShader(gl: WebGL2RenderingContext, type: number, src: string): WebGLShader {
  const s = gl.createShader(type)!; gl.shaderSource(s, src); gl.compileShader(s)
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || 'compile fail')
  return s
}
class Program {
  program: WebGLProgram; uniforms: Record<string, WebGLUniformLocation> = {}
  constructor(private gl: WebGL2RenderingContext, vs: string, fs: string) {
    const vsS = createShader(gl, gl.VERTEX_SHADER, vs), fsS = createShader(gl, gl.FRAGMENT_SHADER, fs)
    this.program = gl.createProgram()!; gl.attachShader(this.program, vsS); gl.attachShader(this.program, fsS)
    gl.bindAttribLocation(this.program, 0, 'aPosition'); gl.linkProgram(this.program)
    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(this.program) || 'link fail')
    const n = gl.getProgramParameter(this.program, gl.ACTIVE_UNIFORMS)
    for (let i = 0; i < n; i++) { const info = gl.getActiveUniform(this.program, i)!; this.uniforms[info.name] = gl.getUniformLocation(this.program, info.name)! }
  }
  bind() { this.gl.useProgram(this.program) }
}

const baseVS = `#version 300 es
precision highp float; in vec2 aPosition; out vec2 vUv;
void main(){ vUv=aPosition*0.5+0.5; gl_Position=vec4(aPosition,0.0,1.0); }`

const splatFS = `#version 300 es
precision highp float; in vec2 vUv; out vec4 fragColor;
uniform sampler2D uTarget; uniform float uAspectRatio; uniform vec3 uColor; uniform vec2 uPoint; uniform float uRadius;
void main(){ vec2 p=vUv-uPoint; p.x*=uAspectRatio; vec3 splat=exp(-dot(p,p)/uRadius)*uColor; vec3 base=texture(uTarget,vUv).xyz; fragColor=vec4(base+splat,1.0); }`

const advectFS = `#version 300 es
precision highp float; in vec2 vUv; out vec4 fragColor;
uniform sampler2D uVelocity; uniform sampler2D uSource; uniform vec2 uTexelSize; uniform float uDt; uniform float uDissipation;
void main(){ vec2 coord=vUv - uDt*texture(uVelocity,vUv).xy*uTexelSize; fragColor=uDissipation*texture(uSource,coord); }`

const divergenceFS = `#version 300 es
precision highp float; in vec2 vUv; out vec4 fragColor; uniform sampler2D uVelocity; uniform vec2 uTexelSize;
void main(){ float L=texture(uVelocity,vUv-vec2(uTexelSize.x,0.0)).x; float R=texture(uVelocity,vUv+vec2(uTexelSize.x,0.0)).x; float T=texture(uVelocity,vUv+vec2(0.0,uTexelSize.y)).y; float B=texture(uVelocity,vUv-vec2(0.0,uTexelSize.y)).y; fragColor=vec4(0.5*(R-L+T-B),0.0,0.0,1.0); }`

const curlFS = `#version 300 es
precision highp float; in vec2 vUv; out vec4 fragColor; uniform sampler2D uVelocity; uniform vec2 uTexelSize;
void main(){ float L=texture(uVelocity,vUv-vec2(uTexelSize.x,0.0)).y; float R=texture(uVelocity,vUv+vec2(uTexelSize.x,0.0)).y; float T=texture(uVelocity,vUv+vec2(0.0,uTexelSize.y)).x; float B=texture(uVelocity,vUv-vec2(0.0,uTexelSize.y)).x; fragColor=vec4(0.5*(R-L-T+B),0.0,0.0,1.0); }`

const vorticityFS = `#version 300 es
precision highp float; in vec2 vUv; out vec4 fragColor; uniform sampler2D uVelocity; uniform sampler2D uCurl; uniform vec2 uTexelSize; uniform float uCurlScale; uniform float uDt;
void main(){
 float L=texture(uCurl,vUv-vec2(uTexelSize.x,0.0)).x; float R=texture(uCurl,vUv+vec2(uTexelSize.x,0.0)).x; float T=texture(uCurl,vUv+vec2(0.0,uTexelSize.y)).x; float B=texture(uCurl,vUv-vec2(0.0,uTexelSize.y)).x; float C=texture(uCurl,vUv).x;
 vec2 force=0.5*vec2(abs(T)-abs(B), abs(R)-abs(L)); float l=length(force)+0.00001; force=(force/l)*uCurlScale*C; force.y*=-1.0;
 vec2 vel=texture(uVelocity,vUv).xy; fragColor=vec4(vel+force*uDt,0.0,1.0);
}`

const pressureFS = `#version 300 es
precision highp float; in vec2 vUv; out vec4 fragColor; uniform sampler2D uPressure; uniform sampler2D uDivergence; uniform vec2 uTexelSize;
void main(){ float L=texture(uPressure,vUv-vec2(uTexelSize.x,0.0)).x; float R=texture(uPressure,vUv+vec2(uTexelSize.x,0.0)).x; float T=texture(uPressure,vUv+vec2(0.0,uTexelSize.y)).x; float B=texture(uPressure,vUv-vec2(0.0,uTexelSize.y)).x; float div=texture(uDivergence,vUv).x; fragColor=vec4((L+R+B+T-div)*0.25,0.0,0.0,1.0); }`

const gradSubFS = `#version 300 es
precision highp float; in vec2 vUv; out vec4 fragColor; uniform sampler2D uPressure; uniform sampler2D uVelocity; uniform vec2 uTexelSize;
void main(){ float L=texture(uPressure,vUv-vec2(uTexelSize.x,0.0)).x; float R=texture(uPressure,vUv+vec2(uTexelSize.x,0.0)).x; float T=texture(uPressure,vUv+vec2(0.0,uTexelSize.y)).x; float B=texture(uPressure,vUv-vec2(0.0,uTexelSize.y)).x; vec2 v=texture(uVelocity,vUv).xy; v-=vec2(R-L,T-B)*0.5; fragColor=vec4(v,0.0,1.0); }`

const displayFS = `#version 300 es
precision highp float; in vec2 vUv; out vec4 fragColor; uniform sampler2D uTexture; uniform float uExposure; uniform float uFractal; uniform float uTime; uniform float uAspect;
vec2 fold(vec2 p,float amt,float t){ for(int i=0;i<4;i++){ p=abs(p)-0.42*amt; float a=t*0.05+float(i)*0.7; float c=cos(a), s=sin(a); p=mat2(c,-s,s,c)*p; p*=1.0+0.26*amt; } return p; }
void main(){
 vec2 uv=vUv;
 if(uFractal>0.001){ vec2 p=(vUv-0.5)*vec2(uAspect,1.0); vec2 f=fold(p,uFractal,uTime); uv=mix(vUv, fract(f/vec2(uAspect,1.0)+0.5), uFractal); }
 vec3 c=texture(uTexture,uv).rgb*uExposure; float peak=max(c.r,max(c.g,c.b)); vec3 m=c/(1.0+peak); m=pow(m, vec3(1.0/2.2)); fragColor=vec4(m,1.0);
}`

const clearFS = `#version 300 es
precision highp float; in vec2 vUv; out vec4 fragColor; uniform sampler2D uTexture; uniform float uValue;
void main(){ fragColor=uValue*texture(uTexture,vUv); }`

export class FluidSim {
  canvas: HTMLCanvasElement; gl: WebGL2RenderingContext | null = null
  // TSL/WebGPU placeholder: if navigator.gpu, compute path can replace fragment advect
  private useWGSL = false
  config = {
    SIM_RESOLUTION: 256, DYE_RESOLUTION: 1024,
    DENSITY_DISSIPATION: 0.98, VELOCITY_DISSIPATION: 0.98,
    PRESSURE_ITERATIONS: 20, CURL: 30, VISCOSITY: 0.3, SPLAT_RADIUS: 0.25,
    BLOOM: 1.0, SPLAT_BUDGET: 26, AUDIO_CURL_GAIN: 28, AUDIO_DISS_GAIN: 0.035, AUDIO_RADIUS_GAIN: 0.10
  }
  private quad: WebGLBuffer | null = null
  private progs: Record<string, Program> = {}
  private density!: DoubleFBO; private velocity!: DoubleFBO; private pressure!: DoubleFBO
  private divergence!: FBO; private curl!: FBO
  private splatsThisFrame = 0
  private ready = false

  constructor(canvas: HTMLCanvasElement) { this.canvas = canvas }

  init(): boolean {
    this.gl = this.canvas.getContext('webgl2', { alpha: false, depth: false, stencil: false, antialias: false }) as any
    if (!this.gl) return false
    if (!this.gl.getExtension('EXT_color_buffer_float')) return false
    // WebGPU hint: navigator.gpu?.requestAdapter
    if ((navigator as any).gpu) this.useWGSL = false // keep FBO path until WGSL compute is validated; flag shows future TSL hook
    this.quad = this.gl.createBuffer(); this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.quad!); this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), this.gl.STATIC_DRAW)
    this.progs.clear = new Program(this.gl, baseVS, clearFS)
    this.progs.splat = new Program(this.gl, baseVS, splatFS)
    this.progs.advect = new Program(this.gl, baseVS, advectFS)
    this.progs.divergence = new Program(this.gl, baseVS, divergenceFS)
    this.progs.curl = new Program(this.gl, baseVS, curlFS)
    this.progs.vorticity = new Program(this.gl, baseVS, vorticityFS)
    this.progs.pressure = new Program(this.gl, baseVS, pressureFS)
    this.progs.gradSub = new Program(this.gl, baseVS, gradSubFS)
    this.progs.display = new Program(this.gl, baseVS, displayFS)
    this.ready = true; this.resize(); return true
  }

  resize() {
    if (!this.gl) return
    const cap = (window as any).MF_MOBILE ? 1.5 : 2
    const dpr = Math.min(window.devicePixelRatio || 1, cap)
    const cw = this.canvas.clientWidth || window.innerWidth, ch = this.canvas.clientHeight || window.innerHeight
    const w = Math.max(1, Math.floor(cw * dpr)), h = Math.max(1, Math.floor(ch * dpr))
    if (this.canvas.width !== w || this.canvas.height !== h) { this.canvas.width = w; this.canvas.height = h; this.initFBOs() }
  }

  private createFBO(w: number, h: number, internalFormat: number, format: number, type: number, filter: number): FBO {
    const gl = this.gl!; gl.activeTexture(gl.TEXTURE0); const tex = gl.createTexture()!
    gl.bindTexture(gl.TEXTURE_2D, tex); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null)
    const fbo = gl.createFramebuffer()!; gl.bindFramebuffer(gl.FRAMEBUFFER, fbo); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0); gl.viewport(0, 0, w, h); gl.clear(gl.COLOR_BUFFER_BIT)
    return { texture: tex, fbo, width: w, height: h, attach(id: number) { gl.activeTexture(gl.TEXTURE0 + id); gl.bindTexture(gl.TEXTURE_2D, tex); return id } }
  }
  private createDoubleFBO(w: number, h: number, internalFormat: number, format: number, type: number, filter: number): DoubleFBO {
    let a = this.createFBO(w, h, internalFormat, format, type, filter), b = this.createFBO(w, h, internalFormat, format, type, filter)
    return { get read() { return a }, set read(v) { a = v }, get write() { return b }, set write(v) { b = v }, swap() { const t = a; a = b; b = t } }
  }
  private initFBOs() {
    const gl = this.gl!; const filtering = gl.LINEAR
    const aspect = this.canvas.height / this.canvas.width
    const simW = this.config.SIM_RESOLUTION, simH = Math.max(1, Math.round(this.config.SIM_RESOLUTION * aspect))
    const dyeW = this.config.DYE_RESOLUTION, dyeH = Math.max(1, Math.round(this.config.DYE_RESOLUTION * aspect))
    this.density = this.createDoubleFBO(dyeW, dyeH, gl.RGBA16F, gl.RGBA, gl.HALF_FLOAT, filtering)
    this.velocity = this.createDoubleFBO(simW, simH, gl.RG16F, gl.RG, gl.HALF_FLOAT, filtering)
    this.pressure = this.createDoubleFBO(simW, simH, gl.R16F, gl.RED, gl.HALF_FLOAT, gl.NEAREST)
    this.divergence = this.createFBO(simW, simH, gl.R16F, gl.RED, gl.HALF_FLOAT, gl.NEAREST)
    this.curl = this.createFBO(simW, simH, gl.R16F, gl.RED, gl.HALF_FLOAT, gl.NEAREST)
  }
  private renderQuad(target: FBO | null) {
    const gl = this.gl!; gl.bindFramebuffer(gl.FRAMEBUFFER, target ? target.fbo : null)
    if (target) gl.viewport(0, 0, target.width, target.height); else gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quad); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0); gl.enableVertexAttribArray(0); gl.drawArrays(gl.TRIANGLES, 0, 3)
  }

  beginFrame() { this.splatsThisFrame = 0 }
  splatsUsed() { return this.splatsThisFrame }
  splat(x: number, y: number, dx: number, dy: number, color: { r: number; g: number; b: number }, radiusScale?: number): boolean {
    if (!this.ready) return false
    if (this.splatsThisFrame >= this.config.SPLAT_BUDGET) return false
    this.splatsThisFrame++
    const p = this.progs.splat; p.bind()
    const radius = (this.config.SPLAT_RADIUS * (radiusScale || 1)) / 100.0
    const gl = this.gl!
    gl.uniform1f(p.uniforms.uAspectRatio, this.canvas.width / this.canvas.height)
    gl.uniform2f(p.uniforms.uPoint, x, y); gl.uniform1f(p.uniforms.uRadius, radius)
    gl.uniform1i(p.uniforms.uTarget, this.velocity.read.attach(0)); gl.uniform3f(p.uniforms.uColor, dx, dy, 0.0); this.renderQuad(this.velocity.write); this.velocity.swap()
    gl.uniform1i(p.uniforms.uTarget, this.density.read.attach(0)); gl.uniform3f(p.uniforms.uColor, color.r, color.g, color.b); this.renderQuad(this.density.write); this.density.swap()
    return true
  }
  clear() {
    if (!this.ready) return; const p = this.progs.clear; p.bind()
    this.gl!.uniform1i(p.uniforms.uTexture, this.density.read.attach(0)); this.gl!.uniform1f(p.uniforms.uValue, 0); this.renderQuad(this.density.write); this.density.swap()
    this.gl!.uniform1i(p.uniforms.uTexture, this.velocity.read.attach(0)); this.gl!.uniform1f(p.uniforms.uValue, 0); this.renderQuad(this.velocity.write); this.velocity.swap()
  }
  applyAudioParams(metrics: any, k: number) {
    if (!metrics) return { vort: this.config.CURL, diss: this.config.DENSITY_DISSIPATION }
    const vort = this.config.CURL + metrics.band.presence.env * this.config.AUDIO_CURL_GAIN * (k || 1)
    const diss = Math.max(0.88, this.config.DENSITY_DISSIPATION - metrics.band.mid.env * this.config.AUDIO_DISS_GAIN * (k || 1))
    return { vort, diss }
  }
  solve(dt: number, vorticityAmount: number, dissipation: number, fractalAmount: number, time: number) {
    const texel: [number, number] = [1.0 / this.velocity.read.width, 1.0 / this.velocity.read.height]
    let p: Program
    p = this.progs.curl; p.bind(); this.gl!.uniform2f(p.uniforms.uTexelSize, texel[0], texel[1]); this.gl!.uniform1i(p.uniforms.uVelocity, this.velocity.read.attach(0)); this.renderQuad(this.curl)
    p = this.progs.vorticity; p.bind(); this.gl!.uniform2f(p.uniforms.uTexelSize, texel[0], texel[1]); this.gl!.uniform1i(p.uniforms.uVelocity, this.velocity.read.attach(0)); this.gl!.uniform1i(p.uniforms.uCurl, this.curl.attach(1)); this.gl!.uniform1f(p.uniforms.uCurlScale, vorticityAmount); this.gl!.uniform1f(p.uniforms.uDt, dt); this.renderQuad(this.velocity.write); this.velocity.swap()
    p = this.progs.advect; p.bind(); this.gl!.uniform2f(p.uniforms.uTexelSize, texel[0], texel[1]); this.gl!.uniform1i(p.uniforms.uVelocity, this.velocity.read.attach(0)); this.gl!.uniform1i(p.uniforms.uSource, this.velocity.read.attach(0)); this.gl!.uniform1f(p.uniforms.uDt, dt); this.gl!.uniform1f(p.uniforms.uDissipation, this.config.VELOCITY_DISSIPATION); this.renderQuad(this.velocity.write); this.velocity.swap()
    this.gl!.uniform1i(p.uniforms.uVelocity, this.velocity.read.attach(0)); this.gl!.uniform1i(p.uniforms.uSource, this.density.read.attach(1)); this.gl!.uniform1f(p.uniforms.uDissipation, dissipation); this.renderQuad(this.density.write); this.density.swap()
    p = this.progs.divergence; p.bind(); this.gl!.uniform2f(p.uniforms.uTexelSize, texel[0], texel[1]); this.gl!.uniform1i(p.uniforms.uVelocity, this.velocity.read.attach(0)); this.renderQuad(this.divergence)
    p = this.progs.clear; p.bind(); this.gl!.uniform1i(p.uniforms.uTexture, this.pressure.read.attach(0)); this.gl!.uniform1f(p.uniforms.uValue, this.config.VISCOSITY); this.renderQuad(this.pressure.write); this.pressure.swap()
    p = this.progs.pressure; p.bind(); this.gl!.uniform2f(p.uniforms.uTexelSize, texel[0], texel[1]); this.gl!.uniform1i(p.uniforms.uDivergence, this.divergence.attach(0))
    for (let i = 0; i < this.config.PRESSURE_ITERATIONS; i++) { this.gl!.uniform1i(p.uniforms.uPressure, this.pressure.read.attach(1)); this.renderQuad(this.pressure.write); this.pressure.swap() }
    p = this.progs.gradSub; p.bind(); this.gl!.uniform2f(p.uniforms.uTexelSize, texel[0], texel[1]); this.gl!.uniform1i(p.uniforms.uPressure, this.pressure.read.attach(0)); this.gl!.uniform1i(p.uniforms.uVelocity, this.velocity.read.attach(1)); this.renderQuad(this.velocity.write); this.velocity.swap()
    p = this.progs.display; p.bind(); this.gl!.uniform1i(p.uniforms.uTexture, this.density.read.attach(0)); this.gl!.uniform1f(p.uniforms.uExposure, this.config.BLOOM); this.gl!.uniform1f(p.uniforms.uFractal, fractalAmount || 0); this.gl!.uniform1f(p.uniforms.uTime, (time || 0) * 0.001); this.gl!.uniform1f(p.uniforms.uAspect, this.canvas.width / this.canvas.height); this.renderQuad(null)
  }
  isReady() { return this.ready }
}
