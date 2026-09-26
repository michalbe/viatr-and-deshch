/**
 * The land: heightfield, rivers, forests, path grid and fog-of-war colouring, all built from a
 * map definition (`game/maps/*.js`) by `loadMap()`. Everything here is Three.js code; the ground
 * uses the harness's procedural `ground` surface for its texture and a per-vertex colour for
 * biome and fog of war.
 *
 * The module keeps one loaded map at a time (a mission is one page load), so the cheap
 * accessors other modules import — `heightAt`, `blocked`, `cellOf` — stay plain functions.
 */
import * as THREE from 'three';
import { MAP, clamp } from './config.js';
import { surface } from '../surfaces.js';

/* ---------------------------------------------------------------- noise */
function hash(i, j) { let h = (i * 374761393 + j * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
function vnoise(x, z) {
  const i = Math.floor(x), j = Math.floor(z), fx = x - i, fz = z - j;
  const u = fx * fx * (3 - 2 * fx), v = fz * fz * (3 - 2 * fz);
  const a = hash(i, j), b = hash(i + 1, j), c = hash(i, j + 1), d = hash(i + 1, j + 1);
  return (a + (b - a) * u) * (1 - v) + (c + (d - c) * u) * v;
}
export function fbm(x, z, oct = 4) { let s = 0, a = 1, n = 0; for (let k = 0; k < oct; k++) { s += a * vnoise(x, z); n += a; a *= 0.5; x *= 2.03; z *= 2.03; } return s / n; }

/* ---------------------------------------------------------------- the loaded map */
let DEF = null;
let SEED = 0;
export const map = () => DEF;

function segDist(px, pz, ax, az, bx, bz) {
  const dx = bx - ax, dz = bz - az;
  const t = clamp(((px - ax) * dx + (pz - az) * dz) / (dx * dx + dz * dz), 0, 1);
  const x = ax + dx * t - px, z = az + dz * t - pz;
  return Math.sqrt(x * x + z * z);
}
/** distance to the nearest river centreline, and that river */
export function riverDist(x, z) {
  let d = 1e9;
  for (const r of DEF.rivers) for (let i = 0; i < r.pts.length - 1; i++) d = Math.min(d, segDist(x, z, r.pts[i][0], r.pts[i][1], r.pts[i + 1][0], r.pts[i + 1][1]));
  return d;
}
function riverAt(x, z) {
  let best = null, bd = 1e9;
  for (const r of DEF.rivers) for (let i = 0; i < r.pts.length - 1; i++) { const d = segDist(x, z, r.pts[i][0], r.pts[i][1], r.pts[i + 1][0], r.pts[i + 1][1]); if (d < bd) { bd = d; best = r; } }
  return [best, bd];
}
function fordNear(x, z) { for (const r of DEF.rivers) for (const [fx, fz] of r.fords || []) if ((x - fx) ** 2 + (z - fz) ** 2 < 6.5 * 6.5) return true; return false; }

/** Forest band helpers: signed distance across the band and position along it. */
let bandN = [1, -1], bandL = 1;
export const bandD = (x, z) => (x * bandN[0] + z * bandN[1]) / bandL;
export const bandT = (x, z) => (x * bandN[1] - z * bandN[0]) / bandL * -1;
let CLEAR_T = 0;

function inForest(x, z) {
  for (const f of DEF.forests) {
    if (f.kind === 'band') {
      const d = bandD(x, z), t = bandT(x, z);
      let inBand = Math.abs(d) < f.half + (fbm(t / 9, 3 + SEED) - 0.5) * 6;
      for (const g of f.gaps || []) if (Math.abs(t - g) < (f.gapWidth || 9)) inBand = false;
      if (f.corridor && DEF.clearing && Math.abs(t - CLEAR_T) < 3.2) inBand = false;   // the path through the clearing
      if (inBand) return f;
    } else if (f.kind === 'blob') {
      const d = Math.hypot(x - f.x, z - f.z);
      if (d < f.r + (fbm(x / 7 + 9, z / 7, 3) - 0.5) * f.r * 0.5) return f;
    } else if (f.kind === 'ring') {
      const d = Math.hypot(x - f.x, z - f.z);
      if (d > f.r0 && d < f.r1 + (fbm(x / 9, z / 9 + 5, 3) - 0.5) * 6) { let ok = true; for (const g of f.gaps || []) { const a = Math.atan2(z - f.z, x - f.x); let da = a - g; while (da > Math.PI) da -= 6.283; while (da < -Math.PI) da += 6.283; if (Math.abs(da) < (f.gapAngle || 0.25)) ok = false; } if (ok) return f; }
    }
  }
  return null;
}
function forestNear(x, z) {   // soft factor 0..1 for ground colouring
  for (const f of DEF.forests) {
    if (f.kind === 'band') { const bd = Math.abs(bandD(x, z)); if (bd < f.half + 3) return clamp((f.half + 3 - bd) / 6, 0, 0.85); }
    else if (f.kind === 'blob') { const d = Math.hypot(x - f.x, z - f.z); if (d < f.r + 3) return clamp((f.r + 3 - d) / 6, 0, 0.85); }
    else if (f.kind === 'ring') { const d = Math.hypot(x - f.x, z - f.z); if (d > f.r0 - 3 && d < f.r1 + 3) return 0.7; }
  }
  return 0;
}

let FLATS = [], KEEP_CLEAR = [], HILLS = [], PONDS = [];
function rawHeight(x, z) {
  const B = DEF.base;
  let h = B.level + (fbm(x / 38 + 11 + SEED, z / 38 + 7, 4) - 0.5) * B.macro + (fbm(x / 9 + SEED, z / 9, 2) - 0.5) * B.micro;
  for (const [hx, hz, hh, r] of HILLS) h += hh * Math.exp(-((x - hx) ** 2 + (z - hz) ** 2) / (r * r));
  for (const [cx, cz, cr, cd] of DEF.bowls || []) { const d = Math.hypot(x - cx, z - cz); if (d < cr) h -= cd * Math.pow(clamp(1 - d / cr, 0, 1), 1.5); }
  // rim of the valley rises beyond the playable edge
  const e = Math.max(Math.abs(x), Math.abs(z)) - MAP.half + 4;
  if (e > 0) h += e * 0.35;
  for (const [fx, fz, r, level] of FLATS) {
    const d = Math.hypot(x - fx, z - fz);
    if (d < r) { const t = Math.pow(clamp((r - d) / (r * 0.45), 0, 1), 2); const lv = level ?? B.level; h = h + (lv - h) * t; }
  }
  const [river, rd] = DEF.rivers.length ? riverAt(x, z) : [null, 1e9];
  if (river && rd < river.width) {
    const depth = fordNear(x, z) ? river.fordDepth : river.depth;
    const t = Math.pow(clamp(1 - rd / river.width, 0, 1), 1.6);
    h = h + (-depth - h) * t;
  }
  for (const [px, pz, r] of PONDS) { const d = Math.hypot(x - px, z - pz); if (d < r + 2.5) { const t = clamp(1 - (d - r) / 2.5, 0, 1); h = h + (-1.1 - h) * t; } }
  return h;
}

export const WATER_Y = -0.38;
export const WALK_MIN = -0.6;

/* ---------------------------------------------------------------- the ground */
const EXT = 130;                 // terrain extends past the map for a border
const STEP = 2;
const N = EXT * 2 / STEP;        // 130 segments
const VN = N + 1;
const H = new Float32Array(VN * VN);

/** Bilinear height, consistent with the mesh to a few centimetres. */
export function heightAt(x, z) {
  const fx = clamp((x + EXT) / STEP, 0, N - 0.0001), fz = clamp((z + EXT) / STEP, 0, N - 0.0001);
  const i = Math.floor(fx), j = Math.floor(fz), u = fx - i, v = fz - j;
  const a = H[j * VN + i], b = H[j * VN + i + 1], c = H[(j + 1) * VN + i], d = H[(j + 1) * VN + i + 1];
  return (a + (b - a) * u) * (1 - v) + (c + (d - c) * u) * v;
}
export const inMap = (x, z) => Math.abs(x) < MAP.half - 1 && Math.abs(z) < MAP.half - 1;

/**
 * Load a map definition: derived constants, then the heightfield. Call once, before anything
 * that asks for heights.
 */
export function loadMap(def) {
  DEF = def; SEED = def.seed || 0;
  const band = def.forests.find((f) => f.kind === 'band');
  if (band) { bandN = band.normal; bandL = Math.hypot(bandN[0], bandN[1]); }
  else { bandN = [1, -1]; bandL = Math.SQRT2; }
  CLEAR_T = def.clearing ? bandT(def.clearing[0], def.clearing[1]) : 1e9;
  HILLS = def.hills || []; PONDS = def.ponds || [];
  FLATS = [...(def.flats || [])];
  KEEP_CLEAR = [...(def.keepClear || [])];
  const level = def.base.level;
  const site = (p, r, lv) => { FLATS.push([p[0], p[1], r, lv]); KEEP_CLEAR.push([p[0], p[1], r + 3]); };
  if (def.player?.grod) site(def.player.grod, 27, level + 0.1);
  if (def.rival?.grod) site(def.rival.grod, 27, level + 0.2);
  for (const s of def.springs || []) site(s, 9, null);
  if (def.clearing) site(def.clearing, 13, level - 0.4);
  if (def.idol) { KEEP_CLEAR.push([def.idol[0], def.idol[1], 9]); }
  for (const m of def.mounds || []) { FLATS.push([m[0], m[1], 7, null]); KEEP_CLEAR.push([m[0], m[1], 8]); }
  for (const c of def.camps || []) site(c, 12, level);
  for (const s of def.sites || []) KEEP_CLEAR.push([s.x, s.z, (s.radius || 3) + 4]);
  for (let j = 0; j < VN; j++) for (let i = 0; i < VN; i++) H[j * VN + i] = rawHeight(-EXT + i * STEP, -EXT + j * STEP);
  staticBlock.fill(0); dynBlock.fill(0);
}

/* ---------------------------------------------------------------- vegetation layout */
function nearAny(x, z, pts, r) { for (const p of pts) if ((x - p[0]) ** 2 + (z - p[1]) ** 2 < r * r) return true; return false; }
function clearOf(x, z) { for (const [px, pz, r] of KEEP_CLEAR) if ((x - px) ** 2 + (z - pz) ** 2 < r * r) return false; return true; }

export function vegetation() {
  const pines = [], birches = [], rocks = [], reeds = [], grass = [];
  const density = DEF.density || 1;
  for (let gz = -EXT + 2; gz < EXT - 2; gz += 3.6) for (let gx = -EXT + 2; gx < EXT - 2; gx += 3.6) {
    const x = gx + (hash(gx * 7 | 0, gz * 3 | 0) - 0.5) * 2.6, z = gz + (hash(gx * 5 | 0, gz * 11 | 0) - 0.5) * 2.6;
    if (!clearOf(x, z) || riverDist(x, z) < 7.5 || nearAny(x, z, PONDS.map((p) => [p[0], p[1]]), 6)) continue;
    const h = heightAt(x, z);
    if (h < 0.1) continue;
    const r = hash(x * 13 | 0, z * 17 | 0);
    const outside = DEF.rim !== false && (!inMap(x, z) || Math.max(Math.abs(x), Math.abs(z)) > MAP.half - 7);
    const forest = inForest(x, z);
    const clump = fbm(x / 22 + 40 + SEED, z / 22 - 12, 3);
    const pineShare = forest?.pines ?? 0.82;
    if (outside) { if (r < 0.85) (r < 0.7 ? pines : birches).push([x, z, 0.85 + r * 0.5, r * 6.28]); continue; }
    if (forest) { if (r < 0.9 * density) (r < pineShare ? pines : birches).push([x, z, 0.8 + r * 0.55, r * 6.28]); continue; }
    if (clump > (DEF.clumps ?? 0.64) && r < 0.75 * density) { (r < 0.45 ? pines : birches).push([x, z, 0.75 + r * 0.5, r * 6.28]); continue; }
    if (r > 0.975) rocks.push([x, z, 0.7 + r * 0.5, r * 40]);
  }
  // reeds along the marsh and river banks
  const rb = DEF.reeds || { box: [-90, -90, 180, 180], n: 300 };
  for (let k = 0; k < rb.n; k++) {
    const x = rb.box[0] + hash(k, 1) * rb.box[2], z = rb.box[1] + hash(k, 2) * rb.box[3];
    const rd = riverDist(x, z);
    const pond = PONDS.some(([px, pz, pr]) => Math.abs(Math.hypot(x - px, z - pz) - pr - 1.8) < 1.2);
    if ((rd > 5.2 && rd < 7.8) || pond) if (heightAt(x, z) > -0.3) reeds.push([x, z, 0.7 + hash(k, 3) * 0.6, hash(k, 4) * 6.28]);
  }
  // grass tufts across the meadows
  for (let k = 0; k < 2600; k++) {
    const x = (hash(k, 7) - 0.5) * (MAP.size - 8), z = (hash(k, 8) - 0.5) * (MAP.size - 8);
    if (riverDist(x, z) < 6.5 || heightAt(x, z) < 0.05) continue;
    if (inForest(x, z)) continue;
    if (nearAny(x, z, [DEF.player?.grod, DEF.rival?.grod].filter(Boolean), 12)) continue;
    grass.push([x, z, 0.7 + hash(k, 9) * 0.8, hash(k, 10) * 6.28]);
  }
  return { pines, birches, rocks, reeds, grass };
}

/* ---------------------------------------------------------------- path grid */
export const G = MAP.size / MAP.cell;   // 90
export const cellOf = (x, z) => [clamp(Math.floor((x + MAP.half) / MAP.cell), 0, G - 1), clamp(Math.floor((z + MAP.half) / MAP.cell), 0, G - 1)];
export const cellCenter = (i, j) => [-MAP.half + (i + 0.5) * MAP.cell, -MAP.half + (j + 0.5) * MAP.cell];
export const staticBlock = new Uint8Array(G * G);    // water, trees, rocks, edge
export const dynBlock = new Uint8Array(G * G);       // buildings, root walls, floods (counted)
export const blocked = (i, j) => i < 0 || j < 0 || i >= G || j >= G || staticBlock[j * G + i] || dynBlock[j * G + i];
/** Block the cells within r of (x, z) dynamically; returns the cell list so it can be released. */
export function blockCircle(x, z, r) {
  const cells = [], [ci, cj] = cellOf(x, z), k = Math.ceil(r / MAP.cell);
  for (let j = cj - k; j <= cj + k; j++) for (let i = ci - k; i <= ci + k; i++) {
    if (i < 0 || j < 0 || i >= G || j >= G) continue;
    const [cx, cz] = cellCenter(i, j);
    if ((cx - x) ** 2 + (cz - z) ** 2 <= r * r + 0.6) { dynBlock[j * G + i]++; cells.push(j * G + i); }
  }
  return cells;
}
export function unblockCells(cells) { for (const k of cells) dynBlock[k] = Math.max(0, dynBlock[k] - 1); }
/** Cells inside a polygon or box region: [[x,z],...] (polygon) or {x, z, w, h}. */
export function regionCells(region) {
  const cells = [];
  const inside = Array.isArray(region) ? (x, z) => { let c = false; for (let i = 0, j = region.length - 1; i < region.length; j = i++) { const [xi, zi] = region[i], [xj, zj] = region[j]; if ((zi > z) !== (zj > z) && x < (xj - xi) * (z - zi) / (zj - zi) + xi) c = !c; } return c; }
    : (x, z) => Math.abs(x - region.x) <= region.w / 2 && Math.abs(z - region.z) <= region.h / 2;
  for (let j = 0; j < G; j++) for (let i = 0; i < G; i++) { const [x, z] = cellCenter(i, j); if (inside(x, z)) cells.push(j * G + i); }
  return cells;
}
export function blockCells(cells) { for (const k of cells) dynBlock[k]++; }

/** Water level for path blocking: cells whose ground is below `level` are impassable. */
let waterLevel = WALK_MIN;
export function setWalkLevel(level) {
  waterLevel = level;
  for (let j = 2; j < G - 2; j++) for (let i = 2; i < G - 2; i++) {
    const k = j * G + i; const [x, z] = cellCenter(i, j);
    const wet = heightAt(x, z) < waterLevel;
    if (wet) staticBlock[k] |= 2; else staticBlock[k] &= ~2;
  }
}

export function buildStaticGrid(veg) {
  for (let j = 0; j < G; j++) for (let i = 0; i < G; i++) {
    const [x, z] = cellCenter(i, j);
    if (i < 2 || j < 2 || i >= G - 2 || j >= G - 2) staticBlock[j * G + i] = 1;
    else if (heightAt(x, z) < WALK_MIN) staticBlock[j * G + i] = 2;
  }
  const mark = (x, z, r) => {
    const [ci, cj] = cellOf(x, z);
    const k = Math.ceil(r / MAP.cell);
    for (let j = cj - k; j <= cj + k; j++) for (let i = ci - k; i <= ci + k; i++) {
      if (i < 0 || j < 0 || i >= G || j >= G) continue;
      const [cx, cz] = cellCenter(i, j);
      if ((cx - x) ** 2 + (cz - z) ** 2 <= r * r + 0.6) staticBlock[j * G + i] |= 1;
    }
  };
  for (const [x, z] of veg.pines) mark(x, z, 0.9);
  for (const [x, z] of veg.birches) mark(x, z, 0.8);
  for (const [x, z, s] of veg.rocks) mark(x, z, 1.2 * s);
  if (DEF.idol) mark(DEF.idol[0], DEF.idol[1], 3.2);
  for (const s of DEF.sites || []) if (s.block) mark(s.x, s.z, s.block);
}

/* ---------------------------------------------------------------- meshes */
const C = (hex) => new THREE.Color(hex);
const COL = {
  meadow: C(0x5f7a34), grass: C(0x4e6a2c), forest: C(0x3a4a24), dirt: C(0x7a6440), mud: C(0x55462f), moss: C(0x465a26), ochre: C(0x7e7442), light: C(0x748a3c),
  rock: C(0x8e877a), clearing: C(0x5d8a4a), rim: C(0x5a6a3a), path: C(0xa08858), dry: C(0x8a7a48), ash: C(0x5a5a58),
};
export const baseColors = new Float32Array(VN * VN * 3);
export function buildTerrain(scene, tier) {
  const geo = new THREE.PlaneGeometry(EXT * 2, EXT * 2, N, N);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  const col = new Float32Array(pos.count * 3);
  const tmp = new THREE.Color();
  const palette = DEF.palette || {};
  const meadow = palette.meadow ? C(palette.meadow) : COL.meadow, grassC = palette.grass ? C(palette.grass) : COL.grass;
  for (let k = 0; k < pos.count; k++) {
    const x = pos.getX(k), z = pos.getZ(k);
    const i = Math.round((x + EXT) / STEP), j = Math.round((z + EXT) / STEP);
    const h = H[j * VN + i];
    pos.setY(k, h);
    // biome
    const n = fbm(x / 14 + SEED, z / 14, 3);
    tmp.copy(meadow).lerp(grassC, clamp(n * 1.6 - 0.5, 0, 1));
    // big painted patches, 20-40 m across: dark moss, warm ochre, lighter meadow
    const pa = fbm(x / 32 + 70, z / 32 - 30, 3), pb = fbm(x / 24 - 50, z / 24 + 11, 3);
    tmp.lerp(COL.moss, clamp((pa - 0.55) * 3.5, 0, 0.7));
    tmp.lerp(palette.dry ? COL.dry : COL.ochre, clamp((pb - 0.6) * 3.5, 0, 0.55));
    tmp.lerp(COL.light, clamp((0.38 - pa) * 3, 0, 0.45));
    const fn = forestNear(x, z);
    if (fn > 0) tmp.lerp(COL.forest, fn);
    const slope = Math.abs(rawHeight(x + 1, z) - rawHeight(x - 1, z)) + Math.abs(rawHeight(x, z + 1) - rawHeight(x, z - 1));
    if (h > 3) tmp.lerp(COL.rock, clamp((h - 3) / 5, 0, 0.6) + clamp(slope * 0.2, 0, 0.3));
    const rd = riverDist(x, z);
    if (rd < 8) tmp.lerp(COL.mud, clamp((8 - rd) / 4, 0, 0.9));
    for (const [px, pz, pr] of PONDS) { const d = Math.hypot(x - px, z - pz); if (d < pr + 4) tmp.lerp(COL.mud, clamp((pr + 4 - d) / 3, 0, 0.8)); }
    for (const g of [DEF.player?.grod, DEF.rival?.grod, ...(DEF.camps || [])].filter(Boolean)) {
      const d = Math.hypot(x - g[0], z - g[1]);
      if (d < 20) tmp.lerp(COL.dirt, clamp((20 - d) / 9, 0, 0.8) * (0.55 + 0.45 * fbm(x / 3, z / 3, 2)));
    }
    if (DEF.clearing) { const dc = Math.hypot(x - DEF.clearing[0], z - DEF.clearing[1]); if (dc < 12) tmp.lerp(COL.clearing, clamp((12 - dc) / 5, 0, 0.7)); }
    for (const m of DEF.mounds || []) { const d = Math.hypot(x - m[0], z - m[1]); if (d < 9) tmp.lerp(COL.ash, clamp((9 - d) / 5, 0, 0.6)); }
    if (!inMap(x, z)) tmp.lerp(COL.rim, 0.5);
    const shade = 0.9 + (fbm(x / 5 + 3, z / 5, 2) - 0.5) * 0.22;
    col[k * 3] = tmp.r * shade; col[k * 3 + 1] = tmp.g * shade; col[k * 3 + 2] = tmp.b * shade;
  }
  baseColors.set(col);
  geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(col), 3));
  // texture density: the ground recipe tiles every 2.6 m
  const uv = geo.attributes.uv;
  const rep = (EXT * 2) / 5.2;
  for (let k = 0; k < uv.count; k++) uv.setXY(k, uv.getX(k) * rep, uv.getY(k) * rep);
  geo.computeVertexNormals();
  const s = surface(THREE, 'ground', tier === 'phone' ? 256 : 512);
  const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, metalness: 0, map: s.map, roughnessMap: s.roughnessMap, normalMap: s.normalMap });
  mat.normalScale.set(0.7, 0.7);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.receiveShadow = true;
  mesh.name = 'terrain';
  scene.add(mesh);

  // water: one sheet at WATER_Y, coloured per vertex so it can be fogged too
  const wgeo = new THREE.PlaneGeometry(EXT * 2, EXT * 2, 65, 65);
  wgeo.rotateX(-Math.PI / 2);
  const wcol = new Float32Array(wgeo.attributes.position.count * 3).fill(1);
  wgeo.setAttribute('color', new THREE.BufferAttribute(wcol, 3));
  const wmat = new THREE.MeshStandardMaterial({ color: 0x2c6482, vertexColors: true, roughness: 0.08, metalness: 0.2, transparent: true, opacity: 0.9 });
  const water = new THREE.Mesh(wgeo, wmat);
  water.position.y = WATER_Y;
  water.name = 'water';
  scene.add(water);
  return { mesh, water };
}

