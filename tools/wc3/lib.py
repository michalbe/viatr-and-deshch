"""
Warcraft III-style character pipeline, run inside headless Blender.

A character recipe describes a stick skeleton with radii (turned into ONE welded low-poly mesh
by the Skin modifier plus one Catmull-Clark level), extra parts (garments, hair, weapons) as
lathes / boxes / spheres, a bone list, and an atlas layout of named regions. This module turns
that into a rigged, animated mesh, unwraps every region into its rectangle of the atlas, bakes
ambient occlusion into a vertex colour (r = AO, g = team-colour mask) and exports a GLB with the
clips sampled from the same gait system the game uses procedurally.

Coordinates in recipes are the game's (Three.js): Y up, character faces +Z, its LEFT is +X.
Blender is Z up and faces -Y; the glTF exporter maps Blender (x, y, z) -> (x, z, -y), so a
recipe point (x, y, z) is placed in Blender at (x, -z, y).
"""
import bpy, bmesh, math, json, os
from mathutils import Vector, Matrix

# ------------------------------------------------------------------ coordinate helpers
def T2B(p): return Vector((p[0], -p[2], p[1]))
def B2T(v): return (v.x, v.z, -v.y)
def rotT2B(x, y, z):
    """a Three.js Euler (XYZ order, R = Rx Ry Rz) as a Blender armature-space matrix"""
    return Matrix.Rotation(x, 4, 'X') @ Matrix.Rotation(y, 4, 'Z') @ Matrix.Rotation(-z, 4, 'Y')
def lerp(a, b, t): return a + (b - a) * t
def smooth(t): t = max(0.0, min(1.0, t)); return t * t * (3 - 2 * t)

# ------------------------------------------------------------------ the recipe model
class Part:
    """one piece of geometry: verts (Blender coords), faces (vertex index lists), a region per
    face, and how it binds to bones: fixed bone name, or 'auto' with an optional bone whitelist"""
    def __init__(self, name, verts, faces, region, bind='auto', bones=None, uv='cyl', smooth=True, flip=False):
        self.name, self.verts, self.faces, self.region = name, verts, faces, region
        self.bind, self.bones, self.uv, self.smooth, self.flip = bind, bones, uv, smooth, flip
        self.face_regions = None    # optional per-face region override
        self.prop = False           # weapons and the like: not counted in the body height

class Recipe:
    def __init__(self, name, atlas=512, seed=1):
        self.name, self.atlas, self.seed = name, atlas, seed
        self.sk_verts = []          # [{pos(Three), r, region, root}]
        self.sk_edges = []
        self.bones = {}             # name -> {head(Three), tail(Three), parent}
        self.bone_order = []
        self.parts = []
        self.layout = {}            # region -> (x, y, w, h) in atlas pixels, y from the top
        self.uv_modes = {}          # region -> 'cyl' | 'front' | 'top' | 'side' | 'polar' | 'planar'
        self.height = 1.8
        self.gait = 'default'
        self.kind = 'humanoid'
        self.clips = None           # None = the standard set for the kind
        self.sub = 1
        self.decimate = 0             # >0: collapse ratio applied after subdivision (fat bodies use sub=2 + decimate)
        self.skin_smooth = 0.4
        self.region_bones = {}      # region -> bone whitelist for auto binding
        self.props = {}             # extra json metadata
    # skeleton
    def sv(self, pos, r, region, root=False):
        self.sk_verts.append({'pos': tuple(pos), 'r': r if isinstance(r, tuple) else (r, r), 'region': region, 'root': root})
        return len(self.sk_verts) - 1
    def se(self, a, b): self.sk_edges.append((a, b))
    def chain(self, pts, region):
        """a run of skin vertices [(pos, r), ...] joined in order; returns their indices"""
        ids = [self.sv(p, r, region) for p, r in pts]
        for a, b in zip(ids, ids[1:]): self.se(a, b)
        return ids
    # bones
    def bone(self, name, head, tail, parent=None):
        self.bones[name] = {'head': tuple(head), 'tail': tuple(tail), 'parent': parent}
        self.bone_order.append(name)
    def region(self, name, x, y, w, h, uv='cyl', bones=None):
        self.layout[name] = (x, y, w, h); self.uv_modes[name] = uv
        if bones: self.region_bones[name] = bones
    def add(self, part): self.parts.append(part); return part

