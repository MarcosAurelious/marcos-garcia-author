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
spec = [(a.split(':')[0], int(a.split(':')[1].rstrip('!~'))) for a in sys.argv[4:]]
MATCH = {a.split(':')[0] for a in sys.argv[4:] if a.endswith('~')}   # anim:count~ -> rescale that row so the body matches the idle height (the generator drew it smaller)
SOLO = {a.split(':')[0] for a in sys.argv[4:] if a.endswith('!')}   # anim:count!  -> drop loose bits outside the body (e.g. a boulder the game spawns itself)
im = Image.open(src).convert('RGBA'); A = np.array(im); A[..., 3][A[..., 3] < 24] = 0
alpha = A[..., 3] > 0

def effect(c):   # glowing energy / fire pixels: not part of the body
    r, g, b = [c[..., i].astype(int) for i in range(3)]
    return ((b > 150) & (r > 120) & (g < 140) & (b - g > 60)) | ((r > 200) & (g > 120) & (b < 90) & (r - b > 130))

# 1) figures: the N largest blobs are the N frames; sort by height on the sheet, then fill rows in order
lab, n = ndimage.label(alpha, np.ones((3, 3))); sizes = ndimage.sum(alpha, lab, range(1, n + 1)); objs = ndimage.find_objects(lab)
total = sum(c for _, c in spec); bodies = list(np.argsort(-sizes)[:total])
assert sizes[bodies[-1]] > sizes[bodies[0]] * 0.12, 'the smallest "frame" looks like a fragment: check the frame counts'
cy = lambda k: (objs[k][0].start + objs[k][0].stop) / 2; cxf = lambda k: (objs[k][1].start + objs[k][1].stop) / 2
bodies.sort(key=cy); rowsets = []; i = 0
for anim, count in spec: rowsets.append(sorted(bodies[i:i + count], key=cxf)); i += count
owner = {k: a for (a, _), ks in zip(spec, rowsets) for k in ks}
groups = {k: [k] for k in bodies}
for k in range(n):
    if k in groups or sizes[k] < 4: continue
    near = min(bodies, key=lambda b: (cxf(b) - cxf(k)) ** 2 + (cy(b) - cy(k)) ** 2)
    bw = objs[near][1].stop - objs[near][1].start; gap = max(objs[near][1].start - objs[k][1].stop, objs[k][1].start - objs[near][1].stop)
    if owner[near] in SOLO and gap > 0.12 * bw: continue   # clearly separate from the body: a projectile the game spawns itself
    groups[near].append(k)
frames = {}
for (anim, count), ks in zip(spec, rowsets):
    frames[anim] = []
    for k in ks:
        keep = np.isin(lab, [g + 1 for g in groups[k]]); ys, xs = np.where(keep)
        x0, x1, ya, yb = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
        crop = A[ya:yb, x0:x1].copy(); crop[..., 3] = np.where(keep[ya:yb, x0:x1], crop[..., 3], 0)
        body = (lab[ya:yb, x0:x1] == k + 1) & ~effect(crop); bys, bxs = np.where(body)
        frames[anim].append({'img': crop, 'cx': bxs.mean(), 'feet': bys.max() + 1})

scale = idle_h / np.median([f['img'].shape[0] for f in frames[spec[0][0]]])
body_h = lambda a: np.median([f['img'].shape[0] for f in frames[a]])
row_k = {a: body_h(spec[0][0]) / body_h(a) for a in MATCH}
if row_k: print('row rescale', {a: round(v, 3) for a, v in row_k.items()}, file=sys.stderr)
# 2) pack, scaled, into a sheet: one row per animation
PAD = 2; tiles = []; W = 0; H = 0; atlas = {}
for anim, _ in spec:
    x = 0; rowh = 0; atlas[anim] = []
    for f in frames[anim]:
        k = scale * row_k.get(anim, 1); img = Image.fromarray(f['img']); w, h = max(1, round(img.width * k)), max(1, round(img.height * k))
        tiles.append((img.resize((w, h), Image.LANCZOS), x + PAD, H + PAD))
        atlas[anim].append([x + PAD, H + PAD, w, h, int(round(f['cx'] * k)), int(round(f['feet'] * k))])
        x += w + PAD * 2; rowh = max(rowh, h + PAD * 2)
    W = max(W, x); H += rowh
sheet = Image.new('RGBA', (W, H), (0, 0, 0, 0))
for t, x, y in tiles: sheet.alpha_composite(t, (x, y))
sheet.save(out, lossless=True, method=6) if out.endswith('.webp') else sheet.save(out)
print(json.dumps(atlas, separators=(',', ':')))
print(f'scale {scale:.3f}  sheet {W}x{H}', file=sys.stderr)
