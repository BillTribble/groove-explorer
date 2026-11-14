// Groove library + application. A groove is { id, name, group, len (beats), notes: [[timeBeats, velocity]] }.
// Applying a groove works the way Live's groove pool does: each hit is pulled onto the
// nearest groove note (if one is close enough) and takes a share of its velocity.
window.RX = window.RX || {};

(function () {
  const grooves = [];
  const add = (g) => grooves.push(g);

  add({ id: 'straight', name: 'Straight', group: 'Basic', len: 1, notes: [] });

  // Plain swing: off-beat 16th sits at pct% of the 8th note (50 straight, 66 triplet).
  [52, 54, 55, 56, 57, 58, 60, 61, 62, 64, 66, 71].forEach((pct) => {
    const off = 0.5 * pct / 100;
    add({ id: 'sw16:' + pct, name: 'Swing 16ths ' + pct + '%', group: 'Basic',
      len: 1, notes: [[0, 127], [off, 127], [0.5, 127], [0.5 + off, 127]] });
  });
  [57, 58, 60, 62, 66].forEach((pct) => {
    add({ id: 'sw8:' + pct, name: 'Swing 8ths ' + pct + '%', group: 'Basic',
      len: 1, notes: [[0, 127], [pct / 100, 127]] });
  });

  // Research-based feels (approximations of published timing data).
  // Even 12/8 feel: on a 12-step grid this is the grid itself; on a 16-step grid it pulls the
  // off-beat 16ths onto triplets, giving a binary-notated pattern its 6/8 lilt.
  add({ id: 'tri:even', name: 'Triplet feel (even 12/8)', group: 'Research',
    len: 1, notes: [[0, 127], [1 / 3, 110], [2 / 3, 118]] });
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
   * A pattern loops on its own length, which need not be the row's `steps`. `loopSteps` is the
   * number of steps after which every part of the row lines up again (RX.loopSteps); the render
   * is stretched to cover it so parts of different lengths share one clip length.
   * @returns { length (beats), events: [{ t, step (index in the pattern), vel (1-127) }] }
   */
  const gcd = (a, b) => (b ? gcd(b, a % b) : a);
  const lcm = (a, b) => (a / gcd(a, b)) * b;
  /** Steps until a row's parts realign: lcm of the row length and every pattern length. */
  RX.loopSteps = (steps, patterns) => patterns.reduce((n, p) => (p && p.length ? lcm(n, p.length) : n), steps);
  const MAX_BEATS = 64;
  RX.renderLane = function (pattern, steps, groove, timing, accent, loopSteps) {
    const stepBeats = 4 / steps;
    let length = Math.min(16, Math.max(4, Math.ceil((groove ? groove.len : 4) / 4) * 4));
    const cycle = lcm(Math.round(length / stepBeats), loopSteps || lcm(steps, pattern.length || steps));
    length = Math.min(MAX_BEATS, cycle * stepBeats);
    const events = [];
    for (let i = 0; i < length / stepBeats; i++) {
      const lv = LEVEL[pattern[i % pattern.length]];
      if (!lv) continue;
      const pos = i * stepBeats;
      const g = RX.applyGroove(groove, pos, timing, accent);
      let t = pos + g.offset;
      if (t < 0) t += length;
      events.push({ t, step: i % pattern.length, vel: Math.max(1, Math.min(127, Math.round(lv * g.gain * 127))) });
    }
    events.sort((a, b) => a.t - b.t);
    return { length, events };
  };

  RX.LEVEL = LEVEL;
})();
