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
    map: {
      kick: 'bdkit',
      snare: 'snare',
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
      metal: ['cowbell', 'agogo', 'agogo'], dawuro: 'cowbell',
      xylophone: 'balafon',
      mbira: 'mbira',
    },
  };
})();
