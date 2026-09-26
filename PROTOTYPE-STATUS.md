# WIND & RAIN
## First Playable — Status Report, 26 September 2026

This document is the companion to `game-design-doc.md` (v0.1). The design doc says what the
first playable should be; this one says what the build in this repository actually is, where it
matches the doc, where it falls short, what was added beyond it, and which decisions are now
open. It is written for the design team, so it follows the doc's section numbers.

The short version: **everything in section 25 ("Minimum Viable First Playable") is in and
works end to end.** A new player can start, watch Vietras dance for Wind, build a Khata, a War
Hall and a Rain Shrine, train Streletz and a Vitez, walk an army across the valley, fight, and
destroy the rival Grod to a victory screen. The rival clan gathers, builds, defends and raids.
The art has just been rebuilt to the early-2000s target (Warcraft III style painted models).
What is **not** in: anything the doc puts in "next milestone" (Baba, active rituals, more
creatures, day/night, weather, a second map), any balance work, and the landmark idol has no
function. The two questions the doc says the prototype exists to answer (section 26) have not
been put in front of players yet.

---

# 1. What this demo is

A browser game: one HTML page, Three.js, no build step, no server logic, no image or audio
files. Every model is code that paints its own textures at load time; every sound is WebAudio
synthesis. It runs on a laptop with mouse and keyboard and on a phone with touch controls.

- **Play:** serve the `game/` folder statically and open `game/index.html`
  (e.g. `cd game && python3 -m http.server 8765`, then `http://localhost:8765/`).
- **Inspect models without playing:** `game/workshop.html` shows every unit, building and prop
  the way the game builds it, with clan colours, poses, wireframe and the painted texture.
- **Reference screenshots** of the previous art pass are in `_critic/`.

One match, one map, one opponent. A session is 10–20 minutes, as the doc asks.

---

# 2. Status against the design doc, section by section

| Doc § | Topic | Status | Notes |
|---|---|---|---|
| 3 | Core loop | **Done** | Gather Wind → Rain → build → train → explore → fight → expand, all functional. |
| 4 | Wind and Rain | **Done** | 1 Wind/s per dancing Vietra, 1 Rain/s per Zherca at a shrine; both interrupted by combat. |
| 5 | Starting state | **Done** | 1 Grod, 3 Vietras (already dancing in the circle), 1 Zherca, 50 Wind, 0 Rain, spring nearby. |
| 6 | Six units | **Done** | All six, at the doc's costs and supply. Stats are prototype constants (see §7 below). |
| 7 | Baba | **Not started** | As the doc intends. |
| 8 | Five buildings | **Done** | Grod, Khata, War Hall, Rain Shrine (must be at a spring), Sacred Grove (unlocks Bear). |
| 9 | Population | **Done** | Cap 10, +8 per Khata, hard ceiling 60. |
| 10 | The Sacred Valley | **Done** | Player SW, rival NE, river with two fords, marsh, dividing forest with passages, three springs (one exposed), clearing with the spirit, idol on a hill. |
| 11 | Rival clan | **Done** | Same models, clan-coloured. AI gathers, trains, builds Khatas, expands to the exposed spring after minute 8, defends its home, raids from minute 5 in growing waves. |
| 12 | Forest Spirit | **Done, plus** | Guards the clearing, leashes back home, heals when idle, ground slam splashes damage. Killing it pays +150 Wind +75 Rain (not in the doc). |
| 13 | Objectives | **Done** | The nine sequential objectives, exactly as listed. |
| 14 | Combat model | **Done** | HP, damage, cooldown, range, speed, supply only. Two multipliers the doc implies: Bear ×3 vs buildings, Deer ×2.2 vs ritualists, Streletz ×0.35 vs buildings. |
| 15 | Controls | **Done, plus** | Classic RTS mouse/keys, plus Cmd/Ctrl+click as command, double-click type select, control groups, idle-worker key, rally points, touch controls. |
| 16 | Camera | **Done** | Fixed-yaw perspective camera; zoom tilts from top-down (far) to ~34° (near), WC3-style. No rotation. |
| 17 | Visual direction | **Done (this week)** | Rebuilt to WC3-era painted low-poly. See §5 for what still reads weak. |
| 18 | Animation | **Done, procedural** | Wind Dance and Rain Rite are the two richest animations; walk, attack, build, idle, death exist for every unit. No hand-keyed frames. |
| 19 | Audio | **Done** | Dancers add layers to one settlement rhythm; Zhercas add chant, water, thunder. Combat SFX synthesised. |
| 20 | UI | **Done** | Resource bar, selection panel with portrait/HP/commands, objectives, minimap, toasts. |
| 21 | Economy numbers | **Done** | Verbatim from the doc's table. |
| 22 | Match flow | **Roughly** | The AI's timings target the doc's minute-by-minute flow; nobody has measured real sessions against it. |
| 23 | Victory / defeat | **Done** | Rival Grod down = victory. Defeat when your Grod is down and you cannot rebuild it (no Vietra or <300 Wind). |
| 24 | Explicit exclusions | **Respected** | None of the excluded features were built. |
| 25 | MVP checklist | **All 12 items** | See the opening summary. |
| 26 | The two tests | **Not run** | See §6. |
| 27 | Next milestone | **Not started** | |

