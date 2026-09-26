// Sacred Grove: where the bears are raised. Painted build: two great twisted trees at the back
// leaning into an arch, a stone trilithon gate at the front, a low ring of boulders, ribbon
// poles, a skull pole and a fire-stone. Footprint 9 x 9 m, 7 m tall, gate faces +Z.
import { createBuildKit } from '../buildkit.js';

export default function (THREE) {
  const B = createBuildKit(THREE);
  const { add, box, skull } = B;
  const g = new THREE.Group();

  // two twisted trees leaning into an arch
  const tree = (s) => {
    const path = [[s * 3.4, 0, -2.6], [s * 3.2, 1.4, -2.7], [s * 2.6, 3.0, -2.5], [s * 1.7, 4.6, -2.3], [s * 0.6, 5.8, -2.2], [s * 0.1, 6.4, -2.1]];
    const rad = [0.7, 0.5, 0.42, 0.34, 0.24, 0.12];
    add(g, B.sweep(path.map((p, i) => ({ p, rx: rad[i], ry: rad[i] * 0.9 })), 8, { capStart: true, capEnd: true }), 'bark', { rep: [3, 6] });
    // root flares
    for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; add(g, B.sweep([{ p: [s * 3.4, 0.6, -2.6], rx: 0.3 }, { p: [s * 3.4 + Math.sin(a) * 1.0, 0.1, -2.6 + Math.cos(a) * 1.0], rx: 0.16 }, { p: [s * 3.4 + Math.sin(a) * 1.5, 0, -2.6 + Math.cos(a) * 1.5], rx: 0.02 }], 5, { capStart: true, capEnd: true }), 'bark', { rep: [1, 1] }); }
    // branches and leaf clumps
    for (const [i, dx, dy, dz] of [[2, s * 1.4, 0.8, 0.9], [3, s * 1.2, 1.0, -1.2], [3, -s * 0.4, 1.2, 1.1], [4, s * 0.8, 0.6, -0.6]]) {
      const p = path[i];
      add(g, B.sweep([{ p, rx: rad[i] * 0.5 }, { p: [p[0] + dx, p[1] + dy, p[2] + dz], rx: 0.03 }], 5, { capEnd: true }), 'bark', { rep: [1, 2] });
      add(g, B.blob(1.2, 0.8, 1.1, 8, 4), 'leaves', { pos: [p[0] + dx, p[1] + dy + 0.3, p[2] + dz], rep: [3, 2] });
    }
    add(g, B.blob(1.6, 1.0, 1.4, 8, 4), 'leaves', { pos: [path[4][0], path[4][1] + 0.6, path[4][2]], rep: [4, 2] });
  };
  tree(1); tree(-1);
  add(g, B.blob(1.8, 1.0, 1.5, 8, 4), 'leaves', { pos: [0, 6.5, -2.1], rep: [4, 2] });
  // trilithon gate at the front
  for (const s of [1, -1]) add(g, box(0.9, 3.2, 0.7, 'stone'), 'stone', { pos: [s * 1.4, 1.6, 3.4], rot: [0, 0, s * 0.03] });
  add(g, box(4.0, 0.7, 0.8, 'stoneDark'), 'stoneDark', { pos: [0, 3.55, 3.4] });
  skull(g, 0, 4.1, 3.7, 1.2);
  // low ring of boulders
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; if (Math.abs(Math.sin(a)) < 0.3 && Math.cos(a) > 0) continue; add(g, B.blob(0.55 + (i % 3) * 0.12, 0.4 + (i % 2) * 0.15, 0.5, 6, 3), i % 2 ? 'stone' : 'stoneDark', { pos: [Math.sin(a) * 4.0, 0.2, Math.cos(a) * 4.0], rot: [0, a, 0], rep: [2, 1] }); }
  // fire-stone in the centre
  add(g, B.blob(0.9, 0.3, 0.9, 8, 3), 'stoneDark', { pos: [0, 0.15, 0.4], rep: [3, 1] });
  add(g, B.blob(0.35, 0.2, 0.35, 6, 3), 'glow', { pos: [0, 0.4, 0.4], rep: [1, 1] });
  // ribbon poles and a skull pole
  for (const [x, z] of [[-2.6, 1.2], [2.6, 1.2]]) {
    add(g, B.rings([{ y: 3.6, rx: 0.02, rz: 0.02 }, { y: 3.4, rx: 0.1, rz: 0.1 }, { y: 0, rx: 0.12, rz: 0.12 }], 6, { capTop: true }), 'planksDark', { pos: [x, 0, z], rep: [1, 3] });
    for (let i = 0; i < 3; i++) add(g, B.ribbon(1.4 - i * 0.2, 0.16, [-x * 0.15, -0.4, 0.5 + i * 0.2], [0, 1, 0], 0.15, i * 1.7), i % 2 ? 'team' : 'linen2', { pos: [x, 3.3 - i * 0.15, z], rep: [1, 1] });
  }
  add(g, B.rings([{ y: 2.8, rx: 0.06, rz: 0.06 }, { y: 0, rx: 0.1, rz: 0.1 }], 6), 'planksDark', { pos: [0, 0, -0.9], rep: [1, 3] });
  skull(g, 0, 2.9, -0.8, 1.0);

  return B.finish(g);
}