/** trample the ground under and around a building: worn earth, painted into the base colours */
export function wearGround(terrain, x, z, r) {
  const p = terrain.mesh.geometry.attributes.position;
  const dirt = COL.dirt;
  for (let k = 0; k < p.count; k++) {
    const vx = p.getX(k), vz = p.getZ(k);
    const d = Math.hypot(vx - x, vz - z);
    if (d > r) continue;
    const t = clamp((r - d) / (r * 0.5), 0, 0.85) * (0.6 + 0.4 * fbm(vx / 2.5, vz / 2.5, 2));
    for (let c = 0; c < 3; c++) baseColors[k * 3 + c] += ([dirt.r, dirt.g, dirt.b][c] * 0.92 - baseColors[k * 3 + c]) * t;
  }
}
/** tint a region of ground (dark water, ash, snow): blend the base colours toward a colour */
export function tintGround(terrain, x, z, r, hex, k = 0.6) {
  const p = terrain.mesh.geometry.attributes.position, c = C(hex);
  for (let i = 0; i < p.count; i++) {
    const vx = p.getX(i), vz = p.getZ(i), d = Math.hypot(vx - x, vz - z);
    if (d > r) continue;
    const t = clamp((r - d) / (r * 0.6), 0, 1) * k;
    baseColors[i * 3] += (c.r - baseColors[i * 3]) * t; baseColors[i * 3 + 1] += (c.g - baseColors[i * 3 + 1]) * t; baseColors[i * 3 + 2] += (c.b - baseColors[i * 3 + 2]) * t;
  }
}

