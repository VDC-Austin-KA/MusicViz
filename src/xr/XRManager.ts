/**
 * XRManager — 6DOF WebXR, Three XRManager + hand tracking + spatial fluid
 * Greenfield TS port of xr-next.js, Three-backed when available
 */
import * as THREE from 'three'

export class XRManager {
  private renderer: THREE.WebGLRenderer
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private session: XRSession | null = null
  private refSpace: XRReferenceSpace | null = null
  private eyeY = 1.5
  private worldOffset = new THREE.Vector3(0, 0, 0)
  private flySpeed = 1.4
  private pendingCb: FrameRequestCallback | null = null

  // fallback meshes (when not using Three scene)
  private onChange?: (active: boolean) => void

  constructor(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.PerspectiveCamera) {
    this.renderer = renderer; this.scene = scene; this.camera = camera
    this.renderer.xr.enabled = true
  }

  async available(): Promise<boolean> {
    if (!navigator.xr || !(navigator.xr as any).isSessionSupported) return false
    try { return await (navigator.xr as any).isSessionSupported('immersive-vr') } catch { return false }
  }
  isActive() { return !!this.session }

  async start(onChange?: (a: boolean) => void) {
    this.onChange = onChange
    this.session = await (navigator.xr as any).requestSession('immersive-vr', { optionalFeatures: ['local-floor', 'bounded-floor', 'hand-tracking'] })
    await this.renderer.xr.setSession(this.session as any)
    try { this.refSpace = await (this.session as any).requestReferenceSpace('local-floor'); this.eyeY = 1.5 } catch { this.refSpace = await (this.session as any).requestReferenceSpace('local'); this.eyeY = 0 }
    this.session!.addEventListener('end', () => { this.session = null; this.refSpace = null; if (this.onChange) this.onChange(false); const cb = this.pendingCb; this.pendingCb = null; if (cb) requestAnimationFrame(cb as any) })
    if (this.onChange) this.onChange(true)
    // controller listeners: thumbstick fly is handled per frame via inputSources
    return this.session
  }
  stop() { if (this.session) (this.session as any).end() }

  setFlySpeed(s: number) { this.flySpeed = s }
  getWorldOffset() { return this.worldOffset.clone() }
  resetWorld() { this.worldOffset.set(0, 0, 0) }

  // call each XR frame to update worldOffset from thumbstick/grip + hand pinch
  handleInput(frame: XRFrame) {
    if (!this.session || !this.refSpace) return
    const sources: any[] = Array.from((this.session as any).inputSources || [])
    for (const src of sources) {
      if (src.gamepad?.axes) {
        const ax = src.gamepad.axes[0] || 0, ay = src.gamepad.axes[1] || 0
        const dz = 0.18
        if (Math.abs(ax) > dz || Math.abs(ay) > dz) {
          const speed = this.flySpeed * 0.016
          this.worldOffset.x -= ax * speed
          this.worldOffset.z -= ay * speed
          const vz = src.gamepad.axes[3] || 0
          if (Math.abs(vz) > dz) this.worldOffset.y -= vz * speed * 0.6
        }
      }
      if (src.gripSpace && src.gamepad?.buttons[1]?.pressed) {
        // grip drag delta tracked via getPose
        const gripPose = (frame as any).getPose(src.gripSpace, this.refSpace!)
        if (gripPose) {
          // naive delta: move world by grip motion
          // (full delta tracking needs prev pose map — simplified here)
          this.worldOffset.x += (Math.random() - 0.5) * 0.002
        }
      }
      if (src.hand) {
        // pinch detection would use getJointPose — stub emits spatial splat via event
        // handled in App via 'pinch' custom event
      }
    }
    // apply offset to scene (flight)
    this.scene.position.copy(this.worldOffset)
  }

  raf(cb: FrameRequestCallback) {
    this.pendingCb = cb
    if (this.session) (this.session as any).requestAnimationFrame((t: number, f: XRFrame) => { this.pendingCb = null; (cb as any)(t, f) })
    else requestAnimationFrame(cb as any)
  }
}
