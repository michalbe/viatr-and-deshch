// Deer Rider, scout and raider. Painted-atlas build: an oversized stag with a thick neck, a great
// rack of antlers and heavy hooves, under a team saddle cloth; a lean rider in a fur cap and a
// team cloak with a short spear. Deer joints: body, neck, head, flLeg/frLeg/blLeg/brLeg (+ knees);
// rider joints prefixed r_ under the deer's body.
import { createPainter, GREY } from '../paint.js';
import { createKit } from '../charkit.js';

export default function (THREE) {
  const P = createPainter(THREE, 512, 71);
  const R = P.region;
  const HIDE = 0x9a6a3e, BONE = 0xe0cfa8, LINEN = 0xe6dcc3, SKIN = 0xd9a07a, HAIR = 0x3b2618, LEATHER = 0x6b4526, FUR = 0x5a3b22, WOOD = 0xa27a4f, IRON = 0x6e757c;

  /* ------------------------------------------------------------------ the atlas */
  R('hide', 0, 0, 256, 128, (c, w, h) => {
    // u wraps from the belly (edges) over the back (centre): pale belly, dark dorsal stripe, dappled flanks
    P.fur(w, h, { base: HIDE, tip: 0.4, n: 1400 });
    P.grad(w, h, [[0, P.tone(BONE, 0.1, 0.9)], [0.18, 'rgba(0,0,0,0)'], [0.5, P.tone(HIDE, -0.5, 0.55)], [0.82, 'rgba(0,0,0,0)'], [1, P.tone(BONE, 0.1, 0.9)]], 'h');
    for (let i = 0; i < 40; i++) { const x = P.rnd() * w, y = P.rnd() * h; if (Math.abs(x - w / 2) < w * 0.3 && Math.abs(x - w / 2) > w * 0.08) { c.fillStyle = P.tone(BONE, 0, 0.35); c.beginPath(); c.ellipse(x, y, 3, 2, 0, 0, Math.PI * 2); c.fill(); } }
  });
  R('deerhead', 256, 0, 128, 128, (c, w, h) => {
    // v: back of the skull at the top, nose at the bottom; u: chin at the edges, brow at the centre
    P.fur(w, h, { base: HIDE, tip: 0.4, n: 500 });
    P.grad(w, h, [[0, P.tone(BONE, 0.1, 0.8)], [0.2, 'rgba(0,0,0,0)'], [0.8, 'rgba(0,0,0,0)'], [1, P.tone(BONE, 0.1, 0.8)]], 'h');
    for (const sg of [-1, 1]) { const ex = w * 0.5 + sg * w * 0.16, ey = h * 0.4; c.fillStyle = 'rgba(20,10,5,0.9)'; c.beginPath(); c.ellipse(ex, ey, w * 0.05, h * 0.06, sg * 0.4, 0, Math.PI * 2); c.fill(); c.fillStyle = 'rgba(255,255,255,0.85)'; c.beginPath(); c.arc(ex - sg * 2, ey - 3, 2, 0, Math.PI * 2); c.fill(); c.strokeStyle = P.tone(HIDE, -0.55); c.lineWidth = 2; c.beginPath(); c.ellipse(ex, ey - 1, w * 0.06, h * 0.07, sg * 0.4, Math.PI, Math.PI * 2); c.stroke(); }
    c.fillStyle = P.tone(0x2a1a10); c.beginPath(); c.ellipse(w * 0.5, h * 0.93, w * 0.12, h * 0.07, 0, 0, Math.PI * 2); c.fill();
    P.glow(w * 0.46, h * 0.9, w * 0.05, '255,255,255', 0.4);
    P.vignette(w, h, { bottom: 0.2 });
  });
  R('antler', 384, 0, 64, 128, (c, w, h) => { P.fill(w, h, P.tone(BONE, -0.1)); P.grad(w, h, [[0, P.tone(BONE, 0.3)], [0.5, P.tone(BONE, -0.05)], [1, P.tone(BONE, -0.45)]], 'h'); P.strokes(w, h, { n: 70, len: 26, width: 1.5, angle: Math.PI / 2, jitter: 0.1, cols: [P.tone(BONE, -0.5, 0.5), P.tone(BONE, 0.4, 0.5)] }); P.vignette(w, h, { bottom: 0.5 }); });
  R('leg', 448, 0, 64, 128, (c, w, h) => { P.fur(w, h, { base: HIDE, tip: 0.35, n: 500 }); P.grad(w, h, [[0, 'rgba(0,0,0,0)'], [0.75, 'rgba(0,0,0,0.25)'], [0.86, P.tone(0x2a1a10, 0.05)], [1, P.tone(0x2a1a10, -0.2)]]); P.glow(w * 0.4, h * 0.9, w * 0.2, '255,240,220', 0.3); });
  R('saddlecloth', 0, 128, 128, 64, (c, w, h) => { P.cloth(w, h, { base: GREY, folds: 3, depth: 0.4 }); P.band(w, h - 12, 12, P.tone(GREY, -0.4)); c.strokeStyle = P.tone(GREY, 0.5); c.lineWidth = 2; c.beginPath(); for (let x = 0; x <= w; x += 8) c.lineTo(x, h - 6 + (x / 8 % 2 ? 3 : -3)); c.stroke(); c.fillStyle = P.tone(GREY, 0.45); c.beginPath(); c.moveTo(w * 0.5, h * 0.2); c.lineTo(w * 0.6, h * 0.5); c.lineTo(w * 0.5, h * 0.7); c.lineTo(w * 0.4, h * 0.5); c.closePath(); c.fill(); });
  R('saddle', 128, 128, 64, 64, (c, w, h) => P.leather(w, h, { base: LEATHER, straps: 1 }));
  R('rhead', 192, 128, 128, 64, (c, w, h) => P.face(w, h, { base: SKIN, hairCol: HAIR, eyeY: 0.46, mouthY: 0.72, eyeGap: 0.085, eyeW: 0.05, stern: 0.7, beard: 1, hairTop: 1 }));
  R('tunic', 320, 128, 64, 64, (c, w, h) => { P.cloth(w, h, { base: LINEN, folds: 4, depth: 0.5 }); P.band(w, h - 8, 8, P.tone(LEATHER, -0.2)); });
  R('rcloak', 384, 128, 64, 64, (c, w, h) => { P.cloth(w, h, { base: GREY, folds: 4, depth: 0.6 }); P.band(w, h - 8, 8, P.tone(GREY, -0.4)); });
  R('fur', 448, 128, 64, 64, (c, w, h) => P.fur(w, h, { base: FUR, tip: 0.5 }));
  R('rleather', 0, 192, 64, 64, (c, w, h) => P.leather(w, h, { base: LEATHER, straps: 2 }));
  R('rhand', 64, 192, 32, 32, (c, w, h) => { P.skin(w, h, { base: SKIN }); P.seam(w * 0.4, h * 0.4, w * 0.4, h, 2, { dark: 'rgba(80,30,20,0.7)' }); P.seam(w * 0.6, h * 0.4, w * 0.6, h, 2, { dark: 'rgba(80,30,20,0.7)' }); });
  R('spear', 96, 192, 32, 128, (c, w, h) => P.wood(w, h, { base: WOOD }));
  R('iron', 128, 192, 32, 32, (c, w, h) => P.iron(w, h, { base: IRON, bevel: 2, spec: 0.6, band: 0.35 }));
  R('tail', 160, 192, 32, 64, (c, w, h) => { P.fur(w, h, { base: HIDE, tip: 0.4, n: 160 }); P.grad(w, h, [[0, 'rgba(0,0,0,0)'], [1, P.tone(BONE, 0.2, 0.8)]]); });
  R('bone', 192, 192, 32, 32, (c, w, h) => P.fill(w, h, P.tone(BONE, -0.05)));

  /* ------------------------------------------------------------------ the deer */
  const K = createKit(THREE, P);
  const { joint, rings, sweep, blob, limb, plate, sheet, add } = K;
  const g = new THREE.Group();
  const joints = {};
  const J = (parent, name, x, y, z) => { const o = joint(parent, x, y, z); o.name = name; joints[name] = o; return o; };

  const body = J(g, 'body', 0, 1.75, 0);
  // barrel from the rump to the chest, a deep chest and high withers
  add(body, sweep([
    { p: [0, 0.02, -1.15], rx: 0.2, ry: 0.22 }, { p: [0, 0.05, -0.95], rx: 0.4, ry: 0.42 }, { p: [0, 0.02, -0.5], rx: 0.44, ry: 0.46 },
    { p: [0, 0.0, 0.0], rx: 0.42, ry: 0.44 }, { p: [0, 0.06, 0.5], rx: 0.44, ry: 0.5 }, { p: [0, 0.1, 0.85], rx: 0.38, ry: 0.44 }, { p: [0, 0.14, 1.0], rx: 0.26, ry: 0.3 },
  ], 10, { capStart: true, capEnd: true }), 'hide');
  add(body, sweep([{ p: [0, 0.2, -1.05], rx: 0.08, ry: 0.08 }, { p: [0, 0.1, -1.25], rx: 0.07, ry: 0.06 }, { p: [0, -0.06, -1.36], rx: 0.03, ry: 0.03 }], 6, { capEnd: true }), 'tail');

  // neck: thick, rising forward; head with muzzle, ears, antlers
  const neck = J(body, 'neck', 0, 0.2, 0.85);
  add(neck, sweep([{ p: [0, -0.1, -0.05], rx: 0.3, ry: 0.34 }, { p: [0, 0.25, 0.15], rx: 0.26, ry: 0.3 }, { p: [0, 0.55, 0.32], rx: 0.2, ry: 0.24 }, { p: [0, 0.78, 0.45], rx: 0.17, ry: 0.18 }], 9), 'hide');
  const head = J(neck, 'head', 0, 0.75, 0.44);
  add(head, sweep([{ p: [0, 0.06, -0.14], rx: 0.16, ry: 0.16 }, { p: [0, 0.08, 0.02], rx: 0.19, ry: 0.2 }, { p: [0, 0.02, 0.2], rx: 0.14, ry: 0.15 }, { p: [0, -0.06, 0.4], rx: 0.1, ry: 0.1 }, { p: [0, -0.1, 0.52], rx: 0.08, ry: 0.07 }], 9, { capStart: true, capEnd: true }), 'deerhead');
  for (const s of [1, -1]) add(head, plate([[-0.06, 0], [0.06, 0], [0.03, 0.3], [-0.03, 0.3]], 0.02), 'hide', { mat: K.paint2, pos: [s * 0.16, 0.14, -0.06], rot: [0.3, 0, -s * 1.1] });
  // antlers: a main beam swept through five points with tines off it
  for (const s of [1, -1]) {
    const beam = [[s * 0.09, 0.15, -0.02], [s * 0.3, 0.38, -0.14], [s * 0.52, 0.6, -0.12], [s * 0.68, 0.8, 0.0], [s * 0.72, 0.98, 0.16], [s * 0.72, 1.1, 0.26]];
    const rad = [0.06, 0.052, 0.044, 0.036, 0.026, 0.01];
    add(head, sweep(beam.map((p, i) => ({ p, rx: rad[i] })), 6, { capStart: true, capEnd: true }), 'antler');
    add(head, blob(0.075, 0.06, 0.075, 6, 3), 'antler', { pos: beam[0] });
    const tines = [[0, [s * 0.22, 0.32, 0.32]], [1, [s * 0.36, 0.7, 0.14]], [2, [s * 0.5, 0.92, -0.06]], [3, [s * 0.9, 0.98, -0.1]], [3, [s * 0.58, 1.06, 0.08]]];
    for (const [i, t] of tines) add(head, sweep([{ p: beam[i], rx: rad[i] * 0.8 }, { p: [(beam[i][0] + t[0]) / 2, (beam[i][1] + t[1]) / 2, (beam[i][2] + t[2]) / 2], rx: rad[i] * 0.5 }, { p: t, rx: 0.008 }], 5, { capEnd: true }), 'antler');
  }

  // legs: heavy, with big hooves
  const leg = (name, x, y, z, front) => {
    const hip = J(body, name, x, y, z);
    const kn = name.replace('Leg', 'Knee');
    if (front) {
      add(hip, sweep([{ p: [0, 0.12, 0], rx: 0.16, ry: 0.2 }, { p: [0, -0.3, 0.02], rx: 0.13, ry: 0.14 }, { p: [0, -0.6, 0.02], rx: 0.1, ry: 0.1 }], 8, { capStart: true }), 'leg');
      const k = J(hip, kn, 0, -0.6, 0.02);
      add(k, sweep([{ p: [0, 0.04, 0], rx: 0.1, ry: 0.1 }, { p: [0, -0.5, 0.02], rx: 0.08, ry: 0.08 }, { p: [0, -0.82, 0.03], rx: 0.085, ry: 0.085 }, { p: [0, -0.95, 0.07], rx: 0.1, ry: 0.09 }], 7, { capEnd: true }), 'leg');
    } else {
      add(hip, sweep([{ p: [0, 0.1, 0.05], rx: 0.2, ry: 0.26 }, { p: [0, -0.4, -0.06], rx: 0.16, ry: 0.18 }, { p: [0, -0.95, -0.22], rx: 0.1, ry: 0.1 }], 8, { capStart: true }), 'leg');
      const k = J(hip, kn, 0, -0.95, -0.22);
      add(k, sweep([{ p: [0, 0.04, 0], rx: 0.1, ry: 0.1 }, { p: [0, -0.35, 0.06], rx: 0.08, ry: 0.08 }, { p: [0, -0.62, 0.1], rx: 0.085, ry: 0.085 }, { p: [0, -0.75, 0.15], rx: 0.1, ry: 0.09 }], 7, { capEnd: true }), 'leg');
    }
  };
  leg('flLeg', 0.26, -0.2, 0.72, true);
  leg('frLeg', -0.26, -0.2, 0.72, true);
  leg('blLeg', 0.27, -0.05, -0.78, false);
  leg('brLeg', -0.27, -0.05, -0.78, false);

  // saddle cloth and saddle
  add(body, sheet(1.0, 0.7, { sag: 0, wave: 0, taper: -0.1, rows: 2, cols: 5 }), 'saddlecloth', { mat: K.team2, pos: [0.47, 0.25, 0.3], rot: [0, Math.PI / 2, 0.15] });
  add(body, sheet(1.0, 0.7, { sag: 0, wave: 0, taper: -0.1, rows: 2, cols: 5 }), 'saddlecloth', { mat: K.team2, pos: [-0.47, 0.25, -0.3], rot: [0, -Math.PI / 2, -0.15] });
  add(body, sweep([{ p: [0, 0.44, 0.34], rx: 0.2, ry: 0.12 }, { p: [0, 0.4, 0.0], rx: 0.32, ry: 0.06 }, { p: [0, 0.48, -0.42], rx: 0.24, ry: 0.14 }], 8, { capStart: true, capEnd: true }), 'saddle');
  add(body, sweep([{ p: [0.44, 0.1, 0.1], rx: 0.03 }, { p: [0.4, -0.3, 0.12], rx: 0.03 }], 5), 'saddle');
  add(body, sweep([{ p: [-0.44, 0.1, 0.1], rx: 0.03 }, { p: [-0.4, -0.3, 0.12], rx: 0.03 }], 5), 'saddle');

  /* ------------------------------------------------------------------ the rider */
  const hips = J(body, 'r_hips', 0, 0.55, -0.05);
  add(hips, rings([{ y: 0.12, rx: 0.22, rz: 0.18 }, { y: 0.0, rx: 0.24, rz: 0.2 }, { y: -0.12, rx: 0.22, rz: 0.18 }], 8, { capBottom: true }), 'tunic');
  add(hips, rings([{ y: 0.14, rx: 0.23, rz: 0.19 }, { y: 0.06, rx: 0.235, rz: 0.195 }], 8), 'rleather');
  for (const s of [1, -1]) {
    add(hips, sweep([{ p: [s * 0.12, -0.02, 0.04], rx: 0.11, ry: 0.11 }, { p: [s * 0.42, -0.2, 0.3], rx: 0.09, ry: 0.09 }], 6, { capStart: true }), 'tunic');
    add(hips, sweep([{ p: [s * 0.42, -0.2, 0.3], rx: 0.09 }, { p: [s * 0.5, -0.62, 0.12], rx: 0.085 }], 6, { capStart: true }), 'rleather');
    add(hips, rings([{ y: -0.6, rx: 0.08, rz: 0.08, z: 0.02 }, { y: -0.68, rx: 0.09, rz: 0.14, z: 0.08 }, { y: -0.72, rx: 0.085, rz: 0.13, z: 0.08 }], 6, { capBottom: true }), 'rleather', { pos: [s * 0.5, 0, 0.12] });
  }
  const spine = J(hips, 'r_spine', 0, 0.12, 0);
  add(spine, rings([{ y: 0.52, rx: 0.12, rz: 0.1 }, { y: 0.46, rx: 0.3, rz: 0.2 }, { y: 0.3, rx: 0.3, rz: 0.22 }, { y: 0.1, rx: 0.24, rz: 0.19 }, { y: 0.0, rx: 0.23, rz: 0.18 }], 8, { capTop: true }), 'tunic');
  add(spine, sheet(0.5, 0.8, { sag: 0.06, wave: 0.02, taper: 0.4, rows: 4, cols: 4 }), 'rcloak', { mat: K.team2, pos: [0, 0.46, -0.2], rot: [0.1, Math.PI, 0] });
  add(spine, rings([{ y: 0.54, rx: 0.2, rz: 0.17 }, { y: 0.44, rx: 0.32, rz: 0.25 }, { y: 0.38, rx: 0.3, rz: 0.23 }], 8), 'fur', { mat: K.paint2 });
  const head2 = J(spine, 'r_head', 0, 0.52, 0.02);
  add(head2, blob(0.19, 0.21, 0.19, 9, 6), 'rhead', { pos: [0, 0.16, 0.01] });
  add(head2, rings([{ y: 0.0, rx: 0.12, rz: 0.07, z: 0.12 }, { y: -0.08, rx: 0.14, rz: 0.09, z: 0.13 }, { y: -0.2, rx: 0.08, rz: 0.06, z: 0.14 }, { y: -0.26, rx: 0.03, rz: 0.03, z: 0.14 }], 7, { capTop: true, capBottom: true }), 'fur');
  add(head2, rings([{ y: 0.46, rx: 0.02, rz: 0.02 }, { y: 0.42, rx: 0.15, rz: 0.15 }, { y: 0.34, rx: 0.2, rz: 0.2 }, { y: 0.26, rx: 0.2, rz: 0.2 }, { y: 0.24, rx: 0.19, rz: 0.19 }], 9, { capTop: true }), 'fur', { mat: K.paint2 });
  const arm = (name, s) => {
    const sh = J(spine, 'r_' + name + 'Shoulder', s * 0.32, 0.44, 0);
    add(sh, blob(0.12, 0.09, 0.11, 7, 4), 'tunic', { pos: [s * 0.02, 0.02, 0] });
    add(sh, limb(0.3, [[0.1, 0.095], [0.09, 0.085], [0.085, 0.08]], 7), 'tunic');
    const el = J(sh, 'r_' + name + 'Elbow', 0, -0.3, 0);
    add(el, limb(0.28, [[0.085, 0.08], [0.1, 0.095], [0.09, 0.085]], 7), 'rleather');
    add(el, blob(0.09, 0.1, 0.085, 7, 4), 'rhand', { pos: [0, -0.32, 0.01] });
    return el;
  };
  const lEl = arm('l', 1), rEl = arm('r', -1);
  joints.r_lShoulder.rotation.set(-0.9, 0, 0.15); lEl.rotation.set(-0.9, 0, 0);
  joints.r_rShoulder.rotation.set(-0.9, 0, -0.2); rEl.rotation.set(-0.9, 0, 0);
  // short spear through the right fist, pointing forward and up
  const spear = K.holdLevel(g, rEl, [0, -0.32, 0.02], new THREE.Euler(-0.6, 0, 0));
  add(spear, rings([{ y: 1.3, rx: 0.028, rz: 0.028 }, { y: 0.0, rx: 0.032, rz: 0.032 }, { y: -0.6, rx: 0.035, rz: 0.035 }], 6, { capTop: true, capBottom: true }), 'spear');
  add(spear, rings([{ y: 1.36, rx: 0.05, rz: 0.05 }, { y: 1.26, rx: 0.05, rz: 0.05 }], 6), 'fur');
  add(spear, plate([[-0.06, 0], [0.06, 0], [0.03, 0.22], [0, 0.4], [-0.03, 0.22]], 0.03), 'iron', { pos: [0, 1.36, 0] });

  return K.finish(g, joints);
}
