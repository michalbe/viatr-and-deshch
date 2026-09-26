// Birch tree, 7 m. Painted build: a pale banded trunk forking into two, a light upper crown and
// two darker lower leaf masses.
import { createBuildKit } from '../buildkit.js';

export default function (THREE) {
  const B = createBuildKit(THREE);
  const g = new THREE.Group();
  B.add(g, B.sweep([{ p: [0, 0, 0], rx: 0.3 }, { p: [0.05, 2.2, 0], rx: 0.22 }, { p: [0.2, 4.4, 0.1], rx: 0.15 }, { p: [0.3, 6.2, 0.15], rx: 0.06 }], 7, { capStart: true, capEnd: true }), 'birchBark', { rep: [2, 5] });
  B.add(g, B.sweep([{ p: [0.05, 2.4, 0], rx: 0.14 }, { p: [-0.7, 3.8, -0.3], rx: 0.1 }, { p: [-1.1, 5.0, -0.4], rx: 0.04 }], 6, { capEnd: true }), 'birchBark', { rep: [1, 3] });
  B.add(g, B.sweep([{ p: [0.2, 3.6, 0.1], rx: 0.1 }, { p: [1.0, 4.6, 0.5], rx: 0.04 }], 5, { capEnd: true }), 'birchBark', { rep: [1, 2] });
  B.add(g, B.blob(1.5, 1.1, 1.4, 8, 4), 'leaves', { pos: [0.3, 6.0, 0.1], rep: [4, 2] });
  B.add(g, B.blob(1.3, 0.9, 1.2, 8, 4), 'leaves', { pos: [-1.0, 4.9, -0.4], rep: [3, 2] });
  B.add(g, B.blob(1.2, 0.85, 1.1, 8, 4), 'leaves', { pos: [1.1, 4.6, 0.5], rep: [3, 2] });
  return B.finish(g);
}
