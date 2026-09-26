// Striga, the night predator. Painted build: a hunched, wiry woman-shape with a mane of black
// hair to the ground, an ash-white face with owl eyes and a mouth full of needles, long clawed
// hands, torn dark cloth. Crouched rest pose; the shared attack becomes a lunge.
import { createPainter } from '../paint.js';
import { createKit } from '../charkit.js';

export default function (THREE) {
  const P = createPainter(THREE, 512, 137);
  const R = P.region;
  const SKIN = 0xc9c2b8, HAIR = 0x141012, CLOTH = 0x2e2430, EYE = 0xffd060;
  R('head', 0, 0, 256, 128, (c, w, h) => {
    P.face(w, h, { base: SKIN, hairCol: HAIR, eye: EYE, eyeY: 0.45, mouthY: 0.72, eyeGap: 0.09, eyeW: 0.065, stern: 0.3, hairTop: 1, female: true, nose: 0, brow: 0.3 });
    for (const sg of [-1, 1]) { P.glow(w * 0.5 + sg * w * 0.09, h * 0.45, w * 0.045, '255,208,96', 1); c.fillStyle = '#0a0a0a'; c.beginPath(); c.arc(w * 0.5 + sg * w * 0.09, h * 0.45, w * 0.018, 0, Math.PI * 2); c.fill(); }
    c.fillStyle = 'rgba(10,6,8,0.9)'; c.beginPath(); c.ellipse(w * 0.5, h * 0.76, w * 0.07, h * 0.05, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#eee8dc'; for (let i = 0; i < 9; i++) { const x = w * 0.44 + i * w * 0.015; c.beginPath(); c.moveTo(x, h * 0.72); c.lineTo(x + 2, h * 0.79); c.lineTo(x + 4, h * 0.72); c.fill(); }
    c.fillStyle = 'rgba(60,40,70,0.35)'; c.beginPath(); c.ellipse(w * 0.5, h * 0.5, w * 0.16, h * 0.12, 0, 0, Math.PI * 2); c.fill();
  });
  R('body', 256, 0, 256, 128, (c, w, h) => { P.cloth(w, h, { base: CLOTH, folds: 7, depth: 0.7 }); for (let i = 0; i < 10; i++) { const x = P.rnd() * w, y = h * 0.5 + P.rnd() * h * 0.5; c.fillStyle = 'rgba(0,0,0,0.7)'; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 7, y + 30); c.lineTo(x - 7, y + 26); c.fill(); } });
  R('skin', 0, 128, 64, 64, (c, w, h) => { P.skin(w, h, { base: SKIN, blush: 0 }); P.grad(w, h, [[0, 'rgba(40,30,50,0)'], [1, 'rgba(40,30,50,0.55)']]); for (let i = 0; i < 4; i++) P.seam(w * (0.3 + i * 0.13), h * 0.4, w * (0.3 + i * 0.13), h, 2, { dark: 'rgba(30,20,30,0.7)' }); });
  R('hair', 64, 128, 128, 128, (c, w, h) => { P.hair(w, h, { base: HAIR, sheen: 0.25 }); });
  R('claw', 192, 128, 32, 64, (c, w, h) => P.bone(w, h, { base: 0x3a3236 }));
  const K = createKit(THREE, P);
  const { joint, rings, blob, limb, sweep, sheet, add } = K;
  const g = new THREE.Group();
  const hips = joint(g, 0, 0.8, 0);
  const spine = joint(hips, 0, 0.08, 0);
  const head = joint(spine, 0, 0.5, 0.22);
  const lShoulder = joint(spine, 0.3, 0.44, 0.04), rShoulder = joint(spine, -0.3, 0.44, 0.04);
  const lElbow = joint(lShoulder, 0, -0.36, 0), rElbow = joint(rShoulder, 0, -0.36, 0);
  const lHip = joint(hips, 0.13, -0.05, 0), rHip = joint(hips, -0.13, -0.05, 0);
  const lKnee = joint(lHip, 0, -0.38, 0), rKnee = joint(rHip, 0, -0.38, 0);
  add(spine, rings([{ y: 0.54, rx: 0.1, rz: 0.09, z: 0.08 }, { y: 0.46, rx: 0.3, rz: 0.2, z: -0.02 }, { y: 0.3, rx: 0.27, rz: 0.2, z: -0.04 }, { y: 0.12, rx: 0.22, rz: 0.17 }, { y: 0.0, rx: 0.2, rz: 0.16 }, { y: -0.08, rx: 0.22, rz: 0.17 }], 9, { capTop: true }), 'body');
  add(hips, rings([{ y: 0.0, rx: 0.22, rz: 0.17 }, { y: -0.3, rx: 0.26, rz: 0.2 }, { y: -0.5, rx: 0.3, rz: 0.24 }], 9), 'body', { mat: K.paint2 });
  // the mane: a hood of hair down the back to the ground
  add(spine, sheet(0.6, 1.3, { sag: 0.1, wave: 0.05, taper: 0.3, rows: 6, cols: 4 }), 'hair', { mat: K.paint2, pos: [0, 0.5, -0.16], rot: [0.15, Math.PI, 0] });
  for (const [hip, knee, s] of [[lHip, lKnee, 1], [rHip, rKnee, -1]]) {
    add(hip, limb(0.4, [[0.11, 0.1], [0.09, 0.085], [0.075, 0.07]], 7), 'skin');
    add(knee, limb(0.4, [[0.075, 0.07], [0.07, 0.065], [0.08, 0.075]], 7), 'skin');
    for (let i = 0; i < 3; i++) { const x = -0.05 + i * 0.05; add(knee, sweep([{ p: [x, -0.4, 0.04], rx: 0.02 }, { p: [x * 1.5, -0.42, 0.22], rx: 0.006 }], 4, { capEnd: true }), 'claw'); }
    hip.rotation.set(-0.9, 0, s * 0.25); knee.rotation.set(1.4, 0, 0);
  }
  add(head, blob(0.19, 0.22, 0.2, 10, 6), 'head', { pos: [0, 0.14, 0.02] });
  add(head, rings([{ y: 0.36, rx: 0.2, rz: 0.21 }, { y: 0.2, rx: 0.23, rz: 0.23 }, { y: 0.0, rx: 0.2, rz: 0.22, z: -0.06 }, { y: -0.3, rx: 0.14, rz: 0.16, z: -0.14 }], 8, { capTop: true }), 'hair', { mat: K.paint2, pos: [0, 0.02, -0.02] });
  for (const [sh, el, s] of [[lShoulder, lElbow, 1], [rShoulder, rElbow, -1]]) {
    add(sh, limb(0.38, [[0.09, 0.085], [0.075, 0.07], [0.065, 0.06]], 7), 'skin');
    add(el, limb(0.4, [[0.065, 0.06], [0.06, 0.055], [0.06, 0.055]], 7), 'skin');
    add(el, blob(0.08, 0.1, 0.07, 6, 4), 'skin', { pos: [0, -0.42, 0.02] });
    for (let i = 0; i < 4; i++) { const x = -0.06 + i * 0.04; add(el, sweep([{ p: [x, -0.48, 0.03], rx: 0.016 }, { p: [x * 1.6, -0.6, 0.12], rx: 0.01 }, { p: [x * 1.8, -0.72, 0.16], rx: 0.003 }], 4, { capEnd: true }), 'claw'); }
  }
  lShoulder.rotation.set(-1.1, 0, 0.5); rShoulder.rotation.set(-1.0, 0, -0.5);
  lElbow.rotation.set(-0.8, 0, 0); rElbow.rotation.set(-0.9, 0, 0);
  spine.rotation.x = 0.7; head.rotation.x = -0.6;
  return K.finish(g, { hips, spine, head, lShoulder, lElbow, rShoulder, rElbow, lHip, lKnee, rHip, rKnee });
}
