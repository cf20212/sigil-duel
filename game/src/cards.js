// Sigil Duel — the card catalogue. Every card belongs to one of four elements;
// playing two cards of the same element in one turn wakes Resonance (see rules.js).
// `art` names a glyph in ICONS: bold white silhouettes drawn over the element's colours,
// so a card reads at thumbnail size by shape and colour, never by text alone.

export const ICONS = {
  flame: '<path d="M12 22c4.4 0 7-2.9 7-6.6 0-3.1-2.2-5.2-3.5-7.5C14.1 6.6 13.1 4.7 13.1 2 10 4.3 8.5 6.7 8.6 9.3c0 1 .2 1.9.7 2.6C8.6 11.3 8 10.2 8 8.5 6.4 10.6 5 12.9 5 15.4 5 19.1 7.6 22 12 22z"/>',
  lance: '<path d="M3 21l1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L7 20l-4 1z"/><path d="M14 4l6 6-2.5.5L13.5 6.5 14 4z"/>',
  crown: '<path d="M2.5 18.5l-1-10L7 13l5-8.5L17 13l5.5-4.5-1 10h-19z"/><rect x="2.5" y="19" width="19" height="2.4" rx="1"/>',
  spark: '<path d="M12 1l2.2 6.8L21 10l-6.8 2.2L12 19l-2.2-6.8L3 10l6.8-2.2L12 1z"/><circle cx="18.6" cy="17.4" r="2.1"/><circle cx="5.2" cy="18.2" r="1.6"/>',
  shield: '<path d="M12 1.8l8.2 3v6.4c0 5.1-3.5 9.6-8.2 11.3C7.3 20.8 3.8 16.3 3.8 11.2V4.8l8.2-3z"/>',
  wave: '<path d="M2 9c2.6 0 2.6 2.2 5.2 2.2S9.8 9 12.4 9s2.6 2.2 5.2 2.2S20.2 9 22 9v3.4c-1.8 0-1.8 2.2-4.4 2.2s-2.6-2.2-5.2-2.2-2.6 2.2-5.2 2.2S4.6 12.4 2 12.4V9z"/><path d="M2 16.5c2.6 0 2.6 2.2 5.2 2.2s2.6-2.2 5.2-2.2 2.6 2.2 5.2 2.2 2.6-2.2 4.4-2.2v3.3c-1.8 0-1.8 2.2-4.4 2.2s-2.6-2.2-5.2-2.2-2.6 2.2-5.2 2.2S4.6 19.8 2 19.8v-3.3z"/>',
  drop: '<path d="M12 1.8s6.4 7 6.4 11.4a6.4 6.4 0 0 1-12.8 0C5.6 8.8 12 1.8 12 1.8z"/>',
  eye: '<path d="M1.5 12S5.4 5.4 12 5.4 22.5 12 22.5 12 18.6 18.6 12 18.6 1.5 12 1.5 12z"/><circle cx="12" cy="12" r="3.4"/>',
  leaf: '<path d="M20.5 3.5C11 3.5 4.5 10 4.5 19.5 13.5 19.5 20.5 13 20.5 3.5z"/><path d="M4.5 19.5C8 14.5 12.5 10 20.5 3.5c-6 7-10.5 11.5-16 16z" fill-opacity="0.45"/>',
  bloom: '<circle cx="12" cy="6.4" r="3.4"/><circle cx="17.8" cy="10.6" r="3.4"/><circle cx="15.6" cy="17" r="3.4"/><circle cx="8.4" cy="17" r="3.4"/><circle cx="6.2" cy="10.6" r="3.4"/><circle cx="12" cy="11.8" r="2.6" fill-opacity="0.55"/>',
  moon: '<path d="M20.6 14.6A8.8 8.8 0 1 1 9.4 3.4a7.2 7.2 0 0 0 11.2 11.2z"/>',
  shard: '<path d="M13.5 1.5L20 10l-4.5 12L9 14l4.5-12.5z"/><path d="M6 6l4 6-3.5 8L3.5 11 6 6z" fill-opacity="0.6"/>',
  star: '<path d="M12 1.5l3 6.6 7.2.8-5.3 4.9 1.4 7.1L12 17.4l-6.3 3.4 1.4-7.1L1.8 8.9l7.2-.8 3-6.6z"/>',
  sigil: '<path d="M12 2l2.5 6.2L21 9.3l-5 4.4 1.6 6.5L12 16.7l-5.6 3.5L8 13.7 3 9.3l6.5-1.1L12 2z"/>',
  hood: '<path d="M12 2a7 7 0 0 1 7 7c0 2.5-.6 4-1.5 5.2.3 2.4 1 4.3 2 5.8H4.5c1-1.5 1.7-3.4 2-5.8C5.6 13 5 11.5 5 9a7 7 0 0 1 7-7z"/><circle cx="9.4" cy="10.4" r="1.3" fill="#171126"/><circle cx="14.6" cy="10.4" r="1.3" fill="#171126"/>',
};

