// Groove library + application. A groove is { id, name, group, len (beats), notes: [[timeBeats, velocity]] }.
// Applying a groove works the way Live's groove pool does: each hit is pulled onto the
// nearest groove note (if one is close enough) and takes a share of its velocity.
window.RX = window.RX || {};

(function () {
  const grooves = [];
  const add = (g) => grooves.push(g);

  add({ id: 'straight', name: 'Straight', group: 'Basic', len: 1, notes: [] });

  // Plain swing: off-beat 16th sits at pct% of the 8th note (50 straight, 66 triplet).
  [52, 54, 57, 61, 66, 71].forEach((pct) => {
    const off = 0.5 * pct / 100;
    add({ id: 'sw16:' + pct, name: 'Swing 16ths ' + pct + '%', group: 'Basic',
      len: 1, notes: [[0, 127], [off, 127], [0.5, 127], [0.5 + off, 127]] });
  });
  [57, 66].forEach((pct) => {
    add({ id: 'sw8:' + pct, name: 'Swing 8ths ' + pct + '%', group: 'Basic',
      len: 1, notes: [[0, 127], [pct / 100, 127]] });
  });

  // Research-based feels (approximations of published timing data).
  add({ id: 'rs:polak', name: 'Jembe ternary 25:33:42 (Polak)', group: 'Research',
    len: 1, notes: [[0, 127], [0.25, 100], [0.58, 110]], window: 0.1 });
  add({ id: 'rs:samba', name: 'Samba suingue', group: 'Research',
    len: 1, notes: [[0, 127], [0.26, 90], [0.47, 105], [0.71, 118]] });
  add({ id: 'rs:piano', name: 'Amapiano late off-16ths', group: 'Research',
    len: 1, notes: [[0, 127], [0.28, 100], [0.5, 120], [0.78, 100]] });

  // Ableton Core Library grooves (real file data).
  const AFRICAN = /Kuduro|Gqom|Highlife|African|Afoxe|Agogo|Conga|Bongo|Caixixi|Cabasa/;
  Object.entries(RX.ABLETON_GROOVES || {}).forEach(([name, g]) => {
    add({ id: 'ab:' + name, name, len: g.len, notes: g.notes,
      group: AFRICAN.test(name) ? 'Ableton: African' : 'Ableton: diaspora and other' });
  });

  RX.GROOVES = grooves;
  RX.GROOVE_BY_ID = Object.fromEntries(grooves.map((g) => [g.id, g]));

  /**
   * Apply a groove to a hit.
   * @param groove  groove object
   * @param pos     hit position in beats (absolute, un-wrapped)
   * @param timing  0..1.3 timing amount
   * @param accent  0..1 velocity amount
   * @returns { offset (beats), gain (0..1) }
   */
  RX.applyGroove = function (groove, pos, timing, accent) {
    if (!groove || !groove.notes.length) return { offset: 0, gain: 1 };
    const len = groove.len;
    const p = ((pos % len) + len) % len;
    const win = groove.window || 0.13;
    let best = null, bestD = Infinity;
    for (const n of groove.notes) {
      let d = n[0] - p;
      if (d > len / 2) d -= len;
      if (d < -len / 2) d += len;
      if (Math.abs(d) < Math.abs(bestD)) { bestD = d; best = n; }
    }
    if (!best || Math.abs(bestD) > win) return { offset: 0, gain: 1 };
    return { offset: bestD * timing, gain: 1 - accent * (1 - best[1] / 127) };
  };

  const LEVEL = { X: 1, x: 0.78, o: 0.4 };

  /**
   * Render one lane to timed events over a whole number of bars, long enough to
   * cover the groove's own loop. Used by both exporters.
   * @returns { length (beats), events: [{ t, vel (1-127) }] }
   */
  RX.renderLane = function (pattern, steps, groove, timing, accent) {
    const stepBeats = 4 / steps;
    const length = Math.min(16, Math.max(4, Math.ceil((groove ? groove.len : 4) / 4) * 4));
    const events = [];
    for (let i = 0; i < length / stepBeats; i++) {
      const lv = LEVEL[pattern[i % steps]];
      if (!lv) continue;
      const pos = i * stepBeats;
      const g = RX.applyGroove(groove, pos, timing, accent);
      let t = pos + g.offset;
      if (t < 0) t += length;
      events.push({ t, vel: Math.max(1, Math.min(127, Math.round(lv * g.gain * 127))) });
    }
    events.sort((a, b) => a.t - b.t);
    return { length, events };
  };

  RX.LEVEL = LEVEL;
})();
