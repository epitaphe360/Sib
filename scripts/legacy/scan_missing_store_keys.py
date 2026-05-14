"""
Scan toutes les clés utilisées via t('key') dans les fichiers .tsx/.ts
et compare avec les clés définies dans src/store/translations.ts (bloc fr).
Génère un rapport et un fichier JSON avec les clés manquantes + valeurs auto.
"""
import os, re, json

# 1. Extraire les clés définies dans le bloc FR de translations.ts
trans_file = 'src/store/translations.ts'
content = open(trans_file, encoding='utf-8').read()

# Le bloc fr est entre 'fr: {' et le prochain bloc de langue
fr_match = re.search(r"fr:\s*\{(.+?)^\s*\},?\s*\n\s*(en|ar|es):", content, re.DOTALL | re.MULTILINE)
if not fr_match:
    print("ERREUR: impossible de trouver le bloc fr")
    exit(1)

fr_block = fr_match.group(1)
defined = set(re.findall(r"'([a-zA-Z0-9_.]+)'\s*:", fr_block))
print(f"Clés définies (fr): {len(defined)}")

# 2. Extraire toutes les clés utilisées dans le code source
used = set()
for root, dirs, files in os.walk('src'):
    dirs[:] = [d for d in dirs if d not in ['node_modules', '.git']]
    for fname in files:
        if fname.endswith(('.tsx', '.ts')):
            try:
                c = open(os.path.join(root, fname), encoding='utf-8').read()
                keys = re.findall(r"\bt\('([a-zA-Z0-9_.]+)'\)", c)
                used.update(keys)
            except:
                pass

print(f"Clés utilisées: {len(used)}")

missing = sorted(used - defined)
print(f"Clés manquantes: {len(missing)}")

# Sauvegarder la liste
with open('missing_keys_store.txt', 'w', encoding='utf-8') as f:
    for k in missing:
        f.write(k + '\n')

print("Liste sauvegardée dans missing_keys_store.txt")
