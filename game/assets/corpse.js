// A fallen body: a low bundle under a torn cloak, one arm out, a dropped spear. Read at RTS
// distance as "someone lies here".
import { createBuildKit } from '../buildkit.js';

export default function (THREE) {
  const B = createBuildKit(THREE);
  const g = new THREE.Group();
  B.add(g, B.sweep([{ p: [-0.6, 0.12, 0], rx: 0.16, ry: 0.1 }, { p: [-0.1, 0.18, 0.05], rx: 0.26, ry: 0.16 }, { p: [0.4, 0.15, 0.02], rx: 0.22, ry: 0.13 }, { p: [0.75, 0.1, 0], rx: 0.12, ry: 0.08 }], 7, { capStart: true, capEnd: true }), 'linen', { rep: [2, 2] });
  B.add(g, B.blob(0.16, 0.14, 0.15, 6, 3), 'bone', { pos: [0.85, 0.14, 0.05], rep: [1, 1] });
  B.add(g, B.sweep([{ p: [-0.2, 0.14, 0.2], rx: 0.06 }, { p: [0.1, 0.06, 0.55], rx: 0.05 }], 5, { capEnd: true }), 'linen', { rep: [1, 1] });
  B.add(g, B.sheet(0.8, 0.9, { sag: 0.02, wave: 0.02, taper: 0.1, rows: 2, cols: 2 }), 'team', { pos: [-0.1, 0.32, -0.35], rot: [Math.PI / 2 - 0.2, 0, 0.2], rep: [1, 1] });
  B.add(g, B.sweep([{ p: [0.2, 0.04, -0.5], rx: 0.03 }, { p: [1.6, 0.04, -0.7], rx: 0.03 }], 5, { capStart: true, capEnd: true }), 'beam', { rep: [1, 2] });
  return B.finish(g);
}
