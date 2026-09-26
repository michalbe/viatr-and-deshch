/**
 * Hand-painted texture atlases for characters, drawn on a canvas at load time.
 *
 * The look is early-2000s RTS (Warcraft III, classic WoW): a few hundred triangles, and
 * every bit of detail lives in one diffuse map with the lighting painted in: dark seams
 * where parts meet, specular streaks on iron, rim light on fur, folds on cloth, a face
 * with eyes and brows. Nothing here is a photo; it is brush strokes from a seeded RNG, so
 * there are still no image files in the game and the same seed paints the same atlas on
 * every machine.
 *
 * A painter owns one square canvas. An asset lays out named regions on it, paints each
 * with the brushes below, and maps its geometry into those regions with the char kit.
 *
 * Team colour: regions meant to take the clan colour are painted in GREYS (a luminance
 * map). The loader multiplies them by the clan colour through vertex colours, the same
 * team-colour-mask trick the era used.
 */
const TAU = Math.PI * 2;

export function mulberry(seed = 1) {
  let s = seed >>> 0 || 1;
  return () => { s = (s + 0x6d2b79f5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

const rgb = (n) => [(n >> 16) & 255, (n >> 8) & 255, n & 255];
/** hex number -> css, lightened (k > 0, toward white) or darkened (k < 0). */
export function tone(n, k = 0, a = 1) {
  const [r, g, b] = rgb(n);
  const f = (v) => (k >= 0 ? v + (255 - v) * k : v * (1 + k)) | 0;
  return a >= 1 ? `rgb(${f(r)},${f(g)},${f(b)})` : `rgba(${f(r)},${f(g)},${f(b)},${a})`;
}
export const GREY = 0xbdbdbd;   // base for team-colour regions

export function createPainter(THREE, size = 512, seed = 7, { tileable = false } = {}) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const c = canvas.getContext('2d');
  c.fillStyle = '#7a6a5a'; c.fillRect(0, 0, size, size);
  const rects = {};
  let rnd = mulberry(seed);

  /** Paint a named rectangle. fn gets a context translated and clipped to it. */
  function region(name, x, y, w, h, fn) {
    rects[name] = [x, y, w, h];
    c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip(); c.translate(x, y);
    rnd = mulberry(seed * 131 + x * 7 + y * 13 + w);
    fn(c, w, h);
    c.restore();
  }

  function texture() {
    const t = new THREE.CanvasTexture(canvas);
    if (tileable) t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    t.generateMipmaps = true;
    t.minFilter = THREE.LinearMipmapLinearFilter;
    t.magFilter = THREE.LinearFilter;
    return t;
  }

  /* ------------------------------------------------------------ primitive brushes */
  const fill = (w, h, col) => { c.fillStyle = col; c.fillRect(0, 0, w, h); };

  /** Gradient across the region: dir 'v' top->bottom, 'h' left->right, 'd' diagonal. */
  function grad(w, h, stops, dir = 'v', op = 'source-over') {
    const g = dir === 'v' ? c.createLinearGradient(0, 0, 0, h) : dir === 'h' ? c.createLinearGradient(0, 0, w, 0) : c.createLinearGradient(0, 0, w, h);
    for (const [t, col] of stops) g.addColorStop(t, col);
    c.save(); c.globalCompositeOperation = op; c.fillStyle = g; c.fillRect(0, 0, w, h); c.restore();
  }

  /** Baked occlusion: darken the edges. Strengths 0..1 per side. */
  function vignette(w, h, { top = 0, bottom = 0, left = 0, right = 0, col = '0,0,0' } = {}) {
    const side = (x0, y0, x1, y1, k) => {
      if (!k) return;
      const g = c.createLinearGradient(x0, y0, x1, y1);
      g.addColorStop(0, `rgba(${col},${k})`); g.addColorStop(1, `rgba(${col},0)`);
      c.fillStyle = g; c.fillRect(0, 0, w, h);
    };
    c.save(); c.globalCompositeOperation = 'multiply';
    side(0, 0, 0, h * 0.5, top); side(0, h, 0, h * 0.5, bottom); side(0, 0, w * 0.45, 0, left); side(w, 0, w * 0.55, 0, right);
    c.restore();
  }

  /** Soft painted highlight blob (screen). */
  function glow(x, y, r, col = '255,240,210', k = 0.5) {
    const g = c.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(${col},${k})`); g.addColorStop(1, `rgba(${col},0)`);
    c.save(); c.globalCompositeOperation = 'screen'; c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2); c.restore();
  }

  /** Painterly strokes: rounded lines with jitter. angle in radians, 0 = horizontal. */
  function strokes(w, h, { n = 60, len = 12, width = 3, angle = Math.PI / 2, jitter = 0.3, cols = ['rgba(255,255,255,0.15)'], op = 'source-over', taper = false } = {}) {
    c.save(); c.globalCompositeOperation = op; c.lineCap = 'round';
    const offs = tileable ? [[0, 0], [-w, 0], [w, 0], [0, -h], [0, h]] : [[0, 0]];
    for (let i = 0; i < n; i++) {
      const x = rnd() * w, y = rnd() * h, a = angle + (rnd() - 0.5) * jitter, l = len * (0.6 + rnd() * 0.8);
      c.strokeStyle = cols[(rnd() * cols.length) | 0]; c.lineWidth = width * (0.7 + rnd() * 0.6);
      const lw = c.lineWidth;
      for (const [ox, oy] of offs) {
        c.lineWidth = lw; c.beginPath(); c.moveTo(x + ox, y + oy); c.lineTo(x + ox + Math.cos(a) * l, y + oy + Math.sin(a) * l); c.stroke();
        if (taper) { c.lineWidth = lw * 0.45; c.beginPath(); c.moveTo(x + ox + Math.cos(a) * l * 0.8, y + oy + Math.sin(a) * l * 0.8); c.lineTo(x + ox + Math.cos(a) * l * 1.5, y + oy + Math.sin(a) * l * 1.5); c.stroke(); }
      }
    }
    c.restore();
  }

  /** Fine texture grain. */
  function speckle(w, h, { n = 400, size: s = 2, alpha = 0.12, light = true, dark = true } = {}) {
    for (let i = 0; i < n; i++) {
      const l = light && (!dark || rnd() < 0.5);
      c.fillStyle = l ? `rgba(255,245,220,${alpha})` : `rgba(20,10,5,${alpha})`;
      c.fillRect(rnd() * w, rnd() * h, s * (0.5 + rnd()), s * (0.5 + rnd()));
    }
  }

  /** Horizontal band with a dark seam above and a light rim below (belts, trims, hems). */
  function band(w, y, bh, col, { dark = 'rgba(0,0,0,0.45)', light = 'rgba(255,240,200,0.35)' } = {}) {
    c.fillStyle = col; c.fillRect(0, y, w, bh);
    c.fillStyle = dark; c.fillRect(0, y, w, Math.max(1, bh * 0.12)); c.fillRect(0, y + bh - Math.max(1, bh * 0.1), w, Math.max(1, bh * 0.1));
    c.fillStyle = light; c.fillRect(0, y + Math.max(1, bh * 0.14), w, Math.max(1, bh * 0.12));
  }

  /** A dark seam line with a light edge, any direction. */
  function seam(x0, y0, x1, y1, width = 2, { dark = 'rgba(0,0,0,0.5)', light = 'rgba(255,240,210,0.3)' } = {}) {
    c.lineCap = 'round';
    c.strokeStyle = dark; c.lineWidth = width; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
    c.strokeStyle = light; c.lineWidth = Math.max(1, width * 0.5); c.beginPath(); c.moveTo(x0 + 1, y0 + 1); c.lineTo(x1 + 1, y1 + 1); c.stroke();
  }

  function rivet(x, y, r, { base = 0x8a8f96 } = {}) {
    c.fillStyle = 'rgba(0,0,0,0.45)'; c.beginPath(); c.arc(x + r * 0.35, y + r * 0.4, r * 1.15, 0, TAU); c.fill();
    c.fillStyle = tone(base, -0.2); c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
    c.fillStyle = tone(base, 0.55); c.beginPath(); c.arc(x - r * 0.3, y - r * 0.3, r * 0.45, 0, TAU); c.fill();
  }

  /** Stitches along a line. */
  function stitches(x0, y0, x1, y1, { step = 6, len = 3, col = 'rgba(240,220,170,0.75)', shadow = 'rgba(0,0,0,0.35)' } = {}) {
    const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
    c.lineWidth = 1.5;
    for (let d = step * 0.5; d < L; d += step) {
      const x = x0 + dx * d / L, y = y0 + dy * d / L;
      c.strokeStyle = shadow; c.beginPath(); c.moveTo(x - nx * len + 1, y - ny * len + 1); c.lineTo(x + nx * len + 1, y + ny * len + 1); c.stroke();
      c.strokeStyle = col; c.beginPath(); c.moveTo(x - nx * len, y - ny * len); c.lineTo(x + nx * len, y + ny * len); c.stroke();
    }
  }

  /* ------------------------------------------------------------ material painters */

  /** Wool / linen with vertical folds. Team regions pass base = GREY. */
  function cloth(w, h, { base = 0xe6dcc3, folds = 5, depth = 0.5, sway = 0.35, hem = 0 } = {}) {
    fill(w, h, tone(base));
    grad(w, h, [[0, tone(base, 0.16)], [0.5, tone(base, 0)], [1, tone(base, -0.28)]]);
    const fw = w / folds;
    for (let i = 0; i < folds; i++) {
      const x = fw * (i + 0.5) + (rnd() - 0.5) * fw * 0.3, dx = (rnd() - 0.5) * fw * sway;
      // dark valley on one side, light ridge on the other, curving down the region
      for (let k = 0; k < 2; k++) {
        const g = c.createLinearGradient(x - fw * 0.5, 0, x + fw * 0.5, 0);
        g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.42, `rgba(0,0,0,${0.36 * depth})`); g.addColorStop(0.5, 'rgba(0,0,0,0)'); g.addColorStop(0.62, `rgba(255,250,235,${0.28 * depth})`); g.addColorStop(1, 'rgba(255,255,255,0)');
        c.fillStyle = g;
        c.beginPath(); c.moveTo(x - fw * 0.5, 0); c.lineTo(x + fw * 0.5, 0); c.lineTo(x + fw * 0.5 + dx, h); c.lineTo(x - fw * 0.5 + dx, h); c.closePath(); c.fill();
      }
    }
    speckle(w, h, { n: w * h / 90, alpha: 0.07 });
    if (hem) band(w, h - hem, hem, tone(base, -0.35));
  }

  /** Interlocking mail rings. */
  function mail(w, h, { base = 0x6f7479, ring = 4.2 } = {}) {
    fill(w, h, tone(base, -0.35));
    grad(w, h, [[0, tone(base, 0.12)], [0.55, tone(base, -0.1)], [1, tone(base, -0.45)]]);
    const dy = ring * 0.86, dx = ring * 1.15;
    let row = 0;
    for (let y = -ring; y < h + ring; y += dy, row++) for (let x = -ring + (row % 2) * dx * 0.5; x < w + ring; x += dx) {
      c.strokeStyle = 'rgba(15,12,10,0.7)'; c.lineWidth = ring * 0.32;
      c.beginPath(); c.ellipse(x, y, ring * 0.5, ring * 0.58, -0.35, 0, TAU); c.stroke();
      c.strokeStyle = 'rgba(235,240,245,0.55)'; c.lineWidth = ring * 0.16;
      c.beginPath(); c.ellipse(x - ring * 0.08, y - ring * 0.12, ring * 0.42, ring * 0.5, -0.35, Math.PI * 1.05, Math.PI * 1.85); c.stroke();
    }
    glow(w * 0.35, h * 0.25, w * 0.5, '220,230,240', 0.3);
    vignette(w, h, { bottom: 0.5, left: 0.25, right: 0.25 });
  }

  /** Plate iron: brushed, a painted specular band, dented, bevel-edged. */
  function iron(w, h, { base = 0x7c838a, bevel = 4, spec = 0.7, rust = 0.15, band: hb = 0.35 } = {}) {
    fill(w, h, tone(base));
    grad(w, h, [[0, tone(base, 0.1)], [hb - 0.12, tone(base, -0.02)], [hb, tone(base, 0.4)], [hb + 0.08, tone(base, 0.12)], [0.75, tone(base, -0.15)], [1, tone(base, -0.5)]], 'd');
    strokes(w, h, { n: w * h / 60, len: w * 0.35, width: 1.2, angle: 0.05, jitter: 0.08, cols: ['rgba(255,255,255,0.09)', 'rgba(0,0,0,0.13)'] });
    if (rust) strokes(w, h, { n: w * h / 250, len: 5, width: 3, angle: 1.2, jitter: 2, cols: [`rgba(120,60,20,${rust})`, `rgba(60,30,10,${rust})`] });
    if (spec) glow(w * 0.3, h * 0.28, w * 0.45, '255,250,235', spec * 0.3);
    if (bevel) {
      c.lineWidth = bevel; c.strokeStyle = 'rgba(0,0,0,0.55)'; c.strokeRect(bevel * 0.5, bevel * 0.5, w - bevel, h - bevel);
      c.lineWidth = Math.max(1, bevel * 0.5); c.strokeStyle = 'rgba(255,250,230,0.5)'; c.strokeRect(bevel * 1.2, bevel * 1.2, w - bevel * 2.4, h - bevel * 2.4);
    }
  }

  /** Worn leather with a light-catching grain. */
  function leather(w, h, { base = 0x6b4526, stitch = true, straps = 0 } = {}) {
    fill(w, h, tone(base));
    grad(w, h, [[0, tone(base, 0.22)], [0.45, tone(base, 0.02)], [1, tone(base, -0.4)]]);
    strokes(w, h, { n: w * h / 45, len: 6, width: 2, angle: 0.3, jitter: 1.4, cols: ['rgba(255,225,180,0.14)', 'rgba(20,8,0,0.22)'] });
    speckle(w, h, { n: w * h / 40, alpha: 0.1 });
    if (straps) for (let i = 1; i <= straps; i++) { const y = h * i / (straps + 1); band(w, y - 3, 7, tone(base, -0.3)); rivet(w * 0.5, y + 0.5, 2.2, { base: 0xb08a4a }); }
    if (stitch) { stitches(3, 3, w - 3, 3); stitches(3, h - 3, w - 3, h - 3); }
    vignette(w, h, { bottom: 0.35, left: 0.2, right: 0.2 });
  }

  /** Fur: layered tapered strokes, dark roots, light tips. */
  function fur(w, h, { base = 0x5a3b22, tip = 0.45, n = 0, down = true } = {}) {
    fill(w, h, tone(base, -0.45));
    const count = n || (w * h / 14);
    const a = down ? Math.PI / 2 : Math.PI / 2;
    strokes(w, h, { n: count, len: h * 0.22, width: 3.2, angle: a, jitter: 0.5, cols: [tone(base, -0.2), tone(base, 0.05)], taper: true });
    strokes(w, h, { n: count * 0.5, len: h * 0.18, width: 1.6, angle: a, jitter: 0.5, cols: [tone(base, tip), tone(base, tip * 0.6)], taper: true });
    vignette(w, h, { top: 0.35, bottom: 0.3 });
  }

  /** Hair: long strands along v. */
  function hair(w, h, { base = 0x3b2618, sheen = 0.35 } = {}) {
    fill(w, h, tone(base, -0.3));
    grad(w, h, [[0, tone(base, 0.05)], [0.45, tone(base, sheen)], [0.6, tone(base, 0)], [1, tone(base, -0.45)]]);
    strokes(w, h, { n: w * 1.6, len: h * 0.7, width: 2.2, angle: Math.PI / 2, jitter: 0.12, cols: [tone(base, -0.5), tone(base, 0.3, 0.7), tone(base, -0.2)] });
  }

  /** Wood grain along v. */
  function wood(w, h, { base = 0xa27a4f } = {}) {
    fill(w, h, tone(base));
    grad(w, h, [[0, tone(base, 0.2)], [0.5, tone(base, 0.02)], [1, tone(base, -0.45)]], 'h');
    strokes(w, h, { n: w * 1.2, len: h * 0.6, width: 1.4, angle: Math.PI / 2, jitter: 0.06, cols: [tone(base, -0.45, 0.6), tone(base, 0.25, 0.4)] });
    for (let i = 0; i < 2; i++) { const x = rnd() * w, y = rnd() * h; c.strokeStyle = tone(base, -0.5); c.lineWidth = 1.5; c.beginPath(); c.ellipse(x, y, 3, 6, 0, 0, TAU); c.stroke(); }
  }

  /** Bare skin with painted muscle / knuckle shading. */
  function skin(w, h, { base = 0xd9a07a, blush = 0.15 } = {}) {
    fill(w, h, tone(base));
    grad(w, h, [[0, tone(base, 0.2)], [0.5, tone(base, 0.02)], [1, tone(base, -0.35)]]);
    if (blush) { c.fillStyle = `rgba(200,80,60,${blush})`; c.fillRect(0, h * 0.4, w, h * 0.35); }
    speckle(w, h, { n: w * h / 80, alpha: 0.06 });
  }

  /**
   * A face on a head loft. The region wraps the whole head: u = 0 at the back, the face
   * centred at u = 0.5; v runs from the crown (top of region) to the chin (bottom).
   * eyeY, mouthY are fractions of h. The look is a Warcraft III grunt: heavy angular brows,
   * narrow eyes under a brow shadow, a broad nose, deep nasolabial shadows, lit cheekbones.
   */
  function face(w, h, { base = 0xd9a07a, hairCol = 0x3b2618, eye = 0x2a3a4a, brow = 1, eyeY = 0.5, mouthY = 0.78, eyeGap = 0.075, eyeW = 0.045, beard = 0, stern = 0.8, hairTop = 0, nose = 1, female = false, hairline = 0, moustache = 0, beardCol = null } = {}) {
    skin(w, h, { base, blush: 0 });
    const cx = w * 0.5, cy = (t) => h * t;
    const dark = (a) => `rgba(95,40,25,${a})`;
    // the face is a lit mask: sides and jaw fall into shadow, forehead and cheekbones catch light
    { const g = c.createLinearGradient(cx - w * 0.28, 0, cx + w * 0.28, 0); g.addColorStop(0, 'rgba(60,25,20,0.55)'); g.addColorStop(0.3, 'rgba(60,25,20,0)'); g.addColorStop(0.7, 'rgba(60,25,20,0)'); g.addColorStop(1, 'rgba(60,25,20,0.55)'); c.fillStyle = g; c.fillRect(0, 0, w, h); }
    glow(cx, cy(eyeY - 0.28), w * 0.13, '255,225,195', 0.35);
    glow(cx - w * 0.15, cy(eyeY + 0.17), w * 0.08, '255,215,185', 0.45); glow(cx + w * 0.15, cy(eyeY + 0.17), w * 0.08, '255,215,185', 0.45);
    // brow ridge: a shadow that the eyes sit in, deepest at the nose bridge
    { const k = female ? 0.4 : 1; const g = c.createRadialGradient(cx, cy(eyeY - 0.02), 0, cx, cy(eyeY - 0.02), w * 0.22); g.addColorStop(0, `rgba(70,28,20,${0.6 * k})`); g.addColorStop(0.5, `rgba(70,28,20,${0.35 * k})`); g.addColorStop(1, 'rgba(70,28,20,0)'); c.fillStyle = g; c.beginPath(); c.ellipse(cx, cy(eyeY - 0.01), w * 0.22, h * 0.1, 0, 0, TAU); c.fill(); }
    if (female) { c.fillStyle = 'rgba(220,90,90,0.22)'; for (const sg of [-1, 1]) { c.beginPath(); c.ellipse(cx + sg * w * 0.16, cy(eyeY + 0.2), w * 0.07, h * 0.07, 0, 0, TAU); c.fill(); } }
    // nose: broad wedge, dark sides and nostrils, lit bridge and tip
    if (nose) {
      const nw = w * (female ? 0.03 : 0.045), top = cy(eyeY - 0.02), tip = cy(eyeY + (female ? 0.13 : 0.2));
      c.fillStyle = dark(female ? 0.22 : 0.5); c.beginPath(); c.moveTo(cx - nw * 0.4, top); c.lineTo(cx + nw * 1.3, tip); c.lineTo(cx - nw * 1.3, tip); c.closePath(); c.fill();
      c.fillStyle = tone(base, 0.4); c.beginPath(); c.moveTo(cx, top + h * 0.02); c.lineTo(cx + nw * 0.45, tip - h * 0.03); c.lineTo(cx - nw * 0.45, tip - h * 0.03); c.closePath(); c.fill();
      c.fillStyle = tone(base, 0.55); c.beginPath(); c.ellipse(cx, tip - h * 0.03, nw * 0.8, h * 0.022, 0, 0, TAU); c.fill();
      c.fillStyle = 'rgba(50,15,10,0.7)'; c.beginPath(); c.ellipse(cx - nw * 1.0, tip - h * 0.005, nw * 0.5, h * 0.014, 0.4, 0, TAU); c.fill(); c.beginPath(); c.ellipse(cx + nw * 1.0, tip - h * 0.005, nw * 0.5, h * 0.014, -0.4, 0, TAU); c.fill();
      // nasolabial folds from the nostrils down past the mouth corners
      if (!female) { c.strokeStyle = dark(0.45); c.lineWidth = Math.max(2, h * 0.02); c.lineCap = 'round';
        for (const sg of [-1, 1]) { c.beginPath(); c.moveTo(cx + sg * nw * 1.5, tip); c.quadraticCurveTo(cx + sg * w * 0.11, cy(mouthY - 0.05), cx + sg * w * 0.09, cy(mouthY + 0.05)); c.stroke(); } }
    }
    // eyes: a narrow almond, dark lid line, a small bright iris, no white showing above
    for (const sg of [-1, 1]) {
      const ex = cx + sg * w * eyeGap, ey = cy(eyeY), ew = w * eyeW, eh = h * (female ? 0.03 : 0.02);
      c.fillStyle = female ? 'rgba(120,50,40,0.35)' : 'rgba(40,15,10,0.8)'; c.beginPath(); c.ellipse(ex, ey + eh * 0.4, ew * 1.35, eh * (female ? 1.6 : 2.4), 0, 0, TAU); c.fill();
      c.fillStyle = '#e9e0cf'; c.beginPath(); c.ellipse(ex, ey, ew, eh, 0, 0, TAU); c.fill();
      c.fillStyle = tone(eye, 0.1); c.beginPath(); c.arc(ex + sg * ew * 0.1, ey + eh * 0.05, eh * 0.95, 0, TAU); c.fill();
      c.fillStyle = '#0c0a0a'; c.beginPath(); c.arc(ex + sg * ew * 0.1, ey + eh * 0.1, eh * 0.5, 0, TAU); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.85)'; c.beginPath(); c.arc(ex + sg * ew * 0.1 - ew * 0.2, ey - eh * 0.3, eh * 0.25, 0, TAU); c.fill();
      c.strokeStyle = 'rgba(30,12,8,0.95)'; c.lineWidth = Math.max(2, h * (female ? 0.02 : 0.028)); c.lineCap = 'round';
      c.beginPath(); c.moveTo(ex - ew * 1.15, ey + eh * 0.1); c.quadraticCurveTo(ex, ey - eh * (female ? 1.6 : 2.1), ex + ew * (female ? 1.45 : 1.15), ey + eh * (female ? -0.35 : 0.1)); c.stroke();   // upper lid, heavy; lashes flick out on a woman
      c.strokeStyle = 'rgba(30,12,8,0.5)'; c.lineWidth = Math.max(1, h * 0.012);
      c.beginPath(); c.moveTo(ex - ew * 1.05, ey + eh * 0.3); c.quadraticCurveTo(ex, ey + eh * 1.6, ex + ew * 1.05, ey + eh * 0.3); c.stroke();   // lower lid
      if (brow) {
        // angular brow: thick at the nose, sweeping up and out, tilted down toward the nose when stern
        const inner = female ? [ex - sg * ew * 1.1, ey - eh * 3.0] : [ex - sg * ew * 1.0, ey - eh * (2.2 - stern * 1.6)];
        const peak = female ? [ex + sg * ew * 0.5, ey - eh * 4.6] : [ex + sg * ew * 0.6, ey - eh * 5.2], outer = female ? [ex + sg * ew * 1.9, ey - eh * 3.4] : [ex + sg * ew * 2.0, ey - eh * 3.2];
        c.strokeStyle = tone(hairCol, -0.15); c.lineWidth = h * 0.03 * brow; c.lineCap = 'round';
        c.beginPath(); c.moveTo(inner[0], inner[1]); c.quadraticCurveTo(peak[0], peak[1], outer[0], outer[1]); c.stroke();
        c.strokeStyle = tone(hairCol, 0.25, 0.7); c.lineWidth = h * 0.012 * brow;
        c.beginPath(); c.moveTo(inner[0] + 1, inner[1] - 2); c.quadraticCurveTo(peak[0], peak[1] - 3, outer[0], outer[1] - 2); c.stroke();
      }
    }
    // mouth: a hard dark line turned down, shadow under the lower lip
    c.strokeStyle = 'rgba(60,20,15,0.9)'; c.lineWidth = Math.max(2, h * 0.022); c.lineCap = 'round';
    c.beginPath(); c.moveTo(cx - w * 0.065, cy(mouthY)); c.quadraticCurveTo(cx, cy(mouthY + 0.03 - stern * 0.05), cx + w * 0.065, cy(mouthY)); c.stroke();
    if (female) {
      c.fillStyle = 'rgba(170,60,70,0.7)'; c.beginPath(); c.moveTo(cx - w * 0.06, cy(mouthY)); c.quadraticCurveTo(cx - w * 0.03, cy(mouthY - 0.035), cx, cy(mouthY - 0.02)); c.quadraticCurveTo(cx + w * 0.03, cy(mouthY - 0.035), cx + w * 0.06, cy(mouthY)); c.quadraticCurveTo(cx, cy(mouthY + 0.06), cx - w * 0.06, cy(mouthY)); c.closePath(); c.fill();
      c.fillStyle = 'rgba(255,200,200,0.35)'; c.beginPath(); c.ellipse(cx, cy(mouthY + 0.025), w * 0.03, h * 0.012, 0, 0, TAU); c.fill();
    }
    c.fillStyle = dark(0.35); c.beginPath(); c.ellipse(cx, cy(mouthY + 0.07), w * 0.05, h * 0.02, 0, 0, TAU); c.fill();
    if (moustache) {
      const hc = beardCol || hairCol;
      c.strokeStyle = tone(hc, -0.15); c.lineWidth = h * 0.045 * moustache; c.lineCap = 'round';
      c.beginPath(); c.moveTo(cx - w * 0.13, cy(mouthY + 0.06)); c.quadraticCurveTo(cx - w * 0.06, cy(mouthY - 0.09), cx, cy(mouthY - 0.05)); c.quadraticCurveTo(cx + w * 0.06, cy(mouthY - 0.09), cx + w * 0.13, cy(mouthY + 0.06)); c.stroke();
      c.strokeStyle = tone(hc, 0.35, 0.6); c.lineWidth = h * 0.012; c.beginPath(); c.moveTo(cx - w * 0.1, cy(mouthY + 0.02)); c.quadraticCurveTo(cx - w * 0.05, cy(mouthY - 0.09), cx, cy(mouthY - 0.06)); c.stroke();
    }
    // beard: strokes from below the cheekbones down over the jaw
    if (beard) {
      c.save(); c.beginPath(); c.moveTo(cx - w * 0.3, cy(eyeY + 0.2)); c.quadraticCurveTo(cx - w * 0.32, h, cx - w * 0.12, h); c.lineTo(cx + w * 0.12, h); c.quadraticCurveTo(cx + w * 0.32, h, cx + w * 0.3, cy(eyeY + 0.2));
      c.quadraticCurveTo(cx + w * 0.15, cy(mouthY - 0.05), cx, cy(mouthY - 0.02)); c.quadraticCurveTo(cx - w * 0.15, cy(mouthY - 0.05), cx - w * 0.3, cy(eyeY + 0.2)); c.closePath(); c.clip();
      const bc = beardCol || hairCol;
      fill(w, h, tone(bc, -0.2));
      strokes(w, h, { n: w * 3, len: h * 0.3, width: 2.4, angle: Math.PI / 2, jitter: 0.5, cols: [tone(bc, -0.5), tone(bc, 0.25), tone(bc, 0.5, 0.6)], taper: true });
      c.restore();
      c.strokeStyle = tone(bc, -0.1); c.lineWidth = h * 0.04; c.beginPath(); c.moveTo(cx - w * 0.11, cy(mouthY + 0.03)); c.quadraticCurveTo(cx, cy(mouthY - 0.1), cx + w * 0.11, cy(mouthY + 0.03)); c.stroke();
    }
    if (hairline) {
      c.save(); c.beginPath(); c.moveTo(0, 0); c.lineTo(w, 0); c.lineTo(w, h * hairline);
      for (let x = w; x >= 0; x -= w / 16) c.quadraticCurveTo(x - w / 32, h * hairline + (Math.abs(x - cx) < w * 0.22 ? h * 0.05 : -h * 0.02), x - w / 16, h * hairline);
      c.closePath(); c.clip();
      hair(w, h, { base: hairCol, sheen: 0.45 });
      c.strokeStyle = tone(hairCol, -0.5); c.lineWidth = 2; c.beginPath(); c.moveTo(cx, 0); c.lineTo(cx, h * hairline * 1.2); c.stroke();
      c.restore();
    }
    // hair around the back and sides (everything outside the face band)
    if (hairTop) {
      c.save(); c.beginPath(); c.rect(0, 0, w * 0.28, h); c.rect(w * 0.72, 0, w * 0.28, h); c.clip();
      hair(w, h, { base: hairCol }); c.restore();
    }
    vignette(w, h, { bottom: 0.45, left: 0.3, right: 0.3 });
  }

  /* ------------------------------------------------------------ building and nature painters (tileable) */

  /** Thatch: one course per tile. Straw strokes running down, a deep shadow under the course above, a lit lower edge. */
  function thatch(w, h, { base = 0x8a6a3a, courses = 1 } = {}) {
    fill(w, h, tone(base, -0.3));
    const ch = h / courses;
    for (let j = 0; j < courses; j++) {
      const y0 = j * ch;
      c.save(); c.beginPath(); c.rect(0, y0, w, ch); c.clip();
      strokes(w, h, { n: w * 1.8, len: ch * 0.9, width: 2.6, angle: Math.PI / 2, jitter: 0.16, cols: [tone(base, -0.45), tone(base, 0.05), tone(base, 0.3), tone(base, -0.15)] });
      strokes(w, h, { n: w * 0.6, len: ch * 0.6, width: 1.4, angle: Math.PI / 2, jitter: 0.2, cols: [tone(base, 0.55, 0.7), tone(base, -0.6, 0.7)] });
      c.restore();
      grad(w, h, [[y0 / h, 'rgba(0,0,0,0.55)'], [(y0 + ch * 0.35) / h, 'rgba(0,0,0,0)'], [(y0 + ch * 0.9) / h, 'rgba(255,240,200,0)'], [(y0 + ch * 0.97) / h, 'rgba(255,240,200,0.25)'], [(y0 + ch) / h, 'rgba(0,0,0,0.3)']]);
    }
  }

  /** Planks: vertical boards with dark gaps, grain, a knot or two, nails at the ends. */
  function planks(w, h, { base = 0xa27a4f, count = 4, vertical = true, nails = true } = {}) {
    fill(w, h, tone(base, -0.5));
    const pw = (vertical ? w : h) / count;
    for (let i = 0; i < count; i++) {
      const k = (rnd() - 0.5) * 0.24;
      c.save(); c.beginPath();
      if (vertical) c.rect(i * pw + 1.5, 0, pw - 3, h); else c.rect(0, i * pw + 1.5, w, pw - 3);
      c.clip();
      fill(w, h, tone(base, k));
      strokes(w, h, { n: w * 1.2, len: (vertical ? h : w) * 0.5, width: 1.3, angle: vertical ? Math.PI / 2 : 0, jitter: 0.05, cols: [tone(base, k - 0.35, 0.7), tone(base, k + 0.25, 0.5)] });
      if (rnd() < 0.6) { const kx = vertical ? i * pw + pw * (0.3 + rnd() * 0.4) : rnd() * w, ky = vertical ? rnd() * h : i * pw + pw * (0.3 + rnd() * 0.4); c.strokeStyle = tone(base, -0.55); c.lineWidth = 1.5; c.beginPath(); c.ellipse(kx, ky, 2.5, 4.5, vertical ? 0 : Math.PI / 2, 0, TAU); c.stroke(); }
      // lit edge on one side of each board, shadow on the other
      const gx = vertical ? c.createLinearGradient(i * pw, 0, (i + 1) * pw, 0) : c.createLinearGradient(0, i * pw, 0, (i + 1) * pw);
      gx.addColorStop(0, 'rgba(255,240,210,0.22)'); gx.addColorStop(0.15, 'rgba(255,240,210,0)'); gx.addColorStop(0.85, 'rgba(0,0,0,0)'); gx.addColorStop(1, 'rgba(0,0,0,0.4)');
      c.fillStyle = gx; c.fillRect(0, 0, w, h);
      c.restore();
      if (nails) for (const t of [0.08, 0.92]) rivet(vertical ? i * pw + pw / 2 : t * w, vertical ? t * h : i * pw + pw / 2, 2, { base: 0x5a5a60 });
    }
  }

  /** Wattle-and-daub: warm plaster, mottled, a few cracks, straw flecks. */
  function daub(w, h, { base = 0xd8cdb0 } = {}) {
    fill(w, h, tone(base));
    strokes(w, h, { n: w * h / 30, len: 8, width: 5, angle: 0.4, jitter: 3, cols: [tone(base, 0.12, 0.5), tone(base, -0.12, 0.5)] });
    speckle(w, h, { n: w * h / 25, alpha: 0.08 });
    strokes(w, h, { n: w * h / 400, len: 5, width: 1.2, angle: 0.3, jitter: 1, cols: [tone(0xc98a2b, -0.1, 0.5)] });
    for (let i = 0; i < 3; i++) {
      let x = rnd() * w, y = rnd() * h; c.strokeStyle = 'rgba(60,40,20,0.55)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(x, y);
      for (let k = 0; k < 5; k++) { x += (rnd() - 0.5) * 14; y += 6 + rnd() * 8; c.lineTo(x, y); }
      c.stroke();
    }
  }

  /** Dry-stone wall: rows of rounded blocks, dark mortar, each block lit from the top-left. */
  function stonewall(w, h, { base = 0x8d8a80, rows = 4, mortar = 0x3a3733 } = {}) {
    fill(w, h, tone(mortar));
    const rh = h / rows;
    for (let j = 0; j < rows; j++) {
      let x = -(rnd() * rh); const y = j * rh;
      while (x < w) {
        const bw = rh * (1.2 + rnd() * 1.4), k = (rnd() - 0.5) * 0.3;
        for (const ox of [0, w, -w]) {
          const bx = x + ox; if (bx > w || bx + bw < 0) continue;
          c.fillStyle = tone(base, k); c.beginPath(); c.roundRect(bx + 1.5, y + 1.5, bw - 3, rh - 3, rh * 0.25); c.fill();
          const g = c.createLinearGradient(bx, y, bx + bw, y + rh); g.addColorStop(0, 'rgba(255,245,225,0.35)'); g.addColorStop(0.5, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.45)');
          c.fillStyle = g; c.beginPath(); c.roundRect(bx + 1.5, y + 1.5, bw - 3, rh - 3, rh * 0.25); c.fill();
        }
        x += bw;
      }
    }
    speckle(w, h, { n: w * h / 40, alpha: 0.1 });
  }

  /** Rough bark: deep vertical grooves and lit ridges. */
  function bark(w, h, { base = 0x4a3322 } = {}) {
    fill(w, h, tone(base));
    strokes(w, h, { n: w * 2.5, len: h * 0.5, width: 2.5, angle: Math.PI / 2, jitter: 0.12, cols: [tone(base, -0.6, 0.8), tone(base, 0.3, 0.5), tone(base, -0.3)] });
    strokes(w, h, { n: w * 0.4, len: h * 0.25, width: 4, angle: Math.PI / 2, jitter: 0.2, cols: ['rgba(0,0,0,0.5)'] });
    speckle(w, h, { n: w * h / 50, alpha: 0.08 });
  }

  /** Pine needles / dense foliage: layered short strokes, dark underneath, lit tips. */
  function needles(w, h, { base = 0x2f4f2c, dark = 0x223b22, light = 0.45 } = {}) {
    fill(w, h, tone(dark, -0.3));
    strokes(w, h, { n: w * h / 14, len: 9, width: 2.4, angle: Math.PI / 2 + 0.3, jitter: 1.4, cols: [tone(dark, 0.05), tone(base, -0.1), tone(base, 0.1)], taper: true });
    strokes(w, h, { n: w * h / 30, len: 7, width: 1.6, angle: Math.PI / 2 + 0.3, jitter: 1.4, cols: [tone(base, light), tone(base, light * 0.6)], taper: true });
  }

  /** Leafy crown: round dabs, lit on top. */
  function leaves(w, h, { base = 0x6f8f3a, dark = 0x3f5f2a } = {}) {
    fill(w, h, tone(dark, -0.2));
    const offs = tileable ? [[0, 0], [-w, 0], [w, 0], [0, -h], [0, h]] : [[0, 0]];
    for (let i = 0; i < w * h / 40; i++) {
      const x = rnd() * w, y = rnd() * h, r = 3 + rnd() * 4, k = (rnd() - 0.5) * 0.5;
      for (const [ox, oy] of offs) { c.fillStyle = tone(base, k); c.beginPath(); c.arc(x + ox, y + oy, r, 0, TAU); c.fill(); c.fillStyle = tone(base, k + 0.35, 0.7); c.beginPath(); c.arc(x + ox - r * 0.3, y + oy - r * 0.3, r * 0.45, 0, TAU); c.fill(); }
    }
  }

  /** Grass / reed blades: vertical strokes, pale tips. */
  function blades(w, h, { base = 0x6f8f3a, dark = 0x3f5f2a } = {}) {
    fill(w, h, tone(dark));
    grad(w, h, [[0, tone(base, 0.15)], [0.6, tone(base, 0)], [1, tone(dark, -0.3)]]);
    strokes(w, h, { n: w * 2.5, len: h * 0.6, width: 2, angle: Math.PI / 2, jitter: 0.15, cols: [tone(dark, -0.2, 0.8), tone(base, 0.2, 0.6), tone(base, 0.4, 0.5)] });
  }

  /** Still water: deep blue with painted caustic ripples and a highlight. */
  function water(w, h, { base = 0x4f8fb0 } = {}) {
    fill(w, h, tone(base, -0.2));
    grad(w, h, [[0, tone(base, 0.25)], [0.5, tone(base, -0.1)], [1, tone(base, -0.45)]]);
    for (let i = 0; i < 12; i++) { c.strokeStyle = tone(base, 0.55, 0.5); c.lineWidth = 1.5; c.beginPath(); c.ellipse(rnd() * w, rnd() * h, 6 + rnd() * 14, 2 + rnd() * 4, 0, 0, TAU); c.stroke(); }
    glow(w * 0.35, h * 0.3, w * 0.3, '255,255,255', 0.5);
  }

  /** Weathered bone / antler. */
  function bone(w, h, { base = 0xe0cfa8 } = {}) {
    fill(w, h, tone(base, -0.1));
    grad(w, h, [[0, tone(base, 0.3)], [0.5, tone(base, -0.05)], [1, tone(base, -0.45)]], 'h');
    strokes(w, h, { n: w, len: h * 0.4, width: 1.5, angle: Math.PI / 2, jitter: 0.1, cols: [tone(base, -0.5, 0.5), tone(base, 0.4, 0.5)] });
  }

  return { canvas, size, rects, region, texture, rnd: () => rnd(), thatch, planks, daub, stonewall, bark, needles, leaves, blades, water, bone, fill, grad, vignette, glow, strokes, speckle, band, seam, rivet, stitches, cloth, mail, iron, leather, fur, hair, wood, skin, face, tone };
}
