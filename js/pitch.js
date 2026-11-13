// Pitch per part. Every part plays at its voice's own pitch, except:
// - parts named low / mid / high (e.g. amadinda players, kenkeni / sangban / dununba),
//   which sit a fifth below, at, or a fifth above that pitch, so the set is distinguishable;
// - parts that carry explicit `notes` (semitone offsets, one per hit, cycling through the bar).
window.RX = window.RX || {};

(function () {
  const REGISTERS = [[/\blow\b/i, -7], [/\b(mid|middle)\b/i, 0], [/\bhigh\b/i, 7]];

  /** Semitone offsets for one part, or null to play at the voice's own pitch. */
  RX.notesFor = function (line) {
    if (!line) return null;
    if (Array.isArray(line.notes) && line.notes.length) return line.notes;
    const reg = REGISTERS.find(([re]) => re.test(line.name || ''));
    return reg && reg[1] !== 0 ? [reg[1]] : null;
  };

  /** Playback ratio for the hit at step i of a lane (notes cycle per hit within the bar). */
  RX.pitchRatio = function (lane, i) {
    if (!lane.notes) return 1;
    let n = 0;
    for (let k = 0; k < i; k++) if (lane.pattern[k] !== '.') n++;
    return Math.pow(2, lane.notes[n % lane.notes.length] / 12);
  };
})();
