#!/usr/bin/env python3
import re

with open('src/store/translations.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Chercher: en: { ... } suivi de ); ou },
# Note: On cherche le pattern "en: {" jusqu'à la fin du fichier
en_start = content.find("en: {")
if en_start == -1:
    print("EN section not found")
else:
    # Le reste du fichier est la section EN
    en_content = content[en_start + 5:]  # Skip "en: {"
    
    # Compter les clés
    en_keys = len(re.findall(r"'[^']+'\s*:", en_content))
    print(f"Anglais (EN): {en_keys} clés trouvées")
    
    # Compter les clés dans FR
fr_start = content.find("fr: {")
en_start = content.find("en: {")

if fr_start != -1 and en_start != -1:
    fr_content = content[fr_start + 5:en_start]  # Entre fr: { et en: {
    fr_keys = len(re.findall(r"'[^']+'\s*:", fr_content))
    print(f"Français (FR): {fr_keys} clés trouvées")
    
    en_keys = len(re.findall(r"'[^']+'\s*:", en_content))
    print(f"Anglais (EN): {en_keys} clés trouvées")
    
    pct = round(en_keys / fr_keys * 100, 1) if fr_keys > 0 else 0
    print(f"\n📊 COUVERTURE:")
    print(f"FR (Français): {fr_keys} clés (100%)")
    print(f"EN (Anglais):  {en_keys} clés ({pct}%)")
    print(f"AR (Arabe):    0 clés (0%) ❌")
    print(f"ES (Espagnol): 0 clés (0%) ❌")
    
    # Chercher si ar: ou es: existent
    if "ar: {" in content:
        print("\n⚠️ Sections AR/ES existent mais ne sont pas traités")
    else:
        print(f"\n⚠️ Sections AR et ES NON DÉFINIES dans translations.ts")
