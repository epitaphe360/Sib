import re
content = open('src/store/translations.ts', 'r', encoding='utf-8').read()

for pattern in ['admin.new_modules', 'partenaires.annuaire_desc', 'partenaires.annuaire']:
    matches = re.findall(r"'" + re.escape(pattern) + r"'[^\n]*", content)
    for m in matches[:3]:
        print(repr(m))
    print('---')
