// Sigil Duel — a pocket synthesiser: every sound is a few oscillators, so the game
// needs no audio files. Sounds start only after the player's first gesture.
let ctx = null;

function ensureCtx() {
  if (ctx) return ctx;
  try {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
  } catch {
    ctx = null;
  }
  return ctx;
}

function tone(freq, dur = 0.12, type = 'sine', gain = 0.06, when = 0) {
  const audio = ensureCtx();
  if (!audio) return;
  const osc = audio.createOscillator();
  const amp = audio.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  amp.gain.setValueAtTime(gain, audio.currentTime + when);
  amp.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + when + dur);
  osc.connect(amp).connect(audio.destination);
  osc.start(audio.currentTime + when);
  osc.stop(audio.currentTime + when + dur);
}

export const sfx = {
  unlock() { ensureCtx(); },
  play() { tone(520, 0.08, 'triangle', 0.05); },
  hit() { tone(140, 0.16, 'sawtooth', 0.07); tone(90, 0.2, 'square', 0.04, 0.02); },
  blocked() { tone(300, 0.1, 'square', 0.045); },
  heal() { tone(660, 0.14, 'sine', 0.05); tone(880, 0.16, 'sine', 0.05, 0.08); },
  draw() { tone(440, 0.06, 'triangle', 0.035); },
  turn() { tone(392, 0.09, 'triangle', 0.04); },
  win() { [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.22, 'triangle', 0.06, i * 0.11)); },
  lose() { [392, 330, 262, 196].forEach((f, i) => tone(f, 0.24, 'triangle', 0.055, i * 0.12)); },
};
