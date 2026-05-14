path = 'src/pages/visitor/VisitorBankTransferPage.tsx'
content = open(path, 'r', encoding='utf-8').read()

R = '\ufffd'

fixes = [
    # Générer
    (f'G{R}n{R}rer', 'Générer'),
    # référence
    (f'r{R}f{R}rence', 'référence'),
    # envoyé
    (f'envoy{R}', 'envoyé'),
    # succès
    (f'succ{R}s', 'succès'),
    # validé
    (f'valid{R}', 'validé'),
    # ouvrés
    (f'ouvr{R}s', 'ouvrés'),
    # données
    (f'donn{R}es', 'données'),
    # bullet/séparateur devant {info}
    (f'{R} {{info}}', '• {info}'),
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
print(f'VisitorBankTransferPage: {count} corrections, {remaining} restants\n')
