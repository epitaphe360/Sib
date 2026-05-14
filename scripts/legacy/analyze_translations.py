#!/usr/bin/env python3
import re
import json

with open('src/store/translations.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Extraire chaque section de langue
sections = {}
languages = ['fr', 'en', 'ar', 'es']

for lang in languages:
    # Chercher le pattern lang: { ... },
    pattern = rf"{lang}:\s*\{{([\s\S]*?)\n  }}[,]?"
    match = re.search(pattern, content)
    if match:
        section_text = match.group(1)
        # Compter les clés (pattern: 'key':)
        keys = re.findall(r"'[^']+'\s*:", section_text)
        # Filtre aussi les traductions non vides
        filled_keys = len([k for k in keys if len(k) > 0])
        sections[lang] = {
            'total_keys': len(keys),
            'filled_keys': filled_keys
        }
        print(f"{lang.upper()}: {len(keys)} clés")

# Calculer les pourcentages
if 'fr' in sections:
    fr_count = sections['fr']['total_keys']
    print(f"\n=== POURCENTAGE DE TRADUCTION ===")
    print(f"Français (FR): {fr_count} clés (100%)")
    
    for lang in ['en', 'ar', 'es']:
        if lang in sections:
            total = sections[lang]['total_keys']
            pct = round(total / fr_count * 100, 1)
            
            # Vérifier aussi le contenu réel
            en_pattern = rf"{lang}:\s*\{{([\s\S]*?)\n  }}[,]?"
            en_match = re.search(en_pattern, content)
            if en_match:
                en_section = en_match.group(1)
                # Compter les traductions non vides
                non_empty = len(re.findall(r"'[^']+'\s*:\s*'[^']+[^']*'", en_section))
            
            print(f"{lang.upper()}: {total} clés ({pct}%)")

print(f"\n=== COUVERTURE PAR PAGE ===")
# Chercher les sections par page
page_keys = re.findall(r"'pages\.[^.]+", content)
print(f"Pages trouvées: {len(set(page_keys))}")

# Chercher les sections par composant
component_keys = re.findall(r"'(dashboard|form|modal|modal|button|input|label|header|footer)", content)
print(f"Composants trouvés: {len(set(component_keys))}")
