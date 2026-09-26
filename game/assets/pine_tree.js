// Pine tree, 8 m. Painted build: a bark trunk and three lofted needle tiers, each a drooping
// skirt with a flat underside so the boughs read as solid masses from the RTS camera.
import { createBuildKit } from '../buildkit.js';

export default function (THREE) {
  const B = createBuildKit(THREE);
  const g = new THREE.Group();
  B.add(g, B.sweep([{ p: [0, 0, 0], rx: 0.42 }, { p: [0.03, 2.5, 0.02], rx: 0.3 }, { p: [0.06, 5.2, 0.0], rx: 0.2 }, { p: [0.04, 7.0, -0.02], rx: 0.1 }], 7, { capStart: true, capEnd: true }), 'bark', { rep: [2, 5] });
  const tier = (y, r, h) => B.add(g, B.rings([{ y: y + h, rx: 0.04, rz: 0.04 }, { y: y + h * 0.55, rx: r * 0.55, rz: r * 0.55 }, { y: y + h * 0.2, rx: r * 0.9, rz: r * 0.9 }, { y: y, rx: r, rz: r }, { y: y + h * 0.12, rx: r * 0.55, rz: r * 0.55 }], 8, { capTop: true, capBottom: true }), 'needles', { rep: [4, 2] });
  tier(1.9, 2.5, 2.4);
  tier(3.9, 1.9, 2.3);
  tier(5.8, 1.25, 2.4);
  return B.finish(g);
}
