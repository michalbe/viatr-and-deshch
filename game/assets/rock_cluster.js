// Rock cluster. Painted build: a heap of four rounded stone chunks, two tones, one mossy top.
import { createBuildKit } from '../buildkit.js';

export default function (THREE) {
  const B = createBuildKit(THREE);
  const g = new THREE.Group();
  B.add(g, B.blob(1.0, 0.7, 0.85, 7, 3), 'stone', { pos: [0, 0.35, 0], rot: [0.1, 0.4, 0.05], rep: [3, 1] });
  B.add(g, B.blob(0.7, 0.5, 0.6, 6, 3), 'stoneDark', { pos: [0.9, 0.25, 0.3], rot: [0, 1.2, 0.15], rep: [2, 1] });
  B.add(g, B.blob(0.55, 0.45, 0.5, 6, 3), 'stone', { pos: [-0.7, 0.2, 0.5], rot: [0.2, 2.1, 0], rep: [2, 1] });
  B.add(g, B.blob(0.45, 0.35, 0.4, 6, 3), 'stoneDark', { pos: [-0.2, 0.2, -0.8], rot: [0, 0.7, 0.1], rep: [2, 1] });
  B.add(g, B.blob(0.55, 0.14, 0.45, 6, 2), 'moss', { pos: [0.1, 1.0, -0.1], rep: [2, 1] });
  return B.finish(g);
}
