import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { makeUnitModel, makeBuildingModel, makeProp } from './models.js';
import { UNITS, BUILDINGS } from './config.js';
import { animate } from './anim.js';

const ASSETS = {
  vitez: { unit: 'vitez', label: 'Vitez' },
  vietra: { unit: 'vietra', label: 'Vietra' },
  zherca: { unit: 'zherca', label: 'Zherca' },
  streletz: { unit: 'streletz', label: 'Streletz' },
  deer: { unit: 'deer', label: 'Jelenik (Deer Rider)' },
  bear: { unit: 'bear', label: 'Medved (Bear)' },
  spirit: { unit: 'spirit', label: 'Leshy' },
  leshonok: { unit: 'leshonok', label: 'Leshonok' },
  baba: { unit: 'baba', label: 'Baba' },
  upir: { unit: 'upir', label: 'Upir' },
  striga: { unit: 'striga', label: 'Striga' },
  grod: { building: 'grod', label: 'Grod' },
  khata: { building: 'khata', label: 'Khata' },
  warhall: { building: 'warhall', label: 'Zbroynia' },
  shrine: { building: 'shrine', label: 'Zdroy' },
  grove: { building: 'grove', label: 'Svety Gai' },
  stone_idol: { prop: 'stone_idol', label: 'Stone Idol', size: 8 },
  sacred_spring: { prop: 'sacred_spring', label: 'Sacred Spring', size: 4 },
  pine_tree: { prop: 'pine_tree', label: 'Pine Tree', size: 8 },
  birch_tree: { prop: 'birch_tree', label: 'Birch Tree', size: 7 },
  rock_cluster: { prop: 'rock_cluster', label: 'Rock Cluster', size: 2 },
  reeds: { prop: 'reeds', label: 'Reeds', size: 1.5 },
  grass_tuft: { prop: 'grass_tuft', label: 'Grass Tuft', size: 0.6 },
  founding_stake: { prop: 'founding_stake', label: 'Founding Stake', size: 1.8 },
  root_wall: { prop: 'root_wall', label: 'Root Wall', size: 2.5 },
  burial_mound: { prop: 'burial_mound', label: 'Burial Mound', size: 3 },
  corpse: { prop: 'corpse', label: 'Corpse', size: 0.5 },
};

const $ = (selector) => document.querySelector(selector);
const canvas = $('#viewport');
const characterSelect = $('#character');
const clanSelect = $('#clan');
const poseSelect = $('#pose');
const wireframeButton = $('#wireframe');
const rotateButton = $('#rotate');
const compareLabels = $('#compareLabels');
const stateLabel = $('#state');
const modelName = $('#modelName');
const modelDetail = $('#modelDetail');
const statTriangles = $('#triangles');
const statDraws = $('#draws');
const statMaterials = $('#materials');
const statMeshes = $('#meshes');

const cssColor = (token, fallback) => {
  const value = getComputedStyle(document.documentElement).getPropertyValue(`--color-${token}`).trim();
  return new THREE.Color(value || fallback);
};

const colors = {
  canvas: cssColor('canvas', '#2c262a'),
  panel: cssColor('panel', '#312b2f'),
  line: cssColor('line', '#3e373c'),
  bright: cssColor('bright', '#ece7ea'),
  accent: cssColor('accent', '#85aab3'),
};

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const scene = new THREE.Scene();
scene.background = colors.canvas;
scene.fog = new THREE.Fog(colors.canvas, 28, 65);

const camera = new THREE.PerspectiveCamera(32, 1, 0.03, 160);
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.075;
controls.screenSpacePanning = true;
controls.minDistance = 0.3;
controls.maxDistance = 70;

scene.add(new THREE.HemisphereLight(colors.bright, new THREE.Color(0x8a6e52), 1.4));   // warm ground bounce, like the game rig: undersides never go black
const keyLight = new THREE.DirectionalLight(colors.bright, 2.4);
keyLight.position.set(5, 8, 7);
scene.add(keyLight);
const rimLight = new THREE.DirectionalLight(colors.accent, 1.4);
rimLight.position.set(-5, 4, -6);
scene.add(rimLight);

