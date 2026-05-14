#!/usr/bin/env python3
import re
import json

with open('src/store/translations.ts', 'r', encoding='utf-8') as f:
    content = f.read()

def extract_kv(content, lang):
    start = content.find(f'\n  {lang}: ' + '{')
    candidates = [content.find(f'\n  {l}: ' + '{') for l in ['fr','en','ar','es'] if l != lang]
    end = min([x for x in candidates if x > start], default=len(content))
    section = content[start:end]
    pairs = {}
    for m in re.finditer(r"'([^']+)'\s*:\s*'((?:[^'\\]|\\.)*)'", section):
        pairs[m.group(1)] = m.group(2)
    return pairs

fr_kv = extract_kv(content, 'fr')
ar_kv = extract_kv(content, 'ar')

untranslated = {k: v for k, v in ar_kv.items() if k in fr_kv and v == fr_kv[k]}

# Filtrer un chunk spécifique
chunk_keys = {k: v for k, v in untranslated.items() if k.startswith('common.') or k.startswith('badge.')}

print(json.dumps(chunk_keys, ensure_ascii=False, indent=2))
