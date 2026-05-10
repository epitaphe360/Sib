import re

content = open('src/store/translations.ts', encoding='utf-8').read()

# ES block starts at the \n  es: { and goes to end of file (last })
es_match = re.search(r'\n  es:\s*\{', content)
es_start = es_match.start()

# Remove the ES block (everything from \n  es: to end of object, keep only closing };)
new_content = content[:es_start] + '\n};\n'

open('src/store/translations.ts', 'w', encoding='utf-8').write(new_content)
print(f'Bloc ES supprimé. Taille avant: {len(content)} / après: {len(new_content)}')
