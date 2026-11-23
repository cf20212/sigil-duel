// A tiny seeded random source (mulberry32). Real games seed it from the clock;
// screenshot scenes seed it from the URL, so the same seed always deals the same duel.
export function makeRng(seed) {
  let a = (seed >>> 0) || 1;
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** An integer in [0, n) drawn from rng. */
export function randInt(rng, n) {
  return Math.floor(rng() * n);
}

/** Fisher–Yates shuffle in place, driven by rng; returns the same array. */
export function shuffle(rng, list) {
  for (let i = list.length - 1; i > 0; i -= 1) {
    const j = randInt(rng, i + 1);
    const tmp = list[i];
    list[i] = list[j];
    list[j] = tmp;
  }
  return list;
}
