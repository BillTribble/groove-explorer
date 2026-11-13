// MIDI (per part) and Ableton Live Set (.als) export. Groove timing is baked into note positions.
window.RX = window.RX || {};

(function () {
  const PPQ = 480;
  const NOTE = { kick: 36, snare: 38, tom: 45, bass: 36 };
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

  function midiBytes(name, bpm, lane, note) {
    const evs = [];
    lane.events.forEach((e) => {
      const on = Math.round(e.t * PPQ);
      const off = Math.min(Math.round((e.t + NOTE_LEN) * PPQ), lane.length * PPQ);
      evs.push([on, 1, [0x90, note, e.vel]], [off, 0, [0x80, note, 0]]);
    });
    evs.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const us = Math.round(60000000 / bpm);
    const text = Array.from(new TextEncoder().encode(name));
    let data = [0, 0xff, 0x03, ...vlq(text.length), ...text,
      0, 0xff, 0x51, 0x03, (us >> 16) & 255, (us >> 8) & 255, us & 255,
      0, 0xff, 0x58, 0x04, 4, 2, 24, 8];
    let last = 0;
    evs.forEach(([tick, , msg]) => { data.push(...vlq(tick - last), ...msg); last = tick; });
    data.push(...vlq(lane.length * PPQ - last), 0xff, 0x2f, 0x00);
    const len = data.length;
    return new Uint8Array([
      0x4d, 0x54, 0x68, 0x64, 0, 0, 0, 6, 0, 0, 0, 1, PPQ >> 8, PPQ & 255,
      0x4d, 0x54, 0x72, 0x6b, (len >>> 24) & 255, (len >>> 16) & 255, (len >>> 8) & 255, len & 255,
      ...data]);
  }

  /** part: { rhythmName, partName, pattern, steps, groove, timing, accent, voice, bpm } */
  RX.exportMidi = function (part) {
    const lane = RX.renderLane(part.pattern, part.steps, part.groove, part.timing, part.accent);
    const name = part.rhythmName + ' ' + part.partName;
    download(midiBytes(name, part.bpm, lane, NOTE[part.voice]), slug(name) + '-' + Math.round(part.bpm) + 'bpm.mid', 'audio/midi');
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

  function makeClip(doc, tpl, name, lane, note, color) {
    const clip = tpl.cloneNode(true);
    clip.setAttribute('Id', '0'); clip.setAttribute('Time', '0');
    const L = lane.length;
    setV(clip, 'CurrentStart', 0); setV(clip, 'CurrentEnd', L);
    setV(clip, 'Loop/LoopStart', 0); setV(clip, 'Loop/LoopEnd', L);
    setV(clip, 'Loop/OutMarker', L); setV(clip, 'Loop/HiddenLoopStart', 0); setV(clip, 'Loop/HiddenLoopEnd', L);
    setV(clip, 'Name', name); setV(clip, 'Color', color);
    setV(clip, 'ScrollerTimePreserver/LeftTime', 0); setV(clip, 'ScrollerTimePreserver/RightTime', L);
    setV(clip, 'TimeSelection/AnchorTime', 0); setV(clip, 'TimeSelection/OtherTime', 0);
    const keyTracks = q(clip, 'Notes/KeyTracks');
    while (keyTracks.firstChild) keyTracks.removeChild(keyTracks.firstChild);
    if (lane.events.length) {
      const kt = doc.createElement('KeyTrack'); kt.setAttribute('Id', '0');
      const notes = doc.createElement('Notes');
      lane.events.forEach((e, i) => {
        const n = doc.createElement('MidiNoteEvent');
        const attrs = { Time: +e.t.toFixed(6), Duration: Math.min(NOTE_LEN, L - e.t).toFixed(4), Velocity: e.vel,
          VelocityDeviation: 0, OffVelocity: 64, Probability: 1, IsEnabled: 'true', NoteId: i + 1 };
        Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, String(v)));
        notes.appendChild(n);
      });
      const key = doc.createElement('MidiKey'); key.setAttribute('Value', String(note));
      kt.appendChild(notes); kt.appendChild(key); keyTracks.appendChild(kt);
    }
    setV(clip, 'Notes/NoteIdGenerator/NextId', lane.events.length + 1);
    return clip;
  }

  /**
   * rows: [{ name, bpm, steps, kick, top, voice, groove, timing, accent }]
   * Builds a session-view set: one scene per rhythm (scene tempo = rhythm tempo),
   * tracks "Kick 4x4", "Kick pattern", "Top".
   */
  RX.buildAls = async function (rows, masterBpm) {
    const raw = Uint8Array.from(atob(RX.ALS_TEMPLATE_B64), (c) => c.charCodeAt(0));
    const xml = new TextDecoder().decode(await pipe(raw, new DecompressionStream('gzip')));
    const doc = new DOMParser().parseFromString(xml, 'application/xml');
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
    third.querySelectorAll('*').forEach((e) => {
      if (e.hasAttribute('Id') && (e.tagName === 'Pointee' || e.tagName.endsWith('Target'))) e.setAttribute('Id', String(next++));
    });
    nextEl.setAttribute('Value', String(next + 1));
    tracks.insertBefore(third, midi[1].nextSibling);
    const laneTracks = [midi[0], midi[1], third];
    const trackNames = ['Kick 4x4', 'Kick pattern', 'Top'];
    const trackColors = [14, 2, 9];
    laneTracks.forEach((t, i) => {
      setV(t, 'Name/EffectiveName', trackNames[i]); setV(t, 'Name/UserName', trackNames[i]);
      setV(t, 'Color', trackColors[i]);
    });

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

    rows.forEach((r, i) => {
      const four = r.steps === 12 ? 'x..x..x..x..' : 'x...x...x...x...';
      const parts = [[four, 36], [r.kick, 36], [r.top, NOTE[r.voice]]];
      parts.forEach(([pattern, note], ti) => {
        const lane = RX.renderLane(pattern, r.steps, r.groove, r.timing, r.accent);
        const slot = q(laneTracks[ti], 'DeviceChain/MainSequencer/ClipSlotList').children[i];
        q(slot, 'ClipSlot/Value').appendChild(makeClip(doc, clipTpl, r.name + ' ' + trackNames[ti].toLowerCase(), lane, note, trackColors[ti]));
      });
    });

    const tempo = set.querySelector(':scope > MainTrack Tempo > Manual');
    if (tempo) tempo.setAttribute('Value', String(masterBpm));

    const out = '<?xml version="1.0" encoding="UTF-8"?>\n' + new XMLSerializer().serializeToString(doc.documentElement);
    return pipe(new TextEncoder().encode(out), new CompressionStream('gzip'));
  };

  RX.exportAls = async function (rows, masterBpm) {
    download(await RX.buildAls(rows, masterBpm), 'groove-explorer.als', 'application/octet-stream');
  };
})();