---

# 3. What is in the build, in detail

## Economy
- Vietras dance in two rings in front of their Grod (8 + 12 slots, each unit keeps a stable
  spot). Ordering a dancer anywhere stops her income; combat interrupts a ritual for 4 s.
- Rain Shrines hold **3** Zhercas each. A spring with a shrine on it is removed from the map
  until the shrine dies; the rival starts with the NE spring already built.
- Building: Vietras build Grod, Khata, War Hall; Zhercas build Rain Shrine and Sacred Grove.
  Cost is paid on placement, refunded if cancelled; the builder walks to the site and the
  building grows while she works. A Vietra who was dancing goes back to the circle afterwards.
- Training queues (max 5), cancellable with refund; rally points that understand context
  (rally on the Grod = new Vietras dance, on a shrine = new Zhercas perform the rite, on an
  enemy = attack).
- Supply: 10 base, +8 per built Khata, cap 60.

## Units (all six)
Each has HP, damage, cooldown, range, speed, sight, supply, and a procedural rig. Idle military
units auto-acquire enemies in sight and chase a limited distance, then return. Ranged units
shoot a visible arrow. Units path on a 2 m grid with re-pathing, separation and a stuck check;
they form a loose square when a group is moved.

## Buildings (all five)
Footprints as specified (Grod 11 m, Khata 5, War Hall 9×7, Shrine 5, Grove 9). Buildings block
the path grid, wear the ground under them, have HP, collapse when killed (units inside the
queue are refunded), and swap clan colour.

## Map
180 × 180 m heightfield. River with two fords, marsh ponds, a forest band with two passages,
the spirit's clearing in the centre, a hill with the idol in the SW. Fog of war: unexplored is
black, explored-but-unseen is dimmed, vegetation dims with it. The minimap shows terrain,
fog and unit dots.

## Rival clan AI
Ticks once a second. Keeps its dancers dancing and its Zhercas at shrines; trains up to five
Vietras and enough Zhercas for its shrines; builds Khatas when supply runs short; builds a Grove
after minute 6; expands to the exposed central spring after minute 8 with an escort; trains a
mix of Streletz / Vitez / Deer (and Bears from the Grove) up to an army cap that grows with the
clock (4 + 1.2 per minute, max 16); pulls its home army onto anything that hits it near home;
raids from minute 5 in waves of 3, 5, 7, 9, 10 every ~2.5–3 min through alternating forest
passages, aimed at the player's most exposed building.

## Controls
Laptop: click / drag-box / double-click type / Shift add; right-click (or Cmd/Ctrl+click, or
two-finger click) to move, attack, dance (on Grod), rite (on shrine), rally (on own building);
Ctrl+1–9 groups, `.` idle worker, F2 army, Space home, WASD / arrows / screen edges / wheel;
Escape. Phone: tap, double-tap, long-press for command, camera stick, pinch zoom, BOX / ARMY /
IDLE / HOME buttons. Hotkeys on every command button.

## Presentation
- Models: WC3-style lofted low-poly with one hand-painted atlas per character (one draw call
  per unit) and shared painted textures for buildings and vegetation. Team colour is a painted
  mask multiplied by the clan colour.
