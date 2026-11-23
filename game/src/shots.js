// Sigil Duel — the screenshot scenes behind ?shot=title|play|win|loss&seed=N.
// Each scene is staged from the game's own state and screens, so a screenshot is a real
// render of the game: the play scene is a genuine duel simulated forward by an autopilot
// that obeys the rules; the win and loss scenes set the table at the duel's final moment
// and raise the game's own end screens over it.
import { CARDS } from './cards.js';
import { drawCards } from './state.js';
import { playCard, startTurn } from './rules.js';
import { foePlannedCards, planFoeTurn } from './ai.js';
import { addLog } from './render.js';

/** The autopilot's choice: the dearest affordable card that cannot end the duel. */
function autopilotCard(state, side) {
  const who = state[side];
  const foe = state[side === 'hero' ? 'foe' : 'hero'];
  let best = null;
  for (const card of who.hand) {
    const def = CARDS[card.id];
    if (!def || def.cost > who.energy) continue;
    if (def.damage && def.damage + 2 >= foe.hp) continue; // never stage a killing blow
    if (!best || def.cost > CARDS[best.id].cost) best = card;
  }
  return best;
}

/** Play one full round with the autopilot on both sides, leaving the duel mid-flight. */
function simulateRound(state) {
  startTurn(state, 'hero');
  planFoeTurn(state);
  let card = autopilotCard(state, 'hero');
  let guard = 0;
  while (card && guard < 6) {
    playCard(state, 'hero', card);
    guard += 1;
    card = autopilotCard(state, 'hero');
  }
  state.phase = 'foe';
  startTurn(state, 'foe');
  for (const planned of foePlannedCards(state)) {
    if (state.phase === 'won' || state.phase === 'lost') break;
    playCard(state, 'foe', planned);
  }
  state.round += 1;
  state.phase = 'hero';
}

/**
 * Stage the named scene. `hooks` is main.js's { state, setState, renderAll, showTitle, showEnd }.
 */
export function stageShot(name, seed, hooks) {
  const state = hooks.freshGame(seed);
  if (name === 'play') {
    for (let round = 0; round < 3; round += 1) simulateRound(state);
    startTurn(state, 'hero');
    planFoeTurn(state);
    if (state.hero.hand.length < 4) drawCards(state, 'hero', 4 - state.hero.hand.length);
    if (state.lastPlay.foe) addLog(state, `The Archon casts ${CARDS[state.lastPlay.foe].name}.`, 'foe');
    if (state.lastPlay.hero) addLog(state, `Wrenna answers with ${CARDS[state.lastPlay.hero].name}.`, 'good');
    addLog(state, `Round ${state.round}. The Archon shows its hand — answer it.`, 'turn');
    hooks.renderAll();
    return;
  }
  if (name === 'win' || name === 'loss') {
    const won = name === 'win';
    state.round = 6;
    state.stats.turns = 6;
    state.stats.cardsPlayed = 14;
    state.stats.damageDealt = won ? 23 : 15;
    state.stats.damageTaken = won ? 11 : 20;
    state.hero.hp = won ? 9 : 0;
    state.foe.hp = won ? 0 : 7;
    state.hero.block = 0;
    state.foe.block = 0;
    state.lastPlay.hero = won ? 'flameLance' : 'tideShield';
    state.lastPlay.foe = won ? 'nightTerror' : 'starfall';
    state.foeIntent = null;
    state.foePlan = [];
    // Six rounds in, the piles should say so: most of the hero's deck is spent.
    state.hero.discard.push(...state.hero.deck.splice(0, 11));
    state.phase = won ? 'won' : 'lost';
    addLog(state, won ? 'Flame Lance finds the Hollow Archon\'s heart.' : 'Starfall. The felt goes dark.', won ? 'good' : 'foe');
    addLog(state, won ? 'The Ninth Sigil shatters. The duel is yours.' : 'Wrenna falls. The Archon keeps its sigil.', 'turn');
    hooks.renderAll();
    hooks.showEnd(won, { quiet: true });
    return;
  }
  // title (and any unknown name): a dealt table behind the title screen.
  hooks.renderAll();
  hooks.showTitle();
}
