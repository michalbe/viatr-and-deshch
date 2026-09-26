/**
 * Procedural animation on the asset joints. Every pose is rest + delta, so an asset whose
 * joints have a non-zero rest rotation still animates correctly.
 *
 * Axis conventions (STYLE.md): character faces +Z, character's LEFT is +X.
 *  shoulder.x < 0 swings the arm forward/up; lShoulder.z > 0 / rShoulder.z < 0 raise sideways.
 *  hip.x < 0 swings the thigh forward; knee.x > 0 bends the shin back; elbow.x < 0 bends forward.
 */
import * as THREE from 'three';
const sin = Math.sin, cos = Math.cos, max = Math.max, PI = Math.PI;

function setJ(u, name, x = 0, y = 0, z = 0) {
  const j = u.model.joints[name]; if (!j) return;
  const r = u.model.rest[name].rot;
  j.rotation.set(r.x + x, r.y + y, r.z + z);
}
function offJ(u, name, dy = 0, dz = 0) {
  const j = u.model.joints[name]; if (!j) return;
  const p = u.model.rest[name].pos;
  j.position.set(p.x, p.y + dy, p.z + dz);
}
const ease = (t) => t * t * (3 - 2 * t);

/** 0..1 swing curve for an attack that started `t` seconds ago over `dur` seconds */
function swing(t, dur) { const k = t / dur; if (k <= 0 || k >= 1) return 0; return k < 0.45 ? ease(k / 0.45) : 1 - ease((k - 0.45) / 0.55); }

/**
 * Gaits: how each kind of body walks. stride = hip swing, lift = knee lift, arms = arm swing,
 * bob = hip bounce, lean = forward lean, sway = spine roll, rate = cadence per unit speed,
 * crouch = standing hip drop, and a few flags for the odd ones.
 */
const GAITS = {
  default:  { stride: 0.55, lift: 0.8, arms: 0.45, bob: 0.04, lean: 0.06, sway: 0.06, rate: 6.2 },
  vietra:   { stride: 0.5, lift: 0.7, arms: 0.3, bob: 0.03, lean: -0.04, sway: 0.12, rate: 6.6, hipSway: 0.14, armOut: 0.3 },       // light, upright, hips swinging, arms held out a little
  zherca:   { stride: 0.42, lift: 0.55, arms: 0.2, bob: 0.02, lean: 0.1, sway: 0.03, rate: 5.4, staff: 'r' },                        // a measured priest's stride, staff hand steady
  baba:     { stride: 0.34, lift: 0.5, arms: 0.15, bob: 0.02, lean: 0.3, sway: 0.05, rate: 6.8, staff: 'r', crouch: 0.05, headDown: 0.2 },   // hunched, short quick steps on a stick
  streletz: { stride: 0.55, lift: 0.8, arms: 0.45, bob: 0.035, lean: 0.08, sway: 0.05, rate: 6.4, bow: true },
  vitez:    { stride: 0.48, lift: 0.7, arms: 0.15, bob: 0.07, lean: 0.14, sway: 0.1, rate: 5.2, stomp: true },                        // heavy: slow cadence, deep bounce, shoulders rolling
  spirit:   { stride: 0.4, lift: 0.5, arms: 0.25, bob: 0.06, lean: 0.12, sway: 0.14, rate: 4.2, stomp: true },                        // the Leshy lumbers
  leshonok: { stride: 0.7, lift: 1.1, arms: 0.6, bob: 0.09, lean: 0.25, sway: 0.08, rate: 9, scamper: true },                         // a bounding scamper, arms flailing
  upir:     { stride: 0.32, lift: 0.2, arms: 0.1, bob: 0.01, lean: 0.22, sway: 0.16, rate: 5.5, shamble: true, headDown: -0.15 },     // one leg drags, arms hang, head lolls
  upir_drowned: { stride: 0.28, lift: 0.15, arms: 0.08, bob: 0.01, lean: 0.28, sway: 0.2, rate: 5.2, shamble: true, headDown: -0.1 },
  striga:   { stride: 0.75, lift: 1.0, arms: 0.2, bob: 0.05, lean: 0.55, sway: 0.06, rate: 8.5, prowl: true, crouch: 0.14 },          // a crouched predator's lope, claws forward
  vodnik:   { stride: 0.0, lift: 0.0, arms: 0.2, bob: 0.12, lean: 0.1, sway: 0.0, rate: 5.0, hop: true },                             // squat hops
  vila:     { stride: 0.0, lift: 0.0, arms: 0.0, bob: 0.0, lean: -0.05, sway: 0.1, rate: 2.0, float: true },                          // never touches the ground
  rusalka:  { stride: 0.0, lift: 0.0, arms: 0.0, bob: 0.0, lean: 0.0, sway: 0.08, rate: 2.0, float: true },
  ognik:    { stride: 0.0, lift: 0.0, arms: 0.0, bob: 0.0, lean: 0.0, sway: 0.0, rate: 3.0, float: true },
};
const gaitOf = (u) => GAITS[u.ut] || GAITS.default;

