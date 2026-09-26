// Vietra, Wind Priestess. Painted-atlas build: a dancer with a huge fluted bell skirt, an
// embroidered linen bodice, a team shawl and apron, wide flared sleeves, a blond braid under a
// flower wreath, ribbons streaming from the raised hand and from the top of her staff.
import { createPainter, GREY } from '../paint.js';
import { createKit } from '../charkit.js';

export default function (THREE) {
  const P = createPainter(THREE, 512, 17);
  const R = P.region;
  const LINEN = 0xe6dcc3, OCHRE = 0xc98a2b, SKIN = 0xe8bc9a, BLOND = 0xc7a060, LEATHER = 0x6b4526, WOOD = 0xa27a4f;

  // an embroidered band: ochre ground with a light zigzag and dark stitches, painted across the region
  const embroidery = (c, w, y, bh, ground = OCHRE) => {
    P.band(w, y, bh, P.tone(ground, -0.05));
    c.strokeStyle = P.tone(LINEN, 0.3); c.lineWidth = Math.max(1.5, bh * 0.18); c.beginPath();
    for (let x = 0; x <= w; x += bh) c.lineTo(x, y + bh * (x / bh % 2 ? 0.25 : 0.75));
    c.stroke();
    c.fillStyle = P.tone(0x7a2a2a, -0.2); for (let x = bh * 0.5; x < w; x += bh * 2) c.fillRect(x - 1.5, y + bh * 0.42, 3, 3);
  };

  /* ------------------------------------------------------------------ the atlas */
  R('head', 0, 0, 256, 128, (c, w, h) => P.face(w, h, { base: SKIN, hairCol: BLOND, eye: 0x3a6a8a, eyeY: 0.5, mouthY: 0.75, eyeGap: 0.062, eyeW: 0.048, stern: 0, hairTop: 1, female: true, brow: 0.55, hairline: 0.3 }));
  R('skirt', 256, 0, 256, 128, (c, w, h) => {
    P.cloth(w, h, { base: LINEN, folds: 9, depth: 0.75, sway: 0.5 });
    embroidery(c, w, h - 18, 14); embroidery(c, w, h * 0.62, 8);
    P.vignette(w, h, { top: 0.4, bottom: 0.15 });
  });
  R('bodice', 0, 128, 128, 64, (c, w, h) => {
    P.cloth(w, h, { base: LINEN, folds: 3, depth: 0.4 });
    // chest panel of embroidery down the front, laced
    c.fillStyle = P.tone(OCHRE, -0.1); c.fillRect(w * 0.44, 0, w * 0.12, h);
    P.seam(w * 0.44, 0, w * 0.44, h, 2); P.seam(w * 0.56, 0, w * 0.56, h, 2);
    for (let y = 6; y < h; y += 8) { c.strokeStyle = P.tone(0x7a2a2a, 0.1); c.lineWidth = 1.5; c.beginPath(); c.moveTo(w * 0.46, y); c.lineTo(w * 0.54, y + 4); c.stroke(); }
    P.band(w, h - 10, 10, P.tone(OCHRE, -0.15));
    P.vignette(w, h, { bottom: 0.3, left: 0.3, right: 0.3 });
  });
  R('shawl', 128, 128, 128, 64, (c, w, h) => {
    P.cloth(w, h, { base: GREY, folds: 6, depth: 0.6 });
    // fringe along the hem, an embroidered line above it, in greys so the clan colour tints it
    for (let x = 2; x < w; x += 5) { c.strokeStyle = P.tone(GREY, x % 10 ? -0.4 : 0.35); c.lineWidth = 2; c.beginPath(); c.moveTo(x, h - 10); c.lineTo(x + 1, h); c.stroke(); }
    c.strokeStyle = P.tone(GREY, 0.5); c.lineWidth = 2; c.beginPath(); for (let x = 0; x <= w; x += 6) c.lineTo(x, h - 14 + (x / 6 % 2 ? 3 : -3)); c.stroke();
  });
  R('sleeve', 256, 128, 64, 64, (c, w, h) => { P.cloth(w, h, { base: LINEN, folds: 4, depth: 0.55 }); embroidery(c, w, h - 10, 10); });
  R('hand', 320, 128, 64, 64, (c, w, h) => { P.skin(w, h, { base: SKIN, blush: 0.08 }); for (let i = 0; i < 3; i++) P.seam(w * (0.38 + i * 0.12), h * 0.5, w * (0.38 + i * 0.12), h, 1.5, { dark: 'rgba(120,60,40,0.5)' }); });
  R('braid', 384, 128, 64, 128, (c, w, h) => {
    P.hair(w, h, { base: BLOND, sheen: 0.4 });
    // plaited: alternating diagonal strands with a dark seam between the knots
    for (let y = 0; y < h; y += 14) { P.seam(4, y, w - 4, y + 7, 2.5, { dark: 'rgba(70,40,15,0.55)', light: 'rgba(255,240,200,0.4)' }); P.seam(w - 4, y + 7, 4, y + 14, 2.5, { dark: 'rgba(70,40,15,0.55)', light: 'rgba(255,240,200,0.4)' }); }
  });
  R('wreath', 0, 192, 128, 32, (c, w, h) => { P.cloth(w, h, { base: GREY, folds: 0 }); P.strokes(w, h, { n: 90, len: 8, width: 2, angle: 0.3, jitter: 1.2, cols: [P.tone(GREY, -0.35), P.tone(GREY, 0.35)] }); });
  R('flower', 128, 192, 32, 32, (c, w, h) => { P.fill(w, h, P.tone(LINEN, 0.1)); c.fillStyle = P.tone(OCHRE, 0.15); c.beginPath(); c.arc(w * 0.5, h * 0.5, w * 0.22, 0, Math.PI * 2); c.fill(); for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; c.fillStyle = P.tone(LINEN, -0.2); c.beginPath(); c.arc(w * 0.5 + Math.cos(a) * w * 0.34, h * 0.5 + Math.sin(a) * h * 0.34, w * 0.13, 0, Math.PI * 2); c.fill(); } P.vignette(w, h, { bottom: 0.4 }); });
  R('ribbonT', 160, 192, 32, 128, (c, w, h) => { P.cloth(w, h, { base: GREY, folds: 1, depth: 0.5 }); P.grad(w, h, [[0, 'rgba(255,255,255,0)'], [1, 'rgba(0,0,0,0.3)']]); });
  R('ribbonL', 192, 192, 32, 128, (c, w, h) => { P.cloth(w, h, { base: LINEN, folds: 1, depth: 0.5 }); embroidery(c, w, h - 8, 6); });
  R('wood', 224, 192, 32, 128, (c, w, h) => P.wood(w, h, { base: WOOD }));
  R('boot', 256, 192, 64, 64, (c, w, h) => P.leather(w, h, { base: LEATHER, straps: 1 }));
  R('apron', 256, 256, 96, 128, (c, w, h) => {
    P.cloth(w, h, { base: GREY, folds: 3, depth: 0.55 });
    // a painted diamond lattice and hem, all in greys
    c.strokeStyle = P.tone(GREY, 0.45); c.lineWidth = 1.5;
    for (let y = 16; y < h - 24; y += 16) { c.beginPath(); for (let x = 0; x <= w; x += 8) c.lineTo(x, y + (x / 8 % 2 ? 4 : -4)); c.stroke(); }
    P.band(w, h - 16, 16, P.tone(GREY, -0.4)); c.strokeStyle = P.tone(GREY, 0.5); c.lineWidth = 2; c.beginPath(); for (let x = 0; x <= w; x += 8) c.lineTo(x, h - 8 + (x / 8 % 2 ? 4 : -4)); c.stroke();
  });
  R('ochre', 352, 256, 32, 32, (c, w, h) => P.cloth(w, h, { base: OCHRE, folds: 0 }));
  R('skin', 384, 256, 32, 32, (c, w, h) => P.skin(w, h, { base: SKIN }));
  R('hairtop', 416, 256, 64, 64, (c, w, h) => { P.hair(w, h, { base: BLOND, sheen: 0.5 }); P.strokes(w, h, { n: 60, len: 30, width: 1.5, angle: Math.PI / 2, jitter: 0.15, cols: [P.tone(BLOND, -0.5, 0.6), P.tone(BLOND, 0.5, 0.5)] }); P.vignette(w, h, { bottom: 0.4 }); });

  /* ------------------------------------------------------------------ the body */
  // A slender dancer against the Vitez's bulk, but still an RTS figure: big head, big hands,
  // a skirt as wide as she is tall, sleeves that flare to the width of the head.
  const K = createKit(THREE, P);
  const { joint, rings, blob, limb, sheet, ribbon, flute, add } = K;
  const g = new THREE.Group();

  const hips = joint(g, 0, 0.9, 0);
  const spine = joint(hips, 0, 0.06, 0);
  const head = joint(spine, 0, 0.46, 0.02);
  const lShoulder = joint(spine, 0.25, 0.38, 0), rShoulder = joint(spine, -0.25, 0.38, 0);
  const lElbow = joint(lShoulder, 0, -0.28, 0), rElbow = joint(rShoulder, 0, -0.28, 0);
  const lHip = joint(hips, 0.1, -0.04, 0), rHip = joint(hips, -0.1, -0.04, 0);
  const lKnee = joint(lHip, 0, -0.4, 0), rKnee = joint(rHip, 0, -0.4, 0);

  // skirt: a fluted bell from the waist to the ground, apron over the front
  add(hips, flute(rings([{ y: 0.05, rx: 0.18, rz: 0.15 }, { y: -0.14, rx: 0.22, rz: 0.19 }, { y: -0.4, rx: 0.32, rz: 0.28 }, { y: -0.66, rx: 0.48, rz: 0.43 }, { y: -0.84, rx: 0.62, rz: 0.56 }, { y: -0.9, rx: 0.64, rz: 0.58 }], 14), 0.05, -0.9), 'skirt', { mat: K.paint2 });
  add(hips, sheet(0.26, 0.74, { sag: -0.22, wave: 0.02, taper: 0.5, rows: 6 }), 'apron', { mat: K.team2, pos: [0, 0.04, 0.16], rot: [0.05, 0, 0] });
  add(hips, rings([{ y: 0.09, rx: 0.19, rz: 0.16 }, { y: 0.02, rx: 0.2, rz: 0.17 }], 10), 'ochre');

  // bodice and the team shawl over the shoulders, its points hanging down the front
  add(spine, rings([{ y: 0.46, rx: 0.075, rz: 0.07 }, { y: 0.4, rx: 0.2, rz: 0.15 }, { y: 0.26, rx: 0.21, rz: 0.17 }, { y: 0.1, rx: 0.16, rz: 0.13 }, { y: 0.0, rx: 0.18, rz: 0.15 }], 10, { capTop: true }), 'bodice');
  add(spine, rings([{ y: 0.47, rx: 0.1, rz: 0.09 }, { y: 0.41, rx: 0.3, rz: 0.24 }, { y: 0.28, rx: 0.37, rz: 0.3 }, { y: 0.2, rx: 0.36, rz: 0.3 }], 12), 'shawl', { mat: K.team2 });
  for (const s of [1, -1]) add(spine, sheet(0.14, 0.34, { sag: -0.04, taper: -0.6, rows: 3, cols: 2 }), 'shawl', { mat: K.team2, pos: [s * 0.1, 0.24, 0.17], rot: [0.1, 0, s * 0.15] });
  add(spine, sheet(0.3, 0.42, { sag: 0.05, taper: -0.7, rows: 3, cols: 3 }), 'shawl', { mat: K.team2, pos: [0, 0.3, -0.2], rot: [0, Math.PI, 0] });

  // legs: mostly under the bell; boots show at the hem when she dances
  for (const [hip, knee] of [[lHip, lKnee], [rHip, rKnee]]) {
    add(hip, limb(0.42, [[0.09, 0.085], [0.08, 0.075], [0.07, 0.065]], 6), 'skin');
    add(knee, limb(0.4, [[0.07, 0.065], [0.075, 0.07], [0.085, 0.08]], 7), 'boot');
    add(knee, rings([{ y: -0.36, rx: 0.08, rz: 0.08, z: 0.02 }, { y: -0.43, rx: 0.095, rz: 0.15, z: 0.07 }, { y: -0.46, rx: 0.09, rz: 0.14, z: 0.07 }], 7, { capBottom: true }), 'boot');
  }

  // head: big, blond, a braid down the back, a flower wreath
  add(head, blob(0.19, 0.22, 0.2, 10, 6), 'head', { pos: [0, 0.2, 0.01] });
  add(head, rings([{ y: 0.42, rx: 0.02, rz: 0.02 }, { y: 0.38, rx: 0.12, rz: 0.13 }, { y: 0.3, rx: 0.2, rz: 0.21 }, { y: 0.2, rx: 0.205, rz: 0.215 }, { y: 0.14, rx: 0.19, rz: 0.2 }], 10, { capTop: true }), 'hairtop', { pos: [0, 0, -0.01] });
  add(head, rings([{ y: 0.14, rx: 0.06, rz: 0.055, z: -0.17 }, { y: 0.0, rx: 0.065, rz: 0.06, z: -0.2 }, { y: -0.16, rx: 0.06, rz: 0.055, z: -0.22 }, { y: -0.32, rx: 0.05, rz: 0.045, z: -0.22 }, { y: -0.44, rx: 0.03, rz: 0.03, z: -0.2 }], 7, { capTop: true, capBottom: true }), 'braid');
  add(head, sheet(0.09, 0.14, { sag: 0, taper: 0.2, rows: 2, cols: 1 }), 'ribbonT', { mat: K.team2, pos: [0, -0.4, -0.2] });
  const wreath = joint(head, 0, 0.31, -0.01); wreath.rotation.x = -0.15;
  add(wreath, new THREE.TorusGeometry(0.22, 0.045, 5, 12), 'wreath', { mat: K.team, rot: [Math.PI / 2, 0, 0] });
  for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3 + 0.3; add(wreath, blob(0.05, 0.035, 0.05, 6, 3), 'flower', { pos: [Math.sin(a) * 0.22, 0.04, Math.cos(a) * 0.22] }); }

  // arms: fitted upper sleeve, wide flared cuff, big hands
  for (const [sh, el, s] of [[lShoulder, lElbow, 1], [rShoulder, rElbow, -1]]) {
    add(sh, limb(0.28, [[0.09, 0.085], [0.085, 0.08], [0.08, 0.075]], 8), 'sleeve');
    add(el, rings([{ y: 0.02, rx: 0.08, rz: 0.075 }, { y: -0.1, rx: 0.1, rz: 0.095 }, { y: -0.22, rx: 0.18, rz: 0.17 }, { y: -0.26, rx: 0.2, rz: 0.19 }], 9), 'sleeve', { mat: K.paint2 });
    add(el, limb(0.2, [[0.045, 0.042], [0.045, 0.042]], 6), 'skin', { pos: [0, -0.12, 0] });
    add(el, blob(0.08, 0.1, 0.07, 8, 5), 'hand', { pos: [0, -0.34, 0.01] });
    add(el, blob(0.03, 0.045, 0.03, 5, 3), 'hand', { pos: [s * 0.07, -0.3, 0.05], rot: [0.5, 0, s * 0.5] });
  }
  rShoulder.rotation.set(-0.35, 0, -0.12);
  rElbow.rotation.set(-0.8, 0, 0);
  lShoulder.rotation.set(0, 0, 1.05);
  lElbow.rotation.set(0, 0, 0.75);

  // ribbons streaming from the raised left hand
  const lh = K.holdLevel(g, lElbow, [0, -0.34, 0.01], new THREE.Euler(0, 0, 0));
  add(lh, ribbon(0.85, 0.1, [0.35, -0.6, -0.55], [0, 1, -0.3], 0.12, 0), 'ribbonT', { mat: K.team2 });
  add(lh, ribbon(0.7, 0.085, [0.55, -0.55, -0.2], [0, 1, 0.3], 0.1, 1.5), 'ribbonL', { mat: K.paint2 });
  add(lh, ribbon(0.62, 0.08, [0.15, -0.75, -0.2], [1, 0, 0], 0.09, 2.6), 'ribbonT', { mat: K.team2 });

  // staff in the right hand, kept world-vertical, ribbons off the top ring
  const grip = K.holdLevel(g, rElbow, [0, -0.32, 0.01], new THREE.Euler(0, 0, -0.06));
  g.updateMatrixWorld(true);
  const gy = grip.getWorldPosition(new THREE.Vector3()).y;
  const top = 2.06 - gy, bot = 0.04 - gy;
  add(grip, rings([{ y: top, rx: 0.028, rz: 0.028 }, { y: top - 0.5, rx: 0.03, rz: 0.03 }, { y: bot + 0.3, rx: 0.034, rz: 0.034 }, { y: bot, rx: 0.038, rz: 0.038 }], 7, { capTop: true, capBottom: true }), 'wood');
  add(grip, blob(0.07, 0.07, 0.07, 7, 4), 'ochre', { pos: [0, top, 0] });
  add(grip, new THREE.TorusGeometry(0.1, 0.022, 4, 8), 'wood', { pos: [0, top - 0.12, 0], rot: [Math.PI / 2, 0, 0] });
  add(grip, rings([{ y: 0.03, rx: 0.045, rz: 0.045 }, { y: -0.03, rx: 0.045, rz: 0.045 }], 7), 'ochre', { pos: [0, top - 0.24, 0] });
  const rib = [['ribbonT', K.team2, 1.0, [-0.75, -0.45, -0.35], 0], ['ribbonL', K.paint2, 0.85, [-0.6, -0.55, -0.6], 1.2], ['ribbonT', K.team2, 0.9, [-0.35, -0.5, -0.8], 2.3], ['ribbonL', K.paint2, 0.7, [-0.85, -0.6, 0.05], 3.1], ['ribbonT', K.team2, 0.75, [-0.2, -0.7, 0.55], 4.0]];
  for (const [rg, m, len, dir, ph] of rib) add(grip, ribbon(len, 0.1, dir, [0, 1, 0], 0.13, ph), rg, { mat: m, pos: [0, top - 0.12, 0] });

  return K.finish(g, { hips, spine, head, lShoulder, lElbow, rShoulder, rElbow, lHip, lKnee, rHip, rKnee });
}
