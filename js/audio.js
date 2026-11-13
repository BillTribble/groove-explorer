// Web Audio drum voices + look-ahead scheduler. One row plays at a time.
window.RX = window.RX || {};

(function () {
  let ctx = null, master = null, topBus = null, noiseBuf = null, topCutoff = 7000;

  function ensure() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return ctx; }
    // iOS 17+: play even when the ring/silent switch is on silent.
    try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) {}
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -10; comp.ratio.value = 4;
    master = ctx.createGain(); master.gain.value = 0.85;
    master.connect(comp); comp.connect(ctx.destination);
    // Top-line voices pass through a tunable low-pass; the kick goes straight to the master.
    topBus = ctx.createBiquadFilter(); topBus.type = 'lowpass'; topBus.Q.value = 0.5; topBus.frequency.value = topCutoff;
    topBus.connect(master);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return ctx;
  }

  function tone(out, t, f0, f1, sweep, decay, gain, type) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(f1, t + sweep);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.002);
    g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
    o.connect(g); g.connect(out);
    o.start(t); o.stop(t + decay + 0.02);
  }

  function noise(out, t, decay, gain, hp) {
    const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = noiseBuf; f.type = 'highpass'; f.frequency.value = hp;
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
    s.connect(f); f.connect(g); g.connect(out);
    s.start(t); s.stop(t + decay + 0.02);
  }

  const VOICES = {
    kick(t, v) { tone(master, t, 150, 46, 0.09, 0.32, 0.95 * v); noise(master, t, 0.012, 0.15 * v, 3000); },
    snare(t, v, r = 1) { noise(topBus, t, 0.16, 0.55 * v, 1400 * r); tone(topBus, t, 240 * r, 170 * r, 0.05, 0.11, 0.35 * v, 'triangle'); },
    tom(t, v, r = 1) { tone(topBus, t, 165 * r, 92 * r, 0.16, 0.42, 0.8 * v); },
    // Low percussive bass in the log-drum family: fast pitch drop, short body.
    bass(t, v, r = 1) { tone(topBus, t, 190 * r, 55 * r, 0.045, 0.3, 0.9 * v); tone(topBus, t, 110 * r, 55 * r, 0.03, 0.22, 0.25 * v, 'triangle'); },

    // Dunun (West African bass drums: kenkeni, sangban, dununba)
    dunun(t, v, r = 1) { tone(topBus, t, 110 * r, 65 * r, 0.08, 0.25, 0.85 * v); noise(topBus, t, 0.02, 0.1 * v, 800 * r); },

    // Guembri / Sintir (Gnawa 3-string bass lute)
    guembri(t, v, r = 1) { tone(topBus, t, 80 * r, 40 * r, 0.06, 0.35, 0.7 * v); tone(topBus, t, 160 * r, 80 * r, 0.04, 0.15, 0.2 * v, 'triangle'); },

    // Mbira / Kalimba (thumb piano)
    mbira(t, v, r = 1) { tone(topBus, t, 800 * r, 600 * r, 0.03, 0.18, 0.6 * v); tone(topBus, t, 1200 * r, 800 * r, 0.02, 0.08, 0.15 * v, 'sine'); },

    // Plucked string (krar, oud, guitar, kora)
    pluck(t, v, r = 1) { tone(topBus, t, 300 * r, 150 * r, 0.04, 0.2, 0.5 * v); tone(topBus, t, 600 * r, 300 * r, 0.02, 0.08, 0.1 * v, 'triangle'); },

    // Bowed string (masinko, goje, violin, rebab)
    bow(t, v, r = 1) { tone(topBus, t, 200 * r, 180 * r, 0.12, 0.4, 0.55 * v); tone(topBus, t, 400 * r, 350 * r, 0.08, 0.15, 0.15 * v, 'sawtooth'); },

    // Wind (washint, flute, mizmar)
    wind(t, v, r = 1) { tone(topBus, t, 400 * r, 350 * r, 0.08, 0.35, 0.5 * v); noise(topBus, t, 0.08, 0.08 * v, 2000); },

    // Voice (vocal)
    voice(t, v, r = 1) { tone(topBus, t, 220 * r, 180 * r, 0.1, 0.3, 0.6 * v); tone(topBus, t, 440 * r, 350 * r, 0.06, 0.12, 0.15 * v, 'triangle'); },

    // Shaker / Hosho / Cherewa
    shaker(t, v) { noise(topBus, t, 0.05, 0.3 * v, 4000); },

    // Metal (qraqeb, gankogui, bell, krakeb)
    metal(t, v) { tone(topBus, t, 2000, 1500, 0.02, 0.06, 0.7 * v); tone(topBus, t, 4000, 3000, 0.015, 0.03, 0.2 * v); },

    // Handclaps
    clap(t, v) { noise(topBus, t, 0.03, 0.5 * v, 2000); tone(topBus, t, 300, 200, 0.02, 0.04, 0.1 * v); },

    // Djembe (Mandé lead/accompaniment hand drum): bright open tone + slap.
    djembe(t, v) { tone(topBus, t, 260, 180, 0.04, 0.28, 0.75 * v, 'triangle'); noise(topBus, t, 0.03, 0.3 * v, 2200); tone(topBus, t, 90, 70, 0.05, 0.2, 0.3 * v); },

    // Conga / bongo (Afro-Cuban single-head drum): mid open tone.
    conga(t, v) { tone(topBus, t, 200, 150, 0.05, 0.3, 0.7 * v); noise(topBus, t, 0.02, 0.12 * v, 1800); },

    // Xylophone / marimba / gyil / balafon: woody pitched bar with overtone.
    xylophone(t, v, r = 1) { tone(topBus, t, 620 * r, 600 * r, 0.02, 0.22, 0.6 * v); tone(topBus, t, 1240 * r, 1200 * r, 0.01, 0.08, 0.15 * v, 'sine'); },
  };
  // Melodic names without a voice of their own.
  VOICES.guitar = VOICES.pluck; VOICES.oud = VOICES.pluck; VOICES.kora = VOICES.pluck; VOICES.piano = VOICES.pluck;
  VOICES.ghaita = VOICES.wind;

  // Rhythms name their native instruments (surdo, caixa, darbuka…) — an unknown
  // name must never crash the scheduler, so fall back to a generic drum.
  const voiceFor = (name) => VOICES[name] || VOICES.tom;

  // ── Sample kit ──
  // 'synth' plays the voices above; 'samples' plays recorded one-shots from RX.SAMPLE_KIT
  // where one exists, falling back to the synth voice until its buffer has loaded.
  let kit = 'synth';
  const buffers = {};   // file -> AudioBuffer
  const loading = {};   // file -> Promise
  const kitMap = () => (RX.SAMPLE_KIT && RX.SAMPLE_KIT.map) || {};
  const kitFiles = () => [...new Set(Object.values(kitMap()).flat())];

  function loadSample(file) {
    if (buffers[file] || loading[file]) return loading[file];
    const url = RX.SAMPLE_KIT.base + file + '.wav?v=' + (window.APP_BUILD || '');
    loading[file] = fetch(url)
      .then((r) => { if (!r.ok) throw new Error(r.status + ' ' + url); return r.arrayBuffer(); })
      .then((ab) => new Promise((res, rej) => ctx.decodeAudioData(ab, res, rej)))
      .then((buf) => { buffers[file] = buf; })
      .catch((e) => { console.warn('sample load failed', file, e); delete loading[file]; });
    return loading[file];
  }
  const loadKit = () => Promise.all(kitFiles().map(loadSample));

  function sampleFor(name, v) {
    const entry = kitMap()[name];
    if (!entry) return null;
    const file = Array.isArray(entry) ? entry[v > 0.9 ? 0 : v > 0.55 ? 1 : 2] : entry;
    return buffers[file] || null;
  }

  function playSample(buf, out, t, v, r = 1) {
    const s = ctx.createBufferSource(), g = ctx.createGain();
    s.buffer = buf; s.playbackRate.value = r; g.gain.value = Math.max(0.05, v);
    s.connect(g); g.connect(out); s.start(t);
  }

  // The kick bypasses the top-line filter, as its synth voice does.
  // r: pitch ratio for melodic parts (1 = the voice's own pitch).
  // synth: force the synth voice for this hit (per-rhythm exceptions in RX.SAMPLE_KIT.keepSynth).
  function playVoice(name, t, v, r = 1, synth = false) {
    const buf = kit === 'samples' && !synth ? sampleFor(name, v) : null;
    if (buf) playSample(buf, name === 'kick' ? master : topBus, t, v, r);
    else voiceFor(name)(t, v, r);
  }

  // ── Scheduler ──
  const LOOKAHEAD = 0.14;
  let timer = null, row = null, stepIndex = 0, nextTime = 0;
  let getState = null, onStep = null, onSwitch = null;
  let pendingSwitch = null; // { rowId, stateFn, stepFn, atStepIndex }

  function tick() {
    const st = getState(row);
    if (!st) { stop(); return; }
    const stepBeats = 4 / st.steps;
    while (nextTime < ctx.currentTime + LOOKAHEAD) {
      const spb = 60 / st.bpm;
      const i = stepIndex % st.steps;
      const pos = stepIndex * stepBeats;
      for (const lane of st.lanes) {
        const lv = RX.LEVEL[lane.pattern[i]];
        if (!lv) continue;
        const g = RX.applyGroove(st.groove, pos, st.timing, st.accent);
        const t = Math.max(ctx.currentTime, nextTime + g.offset * spb);
        playVoice(lane.voice, t, lv * g.gain, RX.pitchRatio ? RX.pitchRatio(lane, i) : 1, lane.synth);
      }
      if (onStep) {
        const id = row, delay = Math.max(0, (nextTime - ctx.currentTime) * 1000);
        setTimeout(() => { if (row === id) onStep(id, i); }, delay);
      }
      nextTime += stepBeats * spb;
      stepIndex++;

      // Check for pending pattern switch at bar boundary
      if (pendingSwitch && stepIndex % st.steps === 0) {
        const sw = pendingSwitch;
        pendingSwitch = null;
        row = sw.rowId;
        getState = sw.stateFn;
        onStep = sw.stepFn;
        if (onSwitch) onSwitch(row);
        // stepIndex continues from where it was (now at bar boundary)
        // nextTime is already correct for the next step
      }
    }
  }

  function play(rowId, stateFn, stepFn, switchFn) {
    ensure();
    stop();
    row = rowId; getState = stateFn; onStep = stepFn; onSwitch = switchFn;
    stepIndex = 0; nextTime = ctx.currentTime + 0.06;
    timer = setInterval(tick, 25);
    tick();
  }

  function scheduleSwitch(rowId, stateFn, stepFn, switchFn) {
    if (!row) { play(rowId, stateFn, stepFn, switchFn); return; }
    if (row === rowId) return;
    const st = getState(row);
    if (!st) { play(rowId, stateFn, stepFn, switchFn); return; }
    // Schedule at next bar boundary
    const stepsPerBar = st.steps;
    const stepsUntilBoundary = stepsPerBar - (stepIndex % stepsPerBar);
    pendingSwitch = { rowId, stateFn, stepFn, atStepIndex: stepIndex + stepsUntilBoundary };
    onSwitch = switchFn;
  }

  function stop() {
    if (timer) clearInterval(timer);
    timer = null; row = null; pendingSwitch = null; onSwitch = null;
  }

  // Expose scheduler state for UI feedback
  function getSchedulerState() {
    if (!row) return null;
    const st = getState(row);
    if (!st) return null;
    return { row, stepIndex, stepsPerBar: st.steps, bpm: st.bpm, pendingSwitch };
  }

  RX.audio = { play, stop, playing: () => row, scheduleSwitch, getSchedulerState,
    setTopCutoff(hz) { topCutoff = hz; if (topBus) topBus.frequency.setTargetAtTime(hz, ctx.currentTime, 0.02); },
    hit(voice) { ensure(); playVoice(voice, ctx.currentTime + 0.01, 0.8); },
    // kit: 'synth' | 'samples'. Switching to samples starts loading them (needs a user gesture first for the AudioContext).
    setKit(k) { kit = k; if (k === 'samples') { ensure(); return loadKit(); } return Promise.resolve(); },
    kitReady: () => kitFiles().every((f) => buffers[f]) };
})();
