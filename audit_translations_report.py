#!/usr/bin/env python3
import re

with open('src/store/translations.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Extraire les sections FR et EN
fr_match = re.search(r"fr:\s*\{([\s\S]*?)\n  },\s*en:", content)
en_match = re.search(r"en:\s*\{([\s\S]*?)\n  }\);", content)

fr_section = fr_match.group(1) if fr_match else ""
en_section = en_match.group(1) if en_match else ""

# Compter les clés
fr_keys = len(re.findall(r"'[^']+'\s*:", fr_section))
en_keys = len(re.findall(r"'[^']+'\s*:", en_section))

# Compter les clés vides
en_empty = len(re.findall(r"'[^']+'\s*:\s*'['\s]*'", en_section))
en_partial = len(re.findall(r"'[^']+'\s*:\s*'[^']*\{{\w+\}\}[^']*'", en_section))

# Analyser les pages
pages_fr = set(re.findall(r"'(pages\.[^.]+)", fr_section))
pages_en = set(re.findall(r"'(pages\.[^.]+)", en_section))

print("=== AUDIT DE TRADUCTION ===\n")
print(f"📊 COUVERTURE GLOBALE:")
print(f"Français (FR):  {fr_keys} clés (100.0%)")
print(f"Anglais (EN):   {en_keys} clés ({en_keys/fr_keys*100:.1f}%)")
print(f"Arabe (AR):     0 clés (0.0%) ❌ NON IMPLÉMENTÉ")
print(f"Espagnol (ES):  0 clés (0.0%) ❌ NON IMPLÉMENTÉ")

print(f"\n📋 QUALITÉ EN (Anglais):")
print(f"Total clés:     {en_keys}")
print(f"Clés vides:     {en_empty}")
print(f"Clés partielles: {en_partial} (contiennent interpolation)")

print(f"\n📄 PAGES COUVERTES:")
print(f"Français: {len(pages_fr)} catégories de pages")
print(f"Anglais:  {len(pages_en)} catégories de pages")
print(f"Pages FR uniquement: {pages_fr - pages_en}")
print(f"Pages EN uniquement: {pages_en - pages_fr}")

print(f"\n⚠️ LANGUES MANQUANTES:")
print(f"- Arabe (AR):   0% → À CRÉER ({fr_keys} clés)")
print(f"- Espagnol (ES):  0% → À CRÉER ({fr_keys} clés)")
print(f"Total clés manquantes: {fr_keys * 2:,}")

print(f"\n✅ LANGUES COMPLÈTES:")
print(f"- Français (FR): 100%")
print(f"- Anglais (EN):  {en_keys/fr_keys*100:.1f}%")
