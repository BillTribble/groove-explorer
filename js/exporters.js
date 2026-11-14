// MIDI (per part) and Ableton project (.als + samples, zipped) export. Groove timing is baked into note positions.
// Which MIDI note plays which sound comes from the pad table in export-kit.js, shared by both exports.
window.RX = window.RX || {};

(function () {
  const PPQ = 480;
  const NOTE_LEN = 0.2; // beats

  function download(bytes, filename, type) {
    const url = URL.createObjectURL(new Blob([bytes], { type }));
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  // ── Standard MIDI file, format 0 ──
  function vlq(n) {
    const out = [n & 0x7f];
    while ((n >>= 7)) out.unshift((n & 0x7f) | 0x80);
    return out;
  }

  /** events: [{ t (beats), vel, note }] over `length` beats. */
  function midiBytes(name, bpm, length, events) {
    const evs = [];
    events.forEach((e) => {
      const on = Math.round(e.t * PPQ);
      const off = Math.min(Math.round((e.t + NOTE_LEN) * PPQ), length * PPQ);
      evs.push([on, 1, [0x90, e.note, e.vel]], [off, 0, [0x80, e.note, 0]]);
    });
    evs.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const us = Math.round(60000000 / bpm);
    const text = Array.from(new TextEncoder().encode(name));
    let data = [0, 0xff, 0x03, ...vlq(text.length), ...text,
      0, 0xff, 0x51, 0x03, (us >> 16) & 255, (us >> 8) & 255, us & 255,
      0, 0xff, 0x58, 0x04, 4, 2, 24, 8];
    let last = 0;
    evs.forEach(([tick, , msg]) => { data.push(...vlq(tick - last), ...msg); last = tick; });
    data.push(...vlq(length * PPQ - last), 0xff, 0x2f, 0x00);
    const len = data.length;
    return new Uint8Array([
      0x4d, 0x54, 0x68, 0x64, 0, 0, 0, 6, 0, 0, 0, 1, PPQ >> 8, PPQ & 255,
      0x4d, 0x54, 0x72, 0x6b, (len >>> 24) & 255, (len >>> 16) & 255, (len >>> 8) & 255, len & 255,
      ...data]);
  }

  /**
   * One part as a MIDI file. `rows` is the full export table (see app.js exportRows) so the notes are
   * the ones the Ableton project's Drum Rack uses: drop the file on that rack and every hit plays its own sound.
   */
  RX.exportMidi = function (rows, rowId, partId, bpm) {
    const row = rows.find((r) => r.id === rowId), part = row && row.parts.find((p) => p.id === partId);
    if (!part) throw new Error('unknown part ' + rowId + '/' + partId);
    const pads = RX.collectPads(rows);
    const { length, events } = RX.eventsFor(row, part, part.fullPattern, pads); // a downloaded part ignores mutes
    const name = row.name + ' ' + part.label;
    download(midiBytes(name, bpm, length, events.map((e) => ({ t: e.t, vel: e.vel, note: e.pad.note }))), slug(name) + '-' + Math.round(bpm) + 'bpm.mid', 'audio/midi');
  };
  RX._midiBytes = midiBytes;

  // ── Ableton Live Set ──
  async function pipe(bytes, stream) {
    const res = new Response(new Blob([bytes]).stream().pipeThrough(stream));
    return new Uint8Array(await res.arrayBuffer());
  }

  const q = (el, path) => el.querySelector(':scope > ' + path.split('/').join(' > '));
  function setV(el, path, value) {
    const n = q(el, path);
    if (n) n.setAttribute('Value', String(value));
  }

  /** events: [{ t, vel, pad }] — one KeyTrack per pad, keyed by the pad's MIDI note. */
  function makeClip(doc, tpl, name, length, events, color) {
    const clip = tpl.cloneNode(true);
    clip.setAttribute('Id', '0'); clip.setAttribute('Time', '0');
    const L = length;
    setV(clip, 'CurrentStart', 0); setV(clip, 'CurrentEnd', L);
    setV(clip, 'Loop/LoopStart', 0); setV(clip, 'Loop/LoopEnd', L);
    setV(clip, 'Loop/OutMarker', L); setV(clip, 'Loop/HiddenLoopStart', 0); setV(clip, 'Loop/HiddenLoopEnd', L);
    setV(clip, 'Name', name); setV(clip, 'Color', color);
    setV(clip, 'ScrollerTimePreserver/LeftTime', 0); setV(clip, 'ScrollerTimePreserver/RightTime', L);
    setV(clip, 'TimeSelection/AnchorTime', 0); setV(clip, 'TimeSelection/OtherTime', 0);
    const keyTracks = q(clip, 'Notes/KeyTracks');
    while (keyTracks.firstChild) keyTracks.removeChild(keyTracks.firstChild);
    const byNote = new Map();
    events.forEach((e) => { const list = byNote.get(e.pad.note) || []; list.push(e); byNote.set(e.pad.note, list); });
    let noteId = 1;
    [...byNote.keys()].sort((a, b) => a - b).forEach((note, k) => {
      const kt = doc.createElement('KeyTrack'); kt.setAttribute('Id', String(k));
      const notes = doc.createElement('Notes');
      byNote.get(note).forEach((e) => {
        const n = doc.createElement('MidiNoteEvent');
        const attrs = { Time: +e.t.toFixed(6), Duration: Math.min(NOTE_LEN, L - e.t).toFixed(4), Velocity: e.vel,
          VelocityDeviation: 0, OffVelocity: 64, Probability: 1, IsEnabled: 'true', NoteId: noteId++ };
        Object.entries(attrs).forEach(([key, v]) => n.setAttribute(key, String(v)));
        notes.appendChild(n);
      });
      const key = doc.createElement('MidiKey'); key.setAttribute('Value', String(note));
      kt.appendChild(notes); kt.appendChild(key); keyTracks.appendChild(kt);
    });
    setV(clip, 'Notes/NoteIdGenerator/NextId', noteId);
    return clip;
  }

  /**
   * rows: [{ name, bpm, steps, groove, timing, accent, parts: [{ track: 0|1|2, ... }] }] with pads already
   * collected (RX.collectPads). Session-view set: one scene per rhythm at its tempo, three tracks:
   * "Kick 4x4" and "Kick pattern" (Drum Rack with only the kick pads they use) and "Top parts"
   * (Drum Rack with every pad, so the whole kit is playable from it).
   */
  RX.buildAls = async function (rows, masterBpm, pads) {
    const raw = Uint8Array.from(atob(RX.ALS_TEMPLATE_B64), (c) => c.charCodeAt(0));
    const gunzip = (b) => pipe(b, new DecompressionStream('gzip'));
    const doc = new DOMParser().parseFromString(new TextDecoder().decode(await gunzip(raw)), 'application/xml');
    const set = q(doc.documentElement, 'LiveSet');
    const clipTpl = set.querySelector('GroovePool MidiClip').cloneNode(true);

    // Tracks: drop the audio tracks, keep two MIDI tracks, clone a third.
    const tracks = q(set, 'Tracks');
    Array.from(tracks.children).filter((t) => t.tagName === 'AudioTrack').forEach((t) => tracks.removeChild(t));
    const midi = Array.from(tracks.children).filter((t) => t.tagName === 'MidiTrack');
    const third = midi[0].cloneNode(true);
    const usedIds = Array.from(tracks.children).map((t) => +t.getAttribute('Id'));
    third.setAttribute('Id', String(Math.max(...usedIds) + 1));
    // Pointee / *Target ids must be unique across the document and below NextPointeeId.
    const nextEl = q(set, 'NextPointeeId');
    let next = +nextEl.getAttribute('Value');
    const renumber = (root) => root.querySelectorAll('*').forEach((e) => {
      if (e.hasAttribute('Id') && (e.tagName === 'Pointee' || e.tagName.endsWith('Target'))) e.setAttribute('Id', String(next++));
    });
    renumber(third);
    tracks.insertBefore(third, midi[1].nextSibling);
    const laneTracks = [midi[0], midi[1], third];
    const trackNames = ['Kick 4x4', 'Kick pattern', 'Top parts'];
    const trackColors = [14, 2, 9];
    laneTracks.forEach((t, i) => {
      setV(t, 'Name/EffectiveName', trackNames[i]); setV(t, 'Name/UserName', trackNames[i]);
      setV(t, 'Color', trackColors[i]);
    });

    // A Drum Rack of Simpler pads on each track: the kick tracks get only the pads they play, the top track gets them all.
    const used = (track) => pads.filter((p) => rows.some((r) => r.parts.some((pt) => pt.track === track && pt.events.some((e) => e.pad === p))));
    for (let i = 0; i < laneTracks.length; i++) {
      const rack = await RX.buildDrumRack(i === 2 ? pads : used(i), gunzip);
      renumber(rack);
      q(laneTracks[i], 'DeviceChain/DeviceChain/Devices').appendChild(rack);
    }
    nextEl.setAttribute('Value', String(next + 1));

    // Scenes: one per rhythm, each carrying its own tempo.
    const scenes = q(set, 'Scenes');
    const sceneTpl = scenes.firstElementChild.cloneNode(true);
    while (scenes.firstChild) scenes.removeChild(scenes.firstChild);
    rows.forEach((r, i) => {
      const s = sceneTpl.cloneNode(true);
      s.setAttribute('Id', String(i));
      setV(s, 'Name', r.name); setV(s, 'Tempo', r.bpm); setV(s, 'IsTempoEnabled', 'true');
      scenes.appendChild(s);
    });

    // Every clip slot list must have exactly one slot per scene.
    set.querySelectorAll('ClipSlotList').forEach((list) => {
      if (!list.firstElementChild) return;
      const slotTpl = list.firstElementChild.cloneNode(true);
      while (list.firstChild) list.removeChild(list.firstChild);
      rows.forEach((_, i) => { const s = slotTpl.cloneNode(true); s.setAttribute('Id', String(i)); list.appendChild(s); });
    });

    // One clip per rhythm per track; the top track's clip carries every top part, each on its own pad.
    rows.forEach((r, i) => {
      laneTracks.forEach((track, ti) => {
        const parts = r.parts.filter((p) => p.track === ti);
        const length = Math.max(...parts.map((p) => p.length));
        const events = parts.flatMap((p) => p.events);
        const slot = q(track, 'DeviceChain/MainSequencer/ClipSlotList').children[i];
        q(slot, 'ClipSlot/Value').appendChild(makeClip(doc, clipTpl, r.name + ' ' + trackNames[ti].toLowerCase(), length, events, trackColors[ti]));
      });
    });

    const tempo = set.querySelector(':scope > MainTrack Tempo > Manual');
    if (tempo) tempo.setAttribute('Value', String(masterBpm));

    const out = '<?xml version="1.0" encoding="UTF-8"?>\n' + new XMLSerializer().serializeToString(doc.documentElement);
    return pipe(new TextEncoder().encode(out), new CompressionStream('gzip'));
  };

  /** Zip in Live's project layout: "<name> Project/<name>.als" + "Samples/Imported/*.wav". Resolves { pads, bytes }. */
  RX.exportAls = async function (rows, masterBpm) {
    const pads = RX.collectPads(rows);
    await RX.loadPadAudio(pads);
    const als = await RX.buildAls(rows, masterBpm, pads);
    const name = 'Groove Explorer', root = name + ' Project/';
    const files = [{ path: root + name + '.als', bytes: als }, ...RX.padFiles(pads).map((f) => ({ path: root + f.path, bytes: f.bytes }))];
    const zip = RX.zip(files);
    download(zip, name + ' Project.zip', 'application/zip');
    return { pads: pads.length, samples: files.length - 1, bytes: zip.length };
  };
})();
