#!/usr/bin/env python3
import re

with open('src/store/translations.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Trouver les index des sections
section_indices = {}
for i, line in enumerate(lines):
    if re.match(r'^\s*(fr|en|ar|es):\s*\{', line):
        lang = re.match(r'^\s*(\w+):', line).group(1)
        section_indices[lang] = i

print("Indices des sections:")
for lang, idx in sorted(section_indices.items(), key=lambda x: x[1]):
    print(f"{lang}: ligne {idx+1}")

# Compter les clés dans chaque section
sections_bounds = [
    ('fr', section_indices.get('fr'), section_indices.get('en')),
    ('en', section_indices.get('en'), section_indices.get('ar')),
    ('ar', section_indices.get('ar'), section_indices.get('es')),
    ('es', section_indices.get('es'), len(lines)),
]

results = {}
for lang, start, end in sections_bounds:
    if start is not None and end is not None:
        section_lines = lines[start:end]
        section_text = ''.join(section_lines)
        keys = len(re.findall(r"'[^']+'\s*:", section_text))
        results[lang] = keys
        print(f"\n{lang.upper()}: {keys} clés")

# Pourcentages
if results:
    fr = results.get('fr', 0)
    print(f"\n=== POURCENTAGE DE TRADUCTION ===")
    print(f"FR (Français): {fr} clés (100%)")
    for lang in ['en', 'ar', 'es']:
        pct = round(results.get(lang, 0) / fr * 100, 1) if fr > 0 else 0
        print(f"{lang.upper()}: {results.get(lang, 0)} clés ({pct}%)")

# Analyser la couverture réelle (clés avec traduction non vide)
print(f"\n=== COUVERTURE RÉELLE (non vide) ===")
for lang in ['fr', 'en', 'ar', 'es']:
    start, end = section_indices.get(lang), section_indices.get(list(section_indices.keys())[list(section_indices.keys()).index(lang)+1]) if lang != 'es' else len(lines)
    if start is not None:
        section_lines = lines[start:end]
        section_text = ''.join(section_lines)
        # Compter les clés avec valeur non vide
        filled = len(re.findall(r"'[^']+'\s*:\s*'[^']*[^']\s*'", section_text))
        total = len(re.findall(r"'[^']+'\s*:", section_text))
        pct_filled = round(filled / total * 100, 1) if total > 0 else 0
        print(f"{lang.upper()}: {filled}/{total} clés remplies ({pct_filled}%)")
