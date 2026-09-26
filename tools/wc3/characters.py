"""
Character recipes. Positions are the game's Three.js coordinates at the size the code-built
assets use (hips around y = 1.0, head top around 1.9); the game scales the GLB to the unit's
display height. Region names and atlas rectangles must match game/skins/<name>.js, which paints
the very same atlas the old code-built asset painted.
"""
import math
from lib import Recipe, lathe, box, sphere, plate, tube, sheet, Part
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
