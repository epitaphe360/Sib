"""Fix: replace unescaped apostrophes that broke single-quoted strings."""

with open('src/store/translations.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Each was fixed from \X to 'X but they need to be \'X inside single-quoted strings
fixes = [
    ("l'objectif, le public cible et le contenu de l'événement",
     "l\\'objectif, le public cible et le contenu de l\\'événement"),
    ("Nom de l'intervenant',",
     "Nom de l\\'intervenant',"),
    ("Nom de l'entreprise',",
     "Nom de l\\'entreprise',"),
    ("biographie de l'intervenant',",
     "biographie de l\\'intervenant',"),
    ("Demandes d'invitation',",
     "Demandes d\\'invitation',"),
    ("Journal d'Activité',",
     "Journal d\\'Activité',"),
    ("Approuvés Aujourd'hui',",
     "Approuvés Aujourd\\'hui',"),
    ("Modifier l'Article',",
     "Modifier l\\'Article',"),
    ("Publier l'Article',",
     "Publier l\\'Article',"),
    ("Aperçu de l'Article',",
     "Aperçu de l\\'Article',"),
    ("l'upload direct",
     "l\\'upload direct"),
]

count = 0
for broken, fixed in fixes:
    if broken in content:
        content = content.replace(broken, fixed)
        print(f"Fixed: {broken[:60]}")
        count += 1
    else:
        print(f"NOT FOUND: {broken[:60]}")

with open('src/store/translations.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print(f"\nTotal: {count}/{len(fixes)}")
