/**
 * Mission 1 — THE FIRST RAIN (blueprint §25). The Sacred Valley: learn the economy, raise the
 * village, meet the Leshy, contest the springs, destroy or break the rival Grod, and watch the
 * old idol wake when the fighting is done.
 */
import { TEAM } from '../src/config.js';
import { setupMatch } from '../src/ai.js';
import { map } from '../src/terrain.js';

export default {
  id: 'm01', title: 'The First Rain', map: 'sacred_valley',
  speakers: [
    { id: 'zherca', name: 'Radomir', title: 'Zherca of the Rodina', ut: 'zherca', team: 0 },
    { id: 'vitez', name: 'Dobrogost', title: 'Vitez', ut: 'vitez', team: 0 },
    { id: 'vietra', name: 'Milena', title: 'Vietra', ut: 'vietra', team: 0 },
    { id: 'rival', name: 'Chetvertak', title: 'Zherca of the rival Rodina', ut: 'zherca', team: 1, yaw: -0.4 },
    { id: 'leshy', name: 'The Leshy', title: 'Guardian of the forest', ut: 'spirit', team: 2 },
  ],
  intro: [
    ['zherca', 'The valley is good. Springs, a river, a forest that does not hate us yet.'],
    ['zherca', 'Let the Vietras dance. The Wind comes to those who ask it.'],
  ],
  start: 'settle',
  phases: {
    /* ---------------------------------------------------------- learn the economy, raise the village */
    async settle(rt, ctx) {
      const g = rt.game;
      if (!ctx.restored) {
        await setupMatch(g);
        g.teams[0].wind = 50 + rt.diff.startWind; g.teams[0].rain = 0; g.teams[0].windTotal = 0; g.teams[0].rainTotal = 0;
        const z = g.alive(0, (u) => u.ut === 'zherca')[0]; if (z) { z.name = 'Radomir'; z.story = true; }
        rt.checkpoint();
      }
      rt.aiMode('skirmish', { nextWave: 300 * rt.diff.interval });
      if (!ctx.restored) await rt.lines(rt.def.intro);
      rt.objective('wind100', 'Gather 100 Wind');
      await rt.until(() => g.teams[0].windTotal >= 100);
      rt.complete('wind100');
      await rt.say('vietra', 'The Wind is with us. Ask the land for a Khata: I will dance it up.');
      rt.objective('khata', 'Raise a Khata');
      await rt.until(() => g.aliveB(0, 'khata').some((b) => b.built));
      rt.complete('khata');
      await rt.phase('arm');
    },
    /* ---------------------------------------------------------- the warband */
    async arm(rt, ctx) {
      const g = rt.game;
      await rt.say('vitez', 'Homes are for after. The rival Rodina has warriors. Raise a Zbroynia and I will find you men.');
      rt.objective('zbroynia', 'Raise a Zbroynia');
      await rt.until(() => g.aliveB(0, 'warhall').some((b) => b.built));
      rt.complete('zbroynia');
      rt.objective('streletz', 'Recruit 3 Streletz');
      await rt.until(() => (g.teams[0].trained.streletz || 0) >= 3);
      rt.complete('streletz');
      await rt.phase('rain');
    },
    /* ---------------------------------------------------------- Rain */
    async rain(rt, ctx) {
      const g = rt.game;
      const s = map().springs[0];
      await rt.say('zherca', 'Bows are Wind-work. A Vitez needs Rain. The spring by the marsh will answer me, if we ask it properly.');
      rt.ping(s[0], s[1]);
      rt.objective('zdroy', 'Raise a Zdroy at the spring');
      await rt.until(() => g.aliveB(0, 'shrine').some((b) => b.built));
      rt.complete('zdroy');
      rt.objective('rain50', 'Gather 50 Rain');
      await rt.until(() => g.teams[0].rainTotal >= 50);
      rt.complete('rain50');
      rt.objective('vitez', 'Recruit a Vitez');
      await rt.until(() => (g.teams[0].trained.vitez || 0) >= 1);
      rt.complete('vitez');
      await rt.phase('valley');
    },
    /* ---------------------------------------------------------- the valley: raids, the Leshy, the rival */
    async valley(rt, ctx) {
      const g = rt.game;
      if (!ctx.restored) {
        await rt.say('vitez', 'Now they know we are here. Their patrols come through the forest passages. Keep the dancers behind the warriors.');
        rt.aiMode('skirmish', { nextWave: 20 });
      }
      rt.objective('find', 'Find the rival Rodina');
      rt.objective('leshy', 'The forest clearing: appease the Leshy with an offering, or fight it', { optional: true });
      // the first time a unit meets the Leshy, the priest explains the choice
      let warned = rt.vars.leshyWarned;
      g.on('leshyWarn', async () => { if (warned) return; warned = rt.vars.leshyWarned = true; await rt.say('leshy', 'Grrrhh. Mine. Trees. Mine.'); await rt.say('zherca', 'A Leshy. It is not a beast, it is a neighbour with a temper. Bring it Wind and Rain and it may open the forest for us. Or we kill it, and the forest will not forget.'); });
      g.on('leshyAppeased', () => { rt.complete('leshy'); rt.flag('leshyAppeased'); rt.say('zherca', 'It took the offering. The roots have opened the clearing. Remember this: the forest gave, because we asked.'); });
      g.on('leshySlain', () => { rt.complete('leshy'); rt.flag('leshyKilled'); rt.say('vitez', 'Dead wood. Take what it hoarded.').then(() => rt.say('zherca', 'Its children will come for us now. The forest keeps accounts.')); });
      await rt.until(() => g.buildings.some((b) => b.team === TEAM.RIVAL && g.cellSeen(b.x, b.z)));
      rt.complete('find');
      await rt.say('rival', 'Go back to your marsh, dancers. This valley has one Rodina in it already.');
      await rt.say('zherca', 'Their Zherca. He sounds like a man who has been hungry. Break their Grod and the valley is ours; there is no other road.');
      rt.objective('grod', 'Destroy the rival Grod');
      await rt.until(() => !g.buildings.some((b) => b.team === TEAM.RIVAL && b.bt === 'grod' && !b.dead));
      rt.complete('grod');
      await rt.phase('wake');
    },
    /* ---------------------------------------------------------- the idol wakes */
    async wake(rt, ctx) {
      const g = rt.game;
      rt.aiMode('off');
      const idol = rt.site('Old Idol');
      await rt.wait(2);
      await rt.say('vitez', 'It is done. Their Grod is ash. Let the dancers sing tonight.');
      // thunder from a clear sky; the idol turns
      rt.sfx('spirit', 1); rt.sfx('alarm', 0.4);
      rt.focus(idol.x, idol.z, { dist: 32 });
      await rt.wait(1.2);
      g.setSiteState(idol, 'awake');
      g.fx.puff(idol.x, idol.y + 6, idol.z, 60, [0.62, 0.94, 0.78], 5, 0.8, 3);
      rt.reveal(idol.x, idol.z, 40, 20);
      await rt.wait(1.5);
      await rt.say('zherca', 'That was not our rite.');
      await rt.say('zherca', 'Something answered anyway.');
      rt.victory({ leshy: rt.has('leshyAppeased') ? 'appeased' : rt.has('leshyKilled') ? 'slain' : 'left alone', closing: 'The idol is awake. It was not asked.' });
    },
  },
  /** what the summary screen shows */
  summary: (rt, r) => [['Leshy', r.leshy || 'left alone']],
  dola: null,
};
