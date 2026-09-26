// Reeds. Painted build: a fan of tapered double-sided blades and three cattail heads.
import { createBuildKit } from '../buildkit.js';

export default function (THREE) {
  const B = createBuildKit(THREE);
  const g = new THREE.Group();
  for (let i = 0; i < 14; i++) {
    const a = i / 14 * Math.PI * 2, r = 0.1 + (i % 3) * 0.12, h = 1.0 + (i % 4) * 0.22;
    B.add(g, B.sheet(0.22, h, { sag: 0, wave: 0.03, taper: -0.85, rows: 3, cols: 1 }), 'reed2', { pos: [Math.sin(a) * r, h, Math.cos(a) * r], rot: [Math.PI + 0.12 * Math.cos(a), a, 0.12 * Math.sin(a)], rep: [1, 1] });
  }
  for (let i = 0; i < 3; i++) {
    const a = i * 2.1, x = Math.sin(a) * 0.15, z = Math.cos(a) * 0.15, h = 1.2 + i * 0.15;
    B.add(g, B.sweep([{ p: [x, 0, z], rx: 0.015 }, { p: [x, h, z], rx: 0.012 }], 4), 'reed', { rep: [1, 2] });
    B.add(g, B.sweep([{ p: [x, h - 0.05, z], rx: 0.02 }, { p: [x, h + 0.1, z], rx: 0.04 }, { p: [x, h + 0.3, z], rx: 0.035 }, { p: [x, h + 0.36, z], rx: 0.01 }], 5, { capStart: true, capEnd: true }), 'planksDark', { rep: [1, 1] });
  }
  return B.finish(g);
}
