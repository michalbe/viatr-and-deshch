# Wind & Rain

A 3D real-time strategy game for the browser: a mythological early-medieval Slavic settlement whose
economy runs on ritual. Vietras dance to gather **Wind**, Zhercas perform the rite at Sacred Springs to
gather **Rain**, and both raise a village and a warband to destroy the rival clan's Grod.

Built for the [404 game jam](https://game.404.xyz) with the [404 game recipe](https://github.com/404-Repo/404-game-recipe):
every 3D object in the game is Three.js code (`game/assets/*.js`). The look is early-2000s AAA RTS
(Warcraft III, classic WoW): low-poly models with hand-painted diffuse textures that are drawn onto
canvases at load time by `game/paint.js`, so there are no image files.

Characters go one step further, the way Warcraft III did it: each is **one welded low-poly mesh with
a skeleton and keyframed clips** (idle, fidgets, walk, attack, death, and the dance / rite / build
where they apply), built headlessly in Blender by `tools/wc3/` and shipped as `game/models/*.glb`.
The atlas is still painted in code (`game/skins/*.js`), baked ambient occlusion and the clan-colour
mask ride in the vertex colour, and `three`'s `AnimationMixer` plays the clips. Rebuild with
`/Applications/Blender.app/Contents/MacOS/Blender -b -P tools/wc3/build.py -- vitez vietra`.
A character without a GLB falls back to its code-built, procedurally animated asset.

**Play:** open `game/index.html` from any static host (it needs no build step). The title offers the
five-mission **Campaign** (with checkpoints, difficulties and the Dola choices) and a **Skirmish** on the
Sacred Valley. `?mission=m04` jumps straight to a mission.
**Look at the models:** open `game/workshop.html`: every unit, building and prop as the game builds
them, with clan colour, painted atlas, poses, clay and wireframe modes.

## How to play

| | Laptop | Phone |
|---|---|---|
| select | click, drag a box, double-click for all of a type | tap, double-tap, BOX / ARMY / IDLE buttons |
| command | right-click (or Cmd/Ctrl+click, or two-finger click on a trackpad) ground, enemy, Grod (dance) or shrine (rite) | tap ground or enemy; long-press anything |
| camera | WASD, arrows, screen edges, wheel, minimap | camera stick, one-finger drag, pinch, minimap |
| groups | Ctrl+1..9, then 1..9 | |

Skirmish: gather 100 Wind → raise a Khata → a Zbroynia → train Streletz → raise a Zdroy at a Sacred Spring →
gather Rain → train a Vitez → find the rival settlement → destroy its Grod.

Rituals (select a Zherca or the Baba): **N** Wake an idol, **C** Consecrate a grave or a Bound Zdroy,
**F** Offer to a spirit or a Vila ring, **M** Mend a building, **R** Ash Ward, **T** Second Sight.

## What is in it (design doc: `game-design-doc.md`)

- Six unit types (Vietra, Zherca, Streletz, Vitez, Deer Rider, Bear), five buildings (Grod, Khata, War Hall,
  Rain Shrine, Sacred Grove), supply, production queues, rally points, construction.
- Ritual economy: 1 Wind/s per dancing Vietra, 1 Rain/s per Zherca at a shrine; combat interrupts rituals.
- The economy is the soundtrack: each dancer adds a layer to one synthesised settlement rhythm; Zhercas add
  chant, water and distant thunder. All sound is WebAudio synthesis, no files.
- The Sacred Valley: a river with two fords, a marsh, a forest band with three passages, a Forest Spirit
  guarding the central clearing, a four-faced stone idol, three Sacred Springs, fog of war.
- A rival clan AI that gathers, trains, expands to the exposed spring, defends and raids from minute five.
- Sequential tutorial objectives, victory and defeat.
- The campaign (`WIND-AND-RAIN-CAMPAIGN-BLUEPRINT.md`): The First Rain, The Dead Do Not Sleep, The Wandering
  Storm, The Black Grove, The Drowned Road. Day and night with the unquiet dead, the Baba, wandering storms,
  Binding, no-base exploration with shifting forest paths, the Ognik, Vila rings, the Great Leshy, rising
  water, the Vodnik and Rusalki, a convoy escort, and the Zmey on the horizon. Status: `PROTOTYPE-STATUS.md`.

## Layout

- `game/` — the shipped folder. `assets/` holds the 30 asset modules (+ `.expect.json` sizes);
  `src/` the engine; `maps/` the terrain definitions; `missions/` the campaign scripts; `paint.js` (canvas brushes), `charkit.js` (character lofts + atlas UVs) and
  `buildkit.js` (buildings and props on shared repeating textures) are the modelling kits;
  `assetlib.js`, `surfaces.js`, `rig.js` are copied from the recipe harness. `workshop.html` +
  `src/workshop.js` is the model viewer.
- `STYLE.md` — the style lock every asset agent was handed.
- `game-design-doc.md` — the design.

## Tools

Built with Claude Code (Claude Fable 5.1 and Claude Opus 5.5). No image or sound generators were used:
there are no image or audio files in the game; every texture is painted in code at load time.
