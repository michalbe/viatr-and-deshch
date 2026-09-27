"""
Build WC3-style GLB characters with headless Blender:
  /Applications/Blender.app/Contents/MacOS/Blender -b -P tools/wc3/build.py -- vitez vietra
Writes game/models/<name>.glb + .json and refreshes game/models/index.json.
"""
import sys, os, json, traceback
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lib, poses, characters

def main():
    args = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
    names = args or list(characters.CHARACTERS)
    out = os.path.normpath(os.path.join(HERE, '..', '..', 'game', 'models'))
    os.makedirs(out, exist_ok=True)
    ok = []
    for n in names:
        try:
            R, team = characters.CHARACTERS[n]()
            sampler = poses.QuadrupedSampler(R.props.get('ut', n)) if R.kind == 'quadruped' else poses.HumanoidSampler(n, extra=R.props.get('extraClips', []))
            lib.build(R, sampler, out, team, R.props.get('glow', []))
            ok.append(n)
        except Exception:
            traceback.print_exc()
            print('FAILED', n)
    idx_path = os.path.join(out, 'index.json')
    have = set(json.load(open(idx_path))) if os.path.exists(idx_path) else set()
    have |= set(ok)
    have = sorted(x for x in have if os.path.exists(os.path.join(out, x + '.glb')))
    json.dump(have, open(idx_path, 'w'))
    print('index', have)

main()
