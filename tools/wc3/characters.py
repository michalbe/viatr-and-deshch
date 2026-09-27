"""
Character recipes. Positions are the game's Three.js coordinates at the size the code-built
assets use (hips around y = 1.0, head top around 1.9); the game scales the GLB to the unit's
display height. Region names and atlas rectangles must match game/skins/<name>.js, which paints
the very same atlas the old code-built asset painted.
"""
import math
from lib import Recipe, lathe, box, sphere, plate, tube, sheet, torus, Part
from mathutils import Vector, Matrix

def humanoid_bones(R, hips=(0, 1.0, 0), spine_top=(0, 1.6, 0.02), head=(0, 1.8, 0.12), head_top=(0, 2.1, 0.12),
                   shoulder=(0.5, 1.6, -0.02), elbow=(0.5, 1.26, -0.02), hand=(0.5, 0.86, 0.0),
                   hip=(0.2, 0.94, 0), knee=(0.2, 0.52, 0), foot=(0.2, 0.1, 0.05)):
    R.bone('hips', hips, (hips[0], hips[1] + 0.1, hips[2]))
    R.bone('spine', (hips[0], hips[1] + 0.1, hips[2]), spine_top, 'hips')
    R.bone('head', head, head_top, 'spine')
    for s, p in ((1, 'l'), (-1, 'r')):
        m = lambda v: (v[0] * s, v[1], v[2])
        R.bone(p + 'Shoulder', m(shoulder), m(elbow), 'spine')
        R.bone(p + 'Elbow', m(elbow), m(hand), p + 'Shoulder')
        R.bone(p + 'Hip', m(hip), m(knee), 'hips')
        R.bone(p + 'Knee', m(knee), m(foot), p + 'Hip')

def mirror_x(p): return (-p[0], p[1], p[2])

# ------------------------------------------------------------------ Vitez
def vitez():
    R = Recipe('vitez', atlas=512, seed=41)
    R.gait = 'vitez'; R.props = {'display_height': 3.38, 'speed': 2.9}
    L = R.region
    L('head', 0, 0, 256, 128, 'cyl', ['head']); L('torso', 256, 0, 256, 128, 'cyl', ['spine', 'hips']); L('helm', 0, 128, 128, 64, 'cyl'); L('mantle', 128, 128, 128, 64, 'cyl')
    L('shield', 256, 128, 128, 128, 'polar'); L('blade', 384, 128, 128, 128, 'planar'); L('pauldron', 0, 192, 64, 64, 'cyl'); L('sleeve', 64, 192, 64, 64, 'cyl')
    L('bracer', 128, 192, 64, 64, 'cyl'); L('hand', 192, 192, 64, 64, 'cyl'); L('kilt', 0, 256, 128, 128, 'front'); L('skirt', 128, 256, 128, 64, 'cyl'); L('belt', 128, 320, 128, 32, 'cyl')
    L('trousers', 256, 256, 64, 64, 'cyl'); L('boot', 320, 256, 64, 128, 'cyl'); L('beard', 384, 256, 64, 64, 'cyl'); L('wood', 448, 256, 32, 128, 'cyl'); L('iron', 0, 384, 64, 64, 'cyl')
    L('strap', 64, 384, 64, 32, 'cyl'); L('foot', 128, 384, 64, 64, 'top'); L('bronze', 192, 384, 32, 32, 'cyl')
    humanoid_bones(R)
    # the welded body: a barrel chest hunched over a small waist, arms thicker at the forearm,
    # fists like the head, thick legs and boots
    hips = R.sv((0, 0.98, 0), (0.3, 0.24), 'belt', root=True)
    waist = R.sv((0, 1.1, 0.0), (0.3, 0.25), 'torso'); R.se(hips, waist)
    chest = R.sv((0, 1.36, 0.0), (0.46, 0.33), 'torso'); R.se(waist, chest)
    neck = R.sv((0, 1.62, 0.04), (0.15, 0.14), 'torso'); R.se(chest, neck)
    for s in (1, -1):
        sh = R.sv((0.5 * s, 1.58, -0.02), (0.17, 0.17), 'sleeve'); R.se(chest, sh)
        el = R.sv((0.5 * s, 1.26, -0.02), (0.13, 0.13), 'sleeve'); R.se(sh, el)
        wr = R.sv((0.5 * s, 0.98, -0.01), (0.15, 0.14), 'bracer'); R.se(el, wr)
        hd = R.sv((0.5 * s, 0.84, 0.02), (0.16, 0.12), 'hand'); R.se(wr, hd)
        hp = R.sv((0.2 * s, 0.9, 0), (0.2, 0.19), 'trousers'); R.se(hips, hp)
        kn = R.sv((0.2 * s, 0.52, 0), (0.16, 0.15), 'boot'); R.se(hp, kn)
        an = R.sv((0.2 * s, 0.16, 0), (0.18, 0.17), 'boot'); R.se(kn, an)
        toe = R.sv((0.2 * s, 0.08, 0.24), (0.14, 0.08), 'foot'); R.se(an, toe)
    # head, helm, nasal, beard
    R.add(sphere('skull', 0.25, 'head', pos=(0, 1.98, 0.14), scale=(1, 1.12, 1.04), bind='head', squash=0.1))
    R.add(lathe('helm', [(0.014, 0.64), (0.12, 0.56), (0.25, 0.45), (0.29, 0.35), (0.295, 0.26), (0.3, 0.22)], 12, 'helm', pos=(0, 1.8, 0.12), bind='head', taper_z=1.03))
    R.add(box('nasal', (0.06, 0.2, 0.035), 'iron', pos=(0, 1.95, 0.405), bind='head'))
    R.add(lathe('beard', [(0.13, 0.0), (0.15, -0.08), (0.11, -0.22), (0.05, -0.36)], 8, 'beard', pos=(0, 1.86, 0.28), bind='head', taper_z=0.5, cap_bottom=True))
    R.add(lathe('moustache', [(0.15, 0.0), (0.13, -0.05)], 8, 'beard', pos=(0, 1.9, 0.38), bind='head', taper_z=0.3, cap_top=True, cap_bottom=True))
    # the fur mantle heaped on the shoulders, pauldrons
    R.add(lathe('mantle', [(0.22, 0.66), (0.6, 0.58), (0.62, 0.44), (0.55, 0.36)], 12, 'mantle', pos=(0, 1.1, -0.02), bind='spine', taper_z=0.68))
    for s, big in ((1, 1.0), (-1, 1.15)):
        R.add(sphere('pauldron', 0.21 * big, 'pauldron', pos=(0.52 * s, 1.64, -0.02), scale=(1, 0.75, 0.95), bind=('l' if s > 0 else 'r') + 'Shoulder', squash=-0.2))
        R.add(lathe('spike', [(0.0, 0.34 * big), (0.05 * big, 0.1)], 6, 'iron', pos=(0.52 * s, 1.64, -0.02), bind=('l' if s > 0 else 'r') + 'Shoulder', cap_bottom=True))
    # belt, mail skirt, team kilt front and back
    R.add(lathe('belt', [(0.34, 0.1), (0.36, -0.04)], 12, 'belt', pos=(0, 1.0, 0), bind='hips', taper_z=0.8))
    R.add(lathe('skirt', [(0.33, -0.02), (0.4, -0.2), (0.45, -0.34)], 12, 'skirt', pos=(0, 1.0, 0), bones=['hips', 'lHip', 'rHip'], taper_z=0.8))
    R.add(sheet('kiltF', 0.36, 0.52, 'kilt', pos=(0, 1.04, 0.3), rot=(0.12, 0, 0), sag=-0.1, wave=0.014, taper=0.2, bones=['hips', 'lHip', 'rHip']))
    R.add(sheet('kiltB', 0.36, 0.52, 'kilt', pos=(0, 1.04, -0.3), rot=(-0.12, math.pi, 0), sag=-0.1, wave=0.014, taper=0.2, bones=['hips', 'lHip', 'rHip']))
    # shield: a domed disc on the left forearm; the dome points outward (+X)
    sh = lathe('shield', [(0.02, 0.12), (0.17, 0.1), (0.4, 0.04), (0.5, 0.0), (0.51, -0.04), (0.5, -0.05)], 14, 'shield', bind='lElbow', cap_top=True, cap_bottom=True)
    xform(sh, rot=(0.0, 0.0, -math.pi / 2), pos=(0.66, 1.06, 0.02))
    sh.uv = 'polar'; sh.prop = True
    R.add(sh)
    R.add(sphere('boss', 0.09, 'iron', pos=(0.78, 1.06, 0.02), scale=(0.7, 1, 1), bind='lElbow')).prop = True
    # axe: long haft, iron collar, bearded blade, held in the right fist; edge forward
    haft = lathe('haft', [(0.024, 1.12), (0.045, 1.06), (0.04, 0.0), (0.046, -0.34), (0.056, -0.5)], 7, 'wood', bind='rElbow', cap_top=True, cap_bottom=True)
    xform(haft, rot=(0.22, 0, 0), pos=(-0.5, 0.86, 0.05)); haft.prop = True; R.add(haft)
    collar = lathe('collar', [(0.072, 1.0), (0.07, 0.78)], 7, 'iron', bind='rElbow'); xform(collar, rot=(0.22, 0, 0), pos=(-0.5, 0.86, 0.05)); collar.prop = True; R.add(collar)
    grip = lathe('grip', [(0.052, 0.08), (0.052, -0.16)], 7, 'strap', bind='rElbow'); xform(grip, rot=(0.22, 0, 0), pos=(-0.5, 0.86, 0.05)); grip.prop = True; R.add(grip)
    blade = plate('blade', [(-0.08, 0.1), (0.06, 0.1), (0.2, 0.2), (0.34, 0.26), (0.42, 0.0), (0.4, -0.34), (0.16, -0.36), (0.1, -0.2), (0.06, -0.08), (-0.08, -0.08)], 0.06, 'blade', bind='rElbow')
    # the plate is drawn in the XY plane with the edge at +X; turn it so the edge faces +Z (forward) and it rides the haft
    xform(blade, rot=(0, -math.pi / 2, 0), pos=(0, 0.88, 0)); xform(blade, rot=(0.22, 0, 0), pos=(-0.5, 0.86, 0.05)); blade.prop = True; R.add(blade)
    return R, ['kilt']

# ------------------------------------------------------------------ helpers
def xform(part, rot=(0, 0, 0), pos=(0, 0, 0)):
    """rotate a part about the origin by a Three euler, then translate by a Three vector (in place)"""
    from lib import rotT2B
    Rm = rotT2B(*rot); t = Vector((pos[0], -pos[2], pos[1]))
    part.verts = [Rm @ v + t for v in part.verts]
    return part

CHARACTERS = {'vitez': vitez}