# ------------------------------------------------------------------ geometry makers (Three coords in, Blender coords stored)
def lathe(name, profile, segments, region, pos=(0, 0, 0), bind='auto', bones=None, cap_top=False, cap_bottom=False, uv='cyl', taper_z=1.0, sweep=None, flute=None):
    """profile: [(radius, y), ...] from top to bottom, revolved around the Y axis at pos.
    taper_z squashes the ring front-to-back; sweep(y) -> (dx, dz) shifts a ring; flute=(k, amp)
    ripples the radius k times around, growing toward the hem."""
    verts, faces = [], []
    y0, y1 = profile[0][1], profile[-1][1]
    for (r, y) in profile:
        dx, dz = sweep(y) if sweep else (0, 0)
        for i in range(segments):
            a = i / segments * math.tau
            f = 1.0
            if flute:
                k, amp = flute; t = (y - y0) / (y1 - y0) if y1 != y0 else 1
                f = 1 + amp * t * math.sin(k * a)
            verts.append(T2B((pos[0] + math.cos(a) * r * f + dx, pos[1] + y, pos[2] + math.sin(a) * r * f * taper_z + dz)))
    n = segments
    for j in range(len(profile) - 1):
        for i in range(n):
            a, b = j * n + i, j * n + (i + 1) % n
            faces.append([a, b, b + n, a + n])
    if cap_top: faces.append(list(range(n))[::-1])
    if cap_bottom: base = (len(profile) - 1) * n; faces.append([base + i for i in range(n)])
    return Part(name, verts, faces, region, bind, bones, uv)

def torus(name, R_, r, region, pos=(0, 0, 0), rot=(0, 0, 0), segs=12, sides=5, bind='auto', bones=None, uv='cyl'):
    """a ring lying in the XZ plane (Three) at pos, then rotated by a Three euler"""
    verts, faces = [], []
    Rm = rotT2B(*rot)
    for i in range(segs):
        a = i / segs * math.tau
        for j in range(sides):
            b = j / sides * math.tau
            x = (R_ + r * math.cos(b)) * math.cos(a); z = (R_ + r * math.cos(b)) * math.sin(a); y = r * math.sin(b)
            verts.append(T2B_apply(Rm, (x, y, z), pos))
    for i in range(segs):
        for j in range(sides):
            a, b = i * sides + j, i * sides + (j + 1) % sides
            c, d = ((i + 1) % segs) * sides + j, ((i + 1) % segs) * sides + (j + 1) % sides
            faces.append([a, c, d, b])
    return Part(name, verts, faces, region, bind, bones, uv)

def box(name, size, region, pos=(0, 0, 0), rot=(0, 0, 0), bind='auto', bones=None, uv='planar'):
    sx, sy, sz = size[0] / 2, size[1] / 2, size[2] / 2
    corners = [(-sx, -sy, -sz), (sx, -sy, -sz), (sx, sy, -sz), (-sx, sy, -sz), (-sx, -sy, sz), (sx, -sy, sz), (sx, sy, sz), (-sx, sy, sz)]
    R = rotT2B(*rot)
    verts = [T2B_apply(R, c, pos) for c in corners]
    faces = [[0, 3, 2, 1], [4, 5, 6, 7], [0, 1, 5, 4], [2, 3, 7, 6], [1, 2, 6, 5], [0, 4, 7, 3]]
    return Part(name, verts, faces, region, bind, bones, uv)

def T2B_apply(R, p, pos):
    v = R @ Vector((p[0], -p[2], p[1]))     # rotate in Blender space (R is a Blender matrix built from a Three euler)
    return Vector((v.x + pos[0], v.y - pos[2], v.z + pos[1]))

def sphere(name, r, region, pos=(0, 0, 0), scale=(1, 1, 1), segs=10, rings=6, bind='auto', bones=None, uv='cyl', squash=0.0, rot=(0, 0, 0)):
    """an ellipsoid; squash > 0 flattens the top rings (a skull), < 0 the bottom"""
    verts, faces = [], []
    R = rotT2B(*rot)
    for j in range(rings + 1):
        t = j / rings
        phi = -math.pi / 2 + t * math.pi
        y = math.sin(phi) * r * scale[1]
        rr = math.cos(phi) * r
        if squash: rr *= 1 - squash * max(0, math.sin(phi)) ** 2
        for i in range(segs):
            a = i / segs * math.tau
            verts.append(T2B_apply(R, (math.cos(a) * rr * scale[0], y, math.sin(a) * rr * scale[2]), pos))
    for j in range(rings):
        for i in range(segs):
            a, b = j * segs + i, j * segs + (i + 1) % segs
            faces.append([a, b, b + segs, a + segs])
    return Part(name, verts, faces, region, bind, bones, uv)

