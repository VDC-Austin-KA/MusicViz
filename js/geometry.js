/* ==========================================================================
   GeometryEngine — minimalist + hybrid rendering modes.

   Inspirations:
     - Sonia Boller Audible Visuals "flower" — intuitive frequency-specific
       petals where mid-band sets count, lowMid drives twist, air sparkles.
     - Teoxoy Audio Visualizer — clean striking geometry, instanced rings
       reacting to audio bands.
     - Matt DesLauriers Codevember #21 — elegant minimalism, high impact.

   Engine reuses viz2d's 2D context contract but owns its own state.
   Hybrid modes blend geometry + fluid splats (geometry drives fluid dye).

   Every mode implements draw(g, W, H, t, m, S, env, art)
   Same signature as Viz2DModes so app.js can swap seamlessly.
   ========================================================================== */

window.GeometryEngine = (function () {
    'use strict';
    let canvas = null, g = null;
    let W = 0, H = 0, dpr = 1;
    let current = null;
    let S = {};
    function init(cnv) {
        canvas = cnv;
        g = canvas.getContext('2d', { alpha: false });
        resize();
        return !!g;
    }
    function resize() {
        if (!canvas) return;
        dpr = Math.min(window.devicePixelRatio || 1, window.MF_MOBILE ? 1.5 : 2);
        W = canvas.clientWidth || window.innerWidth;
        H = canvas.clientHeight || window.innerHeight;
        canvas.width = Math.max(1, Math.floor(W * dpr));
        canvas.height = Math.max(1, Math.floor(H * dpr));
        g.setTransform(dpr, 0, 0, dpr, 0, 0);
        g.fillStyle = '#000';
        g.fillRect(0, 0, W, H);
    }
    function setMode(mode) { current = mode; S = {}; if (g) { g.setTransform(dpr,0,0,dpr,0,0); g.fillStyle='#000'; g.fillRect(0,0,W,H); } }
    function frame(t, m, env) {
        if (!g || !current) return;
        g.setTransform(dpr, 0, 0, dpr, 0, 0);
        g.globalCompositeOperation = 'source-over';
        g.globalAlpha = 1;
        const fade = current.fade === undefined ? 0.18 : current.fade;
        if (fade >= 1) { g.fillStyle = current.bg || '#000'; g.fillRect(0,0,W,H); }
        else if (fade > 0) { g.fillStyle = 'rgba(0,0,0,'+fade+')'; g.fillRect(0,0,W,H); }
        current.draw(g, W, H, t, m, S, env, null);
        g.globalAlpha = 1;
    }
    return { init, resize, setMode, frame, size: () => ({w:W,h:H}) };
})();

