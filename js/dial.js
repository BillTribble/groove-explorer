// Rotary dial standing in for an <input type="range">: the input stays in the page (hidden) and keeps its listeners;
// the dial sets its value and fires 'input', so app code is unchanged. Drag up / right to turn it up (a full turn is
// about 160 px), mouse wheel and arrow keys step it, Home / End jump to the ends, a double-tap resets to the default.
window.RX = window.RX || {};

RX.dial = function (input) {
  const NS = 'http://www.w3.org/2000/svg', min = +input.min, max = +input.max, step = +input.step || 1;
  const R = 18, C = 24, SWEEP = 270, L = (R * Math.PI * SWEEP) / 180;
  const pt = (deg, r) => { const a = (deg * Math.PI) / 180; return [C + r * Math.sin(a), C - r * Math.cos(a)]; };
  const mk = (tag, attrs) => { const e = document.createElementNS(NS, tag); Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v)); return e; };
  const [x0, y0] = pt(-SWEEP / 2, R), [x1, y1] = pt(SWEEP / 2, R);
  const arc = `M${x0.toFixed(2)},${y0.toFixed(2)} A${R},${R} 0 1 1 ${x1.toFixed(2)},${y1.toFixed(2)}`;

  const dial = document.createElement('div');
  dial.className = 'dial'; dial.tabIndex = 0;
  dial.setAttribute('role', 'slider');
  dial.setAttribute('aria-label', input.getAttribute('aria-label') || '');
  dial.setAttribute('aria-valuemin', min); dial.setAttribute('aria-valuemax', max);
  dial.title = (input.closest('[title]') || input).title || '';
  const svg = mk('svg', { viewBox: '0 0 48 48', width: 48, height: 48, 'aria-hidden': 'true' });
  const knob = mk('circle', { cx: C, cy: C, r: R - 6, class: 'dial-knob' });
  const track = mk('path', { d: arc, class: 'dial-track' });
  const value = mk('path', { d: arc, class: 'dial-value', 'stroke-dasharray': `0 ${L}` });
  const hand = mk('line', { x1: C, y1: C, x2: C, y2: C - (R - 9), class: 'dial-hand' });
  svg.append(knob, track, value, hand); dial.appendChild(svg);
  input.classList.add('dial-input');
  input.insertAdjacentElement('afterend', dial);

  const get = () => +input.value;
  function paint() {
    const t = (get() - min) / (max - min || 1), deg = -SWEEP / 2 + SWEEP * t, [hx, hy] = pt(deg, R - 9);
    value.setAttribute('stroke-dasharray', `${(t * L).toFixed(2)} ${L.toFixed(2)}`);
    hand.setAttribute('x2', hx.toFixed(2)); hand.setAttribute('y2', hy.toFixed(2));
    dial.setAttribute('aria-valuenow', get());
    const label = input.closest('label') && input.closest('label').querySelector('.amount-label');
    if (label) dial.setAttribute('aria-valuetext', label.textContent.trim());
  }
  function set(v) {
    const q = Math.min(max, Math.max(min, Math.round((v - min) / step) * step + min));
    if (q === get()) return;
    input.value = q;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    paint();
  }

  let drag = null, lastTap = 0; // a double-tap is two taps (presses that barely move) within 350 ms
  dial.addEventListener('pointerdown', (e) => {
    e.preventDefault(); // keep the surrounding <label> from moving focus to the hidden input
    dial.focus();
    try { dial.setPointerCapture(e.pointerId); } catch (err) { /* drag still works inside the dial */ }
    drag = { x: e.clientX, y: e.clientY, v: get(), moved: false };
  });
  dial.addEventListener('pointermove', (e) => {
    if (!drag) return;
    if (Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 4) drag.moved = true;
    set(drag.v + ((drag.y - e.clientY + (e.clientX - drag.x)) / 160) * (max - min));
  });
  dial.addEventListener('pointerup', (e) => {
    const tap = drag && !drag.moved, now = e.timeStamp || performance.now();
    drag = null;
    if (!tap) { lastTap = 0; return; }
    if (now - lastTap < 350) { set(+input.defaultValue); lastTap = 0; } else lastTap = now;
  });
  dial.addEventListener('pointercancel', () => { drag = null; });
  dial.addEventListener('click', (e) => e.preventDefault());
  dial.addEventListener('wheel', (e) => { e.preventDefault(); set(get() - Math.sign(e.deltaY) * Math.max(step, (max - min) / 50)); }, { passive: false });
  dial.addEventListener('keydown', (e) => {
    const big = e.shiftKey ? 5 : 1;
    const by = { ArrowUp: step, ArrowRight: step, ArrowDown: -step, ArrowLeft: -step, PageUp: 10 * step, PageDown: -10 * step }[e.key];
    if (by != null) { e.preventDefault(); set(get() + by * big); }
    else if (e.key === 'Home') { e.preventDefault(); set(min); }
    else if (e.key === 'End') { e.preventDefault(); set(max); }
  });
  input.addEventListener('input', paint);
  paint();
  return { paint };
};