def plate(name, outline, thickness, region, pos=(0, 0, 0), rot=(0, 0, 0), bind='auto', bones=None, uv='planar'):
    """a flat polygon in the XY plane (Three coords) extruded along Z by thickness"""
    n = len(outline)
    R = rotT2B(*rot)
    verts = [T2B_apply(R, (x, y, -thickness / 2), pos) for x, y in outline] + [T2B_apply(R, (x, y, thickness / 2), pos) for x, y in outline]
    faces = [list(range(n)), [n + i for i in range(n)][::-1]]
    for i in range(n):
        a, b = i, (i + 1) % n
        faces.append([b, a, a + n, b + n])
    return Part(name, verts, faces, region, bind, bones, uv)

def tube(name, path, radii, region, segments=6, bind='auto', bones=None, uv='cyl', cap=True):
    """a tube along a polyline of Three points with a radius per point"""
    verts, faces = [], []
    up = Vector((0, 0, 1))
    frames = []
    for i, p in enumerate(path):
        p0 = Vector(path[max(0, i - 1)]); p1 = Vector(path[min(len(path) - 1, i + 1)])
        d = (p1 - p0).normalized() if (p1 - p0).length > 1e-6 else Vector((0, 1, 0))
        ref = Vector((1, 0, 0)) if abs(d.x) < 0.9 else Vector((0, 0, 1))
        u = d.cross(ref).normalized(); v = d.cross(u).normalized()
        frames.append((Vector(p), u, v))
    n = segments
    for (c, u, v), r in zip(frames, radii):
        for i in range(n):
            a = i / n * math.tau
            q = c + u * math.cos(a) * r + v * math.sin(a) * r
            verts.append(T2B((q.x, q.y, q.z)))
    for j in range(len(path) - 1):
        for i in range(n):
            a, b = j * n + i, j * n + (i + 1) % n
            faces.append([a, b, b + n, a + n])
    if cap:
        faces.append(list(range(n))[::-1]); base = (len(path) - 1) * n; faces.append([base + i for i in range(n)])
    return Part(name, verts, faces, region, bind, bones, uv)

def sheet(name, width, length, region, pos=(0, 0, 0), rot=(0, 0, 0), rows=4, cols=4, sag=0.08, wave=0.02, taper=0.1, bind='auto', bones=None, uv='planar'):
    """a hanging cloth: top edge at the origin, hanging down -Y, sagging toward -Z"""
    verts, faces = [], []
    R = rotT2B(*rot)
    for j in range(rows + 1):
        t = j / rows
        for i in range(cols + 1):
            u = i / cols
            x = (u - 0.5) * width * (1 + taper * t)
            y = -t * length
            z = -math.sin(t * math.pi) * sag - math.cos(u * math.pi * 3) * wave * t
            verts.append(T2B_apply(R, (x, y, z), pos))
    for j in range(rows):
        for i in range(cols):
            a = j * (cols + 1) + i
            faces.append([a, a + 1, a + cols + 2, a + cols + 1])
    p = Part(name, verts, faces, region, bind, bones, uv)
    p.double = True
    return p

