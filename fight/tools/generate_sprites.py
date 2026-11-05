#!/usr/bin/env python3
"""Generate transparent, foot-anchored transitional sprite frames for all 13 Arena fighters.
Source artwork remains untouched; generated poses are raster-derived, not hand-drawn.
These transparent sprite sheets preserve source poses and do not change combat logic."""
import json, re, math
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
JS = (ROOT / 'game.js').read_text(encoding='utf8')
OUT = ROOT / 'generated'
OUT.mkdir(exist_ok=True)
IDS = 'marcus mars colossus medusa minotaur vulcan chiron diana cerberus pegasus helios neptune hades'.split()
COUNTS = dict(idle=1, walk=4, jump=6, light=12, heavy=12, lkick=12, hkick=12,
              hurt=6, ko=8, special=12, victory=6)
CELL_W, CELL_H, COLS = 320, 320, 8
FOOT_X, FOOT_Y = 160, 294

def atlas(name):
    m = re.search(r'const ' + name + r' = (\{[^\n]+\});', JS)
    if not m:
        raise RuntimeError('Missing original atlas ' + name)
    return json.loads(m.group(1))

ATTACK = atlas('AATLAS')
FIGHT = atlas('FATLAS')
metadata = {}
for ident in IDS:
    original = ROOT / 'atk' / (ident + '.webp')
    if not original.exists():
        raise RuntimeError('Missing fighter attack artwork: ' + str(original))
    src = Image.open(original).convert('RGBA')
    fallback = Image.open(ROOT / 'fighters.webp').convert('RGBA') if (ROOT / 'fighters.webp').exists() else None
    # Lock the same scale for every pose of this fighter. Per-pose resizing
    # previously made heads and armor grow/shrink as the fighter walked.
    all_frames = []
    for action in COUNTS:
        entries = ATTACK.get('a_' + ident, {}).get(action) or FIGHT.get('f_' + ident, {}).get(action)
        if entries:
            all_frames.extend(entries)
    tallest = max(f[3] for f in all_frames)
    widest = max(f[2] for f in all_frames)
    fighter_scale = min(1.10, 205 / tallest, 218 / widest)
    parts = []
    for action, count in COUNTS.items():
        frames = ATTACK.get('a_' + ident, {}).get(action)
        source = src
        if not frames:
            frames = FIGHT.get('f_' + ident, {}).get(action)
            source = fallback
        if not frames or source is None:
            raise RuntimeError('Missing animation ' + ident + ':' + action)
        for n in range(count):
            # Preserve the original unique key poses; ease the timing and articulate
            # the silhouette slightly rather than cross-fading two ghost images.
            phase = n / max(1, count - 1)
            if action == 'idle':
                # One consistent authored stance prevents the rapid idle twitch.
                key = 0
            elif action == 'walk':
                # Retain the original four key poses, not duplicated eight-frame
                # loops. Distance-based playback in game.js handles their pacing.
                key = min(len(frames)-1, int(n * len(frames) / count))
            else:
                eased = phase * phase * (3 - 2 * phase)
                key = min(len(frames) - 1, round(eased * (len(frames) - 1)))
            sx, sy, w, h, ax, ay = frames[key]
            crop = source.crop((sx, sy, sx+w, sy+h))
            if crop.getbbox() is None:
                raise RuntimeError('Empty artwork ' + ident + ':' + action)
            # Uniform character height and foot anchor; preserve authored proportions.
            factor = fighter_scale
            crop = crop.resize((max(1,round(w*factor)),max(1,round(h*factor))), Image.Resampling.LANCZOS)
            cell = Image.new('RGBA',(CELL_W,CELL_H),(0,0,0,0))
            # No whole-body rocking, drifting, or bobbing during idle/walk.
            # The original drawings already have articulated fighting poses.
            bounce = math.sin(phase*math.pi)*3 if action=='jump' else 0
            lunge = math.sin(phase*math.pi)*8 if action in ('light','heavy','lkick','hkick','special') else 0
            rot = -3*math.sin(phase*math.pi) if action in ('light','heavy','lkick','hkick') else 0
            # Rotate about the pose center within an isolated transparent canvas.
            crop = crop.rotate(rot, Image.Resampling.BICUBIC, expand=True)
            px = round(FOOT_X - ax*factor + lunge)
            py = round(FOOT_Y - ay*factor - bounce)
            # Expansion after rotation requires recentering.
            px -= (crop.width - round(w*factor))//2
            py -= (crop.height - round(h*factor))//2
            # Keep outlying weapons and capes inside the larger sprite cell.
            # The usual pose keeps its common foot anchor; only true overflow
            # needs a small correction instead of aborting every fighter.
            px = max(0, min(px, CELL_W - crop.width))
            py = max(0, min(py, CELL_H - crop.height))
            cell.alpha_composite(crop, (px,py))
            parts.append((action, cell))
    rows = math.ceil(len(parts)/COLS)
    sheet = Image.new('RGBA',(COLS*CELL_W,rows*CELL_H),(0,0,0,0))
    manifest = {}
    for i,(action,cell) in enumerate(parts):
        x=(i%COLS)*CELL_W; y=(i//COLS)*CELL_H
        sheet.alpha_composite(cell,(x,y))
        manifest.setdefault(action,[]).append([x,y,CELL_W,CELL_H,FOOT_X,FOOT_Y])
    output=OUT/(ident+'.webp')
    sheet.save(output,'WEBP',quality=85,method=5)
    metadata['g_'+ident]=manifest
    print(ident, output.stat().st_size, 'bytes',len(parts),'frames')
(OUT/'atlas-data.js').write_text('window.__ARENA_GENERATED_ATLAS = '+json.dumps(metadata,separators=(',',':'))+';\n',encoding='utf8')
print('Generated',len(metadata),'fighters and',sum(len(v) for v in metadata.values()),'animation types')

# Dedicated cinematic cut-in strips: transparent, centered characters enlarged
# from the original illustrated SPECIAL poses. No captions are baked into art.
CUTIN_DIR = ROOT / 'cutins'
CUTIN_DIR.mkdir(exist_ok=True)
CUT_W, CUT_H, CUT_COUNT = 384, 384, 6
cutin_data = {}
for ident in IDS:
    source = Image.open(ROOT / 'atk' / (ident + '.webp')).convert('RGBA')
    poses = ATTACK.get('a_' + ident, {}).get('special')
    if not poses:
        source = Image.open(ROOT / 'fighters.webp').convert('RGBA')
        poses = FIGHT.get('f_' + ident, {}).get('special')
    if not poses:
        raise RuntimeError('Missing cinematic special pose: ' + ident)
    strip = Image.new('RGBA', (CUT_W * CUT_COUNT, CUT_H), (0, 0, 0, 0))
    sequence = []
    for index in range(CUT_COUNT):
        # Anticipation -> power buildup -> full release -> hold -> recover.
        pos = [0, 0, min(1, len(poses)-1), len(poses)-1,
               len(poses)-1, 0][index]
        sx, sy, w, h, ax, ay = poses[pos]
        crop = source.crop((sx, sy, sx+w, sy+h))
        if crop.getbbox() is None:
            raise RuntimeError('Empty cinematic art: ' + ident)
        scale = min(1.6, 334/max(w,1), 340/max(h,1))
        crop = crop.resize((round(w*scale), round(h*scale)), Image.Resampling.LANCZOS)
        frame = Image.new('RGBA', (CUT_W, CUT_H), (0,0,0,0))
        # Align every frame to the same ground baseline and center the anatomy.
        dx = max(0, min(round(CUT_W/2-ax*scale), CUT_W-crop.width))
        dy = max(0, min(round(365-ay*scale), CUT_H-crop.height))
        frame.alpha_composite(crop,(dx,dy))
        strip.alpha_composite(frame,(index*CUT_W,0))
        sequence.append([index*CUT_W,0,CUT_W,CUT_H,CUT_W//2,365])
    filename=CUTIN_DIR/(ident+'.webp')
    strip.save(filename,'WEBP',quality=88,method=6)
    cutin_data[ident]=sequence
    print('Cinematic:',ident,filename.stat().st_size,'bytes')
(CUTIN_DIR/'atlas-data.js').write_text('window.__ARENA_CUTIN_ATLAS = '+json.dumps(cutin_data,separators=(',',':'))+';\n',encoding='utf8')
print('Generated cinematic special strips:',len(cutin_data))

