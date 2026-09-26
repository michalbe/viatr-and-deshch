// Rain Shrine: gathers Rain at a Sacred Spring. Painted build: a stone platform with a round
// basin open to the sky at the front, a four-post thatch canopy at the back sheltering a tall
// four-faced idol, carved poles either side of the pool strung with linen and clan strips, bowls
// on the kerb. Footprint 5 x 5 m, 4.5 m tall, open to +Z.
import { createBuildKit } from '../buildkit.js';

export default function (THREE) {
  const B = createBuildKit(THREE);
  const { add, box, beam, roof, skull } = B;
  const g = new THREE.Group();

  // platform and kerb
  add(g, box(4.8, 0.4, 4.8, 'stone'), 'stone', { pos: [0, 0.2, 0] });
  add(g, box(5.2, 0.2, 5.2, 'stoneDark'), 'stoneDark', { pos: [0, 0.1, 0] });
  // basin: a stone ring and still water
  add(g, B.rings([{ y: 0.75, rx: 1.35, rz: 1.35 }, { y: 0.45, rx: 1.45, rz: 1.45 }, { y: 0.4, rx: 1.1, rz: 1.1 }], 12), 'stoneDark', { pos: [0, 0, 1.0], rep: [5, 1] });
  add(g, B.rings([{ y: 0.78, rx: 1.15, rz: 1.15 }, { y: 0.62, rx: 1.12, rz: 1.12 }, { y: 0.6, rx: 0.01, rz: 0.01 }], 12, { capBottom: true }), 'stoneDark', { pos: [0, 0, 1.0], rep: [4, 1] });
  add(g, B.rings([{ y: 0.665, rx: 0.02, rz: 0.02 }, { y: 0.66, rx: 1.13, rz: 1.13 }], 12), 'water', { pos: [0, 0, 1.0], rep: [1, 1] });
  // canopy at the back: four posts, tie beams, a steep little thatch roof
  for (const [x, z] of [[-1.3, -0.6], [1.3, -0.6], [-1.3, -2.2], [1.3, -2.2]]) beam(g, [x, 0.4, z], [x, 3.0, z], 0.22, 'planksDark');
  beam(g, [-1.5, 2.95, -0.6], [1.5, 2.95, -0.6], 0.18); beam(g, [-1.5, 2.95, -2.2], [1.5, 2.95, -2.2], 0.18);
  roof(g, 3.4, 2.4, 1.5, { courses: 3, lip: 0.18, thick: 0.22, y: 2.9, z: -1.4 });
  B.horseHeads(g, 3.3, 1.5, { y: 2.95, z: -0.2 });
  // back wattle screen so the rear reads
  add(g, box(3.0, 2.4, 0.12, 'planks'), 'planks', { pos: [0, 1.6, -2.3] });
  // the idol: a column of four stacked heads under a cap, on a stone base
  add(g, box(1.0, 0.3, 1.0, 'stoneDark'), 'stoneDark', { pos: [0, 0.55, -1.4] });
  add(g, B.rings([{ y: 2.6, rx: 0.36, rz: 0.36 }, { y: 2.2, rx: 0.4, rz: 0.4 }, { y: 1.5, rx: 0.42, rz: 0.42 }, { y: 0.8, rx: 0.4, rz: 0.4 }, { y: 0.7, rx: 0.34, rz: 0.34 }], 8, { capTop: true }), 'planksDark', { pos: [0, 0, -1.4], rep: [3, 2] });
  for (let t = 0; t < 3; t++) {
    const y = 1.1 + t * 0.6;
    for (let f = 0; f < 4; f++) { const a = f * Math.PI / 2; add(g, B.blob(0.16, 0.14, 0.1, 6, 3), 'planksDark', { pos: [Math.sin(a) * 0.4, y, -1.4 + Math.cos(a) * 0.4], rot: [0, a, 0], rep: [1, 1] }); }
    add(g, B.rings([{ y: y + 0.28, rx: 0.44, rz: 0.44 }, { y: y + 0.22, rx: 0.44, rz: 0.44 }], 8), 'ochre', { pos: [0, 0, -1.4], rep: [3, 1] });
  }
  add(g, B.rings([{ y: 2.95, rx: 0.02, rz: 0.02 }, { y: 2.8, rx: 0.3, rz: 0.3 }, { y: 2.6, rx: 0.42, rz: 0.42 }, { y: 2.55, rx: 0.4, rz: 0.4 }], 8, { capTop: true }), 'stoneDark', { pos: [0, 0, -1.4], rep: [3, 1] });
  // carved poles flanking the pool, a cord of hanging strips between them
  for (const s of [1, -1]) {
    add(g, B.rings([{ y: 3.4, rx: 0.02, rz: 0.02 }, { y: 3.2, rx: 0.14, rz: 0.14 }, { y: 2.0, rx: 0.12, rz: 0.12 }, { y: 0.4, rx: 0.14, rz: 0.14 }], 7, { capTop: true }), 'planksDark', { pos: [s * 2.0, 0, 1.6], rep: [1, 3] });
    for (const y of [1.2, 2.2]) add(g, B.rings([{ y: y + 0.08, rx: 0.16, rz: 0.16 }, { y: y - 0.08, rx: 0.16, rz: 0.16 }], 7), 'ochre', { pos: [s * 2.0, 0, 1.6], rep: [1, 1] });
    skull(g, s * 2.0, 3.35, 1.7, 0.6);
  }
  add(g, B.sweep([{ p: [-2.0, 3.0, 1.6], rx: 0.02 }, { p: [0, 2.7, 1.6], rx: 0.02 }, { p: [2.0, 3.0, 1.6], rx: 0.02 }], 4), 'beam', { rep: [1, 4] });
  for (let i = 0; i < 6; i++) { const x = -1.6 + i * 0.64; add(g, B.sheet(0.22, 0.7, { sag: 0.02, wave: 0.02, taper: 0, rows: 3, cols: 1 }), i % 2 ? 'team' : 'linen2', { pos: [x, 2.72 + Math.abs(x) * 0.15, 1.6], rep: [1, 1] }); }
  // bowls on the kerb
  for (const [x, z] of [[-1.7, 2.1], [1.7, 2.1], [0, 2.35]]) { add(g, B.rings([{ y: 0.62, rx: 0.2, rz: 0.2 }, { y: 0.5, rx: 0.18, rz: 0.18 }, { y: 0.42, rx: 0.1, rz: 0.1 }], 7, { capBottom: true }), 'planks', { pos: [x, 0, z], rep: [1, 1] }); add(g, B.rings([{ y: 0.585, rx: 0.01, rz: 0.01 }, { y: 0.58, rx: 0.17, rz: 0.17 }], 7), 'water', { pos: [x, 0, z], rep: [1, 1] }); }

  return B.finish(g);
}