/** a fidget window: returns [which, k] where k rises 0→1→0 over ~1.6 s, every 6–10 s, seeded per unit */
function fidget(u) {
  const period = 6 + (u.id % 5), t = (u.anim.t + u.id * 1.7) % period;
  if (t > 1.6) return [Math.floor((u.anim.t + u.id * 1.7) / period + u.id) % 3, 0];
  const k = t < 0.8 ? ease(t / 0.8) : 1 - ease((t - 0.8) / 0.8);
  return [Math.floor((u.anim.t + u.id * 1.7) / period + u.id) % 3, k];
}

function humanoid(u, dt, pre = '') {
  const a = u.anim, s = u.def.height, G = gaitOf(u);
  const J = (n) => pre + n;
  const set = (n, x, y, z) => setJ(u, J(n), x, y, z);
  const t = a.t;
  // defaults: everything to rest
  for (const n of ['hips', 'spine', 'head', 'lShoulder', 'lElbow', 'rShoulder', 'rElbow', 'lHip', 'lKnee', 'rHip', 'rKnee']) set(n, 0, 0, 0);
  offJ(u, J('hips'), 0, 0);
  const mode = a.mode;
  const stand = (extraLean = 0) => { if (G.crouch) { offJ(u, J('hips'), -G.crouch * s); set('lHip', -0.35); set('rHip', -0.35); set('lKnee', 0.6); set('rKnee', 0.6); } set('spine', G.lean * 0.5 + extraLean); set('head', -(G.lean * 0.5 + extraLean) * 0.7 + (G.headDown || 0)); };
  if (mode === 'walk') {
    a.phase += dt * u.speedNow * (G.rate / max(1.2, s));
    const p = a.phase;
    if (G.float) {
      // gliding: the body drifts forward and bobs, the gown trails, arms drift
      const b = t * 2.2 + u.id;
      offJ(u, J('hips'), 0.12 * s * 0.3 + sin(b) * 0.03 * s);
      set('spine', G.lean, 0, sin(b * 0.5) * G.sway); set('head', -0.1, sin(b * 0.3) * 0.2, 0);
      set('lShoulder', -0.3 + sin(b) * 0.1, 0, 0.5 + sin(b * 0.7) * 0.15); set('rShoulder', -0.3 - sin(b) * 0.1, 0, -0.5 - sin(b * 0.7 + 1) * 0.15);
      set('lElbow', -0.6); set('rElbow', -0.6);
      set('lHip', 0.25); set('rHip', 0.15); set('lKnee', 0.2); set('rKnee', 0.35);
      return;
    }
    if (G.hop) {
      // the Vodnik: both legs together, a squat and a spring
      const h = max(0, sin(p)), c = max(0, -sin(p));
      offJ(u, J('hips'), (h * 0.14 - c * 0.06) * s);
      set('lHip', -0.9 + h * 0.5); set('rHip', -0.9 + h * 0.5); set('lKnee', 1.6 - h * 0.9); set('rKnee', 1.6 - h * 0.9);
      set('spine', 0.35 - h * 0.3); set('head', -0.3 + h * 0.2);
      set('lShoulder', -0.5 + h * 0.6, 0, 0.5); set('rShoulder', -0.5 + h * 0.6, 0, -0.5); set('lElbow', -0.7); set('rElbow', -0.7);
      return;
    }
    const sw = G.stride;
    if (G.shamble) {
      // one good leg, one dragged: the good leg steps, the bad one swings stiff and late
      set('lHip', -sin(p) * sw * 1.3); set('lKnee', max(0, sin(p + 1.4)) * 0.9);
      set('rHip', sin(p) * sw * 0.5 + 0.15); set('rKnee', 0.05);
      offJ(u, J('hips'), (Math.abs(sin(p)) * 0.02 - 0.03) * s);
      set('spine', G.lean + sin(p * 0.5) * 0.06, sin(p) * 0.1, sin(p) * G.sway); set('head', G.headDown + sin(p * 0.5) * 0.1, sin(p * 0.37) * 0.25, 0.25);
      set('lShoulder', -0.9 + sin(p) * G.arms, 0, 0.15); set('rShoulder', -0.6 - sin(p) * G.arms, 0, -0.35); set('lElbow', -0.3); set('rElbow', -0.9);
      return;
    }
    set('lHip', -sin(p) * sw); set('rHip', sin(p) * sw);
    set('lKnee', max(0, sin(p + 1.4)) * G.lift); set('rKnee', max(0, -sin(p + 1.4)) * G.lift);
    if (G.crouch) { offJ(u, J('hips'), -G.crouch * s); set('lHip', -0.3 - sin(p) * sw); set('rHip', -0.3 + sin(p) * sw); set('lKnee', 0.5 + max(0, sin(p + 1.4)) * G.lift); set('rKnee', 0.5 + max(0, -sin(p + 1.4)) * G.lift); }
    if (G.bow) { set('lShoulder', 0.1, 0, 0.05); set('lElbow', 0); set('rShoulder', -sin(p) * G.arms, 0, -0.08); set('rElbow', -0.35); }   // the bow arm stays put
    else if (G.staff) { const st = G.staff === 'r'; set(st ? 'rShoulder' : 'lShoulder', -0.25, 0, st ? -0.1 : 0.1); set(st ? 'rElbow' : 'lElbow', -0.5); set(st ? 'lShoulder' : 'rShoulder', sin(p) * G.arms, 0, st ? 0.1 : -0.1); set(st ? 'lElbow' : 'rElbow', -0.3); }
    else if (G.prowl) { set('lShoulder', -1.3 + sin(p) * G.arms, 0, 0.3); set('rShoulder', -1.3 - sin(p) * G.arms, 0, -0.3); set('lElbow', -1.0); set('rElbow', -1.0); }   // claws up and forward
    else if (G.stomp) { set('lShoulder', sin(p) * G.arms, 0, 0.12 + sin(p) * 0.05); set('rShoulder', -sin(p) * G.arms, 0, -0.12 + sin(p) * 0.05); }
    else { set('lShoulder', sin(p) * G.arms, 0, 0.08 + (G.armOut || 0)); set('rShoulder', -sin(p) * G.arms, 0, -0.08 - (G.armOut || 0)); set('lElbow', -0.35); set('rElbow', -0.35); }
    const bob = G.scamper ? max(0, sin(p * 2)) * G.bob : Math.abs(sin(p)) * G.bob;
    offJ(u, J('hips'), (G.crouch ? -G.crouch * s : 0) + bob * s);
    set('spine', G.lean + (G.scamper ? sin(p * 2) * 0.08 : 0), sin(p) * (G.hipSway ? 0.03 : 0.06), sin(p) * G.sway);
    set('hips', 0, 0, G.hipSway ? sin(p) * G.hipSway : 0);
    set('head', -G.lean * 0.6 + (G.headDown || 0), G.hipSway ? -sin(p) * 0.05 : 0, -sin(p) * G.sway * 0.5);
  } else if (mode === 'dance') {
    // Wind Dance: arms raised, slow spin (done on the instance), stamping feet, swaying hips
    const b = t * 3.1;
    set('lShoulder', -0.25 + sin(b) * 0.25, 0, 2.3 + sin(b * 0.5) * 0.35);
    set('rShoulder', -0.25 - sin(b) * 0.25, 0, -2.3 - sin(b * 0.5 + 1.3) * 0.35);
    set('lElbow', -0.5 - sin(b) * 0.3); set('rElbow', -0.5 + sin(b) * 0.3);
    const st = max(0, sin(b * 1.0)), st2 = max(0, -sin(b * 1.0));
    set('lHip', -st * 0.7); set('lKnee', st * 1.1);
    set('rHip', -st2 * 0.7); set('rKnee', st2 * 1.1);
    offJ(u, J('hips'), -Math.abs(sin(b)) * 0.07 * s + (G.float ? 0.1 * s : 0));
    set('spine', -0.12, 0, sin(b * 0.5) * 0.18);
    set('head', -0.25, 0, sin(b * 0.5) * 0.15);
  } else if (mode === 'rite') {
    // Rain Rite: kneel, raise the vessel to the sky, pour, strike the ground with the staff
    const cyc = (t % 6) / 6;
    offJ(u, J('hips'), -0.13 * s);                  // a half-kneel: the robe reaches the ground already
    set('lHip', -1.0); set('lKnee', 1.5);           // left knee up, foot planted
    set('rHip', 0.1); set('rKnee', 1.2);            // right knee down
    const raise = cyc < 0.5 ? ease(cyc / 0.5) : 1 - ease((cyc - 0.5) / 0.5);
    set('lShoulder', -0.6 - raise * 2.1, 0, 0.25); set('lElbow', -0.4 + raise * 0.2);
    const strike = swing((t % 3) , 0.7);
    set('rShoulder', -0.5 - strike * 1.1, 0, -0.15); set('rElbow', -0.6 + strike * 0.5);
    set('spine', 0.2 - raise * 0.35);
    set('head', -raise * 0.45);
  } else if (mode === 'build') {
    const k = (t * 2.4) % 1;
    const h = k < 0.6 ? ease(k / 0.6) : 1 - ease((k - 0.6) / 0.4);
    set('rShoulder', -2.3 + h * 2.1); set('rElbow', -0.6 + h * 0.4);
    set('lShoulder', -0.8); set('lElbow', -0.9);
    set('spine', 0.35); set('lHip', -0.5); set('lKnee', 0.7); set('rHip', 0.2); set('rKnee', 0.3);
    offJ(u, J('hips'), -0.08 * s);
  } else if (mode === 'attack') {
    const k = swing(a.attackT, a.attackDur);
    if (u.def.ranged) {
      set('lShoulder', -1.1, 0, 0.1); set('lElbow', 0.6);
      const draw = a.attackT < a.attackDur * 0.8 ? ease(Math.min(1, a.attackT / (a.attackDur * 0.6))) : 0;
      set('rShoulder', -1.45, 0, -0.1 * draw); set('rElbow', -1.3 * draw - 0.3);
      set('spine', 0, -0.35, 0); set('head', 0, 0.3, 0);
      set('lHip', -0.2); set('rHip', 0.2);
    } else if (u.ut === 'spirit') {
      set('lShoulder', -2.6 + k * 2.4); set('rShoulder', -2.6 + k * 2.4);
      set('lElbow', -0.4); set('rElbow', -0.4); set('spine', -0.2 + k * 0.6);
    } else if (G.float) {
      // the dance that kills: a whirl, arms flung wide, then drawn in
      offJ(u, J('hips'), 0.1 * s + k * 0.08 * s);
      set('lShoulder', -0.6 - k * 0.8, 0, 0.6 + k * 1.6); set('rShoulder', -0.6 - k * 0.8, 0, -0.6 - k * 1.6);
      set('lElbow', -0.4 + k * 0.3); set('rElbow', -0.4 + k * 0.3); set('spine', -0.2 * k, k * 1.5, 0); set('head', -0.3 * k);
    } else if (G.prowl || G.scamper) {
      // a lunge and a rake with both claws
      set('lShoulder', -2.4 + k * 2.6, 0, 0.5 - k * 0.3); set('rShoulder', -2.4 + k * 2.6, 0, -0.5 + k * 0.3);
      set('lElbow', -0.8 + k * 0.5); set('rElbow', -0.8 + k * 0.5); set('spine', 0.1 + k * 0.5); set('head', -0.3 + k * 0.2);
      set('lHip', -0.6 - k * 0.3); set('lKnee', 0.8); set('rHip', 0.3); set('rKnee', 0.3); offJ(u, J('hips'), -0.1 * s);
    } else if (G.shamble) {
      // both arms up and down like a club, the whole body behind it
      set('lShoulder', -2.4 + k * 2.2, 0, 0.3); set('rShoulder', -2.4 + k * 2.2, 0, -0.3); set('lElbow', -0.6); set('rElbow', -0.6);
      set('spine', -0.15 + k * 0.6); set('head', 0.2 - k * 0.3); set('lHip', -0.3); set('rHip', 0.2);
    } else if (G.hop) {
      // a grab: squat, then both webbed hands shoot forward
      offJ(u, J('hips'), -0.08 * s + k * 0.1 * s);
      set('lHip', -0.9); set('rHip', -0.9); set('lKnee', 1.5); set('rKnee', 1.5);
      set('lShoulder', -0.3 - k * 1.5, 0, 0.6 - k * 0.5); set('rShoulder', -0.3 - k * 1.5, 0, -0.6 + k * 0.5); set('lElbow', -0.9 + k * 0.8); set('rElbow', -0.9 + k * 0.8);
      set('spine', 0.4 - k * 0.2); set('head', -0.35 + k * 0.2);
    } else {
      set('rShoulder', -2.7 + k * 3.1, 0, -0.2); set('rElbow', -0.9 + k * 0.8);
      set('lShoulder', -0.4, 0, 0.3); set('lElbow', -0.3);
      set('spine', -0.1 + k * 0.35, 0.4 - k * 0.8, 0);
      set('lHip', -0.45); set('lKnee', 0.4); set('rHip', 0.3);
    }
  } else {
    // idle: breathing, a slow weight shift, and now and then a fidget that belongs to the body
    const b = t * 1.6 + u.id, [which, k] = fidget(u);
    stand();
    if (G.float) {
      const f = t * 1.8 + u.id;
      offJ(u, J('hips'), 0.12 * s * 0.3 + sin(f) * 0.04 * s);
      set('spine', G.lean, sin(f * 0.3) * 0.2, sin(f * 0.5) * G.sway); set('head', -0.05 + sin(f * 0.7) * 0.05, sin(f * 0.23) * 0.4, 0);
      set('lShoulder', -0.2 + sin(f * 0.9) * 0.15, 0, 0.35 + k * 0.9); set('rShoulder', -0.2 - sin(f * 0.9) * 0.15, 0, -0.35 - k * 0.9);
      set('lElbow', -0.7 + k * 0.4); set('rElbow', -0.7 + k * 0.4);
      set('lHip', 0.2); set('rHip', 0.1); set('lKnee', 0.25); set('rKnee', 0.4);
      return;
    }
    if (G.hop) {
      offJ(u, J('hips'), -0.06 * s + Math.abs(sin(b * 0.8)) * 0.02 * s);
      set('lHip', -0.9, 0, 0.3); set('rHip', -0.9, 0, -0.3); set('lKnee', 1.6); set('rKnee', 1.6);
      set('spine', 0.35 + sin(b) * 0.04); set('head', -0.3 + k * 0.2, sin(b * 0.4) * 0.5 * (1 - k), 0);
      set('lShoulder', -0.4 + k * 0.3, 0, 0.5); set('rShoulder', -0.4 + k * 0.3, 0, -0.5); set('lElbow', -0.8); set('rElbow', -0.8);
      // the throat sac swells: a slow bulge of the spine
      return;
    }
    set('spine', (G.lean || 0) * 0.5 + sin(b) * 0.03, 0, 0); set('head', (G.headDown || 0) + sin(b * 0.7) * 0.06, sin(b * 0.3) * 0.2, 0);
    set('lShoulder', 0.02, 0, 0.08 + sin(b) * 0.02); set('rShoulder', 0.02, 0, -0.08 - sin(b) * 0.02);
    set('lElbow', -0.2); set('rElbow', -0.25);
    if (G.bow) { set('lShoulder', -0.3, 0, 0.1); set('lElbow', -0.5); }
    if (G.staff) { set('rShoulder', -0.25, 0, -0.1); set('rElbow', -0.5); }
    if (G.stomp && u.ut === 'vitez') { set('rShoulder', -0.1, 0, -0.05); set('rElbow', -0.2); set('lShoulder', -0.15, 0, 0.1); set('lElbow', -0.3); }
    if (G.shamble) { set('spine', G.lean, sin(b * 0.4) * 0.1, sin(b * 0.6) * 0.1); set('head', G.headDown, sin(b * 0.5) * 0.4, 0.3 + sin(b * 1.7) * 0.05); set('lShoulder', -0.6, 0, 0.15); set('rShoulder', -0.4, 0, -0.35); set('lElbow', -0.3); set('rElbow', -0.9); set('rHip', 0.15); }
    if (G.prowl) { set('lShoulder', -1.1, 0, 0.35); set('rShoulder', -1.1, 0, -0.35); set('lElbow', -1.1); set('rElbow', -1.1); set('head', 0.1 + sin(b * 0.6) * 0.1, sin(b * 0.5) * 0.6, 0); }
    if (G.scamper) { offJ(u, J('hips'), Math.abs(sin(b * 2.5)) * 0.02 * s); set('head', sin(b * 1.3) * 0.15, sin(b * 0.9) * 0.6, sin(b * 0.7) * 0.2); }
    if (k <= 0) return;
    // the fidgets
    switch (u.ut) {
      case 'vitez': if (which === 0) { set('rShoulder', -0.6 * k, 0, -0.05); set('rElbow', -0.9 * k); }           // hefts the axe
        else if (which === 1) { set('spine', 0, 0.4 * k, 0); set('head', 0, 0.3 * k, 0); }                          // looks over the shoulder
        else { set('lShoulder', -0.15 + 0.3 * k, 0, 0.1 + 0.25 * k); set('lElbow', -0.3 - 0.6 * k); set('spine', 0.08 * k); } break;   // shifts the shield
      case 'streletz': if (which === 0) { set('rShoulder', -1.2 * k, 0, -0.1); set('rElbow', -1.4 * k); set('head', 0.2 * k); }   // checks the string
        else if (which === 1) { set('head', 0, 0.7 * k, 0); set('spine', 0, 0.2 * k, 0); }                          // scans the treeline
        else { set('lShoulder', -0.3 - 0.9 * k, 0, 0.1); set('lElbow', -0.5 + 0.3 * k); set('head', -0.3 * k); } break;   // raises the bow to squint along it
      case 'vietra': if (which === 0) { set('lShoulder', 0, 0, 0.08 + 0.9 * k); set('rShoulder', 0, 0, -0.08 - 0.9 * k); set('spine', 0, 0, 0.1 * k); }   // arms drift out, a half-remembered dance
        else if (which === 1) { set('hips', 0, 0, 0.12 * k); set('spine', 0, 0, -0.1 * k); set('head', 0, 0, 0.1 * k); }               // weight to one hip
        else { set('rShoulder', -1.6 * k, 0, -0.3 * k); set('rElbow', -1.8 * k); set('head', 0.15 * k, 0, -0.1 * k); } break;           // tucks hair behind the ear
      case 'zherca': if (which === 0) { set('head', 0.5 * k); set('spine', 0.1 * k); }                              // bows the head
        else if (which === 1) { set('lShoulder', -0.9 * k, 0, 0.2); set('lElbow', -1.3 * k); set('head', 0.3 * k); }   // looks into the bowl
        else { set('rShoulder', -0.25 - 0.4 * k, 0, -0.1); set('rElbow', -0.5 - 0.3 * k); set('spine', 0, -0.2 * k, 0); } break;        // taps the drum
      case 'baba': if (which === 0) { set('spine', 0.15 + 0.15 * k); set('head', 0.2 - 0.5 * k, 0.6 * k, 0); }      // peers up and round
        else if (which === 1) { set('rShoulder', -0.25 - 0.5 * k, 0, -0.1); set('rElbow', -0.5 - 0.6 * k); set('head', 0.3 * k); }    // leans on the stick
        else { set('lShoulder', -1.4 * k, 0, 0.15); set('lElbow', -1.9 * k); set('head', -0.2 * k); } break;          // sniffs the wind through her fingers
      case 'spirit': if (which === 0) { set('spine', -0.15 * k, 0.5 * k, 0); set('head', 0, 0.4 * k, 0); }         // turns to listen to the trees
        else if (which === 1) { set('lShoulder', -1.0 * k, 0, 0.6 * k); set('rShoulder', -1.0 * k, 0, -0.6 * k); set('spine', -0.2 * k); }   // stretches its boughs
        else { set('spine', 0.25 * k); set('head', 0.3 * k); } break;                                                 // bows, weary
      case 'leshonok': if (which === 0) { set('rShoulder', -2.6 * k, 0, -0.4 * k); set('rElbow', -2.2 * k); set('head', -0.2 * k, 0, 0.2 * k); }   // scratches its head
        else if (which === 1) { offJ(u, J('hips'), -0.12 * k * s); set('lHip', -0.8 * k); set('rHip', -0.8 * k); set('lKnee', 1.3 * k); set('rKnee', 1.3 * k); set('head', -0.2 * k); }   // squats to sniff
        else { set('spine', 0, 0.8 * k, 0); set('head', 0, 0.6 * k, 0); } break;                                     // whips round
      case 'upir': case 'upir_drowned': if (which === 0) { set('head', G.headDown - 0.3 * k, 0, 0.3 - 0.6 * k); }   // the head snaps to the other shoulder
        else if (which === 1) { set('lShoulder', -0.6 - 0.9 * k, 0, 0.15); set('lElbow', -0.3 - 0.5 * k); }         // reaches for nothing
        else { set('spine', G.lean + 0.2 * k, 0, 0); } break;                                                        // sags
      case 'striga': if (which === 0) { offJ(u, J('hips'), -(G.crouch + 0.1 * k) * s); set('lHip', -0.35 - 0.6 * k); set('rHip', -0.35 - 0.6 * k); set('lKnee', 0.6 + 0.8 * k); set('rKnee', 0.6 + 0.8 * k); }   // flattens to the ground
        else if (which === 1) { set('head', 0.1, 0, 0.5 * k); }                                                     // cocks its head
        else { set('lShoulder', -1.1 - 0.8 * k, 0, 0.35); set('lElbow', -1.1 + 0.6 * k); set('rShoulder', -1.1 - 0.8 * k, 0, -0.35); set('rElbow', -1.1 + 0.6 * k); } break;   // stretches the claws
      default: if (which === 0) set('head', 0, 0.6 * k, 0); else if (which === 1) set('spine', 0, 0, 0.1 * k); else { set('rShoulder', -0.5 * k); set('rElbow', -0.8 * k); }
    }
  }
}

