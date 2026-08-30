/**
 * Panel — Glassmorphic HUD & Control Drawer UI
 * Features top HUD bar, reactive EQ spectrum bars, audio source pickers, visual modes,
 * 3D VR spatial flight entry, Bird flight simulator, reactivity sliders, and palette options.
 */
export type PanelOpts = {
  onMode: (idx: number) => void
  onRandom: () => void
  onDemo: () => void
  onDemoNext: () => void
  onDemoStop: () => void
  onYouTube: (url: string) => void
  onSpotify: (url: string) => void
  onSystem: () => void
  onMic: () => void
  onFile: (f: File) => void
  onSpotifyCapture: () => void
  onFullscreen: () => void
  onVR: () => void
  onBirdFly: () => void
}

export function mountPanel(root: HTMLElement, modes: any[], opts: PanelOpts) {
  root.innerHTML = `
  <header id="top-hud">
    <div class="hud-brand">
      <span class="hud-logo">MusicViz</span>
      <span id="hud-track-name" class="hud-track">Demo Rave 140 BPM</span>
    </div>
    <div class="hud-controls">
      <button id="b-hud-prev" class="hud-btn" title="Previous Mode ( [ )">‹</button>
      <select id="hud-sel-mode" style="max-width: 140px; padding: 4px 8px; font-size: 11px;"></select>
      <button id="b-hud-next" class="hud-btn" title="Next Mode ( ] )">›</button>
      <button id="b-hud-rand" class="hud-btn" title="Random Mode ( R )">🔀</button>
      <button id="b-hud-fly" class="hud-btn primary" title="Toggle 3D Bird Flight Simulator ( V )">🕊️ Fly</button>
      <button id="b-hud-vr" class="hud-btn accent" title="Enter WebXR VR ( 6DOF Flight )">🥽 VR</button>
      <button id="b-hud-fs" class="hud-btn" title="Toggle Fullscreen ( F )">⛶</button>
    </div>
  </header>

  <button id="ptoggle" aria-label="Toggle Control Drawer">‹</button>

  <aside id="panel">
    <div class="ph">
      <span class="pt">Visualizer Control Drawer</span>
      <span class="phint">H hide · F full · V fly · R random</span>
    </div>

    <section class="sec" data-sec="source">
      <div class="sh"><span class="chev">▼</span>Audio Source & Input</div>
      <div class="sb">
        <div class="grid3">
          <button id="b-sys" class="primary">System</button>
          <button id="b-mic">Mic</button>
          <button id="b-file">File</button>
        </div>
        <input id="f-input" type="file" accept="audio/*" hidden />
        <div class="card">
          <label>Instant Demo — 0-friction rave <span id="demo-label" class="hint">140 BPM</span></label>
          <div class="grid3">
            <button id="b-demo" class="accent">▶ Demo Rave</button>
            <button id="b-demo-next">Next</button>
            <button id="b-demo-stop">■ Stop</button>
          </div>
          <div class="note">Pre-loaded high-energy electronic track drives analyser directly.</div>
        </div>
        <div class="card" style="border-color: rgba(29,185,84,0.35); background: rgba(29,185,84,0.08);">
          <label>Spotify Player — paste playlist link</label>
          <div class="row">
            <input id="sp-url" placeholder="https://open.spotify.com/playlist/..." />
            <button id="b-sp" class="primary" style="background:#1db954; border-color:#1db954; color:#06210f; font-weight:700;">Load</button>
          </div>
          <div id="sp-embed-wrap" style="display:none; margin-top:8px;">
            <iframe id="sp-embed" style="border-radius:12px; width:100%; height:320px; border:0; background:#121212;" src="about:blank" loading="lazy" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe>
            <button id="b-sp-capture" class="primary" style="width:100%; margin-top:8px; background:#1db954; border-color:#1db954; color:#06210f;">Listen to this player (tab capture)</button>
          </div>
        </div>
        <div class="card">
          <label>YouTube / Direct MP3 URL</label>
          <div class="row">
            <input id="yt-url" placeholder="https://youtube.com/watch?v=... or direct .mp3 URL" />
            <button id="b-yt">Play</button>
          </div>
        </div>
        <div class="status" id="s-status"><span class="dot"></span><span id="s-text">No audio source</span></div>
        <div id="meters" class="meters">
          ${[
            ['subBass','Sub'],['bass','Bass'],['lowMid','Low'],['mid','Mid'],['highMid','Hi'],['presence','Pres'],['air','Air']
          ].map(([k,label])=>`<div class="meter"><div class="bar"><i data-band="${k}"></i></div><span>${label}</span></div>`).join('')}
        </div>
        <div id="bpm" class="note">Tempo — 120 BPM</div>
      </div>
    </section>

    <section class="sec" data-sec="visual">
      <div class="sh"><span class="chev">▼</span>Visualizer Mode & Spatial VR</div>
      <div class="sb">
        <label>Animation Mode <span id="mode-count"></span></label>
        <select id="sel-mode"></select>
        <div class="grid3" style="margin-top:6px;">
          <button id="b-prev">‹ Prev</button>
          <button id="b-rand">Random</button>
          <button id="b-next">Next ›</button>
        </div>

        <div class="card" style="margin-top:10px; background:rgba(0, 240, 255, 0.08); border-color:rgba(0, 240, 255, 0.3);">
          <label style="color:#00f0ff; font-weight:700;">🥽 3D Spatial VR & Bird Flight</label>
          <button id="b-vr" class="accent" style="width:100%; margin-top:4px;">Enter WebXR VR (6DOF Headset Flight)</button>
          <button id="b-bird-fly" class="primary" style="width:100%; margin-top:6px;">🕊️ 3D Bird Flight Simulator (WASD / Look)</button>
          <div class="note" style="margin-top:6px; font-size:10px;">Every 2D mode has its own 3D world — VR / Fly drops you into the one you're watching.<br/>
          <b>Spotify in VR:</b> hit play in the player above, then Enter VR. The first press captures this tab's audio (one browser prompt, here on the flat page) — press again to launch. Inside the headset there are no prompts, and the stream survives entering/exiting VR.<br/>
          In-headset: trigger clicks the floating panel · grip recalls it · ▾ hides it.</div>
        </div>

        <label>Color Palette</label>
        <select id="sel-pal">
          <option value="rainbow">Rainbow Cycle</option>
          <option value="neon">Neon Psychedelic</option>
          <option value="vapor">Vaporwave</option>
          <option value="aurora">Aurora Borealis</option>
          <option value="magma">Magma Inferno</option>
          <option value="mono">Cyber Monochrome</option>
          <option value="album">Album Art Dynamic</option>
        </select>
      </div>
    </section>

    <section class="sec" data-sec="react">
      <div class="sh"><span class="chev">▼</span>Audio Reactivity & Gain</div>
      <div class="sb">
        <label>Master Gain <span id="v-gain">1.2</span><input id="s-gain" type="range" min="0.2" max="4" step="0.1" value="1.2"/></label>
        <label>Motion Speed <span id="v-motion">0.55×</span><input id="s-motion" type="range" min="0.15" max="2" step="0.05" value="0.55"/></label>
        <label>Beat Reaction Sensitivity <span id="v-react">1.0</span><input id="s-react" type="range" min="0.2" max="2.5" step="0.1" value="1.0"/></label>
      </div>
    </section>

    <section class="sec" data-sec="interact">
      <div class="sh"><span class="chev">▼</span>Interactive Forces</div>
      <div class="sb">
        <label>Pointer Force Influence <span id="v-interact">100%</span><input id="s-interact" type="range" min="0" max="200" step="5" value="100"/></label>
        <div class="note">Drag/touch to paint fluid forces • Shift-click to repel • Double click for pulse</div>
        <label>Fluid Dissipation <span id="v-diss">0.980</span><input id="s-diss" type="range" min="0.900" max="0.999" step="0.001" value="0.98"/></label>
        <label>Fluid Vorticity (Curl) <span id="v-vort">30</span><input id="s-vort" type="range" min="0" max="60" step="1" value="30"/></label>
      </div>
    </section>

    <section class="sec" data-sec="fractal">
      <div class="sh"><span class="chev">▼</span>Fractal & Raymarching Settings</div>
      <div class="sb">
        <label>Shader Detail <span id="v-detail">60%</span><input id="s-detail" type="range" min="10" max="100" step="5" value="60"/></label>
        <label>Zoom Level <span id="v-zoom">1.00×</span><input id="s-zoom" type="range" min="-100" max="200" step="1" value="0"/></label>
        <label>Fractal Seed Morph <span id="v-morph">0%</span><input id="s-morph" type="range" min="0" max="100" step="1" value="0"/></label>
        <label>Auto-Morph Speed <span id="v-morph-rate">0%</span><input id="s-morph-rate" type="range" min="0" max="100" step="5" value="0"/></label>
        <button id="b-reset-view" style="width:100%; margin-top:6px;">Reset Camera View</button>
        <label class="row" style="margin-top:10px;"><span>Fly-Through Drift</span><button id="sw-fly" class="switch"></button></label>
        <label>Flight Speed <span id="v-fly">1.0×</span><input id="s-fly" type="range" min="0.2" max="3" step="0.1" value="1.0"/></label>
      </div>
    </section>
  </aside>
  `

  const $ = (id: string) => root.querySelector(`#${id}`) as HTMLElement

  // Wire drawer toggles
  $('ptoggle')?.addEventListener('click', () => root.querySelector('#panel')!.classList.toggle('collapsed'))
  root.querySelectorAll('.sh').forEach(h => h.addEventListener('click', () => h.parentElement!.classList.toggle('collapsed')))

  // Wire audio source buttons
  $('b-sys')?.addEventListener('click', opts.onSystem)
  $('b-mic')?.addEventListener('click', opts.onMic)
  $('b-file')?.addEventListener('click', () => (root.querySelector('#f-input') as HTMLInputElement).click())
  root.querySelector('#f-input')?.addEventListener('change', (e: any) => { if (e.target.files[0]) opts.onFile(e.target.files[0]) })
  $('b-demo')?.addEventListener('click', opts.onDemo)
  $('b-demo-next')?.addEventListener('click', opts.onDemoNext)
  $('b-demo-stop')?.addEventListener('click', opts.onDemoStop)
  $('b-yt')?.addEventListener('click', () => { const v = (root.querySelector('#yt-url') as HTMLInputElement).value.trim(); if (v) opts.onYouTube(v) })
  root.querySelector('#yt-url')?.addEventListener('keydown', (e: any) => { if (e.key === 'Enter') { e.preventDefault(); const v = (root.querySelector('#yt-url') as HTMLInputElement).value.trim(); if (v) opts.onYouTube(v) } })
  $('b-sp')?.addEventListener('click', () => { const v = (root.querySelector('#sp-url') as HTMLInputElement).value.trim(); if (v) opts.onSpotify(v) })
  root.querySelector('#sp-url')?.addEventListener('keydown', (e: any) => { if (e.key === 'Enter') { e.preventDefault(); const v = (root.querySelector('#sp-url') as HTMLInputElement).value.trim(); if (v) opts.onSpotify(v) } })
  $('b-sp-capture')?.addEventListener('click', opts.onSpotifyCapture)

  // Wire mode switcher buttons
  $('b-prev')?.addEventListener('click', () => opts.onMode(-1))
  $('b-next')?.addEventListener('click', () => opts.onMode(1))
  $('b-rand')?.addEventListener('click', opts.onRandom)

  $('b-hud-prev')?.addEventListener('click', () => opts.onMode(-1))
  $('b-hud-next')?.addEventListener('click', () => opts.onMode(1))
  $('b-hud-rand')?.addEventListener('click', opts.onRandom)
  $('b-hud-fs')?.addEventListener('click', opts.onFullscreen)
  $('b-hud-vr')?.addEventListener('click', opts.onVR)
  $('b-hud-fly')?.addEventListener('click', opts.onBirdFly)

  $('b-vr')?.addEventListener('click', opts.onVR)
  $('b-bird-fly')?.addEventListener('click', opts.onBirdFly)

  // Populate mode dropdowns (Drawer & HUD)
  const selDrawer = root.querySelector('#sel-mode') as HTMLSelectElement
  const selHud = root.querySelector('#hud-sel-mode') as HTMLSelectElement

  const drawerGroups: Record<string, HTMLOptGroupElement> = {}
  modes.forEach((m: any, i: number) => {
    if (!drawerGroups[m.group]) {
      const ogDrawer = document.createElement('optgroup'); ogDrawer.label = m.group; selDrawer.appendChild(ogDrawer); drawerGroups[m.group] = ogDrawer
    }
    const optDrawer = document.createElement('option'); optDrawer.value = String(i); optDrawer.textContent = m.name; drawerGroups[m.group].appendChild(optDrawer)

    const optHud = document.createElement('option'); optHud.value = String(i); optHud.textContent = m.name; selHud.appendChild(optHud)
  })

  const cnt = root.querySelector('#mode-count') as HTMLElement; if (cnt) cnt.textContent = modes.length + ' modes'

  selDrawer.addEventListener('change', e => {
    const idx = parseInt((e.target as HTMLSelectElement).value, 10)
    selHud.value = String(idx)
    opts.onMode(idx)
  })

  selHud.addEventListener('change', e => {
    const idx = parseInt((e.target as HTMLSelectElement).value, 10)
    selDrawer.value = String(idx)
    opts.onMode(idx)
  })

  return { root, $ }
}
