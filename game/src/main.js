/**
 * Wind & Rain — boot, the campaign shell (title, missions, checkpoints, pause, stage screens),
 * the world build, the frame loop, and the jam telemetry contract.
 *
 * One page load is one mission (or one skirmish): choosing a mission on the title screen builds
 * that mission's map; restarting or continuing reloads the page with the right query.
 */
import * as THREE from 'three';
import { createRig } from '../rig.js';
import { setSurfaceDefaults } from '../surfaces.js';
import { preloadAssets } from '../assetlib.js';
import { UNITS, BUILDINGS, TEAM, MAP } from './config.js';
import { loadMap, map, buildTerrain, vegetation, buildStaticGrid, heightAt, applyFog, fogFactorAt, wearGround, blockCircle, bandT } from './terrain.js';
import { makeUnitModel, makeBuildingModel, makeProp, instanced, portrait } from './models.js';
import { Game } from './game.js';
import { RivalAI, setupMatch } from './ai.js';
import { FX } from './fx.js';
import { Construction } from './construction.js';
import { UI } from './ui.js';
import { initAudio, resumeAudio, updateAudio, sfx } from './audio.js';
import { Dialogue } from './dialogue.js';
import { MissionRuntime } from './mission-runtime.js';
import { Systems } from './systems.js';
import { MISSIONS, missionById, nextMission } from '../missions/index.js';
import { loadCampaign, newCampaign, campaign, difficulty, DIFFICULTY, DOLA, chooseDola, completeMission, checkpointFor, clearCheckpoint } from './campaign.js';

const $ = (id) => document.getElementById(id);
const bar = $('barf'), msg = $('loadmsg');
const step = (f, m) => { bar.style.width = (f * 100).toFixed(0) + '%'; msg.textContent = m; };
window.__GAME__ = { pos: [0, 0], fps: 0, speed: 0, score: 0, over: false, draws: 0, tris: 0 };
const Q = new URLSearchParams(location.search);

