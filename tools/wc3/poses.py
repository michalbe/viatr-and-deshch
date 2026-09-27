"""
The game's procedural gaits (game/src/anim.js) ported to Python so the GLB clips are sampled
from the same motion: a walk cycle, idles with fidgets, attack, the Wind Dance, the Rain Rite,
building, and a death. Every pose is a dict of bone -> (x, y, z) Three-style euler deltas plus
a dict of bone -> (dx, dy, dz) offsets, with the same axis conventions as anim.js:
  shoulder.x < 0 swings the arm forward/up; lShoulder.z > 0 / rShoulder.z < 0 raise sideways.
  hip.x < 0 swings the thigh forward; knee.x > 0 bends the shin back; elbow.x < 0 bends forward.
"""
import math
sin, cos, PI = math.sin, math.cos, math.pi
def mx(a, b): return max(a, b)
def ease(t): t = max(0.0, min(1.0, t)); return t * t * (3 - 2 * t)
def swing(t, dur):
    k = t / dur
    if k <= 0 or k >= 1: return 0.0
    return ease(k / 0.45) if k < 0.45 else 1 - ease((k - 0.45) / 0.55)

GAITS = {
    'default':  dict(stride=0.55, lift=0.8, arms=0.45, bob=0.04, lean=0.06, sway=0.06, rate=6.2),
    'vietra':   dict(stride=0.5, lift=0.7, arms=0.3, bob=0.03, lean=-0.04, sway=0.12, rate=6.6, hipSway=0.14, armOut=0.3),
    'zherca':   dict(stride=0.42, lift=0.55, arms=0.2, bob=0.02, lean=0.1, sway=0.03, rate=5.4, staff='r'),
    'baba':     dict(stride=0.34, lift=0.5, arms=0.15, bob=0.02, lean=0.3, sway=0.05, rate=6.8, staff='r', crouch=0.05, headDown=0.2),
    'streletz': dict(stride=0.55, lift=0.8, arms=0.45, bob=0.035, lean=0.08, sway=0.05, rate=6.4, bow=True),
    'vitez':    dict(stride=0.48, lift=0.7, arms=0.15, bob=0.07, lean=0.14, sway=0.1, rate=5.2, stomp=True),
    'spirit':   dict(stride=0.4, lift=0.5, arms=0.25, bob=0.06, lean=0.12, sway=0.14, rate=4.2, stomp=True),
    'leshonok': dict(stride=0.7, lift=1.1, arms=0.6, bob=0.09, lean=0.25, sway=0.08, rate=9, scamper=True),
    'upir':     dict(stride=0.32, lift=0.2, arms=0.1, bob=0.01, lean=0.22, sway=0.16, rate=5.5, shamble=True, headDown=-0.15),
    'upir_drowned': dict(stride=0.28, lift=0.15, arms=0.08, bob=0.01, lean=0.28, sway=0.2, rate=5.2, shamble=True, headDown=-0.1),
    'striga':   dict(stride=0.75, lift=1.0, arms=0.2, bob=0.05, lean=0.55, sway=0.06, rate=8.5, prowl=True, crouch=0.14),
    'vodnik':   dict(stride=0.0, lift=0.0, arms=0.2, bob=0.12, lean=0.1, sway=0.0, rate=5.0, hop=True),
    'vila':     dict(stride=0.0, lift=0.0, arms=0.0, bob=0.0, lean=-0.05, sway=0.1, rate=2.0, float=True),
    'rusalka':  dict(stride=0.0, lift=0.0, arms=0.0, bob=0.0, lean=0.0, sway=0.08, rate=2.0, float=True),
}

class Pose:
    def __init__(self): self.d = {}; self.o = {}
    def set(self, n, x=0.0, y=0.0, z=0.0): self.d[n] = (x, y, z)
    def off(self, n, dy=0.0, dz=0.0): self.o[n] = (0.0, dy, dz)
    def out(self): return self.d, self.o

