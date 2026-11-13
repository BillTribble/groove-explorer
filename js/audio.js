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
    snare(t, v) { noise(topBus, t, 0.16, 0.55 * v, 1400); tone(topBus, t, 240, 170, 0.05, 0.11, 0.35 * v, 'triangle'); },
    tom(t, v) { tone(topBus, t, 165, 92, 0.16, 0.42, 0.8 * v); },
    // Low percussive bass in the log-drum family: fast pitch drop, short body.
    bass(t, v) { tone(topBus, t, 190, 55, 0.045, 0.3, 0.9 * v); tone(topBus, t, 110, 55, 0.03, 0.22, 0.25 * v, 'triangle'); },

    // Dunun (West African bass drums: kenkeni, sangban, dununba)
    dunun(t, v) { tone(topBus, t, 110, 65, 0.08, 0.25, 0.85 * v); noise(topBus, t, 0.02, 0.1 * v, 800); },

    // Guembri / Sintir (Gnawa 3-string bass lute)
    guembri(t, v) { tone(topBus, t, 80, 40, 0.06, 0.35, 0.7 * v); tone(topBus, t, 160, 80, 0.04, 0.15, 0.2 * v, 'triangle'); },

    // Mbira / Kalimba (thumb piano)
    mbira(t, v) { tone(topBus, t, 800, 600, 0.03, 0.18, 0.6 * v); tone(topBus, t, 1200, 800, 0.02, 0.08, 0.15 * v, 'sine'); },

    // Plucked string (krar, oud, guitar, kora)
    pluck(t, v) { tone(topBus, t, 300, 150, 0.04, 0.2, 0.5 * v); tone(topBus, t, 600, 300, 0.02, 0.08, 0.1 * v, 'triangle'); },

    // Bowed string (masinko, goje, violin, rebab)
    bow(t, v) { tone(topBus, t, 200, 180, 0.12, 0.4, 0.55 * v); tone(topBus, t, 400, 350, 0.08, 0.15, 0.15 * v, 'sawtooth'); },

    // Wind (washint, flute, mizmar)
    wind(t, v) { tone(topBus, t, 400, 350, 0.08, 0.35, 0.5 * v); noise(topBus, t, 0.08, 0.08 * v, 2000); },

    // Voice (vocal)
    voice(t, v) { tone(topBus, t, 220, 180, 0.1, 0.3, 0.6 * v); tone(topBus, t, 440, 350, 0.06, 0.12, 0.15 * v, 'triangle'); },

    // Shaker / Hosho / Cherewa
    shaker(t, v) { noise(topBus, t, 0.05, 0.3 * v, 4000); },

    // Metal (qraqeb, gankogui, bell, krakeb)
    metal(t, v) { tone(topBus, t, 2000, 1500, 0.02, 0.06, 0.7 * v); tone(topBus, t, 4000, 3000, 0.015, 0.03, 0.2 * v); },

    // Handclaps
    clap(t, v) { noise(topBus, t, 0.03, 0.5 * v, 2000); tone(topBus, t, 300, 200, 0.02, 0.04, 0.1 * v); },
  };

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
        VOICES[lane.voice](t, lv * g.gain);
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
    setTopCutoff(hz) { topCutoff = hz; if (topBus) topBus.frequency.setTargetAtTime(hz, ctx.currentTime, 0.02); }, hit(voice) { ensure(); VOICES[voice](ctx.currentTime + 0.01, 0.8); } };
})();