# ------------------------------------------------------------------ Vietra
def vietra():
    R = Recipe('vietra', atlas=512, seed=29)
    R.gait = 'vietra'; R.props = {'display_height': 3.04, 'speed': 3.4, 'extraClips': ['dance', 'build'],
                                  'rest': {'lShoulder': (0, 0, 1.05), 'lElbow': (0, 0, 0.75), 'rShoulder': (-0.35, 0, -0.12), 'rElbow': (-0.8, 0, 0)}}
    L = R.region
    L('head', 0, 0, 256, 128, 'cyl', ['head']); L('skirt', 256, 0, 256, 128, 'cyl'); L('bodice', 0, 128, 128, 64, 'cyl', ['spine', 'hips']); L('shawl', 128, 128, 128, 64, 'cyl')
    L('sleeve', 256, 128, 64, 64, 'cyl'); L('hand', 320, 128, 64, 64, 'cyl'); L('braid', 384, 128, 64, 128, 'cyl'); L('wreath', 0, 192, 128, 32, 'cyl'); L('flower', 128, 192, 32, 32, 'cyl')
    L('ribbonT', 160, 192, 32, 128, 'planar'); L('ribbonL', 192, 192, 32, 128, 'planar'); L('wood', 224, 192, 32, 128, 'cyl'); L('boot', 256, 192, 64, 64, 'cyl'); L('apron', 256, 256, 96, 128, 'front')
    L('ochre', 352, 256, 32, 32, 'cyl'); L('skin', 384, 256, 32, 32, 'cyl'); L('hairtop', 416, 256, 64, 64, 'cyl')
    humanoid_bones(R, hips=(0, 0.9, 0), spine_top=(0, 1.36, 0.01), head=(0, 1.42, 0.02), head_top=(0, 1.7, 0.02), shoulder=(0.25, 1.34, 0), elbow=(0.25, 1.06, 0), hand=(0.25, 0.72, 0.01), hip=(0.1, 0.86, 0), knee=(0.1, 0.46, 0), foot=(0.1, 0.06, 0.05))
    hips = R.sv((0, 0.9, 0), (0.19, 0.16), 'ochre', root=True)
    waist = R.sv((0, 1.06, 0), (0.16, 0.13), 'bodice'); R.se(hips, waist)
    chest = R.sv((0, 1.22, 0), (0.21, 0.17), 'bodice'); R.se(waist, chest)
    neck = R.sv((0, 1.36, 0.01), (0.075, 0.07), 'bodice'); R.se(chest, neck)
    for s in (1, -1):
        sh = R.sv((0.25 * s, 1.34, 0), (0.09, 0.085), 'sleeve'); R.se(chest, sh)
        el = R.sv((0.25 * s, 1.06, 0), (0.08, 0.075), 'sleeve'); R.se(sh, el)
        wr = R.sv((0.25 * s, 0.86, 0), (0.045, 0.042), 'skin'); R.se(el, wr)
        hd = R.sv((0.25 * s, 0.74, 0.01), (0.08, 0.065), 'hand'); R.se(wr, hd)
        hp = R.sv((0.1 * s, 0.86, 0), (0.09, 0.085), 'skin'); R.se(hips, hp)
        kn = R.sv((0.1 * s, 0.46, 0), (0.07, 0.065), 'boot'); R.se(hp, kn)
        an = R.sv((0.1 * s, 0.1, 0), (0.08, 0.075), 'boot'); R.se(kn, an)
        toe = R.sv((0.1 * s, 0.05, 0.13), (0.08, 0.05), 'boot'); R.se(an, toe)
        # flared cuffs
        R.add(lathe('cuff', [(0.08, 0.02), (0.1, -0.1), (0.18, -0.22), (0.2, -0.26)], 9, 'sleeve', pos=(0.25 * s, 1.06, 0), bind=('l' if s > 0 else 'r') + 'Elbow'))
    # the bell skirt, fluted, and the team apron over it; belt
    R.add(lathe('skirt', [(0.18, 0.05), (0.22, -0.14), (0.32, -0.4), (0.48, -0.66), (0.62, -0.84), (0.64, -0.9)], 16, 'skirt', pos=(0, 0.9, 0), bones=['hips', 'lHip', 'rHip'], taper_z=0.9, flute=(8, 0.07)))
    R.add(sheet('apron', 0.26, 0.74, 'apron', pos=(0, 0.94, 0.16), rot=(0.05, 0, 0), sag=-0.22, wave=0.02, taper=0.5, rows=6, bones=['hips', 'lHip', 'rHip']))
    R.add(lathe('belt', [(0.19, 0.09), (0.2, 0.02)], 10, 'ochre', pos=(0, 0.9, 0), bind='hips', taper_z=0.85))
    # shawl over the shoulders, its points down the front and a tail down the back
    R.add(lathe('shawl', [(0.1, 0.47), (0.3, 0.41), (0.37, 0.28), (0.36, 0.2)], 12, 'shawl', pos=(0, 0.96, 0), bind='spine', taper_z=0.8))
    for s in (1, -1): R.add(sheet('shawlF', 0.14, 0.34, 'shawl', pos=(s * 0.1, 1.2, 0.17), rot=(0.1, 0, s * 0.15), sag=-0.04, taper=-0.6, rows=3, cols=2, bind='spine'))
    R.add(sheet('shawlB', 0.3, 0.42, 'shawl', pos=(0, 1.26, -0.2), rot=(0, math.pi, 0), sag=0.05, taper=-0.7, rows=3, cols=3, bind='spine'))
    # head: big, blond, a braid down the back, a flower wreath
    R.add(sphere('skull', 0.19, 'head', pos=(0, 1.62, 0.03), scale=(1, 1.16, 1.05), bind='head', squash=0.05))
    R.add(lathe('hairtop', [(0.02, 0.42), (0.12, 0.38), (0.2, 0.3), (0.205, 0.2), (0.19, 0.14)], 10, 'hairtop', pos=(0, 1.42, 0.02), bind='head', cap_top=True))
    R.add(tube('braid', [(0, 1.56, -0.15), (0, 1.42, -0.18), (0, 1.26, -0.2), (0, 1.1, -0.2), (0, 0.98, -0.18)], [0.06, 0.065, 0.06, 0.05, 0.03], 'braid', segments=6, bind='head'))
    R.add(sheet('braidRibbon', 0.09, 0.14, 'ribbonT', pos=(0, 1.02, -0.2), taper=0.2, rows=2, cols=1, bind='head'))
    R.add(torus('wreath', 0.22, 0.045, 'wreath', pos=(0, 1.73, 0.01), rot=(-0.15, 0, 0), bind='head'))
    for i in range(6):
        a = i * math.pi / 3 + 0.3
        R.add(sphere('flower', 0.05, 'flower', pos=(math.sin(a) * 0.22, 1.77, 0.01 + math.cos(a) * 0.22), scale=(1, 0.7, 1), segs=6, rings=3, bind='head'))
    # ribbons streaming from the raised left hand
    for i, (w, ln, rot, reg) in enumerate([(0.1, 0.85, (0.3, 0.4, 0.5), 'ribbonT'), (0.085, 0.7, (0.2, -0.4, 0.9), 'ribbonL'), (0.08, 0.62, (0.6, 0.0, 1.3), 'ribbonT')]):
        p = sheet('ribbon%d' % i, w, ln, reg, pos=(0.25, 0.72, 0.01), rot=rot, sag=0.12, wave=0.04, taper=0, rows=6, cols=1, bind='lElbow'); p.prop = True; R.add(p)
    # the staff in the right hand, held straight, ribbons off the top ring
    st = lathe('staff', [(0.028, 2.06), (0.03, 1.56), (0.034, 0.34), (0.038, 0.04)], 7, 'wood', pos=(-0.25, 0, 0.03), bind='rElbow', cap_top=True, cap_bottom=True); st.prop = True; R.add(st)
    R.add(sphere('knob', 0.07, 'ochre', pos=(-0.25, 2.06, 0.03), segs=7, rings=4, bind='rElbow')).prop = True
    R.add(torus('ring', 0.1, 0.022, 'wood', pos=(-0.25, 1.94, 0.03), segs=8, sides=4, bind='rElbow')).prop = True
    R.add(lathe('band', [(0.045, 1.85), (0.045, 1.79)], 7, 'ochre', pos=(-0.25, 0, 0.03), bind='rElbow')).prop = True
    for i, (rot, ln, reg) in enumerate([((0.4, 0.3, -0.5), 1.0, 'ribbonT'), ((0.6, 1.2, -0.3), 0.85, 'ribbonL'), ((0.7, 2.3, 0.2), 0.9, 'ribbonT'), ((0.3, 3.1, -0.7), 0.7, 'ribbonL'), ((0.5, 4.2, 0.4), 0.8, 'ribbonT')]):
        p = sheet('staffRibbon%d' % i, 0.1, ln, reg, pos=(-0.25, 1.94, 0.03), rot=rot, sag=0.13, wave=0.05, taper=0, rows=6, cols=1, bind='rElbow'); p.prop = True; R.add(p)
    return R, ['apron', 'ribbonT', 'shawl', 'wreath']

