import re

path = 'src/store/translations.ts'
content = open(path, 'r', encoding='utf-8').read()

# Toutes les corrections : backslash + lettre → apostrophe + lettre
# dans des valeurs de traduction FR uniquement
fixes = [
    # event_form
    ("l\\objectif",        "l\\'objectif"),
    ("l\\intervenant",     "l\\'intervenant"),
    ("l\\entreprise",      "l\\'entreprise"),
    ("d\\invitation",      "d\\'invitation"),
    # admin
    ("d\\Activit",         "d\\'Activit"),
    # moderation
    ("Aujourd\\hui",       "Aujourd\\'hui"),
    # news_form
    ("l\\Article",         "l\\'Article"),
]

count = 0
for bad, good in fixes:
    n = content.count(bad)
    if n > 0:
        content = content.replace(bad, good)
        print(f'OK ({n}x): {bad!r} → {good!r}')
        count += n
    else:
        print(f'SKIP (not found): {bad!r}')

open(path, 'w', encoding='utf-8').write(content)
print(f'\nTotal: {count} corrections appliquées.')
