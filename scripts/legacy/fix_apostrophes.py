#!/usr/bin/env python3
"""
Corrige les apostrophes non échappées dans les VALEURS de translations.ts.
Transforme: 'key': 'valeur d'exemple',
En:         'key': 'valeur d\'exemple',
"""
import re

with open('src/store/translations.ts', 'r', encoding='utf-8') as f:
    content = f.read()

fixed_count = 0
result_lines = []

for line in content.split('\n'):
    # Détecter une ligne de traduction: optionnel espaces + 'key': 'value',
    m = re.match(r"^(\s*'[^']+'\s*:\s*')(.*)(',?\s*)$", line)
    if m:
        prefix = m.group(1)   # '    \'key\': \''
        value  = m.group(2)   # la valeur (entre les guillemets simples)
        suffix = m.group(3)   # '\','  or  '\''

        # Chercher des apostrophes non échappées dans la valeur
        # (apostrophe non précédée d'un backslash)
        if re.search(r"(?<!\\)'", value):
            # Remplacer toutes les apostrophes non échappées par \'
            fixed_value = re.sub(r"(?<!\\)'", r"\\'", value)
            new_line = prefix + fixed_value + suffix
            result_lines.append(new_line)
            fixed_count += 1
            continue

    result_lines.append(line)

new_content = '\n'.join(result_lines)

with open('src/store/translations.ts', 'w', encoding='utf-8') as f:
    f.write(new_content)

print(f"✅ {fixed_count} lignes corrigées (apostrophes échappées)")

# Vérification rapide
with open('src/store/translations.ts', 'r', encoding='utf-8') as f:
    check = f.read()

# Compter les sections
sections = {}
for lang in ['fr', 'en', 'ar', 'es']:
    if f'\n  {lang}: {{' in check:
        sections[lang] = True

print(f"Sections présentes: {list(sections.keys())}")

# Compter les clés par section
fr_start = check.find('\n  fr: {')
en_start = check.find('\n  en: {')
ar_start = check.find('\n  ar: {')
es_start = check.find('\n  es: {')

sections_bounds = [
    ('fr', fr_start, en_start),
    ('en', en_start, ar_start if ar_start > 0 else len(check)),
    ('ar', ar_start, es_start if es_start > 0 else len(check)),
    ('es', es_start, len(check)),
]

for lang, start, end in sections_bounds:
    if start > 0 and end > 0:
        section = check[start:end]
        count = len(re.findall(r"'[^']+'\s*:", section))
        print(f"{lang.upper()}: {count} clés")
