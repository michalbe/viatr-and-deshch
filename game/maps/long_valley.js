/**
 * The Long Valley: Mission 3. An east-west valley with four springs, a river crossing it north
 * to south with three fords, high hills at either end, open fields between. Player west, rival
 * east. The storm enters from the west and wanders east.
 */
export default {
  id: 'long_valley', name: 'The Long Valley', seed: 41,
  base: { level: 1.0, macro: 3.0, micro: 0.5 },
  palette: { dry: true },
  rivers: [{ pts: [[-6, -96], [0, -60], [8, -30], [4, 0], [-4, 30], [2, 60], [6, 96]], fords: [[4, -46], [0, 8], [1, 46]], depth: 1.4, fordDepth: 0.45, width: 7 }],
  ponds: [[-40, -60, 2.6], [46, 62, 2.4]],
  hills: [[-70, -30, 6, 18], [-72, 40, 5, 16], [70, 34, 6, 18], [74, -40, 5, 16], [-30, -70, 4, 14], [30, 72, 4, 14], [-84, 84, 6, 18], [84, -84, 6, 18], [-84, -84, 5, 16], [84, 84, 5, 16], [-28, 8, 3, 12], [34, -10, 3, 12]],
  forests: [{ kind: 'blob', x: -30, z: -40, r: 15 }, { kind: 'blob', x: 34, z: 44, r: 15 }, { kind: 'blob', x: -56, z: 70, r: 14 }, { kind: 'blob', x: 60, z: -70, r: 14 }, { kind: 'blob', x: 0, z: -80, r: 10 }, { kind: 'blob', x: 0, z: 84, r: 10 }],
  clumps: 0.72, rim: true, density: 0.85,
  springs: [[-40, 42], [-14, -24], [24, 30], [52, -52]],   // two on the player's side, two on the rival's
  exposedSpring: 2,
  clearing: null, idol: null, mounds: [],
  player: { grod: [-62, 22] },
  rival: { grod: [62, -22], raidGaps: [[0, 8], [4, -46], [1, 46]], spring: 3 },
  reeds: { box: [-20, -90, 40, 180], n: 220 },
};
