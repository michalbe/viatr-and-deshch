# WIND & RAIN
## Pitch Build — Status Report, 27 September 2026

This document is the companion to `game-design-doc.md` (v0.1) and to
`WIND-AND-RAIN-CAMPAIGN-BLUEPRINT.md` (v0.3). The design doc says what the first playable should
be; the blueprint says what a publisher-pitchable campaign should be; this one says what the
build in this repository actually is, where it matches those documents, where it falls short,
and which decisions are open. It is written for the design team.

The short version: **the first playable (design doc §25) is complete, and on top of it the
blueprint's five-mission campaign is implemented end to end**: a title screen with a campaign
that remembers progress, five scripted missions on five maps, in-mission dialogue with painted
portraits, checkpoints, pause, three difficulties, the Dola choices after Missions 3 and 4, and
every system the blueprint's pitch needs (rituals, Raise construction, the Baba, day/night with
the unquiet dead, the wandering storm, Binding, no-base exploration with shifting forest paths,
Vila rings, the Ognik, the Great Leshy choice, rising water, the Vodnik and Rusalki, a convoy
escort, and the Zmey silhouette that ends the pitch). Each mission has been driven to victory in
the browser through its scripted phases. What has **not** happened: any playtesting, any balance
pass, voice, hand-keyed animation, or the blueprint's Phase G polish. The numbers are first
guesses that make each mission completable, not tuned.

---

# 1. What this demo is

A browser game: one HTML page, Three.js, no build step, no server logic, no image or audio
files. Every model is code that paints its own textures at load time; every sound is WebAudio
synthesis. It runs on a laptop with mouse and keyboard (a trackpad is enough: Cmd+click is
the command click) and on a phone with touch controls.

- **Play:** serve the `game/` folder statically and open `game/index.html`
  (e.g. `cd game && python3 -m http.server 8765`, then `http://localhost:8765/`). The title
  offers **Campaign** (continue / new, with difficulty) and **Skirmish** (the original one-map
  match against the AI).
- **Jump to a mission:** `?mission=m03` (add `&all` to show every mission on the title even if
  locked, `&checkpoint=1` to resume the saved checkpoint, `&difficulty=hard`).
- **Inspect models without playing:** `game/workshop.html` shows every unit, building and prop
  the way the game builds it, with clan colours, poses, wireframe and the painted texture.
- **Reference screenshots** of an earlier art pass are in `_critic/`.

A skirmish is 10–20 minutes. A mission is 8–20 minutes; the campaign is about an hour and a
half if nothing goes wrong, which it will.

---

# 2. Status against the design doc (first playable)

