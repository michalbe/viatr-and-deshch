# WIND & RAIN
## Campaign Expansion & Publisher-Pitch Blueprint
### Version 0.3 — 26 September 2026

> **Purpose of this document**
>
> This is the production/design bridge between the existing *Wind & Rain* first playable and a campaign-quality vertical slice that can be shown to publishers and investors.
>
> It is deliberately not a clean-room GDD. It starts from what already exists, identifies what should be retained, renamed, replaced, or added, and then maps those systems into a complete campaign structure.
>
> The full campaign concept below is ten missions. **The recommended pitch build is Missions 1–5**, plus the campaign/progression shell and the systems those missions require. The remaining missions demonstrate where the funded game goes next; they do not all need to be implemented before pitching.

---

# 0. Executive Summary

The existing prototype already proves the base RTS loop:

- Wind economy through dancing Vietras
- Rain economy through Zhercas at springs
- five functional building types
- six functional unit types
- pathfinding, combat, fog of war and minimap
- training queues and rally points
- a rival-clan AI that gathers, expands, defends and raids
- a neutral Forest Spirit
- a complete 10–20 minute match from opening to victory
- WC3-era low-poly painted visual direction
- procedural animation and synthetic audio
- desktop and touch controls

The next version should **not** primarily add more normal RTS content.

It should prove four larger promises:

1. **Rodina has a unique relationship with nature.**  
   Wind and Rain are not merely reskinned minerals and gas. The whole faction asks, offers, sings, dances and performs rites. Even construction should obey this logic.

2. **The supernatural world changes how missions work.**  
   Spirits are not just neutral creeps with different models. Forests, water, weather, death, night and sacred places should create temporary rules for individual missions.

3. **A campaign feels different from a skirmish.**  
   Missions need scripting, changing objectives, dialogue, persistent progression and strong one-sentence premises.

4. **The prototype can scale into a full game without requiring three fully playable races immediately.**  
   The campaign should have one deep playable faction — **Rodina** — plus several mechanically distinct enemy ecosystems. A rival Rodina can provide the faction-perspective mission cheaply because it reuses the player roster.

The central campaign design rule is:

> **Every mission must contain something that has never happened to the player before.**

The central world-design rule is:

> **Rodina does not take from the land. Rodina asks.**

The central construction rule is:

> **The people choose the form. The ritual makes the offering. Nature provides the material and raises the structure.**

---

# 1. Source Baseline

This blueprint is based on:

1. `PROTOTYPE-STATUS.md`, dated 26 September 2026.
2. The supplied RTS campaign reference notes covering *StarCraft II: Wings of Liberty*, *Warcraft III*, *Homeworld*, *Company of Heroes*, *World in Conflict*, *Stronghold*, *Dawn of War*, *Supreme Commander*, *They Are Billions* and *Northgard*.
3. The design discussion that followed the first playable:
   - the faction is called **Rodina**
   - Vietra gathers Wind
   - Zherca gathers Rain
   - generic workers are removed
   - Streletz is the ranged soldier
   - Vitez is the heavy warrior
   - War Hall becomes **Zbroynia**
   - Rain Shrine becomes **Zdroy**
   - Sacred Grove becomes **Svety Gai**
   - Bear should become **Medved**
   - Deer Rider needs a Slavicized game-name; **Jelenik** is the current working proposal, not yet locked
   - dialogue portraits should be close-ups/renders of the actual 3D models, not separate painted portrait art
   - construction should become a ritual/nature process rather than priests manually hammering timber together
4. Slavic mythology and folklore references listed in the Research Notes section at the end.

The existing prototype is the baseline. New design should reuse its systems and assets wherever possible.

---

# 2. Design Status Labels

Throughout this document:

- **LOCKED** — treat as current direction unless playtesting disproves it.
- **CHANGE** — existing prototype behavior should be replaced.
- **NEW** — system/content that does not currently exist.
- **PITCH** — required for the recommended publisher-facing vertical slice.
- **FULL** — intended for the full campaign but can follow funding.
- **LATER** — explicitly not needed for the pitch build.
- **WORKING NAME** — usable internally, but should receive a naming pass before shipping.

Priority:

- **P0** — campaign/pitch blocker
- **P1** — high-value pitch feature
- **P2** — full-game expansion
- **P3** — polish or optional future work

Complexity is only comparative:

- **S** — small relative addition
- **M** — medium system/content task
- **L** — large cross-system task

---

# 3. Core Game Identity

## 3.1 Rodina

**Rodina** is the player's people, settlement and kin-group.

It should feel like a society living **inside** a supernatural natural world, not a civilization exploiting a map.

The faction fantasy is not:

> cut tree → mine stone → erect barracks → manufacture army

It is:

> dance → pray → offer → receive → raise → defend the relationship

This distinction should appear in:

- economy
- construction
- building repair
- animal recruitment
- supernatural interactions
- campaign choices
- environmental storytelling
- sound
- animation
- mission objectives

## 3.2 The World Is Negotiated, Not Owned

The map contains places with their own agency:

- springs
- groves
- burial mounds
- rivers
- forests
- idols
- old roads
- marshes
- hills
- sacred oaks
- ruined settlements

The player may control territory militarily, but the fiction should avoid saying that a sacred place is simply "owned."

Better verbs:

- **appease**
- **consecrate**
- **wake**
- **bind**
- **guard**
- **ask passage**
- **make an offering**
- **raise**
- **keep the rite**

This gives the game its own vocabulary.

## 3.3 Mythic, Not Museum-Historical

The setting is inspired by early medieval Slavic Central/Eastern Europe and later Slavic folklore, but it is not a claim of exact reconstruction.

This is important because the surviving evidence for pre-Christian Slavic religion is sparse, regional, often late, and frequently filtered through Christian writers.

Therefore:

- use historical/folkloric names as inspiration
- do not present a single reconstructed pantheon as settled fact
- allow pan-Slavic combinations when they improve the game
- mark invented spellings or mechanics internally
- prefer **mythic truth and coherent game language** over false claims of academic purity

The visual world can feel culturally specific without pretending every ritual is documented history.

---

# 4. Naming Bible

## 4.1 Naming Rule

Player-facing names should be:

- short
- pronounceable by English-speaking players
- recognizably Slavic in sound
- visually distinct in an RTS command panel
- internally consistent enough to feel like one world
- allowed to use Americanized spelling

We are intentionally not requiring all terms to come from one modern Slavic language.

## 4.2 Locked / Current Vocabulary

| Prototype / Generic Name | Campaign Name | Status | Role |
|---|---|---|---|
| Player faction / clan | **Rodina** | LOCKED | The player's people |
| Town Center | **Grod** | LOCKED | Main settlement |
| House | **Khata** | LOCKED | Supply |
| War Hall | **Zbroynia** | LOCKED | Military production |
| Rain Shrine | **Zdroy** | LOCKED | Rain collection at a spring |
| Sacred Grove | **Svety Gai** | LOCKED direction | Beast/spirit/ritual site |
| Wind Priestess | **Vietra** | LOCKED | Wind collection / raising structures |
| Rain Priest | **Zherca** | LOCKED | Rain collection / sacred structures |
| Archer | **Streletz** | LOCKED | Basic ranged soldier |
| Heavy Warrior | **Vitez** | LOCKED | Heavy melee soldier |
| Bear | **Medved** | CHANGE | Heavy beast |
| Deer Rider | **Jelenik** | WORKING NAME | Fast scout/raider |
| Witch / Seer | **Baba** | LOCKED concept | Support ritualist |
| Forest Spirit | **Leshy** | CHANGE direction | Forest guardian / enemy / negotiable spirit |

### Notes

**Zbroynia** is a gameified spelling inspired by the Polish `zbrojownia` / armory family of words.

**Zdroy** is an Americanized spelling of Polish `zdrój`, a spring/source.

**Svety Gai** is intentionally pan-Slavic/gameified. `gaj/gai` is a Slavic grove word; `svet/svät/svęt` supplies the sacred/holy sound-family.

**Jelenik** is currently a designed game-name built around the widespread Slavic `jelen` deer root. It should receive one more naming review before being treated as final.

## 4.3 Names We Should Avoid as Major Player Terms

Avoid names that:

- are difficult to parse at RTS distance
- require special characters in the primary English UI
- sound like generic English fantasy
- accidentally name a group when the UI is referring to one unit
- create strong expectations from another famous fantasy property

English descriptive subtitles can still be used:

- `MEDVED — Heavy Beast`
- `BABA — Seer`
- `ZDROY — Sacred Spring`
- `SVETY GAI — Sacred Grove`

The player learns the vocabulary through use.

---

# 5. Major Change: Ritual Construction

**Status:** CHANGE / P0 / PITCH

## 5.1 Problem With the Prototype

At present:

- a Vietra or Zherca walks to a building site
- the player has paid Wind/Rain
- the ritualist effectively behaves like a normal RTS builder
- the building grows while she/he "works"

This creates a narrative contradiction.

A priestess who gathers Wind by ritual and a priest who gathers Rain by rite should not suddenly become carpenters because the game needs a worker unit.

It also weakens the central fantasy that Wind and Rain are meaningful spiritual/natural resources.

## 5.2 New Fiction

Rodina structures are physically conventional:

- timber
- thatch
- clay
- stone
- woven fences
- carved posts

The architecture **does not need to become tree-houses or giant roots**.

What changes is the process.

Rodina chooses the site and the pattern. A Vietra or Zherca places a sacred marker and begins a rite. Wind and Rain are offered. The surrounding world provides and assembles the materials.

Nature is not turning into the building.

Nature is **supplying and raising a normal building**.

This preserves the existing art direction.

## 5.3 Player Flow

1. Select Vietra or Zherca.
2. Click **Raise**.
3. Choose structure.
4. Place footprint.
5. Ritualist walks to the site.
6. A **Founding Stake** appears.
7. Resource cost is committed.
8. Ritual animation begins.
9. Wind motes, roots, stones, reeds and timber converge on the site.
10. The structure assembles in visible phases.
11. Final blessing pulse.
12. Building activates.
13. Ritualist returns to previous economic assignment where appropriate.

The UI verb should become:

> **Raise Khata**

not:

> Build Khata

"Build" can remain in tooltips if usability testing requires it, but "Raise" should be the flavorful command.

## 5.4 Visual Stages

### Stage 1 — Mark

