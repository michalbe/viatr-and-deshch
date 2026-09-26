// A Vila ring: a circle of pale mushrooms and white flowers in flattened grass, 6 m across,
// with a mossy stone at the centre. Where a Vila dances.
import { createBuildKit } from '../buildkit.js';

export default function (THREE) {
  const B = createBuildKit(THREE);
  const g = new THREE.Group();
  for (let i = 0; i < 22; i++) {
    const a = i / 22 * Math.PI * 2, r = 3.0 + (i % 3) * 0.15;
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (i % 2) { B.add(g, B.rings([{ y: 0.32, rx: 0.02, rz: 0.02 }, { y: 0.28, rx: 0.16, rz: 0.16 }, { y: 0.2, rx: 0.14, rz: 0.14 }, { y: 0.18, rx: 0.05, rz: 0.05 }, { y: 0, rx: 0.05, rz: 0.05 }], 7, { capTop: true }), 'daub', { pos: [x, 0, z], rep: [1, 1] }); }
    else { B.add(g, B.blob(0.12, 0.05, 0.12, 6, 2), 'linen', { pos: [x, 0.12, z], rep: [1, 1] }); B.add(g, B.sweep([{ p: [x, 0, z], rx: 0.015 }, { p: [x, 0.12, z], rx: 0.01 }], 4), 'reed', { rep: [1, 1] }); }
  }
  B.add(g, B.blob(0.6, 0.35, 0.5, 7, 3), 'stoneDark', { pos: [0, 0.15, 0], rep: [2, 1] });
  B.add(g, B.blob(0.5, 0.12, 0.42, 6, 2), 'moss', { pos: [0, 0.48, 0], rep: [1, 1] });
  B.add(g, B.blob(3.2, 0.03, 3.2, 12, 2), 'moss', { pos: [0, 0.02, 0], rep: [4, 1] });
  return B.finish(g);
}
