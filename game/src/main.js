// Sigil Duel — the conductor: owns the current duel, deals the opening hands,
// walks the turns (the hero's clicks, then the Archon's promised plan), turns rule
// events into animation, log lines and sound, and raises the title and end screens.
// With ?shot= in the URL it instead stages one screenshot scene (see shots.js).
import { CARDS } from './cards.js';
import { makeRng } from './random.js';
import { createGame, dealOpeningHands } from './state.js';
import { canPlay, playCard, startTurn } from './rules.js';
import { foePlannedCards, planFoeTurn } from './ai.js';
import {
  addLog, cardElement, foeBarElement, foeHandElement, heroBarElement,
  heroHandElement, html, logElement, stageElement,
} from './render.js';
import { burst, floater, shake, wait } from './anim.js';
import { sfx } from './sound.js';
import { attachKeyboard } from './input.js';
import { stageShot } from './shots.js';

const regions = {
  foeBar: document.getElementById('foe-bar'),
  foeHand: document.getElementById('foe-hand'),
  stage: document.getElementById('stage'),
  log: document.getElementById('log'),
  heroHand: document.getElementById('hero-hand'),
  heroBar: document.getElementById('hero-bar'),
  fx: document.getElementById('fx-layer'),
  overlay: document.getElementById('overlay'),
};

let state = null;
let busy = false;

function nameOf(side) {
  return side === 'hero' ? 'Wrenna' : 'The Archon';
}

function renderAll() {
  regions.foeBar.replaceChildren(foeBarElement(state));
  regions.foeHand.replaceChildren(foeHandElement(state));
  regions.stage.replaceChildren(stageElement(state));
  regions.log.replaceChildren(logElement(state));
  regions.heroHand.replaceChildren(heroHandElement(state, onPlayCard));
  regions.heroBar.replaceChildren(heroBarElement(state, onEndTurn));
}

/** A fresh duel: shuffled decks, opening hands, first aether, and the Archon's first intent. */
function freshGame(seed) {
  state = createGame(makeRng(seed));
  dealOpeningHands(state);
  startTurn(state, 'hero');
  planFoeTurn(state);
  addLog(state, 'The Hollow Archon takes the far side of the table.', 'foe');
  addLog(state, 'Round 1. Your move, Adept.', 'turn');
  return state;
}

/** Turn the events rules.js returns into floaters, shakes, sounds and log lines. */
async function presentEvents(events) {
  for (const ev of events) {
    if (ev.type === 'play') {
      addLog(state, `${nameOf(ev.who)} casts ${CARDS[ev.cardId].name}.`, ev.who === 'hero' ? '' : 'foe');
      sfx.play();
      renderAll();
      await wait(230);
    } else if (ev.type === 'damage') {
      if (ev.blocked > 0) {
        floater(regions.fx, ev.who, `Blocked ${ev.blocked}`, 'blocked');
        sfx.blocked();
      }
      if (ev.dealt > 0) {
        floater(regions.fx, ev.who, `-${ev.dealt}`);
        shake(ev.who === 'foe' ? regions.foeBar : regions.heroBar);
        sfx.hit();
        addLog(state, `${nameOf(ev.who)} takes ${ev.dealt} damage.`, ev.who === 'hero' ? 'foe' : 'good');
      }
      renderAll();
      await wait(250);
    } else if (ev.type === 'heal' && ev.amount > 0) {
      floater(regions.fx, ev.who, `+${ev.amount}`, 'heal');
      sfx.heal();
      addLog(state, `${nameOf(ev.who)} mends ${ev.amount} health.`, ev.who === 'hero' ? 'good' : 'foe');
      renderAll();
      await wait(160);
    } else if (ev.type === 'block') {
      floater(regions.fx, ev.who, `+${ev.amount} Block`, 'blocked');
      addLog(state, `${nameOf(ev.who)} raises ${ev.amount} block.`);
      renderAll();
      await wait(140);
    } else if (ev.type === 'resonance') {
      floater(regions.fx, ev.who, 'Resonance +2', 'note');
      addLog(state, `Resonance — the ${ev.element} sigils harmonise.`, 'good');
      renderAll();
      await wait(140);
    } else if (ev.type === 'poison') {
      floater(regions.fx, ev.who, `-${ev.amount} poison`);
      addLog(state, `Poison bites ${nameOf(ev.who)} for ${ev.amount}.`, 'foe');
      renderAll();
      await wait(200);
    } else if (ev.type === 'poisonApplied') {
      addLog(state, `${nameOf(ev.who)} is poisoned (${ev.amount}).`, 'foe');
    } else if (ev.type === 'energy') {
      addLog(state, `${nameOf(ev.who)} kindles ${ev.amount} aether.`);
    } else if (ev.type === 'draw' && ev.who === 'foe') {
      addLog(state, 'The Archon draws.');
    } else if (ev.type === 'death') {
      addLog(state, ev.who === 'foe' ? 'The Hollow Archon crumbles to ash and echoes.' : 'Wrenna falls.', 'turn');
      renderAll();
      await wait(350);
    }
  }
}

