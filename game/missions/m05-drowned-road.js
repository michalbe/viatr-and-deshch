/**
 * Mission 5 — THE DROWNED ROAD (blueprint §29). The Rodina goes downriver with its families and
 * carts. The water rises and falls on its own clock: the low road is quick and drowns, the hill
 * road is slow and dry. A Vodnik holds the middle ford and drags walkers under; Rusalki sing on
 * the banks. Halfway there is a dry camp for a temporary outpost. The rival Rodina flees the same
 * way; one of its families can be saved. At the far shore, something with wings is in the storm.
 */
import { TEAM } from '../src/config.js';
import { map, heightAt } from '../src/terrain.js';
import { Water } from '../src/water.js';
import { Weather } from '../src/weather.js';
import { setFlag } from '../src/campaign.js';

const FORD1 = [-20, -48], FORD2 = [3, 12], FORD3 = [2, 52];
const CAMP = [-44, 4], SHORE = [62, 70];
const LOW1 = [-14, -34], LOW2 = [12, 34];

const families = (g) => g.alive(0, (u) => u.ut === 'family');
const near = (u, [x, z], r) => Math.hypot(u.x - x, u.z - z) < r;

/** the party is all there is; the families are why it is there */
function guard(rt) {
  if (rt.guarded) return; rt.guarded = true;
  rt.until(() => !rt.game.alive(0).some((u) => !u.fallen)).then(() => rt.defeat('The river took the Rodina.'));
  rt.until(() => rt.vars.familiesOut && families(rt.game).length === 0).then(() => rt.defeat('Every family was lost on the road. There is no Rodina left to lead.'));
}

