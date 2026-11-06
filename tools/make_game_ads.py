"""Two 30s vertical (1080x1920) ads from recorded gameplay: Roman Arena and The Aurelious Quest."""
import json, math, os, random, subprocess, sys, glob
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

VW, VH, FPS = 1080, 1920, 30
BEBAS = '/home/claude/ad/bebas-neue-latin-400-normal.ttf'; METAL = '/home/claude/ad/metal-mania-latin-400-normal.ttf'
_f = {}
def font(p, s):
    if (p, s) not in _f: _f[(p, s)] = ImageFont.truetype(p, s)
    return _f[(p, s)]
def text(img, s, y, size, path=BEBAS, fill=(255, 226, 150), stroke=(25, 8, 0), sw=6, alpha=1.0, scale=1.0):
    if alpha <= 0: return
    f = font(path, max(8, int(size * scale))); layer = Image.new('RGBA', img.size, (0, 0, 0, 0)); d = ImageDraw.Draw(layer)
    w = d.textlength(s, font=f); d.text(((VW - w) / 2, y + (size - size * scale) / 2), s, font=f, fill=fill, stroke_width=sw, stroke_fill=stroke)
    if alpha < 1: layer.putalpha(layer.getchannel('A').point(lambda v: int(v * alpha)))
    img.alpha_composite(layer)
def grade(img, c, a):
    if a > 0: img.alpha_composite(Image.new('RGBA', img.size, c + (int(255 * min(1, a)),)))
def ease(k): return 0 if k <= 0 else 1 if k >= 1 else 1 - (1 - k) ** 3
def popin(t, t0, d=0.25):
    k = (t - t0) / d
    if k <= 0: return 0, 0
    if k >= 1: return 1, 1
    return min(1, k * 2), 0.6 + 0.4 * ease(k) + 0.12 * math.sin(k * math.pi)
_c = {}
def load(path):
    if path not in _c:
        if len(_c) > 60: _c.clear()
        _c[path] = Image.open(path).convert('RGBA')
    return _c[path]

def compose(src, box, t, accent=(214, 168, 72), band_h=1080, band_y=440, zoom=1.0):
    """src frame -> 1080x1920: blurred fill + a 1080-wide band showing `box` (x0,y0,x1,y1 in src px)."""
    x0, y0, x1, y1 = box; bw, bh = x1 - x0, y1 - y0
    crop = src.crop((int(x0), int(y0), int(x1), int(y1))).resize((VW, band_h), Image.LANCZOS)
    back = src.resize((int(src.width * VH / src.height), VH), Image.BILINEAR)
    bx = (back.width - VW) // 2; back = back.crop((bx, 0, bx + VW, VH)).filter(ImageFilter.GaussianBlur(22))
    out = back.copy(); grade(out, (6, 4, 10), 0.6); out.alpha_composite(crop, (0, band_y))
    d = ImageDraw.Draw(out)
    for y in (band_y - 6, band_y + band_h): d.rectangle([0, y, VW, y + 5], fill=accent + (255,))
    return out

def box_around(cx, cy, w, h, W, H):
    """a w x h box centred on (cx,cy), clamped inside a W x H frame"""
    x0 = min(max(0, cx - w / 2), W - w); y0 = min(max(0, cy - h / 2), H - h); return (x0, y0, x0 + w, y0 + h)

