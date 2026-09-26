/** Inline SVG icons, so nothing depends on an emoji font. */
const svg = (body, vb = '0 0 24 24') => `<svg viewBox="${vb}" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
export const ICON = {
  wind: svg('<path d="M3 8h11a3 3 0 1 0-3-3"/><path d="M3 12h16a3 3 0 1 1-3 3"/><path d="M3 16h7"/>'),
  rain: svg('<path d="M7 14a4 4 0 0 1 .5-8A5.5 5.5 0 0 1 18 8a3 3 0 0 1 0 6z"/><path d="M8 18l-1 3M12 17l-1 3M16 18l-1 3"/>'),
  supply: svg('<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-5h4v5"/>'),
  dance: svg('<circle cx="12" cy="5" r="2"/><path d="M5 5l4 5h6l4-5"/><path d="M12 10v5l-3 6M12 15l3 6"/><path d="M3 15c2-1 3 0 4 1M21 15c-2-1-3 0-4 1"/>'),
  rite: svg('<path d="M12 3c3 4 5 7 5 10a5 5 0 0 1-10 0c0-3 2-6 5-10z"/><path d="M4 21h16"/>'),
  attack: svg('<path d="M4 20L16 8l1-4 4-1-1 4-4 1L4 20"/><path d="M20 20L8 8 7 4 3 3l1 4 4 1 12 12"/>'),
  stop: svg('<rect x="6" y="6" width="12" height="12" rx="1"/>'),
  cancel: svg('<path d="M6 6l12 12M18 6L6 18"/>'),
  wake: svg('<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"/>'),
  consecrate: svg('<path d="M12 3v18M6 9h12"/><path d="M4 21h16"/>'),
  offer: svg('<path d="M4 12c0-3 3-4 4-2 1-2 4-1 4 2 0 3-4 6-4 6s-4-3-4-6z"/><path d="M14 4l2 2 4-4"/><path d="M3 20h18"/>'),
  mend: svg('<path d="M4 20c4-8 8-8 12-16"/><path d="M8 20c2-4 4-6 8-10"/><path d="M14 5l5 5"/>'),
  sight: svg('<path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'),
  ward: svg('<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 4v2M12 18v2M4 12h2M18 12h2"/>'),
  menu: svg('<path d="M4 7h16M4 12h16M4 17h16"/>'),
  sound: svg('<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/>'),
  mute: svg('<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16 9l5 6M21 9l-5 6"/>'),
};
