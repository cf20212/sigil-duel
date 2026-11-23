// Sigil Duel — the rules of the duel: turns, aether, damage through block, poison,
// and Resonance, the reward for playing two cards of one element in a single turn.
// Every change returns plain event objects; main.js turns them into animation and log lines.
import { aetherForRound } from './config.js';
import { RESONANCE_BONUS } from './cards.js';
import { defOf, drawCards, duellist, opponentOf } from './state.js';

/** Begin a duellist's turn: their old block fades, poison bites, aether refills, a card is drawn. */
export function startTurn(state, side) {
  const who = duellist(state, side);
  const events = [];
  who.block = 0;
  who.playedElements = [];
  if (who.poison > 0) {
    const amount = who.poison;
    who.hp -= amount;
    who.poison -= 1;
    events.push({ type: 'poison', who: side, amount });
    if (who.hp <= 0) {
      who.hp = 0;
      state.phase = side === 'hero' ? 'lost' : 'won';
      events.push({ type: 'death', who: side });
      return events;
    }
  }
  who.energy = aetherForRound(state.round);
  const drawn = drawCards(state, side, 1);
  if (drawn > 0) events.push({ type: 'draw', who: side, count: drawn });
  return events;
}

/** Push damage through a target's block; returns how much health was actually lost. */
export function dealDamage(state, targetSide, amount) {
  const target = duellist(state, targetSide);
  const blocked = Math.min(target.block, amount);
  target.block -= blocked;
  const dealt = amount - blocked;
  target.hp = Math.max(0, target.hp - dealt);
  if (targetSide === 'hero') state.stats.damageTaken += dealt;
  else state.stats.damageDealt += dealt;
  if (target.hp <= 0) state.phase = targetSide === 'hero' ? 'lost' : 'won';
  return { dealt, blocked };
}

export function canPlay(state, side, card) {
  const who = duellist(state, side);
  return state.phase === side && who.energy >= defOf(card).cost;
}

/**
 * Play one card from a duellist's hand. Applies cost, Resonance, then every effect
 * on the card, and returns the events it caused. Assumes canPlay was checked.
 */
export function playCard(state, side, card) {
  const who = duellist(state, side);
  const foe = opponentOf(state, side);
  const def = defOf(card);
  const events = [{ type: 'play', who: side, cardId: card.id }];

  who.hand = who.hand.filter((held) => held.uid !== card.uid);
  who.discard.push(card);
  who.energy -= def.cost;
  state.lastPlay[side] = card.id;
  if (side === 'hero') state.stats.cardsPlayed += 1;

  const resonant = who.playedElements.includes(def.element);
  if (resonant) events.push({ type: 'resonance', who: side, element: def.element });
  who.playedElements.push(def.element);
  const bonus = resonant ? RESONANCE_BONUS : 0;

  if (def.energy) {
    who.energy += def.energy;
    events.push({ type: 'energy', who: side, amount: def.energy });
  }
  if (def.draw) {
    const drawn = drawCards(state, side, def.draw);
    events.push({ type: 'draw', who: side, count: drawn });
  }
  if (def.block) {
    who.block += def.block + bonus;
    events.push({ type: 'block', who: side, amount: def.block + bonus });
  }
  if (def.heal && !def.drain) {
    const healed = Math.min(who.maxHp - who.hp, def.heal + bonus);
    who.hp += healed;
    events.push({ type: 'heal', who: side, amount: healed });
  }
  if (def.damage) {
    const { dealt, blocked } = dealDamage(state, foe.side, def.damage + bonus);
    events.push({ type: 'damage', who: foe.side, amount: def.damage + bonus, dealt, blocked });
    if (def.drain) {
      const healed = Math.min(who.maxHp - who.hp, def.drain);
      who.hp += healed;
      events.push({ type: 'heal', who: side, amount: healed });
    }
    if (state.phase === 'won' || state.phase === 'lost') events.push({ type: 'death', who: foe.side });
  }
  if (def.poison) {
    foe.poison += def.poison;
    events.push({ type: 'poisonApplied', who: foe.side, amount: def.poison });
  }
  return events;
}
