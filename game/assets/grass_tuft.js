// Grass tuft. Painted build: twelve bent double-sided blades, one material.
import { createBuildKit } from '../buildkit.js';

export default function (THREE) {
  const B = createBuildKit(THREE);
  const g = new THREE.Group();
  for (let i = 0; i < 12; i++) {
    const a = i / 12 * Math.PI * 2 + (i % 2) * 0.3, r = 0.04 + (i % 3) * 0.05, h = 0.35 + (i % 4) * 0.08;
    B.add(g, B.sheet(0.06, h, { sag: 0.05, wave: 0, taper: -0.9, rows: 2, cols: 1 }), 'blades2', { pos: [Math.sin(a) * r, h, Math.cos(a) * r], rot: [Math.PI + 0.35 * Math.cos(a), a, 0.35 * Math.sin(a)], rep: [1, 1] });
  }
  return B.finish(g);
}
