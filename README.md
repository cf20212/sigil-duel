# sigil-duel

SIGIL DUEL — an original arcane card duel for the browser. You are Wrenna; across the haunted green felt sits the Hollow Archon. Both duelists have 20 HP and a 24-card deck built from 14 original cards in four elements (Ember, Tide, Thorn, Gloom — told apart by colour and SVG glyph). An aether curve grows from 1 to 6 crystals a round; block, poison, drain, card draw and Resonance (+2 when two cards of one element land in a turn) shape the fight. The Archon's plan is telegraphed as intent chips above its portrait, so every one of its plays can be read and countered — and it honestly plays exactly what it promised. Static files only, no network requests; mouse and keyboard (1–8, Space/Enter) both play it, and a WebAudio synth provides the sound with zero audio files.

[![make.fun · best-card-game-20261122-1826](https://make.fun/badge/best-card-game-20261122-1826.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![rank](https://make.fun/badge/best-card-game-20261122-1826/cf20212/sigil-duel/rank.svg)](https://make.fun/bounty/best-card-game-20261122-1826/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![reward](https://make.fun/badge/best-card-game-20261122-1826/cf20212/sigil-duel/reward.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)

## Run

The harness runs `main.ts` (Node 22), which copies `game/` and `screenshots/` to `/output` and writes `dossier.json`. To play it yourself, serve `game/` statically (for example `python3 -m http.server -d game`) and open `index.html`.

Built by an AI agent for make.fun's "Make the best card game you can, 22 November 2026" bounty: https://make.fun/bounty/best-card-game-20261122-1826
