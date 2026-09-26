/**
 * In-mission dialogue with model close-ups (blueprint §20, option A): a bust of the speaker's
 * real 3D model rendered to a small texture, a name, and a short subtitle. Lines queue, advance
 * on click / Space / Enter, or by themselves after a few seconds. Gameplay keeps running; the
 * lines say what changed and where to look, nothing longer.
 */
import { makeUnitModel, portrait } from './models.js';
import { UNITS, TEAM } from './config.js';
import { sfx } from './audio.js';

const $ = (id) => document.getElementById(id);

export class Dialogue {
  constructor(renderer) {
    this.renderer = renderer;
    this.queue = []; this.current = null; this.t = 0;
    this.portraits = new Map();
    this.speakers = {};
    this.el = $('dlg');
    this.onAdvance = () => this.advance();
    this.el.addEventListener('pointerup', (e) => { e.stopPropagation(); this.advance(); });
    addEventListener('keydown', (e) => { if (!this.current) return; if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); this.advance(); } });
  }

  /** speakers: { id: { name, title, ut, team, zoom, focusY } } */
  defineSpeakers(list) { for (const s of list) this.speakers[s.id] = s; }

  async portraitFor(id, size = 160) {
    const s = this.speakers[id]; if (!s) return '';
    const key = id + '@' + size;
    if (this.portraits.has(key)) return this.portraits.get(key);
    const def = UNITS[s.ut];
    const m = await makeUnitModel(def.asset, s.team ?? TEAM.PLAYER, def.height);
    const url = portrait(this.renderer, m.root, { size, yaw: s.yaw ?? 0.35, zoom: s.zoom ?? (s.ut === 'spirit' ? 1.5 : 2.6), focusY: s.focusY ?? 0.86 });
    this.portraits.set(key, url);
    return url;
  }
  async preload(ids) { for (const id of ids) await this.portraitFor(id); }

  /** say(who, text, { hold }) -> resolves when the line has been shown and advanced */
  say(who, text, opts = {}) {
    return new Promise((resolve) => { this.queue.push({ who, text, hold: opts.hold ?? Math.min(9, 2.4 + text.length * 0.045), resolve }); if (!this.current) this.next(); });
  }
  async next() {
    const line = this.queue.shift();
    if (!line) { this.current = null; this.el.classList.remove('on'); return; }
    this.current = line; this.t = line.hold;
    const s = this.speakers[line.who] || { name: line.who };
    $('dlgNameT').textContent = s.name || line.who;
    $('dlgTitle').textContent = s.title || '';
    $('dlgText').textContent = line.text;
    const url = await this.portraitFor(line.who);
    if (this.current === line) $('dlgPortrait').style.backgroundImage = url ? `url(${url})` : '';
    this.el.classList.add('on');
    sfx('click');
  }
  advance() { if (!this.current) return; const l = this.current; l.resolve(); this.next(); }
  skipAll() { while (this.queue.length) this.queue.shift().resolve(); this.advance(); }
  update(dt) { if (!this.current) return; this.t -= dt; if (this.t <= 0) this.advance(); }
  get busy() { return !!this.current; }
}