# ------------------------------------------------------------------ Zherca
def zherca():
    R = Recipe('zherca', atlas=512, seed=59)
    R.gait = 'zherca'; R.props = {'display_height': 3.1, 'speed': 3.2, 'extraClips': ['rite', 'build'],
                                  'rest': {'lShoulder': (-0.5, 0, 0.12), 'lElbow': (-1.0, 0, 0), 'rShoulder': (-0.25, 0, -0.18), 'rElbow': (-0.7, 0, 0), 'spine': (0.1, 0, 0), 'head': (-0.05, 0, 0)}}
    L = R.region
    L('head', 0, 0, 256, 128, 'cyl', ['head']); L('mantle', 256, 0, 256, 128, 'cyl'); L('robe', 0, 128, 128, 128, 'cyl'); L('hood', 128, 128, 128, 64, 'cyl'); L('capelet', 128, 192, 128, 64, 'cyl')
    L('sleeve', 256, 128, 64, 64, 'cyl'); L('cuff', 320, 128, 32, 32, 'cyl'); L('hand', 352, 128, 64, 64, 'cyl'); L('beard', 416, 128, 64, 64, 'cyl'); L('wood', 480, 128, 32, 128, 'cyl')
    L('drum', 0, 256, 128, 32, 'cyl'); L('drumskin', 128, 256, 64, 64, 'top'); L('water', 192, 256, 32, 32, 'top'); L('bowl', 224, 256, 64, 64, 'cyl'); L('ochre', 288, 256, 32, 32, 'cyl'); L('boot', 320, 256, 64, 64, 'cyl')
    humanoid_bones(R, hips=(0, 1.02, 0), spine_top=(0, 1.7, 0.02), head=(0, 1.8, 0.1), head_top=(0, 2.1, 0.1), shoulder=(0.34, 1.64, -0.02), elbow=(0.34, 1.3, -0.02), hand=(0.34, 0.9, 0), hip=(0.13, 0.96, 0), knee=(0.13, 0.54, 0), foot=(0.13, 0.06, 0.08))
    hips = R.sv((0, 1.02, 0), (0.3, 0.24), 'robe', root=True)
    waist = R.sv((0, 1.18, 0), (0.28, 0.23), 'mantle'); R.se(hips, waist)
    chest = R.sv((0, 1.44, 0), (0.4, 0.3), 'mantle'); R.se(waist, chest)
    neck = R.sv((0, 1.7, 0.02), (0.16, 0.14), 'mantle'); R.se(chest, neck)
    for s in (1, -1):
        sh = R.sv((0.34 * s, 1.62, -0.02), (0.13, 0.12), 'sleeve'); R.se(chest, sh)
        el = R.sv((0.34 * s, 1.3, -0.02), (0.12, 0.115), 'sleeve'); R.se(sh, el)
        wr = R.sv((0.34 * s, 1.06, -0.01), (0.05, 0.048), 'hand'); R.se(el, wr)
        hd = R.sv((0.34 * s, 0.9, 0.0), (0.11, 0.09), 'hand'); R.se(wr, hd)
        hp = R.sv((0.13 * s, 0.94, 0), (0.1, 0.095), 'robe'); R.se(hips, hp)
        kn = R.sv((0.13 * s, 0.54, 0), (0.085, 0.08), 'boot'); R.se(hp, kn)
        an = R.sv((0.13 * s, 0.12, 0), (0.09, 0.085), 'boot'); R.se(kn, an)
        toe = R.sv((0.13 * s, 0.06, 0.16), (0.1, 0.06), 'boot'); R.se(an, toe)
        R.add(lathe('cuff', [(0.12, 0.02), (0.15, -0.12), (0.2, -0.24), (0.21, -0.28)], 9, 'sleeve', pos=(0.34 * s, 1.3, -0.02), bind=('l' if s > 0 else 'r') + 'Elbow'))
        R.add(lathe('cuffband', [(0.215, -0.26), (0.22, -0.3)], 9, 'cuff', pos=(0.34 * s, 1.3, -0.02), bind=('l' if s > 0 else 'r') + 'Elbow'))
    # linen robe to the ground, team mantle from the shoulders, a closed capelet over it
    R.add(lathe('robe', [(0.3, 0.06), (0.36, -0.5), (0.44, -0.96), (0.44, -1.02)], 12, 'robe', pos=(0, 1.02, 0), bones=['hips', 'lHip', 'rHip'], taper_z=0.82, cap_bottom=True))
    R.add(lathe('belt', [(0.31, 0.1), (0.32, 0.02)], 12, 'ochre', pos=(0, 1.02, 0), bind='hips', taper_z=0.82))
    R.add(lathe('mantle', [(0.17, 0.6), (0.4, 0.5), (0.42, 0.3), (0.38, 0.0), (0.42, -0.4), (0.5, -0.8), (0.52, -0.9)], 14, 'mantle', pos=(0, 1.1, -0.01), bones=['spine', 'hips', 'lHip', 'rHip'], taper_z=0.78))
    R.add(lathe('capelet', [(0.16, 0.64), (0.48, 0.56), (0.52, 0.4), (0.5, 0.32)], 12, 'capelet', pos=(0, 1.1, -0.02), bind='spine', taper_z=0.76))
    for s in (1, -1): R.add(sphere('clasp', 0.05, 'ochre', pos=(s * 0.13, 1.6, 0.26), segs=6, rings=3, bind='spine'))
    # head: skull, long grey beard, deep hood peaked behind the face
    R.add(sphere('skull', 0.22, 'head', pos=(0, 1.96, 0.12), scale=(1, 1.14, 1.05), bind='head', squash=0.05))
    R.add(lathe('beard', [(0.16, 0.0), (0.2, -0.1), (0.17, -0.28), (0.11, -0.46), (0.04, -0.6)], 8, 'beard', pos=(0, 1.8, 0.27), bind='head', taper_z=0.55, cap_top=True, cap_bottom=True))
    R.add(lathe('moustache', [(0.14, 0.09), (0.11, 0.03)], 8, 'beard', pos=(0, 1.8, 0.35), bind='head', taper_z=0.35, cap_top=True, cap_bottom=True))
    R.add(lathe('hood', [(0.02, 0.62), (0.14, 0.48), (0.28, 0.3), (0.3, 0.12), (0.3, -0.08), (0.29, -0.16)], 12, 'hood', pos=(0, 2.02, -0.03), bind='head', cap_top=True, sweep=lambda y: (0, -0.1 + (0.62 - y) * 0.16)))
    # wooden bowl of water in the left hand
    R.add(lathe('bowl', [(0.2, 0.14), (0.19, 0.06), (0.13, -0.02), (0.08, -0.05)], 9, 'bowl', pos=(0.34, 0.86, 0.03), bind='lElbow', cap_bottom=True)).prop = True
    R.add(lathe('water', [(0.005, 0.115), (0.185, 0.11)], 9, 'water', pos=(0.34, 0.86, 0.03), bind='lElbow', cap_top=True)).prop = True
    # staff with a rain-drum on top, drops hanging from its rim
    st = lathe('staff', [(0.04, 2.2), (0.042, 1.4), (0.046, 0.23), (0.05, 0.03)], 7, 'wood', pos=(-0.34, 0, 0.02), bind='rElbow', cap_top=True, cap_bottom=True); st.prop = True; R.add(st)
    for y in (1.2, 0.8): R.add(lathe('band', [(0.06, y + 0.03), (0.06, y - 0.03)], 7, 'ochre', pos=(-0.34, 0, 0.02), bind='rElbow')).prop = True
    R.add(lathe('drum', [(0.24, 0.08), (0.22, -0.08)], 12, 'drum', pos=(-0.34, 2.3, 0.02), bind='rElbow')).prop = True
    R.add(lathe('drumskin', [(0.005, 0.085), (0.235, 0.08)], 12, 'drumskin', pos=(-0.34, 2.3, 0.02), bind='rElbow', cap_top=True)).prop = True
    R.add(lathe('drumfoot', [(0.08, -0.08), (0.035, -0.2)], 7, 'wood', pos=(-0.34, 2.3, 0.02), bind='rElbow', cap_bottom=True)).prop = True
    for i in range(7):
        a = i * math.tau / 7 + 0.2; x = -0.34 + math.sin(a) * 0.2; z = 0.02 + math.cos(a) * 0.2; ln = 0.1 + (i % 3) * 0.07
        R.add(tube('drop%d' % i, [(x, 2.22, z), (x, 2.22 - ln, z)], [0.008, 0.008], 'ochre', segments=3, bind='rElbow', cap=False)).prop = True
        R.add(sphere('bead%d' % i, 0.03, 'water', pos=(x, 2.16 - ln, z), scale=(1, 1.4, 1), segs=5, rings=3, bind='rElbow')).prop = True
    return R, ['mantle', 'hood', 'capelet', 'sleeve']

# ------------------------------------------------------------------ Streletz
def streletz():
    R = Recipe('streletz', atlas=512, seed=67)
    R.gait = 'streletz'; R.props = {'display_height': 3.02, 'speed': 3.6, 'extraClips': [],
                                    'rest': {'lShoulder': (-0.45, 0, 0.2), 'lElbow': (-0.7, 0, 0), 'rShoulder': (0.05, 0, -0.14), 'rElbow': (-0.35, 0, 0), 'spine': (0.08, 0, 0), 'head': (-0.08, 0, 0)}}
    L = R.region
    L('head', 0, 0, 256, 128, 'cyl', ['head']); L('tunic', 256, 0, 256, 128, 'cyl', ['spine', 'hips']); L('kolpak', 0, 128, 128, 64, 'cyl'); L('crown', 0, 192, 128, 32, 'cyl'); L('sash', 128, 128, 64, 64, 'cyl')
    L('skirt', 192, 128, 128, 64, 'cyl'); L('sleeve', 320, 128, 64, 64, 'cyl'); L('bracer', 384, 128, 64, 64, 'cyl'); L('hand', 448, 128, 64, 64, 'cyl'); L('quiver', 128, 192, 64, 128, 'cyl'); L('quivercap', 192, 192, 32, 32, 'cyl')
    L('fletch', 224, 192, 32, 32, 'planar'); L('bow', 256, 192, 32, 128, 'cyl'); L('trousers', 288, 192, 64, 64, 'cyl'); L('boot', 352, 192, 64, 128, 'cyl'); L('foot', 416, 192, 64, 64, 'top'); L('hair', 0, 256, 64, 64, 'cyl')
    L('wood', 64, 256, 32, 64, 'cyl'); L('string', 96, 256, 16, 64, 'cyl'); L('bronze', 112, 256, 32, 32, 'cyl')
    humanoid_bones(R, hips=(0, 1.0, 0), spine_top=(0, 1.66, 0.02), head=(0, 1.74, 0.08), head_top=(0, 2.05, 0.08), shoulder=(0.42, 1.56, -0.02), elbow=(0.42, 1.22, -0.02), hand=(0.42, 0.84, 0), hip=(0.17, 0.94, 0), knee=(0.17, 0.52, 0), foot=(0.17, 0.06, 0.09))
    hips = R.sv((0, 1.0, 0), (0.33, 0.26), 'sash', root=True)
    waist = R.sv((0, 1.12, 0), (0.32, 0.25), 'tunic'); R.se(hips, waist)
    chest = R.sv((0, 1.38, 0), (0.44, 0.3), 'tunic'); R.se(waist, chest)
    neck = R.sv((0, 1.62, 0.03), (0.15, 0.13), 'tunic'); R.se(chest, neck)
    for s in (1, -1):
        sh = R.sv((0.42 * s, 1.56, -0.02), (0.15, 0.14), 'sleeve'); R.se(chest, sh)
        el = R.sv((0.42 * s, 1.22, -0.02), (0.13, 0.125), 'bracer'); R.se(sh, el)
        wr = R.sv((0.42 * s, 0.98, -0.01), (0.15, 0.14), 'bracer'); R.se(el, wr)
        hd = R.sv((0.42 * s, 0.84, 0.02), (0.145, 0.12), 'hand'); R.se(wr, hd)
        hp = R.sv((0.17 * s, 0.94, 0), (0.17, 0.16), 'trousers'); R.se(hips, hp)
        kn = R.sv((0.17 * s, 0.52, 0), (0.13, 0.125), 'boot'); R.se(hp, kn)
        an = R.sv((0.17 * s, 0.14, 0), (0.17, 0.155), 'boot'); R.se(kn, an)
        toe = R.sv((0.17 * s, 0.08, 0.22), (0.14, 0.08), 'foot'); R.se(an, toe)
        R.add(sphere('shoulder', 0.19, 'tunic', pos=(0.44 * s, 1.6, -0.02), scale=(1, 0.62, 0.9), segs=8, rings=4, bind=('l' if s > 0 else 'r') + 'Shoulder', squash=0.3))
    # tunic skirt, team sash with a hanging tail, quiver on the back
    R.add(lathe('skirt', [(0.33, 0.06), (0.38, -0.16), (0.42, -0.36)], 12, 'skirt', pos=(0, 1.0, 0), bones=['hips', 'lHip', 'rHip'], taper_z=0.8))
    R.add(lathe('sash', [(0.34, 0.12), (0.36, 0.0)], 12, 'sash', pos=(0, 1.0, 0), bind='hips', taper_z=0.8))
    R.add(sheet('sashTail', 0.14, 0.4, 'sash', pos=(0.22, 1.04, 0.2), rot=(0.1, -0.5, 0.15), sag=0.03, taper=-0.3, rows=3, cols=2, bind='hips'))
    R.add(sphere('knot', 0.06, 'sash', pos=(0.2, 1.06, 0.22), scale=(1, 0.8, 1), segs=6, rings=3, bind='hips'))
    q = lathe('quiver', [(0.11, 0.32), (0.1, 0.1), (0.08, -0.3)], 8, 'quiver', bind='spine', cap_bottom=True); xform(q, rot=(-0.15, 0, 0.5), pos=(-0.08, 1.36, -0.32)); R.add(q)
    qc = lathe('quivercap', [(0.12, 0.34), (0.115, 0.22)], 8, 'quivercap', bind='spine'); xform(qc, rot=(-0.15, 0, 0.5), pos=(-0.08, 1.36, -0.32)); R.add(qc)
    for i in range(4):
        a = i * 1.5; x = math.sin(a) * 0.05; z = math.cos(a) * 0.05
        ar = tube('arrow%d' % i, [(x, 0.3, z), (x, 0.56, z)], [0.01, 0.01], 'wood', segments=3, bind='spine', cap=False); xform(ar, rot=(-0.15, 0, 0.5), pos=(-0.08, 1.36, -0.32)); R.add(ar)
        fl = plate('fletch%d' % i, [(-0.035, 0.0), (0.035, 0.0), (0.035, 0.1), (-0.035, 0.08)], 0.006, 'fletch', pos=(x, 0.46, z), rot=(0, a, 0), bind='spine'); xform(fl, rot=(-0.15, 0, 0.5), pos=(-0.08, 1.36, -0.32)); R.add(fl)
    # head: skull, drooping moustache, fur kolpak with a team crown and a tassel
    R.add(sphere('skull', 0.24, 'head', pos=(0, 1.92, 0.1), scale=(1, 1.12, 1.04), bind='head', squash=0.05))
    for s in (1, -1):
        R.add(tube('moustache', [(s * 0.05, 1.86, 0.34), (s * 0.13, 1.8, 0.32), (s * 0.17, 1.68, 0.28)], [0.035, 0.045, 0.022], 'hair', segments=5, bind='head'))
    R.add(lathe('kolpak', [(0.24, 0.16), (0.3, 0.08), (0.3, -0.04), (0.27, -0.12)], 10, 'kolpak', pos=(0, 2.1, 0.07), bind='head', cap_bottom=True))
    R.add(lathe('crown', [(0.02, 0.36), (0.14, 0.3), (0.23, 0.2), (0.245, 0.14)], 9, 'crown', pos=(0, 2.1, 0.07), bind='head', cap_top=True))
    R.add(sphere('tassel', 0.05, 'kolpak', pos=(0, 2.47, 0.07), segs=6, rings=3, bind='head'))
    # recurve bow in the left hand, a leather grip, a linen string
    BL, BD = 1.3, 1.7
    pts = [(0, -0.84 * BL, 0.03 * BD), (0, -0.74 * BL, -0.05 * BD), (0, -0.45 * BL, 0.05 * BD), (0, 0, 0.12 * BD), (0, 0.45 * BL, 0.05 * BD), (0, 0.74 * BL, -0.05 * BD), (0, 0.84 * BL, 0.03 * BD)]
    bow = tube('bow', pts, [0.03, 0.05, 0.055, 0.06, 0.055, 0.05, 0.03], 'bow', segments=5, bind='lElbow')
    grip = lathe('grip', [(0.075, 0.12), (0.075, -0.12)], 7, 'bracer', pos=(0, 0, 0.12 * BD), bind='lElbow')
    string = tube('string', [(0, -0.83 * BL, 0.03 * BD - 0.02), (0, 0.83 * BL, 0.03 * BD - 0.02)], [0.011, 0.011], 'string', segments=3, bind='lElbow', cap=False)
    tips = [sphere('tip%d' % i, 0.03, 'bronze', pos=(0, s * 0.84 * BL, 0.03 * BD), scale=(1, 1.3, 1), segs=5, rings=3, bind='lElbow') for i, s in enumerate((1, -1))]
    for p in [bow, grip, string] + tips:
        xform(p, rot=(0, 0.8, 0)); xform(p, rot=(-0.55, 0, -0.4), pos=(0.42, 0.84, 0.01)); p.prop = True; R.add(p)
    return R, ['crown', 'fletch', 'quivercap', 'sash']