- Lighting: single sun with cascaded shadows, warm ground bounce, sky fill, aerial haze, light
  bloom; blob shadows under units.
- Effects: wind motes circling dancers, a rain cloud and splashes over active shrines, dust on
  building sites, blood, arrows, collapse dust, selection rings, health bars, order markers.
- Audio: the economy is the soundtrack (frame drum, bells, clave and voice per dancer; chant,
  water, drum and thunder per ritualist); axe, bow, hit, shout, roar, spirit, build knock,
  objective, victory and defeat cues.

---

# 4. What is NOT there yet

Against the doc:
- **Nothing from section 27.** No Baba, no active rituals, no other creatures, no day/night,
  weather, second map, faction identity, upgrades, story.
- **No balance pass.** Every number is the doc's placeholder or a first guess (§7). Nobody has
  tuned time-to-first-army, raid pressure, or how punishing an interrupted dance is.
- **No playtesting.** The doc's two key questions (§26) are unanswered.
- **The landmark idol is decoration.** It glows and sparkles, blocks pathing and is hidden by
  fog, but it cannot be selected or interacted with. The doc only asks for "one mysterious
  supernatural landmark", so this is not a gap against the doc, but it is the obvious hook for
  the "supernatural interaction" the doc wants next.
- **No scoring or end-of-match statistics** beyond a victory / defeat screen (the doc says none
  is needed).
- **No settings, save, pause, difficulty or restart-in-place.** Reload the page to play again.
- **No hand-authored animation.** Everything is procedural (sine-based) on the asset's joints;
  it reads at RTS distance and is not meant to survive close-ups.
- **Combat animations are secondary**, as the doc allows: melee is a swing with a timed hit,
  ranged is a draw and a flying arrow. No hit reactions.
- **One opponent behaviour.** The AI has no difficulty levels and does not adapt to the
  player beyond defending and retargeting raids.

Beyond the doc (things that exist but were not asked for): fog of war, rally points, control
groups, idle-worker selection, the spirit's reward, the phone controls, the model workshop.

---

# 5. Known rough edges

Art (just rebuilt; a second pass is expected):
- Faces are painted for RTS distance; close-ups of the workshop "Face" view show them as
  simple.
- The Streletz's bow ends up diagonal across his body in the draw pose.
- The Forest Spirit is dark and reads mostly by its glowing eyes and core.
- Building textures were darkened once after an in-game check; the full sun still bleaches
  thatch and daub at noon, and the ground texture is flatter than the buildings.
- Idle units stand still apart from breathing; there are no idle fidgets.

Engine:
- Painting all textures at load takes a few seconds on first start; there is no asset cache.
- Pathing is grid-based; units can jostle in doorways and occasionally give up on a
  blocked path (the stuck check drops the order after ~4 s).
- Melee units attacking a building cluster on the nearest face.
- `DANCE_RADIUS` (18 m) is defined in the config but never enforced: a Vietra ordered to dance
  walks to her Grod's circle from anywhere on the map.
- Phone performance has not been re-measured since the art rebuild (the previous build ran on
  a phone at a reduced tier).
- Chrome pauses the game entirely when the tab is hidden (no catch-up on return).

Process:
- The 404 recipe's harness (`verify.mjs`, the three-candidate process) is not in this repo;
  the `assets/*.expect.json` files are the only trace of it. Assets are now judged in the
  workshop instead.
- No automated tests.

---

# 6. Questions for the designers

1. **Run the two tests.** Section 26 asks whether watching ritualists gather feels like an
   economy, and whether the look is memorable. Suggested protocol: five players, one match
   each, no explanation beyond the on-screen objectives, record session length and where each
   player stalled; ask the two questions verbatim afterwards.
2. **Is the ritual economy readable enough?** Today a dancer's income is shown only by the
   resource counter ticking and the sound layers. Options: a per-dancer floating "+1", a ring
   fill around the Grod, or nothing (the doc wants little text). Decide before playtests.
3. **What does the idol do?** Options that fit the next milestone: (a) a fourth Rain site a
   Zherca can perform the rite at; (b) a contested blessing (+25% Wind for whoever holds the
   hill), which gives the raids a natural target; (c) a one-shot boon that "wakes" it.
