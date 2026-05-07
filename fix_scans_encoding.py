import re

path = 'src/pages/exhibitor/ExhibitorScansPage.tsx'
# Lire en latin-1 pour préserver les bytes corrompus
content = open(path, 'r', encoding='latin-1').read()

print(f'Longueur: {len(content)} caractères')

replacements = [
    # CSV headers (é = \xe9, è = \xe8 in latin-1)
    ("Soci\xe9t\xe9", "Soci\u00e9t\u00e9"),  # Société
    ("T\xe9l\xe9phone", "T\u00e9l\u00e9phone"),  # Téléphone
    ("Scann\xe9 par", "Scann\u00e9 par"),  # Scanné par

    # Fallback date : '\xe9' → '—'
    ("    : '\xe9';", "    : '\u2014';"),

    # Fallback company
    ("?? '\xe9'}", "?? '\u2014'}"),

    # Fallback location span
    (">\xe9</span>", ">\u2014</span>"),

    # Separator entre totalLabel et uniqueLabel
    ("{totalLabel} \xe9 {uniqueLabel}", "{totalLabel} \u25c6 {uniqueLabel}"),

    # Commentaire En-tête
    ("En-t\xeate", "En-t\u00eate"),

    # Commentaire Récupérer
    ("R\xe9cup\xe9rer", "R\u00e9cup\u00e9rer"),

    # Commentaire Propriétaire / décroissant
    ("Propri\xe9taire", "Propri\u00e9taire"),
    ("d\xe9croissant", "d\u00e9croissant"),

    # Loading placeholder dans stats
    ("? '\xe9' :", "? '\u2026' :"),
]

applied = 0
for old, new in replacements:
    if old in content:
        content = content.replace(old, new)
        print(f'OK: {repr(old[:50])}')
        applied += 1
    else:
        print(f'SKIP (not found): {repr(old[:50])}')

# Vérification finale
remaining = content.count('\uFFFD')
print(f'\n{applied}/{len(replacements)} remplacements appliqués')
print(f'{remaining} \\uFFFD restants')

if remaining > 0:
    for m in re.finditer(r'.{0,30}\uFFFD.{0,30}', content):
        print(f'  Restant: {repr(m.group())}')

open(path, 'w', encoding='utf-8').write(content)
print('Fichier sauvegardé.')