function quadruped(u, dt) {
  const a = u.anim, s = u.def.height;
  const set = (n, x, y, z) => setJ(u, n, x, y, z);
  for (const n of ['body', 'neck', 'head', 'flLeg', 'frLeg', 'blLeg', 'brLeg', 'flKnee', 'frKnee', 'blKnee', 'brKnee']) set(n, 0, 0, 0);
  offJ(u, 'body', 0, 0);
  const t = a.t, mode = a.mode;
  if (mode === 'walk') {
    const fast = u.ut === 'deer';
    a.phase += dt * u.speedNow * (fast ? 1.6 : 2.6) / max(1, s * 0.6);
    const p = a.phase, sw = fast ? 0.75 : 0.5;
    if (fast) { // gallop: front pair, then back pair
      set('flLeg', sin(p) * sw); set('frLeg', sin(p + 0.5) * sw);
      set('blLeg', sin(p + PI) * sw); set('brLeg', sin(p + PI + 0.5) * sw);
      set('flKnee', max(0, -cos(p)) * 0.9); set('frKnee', max(0, -cos(p + 0.5)) * 0.9);
      set('body', sin(p * 1) * 0.08); offJ(u, 'body', Math.abs(sin(p)) * 0.12 * s * 0.4);
      set('neck', -sin(p) * 0.12); set('head', sin(p) * 0.1);
    } else {    // bear: heavy diagonal walk
      set('flLeg', sin(p) * sw); set('brLeg', sin(p) * sw);
      set('frLeg', -sin(p) * sw); set('blLeg', -sin(p) * sw);
      set('body', 0, 0, sin(p) * 0.06); offJ(u, 'body', Math.abs(cos(p)) * 0.04 * s);
      set('head', 0, sin(p) * 0.15, 0); set('neck', 0.05);
    }
  } else if (mode === 'attack') {
    const k = swing(a.attackT, a.attackDur);
    if (u.ut === 'bear') {
      set('body', -k * 0.55); set('flLeg', -k * 1.6); set('frLeg', -k * 1.2);
      set('blLeg', k * 0.45); set('brLeg', k * 0.45);
      set('neck', k * 0.3); set('head', k * 0.35);
    } else {
      set('neck', k * 0.5); set('head', k * 0.4); set('flLeg', -k * 0.5); set('body', -k * 0.12);
    }
  } else {
    const b = t * 1.3 + u.id, [which, k] = fidget(u);
    set('body', sin(b) * 0.015); set('neck', sin(b * 0.6) * 0.08); set('head', sin(b * 0.4) * 0.1, sin(b * 0.23) * 0.4, 0);
    if (k > 0) {
      if (u.ut === 'bear') { if (which === 0) { set('neck', -0.3 * k); set('head', -0.4 * k, 0.3 * k, 0); }                       // lifts its nose to the wind
        else if (which === 1) { set('head', 0, sin(b * 9) * 0.25 * k, 0); set('neck', 0.1 * k); }                                // shakes its head
        else { set('flLeg', -0.5 * k); set('flKnee', 0.6 * k); set('body', -0.04 * k); } }                                          // paws the ground
      else { if (which === 0) { set('neck', 0.5 * k); set('head', 0.3 * k); }                                                     // the deer grazes
        else if (which === 1) { set('frLeg', -0.4 * k); set('frKnee', 0.9 * k); }                                                 // stamps a forehoof
        else { set('head', 0, 0.9 * k, 0); set('neck', -0.1 * k); } }                                                             // ears to a sound
    }
  }
  if (u.ut === 'deer') {
    // the rider
    const rs = (n, x, y, z) => setJ(u, 'r_' + n, x, y, z);
    for (const n of ['hips', 'spine', 'head', 'lShoulder', 'lElbow', 'rShoulder', 'rElbow']) rs(n, 0, 0, 0);
    if (mode === 'attack') { const k = swing(a.attackT, a.attackDur); rs('rShoulder', -0.6 - k * 1.2); rs('rElbow', -1.2 + k * 1.1); rs('spine', 0, 0.3 - k * 0.6, 0); }
    else if (mode === 'walk') { rs('spine', 0.25); rs('rShoulder', -0.5); rs('rElbow', -0.8); rs('lShoulder', -0.6); rs('lElbow', -0.8); }
    else { rs('spine', sin(t * 1.2) * 0.04); rs('head', 0, sin(t * 0.4) * 0.4, 0); rs('rShoulder', -0.3); rs('rElbow', -0.6); }
  }
}

