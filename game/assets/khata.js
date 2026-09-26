// Khata: the family house (+8 supply). Painted build: a log cabin on a stone plinth under a steep
// stepped-thatch gable roof, daub gables, a plank door with a team cloth over the lintel, a
// shuttered window, a bench and a woodpile. Footprint 5 x 5 m, 5 m tall, door faces +Z.
import { createBuildKit } from '../buildkit.js';

export default function (THREE) {
  const B = createBuildKit(THREE);
  const { add, box, log, beam, roof, gable, horseHeads, banner } = B;
  const g = new THREE.Group();

  const W = 4.2, D = 4.6, PL = 0.35, R = 0.17, N = 7;
  // stone plinth
  add(g, box(W + 0.5, PL, D + 0.5, 'stone'), 'stone', { pos: [0, PL / 2, 0] });
  // log walls: logs along x on the ±z faces, along z on the ±x faces, ends crossing at the corners
  for (let i = 0; i < N; i++) {
    const y = PL + R + i * R * 1.9, xz = i % 2 ? 0 : R * 0.9;
    for (const s of [1, -1]) {
      log(g, [-W / 2 - 0.3, y, s * D / 2 + (i % 2 ? 0 : 0)], [W / 2 + 0.3, y, s * D / 2], R);
      log(g, [s * W / 2, y + R * 0.95, -D / 2 - 0.3], [s * W / 2, y + R * 0.95, D / 2 + 0.3], R);
    }
  }
  const wallTop = PL + R + N * R * 1.9;
  // daub gables under the roof, front and back
  gable(g, W + 0.2, 2.3, 'daub', { y: wallTop - 0.1, z: D / 2 + 0.02 });
  gable(g, W + 0.2, 2.3, 'daub', { y: wallTop - 0.1, z: -D / 2 - 0.02, flip: true });
  // roof
  const rf = roof(g, W + 1.6, D + 1.0, 2.6, { courses: 4, y: wallTop - 0.25 });
  horseHeads(g, W + 1.5, 2.6, { y: wallTop - 0.2, z: D / 2 + 0.5 });
  // door: dark planks in a beam frame, team cloth over the lintel
  add(g, box(1.0, 1.7, 0.12, 'planksDark'), 'planksDark', { pos: [0, PL + 0.85, D / 2 + 0.1] });
  beam(g, [-0.62, PL, D / 2 + 0.16], [-0.62, PL + 1.9, D / 2 + 0.16], 0.16);
  beam(g, [0.62, PL, D / 2 + 0.16], [0.62, PL + 1.9, D / 2 + 0.16], 0.16);
  beam(g, [-0.8, PL + 1.9, D / 2 + 0.16], [0.8, PL + 1.9, D / 2 + 0.16], 0.18);
  banner(g, 1.1, 0.9, { pos: [0, PL + 2.05, D / 2 + 0.28] });
  // shuttered window on the +x side
  add(g, box(0.1, 0.7, 0.7, 'planksDark'), 'planksDark', { pos: [W / 2 + 0.12, PL + 1.4, 0.4] });
  add(g, box(0.08, 0.75, 0.4, 'planks'), 'planks', { pos: [W / 2 + 0.2, PL + 1.4, 0.95], rot: [0, 0.6, 0] });
  beam(g, [W / 2 + 0.05, PL + 1.8, 0.0], [W / 2 + 0.05, PL + 1.8, 0.85], 0.14);
  // bench by the door and a woodpile at the back corner
  add(g, box(1.4, 0.1, 0.4, 'planks'), 'planks', { pos: [1.6, PL + 0.45, D / 2 + 0.5] });
  for (const x of [1.1, 2.1]) beam(g, [x, 0, D / 2 + 0.5], [x, PL + 0.42, D / 2 + 0.5], 0.14);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3 - i; j++) log(g, [-W / 2 - 0.65, 0.16 + i * 0.28, -1.2 + j * 0.32 + i * 0.16], [-W / 2 - 0.65, 0.16 + i * 0.28, -1.2 + j * 0.32 + i * 0.16 + 0.001], 0.15, 'log');
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3 - i; j++) log(g, [-W / 2 - 1.1, 0.16 + i * 0.28, -1.2 + j * 0.32 + i * 0.16], [-W / 2 - 0.2, 0.16 + i * 0.28, -1.2 + j * 0.32 + i * 0.16], 0.14, 'log');
  // smoke hole cap on the ridge
  add(g, box(0.9, 0.5, 0.9, 'planksDark'), 'planksDark', { pos: [0, wallTop + 2.4, -0.8] });
  add(g, box(1.2, 0.18, 1.2, 'thatchDark'), 'thatchDark', { pos: [0, wallTop + 2.72, -0.8] });

  return B.finish(g);
}
