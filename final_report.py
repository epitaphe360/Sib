#!/usr/bin/env python3
"""Rapport final de couverture des traductions."""
import re

with open('src/store/translations.ts', 'r', encoding='utf-8') as f:
    content = f.read()

def extract_section(content, lang):
    start = content.find(f'\n  {lang}: ' + '{')
    if start < 0:
        return ""
    # Trouver la prochaine section (autre langue)
    candidates = []
    for l in ['fr','en','ar','es']:
        if l != lang:
            pos = content.find(f'\n  {l}: ' + '{')
            if pos > start:
                candidates.append(pos)
    end = min(candidates) if candidates else len(content)
    return content[start:end]

fr_section = extract_section(content, 'fr')
en_section = extract_section(content, 'en')
ar_section = extract_section(content, 'ar')
es_section = extract_section(content, 'es')

def get_key_values(section):
    """Retourne un dict clé→valeur."""
    pairs = {}
    for m in re.finditer(r"'([^']+)'\s*:\s*'((?:[^'\\]|\\.)*)'", section):
        pairs[m.group(1)] = m.group(2)
    return pairs

fr_kv = get_key_values(fr_section)
en_kv = get_key_values(en_section)
ar_kv = get_key_values(ar_section)
es_kv = get_key_values(es_section)

def analyze_coverage(ref_kv, target_kv, lang_name):
    total = len(ref_kv)
    present = sum(1 for k in ref_kv if k in target_kv)
    # "Réellement traduit" = valeur différente du FR
    truly_translated = sum(1 for k in ref_kv if k in target_kv and target_kv[k] != ref_kv.get(k,''))
    same_as_fr = present - truly_translated
    return {
        'lang': lang_name,
        'total_keys': len(target_kv),
        'ref_coverage': f"{present}/{total}",
        'truly_translated': truly_translated,
        'same_as_fr': same_as_fr,
        'pct_present': round(present/total*100,1),
        'pct_translated': round(truly_translated/total*100,1)
    }

print("=" * 60)
print("RAPPORT FINAL DE COUVERTURE DES TRADUCTIONS")
print("=" * 60)
print(f"\nFR (référence): {len(fr_kv)} clés (100%)")
print(f"EN (Anglais):   {len(en_kv)} clés")

for lang, kv, name in [('en', en_kv, 'EN'), ('ar', ar_kv, 'AR'), ('es', es_kv, 'ES')]:
    r = analyze_coverage(fr_kv, kv, name)
    print(f"\n{name}:")
    print(f"  Clés présentes: {r['ref_coverage']} ({r['pct_present']}%)")
    print(f"  Vraiment traduites: {r['truly_translated']} ({r['pct_translated']}%)")
    print(f"  Fallback FR: {r['same_as_fr']}")

print("\n" + "=" * 60)
print("SECTIONS MANQUANTES DANS AR/ES (fallback FR actif)")
print("=" * 60)

# Grouper les clés non traduites par préfixe
ar_untranslated = {k for k in fr_kv if k in ar_kv and ar_kv[k] == fr_kv[k]}
prefixes = {}
for k in ar_untranslated:
    prefix = k.split('.')[0]
    prefixes[prefix] = prefixes.get(prefix, 0) + 1

print(f"\nAR - sections non traduites ({len(ar_untranslated)} clés):")
for prefix, count in sorted(prefixes.items(), key=lambda x: -x[1])[:15]:
    print(f"  {prefix}.*: {count} clés non traduites")

# Exemples de clés AR bien traduites
ar_translated = {k:v for k,v in ar_kv.items() if k in fr_kv and v != fr_kv[k]}
print(f"\nExemples AR traduits (premiers 10):")
for k, v in list(ar_translated.items())[:10]:
    print(f"  '{k}': '{v}'")
