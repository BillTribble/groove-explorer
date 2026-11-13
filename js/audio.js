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
  };

  // ── Scheduler ──
  const LOOKAHEAD = 0.14;
  let timer = null, row = null, stepIndex = 0, nextTime = 0;
  let getState = null, onStep = null;

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
    }
  }

  function play(rowId, stateFn, stepFn) {
    ensure();
    stop();
    row = rowId; getState = stateFn; onStep = stepFn;
    stepIndex = 0; nextTime = ctx.currentTime + 0.06;
    timer = setInterval(tick, 25);
    tick();
  }

  function stop() {
    if (timer) clearInterval(timer);
    timer = null; row = null;
  }

  RX.audio = { play, stop, playing: () => row,
    setTopCutoff(hz) { topCutoff = hz; if (topBus) topBus.frequency.setTargetAtTime(hz, ctx.currentTime, 0.02); }, hit(voice) { ensure(); VOICES[voice](ctx.currentTime + 0.01, 0.8); } };
})();
