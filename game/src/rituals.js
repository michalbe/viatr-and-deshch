/**
 * Ritual Actions (blueprint §9): a small vocabulary of channelled interactions that mission
 * scripts enable, target and give meaning to. A ritual is an order: the ritualist walks into
 * range, stands still, performs the rite or the dance, and after `dur` seconds the game emits
 * `ritual` with the unit and the target; damage interrupts it. `game.js` applies the default
 * result of each ritual; a mission can listen and add its own.
 *
 * Targets are classified by kind so one action serves many objects: `idol`, `mound`, `corpse`,
 * `ring`, `spirit` (the Leshy and its kin), `building` (own, damaged or corrupted), `ground`.
 */
export const RITUALS = {
  wake: { name: 'Wake', key: 'N', who: ['zherca', 'baba'], targets: ['idol'], dur: 8, range: 3.2, tip: 'Wake an old idol. The rite takes a while and combat interrupts it.' },
  consecrate: { name: 'Consecrate', key: 'C', who: ['zherca'], targets: ['mound', 'corpse', 'building', 'idol'], dur: 6, range: 3, tip: 'Consecrate a grave, a corpse, a bound Zdroy or an idol so the dead stay quiet and the water runs clean.' },
  offer: { name: 'Offer', key: 'F', who: ['zherca', 'baba'], targets: ['spirit', 'ring', 'idol'], dur: 5, range: 6, cost: { wind: 75, rain: 25 }, tip: 'Make an offering of Wind and Rain to a spirit or a sacred place instead of fighting it.' },
  mend: { name: 'Mend', key: 'M', who: ['vietra', 'zherca'], targets: ['building'], dur: 0, range: 3.4, continuous: true, windPerSecond: 0.6, hpPerSecond: 0.06, tip: 'Mend a damaged structure: roots pull the posts together and the thatch returns on the wind. Costs Wind while it lasts.' },
  ward: { name: 'Ash Ward', key: 'R', who: ['baba'], targets: ['ground'], dur: 3, range: 2, radius: 8, duration: 40, tip: 'Draw a ring of ash: inside it the dead cannot rise and the night things falter.' },
  sight: { name: 'Second Sight', key: 'T', who: ['baba'], targets: ['ground'], dur: 1.5, range: 999, radius: 18, duration: 14, cooldown: 30, tip: 'See an area through the fog for a while.' },
};

/** What kind of ritual target is this entity? */
export function targetKind(t) {
  if (!t) return null;
  if (t.kind === 'site') return t.st;              // idol | mound | ring | stake
  if (t.kind === 'corpse') return 'corpse';
  if (t.kind === 'building') return 'building';
  if (t.kind === 'unit') return t.def.kind === 'spirit' ? 'spirit' : null;
  if (t.kind === 'ground') return 'ground';
  return null;
}

export function canPerform(ritual, unit, target, team = unit.team) {
  const r = RITUALS[ritual]; if (!r) return { ok: false, why: 'No such rite' };
  if (!r.who.includes(unit.ut)) return { ok: false, why: `A ${unit.def.name} cannot perform ${r.name}` };
  const k = targetKind(target);
  if (!r.targets.includes(k)) return { ok: false, why: `${r.name} needs a different target` };
  if (k === 'building') {
    if (target.team !== team) return { ok: false, why: 'Not ours to mend' };
    if (ritual === 'mend' && (target.hp >= target.maxHp - 0.5 || !target.built)) return { ok: false, why: 'Nothing to mend there' };
    if (ritual === 'consecrate' && !target.state) return { ok: false, why: 'That structure is not troubled' };
  }
  if (k === 'idol' && ritual === 'wake' && target.state !== 'sleeping') return { ok: false, why: 'The idol is already awake' };
  if (k === 'mound' && target.state === 'consecrated') return { ok: false, why: 'That mound is already at peace' };
  if (k === 'spirit' && target.appeased) return { ok: false, why: 'It is already appeased' };
  return { ok: true };
}

/** The rite a right-click means, for this ritualist on this target. */
export function defaultRitual(unit, target) {
  const k = targetKind(target);
  const order = k === 'idol' ? ['wake', 'offer', 'consecrate'] : k === 'mound' ? ['consecrate'] : k === 'corpse' ? ['consecrate'] : k === 'spirit' ? ['offer'] : k === 'ring' ? ['offer'] : k === 'building' ? ['mend', 'consecrate'] : [];
  for (const r of order) if (canPerform(r, unit, target).ok) return r;
  return null;
}
