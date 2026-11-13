// UI: stacked rhythm rows, one playing at a time. All controls update local state first.
(function () {
  const $ = (id) => document.getElementById(id);
  const STORE = 'rx-state-v1';
  const FOUR = { 16: 'x...x...x...x...', 12: 'x..x..x..x..' };
  const CYCLE = { '.': 'x', x: 'X', X: 'o', o: '.' };
  const SRC_LABEL = { agr: 'Ableton groove data', std: 'Documented timeline', approx: 'Approximation', audio: 'Measured from audio' };
  const SRC_CLASS = { agr: 'badge-green', std: 'badge-blue', approx: 'badge-amber', audio: 'badge-violet' };
  const REGION_CLASS = ['badge-fuchsia', 'badge-orange', 'badge-indigo', 'badge-teal', 'badge-lime', 'badge-rose', 'badge-cyan', 'badge-violet', 'badge-yellow'];
  const SOUNDS = [['snare', 'Snare'], ['tom', 'Tom'], ['bass', 'Bass']];

  const state = { bpm: 120, timing: 1, accent: 0.5, region: 'All', rows: {} };
  const dom = {}; // rowId -> { root, play, kickSteps, topSteps, ... }

  function load() {
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(STORE)); } catch (e) {}
    if (saved) Object.assign(state, { bpm: saved.bpm || 120, timing: saved.timing ?? 1, accent: saved.accent ?? 0.5 });
    RX.RHYTHMS.forEach((r) => {
      const s = saved && saved.rows && saved.rows[r.id];
      const ok = s && s.kick && s.kick.length === r.steps && s.top.length === r.steps && RX.GROOVE_BY_ID[s.groove];
      state.rows[r.id] = ok ? s : defaults(r);
    });
  }
  const defaults = (r) => ({ kick: r.kick, top: r.top, sound: r.sound, groove: r.groove, four: false });
  function save() { try { localStorage.setItem(STORE, JSON.stringify(state)); } catch (e) {} }

  const kickOf = (r) => (state.rows[r.id].four ? FOUR[r.steps] : state.rows[r.id].kick);

  // Live state for the scheduler: read on every tick, so edits and tempo changes land immediately.
  function playState(id) {
    const r = RX.RHYTHMS.find((x) => x.id === id);
    if (!r) return null;
    const s = state.rows[id];
    return { bpm: state.bpm, steps: r.steps, groove: RX.GROOVE_BY_ID[s.groove], timing: state.timing, accent: state.accent,
      lanes: [{ pattern: kickOf(r), voice: 'kick' }, { pattern: s.top, voice: s.sound }] };
  }

  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  const icon = (name) => el('span', 'material-symbols-outlined', name);

  function stepClass(ch, i, steps) {
    const lv = ch === 'X' ? ' step-accent' : ch === 'x' ? ' step-hit' : ch === 'o' ? ' step-ghost' : '';
    return 'step' + (i % (steps / 4) === 0 ? ' step-beat' : '') + lv;
  }

  function paintLane(r, lane) {
    const d = dom[r.id], s = state.rows[r.id];
    const pattern = lane === 'kick' ? kickOf(r) : s.top;
    d[lane + 'Steps'].forEach((b, i) => { b.className = stepClass(pattern[i], i, r.steps); });
    if (lane === 'kick') {
      d.kickGrid.classList.toggle('lane-locked', s.four);
      d.fourBtns.forEach((b) => b.classList.toggle('active', (b.dataset.four === '1') === s.four));
    } else {
      d.soundBtns.forEach((b) => b.classList.toggle('active', b.dataset.sound === s.sound));
    }
  }

  function buildLane(r, lane, title) {
    const wrap = el('div', 'lane');
    const head = el('div', 'lane-head');
    head.appendChild(el('span', 'lane-title', title));
    const seg = el('div', 'm3-pill-tabs gm3-connected-dsp');
    head.appendChild(seg);
    const d = dom[r.id];
    if (lane === 'kick') {
      d.fourBtns = [['0', 'Pattern'], ['1', '4/4']].map(([v, label]) => {
        const b = el('button', 'm3-pill-tab', label); b.dataset.four = v;
        b.addEventListener('click', () => { state.rows[r.id].four = v === '1'; paintLane(r, 'kick'); save(); });
        seg.appendChild(b); return b;
      });
    } else {
      d.soundBtns = SOUNDS.map(([v, label]) => {
        const b = el('button', 'm3-pill-tab', label); b.dataset.sound = v;
        b.addEventListener('click', () => { state.rows[r.id].sound = v; paintLane(r, 'top'); save(); if (RX.audio.playing() !== r.id) RX.audio.hit(v); });
        seg.appendChild(b); return b;
      });
    }
    const dl = el('button', 'icon-btn lane-download'); dl.title = 'Export ' + title.toLowerCase() + ' as MIDI'; dl.setAttribute('aria-label', dl.title);
    dl.appendChild(icon('download'));
    dl.addEventListener('click', () => {
      const s = state.rows[r.id];
      RX.exportMidi({ rhythmName: r.name, partName: lane === 'kick' ? 'kick' : s.sound, steps: r.steps, bpm: state.bpm,
        pattern: lane === 'kick' ? kickOf(r) : s.top, voice: lane === 'kick' ? 'kick' : s.sound,
        groove: RX.GROOVE_BY_ID[s.groove], timing: state.timing, accent: state.accent });
    });
    head.appendChild(dl);
    const grid = el('div', 'steps steps-' + r.steps);
    d[lane + 'Grid'] = grid;
    d[lane + 'Steps'] = Array.from({ length: r.steps }, (_, i) => {
      const b = el('button'); b.setAttribute('aria-label', title + ' step ' + (i + 1));
      b.addEventListener('click', () => {
        const s = state.rows[r.id];
        if (lane === 'kick' && s.four) return;
        const cur = s[lane];
        s[lane] = cur.slice(0, i) + CYCLE[cur[i]] + cur.slice(i + 1);
        paintLane(r, lane); save();
      });
      grid.appendChild(b); return b;
    });
    wrap.appendChild(head); wrap.appendChild(grid);
    return wrap;
  }

  function buildRow(r, regionIndex) {
    const d = dom[r.id] = {};
    const root = d.root = el('section', 'row'); root.dataset.region = r.region;

    const head = el('div', 'row-head');
    const play = d.play = el('button', 'play-btn'); play.title = 'Play ' + r.name; play.setAttribute('aria-label', play.title);
    play.appendChild(d.playIcon = icon('play_arrow'));
    play.addEventListener('click', () => togglePlay(r.id));
    head.appendChild(play);

    const meta = el('div', 'row-meta');
    meta.appendChild(el('h2', 'row-title', r.name));
    const badges = el('div', 'badge-row');
    badges.appendChild(el('span', 'badge ' + REGION_CLASS[regionIndex % REGION_CLASS.length], r.region));
    badges.appendChild(el('span', 'badge ' + SRC_CLASS[r.src], SRC_LABEL[r.src]));
    meta.appendChild(badges);
    head.appendChild(meta);

    const bpm = el('button', 'bpm-chip'); bpm.title = 'Set tempo to ' + r.bpm + ' bpm (usual range ' + r.range + ')';
    bpm.appendChild(icon('speed')); bpm.appendChild(el('span', 'bpm-chip-value', r.bpm + ' bpm')); bpm.appendChild(el('span', 'bpm-chip-range', r.range));
    bpm.addEventListener('click', () => setBpm(r.bpm));
    head.appendChild(bpm);

    const sel = d.groove = el('select', 'field-select'); sel.setAttribute('aria-label', 'Groove for ' + r.name);
    const groups = {};
    RX.GROOVES.forEach((g) => {
      const og = groups[g.group] || (groups[g.group] = sel.appendChild(Object.assign(document.createElement('optgroup'), { label: g.group })));
      const o = el('option', null, g.name + (g.id === r.groove ? ' (typical)' : '')); o.value = g.id; og.appendChild(o);
    });
    sel.value = state.rows[r.id].groove;
    sel.addEventListener('change', () => { state.rows[r.id].groove = sel.value; save(); });
    head.appendChild(sel);

    const info = el('button', 'icon-btn'); info.title = 'About this rhythm'; info.setAttribute('aria-label', info.title); info.appendChild(icon('info'));
    const reset = el('button', 'icon-btn'); reset.title = 'Reset this row'; reset.setAttribute('aria-label', reset.title); reset.appendChild(icon('restart_alt'));
    head.appendChild(info); head.appendChild(reset);
    root.appendChild(head);

    const note = el('p', 'row-note', r.note); note.hidden = true;
    info.addEventListener('click', () => { note.hidden = !note.hidden; info.classList.toggle('active', !note.hidden); });
    reset.addEventListener('click', () => { state.rows[r.id] = defaults(r); sel.value = r.groove; paintLane(r, 'kick'); paintLane(r, 'top'); save(); });
    root.appendChild(note);

    const lanes = el('div', 'lanes');
    lanes.appendChild(buildLane(r, 'kick', 'Kick'));
    lanes.appendChild(buildLane(r, 'top', 'Snare'));
    root.appendChild(lanes);
    paintLane(r, 'kick'); paintLane(r, 'top');
    return root;
  }

  // ── Transport ──
  let nowRow = null, nowStep = -1;
  function clearPlayhead() {
    if (nowRow && dom[nowRow]) ['kickSteps', 'topSteps'].forEach((k) => dom[nowRow][k][nowStep] && dom[nowRow][k][nowStep].classList.remove('step-now'));
    nowRow = null; nowStep = -1;
  }
  function onStep(id, i) {
    clearPlayhead();
    nowRow = id; nowStep = i;
    ['kickSteps', 'topSteps'].forEach((k) => dom[id][k][i].classList.add('step-now'));
  }
  function paintPlaying() {
    const cur = RX.audio.playing();
    Object.entries(dom).forEach(([id, d]) => {
      d.root.classList.toggle('row-playing', id === cur);
      d.playIcon.textContent = id === cur ? 'stop' : 'play_arrow';
    });
  }
  function togglePlay(id) {
    clearPlayhead();
    if (RX.audio.playing() === id) RX.audio.stop(); else RX.audio.play(id, playState, onStep);
    paintPlaying();
  }

  function setBpm(v) {
    state.bpm = Math.max(60, Math.min(300, Math.round(v)));
    $('bpm-value').textContent = state.bpm; $('bpm-slider').value = state.bpm;
    save();
  }

  function setRegion(region) {
    state.region = region;
    document.querySelectorAll('#region-tabs .m3-pill-tab').forEach((b) => b.classList.toggle('active', b.dataset.region === region));
    Object.values(dom).forEach((d) => { d.root.hidden = region !== 'All' && d.root.dataset.region !== region; });
  }

  function init() {
    load();
    const rows = $('rows'), tabs = $('region-tabs');
    ['All', ...RX.REGIONS].forEach((region) => {
      const b = el('button', 'm3-pill-tab', region); b.dataset.region = region; b.setAttribute('role', 'tab');
      b.addEventListener('click', () => setRegion(region));
      tabs.appendChild(b);
    });
    RX.RHYTHMS.forEach((r) => rows.appendChild(buildRow(r, RX.REGIONS.indexOf(r.region))));
    setRegion('All'); setBpm(state.bpm);

    $('bpm-slider').addEventListener('input', (e) => setBpm(+e.target.value));
    $('bpm-down').addEventListener('click', () => setBpm(state.bpm - 1));
    $('bpm-up').addEventListener('click', () => setBpm(state.bpm + 1));
    const amount = (key, slider, label) => {
      const paint = () => { $(label).textContent = Math.round(state[key] * 100) + '%'; $(slider).value = Math.round(state[key] * 100); };
      $(slider).addEventListener('input', (e) => { state[key] = +e.target.value / 100; paint(); save(); });
      paint();
    };
    amount('timing', 'timing-slider', 'timing-value');
    amount('accent', 'accent-slider', 'accent-value');

    $('export-als').addEventListener('click', () => {
      const out = RX.RHYTHMS.map((r) => {
        const s = state.rows[r.id];
        return { name: r.name, bpm: r.bpm, steps: r.steps, kick: s.kick, top: s.top, voice: s.sound,
          groove: RX.GROOVE_BY_ID[s.groove], timing: state.timing, accent: state.accent };
      });
      RX.exportAls(out, state.bpm);
    });

    const paintTheme = (t) => { $('theme-icon').textContent = t === 'dark' ? 'light_mode' : 'dark_mode'; };
    paintTheme(window.RX_applyTheme());
    $('theme-toggle').addEventListener('click', () => {
      const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem('rx-theme', next); } catch (e) {}
      paintTheme(window.RX_applyTheme());
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && RX.audio.playing()) { RX.audio.stop(); clearPlayhead(); paintPlaying(); } });
    window.__APP_LOADED__ = true;
  }

  try { init(); } catch (e) { window.dispatchEvent(new ErrorEvent('error', { message: e.stack || String(e) })); throw e; }
})();
