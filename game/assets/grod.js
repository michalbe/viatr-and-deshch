// Grod: the settlement hall. Painted build: a cruciform log hall, two steep stepped-thatch roofs
// crossing, horse-head gables on all four ends, a porch over the front door, a tall clan banner,
// palisade stakes in the rear corners and a stone dance ring before the door.
// Footprint 11 x 11 m, 9 m tall, door faces +Z.
import { createBuildKit } from '../buildkit.js';

export default function (THREE) {
  const B = createBuildKit(THREE);
  const { add, box, log, beam, stake, roof, gable, horseHeads, banner, skull } = B;
  const g = new THREE.Group();

  const W = 6.2, D = 9.6, PL = 0.5, R = 0.2, N = 8;
  const wallTop = PL + R + N * R * 1.9;

  // one hall: plinth, log walls, daub gables, roof, horse heads on both ends
  const hall = (parent, withDoor) => {
    add(parent, box(W + 0.6, PL, D + 0.6, 'stone'), 'stone', { pos: [0, PL / 2, 0] });
    for (let i = 0; i < N; i++) {
      const y = PL + R + i * R * 1.9;
      for (const s of [1, -1]) {
        if (withDoor && s > 0 && i < 6) { log(parent, [-W / 2 - 0.35, y, s * D / 2], [-0.9, y, s * D / 2], R); log(parent, [0.9, y, s * D / 2], [W / 2 + 0.35, y, s * D / 2], R); }
        else log(parent, [-W / 2 - 0.35, y, s * D / 2], [W / 2 + 0.35, y, s * D / 2], R);
        log(parent, [s * W / 2, y + R * 0.95, -D / 2 - 0.35], [s * W / 2, y + R * 0.95, D / 2 + 0.35], R);
      }
    }
    gable(parent, W + 0.3, 4.2, 'daub', { y: wallTop - 0.1, z: D / 2 + 0.02 });
    gable(parent, W + 0.3, 4.2, 'daub', { y: wallTop - 0.1, z: -D / 2 - 0.02, flip: true });
    roof(parent, W + 2.0, D + 1.2, 4.5, { courses: 6, lip: 0.26, thick: 0.32, y: wallTop - 0.3 });
    horseHeads(parent, W + 1.9, 4.5, { y: wallTop - 0.25, z: D / 2 + 0.6 });
    const back = new THREE.Group(); back.rotation.y = Math.PI; parent.add(back);
    horseHeads(back, W + 1.9, 4.5, { y: wallTop - 0.25, z: D / 2 + 0.6 });
  };
  hall(g, true);
  const cross = new THREE.Group(); cross.rotation.y = Math.PI / 2; g.add(cross);
  hall(cross, false);
  // the crossing: a square cap where the two ridges meet, with a carved finial
  add(g, box(2.2, 0.9, 2.2, 'planksDark'), 'planksDark', { pos: [0, wallTop + 4.2, 0] });
  add(g, box(2.8, 0.3, 2.8, 'thatchDark'), 'thatchDark', { pos: [0, wallTop + 4.75, 0] });
  add(g, B.sweep([{ p: [0, wallTop + 4.8, 0], rx: 0.18 }, { p: [0, wallTop + 6.0, 0], rx: 0.14 }, { p: [0, wallTop + 6.3, 0], rx: 0.02 }], 6, { capStart: true, capEnd: true }), 'planksDark', { rep: [1, 1] });
  skull(g, 0, wallTop + 6.0, 0.2, 1.6);

  // front door, porch and clan cloth
  add(g, box(1.7, 2.6, 0.14, 'planksDark'), 'planksDark', { pos: [0, PL + 1.3, D / 2 + 0.05] });
  beam(g, [-1.05, PL, D / 2 + 0.2], [-1.05, PL + 2.9, D / 2 + 0.2], 0.22);
  beam(g, [1.05, PL, D / 2 + 0.2], [1.05, PL + 2.9, D / 2 + 0.2], 0.22);
  beam(g, [-1.3, PL + 2.9, D / 2 + 0.2], [1.3, PL + 2.9, D / 2 + 0.2], 0.26);
  for (const s of [1, -1]) beam(g, [s * 1.5, 0, D / 2 + 1.5], [s * 1.5, PL + 3.1, D / 2 + 1.5], 0.24);
  add(g, box(3.6, 0.3, 1.9, 'thatch'), 'thatch', { pos: [0, PL + 3.5, D / 2 + 0.85], rot: [0.5, 0, 0] });
  add(g, box(3.7, 0.28, 1.9, 'thatchDark'), 'thatchDark', { pos: [0, PL + 4.1, D / 2 + 0.05], rot: [0.5, 0, 0] });
  banner(g, 1.8, 1.6, { pos: [0, PL + 2.85, D / 2 + 0.36] });
  // clan banner on a tall pole beside the door
  beam(g, [3.6, 0, D / 2 + 1.0], [3.6, 8.6, D / 2 + 1.0], 0.2, 'planksDark');
  beam(g, [3.6, 8.2, D / 2 + 1.0], [5.2, 8.2, D / 2 + 1.0], 0.12, 'planksDark');
  banner(g, 1.5, 3.4, { pos: [4.45, 8.15, D / 2 + 1.0], sag: 0.1 });
  // palisade in the rear corners between the arms
  for (const s of [1, -1]) for (let i = 0; i < 6; i++) stake(g, s * (3.6 + i * 0.4), -3.6 - i * 0.4, 2.6 + (i % 2) * 0.3, 0.16, (i % 2) * 0.05);
  // dance ring before the door
  for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2; add(g, B.blob(0.28, 0.22, 0.26, 6, 3), 'stoneDark', { pos: [Math.sin(a) * 1.5, 0.1, D / 2 + 2.6 + Math.cos(a) * 0.9], rot: [0, a, 0], rep: [2, 1] }); }

  return B.finish(g);
}
