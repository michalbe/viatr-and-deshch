/**
 * Mission runtime (blueprint §19): the reusable layer that mission scripts are written against.
 *
 * A mission module exports `{ id, title, map, speakers, phases: { name: async (rt, ctx) => {} },
 * start: 'name' }`. Phases are async functions: they add objectives, wait on conditions with
 * `rt.until`, speak lines, spawn things, and hand over with `rt.phase('next')`. A phase is the
 * unit of checkpointing: entering one saves the game (units, buildings, resources, fog, sites,
 * flags, mission vars), and restoring re-enters that phase with `ctx.restored = true`, so a
 * phase must be written to pick up from its own saved vars rather than assume a fresh world.
 *
 * Everything the scripts can observe or do goes through this object, so `game.js` stays free of
 * mission-specific branches.
 */
import { TEAM, UNITS } from './config.js';
import { heightAt, regionCells, blockCells, unblockCells, map } from './terrain.js';
import { sfx } from './audio.js';
import { saveCheckpoint, clearCheckpoint, difficulty, dolaEffects } from './campaign.js';

export class MissionRuntime {
  constructor(ctx) {
    Object.assign(this, ctx);   // game, ui, ai, fx, rig, scene, dialogue, def, systems, onEnd
    this.objectives = [];
    this.watchers = [];
    this.timers = [];
    this.vars = {};
    this.phaseId = null;
    this.gen = 0;
    this.over = false;
    this.diff = difficulty();
    this.dola = dolaEffects();
    this.regions = new Map();
    this.game.scripted = true;
    this.game.on('ritual', (e) => this.emit('ritual', e));
    this.game.on('siteState', (s, prev) => this.emit('siteState', { site: s, prev }));
    this.game.on('kill', (t, from) => this.emit('kill', { t, from }));
    this.game.on('built', (b) => this.emit('built', b));
    this.game.on('placed', (b) => this.emit('placed', b));
    this.listeners = {};
  }
  on(ev, fn) { (this.listeners[ev] ||= []).push(fn); return () => { this.listeners[ev] = this.listeners[ev].filter((f) => f !== fn); }; }
  emit(ev, a) { for (const f of this.listeners[ev] || []) f(a); }

  /* ------------------------------------------------------------ flow */
  async start(restoreData = null) {
    if (this.def.speakers) { this.dialogue.defineSpeakers(this.def.speakers); this.dialogue.preload(this.def.speakers.map((s) => s.id)).catch(() => {}); }
    if (restoreData) { this.vars = restoreData.vars || {}; this.objectives = restoreData.objectives || []; this.ui.renderObjectives(); await this.phase(restoreData.phase, { restored: true, save: false }); }
    else await this.phase(this.def.start || 'start');
  }
  /** Enter a phase (and checkpoint it unless told not to). Older phase scripts are cancelled by generation. */
  async phase(id, { restored = false, save = true } = {}) {
    const fn = this.def.phases[id];
    if (!fn) throw new Error('no phase ' + id);
    this.phaseId = id;
    const gen = ++this.gen;
    this.watchers.length = 0; this.timers.length = 0;
    if (save) this.checkpoint();
    try { await fn(this, { restored, gen }); } catch (e) { if (e?.message !== 'phase cancelled') console.warn('[mission]', id, e); }
  }
  alive(gen) { return gen === this.gen && !this.over; }
  /** Wait for game-seconds, poll a condition, or both. */
  wait(s) { return new Promise((r) => this.timers.push({ t: s, r, gen: this.gen })); }
  until(cond, { timeout = 0 } = {}) { return new Promise((r) => this.watchers.push({ cond, r, gen: this.gen, timeout })); }
  tick(dt) {
    if (this.over) return;
    for (let i = this.timers.length - 1; i >= 0; i--) { const t = this.timers[i]; if (t.gen !== this.gen) { this.timers.splice(i, 1); continue; } t.t -= dt; if (t.t <= 0) { this.timers.splice(i, 1); t.r(); } }
    for (let i = this.watchers.length - 1; i >= 0; i--) {
      const w = this.watchers[i];
      if (w.gen !== this.gen) { this.watchers.splice(i, 1); continue; }
      if (w.timeout) { w.timeout -= dt; if (w.timeout <= 0) { this.watchers.splice(i, 1); w.r(false); continue; } }
      let ok = false; try { ok = w.cond(); } catch (e) { console.warn('[mission] watcher', e); }
      if (ok) { this.watchers.splice(i, 1); w.r(true); }
    }
    if (this.def.tick) this.def.tick(this, dt);
  }

