// Rusalka, the drowned singer. A pale young woman in a wet linen shift, green hair to the
// knees, weed in it, water-dark eyes; beautiful from a distance, wrong up close. Sways with
// the Vietra's dance when she sings.
import { createPainter } from '../paint.js';
import { createKit } from '../charkit.js';

export default function (THREE) {
  const P = createPainter(THREE, 512, 197);
  const R = P.region;
  const SKIN = 0xd8dfd6, HAIR = 0x4f8a5a, SHIFT = 0xdde4dc;
  R('head', 0, 0, 256, 128, (c, w, h) => { P.face(w, h, { base: SKIN, hairCol: HAIR, eye: 0x203038, eyeY: 0.5, mouthY: 0.75, eyeGap: 0.062, eyeW: 0.05, stern: 0, hairTop: 1, female: true, brow: 0.5, hairline: 0.3 }); c.fillStyle = 'rgba(40,70,80,0.35)'; for (const sg of [-1, 1]) { c.beginPath(); c.ellipse(w * 0.5 + sg * w * 0.062, h * 0.53, w * 0.06, h * 0.05, 0, 0, Math.PI * 2); c.fill(); } });
  R('shift', 256, 0, 256, 128, (c, w, h) => { P.cloth(w, h, { base: SHIFT, folds: 9, depth: 0.55 }); P.grad(w, h, [[0, 'rgba(255,255,255,0)'], [0.5, 'rgba(60,110,120,0.25)'], [1, 'rgba(40,80,90,0.55)']]); P.strokes(w, h, { n: 40, len: 16, width: 2.5, angle: Math.PI / 2, jitter: 0.3, cols: [P.tone(HAIR, -0.2, 0.5)], taper: true }); });
  R('hair', 0, 128, 128, 128, (c, w, h) => { P.hair(w, h, { base: HAIR, sheen: 0.5 }); P.strokes(w, h, { n: 30, len: 12, width: 3, angle: Math.PI / 2, jitter: 0.4, cols: [P.tone(0x2f5a30, 0, 0.6)], taper: true }); });
  R('skin', 128, 128, 64, 64, (c, w, h) => { P.skin(w, h, { base: SKIN, blush: 0 }); P.grad(w, h, [[0, 'rgba(40,70,80,0)'], [1, 'rgba(40,70,80,0.3)']]); });
  const K = createKit(THREE, P);
  const { joint, rings, blob, limb, ribbon, flute, add } = K;
  const g = new THREE.Group();
  const hips = joint(g, 0, 0.9, 0);
  const spine = joint(hips, 0, 0.06, 0);
  const head = joint(spine, 0, 0.46, 0.02);
  const lShoulder = joint(spine, 0.24, 0.38, 0), rShoulder = joint(spine, -0.24, 0.38, 0);
  const lElbow = joint(lShoulder, 0, -0.28, 0), rElbow = joint(rShoulder, 0, -0.28, 0);
  const lHip = joint(hips, 0.1, -0.04, 0), rHip = joint(hips, -0.1, -0.04, 0);
  const lKnee = joint(lHip, 0, -0.4, 0), rKnee = joint(rHip, 0, -0.4, 0);
  add(hips, flute(rings([{ y: 0.05, rx: 0.17, rz: 0.14 }, { y: -0.4, rx: 0.24, rz: 0.2 }, { y: -0.8, rx: 0.34, rz: 0.28 }, { y: -0.88, rx: 0.32, rz: 0.27 }], 12), 0.05, -0.88, 0.08, 7, 0.3), 'shift', { mat: K.paint2 });
  add(spine, rings([{ y: 0.48, rx: 0.075, rz: 0.07 }, { y: 0.42, rx: 0.2, rz: 0.15 }, { y: 0.26, rx: 0.2, rz: 0.16 }, { y: 0.1, rx: 0.15, rz: 0.13 }, { y: 0.0, rx: 0.17, rz: 0.14 }], 10, { capTop: true }), 'shift');
  add(head, blob(0.19, 0.22, 0.2, 10, 6), 'head', { pos: [0, 0.2, 0.01] });
  add(head, rings([{ y: 0.42, rx: 0.02, rz: 0.02 }, { y: 0.38, rx: 0.14, rz: 0.15 }, { y: 0.28, rx: 0.21, rz: 0.22 }, { y: 0.1, rx: 0.2, rz: 0.22, z: -0.04 }, { y: -0.4, rx: 0.16, rz: 0.2, z: -0.12 }, { y: -1.1, rx: 0.08, rz: 0.12, z: -0.2 }], 10, { capTop: true }), 'hair', { mat: K.paint2, pos: [0, 0, -0.01] });
  for (let i = 0; i < 3; i++) add(head, ribbon(0.8, 0.1, [Math.cos(i * 2.1) * 0.4, -0.6, -0.4], [0, 1, 0], 0.1, i), 'hair', { mat: K.paint2, pos: [0, 0.2, -0.12] });
  for (const [sh, el, s] of [[lShoulder, lElbow, 1], [rShoulder, rElbow, -1]]) {
    add(sh, limb(0.28, [[0.07, 0.065], [0.06, 0.055], [0.055, 0.05]], 7), 'shift');
    add(el, limb(0.28, [[0.055, 0.05], [0.05, 0.045], [0.045, 0.04]], 7), 'skin');
    add(el, blob(0.07, 0.09, 0.06, 7, 4), 'skin', { pos: [0, -0.31, 0.01] });
  }
  lShoulder.rotation.set(-0.3, 0, 0.6); rShoulder.rotation.set(-0.3, 0, -0.6); lElbow.rotation.set(-0.7, 0, 0); rElbow.rotation.set(-0.7, 0, 0);
  for (const [hip, knee] of [[lHip, lKnee], [rHip, rKnee]]) { add(hip, limb(0.4, [[0.07, 0.065], [0.06, 0.055]], 6), 'skin'); add(knee, limb(0.4, [[0.06, 0.055], [0.05, 0.05]], 6), 'skin'); }
  return K.finish(g, { hips, spine, head, lShoulder, lElbow, rShoulder, rElbow, lHip, lKnee, rHip, rKnee });
}
