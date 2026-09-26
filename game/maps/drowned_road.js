/**
 * The Drowned Road: Mission 5. A river valley running north to south. The low road follows the
 * water and drowns when it rises; the hill road is long and dry. Crossings at three fords; a
 * dry camp halfway; the far shore at the south-east. The rival Rodina flees the same way.
 */
export default {
  id: 'drowned_road', name: 'The Drowned Road', seed: 83,
  base: { level: 1.1, macro: 2.6, micro: 0.35 },
  rivers: [{ pts: [[-30, -96], [-24, -60], [-8, -30], [0, 0], [6, 30], [-2, 60], [10, 96]], fords: [[-20, -48], [3, 12], [2, 52]], depth: 1.4, fordDepth: 0.2, width: 8 }],
  ponds: [[-40, -10, 3.0], [28, 40, 3.2], [-30, 40, 2.4]],
  hills: [[-64, -24, 5, 18], [-60, 30, 4, 16], [58, -50, 5, 18], [62, 10, 4, 16], [50, 66, 3, 14], [-84, -84, 6, 18], [84, -84, 6, 18], [-84, 84, 6, 18], [84, 84, 5, 16], [-34, -66, 3, 14]],
  bowls: [[-14, -34, 20, 1.5], [12, 34, 22, 1.5]],       // the low road: sunk basins beside the river that flood first
  forests: [{ kind: 'blob', x: -50, z: -60, r: 14 }, { kind: 'blob', x: 44, z: -30, r: 14 }, { kind: 'blob', x: -56, z: 62, r: 14 }, { kind: 'blob', x: 40, z: 20, r: 12 }, { kind: 'blob', x: 24, z: 74, r: 10 }],
  clumps: 0.7, rim: true, density: 0.9,
  springs: [[-46, 8], [30, -8]],
  exposedSpring: 1,
  clearing: null, idol: null, mounds: [],
  player: null, rival: null,
  start: [-66, -70],
  camps: [[-44, 4], [62, 70]],           // the dry camp halfway, and the far shore
  keepClear: [[-66, -70, 14], [62, 70, 16], [-44, 4, 14]],
  reeds: { box: [-40, -90, 60, 180], n: 260 },
};