def humanoid(ut, G, mode, t, s, phase=0.0, attackT=0.0, attackDur=1.0, fidget_which=0, fidget_k=0.0, uid=0):
    """one sampled pose; s = display height, the same scaling anim.js uses for offsets"""
    P = Pose(); set_ = P.set; off = P.off
    g = lambda k, d=0: G.get(k, d)
    lean, sway, headDown = g('lean'), g('sway'), g('headDown', 0)
    if mode == 'walk':
        p = phase
        if g('float'):
            b = t * 2.2 + uid
            off('hips', 0.12 * s * 0.3 + sin(b) * 0.03 * s)
            set_('spine', lean, 0, sin(b * 0.5) * sway); set_('head', -0.1, sin(b * 0.3) * 0.2, 0)
            set_('lShoulder', -0.3 + sin(b) * 0.1, 0, 0.5 + sin(b * 0.7) * 0.15); set_('rShoulder', -0.3 - sin(b) * 0.1, 0, -0.5 - sin(b * 0.7 + 1) * 0.15)
            set_('lElbow', -0.6); set_('rElbow', -0.6)
            set_('lHip', 0.25); set_('rHip', 0.15); set_('lKnee', 0.2); set_('rKnee', 0.35)
            return P.out()
        if g('hop'):
            h = mx(0, sin(p)); c = mx(0, -sin(p))
            off('hips', (h * 0.14 - c * 0.06) * s)
            set_('lHip', -0.9 + h * 0.5); set_('rHip', -0.9 + h * 0.5); set_('lKnee', 1.6 - h * 0.9); set_('rKnee', 1.6 - h * 0.9)
            set_('spine', 0.35 - h * 0.3); set_('head', -0.3 + h * 0.2)
            set_('lShoulder', -0.5 + h * 0.6, 0, 0.5); set_('rShoulder', -0.5 + h * 0.6, 0, -0.5); set_('lElbow', -0.7); set_('rElbow', -0.7)
            return P.out()
        sw = g('stride'); arms = g('arms'); lift = g('lift')
        if g('shamble'):
            set_('lHip', -sin(p) * sw * 1.3); set_('lKnee', mx(0, sin(p + 1.4)) * 0.9)
            set_('rHip', sin(p) * sw * 0.5 + 0.15); set_('rKnee', 0.05)
            off('hips', (abs(sin(p)) * 0.02 - 0.03) * s)
            set_('spine', lean + sin(p * 0.5) * 0.06, sin(p) * 0.1, sin(p) * sway); set_('head', headDown + sin(p * 0.5) * 0.1, sin(p * 0.37) * 0.25, 0.25)
            set_('lShoulder', -0.9 + sin(p) * arms, 0, 0.15); set_('rShoulder', -0.6 - sin(p) * arms, 0, -0.35); set_('lElbow', -0.3); set_('rElbow', -0.9)
            return P.out()
        set_('lHip', -sin(p) * sw); set_('rHip', sin(p) * sw)
        set_('lKnee', mx(0, sin(p + 1.4)) * lift); set_('rKnee', mx(0, -sin(p + 1.4)) * lift)
        crouch = g('crouch', 0)
        if crouch:
            set_('lHip', -0.3 - sin(p) * sw); set_('rHip', -0.3 + sin(p) * sw); set_('lKnee', 0.5 + mx(0, sin(p + 1.4)) * lift); set_('rKnee', 0.5 + mx(0, -sin(p + 1.4)) * lift)
        if g('bow'):
            set_('lShoulder', 0.1, 0, 0.05); set_('lElbow', 0); set_('rShoulder', -sin(p) * arms, 0, -0.08); set_('rElbow', -0.35)
        elif g('staff'):
            st = G['staff'] == 'r'
            set_('rShoulder' if st else 'lShoulder', -0.25, 0, -0.1 if st else 0.1); set_('rElbow' if st else 'lElbow', -0.5)
            set_('lShoulder' if st else 'rShoulder', sin(p) * arms, 0, 0.1 if st else -0.1); set_('lElbow' if st else 'rElbow', -0.3)
        elif g('prowl'):
            set_('lShoulder', -1.3 + sin(p) * arms, 0, 0.3); set_('rShoulder', -1.3 - sin(p) * arms, 0, -0.3); set_('lElbow', -1.0); set_('rElbow', -1.0)
        elif g('stomp'):
            set_('lShoulder', sin(p) * arms, 0, 0.12 + sin(p) * 0.05); set_('rShoulder', -sin(p) * arms, 0, -0.12 + sin(p) * 0.05)
        else:
            ao = g('armOut', 0)
            set_('lShoulder', sin(p) * arms, 0, 0.08 + ao); set_('rShoulder', -sin(p) * arms, 0, -0.08 - ao); set_('lElbow', -0.35); set_('rElbow', -0.35)
        bob = mx(0, sin(p * 2)) * g('bob') if g('scamper') else abs(sin(p)) * g('bob')
        off('hips', (-crouch * s if crouch else 0) + bob * s)
        hs = g('hipSway', 0)
        set_('spine', lean + (sin(p * 2) * 0.08 if g('scamper') else 0), sin(p) * (0.03 if hs else 0.06), sin(p) * sway)
        set_('hips', 0, 0, sin(p) * hs if hs else 0)
        set_('head', -lean * 0.6 + headDown, -sin(p) * 0.05 if hs else 0, -sin(p) * sway * 0.5)
        return P.out()
    if mode == 'dance':
        b = t * 3.1
        set_('lShoulder', -0.25 + sin(b) * 0.25, 0, 2.3 + sin(b * 0.5) * 0.35)
        set_('rShoulder', -0.25 - sin(b) * 0.25, 0, -2.3 - sin(b * 0.5 + 1.3) * 0.35)
        set_('lElbow', -0.5 - sin(b) * 0.3); set_('rElbow', -0.5 + sin(b) * 0.3)
        st = mx(0, sin(b)); st2 = mx(0, -sin(b))
        set_('lHip', -st * 0.7); set_('lKnee', st * 1.1); set_('rHip', -st2 * 0.7); set_('rKnee', st2 * 1.1)
        off('hips', -abs(sin(b)) * 0.07 * s + (0.1 * s if g('float') else 0))
        set_('spine', -0.12, 0, sin(b * 0.5) * 0.18); set_('head', -0.25, 0, sin(b * 0.5) * 0.15)
        return P.out()
    if mode == 'rite':
        cyc = (t % 6) / 6
        off('hips', -0.13 * s)
        set_('lHip', -1.0); set_('lKnee', 1.5); set_('rHip', 0.1); set_('rKnee', 1.2)
        raise_ = ease(cyc / 0.5) if cyc < 0.5 else 1 - ease((cyc - 0.5) / 0.5)
        set_('lShoulder', -0.6 - raise_ * 2.1, 0, 0.25); set_('lElbow', -0.4 + raise_ * 0.2)
        strike = swing(t % 3, 0.7)
        set_('rShoulder', -0.5 - strike * 1.1, 0, -0.15); set_('rElbow', -0.6 + strike * 0.5)
        set_('spine', 0.2 - raise_ * 0.35); set_('head', -raise_ * 0.45)
        return P.out()
    if mode == 'build':
        k = (t * 2.4) % 1
        h = ease(k / 0.6) if k < 0.6 else 1 - ease((k - 0.6) / 0.4)
        set_('rShoulder', -2.3 + h * 2.1); set_('rElbow', -0.6 + h * 0.4)
        set_('lShoulder', -0.8); set_('lElbow', -0.9)
        set_('spine', 0.35); set_('lHip', -0.5); set_('lKnee', 0.7); set_('rHip', 0.2); set_('rKnee', 0.3)
        off('hips', -0.08 * s)
        return P.out()
    if mode == 'attack':
        k = swing(attackT, attackDur)
        if G.get('bow'):
            set_('lShoulder', -1.1, 0, 0.1); set_('lElbow', 0.6)
            draw = ease(min(1, attackT / (attackDur * 0.6))) if attackT < attackDur * 0.8 else 0
            set_('rShoulder', -1.45, 0, -0.1 * draw); set_('rElbow', -1.3 * draw - 0.3)
            set_('spine', 0, -0.35, 0); set_('head', 0, 0.3, 0); set_('lHip', -0.2); set_('rHip', 0.2)
        elif ut == 'spirit':
            set_('lShoulder', -2.6 + k * 2.4); set_('rShoulder', -2.6 + k * 2.4); set_('lElbow', -0.4); set_('rElbow', -0.4); set_('spine', -0.2 + k * 0.6)
        elif g('float'):
            off('hips', 0.1 * s + k * 0.08 * s)
            set_('lShoulder', -0.6 - k * 0.8, 0, 0.6 + k * 1.6); set_('rShoulder', -0.6 - k * 0.8, 0, -0.6 - k * 1.6)
            set_('lElbow', -0.4 + k * 0.3); set_('rElbow', -0.4 + k * 0.3); set_('spine', -0.2 * k, k * 1.5, 0); set_('head', -0.3 * k)
        elif g('prowl') or g('scamper'):
            set_('lShoulder', -2.4 + k * 2.6, 0, 0.5 - k * 0.3); set_('rShoulder', -2.4 + k * 2.6, 0, -0.5 + k * 0.3)
            set_('lElbow', -0.8 + k * 0.5); set_('rElbow', -0.8 + k * 0.5); set_('spine', 0.1 + k * 0.5); set_('head', -0.3 + k * 0.2)
            set_('lHip', -0.6 - k * 0.3); set_('lKnee', 0.8); set_('rHip', 0.3); set_('rKnee', 0.3); off('hips', -0.1 * s)
        elif g('shamble'):
            set_('lShoulder', -2.4 + k * 2.2, 0, 0.3); set_('rShoulder', -2.4 + k * 2.2, 0, -0.3); set_('lElbow', -0.6); set_('rElbow', -0.6)
            set_('spine', -0.15 + k * 0.6); set_('head', 0.2 - k * 0.3); set_('lHip', -0.3); set_('rHip', 0.2)
        elif g('hop'):
            off('hips', -0.08 * s + k * 0.1 * s)
            set_('lHip', -0.9); set_('rHip', -0.9); set_('lKnee', 1.5); set_('rKnee', 1.5)
            set_('lShoulder', -0.3 - k * 1.5, 0, 0.6 - k * 0.5); set_('rShoulder', -0.3 - k * 1.5, 0, -0.6 + k * 0.5); set_('lElbow', -0.9 + k * 0.8); set_('rElbow', -0.9 + k * 0.8)
            set_('spine', 0.4 - k * 0.2); set_('head', -0.35 + k * 0.2)
        else:
            # anticipation: the axe goes back over the shoulder, the body coils, then the whole
            # weight comes through the swing
            set_('rShoulder', -2.7 + k * 3.1, 0, -0.2); set_('rElbow', -0.9 + k * 0.8)
            set_('lShoulder', -0.4, 0, 0.3); set_('lElbow', -0.3)
            set_('spine', -0.1 + k * 0.35, 0.4 - k * 0.8, 0)
            set_('lHip', -0.45); set_('lKnee', 0.4); set_('rHip', 0.3)
        return P.out()
    if mode == 'death':
        # the knees go, the body folds forward and the whole figure lies down on its side
        k = ease(min(1.0, t / 0.9))
        set_('lHip', -0.9 * k); set_('rHip', -0.6 * k); set_('lKnee', 1.6 * k); set_('rKnee', 1.3 * k)
        set_('spine', 0.5 * k, 0, 0); set_('head', 0.3 * k, 0, 0.3 * k)
        set_('lShoulder', -0.6 * k, 0, 0.4 * k); set_('rShoulder', -0.3 * k, 0, -0.5 * k); set_('lElbow', -0.4 * k); set_('rElbow', -0.2 * k)
        set_('hips', 0.35 * k, 0, -1.55 * k)
        off('hips', -0.62 * s * k)
        return P.out()
    # idle
    b = t * 1.6 + uid; k = fidget_k; which = fidget_which
    crouch = g('crouch', 0)
    if crouch:
        off('hips', -crouch * s); set_('lHip', -0.35); set_('rHip', -0.35); set_('lKnee', 0.6); set_('rKnee', 0.6)
    if g('float'):
        f = t * 1.8 + uid
        off('hips', 0.12 * s * 0.3 + sin(f) * 0.04 * s)
        set_('spine', lean, sin(f * 0.3) * 0.2, sin(f * 0.5) * sway); set_('head', -0.05 + sin(f * 0.7) * 0.05, sin(f * 0.23) * 0.4, 0)
        set_('lShoulder', -0.2 + sin(f * 0.9) * 0.15, 0, 0.35 + k * 0.9); set_('rShoulder', -0.2 - sin(f * 0.9) * 0.15, 0, -0.35 - k * 0.9)
        set_('lElbow', -0.7 + k * 0.4); set_('rElbow', -0.7 + k * 0.4)
        set_('lHip', 0.2); set_('rHip', 0.1); set_('lKnee', 0.25); set_('rKnee', 0.4)
        return P.out()
    if g('hop'):
        off('hips', -0.06 * s + abs(sin(b * 0.8)) * 0.02 * s)
        set_('lHip', -0.9, 0, 0.3); set_('rHip', -0.9, 0, -0.3); set_('lKnee', 1.6); set_('rKnee', 1.6)
        set_('spine', 0.35 + sin(b) * 0.04); set_('head', -0.3 + k * 0.2, sin(b * 0.4) * 0.5 * (1 - k), 0)
        set_('lShoulder', -0.4 + k * 0.3, 0, 0.5); set_('rShoulder', -0.4 + k * 0.3, 0, -0.5); set_('lElbow', -0.8); set_('rElbow', -0.8)
        return P.out()
    set_('spine', lean * 0.5 + sin(b) * 0.03, 0, 0); set_('head', headDown + sin(b * 0.7) * 0.06, sin(b * 0.3) * 0.2, 0)
    set_('lShoulder', 0.02, 0, 0.08 + sin(b) * 0.02); set_('rShoulder', 0.02, 0, -0.08 - sin(b) * 0.02)
    set_('lElbow', -0.2); set_('rElbow', -0.25)
    if g('bow'): set_('lShoulder', -0.3, 0, 0.1); set_('lElbow', -0.5)
    if g('staff'): set_('rShoulder', -0.25, 0, -0.1); set_('rElbow', -0.5)
    if g('stomp') and ut == 'vitez': set_('rShoulder', -0.1, 0, -0.05); set_('rElbow', -0.2); set_('lShoulder', -0.15, 0, 0.1); set_('lElbow', -0.3)
    if g('shamble'):
        set_('spine', lean, sin(b * 0.4) * 0.1, sin(b * 0.6) * 0.1); set_('head', headDown, sin(b * 0.5) * 0.4, 0.3 + sin(b * 1.7) * 0.05)
        set_('lShoulder', -0.6, 0, 0.15); set_('rShoulder', -0.4, 0, -0.35); set_('lElbow', -0.3); set_('rElbow', -0.9); set_('rHip', 0.15)
    if g('prowl'):
        set_('lShoulder', -1.1, 0, 0.35); set_('rShoulder', -1.1, 0, -0.35); set_('lElbow', -1.1); set_('rElbow', -1.1); set_('head', 0.1 + sin(b * 0.6) * 0.1, sin(b * 0.5) * 0.6, 0)
    if g('scamper'):
        off('hips', abs(sin(b * 2.5)) * 0.02 * s); set_('head', sin(b * 1.3) * 0.15, sin(b * 0.9) * 0.6, sin(b * 0.7) * 0.2)
    if k <= 0: return P.out()
    if ut == 'vitez':
        if which == 0: set_('rShoulder', -0.6 * k, 0, -0.05); set_('rElbow', -0.9 * k)
        elif which == 1: set_('spine', 0, 0.4 * k, 0); set_('head', 0, 0.3 * k, 0)
        else: set_('lShoulder', -0.15 + 0.3 * k, 0, 0.1 + 0.25 * k); set_('lElbow', -0.3 - 0.6 * k); set_('spine', 0.08 * k)
    elif ut == 'streletz':
        if which == 0: set_('rShoulder', -1.2 * k, 0, -0.1); set_('rElbow', -1.4 * k); set_('head', 0.2 * k)
        elif which == 1: set_('head', 0, 0.7 * k, 0); set_('spine', 0, 0.2 * k, 0)
        else: set_('lShoulder', -0.3 - 0.9 * k, 0, 0.1); set_('lElbow', -0.5 + 0.3 * k); set_('head', -0.3 * k)
    elif ut == 'vietra':
        if which == 0: set_('lShoulder', 0, 0, 0.08 + 0.9 * k); set_('rShoulder', 0, 0, -0.08 - 0.9 * k); set_('spine', 0, 0, 0.1 * k)
        elif which == 1: set_('hips', 0, 0, 0.12 * k); set_('spine', 0, 0, -0.1 * k); set_('head', 0, 0, 0.1 * k)
        else: set_('rShoulder', -1.6 * k, 0, -0.3 * k); set_('rElbow', -1.8 * k); set_('head', 0.15 * k, 0, -0.1 * k)
    elif ut == 'zherca':
        if which == 0: set_('head', 0.5 * k); set_('spine', 0.1 * k)
        elif which == 1: set_('lShoulder', -0.9 * k, 0, 0.2); set_('lElbow', -1.3 * k); set_('head', 0.3 * k)
        else: set_('rShoulder', -0.25 - 0.4 * k, 0, -0.1); set_('rElbow', -0.5 - 0.3 * k); set_('spine', 0, -0.2 * k, 0)
    elif ut == 'baba':
        if which == 0: set_('spine', 0.15 + 0.15 * k); set_('head', 0.2 - 0.5 * k, 0.6 * k, 0)
        elif which == 1: set_('rShoulder', -0.25 - 0.5 * k, 0, -0.1); set_('rElbow', -0.5 - 0.6 * k); set_('head', 0.3 * k)
        else: set_('lShoulder', -1.4 * k, 0, 0.15); set_('lElbow', -1.9 * k); set_('head', -0.2 * k)
    elif ut == 'spirit':
        if which == 0: set_('spine', -0.15 * k, 0.5 * k, 0); set_('head', 0, 0.4 * k, 0)
        elif which == 1: set_('lShoulder', -1.0 * k, 0, 0.6 * k); set_('rShoulder', -1.0 * k, 0, -0.6 * k); set_('spine', -0.2 * k)
        else: set_('spine', 0.25 * k); set_('head', 0.3 * k)
    elif ut == 'leshonok':
        if which == 0: set_('rShoulder', -2.6 * k, 0, -0.4 * k); set_('rElbow', -2.2 * k); set_('head', -0.2 * k, 0, 0.2 * k)
        elif which == 1: off('hips', -0.12 * k * s); set_('lHip', -0.8 * k); set_('rHip', -0.8 * k); set_('lKnee', 1.3 * k); set_('rKnee', 1.3 * k); set_('head', -0.2 * k)
        else: set_('spine', 0, 0.8 * k, 0); set_('head', 0, 0.6 * k, 0)
    elif ut in ('upir', 'upir_drowned'):
        if which == 0: set_('head', headDown - 0.3 * k, 0, 0.3 - 0.6 * k)
        elif which == 1: set_('lShoulder', -0.6 - 0.9 * k, 0, 0.15); set_('lElbow', -0.3 - 0.5 * k)
        else: set_('spine', lean + 0.2 * k, 0, 0)
    elif ut == 'striga':
        if which == 0: off('hips', -(crouch + 0.1 * k) * s); set_('lHip', -0.35 - 0.6 * k); set_('rHip', -0.35 - 0.6 * k); set_('lKnee', 0.6 + 0.8 * k); set_('rKnee', 0.6 + 0.8 * k)
        elif which == 1: set_('head', 0.1, 0, 0.5 * k)
        else: set_('lShoulder', -1.1 - 0.8 * k, 0, 0.35); set_('lElbow', -1.1 + 0.6 * k); set_('rShoulder', -1.1 - 0.8 * k, 0, -0.35); set_('rElbow', -1.1 + 0.6 * k)
    else:
        if which == 0: set_('head', 0, 0.6 * k, 0)
        elif which == 1: set_('spine', 0, 0, 0.1 * k)
        else: set_('rShoulder', -0.5 * k); set_('rElbow', -0.8 * k)
    return P.out()

