// Sigil Duel — the painter: turns state into the table a player sees.
// Bars, hands, the stage where played cards land, the combat log and the screens.
import { ELEMENTS, FOE, HERO } from './config.js';
import { iconSvg } from './cards.js';
import { defOf } from './state.js';

/** Build one DOM element from an HTML string. */
export function html(htmlText) {
  const template = document.createElement('template');
  template.innerHTML = htmlText.trim();
  return template.content.firstElementChild;
}

function kindWord(def) {
  if (def.damage && def.drain) return 'Drain';
  if (def.damage) return 'Strike';
  if (def.block && def.heal) return 'Bloom';
  if (def.block) return 'Guard';
  if (def.heal) return 'Mend';
  if (def.draw) return 'Vision';
  if (def.energy) return 'Kindling';
  return 'Sigil';
}

function boldNumbers(text) {
  return text.replace(/(\d+)/g, '<b>$1</b>');
}

/** One card face as a DOM element; `small` shrinks it for the stage and title fan. */
export function cardElement(card, { keyHint = null } = {}) {
  const def = defOf(card);
  const element = ELEMENTS[def.element];
  const el = html(`
    <div class="card el-${def.element}">
      <div class="cost">${def.cost}</div>
      <div class="cname">${def.name}</div>
      <div class="art">${iconSvg(def.art)}</div>
      <div class="ctext">${boldNumbers(def.text)}</div>
      <div class="cfoot">${iconSvg(def.art)} ${element.label} · ${kindWord(def)}</div>
      ${keyHint === null ? '' : `<div class="key-hint">${keyHint}</div>`}
    </div>`);
  el.dataset.uid = String(card.uid);
  el.dataset.cardId = card.id;
  return el;
}

function hpBar(who, heroSide) {
  const pct = Math.max(0, Math.round((who.hp / who.maxHp) * 100));
  const badges = [];
  if (who.block > 0) badges.push(`<span class="badge block">Block ${who.block}</span>`);
  if (who.poison > 0) badges.push(`<span class="badge poison">Poison ${who.poison}</span>`);
  return `
    <div class="hp-wrap">
      <div class="hp-track">
        <div class="hp-fill ${heroSide ? 'hero-hp' : ''}" style="width:${pct}%"></div>
        <div class="hp-text">♥ ${who.hp} / ${who.maxHp}</div>
      </div>
      <div class="status-badges">${badges.join('')}</div>
    </div>`;
}

function intentHtml(state) {
  const intent = state.foeIntent;
  if (!intent || intent.cards === 0) return '<div class="intent"><div class="intent-label">The Archon broods</div></div>';
  const chips = [];
  if (intent.damage) chips.push(`<span class="chip">⚔ ${intent.damage}</span>`);
  if (intent.block) chips.push(`<span class="chip shield">Block ${intent.block}</span>`);
  if (intent.heal) chips.push(`<span class="chip heal">Heal ${intent.heal}</span>`);
  if (intent.poison) chips.push(`<span class="chip dark">Poison ${intent.poison}</span>`);
  return `
    <div class="intent">
      <div class="intent-label">Archon intends · ${intent.cards} card${intent.cards === 1 ? '' : 's'}</div>
      <div class="intent-chips">${chips.join('')}</div>
    </div>`;
}

/** The foe's bar: portrait, health, and the intent it has telegraphed. */
export function foeBarElement(state) {
  return html(`
    <div class="duelist-bar" id="foe-bar-inner">
      <div class="avatar">${iconSvg('hood', '#c9b8e8')}</div>
      <div class="who"><div class="name">${FOE.name}</div><div class="title">${FOE.title}</div></div>
      ${hpBar(state.foe, false)}
      ${intentHtml(state)}
    </div>`);
}

/** The hero's bar: portrait, health, piles, aether crystals and the End Turn button. */
export function heroBarElement(state, onEndTurn) {
  const hero = state.hero;
  const gems = [];
  for (let i = 0; i < hero.energy; i += 1) gems.push('<div class="gem"></div>');
  const bar = html(`
    <div class="duelist-bar" id="hero-bar-inner">
      <div class="avatar hero-face">${iconSvg('sigil', '#a5e88a')}</div>
      <div class="who"><div class="name">${HERO.name}</div><div class="title">${HERO.title} · Round ${state.round}</div></div>
      ${hpBar(hero, true)}
      <div class="piles">
        <div class="pile"><b>${hero.deck.length}</b>Deck</div>
        <div class="pile"><b>${hero.discard.length}</b>Spent</div>
      </div>
      <div>
        <div class="aether"><span class="aether-label">Aether</span>${gems.join('') || '<span style="opacity:.6">spent</span>'}</div>
        <div class="end-hint">click a card, or press its number</div>
      </div>
      <div>
        <button id="end-turn" type="button">End Turn</button>
        <div class="end-hint">space / enter</div>
      </div>
    </div>`);
  const button = bar.querySelector('#end-turn');
  button.disabled = state.phase !== 'hero';
  button.addEventListener('click', onEndTurn);
  return bar;
}

/** Face-down backs for the foe's hand. */
export function foeHandElement(state) {
  const wrap = document.createElement('div');
  wrap.style.display = 'contents';
  for (let i = 0; i < state.foe.hand.length; i += 1) {
    wrap.append(html('<div class="card-back"></div>'));
  }
  if (state.foe.hand.length === 0) wrap.append(html('<div class="waiting">The Archon holds no cards</div>'));
  return wrap;
}

/** The hero's hand: fanned, tilted, numbered; unaffordable cards dimmed. */
export function heroHandElement(state, onPlay) {
  const wrap = document.createElement('div');
  wrap.style.display = 'contents';
  const mid = (state.hero.hand.length - 1) / 2;
  state.hero.hand.forEach((card, index) => {
    const el = cardElement(card, { keyHint: index + 1 });
    el.style.setProperty('--tilt', `${(index - mid) * 3.2}deg`);
    if (state.phase !== 'hero' || state.hero.energy < defOf(card).cost) el.classList.add('unplayable');
    el.addEventListener('click', () => onPlay(card));
    wrap.append(el);
  });
  if (state.hero.hand.length === 0) wrap.append(html('<div class="waiting">Your hand is empty — end the turn to draw.</div>'));
  return wrap;
}

/** The centre stage: the last card each duellist played, facing off. */
export function stageElement(state) {
  const wrap = document.createElement('div');
  wrap.style.display = 'contents';
  const heroCard = state.lastPlay.hero;
  const foeCard = state.lastPlay.foe;
  if (!heroCard && !foeCard) {
    wrap.append(html('<div class="waiting">The felt is bare. Play a card to open the duel.</div>'));
    return wrap;
  }
  if (foeCard) {
    const holder = html('<div class="stage-card"></div>');
    holder.append(cardElement({ uid: -1, id: foeCard }));
    wrap.append(holder);
  }
  if (heroCard && foeCard) wrap.append(html('<div class="versus">⚔</div>'));
  if (heroCard) {
    const holder = html('<div class="stage-card"></div>');
    holder.append(cardElement({ uid: -2, id: heroCard }));
    wrap.append(holder);
  }
  return wrap;
}

/** The combat log: the last stretch of the story, newest at the bottom. */
export function logElement(state) {
  const lines = state.log.slice(-11).map((line) => `<p class="${line.cls ?? ''}">${line.text}</p>`).join('');
  return html(`<div><h3>The Duel So Far</h3>${lines || '<p>Silence, before the first sigil is cast.</p>'}</div>`);
}

/** Append a line to the duel's story. */
export function addLog(state, text, cls = '') {
  state.log.push({ text, cls });
}
