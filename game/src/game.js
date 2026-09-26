/**
 * The simulation: entities, orders, the ritual economy, production, construction, combat,
 * fog of war, the Leshy and the objectives. The rival Rodina's brain is in ai.js.
 */
import * as THREE from 'three';
import { UNITS, BUILDINGS, TEAM, START, WIND_PER_VIETRA, RAIN_PER_ZHERCA, SHRINE_SLOTS, DANCE_RADIUS, INTERRUPT_S, OBJECTIVES, MAP, clamp } from './config.js';
import { heightAt, G, cellOf, cellCenter, dynBlock, staticBlock, blocked, inMap, unblockCells, map } from './terrain.js';
import { findPath, lineFree, nearestFree } from './path.js';
import { makeUnitModel, makeBuildingModel } from './models.js';
import { animate, animateDeath } from './anim.js';
import { sfx } from './audio.js';
import { RITUALS, canPerform, targetKind } from './rituals.js';

let NEXT_ID = 1;
const tmpV = new THREE.Vector3();

export class Game {
  constructor(scene, fx) {
    this.scene = scene; this.fx = fx; this.cons = null;   // Construction helper, set by main
    this.units = []; this.buildings = []; this.pending = 0;
    this.time = 0;
    this.teams = [0, 1, 2].map(() => ({ wind: START.wind, rain: START.rain, windTotal: 0, rainTotal: 0, trained: {}, lost: 0, kills: 0, lastAlarm: -99 }));
    this.springs = (map().springs || []).map(([x, z], i) => ({ i, x, z, shrine: null, prop: null }));
    this.vis = new Uint8Array(G * G); this.seen = new Uint8Array(G * G);
    this.objective = 0; this.objectiveDoneT = 0;
    this.over = null;                  // 'victory' | 'defeat'
    this.listeners = {};
    this.selection = [];
    this.stats = { unitsTrained: 0, kills: 0 };
    this.fogT = 0; this.objT = 0;
    this.circles = new Map();
    this.sites = [];                   // idols, mounds, rings: selectable places with a state
    this.reveals = [];                 // temporary vision: { x, z, r, t }
    this.flags = {};                   // campaign / mission facts: leshyAppeased, leshyKilled, ...
    this.walls = [];                   // root walls the forest can withdraw: { prop, cells }
    this.scripted = false;             // a mission runtime owns objectives and the end; skirmish keeps the built-in list
    this.locked = new Set();           // unit types the Rodina does not know yet (campaign unlocks)
    this.paused = false;
    this.pendingSpawns = [];           // { ut, team, x, z, at, home }
  }
  on(ev, fn) { (this.listeners[ev] ||= []).push(fn); }
  emit(ev, ...a) { for (const f of this.listeners[ev] || []) f(...a); }

  /* ------------------------------------------------------------ creation */
  async spawnUnit(ut, team, x, z, face = 0) {
    const def = UNITS[ut];
    this.pending++;
    const model = await makeUnitModel(def.asset, team, def.height);
    this.pending--;
    const [ci, cj] = cellOf(x, z);
    if (blocked(ci, cj)) { const [ni, nj] = nearestFree(ci, cj); [x, z] = cellCenter(ni, nj); }
    const u = {
      id: NEXT_ID++, kind: 'unit', ut, def, team, x, z, y: heightAt(x, z), face,
      hp: def.hp, maxHp: def.hp, radius: def.radius, speed: def.speed, sight: def.sight,
      order: null, next: [], path: null, pi: 0, repathT: 0, cooldown: 0, pendingHit: null,
      interruptT: 0, slot: null, slotOf: null, dead: false, deadT: 0, lastPos: [x, z], stuckT: 0,
      anim: { mode: 'idle', t: Math.random() * 10, phase: 0, attackT: 9, attackDur: 0.6 }, speedNow: 0,
      model, lastHitBy: null, home: [x, z], scanT: Math.random() * 0.5, wave: false,
    };
    if (ut === 'deer' && team === TEAM.PLAYER && this.dola?.jelenikSight) u.sight = Math.round(u.sight * this.dola.jelenikSight);
    model.root.position.set(x, u.y, z);
    model.root.rotation.y = face;
    this.scene.add(model.root);
    this.units.push(u);
    return u;
  }