def fidget_k(t, start=1.0, dur=1.6):
    """0 -> 1 -> 0 over a window that starts at `start`"""
    x = t - start
    if x < 0 or x > dur: return 0.0
    return ease(x / (dur / 2)) if x < dur / 2 else 1 - ease((x - dur / 2) / (dur / 2))

class HumanoidSampler:
    """clip definitions for a humanoid recipe: (duration, loop, fn(t) -> (deltas, offsets))"""
    def __init__(self, ut, extra=()):
        self.ut = ut; self.extra = list(extra)
    def clip_names(self, R):
        return ['idle', 'fidget1', 'fidget2', 'fidget3', 'walk', 'attack', 'death'] + self.extra
    def clip(self, R, name):
        ut = self.ut; G = GAITS.get(R.gait, GAITS['default'])
        # offsets in anim.js scale with the display height; the mesh is built at real size, so use its own height
        s = R.height; sc = 1.0
        def H(mode, **kw):
            def fn(t):
                d, o = humanoid(ut, G, mode, t, R.props.get('display_height', 3.0) * sc, **kw(t) if callable(kw) else kw)
                return d, o
            return fn
        if name == 'idle':
            return 4.0, True, lambda t: humanoid(ut, G, 'idle', t if t < 2 else 4 - t if False else t, s * sc)   # breathing, 4 s
        if name.startswith('fidget'):
            which = int(name[-1]) - 1
            return 2.4, False, lambda t: humanoid(ut, G, 'idle', t, s * sc, fidget_which=which, fidget_k=fidget_k(t, 0.4, 1.6))
        if name == 'walk':
            period = math.tau / (G['rate'] / max(1.2, R.props.get('display_height', 3.0)) * R.props.get('speed', 3.0))
            return period, True, lambda t: humanoid(ut, G, 'walk', t, s * sc, phase=t / period * math.tau)
        if name == 'attack':
            return 1.0, False, lambda t: humanoid(ut, G, 'attack', t, s * sc, attackT=t, attackDur=1.0)
        if name == 'death':
            return 1.2, False, lambda t: humanoid(ut, G, 'death', t, s * sc)
        if name == 'dance':
            return 4.05, True, lambda t: humanoid(ut, G, 'dance', t, s * sc)
        if name == 'rite':
            return 6.0, True, lambda t: humanoid(ut, G, 'rite', t, s * sc)
        if name == 'build':
            return 1 / 2.4 * 2, True, lambda t: humanoid(ut, G, 'build', t, s * sc)
        raise KeyError(name)

