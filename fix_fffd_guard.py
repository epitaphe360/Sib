path = 'src/components/guards/PartnerTierGuard.tsx'
content = open(path, 'r', encoding='utf-8').read()

R = '\ufffd'

fixes = [
    # réservée
    (f'r{R}serv{R}e', 'réservée'),
    # Récupérer
    (f'R{R}cup{R}rer', 'Récupérer'),
    # données
    (f'donn{R}es', 'données'),
    # fonctionnalité
    (f'fonctionnalit{R}', 'fonctionnalité'),
    # nécessite
    (f'n{R}cessite', 'nécessite'),
    # requête / requêtes
    (f'requ{R}tes', 'requêtes'),
    (f'requ{R}te', 'requête'),
    # implémentée
    (f'impl{R}ment{R}e', 'implémentée'),
    # éviter
    (f'{R}viter', 'éviter'),
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
if remaining:
    import re
    for m in re.finditer(r'.{0,30}' + R + r'.{0,30}', content):
        print(f'  RESTANT: {m.group()!r}')

open(path, 'w', encoding='utf-8').write(content)
print(f'PartnerTierGuard: {count} corrections, {remaining} restants\n')