# ------------------------------------------------------------------ the skin body
def build_skin_body(R):
    """runs the Skin + Subdivision modifiers on the recipe skeleton; returns a Part in Blender coords"""
    me = bpy.data.meshes.new('skin')
    me.from_pydata([T2B(v['pos']) for v in R.sk_verts], R.sk_edges, [])
    ob = bpy.data.objects.new('skin', me)
    bpy.context.scene.collection.objects.link(ob)
    bpy.context.view_layer.objects.active = ob; ob.select_set(True)
    bpy.ops.object.modifier_add(type='SKIN')
    mod = ob.modifiers['Skin']; mod.use_smooth_shade = True; mod.branch_smoothing = R.skin_smooth
    for i, v in enumerate(R.sk_verts):
        d = me.skin_vertices[0].data[i]
        d.radius = (v['r'][0], v['r'][1]); d.use_root = v['root']
    sub = ob.modifiers.new('Sub', 'SUBSURF'); sub.levels = R.sub; sub.render_levels = R.sub
    bpy.ops.object.modifier_apply(modifier='Skin')
    if R.sub > 0: bpy.ops.object.modifier_apply(modifier='Sub')
    if R.decimate:
        dec = ob.modifiers.new('Dec', 'DECIMATE'); dec.ratio = R.decimate; dec.use_collapse_triangulate = True
        bpy.ops.object.modifier_apply(modifier='Dec')
    verts = [v.co.copy() for v in me.vertices]
    faces = [list(p.vertices) for p in me.polygons]
    # region per face: the nearest skeleton segment's far vertex region
    segs = [(T2B(R.sk_verts[a]['pos']), T2B(R.sk_verts[b]['pos']), R.sk_verts[a]['region'], R.sk_verts[b]['region']) for a, b in R.sk_edges]
    face_regions = []
    for p in me.polygons:
        c = p.center
        best, breg = 1e9, None
        for a, b, ra, rb in segs:
            d, t = seg_dist(c, a, b)
            if d < best: best = d; breg = rb if t > 0.5 else ra
        face_regions.append(breg)
    bpy.data.objects.remove(ob); bpy.data.meshes.remove(me)
    part = Part('body', verts, faces, None, 'auto', None, 'cyl')
    part.face_regions = face_regions
    return part

def seg_dist(p, a, b):
    ab = b - a; l2 = ab.length_squared
    t = 0.0 if l2 < 1e-9 else max(0.0, min(1.0, (p - a).dot(ab) / l2))
    return (p - (a + ab * t)).length, t

# ------------------------------------------------------------------ assembly
def assemble(R):
    """merge every part into one mesh object with materials per region, UVs per region rect,
    vertex groups per bone, and the AO/team colour attribute. Returns (mesh_obj, region_of_face)."""
    body = build_skin_body(R)
    parts = [body] + R.parts
    all_verts, all_faces, face_region, face_part, vert_part = [], [], [], [], []
    for pi, p in enumerate(parts):
        base = len(all_verts)
        all_verts.extend(p.verts); vert_part.extend([pi] * len(p.verts))
        for fi, f in enumerate(p.faces):
            all_faces.append([base + i for i in f])
            face_region.append(p.face_regions[fi] if p.face_regions else p.region)
            face_part.append(pi)
    regions = sorted(set(face_region))
    body_z = [v.z for p in parts if not p.prop for v in p.verts]
    R.body_top, R.body_bottom = max(body_z), min(body_z)
    me = bpy.data.meshes.new(R.name)
    me.from_pydata(all_verts, [], all_faces)
    me.update()
    for r in regions:
        mat = bpy.data.materials.new(r); me.materials.append(mat)
    ridx = {r: i for i, r in enumerate(regions)}
    for i, p in enumerate(me.polygons):
        p.material_index = ridx[face_region[i]]; p.use_smooth = parts[face_part[i]].smooth
    ob = bpy.data.objects.new(R.name, me)
    bpy.context.scene.collection.objects.link(ob)
    bpy.context.view_layer.objects.active = ob; ob.select_set(True)
    # normals: recalc outside, and let double-sided sheets be
    bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT'); bpy.ops.mesh.normals_make_consistent(inside=False); bpy.ops.object.mode_set(mode='OBJECT')
    unwrap(R, me, face_region, face_part, parts)
    weights = bind_weights(R, me, vert_part, parts, face_region, face_part)
    return ob, weights, face_region

