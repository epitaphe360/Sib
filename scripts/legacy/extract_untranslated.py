#!/usr/bin/env python3
"""Extrait toutes les clés FR non traduites en AR/ES pour audit."""
import re

with open('src/store/translations.ts', 'r', encoding='utf-8') as f:
    content = f.read()

def extract_kv(content, lang):
    start = content.find(f'\n  {lang}: ' + '{')
    if start < 0: return {}
    candidates = [content.find(f'\n  {l}: ' + '{') for l in ['fr','en','ar','es'] if l != lang]
    end = min([x for x in candidates if x > start], default=len(content))
    section = content[start:end]
    pairs = {}
    for m in re.finditer(r"'([^']+)'\s*:\s*'((?:[^'\\]|\\.)*)'", section):
        pairs[m.group(1)] = m.group(2)
    return pairs

fr_kv = extract_kv(content, 'fr')
ar_kv = extract_kv(content, 'ar')

# Clés non traduites (même valeur que FR)
untranslated = {k: v for k, v in ar_kv.items() if k in fr_kv and v == fr_kv[k]}

# Par section
sections = {}
for k, v in untranslated.items():
    prefix = k.split('.')[0]
    if prefix not in sections:
        sections[prefix] = {}
    sections[prefix][k] = v

print(f"Total non traduites: {len(untranslated)}")
for prefix, keys in sorted(sections.items(), key=lambda x: -len(x[1])):
    print(f"\n[{prefix}] — {len(keys)} clés")
    for k, v in list(keys.items())[:5]:
        print(f"  '{k}': '{v[:60]}'")
    if len(keys) > 5:
        print(f"  ... et {len(keys)-5} autres")
