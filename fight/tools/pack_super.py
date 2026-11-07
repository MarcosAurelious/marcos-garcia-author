"""Pack a generated 2x8 super-move sheet (16 poses, read left to right, top row first) for one Roman Arena fighter.
Usage (from the repo root):  python fight/tools/pack_super.py SHEET.png FIGHTER_ID [RELEASE_FRAME] [CUTS]
- CUTS (optional) splits the sheet by hand when energy beams join neighbouring poses or a row has an odd count:
  x positions per row, rows separated by ';' (e.g. "240,475,720;265,524,771").
- The white/paper background (or a semi-transparent white haze) and its soft glow are keyed out.
- Frames are scaled so the first (standing) pose matches the fighter's in-game idle height.
- Every frame is anchored on the fighter's feet, found from the body pixels only (the coloured energy is ignored),
  so flames, lightning and rocks can spill out without making him slide around.
- RELEASE_FRAME (1-based, default 9) is the pose shown at the moment the super actually fires.
Writes fight/supers/<id>.webp and updates fight/supers/super-data.js (window.__ARENA_SUPERS)."""
import sys, os, json
import numpy as np
from PIL import Image
from scipy import ndimage

src, fid = sys.argv[1], sys.argv[2]
release = int(sys.argv[3]) - 1 if len(sys.argv) > 3 else 8
CUTS = [[int(v) for v in row.split(',')] for row in sys.argv[4].split(';')] if len(sys.argv) > 4 else None
ROOT = os.path.join(os.path.dirname(__file__), '..')
game = open(os.path.join(ROOT, 'game.js')).read(); dec = json.JSONDecoder()
def atlas(name): i = game.index('const ' + name + ' = ') + len('const ' + name + ' = '); return dec.raw_decode(game[i:])[0]

# ---- the fighter's in-game idle height ----
AA, FA = atlas('AATLAS'), atlas('FATLAS')
if fid == 'hades':
    im0 = np.array(Image.open(os.path.join(ROOT, 'hades-sprites-aligned.png')).convert('RGBA'))[0:220, 0:192, 3] > 40
else:
    a = AA.get('a_' + fid, {}); s, img = (a, f'atk/{fid}.webp') if 'idle' in a else (FA['f_' + fid], 'fighters.webp')
    x, y, w, h, ax, ay = s['idle'][0]; im0 = np.array(Image.open(os.path.join(ROOT, img)).convert('RGBA'))[y:y + h, x:x + w, 3] > 40
ys, _ = np.where(im0); IDLE_H = ys.max() - ys.min() + 1

# ---- load, key out the background ----
A = np.array(Image.open(src).convert('RGBA')).astype(int)
rgb = A[..., :3]; mx, mn = rgb.max(2), rgb.min(2)
bgish = ((mx >= 205) & (mx - mn <= 22)) | (A[..., 3] < 30); lab, n = ndimage.label(bgish)
edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}; bg = np.isin(lab, list(edge))
for _ in range(4): bg = bg | (ndimage.binary_dilation(bg) & (mn >= 150) & (mx >= 200))
A[..., 3] = np.where(bg, 0, np.maximum(A[..., 3], 0))
A[..., 3][A[..., 3] < 60] = 0; A[..., 3][A[..., 3] >= 60] = 255; A = A.astype(np.uint8)

# energy = strongly coloured glow (red flame / blue lightning / magenta magic); body = everything else that's opaque
r, g, b = [A[..., i].astype(int) for i in range(3)]
energy = ((r - np.maximum(g, b) > 90) & (r > 200) & (g < 140)) | ((b - r > 60) & (b > 170)) | ((r > 190) & (b > 190) & (g < 160) & (r - g > 70))

# ---- find the 16 poses, grouped into 2 rows of 8 ----
m = A[..., 3] > 0; lab, n = ndimage.label(m, np.ones((3, 3)))
sizes = ndimage.sum(m, lab, range(1, n + 1)); objs = ndimage.find_objects(lab)
bodyN = ndimage.sum(m & ~energy, lab, range(1, n + 1))
big = list(np.argsort(-bodyN)[:16])
if not CUTS and not (len(big) == 16 and bodyN[big[-1]] > bodyN[big[0]] * 0.15):
    raise SystemExit('could not find 16 separate poses (energy joins them?) - pass CUTS')
