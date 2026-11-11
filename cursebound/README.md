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

## Python helper
```
python tools/cursebound_tool.py check    # catches missing files and frame numbers outside a sheet
python tools/cursebound_tool.py assets   # what the game downloads, and unused images you can delete
python tools/cursebound_tool.py serve    # play locally at http://localhost:8000
```
The game loads its JSON with `fetch`, so double-clicking `index.html` won't work; use `serve` to test on your computer.
