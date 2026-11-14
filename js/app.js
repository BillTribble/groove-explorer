// UI: stacked rhythm rows, one playing at a time. All controls update local state first.
(function () {
  const $ = (id) => document.getElementById(id);
  const STORE = 'rx-state-v2';
  // Four kicks per bar for any step count: beats at the steps nearest each quarter of the bar
  // (16 -> 0,4,8,12; 12 -> 0,3,6,9; 7 -> 0,2,4,5).
  const fourFor = (n) => {
    const hits = new Set([0, 1, 2, 3].map((k) => Math.round((k * n) / 4) % n));
    return Array.from({ length: n }, (_, i) => (hits.has(i) ? 'x' : '.')).join('');
  };
  const REGION_CLASS = ['badge-fuchsia', 'badge-orange', 'badge-indigo', 'badge-teal', 'badge-lime', 'badge-rose', 'badge-cyan', 'badge-violet', 'badge-yellow'];
  const VOICE_LABEL = { snare: 'Snare', tom: 'Tom', bass: 'Bass' };
  const TOP_VOICES = [['typical', 'Typical'], ['snare', 'Snare'], ['tom', 'Tom'], ['bass', 'Bass']];

  // The grouped view groups rhythms by the kind of pattern they are: js/pattern-groups.js
  // (RX.PATTERN_GROUPS: [id, label, member ids], clustered by py/rhythm_ml.py). Without that
  // file it falls back to the hand-made lineage families in js/families.js.
  const GROUPS = RX.PATTERN_GROUPS || RX.FAMILIES;
  const GROUP_OF = {};
  GROUPS.forEach(([g, , ids]) => ids.forEach((id) => { GROUP_OF[id] = g; }));
  const FAMILY_LABEL = Object.assign({ other: 'Not grouped yet' }, Object.fromEntries(GROUPS.map(([id, label]) => [id, label])));
  const FAMILY_ORDER = GROUPS.map(([id]) => id);

  // tempoMode: 'native' plays each rhythm at its home tempo, 'set' uses state.bpm.
  // viewMode: 'family' (default) or 'region'
  // view: 'list' (rows) or 'map' (node map, js/nodemap.js).
  // mapLayout: 'pattern' (by similarity) or 'world' (centres of origin) inside the map view.
  const state = { view: 'list', mapLayout: 'pattern', bpm: 120, tempoMode: 'native', timing: 1, accent: 0.5, topVoice: 'typical', kit: 'samples', cutoff: 0.76, straight12: true, region: 'All', viewMode: 'family', familyDefault: true, samplesDefault: true, groovesV2: true, coreTop: true, pulseParts: 'off', rows: {} };
  const dom = {}; // rowId -> element refs
  const byId = Object.fromEntries(RX.RHYTHMS.map((r) => [r.id, r]));

  // Some multi-instrument data has a top pattern longer or shorter than the row; fit it to the step count.
  const fit = (p, n) => (p || '').slice(0, n).padEnd(n, '.');
  // Multi-instrument rows: the single top line of the simple version is the rhythm's core line
  // (the part or skeleton that best shows its structure, see js/shape.js), not just the lead part.
  const multi = (r) => !!(r.topLines && r.topLines.length);
  const simpleTop = (r) => (multi(r) ? RX.coreTop(r).pattern : fit(r.top, r.steps)); // may be a free-looping part, shorter than the row
  const defaults = (r) => {
    const base = { kick: r.kick, top: simpleTop(r), groove: r.groove, four: false, muteKick: false, muteTop: false, openKick: false, openTop: false, topVoice: 'typical' };
    if (r.topLines && r.topLines.length) {
      r.topLines.forEach((_, idx) => { base['muteTop' + idx] = false; });
    }
    return base;
  };
  function load() {
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(STORE)); } catch (e) {}
    if (saved) ['view', 'mapLayout', 'bpm', 'tempoMode', 'timing', 'accent', 'topVoice', 'cutoff', 'viewMode', 'kit', 'pulseParts'].forEach((k) => { if (saved[k] != null) state[k] = saved[k]; });
    // By family became the default view; saves from before that start there once.
    if (saved && !saved.familyDefault) state.viewMode = 'family';
    // Recorded samples became the default kit; saves from before that switch to it once.
    if (saved && !saved.samplesDefault) state.kit = 'samples';
    RX.RHYTHMS.forEach((r) => {
      const s = saved && saved.rows && saved.rows[r.id];
      const ok = s && s.kick && s.kick.length === r.steps && s.top && s.top.length === simpleTop(r).length && RX.GROOVE_BY_ID[s.groove];
      state.rows[r.id] = ok ? Object.assign(defaults(r), s) : defaults(r);
      // 12/8 rows used to default to the Polak groove, which bent the triplet grid; move saved rows to straight once.
      if (r.steps === 12 && !(saved && saved.straight12) && state.rows[r.id].groove === 'rs:polak') state.rows[r.id].groove = 'straight';
      // The simple version now plays the core line; saved multi-instrument rows pick it up once.
      if (saved && !saved.coreTop && multi(r)) state.rows[r.id].top = simpleTop(r);
      // Grooves were re-researched for every rhythm; saved rows pick up the new default once.
      if (saved && !saved.groovesV2) state.rows[r.id].groove = r.groove;
    });
  }
  function save() { try { localStorage.setItem(STORE, JSON.stringify(state)); } catch (e) {} }

  // The 4/4 kick is its own four-step lane, one hit per beat, on its own clock: four steps per bar whatever the
  // row's step count, so it stays exact in odd meters, is never folded or cut to the row's width, and never
  // follows the cycle of the polyrhythmic parts.
  const FOUR = 'xxxx', FOUR_GRID = 4;
  const nativeFour = (r) => r.kick === fourFor(r.steps);
  const gridOf = (r, lane) => (lane === 'kick' && state.rows[r.id].four ? FOUR_GRID : r.steps);
  // Parts of an ensemble row that share a pattern (identical apart from the instrument) share one lane:
  // the first of them leads, edits and mutes go to the leader, every instrument still plays and keeps its own sound.
  const groupCache = {};
  const groupsOf = (r) => groupCache[r.id] || (groupCache[r.id] = (() => {
    const lines = r.topLines || [], leader = [], members = {};
    lines.forEach((tl, i) => {
      const L = lines.findIndex((o) => o.pattern === tl.pattern && !!o.loop === !!tl.loop);
      leader[i] = L; (members[L] = members[L] || []).push(i);
    });
    const leaders = Object.keys(members).map(Number).sort((a, b) => a - b);
    return { leader, members, number: Object.fromEntries(leaders.map((L, n) => [L, n + 1])), grouped: leaders.length < lines.length };
  })());
  const laneIdx = (lane) => (lane !== 'top' && lane.startsWith('top') ? parseInt(lane.replace('top', ''), 10) : null);
  const muteOf = (r, lane) => {
    const idx = r.topLines && laneIdx(lane);
    return !!state.rows[r.id]['mute' + cap(idx == null ? lane : 'top' + groupsOf(r).leader[idx])];
  };
  const patternOf = (r, lane) => {
    if (lane === 'kick') return state.rows[r.id].four ? FOUR : state.rows[r.id].kick;
    if (lane !== 'top' && lane.startsWith('top') && r.topLines) {
      const idx = groupsOf(r).leader[laneIdx(lane)];
      return state.rows[r.id]['top' + idx] || r.topLines[idx]?.pattern || '';
    }
    return state.rows[r.id].top;
  };
  // Pulse parts setting: with it off, a top part that is a steady stream of 8ths or 16ths is muted and hidden.
  const fillerOff = (r, lane) => state.pulseParts !== 'on' && lane !== 'kick' && RX.shape.isFiller(patternOf(r, lane), r.steps);
  const voiceOf = (r) => {
    const rowVoice = state.rows[r.id]?.topVoice;
    if (rowVoice && rowVoice !== 'typical') return rowVoice;
    return state.topVoice === 'typical' ? r.sound : state.topVoice;
  };
  const bpmOf = (r) => (state.tempoMode === 'native' ? r.bpm : state.bpm);
  const cap = (lane) => (lane === 'kick' ? 'Kick' : lane.charAt(0).toUpperCase() + lane.slice(1));
  // A lane whose two halves match is shown as one half unless the user opens it.
  const foldable = (p) => p.length % 2 === 0 && p.slice(0, p.length / 2) === p.slice(p.length / 2);
  const canFold = (r, lane, p) => !(lane === 'kick' && state.rows[r.id].four) && foldable(p); // the 4/4 lane is always shown whole
  const shownSteps = (r, lane) => {
    const p = patternOf(r, lane);
    return canFold(r, lane, p) && !state.rows[r.id]['open' + cap(lane)] ? p.length / 2 : p.length;
  };

  // Live state for the scheduler: read on every tick, so edits and tempo changes land immediately.
  function playState(id) {
    const r = byId[id];
    if (!r) return null;
    const s = state.rows[id];
    const off = '.'.repeat(r.steps);
    const lanes = [{ id: 'kick', pattern: s.muteKick ? off : patternOf(r, 'kick'), voice: 'kick', grid: s.four ? FOUR_GRID : undefined }];

    // Multi-instrument rows: "Typical" plays the full ensemble; any chosen top
    // sound (global or per-row) collapses the row to a simple kick + top combo.
    if (r.topLines && r.topLines.length) {
      const chosen = (s.topVoice && s.topVoice !== 'typical') ? s.topVoice : (state.topVoice !== 'typical' ? state.topVoice : null);
      if (chosen) {
        const p = s.muteTop ? off : (s.top || simpleTop(r));
        lanes.push({ id: 'top', pattern: p, voice: chosen });
      } else {
        r.topLines.forEach((tl, idx) => {
          const muted = muteOf(r, 'top' + idx);
          const voice = s['topVoice' + idx] || tl.sound;
          lanes.push({ id: 'top' + idx, label: tl.name, pattern: muted ? off : patternOf(r, 'top' + idx), voice, notes: RX.notesFor(tl), inst: s['topVoice' + idx] ? null : RX.instrumentFor(tl) });
        });
      }
    } else {
      lanes.push({ id: 'top', pattern: s.muteTop ? off : s.top, voice: voiceOf(r) });
    }

    lanes.forEach((l) => { if (fillerOff(r, l.id)) l.pattern = off; });
    const keep = (RX.SAMPLE_KIT && RX.SAMPLE_KIT.keepSynth && RX.SAMPLE_KIT.keepSynth[r.id]) || [];
    // Modern dance rows: drum-machine voices in place of the acoustic ones (RX.SAMPLE_KIT.machine).
    const machine = RX.SAMPLE_KIT && RX.SAMPLE_KIT.machine;
    if (machine && machine.rows.includes(r.id)) lanes.forEach((l) => { l.voice = machine.swap[l.voice] || l.voice; });
    lanes.forEach((l) => { l.synth = keep.includes(l.voice); });
    return { bpm: bpmOf(r), steps: r.steps, groove: RX.GROOVE_BY_ID[s.groove], timing: state.timing, accent: state.accent, lanes };

  }

  // Everything the Ableton project and the MIDI downloads need, per rhythm. Each part carries its
  // pattern with mutes applied and `fullPattern` ignoring them, so a part's MIDI note never depends on a mute.
  // Sound settings (voice, instrument, pitch, synth-only) come from playState, i.e. exactly what playback uses.
  function exportRows() {
    RX.audio.setKit(state.kit); // sound choice follows the Drum sounds setting even before the first tap
    return RX.RHYTHMS.map((r) => {
      const s = state.rows[r.id], p = playState(r.id), off = '.'.repeat(r.steps);
      const part = (lane, track, label, id) => {
        const full = patternOf(r, lane.id);
        return { id: id || lane.id, label, track, voice: lane.voice, notes: lane.notes, inst: lane.inst, synth: lane.synth,
          fullPattern: full, pattern: muteOf(r, lane.id) || fillerOff(r, lane.id) ? off : full, grid: lane.grid };
      };
      const kick = p.lanes[0], parts = [];
      const four = { id: 'kick4', label: 'kick 4x4', track: 0, voice: 'kick', synth: kick.synth, fullPattern: FOUR, pattern: FOUR, grid: FOUR_GRID };
      parts.push(four, part(kick, 1, 'kick'));
      p.lanes.slice(1).forEach((l) => parts.push(part(l, 2, l.label || l.voice)));
      return { id: r.id, name: r.name, bpm: r.bpm, steps: r.steps, groove: p.groove, timing: p.timing, accent: p.accent, parts };
    });
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
      b.className = 'step' + (i % (gridOf(r, lane) / 4) === 0 ? ' step-beat' : '') +
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
      // Identical parts share a lane; titled by pattern, with the instruments that play it.
      const G = groupsOf(r);
      if (G.grouped) {
        // Numbered among the lanes shown, so a hidden pulse part does not leave a gap.
        const n = Object.keys(G.number).map(Number).filter((L) => L <= idx && !fillerOff(r, 'top' + L)).length;
        label = 'Pattern ' + n + ' · ' + G.members[idx].map((m) => r.topLines[m].name).join(' + ');
        if (pattern === r.kick) label += ' = kick';
      }
      // A part that loops on its own length, not the row's.
      if (pattern.length !== r.steps) label += ' · loops every ' + pattern.length;
    } else if (lane === 'top') {
      label = VOICE_LABEL[voiceOf(r)];
      // In the simple version of an ensemble row, say which part or skeleton the line is.
      const core = multi(r) ? RX.coreTop(r) : null;
      if (core && core.name && s.top === core.pattern) label += ' · ' + core.name;
      if (pattern.length !== r.steps) label += ' · loops every ' + pattern.length;
    }
    d[lane + 'MuteLabel'].textContent = label;
    d[lane + 'Fold'].hidden = !canFold(r, lane, pattern);
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
        dom[r.id]['top' + idx + 'Wrap']?.classList.toggle('lane-collapsed', col || fillerOff(r, 'top' + idx));
      });
      paintLane(r, 'top');
      dom[r.id].topWrap?.classList.toggle('lane-collapsed', !col || fillerOff(r, 'top'));
    } else { paintLane(r, 'top'); dom[r.id].topWrap?.classList.toggle('lane-collapsed', fillerOff(r, 'top')); }
  };

  function buildLane(r, lane, topLine) {
    const d = dom[r.id], L = cap(lane);
    const wrap = d[lane + 'Wrap'] = el('div', 'lane');
    const head = el('div', 'lane-head');

    const mute = d[lane + 'Mute'] = el('button', 'lane-toggle'); mute.title = 'Turn this part on or off';
    mute.appendChild(d[lane + 'MuteIcon'] = icon('volume_up'));
    mute.appendChild(d[lane + 'MuteLabel'] = el('span', 'lane-toggle-label', ''));
    mute.addEventListener('click', () => toggleMute(r, lane));
    head.appendChild(mute);

    if (lane === 'kick' && !nativeFour(r)) {
      const seg = el('div', 'm3-pill-tabs gm3-connected-dsp');
      d.fourBtns = [['0', 'Pattern'], ['1', '4/4']].map(([v, label]) => {
        const b = el('button', 'm3-pill-tab', label); b.dataset.four = v;
        b.title = v === '1' ? 'Four steady beats on their own clock, independent of the rhythm\'s polyrhythms' : 'The rhythm\'s own kick pattern';
        b.addEventListener('click', () => { state.rows[r.id].four = v === '1'; paintLane(r, 'kick'); save(); });
        seg.appendChild(b); return b;
      });
      head.appendChild(seg);
    }

    const fold = d[lane + 'Fold'] = iconBtn('unfold_more', 'Show the whole bar or one half', 'lane-fold');
    d[lane + 'FoldIcon'] = fold.firstChild;
    fold.addEventListener('click', () => { const s = state.rows[r.id]; s['open' + L] = !s['open' + L]; paintLane(r, lane); save(); });
    head.appendChild(fold);

    const dl = iconBtn('download', 'Export this part as MIDI (notes match the Ableton project\'s Drum Rack)', 'lane-download');
    dl.addEventListener('click', () => {
      try { RX.exportMidi(exportRows(), r.id, lane, bpmOf(r)); } catch (e) { toast('MIDI export failed: ' + e.message); }
    });
    head.appendChild(dl);

    const grid = d[lane + 'Grid'] = el('div', 'steps');
    // A lane has as many steps as its own pattern: a free-looping part can be shorter than the row.
    const laneLen = patternOf(r, lane).length || r.steps;
    d[lane + 'Steps'] = Array.from({ length: laneLen }, (_, i) => {
      const b = el('button'); b.setAttribute('aria-label', (lane === 'kick' ? 'Kick' : 'Top') + ' step ' + (i + 1));
      b.addEventListener('click', () => toggleStep(r, lane, i, shownSteps(r, lane) < patternOf(r, lane).length));
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

    // Tapping a row's tempo switches the whole app to that exact tempo.
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
      // Parts that repeat an earlier part's pattern play on that part's lane instead of getting their own.
      r.topLines.forEach((tl, idx) => { if (groupsOf(r).leader[idx] === idx) lanes.appendChild(buildLane(r, 'top' + idx, tl)); });
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
  // i: step within the row's bar; abs: steps since play started, so a free-looping lane shows its own position.
  function onStep(id, i, abs, beats) {
    const at = abs == null ? i : abs;
    clearPlayhead();
    nowRow = id;
    const r = byId[id];
    // Highlight kick
    const kickSteps = dom[id].kickSteps;
    // The 4/4 kick has its own clock: its step is the sixteenth of the bar, not the row's step.
    const kAt = state.rows[id].four && beats != null ? Math.floor(beats * (FOUR_GRID / 4) + 1e-6) : at;
    if (kickSteps) kickSteps[kAt % shownSteps(r, 'kick')]?.classList.add('step-now');
    // Highlight all top lanes
    ['top'].concat(r.topLines ? r.topLines.map((_, idx) => 'top' + idx) : []).forEach((lane) => {
      const steps = dom[id][lane + 'Steps'];
      if (steps) steps[at % shownSteps(r, lane)]?.classList.add('step-now');
    });
    RX.nodeMap.step(id, abs, beats);
  }
  function paintTempo() {
    const cur = RX.audio.playing(), native = state.tempoMode === 'native';
    // The Native toggle sits beside the readout and already says "Native"; with nothing playing there is no tempo yet.
    $('bpm-value').textContent = native ? (cur ? byId[cur].bpm : '–') : state.bpm;
    $('bpm-unit').hidden = false;
    $('bpm-slider').value = native && cur ? byId[cur].bpm : state.bpm;
    const t = $('tempo-mode');
    t.querySelector('.toggle-label').textContent = native ? 'Native' : 'Set bpm';
    t.setAttribute('aria-pressed', String(!native));
    t.title = native ? 'Each rhythm plays at its own tempo. Tap to use one set tempo.' : 'One set tempo for every rhythm. Tap to use each rhythm\'s own tempo.';
  }

  // ── List or node map ──
  // The map shows the same rhythms placed by pattern similarity; it plays through togglePlay, so a tap while
  // something is playing switches at the next bar, exactly as in the list.
  // The parts of a rhythm for the map's picture: the kick, then each shown top lane (identical top parts already
  // share their leader's lane). Parts whose patterns are identical (and equally muted / locked) are then merged into
  // one lane, e.g. "Kick + Kenkeni": a tap on a note or on the name changes every part in it at once (`ids`).
  // Muted parts stay (dimmed) so they can be unmuted; hidden pulse parts are left out; the 4/4 kick is locked.
  function pictureLanes(id) {
    const merged = [];
    partLanes(id).forEach((l) => {
      const same = merged.find((m) => m.pattern === l.pattern && m.grid === l.grid && m.muted === l.muted && !!m.locked === !!l.locked);
      if (same) { same.label += ' + ' + l.label; same.ids.push(l.id); } else merged.push({ ...l, ids: [l.id] });
    });
    return merged;
  }
  function partLanes(id) {
    const r = byId[id], s = state.rows[id], out = [];
    out.push({ id: 'kick', label: s.four ? 'Kick (4/4)' : 'Kick', pattern: patternOf(r, 'kick'), grid: gridOf(r, 'kick'), locked: !!s.four, muted: muteOf(r, 'kick') });
    const shown = (lane) => !fillerOff(r, lane) && /[^.]/.test(patternOf(r, lane));
    if (multi(r) && !collapsed(r)) {
      const G = groupsOf(r);
      r.topLines.forEach((tl, idx) => {
        const lane = 'top' + idx;
        if (G.leader[idx] === idx && shown(lane)) out.push({ id: lane, label: G.members[idx].map((m) => r.topLines[m].name).join(' + '), pattern: patternOf(r, lane), grid: r.steps, muted: muteOf(r, lane) });
      });
    } else if (shown('top')) {
      out.push({ id: 'top', label: VOICE_LABEL[voiceOf(r)] || cap(voiceOf(r)), pattern: patternOf(r, 'top'), grid: r.steps, muted: muteOf(r, 'top') });
    }
    return out;
  }

  /** Mute or unmute one part (the list's mute buttons and the map panel's part names both land here). */
  function toggleMute(r, lane) {
    const s = state.rows[r.id], key = 'mute' + cap(lane);
    s[key] = !s[key];
    paintLane(r, lane); save();
  }

  // ── Keep context across list and map ──
  // The rhythm to keep in view: the one playing, else the one last shown in the map's panel.
  const focusId = () => RX.audio.playing() || RX.nodeMap.selected();

  /** Bring a rhythm's row into view in the list: its group's carousel turned to it, or the row itself. Jumps
   *  (no smooth scroll), then re-aligns for a few frames while late layout settles; stops if the user scrolls. */
  function scrollToRhythm(id) {
    const root = dom[id] && dom[id].root;
    if (!root) return;
    let anchor = root;
    if (state.viewMode === 'family') {
      const f = Object.values(familyDom).find((x) => x.ids.includes(id));
      if (!f) return;
      const index = f.ids.indexOf(id);
      f.track.scrollTo({ left: index * pageWidth(f.track), behavior: 'instant' });
      f.index = index; paintFamilyNav(f);
      anchor = f.section;
    } else if (root.hidden) setRegion('All'); // a region filter would hide it
    const barH = () => document.querySelector('.app-bar').getBoundingClientRect().height;
    const offset = () => anchor.getBoundingClientRect().top - barH() - 8;
    let stopped = false, steady = 0, frames = 0;
    const stop = () => { stopped = true; };
    ['wheel', 'touchstart', 'keydown'].forEach((t) => addEventListener(t, stop, { once: true, passive: true }));
    const align = () => {
      if (stopped || frames++ > 40) return;
      const off = offset();
      if (Math.abs(off) > 1) { window.scrollTo({ top: window.scrollY + off, behavior: 'instant' }); steady = 0; } else steady++;
      if (steady < 3) requestAnimationFrame(align);
    };
    align();
  }

  /**
   * One tap turns a step on or off, from the list or the map's picture. Turning it on gives the rhythm's own accent
   * level when it had a hit there, and a plain hit when it was a rest, so new hits can always be added. `mirrorFold`:
   * the list shows a repeating lane as one half, so its edit lands in both halves. The 4/4 kick is not editable.
   */
  function toggleStep(r, lane, i, mirrorFold) {
    const s = state.rows[r.id];
    if (lane === 'kick' && s.four) return;
    const idx = laneIdx(lane), topLine = idx != null && r.topLines ? r.topLines[idx] : null;
    const cur = patternOf(r, lane), half = cur.length / 2;
    const own = ((topLine ? topLine.pattern : r[lane]) || '')[i];
    const next = cur[i] !== '.' ? '.' : (own && own !== '.' ? own : 'x');
    const arr = cur.split('');
    arr[i] = next;
    if (mirrorFold) arr[i + half] = next;
    s[lane] = arr.join('');
    paintLane(r, lane); save();
  }
  // switched: true when the user flipped list / map (not at start-up); then the rhythm in hand stays in view.
  function applyMode(switched) {
    const map = state.view === 'map', keep = switched ? focusId() : null;
    document.body.classList.toggle('mode-map', map);
    const b = $('view-toggle');
    b.setAttribute('aria-pressed', String(map));
    b.title = map ? 'Map on: tap to go back to the list' : 'Show the rhythms as a map of similar patterns';
    if (map) { RX.nodeMap.show(); if (keep) RX.nodeMap.focus(keep); }
    else { RX.nodeMap.hide(); applyView(); if (keep) requestAnimationFrame(() => scrollToRhythm(keep)); }
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
    RX.nodeMap.paint();
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
  const familyOf = (r) => GROUP_OF[r.id] || (RX.PATTERN_GROUPS ? 'other' : r.family || 'other');
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
      // Order follows the group's member list (nearest its centre first); unlisted members go last.
      const listed = (GROUPS.find(([id]) => id === famId) || [, , []])[2];
      const rank = (id) => { const k = listed.indexOf(id); return k < 0 ? listed.length : k; };
      const ids = RX.RHYTHMS.filter((r) => familyOf(r) === famId).map((r) => r.id).sort((a, b) => rank(a) - rank(b));
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
    // Size every carousel now that its rows are in the page, so the page does not grow (and shift) a moment later.
    Object.values(familyDom).forEach(paintFamilyNav);
  }

  const pageWidth = (track) => track.clientWidth + parseFloat(getComputedStyle(track).columnGap || 0);
  function paintFamilyNav(f) {
    // The track follows the height of the rhythm in view, so short rows leave no gap.
    const shown = dom[f.ids[f.index]]?.root;
    if (shown) f.track.style.height = shown.offsetHeight + 'px';
    f.counter.textContent = (f.index + 1) + ' / ' + f.ids.length;
    f.counter.hidden = f.ids.length < 2;
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
    // Drum sounds: synth voices or recorded samples. The AudioContext needs a tap first,
    // so a saved 'samples' choice loads on the first play instead of at startup.
    segmented('kit', [['synth', 'Synth'], ['samples', 'Samples']], 'kit', 'kit', () => {
      RX.audio.setKit(state.kit).then(() => { if (state.kit === 'samples' && !RX.audio.playing()) RX.audio.hit('darbuka'); });
    });
    document.addEventListener('pointerdown', () => { if (state.kit === 'samples') RX.audio.setKit('samples'); }, { once: true });
    segmented('view-mode', [['region', 'By region'], ['family', 'By pattern']], 'viewMode', 'view', applyView);
    // Steady 8th / 16th parts (shakers, ride bells, strummed pulses): off mutes and hides them.
    segmented('pulse-parts', [['off', 'Off'], ['on', 'On']], 'pulseParts', 'pulse', () => RX.RHYTHMS.forEach(paintRow));
    applyView();

    // One toggle for the tempo mode, one for list / map.
    $('tempo-mode').addEventListener('click', () => { state.tempoMode = state.tempoMode === 'native' ? 'set' : 'native'; paintTempo(); save(); });
    RX.nodeMap.init({
      ids: () => RX.RHYTHMS.map((r) => r.id), name: (id) => byId[id].name, region: (id) => byId[id].region, bpm: (id) => bpmOf(byId[id]),
      lanes: pictureLanes, onTap: togglePlay, playing: () => RX.audio.playing(),
      // A merged picture lane passes all its parts, so one tap changes them together.
      toggleStep: (id, lanes, i) => [].concat(lanes).forEach((l) => toggleStep(byId[id], l, i, false)),
      toggleMute: (id, lanes) => [].concat(lanes).forEach((l) => toggleMute(byId[id], l)),
      layout: () => state.mapLayout, setLayout: (l) => { if (state.mapLayout !== l) { state.mapLayout = l; save(); } },
      pending: () => { const s = RX.audio.getSchedulerState && RX.audio.getSchedulerState(); return s && s.pendingSwitch ? s.pendingSwitch.rowId : null; },
    });
    const bar = document.querySelector('.app-bar');
    const barH = () => document.documentElement.style.setProperty('--bar-h', bar.getBoundingClientRect().height + 'px');
    if (window.ResizeObserver) new ResizeObserver(() => requestAnimationFrame(barH)).observe(bar); barH();
    $('view-toggle').addEventListener('click', () => { state.view = state.view === 'map' ? 'list' : 'map'; applyMode(true); save(); });
    applyMode();
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

    // Top-bar tempo: tap the readout to open the fader.
    const tempoBtn = $('tempo-btn'), tempoPop = $('tempo-pop');
    const setTempoPop = (open) => {
      tempoPop.hidden = !open;
      tempoBtn.setAttribute('aria-expanded', String(open));
      tempoBtn.classList.toggle('active', open);
    };
    tempoBtn.addEventListener('click', () => setTempoPop(tempoPop.hidden));
    document.addEventListener('click', (e) => {
      if (!tempoPop.hidden && !tempoPop.contains(e.target) && !tempoBtn.contains(e.target)) setTempoPop(false);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !tempoPop.hidden) { setTempoPop(false); e.stopImmediatePropagation(); }
    }, true);
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
      toast('Building the Ableton project…');
      RX.exportAls(exportRows(), state.bpm)
        .then((r) => toast('Downloaded: ' + r.pads + ' sounds in a Drum Rack, ' + r.samples + ' sample files'))
        .catch((e) => toast('Export failed: ' + e.message));
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
