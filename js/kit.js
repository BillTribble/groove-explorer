// Sample kit: maps each rhythm sound name to recorded one-shots in samples/.
// An entry is either one file, or [accent, hit, ghost] so strong strokes can use a
// different sample (e.g. darbuka doum on accents, tek elsewhere).
// Sounds not listed here (pluck, bow, wind, voice, bass, ...) keep their synth voice.
// Sources and licences: samples/CREDITS.md.
window.RX = window.RX || {};

(function () {
  // Darbuka: one player's doumbek (Freesound, gregstullsoundlab) — doum on accents, tek on hits, ka on ghosts.
  const DOUM_TEK = ['doumbek-doum', 'doumbek-tek', 'doumbek-ka'];
  const BIG_DRUM = 'bdconcert';

  RX.SAMPLE_KIT = {
    base: 'samples/',
    // Per-rhythm exceptions: these sounds keep their synth voice in that rhythm even in Samples mode.
    keepSynth: { 111: ['tom'] },
    // Modern dance rows play the drum-machine voice for these sounds (synth voices in js/audio.js, so they are the same
    // in Synth and Samples mode). `swap` maps a sound name to its machine voice; add 'kick' and 'clap' here once
    // 909-style voices exist for them.
    machine: {
      rows: ['111', 'afrohouse', 'afrohouse12', '3step', 'shangaan', 'batida', 'funk'],
      swap: { tom: 'tom909', snare: 'snare909' },
    },
    map: {
      // kick: the synth kick is preferred, so it has no sample here.
      // snare: the synth snare is preferred, so it has no sample here.
      caixa: 'caixa-maracatu', caja: 'ropesnare',
      tom: ['tomlo', 'tomhi', 'tomhi'],

      // Bass drums
      // Dunun family (one player, Freesound JIMMYJAMES112): open sangban, muted on soft hits.
      dunun: ['sangban-open', 'sangban-open', 'sangban'],
      dununba: 'dununba', kenkeni: 'kenkeni',
      surdo: 'alfaia', zabumba: 'alfaia', alfaia: 'alfaia-hit',
      tupan: BIG_DRUM, amashako: BIG_DRUM,
      tambora: 'tomlo',

      // Goblet and hand drums
      djembe: ['djembe-slap', 'djembe-tone', 'djembe-bass'],
      // Two djembes in an ensemble play different roles. The lead is a big low hit; the accompaniment is a short,
      // dry tap (a bright edge slap on accents). One player, Freesound domingus (CC0).
      'djembe-lead': ['djembe-king', 'djembe-king', 'djembe-tone'],
      'djembe-accomp': ['djembe-hi', 'djembe-tick', 'djembe-tick'],
      // Tabla bols: dha on accents, na on hits, te on ghost strokes; mridangam leads with tun.
      tabla: ['tabla-dha', 'tabla-na-sp', 'tabla-te'], mridangam: ['tabla-tun', 'tabla-na', 'tabla-te'],
      darbuka: DOUM_TEK, derbouka: DOUM_TEK, dumbak: DOUM_TEK,
      // Congas (one player, Freesound Sassaby): slap on accents, open tone on hits, quinto on ghosts.
      conga: ['conga-slap', 'conga-tone', 'quinto-tone'],
      barril: 'tumba', atsimevu: 'tumba', kebero: 'tumba',
      kpanlogo: 'conga', fundeh: 'conga', engalabi: 'conga',
      bongo: 'bongo', kagan: 'bongo',
      // FreePats flamenco cajón: slap on accents, bass on hits, light slap on ghosts.
      cajon: ['cajon-a', 'cajon-b', 'cajon-c'],

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
      // The two mbira dzavadzimu players use the same instrument and tuning but sit in different registers:
      // real recordings of two other keys of the same mbira (kushaura high, kutsinhira an octave below).
      'mbira-kushaura': 'mbira-e4', 'mbira-kutsinhira': 'mbira-e3',
      // Bowed fiddle for the masinko (Ethiopian one-string fiddle): a recorded violin G3, no free masinko recording exists.
      masinko: 'fiddle',

      // Keys used only by the name lookup below.
      wood: 'claves',
      triangle: ['triangle-open', 'triangle-muted', 'triangle-muted'],
      qraqeb: ['cowbell-muted', 'cowbell-muted', 'cowbell-muted'],
      riq: 'tambourine',
      talking: 'tumba',
      small: 'bongo',
      bigstick: BIG_DRUM,
      // Ewe / Akan drums by size, from the Karoryfer bobobo set (Ghana).
      'ewe-big': 'bobobo-bass', 'ewe-mid': 'bobobo-tenor', 'ewe-small': 'bobobo-treble',
      // Batá (one player, Freesound Sassaby): slap on accents, open tone otherwise.
      'bata-iya': ['bata-iya-slap', 'bata-iya-tone', 'bata-iya-tone'],
      'bata-itotele': ['bata-itotele-slap', 'bata-itotele-tone', 'bata-itotele-tone'],
      'bata-okonkolo': ['bata-okonkolo-slap', 'bata-okonkolo-tone', 'bata-okonkolo-tone'],
      agogo: ['agogo-low', 'agogo-high2', 'agogo-high2'],
      shekere: 'shekere',
      udu: 'udu',
    },

    // Many parts are tagged with a generic sound ('dunun', 'metal', 'snare'...). For samples,
    // the instrument named in the part wins: first match against the part name picks the kit key.
    byName: [
      [/caj[oó]n/i, 'cajon'],
      [/cajita|cu[aá](?![a-z])|playing cast/i, 'wood'],
      [/dununba/i, 'dununba'],
      [/kenkeni/i, 'kenkeni'],
      [/sangban/i, 'dunun'],
      [/iy[aá](-ilu)?\b|iya-ilu/i, 'bata-iya'],
      [/omele ako|it[oó]tele/i, 'bata-itotele'],
      [/omele abo|ok[oó]nkolo/i, 'bata-okonkolo'],
      [/agog/i, 'agogo'],
      [/sekere|shekere|axatse/i, 'shekere'],
      [/ghatam|\budu\b/i, 'udu'],
      [/darbuka|derbouka|dumbak|taarija/i, 'darbuka'],
      [/tabla|pakhavaj|mridangam/i, 'tabla'],
      [/\bdaf\b|bendir|\btar\b|frame drum|kanjira|pandereta/i, 'bendir'],
      [/pandeiro/i, 'pandeiro'],
      [/\briq\b/i, 'riq'],
      [/triangle|manjira/i, 'triangle'],
      [/qraqeb/i, 'qraqeb'],
      [/atsimevu|sogo|kwadum|apentemma/i, 'ewe-big'],
      [/kidi/i, 'ewe-mid'],
      [/kagan|petia/i, 'ewe-small'],
      [/bongo|namunjoloba|omele|repeater|llamador/i, 'small'],
      [/conga|kpanlogo|engalabi|enzeko|ngoma|fundeh|buleador/i, 'conga'],
      [/barril|kebero|tamb[oó]r \(lead/i, 'barril'],
      [/atumpan/i, 'talking'],
      [/djembe.*lead|lead.*djembe/i, 'djembe-lead'],
      [/djembe.*accomp/i, 'djembe-accomp'],
      [/djembe/i, 'djembe'],
      [/alfaia/i, 'alfaia'],
      [/surdo|zabumba|tant[aã]/i, 'surdo'],
      [/tupan|\btabl\b|tambora|msondo|ganga|karyenda|kbandu|empunya|bass \(thunder\)/i, 'bigstick'],
      [/caixa/i, 'caixa'],
      [/caja\b/i, 'caja'],
      [/foot stomp/i, 'kick'],
      [/masinko|masenqo/i, 'masinko'],
      [/kushaura/i, 'mbira-kushaura'],
      [/kutsinhira/i, 'mbira-kutsinhira'],
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
