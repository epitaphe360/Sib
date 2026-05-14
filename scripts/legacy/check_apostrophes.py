#!/usr/bin/env python3
"""Corrige les apostrophes non échappées dans les valeurs de translations.ts"""
import re

with open('src/store/translations.ts', 'r', encoding='utf-8') as f:
    content = f.read()

lines = content.split('\n')
problems = []
for i, line in enumerate(lines):
    # Chercher: '  key': 'valeur'
    m = re.match(r"^(\s*'[^']+'\s*:\s*')(.*)(',?\s*)$", line)
    if m:
        prefix = m.group(1)
        val = m.group(2)
        suffix = m.group(3)
        # L'apostrophe de fermeture est dans suffix, pas dans val
        # Vérifier si val contient une apostrophe non échappée
        if "'" in val:
            problems.append((i+1, line.strip()[:100]))

print(f"Lignes avec apostrophes dans valeurs: {len(problems)}")
for ln, l in problems[:30]:
    print(f"  L{ln}: {l}")
