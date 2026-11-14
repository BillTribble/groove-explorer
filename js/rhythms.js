// Rhythm library. Patterns: X accent, x hit, o ghost, . rest.
// steps 16 = four beats of 16ths; steps 12 = four beats of triplets (12/8).
// steps 8 = two beats of 16ths (half bar); steps 20 = five beats of 16ths (5/4).
// src: "agr" = accents read from an Ableton groove file, "std" = widely documented
// timeline, "approx" = typical simplification from memory, not transcribed from a source,
// "audio" = measured from a recording.
// family: groups rhythmically-similar variants (same cell/timeline, different embellishments)
// topLines: array of {name, pattern, sound} for multi-instrument top parts (optional)
//   Every pattern is exactly `steps` long, except a part marked `loop: true`: that part loops on its
//   own length at the row's step size (a 3-step gallop turning against a 16-step bar). A row's `top`
//   may equal such a part.
// mapLabel: optional short label for the node map (default: the name before any bracket).
// core / coreName: the structural skeleton (meter grouping, iqa', compás, tala claps) for rhythms whose
//   parts are even pulses, so the simple one-voice version shows the shape. See js/shape.js (RX.coreTop).
window.RX = window.RX || {};

const F  = 'x...x...x...x...';   // four on the floor (16)
const F12 = 'x..x..x..x..';      // four on the floor (12/8)
const F8  = 'x.x.';              // four on the floor (8 steps = half bar)
const F20 = 'x...x...x...x...x...'; // five on the floor (20 steps = 5/4)
const DEMBOW = '...x..x....x..x.';