A carved stake, small stone ring or bundle of branches appears.

### Stage 2 — Ask

The Vietra dances or the Zherca chants.

Wind/Rain particles visibly move from the ritualist toward the marker.

### Stage 3 — Offer

The ground darkens or becomes patterned with a simple ritual circle.

No gore or sacrifice is required. The "sacrifice" is the accumulated Wind/Rain.

### Stage 4 — Gather

Materials arrive:

- roots push stones upward
- straight logs roll or rise from the forest edge
- branches and thatch are carried by wind
- wet clay crawls upward from earth
- reeds twist into bundles
- ropes appear as vines or braided fibers

### Stage 5 — Raise

Existing building pieces assemble into their final model.

This can reuse the current model geometry if the model is divided into a few construction groups:

- foundation
- posts
- walls
- roof
- props

### Stage 6 — Bless

A final gust / raindrop / leaf pulse.

The ritualist stops.

The structure becomes selectable as complete.

## 5.5 Which Ritualist Raises Which Building

Keep the prototype's existing division because it is readable and already implemented.

### Vietra raises:

- Grod
- Khata
- Zbroynia

Visual emphasis:

- wind
- lifted timber
- swirling thatch
- dust
- moving leaves

### Zherca raises:

- Zdroy
- Svety Gai

Visual emphasis:

- water
- stone
- roots
- mist
- wet earth
- low chanting

## 5.6 Construction Gameplay

Initial implementation should preserve current costs and construction times.

Do **not** rebalance at the same time as changing presentation.

Behavior:

- construction can be interrupted by combat
- if the ritualist dies, the site pauses
- another correct ritualist can resume it
- unfinished structures remain vulnerable
- cancellation before the rite materially begins can refund 100%
- cancellation after visible assembly begins can refund a lower percentage later if balance needs it

Do not add complicated material inventories.

## 5.7 Repair Becomes "Mend"

**CHANGE**

No hammer-repair animation.

A Vietra or Zherca performs **Mend**:

- roots pull cracked posts together
- rope/vines retie beams
- thatch returns in gusts
- mud seals walls
- stones settle back into position

Mechanically this can remain a normal repair channel.

Recommended resource:

- Wind only for mundane structures
- Wind + small Rain cost for sacred structures, if needed later

## 5.8 Destruction

Buildings should still collapse clearly for RTS readability.

After collapse, add a slow supernatural coda:

- roots reclaim some timber
- stones sink slightly
- leaves cover wreckage
- loose thatch blows away

Do not make the destruction so clean that combat loses impact.

---

# 6. Economy: Keep the Simplicity, Deepen the Fiction

**Status:** LOCKED CORE / PITCH

## 6.1 Wind

Vietras dance at the Grod.

Current prototype:

- 1 Wind/second per dancing Vietra
- two dance rings
- movement stops income
- combat interrupts the ritual

Keep this.

Wind represents:

- breath
- motion
- permission
- communal spiritual energy

Mythological inspiration can loosely reference **Stribog**, attested as a wind deity in East Slavic sources, without requiring every player to learn a theology lecture.

## 6.2 Rain

Zhercas perform the Rain Rite at Zdroy.

Current prototype:

- 3 Zherca slots
- 1 Rain/second per active Zherca
- fixed springs create territorial pressure

Keep the basic structure.

Rain represents:

- fertility
- form
- wet earth
- memory
- connection to the hidden world

Mythic motifs can draw from **Mokosh** and rain-making traditions, but the game does not need to declare that "Mokosh is literally the Rain resource."

## 6.3 Economic Philosophy

The player is **not extracting Wind or Rain from finite deposits**.

The player maintains relationships that produce them.

This matters for the campaign because enemies can attack the relationship itself:

- silence a dance
- corrupt a spring
- freeze a Zdroy
- flood a shrine
- frighten away spirits
- bind the weather
- disturb burial ground
- wake an idol

This gives mission designers many ways to alter the economy without introducing new resources.

## 6.4 Rival Mechanic: Binding

**NEW / P1**

The rival Rodina discovers or adopts **Binding**.

Instead of asking a spring, they force it.

A Bound Zdroy:

- generates Rain faster
- darkens the water and surrounding ground
- creates a visible corruption meter
- increases the chance of supernatural incidents
- eventually attracts or creates Nav/Drowned enemies

This should become a central plot mechanism.

The rival clan is not doing this because they are "evil."

They are desperate.

Their homeland is drying.

They choose:

> We cannot wait for nature to answer.

Rodina chooses:

> If nature does not answer, there is a reason.

That conflict is much more interesting than good clan vs. bad clan.

---

# 7. Buildings

The pitch build should still have **only five core Rodina buildings**.

Do not solve campaign depth by creating fifteen production structures.

## 7.1 Grod

**Role**

- main settlement
- trains Vietra
- trains Zherca
- Wind dance site
- defeat condition
- campaign dialogue/council anchor

**Campaign additions**

- named characters can gather here for in-engine dialogue
- some permanent campaign blessings are represented visually by small attachments or idols around the Grod
- Grod can host one campaign-specific ritual socket/altar without becoming a sixth building

## 7.2 Khata

**Role**

- supply
- visually turns an outpost into a home

Campaign importance should increase.

Certain missions may require:

- protect a number of Khatas
- evacuate families from Khatas
- survive night while every destroyed Khata strengthens undead
- keep Khatas inside a protected ritual radius

The Khata is not just "+8 supply."

It is the visible Rodina the player is protecting.

## 7.3 Zbroynia

**Role**

Trains:

- Streletz
- Vitez
- Jelenik

Visual direction:

- heavy beams
- shield racks
- target posts
- weapon bundles
- carved protective symbols

No need for a blacksmith simulation.

The building is where warriors are equipped and ritually prepared.

## 7.4 Zdroy

**Role**

- placed at a spring
- holds up to three Zhercas
- produces Rain

Campaign states:

- normal
- dry
- frozen
- flooded
- poisoned/corrupted
- bound by rival clan
- occupied by Vodnik/Rusalka
- blessed

The **same building** should look different under these states through FX and small prop swaps.

## 7.5 Svety Gai

**Role**

- unlocks / calls Medved
- unlocks Baba
- later allows Vila pact
- holds supernatural/animal upgrades

Unlike the other structures, Svety Gai can be partly open-air.

Recommended look:

- one living sacred tree
- stones
- carved posts
- hanging ribbons
- bones/horns used carefully
- low fence or branch boundary
- offerings
- animal tracks
- fire bowl

It should look like a place the forest tolerates, not a factory that manufactures bears.

### Production verbs

Do not say:

> Train Medved

Prefer:

> **Call Medved**

Do not say:

> Train Vila

Prefer:

> **Invite Vila**

Baba may remain:

> **Invite Baba**

Internally these can use the same production queue.

---

# 8. Rodina Unit Roster

The core philosophy remains:

> **Few units, each with a clear silhouette and job.**

A campaign does not require twenty unit types.

## 8.1 Vietra

**Type:** Ritual/economic  
**Current cost:** 50 Wind  
**Supply:** 1

### Current role

- dances for Wind
- raises Grod, Khata, Zbroynia

### Campaign additions

**Founding Dance**  
Construction animation for mundane buildings.

**Gale Step** — optional later upgrade  
Brief speed boost after leaving a dance circle. Useful when responding to raids.

Do not turn Vietra into a battle mage.

Her vulnerability is strategically important.

## 8.2 Zherca

**Type:** Ritual/economic/support  
**Current cost:** 50 Wind  
**Supply:** 1

### Current role

- Rain Rite at Zdroy
- raises Zdroy and Svety Gai

### Campaign additions

**Consecrate**  
Mission tool used on:

- corpses
- idols
- burial mounds
- corrupted Zdroy
- sacred locations

This is one reusable interaction verb that can drive many campaign objectives.

**Rain Call** — campaign/upgrade ability  
Temporarily strengthens an existing rain zone or awakens a dry Zdroy. It should not simply print infinite Rain.

## 8.3 Streletz

**Type:** Ranged infantry  
**Current cost:** 50 Wind  
**Supply:** 1

Keep the simple job:

- basic ranged DPS
- cheap
- fragile
- poor vs. structures

Campaign upgrade ideas:

**Ash Arrows**  
Extra damage against spirits/undead for one mission or progression choice.

**High Arc**  
Small sight/range bonus from hills.

Do not add complex stance systems.

## 8.4 Vitez

**Type:** Heavy melee  
**Current cost:** 100 Wind + 25 Rain  
**Supply:** 2

Keep:

- high health
- strong frontline
- slower movement

Campaign upgrade ideas:

**Perun's Mark**  
First strike after entering combat has a small thunder impact.

**Oak Shield**  
Reduced ranged damage.

Only one should exist in the pitch build, if any.

## 8.5 Jelenik — WORKING NAME

**Prototype:** Deer Rider  
**Type:** Fast scout / raider  
**Current cost:** 50 Wind + 50 Rain  
**Supply:** 1

Keep current mechanical identity:

- fastest Rodina unit
- best vision
- attacks exposed ritualists
- low durability

Campaign function:

- scout shifting objectives
- reach ritual sites
- intercept Rusalki/Ogniki
- escort messengers
- chase fleeing enemies

Potential ability:

**Forest Run**  
Reduced speed penalty in forest edges / shallow water.

This increases the "deer" fantasy without adding mounted combat complexity.

## 8.6 Medved

**Prototype:** Bear  
**Type:** Heavy beast / siege  
**Current cost:** 100 Wind  
**Supply:** 2

Produced/called through Svety Gai.

Keep:

- very high HP
- slow
- strong melee
- strong vs. buildings

Campaign addition:

**Forest Recovery**  
Regenerates slowly while out of combat near trees.

This makes the beast feel tied to the land.

## 8.7 Baba — NEW / PITCH

**Type:** Seer / ritual support  
**Suggested prototype cost:** 150 Wind + 125 Rain  
**Supply:** 2  
**Source:** Svety Gai

Baba is the first true campaign caster.

The unit should be powerful through information and protection, not fireballs.

### Ability 1 — Second Sight

Reveal an area through fog for a short time.

Uses:

- find hidden burial mounds
- reveal forest paths
- locate the real Ognik among decoys
- see where a storm is moving
- identify a Bound Zdroy

### Ability 2 — Ash Ward

Creates a small ritual area.

Corpses inside it cannot rise as Upir/Striga during the effect.

