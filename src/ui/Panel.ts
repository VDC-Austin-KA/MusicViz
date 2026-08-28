/**
 * Panel — modern minimal drawer, DesLauriers high-impact minimalism
 * One fluid panel, no excess chrome. Live meters + Demo Rave first.
 */
export type PanelOpts = {
  onMode: (idx: number) => void
  onRandom: () => void
  onDemo: () => void
  onDemoNext: () => void
  onDemoStop: () => void
  onYouTube: (url: string) => void
  onSystem: () => void
  onMic: () => void
  onFile: (f: File) => void
}

export function mountPanel(root: HTMLElement, modes: any[], opts: PanelOpts) {
  root.innerHTML = `
  <button id="ptoggle" aria-label="toggle">‹</button>
  <aside id="panel">
    <div class="ph"><span class="pt">MusicViz</span><span class="phint">H hide · F full · → next</span></div>

    <section class="sec" data-sec="source">
      <div class="sh"><span class="chev">▼</span>Audio Source</div>
      <div class="sb">
        <div class="grid3">
          <button id="b-sys" class="primary">System</button><button id="b-mic">Mic</button><button id="b-file">File</button>
        </div>
        <input id="f-input" type="file" accept="audio/*" hidden />
        <div class="card">
          <label>Instant Demo — high-energy rave (no login) <span id="demo-label" class="hint">140 BPM</span></label>
          <div class="grid3"><button id="b-demo" class="accent">▶ Demo Rave</button><button id="b-demo-next">Next</button><button id="b-demo-stop">■ Stop</button></div>
          <div class="note">Zero friction: pre-loaded 140 BPM rave drives analyser direct — no picker.</div>
        </div>
        <div class="card">
          <label>YouTube / audio URL <span class="hint">BETA</span></label>
          <div class="row"><input id="yt-url" placeholder="https://youtube.com/watch?v=… or …/track.mp3" /><button id="b-yt">Play</button></div>
        </div>
        <div class="status" id="s-status"><span class="dot"></span><span id="s-text">No audio source</span></div>
        <div id="meters" class="meters">
          ${['Sub','Bass','Low','Mid','Hi','Pres','Air'].map(k=>`<div class="meter"><div class="bar"><i data-band="${k.toLowerCase()}"></i></div><span>${k}</span></div>`).join('')}
        </div>
        <div id="bpm" class="note">Tempo —</div>
      </div>
    </section>

    <section class="sec" data-sec="visual">
      <div class="sh"><span class="chev">▼</span>Visualizer</div>
      <div class="sb">
        <label>Mode <span id="mode-count"></span></label>
        <select id="sel-mode"></select>
        <div class="grid3"><button id="b-prev">‹ Prev</button><button id="b-rand">Random</button><button id="b-next">Next ›</button></div>
        <button id="b-vr" hidden style="width:100%;margin-top:8px;">Enter VR 6DOF</button>
        <label>Palette</label><select id="sel-pal">
          <option value="rainbow">Rainbow Cycle</option><option value="neon">Neon</option><option value="vapor">Vaporwave</option><option value="aurora">Aurora</option><option value="magma">Magma</option><option value="mono">Monochrome</option><option value="album">Album Art</option>
        </select>
      </div>
    </section>

    <section class="sec" data-sec="react">
      <div class="sh"><span class="chev">▼</span>Audio Reactivity</div>
      <div class="sb">
        <label>Master gain <span id="v-gain">1.2</span><input id="s-gain" type="range" min="0.2" max="4" step="0.1" value="1.2"/></label>
        <label>Motion speed <span id="v-motion">0.55×</span><input id="s-motion" type="range" min="0.15" max="2" step="0.05" value="0.55"/></label>
        <label>Reaction <span id="v-react">1.0</span><input id="s-react" type="range" min="0.2" max="2.5" step="0.1" value="1.0"/></label>
      </div>
    </section>

    <section class="sec" data-sec="interact">
      <div class="sh"><span class="chev">▼</span>Interaction — Fluid</div>
      <div class="sb">
        <label>Pointer influence <span id="v-interact">100%</span><input id="s-interact" type="range" min="0" max="200" step="5" value="100"/></label>
        <div class="note">Move paint · hold pull · shift-hold repel · two-finger multi-touch sculpt</div>
        <label>Dissipation <span id="v-diss">0.980</span><input id="s-diss" type="range" min="0.900" max="0.999" step="0.001" value="0.98"/></label>
        <label>Vorticity <span id="v-vort">30</span><input id="s-vort" type="range" min="0" max="60" step="1" value="30"/></label>
      </div>
    </section>

    <section class="sec" data-sec="fractal">
      <div class="sh"><span class="chev">▼</span>Fractal</div>
      <div class="sb">
        <label>Detail <span id="v-detail">60%</span><input id="s-detail" type="range" min="10" max="100" step="5" value="60"/></label>
        <label>Zoom <span id="v-zoom">1.00×</span><input id="s-zoom" type="range" min="-100" max="600" step="1" value="0"/></label>
        <label>Morph <span id="v-morph">0%</span><input id="s-morph" type="range" min="0" max="100" step="1" value="0"/></label>
        <label>Morph auto <span id="v-morph-rate">0%</span><input id="s-morph-rate" type="range" min="0" max="100" step="5" value="0"/></label>
        <button id="b-reset-view" style="width:100%">Reset view</button>
        <label class="row"><span>Fly-through</span><button id="sw-fly" class="switch"></button></label>
        <label>Flight speed <span id="v-fly">1.0×</span><input id="s-fly" type="range" min="0.2" max="3" step="0.1" value="1.0"/></label>
      </div>
    </section>
  </aside>
  <div id="toast"></div>
  `
  // wiring
  const $ = (id: string) => root.querySelector(`#${id}`) as HTMLElement
  $('ptoggle')?.addEventListener('click', () => root.querySelector('#panel')!.classList.toggle('collapsed'))
  root.querySelectorAll('.sh').forEach(h => h.addEventListener('click', () => h.parentElement!.classList.toggle('collapsed')))
  $('b-sys')?.addEventListener('click', opts.onSystem)
  $('b-mic')?.addEventListener('click', opts.onMic)
  $('b-file')?.addEventListener('click', () => (root.querySelector('#f-input') as HTMLInputElement).click())
  root.querySelector('#f-input')?.addEventListener('change', (e: any) => { if (e.target.files[0]) opts.onFile(e.target.files[0]) })
  $('b-demo')?.addEventListener('click', opts.onDemo)
  $('b-demo-next')?.addEventListener('click', opts.onDemoNext)
  $('b-demo-stop')?.addEventListener('click', opts.onDemoStop)
  $('b-yt')?.addEventListener('click', () => { const v = (root.querySelector('#yt-url') as HTMLInputElement).value.trim(); if (v) opts.onYouTube(v) })
  $('b-prev')?.addEventListener('click', () => opts.onMode(-1))
  $('b-next')?.addEventListener('click', () => opts.onMode(1))
  $('b-rand')?.addEventListener('click', opts.onRandom)
  // populate modes
  const sel = root.querySelector('#sel-mode') as HTMLSelectElement
  const groups: Record<string, HTMLOptGroupElement> = {}
  modes.forEach((m: any, i: number) => {
    if (!groups[m.group]) { const og = document.createElement('optgroup'); og.label = m.group; sel.appendChild(og); groups[m.group] = og }
    const opt = document.createElement('option'); opt.value = String(i); opt.textContent = m.name; groups[m.group].appendChild(opt)
  })
  const cnt = root.querySelector('#mode-count') as HTMLElement; if (cnt) cnt.textContent = modes.length + ' modes'
  sel.addEventListener('change', e => opts.onMode(parseInt((e.target as HTMLSelectElement).value, 10)))
  return { root, $ }
}
