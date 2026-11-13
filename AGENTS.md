# groove-explorer

African/global rhythm pattern explorer — plain JS, no build step. Open `index.html` directly.

- Repo: https://github.com/BillTribble/groove-explorer (origin, push with `git push`)
- `js/rhythms.js` — the rhythm data (`RX.RHYTHMS`): patterns are strings of `X` (accent), `x` (hit), `o` (ghost), `.` (rest). Multi-instrument rhythms use `topLines: [{name, pattern, sound}]`.
- `js/audio.js` — Web Audio voices (`VOICES`) + look-ahead scheduler. Every `sound:` name in rhythms.js must either exist here or falls back to `tom` via `voiceFor()`. Add real voices for new instruments rather than relying on the fallback.
- `js/app.js` — UI. Multi-instrument rhythms have lanes `top0..topN` (no plain `top` lane) — use `patternOf(r, lane)`, never `s[lane]`, when reading lane state.
- `js/grooves.js` — groove library (`RX.GROOVES`), `RX.applyGroove`, `RX.LEVEL`, `RX.renderLane`.

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