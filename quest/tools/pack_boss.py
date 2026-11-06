"""Cut a generated boss sprite sheet (transparent PNG, one row per animation) into frames and pack a game atlas.
Usage: python quest/tools/pack_boss.py SHEET.png OUT.webp IDLE_HEIGHT anim:count anim:count ...
Prints the atlas JSON ({anim: [[x,y,w,h,ax,ay], ...]}) for game.js.
- rows are found from empty horizontal bands; loose bits (thrown orbs, dust, sparks) join the nearest body in their row
- every frame gets the same scale, chosen so the idle pose stands IDLE_HEIGHT game pixels tall
- ax = body centre (energy effects ignored) so frames don't jitter; ay = the feet (lowest body pixel)"""
import sys, json, numpy as np
from PIL import Image
from scipy import ndimage

src, out, idle_h = sys.argv[1], sys.argv[2], float(sys.argv[3])
spec = [(a.split(':')[0], int(a.split(':')[1])) for a in sys.argv[4:]]
im = Image.open(src).convert('RGBA'); A = np.array(im); A[..., 3][A[..., 3] < 24] = 0
alpha = A[..., 3] > 0

def effect(c):   # glowing energy / fire pixels: not part of the body
    r, g, b = [c[..., i].astype(int) for i in range(3)]
    return ((b > 150) & (r > 120) & (g < 140) & (b - g > 60)) | ((r > 200) & (g > 120) & (b < 90) & (r - b > 130))

# 1) rows
filled = alpha.sum(1) > 2; rows = []; y = 0
while y < len(filled):
    if filled[y]:
        s = y
        while y < len(filled) and (filled[y] or filled[y:y + 6].any()): y += 1
        if y - s > 25: rows.append((s, y))
    else: y += 1
assert len(rows) == len(spec), f'found {len(rows)} rows, expected {len(spec)}: {rows}'

frames = {}
for (y0, y1), (anim, count) in zip(rows, spec):
    m = alpha[y0:y1]; lab, n = ndimage.label(m, np.ones((3, 3)))
    sizes = ndimage.sum(m, lab, range(1, n + 1)); objs = ndimage.find_objects(lab)
    order = np.argsort(-sizes); bodies = sorted(order[:count], key=lambda k: objs[k][1].start)
    assert sizes[bodies[-1]] > sizes.max() * 0.15, f'{anim}: expected {count} figures, the smallest found looks like a fragment'
    centers = [(objs[k][1].start + objs[k][1].stop) / 2 for k in bodies]
    groups = {k: [k] for k in bodies}
    for k in range(n):
        if k in groups or sizes[k] < 4: continue
        cx = (objs[k][1].start + objs[k][1].stop) / 2
        groups[bodies[int(np.argmin([abs(cx - c) for c in centers]))]].append(k)
    frames[anim] = []
    for k in bodies:
        keep = np.isin(lab, [g + 1 for g in groups[k]]); ys, xs = np.where(keep)
        x0, x1, ya, yb = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
        crop = A[y0 + ya:y0 + yb, x0:x1].copy(); crop[..., 3] = np.where(keep[ya:yb, x0:x1], crop[..., 3], 0)
        body = (lab[ya:yb, x0:x1] == k + 1) & ~effect(crop)
        bys, bxs = np.where(body)
        frames[anim].append({'img': crop, 'cx': bxs.mean(), 'feet': bys.max() + 1})

scale = idle_h / np.median([f['img'].shape[0] for f in frames[spec[0][0]]])
# 2) pack, scaled, into a sheet: one row per animation
PAD = 2; tiles = []; W = 0; H = 0; atlas = {}
for anim, _ in spec:
    x = 0; rowh = 0; atlas[anim] = []
    for f in frames[anim]:
        img = Image.fromarray(f['img']); w, h = max(1, round(img.width * scale)), max(1, round(img.height * scale))
        tiles.append((img.resize((w, h), Image.LANCZOS), x + PAD, H + PAD))
        atlas[anim].append([x + PAD, H + PAD, w, h, int(round(f['cx'] * scale)), int(round(f['feet'] * scale))])
        x += w + PAD * 2; rowh = max(rowh, h + PAD * 2)
    W = max(W, x); H += rowh
sheet = Image.new('RGBA', (W, H), (0, 0, 0, 0))
for t, x, y in tiles: sheet.alpha_composite(t, (x, y))
sheet.save(out, lossless=True, method=6) if out.endswith('.webp') else sheet.save(out)
print(json.dumps(atlas, separators=(',', ':')))
print(f'scale {scale:.3f}  sheet {W}x{H}', file=sys.stderr)