4. **Raid pressure.** The first patrol arrives at minute 5 with three units; waves grow to ten.
   Too gentle for RTS veterans, possibly too hard for the doc's target player. Decide the target
   player before tuning.
5. **Rain scarcity.** With three springs and 3 slots each, Rain is capped at 9/s per side
   before contest. Is that the intended pressure, or should the exposed spring be the only
   second source?
6. **Camera lock.** Yaw is fixed; zoom tilts the camera. Keep it locked (doc) or allow a small
   rotation for phones?
7. **Art direction sign-off.** The WC3-style pass is the new baseline (see the workshop). Which
   of the rough edges in §5 matter before playtests, and does Vietra read as intended?
8. **Next milestone scope.** The doc says the first expansion is supernatural interaction. The
   cheapest starts from what exists: the idol, the spirit's reward, and the Zherca's rite.

---

# 7. The numbers as built

Units (`game/src/config.js`). Heights are display heights (about 1.45× life size, the RTS
convention). Range in metres, cooldown in seconds.

| Unit | Wind | Rain | Supply | Train | HP | Dmg | CD | Range | Speed | Sight | Notes |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| Vietra | 50 | 0 | 1 | 12 s | 60 | 3 | 1.5 | 1.4 | 3.4 | 12 | builder, dances |
| Zherca | 50 | 0 | 1 | 14 s | 70 | 4 | 1.5 | 1.4 | 3.2 | 12 | builder, rite |
| Streletz | 50 | 0 | 1 | 11 s | 85 | 10 | 1.35 | 13 | 3.6 | 16 | ranged, ×0.35 vs buildings |
| Vitez | 100 | 25 | 2 | 18 s | 280 | 21 | 1.6 | 2.0 | 2.9 | 13 | |
| Deer Rider | 50 | 50 | 1 | 16 s | 140 | 12 | 1.1 | 2.4 | 7.2 | 24 | ×2.2 vs ritualists |
| Bear | 100 | 0 | 2 | 22 s | 440 | 26 | 1.9 | 2.6 | 2.5 | 13 | ×3 vs buildings, needs Grove |
| Forest Spirit | — | — | — | — | 1500 | 48 | 2.4 | 3.6 | 2.2 | 15 | neutral, heals, slam splash |

Buildings.

| Building | Wind | Rain | Build | HP | Footprint | Trains / does |
|---|---:|---:|---:|---:|---:|---|
| Grod | 300 | 0 | 45 s | 2200 | 11 m | Vietra, Zherca; dance site; loss condition |
| Khata | 100 | 0 | 20 s | 420 | 5 m | +8 supply |
| War Hall | 150 | 0 | 30 s | 750 | 9×7 m | Streletz, Vitez, Deer Rider |
| Rain Shrine | 75 | 0 | 16 s | 380 | 5 m | at a spring; 3 Zherca slots |
| Sacred Grove | 150 | 50 | 30 s | 650 | 9 m | Bear |

Constants: start 50 Wind / 0 Rain / supply 10 (+8 per Khata, max 60); 1 Wind/s per dancer,
1 Rain/s per ritualist; combat interrupts a ritual for 4 s; the spirit's reward is 150 Wind + 75 Rain; rival starts with a Grod,
War Hall, Khata, shrine, 4 Vietras, 1 Zherca, 3 Streletz, 1 Vitez and 120 Wind; first raid at
minute 5, then every 150–190 s.

---

# 8. Where things live

- `game/index.html`, `game/src/main.js` — boot, loading, the frame loop.
- `game/src/game.js` — rules: economy, orders, building, combat, fog, objectives, end.
- `game/src/ai.js` — the rival clan and the starting positions.
- `game/src/ui.js` — camera, input (mouse, keyboard, touch), selection, panel, minimap.
- `game/src/config.js` — every number above.
- `game/src/anim.js` — procedural poses; `game/src/fx.js` — particles; `game/src/audio.js`.
- `game/src/terrain.js` — the valley, path grid, fog colouring; `game/src/path.js` — A*.
- `game/assets/*.js` — the 19 models; `game/paint.js`, `game/charkit.js`, `game/buildkit.js`
  — the painting and modelling kits; `STYLE.md` — the locked look.
- `game/workshop.html` — the model viewer.
- `game-design-doc.md` — the design; `README.md` — how to play.