const canvas = $('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setSize(innerWidth, innerHeight, false);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, innerWidth / innerHeight, 2, 500);
const rig = createRig(THREE, renderer, scene, { hour: 12.5, elevation: 60, azimuth: 215, tier: 'auto', fogStart: 90, bloomStrength: 0.16, exposure: 0.58, fill: 1.8, bounceFlat: 5 });
const phone = rig.tier.name === 'phone';
setSurfaceDefaults({ size: phone ? 256 : 512 });

let game, ui, ai, fx, rt = null, dialogue = null, systems = null, veg = {}, props = [], started = false, session = null, mission = null;
const SPEED = Math.max(1, Math.min(20, +(Q.get('speed') || 1)));

/* ---------------------------------------------------------------- title */
function goto(query) { location.href = location.pathname + query + (Q.has('bg') ? (query ? '&' : '?') + 'bg=1' : ''); }
function title() {
  const c = loadCampaign();
  const menu = $('menu'); menu.innerHTML = '';
  const btn = (label, act, cls = '') => { const b = document.createElement('button'); b.className = 'btn frame pe ' + cls; b.textContent = label; b.addEventListener('click', act); menu.appendChild(b); return b; };
  const note = (t) => { const d = document.createElement('div'); d.className = 'note'; d.textContent = t; menu.appendChild(d); };
  const main = () => {
    menu.innerHTML = '';
    if (c) { const m = missionById(c.mission); btn(`Continue — ${m ? `Mission ${m.n}: ${m.title}` : 'the campaign'}`, () => goto(`?mission=${c.mission}${c.checkpoint?.mission === c.mission ? '&checkpoint=1' : ''}`)); }
    btn('New Campaign', () => pickDifficulty());
    if (c) btn('Missions', () => missions());
    btn('Skirmish — The Sacred Valley', () => goto('?skirmish=1'));
    note(c ? `${DIFFICULTY[c.difficulty]?.name || 'Standard'} difficulty · ${Object.keys(c.done).length} of ${MISSIONS.length} missions done` : 'A campaign of five missions, each with a rule the valley has never shown you.');
  };
  const pickDifficulty = () => {
    menu.innerHTML = '';
    const d = document.createElement('div'); d.className = 'note'; d.textContent = 'How hard should the valley be?'; menu.appendChild(d);
    for (const [id, df] of Object.entries(DIFFICULTY)) { const b = btn(df.name, () => { newCampaign(id); goto('?mission=m01'); }); b.title = df.tip; }
    note(Object.values(DIFFICULTY).map((d) => `${d.name}: ${d.tip}`).join(' '));
    btn('Back', main);
  };
  const missions = () => {
    menu.innerHTML = '';
    const box = document.createElement('div'); box.className = 'missions'; menu.appendChild(box);
    for (const m of MISSIONS) {
      const un = c.unlocked.includes(m.id) || Q.has('all');
      const b = document.createElement('button'); b.className = 'btn frame pe' + (un ? '' : ' dim');
      b.innerHTML = `Mission ${m.n}: ${m.title}<small>${c.done[m.id] ? 'done' : un ? '' : 'locked'}</small>`;
      b.addEventListener('click', () => goto(`?mission=${m.id}`)); box.appendChild(b);
    }
    btn('Back', main);
  };
  main();
  $('load').style.display = 'none';
  $('start').classList.add('on');
}

/* ---------------------------------------------------------------- the world */
async function boot() {
  const missionId = Q.get('mission');
  if (!missionId && !Q.has('skirmish')) return title();
  session = missionId ? { kind: 'mission', id: missionId } : { kind: 'skirmish' };
  if (session.kind === 'mission') {
    if (!loadCampaign()) newCampaign(Q.get('difficulty') || 'standard');
    const entry = missionById(session.id);
    if (!entry) return title();
    mission = (await entry.load()).default;
    mission.entry = entry;
  }
  step(0.05, 'shaping the valley');
  const mapId = Q.get('map') || (mission ? mission.map : 'sacred_valley');
  loadMap((await import(`../maps/${mapId}.js`)).default);
  const terrain = buildTerrain(scene, rig.tier.name);
  const layout = vegetation();
  buildStaticGrid(layout);
  await new Promise((r) => setTimeout(r, 0));

  step(0.15, 'reading the asset modules');
  const names = ['vietra', 'zherca', 'streletz', 'vitez', 'deer_rider', 'bear', 'forest_spirit', 'grod', 'khata', 'war_hall', 'rain_shrine', 'sacred_grove', 'pine_tree', 'birch_tree', 'rock_cluster', 'sacred_spring', 'reeds', 'stone_idol', 'grass_tuft', 'founding_stake', 'root_wall', 'leshonok', ...(mission?.assets || [])];
  await preloadAssets(names.map((n) => `./assets/${n}.js`));

  step(0.3, 'planting the forest');
  const S = phone ? 256 : 512;
  veg.pines = await instanced('pine_tree', layout.pines, heightAt, { surfSize: S });
  veg.birches = await instanced('birch_tree', layout.birches, heightAt, { surfSize: S });
  veg.rocks = await instanced('rock_cluster', layout.rocks, heightAt, { surfSize: S });
  veg.reeds = await instanced('reeds', layout.reeds, heightAt, { shadow: false, surfaces: false });
  veg.grass = await instanced('grass_tuft', layout.grass, heightAt, { shadow: false, surfaces: false, tile: 24 });
  veg.pines.bright = 1.1; veg.birches.bright = 1.0;
  for (const v of Object.values(veg)) scene.add(v.group);

  step(0.45, 'finding the sacred springs');
  fx = new FX(scene, camera);
  game = new Game(scene, fx);
  game.cons = new Construction(scene, fx);
  game.terrain = terrain;
  for (const s of game.springs) {
    const p = await makeProp('sacred_spring', S);
    p.position.set(s.x, heightAt(s.x, s.z) - 0.05, s.z); scene.add(p); s.prop = p; props.push({ obj: p, x: s.x, z: s.z });
  }
  const M = map();
  if (M.idol) {
    const idol = await makeProp('stone_idol', S);
    idol.position.set(M.idol[0], heightAt(...M.idol) - 0.2, M.idol[1]); idol.rotation.y = 0.5;
    scene.add(idol); props.push({ obj: idol, x: M.idol[0], z: M.idol[1], idol: true });
    game.addSite({ st: 'idol', name: 'Old Idol', title: 'Four faces on the hill', x: M.idol[0], z: M.idol[1], radius: 3.6, state: 'sleeping', prop: idol });
  }
  // the forest closes the path through the Leshy's clearing with roots at both ends; the Leshy withdraws them when appeased
  const ct = M.clearing ? bandT(M.clearing[0], M.clearing[1]) : 0;
  for (const d of M.clearing && M.forests.some((f) => f.kind === 'band' && f.corridor) ? [-12, 12] : []) {
    const x = (ct + d) / Math.SQRT2, z = (ct - d) / Math.SQRT2;
    const wall = await makeProp('root_wall', S);
    wall.position.set(x, heightAt(x, z) - 0.1, z); wall.rotation.y = -Math.PI / 4;
    scene.add(wall); props.push({ obj: wall, x, z });
    game.walls.push({ x, z, prop: wall, cells: blockCircle(x, z, 3.6), open: false });
  }
  systems = new Systems({ scene, game, fx, rig, terrain, props, makeProp: (n) => makeProp(n, S) });
  game.systems = systems;
  if (mission?.world) await mission.world({ game, systems, scene, props, makeProp: (n) => makeProp(n, S), heightAt, map: M });

  step(0.55, 'carving the clans');
  const jobs = [];
  for (const team of [0, 1]) {
    for (const ut of Object.keys(UNITS)) if (UNITS[ut].kind !== 'spirit' && UNITS[ut].kind !== 'nav') jobs.push(makeUnitModel(UNITS[ut].asset, team, UNITS[ut].height));
    for (const bt of Object.keys(BUILDINGS)) jobs.push(makeBuildingModel(BUILDINGS[bt].asset, team, S));
  }
  for (const ut of Object.keys(UNITS)) if (UNITS[ut].kind === 'spirit' || UNITS[ut].kind === 'nav') jobs.push(makeUnitModel(UNITS[ut].asset, TEAM.NEUTRAL, UNITS[ut].height));
  await Promise.all(jobs);

  step(0.75, 'painting portraits');
  const portraits = {};
  for (const ut of Object.keys(UNITS)) {
    const m = await makeUnitModel(UNITS[ut].asset, UNITS[ut].kind === 'spirit' || UNITS[ut].kind === 'nav' ? TEAM.NEUTRAL : 0, UNITS[ut].height);
    portraits[ut] = portrait(renderer, m.root, { yaw: 0.45, zoom: ut === 'deer' ? 1.3 : ut === 'spirit' ? 1.6 : 2.4, focusY: ut === 'bear' ? 0.6 : ut === 'deer' ? 0.72 : 0.84 });
  }
  for (const bt of Object.keys(BUILDINGS)) portraits[bt] = portrait(renderer, await makeBuildingModel(BUILDINGS[bt].asset, 0, S), { yaw: 0.6, zoom: 1.05, focusY: 0.5 });

  step(0.85, 'raising the settlements');
  ai = new RivalAI(game);
  ai.diff = difficulty();
  ui = new UI(game, camera, canvas, portraits);
  ui.treeDots = [...layout.pines, ...layout.birches].filter((_, i) => i % 2 === 0);
  ui.onResize = () => { renderer.setSize(innerWidth, innerHeight, false); rig.resize(innerWidth, innerHeight); };
  ui.onMenu = () => togglePause();
  const worn = (b) => wearGround(terrain, b.x, b.z, b.def.size * 0.95 + 3);
  game.on('placed', (b) => { worn(b); applyFog(terrain, game.vis, game.seen); });
  game.on('fog', () => fogVisuals());
  dialogue = new Dialogue(renderer);

  let restoreData = null;
  if (session.kind === 'mission') {
    rt = new MissionRuntime({ game, ui, ai, fx, rig, scene, dialogue, def: mission, systems, onEnd: (r, summary) => endMission(r, summary) });
    ui.rt = rt;
    const cp = Q.has('checkpoint') ? checkpointFor(mission.id) : null;
    if (cp) { restoreData = cp.data; await game.restore(cp.data.game); if (cp.data.systems) systems.restore(cp.data.systems); }
  } else {
    await setupMatch(game);
  }
  for (const b of game.buildings) worn(b);
  game.updateFog(); fogVisuals();
  ui.updateCamera(0);
  rig.refresh();

  step(1, 'ready');
  renderer.compile(scene, camera);
  await rig.ready.catch(() => {});
  $('load').style.display = 'none';
  window.__READY__ = true;
  window.__DBG__ = { game, ui, camera, rig, renderer, rt, ai, systems, dialogue };
  if (session.kind === 'mission') intro(restoreData);
  else { $('startSub').textContent = 'Skirmish · The Sacred Valley'; $('menu').innerHTML = ''; const b = document.createElement('button'); b.className = 'btn frame pe'; b.textContent = 'Begin the Rite'; b.addEventListener('click', () => start()); $('menu').appendChild(b); $('start').classList.add('on'); }
}

function fogVisuals() {
  applyFog(game.terrain, game.vis, game.seen);
  const c = new THREE.Color();
  for (const v of Object.values(veg)) for (const ch of v.chunks) {
    let changed = false;
    ch.placements.forEach(([x, z], i) => {
      const f = fogFactorAt(x, z, game.vis, game.seen);
      const want = (f < 0.2 ? 0.16 : f < 0.9 ? 0.55 : 1) * (v.bright || 1);
      if (ch.last?.[i] === want) return;
      (ch.last ||= [])[i] = want; changed = true;
      c.setScalar(want);
      for (const m of ch.meshes) m.setColorAt(i, c);
    });
    if (changed) for (const m of ch.meshes) m.instanceColor.needsUpdate = true;
  }
  for (const p of props) p.obj.visible = (p.always || game.cellSeen(p.x, p.z)) && !(p.obj === game.springs.find((s) => s.prop === p.obj)?.prop && game.springs.find((s) => s.prop === p.obj)?.shrine);
}

/* ---------------------------------------------------------------- stage screens */
async function stage({ kicker, title, lines = [], stats = [], speaker = 'zherca', dola = null, buttons = [] }) {
  $('stageKicker').textContent = kicker; $('stageTitle').textContent = title;
  $('stageText').innerHTML = lines.map((l) => Array.isArray(l) ? `<div class="line"><b>${l[0]}</b> — ${l[1]}</div>` : `<div class="line">${l}</div>`).join('');
  $('stageStats').innerHTML = stats.map(([k, v]) => `${k} <b>${v}</b>`).join(' · ');
  const dolaBox = $('stageDola'); dolaBox.innerHTML = '';
  let chosen = null;
  if (dola) for (const id of dola) {
    const d = DOLA[id]; const b = document.createElement('button'); b.className = 'dola frame pe';
    b.innerHTML = `<b>${d.name}</b><i>${d.line}</i><span>${d.text}</span>`;
    b.addEventListener('click', () => { chosen = id; for (const o of dolaBox.children) o.classList.toggle('on', o === b); for (const x of $('stageBtns').children) x.classList.remove('dim'); });
    dolaBox.appendChild(b);
  }
  const bb = $('stageBtns'); bb.innerHTML = '';
  for (const [label, act, needsDola] of buttons) { const b = document.createElement('button'); b.className = 'btn frame pe' + (needsDola && dola ? ' dim' : ''); b.textContent = label; b.addEventListener('click', () => { if (needsDola && dola && !chosen) return; act(chosen); }); bb.appendChild(b); }
  $('stagePortrait').style.backgroundImage = '';
  $('stage').classList.add('on');
  if (dialogue && mission?.speakers?.some((s) => s.id === speaker)) { dialogue.defineSpeakers(mission.speakers); const url = await dialogue.portraitFor(speaker, 320); $('stagePortrait').style.backgroundImage = url ? `url(${url})` : ''; }
}
function intro(restoreData) {
  const m = mission;
  stage({ kicker: `Mission ${m.entry.n}${restoreData ? ' · from the checkpoint' : ''}`, title: m.title, lines: [m.entry.premise], speaker: m.introSpeaker || 'zherca',
    buttons: [['Begin the Rite', () => { $('stage').classList.remove('on'); start(restoreData); }]] });
}
function endMission(result, summary) {
  const m = mission, next = nextMission(m.id);
  const t = game.teams[0], s = Math.floor(game.time);
  const stats = [['Time', `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`], ['Rodina lost', t.lost], ['Enemies slain', game.stats.kills], ['Wind gathered', Math.floor(t.windTotal)], ['Rain gathered', Math.floor(t.rainTotal)]];
  const lines = result === 'victory' ? [...(m.summary ? m.summary(rt, summary) : []), summary.closing || ''] : [summary.reason || 'The Rodina is scattered.'];
  if (result === 'victory') completeMission(m.id, { ...summary, time: s, lost: t.lost }, next?.id);
  const buttons = result === 'victory'
    ? [[next ? `Continue — Mission ${next.n}: ${next.title}` : 'The pitch ends here — back to the title', (chosen) => { if (chosen) chooseDola(chosen); goto(next ? `?mission=${next.id}` : ''); }, true], ['Title', () => goto('')]]
    : [['Restart from checkpoint', () => goto(`?mission=${m.id}&checkpoint=1`)], ['Restart mission', () => { clearCheckpoint(); goto(`?mission=${m.id}`); }], ['Title', () => goto('')]];
  setTimeout(() => stage({ kicker: result === 'victory' ? `Mission ${m.entry.n} complete` : `Mission ${m.entry.n}`, title: result === 'victory' ? m.title.toUpperCase() : 'THE RODINA FALLS', lines, stats, speaker: result === 'victory' ? (m.outroSpeaker || 'zherca') : 'vitez', dola: result === 'victory' ? m.dola : null, buttons }), 2200);
}
function togglePause(force) {
  if (!started || (rt && rt.over)) return;
  const on = force ?? !game.paused;
  game.paused = on; $('pause').classList.toggle('on', on);
  $('pCheckpoint').style.display = rt && checkpointFor(mission?.id) ? '' : 'none';
}
$('pResume').addEventListener('click', () => togglePause(false));
$('pCheckpoint').addEventListener('click', () => goto(`?mission=${mission.id}&checkpoint=1`));
$('pRestart').addEventListener('click', () => { if (rt) clearCheckpoint(); goto(session.kind === 'mission' ? `?mission=${mission.id}` : '?skirmish=1'); });
$('pQuit').addEventListener('click', () => goto(''));
$('again')?.addEventListener('click', () => goto(session?.kind === 'mission' ? `?mission=${mission.id}` : '?skirmish=1'));

function start(restoreData = null) {
  if (started) return;
  started = true;
  initAudio(); resumeAudio();
  $('start').classList.remove('on');
  $('ui').classList.add('on');
  if (('ontouchstart' in window) || navigator.maxTouchPoints > 0) $('touch').classList.add('on');
  if (rt) { rt.start(restoreData); ui.renderObjectives(); }
  else {
    game.teams[0].wind = 50; game.teams[0].windTotal = 0; game.teams[0].rain = 0; game.teams[0].rainTotal = 0; game.time = 0;
    ui.refreshPanel(true); ui.renderObjectives();
    ui.toast('Your Vietras dance for Wind. Raise, recruit, and find the rival Rodina.', 'good');
    sfx('objective');
  }
}
window.__START__ = start;

/* ---------------------------------------------------------------- loop */
let last = performance.now(), fpsAcc = 0, fpsN = 0, fps = 0;
function frame(now) {
  requestAnimationFrame(frame);
  const real = Math.max(0.0001, (now - last) / 1000);
  const dt = Math.min(0.05, real);
  last = now;
  fpsAcc += real; fpsN++; if (fpsAcc > 0.5) { fps = fpsN / fpsAcc; fpsAcc = 0; fpsN = 0; }
  tick(dt, true);
}
function tick(dt, draw) {
  if (!game || !ui) return;
  const stageOpen = $('stage').classList.contains('on');
  if (!game.paused && !stageOpen) {
    for (let k = 0; k < SPEED; k++) {
      if (started) ai.update(dt);
      game.update(started ? dt : dt * 0.6);
      if (started && rt) rt.tick(dt);
      if (started && systems) systems.update(dt);
    }
    if (dialogue) dialogue.update(dt);
  }
  ui.updateCamera(dt);
  overlays(dt);
  fx.update(dt, heightAt);
  if (started) {
    ui.hud(dt);
    const g0 = game.grodOf(0);
    const near = g0 ? Math.max(0.25, 1 - Math.hypot(ui.target.x - g0.x, ui.target.y - g0.z) / 70) : 0.3;
    updateAudio(game.alive(0, (u) => u.anim.mode === 'dance').length, game.alive(0, (u) => u.anim.mode === 'rite').length, near);
  }
  if (!draw) return;
  renderer.info.autoReset = false; renderer.info.reset();
  rig.render(camera, dt);
  const G = window.__GAME__;
  G.pos[0] = ui.target.x; G.pos[1] = ui.target.y;
  G.fps = fps; G.speed = ui.camVel; G.over = !!game.over;
  G.score = Math.floor(game.teams[0].windTotal + game.teams[0].rainTotal + game.stats.kills * 10);
  G.draws = renderer.info.render.calls; G.tris = renderer.info.render.triangles;
  G.wind = Math.floor(game.teams[0].wind); G.rain = Math.floor(game.teams[0].rain); G.units = game.alive(0).length; G.time = game.time;
}

function overlays(dt) {
  fx.beginOverlays();
  const sel = new Set(game.selection);
  const t = fx.t;
  for (const u of game.units) {
    const shown = ui.shown(u);
    u.model.root.visible = shown || (u.dead && u.team === 0);
    if (!shown || u.dead) continue;
    const r = u.def.radius * (u.ut === 'spirit' ? 1.6 : 1.5);
    fx.shadow(u.x, u.y, u.z, r);
    const col = u.team === 0 ? 0x6cff5a : u.team === 1 ? 0xff5040 : 0xffd84a;
    if (sel.has(u)) fx.ring(u.x, u.y, u.z, u.def.radius * 1.5 + 0.2, col);
    if (sel.has(u) || u.hp < u.maxHp) fx.bar(u.x, u.y + u.def.height + 0.45, u.z, Math.max(0.9, u.def.radius * 1.8), u.hp / u.maxHp, col);
    if (u.anim.mode === 'dance') fx.windAround(u.x, u.y, u.z, t + u.id, 1);
    if (u.ut === 'spirit') fx.spiritAura(u.x, u.y, u.z);
    if (u.fallen) fx.ring(u.x, u.y, u.z, u.def.radius * 1.2, 0xffe07a);
  }
  for (const b of game.buildings) {
    const shown = ui.shown(b);
    b.root.visible = shown;
    if (!shown || b.dead) continue;
    const y = heightAt(b.x, b.z);
    const col = b.team === 0 ? 0x6cff5a : 0xff5040;
    if (sel.has(b)) fx.ring(b.x, y, b.z, b.def.size * 0.72, col);
    if (!b.built) { fx.bar(b.x, y + b.def.height * (0.2 + 0.8 * b.progress) + 1, b.z, b.def.size * 0.5, b.progress, 0x7fc8ff); fx.ring(b.x, y, b.z, b.def.size * 0.62 + 0.3 * Math.sin(t * 2), b.team === 0 ? 0xc8a860 : 0x8090c0); }
    else if (sel.has(b) || b.hp < b.maxHp) fx.bar(b.x, y + b.def.height + 1, b.z, b.def.size * 0.5, b.hp / b.maxHp, col);
    if (b.bt === 'shrine' && b.built) {
      const n = b.workers.filter((w) => !w.dead && w.anim.mode === 'rite').length;
      if (n) fx.rainOver(b.x, y, b.z, n * (b.state === 'bound' ? 2.5 : 1));
      if (b.state === 'bound' || b.state === 'corrupted') fx.corruption(b.x, y, b.z, b.def.size * 0.6);
    }
    if (sel.has(b) && b.rally && b.team === 0) fx.ring(b.rally.x, heightAt(b.rally.x, b.rally.z), b.rally.z, 0.6 + 0.15 * Math.sin(t * 5), 0xffe07a);
  }
  for (const s of game.sites) {
    if (s.dead || !ui.shown(s)) continue;
    if (sel.has(s)) fx.ring(s.x, s.y, s.z, s.radius + 0.4, 0xe8ffb0);
    if (s.st === 'idol' && Math.random() < (s.state === 'sleeping' ? 0.3 : 0.9)) fx.sparkle(s.x + (Math.random() - 0.5) * 3, s.y + 5 + Math.random() * 2, s.z + (Math.random() - 0.5) * 3, 1, s.state === 'awake' ? [0.9, 0.98, 0.7] : [0.62, 0.94, 0.78]);
    if (s.st === 'mound' && s.state !== 'consecrated' && Math.random() < 0.25) fx.sparkle(s.x + (Math.random() - 0.5) * 4, s.y + 0.3, s.z + (Math.random() - 0.5) * 4, 1, [0.5, 0.3, 0.6]);
    if (s.st === 'ring' && s.state !== 'appeased' && Math.random() < 0.5) fx.sparkle(s.x + Math.cos(t * 2 + s.id) * s.radius, s.y + 0.5, s.z + Math.sin(t * 2 + s.id) * s.radius, 1, [0.8, 0.9, 1.0]);
  }
  if (systems) systems.overlays(fx, sel);
  fx.endOverlays();
}

requestAnimationFrame(frame);
// Chrome throttles hidden-tab timers to once a second, so each beat steps the real elapsed time in fixed slices and draws once
if (Q.has('bg')) setInterval(() => {
  if (!document.hidden) return;
  const now = performance.now(), n = Math.min(20, Math.round((now - last) / 100));
  if (n < 1) return;
  for (let k = 0; k < n; k++) tick(0.1, k === n - 1);
  last = now;
}, 100);
boot().catch((e) => { console.warn(e); msg.textContent = 'failed to load: ' + e.message; });
