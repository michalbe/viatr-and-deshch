# Wind & Rain — the locked style

> Early-2000s AAA RTS models (Warcraft III, classic WoW): low-poly lofted forms, 8–10 radial, with
> ONE hand-painted diffuse atlas per character carrying all the detail: baked shading, seams, rivets,
> mail rings, cloth folds, fur strokes, a face with eyes and brows. Exaggerated anatomy: shoulders
> twice the hip width, forearms fatter than upper arms, fists and boots the size of the head, a
> hunched barrel chest, a wide bent-knee stance, oversized weapons. Readable in silhouette and in
> colour blocks from a high RTS camera. Buildings and props are painted too: a shared set of
> repeating hand-painted textures (thatch, logs, planks, daub, dry stone, clan cloth, bark,
> needles, leaves, water), UV-scaled to world size.

## Palette (use these exact hex values; name materials after a surfaces recipe where given)

| role | hex | material name | where it belongs |
|---|---|---|---|
| TEAM CLOTH | `0xc0282d` | `fabric` | **the one team colour**: sashes, shield faces, banners, hoods, cloth strips. Use this exact hex for team-coloured parts and for nothing else. The game swaps it per clan. |
| timber light | `0xa27a4f` | `timber` | logs, planks, handles, bows |
| timber dark | `0x5e4029` | `timber` | oversized beams, posts, carved poles, idols |
| thatch | `0x8a6a3a` | `fabric` | roofs (the dominant silhouette of every building) |
| thatch shade | `0x5a4424` | `fabric` | alternate roof courses, ridge bundles, eaves |
| daub | `0xd8cdb0` | `plaster` | wattle-and-daub wall infill |
| stone | `0x8d8a80` | `stone` | foundations, basins, standing stones |
| stone dark | `0x5f5d57` | `stone` | shadowed stones, cairns |
| linen | `0xe6dcc3` | `fabric` | priestess dresses, shirts, ribbons |
| ochre | `0xc98a2b` | `fabric` | embroidery bands, belts, trims |
| skin | `0xd9a07a` | — | faces, hands |
| hair dark | `0x3b2618` | — | hair, beards |
| hair blond | `0xc7a060` | — | long braids (Vietra) |
| iron | `0x6f7479` | `metal` (metalness 0.5) | axe heads, helmets, spear tips, bosses |
| leather | `0x6b4526` | `fabric` | boots, belts, quivers, saddles |
| fur brown | `0x5a3b22` | `fabric` | bear, fur caps, cloaks |
| deer hide | `0x9a6a3e` | `fabric` | deer body |
| antler / bone | `0xe0cfa8` | — | antlers, bones, skulls |
| pine | `0x2f4f2c` | `foliage` | pine needle tiers |
| pine dark | `0x223b22` | `foliage` | lower tiers, shadow side |
| bark | `0x4a3322` | `timber` | trunks |
| moss | `0x6f8f3a` | `foliage` | moss, spirit overgrowth |
| water | `0x4f8fb0` | — (roughness 0.15) | spring pools, basin water |
| spirit glow | `0x9ff0c8` | — emissive same hex, emissiveIntensity 1.5 | Forest Spirit eyes, sacred glow |

Keep each asset to **at most 7 distinct materials** (draw calls are one per material).

## Fixed decisions

- Metres. Base at y = 0, centred on x and z, **front faces +Z**.
- Exaggerated RTS proportions: head about 1/5 of body height, hands and weapons ~1.5× real.
- Heights: Vietra 1.75 m (to top of staff 2.1), Zherca 1.8 m, Streletz 1.8 m, Vitez 2.1 m (bulky,
  1.2 m shoulder width with shield), Deer Rider 3.0 m to rider's head (deer is oversized, 2.2 m at
  withers + antlers), Bear 1.7 m at shoulder, 2.8 m long, Forest Spirit 5 m.