| Doc § | Topic | Status | Notes |
|---|---|---|---|
| 3 | Core loop | **Done** | Gather Wind → Rain → build → train → explore → fight → expand. |
| 4 | Wind and Rain | **Done** | 1 Wind/s per dancing Vietra, 1 Rain/s per Zherca at a Zdroy; both interrupted by combat. |
| 5 | Starting state | **Done** | 1 Grod, 3 Vietras dancing, 1 Zherca, 50 Wind, 0 Rain (skirmish and Mission 1). |
| 6 | Six units | **Done** | All six at the doc's costs and supply. |
| 7 | Baba | **Done** | Trained at the Svety Gai (150 W / 125 R, supply 2) once the campaign unlocks her (Mission 2). Second Sight and the Ash Ward. |
| 8 | Five buildings | **Done** | Grod, Khata, Zbroynia (War Hall), Zdroy (Rain Shrine, at a spring), Svety Gai (Sacred Grove). Renamed per the blueprint. |
| 9 | Population | **Done** | Cap 10, +8 per Khata, ceiling 60. |
| 10 | The Sacred Valley | **Done** | Mission 1 and skirmish map. Maps are now data (`game/maps/*.js`); five exist. |
| 11 | Rival clan | **Done** | Gathers, builds, expands, defends, raids. Difficulty scales waves, caps and intervals. Missions switch it between modes (skirmish, passive, defend, raid, hold, off). |
| 12 | Forest Spirit | **Done, plus** | The Leshy warns intruders, then fights; can be **Offered** to (75 W / 25 R) and then withdraws the root walls that close its clearing. Killing it releases Leshonki and marks the campaign. |
| 13 | Objectives | **Done** | The nine objectives in skirmish and Mission 1; every mission has its own list (with optional and hidden ones). |
| 14 | Combat model | **Done** | HP, damage, cooldown, range, speed, supply; a few multipliers (Bear vs buildings, Deer vs ritualists, Streletz vs buildings, the dead in darkness, civilians take ×0.4). |
| 15 | Controls | **Done, plus** | Classic RTS, Cmd/Ctrl+click as command, groups, idle key, rally points, touch. Ritual targeting mode with hotkeys (N Wake, C Consecrate, F Offer, M Mend, R Ward, T Sight). |
| 16 | Camera | **Done** | Fixed yaw; zoom tilts from top-down to ~34°, WC3-style. |
| 17 | Visual direction | **Done** | WC3-era painted low-poly. 30 asset modules. |
| 18 | Animation | **Procedural** | Per-body gaits (a Vitez stomps, an Upir drags a leg, a Striga prowls, a Vila floats), idle fidgets every few seconds, dance, rite, build, attack, death, fall/rise for story units. No hand-keyed frames. |
| 19 | Audio | **Done** | The economy is the soundtrack; combat, construction and thunder cues; raise/rumble/thunderclap added for the campaign. |
| 20 | UI | **Done** | Resource bar with clock (☀/☾ when day/night is on), selection panel, objectives, minimap, toasts, dialogue box, mission stage screens, pause menu. |
| 21 | Economy numbers | **Done** | As in the doc. |
| 22 | Match flow | **Roughly** | Not measured against real sessions. |
| 23 | Victory / defeat | **Done** | Skirmish: rival Grod down / own Grod down with no way back. Missions: scripted. |
| 24 | Explicit exclusions | **Respected** | |
| 25 | MVP checklist | **All 12 items** | |
| 26 | The two tests | **Not run** | See §6. |
| 27 | Next milestone | **Done** (as the blueprint's campaign) | See §3. |

---

# 3. Status against the campaign blueprint

## Campaign shell (blueprint §19–21, §42)
- Title screen with Campaign (continue or new; Story / Standard / Hard) and Skirmish. Progress,
  flags, the Dola choice and a per-mission checkpoint live in `localStorage`.
- One page load is one mission. Each mission is a module of async **phases**; entering a phase
  saves a checkpoint (`rt.phase(id)`), so restarting a mission resumes at the last phase with
  the world (units, buildings, sites, walls, flags, fog, weather, water, day/night) restored.
- Pause (Esc / P / menu button) with resume, restart from checkpoint, restart mission, title.
- Mission stages: intro card with a speaker portrait and premise; end card with a summary of the
  mission's choices, statistics and, after Missions 3 and 4, the **Dola** choice (Stribog /
  Mokosh, then Perun / Veles). Dola effects are applied to the rules in later missions (Wind
  rate, Zdroy slots, Mend cost, Offer cost, Khata HP, Jelenik sight, Vitez first strike, arrows
  vs spirits, Baba sight, Ward duration).
- In-mission dialogue: a bottom box with a rendered portrait, name and title; auto-advances,
  Space / Enter / click skips a line; the game keeps running behind it.
- Working character names: Radomir (Zherca), Dobrogost (Vitez), Milena (Vietra), Baba Ostra,
  Chetvertak (rival Zherca). Story characters fall for 12 s and rise instead of dying.

## Systems (blueprint §30–41)
- **Rituals** as a targeting mode on ritualists: Wake (idol), Consecrate (mound, corpse, Bound
  Zdroy, idol), Offer (spirit, ring, idol; 75 W / 25 R), Mend (continuous, on a building), Ash
  Ward and Second Sight (Baba). Combat interrupts them.
