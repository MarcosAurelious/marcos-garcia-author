"""Re-anchor boss sprite frames so the body stays put from frame to frame (removes side-to-side jitter),
and trim slivers of neighbouring sprites off frame edges. Rewrites the atlas JSON inside quest/game.js.
Usage: python quest/tools/realign_sprites.py   (run from the repo root)"""
import re, json, numpy as np
from pathlib import Path
from PIL import Image
from scipy import ndimage
G = Path('quest/game.js'); src = G.read_text()
# (atlas const, set, image, frames drawn mirrored in-game)
JOBS = [('ATLAS', 'commander', 'quest/img/sprites.webp', set()), ('EATLAS', 'engine', 'quest/img/enemies.webp', {('sweep', 2)})]

def body_mask(c):
    r, g, b, a = [c[..., i].astype(int) for i in range(4)]
    m = a > 60
    fire = (r > 170) & (g < 170) & (b < 110) & (r - b > 90)                 # flames, red trails
    glow = (r > 200) & (g > 170) & (b < 140)                                 # white-hot cores
    slash = (b > 150) & (r > 120) & (g < 140) & (b - g > 60)                 # purple energy slash
    return m & ~fire & ~glow & ~slash

def trim(c, f):
    """Drop edge rows/cols that hold only small detached bits (neighbouring sprite slivers)."""
    x, y, w, h, ax, ay = f
    m = c[..., 3] > 30; lab, n = ndimage.label(m, np.ones((3, 3)))
    if n < 2: return f, c
    sizes = ndimage.sum(m, lab, range(1, n + 1)); keep = np.isin(lab, [i + 1 for i, s in enumerate(sizes) if s >= 150])
    rows = np.where(keep.any(1))[0]; cols = np.where(keep.any(0))[0]
    t, bt, l, rt = rows[0], h - 1 - rows[-1], cols[0], w - 1 - cols[-1]
    def sliver(sl): return m[sl].any() and not keep[sl].any()
    T = t if t and sliver(np.s_[:t, :]) else 0; B = bt if bt and sliver(np.s_[h - bt:, :]) else 0
    Lf = l if l and sliver(np.s_[:, :l]) else 0; R = rt if rt and sliver(np.s_[:, w - rt:]) else 0
    if not (T or B or Lf or R): return f, c
    nh = h - T - B; nay = nh if ay == h else ay - T      # feet sat on the bottom edge: keep them on the ground after trimming
    return [int(v) for v in (x + Lf, y + T, w - Lf - R, nh, ax - Lf, nay)], c[T:h - B, Lf:w - R]

for const, name, img, mirrored in JOBS:
    m = re.search(r'const ' + const + r' = (\{.*?\});\n', src); A = json.loads(m.group(1))
    im = np.array(Image.open(img).convert('RGBA'))
    info = []
    for anim, frs in A[name].items():
        for i, f in enumerate(frs):
            nf, c = trim(im[f[1]:f[1] + f[3], f[0]:f[0] + f[2]], f)
            if nf != f: print(f'  trimmed {name}.{anim}[{i}] {f} -> {nf}')
            frs[i] = nf; bm = body_mask(c); cx = np.where(bm)[1].mean()
            info.append((anim, i, cx, (anim, i) in mirrored))
    idle = [cx - A[name]['idle'][i][4] for a, i, cx, mir in info if a == 'idle']
    target = float(np.median(idle))
    for anim, i, cx, mir in info:
        f = A[name][anim][i]; old = f[4]
        f[4] = int(round(cx + target)) if mir else int(round(cx - target))
        print(f'  {name}.{anim}[{i}] ax {old} -> {f[4]}{"  (mirrored)" if mir else ""}')
    src = src[:m.start(1)] + json.dumps(A, separators=(',', ':')) + src[m.end(1):]
G.write_text(src); print('game.js updated')
