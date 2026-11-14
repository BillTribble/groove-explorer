# groove-explorer

Rhythm pattern explorer — plain JS, no build step. Open `index.html` directly.
(Canon repo pointer: `git remote -v` — origin is `BillTribble/groove-explorer`.)
- `js/rhythms.js` — the rhythm data (`RX.RHYTHMS`): patterns are strings of `X` (accent), `x` (hit), `o` (ghost), `.` (rest). Multi-instrument rhythms use `topLines: [{name, pattern, sound}]`.
- `js/audio.js` — Web Audio voices (`VOICES`) + look-ahead scheduler. Every `sound:` name in rhythms.js must either exist here or falls back to `tom` via `voiceFor()`. Add real voices for new instruments rather than relying on the fallback.
- `js/app.js` — UI. Multi-instrument rhythms have lanes `top0..topN` (no plain `top` lane) — use `patternOf(r, lane)`, never `s[lane]`, when reading lane state.
- `js/grooves.js` — groove library (`RX.GROOVES`), `RX.applyGroove`, `RX.LEVEL`, `RX.renderLane`.
- `js/shape.js` — rhythm shape helpers (`RX.shape`) and `RX.coreTop(r)`: the top line the simple (one top voice) version of an ensemble row plays. It is `r.core` when authored, else the timeline part (bell, clave, sangban), else the shaped part that shares most with the others. Even pulses, kick copies and wrong-length patterns never win.
- `py/rhythm_ml.py` — scikit-learn pass (`python3 py/rhythm_ml.py`, add `--png map.png` to draw the map). Writes `js/pattern-groups.js` (generated, do not edit): `RX.PATTERN_GROUPS` (the By pattern view), `RX.ML_CORE` (classifier's core-line pick per ensemble rhythm, used by `RX.coreTop`), `RX.PATTERN_MAP` (2D position per rhythm) and `RX.PATTERN_NEAR` (4 nearest rhythms with similarity) for a future node map. Also writes `RHYTHM_ML.md`. Rerun after editing rhythms.js.
- Pulse parts setting (`state.pulseParts`, default `'off'`): top parts that are a steady stream of 8ths or 16ths (`RX.shape.isFiller`) are muted, hidden and left out of exports.
- Free-looping parts: a `topLines` entry with `loop: true` has a pattern of its own length (e.g. `'xx.'`) and loops independently at the row's step size. Playback indexes each lane by `stepIndex % lane.pattern.length` (js/audio.js); a lane's step grid has as many buttons as its own pattern; `RX.renderLane` / `RX.loopSteps` stretch exports to the point where all parts of the row realign (3 against 16 = 12 beats, capped at 64 beats). Never assume `pattern.length === r.steps` for a top lane.
- Lane clocks: the scheduler places each lane by beat position, not row step. A lane may carry `grid` (steps per 4-beat bar; default the row's). The kick lane's 4/4 mode is `FOUR` = `'x...x...x...x...'` on `grid: 16`, so it is four exact quarter notes in any meter and ignores the row's cycle (exports render it over its own loop, `RX.collectPads`). Playhead gets the beat position as `onStep`'s 4th argument.
- Lane grouping: ensemble parts whose pattern is identical share one step lane (`groupsOf` in app.js): the first leads, titled `Pattern N · A + B` (`= kick` when it equals the kick), edits and mute go to the leader, every instrument still plays, exports and sound selectors stay per part. Use `patternOf` / `muteOf`, never `state.rows[id]['top'+idx]` directly.
- Data rule: every pattern string must be exactly `steps` long unless its part is marked `loop: true`, and a rhythm needs a real pattern (a shaped core line or a shaped kick). Rhythms whose parts were all steady pulses were removed on 2026-11-14 and are listed in `REMOVED_RHYTHMS.md`; research the real pattern before re-adding one.
- `tools/shape-analysis.js` — `node tools/shape-analysis.js > RHYTHM_SHAPES.md` regenerates the shape report (shape twins across families, embellishment chains, rhythms with no shape in their data, wrong-length patterns). Rerun it after editing rhythms.js.

## Headless tests

Puppeteer-core harness (uses system Chrome, no download) lives in
`/private/var/folders/gw/yz51cdgx7t59rpj9zrclmxc00000gp/T/opencode/gx-test/`
(ephemeral — recreate with `npm i puppeteer-core` if gone):

- `test-all.js` — plays every rhythm ~80ms each; zero page errors expected
- `test-kuku.js` — deep interaction on the Kuku row (play/mute/fold/step-edit/settings/MIDI export/bar-boundary switch)
- `test-family.js` — family carousel view, clicks every card

History: 2026-11-13 "kuku crashes browser" was `VOICES['djembe']` undefined →
`TypeError: VOICES[lane.voice] is not a function` thrown from `tick()` every
25ms. Fixed in commit 7fc07fc.