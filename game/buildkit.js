/**
 * Kit for painted buildings and props.
 *
 * Buildings are static and big, so instead of one packed atlas per asset they share a small
 * set of REPEATING painted textures (thatch, planks, logs, daub, stone, team cloth, ...), one
 * material each, and every part's UVs are scaled to world size so a 6 m wall and a 40 cm sill
 * show the same texel density. The loader merges by material, so a building costs one draw
 * call per texture it uses (6–8), and every building in the game shares the same textures.
 *
 * Geometry comes from the character kit (lofts, sweeps, plates) plus boxes and roofs here.
 */
import { createPainter, GREY } from './paint.js';
import { createKit } from './charkit.js';

let shared = null;

function makeShared(THREE) {
  const tex = (seed, fn, size = 256) => { const P = createPainter(THREE, size, seed, { tileable: true }); P.region('all', 0, 0, size, size, (c, w, h) => fn(P, c, w, h)); const t = P.texture(); t.anisotropy = 8; return t; };
  const mat = (map, color, extra = {}) => { const m = new THREE.MeshStandardMaterial({ map, color, roughness: 0.9, metalness: 0, ...extra }); m.name = 'painted'; return m; };
  const T = {
    thatch: tex(301, (P, c, w, h) => P.thatch(w, h, { base: 0x7a5a2e })),
    thatchDark: tex(302, (P, c, w, h) => P.thatch(w, h, { base: 0x5a4226 })),
    planks: tex(303, (P, c, w, h) => P.planks(w, h, { base: 0xa27a4f, count: 4 })),
    planksDark: tex(304, (P, c, w, h) => P.planks(w, h, { base: 0x5e4029, count: 3, nails: false })),
    log: tex(305, (P, c, w, h) => P.bark(w, h, { base: 0x8a6440 })),
    beam: tex(306, (P, c, w, h) => { P.planks(w, h, { base: 0x5e4029, count: 1, nails: false }); }),
    daub: tex(307, (P, c, w, h) => P.daub(w, h, { base: 0xcfc2a2 })),
    stone: tex(308, (P, c, w, h) => P.stonewall(w, h, { base: 0x7d786c, rows: 4 })),
    stoneDark: tex(309, (P, c, w, h) => P.stonewall(w, h, { base: 0x55524b, rows: 3 })),
    team: tex(310, (P, c, w, h) => { P.cloth(w, h, { base: GREY, folds: 4, depth: 0.5 }); }),
    linen: tex(311, (P, c, w, h) => P.cloth(w, h, { base: 0xe6dcc3, folds: 4, depth: 0.5 })),
    ochre: tex(312, (P, c, w, h) => P.cloth(w, h, { base: 0xc98a2b, folds: 3, depth: 0.4 })),
    iron: tex(313, (P, c, w, h) => P.iron(w, h, { base: 0x6e757c, bevel: 0, spec: 0.5, band: 0.35 })),
    bone: tex(314, (P, c, w, h) => P.bone(w, h)),
    bark: tex(315, (P, c, w, h) => P.bark(w, h, { base: 0x4a3322 })),
    birchBark: tex(316, (P, c, w, h) => { P.fill(w, h, P.tone(0xe8e2d4)); P.strokes(w, h, { n: 90, len: 10, width: 3, angle: 0, jitter: 0.2, cols: ['rgba(30,25,20,0.8)', 'rgba(60,50,40,0.6)'] }); P.speckle(w, h, { n: 300, alpha: 0.08 }); }),
    needles: tex(317, (P, c, w, h) => P.needles(w, h)),
    leaves: tex(318, (P, c, w, h) => P.leaves(w, h, { base: 0x8fae4a, dark: 0x4f6f2a })),
    moss: tex(319, (P, c, w, h) => P.leaves(w, h, { base: 0x6f8f3a, dark: 0x3f5f2a })),
    blades: tex(320, (P, c, w, h) => P.blades(w, h, { base: 0x5f7f2a, dark: 0x2f4f1a })),
    reed: tex(321, (P, c, w, h) => P.blades(w, h, { base: 0x7f9a3a, dark: 0x3f5a22 })),
    water: tex(322, (P, c, w, h) => P.water(w, h)),
    glow: tex(323, (P, c, w, h) => P.fill(w, h, P.tone(0x9ff0c8, 0.3)), 32),
  };
  const M = {};
  for (const [k, t] of Object.entries(T)) { M[k] = mat(t, 0xffffff); M[k].userData.tex = k; }
  M.team = mat(T.team, 0xc0282d, { side: THREE.DoubleSide }); M.team.userData.tex = 'team';   // the loader swaps this hex for the clan
  M.linen2 = mat(T.linen, 0xffffff, { side: THREE.DoubleSide });
  M.thatch2 = mat(T.thatch, 0xffffff, { side: THREE.DoubleSide });
  M.blades2 = mat(T.blades, 0xffffff, { side: THREE.DoubleSide });
  M.reed2 = mat(T.reed, 0xffffff, { side: THREE.DoubleSide });
  M.needles2 = mat(T.needles, 0xffffff, { side: THREE.DoubleSide });
  M.glow = mat(T.glow, 0xffffff, { emissive: 0x9ff0c8, emissiveIntensity: 1.5 });
  M.water.roughness = 0.2;
  // metres per texture repeat
  const TILE = { thatch: 1.4, thatchDark: 1.4, thatch2: 1.4, planks: 1.6, planksDark: 1.2, log: 1.2, beam: 0.8, daub: 2.2, stone: 1.6, stoneDark: 1.6, team: 1.4, linen: 1.2, linen2: 1.2, ochre: 0.8, iron: 0.6, bone: 0.5, bark: 1.4, birchBark: 1.2, needles: 1.5, needles2: 1.5, leaves: 1.6, moss: 1.0, blades: 1.0, blades2: 1.0, reed: 1.0, reed2: 1.0, water: 2.5, glow: 1 };
  const K = createKit(THREE, { rects: {}, size: 1, texture: () => null });
  return { T, M, TILE, K };
}

