// Vitez, heavy warrior. Painted-atlas build (the first style study): a bulky mail-clad
// axeman with a fur mantle, spangenhelm with nasal, forked beard, big fists and boots, a domed
// team-colour shield and a long bearded axe. ~1,600 triangles, one 512 atlas, one material.
import { createPainter, GREY } from '../paint.js';
import { createKit } from '../charkit.js';

export default function (THREE) {
  const P = createPainter(THREE, 512, 41);
  const R = P.region;
  const IRON = 0x6e757c, LEATHER = 0x6b4526, SKIN = 0xd9a07a, HAIR = 0x3b2618, FUR = 0x5a3b22, WOOD = 0x5e4029, WOOL = 0x4a3f38;

  /* ------------------------------------------------------------------ the atlas */
  R('head', 0, 0, 256, 128, (c, w, h) => {
    P.face(w, h, { base: SKIN, hairCol: HAIR, eyeY: 0.47, mouthY: 0.72, eyeGap: 0.085, eyeW: 0.05, beard: 1, stern: 1, hairTop: 1, nose: 0 });
    // cheek guards of the helmet, painted where the skull is covered at the sides
  });
  R('torso', 256, 0, 256, 128, (c, w, h) => {
    P.mail(w, h, { base: IRON, ring: 5 });
    // crossing leather harness with a bronze ring where the straps meet on the chest
    c.save(); c.lineCap = 'round'; c.lineWidth = 11;
    c.strokeStyle = P.tone(LEATHER, -0.5); c.beginPath(); c.moveTo(w * 0.34, 4); c.lineTo(w * 0.66, h * 0.7); c.moveTo(w * 0.66, 4); c.lineTo(w * 0.34, h * 0.7); c.stroke();
    c.lineWidth = 7; c.strokeStyle = P.tone(LEATHER, 0.05); c.beginPath(); c.moveTo(w * 0.34, 4); c.lineTo(w * 0.66, h * 0.7); c.moveTo(w * 0.66, 4); c.lineTo(w * 0.34, h * 0.7); c.stroke();
    c.restore();
    P.stitches(w * 0.34, 6, w * 0.66, h * 0.7, { step: 9, len: 2 }); P.stitches(w * 0.66, 6, w * 0.34, h * 0.7, { step: 9, len: 2 });
    P.rivet(w * 0.5, h * 0.36, 7, { base: 0xb08a4a });
    P.band(w, h - 14, 14, P.tone(LEATHER, -0.2));
  });
  R('helm', 0, 128, 128, 64, (c, w, h) => {
    P.iron(w, h, { base: IRON, bevel: 0, spec: 0.9, band: 0.3 });
    // spangen ribs: four dark seams with a light edge, a brow band with rivets
    for (let i = 0; i < 4; i++) P.seam(w * (i + 0.5) / 4, 0, w * (i + 0.5) / 4, h, 3);
    P.band(w, h - 16, 16, P.tone(0xb08a4a, -0.1));
    for (let i = 0; i < 8; i++) P.rivet(w * (i + 0.5) / 8, h - 8, 3, { base: 0xd6b060 });
  });
  R('mantle', 128, 128, 128, 64, (c, w, h) => P.fur(w, h, { base: FUR, tip: 0.55 }));
  R('shield', 256, 128, 128, 128, (c, w, h) => {
    // polar unwrap: u = around, v top = centre (boss), bottom = rim
    P.cloth(w, h, { base: GREY, folds: 0, depth: 0 });
    P.grad(w, h, [[0, P.tone(GREY, 0.3)], [0.55, P.tone(GREY, 0)], [1, P.tone(GREY, -0.35)]]);
    for (let i = 0; i < 8; i++) P.seam(w * i / 8, h * 0.15, w * i / 8, h, 2, { dark: 'rgba(0,0,0,0.35)' });   // radial planks
    P.strokes(w, h, { n: 120, len: 14, width: 1.5, angle: Math.PI / 2, jitter: 0.1, cols: ['rgba(0,0,0,0.12)', 'rgba(255,255,255,0.12)'] });
    P.band(w, h - 14, 14, P.tone(IRON, -0.1)); for (let i = 0; i < 12; i++) P.rivet(w * (i + 0.5) / 12, h - 7, 2.5);
    P.band(w, 0, 14, P.tone(IRON, 0.2));        // boss seat
    P.band(w, h * 0.5 - 4, 8, P.tone(IRON, -0.3)); for (let i = 0; i < 8; i++) P.rivet(w * (i + 0.5) / 8, h * 0.5, 2.5);
  });
  R('blade', 384, 128, 128, 128, (c, w, h) => {
    P.iron(w, h, { base: IRON, bevel: 0, spec: 1, band: 0.4, rust: 0.1 });
    // the cutting edge is on the right: a bright bevel
    P.grad(w, h, [[0.7, 'rgba(255,255,255,0)'], [0.9, 'rgba(255,255,255,0.55)'], [1, 'rgba(255,255,255,0.9)']], 'h');
    P.seam(w * 0.68, 4, w * 0.68, h - 4, 2, { dark: 'rgba(0,0,0,0.35)', light: 'rgba(255,255,255,0.15)' });
  });
  R('pauldron', 0, 192, 64, 64, (c, w, h) => {
    // v: spike at the top, riveted rim at the bottom
    P.iron(w, h, { base: IRON, bevel: 0, spec: 0.4, band: 0.3 });
    for (let i = 0; i < 4; i++) P.seam(w * (i + 0.5) / 4, 0, w * (i + 0.5) / 4, h * 0.7, 2);
    P.band(w, h * 0.72, 10, P.tone(IRON, -0.25));
    for (let i = 0; i < 6; i++) P.rivet(w * (i + 0.5) / 6, h * 0.77, 2.6, { base: 0xd6b060 });
    P.vignette(w, h, { bottom: 0.5 });
  });
  R('sleeve', 64, 192, 64, 64, (c, w, h) => P.mail(w, h, { base: IRON, ring: 4 }));
  R('bracer', 128, 192, 64, 64, (c, w, h) => P.leather(w, h, { base: LEATHER, straps: 2 }));
  R('hand', 192, 192, 64, 64, (c, w, h) => {
    P.skin(w, h, { base: SKIN, blush: 0.1 });
    // knuckles on the front (u = 0.5), fingers as dark seams
    for (let i = 0; i < 4; i++) P.seam(w * (0.32 + i * 0.12), h * 0.4, w * (0.32 + i * 0.12), h, 3, { dark: 'rgba(80,30,20,0.75)', light: 'rgba(255,230,200,0.35)' });
    P.seam(w * 0.28, h * 0.42, w * 0.72, h * 0.42, 3, { dark: 'rgba(80,30,20,0.6)' });
    for (let i = 0; i < 4; i++) P.glow(w * (0.38 + i * 0.12), h * 0.48, 5, '255,225,200', 0.45);
    P.vignette(w, h, { bottom: 0.4 });
  });
  R('kilt', 0, 256, 128, 128, (c, w, h) => {
    P.cloth(w, h, { base: GREY, folds: 4, depth: 0.7 });
    // embroidered hem, painted in greys so the clan colour tints it
    P.band(w, h - 20, 20, P.tone(GREY, -0.45));
    for (let x = 6; x < w; x += 14) { c.strokeStyle = P.tone(GREY, 0.5); c.lineWidth = 2; c.beginPath(); c.moveTo(x, h - 6); c.lineTo(x + 7, h - 16); c.lineTo(x + 14, h - 6); c.stroke(); }
    P.vignette(w, h, { top: 0.35 });
  });
  R('skirt', 128, 256, 128, 64, (c, w, h) => { P.mail(w, h, { base: IRON, ring: 5 }); P.band(w, h - 8, 8, P.tone(IRON, -0.5)); });
  R('belt', 128, 320, 128, 32, (c, w, h) => {
    P.leather(w, h, { base: LEATHER, stitch: true });
    P.band(w, 0, h, 'rgba(0,0,0,0)', { dark: 'rgba(0,0,0,0.5)', light: 'rgba(255,240,200,0.35)' });
    // buckle at the front (u = 0.5)
    c.fillStyle = P.tone(0xb08a4a, -0.35); c.fillRect(w * 0.5 - 12, 5, 24, h - 10);
    c.fillStyle = P.tone(0xb08a4a, 0.3); c.fillRect(w * 0.5 - 10, 7, 20, h - 14);
    c.fillStyle = P.tone(0xb08a4a, -0.5); c.fillRect(w * 0.5 - 6, 10, 12, h - 20);
  });
  R('trousers', 256, 256, 64, 64, (c, w, h) => P.cloth(w, h, { base: WOOL, folds: 3, depth: 0.5 }));
  R('boot', 320, 256, 64, 128, (c, w, h) => {
    P.leather(w, h, { base: LEATHER, straps: 3 });
    P.band(w, 0, 12, P.tone(FUR, -0.1));    // fur cuff
  });
  R('beard', 384, 256, 64, 64, (c, w, h) => { P.hair(w, h, { base: 0x5c3e2a, sheen: 0.55 }); P.strokes(w, h, { n: 160, len: 18, width: 2.2, angle: Math.PI / 2, jitter: 0.4, cols: [P.tone(HAIR, -0.4), P.tone(0x8a6a48, 0.35, 0.7), P.tone(0xa88a60, 0.3, 0.5)], taper: true }); P.vignette(w, h, { top: 0.35, bottom: 0.3 }); });
  R('wood', 448, 256, 32, 128, (c, w, h) => P.wood(w, h, { base: WOOD }));
  R('iron', 0, 384, 64, 64, (c, w, h) => P.iron(w, h, { base: IRON, bevel: 3, spec: 0.5, band: 0.3 }));
  R('strap', 64, 384, 64, 32, (c, w, h) => P.leather(w, h, { base: LEATHER, stitch: true }));
  R('foot', 128, 384, 64, 64, (c, w, h) => { P.leather(w, h, { base: LEATHER, stitch: false }); P.seam(4, h * 0.45, w - 4, h * 0.45, 3); P.vignette(w, h, { bottom: 0.7 }); });
  R('bronze', 192, 384, 32, 32, (c, w, h) => P.iron(w, h, { base: 0xb08a4a, bevel: 2, spec: 0.8, rust: 0 }));

  /* ------------------------------------------------------------------ the body */
  // Warcraft III anatomy: shoulders twice the width of the hips, a barrel chest hunched forward
  // over a small waist, forearms fatter than the upper arms, fists and boots the size of the head,
  // a wide bent-knee stance, and a weapon too big to be sensible.
  const K = createKit(THREE, P);
  const { joint, rings, blob, limb, plate, sheet, add } = K;
  const g = new THREE.Group();

  const hips = joint(g, 0, 1.0, 0);
  const spine = joint(hips, 0, 0.1, 0);
  const head = joint(spine, 0, 0.7, 0.12);
  const lShoulder = joint(spine, 0.5, 0.5, -0.02), rShoulder = joint(spine, -0.5, 0.5, -0.02);
  const lElbow = joint(lShoulder, 0, -0.34, 0), rElbow = joint(rShoulder, 0, -0.34, 0);
  const lHip = joint(hips, 0.2, -0.06, 0), rHip = joint(hips, -0.2, -0.06, 0);
  const lKnee = joint(lHip, 0, -0.42, 0), rKnee = joint(rHip, 0, -0.42, 0);

  // torso: mail hauberk, barrel chest, hunched upper back; fur mantle heaped on the shoulders
  add(spine, rings([
    { y: 0.62, rx: 0.17, rz: 0.15, z: 0.04 }, { y: 0.54, rx: 0.5, rz: 0.3, z: -0.02 }, { y: 0.4, rx: 0.55, rz: 0.37, z: -0.02 },
    { y: 0.22, rx: 0.47, rz: 0.36 }, { y: 0.04, rx: 0.34, rz: 0.27 }, { y: -0.1, rx: 0.33, rz: 0.26 },
  ], 10, { capTop: true }), 'torso');
  add(spine, rings([{ y: 0.66, rx: 0.22, rz: 0.19, z: 0.03 }, { y: 0.58, rx: 0.6, rz: 0.38, z: -0.03 }, { y: 0.44, rx: 0.62, rz: 0.44, z: -0.04 }, { y: 0.36, rx: 0.55, rz: 0.4, z: -0.03 }], 10), 'mantle', { mat: K.paint2 });

  // hips: belt, mail skirt, team kilt front and back
  add(hips, rings([{ y: 0.1, rx: 0.34, rz: 0.27 }, { y: -0.04, rx: 0.36, rz: 0.29 }], 10), 'belt');
  add(hips, rings([{ y: -0.02, rx: 0.33, rz: 0.26 }, { y: -0.2, rx: 0.4, rz: 0.31 }, { y: -0.34, rx: 0.45, rz: 0.35 }], 10), 'skirt', { mat: K.paint2 });
  for (const s of [1, -1]) add(hips, sheet(0.36, 0.52, { sag: -0.1, wave: 0.014, taper: 0.2 }), 'kilt', { mat: K.team2, pos: [0, 0.04, 0.3 * s], rot: [s * 0.12, s > 0 ? 0 : Math.PI, 0] });

  // legs: thick thighs, boots flaring over the shin, feet as long as the shin is wide
  for (const [hip, knee, s] of [[lHip, lKnee, 1], [rHip, rKnee, -1]]) {
    add(hip, limb(0.46, [[0.2, 0.19], [0.18, 0.17], [0.15, 0.145]], 8), 'trousers');
    add(knee, limb(0.4, [[0.15, 0.145], [0.165, 0.15], [0.185, 0.165], [0.2, 0.18]], 8), 'boot');
    add(knee, rings([{ y: -0.36, rx: 0.19, rz: 0.19, z: 0.04 }, { y: -0.44, rx: 0.22, rz: 0.29, z: 0.1 }, { y: -0.48, rx: 0.21, rz: 0.28, z: 0.1 }], 8, { capBottom: true }), 'foot');
    hip.rotation.set(-0.12, 0, s * 0.14); knee.rotation.set(0.22, 0, -s * 0.06);
  }

  // head: sunk between the shoulders, tilted up under a spangenhelm; forked beard for the silhouette
  add(head, blob(0.25, 0.28, 0.26, 10, 6), 'head', { pos: [0, 0.18, 0.02] });
  add(head, rings([
    { y: 0.64, rx: 0.014, rz: 0.014 }, { y: 0.56, rx: 0.12, rz: 0.12 }, { y: 0.45, rx: 0.25, rz: 0.26 },
    { y: 0.35, rx: 0.29, rz: 0.3 }, { y: 0.26, rx: 0.295, rz: 0.305 }, { y: 0.22, rx: 0.3, rz: 0.31 },
  ], 10, { capTop: true }), 'helm');
  add(head, new THREE.BoxGeometry(0.06, 0.2, 0.035), 'iron', { pos: [0, 0.15, 0.285] });
  for (const s of [1, -1]) add(head, plate([[-0.07, 0.12], [0.07, 0.12], [0.08, -0.1], [0, -0.16], [-0.08, -0.1]], 0.025), 'iron', { pos: [s * 0.22, 0.1, 0.08], rot: [0, s * (Math.PI / 2 - 0.5), 0] });
  // beard: a lofted mass hanging from the jaw, forked into two braids, and a moustache bar over the lip
  add(head, rings([
    { y: 0.01, rx: 0.17, rz: 0.09, z: 0.16 }, { y: -0.08, rx: 0.22, rz: 0.13, z: 0.17 }, { y: -0.2, rx: 0.19, rz: 0.12, z: 0.18 },
    { y: -0.32, rx: 0.12, rz: 0.08, z: 0.19 }, { y: -0.4, rx: 0.05, rz: 0.045, z: 0.19 },
  ], 8, { capTop: true, capBottom: true }), 'beard');
  for (const s of [1, -1]) add(head, rings([{ y: -0.3, rx: 0.065, rz: 0.055, x: s * 0.07, z: 0.19 }, { y: -0.44, rx: 0.05, rz: 0.045, x: s * 0.1, z: 0.18 }, { y: -0.52, rx: 0.02, rz: 0.02, x: s * 0.11, z: 0.17 }], 6, { capBottom: true }), 'beard');
  add(head, rings([{ y: 0.1, rx: 0.1, rz: 0.035, z: 0.27 }, { y: 0.07, rx: 0.15, rz: 0.05, z: 0.265 }, { y: 0.04, rx: 0.12, rz: 0.04, z: 0.255 }], 8, { capTop: true, capBottom: true }), 'beard');

  // arms: spiked pauldrons, mail sleeves, bulging leather bracers, fists like hams
  for (const [sh, el, s] of [[lShoulder, lElbow, 1], [rShoulder, rElbow, -1]]) {
    const big = s < 0 ? 1.15 : 1;   // the axe side carries the bigger pauldron
    const pauldron = (k) => rings([{ y: 0.2 * k, rx: 0.03, rz: 0.03 }, { y: 0.14 * k, rx: 0.17 * k, rz: 0.15 * k }, { y: 0.05 * k, rx: 0.27 * k, rz: 0.24 * k }, { y: -0.05 * k, rx: 0.3 * k, rz: 0.27 * k }, { y: -0.08 * k, rx: 0.28 * k, rz: 0.25 * k }], 8, { capTop: true, capBottom: true });
    add(sh, pauldron(big), 'pauldron', { pos: [s * 0.04, 0.06, 0], rot: [0, 0, -s * 0.4] });
    add(sh, pauldron(big * 0.75), 'pauldron', { pos: [s * 0.1, -0.1, 0], rot: [0, 0, -s * 0.6] });
    add(sh, limb(0.36, [[0.16, 0.15], [0.14, 0.135], [0.125, 0.12]], 8), 'sleeve');
    add(el, limb(0.32, [[0.135, 0.13], [0.185, 0.175], [0.17, 0.16]], 8), 'bracer');
    add(el, blob(0.16, 0.17, 0.15, 10, 5), 'hand', { pos: [0, -0.4, 0.02] });
    add(el, blob(0.06, 0.085, 0.06, 6, 3), 'hand', { pos: [s * 0.13, -0.35, 0.09], rot: [0.5, 0, s * 0.5] });
  }
  lShoulder.rotation.set(-0.25, 0, 0.32);
  lElbow.rotation.set(-1.0, 0, 0);
  rShoulder.rotation.set(-0.2, 0, -0.3);
  rElbow.rotation.set(-0.75, 0, 0);
  spine.rotation.x = 0.16;   // the hunch
  head.rotation.x = -0.18;

  // shield: a domed disc held on the left forearm, boss and rim
  const shield = K.holdLevel(g, lElbow, [0.02, -0.2, 0], new THREE.Euler(0, 0.4, 0));
  const face = joint(shield, 0, 0, 0.2); face.rotation.x = Math.PI / 2;
  add(face, rings([{ y: 0.12, rx: 0.02, rz: 0.02 }, { y: 0.1, rx: 0.17, rz: 0.17 }, { y: 0.04, rx: 0.4, rz: 0.4 }, { y: 0.0, rx: 0.5, rz: 0.5 }, { y: -0.04, rx: 0.51, rz: 0.51 }, { y: -0.05, rx: 0.48, rz: 0.48 }], 12, { capTop: true, capBottom: true }), 'shield', { mat: K.team });
  add(face, blob(0.14, 0.1, 0.14, 8, 4), 'iron', { pos: [0, 0.12, 0] });

  // axe: long haft, bearded blade, collar
  const axe = K.holdLevel(g, rElbow, [0, -0.4, 0.03], new THREE.Euler(0.22, 0, 0));
  add(axe, rings([{ y: 1.12, rx: 0.024, rz: 0.024 }, { y: 1.06, rx: 0.045, rz: 0.045 }, { y: 0.0, rx: 0.04, rz: 0.04 }, { y: -0.34, rx: 0.046, rz: 0.046 }, { y: -0.5, rx: 0.056, rz: 0.056 }], 7, { capTop: true, capBottom: true }), 'wood');
  add(axe, rings([{ y: 0.08, rx: 0.052, rz: 0.052 }, { y: -0.16, rx: 0.052, rz: 0.052 }], 7), 'strap');
  add(axe, rings([{ y: 1.0, rx: 0.072, rz: 0.072 }, { y: 0.78, rx: 0.07, rz: 0.07 }], 7), 'iron');
  add(axe, plate([[-0.08, 0.1], [0.06, 0.1], [0.2, 0.2], [0.34, 0.26], [0.42, 0.0], [0.4, -0.34], [0.16, -0.36], [0.1, -0.2], [0.06, -0.08], [-0.08, -0.08]], 0.06), 'blade', { pos: [0, 0.88, 0.0], rot: [0, Math.PI, 0], scale: [1.3, 1.3, 1] });

  return K.finish(g, { hips, spine, head, lShoulder, lElbow, rShoulder, rElbow, lHip, lKnee, rHip, rKnee });
}