  /* ------------------------------------------------------------ objectives */
  objective(id, text, { optional = false, hidden = false } = {}) {
    let o = this.objectives.find((o) => o.id === id);
    if (!o) { o = { id, text, optional, hidden, state: 'active' }; this.objectives.push(o); }
    else { o.text = text; o.state = 'active'; }
    this.ui.renderObjectives();
    if (!hidden) { this.ui.toast((optional ? 'Optional: ' : 'Objective: ') + text, 'good'); sfx('objective', 0.6); }
    return o;
  }
  complete(id) { const o = this.objectives.find((o) => o.id === id); if (!o || o.state === 'done') return; o.state = 'done'; this.ui.renderObjectives(); this.ui.toast('Objective complete: ' + o.text, 'good'); sfx('objective'); }
  fail(id) { const o = this.objectives.find((o) => o.id === id); if (!o || o.state !== 'active') return; o.state = 'failed'; this.ui.renderObjectives(); this.ui.toast('Objective failed: ' + o.text, 'bad'); sfx('defeat', 0.5); }
  isDone(id) { return this.objectives.find((o) => o.id === id)?.state === 'done'; }
  clearObjectives() { this.objectives.length = 0; this.ui.renderObjectives(); }

  /* ------------------------------------------------------------ presentation */
  say(who, text, opts) { return this.dialogue.say(who, text, opts); }
  async lines(list) { for (const [who, text] of list) await this.say(who, text); }
  toast(msg, cls = '') { this.ui.toast(msg, cls); }
  focus(x, z, { dist = null, hold = 0 } = {}) { this.ui.scriptedCenter(x, z + 6); if (dist) this.ui.distGoal = dist; if (hold) this.ui.lockCamera(hold); }
  ping(x, z) { this.ui.pings.push({ x, z, t: 3 }); }
  sfx(name, vol) { sfx(name, vol); }
  reveal(x, z, r, t = 15) { this.game.reveal(x, z, r, t); }

  /* ------------------------------------------------------------ the world */
  async spawn(ut, team, x, z, opts = {}) {
    const u = await this.game.spawnUnit(ut, team, x, z, opts.face || 0);
    if (opts.name) u.name = opts.name;
    if (opts.home) u.home = opts.home;
    if (opts.tag) u.tag = opts.tag;
    if (opts.hp) { u.maxHp = opts.hp; u.hp = opts.hp; }
    if (opts.story) u.story = true;   // cannot die permanently: falls, then recovers
    return u;
  }
  async spawnGroup(list, team, x, z, opts = {}) {
    const out = [];
    let i = 0;
    for (const ut of list) { const a = i * 2.4, r = 1.5 + Math.floor(i / 3) * 2.2; out.push(await this.spawn(ut, team, x + Math.cos(a) * r, z + Math.sin(a) * r, opts)); i++; }
    return out;
  }
  place(bt, team, x, z, built = true) { return this.game.placeBuilding(bt, team, x, z, built); }
  order(units, o) { for (const u of [].concat(units)) if (u && !u.dead) this.game.order(u, { ...o }); }
  amove(units, x, z) { this.order(units, { type: 'amove', x, z }); }
  give(wind = 0, rain = 0, team = TEAM.PLAYER) { const t = this.game.teams[team]; t.wind += wind; t.rain += rain; }
  count(team, pred) { return this.game.alive(team, pred).length; }
  units(team, pred) { return this.game.alive(team, pred); }
  buildings(team, bt) { return this.game.aliveB(team, bt); }
  site(name) { return this.game.sites.find((s) => s.name === name || s.id === name || s.tag === name); }
  addSite(o) { return this.game.addSite(o); }
  flag(k, v = true) { this.game.flags[k] = v; }
  has(k) { return !!this.game.flags[k]; }
  aiMode(mode, params = {}) { if (this.ai) this.ai.setMode(mode, params); }
  /** Block or open a region (polygon or box) for pathing; visual props are the mission's job. */
  region(id, region, blockedNow = true) {
    const cells = regionCells(region);
    this.regions.set(id, { cells, blocked: false });
    if (blockedNow) this.setRegion(id, true);
  }
  setRegion(id, blockedNow) {
    const r = this.regions.get(id); if (!r || r.blocked === blockedNow) return;
    r.blocked = blockedNow; blockedNow ? blockCells(r.cells) : unblockCells(r.cells);
    for (const u of this.game.units) u.path = null;
  }
  nearAny(x, z, r, team = TEAM.PLAYER) { return this.game.alive(team).some((u) => Math.hypot(u.x - x, u.z - z) < r); }
  inRegion(team, region) { const cells = new Set(regionCells(region)); return this.game.alive(team).filter((u) => { const [i, j] = this.game.cellIndex(u.x, u.z); return cells.has(j * 90 + i); }); }

  /* ------------------------------------------------------------ persistence */
  checkpoint() {
    if (this.over) return;
    const data = { phase: this.phaseId, vars: this.vars, objectives: this.objectives, game: this.game.serialize(), systems: this.systems?.serialize?.() || {}, time: this.game.time };
    saveCheckpoint(this.def.id, data);
    this.ui.toast('Checkpoint', '');
  }
  /* ------------------------------------------------------------ the end */
  victory(summary = {}) { if (this.over) return; this.over = true; this.game.over = 'victory'; sfx('victory'); clearCheckpoint(); this.onEnd?.('victory', summary); }
  defeat(reason = '') { if (this.over) return; this.over = true; this.game.over = 'defeat'; sfx('defeat'); this.onEnd?.('defeat', { reason }); }
}
