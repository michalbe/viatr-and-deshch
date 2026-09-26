/**
 * Campaign state (blueprint §19, §21, §42): which mission is next, what the Rodina chose, the
 * flags the story remembers, and the checkpoint of the mission in progress. One JSON blob in
 * localStorage; a mission is one page load, so this is the only thing that survives between
 * missions and reloads.
 */
const KEY = 'windrain.campaign.v1';

export const DIFFICULTY = {
  story:    { name: 'Story',    wave: 0.6, cap: -3, interval: 1.6, startWind: 100, night: 0.6, tip: 'More Wind to start, slower pressure, fewer crises at once.' },
  standard: { name: 'Standard', wave: 1.0, cap: 0,  interval: 1.0, startWind: 0,   night: 1.0, tip: 'The valley as designed.' },
  hard:     { name: 'Hard',     wave: 1.4, cap: 6,  interval: 0.7, startWind: 0,   night: 1.4, tip: 'Bigger raids, sooner, and the night things come in numbers.' },
};

/** The four blessing families of the Dola; a mission offers two of these at its end. */
export const DOLA = {
  stribog: { name: 'Breath of Stribog', line: 'The wind favours the quick.', effects: { windRate: 1.1, jelenikSight: 1.15 }, text: 'Vietras gather 10% more Wind. Jelenik sees 15% farther.' },
  mokosh:  { name: 'Thread of Mokosh', line: 'What is woven holds.', effects: { mendCost: 0.5, zdroySlots: 1, khataHp: 1.3 }, text: 'Mend costs half. A Zdroy holds one more Zherca. Khatas are sturdier.' },
  perun:   { name: 'Mark of Perun', line: 'The first blow is the sky\'s.', effects: { vitezFirst: 1.6, arrowSpirit: 1.25 }, text: 'A Vitez\'s first strike in a fight hits like thunder. Streletz arrows bite spirits and the dead harder.' },
  veles:   { name: 'Path of Veles', line: 'The below is not empty.', effects: { babaSight: 1.3, wardDuration: 1.5, offerCost: 0.66 }, text: 'Second Sight reaches farther, Ash Wards last longer, offerings cost less.' },
};

let state = null;

export function loadCampaign() {
  if (state) return state;
  try { state = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch { state = null; }
  return state;
}
export function saveCampaign() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* private mode */ } return state; }
export function newCampaign(difficulty = 'standard') {
  state = { version: 1, difficulty, mission: 'm01', unlocked: ['m01'], flags: {}, dola: [], done: {}, checkpoint: null, started: Date.now() };
  return saveCampaign();
}
export function clearCampaign() { state = null; try { localStorage.removeItem(KEY); } catch {} }
export function campaign() { return state; }
export function difficulty() { return DIFFICULTY[state?.difficulty] || DIFFICULTY.standard; }
export function setFlag(k, v = true) { if (!state) return; state.flags[k] = v; saveCampaign(); }
export function flag(k) { return state?.flags?.[k]; }
export function hasDola(id) { return !!state?.dola?.includes(id); }
export function chooseDola(id) { if (!state) return; if (!state.dola.includes(id)) state.dola.push(id); saveCampaign(); }
/** The merged effects of every blessing chosen so far. */
export function dolaEffects() {
  const out = {};
  for (const id of state?.dola || []) for (const [k, v] of Object.entries(DOLA[id]?.effects || {})) out[k] = v;
  return out;
}
export function completeMission(id, summary, nextId) {
  if (!state) return;
  state.done[id] = { ...summary, at: Date.now() };
  if (nextId && !state.unlocked.includes(nextId)) state.unlocked.push(nextId);
  if (nextId) state.mission = nextId;
  state.checkpoint = null;
  saveCampaign();
}
export function saveCheckpoint(missionId, data) { if (!state) return; state.checkpoint = { mission: missionId, at: Date.now(), data }; saveCampaign(); }
export function clearCheckpoint() { if (!state) return; state.checkpoint = null; saveCampaign(); }
export function checkpointFor(missionId) { return state?.checkpoint?.mission === missionId ? state.checkpoint : null; }
