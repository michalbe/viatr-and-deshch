// Zherca, Rain Priest. Painted-atlas build: a tall hooded column. Full-length team mantle with an
// embroidered front opening and a rain sigil on the back, a peaked hood, a long grey beard, wide
// sleeves, a wooden bowl of water in the left hand, and a rain-drum on a tall staff in the right,
// drops hanging from its rim.
import { createPainter, GREY } from '../paint.js';
import { createKit } from '../charkit.js';

export default function (THREE) {
  const P = createPainter(THREE, 512, 59);
  const R = P.region;
  const LINEN = 0xe6dcc3, OCHRE = 0xc98a2b, SKIN = 0xd4a684, HAIR = 0x8a8070, WOOD = 0x5e4029, LEATHER = 0x6b4526, WATER = 0x4f8fb0;

  const embroidery = (c, w, y, bh, ground = OCHRE) => {
    P.band(w, y, bh, P.tone(ground, -0.05));
    c.strokeStyle = P.tone(LINEN, 0.3); c.lineWidth = Math.max(1.5, bh * 0.18); c.beginPath();
    for (let x = 0; x <= w; x += bh) c.lineTo(x, y + bh * (x / bh % 2 ? 0.25 : 0.75));
    c.stroke();
  };

  /* ------------------------------------------------------------------ the atlas */
  R('head', 0, 0, 256, 128, (c, w, h) => P.face(w, h, { base: SKIN, hairCol: HAIR, eye: 0x3a4a5a, eyeY: 0.47, mouthY: 0.7, eyeGap: 0.08, eyeW: 0.048, stern: 0.5, beard: 1, beardCol: HAIR, hairTop: 1, brow: 1.3 }));
  R('mantle', 256, 0, 256, 128, (c, w, h) => {
    P.cloth(w, h, { base: GREY, folds: 8, depth: 0.7, sway: 0.3 });
    // front opening at u = 0.5 as a light embroidered band; rain sigil (three drops) on the back at u = 0
    c.fillStyle = P.tone(GREY, 0.35); c.fillRect(w * 0.47, 0, w * 0.06, h);
    c.strokeStyle = P.tone(GREY, -0.5); c.lineWidth = 1.5; c.beginPath(); c.moveTo(w * 0.47, 0); c.lineTo(w * 0.47, h); c.moveTo(w * 0.53, 0); c.lineTo(w * 0.53, h); c.stroke();
    for (let y = 8; y < h; y += 10) { c.fillStyle = P.tone(GREY, -0.45); c.fillRect(w * 0.485, y, w * 0.03, 3); }
    for (const [dx, dy, r] of [[0, 0.35, 10], [-0.09, 0.5, 8], [0.09, 0.5, 8]]) {
      const x = ((w * (0.0 + dx)) + w) % w, y = h * dy;
      for (const xx of [x, x - w, x + w]) { c.fillStyle = P.tone(GREY, 0.4); c.beginPath(); c.moveTo(xx, y - r * 1.6); c.quadraticCurveTo(xx + r, y, xx, y + r); c.quadraticCurveTo(xx - r, y, xx, y - r * 1.6); c.fill(); }
    }
    P.band(w, h - 12, 12, P.tone(GREY, -0.35)); c.strokeStyle = P.tone(GREY, 0.5); c.lineWidth = 2; c.beginPath(); for (let x = 0; x <= w; x += 8) c.lineTo(x, h - 6 + (x / 8 % 2 ? 3 : -3)); c.stroke();
    P.vignette(w, h, { top: 0.3 });
  });
  R('robe', 0, 128, 128, 128, (c, w, h) => { P.cloth(w, h, { base: LINEN, folds: 5, depth: 0.6 }); embroidery(c, w, h - 14, 12); P.vignette(w, h, { top: 0.4 }); });
  R('hood', 128, 128, 128, 64, (c, w, h) => { P.cloth(w, h, { base: GREY, folds: 5, depth: 0.55 }); P.band(w, h - 8, 8, P.tone(GREY, 0.3)); P.vignette(w, h, { bottom: 0.3 }); });
  R('capelet', 128, 192, 128, 64, (c, w, h) => { P.cloth(w, h, { base: GREY, folds: 6, depth: 0.6 }); P.band(w, h - 10, 10, P.tone(GREY, 0.3)); for (let x = 2; x < w; x += 5) { c.strokeStyle = P.tone(GREY, x % 10 ? -0.4 : 0.35); c.lineWidth = 2; c.beginPath(); c.moveTo(x, h - 8); c.lineTo(x + 1, h); c.stroke(); } });
  R('sleeve', 256, 128, 64, 64, (c, w, h) => { P.cloth(w, h, { base: GREY, folds: 4, depth: 0.55 }); P.band(w, h - 8, 8, P.tone(GREY, 0.3)); });
  R('cuff', 320, 128, 32, 32, (c, w, h) => { P.cloth(w, h, { base: OCHRE, folds: 0 }); embroidery(c, w, 4, 8); });
  R('hand', 352, 128, 64, 64, (c, w, h) => { P.skin(w, h, { base: SKIN, blush: 0.05 }); for (let i = 0; i < 4; i++) P.seam(w * (0.32 + i * 0.12), h * 0.4, w * (0.32 + i * 0.12), h, 2.5, { dark: 'rgba(80,30,20,0.7)' }); P.vignette(w, h, { bottom: 0.4 }); });
  R('beard', 416, 128, 64, 64, (c, w, h) => { P.hair(w, h, { base: HAIR, sheen: 0.45 }); P.strokes(w, h, { n: 160, len: 18, width: 2.2, angle: Math.PI / 2, jitter: 0.35, cols: [P.tone(HAIR, -0.45), P.tone(HAIR, 0.45, 0.7)], taper: true }); P.vignette(w, h, { top: 0.3, bottom: 0.25 }); });
  R('wood', 480, 128, 32, 128, (c, w, h) => P.wood(w, h, { base: WOOD }));
  R('drum', 0, 256, 128, 32, (c, w, h) => { P.wood(w, h, { base: WOOD }); P.band(w, 0, 6, P.tone(OCHRE, -0.1)); P.band(w, h - 6, 6, P.tone(OCHRE, -0.1)); for (let x = 6; x < w; x += 16) P.rivet(x, h * 0.5, 2, { base: 0xb08a4a }); });
  R('drumskin', 128, 256, 64, 64, (c, w, h) => { P.cloth(w, h, { base: LINEN, folds: 0 }); P.grad(w, h, [[0, 'rgba(0,0,0,0.35)'], [0.4, 'rgba(0,0,0,0)'], [1, 'rgba(255,255,255,0.2)']]); });
  R('water', 192, 256, 32, 32, (c, w, h) => { P.fill(w, h, P.tone(WATER)); P.grad(w, h, [[0, P.tone(WATER, 0.5)], [0.5, P.tone(WATER, 0)], [1, P.tone(WATER, -0.4)]]); P.glow(w * 0.3, h * 0.3, w * 0.35, '255,255,255', 0.6); });
  R('bowl', 224, 256, 64, 64, (c, w, h) => { P.wood(w, h, { base: WOOD }); P.band(w, 0, 8, P.tone(WOOD, 0.25)); P.vignette(w, h, { bottom: 0.6 }); });
  R('ochre', 288, 256, 32, 32, (c, w, h) => P.cloth(w, h, { base: OCHRE, folds: 0 }));
  R('boot', 320, 256, 64, 64, (c, w, h) => P.leather(w, h, { base: LEATHER, straps: 1 }));

  /* ------------------------------------------------------------------ the body */
  // A tall, narrow column next to the warriors: stooped shoulders, a long robe to the ground, and
  // the head lost inside a deep hood, only the beard and nose out in the light.
  const K = createKit(THREE, P);
  const { joint, rings, blob, limb, sheet, add } = K;
  const g = new THREE.Group();

  const hips = joint(g, 0, 1.02, 0);
  const spine = joint(hips, 0, 0.08, 0);
  const head = joint(spine, 0, 0.7, 0.1);
  const lShoulder = joint(spine, 0.34, 0.54, -0.02), rShoulder = joint(spine, -0.34, 0.54, -0.02);
  const lElbow = joint(lShoulder, 0, -0.34, 0), rElbow = joint(rShoulder, 0, -0.34, 0);
  const lHip = joint(hips, 0.13, -0.06, 0), rHip = joint(hips, -0.13, -0.06, 0);
  const lKnee = joint(lHip, 0, -0.42, 0), rKnee = joint(rHip, 0, -0.42, 0);

  // linen robe to the ground under the mantle
  add(hips, rings([{ y: 0.06, rx: 0.3, rz: 0.24 }, { y: -0.5, rx: 0.36, rz: 0.3 }, { y: -0.96, rx: 0.44, rz: 0.38 }, { y: -1.02, rx: 0.44, rz: 0.38 }], 10, { capBottom: true }), 'robe');
  add(hips, rings([{ y: 0.1, rx: 0.31, rz: 0.25 }, { y: 0.02, rx: 0.32, rz: 0.26 }], 10), 'ochre');
  // full-length team mantle from the shoulders, a closed capelet over it
  add(spine, rings([
    { y: 0.6, rx: 0.17, rz: 0.15, z: 0.02 }, { y: 0.5, rx: 0.4, rz: 0.29, z: -0.02 }, { y: 0.3, rx: 0.42, rz: 0.32, z: -0.02 },
    { y: 0.0, rx: 0.38, rz: 0.3 }, { y: -0.4, rx: 0.42, rz: 0.34 }, { y: -0.8, rx: 0.5, rz: 0.42 }, { y: -0.9, rx: 0.52, rz: 0.44 },
  ], 12, { capTop: true }), 'mantle', { mat: K.team2 });
  add(spine, rings([{ y: 0.64, rx: 0.16, rz: 0.14, z: 0.03 }, { y: 0.56, rx: 0.48, rz: 0.36, z: -0.02 }, { y: 0.4, rx: 0.52, rz: 0.4, z: -0.03 }, { y: 0.32, rx: 0.5, rz: 0.38, z: -0.03 }], 12), 'capelet', { mat: K.team2 });
  for (const s of [1, -1]) add(spine, blob(0.05, 0.05, 0.05, 6, 3), 'ochre', { pos: [s * 0.13, 0.5, 0.26] });

  // legs: under the robe, boots at the hem
  for (const [hip, knee] of [[lHip, lKnee], [rHip, rKnee]]) {
    add(hip, limb(0.44, [[0.1, 0.095], [0.09, 0.085], [0.08, 0.075]], 6), 'robe');
    add(knee, limb(0.4, [[0.08, 0.075], [0.085, 0.08], [0.095, 0.09]], 7), 'boot');
    add(knee, rings([{ y: -0.36, rx: 0.09, rz: 0.09, z: 0.02 }, { y: -0.44, rx: 0.11, rz: 0.18, z: 0.08 }, { y: -0.48, rx: 0.1, rz: 0.17, z: 0.08 }], 7, { capBottom: true }), 'boot');
  }

  // head: skull, long lofted grey beard, deep hood with a tall peak set behind the face
  add(head, blob(0.22, 0.25, 0.23, 10, 6), 'head', { pos: [0, 0.16, 0.02] });
  add(head, rings([
    { y: 0.0, rx: 0.16, rz: 0.08, z: 0.15 }, { y: -0.1, rx: 0.2, rz: 0.12, z: 0.16 }, { y: -0.28, rx: 0.17, rz: 0.11, z: 0.18 },
    { y: -0.46, rx: 0.11, rz: 0.08, z: 0.2 }, { y: -0.6, rx: 0.04, rz: 0.04, z: 0.21 },
  ], 8, { capTop: true, capBottom: true }), 'beard');
  add(head, rings([{ y: 0.09, rx: 0.09, rz: 0.035, z: 0.25 }, { y: 0.06, rx: 0.14, rz: 0.05, z: 0.245 }, { y: 0.03, rx: 0.11, rz: 0.04, z: 0.235 }], 8, { capTop: true, capBottom: true }), 'beard');
  const hood = joint(head, 0, 0.22, -0.13); hood.rotation.x = -0.2;
  add(hood, rings([
    { y: 0.62, rx: 0.02, rz: 0.02, z: -0.1 }, { y: 0.48, rx: 0.14, rz: 0.15, z: -0.06 }, { y: 0.3, rx: 0.28, rz: 0.3, z: -0.02 },
    { y: 0.12, rx: 0.3, rz: 0.32 }, { y: -0.08, rx: 0.3, rz: 0.32, z: 0.01 }, { y: -0.16, rx: 0.29, rz: 0.31, z: 0.02 },
  ], 10, { capTop: true }), 'hood', { mat: K.team2 });

  // arms: team sleeves that flare wide, ochre cuffs, big hands
  for (const [sh, el, s] of [[lShoulder, lElbow, 1], [rShoulder, rElbow, -1]]) {
    add(sh, limb(0.34, [[0.13, 0.12], [0.12, 0.115], [0.12, 0.115]], 8), 'sleeve', { mat: K.team });
    add(el, rings([{ y: 0.02, rx: 0.12, rz: 0.115 }, { y: -0.12, rx: 0.15, rz: 0.14 }, { y: -0.24, rx: 0.2, rz: 0.19 }, { y: -0.28, rx: 0.21, rz: 0.2 }], 9), 'sleeve', { mat: K.team2 });
    add(el, rings([{ y: -0.26, rx: 0.215, rz: 0.205 }, { y: -0.3, rx: 0.22, rz: 0.21 }], 9), 'cuff', { mat: K.paint2 });
    add(el, limb(0.22, [[0.05, 0.048], [0.05, 0.048]], 6), 'hand', { pos: [0, -0.14, 0] });
    add(el, blob(0.11, 0.13, 0.1, 8, 5), 'hand', { pos: [0, -0.4, 0.01] });
    add(el, blob(0.045, 0.06, 0.045, 5, 3), 'hand', { pos: [s * 0.09, -0.36, 0.06], rot: [0.5, 0, s * 0.5] });
  }
  lShoulder.rotation.set(-0.5, 0, 0.12);
  lElbow.rotation.set(-1.0, 0, 0);
  rShoulder.rotation.set(-0.25, 0, -0.18);
  rElbow.rotation.set(-0.7, 0, 0);
  spine.rotation.x = 0.1;
  head.rotation.x = -0.05;

  // wooden bowl of water in the left hand
  const bowl = K.holdLevel(g, lElbow, [0, -0.44, 0.03], new THREE.Euler(0, 0, 0));
  add(bowl, rings([{ y: 0.14, rx: 0.2, rz: 0.2 }, { y: 0.06, rx: 0.19, rz: 0.19 }, { y: -0.02, rx: 0.13, rz: 0.13 }, { y: -0.05, rx: 0.08, rz: 0.08 }], 9, { capBottom: true }), 'bowl', { mat: K.paint2 });
  add(bowl, rings([{ y: 0.115, rx: 0.005, rz: 0.005 }, { y: 0.11, rx: 0.185, rz: 0.185 }], 9), 'water');

  // tall staff in the right hand with a rain-drum on top, held level in the world
  const grip = K.holdLevel(g, rElbow, [0, -0.4, 0.02], new THREE.Euler(-0.12, 0, 0.2));
  g.updateMatrixWorld(true);
  const gy = grip.getWorldPosition(new THREE.Vector3()).y;
  const ct = Math.cos(0.12) * Math.cos(0.2), L = (2.4 - gy) / ct, bot = (0.03 - gy) / ct, dT = L - 0.1;
  add(grip, rings([{ y: dT, rx: 0.04, rz: 0.04 }, { y: 0.4, rx: 0.042, rz: 0.042 }, { y: bot + 0.2, rx: 0.046, rz: 0.046 }, { y: bot, rx: 0.05, rz: 0.05 }], 7, { capTop: true, capBottom: true }), 'wood');
  add(grip, rings([{ y: 0.03, rx: 0.06, rz: 0.06 }, { y: -0.03, rx: 0.06, rz: 0.06 }], 7), 'ochre', { pos: [0, 0.3, 0] });
  add(grip, rings([{ y: 0.03, rx: 0.06, rz: 0.06 }, { y: -0.03, rx: 0.06, rz: 0.06 }], 7), 'ochre', { pos: [0, -0.1, 0] });
  const drum = joint(grip, 0, dT, 0); drum.rotation.set(0.12, 0, -0.2);
  add(drum, rings([{ y: 0.08, rx: 0.24, rz: 0.24 }, { y: -0.08, rx: 0.22, rz: 0.22 }], 12), 'drum');
  add(drum, rings([{ y: 0.085, rx: 0.005, rz: 0.005 }, { y: 0.08, rx: 0.235, rz: 0.235 }], 12), 'drumskin');
  add(drum, rings([{ y: -0.08, rx: 0.08, rz: 0.08 }, { y: -0.2, rx: 0.035, rz: 0.035 }], 7, { capBottom: true }), 'wood');
  for (let i = 0; i < 7; i++) {
    const a = i * Math.PI * 2 / 7 + 0.2, x = Math.sin(a) * 0.2, z = Math.cos(a) * 0.2, l = 0.1 + (i % 3) * 0.07;
    add(drum, rings([{ y: -0.08, rx: 0.008, rz: 0.008 }, { y: -0.08 - l, rx: 0.008, rz: 0.008 }], 3), 'ochre', { pos: [x, 0, z] });
    add(drum, rings([{ y: 0, rx: 0.005, rz: 0.005 }, { y: -0.05, rx: 0.03, rz: 0.03 }, { y: -0.09, rx: 0.028, rz: 0.028 }, { y: -0.11, rx: 0.01, rz: 0.01 }], 6, { capTop: true, capBottom: true }), 'water', { pos: [x, -0.08 - l, z] });
  }

  return K.finish(g, { hips, spine, head, lShoulder, lElbow, rShoulder, rElbow, lHip, lKnee, rHip, rKnee });
}
