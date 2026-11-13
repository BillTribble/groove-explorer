// Sample kit: maps each rhythm sound name to recorded one-shots in samples/.
// An entry is either one file, or [accent, hit, ghost] so strong strokes can use a
// different sample (e.g. darbuka doum on accents, tek elsewhere).
// Sounds not listed here (pluck, bow, wind, voice, bass, ...) keep their synth voice.
// Sources and licences: samples/CREDITS.md.
window.RX = window.RX || {};

(function () {
  const DOUM_TEK = ['darbuka-doum', 'darbuka-tek', 'darbuka-tek'];
  const BIG_DRUM = 'bdconcert';

  RX.SAMPLE_KIT = {
    base: 'samples/',
    // Per-rhythm exceptions: these sounds keep their synth voice in that rhythm even in Samples mode.
    keepSynth: { 111: ['tom'] },
    map: {
      kick: 'bdkit',
      // snare: the synth snare is preferred, so it has no sample here.
      caixa: 'ropesnare', caja: 'ropesnare',
      tom: ['tomlo', 'tomhi', 'tomhi'],

      // Bass drums
      dunun: 'sangban',
      surdo: 'alfaia', zabumba: 'alfaia', alfaia: 'alfaia',
      tupan: BIG_DRUM, amashako: BIG_DRUM,
      tambora: 'tomlo',

      // Goblet and hand drums
      djembe: ['djembe-slap', 'djembe-tone', 'djembe-tone'],
      tabla: ['tabla-dha', 'tabla-na', 'tabla-na'], mridangam: ['tabla-dha', 'tabla-na', 'tabla-na'],
      darbuka: DOUM_TEK, derbouka: DOUM_TEK, dumbak: DOUM_TEK,
      conga: ['tumba', 'conga', 'quinto'],
      barril: 'tumba', atsimevu: 'tumba', kebero: 'tumba',
      kpanlogo: 'conga', fundeh: 'conga', engalabi: 'conga',
      bongo: 'bongo', kagan: 'bongo',
      cajon: ['cajonslap', 'cajonbass', 'cajonbass'],

      // Frame drums
      bendir: 'framedrum', sakara: 'framedrumhi',
      pandeiro: ['framedrumhi', 'tambourine', 'tambourine'], pandereta: 'tambourine',

      // Idiophones
      clap: 'clap',
      shaker: 'shaker', maracas: 'shaker',
      // Scrapers (güira, güiro, ferrinho, guacharaca): a long scrape on accents, short strokes otherwise.
      scraper: ['guiro-scrape', 'guiro-hit', 'guiro-hit'],
      quijada: 'vibraslap',
      metal: ['cowbell', 'agogo', 'agogo'], dawuro: 'cowbell',
      xylophone: 'balafon',
      mbira: 'mbira',

      // Keys used only by the name lookup below.
      wood: 'claves',
      triangle: ['triangle-open', 'triangle-muted', 'triangle-muted'],
      qraqeb: ['cowbell-muted', 'cowbell-muted', 'cowbell-muted'],
      riq: 'tambourine',
      talking: 'tumba',
      small: 'bongo',
      bigstick: BIG_DRUM,
    },

    // Many parts are tagged with a generic sound ('dunun', 'metal', 'snare'...). For samples,
    // the instrument named in the part wins: first match against the part name picks the kit key.
    byName: [
      [/caj[oó]n/i, 'cajon'],
      [/cajita|cu[aá](?![a-z])|playing cast/i, 'wood'],
      [/darbuka|derbouka|dumbak|taarija|ghatam/i, 'darbuka'],
      [/tabla|pakhavaj|mridangam/i, 'tabla'],
      [/\bdaf\b|bendir|\btar\b|frame drum|kanjira|pandereta/i, 'bendir'],
      [/pandeiro/i, 'pandeiro'],
      [/\briq\b/i, 'riq'],
      [/triangle|manjira/i, 'triangle'],
      [/qraqeb/i, 'qraqeb'],
      [/bongo|namunjoloba|omele|repeater|llamador|petia|kagan/i, 'small'],
      [/conga|kpanlogo|kidi|engalabi|enzeko|ngoma|fundeh|buleador/i, 'conga'],
      [/barril|atsimevu|sogo|kwadum|apentemma|iya-ilu|kebero|tamb[oó]r \(lead/i, 'barril'],
      [/atumpan/i, 'talking'],
      [/djembe/i, 'djembe'],
      [/alfaia|surdo|zabumba|tant[aã]/i, 'surdo'],
      [/tupan|\btabl\b|tambora|msondo|ganga|karyenda|kbandu|empunya|bass \(thunder\)/i, 'bigstick'],
      [/caixa|caja\b/i, 'caixa'],
      [/foot stomp/i, 'kick'],
    ],
  };

  /** Kit key for a part, from its name when that names a known instrument; else null. */
  RX.instrumentFor = function (line) {
    const name = line && line.name;
    if (!name) return null;
    const hit = RX.SAMPLE_KIT.byName.find(([re]) => re.test(name));
    return hit ? hit[1] : null;
  };
})();