def unwrap(R, me, face_region, face_part, parts):
    uv = me.uv_layers.new(name='UVMap')
    A = R.atlas
    groups = {}
    for fi, p in enumerate(me.polygons):
        groups.setdefault((face_region[fi], face_part[fi]), []).append(fi)
    # every (region, part) island is projected and fitted into the region's rect; parts sharing a
    # region overlap in the atlas, which is fine for repeating paint
    for (region, pi), fis in groups.items():
        rect = R.layout.get(region)
        if rect is None: raise KeyError(f'region {region} has no atlas rect')
        mode = parts[pi].uv if parts[pi].uv != 'cyl' or region not in R.uv_modes else R.uv_modes[region]
        if parts[pi].uv != 'cyl': mode = parts[pi].uv
        else: mode = R.uv_modes.get(region, 'cyl')
        loops = [(li, me.loops[li].vertex_index) for fi in fis for li in me.polygons[fi].loop_indices]
        pts = [me.vertices[vi].co for _, vi in loops]
        cx = sum(p.x for p in pts) / len(pts); cy = sum(p.y for p in pts) / len(pts); cz = sum(p.z for p in pts) / len(pts)
        raw = []
        if mode == 'cyl':        # around Z (up), v down the height; seam at the back (+Y in Blender = -Z in game)
            poles = []
            for p in pts:
                a = math.atan2(p.x - cx, -(p.y - cy))   # 0 at the front
                raw.append(((a / math.tau + 0.5) % 1.0, -p.z))
                poles.append(math.hypot(p.x - cx, p.y - cy) < 1e-3)
            raw = fix_seam(raw, loops, me, poles)
        elif mode == 'front':    # planar from the front: u = x, v = -z
            for p in pts: raw.append((p.x, -p.z))
        elif mode == 'side':     # planar from the left: u = -y (front to the right), v = -z
            for p in pts: raw.append((-p.y, -p.z))
        elif mode == 'top':      # planar from above: u = x, v = y
            for p in pts: raw.append((p.x, p.y))
        elif mode == 'polar':    # around Z, v = radius (centre at the top of the rect)
            poles = []
            for p in pts:
                a = math.atan2(p.x - cx, p.y - cy); rr = math.hypot(p.x - cx, p.y - cy)
                raw.append(((a / math.tau + 0.5) % 1.0, rr)); poles.append(rr < 1e-3)
            raw = fix_seam(raw, loops, me, poles)
        else:                    # 'planar': best axis by extent
            ex = [max(p[i] for p in pts) - min(p[i] for p in pts) for i in range(3)]
            drop = ex.index(min(ex))
            for p in pts:
                q = [p.x, p.y, p.z]; q.pop(drop)
                raw.append((q[0], -q[1] if drop != 2 else q[1]))
        us = [r[0] for r in raw]; vs = [r[1] for r in raw]
        u0, u1, v0, v1 = min(us), max(us), min(vs), max(vs)
        du = (u1 - u0) or 1; dv = (v1 - v0) or 1
        # around-the-axis modes keep the angle absolute (front stays at u = 0.5 where the face is
        # painted); only the seam overhang is squeezed back into the rect
        wrap = mode in ('cyl', 'polar')
        x, y, w, h = rect; pad = 2.5
        for (li, _), (u, v) in zip(loops, raw):
            fu = (u / max(1.0, u1)) if wrap else (u - u0) / du; fv = (v - v0) / dv
            px = x + pad + fu * (w - 2 * pad); py = y + pad + fv * (h - 2 * pad)
            uv.data[li].uv = (px / A, 1 - py / A)

def fix_seam(raw, loops, me, poles=None):
    """cylindrical u wraps at the seam: faces that straddle it are unwrapped to one side, and a
    pole vertex (on the axis, where the angle is undefined) takes the mean u of its face"""
    out = list(raw)
    poles = poles or [False] * len(raw)
    loop_poly = {}
    for p in me.polygons:
        for li in p.loop_indices: loop_poly[li] = p.loop_total
    i = 0
    while i < len(loops):
        cnt = loop_poly[loops[i][0]]        # loops are grouped per face, in face order
        ks = [k for k in range(cnt) if not poles[i + k]]
        us = [out[i + k][0] for k in ks]
        if us and max(us) - min(us) > 0.5:
            for k in ks:
                if out[i + k][0] < 0.5: out[i + k] = (out[i + k][0] + 1.0, out[i + k][1])
            us = [out[i + k][0] for k in ks]
        mean = sum(us) / len(us) if us else 0.5
        for k in range(cnt):
            if poles[i + k]: out[i + k] = (mean, out[i + k][1])
        i += cnt
    return out