export default {
  id: 'm05', title: 'The Drowned Road', map: 'drowned_road',
  assets: ['vodnik', 'rusalka', 'family_cart', 'upir_drowned', 'baba'],
  speakers: [
    { id: 'zherca', name: 'Radomir', title: 'Zherca of the Rodina', ut: 'zherca', team: 0 },
    { id: 'vitez', name: 'Dobrogost', title: 'Vitez', ut: 'vitez', team: 0 },
    { id: 'baba', name: 'Baba Ostra', title: 'Seer', ut: 'baba', team: 0, zoom: 2.4 },
    { id: 'vietra', name: 'Milena', title: 'Vietra', ut: 'vietra', team: 0 },
    { id: 'rival', name: 'Chetvertak', title: 'Zherca of the rival Rodina', ut: 'zherca', team: 1, yaw: -0.4 },
    { id: 'family', name: 'Old Wit', title: 'Of the Rodina', ut: 'family', team: 0, zoom: 1.2, focusY: 0.7 },
  ],
  introSpeaker: 'vietra',
  async world({ game, systems }) {
    systems.water = new Water({ game, terrain: systems.terrain, fx: systems.fx, rate: 0.045, high: 0.95 });
    systems.weather = new Weather({ scene: systems.scene, game, fx: systems.fx, rig: systems.rig });
    systems.weather.dryMult = 1;
    game.locked = new Set(['bear', 'deer', 'baba']);
  },
  start: 'road',
  phases: {
    /* ------------------------------------------------------------ the low road */
    async road(rt, ctx) {
      const g = rt.game, M = map(), [sx, sz] = M.start, W = rt.systems.water;
      guard(rt);
      if (!ctx.restored) {
        g.teams[0].wind = 340 + rt.diff.startWind; g.teams[0].rain = 120; g.teams[0].windTotal = 0; g.teams[0].rainTotal = 0;
        await rt.spawn('zherca', 0, sx, sz, { name: 'Radomir', story: true });
        await rt.spawn('baba', 0, sx + 3, sz + 1, { name: 'Baba Ostra', story: true });
        await rt.spawn('vitez', 0, sx - 3, sz - 2, { name: 'Dobrogost', story: true });
        await rt.spawn('vietra', 0, sx + 1, sz - 4, { name: 'Milena', story: true });
        await rt.spawnGroup(['streletz', 'streletz', 'streletz', 'streletz', 'vitez'], 0, sx + 2, sz + 6);
        for (let i = 0; i < 3; i++) await rt.spawn('family', 0, sx - 6 + i * 4, sz + 10, { name: ['Old Wit\'s cart', 'The weaver\'s cart', 'The fisher\'s cart'][i], tag: 'family' });
        // the river's own
        await rt.spawn('rusalka', TEAM.NEUTRAL, -14, -26, { home: [-14, -26], tag: 'rusalka1' });
        await rt.spawn('rusalka', TEAM.NEUTRAL, 22, 40, { home: [22, 40], tag: 'rusalka2' });
        const V = await rt.spawn('vodnik', TEAM.NEUTRAL, FORD2[0] + 4, FORD2[1] - 2, { name: 'The Vodnik', home: FORD2, tag: 'vodnik' });
        V.hp = V.maxHp;
        rt.checkpoint();
        rt.focus(sx, sz, { dist: 44 });
        await rt.lines([
          ['zherca', 'Three families, everything they own on three carts, and a river between us and the only ground the bound springs have not poisoned.'],
          ['vietra', 'The low road is fast. It follows the water. The hill road is a day longer and every step of it is dry.'],
          ['baba', 'The water here does not keep still. It rises when it likes and takes the low road with it. When it comes up, get to the hills and wait. When it goes down, run.'],
          ['vitez', 'And the ford at the middle. Something lives in it. The other Rodina lost people there last spring.'],
          ['zherca', 'Then we go careful. The families first. Nobody outruns their own carts.'],
        ]);
      }
      rt.aiMode('off');
      rt.objective('camp', 'Bring the families to the dry camp on the western hill');
      rt.objective('all', 'Do not lose a family on the road', { optional: true });
      rt.objective('water', 'Watch the water: when it rises, the low road drowns', { hidden: true });
      rt.ping(CAMP[0], CAMP[1]); rt.reveal(CAMP[0], CAMP[1], 8, 8);
      rt.vars.familiesOut = true;
      // the first rise comes when the party is on the low road, or in a while regardless
      if (!rt.vars.rose1) {
        await Promise.race([rt.until(() => g.alive(0).some((u) => near(u, LOW1, 16) || near(u, FORD1, 8))), rt.wait(75)]);
        if (W.stage === 'low') { W.rise(70); rt.vars.rose1 = true; rt.checkpoint(); await rt.say('baba', 'There. Hear it? The river is breathing in. Up the hill, all of you, carts first!'); }
      }
      await rt.until(() => families(g).length && families(g).every((f) => near(f, CAMP, 14)));
      rt.complete('camp');
      if (families(g).length === 3) rt.flag('allSoFar');
      await rt.phase('camp');
    },
    /* ------------------------------------------------------------ the dry camp */
    async camp(rt, ctx) {
      const g = rt.game, W = rt.systems.water;
      guard(rt);
      if (!ctx.restored) {
        rt.checkpoint();
        await rt.lines([
          ['vietra', 'Dry ground, a spring, and a hill between us and the water. We could raise a Grod here. Not to stay. To breathe.'],
          ['zherca', 'Raise it. A Zdroy at the spring. We will need Rain for whatever is in that ford, and the families need a fire.'],
          ['baba', 'And do not sleep near the bank. The bound water gives its dead back at night, and they come up the low road like everyone else.'],
        ]);
      }
      rt.objective('outpost', 'Raise a Grod at the dry camp: a temporary outpost', { optional: true });
      rt.objective('wait', 'Hold the camp until the water falls');
      // the drowned come up out of the flood while it stands
      const spawnDrowned = async () => { if (rt.over || rt.phaseId !== 'camp') return; for (let i = 0; i < 3; i++) { const a = Math.random() * 6.28; const u = await rt.spawn('upir_drowned', TEAM.NEUTRAL, LOW1[0] + Math.cos(a) * 6 - 10, LOW1[1] + Math.sin(a) * 6 + 20, { home: CAMP }); u.hunt = true; g.emit('rose', u, 'flood'); } rt.ping(LOW1[0] - 10, LOW1[1] + 20); };
      if (W.stage === 'low') { W.rise(80); }
      setTimeout(spawnDrowned, 8000); setTimeout(spawnDrowned, 40000);
      rt.until(() => g.aliveB(0, 'grod').some((b) => b.built)).then(() => { if (rt.phaseId === 'camp' || rt.phaseId === 'rescue' || rt.phaseId === 'crossing') { rt.complete('outpost'); rt.flag('outpost'); } });
      await rt.until(() => W.stage === 'low');
      rt.complete('wait');
      await rt.phase('rescue');
    },
    /* ------------------------------------------------------------ the other Rodina at the ford */
    async rescue(rt, ctx) {
      const g = rt.game;
      guard(rt);
      let R = g.alive(1, (u) => u.ut === 'family')[0];
      if (!ctx.restored) {
        rt.checkpoint();
        await rt.say('baba', 'The water is going down. Now, before it thinks again. The middle ford, then the last, then the far shore.');
        // a rival family runs for the same ford, and the Vodnik has seen them
        R = await rt.spawn('family', TEAM.RIVAL, FORD2[0] - 26, FORD2[1] - 6, { name: 'A family of the rival Rodina', tag: 'rivalFamily', hp: 420 });
        rt.order(R, { type: 'move', x: FORD2[0] + 14, z: FORD2[1] + 6 });
        rt.reveal(FORD2[0], FORD2[1], 16, 20); rt.ping(FORD2[0] - 10, FORD2[1] - 4);
        rt.focus(FORD2[0] - 8, FORD2[1], { dist: 40, hold: 3 });
        await rt.say('baba', 'Not our people. Chetvertak left them behind to slow the water down with their bones, I expect.');
        await rt.say('vitez', 'They are the other Rodina, Radomir. The ones who bound the springs.');
        await rt.say('zherca', 'They are a cart with children in it. Kill the thing in the ford or leave them to it. Your choice, Dobrogost, and it is mine too.');
      }
      rt.objective('cross2', 'Cross the middle ford with the families');
      rt.objective('rescue', 'Save the rival family from the Vodnik', { optional: true });
      const V = g.alive(TEAM.NEUTRAL, (u) => u.tag === 'vodnik')[0];
      if (V && R) { V.home = [R.x + 8, R.z]; g.order(V, { type: 'attack', target: R }); }
      const rescued = () => R && !R.dead && (!V || V.dead || V.hp < V.maxHp * 0.35 || Math.hypot(V.x - R.x, V.z - R.z) > 30);
      const rwatch = rt.until(() => !R || R.dead || rescued()).then(() => {
        if (rt.phaseId !== 'rescue' && rt.phaseId !== 'crossing') return;
        if (R && !R.dead) { rt.complete('rescue'); rt.flag('rescued'); setFlag('rescuedRival', true); rt.order(R, { type: 'move', x: SHORE[0] - 10, z: SHORE[1] - 6 }); rt.say('zherca', 'Go. Go on, take your cart and go. Tell Chetvertak what a Rodina does at a ford.'); }
        else { rt.fail('rescue'); setFlag('rescuedRival', false); rt.say('baba', 'The water has them. Well. It has had plenty of ours.'); }
      });
      await rt.until(() => families(g).length && families(g).every((f) => f.x > FORD2[0] + 6 || f.z > FORD2[1] + 10));
      rt.complete('cross2');
      await rt.phase('crossing');
    },
    /* ------------------------------------------------------------ the last ford, against the water */
    async crossing(rt, ctx) {
      const g = rt.game, W = rt.systems.water, Wx = rt.systems.weather;
      guard(rt);
      if (!ctx.restored) {
        rt.checkpoint();
        await rt.say('baba', 'It is breathing in again. One more ford. Do not stop for anything.');
      }
      if (W.stage === 'low') W.rise(120);
      W.rate = 0.03;
      rt.objective('shore', 'Bring the families to the far shore before the water takes the last ford');
      rt.ping(SHORE[0], SHORE[1]); rt.reveal(SHORE[0], SHORE[1], 10, 10);
      // a second Rusalka has come to the last ford to sing the carts off the road
      if (!rt.vars.sang) { rt.vars.sang = true; await rt.spawn('rusalka', TEAM.NEUTRAL, FORD3[0] - 6, FORD3[1] + 4, { home: [FORD3[0] - 6, FORD3[1] + 4], tag: 'rusalka3' }); }
      await rt.until(() => families(g).length && families(g).every((f) => near(f, SHORE, 16)));
      rt.complete('shore');
      if (families(g).length === 3) rt.complete('all'); else rt.fail('all');
      rt.aiMode('off');
      // something in the storm
      const storm = Wx.addStorm({ id: 'zmey', x: 60, z: 130, r: 34, speed: 6, rainMult: 1, sightMult: 0.5, lightning: true, path: [[30, 100], [10, 96]], loop: false });
      storm.boltT = 1.5;
      rt.focus(20, 92, { dist: 60, hold: 6 });
      await rt.wait(3);
      await rt.say('vietra', 'Radomir. The storm. Look at the storm.');
      await rt.say('baba', 'That is not a cloud, child. That is a shape in a cloud. Wings the width of the valley. The bound springs did not feed a Vodnik. They fed that.');
      await rt.say('zherca', 'Zmey. The old people had a word for it and we had stopped saying it. Get the families under the trees. The Rodina has crossed the river. Now it learns what is on the other side.');
      const saved = families(g).length;
      rt.victory({ saved, rescued: rt.has('rescued'), outpost: rt.has('outpost'), closing: 'Three fords, one river, and the sky has grown a shape. Here the pitch ends, and the game would begin.' });
    },
  },
  summary: (rt, r) => [['Families brought across', `${r.saved} of 3`], ['The rival family', r.rescued ? 'saved from the Vodnik' : 'left to the water'], ['The dry camp', r.outpost ? 'an outpost was raised' : 'no fire was lit']],
  outroSpeaker: 'baba',
  dola: null,
};
