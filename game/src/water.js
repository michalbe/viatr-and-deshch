/**
 * Rising water (blueprint §29, §37). One level for the whole map: the water sheet lifts, ground
 * below the walk line becomes impassable, and anyone standing there is pushed to the nearest dry
 * cell. The mission drives it through stages: LOW → RISING → HIGH → FALLING → LOW.
 */
import { setWalkLevel, heightAt, cellOf, cellCenter, WALK_MIN, WATER_Y } from './terrain.js';
import { nearestFree } from './path.js';
import { sfx } from './audio.js';

export class Water {
  constructor({ game, terrain, fx, rate = 0.12, high = 1.0 }) {
    this.game = game; this.terrain = terrain; this.fx = fx;
    this.level = 0; this.target = 0; this.rate = rate; this.high = high;
    this.stage = 'low'; this.applied = -1; this.applyT = 0; this.holdT = 0;
    this.onStage = null;
  }
  /** rise to HIGH, hold for `hold` seconds, then fall on its own */
  rise(hold = 60) { this.setStage('rising'); this.target = this.high; this.holdT = hold; }
  fall() { this.setStage('falling'); this.target = 0; }
  setStage(s) { if (s === this.stage) return; this.stage = s; this.game.emit('water', s, this); this.onStage?.(s); }
  update(dt) {
    if (this.level !== this.target) {
      const d = this.target - this.level, step = Math.sign(d) * Math.min(Math.abs(d), this.rate * dt);
      this.level += step;
      if (Math.abs(this.target - this.level) < 1e-4) { this.level = this.target; this.setStage(this.level > 0 ? 'high' : 'low'); }
    } else if (this.stage === 'high') { this.holdT -= dt; if (this.holdT <= 0) this.fall(); }
    this.applyT -= dt;
    if (this.applyT <= 0 && Math.abs(this.level - this.applied) > 0.02) { this.applyT = 0.35; this.apply(); }
  }
  apply() {
    this.applied = this.level;
    setWalkLevel(WALK_MIN + this.level);
    if (this.terrain?.water) this.terrain.water.position.y = WATER_Y + this.level;
    const line = WALK_MIN + this.level;
    for (const u of this.game.units) {
      if (u.dead || heightAt(u.x, u.z) >= line) continue;
      if (u.def.brain === 'vodnik' || u.def.brain === 'rusalka') continue;         // the water is theirs
      const [i, j] = nearestFree(...cellOf(u.x, u.z)); [u.x, u.z] = cellCenter(i, j); u.path = null;
      if (Math.random() < 0.3) this.fx.puff(u.x, u.y + 0.3, u.z, 6, [0.4, 0.6, 0.8], 1, 0.4, 1);
    }
    for (const b of this.game.buildings) if (!b.dead && b.team !== 2 && heightAt(b.x, b.z) < line - 0.2 && !b.drowned) { b.drowned = true; this.game.damage(b, b.maxHp * 0.6, null); }
  }
  /** is this ground under water right now? */
  wet(x, z) { return heightAt(x, z) < WALK_MIN + this.level; }
  serialize() { return { level: this.level, target: this.target, stage: this.stage, holdT: this.holdT }; }
  restore(d) { this.level = d.level; this.target = d.target; this.stage = d.stage; this.holdT = d.holdT; this.applied = -1; this.applyT = 0; }
}
