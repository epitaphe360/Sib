#!/usr/bin/env python3
"""Extrait les clés FR sans équivalent AR, groupées par namespace."""
import re
from pathlib import Path

TRANS_FILE = Path(r"c:\Users\samye\OneDrive\Desktop\devellopement\SIB\Sib\src\store\translations.ts")
content = TRANS_FILE.read_text(encoding="utf-8")

def extract_section(text, lang):
    pattern = rf"\b{lang}:\s*\{{"
    m = re.search(pattern, text)
    if not m:
        return ""
    start = m.end()
    depth = 1
    i = start
    while i < len(text) and depth > 0:
        if text[i] == '{': depth += 1
        elif text[i] == '}': depth -= 1
        i += 1
    return text[start:i-1]

def extract_kv(section):
    """Extrait les paires key: value."""
    result = {}
    for m in re.finditer(r"'([\w.]+)'\s*:\s*'((?:[^'\\]|\\.|'')*)'", section):
        result[m.group(1)] = m.group(2)
    return result

fr_s = extract_section(content, "fr")
en_s = extract_section(content, "en")
ar_s = extract_section(content, "ar")

fr_kv = extract_kv(fr_s)
en_kv = extract_kv(en_s)
ar_kv = extract_kv(ar_s)

missing_ar = {k: (fr_kv[k], en_kv.get(k, fr_kv[k])) for k in fr_kv if k not in ar_kv}
missing_en = {k: fr_kv[k] for k in fr_kv if k not in en_kv}

# Grouper par namespace
from collections import defaultdict
ns_groups = defaultdict(list)
for k, (fr_v, en_v) in missing_ar.items():
    ns = k.split('.')[0]
    ns_groups[ns].append((k, fr_v, en_v))

print(f"=== MANQUES EN ({len(missing_en)} clés) ===")
for k, v in missing_en.items():
    print(f"  {k}: {v}")

print(f"\n=== MANQUES AR ({len(missing_ar)} clés) — par namespace ===")
for ns in sorted(ns_groups.keys()):
    keys = ns_groups[ns]
    print(f"\n[{ns}] → {len(keys)} clés")
    for k, fr_v, en_v in keys[:5]:
        print(f"  {k}: FR={fr_v[:60]}  EN={en_v[:60]}")
    if len(keys) > 5:
        print(f"  ... +{len(keys)-5} autres")

# Sauvegarder la liste complète dans un fichier
with open("missing_ar_keys.txt", "w", encoding="utf-8") as f:
    for k, (fr_v, en_v) in missing_ar.items():
        f.write(f"{k}\t{fr_v}\t{en_v}\n")
print(f"\nFichier missing_ar_keys.txt créé ({len(missing_ar)} lignes)")