This directly supports Mission 2.

### Ability 3 — Bad Dola

Optional later ability.

Curse a target unit so its next attack or special ability fails / is weakened.

Do not implement until the first two abilities are proven.

### Visual silhouette

- bent but not necessarily elderly
- large shawl / layered skirt
- bundle of herbs, distaff, staff or sickle
- strong profile visible from RTS camera
- no need for stereotypical pointed witch hat

## 8.8 Vila — NEW / P1 or FULL

**Type:** Allied nature spirit / mobile support  
**Source:** Svety Gai after a campaign pact  
**Cap:** 1–2 per player initially

Mythic inspiration: Slavic vila traditions describe beautiful nature/cloud/water beings, often associated with dancing, healing or danger depending on region.

Game version:

- semi-transparent but strongly silhouetted
- moves above ground visually but uses mostly normal pathing
- ignores some shallow-water / rough-terrain penalties
- low HP
- support rather than DPS

### Ability — Kolo

The Vila dances in a circle.

Nearby Rodina units:

- recover slowly
- gain morale/attack-speed style buff
- or become resistant to spirit fear

Only one effect should be implemented initially.

### Why Vila is useful

It mirrors Vietra conceptually:

- humans dance to ask nature
- nature spirits dance to answer

That is a strong visual motif.

## 8.9 Optional Later Unit: Zubr

**LATER**

A giant aurochs/bison-like charge beast.

Potential role:

- formation breaker
- knockback
- anti-heavy

Do not build for pitch unless combat testing shows a missing role.

---

# 9. Active Ritual System

**NEW / P0-P1 / PITCH**

The campaign needs a reusable interaction framework.

Do not give every unit six spells.

Instead create a small vocabulary of **Ritual Actions** that mission scripts can enable or disable.

## 9.1 Consecrate

User: Zherca

Targets:

- idol
- corpse field
- grave mound
- cursed structure
- spring
- ritual stone

Generic channel:

- unit stands still
- chant/audio
- circular FX
- interrupted by damage

Mission script decides the result.

This is intentionally reusable.

## 9.2 Offer

User: Zherca, Baba, or selected ritual unit

Targets:

- Leshy
- Vila ring
- Vodnik pool
- old idol
- sacred tree

Cost can be:

- Wind
- Rain
- both

This is the non-combat solution to certain supernatural encounters.

## 9.3 Wake

User: Zherca/Baba

Target:

- ancient idol

Result:

- reveal path
- call storm
- grant map vision
- bless units
- open/close crossing
- trigger story event

The existing decorative idol is the first candidate.

## 9.4 Ward

User: Baba

Creates temporary protected area.

Mission variants:

- dead cannot rise
- Rusalki cannot lure
- spirit projectiles weakened
- night terror reduced

Use the same underlying area-effect system.

## 9.5 Binding

Primarily rival-clan mechanic.

User: Rival Zherca

Target:

- Zdroy / idol / weather site

Result:

- higher immediate output
- corruption over time

This is both mechanic and story.

---

# 10. Idols and Sacred Sites

**CHANGE / P0**

The existing glowing idol should stop being decoration.

## 10.1 Idol Framework

An idol is:

- selectable
- neutral by default
- has a state
- can receive Consecrate / Offer / Wake / Bind
- can trigger scripted effects
- can change team or allegiance visually if needed

Possible idol states:

- sleeping
- awake
- blessed
- bound
- corrupted
- broken

## 10.2 Mythic Inspiration

Different idols can draw visual motifs from documented deity traditions without declaring that every idol is a literal avatar.

Examples:

### Perun motif

- axe
- lightning scar
- oak
- elevated hill
- storm interaction

### Veles motif

- roots
- serpent/dragon shapes
- cattle horns
- underworld/burial interaction
- fog

### Svetovit motif

- four faces
- horn
- white horse imagery
- divination / map vision

### Triglav motif

- three heads/faces
- sky / earth / underworld
- three simultaneous ritual sites

### Mokosh motif

- wet earth
- woven/thread patterns
- water
- fertility
- spinning imagery

The campaign can call some objects simply:

> Old Idol

until the story has reason to name them.

Mystery is useful.

---

# 11. Critical Change: Forest Spirit Becomes Leshy Interaction

**CHANGE / P0**

## 11.1 Current Problem

The prototype's Forest Spirit:

- guards the clearing
- has strong combat behavior
- pays +150 Wind +75 Rain when killed

As a prototype reward, this is functional.

As campaign fiction, it teaches the wrong lesson:

> Rodina loves nature, so murder the forest guardian for currency.

That should change.

## 11.2 New Leshy Encounter

The existing model and combat logic can become the first **Leshy**.

The Leshy is territorial, not automatically evil.

If the player enters the protected clearing:

- warning audio
- trees move
- Leshy appears
- it attacks if the player refuses to leave or damages the grove

The player has two resolutions.

### Path A — Offer

A Zherca performs Offer.

Suggested cost:

- 75 Wind
- 25 Rain

Reward possibilities:

- forest becomes passable
- Leshy becomes neutral
- temporary forest vision
- shortcut opens
- Vila becomes available later
- Wind bonus near this forest

### Path B — Fight

The player can still kill it.

Immediate reward can preserve something close to the prototype:

- resource cache
- safe clearing
- shortcut

But there should be a consequence:

- forest spawns hostile Leshonki
- nearby trees darken
- later optional objective is lost
- campaign "Forest Pact" reward is unavailable

The pitch build does not need a huge morality system.

It only needs the player to understand:

> Supernatural beings have relationships, not just health bars.

---

# 12. Enemy Ecosystems

The pitch does **not** need three fully playable races.

That would multiply:

- building art
- AI logic
- balance work
- production UI
- tech trees
- tutorial burden

Instead build one complete playable Rodina and several enemy ecosystems.

Each ecosystem needs:

- a recognizable silhouette language
- one tactical rule
- 3–4 reusable units
- one elite/guardian
- one environmental relationship

---

# 13. Enemy Family A — Rival Rodina

**Status:** EXISTS / EXPAND / PITCH

## 13.1 Purpose

The rival clan provides:

- human conflict
- mirror-match readability
- cheapest production cost
- campaign dialogue
- eventual perspective shift

They reuse Rodina's:

- rigs
- units
- most buildings
- economy
- production logic

Differentiate through:

- clan color
- banners
- paint patterns
- shield motifs
- ritual FX
- Bound structures

## 13.2 Mechanical Identity

Early campaign:

- almost identical to Rodina

Mid-campaign:

- uses Binding
- overclocks Rain
- becomes more aggressive around springs
- treats sacred sites as strategic machines

Late campaign:

- suffers consequences of Binding
- may fight alongside player against supernatural enemies

## 13.3 Narrative Identity

They should not be "evil Slavs."

Their land is failing.

They believe the old reciprocal rituals are too slow.

Their philosophy:

> The ancestors survived because they took what survival required.

Rodina philosophy:

> Survival without balance only postpones death.

Mission 8 lets the player experience the rival argument directly.

---

# 14. Enemy Family B — The Forest / Leshy Host

**Status:** NEW / PITCH

## 14.1 Tactical Rule

**The forest itself is their territory.**

They are stronger when fighting among trees.

They should:

- appear from fog/vegetation
- mislead scouts
- block or open paths
- punish armies that blindly attack through forests

No conventional base required.

Their "production" can be mission-scripted from:

- sacred trees
- hidden groves
- root mounds

## 14.2 Leshonok

**WORKING NAME**

Small forest spirit / child of the Leshy.

Role:

- cheap melee swarm
- fast among trees
- weak in open terrain

Visual:

- child-sized twisted wood/leaf body
- bright eyes
- oversized hands

Mechanic:

**Rootstep**  
Short speed burst when entering tree cover.

## 14.3 Ognik

Will-o'-wisp inspired enemy.

Role:

- scout / trickster
- low direct damage
- creates false signals

Mechanic options:

- produces fake minimap dots
- projects a decoy copy
- lures auto-acquiring units slightly off route

Use only one deception mechanic initially.

Visual:

- floating flame/light
- very low polygon count
- excellent cheap enemy asset

## 14.4 Vila

Can be enemy, neutral or allied depending mission state.

Hostile role:

- ranged spirit support
- Kolo can slow/confuse intruders

If the player makes a forest pact, Vila becomes available to Rodina later.

This makes faction relationships feel fluid.

## 14.5 Leshy

Elite guardian.

The existing Forest Spirit combat kit can be retained:

- high HP
- leash
- idle healing
- ground slam

Add later:

**Mislead**  
briefly hides/minimizes player vision in its forest.

Do not overcomplicate for pitch.

---

# 15. Enemy Family C — Nav / The Unquiet Dead

**Status:** NEW / PITCH

"Nav" is used here as a game label for the unquiet/dead supernatural side. The exact historical terminology is complex; the campaign should treat this as fictionalized world language, not an academic definition.

## 15.1 Tactical Rule

**Death produces more danger.**

This family should turn combat losses into map problems.

That gives the campaign a failure cascade inspired by survival RTS design.

## 15.2 Upir

**Role:** basic revenant

Spawn sources:

- un-consecrated corpses
- burial mounds
- scripted night waves

Characteristics:

- slow
- durable for cost
- simple melee
- strongest at night

Rule:

A human corpse left outside a Ward may become an Upir after night falls.

This makes the aftermath of combat matter.

## 15.3 Striga

Americanized from Strzyga/Striga.

**Role:** fast night predator

Characteristics:

- fast
- low-to-medium HP
- leaps onto backline units
- prioritizes Vietra, Zherca, Baba

Avoid full flying pathfinding initially.

Use a long leap animation instead.

## 15.4 Mora

**Role:** support/nightmare spirit

Mechanic:

- reduces sight
- briefly suppresses attack speed or movement
- strongest near sleeping/darkened settlement areas

Visual:

- thin shadow form
- long hair/cloth
- almost no feet

Could be deferred to full campaign if enemy scope becomes too large.

## 15.5 Burial Mound

Not a standard building.

Mission object:

- periodically raises Upiry
- can be Consecrated by Zherca
- can be Bound by rival clan for dangerous benefits
- visible in daylight
- stronger at night

This gives Mission 2 a clear strategic target.

---

# 16. Enemy Family D — Water / The Drowned

**Status:** NEW / P1-PITCH

