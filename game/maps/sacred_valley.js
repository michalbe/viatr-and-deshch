/**
 * The Sacred Valley: Mission 1 and the skirmish map. Player south-west, rival north-east, a river
 * with two fords, a marsh, the dividing forest with two passages and the Leshy's clearing in the
 * middle, three springs, the idol on a hill.
 *
 * Every map is data of this shape; terrain.js turns it into heights, colours, a path grid and
 * vegetation. Coordinates are metres; north is -Z; the map is always 180 x 180.
 */
export default {
  id: 'sacred_valley', name: 'The Sacred Valley', seed: 7,
  base: { level: 1.1, macro: 3.2, micro: 0.5 },
  rivers: [{ pts: [[-96, 8], [-60, 16], [-38, 24], [-24, 36], [-14, 52], [-8, 70], [-4, 96]], fords: [[-50, 19.5], [-11, 61]], depth: 1.35, fordDepth: 0.45, width: 7 }],
  ponds: [[-31, 36, 3.2], [-20, 27, 2.4], [-35, 43, 2.0]],
  hills: [
    [-58, -52, 7, 15], [80, -18, 5, 16], [22, -82, 5, 18], [-86, 22, 4, 14], [62, 76, 6, 20],
    [-80, -84, 7, 20], [86, 86, 6, 18], [-20, -78, 3, 14], [84, 40, 4, 12], [-42, 88, 3.5, 12],
  ],
  flats: [],
  // the dividing band runs along the diagonal x = z; the player side is negative
  forests: [{ kind: 'band', normal: [1, -1], half: 12, gaps: [-60, 58], corridor: true }],
  clumps: 0.64, rim: true,
  springs: [[-40, 71], [22, 18], [71, -36]],   // near player, exposed centre, near rival
  exposedSpring: 1,
  clearing: [-4, -4],
  idol: [-58, -52],
  mounds: [],
  player: { grod: [-60, 60] },
  rival: { grod: [60, -60], raidGaps: [[41, 41], [-42, -42]] },
  reeds: { box: [-60, 10, 64, 70], n: 220 },
};