const floorMaterial = new THREE.MeshStandardMaterial({ color: colors.panel, roughness: 0.94, metalness: 0 });
const floor = new THREE.Mesh(new THREE.CircleGeometry(18, 96), floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -0.015;
floor.receiveShadow = true;
scene.add(floor);

const grid = new THREE.GridHelper(24, 24, colors.line, colors.line);
grid.position.y = 0.002;
if (Array.isArray(grid.material)) {
  for (const material of grid.material) { material.transparent = true; material.opacity = 0.34; }
} else {
  grid.material.transparent = true;
  grid.material.opacity = 0.34;
}
scene.add(grid);

const clayColor = new THREE.Color(0xb9ada0);
const stage = new THREE.Group();
scene.add(stage);

let entries = [];
let selectedAsset = 'vitez';
let selectedSurface = 'painted';
let selectedView = 'front';
let wireframe = false;
let autoRotate = false;
let loadVersion = 0;
let lastStatsUpdate = 0;

function unitDefinition(assetKey) {
  const a = ASSETS[assetKey];
  if (a.unit) return UNITS[a.unit];
  if (a.building) { const b = BUILDINGS[a.building]; return { title: `${b.title} · ${b.size} x ${b.size} m footprint`, height: b.height, asset: b.asset, isStatic: true }; }
  return { title: 'Prop', height: a.size, asset: a.prop, isStatic: true };
}

/** Wrap a static Group the way makeUnitModel wraps a unit, so the viewer code has one shape. */
function staticModel(root) {
  const meshes = [];
  root.traverse((o) => { if (o.isMesh) meshes.push(o); });
  return { root, inst: root, joints: {}, rest: { __inst: { pos: root.position.clone(), rot: root.rotation.clone() } }, meshes };
}

function cloneDisplayMaterials(model) {
  for (const mesh of model.meshes) {
    const source = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    const clones = source.map((material) => {
      const clone = material.clone();
      clone.userData.workshopColor = clone.color?.clone();
      clone.userData.workshopMap = clone.map;
      return clone;
    });
    mesh.material = Array.isArray(mesh.material) ? clones : clones[0];
  }
}

function eachMaterial(model, callback) {
  for (const mesh of model.meshes) {
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const material of materials) callback(material, mesh);
  }
}

function setSurface(model, painted) {
  eachMaterial(model, (material, mesh) => {
    // clay: same geometry, no atlas, no vertex colours, one warm grey, so the silhouette and
    // the loft topology can be judged on their own
    material.vertexColors = painted && !!mesh.geometry.attributes.color;
    material.map = painted ? material.userData.workshopMap : null;
    if (material.color) material.color.copy(painted ? material.userData.workshopColor : clayColor);
    material.needsUpdate = true;
  });
}

function setWireframe(model) {
  eachMaterial(model, (material) => {
    material.wireframe = wireframe;
    material.needsUpdate = true;
  });
}

function resetPose(entry) {
  const { model } = entry;
  for (const [name, rest] of Object.entries(model.rest)) {
    if (name === '__inst') continue;
    const joint = model.joints[name];
    if (!joint) continue;
    joint.rotation.copy(rest.rot);
    joint.position.copy(rest.pos);
  }
  model.inst.position.copy(model.rest.__inst.pos);
  model.inst.rotation.copy(model.rest.__inst.rot);
}

function makeRuntime(model, assetKey, index) {
  const def = unitDefinition(assetKey);
  return {
    model,
    def,
    ut: ASSETS[assetKey].unit,
    id: index + 0.37,
    speedNow: def.speed,
    anim: { t: 0, phase: 0, mode: poseSelect.value, aiming: false, attackT: 0, attackDur: Math.max(0.55, def.cd) },
  };
}

function clearStage() {
  for (const entry of entries) {
    stage.remove(entry.holder);
    eachMaterial(entry.model, (material) => material.dispose());
  }
  entries = [];
}

function setLoading(message) {
  stateLabel.textContent = message;
  stateLabel.className = '';
}

function setReady(message = 'Ready') {
  stateLabel.textContent = message;
  stateLabel.className = 'ready';
}

function setError(error) {
  console.error(error);
  stateLabel.textContent = `Could not load: ${error?.message || error}`;
  stateLabel.className = 'error';
}