/**
 * Fog of war onto the ground and water colours. `vis` and `seen` are G x G grids.
 * Unexplored ground goes near black, explored-but-not-visible goes dim. `light` scales the
 * whole thing (night).
 */
let LIGHT = 1;
export function setGroundLight(l) { LIGHT = l; }
export function fogFactorAt(x, z, vis, seen) {
  if (!inMap(x, z)) return 0.28 * LIGHT;
  const [i, j] = cellOf(x, z);
  const k = j * G + i;
  return (vis[k] ? 1 : seen[k] ? 0.5 : 0.1) * LIGHT;
}
export function applyFog(terrain, vis, seen) {
  const c = terrain.mesh.geometry.attributes.color;
  const p = terrain.mesh.geometry.attributes.position;
  const a = c.array;
  // sample a smoothed factor: average the four cells around the vertex
  for (let k = 0; k < p.count; k++) {
    const x = p.getX(k), z = p.getZ(k);
    const f = (fogFactorAt(x - 1, z - 1, vis, seen) + fogFactorAt(x + 1, z - 1, vis, seen) + fogFactorAt(x - 1, z + 1, vis, seen) + fogFactorAt(x + 1, z + 1, vis, seen)) * 0.25;
    a[k * 3] = baseColors[k * 3] * f; a[k * 3 + 1] = baseColors[k * 3 + 1] * f; a[k * 3 + 2] = baseColors[k * 3 + 2] * f;
  }
  c.needsUpdate = true;
  const wc = terrain.water.geometry.attributes.color, wp = terrain.water.geometry.attributes.position;
  for (let k = 0; k < wp.count; k++) {
    const f = fogFactorAt(wp.getX(k), wp.getZ(k), vis, seen);
    wc.array[k * 3] = wc.array[k * 3 + 1] = wc.array[k * 3 + 2] = f;
  }
  wc.needsUpdate = true;
}
