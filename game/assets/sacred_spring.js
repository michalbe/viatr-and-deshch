// Sacred Spring, 4 m across. Painted build: a ring of mossy stones round a still pool, reeds on
// the back bank, three ribboned stakes at the front with a linen cord between them.
import { createBuildKit } from '../buildkit.js';

export default function (THREE) {
  const B = createBuildKit(THREE);
  const g = new THREE.Group();
  for (let i = 0; i < 12; i++) {
    const a = i / 12 * Math.PI * 2 + 0.2, r = 1.75, k = i % 3;
    B.add(g, B.blob(0.42 + k * 0.08, 0.3 + (i % 2) * 0.1, 0.4, 6, 3), i % 2 ? 'stone' : 'stoneDark', { pos: [Math.sin(a) * r, 0.2, Math.cos(a) * r], rot: [0, a, 0], rep: [2, 1] });
    if (i % 2) B.add(g, B.blob(0.3, 0.08, 0.28, 5, 2), 'moss', { pos: [Math.sin(a) * r, 0.5 + (i % 2) * 0.1, Math.cos(a) * r], rep: [1, 1] });
  }
  B.add(g, B.rings([{ y: 0.27, rx: 0.01, rz: 0.01 }, { y: 0.26, rx: 1.6, rz: 1.6 }], 12), 'water', { rep: [1, 1] });
  B.add(g, B.rings([{ y: 0.3, rx: 1.55, rz: 1.55 }, { y: 0.02, rx: 1.9, rz: 1.9 }], 12), 'stoneDark', { rep: [6, 1] });
  // reeds on the back bank
  for (let i = 0; i < 9; i++) {
    const x = -1.2 + i * 0.3 + (i % 2) * 0.1, z = -1.3 - (i % 3) * 0.2, h = 0.9 + (i % 4) * 0.2;
    B.add(g, B.sheet(0.24, h, { sag: 0.04, wave: 0.02, taper: -0.85, rows: 3, cols: 1 }), 'reed2', { pos: [x, h, z], rot: [Math.PI, (i * 0.8) % 3.14, 0.1 * ((i % 3) - 1)], rep: [1, 1] });
    if (i % 3 === 0) B.add(g, B.sweep([{ p: [x + 0.05, h * 0.75, z], rx: 0.03 }, { p: [x + 0.05, h * 0.95, z], rx: 0.03 }], 5, { capStart: true, capEnd: true }), 'planksDark', { rep: [1, 1] });
  }
  // ribboned stakes at the front, a cord strung between them
  const stakes = [[-1.0, 1.7], [0, 2.0], [1.0, 1.7]];
  for (const [x, z] of stakes) {
    B.add(g, B.sweep([{ p: [x, 0, z], rx: 0.07 }, { p: [x, 1.1, z], rx: 0.06 }, { p: [x, 1.25, z], rx: 0.01 }], 5, { capStart: true, capEnd: true }), 'planksDark', { rep: [1, 1] });
    B.add(g, B.ribbon(0.6, 0.1, [0.2, -0.5, 0.6], [0, 1, 0], 0.08, x), 'team', { pos: [x, 1.05, z], rep: [1, 1] });
  }
  B.add(g, B.sweep(stakes.map(([x, z]) => ({ p: [x, 0.95, z], rx: 0.015 })), 4), 'linen', { rep: [1, 3] });
  for (let i = 0; i < 4; i++) B.add(g, B.sheet(0.14, 0.35, { sag: 0.01, wave: 0.01, taper: 0, rows: 2, cols: 1 }), i % 2 ? 'linen2' : 'team', { pos: [-0.75 + i * 0.5, 0.95, 1.85 + Math.abs(-0.75 + i * 0.5) * 0.15], rep: [1, 1] });
  return B.finish(g);
}
