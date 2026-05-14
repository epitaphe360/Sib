#!/usr/bin/env python3
"""Extrait toutes les clés manquantes avec leurs valeurs FR pour traduction."""
import re, json

def extract_pairs(path):
    with open(path, encoding='utf-8', errors='replace') as f:
        content = f.read()
    pairs = {}
    # Two passes: single-quote lines, then double-quote lines
    for q in ("'", '"'):
        pattern = r"^\s+[" + q + r"]([\w.]+)[" + q + r"]\s*:\s*[" + q + r"]((?:[^" + q + r"\\]|\\.)*)[ " + q + r"]"
        for m in re.finditer(pattern, content, re.MULTILINE):
            pairs[m.group(1)] = m.group(2)
    return pairs

fr = extract_pairs('src/store/translations.fr.ts')
en = extract_pairs('src/store/translations.en.ts')
ar = extract_pairs('src/store/translations.ar.ts')

missing_en = {k: fr[k] for k in fr if k not in en}
missing_ar = {k: fr[k] for k in fr if k not in ar}
extra_en = {k: en[k] for k in en if k not in fr}

with open('scripts/missing_en.json', 'w', encoding='utf-8') as f:
    json.dump(missing_en, f, ensure_ascii=False, indent=2)
with open('scripts/missing_ar.json', 'w', encoding='utf-8') as f:
    json.dump(missing_ar, f, ensure_ascii=False, indent=2)
with open('scripts/extra_en.json', 'w', encoding='utf-8') as f:
    json.dump(extra_en, f, ensure_ascii=False, indent=2)

print(f"Missing EN: {len(missing_en)} clés → scripts/missing_en.json")
print(f"Missing AR: {len(missing_ar)} clés → scripts/missing_ar.json")
print(f"Extra EN: {len(extra_en)} clés → scripts/extra_en.json")
print("\nSample missing EN (first 10):")
for k, v in list(missing_en.items())[:10]:
    print(f"  '{k}': '{v}'")
