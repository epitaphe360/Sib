#!/usr/bin/env python3
import re
with open('src/store/translations.ts', 'r', encoding='utf-8') as f:
    content = f.read()

for lang in ['fr','en','ar','es']:
    start = content.find(f'\n  {lang}: ' + '{')
    candidates = []
    for l in ['fr','en','ar','es']:
        if l != lang:
            pos = content.find(f'\n  {l}: ' + '{')
            if pos > start:
                candidates.append(pos)
    end = min(candidates) if candidates else len(content)
    sec = content[start:end]
    keys = len(re.findall(r"'[^']+'\s*:", sec))
    print(f'{lang.upper()}: {keys} cles')
