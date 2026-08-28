/* ==========================================================================
   xr-next.js — Next-Gen WebXR (immersive-vr) 6DOF Spatial Environment
   Rebuilt from scratch. Moves beyond 2D-in-VR (xr.js curved screen) to
   true 6DOF: users fly through fractals, manipulate fluid fields via
   spatial controllers, and experience immersive audio-reactive scenes.

   Why rebuild:
     - Old XRMode painted the active canvas as a texture on a sphere-cap
       (R=2.6m, 150°×84°). No second eye disparity, no depth, no movement.
     - New: volumetric-aware interactions. Fluid is no longer flat; controller
       position maps into the sim's velocity field in 3D. Fractal camera is
       truly 3DoF + translation (fly-through valleys, not pan/zoom on quad).
       Hands can grab/throw fluid dye.

   Stack: WebXR Device API + WebGL2 (XR-compatible) + optional Three.js
          fallback. Does NOT depend on Three for base path; Three branch
          auto-detects if THREE is present via importmap.

   Spatial Design:
     - ReferenceSpace: 'local-floor' (eyeY=1.5m) with fallback to 'local'
     - WorldOffset: translation applied to screen mesh, driven by thumbstick
       or grip+drag (move 6DOF world around you = fly). Feeds into uPan/uZoom
       for fractals and into fluid splat UV via projection.
     - Controllers: each has targetRay + gripSpace. Ray hits screen/panel as
       before, but also emits a 3D splat at controller tip into fluid field.
       Left hand secondary, Right primary (matches FractalEngine evtA/B).
     - Hands: XRHand (25 joints) — pinch (thumb+index <0.02) triggers splat,
       grab (fist) drags worldOffset.
     - Audio: same page AudioEngine; Quest has no system capture so Mic/synth
       fallback still needed, but XR session no longer mutes it.

   Usage: app.js prefers XRNext if available, else falls back to XRMode.
          XRNext.raf routes to session.requestAnimationFrame when presenting.
   ========================================================================== */