/* ------------------------------------------------------------------ rigged GLB characters */
function fadeTo(m, name, dur, oneShot = false) {
  const next = m.actions[name];
  if (!next) return null;
  if (m.cur === name && !oneShot) return next;
  const prev = m.cur ? m.actions[m.cur] : null;
  if (oneShot) { next.reset(); next.setLoop(THREE.LoopOnce, 1); next.clampWhenFinished = true; }
  else { next.setLoop(THREE.LoopRepeat, Infinity); next.clampWhenFinished = false; }
  next.enabled = true; next.setEffectiveTimeScale(next.timeScale || 1); next.setEffectiveWeight(1);
  if (prev && prev !== next) { next.play(); prev.crossFadeTo(next, dur, false); }
  else next.play();
  m.cur = name;
  return next;
}
function animateGltf(u, dt) {
  const m = u.model, a = u.anim;
  let mode = a.mode;
  if (mode === 'rest') { m.mixer.stopAllAction(); m.cur = null; m.inst.rotation.y = 0; return; }
  if (!m.actions[mode] && mode !== 'idle') mode = 'idle';
  if (mode === 'attack') {
    // every swing restarts the clip, stretched to the unit's cooldown-derived duration
    if (m.cur !== 'attack' || a.attackT < (m.lastAttackT ?? 0)) {
      const act = m.actions.attack; act.timeScale = act.getClip().duration / max(0.25, a.attackDur);
      fadeTo(m, 'attack', 0.06, true);
    }
    m.lastAttackT = a.attackT;
    if (a.attackT >= a.attackDur && !m.actions.attack.isRunning()) fadeTo(m, 'idle', 0.2);
  } else if (mode === 'walk') {
    const act = m.actions.walk; act.timeScale = max(0.25, u.speedNow / (u.def?.speed || 3));
    fadeTo(m, 'walk', 0.14);
  } else if (mode === 'idle') {
    const inFidget = m.cur && m.cur.startsWith('fidget');
    if (inFidget && !m.actions[m.cur].isRunning()) fadeTo(m, 'idle', 0.35);
    else if (!inFidget) fadeTo(m, 'idle', 0.25);
    if (m.cur === 'idle' && m.actions.fidget1) {
      m.fidgetT -= dt;
      if (m.fidgetT <= 0) { m.fidgetT = 5 + Math.random() * 7; fadeTo(m, 'fidget' + (1 + Math.floor(Math.random() * 3)), 0.3, true); }
    }
  } else fadeTo(m, mode, 0.2);
  m.mixer.update(dt);
  if (a.mode === 'dance') m.inst.rotation.y += dt * 1.25;
  else m.inst.rotation.y += (0 - m.inst.rotation.y) * Math.min(1, dt * 6);
}