RX.RHYTHMS = [
  // ── Featured ──
  { id: '111', name: '111 (Ape Drums & JAMIIE)', region: 'South Africa', bpm: 120, range: 'measured 120.0', steps: 16, family: 'tresillo',
    kick: F, top: '.x....x..x....x.', sound: 'tom', groove: 'straight', src: 'audio',
    etymology: 'Named for the 1-1-1 triplet feel; "Ape Drums" = producer Eric Alberto-Lopez, "JAMIIE" = vocalist.',
    note: 'Measured from audio. Kick is four on the floor at 120.0 bpm. Tom hits land on the "e" of 1, "and" of 2, "e" of 3, "and" of 4, with clap on 2 and 4. Across the barline hits fall 3-3-2: and-of-2, e-of-3, then kick on 4. A tresillo rotated to start on and-of-2, third stroke swallowed by kick. Same cell as dembow (keeps strokes 2&3 of unrotated tresillo), pushed six 16ths later. Quantised; only and-of-2 hit ~10 ms late. Every 2nd bar adds pickup on "a" of 1. Released Aug 2025 on Rampa\'s VOD label, tagged Afro-tech / Afro house.' },

  // ── Mandé / Djembe-Dunun Ensemble (Mali, Guinea) ──
  { id: 'kuku', name: 'Kuku', region: 'Mandé (Guinea)', bpm: 120, range: '110–130', steps: 16, family: 'djembe',
    kick: 'x...x...x...x...', top: 'x.x.x...x.x.x...', sound: 'djembe', groove: 'sw16:54', src: 'std',
    etymology: 'From Maninka "kuku" — a celebratory rhythm for women returning from fishing.',
    note: 'Traditional Guinean rhythm celebrating women\'s return from fishing. Played with 2 djembes + 3 dununs (kenkeni, sangban, dununba).',
    topLines: [
      { name: 'Djembe 1 (lead)', pattern: 'x.x.x...x.x.x...', sound: 'djembe' },
      { name: 'Djembe 2 (accomp.)', pattern: '.x..x.x.x..x.x.x', sound: 'djembe' },
      { name: 'Kenkeni (high dunun)', pattern: 'x...x...x...x...', sound: 'dunun' },
      { name: 'Sangban (mid dunun)', pattern: '.x..x...x...x...', sound: 'dunun' },
      { name: 'Dununba (low dunun)', pattern: 'x.......x.......', sound: 'dunun' }
    ] },

  { id: 'djembe-kassa', name: 'Kassa (Harvest)', region: 'Mandé (Guinea)', bpm: 130, range: '120–140', steps: 16, family: 'djembe',
    kick: 'x...x...x...x...', top: 'x..x.x.x..x..x.x', sound: 'djembe', groove: 'sw16:58', src: 'std',
    etymology: 'Maninka "kassa" = granary/harvest. Played during harvest work and celebrations.',
    note: 'Fast harvest rhythm. Lead djembe improvises over steady accompaniment. Three dununs lock in 3:2 cross-rhythm.',
    topLines: [
      { name: 'Djembe lead', pattern: 'x..x.x.x..x..x.x', sound: 'djembe' },
      { name: 'Djembe accomp.', pattern: '.x.x..x.x.x..x..', sound: 'djembe' },
      { name: 'Kenkeni', pattern: 'x...x...x...x...', sound: 'dunun' },
      { name: 'Sangban', pattern: '..x...x...x...x.', sound: 'dunun' },
      { name: 'Dununba', pattern: 'x.......x.......', sound: 'dunun' }
    ] },

  { id: 'djembe-soli', name: 'Soli (Initiation)', region: 'Mandé (Guinea)', bpm: 110, range: '100–120', steps: 16, family: 'djembe',
    kick: 'x...x...x...x...', top: 'x.x..x.x.x..x.x.', sound: 'djembe', groove: 'tri:even', src: 'std',
    etymology: 'Maninka "soli" = ritual/initiation. Traditionally for circumcision ceremonies.',
    note: 'Sacred initiation rhythm. Complex djembe phrases over dununba\'s signature 3-stroke pattern. Elder drummers only.',
    topLines: [
      { name: 'Djembe lead', pattern: 'x.x..x.x.x..x.x.', sound: 'djembe' },
      { name: 'Djembe accomp.', pattern: '.x.x.x..x.x.x..x', sound: 'djembe' },
      { name: 'Kenkeni', pattern: 'x...x...x...x...', sound: 'dunun' },
      { name: 'Sangban', pattern: '.x..x..x..x..x..', sound: 'dunun' },
      { name: 'Dununba', pattern: 'x..x..x...x..x..', sound: 'dunun' }
    ] },

  { id: 'djembe-dununba', name: 'Dununba (Strong Men)', region: 'Mandé (Guinea)', bpm: 100, range: '90–110', steps: 16, family: 'djembe',
    kick: 'x...x...x...x...', top: 'x..x.x..x..x.x..', sound: 'djembe', groove: 'tri:even', src: 'std',
    etymology: '"Dununba" = "big dunun". Men\'s strength dance, originally for resolving disputes.',
    note: 'The "ba" (big) dunun drives this. Kenkeni and sangban play off-beat interlock. Djembe lead plays extended solos.',
    topLines: [
      { name: 'Djembe lead', pattern: 'x..x.x..x..x.x..', sound: 'djembe' },
      { name: 'Djembe accomp.', pattern: '.x..x.x.x..x.x.x', sound: 'djembe' },
      { name: 'Kenkeni', pattern: 'x...x...x...x...', sound: 'dunun' },
      { name: 'Sangban', pattern: '..x...x...x...x.', sound: 'dunun' },
      { name: 'Dununba', pattern: 'x..x..x...x..x..', sound: 'dunun' }
    ] },

  { id: 'djembe-mendiani', name: 'Mendiani', region: 'Mandé (Guinea)', bpm: 140, range: '130–150', steps: 16, family: 'djembe',
    kick: 'x...x...x...x...', top: 'x.x.x.x.x.x.x.x.', sound: 'djembe', groove: 'sw16:56', src: 'std',
    etymology: 'Named for the Mendiani bird — fast, light, joyful. Girls\' coming-of-age dance.',
    note: 'Fast, light rhythm for young women\'s dance. Kenkeni keeps steady pulse; sangban/dununba converse. High energy.',
    topLines: [
      { name: 'Djembe lead', pattern: 'x.x.x.x.x.x.x.x.', sound: 'djembe' },
      { name: 'Djembe accomp.', pattern: '.x.x.x.x.x.x.x.x', sound: 'djembe' },
      { name: 'Kenkeni', pattern: 'x...x...x...x...', sound: 'dunun' },
      { name: 'Sangban', pattern: '.x..x..x..x..x..', sound: 'dunun' },
      { name: 'Dununba', pattern: 'x.......x.......', sound: 'dunun' }
    ] },

  { id: 'djembe-yankadi', name: 'Yankadi', region: 'Mandé (Guinea)', bpm: 80, range: '70–90', steps: 16, family: 'djembe',
    kick: 'x...x...x...x...', top: '.x..x...x..x....', sound: 'djembe', groove: 'sw16:57', src: 'std',
    etymology: 'Maninka "yankadi" = "slow dance". Courting dance for young people.',
    note: 'Slow, flirtatious partner dance. Often paired with Makru (fast version). Light swing feel. Kenkeni on downbeats.',
    topLines: [
      { name: 'Djembe lead', pattern: '.x..x...x..x....', sound: 'djembe' },
      { name: 'Djembe accomp.', pattern: 'x...x...x...x...', sound: 'djembe' },
      { name: 'Kenkeni', pattern: 'x...x...x...x...', sound: 'dunun' },
      { name: 'Sangban', pattern: '..x...x...x...x.', sound: 'dunun' },
      { name: 'Dununba', pattern: 'x.......x.......', sound: 'dunun' }
    ] },

  { id: 'djembe-makru', name: 'Makru (Fast Yankadi)', region: 'Mandé (Guinea)', bpm: 140, range: '130–150', steps: 16, family: 'djembe',
    kick: 'x...x...x...x...', top: 'x.x.x.x.x.x.x.x.', sound: 'djembe', groove: 'sw16:54', src: 'std',
    etymology: 'Maninka "makru" = "fast". The up-tempo version of Yankadi.',
    note: 'Fast version of Yankadi. Same dunun parts, djembe plays dense 16th-note runs. Often transitions directly from Yankadi.',
    topLines: [
      { name: 'Djembe lead', pattern: 'x.x.x.x.x.x.x.x.', sound: 'djembe' },
      { name: 'Djembe accomp.', pattern: '.x.x.x.x.x.x.x.x', sound: 'djembe' },
      { name: 'Kenkeni', pattern: 'x...x...x...x...', sound: 'dunun' },
      { name: 'Sangban', pattern: '.x..x..x..x..x..', sound: 'dunun' },
      { name: 'Dununba', pattern: 'x.......x.......', sound: 'dunun' }
    ] },

  // ── Gnawa (Morocco) ──
  { id: 'gnawa-full', name: 'Gnawa (Full Ensemble)', region: 'North Africa (Morocco)', bpm: 110, range: '90–130', steps: 12, family: 'gnawa',
    kick: 'x..x..x..x..', top: 'x.xx.xx.xx.x', sound: 'guembri', groove: 'tri:even', src: 'std',
    etymology: 'From "Guinea" → "Kanawa" (Hausa people) → "Gnawa". Originally "Black people" in Maghrebi Arabic. Descendants of sub-Saharan enslaved Africans.',
    note: 'Core Gnawa trio: guembri (3-string bass lute), qraqeb (iron castanets), ganga/tbel (large drum). 6/8 feel with 3:2 hemiola. All-night lila ceremony.',
    topLines: [
      { name: 'Guembri (bass lute)', pattern: 'x.xx.xx.xx.x', sound: 'bass' },
      { name: 'Qraqeb (castanets)', pattern: 'xx.xx.xx.xx.', sound: 'metal' },
      { name: 'Handclaps', pattern: 'x...x...x...', sound: 'clap' },
      { name: 'Ganga (large drum)', pattern: 'x.......x...', sound: 'dunun' }
    ] },

  // ── Ethiopian / Eritrean ──
  { id: 'ethio-tizita', name: 'Tizita (Major)', region: 'Ethiopia / Eritrea', bpm: 70, range: '60–80', steps: 12, family: 'ethio',
    kick: 'x.....x.....', top: 'x.x..x.x..x.', sound: 'kebero', groove: 'tri:even', src: 'std',
    etymology: 'Amharic "ትዝታ" (tizita) = "memory, nostalgia, longing". The most beloved qenet (mode). Also a song form.',
    note: 'Slow 6/8 (12/8) ballad feel. Kebero drum with swing. Krar/lyre arpeggios. "Ethiopian blues". Pentatonic tizita mode.',
    topLines: [
      { name: 'Kebero (drum)', pattern: 'x.x..x.x..x.', sound: 'dunun' },
      { name: 'Krar (lyre)', pattern: 'x...x.x...x.', sound: 'pluck' },
      { name: 'Masinko (fiddle)', pattern: '.x..x...x..x', sound: 'bow' },
      { name: 'Handclaps', pattern: '..x...x...x.', sound: 'clap' }
    ] },

  { id: 'ethio-ambassel', name: 'Ambassel', region: 'Ethiopia / Eritrea', bpm: 120, range: '110–130', steps: 12, family: 'ethio',
    kick: 'x..x..x..x..', top: 'xx.xx.xx.xx.', sound: 'kebero', groove: 'tri:even', src: 'std',
    etymology: 'Amharic "አምባሰል" (ambassel) — from the Ambassel woreda (district). A qenet with distinctive raised 4th.',
    note: 'Fast 6/8. Kebero plays dense pattern. Krar strums chords. Wedding and festival music. Distinctive "sharp" mode.',
    topLines: [
      { name: 'Kebero', pattern: 'xx.xx.xx.xx.', sound: 'dunun' },
      { name: 'Krar', pattern: 'x.x.x.x.x.x.', sound: 'pluck' },
      { name: 'Washint (flute)', pattern: '.x.x.x.x.x.x', sound: 'wind' }
    ] },

  { id: 'ethio-anchihoye', name: 'Anchihoye', region: 'Ethiopia / Eritrea', bpm: 90, range: '80–100', steps: 12, family: 'ethio',
    kick: 'x.....x.....', top: 'x.x...x.x...', sound: 'kebero', groove: 'tri:even', src: 'std',
    etymology: 'Amharic "ኣንቺሆዬ" (anchihoye) — "you (fem.) are mine". Romantic qenet, often for love songs.',
    note: 'Medium-tempo 6/8 with gentle swing. The "romantic" qenet. Masinko slides between notes. Kebero light.',
    topLines: [
      { name: 'Kebero', pattern: 'x.x...x.x...', sound: 'dunun' },
      { name: 'Masinko', pattern: 'x...x...x...', sound: 'bow' },
      { name: 'Krar', pattern: '.x..x..x..x.', sound: 'pluck' }
    ] },

  // ── Aka Pygmy (Central African Republic) ──
  // ── Burundi / Rwanda (Ingoma) ──
  // ── Zimbabwe (Mbira / Shona) ──

  { id: 'mbira-karigamombe', name: 'Karigamombe', region: 'Zimbabwe (Shona)', bpm: 110, range: '100–120', steps: 12, family: 'mbira',
    kick: 'x..x..x..x..', top: 'xx.xx.xx.xx.', sound: 'mbira', groove: 'tri:even', src: 'std',
    etymology: 'Shona "kariga mombe" = "undefeated by cattle" / "strong as a bull". Spirit of strength and resilience.',
    note: 'Powerful mbira piece for chiefs. Denser interlocking. Often played at kurova guva (bringing back spirit) ceremonies.',
    topLines: [
      // Pitch cells (`notes`, semitones above the part's key, in the instrument's E major tuning) are an
      // arrangement so the two interlocking players are audibly two voices, not a transcription.
      { name: 'Kushaura', pattern: 'xx.xx.xx.xx.', sound: 'mbira', notes: [0, 4, 7, 4, 2, 4, 9, 7] },
      { name: 'Kutsinhira', pattern: 'x.x.x.x.x.x.', sound: 'mbira', notes: [0, 7, 5, 7, 4, 7] },
      { name: 'Hosho', pattern: 'x...x...x...', sound: 'shaker' }
    ] },

  // ── Uganda / Baganda ──
  { id: 'baganda-akisoma', name: 'Akasiba / Baakisimba', region: 'Uganda (Baganda)', bpm: 120, range: '110–130', steps: 16, family: 'baganda',
    kick: 'x...x...x...x...', top: 'x.x..x.x.x..x.x.', sound: 'engalabi', groove: 'sw16:58', src: 'std',
    etymology: '"Baakisimba" = "the ones who dance" (aba + kisimba). "Akasiba" = small drum. Waist dance of the Baganda.',
    note: 'Waist-focused dance. Engalabi (long drum) lead. Namunjoloba (small drum) keeps pulse. Empunya (bass) on 1&3.',
    topLines: [
      { name: 'Engalabi (lead drum)', pattern: 'x.x..x.x.x..x.x.', sound: 'dunun' },
      { name: 'Namunjoloba (pulse)', pattern: 'x...x...x...x...', sound: 'dunun' },
      { name: 'Empunya (bass)', pattern: 'x.......x.......', sound: 'dunun' },
      { name: 'Endingidi (fiddle)', pattern: '.x.x.x.x.x.x.x.x', sound: 'bow' }
    ] },

  // ── Tanzania / Taarab ──
  // ── Cape Verde ──
  // ── Additional West African ──
  { id: 'agbadza', name: 'Agbadza (Ewe)', region: 'Ghana / Togo (Ewe)', bpm: 120, range: '110–130', steps: 12, family: 'ewe',
    kick: 'x..x..x..x..', top: 'x.x.x.x.x.x.', sound: 'kagan', groove: 'tri:even', src: 'std',
    etymology: 'Ewe "agba" = great/large + "dza" = dance. Originally warriors\' dance, now recreational.',
    note: 'Classic Ewe rhythm. Gankogui (bell) plays 7-stroke standard pattern. Kagan (high drum) + kidi (mid) + sogo (lead) + atsimevu (master).',
    topLines: [
      { name: 'Gankogui (bell)', pattern: 'x.x.xx.x.x.x', sound: 'metal' },
      { name: 'Kagan (high drum)', pattern: 'x.x.x.x.x.x.', sound: 'dunun' },
      { name: 'Kidi (mid drum)', pattern: '.x.x.x.x.x.x', sound: 'dunun' },
      { name: 'Sogo (lead drum)', pattern: 'x..x..x..x..', sound: 'dunun' },
      { name: 'Atsimevu (master)', pattern: 'x...x...x...', sound: 'dunun' }
    ] },

  { id: 'kete', name: 'Kete (Akan Royal)', region: 'Ghana (Akan/Asante)', bpm: 100, range: '90–110', steps: 16, family: 'akan',
    kick: 'x...x...x...x...', top: 'x.x..x.x.x..x.x.', sound: 'dawuro', groove: 'tri:even', src: 'std',
    etymology: 'Akan "kete" = the royal drum ensemble. Originally for Asantehene\'s court. Each drum has a spoken name.',
    note: 'Royal court ensemble. Dawuro (bell) timeline. 3-4 drums speak proverbs. Played for chiefs\' durbar. Each pattern = spoken phrase.',
    topLines: [
      { name: 'Kwadum (lead drum)', pattern: 'x.x..x.x.x..x.x.', sound: 'dunun' },
      { name: 'Apentemma (support)', pattern: '.x.x.x.x.x.x.x.x', sound: 'dunun' },
      { name: 'Petia (high drum)', pattern: 'x...x...x...x...', sound: 'dunun' }
    ] },

  { id: 'fontomfrom', name: 'Fontomfrom (Akan Talking Drums)', region: 'Ghana (Akan/Asante)', bpm: 90, range: '80–100', steps: 16, family: 'akan',
    kick: 'x...x...x...x...', top: 'x..x.x..x..x.x..', sound: 'atumpan', groove: 'tri:even', src: 'std',
    etymology: 'Akan "fontom" = message + "from" = drum. "Talking drums" — atumpan pair speaks Twi language tones.',
    note: 'Pair of atumpan (male/female) drums speak tonal language. Master drummer recites proverbs, history. For royal announcements.',
    topLines: [
      { name: 'Atumpan (male - low)', pattern: 'x..x.x..x..x.x..', sound: 'dunun' },
      { name: 'Atumpan (female - high)', pattern: '.x.x.x.x.x.x.x.x', sound: 'dunun' },
      { name: 'Apentemma', pattern: 'x...x...x...x...', sound: 'dunun' }
    ] },

  // ── Nigeria (Yoruba / Bata) ──
  // ── South Africa (Additional) ──
  { id: 'mbaqanga', name: 'Mbaqanga', region: 'South Africa', bpm: 115, range: '105–125', steps: 16, family: 'mbaqanga',
    kick: F, top: 'x.x..x.x.x.x..x.', sound: 'guitar', groove: 'sw16:58', src: 'std',
    etymology: 'Zulu "mbaqanga" = steamed corn bread (dumpling). "Township jive" — everyday food, everyday music.',
    note: '1960s–80s township pop. Electric guitar + bass + drums + brass. Cyclic 4-chord. Mahlathini & Mahotella Queens. Groove-heavy.',
    topLines: [
      { name: 'Guitar (lead)', pattern: 'x.x..x.x.x.x..x.', sound: 'pluck' },
      { name: 'Bass', pattern: 'x.x.x.x.x.x.x.x.', sound: 'bass' },
      { name: 'Brass section', pattern: 'x...x...x...x...', sound: 'wind' },
      { name: 'Drums', pattern: 'x...x...x...x...', sound: 'dunun' }
    ] },

  // ── East Africa (Additional) ──
  // ── Central Africa (Additional) ──
  // ── North Africa (Additional) ──
  // ── Existing Caribbean & Latin (enhanced with etymology) ──
  { id: 'dembow', name: 'Dembow', region: 'Caribbean & diaspora', bpm: 95, range: '88–110', steps: 16, family: 'dembow',
    kick: F, top: DEMBOW, sound: 'snare', groove: 'ab:Reggaeton Loose Accent 16th', src: 'std',
    etymology: 'From "Dem Bow" — the 1990 Shabba Ranks riddim produced by Steely & Clevie. "Dem bow" = Jamaican Patois "them bow" (they bow down).',
    note: 'From Shabba Ranks\' "Dem Bow" (1990, Steely & Clevie). Snare plays back half of tresillo against four-floor kick. Tresillo reached Caribbean from Central/West Africa via Cuban habanera.' },

  { id: 'dembow-rd', name: 'Dominican Dembow', region: 'Caribbean & diaspora', bpm: 120, range: '115–130', steps: 16, family: 'dembow',
    kick: F, top: '...x..xx...x..x.', sound: 'snare', groove: 'straight', src: 'approx',
    etymology: 'Dominican Republic\'s faster, stripped-down mutation of the Jamaican riddim. "Dem bow" → "dembow" as genre name.',
    note: 'Santo Domingo\'s faster, more repetitive take on the Jamaican riddim.' },

  { id: 'dancehall', name: 'Dancehall', region: 'Caribbean & diaspora', bpm: 100, range: '90–110', steps: 16, family: 'tresillo',
    kick: 'x.......x.......', top: 'X..X..X.X..X..X.', sound: 'snare', groove: 'ab:Dancehall Raggamuffin Accent 16ths', src: 'agr',
    etymology: 'Jamaican "dance hall" — open-air venues where sound systems played. 1980s digital "riddim" era (Sleng Teng).',
    note: 'Top lane is the accent pattern in Ableton\'s "Dancehall Raggamuffin" groove: a plain 3-3-2 tresillo.' },

  { id: 'soca', name: 'Soca', region: 'Caribbean & diaspora', bpm: 125, range: '115–135, power soca 160', steps: 16, family: 'cinquillo',
    kick: F, top: '..XXX.X...XX..X.', sound: 'snare', groove: 'ab:Soca Accent 16ths', src: 'agr',
    etymology: 'Trinidadian "sokah" = "soul of calypso". Coined by Lord Shorty (Garfield Blackman) 1970s: calypso + Indian chutney + funk.',
    note: 'Trinidad. Accents from Ableton\'s "Soca Accent" groove.' },

  { id: 'calypso', name: 'Calypso', region: 'Caribbean & diaspora', bpm: 110, range: '100–120', steps: 16, family: 'cinquillo',
    kick: 'x..x..x.x..x..x.', top: 'X.Xx.xxxX.Xx.oxo', sound: 'snare', groove: 'ab:Calypso Accent 16ths', src: 'agr',
    etymology: 'Trinidadian "kaiso" (West African "ka iso" = go on/continue) → "calypso". Or French "carrousseaux" (seed pods). African griot roots.',
    note: 'Trinidad. Top lane from Ableton\'s "Calypso Accent" groove; tresillo bass under it.' },

  { id: 'zouk', name: 'Zouk / Beguine', region: 'Caribbean & diaspora', bpm: 120, range: '110–130', steps: 16, family: 'cinquillo',
    kick: F, top: 'XX.X....XX.XX.X.', sound: 'snare', groove: 'ab:Beguine Accent 16ths', src: 'agr',
    etymology: 'French Antilles "zouker" = to party/dance all night. From "mazouk" (mazurka). Beguine = "white woman" (dance of mixed couples).',
    note: 'French Antilles. Accents from Ableton\'s "Beguine" groove; zouk grew out of beguine, gwo ka and kadans.' },

  { id: 'bomba', name: 'Bomba (Sicá)', region: 'Caribbean & diaspora', bpm: 100, range: '90–120', steps: 16, family: 'tresillo',
    kick: 'x.......x.......', top: 'X..XX...X..XX...', sound: 'tom', groove: 'ab:Bomba Accent 16ths', src: 'agr',
    etymology: 'Puerto Rican "bomba" = barrel/drum. From African "bombo" (Kikongo/Bantu). Sicá = 6/8 sub-style. Enslaved Africans\' communication.',
    note: 'Puerto Rico, of West and Central African descent. Accents from Ableton\'s "Bomba Accent" groove.' },

  { id: 'funk', name: 'Baile Funk (Tamborzão)', region: 'Caribbean & diaspora', bpm: 130, range: '125–150', steps: 16, family: 'samba',
    kick: 'x.......x.x.....', top: '...x..x.....x.x.', sound: 'tom', groove: 'straight', src: 'approx',
    etymology: 'Portuguese "baile funk" = funk ball/dance. "Tamborzão" = big tambor (drum). Rio favela sound. Miami bass + maculelê.',
    note: 'Rio. The tamborzão borrows from Miami bass and Afro-Brazilian maculelê drumming.' },

  { id: 'samba', name: 'Samba', region: 'Caribbean & diaspora', bpm: 100, range: '90–110 (as 2/4: 180–220)', steps: 16, family: 'samba',
    kick: 'x..xx..xx..xx..x', top: 'x.x.xx.x.x.x.xx.', sound: 'snare', groove: 'rs:samba', src: 'approx',
    etymology: 'Portuguese "samba" from Kimbundu (Angola) "semba" = navel touch / belly bump. Umbigada. Bantu root *semba.',
    note: 'Top lane is a tamborim-style teleco-teco. Try the samba suingue groove: the 3rd and 4th sixteenths of each beat arrive early.' },

  { id: 'afoxe', name: 'Afoxé (Ijexá Agogô)', region: 'Caribbean & diaspora', bpm: 107, range: '95–115', steps: 16, family: 'afoxe',
    kick: 'x.......x.......', top: 'X.X.x.X.Xx.Xx.X.', sound: 'snare', groove: 'ab:Perc Afoxe Agogo 8ths 107 bpm', src: 'agr',
    etymology: 'Yoruba "afoxé" = "the word is spoken" / "speech acts". Candomblé processional. "Ijexá" = Yoruba subgroup in Bahia. Agogô = double bell.',
    note: 'Bahia, Brazil, from Yoruba ijexá. Top lane is the first bar of Ableton\'s "Afoxe Agogo" groove.' },

  // ── Timelines & claves (region is where each comes from) ──
  { id: 'tresillo', name: 'Tresillo (3-3-2)', region: 'Cuba', bpm: 110, range: 'any', steps: 16, family: 'tresillo',
    kick: F, top: 'x..x..x.x..x..x.', sound: 'snare', groove: 'straight', src: 'std',
    etymology: 'Spanish "tresillo" = little three (triplet). Cuban name for 3+3+2 cell. African root: "standard pattern" (Arom).',
    note: 'The cell under most rows here. Found across sub-Saharan Africa and carried into Cuban, Caribbean and New Orleans music.' },

  { id: 'habanera', name: 'Habanera', region: 'Cuba', bpm: 100, range: '80–120', steps: 16, family: 'tresillo',
    kick: F, top: 'x..xx.x.x..xx.x.', sound: 'snare', groove: 'straight', src: 'std',
    etymology: 'Spanish "habanera" = from Havana (La Habana). Cuban contradanza → European salon. "Contradanza habanera". Bizet\'s Carmen.',
    note: 'Tresillo plus the backbeat. Called "congo" in parts of Cuba.' },

  { id: 'cinquillo', name: 'Cinquillo', region: 'Cuba & Haiti', bpm: 110, range: '90–130', steps: 16, family: 'cinquillo',
    kick: F, top: 'x.xx.xx.x.xx.xx.', sound: 'snare', groove: 'straight', src: 'std',
    etymology: 'Spanish "cinquillo" = little five (cinco). Cuban 5-stroke pattern. Tibwa (Antillean sticks) pattern. Haitian "cinq".',
    note: 'Five-stroke embellishment of the tresillo; the tibwa stick pattern of Antillean music.' },

  { id: 'son', name: 'Son Clave 3-2', region: 'Cuba', bpm: 100, range: '80–130', steps: 16, family: 'son-clave',
    kick: 'x.......x.......', top: 'x..x..x...x.x...', sound: 'snare', groove: 'straight', src: 'std',
    etymology: 'Cuban "son" = sound/voice. From "son cubano". 3-2 = three strokes first bar, two in second. Also Ga (Ghana) kpanlogo bell.',
    note: 'Also the kpanlogo bell of the Ga people of Ghana.' },

  { id: 'rumba', name: 'Rumba Clave 3-2', region: 'Cuba', bpm: 110, range: '90–140', steps: 16, family: 'son-clave',
    kick: 'x.......x.......', top: 'x..x...x..x.x...', sound: 'snare', groove: 'straight', src: 'std',
    etymology: 'Cuban "rumba" = party/spree. From Bantu "rumba" = to dance. 3-2 clave with 3rd stroke delayed. Central African roots.',
    note: 'Third stroke delayed by a sixteenth. Close to several Central African timelines.' },

  { id: 'bossa', name: 'Bossa Clave', region: 'Brazil (Rio)', bpm: 120, range: '100–140', steps: 16, family: 'son-clave',
    kick: 'x.....x.x.....x.', top: 'x..x..x...x..x..', sound: 'snare', groove: 'straight', src: 'std',
    etymology: 'Portuguese "bossa" = bump/hump/trend. "Bossa nova" = new trend. Jobim/Gilberto 1958. Son clave with last stroke delayed.',
    note: 'Son clave with the last stroke delayed.' },

  { id: 'bell12', name: 'Standard Bell (12/8)', region: 'Ghana & West Africa', bpm: 120, range: '100–160', steps: 12, family: 'bell12',
    kick: F12, top: 'x.x.xx.x.x.x', sound: 'metal', groove: 'tri:even', src: 'std',
    etymology: 'The "standard pattern" (Arom) / "standard bell" (Ewe gankogui). 7-stroke timeline. Ewe agbekor, Yoruba, Cuban bembé.',
    note: 'The seven-stroke bell of Ewe agbekor, Yoruba and Cuban bembé music, on a true 12-pulse grid with the kick on each dotted quarter. For a played feel try the jembe ternary groove, which applies Rainer Polak\'s measured short-medium-long subdivision from Malian drumming.' },

  // ── Ghana & West Africa (enhanced) ──
  { id: 'highlife', name: 'Highlife', region: 'Ghana & West Africa', bpm: 115, range: '100–130', steps: 16, family: 'son-clave',
    kick: 'x.......x.......', top: 'X..X..X.x.X.X...', sound: 'snare', groove: 'ab:Highlife Clave Accent 16ths', src: 'agr',
    etymology: 'Ghanaian "highlife" = elite lifestyle of 1920s coastal aristocracy. Palm-wine guitar → dance band. E.T. Mensah "King of Highlife".',
    note: 'Ghana. Accents from Ableton\'s "Highlife Clave" groove, which is the kpanlogo / son clave.' },

  { id: 'gahu', name: 'Gahu', region: 'Ghana & West Africa', bpm: 130, range: '120–150', steps: 16, family: 'son-clave',
    kick: F, top: 'x..x..x...x...x.', sound: 'snare', groove: 'straight', src: 'std',
    etymology: 'Ewe "gahu" = "money" / "rich". Adopted from Yoruba (Nigeria) via Badagry. Social dance with gankogui bell.',
    note: 'Ewe social dance; gankogui bell pattern.' },

  { id: 'azonto', name: 'Azonto', region: 'Ghana & West Africa', bpm: 125, range: '120–130', steps: 16, family: 'son-clave',
    kick: 'x..x..x...x.x...', top: '....x.......x.x.', sound: 'snare', groove: 'straight', src: 'approx',
    etymology: 'Ga (Accra) slang "azonto" = a way of life, swagger, "doing it with style". 2011 viral dance craze (Fuse ODG, Sarkodie).',
    note: 'Accra, early 2010s. Kick follows the kpanlogo clave.' },

  { id: 'coupe', name: 'Coupé-Décalé', region: 'Ghana & West Africa', bpm: 125, range: '120–135', steps: 16, family: 'kuduro',
    kick: F, top: '..xx..x...xx..x.', sound: 'snare', groove: 'straight', src: 'approx',
    etymology: 'Ivorian Nouchi (slang) "coupé" = to cheat/steal + "décalé" = to run off. "Cheat and run." DJ Lewis, Douk Saga. 2000s Abidjan/Paris.',
    note: 'Abidjan and Paris, 2000s. Built on Congolese ndombolo and zouglou.' },

  // ── Nigeria (enhanced) ──
  { id: 'afrobeats', name: 'Afrobeats', region: 'Nigeria', bpm: 104, range: '95–115', steps: 16, family: 'afrobeat',
    kick: 'x.....x.x.....x.', top: '...x..x...x.x...', sound: 'snare', groove: 'sw16:56', src: 'approx',
    etymology: '"Afrobeats" (plural) = 2000s+ Nigerian pop fusion (Wizkid, Davido, Burna Boy). Distinct from Fela\'s singular "Afrobeat". Coined by DJ Abrantee (UK).',
    note: 'Lagos pop. Rim plays a clave fragment over a sparse kick; usually a light 16th swing.' },

  { id: 'afrobeat', name: 'Afrobeat (Tony Allen)', mapLabel: 'Tony Allen', region: 'Nigeria', bpm: 110, range: '100–125', steps: 16, family: 'afrobeat',
    kick: 'x......x..x.....', top: '....x..o....x.o.', sound: 'snare', groove: 'sw16:56', src: 'approx',
    etymology: 'Fela Kuti\'s "Afrobeat" (singular) = African + jazz + funk + highlife. Tony Allen\'s drumming = "the engine". Political, extended grooves.',
    note: 'Fela Kuti\'s band. A sketch of Tony Allen\'s displaced kick and ghosted snare.' },

  { id: 'ponpon', name: 'Pon Pon', region: 'Nigeria', bpm: 100, range: '95–105', steps: 16, family: 'dembow',
    kick: 'x.......x.....x.', top: DEMBOW, sound: 'snare', groove: 'sw16:54', src: 'approx',
    etymology: 'Onomatopoeic "pon pon" = the sound of the kick drum. Mid-2010s Nigerian "pon pon" sound (Tekno, Runtown). Mellow dembow + half-time kick.',
    note: 'Mid-2010s Nigerian sound (Tekno, Runtown): a mellow dembow with a half-time kick.' },

  { id: 'zanku', name: 'Zanku / Street-Hop', region: 'Nigeria', bpm: 115, range: '110–125', steps: 16, family: 'gqom',
    kick: 'x..x..x.x..x..x.', top: '....x.......x...', sound: 'snare', groove: 'ab:Gqom Kick Accent 16ths 125 bpm', src: 'approx',
    etymology: 'Yoruba slang "zanku" = "leg work" dance (Zlatan Ibile). "Zanku" = rhythmic foot stomping. 2018+ Lagos street sound borrowing gqom kick.',
    note: 'Lagos street sound from 2018 on, borrowing gqom\'s broken tresillo kick.' },

  // ── Central Africa & Lusophone (enhanced) ──
  { id: 'kuduro', name: 'Kuduro', region: 'Central Africa & Lusophone', bpm: 138, range: '130–145', steps: 16, family: 'kuduro',
    kick: F, top: '..X.......XX..X.', sound: 'snare', groove: 'ab:Kuduro Perc Accent 16ths 130 bpm', src: 'agr',
    etymology: 'Angolan Portuguese "kuduro" = "cu duro" = hard ass / stiff bottom. "Rabo duro" = stiff tail. High-energy Luanda dance. 1990s+.',
    note: 'Luanda. Top lane is the accent pattern in Ableton\'s "Kuduro Perc Accent" groove, which also pushes those hits off the grid.' },

  { id: 'kuduro-sh', name: 'Kuduro Shuffle', region: 'Central Africa & Lusophone', bpm: 142, range: '135–145', steps: 16, family: 'kuduro',
    kick: F, top: 'xx.xx.x.xx.xx.x.', sound: 'snare', groove: 'ab:Kuduro Shuffled 16ths 142 bpm', src: 'agr',
    etymology: '"Shuffle" = the 5-stroke gallop per 2 beats (71% swing). Ableton\'s "Kuduro Shuffled 16ths" groove.',
    note: 'Ableton\'s "Kuduro Shuffled 16ths" groove has five strokes per two beats. The first off-beat 16th lands very late (about 71% swing) and the last 16th slightly early, giving the gallop. In Live: put 16th-note percussion in a clip, drop this groove on it, Timing 100%.' },

  { id: 'ndombolo', name: 'Ndombolo (Cavacha)', region: 'Central Africa & Lusophone', bpm: 130, range: '120–140', steps: 16, family: 'kuduro',
    kick: F, top: 'x.xxx.xxx.xxx.xx', sound: 'snare', groove: 'straight', src: 'std',
    etymology: 'Lingala "ndombolo" = sensual hip-shaking dance. From "kombola" = to twist/wriggle. Cavacha = the driving snare gallop.',
    note: 'Kinshasa. The cavacha snare gallop that drives the sebene of soukous and ndombolo.' },

  { id: 'bikutsi', name: 'Bikutsi', region: 'Central Africa & Lusophone', bpm: 150, range: '140–170', steps: 12, family: 'bell12',
    kick: F12, top: '.xx.xx.xx.xx', sound: 'snare', groove: 'tri:even', src: 'approx',
    etymology: 'Beti (Cameroon) "bikutsi" = "beat the ground" / "stomp the earth". Women\'s dance. 1980s+ pop (Tala Andre Marie).',
    note: 'Beti people, Cameroon. Fast 6/8 with the kick on every beat.' },

  { id: 'kizomba', name: 'Kizomba', region: 'Central Africa & Lusophone', bpm: 92, range: '85–95', steps: 16, family: 'dembow',
    kick: F, top: DEMBOW, sound: 'snare', groove: 'sw16:52', src: 'approx',
    etymology: 'Kimbundu (Angola) "kizomba" = party / celebration. From "kizomba" = a gathering. Zouk + semba. 1980s+ Luanda/Lisbon.',
    note: 'Angola. Same skeleton as zouk and dembow, slower and smoother.' },

  { id: 'tarraxinha', name: 'Tarraxinha / Tarraxo', region: 'Central Africa & Lusophone', bpm: 90, range: '80–96', steps: 16, family: 'tresillo',
    kick: 'x..x..x.x..x..x.', top: '....x.......x...', sound: 'bass', groove: 'sw16:52', src: 'approx',
    etymology: 'Portuguese "tarraxa" = screw/bolt. "Tarraxinha" = little screw. "Tarraxo" = screw motion. Lisbon/Angola. Heavy tresillo kick, minimal top.',
    note: 'Angola and Lisbon. Stripped-down, heavy tresillo kick.' },

  { id: 'batida', name: 'Batida', region: 'Central Africa & Lusophone', bpm: 135, range: '130–140', steps: 16, family: 'kuduro',
    kick: 'x..x..x.x..x..x.', top: '....x..x....x.x.', sound: 'tom', groove: 'ab:Kuduro Shuffled 16ths 142 bpm', src: 'approx',
    etymology: 'Portuguese "batida" = beat / hit. Lisbon\'s Afro-Portuguese club sound (Príncipe label: DJ Marfox, DJ Firmeza). Kuduro + tarraxo + funaná.',
    note: 'Lisbon\'s Afro-Portuguese club sound (Príncipe): kuduro, tarraxo and funaná with off-grid claps and 3-3-2 cross-rhythm.' },

  { id: 'funana', name: 'Funaná', region: 'Central Africa & Lusophone', bpm: 150, range: '140–160', steps: 16, family: 'kuduro',
    kick: F, top: '..xx..xx..xx..xx', sound: 'snare', groove: 'straight', src: 'approx',
    etymology: 'Cape Verdean "funaná" = from "funana" = accordion. Santiago island. Ferrinho (scraper) + accordion. Banned under Portuguese rule.',
    note: 'Santiago, Cape Verde. Accordion and scraped ferrinho.' },

  // ── South Africa (enhanced) ──
  { id: 'gqom', name: 'Gqom', region: 'South Africa', bpm: 120, range: '120–130', steps: 16, family: 'gqom',
    kick: 'xx..xx..xx.xx.xx', top: '..x...x.........', sound: 'clap', groove: 'ab:Gqom Kick Accent 16ths 125 bpm', src: 'audio',
    etymology: 'Zulu "gqom" = drum / hit / thud. Onomatopoeic. Durban taxi-rank sound. 2010s+ (DJ Lag, Rudeboyz). Broken 4/4, off-grid.',
    note: 'Transcribed by onset detection from John Bartmann\'s "Gqom Urban African" (CC BY-SA 4.0, 120 bpm), most common of its bars: kick in bursts of two sixteenths, one clap pair with a long gap, hats on displaced eighths. The bar start is a best guess (strongest kick). A stock-music take on the style, not a township production; see also the unison phrase below. Groove timing from Ableton\'s Gqom groove.',
    topLines: [
      { name: 'Clap', pattern: '..x...x.........', sound: 'clap' },
      { name: 'Hi-hat', pattern: 'x.x.x.x.x..x.ox.', sound: 'shaker' }
    ] },

  { id: 'gqom-unison', name: 'Gqom (unison phrase)', region: 'South Africa', bpm: 126, range: '120–130', steps: 16, family: 'gqom',
    kick: 'x..x.x...x..x.x.', top: 'x..x.x...x..x.x.', sound: 'clap', groove: 'ab:Gqom Kick Accent 16ths 125 bpm', src: 'audio',
    etymology: 'Zulu "gqom" = drum / hit / thud. The kick leaves holes instead of marking every beat, and the punch comes from layers hitting together.',
    note: 'Transcribed by onset detection from the "Gqom Demo" on Wikimedia Commons (CC BY-SA 4.0, 126 bpm): the same bar in 53 of 63 bars. Kick, clap and hat all hit one lopsided phrase, 3-2-4-3-2-2 sixteenths, with no four-on-the-floor. The bar start is a best guess (strongest kick). Hobbyist demo, not a township production.',
    topLines: [
      { name: 'Clap', pattern: 'x..x.x...x..x.x.', sound: 'clap' },
      { name: 'Hi-hat', pattern: 'x..x.x...x..x.x.', sound: 'shaker' }
    ] },

  { id: 'amapiano', name: 'Amapiano', region: 'South Africa', bpm: 112, range: '108–115', steps: 16, family: 'amapiano',
    kick: F, top: '..x..x.x..x..xx.', sound: 'bass', groove: 'sw16:56', src: 'approx',
    etymology: 'Zulu "amapiano" = a- (plural) + piano = "the pianos". Log drum (bass) sound. Gauteng 2010s+ (Kabza De Small, MFR Souls).',
    note: 'Gauteng. Top lane sketches a log drum line, so it defaults to the bass sound. Producer guides quote 54–58% swing on the shaker.' },

  { id: '3step', name: '3-Step', region: 'South Africa', bpm: 114, range: '112–118', steps: 16, family: 'amapiano',
    kick: 'x...x...x.......', top: '...x..x...x..x..', sound: 'tom', groove: 'sw16:54', src: 'approx',
    etymology: '"3-step" = three kicks per bar + gap. Between amapiano (4/4) and Afro house. Gauteng townships. Distinctive "missing" 4th kick.',
    note: 'Three kicks and a gap per bar, sitting between amapiano and Afro house.' },

  { id: 'bacardi', name: 'Bacardi', region: 'South Africa', bpm: 118, range: '110–125', steps: 16, family: 'bacardi',
    kick: F, top: 'x.xx.xx.x.xx.xxx', sound: 'snare', groove: 'straight', src: 'approx',
    etymology: 'Pretoria "Bacardi" = named after the rum / Bacardi House parties. DJ Spoko, Mujava. "Township tech" / "Bacardi house".',
    note: 'Pretoria (DJ Spoko, Mujava). Marching snare rolls over house kicks.' },

  { id: 'afrohouse', name: 'Afro House', region: 'South Africa', bpm: 122, range: '118–125', steps: 16, family: 'afrohouse',
    kick: F, top: '...x..x...x.x...', sound: 'snare', groove: 'ab:House Subtle Swung 16ths', src: 'approx',
    etymology: '"Afro house" = South African house (Culoe De Song, Black Coffee) + African percussion. Tresillo fragments over 4/4.',
    note: 'Percussion built from tresillo fragments over four on the floor, on a short, snappy 909-style snare. The pattern (hits on 3, 6, 10 and 12) is the one heard in Afro House by the app\'s owner, not taken from a published source.' },

  { id: 'afrohouse12', name: 'Afro House Triplet Perc', region: 'South Africa', bpm: 122, range: '118–125', steps: 12, family: 'afrohouse',
    kick: F12, top: 'X..X.X...x..', sound: 'tom', groove: 'ab:House African Perc Accent 8T 122 bpm', src: 'agr',
    note: 'Accents from Ableton\'s "House African Perc Accent 8T" groove: triplet percussion over a straight kick.' },

  { id: 'kwaito', name: 'Kwaito', region: 'South Africa', bpm: 105, range: '95–112', steps: 16, family: 'afrohouse',
    kick: F, top: '....x.......x.x.', sound: 'snare', groove: 'sw16:54', src: 'approx',
    etymology: 'Tsotsitaal "kwaito" = from "amakwaito" = gangster/thug. "Slow house" for township youth. 1990s post-apartheid (Arthur Mafokate).',
    note: 'Johannesburg, 1990s. Slowed-down house.' },

  { id: 'shangaan', name: 'Shangaan Electro', region: 'South Africa', bpm: 180, range: '175–190', steps: 16, family: 'shangaan',
    kick: F, top: '..xx..x...xx..x.', sound: 'tom', groove: 'straight', src: 'approx',
    etymology: 'Shangaan (Tsonga) people of Limpopo. "Shangaan electro" = traditional fast marimba/drums + synths. Nozinja. 180+ bpm.',
    note: 'Limpopo. Very fast, marimba and tom led.' },

  // ── East Africa & Indian Ocean (enhanced) ──
  { id: 'singeli', name: 'Singeli', region: 'East Africa & Indian Ocean', bpm: 220, range: '200–300', steps: 16, family: 'kuduro',
    kick: F, top: '..xx..xx..xx..xx', sound: 'snare', groove: 'straight', src: 'approx',
    etymology: 'Swahili "singeli" = single / solo. "Muziki wa singeli" = music for one (MC). Dar es Salaam boda-boda (motorbike) culture. 2000s+.',
    note: 'Dar es Salaam. Among the fastest club styles anywhere.' },

  { id: 'salegy', name: 'Salegy', region: 'East Africa & Indian Ocean', bpm: 160, range: '150–180', steps: 12, family: 'bell12',
    kick: F12, top: '..x.xx..x.xx', sound: 'snare', groove: 'rs:polak', src: 'approx',
    etymology: 'Malagasy "salegy" = from "salegny" = to dance/shake. Northern Madagascar. 6/8. Jaojoby "King of Salegy".',
    note: 'Northern Madagascar. Fast 6/8.' },

  { id: 'maloya', name: 'Maloya', region: 'East Africa & Indian Ocean', bpm: 110, range: '95–125', steps: 12, family: 'maloya',
    kick: 'x.....x.....', top: 'x.xx.xx.xx.x', sound: 'tom', groove: 'tri:even', src: 'approx',
    etymology: 'Réunion Creole "maloya" = from Malagasy "maloy" = to speak/chat. Slave plantation call-response. Banned until 1981. Danyèl Waro.',
    note: 'Réunion. Roulèr drum and kayamb shaker in 6/8.' },

  // ── North Africa (enhanced) ──
  { id: 'maqsum', name: 'Maqsum', region: 'North Africa', bpm: 100, range: '90–130 (mahraganat 110–130)', steps: 16, family: 'maqsum',
    kick: 'x.......x.......', top: '..x...x.....x...', sound: 'snare', groove: 'straight', src: 'std',
    etymology: 'Arabic "maqsum" = divided / cut. "Maqsum" rhythm = divided 4/4 (dum on 1&3, tek on 2&4+). Backbone of shaabi/mahraganat.',
    note: 'Egypt. Dum on the kick, tek on top. The backbone of shaabi and mahraganat.' },

  { id: 'saidi', name: 'Saidi', region: 'North Africa', bpm: 100, range: '90–120', steps: 16, family: 'maqsum',
    kick: 'x.....x.x.......', top: '..x.........x...', sound: 'snare', groove: 'straight', src: 'std',
    etymology: 'Arabic "sa\'idi" = from Upper Egypt (Sa\'id). Rural/folk style. Often with mizmar (oboe). Belly dance staple.',
    note: 'Upper Egypt.' },

  { id: 'malfuf', name: 'Malfuf', region: 'North Africa', bpm: 120, range: '110–140', steps: 16, family: 'dembow',
    kick: 'x.......x.......', top: DEMBOW, sound: 'snare', groove: 'straight', src: 'std',
    etymology: 'Arabic "malfuf" = wrapped/rolled. "Dum-tek-tek" = tresillo. Why it sits easily with dembow. Lebanese/Egyptian folk.',
    note: 'Egypt. Dum-tek-tek is a tresillo, which is why it sits so easily with dembow.' },

  { id: 'gnawa', name: 'Gnawa', region: 'North Africa', bpm: 110, range: '90–140', steps: 12, family: 'maloya',
    kick: F12, top: 'x.xx.xx.xx.x', sound: 'tom', groove: 'tri:even', src: 'approx',
    etymology: 'From "Guinea" → "Kanawa" (Hausa) → "Gnawa". "Black people" in Maghrebi Arabic. Sub-Saharan enslaved ancestors. Morocco.',
    note: 'Morocco. Qraqeb castanets gallop somewhere between triplets and 16ths.' },

  // ── Brazilian (Northeast & Afro-Brazilian) ──
  // Merged into samba/tresillo families where they share cells
  { id: 'baiao', name: 'Baião', region: 'Brazil (Northeast)', bpm: 100, range: '90–110', steps: 16, family: 'samba',
    kick: 'x...x...x...x...', top: 'x..x..x.x..x..x.', sound: 'zabumba', groove: 'straight', src: 'std',
    etymology: 'From "baiano" = from Bahia. Or Tupi "mbaião" = shaman\'s rattle. Luiz Gonzaga "King of Baião". Accordion + zabumba + triangle.',
    note: 'Sertão rhythm. Accordion-led. Zabumba (bass drum) plays tresillo-based pattern. Triangle keeps 16ths. Precursor to forró.',
    topLines: [
      { name: 'Zabumba (bass drum)', pattern: 'x..x..x.x..x..x.', sound: 'dunun' },
      { name: 'Triangle', pattern: 'xxxxxxxxxxxxxxxx', sound: 'metal' },
      { name: 'Accordion (bass)', pattern: 'x.x.x.x.x.x.x.x.', sound: 'pluck' }
    ] },

  { id: 'forro', name: 'Forró (Pe-de-serra)', region: 'Brazil (Northeast)', bpm: 110, range: '100–120', steps: 16, family: 'samba',
    kick: 'x...x...x...x...', top: 'x..x..x.x..x..x.', sound: 'zabumba', groove: 'sw16:52', src: 'std',
    etymology: 'From English "for all" → "forró" (balls for all). Or "forrobodó" = confusion/party. Baião sped up for dance halls.',
    note: 'Baião sped up. Accordion + zabumba + triangle. Close partner dance. Dominguinhos, Luiz Gonzaga.',
    topLines: [
      { name: 'Zabumba', pattern: 'x..x..x.x..x..x.', sound: 'dunun' },
      { name: 'Triangle', pattern: 'xxxxxxxxxxxxxxxx', sound: 'metal' },
      { name: 'Accordion', pattern: 'x.x.x.x.x.x.x.x.', sound: 'pluck' }
    ] },

  { id: 'maracatu', name: 'Maracatu Nação', region: 'Brazil (Pernambuco)', bpm: 90, range: '80–100', steps: 16, family: 'samba',
    kick: 'x...x...x...x...', top: 'x..x.x..x..x.x..', sound: 'alfaia', groove: 'straight', src: 'std',
    etymology: 'From "maracatu" = "batuque de maracá" (maraca drumming). Or Yoruba "maracatu" = royal procession. Afro-Brazilian coronation ceremony.',
    note: 'Recife/Olinda carnival. Alfaia (large rope-tuned bass drum) + gonguê (bell) + caixa (snare) + abê (shaker). Slow, majestic, royal.',
    topLines: [
      { name: 'Alfaia (bass drum)', pattern: 'x..x.x..x..x.x..', sound: 'dunun' },
      { name: 'Caixa (snare)', pattern: 'x.x.x.x.x.x.x.x.', sound: 'snare' },
      { name: 'Abê (shaker)', pattern: 'xxxxxxxxxxxxxxxx', sound: 'shaker' }
    ] },

  { id: 'partido-alto', name: 'Partido Alto', region: 'Brazil (Rio)', bpm: 110, range: '100–120', steps: 16, family: 'samba',
    kick: 'x..xx..xx..xx..x', top: 'x.x.x..x.x.x.x..', sound: 'pandeiro', groove: 'rs:samba', src: 'std',
    etymology: 'Portuguese "partido" = broken/divided + "alto" = high. "Broken high" — syncopated samba closest to Angolan umbigada roots.',
    note: 'Samba variant with distinctive pandeiro pattern. Call-response vocals. "Samba de partido alto" = improvised verses.',
    topLines: [
      { name: 'Pandeiro', pattern: 'x.x.x..x.x.x.x..', sound: 'shaker' },
      { name: 'Surdo (bass)', pattern: 'x..xx..xx..xx..x', sound: 'dunun' },
      { name: 'Repinique', pattern: 'x.x.x.x.x.x.x.x.', sound: 'snare' }
    ] },



  // ── Middle Eastern / Arab / Turkish ──
  // Merged into maqsum/dembow families where they share tresillo cells
  { id: 'baladi', name: 'Baladi (Masmoudi Saghir)', region: 'Egypt / Levant', bpm: 100, range: '90–110', steps: 16, family: 'maqsum',
    kick: 'x.......x.......', top: '..x.x...x...x...', sound: 'darbuka', groove: 'straight', src: 'std',
    etymology: 'Arabic "baladi" = of the country / rural / folk. "Masmoudi saghir" = small masmoudi. Americans call this "baladi"; Egyptians call many rhythms baladi.',
    note: 'The "little masmoudi" squeezed into 4/4. Dum on 1&3, tek-tak on 2&4. Earthy, grounded. Belly dance staple.',
    topLines: [
      { name: 'Darbuka', pattern: '..x.x...x...x...', sound: 'snare' },
      { name: 'Riq (tambourine)', pattern: 'x.x.x.x.x.x.x.x.', sound: 'metal' },
      { name: 'Daf (frame drum)', pattern: 'x...x...x...x...', sound: 'dunun' }
    ] },

  { id: 'masmoudi-kabir', name: 'Masmoudi Kabir (Big Masmoudi)', region: 'Egypt / Levant', bpm: 60, range: '50–70', steps: 16, family: 'maqsum',
    core: 'X.X...x.X...x...', coreName: 'Dum dum tek, dum tek',
    kick: 'x.......x.......', top: 'X.X...x.X...x...', sound: 'darbuka', groove: 'straight', src: 'std',
    etymology: '"Masmoudi" = from Masmud (Berber tribe). "Kabir" = big/large. 8/4 time (16 8ths). Tarab (classical) repertoire.',
    note: 'Slow 8/4. Two dum clusters. Used in muwashshah (classical vocal). "Walking masmoudi" fills gaps.',
    topLines: [
      { name: 'Darbuka', pattern: 'X.X...x.X...x...', sound: 'snare' },
      { name: 'Riq', pattern: 'x.x.x.x.x.x.x.x.', sound: 'metal' },
      { name: 'Daf', pattern: 'x.......x.......', sound: 'dunun' }
    ] },

  { id: 'nawari-dabke', name: 'Nawari / Dabke', region: 'Levant (Lebanon, Syria, Palestine)', bpm: 110, range: '100–120', steps: 16, family: 'dembow',
    kick: 'x.......x.......', top: '..x...x.....x...', sound: 'darbuka', groove: 'straight', src: 'std',
    etymology: '"Nawari" = Romani/Gypsy. "Dabke" = stamping of feet. Line dance. Stomping rhythm. Folk weddings, protests.',
    note: 'Fast 4/4 drive. Tek on upbeats. Line dance with synchronized stomps. Political resistance symbol.',
    topLines: [
      { name: 'Darbuka', pattern: '..x...x.....x...', sound: 'snare' },
      { name: 'Daf', pattern: 'x...x...x...x...', sound: 'dunun' },
      { name: 'Mijwiz (reed)', pattern: 'x.x.x.x.x.x.x.x.', sound: 'wind' }
    ] },

  { id: 'ayyub', name: 'Ayyub', region: 'Egypt / Levant', bpm: 120, range: '110–130', steps: 8, family: 'dembow',
    core: 'X..xX.x.', coreName: 'Dum tek dum tek',
    kick: 'x...x...', top: 'X..xX.x.', sound: 'darbuka', groove: 'straight', src: 'std',
    etymology: '"Ayyub" = Job (biblical). 2/4 fast rhythm. Trance/zār healing. Also called "zaar" rhythm.',
    note: 'Fast 2/4. Minimal: dum-tek-tek. Used in zār (spirit possession healing) and belly dance entrances.',
    topLines: [
      { name: 'Darbuka', pattern: 'X..xX.x.', sound: 'snare' },
      { name: 'Riq', pattern: 'x...x...', sound: 'metal' }
    ] },

  { id: 'samai-thaqil', name: 'Samai Thaqil (Heavy Samai)', region: 'Turkey / Arab Classical', bpm: 80, range: '70–90', steps: 10, family: 'samai',
    core: 'X..x.XXx..', coreName: 'Dum tek, dum dum tek (10/8)',
    kick: 'x....xx...', top: 'X..x.XXx..', sound: 'darbuka', groove: 'straight', src: 'std',
    etymology: 'Arabic "samai" = from Turkish "saz semai" = instrumental form. "Thaqil" = heavy/slow. 10/8 = 3+2+2+3. Muwashshah repertoire.',
    note: '10/8 classical form. 3+2+2+3 grouping. Slow, dignified. Instrumental overture for vocal muwashshah.',
    topLines: [
      { name: 'Darbuka', pattern: 'X..x.XXx..', sound: 'snare' },
      { name: 'Riq', pattern: 'x.x.x.x.x.', sound: 'metal' },
      { name: 'Keman (violin)', pattern: 'x....xx...', sound: 'bow' }
    ] },

  { id: 'samai-darij', name: 'Samai Darij (Light Samai)', region: 'Turkey / Arab Classical', bpm: 120, range: '110–130', steps: 12, family: 'samai',
    core: 'X.x.x.X.x...', coreName: 'Dum tek tek, dum tek',
    kick: 'x.....x.....', top: 'X.x.x.X.x...', sound: 'darbuka', groove: 'tri:even', src: 'std',
    etymology: '"Darij" = light/fast. 3/4 or 6/8 feel. Faster vocal samai. Lighter character.',
    note: '3/4 or 6/8 feel. Faster than thaqil. Vocal and instrumental repertoire.',
    topLines: [
      { name: 'Darbuka', pattern: 'X.x.x.X.x...', sound: 'snare' },
      { name: 'Riq', pattern: 'x.x.x.x.x.x.', sound: 'metal' }
    ] },

  { id: 'jurjina', name: 'Jurjina (Curcuna)', region: 'Iraq / Iran / Turkey', bpm: 100, range: '90–110', steps: 10, family: 'jurjina',
    core: 'X..x.X.x..', coreName: '3+2+2+3',
    kick: 'x....x....', top: 'X..x.X.x..', sound: 'darbuka', groove: 'straight', src: 'std',
    etymology: 'From "Gurj" = Georgia. Or "Jurjina" = Georgian woman. 10/8 = 2+2+2+2+2 or 3+3+2+2. Kurdish/Iraqi folk.',
    note: '10/8 driving rhythm. 5 groups of 2 or 3+3+2+2. Wedding dance. Chobi/Chopi line dance.',
    topLines: [
      { name: 'Darbuka', pattern: 'X..x.X.x..', sound: 'snare' },
      { name: 'Zurna (oboe)', pattern: 'x....x....', sound: 'wind' },
      { name: 'Daf', pattern: 'x....x....', sound: 'dunun' }
    ] },

  { id: 'kalamatianos', name: 'Kalamatianos', region: 'Greece', bpm: 100, range: '90–110', steps: 14, family: 'kalamatianos',
    core: 'X.o.o.X.o.X.o.', coreName: '3+2+2',
    kick: 'x.....x...x...', top: 'X.o.o.X.o.X.o.', sound: 'darbuka', groove: 'straight', src: 'std',
    etymology: 'Greek "Kalamatianos" = from Kalamata (Peloponnese). 7/8 = 3+2+2 (SQQ). Pan-Hellenic circle dance. Syrtos family.',
    note: '7/8 = 3+2+2. "Slow-quick-quick". Most popular Greek circle dance. 12-step pattern. Right foot leads.',
    topLines: [
      { name: 'Darbuka', pattern: 'x.x.x.x.x.x.x.', sound: 'snare' },
      { name: 'Laouto (lute)', pattern: 'x.....x...x...', sound: 'pluck' },
      { name: 'Lyra', pattern: 'x.x.x.x.x.x.x.', sound: 'bow' }
    ] },

  { id: 'karsilama', name: 'Karsilama (9/8)', region: 'Turkey / Greece / Balkans', bpm: 110, range: '100–120', steps: 18, family: 'karsilama',
    core: 'X.o.X.o.X.o.X.o.o.', coreName: '2+2+2+3',
    kick: 'x...x...x...x.....', top: 'X.o.X.o.X.o.X.o.o.', sound: 'darbuka', groove: 'straight', src: 'std',
    etymology: 'Turkish "karsilama" = face-to-face / greeting. 9/8 = 2+2+2+3. Couple dance. "Aksak" = limping.',
    note: '9/8 = 2+2+2+3 (QQQS). Face-to-face couple dance. Greek "karsilamas". Rom wedding music.',
    topLines: [
      { name: 'Darbuka', pattern: 'x.x.x.x.x.x.x.x.x.', sound: 'snare' },
      { name: 'Clarinet/Zurna', pattern: 'x...x...x...x.....', sound: 'wind' },
      { name: 'Daf', pattern: 'x...x...x...x.....', sound: 'dunun' }
    ] },

  { id: 'laz', name: 'Laz / Mantilatos (7/8)', region: 'Black Sea (Turkey/Georgia)', bpm: 120, range: '110–130', steps: 14, family: 'laz',
    core: 'X.o.X.o.X.o.o.', coreName: '2+2+3',
    kick: 'x...x...x.....', top: 'X.o.X.o.X.o.o.', sound: 'darbuka', groove: 'straight', src: 'std',
    etymology: '"Laz" = Laz people (Black Sea). "Mantilatos" = from Italian "mantello" = cloak. 7/8 = 3+2+2 or 2+2+3. Fast, energetic.',
    note: '7/8 Black Sea rhythm. Fast, driving. Horon (line dance). Knee lifts, sharp turns.',
    topLines: [
      { name: 'Darbuka', pattern: 'x.x.x.x.x.x.x.', sound: 'snare' },
      { name: 'Tulum (bagpipe)', pattern: 'x...x...x.....', sound: 'wind' },
      { name: 'Kemençe (fiddle)', pattern: 'x.x.x.x.x.x.x.', sound: 'bow' }
    ] },

  { id: 'chiftetelli', name: 'Chiftetelli (8/4)', region: 'Turkey / Greece / Arab World', bpm: 60, range: '50–70', steps: 16, family: 'chiftetelli',
    core: 'X..x..x.X.X.x...', coreName: 'Dum tek tek, dum dum tek',
    kick: 'x.......x.......', top: 'X..x..x.X.X.x...', sound: 'darbuka', groove: 'straight', src: 'std',
    etymology: 'Turkish "çiftetelli" = double-stringed (violin). Or "çifte" = pair + "telli" = stringed. Belly dance staple. Slow, sensual.',
    note: '8/4 slow belly dance rhythm. Similar to masmoudi but distinct feel. Taxim (improvisation) friendly.',
    topLines: [
      { name: 'Darbuka', pattern: 'X..x..x.X.X.x...', sound: 'snare' },
      { name: 'Riq', pattern: 'x.x.x.x.x.x.x.x.', sound: 'metal' },
      { name: 'Violin/Oud', pattern: 'x.......x.......', sound: 'bow' }
    ] },

  { id: 'dawr-hindi', name: 'Dawr Hindi / Devr-i Hindi (7/8)', region: 'Arab Classical / Turkey', bpm: 100, range: '90–110', steps: 14, family: 'dawr-hindi',
    core: 'X.x.x.X...x...', coreName: 'Dum tek tek, dum tek (3+2+2)',
    kick: 'x.....x.......', top: 'X.x.x.X...x...', sound: 'darbuka', groove: 'straight', src: 'std',
    etymology: '"Dawr hindi" = Indian cycle. "Devr-i hindi" = Ottoman Turkish for Indian cycle. 7/8 in muwashshah. Not actually Indian.',
    note: '7/8 classical form. 2+2+3 or 3+2+2. Named for exotic "Indian" association in Ottoman court.',
    topLines: [
      { name: 'Darbuka', pattern: 'X.x.x.X...x...', sound: 'snare' },
      { name: 'Riq', pattern: 'x.x.x.x.x.x.x.', sound: 'metal' },
      { name: 'Keman', pattern: 'x.....x.......', sound: 'bow' }
    ] },

  { id: 'wahda', name: 'Wahda (4/4)', region: 'Egypt / Levant', bpm: 90, range: '80–100', steps: 16, family: 'maqsum',
    core: 'X.....x.....x...', coreName: 'Dum tek tek (one dum per bar)',
    kick: 'x.......x.......', top: 'X.....x.....x...', sound: 'darbuka', groove: 'straight', src: 'std',
    etymology: 'Arabic "wahda" = one / single. "Wahda kebira" = big one (8/4). Basic tarab (art music) rhythm.',
    note: 'Simple 4/4. Dum-tek-tek-tek. Foundation for tarab. "Wahda kebira" = 8/4 version.',
    topLines: [
      { name: 'Darbuka', pattern: 'X.....x.....x...', sound: 'snare' },
      { name: 'Riq', pattern: 'x.x.x.x.x.x.x.x.', sound: 'metal' },
      { name: 'Oud', pattern: 'x.......x.......', sound: 'pluck' }
    ] },

  // ── Balkan Odd Meters ──
  { id: 'kopanitsa', name: 'Kopanitsa (11/16)', region: 'Bulgaria (Shopluk)', bpm: 160, range: '150–180', steps: 22, family: 'balkan-11',
    core: 'X.o.X.o.X.o.o.X.o.X.o.', coreName: '2+2+3+2+2',
    kick: 'x...x...x.....x...x...', top: 'X.o.X.o.X.o.o.X.o.X.o.', sound: 'tupan', groove: 'straight', src: 'std',
    etymology: 'Bulgarian "kopanitsa" = from "kopam" = to dig/hoe. "Digging dance." 11/16 = 2+2+3+2+2 (QQSQQ). Fast line dance.',
    note: '11/16 = 5 beats (2+2+3+2+2). "Quick-quick-slow-quick-quick." Shopluk region. Gankino horo = faster northern version.',
    topLines: [
      { name: 'Tupan (bass drum)', pattern: 'x...x...x.....x...x...', sound: 'dunun' },
      { name: 'Tambura (lute)', pattern: 'x.x.x.x.x.x.x.x.x.x.x.', sound: 'pluck' },
      { name: 'Gaida (bagpipe)', pattern: 'x...x...x.....x...x...', sound: 'wind' }
    ] },

  { id: 'rachenitsa', name: 'Rachenitsa (7/16)', region: 'Bulgaria', bpm: 180, range: '170–200', steps: 14, family: 'balkan-7',
    core: 'X.o.X.o.X.o.o.', coreName: '2+2+3',
    kick: 'x...x...x.....', top: 'X.o.X.o.X.o.o.', sound: 'tupan', groove: 'straight', src: 'std',
    etymology: 'Bulgarian "rachenitsa" = from "rachena" = arm/hand. "Arm dance" — hands on hips/shoulders. 7/16 = 2+2+3 (QQS). Solo/couple/choral.',
    note: '7/16 = 3 beats (2+2+3). "Quick-quick-slow." National dance. Regional variations: Macedonian (slow), Thracian (fast).',
    topLines: [
      { name: 'Tupan', pattern: 'x...x...x.....', sound: 'dunun' },
      { name: 'Tambura', pattern: 'x.x.x.x.x.x.x.', sound: 'pluck' },
      { name: 'Gadulka (fiddle)', pattern: 'x...x...x.....', sound: 'bow' }
    ] },

  { id: 'paidushko', name: 'Paidushko Horo (5/16)', region: 'Bulgaria / Macedonia', bpm: 200, range: '190–220', steps: 10, family: 'balkan-5',
    core: 'X.o.X.o.o.', coreName: '2+3',
    kick: 'x...x.....', top: 'X.o.X.o.o.', sound: 'tupan', groove: 'straight', src: 'std',
    etymology: 'Bulgarian "paidushko" = from "paidus" = child/lad. "Lad\'s dance." 5/16 = 2+3 (QS). Quick-slow heartbeat rhythm.',
    note: '5/16 = 2 beats (2+3). "Quick-slow" like rapid heartbeat. Simple but driving. Mixed-gender line dance.',
    topLines: [
      { name: 'Tupan', pattern: 'x...x.....', sound: 'dunun' },
      { name: 'Tambura', pattern: 'x.x.x.x.x.', sound: 'pluck' },
      { name: 'Gaida', pattern: 'x...x.....', sound: 'wind' }
    ] },

  { id: 'gankino', name: 'Gankino Horo (11/16 fast)', region: 'Bulgaria (Northern)', bpm: 200, range: '190–220', steps: 22, family: 'balkan-11',
    core: 'X.o.X.o.X.o.o.X.o.X.o.', coreName: '2+2+3+2+2',
    kick: 'x...x...x.....x...x...', top: 'X.o.X.o.X.o.o.X.o.X.o.', sound: 'tupan', groove: 'straight', src: 'std',
    etymology: '"Gankino" = from personal name Ganka. Northern Bulgarian fast kopanitsa. "Gankino horo" = Ganka\'s dance.',
    note: 'Faster northern kopanitsa. Same 2+2+3+2+2 but 200+ bpm. Virtuoso gaida/tambura.',
    topLines: [
      { name: 'Tupan', pattern: 'x...x...x.....x...x...', sound: 'dunun' },
      { name: 'Tambura', pattern: 'x.x.x.x.x.x.x.x.x.x.x.', sound: 'pluck' },
      { name: 'Gaida', pattern: 'x...x...x.....x...x...', sound: 'wind' }
    ] },

  { id: 'lesno', name: 'Lesno (7/8 slow)', region: 'Macedonia / Bulgaria', bpm: 90, range: '80–100', steps: 14, family: 'balkan-7',
    core: 'X.o.o.X.o.X.o.', coreName: '3+2+2',
    kick: 'x.....x...x...', top: 'X.o.o.X.o.X.o.', sound: 'tupan', groove: 'straight', src: 'std',
    etymology: 'Macedonian "lesno" = easy/simple. Slow 7/8 = 3+2+2. "Macedonian ruchenitsa." Wedding dance.',
    note: 'Slow 7/8 (3+2+2). Easier "Macedonian ruchenitsa." Weighted steps. Often at weddings.',
    topLines: [
      { name: 'Tupan', pattern: 'x.....x...x...', sound: 'dunun' },
      { name: 'Tambura', pattern: 'x.x.x.x.x.x.x.', sound: 'pluck' },
      { name: 'Kaval (flute)', pattern: 'x.....x...x...', sound: 'wind' }
    ] },

  { id: 'daychovo', name: 'Daychovo Horo (9/16)', region: 'Bulgaria (Thrace)', bpm: 140, range: '130–150', steps: 18, family: 'balkan-9',
    core: 'X.o.X.o.X.o.X.o.o.', coreName: '2+2+2+3',
    kick: 'x...x...x...x.....', top: 'X.o.X.o.X.o.X.o.o.', sound: 'tupan', groove: 'straight', src: 'std',
    etymology: '"Daychovo" = from "Daycho" (personal name). Thracian 9/16 = 2+2+2+3. "Quick-quick-quick-slow."',
    note: '9/16 = 4 beats (2+2+2+3). Thracian style. Fast, energetic. Often transitions to rachenitsa.',
    topLines: [
      { name: 'Tupan', pattern: 'x...x...x...x.....', sound: 'dunun' },
      { name: 'Tambura', pattern: 'x.x.x.x.x.x.x.x.x.', sound: 'pluck' },
      { name: 'Gaida', pattern: 'x...x...x...x.....', sound: 'wind' }
    ] },

  { id: 'sedi-donka', name: 'Sedi Donka (25/16)', region: 'Bulgaria', bpm: 120, range: '110–130', steps: 50, family: 'balkan-complex',
    core: 'X.o.o.X.o.X.o.X.o.o.X.o.X.o.X.o.X.o.X.o.o.X.o.X.o.', coreName: '7+7+11 (3+2+2, 3+2+2, 2+2+3+2+2)',
    kick: 'x.....x...x...x.....x...x...x...x...x.....x...x...', top: 'X.o.o.X.o.X.o.X.o.o.X.o.X.o.X.o.X.o.X.o.o.X.o.X.o.', sound: 'tupan', groove: 'straight', src: 'std',
    etymology: '"Sedi Donka" = "Donka sits." 25/16 = 7/16 + 11/16 + 7/16 (SQQ + QQSQQ + SQQ). Mixed meter masterpiece.',
    note: '25/16 = mixed meter: 7/16 + 11/16 + 7/16. "SQQ + QQSQQ + SQQ." One of the most complex Balkan dances. Vocal version exists.',
    topLines: [
      { name: 'Tupan', pattern: 'x.....x...x...x.....x...x...x...x...x.....x...x...', sound: 'dunun' },
      { name: 'Voice (call)', pattern: 'x.x.x.x.x.x.x.x.x.x.x.x.x.x.x.x.x.x.x.x.x.x.x.x.x.', sound: 'voice' }
    ] },

  // ── Indian Classical Talas ──
  { id: 'misra-chapu', name: 'Misra Chapu (7/8)', region: 'South India (Carnatic)', bpm: 80, range: '70–90', steps: 14, family: 'tala-7',
    core: 'X.o.o.X.o.X.o.', coreName: '3+2+2',
    kick: 'x.....x...x...', top: 'X.o.o.X.o.X.o.', sound: 'mridangam', groove: 'straight', src: 'std',
    etymology: 'Sanskrit "misra" = mixed/7 + "chapu" = beat/clap. 7 beats = 3+2+2 (tali-khali-tali). No anga structure — pure clap-wave.',
    note: '7 beats = 3+2+2. Clap on 1, wave on 4, clap on 6. Padams, javalis. "Ta-ka di-mi ta-ki-ta." Distinctive lilt.',
    topLines: [
      { name: 'Mridangam', pattern: 'x.x.x.x.x.x.x.', sound: 'dunun' },
      { name: 'Ghatam (clay pot)', pattern: 'x.....x...x...', sound: 'metal' },
      { name: 'Kanjira (frame drum)', pattern: 'x.x.x.x.x.x.x.', sound: 'snare' }
    ] },


  { id: 'rupak-tala', name: 'Rupak Tala (7/8)', region: 'North India (Hindustani)', bpm: 80, range: '70–90', steps: 14, family: 'tala-7',
    core: 'X.o.o.X.o.X.o.', coreName: '3+2+2',
    kick: 'x.....x...x...', top: 'X.o.o.X.o.X.o.', sound: 'tabla', groove: 'straight', src: 'std',
    etymology: 'Sanskrit "rupak" = beautiful/form. 7 beats = 3+2+2 (khali-tali-tali). Wave on 1, claps on 4&6. Mughlai/Roopak.',
    note: '7 beats = 3+2+2 but starts on KHALI (wave) = beat 1 is empty. Unique "offbeat" start. Bhajans, khayal.',
    topLines: [
      { name: 'Tabla (dayan/bayan)', pattern: 'x.x.x.x.x.x.x.', sound: 'dunun' },
      { name: 'Harmonium', pattern: 'x.....x...x...', sound: 'pluck' },
      { name: 'Manjira (cymbals)', pattern: 'x.x.x.x.x.x.x.', sound: 'metal' }
    ] },

  { id: 'ektal', name: 'Ektal (12/8)', region: 'North India (Hindustani)', bpm: 60, range: '50–70', steps: 12, family: 'tala-12',
    core: 'XoooXoooXoXo', coreName: 'Claps on 1, 5, 9, 11',
    kick: 'x..x..x..x..', top: 'XoooXoooXoXo', sound: 'tabla', groove: 'tri:even', src: 'std',
    etymology: 'Sanskrit "eka" = one + "tal" = clap. 12 beats = 2+2+2+2+2+2. 6 vibhags. Khayal, dhrupad. "Chautal" = 12-beat cousin.',
    note: '12 beats = 6 groups of 2. Clap-wave-clap-wave-clap-wave. Slow, stately. Dhrupad, khayal accompaniment.',
    topLines: [
      { name: 'Tabla', pattern: 'x.x.x.x.x.x.', sound: 'dunun' },
      { name: 'Pakhavaj', pattern: 'x..x..x..x..', sound: 'dunun' },
      { name: 'Manjira', pattern: 'x.x.x.x.x.x.', sound: 'metal' }
    ] },

  { id: 'jhaptal', name: 'Jhaptal (10/8)', region: 'North India (Hindustani)', bpm: 100, range: '90–110', steps: 20, family: 'tala-10',
    core: 'X.o.X.o.o.X.o.X.o.o.', coreName: '2+3+2+3',
    kick: 'x...x.....x...x.....', top: 'X.o.X.o.o.X.o.X.o.o.', sound: 'tabla', groove: 'straight', src: 'std',
    etymology: 'Sanskrit "jhap" = 10 + "tal" = clap. 10 beats = 2+3+2+3. Uneven vibhags. Khayal, tarana. Distinctive swing.',
    note: '10 beats = 2+3+2+3. Clap on 1, wave on 3, clap on 6, wave on 8. Asymmetric swing feel.',
    topLines: [
      { name: 'Tabla', pattern: 'x.x.x.x.x.x.x.x.x.x.', sound: 'tabla' },
      { name: 'Sitar', pattern: 'x...x.....x...x.....', sound: 'pluck' },
      { name: 'Manjira', pattern: 'x.x.x.x.x.x.x.x.x.x.', sound: 'metal' }
    ] },

  { id: 'teental', name: 'Teental (16 beats)', region: 'North India (Hindustani)', bpm: 90, range: '80–140', steps: 16, family: 'tala-16',
    core: 'X...X...o...X...', coreName: 'Tali 1, 5, 13 · khali 9',
    kick: 'x...x...x...x...', top: 'XxxxXxxxxooooxxX', sound: 'tabla', groove: 'straight', src: 'std',
    etymology: 'Hindi "tin" = three + "tal" = three claps (beats 1, 5, 13). "Tintal" — the most-used tala in Hindustani music. 16 beats = 4 vibhags of 4.',
    note: '16 beats = 4×4. Sam on 1; tali on 5 & 13; khali (wave) on 9. Theka: "Dha Dhin Dhin Dha | Dha Dhin Dhin Dha | Dha Tin Tin Ta | Ta Dhin Dhin Dha." Khayal, instrumental, kathak.',
    topLines: [
      { name: 'Tabla (theka)', pattern: 'XxxxXxxxxooooxxX', sound: 'tabla' },
      { name: 'Bansuri (flute)', pattern: 'x...x...x...x...', sound: 'wind' },
      { name: 'Manjira', pattern: 'x.x.x.x.x.x.x.x.', sound: 'metal' }
    ] },

  { id: 'keharwa', name: 'Keharwa (8 beats)', region: 'North India (Hindustani)', bpm: 120, range: '100–160', steps: 16, family: 'tala-8',
    core: 'X.......o.......', coreName: 'Tali 1 · khali 5 (4+4)',
    kick: 'x.......x.......', top: 'X.x.x.o.x.o.x.o.', sound: 'tabla', groove: 'straight', src: 'std',
    etymology: 'Named for the Kahar caste of palanquin-bearers whose work songs set this cycle. The default tala of folk, bhajan and film songs. 8 beats = 4+4.',
    note: '8 beats = 4+4, tali on 1, khali on 5. Theka: "Dha Ge Na Ti | Na Ka Dhi Na." Behind almost every Hindi film song.',
    topLines: [
      { name: 'Tabla (theka)', pattern: 'X.x.x.o.x.o.x.o.', sound: 'tabla' },
      { name: 'Dholak', pattern: 'x..x..x.x..x..x.', sound: 'tupan' },
      { name: 'Harmonium', pattern: 'x.......x.......', sound: 'pluck' },
      { name: 'Manjira', pattern: 'x.x.x.x.x.x.x.x.', sound: 'metal' }
    ] },

  { id: 'dadra', name: 'Dadra (6 beats)', region: 'North India (Hindustani)', bpm: 100, range: '90–130', steps: 12, family: 'tala-6',
    core: 'X.....o.....', coreName: 'Tali 1 · khali 4 (3+3)',
    kick: 'x.....x.....', top: 'X.x.x.X.o.x.', sound: 'tabla', groove: 'straight', src: 'std',
    etymology: 'From the Dadra folk dance of Bundelkhand (UP). Light classical tala of thumri, ghazal and the semi-classical dadra song form. 6 beats = 3+3.',
    note: '6 beats = 3+3, tali on 1, khali on 4. Theka: "Dha Dhin Na | Dha Tu Na." Lilting, songful; thumri at its sweetest.',
    topLines: [
      { name: 'Tabla (theka)', pattern: 'X.x.x.X.o.x.', sound: 'tabla' },
      { name: 'Sarangi', pattern: 'x.....x.....', sound: 'bow' },
      { name: 'Manjira', pattern: 'x.x.x.x.x.x.', sound: 'metal' }
    ] },

  { id: 'deepchandi', name: 'Deepchandi (14 beats)', region: 'North India (Hindustani)', bpm: 70, range: '60–90', steps: 14, family: 'tala-14',
    core: 'X..X...o..X...', coreName: '3+4+3+4 · tali 1, 4, 11 · khali 8',
    kick: 'x..x......x...', top: 'Xx.xxo.oo.xxxx', sound: 'tabla', groove: 'straight', src: 'std',
    etymology: 'Persian/Hindi "dip" = lamp + "chand" = moon: lamp-and-moon, the romantic 14-beat tala. Also "chachar"/"ada chautal" in cousin forms. Thumri, ghazal.',
    note: '14 beats = 3+4+3+4, tali on 1, 4 & 11, khali on 8. Theka: "Dha Dhin – | Dha Dha Tin – | Ta Tin – | Dha Dha Dhin Dhin." Slow, lilting, semiclassical.',
    topLines: [
      { name: 'Tabla (theka)', pattern: 'Xx.xxo.oo.xxxx', sound: 'tabla' },
      { name: 'Sarangi', pattern: 'x..x......x...', sound: 'bow' },
      { name: 'Manjira', pattern: 'x.x.x.x.x.x.x.', sound: 'metal' }
    ] },

  { id: 'adi-tala', name: 'Adi Tala (8 beats)', region: 'South India (Carnatic)', bpm: 100, range: '80–140', steps: 16, family: 'tala-8',
    core: 'X.......X.o.X.o.', coreName: 'Laghu 4 + 2 drutam (claps 1, 5, 7)',
    kick: 'x.......x...x...', top: 'X.x.x.o.X.o.X.o.', sound: 'mridangam', groove: 'straight', src: 'std',
    etymology: 'Sanskrit "adi" = prime, first — the first tala every Carnatic student learns and the commonest in the whole repertoire. 8 beats = laghu (4) + drutam + drutam.',
    note: '8 beats: clap-count 2-3-4 on 1, clap on 5, wave 6, clap 7, wave 8. Kritis, varnams, everything. Mridangam sollukattu: "tha ka dhi mi tha ka tha ki."',
    topLines: [
      { name: 'Mridangam', pattern: 'X.x.x.o.X.o.X.o.', sound: 'mridangam' },
      { name: 'Ghatam', pattern: 'x.....x.x.....x.', sound: 'metal' },
      { name: 'Kanjira', pattern: '..x...x...x...x.', sound: 'snare' }
    ] },

  { id: 'khanda-chapu', name: 'Khanda Chapu (5 beats)', region: 'South India (Carnatic)', bpm: 80, range: '70–100', steps: 10, family: 'tala-5',
    core: 'X...o.....', coreName: '2+3',
    kick: 'x...x.....', top: 'X.x.x.o.x.', sound: 'mridangam', groove: 'straight', src: 'std',
    etymology: 'Sanskrit "khanda" = five. Chapu tala: 5 beats counted 2+3 ("ta-ka ta-ki-ta"), no full anga structure. Light, brisk: tillanas, javalis, folk.',
    note: '5 beats = 2+3, clap on 1, wave on 3. Distinct lurching gait: "ta-ka | ta-ki-ta". Brother of misra chapu (7 = 3+2+2).',
    topLines: [
      { name: 'Mridangam', pattern: 'X.x.x.o.x.', sound: 'mridangam' },
      { name: 'Ghatam', pattern: 'x...x.x...', sound: 'metal' },
      { name: 'Kanjira', pattern: 'x.x.x.x.x.', sound: 'snare' }
    ] },

  { id: 'bhangra', name: 'Bhangra (dhol chaal)', region: 'Punjab (Bhangra)', bpm: 130, range: '120–150', steps: 16, family: 'bhangra',
    core: 'X...X...X...X...', coreName: 'Dhol chaal 4/4',
    kick: 'x.......x.......', top: 'X.x.x.x.x.x.x.x.', sound: 'tupan', groove: 'straight', src: 'std',
    etymology: 'Punjabi "bhangra" from "bhanga" — the harvesting dance of Punjabi farmers, now the diaspora dancefloor sound. Driven by the dhol, a two-headed barrel drum played with sticks.',
    note: '4/4 dhol "chaal" (walk): bass "dum" on 1 and 3, treble "na" 8ths on top, tumbi riffing over it. The engine of Punjabi dance music and UK bhangra.',
    topLines: [
      { name: 'Dhol bass (dum)', pattern: 'x.......x.......', sound: 'tupan' },
      { name: 'Dhol treble (na)', pattern: 'X.x.x.x.x.x.x.x.', sound: 'tabla' },
      { name: 'Tumbi (lead pluck)', pattern: 'x..x..x.x..x..x.', sound: 'pluck' }
    ] },

  // ── Flamenco (Andalusian) ──
  // Merges into 12/8 bell family (soleá, bulerías share 12-beat compás)
  { id: 'solea', name: 'Soleá (12-beat)', region: 'Andalusia (Flamenco)', bpm: 80, range: '70–90', steps: 12, family: 'bell12',
    core: '..X..X.X.X.X', coreName: 'Compás accents 3, 6, 8, 10, 12',
    kick: 'x..x..x..x..', top: '..X..X.X.X.X', sound: 'cajon', groove: 'straight', src: 'std',
    etymology: 'Spanish "soleá" = from "soledad" = solitude/loneliness. Mother of flamenco palos. 12-beat compás = 3+3+2+2+2.',
    note: '12-beat compás = 3+3+2+2+2 (accents on 3,6,8,10,12). Deep, solemn. Cante jondo. "Mother of all palos."',
    topLines: [
      { name: 'Cajón', pattern: '..x..x.x.x.x', sound: 'dunun' },
      { name: 'Palmas (handclaps)', pattern: '..X..X.X.X.X', sound: 'clap' },
      { name: 'Guitar (rasgueado)', pattern: 'x..x..x..x..', sound: 'pluck' }
    ] },

  { id: 'bulerias', name: 'Bulerías (12-beat fast)', region: 'Andalusia (Flamenco)', bpm: 220, range: '200–240', steps: 12, family: 'bell12',
    core: 'X..X..X.X.X.', coreName: 'Compás accents 12, 3, 6, 8, 10',
    kick: 'x..x..x..x..', top: 'X..X..X.X.X.', sound: 'cajon', groove: 'straight', src: 'std',
    etymology: 'Spanish "bulería" = from "burlar" = to mock/jest. Festive, fast 12-beat. Party finale. Jerez/Gitano heartland.',
    note: 'Fast 12-beat (220+ bpm). Same compás as soleá but playful. "Fiesta" rhythm. Offbeat accents. Palmas on 12,3,6,8,10.',
    topLines: [
      { name: 'Cajón', pattern: 'x..x..x.x.x.', sound: 'dunun' },
      { name: 'Palmas', pattern: 'X..X..X.X.X.', sound: 'clap' },
      { name: 'Guitar', pattern: 'x..x..x..x..', sound: 'pluck' }
    ] },

  { id: 'alegrias', name: 'Alegrías (12-beat major)', region: 'Andalusia (Flamenco)', bpm: 100, range: '90–110', steps: 12, family: 'bell12',
    core: '..X..X.X.X.X', coreName: 'Compás accents 3, 6, 8, 10, 12',
    kick: 'x..x..x..x..', top: '..X..X.X.X.X', sound: 'cajon', groove: 'straight', src: 'std',
    etymology: 'Spanish "alegría" = joy. Major key 12-beat. Cádiz origin. Lighter than soleá. "Alegrías de Cádiz."',
    note: 'Major key 12-beat compás. Same accent structure as soleá (3,6,8,10,12) but major mode. Dancing, festive.',
    topLines: [
      { name: 'Cajón', pattern: '..x..x.x.x.x', sound: 'dunun' },
      { name: 'Palmas', pattern: '..X..X.X.X.X', sound: 'clap' },
      { name: 'Guitar', pattern: 'x..x..x..x..', sound: 'pluck' }
    ] },

  { id: 'tangos-flamenco', name: 'Tangos Flamenco (4/4)', region: 'Andalusia (Flamenco)', bpm: 120, range: '110–130', steps: 16, family: 'tangos',
    core: '....X...X...X...', coreName: 'Accents on 2, 3, 4',
    kick: 'x...x...x...x...', top: '....X...X...X...', sound: 'cajon', groove: 'straight', src: 'std',
    etymology: 'African "tango" = drum/dance place. Or Cuban "tango" = touch. 4/4 flamenco. Not Argentine tango. Gitano wedding rhythm.',
    note: '4/4 flamenco (not Argentine). Cajón + palmas. "Tangos de Málaga/Granada." Playful, sensual. 120 bpm.',
    topLines: [
      { name: 'Cajón', pattern: 'x.x.x.x.x.x.x.x.', sound: 'dunun' },
      { name: 'Palmas', pattern: 'x.x.x.x.x.x.x.x.', sound: 'clap' },
      { name: 'Guitar', pattern: 'x...x...x...x...', sound: 'pluck' }
    ] },


  // ── Caribbean / Latin Additions ──
  { id: 'bomba-sica', name: 'Bomba Sicá (6/8)', region: 'Puerto Rico', bpm: 100, range: '90–110', steps: 12, family: 'bomba',
    kick: 'x..x..x..x..', top: 'x.x.xx.x.x.x', sound: 'barril', groove: 'tri:even', src: 'std',
    etymology: '"Sicá" = 6/8 sub-style of bomba. "Bomba" = barrel drum (Kikongo "bombo"). Enslaved Africans\' communication. Santurce, Loíza.',
    note: '6/8 bomba. Barril (barrel drum) lead + buleador (accompaniment) + cuá (sticks) + maraca. Dancer "piquetes" challenge drummer.',
    topLines: [
      { name: 'Barril (lead)', pattern: 'x.x.xx.x.x.x', sound: 'dunun' },
      { name: 'Buleador (accomp.)', pattern: 'x..x..x..x..', sound: 'dunun' },
      { name: 'Cuá (sticks)', pattern: 'xxxxxxxxxxxx', sound: 'metal' },
      { name: 'Maraca', pattern: 'x...x...x...', sound: 'shaker' }
    ] },

  { id: 'merengue', name: 'Merengue (Dominican)', region: 'Dominican Republic', bpm: 140, range: '130–150', steps: 16, family: 'dembow',
    kick: F, top: 'x.xxx.xxx.xxx.xx', sound: 'tambora', groove: 'straight', src: 'std',
    etymology: 'French "meringue" = whipped egg whites. Or African "merengue" = dance. Haitian "méring" influence. Nacional rhythm. 1840s+.',
    note: 'Fast 4/4. Tambora (double-headed drum) + güira + accordion. "Merengue típico" = perico ripiao. 140+ bpm.',
    topLines: [
      { name: 'Tambora', pattern: 'x.x.x.x.x.x.x.x.', sound: 'dunun' },
      { name: 'Güira (scraper)', pattern: 'x.xxx.xxx.xxx.xx', sound: 'scraper' },
      { name: 'Accordion', pattern: 'x.x.x.x.x.x.x.x.', sound: 'pluck' }
    ] },

  { id: 'cumbia', name: 'Cumbia', region: 'Colombia (Caribbean Coast)', bpm: 100, range: '90–110', steps: 16, family: 'dembow',
    kick: 'x...x...x...x...', top: 'x.xxx.xxx.xxx.xx', sound: 'tambora', groove: 'sw16:52', src: 'std',
    etymology: 'African "cumbé" = dance/celebration. Or "cumbe" = Kikongo for navel. Indigenous (gaita) + African (drum) + European (accordion).',
    note: 'Gaita (cactus flute) + tambora + llamador + maracas. "Cumbia clásica" instrumental. "Cumbia villera" = Argentine shantytown style.',
    topLines: [
      { name: 'Tambora (bass)', pattern: 'x...x...x...x...', sound: 'dunun' },
      { name: 'Llamador (mid)', pattern: '..x...x...x...x.', sound: 'snare' },
      { name: 'Gaita (flute)', pattern: 'x.x.x.x.x.x.x.x.', sound: 'wind' },
      { name: 'Maracas', pattern: 'x.xxx.xxx.xxx.xx', sound: 'shaker' }
    ] },

  // ── Additional African (filling gaps) ──
  { id: 'akpoka', name: 'Akpoka (Ewe)', region: 'Ghana/Togo (Ewe)', bpm: 130, range: '120–140', steps: 12, family: 'ewe',
    kick: 'x..x..x..x..', top: 'x.x.xx.x.x.x', sound: 'kagan', groove: 'tri:even', src: 'std',
    etymology: 'Ewe "akpoka" = "the thing that disturbs" or "upheaval." Social dance, not ritual. Modern Ewe recreational.',
    note: 'Recreational Ewe rhythm. Gankogui + kagan + kidi + sogo + atsimevu. Faster than agbadza. Youth dance.',
    topLines: [
      { name: 'Gankogui', pattern: 'x.x.xx.x.x.x', sound: 'metal' },
      { name: 'Kagan', pattern: 'x.x.x.x.x.x.', sound: 'dunun' },
      { name: 'Sogo (lead)', pattern: 'x..x..x..x..', sound: 'dunun' },
      { name: 'Atsimevu', pattern: 'x...x...x...', sound: 'dunun' }
    ] },

  { id: 'atsiagbeko', name: 'Atsiagbeko (Ewe War Dance)', region: 'Ghana/Togo (Ewe)', bpm: 120, range: '110–130', steps: 12, family: 'ewe',
    kick: 'x..x..x..x..', top: 'x.xx.xx.xx.x', sound: 'atsimevu', groove: 'tri:even', src: 'std',
    etymology: 'Ewe "atsia" = style/dance + "gbeko" = clear/bright. "Bright dance." Ancient war dance, now historical reenactment.',
    note: 'War dance turned historical. Atsimevu lead speaks proverbs. Gankogui timeline. Dramatic tempo changes.',
    topLines: [
      { name: 'Atsimevu (master)', pattern: 'x.xx.xx.xx.x', sound: 'dunun' },
      { name: 'Sogo', pattern: 'x..x..x..x..', sound: 'dunun' },
      { name: 'Kidi', pattern: '.x.x.x.x.x.x', sound: 'dunun' },
      { name: 'Gankogui', pattern: 'x.x.xx.x.x.x', sound: 'metal' }
    ] },

  { id: 'kpanlogo', name: 'Kpanlogo (Ga)', region: 'Ghana (Ga/Accra)', bpm: 100, range: '90–110', steps: 16, family: 'son-clave',
    kick: 'x.......x.......', top: 'x..x..x...x.x...', sound: 'kpanlogo', groove: 'sw16:58', src: 'std',
    etymology: 'Ga "kpanlogo" = from "kpa" = to strike + "nlogo" = drum. 1960s youth dance. "Kpanlogo mi ni" = "Kpanlogo is mine."',
    note: 'Ga recreational. Bell = son clave. Kpanlogo drum (conga-shaped) + nono (bell) + gankogui. Post-independence Ghana identity.',
    topLines: [
      { name: 'Kpanlogo drum', pattern: 'x..x..x...x.x...', sound: 'dunun' },
      { name: 'Nono (bell)', pattern: 'x..x..x...x.x...', sound: 'metal' },
      { name: 'Gankogui', pattern: 'x...x...x...x...', sound: 'metal' }
    ] },

  { id: 'adzogbo', name: 'Adzogbo (Ewe/Fon)', region: 'Ghana/Togo/Benin (Ewe/Fon)', bpm: 140, range: '130–150', steps: 12, family: 'ewe',
    kick: 'x..x..x..x..', top: 'xx.xx.xx.xx.', sound: 'kagan', groove: 'tri:even', src: 'std',
    etymology: 'Fon/Ewe "adzogbo" = "drum language" or "war drum." Ancient Fo (Fon) warrior rhythm. Vodun ritual.',
    note: 'Warrior/vodun rhythm. Fast, aggressive. Kagan leads. Possession trance. Precursor to Haitian rada.',
    topLines: [
      { name: 'Kagan (lead)', pattern: 'xx.xx.xx.xx.', sound: 'dunun' },
      { name: 'Kidi', pattern: 'x.x.x.x.x.x.', sound: 'dunun' },
      { name: 'Sogo', pattern: 'x..x..x..x..', sound: 'dunun' },
      { name: 'Gankogui', pattern: 'x.x.xx.x.x.x', sound: 'metal' }
    ] },


  // ── Maghreb / Andalusian (North Africa classical) ──
  // ── West African (additional) ──
  { id: 'yankadi-makru', name: 'Yankadi-Makru (paired)', region: 'Guinea (Mandé)', bpm: 110, range: '100–130', steps: 16, family: 'djembe',
    kick: 'x...x...x...x...', top: 'x.x.x.x.x.x.x.x.', sound: 'djembe', groove: 'sw16:58', src: 'std',
    etymology: '"Yankadi" = slow courting dance. "Makru" = fast version. Always paired — transition marks the shift from flirtation to passion.',
    note: 'Paired rhythms. Yankadi (slow, 80 bpm, swing) → Makru (fast, 140 bpm, straight). Same dunun parts. DJEMBE lead changes density.',
    topLines: [
      { name: 'Djembe lead (Yankadi)', pattern: '.x..x...x..x....', sound: 'djembe' },
      { name: 'Djembe lead (Makru)', pattern: 'x.x.x.x.x.x.x.x.', sound: 'djembe' },
      { name: 'Kenkeni', pattern: 'x...x...x...x...', sound: 'dunun' },
      { name: 'Sangban', pattern: '..x...x...x...x.', sound: 'dunun' },
      { name: 'Dununba', pattern: 'x.......x.......', sound: 'dunun' }
    ] },

  { id: 'toro', name: 'Toro (Mandé)', region: 'Guinea/Mali (Mandé)', bpm: 120, range: '110–130', steps: 16, family: 'djembe',
    kick: 'x...x...x...x...', top: 'x.x.x.x.x.x.x.x.', sound: 'djembe', groove: 'sw16:58', src: 'std',
    etymology: 'Maninka "toro" = bull. Strength, virility. Men\'s dance. Originally for hunters\' ceremonies. "Toro" = also a dununba family rhythm.',
    note: 'Men\'s strength dance. Dununba family. Heavy bass. Hunters\' guild. Similar to dununba but distinct sangban phrasing.',
    topLines: [
      { name: 'Djembe lead', pattern: 'x.x.x.x.x.x.x.x.', sound: 'djembe' },
      { name: 'Djembe accomp.', pattern: '.x.x.x.x.x.x.x.x', sound: 'djembe' },
      { name: 'Sangban', pattern: '.x..x.x..x..x.x.', sound: 'dunun' },
      { name: 'Dununba', pattern: 'x..x..x...x..x..', sound: 'dunun' }
    ] },

  // ── Afro-Peruvian ──

  // ── Restored 2026-11-14 with patterns read from published notation ──
  { id: 'frevo', name: 'Frevo', region: 'Brazil (Recife)', bpm: 140, range: '130–150', steps: 16, family: 'samba',
    kick: '....x.......x...', top: 'XooXooXooXooX...', sound: 'caixa', groove: 'straight', src: 'std',
    etymology: 'Portuguese "ferver" = to boil. "Frevo" = boiling over. Carnival street music. Capoeira-influenced acrobatic dance.',
    note: 'Two bars of 2/4. The caixa runs sixteenths with an accent every three (a 3-against-4 pull) and lands on a buzz roll on the last beat; the surdo answers on beat 2; the pandeiro gallops. Pattern from Adam Osmianski\'s "Traditional orchestration" notation (That Drum Blog, 2020).',
    topLines: [
      { name: 'Caixa (snare)', pattern: 'XooXooXooXooX...', sound: 'snare' },
      { name: 'Pandeiro', pattern: 'x.xxx.xxx.xxx.xx', sound: 'pandeiro' },
      { name: 'Surdo (bass)', pattern: '....x.......x...', sound: 'dunun' }
    ] },

  { id: 'ndombolo-detailed', name: 'Soukous / Ndombolo (cavacha)', region: 'DRC / Congo', bpm: 140, range: '120–150', steps: 16, family: 'soukous',
    kick: F, top: 'XooXooXXooXoXooo', sound: 'snare', groove: 'straight', src: 'std',
    etymology: '"Cavacha" is onomatopoeic ("ca-va-cha", a train engine). Lingala "ndombolo" = the hip-shaking dance of 1990s Kinshasa.',
    note: 'The cavacha: the snare (or hi-hat) pattern of the sebene, created by Meridjo Belobi of Zaïko Langa Langa in the early 1970s. Accents on a field of ghosted sixteenths, bass drum on every beat. Pattern from the notation on Wikipedia\'s Cavacha article ("Cavacha drum pattern, original").',
    topLines: [
      { name: 'Snare (cavacha)', pattern: 'XooXooXXooXoXooo', sound: 'snare' },
      { name: 'Bass', pattern: 'x.x.x.x.x.x.x.x.', sound: 'bass' },
      { name: 'Guitars (3)', pattern: 'x.x.x.x.x.x.x.x.', sound: 'pluck' }
    ] },

  { id: 'batuque', name: 'Batuque', region: 'Cape Verde (Santiago)', bpm: 150, range: '3/4 at about 112', steps: 12, family: 'batuque',
    kick: 'x...x...x...', top: 'X.xxx.X.xxx.', sound: 'clap', groove: 'straight', src: 'std',
    etymology: 'Portuguese "batuque" = drumming/beat. From "bater" = to beat. African-derived Santiago tradition.',
    note: 'Women\'s circle dance with call-and-response singing. One bar of 3/4 in sixteenths: the kick lane counts the three beats, the txabeta (hands on a rolled cloth) plays two equal groups across them, so 2 sits against 3. Pattern from the "Rhythmic model of the batuque" notation on Wikipedia.',
    topLines: [
      { name: 'Txabeta (cloth slap)', pattern: 'X.xxx.X.xxx.', sound: 'clap' }
    ] },

  // ── Free-looping parts: `loop: true` marks a part whose pattern is its own length, not the row's ──
  { id: 'aka-mongombi', name: 'Mongombi (Aka Hunt)', region: 'Central Africa (CAR)', bpm: 160, range: '150–170', steps: 16, family: 'pygmy',
    kick: 'x...x...x...x...', top: 'xx.', sound: 'enzeko', groove: 'straight', src: 'approx',
    etymology: 'Aka "mongombi" = net hunt. Shouts and rhythms during collective net hunting.',
    note: 'Fast hunt rhythm. Vocal counterpoint with yodeling. The lead part is a gallop of three 16ths (hit, hit, rest) that loops on its own, so it turns against the four-beat bar and lines up again every three beats. Not transcribed from a source: this is the library\'s original gallop, played whole instead of cut off at 16 steps.',
    topLines: [
      { name: 'Enzeko (drum)', pattern: 'xx.', sound: 'dunun', loop: true },
      { name: 'Geedale-bagongo', pattern: 'x.x.x.x.x.x.x.x.', sound: 'pluck' }
    ] },

  { id: 'ingoma-intore', name: 'Intore (Rwanda Heroic Dance)', region: 'Great Lakes (Rwanda)', bpm: 140, range: '130–150', steps: 16, family: 'ingoma',
    kick: 'x...x...x...x...', top: 'xx.', sound: 'amashako', groove: 'straight', src: 'approx',
    etymology: 'Kinyarwanda "intore" = "the chosen ones" / elite warriors. Heroic dance of the royal court.',
    note: 'Warrior dance. High leaps, spear movements. The lead part is a gallop of three 16ths (hit, hit, rest) that loops on its own, so it turns against the four-beat bar and lines up again every three beats. Not transcribed from a source: this is the library\'s original gallop, played whole instead of cut off at 16 steps.',
    topLines: [
      { name: 'Lead drum', pattern: 'xx.', sound: 'dunun', loop: true },
      { name: 'Support drums', pattern: 'x.x.x.x.x.x.x.x.', sound: 'dunun' },
      { name: 'Shakers', pattern: 'xxxxxxxxxxxxxxxx', sound: 'shaker' }
    ] },

  { id: 'chakacha', name: 'Chakacha (Swahili Women)', region: 'Kenya / Tanzania (Swahili)', bpm: 120, range: '110–130', steps: 16, family: 'chakacha',
    kick: 'x...x...x...x...', top: 'xx.', sound: 'dumbak', groove: 'straight', src: 'approx',
    etymology: 'Swahili "chakacha" = onomatopoeic for hip-shaking sound. Women\'s wedding dance. Coastal Mijikenda roots.',
    note: 'Women\'s hip dance, often at kuchenga (henna night). The lead part is a gallop of three 16ths (hit, hit, rest) that loops on its own, so it turns against the four-beat bar and lines up again every three beats. Not transcribed from a source: this is the library\'s original gallop, played whole instead of cut off at 16 steps.',
    topLines: [
      { name: 'Dumbak', pattern: 'xx.', sound: 'dunun', loop: true },
      { name: 'Msondo (bass drum)', pattern: 'x.......x.......', sound: 'dunun' },
      { name: 'Cherewa (shakers)', pattern: 'xxxxxxxxxxxxxxxx', sound: 'shaker' }
    ] },

  { id: 'coco', name: 'Coco (Zabumba)', region: 'Brazil (Northeast)', bpm: 100, range: '90–110', steps: 16, family: 'samba',
    kick: 'x...x...x...x...', top: 'xx.', sound: 'zabumba', groove: 'straight', src: 'approx',
    etymology: 'Tupi "coco" = coconut (head). Or "co-co" = call-response. Circular dance with improvisation. Quilombola roots.',
    note: 'Call-response circle dance. Zabumba + pandeiro + ganzá. The lead part is a gallop of three 16ths (hit, hit, rest) that loops on its own, so it turns against the four-beat bar and lines up again every three beats. Not transcribed from a source: this is the library\'s original gallop, played whole instead of cut off at 16 steps.',
    topLines: [
      { name: 'Zabumba', pattern: 'xx.', sound: 'dunun', loop: true },
      { name: 'Pandeiro', pattern: 'x.x.x.x.x.x.x.x.', sound: 'pandeiro' },
      { name: 'Ganzá (shaker)', pattern: 'xxxxxxxxxxxxxxxx', sound: 'shaker' }
    ] },
];

RX.REGIONS = [...new Set(RX.RHYTHMS.map(r => r.region))];