import os
import re

REPL = '\ufffd'  # U+FFFD

def scan_file_for_replacement_chars(path):
    content = open(path, 'r', encoding='utf-8').read()
    if REPL not in content:
        return None
    # Trouver les contextes
    matches = re.findall(r'.{0,40}' + re.escape(REPL) + r'.{0,40}', content)
    return matches

SCAN_DIRS = ['src', 'server', 'scripts', 'api']
EXTENSIONS = ('.tsx', '.ts', '.js', '.jsx', '.mjs', '.cjs')
SKIP_DIRS = {'node_modules', '.git', 'dist', 'build', '.venv', '__pycache__'}

found = {}
for scan_dir in SCAN_DIRS:
    if not os.path.isdir(scan_dir):
        continue
    for root, dirs, files in os.walk(scan_dir):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        for fname in files:
            if not any(fname.endswith(ext) for ext in EXTENSIONS):
                continue
            path = os.path.join(root, fname)
            matches = scan_file_for_replacement_chars(path)
            if matches:
                found[path] = matches

print(f'{len(found)} fichier(s) avec U+FFFD:\n')
for path, ctxs in found.items():
    print(f'  {path}: {len(ctxs)} occurrence(s)')
    for c in ctxs[:3]:
        print(f'    {repr(c)}')
