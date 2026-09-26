// Streletz, archer. Painted-atlas build: a broad-shouldered bowman in a belted linen tunic with a
// leather harness, fur kolpak with a team-cloth crown, drooping moustache, quiver of team-fletched
// arrows on his back, bracers, tall boots, and a recurve bow taller than he is.
import { createPainter, GREY } from '../paint.js';
import { createKit } from '../charkit.js';

export default function (THREE) {
  const P = createPainter(THREE, 512, 23);
  const R = P.region;
  const LINEN = 0xe6dcc3, LEATHER = 0x6b4526, SKIN = 0xd9a07a, HAIR = 0x3b2618, FUR = 0x5a3b22, WOOD = 0xa27a4f, WOOL = 0x4a3f38, OCHRE = 0xc98a2b;

  /* ------------------------------------------------------------------ the atlas */
  R('head', 0, 0, 256, 128, (c, w, h) => P.face(w, h, { base: SKIN, hairCol: HAIR, eyeY: 0.47, mouthY: 0.72, eyeGap: 0.085, eyeW: 0.05, stern: 0.7, hairTop: 1, moustache: 1.2 }));
  R('tunic', 256, 0, 256, 128, (c, w, h) => {
    P.cloth(w, h, { base: LINEN, folds: 7, depth: 0.55 });
    // embroidered collar and a leather harness strap crossing the chest to the quiver
    P.band(w, 0, 12, P.tone(OCHRE, -0.1));
    c.save(); c.lineCap = 'round'; c.lineWidth = 12; c.strokeStyle = P.tone(LEATHER, -0.5); c.beginPath(); c.moveTo(w * 0.62, 6); c.lineTo(w * 0.4, h * 0.72); c.stroke();
    c.lineWidth = 8; c.strokeStyle = P.tone(LEATHER, 0.05); c.beginPath(); c.moveTo(w * 0.62, 6); c.lineTo(w * 0.4, h * 0.72); c.stroke(); c.restore();
    P.stitches(w * 0.62, 8, w * 0.4, h * 0.72, { step: 9, len: 2 });
    P.band(w, h - 16, 16, P.tone(LEATHER, -0.2));
    c.fillStyle = P.tone(0xb08a4a, -0.3); c.fillRect(w * 0.5 - 9, h - 15, 18, 14); c.fillStyle = P.tone(0xb08a4a, 0.3); c.fillRect(w * 0.5 - 7, h - 13, 14, 10); c.fillStyle = P.tone(0xb08a4a, -0.5); c.fillRect(w * 0.5 - 4, h - 11, 8, 6);
  });
  R('kolpak', 0, 128, 128, 64, (c, w, h) => P.fur(w, h, { base: FUR, tip: 0.5 }));
  R('crown', 0, 192, 128, 32, (c, w, h) => { P.cloth(w, h, { base: GREY, folds: 4, depth: 0.5 }); P.vignette(w, h, { bottom: 0.5 }); });
  R('sash', 128, 128, 64, 64, (c, w, h) => { P.cloth(w, h, { base: GREY, folds: 3, depth: 0.6 }); P.band(w, h - 8, 8, P.tone(GREY, -0.4)); });
  R('skirt', 192, 128, 128, 64, (c, w, h) => { P.cloth(w, h, { base: LINEN, folds: 6, depth: 0.6 }); P.band(w, h - 10, 10, P.tone(LEATHER, -0.2)); P.vignette(w, h, { top: 0.4 }); });
  R('sleeve', 320, 128, 64, 64, (c, w, h) => P.cloth(w, h, { base: LINEN, folds: 4, depth: 0.5 }));
  R('bracer', 384, 128, 64, 64, (c, w, h) => P.leather(w, h, { base: LEATHER, straps: 3 }));
  R('hand', 448, 128, 64, 64, (c, w, h) => {
    P.skin(w, h, { base: SKIN, blush: 0.1 });
    for (let i = 0; i < 4; i++) P.seam(w * (0.32 + i * 0.12), h * 0.4, w * (0.32 + i * 0.12), h, 3, { dark: 'rgba(80,30,20,0.75)', light: 'rgba(255,230,200,0.35)' });
    P.seam(w * 0.28, h * 0.42, w * 0.72, h * 0.42, 3, { dark: 'rgba(80,30,20,0.6)' });
    P.vignette(w, h, { bottom: 0.4 });
  });
  R('quiver', 128, 192, 64, 128, (c, w, h) => { P.leather(w, h, { base: LEATHER, straps: 2 }); P.band(w, 0, 10, P.tone(FUR, -0.1)); });
  R('quivercap', 192, 192, 32, 32, (c, w, h) => { P.cloth(w, h, { base: GREY, folds: 0 }); P.band(w, h - 6, 6, P.tone(GREY, -0.4)); });
  R('fletch', 224, 192, 32, 32, (c, w, h) => { P.cloth(w, h, { base: GREY, folds: 0 }); P.strokes(w, h, { n: 30, len: 10, width: 1.2, angle: 0.4, jitter: 0.1, cols: [P.tone(GREY, -0.35), P.tone(GREY, 0.35)] }); });
  R('bow', 256, 192, 32, 128, (c, w, h) => { P.wood(w, h, { base: WOOD }); for (let y = 8; y < h; y += 16) P.seam(2, y, w - 2, y + 2, 1.5, { dark: 'rgba(0,0,0,0.25)', light: 'rgba(255,240,200,0.2)' }); });
  R('trousers', 288, 192, 64, 64, (c, w, h) => P.cloth(w, h, { base: WOOL, folds: 3, depth: 0.5 }));
  R('boot', 352, 192, 64, 128, (c, w, h) => { P.leather(w, h, { base: LEATHER, straps: 2 }); P.band(w, 0, 12, P.tone(FUR, -0.1)); });
  R('foot', 416, 192, 64, 64, (c, w, h) => { P.leather(w, h, { base: LEATHER, stitch: false }); P.seam(4, h * 0.45, w - 4, h * 0.45, 3); P.vignette(w, h, { bottom: 0.7 }); });
  R('hair', 0, 256, 64, 64, (c, w, h) => { P.hair(w, h, { base: HAIR, sheen: 0.4 }); P.vignette(w, h, { top: 0.4 }); });
  R('wood', 64, 256, 32, 64, (c, w, h) => P.wood(w, h, { base: WOOD }));
  R('string', 96, 256, 16, 64, (c, w, h) => P.cloth(w, h, { base: LINEN, folds: 0 }));
  R('bronze', 112, 256, 32, 32, (c, w, h) => P.iron(w, h, { base: 0xb08a4a, bevel: 2, spec: 0.6, rust: 0 }));

  /* ------------------------------------------------------------------ the body */
  // Leaner than the Vitez but the same anatomy rules: wide shoulders, small waist, thick forearms,
  // big fists and boots, a slight forward lean, weight on the back foot as if about to draw.
  const K = createKit(THREE, P);
  const { joint, rings, blob, limb, plate, sheet, add } = K;
  const g = new THREE.Group();

  const hips = joint(g, 0, 1.0, 0);
  const spine = joint(hips, 0, 0.08, 0);
  const head = joint(spine, 0, 0.66, 0.08);
  const lShoulder = joint(spine, 0.42, 0.48, -0.02), rShoulder = joint(spine, -0.42, 0.48, -0.02);
  const lElbow = joint(lShoulder, 0, -0.34, 0), rElbow = joint(rShoulder, 0, -0.34, 0);
  const lHip = joint(hips, 0.17, -0.06, 0), rHip = joint(hips, -0.17, -0.06, 0);
  const lKnee = joint(lHip, 0, -0.42, 0), rKnee = joint(rHip, 0, -0.42, 0);

  // torso: belted tunic
  add(spine, rings([
    { y: 0.6, rx: 0.16, rz: 0.14, z: 0.03 }, { y: 0.52, rx: 0.44, rz: 0.28, z: -0.01 }, { y: 0.38, rx: 0.47, rz: 0.32, z: -0.01 },
    { y: 0.2, rx: 0.4, rz: 0.3 }, { y: 0.04, rx: 0.32, rz: 0.25 }, { y: -0.1, rx: 0.32, rz: 0.25 },
  ], 10, { capTop: true }), 'tunic');
  // tunic skirt, team sash with a hanging tail, quiver on the back
  add(hips, rings([{ y: 0.06, rx: 0.33, rz: 0.26 }, { y: -0.16, rx: 0.38, rz: 0.3 }, { y: -0.36, rx: 0.42, rz: 0.34 }], 10), 'skirt', { mat: K.paint2 });
  add(hips, rings([{ y: 0.12, rx: 0.34, rz: 0.27 }, { y: 0.0, rx: 0.36, rz: 0.29 }], 10), 'sash', { mat: K.team });
  add(hips, sheet(0.14, 0.4, { sag: 0.03, taper: -0.3, rows: 3, cols: 2 }), 'sash', { mat: K.team2, pos: [0.22, 0.04, 0.2], rot: [0.1, -0.5, 0.15] });
  add(hips, blob(0.06, 0.05, 0.06, 6, 3), 'sash', { mat: K.team, pos: [0.2, 0.06, 0.22] });
  const quiver = joint(spine, -0.08, 0.28, -0.32); quiver.rotation.set(-0.15, 0, 0.5);
  add(quiver, rings([{ y: 0.32, rx: 0.11, rz: 0.11 }, { y: 0.1, rx: 0.1, rz: 0.1 }, { y: -0.3, rx: 0.08, rz: 0.08 }], 8, { capBottom: true }), 'quiver');
  add(quiver, rings([{ y: 0.34, rx: 0.12, rz: 0.12 }, { y: 0.22, rx: 0.115, rz: 0.115 }], 8), 'quivercap', { mat: K.team });
  for (let i = 0; i < 5; i++) {
    const a = i * 1.26, x = Math.sin(a) * 0.05, z = Math.cos(a) * 0.05;
    const ar = joint(quiver, x, 0.3, z); ar.rotation.set(z * 2, 0, -x * 2);
    add(ar, rings([{ y: 0.24, rx: 0.01, rz: 0.01 }, { y: 0, rx: 0.01, rz: 0.01 }], 4), 'wood');
    add(ar, plate([[0, 0], [0.035, 0.03], [0.035, 0.13], [0, 0.11]], 0.006), 'fletch', { mat: K.team2, pos: [0, 0.14, 0], rot: [0, a, 0] });
    add(ar, plate([[0, 0], [-0.035, 0.03], [-0.035, 0.13], [0, 0.11]], 0.006), 'fletch', { mat: K.team2, pos: [0, 0.14, 0], rot: [0, a, 0] });
  }

  // legs
  for (const [hip, knee, s] of [[lHip, lKnee, 1], [rHip, rKnee, -1]]) {
    add(hip, limb(0.46, [[0.17, 0.16], [0.15, 0.145], [0.13, 0.125]], 8), 'trousers');
    add(knee, limb(0.4, [[0.13, 0.125], [0.14, 0.13], [0.16, 0.145], [0.17, 0.155]], 8), 'boot');
    add(knee, rings([{ y: -0.36, rx: 0.16, rz: 0.16, z: 0.04 }, { y: -0.44, rx: 0.19, rz: 0.26, z: 0.09 }, { y: -0.48, rx: 0.18, rz: 0.25, z: 0.09 }], 8, { capBottom: true }), 'foot');
    hip.rotation.set(-0.06 + s * 0.08, 0, s * 0.1); knee.rotation.set(0.14, 0, -s * 0.04);
  }

  // head: skull, drooping moustache in relief, fur kolpak with a team crown and a fur tassel
  add(head, blob(0.24, 0.27, 0.25, 10, 6), 'head', { pos: [0, 0.18, 0.02] });
  for (const s of [1, -1]) add(head, rings([{ y: 0.12, rx: 0.035, rz: 0.03, x: s * 0.05, z: 0.26 }, { y: 0.06, rx: 0.045, rz: 0.035, x: s * 0.13, z: 0.24 }, { y: -0.06, rx: 0.025, rz: 0.022, x: s * 0.17, z: 0.2 }], 6, { capTop: true, capBottom: true }), 'hair');
  const cap = joint(head, 0, 0.36, -0.01); cap.rotation.x = -0.1;
  add(cap, rings([{ y: 0.16, rx: 0.24, rz: 0.25 }, { y: 0.08, rx: 0.3, rz: 0.31 }, { y: -0.04, rx: 0.3, rz: 0.31 }, { y: -0.12, rx: 0.27, rz: 0.28 }], 10, { capBottom: true }), 'kolpak', { mat: K.paint2 });
  add(cap, rings([{ y: 0.36, rx: 0.02, rz: 0.02 }, { y: 0.3, rx: 0.14, rz: 0.14 }, { y: 0.2, rx: 0.23, rz: 0.24 }, { y: 0.14, rx: 0.245, rz: 0.255 }], 9, { capTop: true }), 'crown', { mat: K.team });
  add(cap, blob(0.05, 0.05, 0.05, 6, 3), 'kolpak', { pos: [0, 0.37, 0] });

  // arms: linen sleeves, leather bracers, big fists
  for (const [sh, el, s] of [[lShoulder, lElbow, 1], [rShoulder, rElbow, -1]]) {
    add(sh, blob(0.19, 0.12, 0.17, 8, 4, { squash: 0.3 }), 'tunic', { pos: [s * 0.02, 0.04, 0], rot: [0, 0, -s * 0.3] });
    add(sh, limb(0.36, [[0.15, 0.14], [0.13, 0.125], [0.115, 0.11]], 8), 'sleeve');
    add(el, limb(0.32, [[0.12, 0.115], [0.165, 0.155], [0.15, 0.14]], 8), 'bracer');
    add(el, blob(0.145, 0.155, 0.135, 10, 5), 'hand', { pos: [0, -0.38, 0.02] });
    add(el, blob(0.055, 0.075, 0.055, 6, 3), 'hand', { pos: [s * 0.12, -0.33, 0.08], rot: [0.5, 0, s * 0.5] });
  }
  lShoulder.rotation.set(-0.45, 0, 0.2);
  lElbow.rotation.set(-0.7, 0, 0);
  rShoulder.rotation.set(0.05, 0, -0.14);
  rElbow.rotation.set(-0.35, 0, 0);
  spine.rotation.x = 0.08;
  head.rotation.x = -0.08;

  // recurve bow: one tube swept along a recurve, leather grip, linen string
  const bowJ = K.holdLevel(g, lElbow, [0, -0.36, 0.01], new THREE.Euler(-0.55, 0, -0.4));   // tilted forward at rest so the draw pose ends near vertical
  const bowP = joint(bowJ, 0, 0, 0); bowP.rotation.y = 0.8;
  const BL = 1.3, BD = 1.7;
  const curve = new THREE.CatmullRomCurve3([[-0.84, 0.03], [-0.74, -0.05], [-0.45, 0.05], [0, 0.12], [0.45, 0.05], [0.74, -0.05], [0.84, 0.03]].map(([y, z]) => K.V(0, y * BL, z * BD)));
  add(bowP, new THREE.TubeGeometry(curve, 14, 0.055, 5, false), 'bow', { uvOpts: { rotate: true } });
  add(bowP, rings([{ y: 0.12, rx: 0.075, rz: 0.075 }, { y: -0.12, rx: 0.075, rz: 0.075 }], 7), 'bracer', { pos: [0, 0, 0.12 * BD] });
  for (const s of [1, -1]) add(bowP, blob(0.03, 0.04, 0.03, 5, 3), 'bronze', { pos: [0, s * 0.84 * BL, 0.03 * BD] });
  add(bowP, rings([{ y: 0.83 * BL, rx: 0.011, rz: 0.011 }, { y: -0.83 * BL, rx: 0.011, rz: 0.011 }], 3), 'string', { pos: [0, 0, 0.03 * BD - 0.02] });

  return K.finish(g, { hips, spine, head, lShoulder, lElbow, rShoulder, rElbow, lHip, lKnee, rHip, rKnee });
}
