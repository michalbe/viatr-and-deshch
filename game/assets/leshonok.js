// Leshonok, child of the Leshy. Painted build: a knee-high tangle of twigs and leaves with
// oversized clawed hands, a bark face and bright green eyes. Humanoid joints, about 1.1 m.
import { createPainter } from '../paint.js';
import { createKit } from '../charkit.js';

export default function (THREE) {
  const P = createPainter(THREE, 256, 113);
  const R = P.region;
  const BARK = 0x4a3322, MOSS = 0x6f8f3a, GLOW = 0x9ff0c8, TWIG = 0x6b4a2a;
  R('bark', 0, 0, 128, 128, (c, w, h) => { P.bark(w, h, { base: BARK }); });
  R('face', 128, 0, 128, 128, (c, w, h) => {
    P.bark(w, h, { base: BARK });
    for (const sg of [-1, 1]) { P.glow(w * 0.5 + sg * w * 0.11, h * 0.42, w * 0.07, '159,240,200', 1); c.fillStyle = P.tone(GLOW, 0.4); c.beginPath(); c.ellipse(w * 0.5 + sg * w * 0.11, h * 0.42, w * 0.045, h * 0.03, 0, 0, Math.PI * 2); c.fill(); }
    c.fillStyle = 'rgba(0,0,0,0.85)'; c.beginPath(); c.moveTo(w * 0.4, h * 0.62); c.lineTo(w * 0.6, h * 0.62); c.lineTo(w * 0.5, h * 0.72); c.fill();
  });
  R('leaves', 0, 128, 128, 64, (c, w, h) => P.leaves(w, h, { base: MOSS, dark: 0x3f5f2a }));
  R('twig', 128, 128, 64, 128, (c, w, h) => P.wood(w, h, { base: TWIG }));
  R('glow', 192, 128, 32, 32, (c, w, h) => P.fill(w, h, P.tone(GLOW, 0.3)));

  const K = createKit(THREE, P);
  const { joint, rings, sweep, blob, limb, add } = K;
  const glowMat = K.material('glow', 0xffffff, { emissive: GLOW, emissiveIntensity: 1.2 });
  const g = new THREE.Group();
  const hips = joint(g, 0, 0.5, 0);
  const spine = joint(hips, 0, 0.05, 0);
  const head = joint(spine, 0, 0.32, 0.03);
  const lShoulder = joint(spine, 0.2, 0.28, 0), rShoulder = joint(spine, -0.2, 0.28, 0);
  const lElbow = joint(lShoulder, 0, -0.2, 0), rElbow = joint(rShoulder, 0, -0.2, 0);
  const lHip = joint(hips, 0.1, -0.03, 0), rHip = joint(hips, -0.1, -0.03, 0);
  const lKnee = joint(lHip, 0, -0.22, 0), rKnee = joint(rHip, 0, -0.22, 0);
  // a tangle of twigs for a body, leaves on the shoulders
  add(spine, rings([{ y: 0.34, rx: 0.1, rz: 0.09 }, { y: 0.26, rx: 0.2, rz: 0.16 }, { y: 0.1, rx: 0.18, rz: 0.15 }, { y: -0.06, rx: 0.14, rz: 0.12 }], 8, { capTop: true, capBottom: true }), 'bark');
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; add(spine, sweep([{ p: [Math.sin(a) * 0.15, 0.2, Math.cos(a) * 0.12], rx: 0.02 }, { p: [Math.sin(a) * 0.3, 0.32 + (i % 2) * 0.1, Math.cos(a) * 0.25], rx: 0.004 }], 4, { capEnd: true }), 'twig'); }
  add(spine, blob(0.24, 0.1, 0.2, 7, 3), 'leaves', { pos: [0, 0.3, 0] });
  // head: a knot of bark with the painted face, twig antlers
  add(head, blob(0.16, 0.15, 0.15, 8, 5), 'face', { pos: [0, 0.12, 0] });
  for (const s of [1, -1]) add(head, sweep([{ p: [s * 0.08, 0.22, 0], rx: 0.02 }, { p: [s * 0.16, 0.4, -0.04], rx: 0.012 }, { p: [s * 0.14, 0.52, 0.02], rx: 0.003 }], 4, { capEnd: true }), 'twig');
  for (const s of [1, -1]) add(head, blob(0.035, 0.025, 0.02, 5, 3), 'glow', { mat: glowMat, pos: [s * 0.06, 0.14, 0.13] });
  // arms: thin twig arms ending in huge clawed hands
  for (const [sh, el, s] of [[lShoulder, lElbow, 1], [rShoulder, rElbow, -1]]) {
    add(sh, limb(0.2, [[0.05, 0.045], [0.04, 0.04]], 5), 'twig');
    add(el, limb(0.18, [[0.04, 0.04], [0.05, 0.045]], 5), 'twig');
    add(el, blob(0.11, 0.08, 0.1, 6, 3), 'bark', { pos: [0, -0.2, 0.02] });
    for (let i = 0; i < 4; i++) { const x = -0.08 + i * 0.053; add(el, sweep([{ p: [x, -0.22, 0.08], rx: 0.02 }, { p: [x * 1.3, -0.3, 0.18], rx: 0.012 }, { p: [x * 1.4, -0.36, 0.24], rx: 0.003 }], 4, { capEnd: true }), 'twig'); }
  }
  lShoulder.rotation.set(-0.3, 0, 0.4); rShoulder.rotation.set(-0.3, 0, -0.4);
  lElbow.rotation.set(-0.6, 0, 0); rElbow.rotation.set(-0.6, 0, 0);
  // legs: bent twig legs with root feet
  for (const [hip, knee, s] of [[lHip, lKnee, 1], [rHip, rKnee, -1]]) {
    add(hip, limb(0.22, [[0.05, 0.05], [0.04, 0.04]], 5), 'twig');
    add(knee, limb(0.2, [[0.04, 0.04], [0.045, 0.045]], 5), 'twig');
    for (let i = 0; i < 3; i++) { const a = -0.6 + i * 0.6; add(knee, sweep([{ p: [0, -0.2, 0], rx: 0.025 }, { p: [Math.sin(a) * 0.1, -0.24, Math.cos(a) * 0.12], rx: 0.004 }], 4, { capEnd: true }), 'twig'); }
    hip.rotation.set(-0.3, 0, s * 0.15); knee.rotation.set(0.5, 0, 0);
  }
  spine.rotation.x = 0.35;
  return K.finish(g, { hips, spine, head, lShoulder, lElbow, rShoulder, rElbow, lHip, lKnee, rHip, rKnee });
}
