// Vodnik, the water master. A squat, heavy, green-skinned man with a frog's wide mouth, webbed
// hands the size of paddles, weed for hair, a belly like a barrel and a drowned man's coat.
// Humanoid joints; the rest pose crouches.
import { createPainter } from '../paint.js';
import { createKit } from '../charkit.js';

export default function (THREE) {
  const P = createPainter(THREE, 512, 191);
  const R = P.region;
  const SKIN = 0x5f8a58, BELLY = 0x9ab070, COAT = 0x3a4638, WEED = 0x2f5a30, EYE = 0xe8d040;
  R('head', 0, 0, 256, 128, (c, w, h) => {
    P.skin(w, h, { base: SKIN, blush: 0 });
    P.strokes(w, h, { n: 300, len: 5, width: 3, angle: 0.4, jitter: 3, cols: [P.tone(SKIN, 0.3, 0.4), P.tone(SKIN, -0.4, 0.4)] });
    for (const sg of [-1, 1]) { const ex = w * 0.5 + sg * w * 0.12, ey = h * 0.36; c.fillStyle = P.tone(EYE); c.beginPath(); c.ellipse(ex, ey, w * 0.06, h * 0.07, 0, 0, Math.PI * 2); c.fill(); c.fillStyle = '#101008'; c.beginPath(); c.ellipse(ex, ey, w * 0.015, h * 0.06, 0, 0, Math.PI * 2); c.fill(); c.strokeStyle = P.tone(SKIN, -0.5); c.lineWidth = 3; c.beginPath(); c.ellipse(ex, ey, w * 0.065, h * 0.075, 0, 0, Math.PI * 2); c.stroke(); }
    c.strokeStyle = 'rgba(20,30,20,0.9)'; c.lineWidth = 4; c.beginPath(); c.moveTo(w * 0.34, h * 0.66); c.quadraticCurveTo(w * 0.5, h * 0.78, w * 0.66, h * 0.66); c.stroke();
    c.fillStyle = 'rgba(200,220,180,0.5)'; c.fillRect(w * 0.44, h * 0.67, w * 0.12, 3);
  });
  R('belly', 256, 0, 128, 128, (c, w, h) => { P.skin(w, h, { base: BELLY, blush: 0 }); P.strokes(w, h, { n: 200, len: 6, width: 3, angle: 0, jitter: 0.5, cols: [P.tone(BELLY, 0.3, 0.4), P.tone(BELLY, -0.3, 0.4)] }); for (let y = 10; y < h; y += 14) P.seam(4, y, w - 4, y, 2, { dark: 'rgba(40,60,30,0.4)', light: 'rgba(220,240,180,0.3)' }); });
  R('coat', 384, 0, 128, 128, (c, w, h) => { P.cloth(w, h, { base: COAT, folds: 5, depth: 0.7 }); P.strokes(w, h, { n: 120, len: 14, width: 3, angle: Math.PI / 2, jitter: 0.5, cols: [P.tone(WEED, 0, 0.5), P.tone(WEED, 0.3, 0.4)], taper: true }); });
  R('skin', 0, 128, 64, 64, (c, w, h) => { P.skin(w, h, { base: SKIN, blush: 0 }); for (let i = 0; i < 4; i++) P.seam(w * (0.3 + i * 0.13), h * 0.35, w * (0.3 + i * 0.13), h, 2.5, { dark: 'rgba(20,40,20,0.7)' }); });
  R('weed', 64, 128, 64, 128, (c, w, h) => { P.fur(w, h, { base: WEED, tip: 0.4, n: 300 }); });
  R('web', 128, 128, 64, 64, (c, w, h) => { P.skin(w, h, { base: BELLY, blush: 0 }); P.grad(w, h, [[0, 'rgba(30,60,40,0.3)'], [1, 'rgba(30,60,40,0)']]); });
  const K = createKit(THREE, P);
  const { joint, rings, blob, limb, plate, add } = K;
  const g = new THREE.Group();
  const hips = joint(g, 0, 0.8, 0);
  const spine = joint(hips, 0, 0.06, 0);
  const head = joint(spine, 0, 0.5, 0.18);
  const lShoulder = joint(spine, 0.42, 0.42, 0.02), rShoulder = joint(spine, -0.42, 0.42, 0.02);
  const lElbow = joint(lShoulder, 0, -0.32, 0), rElbow = joint(rShoulder, 0, -0.32, 0);
  const lHip = joint(hips, 0.2, -0.05, 0), rHip = joint(hips, -0.2, -0.05, 0);
  const lKnee = joint(lHip, 0, -0.34, 0), rKnee = joint(rHip, 0, -0.34, 0);
  add(spine, rings([{ y: 0.56, rx: 0.2, rz: 0.17, z: 0.06 }, { y: 0.46, rx: 0.46, rz: 0.36 }, { y: 0.28, rx: 0.5, rz: 0.42, z: 0.04 }, { y: 0.08, rx: 0.48, rz: 0.42, z: 0.05 }, { y: -0.06, rx: 0.42, rz: 0.36 }], 10, { capTop: true }), 'belly');
  add(spine, rings([{ y: 0.58, rx: 0.24, rz: 0.2, z: -0.02 }, { y: 0.5, rx: 0.5, rz: 0.38, z: -0.06 }, { y: 0.2, rx: 0.52, rz: 0.4, z: -0.08 }, { y: -0.1, rx: 0.46, rz: 0.36, z: -0.06 }], 10), 'coat', { mat: K.paint2 });
  add(hips, rings([{ y: 0.0, rx: 0.42, rz: 0.36 }, { y: -0.2, rx: 0.4, rz: 0.34 }], 10), 'coat');
  for (const [hip, knee, s] of [[lHip, lKnee, 1], [rHip, rKnee, -1]]) {
    add(hip, limb(0.36, [[0.19, 0.18], [0.16, 0.15], [0.13, 0.12]], 8), 'skin');
    add(knee, limb(0.36, [[0.13, 0.12], [0.12, 0.11], [0.12, 0.11]], 8), 'skin');
    add(knee, plate([[-0.16, 0], [0.16, 0], [0.22, 0.34], [0.08, 0.3], [0, 0.4], [-0.08, 0.3], [-0.22, 0.34]], 0.05), 'web', { mat: K.paint2, pos: [0, -0.36, 0.02], rot: [-Math.PI / 2, 0, 0] });
    hip.rotation.set(-1.2, 0, s * 0.6); knee.rotation.set(1.9, 0, -s * 0.2);
  }
  add(head, blob(0.3, 0.24, 0.3, 10, 5, { squash: 0.2 }), 'head', { pos: [0, 0.1, 0.04] });
  add(head, rings([{ y: 0.3, rx: 0.26, rz: 0.26 }, { y: 0.12, rx: 0.3, rz: 0.3, z: -0.06 }, { y: -0.2, rx: 0.2, rz: 0.24, z: -0.16 }, { y: -0.4, rx: 0.08, rz: 0.1, z: -0.2 }], 8, { capTop: true }), 'weed', { mat: K.paint2, pos: [0, 0.06, -0.02] });
  for (const [sh, el, s] of [[lShoulder, lElbow, 1], [rShoulder, rElbow, -1]]) {
    add(sh, limb(0.34, [[0.16, 0.15], [0.14, 0.13], [0.12, 0.115]], 8), 'coat');
    add(el, limb(0.34, [[0.12, 0.115], [0.14, 0.13], [0.13, 0.12]], 8), 'skin');
    add(el, plate([[-0.18, 0], [0.18, 0], [0.24, -0.3], [0.1, -0.26], [0, -0.36], [-0.1, -0.26], [-0.24, -0.3]], 0.06), 'web', { mat: K.paint2, pos: [0, -0.36, 0.02] });
  }
  lShoulder.rotation.set(-0.5, 0, 0.35); rShoulder.rotation.set(-0.5, 0, -0.35); lElbow.rotation.set(-0.7, 0, 0); rElbow.rotation.set(-0.7, 0, 0);
  spine.rotation.x = 0.35; head.rotation.x = -0.35;
  return K.finish(g, { hips, spine, head, lShoulder, lElbow, rShoulder, rElbow, lHip, lKnee, rHip, rKnee });
}