function normalizeEntry(entry) {
  entry.holder.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(entry.holder);
  const center = box.getCenter(new THREE.Vector3());
  entry.model.root.position.x -= center.x;
  entry.model.root.position.z -= center.z;
  entry.model.root.position.y -= box.min.y;
  entry.holder.updateMatrixWorld(true);
}

async function createEntry(assetKey, team, index) {
  const def = unitDefinition(assetKey);
  const a = ASSETS[assetKey];
  const model = a.unit ? await makeUnitModel(def.asset, team, def.height)
    : a.building ? staticModel(await makeBuildingModel(def.asset, team))
    : staticModel(await makeProp(def.asset));
  cloneDisplayMaterials(model);
  const holder = new THREE.Group();
  holder.add(model.root);
  const entry = { holder, model, runtime: a.unit ? makeRuntime(model, assetKey, index) : null };
  normalizeEntry(entry);
  return entry;
}

function layoutEntries() {
  if (!entries.length) return;
  for (const entry of entries) entry.holder.position.x = 0;
  if (entries.length === 2) {
    const widths = entries.map((entry) => new THREE.Box3().setFromObject(entry.holder).getSize(new THREE.Vector3()).x);
    const separation = Math.max(1.2, (widths[0] + widths[1]) * 0.66);
    entries[0].holder.position.x = -separation * 0.5;
    entries[1].holder.position.x = separation * 0.5;
  }
  stage.updateMatrixWorld(true);
}

function applyDisplayMode() {
  entries.forEach((entry, index) => {
    const painted = selectedSurface === 'painted' || (selectedSurface === 'compare' && index === 0);
    setSurface(entry.model, painted);
    setWireframe(entry.model);
  });
  compareLabels.classList.toggle('on', selectedSurface === 'compare');
  showAtlas();
}

/** The painted atlas of the current model, drawn into the sidebar so the texture can be judged flat. */
function showAtlas() {
  const atlas = $('#atlas'), img = atlas.querySelector('canvas');
  let source = null;
  for (const entry of entries) eachMaterial(entry.model, (m) => { if (!source && m.userData.workshopMap?.image) source = m.userData.workshopMap.image; });
  atlas.classList.toggle('on', !!source);
  if (!source) return;
  img.width = source.width; img.height = source.height;
  const ctx = img.getContext('2d'); ctx.clearRect(0, 0, img.width, img.height); ctx.drawImage(source, 0, 0);
}

function contentBounds() {
  const box = new THREE.Box3();
  for (const entry of entries) box.expandByObject(entry.holder);
  return box;
}

function frameView(view = selectedView) {
  if (!entries.length) return;
  selectedView = view;
  document.querySelectorAll('[data-view]').forEach((button) => button.classList.toggle('active', button.dataset.view === view));

  const box = contentBounds();
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const face = view === 'face';
  if (face) center.y = box.min.y + size.y * 0.78;

  const framedHeight = face ? Math.max(size.y * 0.38, size.x * 0.32) : size.y;
  const framedWidth = face ? Math.max(size.x * 0.58, framedHeight * 0.7) : size.x;
  const verticalFov = THREE.MathUtils.degToRad(camera.fov);
  const distanceY = framedHeight * 0.58 / Math.tan(verticalFov * 0.5);
  const distanceX = framedWidth * 0.58 / (Math.tan(verticalFov * 0.5) * camera.aspect);
  const distance = Math.max(distanceX, distanceY, 0.8) * (view === 'rts' ? 1.18 : 1.12);

  const directions = {
    front: new THREE.Vector3(0, 0.05, 1),
    side: new THREE.Vector3(1, 0.05, 0),
    back: new THREE.Vector3(0, 0.05, -1),
    face: new THREE.Vector3(0, 0.02, 1),
    rts: new THREE.Vector3(0.9, 0.88, 1),
  };
  camera.position.copy(center).add(directions[view].normalize().multiplyScalar(distance));
  camera.near = Math.max(0.02, distance / 100);
  camera.far = Math.max(80, distance * 20);
  camera.updateProjectionMatrix();
  controls.target.copy(center);
  controls.minDistance = Math.max(0.2, distance * 0.16);
  controls.maxDistance = Math.max(12, distance * 5);
  controls.update();
}

