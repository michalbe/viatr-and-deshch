// Stone Idol, the 8 m landmark on the hill. Painted build: a rough octagonal column swelling
// into one great four-faced head under a tall round cap, heavy brows over glowing eye pockets,
// three rings of carved bands, an octagonal stepped plinth, a broken ring of leaning menhirs.
import { createBuildKit } from '../buildkit.js';

export default function (THREE) {
  const B = createBuildKit(THREE);
  const { add, box } = B;
  const g = new THREE.Group();
  // plinth
  add(g, B.rings([{ y: 0.5, rx: 2.4, rz: 2.4 }, { y: 0.0, rx: 2.6, rz: 2.6 }], 8, { capTop: true }), 'stoneDark', { rep: [8, 1] });
  add(g, B.rings([{ y: 1.0, rx: 1.7, rz: 1.7 }, { y: 0.5, rx: 1.9, rz: 1.9 }], 8, { capTop: true }), 'stone', { rep: [6, 1] });
  // column and head
  add(g, B.rings([
    { y: 7.0, rx: 1.0, rz: 1.0 }, { y: 6.2, rx: 1.35, rz: 1.35 }, { y: 5.0, rx: 1.4, rz: 1.4 }, { y: 4.2, rx: 1.15, rz: 1.15 },
    { y: 3.0, rx: 1.0, rz: 1.0 }, { y: 1.0, rx: 1.15, rz: 1.15 },
  ], 8, { capTop: true }), 'stoneDark', { rep: [6, 4] });
  // carved bands
  for (const y of [1.6, 2.6, 3.7]) add(g, B.rings([{ y: y + 0.2, rx: 1.16, rz: 1.16 }, { y: y - 0.2, rx: 1.16, rz: 1.16 }], 8), 'stone', { rep: [6, 1] });
  // four faces: brow bar, glowing eye pockets, nose wedge, drooping moustache, mouth
  for (let f = 0; f < 4; f++) {
    const face = new THREE.Group(); face.rotation.y = f * Math.PI / 2; g.add(face);
    add(face, box(1.5, 0.35, 0.5, 'stoneDark'), 'stoneDark', { pos: [0, 5.9, 1.25] });
    for (const s of [1, -1]) { add(face, box(0.42, 0.34, 0.3, 'stoneDark'), 'stoneDark', { pos: [s * 0.45, 5.5, 1.3] }); add(face, B.blob(0.15, 0.1, 0.06, 6, 3), 'glow', { pos: [s * 0.45, 5.5, 1.45], rep: [1, 1] }); }
    add(face, B.plate([[-0.22, 0.5], [0.22, 0.5], [0.3, -0.5], [-0.3, -0.5]], 0.4), 'stoneDark', { pos: [0, 5.0, 1.45] });
    add(face, B.sweep([{ p: [-0.75, 4.55, 1.35], rx: 0.12 }, { p: [0, 4.75, 1.45], rx: 0.16 }, { p: [0.75, 4.55, 1.35], rx: 0.12 }], 5, { capStart: true, capEnd: true }), 'stoneDark', { rep: [1, 1] });
    add(face, box(0.7, 0.14, 0.2, 'stoneDark'), 'stoneDark', { pos: [0, 4.3, 1.4] });
    add(face, box(0.5, 0.5, 0.2, 'stoneDark'), 'stoneDark', { pos: [0, 2.2, 1.1] });   // relief figure between the bands
  }
  // cap: brim, drum, rounded crown
  add(g, B.rings([{ y: 7.25, rx: 1.65, rz: 1.65 }, { y: 6.95, rx: 1.7, rz: 1.7 }], 10, { capTop: true }), 'stone', { rep: [6, 1] });
  add(g, B.rings([{ y: 8.0, rx: 1.0, rz: 1.0 }, { y: 7.9, rx: 1.35, rz: 1.35 }, { y: 7.25, rx: 1.4, rz: 1.4 }], 10, { capTop: true }), 'stoneDark', { rep: [6, 1] });
  add(g, B.blob(1.0, 0.5, 1.0, 10, 3), 'stone', { pos: [0, 8.0, 0], rep: [4, 1] });
  // menhirs, one fallen
  for (let i = 0; i < 7; i++) {
    const a = i / 7 * Math.PI * 2 + 0.4, r = 3.6, lean = (i % 3 - 1) * 0.12;
    if (i === 4) { add(g, box(0.7, 2.4, 0.5, 'stoneDark'), 'stoneDark', { pos: [Math.sin(a) * r, 0.3, Math.cos(a) * r], rot: [Math.PI / 2, a, 0] }); continue; }
    add(g, box(0.7, 2.4 + (i % 2) * 0.6, 0.5, i % 2 ? 'stone' : 'stoneDark'), i % 2 ? 'stone' : 'stoneDark', { pos: [Math.sin(a) * r, 1.2, Math.cos(a) * r], rot: [lean, a, lean * 0.5] });
  }
  return B.finish(g);
}