def bind_weights(R, me, vert_part, parts, face_region, face_part):
    """weights per vertex: fixed bone for bound parts, else the two nearest bone segments"""
    bones = [(n, T2B(b['head']), T2B(b['tail'])) for n, b in R.bones.items()]
    # per vertex region (from any face using it) for region-level whitelists
    vreg = {}
    for fi, p in enumerate(me.polygons):
        for vi in p.vertices: vreg.setdefault(vi, face_region[fi])
    weights = []
    for vi, v in enumerate(me.vertices):
        part = parts[vert_part[vi]]
        if part.bind != 'auto':
            weights.append([(part.bind, 1.0)]); continue
        allow = part.bones or R.region_bones.get(vreg.get(vi), None)
        cands = []
        for n, h, t in bones:
            if allow and n not in allow: continue
            d, _ = seg_dist(v.co, h, t)
            cands.append((d, n))
        cands.sort()
        d0, n0 = cands[0]
        if len(cands) < 2: weights.append([(n0, 1.0)]); continue
        d1, n1 = cands[1]
        # blend only near the boundary between two bones: sharpness 3
        w0 = 1 / (d0 + 0.02) ** 3; w1 = 1 / (d1 + 0.02) ** 3
        s = w0 + w1
        w0 /= s; w1 /= s
        if w1 < 0.08: weights.append([(n0, 1.0)])
        else: weights.append([(n0, w0), (n1, w1)])
    return weights

# ------------------------------------------------------------------ rig
def build_rig(R, ob, weights):
    arm = bpy.data.armatures.new('rig'); ao = bpy.data.objects.new('rig', arm)
    bpy.context.scene.collection.objects.link(ao)
    bpy.context.view_layer.objects.active = ao; ao.select_set(True)
    bpy.ops.object.mode_set(mode='EDIT')
    for n in R.bone_order:
        b = R.bones[n]
        eb = arm.edit_bones.new(n)
        eb.head = T2B(b['head']); eb.tail = T2B(b['tail'])
        if (eb.tail - eb.head).length < 1e-4: eb.tail = eb.head + Vector((0, 0, 0.05))
        eb.use_connect = False
    for n in R.bone_order:
        p = R.bones[n]['parent']
        if p: arm.edit_bones[n].parent = arm.edit_bones[p]
    bpy.ops.object.mode_set(mode='OBJECT')
    for n in R.bone_order: ob.vertex_groups.new(name=n)
    for vi, ws in enumerate(weights):
        for n, w in ws: ob.vertex_groups[n].add([vi], w, 'REPLACE')
    ob.parent = ao
    mod = ob.modifiers.new('Armature', 'ARMATURE'); mod.object = ao
    for pb in ao.pose.bones: pb.rotation_mode = 'QUATERNION'
    return ao

# ------------------------------------------------------------------ posing and clips
def pose_matrices(R, deltas, offsets):
    """joint-frame transforms in armature space from Three-style deltas (bone -> (x,y,z) euler)
    and offsets (bone -> (dx,dy,dz) Three), following the parent chain like the game's joints"""
    out = {}
    for n in R.bone_order:
        b = R.bones[n]; p = b['parent']
        head = T2B(b['head'])
        rel = head - (T2B(R.bones[p]['head']) if p else Vector((0, 0, 0)))
        off = offsets.get(n, (0, 0, 0))
        d = deltas.get(n, (0, 0, 0))
        local = Matrix.Translation(rel + Vector((off[0], -off[2], off[1]))) @ rotT2B(*d)
        out[n] = (out[p] @ local) if p else local
    return out

def apply_pose(R, ao, deltas, offsets, frame):
    poses = pose_matrices(R, deltas, offsets)
    bone_pose = {}
    for n in R.bone_order:
        pb = ao.pose.bones[n]; bone = ao.data.bones[n]
        # the bone's rest orientation rides along with its joint frame
        rest_rot = bone.matrix_local.to_3x3().to_4x4()
        desired = poses[n] @ rest_rot
        p = R.bones[n]['parent']
        if p:
            parent_mat = bone_pose[p] @ ao.data.bones[p].matrix_local.inverted() @ bone.matrix_local
        else:
            parent_mat = bone.matrix_local
        basis = parent_mat.inverted() @ desired
        pb.matrix_basis = basis
        bone_pose[n] = desired
        pb.keyframe_insert('rotation_quaternion', frame=frame)
        pb.keyframe_insert('location', frame=frame)

