path = 'src/pages/public/PresentationPage.tsx'
content = open(path, 'r', encoding='utf-8').read()

R = '\ufffd'

fixes = [
    # Matériaux
    (f'Mat{R}riaux', 'Matériaux'),
    (f'mat{R}riaux', 'matériaux'),
    # représentées / représentés
    (f'repr{R}sent{R}es', 'représentées'),
    (f'repr{R}sent{R}s', 'représentés'),
    # à SIB revient / à travers / à
    # Pour la préposition "à" : context "timent ï¿½ SIB" et "salon ï¿½ travers"
    # On ne peut pas faire un remplacement générique de ï¿½ seul
    # édition
    (f'{R}dition', 'édition'),
    # célébrant
    (f'c{R}l{R}brant', 'célébrant'),
    # années
    (f'ann{R}es', 'années'),
    # référence
    (f'r{R}f{R}rence', 'référence'),
    # portée
    (f'port{R}e', 'portée'),
    # conférences
    (f'conf{R}rences', 'conférences'),
    # Entrée / entrée
    (f'Entr{R}e', 'Entrée'),
    (f'entr{R}e', 'entrée'),
    # être
    (f'{R}tre', 'être'),
    # modalités
    (f'modalit{R}s', 'modalités'),
]

count = 0
for bad, good in fixes:
    n = content.count(bad)
    if n > 0:
        content = content.replace(bad, good)
        print(f'  OK ({n}x): {bad!r} → {good!r}')
        count += n
    else:
        print(f'  SKIP: {bad!r}')

remaining = content.count(R)
print(f'\n{remaining} FFFD restants:')
if remaining:
    import re
    for m in re.finditer(r'.{0,30}' + R + r'.{0,30}', content):
        print(f'  {m.group()!r}')

open(path, 'w', encoding='utf-8').write(content)
print(f'\nPresentationPage: {count} corrections, {remaining} restants')
