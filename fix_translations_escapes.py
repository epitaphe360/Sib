"""Fix invalid backslash escape sequences in translations.ts (replace with apostrophe)."""

with open('src/store/translations.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Each tuple: (broken, fixed)
fixes = [
    # Line 3958
    ("l\\objectif, le public cible et le contenu de l\\'événement",
     "l'objectif, le public cible et le contenu de l'événement"),
    # Line 3979
    ("Nom de l\\intervenant',",
     "Nom de l'intervenant',"),
    # Line 3983
    ("Nom de l\\entreprise',",
     "Nom de l'entreprise',"),
    # Line 3987
    ("biographie de l\\intervenant',",
     "biographie de l'intervenant',"),
    # Line 4004
    ("Demandes d\\invitation',",
     "Demandes d'invitation',"),
    # Line 4038
    ("Journal d\\Activité',",
     "Journal d'Activité',"),
    # Line 4063
    ("Approuvés Aujourd\\hui',",
     "Approuvés Aujourd'hui',"),
    # Line 4086
    ("Modifier l\\Article',",
     "Modifier l'Article',"),
    # Line 4111
    ("Publier l\\Article',",
     "Publier l'Article',"),
    # Line 4112
    ("Aperçu de l\\Article',",
     "Aperçu de l'Article',"),
    # Line 4149
    ("l\\upload direct",
     "l'upload direct"),
]

count = 0
for broken, fixed in fixes:
    if broken in content:
        content = content.replace(broken, fixed)
        print(f"Fixed: ...{broken[:50]}...")
        count += 1
    else:
        print(f"NOT FOUND: ...{broken[:50]}...")

with open('src/store/translations.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print(f"\nTotal fixes applied: {count}/{len(fixes)}")