  footprintCells(def, x, z) {
    const half = def.size / 2 - 0.4, out = [];
    const [i0, j0] = cellOf(x - half, z - half), [i1, j1] = cellOf(x + half, z + half);
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) out.push(j * G + i);
    return out;
  }
  canPlace(bt, x, z, team = TEAM.PLAYER) {
    const def = BUILDINGS[bt];
    if (def.atSpring) {
      const s = this.springs.find((s) => !s.shrine && Math.hypot(s.x - x, s.z - z) < 6);
      if (!s) return { ok: false, why: 'A Zdroy must rise at a free Sacred Spring', x, z };
      x = s.x; z = s.z;
    }
    const half = def.size / 2;
    if (!def.atSpring && this.springs.some((s) => Math.abs(s.x - x) < half + 3.5 && Math.abs(s.z - z) < half + 3.5)) return { ok: false, why: 'The Sacred Springs are kept for the Zdroy', x, z };
    if (!inMap(x - half, z - half) || !inMap(x + half, z + half)) return { ok: false, why: 'Too close to the edge', x, z };
    let hmin = 1e9, hmax = -1e9;
    for (const k of this.footprintCells(def, x, z)) {
      if (staticBlock[k] || dynBlock[k]) return { ok: false, why: 'Something is in the way', x, z };
      const [cx, cz] = cellCenter(k % G, (k / G) | 0); const h = heightAt(cx, cz); hmin = Math.min(hmin, h); hmax = Math.max(hmax, h);
    }
    if (hmax - hmin > 2.2) return { ok: false, why: 'The ground is too steep', x, z };
    if (hmin < -0.3) return { ok: false, why: 'Too wet to build', x, z };
    return { ok: true, x, z };
  }

  async placeBuilding(bt, team, x, z, built = false) {
    const def = BUILDINGS[bt];
    const b = {
      id: NEXT_ID++, kind: 'building', bt, def, team, x, z, face: 0, hp: built ? def.hp : def.hp * 0.1, maxHp: def.hp,
      radius: def.size * 0.5, sight: def.sight, built, progress: built ? 1 : 0, queue: [], rally: null, dead: false, deadT: 0,
      cells: this.footprintCells(def, x, z), spring: null, workers: [], model: null, root: new THREE.Group(), lastHitT: -99,
    };
    if (bt === 'khata' && team === TEAM.PLAYER && this.dola?.khataHp) { b.maxHp = Math.round(b.maxHp * this.dola.khataHp); b.hp = built ? b.maxHp : b.hp; }
    for (const k of b.cells) dynBlock[k]++;
    // push units out of the footprint
    for (const u of this.units) if (!u.dead && Math.abs(u.x - x) < def.size / 2 + 0.5 && Math.abs(u.z - z) < def.size / 2 + 0.5) {
      const [i, j] = nearestFree(...cellOf(u.x, u.z)); [u.x, u.z] = cellCenter(i, j); u.path = null;
    }
    if (def.atSpring) { const s = this.springs.find((s) => s.x === x && s.z === z); if (s) { s.shrine = b; b.spring = s; if (s.prop) s.prop.visible = false; } }
    b.root.position.set(x, this.groundLevel(x, z, def.size), z);
    this.scene.add(b.root);
    this.buildings.push(b);
    this.emit('placed', b);
    this.pending++;
    const model = await makeBuildingModel(def.asset, team);
    this.pending--;
    b.model = model; b.root.add(model);
    if (!built) { model.visible = false; if (this.cons) this.cons.begin(b); else this.updateBuildingScale(b); }
    return b;
  }
  groundLevel(x, z, size) {
    const h = size / 2 - 0.5;
    return Math.min(heightAt(x, z), heightAt(x - h, z - h), heightAt(x + h, z - h), heightAt(x - h, z + h), heightAt(x + h, z + h));
  }
  updateBuildingScale(b) { if (b.model && !this.cons) b.model.scale.set(1, b.built ? 1 : 0.12 + 0.88 * b.progress, 1); }

  /* ------------------------------------------------------------ queries */
  alive(team, pred) { return this.units.filter((u) => !u.dead && (team === undefined || u.team === team) && (!pred || pred(u))); }
  aliveB(team, bt) { return this.buildings.filter((b) => !b.dead && b.team === team && (!bt || b.bt === bt)); }
  grodOf(team) { return this.buildings.find((b) => !b.dead && b.team === team && b.bt === 'grod' && b.built); }

  /* ------------------------------------------------------------ sacred sites */
  /** addSite({ st: 'idol' | 'mound' | 'ring', name, title, x, z, radius, state, prop }) */
  addSite(o) {
    const s = { id: NEXT_ID++, kind: 'site', team: TEAM.NEUTRAL, dead: false, radius: 3, state: 'sleeping', title: '', ...o };
    s.y = heightAt(s.x, s.z);
    this.sites.push(s);
    return s;
  }
  setSiteState(s, state) { const prev = s.state; s.state = state; this.emit('siteState', s, prev); }
  reveal(x, z, r, t = 15) { this.reveals.push({ x, z, r, t }); this.fogT = 0; }
  supplyCap(team) { return clamp(START.supply + this.aliveB(team, 'khata').filter((b) => b.built).length * START.supplyPerKhata, 0, START.supplyMax); }
  supplyUsed(team) {
    let s = 0;
    for (const u of this.units) if (!u.dead && u.team === team) s += u.def.supply;
    for (const b of this.buildings) if (!b.dead && b.team === team) for (const q of b.queue) s += UNITS[q.ut].supply;
    return s;
  }
  hostile(a, b) { return a.team !== b.team; }
  distTo(u, t) {
    if (t.kind === 'building') {
      const h = t.def.size / 2;
      const dx = Math.max(Math.abs(u.x - t.x) - h, 0), dz = Math.max(Math.abs(u.z - t.z) - h, 0);
      return Math.max(0, Math.hypot(dx, dz) - 1.6);
    }
    return Math.hypot(u.x - t.x, u.z - t.z) - (t.radius || 0);
  }
  visibleTo(team, e) {
    if (team !== TEAM.PLAYER) return true;            // the AI does not cheat much, but it does see
    if (e.team === TEAM.PLAYER) return true;
    const [i, j] = cellOf(e.x, e.z);
    return !!this.vis[j * G + i];
  }

  /* ------------------------------------------------------------ orders */
  order(u, o, queue = false) {
    if (u.dead) return;
    if (queue && u.order) { u.next.push(o); return; }
    this.releaseSlot(u);
    u.order = o; u.next = []; u.path = null; u.pendingHit = null; u.stuckT = 0;
  }
  moveGroup(units, x, z, type = 'move') {
    const n = units.length;
    const cols = Math.ceil(Math.sqrt(n)), sp = 2.4;
    // big units first so they take the centre
    const sorted = [...units].sort((a, b) => b.radius - a.radius);
    sorted.forEach((u, i) => {
      const r = Math.floor(i / cols), c = i % cols;
      const ox = (c - (cols - 1) / 2) * sp, oz = (r - (Math.ceil(n / cols) - 1) / 2) * sp;
      this.order(u, { type, x: x + ox, z: z + oz });
    });
  }
  attack(units, target) { for (const u of units) this.order(u, { type: 'attack', target }); }
  stop(units) { for (const u of units) this.order(u, null); }
  dance(units, { auto = false } = {}) {
    let far = false;
    for (const u of units) if (u.ut === 'vietra') {
      const g = this.grodOf(u.team);
      if (!g) continue;
      const d = Math.hypot(u.x - g.x, u.z - g.z);
      if (d > DANCE_RADIUS) { if (auto) continue; far = true; }      // a dancer must be near her Grod; a player's order walks her there first
      this.order(u, { type: 'dance', grod: g });
    }
    if (far && units[0]?.team === TEAM.PLAYER) this.emit('toast', 'The Wind Dance belongs at the Grod: she walks there first');
  }
  rite(units, shrine) {
    for (const u of units) if (u.ut === 'zherca') {
      const s = shrine && shrine.built && !shrine.dead ? shrine : this.freeShrine(u.team, u);
      if (s) this.order(u, { type: 'rite', shrine: s });
    }
  }
  /** Begin a ritual on a target (a site, the Leshy, a building, a corpse or a ground point). */
  startRitual(u, ritual, target) {
    const r = RITUALS[ritual];
    const ok = canPerform(ritual, u, target); if (!ok.ok) return ok;
    if (r.cost && !this.canAfford(u.team, r.cost)) return { ok: false, why: `Not enough ${this.teams[u.team].wind < r.cost.wind ? 'Wind' : 'Rain'} for the offering` };
    if (r.cooldown && u.cooldowns?.[ritual] > this.time) return { ok: false, why: `${r.name} is not ready` };
    this.order(u, { type: 'ritual', ritual, target, t: 0 });
    return { ok: true };
  }
  completeRitual(u, o) {
    const r = RITUALS[o.ritual], t = o.target;
    if (r.cost) this.pay(u.team, { wind: r.cost.wind * (this.dola?.offerCost || 1), rain: (r.cost.rain || 0) * (this.dola?.offerCost || 1) });
    if (r.cooldown) (u.cooldowns ||= {})[o.ritual] = this.time + r.cooldown;
    const k = targetKind(t);
    // default results; missions listen to 'ritual' and add their own
    if (o.ritual === 'wake' && k === 'idol') { this.setSiteState(t, 'awake'); this.reveal(t.x, t.z, 34, 25); this.fx.puff(t.x, t.y + 6, t.z, 30, [0.62, 0.94, 0.78], 4, 0.7, 2.5); sfx('spirit', 0.8); if (u.team === TEAM.PLAYER) this.emit('toast', 'The idol wakes. For a while, the land is shown to you.'); }
    else if (o.ritual === 'offer' && k === 'spirit') { t.appeased = true; t.hostile = false; t.appeasedBy = u.team; this.flags.leshyAppeased = true; this.openWalls(); this.reveal(t.x, t.z, 30, 20); this.fx.puff(t.x, t.y + 3, t.z, 40, [0.62, 0.94, 0.78], 5, 0.7, 2.5); sfx('spirit', 0.9); this.emit('leshyAppeased', t, u); if (u.team === TEAM.PLAYER) this.emit('toast', 'The Leshy accepts the offering. The forest lets you pass.'); }
    else if (o.ritual === 'offer' && k === 'idol') { this.setSiteState(t, t.state === 'sleeping' ? 'blessed' : t.state); this.fx.puff(t.x, t.y + 4, t.z, 20, [0.9, 0.85, 0.6], 3, 0.6, 2); }
    else if (o.ritual === 'offer' && k === 'ring') { this.setSiteState(t, 'appeased'); this.fx.puff(t.x, t.y + 2, t.z, 30, [0.62, 0.94, 0.78], 5, 0.7, 2.5); sfx('spirit', 0.6); }
    else if (o.ritual === 'consecrate') {
      if (k === 'mound') { this.setSiteState(t, 'consecrated'); this.fx.puff(t.x, t.y + 1.5, t.z, 30, [0.9, 0.9, 0.85], 4, 0.6, 2); sfx('objective', 0.5); }
      else if (k === 'corpse') { this.removeCorpse?.(t); this.fx.puff(t.x, t.y + 0.5, t.z, 14, [0.9, 0.9, 0.85], 2, 0.6, 1.5); }
      else if (k === 'building' && t.state) { const prev = t.state; t.state = null; this.emit('buildingState', t, prev); this.fx.puff(t.x, t.y + 3, t.z, 30, [0.6, 0.85, 1.0], 5, 0.7, 2.5); }
      else if (k === 'idol') { this.setSiteState(t, 'blessed'); this.fx.puff(t.x, t.y + 4, t.z, 20, [0.9, 0.9, 0.85], 3, 0.6, 2); }
    }
    else if (o.ritual === 'ward') { this.systems?.addWard(t.x, t.z, r.radius, r.duration * (this.dola?.wardDuration || 1), u.team); }
    else if (o.ritual === 'sight') { this.reveal(t.x, t.z, r.radius, r.duration); this.fx.puff(t.x, heightAt(t.x, t.z) + 2, t.z, 16, [0.8, 0.7, 1.0], 3, 0.5, 2); }
    this.emit('ritual', { ritual: o.ritual, unit: u, target: t });
    this.order(u, null);
  }

  freeShrine(team, near) {
    let best = null, bd = 1e9;
    for (const b of this.aliveB(team, 'shrine')) {
      if (!b.built || b.workers.length >= SHRINE_SLOTS + (team === TEAM.PLAYER ? (this.dola?.zdroySlots || 0) : 0)) continue;
      const d = Math.hypot(b.x - near.x, b.z - near.z);
      if (d < bd) { bd = d; best = b; }
    }
    return best;
  }
  canAfford(team, def) { const t = this.teams[team]; return t.wind >= def.wind && t.rain >= (def.rain || 0); }
  pay(team, def, sign = 1) { const t = this.teams[team]; t.wind -= def.wind * sign; t.rain -= (def.rain || 0) * sign; }
  async build(u, bt, x, z) {
    const def = BUILDINGS[bt];
    if (!def.builtBy.includes(u.ut)) return { ok: false, why: `A ${UNITS[u.ut].name} cannot raise that` };
    const pl = this.canPlace(bt, x, z, u.team);
    if (!pl.ok) return pl;
    if (!this.canAfford(u.team, def)) return { ok: false, why: `Not enough ${this.teams[u.team].wind < def.wind ? 'Wind' : 'Rain'}` };
    this.pay(u.team, def);
    const wasDancing = u.order?.type === 'dance';
    const b = await this.placeBuilding(bt, u.team, pl.x, pl.z, false);
    b.builder = u;
    this.order(u, { type: 'build', site: b, thenDance: wasDancing });
    return { ok: true, building: b };
  }
  train(b, ut) {
    const def = UNITS[ut];
    if (!b.built || b.dead || !b.def.trains.includes(ut)) return { ok: false, why: 'Cannot call that here' };
    if (this.locked.has(ut)) return { ok: false, why: 'The Rodina does not know that rite yet' };
    if (b.queue.length >= 5) return { ok: false, why: 'The queue is full' };
    if (!this.canAfford(b.team, def)) return { ok: false, why: `Not enough ${this.teams[b.team].wind < def.wind ? 'Wind' : 'Rain'}` };
    if (this.supplyUsed(b.team) + def.supply > this.supplyCap(b.team)) return { ok: false, why: this.supplyCap(b.team) >= START.supplyMax ? 'Supply is at its limit' : 'Raise more Khatas' };
    this.pay(b.team, def);
    b.queue.push({ ut, t: 0 });
    return { ok: true };
  }
  cancelTrain(b, i = b.queue.length - 1) { const q = b.queue.splice(i, 1)[0]; if (q) this.pay(b.team, UNITS[q.ut], -1); }

  /** walk outward from (x, z) along angle a, starting at radius r, to the first walkable spot */
  freeAlong(x, z, a, r) {
    for (let k = 0; k < 20; k++, r += 0.5) {
      const px = x + Math.cos(a) * r, pz = z + Math.sin(a) * r;
      const [i, j] = cellOf(px, pz);
      if (!blocked(i, j)) return [px, pz];
    }
    return [x + Math.cos(a) * r, z + Math.sin(a) * r];
  }
  /** a stable index: the lowest one no other member holds, kept until the unit leaves */
  slotIndex(list, u) {
    if (u.slotIdx !== undefined && u.slotIdx !== null) return u.slotIdx;
    const taken = new Set(list.filter((o) => o !== u && o.slotIdx !== undefined && o.slotIdx !== null).map((o) => o.slotIdx));
    let i = 0; while (taken.has(i)) i++;
    u.slotIdx = i; return i;
  }
  releaseSlot(u) {
    if (u.slotOf && u.slotOf.workers) { const i = u.slotOf.workers.indexOf(u); if (i >= 0) u.slotOf.workers.splice(i, 1); }
    if (u.slotOf && u.slotOf.dancers) { const i = u.slotOf.dancers.indexOf(u); if (i >= 0) u.slotOf.dancers.splice(i, 1); }
    u.slotOf = null; u.slot = null; u.slotIdx = null;
  }
  danceSpot(g, u) {
    g.dancers ||= [];
    if (!g.dancers.includes(u)) g.dancers.push(u);
    const i = this.slotIndex(g.dancers, u);
    // two rings in front of the Grod, the ritual circle
    const ring = i < 8 ? 0 : 1, k = ring ? i - 8 : i, n = ring ? 12 : 8;
    const r = g.def.size / 2 + 3.2 + ring * 2.4;
    const a = Math.PI / 2 + (k - (n - 1) / 2) * (ring ? 0.24 : 0.34);
    return this.freeAlong(g.x, g.z, a, r);
  }
  riteSpot(s, u) {
    if (!s.workers.includes(u)) s.workers.push(u);
    const i = this.slotIndex(s.workers, u);
    const a = Math.PI / 2 + (i - 1) * 0.85;
    return this.freeAlong(s.x, s.z, a, s.def.size / 2 + 1.1);
  }

  /* ------------------------------------------------------------ damage */
  damage(t, amount, from) {
    if (t.dead || t.fallen) return;
    t.hp -= amount;
    if (t.kind === 'unit') {
      this.fx.blood(t.x, t.y + t.def.height * 0.6, t.z, 3);
      if (t.anim.mode === 'dance' || t.anim.mode === 'rite') t.interruptT = INTERRUPT_S;
      t.lastHitBy = from;
      // fight back if idle
      if (from && !from.dead && (t.def.kind !== 'econ') && (!t.order || t.order.type === 'move' && t.team !== TEAM.PLAYER)) this.order(t, { type: 'attack', target: from });
    } else {
      t.lastHitT = this.time;
      if (Math.random() < 0.3) this.fx.puff(t.x + (Math.random() - 0.5) * t.def.size * 0.6, heightAt(t.x, t.z) + 1, t.z + (Math.random() - 0.5) * t.def.size * 0.6, 3);
    }
    t.lastHitBy = from;
    // allies nearby answer
    if (from && !from.dead) for (const a of this.units) {
      if (a.dead || a.team !== t.team || a.def.kind === 'econ' || a === t) continue;
      if (a.order && a.order.type !== 'amove' && !(a.order.type === 'move' && a.team !== TEAM.PLAYER)) continue;
      if (Math.hypot(a.x - t.x, a.z - t.z) < 14) this.order(a, { type: 'attack', target: from });
    }
    if (t.team === TEAM.PLAYER && this.time - this.teams[0].lastAlarm > 18) {
      this.teams[0].lastAlarm = this.time;
      this.emit('alarm', t);
    }
    if (t.hp <= 0) this.kill(t, from);
  }
  kill(t, from) {
    if (t.kind === 'unit' && t.story && !t.fallen) {
      // a story character is never lost for good: she falls, and rises again after a while, hurt
      t.fallen = true; t.hp = 1; t.order = null; t.next = []; t.path = null; t.pendingHit = null; t.fallT = 12;
      this.releaseSlot(t); this.emit('storyFall', t);
      if (t.team === TEAM.PLAYER) this.emit('toast', `${t.name || t.def.name} has fallen. She will rise, in time.`);
      return;
    }
    this.emit('kill', t, from);
    t.dead = true; t.hp = 0;
    if (from && from.team !== t.team) { this.teams[from.team].kills++; if (from.team === TEAM.PLAYER) this.stats.kills++; }
    this.teams[t.team].lost++;
    if (t.kind === 'unit') {
      this.releaseSlot(t);
      sfx(t.ut === 'bear' ? 'roar' : t.ut === 'spirit' ? 'spirit' : 'shout', 0.6);
      if (t.ut === 'spirit') this.spiritSlain(from);
    } else {
      for (const k of t.cells) dynBlock[k] = Math.max(0, dynBlock[k] - 1);
      for (const w of [...(t.workers || []), ...(t.dancers || [])]) { w.slotOf = null; if (!w.dead) this.order(w, null); }
      if (t.spring) { t.spring.shrine = null; if (t.spring.prop) t.spring.prop.visible = true; }
      if (t.team !== TEAM.PLAYER || true) for (const q of t.queue) this.pay(t.team, UNITS[q.ut], -1);
      t.queue = [];
      if (this.cons) this.cons.abort(t);
      sfx('collapse');
      for (let k = 0; k < 6; k++) this.fx.puff(t.x + (Math.random() - 0.5) * t.def.size, heightAt(t.x, t.z) + 1, t.z + (Math.random() - 0.5) * t.def.size, 6, [0.45, 0.4, 0.33], 2, 0.7, 2.4);
      if (t.bt === 'grod') this.emit('grodDown', t);
    }
    this.selection = this.selection.filter((e) => e !== t);
    this.emit('selection');
  }
  spiritSlain(from) {
    const team = from ? from.team : TEAM.PLAYER;
    this.teams[team].wind += 150; this.teams[team].rain += 75;
    this.flags.leshyKilled = true;
    this.openWalls();
    if (team === TEAM.PLAYER) this.emit('toast', 'The Leshy falls. Its hoard is yours: +150 Wind, +75 Rain. The forest will remember.');
    // the forest answers: its children come out of the trees over the next minutes
    const s = this.units.find((u) => u.ut === 'spirit');
    const [hx, hz] = s ? s.home : (map().clearing || [0, 0]);
    for (let i = 0; i < 4; i++) { const a = i * 1.6 + 0.5; this.pendingSpawns.push({ ut: 'leshonok', team: TEAM.NEUTRAL, x: hx + Math.cos(a) * 16, z: hz + Math.sin(a) * 16, at: this.time + 25 + i * 30, home: [hx, hz], hunt: true }); }
    this.emit('leshySlain', from);
  }
  /** The forest withdraws its roots: every root wall opens. */
  openWalls() {
    for (const w of this.walls) { if (w.open) continue; w.open = true; unblockCells(w.cells); if (w.prop) { w.prop.visible = false; w.prop.parent?.remove(w.prop); } this.fx.puff(w.x, heightAt(w.x, w.z) + 1, w.z, 30, [0.45, 0.65, 0.3], 5, 0.6, 2.5); }
    for (const u of this.units) u.path = null;
  }

  /* ------------------------------------------------------------ per-frame */
  update(dt) {
    if (this.over) dt *= 0.25;
    this.time += dt;
    for (let i = this.pendingSpawns.length - 1; i >= 0; i--) {
      const p = this.pendingSpawns[i];
      if (p.at > this.time) continue;
      this.pendingSpawns.splice(i, 1);
      this.spawnUnit(p.ut, p.team, p.x, p.z, Math.random() * 6.28).then((u) => { if (p.home) u.home = p.home; if (p.hunt) u.hunt = true; if (p.onSpawn) p.onSpawn(u); });
    }
    for (const b of this.buildings) this.updateBuilding(b, dt);
    for (const u of this.units) if (!u.dead) this.updateUnit(u, dt);
    this.separate(dt);
    for (const u of this.units) {
      if (u.dead) { animateDeath(u, dt); }
      else animate(u, dt);
      u.model.root.position.set(u.x, u.y, u.z);
      u.model.root.rotation.y = u.face;
    }
    // corpses leave after a while
    for (let i = this.units.length - 1; i >= 0; i--) {
      const u = this.units[i];
      if (u.dead && u.deadT > 8) { this.scene.remove(u.model.root); this.units.splice(i, 1); }
    }
    for (let i = this.buildings.length - 1; i >= 0; i--) {
      const b = this.buildings[i];
      if (!b.dead) continue;
      b.deadT += dt;
      b.root.rotation.z = Math.min(0.3, b.deadT * 0.12); b.root.position.y -= dt * 1.4;
      // the land takes the wreck back: leaves and moss drift over it as it sinks
      if (Math.random() < dt * 8) this.fx.glow.emit(b.x + (Math.random() - 0.5) * b.def.size, heightAt(b.x, b.z) + 0.3 + Math.random() * 1.5, b.z + (Math.random() - 0.5) * b.def.size, (Math.random() - 0.5), 0.3, (Math.random() - 0.5), 1.5, 0.4, 0.45, 0.65, 0.3, 0.7);
      if (b.deadT > 3.5) { this.scene.remove(b.root); this.buildings.splice(i, 1); }
    }
    this.fogT -= dt; if (this.fogT <= 0) { this.fogT = 0.25; this.updateFog(); this.emit('fog'); }
    this.objT -= dt; if (this.objT <= 0 && !this.scripted) { this.objT = 0.5; this.checkObjectives(); this.checkEnd(); }
  }

  updateBuilding(b, dt) {
    if (b.dead) return;
    if (!b.built) { if (this.cons) this.cons.update(b, dt); return; }
    const q = b.queue[0];
    if (q) {
      q.t += dt;
      if (q.t >= UNITS[q.ut].time) {
        b.queue.shift();
        const out = this.exitPoint(b);
        this.spawnUnit(q.ut, b.team, out[0], out[1], 0).then((u) => {
          this.teams[b.team].trained[q.ut] = (this.teams[b.team].trained[q.ut] || 0) + 1;
          if (b.team === TEAM.PLAYER) { this.stats.unitsTrained++; sfx('trained'); this.emit('trained', u); }
          if (b.rally) {
            if (b.rally.target && !b.rally.target.dead) {
              const t = b.rally.target;
              if (t.kind === 'building' && t.team === b.team && t.bt === 'grod' && u.ut === 'vietra') this.dance([u]);
              else if (t.kind === 'building' && t.team === b.team && t.bt === 'shrine' && u.ut === 'zherca') this.rite([u], t);
              else if (t.team !== b.team) this.order(u, { type: 'attack', target: t });
              else this.order(u, { type: 'move', x: b.rally.x, z: b.rally.z });
            } else this.order(u, { type: 'move', x: b.rally.x, z: b.rally.z });
          } else if (u.ut === 'vietra') this.dance([u], { auto: true });
          else if (u.ut === 'zherca') { const s = this.freeShrine(u.team, u); if (s) this.rite([u], s); }
          else this.order(u, { type: 'move', x: out[0] + (Math.random() - 0.5) * 4, z: out[1] + 3 + Math.random() * 3 });
        });
      }
    }
  }
  exitPoint(b) {
    const d = b.def.size / 2 + 1.6;
    for (const [ox, oz] of [[0, d], [d, 0], [-d, 0], [0, -d], [d, d], [-d, d]]) {
      const [i, j] = cellOf(b.x + ox, b.z + oz);
      if (!blocked(i, j)) return [b.x + ox, b.z + oz];
    }
    const [i, j] = nearestFree(...cellOf(b.x, b.z + d)); return cellCenter(i, j);
  }

  /* ------------------------------------------------------------ movement */
  goTo(u, x, z, dt, arrive = 0.35) {
    if (!u.path || u.repathT <= 0 || u.goal?.[0] !== x || u.goal?.[1] !== z) {
      if (!u.path || u.goal?.[0] !== x || u.goal?.[1] !== z || u.repathT <= 0) {
        u.path = findPath(u.x, u.z, x, z); u.pi = 0; u.goal = [x, z]; u.repathT = 2.5;
      }
    }
    u.repathT -= dt;
    const p = u.path[u.pi];
    if (!p) { u.speedNow = 0; return true; }
    const dx = p[0] - u.x, dz = p[1] - u.z, d = Math.hypot(dx, dz);
    const last = u.pi === u.path.length - 1;
    if (d < (last ? arrive : 0.6)) {
      if (last) { u.speedNow = 0; u.path = null; return true; }
      u.pi++; return false;
    }
    const sp = u.speed * (u.interruptT > 0 && u.def.kind === 'econ' ? 1.1 : 1);
    const step = Math.min(d, sp * dt);
    const nx = u.x + dx / d * step, nz = u.z + dz / d * step;
    const [ci, cj] = cellOf(nx, nz);
    if (!blocked(ci, cj) || blocked(...cellOf(u.x, u.z))) { u.x = nx; u.z = nz; }
    else { u.repathT = 0; }
    u.face = turn(u.face, Math.atan2(dx, dz), dt * 10);
    u.speedNow = sp;
    // stuck check
    u.stuckT += dt;
    if (u.stuckT > 1.2) {
      const moved = Math.hypot(u.x - u.lastPos[0], u.z - u.lastPos[1]);
      u.lastPos = [u.x, u.z]; u.stuckT = 0;
      if (moved < 0.25) {
        u.stuckN = (u.stuckN || 0) + 1; u.repathT = 0;
        if (u.stuckN > 3) {
          u.stuckN = 0; u.path = null;
          if (!u.retried) { u.retried = true; const [i, j] = nearestFree(...cellOf(u.x + (Math.random() - 0.5) * 3, u.z + (Math.random() - 0.5) * 3)); [u.x, u.z] = cellCenter(i, j); return false; }
          u.retried = false; return true;
        }
      }
      else u.stuckN = 0;
    }
    return false;
  }
  separate(dt) {
    const us = this.units.filter((u) => !u.dead);
    for (let i = 0; i < us.length; i++) {
      const a = us[i];
      for (let j = i + 1; j < us.length; j++) {
        const b = us[j];
        const dx = b.x - a.x, dz = b.z - a.z, r = a.radius + b.radius;
        if (Math.abs(dx) > r || Math.abs(dz) > r) continue;
        const d = Math.hypot(dx, dz);
        if (d >= r || d < 1e-4) continue;
        const push = (r - d) * 0.5 * Math.min(1, dt * 8);
        const nx = dx / d, nz = dz / d;
        const aFixed = a.anim.mode === 'dance' || a.anim.mode === 'rite', bFixed = b.anim.mode === 'dance' || b.anim.mode === 'rite';
        const wa = aFixed ? 0 : bFixed ? 2 : 1, wb = bFixed ? 0 : aFixed ? 2 : 1;
        this.nudge(a, -nx * push * wa, -nz * push * wa);
        this.nudge(b, nx * push * wb, nz * push * wb);
      }
    }
    for (const u of us) u.y += (heightAt(u.x, u.z) - u.y) * Math.min(1, dt * 12);
  }
  nudge(u, dx, dz) { const nx = u.x + dx, nz = u.z + dz; const [i, j] = cellOf(nx, nz); if (!blocked(i, j)) { u.x = nx; u.z = nz; } }

  /* ------------------------------------------------------------ unit brain */
  updateUnit(u, dt) {
    if (u.fallen) { u.anim.mode = 'idle'; u.speedNow = 0; u.fallT -= dt; if (u.fallT <= 0) { u.fallen = false; u.hp = u.maxHp * 0.5; this.emit('storyRise', u); } return; }
    u.cooldown -= dt; u.interruptT -= dt; u.scanT -= dt;
    const o = u.order;
    // resolve a pending melee hit
    if (u.pendingHit) {
      u.pendingHit.t -= dt;
      if (u.pendingHit.t <= 0) {
        const t = u.pendingHit.target; u.pendingHit = null;
        if (!t.dead && this.distTo(u, t) <= u.def.range + 1.2) {
          this.damage(t, this.dmgAgainst(u, t), u);
          sfx(u.ut === 'bear' ? 'roar' : u.ut === 'vitez' ? 'axe' : 'hit', 0.5);
        }
      }
    }
    if (u.def.brain === 'leshy') return this.spiritBrain(u, dt);
    if (u.def.brain === 'leshonok') return this.leshonokBrain(u, dt);
    if (u.def.brain === 'upir') return this.upirBrain(u, dt);
    if (u.def.brain === 'striga') return this.strigaBrain(u, dt);
    if (!o) {
      u.anim.mode = 'idle'; u.speedNow = 0; u.struck = false;
      if (u.next.length) { u.order = u.next.shift(); return; }
      if (u.def.kind !== 'econ' && u.scanT <= 0) {
        u.scanT = 0.45;
        const t = this.nearestEnemy(u, u.sight);
        if (t) this.order(u, { type: 'attack', target: t, auto: true, home: [u.x, u.z] });
      }
      return;
    }
    if (o.type === 'move' || o.type === 'amove') {
      if (o.type === 'amove' && u.scanT <= 0) {
        u.scanT = 0.4;
        const t = this.nearestEnemy(u, u.sight);
        if (t) { u.next.unshift({ ...o }); u.order = { type: 'attack', target: t, auto: true }; u.path = null; return; }
      }
      u.anim.mode = 'walk';
      if (this.goTo(u, o.x, o.z, dt)) { u.order = u.next.shift() || null; }
      return;
    }
    if (o.type === 'attack') {
      const t = o.target;
      if (!t || t.dead || (u.team === TEAM.PLAYER && t.kind === 'unit' && !this.visibleTo(u.team, t) && this.distTo(u, t) > 3)) { u.order = u.next.shift() || null; return; }
      // auto-acquired targets are not chased forever
      if (o.auto && o.home && Math.hypot(u.x - o.home[0], u.z - o.home[1]) > 22 && u.team === TEAM.PLAYER) { this.order(u, { type: 'move', x: o.home[0], z: o.home[1] }); return; }
      const d = this.distTo(u, t);
      if (d <= u.def.range + (u.anim.mode === 'walk' ? 0 : 0.6)) {
        u.path = null; u.speedNow = 0;
        u.face = turn(u.face, Math.atan2(t.x - u.x, t.z - u.z), dt * 10);
        if (u.cooldown <= 0) {
          u.cooldown = u.def.cd;
          u.anim.mode = 'attack'; u.anim.attackT = 0; u.anim.attackDur = Math.min(u.def.cd * 0.85, u.def.ranged ? 1.0 : 0.8);
          if (u.def.ranged) {
            setTimeout(() => {}, 0);
            u.pendingShot = 0.55;
          } else u.pendingHit = { target: t, t: u.anim.attackDur * 0.45 };
        } else if (u.anim.attackT >= u.anim.attackDur) u.anim.mode = 'idle';
        if (u.pendingShot !== undefined && u.pendingShot !== null) {
          u.pendingShot -= dt;
          if (u.pendingShot <= 0) {
            u.pendingShot = null;
            sfx('bow', 0.6);
            const ty = t.kind === 'unit' ? t.y + t.def.height * 0.6 : heightAt(t.x, t.z) + t.def.height * 0.4;
            const aimX = t.kind === 'building' ? t.x + (u.x - t.x) * 0.2 : t.x, aimZ = t.kind === 'building' ? t.z + (u.z - t.z) * 0.2 : t.z;
            this.fx.arrow({ x: u.x, y: u.y + 1.4, z: u.z }, { x: aimX, y: ty, z: aimZ }, 26, () => { if (!t.dead) { this.damage(t, this.dmgAgainst(u, t), u); sfx('hit', 0.3); } });
          }
        }
      } else {
        u.anim.mode = 'walk';
        // a building is attacked from a spread of points round its perimeter, so a mob does not pile onto one face
        if (t.kind === 'building' && o.slot === undefined) { t.slotSeq = (t.slotSeq || 0) + 1; o.slot = t.slotSeq; }
        const ang = t.kind === 'building' ? Math.atan2(u.z - t.z, u.x - t.x) + ((o.slot % 5) - 2) * 0.42 : 0;
        const hh = t.kind === 'building' ? t.def.size / 2 + 0.8 : 0;
        const tx = t.kind === 'building' ? clamp(t.x + Math.cos(ang) * hh * 1.5, t.x - hh, t.x + hh) : t.x;
        const tz = t.kind === 'building' ? clamp(t.z + Math.sin(ang) * hh * 1.5, t.z - hh, t.z + hh) : t.z;
        if (u.path && u.goal && Math.hypot(u.goal[0] - tx, u.goal[1] - tz) > 2.5) u.repathT = 0;
        const [gx, gz] = u.path && u.goal && Math.hypot(u.goal[0] - tx, u.goal[1] - tz) < 2.5 ? u.goal : [tx, tz];
        this.goTo(u, gx, gz, dt, 0.2);
      }
      return;
    }
    if (o.type === 'dance') {
      const g = o.grod;
      if (!g || g.dead) { this.order(u, null); return; }
      if (!u.slot) { u.slot = this.danceSpot(g, u); u.slotOf = g; }
      const [sx, sz] = u.slot;
      if (Math.hypot(u.x - sx, u.z - sz) > 0.5) { u.anim.mode = 'walk'; this.goTo(u, sx, sz, dt, 0.3); return; }
      u.speedNow = 0; u.path = null;
      u.face = turn(u.face, Math.atan2(g.x - u.x, g.z - u.z) + Math.PI, dt * 4);
      if (u.interruptT > 0) { u.anim.mode = 'idle'; return; }
      u.anim.mode = 'dance';
      const wr = WIND_PER_VIETRA * (u.team === TEAM.PLAYER ? (this.dola?.windRate || 1) : 1);
      const t = this.teams[u.team]; t.wind += wr * dt; t.windTotal += wr * dt;
      return;
    }
    if (o.type === 'rite') {
      const s = o.shrine;
      if (!s || s.dead || !s.built) { this.order(u, null); return; }
      if (!u.slot) {
        if (s.workers.length >= SHRINE_SLOTS + (u.team === TEAM.PLAYER ? (this.dola?.zdroySlots || 0) : 0) && !s.workers.includes(u)) { this.order(u, null); this.emit('toast', 'That Zdroy is full', u); return; }
        u.slot = this.riteSpot(s, u); u.slotOf = s;
      }
      const [sx, sz] = u.slot;
      if (Math.hypot(u.x - sx, u.z - sz) > 0.5) { u.anim.mode = 'walk'; this.goTo(u, sx, sz, dt, 0.3); return; }
      u.speedNow = 0; u.path = null;
      u.face = turn(u.face, Math.atan2(s.x - u.x, s.z - u.z), dt * 4);
      if (u.interruptT > 0) { u.anim.mode = 'idle'; return; }
      u.anim.mode = 'rite';
      const mult = (s.state === 'bound' ? 2.5 : 1) * (this.systems?.weather?.rainMultAt(s.x, s.z) ?? 1) * (this.rainBase ?? 1);
      const t = this.teams[u.team]; t.rain += RAIN_PER_ZHERCA * dt * mult; t.rainTotal += RAIN_PER_ZHERCA * dt * mult;
      if (s.state === 'bound') { s.corruption = Math.min(1, (s.corruption || 0) + dt / 90); }
      return;
    }
    if (o.type === 'ritual') {
      const r = RITUALS[o.ritual], t = o.target;
      if (!t || t.dead) { this.order(u, null); return; }
      if (o.ritual === 'mend' && t.hp >= t.maxHp - 0.5) { this.order(u, null); return; }
      const d = t.kind === 'ground' ? Math.hypot(u.x - t.x, u.z - t.z) : this.distTo(u, t);
      if (d > r.range) {
        u.anim.mode = 'walk';
        if (!o.spot) { const a = Math.atan2(u.z - t.z, u.x - t.x); const rr = (t.kind === 'building' ? t.def.size / 2 : (t.radius || 1)) + r.range * 0.6; o.spot = this.freeAlong(t.x, t.z, a, rr); }
        if (this.goTo(u, o.spot[0], o.spot[1], dt, 0.3)) o.spot = null;
        return;
      }
      u.speedNow = 0; u.path = null;
      u.face = turn(u.face, Math.atan2(t.x - u.x, t.z - u.z), dt * 6);
      if (u.interruptT > 0) { u.anim.mode = 'idle'; return; }
      u.anim.mode = u.ut === 'vietra' ? 'dance' : 'rite';
      if (r.continuous) {
        // mend: pay Wind by the second, heal by the second, stop when whole
        const team = this.teams[u.team];
        if (team.wind < r.windPerSecond * dt) { u.anim.mode = 'idle'; if (u.team === TEAM.PLAYER && !o.warned) { o.warned = true; this.emit('toast', 'No Wind left to mend with'); } return; }
        team.wind -= r.windPerSecond * dt * (u.team === TEAM.PLAYER ? (this.dola?.mendCost || 1) : 1);
        t.hp = Math.min(t.maxHp, t.hp + t.maxHp * r.hpPerSecond * dt);
        if (Math.random() < dt * 3) this.fx.mendMotes?.(u, t);
        return;
      }
      o.t += dt;
      if (Math.random() < dt * 4) this.fx.ritualMotes?.(u, t, o.ritual);
      if (o.t >= r.dur) this.completeRitual(u, o);
      return;
    }
    if (o.type === 'build') {
      const b = o.site;
      if (!b || b.dead) { this.order(u, null); return; }
      if (b.built) { this.afterBuild(u, o, b); return; }
      if (this.distTo(u, b) > 1.6) {
        u.anim.mode = 'walk';
        if (!o.spot) { o.tries = (o.tries || 0) + 1; o.spot = this.freeAlong(b.x, b.z, Math.atan2(u.z - b.z, u.x - b.x) + (o.tries - 1) * 0.9, b.def.size / 2 + 0.6); }
        if (this.goTo(u, o.spot[0], o.spot[1], dt, 0.3)) o.spot = null;
        return;
      }
      u.speedNow = 0; u.path = null;
      u.face = turn(u.face, Math.atan2(b.x - u.x, b.z - u.z), dt * 8);
      if (u.interruptT > 0) { u.anim.mode = 'idle'; return; }        // the rite pauses under attack
      // the Founding Dance / the raising rite: no carpentry, the land does the work
      u.anim.mode = u.ut === 'vietra' ? 'dance' : 'rite';
      b.progress = Math.min(1, b.progress + dt / b.def.time);
      b.hp = Math.min(b.maxHp, b.hp + (b.maxHp * 0.9) * dt / b.def.time);
      if (Math.random() < dt * 1.2) sfx(u.ut === 'vietra' ? 'raise' : 'raiseDeep', u.team === TEAM.PLAYER ? 0.6 : 0.2);
      if (Math.random() < dt * 5) this.fx.ritualMotes(u, b, u.ut === 'vietra' ? 'raise' : 'consecrate');
      this.updateBuildingScale(b);
      if (b.progress >= 1) {
        b.built = true; this.updateBuildingScale(b);
        if (this.cons) this.cons.end(b);
        if (b.team === TEAM.PLAYER) { sfx('trained'); this.emit('built', b); }
        else this.fx.puff(b.x, heightAt(b.x, b.z) + 0.5, b.z, 14, [0.62, 0.55, 0.42], b.def.size * 0.8, 0.5, 2);
        this.afterBuild(u, o, b);
      }
    }
  }
  afterBuild(u, o, b) {
    this.order(u, null);
    if (u.ut === 'zherca' && b.bt === 'shrine') this.rite([u], b);
    else if (u.ut === 'vietra' && (o.thenDance || b.bt === 'grod')) this.dance([u], { auto: true });
  }
  dmgAgainst(u, t) {
    let d = u.def.dmg * (0.85 + Math.random() * 0.3);
    if (u.def.kind === 'nav') d *= 0.6 + 0.6 * (this.systems?.daynight?.darkness ?? 0);     // the dead are strong in the dark
    if (u.ut === 'vitez' && u.team === TEAM.PLAYER && this.dola?.vitezFirst && !u.struck) { u.struck = true; d *= this.dola.vitezFirst; this.fx.puff(t.x, (t.y ?? heightAt(t.x, t.z)) + 1.5, t.z, 12, [0.95, 0.9, 0.6], 1.5, 0.8, 1.6); sfx('thunderclap', 0.25); }
    if (t.def?.kind === 'nav' && u.def.ranged && this.dola?.arrowSpirit) d *= this.dola.arrowSpirit;
    if (t.kind === 'building') d *= u.def.vsBuilding || 1;
    else if (t.def.kind === 'econ') d *= u.def.vsEcon || 1;
    return d;
  }
  nearestEnemy(u, r) {
    let best = null, bd = r * r;
    for (const e of this.units) {
      if (e.dead || e.team === u.team) continue;
      if (e.def.brain === 'leshy' && (e.appeased || (!e.hostile && Math.hypot(e.x - u.x, e.z - u.z) > 6))) continue;   // the Leshy is left alone unless it has turned on us
      const d = (e.x - u.x) ** 2 + (e.z - u.z) ** 2;
      if (d < bd && this.visibleTo(u.team, e)) { bd = d; best = e; }
    }
    if (best) return best;
    for (const b of this.buildings) {
      if (b.dead || b.team === u.team || b.team === TEAM.NEUTRAL) continue;
      const d = this.distTo(u, b);
      if (d * d < bd * 0.5) { bd = d * d; best = b; }
    }
    return best;
  }

  /* ------------------------------------------------------------ the Leshy */
  spiritBrain(u, dt) {
    const [hx, hz] = u.home;
    const fromHome = Math.hypot(u.x - hx, u.z - hz);
    const o = u.order;
    if (o?.type === 'attack' && (!o.target || o.target.dead || fromHome > 22)) { this.order(u, { type: 'move', x: hx, z: hz, leash: true }); return; }
    if (o?.type === 'move') {
      u.anim.mode = 'walk';
      if (o.leash) u.hp = Math.min(u.maxHp, u.hp + 60 * dt);
      if (this.goTo(u, o.x, o.z, dt, 1)) this.order(u, null);
      return;
    }
    if (o?.type === 'attack') {
      const t = o.target, d = this.distTo(u, t);
      if (d <= u.def.range) {
        u.speedNow = 0; u.path = null;
        u.face = turn(u.face, Math.atan2(t.x - u.x, t.z - u.z), dt * 5);
        if (u.cooldown <= 0) {
          u.cooldown = u.def.cd; u.anim.mode = 'attack'; u.anim.attackT = 0; u.anim.attackDur = 1.1;
          u.pendingHit = { target: t, t: 0.55 };
          // a ground slam hurts everyone close to the target
          setTimeout(() => { for (const e of this.units) if (!e.dead && e !== t && e !== u && e.team !== u.team && Math.hypot(e.x - t.x, e.z - t.z) < 2.5) this.damage(e, u.def.dmg * 0.35, u); this.fx.puff(t.x, heightAt(t.x, t.z), t.z, 8, [0.4, 0.5, 0.3], 2); }, 550);
        } else if (u.anim.attackT >= u.anim.attackDur) u.anim.mode = 'idle';
      } else { u.anim.mode = 'walk'; this.goTo(u, t.x, t.z, dt, 0.3); }
      return;
    }
    // idle: heal, sway, watch the clearing
    u.anim.mode = 'idle'; u.speedNow = 0;
    u.hp = Math.min(u.maxHp, u.hp + 25 * dt);
    u.patience = Math.min(8, (u.patience ?? 8) + dt * 0.5);
    if (u.lastHitBy && !u.lastHitBy.dead && Math.hypot(u.lastHitBy.x - hx, u.lastHitBy.z - hz) < 26) { u.hostile = true; this.order(u, { type: 'attack', target: u.lastHitBy }); u.lastHitBy = null; sfx('spirit', this.visibleTo(0, u) ? 0.8 : 0); return; }
    if (u.appeased) {
      // appeased: it walks its clearing and lets everyone be
      if (u.scanT <= 0) { u.scanT = 6 + Math.random() * 6; const a = Math.random() * 6.28, r = 3 + Math.random() * 6; this.order(u, { type: 'move', x: hx + Math.cos(a) * r, z: hz + Math.sin(a) * r, leash: true }); }
      return;
    }
    if (u.scanT <= 0) {
      u.scanT = 0.5;
      // intruders in the clearing: a warning first, then patience runs out
      let best = null, bd = 12 * 12;
      for (const e of this.units) { if (e.dead || e === u || e.team === TEAM.NEUTRAL) continue; const d = (e.x - hx) ** 2 + (e.z - hz) ** 2; if (d < bd) { bd = d; best = e; } }
      if (best) {
        if (!u.warned || this.time - u.warned > 40) { u.warned = this.time; if (best.team === TEAM.PLAYER) this.emit('leshyWarn', u, best); sfx('spirit', this.visibleTo(0, u) ? 0.7 : 0); }
        u.patience -= 0.5 + dt;
        if (u.patience <= 0 || u.hostile) { u.hostile = true; this.order(u, { type: 'attack', target: best }); sfx('spirit', this.visibleTo(0, u) ? 0.8 : 0); }
      }
    }
  }
  /* ------------------------------------------------------------ the Leshy's children */
  leshonokBrain(u, dt) {
    const [hx, hz] = u.home, o = u.order;
    if (o?.type === 'attack' && (!o.target || o.target.dead)) { this.order(u, null); return; }
    if (o?.type === 'attack') {
      const t = o.target, d = this.distTo(u, t);
      if (Math.hypot(u.x - hx, u.z - hz) > 34) { this.order(u, { type: 'move', x: hx, z: hz }); return; }
      if (d <= u.def.range) {
        u.speedNow = 0; u.path = null; u.face = turn(u.face, Math.atan2(t.x - u.x, t.z - u.z), dt * 8);
        if (u.cooldown <= 0) { u.cooldown = u.def.cd; u.anim.mode = 'attack'; u.anim.attackT = 0; u.anim.attackDur = 0.5; u.pendingHit = { target: t, t: 0.25 }; }
        else if (u.anim.attackT >= u.anim.attackDur) u.anim.mode = 'idle';
      } else { u.anim.mode = 'walk'; this.goTo(u, t.x, t.z, dt, 0.3); }
      return;
    }
    if (o?.type === 'move') { u.anim.mode = 'walk'; if (this.goTo(u, o.x, o.z, dt, 0.8)) this.order(u, null); if (u.scanT <= 0) { u.scanT = 0.4; const t = this.nearestEnemy(u, 12); if (t) this.order(u, { type: 'attack', target: t }); } return; }
    u.anim.mode = 'idle'; u.speedNow = 0;
    if (u.scanT <= 0) {
      u.scanT = 0.5;
      const t = this.nearestEnemy(u, u.sight);
      if (t) { this.order(u, { type: 'attack', target: t }); return; }
      // hunting: drift toward the nearest human building, or wander the home wood
      u.wanderT = (u.wanderT || 0) - 0.5;
      if (u.wanderT <= 0) {
        u.wanderT = 6 + Math.random() * 6;
        const target = u.hunt ? this.buildings.filter((b) => !b.dead && b.team === TEAM.PLAYER).sort((a, b) => Math.hypot(a.x - u.x, a.z - u.z) - Math.hypot(b.x - u.x, b.z - u.z))[0] : null;
        if (target && Math.hypot(target.x - hx, target.z - hz) < 60) { u.home = [target.x + (Math.random() - 0.5) * 20, target.z + (Math.random() - 0.5) * 20]; this.order(u, { type: 'move', x: u.home[0], z: u.home[1] }); }
        else { const a = Math.random() * 6.28, r = 4 + Math.random() * 10; this.order(u, { type: 'move', x: hx + Math.cos(a) * r, z: hz + Math.sin(a) * r }); }
      }
    }
  }

  /* ------------------------------------------------------------ the unquiet dead */
  /** shared melee pursuit for the wild brains: returns true while busy with a target */
  chase(u, dt, t, { dur = 0.5, hitAt = 0.25, arrive = 0.3 } = {}) {
    const d = this.distTo(u, t);
    if (d <= u.def.range) {
      u.speedNow = 0; u.path = null; u.face = turn(u.face, Math.atan2(t.x - u.x, t.z - u.z), dt * 8);
      if (u.cooldown <= 0) { u.cooldown = u.def.cd; u.anim.mode = 'attack'; u.anim.attackT = 0; u.anim.attackDur = dur; u.pendingHit = { target: t, t: hitAt }; }
      else if (u.anim.attackT >= u.anim.attackDur) u.anim.mode = 'idle';
    } else { u.anim.mode = 'walk'; this.goTo(u, t.x, t.z, dt, arrive); }
  }
  nearestHuman(u, r, pred) {
    let best = null, bd = r * r;
    for (const e of this.units) { if (e.dead || e.fallen || e.team === TEAM.NEUTRAL || e.def.kind === 'spirit' || e.def.kind === 'nav' || (pred && !pred(e))) continue; const d = (e.x - u.x) ** 2 + (e.z - u.z) ** 2; if (d < bd) { bd = d; best = e; } }
    return best;
  }
  nearestHumanBuilding(u, r) {
    let best = null, bd = r * r;
    for (const b of this.buildings) { if (b.dead || b.team === TEAM.NEUTRAL) continue; const d = (b.x - u.x) ** 2 + (b.z - u.z) ** 2; if (d < bd) { bd = d; best = b; } }
    return best;
  }
  upirBrain(u, dt) {
    const dark = this.systems?.daynight?.darkness ?? 1, o = u.order;
    const warded = this.systems?.inWard(u.x, u.z);
    u.speed = u.def.speed * (0.7 + 0.5 * dark) * (warded ? 0.5 : 1);
    if (warded) { this.damage(u, 6 * dt, null); if (Math.random() < dt * 2) this.fx.puff(u.x, u.y + 1, u.z, 2, [0.9, 0.85, 0.7], 0.6, 0.4, 0.8); if (u.dead) return; }
    if (o?.type === 'attack') { if (!o.target || o.target.dead || o.target.fallen) { this.order(u, null); return; } this.chase(u, dt, o.target, { dur: 0.6, hitAt: 0.3 }); return; }
    if (o?.type === 'move') { u.anim.mode = 'walk'; if (this.goTo(u, o.x, o.z, dt, 1.2)) this.order(u, null); if (u.scanT <= 0) { u.scanT = 0.5; const t = this.nearestHuman(u, 14); if (t) this.order(u, { type: 'attack', target: t }); } return; }
    u.anim.mode = 'idle'; u.speedNow = 0;
    if (u.scanT > 0) return;
    u.scanT = 0.6;
    const t = this.nearestHuman(u, u.sight + 20 * dark) || this.nearestHumanBuilding(u, 30 + 40 * dark);
    if (t) { this.order(u, { type: 'attack', target: t }); return; }
    // nothing near: shamble toward the living
    const g0 = this.grodOf(TEAM.PLAYER) || this.buildings.find((b) => !b.dead && b.team === TEAM.PLAYER);
    if (g0 && dark > 0.3) this.order(u, { type: 'move', x: g0.x + (Math.random() - 0.5) * 10, z: g0.z + 8 + Math.random() * 6 });
    else if (u.home) { const a = Math.random() * 6.28; this.order(u, { type: 'move', x: u.home[0] + Math.cos(a) * 5, z: u.home[1] + Math.sin(a) * 5 }); }
  }
  strigaBrain(u, dt) {
    const dark = this.systems?.daynight?.darkness ?? 1, o = u.order;
    const warded = this.systems?.inWard(u.x, u.z);
    u.leapT = Math.max(0, (u.leapT || 0) - dt); u.leapCd = Math.max(0, (u.leapCd || 0) - dt);
    u.speed = u.def.speed * (0.5 + 0.6 * dark) * (u.leapT > 0 ? 4 : 1) * (warded ? 0.6 : 1);
    if (warded) { this.damage(u, 4 * dt, null); if (u.dead) return; }
    if (o?.type === 'attack') {
      const t = o.target; if (!t || t.dead || t.fallen) { this.order(u, null); return; }
      const d = this.distTo(u, t);
      if (u.leapCd <= 0 && d > 5 && d < 11) { u.leapT = 0.45; u.leapCd = 7; u.anim.mode = 'attack'; u.anim.attackT = 0; u.anim.attackDur = 0.6; sfx('spirit', this.visibleTo(0, u) ? 0.5 : 0); }
      this.chase(u, dt, t, { dur: 0.45, hitAt: 0.2 });
      return;
    }
    if (o?.type === 'move') { u.anim.mode = 'walk'; if (this.goTo(u, o.x, o.z, dt, 1.5)) this.order(u, null); if (u.scanT <= 0) { u.scanT = 0.4; const t = this.nearestHuman(u, 30, (e) => e.def.kind === 'econ') || this.nearestHuman(u, 12); if (t) this.order(u, { type: 'attack', target: t }); } return; }
    u.anim.mode = 'idle'; u.speedNow = 0;
    if (u.scanT > 0) return;
    u.scanT = 0.5;
    const t = this.nearestHuman(u, 45, (e) => e.def.kind === 'econ') || this.nearestHuman(u, 30);
    if (t) { this.order(u, { type: 'attack', target: t }); return; }
    const g0 = this.grodOf(TEAM.PLAYER);
    if (g0 && dark > 0.3) this.order(u, { type: 'move', x: g0.x + (Math.random() - 0.5) * 30, z: g0.z + (Math.random() - 0.5) * 30 });
    else if (u.home) { const a = Math.random() * 6.28; this.order(u, { type: 'move', x: u.home[0] + Math.cos(a) * 8, z: u.home[1] + Math.sin(a) * 8 }); }
  }

  /* ------------------------------------------------------------ checkpoints */
  serialize() {
    const units = this.units.filter((u) => !u.dead).map((u) => ({ ut: u.ut, team: u.team, x: +u.x.toFixed(2), z: +u.z.toFixed(2), face: +u.face.toFixed(2), hp: Math.ceil(u.hp), name: u.name, tag: u.tag, story: !!u.story, home: u.home, appeased: !!u.appeased, hostile: !!u.hostile, hunt: !!u.hunt, wave: !!u.wave, o: u.order?.type === 'dance' ? 'dance' : u.order?.type === 'rite' ? 'rite' : null }));
    const buildings = this.buildings.filter((b) => !b.dead).map((b) => ({ bt: b.bt, team: b.team, x: b.x, z: b.z, hp: Math.ceil(b.hp), built: b.built, progress: b.progress, queue: b.queue.map((q) => ({ ut: q.ut, t: q.t })), rally: b.rally ? { x: b.rally.x, z: b.rally.z } : null, state: b.state || null, name: b.name, tag: b.tag }));
    let seen = ''; for (let i = 0; i < this.seen.length; i += 8) { let v = 0; for (let k = 0; k < 8; k++) v |= (this.seen[i + k] || 0) << k; seen += String.fromCharCode(v); }
    return {
      time: this.time, units, buildings,
      teams: this.teams.map((t) => ({ wind: t.wind, rain: t.rain, windTotal: t.windTotal, rainTotal: t.rainTotal, trained: t.trained, lost: t.lost, kills: t.kills })),
      sites: this.sites.map((s) => ({ state: s.state })), walls: this.walls.map((w) => !!w.open), flags: this.flags, stats: this.stats, seen: btoa(seen),
      corpses: (this.corpses || []).map((c) => ({ x: c.x, z: c.z, team: c.team, ut: c.ut })),
    };
  }
  async restore(d) {
    this.time = d.time || 0;
    d.teams.forEach((t, i) => Object.assign(this.teams[i], t));
    Object.assign(this.flags, d.flags || {});
    Object.assign(this.stats, d.stats || {});
    const seen = atob(d.seen || ''); for (let i = 0; i < seen.length; i++) { const v = seen.charCodeAt(i); for (let k = 0; k < 8; k++) if (i * 8 + k < this.seen.length) this.seen[i * 8 + k] = (v >> k) & 1; }
    (d.sites || []).forEach((s, i) => { if (this.sites[i]) this.sites[i].state = s.state; });
    (d.walls || []).forEach((open, i) => { if (open && this.walls[i]) { const w = this.walls[i]; w.open = true; unblockCells(w.cells); if (w.prop) w.prop.visible = false; } });
    for (const b of d.buildings) {
      const nb = await this.placeBuilding(b.bt, b.team, b.x, b.z, b.built);
      nb.hp = b.hp; nb.progress = b.progress; nb.queue = b.queue.map((q) => ({ ...q })); if (b.rally) nb.rally = { ...b.rally }; if (b.state) nb.state = b.state; if (b.name) nb.name = b.name; if (b.tag) nb.tag = b.tag;
      if (!b.built) nb.hp = Math.max(nb.hp, nb.maxHp * 0.1);
    }
    for (const u of d.units) {
      const nu = await this.spawnUnit(u.ut, u.team, u.x, u.z, u.face);
      nu.hp = Math.min(nu.maxHp, u.hp); if (u.name) nu.name = u.name; if (u.tag) nu.tag = u.tag; if (u.story) nu.story = true; if (u.home) nu.home = u.home;
      if (u.appeased) nu.appeased = true; if (u.hostile) nu.hostile = true; if (u.hunt) nu.hunt = true; if (u.wave) nu.wave = true;
      if (u.o === 'dance') this.dance([nu], { auto: true }); else if (u.o === 'rite') this.rite([nu]);
    }
    for (const c of d.corpses || []) this.addCorpse?.(c.x, c.z, c.team, c.ut);
    this.updateFog();
  }

  /* ------------------------------------------------------------ fog of war */
  circle(r) {
    const k = Math.ceil(r / MAP.cell);
    if (!this.circles.has(k)) { const out = []; for (let j = -k; j <= k; j++) for (let i = -k; i <= k; i++) if (i * i + j * j <= k * k + k) out.push([i, j]); this.circles.set(k, out); }
    return this.circles.get(k);
  }
  updateFog() {
    this.vis.fill(0);
    const stamp = (x, z, r) => {
      const [ci, cj] = cellOf(x, z);
      for (const [i, j] of this.circle(r)) { const a = ci + i, b = cj + j; if (a >= 0 && b >= 0 && a < G && b < G) { this.vis[b * G + a] = 1; this.seen[b * G + a] = 1; } }
    };
    const ss = this.systems?.daynight?.sightScale ?? 1;
    for (const u of this.units) if (!u.dead && u.team === TEAM.PLAYER) stamp(u.x, u.z, u.sight * ss * (this.systems?.weather?.sightMultAt(u.x, u.z) ?? 1) * (u.ut === 'baba' && this.dola?.babaSight ? this.dola.babaSight : 1));
    for (const b of this.buildings) if (!b.dead && b.team === TEAM.PLAYER) stamp(b.x, b.z, b.sight + b.def.size / 2);
    for (let i = this.reveals.length - 1; i >= 0; i--) { const r = this.reveals[i]; r.t -= this.fogT <= 0 ? 0.25 : 0; stamp(r.x, r.z, r.r); if (r.t <= 0) this.reveals.splice(i, 1); }
  }
  cellIndex(x, z) { return cellOf(x, z); }
  cellSeen(x, z) { const [i, j] = cellOf(x, z); return !!this.seen[j * G + i]; }
  cellVisible(x, z) { const [i, j] = cellOf(x, z); return !!this.vis[j * G + i]; }

  /* ------------------------------------------------------------ objectives and the end */
  checkObjectives() {
    const p = this.teams[0];
    const built = (bt) => this.aliveB(0, bt).some((b) => b.built);
    const done = {
      wind100: () => p.windTotal >= 100,
      khata: () => built('khata'),
      warhall: () => built('warhall'),
      streletz3: () => (p.trained.streletz || 0) >= 3,
      shrine: () => built('shrine'),
      rain50: () => p.rainTotal >= 50,
      vitez: () => (p.trained.vitez || 0) >= 1,
      find: () => this.buildings.some((b) => b.team === TEAM.RIVAL && this.cellSeen(b.x, b.z)),
      destroy: () => !this.buildings.some((b) => b.team === TEAM.RIVAL && b.bt === 'grod' && !b.dead),
    };
    const cur = OBJECTIVES[this.objective];
    if (cur && done[cur.id]()) {
      this.objective++;
      sfx('objective');
      this.emit('objective', cur, OBJECTIVES[this.objective]);
    }
  }
  checkEnd() {
    if (this.over) return;
    const rivalGrod = this.buildings.some((b) => b.team === TEAM.RIVAL && b.bt === 'grod' && !b.dead);
    if (!rivalGrod) { this.over = 'victory'; sfx('victory'); this.emit('end', 'victory'); return; }
    const myGrod = this.buildings.some((b) => b.team === TEAM.PLAYER && b.bt === 'grod' && !b.dead);
    if (!myGrod) {
      const canRebuild = this.alive(0, (u) => u.ut === 'vietra').length > 0 && this.teams[0].wind >= BUILDINGS.grod.wind;
      if (!canRebuild) { this.over = 'defeat'; sfx('defeat'); this.emit('end', 'defeat'); }
    }
  }
}

export function turn(a, b, k) {
  let d = b - a; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2;
  return a + d * Math.min(1, k);
}
