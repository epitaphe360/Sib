#!/usr/bin/env python3
import re
import os
from collections import Counter

# 1. Extraire toutes les clés définies dans translations.ts
with open('src/store/translations.ts', 'r', encoding='utf-8') as f:
    content = f.read()

en_pos = content.find('\n  en: {')
fr_section = content[content.find('\n  fr: {')+1:en_pos]
en_section = content[en_pos+1:]

fr_keys = set(re.findall(r"'([^']+)'\s*:", fr_section))
en_keys = set(re.findall(r"'([^']+)'\s*:", en_section))

print(f"Clés définies - FR: {len(fr_keys)}, EN: {len(en_keys)}")

# 2. Extraire toutes les clés utilisées dans les fichiers TSX/TS
used_keys = {}
src_path = 'src'

for root, dirs, files in os.walk(src_path):
    # Skip node_modules and build dirs
    dirs[:] = [d for d in dirs if d not in ['node_modules', 'dist', '.git']]
    for fname in files:
        if fname.endswith(('.tsx', '.ts')) and 'translations' not in fname:
            fpath = os.path.join(root, fname)
            try:
                with open(fpath, 'r', encoding='utf-8', errors='ignore') as f:
                    src = f.read()
                # t('key') or t("key") or t(`key`)
                keys = re.findall(r"\bt\(\s*['\"`]([^'\"` ]+)['\"`]", src)
                for k in keys:
                    if k not in used_keys:
                        used_keys[k] = []
                    used_keys[k].append(fpath.replace('\\', '/'))
            except:
                pass

print(f"Clés utilisées dans le code: {len(used_keys)}")

# 3. Clés utilisées mais non définies en FR
missing_fr = {k: v for k, v in used_keys.items() if k not in fr_keys}
# Filtre: uniquement les vraies clés (pas les interpolations comme 'pages.${slug}')
missing_fr_clean = {k: v for k, v in missing_fr.items() if '$' not in k and '{' not in k}

print(f"\n=== CLÉS UTILISÉES MAIS NON DÉFINIES EN FR: {len(missing_fr_clean)} ===")
# Grouper par préfixe
prefixes = Counter(k.split('.')[0] for k in missing_fr_clean.keys())
print("\nPar section:")
for prefix, count in sorted(prefixes.items(), key=lambda x: -x[1]):
    print(f"  {prefix}.*: {count} clés manquantes")

# Lister les 50 premières
print(f"\nPremières clés manquantes:")
for k in sorted(list(missing_fr_clean.keys()))[:50]:
    files = missing_fr_clean[k][:2]
    print(f"  '{k}' → {', '.join(files)}")

# 4. Clés EN manquantes par rapport aux clés utilisées dans le code
missing_en = {k: v for k, v in used_keys.items() if k not in en_keys and '$' not in k and '{' not in k}
print(f"\n=== CLÉS UTILISÉES MAIS NON DÉFINIES EN EN: {len(missing_en)} ===")

# 5. Résumé
all_needed = set(list(fr_keys) + list(used_keys.keys()))
all_needed_clean = {k for k in all_needed if '$' not in k and '{' not in k}
print(f"\n=== RÉSUMÉ FINAL ===")
print(f"Clés définies en FR: {len(fr_keys)}")
print(f"Clés utilisées dans le code: {len([k for k in used_keys if '$' not in k and '{' not in k])}")
print(f"Total clés uniques à couvrir: {len(all_needed_clean)}")
print(f"Clés à créer pour AR: {len(all_needed_clean)}")
print(f"Clés à créer pour ES: {len(all_needed_clean)}")
print(f"EN manquante: {len(missing_en)} clés à compléter")
