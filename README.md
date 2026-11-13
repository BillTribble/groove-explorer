# Groove explorer

A zero-build web app for auditioning African and Afro-diasporic drum rhythms with their grooves.

- Stacked rows, one rhythm each; play one at a time.
- Kick lane (pattern or 4/4) and snare lane (snare, 808-style tom or low percussive bass). Tap steps to edit.
- A swappable groove per row: Ableton Live 12 Core Library grooves, plain swings and a few research-based feels.
- Live tempo; tap a row's tempo chip to jump to its usual BPM.
- Export each part as MIDI, or everything as an Ableton Live set (one scene per rhythm).

## Run

```bash
python3 -m http.server 8765
```

Then open http://localhost:8765.

## Data notes

- `js/grooves-ableton.js` is generated from the `.agr` files in Live's Core Library.
- `js/als-template.js` is Live 12's factory `DefaultLiveSet.als`, used as the export skeleton.
- Each row carries a source badge: Ableton groove data, documented timeline, measured from audio, or approximation.
