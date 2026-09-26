/**
 * World systems the campaign switches on per mission: day/night, weather, corpses, water
 * states. One object so the runtime, the checkpoint and the frame loop have a single hook.
 * Each subsystem is created lazily by the mission that needs it.
 */
import { setGroundLight } from './terrain.js';

export class Systems {
  constructor(ctx) {
    Object.assign(this, ctx);   // scene, game, fx, rig, terrain, props, makeProp
    this.daynight = null; this.weather = null; this.corpses = null; this.water = null;
    this.wards = [];
  }
  update(dt) {
    this.daynight?.update(dt);
    this.weather?.update(dt);
    this.corpses?.update(dt);
    this.water?.update(dt);
    for (let i = this.wards.length - 1; i >= 0; i--) { const w = this.wards[i]; w.t -= dt; if (w.t <= 0) this.wards.splice(i, 1); }
  }
  overlays(fx, sel) {
    for (const w of this.wards) fx.ring(w.x, w.y, w.z, w.r * (0.98 + 0.02 * Math.sin(fx.t * 3)), 0xd8c8a0);
    this.weather?.overlays?.(fx);
    this.corpses?.overlays?.(fx, sel);
  }
  addWard(x, z, r, t, team) { const w = { x, z, y: this.game.groundLevel(x, z, 1), r, t, team }; this.wards.push(w); this.fx.puff(x, w.y + 0.3, z, 30, [0.85, 0.8, 0.7], r * 0.8, 0.5, 2); return w; }
  inWard(x, z) { return this.wards.some((w) => Math.hypot(w.x - x, w.z - z) < w.r); }
  serialize() { return { daynight: this.daynight?.serialize?.(), weather: this.weather?.serialize?.(), water: this.water?.serialize?.() }; }
  restore(d) { if (d.daynight && this.daynight) this.daynight.restore(d.daynight); if (d.weather && this.weather) this.weather.restore(d.weather); if (d.water && this.water) this.water.restore(d.water); }
}