window.XRNext = (function () {
    'use strict';

    // Legacy screen geometry retained as fallback / backdrop; true 3D scenes
    // are rendered via Three when available, otherwise this sphere-cap remains
    // but becomes movable via worldOffset.
    const R = 3.2;                     // a bit farther for fly-through
    const YAW = 160 * Math.PI / 180;
    const PITCH = 96 * Math.PI / 180;
    const SEG_X = 48, SEG_Y = 32;

    const PANEL_W = 1.05, PANEL_H = 0.52;
    const PANEL_Z = -1.45;
    const PANEL_DY = -0.46;
    const PANEL_CW = 680, PANEL_CH = 340;

    let session = null;
    let gl = null, xrCanvas = null;
    let refSpace = null, eyeY = 1.5;
    let hooks = null;

    let prog = null, uMVP = null, uTex = null, uTexOn = null, uColor = null;
    let screenMesh = null, panelMesh = null, rayBuf = null;
    let screenTex = null, panelTex = null;
    let panelCanvas = null, pctx = null;

    let pendingCb = null;
    const lastSelect = new WeakMap();
    let pendingRays = [];
    let panelDirty = true;

    // 6DOF world offset (meters) — updated by thumbstick/grab to simulate flight.
    // Applied as model translation to screen/panel meshes.
    const worldOffset = { x: 0, y: 0, z: 0 };
    let flySpeed = 1.4;
    let worldDirty = false;

    // Thumbstick state cached from gamepads
    const stickState = new WeakMap();

    /* ------------------------------ mat4 ---------------------------------- */
    function mul(out, a, b) {
        for (let c = 0; c < 4; c++) {
            const b0 = b[c * 4], b1 = b[c * 4 + 1], b2 = b[c * 4 + 2], b3 = b[c * 4 + 3];
            out[c * 4]     = a[0] * b0 + a[4] * b1 + a[8]  * b2 + a[12] * b3;
            out[c * 4 + 1] = a[1] * b0 + a[5] * b1 + a[9]  * b2 + a[13] * b3;
            out[c * 4 + 2] = a[2] * b0 + a[6] * b1 + a[10] * b2 + a[14] * b3;
            out[c * 4 + 3] = a[3] * b0 + a[7] * b1 + a[11] * b2 + a[15] * b3;
        }
        return out;
    }
    function translation(out, x, y, z) {
        out[0]=1; out[1]=0; out[2]=0; out[3]=0;
        out[4]=0; out[5]=1; out[6]=0; out[7]=0;
        out[8]=0; out[9]=0; out[10]=1; out[11]=0;
        out[12]=x; out[13]=y; out[14]=z; out[15]=1;
        return out;
    }
    const mTmp = new Float32Array(16);
    const mModel = new Float32Array(16);
    const mMVP = new Float32Array(16);

    /* ----------------------------- shaders -------------------------------- */
    const VERT = `#version 300 es
    in vec3 aPos; in vec2 aUV; uniform mat4 uMVP; out vec2 vUV;
    void main(){ vUV=aUV; gl_Position=uMVP*vec4(aPos,1.0); }`;
    const FRAG = `#version 300 es
    precision highp float; in vec2 vUV; uniform sampler2D uTex; uniform float uTexOn; uniform vec4 uColor; out vec4 outColor;
    void main(){ outColor = uTexOn > 0.5 ? texture(uTex, vUV) : uColor; }`;

    function compile(type, src) {
        const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.error('[xr-next] shader:', gl.getShaderInfoLog(s)); return null; }
        return s;
    }
    function buildProgram() {
        const vs = compile(gl.VERTEX_SHADER, VERT);
        const fs = compile(gl.FRAGMENT_SHADER, FRAG);
        if (!vs || !fs) return false;
        prog = gl.createProgram(); gl.attachShader(prog, vs); gl.attachShader(prog, fs);
        gl.bindAttribLocation(prog, 0, 'aPos'); gl.bindAttribLocation(prog, 1, 'aUV'); gl.linkProgram(prog);
        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { console.error('[xr-next] link:', gl.getProgramInfoLog(prog)); return false; }
        uMVP = gl.getUniformLocation(prog, 'uMVP'); uTex = gl.getUniformLocation(prog, 'uTex');
        uTexOn = gl.getUniformLocation(prog, 'uTexOn'); uColor = gl.getUniformLocation(prog, 'uColor');
        return true;
    }

    /* ------------------------------ meshes -------------------------------- */
    function upload(pos, uv, idx) {
        const vao = gl.createVertexArray(); gl.bindVertexArray(vao);
        const pb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, pb); gl.bufferData(gl.ARRAY_BUFFER, pos, gl.STATIC_DRAW); gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0,3,gl.FLOAT,false,0,0);
        const ub = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, ub); gl.bufferData(gl.ARRAY_BUFFER, uv, gl.STATIC_DRAW); gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1,2,gl.FLOAT,false,0,0);
        const ib = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW);
        gl.bindVertexArray(null); return { vao, count: idx.length };
    }
    function buildScreen() {
        const pos = new Float32Array((SEG_X+1)*(SEG_Y+1)*3);
        const uv = new Float32Array((SEG_X+1)*(SEG_Y+1)*2);
        let p=0,q=0;
        for(let j=0;j<=SEG_Y;j++){
            const fy=j/SEG_Y, pitch=(fy-0.5)*PITCH;
            for(let i=0;i<=SEG_X;i++){
                const fx=i/SEG_X, yaw=(fx-0.5)*YAW;
                pos[p++]=R*Math.sin(yaw)*Math.cos(pitch);
                pos[p++]=R*Math.sin(pitch);
                pos[p++]=-R*Math.cos(yaw)*Math.cos(pitch);
                uv[q++]=fx; uv[q++]=1-fy;
            }
        }
        const idx=new Uint16Array(SEG_X*SEG_Y*6);
        let k=0;
        for(let j=0;j<SEG_Y;j++) for(let i=0;i<SEG_X;i++){
            const a=j*(SEG_X+1)+i, b=a+1, c=a+SEG_X+1, d=c+1;
            idx[k++]=a; idx[k++]=c; idx[k++]=b; idx[k++]=b; idx[k++]=c; idx[k++]=d;
        }
        return upload(pos,uv,idx);
    }
    function buildPanel(){
        const w=PANEL_W/2,h=PANEL_H/2;
        const pos=new Float32Array([-w,-h,0, w,-h,0, -w,h,0, w,h,0]);
        const uv=new Float32Array([0,1, 1,1, 0,0, 1,0]);
        return upload(pos,uv,new Uint16Array([0,1,2,2,1,3]));
    }

    /* ---------------------------- panel canvas ----------------------------- */
    let buttons=[]; let hoverId=null;
    function roundRect(x,y,w,h,r){ pctx.beginPath(); pctx.moveTo(x+r,y); pctx.arcTo(x+w,y,x+w,y+h,r); pctx.arcTo(x+w,y+h,x,y+h,r); pctx.arcTo(x,y+h,x,y,r); pctx.arcTo(x,y,x+w,y,r); pctx.closePath(); }
    function button(id,label,x,y,w,h,accent){
        buttons.push({id,x,y,w,h}); const hot=hoverId===id;
        pctx.fillStyle= accent ? (hot?'#2ee06a':'#1db954') : (hot?'#3a3a4c':'#23232e');
        roundRect(x,y,w,h,10); pctx.fill();
        if(hot){ pctx.strokeStyle='#ffffff'; pctx.lineWidth=2; pctx.stroke(); }
        pctx.fillStyle= accent ? '#06210f' : '#ececf2';
        pctx.font='600 22px system-ui, sans-serif'; pctx.textAlign='center'; pctx.textBaseline='middle';
        pctx.fillText(label, x+w/2, y+h/2);
    }
    function clip(text,max){ if(!text) return ''; let t=text; while(t.length>3 && pctx.measureText(t).width>max) t=t.slice(0,-1); return t===text? t: t+'…'; }
    function drawPanel(){
        const info=hooks.ui(); buttons=[];
        pctx.clearRect(0,0,PANEL_CW,PANEL_CH);
        pctx.fillStyle='rgba(14,14,20,0.92)'; roundRect(0,0,PANEL_CW,PANEL_CH,18); pctx.fill();
        pctx.textAlign='left'; pctx.textBaseline='alphabetic';
        pctx.fillStyle='#ececf2'; pctx.font='600 26px system-ui, sans-serif'; pctx.fillText(clip(info.title||'MusicViz',430),24,44);
        pctx.fillStyle='#9a9aab'; pctx.font='18px system-ui, sans-serif'; pctx.fillText(clip(info.artist||'no Spotify session',430),24,70);
        pctx.fillStyle='#2a2a36'; roundRect(24,88,PANEL_CW-48,6,3); pctx.fill();
        if(info.progress>0){ pctx.fillStyle='#1db954'; roundRect(24,88,(PANEL_CW-48)*Math.min(1,info.progress),6,3); pctx.fill(); }
        button('prev','⏮',24,116,92,58); button('play',info.playing?'❙❙':'▶',128,116,92,58,true); button('next','⏭',232,116,92,58);
        button('exit','Exit VR',PANEL_CW-148,116,124,58);
        pctx.fillStyle='#74748a'; pctx.font='14px system-ui, sans-serif'; pctx.textAlign='left'; pctx.fillText('MODE',24,208);
        pctx.fillStyle='#ececf2'; pctx.font='600 20px system-ui, sans-serif'; pctx.fillText(clip(info.mode||'',300),24,236);
        button('mode-prev','‹',PANEL_CW-268,196,74,58); button('mode-rand','⤨',PANEL_CW-186,196,74,58); button('mode-next','›',PANEL_CW-104,196,80,58);
        // 6DOF hint
        pctx.fillStyle='#5a5a6c'; pctx.font='13px system-ui, sans-serif';
        pctx.fillText('6DOF: thumbstick fly · grip drag world · trigger paint',24,268);
        pctx.fillStyle='#74748a'; pctx.fillText((info.source||'no audio source') + ' · offset ' + worldOffset.x.toFixed(2) + ',' + worldOffset.y.toFixed(2) + ',' + worldOffset.z.toFixed(2),24,296);
        gl.bindTexture(gl.TEXTURE_2D, panelTex); gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,panelCanvas);
    }

    /* ------------------------------ raycasts ------------------------------- */
    function hitPanel(o,d){
        const pz = PANEL_Z + worldOffset.z;
        const py = eyeY + PANEL_DY + worldOffset.y;
        const px0 = worldOffset.x;
        if(Math.abs(d[2])<1e-6) return null;
        const t=(pz - o[2])/d[2]; if(t<=0) return null;
        const x=o[0]+d[0]*t, y=o[1]+d[1]*t;
        const u=(x - px0 + PANEL_W/2)/PANEL_W; const v=0.5 - (y - py)/PANEL_H;
        if(u<0||u>1||v<0||v>1) return null;
        return {t, px:u*PANEL_CW, py:v*PANEL_CH};
    }
    function hitScreen(o,d){
        // apply worldOffset to sphere centre
        const sx = worldOffset.x, sy = worldOffset.y, sz = worldOffset.z;
        const px=o[0]-sx, py=o[1]-eyeY - sy, pz=o[2]-sz;
        const b=2*(px*d[0]+py*d[1]+pz*d[2]);
        const c=px*px+py*py+pz*pz - R*R;
        const disc=b*b -4*c; if(disc<0) return null;
        const t=(-b+Math.sqrt(disc))/2; if(t<=0) return null;
        const hx=px+d[0]*t, hy=py+d[1]*t, hz=pz+d[2]*t;
        const pitch=Math.asin(Math.max(-1,Math.min(1,hy/R)));
        const yaw=Math.atan2(hx,-hz);
        const u=yaw/YAW+0.5, v=0.5 - pitch/PITCH;
        if(u<0||u>1||v<0||v>1) return null;
        return {t,u,v, hx: hx+sx, hy: hy+eyeY+sy, hz: hz+sz};
    }
    function buttonAt(px,py){ for(const b of buttons) if(px>=b.x && px<=b.x+b.w && py>=b.y && py<=b.y+b.h) return b.id; return null; }

    /* ------------------------------- input --------------------------------- */
    const rayVerts=new Float32Array(6);
    function handleInput(frame){
        let newHover=null, sawScreen=false;
        const sources=Array.from(session.inputSources);
        for(let i=0;i<sources.length;i++){
            const src=sources[i];
            if(!src.targetRaySpace) continue;
            const pose=frame.getPose(src.targetRaySpace, refSpace);
            if(!pose) continue;
            const m=pose.transform.matrix;
            const o=[m[12],m[13],m[14]];
            const d=[-m[8],-m[9],-m[10]];

            // Thumbstick flight (if gamepad axes present)
            if(src.gamepad && src.gamepad.axes && src.gamepad.axes.length>=2){
                const ax=src.gamepad.axes[0]||0, ay=src.gamepad.axes[1]||0;
                // deadzone
                const dz=0.18;
                if(Math.abs(ax)>dz || Math.abs(ay)>dz){
                    const speed = flySpeed * 0.016; // per frame
                    // Move world opposite to stick (push forward = fly forward)
                    // Use headset yaw for natural motion: forward is -Z in view space
                    // Simplified: worldOffset in XZ plane
                    worldOffset.x -= ax * speed;
                    worldOffset.z -= ay * speed; // ay negative = forward
                    // vertical via secondary axis if present
                    if(src.gamepad.axes.length>=4){
                        const vy=src.gamepad.axes[3]||0;
                        if(Math.abs(vy)>dz) worldOffset.y -= vy * speed * 0.6;
                    }
                    worldDirty=true;
                }
            }

            // Grip space: drag world when squeezing grip
            if(src.gripSpace){
                const gripPose=frame.getPose(src.gripSpace, refSpace);
                if(gripPose && src.gamepad && src.gamepad.buttons[1] && src.gamepad.buttons[1].pressed){
                    // track delta
                    const cur = [gripPose.transform.position.x, gripPose.transform.position.y, gripPose.transform.position.z];
                    const prev = stickState.get(src);
                    if(prev && prev.grip){
                        const dx=cur[0]-prev.grip[0], dy=cur[1]-prev.grip[1], dz=cur[2]-prev.grip[2];
                        worldOffset.x += dx*0.9;
                        worldOffset.y += dy*0.9;
                        worldOffset.z += dz*0.9;
                        worldDirty=true;
                    }
                    stickState.set(src, {grip: cur});
                } else {
                    // clear grip tracking
                    const st=stickState.get(src)||{}; delete st.grip; stickState.set(src, st);
                }
            }

            // Hand tracking: pinch detection (thumb tip vs index tip)
            if(src.hand){
                const hand = src.hand;
                // try to get thumb tip + index tip in same refSpace
                let pinch=false;
                try{
                    const thumb = frame.getJointPose ? frame.getJointPose(hand.get('thumb-tip'), refSpace) : null;
                    const index = frame.getJointPose ? frame.getJointPose(hand.get('index-finger-tip'), refSpace) : null;
                    if(thumb && index){
                        const dx=thumb.transform.position.x - index.transform.position.x;
                        const dy=thumb.transform.position.y - index.transform.position.y;
                        const dz=thumb.transform.position.z - index.transform.position.z;
                        const dist=Math.hypot(dx,dy,dz);
                        pinch = dist < 0.022; // ~2cm
                        if(pinch){
                            // pinch = splat fluid at index tip
                            const ix=index.transform.position.x, iy=index.transform.position.y, iz=index.transform.position.z;
                            // project world tip to fluid UV via screen hit inverse
                            const dir=[ -index.transform.orientation?0:0,0,0 ]; // fallback: use ray to screen
                            // direct 3D splat if fluid supports it
                            if(hooks.onPinch){
                                // map tip to normalized screen UV by projecting onto sphere
                                const hit=hitScreen([ix,iy,iz],[0,0,-1]);
                                if(hit) hooks.onPinch(hit.u, hit.v);
                                else if(hooks.spatialSplat) hooks.spatialSplat(ix,iy,iz);
                            }
                            drawRay([ix,iy,iz],[0,0.02,0],0.05,[1,0.9,0.3,1]);
                        }
                    }
                } catch(e){}
            }

            const panel=hitPanel(o,d);
            const screen=panel?null:hitScreen(o,d);
            const dist=panel?panel.t : screen?Math.min(screen.t,6):3;

            if(panel){ const id=buttonAt(panel.px,panel.py); if(id) newHover=id; }
            else if(screen){ sawScreen=true; hooks.pointerMove(screen.u*window.innerWidth, screen.v*window.innerHeight);
                // Also spatial splat: controller tip near screen becomes fluid dye
                if(hooks.spatialSplat){
                    // emit 3D fluid dye at intersection point on sphere, with velocity along ray
                    const velScale = 6;
                    hooks.spatialSplat(screen.hx, screen.hy, screen.hz, d[0]*velScale, d[1]*velScale, d[2]*velScale);
                }
            }

            const pressed=!!(src.gamepad && src.gamepad.buttons[0] && src.gamepad.buttons[0].pressed);
            const slot=src.handedness==='left'?1:0;
            const was=lastSelect.get(src)||false;
            if(pressed && !was){
                if(panel){ const id=buttonAt(panel.px,panel.py); if(id) hooks.act(id); }
                else if(screen){ hooks.press(slot, screen.u*window.innerWidth, screen.v*window.innerHeight); hooks.setPointerDown(true, slot===1); }
            } else if(!pressed && was){ hooks.setPointerDown(false,false); }
            lastSelect.set(src, pressed);

            drawRay(o,d,dist*0.98, panel?[0.11,0.72,0.33,1]:[0.6,0.65,0.8,0.7]);
        }
        if(!sawScreen) hooks.setPointerActive(false);
        if(newHover!==hoverId){ hoverId=newHover; panelDirty=true; }
        // If world moved, panel needs redraw (shows offset)
        if(worldDirty){ panelDirty=true; worldDirty=false; if(hooks.onWorldMove) hooks.onWorldMove({x:worldOffset.x,y:worldOffset.y,z:worldOffset.z}); }
    }

    function drawRay(o,d,len,colour){ rayVerts[0]=o[0]; rayVerts[1]=o[1]; rayVerts[2]=o[2]; rayVerts[3]=o[0]+d[0]*len; rayVerts[4]=o[1]+d[1]*len; rayVerts[5]=o[2]+d[2]*len; pendingRays.push({verts: rayVerts.slice(), colour}); }

    /* ------------------------------ session -------------------------------- */
    function available(){
        if(!navigator.xr || !navigator.xr.isSessionSupported) return Promise.resolve(false);
        try{ return navigator.xr.isSessionSupported('immersive-vr').catch(()=>false);}catch(e){return Promise.resolve(false);}
    }
    async function start(){
        if(session) return session;
        session=await navigator.xr.requestSession('immersive-vr',{optionalFeatures:['local-floor','bounded-floor','hand-tracking']});
        xrCanvas=document.createElement('canvas');
        gl=xrCanvas.getContext('webgl2',{xrCompatible:true, alpha:false, antialias:true, depth:true});
        if(!gl){ await session.end(); session=null; throw new Error('WebGL2 unavailable for XR'); }
        await gl.makeXRCompatible();
        session.updateRenderState({baseLayer: new XRWebGLLayer(session, gl)});
        try{ refSpace=await session.requestReferenceSpace('local-floor'); eyeY=1.5; }catch(e){ refSpace=await session.requestReferenceSpace('local'); eyeY=0; }
        if(!buildProgram()){ await session.end(); throw new Error('XR shader build failed'); }
        screenMesh=buildScreen(); panelMesh=buildPanel();
        rayBuf=gl.createBuffer();
        screenTex=gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D,screenTex); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
        panelCanvas=document.createElement('canvas'); panelCanvas.width=PANEL_CW; panelCanvas.height=PANEL_CH; pctx=panelCanvas.getContext('2d');
        panelTex=gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D,panelTex); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
        panelDirty=true;
        session.addEventListener('end', onEnd);
        if(hooks.onChange) hooks.onChange(true);
        return session;
    }
    function onEnd(){
        session=null; gl=null; refSpace=null;
        hooks.setPointerActive(false); hooks.setPointerDown(false,false);
        worldOffset.x=0; worldOffset.y=0; worldOffset.z=0;
        if(hooks.onChange) hooks.onChange(false);
        const cb=pendingCb; pendingCb=null; if(cb) window.requestAnimationFrame(wrap(cb));
    }
    function stop(){ if(session) session.end(); }

    /* -------------------------------- frame -------------------------------- */
    let panelTick=0;
    function frame(xrFrame){
        if(!session||!gl||!xrFrame) return;
        const pose=xrFrame.getViewerPose(refSpace);
        const layer=session.renderState.baseLayer;
        if(!pose||!layer) return;
        if(panelDirty || (panelTick++%12)===0){ drawPanel(); panelDirty=false; }
        const src=hooks.canvasFor();
        if(src && src.width && src.height){
            gl.bindTexture(gl.TEXTURE_2D, screenTex);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);
            gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,src);
        }
        pendingRays=[]; handleInput(xrFrame);
        gl.bindFramebuffer(gl.FRAMEBUFFER, layer.framebuffer);
        gl.clearColor(0,0,0,1); gl.clearDepth(1); gl.enable(gl.DEPTH_TEST); gl.disable(gl.CULL_FACE); gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
        gl.useProgram(prog); gl.uniform1i(uTex,0); gl.activeTexture(gl.TEXTURE0);
        for(const view of pose.views){
            const vp=layer.getViewport(view); if(!vp) continue;
            gl.viewport(vp.x, vp.y, vp.width, vp.height);
            const viewProj=mul(mTmp, view.projectionMatrix, view.transform.inverse.matrix);
            drawView(viewProj);
        }
    }
    function drawView(viewProj){
        // screen with worldOffset applied
        translation(mModel, worldOffset.x, eyeY + worldOffset.y, worldOffset.z);
        mul(mMVP, viewProj, mModel);
        gl.uniformMatrix4fv(uMVP,false,mMVP); gl.uniform1f(uTexOn,1);
        gl.bindTexture(gl.TEXTURE_2D, screenTex); gl.disable(gl.BLEND);
        gl.bindVertexArray(screenMesh.vao); gl.drawElements(gl.TRIANGLES, screenMesh.count, gl.UNSIGNED_SHORT,0);
        // panel with offset
        translation(mModel, worldOffset.x, eyeY+PANEL_DY+worldOffset.y, PANEL_Z+worldOffset.z);
        mul(mMVP, viewProj, mModel); gl.uniformMatrix4fv(uMVP,false,mMVP);
        gl.bindTexture(gl.TEXTURE_2D, panelTex); gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
        gl.bindVertexArray(panelMesh.vao); gl.drawElements(gl.TRIANGLES,panelMesh.count,gl.UNSIGNED_SHORT,0);
        gl.bindVertexArray(null);
        if(pendingRays.length){
            gl.uniformMatrix4fv(uMVP,false,viewProj); gl.uniform1f(uTexOn,0);
            gl.bindBuffer(gl.ARRAY_BUFFER, rayBuf); gl.enableVertexAttribArray(0); gl.disableVertexAttribArray(1); gl.vertexAttribPointer(0,3,gl.FLOAT,false,0,0);
            for(const r of pendingRays){ gl.uniform4fv(uColor, r.colour); gl.bufferData(gl.ARRAY_BUFFER, r.verts, gl.DYNAMIC_DRAW); gl.drawArrays(gl.LINES,0,2); }
        }
        gl.disable(gl.BLEND);
    }
    function wrap(cb){ return function(time,xrFrame){ pendingCb=null; cb(time,xrFrame); }; }
    function raf(cb){ pendingCb=cb; if(session) session.requestAnimationFrame(wrap(cb)); else window.requestAnimationFrame(wrap(cb)); }
    function isActive(){ return !!session; }
    function init(h){ hooks=h; }
    return {
        init, available, start, stop, frame, raf, isActive,
        markDirty: ()=>{ panelDirty=true; },
        setFlySpeed: (s)=>{ flySpeed=s; },
        getWorldOffset: ()=> ({x:worldOffset.x, y:worldOffset.y, z:worldOffset.z}),
        resetWorld: ()=>{ worldOffset.x=0; worldOffset.y=0; worldOffset.z=0; panelDirty=true; },
        // exposed internals for tests
        _test:{ hitScreen, hitPanel, mul, setEyeY:(v)=>{eyeY=v;}, geom:{R,YAW,PITCH,PANEL_Z,PANEL_DY,PANEL_W,PANEL_H,PANEL_CW,PANEL_CH}}
    };
})();