- **Raise**: construction starts with a founding stake; the building's parts rise from the
  ground (stone) or descend (timber), converge in motes and finish with a blessing.
- **Day / night** with an hour clock, sunset and dawn events, a moon so night stays readable,
  sight reduced at night.
- **Corpses and the unquiet dead**: every fallen human leaves a marker; at night, outside a Ward,
  markers rise as Upiry; restless burial mounds raise them until consecrated; Strigi hunt
  ritualists after dark.
- **Weather**: storm volumes that wander a path, multiply Rain under them (×2.75) and starve it
  outside (×0.25 on the Long Valley), reduce sight, and strike telegraphed lightning.
- **Binding**: a rival Zdroy turned Bound blackens the ground and gives up Drowned Upiry until
  consecrated or destroyed.
- **Sites**: idols (sleeping / awake), burial mounds (restless / at peace), Vila rings
  (sleeping / appeased), declared per map.
- **Forest paths** that a mission can open and close (blocked regions plus root-wall props).
- **Spirits and creatures** with their own brains: Leshy (territory, patience, offering,
  leash), Leshonok (ambush, hunt), Upir, Drowned Upir, Striga (leap), **Ognik** (keeps out of
  reach, leads toward a point, false minimap lights, vanishes when struck), **Vila** (dances
  in her ring, dances intruders to death, mends friends once appeased), **Vodnik** (fast near
  water, Drag Under pulls and stuns), **Rusalka** (Song slows and pulls a step), convoy
  families (flee, never fight, never auto-targeted).
- **Rising water**: one level for the map; the sheet lifts, low ground becomes impassable,
  anyone standing there is pushed to dry ground, buildings under it are wrecked.

## The five missions (blueprint §25–29)
| # | Mission | Map | Beats implemented |
|---|---|---|---|
| 1 | The First Rain | Sacred Valley | Settle, arm, first Zdroy, valley contest, the Leshy (offer or fight), the idol begins to wake. |
| 2 | The Dead Do Not Sleep | Burial Vale | A silent Grod at 42% HP, a hamlet of the dead, first sunset, the Baba arrives at dawn and is unlocked, the long night with Strigi and Upir waves, consecrate the Great Mound by dawn. |
| 3 | The Wandering Storm | Long Valley | A storm walks between four dry springs; Zdroy under it or starve; the rival Binds a spring; the drowned come up; the storm settles on the middle spring; first Dola choice. |
| 4 | The Black Grove | Black Grove | No base, a ritual reserve only; wake three idols; the way back closes and an Ognik leads to a Leshonok ambush; a Vila on the only way in; the Great Leshy at the heart — pay, fight, or be vouched for by both Vilas; second Dola choice. |
| 5 | The Drowned Road | Drowned Road | Three family carts down a river valley; the water rises on its own clock and drowns the low road; a dry camp with an optional temporary Grod; Drowned Upiry out of the flood; a rival family at the Vodnik's ford to save or leave; the last ford against the rising water; the Zmey in the storm. |

Campaign flags recorded for later dialogue: Leshy appeased / slain (M1, M4), Baba joined (M2),
saw Binding / unbound the spring (M3), Leshy pact / Vila friends (M4), rescued the rival family
(M5); the two Dola choices.

---

# 4. What is NOT there yet

- **Playtesting.** Nothing has been in front of a player. Every mission was driven through its
  phases in a browser by script and watched; that proves the scripts run, not that they are fun,
  clear or fair.
- **Balance.** Wave sizes, timers, HP, ritual costs and the reserves handed out in Missions 4
  and 5 are single guesses.
- **Voice and music.** Dialogue is text over a portrait. The soundtrack is still the economy.
- **Hand-keyed animation.** Everything is procedural (sine-based) on the asset's joints; it reads
  at RTS distance and is not meant to survive close-ups. The family cart is a static prop that slides.
