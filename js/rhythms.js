// Rhythm library. Patterns: X accent, x hit, o ghost, . rest.
// steps 16 = four beats of 16ths; steps 12 = four beats of triplets (12/8).
// steps 8 = two beats of 16ths (half bar); steps 20 = five beats of 16ths (5/4).
// src: "agr" = accents read from an Ableton groove file, "std" = widely documented
// timeline, "approx" = typical simplification from memory, not transcribed from a source,
// "audio" = measured from a recording.
// family: groups rhythmically-similar variants (same cell/timeline, different embellishments)
// topLines: array of {name, pattern, sound} for multi-instrument top parts (optional)
window.RX = window.RX || {};

const F  = 'x...x...x...x...';   // four on the floor (16)
const F12 = 'x..x..x..x..';      // four on the floor (12/8)
const F8  = 'x.x.';              // four on the floor (8 steps = half bar)
const F20 = 'x...x...x...x...x...'; // five on the floor (20 steps = 5/4)
const DEMBOW = '...x..x....x..x.';

RX.RHYTHMS = [
  // ── Featured ──
  { id: '111', name: '111 (Ape Drums & JAMIIE)', region: 'Featured', bpm: 120, range: 'measured 120.0', steps: 16, family: 'tresillo',
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
      { name: 'Qraqeb (castanets)', pattern: 'xx.xx.xx.xx.xx', sound: 'metal' },
      { name: 'Handclaps', pattern: 'x...x...x...', sound: 'clap' },
      { name: 'Ganga (large drum)', pattern: 'x.......x....', sound: 'dunun' }
    ] },

  { id: 'gnawa-hadra', name: 'Gnawa Hadra (Trance)', region: 'North Africa (Morocco)', bpm: 130, range: '120–140', steps: 12, family: 'gnawa',
    kick: 'x..x..x..x..', top: 'x.x.x.x.x.x.x.', sound: 'guembri', groove: 'tri:even', src: 'std',
    etymology: '"Hadra" = Arabic "presence" (divine presence). The trance-inducing section of the lila.',
    note: 'Faster trance section. Qraqeb play continuous 16th-note interlock. Guembri locks to 3-pulse. Claps on 2&4.',
    topLines: [
      { name: 'Guembri', pattern: 'x.x.x.x.x.x.x.', sound: 'bass' },
      { name: 'Qraqeb', pattern: 'xxxxxxxxxxxx', sound: 'metal' },
      { name: 'Claps', pattern: '..x...x...x...', sound: 'clap' }
    ] },

  // ── Ethiopian / Eritrean ──
  { id: 'ethio-tizita', name: 'Tizita (Major)', region: 'Ethiopia / Eritrea', bpm: 70, range: '60–80', steps: 12, family: 'ethio',
    kick: 'x.....x.....', top: 'x.x..x.x..x.', sound: 'kebero', groove: 'tri:even', src: 'std',
    etymology: 'Amharic "ትዝታ" (tizita) = "memory, nostalgia, longing". The most beloved qenet (mode). Also a song form.',
    note: 'Slow 6/8 (12/8) ballad feel. Kebero drum with swing. Krar/lyre arpeggios. "Ethiopian blues". Pentatonic tizita mode.',
    topLines: [
      { name: 'Kebero (drum)', pattern: 'x.x..x.x..x.', sound: 'dunun' },
      { name: 'Krar (lyre)', pattern: 'x...x.x...x.x.', sound: 'pluck' },
      { name: 'Masinko (fiddle)', pattern: '.x..x...x..x..', sound: 'bow' },
      { name: 'Handclaps', pattern: '..x...x...x...', sound: 'clap' }
    ] },

  { id: 'ethio-bati', name: 'Bati', region: 'Ethiopia / Eritrea', bpm: 100, range: '90–110', steps: 12, family: 'ethio',
    kick: 'x..x..x..x..', top: 'x.x.x.x.x.x.', sound: 'kebero', groove: 'tri:even', src: 'std',
    etymology: 'Amharic "ባቲ" (bati) — named for the Bati region/market. One of the four main qenet (modes).',
    note: 'Upbeat 6/8 dance feel. Kebero drives. Masinko doubles vocal melody. Used for praise and celebration songs.',
    topLines: [
      { name: 'Kebero', pattern: 'x.x.x.x.x.x.', sound: 'dunun' },
      { name: 'Krar', pattern: 'x.x.x.x.x.x.', sound: 'pluck' },
      { name: 'Masinko', pattern: '.x.x.x.x.x.x', sound: 'bow' }
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
  { id: 'aka-bondo', name: 'Bondo (Aka Pygmy)', region: 'Central Africa (CAR)', bpm: 140, range: '130–150', steps: 16, family: 'pygmy',
    kick: 'x...x...x...x...', top: 'x.x.x.x.x.x.x.x.', sound: 'enzeko', groove: 'straight', src: 'std',
    etymology: 'Aka "bondo" = diviner-healer\'s dance. Performed by the nganga (healer) for hunting success, funerals.',
    note: 'Diviner-healer\'s rhythm. Vocal polyphony (4 voices) + enzeko drum + geedale-bagongo harp + mbela bow. Hocketing.',
    topLines: [
      { name: 'Enzeko (drum)', pattern: 'x.x.x.x.x.x.x.x.', sound: 'dunun' },
      { name: 'Geedale-bagongo (harp)', pattern: '.x.x.x.x.x.x.x.x', sound: 'pluck' },
      { name: 'Mbela (musical bow)', pattern: 'x...x...x...x...', sound: 'bow' },
      { name: 'Handclaps', pattern: '..x...x...x...x.', sound: 'clap' }
    ] },

  { id: 'aka-mongombi', name: 'Mongombi (Aka Hunt)', region: 'Central Africa (CAR)', bpm: 160, range: '150–170', steps: 16, family: 'pygmy',
    kick: 'x...x...x...x...', top: 'xx.xx.xx.xx.xx', sound: 'enzeko', groove: 'straight', src: 'std',
    etymology: 'Aka "mongombi" = net hunt. Shouts and rhythms during collective net hunting.',
    note: 'Fast hunt rhythm. Vocal counterpoint with yodeling. Drum mimics footsteps. Geedale-bagongo plays ostinato.',
    topLines: [
      { name: 'Enzeko', pattern: 'xx.xx.xx.xx.xx', sound: 'dunun' },
      { name: 'Geedale-bagongo', pattern: 'x.x.x.x.x.x.x.', sound: 'pluck' },
      { name: 'Vocal yodel', pattern: 'x...x...x...x...', sound: 'voice' }
    ] },

  // ── Burundi / Rwanda (Ingoma) ──
  { id: 'ingoma-burundi', name: 'Ingoma (Burundi Royal Drums)', region: 'Great Lakes (Burundi)', bpm: 130, range: '120–140', steps: 16, family: 'ingoma',
    kick: 'x...x...x...x...', top: 'x.x.x.x.x.x.x.x.', sound: 'amashako', groove: 'sw16:60', src: 'std',
    etymology: 'Kirundi "ingoma" = both "drum" and "dance". From Proto-Bantu *ngoma. National symbol on Burundi\'s coat of arms.',
    note: 'Royal karyenda ensemble: 12–24 drums. Amashako (lead) directs; ibishikiso/inkiranya (support) interlock. UNESCO heritage.',
    topLines: [
      { name: 'Amashako (lead drum)', pattern: 'x.x.x.x.x.x.x.x.', sound: 'dunun' },
      { name: 'Ibishikiso (support 1)', pattern: '.x.x.x.x.x.x.x.x', sound: 'dunun' },
      { name: 'Inkiranya (support 2)', pattern: 'x...x...x...x...', sound: 'dunun' },
      { name: 'Karyenda (sacred drum)', pattern: '..x...x...x...x.', sound: 'dunun' },
      { name: 'Bell/Iron', pattern: 'x...x...x...x...', sound: 'metal' }
    ] },

  { id: 'ingoma-intore', name: 'Intore (Rwanda Heroic Dance)', region: 'Great Lakes (Rwanda)', bpm: 140, range: '130–150', steps: 16, family: 'ingoma',
    kick: 'x...x...x...x...', top: 'xx.xx.xx.xx.xx', sound: 'amashako', groove: 'sw16:60', src: 'std',
    etymology: 'Kinyarwanda "intore" = "the chosen ones" / elite warriors. Heroic dance of the royal court.',
    note: 'Warrior dance. High leaps, spear movements. Drums mimic battle rhythms. Post-genocide reconciliation symbol.',
    topLines: [
      { name: 'Lead drum', pattern: 'xx.xx.xx.xx.xx', sound: 'dunun' },
      { name: 'Support drums', pattern: 'x.x.x.x.x.x.x.x.', sound: 'dunun' },
      { name: 'Shakers', pattern: 'xxxxxxxxxxxxxxxx', sound: 'shaker' },
      { name: 'Horn/Whistle', pattern: 'x...x...x...x...', sound: 'wind' }
    ] },

  // ── Zimbabwe (Mbira / Shona) ──
  { id: 'mbira-nyamaropa', name: 'Nhemamusasa / Nyamaropa', region: 'Zimbabwe (Shona)', bpm: 120, range: '110–130', steps: 12, family: 'mbira',
    kick: 'x..x..x..x..', top: 'x.x.x.x.x.x.x.', sound: 'mbira', groove: 'tri:even', src: 'std',
    etymology: '"Nhemamusasa" = "cutting branches for shelter" (ancestral spirit). "Nyamaropa" = "meat and blood" (war spirit). Mbira = thumb piano (Shona).',
    note: 'Classic mbira piece. Two interlocking parts (kushaura/kutsinhira) create 3:2 polymeter. Hosho (shakers) drive 12/8 pulse. For bira ceremony.',
    topLines: [
      { name: 'Kushaura (lead mbira)', pattern: 'x.x.x.x.x.x.x.', sound: 'mbira' },
      { name: 'Kutsinhira (response)', pattern: '.x.x.x.x.x.x.x', sound: 'mbira' },
      { name: 'Hosho (shakers)', pattern: 'x...x...x...', sound: 'shaker' },
      { name: 'Ngoma (drum)', pattern: 'x.......x.......', sound: 'dunun' }
    ] },

  { id: 'mbira-karigamombe', name: 'Karigamombe', region: 'Zimbabwe (Shona)', bpm: 110, range: '100–120', steps: 12, family: 'mbira',
    kick: 'x..x..x..x..', top: 'xx.xx.xx.xx.', sound: 'mbira', groove: 'tri:even', src: 'std',
    etymology: 'Shona "kariga mombe" = "undefeated by cattle" / "strong as a bull". Spirit of strength and resilience.',
    note: 'Powerful mbira piece for chiefs. Denser interlocking. Often played at kurova guva (bringing back spirit) ceremonies.',
    topLines: [
      { name: 'Kushaura', pattern: 'xx.xx.xx.xx.', sound: 'mbira' },
      { name: 'Kutsinhira', pattern: 'x.x.x.x.x.x.', sound: 'mbira' },
      { name: 'Hosho', pattern: 'x...x...x...', sound: 'shaker' }
    ] },

  // ── Uganda / Baganda ──
  { id: 'baganda-amadinda', name: 'Amadinda (Log Xylophone)', region: 'Uganda (Baganda)', bpm: 180, range: '170–200', steps: 12, family: 'amandinda',
    kick: 'x..x..x..x..', top: 'xxxxxxxxxxxx', sound: 'xylophone', groove: 'tri:even', src: 'std',
    etymology: 'Luganda "amadinda" = large log xylophone (22 keys). Played by 3 players interlocking. Royal court instrument.',
    note: '3 players, 22 keys. Strict hocket: each player plays every 3rd note. Creates 12-note cycle at high speed. No drum — xylophones are the rhythm.',
    topLines: [
      { name: 'Player 1 (low)', pattern: 'x..x..x..x..', sound: 'xylophone' },
      { name: 'Player 2 (mid)', pattern: '.x..x..x..x.', sound: 'xylophone' },
      { name: 'Player 3 (high)', pattern: '..x..x..x..x', sound: 'xylophone' }
    ] },

  { id: 'baganda-akisoma', name: 'Akasiba / Baakisimba', region: 'Uganda (Baganda)', bpm: 120, range: '110–130', steps: 16, family: 'baganda',
    kick: 'x...x...x...x...', top: 'x.x..x.x.x..x.x.', sound: 'engalabi', groove: 'sw16:58', src: 'std',
    etymology: '"Baakisimba" = "the ones who dance" (aba + kisimba). "Akasiba" = small drum. Waist dance of the Baganda.',
    note: 'Waist-focused dance. Engalabi (long drum) lead. Namunjoloba (small drum) keeps pulse. Empunya (bass) on 1&3.',
    topLines: [
      { name: 'Engalabi (lead drum)', pattern: 'x.x..x.x.x..x.x.', sound: 'dunun' },
      { name: 'Namunjoloba (pulse)', pattern: 'x...x...x...x...', sound: 'dunun' },
      { name: 'Empunya (bass)', pattern: 'x.......x.......', sound: 'dunun' },
      { name: 'Endingidi (fiddle)', pattern: '.x.x.x.x.x.x.x.', sound: 'bow' }
    ] },

  // ── Tanzania / Taarab ──
  { id: 'taarab-kidumbak', name: 'Kidumbak (Taarab Street)', region: 'Tanzania (Zanzibar)', bpm: 100, range: '90–110', steps: 16, family: 'taarab',
    kick: 'x...x...x...x...', top: 'x.x.x.x.x.x.x.x.', sound: 'dumbak', groove: 'sw16:58', src: 'std',
    etymology: 'Swahili "kidumbak" = small drum ensemble (ki- diminutive + dumbak). Street version of orchestral taarab.',
    note: 'Street taarab. Dumbak (goblet drum) + sanduku (tea-chest bass) + violin + cherewa (shakers). Call-response vocals. Indian/Arabic/African fusion.',
    topLines: [
      { name: 'Dumbak (lead)', pattern: 'x.x.x.x.x.x.x.x.', sound: 'dunun' },
      { name: 'Sanduku (bass)', pattern: 'x.......x.......', sound: 'bass' },
      { name: 'Violin', pattern: '.x.x.x.x.x.x.x.', sound: 'bow' },
      { name: 'Cherewa (shakers)', pattern: 'x...x...x...', sound: 'shaker' }
    ] },

  // ── Cape Verde ──
  { id: 'coladeira', name: 'Coladeira', region: 'Cape Verde', bpm: 100, range: '90–110', steps: 16, family: 'coladeira',
    kick: F, top: 'x.x.x.x.x.x.x.x.', sound: 'conga', groove: 'sw16:54', src: 'std',
    etymology: 'Portuguese "colar" = to glue/stick. "Coladeira" = that which sticks (the dance partners). From "koladera" Kriolu.',
    note: 'Faster, lighter cousin of morna. 2/4 or 4/4 feel. Conga + cavaquinho + guitar. Social dance, partners close.',
    topLines: [
      { name: 'Congas', pattern: 'x.x.x.x.x.x.x.x.', sound: 'conga' },
      { name: 'Cavaquinho', pattern: 'x.x.x.x.x.x.x.x.', sound: 'pluck' },
      { name: 'Guitar', pattern: '.x.x.x.x.x.x.x.', sound: 'pluck' },
      { name: 'Ferrinho (scraper)', pattern: 'x...x...x...', sound: 'scraper' }
    ] },

  { id: 'batuque', name: 'Batuque', region: 'Cape Verde (Santiago)', bpm: 130, range: '120–140', steps: 16, family: 'batuque',
    kick: F, top: 'xx.xx.xx.xx.xx', sound: 'djembe', groove: 'sw16:60', src: 'std',
    etymology: 'Portuguese "batuque" = drumming/beat. From "bater" = to beat. African-derived Santiago tradition.',
    note: 'Women\'s circle dance. Call-response vocals. Three drums (tambor, cimboa, ferrinho). Polyrhythmic clapping. Pre-colonial roots.',
    topLines: [
      { name: 'Tambor (lead drum)', pattern: 'xx.xx.xx.xx.xx', sound: 'dunun' },
      { name: 'Cimboa (fiddle)', pattern: 'x.x.x.x.x.x.x.', sound: 'bow' },
      { name: 'Ferrinho (scraper)', pattern: 'xxxxxxxxxxxx', sound: 'scraper' },
      { name: 'Handclaps', pattern: 'x.x.x.x.x.x.x.x.', sound: 'clap' }
    ] },

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
      { name: 'Dawuro (bell)', pattern: 'x.x.xx.x.x.x', sound: 'metal' },
      { name: 'Kwadum (lead drum)', pattern: 'x.x..x.x.x..x.x.', sound: 'dunun' },
      { name: 'Apentemma (support)', pattern: '.x.x.x.x.x.x.x.', sound: 'dunun' },
      { name: 'Petia (high drum)', pattern: 'x...x...x...x...', sound: 'dunun' }
    ] },

  { id: 'fontomfrom', name: 'Fontomfrom (Akan Talking Drums)', region: 'Ghana (Akan/Asante)', bpm: 90, range: '80–100', steps: 16, family: 'akan',
    kick: 'x...x...x...x...', top: 'x..x.x..x..x.x..', sound: 'atumpan', groove: 'tri:even', src: 'std',
    etymology: 'Akan "fontom" = message + "from" = drum. "Talking drums" — atumpan pair speaks Twi language tones.',
    note: 'Pair of atumpan (male/female) drums speak tonal language. Master drummer recites proverbs, history. For royal announcements.',
    topLines: [
      { name: 'Atumpan (male - low)', pattern: 'x..x.x..x..x.x..', sound: 'dunun' },
      { name: 'Atumpan (female - high)', pattern: '.x.x.x.x.x.x.x.x', sound: 'dunun' },
      { name: 'Dawuro (bell)', pattern: 'x.x.xx.x.x.x', sound: 'metal' },
      { name: 'Apentemma', pattern: 'x...x...x...x...', sound: 'dunun' }
    ] },

  // ── Nigeria (Yoruba / Bata) ──
  { id: 'bata-yoruba', name: 'Bata (Yoruba Sacred)', region: 'Nigeria (Yoruba)', bpm: 120, range: '110–130', steps: 12, family: 'bata',
    kick: 'x..x..x..x..', top: 'x.x.x.x.x.x.', sound: 'iya-ilu', groove: 'tri:even', src: 'std',
    etymology: 'Yoruba "bàtá" = the three-drum ensemble sacred to Shango (thunder deity). Iya-ilu = "mother drum".',
    note: 'Sacred trio for Shango. Iya-ilu (mother/lead) talks; omele ako (male) + omele abo (female) answer. Only initiates play.',
    topLines: [
      { name: 'Iya-ilu (mother/lead)', pattern: 'x.x.x.x.x.x.', sound: 'dunun' },
      { name: 'Omele ako (male)', pattern: '.x.x.x.x.x.x', sound: 'dunun' },
      { name: 'Omele abo (female)', pattern: 'x...x...x...', sound: 'dunun' },
      { name: 'Shaker (sekere)', pattern: 'x...x...x...', sound: 'shaker' }
    ] },

  { id: 'sakara', name: 'Sakara (Yoruba Islamic)', region: 'Nigeria (Yoruba)', bpm: 100, range: '90–110', steps: 16, family: 'yoruba',
    kick: 'x...x...x...x...', top: 'x.x.x.x.x.x.x.x.', sound: 'sakara', groove: 'sw16:58', src: 'std',
    etymology: 'Yoruba "sàkárà" — from Arabic "ṣaqr" = falcon (swift). Islamic-influenced Yoruba praise music.',
    note: 'Goatskin drum + goje (fiddle) + agidigbo (thumb piano). Muslim Yoruba praise. Precursor to Fuji/Apala.',
    topLines: [
      { name: 'Sakara drum', pattern: 'x.x.x.x.x.x.x.x.', sound: 'dunun' },
      { name: 'Goje (fiddle)', pattern: '.x.x.x.x.x.x.x.', sound: 'bow' },
      { name: 'Agidigbo (thumb piano)', pattern: 'x...x...x...x...', sound: 'pluck' },
      { name: 'Sekere (shaker)', pattern: 'x...x...x...', sound: 'shaker' }
    ] },

  // ── South Africa (Additional) ──
  { id: 'maskandi', name: 'Maskandi (Zulu Guitar)', region: 'South Africa (Zulu)', bpm: 140, range: '130–150', steps: 16, family: 'maskandi',
    kick: 'x...x...x...x...', top: 'x.x.x.x.x.x.x.x.', sound: 'guitar', groove: 'sw16:60', src: 'std',
    etymology: 'Zulu "maskandi" from Afrikaans "musiekant" = musician. Migrant workers\' guitar style. "Music of the man walking far."',
    note: 'Zulu migrant guitar. Izikhono (thumb-picking) + izihlabo (intro runs). Concertina + bass. Stories of rural life, love, politics.',
    topLines: [
      { name: 'Lead guitar (izikhono)', pattern: 'x.x.x.x.x.x.x.x.', sound: 'pluck' },
      { name: 'Bass guitar', pattern: 'x.......x.......', sound: 'bass' },
      { name: 'Concertina', pattern: '.x.x.x.x.x.x.x.', sound: 'pluck' },
      { name: 'Drum kit', pattern: 'x...x...x...x...', sound: 'dunun' }
    ] },

  { id: 'isicathamiya', name: 'Isicathamiya (Zulu A Cappella)', region: 'South Africa (Zulu)', bpm: 90, range: '80–100', steps: 16, family: 'isicathamiya',
    kick: 'x...x...x...x...', top: 'x.x.x.x.x.x.x.x.', sound: 'voice', groove: 'sw8:60', src: 'std',
    etymology: 'Zulu "isicathamiya" from "cathama" = walk softly, stealthily. "Tip-toe" style — miners dancing quietly in hostels.',
    note: 'A cappella male choir. Soft footwork (cathama). Call-response. Ladysmith Black Mambazo style. Competitive choir tradition.',
    topLines: [
      { name: 'Lead voice', pattern: 'x.x.x.x.x.x.x.x.', sound: 'voice' },
      { name: 'Tenor harmony', pattern: '.x.x.x.x.x.x.x.', sound: 'voice' },
      { name: 'Bass harmony', pattern: 'x...x...x...x...', sound: 'voice' },
      { name: 'Foot stomps', pattern: 'x...x...x...x...', sound: 'dunun' }
    ] },

  { id: 'marabi', name: 'Marabi (Township Piano)', region: 'South Africa (Township)', bpm: 110, range: '100–120', steps: 16, family: 'marabi',
    kick: F, top: 'x.x.x.x.x.x.x.x.', sound: 'piano', groove: 'sw8:62', src: 'std',
    etymology: 'From Marabastad (Pretoria township) + "marabi" = Sotho "to play" / "to enjoy". 1930s shebeen piano style.',
    note: '4-chord cycle (I-IV-V-I) over 4/4 swing. Pedal organ / piano. Precursor to mbaqanga, kwela, kwaito. Cyclic, hypnotic.',
    topLines: [
      { name: 'Piano (right hand)', pattern: 'x.x.x.x.x.x.x.x.', sound: 'pluck' },
      { name: 'Piano (left hand)', pattern: 'x.......x.......', sound: 'bass' },
      { name: 'Guitar', pattern: '.x.x.x.x.x.x.x.', sound: 'pluck' },
      { name: 'Drums', pattern: 'x...x...x...x...', sound: 'dunun' }
    ] },

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
  { id: 'taarab-orchestral', name: 'Taarab (Orchestral)', region: 'Tanzania / Kenya (Swahili Coast)', bpm: 80, range: '70–90', steps: 16, family: 'taarab',
    kick: 'x...x...x...x...', top: 'x.x.x.x.x.x.x.x.', sound: 'oud', groove: 'sw16:56', src: 'std',
    etymology: 'Arabic "ṭarab" = ecstasy, enchantment, musical rapture. From "tariba" = to be moved by music. Swahili coast synthesis.',
    note: 'Orchestral: oud + qanun + violin + cello + accordion + dumbak + riq + tabla. Arabic maqam + Indian raga + Swahili poetry. Wedding staple.',
    topLines: [
      { name: 'Oud (lute)', pattern: 'x.x.x.x.x.x.x.x.', sound: 'pluck' },
      { name: 'Qanun (zither)', pattern: '.x.x.x.x.x.x.x.', sound: 'pluck' },
      { name: 'Violin', pattern: 'x...x...x...x...', sound: 'bow' },
      { name: 'Dumbak (goblet drum)', pattern: 'x...x...x...x...', sound: 'dunun' },
      { name: 'Riq (tambourine)', pattern: 'x.x.x.x.x.x.x.x.', sound: 'metal' }
    ] },

  { id: 'chakacha', name: 'Chakacha (Swahili Women)', region: 'Kenya / Tanzania (Swahili)', bpm: 120, range: '110–130', steps: 16, family: 'chakacha',
    kick: 'x...x...x...x...', top: 'xx.xx.xx.xx.xx', sound: 'dumbak', groove: 'sw16:58', src: 'std',
    etymology: 'Swahili "chakacha" = onomatopoeic for hip-shaking sound. Women\'s wedding dance. Coastal Mijikenda roots.',
    note: 'Women\'s hip dance. Fast dumbak + cherewa (shakers) + msondo (bass drum). Call-response vocals. Often at kuchenga (henna night).',
    topLines: [
      { name: 'Dumbak', pattern: 'xx.xx.xx.xx.xx', sound: 'dunun' },
      { name: 'Msondo (bass drum)', pattern: 'x.......x.......', sound: 'dunun' },
      { name: 'Cherewa (shakers)', pattern: 'xxxxxxxxxxxx', sound: 'shaker' },
      { name: 'Vocals (call-response)', pattern: 'x...x...x...x...', sound: 'voice' }
    ] },

  { id: 'benga', name: 'Benga (Luo Guitar)', region: 'Kenya (Luo)', bpm: 130, range: '120–140', steps: 16, family: 'benga',
    kick: 'x...x...x...x...', top: 'x.x.x.x.x.x.x.x.', sound: 'guitar', groove: 'straight', src: 'std',
    etymology: 'Luo "benga" = "beautiful" / "to make beautiful". From "obenga" = beauty. Named after Ochieng\' Nelly\'s "Benga" beat.',
    note: 'Fast guitar lines (nyatiti style) + bass + drums. Nyatiti (lyre) patterns transferred to guitar. 1970s–90s dominant Kenyan pop.',
    topLines: [
      { name: 'Lead guitar (nyatiti style)', pattern: 'x.x.x.x.x.x.x.x.', sound: 'pluck' },
      { name: 'Bass guitar', pattern: 'x.x.x.x.x.x.x.x.', sound: 'bass' },
      { name: 'Rhythm guitar', pattern: '.x.x.x.x.x.x.x.', sound: 'pluck' },
      { name: 'Drums', pattern: 'x...x...x...x...', sound: 'dunun' }
    ] },

  // ── Central Africa (Additional) ──
  { id: 'soukous', name: 'Soukous (Congolese Rumba)', region: 'DRC / Congo (Congolese)', bpm: 130, range: '120–140', steps: 16, family: 'soukous',
    kick: F, top: 'x.x.x.x.x.x.x.x.', sound: 'guitar', groove: 'straight', src: 'std',
    etymology: 'French "secouer" = to shake. "Soukous" = the shake dance. Evolved from Cuban rumba via Radio Kinshasa.',
    note: 'Cuban rumba → Congolese rumba → soukous. 3 guitars (lead, rhythm, mi-solo) + bass + drums. Sebene (guitar solo section) is the climax.',
    topLines: [
      { name: 'Lead guitar (sebene)', pattern: 'x.x.x.x.x.x.x.x.', sound: 'pluck' },
      { name: 'Mi-solo (mid guitar)', pattern: '.x.x.x.x.x.x.x.', sound: 'pluck' },
      { name: 'Rhythm guitar', pattern: 'x...x...x...x...', sound: 'pluck' },
      { name: 'Bass', pattern: 'x.x.x.x.x.x.x.x.', sound: 'bass' },
      { name: 'Drums', pattern: 'x...x...x...x...', sound: 'dunun' }
    ] },

  { id: 'ndombolo-detailed', name: 'Ndombolo (Soukous Dance)', region: 'DRC / Congo', bpm: 140, range: '130–150', steps: 16, family: 'soukous',
    kick: F, top: 'xx.xx.xx.xx.xx', sound: 'drums', groove: 'straight', src: 'std',
    etymology: 'Lingala "ndombolo" = sensual hip-shaking dance. From "kombola" = to twist/wriggle. 1990s Kinshasa phenomenon.',
    note: 'Fast soukous dance. Cavacha drum pattern drives. Hip isolation. Koffi Olomidé, Werrason. Controversial for "immoral" dancing.',
    topLines: [
      { name: 'Drums (cavacha)', pattern: 'xx.xx.xx.xx.xx', sound: 'dunun' },
      { name: 'Bass', pattern: 'x.x.x.x.x.x.x.x.', sound: 'bass' },
      { name: 'Guitars (3)', pattern: 'x.x.x.x.x.x.x.x.', sound: 'pluck' },
      { name: 'Atalaku (animateur)', pattern: 'x...x...x...x...', sound: 'voice' }
    ] },

  // ── North Africa (Additional) ──
  { id: 'chaabi-morocco', name: 'Chaabi (Moroccan Popular)', region: 'Morocco', bpm: 110, range: '100–120', steps: 16, family: 'chaabi',
    kick: 'x...x...x...x...', top: 'x.x.x.x.x.x.x.x.', sound: 'bendir', groove: 'sw16:56', src: 'std',
    etymology: 'Arabic "shaabi" = popular, of the people. Moroccan urban folk. From rural traditions to city cafés.',
    note: 'Bendir (frame drum) + oud + violin + voice. Call-response. Wedding and festival staple. Najat Aatabou style.',
    topLines: [
      { name: 'Bendir (frame drum)', pattern: 'x.x.x.x.x.x.x.x.', sound: 'dunun' },
      { name: 'Oud', pattern: '.x.x.x.x.x.x.x.', sound: 'pluck' },
      { name: 'Violin', pattern: 'x...x...x...x...', sound: 'bow' },
      { name: 'Vocals', pattern: 'x.x.x.x.x.x.x.x.', sound: 'voice' }
    ] },

  { id: 'rai-algeria', name: 'Raï (Algerian)', region: 'Algeria', bpm: 120, range: '110–130', steps: 16, family: 'rai',
    kick: F, top: 'x.x.x.x.x.x.x.x.', sound: 'derbouka', groove: 'straight', src: 'std',
    etymology: 'Arabic "raï" = opinion, view, advice. Originally Bedouin poets\' counsel. Became protest/pop. "Voice of the voiceless."',
    note: 'Derbouka (goblet drum) + synthesizer + accordion + guitar. Cheb Khaled, Cheb Mami. 1980s–90s global pop. Oran origin.',
    topLines: [
      { name: 'Derbouka', pattern: 'x.x.x.x.x.x.x.x.', sound: 'dunun' },
      { name: 'Accordion', pattern: '.x.x.x.x.x.x.x.', sound: 'pluck' },
      { name: 'Synthesizer', pattern: 'x...x...x...x...', sound: 'pluck' },
      { name: 'Guitar', pattern: 'x.x.x.x.x.x.x.x.', sound: 'pluck' }
    ] },

  { id: 'malhun', name: 'Malhun (Moroccan Sung Poetry)', region: 'Morocco', bpm: 80, range: '70–90', steps: 16, family: 'malhun',
    kick: 'x...x...x...x...', top: 'x.x.x.x.x.x.x.x.', sound: 'oud', groove: 'sw16:55', src: 'std',
    etymology: 'Arabic "malhun" = melodic/poetic. From "lahana" = to sing. Classical Andalusi poetry in Darija. Guild tradition.',
    note: 'Sung poetry. Oud + violin + rebab + tar (frame drum) + voice. Each poem = qasidah. Artisan guilds preserve repertoire.',
    topLines: [
      { name: 'Oud', pattern: 'x.x.x.x.x.x.x.x.', sound: 'pluck' },
      { name: 'Violin/Rebab', pattern: '.x.x.x.x.x.x.x.', sound: 'bow' },
      { name: 'Tar (frame drum)', pattern: 'x...x...x...x...', sound: 'dunun' },
      { name: 'Voice (rawi)', pattern: 'x.x.x.x.x.x.x.x.', sound: 'voice' }
    ] },

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

  // ── Timelines & Claves (enhanced) ──
  { id: 'tresillo', name: 'Tresillo (3-3-2)', region: 'Timelines & claves', bpm: 110, range: 'any', steps: 16, family: 'tresillo',
    kick: F, top: 'x..x..x.x..x..x.', sound: 'snare', groove: 'straight', src: 'std',
    etymology: 'Spanish "tresillo" = little three (triplet). Cuban name for 3+3+2 cell. African root: "standard pattern" (Arom).',
    note: 'The cell under most rows here. Found across sub-Saharan Africa and carried into Cuban, Caribbean and New Orleans music.' },

  { id: 'habanera', name: 'Habanera', region: 'Timelines & claves', bpm: 100, range: '80–120', steps: 16, family: 'tresillo',
    kick: F, top: 'x..xx.x.x..xx.x.', sound: 'snare', groove: 'straight', src: 'std',
    etymology: 'Spanish "habanera" = from Havana (La Habana). Cuban contradanza → European salon. "Contradanza habanera". Bizet\'s Carmen.',
    note: 'Tresillo plus the backbeat. Called "congo" in parts of Cuba.' },

  { id: 'cinquillo', name: 'Cinquillo', region: 'Timelines & claves', bpm: 110, range: '90–130', steps: 16, family: 'cinquillo',
    kick: F, top: 'x.xx.xx.x.xx.xx.', sound: 'snare', groove: 'straight', src: 'std',
    etymology: 'Spanish "cinquillo" = little five (cinco). Cuban 5-stroke pattern. Tibwa (Antillean sticks) pattern. Haitian "cinq".',
    note: 'Five-stroke embellishment of the tresillo; the tibwa stick pattern of Antillean music.' },

  { id: 'son', name: 'Son Clave 3-2', region: 'Timelines & claves', bpm: 100, range: '80–130', steps: 16, family: 'son-clave',
    kick: 'x.......x.......', top: 'x..x..x...x.x...', sound: 'snare', groove: 'straight', src: 'std',
    etymology: 'Cuban "son" = sound/voice. From "son cubano". 3-2 = three strokes first bar, two in second. Also Ga (Ghana) kpanlogo bell.',
    note: 'Also the kpanlogo bell of the Ga people of Ghana.' },

  { id: 'rumba', name: 'Rumba Clave 3-2', region: 'Timelines & claves', bpm: 110, range: '90–140', steps: 16, family: 'son-clave',
    kick: 'x.......x.......', top: 'x..x...x..x.x...', sound: 'snare', groove: 'straight', src: 'std',
    etymology: 'Cuban "rumba" = party/spree. From Bantu "rumba" = to dance. 3-2 clave with 3rd stroke delayed. Central African roots.',
    note: 'Third stroke delayed by a sixteenth. Close to several Central African timelines.' },

  { id: 'bossa', name: 'Bossa Clave', region: 'Timelines & claves', bpm: 120, range: '100–140', steps: 16, family: 'son-clave',
    kick: 'x.....x.x.....x.', top: 'x..x..x...x..x..', sound: 'snare', groove: 'straight', src: 'std',
    etymology: 'Portuguese "bossa" = bump/hump/trend. "Bossa nova" = new trend. Jobim/Gilberto 1958. Son clave with last stroke delayed.',
    note: 'Son clave with the last stroke delayed.' },

  { id: 'bell12', name: 'Standard Bell (12/8)', region: 'Timelines & claves', bpm: 120, range: '100–160', steps: 12, family: 'bell12',
    kick: F12, top: 'x.x.xx.x.x.x', sound: 'snare', groove: 'tri:even', src: 'std',
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

  { id: 'afrobeat', name: 'Afrobeat (Tony Allen)', region: 'Nigeria', bpm: 110, range: '100–125', steps: 16, family: 'afrobeat',
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

  { id: 'makossa', name: 'Makossa', region: 'Central Africa & Lusophone', bpm: 120, range: '110–130', steps: 16, family: 'makossa',
    kick: F, top: '..x...x...x...x.', sound: 'snare', groove: 'sw16:56', src: 'approx',
    etymology: 'Duala (Cameroon) "makossa" = dance (from "kossa" = to dance). Manu Dibango "Soul Makossa" 1972. Precursor to disco.',
    note: 'Douala, Cameroon.' },

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
  { id: 'gqom', name: 'Gqom', region: 'South Africa', bpm: 125, range: '120–130', steps: 16, family: 'gqom',
    kick: 'X...X.....X...X.', top: '.x.x.x.x.x.x.x.x', sound: 'tom', groove: 'ab:Gqom Kick Accent 16ths 125 bpm', src: 'agr',
    etymology: 'Zulu "gqom" = drum / hit / thud. Onomatopoeic. Durban taxi-rank sound. 2010s+ (DJ Lag, Rudeboyz). Broken 4/4, off-grid.',
    note: 'Durban. Kick is the accent pattern in Ableton\'s "Gqom Kick Accent" groove; the same file gives the off-16ths their lag.' },

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
    kick: F, top: '...x..x...x..x.x', sound: 'tom', groove: 'ab:House Subtle Swung 16ths', src: 'approx',
    etymology: '"Afro house" = South African house (Culoe De Song, Black Coffee) + African percussion. Tresillo fragments over 4/4.',
    note: 'Percussion built from tresillo fragments over four on the floor.' },

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
    kick: 'x...x...x...x...', top: 'x.x.x.x.x.x.x.', sound: 'zabumba', groove: 'straight', src: 'std',
    etymology: 'From "baiano" = from Bahia. Or Tupi "mbaião" = shaman\'s rattle. Luiz Gonzaga "King of Baião". Accordion + zabumba + triangle.',
    note: 'Sertão rhythm. Accordion-led. Zabumba (bass drum) plays tresillo-based pattern. Triangle keeps 16ths. Precursor to forró.',
    topLines: [
      { name: 'Zabumba (bass drum)', pattern: 'x...x...x...x...', sound: 'dunun' },
      { name: 'Triangle', pattern: 'xxxxxxxxxxxxxxxx', sound: 'metal' },
      { name: 'Accordion (bass)', pattern: 'x.x.x.x.x.x.x.', sound: 'pluck' }
    ] },

  { id: 'forro', name: 'Forró (Pe-de-serra)', region: 'Brazil (Northeast)', bpm: 110, range: '100–120', steps: 16, family: 'samba',
    kick: 'x...x...x...x...', top: 'x.x.x.x.x.x.x.', sound: 'zabumba', groove: 'sw16:52', src: 'std',
    etymology: 'From English "for all" → "forró" (balls for all). Or "forrobodó" = confusion/party. Baião sped up for dance halls.',
    note: 'Baião sped up. Accordion + zabumba + triangle. Close partner dance. Dominguinhos, Luiz Gonzaga.',
    topLines: [
      { name: 'Zabumba', pattern: 'x...x...x...x...', sound: 'dunun' },
      { name: 'Triangle', pattern: 'xxxxxxxxxxxxxxxx', sound: 'metal' },
      { name: 'Accordion', pattern: 'x.x.x.x.x.x.x.', sound: 'pluck' }
    ] },

  { id: 'maracatu', name: 'Maracatu Nação', region: 'Brazil (Pernambuco)', bpm: 90, range: '80–100', steps: 16, family: 'samba',
    kick: 'x...x...x...x...', top: 'x..x.x..x..x.x..', sound: 'alfaia', groove: 'straight', src: 'std',
    etymology: 'From "maracatu" = "batuque de maracá" (maraca drumming). Or Yoruba "maracatu" = royal procession. Afro-Brazilian coronation ceremony.',
    note: 'Recife/Olinda carnival. Alfaia (large rope-tuned bass drum) + gonguê (bell) + caixa (snare) + abê (shaker). Slow, majestic, royal.',
    topLines: [
      { name: 'Alfaia (bass drum)', pattern: 'x..x.x..x..x.x..', sound: 'dunun' },
      { name: 'Gonguê (bell)', pattern: 'x.x.xx.x.x.x', sound: 'metal' },
      { name: 'Caixa (snare)', pattern: 'x.x.x.x.x.x.x.', sound: 'snare' },
      { name: 'Abê (shaker)', pattern: 'xxxxxxxxxxxxxxxx', sound: 'shaker' }
    ] },

  { id: 'maracatu-rural', name: 'Maracatu Rural (Baque Solto)', region: 'Brazil (Pernambuco)', bpm: 120, range: '110–130', steps: 16, family: 'samba',
    kick: 'x...x...x...x...', top: 'x.x.x.x.x.x.x.', sound: 'alfaia', groove: 'straight', src: 'std',
    etymology: '"Baque solto" = loose beat. Faster, looser than Nação. Triangles instead of gonguês. Rural workers\' carnival.',
    note: 'Faster, lighter. Triangle-heavy. "Caboclinho" indigenous dance influence. Improvisatory.',
    topLines: [
      { name: 'Alfaia', pattern: 'x.x.x.x.x.x.x.', sound: 'dunun' },
      { name: 'Triangle', pattern: 'xxxxxxxxxxxxxxxx', sound: 'metal' },
      { name: 'Caixa', pattern: 'x.x.x.x.x.x.x.', sound: 'snare' }
    ] },

  { id: 'partido-alto', name: 'Partido Alto', region: 'Brazil (Rio)', bpm: 110, range: '100–120', steps: 16, family: 'samba',
    kick: 'x..xx..xx..xx..x', top: 'x.x.x..x.x.x.x.', sound: 'pandeiro', groove: 'rs:samba', src: 'std',
    etymology: 'Portuguese "partido" = broken/divided + "alto" = high. "Broken high" — syncopated samba closest to Angolan umbigada roots.',
    note: 'Samba variant with distinctive pandeiro pattern. Call-response vocals. "Samba de partido alto" = improvised verses.',
    topLines: [
      { name: 'Pandeiro', pattern: 'x.x.x..x.x.x.x.', sound: 'shaker' },
      { name: 'Surdo (bass)', pattern: 'x..xx..xx..xx..x', sound: 'dunun' },
      { name: 'Repinique', pattern: 'x.x.x.x.x.x.x.', sound: 'snare' }
    ] },

  { id: 'coco', name: 'Coco (Zabumba)', region: 'Brazil (Northeast)', bpm: 100, range: '90–110', steps: 16, family: 'samba',
    kick: 'x...x...x...x...', top: 'xx.xx.xx.xx.xx', sound: 'zabumba', groove: 'sw16:54', src: 'std',
    etymology: 'Tupi "coco" = coconut (head). Or "co-co" = call-response. Circular dance with improvisation. Quilombola roots.',
    note: 'Call-response circle dance. Zabumba + pandeiro + ganzá. Women lead verses. Jackson do Pandeiro.',
    topLines: [
      { name: 'Zabumba', pattern: 'xx.xx.xx.xx.xx', sound: 'dunun' },
      { name: 'Pandeiro', pattern: 'x.x.x.x.x.x.x.', sound: 'shaker' },
      { name: 'Ganzá (shaker)', pattern: 'xxxxxxxxxxxxxxxx', sound: 'shaker' }
    ] },

  { id: 'ciranda', name: 'Ciranda', region: 'Brazil (Pernambuco)', bpm: 80, range: '70–90', steps: 16, family: 'samba',
    kick: 'x...x...x...x...', top: 'x.x.x.x.x.x.x.', sound: 'pandeiro', groove: 'sw16:58', src: 'std',
    etymology: 'Tupi "ciranda" = circle dance. Or Portuguese "ciranda" = children\'s ring game. Coastal fishing communities. Lia de Itamaracá.',
    note: 'Slow circle dance. Women sing, men play. Pandeiro + ganzá + viola. Sea/work themes. UNESCO heritage.',
    topLines: [
      { name: 'Pandeiro', pattern: 'x.x.x.x.x.x.x.', sound: 'shaker' },
      { name: 'Ganzá', pattern: 'xxxxxxxxxxxxxxxx', sound: 'shaker' },
      { name: 'Viola (guitar)', pattern: 'x...x...x...x...', sound: 'pluck' }
    ] },

  { id: 'frevo', name: 'Frevo', region: 'Brazil (Recife)', bpm: 140, range: '130–150', steps: 16, family: 'samba',
    kick: F, top: 'xx.xx.xx.xx.xx', sound: 'caixa', groove: 'straight', src: 'std',
    etymology: 'Portuguese "ferver" = to boil. "Frevo" = boiling over. Carnival street music. Capoeira-influenced acrobatic dance.',
    note: 'Fast, furious carnival. Brass + caixa + surdo. "Passo" = acrobatic dance moves. 140+ bpm. UNESCO heritage.',
    topLines: [
      { name: 'Caixa (snare)', pattern: 'xx.xx.xx.xx.xx', sound: 'snare' },
      { name: 'Surdo (bass)', pattern: 'x...x...x...x...', sound: 'dunun' },
      { name: 'Brass section', pattern: 'x.x.x.x.x.x.x.', sound: 'wind' }
    ] },

  { id: 'samba-reggae', name: 'Samba Reggae', region: 'Brazil (Bahia)', bpm: 100, range: '90–110', steps: 16, family: 'samba',
    kick: 'x..xx..xx..xx..x', top: 'x.x.x.x.x.x.x.', sound: 'surdo', groove: 'rs:samba', src: 'approx',
    etymology: 'Bahian "samba reggae" = Jamaican reggae offbeat + samba. Olodum, Ilê Aiyê. Black consciousness movement. 1980s+.',
    note: 'Reggae offbeat (and-of-2, and-of-4) over samba surdo. Surdo 1-2-3 + repinique. Carnival blocos afro.',
    topLines: [
      { name: 'Surdo 1 (low)', pattern: 'x...x...x...x...', sound: 'dunun' },
      { name: 'Surdo 2 (mid)', pattern: 'x..xx..xx..xx..x', sound: 'dunun' },
      { name: 'Surdo 3 (high)', pattern: 'x.x.x.x.x.x.x.', sound: 'dunun' },
      { name: 'Repinique', pattern: '.x.x.x.x.x.x.x', sound: 'snare' }
    ] },

  { id: 'pagode', name: 'Pagode', region: 'Brazil (Rio)', bpm: 105, range: '95–115', steps: 16, family: 'samba',
    kick: 'x..xx..xx..xx..x', top: 'x.x.x.x.x.x.x.', sound: 'pandeiro', groove: 'rs:samba', src: 'approx',
    etymology: 'Portuguese "pagode" = party/fun. Originally backyard samba party. 1980s+ commercial style (Fundo de Quintal).',
    note: 'Lighter samba. Pandeiro + tantã + repique de mão + cavaquinho. Round-robin singing. "Pagode romântico" = 1990s pop.',
    topLines: [
      { name: 'Pandeiro', pattern: 'x.x.x.x.x.x.x.', sound: 'shaker' },
      { name: 'Tantã (bass hand drum)', pattern: 'x..xx..xx..xx..x', sound: 'dunun' },
      { name: 'Repique de mão', pattern: 'x.x.x.x.x.x.x.', sound: 'snare' },
      { name: 'Cavaquinho', pattern: 'x.x.x.x.x.x.x.', sound: 'pluck' }
    ] },

  // ── Middle Eastern / Arab / Turkish ──
  // Merged into maqsum/dembow families where they share tresillo cells
  { id: 'baladi', name: 'Baladi (Masmoudi Saghir)', region: 'Egypt / Levant', bpm: 100, range: '90–110', steps: 16, family: 'maqsum',
    kick: 'x.......x.......', top: '..x.x...x...x...', sound: 'darbuka', groove: 'straight', src: 'std',
    etymology: 'Arabic "baladi" = of the country / rural / folk. "Masmoudi saghir" = small masmoudi. Americans call this "baladi"; Egyptians call many rhythms baladi.',
    note: 'The "little masmoudi" squeezed into 4/4. Dum on 1&3, tek-tak on 2&4. Earthy, grounded. Belly dance staple.',
    topLines: [
      { name: 'Darbuka', pattern: '..x.x...x...x...', sound: 'snare' },
      { name: 'Riq (tambourine)', pattern: 'x.x.x.x.x.x.x.', sound: 'metal' },
      { name: 'Daf (frame drum)', pattern: 'x...x...x...x...', sound: 'dunun' }
    ] },

  { id: 'masmoudi-kabir', name: 'Masmoudi Kabir (Big Masmoudi)', region: 'Egypt / Levant', bpm: 60, range: '50–70', steps: 16, family: 'maqsum',
    kick: 'x.......x.......', top: 'x.x.x...x.x.x.', sound: 'darbuka', groove: 'straight', src: 'std',
    etymology: '"Masmoudi" = from Masmud (Berber tribe). "Kabir" = big/large. 8/4 time (16 8ths). Tarab (classical) repertoire.',
    note: 'Slow 8/4. Two dum clusters. Used in muwashshah (classical vocal). "Walking masmoudi" fills gaps.',
    topLines: [
      { name: 'Darbuka', pattern: 'x.x.x...x.x.x.', sound: 'snare' },
      { name: 'Riq', pattern: 'x.x.x.x.x.x.x.x', sound: 'metal' },
      { name: 'Daf', pattern: 'x.......x.......', sound: 'dunun' }
    ] },

  { id: 'nawari-dabke', name: 'Nawari / Dabke', region: 'Levant (Lebanon, Syria, Palestine)', bpm: 110, range: '100–120', steps: 16, family: 'dembow',
    kick: 'x.......x.......', top: '..x...x.....x...', sound: 'darbuka', groove: 'straight', src: 'std',
    etymology: '"Nawari" = Romani/Gypsy. "Dabke" = stamping of feet. Line dance. Stomping rhythm. Folk weddings, protests.',
    note: 'Fast 4/4 drive. Tek on upbeats. Line dance with synchronized stomps. Political resistance symbol.',
    topLines: [
      { name: 'Darbuka', pattern: '..x...x.....x...', sound: 'snare' },
      { name: 'Daf', pattern: 'x...x...x...x...', sound: 'dunun' },
      { name: 'Mijwiz (reed)', pattern: 'x.x.x.x.x.x.x.', sound: 'wind' }
    ] },

  { id: 'ayyub', name: 'Ayyub', region: 'Egypt / Levant', bpm: 120, range: '110–130', steps: 8, family: 'dembow',
    kick: 'x.x.', top: '.x.x', sound: 'darbuka', groove: 'straight', src: 'std',
    etymology: '"Ayyub" = Job (biblical). 2/4 fast rhythm. Trance/zār healing. Also called "zaar" rhythm.',
    note: 'Fast 2/4. Minimal: dum-tek-tek. Used in zār (spirit possession healing) and belly dance entrances.',
    topLines: [
      { name: 'Darbuka', pattern: '.x.x', sound: 'snare' },
      { name: 'Riq', pattern: 'x.x.', sound: 'metal' }
    ] },

  { id: 'samai-thaqil', name: 'Samai Thaqil (Heavy Samai)', region: 'Turkey / Arab Classical', bpm: 80, range: '70–90', steps: 10, family: 'samai',
    kick: 'x...x...x.', top: 'x.x.x.x.x.x.', sound: 'darbuka', groove: 'straight', src: 'std',
    etymology: 'Arabic "samai" = from Turkish "saz semai" = instrumental form. "Thaqil" = heavy/slow. 10/8 = 3+2+2+3. Muwashshah repertoire.',
    note: '10/8 classical form. 3+2+2+3 grouping. Slow, dignified. Instrumental overture for vocal muwashshah.',
    topLines: [
      { name: 'Darbuka', pattern: 'x.x.x.x.x.x.', sound: 'snare' },
      { name: 'Riq', pattern: 'x.x.x.x.x.x.x', sound: 'metal' },
      { name: 'Keman (violin)', pattern: 'x...x...x.', sound: 'bow' }
    ] },

  { id: 'samai-darij', name: 'Samai Darij (Light Samai)', region: 'Turkey / Arab Classical', bpm: 120, range: '110–130', steps: 12, family: 'samai',
    kick: 'x..x..x.', top: 'x.x.x.x.x.', sound: 'darbuka', groove: 'tri:even', src: 'std',
    etymology: '"Darij" = light/fast. 3/4 or 6/8 feel. Faster vocal samai. Lighter character.',
    note: '3/4 or 6/8 feel. Faster than thaqil. Vocal and instrumental repertoire.',
    topLines: [
      { name: 'Darbuka', pattern: 'x.x.x.x.x.', sound: 'snare' },
      { name: 'Riq', pattern: 'x.x.x.x.x.x', sound: 'metal' }
    ] },

  { id: 'jurjina', name: 'Jurjina (Curcuna)', region: 'Iraq / Iran / Turkey', bpm: 100, range: '90–110', steps: 10, family: 'jurjina',
    kick: 'x...x...x.', top: 'x.x.x.x.x.', sound: 'darbuka', groove: 'straight', src: 'std',
    etymology: 'From "Gurj" = Georgia. Or "Jurjina" = Georgian woman. 10/8 = 2+2+2+2+2 or 3+3+2+2. Kurdish/Iraqi folk.',
    note: '10/8 driving rhythm. 5 groups of 2 or 3+3+2+2. Wedding dance. Chobi/Chopi line dance.',
    topLines: [
      { name: 'Darbuka', pattern: 'x.x.x.x.x.', sound: 'snare' },
      { name: 'Zurna (oboe)', pattern: 'x...x...x.', sound: 'wind' },
      { name: 'Daf', pattern: 'x...x...x.', sound: 'dunun' }
    ] },

  { id: 'kalamatianos', name: 'Kalamatianos', region: 'Greece', bpm: 100, range: '90–110', steps: 14, family: 'kalamatianos',
    kick: 'x...x...x...x.', top: 'x.x.x.x.x.x.x', sound: 'darbuka', groove: 'straight', src: 'std',
    etymology: 'Greek "Kalamatianos" = from Kalamata (Peloponnese). 7/8 = 3+2+2 (SQQ). Pan-Hellenic circle dance. Syrtos family.',
    note: '7/8 = 3+2+2. "Slow-quick-quick". Most popular Greek circle dance. 12-step pattern. Right foot leads.',
    topLines: [
      { name: 'Darbuka', pattern: 'x.x.x.x.x.x.x', sound: 'snare' },
      { name: 'Laouto (lute)', pattern: 'x...x...x...x.', sound: 'pluck' },
      { name: 'Lyra', pattern: 'x.x.x.x.x.x.x', sound: 'bow' }
    ] },

  { id: 'karsilama', name: 'Karsilama (9/8)', region: 'Turkey / Greece / Balkans', bpm: 110, range: '100–120', steps: 18, family: 'karsilama',
    kick: 'x...x...x...x...x.', top: 'x.x.x.x.x.x.x.x.', sound: 'darbuka', groove: 'straight', src: 'std',
    etymology: 'Turkish "karsilama" = face-to-face / greeting. 9/8 = 2+2+2+3. Couple dance. "Aksak" = limping.',
    note: '9/8 = 2+2+2+3 (QQQS). Face-to-face couple dance. Greek "karsilamas". Rom wedding music.',
    topLines: [
      { name: 'Darbuka', pattern: 'x.x.x.x.x.x.x.x.', sound: 'snare' },
      { name: 'Clarinet/Zurna', pattern: 'x...x...x...x...x.', sound: 'wind' },
      { name: 'Daf', pattern: 'x...x...x...x...x.', sound: 'dunun' }
    ] },

  { id: 'laz', name: 'Laz / Mantilatos (7/8)', region: 'Black Sea (Turkey/Georgia)', bpm: 120, range: '110–130', steps: 14, family: 'laz',
    kick: 'x...x...x...x.', top: 'x.x.x.x.x.x.x', sound: 'darbuka', groove: 'straight', src: 'std',
    etymology: '"Laz" = Laz people (Black Sea). "Mantilatos" = from Italian "mantello" = cloak. 7/8 = 3+2+2 or 2+2+3. Fast, energetic.',
    note: '7/8 Black Sea rhythm. Fast, driving. Horon (line dance). Knee lifts, sharp turns.',
    topLines: [
      { name: 'Darbuka', pattern: 'x.x.x.x.x.x.x', sound: 'snare' },
      { name: 'Tulum (bagpipe)', pattern: 'x...x...x...x.', sound: 'wind' },
      { name: 'Kemençe (fiddle)', pattern: 'x.x.x.x.x.x.x', sound: 'bow' }
    ] },

  { id: 'chiftetelli', name: 'Chiftetelli (8/4)', region: 'Turkey / Greece / Arab World', bpm: 60, range: '50–70', steps: 16, family: 'chiftetelli',
    kick: 'x.......x.......', top: 'x.x.x...x.x.x.', sound: 'darbuka', groove: 'straight', src: 'std',
    etymology: 'Turkish "çiftetelli" = double-stringed (violin). Or "çifte" = pair + "telli" = stringed. Belly dance staple. Slow, sensual.',
    note: '8/4 slow belly dance rhythm. Similar to masmoudi but distinct feel. Taxim (improvisation) friendly.',
    topLines: [
      { name: 'Darbuka', pattern: 'x.x.x...x.x.x.', sound: 'snare' },
      { name: 'Riq', pattern: 'x.x.x.x.x.x.x.x', sound: 'metal' },
      { name: 'Violin/Oud', pattern: 'x.......x.......', sound: 'bow' }
    ] },

  { id: 'dawr-hindi', name: 'Dawr Hindi / Devr-i Hindi (7/8)', region: 'Arab Classical / Turkey', bpm: 100, range: '90–110', steps: 14, family: 'dawr-hindi',
    kick: 'x...x...x...x.', top: 'x.x.x.x.x.x.x', sound: 'darbuka', groove: 'straight', src: 'std',
    etymology: '"Dawr hindi" = Indian cycle. "Devr-i hindi" = Ottoman Turkish for Indian cycle. 7/8 in muwashshah. Not actually Indian.',
    note: '7/8 classical form. 2+2+3 or 3+2+2. Named for exotic "Indian" association in Ottoman court.',
    topLines: [
      { name: 'Darbuka', pattern: 'x.x.x.x.x.x.x', sound: 'snare' },
      { name: 'Riq', pattern: 'x.x.x.x.x.x.x', sound: 'metal' },
      { name: 'Keman', pattern: 'x...x...x...x.', sound: 'bow' }
    ] },

  { id: 'wahda', name: 'Wahda (4/4)', region: 'Egypt / Levant', bpm: 90, range: '80–100', steps: 16, family: 'maqsum',
    kick: 'x.......x.......', top: 'x.x.x.x.x.x.x.', sound: 'darbuka', groove: 'straight', src: 'std',
    etymology: 'Arabic "wahda" = one / single. "Wahda kebira" = big one (8/4). Basic tarab (art music) rhythm.',
    note: 'Simple 4/4. Dum-tek-tek-tek. Foundation for tarab. "Wahda kebira" = 8/4 version.',
    topLines: [
      { name: 'Darbuka', pattern: 'x.x.x.x.x.x.x.', sound: 'snare' },
      { name: 'Riq', pattern: 'x.x.x.x.x.x.x.x', sound: 'metal' },
      { name: 'Oud', pattern: 'x.......x.......', sound: 'pluck' }
    ] },

  // ── Balkan Odd Meters ──
  { id: 'kopanitsa', name: 'Kopanitsa (11/16)', region: 'Bulgaria (Shopluk)', bpm: 160, range: '150–180', steps: 22, family: 'balkan-11',
    kick: 'x...x...x...x...x...x..', top: 'x.x.x.x.x.x.x.x.x.x', sound: 'tupan', groove: 'straight', src: 'std',
    etymology: 'Bulgarian "kopanitsa" = from "kopam" = to dig/hoe. "Digging dance." 11/16 = 2+2+3+2+2 (QQSQQ). Fast line dance.',
    note: '11/16 = 5 beats (2+2+3+2+2). "Quick-quick-slow-quick-quick." Shopluk region. Gankino horo = faster northern version.',
    topLines: [
      { name: 'Tupan (bass drum)', pattern: 'x...x...x...x...x...x..', sound: 'dunun' },
      { name: 'Tambura (lute)', pattern: 'x.x.x.x.x.x.x.x.x.x', sound: 'pluck' },
      { name: 'Gaida (bagpipe)', pattern: 'x...x...x...x...x...x..', sound: 'wind' }
    ] },

  { id: 'rachenitsa', name: 'Rachenitsa (7/16)', region: 'Bulgaria', bpm: 180, range: '170–200', steps: 14, family: 'balkan-7',
    kick: 'x...x...x...x.', top: 'x.x.x.x.x.x.x', sound: 'tupan', groove: 'straight', src: 'std',
    etymology: 'Bulgarian "rachenitsa" = from "rachena" = arm/hand. "Arm dance" — hands on hips/shoulders. 7/16 = 2+2+3 (QQS). Solo/couple/choral.',
    note: '7/16 = 3 beats (2+2+3). "Quick-quick-slow." National dance. Regional variations: Macedonian (slow), Thracian (fast).',
    topLines: [
      { name: 'Tupan', pattern: 'x...x...x...x.', sound: 'dunun' },
      { name: 'Tambura', pattern: 'x.x.x.x.x.x.x', sound: 'pluck' },
      { name: 'Gadulka (fiddle)', pattern: 'x...x...x...x.', sound: 'bow' }
    ] },

  { id: 'paidushko', name: 'Paidushko Horo (5/16)', region: 'Bulgaria / Macedonia', bpm: 200, range: '190–220', steps: 10, family: 'balkan-5',
    kick: 'x...x...x.', top: 'x.x.x.x.x', sound: 'tupan', groove: 'straight', src: 'std',
    etymology: 'Bulgarian "paidushko" = from "paidus" = child/lad. "Lad\'s dance." 5/16 = 2+3 (QS). Quick-slow heartbeat rhythm.',
    note: '5/16 = 2 beats (2+3). "Quick-slow" like rapid heartbeat. Simple but driving. Mixed-gender line dance.',
    topLines: [
      { name: 'Tupan', pattern: 'x...x...x.', sound: 'dunun' },
      { name: 'Tambura', pattern: 'x.x.x.x.x', sound: 'pluck' },
      { name: 'Gaida', pattern: 'x...x...x.', sound: 'wind' }
    ] },

  { id: 'gankino', name: 'Gankino Horo (11/16 fast)', region: 'Bulgaria (Northern)', bpm: 200, range: '190–220', steps: 22, family: 'balkan-11',
    kick: 'x...x...x...x...x...x..', top: 'x.x.x.x.x.x.x.x.x.x', sound: 'tupan', groove: 'straight', src: 'std',
    etymology: '"Gankino" = from personal name Ganka. Northern Bulgarian fast kopanitsa. "Gankino horo" = Ganka\'s dance.',
    note: 'Faster northern kopanitsa. Same 2+2+3+2+2 but 200+ bpm. Virtuoso gaida/tambura.',
    topLines: [
      { name: 'Tupan', pattern: 'x...x...x...x...x...x..', sound: 'dunun' },
      { name: 'Tambura', pattern: 'x.x.x.x.x.x.x.x.x.x', sound: 'pluck' },
      { name: 'Gaida', pattern: 'x...x...x...x...x...x..', sound: 'wind' }
    ] },

  { id: 'lesno', name: 'Lesno (7/8 slow)', region: 'Macedonia / Bulgaria', bpm: 90, range: '80–100', steps: 14, family: 'balkan-7',
    kick: 'x...x...x...x.', top: 'x.x.x.x.x.x.x', sound: 'tupan', groove: 'straight', src: 'std',
    etymology: 'Macedonian "lesno" = easy/simple. Slow 7/8 = 3+2+2. "Macedonian ruchenitsa." Wedding dance.',
    note: 'Slow 7/8 (3+2+2). Easier "Macedonian ruchenitsa." Weighted steps. Often at weddings.',
    topLines: [
      { name: 'Tupan', pattern: 'x...x...x...x.', sound: 'dunun' },
      { name: 'Tambura', pattern: 'x.x.x.x.x.x.x', sound: 'pluck' },
      { name: 'Kaval (flute)', pattern: 'x...x...x...x.', sound: 'wind' }
    ] },

  { id: 'daychovo', name: 'Daychovo Horo (9/16)', region: 'Bulgaria (Thrace)', bpm: 140, range: '130–150', steps: 18, family: 'balkan-9',
    kick: 'x...x...x...x...x.', top: 'x.x.x.x.x.x.x.x.', sound: 'tupan', groove: 'straight', src: 'std',
    etymology: '"Daychovo" = from "Daycho" (personal name). Thracian 9/16 = 2+2+2+3. "Quick-quick-quick-slow."',
    note: '9/16 = 4 beats (2+2+2+3). Thracian style. Fast, energetic. Often transitions to rachenitsa.',
    topLines: [
      { name: 'Tupan', pattern: 'x...x...x...x...x.', sound: 'dunun' },
      { name: 'Tambura', pattern: 'x.x.x.x.x.x.x.x.', sound: 'pluck' },
      { name: 'Gaida', pattern: 'x...x...x...x...x.', sound: 'wind' }
    ] },

  { id: 'sedi-donka', name: 'Sedi Donka (25/16)', region: 'Bulgaria', bpm: 120, range: '110–130', steps: 50, family: 'balkan-complex',
    kick: 'x...x...x...x...x...x...x...x...x...x...x...x..', top: 'x.x.x.x.x.x.x.x.x.x.x.x.x.x.x.x.x.x.x.x.x.x.x', sound: 'tupan', groove: 'straight', src: 'std',
    etymology: '"Sedi Donka" = "Donka sits." 25/16 = 7/16 + 11/16 + 7/16 (SQQ + QQSQQ + SQQ). Mixed meter masterpiece.',
    note: '25/16 = mixed meter: 7/16 + 11/16 + 7/16. "SQQ + QQSQQ + SQQ." One of the most complex Balkan dances. Vocal version exists.',
    topLines: [
      { name: 'Tupan', pattern: 'x...x...x...x...x...x...x...x...x...x...x...x..', sound: 'dunun' },
      { name: 'Voice (call)', pattern: 'x.x.x.x.x.x.x.x.x.x.x.x.x.x.x.x.x.x.x.x.x.x.x', sound: 'voice' }
    ] },

  // ── Indian Classical Talas ──
  { id: 'misra-chapu', name: 'Misra Chapu (7/8)', region: 'South India (Carnatic)', bpm: 80, range: '70–90', steps: 14, family: 'tala-7',
    kick: 'x...x...x...x.', top: 'x.x.x.x.x.x.x', sound: 'mridangam', groove: 'straight', src: 'std',
    etymology: 'Sanskrit "misra" = mixed/7 + "chapu" = beat/clap. 7 beats = 3+2+2 (tali-khali-tali). No anga structure — pure clap-wave.',
    note: '7 beats = 3+2+2. Clap on 1, wave on 4, clap on 6. Padams, javalis. "Ta-ka di-mi ta-ki-ta." Distinctive lilt.',
    topLines: [
      { name: 'Mridangam', pattern: 'x.x.x.x.x.x.x', sound: 'dunun' },
      { name: 'Ghatam (clay pot)', pattern: 'x...x...x...x.', sound: 'metal' },
      { name: 'Kanjira (frame drum)', pattern: 'x.x.x.x.x.x.x', sound: 'snare' }
    ] },

  { id: 'khanda-chapu', name: 'Khanda Chapu (10/8)', region: 'South India (Carnatic)', bpm: 100, range: '90–110', steps: 20, family: 'tala-10',
    kick: 'x...x...x...x...x.', top: 'x.x.x.x.x.x.x.x.x.', sound: 'mridangam', groove: 'straight', src: 'std',
    etymology: 'Sanskrit "khanda" = 5 + "chapu" = beat. 10 beats = 5+5 (2+3 | 2+3). Two 5-beat halves. Asymmetric within symmetry.',
    note: '10 beats = 5+5, each 2+3. Clap on 1, wave on 4, clap on 6, wave on 9. Rare but beautiful.',
    topLines: [
      { name: 'Mridangam', pattern: 'x.x.x.x.x.x.x.x.x.', sound: 'dunun' },
      { name: 'Ghatam', pattern: 'x...x...x...x...x.', sound: 'metal' },
      { name: 'Morsing (jaw harp)', pattern: 'x.x.x.x.x.x.x.x.x.', sound: 'pluck' }
    ] },

  { id: 'rupak-tala', name: 'Rupak Tala (7/8)', region: 'North India (Hindustani)', bpm: 80, range: '70–90', steps: 14, family: 'tala-7',
    kick: 'x...x...x...x.', top: 'x.x.x.x.x.x.x', sound: 'tabla', groove: 'straight', src: 'std',
    etymology: 'Sanskrit "rupak" = beautiful/form. 7 beats = 3+2+2 (khali-tali-tali). Wave on 1, claps on 4&6. Mughlai/Roopak.',
    note: '7 beats = 3+2+2 but starts on KHALI (wave) = beat 1 is empty. Unique "offbeat" start. Bhajans, khayal.',
    topLines: [
      { name: 'Tabla (dayan/bayan)', pattern: 'x.x.x.x.x.x.x', sound: 'dunun' },
      { name: 'Harmonium', pattern: 'x...x...x...x.', sound: 'pluck' },
      { name: 'Manjira (cymbals)', pattern: 'x.x.x.x.x.x.x', sound: 'metal' }
    ] },

  { id: 'ektal', name: 'Ektal (12/8)', region: 'North India (Hindustani)', bpm: 60, range: '50–70', steps: 12, family: 'tala-12',
    kick: 'x..x..x..x..', top: 'x.x.x.x.x.x.x.x.x.x.x', sound: 'tabla', groove: 'tri:even', src: 'std',
    etymology: 'Sanskrit "eka" = one + "tal" = clap. 12 beats = 2+2+2+2+2+2. 6 vibhags. Khayal, dhrupad. "Chautal" = 12-beat cousin.',
    note: '12 beats = 6 groups of 2. Clap-wave-clap-wave-clap-wave. Slow, stately. Dhrupad, khayal accompaniment.',
    topLines: [
      { name: 'Tabla', pattern: 'x.x.x.x.x.x.x.x.x.x.x', sound: 'dunun' },
      { name: 'Pakhavaj', pattern: 'x..x..x..x..', sound: 'dunun' },
      { name: 'Manjira', pattern: 'x.x.x.x.x.x.x.x.x.x.x', sound: 'metal' }
    ] },

  { id: 'jhaptal', name: 'Jhaptal (10/8)', region: 'North India (Hindustani)', bpm: 100, range: '90–110', steps: 20, family: 'tala-10',
    kick: 'x...x...x...x...x.', top: 'x.x.x.x.x.x.x.x.x.', sound: 'tabla', groove: 'straight', src: 'std',
    etymology: 'Sanskrit "jhap" = 10 + "tal" = clap. 10 beats = 2+3+2+3. Uneven vibhags. Khayal, tarana. Distinctive swing.',
    note: '10 beats = 2+3+2+3. Clap on 1, wave on 3, clap on 6, wave on 8. Asymmetric swing feel.',
    topLines: [
      { name: 'Tabla', pattern: 'x.x.x.x.x.x.x.x.x.', sound: 'dunun' },
      { name: 'Sitar', pattern: 'x...x...x...x...x.', sound: 'pluck' },
      { name: 'Manjira', pattern: 'x.x.x.x.x.x.x.x.x.', sound: 'metal' }
    ] },

  // ── Flamenco (Andalusian) ──
  // Merges into 12/8 bell family (soleá, bulerías share 12-beat compás)
  { id: 'solea', name: 'Soleá (12-beat)', region: 'Andalusia (Flamenco)', bpm: 80, range: '70–90', steps: 12, family: 'bell12',
    kick: 'x..x..x..x..', top: 'x.x.xx.x.x.x', sound: 'cajon', groove: 'straight', src: 'std',
    etymology: 'Spanish "soleá" = from "soledad" = solitude/loneliness. Mother of flamenco palos. 12-beat compás = 3+3+2+2+2.',
    note: '12-beat compás = 3+3+2+2+2 (accents on 3,6,8,10,12). Deep, solemn. Cante jondo. "Mother of all palos."',
    topLines: [
      { name: 'Cajón', pattern: 'x.x.xx.x.x.x', sound: 'dunun' },
      { name: 'Palmas (handclaps)', pattern: 'x.x.xx.x.x.x', sound: 'clap' },
      { name: 'Guitar (rasgueado)', pattern: 'x..x..x..x..', sound: 'pluck' }
    ] },

  { id: 'bulerias', name: 'Bulerías (12-beat fast)', region: 'Andalusia (Flamenco)', bpm: 220, range: '200–240', steps: 12, family: 'bell12',
    kick: 'x..x..x..x..', top: 'x.x.xx.x.x.x', sound: 'cajon', groove: 'straight', src: 'std',
    etymology: 'Spanish "bulería" = from "burlar" = to mock/jest. Festive, fast 12-beat. Party finale. Jerez/Gitano heartland.',
    note: 'Fast 12-beat (220+ bpm). Same compás as soleá but playful. "Fiesta" rhythm. Offbeat accents. Palmas on 12,3,6,8,10.',
    topLines: [
      { name: 'Cajón', pattern: 'x.x.xx.x.x.x', sound: 'dunun' },
      { name: 'Palmas', pattern: 'x.x.xx.x.x.x', sound: 'clap' },
      { name: 'Guitar', pattern: 'x..x..x..x..', sound: 'pluck' }
    ] },

  { id: 'alegrias', name: 'Alegrías (12-beat major)', region: 'Andalusia (Flamenco)', bpm: 100, range: '90–110', steps: 12, family: 'bell12',
    kick: 'x..x..x..x..', top: 'x.x.xx.x.x.x', sound: 'cajon', groove: 'straight', src: 'std',
    etymology: 'Spanish "alegría" = joy. Major key 12-beat. Cádiz origin. Lighter than soleá. "Alegrías de Cádiz."',
    note: 'Major key 12-beat compás. Same accent structure as soleá (3,6,8,10,12) but major mode. Dancing, festive.',
    topLines: [
      { name: 'Cajón', pattern: 'x.x.xx.x.x.x', sound: 'dunun' },
      { name: 'Palmas', pattern: 'x.x.xx.x.x.x', sound: 'clap' },
      { name: 'Guitar', pattern: 'x..x..x..x..', sound: 'pluck' }
    ] },

  { id: 'tangos-flamenco', name: 'Tangos Flamenco (4/4)', region: 'Andalusia (Flamenco)', bpm: 120, range: '110–130', steps: 16, family: 'tangos',
    kick: 'x...x...x...x...', top: 'x.x.x.x.x.x.x.', sound: 'cajon', groove: 'straight', src: 'std',
    etymology: 'African "tango" = drum/dance place. Or Cuban "tango" = touch. 4/4 flamenco. Not Argentine tango. Gitano wedding rhythm.',
    note: '4/4 flamenco (not Argentine). Cajón + palmas. "Tangos de Málaga/Granada." Playful, sensual. 120 bpm.',
    topLines: [
      { name: 'Cajón', pattern: 'x.x.x.x.x.x.x.', sound: 'dunun' },
      { name: 'Palmas', pattern: 'x.x.x.x.x.x.x.', sound: 'clap' },
      { name: 'Guitar', pattern: 'x...x...x...x...', sound: 'pluck' }
    ] },

  { id: 'rumba-flamenca', name: 'Rumba Flamenca (4/4)', region: 'Andalusia (Flamenco)', bpm: 130, range: '120–140', steps: 16, family: 'rumba-flamenca',
    kick: F, top: 'x.x.x.x.x.x.x.', sound: 'cajon', groove: 'sw16:52', src: 'std',
    etymology: 'Cuban "rumba" → flamenco via return migration (ida y vuelta). 4/4 with Cuban clave feel. Gipsy Kings style.',
    note: 'Cuban rumba → flamenco. 4/4 with tresillo feel. "Rumba catalana" (Peret, Gipsy Kings). Party rhythm.',
    topLines: [
      { name: 'Cajón', pattern: 'x.x.x.x.x.x.x.', sound: 'dunun' },
      { name: 'Palmas', pattern: 'x.x.x.x.x.x.x.', sound: 'clap' },
      { name: 'Guitar (strum)', pattern: 'x.x.x.x.x.x.x.', sound: 'pluck' }
    ] },

  // ── Caribbean / Latin Additions ──
  { id: 'plena', name: 'Plena', region: 'Puerto Rico', bpm: 100, range: '90–110', steps: 16, family: 'tresillo',
    kick: 'x...x...x...x...', top: 'x.x.x.x.x.x.x.', sound: 'pandereta', groove: 'straight', src: 'std',
    etymology: 'Spanish "plena" = full/complete. "Periódico cantao" = sung newspaper. Ponce, early 1900s. Pandereta (frame drum) choir.',
    note: 'Call-response. Three panderetas (seguidor, segundo, requinto) + güiro + accordion. News, protest, satire. "Plena libre."',
    topLines: [
      { name: 'Pandereta (requinto lead)', pattern: 'x.x.x.x.x.x.x.', sound: 'snare' },
      { name: 'Pandereta (segundo)', pattern: 'x...x...x...x...', sound: 'snare' },
      { name: 'Pandereta (seguidor)', pattern: 'x.......x.......', sound: 'dunun' },
      { name: 'Güiro', pattern: 'xxxxxxxxxxxxxxxx', sound: 'scraper' }
    ] },

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

  { id: 'bomba-yuba', name: 'Bomba Yubá', region: 'Puerto Rico', bpm: 90, range: '80–100', steps: 16, family: 'bomba',
    kick: 'x...x...x...x...', top: 'x.x.x.x.x.x.x.', sound: 'barril', groove: 'sw16:54', src: 'std',
    etymology: '"Yubá" = Yoruba root. Another bomba sub-style. Slower, heavier. Call-response between dancer and lead drummer.',
    note: 'Slower 4/4 bomba. Same instruments. Dancer marks accents with "piquetes" (foot stamps). Spiritual.',
    topLines: [
      { name: 'Barril (lead)', pattern: 'x.x.x.x.x.x.x.', sound: 'dunun' },
      { name: 'Buleador', pattern: 'x...x...x...x...', sound: 'dunun' },
      { name: 'Cuá', pattern: 'xxxxxxxxxxxx', sound: 'metal' }
    ] },

  { id: 'merengue', name: 'Merengue (Dominican)', region: 'Dominican Republic', bpm: 140, range: '130–150', steps: 16, family: 'dembow',
    kick: F, top: 'x.x.x.x.x.x.x.', sound: 'tambora', groove: 'straight', src: 'std',
    etymology: 'French "meringue" = whipped egg whites. Or African "merengue" = dance. Haitian "méring" influence. Nacional rhythm. 1840s+.',
    note: 'Fast 4/4. Tambora (double-headed drum) + güira + accordion. "Merengue típico" = perico ripiao. 140+ bpm.',
    topLines: [
      { name: 'Tambora', pattern: 'x.x.x.x.x.x.x.', sound: 'dunun' },
      { name: 'Güira (scraper)', pattern: 'xxxxxxxxxxxxxxxx', sound: 'scraper' },
      { name: 'Accordion', pattern: 'x.x.x.x.x.x.x.', sound: 'pluck' }
    ] },

  { id: 'bachata', name: 'Bachata', region: 'Dominican Republic', bpm: 120, range: '110–130', steps: 16, family: 'bachata',
    kick: 'x...x...x...x...', top: 'x.x.x.x.x.x.x.', sound: 'bongo', groove: 'straight', src: 'std',
    etymology: 'African "bachata" = party/celebration. Or "bachatear" = to party. Rural guitar music. 1960s marginalized, 1990s global (Aventura).',
    note: 'Bolero-based. Bongo (macho/hembra) + güira + bass + guitar (requinto). "Pop bachata" = electric. Sensual partner dance.',
    topLines: [
      { name: 'Bongo (macho/hembra)', pattern: 'x.x.x.x.x.x.x.', sound: 'dunun' },
      { name: 'Güira', pattern: 'xxxxxxxxxxxxxxxx', sound: 'scraper' },
      { name: 'Bass', pattern: 'x...x...x...x...', sound: 'bass' },
      { name: 'Requinto (lead guitar)', pattern: 'x.x.x.x.x.x.x.', sound: 'pluck' }
    ] },

  { id: 'cumbia', name: 'Cumbia', region: 'Colombia (Caribbean Coast)', bpm: 100, range: '90–110', steps: 16, family: 'dembow',
    kick: 'x...x...x...x...', top: 'x.x.x.x.x.x.x.', sound: 'tambora', groove: 'sw16:52', src: 'std',
    etymology: 'African "cumbé" = dance/celebration. Or "cumbe" = Kikongo for navel. Indigenous (gaita) + African (drum) + European (accordion).',
    note: 'Gaita (cactus flute) + tambora + llamador + maracas. "Cumbia clásica" instrumental. "Cumbia villera" = Argentine shantytown style.',
    topLines: [
      { name: 'Tambora (bass)', pattern: 'x...x...x...x...', sound: 'dunun' },
      { name: 'Llamador (mid)', pattern: 'x.x.x.x.x.x.x.', sound: 'snare' },
      { name: 'Gaita (flute)', pattern: 'x.x.x.x.x.x.x.', sound: 'wind' },
      { name: 'Maracas', pattern: 'xxxxxxxxxxxx', sound: 'shaker' }
    ] },

  { id: 'vallenato', name: 'Vallenato', region: 'Colombia (Valledupar)', bpm: 100, range: '90–110', steps: 16, family: 'cumbia',
    kick: 'x...x...x...x...', top: 'x.x.x.x.x.x.x.', sound: 'caja', groove: 'straight', src: 'std',
    etymology: '"Vallenato" = from Valle de Upar (Valledupar). "Born in the valley." Caja + guacharaca + accordion. 4 airs: paseo, merengue, son, puya.',
    note: 'Caja (box drum) + guacharaca (scraper) + accordion. 4 rhythmic airs. Storytelling. UNESCO heritage.',
    topLines: [
      { name: 'Caja (box drum)', pattern: 'x.x.x.x.x.x.x.', sound: 'snare' },
      { name: 'Guacharaca (scraper)', pattern: 'xxxxxxxxxxxx', sound: 'scraper' },
      { name: 'Accordion', pattern: 'x.x.x.x.x.x.x.', sound: 'pluck' },
      { name: 'Bass', pattern: 'x...x...x...x...', sound: 'bass' }
    ] },

  { id: 'joropo', name: 'Joropo', region: 'Venezuela / Colombia (Llanos)', bpm: 140, range: '130–150', steps: 16, family: 'joropo',
    kick: 'x...x...x...x...', top: 'x.x.x.x.x.x.x.', sound: 'maracas', groove: 'sw16:60', src: 'std',
    etymology: 'From "jaropo" = Arabic "xarop" = syrup/sweet. Or "joropo" = party. Llanero (cowboy) music. Harp + cuatro + maracas.',
    note: 'Fast 6/8 feel in 4/4. Harp (arpista) + cuatro (4-string) + maracas. "Golpe" = rhythmic pattern. Virtuosic harp.',
    topLines: [
      { name: 'Harp (arpista)', pattern: 'x.x.x.x.x.x.x.', sound: 'pluck' },
      { name: 'Cuatro', pattern: 'x.x.x.x.x.x.x.', sound: 'pluck' },
      { name: 'Maracas', pattern: 'xxxxxxxxxxxx', sound: 'shaker' },
      { name: 'Bandola', pattern: 'x...x...x...x...', sound: 'pluck' }
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
      { name: 'Nono (bell)', pattern: 'x.x.xx.x.x.x', sound: 'metal' },
      { name: 'Gankogui', pattern: 'x...x...x...', sound: 'metal' }
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

  { id: 'bata-santeria', name: 'Batá (Santería/Lucumí)', region: 'Cuba (Yoruba/Lucumí)', bpm: 120, range: '110–130', steps: 12, family: 'bata',
    kick: 'x..x..x..x..', top: 'x.x.x.x.x.x.', sound: 'iya-ilu', groove: 'rs:polak', src: 'std',
    etymology: 'Yoruba "bàtá" = three-drum ensemble for Shango. Lucumí (Cuban Yoruba) preserves language. Iya-ilu = mother drum speaks.',
    note: 'Sacred trio for orishas. Iya-ilu (mother/lead) + omele ako (male) + omele abo (female). Only initiates (omobatá) play. Each orisha = distinct toque.',
    topLines: [
      { name: 'Iya-ilu (mother)', pattern: 'x.x.x.x.x.x.', sound: 'dunun' },
      { name: 'Omele ako (male)', pattern: '.x.x.x.x.x.x', sound: 'dunun' },
      { name: 'Omele abo (female)', pattern: 'x...x...x...', sound: 'dunun' },
      { name: 'Shaker (ache)', pattern: 'x...x...x...', sound: 'shaker' }
    ] },

  { id: 'nyabinghi', name: 'Nyabinghi (Rastafari)', region: 'Jamaica (Rastafari)', bpm: 60, range: '50–70', steps: 16, family: 'nyabinghi',
    kick: 'x.......x.......', top: 'x.x.x.x.x.x.x.', sound: 'fundeh', groove: 'straight', src: 'std',
    etymology: '"Nyabinghi" = East African queen/warrior spirit. Rasta "binghi" = heartbeat of Africa. Three drums: bass, fundeh, repeater.',
    note: 'Rasta heart-beat. Bass (thunder) on 1&3, fundeh (heart) on 2&4, repeater (spirit) improvises. Groundation ceremony.',
    topLines: [
      { name: 'Bass (thunder)', pattern: 'x.......x.......', sound: 'dunun' },
      { name: 'Fundeh (heart)', pattern: 'x.x.x.x.x.x.x.', sound: 'dunun' },
      { name: 'Repeater (spirit)', pattern: 'x.x.x.x.x.x.x.', sound: 'snare' }
    ] },

  { id: 'kumina', name: 'Kumina (Jamaica)', region: 'Jamaica (African retention)', bpm: 100, range: '90–110', steps: 16, family: 'kumina',
    kick: 'x...x...x...x...', top: 'x.x.x.x.x.x.x.', sound: 'kbandu', groove: 'sw16:58', src: 'std',
    etymology: 'Kikongo "kumina" = drum/dance. Congo/Angola retention in Jamaica. St. Thomas parish. Two drums: kbandu (bass) + playing cast (lead).',
    note: 'Congo retention. Kbandu (bass) + playing cast (lead) + shakka (scraper). Spirit possession. "Country" style.',
    topLines: [
      { name: 'Kbandu (bass)', pattern: 'x...x...x...x...', sound: 'dunun' },
      { name: 'Playing cast (lead)', pattern: 'x.x.x.x.x.x.x.', sound: 'snare' },
      { name: 'Shakka (scraper)', pattern: 'xxxxxxxxxxxx', sound: 'scraper' }
    ] },

  // ── Maghreb / Andalusian (North Africa classical) ──
  { id: 'andalusi-nuba', name: 'Andalusi Nuba (Moroccan Classical)', region: 'Morocco / Algeria / Tunisia', bpm: 70, range: '60–80', steps: 16, family: 'andalusi',
    kick: 'x...x...x...x...', top: 'x.x.x.x.x.x.x.', sound: 'darbuka', groove: 'straight', src: 'std',
    etymology: '"Andalusi" = from Al-Andalus (Islamic Spain). "Nuba" = suite/mode. 1492 expulsion brought this to Maghreb. 11 nubat (modes).',
    note: 'Classical suite. Oud + rebab + qanun + darbuka + taarija. Each nuba = 5 movements (msaddar, btayhi, darj, insiraf, khlas). Tarab = ecstasy.',
    topLines: [
      { name: 'Darbuka', pattern: 'x.x.x.x.x.x.x.', sound: 'snare' },
      { name: 'Taarija (clay drum)', pattern: 'x...x...x...x...', sound: 'dunun' },
      { name: 'Oud', pattern: 'x.x.x.x.x.x.x.', sound: 'pluck' },
      { name: 'Rebab (fiddle)', pattern: 'x.x.x.x.x.x.x.', sound: 'bow' }
    ] },

  { id: 'ghaita', name: 'Ghaita (Moroccan Oboe Rhythm)', region: 'Morocco (Berber/Rif)', bpm: 140, range: '130–150', steps: 16, family: 'ghaita',
    kick: 'x...x...x...x...', top: 'x.x.x.x.x.x.x.', sound: 'ghaita', groove: 'straight', src: 'std',
    etymology: 'Arabic "ghaita" = from "ghayta" = bagpipe/oboe. Double-reed. Rif mountain weddings. "Master of the dance."',
    note: 'Double-reed oboe + bendir + tabl (bass drum). Outdoor festivals, weddings. Circular breathing. Trance-inducing.',
    topLines: [
      { name: 'Ghaita (oboe)', pattern: 'x.x.x.x.x.x.x.', sound: 'wind' },
      { name: 'Bendir (frame drum)', pattern: 'x.x.x.x.x.x.x.', sound: 'dunun' },
      { name: 'Tabl (bass drum)', pattern: 'x...x...x...x...', sound: 'dunun' }
    ] },

  // ── West African (additional) ──
  { id: 'yankadi-makru', name: 'Yankadi-Makru (paired)', region: 'Guinea (Mandé)', bpm: 110, range: '100–130', steps: 16, family: 'djembe',
    kick: 'x...x...x...x...', top: 'x.x.x.x.x.x.x.', sound: 'djembe', groove: 'sw16:58', src: 'std',
    etymology: '"Yankadi" = slow courting dance. "Makru" = fast version. Always paired — transition marks the shift from flirtation to passion.',
    note: 'Paired rhythms. Yankadi (slow, 80 bpm, swing) → Makru (fast, 140 bpm, straight). Same dunun parts. DJEMBE lead changes density.',
    topLines: [
      { name: 'Djembe lead (Yankadi)', pattern: '.x..x...x..x....', sound: 'djembe' },
      { name: 'Djembe lead (Makru)', pattern: 'x.x.x.x.x.x.x.x.', sound: 'djembe' },
      { name: 'Kenkeni', pattern: 'x...x...x...x...', sound: 'dunun' },
      { name: 'Sangban', pattern: '..x...x...x...x.', sound: 'dunun' },
      { name: 'Dununba', pattern: 'x.......x.......', sound: 'dunun' }
    ] },

  { id: 'sorsonet', name: 'Sorsonet (Baga)', region: 'Guinea (Baga)', bpm: 130, range: '120–140', steps: 16, family: 'djembe',
    kick: 'x...x...x...x...', top: 'x.x.x.x.x.x.x.', sound: 'djembe', groove: 'tri:even', src: 'std',
    etymology: 'Baga "sorsonet" = "the protection" or "the mask." Female initiation (bondo). Masked spirit dance. Women\'s power.',
    note: 'Female initiation rhythm. Only women dance. Djembe lead mimics mask movements. Sacred, not recreational.',
    topLines: [
      { name: 'Djembe lead', pattern: 'x.x.x.x.x.x.x.', sound: 'djembe' },
      { name: 'Djembe accomp.', pattern: '.x.x.x.x.x.x.x.', sound: 'djembe' },
      { name: 'Kenkeni', pattern: 'x...x...x...x...', sound: 'dunun' },
      { name: 'Sangban', pattern: '..x...x...x...x.', sound: 'dunun' }
    ] },

  { id: 'toro', name: 'Toro (Mandé)', region: 'Guinea/Mali (Mandé)', bpm: 120, range: '110–130', steps: 16, family: 'djembe',
    kick: 'x...x...x...x...', top: 'x.x.x.x.x.x.x.', sound: 'djembe', groove: 'sw16:58', src: 'std',
    etymology: 'Maninka "toro" = bull. Strength, virility. Men\'s dance. Originally for hunters\' ceremonies. "Toro" = also a dununba family rhythm.',
    note: 'Men\'s strength dance. Dununba family. Heavy bass. Hunters\' guild. Similar to dununba but distinct sangban phrasing.',
    topLines: [
      { name: 'Djembe lead', pattern: 'x.x.x.x.x.x.x.', sound: 'djembe' },
      { name: 'Djembe accomp.', pattern: '.x.x.x.x.x.x.x.', sound: 'djembe' },
      { name: 'Kenkeni', pattern: 'x...x...x...x...', sound: 'dunun' },
      { name: 'Sangban', pattern: '.x..x.x..x..x.x.', sound: 'dunun' },
      { name: 'Dununba', pattern: 'x..x..x...x..x..', sound: 'dunun' }
    ] },

  // ── Afro-Peruvian ──
  { id: 'festejo', name: 'Festejo', region: 'Peru (Afro-Peruvian)', bpm: 120, range: '110–130', steps: 16, family: 'festejo',
    kick: 'x...x...x...x...', top: 'x.x.x.x.x.x.x.', sound: 'cajon', groove: 'tri:even', src: 'std',
    etymology: 'Spanish "festejo" = celebration/party. Afro-Peruvian coastal (Chincha, Cañete). Cajón + cajita + quijada. "Alcatraz" = courtship dance.',
    note: 'Cajón (box drum) + cajita (box) + quijada (jawbone). Syncopated 4/4. "Ingá" = Yoruba-derived call. Susana Baca.',
    topLines: [
      { name: 'Cajón', pattern: 'x.x.x.x.x.x.x.', sound: 'dunun' },
      { name: 'Cajita (box)', pattern: 'x...x...x...x...', sound: 'metal' },
      { name: 'Quijada (jawbone)', pattern: 'xxxxxxxxxxxx', sound: 'quijada' },
      { name: 'Guitar', pattern: 'x...x...x...x...', sound: 'pluck' }
    ] },

  { id: 'lando', name: 'Landó', region: 'Peru (Afro-Peruvian)', bpm: 70, range: '60–80', steps: 16, family: 'lando',
    kick: 'x...x...x...x...', top: 'x.x.x.x.x.x.x.', sound: 'cajon', groove: 'sw16:60', src: 'std',
    etymology: 'From "landó" = Angolan "lundú" = dance. Slow, sensual. "Landó" = the dance of the black woman. Minor key. Susana Baca, Eva Ayllón.',
    note: 'Slow 4/4 with swing. Cajón + cajita + guitar. Melancholic, sensual. "María Landó" (Chabuca Granda). 60-70 bpm.',
    topLines: [
      { name: 'Cajón', pattern: 'x.x.x.x.x.x.x.', sound: 'dunun' },
      { name: 'Cajita', pattern: 'x...x...x...x...', sound: 'metal' },
      { name: 'Guitar', pattern: 'x...x...x...x...', sound: 'pluck' }
    ] },

  { id: 'zamacueca', name: 'Zamacueca', region: 'Peru / Chile / Argentina', bpm: 100, range: '90–110', steps: 16, family: 'zamacueca',
    kick: 'x...x...x...x...', top: 'x.x.x.x.x.x.x.', sound: 'cajon', groove: 'tri:even', src: 'std',
    etymology: 'Quechua "zama" = rest + "cueca" = dance. Or "zamacueca" = zambo (mixed) + cueca. Ancestor of Chilean cueca, Argentine zamba, Mexican chilena.',
    note: 'Mother of cueca/zamba/chilena. Handkerchief dance. Guitar + cajón + harp. 19th century pan-South American spread.',
    topLines: [
      { name: 'Cajón', pattern: 'x.x.x.x.x.x.x.', sound: 'dunun' },
      { name: 'Guitar', pattern: 'x.x.x.x.x.x.x.', sound: 'pluck' },
      { name: 'Harp', pattern: 'x...x...x...x...', sound: 'pluck' }
    ] },
];

RX.REGIONS = [...new Set(RX.RHYTHMS.map(r => r.region))];