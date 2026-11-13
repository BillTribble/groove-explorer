// UI: stacked rhythm rows, one playing at a time. All controls update local state first.
(function () {
  const $ = (id) => document.getElementById(id);
  const STORE = 'rx-state-v2';
  const FOUR = { 16: 'x...x...x...x...', 12: 'x..x..x..x..' };
  const SRC_LABEL = { agr: 'Ableton groove data', std: 'Documented timeline', approx: 'Approximation', audio: 'Measured from audio' };
  const SRC_CLASS = { agr: 'badge-green', std: 'badge-blue', approx: 'badge-amber', audio: 'badge-violet' };
  const REGION_CLASS = ['badge-fuchsia', 'badge-orange', 'badge-indigo', 'badge-teal', 'badge-lime', 'badge-rose', 'badge-cyan', 'badge-violet', 'badge-yellow'];
  const VOICE_LABEL = { snare: 'Snare', tom: 'Tom', bass: 'Bass' };
  const TOP_VOICES = [['typical', 'Typical'], ['snare', 'Snare'], ['tom', 'Tom'], ['bass', 'Bass']];

  // tempoMode: 'native' plays each rhythm at its home tempo, 'set' uses state.bpm.
  const state = { bpm: 120, tempoMode: 'native', timing: 1, accent: 0.5, topVoice: 'typical', region: 'All', rows: {} };
  const dom = {}; // rowId -> element refs
  const byId = Object.fromEntries(RX.RHYTHMS.map((r) => [r.id, r]));

  const defaults = (r) => ({ kick: r.kick, top: r.top, groove: r.groove, four: false, muteKick: false, muteTop: false, openKick: false, openTop: false });
  function load() {
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(STORE)); } catch (e) {}
    if (saved) ['bpm', 'tempoMode', 'timing', 'accent', 'topVoice'].forEach((k) => { if (saved[k] != null) state[k] = saved[k]; });
    RX.RHYTHMS.forEach((r) => {
      const s = saved && saved.rows && saved.rows[r.id];
      const ok = s && s.kick && s.kick.length === r.steps && s.top && s.top.length === r.steps && RX.GROOVE_BY_ID[s.groove];
      state.rows[r.id] = ok ? Object.assign(defaults(r), s) : defaults(r);
    });
  }
  function save() { try { localStorage.setItem(STORE, JSON.stringify(state)); } catch (e) {} }

  const nativeFour = (r) => r.kick === FOUR[r.steps];
  const patternOf = (r, lane) => (lane === 'kick' ? (state.rows[r.id].four ? FOUR[r.steps] : state.rows[r.id].kick) : state.rows[r.id].top);
  const voiceOf = (r) => (state.topVoice === 'typical' ? r.sound : state.topVoice);
  const bpmOf = (r) => (state.tempoMode === 'native' ? r.bpm : state.bpm);
  const cap = (lane) => (lane === 'kick' ? 'Kick' : 'Top');
  // A lane whose two halves match is shown as one half unless the user opens it.
  const foldable = (p) => p.slice(0, p.length / 2) === p.slice(p.length / 2);
  const shownSteps = (r, lane) => {
    const p = patternOf(r, lane);
    return foldable(p) && !state.rows[r.id]['open' + cap(lane)] ? p.length / 2 : p.length;
  };

  // Live state for the scheduler: read on every tick, so edits and tempo changes land immediately.
  function playState(id) {
    const r = byId[id];
    if (!r) return null;
    const s = state.rows[id];
    const off = '.'.repeat(r.steps);
    return { bpm: bpmOf(r), steps: r.steps, groove: RX.GROOVE_BY_ID[s.groove], timing: state.timing, accent: state.accent,
      lanes: [{ pattern: s.muteKick ? off : patternOf(r, 'kick'), voice: 'kick' }, { pattern: s.muteTop ? off : s.top, voice: voiceOf(r) }] };
  }

  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  const icon = (name) => el('span', 'material-symbols-outlined', name);
  function iconBtn(name, title, cls) {
    const b = el('button', 'icon-btn' + (cls ? ' ' + cls : '')); b.title = title; b.setAttribute('aria-label', title);
    b.appendChild(icon(name)); return b;
  }

  function paintLane(r, lane) {
    const d = dom[r.id], s = state.rows[r.id], L = cap(lane);
    const pattern = patternOf(r, lane), shown = shownSteps(r, lane), muted = s['mute' + L];
    d[lane + 'Grid'].className = 'steps steps-' + shown + (lane === 'kick' && s.four ? ' lane-locked' : '');
    d[lane + 'Steps'].forEach((b, i) => {
      const ch = pattern[i];
      b.hidden = i >= shown;
      b.className = 'step' + (i % (r.steps / 4) === 0 ? ' step-beat' : '') +
        (ch === 'X' ? ' step-accent' : ch === 'x' ? ' step-hit' : ch === 'o' ? ' step-ghost' : '');
    });
    d[lane + 'Wrap'].classList.toggle('lane-muted', muted);
    d[lane + 'Mute'].setAttribute('aria-pressed', String(!muted));
    d[lane + 'MuteIcon'].textContent = muted ? 'volume_off' : 'volume_up';
    d[lane + 'MuteLabel'].textContent = lane === 'kick' ? 'Kick' : VOICE_LABEL[voiceOf(r)];
    d[lane + 'Fold'].hidden = !foldable(pattern);
    d[lane + 'FoldIcon'].textContent = shown < pattern.length ? 'unfold_more' : 'unfold_less';
    if (lane === 'kick' && d.fourBtns) d.fourBtns.forEach((b) => b.classList.toggle('active', (b.dataset.four === '1') === s.four));
  }
  const paintRow = (r) => { paintLane(r, 'kick'); paintLane(r, 'top'); };

  function buildLane(r, lane) {
    const d = dom[r.id], L = cap(lane);
    const wrap = d[lane + 'Wrap'] = el('div', 'lane');
    const head = el('div', 'lane-head');

    const mute = d[lane + 'Mute'] = el('button', 'lane-toggle'); mute.title = 'Turn this part on or off';
    mute.appendChild(d[lane + 'MuteIcon'] = icon('volume_up'));
    mute.appendChild(d[lane + 'MuteLabel'] = el('span', 'lane-toggle-label', ''));
    mute.addEventListener('click', () => { const s = state.rows[r.id]; s['mute' + L] = !s['mute' + L]; paintLane(r, lane); save(); });
    head.appendChild(mute);

    if (lane === 'kick' && !nativeFour(r)) {
      const seg = el('div', 'm3-pill-tabs gm3-connected-dsp');
      d.fourBtns = [['0', 'Pattern'], ['1', '4/4']].map(([v, label]) => {
        const b = el('button', 'm3-pill-tab', label); b.dataset.four = v;
        b.addEventListener('click', () => { state.rows[r.id].four = v === '1'; paintLane(r, 'kick'); save(); });
        seg.appendChild(b); return b;
      });
      head.appendChild(seg);
    }

    const fold = d[lane + 'Fold'] = iconBtn('unfold_more', 'Show the whole bar or one half', 'lane-fold');
    d[lane + 'FoldIcon'] = fold.firstChild;
    fold.addEventListener('click', () => { const s = state.rows[r.id]; s['open' + L] = !s['open' + L]; paintLane(r, lane); save(); });
    head.appendChild(fold);

    const dl = iconBtn('download', 'Export this part as MIDI', 'lane-download');
    dl.addEventListener('click', () => {
      const s = state.rows[r.id], voice = lane === 'kick' ? 'kick' : voiceOf(r);
      RX.exportMidi({ rhythmName: r.name, partName: voice, steps: r.steps, bpm: bpmOf(r), pattern: patternOf(r, lane), voice,
        groove: RX.GROOVE_BY_ID[s.groove], timing: state.timing, accent: state.accent });
    });
    head.appendChild(dl);

    const grid = d[lane + 'Grid'] = el('div', 'steps');
    d[lane + 'Steps'] = Array.from({ length: r.steps }, (_, i) => {
      const b = el('button'); b.setAttribute('aria-label', (lane === 'kick' ? 'Kick' : 'Top') + ' step ' + (i + 1));
      b.addEventListener('click', () => {
        const s = state.rows[r.id];
        if (lane === 'kick' && s.four) return;
        const cur = s[lane], half = r.steps / 2, folded = shownSteps(r, lane) < r.steps;
        // One tap turns a step on or off; turning it back on restores the rhythm's own accent level.
        const next = cur[i] !== '.' ? '.' : (r[lane][i] !== '.' ? r[lane][i] : 'x');
        const arr = cur.split('');
        arr[i] = next;
        if (folded) arr[i + half] = next;
        s[lane] = arr.join('');
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

    const info = iconBtn('info', 'About this rhythm');
    const reset = iconBtn('restart_alt', 'Reset this row');
    head.appendChild(info); head.appendChild(reset);
    root.appendChild(head);

    const note = el('p', 'row-note', r.note); note.hidden = true;
    info.addEventListener('click', () => { note.hidden = !note.hidden; info.classList.toggle('active', !note.hidden); });
    reset.addEventListener('click', () => { state.rows[r.id] = defaults(r); sel.value = r.groove; paintRow(r); save(); });
    root.appendChild(note);

    const lanes = el('div', 'lanes');
    lanes.appendChild(buildLane(r, 'kick'));
    lanes.appendChild(buildLane(r, 'top'));
    root.appendChild(lanes);
    paintRow(r);
    return root;
  }

  // ── Transport ──
  let nowRow = null;
  function clearPlayhead() {
    if (nowRow && dom[nowRow]) ['kickSteps', 'topSteps'].forEach((k) => dom[nowRow][k].forEach((b) => b.classList.remove('step-now')));
    nowRow = null;
  }
  function onStep(id, i) {
    clearPlayhead();
    nowRow = id;
    const r = byId[id];
    ['kick', 'top'].forEach((lane) => { const b = dom[id][lane + 'Steps'][i % shownSteps(r, lane)]; if (b) b.classList.add('step-now'); });
  }
  function paintTempo() {
    const cur = RX.audio.playing(), native = state.tempoMode === 'native';
    $('bpm-value').textContent = native ? (cur ? byId[cur].bpm : '') : state.bpm;
    $('bpm-unit').hidden = native && !cur;
    $('bpm-slider').value = state.bpm; $('bpm-set-value').textContent = state.bpm;
    document.querySelectorAll('#tempo-mode .m3-pill-tab').forEach((b) => b.classList.toggle('active', b.dataset.mode === state.tempoMode));
  }
  function paintPlaying() {
    const cur = RX.audio.playing();
    Object.entries(dom).forEach(([id, d]) => {
      d.root.classList.toggle('row-playing', id === cur);
      d.playIcon.textContent = id === cur ? 'stop' : 'play_arrow';
    });
    paintTempo();
  }
  function togglePlay(id) {
    clearPlayhead();
    if (RX.audio.playing() === id) RX.audio.stop(); else RX.audio.play(id, playState, onStep);
    paintPlaying();
  }

  // Choosing a tempo by hand always means "use this tempo".
  function setBpm(v) {
    state.bpm = Math.max(60, Math.min(300, Math.round(v)));
    state.tempoMode = 'set';
    paintTempo(); save();
  }

  function setRegion(region) {
    state.region = region;
    document.querySelectorAll('#region-tabs .m3-pill-tab').forEach((b) => b.classList.toggle('active', b.dataset.region === region));
    Object.values(dom).forEach((d) => { d.root.hidden = region !== 'All' && d.root.dataset.region !== region; });
  }

  let toastTimer = null;
  function toast(text) {
    let t = $('toast');
    if (!t) { t = el('div', 'toast'); t.id = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.textContent = text; t.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.hidden = true; }, 4000);
  }

  function segmented(hostId, options, key, attr, onChange) {
    const host = $(hostId);
    const btns = options.map(([v, label]) => {
      const b = el('button', 'm3-pill-tab', label); b.dataset[attr] = v;
      b.addEventListener('click', () => { state[key] = v; paint(); save(); onChange(); });
      host.appendChild(b); return b;
    });
    const paint = () => btns.forEach((b) => b.classList.toggle('active', b.dataset[attr] === state[key]));
    paint();
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
    setRegion('All');

    segmented('tempo-mode', [['native', 'Native'], ['set', 'Set bpm']], 'tempoMode', 'mode', paintTempo);
    segmented('top-voice', TOP_VOICES, 'topVoice', 'voice', () => {
      RX.RHYTHMS.forEach((r) => paintLane(r, 'top'));
      if (!RX.audio.playing() && state.topVoice !== 'typical') RX.audio.hit(state.topVoice);
    });
    paintTempo();

    const settings = $('settings'), toggle = $('settings-toggle');
    toggle.addEventListener('click', () => {
      settings.hidden = !settings.hidden;
      toggle.setAttribute('aria-expanded', String(!settings.hidden));
      toggle.classList.toggle('active', !settings.hidden);
    });

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
      if (!('CompressionStream' in window)) { toast('Ableton set export needs a newer browser'); return; }
      const out = RX.RHYTHMS.map((r) => {
        const s = state.rows[r.id];
        return { name: r.name, bpm: r.bpm, steps: r.steps, kick: s.kick, top: s.top, voice: voiceOf(r),
          groove: RX.GROOVE_BY_ID[s.groove], timing: state.timing, accent: state.accent };
      });
      RX.exportAls(out, state.bpm).catch((e) => toast('Export failed: ' + e.message));
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
