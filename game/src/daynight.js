/**
 * Day and night (blueprint §37). A clock in hours that the rig follows: the sun sets, the fill
 * goes cool, the ground darkens, human sight shrinks, and the mission gets `sunset` and `dawn`
 * events to hang rules on (corpses rise, night things hunt). Nothing here decides gameplay by
 * itself beyond sight; the corpse system and the enemy brains read `isNight`.
 */
import { setGroundLight } from './terrain.js';

export class DayNight {
  constructor({ rig, game, hour = 9, secondsPerHour = 15 }) {
    this.rig = rig; this.game = game;
    this.hour = hour; this.sph = secondsPerHour;
    this.running = true; this.applyT = 0; this.wasNight = this.isNight;
    this.apply(true);
  }
  get isNight() { return this.hour < 5.5 || this.hour >= 19.5; }
  get dusk() { return this.hour >= 17.5 && this.hour < 19.5; }
  /** 0 at noon, 1 deep night; drives sight and the night things' strength */
  get darkness() { const h = this.hour; const d = h < 12 ? h : 24 - h; return 1 - Math.min(1, Math.max(0, (d - 4.5) / 3)); }
  get sightScale() { return 1 - 0.4 * this.darkness; }
  setHour(h) { this.hour = ((h % 24) + 24) % 24; this.apply(true); }
  apply(force = false) {
    // the rig rebuilds its sky and fill on every setTime, so it is called on a slow beat, not per frame
    this.applyT -= 0;
    const h = this.hour;
    // the sun stays a hand above the horizon through the night: a moon's worth of cool light, so units read
    this.rig.setTime({ hour: h, elevation: this.isNight ? 3 + 3 * (1 - this.darkness) : undefined });
    setGroundLight(0.48 + 0.52 * (1 - this.darkness));
    this.game.fogT = 0;
  }
  update(dt) {
    if (!this.running) return;
    this.hour = (this.hour + dt / this.sph) % 24;
    this.applyT -= dt;
    if (this.applyT <= 0) { this.applyT = 1.5; this.apply(); }
    const night = this.isNight;
    if (night !== this.wasNight) { this.wasNight = night; this.game.emit(night ? 'sunset' : 'dawn', this.hour); }
  }
  clock() { const h = Math.floor(this.hour), m = Math.floor((this.hour - h) * 60); return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`; }
  serialize() { return { hour: this.hour, sph: this.sph, running: this.running }; }
  restore(d) { this.hour = d.hour; this.sph = d.sph; this.running = d.running; this.wasNight = this.isNight; this.apply(true); }
}
