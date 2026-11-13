// UI: stacked rhythm rows, one playing at a time. All controls update local state first.
(function () {
  const $ = (id) => document.getElementById(id);
  const STORE = 'rx-state-v2';
  const FOUR = { 16: 'x...x...x...x...', 12: 'x..x..x..x..' };
  const REGION_CLASS = ['badge-fuchsia', 'badge-orange', 'badge-indigo', 'badge-teal', 'badge-lime', 'badge-rose', 'badge-cyan', 'badge-violet', 'badge-yellow'];
  const VOICE_LABEL = { snare: 'Snare', tom: 'Tom', bass: 'Bass' };
  const TOP_VOICES = [['typical', 'Typical'], ['snare', 'Snare'], ['tom', 'Tom'], ['bass', 'Bass']];

  // Family order & labels for carousel view
  const FAMILIES = [
    ['tresillo', 'Tresillo / 3-3-2'],
    ['dembow', 'Dembow'],
    ['cinquillo', 'Cinquillo'],
    ['son-clave', 'Son / Rumba / Bossa'],
    ['samba', 'Samba / Brazilian'],
    ['afoxe', 'Afoxé / Ijexá'],
    ['afrobeat', 'Afrobeat / Afrobeats'],
    ['kuduro', 'Kuduro / Ndombolo / Funaná'],
    ['gqom', 'Gqom'],
    ['amapiano', 'Amapiano / 3-step'],
    ['bacardi', 'Bacardi'],
    ['afrohouse', 'Afro House'],
    ['shangaan', 'Shangaan'],
    ['bell12', '12/8 Bell'],
    ['maloya', 'Maloya / Gnawa'],
    ['maqsum', 'Maqsum / Saidi'],
    ['makossa', 'Makossa'],
  ];
  const FAMILY_LABEL = Object.fromEntries(FAMILIES);
  const FAMILY_ORDER = FAMILIES.map(([id]) => id);

  // tempoMode: 'native' plays each rhythm at its home tempo, 'set' uses state.bpm.
  // viewMode: 'region' (default) or 'family'
  const state = { bpm: 120, tempoMode: 'native', timing: 1, accent: 0.5, topVoice: 'typical', cutoff: 0.76, straight12: true, region: 'All', viewMode: 'region', rows: {} };
  const dom = {}; // rowId -> element refs
  const byId = Object.fromEntries(RX.RHYTHMS.map((r) => [r.id, r]));

  const defaults = (r) => ({ kick: r.kick, top: r.top, groove: r.groove, four: false, muteKick: false, muteTop: false, openKick: false, openTop: false, topVoice: 'typical' });
  function load() {
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(STORE)); } catch (e) {}
    if (saved) ['bpm', 'tempoMode', 'timing', 'accent', 'topVoice', 'cutoff'].forEach((k) => { if (saved[k] != null) state[k] = saved[k]; });
    RX.RHYTHMS.forEach((r) => {
      const s = saved && saved.rows && saved.rows[r.id];
      const ok = s && s.kick && s.kick.length === r.steps && s.top && s.top.length === r.steps && RX.GROOVE_BY_ID[s.groove];
      state.rows[r.id] = ok ? Object.assign(defaults(r), s) : defaults(r);
      // 12/8 rows used to default to the Polak groove, which bent the triplet grid; move saved rows to straight once.
      if (r.steps === 12 && !(saved && saved.straight12) && state.rows[r.id].groove === 'rs:polak') state.rows[r.id].groove = 'straight';
    });
  }
  function save() { try { localStorage.setItem(STORE, JSON.stringify(state)); } catch (e) {} }

  const nativeFour = (r) => r.kick === FOUR[r.steps];
  const patternOf = (r, lane) => (lane === 'kick' ? (state.rows[r.id].four ? FOUR[r.steps] : state.rows[r.id].kick) : state.rows[r.id].top);
  const voiceOf = (r) => {
    const rowVoice = state.rows[r.id]?.topVoice;
    if (rowVoice && rowVoice !== 'typical') return rowVoice;
    return state.topVoice === 'typical' ? r.sound : state.topVoice;
  };
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
    if (r.steps === 12) badges.appendChild(el('span', 'badge', '12/8'));
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

    // Per-row settings panel (initially hidden)
    const settingsPanel = d.settingsPanel = el('div', 'row-settings', '');
    settingsPanel.hidden = true;
    const settingsGrid = el('div', 'settings-grid');
    // Top voice selector for this pattern
    const voiceSelect = el('select', 'field-select');
    voiceSelect.setAttribute('aria-label', 'Top sound for ' + r.name);
    TOP_VOICES.forEach(([v, label]) => {
      const o = el('option', null, label); o.value = v; voiceSelect.appendChild(o);
    });
    voiceSelect.value = state.rows[r.id].topVoice || 'typical';
    voiceSelect.addEventListener('change', () => {
      state.rows[r.id].topVoice = voiceSelect.value;
      paintLane(r, 'top');
      save();
    });
    const voiceLabel = el('label', 'setting-label', 'Top sound');
    voiceLabel.appendChild(voiceSelect);
    settingsGrid.appendChild(voiceLabel);
    settingsPanel.appendChild(settingsGrid);
    root.appendChild(settingsPanel);

    // Settings toggle button
    const settingsBtn = d.settingsBtn = iconBtn('tune', 'Pattern settings');
    settingsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isHidden = settingsPanel.hidden;
      settingsPanel.hidden = !isHidden;
      settingsBtn.classList.toggle('active', !isHidden);
    });
    head.appendChild(settingsBtn);

    const lanes = el('div', 'lanes');
    lanes.appendChild(buildLane(r, 'kick'));
    lanes.appendChild(buildLane(r, 'top'));
    root.appendChild(lanes);
    paintRow(r);
    return root;
  }

  // ── Transport ──
  let nowRow = null;
  let pendingSwitchTarget = null; // rowId that is queued to play next
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
    const sched = RX.audio.getSchedulerState ? RX.audio.getSchedulerState() : null;
    pendingSwitchTarget = sched && sched.pendingSwitch ? sched.pendingSwitch.rowId : null;
    Object.entries(dom).forEach(([id, d]) => {
      const isPlaying = id === cur;
      const isPending = id === pendingSwitchTarget;
      if (d.root) {
        d.root.classList.toggle('row-playing', isPlaying);
        d.root.classList.toggle('row-pending', isPending);
      }
      if (d.playIcon) {
        d.playIcon.textContent = isPlaying ? 'stop' : (isPending ? 'schedule' : 'play_arrow');
        d.play.title = isPlaying ? 'Stop ' + byId[id].name : (isPending ? 'Queued: ' + byId[id].name : 'Play ' + byId[id].name);
        d.play.setAttribute('aria-label', d.play.title);
      }
      if (d.card) {
        d.card.classList.toggle('card-playing', isPlaying);
        d.card.classList.toggle('card-pending', isPending);
      }
      if (d.cardPlay) {
        d.cardPlay.innerHTML = isPlaying ? '<span class="material-symbols-outlined">stop</span>' : (isPending ? '<span class="material-symbols-outlined">schedule</span>' : '<span class="material-symbols-outlined">play_arrow</span>');
      }
    });
    paintTempo();
  }
  function togglePlay(id) {
    clearPlayhead();
    const cur = RX.audio.playing();
    if (cur === id) {
      RX.audio.stop();
      pendingSwitchTarget = null;
    } else if (cur) {
      // Another pattern is playing — schedule switch at next bar boundary
      RX.audio.scheduleSwitch(id, playState, onStep, paintPlaying);
    } else {
      RX.audio.play(id, playState, onStep, paintPlaying);
    }
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
    applyViewFilter();
  }

  function setViewMode(mode) {
    state.viewMode = mode;
    document.querySelectorAll('#view-tabs .m3-pill-tab').forEach((b) => b.classList.toggle('active', b.dataset.view === mode));
    document.querySelectorAll('#region-tabs .m3-pill-tab').forEach((b) => b.style.display = mode === 'region' ? '' : 'none');
    applyViewFilter();
  }

  function applyViewFilter() {
    if (state.viewMode === 'region') {
      // Show/hide by region
      Object.values(dom).forEach((d) => { d.root.hidden = state.region !== 'All' && d.root.dataset.region !== state.region; });
      // Ensure rows container is flat list
      const rows = $('rows');
      rows.style.display = 'flex';
      rows.style.flexDirection = 'column';
      rows.style.gap = '8px';
    } else {
      // Family carousel view: rearrange into family carousels
      renderFamilyCarousels();
    }
  }

  function renderFamilyCarousels() {
    const rows = $('rows');
    rows.style.display = 'flex';
    rows.style.flexDirection = 'column';
    rows.style.gap = '24px';
    rows.innerHTML = '';
    // Group rhythms by family
    const byFamily = {};
    RX.RHYTHMS.forEach((r) => {
      const fam = r.family || 'other';
      if (!byFamily[fam]) byFamily[fam] = [];
      byFamily[fam].push(r);
    });
    // Render families in order
    FAMILY_ORDER.forEach((famId) => {
      const rhythms = byFamily[famId];
      if (!rhythms || !rhythms.length) return;
      const section = el('section', 'family-carousel');
      section.dataset.family = famId;
      const header = el('div', 'family-header');
      header.appendChild(el('h3', 'family-title', FAMILY_LABEL[famId] || famId));
      section.appendChild(header);
      const carousel = el('div', 'carousel');
      rhythms.forEach((r, idx) => {
        const card = buildFamilyCard(r, idx);
        carousel.appendChild(card);
      });
      section.appendChild(carousel);
      rows.appendChild(section);
    });
    // Any remaining families not in FAMILY_ORDER
    Object.keys(byFamily).forEach((famId) => {
      if (FAMILY_ORDER.includes(famId)) return;
      const rhythms = byFamily[famId];
      const section = el('section', 'family-carousel');
      section.dataset.family = famId;
      const header = el('div', 'family-header');
      header.appendChild(el('h3', 'family-title', FAMILY_LABEL[famId] || famId));
      section.appendChild(header);
      const carousel = el('div', 'carousel');
      rhythms.forEach((r, idx) => {
        const card = buildFamilyCard(r, idx);
        carousel.appendChild(card);
      });
      section.appendChild(carousel);
      rows.appendChild(section);
    });
  }

  function buildFamilyCard(r, idx) {
    const card = el('div', 'family-card');
    card.dataset.id = r.id;
    card.dataset.region = r.region;
    // Header with name + region badge
    const head = el('div', 'card-head');
    head.appendChild(el('h4', 'card-title', r.name));
    const badge = el('span', 'badge ' + REGION_CLASS[RX.REGIONS.indexOf(r.region) % REGION_CLASS.length], r.region);
    head.appendChild(badge);
    if (r.steps === 12) head.appendChild(el('span', 'badge', '12/8'));
    card.appendChild(head);
    // Mini step grid (read-only preview)
    const preview = el('div', 'card-preview');
    const kickGrid = el('div', 'steps steps-' + r.steps + ' mini');
    const topGrid = el('div', 'steps steps-' + r.steps + ' mini');
    r.kick.split('').forEach((ch, i) => {
      const b = el('div', 'step' + (i % (r.steps / 4) === 0 ? ' step-beat' : '') +
        (ch === 'X' ? ' step-accent' : ch === 'x' ? ' step-hit' : ch === 'o' ? ' step-ghost' : ''));
      kickGrid.appendChild(b);
    });
    r.top.split('').forEach((ch, i) => {
      const b = el('div', 'step' + (i % (r.steps / 4) === 0 ? ' step-beat' : '') +
        (ch === 'X' ? ' step-accent' : ch === 'x' ? ' step-hit' : ch === 'o' ? ' step-ghost' : ''));
      topGrid.appendChild(b);
    });
    preview.appendChild(kickGrid);
    preview.appendChild(topGrid);
    card.appendChild(preview);
    // Play button
    const playBtn = el('button', 'card-play');
    playBtn.setAttribute('aria-label', 'Play ' + r.name);
    playBtn.innerHTML = '<span class="material-symbols-outlined">play_arrow</span>';
    playBtn.addEventListener('click', () => togglePlay(r.id));
    card.appendChild(playBtn);
    // Store ref for paintPlaying
    if (!dom[r.id]) dom[r.id] = {};
    dom[r.id].card = card;
    dom[r.id].cardPlay = playBtn;
    return card;
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
    // Region tabs
    ['All', ...RX.REGIONS].forEach((region) => {
      const b = el('button', 'm3-pill-tab', region); b.dataset.region = region; b.setAttribute('role', 'tab');
      b.addEventListener('click', () => setRegion(region));
      tabs.appendChild(b);
    });
    // View mode tabs (Region / Family)
    const viewTabs = el('div', 'm3-pill-tabs gm3-connected-dsp', ''); viewTabs.id = 'view-tabs'; viewTabs.setAttribute('role', 'tablist');
    [['region', 'By Region'], ['family', 'By Family']].forEach(([v, label]) => {
      const b = el('button', 'm3-pill-tab', label); b.dataset.view = v; b.setAttribute('role', 'tab');
      b.addEventListener('click', () => setViewMode(v));
      viewTabs.appendChild(b);
    });
    tabs.parentNode.insertBefore(viewTabs, tabs.nextSibling);
    // Build all rows (hidden initially, shown by view mode)
    RX.RHYTHMS.forEach((r) => rows.appendChild(buildRow(r, RX.REGIONS.indexOf(r.region))));
    setRegion('All');
    setViewMode('region');

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

    // Top-line low-pass: slider 0..1 maps logarithmically onto 500 Hz .. 16 kHz.
    const cutoffHz = () => 500 * Math.pow(32, state.cutoff);
    const paintCutoff = () => {
      const hz = cutoffHz();
      $('cutoff-value').textContent = hz >= 1000 ? (hz / 1000).toFixed(1) + ' kHz' : Math.round(hz) + ' Hz';
      $('cutoff-slider').value = Math.round(state.cutoff * 100);
      RX.audio.setTopCutoff(hz);
    };
    $('cutoff-slider').addEventListener('input', (e) => { state.cutoff = +e.target.value / 100; paintCutoff(); save(); });
    paintCutoff();

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
