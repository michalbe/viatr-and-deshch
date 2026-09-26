// Founding stake: the mark a ritualist plants where a structure will rise. A carved stake with a
// clan-cloth strip, a ring of small stones and a bundle of branches. About 1.8 m tall.
import { createBuildKit } from '../buildkit.js';

export default function (THREE) {
  const B = createBuildKit(THREE);
  const g = new THREE.Group();
  B.add(g, B.rings([{ y: 1.8, rx: 0.02, rz: 0.02 }, { y: 1.65, rx: 0.1, rz: 0.1 }, { y: 1.2, rx: 0.09, rz: 0.09 }, { y: 0.0, rx: 0.11, rz: 0.11 }], 6, { capTop: true }), 'planksDark', { rep: [1, 2] });
  for (const y of [1.0, 1.35]) B.add(g, B.rings([{ y: y + 0.05, rx: 0.12, rz: 0.12 }, { y: y - 0.05, rx: 0.12, rz: 0.12 }], 6), 'ochre', { rep: [1, 1] });
  B.add(g, B.ribbon(0.9, 0.14, [0.3, -0.6, 0.6], [0, 1, 0], 0.1, 0.5), 'team', { pos: [0, 1.5, 0], rep: [1, 1] });
  for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2; B.add(g, B.blob(0.22, 0.14, 0.2, 5, 2), i % 2 ? 'stone' : 'stoneDark', { pos: [Math.sin(a) * 0.9, 0.08, Math.cos(a) * 0.9], rot: [0, a, 0], rep: [1, 1] }); }
  for (let i = 0; i < 5; i++) { const a = 0.4 + i * 0.35; B.add(g, B.sweep([{ p: [0.2, 0.05, 0.5], rx: 0.03 }, { p: [0.2 + Math.cos(a) * 0.6, 0.12, 0.5 + Math.sin(a) * 0.6], rx: 0.01 }], 4, { capEnd: true }), 'log', { rep: [1, 1] }); }
  return B.finish(g);
}