# ------------------------------------------------------------------ Baba
def baba():
    R = Recipe('baba', atlas=512, seed=97)
    R.gait = 'baba'; R.props = {'display_height': 3.0, 'speed': 3.2, 'extraClips': ['rite'],
                                'rest': {'rShoulder': (-0.4, 0, -0.15), 'rElbow': (-0.9, 0, 0), 'lShoulder': (-0.15, 0, 0.2), 'lElbow': (-0.5, 0, 0), 'spine': (0.3, 0, 0), 'head': (-0.3, 0, 0)}}
    L = R.region
    L('head', 0, 0, 256, 128, 'cyl', ['head']); L('scarf', 256, 0, 128, 64, 'cyl'); L('shawl', 256, 64, 256, 128, 'cyl'); L('skirt', 0, 128, 128, 128, 'cyl'); L('underskirt', 128, 128, 128, 64, 'cyl')
    L('hand', 128, 192, 64, 64, 'cyl'); L('wood', 192, 192, 32, 128, 'cyl'); L('bone', 224, 192, 32, 32, 'cyl'); L('iron', 224, 224, 32, 32, 'planar'); L('herbs', 0, 256, 64, 64, 'cyl'); L('boot', 64, 256, 64, 64, 'cyl')
    humanoid_bones(R, hips=(0, 0.86, 0), spine_top=(0, 1.3, 0.04), head=(0, 1.36, 0.12), head_top=(0, 1.62, 0.12), shoulder=(0.27, 1.3, 0), elbow=(0.27, 1.02, 0), hand=(0.27, 0.68, 0.01), hip=(0.1, 0.82, 0), knee=(0.1, 0.42, 0), foot=(0.1, 0.05, 0.05))
    hips = R.sv((0, 0.86, 0), (0.2, 0.17), 'skirt', root=True)
    waist = R.sv((0, 1.0, 0), (0.2, 0.17), 'shawl'); R.se(hips, waist)
    chest = R.sv((0, 1.16, -0.02), (0.25, 0.2), 'shawl'); R.se(waist, chest)
    neck = R.sv((0, 1.32, 0.04), (0.1, 0.09), 'shawl'); R.se(chest, neck)
    for s in (1, -1):
        sh = R.sv((0.27 * s, 1.3, 0), (0.1, 0.095), 'shawl'); R.se(chest, sh)
        el = R.sv((0.27 * s, 1.02, 0), (0.08, 0.075), 'skirt'); R.se(sh, el)
        wr = R.sv((0.27 * s, 0.84, 0), (0.045, 0.042), 'hand'); R.se(el, wr)
        hd = R.sv((0.27 * s, 0.7, 0.01), (0.08, 0.065), 'hand'); R.se(wr, hd)
        hp = R.sv((0.1 * s, 0.82, 0), (0.08, 0.075), 'underskirt'); R.se(hips, hp)
        kn = R.sv((0.1 * s, 0.42, 0), (0.065, 0.06), 'boot'); R.se(hp, kn)
        an = R.sv((0.1 * s, 0.1, 0), (0.075, 0.07), 'boot'); R.se(kn, an)
        toe = R.sv((0.1 * s, 0.05, 0.12), (0.08, 0.05), 'boot'); R.se(an, toe)
        R.add(lathe('cuff', [(0.08, 0.02), (0.1, -0.14), (0.14, -0.24)], 8, 'skirt', pos=(0.27 * s, 1.02, 0), bind=('l' if s > 0 else 'r') + 'Elbow'))
    R.add(lathe('skirt', [(0.2, 0.05), (0.3, -0.3), (0.42, -0.6), (0.5, -0.82)], 14, 'skirt', pos=(0, 0.86, 0), bones=['hips', 'lHip', 'rHip'], taper_z=0.88, flute=(6, 0.06)))
    R.add(lathe('underskirt', [(0.46, -0.7), (0.54, -0.88)], 14, 'underskirt', pos=(0, 0.86, 0), bones=['hips', 'lHip', 'rHip'], taper_z=0.88, flute=(6, 0.06), cap_bottom=True))
    R.add(lathe('shawl', [(0.14, 0.5), (0.36, 0.42), (0.4, 0.2), (0.34, 0.0)], 12, 'shawl', pos=(0, 0.92, -0.03), bind='spine', taper_z=0.8))
    R.add(sheet('shawlB', 0.5, 0.7, 'shawl', pos=(0, 1.34, -0.24), rot=(0.1, math.pi, 0), sag=0.06, wave=0.03, taper=0.2, rows=4, cols=3, bind='spine'))
    R.add(sphere('herbs', 0.12, 'herbs', pos=(0.24, 0.76, 0.12), scale=(1, 1.3, 0.85), segs=6, rings=4, bind='hips'))
    R.add(sphere('skull', 0.19, 'head', pos=(0, 1.52, 0.13), scale=(1, 1.1, 1.05), bind='head', squash=0.05))
    R.add(lathe('scarf', [(0.02, 0.4), (0.14, 0.36), (0.21, 0.26), (0.22, 0.12), (0.18, 0.0)], 10, 'scarf', pos=(0, 1.36, 0.1), bind='head', cap_top=True, sweep=lambda y: (0, -0.06 * (0.4 - y) / 0.4)))
    # the crooked staff, a rattle of bones at the top, a sickle hung below the hand
    st = tube('staff', [(-0.27, 0.04, 0.01), (-0.25, 1.0, 0.04), (-0.33, 1.7, 0.03), (-0.19, 2.0, -0.03)], [0.035, 0.03, 0.03, 0.02], 'wood', segments=6, bind='rElbow'); st.prop = True; R.add(st)
    for i in range(5):
        a = i * 1.26
        R.add(sphere('bone%d' % i, 0.03, 'bone', pos=(-0.19 + math.cos(a) * 0.1, 1.85 - (i % 2) * 0.08, -0.03 + math.sin(a) * 0.1), scale=(1, 1.6, 1), segs=5, rings=3, bind='rElbow')).prop = True
    sk = plate('sickle', [(0, 0), (0.22, 0.05), (0.3, 0.16), (0.24, 0.16), (0.16, 0.09), (0.02, 0.05)], 0.015, 'iron', pos=(-0.25, 0.56, 0.05), rot=(0.3, 0, 0), bind='rElbow'); sk.prop = True; R.add(sk)
    return R, ['scarf']

CHARACTERS.update({'vietra': vietra, 'zherca': zherca, 'streletz': streletz, 'baba': baba})

