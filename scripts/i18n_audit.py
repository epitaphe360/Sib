#!/usr/bin/env python3
"""Audit i18n SIB — clés manquantes, stubs, incohérences fr/en/ar"""
import re, sys

def extract_keys(path):
    with open(path, encoding='utf-8', errors='replace') as f:
        content = f.read()
    # Format: '    \'key.sub\': \'value\'' ou "    'key.sub': \"value\""
    return re.findall(r"^\s+['\"]([\w.]+)['\"]\s*:", content, re.MULTILINE)

def extract_stubs(path):
    with open(path, encoding='utf-8', errors='replace') as f:
        content = f.read()
    # Valeurs vides, TODO ou ...
    stubs = re.findall(r"^\s+['\"]([\w.]+)['\"]\s*:\s*['\"](\ *|TODO|\.\.\.)['\"]" , content, re.MULTILINE)
    return [s[0] for s in stubs]

fr_keys = extract_keys('src/store/translations.fr.ts')
en_keys = extract_keys('src/store/translations.en.ts')
ar_keys = extract_keys('src/store/translations.ar.ts')

fr_set = set(fr_keys)
en_set = set(en_keys)
ar_set = set(ar_keys)

missing_en = sorted(fr_set - en_set)
missing_ar = sorted(fr_set - ar_set)
extra_en   = sorted(en_set - fr_set)
extra_ar   = sorted(ar_set - fr_set)

fr_stubs = extract_stubs('src/store/translations.fr.ts')
en_stubs = extract_stubs('src/store/translations.en.ts')
ar_stubs = extract_stubs('src/store/translations.ar.ts')

print("=== RAPPORT I18N SIB ===")
print(f"FR: {len(fr_keys)} cles | EN: {len(en_keys)} cles | AR: {len(ar_keys)} cles")
print()
print(f"MANQUANTES EN  : {len(missing_en)} cles")
print(f"MANQUANTES AR  : {len(missing_ar)} cles")
print(f"EXTRA EN (hors FR) : {len(extra_en)} cles")
print(f"EXTRA AR (hors FR) : {len(extra_ar)} cles")
print(f"STUBS FR : {len(fr_stubs)} | STUBS EN : {len(en_stubs)} | STUBS AR : {len(ar_stubs)}")

if missing_en:
    print(f"\n--- TOP 50 MANQUANTES DANS EN ---")
    for k in missing_en[:50]: print(f"  {k}")

if missing_ar:
    print(f"\n--- TOP 50 MANQUANTES DANS AR ---")
    for k in missing_ar[:50]: print(f"  {k}")

if en_stubs:
    print(f"\n--- STUBS EN (top 30) ---")
    for k in en_stubs[:30]: print(f"  {k}")

if ar_stubs:
    print(f"\n--- STUBS AR (top 30) ---")
    for k in ar_stubs[:30]: print(f"  {k}")

if extra_en:
    print(f"\n--- EXTRA EN (dans EN mais pas FR) top 20 ---")
    for k in extra_en[:20]: print(f"  {k}")