async function loadSelection() {
  const version = ++loadVersion;
  const assetKey = characterSelect.value;
  const team = Number(clanSelect.value);
  const def = unitDefinition(assetKey);
  selectedAsset = assetKey;
  setLoading(`Loading ${ASSETS[assetKey].label}…`);
  modelName.textContent = ASSETS[assetKey].label;
  modelDetail.textContent = def.isStatic ? def.title : `${def.title} · ${def.height.toFixed(2)} m display height`;

  try {
    const count = selectedSurface === 'compare' ? 2 : 1;
    const loaded = await Promise.all(Array.from({ length: count }, (_, index) => createEntry(assetKey, team, index)));
    if (version !== loadVersion) {
      for (const entry of loaded) eachMaterial(entry.model, (material) => material.dispose());
      return;
    }
    clearStage();
    entries = loaded;
    for (const entry of entries) stage.add(entry.holder);
    layoutEntries();
    applyDisplayMode();
    frameView(selectedView);
    setReady(`${ASSETS[assetKey].label} ready`);
  } catch (error) {
    if (version === loadVersion) setError(error);
  }
}

function setSurfaceMode(mode) {
  const needsReload = (selectedSurface === 'compare') !== (mode === 'compare');
  selectedSurface = mode;
  document.querySelectorAll('#surface button').forEach((button) => button.classList.toggle('active', button.dataset.value === mode));
  if (needsReload) loadSelection();
  else applyDisplayMode();
}

function updatePoseMode() {
  for (const entry of entries) {
    if (!entry.runtime) continue;
    resetPose(entry);
    entry.runtime.anim = {
      t: 0,
      phase: 0,
      mode: poseSelect.value,
      aiming: false,
      attackT: 0,
      attackDur: Math.max(0.55, entry.runtime.def.cd),
    };
  }
}

function updateStats(now) {
  if (now - lastStatsUpdate < 120) return;
  lastStatsUpdate = now;
  const materials = new Set();
  let meshes = 0;
  for (const entry of entries) {
    for (const mesh of entry.model.meshes) {
      meshes += 1;
      const list = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const material of list) materials.add(material);
    }
  }
  statTriangles.textContent = renderer.info.render.triangles.toLocaleString();
  statDraws.textContent = renderer.info.render.calls.toLocaleString();
  statMaterials.textContent = materials.size.toLocaleString();
  statMeshes.textContent = meshes.toLocaleString();
}

function resize() {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  if (!width || !height) return;
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

characterSelect.addEventListener('change', loadSelection);
clanSelect.addEventListener('change', loadSelection);
poseSelect.addEventListener('change', updatePoseMode);
$('#surface').addEventListener('click', (event) => {
  const button = event.target.closest('button[data-value]');
  if (button) setSurfaceMode(button.dataset.value);
});
$('#views').addEventListener('click', (event) => {
  const button = event.target.closest('button[data-view]');
  if (button) frameView(button.dataset.view);
});
wireframeButton.addEventListener('click', () => {
  wireframe = !wireframe;
  wireframeButton.classList.toggle('active', wireframe);
  applyDisplayMode();
});
rotateButton.addEventListener('click', () => {
  autoRotate = !autoRotate;
  rotateButton.classList.toggle('active', autoRotate);
});
window.addEventListener('resize', () => { resize(); frameView(selectedView); });
canvas.addEventListener('webglcontextlost', (event) => {
  event.preventDefault();
  setError(new Error('WebGL context lost'));
});

const clock = new THREE.Clock();
// A hidden tab gets no animation frames; keep a slow heartbeat so screenshots and remote checks still see fresh frames.
setInterval(() => { if (document.hidden) tick(performance.now()); }, 500);
renderer.setAnimationLoop(tick);
function tick(now) {
  resize();
  const dt = Math.min(clock.getDelta(), 0.05);
  const pose = poseSelect.value;
  for (const entry of entries) {
    if (!entry.runtime) continue;
    if (pose === 'rest') resetPose(entry);
    else {
      entry.runtime.anim.mode = pose;
      if (pose === 'attack' && entry.runtime.anim.attackT >= entry.runtime.anim.attackDur) entry.runtime.anim.attackT = 0;
      animate(entry.runtime, dt);
    }
  }
  if (autoRotate) stage.rotation.y += dt * 0.42;
  controls.update();
  renderer.render(scene, camera);
  updateStats(now);
}

loadSelection();
window.__WORKSHOP__ = { entries: () => entries, scene, THREE };