These enemies overlap narratively with Nav but have a separate battlefield rule.

## 16.1 Tactical Rule

**Water is their road.**

They should:

- move quickly through rivers/marsh
- appear around Zdroy
- punish armies that treat water as decoration
- change value when water rises/falls

## 16.2 Vodnik

Use the Czech/Slovak-readable **Vodnik** spelling.

**Role:** water tank / controller

Characteristics:

- slow on dry land
- fast in water/marsh
- high HP
- can grab/pull one unit toward water

Prototype ability:

**Drag Under**  
short-range pull + brief stun.

Keep it readable and avoid instant kills.

## 16.3 Rusalka

**Role:** ranged lure / support

Characteristics:

- fragile
- medium range
- stronger near water

Ability:

**Song**  
briefly causes one targeted military unit to walk toward her / lose control.

For pitch, a simple slow + forced step is safer than full mind control.

## 16.4 Bolotnik

**FULL**

Swamp ambusher.

- invisible/hidden while stationary in marsh
- heavy first strike
- poor on dry land

Do not require for Missions 1–5 if scope is tight.

## 16.5 Drowned Upir

Asset-saving variant.

Existing Upir mesh with:

- wet texture
- reeds
- algae
- water FX

Used in flood mission waves.

---

# 17. Boss / Campaign Threat — Zmey

**Status:** FULL / FORESHADOW IN PITCH**

Slavic serpent/dragon traditions give us a useful final threat without making a historically attested deity into a conventional boss monster.

The Zmey should not appear as:

> "Veles, but evil."

Instead:

- ancient serpent below the watershed
- associated with deep earth, storms and the broken boundary
- awakened by repeated Binding of springs/idols
- may visually echo Veles/serpent motifs without being identified as the god

Pitch use:

- distant silhouette
- roar
- shadow across storm clouds
- carved image on idols

Full campaign finale:

- giant environmental boss
- does not need normal RTS unit pathfinding
- attacks zones, destroys paths, changes weather
- defeated/contained through ritual objectives plus army combat

---

# 18. Mythology-to-Mechanics Inspiration Map

This table is **design inspiration**, not a statement that all interpretations are historically certain.

| Mythic figure/motif | Source association | Game inspiration |
|---|---|---|
| **Rod** | kin/family/birth; scholarly status debated | Rodina identity, ancestry, bloodless offerings |
| **Stribog** | wind | Wind economy, moving storms, mobility blessings |
| **Mokosh** | moisture/wetness, mother/spinning associations | Rain, wet earth, healing/mending, threads |
| **Perun** | thunder, lightning, war | storm hazards, Vitez upgrades, lightning rites |
| **Veles** | underworld/dead, wealth/cattle, magic/poetry | Nav, burial spaces, Baba/ritual knowledge, serpent motifs |
| **Morana** | death/winter/vegetation | winter mission, seasonal death, freezing map |
| **Devana** | wildlife/forest/hunting in later West Slavic accounts | Svety Gai, animal pacts, Jelenik/Medved flavor |
| **Svetovit** | four-faced idol, horn, white horse, divination | map vision idol, directional/four-front mission |
| **Triglav** | three heads, sometimes interpreted as three cosmic levels | three simultaneous ritual sites / sky-earth-underworld mission |
| **Dola** | fate/destiny | campaign progression / "read your Dola" choices |
| **Zorya** | dawn | daybreak timers, dawn ending night attacks |
| **Svarog/Svarozhits** | fire/smith associations in some sources | optional weapon blessing / sacred fire, not required for pitch |
| **Simargl** | uncertain; plant-guardian interpretation | possible Grove guardian visual, optional |
| **Leshy** | forest spirit/guardian, trickster | forest ecosystem and negotiation |
| **Vila** | nature/cloud/water nymph traditions; dance/healing/danger | allied/hostile spirit support, Kolo |
| **Vodnik/Vodyanoy** | water spirit | river/swamp controller |
| **Rusalka** | varied water/forest female spirit traditions | lure mechanic, water enemy |
| **Upir** | revenant/vampiric folklore | corpse-to-enemy system |
| **Strzyga/Striga** | Polish/Silesian revenant/demon traditions | fast night predator |
| **Kikimora** | household/swamp spirit in later folklore | optional haunted-house mission/event |
| **Ognik / wandering light** | will-o'-wisp style folklore | decoy/scout enemy |
| **Zmey** | serpent/dragon motif | late-campaign environmental boss |

---

# 19. Campaign Framework — Technical Requirement

**NEW / P0 / PITCH**

The existing objective sequence is hard-coded enough for one map.

A campaign needs a reusable mission scripting layer.

This is probably the single most important engineering addition.

## 19.1 Trigger Types

Mission scripts should be able to listen for:

- time elapsed
- objective completed
- objective failed
- unit enters region
- unit leaves region
- unit/building created
- unit/building destroyed
- specific unit health threshold
- player resource threshold
- building count
- enemy count
- day/night transition
- weather enters region
- idol state change
- Zdroy state change
- corpse count
- dialogue completed
- player chooses an option

## 19.2 Actions

Mission scripts should be able to:

- add/complete/fail objective
- show dialogue
- pan/focus camera
- reveal map region
- spawn units
- issue AI order
- change AI behavior
- grant/remove resources
- unlock/lock unit
- unlock/lock building
- change weather
- start/stop day-night clock
- flood/unflood path cells
- freeze/thaw water
- change idol state
- change Zdroy state
- open/close forest route
- play audio cue
- start timer
- mark minimap
- change allegiance
- trigger victory/defeat
- save checkpoint

## 19.3 Data-Driven Mission Definition

The current codebase has:

- `game/src/game.js`
- `game/src/ai.js`
- `game/src/ui.js`
- `game/src/config.js`
- `game/src/terrain.js`
- `game/src/path.js`
- `game/src/anim.js`
- `game/src/fx.js`
- `game/src/audio.js`

Recommended architecture additions:

```text
game/src/campaign.js
game/src/mission-runtime.js
game/src/dialogue.js
game/src/rituals.js
game/src/construction.js
game/src/weather.js
game/src/daynight.js
game/src/corpse.js
game/src/save.js

game/missions/
  m01-first-rain.js
  m02-night-dead.js
  m03-wandering-storm.js
  m04-black-grove.js
  m05-drowned-road.js
  ...
```

This is an architectural proposal, not a requirement to rewrite working systems.

The goal is to stop mission logic from becoming a pile of mission-specific `if` statements inside `game.js`.

---

# 20. Dialogue and Campaign Presentation

**CHANGE / P0 / PITCH**

## 20.1 No Separate Painted Portrait Pipeline

Do **not** create painted 2D character portraits.

Use the models already in the game.

Possible implementation:

### Option A — Render-to-texture portrait

- same model
- controlled bust camera
- controlled light
- simple idle animation
- appears next to subtitle box

### Option B — World camera close-up

- camera briefly frames the speaking unit
- subtitles appear
- player control pauses or slows
- return to gameplay camera

### Option C — Between-mission workshop stage

Reuse the existing model-workshop idea:

- dark/simple backdrop
- model close-up
- standardized light
- speaker name + dialogue
- no bespoke cinematic set

A mix of A and C is probably strongest.

## 20.2 Current Art Constraint

The prototype status notes that faces are designed for RTS distance.

Therefore:

- frame portrait shots from chest/waist up, not extreme facial close-up
- rely on headgear, hair, staff, clothing and silhouette
- improve key story-character face textures modestly
- do not build facial mocap/lip-sync
- use subtle head/hand idle motions
- subtitles carry performance

This keeps the early-2000s game aesthetic.

## 20.3 Dialogue Rules

Keep lines short.

Gameplay dialogue should answer one of four questions:

- What changed?
- Why should I care?
- Where should I look?
- What does this reveal about the speaker?

Avoid lore dumps during combat.

---

# 21. Campaign Progression — Dola

**NEW / P1 / PITCH**

The campaign needs continuity between missions.

Do not copy a giant shop/tech tree.

Use a small, thematic progression system.

Working name:

# **Dola**

Mythological inspiration: Dola as fate/destiny.

Game interpretation:

After major missions, a Baba or ritual scene "reads the Rodina's Dola."

The player chooses one of two or three permanent campaign blessings.

No grind currency required.

## 21.1 Example Blessing Families

### Breath of Stribog

Economy/mobility.

Examples:

- Vietra Wind rate +10%
- Jelenik sight +15%
- units exiting a Grod radius gain brief movement speed

### Thread of Mokosh

Settlement/endurance.

Examples:

- Mend costs less
- Zdroy holds +1 Zherca
- Khata gains extra HP
- Rain Rite recovers faster after interruption

### Mark of Perun

Combat.

Examples:

- Vitez first strike gains bonus damage
- Streletz arrows have small anti-spirit bonus
- one lightning ritual per mission

### Path of Veles

Supernatural/knowledge.

Examples:

- Baba sight range
- Ash Ward duration
- Leshy offerings cheaper
- burial mounds visible through fog at shorter distance

## 21.2 Rules

- choices are permanent within campaign save
- no choice should invalidate mission design
- bonuses should be noticeable but not enormous
- pitch build can contain only 4–6 total choices
- full campaign can expand to ~12

## 21.3 Why This Is Better Than Unit Carryover for Pitch

Persistent armies are emotionally strong but complicate balance.

For the pitch build:

- persist named story characters
- persist Dola choices
- do **not** persist every normal soldier between maps

Full campaign may later add a small "survivor retinue" system if desired.

---

# 22. Campaign Story Premise

## 22.1 The Old Agreement

Rodina believes settlement is possible because of an old reciprocity between:

- people
- ancestors
- land
- water
- forest
- sky
- the dead

Wind and Rain are the visible parts of that relationship.

When Rodina raises a building, the settlement is not conquering land.

It is asking the land to hold the family.

## 22.2 The Crisis

Rain begins to fail in neighboring valleys.

A rival Rodina discovers a rite that can **Bind** a Zdroy.

Binding works.

It produces more Rain.

At first, the rival clan seems simply stronger and greedier.

Then the costs appear:

- springs darken
- dead do not stay buried
- forest spirits abandon old boundaries
- floods come without rain
- winter arrives at the wrong time
- ancient idols begin to wake

The player gradually learns that Binding does not create Rain.

It pulls against the relationship between worlds.

## 22.3 The Antagonist

Do not reveal an evil god in Mission 1.