window.GeometryModes = (function () {
    'use strict';
    const P = window.Palette;
    const TAU = Math.PI*2;

    // helper: palette css with alpha
    function col(h, a){ return P.css(h%1, a); }

    const modes = [
    {
        // FLOWER — Sonia Boller Audible Visuals "flower" control feel:
        // Intuitive GUI: one "complexity" dial maps to petal count + twist + radius.
        // Frequency bands own distinct visual traits:
        // - mid sets how many petals exist (countB)
        // - lowMid twists the bloom (twist)
        // - bass pushes radius outward (thrust)
        // - highMid sharpens edges (edgeB)
        // - air sparkles grain on tips
        id: 'flower', name: 'Bloom Flower', group: 'Geometry · Organic', fade: 0.18,
        draw: function(g, W, H, t, m, S, env){
            const cx=W/2, cy=H/2;
            const base = Math.min(W,H)*0.18 * env.depth;
            const petals = 5 + Math.floor((m.band.mid.env)*6)*2; // 5→17 odd
            const twist = m.band.lowMid.env*1.8 + t*0.00035;
            const thrust = m.band.bass.env;
            const edge = m.band.highMid.env;
            const grain = m.band.air.onset;

            // stem pulse with beat
            const pulse = 1 + m.beatPulse*0.18;

            for(let p=0; p<petals; p++){
                const a0 = TAU*(p/petals) + twist;
                const r = base * (0.72 + thrust*0.55) * pulse;
                const tipX = cx + Math.cos(a0)*r, tipY = cy + Math.sin(a0)*r;
                const ctrlR = r*0.55;
                const a1 = a0 + 0.22 + edge*0.35;
                const a2 = a0 - 0.22 - edge*0.35;
                const c1x = cx + Math.cos(a1)*ctrlR, c1y = cy + Math.sin(a1)*ctrlR;
                const c2x = cx + Math.cos(a2)*ctrlR, c2y = cy + Math.sin(a2)*ctrlR;

                g.beginPath();
                g.moveTo(cx, cy);
                g.quadraticCurveTo(c1x, c1y, tipX, tipY);
                g.quadraticCurveTo(c2x, c2y, cx, cy);
                g.closePath();
                const hue = (p/petals)*0.78 + P.flow(0,0.12);
                const alpha = 0.18 + m.band.highMid.env*0.45 + p%2*0.07;
                g.fillStyle = col(hue, alpha + grain*0.35);
                g.fill();
                g.strokeStyle = col(hue+0.04, 0.22 + edge*0.5);
                g.lineWidth = 1.2 + edge*2.2;
                g.stroke();

                // grain sparkle on tips
                if(grain>0.08){
                    g.beginPath();
                    g.arc(tipX, tipY, 1.8 + grain*5, 0, TAU);
                    g.fillStyle = col(0.85, grain*1.1);
                    g.fill();
                }
            }
            // centre core
            const core = base*0.18 * (1 + thrust*0.4);
            const grad=g.createRadialGradient(cx,cy,0,cx,cy,core);
            grad.addColorStop(0, col(P.flow(0.42,0.08), 0.95));
            grad.addColorStop(1, col(P.flow(0.46,0.08), 0));
            g.fillStyle=grad;
            g.beginPath(); g.arc(cx,cy,core,0,TAU); g.fill();

            // interaction: pointer repels nearby petals
            const p = env.pointer;
            if(p.active && env.interact>0){
                const px=p.x*W, py=p.sy*H;
                const dx=px-cx, dy=py-cy;
                const dist=Math.hypot(dx,dy);
                if(dist < base*1.6){
                    g.beginPath(); g.arc(px,py, 18 + m.band.presence.env*30, 0, TAU);
                    g.strokeStyle = col(0.55, 0.25*env.interact);
                    g.lineWidth=1; g.stroke();
                }
            }
        }
    },
    {
        // ORBIT RINGS — Teoxoy: clean striking geometry, minimalist impact
        id: 'orbit-rings', name: 'Orbit Rings', group: 'Geometry · Minimal', fade: 0.22,
        draw: function(g,W,H,t,m,S,env){
            const cx=W/2, cy=H/2;
            const maxR=Math.min(W,H)*0.38*env.depth;
            const k=env.k;
            const count = 3 + Math.floor(m.centroid*4) + Math.floor(m.band.mid.env*4);
            g.lineCap='round';
            for(let i=0;i<count;i++){
                const n=i/count;
                const r = maxR*(0.18 + n*0.72 + m.bandsNorm[Math.floor(n*63)]*0.12*k);
                const w = 1.5 + m.band.highMid.env*4.5 + m.onsets[Math.floor(n*63)]*8;
                const hue = n*0.65 + P.flow(0,0.10);
                g.beginPath();
                g.arc(cx, cy, r, -Math.PI/2 + t*0.00012*(1+i*0.2), Math.PI*1.5 + t*0.00012*(1+i*0.2));
                g.strokeStyle = col(hue, 0.18 + m.band.presence.env*0.55 + (i===count-1?m.beatPulse*0.5:0));
                g.lineWidth = w;
                g.stroke();
                // ticks driven by flux per ring
                const bi = Math.floor(n*7);
                if(m.band[Object.keys(m.band)[bi]] && m.band[Object.keys(m.band)[bi]].hit){
                    const a = TAU*( (t*0.0002 + i*0.3)%1 );
                    const x=cx+Math.cos(a)*r, y=cy+Math.sin(a)*r;
                    g.beginPath(); g.arc(x,y, 2.2 + m.band.presence.env*4, 0, TAU);
                    g.fillStyle=col(hue+0.08, 0.9); g.fill();
                }
            }
        }
    },
    {
        // NEON TUNNEL — Matt DesLauriers minimal depth
        id: 'neon-tunnel', name: 'Neon Tunnel', group: 'Geometry · Minimal', fade: 0.14,
        draw: function(g,W,H,t,m,S,env){
            const cx=W/2, cy=H/2;
            const depth = env.depth, k=env.k;
            const time = t*0.001;
            const count = 16;
            const speed = 0.8 + m.band.bass.env*1.2;
            for(let i=count-1;i>=0;i--){
                const z = ((time*speed + i*0.22)%2) /2; // 0..1 depth
                const s = 1/(0.12 + z*2.2);
                const size = Math.min(W,H)*0.14*s * (0.5 + m.band.highMid.env*0.3);
                const alpha = (1 - z)*0.65 + m.band.presence.env*0.25;
                const hue = (z*0.5 + i/count*0.2 + P.flow(0,0.08))%1;
                const x=cx + Math.sin(time*0.12 + i*0.4)*W*0.02 * (1 - z);
                const y=cy + Math.cos(time*0.10 + i*0.5)*H*0.02 * (1 - z);
                g.strokeStyle = col(hue, alpha);
                g.lineWidth = 1.2 + (1 - z)*2.5;
                g.strokeRect(x-size/2, y-size/2, size, size);
                // occasionally fluid splat from tunnel edges (hybrid hint)
                if(window.FluidEngine && window.FluidEngine.isReady && window.FluidEngine.isReady() && i===0 && m.beat && Math.random()<0.7){
                    const a=Math.random()*TAU;
                    window.FluidEngine.splat(0.5+Math.cos(a)*0.3, 0.5+Math.sin(a)*0.3, Math.cos(a)*18*k, Math.sin(a)*18*k, P.hdr(P.flow(Math.random(),0.5), 3.5));
                }
            }
        }
    },
    {
        // HEX PULSE — lattice that breathes
        id: 'hex-pulse', name: 'Hex Pulse', group: 'Geometry · Minimal', fade: 0.20,
        draw: function(g,W,H,t,m,S,env){
            const cols=8, rows=7;
            const cw=W/cols, ch=H/rows;
            const time=t*0.001;
            for(let y=0;y<rows;y++){
                for(let x=0;x<cols;x++){
                    const off = (y%2)*cw/2;
                    const cx = x*cw + cw/2 + off, cy = y*ch + ch/2;
                    const bi = (x + y*cols) % m.bandsNorm.length;
                    const v = m.bandsNorm[bi]*env.k;
                    const sz = Math.min(cw,ch)*(0.18 + v*0.42);
                    const hue = bi/64*0.72 + P.flow(0,0.06);
                    const pulse = 0.5 + 0.5*Math.sin(time* (0.6 + y*0.1) + x*0.7) * (0.3 + v);
                    g.beginPath();
                    for(let k=0;k<6;k++){
                        const a=TAU*k/6 + time*0.08*(1+v);
                        const px=cx+Math.cos(a)*(sz*pulse), py=cy+Math.sin(a)*(sz*pulse);
                        if(k===0) g.moveTo(px,py); else g.lineTo(px,py);
                    }
                    g.closePath();
                    g.fillStyle = col(hue, 0.08 + v*0.42);
                    g.fill();
                    g.strokeStyle = col(hue+0.08, 0.18 + m.onsets[bi]*0.7);
                    g.lineWidth = 1; g.stroke();
                }
            }
        }
    },
    {
        // KALEIDOSCOPE — symmetry meets spectrum
        id: 'kaleido', name: 'Kaleidoscope', group: 'Geometry · Symmetry', fade: 0.24,
        draw: function(g,W,H,t,m,S,env){
            const cx=W/2, cy=H/2;
            const R=Math.min(W,H)*0.40*env.depth;
            const arms=6 + Math.round(m.centroid*6);
            const seg=TAU/arms;
            g.save(); g.translate(cx,cy);
            for(let a=0;a<arms;a++){
                g.save(); g.rotate(seg*a);
                // wedge content: waveform + bars
                const wave=m.wave;
                g.beginPath();
                for(let i=0;i<wave.length;i+=16){
                    const x = (i/wave.length)*R*0.72;
                    const y = wave[i]*R*0.12*env.k;
                    if(i===0) g.moveTo(x,y); else g.lineTo(x,y);
                }
                g.strokeStyle = col(a/arms*0.75 + P.flow(0,0.07), 0.55);
                g.lineWidth=1.2; g.stroke();
                // bars inside wedge
                for(let i=0;i<16;i++){
                    const v=m.bandsNorm[Math.floor(i/16*64)]*env.k;
                    g.fillStyle=col(i/16*0.7, 0.2+v*0.5);
                    g.fillRect(i/16*R*0.72, -R*0.06, R*0.72/16*0.72, -v*R*0.18);
                }
                g.restore();
            }
            g.restore();
            // subtle vignette
            const vig=g.createRadialGradient(cx,cy, R*0.7, cx,cy,R);
            vig.addColorStop(0,'rgba(0,0,0,0)'); vig.addColorStop(1,'rgba(0,0,0,0.55)');
            g.fillStyle=vig; g.fillRect(0,0,W,H);
        }
    },
    {
        // HYBRID: BLOOM GRID — geometry seeds fluid dye
        id: 'bloom-grid', name: 'Bloom Grid (Hybrid)', group: 'Hybrid · Fluid-Geometry', fade: 0.30,
        draw: function(g,W,H,t,m,S,env){
            // Geometry backdrop: grid of dots whose size = band
            const cols=12, rows=8;
            const cw=W/cols, ch=H/rows;
            for(let y=0;y<rows;y++){
                for(let x=0;x<cols;x++){
                    const bi = (x + y*cols) % 64;
                    const v=m.bandsNorm[bi]*env.k;
                    const cx=x*cw+cw/2, cy=y*ch+ch/2;
                    const r=2 + v*12;
                    g.beginPath(); g.arc(cx,cy,r,0,TAU);
                    g.fillStyle=col(bi/64*0.8, 0.22 + v*0.5);
                    g.fill();
                }
            }
            // Hybrid fluid injection: every bloom seeds a splat in FluidEngine
            if(window.FluidEngine && window.FluidEngine.isReady && window.FluidEngine.isReady()){
                const F=window.FluidEngine;
                const k=env.k, depth=env.depth;
                // inject top 6 loudest bins as splats (budget friendly)
                const bins = m.bandsNorm.map((v,i)=>({v,i})).sort((a,b)=>b.v-a.v).slice(0,6);
                for(const b of bins){
                    if(b.v < 0.18) continue;
                    const x=(b.i % cols)/cols + 0.5/cols;
                    const y=Math.floor(b.i/cols % rows)/rows + 0.5/rows;
                    const f=(4 + b.v*28)*k*depth;
                    const hue = b.i/64*0.75 + P.flow(0,0.12);
                    // occasionally, not every frame, to avoid flooding
                    if(Math.random()<0.55) F.splat(x, y, (Math.random()-0.5)*f, (Math.random()-0.5)*f, P.hdr(hue, 3.2), 0.42 + b.v*0.5);
                }
            }
            // pointer draws
            const p=env.pointer;
            if(p.active && env.interact>0){
                g.beginPath(); g.arc(p.x*W, p.sy*H, 22, 0, TAU);
                g.strokeStyle=col(0.5, 0.35); g.lineWidth=1.2; g.stroke();
            }
        }
    },
    {
        // HYBRID: FRACTAL MANDALA — geometric mandala scaffold over fractal-like fill
        id: 'hybrid-mandala', name: 'Fractal Mandala (Hybrid)', group: 'Hybrid · Fractal-Geometry', fade: 0.20,
        draw: function(g,W,H,t,m,S,env){
            const cx=W/2, cy=H/2;
            const R=Math.min(W,H)*0.34*env.depth;
            const petals=6 + Math.floor(m.centroid*6);
            const time=t*0.0004;
            // backdrop: fbm-like rings (cheap)
            for(let r=R*0.12; r<R; r+= R*0.09){
                const hue = (r/R)*0.6 + P.flow(0,0.06);
                g.beginPath(); g.arc(cx,cy,r + Math.sin(time*0.6 + r*0.04)*8*env.k, 0, TAU);
                g.strokeStyle=col(hue, 0.08 + r/R*0.14 + m.band.mid.env*0.12);
                g.lineWidth=1; g.stroke();
            }
            // foreground mandala petals
            for(let p=0;p<petals;p++){
                const a=TAU*p/petals + time*0.5 + m.band.lowMid.env*0.7;
                const r=R*(0.55 + m.band.bass.env*0.28);
                const x=cx+Math.cos(a)*r, y=cy+Math.sin(a)*r;
                g.beginPath();
                g.moveTo(cx,cy);
                g.quadraticCurveTo(cx+Math.cos(a+0.25)*r*0.6, cy+Math.sin(a+0.25)*r*0.6, x, y);
                g.quadraticCurveTo(cx+Math.cos(a-0.25)*r*0.6, cy+Math.sin(a-0.25)*r*0.6, cx, cy);
                g.fillStyle=col(p/petals*0.7, 0.14 + m.band.presence.env*0.28);
                g.fill();
                g.strokeStyle=col(p/petals*0.7+0.06, 0.22 + m.band.air.onset*0.5);
                g.lineWidth=1; g.stroke();
            }
            // also seed fluid for hybrid feel
            if(window.FluidEngine && window.FluidEngine.isReady && window.FluidEngine.isReady() && m.beat){
                const a=Math.random()*TAU;
                window.FluidEngine.splat(0.5+Math.cos(a)*0.12, 0.5+Math.sin(a)*0.12, Math.cos(a)*14*env.k, Math.sin(a)*14*env.k, P.hdr(Math.random(), 3.4));
            }
        }
    }
    ];

    return { list: modes };
})();
