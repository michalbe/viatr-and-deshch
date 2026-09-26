/**
 * Mission 2 — THE DEAD DO NOT SLEEP (blueprint §26). A settled valley that stopped answering.
 * By day: find what happened, mend the Grod, gather. At sunset the battlefield gets up. At dawn
 * a Baba arrives and teaches the Ash Ward. Consecrate the barrows, then survive the long night
 * and lay the great mound to rest.
 */
import { TEAM } from '../src/config.js';
import { map } from '../src/terrain.js';
import { DayNight } from '../src/daynight.js';
import { Corpses } from '../src/corpses.js';
import { setFlag } from '../src/campaign.js';

const BATTLEFIELD = [0, -12], HAMLET = [14, 62];

export default {
  id: 'm02', title: 'The Dead Do Not Sleep', map: 'burial_vale',
  assets: ['upir', 'striga', 'baba', 'corpse', 'burial_mound'],
  speakers: [
    { id: 'zherca', name: 'Radomir', title: 'Zherca of the Rodina', ut: 'zherca', team: 0 },
    { id: 'vitez', name: 'Dobrogost', title: 'Vitez', ut: 'vitez', team: 0 },
    { id: 'baba', name: 'Baba Ostra', title: 'Seer', ut: 'baba', team: 0, zoom: 2.4 },
    { id: 'vietra', name: 'Milena', title: 'Vietra', ut: 'vietra', team: 0 },
  ],
  introSpeaker: 'vitez',
  /* ------------------------------------------------------------ the world before the game starts */
  async world({ game, systems, scene, props, makeProp, heightAt, map: M }) {
    systems.daynight = new DayNight({ rig: systems.rig, game, hour: 9.5, secondsPerHour: 14 });
    systems.corpses = new Corpses({ scene, game, fx: systems.fx, makeProp, daynight: systems.daynight });
    systems.corpses.rising = false;
    game.locked = new Set(['baba']);
    const names = ['The Ford Barrow', 'The Hill Barrow', 'The Western Barrow', 'The Great Mound'];
    for (let i = 0; i < M.mounds.length; i++) {
      const [x, z] = M.mounds[i];
      const p = await makeProp('burial_mound');
      p.position.set(x, heightAt(x, z) - 0.15, z); p.rotation.y = i * 1.3; scene.add(p); props.push({ obj: p, x, z });
      game.addSite({ st: 'mound', name: names[i], title: i === 3 ? 'Where the vale buries its Zhercas' : 'A barrow of the old people', x, z, radius: 4.5, state: 'restless', prop: p, tag: i === 3 ? 'great' : 'mound' + i, strength: i === 3 ? 1.6 : 1 });
    }
  },
  start: 'arrive',
  phases: {
    /* ------------------------------------------------------------ day one: the silent Grod */
    async arrive(rt, ctx) {
      const g = rt.game, M = map();
      const [gx, gz] = M.player.grod, [sx, sz] = M.start;
      if (!ctx.restored) {
        const grod = await rt.place('grod', 0, gx, gz, true); grod.hp = grod.maxHp * 0.42;
        for (const [dx, dz] of [[-4, 0], [4, 1], [0, -5]]) { const k = await rt.place('khata', TEAM.NEUTRAL, HAMLET[0] + dx * 1.6, HAMLET[1] + dz * 1.6, true); k.hp = k.maxHp * 0.3; k.name = 'Abandoned Khata'; }
        g.teams[0].wind = 150 + rt.diff.startWind; g.teams[0].rain = 0; g.teams[0].windTotal = 0; g.teams[0].rainTotal = 0;
        const z = await rt.spawn('zherca', 0, sx, sz, { name: 'Radomir', story: true });
        const v = await rt.spawn('vitez', 0, sx + 3, sz - 2, { name: 'Dobrogost', story: true });
        await rt.spawnGroup(['streletz', 'streletz', 'streletz', 'streletz'], 0, sx + 2, sz + 4);
        // the battlefield and the hamlet are strewn with the dead; one of them is already walking
        for (let i = 0; i < 16; i++) { const a = i * 0.9, r = 3 + (i % 4) * 2.2; g.addCorpse(BATTLEFIELD[0] + Math.cos(a) * r, BATTLEFIELD[1] + Math.sin(a) * r, i % 3 === 0 ? 1 : 0, ['streletz', 'vitez', 'vietra'][i % 3]); }
        for (let i = 0; i < 4; i++) g.addCorpse(HAMLET[0] - 6 + i * 3, HAMLET[1] + 5, 0, i % 2 ? 'vietra' : 'zherca');
        await rt.spawn('upir', TEAM.NEUTRAL, BATTLEFIELD[0] + 6, BATTLEFIELD[1] + 8, { home: BATTLEFIELD });
        rt.checkpoint();
        rt.focus(sx, sz, { dist: 40 });
        await rt.lines([
          ['vitez', 'No smoke. Three days without a signal from this vale, and no smoke.'],
          ['zherca', 'The Grod stands. The Khatas stand. Where are the people?'],
        ]);
      }
      rt.objective('reach', 'Reach the silent Grod');
      await rt.until(() => rt.nearAny(gx, gz, 16));
      rt.complete('reach');
      await rt.lines([
        ['vitez', 'Doors scratched from the outside. Not wolves. Wolves do not try the latch.'],
        ['zherca', 'The old battlefield lies past the ford. Dobrogost, keep the archers near the walls. I will mend what I can.'],
      ]);
      rt.objective('mend', 'Mend the Grod to half its strength (a Zherca: Mend)');
      rt.objective('dance', 'Recruit two Vietras and let them dance', { optional: false });
      rt.on('sunset', () => {});
      g.on('sunset', () => { if (rt.phaseId === 'arrive') rt.phase('firstNight'); });
      await rt.until(() => g.grodOf(0)?.hp >= g.grodOf(0)?.maxHp * 0.5);
      rt.complete('mend');
      await rt.until(() => g.alive(0, (u) => u.anim.mode === 'dance').length >= 2);
      rt.complete('dance');
      await rt.say('zherca', 'The dance holds. Now we wait for the night, and I do not like the way the ground listens.');
      await rt.until(() => false);   // sunset takes it from here
    },
    /* ------------------------------------------------------------ first sunset: the battlefield gets up */
    async firstNight(rt, ctx) {
      const g = rt.game, C = rt.systems.corpses;
      C.rising = true;
      if (!ctx.restored) {
        await rt.say('vitez', 'Radomir. The field. They are getting up.');
        const field = g.corpses.filter((c) => Math.hypot(c.x - BATTLEFIELD[0], c.z - BATTLEFIELD[1]) < 14);
        field.forEach((c, i) => setTimeout(() => { if (!c.dead) C.rise(c, 'battlefield'); }, 1500 + i * 2200));
        rt.ping(BATTLEFIELD[0], BATTLEFIELD[1]);
        await rt.say('zherca', 'Upiry. The unburied. Every one of ours that falls tonight will get up on their side. Keep the dead in front of the bows, and keep our dead in sight.');
      }
      rt.objective('survive1', 'Survive until dawn');
      rt.objective('keep', 'Keep the Grod standing');
      const off = g.on('dawn', () => { if (rt.phaseId === 'firstNight') rt.phase('baba'); });
      await rt.until(() => !g.grodOf(0));
      rt.defeat('The Grod fell in the night, and there was no one left to raise it.');
    },
    /* ------------------------------------------------------------ dawn: the Baba */
    async baba(rt, ctx) {
      const g = rt.game, M = map(), [gx, gz] = M.player.grod;
      rt.complete('survive1');
      if (!ctx.restored) {
        rt.checkpoint();
        await rt.say('vitez', 'Dawn. They stopped. They just... stopped, and lay down where they stood.');
        const b = await rt.spawn('baba', 0, HAMLET[0], HAMLET[1] + 8, { name: 'Baba Ostra', story: true });
        rt.order(b, { type: 'move', x: gx + 6, z: gz + 9 });
        rt.focus(HAMLET[0], HAMLET[1] + 8, { dist: 34 });
        await rt.lines([
          ['baba', 'You are late, and you are loud. Three nights I sat in the smokehouse with ash on the sill, and not one of them came in.'],
          ['zherca', 'Mother. What happened here?'],
          ['baba', 'They stopped burying properly. A dry summer, a quick war, more dead than rites. The barrows woke first. Then the field.'],
          ['baba', 'Ash keeps them down. A ring of it, and nothing inside it rises. I will show your Zherca where to draw it. And the barrows want consecrating, priest, not prayers from a distance.'],
        ]);
        g.locked.delete('baba'); setFlag('baba', true);
        rt.toast('The Baba joins the Rodina. Svety Gai can now invite a Baba; the Baba knows Second Sight and the Ash Ward.', 'good');
      } else {
        rt.systems.corpses.rising = false;
      }
      rt.systems.corpses.rising = false;
      rt.objective('mounds', 'Consecrate three of the four barrows (a Zherca: Consecrate)');
      rt.objective('zdroy', 'Raise a Zdroy at a spring and gather Rain', { optional: true });
      rt.objective('ready', 'Prepare for the long night: Ash Wards, walls of archers, dead in sight', { optional: true });
      g.on('sunset', () => { if (rt.phaseId === 'baba') rt.phase('longNight'); });
      await rt.until(() => g.sites.filter((s) => s.st === 'mound' && s.state === 'consecrated').length >= 3);
      rt.complete('mounds');
      await rt.say('baba', 'Three sleep. The great one in the wood will not, not from a distance. When the sun goes, go to it with the whole Rodina behind you, or do not go.');
      await rt.until(() => false);
    },
    /* ------------------------------------------------------------ the long night */
    async longNight(rt, ctx) {
      const g = rt.game, C = rt.systems.corpses, M = map(), [gx, gz] = M.player.grod;
      C.rising = true; C.moundEvery = 28;
      const great = rt.site('great');
      const quiet = g.sites.filter((s) => s.st === 'mound' && s.state === 'consecrated').length;
      if (!ctx.restored) {
        rt.checkpoint();
        await rt.say('baba', 'Here it comes. Whatever you have not put to rest is awake now.');
        rt.objective('survive2', 'Survive the long night');
        rt.objective('great', 'Consecrate the Great Mound in the cemetery');
        const gap = [62 - 30 * Math.cos(2.4), -58 - 30 * Math.sin(2.4)];
        const strigas = Math.round((quiet >= 3 ? 2 : 3) * rt.diff.night);
        setTimeout(async () => { for (let i = 0; i < strigas; i++) { const s = await rt.spawn('striga', TEAM.NEUTRAL, gap[0] + i * 2, gap[1] + i * 2, { home: [great.x, great.z] }); s.hunt = true; } rt.say('vitez', 'Something faster than the dead. It went for the dancers!'); rt.ping(gap[0], gap[1]); }, 25000);
        let waves = 0;
        const waveT = setInterval(async () => {
          if (rt.over || !rt.systems.daynight.isNight || waves > 5) { clearInterval(waveT); return; }
          waves++;
          const n = Math.round((3 + waves) * rt.diff.night), edge = [M.start[0] + 100, M.start[1] - 120];
          for (let i = 0; i < n; i++) { const a = Math.random() * 6.28, r = 82; const x = Math.max(-84, Math.min(84, gx + Math.cos(a) * r)), z = Math.max(-84, Math.min(84, gz + Math.sin(a) * r)); await rt.spawn('upir', TEAM.NEUTRAL, x, z, { home: [gx, gz] }); }
          rt.toast('The dead come from the dark', 'bad');
        }, 55000);
      }
      g.on('dawn', () => { if (rt.phaseId === 'longNight') { rt.complete('survive2'); C.rising = false; rt.say('baba', 'Dawn. Now the wood. Put the great one down while the sun is up, and this vale is a vale again.'); } });
      const defeatWatch = rt.until(() => !g.grodOf(0)).then(() => rt.defeat('The Grod fell in the long night.'));
      await rt.until(() => great.state === 'consecrated');
      rt.complete('great');
      await rt.until(() => !rt.systems.daynight.isNight);
      rt.complete('survive2');
      await rt.say('zherca', 'It is quiet. Not empty. Quiet. The old people are back in their barrows, and ours will go into the ground properly.');
      await rt.say('baba', 'Properly. And you will learn what "properly" costs before this is over, priest. The springs are next.');
      rt.victory({ closing: 'The dead of the vale sleep. The Baba walks with the Rodina now.', quiet: g.sites.filter((s) => s.st === 'mound' && s.state === 'consecrated').length });
    },
  },
  summary: (rt, r) => [['Barrows laid to rest', `${r.quiet} of 4`], ['The Baba', 'joins the Rodina']],
  dola: null,
};
