/**
 * Geometry kit for painted characters.
 *
 * Every part is a low-poly loft ("rings": a stack of elliptical sections, 8–10 radial)
 * with clean UVs: u runs once around, seam at the back (-Z), v runs from the FIRST
 * section (top) to the last (bottom). `uv(geo, region)` then packs those 0..1 UVs into a
 * named rectangle of the character's painted atlas, so a limb, a helmet and a boot each
 * pick their own patch of one texture and the whole unit is one material.
 *
 * Sections are authored top to bottom, y descending.
 */
export function createKit(THREE, painter) {
  const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
  const map = painter.texture();
  const PAD = 2;   // texels of inset per region edge, so mipmaps do not bleed the neighbour in

  const mats = {};
  /** One painted material per colour; the loader merges everything sharing the map. */
  function material(name = 'painted', color = 0xffffff, extra = {}) {
    const key = name + color + (extra.side || 0) + (extra.emissive || '');
    if (!mats[key]) { mats[key] = new THREE.MeshStandardMaterial({ map, color, roughness: 0.9, metalness: 0, ...extra }); mats[key].name = name; }
    return mats[key];
  }
  const paint = material('painted');
  const team = material('painted', 0xc0282d);          // the loader swaps this hex for the clan colour
  const paint2 = material('painted', 0xffffff, { side: THREE.DoubleSide });
  const team2 = material('painted', 0xc0282d, { side: THREE.DoubleSide });

  function joint(parent, x, y, z) { const o = new THREE.Object3D(); o.position.set(x, y, z); parent.add(o); return o; }

  /** sections: [{y, rx, rz, x?, z?, tilt?}] top to bottom. */
  function rings(sections, radial = 10, { capTop = false, capBottom = false, phase = 0 } = {}) {
    const pos = [], nor = [], uvs = [], idx = [];
    const n = sections.length;
    for (let j = 0; j < n; j++) {
      const s = sections[j], v = 1 - j / (n - 1);
      for (let i = 0; i <= radial; i++) {
        const u = i / radial, a = Math.PI + u * Math.PI * 2 + phase;
        pos.push((s.x || 0) + Math.sin(a) * s.rx, s.y + (s.tilt || 0) * Math.cos(a), (s.z || 0) + Math.cos(a) * s.rz);
        nor.push(Math.sin(a) / s.rx, 0, Math.cos(a) / s.rz);
        uvs.push(u, v);
      }
    }
    for (let j = 0; j < n - 1; j++) for (let i = 0; i < radial; i++) {
      const a = j * (radial + 1) + i, b = a + radial + 1;
      idx.push(a, b, a + 1, a + 1, b, b + 1);
    }
    const cap = (si, top) => {
      const s = sections[si], centre = pos.length / 3;
      pos.push(s.x || 0, s.y, s.z || 0); nor.push(0, top ? 1 : -1, 0); uvs.push(0.5, top ? 1 : 0);
      const start = si * (radial + 1);
      for (let i = 0; i < radial; i++) top ? idx.push(centre, start + i, start + i + 1) : idx.push(centre, start + i + 1, start + i);
    };
    if (capBottom) cap(n - 1, false);
    if (capTop) cap(0, true);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  }

  /**
   * A loft along an arbitrary path (bodies, necks, legs, antlers): sections [{p:[x,y,z], rx, ry}]
   * with rx across (sideways) and ry along the local up. u wraps once around with the seam on the
   * underside, v = 1 at the first section. Frames use `up` as the reference (default +Y).
   */
  function sweep(sections, radial = 8, { capStart = false, capEnd = false, up = [0, 1, 0] } = {}) {
    const pos = [], uvs = [], idx = [], n = sections.length;
    const ref = V(...up).normalize(), pts = sections.map((s) => V(...s.p));
    for (let j = 0; j < n; j++) {
      const t = (j === 0 ? pts[1].clone().sub(pts[0]) : j === n - 1 ? pts[n - 1].clone().sub(pts[n - 2]) : pts[j + 1].clone().sub(pts[j - 1])).normalize();
      let side = V().crossVectors(ref, t); if (side.lengthSq() < 1e-6) side = V().crossVectors(V(1, 0, 0), t);
      side.normalize();
      const upv = V().crossVectors(t, side).normalize();
      const s = sections[j], v = 1 - j / (n - 1);
      for (let i = 0; i <= radial; i++) {
        const u = i / radial, a = -Math.PI / 2 + u * Math.PI * 2;
        const q = pts[j].clone().addScaledVector(side, Math.cos(a) * s.rx).addScaledVector(upv, Math.sin(a) * (s.ry ?? s.rx));
        pos.push(q.x, q.y, q.z); uvs.push(u, v);
      }
    }
    for (let j = 0; j < n - 1; j++) for (let i = 0; i < radial; i++) {
      const a = j * (radial + 1) + i, b = a + radial + 1;
      idx.push(a, a + 1, b, a + 1, b + 1, b);
    }
    const cap = (si, start) => {
      const c = pts[si], centre = pos.length / 3;
      pos.push(c.x, c.y, c.z); uvs.push(0.5, start ? 1 : 0);
      const st = si * (radial + 1);
      for (let i = 0; i < radial; i++) start ? idx.push(centre, st + i + 1, st + i) : idx.push(centre, st + i, st + i + 1);
    };
    if (capStart) cap(0, true);
    if (capEnd) cap(n - 1, false);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  }

  /** Ellipsoid as a loft (poles closed with tiny rings, so UVs stay a clean cylinder wrap). */
  function blob(rx, ry, rz, radial = 10, vertical = 6, { squash = 0, shift = 0 } = {}) {
    const ss = [];
    for (let j = 0; j <= vertical; j++) {
      const t = j / vertical, a = Math.PI / 2 - t * Math.PI, ca = Math.cos(a), sa = Math.sin(a);
      ss.push({ y: sa * ry, rx: Math.max(0.004, ca * rx * (1 + squash * sa)), rz: Math.max(0.004, ca * rz * (1 + squash * sa)), z: shift * ca });
    }
    return rings(ss, radial, { capTop: true, capBottom: true });
  }

  /** Limb from a list of [rx, rz, x?, z?] widths spaced evenly over `length` downward. */
  function limb(length, widths, radial = 8, opts) {
    return rings(widths.map((w, i) => ({ y: -length * i / (widths.length - 1), rx: w[0], rz: w[1], x: w[2] || 0, z: w[3] || 0 })), radial, { capBottom: true, ...opts });
  }

  /** A flat panel (cloth flap, blade, plate): extruded outline, UVs projected from its bounding box. */
  function plate(outline, depth = 0.02, { bevel = false, curveSegments = 4 } = {}) {
    const shape = new THREE.Shape();
    outline.forEach(([x, y], i) => (i ? shape.lineTo(x, y) : shape.moveTo(x, y)));
    shape.closePath();
    const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: bevel, bevelThickness: depth * 0.4, bevelSize: depth * 0.4, bevelSegments: 1, curveSegments });
    g.translate(0, 0, -depth / 2);
    projectUV(g);
    return g;
  }

  /** A hanging cloth sheet (cape, apron): width x length grid, sagging in z. */
  function sheet(width, length, { rows = 6, cols = 6, sag = 0.08, wave = 0.02, taper = 0.1 } = {}) {
    const g = new THREE.PlaneGeometry(width, length, cols, rows), p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const u = p.getX(i) / width + 0.5, t = 0.5 - p.getY(i) / length;   // t: 0 top, 1 bottom
      p.setXYZ(i, p.getX(i) * (1 + taper * t), -t * length, -Math.sin(t * Math.PI) * sag - Math.cos(u * Math.PI * 3) * wave * t);
    }
    g.computeVertexNormals();
    return g;
  }

  /**
   * A flat ribbon streaming from the origin along `dir` with a travelling wave along `wave`;
   * u across, v along the length (v = 1 at the root).
   */
  function ribbon(len, w, dir, wave, amp, phase = 0, segs = 7) {
    const g = new THREE.PlaneGeometry(w, len, 1, segs), p = g.attributes.position;
    const d = V(...dir).normalize(), wv = V(...wave).normalize();
    const side = V().crossVectors(d, wv).normalize(), q = V();
    for (let i = 0; i < p.count; i++) {
      const t = (len / 2 - p.getY(i)) / len, sx = p.getX(i);
      q.copy(d).multiplyScalar(t * len).addScaledVector(wv, Math.sin(t * Math.PI * 2.2 + phase) * amp * t).addScaledVector(side, sx * (1 - 0.3 * t));
      p.setXYZ(i, q.x, q.y, q.z);
    }
    g.computeVertexNormals();
    return g;
  }

  /** Flute a skirt-like loft: the radius swells with a wave around the axis, more toward the hem (y = bot). */
  function flute(g, top, bot, amp = 0.09, k = 7, twist = 0.35) {
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i), t = Math.min(1, Math.max(0, (top - y) / (top - bot)));
      const a = Math.atan2(x, z) + twist * t, f = 1 + amp * t * t * Math.sin(k * a);
      p.setXYZ(i, x * f, y, z * f);
    }
    g.computeVertexNormals();
    return g;
  }

  /** Replace UVs with an XY projection of the geometry's own bounding box. */
  function projectUV(g, axes = 'xy') {
    g.computeBoundingBox();
    const b = g.boundingBox, size = b.getSize(V()), p = g.attributes.position, uv = new Float32Array(p.count * 2);
    const ax = axes[0], ay = axes[1];
    for (let i = 0; i < p.count; i++) {
      const q = V().fromBufferAttribute(p, i);
      uv[i * 2] = (q[ax] - b.min[ax]) / (size[ax] || 1);
      uv[i * 2 + 1] = (q[ay] - b.min[ay]) / (size[ay] || 1);
    }
    g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    return g;
  }

  /**
   * Pack a geometry's 0..1 UVs into an atlas region. `region` is a name from the painter
   * or [x, y, w, h] in texels. u/v sub-window lets a part use only a slice of the region.
   */
  function uv(g, region, { u0 = 0, u1 = 1, v0 = 0, v1 = 1, rotate = false } = {}) {
    const r = Array.isArray(region) ? region : painter.rects[region];
    if (!r) throw new Error('no atlas region: ' + region);
    const S = painter.size, [x, y, w, h] = r;
    const a = g.attributes.uv;
    if (!a) { projectUV(g); return uv(g, region, { u0, u1, v0, v1, rotate }); }
    for (let i = 0; i < a.count; i++) {
      let u = Math.min(1, Math.max(0, a.getX(i))), v = Math.min(1, Math.max(0, a.getY(i)));
      if (rotate) [u, v] = [v, 1 - u];
      u = u0 + u * (u1 - u0); v = v0 + v * (v1 - v0);
      a.setXY(i, (x + PAD + u * (w - PAD * 2)) / S, 1 - (y + PAD + (1 - v) * (h - PAD * 2)) / S);
    }
    a.needsUpdate = true;
    return g;
  }

  /** Add a mesh: geometry already UV-packed, or pass `region` to pack it here. */
  function add(parent, g, region, { mat = paint, pos = [0, 0, 0], rot = [0, 0, 0], scale = 1, uvOpts } = {}) {
    if (region) uv(g, region, uvOpts);
    const m = new THREE.Mesh(g, mat);
    m.position.set(...pos); m.rotation.set(...rot);
    if (Array.isArray(scale)) m.scale.set(...scale); else m.scale.setScalar(scale);
    parent.add(m);
    return m;
  }

  /** Rotate a held-item joint so its local frame is the given world Euler, whatever the arm pose is. */
  function holdLevel(root, parentJoint, pos, euler) {
    const h = joint(parentJoint, ...pos);
    root.updateMatrixWorld(true);
    const q = new THREE.Quaternion(); parentJoint.getWorldQuaternion(q);
    h.quaternion.copy(q.invert()).multiply(new THREE.Quaternion().setFromEuler(euler));
    return h;
  }

  /** Ground the group at y = 0 and centre it on x/z, moving children (the root stays at origin). */
  function finish(g, joints) {
    g.updateMatrixWorld(true);
    const bb = new THREE.Box3(), v = V();
    g.traverse((n) => {
      const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
      for (let i = 0; i < p.count; i++) bb.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(n.matrixWorld));
    });
    const c = bb.getCenter(V());
    g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= bb.min.y; o.position.z -= c.z; });
    g.userData.joints = joints;
    return g;
  }

  return { V, map, paint, team, paint2, team2, material, joint, rings, sweep, blob, limb, plate, sheet, ribbon, flute, projectUV, uv, add, holdLevel, finish };
}
