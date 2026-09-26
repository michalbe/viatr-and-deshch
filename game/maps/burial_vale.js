/**
 * The Burial Vale: Mission 2. A settled valley that stopped answering: an intact Grod, an
 * abandoned hamlet by the ford, an old battlefield strewn with the dead, four barrows on the
 * high ground, a forest cemetery in the north-east ring, two springs. No rival base.
 */
export default {
  id: 'burial_vale', name: 'The Burial Vale', seed: 23,
  base: { level: 1.0, macro: 3.6, micro: 0.5 },
  palette: { dry: true },
  rivers: [{ pts: [[-96, -20], [-60, -8], [-30, 4], [-6, 20], [10, 48], [20, 96]], fords: [[-32, 3], [8, 44]], depth: 1.3, fordDepth: 0.45, width: 6.5 }],
  ponds: [[40, 60, 3.0], [50, 70, 2.2]],
  hills: [[-12, 12, 4, 14], [36, 34, 5, 14], [-52, -44, 6, 16], [62, -58, 6, 20], [-80, 70, 5, 16], [80, 20, 4, 14], [-30, 84, 4, 12], [84, 84, 5, 16], [-84, -84, 6, 18]],
  forests: [
    { kind: 'ring', x: 62, z: -58, r0: 14, r1: 30, gaps: [2.4], gapAngle: 0.35, pines: 0.9 },   // the forest cemetery, one way in from the south-west
    { kind: 'blob', x: -70, z: -40, r: 16 }, { kind: 'blob', x: 74, z: 62, r: 18 }, { kind: 'blob', x: -20, z: -78, r: 14 }, { kind: 'blob', x: 20, z: 80, r: 12 },
  ],
  clumps: 0.7, rim: true, density: 0.9,
  springs: [[-58, 24], [30, -30]],
  exposedSpring: 1,
  clearing: null, idol: null,
  mounds: [[-12, 12], [36, 34], [-52, -44], [62, -58]],   // the last is the great mound in the cemetery
  player: { grod: [-40, 52] },
  rival: null,
  camps: [[14, 62]],                                       // the abandoned hamlet
  keepClear: [[0, -12, 14], [-70, 70, 10]],                // the battlefield; where the Rodina arrives
  start: [-72, 72],
  reeds: { box: [-60, -30, 90, 100], n: 200 },
};
