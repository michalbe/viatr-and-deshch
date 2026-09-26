// Root wall: the forest closing a path. A tangle of thick roots and saplings across ~8 m, 2 m
// high, that the Leshy withdraws when it is appeased (or dies).
import { createBuildKit } from '../buildkit.js';

export default function (THREE) {
  const B = createBuildKit(THREE);
  const g = new THREE.Group();
  for (let i = 0; i < 7; i++) {
    const x0 = -4 + i * 1.3, k = i % 3;
    B.add(g, B.sweep([{ p: [x0 - 0.6, 0, -1.2 + k * 0.3], rx: 0.28 }, { p: [x0, 1.4 + k * 0.4, -0.2], rx: 0.22 }, { p: [x0 + 0.9, 1.9 + k * 0.3, 0.6], rx: 0.16 }, { p: [x0 + 1.6, 0.9, 1.3], rx: 0.1 }, { p: [x0 + 2.0, 0, 1.6], rx: 0.03 }], 6, { capStart: true, capEnd: true }), 'bark', { rep: [2, 4] });
    B.add(g, B.sweep([{ p: [x0 + 0.3, 0.2, 0.4], rx: 0.14 }, { p: [x0 - 0.4, 1.2, -0.6], rx: 0.1 }, { p: [x0 - 0.9, 2.2, -0.9], rx: 0.03 }], 5, { capStart: true, capEnd: true }), 'bark', { rep: [1, 3] });
    if (i % 2) B.add(g, B.blob(0.7, 0.5, 0.6, 6, 3), 'leaves', { pos: [x0, 2.1 + k * 0.3, 0], rep: [2, 1] });
  }
  for (let i = 0; i < 9; i++) B.add(g, B.blob(0.35, 0.2, 0.3, 5, 2), i % 2 ? 'moss' : 'stoneDark', { pos: [-4 + i * 1.0, 0.1, (i % 3 - 1) * 0.9], rep: [1, 1] });
  return B.finish(g);
}
