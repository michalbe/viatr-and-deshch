/**
 * Mission 4 — THE BLACK GROVE (blueprint §28). No Grod, no income: a small party and a ritual
 * reserve walk into a forest that rearranges its paths. Three old idols must be woken. A
 * wandering light leads the party where the forest wants them; a Vila dances in a ring on the
 * only way in; the Leshy's children ambush; and at the heart the Great Leshy is fought, paid,
 * or won over by befriending the rings. The second Dola choice follows.
 */
import { TEAM } from '../src/config.js';
import { map, heightAt } from '../src/terrain.js';
import { makeProp } from '../src/models.js';
import { setFlag } from '../src/campaign.js';

const WEST_GAP = [-45, 27], SOUTH_GAP = [-12, -52], EAST_GAP = [49, 21], INNER_W = [-13, 19], INNER_E = [14, -18];
const AMBUSH = [-14, -64], HEART = [6, -6];

/** a root wall across a forest gap: the cells are the runtime's, the prop is ours */
async function wall(rt, id, [x, z], on = true) {
  rt.region(id, { x, z, w: 13, h: 13 }, on);
  let p = rt.vars.walls?.[id];
  if (!rt.wallProps) rt.wallProps = {};
  if (!rt.wallProps[id]) {
    const prop = await makeProp('root_wall', 512);
    prop.position.set(x, heightAt(x, z) - 0.1, z); prop.rotation.y = Math.atan2(x, z) + Math.PI / 2; prop.scale.setScalar(1.6);
    rt.scene.add(prop); rt.wallProps[id] = prop;
  }
  rt.wallProps[id].visible = on;
  (rt.vars.walls ||= {})[id] = on;
  if (on) rt.fx.puff(x, heightAt(x, z) + 1, z, 30, [0.45, 0.65, 0.3], 5, 0.6, 2.5);
  return p;
}
/** the party is all there is: when the last of them is down, the grove has won */
function guard(rt) {
  if (rt.guarded) return; rt.guarded = true;
  rt.until(() => !rt.game.alive(0).some((u) => !u.fallen)).then(() => rt.defeat('The grove kept them.'));
}
async function restoreWalls(rt) { for (const [id, on] of Object.entries(rt.vars.walls || {})) { const pos = { west: WEST_GAP, south: SOUTH_GAP, east: EAST_GAP, innerW: INNER_W, innerE: INNER_E }[id]; if (pos) await wall(rt, id, pos, on); } }

