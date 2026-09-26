// War Hall: trains the warband. Painted build: a tall gable hall of logs (ridge along z, door
// facing +z) flanked by two open lean-to sheds holding weapon racks, spears and clan shields;
// an antlered skull over the door. Footprint 9 x 7 m, 7 m tall.
import { createBuildKit } from '../buildkit.js';

export default function (THREE) {
  const B = createBuildKit(THREE);
  const { add, box, log, beam, roof, gable, horseHeads, banner, skull } = B;
  const g = new THREE.Group();

  const W = 4.4, D = 6.6, PL = 0.4, R = 0.18, N = 8;
  const wallTop = PL + R + N * R * 1.9;
  add(g, box(W + 0.5, PL, D + 0.5, 'stone'), 'stone', { pos: [0, PL / 2, 0] });
  for (let i = 0; i < N; i++) {
    const y = PL + R + i * R * 1.9;
    for (const s of [1, -1]) {
      if (s > 0 && i < 6) { log(g, [-W / 2 - 0.3, y, D / 2], [-0.8, y, D / 2], R); log(g, [0.8, y, D / 2], [W / 2 + 0.3, y, D / 2], R); }
      else log(g, [-W / 2 - 0.3, y, s * D / 2], [W / 2 + 0.3, y, s * D / 2], R);
      log(g, [s * W / 2, y + R * 0.95, -D / 2 - 0.3], [s * W / 2, y + R * 0.95, D / 2 + 0.3], R);
    }
  }
  gable(g, W + 0.2, 3.2, 'planks', { y: wallTop - 0.1, z: D / 2 + 0.02 });
  gable(g, W + 0.2, 3.2, 'planks', { y: wallTop - 0.1, z: -D / 2 - 0.02, flip: true });
  roof(g, W + 1.6, D + 1.0, 3.3, { courses: 5, y: wallTop - 0.25 });
  horseHeads(g, W + 1.5, 3.3, { y: wallTop - 0.2, z: D / 2 + 0.5 });
  const back = new THREE.Group(); back.rotation.y = Math.PI; g.add(back);
  horseHeads(back, W + 1.5, 3.3, { y: wallTop - 0.2, z: D / 2 + 0.5 });
  // door, lintel, clan cloth, skull above
  add(g, box(1.5, 2.3, 0.12, 'planksDark'), 'planksDark', { pos: [0, PL + 1.15, D / 2 + 0.05] });
  beam(g, [-0.9, PL, D / 2 + 0.18], [-0.9, PL + 2.5, D / 2 + 0.18], 0.2);
  beam(g, [0.9, PL, D / 2 + 0.18], [0.9, PL + 2.5, D / 2 + 0.18], 0.2);
  beam(g, [-1.15, PL + 2.5, D / 2 + 0.18], [1.15, PL + 2.5, D / 2 + 0.18], 0.24);
  banner(g, 1.5, 1.2, { pos: [0, PL + 2.45, D / 2 + 0.32] });
  skull(g, 0, wallTop + 1.4, D / 2 + 0.15, 1.3);

  // lean-to sheds: posts at the outer edge, a mono-pitch thatch from under the main eave
  for (const s of [1, -1]) {
    const x0 = s * (W / 2 + 0.6), x1 = s * 4.3, top = wallTop - 0.1, low = 2.1;
    for (const z of [-2.6, 0, 2.6]) beam(g, [x1, 0, z], [x1, low, z], 0.22, 'planksDark');
    beam(g, [x1, low, -2.9], [x1, low, 2.9], 0.18, 'planksDark');
    const len = Math.hypot(x1 - x0, top - low), ang = Math.atan2(top - low, Math.abs(x1 - x0));
    for (let j = 0; j < 3; j++) {
      const t = (j + 0.5) / 3, cx = x0 + (x1 - x0) * t, cy = top - (top - low) * t + 0.15 + (j % 2) * 0.04;
      add(g, box(len / 3 + 0.5, 0.26, 6.2, j % 2 ? 'thatchDark' : 'thatch'), j % 2 ? 'thatchDark' : 'thatch', { pos: [cx, cy - 0.06, 0], rot: [0, 0, s * ang] });
    }
    // weapon rack: rails, leaning spears, round clan shields
    beam(g, [x1 - s * 0.1, 1.3, -2.6], [x1 - s * 0.1, 1.3, 2.6], 0.1);
    for (let i = 0; i < 5; i++) {
      const z = -2.2 + i * 1.1, lean = s * 0.28;
      add(g, B.sweep([{ p: [x1 - s * 0.7, 0, z], rx: 0.035 }, { p: [x1 - s * 0.25, 2.6, z], rx: 0.03 }], 5, { capStart: true }), 'beam', { rep: [1, 3] });
      add(g, B.plate([[-0.06, 0], [0.06, 0], [0.03, 0.2], [0, 0.36], [-0.03, 0.2]], 0.03), 'iron', { pos: [x1 - s * 0.25, 2.6, z], rot: [0, 0, lean * 0.5] });
    }
    for (const z of [-1.6, 1.6]) {
      const sh = new THREE.Group(); sh.position.set(x1 - s * 0.45, 0.75, z); sh.rotation.set(Math.PI / 2, 0, s * 0.35); g.add(sh);
      add(sh, B.rings([{ y: 0.1, rx: 0.02, rz: 0.02 }, { y: 0.07, rx: 0.2, rz: 0.2 }, { y: 0.0, rx: 0.62, rz: 0.62 }, { y: -0.04, rx: 0.64, rz: 0.64 }], 10, { capTop: true, capBottom: true }), 'team', { rep: [3, 1] });
      add(sh, B.blob(0.16, 0.12, 0.16, 7, 3), 'iron', { pos: [0, 0.1, 0], rep: [1, 1] });
    }
  }

  return B.finish(g);
}
