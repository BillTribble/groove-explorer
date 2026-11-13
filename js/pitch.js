// Pitch for melodic parts (xylophones, mbira, lutes, bass, voice...).
// A topLine may carry `notes`: semitone offsets from the instrument's base pitch,
// one per hit, cycling through the bar. Lines without notes get a melody built from
// the style's scale, in a register taken from the part name (low / mid / high).
// These generated melodies are illustrative, not transcriptions.
window.RX = window.RX || {};

(function () {
  RX.PITCHED = new Set(['xylophone', 'mbira', 'pluck', 'bow', 'wind', 'voice', 'bass', 'guembri',
    'guitar', 'oud', 'kora', 'piano', 'ghaita']);

  const SCALES = {
    major5: [0, 2, 4, 7, 9],
    minor5: [0, 3, 5, 7, 10],
    // Kiganda tuning: five roughly equal steps to the octave (amadinda, akadinda).
    equi5: [0, 2.4, 4.8, 7.2, 9.6],
    // Ethiopian qenet
    tizita: [0, 2, 4, 7, 9], bati: [0, 4, 5, 7, 11], ambassel: [0, 1, 5, 7, 8], anchihoye: [0, 1, 5, 6, 9],
    // Shona mbira tunings sit close to a seven-note scale.
    mbira: [0, 2, 3, 5, 7, 9, 10],
    // Maghreb / Arab / Turkish modes, approximated in 12-TET.
    hijaz: [0, 1, 4, 5, 7, 8, 10],
  };

  const SCALE_RULES = [
    [/amadinda|akadinda|baganda/, 'equi5'],
    [/tizita/, 'tizita'], [/bati/, 'bati'], [/ambassel/, 'ambassel'], [/anchihoye/, 'anchihoye'],
    [/mbira/, 'mbira'],
    [/gnawa|andalusi|ghaita|jurjina|samai|dawr|chiftetelli|karsilama|laz|nawari|maqsum|saidi|malfuf|taarab/, 'hijaz'],
    [/marabi|mbaqanga|maskandi|isicathamiya|highlife|soukous|ndombolo|benga/, 'major5'],
  ];
  const scaleFor = (r) => {
    if (r.scale) return SCALES[r.scale] || r.scale;
    const key = (r.id + ' ' + r.name).toLowerCase();
    const hit = SCALE_RULES.find(([re]) => re.test(key));
    return SCALES[hit ? hit[1] : 'minor5'];
  };

  // Register from the part name, in semitones.
  const registerFor = (name, idx) => {
    const n = (name || '').toLowerCase();
    if (/low|bass|left hand|okunaga|sanduku|dununba/.test(n)) return -12;
    if (/high|lead|right hand|treble|okukoonera/.test(n)) return 12;
    if (/mid|okwawula/.test(n)) return 0;
    return [0, 12, -12, 7][idx % 4];
  };

  // Scale-degree contours; each line takes a different one so interlocking parts differ.
  const CONTOURS = [
    [0, 2, 4, 1, 3, 0, 4, 2],
    [4, 1, 3, 0, 2, 4, 1, 3],
    [2, 4, 0, 3, 1, 4, 2, 0],
    [0, 1, 2, 3, 4, 3, 2, 1],
  ];

  const degreeToSemis = (scale, d) => scale[((d % scale.length) + scale.length) % scale.length] + 12 * Math.floor(d / scale.length);

  /** Semitone offsets for one lane, or null for unpitched sounds. */
  RX.notesFor = function (r, line, idx, voice) {
    if (!RX.PITCHED.has(voice)) return null;
    if (line && Array.isArray(line.notes) && line.notes.length) return line.notes;
    const scale = scaleFor(r);
    const reg = registerFor(line && line.name, idx);
    return CONTOURS[idx % CONTOURS.length].map((d) => degreeToSemis(scale, d) + reg);
  };

  /** Playback ratio for the hit at step i of a lane (notes cycle per hit within the bar). */
  RX.pitchRatio = function (lane, i) {
    if (!lane.notes) return 1;
    let n = 0;
    for (let k = 0; k < i; k++) if (lane.pattern[k] !== '.') n++;
    return Math.pow(2, lane.notes[n % lane.notes.length] / 12);
  };
})();
