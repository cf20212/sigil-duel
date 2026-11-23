// Sigil Duel — shared constants: the shape of a duel, the aether curve and the cast.
export const MAX_HP = 20;
export const OPENING_HAND = 4;
export const HAND_LIMIT = 8;
export const AETHER_CAP = 6;

/** Aether crystals available on round `round` (1-based): 1, 2, 3, ... up to the cap. */
export function aetherForRound(round) {
  return Math.min(AETHER_CAP, round);
}

export const HERO = { name: 'Wrenna', title: 'Sigil Adept', side: 'hero' };
export const FOE = { name: 'The Hollow Archon', title: 'Keeper of the Ninth Sigil', side: 'foe' };

export const ELEMENTS = {
  ember: { label: 'Ember', color: '#e5484d' },
  tide: { label: 'Tide', color: '#3e8fe0' },
  thorn: { label: 'Thorn', color: '#43b581' },
  gloom: { label: 'Gloom', color: '#9b5de5' },
};