async function onPlayCard(card) {
  if (busy || !canPlay(state, 'hero', card)) return;
  busy = true;
  const events = playCard(state, 'hero', card);
  await presentEvents(events);
  renderAll();
  busy = false;
  if (state.phase === 'won') showEnd(true);
}

async function onEndTurn() {
  if (busy || state.phase !== 'hero') return;
  busy = true;
  state.phase = 'foe';
  addLog(state, 'The Archon acts on its intent.', 'turn');
  renderAll();
  await wait(480);

  await presentEvents(startTurn(state, 'foe'));
  renderAll();
  if (state.phase === 'lost') { busy = false; showEnd(false); return; }

  for (const card of foePlannedCards(state)) {
    if (state.phase === 'won' || state.phase === 'lost') break;
    await presentEvents(playCard(state, 'foe', card));
    renderAll();
    await wait(190);
  }
  if (state.phase === 'won') { busy = false; showEnd(true); return; }
  if (state.phase === 'lost') { busy = false; showEnd(false); return; }

  state.round += 1;
  state.stats.turns = state.round;
  state.phase = 'hero';
  const opening = startTurn(state, 'hero');
  planFoeTurn(state);
  await presentEvents(opening);
  if (state.phase === 'lost') { busy = false; showEnd(false); return; }
  addLog(state, `Round ${state.round}. Your move.`, 'turn');
  sfx.turn();
  renderAll();
  busy = false;
}

function showTitle() {
  const fan = html('<div class="fan"></div>');
  [['flameLance', -7], ['tideShield', 0], ['starfall', 7]].forEach(([id, tilt], i) => {
    const el = cardElement({ uid: -10 - i, id });
    el.style.setProperty('--tilt', `${tilt}deg`);
    fan.append(el);
  });
  const screen = html(`
    <div class="screen">
      <h1>SIGIL DUEL</h1>
      <h2>An arcane card duel in four elements</h2>
      <p class="rules">Trade strikes, wards and poisons with the Hollow Archon across a
      haunted felt. Spend <b>aether</b> to cast; play two cards of one <b>element</b> in a
      turn to wake <b>Resonance</b>. The Archon shows its <b>intent</b> before it acts —
      block it, race it, or call its bluff. First to fall loses their sigil.</p>
    </div>`);
  const button = html('<button class="big-btn" type="button">Take Your Seat</button>');
  button.addEventListener('click', () => {
    sfx.unlock();
    regions.overlay.classList.remove('show');
    regions.overlay.replaceChildren();
  });
  screen.insertBefore(fan, screen.querySelector('.rules'));
  screen.append(button);
  regions.overlay.replaceChildren(screen);
  regions.overlay.classList.add('show');
}

function showEnd(won, { quiet = false } = {}) {
  const screen = html(`
    <div class="screen ${won ? '' : 'defeat'}">
      <h1>${won ? 'VICTORY' : 'DEFEAT'}</h1>
      <h2>${won ? 'The Ninth Sigil shatters — the table is yours.' : 'The Archon keeps its sigil. This time.'}</h2>
      <div class="stats">
        <div><b>${state.stats.turns || state.round}</b>Rounds</div>
        <div><b>${state.stats.damageDealt}</b>Damage dealt</div>
        <div><b>${state.stats.cardsPlayed}</b>Cards played</div>
      </div>
    </div>`);
  const button = html('<button class="big-btn" type="button">Duel Again</button>');
  button.addEventListener('click', () => {
    regions.overlay.classList.remove('show');
    regions.overlay.replaceChildren();
    freshGame((Date.now() % 2147483646) + 1);
    renderAll();
  });
  screen.append(button);
  regions.overlay.replaceChildren(screen);
  regions.overlay.classList.add('show');
  if (!quiet) {
    if (won) {
      sfx.win();
      burst(regions.fx, 50, 38, 18);
    } else {
      sfx.lose();
    }
  }
}

// ---- boot ----
const params = new URLSearchParams(location.search);
const seedParam = Number(params.get('seed'));
const baseSeed = Number.isInteger(seedParam) && seedParam > 0 ? seedParam : (Date.now() % 2147483646) + 1;

state = freshGame(baseSeed);
renderAll();
attachKeyboard({
  playIndex: (index) => {
    const card = state.hero.hand[index];
    if (card) onPlayCard(card);
  },
  endTurn: onEndTurn,
});

const shot = params.get('shot');
if (shot) {
  stageShot(shot, baseSeed, {
    freshGame: (seed) => freshGame(seed),
    renderAll,
    showTitle,
    showEnd,
  });
} else {
  showTitle();
}