The initial antagonist is human desperation.

A rival leader / rival Zherca believes the world has abandoned people and must be forced to answer.

Their argument should remain understandable.

Later, the player discovers that repeated Binding is waking something beneath the watershed: a **Zmey** or serpent-like ancient power.

Whether the Zmey caused the first drought or merely exploited it can remain ambiguous.

## 22.4 The Gods

Keep major deities mostly **off-screen**.

They appear through:

- names
- rites
- weather
- symbols
- idols
- blessings
- stories told by characters

Do not turn Perun into a quest-giver standing beside the Grod.

Mystery makes the world larger.

---

# 23. Campaign Characters

Names can be chosen later. Roles should be established first.

## 23.1 The Campaign Zherca

Persistent story character.

Role:

- spiritual authority
- understands Rain rites
- initially trusts tradition
- gradually learns that some traditions are incomplete

Gameplay:

- special version of normal Zherca
- cannot permanently die; mission failure or wounded state if lost
- gains access to Consecrate/Offer/Wake as campaign teaches them

No inventory required.

## 23.2 The Baba

Introduced Mission 2.

Role:

- knows older, less comfortable traditions
- understands Nav, Dola and burial rites
- challenges the Zherca
- sometimes treats spirits as neighbors rather than gods

Gameplay:

- teaches Ash Ward and Second Sight
- serves as progression-screen speaker

## 23.3 Rival Leader

Human antagonist/foil.

Not insane.

Not secretly a demon from the opening scene.

Motivation:

- protect their own Rodina
- their springs failed first
- Binding saved hundreds of people
- they refuse to abandon it because "balance" sounds like a luxury to starving families

Mission 8 lets the player control this side.

## 23.4 The Vitez Companion

Optional named military character.

Use existing Vitez model with small visual differences.

Purpose:

- gives warfare a human voice
- can appear in no-base missions
- allows dialogue without making Zherca talk about every military problem

Do not build a full hero RPG system.

---

# 24. Full Campaign Structure

Target full campaign:

**10 missions**

Recommended pitch implementation:

**Missions 1–5**

Campaign rhythm:

> learning → first disruption → supernatural escalation → perspective change → environmental escalation → loss → revelation → synthesis → payoff

---

# 25. Mission 1 — THE FIRST RAIN

**PITCH — based on existing Sacred Valley**

### One-sentence premise

> Establish your Rodina, contest the valley's springs, and discover that the old idol is beginning to wake.

### What this mission teaches

- Vietra → Wind
- Zherca → Rain
- Raise construction
- Khata
- Zbroynia
- Zdroy
- Streletz
- Vitez
- Jelenik
- basic rival Rodina
- fog of war
- first sacred site

### Map

Reuse and polish the existing Sacred Valley:

- player SW
- rival NE
- river with two fords
- forest band
- three springs
- Leshy clearing
- idol hill

### Changes from prototype

1. Rename buildings/units.
2. Replace manual construction with Raise.
3. Forest Spirit becomes Leshy.
4. Idol becomes selectable.
5. Leshy has Offer or Fight resolution.
6. Add campaign dialogue.
7. Add checkpoint.
8. Add difficulty selection.
9. Victory is not just "enemy Grod destroyed."

### Objective flow

1. Gather 100 Wind.
2. Raise a Khata.
3. Raise Zbroynia.
4. Recruit 3 Streletz.
5. Raise Zdroy.
6. Gather 50 Rain.
7. Recruit a Vitez.
8. Enemy raid.
9. Discover central valley.
10. Either appease or defeat Leshy.
11. Destroy / force surrender of rival Grod.
12. After victory, the hill idol wakes.

### Final beat

Combat music fades.

The player expects victory.

Thunder occurs despite clear sky.

The old idol turns or glows.

The Zherca says something equivalent to:

> "That was not our rite."

Mission ends.

### New systems required

- Raise construction
- Leshy interaction
- idol state
- dialogue/model close-up
- campaign objective runtime
- checkpoint/restart

### Target feeling

The player begins with familiar RTS grammar and ends realizing the game is about something stranger.

---

# 26. Mission 2 — THE DEAD DO NOT SLEEP

### One-sentence premise

> Every body left unburied during the day can become an enemy after sunset.

### Core new mechanic

**Day / Night + corpse state**

### Map

A larger settled valley with:

- abandoned hamlet
- several burial mounds
- one defensible Grod
- forest cemetery
- two Zdroy
- old battlefield full of corpses

### Opening

Rodina arrives at a settlement that stopped answering smoke signals.

The Grod is intact.

No people.

The first objective is investigation, not base building.

### Phase 1 — Day

Small force:

- Zherca
- Vitez
- Streletz

Find:

- bodies
- scratched doors
- burial mounds
- first Upir

Then establish/restore Grod.

### Phase 2 — First Sunset

All remaining corpse markers begin to stir.

Upiry rise.

The player learns:

- killing enemies creates future risk
- burial/Consecrate matters
- night changes sight and pressure

### Baba Introduction

A Baba arrives or is found in the abandoned settlement.

She teaches:

**Ash Ward**

### Phase 3 — Preparation

Day returns.

Objectives:

- Consecrate 3 mounds
- secure second Zdroy
- prepare defenses
- choose where to fight so corpses are manageable

### Phase 4 — Long Night

Large night assault:

- Upir
- first Striga
- perhaps one Mora on higher difficulty

### Victory

Survive until dawn and Consecrate the main mound.

### Failure Cascade

If Upiry kill a human unit:

- that corpse can also rise later

Do not let this grow exponentially without cap.

It should feel dangerous, not computationally absurd.

### Unlock

**Baba**

### New systems required

- day/night lighting
- corpse objects
- corpse → Upir conversion
- Ash Ward
- burial-mound mission object
- night AI wave logic

### Mythic inspiration

- Upir/strzyga revenant traditions
- Zorya/dawn imagery
- Baba as seer/ritual expert

---

# 27. Mission 3 — THE WANDERING STORM

### One-sentence premise

> The valley's Rain follows a moving storm, forcing both clans to move their economies under it.

### Core new mechanic

**Weather is moving strategic territory.**

### Map

Long east-west valley.

Features:

- 4 springs
- 3 river crossings
- high hills
- open fields
- two rival settlements
- storm enters from west and moves irregularly east

### Rain Rule

Normal Zdroy:

- 25% normal Rain rate

Zdroy under storm:

- 250–300% Rain rate

Numbers are prototype values.

The point is:

> the valuable economic zone moves.

### Player Decisions

- follow storm aggressively
- fortify one spring and accept low output
- raid rival Zhercas when storm reaches them
- use Jelenik to scout storm path

### Weather Events

Storm can:

- increase Wind particles
- reduce sight
- strike exposed hilltops
- flood one ford temporarily

Do not make lightning random enough to feel unfair.

Telegraph strikes.

### Mid-mission escalation

The rival clan performs its first visible **Binding**.

A Zdroy stays productive after the storm leaves.

Player sees:

- blackened water
- roots tightening around shrine
- unnatural Rain output

Then a drowned creature appears nearby.

### Finale

Both factions converge on last spring beneath storm.

After battle, the Bound Zdroy cracks open / dark water floods.

### Unlock

First **Dola** progression choice.

Suggested choice:

- Breath of Stribog
- Thread of Mokosh

### New systems required

- weather volume / moving storm
- variable Zdroy production multiplier
- telegraphed lightning
- temporary ford path-state
- Binding state
- Dola campaign choice

### Mythic inspiration

- Stribog / wind
- Perun / lightning
- rain-making traditions
- Mokosh / moisture

---

# 28. Mission 4 — THE BLACK GROVE

### One-sentence premise

> Enter a forest with no base, where paths change and the guardian can be fought, deceived, or appeased.

### Core new mechanic

**Adventure-style RTS + supernatural negotiation**

### No conventional base

Starting force:

- Campaign Zherca
- Baba
- Vitez companion
- 4 Streletz
- 2 Jelenik

No Wind/Rain income at first.

Player carries a limited ritual reserve.

### Forest Behavior

The forest contains:

- hidden paths
- false paths
- Ogniki
- Vila circles
- Leshonki
- one great Leshy

When the player triggers certain areas:

- path blockers move
- fog thickens
- a route closes while another opens

This can be scripted rather than procedurally generated.

### Objective

Reach three old idols and Wake them.

Each idol reveals one piece of the history of Binding.

### Encounters

**Ognik clearing**  
Decoy mechanic tutorial.

**Vila ring**  
Do not interrupt the dance. Offer Rain or walk around.

**Leshonok ambush**  
Basic forest combat.

**Great Leshy**  
Final choice:

- fight
- offer
- complete a side objective to earn passage

### Reward

If the player resolves the Leshy peacefully:

- Vila becomes available from Svety Gai in later missions
- or receives Forest Pact Dola option

If killed:

- immediate resource/army reward
- no Vila unlock until later

For pitch, permanent branching can be simplified to one stored campaign flag.

### Story Reveal

The idols show that:

- springs and burial places are connected
- Binding does not "create" Rain
- something beneath the valley is being pulled upward

### New systems required

- no-base mission start
- scripted path blockers
- Ognik decoy
- Vila NPC
- Offer interactions
- campaign flag
- improved Leshy

### Why this mission matters for pitch

This is the mission that proves *Wind & Rain* is not merely a conventional base-building RTS.

---

# 29. Mission 5 — THE DROWNED ROAD

### One-sentence premise

> Escort your Rodina down a river valley while rising water repeatedly changes which road is safe.

### Core new mechanic

**Moving convoy + flood-state map**

### Story

The Black Grove warns that the lower valley will flood.

Rodina must relocate families before the Bound waters arrive.

### Player Force

Starts with:

- military group
- Zherca
- Baba if unlocked
- civilian Khata carts / family groups represented simply

This does not need a full civilian simulation.

Use 3–5 convoy objects.

### Objective Rhythm

1. Escort convoy to first dry camp.
2. Raise temporary Zdroy/Grod outpost.
3. Flood blocks lower road.
4. Find hill route.
5. Vodnik attacks crossing.
6. Rescue separated convoy.
7. Rusalka song pulls units toward water.
8. River falls briefly — shortcut opens.
9. Rival clan appears and also attempts escape.
10. Final joint or contested crossing.

### Water Enemies

Introduce:

- Vodnik
- Rusalka
- drowned Upir