# ------------------------------------------------------------------ quadrupeds (bear, deer + rider)
def quadruped(ut, mode, t, s, phase=0.0, attackT=0.0, attackDur=1.0, fidget_which=0, fidget_k=0.0, uid=0, death_drop=0.5):
    P = Pose(); set_ = P.set; off = P.off
    fast = ut == 'deer'
    if mode == 'walk':
        p = phase; sw = 0.75 if fast else 0.5
        if fast:
            set_('flLeg', sin(p) * sw); set_('frLeg', sin(p + 0.5) * sw)
            set_('blLeg', sin(p + PI) * sw); set_('brLeg', sin(p + PI + 0.5) * sw)
            set_('flKnee', mx(0, -cos(p)) * 0.9); set_('frKnee', mx(0, -cos(p + 0.5)) * 0.9)
            set_('body', sin(p) * 0.08); off('body', abs(sin(p)) * 0.12 * s * 0.4)
            set_('neck', -sin(p) * 0.12); set_('head', sin(p) * 0.1)
        else:
            set_('flLeg', sin(p) * sw); set_('brLeg', sin(p) * sw); set_('frLeg', -sin(p) * sw); set_('blLeg', -sin(p) * sw)
            set_('flKnee', mx(0, -cos(p)) * 0.5); set_('brKnee', mx(0, -cos(p)) * 0.5); set_('frKnee', mx(0, cos(p)) * 0.5); set_('blKnee', mx(0, cos(p)) * 0.5)
            set_('body', 0, 0, sin(p) * 0.06); off('body', abs(cos(p)) * 0.04 * s)
            set_('head', 0, sin(p) * 0.15, 0); set_('neck', 0.05)
        if fast:
            set_('r_spine', 0.25); set_('r_rShoulder', -0.5); set_('r_rElbow', -0.8); set_('r_lShoulder', -0.6); set_('r_lElbow', -0.8)
    elif mode == 'attack':
        k = swing(attackT, attackDur)
        if ut == 'bear':
            set_('body', -k * 0.55); set_('flLeg', -k * 1.6); set_('frLeg', -k * 1.2); set_('blLeg', k * 0.45); set_('brLeg', k * 0.45)
            set_('neck', k * 0.3); set_('head', k * 0.35)
        else:
            set_('neck', k * 0.5); set_('head', k * 0.4); set_('flLeg', -k * 0.5); set_('body', -k * 0.12)
            set_('r_rShoulder', -0.6 - k * 1.2); set_('r_rElbow', -1.2 + k * 1.1); set_('r_spine', 0, 0.3 - k * 0.6, 0)
    elif mode == 'death':
        k = ease(min(1.0, t / 0.9))
        set_('body', 0.1 * k, 0, 1.5 * k); off('body', -death_drop * k)
        for n in ('flLeg', 'frLeg', 'blLeg', 'brLeg'): set_(n, 0.6 * k)
        set_('neck', 0.3 * k); set_('head', 0.3 * k)
        if fast: set_('r_spine', 0.5 * k); set_('r_head', 0.4 * k)
    else:
        b = t * 1.3 + uid; k = fidget_k; which = fidget_which
        set_('body', sin(b) * 0.015); set_('neck', sin(b * 0.6) * 0.08); set_('head', sin(b * 0.4) * 0.1, sin(b * 0.23) * 0.4, 0)
        if fast: set_('r_spine', sin(t * 1.2) * 0.04); set_('r_head', 0, sin(t * 0.4) * 0.4, 0); set_('r_rShoulder', -0.3); set_('r_rElbow', -0.6)
        if k > 0:
            if ut == 'bear':
                if which == 0: set_('neck', -0.3 * k); set_('head', -0.4 * k, 0.3 * k, 0)
                elif which == 1: set_('head', 0, sin(b * 9) * 0.25 * k, 0); set_('neck', 0.1 * k)
                else: set_('flLeg', -0.5 * k); set_('flKnee', 0.6 * k); set_('body', -0.04 * k)
            else:
                if which == 0: set_('neck', 0.5 * k); set_('head', 0.3 * k)
                elif which == 1: set_('frLeg', -0.4 * k); set_('frKnee', 0.9 * k)
                else: set_('head', 0, 0.9 * k, 0); set_('neck', -0.1 * k)
    return P.out()

class QuadrupedSampler:
    def __init__(self, ut): self.ut = ut
    def clip_names(self, R): return ['idle', 'fidget1', 'fidget2', 'fidget3', 'walk', 'attack', 'death']
    def clip(self, R, name):
        ut = self.ut; s = R.height; drop = R.props.get('deathDrop', 0.5)
        if name == 'idle': return 4.0, True, lambda t: quadruped(ut, 'idle', t, s)
        if name.startswith('fidget'):
            which = int(name[-1]) - 1
            return 2.4, False, lambda t: quadruped(ut, 'idle', t, s, fidget_which=which, fidget_k=fidget_k(t, 0.4, 1.6))
        if name == 'walk':
            H = R.props.get('display_height', 3.0); rate = (1.6 if ut == 'deer' else 2.6) / max(1.0, H * 0.6)
            period = math.tau / (rate * R.props.get('speed', 3.0))
            return period, True, lambda t: quadruped(ut, 'walk', t, s, phase=t / period * math.tau)
        if name == 'attack': return 1.0, False, lambda t: quadruped(ut, 'attack', t, s, attackT=t, attackDur=1.0)
        if name == 'death': return 1.2, False, lambda t: quadruped(ut, 'death', t, s, death_drop=drop)
        raise KeyError(name)
