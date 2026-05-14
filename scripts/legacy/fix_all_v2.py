import os
import re

def decode_mixed(raw: bytes) -> str:
    """Décode des bytes en encodage mixte : UTF-8 valide + cp1252 pour les bytes isolés."""
    result = []
    i = 0
    while i < len(raw):
        b = raw[i]
        if b < 0x80:
            result.append(chr(b))
            i += 1
        elif 0xc0 <= b < 0xe0 and i + 1 < len(raw) and 0x80 <= raw[i+1] < 0xc0:
            try:
                result.append(raw[i:i+2].decode('utf-8'))
                i += 2
            except UnicodeDecodeError:
                result.append(bytes([b]).decode('cp1252', errors='replace'))
                i += 1
        elif 0xe0 <= b < 0xf0 and i + 2 < len(raw) and 0x80 <= raw[i+1] < 0xc0 and 0x80 <= raw[i+2] < 0xc0:
            try:
                result.append(raw[i:i+3].decode('utf-8'))
                i += 3
            except UnicodeDecodeError:
                result.append(bytes([b]).decode('cp1252', errors='replace'))
                i += 1
        elif 0xf0 <= b < 0xf8 and i + 3 < len(raw) and all(0x80 <= raw[i+j] < 0xc0 for j in range(1, 4)):
            try:
                result.append(raw[i:i+4].decode('utf-8'))
                i += 4
            except UnicodeDecodeError:
                result.append(bytes([b]).decode('cp1252', errors='replace'))
                i += 1
        else:
            try:
                result.append(bytes([b]).decode('cp1252'))
            except (UnicodeDecodeError, ValueError):
                result.append('\ufffd')
            i += 1
    return ''.join(result)


# Scanner TOUT le projet (pas seulement src/)
SCAN_DIRS = ['src', 'server', 'scripts', 'api']
EXTENSIONS = ('.tsx', '.ts', '.js', '.jsx', '.mjs', '.cjs')
SKIP_DIRS = {'node_modules', '.git', 'dist', 'build', '.venv', '__pycache__'}

fixed = []
skipped = 0
errors = []

for scan_dir in SCAN_DIRS:
    if not os.path.isdir(scan_dir):
        continue
    for root, dirs, files in os.walk(scan_dir):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        for fname in files:
            if not any(fname.endswith(ext) for ext in EXTENSIONS):
                continue
            path = os.path.join(root, fname)
            raw = open(path, 'rb').read()

            # Vérifier si le fichier est déjà valide UTF-8
            try:
                raw.decode('utf-8')
                skipped += 1
                continue
            except UnicodeDecodeError:
                pass

            # Décoder en mixte cp1252 + UTF-8
            try:
                text = decode_mixed(raw)
            except Exception as e:
                errors.append((path, str(e)))
                continue

            open(path, 'w', encoding='utf-8').write(text)

            # Vérification
            raw2 = open(path, 'rb').read()
            try:
                raw2.decode('utf-8')
                fixed.append(path)
            except UnicodeDecodeError as e:
                errors.append((path, f'APRÈS: {e}'))

print(f'✓ {len(fixed)} fichier(s) corrigé(s):')
for p in fixed:
    print(f'  {p}')
print(f'\n○ {skipped} fichier(s) déjà UTF-8')
if errors:
    print(f'\n✗ {len(errors)} erreur(s):')
    for p, e in errors:
        print(f'  {p}: {e}')
else:
    print('Aucune erreur.')
