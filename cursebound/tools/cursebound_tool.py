#!/usr/bin/env python3
"""Cursebound helper. Standard library only (Python 3.8+).

  python tools/cursebound_tool.py check    validate data/fighters.json against the sprite files
  python tools/cursebound_tool.py assets   list every image, its size, and whether the game uses it
  python tools/cursebound_tool.py serve    play locally at http://localhost:8000 (the game needs a server to load its JSON)

Run it from the cursebound folder, or from anywhere: it finds the folder itself.
"""
import json, struct, sys, os, http.server, socketserver, functools, webbrowser
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / 'data' / 'fighters.json'
IMAGE_DIRS = ['assets', 'characters']
MOVES = ['lp', 'mp', 'hp', 'lk', 'mk', 'hk']
FRAME_KEYS = ['idle', 'walk', 'run', 'jump', 'light', 'heavy', 'special', 'hurt', 'ko']
JUMP_KEYS = ['crouch', 'rise', 'apex', 'fall', 'land']


def webp_size(path):
    """Width and height of a .webp file, read from its header (no Pillow needed)."""
    b = Path(path).read_bytes()[:40]
    if b[:4] != b'RIFF' or b[8:12] != b'WEBP':
        return None
    kind = b[12:16]
    if kind == b'VP8 ':
        w, h = struct.unpack('<HH', b[26:30]); return w & 0x3FFF, h & 0x3FFF
    if kind == b'VP8L':
        bits = int.from_bytes(b[21:25], 'little'); return (bits & 0x3FFF) + 1, ((bits >> 14) & 0x3FFF) + 1
    if kind == b'VP8X':
        return int.from_bytes(b[24:27], 'little') + 1, int.from_bytes(b[27:30], 'little') + 1
    return None


def load():
    return json.loads(DATA.read_text(encoding='utf-8'))


def referenced(data):
    refs = {data.get('title')} | {s['image'] for s in data['stages']}
    for f in data['fighters']:
        refs |= {v for k, v in f['sheets'].items() if isinstance(v, str)}
        if f.get('jump', {}).get('sheet'):
            refs.add(f['jump']['sheet'])
    # images named directly in the HTML/CSS/JS
    for p in ['index.html', 'css/cursebound.css', 'js/game.js']:
        text = (ROOT / p).read_text(encoding='utf-8')
        for d in IMAGE_DIRS:
            i = 0
            while (i := text.find(d + '/', i)) != -1:
                j = i
                while j < len(text) and text[j] not in '"\')` ':
                    j += 1
                refs.add(text[i:j].replace('../', '')); i = j
    return {r for r in refs if r}


def check():
    data = load(); errors, warnings = [], []
    ids = [f['id'] for f in data['fighters']]
    if len(ids) != len(set(ids)):
        errors.append('duplicate fighter ids')
    for f in data['fighters']:
        fid, sh = f['id'], f['sheets']
        for key in ['motion', 'portrait', 'attack', 'special']:
            if key in sh and not (ROOT / sh[key]).exists():
                errors.append(f'{fid}: {key} sheet missing: {sh[key]}')
        cells = sh['cols'] * sh['rows']
        for k in FRAME_KEYS:
            bad = [n for n in f['frames'].get(k, []) if not 0 <= n < cells]
            if bad: errors.append(f'{fid}: frames.{k} {bad} outside the {sh["cols"]}x{sh["rows"]} sheet')
        jp = f.get('jump')
        if jp:
            jc = jp['cols'] * jp['rows'] if jp.get('sheet') else cells
            if jp.get('sheet') and not (ROOT / jp['sheet']).exists():
                errors.append(f'{fid}: jump sheet missing: {jp["sheet"]}')
            for k in JUMP_KEYS + ['riseFwd', 'apexFwd']:
                if k in jp and not 0 <= jp[k] < jc:
                    errors.append(f'{fid}: jump.{k}={jp[k]} outside its sheet')
            if not jp.get('art'):
                warnings.append(f'{fid}: no dedicated jump art yet (uses closest poses)')
        else:
            warnings.append(f'{fid}: no jump poses')
        for key, (c, r) in [('attack', (8, None)), ('special', (4, 2))]:
            if key in sh and (ROOT / sh[key]).exists():
                size = webp_size(ROOT / sh[key])
                if size and r and abs((size[0] / c) / (size[1] / r) - 1) > 0.6:
                    warnings.append(f'{fid}: {key} sheet {size} looks unusual for a {c}x{r} grid')
        if 'specialMove' not in f: warnings.append(f'{fid}: no special move')
    for s in data['stages']:
        if not (ROOT / s['image']).exists(): errors.append(f'stage image missing: {s["image"]}')
    for m in MOVES:
        if m not in data['moves']: errors.append(f'move {m} missing from moves')
    visible = [f['id'] for f in data['fighters'] if not f.get('hidden')]
    hidden = [f['id'] for f in data['fighters'] if f.get('hidden')]
    print(f'{len(visible)} playable: {", ".join(visible)}')
    print(f'{len(hidden)} hidden: {", ".join(hidden) or "none"}')
    for w in warnings: print('  note:', w)
    for e in errors: print('  ERROR:', e)
    print('OK: data and sprite files line up.' if not errors else f'{len(errors)} error(s).')
    return 1 if errors else 0


def assets():
    data = load(); refs = referenced(data); total_used = total_unused = 0
    rows = []
    for d in IMAGE_DIRS:
        for p in sorted((ROOT / d).rglob('*')):
            if p.suffix.lower() not in {'.webp', '.png', '.jpg', '.jpeg'}: continue
            rel = p.relative_to(ROOT).as_posix(); kb = p.stat().st_size / 1024
            used = rel in refs
            total_used += kb if used else 0; total_unused += 0 if used else kb
            rows.append((used, rel, kb, webp_size(p)))
    for used, rel, kb, size in rows:
        print(f'{"used  " if used else "UNUSED"} {kb:8.0f} KB  {str(size or ""):14s} {rel}')
    print(f'\nGame downloads about {total_used/1024:.1f} MB of images. '
          f'{total_unused/1024:.1f} MB of images in the folder are not used and can be deleted.')
    for r in sorted(refs):
        if not (ROOT / r).exists(): print('  MISSING:', r)


def serve(port=8000):
    handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(ROOT))
    with socketserver.TCPServer(('127.0.0.1', port), handler) as httpd:
        url = f'http://localhost:{port}/'
        print(f'Cursebound running at {url}  (Ctrl+C to stop)')
        try: webbrowser.open(url)
        except Exception: pass
        httpd.serve_forever()


if __name__ == '__main__':
    cmd = sys.argv[1] if len(sys.argv) > 1 else 'check'
    if cmd == 'check': sys.exit(check())
    elif cmd == 'assets': assets()
    elif cmd == 'serve': serve(int(sys.argv[2]) if len(sys.argv) > 2 else 8000)
    else: print(__doc__)
