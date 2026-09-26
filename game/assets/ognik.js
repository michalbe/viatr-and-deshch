// Ognik, the wandering light. A will-o'-the-wisp: a hovering knot of pale flame with a dark
// core, trailing wisps. Humanoid joint names so the shared idle bob drives it; no legs.
import { createPainter } from '../paint.js';
import { createKit } from '../charkit.js';

export default function (THREE) {
  const P = createPainter(THREE, 128, 173);
  const R = P.region;
  const FLAME = 0xbfe8ff, CORE = 0x3a2a4a;
  R('flame', 0, 0, 64, 64, (c, w, h) => { P.fill(w, h, P.tone(FLAME, 0.2)); P.grad(w, h, [[0, P.tone(FLAME, 0.6)], [0.5, P.tone(FLAME, 0.1)], [1, P.tone(0x6aa0ff, -0.2)]]); P.strokes(w, h, { n: 60, len: 14, width: 2, angle: Math.PI / 2, jitter: 0.5, cols: ['rgba(255,255,255,0.5)', 'rgba(120,160,255,0.4)'], taper: true }); });
  R('core', 64, 0, 32, 32, (c, w, h) => { P.fill(w, h, P.tone(CORE)); P.glow(w * 0.5, h * 0.5, w * 0.5, '160,120,255', 0.6); });
  R('wisp', 96, 0, 32, 64, (c, w, h) => { P.fill(w, h, P.tone(FLAME, 0.3)); P.grad(w, h, [[0, 'rgba(255,255,255,0.4)'], [1, 'rgba(120,160,255,0)']]); });
  const K = createKit(THREE, P);
  const flameMat = K.material('glow', 0xffffff, { emissive: 0x9fd0ff, emissiveIntensity: 1.6, transparent: true, opacity: 0.85, side: THREE.DoubleSide });
  const coreMat = K.material('glow', 0xffffff, { emissive: 0x7a50c0, emissiveIntensity: 1.2 });
  const g = new THREE.Group();
  const hips = K.joint(g, 0, 1.0, 0), spine = K.joint(hips, 0, 0.1, 0), head = K.joint(spine, 0, 0.3, 0);
  const lShoulder = K.joint(spine, 0.2, 0.2, 0), rShoulder = K.joint(spine, -0.2, 0.2, 0);
  const lElbow = K.joint(lShoulder, 0, -0.2, 0), rElbow = K.joint(rShoulder, 0, -0.2, 0);
  const lHip = K.joint(hips, 0.1, -0.1, 0), rHip = K.joint(hips, -0.1, -0.1, 0), lKnee = K.joint(lHip, 0, -0.2, 0), rKnee = K.joint(rHip, 0, -0.2, 0);
  K.add(spine, K.blob(0.3, 0.42, 0.3, 8, 5), 'flame', { mat: flameMat, pos: [0, 0.2, 0] });
  K.add(spine, K.blob(0.13, 0.16, 0.13, 6, 4), 'core', { mat: coreMat, pos: [0, 0.18, 0] });
  for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; K.add(spine, K.ribbon(0.7, 0.12, [Math.cos(a) * 0.4, 1, Math.sin(a) * 0.4], [0, 0, 1], 0.15, i), 'wisp', { mat: flameMat, pos: [0, 0.45, 0], rot: [Math.PI, 0, 0] }); }
  K.add(hips, K.blob(0.12, 0.3, 0.12, 6, 4), 'flame', { mat: flameMat, pos: [0, -0.3, 0] });
  return K.finish(g, { hips, spine, head, lShoulder, lElbow, rShoulder, rElbow, lHip, lKnee, rHip, rKnee });
}
