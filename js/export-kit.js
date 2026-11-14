// Ableton project export, sound side. Every hit in every rhythm is resolved to the sound the
// app would play (kit sample or synth voice, at its accent level and pitch); each distinct sound
// becomes one pad of a Drum Rack of one-shot Simplers, and the MIDI note of that pad is what the
// clips use, so a part can only ever point at its own sound. Also: WAV encode/parse and a zip writer.
window.RX = window.RX || {};

(function () {
  const SAMPLE_DIR = 'Samples/Imported/';
  const FIRST_NOTE = 36; // C1, bottom-left pad of a Drum Rack

  // ── WAV ──
  function wavBytes(samples, rate) {
    const n = samples.length, out = new Uint8Array(44 + n * 2), v = new DataView(out.buffer);
    const str = (o, s) => { for (let i = 0; i < s.length; i++) out[o + i] = s.charCodeAt(i); };
    str(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); str(8, 'WAVE'); str(12, 'fmt ');
    v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
    v.setUint32(24, rate, true); v.setUint32(28, rate * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true);
    str(36, 'data'); v.setUint32(40, n * 2, true);
    for (let i = 0; i < n; i++) v.setInt16(44 + i * 2, Math.round(Math.max(-1, Math.min(1, samples[i])) * 32767), true);
    return out;
  }

  /** { frames, rate } from a PCM WAV file's header. */
  function wavInfo(bytes) {
    const v = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    let rate = 44100, channels = 1, bits = 16, o = 12;
    while (o + 8 <= bytes.length) {
      const id = String.fromCharCode(bytes[o], bytes[o + 1], bytes[o + 2], bytes[o + 3]), size = v.getUint32(o + 4, true);
      if (id === 'fmt ') { channels = v.getUint16(o + 10, true); rate = v.getUint32(o + 12, true); bits = v.getUint16(o + 22, true); }
      if (id === 'data') return { frames: Math.floor(size / (channels * bits / 8)), rate };
      o += 8 + size + (size & 1);
    }
    throw new Error('not a PCM WAV file');
  }

  // ── Zip (stored, not compressed: WAVs barely shrink and Live reads it fine) ──
  let crcTable = null;
  function crc32(bytes) {
    if (!crcTable) {
      crcTable = new Uint32Array(256);
      for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; crcTable[n] = c >>> 0; }
    }
    let c = 0xffffffff;
    for (let i = 0; i < bytes.length; i++) c = crcTable[(c ^ bytes[i]) & 255] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  }

  /** files: [{ path, bytes }] -> Uint8Array zip. */
  RX.zip = function (files) {
    const enc = new TextEncoder(), parts = [], central = [];
    let offset = 0;
    const d = new Date();
    const time = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1);
    const date = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
    files.forEach((f) => {
      const name = enc.encode(f.path), crc = crc32(f.bytes), size = f.bytes.length;
      const lh = new DataView(new ArrayBuffer(30));
      lh.setUint32(0, 0x04034b50, true); lh.setUint16(4, 20, true); lh.setUint16(6, 0x0800, true);
      lh.setUint16(10, time, true); lh.setUint16(12, date, true); lh.setUint32(14, crc, true);
      lh.setUint32(18, size, true); lh.setUint32(22, size, true); lh.setUint16(26, name.length, true);
      parts.push(new Uint8Array(lh.buffer), name, f.bytes);
      const ch = new DataView(new ArrayBuffer(46));
      ch.setUint32(0, 0x02014b50, true); ch.setUint16(4, 20, true); ch.setUint16(6, 20, true); ch.setUint16(8, 0x0800, true);
      ch.setUint16(12, time, true); ch.setUint16(14, date, true); ch.setUint32(16, crc, true);
      ch.setUint32(20, size, true); ch.setUint32(24, size, true); ch.setUint16(28, name.length, true);
      ch.setUint32(42, offset, true);
      central.push(new Uint8Array(ch.buffer), name);
      offset += 30 + name.length + size;
    });
    const cdSize = central.reduce((a, b) => a + b.length, 0);
    const end = new DataView(new ArrayBuffer(22));
    end.setUint32(0, 0x06054b50, true); end.setUint16(8, files.length, true); end.setUint16(10, files.length, true);
    end.setUint32(12, cdSize, true); end.setUint32(16, offset, true);
    const all = [...parts, ...central, new Uint8Array(end.buffer)];
    const out = new Uint8Array(all.reduce((a, b) => a + b.length, 0));
    let o = 0; all.forEach((b) => { out.set(b, o); o += b.length; });
    return out;
  };

  // ── Pads: one per distinct (sound, pitch) ──
  const human = (s) => s.replace(/[-_]+/g, ' ').replace(/^./, (c) => c.toUpperCase());
  const semis = (ratio) => Math.round(12 * Math.log2(ratio));

  /** Renders a part's pattern and resolves each hit to the sound the app plays for it. */
  function resolvePart(part, pattern, row) {
    const lane = RX.renderLane(pattern, row.steps, row.groove, row.timing, row.accent);
    return { length: lane.length, events: lane.events.map((e) => {
      const shift = part.notes ? semis(RX.pitchRatio(part, e.step)) : 0;
      const snd = RX.audio.resolveSound(part.voice, e.vel / 127, part.synth, part.inst);
      return { t: e.t, vel: e.vel, shift, snd, key: (snd.file ? 's:' + snd.file : 'v:' + snd.voice) + '@' + shift };
    }) };
  }

  /**
   * rows: [{ name, steps, groove, timing, accent, parts: [{ id, voice, pattern, fullPattern, notes, inst, synth, track }] }]
   * `fullPattern` is the part ignoring mutes; the pad table is built from it so notes never depend on what is muted.
   * Fills part.length / part.events ([{ t, vel, pad }]) from `pattern` and returns the pads (kick first, then
   * samples A-Z, then synth voices; pitched copies follow their source), each with a MIDI `note`.
   */
  RX.collectPads = function (rows) {
    const byKey = new Map();
    rows.forEach((row) => row.parts.forEach((part) => {
      resolvePart(part, part.fullPattern || part.pattern, row).events.forEach((e) => {
        if (byKey.has(e.key)) return;
        const base = e.snd.file ? human(e.snd.file) : 'Synth ' + e.snd.voice;
        byKey.set(e.key, { key: e.key, file: e.snd.file || null, voice: e.snd.voice || null, shift: e.shift, isKick: part.voice === 'kick',
          name: base + (e.shift ? (e.shift > 0 ? ' +' : ' ') + e.shift : ''), sortName: base });
      });
    }));
    const pads = [...byKey.values()].sort((a, b) =>
      (b.isKick - a.isKick) || ((a.voice ? 1 : 0) - (b.voice ? 1 : 0)) || a.sortName.localeCompare(b.sortName) || a.shift - b.shift);
    if (pads.length > 128) throw new Error('more than 128 distinct sounds');
    pads.forEach((p, i) => { p.note = (FIRST_NOTE + i) % 128; });
    rows.forEach((row) => row.parts.forEach((part) => {
      const r = resolvePart(part, part.pattern, row);
      part.length = r.length;
      part.events = r.events.map((e) => ({ t: e.t, vel: e.vel, pad: byKey.get(e.key) }));
    }));
    return pads;
  };

  /** One part's events (pattern given explicitly, e.g. ignoring mutes) mapped onto an existing pad table. */
  RX.eventsFor = function (row, part, pattern, pads) {
    const byKey = new Map(pads.map((p) => [p.key, p]));
    const r = resolvePart(part, pattern, row);
    return { length: r.length, events: r.events.map((e) => ({ t: e.t, vel: e.vel, pad: byKey.get(e.key) })) };
  };

  /** Gets each pad's WAV: fetched from the kit for samples, rendered offline for synth voices. Fills pad.bytes/frames/rate/fileName. */
  RX.loadPadAudio = async function (pads) {
    const taken = new Set();
    const unique = (name) => { let n = name, i = 2; while (taken.has(n)) n = name.replace(/\.wav$/, ' ' + i++ + '.wav'); taken.add(n); return n; };
    const cache = {};
    await Promise.all(pads.map(async (p) => {
      if (p.file) {
        // Pitched copies of a sample share one file; Simpler transposes it.
        if (!cache[p.file]) {
          cache[p.file] = (async () => {
            const url = RX.SAMPLE_KIT.base + p.file + '.wav?v=' + (window.APP_BUILD || '');
            const res = await fetch(url);
            if (!res.ok) throw new Error('could not download ' + p.file + '.wav (' + res.status + ')');
            const bytes = new Uint8Array(await res.arrayBuffer());
            return Object.assign({ bytes }, wavInfo(bytes));
          })();
        }
        Object.assign(p, await cache[p.file]);
      } else {
        const { samples, rate } = await RX.audio.renderVoice(p.voice, Math.pow(2, p.shift / 12));
        Object.assign(p, { bytes: wavBytes(samples, rate), frames: samples.length, rate });
      }
    }));
    pads.forEach((p) => { p.fileName = p.file ? p.file + '.wav' : 'synth-' + p.voice + (p.shift ? (p.shift > 0 ? '-up' : '-down') + Math.abs(p.shift) : '') + '.wav'; });
    // Pads that share a file (pitched copies of one sample) must share one file name and one zip entry.
    const names = {};
    pads.forEach((p) => { const k = p.file || p.key; names[k] = names[k] || unique(p.fileName); p.fileName = names[k]; });
  };

  /** One zip entry per distinct file. */
  RX.padFiles = (pads) => [...new Map(pads.map((p) => [p.fileName, { path: SAMPLE_DIR + p.fileName, bytes: p.bytes }])).values()];

  // ── Drum Rack of Simpler pads ──
  const q = (el, path) => el.querySelector(':scope > ' + path.split('/').join(' > '));
  const setV = (el, path, value) => { const n = q(el, path); if (n) n.setAttribute('Value', String(value)); };

  let tplDoc = null;
  async function template(gunzip) {
    if (tplDoc) return tplDoc;
    const raw = Uint8Array.from(atob(RX.DRUMRACK_TEMPLATE_B64), (c) => c.charCodeAt(0));
    tplDoc = new DOMParser().parseFromString(new TextDecoder().decode(await gunzip(raw)), 'application/xml');
    return tplDoc;
  }

  /**
   * A Drum Rack (DrumGroupDevice) with a one-shot Simpler pad for each of `pads`.
   * The caller must give every Pointee / *Target in it a fresh id before it joins a set.
   */
  RX.buildDrumRack = async function (pads, gunzip) {
    const tpl = await template(gunzip);
    const rack = tpl.querySelector('DrumRackTemplate > DrumGroupDevice').cloneNode(true);
    const branchTpl = tpl.querySelector('DrumRackTemplate > DrumBranch');
    const branches = q(rack, 'Branches');
    const modDate = Math.floor(Date.now() / 1000);
    pads.forEach((p, i) => {
      const b = branchTpl.cloneNode(true);
      b.setAttribute('Id', String(i));
      setV(b, 'Name/EffectiveName', p.name); setV(b, 'Name/UserName', p.name);
      setV(b, 'BranchInfo/ReceivingNote', 128 - p.note); // Live stores a pad's note inverted
      const rel = SAMPLE_DIR + p.fileName, last = p.frames - 1;
      b.querySelectorAll('FileRef').forEach((fr) => {
        setV(fr, 'RelativePathType', 1); setV(fr, 'RelativePath', rel); setV(fr, 'Path', rel);
        setV(fr, 'Type', 2); setV(fr, 'OriginalFileSize', p.bytes.length); setV(fr, 'OriginalCrc', 0);
      });
      const part = b.querySelector('MultiSamplePart');
      setV(part, 'Name', p.name); setV(part, 'RootKey', 60);
      setV(part, 'SampleStart', 0); setV(part, 'SampleEnd', last);
      setV(part, 'SustainLoop/Start', 0); setV(part, 'SustainLoop/End', last);
      setV(part, 'ReleaseLoop/Start', 0); setV(part, 'ReleaseLoop/End', last);
      const ref = part.querySelector('SampleRef');
      setV(ref, 'LastModDate', modDate); setV(ref, 'DefaultDuration', p.frames); setV(ref, 'DefaultSampleRate', p.rate);
      const onsets = part.querySelector('InitialSlicePointsFromOnsets');
      while (onsets && onsets.firstChild) onsets.removeChild(onsets.firstChild); // Live re-analyses the new sample
      if (p.file && p.shift) setV(b.querySelector('OriginalSimpler'), 'Pitch/TransposeKey/Manual', p.shift); // pitched copy of a sample
      branches.appendChild(b);
    });
    return rack;
  };

  RX.SAMPLE_DIR = SAMPLE_DIR;
})();
