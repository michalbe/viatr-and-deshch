/** The campaign: mission order, titles, maps, and the module that scripts each one. */
export const MISSIONS = [
  { id: 'm01', n: 1, title: 'The First Rain', map: 'sacred_valley', premise: 'Establish your Rodina, contest the valley\'s springs, and discover that the old idol is beginning to wake.', load: () => import('./m01-first-rain.js') },
  { id: 'm02', n: 2, title: 'The Dead Do Not Sleep', map: 'burial_vale', premise: 'Every body left unburied during the day can become an enemy after sunset.', load: () => import('./m02-night-dead.js') },
  { id: 'm03', n: 3, title: 'The Wandering Storm', map: 'long_valley', premise: 'The valley\'s Rain follows a moving storm, forcing both clans to move their economies under it.', load: () => import('./m03-wandering-storm.js') },
  { id: 'm04', n: 4, title: 'The Black Grove', map: 'black_grove', premise: 'Enter a forest with no base, where paths change and the guardian can be fought, deceived, or appeased.', load: () => import('./m04-black-grove.js') },
  { id: 'm05', n: 5, title: 'The Drowned Road', map: 'drowned_road', premise: 'Escort your Rodina down a river valley while rising water repeatedly changes which road is safe.', load: () => import('./m05-drowned-road.js') },
];
export const missionById = (id) => MISSIONS.find((m) => m.id === id);
export const nextMission = (id) => { const i = MISSIONS.findIndex((m) => m.id === id); return MISSIONS[i + 1] || null; };
