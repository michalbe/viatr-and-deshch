// Upir, the revenant. Painted build: a gaunt, grey-green corpse in a torn linen shroud, arms
// too long, jaw hanging, sunken eyes lit with a dull glow. Humanoid joints so the shared walk
// and attack drive it; the walk reads as a shamble because the rest pose stoops.
import { createPainter } from '../paint.js';
import { createKit } from '../charkit.js';

export default function (THREE, opts = {}) {
  const P = createPainter(THREE, 512, opts.seed || 131);
  const R = P.region;
  const SKIN = opts.skin || 0x7f8b72, HAIR = 0x2a2420, SHROUD = opts.shroud || 0x9a927c, GLOW = opts.glow || 0xc8ffd0, EARTH = 0x3a2e22;
  R('head', 0, 0, 256, 128, (c, w, h) => {
    P.face(w, h, { base: SKIN, hairCol: HAIR, eye: 0x101010, eyeY: 0.46, mouthY: 0.72, eyeGap: 0.085, eyeW: 0.05, stern: 1, hairTop: 1, nose: 0 });
    // hollow the sockets, blacken the mouth, stain the skin with earth
    for (const sg of [-1, 1]) { c.fillStyle = 'rgba(10,10,12,0.85)'; c.beginPath(); c.ellipse(w * 0.5 + sg * w * 0.085, h * 0.47, w * 0.05, h * 0.06, 0, 0, Math.PI * 2); c.fill(); P.glow(w * 0.5 + sg * w * 0.085, h * 0.47, w * 0.03, '200,255,208', 0.9); }
    c.fillStyle = 'rgba(8,6,6,0.85)'; c.beginPath(); c.ellipse(w * 0.5, h * 0.78, w * 0.06, h * 0.07, 0, 0, Math.PI * 2); c.fill();
    P.strokes(w, h, { n: 120, len: 8, width: 3, angle: 0.5, jitter: 2, cols: [P.tone(EARTH, 0, 0.35), P.tone(SKIN, -0.4, 0.4)] });
  });
  R('body', 256, 0, 256, 128, (c, w, h) => { P.cloth(w, h, { base: SHROUD, folds: 8, depth: 0.7 }); P.strokes(w, h, { n: 260, len: 12, width: 3, angle: 0.4, jitter: 2.5, cols: [P.tone(EARTH, 0, 0.45), P.tone(SHROUD, -0.5, 0.45)] }); for (let i = 0; i < 8; i++) { const x = P.rnd() * w, y = h * 0.6 + P.rnd() * h * 0.4; c.fillStyle = 'rgba(0,0,0,0.6)'; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 6, y + 26); c.lineTo(x - 6, y + 22); c.fill(); } });
  R('skin', 0, 128, 64, 64, (c, w, h) => { P.skin(w, h, { base: SKIN, blush: 0 }); P.strokes(w, h, { n: 60, len: 6, width: 2, angle: 0.5, jitter: 2, cols: [P.tone(EARTH, 0, 0.4), P.tone(SKIN, -0.5, 0.4)] }); for (let i = 0; i < 4; i++) P.seam(w * (0.3 + i * 0.13), h * 0.4, w * (0.3 + i * 0.13), h, 2, { dark: 'rgba(20,20,20,0.7)' }); });
  R('hair', 64, 128, 64, 64, (c, w, h) => P.hair(w, h, { base: HAIR, sheen: 0.1 }));
  R('rag', 128, 128, 64, 128, (c, w, h) => { P.cloth(w, h, { base: SHROUD, folds: 2, depth: 0.7 }); P.vignette(w, h, { bottom: 0.7 }); });
  R('glow', 192, 128, 32, 32, (c, w, h) => P.fill(w, h, P.tone(GLOW, 0.2)));
  const K = createKit(THREE, P);
  const { joint, rings, blob, limb, sheet, add } = K;
  const g = new THREE.Group();
  const hips = joint(g, 0, 0.95, 0);
  const spine = joint(hips, 0, 0.08, 0);
  const head = joint(spine, 0, 0.56, 0.16);
  const lShoulder = joint(spine, 0.34, 0.48, 0), rShoulder = joint(spine, -0.34, 0.48, 0);
  const lElbow = joint(lShoulder, 0, -0.36, 0), rElbow = joint(rShoulder, 0, -0.36, 0);
  const lHip = joint(hips, 0.14, -0.06, 0), rHip = joint(hips, -0.14, -0.06, 0);
  const lKnee = joint(lHip, 0, -0.42, 0), rKnee = joint(rHip, 0, -0.42, 0);
  add(spine, rings([{ y: 0.6, rx: 0.13, rz: 0.11, z: 0.06 }, { y: 0.52, rx: 0.34, rz: 0.22, z: -0.02 }, { y: 0.36, rx: 0.33, rz: 0.24, z: -0.03 }, { y: 0.16, rx: 0.28, rz: 0.22 }, { y: 0.0, rx: 0.25, rz: 0.2 }, { y: -0.1, rx: 0.26, rz: 0.2 }], 9, { capTop: true }), 'body');
  add(hips, rings([{ y: 0.0, rx: 0.26, rz: 0.2 }, { y: -0.3, rx: 0.3, rz: 0.24 }, { y: -0.55, rx: 0.32, rz: 0.26 }], 9), 'body', { mat: K.paint2 });
  for (const s of [1, -1]) add(hips, sheet(0.2, 0.5, { sag: 0.03, wave: 0.02, taper: -0.3, rows: 3, cols: 1 }), 'rag', { mat: K.paint2, pos: [s * 0.14, -0.5, 0.1 * s], rot: [0, s * 0.6, 0] });
  for (const [hip, knee, s] of [[lHip, lKnee, 1], [rHip, rKnee, -1]]) {
    add(hip, limb(0.44, [[0.12, 0.11], [0.1, 0.095], [0.085, 0.08]], 7), 'skin');
    add(knee, limb(0.42, [[0.085, 0.08], [0.08, 0.075], [0.09, 0.085]], 7), 'skin');
    add(knee, rings([{ y: -0.38, rx: 0.09, rz: 0.09, z: 0.03 }, { y: -0.44, rx: 0.1, rz: 0.17, z: 0.08 }, { y: -0.47, rx: 0.09, rz: 0.16, z: 0.08 }], 7, { capBottom: true }), 'skin');
    hip.rotation.set(-0.1, 0, s * 0.12); knee.rotation.set(0.3, 0, 0);
  }
  add(head, blob(0.2, 0.24, 0.21, 10, 6), 'head', { pos: [0, 0.14, 0.02] });
  add(head, rings([{ y: 0.34, rx: 0.19, rz: 0.2 }, { y: 0.22, rx: 0.21, rz: 0.22 }, { y: 0.0, rx: 0.16, rz: 0.19, z: -0.06 }, { y: -0.2, rx: 0.1, rz: 0.12, z: -0.1 }], 8, { capTop: true }), 'hair', { mat: K.paint2, pos: [0, 0.04, -0.03] });
  for (const [sh, el, s] of [[lShoulder, lElbow, 1], [rShoulder, rElbow, -1]]) {
    add(sh, limb(0.38, [[0.11, 0.1], [0.09, 0.085], [0.08, 0.075]], 7), 'skin');
    add(el, limb(0.4, [[0.08, 0.075], [0.075, 0.07], [0.07, 0.065]], 7), 'skin');
    add(el, blob(0.1, 0.12, 0.09, 7, 4), 'skin', { pos: [0, -0.44, 0.02] });
    for (let i = 0; i < 4; i++) { const x = -0.07 + i * 0.047; add(el, rings([{ y: -0.5, rx: 0.02, rz: 0.02, x, z: 0.06 }, { y: -0.66, rx: 0.008, rz: 0.008, x: x * 1.3, z: 0.1 }], 4, { capBottom: true }), 'skin'); }
  }
  lShoulder.rotation.set(-0.7, 0, 0.25); rShoulder.rotation.set(-0.6, 0, -0.25);
  lElbow.rotation.set(-0.3, 0, 0); rElbow.rotation.set(-0.35, 0, 0);
  spine.rotation.x = 0.42; head.rotation.x = -0.25;
  return K.finish(g, { hips, spine, head, lShoulder, lElbow, rShoulder, rElbow, lHip, lKnee, rHip, rKnee });
}
