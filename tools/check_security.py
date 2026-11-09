"""Static security checks for the site. Run from the repo root: python3 tools/check_security.py

Fails (exit 1) if any page:
  - lacks a Content-Security-Policy meta tag, or its CSP allows 'unsafe-inline' / 'unsafe-eval'
    or omits default-src 'none', object-src 'none', base-uri or form-action
  - uses inline <script>/<style>, style="" or on*="" attributes (the CSP would block them)
  - loads anything over plain http://
  - opens a target="_blank" link without rel="noopener"
Also verifies vendored library checksums and greps for obvious secrets.
"""
import hashlib, pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SKIP = {'.git', 'vendor', 'node_modules'}
errors = []

def files(*exts):
    for p in ROOT.rglob('*'):
        if p.is_file() and p.suffix in exts and not SKIP & set(p.relative_to(ROOT).parts):
            yield p

for page in files('.html'):
    rel = page.relative_to(ROOT); s = page.read_text(encoding='utf-8', errors='replace')
    m = re.search(r'http-equiv="Content-Security-Policy"\s+content="([^"]+)"', s)
    if not m:
        errors.append(f'{rel}: no CSP meta tag')
    else:
        csp = m.group(1)
        for bad in ("'unsafe-inline'", "'unsafe-eval'"):
            if bad in csp: errors.append(f'{rel}: CSP allows {bad}')
        for need in ("default-src 'none'", "object-src 'none'", 'base-uri', 'form-action'):
            if need not in csp: errors.append(f'{rel}: CSP missing {need}')
    if re.search(r'<script(?![^>]*\bsrc=)[^>]*>', s): errors.append(f'{rel}: inline <script>')
    if re.search(r'<style[\s>]', s): errors.append(f'{rel}: inline <style>')
    if re.search(r'\sstyle="', s): errors.append(f'{rel}: style="" attribute (blocked by CSP)')
    if re.search(r'\son[a-z]+="', s): errors.append(f'{rel}: inline event handler')
    for a in re.findall(r'<a\s[^>]*target="_blank"[^>]*>', s):
        if 'noopener' not in a and 'noreferrer' not in a: errors.append(f'{rel}: target=_blank without rel=noopener: {a[:80]}')

for f in files('.html', '.css', '.js'):
    for url in re.findall(r'''(?:src|href|url\()\s*=?\s*["']?(http://[^"')\s]+)''', f.read_text(encoding='utf-8', errors='replace')):
        errors.append(f'{f.relative_to(ROOT)}: insecure http:// resource {url}')

secret = re.compile(r'AKIA[0-9A-Z]{16}|ghp_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{20,}|sk-[A-Za-z0-9]{24,}|AIza[0-9A-Za-z_-]{35}|xox[bap]-[A-Za-z0-9-]{10,}|-----BEGIN [A-Z ]*PRIVATE KEY')
for f in files('.html', '.css', '.js', '.py', '.json', '.txt', '.md', '.yml', '.yaml', '.env'):
    if secret.search(f.read_text(encoding='utf-8', errors='replace')): errors.append(f'{f.relative_to(ROOT)}: looks like a secret')

for line in (ROOT / 'VENDOR-CHECKSUMS.txt').read_text().split('\n'):
    if line.strip():
        digest, name = line.split(None, 1)
        if hashlib.sha256((ROOT / 'vendor' / name.strip()).read_bytes()).hexdigest() != digest:
            errors.append(f'vendor/{name.strip()}: checksum mismatch')

print('\n'.join(errors) or 'All security checks passed.')
sys.exit(1 if errors else 0)