def render(out, dur, draw, song, start, fadeout=2.0):
    silent = out.replace('.mp4', '_s.mp4')
    p = subprocess.Popen(['ffmpeg', '-loglevel', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{VW}x{VH}', '-r', str(FPS), '-i', '-',
                          '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '21', '-pix_fmt', 'yuv420p', silent], stdin=subprocess.PIPE)
    for i in range(int(dur * FPS)):
        t = i / FPS; fr = draw(t)
        a = max(0, 1 - t / 0.3) + max(0, (t - (dur - 0.5)) / 0.5); grade(fr, (0, 0, 0), a)
        p.stdin.write(fr.convert('RGB').tobytes())
    p.stdin.close(); p.wait()
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', silent, '-ss', str(start), '-i', song, '-map', '0:v', '-map', '1:a', '-c:v', 'copy',
                    '-af', f'afade=t=in:d=0.25,afade=t=out:st={dur - fadeout}:d={fadeout}', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', out], check=True)
    os.remove(silent); print(out, os.path.getsize(out) // 1024, 'KB')

# ======================= ROMAN ARENA =======================
A = '/home/claude/ad/arena'
AMETA = {c: json.load(open(f'{A}/{c}/meta.json')) for c in ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'ko']}
NAMES = {'c1': ('MARCUS AURELIUS', 'HADES SENTINEL'), 'c2': ('MARS WARFORGE', 'MINOTAUR ENGINE'), 'c3': ('MEDUSA TECHNOMANCER', 'NEPTUNE LEVIATHAN'),
         'c4': ('VULCAN FORGE', 'CERBERUS UNIT'), 'c5': ('HELIOS ORB', 'DIANA HUNTER'), 'c6': ('PEGASUS DRONE', 'AUGUSTUS COLOSSUS'), 'ko': ('HADES SENTINEL', 'MARS WARFORGE')}
RED = (226, 62, 48); GOLD = (232, 190, 92)
def arena_frame(clip, i):
    i = max(0, min(i, len(AMETA[clip]) - 1)); src = load(f'{A}/{clip}/{i:04d}.jpg'); m = AMETA[clip][i]
    if m['cut']: H = src.height; return src, box_around(src.width / 2, H * 0.5, H, H, src.width, H), True
    k = src.width / m['sw']; xs = [(x - m['x0']) * m['s'] * k for x in m['p']]
    cx = sum(xs) / 2; w = max(src.height * 1.0, abs(xs[0] - xs[1]) + src.height * 0.62); w = min(w, src.width); h = w
    cy = src.height * 0.55
    return src, box_around(cx, cy, w, h, src.width, src.height), False
ASEQ = [  # (t0, t1, clip, start_frame, speed, headline, sub)
    (0.0, 2.6, 'c1', 0, 1.0, None, None),
    (2.6, 5.6, 'c1', 30, 1.0, 'MARCUS AURELIUS', 'VS HADES SENTINEL'),
    (5.6, 8.8, 'c2', 20, 1.1, 'MARS WARFORGE', 'CRIMSON CLEAVE'),
    (8.8, 11.6, 'c3', 25, 1.0, 'MEDUSA', 'TURN THEM TO STONE'),
    (11.6, 14.4, 'c4', 15, 1.1, 'VULCAN FORGE', 'CHAIN EPIC COMBOS'),
    (14.4, 17.0, 'c5', 5, 1.1, 'HELIOS ORB', 'VS DIANA HUNTER'),
    (17.0, 20.2, 'c6', 15, 1.1, 'AUGUSTUS COLOSSUS', 'THUNDER FIST'),
    (20.2, 23.0, 'roster', 0, 1, '13 LEGENDS', '10 ARENAS'),
    (23.0, 26.0, 'ko', 30, 1.0, None, None),
    (26.0, 30.0, 'end', 0, 1, None, None)]
def roster_img():
    if 'roster' not in _c:
        s = Image.open(f'{A}/select.jpg').convert('RGBA'); _c['roster'] = s
    return _c['roster']
def arena_draw(t):
    for t0, t1, clip, f0, sp, head, sub in ASEQ:
        if t0 <= t < t1: break
    k = t - t0
    if clip == 'roster':
        s = roster_img(); W, H = s.size
        # slow pan down the roster grid
        q = k / (t1 - t0); side = 560; x = 405 + q * (1515 - 405 - side); y = 335 + q * 30; fr = compose(s, (x, y, x + side, y + side), t, GOLD)
    elif clip == 'end':
        src, box, _ = arena_frame('c5', 40 + int(k * 12) % 20); fr = compose(src, box, t, GOLD); grade(fr, (0, 0, 0), 0.5)
    else:
        src, box, cut = arena_frame(clip, f0 + int(k * FPS * sp)); fr = compose(src, box, t, RED if cut else GOLD)
    if t < 2.6:   # cold open
        a, sc = popin(t, 0.4); text(fr, 'ROMAN ARENA', 140, 150, METAL, fill=GOLD, sw=8, alpha=a, scale=sc)
        text(fr, 'GODS OF THE MACHINE', 1580, 110, alpha=min(1, max(0, (t - 1.0) * 3)), fill=(255, 255, 255))
        text(fr, 'A ROMAN FIGHTING GAME', 1710, 60, alpha=min(1, max(0, (t - 1.5) * 3)), fill=GOLD, sw=4)
        if 0.4 < t < 0.7: grade(fr, (255, 240, 220), (0.7 - t) * 2.2)
    elif clip == 'ko':
        text(fr, 'FINISH HIM', 150, 160, METAL, fill=RED, alpha=min(1, k * 3))
        if k > 1.6:
            a, sc = popin(t, t0 + 1.6, 0.3); text(fr, 'K.O.', 1540, 230, METAL, fill=(255, 220, 120), sw=10, alpha=a, scale=sc)
            if k < 1.9: grade(fr, (255, 255, 255), (1.9 - k) * 2.5)
    elif clip == 'end':
        a, sc = popin(t, t0 + 0.1, 0.3); text(fr, 'ROMAN ARENA', 300, 150, METAL, fill=GOLD, sw=8, alpha=a, scale=sc)
        text(fr, 'GODS OF THE MACHINE', 500, 96, fill=(255, 255, 255), alpha=min(1, max(0, (k - 0.3) * 3)))
        text(fr, '1 PLAYER · 2 PLAYER VERSUS · ARCADE · TRAINING', 1140, 46, fill=(255, 255, 255), sw=4, alpha=min(1, max(0, (k - 0.7) * 3)))
        text(fr, 'PLAY FREE IN YOUR BROWSER', 1520, 92, fill=(255, 255, 255), alpha=min(1, max(0, (k - 1.0) * 3)))
        text(fr, 'MARCOSAURELIOUS.GITHUB.IO/MARCOS-GARCIA-AUTHOR/FIGHT', 1640, 38, fill=GOLD, sw=3, alpha=min(1, max(0, (k - 1.3) * 3)))
        text(fr, 'A GAME BY MARCOS GARCIA', 1750, 44, fill=(200, 190, 170), sw=3, alpha=min(1, max(0, (k - 1.6) * 3)))
    elif head:
        a, sc = popin(t, t0 + 0.05, 0.2); text(fr, head, 150, 150 if len(head) < 14 else 120, fill=GOLD, sw=7, alpha=a, scale=sc)
        text(fr, sub, 1570, 96, fill=(255, 255, 255), alpha=min(1, max(0, (k - 0.3) * 4)))
    if t0 > 0 and k < 0.12: grade(fr, (255, 245, 230), 0.3 - k * 2.5)
    return fr

# ======================= AURELIOUS QUEST =======================
Q = '/home/claude/ad/quest'
QMETA = {c: json.load(open(f'{Q}/{c}/meta.json')) for c in ['run1', 'run2', 'scroll', 'b_commander', 'b_colossus', 'b_stormtaur', 'b_cerberus', 'b_blackknight']}
INK = (60, 40, 20); PARCH = (243, 232, 205)
QBAND_H, QBAND_Y = 760, 560      # Quest shots use a wide band (the game's action lives in a strip above the floor)
def quest_frame(clip, i, mode='hero'):
    i = max(0, min(i, len(QMETA[clip]) - 1)); src = load(f'{Q}/{clip}/{i:04d}.jpg'); m = QMETA[clip][i]
    k = m['cssw'] / 960.0; H = src.height
    px, py = m['px'] * k, m['py'] * k
    if mode == 'boss' and m['bx'] is not None and -200 < m['bx'] < 1160:
        bx = m['bx'] * k; y1 = H * 0.785; y0 = H * 0.365; h = y1 - y0; w = h * VW / QBAND_H   # under the intro card, down to the floor line
        cx = (px + bx) / 2
    else:
        y1 = min(H, py + H * 0.22); h = H * 0.46; y0 = y1 - h; w = h * VW / QBAND_H; cx = px + w * 0.15
    x0 = min(max(0, cx - w / 2), src.width - w); return src, (x0, y0, x0 + w, y0 + h)
QSEQ = [
    (0.0, 3.0, 'run1', 0, 1.0, 'hero', None, None),
    (3.0, 6.4, 'run1', 30, 1.0, 'hero', 'MARCUS AURELIUS', 'THE PHILOSOPHER EMPEROR'),
    (6.4, 9.2, 'run2', 10, 1.0, 'hero', 'TEN CHAPTERS', 'FROM SKETCHBOOK ROME TO THE STARS'),
    (9.2, 11.6, 'scroll', 5, 1.0, 'hero', 'COLLECT 30 SCROLLS', 'OF STOIC WISDOM'),
    (11.6, 14.4, 'b_commander', 10, 1.0, 'boss', 'THE DARK COMMANDER', None),
    (14.4, 17.2, 'b_colossus', 10, 1.0, 'boss', 'AUGUSTUS COLOSSUS', None),
    (17.2, 20.0, 'b_stormtaur', 10, 1.0, 'boss', 'ASTERION', 'THE STORM MINOTAUR'),
    (20.0, 22.8, 'b_cerberus', 10, 1.0, 'boss', 'CERBERUS', 'HOUND OF THE UNDERWORLD'),
    (22.8, 26.0, 'b_blackknight', 10, 1.0, 'boss', 'THE FINAL GAUNTLET', 'THREE KNIGHTS · ONE EMPEROR'),
    (26.0, 30.0, 'end', 0, 1, 'hero', None, None)]
def quest_draw(t):
    for t0, t1, clip, f0, sp, mode, head, sub in QSEQ:
        if t0 <= t < t1: break
    k = t - t0
    if clip == 'end':
        src, box = quest_frame('run1', 80 + int(k * 12) % 20); fr = compose(src, box, t, (214, 168, 72), QBAND_H, QBAND_Y); grade(fr, (0, 0, 0), 0.5)
    else:
        src, box = quest_frame(clip, f0 + int(k * FPS * sp), mode); fr = compose(src, box, t, (214, 168, 72), QBAND_H, QBAND_Y)
    if t < 3.0:
        a, sc = popin(t, 0.4); text(fr, 'THE AURELIOUS', 180, 150, METAL, fill=GOLD, sw=8, alpha=a, scale=sc)
        text(fr, 'QUEST', 340, 170, METAL, fill=GOLD, sw=8, alpha=a, scale=sc)
        text(fr, 'A STOIC PLATFORM ADVENTURE', 1400, 86, fill=(255, 255, 255), alpha=min(1, max(0, (t - 1.1) * 3)))
        text(fr, '"YOU HAVE POWER OVER YOUR MIND"', 1520, 56, fill=GOLD, sw=4, alpha=min(1, max(0, (t - 1.7) * 3)))
        if 0.4 < t < 0.7: grade(fr, (255, 240, 220), (0.7 - t) * 2.2)
    elif clip == 'end':
        a, sc = popin(t, t0 + 0.1, 0.3); text(fr, 'THE AURELIOUS', 330, 130, METAL, fill=GOLD, sw=8, alpha=a, scale=sc)
        text(fr, 'QUEST', 460, 150, METAL, fill=GOLD, sw=8, alpha=a, scale=sc)
        text(fr, '10 CHAPTERS · 10 BOSSES · 30 SCROLLS', 1160, 54, fill=(255, 255, 255), sw=4, alpha=min(1, max(0, (k - 0.6) * 3)))
        text(fr, 'PLAY FREE IN YOUR BROWSER', 1520, 92, fill=(255, 255, 255), alpha=min(1, max(0, (k - 1.0) * 3)))
        text(fr, 'MARCOSAURELIOUS.GITHUB.IO/MARCOS-GARCIA-AUTHOR/QUEST', 1640, 38, fill=GOLD, sw=3, alpha=min(1, max(0, (k - 1.3) * 3)))
        text(fr, 'A GAME BY MARCOS GARCIA', 1750, 44, fill=(200, 190, 170), sw=3, alpha=min(1, max(0, (k - 1.6) * 3)))
    elif head:
        if mode == 'boss': text(fr, 'BOSS', 250, 70, fill=RED, sw=5, alpha=min(1, k * 4))
        a, sc = popin(t, t0 + 0.05, 0.2); text(fr, head, 330 if mode == 'boss' else 300, 120 if len(head) > 14 else 150, fill=GOLD, sw=7, alpha=a, scale=sc)
        if sub: text(fr, sub, 1380, 70 if len(sub) > 24 else 92, fill=(255, 255, 255), alpha=min(1, max(0, (k - 0.3) * 4)))
    if t0 > 0 and k < 0.12: grade(fr, (255, 245, 230), 0.3 - k * 2.5)
    return fr

if __name__ == '__main__':
    which = sys.argv[1:] or ['arena', 'quest']
    if 'arena' in which: render('/home/claude/ad/roman-arena-ad.mp4', 30.0, arena_draw, '/home/claude/marcos-garcia-author/fight/music/ego-death.mp3', 5.0)
    if 'quest' in which: render('/home/claude/ad/aurelious-quest-ad.mp4', 30.0, quest_draw, '/home/claude/marcos-garcia-author/fight/music/acta-non-verba.mp3', 10.6)
