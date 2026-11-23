// Sigil Duel — keyboard and pointer input. Cards answer to clicks (wired in render.js)
// and to their number keys; Space or Enter ends the turn; any first gesture unlocks sound.
import { sfx } from './sound.js';

/** Wire the keyboard for a duel. handlers: { playIndex(i), endTurn() }. Returns an unwire function. */
export function attachKeyboard(handlers) {
  const onKey = (event) => {
    sfx.unlock();
    if (event.key >= '1' && event.key <= '8') {
      handlers.playIndex(Number(event.key) - 1);
    } else if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      handlers.endTurn();
    }
  };
  window.addEventListener('keydown', onKey);
  return () => window.removeEventListener('keydown', onKey);
}