export default {
  id: 'm04', title: 'The Black Grove', map: 'black_grove',
  assets: ['ognik', 'vila', 'vila_ring', 'baba', 'leshonok', 'forest_spirit'],
  speakers: [
    { id: 'zherca', name: 'Radomir', title: 'Zherca of the Rodina', ut: 'zherca', team: 0 },
    { id: 'vitez', name: 'Dobrogost', title: 'Vitez', ut: 'vitez', team: 0 },
    { id: 'baba', name: 'Baba Ostra', title: 'Seer', ut: 'baba', team: 0, zoom: 2.4 },
    { id: 'leshy', name: 'The Great Leshy', title: 'Lord of the Black Grove', ut: 'spirit', team: 2, zoom: 0.55, focusY: 0.6 },
    { id: 'vila', name: 'Vila', title: 'Spirit of the ring', ut: 'vila', team: 2, zoom: 1.1 },
  ],
  introSpeaker: 'baba',
  async world({ game }) {
    game.locked = new Set(['vietra', 'zherca', 'streletz', 'vitez', 'deer', 'bear', 'baba']);   // nothing is trained here
    game.noBase = true;
  },
  start: 'enter',
  phases: {
    /* ------------------------------------------------------------ into the wood */
    async enter(rt, ctx) {
      const g = rt.game, M = map(), [sx, sz] = M.start;
      await restoreWalls(rt); guard(rt);
      if (!ctx.restored) {
        g.teams[0].wind = 260 + rt.diff.startWind; g.teams[0].rain = 180; g.teams[0].windTotal = 0; g.teams[0].rainTotal = 0;
        await rt.spawn('zherca', 0, sx, sz, { name: 'Radomir', story: true });
        await rt.spawn('baba', 0, sx + 3, sz + 1, { name: 'Baba Ostra', story: true });
        await rt.spawn('vitez', 0, sx - 3, sz - 2, { name: 'Dobrogost', story: true });
        await rt.spawnGroup(['streletz', 'streletz', 'streletz', 'streletz'], 0, sx + 1, sz + 5);
        await rt.spawnGroup(['deer', 'deer'], 0, sx - 5, sz + 4);
        // the Vilas in their rings, and the Great Leshy at the heart
        for (const tag of ['ring1', 'ring2']) { const s = rt.site(tag); const v = await rt.spawn('vila', TEAM.NEUTRAL, s.x, s.z, { home: [s.x, s.z], tag }); v.ring = s; }
        const L = await rt.spawn('spirit', TEAM.NEUTRAL, HEART[0], HEART[1], { name: 'The Great Leshy', home: HEART, hp: 2600, tag: 'greatLeshy' });
        L.patience = 12; L.watch = 20;
        await wall(rt, 'south', SOUTH_GAP); await wall(rt, 'east', EAST_GAP); await wall(rt, 'innerE', INNER_E); await wall(rt, 'innerW', INNER_W);
        rt.checkpoint();
        rt.focus(sx, sz, { dist: 42 });
        await rt.lines([
          ['baba', 'Nobody goes into the Black Grove. That is why what we need is still in it.'],
          ['zherca', 'Three idols, the old songs say. Wake all three and the grove tells you what it knows about bound water.'],
          ['vitez', 'And what is the grove going to say about eleven of us walking in with bows?'],
          ['baba', 'Nothing kind. Keep your feet out of any ring of mushrooms, do not follow any light, and if the trees close behind you, that is the grove talking. Listen.'],
          ['zherca', 'We carry what Wind and Rain we have. There is no Grod here to make more. Spend it on the rites, not on tempers.'],
        ]);
      }
      rt.aiMode('off');
      rt.objective('west', 'Wake the Idol of the West');
      rt.objective('reserve', 'Keep enough Wind and Rain for the rites: nothing is gathered here', { optional: true });
      const west = rt.site('west');
      rt.reveal(west.x, west.z, 6, 6); rt.ping(west.x, west.z);
      await rt.until(() => west.state === 'awake');
      rt.complete('west');
      await rt.phase('lights');
    },
    /* ------------------------------------------------------------ the light in the trees */
    async lights(rt, ctx) {
      const g = rt.game, west = rt.site('west'), hill = rt.site('hill');
      await restoreWalls(rt); guard(rt);
      if (!ctx.restored) {
        rt.checkpoint();
        await rt.say('zherca', 'Stribog\'s face. It says the wind knows the way to the second idol... east, and south of here.');
        // the grove answers: the way back closes, and a light comes to show another
        await wall(rt, 'west', WEST_GAP);
        await wall(rt, 'south', SOUTH_GAP, false);
        rt.focus(WEST_GAP[0], WEST_GAP[1], { dist: 34, hold: 2.5 });
        await rt.say('vitez', 'The roots. The way we came is gone.');
        const o = await rt.spawn('ognik', TEAM.NEUTRAL, west.x + 10, west.z + 4, { home: [west.x + 10, west.z + 4], tag: 'ognik' });
        o.lureTo = AMBUSH;
        rt.ping(o.x, o.z);
        await rt.say('baba', 'And there is the light. An Ognik. It wants you to follow. Wherever it is going, something is waiting there. But it also knows every path in this wood, and the one it takes may be the only one open.');
        // the children wait where the light leads
        for (let i = 0; i < 5; i++) await rt.spawn('leshonok', TEAM.NEUTRAL, AMBUSH[0] + Math.cos(i * 1.3) * 4, AMBUSH[1] + Math.sin(i * 1.3) * 4, { home: AMBUSH, tag: 'ambush' });
      }
      rt.objective('hill', 'Find and Wake the Idol of the Hill');
      rt.objective('ognik', 'Do not lose the party to the Ognik: it leads into an ambush', { optional: true });
      let sprung = rt.vars.sprung;
      const spring = () => { if (sprung) return; sprung = rt.vars.sprung = true; for (const c of g.alive(TEAM.NEUTRAL, (u) => u.tag === 'ambush')) { c.hunt = true; const t = g.alive(0)[0]; if (t) g.order(c, { type: 'attack', target: t }); } rt.say('vitez', 'Out of the roots! Shields, Streletz behind me!'); rt.ping(AMBUSH[0], AMBUSH[1]); };
      g.on('lured', spring);
      const watch = rt.until(() => sprung || rt.nearAny(AMBUSH[0], AMBUSH[1], 14)).then(() => { if (rt.phaseId === 'lights') spring(); });
      await rt.until(() => hill.state === 'awake');
      rt.complete('hill');
      if (!sprung) rt.complete('ognik');
      await rt.phase('rings');
    },
    /* ------------------------------------------------------------ the ring on the way in */
    async rings(rt, ctx) {
      const g = rt.game;
      await restoreWalls(rt); guard(rt);
      if (!ctx.restored) {
        rt.checkpoint();
        await rt.say('zherca', 'Perun\'s mark. The third idol is at the heart of the grove, where the Leshy lives. The wood will not like us going there.');
        await wall(rt, 'innerE', INNER_E, false);
        rt.focus(INNER_E[0], INNER_E[1], { dist: 34, hold: 2.5 });
        rt.reveal(INNER_E[0], INNER_E[1], 12, 10);
        await rt.say('baba', 'The way in has opened, by the ring. See her dancing? A Vila. Step inside her ring and she takes you for a partner, and she does not stop. Walk round it, or make her an offering and she will remember us kindly.');
      }
      rt.objective('heart', 'Reach the heart of the grove and Wake the Idol of the Heart');
      rt.objective('vila', 'Befriend the Vilas of both rings with an Offering (75 Wind, 25 Rain each): the Leshy trusts their friends', { optional: true });
      const ring1 = rt.site('ring1'), ring2 = rt.site('ring2'), heart = rt.site('heart');
      const L = g.alive(TEAM.NEUTRAL, (u) => u.tag === 'greatLeshy')[0]; if (L) L.watch = 20;
      let spoke = rt.vars.leshySpoke, offered = rt.vars.offered, deal = rt.vars.deal;
      const vilaFriends = () => ring1.state === 'appeased' && ring2.state === 'appeased';
      rt.until(() => vilaFriends()).then(() => { if (rt.phaseId !== 'rings') return; rt.complete('vila'); rt.flag('vilaFriends'); rt.say('vila', 'You gave, and asked nothing. The old one at the heart will hear of it.'); });
      g.on('leshyWarn', async (leshy) => {
        if (spoke || leshy !== L) return; spoke = rt.vars.leshySpoke = true;
        if (vilaFriends()) { L.appeased = true; L.hostile = false; L.appeasedBy = 0; L.patience = 99; rt.flag('leshyPact'); setFlag('leshyPact', true); await rt.say('leshy', 'The dancers speak for you. Hrrmm. Wake the stone, then. And go.'); await rt.say('baba', 'It let us in. The Vilas spoke for us. Remember that: a friend made is a road opened.'); return; }
        await rt.say('leshy', 'MINE. Hrrmm. Idols. Mine. Walkers. Not.');
        await rt.say('zherca', 'The Great Leshy. Old as the grove. We can pay it, if we kept enough. We can fight it, and the wood will never forgive us. Or... the Vilas. If both rings called us friends, it might listen.');
        await rt.say('vitez', 'Whatever we do, decide before its patience runs out. It is not going to warn us twice.');
      });
      g.on('leshyAppeased', (leshy) => { if (leshy !== L || offered) return; offered = rt.vars.offered = true; rt.flag('leshyPact'); setFlag('leshyPact', true); rt.say('leshy', 'Hrrmm. Taken. Wake the stone. Then go, and do not come back with axes.'); });
      g.on('leshySlain', () => { rt.flag('leshyKilled'); setFlag('leshyKilled', true); rt.say('baba', 'It is done. The grove will remember what we did here, and so will I.'); });
      await rt.until(() => heart.state === 'awake');
      rt.complete('heart');
      rt.aiMode('off');
      await rt.say('zherca', 'Veles, with roots in his mouth. Now I see it. The bound springs feed one thing, downriver, under the water. Something old and hungry that the rival Rodina thinks it commands.');
      await rt.say('baba', 'Then downriver we go. And the water there will be rising to meet us.');
      const leshy = rt.has('leshyKilled') ? 'slain' : rt.has('leshyPact') ? (rt.has('vilaFriends') ? 'won by the Vilas' : 'paid') : 'left to its grove';
      rt.victory({ leshy, vilas: rt.has('vilaFriends'), closing: 'Three idols woke. The grove knows the Rodina\'s name now, for better or worse.' });
    },
  },
  summary: (rt, r) => [['The Great Leshy', r.leshy], ['The Vilas', r.vilas ? 'friends of the Rodina' : 'left to their dance']],
  dola: ['perun', 'veles'],
};
