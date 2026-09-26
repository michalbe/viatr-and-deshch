/**
 * The Black Grove: Mission 4. No base. A forest in rings, with three old idols hidden in it, two
 * Vila rings, wandering lights, the Leshy's own children, and the great Leshy at the heart. The
 * way in is from the south-west; the rings have gaps that the mission opens and closes.
 */
export default {
  id: 'black_grove', name: 'The Black Grove', seed: 61,
  base: { level: 1.2, macro: 2.6, micro: 0.6 },
  rivers: [{ pts: [[-96, 70], [-60, 60], [-30, 74], [10, 80], [40, 96]], fords: [[-45, 66]], depth: 1.2, fordDepth: 0.4, width: 5.5 }],
  ponds: [[36, 30, 3.0], [-34, -34, 2.2], [56, -60, 2.6]],
  hills: [[0, 0, 2, 18], [-52, -50, 3, 14], [26, -30, 3, 12], [-84, 84, 6, 18], [84, -84, 6, 18], [84, 84, 5, 16], [-84, -84, 5, 16]],
  forests: [
    { kind: 'ring', x: 0, z: 0, r0: 16, r1: 30, gaps: [2.2, -0.9], gapAngle: 0.3, pines: 0.75 },           // the inner ring around the heart
    { kind: 'ring', x: 0, z: 0, r0: 44, r1: 62, gaps: [2.6, 0.4, -1.8], gapAngle: 0.26, pines: 0.85 },     // the outer ring
    { kind: 'blob', x: -55, z: 20, r: 14 }, { kind: 'blob', x: 60, z: 40, r: 14 }, { kind: 'blob', x: 20, z: -70, r: 16 },
  ],
  clumps: 0.66, rim: true, density: 1,
  springs: [],
  clearing: [0, 0],
  idol: null,
  sites: [
    { st: 'idol', tag: 'west', x: -52, z: -52, name: 'The Idol of the West', title: 'Stribog\'s face, worn by wind', block: 2.6 },
    { st: 'idol', tag: 'hill', x: 26, z: -30, name: 'The Idol of the Hill', title: 'Perun\'s scar across the stone', block: 2.6 },
    { st: 'idol', tag: 'heart', x: -3, z: 6, name: 'The Idol of the Heart', title: 'Veles, roots in its mouth', block: 2.6 },
    { st: 'ring', tag: 'ring1', x: 18, z: -14, name: 'The Vila Ring', title: 'Mushrooms in a circle. Do not step inside.', radius: 3.4 },
    { st: 'ring', tag: 'ring2', x: -26, z: 26, name: 'The Second Ring', title: 'Mushrooms in a circle. Do not step inside.', radius: 3.4 },
  ],
  mounds: [],
  player: null, rival: null,
  start: [-72, 72],
  keepClear: [[-72, 72, 12], [-45, 27, 5], [49, 21, 5], [-12, -52, 6], [-13, 19, 5], [14, -18, 5], [6, -6, 8]],
  reeds: { box: [-90, 50, 130, 40], n: 120 },
};
