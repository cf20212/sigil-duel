// Sigil Duel — the Hollow Archon: a greedy, readable opponent. At the start of the
// hero's turn it settles what it will do on its own turn and shows that intent above
// its portrait, so the hero can block, race or heal against a plan they can see.
// The plan is honest: when its turn comes, it plays exactly the cards it promised.
import { aetherForRound } from './config.js';
import { defOf } from './state.js';

/** Score one card for the Archon's current mood; higher is played sooner. */
function scoreCard(state, card, energy, plan) {
  const def = defOf(card);
  const foe = state.foe;
  const hero = state.hero;
  if (def.cost > energy) return -1;
  let score = 0;
  if (def.energy) score = plan.length === 0 ? 9 : 4; // free aether first
  if (def.damage) {
    score = Math.max(score, def.damage * 3);
    if (def.damage >= hero.hp + hero.block) score = 1000; // a killing blow, always
    if (def.poison) score += def.poison * 3;
    if (def.drain) score += def.drain * 2;
  }
  if (def.heal && !def.drain) score = Math.max(score, foe.hp <= 10 ? def.heal * 3.2 : def.heal * 0.7);
  if (def.block) score = Math.max(score, foe.hp <= 12 || hero.hp > foe.hp ? def.block * 2 : def.block * 0.6);
  if (def.draw) score = Math.max(score, foe.hand.length - plan.length <= 3 ? 7 : 2.5);
  return score;
}

/**
 * Settle the Archon's plan for its next turn and the intent shown to the hero.
 * Runs when the hero's turn begins (and once at the deal).
 */
export function planFoeTurn(state) {
  const foe = state.foe;
  let energy = aetherForRound(state.round);
  const plan = [];
  const pool = [...foe.hand];
  for (let guard = 0; guard < 8; guard += 1) {
    let best = null;
    let bestScore = 0;
    for (const card of pool) {
      const score = scoreCard(state, card, energy, plan);
      if (score > bestScore) {
        bestScore = score;
        best = card;
      }
    }
    if (!best) break;
    plan.push(best);
    pool.splice(pool.indexOf(best), 1);
    energy -= defOf(best).cost;
    if (defOf(best).energy) energy += defOf(best).energy;
  }
  state.foePlan = plan.map((card) => card.uid);

  const intent = { damage: 0, block: 0, heal: 0, poison: 0, cards: plan.length };
  for (const card of plan) {
    const def = defOf(card);
    if (def.damage) intent.damage += def.damage;
    if (def.block) intent.block += def.block;
    if (def.heal && !def.drain) intent.heal += def.heal;
    if (def.poison) intent.poison += def.poison;
  }
  state.foeIntent = intent;
  return intent;
}

/** The cards the Archon promised to play, in order, as hand instances. */
export function foePlannedCards(state) {
  return state.foePlan
    .map((uid) => state.foe.hand.find((card) => card.uid === uid))
    .filter(Boolean);
}
