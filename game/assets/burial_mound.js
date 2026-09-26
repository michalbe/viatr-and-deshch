// Burial mound: a long barrow of turf and stone, a kerb of standing stones, a carved post at the
// head with a rag of cloth, and a dark opening at the foot. About 8 m long, 2.2 m high.
import { createBuildKit } from '../buildkit.js';

export default function (THREE) {
  const B = createBuildKit(THREE);
  const g = new THREE.Group();
  B.add(g, B.sweep([{ p: [-3.6, 0, 0], rx: 1.4, ry: 0.4 }, { p: [-2.4, 0, 0], rx: 2.3, ry: 1.6 }, { p: [0, 0, 0], rx: 2.7, ry: 2.2 }, { p: [2.4, 0, 0], rx: 2.3, ry: 1.7 }, { p: [3.8, 0, 0], rx: 1.2, ry: 0.5 }], 10, { capStart: true, capEnd: true }), 'moss', { rep: [6, 2] });
  for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2; B.add(g, B.blob(0.42, 0.55 + (i % 3) * 0.2, 0.36, 6, 3), i % 2 ? 'stone' : 'stoneDark', { pos: [Math.cos(a) * 3.9, 0.25, Math.sin(a) * 2.9], rot: [0.1 * (i % 3 - 1), a, 0], rep: [2, 1] }); }
  B.add(g, B.box(1.6, 1.3, 0.5, 'stoneDark'), 'stoneDark', { pos: [3.2, 0.5, 0] });
  B.add(g, B.blob(0.7, 0.7, 0.3, 6, 3), 'glow', { pos: [3.2, 0.55, 0.05], rep: [1, 1] });
  B.add(g, B.rings([{ y: 3.2, rx: 0.02, rz: 0.02 }, { y: 3.0, rx: 0.16, rz: 0.16 }, { y: 1.6, rx: 0.14, rz: 0.14 }, { y: 0, rx: 0.16, rz: 0.16 }], 7, { capTop: true }), 'planksDark', { pos: [-3.6, 0, 0], rep: [1, 3] });
  for (let t = 0; t < 3; t++) B.add(g, B.blob(0.17, 0.14, 0.12, 6, 3), 'planksDark', { pos: [-3.6, 1.1 + t * 0.6, 0.14], rep: [1, 1] });
  B.add(g, B.sheet(0.3, 0.9, { sag: 0.05, wave: 0.03, taper: 0, rows: 3, cols: 1 }), 'linen2', { pos: [-3.6, 2.9, 0.2], rot: [0, 0.3, 0], rep: [1, 1] });
  B.add(g, B.blob(0.3, 0.26, 0.4, 7, 4), 'bone', { pos: [-2.6, 0.2, 2.6], rep: [1, 1] });
  return B.finish(g);
}
