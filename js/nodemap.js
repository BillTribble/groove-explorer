// Node map view. Two layouts of the same nodes, toggled with the World button and animated between:
// - pattern: placed by pattern similarity (RX.PATTERN_MAP from py/rhythm_ml.py);
// - world: at each rhythm's approximate centre of origin (RX.ORIGIN, js/origins.js) over a land outline
//   (RX.WORLD_LAND, js/world-land.js).
// Links join nearest neighbours by pattern (RX.PATTERN_NEAR) in both layouts; colour is the pattern group.
// Dots that would touch on screen are fanned into a small ring (a pair, a triangle, ...) measured in screen pixels,
// so they stay apart at every zoom and split into their true places as you zoom in. Drag to pan, wheel or pinch to zoom, tap a node to play it (switching at the next
// bar when something is already playing, as in the list). While a rhythm plays, a step picture of it sits in the
// bottom third (phone) or the right quarter (desktop).
window.RX = window.RX || {};

RX.nodeMap = (function () {
  // Every dot is drawn the same size. Its invisible tap area grows from HIT_R to HIT_R_MAX as you zoom in, but never
  // past half the gap to its nearest neighbour.
  const PAD = 40, NODE_R = 8, HIT_R = 22, HIT_R_MAX = 36, LINKS = 2, TAP_MOVE = 8, MORPH_MS = 700;
  // Times the fitted zoom. On a phone the World map fits at about 0.9 px per degree, so 400x gives ~345 px per degree:
  // enough to pull apart places a fraction of a degree apart (Accra, the Volta region, Kumasi).
  const MAX_ZOOM = { pattern: 120, world: 400 };
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const LAND = RX.WORLD_LAND || { width: 1000, height: 383.3, top: 80, path: '' };
  const U = LAND.width / 360; // map units per degree (equirectangular, same as py/build_world_outline.py)
  const BOUNDS = { pattern: { w: 1000, h: 1000 }, world: { w: LAND.width, h: LAND.height } };
  let hooks = null, host = null, svg = null, gLand = null, gLinks = null, gNodes = null, toggle = null;
  let panel = null, panelId = null, panelLanes = [], playBtn = null, collapseBtn = null;
  let collapsed = false;
  try { collapsed = localStorage.getItem('rx-map-panel-collapsed') === '1'; } catch (e) { /* per-viewer convenience only */ }
  const wide = window.matchMedia('(min-width: 841px)');
  let rings = []; // rings drawn by the last placeOnScreen(): { cx, cy, r } on screen
  let nodes = [], links = [], view = { x: 0, y: 0, k: 1 }, fitK = 1, fitted = false, w = 0, h = 0, layout = 'pattern', anim = 0;

  const svgEl = (tag, attrs) => { const e = document.createElementNS(SVG_NS, tag); Object.entries(attrs || {}).forEach(([k, v]) => e.setAttribute(k, v)); return e; };
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  const project = ([lat, lon]) => [(lon + 180) * U, (LAND.top - lat) * U];

  // One hue per pattern group (golden-angle spacing keeps neighbouring groups apart).
  const groupOf = {}, groupLabel = {};
  function indexGroups() {
    (RX.PATTERN_GROUPS || []).forEach(([gid, label, ids], i) => ids.forEach((id) => { groupOf[id] = i; groupLabel[id] = label; }));
  }
  const colour = (id) => (groupOf[id] == null ? 'var(--md-sys-color-outline)' : `hsl(${Math.round((groupOf[id] * 137.5) % 360)} 60% 50%)`);

  function build() {
    indexGroups();
    host = document.getElementById('map');
    panel = document.getElementById('map-panel');
    svg = svgEl('svg', { class: 'map-svg', role: 'img' });
    gLand = svgEl('g', { class: 'map-land' });
    const defs = svgEl('defs');
    const clip = svgEl('clipPath', { id: 'map-land-clip' });
    clip.appendChild(svgEl('rect', { x: 0, y: 0, width: LAND.width, height: LAND.height }));
    defs.appendChild(clip); svg.appendChild(defs);
    gLand.appendChild(svgEl('path', { d: LAND.path, 'clip-path': 'url(#map-land-clip)' }));
    gLinks = svgEl('g', { class: 'map-links' });
    gNodes = svgEl('g', { class: 'map-nodes' });
    svg.appendChild(gLand); svg.appendChild(gLinks); svg.appendChild(gNodes);
    host.appendChild(svg);
    toggle = el('button', 'bar-toggle map-layout-toggle');
    toggle.appendChild(el('span', 'material-symbols-outlined', 'public'));
    toggle.appendChild(el('span', 'toggle-label', 'World'));
    toggle.addEventListener('click', () => setLayout(layout === 'world' ? 'pattern' : 'world', true));
    host.appendChild(toggle);

    const pos = RX.PATTERN_MAP || {}, origin = RX.ORIGIN || {};
    nodes = hooks.ids().filter((id) => pos[id]).map((id) => {
      const g = svgEl('g', { class: 'map-node', 'data-id': id, tabindex: '0', role: 'button', 'aria-label': 'Play ' + hooks.name(id) });
      const hit = svgEl('circle', { r: HIT_R, class: 'map-hit' });
      const dot = svgEl('circle', { r: NODE_R, class: 'map-dot', fill: colour(id) });
      const label = svgEl('text', { class: 'map-label', 'text-anchor': 'middle' });
      label.textContent = hooks.mapLabel ? hooks.mapLabel(id) : hooks.name(id).split(' (')[0];
      g.appendChild(hit); g.appendChild(dot); g.appendChild(label);
      g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); hooks.onTap(id); } });
      gNodes.appendChild(g);
      const at = { pattern: [pos[id][0] * 1000, pos[id][1] * 1000], world: origin[id] ? project(origin[id]) : [LAND.width / 2, LAND.height / 2] };
      return { id, g, label, hit, at, wx: 0, wy: 0, sx: 0, sy: 0, reach: HIT_R };
    });
    const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
    const seen = new Set();
    nodes.forEach((n) => ((RX.PATTERN_NEAR || {})[n.id] || []).slice(0, LINKS).forEach(([to, sim]) => {
      const key = [n.id, to].sort().join('|');
      if (!byId[to] || seen.has(key)) return;
      seen.add(key);
      const line = svgEl('line', { class: 'map-link', 'stroke-opacity': (0.25 + 0.55 * sim).toFixed(2) });
      gLinks.appendChild(line);
      links.push({ a: n, b: byId[to], line });
    }));
    setLayout(hooks.layout ? hooks.layout() : 'pattern', false);
    bindGestures();
    // Work is deferred a frame so a resize that changes another observed element does not loop within one frame.
    if (window.ResizeObserver) new ResizeObserver(() => requestAnimationFrame(() => { if (!host.hidden) resize(); })).observe(host);
  }

  // Dots that sit on (nearly) the same screen point at the current zoom (one city, identical patterns, or two towns a
  // degree apart on a zoomed-out map) are fanned into one ring around their centre: a pair side by side, three as a
  // triangle, more as a ring wide enough that no dots touch. A ring takes only dots within reach of its first member
  // (no chaining), so separate places keep their real positions; rings split back apart as you zoom in.
  function placeOnScreen() {
    const T = 8, P = nodes.map((n) => [view.x + n.wx * view.k, view.y + n.wy * view.k]), taken = new Set(), groups = [];
    P.forEach((p, i) => {
      if (taken.has(i)) return;
      const g = [i]; taken.add(i);
      P.forEach((q, j) => { if (!taken.has(j) && Math.abs(p[0] - q[0]) < T && Math.hypot(p[0] - q[0], p[1] - q[1]) < T) { g.push(j); taken.add(j); } });
      groups.push(g);
    });
    rings = [];
    groups.forEach((g) => {
      if (g.length === 1) { nodes[g[0]].sx = P[g[0]][0]; nodes[g[0]].sy = P[g[0]][1]; nodes[g[0]].dir = null; return; }
      const cx = g.reduce((a, i) => a + P[i][0], 0) / g.length, cy = g.reduce((a, i) => a + P[i][1], 0) / g.length;
      // Compact when zoomed out; as you zoom in the ring opens up (neighbours up to 56 px apart) so each member is an
      // easy tap even when they share one exact point (Soleá / Tangos in Seville never separate on their own).
      const gap = Math.min(56, Math.max(2 * NODE_R + 4, 20 * Math.sqrt(Math.max(1, view.k / fitK))));
      const r = Math.max(11, (g.length * (2 * NODE_R + 4)) / (2 * Math.PI), g.length === 2 ? gap / 2 : gap / (2 * Math.sin(Math.PI / g.length)));
      rings.push({ cx, cy, r });
      const dir = (i) => (Math.hypot(P[i][0] - cx, P[i][1] - cy) < 0.5 ? -Math.PI / 2 + i * 1e-3 : Math.atan2(P[i][1] - cy, P[i][0] - cx));
      const order = g.slice().sort((a, c) => dir(a) - dir(c)), a0 = dir(order[0]);
      order.forEach((i, k) => { const a = a0 + (2 * Math.PI * k) / g.length; nodes[i].sx = cx + r * Math.cos(a); nodes[i].sy = cy + r * Math.sin(a); nodes[i].dir = a; });
    });
  }

  const sx = (n) => n.sx, sy = (n) => n.sy; // screen position, set by placeOnScreen() in render()

  /** The node whose centre is nearest a screen point, within its tap reach; null if none. */
  function nodeAt(px, py) {
    let best = null, bd = Infinity;
    nodes.forEach((n) => { const d = Math.hypot(sx(n) - px, sy(n) - py); if (d <= n.reach && d < bd) { bd = d; best = n; } });
    return best;
  }

  /** Tap reach per dot: up to HIT_R_MAX when zoomed in, never past half the gap to the nearest dot, never below HIT_R. */
  function sizeTapAreas() {
    const want = Math.min(HIT_R_MAX, HIT_R * Math.sqrt(Math.max(1, view.k / fitK)));
    nodes.forEach((n) => {
      let nn = Infinity;
      nodes.forEach((m) => { if (m !== n && Math.abs(m.sx - n.sx) < 2 * want) nn = Math.min(nn, Math.hypot(m.sx - n.sx, m.sy - n.sy)); });
      const reach = Math.max(HIT_R, Math.min(want, nn / 2));
      if (reach !== n.reach) { n.reach = reach; n.hit.setAttribute('r', reach.toFixed(1)); }
    });
  }

  // ── Layout ──
  function fitView(lay) {
    const B = BOUNDS[lay], k = Math.min((w - 2 * PAD) / B.w, (h - 2 * PAD) / B.h);
    return { k, x: (w - B.w * k) / 2, y: (h - B.h * k) / 2 };
  }

  /** Switch layout; `animate` moves every node (and the view) to its new place. */
  function setLayout(lay, animate) {
    layout = lay === 'world' ? 'world' : 'pattern';
    if (hooks.setLayout) hooks.setLayout(layout);
    toggle.setAttribute('aria-pressed', String(layout === 'world'));
    toggle.title = layout === 'world' ? 'World map on: tap to place rhythms by pattern again' : 'Place every rhythm at its centre of origin on a world map';
    svg.setAttribute('aria-label', layout === 'world' ? 'Rhythms at their centres of origin' : 'Rhythms placed by pattern similarity');
    gLand.classList.toggle('map-land-on', layout === 'world');
    svg.classList.toggle('map-world', layout === 'world');
    cancelAnimationFrame(anim);
    const to = nodes.map((n) => ({ wx: n.at[layout][0], wy: n.at[layout][1] }));
    if (!w) { nodes.forEach((n, i) => Object.assign(n, to[i])); return; } // not laid out yet: resize() fits
    // With a rhythm selected (the one in the picture panel), keep the zoom level (relative to each layout's fitted
    // view) and centre that rhythm in the new layout, so switching keeps context. Otherwise show the whole layout.
    const sel = panelId && nodes.find((n) => n.id === panelId), ratio = fitK ? view.k / fitK : 1;
    const fit = fitView(layout); fitK = fit.k;
    const target = sel && w ? (() => { const k = fit.k * ratio; return { k, x: w / 2 - sel.at[layout][0] * k, y: h / 2 - sel.at[layout][1] * k }; })() : fit;
    if (!animate) { nodes.forEach((n, i) => Object.assign(n, to[i])); view = target; render(); return; }
    const from = nodes.map((n) => ({ wx: n.wx, wy: n.wy })), v0 = { ...view }, t0 = performance.now();
    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const frame = (now) => {
      const t = Math.min(1, (now - t0) / MORPH_MS), e = ease(t), mix = (a, b) => a + (b - a) * e;
      nodes.forEach((n, i) => { n.wx = mix(from[i].wx, to[i].wx); n.wy = mix(from[i].wy, to[i].wy); });
      view = { x: mix(v0.x, target.x), y: mix(v0.y, target.y), k: mix(v0.k, target.k) };
      render();
      if (t < 1) anim = requestAnimationFrame(frame);
    };
    anim = requestAnimationFrame(frame);
  }

  function resize() {
    const r = host.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const first = !fitted || !w;
    const cx = (w / 2 - view.x) / view.k, cy = (h / 2 - view.y) / view.k; // keep the centre steady across resizes
    w = r.width; h = r.height;
    svg.setAttribute('width', w); svg.setAttribute('height', h);
    const fit = fitView(layout); fitK = fit.k;
    if (first) { view = fit; fitted = true; }
    else { view.x = w / 2 - cx * view.k; view.y = h / 2 - cy * view.k; }
    render();
  }

  function render() {
    const zoomed = view.k / fitK >= 1.8;
    gLand.setAttribute('transform', `matrix(${view.k} 0 0 ${view.k} ${view.x.toFixed(1)} ${view.y.toFixed(1)})`);
    placeOnScreen();
    sizeTapAreas();
    nodes.forEach((n) => {
      n.g.setAttribute('transform', `translate(${sx(n).toFixed(1)},${sy(n).toFixed(1)})`);
      // Labels sit above a lone dot; in a ring they point outward, away from the other members.
      const a = n.dir, c = a == null ? 0 : Math.cos(a), s = a == null ? -1 : Math.sin(a);
      n.label.setAttribute('x', (c * (NODE_R + 5)).toFixed(1));
      n.label.setAttribute('y', (s * (NODE_R + 5) + (s > 0.3 ? 9 : s < -0.3 ? 0 : 4)).toFixed(1));
      n.label.setAttribute('text-anchor', c > 0.35 ? 'start' : c < -0.35 ? 'end' : 'middle');
      n.label.classList.toggle('map-label-on', zoomed || n.g.classList.contains('map-node-playing') || n.g.classList.contains('map-node-pending'));
    });
    links.forEach((l) => {
      l.line.setAttribute('x1', sx(l.a).toFixed(1)); l.line.setAttribute('y1', sy(l.a).toFixed(1));
      l.line.setAttribute('x2', sx(l.b).toFixed(1)); l.line.setAttribute('y2', sy(l.b).toFixed(1));
    });
  }

  function zoomAt(px, py, factor) {
    // On a ring, zoom about its centre (the members' true place), so the ring opens up where it is instead of its
    // members flying off-screen.
    const ring = rings.find((g) => Math.hypot(px - g.cx, py - g.cy) <= g.r + HIT_R);
    if (ring) { px = ring.cx; py = ring.cy; }
    const k = Math.min(fitK * MAX_ZOOM[layout], Math.max(fitK * 0.5, view.k * factor));
    view.x = px - ((px - view.x) / view.k) * k;
    view.y = py - ((py - view.y) / view.k) * k;
    view.k = k;
    render();
  }

  // ── Gestures: one pointer pans, two pinch-zoom, wheel zooms, a short still press on a node plays it ──
  function bindGestures() {
    const pts = new Map();
    let tap = null, last = null;
    const local = (e) => { const r = svg.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
    const pair = () => { const [a, b] = [...pts.values()]; return { cx: (a.x + b.x) / 2, cy: (a.y + b.y) / 2, d: Math.hypot(a.x - b.x, a.y - b.y) }; };

    svg.addEventListener('pointerdown', (e) => {
      try { svg.setPointerCapture(e.pointerId); } catch (err) { /* capture only keeps a drag going off the map */ }
      const p = local(e); pts.set(e.pointerId, p);
      // The nearest centre wins, not whichever dot happens to be drawn on top.
      const node = pts.size === 1 && nodeAt(p.x, p.y);
      tap = node ? { id: node.id, x: p.x, y: p.y } : null;
      last = pts.size === 2 ? pair() : p;
    });
    svg.addEventListener('pointermove', (e) => {
      if (!pts.has(e.pointerId)) return;
      const p = local(e); pts.set(e.pointerId, p);
      if (pts.size === 1) {
        if (tap && Math.hypot(p.x - tap.x, p.y - tap.y) > TAP_MOVE) tap = null;
        view.x += p.x - last.x; view.y += p.y - last.y; last = p; render();
      } else if (pts.size === 2) {
        const q = pair(); tap = null;
        if (last && last.d) { view.x += q.cx - last.cx; view.y += q.cy - last.cy; zoomAt(q.cx, q.cy, q.d / last.d); }
        last = q;
      }
    });
    const end = (e) => {
      if (!pts.has(e.pointerId)) return;
      pts.delete(e.pointerId);
      if (tap && pts.size === 0 && e.type === 'pointerup') hooks.onTap(tap.id);
      tap = null;
      last = pts.size === 1 ? [...pts.values()][0] : null;
    };
    svg.addEventListener('pointerup', end);
    svg.addEventListener('pointercancel', end);
    svg.addEventListener('wheel', (e) => { e.preventDefault(); const p = local(e); zoomAt(p.x, p.y, Math.exp(-e.deltaY * 0.0015)); }, { passive: false });
  }

  // ── Picture of the playing rhythm ──
  function buildPanel(id) {
    panelId = id;
    panel.replaceChildren();
    const head = el('div', 'map-panel-head');
    const titleRow = el('div', 'map-panel-title-row');
    // Play / stop beside the title. The panel stays on this rhythm after it stops, so the button plays it again.
    playBtn = el('button', 'map-panel-stop');
    playBtn.appendChild(el('span', 'material-symbols-outlined', 'stop'));
    playBtn.addEventListener('click', () => hooks.onTap(id));
    titleRow.appendChild(playBtn);
    titleRow.appendChild(el('h2', 'map-panel-title', hooks.name(id)));
    // Collapse chevron, always at the top right: down on phones (panel below the map), right on desktop (beside it).
    collapseBtn = el('button', 'map-panel-collapse');
    collapseBtn.appendChild(el('span', 'material-symbols-outlined', ''));
    collapseBtn.addEventListener('click', () => { collapsed = !collapsed; try { localStorage.setItem('rx-map-panel-collapsed', collapsed ? '1' : '0'); } catch (e) { /* ignore */ } paintPanelChrome(); });
    titleRow.appendChild(collapseBtn);
    head.appendChild(titleRow);
    head.appendChild(el('span', 'map-panel-sub', [hooks.region(id), groupLabel[id], hooks.bpm(id) + ' bpm'].filter(Boolean).join(' · ')));
    panel.appendChild(head);
    const body = el('div', 'map-panel-lanes');
    panelLanes = hooks.lanes(id).map((lane) => {
      const row = el('div', 'map-lane' + (lane.muted ? ' map-lane-muted' : ''));
      // The part name mutes / unmutes the part, like the list's mute button.
      const name = el('button', 'map-lane-label');
      name.appendChild(el('span', 'material-symbols-outlined', lane.muted ? 'volume_off' : 'volume_up'));
      name.appendChild(el('span', 'map-lane-name', lane.label));
      name.setAttribute('aria-pressed', String(!lane.muted));
      name.title = (lane.muted ? 'Unmute ' : 'Mute ') + lane.label;
      name.addEventListener('click', () => { hooks.toggleMute(id, lane.ids); refreshPanel(); });
      row.appendChild(name);
      const grid = el('div', 'map-steps' + (lane.locked ? ' map-steps-locked' : ''));
      const n = lane.pattern.length;
      grid.style.setProperty('--cols', n);
      const beat = Math.max(1, lane.grid / 4);
      const cells = [...lane.pattern].map((c, i) => {
        // Tap a step to turn it on or off (same edit as the list view); the 4/4 kick is shown but locked.
        const s = el(lane.locked ? 'span' : 'button', 'map-step' + (i % beat === 0 ? ' map-step-beat' : '') + (c === 'X' ? ' map-step-accent' : c === 'x' ? ' map-step-hit' : c === 'o' ? ' map-step-ghost' : ''));
        if (!lane.locked) {
          s.setAttribute('aria-label', lane.label + ' step ' + (i + 1) + (c === '.' ? ', off' : ', on'));
          s.addEventListener('click', () => { hooks.toggleStep(id, lane.ids, i); refreshPanel(); });
        }
        grid.appendChild(s); return s;
      });
      row.appendChild(grid); body.appendChild(row);
      return { cells, grid: lane.grid, now: -1 };
    });
    panel.appendChild(body);
  }

  /** Glide the view (zoom and pan) to a target over `ms`. `target` may be a function, re-read every frame, so the
   *  glide still lands right if the map is resized meanwhile (the picture panel opening). */
  function tweenView(target, ms) {
    cancelAnimationFrame(anim);
    const v0 = { ...view }, t0 = performance.now(), ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const frame = (now) => {
      const t = Math.min(1, (now - t0) / ms), e = ease(t), mix = (a, b) => a + (b - a) * e;
      const to = typeof target === 'function' ? target() : target;
      view = { x: mix(v0.x, to.x), y: mix(v0.y, to.y), k: mix(v0.k, to.k) };
      render();
      if (t < 1) anim = requestAnimationFrame(frame);
    };
    anim = requestAnimationFrame(frame);
  }

  /** Centre a rhythm, zoomed to at least `minRatio` times the fitted view, so its part of the map is in view. */
  function focus(id, minRatio = 3) {
    const n = nodes.find((x) => x.id === id);
    if (!n || !w) return;
    const ratio = Math.max(minRatio, view.k / fitK);
    tweenView(() => { const k = fitK * ratio; return { k, x: w / 2 - n.at[layout][0] * k, y: h / 2 - n.at[layout][1] * k }; }, 600);
  }

  /** Rebuild the picture after an edit, keeping the playhead where it was. */
  function refreshPanel() {
    if (!panelId) return;
    const now = panelLanes.map((l) => l.now);
    buildPanel(panelId); paintPanelChrome();
    panelLanes.forEach((l, k) => { if (now[k] >= 0 && l.cells[now[k]]) { l.cells[now[k]].classList.add('map-step-now'); l.now = now[k]; } });
  }

  /** Playhead: step k of each lane at this beat position (each lane on its own clock). */
  function step(id, abs, beats) {
    if (id !== panelId || beats == null) return;
    panelLanes.forEach((l) => {
      const k = Math.floor(beats / (4 / l.grid) + 1e-6) % l.cells.length;
      if (k === l.now) return;
      if (l.now >= 0) l.cells[l.now].classList.remove('map-step-now');
      l.cells[k].classList.add('map-step-now'); l.now = k;
    });
  }

  /** Play / stop icon, collapse chevron and the panel's collapsed state. */
  function paintPanelChrome() {
    if (!playBtn) return;
    const on = hooks.playing() === panelId, name = hooks.name(panelId);
    playBtn.firstChild.textContent = on ? 'stop' : 'play_arrow';
    playBtn.title = (on ? 'Stop ' : 'Play ') + name; playBtn.setAttribute('aria-label', playBtn.title);
    playBtn.classList.toggle('map-panel-play', !on);
    collapseBtn.firstChild.textContent = wide.matches ? (collapsed ? 'chevron_left' : 'chevron_right') : (collapsed ? 'expand_less' : 'expand_more');
    collapseBtn.title = collapsed ? 'Show the rhythm' : 'Hide the rhythm';
    collapseBtn.setAttribute('aria-label', collapseBtn.title); collapseBtn.setAttribute('aria-expanded', String(!collapsed));
    document.body.classList.toggle('map-panel-collapsed', collapsed);
    if (!on) panelLanes.forEach((l) => { if (l.now >= 0) l.cells[l.now].classList.remove('map-step-now'); l.now = -1; });
  }

  /** Repaint playing / queued nodes and the picture panel. */
  function paint() {
    if (!svg) return;
    const cur = hooks.playing(), pend = hooks.pending();
    nodes.forEach((n) => {
      n.g.classList.toggle('map-node-playing', n.id === cur);
      n.g.classList.toggle('map-node-pending', n.id === pend);
      n.g.setAttribute('aria-label', (n.id === cur ? 'Stop ' : 'Play ') + hooks.name(n.id));
    });
    // The panel follows the playing rhythm and stays on the last one after it stops.
    if (cur && cur !== panelId) buildPanel(cur);
    const show = !host.hidden && !!panelId;
    panel.hidden = !show;
    document.body.classList.toggle('map-has-panel', show);
    paintPanelChrome();
    render();
  }

  // The map leaves room for the panel at whatever size it is (full, collapsed, phone or desktop).
  function trackPanelSize() {
    const set = () => { const r = panel.getBoundingClientRect(); document.documentElement.style.setProperty('--panel-h', r.height + 'px'); document.documentElement.style.setProperty('--panel-w', r.width + 'px'); };
    if (window.ResizeObserver) new ResizeObserver(() => requestAnimationFrame(set)).observe(panel);
    wide.addEventListener ? wide.addEventListener('change', paintPanelChrome) : wide.addListener(paintPanelChrome);
  }

  return {
    init(h) { hooks = h; },
    show() { if (!svg) { build(); trackPanelSize(); } host.hidden = false; resize(); paint(); },
    hide() { if (!host) return; host.hidden = true; if (panel) panel.hidden = true; document.body.classList.remove('map-has-panel'); },
    paint, step, focus,
    selected: () => panelId,
  };
})();