# ------------------------------------------------------------------ the unquiet dead
def _upir(name, seed):
    R = Recipe(name, atlas=512, seed=seed)
    R.gait = name; R.props = {'display_height': 3.0, 'speed': 2.8 if name == 'upir' else 2.5, 'glow': ['glow'],
                              'rest': {'lShoulder': (-0.7, 0, 0.25), 'rShoulder': (-0.6, 0, -0.25), 'lElbow': (-0.3, 0, 0), 'rElbow': (-0.35, 0, 0), 'spine': (0.42, 0, 0), 'head': (-0.25, 0, 0)}}
    L = R.region
    L('head', 0, 0, 256, 128, 'cyl', ['head']); L('body', 256, 0, 256, 128, 'cyl'); L('skin', 0, 128, 64, 64, 'cyl'); L('hair', 64, 128, 64, 64, 'cyl'); L('rag', 128, 128, 64, 128, 'planar'); L('glow', 192, 128, 32, 32, 'cyl')
    humanoid_bones(R, hips=(0, 0.95, 0), spine_top=(0, 1.5, 0.04), head=(0, 1.59, 0.16), head_top=(0, 1.9, 0.16), shoulder=(0.34, 1.51, 0), elbow=(0.34, 1.15, 0), hand=(0.34, 0.7, 0.02), hip=(0.14, 0.89, 0), knee=(0.14, 0.47, 0), foot=(0.14, 0.05, 0.08))
    hips = R.sv((0, 0.95, 0), (0.26, 0.2), 'body', root=True)
    waist = R.sv((0, 1.1, 0), (0.25, 0.2), 'body'); R.se(hips, waist)
    chest = R.sv((0, 1.38, -0.02), (0.33, 0.23), 'body'); R.se(waist, chest)
    neck = R.sv((0, 1.56, 0.06), (0.12, 0.11), 'skin'); R.se(chest, neck)
    for s in (1, -1):
        sh = R.sv((0.34 * s, 1.5, 0), (0.11, 0.1), 'body'); R.se(chest, sh)
        el = R.sv((0.34 * s, 1.15, 0), (0.08, 0.075), 'skin'); R.se(sh, el)
        wr = R.sv((0.34 * s, 0.8, 0.01), (0.07, 0.065), 'skin'); R.se(el, wr)
        hd = R.sv((0.34 * s, 0.7, 0.03), (0.1, 0.06), 'skin'); R.se(wr, hd)
        for i in range(4):
            x = -0.07 + i * 0.047
            R.add(tube('finger', [(0.34 * s + x, 0.62, 0.08), (0.34 * s + x * 1.3, 0.48, 0.12)], [0.02, 0.008], 'skin', segments=4, bind=('l' if s > 0 else 'r') + 'Elbow'))
        hp = R.sv((0.14 * s, 0.89, 0), (0.12, 0.11), 'skin'); R.se(hips, hp)
        kn = R.sv((0.14 * s, 0.47, 0), (0.085, 0.08), 'skin'); R.se(hp, kn)
        an = R.sv((0.14 * s, 0.1, 0), (0.09, 0.085), 'skin'); R.se(kn, an)
        toe = R.sv((0.14 * s, 0.05, 0.14), (0.09, 0.05), 'skin'); R.se(an, toe)
        R.add(sheet('rag', 0.2, 0.5, 'rag', pos=(s * 0.14, 0.45, 0.1 * s), rot=(0, s * 0.6, 0), sag=0.03, wave=0.02, taper=-0.3, rows=3, cols=1, bones=['hips', 'lHip', 'rHip']))
    R.add(lathe('shroud', [(0.26, 0.0), (0.3, -0.3), (0.32, -0.55)], 10, 'body', pos=(0, 0.95, 0), bones=['hips', 'lHip', 'rHip'], taper_z=0.78))
    R.add(sphere('skull', 0.2, 'head', pos=(0, 1.73, 0.18), scale=(1, 1.2, 1.05), bind='head', squash=0.05))
    R.add(lathe('hair', [(0.19, 0.34), (0.21, 0.22), (0.16, 0.0), (0.1, -0.2)], 8, 'hair', pos=(0, 1.59, 0.16), bind='head', cap_top=True, sweep=lambda y: (0, -0.06 * (0.34 - y) / 0.54)))
    for s in (1, -1): R.add(sphere('eye', 0.03, 'glow', pos=(s * 0.075, 1.75, 0.36), scale=(1, 0.8, 0.6), segs=5, rings=3, bind='head'))
    return R, []
def upir(): return _upir('upir', 131)
def upir_drowned(): return _upir('upir_drowned', 141)

# ------------------------------------------------------------------ Striga
def striga():
    R = Recipe('striga', atlas=512, seed=151)
    R.gait = 'striga'; R.props = {'display_height': 2.6, 'speed': 5.2,
                                  'rest': {'lShoulder': (-1.1, 0, 0.5), 'rShoulder': (-1.0, 0, -0.5), 'lElbow': (-0.8, 0, 0), 'rElbow': (-0.9, 0, 0), 'spine': (0.7, 0, 0), 'head': (-0.6, 0, 0),
                                           'lHip': (-0.9, 0, 0.25), 'rHip': (-0.9, 0, -0.25), 'lKnee': (1.4, 0, 0), 'rKnee': (1.4, 0, 0)}}
    L = R.region
    L('head', 0, 0, 256, 128, 'cyl', ['head']); L('body', 256, 0, 256, 128, 'cyl'); L('skin', 0, 128, 64, 64, 'cyl'); L('hair', 64, 128, 128, 128, 'planar'); L('claw', 192, 128, 32, 64, 'cyl')
    humanoid_bones(R, hips=(0, 0.8, 0), spine_top=(0, 1.34, 0.06), head=(0, 1.38, 0.22), head_top=(0, 1.66, 0.22), shoulder=(0.3, 1.32, 0.04), elbow=(0.3, 0.96, 0.04), hand=(0.3, 0.52, 0.06), hip=(0.13, 0.75, 0), knee=(0.13, 0.37, 0), foot=(0.13, 0.0, 0.06))
    hips = R.sv((0, 0.8, 0), (0.22, 0.17), 'body', root=True)
    waist = R.sv((0, 0.95, 0), (0.21, 0.17), 'body'); R.se(hips, waist)
    chest = R.sv((0, 1.2, -0.02), (0.29, 0.2), 'body'); R.se(waist, chest)
    neck = R.sv((0, 1.36, 0.1), (0.1, 0.09), 'skin'); R.se(chest, neck)
    for s in (1, -1):
        sh = R.sv((0.3 * s, 1.32, 0.04), (0.09, 0.085), 'skin'); R.se(chest, sh)
        el = R.sv((0.3 * s, 0.96, 0.04), (0.065, 0.06), 'skin'); R.se(sh, el)
        wr = R.sv((0.3 * s, 0.62, 0.05), (0.06, 0.055), 'skin'); R.se(el, wr)
        hd = R.sv((0.3 * s, 0.53, 0.07), (0.08, 0.05), 'skin'); R.se(wr, hd)
        for i in range(4):
            x = -0.06 + i * 0.04
            R.add(tube('claw', [(0.3 * s + x, 0.48, 0.09), (0.3 * s + x * 1.6, 0.36, 0.16), (0.3 * s + x * 1.8, 0.24, 0.2)], [0.016, 0.01, 0.003], 'claw', segments=4, bind=('l' if s > 0 else 'r') + 'Elbow'))
        hp = R.sv((0.13 * s, 0.75, 0), (0.11, 0.1), 'skin'); R.se(hips, hp)
        kn = R.sv((0.13 * s, 0.37, 0), (0.075, 0.07), 'skin'); R.se(hp, kn)
        an = R.sv((0.13 * s, 0.04, 0), (0.08, 0.075), 'skin'); R.se(kn, an)
        toe = R.sv((0.13 * s, 0.0, 0.12), (0.08, 0.04), 'skin'); R.se(an, toe)
        for i in range(3):
            x = -0.05 + i * 0.05
            R.add(tube('toeclaw', [(0.13 * s + x, 0.0, 0.16), (0.13 * s + x * 1.5, -0.02, 0.3)], [0.02, 0.006], 'claw', segments=4, bind=('l' if s > 0 else 'r') + 'Knee'))
    R.add(lathe('shroud', [(0.22, 0.0), (0.26, -0.3), (0.3, -0.5)], 9, 'body', pos=(0, 0.8, 0), bones=['hips', 'lHip', 'rHip'], taper_z=0.78))
    R.add(sheet('mane', 0.6, 1.3, 'hair', pos=(0, 1.3, -0.16), rot=(0.15, math.pi, 0), sag=0.1, wave=0.05, taper=0.3, rows=6, cols=4, bones=['spine', 'hips']))
    R.add(sphere('skull', 0.19, 'head', pos=(0, 1.52, 0.24), scale=(1, 1.16, 1.05), bind='head', squash=0.05))
    R.add(lathe('hair', [(0.2, 0.36), (0.23, 0.2), (0.2, 0.0), (0.14, -0.3)], 8, 'hair', pos=(0, 1.38, 0.22), bind='head', cap_top=True, sweep=lambda y: (0, -0.14 * (0.36 - y) / 0.66)))
    return R, []

# ------------------------------------------------------------------ Leshonok
def leshonok():
    R = Recipe('leshonok', atlas=256, seed=173)
    R.gait = 'leshonok'; R.props = {'display_height': 1.7, 'speed': 5.4, 'glow': ['glow'],
                                    'rest': {'lShoulder': (-0.3, 0, 0.4), 'rShoulder': (-0.3, 0, -0.4), 'lElbow': (-0.6, 0, 0), 'rElbow': (-0.6, 0, 0), 'lHip': (-0.3, 0, 0.15), 'rHip': (-0.3, 0, -0.15), 'lKnee': (0.5, 0, 0), 'rKnee': (0.5, 0, 0), 'spine': (0.35, 0, 0)}}
    L = R.region
    L('bark', 0, 0, 128, 128, 'cyl'); L('face', 128, 0, 128, 128, 'cyl', ['head']); L('leaves', 0, 128, 128, 64, 'top'); L('twig', 128, 128, 64, 128, 'cyl'); L('glow', 192, 128, 32, 32, 'cyl')
    humanoid_bones(R, hips=(0, 0.5, 0), spine_top=(0, 0.83, 0.02), head=(0, 0.87, 0.03), head_top=(0, 1.1, 0.03), shoulder=(0.2, 0.83, 0), elbow=(0.2, 0.63, 0), hand=(0.2, 0.43, 0.02), hip=(0.1, 0.47, 0), knee=(0.1, 0.25, 0), foot=(0.1, 0.03, 0.04))
    hips = R.sv((0, 0.5, 0), (0.14, 0.12), 'bark', root=True)
    chest = R.sv((0, 0.72, 0), (0.2, 0.16), 'bark'); R.se(hips, chest)
    neck = R.sv((0, 0.86, 0.02), (0.08, 0.07), 'bark'); R.se(chest, neck)
    for s in (1, -1):
        sh = R.sv((0.2 * s, 0.83, 0), (0.05, 0.045), 'twig'); R.se(chest, sh)
        el = R.sv((0.2 * s, 0.63, 0), (0.04, 0.04), 'twig'); R.se(sh, el)
        hd = R.sv((0.2 * s, 0.44, 0.02), (0.1, 0.07), 'bark'); R.se(el, hd)
        for i in range(4):
            x = -0.08 + i * 0.053
            R.add(tube('claw', [(0.2 * s + x, 0.4, 0.08), (0.2 * s + x * 1.3, 0.32, 0.18), (0.2 * s + x * 1.4, 0.26, 0.24)], [0.02, 0.012, 0.003], 'twig', segments=4, bind=('l' if s > 0 else 'r') + 'Elbow'))
        hp = R.sv((0.1 * s, 0.47, 0), (0.05, 0.05), 'twig'); R.se(hips, hp)
        kn = R.sv((0.1 * s, 0.25, 0), (0.04, 0.04), 'twig'); R.se(hp, kn)
        an = R.sv((0.1 * s, 0.05, 0), (0.045, 0.045), 'twig'); R.se(kn, an)
        for i in range(3):
            a = -0.6 + i * 0.6
            R.add(tube('root', [(0.1 * s, 0.05, 0), (0.1 * s + math.sin(a) * 0.1, 0.01, math.cos(a) * 0.12)], [0.025, 0.004], 'twig', segments=4, bind=('l' if s > 0 else 'r') + 'Knee'))
    for i in range(8):
        a = i / 8 * math.tau
        R.add(tube('twig%d' % i, [(math.sin(a) * 0.15, 0.7, math.cos(a) * 0.12), (math.sin(a) * 0.3, 0.82 + (i % 2) * 0.1, math.cos(a) * 0.24)], [0.02, 0.004], 'twig', segments=4, bind='spine'))
    R.add(sphere('leaves', 0.24, 'leaves', pos=(0, 0.8, 0), scale=(1, 0.42, 0.85), segs=7, rings=3, bind='spine'))
    R.add(sphere('face', 0.16, 'face', pos=(0, 0.99, 0.03), scale=(1, 0.95, 0.95), bind='head'))
    for s in (1, -1):
        R.add(tube('antler', [(s * 0.08, 1.09, 0.03), (s * 0.16, 1.27, -0.01), (s * 0.14, 1.39, 0.05)], [0.02, 0.012, 0.003], 'twig', segments=4, bind='head'))
        R.add(sphere('eye', 0.035, 'glow', pos=(s * 0.06, 1.01, 0.16), scale=(1, 0.7, 0.6), segs=5, rings=3, bind='head'))
    return R, []