def bake_clips(R, ao, sampler, fps=24):
    """sampler(clip) -> (duration, loop, fn(t) -> (deltas, offsets)); bakes every clip as an NLA track"""
    scene = bpy.context.scene; scene.render.fps = fps
    ad = ao.animation_data_create()
    clips = {}
    for clip in (R.clips or sampler.clip_names(R)):
        dur, loop, fn = sampler.clip(R, clip)
        act = bpy.data.actions.new(clip)
        ad.action = act
        if hasattr(act, 'slots') and ad.action_slot is None:
            ad.action_slot = act.slots.new(id_type='OBJECT', name=ao.name)
        nframes = max(2, int(round(dur * fps)))
        rest = R.props.get('rest', {})
        for f in range(nframes + 1):
            t = f / fps
            deltas, offsets = fn(min(t, dur))
            if rest:
                deltas = dict(deltas)
                for n, r in rest.items():
                    d = deltas.get(n, (0, 0, 0)); deltas[n] = (d[0] + r[0], d[1] + r[1], d[2] + r[2])
            apply_pose(R, ao, deltas, offsets, f)
        ad.action = None
        tr = ad.nla_tracks.new(); tr.name = clip
        st = tr.strips.new(clip, 0, act); st.frame_start = 0; st.frame_end = nframes
        clips[clip] = {'duration': nframes / fps, 'loop': loop}
    return clips

# ------------------------------------------------------------------ colour attribute: AO + team mask
def bake_ao_and_mask(R, ob, face_region, team_regions, glow_regions=(), samples=24, distance=0.6):
    me = ob.data
    col = me.color_attributes.new('Color', 'FLOAT_COLOR', 'CORNER')
    me.color_attributes.active_color = col
    scene = bpy.context.scene
    scene.render.engine = 'CYCLES'; scene.cycles.device = 'CPU'; scene.cycles.samples = samples
    if scene.world is None: scene.world = bpy.data.worlds.new('w')
    scene.world.light_settings.distance = distance
    scene.render.bake.target = 'VERTEX_COLORS'
    bpy.ops.object.select_all(action='DESELECT')
    bpy.context.view_layer.objects.active = ob; ob.select_set(True)
    try:
        bpy.ops.object.bake(type='AO', target='VERTEX_COLORS')
        ao_vals = [col.data[i].color[0] for i in range(len(col.data))]
    except Exception as e:
        print('AO bake failed, flat AO:', e)
        ao_vals = [1.0] * len(col.data)
    # AO is soft and lifted (WC3 textures carry only a hint of it); the team mask rides in green
    for p in me.polygons:
        team = 1.0 if face_region[p.index] in team_regions else 0.0
        glow = 1.0 if face_region[p.index] in glow_regions else 0.0
        for li in p.loop_indices:
            a = ao_vals[li]
            a = 0.55 + 0.45 * min(1.0, a * 1.15)
            col.data[li].color = (a, team, glow, 1.0)

# ------------------------------------------------------------------ export
def export(R, ob, ao, clips, out_dir, team_regions):
    bpy.ops.object.select_all(action='SELECT')
    glb = os.path.join(out_dir, R.name + '.glb')
    bpy.ops.export_scene.gltf(
        filepath=glb, export_format='GLB', export_apply=True, export_yup=True,
        export_animations=True, export_animation_mode='NLA_TRACKS', export_force_sampling=True,
        export_optimize_animation_size=False, export_nla_strips=True,
        export_vertex_color='ACTIVE', export_active_vertex_color_when_no_material=True,
        export_materials='NONE', export_image_format='NONE', export_texcoords=True, export_normals=True,
        export_skins=True, export_def_bones=False, use_selection=False, export_extras=False,
    )
    meta = {
        'name': R.name, 'atlas': R.atlas, 'seed': R.seed, 'height': R.body_top - R.body_bottom, 'top': R.body_top, 'bottom': R.body_bottom,
        'layout': {k: list(v) for k, v in R.layout.items()}, 'team': sorted(team_regions), 'clips': clips, 'kind': R.kind, 'gait': R.gait,
        'tris': sum(len(p.vertices) - 2 for p in ob.data.polygons), 'bones': R.bone_order, **R.props,
    }
    with open(os.path.join(out_dir, R.name + '.json'), 'w') as f: json.dump(meta, f, indent=1)
    print(f'exported {glb}: {meta["tris"]} tris, {len(R.bone_order)} bones, clips {list(clips)}')
    return meta

def build(R, sampler, out_dir, team_regions, glow_regions=()):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    ob, weights, face_region = assemble(R)
    ao = build_rig(R, ob, weights)
    bake_ao_and_mask(R, ob, face_region, set(team_regions), set(glow_regions))
    clips = bake_clips(R, ao, sampler)
    return export(R, ob, ao, clips, out_dir, set(team_regions))
