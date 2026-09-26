// A family on the road: a two-wheeled handcart with the household under the clan's tarp, an old
// man in a felt hat bent into the shafts, a woman in a kerchief and apron with a bundle on her
// hip, and a child in a short tunic holding her hand. Three full figures, built like the
// warriors (jointed limbs, hands, boots) and frozen mid-stride. One convoy unit; it only moves.
import { createPainter, GREY } from '../paint.js';
import { createKit } from '../charkit.js';

export default function (THREE) {
  const P = createPainter(THREE, 512, 211);
  const R = P.region;
  const WOOD = 0xa27a4f, LINEN = 0xe6dcc3, SKIN = 0xd9a07a, KIDSKIN = 0xe4b08c, HAIR = 0x8a7a68, WOOL = 0x6b5d4e, LEATHER = 0x6b4526, OCHRE = 0xc98a2b, KIDHAIR = 0xb8843c, HERHAIR = 0x3b2618;

  /* ------------------------------------------------------------------ the atlas */
  R('faceMan', 0, 0, 256, 128, (c, w, h) => P.face(w, h, { base: SKIN, hairCol: HAIR, eye: 0x3a4a5a, eyeY: 0.47, mouthY: 0.72, eyeGap: 0.08, eyeW: 0.046, stern: 0.6, beard: 1, beardCol: HAIR, hairTop: 1, brow: 1.2 }));
  R('faceWoman', 256, 0, 256, 128, (c, w, h) => P.face(w, h, { base: SKIN, hairCol: HERHAIR, eye: 0x4a5a3a, eyeY: 0.5, mouthY: 0.75, eyeGap: 0.062, eyeW: 0.05, stern: 0, female: true, hairTop: 1, hairline: 0.3, brow: 0.5 }));
  R('faceKid', 0, 128, 256, 128, (c, w, h) => { P.face(w, h, { base: KIDSKIN, hairCol: KIDHAIR, eye: 0x3a5a6a, eyeY: 0.52, mouthY: 0.76, eyeGap: 0.07, eyeW: 0.06, stern: -0.4, hairTop: 1, hairline: 0.28, brow: 0.3 }); c.fillStyle = 'rgba(220,120,100,0.28)'; for (const s of [-1, 1]) { c.beginPath(); c.ellipse(w * (0.5 + s * 0.11), h * 0.63, w * 0.035, h * 0.045, 0, 0, 6.3); c.fill(); } });
  R('wood', 256, 128, 128, 128, (c, w, h) => P.planks(w, h, { base: WOOD, count: 5 }));
  R('wheel', 384, 128, 128, 128, (c, w, h) => { P.wood(w, h, { base: WOOD }); c.strokeStyle = P.tone(WOOD, -0.55); c.lineWidth = 5; for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI; c.beginPath(); c.moveTo(w * 0.5 - Math.cos(a) * w * 0.45, h * 0.5 - Math.sin(a) * h * 0.45); c.lineTo(w * 0.5 + Math.cos(a) * w * 0.45, h * 0.5 + Math.sin(a) * h * 0.45); c.stroke(); } c.lineWidth = 7; c.strokeStyle = P.tone(0x4a4a4a); c.beginPath(); c.arc(w * 0.5, h * 0.5, w * 0.46, 0, Math.PI * 2); c.stroke(); P.rivet(w * 0.5, h * 0.5, 9, { base: 0x6a6a6a }); });
  R('cloth', 0, 256, 128, 128, (c, w, h) => { P.cloth(w, h, { base: GREY, folds: 6, depth: 0.55 }); P.band(w, h - 10, 10, P.tone(GREY, -0.4)); c.strokeStyle = P.tone(GREY, 0.45); c.lineWidth = 2; c.beginPath(); for (let x = 0; x <= w; x += 8) c.lineTo(x, h - 5 + (x / 8 % 2 ? 3 : -3)); c.stroke(); });
  R('wool', 128, 256, 64, 64, (c, w, h) => { P.cloth(w, h, { base: WOOL, folds: 4, depth: 0.6 }); P.band(w, h - 6, 6, P.tone(WOOL, -0.4)); });
  R('linen', 192, 256, 64, 64, (c, w, h) => { P.cloth(w, h, { base: LINEN, folds: 4, depth: 0.5 }); P.band(w, h - 8, 8, P.tone(OCHRE, -0.1)); c.strokeStyle = P.tone(LINEN, 0.3); c.lineWidth = 1.5; c.beginPath(); for (let x = 0; x <= w; x += 6) c.lineTo(x, h - 4 + (x / 6 % 2 ? 2 : -2)); c.stroke(); });
  R('apron', 256, 256, 64, 64, (c, w, h) => { P.cloth(w, h, { base: 0xf0e8d8, folds: 3, depth: 0.4 }); P.band(w, 2, 3, P.tone(OCHRE, -0.2)); P.band(w, h - 5, 3, P.tone(OCHRE, -0.2)); });
  R('leather', 320, 256, 64, 64, (c, w, h) => P.leather(w, h, { base: LEATHER, straps: 1 }));
  R('hand', 384, 256, 64, 64, (c, w, h) => { P.skin(w, h, { base: SKIN, blush: 0.05 }); for (let i = 0; i < 4; i++) P.seam(w * (0.32 + i * 0.12), h * 0.4, w * (0.32 + i * 0.12), h, 2.5, { dark: 'rgba(80,30,20,0.7)' }); P.vignette(w, h, { bottom: 0.4 }); });
  R('hairHer', 448, 256, 64, 64, (c, w, h) => P.hair(w, h, { base: HERHAIR, sheen: 0.5 }));
  R('hairKid', 128, 320, 64, 64, (c, w, h) => { P.hair(w, h, { base: KIDHAIR, sheen: 0.5 }); P.strokes(w, h, { n: 60, len: 10, width: 2, angle: Math.PI / 2, jitter: 0.5, cols: [P.tone(KIDHAIR, 0.4, 0.6)], taper: true }); });
  R('bundle', 192, 320, 64, 64, (c, w, h) => { P.cloth(w, h, { base: LINEN, folds: 3, depth: 0.5 }); c.strokeStyle = P.tone(LEATHER, -0.1); c.lineWidth = 3; c.beginPath(); c.moveTo(0, h * 0.5); c.lineTo(w, h * 0.5); c.stroke(); });
  R('boot', 256, 320, 64, 64, (c, w, h) => P.leather(w, h, { base: 0x54361e, straps: 2 }));
  R('tunic', 320, 320, 64, 64, (c, w, h) => { P.cloth(w, h, { base: OCHRE, folds: 4, depth: 0.5 }); P.band(w, h - 6, 6, P.tone(OCHRE, -0.4)); });
  R('beard', 384, 320, 64, 64, (c, w, h) => { P.hair(w, h, { base: HAIR, sheen: 0.4 }); P.strokes(w, h, { n: 140, len: 16, width: 2.2, angle: Math.PI / 2, jitter: 0.35, cols: [P.tone(HAIR, -0.45), P.tone(HAIR, 0.5, 0.7)], taper: true }); P.vignette(w, h, { top: 0.3 }); });
  R('felt', 448, 320, 64, 64, (c, w, h) => { P.cloth(w, h, { base: 0x5a4a3a, folds: 0 }); P.speckle(w, h, { n: 300, alpha: 0.15 }); P.band(w, h * 0.55, 5, P.tone(LEATHER, -0.2)); });
  R('rope', 0, 384, 32, 64, (c, w, h) => { P.fill(w, h, P.tone(0xb8a070)); for (let y = 0; y < h; y += 6) P.seam(0, y, w, y + 3, 2, { dark: 'rgba(60,40,20,0.6)', light: 'rgba(255,240,200,0.4)' }); });
  R('skin', 32, 384, 32, 32, (c, w, h) => P.skin(w, h, { base: KIDSKIN }));
  R('pot', 64, 384, 64, 64, (c, w, h) => { P.iron(w, h, { base: 0x3a3a3a }); P.band(w, 4, 6, P.tone(0x5a5a5a)); });

  /* ------------------------------------------------------------------ helpers */
  const K = createKit(THREE, P);
  const { joint, rings, blob, limb, sweep, add } = K;
  const g = new THREE.Group();

  /** a jointed person, scaled; returns the joints so garments and the pose can be laid on */
  function person(parent, x, y, z, sc, yaw = 0) {
    const root = joint(parent, x, y, z); root.rotation.y = yaw; root.scale.setScalar(sc);
    const hips = joint(root, 0, 0, 0);
    const spine = joint(hips, 0, 0.08, 0);
    const head = joint(spine, 0, 0.62, 0.04);
    const lShoulder = joint(spine, 0.27, 0.5, 0), rShoulder = joint(spine, -0.27, 0.5, 0);
    const lElbow = joint(lShoulder, 0, -0.3, 0), rElbow = joint(rShoulder, 0, -0.3, 0);
    const lHip = joint(hips, 0.12, -0.06, 0), rHip = joint(hips, -0.12, -0.06, 0);
    const lKnee = joint(lHip, 0, -0.4, 0), rKnee = joint(rHip, 0, -0.4, 0);
    return { root, hips, spine, head, lShoulder, rShoulder, lElbow, rElbow, lHip, rHip, lKnee, rKnee };
  }
  const arm = (J, side, sleeve, { upper = 0.3, lower = 0.3, w = 0.075 } = {}) => {
    const sh = side > 0 ? J.lShoulder : J.rShoulder, el = side > 0 ? J.lElbow : J.rElbow;
    add(sh, limb(upper, [[w * 1.15, w * 1.05], [w, w * 0.95], [w * 0.95, w * 0.9]], 7), sleeve);
    add(el, limb(lower, [[w * 0.95, w * 0.9], [w * 0.85, w * 0.8], [w * 0.8, w * 0.75]], 7), sleeve);
    add(el, blob(w * 0.95, w * 1.3, w * 0.7, 7, 4), 'hand', { pos: [0, -lower - w * 0.6, 0.01] });
  };
  const leg = (J, side, cloth, foot, { upper = 0.4, lower = 0.4, w = 0.09, bare = false } = {}) => {
    const hip = side > 0 ? J.lHip : J.rHip, knee = side > 0 ? J.lKnee : J.rKnee;
    add(hip, limb(upper, [[w * 1.1, w], [w, w * 0.95], [w * 0.9, w * 0.85]], 7), cloth);
    add(knee, limb(lower, [[w * 0.9, w * 0.85], [w * 0.8, w * 0.78], [w * 0.85, w * 0.8]], 7), bare ? 'skin' : foot);
    add(knee, rings([{ y: -lower + 0.04, rx: w * 0.85, rz: w * 0.85, z: 0.01 }, { y: -lower - 0.03, rx: w * 1.0, rz: w * 1.7, z: 0.07 }, { y: -lower - 0.07, rx: w * 0.9, rz: w * 1.6, z: 0.07 }], 7, { capBottom: true }), bare ? 'skin' : foot);
  };
  const stride = (J, k) => { J.lHip.rotation.x = -k; J.rHip.rotation.x = k; J.lKnee.rotation.x = k * 0.6 + 0.1; J.rKnee.rotation.x = k > 0 ? 0.05 : 0.7; };

  /* ------------------------------------------------------------------ the cart */
  const cart = joint(g, 0, 0.5, -0.2);
  add(cart, new THREE.BoxGeometry(1.3, 0.16, 2.0), 'wood', { pos: [0, 0.12, 0] });                                     // bed
  for (const s of [1, -1]) { add(cart, new THREE.BoxGeometry(0.06, 0.42, 2.0), 'wood', { pos: [s * 0.62, 0.4, 0] }); for (const z of [-0.9, -0.3, 0.3, 0.9]) add(cart, new THREE.BoxGeometry(0.05, 0.42, 0.06), 'leather', { pos: [s * 0.66, 0.4, z] }); }   // rails and posts
  add(cart, new THREE.BoxGeometry(1.3, 0.42, 0.06), 'wood', { pos: [0, 0.4, -1.0] });                                   // tailboard
  add(cart, sweep([{ p: [-0.9, 0, 0], rx: 0.05 }, { p: [0.9, 0, 0], rx: 0.05 }], 6, { capStart: true, capEnd: true }), 'leather');   // axle
  for (const s of [1, -1]) add(cart, rings([{ y: 0.07, rx: 0.44, rz: 0.44 }, { y: -0.07, rx: 0.44, rz: 0.44 }], 12, { capTop: true, capBottom: true }), 'wheel', { pos: [s * 0.78, 0, 0], rot: [0, 0, Math.PI / 2] });
  for (const s of [1, -1]) add(cart, sweep([{ p: [s * 0.55, 0.22, 0.9], rx: 0.045 }, { p: [s * 0.5, 0.5, 2.0], rx: 0.04 }, { p: [s * 0.46, 0.62, 2.35], rx: 0.035 }], 6, { capStart: true, capEnd: true }), 'wood');   // shafts
  add(cart, sweep([{ p: [-0.5, 0.5, 2.0], rx: 0.03 }, { p: [0.5, 0.5, 2.0], rx: 0.03 }], 5), 'wood');                  // crossbar the man leans into
  // the load: a heap under the clan's tarp, roped down, bundles and a pot hung on the tailboard
  add(cart, blob(0.66, 0.42, 0.98, 10, 5), 'cloth', { mat: K.team, pos: [0, 0.48, 0.02] });
  for (const z of [-0.45, 0.42]) add(cart, sweep([{ p: [-0.66, 0.34, z], rx: 0.018 }, { p: [0, 0.91, z], rx: 0.018 }, { p: [0.66, 0.34, z], rx: 0.018 }], 4), 'rope');
  for (let i = 0; i < 2; i++) add(cart, blob(0.24, 0.2, 0.22, 7, 4), 'bundle', { pos: [(i - 0.5) * 0.55, 0.4, -0.86] });
  add(cart, rings([{ y: 0.18, rx: 0.16, rz: 0.16 }, { y: 0.02, rx: 0.19, rz: 0.19 }, { y: -0.12, rx: 0.14, rz: 0.14 }], 9, { capTop: true, capBottom: true }), 'pot', { pos: [0.42, 0.28, -1.12] });
  add(cart, sweep([{ p: [0.42, 0.42, -1.12], rx: 0.015 }, { p: [0.42, 0.62, -1.06], rx: 0.015 }], 4), 'leather');

  /* ------------------------------------------------------------------ the old man in the shafts */
  {
    const J = person(g, 0, 0.98, 1.95, 1.0);
    J.spine.rotation.x = 0.32;                           // bent into the work
    // wool coat to the knee over a linen shirt, rope belt, felt hat, grey beard
    add(J.spine, rings([{ y: 0.58, rx: 0.15, rz: 0.13, z: 0.02 }, { y: 0.52, rx: 0.32, rz: 0.24 }, { y: 0.3, rx: 0.3, rz: 0.24 }, { y: 0.05, rx: 0.28, rz: 0.23 }, { y: -0.1, rx: 0.3, rz: 0.24 }], 10, { capTop: true }), 'wool');
    add(J.hips, rings([{ y: 0.0, rx: 0.3, rz: 0.24 }, { y: -0.3, rx: 0.33, rz: 0.27 }, { y: -0.5, rx: 0.35, rz: 0.29 }], 10), 'wool');
    add(J.hips, rings([{ y: 0.04, rx: 0.31, rz: 0.25 }, { y: -0.02, rx: 0.31, rz: 0.25 }], 10), 'rope');
    add(J.spine, blob(0.05, 0.05, 0.05, 6, 3), 'rope', { pos: [0.08, 0.0, 0.26] });
    add(J.spine, rings([{ y: 0.6, rx: 0.14, rz: 0.12 }, { y: 0.52, rx: 0.16, rz: 0.13 }], 8), 'linen');    // shirt collar
    add(J.head, blob(0.19, 0.21, 0.19, 10, 6), 'faceMan', { pos: [0, 0.2, 0.02] });
    add(J.head, rings([{ y: 0.18, rx: 0.12, rz: 0.1, z: 0.1 }, { y: 0.06, rx: 0.12, rz: 0.09, z: 0.12 }, { y: -0.12, rx: 0.08, rz: 0.06, z: 0.12 }, { y: -0.2, rx: 0.03, rz: 0.03, z: 0.12 }], 7, { capBottom: true }), 'beard');
    // brimmed felt hat: a flat brim and a crown, each a monotonic loft so no face folds back on itself
    add(J.head, rings([{ y: 0.31, rx: 0.35, rz: 0.33 }, { y: 0.27, rx: 0.36, rz: 0.34 }], 12, { capTop: true, capBottom: true }), 'felt');
    add(J.head, rings([{ y: 0.29, rx: 0.19, rz: 0.18 }, { y: 0.36, rx: 0.17, rz: 0.16 }, { y: 0.48, rx: 0.15, rz: 0.14 }, { y: 0.53, rx: 0.06, rz: 0.06 }], 10, { capTop: true }), 'felt');
    for (const s of [1, -1]) arm(J, s, 'wool', { w: 0.08 });
    for (const s of [1, -1]) leg(J, s, 'wool', 'boot', { w: 0.095 });
    // arms back, hands on the crossbar; a long stride
    J.lShoulder.rotation.set(-0.95, 0, 0.12); J.rShoulder.rotation.set(-0.95, 0, -0.12); J.lElbow.rotation.x = 0.2; J.rElbow.rotation.x = 0.2;
    stride(J, 0.45);
  }

  /* ------------------------------------------------------------------ the woman beside */
  {
    const J = person(g, 1.05, 0.96, 0.3, 0.96, 0.15);
    // long linen dress, apron, kerchief, a bundle on the left hip
    add(J.spine, rings([{ y: 0.56, rx: 0.12, rz: 0.11 }, { y: 0.5, rx: 0.25, rz: 0.19 }, { y: 0.3, rx: 0.24, rz: 0.19 }, { y: 0.1, rx: 0.2, rz: 0.17 }, { y: 0.0, rx: 0.22, rz: 0.18 }], 10, { capTop: true }), 'linen');
    add(J.hips, rings([{ y: 0.06, rx: 0.23, rz: 0.19 }, { y: -0.3, rx: 0.3, rz: 0.25 }, { y: -0.7, rx: 0.4, rz: 0.33 }, { y: -0.92, rx: 0.44, rz: 0.36 }], 12, { capBottom: true }), 'linen');
    add(J.hips, rings([{ y: 0.05, rx: 0.2, rz: 0.2, z: 0.02 }, { y: -0.4, rx: 0.26, rz: 0.2, z: 0.1 }, { y: -0.84, rx: 0.3, rz: 0.2, z: 0.16 }], 8), 'apron');
    add(J.hips, rings([{ y: 0.08, rx: 0.24, rz: 0.2 }, { y: 0.03, rx: 0.24, rz: 0.2 }], 10), 'rope');
    add(J.head, blob(0.17, 0.19, 0.17, 10, 6), 'faceWoman', { pos: [0, 0.18, 0.02] });
    add(J.head, rings([{ y: 0.36, rx: 0.02, rz: 0.02 }, { y: 0.34, rx: 0.15, rz: 0.15 }, { y: 0.22, rx: 0.2, rz: 0.2 }, { y: 0.1, rx: 0.19, rz: 0.2, z: -0.03 }, { y: -0.08, rx: 0.14, rz: 0.16, z: -0.1 }, { y: -0.3, rx: 0.06, rz: 0.08, z: -0.18 }], 10, { capTop: true }), 'cloth', { mat: K.team2, pos: [0, 0.02, -0.01] });   // kerchief, tails down the back
    add(J.head, rings([{ y: 0.3, rx: 0.17, rz: 0.17, z: 0.02 }, { y: 0.22, rx: 0.18, rz: 0.17, z: 0.03 }], 8), 'hairHer');   // a little hair at the brow
    for (const s of [1, -1]) arm(J, s, 'linen', { w: 0.065 });
    for (const s of [1, -1]) leg(J, s, 'linen', 'boot', { w: 0.08 });
    // the bundle on the left hip, held by the left arm; right hand down to the child
    add(J.hips, blob(0.2, 0.24, 0.16, 8, 5), 'bundle', { pos: [0.3, 0.0, 0.1] });
    J.lShoulder.rotation.set(-0.5, 0, 0.35); J.lElbow.rotation.x = -1.3;
    J.rShoulder.rotation.set(-0.25, 0, -0.45); J.rElbow.rotation.x = -0.2;
    stride(J, -0.32);
  }

  /* ------------------------------------------------------------------ the child, hand in hand */
  {
    const J = person(g, 1.62, 0.56, 0.0, 0.58, 0.1);
    // short ochre tunic, bare legs and feet, a mop of fair hair
    add(J.spine, rings([{ y: 0.58, rx: 0.13, rz: 0.12 }, { y: 0.52, rx: 0.27, rz: 0.2 }, { y: 0.2, rx: 0.26, rz: 0.2 }, { y: -0.1, rx: 0.3, rz: 0.24 }, { y: -0.36, rx: 0.34, rz: 0.27 }], 10, { capTop: true }), 'tunic');
    add(J.hips, rings([{ y: 0.02, rx: 0.3, rz: 0.24 }, { y: -0.05, rx: 0.3, rz: 0.24 }], 10), 'rope');
    add(J.head, blob(0.22, 0.23, 0.22, 10, 6), 'faceKid', { pos: [0, 0.2, 0.02] });                 // a big head, as children have
    add(J.head, rings([{ y: 0.44, rx: 0.03, rz: 0.03 }, { y: 0.4, rx: 0.17, rz: 0.17 }, { y: 0.3, rx: 0.24, rz: 0.24 }, { y: 0.16, rx: 0.24, rz: 0.24, z: -0.03 }, { y: 0.06, rx: 0.2, rz: 0.22, z: -0.06 }], 10, { capTop: true }), 'hairKid', { pos: [0, 0.02, -0.01] });
    for (const s of [1, -1]) arm(J, s, 'tunic', { upper: 0.26, lower: 0.26, w: 0.07 });
    for (const s of [1, -1]) leg(J, s, 'skin', 'skin', { upper: 0.34, lower: 0.34, w: 0.08, bare: true });
    // left arm up to the mother's hand, right arm swinging; short quick steps
    J.lShoulder.rotation.set(-0.3, 0, 1.4); J.lElbow.rotation.set(-0.3, 0, 0.3);
    J.rShoulder.rotation.set(0.5, 0, -0.2);
    stride(J, 0.5);
  }
  return K.finish(g, {});
}
