#!/usr/bin/env python3
import re
from collections import Counter

with open('src/store/translations.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Trouver où commence chaque section de langue
en_pos = content.find('\n  en: {')
fr_section = content[content.find('\n  fr: {')+1:en_pos]
en_section = content[en_pos+1:]

# Extraire les clés (format 'key': ou "key":)
fr_keys = re.findall(r"'([^']+)'\s*:", fr_section)
en_keys = re.findall(r"'([^']+)'\s*:", en_section)

fr_unique = sorted(set(fr_keys))
en_unique = sorted(set(en_keys))

print(f"=== AUDIT COMPLET DES TRADUCTIONS ===\n")
print(f"FR total clés (avec doublons): {len(fr_keys)}")
print(f"FR clés uniques: {len(fr_unique)}")
print(f"EN total clés (avec doublons): {len(en_keys)}")
print(f"EN clés uniques: {len(en_unique)}")

# Doublons
fr_dups = {k: v for k, v in Counter(fr_keys).items() if v > 1}
en_dups = {k: v for k, v in Counter(en_keys).items() if v > 1}
print(f"\nFR doublons: {len(fr_dups)}")
for k, v in list(fr_dups.items())[:10]:
    print(f"  '{k}' x{v}")

print(f"\nEN doublons: {len(en_dups)}")
for k, v in list(en_dups.items())[:10]:
    print(f"  '{k}' x{v}")

# Clés manquantes dans EN par rapport à FR
missing_in_en = set(fr_unique) - set(en_unique)
print(f"\nClés FR absentes en EN: {len(missing_in_en)}")
if missing_in_en:
    print("Exemples:")
    for k in sorted(list(missing_in_en))[:20]:
        print(f"  '{k}'")

# Clés EN non présentes en FR (potentiellement orphelines)
extra_in_en = set(en_unique) - set(fr_unique)
print(f"\nClés EN sans équivalent FR (orphelines): {len(extra_in_en)}")

# Couverture EN/FR
coverage = round(len(en_unique) / len(fr_unique) * 100, 1) if fr_unique else 0
print(f"\n=== RÉSUMÉ ===")
print(f"FR: {len(fr_unique)} clés uniques (baseline 100%)")
print(f"EN: {len(en_unique)} clés uniques ({coverage}%)")
print(f"AR: 0 clés (0%) ❌")
print(f"ES: 0 clés (0%) ❌")
print(f"\nNombre réel de clés à traduire (AR + ES): {len(fr_unique) * 2}")
