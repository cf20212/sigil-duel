// Sigil Duel — small stage effects: floating damage numbers, spark bursts, a shake
// for whoever was just hit. Pure DOM and CSS animation; no assets, no libraries.
import { html } from './render.js';

/** A number (or short word) that rises and fades over the table. side: 'foe' (top) or 'hero' (bottom). */
export function floater(layer, side, text, cls = '') {
  const el = html(`<div class="floater ${cls}">${text}</div>`);
  el.style.left = side === 'foe' ? '46%' : '46%';
  el.style.top = side === 'foe' ? '13%' : '72%';
  layer.append(el);
  setTimeout(() => el.remove(), 1100);
}

/** A burst of golden sparks from a point, for victories and big plays. */
export function burst(layer, xPct, yPct, count = 14) {
  for (let i = 0; i < count; i += 1) {
    const spark = html('<div class="spark"></div>');
    const angle = (Math.PI * 2 * i) / count + (i % 3) * 0.3;
    const dist = 60 + (i % 5) * 26;
    spark.style.left = `${xPct}%`;
    spark.style.top = `${yPct}%`;
    spark.style.setProperty('--dx', `${Math.cos(angle) * dist}px`);
    spark.style.setProperty('--dy', `${Math.sin(angle) * dist}px`);
    layer.append(spark);
    setTimeout(() => spark.remove(), 950);
  }
}

/** Shake an element once, as if struck. */
export function shake(element) {
  if (!element) return;
  element.classList.remove('shake');
  void element.offsetWidth; // restart the animation
  element.classList.add('shake');
}

/** A promise that resolves after `ms` — the metronome of the turn animations. */
export function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
