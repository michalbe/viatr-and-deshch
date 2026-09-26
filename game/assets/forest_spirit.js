// Forest Spirit, guardian of the clearing. Painted-atlas build: a five-metre walker of twisted
// roots. Every limb is a bundle of bark strands, a root cage around a glowing core for a chest,
// a hollow stump head with glowing eyes and a rack of antler-branches, moss in every fork.
// Humanoid joints so the shared animation drives it.
import { createPainter } from '../paint.js';
import { createKit } from '../charkit.js';

export default function (THREE) {
  const P = createPainter(THREE, 512, 97);
  const R = P.region;
  const BARK = 0x4a3322, WOOD = 0x5e4029, MOSS = 0x6f8f3a, MOSSD = 0x223b22, GLOW = 0x9ff0c8;

  /* ------------------------------------------------------------------ the atlas */
  const bark = (w, h, base = BARK) => {
    P.fill(w, h, P.tone(base));
    P.grad(w, h, [[0, P.tone(base, 0.2)], [0.5, P.tone(base, 0)], [1, P.tone(base, -0.5)]], 'h');
    P.strokes(w, h, { n: w * 2.5, len: h * 0.5, width: 2.5, angle: Math.PI / 2, jitter: 0.12, cols: [P.tone(base, -0.6, 0.8), P.tone(base, 0.3, 0.5), P.tone(base, -0.3)] });
    P.strokes(w, h, { n: w * 0.4, len: h * 0.25, width: 4, angle: Math.PI / 2, jitter: 0.2, cols: ['rgba(0,0,0,0.5)'] });
    P.speckle(w, h, { n: w * h / 50, alpha: 0.08 });
  };
  const moss = (w, h) => { P.fill(w, h, P.tone(MOSSD)); P.strokes(w, h, { n: w * h / 12, len: 5, width: 3, angle: 1.2, jitter: 2, cols: [P.tone(MOSS, -0.2), P.tone(MOSS, 0.2), P.tone(MOSS, 0.5, 0.7)], taper: true }); P.vignette(w, h, { bottom: 0.4 }); };
  R('bark', 0, 0, 128, 256, (c, w, h) => bark(w, h));
  R('wood', 128, 0, 64, 256, (c, w, h) => bark(w, h, WOOD));
  R('moss', 192, 0, 64, 64, (c, w, h) => moss(w, h));
  R('mossdark', 192, 64, 64, 64, (c, w, h) => { P.fill(w, h, P.tone(MOSSD)); P.strokes(w, h, { n: 300, len: 5, width: 3, angle: 1.2, jitter: 2, cols: [P.tone(MOSSD, 0.2), P.tone(MOSS, -0.3)], taper: true }); });
  R('glow', 192, 128, 32, 32, (c, w, h) => P.fill(w, h, P.tone(GLOW, 0.3)));
  R('core', 224, 128, 32, 32, (c, w, h) => { P.fill(w, h, P.tone(GLOW)); P.glow(w * 0.5, h * 0.5, w * 0.5, '255,255,255', 0.8); });
  R('face', 256, 0, 128, 128, (c, w, h) => {
    // a stump: bark all round, the front (u = 0.5) hollowed black with two glowing eyes painted in
    bark(w, h);
    const g = c.createRadialGradient(w * 0.5, h * 0.45, 0, w * 0.5, h * 0.45, w * 0.24); g.addColorStop(0, 'rgba(0,0,0,0.95)'); g.addColorStop(0.8, 'rgba(0,0,0,0.85)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = g; c.beginPath(); c.ellipse(w * 0.5, h * 0.45, w * 0.24, h * 0.3, 0, 0, Math.PI * 2); c.fill();
    for (const sg of [-1, 1]) { P.glow(w * 0.5 + sg * w * 0.09, h * 0.38, w * 0.06, '159,240,200', 0.9); c.fillStyle = P.tone(GLOW, 0.5); c.beginPath(); c.ellipse(w * 0.5 + sg * w * 0.09, h * 0.38, w * 0.035, h * 0.02, 0, 0, Math.PI * 2); c.fill(); }
    c.fillStyle = 'rgba(0,0,0,0.8)'; for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(w * (0.4 + i * 0.05), h * 0.6); c.lineTo(w * (0.42 + i * 0.05), h * 0.75); c.lineTo(w * (0.44 + i * 0.05), h * 0.6); c.fill(); }
  });
  R('stumptop', 384, 0, 64, 64, (c, w, h) => { P.wood(w, h, { base: WOOD }); c.strokeStyle = P.tone(WOOD, -0.5); c.lineWidth = 1.5; for (let r = 4; r < w * 0.5; r += 5) { c.beginPath(); c.ellipse(w * 0.5, h * 0.5, r, r * 0.9, 0, 0, Math.PI * 2); c.stroke(); } });

  /* ------------------------------------------------------------------ the body */
  const K = createKit(THREE, P);
  const { joint, rings, sweep, blob, add } = K;
  const glowMat = K.material('glow', 0xffffff, { emissive: GLOW, emissiveIntensity: 1.5 });
  const g = new THREE.Group();
  const joints = {};
  const J = (parent, name, x, y, z) => { const o = joint(parent, x, y, z); o.name = name; joints[name] = o; return o; };
  const V = K.V;
  // n root strands twisting from a to b around the axis
  const strands = (p, a, b, r, rs, n = 3, twist = 1.2, region = 'bark') => {
    const A = V(...a), B = V(...b), d = B.clone().sub(A);
    const side = Math.abs(d.clone().normalize().y) > 0.9 ? V(1, 0, 0) : V(0, 1, 0);
    const u = d.clone().cross(side).normalize(), w = d.clone().cross(u).normalize();
    const at = (t, k) => { const ang = k * (Math.PI * 2 / n) + t * twist; return A.clone().addScaledVector(d, t).addScaledVector(u, Math.cos(ang) * r).addScaledVector(w, Math.sin(ang) * r).toArray(); };
    for (let k = 0; k < n; k++) add(p, sweep([{ p: at(0, k), rx: rs }, { p: at(0.33, k), rx: rs * 0.95 }, { p: at(0.66, k), rx: rs * 0.88 }, { p: at(1, k), rx: rs * 0.8 }], 5, { capStart: true, capEnd: true }), region);
  };
  const root = (p, a, b, r, region = 'bark') => add(p, sweep([{ p: a, rx: r }, { p: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2], rx: r * 0.6 }, { p: b, rx: 0.005 }], 5, { capStart: true, capEnd: true }), region);

  const hips = J(g, 'hips', 0, 2.05, 0);
  add(hips, blob(0.44, 0.3, 0.38, 8, 4), 'bark');
  for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; root(hips, [Math.sin(a) * 0.36, 0, Math.cos(a) * 0.3], [Math.sin(a) * 0.5, -0.8 - (i % 3) * 0.2, Math.cos(a) * 0.42], 0.11, i % 2 ? 'mossdark' : 'moss'); }
  const spine = J(hips, 'spine', 0, 0.2, 0);
  spine.rotation.x = 0.25;
  for (let k = 0; k < 7; k++) {
    const a = (k / 7) * Math.PI * 2;
    const p0 = [Math.sin(a) * 0.3, 0, Math.cos(a) * 0.25], p1 = [Math.sin(a + 0.5) * 0.55, 0.7, Math.cos(a + 0.5) * 0.42], p2 = [Math.sin(a + 0.9) * 0.4, 1.25, Math.cos(a + 0.9) * 0.3];
    add(spine, sweep([{ p: p0, rx: 0.1 }, { p: p1, rx: 0.12 }, { p: p2, rx: 0.1 }], 5, { capStart: true, capEnd: true }), 'bark');
    add(spine, blob(0.12, 0.12, 0.12, 5, 3), 'bark', { pos: p1 });
  }
  add(spine, blob(0.26, 0.26, 0.26, 6, 4), 'core', { mat: glowMat, pos: [0, 0.65, 0] });
  add(spine, blob(0.62, 0.22, 0.44, 8, 4), 'bark', { pos: [0, 1.2, -0.05] });
  add(spine, blob(0.5, 0.14, 0.36, 8, 3), 'moss', { pos: [0.1, 1.33, -0.1], rot: [0, 0.5, 0] });
  const head = J(spine, 'head', 0, 1.3, 0.15);
  add(head, rings([{ y: 0.63, rx: 0.34, rz: 0.34 }, { y: 0.3, rx: 0.32, rz: 0.32 }, { y: 0.0, rx: 0.28, rz: 0.28 }], 8), 'face');
  add(head, rings([{ y: 0.64, rx: 0.005, rz: 0.005 }, { y: 0.63, rx: 0.33, rz: 0.33 }], 8), 'stumptop');
  for (const s of [1, -1]) add(head, blob(0.09, 0.05, 0.05, 6, 3), 'glow', { mat: glowMat, pos: [s * 0.1, 0.36, 0.3] });
  for (let i = 0; i < 4; i++) root(head, [-0.15 + i * 0.1, 0.18, 0.3], [-0.2 + i * 0.13, -0.35 - (i % 2) * 0.2, 0.36], 0.06, 'moss');
  for (const s of [1, -1]) {
    const b0 = [s * 0.16, 0.58, 0], b1 = [s * 0.42, 0.98, -0.12], b2 = [s * 0.78, 1.22, -0.02], b3 = [s * 0.95, 1.5, 0.12], b4 = [s * 1.0, 1.72, 0.2];
    add(head, sweep([{ p: b0, rx: 0.11 }, { p: b1, rx: 0.085 }, { p: b2, rx: 0.065 }, { p: b3, rx: 0.045 }, { p: b4, rx: 0.005 }], 6, { capStart: true, capEnd: true }), 'wood');
    add(head, blob(0.09, 0.09, 0.09, 6, 3), 'wood', { pos: b1 }); add(head, blob(0.068, 0.068, 0.068, 6, 3), 'wood', { pos: b2 });
    root(head, b1, [s * 0.36, 1.5, 0.08], 0.06, 'wood'); root(head, b1, [s * 0.55, 1.15, 0.3], 0.045, 'wood');
    root(head, b2, [s * 1.18, 1.3, -0.2], 0.05, 'wood'); root(head, b2, [s * 0.7, 1.55, -0.2], 0.045, 'wood');
    root(head, b0, [s * 0.26, 0.98, 0.34], 0.055, 'wood');
    add(head, blob(0.1, 0.06, 0.1, 5, 3), 'moss', { pos: [b1[0] * 0.9, b1[1] - 0.05, b1[2]] });
  }
  const arm = (side) => {
    const s = side === 'l' ? 1 : -1;
    const sh = J(spine, side + 'Shoulder', s * 0.6, 1.15, 0);
    sh.rotation.z = s * 0.1;
    strands(sh, [0, 0, 0], [s * 0.12, -1.0, 0.06], 0.1, 0.08, 3, 1.5);
    const el = J(sh, side + 'Elbow', s * 0.12, -1.0, 0.06);
    add(el, blob(0.15, 0.15, 0.15, 6, 3), 'wood');
    add(el, blob(0.14, 0.22, 0.14, 5, 3), 'moss', { pos: [s * 0.05, -0.35, 0.02] });
    root(el, [s * 0.1, -0.3, 0.0], [s * 0.14, -0.85, -0.02], 0.08, 'mossdark');
    strands(el, [0, 0, 0], [0, -1.0, 0.2], 0.08, 0.065, 3, -1.5);
    for (let i = 0; i < 4; i++) {
      const a = -0.6 + i * 0.4, m = [Math.sin(a) * 0.25, -1.35, 0.22 + Math.cos(a) * 0.18];
      add(el, sweep([{ p: [0, -1.0, 0.2], rx: 0.05 }, { p: m, rx: 0.035 }, { p: [Math.sin(a) * 0.3, -1.65, 0.32 + Math.cos(a) * 0.2], rx: 0.005 }], 5, { capStart: true, capEnd: true }), 'wood');
    }
  };
  arm('l'); arm('r');
  const leg = (side) => {
    const s = side === 'l' ? 1 : -1;
    const hp = J(hips, side + 'Hip', s * 0.28, -0.1, 0);
    strands(hp, [0, 0, 0], [s * 0.06, -0.95, 0.1], 0.13, 0.1, 3, 1.4);
    const kn = J(hp, side + 'Knee', s * 0.06, -0.95, 0.1);
    add(kn, blob(0.18, 0.18, 0.18, 6, 3), 'wood');
    add(kn, blob(0.16, 0.2, 0.14, 5, 3), 'moss', { pos: [s * 0.04, -0.3, 0.1] });
    strands(kn, [0, 0, 0], [0, -0.9, -0.1], 0.12, 0.1, 3, -1.4);
    for (let i = 0; i < 5; i++) { const a = -1.2 + i * 0.6; root(kn, [0, -0.85, -0.1], [Math.sin(a) * 0.55, -1.0, -0.1 + Math.cos(a) * 0.55], 0.1); }
  };
  leg('l'); leg('r');

  return K.finish(g, joints);
}
