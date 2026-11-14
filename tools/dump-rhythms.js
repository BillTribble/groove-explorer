#!/usr/bin/env node
// Prints the rhythm library as JSON for py/rhythm_ml.py. Each rhythm also carries `ruleCore`,
// the core line picked by the rules in js/shape.js alone (the ML picks are not loaded here).
const fs = require('fs'), vm = require('vm'), path = require('path');
const root = path.resolve(__dirname, '..');
const ctx = { console, Math, Object, Array, Set }; ctx.window = ctx; vm.createContext(ctx);
for (const f of ['families', 'rhythms', 'shape']) vm.runInContext(fs.readFileSync(path.join(root, 'js', f + '.js'), 'utf8'), ctx, { filename: f });
const RX = ctx.RX;
console.log(JSON.stringify(RX.RHYTHMS.map((r) => ({
  id: r.id, name: r.name, region: r.region, steps: r.steps, kick: r.kick, top: r.top, sound: r.sound, src: r.src,
  core: r.core || null, coreName: r.coreName || null, family: RX.FAMILY_OF[r.id] || r.family,
  topLines: (r.topLines || []).map((l) => ({ name: l.name, pattern: l.pattern, sound: l.sound, loop: !!l.loop })),
  ruleCore: RX.coreTop(r),
}))));