cy = lambda k: (objs[k][0].start + objs[k][0].stop) / 2; cx = lambda k: (objs[k][1].start + objs[k][1].stop) / 2
big.sort(key=cy); rows = [sorted(big[:8], key=cx), sorted(big[8:], key=cx)]
groups = {k: [k] for k in big}
for k in range(n):   # loose bits (rocks, sparks, flame wisps) join the nearest pose in the same row
    if k in groups or sizes[k] < 6: continue
    row = min(rows, key=lambda r_: min(abs(cy(b) - cy(k)) for b in r_)); col = int(cx(k) // (A.shape[1] / 8))
    groups[row[min(7, col)]].append(k)   # the sheet is an even 8-column grid: a loose bit belongs to the pose in its column

def cut(k):
    keep = np.isin(lab, [g + 1 for g in groups[k]]); ys, xs = np.where(keep)
    sl = (slice(ys.min(), ys.max() + 1), slice(xs.min(), xs.max() + 1))
    c = A[sl].copy(); c[..., 3] = np.where(keep[sl], c[..., 3], 0)
    body = keep[sl] & ~energy[sl] & (lab[sl] == k + 1)
    return c, body
if CUTS:   # hand cuts: every opaque pixel between two cut lines belongs to that pose
    rowsY = np.where(m.any(1))[0]; gaps = np.where(np.diff(rowsY) > 20)[0]; assert len(gaps) == len(CUTS) - 1, 'row count does not match CUTS'
    bands = np.split(rowsY, gaps + 1); cells = []
    for band, xs in zip(bands, CUTS):
        edges = [0] + xs + [A.shape[1]]
        for x0, x1 in zip(edges, edges[1:]):
            sub = m[band[0]:band[-1] + 1, x0:x1]; yy, xx = np.where(sub)
            sl = (slice(band[0] + yy.min(), band[0] + yy.max() + 1), slice(x0 + xx.min(), x0 + xx.max() + 1))
            keep = m[sl].copy()
            if x0 > 0 and sl[1].start == x0:   # drop the tip of the previous pose's beam poking over the left cut line
                rr, gg, bb = [A[sl][..., i].astype(int) for i in range(3)]
                glow = keep & (energy[sl] | ((rr > 215) & (bb > 215)))
                gl, gn = ndimage.label(glow, np.ones((3, 3)))
                for j, o in enumerate(ndimage.find_objects(gl)):
                    if o[1].start == 0 and o[1].stop < 70: keep &= ~(gl == j + 1)
                kl, kn = ndimage.label(keep, np.ones((3, 3)))   # and any other thin scrap (fire, smoke, rock) cut off at the left edge
                for j, o in enumerate(ndimage.find_objects(kl)):
                    if o is not None and o[1].start == 0 and o[1].stop < 45 and (kl == j + 1).sum() < keep.sum() * 0.02: keep &= ~(kl == j + 1)
            c = A[sl].copy(); c[..., 3] = np.where(keep, c[..., 3], 0)
            bl, bn = ndimage.label(m[sl] & ~energy[sl]); bs = ndimage.sum(np.ones_like(bl), bl, range(1, bn + 1))
            caster = bl == int(np.argmax(bs)) + 1   # the caster is the biggest body blob in the cell
            F = 14; ramp = np.ones(c.shape[1])    # effects sliced by a cut line fade out instead of ending in a hard edge
            if x0 > 0 and sl[1].start == x0: ramp[:F] = np.minimum(ramp[:F], np.linspace(0.15, 1, F))
            if x1 < A.shape[1] and sl[1].stop == x1: ramp[-F:] = np.minimum(ramp[-F:], np.linspace(1, 0.15, F))
            near = ndimage.binary_dilation(caster, iterations=3)
            c[..., 3] = np.where(near, c[..., 3], (c[..., 3] * ramp[None, :]).astype(np.uint8))
            cells.append((c, caster))
else:
    cells = [cut(k) for r_ in rows for k in r_]

def feet(body):
    ys, xs = np.where(body); bot = ys.max(); band = ys >= bot - max(8, (bot - ys.min()) * 0.1)
    return float(np.median(xs[band])), bot, ys.max() - ys.min() + 1
scale = IDLE_H / feet(cells[0][1])[2]

# ---- pack (two rows, like the source) ----
PAD = 2; tiles, W, H, frames = [], 0, 0, []
ROWN = [len(r_) + 1 for r_ in CUTS] if CUTS else [8, 8]; ROWS = [cells[sum(ROWN[:i]):sum(ROWN[:i + 1])] for i in range(len(ROWN))]
for row in ROWS:
    x = 0; rh = 0
    for c, body in row:
        fx, fb, _ = feet(body)
        im = Image.fromarray(c); w, h = max(1, round(im.width * scale)), max(1, round(im.height * scale)); im = im.resize((w, h), Image.LANCZOS)
        tiles.append((im, x + PAD, H + PAD)); frames.append([x + PAD, H + PAD, w, h, int(round(fx * scale)), int(round(fb * scale))])
        x += w + PAD * 2; rh = max(rh, h + PAD * 2)
    W = max(W, x); H += rh
sheet = Image.new('RGBA', (W, H), (0, 0, 0, 0))
for im, px, py in tiles: sheet.alpha_composite(im, (px, py))
os.makedirs(os.path.join(ROOT, 'supers'), exist_ok=True)
sheet.save(os.path.join(ROOT, 'supers', fid + '.webp'), 'WEBP', quality=90, alpha_quality=92, method=6)

data_path = os.path.join(ROOT, 'supers', 'super-data.js'); data = {}
if os.path.exists(data_path):
    t = open(data_path).read(); data = json.loads(t[t.index('{'):t.rindex('}') + 1])
data[fid] = {'release': release, 'frames': frames}
open(data_path, 'w').write('/* Generated by fight/tools/pack_super.py: hand-drawn super-move frames anchored on the feet;\n   release = the frame shown when the super fires. */\nwindow.__ARENA_SUPERS = ' + json.dumps(data, separators=(',', ':')) + ';\n')
print(fid, 'scale %.3f' % scale, 'idle h', IDLE_H, 'sheet', W, 'x', H, 'release', release + 1)
