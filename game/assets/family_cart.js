// A family on the road: a two-wheeled handcart heaped with bundles under a clan cloth, an old
// man pulling, a woman with a child walking beside. One convoy unit; no joints, it only moves.
import { createPainter, GREY } from '../paint.js';
import { createKit } from '../charkit.js';

export default function (THREE) {
  const P = createPainter(THREE, 512, 211);
  const R = P.region;
  const WOOD = 0xa27a4f, LINEN = 0xe6dcc3, SKIN = 0xd9a07a, HAIR = 0x8a7a68, WOOL = 0x6b5d4e, LEATHER = 0x6b4526;
  R('wood', 0, 0, 128, 128, (c, w, h) => P.planks(w, h, { base: WOOD, count: 5 }));
  R('cloth', 128, 0, 128, 128, (c, w, h) => { P.cloth(w, h, { base: GREY, folds: 5, depth: 0.5 }); P.band(w, h - 10, 10, P.tone(GREY, -0.4)); });
  R('bundle', 256, 0, 64, 64, (c, w, h) => P.cloth(w, h, { base: LINEN, folds: 3, depth: 0.5 }));
  R('face', 320, 0, 128, 64, (c, w, h) => P.face(w, h, { base: SKIN, hairCol: HAIR, eyeY: 0.48, mouthY: 0.74, eyeGap: 0.08, eyeW: 0.045, stern: 0.3, beard: 1, beardCol: HAIR, hairTop: 1 }));
  R('face2', 320, 64, 128, 64, (c, w, h) => P.face(w, h, { base: SKIN, hairCol: 0x3b2618, eyeY: 0.5, mouthY: 0.75, eyeGap: 0.06, eyeW: 0.045, stern: 0, female: true, hairTop: 1, hairline: 0.3, brow: 0.5 }));
  R('wool', 0, 128, 64, 64, (c, w, h) => P.cloth(w, h, { base: WOOL, folds: 3, depth: 0.5 }));
  R('linen', 64, 128, 64, 64, (c, w, h) => P.cloth(w, h, { base: LINEN, folds: 3, depth: 0.5 }));
  R('leather', 128, 128, 64, 64, (c, w, h) => P.leather(w, h, { base: LEATHER }));
  R('skin', 192, 128, 32, 32, (c, w, h) => P.skin(w, h, { base: SKIN }));
  R('wheel', 224, 128, 64, 64, (c, w, h) => { P.wood(w, h, { base: WOOD }); c.strokeStyle = P.tone(WOOD, -0.5); c.lineWidth = 3; for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI; c.beginPath(); c.moveTo(w * 0.5 - Math.cos(a) * w * 0.45, h * 0.5 - Math.sin(a) * h * 0.45); c.lineTo(w * 0.5 + Math.cos(a) * w * 0.45, h * 0.5 + Math.sin(a) * h * 0.45); c.stroke(); } c.beginPath(); c.arc(w * 0.5, h * 0.5, w * 0.46, 0, Math.PI * 2); c.stroke(); });
  const K = createKit(THREE, P);
  const { joint, rings, blob, limb, sweep, sheet, add } = K;
  const g = new THREE.Group();
  const cart = joint(g, 0, 0.5, -0.2);
  add(cart, new THREE.BoxGeometry(1.3, 0.5, 2.0), 'wood', { pos: [0, 0.3, 0] });
  for (const s of [1, -1]) add(cart, rings([{ y: 0.06, rx: 0.42, rz: 0.42 }, { y: -0.06, rx: 0.42, rz: 0.42 }], 10, { capTop: true, capBottom: true }), 'wheel', { pos: [s * 0.75, 0, 0], rot: [0, 0, Math.PI / 2] });
  add(cart, sweep([{ p: [-0.55, 0.3, 1.0], rx: 0.04 }, { p: [-0.5, 0.6, 2.2], rx: 0.035 }], 5, { capStart: true, capEnd: true }), 'wood');
  add(cart, sweep([{ p: [0.55, 0.3, 1.0], rx: 0.04 }, { p: [0.5, 0.6, 2.2], rx: 0.035 }], 5, { capStart: true, capEnd: true }), 'wood');
  for (let i = 0; i < 5; i++) add(cart, blob(0.3 + (i % 2) * 0.1, 0.25, 0.3, 7, 4), 'bundle', { pos: [(i % 3 - 1) * 0.36, 0.7, -0.6 + (i % 2) * 0.7 + i * 0.1] });
  add(cart, sheet(1.5, 2.0, { sag: -0.3, wave: 0.04, taper: 0, rows: 4, cols: 4 }), 'cloth', { mat: K.team2, pos: [0, 0.9, 1.0], rot: [-Math.PI / 2, 0, 0] });
  // the old man pulling
  const man = joint(g, 0, 0.95, 1.9);
  add(man, rings([{ y: 0.55, rx: 0.12, rz: 0.1 }, { y: 0.48, rx: 0.28, rz: 0.2 }, { y: 0.2, rx: 0.26, rz: 0.2 }, { y: -0.1, rx: 0.24, rz: 0.19 }, { y: -0.5, rx: 0.26, rz: 0.2 }], 8, { capTop: true }), 'wool');
  add(man, blob(0.18, 0.2, 0.18, 8, 5), 'face', { pos: [0, 0.72, 0.08] });
  add(man, blob(0.2, 0.06, 0.18, 6, 3), 'leather', { pos: [0, 0.9, 0.06] });
  for (const s of [1, -1]) { add(man, limb(0.5, [[0.08, 0.075], [0.06, 0.06]], 6), 'wool', { pos: [s * 0.28, 0.42, 0.1], rot: [-1.2, 0, 0] }); add(man, limb(0.5, [[0.09, 0.08], [0.08, 0.075]], 6), 'leather', { pos: [s * 0.12, -0.5, 0.05 * s], rot: [s * 0.2, 0, 0] }); }
  // the woman and child beside
  const woman = joint(g, 1.0, 0.9, 0.2);
  add(woman, rings([{ y: 0.5, rx: 0.1, rz: 0.09 }, { y: 0.44, rx: 0.22, rz: 0.17 }, { y: 0.1, rx: 0.2, rz: 0.16 }, { y: -0.4, rx: 0.34, rz: 0.28 }, { y: -0.88, rx: 0.42, rz: 0.36 }], 8, { capTop: true }), 'linen');
  add(woman, blob(0.17, 0.19, 0.17, 8, 5), 'face2', { pos: [0, 0.66, 0.04] });
  add(woman, rings([{ y: 0.86, rx: 0.02, rz: 0.02 }, { y: 0.8, rx: 0.14, rz: 0.15 }, { y: 0.66, rx: 0.19, rz: 0.2 }, { y: 0.56, rx: 0.16, rz: 0.18, z: -0.04 }], 8, { capTop: true }), 'cloth', { mat: K.team2 });
  add(woman, blob(0.14, 0.2, 0.12, 6, 4), 'bundle', { pos: [-0.2, 0.3, 0.16] });
  const child = joint(g, 1.5, 0.55, 0.0);
  add(child, rings([{ y: 0.3, rx: 0.06, rz: 0.055 }, { y: 0.26, rx: 0.13, rz: 0.1 }, { y: -0.2, rx: 0.14, rz: 0.11 }, { y: -0.5, rx: 0.15, rz: 0.12 }], 7, { capTop: true }), 'wool');
  add(child, blob(0.12, 0.13, 0.12, 7, 4), 'face2', { pos: [0, 0.4, 0.02] });
  return K.finish(g, {});
}
