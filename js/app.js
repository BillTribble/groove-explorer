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
    ['djembe', 'Djembe / Mandé'],
    ['ewe', 'Ewe / Fon (Ghana/Togo)'],
    ['bata', 'Batá / Yoruba Sacred'],
    ['ingoma', 'Ingoma / Burundi-Rwanda'],
    ['mbira', 'Mbira / Zimbabwe'],
    ['baganda', 'Baganda / Uganda'],
    ['taarab', 'Taarab / Swahili Coast'],
    ['balkan-5', 'Balkan 5/16 (Paidushko)'],
    ['balkan-7', 'Balkan 7/16 (Rachenitsa)'],
    ['balkan-9', 'Balkan 9/16 (Daychovo)'],
    ['balkan-11', 'Balkan 11/16 (Kopanitsa)'],
    ['balkan-complex', 'Balkan Mixed Meters'],
    ['tala-7', 'Indian Tala 7-beat'],
    ['tala-10', 'Indian Tala 10-beat'],
    ['tala-12', 'Indian Tala 12-beat'],
    ['bomba', 'Bomba / Puerto Rico'],
    ['samai', 'Samai / Arab Classical'],
    ['jurjina', 'Jurjina / Iraq-Kurdish'],
    ['kalamatianos', 'Kalamatianos / Greece'],
    ['karsilama', 'Karsilama / Turkey 9/8'],
    ['laz', 'Laz / Black Sea 7/8'],
    ['chiftetelli', 'Chiftetelli / Turkish 8/4'],
    ['dawr-hindi', 'Dawr Hindi / 7/8 Classical'],
    ['festejo', 'Festejo / Afro-Peruvian'],
    ['lando', 'Landó / Afro-Peruvian'],
    ['zamacueca', 'Zamacueca / Andes'],
    ['joropo', 'Joropo / Venezuela'],
    ['nyabinghi', 'Nyabinghi / Rastafari'],
    ['kumina', 'Kumina / Jamaica'],
    ['andalusi', 'Andalusi / Maghreb Classical'],
    ['ghaita', 'Ghaita / Rif Mountains'],
  ];
  const FAMILY_LABEL = Object.fromEntries(FAMILIES);
  const FAMILY_ORDER = FAMILIES.map(([id]) => id);

  // tempoMode: 'native' plays each rhythm at its home tempo, 'set' uses state.bpm.
  // viewMode: 'region' (default) or 'family'
  const state = { bpm: 120, tempoMode: 'native', timing: 1, accent: 0.5, topVoice: 'typical', cutoff: 0.76, straight12: true, region: 'All', viewMode: 'region', rows: {} };
  const dom = {}; // rowId -> element refs
  const byId = Object.fromEntries(RX.RHYTHMS.map((r) => [r.id, r]));

  // Some multi-instrument data has a top pattern longer or shorter than the row; fit it to the step count.
  const fit = (p, n) => (p || '').slice(0, n).padEnd(n, '.');
  const defaults = (r) => {
    const base = { kick: r.kick, top: fit(r.top, r.steps), groove: r.groove, four: false, muteKick: false, muteTop: false, openKick: false, openTop: false, topVoice: 'typical' };
    if (r.topLines && r.topLines.length) {
      r.topLines.forEach((_, idx) => { base['muteTop' + idx] = false; });
    }
    return base;
  };
  function load() {
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(STORE)); } catch (e) {}
    if (saved) ['bpm', 'tempoMode', 'timing', 'accent', 'topVoice', 'cutoff', 'viewMode'].forEach((k) => { if (saved[k] != null) state[k] = saved[k]; });
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
  const patternOf = (r, lane) => {
    if (lane === 'kick') return state.rows[r.id].four ? FOUR[r.steps] : state.rows[r.id].kick;
    if (lane !== 'top' && lane.startsWith('top') && r.topLines) {
      const idx = parseInt(lane.replace('top', ''), 10);
      return state.rows[r.id]['top' + idx] || r.topLines[idx]?.pattern || '';
    }
    return state.rows[r.id].top;
  };
  const voiceOf = (r) => {
    const rowVoice = state.rows[r.id]?.topVoice;
    if (rowVoice && rowVoice !== 'typical') return rowVoice;
    return state.topVoice === 'typical' ? r.sound : state.topVoice;
  };
  const bpmOf = (r) => (state.tempoMode === 'native' ? r.bpm : state.bpm);
  const cap = (lane) => (lane === 'kick' ? 'Kick' : lane.charAt(0).toUpperCase() + lane.slice(1));
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
    const lanes = [{ pattern: s.muteKick ? off : patternOf(r, 'kick'), voice: 'kick' }];

    // Multi-instrument rows: "Typical" plays the full ensemble; any chosen top
    // sound (global or per-row) collapses the row to a simple kick + top combo.
    if (r.topLines && r.topLines.length) {
      const chosen = (s.topVoice && s.topVoice !== 'typical') ? s.topVoice : (state.topVoice !== 'typical' ? state.topVoice : null);
      if (chosen) {
        lanes.push({ pattern: s.muteTop ? off : (s.top || fit(r.top, r.steps)), voice: chosen });
      } else {
        r.topLines.forEach((tl, idx) => {
          const muted = s['muteTop' + idx] || false;
          lanes.push({ pattern: muted ? off : tl.pattern, voice: s['topVoice' + idx] || tl.sound });
        });
      }
    } else {
      lanes.push({ pattern: s.muteTop ? off : s.top, voice: voiceOf(r) });
    }

    return { bpm: bpmOf(r), steps: r.steps, groove: RX.GROOVE_BY_ID[s.groove], timing: state.timing, accent: state.accent, lanes };
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
    if (!d || !d[lane + 'Grid']) return; // multi-instrument rows have top0..topN, no plain top lane
    const pattern = patternOf(r, lane), shown = shownSteps(r, lane), muted = s['mute' + L];
    d[lane + 'Grid'].className = 'steps steps-' + shown + (lane === 'kick' && s.four ? ' lane-locked' : '');
    d[lane + 'Grid'].style.setProperty('--cols', shown);
    d[lane + 'Grid'].style.setProperty('--cols-m', shown > 12 ? Math.ceil(shown / 2) : shown);
    d[lane + 'Steps'].forEach((b, i) => {
      const ch = pattern[i];
      b.hidden = i >= shown;
      b.className = 'step' + (i % (r.steps / 4) === 0 ? ' step-beat' : '') +
        (ch === 'X' ? ' step-accent' : ch === 'x' ? ' step-hit' : ch === 'o' ? ' step-ghost' : '');
    });
    d[lane + 'Wrap'].classList.toggle('lane-muted', muted);
    d[lane + 'Mute'].setAttribute('aria-pressed', String(!muted));
    d[lane + 'MuteIcon'].textContent = muted ? 'volume_off' : 'volume_up';
    // Find label for this lane
    let label = lane === 'kick' ? 'Kick' : 'Top';
    if (lane !== 'top' && lane.startsWith('top') && r.topLines) {
      const idx = parseInt(lane.replace('top', ''), 10);
      if (r.topLines[idx]) label = r.topLines[idx].name;
    } else if (lane === 'top') {
      label = VOICE_LABEL[voiceOf(r)];
    }
    d[lane + 'MuteLabel'].textContent = label;
    d[lane + 'Fold'].hidden = !foldable(pattern);
    d[lane + 'FoldIcon'].textContent = shown < pattern.length ? 'unfold_more' : 'unfold_less';
    if (lane === 'kick' && d.fourBtns) d.fourBtns.forEach((b) => b.classList.toggle('active', (b.dataset.four === '1') === s.four));
  }
  // Multi-instrument rows collapse to kick+top when a top sound is chosen.
  const collapsed = (r) => {
    const s = state.rows[r.id];
    return !!(r.topLines && r.topLines.length && ((s.topVoice && s.topVoice !== 'typical') || state.topVoice !== 'typical'));
  };
  const paintRow = (r) => {
    const col = collapsed(r);
    paintLane(r, 'kick');
    if (r.topLines && r.topLines.length) {
      r.topLines.forEach((_, idx) => {
        paintLane(r, 'top' + idx);
        dom[r.id]['top' + idx + 'Wrap']?.classList.toggle('lane-collapsed', col);
      });
      paintLane(r, 'top');
      dom[r.id].topWrap?.classList.toggle('lane-collapsed', !col);
    } else { paintLane(r, 'top'); }
  };

  function buildLane(r, lane, topLine) {
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
    const voiceForExport = topLine ? topLine.sound : (lane === 'kick' ? 'kick' : voiceOf(r));
    dl.addEventListener('click', () => {
      const s = state.rows[r.id];
      RX.exportMidi({ rhythmName: r.name, partName: voiceForExport, steps: r.steps, bpm: bpmOf(r), pattern: patternOf(r, lane), voice: voiceForExport,
        groove: RX.GROOVE_BY_ID[s.groove], timing: state.timing, accent: state.accent });
    });
    head.appendChild(dl);

    const grid = d[lane + 'Grid'] = el('div', 'steps');
    d[lane + 'Steps'] = Array.from({ length: r.steps }, (_, i) => {
      const b = el('button'); b.setAttribute('aria-label', (lane === 'kick' ? 'Kick' : 'Top') + ' step ' + (i + 1));
      b.addEventListener('click', () => {
        const s = state.rows[r.id];
        if (lane === 'kick' && s.four) return;
        const cur = patternOf(r, lane), half = r.steps / 2, folded = shownSteps(r, lane) < r.steps;
        // One tap turns a step on or off; turning it back on restores the rhythm's own accent level.
        const next = cur[i] !== '.' ? '.' : (topLine ? topLine.pattern[i] : (r[lane][i] !== '.' ? r[lane][i] : 'x'));
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

    const bpm = el('button', 'bpm-chip'); bpm.title = 'Tap to adjust tempo';
    bpm.appendChild(icon('speed')); bpm.appendChild(el('span', 'bpm-chip-value', r.bpm + ' bpm')); bpm.appendChild(el('span', 'bpm-chip-range', r.range));
    const sliderWrap = el('div', 'bpm-slider-wrap'); sliderWrap.hidden = true;
    const slider = el('input', 'bpm-inline-slider');
    slider.type = 'range'; slider.min = '60'; slider.max = '300'; slider.step = '1'; slider.value = r.bpm;
    sliderWrap.appendChild(slider);
    head.appendChild(bpm);
    head.appendChild(sliderWrap);

    let sliderActive = false;
    bpm.addEventListener('click', (e) => {
      e.stopPropagation();
      sliderWrap.hidden = false;
      slider.focus();
      sliderActive = true;
    });
    slider.addEventListener('input', (e) => {
      const v = +e.target.value;
      state.bpm = v; state.tempoMode = 'set';
      bpm.querySelector('.bpm-chip-value').textContent = v + ' bpm';
      paintTempo(); save();
    });
    slider.addEventListener('change', () => {
      sliderWrap.hidden = true;
      sliderActive = false;
    });
    slider.addEventListener('blur', () => {
      if (!sliderActive) sliderWrap.hidden = true;
    });
    document.addEventListener('click', (e) => {
      if (!bpm.contains(e.target) && !sliderWrap.contains(e.target)) sliderWrap.hidden = true;
    });

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

    const noteText = (r.etymology ? '<strong>Etymology:</strong> ' + r.etymology + '<br><br>' : '') + r.note;
    const note = el('p', 'row-note', ''); note.hidden = true; note.innerHTML = noteText;
    info.addEventListener('click', () => { note.hidden = !note.hidden; info.classList.toggle('active', !note.hidden); });
    reset.addEventListener('click', () => { state.rows[r.id] = defaults(r); sel.value = r.groove; paintRow(r); save(); });
    root.appendChild(note);

    // Per-row settings panel (initially hidden)
    const settingsPanel = d.settingsPanel = el('div', 'row-settings', '');
    settingsPanel.hidden = true;
    const settingsGrid = el('div', 'settings-grid');
    // Top voice selector for this pattern (only for single-lane rhythms —
    // multi-instrument rhythms get one selector per topLine below instead).
    if (!(r.topLines && r.topLines.length)) {
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
    }

    // Add voice selectors for additional top lines (multi-instrument patterns)
    if (r.topLines && r.topLines.length) {
      r.topLines.forEach((tl, idx) => {
        const tlVoiceSelect = el('select', 'field-select');
        tlVoiceSelect.setAttribute('aria-label', tl.name + ' sound for ' + r.name);
        // Extended voice list for multi-instrument patterns
        const EXTENDED_VOICES = [
          ['typical', 'Typical'], ['snare', 'Snare'], ['tom', 'Tom'], ['bass', 'Bass'],
          ['dunun', 'Dunun'], ['guembri', 'Guembri'], ['mbira', 'Mbira'],
          ['pluck', 'Pluck'], ['bow', 'Bow'], ['wind', 'Wind'],
          ['voice', 'Voice'], ['shaker', 'Shaker'], ['metal', 'Metal'], ['clap', 'Clap']
        ];
        EXTENDED_VOICES.forEach(([v, label]) => {
          const o = el('option', null, label); o.value = v; tlVoiceSelect.appendChild(o);
        });
        tlVoiceSelect.value = state.rows[r.id]['topVoice' + idx] || tl.sound;
        tlVoiceSelect.addEventListener('change', () => {
          state.rows[r.id]['topVoice' + idx] = tlVoiceSelect.value;
          paintLane(r, 'top' + idx);
          save();
        });
        const tlVoiceLabel = el('label', 'setting-label', tl.name);
        tlVoiceLabel.appendChild(tlVoiceSelect);
        settingsGrid.appendChild(tlVoiceLabel);
      });
    }

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
    if (r.topLines && r.topLines.length) {
      r.topLines.forEach((tl, idx) => lanes.appendChild(buildLane(r, 'top' + idx, tl)));
      // Combined top lane, shown in place of the ensemble when a top sound is chosen.
      lanes.appendChild(buildLane(r, 'top'));
    } else {
      lanes.appendChild(buildLane(r, 'top'));
    }
    root.appendChild(lanes);
    paintRow(r);
    return root;
  }

  // ── Transport ──
  let nowRow = null;
  let pendingSwitchTarget = null; // rowId that is queued to play next
  function clearPlayhead() {
    if (nowRow && dom[nowRow]) {
      ['kickSteps', 'topSteps'].forEach((k) => dom[nowRow][k]?.forEach((b) => b.classList.remove('step-now')));
      // Also clear any additional topN steps
      Object.keys(dom[nowRow]).forEach((k) => {
        if (k.startsWith('top') && k.endsWith('Steps')) {
          dom[nowRow][k]?.forEach((b) => b.classList.remove('step-now'));
        }
      });
    }
    nowRow = null;
  }
  function onStep(id, i) {
    clearPlayhead();
    nowRow = id;
    const r = byId[id];
    // Highlight kick
    const kickSteps = dom[id].kickSteps;
    if (kickSteps) kickSteps[i % shownSteps(r, 'kick')]?.classList.add('step-now');
    // Highlight all top lanes
    ['top'].concat(r.topLines ? r.topLines.map((_, idx) => 'top' + idx) : []).forEach((lane) => {
      const steps = dom[id][lane + 'Steps'];
      if (steps) steps[i % shownSteps(r, lane)]?.classList.add('step-now');
    });
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
    if (state.viewMode === 'region') applyView();
  }

  // ── Views ──
  // Region view: one vertical list, filtered by the region tabs.
  // Family view: the same rows, moved into one swipeable track per family.
  const familyOf = (r) => r.family || 'other';
  const familyOrder = () => {
    const present = new Set(RX.RHYTHMS.map(familyOf));
    return FAMILY_ORDER.filter((f) => present.has(f)).concat([...present].filter((f) => !FAMILY_ORDER.includes(f)));
  };
  const familyDom = {}; // famId -> { section, track, counter, ids, index }

  function applyView() {
    const rows = $('rows');
    const family = state.viewMode === 'family';
    rows.classList.toggle('rows-family', family);
    $('region-tabs').hidden = family;
    $('family-tabs').hidden = !family;
    if (!family) {
      Object.keys(familyDom).forEach((k) => { familyDom[k].ro?.disconnect(); delete familyDom[k]; });
      rows.replaceChildren(...RX.RHYTHMS.map((r) => dom[r.id].root));
      RX.RHYTHMS.forEach((r) => { dom[r.id].root.hidden = state.region !== 'All' && r.region !== state.region; });
      return;
    }
    const sections = familyOrder().map((famId) => {
      const ids = RX.RHYTHMS.filter((r) => familyOf(r) === famId).map((r) => r.id);
      const section = el('section', 'family-section'); section.id = 'family-' + famId;
      const head = el('div', 'family-header');
      head.appendChild(el('h2', 'family-title', FAMILY_LABEL[famId] || famId));
      const counter = el('span', 'family-counter', '1 / ' + ids.length);
      head.appendChild(counter);
      const prev = iconBtn('chevron_left', 'Previous rhythm', 'family-nav');
      const next = iconBtn('chevron_right', 'Next rhythm', 'family-nav');
      head.appendChild(prev); head.appendChild(next);
      const track = el('div', 'family-track');
      ids.forEach((id) => { dom[id].root.hidden = false; track.appendChild(dom[id].root); });
      section.appendChild(head); section.appendChild(track);
      const f = familyDom[famId] = { section, track, counter, ids, index: 0, prev, next };
      const step = (dir) => track.scrollTo({ left: (f.index + dir) * pageWidth(track), behavior: 'smooth' });
      prev.addEventListener('click', () => step(-1));
      next.addEventListener('click', () => step(1));
      let settle = null;
      track.addEventListener('scroll', () => { clearTimeout(settle); settle = setTimeout(() => onSwiped(famId), 120); }, { passive: true });
      if (window.ResizeObserver) { f.ro = new ResizeObserver(() => paintFamilyNav(f)); f.ro.observe(dom[ids[0]].root); }
      paintFamilyNav(f);
      return section;
    });
    rows.replaceChildren(...sections);
  }

  const pageWidth = (track) => track.clientWidth + parseFloat(getComputedStyle(track).columnGap || 0);
  function paintFamilyNav(f) {
    // The track follows the height of the rhythm in view, so short rows leave no gap.
    const shown = dom[f.ids[f.index]]?.root;
    if (shown) f.track.style.height = shown.offsetHeight + 'px';
    f.counter.textContent = (f.index + 1) + ' / ' + f.ids.length;
    f.prev.disabled = f.index === 0;
    f.next.disabled = f.index === f.ids.length - 1;
    f.prev.hidden = f.next.hidden = f.ids.length < 2;
  }

  // A swipe selects the rhythm that is now in view. If something is playing,
  // the new rhythm is queued and takes over at the end of the current bar.
  function onSwiped(famId) {
    const f = familyDom[famId];
    if (!f) return;
    const index = Math.max(0, Math.min(f.ids.length - 1, Math.round(f.track.scrollLeft / pageWidth(f.track))));
    if (index === f.index) return;
    f.index = index;
    if (window.ResizeObserver) { f.ro?.disconnect(); f.ro = new ResizeObserver(() => paintFamilyNav(f)); f.ro.observe(dom[f.ids[index]].root); }
    paintFamilyNav(f);
    const id = f.ids[index], cur = RX.audio.playing();
    if (cur && cur !== id && pendingSwitchTarget !== id) togglePlay(id);
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
    // Family jump tabs (family view): tap to scroll that family into view.
    const famTabs = el('div', 'm3-pill-tabs region-tabs'); famTabs.id = 'family-tabs'; famTabs.hidden = true;
    familyOrder().forEach((famId) => {
      const b = el('button', 'm3-pill-tab', FAMILY_LABEL[famId] || famId);
      b.addEventListener('click', () => {
        famTabs.querySelectorAll('.m3-pill-tab').forEach((x) => x.classList.toggle('active', x === b));
        $('family-' + famId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      famTabs.appendChild(b);
    });
    tabs.parentNode.insertBefore(famTabs, tabs.nextSibling);
    RX.RHYTHMS.forEach((r) => rows.appendChild(buildRow(r, RX.REGIONS.indexOf(r.region))));
    setRegion('All');
    segmented('view-mode', [['region', 'By region'], ['family', 'By family']], 'viewMode', 'view', applyView);
    applyView();

    segmented('tempo-mode', [['native', 'Native'], ['set', 'Set bpm']], 'tempoMode', 'mode', paintTempo);
    segmented('top-voice', TOP_VOICES, 'topVoice', 'voice', () => {
      RX.RHYTHMS.forEach((r) => paintRow(r));
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
