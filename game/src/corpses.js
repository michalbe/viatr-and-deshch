/**
 * Corpses and the unquiet dead (blueprint §38, §15). Every human who falls leaves a marker. At
 * night, a corpse outside an Ash Ward may rise as an Upir; a restless burial mound raises them on
 * its own until a Zherca consecrates it. Consecrating a corpse removes it. Markers are capped;
 * the oldest are forgotten first.
 */
import * as THREE from 'three';
import { TEAM } from './config.js';
import { heightAt } from './terrain.js';
import { sfx } from './audio.js';

export class Corpses {
  constructor({ scene, game, fx, makeProp, daynight, cap = 60 }) {
    this.scene = scene; this.game = game; this.fx = fx; this.makeProp = makeProp; this.daynight = daynight;
    this.cap = cap; this.list = []; this.proto = null; this.enabled = true; this.rising = true;
    this.riseChance = 0.03;    // per corpse per second, at night, outside a ward
    this.moundEvery = 45; this.moundCap = 5;
    game.corpses = this.list;
    game.addCorpse = (x, z, team, ut) => this.add(x, z, team, ut);
    game.removeCorpse = (c) => this.remove(c);
    game.on('kill', (t) => { if (this.enabled && t.kind === 'unit' && t.def.kind !== 'spirit' && t.def.kind !== 'nav' && !t.story) setTimeout(() => this.add(t.x, t.z, t.team, t.ut), 7500); });
    makeProp('corpse').then((p) => { this.proto = p; for (const c of this.list) if (!c.obj) this.show(c); });
  }
  add(x, z, team, ut) {
    const c = { id: 900000 + this.list.length + Math.floor(Math.random() * 1e6), kind: 'corpse', x, z, y: heightAt(x, z), team: TEAM.NEUTRAL, of: team, ut, t: 0, radius: 1, dead: false, state: 'restless', name: 'The fallen', title: ut ? `A ${ut} of ${team === 0 ? 'the Rodina' : 'the rival Rodina'}` : '' };
    this.list.push(c); this.show(c);
    while (this.list.length > this.cap) this.remove(this.list[0]);
    return c;
  }
  show(c) { if (!this.proto || c.obj) return; c.obj = this.proto.clone(true); c.obj.position.set(c.x, c.y - 0.05, c.z); c.obj.rotation.y = Math.random() * 6.28; this.scene.add(c.obj); }
  remove(c) { const i = this.list.indexOf(c); if (i < 0) return; this.list.splice(i, 1); if (c.obj) this.scene.remove(c.obj); c.dead = true; this.game.selection = this.game.selection.filter((e) => e !== c); }
  async rise(c, from = 'corpse') {
    this.remove(c);
    this.fx.puff(c.x, c.y + 0.3, c.z, 18, [0.3, 0.25, 0.35], 1.5, 0.7, 1.6);
    const u = await this.game.spawnUnit('upir', TEAM.NEUTRAL, c.x, c.z, Math.random() * 6.28);
    u.home = [c.x, c.z]; u.rose = from;
    if (this.game.cellVisible(c.x, c.z)) sfx('spirit', 0.5);
    this.game.emit('rose', u, from);
    return u;
  }
  update(dt) {
    const g = this.game, night = this.daynight?.isNight;
    for (const c of this.list) { c.t += dt; if (c.obj) c.obj.visible = g.cellSeen(c.x, c.z); }
    if (!night || !this.rising) return;
    for (let i = this.list.length - 1; i >= 0; i--) {
      const c = this.list[i];
      if (c.t < 6 || (g.systems?.inWard(c.x, c.z))) continue;
      if (Math.random() < this.riseChance * dt * (this.daynight.darkness + 0.2)) this.rise(c);
    }
    for (const m of g.sites) {
      if (m.st !== 'mound' || m.state === 'consecrated') continue;
      m.moundT = (m.moundT ?? this.moundEvery * 0.4) - dt;
      if (m.moundT > 0) continue;
      m.moundT = this.moundEvery / (m.strength || 1);
      const near = g.alive(TEAM.NEUTRAL, (u) => u.ut === 'upir' && Math.hypot(u.x - m.x, u.z - m.z) < 40).length;
      if (near >= this.moundCap) continue;
      const a = Math.random() * 6.28, x = m.x + Math.cos(a) * 2.5, z = m.z + Math.sin(a) * 2.5;
      this.fx.puff(x, heightAt(x, z) + 0.3, z, 18, [0.3, 0.25, 0.35], 1.5, 0.7, 1.6);
      g.spawnUnit('upir', TEAM.NEUTRAL, x, z, a).then((u) => { u.home = [m.x, m.z]; u.rose = 'mound'; g.emit('rose', u, 'mound'); });
      if (g.cellVisible(m.x, m.z)) sfx('spirit', 0.4);
    }
  }
  overlays(fx, sel) { for (const c of this.list) if (sel.has(c)) fx.ring(c.x, c.y, c.z, 1.2, 0xc8c0ff); }
}