# ------------------------------------------------------------------ Vila and Rusalka
def _woman(R, hipsY, headOff, gownProfile, gownRegion, hairRegion, skinRegion, headRegion, flute_amp=0.06, hairLen=1.1):
    hips = R.sv((0, hipsY, 0), (0.17, 0.14), gownRegion, root=True)
    waist = R.sv((0, hipsY + 0.16, 0), (0.15, 0.13), gownRegion); R.se(hips, waist)
    chest = R.sv((0, hipsY + 0.34, 0), (0.2, 0.16), gownRegion); R.se(waist, chest)
    neck = R.sv((0, hipsY + headOff - 0.02, 0.02), (0.07, 0.065), skinRegion); R.se(chest, neck)
    for s in (1, -1):
        sh = R.sv((0.24 * s, hipsY + 0.44, 0), (0.075, 0.07), gownRegion); R.se(chest, sh)
        el = R.sv((0.24 * s, hipsY + 0.14, 0), (0.06, 0.055), skinRegion); R.se(sh, el)
        wr = R.sv((0.24 * s, hipsY - 0.12, 0), (0.045, 0.042), skinRegion); R.se(el, wr)
        hd = R.sv((0.24 * s, hipsY - 0.22, 0.01), (0.07, 0.05), skinRegion); R.se(wr, hd)
        hp = R.sv((0.1 * s, hipsY - 0.04, 0), (0.08, 0.075), skinRegion); R.se(hips, hp)
        kn = R.sv((0.1 * s, hipsY - 0.44, 0), (0.06, 0.055), skinRegion); R.se(hp, kn)
        an = R.sv((0.1 * s, hipsY - 0.8, 0), (0.06, 0.055), skinRegion); R.se(kn, an)
    R.add(lathe('gown', gownProfile, 14, gownRegion, pos=(0, hipsY, 0), bones=['hips', 'lHip', 'rHip'], taper_z=0.85, flute=(7, flute_amp)))
    R.add(sphere('skull', 0.19, headRegion, pos=(0, hipsY + headOff + 0.2, 0.03), scale=(1, 1.16, 1.05), bind='head', squash=0.05))
    hy = hipsY + headOff
    R.add(lathe('hair', [(0.02, 0.44), (0.14, 0.38), (0.21, 0.26), (0.2, 0.1), (0.14, -0.3), (0.06, -hairLen + 0.3)], 10, hairRegion, pos=(0, hy, 0.02), bind='head', cap_top=True, sweep=lambda y: (0, -0.22 * max(0.0, (0.3 - y)) / 1.4)))
    for i in range(3):
        R.add(sheet('strand%d' % i, 0.1, 0.8, hairRegion, pos=((i - 1) * 0.1, hy + 0.1, -0.18), rot=(0.1 * (i - 1), 0, 0.15 * (i - 1)), sag=0.05, wave=0.03, taper=0, rows=5, cols=1, bind='head'))

def vila():
    R = Recipe('vila', atlas=512, seed=179)
    R.gait = 'vila'; R.props = {'display_height': 3.6, 'speed': 4.0, 'glow': ['glow'], 'opacity': 0.8, 'extraClips': ['dance'],
                                'rest': {'lShoulder': (-0.3, 0, 0.55), 'rShoulder': (-0.3, 0, -0.55), 'lElbow': (-0.6, 0, 0.3), 'rElbow': (-0.6, 0, -0.3)}}
    L = R.region
    L('head', 0, 0, 256, 128, 'cyl', ['head']); L('gown', 256, 0, 256, 128, 'cyl'); L('hair', 0, 128, 128, 128, 'cyl'); L('skin', 128, 128, 64, 64, 'cyl'); L('glow', 192, 128, 32, 32, 'top')
    humanoid_bones(R, hips=(0, 1.2, 0), spine_top=(0, 1.68, 0.02), head=(0, 1.7, 0.02), head_top=(0, 1.95, 0.02), shoulder=(0.24, 1.62, 0), elbow=(0.24, 1.32, 0), hand=(0.24, 0.98, 0.01), hip=(0.1, 1.16, 0), knee=(0.1, 0.76, 0), foot=(0.1, 0.36, 0.03))
    _woman(R, 1.2, 0.5, [(0.18, 0.05), (0.3, -0.4), (0.5, -0.9), (0.4, -1.15)], 'gown', 'hair', 'skin', 'head', flute_amp=0.08, hairLen=1.1)
    R.add(lathe('glowdisc', [(0.01, -1.14), (0.5, -1.2)], 12, 'glow', pos=(0, 1.2, 0), bones=['hips'], cap_top=True))
    return R, []

def rusalka():
    R = Recipe('rusalka', atlas=512, seed=197)
    R.gait = 'rusalka'; R.props = {'display_height': 2.9, 'speed': 3.0, 'extraClips': ['dance'],
                                   'rest': {'lShoulder': (-0.3, 0, 0.6), 'rShoulder': (-0.3, 0, -0.6), 'lElbow': (-0.7, 0, 0), 'rElbow': (-0.7, 0, 0)}}
    L = R.region
    L('head', 0, 0, 256, 128, 'cyl', ['head']); L('shift', 256, 0, 256, 128, 'cyl'); L('hair', 0, 128, 128, 128, 'cyl'); L('skin', 128, 128, 64, 64, 'cyl')
    humanoid_bones(R, hips=(0, 0.9, 0), spine_top=(0, 1.34, 0.02), head=(0, 1.36, 0.02), head_top=(0, 1.62, 0.02), shoulder=(0.24, 1.28, 0), elbow=(0.24, 1.0, 0), hand=(0.24, 0.68, 0.01), hip=(0.1, 0.86, 0), knee=(0.1, 0.46, 0), foot=(0.1, 0.06, 0.05))
    _woman(R, 0.9, 0.46, [(0.17, 0.05), (0.24, -0.4), (0.34, -0.8), (0.32, -0.88)], 'shift', 'hair', 'skin', 'head', flute_amp=0.04, hairLen=1.3)
    for s in (1, -1):
        toe = R.sv((0.1 * s, 0.03, 0.12), (0.07, 0.04), 'skin')
        R.se(len(R.sk_verts) - 1, [i for i, v in enumerate(R.sk_verts) if v['pos'] == (0.1 * s, 0.9 - 0.8, 0)][0])
    return R, []

# ------------------------------------------------------------------ Vodnik
def vodnik():
    R = Recipe('vodnik', atlas=512, seed=191)
    R.gait = 'vodnik'; R.props = {'display_height': 2.4, 'speed': 2.4,
                                  'rest': {'lShoulder': (-0.5, 0, 0.35), 'rShoulder': (-0.5, 0, -0.35), 'lElbow': (-0.7, 0, 0), 'rElbow': (-0.7, 0, 0), 'spine': (0.35, 0, 0), 'head': (-0.35, 0, 0),
                                           'lHip': (-1.2, 0, 0.6), 'rHip': (-1.2, 0, -0.6), 'lKnee': (1.9, 0, -0.2), 'rKnee': (1.9, 0, 0.2)}}
    L = R.region
    L('head', 0, 0, 256, 128, 'cyl', ['head']); L('belly', 256, 0, 128, 128, 'cyl'); L('coat', 384, 0, 128, 128, 'cyl'); L('skin', 0, 128, 64, 64, 'cyl'); L('weed', 64, 128, 64, 128, 'cyl'); L('web', 128, 128, 64, 64, 'planar')
    humanoid_bones(R, hips=(0, 0.8, 0), spine_top=(0, 1.34, 0.1), head=(0, 1.36, 0.18), head_top=(0, 1.6, 0.18), shoulder=(0.42, 1.28, 0.02), elbow=(0.42, 0.96, 0.02), hand=(0.42, 0.6, 0.04), hip=(0.2, 0.75, 0), knee=(0.2, 0.41, 0), foot=(0.2, 0.05, 0.1))
    hips = R.sv((0, 0.8, 0), (0.42, 0.34), 'coat', root=True)
    belly = R.sv((0, 1.02, 0.04), (0.5, 0.42), 'belly'); R.se(hips, belly)
    chest = R.sv((0, 1.26, 0.0), (0.46, 0.36), 'coat'); R.se(belly, chest)
    neck = R.sv((0, 1.38, 0.1), (0.2, 0.17), 'skin'); R.se(chest, neck)
    for s in (1, -1):
        sh = R.sv((0.42 * s, 1.28, 0.02), (0.16, 0.15), 'coat'); R.se(chest, sh)
        el = R.sv((0.42 * s, 0.96, 0.02), (0.12, 0.115), 'skin'); R.se(sh, el)
        wr = R.sv((0.42 * s, 0.66, 0.03), (0.13, 0.12), 'skin'); R.se(el, wr)
        R.add(plate('hand', [(-0.18, 0), (0.18, 0), (0.24, -0.3), (0.1, -0.26), (0, -0.36), (-0.1, -0.26), (-0.24, -0.3)], 0.06, 'web', pos=(0.42 * s, 0.6, 0.06), bind=('l' if s > 0 else 'r') + 'Elbow'))
        hp = R.sv((0.2 * s, 0.75, 0), (0.19, 0.18), 'skin'); R.se(hips, hp)
        kn = R.sv((0.2 * s, 0.41, 0), (0.13, 0.12), 'skin'); R.se(hp, kn)
        an = R.sv((0.2 * s, 0.08, 0), (0.12, 0.11), 'skin'); R.se(kn, an)
        R.add(plate('foot', [(-0.16, 0), (0.16, 0), (0.22, 0.34), (0.08, 0.3), (0, 0.4), (-0.08, 0.3), (-0.22, 0.34)], 0.05, 'web', pos=(0.2 * s, 0.05, 0.08), rot=(-math.pi / 2, 0, 0), bind=('l' if s > 0 else 'r') + 'Knee'))
    R.add(sphere('skull', 0.3, 'head', pos=(0, 1.46, 0.22), scale=(1, 0.8, 1), bind='head', squash=0.2))
    R.add(lathe('weed', [(0.26, 0.3), (0.3, 0.12), (0.24, -0.2), (0.08, -0.4)], 8, 'weed', pos=(0, 1.42, 0.16), bind='head', cap_top=True, sweep=lambda y: (0, -0.2 * (0.3 - y) / 0.7)))
    for s in (1, -1): R.add(sphere('eye', 0.07, 'skin', pos=(s * 0.13, 1.56, 0.44), scale=(1, 1.1, 0.7), segs=6, rings=4, bind='head'))
    return R, []

CHARACTERS.update({'upir': upir, 'upir_drowned': upir_drowned, 'striga': striga, 'leshonok': leshonok, 'vila': vila, 'rusalka': rusalka, 'vodnik': vodnik})

# ------------------------------------------------------------------ quadrupeds
def _quad_bones(R, body_head, body_tail, neck, neck_tail, head, head_tail, legs):
    """legs: {name: (hip, knee, hoof)}"""
    R.bone('body', body_head, body_tail)
    R.bone('neck', neck, neck_tail, 'body')
    R.bone('head', head, head_tail, 'neck')
    for n, (hip, knee, hoof) in legs.items():
        R.bone(n, hip, knee, 'body'); R.bone(n.replace('Leg', 'Knee'), knee, hoof, n)