- **Blueprint Phase G polish**: cinematic camera moves beyond focus-and-hold, weather-reactive
  music, a mission-select map, an ending card beyond the Zmey dialogue.
- **Deferred creatures**: Mora and Bolotnik are not built; the Zmey exists only as a storm and
  dialogue.
- **Campaign-wide unlocks are minimal**: the Baba is the only unit unlocked by story; Vila
  friendship is a flag, not a trainable unit.
- **Skirmish** is unchanged from the first playable: no rituals there beyond the Leshy offering,
  no day/night or weather.

---

# 5. Known rough edges

Art:
- Faces are painted for RTS distance and look simple in close-up.
- The Streletz's bow sits diagonally across his body in the draw pose.
- The Forest Spirit is dark and reads by its glowing eyes.
- The Ognik and Vila are semi-transparent and can sort oddly against water and each other.
- The family cart is one static prop that slides; its people do not walk.

Engine:
- Painting all textures at load takes several seconds; there is no asset cache.
- Grid pathing: units jostle in doorways and at forest gaps; a unit whose path is blocked
  gives up after ~4 s. Scripted root walls close 13 m squares, which can strand a unit inside.
- When the water rises, units in the flood are teleported to the nearest dry cell rather than
  wading out.
- A hidden tab throttles the frame loop; `?bg=1` keeps the simulation stepping while hidden
  (used for testing).
- The minimap occasionally renders blank in a hidden tab.
- Checkpoint restore rebuilds the world from data; a phase written to assume a fresh world
  may double-spawn if it does not check `ctx.restored` (the five shipped missions do).

Process:
- No automated tests. Each mission was verified by driving `window.__DBG__` from the console.

---

# 6. Questions for the designers

1. **Run the two tests** (design doc §26) on Mission 1 and skirmish first; then a full campaign
   run with the clock on. Record where each player stalls and which objective text they misread.
2. **Difficulty defaults.** Story / Standard / Hard scale waves and Wind. Is Standard the
   right default for the pitch, or should the pitch build force Story?
3. **The Leshy choice (M1 and M4).** Offering costs 75 W / 25 R; fighting costs the forest's
   anger. Is "pay or fight" enough, or does the vouching route (befriend both Vilas) need to be
   signposted earlier in Mission 4?
4. **Mission 4's reserve.** 260 Wind / 180 Rain, no income, three Wake rites free and two Offers
   at 75/25. That leaves exactly one Offer for the Leshy if both Vilas are paid. Intended?
5. **The rival family.** Saving it is optional and only sets a flag. Should it change anything
   playable (a rival unit joins, the rival AI holds fire later), or stay a moral beat?
6. **Rising water** teleports units to dry ground. Should it drown them instead (harsher,
   clearer), or slow them and damage the carts?
7. **Dola effects** are small rule modifiers. Do they read? Should the end card of Mission 5
   show which ones were used?
8. **Which of the §5 rough edges block the pitch video.**

---

# 7. The numbers as built

Units (`game/src/config.js`). Range in metres, cooldown in seconds.