export function createBuildKit(THREE) {
  if (!shared) shared = makeShared(THREE);
  const { M, TILE, K } = shared;
  const V = K.V;

  /** Scale UVs so one repeat covers `tile` metres, from the geometry's own size (or explicit repeats). */
  function tileUV(g, tile, rep) {
    const a = g.attributes.uv; if (!a) return g;
    let u = 1, v = 1;
    if (rep) [u, v] = rep;
    else { g.computeBoundingBox(); const s = g.boundingBox.getSize(V()); u = Math.max(0.25, Math.max(s.x, s.z) / tile); v = Math.max(0.25, s.y / tile); }
    for (let i = 0; i < a.count; i++) a.setXY(i, a.getX(i) * u, a.getY(i) * v);
    a.needsUpdate = true;
    return g;
  }

  /** A box with per-face UV scaled to world size. */
  function box(w, h, d, matName, opts = {}) {
    const g = new THREE.BoxGeometry(w, h, d);
    const a = g.attributes.uv, tile = TILE[matName] || 1;
    const dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
    for (let f = 0; f < 6; f++) for (let i = 0; i < 4; i++) { const k = f * 4 + i; a.setXY(k, a.getX(k) * dims[f][0] / tile, a.getY(k) * dims[f][1] / tile); }
    g.userData.tiled = true;
    return g;
  }

  /** Add a mesh with a named shared material; UVs tiled unless the geometry already is. */
  function add(parent, g, matName, { pos = [0, 0, 0], rot = [0, 0, 0], scale = 1, rep } = {}) {
    const mat = M[matName]; if (!mat) throw new Error('no building material: ' + matName);
    if (!g.userData.tiled) { if (!g.attributes.uv) K.projectUV(g); tileUV(g, TILE[matName] || 1, rep); g.userData.tiled = true; }
    const m = new THREE.Mesh(g, mat);
    m.position.set(...pos); m.rotation.set(...rot);
    if (Array.isArray(scale)) m.scale.set(...scale); else m.scale.setScalar(scale);
    parent.add(m);
    return m;
  }

  /** Round log from a to b. */
  function log(parent, a, b, r, matName = 'log', r2 = r) {
    const A = V(...a), B = V(...b), L = A.distanceTo(B);
    const g = K.sweep([{ p: a, rx: r }, { p: b, rx: r2 }], 7, { capStart: true, capEnd: true });
    return add(parent, g, matName, { rep: [Math.max(1, Math.PI * r * 2 / (TILE[matName] || 1)), Math.max(1, L / (TILE[matName] || 1))] });
  }

  /** Square beam from a to b, `t` thick. */
  function beam(parent, a, b, t, matName = 'beam') {
    const A = V(...a), B = V(...b), d = B.clone().sub(A), L = d.length();
    const g = box(t, L, t, matName);
    const m = new THREE.Mesh(g, M[matName]);
    m.position.copy(A).addScaledVector(d, 0.5);
    m.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize());
    parent.add(m);
    return m;
  }

  /** Sharpened stake standing at x,z. */
  function stake(parent, x, z, h, r = 0.12, lean = 0) {
    const g = K.sweep([{ p: [0, 0, 0], rx: r }, { p: [0, h * 0.8, 0], rx: r * 0.9 }, { p: [0, h, 0], rx: 0.01 }], 6, { capStart: true, capEnd: true });
    return add(parent, g, 'log', { pos: [x, 0, z], rot: [lean, 0, 0], rep: [1, h / TILE.log] });
  }

  /**
   * Steep thatch gable roof: ridge along z, `width` across x at the eaves, `depth` along z
   * (including overhang), rising `rise`. Built as stepped courses, each a slab kicked out at
   * its lower edge so it throws a shadow line, alternating light and dark thatch.
   */
  function roof(parent, width, depth, rise, { courses = 4, lip = 0.22, thick = 0.28, y = 0, z = 0 } = {}) {
    const half = width / 2, slope = Math.hypot(half, rise), ang = Math.atan2(rise, half);
    const group = new THREE.Group(); group.position.set(0, y, z); parent.add(group);
    for (const s of [1, -1]) {
      for (let j = 0; j < courses; j++) {
        const t0 = j / courses, t1 = (j + 1) / courses, len = slope / courses + lip;
        // slab centre along the slope, pushed out by the lip at its lower edge
        const mid = (t0 + t1) / 2, cx = s * half * mid, cy = rise * (1 - mid) + thick * 0.5 + (j % 2) * 0.04;
        const g = box(len, thick, depth, j % 2 ? 'thatchDark' : 'thatch');
        const m = new THREE.Mesh(g, M[j % 2 ? 'thatchDark' : 'thatch']);
        m.position.set(cx, cy, 0);
        m.rotation.z = -s * ang;
        m.position.y += Math.sin(ang) * lip * 0.4;
        group.add(m);
      }
    }
    // ridge cap: a dark bundle along the ridge
    add(group, K.sweep([{ p: [0, rise + thick * 0.6, -depth / 2 - 0.1], rx: thick * 0.55, ry: thick * 0.4 }, { p: [0, rise + thick * 0.6, depth / 2 + 0.1], rx: thick * 0.55, ry: thick * 0.4 }], 6, { capStart: true, capEnd: true }), 'thatchDark', { rep: [1, depth / TILE.thatchDark] });
    return { group, slope, ang };
  }

  /** Flat triangular gable infill facing +z, base `w` at y0, apex at y0 + h. */
  function gable(parent, w, h, matName, { y = 0, z = 0, flip = false } = {}) {
    const g = K.plate([[-w / 2, 0], [w / 2, 0], [0, h]], 0.08);
    return add(parent, g, matName, { pos: [0, y, z], rot: [0, flip ? Math.PI : 0, 0] });
  }

  /** Crossed barge boards ending in carved horse heads, on a gable facing +z. */
  function horseHeads(parent, w, rise, { y = 0, z = 0 } = {}) {
    const half = w / 2;
    for (const s of [1, -1]) {
      beam(parent, [s * half, y, z], [-s * 0.32, y + rise + 0.75, z + 0.02], 0.14, 'planksDark');
      const head = K.sweep([{ p: [-s * 0.32, y + rise + 0.7, z], rx: 0.09 }, { p: [-s * 0.5, y + rise + 0.95, z + 0.05], rx: 0.1, ry: 0.13 }, { p: [-s * 0.75, y + rise + 0.9, z + 0.08], rx: 0.07, ry: 0.09 }, { p: [-s * 0.88, y + rise + 0.78, z + 0.1], rx: 0.03 }], 6, { capStart: true, capEnd: true });
      add(parent, head, 'planksDark');
    }
  }

  /** Team cloth hung from a lintel / pole: a hanging sheet. */
  function banner(parent, w, len, { pos = [0, 0, 0], rot = [0, 0, 0], sag = 0.05 } = {}) {
    return add(parent, K.sheet(w, len, { sag, wave: 0.03, taper: 0.05, rows: 4, cols: 3 }), 'team', { pos, rot, rep: [1, len / TILE.team] });
  }

  /** Antlered skull facing +z. */
  function skull(parent, x, y, z, sc = 1) {
    const s = new THREE.Group(); s.position.set(x, y, z); s.scale.setScalar(sc); parent.add(s);
    add(s, K.blob(0.16, 0.14, 0.2, 7, 4), 'bone', { rep: [1, 1] });
    add(s, K.sweep([{ p: [0, -0.06, 0.1], rx: 0.1, ry: 0.08 }, { p: [0, -0.12, 0.3], rx: 0.06, ry: 0.05 }], 6, { capEnd: true }), 'bone', { rep: [1, 1] });
    for (const k of [1, -1]) add(s, K.sweep([{ p: [k * 0.1, 0.1, -0.02], rx: 0.04 }, { p: [k * 0.35, 0.35, -0.1], rx: 0.03 }, { p: [k * 0.5, 0.65, 0.0], rx: 0.02 }, { p: [k * 0.55, 0.8, 0.1], rx: 0.005 }], 5, { capStart: true, capEnd: true }), 'bone', { rep: [1, 1] });
    for (const k of [1, -1]) add(s, K.sweep([{ p: [k * 0.35, 0.35, -0.1], rx: 0.025 }, { p: [k * 0.3, 0.6, -0.2], rx: 0.005 }], 4, { capEnd: true }), 'bone', { rep: [1, 1] });
    return s;
  }

  /** Ground and centre like the character kit. */
  function finish(g) {
    g.updateMatrixWorld(true);
    const bb = new THREE.Box3().setFromObject(g), c = bb.getCenter(V());
    g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= bb.min.y; o.position.z -= c.z; });
    return g;
  }

  return { ...K, M, TILE, tileUV, box, add, log, beam, stake, roof, gable, horseHeads, banner, skull, finish };
}
