# Cursebound: Duel of Redemption

Browser fighting game. No build step: GitHub Pages serves these files as they are.

| File | What's in it |
|---|---|
| `index.html` | Page markup only: menu, battle HUD, touch controls |
| `css/cursebound.css` | All styling |
| `js/game.js` | Game engine: input, physics, combat, AI, rendering |
| `data/fighters.json` | **Edit this to tune the game.** Fighters (stats, sprite sheets, frames, jump poses, special, finisher, combos), stages, move timings |
| `assets/`, `characters/` | Sprite sheets and backgrounds |
| `tools/cursebound_tool.py` | Python helper (standard library only) |

## Common edits (all in `data/fighters.json`)
- **Hide or unhide a fighter:** add or remove `"hidden": true`.
- **Select screen:** `selectScreen.cards` places each clickable card on the artwork (in %). The purple frame `assets/select_glow.webp` lights up only on the selected card.
- **Faster or stronger fighter:** `stats.speed`, `stats.power`, `stats.weight`.
- **New jump art:** set `jump.sheet`, `jump.cols`, `jump.rows`, the five frame numbers and `"art": true`.
- **Move timing or damage:** `moves.lp` … `moves.hk`.
- **Knockdown art:** `ko.sheet` (its own strip) or `ko.frames` from the motion sheet; `"topple": true` tips the hurt pose over when there is no knockdown art.
- **Cutscenes:** `cutscene.sheet` is a 2×3 comic sheet in `cutscenes/` (panels numbered 0–5, left to right, top to bottom). `intro` panels play before round 1 for both fighters, then a VS card; `win` panels play for the match winner (the last one holds with “NAME WINS”). Any button skips. Fighters without a `cutscene` are skipped. Sheets load only when a match with that fighter starts.
- **Which sprite row each button uses:** `sheets.attackRows` (lp, mp, hp, lk, mk, hk).
- **Jump height and distance:** the top-level `jump` block.

## Python helper
```
python tools/cursebound_tool.py check    # catches missing files and frame numbers outside a sheet
python tools/cursebound_tool.py assets   # what the game downloads, and unused images you can delete
python tools/cursebound_tool.py serve    # play locally at http://localhost:8000
```
The game loads its JSON with `fetch`, so double-clicking `index.html` won't work; use `serve` to test on your computer.