/** Wrap an icon name in an <svg> element with the given fill. */
export function iconSvg(name, fill = '#ffffff') {
  return `<svg viewBox="0 0 24 24" fill="${fill}" aria-hidden="true">${ICONS[name] ?? ICONS.sigil}</svg>`;
}

// kind: strike (damage), guard (block), mend (heal), plus optional riders.
// resonance: when a card's element was already played this turn, its main number grows by RESONANCE_BONUS.
export const CARDS = {
  cinderDart: { name: 'Cinder Dart', element: 'ember', cost: 1, art: 'flame', damage: 3, text: 'Deal 3 damage.' },
  flameLance: { name: 'Flame Lance', element: 'ember', cost: 2, art: 'lance', damage: 5, text: 'Deal 5 damage.' },
  infernoCrown: { name: 'Inferno Crown', element: 'ember', cost: 4, art: 'crown', damage: 9, text: 'Deal 9 damage. The table remembers fire.' },
  kindle: { name: 'Kindle', element: 'ember', cost: 0, art: 'spark', energy: 2, text: 'Gain 2 aether this turn.' },
  tideShield: { name: 'Tide Shield', element: 'tide', cost: 1, art: 'shield', block: 5, text: 'Gain 5 block.' },
  deepWard: { name: 'Deep Ward', element: 'tide', cost: 3, art: 'wave', block: 10, text: 'Gain 10 block.' },
  mendingRain: { name: 'Mending Rain', element: 'tide', cost: 2, art: 'drop', heal: 5, text: 'Restore 5 health.' },
  insight: { name: 'Insight', element: 'tide', cost: 1, art: 'eye', draw: 2, text: 'Draw 2 cards.' },
  thornWhip: { name: 'Thorn Whip', element: 'thorn', cost: 1, art: 'leaf', damage: 3, text: 'Deal 3 damage.' },
  venomBloom: { name: 'Venom Bloom', element: 'thorn', cost: 2, art: 'bloom', damage: 3, poison: 2, text: 'Deal 3 damage and poison for 2.' },
  overgrowth: { name: 'Overgrowth', element: 'thorn', cost: 3, art: 'leaf', block: 5, heal: 4, text: 'Gain 5 block and restore 4 health.' },
  moonSiphon: { name: 'Moon Siphon', element: 'gloom', cost: 2, art: 'moon', damage: 3, drain: 3, text: 'Deal 3 damage and drain 3 health from it.' },
  nightTerror: { name: 'Night Terror', element: 'gloom', cost: 3, art: 'shard', damage: 6, text: 'Deal 6 damage.' },
  starfall: { name: 'Starfall', element: 'gloom', cost: 5, art: 'star', damage: 12, text: 'Deal 12 damage. Once a century, the sky agrees.' },
};

export const RESONANCE_BONUS = 2;

/** The 24-card recipe both duellists shuffle up: a fair duel, decided by play. */
export const DECK_RECIPE = [
  'cinderDart', 'cinderDart', 'cinderDart',
  'flameLance', 'flameLance', 'infernoCrown', 'kindle', 'kindle',
  'tideShield', 'tideShield', 'tideShield', 'deepWard',
  'mendingRain', 'mendingRain', 'insight', 'insight',
  'thornWhip', 'thornWhip', 'thornWhip', 'venomBloom', 'venomBloom',
  'overgrowth', 'moonSiphon', 'starfall',
];
