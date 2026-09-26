/**
 * Weather volumes (blueprint §36): a storm is a circle that wanders the map. Under it, rain is
 * rich (a Zdroy inside it produces many times more), sight is short, rain streaks and low cloud
 * are drawn, and lightning strikes with a telegraph the player can read. Outside it, the valley
 * is dry. Volumes move along a list of waypoints with a wobble, so the economy has to follow.
 */
import { heightAt, inMap } from './terrain.js';
import { TEAM, MAP } from './config.js';
import { sfx } from './audio.js';

export class Weather {
  constructor({ scene, game, fx, rig }) {
    this.scene = scene; this.game = game; this.fx = fx; this.rig = rig;
    this.volumes = []; this.bolts = []; this.t = 0;
    this.dryMult = 1;           // Rain rate for a Zdroy that is NOT under a storm
  }
  /** addStorm({ x, z, r, path: [[x, z], ...], speed, rainMult, sightMult, lightning }) */
  addStorm(o) {
    const v = { kind: 'storm', x: o.x, z: o.z, r: o.r ?? 30, path: o.path || [], i: 0, speed: o.speed ?? 1.2, rainMult: o.rainMult ?? 2.75, sightMult: o.sightMult ?? 0.7, lightning: o.lightning ?? true, boltT: 8, wobble: Math.random() * 100, loop: o.loop ?? true, id: o.id || 'storm' };
    this.volumes.push(v);
    return v;
  }
  at(x, z) { for (const v of this.volumes) if (Math.hypot(v.x - x, v.z - z) < v.r) return v; return null; }
  rainMultAt(x, z) { const v = this.at(x, z); return v ? v.rainMult : this.dryMult; }
  sightMultAt(x, z) { const v = this.at(x, z); return v ? v.sightMult : 1; }
  update(dt) {
    this.t += dt;
    for (const v of this.volumes) {
      if (v.path.length) {
        const w = v.path[v.i % v.path.length];
        const dx = w[0] - v.x, dz = w[1] - v.z, d = Math.hypot(dx, dz);
        if (d < 3) { v.i++; if (!v.loop && v.i >= v.path.length) v.path = []; }
        else {
          // irregular: the storm's speed breathes and its heading drifts
          const sp = v.speed * (0.6 + 0.8 * (0.5 + 0.5 * Math.sin(this.t * 0.07 + v.wobble)));
          const ang = Math.atan2(dz, dx) + Math.sin(this.t * 0.13 + v.wobble) * 0.5;
          v.x += Math.cos(ang) * sp * dt; v.z += Math.sin(ang) * sp * dt;
        }
      }
      if (v.lightning) {
        v.boltT -= dt;
        if (v.boltT <= 0) { v.boltT = 7 + Math.random() * 7; this.telegraph(v); }
      }
    }
    for (let i = this.bolts.length - 1; i >= 0; i--) {
      const b = this.bolts[i]; b.t -= dt;
      if (b.t <= 0) { this.strike(b); this.bolts.splice(i, 1); }
    }
  }
  /** pick a spot in the storm: a unit standing on high ground for preference, else a hilltop */
  telegraph(v) {
    const g = this.game;
    let best = null, bh = -1e9;
    for (const u of g.units) { if (u.dead || Math.hypot(u.x - v.x, u.z - v.z) > v.r * 0.9) continue; const h = heightAt(u.x, u.z) + Math.random() * 1.5; if (h > bh) { bh = h; best = [u.x, u.z]; } }
    if (!best || Math.random() < 0.35) { const a = Math.random() * 6.28, r = Math.random() * v.r * 0.8; best = [v.x + Math.cos(a) * r, v.z + Math.sin(a) * r]; }
    if (!inMap(best[0], best[1])) return;
    this.bolts.push({ x: best[0], z: best[1], t: 2.2 });
    if (g.cellVisible(best[0], best[1])) sfx('rumble', 0.6);
  }
  strike(b) {
    const g = this.game, y = heightAt(b.x, b.z);
    for (const u of g.units) if (!u.dead && Math.hypot(u.x - b.x, u.z - b.z) < 3.2) g.damage(u, 45, null);
    for (let i = 0; i < 40; i++) this.fx.glow.emit(b.x + (Math.random() - 0.5) * 2, y + Math.random() * 14, b.z + (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, 2, (Math.random() - 0.5) * 2, 0.5, 1.2, 0.9, 0.95, 1.0, 1);
    this.fx.puff(b.x, y + 0.5, b.z, 16, [0.3, 0.28, 0.25], 3, 0.7, 2);
    sfx('thunderclap', g.cellVisible(b.x, b.z) ? 1 : 0.3);
    g.emit('lightning', b);
  }
  overlays(fx) {
    const g = this.game;
    for (const v of this.volumes) {
      // rain and low cloud over the visible part of the storm
      for (let k = 0; k < 10; k++) {
        const a = Math.random() * 6.28, r = Math.sqrt(Math.random()) * v.r;
        const x = v.x + Math.cos(a) * r, z = v.z + Math.sin(a) * r;
        if (!inMap(x, z) || !g.cellSeen(x, z)) continue;
        fx.rainOver(x, heightAt(x, z), z, 0.6);
      }
    }
    for (const b of this.bolts) { const k = 1 - b.t / 2.2; fx.ring(b.x, heightAt(b.x, b.z), b.z, 3.2 * (0.6 + 0.4 * Math.sin(this.t * 14)), 0xffe8a0); if (k > 0.6) fx.ring(b.x, heightAt(b.x, b.z), b.z, 1.2, 0xffffff); }
  }
  serialize() { return { volumes: this.volumes.map((v) => ({ ...v })), dryMult: this.dryMult }; }
  restore(d) { this.volumes = (d.volumes || []).map((v) => ({ ...v })); this.dryMult = d.dryMult ?? 1; }
}
