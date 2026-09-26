// Vila, the nature spirit. A tall, pale woman, half see-through, hair and a mist-white gown
// streaming as if under water, feet never quite on the ground. Uses the Vietra's dance.
import { createPainter } from '../paint.js';
import { createKit } from '../charkit.js';

export default function (THREE) {
  const P = createPainter(THREE, 512, 179);
  const R = P.region;
  const SKIN = 0xe8e4f4, HAIR = 0xd8f0e0, GOWN = 0xd0e6ea;
  R('head', 0, 0, 256, 128, (c, w, h) => P.face(w, h, { base: SKIN, hairCol: HAIR, eye: 0x6fd0c0, eyeY: 0.5, mouthY: 0.75, eyeGap: 0.06, eyeW: 0.05, stern: 0, hairTop: 1, female: true, brow: 0.5, hairline: 0.3 }));
  R('gown', 256, 0, 256, 128, (c, w, h) => { P.cloth(w, h, { base: GOWN, folds: 10, depth: 0.5, sway: 0.7 }); P.grad(w, h, [[0, 'rgba(255,255,255,0.3)'], [1, 'rgba(120,180,200,0.4)']]); });
  R('hair', 0, 128, 128, 128, (c, w, h) => { P.hair(w, h, { base: HAIR, sheen: 0.6 }); P.grad(w, h, [[0, 'rgba(255,255,255,0.2)'], [1, 'rgba(120,200,180,0.35)']]); });
  R('skin', 128, 128, 64, 64, (c, w, h) => P.skin(w, h, { base: SKIN, blush: 0.05 }));
  R('glow', 192, 128, 32, 32, (c, w, h) => P.fill(w, h, P.tone(0xaef0e0, 0.4)));
  const K = createKit(THREE, P);
  const ghost = K.material('painted', 0xffffff, { transparent: true, opacity: 0.72, side: THREE.DoubleSide, depthWrite: false });
  const glowMat = K.material('glow', 0xffffff, { emissive: 0x8ff0d0, emissiveIntensity: 0.9, transparent: true, opacity: 0.8 });
  const { joint, rings, blob, limb, sheet, ribbon, flute, add } = K;
  const g = new THREE.Group();
  const hips = joint(g, 0, 1.2, 0);
  const spine = joint(hips, 0, 0.06, 0);
  const head = joint(spine, 0, 0.5, 0.02);
  const lShoulder = joint(spine, 0.24, 0.42, 0), rShoulder = joint(spine, -0.24, 0.42, 0);
  const lElbow = joint(lShoulder, 0, -0.3, 0), rElbow = joint(rShoulder, 0, -0.3, 0);
  const lHip = joint(hips, 0.1, -0.04, 0), rHip = joint(hips, -0.1, -0.04, 0);
  const lKnee = joint(lHip, 0, -0.4, 0), rKnee = joint(rHip, 0, -0.4, 0);
  add(hips, flute(rings([{ y: 0.05, rx: 0.18, rz: 0.15 }, { y: -0.4, rx: 0.3, rz: 0.26 }, { y: -0.9, rx: 0.5, rz: 0.44 }, { y: -1.15, rx: 0.4, rz: 0.34 }], 14), 0.05, -1.15, 0.12, 5, 0.6), 'gown', { mat: ghost });
  add(spine, rings([{ y: 0.52, rx: 0.08, rz: 0.075 }, { y: 0.45, rx: 0.2, rz: 0.15 }, { y: 0.28, rx: 0.2, rz: 0.16 }, { y: 0.1, rx: 0.15, rz: 0.13 }, { y: 0.0, rx: 0.17, rz: 0.14 }], 10, { capTop: true }), 'gown', { mat: ghost });
  add(head, blob(0.19, 0.22, 0.2, 10, 6), 'head', { mat: ghost, pos: [0, 0.2, 0.01] });
  add(head, rings([{ y: 0.44, rx: 0.02, rz: 0.02 }, { y: 0.38, rx: 0.14, rz: 0.15 }, { y: 0.26, rx: 0.21, rz: 0.22 }, { y: 0.1, rx: 0.2, rz: 0.22, z: -0.04 }, { y: -0.3, rx: 0.14, rz: 0.18, z: -0.14 }, { y: -0.8, rx: 0.06, rz: 0.1, z: -0.22 }], 10, { capTop: true }), 'hair', { mat: ghost, pos: [0, 0, -0.01] });
  for (let i = 0; i < 4; i++) add(head, ribbon(0.9, 0.12, [Math.cos(i * 1.6) * 0.35, -1, -0.5 + Math.sin(i) * 0.2], [1, 0, 0], 0.14, i), 'hair', { mat: ghost, pos: [(i - 1.5) * 0.08, 0.2, -0.16] });
  for (const [sh, el, s] of [[lShoulder, lElbow, 1], [rShoulder, rElbow, -1]]) {
    add(sh, limb(0.3, [[0.07, 0.065], [0.06, 0.055], [0.055, 0.05]], 7), 'skin', { mat: ghost });
    add(el, limb(0.3, [[0.055, 0.05], [0.05, 0.045], [0.045, 0.04]], 7), 'skin', { mat: ghost });
    add(el, blob(0.07, 0.09, 0.06, 7, 4), 'skin', { mat: ghost, pos: [0, -0.33, 0.01] });
    add(el, ribbon(0.8, 0.14, [s * 0.2, -1, 0.15], [1, 0, 0], 0.1, s), 'gown', { mat: ghost, pos: [0, -0.1, 0] });
  }
  lShoulder.rotation.set(-0.4, 0, 1.1); rShoulder.rotation.set(-0.4, 0, -1.1); lElbow.rotation.set(-0.5, 0, 0.5); rElbow.rotation.set(-0.5, 0, -0.5);
  for (const [hip, knee] of [[lHip, lKnee], [rHip, rKnee]]) { add(hip, limb(0.4, [[0.06, 0.06], [0.05, 0.05]], 5), 'skin', { mat: ghost }); add(knee, limb(0.4, [[0.05, 0.05], [0.04, 0.04]], 5), 'skin', { mat: ghost }); }
  add(hips, blob(0.5, 0.08, 0.5, 8, 2), 'glow', { mat: glowMat, pos: [0, -1.2, 0] });
  return K.finish(g, { hips, spine, head, lShoulder, lElbow, rShoulder, rElbow, lHip, lKnee, rHip, rKnee });
}
