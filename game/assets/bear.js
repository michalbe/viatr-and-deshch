// Bear, heavy beast. Painted-atlas build: a hump-backed brown bear, shaggy, with a broad muzzle,
// small ears, heavy paws with bone claws, a knotted team-cloth collar carrying a carved wooden
// amulet with a faint sacred glow. Joints: body, neck, head, flLeg/frLeg/blLeg/brLeg + knees.
import { createPainter, GREY } from '../paint.js';
import { createKit } from '../charkit.js';

export default function (THREE) {
  const P = createPainter(THREE, 512, 83);
  const R = P.region;
  const FUR = 0x5a3b22, MUZ = 0x9a6a3e, BONE = 0xe0cfa8, DARK = 0x2a1a10, WOOD = 0xa27a4f, GLOW = 0x9ff0c8;

  /* ------------------------------------------------------------------ the atlas */
  R('fur', 0, 0, 256, 128, (c, w, h) => {
    // seam on the belly: lighter, thinner fur at the edges; dark shaggy ridge along the spine at the centre
    P.fur(w, h, { base: FUR, tip: 0.45, n: 1800 });
    P.grad(w, h, [[0, P.tone(MUZ, -0.1, 0.5)], [0.2, 'rgba(0,0,0,0)'], [0.44, 'rgba(0,0,0,0)'], [0.5, P.tone(DARK, 0, 0.55)], [0.56, 'rgba(0,0,0,0)'], [0.8, 'rgba(0,0,0,0)'], [1, P.tone(MUZ, -0.1, 0.5)]], 'h');
    P.strokes(w, h, { n: 300, len: 22, width: 3, angle: Math.PI / 2 + 0.3, jitter: 0.4, cols: [P.tone(DARK, 0, 0.6), P.tone(FUR, 0.45, 0.5)], taper: true });
  });
  R('bearhead', 256, 0, 128, 128, (c, w, h) => {
    // v: back of the skull at the top, nose at the bottom; muzzle lighter, dark eyes and nose
    P.fur(w, h, { base: FUR, tip: 0.45, n: 700 });
    P.grad(w, h, [[0, 'rgba(0,0,0,0)'], [0.55, 'rgba(0,0,0,0)'], [0.7, P.tone(MUZ, 0.05, 0.85)], [1, P.tone(MUZ, -0.05, 0.95)]]);
    for (const sg of [-1, 1]) { const ex = w * 0.5 + sg * w * 0.17, ey = h * 0.42; c.fillStyle = 'rgba(30,15,10,0.6)'; c.beginPath(); c.ellipse(ex, ey, w * 0.07, h * 0.07, 0, 0, Math.PI * 2); c.fill(); c.fillStyle = '#0c0805'; c.beginPath(); c.arc(ex, ey, w * 0.04, 0, Math.PI * 2); c.fill(); c.fillStyle = 'rgba(255,255,255,0.8)'; c.beginPath(); c.arc(ex - sg * 2, ey - 2, 1.8, 0, Math.PI * 2); c.fill(); }
    c.fillStyle = P.tone(DARK); c.beginPath(); c.ellipse(w * 0.5, h * 0.94, w * 0.14, h * 0.06, 0, 0, Math.PI * 2); c.fill();
    P.glow(w * 0.45, h * 0.91, w * 0.06, '255,255,255', 0.4);
    c.strokeStyle = 'rgba(30,15,10,0.7)'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(w * 0.5, h * 0.94); c.lineTo(w * 0.5, h * 0.99); c.stroke();
  });
  R('paw', 384, 0, 64, 64, (c, w, h) => { P.fur(w, h, { base: FUR, tip: 0.4, n: 220 }); c.fillStyle = P.tone(DARK, 0.05); c.beginPath(); c.ellipse(w * 0.5, h * 0.62, w * 0.28, h * 0.18, 0, 0, Math.PI * 2); c.fill(); for (let i = 0; i < 4; i++) { c.beginPath(); c.ellipse(w * (0.2 + i * 0.2), h * 0.85, w * 0.07, h * 0.08, 0, 0, Math.PI * 2); c.fill(); } });
  R('claw', 448, 0, 32, 64, (c, w, h) => { P.fill(w, h, P.tone(BONE, -0.1)); P.grad(w, h, [[0, P.tone(BONE, 0.2)], [1, P.tone(BONE, -0.5)]]); });
  R('collar', 0, 128, 128, 32, (c, w, h) => { P.cloth(w, h, { base: GREY, folds: 6, depth: 0.5 }); for (let x = 8; x < w; x += 24) { c.strokeStyle = P.tone(GREY, -0.5); c.lineWidth = 2; c.beginPath(); c.moveTo(x, 4); c.lineTo(x + 8, h - 4); c.stroke(); } });
  R('wood', 128, 128, 64, 64, (c, w, h) => { P.wood(w, h, { base: WOOD }); c.strokeStyle = P.tone(WOOD, -0.55); c.lineWidth = 3; c.beginPath(); c.arc(w * 0.5, h * 0.5, w * 0.3, 0, Math.PI * 2); c.stroke(); c.beginPath(); c.moveTo(w * 0.5, h * 0.2); c.lineTo(w * 0.5, h * 0.8); c.moveTo(w * 0.2, h * 0.5); c.lineTo(w * 0.8, h * 0.5); c.stroke(); });
  R('glow', 192, 128, 32, 32, (c, w, h) => P.fill(w, h, P.tone(GLOW, 0.2)));
  R('muzzle', 224, 128, 64, 64, (c, w, h) => { P.fur(w, h, { base: MUZ, tip: 0.35, n: 200 }); P.vignette(w, h, { bottom: 0.5 }); });
  R('ear', 288, 128, 32, 32, (c, w, h) => { P.fur(w, h, { base: FUR, tip: 0.4, n: 60 }); c.fillStyle = P.tone(MUZ, 0, 0.7); c.beginPath(); c.ellipse(w * 0.5, h * 0.55, w * 0.25, h * 0.3, 0, 0, Math.PI * 2); c.fill(); });

  /* ------------------------------------------------------------------ the body */
  const K = createKit(THREE, P);
  const { joint, rings, sweep, blob, add } = K;
  const glowMat = K.material('glow', 0xffffff, { emissive: GLOW, emissiveIntensity: 1.5 });
  const g = new THREE.Group();
  const joints = {};
  const J = (parent, name, x, y, z) => { const o = joint(parent, x, y, z); o.name = name; joints[name] = o; return o; };

  const body = J(g, 'body', 0, 1.12, 0);
  add(body, sweep([
    { p: [0, 0.05, -1.1], rx: 0.3, ry: 0.28 }, { p: [0, 0.02, -0.85], rx: 0.58, ry: 0.55 }, { p: [0, 0.0, -0.4], rx: 0.64, ry: 0.6 },
    { p: [0, 0.08, 0.1], rx: 0.66, ry: 0.7 }, { p: [0, 0.16, 0.45], rx: 0.66, ry: 0.72 }, { p: [0, 0.14, 0.7], rx: 0.5, ry: 0.56 }, { p: [0, 0.08, 0.85], rx: 0.36, ry: 0.4 },
  ], 10, { capStart: true, capEnd: true }), 'fur');
  add(body, blob(0.14, 0.12, 0.14, 6, 3), 'fur', { pos: [0, 0.1, -1.15] });
  // shaggy tufts along the belly and flanks, pointing down and back
  for (let i = 0; i < 5; i++) for (const s of [1, -1]) add(body, sweep([{ p: [s * 0.5, -0.2, -0.62 + i * 0.28], rx: 0.13 }, { p: [s * 0.56, -0.5, -0.7 + i * 0.28], rx: 0.07 }, { p: [s * 0.58, -0.62, -0.74 + i * 0.28], rx: 0.01 }], 5, { capEnd: true }), 'fur');
  for (let i = 0; i < 4; i++) add(body, sweep([{ p: [0, 0.6 - i * 0.06, 0.25 - i * 0.28], rx: 0.14 }, { p: [0, 0.68 - i * 0.06, 0.05 - i * 0.28], rx: 0.08 }, { p: [0, 0.66 - i * 0.06, -0.08 - i * 0.28], rx: 0.01 }], 5, { capEnd: true }), 'fur');

  const neck = J(body, 'neck', 0, 0.12, 0.72);
  add(neck, sweep([{ p: [0, 0.02, -0.15], rx: 0.4, ry: 0.42 }, { p: [0, -0.02, 0.15], rx: 0.38, ry: 0.4 }, { p: [0, -0.06, 0.4], rx: 0.34, ry: 0.36 }], 9), 'fur');
  // knotted team collar with tails, amulet on a cord
  add(neck, new THREE.TorusGeometry(0.41, 0.06, 5, 12), 'collar', { mat: K.team, pos: [0, -0.04, 0.2], rot: [0.2, 0, 0] });
  add(neck, blob(0.1, 0.07, 0.09, 6, 3), 'collar', { mat: K.team, pos: [0, 0.38, 0.14] });
  for (const s of [1, -1]) add(neck, sweep([{ p: [s * 0.04, 0.38, 0.1], rx: 0.05, ry: 0.02 }, { p: [s * 0.14, 0.42, -0.2], rx: 0.045, ry: 0.015 }, { p: [s * 0.16, 0.4, -0.4], rx: 0.02, ry: 0.01 }], 5, { capEnd: true }), 'collar', { mat: K.team2 });
  add(neck, sweep([{ p: [0, -0.44, 0.3], rx: 0.012 }, { p: [0, -0.54, 0.34], rx: 0.012 }], 4), 'wood');
  add(neck, rings([{ y: 0.02, rx: 0.1, rz: 0.1 }, { y: -0.02, rx: 0.1, rz: 0.1 }], 8, { capTop: true, capBottom: true }), 'wood', { pos: [0, -0.6, 0.36], rot: [Math.PI / 2, 0, 0] });
  add(neck, blob(0.03, 0.03, 0.015, 6, 3), 'glow', { mat: glowMat, pos: [0, -0.6, 0.39] });

  const head = J(neck, 'head', 0, -0.04, 0.36);
  add(head, sweep([{ p: [0, 0.08, -0.24], rx: 0.3, ry: 0.28 }, { p: [0, 0.08, 0.02], rx: 0.36, ry: 0.32 }, { p: [0, 0.0, 0.22], rx: 0.28, ry: 0.24 }, { p: [0, -0.08, 0.42], rx: 0.17, ry: 0.15 }, { p: [0, -0.1, 0.56], rx: 0.11, ry: 0.09 }], 9, { capStart: true, capEnd: true }), 'bearhead');
  add(head, sweep([{ p: [0, -0.16, 0.2], rx: 0.14, ry: 0.07 }, { p: [0, -0.17, 0.46], rx: 0.1, ry: 0.06 }], 7, { capStart: true, capEnd: true }), 'muzzle');
  for (const s of [1, -1]) add(head, blob(0.1, 0.1, 0.06, 6, 4), 'ear', { pos: [s * 0.25, 0.3, -0.04], rot: [0.3, 0, -s * 0.5] });

  const paw = (p, y, z) => {
    add(p, sweep([{ p: [0, y + 0.14, z - 0.12], rx: 0.2, ry: 0.14 }, { p: [0, y + 0.08, z + 0.1], rx: 0.22, ry: 0.12 }, { p: [0, y + 0.04, z + 0.26], rx: 0.18, ry: 0.08 }], 7, { capStart: true, capEnd: true }), 'paw');
    for (let i = 0; i < 4; i++) { const x = -0.13 + i * 0.087; add(p, sweep([{ p: [x, y + 0.06, z + 0.22], rx: 0.032 }, { p: [x * 1.1, y + 0.02, z + 0.34], rx: 0.02 }, { p: [x * 1.15, y - 0.02, z + 0.42], rx: 0.004 }], 5, { capEnd: true }), 'claw'); }
  };
  const leg = (name, x, y, z, front) => {
    const hip = J(body, name, x, y, z);
    const kn = name.replace('Leg', 'Knee');
    const kz = front ? 0.04 : -0.06;
    add(hip, sweep([{ p: [0, 0.14, 0], rx: front ? 0.26 : 0.3, ry: front ? 0.3 : 0.36 }, { p: [0, -0.25, kz * 0.5], rx: 0.22, ry: 0.24 }, { p: [0, -0.55, kz], rx: 0.19, ry: 0.19 }], 8, { capStart: true }), 'fur');
    const k = J(hip, kn, 0, -0.55, kz);
    add(k, sweep([{ p: [0, 0.04, 0], rx: 0.19, ry: 0.19 }, { p: [0, -0.3, 0.01], rx: 0.17, ry: 0.17 }, { p: [0, -0.5, 0.02], rx: 0.17, ry: 0.17 }], 8), 'fur');
    paw(k, front ? -0.54 : -0.56, 0.0);
  };
  leg('flLeg', 0.4, -0.04, 0.58, true);
  leg('frLeg', -0.4, -0.04, 0.58, true);
  leg('blLeg', 0.4, -0.02, -0.68, false);
  leg('brLeg', -0.4, -0.02, -0.68, false);

  return K.finish(g, joints);
}
