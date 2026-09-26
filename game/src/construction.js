/**
 * Raise construction (blueprint §5). Rodina does not hammer buildings together: a ritualist
 * plants a Founding Stake, dances or chants, and the land raises the structure. The building's
 * own model is split into its parts (a hierarchy load instead of the merged one), sorted from
 * the ground up, and revealed in order as the rite progresses: stones push up from below, timber
 * and thatch arrive from above on the wind, each settling with a small drop. When the rite is
 * done the parts are swapped for the cheap merged model and a blessing pulse closes it.
 */
import * as THREE from 'three';
import { ASSET } from '../assetlib.js';
import { makeProp } from './models.js';
import { BUILDINGS, TEAM_COLOR, TEAM_HEX_IN_ASSETS } from './config.js';
import { heightAt } from './terrain.js';

const teamMats = new Map();   // material uuid|team -> clone in the clan colour
let stakeProto = null;

async function partsFor(b) {
  const inst = await ASSET(`./assets/${b.def.asset}.js`, { keepHierarchy: true });
  inst.updateMatrixWorld(true);
  const parts = [];
  const box = new THREE.Box3(), c = new THREE.Vector3();
  inst.traverse((o) => {
    if (!o.isMesh) return;
    let m = o.material;
    if (m && m.color && m.color.getHex() === TEAM_HEX_IN_ASSETS && b.team !== 0) {
      const k = m.uuid + '|' + b.team;
      if (!teamMats.has(k)) { const t = m.clone(); t.color.setHex(TEAM_COLOR[b.team]); teamMats.set(k, t); }
      o.material = teamMats.get(k);
    }
    o.castShadow = true; o.receiveShadow = true;
    box.setFromObject(o); box.getCenter(c);
    // stone and earth rise out of the ground; everything else is carried in on the wind
    const stone = /stone|water|glow/.test(o.material?.userData?.tex || '');
    parts.push({ mesh: o, y: c.y, from: stone ? -1.2 : 4 + Math.random() * 2 });
  });
  parts.sort((a, q) => a.y - q.y || Math.random() - 0.5);
  parts.forEach((p, i) => { p.at = (i + 0.5) / parts.length; p.mesh.visible = false; p.home = p.mesh.position.clone(); p.t = -1; });
  return { inst, parts };
}

export class Construction {
  constructor(scene, fx) { this.scene = scene; this.fx = fx; this.sites = new Map(); }

  /** Called when an unbuilt building is placed: plant the stake and prepare the parts. */
  async begin(b) {
    const s = { parts: null, stake: null, shown: 0, pulse: 0 };
    this.sites.set(b, s);
    if (!stakeProto) stakeProto = await makeProp('founding_stake');
    if (b.dead || b.built) return;
    s.stake = stakeProto.clone(true);
    s.stake.position.set(0, 0, 0);
    b.root.add(s.stake);
    const built = await partsFor(b);
    if (b.dead || b.built) { this.end(b); return; }
    s.parts = built.parts; s.inst = built.inst;
    b.root.add(built.inst);
    if (b.model) b.model.visible = false;
    this.update(b, 0);
  }

  update(b, dt) {
    const s = this.sites.get(b); if (!s || !s.parts) return;
    const want = Math.min(s.parts.length, Math.floor(b.progress * s.parts.length + 1e-6));
    while (s.shown < want) { const p = s.parts[s.shown++]; p.mesh.visible = true; p.t = 0; p.spin = (Math.random() - 0.5) * 0.6; }
    for (const p of s.parts) {
      if (p.t < 0 || p.t >= 1) continue;
      p.t = Math.min(1, p.t + dt / 0.7);
      const e = 1 - Math.pow(1 - p.t, 3);
      p.mesh.position.set(p.home.x + (1 - e) * p.spin, p.home.y + (1 - e) * p.from, p.home.z + (1 - e) * p.spin * 0.7);
      p.mesh.scale.setScalar(0.4 + 0.6 * e);
    }
    // materials on the way: motes converging on the site
    if (b.progress > 0 && b.progress < 1 && Math.random() < dt * 6) {
      const a = Math.random() * Math.PI * 2, r = b.def.size * 0.9 + 6 + Math.random() * 6;
      const x = b.x + Math.cos(a) * r, z = b.z + Math.sin(a) * r, y = heightAt(x, z) + 0.5 + Math.random() * 3;
      const zh = b.def.builtBy[0] === 'zherca';
      this.fx.glow.emit(x, y, z, -Math.cos(a) * 5, zh ? 0.2 : 1.2, -Math.sin(a) * 5, r / 5, zh ? 0.5 : 0.35, zh ? 0.55 : 0.9, zh ? 0.8 : 0.85, zh ? 1.0 : 0.6, 0.85);
      if (Math.random() < 0.3) this.fx.dust.emit(x, y * 0.5 + heightAt(x, z) * 0.5, z, -Math.cos(a) * 4, 0.8, -Math.sin(a) * 4, r / 4, 1.2, 0.45, 0.38, 0.28, 0.5);
    }
  }

  /** The rite is complete: swap to the merged model, bless. */
  end(b) {
    const s = this.sites.get(b); if (!s) return;
    if (s.inst) b.root.remove(s.inst);
    if (s.stake) b.root.remove(s.stake);
    if (b.model) { b.model.visible = true; b.model.scale.set(1, 1, 1); }
    this.sites.delete(b);
    if (!b.dead) {
      const zh = b.def.builtBy[0] === 'zherca', y = heightAt(b.x, b.z);
      for (let i = 0; i < 40; i++) { const a = Math.random() * 6.28, r = Math.random() * b.def.size * 0.7; this.fx.glow.emit(b.x + Math.cos(a) * r, y + 0.5 + Math.random() * b.def.height, b.z + Math.sin(a) * r, Math.cos(a) * 2, 1.5, Math.sin(a) * 2, 1.6, 0.5, zh ? 0.55 : 0.75, zh ? 0.85 : 0.95, zh ? 1.0 : 0.7, 0.9); }
      this.fx.puff(b.x, y + 0.5, b.z, 14, [0.62, 0.55, 0.42], b.def.size * 0.8, 0.5, 2);
    }
  }

  /** Building died or was cancelled while rising. */
  abort(b) { const s = this.sites.get(b); if (!s) return; if (s.inst) b.root.remove(s.inst); if (s.stake) b.root.remove(s.stake); this.sites.delete(b); }
}
