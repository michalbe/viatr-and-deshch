/**
 * Mission 3 — THE WANDERING STORM (blueprint §27). The Long Valley's Rain follows a storm that
 * wanders from west to east and back; a Zdroy under it gathers many times faster, a Zdroy in
 * the dry gathers almost nothing. Both Rodinas chase it. Halfway, the rival Binds a spring, and
 * something drowned comes out of the black water. Ends at the last spring under the storm; the
 * first Dola choice follows.
 */
import { TEAM } from '../src/config.js';
import { map, tintGround } from '../src/terrain.js';
import { Weather } from '../src/weather.js';
import { setupMatch } from '../src/ai.js';
import { setFlag } from '../src/campaign.js';

export default {
  id: 'm03', title: 'The Wandering Storm', map: 'long_valley',
  assets: ['upir_drowned', 'baba'],
  speakers: [
    { id: 'zherca', name: 'Radomir', title: 'Zherca of the Rodina', ut: 'zherca', team: 0 },
    { id: 'vitez', name: 'Dobrogost', title: 'Vitez', ut: 'vitez', team: 0 },
    { id: 'baba', name: 'Baba Ostra', title: 'Seer', ut: 'baba', team: 0, zoom: 2.4 },
    { id: 'rival', name: 'Chetvertak', title: 'Zherca of the rival Rodina', ut: 'zherca', team: 1, yaw: -0.4 },
    { id: 'jelenik', name: 'Scout', title: 'Jelenik', ut: 'deer', team: 0, zoom: 1.3, focusY: 0.72 },
  ],
  async world({ game, systems, map: M }) {
    systems.weather = new Weather({ scene: systems.scene, game, fx: systems.fx, rig: systems.rig });
    systems.weather.dryMult = 0.25;
    game.rainBase = 1;
    // the storm enters from the western hills and wanders the valley, spring to spring, and back
    systems.weather.addStorm({ id: 'storm', x: -95, z: 30, r: 26, speed: 1.15, rainMult: 2.75, sightMult: 0.7, path: [[-40, 42], [-14, -24], [24, 30], [52, -52], [24, 30], [-14, -24], [-40, 42]] });
  },
  start: 'follow',
  phases: {
    /* ------------------------------------------------------------ the storm comes */
    async follow(rt, ctx) {
      const g = rt.game, M = map(), W = rt.systems.weather;
      if (!ctx.restored) {
        await setupMatch(g);
        g.teams[0].wind = 120 + rt.diff.startWind; g.teams[0].rain = 25; g.teams[0].windTotal = 0; g.teams[0].rainTotal = 0;
        const z = g.alive(0, (u) => u.ut === 'zherca')[0]; if (z) { z.name = 'Radomir'; z.story = true; }
        const [gx, gz] = M.player.grod;
        await rt.spawn('baba', 0, gx + 9, gz + 8, { name: 'Baba Ostra', story: true });
        await rt.spawn('deer', 0, gx + 12, gz + 12, { name: 'Scout' });
        await rt.spawnGroup(['streletz', 'streletz', 'vitez'], 0, gx - 6, gz + 12);
        await rt.place('warhall', 0, gx + 16, gz - 4, true);
        await rt.place('khata', 0, gx - 14, gz - 6, true);
        rt.checkpoint();
        await rt.lines([
          ['baba', 'Smell that? That is the only Rain in this valley for a month, and it is walking.'],
          ['zherca', 'The springs here are dry. Ask them and they answer with dust. But under the storm...'],
          ['baba', 'Under the storm a Zdroy drinks like a calf. The other Rodina knows it too. Whoever keeps their priests under that cloud keeps the valley.'],
        ]);
      }
      rt.aiMode('skirmish', { nextWave: 240 * rt.diff.interval, intervalScale: 0.8 });
      rt.objective('zdroy', 'Raise a Zdroy at a spring the storm is heading for');
      rt.objective('rain', 'Gather 150 Rain under the storm');
      rt.objective('scout', 'Use the Jelenik to follow the storm and see where it turns', { optional: true });
      await rt.until(() => g.aliveB(0, 'shrine').some((b) => b.built));
      rt.complete('zdroy');
      await rt.until(() => g.teams[0].rainTotal >= 150);
      rt.complete('rain');
      await rt.phase('binding');
    },
    /* ------------------------------------------------------------ the rival binds a spring */
    async binding(rt, ctx) {
      const g = rt.game, M = map();
      const rs = M.springs[3];
      if (!ctx.restored) {
        rt.checkpoint();
        await rt.say('jelenik', 'The rival Zdroy by the eastern hills. The storm left it an hour ago and it is still pouring. The water has gone black.');
        const shrine = g.aliveB(1, 'shrine').find((b) => b.spring && Math.hypot(b.x - rs[0], b.z - rs[1]) < 8) || g.aliveB(1, 'shrine')[0];
        if (shrine) { shrine.state = 'bound'; shrine.name = 'Bound Zdroy'; tintGround(g.terrain, shrine.x, shrine.z, 14, 0x1a1a22, 0.7); g.fogT = 0; g.emit('buildingState', shrine, null); }
        rt.reveal(rs[0], rs[1], 14, 12);
        rt.focus(rs[0], rs[1], { dist: 36, hold: 3 });
        await rt.lines([
          ['rival', 'You ask. We do not ask. Look at it, priest. Look how it gives.'],
          ['zherca', 'That is not giving. That is a spring with a rope round its throat.'],
          ['baba', 'Binding. My grandmother had a word for people who did that, and it was not a kind one. Watch the water. Something always comes up out of bound water.'],
        ]);
        rt.flag('sawBinding'); setFlag('sawBinding', true);
        // the drowned: every so often, the black water gives one up
        const spawnDrowned = async () => { if (rt.over || !shrine || shrine.dead || shrine.state !== 'bound') return; const a = Math.random() * 6.28; const u = await rt.spawn('upir_drowned', TEAM.NEUTRAL, shrine.x + Math.cos(a) * 5, shrine.z + Math.sin(a) * 5, { home: [shrine.x, shrine.z] }); u.hunt = true; g.emit('rose', u, 'binding'); };
        setTimeout(spawnDrowned, 6000);
        const iv = setInterval(() => { if (rt.over || rt.phaseId !== 'binding' && rt.phaseId !== 'last') { clearInterval(iv); return; } spawnDrowned(); }, 70000);
      }
      rt.aiMode('skirmish', { waveScale: 1.15 });
      rt.objective('hold', 'Keep a Zdroy under the storm and reach 400 Rain');
      rt.objective('bound', 'Consecrate the Bound Zdroy, or destroy it', { optional: true });
      const bound = () => g.aliveB(1, 'shrine').find((b) => b.state === 'bound');
      const boundWatch = rt.until(() => !bound()).then(() => { if (rt.phaseId === 'binding' || rt.phaseId === 'last') { rt.complete('bound'); rt.flag('unbound'); setFlag('unbound', true); rt.say('baba', 'The water runs clean. It will take a season to forgive us, but it runs clean.'); } });
      await rt.until(() => g.teams[0].rainTotal >= 400);
      rt.complete('hold');
      await rt.phase('last');
    },
    /* ------------------------------------------------------------ the last spring under the storm */
    async last(rt, ctx) {
      const g = rt.game, M = map(), W = rt.systems.weather;
      const storm = W.volumes[0];
      if (!ctx.restored) rt.checkpoint();
      // the storm settles on the middle spring and stays; both clans converge
      storm.path = [[24, 30]]; storm.loop = false; storm.r = 30;
      await rt.say('baba', 'It is slowing. It has picked its spring, the middle one, and it means to sit. Whoever holds that ground holds the last Rain in the valley.');
      rt.objective('converge', 'Hold the middle spring under the storm: raise or take its Zdroy and gather 200 Rain there');
      rt.aiMode('skirmish', { target: [24, 26], waveScale: 1.3, intervalScale: 0.6, nextWave: 30 });
      const mid = M.springs[2];
      let gathered = 0, last = g.teams[0].rainTotal;
      await rt.until(() => { const s = g.springs[2].shrine; const ours = s && s.team === 0 && s.built; if (ours) { gathered += g.teams[0].rainTotal - last; } last = g.teams[0].rainTotal; return gathered >= 200; });
      rt.complete('converge');
      rt.aiMode('off');
      await rt.say('rival', 'Keep your spring. Keep your storm. We have learned to make our own.');
      await rt.say('zherca', 'They will bind every spring they can reach now. And the water will keep coming up black.');
      await rt.say('baba', 'Then we had better learn what the old people knew before the springs forget it. There is a grove in the north where nobody goes. We go.');
      rt.victory({ closing: 'The valley\'s Rain follows the storm. The rival Rodina no longer waits for it.', unbound: rt.has('unbound') });
    },
  },
  summary: (rt, r) => [['The Bound Zdroy', r.unbound ? 'set free' : 'left bound'], ['The storm', 'followed']],
  dola: ['stribog', 'mokosh'],
};
