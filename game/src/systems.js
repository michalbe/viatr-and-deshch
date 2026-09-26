/**
 * World systems the campaign switches on per mission: day/night, weather, corpses, water
 * states. One object so the runtime, the checkpoint and the frame loop have a single hook.
 * Each subsystem is created lazily by the mission that needs it.
 */
import * as THREE from 'three';
import { setGroundLight, blockCircle, unblockCells, heightAt, WATER_Y } from './terrain.js';

export class Systems {
  constructor(ctx) {
    Object.assign(this, ctx);   // scene, game, fx, rig, terrain, props, makeProp
    this.daynight = null; this.weather = null; this.corpses = null; this.water = null;
    this.wards = [];
    this.floods = new Map();
  }
  /** A local flood: a sheet of water over a circle and the cells under it blocked. */
  flood(id, x, z, r, on = true) {
    let f = this.floods.get(id);
    if (!f) {
      const geo = new THREE.CircleGeometry(r, 24); geo.rotateX(-Math.PI / 2);
      const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0x2c5872, roughness: 0.1, metalness: 0.2, transparent: true, opacity: 0.85 }));
      mesh.position.set(x, heightAt(x, z) + 0.9, z); mesh.visible = false; this.scene.add(mesh);
      f = { x, z, r, mesh, cells: null, on: false }; this.floods.set(id, f);
    }
    if (on === f.on) return f;
    f.on = on; f.mesh.visible = on;
    if (on) { f.cells = blockCircle(x, z, r * 0.9); for (const u of this.game.units) if (!u.dead && Math.hypot(u.x - x, u.z - z) < r * 0.9) { const a = Math.atan2(u.z - z, u.x - x); u.x = x + Math.cos(a) * (r + 1); u.z = z + Math.sin(a) * (r + 1); u.path = null; } this.fx.puff(x, f.mesh.position.y, z, 40, [0.4, 0.6, 0.8], r, 0.6, 2.5); }
    else if (f.cells) { unblockCells(f.cells); f.cells = null; }
    for (const u of this.game.units) u.path = null;
    return f;
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
  serialize() { return { daynight: this.daynight?.serialize?.(), weather: this.weather?.serialize?.(), water: this.water?.serialize?.(), floods: [...this.floods.entries()].filter(([, f]) => f.on).map(([id, f]) => ({ id, x: f.x, z: f.z, r: f.r })) }; }
  restore(d) { if (d.daynight && this.daynight) this.daynight.restore(d.daynight); if (d.weather && this.weather) this.weather.restore(d.weather); if (d.water && this.water) this.water.restore(d.water); for (const f of d.floods || []) this.flood(f.id, f.x, f.z, f.r, true); }
}
