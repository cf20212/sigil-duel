// Sigil Duel — the duel's state: two duellists, their decks, hands and wounds.
// Nothing here touches the DOM; rules.js moves the state, render.js draws it.
import { HAND_LIMIT, MAX_HP, OPENING_HAND } from './config.js';
import { CARDS, DECK_RECIPE } from './cards.js';
import { shuffle } from './random.js';

let nextCardUid = 1;

/** A fresh duellist: full health, a shuffled 24-card deck, an empty hand. */
export function makeDuellist(side, rng) {
  const deck = shuffle(rng, DECK_RECIPE.map((id) => ({ uid: nextCardUid++, id })));
  return {
    side,
    hp: MAX_HP,
    maxHp: MAX_HP,
    block: 0,
    poison: 0,
    energy: 0,
    deck,
    hand: [],
    discard: [],
    playedElements: [],
  };
}

/** A whole new duel in its first moment, before the opening hands are drawn. */
export function createGame(rng) {
  nextCardUid = 1;
  return {
    rng,
    round: 1,
    phase: 'hero', // hero | foe | won | lost
    hero: makeDuellist('hero', rng),
    foe: makeDuellist('foe', rng),
    lastPlay: { hero: null, foe: null },
    foePlan: [],
    foeIntent: null,
    log: [],
    stats: { damageDealt: 0, damageTaken: 0, cardsPlayed: 0, turns: 0 },
  };
}

export function duellist(state, side) {
  return side === 'hero' ? state.hero : state.foe;
}

export function opponentOf(state, side) {
  return side === 'hero' ? state.foe : state.hero;
}

/** Draw `count` cards for a duellist, reshuffling the discard pile when the deck runs dry. */
export function drawCards(state, side, count) {
  const who = duellist(state, side);
  let drawn = 0;
  for (let i = 0; i < count; i += 1) {
    if (who.deck.length === 0 && who.discard.length > 0) {
      who.deck = shuffle(state.rng, who.discard);
      who.discard = [];
    }
    const card = who.deck.pop();
    if (!card) break;
    if (who.hand.length >= HAND_LIMIT) {
      who.discard.push(card); // a full hand lets the card slip straight to the discard
    } else {
      who.hand.push(card);
      drawn += 1;
    }
  }
  return drawn;
}

/** Both duellists draw their opening hands. */
export function dealOpeningHands(state) {
  drawCards(state, 'hero', OPENING_HAND);
  drawCards(state, 'foe', OPENING_HAND);
}

/** The printed card definition behind a hand/deck card instance. */
export function defOf(card) {
  return CARDS[card.id];
}
