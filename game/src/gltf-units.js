/**
 * Rigged GLB characters (built by tools/wc3 in Blender): one welded low-poly mesh, a skeleton,
 * sampled animation clips, and a vertex colour that carries baked ambient occlusion (r) and the
 * team-colour mask (g). The texture is still painted in code at load: game/skins/<name>.js
 * paints the same atlas the code-built asset did, onto the UV layout the recipe unwrapped.
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import { createPainter } from '../paint.js';
import { TEAM_COLOR } from './config.js';

let manifest = null;
export function glbList() {
  if (!manifest) manifest = fetch('./models/index.json').then((r) => (r.ok ? r.json() : [])).catch(() => []);
  return manifest;
}
export async function hasGlb(asset) { return (await glbList()).includes(asset); }

const templates = new Map();
const loader = new GLTFLoader();
function template(asset) {
  if (!templates.has(asset)) templates.set(asset, (async () => {
    const [gltf, meta, skin] = await Promise.all([
      loader.loadAsync(`./models/${asset}.glb`),
      fetch(`./models/${asset}.json`).then((r) => r.json()),
      import(`../skins/${asset}.js`),
    ]);
    const P = createPainter(THREE, meta.atlas, meta.seed);
    skin.default(P);
    const tex = P.texture();
    tex.flipY = false;                 // glTF UVs have their origin at the top-left, as the atlas does
    tex.needsUpdate = true;
    let mesh = null;
    gltf.scene.traverse((o) => { if (o.isSkinnedMesh) mesh = o; });
    if (!mesh) throw new Error(`${asset}.glb has no skinned mesh`);
    mesh.geometry.computeBoundingSphere();
    return { gltf, meta, tex, clips: gltf.animations, mats: new Map() };
  })());
  return templates.get(asset);
}

function materialFor(tpl, team) {
  if (tpl.mats.has(team)) return tpl.mats.get(team);
  const col = new THREE.Color(TEAM_COLOR[team] ?? 0x888888);
  const mat = new THREE.MeshStandardMaterial({ map: tpl.tex, vertexColors: true, roughness: 0.9, metalness: 0 });
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.teamColor = { value: col };
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', 'uniform vec3 teamColor;\n#include <common>')
      // r: baked occlusion, g: team mask over grey paint
      .replace('#include <color_fragment>', '#if defined( USE_COLOR_ALPHA ) || defined( USE_COLOR )\n\tdiffuseColor.rgb *= vColor.r;\n\tdiffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * teamColor, vColor.g);\n#endif');
  };
  mat.customProgramCacheKey = () => 'wc3-team';
  // the workshop clones materials for its surface modes; the hooks must survive that
  mat.clone = function () { const c = THREE.MeshStandardMaterial.prototype.clone.call(this); c.onBeforeCompile = this.onBeforeCompile; c.customProgramCacheKey = this.customProgramCacheKey; c.clone = this.clone; return c; };
  tpl.mats.set(team, mat);
  return mat;
}

/** makeGlbUnit(asset, team, height) -> the same shape makeUnitModel returns, plus mixer/actions */
export async function makeGlbUnit(asset, team, height) {
  const tpl = await template(asset);
  const inst = SkeletonUtils.clone(tpl.gltf.scene);
  const meshes = [];
  inst.traverse((o) => {
    if (o.isSkinnedMesh) { o.material = materialFor(tpl, team); o.castShadow = false; o.receiveShadow = true; o.frustumCulled = false; meshes.push(o); }
  });
  const sc = height / tpl.meta.height;
  inst.scale.setScalar(sc);
  inst.position.y = -tpl.meta.bottom * sc;
  const root = new THREE.Group();
  root.add(inst);
  const mixer = new THREE.AnimationMixer(inst);
  const actions = {};
  for (const c of tpl.clips) actions[c.name] = mixer.clipAction(c);
  const size = new THREE.Vector3(height * 0.4, height, height * 0.4);
  return { root, inst, joints: {}, rest: { __inst: { pos: inst.position.clone(), rot: inst.rotation.clone() } }, meshes, size, gltf: true, mixer, actions, meta: tpl.meta, cur: null, fidgetT: 3 + Math.random() * 6 };
}
