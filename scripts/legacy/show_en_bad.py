import re

content = open('src/store/translations.ts', encoding='utf-8').read()
en_start = re.search(r'\n  en:\s*\{', content)
ar_start = re.search(r'\n  ar:\s*\{', content)
en_block = content[en_start.end():ar_start.start()]
keys = re.findall(r"'([^']+)'\s*:\s*'([^']*?)'", en_block)
french_chars = set('àâäéèêëîïôöùûüçœæÀÂÄÉÈÊËÎÏÔÖÙÛÜÇŒÆ')
bad = [(k, v) for k, v in keys if any(c in french_chars for c in v)]
for k, v in bad:
    print(repr(k), ':', repr(v[:100]))