### Flood System

Map has explicit water states:

- LOW
- RISING
- HIGH
- FALLING

Each state updates:

- visible water plane
- selected path-grid cells
- some props
- enemy spawn routes

Do not simulate fluid dynamics.

### Possible Story Choice

A rival civilian group is trapped.

Optional:

- save them
- ignore them

Saving them changes Mission 8 dialogue.

No huge morality UI required.

### Pitch Ending

At the end, distant storm clouds form a serpent-like silhouette.

First strong Zmey foreshadowing.

### New systems required

- convoy/escort
- water-state pathing
- Vodnik
- Rusalka
- temporary outpost state
- campaign optional-objective flag

### Pitch milestone

**Missions 1–5 together are the recommended publisher vertical slice.**

They demonstrate:

- classic RTS
- night survival
- moving economy/weather
- no-base supernatural expedition
- escort/flood mission

That is exactly the variety the campaign needs to promise.

---

# 30. Mission 6 — MORANA'S BREATH

**FULL**

### One-sentence premise

> Winter advances across the map, freezing your Rain economy but opening new roads across rivers.

### Core new mechanic

**Winter is both danger and opportunity.**

### Systems

- snow/frost visual state
- frozen water pathing
- Zdroy slowdown/freeze
- stronger Wind
- reduced sight during blizzard
- sacred fire safe zones

### Objectives

- hold three warm groves
- move between them as winter advances
- perform a spring rite before final freeze

### Enemy Mix

- Upir
- Striga
- winter variants
- rival survivors

### Mythic inspiration

Morana / death / winter / return of spring.

Do not make Morana a boss character.

---

# 31. Mission 7 — THE GROD MUST FALL

**FULL**

### One-sentence premise

> Defend the ancestral Grod long enough to evacuate the Rodina, then abandon the base you spent the mission building.

### Core new mechanic

**The correct strategy is eventually retreat.**

### Phase 1

Classic defense.

Player believes objective is:

> Hold the Grod.

### Phase 2

Attacks escalate.

Repairs become expensive.

Bound water cracks through outer area.

### Phase 3 — Revelation

New objective:

> The Grod cannot be saved.

Player must evacuate:

- Baba
- Campaign Zherca
- a number of family groups
- optional military units

### Emotional Point

The Stronghold lesson:

The player loses **their own settlement**, not an abstract command center.

### Carryover

A small number of surviving military units may begin Mission 9 as veteran companions if persistence is implemented.

If not, record only an "evacuation success" score/flag.

---

# 32. Mission 8 — THE OTHER RAIN

**FULL — faction perspective mission**

### One-sentence premise

> Play the rival Rodina and discover why they began Binding the springs.

### Purpose

This is the Warcraft III perspective-change lesson without requiring a new production race.

Player uses:

- same base faction
- different clan colors
- Binding mechanic
- slightly different Dola/upgrade set

### Opening

Their home valley.

Dry grass.

Dead spring.

Empty Khatas.

No supernatural monsters at first.

### Binding Tutorial

Player must Bind a Zdroy to survive.

It works.

Rain production surges.

People celebrate.

### Consequence

Corruption meter rises.

Later:

- Rusalka
- Upir
- distorted weather

### Story Reveal

The rival leader did not invent the rite alone.

An old idol taught / revealed / suggested it.

Ambiguity remains:

- ancestor?
- spirit?
- Zmey influence?

### Ending

The player realizes the "enemy" has been fighting the same disaster from the other side.

---

# 33. Mission 9 — THREE FACES

**FULL**

### One-sentence premise

> Hold three sacred sites representing sky, earth and the below while each changes the rules of its battlefield.

### Inspiration

Triglav / three-world motif.

### Map

Three connected regions:

**Sky Hill**

- storms
- Perun/Stribog mechanics

**Wet Earth**

- forest
- Mokosh/Devana mechanics

**Below / Burial Vale**

- Nav
- Veles motifs

### Goal

Perform three simultaneous rites.

This requires splitting the army.

The player can no longer solve every problem with one blob.

### Tactical Rhythm

- capture
- defend
- switch front
- crisis
- reinforce
- synchronized ritual

### Story

Rodina and rival clan can cooperate uneasily.

The final rite reveals the Zmey's location beneath the watershed.

---

# 34. Mission 10 — THE LAST RAIN

**FULL FINALE**

### One-sentence premise

> Keep three great rites alive while storm, flood, forest and the dead attack the same battlefield.

### Goal

Restore the relationship between the watershed's sacred places before Zmey fully emerges.

### Systems Combined

- day/night
- storm
- flood states
- corpse rising
- Leshy/forest routes
- idol states
- Binding
- Dola bonuses
- mixed human/supernatural enemies

### Phases

1. Establish three ritual sites.
2. Rival clan attacks one site.
3. Zmey destroys a crossing.
4. Night falls; dead rise.
5. Forest route opens if Leshy was appeased.
6. Flood cuts off second site.
7. Player must decide whether to use Binding temporarily.
8. Final synchronized ritual.
9. Zmey becomes vulnerable / contained.
10. Army and ritualists complete the confrontation together.

### Ending Principle

The final victory should not be:

> hero hits dragon until HP = 0

It should be:

> the army creates the space for the ritual, and the ritual makes victory possible.

That keeps the game about Rodina's relationship with the world.

---

# 35. Mission Design Checklist

Every campaign mission must answer all of these.

## 35.1 One-Sentence Hook

Can the mission be described without mentioning its generic objective?

Bad:

> Destroy the enemy base.

Good:

> Destroy the enemy base while every corpse rises again after sunset.

## 35.2 New Rule

What has never happened before?

## 35.3 Tactical States

At least 3 phases.

Example:

> explore → establish → night attack → cleanse → final survival

## 35.4 Economic Twist

Does Wind/Rain behave normally?

If yes, is that intentional?

Campaign missions should regularly manipulate:

- access
- rate
- location
- safety
- weather
- ritual availability

## 35.5 Map Identity

What is this map about?

Not:

> forest map

But:

> forest where roads change when the Leshy notices you

## 35.6 Story Reveal

What does the player learn here that changes their understanding?

## 35.7 Unlock / Payoff

What new toy, ritual, enemy understanding or campaign choice does the mission leave behind?

---

# 36. Weather System

**NEW / P0-P1**

Build weather as reusable state, not bespoke Mission 3 code.

Minimum weather types:

- clear
- rain
- storm
- fog
- snow/blizzard

Properties can include:

- light intensity
- sky color
- fog distance
- particle emission
- Wind multiplier
- Rain multiplier
- sight multiplier
- path-state hooks
- lightning enabled

Weather volumes should be able to move across map.

No global realistic climate simulation.

---

# 37. Day / Night System

**NEW / P0**

Minimum:

- time-of-day scalar
- sun angle / brightness
- ambient color
- fog/sight multiplier
- enemy modifiers
- trigger events at sunset/dawn

Night needs to change gameplay, not merely tint the screen blue.

Mission 2:

- reduced sight
- corpse rising
- enemy aggression

Later:

- Rusalka visibility
- Striga strength
- certain idols only usable at dawn/night

---

# 38. Corpse System

**NEW / P0**

Current deaths can disappear visually as they do now, but campaign needs a lightweight corpse marker.

Implementation:

- on eligible unit death, spawn low-cost corpse/death marker
- corpse has team/type/time metadata
- marker can be:
  - ignored
  - Consecrated
  - consumed by script
  - raised as Upir
- cap corpse count
- distant/old corpses can merge into battlefield-pile markers

Do not keep full animated dead rigs indefinitely.

---

# 39. Terrain State System

**NEW / P1**

Campaign requires selected terrain cells to change path state.

Use explicit scripted regions, not deformable terrain.

States:

- dry
- flooded
- frozen
- blocked by roots
- open forest path

Visual and pathing state must update together.

This supports:

- Mission 3 ford flood
- Mission 4 shifting forest
- Mission 5 flood roads
- Mission 6 frozen rivers
- Mission 10 finale

One system pays for many missions.

---

# 40. AI Expansion

**CHANGE / P0-P1**

Current rival AI is sufficient for skirmish-like Mission 1.

Campaign AI needs modes.

## Modes

- economy
- defend point
- raid
- escort
- hunt ritualist
- retreat
- hold until timer
- migrate
- attack objective
- ignore player and pursue sacred site

Mission script should switch AI modes.

## Supernatural AI

Enemy families can use simpler behavior:

**Leshonok**
- ambush nearest target
- retreat/leash into forest

**Ognik**
- avoid combat
- create decoy/lure

**Upir**
- direct swarm

**Striga**
- target backline ritualists

**Vodnik**
- hold water/chokepoint
- pull target

**Rusalka**
- stay near water
- lure exposed unit

The supernatural enemies do not need full base-building intelligence.

---

# 41. Difficulty

**NEW / P0**

Pitch build needs:

- Story
- Standard
- Hard

Difficulty should modify:

- enemy wave size
- AI army cap
- reaction/raid interval
- special-enemy counts
- perhaps resource starting buffer

Do not make Hard simply double enemy HP.

Story mode should preserve mission mechanics but provide:

- more starting resources
- slower pressure
- fewer simultaneous crises

---

# 42. Save, Checkpoint, Pause, Restart

**NEW / P0**

Current reload-to-retry behavior is not campaign-ready.

Required:

- pause
- restart mission
- restart checkpoint
- campaign save
- auto-save at mission start
- auto-save after major phase changes
- difficulty stored per campaign or mission

Full manual mid-mission save can be postponed if checkpoint system is reliable.

For pitch sessions, checkpointing matters more than sophisticated save slots.

---

# 43. End-of-Mission Screen

**NEW / P1**

Keep concise.

Show:

- mission completed
- time
- units lost
- units saved
- optional objective
- supernatural choice if relevant
- next Dola choice/unlock

Do not build a giant score system.

Example:

```text
THE BLACK GROVE — COMPLETE

Leshy: APPEASED
Vila Ring: UNDISTURBED
Rodina Lost: 7
Time: 24:31

The forest remembers.
```

---

# 44. Close-Up Model Presentation Requirements

Because model close-ups replace painted portraits:

## Key story models need:

- stronger face texture than generic troops
- one neutral idle
- one speaking/gesturing idle
- one reaction pose
- clean silhouette at portrait framing
- consistent portrait lighting

This is still dramatically cheaper than:

- 2D portrait commission pipeline
- cinematics
- lip sync
- facial rigs

Reuse the current model/workshop infrastructure wherever possible.

---

# 45. Visual Expansion List

## 45.1 Existing Assets to Rename/Recontextualize

- Bear → Medved
- Deer Rider → Jelenik working name
- Forest Spirit → Leshy
- War Hall → Zbroynia
- Rain Shrine → Zdroy
- Sacred Grove → Svety Gai

## 45.2 New Rodina Character Assets

PITCH:

- Baba

P1/FULL:

- Vila

Optional later:

- Zubr

## 45.3 New Enemy Character Assets

Recommended pitch set:

- Leshonok
- Ognik
- Upir
- Striga
- Vodnik
- Rusalka

Reuse/modify:

- existing Forest Spirit → Leshy
- existing human roster → rival Rodina

Full:

- Mora
- Bolotnik
- Zmey environmental boss

## 45.4 New Props

PITCH:

- founding stake
- burial mound
- corpse marker
- 2–3 idol variants
- sacred oak
- flood debris
- grave markers
- old ritual stones
- Vila ring markers
- dark/Bound Zdroy variant props

FULL:

- frozen props
- sacred fires
- ruined Grod set
- Zmey carvings
- evacuation carts

---

# 46. Audio Expansion

The prototype's economy-as-soundtrack is a major identity strength.

Extend it.

## Construction

Each Raise stage adds sound:

- stake hit
- low chant
- wind
- roots/stone
- timber lock
- final breath/chime

## Night

Remove some daytime layers.

Introduce:

- distant dogs/wolves
- low wind
- grave soil
- Baba ward hum

## Forest

Leshy should mimic:

- wood creak
- bird call
- distant human-like call

Do not make it constant horror ambience.

## Water

Vodnik/Rusalka:

- reversed splash textures
- reed rustle
- distant singing
- pot/bell-like water tones

## Campaign Dialogue

Voice acting is optional for pitch.

If no final VO:

- subtitles
- character vocalizations / short barks
- strong sound cue for speaker

Do not use synthetic full speech as a dependency.

---

# 47. UI Changes

## 47.1 Terminology

Replace:

- Build → Raise
- War Hall → Zbroynia
- Rain Shrine → Zdroy
- Sacred Grove → Svety Gai
- Bear → Medved
- Forest Spirit → Leshy

## 47.2 Ritual Context

Selected ritual units should clearly show:

**Vietra**
- Dance
- Raise
- Mend

**Zherca**
- Rain Rite
- Raise
- Consecrate
- Offer / Wake when valid target selected

**Baba**
- Second Sight
- Ash Ward

Do not display buttons that are irrelevant to the current mission if avoidable.

## 47.3 Sacred Object UI

Idols/Zdroy/Leshy can show small state words:

- SLEEPING
- AWAKE
- BOUND
- CORRUPTED
- APPEASED

Keep text minimal.

---

# 48. Technical Rough Edges From Prototype — Fix Priority

The prototype status already identifies several engine issues.

## P0 before publisher play sessions

### Pathing in doorways / blocked paths

Current units may jostle and abandon orders after a stuck timeout.

Campaign escort and defense missions will amplify this.

Improve:

- local separation
- attack-slot spacing around buildings
- retry logic before dropping order

### Melee clustering around buildings

Create building attack slots / perimeter targets.

### DANCE_RADIUS not enforced

Fix before campaign rules depend on Grod locality.

A Vietra should not be able to receive a valid Dance order from anywhere on map and magically walk back without clear intent.

### Pause / restart / checkpoint

Required.

## P1

### Texture generation load time

Add cache or generated-asset reuse if pitch load feels slow.

### Idle fidgets

At least for:

- story Zherca
- Baba
- Vitez companion
- Leshy

### Streletz bow pose

Fix before close-up campaign shots.

### Leshy readability

Existing Forest Spirit is too dark.

Campaign Leshy needs readable:

- body silhouette
- branch/head shape
- face/eyes
- attack wind-up

### Noon bleaching / terrain flatness

Do a second environment lighting/material pass after weather system exists.

Do not polish the old noon look in isolation and then redo it for weather.

## P2

- automated tests
- phone re-performance pass
- hidden-tab time handling
- fully generalized asset pipeline

Phone remains a bonus for pitch, not the campaign's production constraint.

---

# 49. Implementation Matrix

| Feature | Type | Priority | Pitch? | Complexity | Acceptance test |
|---|---|---:|---|---|---|
| Rename core roster/buildings | CHANGE | P0 | Yes | S | UI, tooltips, objectives use new names |
| Raise construction | CHANGE | P0 | Yes | M | No ritual unit visibly performs carpentry |
| Mend ritual | CHANGE | P1 | Yes | S-M | damaged building restored through ritual FX |
| Selectable idols | NEW | P0 | Yes | S | idol supports scripted states/actions |
| Consecrate action | NEW | P0 | Yes | M | same action works on mound/idol/corruption |
| Offer action | NEW | P0 | Yes | M | Leshy can be resolved without combat |
| Leshy rework | CHANGE | P0 | Yes | M | fight + appease paths both work |
| Mission scripting runtime | NEW | P0 | Yes | L | M1–M5 use common trigger/action framework |
| Dialogue with model closeups | NEW | P0 | Yes | M | campaign scenes use real models |
| Pause/restart/checkpoint | NEW | P0 | Yes | M | player can resume major mission phases |
| Difficulty modes | NEW | P0 | Yes | M | Story/Standard/Hard alter pressure |
| Day/night | NEW | P0 | Yes | M | M2 mechanically changes at sunset/dawn |
| Corpse system | NEW | P0 | Yes | M | corpse can become Upir or be Consecrated |
| Baba | NEW | P0 | Yes | M | Second Sight + Ash Ward functional |
| Upir | NEW | P0 | Yes | S-M | rises from corpse/mound |
| Striga | NEW | P1 | Yes | M | fast backline threat |
| Weather volumes | NEW | P0 | Yes | L | moving storm changes Rain and visibility |
| Binding | NEW | P1 | Yes | M | rival Zdroy overproduces + corruption |
| Dola progression | NEW | P1 | Yes | M | permanent choice survives mission load |
| Scripted terrain states | NEW | P1 | Yes | L | ford/forest/flood changes pathing |
| Ognik | NEW | P1 | Yes | S-M | one clear deception mechanic |
| Leshonok | NEW | P1 | Yes | S-M | forest melee enemy |
| Vila NPC | NEW | P1 | Yes | M | encounter works; ally unlock may persist |
| Vodnik | NEW | P1 | Yes | M | water controller with pull |
| Rusalka | NEW | P1 | Yes | M | lure/slow near water |
| Convoy objectives | NEW | P1 | Yes | M | M5 family groups can be escorted |
| Water-state system | NEW | P1 | Yes | L | LOW/RISING/HIGH/FALLING affects path |
| End mission summary | NEW | P1 | Yes | S-M | choice/optional result displayed |
| Winter state | NEW | P2 | No | M-L | M6 |
| Retreat/evacuation | NEW | P2 | No | M | M7 |
| Rival perspective mission | NEW content | P2 | No | M | M8 |
| Three-front finale system | NEW content | P2 | No | L | M9 |
| Zmey boss | NEW | P2 | No | L | M10 |
| Second full playable race | LATER | P3 | No | XL | not pitch scope |
| Multiplayer networking | LATER | P3 | No | XL | not campaign pitch scope |

---

# 50. Recommended Development Order

## Phase A — Make the Prototype Canonical

- apply names
- replace build presentation with Raise
- rework repair to Mend
- rework Forest Spirit into Leshy
- make idol interactive
- fix critical pathing and dance-radius issues
- run first external playtests on the existing loop

**Exit criterion:**  
The current one-map game now feels like Rodina, not a reskinned generic RTS.

## Phase B — Campaign Infrastructure

- mission runtime
- dialogue
- campaign state
- checkpoints
- difficulty
- optional objectives
- unlock flags
- Dola persistence

**Exit criterion:**  
Mission 1 is implemented through reusable campaign tools, not bespoke hacks.

## Phase C — Mission 2 Systems

- day/night
- corpse markers
- Upir
- Striga
- Baba
- Consecrate
- Ash Ward

**Exit criterion:**  
Mission 2 proves a completely different battlefield rule.

## Phase D — Mission 3 Systems

- weather volumes
- moving storm
- Rain multipliers
- Binding
- telegraphed lightning
- simple terrain-state change

**Exit criterion:**  
Economy can physically move around the map.

## Phase E — Mission 4 Systems

- Ognik
- Leshonok
- Offer
- scripted forest paths
- Vila encounter
- Leshy pact flag

**Exit criterion:**  
The game supports a no-base supernatural adventure mission.

## Phase F — Mission 5 Systems

- Vodnik
- Rusalka
- convoy
- water states
- temporary camps
- campaign optional-choice consequence

**Exit criterion:**  
Five missions show five different RTS situations.

## Phase G — Pitch Polish

- balance
- pacing
- model closeup framing
- lighting/weather pass
- audio pass
- onboarding
- playtest metrics
- bugs
- pitch capture

---

# 51. Playtesting Plan

The current status report explicitly says the two original prototype questions have not been tested.

Do this **before** content production gets too far.

## 51.1 Prototype Test

At minimum observe new players with no spoken explanation.

Questions:

1. Do they understand Vietra → Wind?
2. Do they understand Zherca → Rain?
3. Do they understand the difference between Wind and Rain?
4. Do they remember the names after one match?
5. Does the ritual economy feel satisfying or merely decorative?
6. Does Raise construction make intuitive sense?
7. Does the game look intentionally early-2000s rather than unfinished?

Record:

- time to first Khata
- time to first military unit
- time to first Zdroy
- first failure point
- whether player discovers Leshy choice
- match duration

## 51.2 Campaign Hook Test

After Missions 1–3, ask:

- Can you describe what made each mission different?
- Which unit/ritual do you remember?
- What do you think Binding is doing?
- What do you think is happening to the world?
- Would you play the next mission?

The desired answers should emerge without a lore lecture.

## 51.3 Publisher Build Test

Test the exact build from a fresh URL/package.

Observe:

- load
- settings
- mission select
- tutorial clarity
- checkpoint recovery
- crash/softlock rate
- browser performance
- total pitch session length

---

# 52. Pitch Build Definition