/** called every frame for every living unit */
export function animate(u, dt) {
  const a = u.anim;
  if (u.model.gltf) { a.t += dt; if (a.attackT < a.attackDur) a.attackT += dt; return animateGltf(u, dt); }
  a.t += dt;
  if (a.attackT < a.attackDur) a.attackT += dt;
  const inst = u.model.inst, r = u.model.rest.__inst;
  if (a.mode === 'dance') inst.rotation.y += dt * 1.25;
  else inst.rotation.y += (0 - inst.rotation.y) * Math.min(1, dt * 6);
  if (u.model.joints.hips) humanoid(u, dt);
  else if (u.model.joints.body) quadruped(u, dt);
  inst.position.y = r.pos.y;
}

/** death: fall over and sink */
export function animateDeath(u, dt) {
  const inst = u.model.inst;
  u.deadT += dt;
  if (u.model.gltf) {
    const m = u.model;
    if (m.cur !== 'death') { if (m.actions.death) fadeTo(m, 'death', 0.1, true); else { m.mixer.stopAllAction(); m.cur = 'death'; } }
    m.mixer.update(dt);
    if (u.deadT > 4) inst.position.y -= dt * 0.35;
    return;
  }
  const k = Math.min(1, u.deadT / 0.7);
  inst.rotation.x = -ease(k) * PI / 2 * (u.model.joints.body ? 0 : 1);
  inst.rotation.z = u.model.joints.body ? ease(k) * PI / 2 : 0;
  if (u.deadT > 4) inst.position.y -= dt * 0.35;
}
