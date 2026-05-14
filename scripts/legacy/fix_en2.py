import re

content = open('src/store/translations.ts', encoding='utf-8').read()
en_start = re.search(r'\n  en:\s*\{', content)
ar_start = re.search(r'\n  ar:\s*\{', content)
en_block_start = en_start.end()
en_block_end = ar_start.start()
en_block = content[en_block_start:en_block_end]

FIXES = {
    'about.innovation': 'Innovation & Smart Buildings',
    'about.innovation_desc': 'Cutting-edge building technologies',
    'about.desc1': 'The <strong>International Buildings and Ecosystem Exhibition (SIB)</strong> is the must-attend event for construction and building professionals.',
    'about.desc3': '<strong>Under the aegis of the Ministry of Equipment and Water of the Kingdom of Morocco</strong>, the SIB brings together the entire international building ecosystem.',
    'about.card_title': 'International Buildings Exhibition',
    'about.card_desc': 'The largest building event in Africa and the Arab world',
    'about.cta_desc': 'Book your spot now and discover the opportunities of the largest international building exhibition.',
    'media.gallery_desc': 'Discover the unique atmosphere of the International Buildings Exhibition',
}

fixed = 0
for key, val in FIXES.items():
    pattern = r"('" + re.escape(key) + r"'\s*:\s*')([^']*?)(')"
    new_block, count = re.subn(pattern, r'\g<1>' + val.replace('\\', '\\\\') + r'\3', en_block)
    if count:
        en_block = new_block
        fixed += count
    else:
        print(f'NON TROUVEE: {key}')

content = content[:en_block_start] + en_block + content[en_block_end:]
open('src/store/translations.ts', 'w', encoding='utf-8').write(content)
print(f'Clés corrigées: {fixed}')

# Vérification
content2 = open('src/store/translations.ts', encoding='utf-8').read()
en_m = re.search(r'\n  en:\s*\{', content2)
ar_m = re.search(r'\n  ar:\s*\{', content2)
en_b2 = content2[en_m.end():ar_m.start()]
keys2 = re.findall(r"'([^']+)'\s*:\s*'([^']*?)'", en_b2)
french_chars = set('àâäéèêëîïôöùûüçœæÀÂÄÉÈÊËÎÏÔÖÙÛÜÇŒÆ')
bad2 = [(k, v) for k, v in keys2 if any(c in french_chars for c in v)]
total2 = len(keys2)
print(f'Résultat final EN: {total2 - len(bad2)}/{total2} = {100*(total2-len(bad2))//total2}% — restantes françaises: {len(bad2)}')