The publisher/VC-facing build should contain:

## Required Playable Content

- Mission 1 — The First Rain
- Mission 2 — The Dead Do Not Sleep
- Mission 3 — The Wandering Storm
- Mission 4 — The Black Grove
- Mission 5 — The Drowned Road

## Required Campaign Shell

- title screen
- New Campaign
- Continue
- difficulty
- mission transitions
- Dola choices
- model-closeup dialogue
- checkpoints
- mission-complete summary

## Required Rodina Content

- Vietra
- Zherca
- Streletz
- Vitez
- Jelenik
- Medved
- Baba
- Vila encounter; playable Vila preferred but not absolutely required

## Required Buildings

- Grod
- Khata
- Zbroynia
- Zdroy
- Svety Gai

## Required Enemy Content

- rival Rodina
- Leshy
- Leshonok
- Ognik
- Upir
- Striga
- Vodnik
- Rusalka

## Required World Systems

- Raise construction
- Offer / Consecrate / Wake
- day/night
- weather
- corpse state
- scripted terrain state
- Binding
- idols

This is enough to demonstrate a full-game thesis.

---

# 53. What the Pitch Build Should Communicate in 15 Minutes

A publisher may not play all five missions.

The build and presentation should make these points obvious quickly.

## Minute 0–3

> This is a real RTS.

They see:

- selection
- base
- economy
- unit production
- combat

## Minute 3–6

> Its economy is visually unique.

They see:

- Vietra dances
- Zherca rite
- Raise construction

## Minute 6–9

> The Slavic setting is mechanical, not just cosmetic.

They see:

- idol
- Leshy
- Offer / Consecrate
- named vocabulary

## Minute 9–12

> The campaign can change the RTS rules.

Jump/show:

- night corpses rising
- moving storm
- flood state

## Minute 12–15

> There is a story and progression structure.

Show:

- model closeup dialogue
- Dola choice
- Binding consequence
- campaign map / next missions

---

# 54. Pitch Narrative

The concise external pitch can become:

> **Wind & Rain is a low-poly Slavic myth RTS where your economy is ritual. Vietras dance for Wind, Zhercas pray for Rain, and the Rodina raises settlements by asking nature to provide the material. The campaign treats weather, forests, rivers, the dead and sacred places as changing battlefield rules rather than background decoration.**

Then:

> **The first five missions move from a classic territorial RTS battle to night survival, a moving storm economy, a no-base haunted forest expedition and a flood evacuation — all using the same compact Rodina roster.**

That is more fundable than:

> We have a Warcraft III-style prototype with Slavic models.

---

# 55. What NOT to Build Before Pitch

Do not let the campaign slice turn into a full production.

Explicitly defer:

- second fully independent playable race
- multiplayer networking
- ranked multiplayer
- procedural maps
- naval system
- hero inventories
- loot rarity
- giant item system
- twenty-unit tech tree
- elaborate cinematics
- facial animation
- seasons in every map
- realistic fluid simulation
- destructible every-tree simulation
- open-world campaign
- elaborate diplomacy
- crafting
- food/farming economy
- wall/gate city-builder layer
- full voice acting dependency
- console certification work
- sophisticated mobile-specific redesign

The pitch build should sell the **campaign engine and fantasy**, not finish the entire product.

---

# 56. Open Design Questions

These should remain visible rather than silently hardening into assumptions.

## 56.1 Jelenik Name

Current working name.

Need final pass.

Alternatives should preserve:

- deer identity
- short UI name
- pronounceability

## 56.2 Svety Gai Spelling

Direction is good.

Need choose final English spelling:

- Svety Gai
- Sveti Gai
- Svety Gaj

Use one and never vary it in UI.

## 56.3 How Much Does Killing Spirits Matter?

Options:

A. only mission-local consequence  
B. campaign flags  
C. full reputation system

Recommendation for pitch:

**A + a few specific B flags.**

Do not build a universal morality meter.

## 56.4 Does Baba Exist as a Generic Unit and Story Character?

Recommendation:

Yes.

The story Baba can be visually distinct but mechanically belong to the same class.

## 56.5 Does Vila Become a Standard Recruit?

Recommendation:

Only after Mission 4 peaceful resolution.

Cap at 1–2 initially.

## 56.6 Does Binding Ever Become Available to Player Rodina?

Potentially powerful story moment in Mission 10.

Do not put it in normal skirmish tech before campaign establishes its cost.

## 56.7 Rain Scarcity

Current 3-Zherca-per-Zdroy model is readable.

Re-evaluate only after weather missions exist.

Do not rebalance the base economy prematurely.

---

# 57. Historical / Mythology Research Guardrails

The game should be confident without being falsely authoritative.

## 57.1 Use "Inspired By"

When using:

- Perun
- Veles
- Stribog
- Mokosh
- Morana
- Svetovit
- Triglav
- Rod
- Dola
- Vila
- Leshy
- Rusalka
- Vodnik
- Upir
- Strzyga

internal design notes should distinguish:

- attested historical association
- later folklore
- disputed reconstruction
- pure game invention

## 57.2 Avoid Building the Main Plot Around Weak Pseudo-Deities

Names such as Chernobog/Belobog have complex and disputed status.

They can inspire flavor later.

Do not make:

> Chernobog is the confirmed Slavic Satan and final boss

the campaign premise.

It is both less interesting and historically shakier.

## 57.3 Regional Mixture Is Allowed

The game already uses a pan-Slavic fantasy vocabulary.

That is acceptable if the product language is:

> inspired by Slavic mythology and folklore

rather than:

> an exact reconstruction of one tribe in 812 CE

---

# 58. Research Notes: Slavic Mythology

These are working research references for the design team.

## 58.1 General deity reference

Wikipedia — List of Slavic deities  
https://en.wikipedia.org/wiki/List_of_Slavic_deities

Useful design points from that reference:

- sources for Slavic paganism are scarce and no direct written pagan accounts survive
- Perun: thunder/lightning/war
- Veles: underworld/dead, wealth/cattle, magic/poetry
- Dazhbog: sun/abundance associations
- Stribog: wind
- Mokosh: mother/moisture/spinning associations
- Rod: kin/family/birth associations; status debated
- Dola: fate
- Zorya: dawn
- Svetovit: four-headed idol, horn/horse/divination
- Triglav: three-headed deity; possible heaven/earth/underworld interpretation
- Morana: death/winter
- Devana: wildlife/forest/hunting in later West Slavic accounts
- Svarog/Svarozhits: fire/smith/sky traditions with interpretive uncertainty

## 58.2 Broader Slavic religion

Encyclopedia.com — Slavic Religion  
https://www.encyclopedia.com/environment/encyclopedias-almanacs-transcripts-and-maps/slavic-religion

World History Encyclopedia — Slavs  
https://www.worldhistory.org/Slavs/

These are useful particularly for:

- limits of evidence
- Perun
- Veles/Volos
- Mokosh
- nymph/spirit traditions

## 58.3 Forest spirits

Wikipedia — Leshy  
https://en.wikipedia.org/wiki/Leshy

World History Encyclopedia — Kikimora (includes discussion of Leshy and Domovoi)  
https://www.worldhistory.org/Kikimora/

Useful motifs:

- forest guardian
- size/shape changing
- misleading travelers
- variable relationship with humans
- forest as territory

## 58.4 Water beings

Wikipedia — Rusalka  
https://en.wikipedia.org/wiki/Rusalka

Wikipedia — Vodyanoy  
https://en.wikipedia.org/wiki/Vodyanoy

Useful motifs:

- water as inhabited/territorial
- luring
- drowning
- offerings
- water spirits ranging from dangerous to negotiable depending on regional tradition

## 58.5 Revenants

Wikipedia — Upiór  
https://en.wikipedia.org/wiki/Upi%C3%B3r

Wikipedia — Strzyga  
https://en.wikipedia.org/wiki/Strzyga

Useful motifs:

- unquiet dead
- improper burial
- revenant danger
- night activity
- local/Polish-Silesian flavor for Strzyga

## 58.6 Vila

Wikipedia — Supernatural beings in Slavic religion  
https://en.wikipedia.org/wiki/Supernatural_beings_in_Slavic_religion

Encyclopedia.com — Slavic Religion  
https://www.encyclopedia.com/environment/encyclopedias-almanacs-transcripts-and-maps/slavic-religion

Useful motifs:

- nature/cloud/water beings
- dancing
- beauty/danger
- healing in some traditions
- transformation
- offerings

---

# 59. Final Product Thesis

If all of the above works, *Wind & Rain* should not be described internally as:

> a Slavic Warcraft III

That was useful as a prototyping reference.

The actual identity is:

> **A compact mythic RTS about maintaining — or breaking — a relationship with a living world.**

The player has familiar RTS verbs:

- gather
- build
- train
- scout
- attack
- defend
- expand

But the fiction and campaign transform them:

- gathering is ritual
- building is asking the land to raise a home
- expansion means negotiating with places
- advanced units come through pacts
- weather moves economic power
- corpses change future battles
- forests remember violence
- springs can be forced until they become dangerous
- the enemy may be another family making a different survival choice

That is the campaign promise worth proving to publishers.

---

# 60. Immediate "Next Build" Checklist

If implementation starts directly from the current prototype, the next playable milestone should contain exactly this:

- [ ] Rename War Hall → Zbroynia
- [ ] Rename Rain Shrine → Zdroy
- [ ] Rename Sacred Grove → Svety Gai
- [ ] Rename Bear → Medved
- [ ] Choose/finalize Deer Rider name
- [ ] Rename/reframe Forest Spirit → Leshy
- [ ] Replace construction animation/logic presentation with Raise
- [ ] Add Founding Stake
- [ ] Add Mend ritual presentation
- [ ] Make idol selectable
- [ ] Add generic Consecrate action
- [ ] Add generic Offer action
- [ ] Give Leshy Offer/Fight outcomes
- [ ] Add minimal campaign dialogue using 3D model closeups
- [ ] Add pause/restart/checkpoint
- [ ] Move Mission 1 objective logic into reusable mission runtime
- [ ] Run external playtest
- [ ] Fix pathing blockers revealed by that playtest

Only after that milestone is stable:

- [ ] Build Baba
- [ ] Build corpse system
- [ ] Build Upir
- [ ] Build day/night
- [ ] Build Mission 2

This sequence keeps the project's identity coherent before content volume increases.
