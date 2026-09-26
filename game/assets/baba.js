// Baba, the seer. Painted build: bent but not frail, a great patterned shawl over layered
// skirts, a headscarf, a bundle of herbs at the hip, a tall crooked staff with a rattle of bones
// and a sickle. A strong profile from the RTS camera; no pointed hat.
import { createPainter, GREY } from '../paint.js';
import { createKit } from '../charkit.js';

export default function (THREE) {
  const P = createPainter(THREE, 512, 151);
  const R = P.region;
  const SKIN = 0xd2a888, HAIR = 0xb9b0a4, SHAWL = 0x4a3a5a, SKIRT = 0x6a4a3a, LINEN = 0xe6dcc3, WOOD = 0x5e4029, OCHRE = 0xc98a2b;
  R('head', 0, 0, 256, 128, (c, w, h) => {
    P.face(w, h, { base: SKIN, hairCol: HAIR, eye: 0x4a4a4a, eyeY: 0.48, mouthY: 0.74, eyeGap: 0.075, eyeW: 0.045, stern: 0.6, hairTop: 1, female: true, brow: 0.8, hairline: 0.34 });
    // lines of a long life
    c.strokeStyle = 'rgba(110,60,40,0.4)'; c.lineWidth = 1.5;
    for (const sg of [-1, 1]) { c.beginPath(); c.moveTo(w * 0.5 + sg * w * 0.13, h * 0.55); c.quadraticCurveTo(w * 0.5 + sg * w * 0.12, h * 0.68, w * 0.5 + sg * w * 0.09, h * 0.78); c.stroke(); c.beginPath(); c.moveTo(w * 0.5 + sg * w * 0.14, h * 0.42); c.lineTo(w * 0.5 + sg * w * 0.19, h * 0.4); c.stroke(); }
  });
  R('scarf', 256, 0, 128, 64, (c, w, h) => { P.cloth(w, h, { base: GREY, folds: 3, depth: 0.5 }); P.band(w, h - 8, 8, P.tone(GREY, -0.4)); });
  R('shawl', 256, 64, 256, 128, (c, w, h) => {
    P.cloth(w, h, { base: SHAWL, folds: 6, depth: 0.6 });
    // a woven pattern: rows of ochre and cream diamonds, a fringe along the hem
    for (let y = 14; y < h - 20; y += 22) { c.strokeStyle = P.tone(OCHRE, 0.1); c.lineWidth = 2.5; c.beginPath(); for (let x = 0; x <= w; x += 11) c.lineTo(x, y + (x / 11 % 2 ? 6 : -6)); c.stroke(); c.strokeStyle = P.tone(LINEN, 0); c.lineWidth = 1.5; c.beginPath(); for (let x = 0; x <= w; x += 11) c.lineTo(x, y + 9 + (x / 11 % 2 ? 4 : -4)); c.stroke(); }
    for (let x = 2; x < w; x += 5) { c.strokeStyle = P.tone(SHAWL, x % 10 ? -0.4 : 0.4); c.lineWidth = 2; c.beginPath(); c.moveTo(x, h - 12); c.lineTo(x + 1, h); c.stroke(); }
  });
  R('skirt', 0, 128, 128, 128, (c, w, h) => { P.cloth(w, h, { base: SKIRT, folds: 6, depth: 0.7 }); P.band(w, h * 0.45, 6, P.tone(OCHRE, -0.2)); P.band(w, h - 14, 14, P.tone(LINEN, -0.2)); });
  R('underskirt', 128, 128, 128, 64, (c, w, h) => { P.cloth(w, h, { base: LINEN, folds: 8, depth: 0.6 }); P.band(w, h - 8, 8, P.tone(OCHRE, -0.1)); });
  R('hand', 128, 192, 64, 64, (c, w, h) => { P.skin(w, h, { base: SKIN, blush: 0 }); for (let i = 0; i < 4; i++) P.seam(w * (0.32 + i * 0.12), h * 0.4, w * (0.32 + i * 0.12), h, 2.5, { dark: 'rgba(90,40,30,0.7)' }); });
  R('wood', 192, 192, 32, 128, (c, w, h) => P.wood(w, h, { base: WOOD }));
  R('bone', 224, 192, 32, 32, (c, w, h) => P.bone(w, h));
  R('iron', 224, 224, 32, 32, (c, w, h) => P.iron(w, h, { base: 0x6e757c, bevel: 2, spec: 0.5 }));
  R('herbs', 0, 256, 64, 64, (c, w, h) => P.leaves(w, h, { base: 0x6f8f3a, dark: 0x3f5f2a }));
  R('boot', 64, 256, 64, 64, (c, w, h) => P.leather(w, h, { base: 0x4a3020, straps: 1 }));
  const K = createKit(THREE, P);
  const { joint, rings, blob, limb, sheet, flute, add } = K;
  const g = new THREE.Group();
  const hips = joint(g, 0, 0.86, 0);
  const spine = joint(hips, 0, 0.06, 0);
  const head = joint(spine, 0, 0.44, 0.12);
  const lShoulder = joint(spine, 0.27, 0.38, 0), rShoulder = joint(spine, -0.27, 0.38, 0);
  const lElbow = joint(lShoulder, 0, -0.28, 0), rElbow = joint(rShoulder, 0, -0.28, 0);
  const lHip = joint(hips, 0.1, -0.04, 0), rHip = joint(hips, -0.1, -0.04, 0);
  const lKnee = joint(lHip, 0, -0.4, 0), rKnee = joint(rHip, 0, -0.4, 0);
  add(hips, flute(rings([{ y: 0.05, rx: 0.2, rz: 0.17 }, { y: -0.3, rx: 0.3, rz: 0.26 }, { y: -0.6, rx: 0.42, rz: 0.37 }, { y: -0.82, rx: 0.5, rz: 0.45 }], 12), 0.05, -0.82, 0.07, 6, 0.2), 'skirt', { mat: K.paint2 });
  add(hips, flute(rings([{ y: -0.7, rx: 0.46, rz: 0.41 }, { y: -0.88, rx: 0.54, rz: 0.48 }], 12), -0.7, -0.88, 0.06, 6, 0.2), 'underskirt', { mat: K.paint2 });
  add(spine, rings([{ y: 0.46, rx: 0.1, rz: 0.09, z: 0.05 }, { y: 0.4, rx: 0.26, rz: 0.19, z: -0.02 }, { y: 0.22, rx: 0.24, rz: 0.2, z: -0.03 }, { y: 0.06, rx: 0.2, rz: 0.17 }, { y: 0.0, rx: 0.21, rz: 0.18 }], 10, { capTop: true }), 'skirt');
  // the great shawl over the shoulders, hanging to the hips, a hood of it behind the head
  add(spine, rings([{ y: 0.5, rx: 0.14, rz: 0.13, z: 0.02 }, { y: 0.42, rx: 0.36, rz: 0.28, z: -0.04 }, { y: 0.2, rx: 0.4, rz: 0.32, z: -0.06 }, { y: 0.0, rx: 0.34, rz: 0.28, z: -0.04 }], 12), 'shawl', { mat: K.paint2 });
  add(spine, sheet(0.5, 0.7, { sag: 0.06, wave: 0.03, taper: 0.2, rows: 4, cols: 3 }), 'shawl', { mat: K.paint2, pos: [0, 0.42, -0.24], rot: [0.1, Math.PI, 0] });
  add(hips, blob(0.12, 0.16, 0.1, 6, 4), 'herbs', { pos: [0.24, -0.1, 0.12] });
  for (const [hip, knee] of [[lHip, lKnee], [rHip, rKnee]]) {
    add(hip, limb(0.4, [[0.08, 0.075], [0.07, 0.065], [0.06, 0.06]], 6), 'underskirt');
    add(knee, limb(0.4, [[0.06, 0.06], [0.065, 0.06], [0.075, 0.07]], 7), 'boot');
    add(knee, rings([{ y: -0.36, rx: 0.07, rz: 0.07, z: 0.02 }, { y: -0.43, rx: 0.085, rz: 0.14, z: 0.07 }, { y: -0.46, rx: 0.08, rz: 0.13, z: 0.07 }], 7, { capBottom: true }), 'boot');
  }
  add(head, blob(0.19, 0.21, 0.2, 10, 6), 'head', { pos: [0, 0.16, 0.01] });
  add(head, rings([{ y: 0.4, rx: 0.02, rz: 0.02 }, { y: 0.36, rx: 0.14, rz: 0.15 }, { y: 0.26, rx: 0.21, rz: 0.22 }, { y: 0.12, rx: 0.22, rz: 0.23, z: -0.02 }, { y: 0.0, rx: 0.18, rz: 0.2, z: -0.06 }], 10, { capTop: true }), 'scarf', { mat: K.team2, pos: [0, 0.02, -0.01] });
  for (const [sh, el, s] of [[lShoulder, lElbow, 1], [rShoulder, rElbow, -1]]) {
    add(sh, limb(0.28, [[0.1, 0.095], [0.09, 0.085], [0.08, 0.075]], 8), 'shawl');
    add(el, rings([{ y: 0.02, rx: 0.08, rz: 0.075 }, { y: -0.14, rx: 0.1, rz: 0.095 }, { y: -0.24, rx: 0.14, rz: 0.13 }], 8), 'skirt', { mat: K.paint2 });
    add(el, limb(0.16, [[0.045, 0.042], [0.045, 0.042]], 6), 'hand', { pos: [0, -0.16, 0] });
    add(el, blob(0.08, 0.1, 0.07, 8, 5), 'hand', { pos: [0, -0.34, 0.01] });
  }
  rShoulder.rotation.set(-0.4, 0, -0.15); rElbow.rotation.set(-0.9, 0, 0);
  lShoulder.rotation.set(-0.15, 0, 0.2); lElbow.rotation.set(-0.5, 0, 0);
  spine.rotation.x = 0.3; head.rotation.x = -0.3;
  // the staff: crooked, a rattle of bones at the top, a sickle hung below the hand
  const grip = K.holdLevel(g, rElbow, [0, -0.32, 0.01], new THREE.Euler(0, 0, -0.08));
  g.updateMatrixWorld(true);
  const gy = grip.getWorldPosition(new THREE.Vector3()).y;
  const top = 2.0 - gy, bot = 0.04 - gy;
  add(grip, K.sweep([{ p: [0, bot, 0], rx: 0.035 }, { p: [0.02, top * 0.5, 0.03], rx: 0.03 }, { p: [-0.06, top * 0.85, 0.02], rx: 0.03 }, { p: [0.08, top, -0.04], rx: 0.02 }], 6, { capStart: true, capEnd: true }), 'wood', { uvOpts: { rotate: true } });
  for (let i = 0; i < 5; i++) { const a = i * 1.26; add(grip, blob(0.03, 0.05, 0.03, 5, 3), 'bone', { pos: [0.08 + Math.cos(a) * 0.1, top - 0.15 - (i % 2) * 0.08, -0.04 + Math.sin(a) * 0.1] }); }
  add(grip, K.plate([[0, 0], [0.22, 0.05], [0.3, 0.16], [0.24, 0.16], [0.16, 0.09], [0.02, 0.05]], 0.015), 'iron', { pos: [0.02, -0.12, 0.04], rot: [0.3, 0, 0] });
  return K.finish(g, { hips, spine, head, lShoulder, lElbow, rShoulder, rElbow, lHip, lKnee, rHip, rKnee });
}