def bear():
    R = Recipe('bear', atlas=512, seed=83); R.kind = 'quadruped'; R.skin_smooth = 0.6
    R.props = {'display_height': 2.46, 'speed': 2.5, 'ut': 'bear', 'glow': ['glow'], 'deathDrop': 0.55}
    L = R.region
    L('fur', 0, 0, 256, 128, 'cyl'); L('bearhead', 256, 0, 128, 128, 'cyl', ['head', 'neck']); L('paw', 384, 0, 64, 64, 'top'); L('claw', 448, 0, 32, 64, 'cyl'); L('collar', 0, 128, 128, 32, 'cyl')
    L('wood', 128, 128, 64, 64, 'cyl'); L('glow', 192, 128, 32, 32, 'front'); L('muzzle', 224, 128, 64, 64, 'cyl'); L('ear', 288, 128, 32, 32, 'front')
    legs = {'flLeg': ((0.4, 1.08, 0.58), (0.4, 0.53, 0.62), (0.4, 0.02, 0.72)), 'frLeg': ((-0.4, 1.08, 0.58), (-0.4, 0.53, 0.62), (-0.4, 0.02, 0.72)),
            'blLeg': ((0.4, 1.1, -0.68), (0.4, 0.55, -0.74), (0.4, 0.02, -0.6)), 'brLeg': ((-0.4, 1.1, -0.68), (-0.4, 0.55, -0.74), (-0.4, 0.02, -0.6))}
    _quad_bones(R, (0, 1.12, -1.0), (0, 1.12, 0.7), (0, 1.24, 0.72), (0, 1.2, 1.08), (0, 1.2, 1.08), (0, 1.06, 1.5), legs)
    R.uv_modes['fur'] = 'side'
    # the barrel: a horizontal chain from tail to muzzle
    spine = R.chain([((0, 1.17, -1.1), (0.3, 0.28)), ((0, 1.14, -0.85), (0.58, 0.55)), ((0, 1.12, -0.4), (0.64, 0.6)), ((0, 1.2, 0.1), (0.66, 0.7)), ((0, 1.28, 0.45), (0.66, 0.72)), ((0, 1.26, 0.7), (0.5, 0.56))], 'fur')
    R.sk_verts[spine[2]]['root'] = True
    neck = R.chain([((0, 1.24, 0.95), (0.38, 0.4)), ((0, 1.18, 1.2), (0.34, 0.3))], 'bearhead'); R.se(spine[-1], neck[0])
    R.sk_verts[neck[0]]['region'] = 'fur'
    muzzle = R.sv((0, 1.08, 1.5), (0.17, 0.15), 'muzzle'); R.se(neck[-1], muzzle)
    for n, (hip, knee, hoof) in legs.items():
        front = hip[2] > 0
        h = R.sv(hip, (0.28, 0.3) if front else (0.3, 0.36), 'fur'); R.se(spine[4] if front else spine[1], h)
        k = R.sv(knee, (0.19, 0.19), 'fur'); R.se(h, k)
        a = R.sv((hip[0], 0.1, knee[2]), (0.2, 0.18), 'paw'); R.se(k, a)
        toe = R.sv((hip[0], 0.04, knee[2] + 0.26), (0.18, 0.08), 'paw'); R.se(a, toe)
        for i in range(4):
            x = -0.13 + i * 0.087
            R.add(tube('claw', [(hip[0] + x, 0.06, knee[2] + 0.36), (hip[0] + x * 1.15, -0.01, knee[2] + 0.5)], [0.03, 0.006], 'claw', segments=4, bind=n.replace('Leg', 'Knee')))
    for s in (1, -1): R.add(sphere('ear', 0.1, 'ear', pos=(s * 0.25, 1.5, 1.12), scale=(1, 1, 0.6), segs=6, rings=4, bind='head'))
    R.add(torus('collar', 0.41, 0.06, 'collar', pos=(0, 1.2, 0.92), rot=(0.2, 0, 0), bind='neck'))
    R.add(sphere('knot', 0.1, 'collar', pos=(0, 1.62, 0.86), scale=(1, 0.7, 0.9), segs=6, rings=3, bind='neck'))
    for s in (1, -1): R.add(sheet('collarTail', 0.08, 0.5, 'collar', pos=(s * 0.06, 1.6, 0.8), rot=(-1.2, 0, s * 0.3), sag=0.02, taper=-0.3, rows=3, cols=1, bind='neck'))
    R.add(tube('cord', [(0, 0.8, 1.02), (0, 0.7, 1.06)], [0.012, 0.012], 'wood', segments=3, bind='neck', cap=False))
    R.add(lathe('amulet', [(0.1, 0.02), (0.1, -0.02)], 8, 'wood', pos=(0, 0.64, 1.08), bind='neck', cap_top=True, cap_bottom=True))
    R.add(sphere('amuletGlow', 0.03, 'glow', pos=(0, 0.64, 1.11), scale=(1, 1, 0.5), segs=5, rings=3, bind='neck'))
    return R, ['collar']

def deer_rider():
    R = Recipe('deer_rider', atlas=512, seed=71); R.kind = 'quadruped'; R.skin_smooth = 0.5
    R.props = {'display_height': 5.44, 'speed': 7.2, 'ut': 'deer', 'deathDrop': 1.1,
               'rest': {'r_lShoulder': (-0.9, 0, 0.15), 'r_lElbow': (-0.9, 0, 0), 'r_rShoulder': (-0.9, 0, -0.2), 'r_rElbow': (-0.9, 0, 0)}}
    L = R.region
    L('hide', 0, 0, 256, 128, 'side'); L('deerhead', 256, 0, 128, 128, 'cyl', ['head', 'neck']); L('antler', 384, 0, 64, 128, 'cyl'); L('leg', 448, 0, 64, 128, 'cyl'); L('saddlecloth', 0, 128, 128, 64, 'planar')
    L('saddle', 128, 128, 64, 64, 'top'); L('rhead', 192, 128, 128, 64, 'cyl', ['r_head']); L('tunic', 320, 128, 64, 64, 'cyl', ['r_hips', 'r_spine', 'r_lShoulder', 'r_rShoulder']); L('rcloak', 384, 128, 64, 64, 'planar')
    L('fur', 448, 128, 64, 64, 'cyl'); L('rleather', 0, 192, 64, 64, 'cyl', ['r_hips', 'r_lElbow', 'r_rElbow']); L('rhand', 64, 192, 32, 32, 'cyl', ['r_lElbow', 'r_rElbow']); L('spear', 96, 192, 32, 128, 'cyl'); L('iron', 128, 192, 32, 32, 'planar')
    L('tail', 160, 192, 32, 64, 'cyl'); L('bone', 192, 192, 32, 32, 'cyl')
    legs = {'flLeg': ((0.26, 1.55, 0.72), (0.26, 0.95, 0.74), (0.26, 0.04, 0.8)), 'frLeg': ((-0.26, 1.55, 0.72), (-0.26, 0.95, 0.74), (-0.26, 0.04, 0.8)),
            'blLeg': ((0.27, 1.7, -0.78), (0.27, 0.75, -1.0), (0.27, 0.04, -0.85)), 'brLeg': ((-0.27, 1.7, -0.78), (-0.27, 0.75, -1.0), (-0.27, 0.04, -0.85))}
    _quad_bones(R, (0, 1.75, -1.0), (0, 1.75, 0.8), (0, 1.95, 0.85), (0, 2.5, 1.29), (0, 2.5, 1.29), (0, 2.4, 1.9), legs)
    # the rider's bones hang off the deer's body
    R.bone('r_hips', (0, 2.3, -0.05), (0, 2.42, -0.05), 'body')
    R.bone('r_spine', (0, 2.42, -0.05), (0, 2.82, -0.03), 'r_hips')
    R.bone('r_head', (0, 2.82, -0.03), (0, 3.1, -0.03), 'r_spine')
    for s, p in ((1, 'l'), (-1, 'r')):
        R.bone('r_' + p + 'Shoulder', (0.32 * s, 2.86, 0), (0.32 * s, 2.56, 0), 'r_spine')
        R.bone('r_' + p + 'Elbow', (0.32 * s, 2.56, 0), (0.32 * s, 2.26, 0.01), 'r_' + p + 'Shoulder')
    spine = R.chain([((0, 1.77, -1.15), (0.2, 0.22)), ((0, 1.8, -0.95), (0.4, 0.42)), ((0, 1.77, -0.5), (0.44, 0.46)), ((0, 1.75, 0.0), (0.42, 0.44)), ((0, 1.81, 0.5), (0.44, 0.5)), ((0, 1.85, 0.85), (0.38, 0.44))], 'hide')
    R.sk_verts[spine[2]]['root'] = True
    neck = R.chain([((0, 2.2, 1.0), (0.26, 0.3)), ((0, 2.5, 1.17), (0.2, 0.24)), ((0, 2.58, 1.31), (0.17, 0.18))], 'hide'); R.se(spine[-1], neck[0])
    head = R.chain([((0, 2.58, 1.49), (0.19, 0.2)), ((0, 2.5, 1.75), (0.13, 0.14)), ((0, 2.42, 1.95), (0.1, 0.1))], 'deerhead'); R.se(neck[-1], head[0])
    for n, (hip, knee, hoof) in legs.items():
        front = hip[2] > 0
        h = R.sv(hip, (0.16, 0.2) if front else (0.2, 0.26), 'leg'); R.se(spine[4] if front else spine[1], h)
        k = R.sv(knee, (0.1, 0.1), 'leg'); R.se(h, k)
        f = R.sv((hip[0], 0.3, knee[2] + (0.02 if front else 0.1)), (0.085, 0.085), 'leg'); R.se(k, f)
        hf = R.sv(hoof, (0.1, 0.09), 'leg'); R.se(f, hf)
    R.add(tube('tail', [(0, 1.95, -1.05), (0, 1.85, -1.25), (0, 1.69, -1.36)], [0.08, 0.06, 0.02], 'tail', segments=5, bind='body'))
    for s in (1, -1):
        R.add(plate('ear', [(-0.06, 0), (0.06, 0), (0.03, 0.3), (-0.03, 0.3)], 0.02, 'hide', pos=(s * 0.16, 2.64, 1.23), rot=(0.3, 0, -s * 1.1), bind='head'))
        beam = [(s * 0.09, 2.65, 1.27), (s * 0.3, 2.88, 1.15), (s * 0.52, 3.1, 1.17), (s * 0.68, 3.3, 1.29), (s * 0.72, 3.48, 1.45), (s * 0.72, 3.6, 1.55)]
        R.add(tube('beam', beam, [0.06, 0.052, 0.044, 0.036, 0.026, 0.008], 'antler', segments=5, bind='head'))
        for i, t in [(0, (s * 0.22, 2.82, 1.61)), (1, (s * 0.36, 3.2, 1.43)), (2, (s * 0.5, 3.42, 1.23)), (3, (s * 0.9, 3.48, 1.19)), (3, (s * 0.58, 3.56, 1.37))]:
            R.add(tube('tine', [beam[i], t], [0.03, 0.006], 'antler', segments=4, bind='head'))
    # saddle cloth and saddle
    for s in (1, -1): R.add(sheet('saddlecloth', 1.0, 0.7, 'saddlecloth', pos=(s * 0.47, 2.0, 0.3 * s), rot=(0, s * math.pi / 2, s * 0.15), sag=0, wave=0, taper=-0.1, rows=2, cols=5, bind='body'))
    R.add(sphere('saddle', 0.42, 'saddle', pos=(0, 2.16, -0.04), scale=(0.75, 0.22, 1), segs=8, rings=4, bind='body'))
    for s in (1, -1): R.add(tube('stirrup', [(s * 0.44, 1.85, 0.1), (s * 0.4, 1.45, 0.12)], [0.03, 0.03], 'saddle', segments=4, bind='body'))
    # the rider: a second skin body hanging from the saddle
    rh = R.sv((0, 2.3, -0.05), (0.22, 0.18), 'tunic', root=True)
    rs = R.sv((0, 2.44, -0.04), (0.23, 0.18), 'tunic'); R.se(rh, rs)
    rc = R.sv((0, 2.72, -0.02), (0.3, 0.22), 'tunic'); R.se(rs, rc)
    rn = R.sv((0, 2.86, -0.02), (0.12, 0.1), 'tunic'); R.se(rc, rn)
    for s in (1, -1):
        sh = R.sv((0.32 * s, 2.86, 0), (0.1, 0.095), 'tunic'); R.se(rc, sh)
        el = R.sv((0.32 * s, 2.56, 0), (0.09, 0.085), 'rleather'); R.se(sh, el)
        hd = R.sv((0.32 * s, 2.28, 0.01), (0.09, 0.08), 'rhand'); R.se(el, hd)
        th = R.sv((0.42 * s, 2.1, 0.3), (0.09, 0.09), 'tunic'); R.se(rh, th)
        bt = R.sv((0.5 * s, 1.68, 0.12), (0.085, 0.08), 'rleather'); R.se(th, bt)
        toe = R.sv((0.5 * s, 1.6, 0.26), (0.09, 0.05), 'rleather'); R.se(bt, toe)
    R.add(sphere('rskull', 0.19, 'rhead', pos=(0, 3.0, -0.01), scale=(1, 1.1, 1), bind='r_head', squash=0.05))
    R.add(lathe('rbeard', [(0.12, 0.0), (0.14, -0.08), (0.08, -0.2), (0.03, -0.26)], 7, 'fur', pos=(0, 2.84, 0.12), bind='r_head', taper_z=0.55, cap_top=True, cap_bottom=True))
    R.add(lathe('rhat', [(0.02, 0.46), (0.15, 0.42), (0.2, 0.34), (0.2, 0.26), (0.19, 0.24)], 9, 'fur', pos=(0, 2.82, -0.01), bind='r_head', cap_top=True))
    R.add(lathe('rcollar', [(0.2, 0.54), (0.32, 0.44), (0.3, 0.38)], 8, 'fur', pos=(0, 2.42, -0.04), bind='r_spine'))
    R.add(sheet('rcloak', 0.5, 0.8, 'rcloak', pos=(0, 2.88, -0.24), rot=(0.1, math.pi, 0), sag=0.06, wave=0.02, taper=0.4, rows=4, cols=4, bind='r_spine'))
    sp = lathe('spear', [(0.028, 1.3), (0.032, 0.0), (0.035, -0.6)], 6, 'spear', bind='r_rElbow', cap_top=True, cap_bottom=True)
    sb = lathe('spearband', [(0.05, 1.36), (0.05, 1.26)], 6, 'fur', bind='r_rElbow')
    sh_ = plate('spearhead', [(-0.06, 0), (0.06, 0), (0.03, 0.22), (0, 0.4), (-0.03, 0.22)], 0.03, 'iron', pos=(0, 1.36, 0), bind='r_rElbow')
    for p in (sp, sb, sh_):
        xform(p, rot=(-0.6, 0, 0), pos=(-0.32, 2.28, 0.03)); p.prop = True; R.add(p)
    return R, ['rcloak', 'saddlecloth']

