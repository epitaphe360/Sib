import re

with open('src/store/translations.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Trouver le début de la section ar
ar_start = 0
for i, line in enumerate(lines):
    if line.strip() == 'ar: {':
        ar_start = i
        break

print(f'Section ar commence ligne {ar_start + 1}')

fixed = 0
for i in range(ar_start, len(lines)):
    # Pattern: '  'value_arabe'texte_latin_résiduel',
    # on cherche: début + clé + ': ' + valeur arabe + ' (stray) + texte latin + ' + reste
    m = re.match(r"(\s*'[^']+': ')([^']+)'([a-zA-Z\u00C0-\u017F][^']*)('.*)", lines[i])
    if m:
        newline = m.group(1) + m.group(2) + m.group(4)
        if not newline.endswith('\n'):
            newline += '\n'
        lines[i] = newline
        fixed += 1

print(f'{fixed} lignes corrigées')

with open('src/store/translations.ts', 'w', encoding='utf-8') as f:
    f.writelines(lines)
print('Fichier sauvegardé')
