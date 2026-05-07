import os
import re

src_dir = 'src'
fixed = []
skipped = []
errors = []

for root, dirs, files in os.walk(src_dir):
    # Ignorer node_modules s'il existe dans src
    dirs[:] = [d for d in dirs if d not in ('node_modules', '.git')]
    for fname in files:
        if not (fname.endswith('.tsx') or fname.endswith('.ts')):
            continue
        path = os.path.join(root, fname)
        raw = open(path, 'rb').read()

        # Vérifier si le fichier est valide UTF-8
        try:
            raw.decode('utf-8')
            skipped.append(path)
            continue  # déjà bon
        except UnicodeDecodeError:
            pass

        # Essayer de décoder en cp1252
        try:
            text = raw.decode('cp1252')
        except UnicodeDecodeError as e:
            errors.append((path, str(e)))
            continue

        # Réécrire en UTF-8
        open(path, 'w', encoding='utf-8').write(text)

        # Vérifier que le résultat est valide UTF-8
        raw2 = open(path, 'rb').read()
        try:
            raw2.decode('utf-8')
            fixed.append(path)
        except UnicodeDecodeError as e:
            errors.append((path, f'APRÈS correction: {e}'))

print(f'\n✓ {len(fixed)} fichier(s) corrigé(s) (cp1252 → UTF-8):')
for p in fixed:
    print(f'  {p}')

print(f'\n○ {len(skipped)} fichier(s) déjà en UTF-8 (ignorés)')

if errors:
    print(f'\n✗ {len(errors)} erreur(s):')
    for p, e in errors:
        print(f'  {p}: {e}')
else:
    print('\nAucune erreur.')