CHARACTERS.update({'bear': bear, 'deer_rider': deer_rider})

# ------------------------------------------------------------------ the Leshy
def forest_spirit():
    R = Recipe('forest_spirit', atlas=512, seed=113); R.skin_smooth = 0.5
    R.gait = 'spirit'; R.props = {'display_height': 7.38, 'speed': 2.2, 'glow': ['glow', 'core'], 'rest': {'spine': (0.25, 0, 0), 'lShoulder': (0, 0, 0.1), 'rShoulder': (0, 0, -0.1)}}
    L = R.region
    L('bark', 0, 0, 128, 256, 'cyl'); L('wood', 128, 0, 64, 256, 'cyl'); L('moss', 192, 0, 64, 64, 'cyl'); L('mossdark', 192, 64, 64, 64, 'cyl'); L('glow', 192, 128, 32, 32, 'front'); L('core', 224, 128, 32, 32, 'cyl')
    L('face', 256, 0, 128, 128, 'cyl', ['head']); L('stumptop', 384, 0, 64, 64, 'top')
    humanoid_bones(R, hips=(0, 2.05, 0), spine_top=(0, 3.45, 0.1), head=(0, 3.55, 0.15), head_top=(0, 4.2, 0.15), shoulder=(0.6, 3.4, 0), elbow=(0.72, 2.4, 0.06), hand=(0.72, 1.4, 0.26), hip=(0.28, 1.95, 0), knee=(0.34, 1.0, 0.1), foot=(0.34, 0.1, 0.0))
    hips = R.sv((0, 2.05, 0), (0.44, 0.38), 'bark', root=True)
    mid = R.sv((0, 2.6, 0.05), (0.4, 0.34), 'bark'); R.se(hips, mid)
    chest = R.sv((0, 3.15, 0.05), (0.62, 0.44), 'bark'); R.se(mid, chest)
    neck = R.sv((0, 3.45, 0.1), (0.3, 0.28), 'bark'); R.se(chest, neck)
    for s in (1, -1):
        b = ('l' if s > 0 else 'r')
        sh = R.sv((0.6 * s, 3.4, 0), (0.15, 0.14), 'bark'); R.se(chest, sh)
        el = R.sv((0.72 * s, 2.4, 0.06), (0.17, 0.16), 'wood'); R.se(sh, el)
        wr = R.sv((0.72 * s, 1.55, 0.22), (0.12, 0.11), 'bark'); R.se(el, wr)
        hd = R.sv((0.72 * s, 1.4, 0.28), (0.13, 0.1), 'wood'); R.se(wr, hd)
        for i in range(4):
            a = -0.6 + i * 0.4
            R.add(tube('claw', [(0.72 * s, 1.4, 0.3), (0.72 * s + math.sin(a) * 0.25, 1.05, 0.44 + math.cos(a) * 0.18), (0.72 * s + math.sin(a) * 0.3, 0.75, 0.55 + math.cos(a) * 0.2)], [0.05, 0.035, 0.005], 'wood', segments=5, bind=b + 'Elbow'))
        R.add(sphere('shoulderMoss', 0.22, 'moss', pos=(0.62 * s, 3.5, -0.02), scale=(1, 0.6, 0.9), segs=7, rings=3, bind=b + 'Shoulder'))
        R.add(sphere('elbowMoss', 0.14, 'moss', pos=(0.77 * s, 2.05, 0.08), scale=(1, 1.6, 1), segs=6, rings=4, bind=b + 'Elbow'))
        hp = R.sv((0.28 * s, 1.95, 0), (0.17, 0.16), 'bark'); R.se(hips, hp)
        kn = R.sv((0.34 * s, 1.0, 0.1), (0.2, 0.19), 'wood'); R.se(hp, kn)
        an = R.sv((0.34 * s, 0.2, 0.0), (0.17, 0.16), 'bark'); R.se(kn, an)
        for i in range(5):
            a = -1.2 + i * 0.6
            R.add(tube('root', [(0.34 * s, 0.2, 0.0), (0.34 * s + math.sin(a) * 0.35, 0.04, math.cos(a) * 0.35), (0.34 * s + math.sin(a) * 0.6, 0.0, math.cos(a) * 0.6)], [0.1, 0.06, 0.005], 'bark', segments=5, bind=b + 'Knee'))
        R.add(sphere('kneeMoss', 0.16, 'moss', pos=(0.38 * s, 0.72, 0.2), scale=(1, 1.3, 0.9), segs=6, rings=3, bind=b + 'Knee'))
    # bark strands twisting up the torso, moss and roots hanging from the hips
    for k in range(7):
        a = k / 7 * math.tau
        p0 = (math.sin(a) * 0.35, 2.25, math.cos(a) * 0.3); p1 = (math.sin(a + 0.5) * 0.6, 2.95, math.cos(a + 0.5) * 0.46); p2 = (math.sin(a + 0.9) * 0.45, 3.5, math.cos(a + 0.9) * 0.34)
        R.add(tube('strand%d' % k, [p0, p1, p2], [0.1, 0.12, 0.09], 'bark', segments=5, bind='spine'))
        R.add(sphere('knot%d' % k, 0.12, 'bark', pos=p1, segs=5, rings=3, bind='spine'))
    for i in range(8):
        a = i / 8 * math.tau
        R.add(tube('hiproot%d' % i, [(math.sin(a) * 0.36, 2.05, math.cos(a) * 0.3), (math.sin(a) * 0.5, 1.25 - (i % 3) * 0.2, math.cos(a) * 0.42)], [0.11, 0.005], 'moss' if i % 2 else 'bark', segments=5, bind='hips'))
    R.add(sphere('core', 0.24, 'core', pos=(0, 2.9, 0.42), segs=7, rings=4, bind='spine'))
    R.add(sphere('crown', 0.62, 'bark', pos=(0, 3.45, 0.1), scale=(1, 0.35, 0.7), segs=8, rings=4, bind='spine'))
    R.add(sphere('crownMoss', 0.5, 'moss', pos=(0.1, 3.58, 0.05), scale=(1, 0.28, 0.72), segs=8, rings=3, bind='spine'))
    # the stump head, glowing eyes, antlers of dead wood
    R.add(lathe('stump', [(0.34, 0.63), (0.32, 0.3), (0.28, 0.0)], 9, 'face', pos=(0, 3.55, 0.15), bind='head', cap_bottom=True))
    R.add(lathe('stumptop', [(0.005, 0.64), (0.33, 0.63)], 9, 'stumptop', pos=(0, 3.55, 0.15), bind='head', cap_top=True))
    for s in (1, -1): R.add(sphere('eye', 0.09, 'glow', pos=(s * 0.1, 3.91, 0.45), scale=(1, 0.55, 0.5), segs=6, rings=3, bind='head'))
    for i in range(4):
        R.add(tube('beardroot%d' % i, [(-0.15 + i * 0.1, 3.73, 0.45), (-0.2 + i * 0.13, 3.2 - (i % 2) * 0.2, 0.51)], [0.06, 0.005], 'moss', segments=4, bind='head'))
    for s in (1, -1):
        b0 = (s * 0.16, 4.13, 0.15); b1 = (s * 0.42, 4.53, 0.03); b2 = (s * 0.78, 4.77, 0.13); b3 = (s * 0.95, 5.05, 0.27); b4 = (s * 1.0, 5.27, 0.35)
        R.add(tube('antler', [b0, b1, b2, b3, b4], [0.11, 0.085, 0.065, 0.045, 0.006], 'wood', segments=6, bind='head'))
        for i, (frm, to) in enumerate([(b1, (s * 0.36, 5.05, 0.23)), (b1, (s * 0.55, 4.7, 0.45)), (b2, (s * 1.18, 4.85, -0.05)), (b2, (s * 0.7, 5.1, -0.05)), (b0, (s * 0.26, 4.53, 0.49))]):
            R.add(tube('tine%d' % i, [frm, to], [0.05, 0.006], 'wood', segments=4, bind='head'))
        R.add(sphere('antlerMoss', 0.1, 'moss', pos=(b1[0] * 0.9, b1[1] - 0.05, b1[2]), scale=(1, 0.6, 1), segs=5, rings=3, bind='head'))
    return R, []

CHARACTERS.update({'forest_spirit': forest_spirit})
