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
    # Pattern plus large: valeur arabe suivie de stray ' puis texte quelconque jusqu'à ',
    # Regex: clé + ': ' + texte_arabe + ' (stray) + anything + ' (closing) + ,
    # On cherche: ': 'VAL'GARBAGE', where GARBAGE is non-empty and not pure arabic
    m = re.match(r"(\s*'[^']+': ')([^']+)'([^']+)(',.*)", lines[i])
    if m:
        val = m.group(2)
        garbage = m.group(3)
        # On ne fixe que si le garbage contient des caractères non-arabes
        # (le garbage devrait être du texte français résiduel)
        if re.search(r'[a-zA-Z\u00C0-\u024F]', garbage):
            newline = m.group(1) + val + m.group(4)
            if not newline.endswith('\n'):
                newline += '\n'
            print(f"  L{i+1}: '{garbage[:40]}' supprimé")
            lines[i] = newline
            fixed += 1

print(f'\n{fixed} lignes supplémentaires corrigées')

with open('src/store/translations.ts', 'w', encoding='utf-8') as f:
    f.writelines(lines)
print('Fichier sauvegardé')