- Buildings (footprint width × depth, height): Grod 11 × 11 m, 9 m; Khata 5 × 5 m, 5 m; War Hall
  9 × 7 m, 7 m; Rain Shrine 5 × 5 m, 4.5 m; Sacred Grove 9 × 9 m, 7 m.
- Pine tree 8 m. Sacred spring 4 m across, 0.6 m. Landmark 8 m.
- Triangle budgets: characters ≤ 1,800, beasts ≤ 2,500, buildings ≤ 6,000, trees ≤ 300,
  rocks ≤ 200.
- **No glyphs or text anywhere.** Carvings are geometry (notches, rings, stacked faces).
- **Characters are painted.** Each character asset imports `../paint.js` (canvas brushes) and
  `../charkit.js` (lofts + UV packing), lays out named regions on one 512² canvas atlas, paints
  each with the brushes (`mail`, `iron`, `leather`, `cloth`, `fur`, `hair`, `wood`, `skin`, `face`,
  `rivet`, `seam`, `band`, `stitches`…) and packs every part's UVs into a region. One
  `MeshStandardMaterial` with that map (roughness 0.9, metalness 0: highlights are PAINTED, not
  lit), so a unit is one draw call. No image files: the atlas is drawn at load time from a seed.
- Team colour on painted characters: paint the region in greys (`GREY` from paint.js) and give the
  part the `kit.team` material (colour `0xc0282d`); the loader multiplies it by the clan colour.
- Lofts: `rings()` sections are authored top → bottom; u wraps once around with the seam at the
  back, v = 1 at the top. The face sits at u = 0.5 of the head region.
- **Buildings and props are painted from `../buildkit.js`.** `createBuildKit(THREE)` gives shared
  materials by name (`thatch`, `thatchDark`, `log`, `planks`, `planksDark`, `beam`, `daub`, `stone`,
  `stoneDark`, `team`, `linen`, `ochre`, `iron`, `bone`, `bark`, `birchBark`, `needles`, `leaves`,
  `moss`, `blades`, `reed`, `water`, `glow`), each one 256² repeating canvas texture, plus
  `box / log / beam / stake / roof / gable / horseHeads / banner / skull` and the character kit's
  lofts. `add(parent, geo, name, { rep })` scales UVs to metres (or explicit repeats). A building is
  one draw call per texture it uses. Team cloth is the `team` material (grey texture × clan colour).
- The old material-name contract (plaster | stone | timber | …) and `surfaces.js` still apply to any
  flat-coloured asset; `applySurfaces` leaves materials that already carry a map alone.
- `game/workshop.html` is the model viewer: every unit, building and prop exactly as the game
  builds them, with clan colour, the painted atlas, poses from `anim.js`, clay and wireframe modes.

## Articulation (anything that animates)

Joints are empty `Object3D`s placed AT the anatomical joint; the geometry is an offset child.
Declare on the root group `g.userData.joints = { ... }` with exactly these names:

- **Humanoid** (Vietra, Zherca, Streletz, Vitez, Forest Spirit, and the deer's rider):
  `hips, spine, head, lShoulder, lElbow, rShoulder, rElbow, lHip, lKnee, rHip, rKnee`.
  Hierarchy: hips → spine → (head, lShoulder → lElbow, rShoulder → rElbow); hips → lHip → lKnee,
  hips → rHip → rKnee. Held items (staff, bow, axe, vessel) are children of the elbow joint of the
  hand holding them. Skirts/cloaks attach to hips or spine.
  Character faces +Z; character's LEFT is +X.
- **Quadruped** (Bear, the Deer): `body, neck, head, flLeg, frLeg, blLeg, brLeg`
  (+ `flKnee, frKnee, blKnee, brKnee` optional). The Deer Rider asset contains both: the deer
  joints as above plus rider joints prefixed `r_` (`r_hips, r_spine, r_head, r_lShoulder,
  r_lElbow, r_rShoulder, r_rElbow`), rider parented to the deer's `body`.