| Unit | Wind | Rain | Supply | Train | HP | Dmg | CD | Range | Speed | Sight | Notes |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| Vietra | 50 | 0 | 1 | 12 s | 60 | 3 | 1.5 | 1.4 | 3.4 | 12 | builder, dances |
| Zherca | 50 | 0 | 1 | 14 s | 70 | 4 | 1.5 | 1.4 | 3.2 | 12 | builder, rite, rituals |
| Streletz | 50 | 0 | 1 | 11 s | 85 | 10 | 1.35 | 13 | 3.6 | 16 | ranged, ×0.35 vs buildings |
| Vitez | 100 | 25 | 2 | 18 s | 280 | 21 | 1.6 | 2.0 | 2.9 | 13 | |
| Jelenik (Deer Rider) | 50 | 50 | 1 | 16 s | 140 | 12 | 1.1 | 2.4 | 7.2 | 24 | ×2.2 vs ritualists |
| Medved (Bear) | 100 | 0 | 2 | 22 s | 440 | 26 | 1.9 | 2.6 | 2.5 | 13 | ×3 vs buildings, Svety Gai |
| Baba | 150 | 125 | 2 | 24 s | 90 | 6 | 1.5 | 1.8 | 3.2 | 16 | Second Sight, Ash Ward, Wake, Offer |
| Leshy | — | — | — | — | 1500 | 48 | 2.4 | 3.6 | 2.2 | 15 | neutral; Great Leshy 2600 HP |
| Leshonok | — | — | — | — | 90 | 9 | 1.0 | 1.6 | 5.4 | 14 | |
| Upir | — | — | — | — | 120 | 12 | 1.4 | 1.6 | 2.8 | 14 | stronger in the dark |
| Drowned Upir | — | — | — | — | 150 | 14 | 1.5 | 1.6 | 2.5 | 14 | |
| Striga | — | — | — | — | 110 | 18 | 1.2 | 1.8 | 5.2 | 20 | leaps |
| Ognik | — | — | — | — | 40 | 0 | — | — | 4.2 | 18 | vanishes when struck |
| Vila | — | — | — | — | 420 | 28 | 2.4 | 4.0 | 4.0 | 16 | area dance, slows |
| Vodnik | — | — | — | — | 520 | 24 | 1.8 | 2.2 | 2.4 (×2.4 near water) | 16 | Drag Under every 3rd hit |
| Rusalka | — | — | — | — | 150 | 10 | 1.4 | 1.8 | 3.0 | 16 | Song: slow r 14, pull r 8 |
| Family | — | — | 0 | — | 160 | 0 | — | — | 2.3 | 10 | takes ×0.4 damage |

Buildings.

| Building | Wind | Rain | Build | HP | Footprint | Trains / does |
|---|---:|---:|---:|---:|---:|---|
| Grod | 300 | 0 | 45 s | 2200 | 11 m | Vietra, Zherca; dance site |
| Khata | 100 | 0 | 20 s | 420 | 5 m | +8 supply |
| Zbroynia | 150 | 0 | 30 s | 750 | 9×7 m | Streletz, Vitez, Jelenik |
| Zdroy | 75 | 0 | 16 s | 380 | 5 m | at a spring; 3 Zherca slots |
| Svety Gai | 150 | 50 | 30 s | 650 | 9 m | Medved, Baba |

Rituals: Wake 8 s free; Consecrate 6 s free; Offer 5 s, 75 W / 25 R; Mend continuous, Wind per
second; Ash Ward and Second Sight (Baba) with cooldowns. Day: 14 s per hour in Mission 2.
Storm: ×2.75 Rain under it. Water: rises ~0.045 m/s to +0.95 m, holds 60–120 s, falls.

---

# 8. Where things live

- `game/index.html`, `game/src/main.js` — boot, title, mission loading, stages, pause, the frame loop.
- `game/src/game.js` — rules: economy, orders, building, combat, fog, sites, rituals, the brains.
- `game/src/mission-runtime.js` — phases, objectives, checkpoints, spawn/order/region helpers.
- `game/src/campaign.js` — progress, difficulty, Dola; `game/src/dialogue.js` — the dialogue box.
- `game/src/systems.js` — hub for `daynight.js`, `weather.js`, `corpses.js`, `water.js`, wards, floods.
- `game/src/rituals.js`, `game/src/construction.js` (Raise), `game/src/ai.js`, `game/src/ui.js`.
- `game/src/terrain.js` — maps as data (`game/maps/*.js`), path grid, water line, fog.
- `game/missions/index.js` + `m01`–`m05` — the campaign.
- `game/assets/*.js` — 30 models; `game/paint.js`, `game/charkit.js`, `game/buildkit.js` — the kits.
- `game/workshop.html` — the model viewer. `STYLE.md` — the look.
- `game-design-doc.md`, `WIND-AND-RAIN-CAMPAIGN-BLUEPRINT.md` — the design; `README.md` — how to play.
