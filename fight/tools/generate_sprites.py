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
COUNTS = dict(idle=8, walk=8, jump=6, light=12, heavy=12, lkick=12, hkick=12,
              hurt=6, ko=8, special=12, victory=6)
CELL_W, CELL_H, COLS = 256, 256, 8
FOOT_X, FOOT_Y = 128, 239

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
            if action in ('idle','walk'):
                phase = n / count
                pos = phase * len(frames)
                key = int(pos) % len(frames)
            else:
                eased = phase * phase * (3 - 2 * phase)
                key = min(len(frames) - 1, round(eased * (len(frames) - 1)))
            sx, sy, w, h, ax, ay = frames[key]
            crop = source.crop((sx, sy, sx+w, sy+h))
            if crop.getbbox() is None:
                raise RuntimeError('Empty artwork ' + ident + ':' + action)
            # Uniform character height and foot anchor; preserve authored proportions.
            factor = min(1.10, 210/max(1,h), 220/max(1,w))
            crop = crop.resize((max(1,round(w*factor)),max(1,round(h*factor))), Image.Resampling.LANCZOS)
            cell = Image.new('RGBA',(CELL_W,CELL_H),(0,0,0,0))
            stride = math.sin(phase * math.pi * 2)
            bounce = (abs(stride)*4 if action=='walk' else math.sin(phase*math.pi)*3 if action=='jump' else 0)
            lunge = (math.sin(phase*math.pi)*10 if action in ('light','heavy','lkick','hkick','special') else 0)
            rot = (stride*2.3 if action=='walk' else
                   -5*math.sin(phase*math.pi) if action in ('light','heavy','lkick','hkick') else
                    3*math.sin(phase*math.pi) if action=='hurt' else 0)
            # Rotate about the pose center within an isolated transparent canvas.
            crop = crop.rotate(rot, Image.Resampling.BICUBIC, expand=True)
            px = round(FOOT_X - ax*factor + lunge)
            py = round(FOOT_Y - ay*factor - bounce)
            # Expansion after rotation requires recentering.
            px -= (crop.width - round(w*factor))//2
            py -= (crop.height - round(h*factor))//2
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
