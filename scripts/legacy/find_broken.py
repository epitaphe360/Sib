import re

with open('src/store/translations.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Chercher les lignes de la forme: 'key': 'texte\', (valeur tronquée avec backslash)
broken = []
for i, line in enumerate(lines):
    # La valeur se termine par \' et une virgule — string tronquée
    if re.search(r"': '[^']*\\',", line):
        broken.append((i+1, line.rstrip()))

# Chercher les chaînes non terminées (ERROR: Unterminated string)
# Pattern: ligne avec ' non fermé normalement
print(f"Lignes avec valeur tronquée (termine par backslash-apostrophe):")
for ln, content in broken:
    print(f"  L{ln}: {content[:100]}")
print(f"\nTotal: {len(broken)}")
