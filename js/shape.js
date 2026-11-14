// Rhythm shape: where the onsets fall in the cycle, ignoring instrument, tempo and region.
// RX.coreTop(r) picks the one top line that best shows a rhythm's structure; the simple
// (single top voice) version of a multi-instrument row plays it.
window.RX = window.RX || {};

(function () {
  const fit = (p, n) => (p || '').slice(0, n).padEnd(n, '.');
  const flat = (p) => p.replace(/[^.]/g, 'x');
  const onsets = (p) => { const o = []; for (let i = 0; i < p.length; i++) if (p[i] !== '.') o.push(i); return o; };
  const count = (p) => onsets(p).length;
  const gcd = (a, b) => (b ? gcd(b, a % b) : a);
  /** Two lines heard as one. Lines of different lengths are unrolled until they realign. */
  const union = (a, b) => {
    if (!a.length || !b.length) return flat(a || b);
    const n = Math.min(192, (a.length / gcd(a.length, b.length)) * b.length);
    return Array.from({ length: n }, (_, i) => (a[i % a.length] !== '.' || b[i % b.length] !== '.' ? 'x' : '.')).join('');
  };
  const contains = (big, small) => onsets(small).every((i) => big[i] && big[i] !== '.');

  /** Gaps between successive onsets, wrapping round the cycle (3-3-2 for a tresillo). */
  function intervals(p) {
    const o = onsets(p);
    return o.map((v, k) => (k + 1 < o.length ? o[k + 1] - v : p.length - v + o[0]));
  }

  /** Where a line mixes accents and ghost notes, the accents carry the shape: ghosts drop out. */
  const skeleton = (p) => (/X/.test(p) && /o/.test(p) ? p.replace(/o/g, '.') : p);

  /** An even pulse (or silence, or every step): it marks time but has no shape of its own. */
  function isPulse(p) {
    const iv = intervals(skeleton(p));
    return iv.length < 2 || iv.every((g) => g === iv[0]);
  }

  /**
   * A steady stream on the 16ths or 8ths (a shaker, a ride bell, strummed 8ths): it fills time but
   * says nothing about the rhythm. Every hit must be at the same level. `raw` may be shorter than the row; only the gaps between its own
   * onsets count. In 12-step rows a gap of two is the 3:2 cross-pulse, which is structure, so it stays.
   */
  function isFiller(raw, steps) {
    const o = onsets(raw || '');
    if (o.length < 4) return false;
    if (o.some((i) => raw[i] !== raw[o[0]])) return false; // accents give a stream a shape (2+2+3 and the like)
    const g = o[1] - o[0];
    for (let k = 1; k + 1 < o.length; k++) if (o[k + 1] - o[k] !== g) return false;
    return g === 1 || (g === 2 && steps !== 12);
  }

  /** Canonical rotation: two patterns with the same necklace are rotations of each other. */
  function necklace(p) {
    const f = flat(p);
    let best = f;
    for (let k = 1; k < f.length; k++) { const rot = f.slice(k) + f.slice(0, k); if (rot > best) best = rot; }
    return best;
  }

  // Timeline instruments: the part an ensemble takes its bearings from. In Mandé drumming that
  // is the sangban, whose pattern is what tells one rhythm from another.
  const TIMELINE = /bell|gankogui|dawuro|nono\b|gongu|clave|agog|cowbell|cu[aá]\b|palmas|qraqeb|sangban/i;

  /**
   * The top line that best shows the rhythm's structure: { pattern, name, from }.
   * from: 'core'  an authored skeleton (r.core) for rhythms whose parts are all even pulses;
   *       'line'  a part of the ensemble (the classifier's pick when there is one, else the rules);
   *       'top' the row's own top line;
   *       'pulse' nothing in the data has a shape, so this is just the top line.
   * Among the parts, even pulses and copies of the kick are set
   * aside; a timeline instrument wins, otherwise the part that shares most with the others.
   */
  RX.coreTop = function (r) {
    const n = r.steps, top = r.top, kick = flat(fit(r.kick, n)); // a top line may loop on its own length
    if (r.core) return { pattern: fit(r.core, n), name: r.coreName || 'Skeleton', from: 'core' };
    const shaped = (p) => !isPulse(p) && flat(p) !== kick;
    const lines = (r.topLines || []).filter((l) => shaped(l.pattern));
    // The classifier's pick (py/rhythm_ml.py -> RX.ML_CORE) comes before the rules below.
    const ml = RX.ML_CORE && r.topLines && r.topLines[RX.ML_CORE[r.id]];
    if (ml && shaped(ml.pattern)) return { pattern: ml.pattern, name: ml.name, from: 'line' };
    if (lines.length) {
      const sim = (a, b) => { const A = onsets(a), B = new Set(onsets(b)); const both = A.filter((i) => B.has(i)).length; return both / (A.length + B.size - both); };
      const score = (l) => (TIMELINE.test(l.name) ? 10 : 0) + lines.reduce((s, o) => s + (o === l ? 0 : sim(l.pattern, o.pattern)), 0) / Math.max(1, lines.length - 1);
      const best = lines.reduce((a, b) => (score(b) > score(a) ? b : a));
      if (flat(best.pattern) === flat(top)) return { pattern: top, name: best.name, from: r.topLines.length ? 'line' : 'top' };
      return { pattern: best.pattern, name: best.name, from: 'line' };
    }
    return { pattern: top, name: null, from: shaped(top) ? 'top' : 'pulse' };
  };

  RX.shape = { fit, flat, skeleton, onsets, count, union, contains, intervals, isPulse, isFiller, necklace };
})();
