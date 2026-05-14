#!/usr/bin/env python3
"""
Analyse le taux de traduction réel du projet SIB.
1. Compte les clés FR/EN/AR dans translations.ts
2. Scanne les .tsx pour les chaînes françaises encore hardcodées
"""

import os
import re
from pathlib import Path

ROOT = Path(r"c:\Users\samye\OneDrive\Desktop\devellopement\SIB\Sib\src")
TRANS_FILE = ROOT / "store" / "translations.ts"

# -------------------------------------------------------------------
# 1. Compter les clés dans translations.ts
# -------------------------------------------------------------------
with open(TRANS_FILE, "r", encoding="utf-8") as f:
    content = f.read()

# Trouver les sections fr:, en:, ar:
def extract_section(text, lang):
    # cherche `fr: {` ou `en: {` ou `ar: {` et extrait le bloc
    pattern = rf"\b{lang}:\s*\{{"
    m = re.search(pattern, text)
    if not m:
        return ""
    start = m.end()
    depth = 1
    i = start
    while i < len(text) and depth > 0:
        if text[i] == '{':
            depth += 1
        elif text[i] == '}':
            depth -= 1
        i += 1
    return text[start:i-1]

fr_section = extract_section(content, "fr")
en_section = extract_section(content, "en")
ar_section = extract_section(content, "ar")

def count_keys(section):
    # Compte les lignes du style  'namespace.key': 'valeur'
    return len(re.findall(r"'[\w.]+'\s*:", section))

fr_keys = count_keys(fr_section)
en_keys = count_keys(en_section)
ar_keys = count_keys(ar_section)

print("=" * 60)
print("TRANSLATIONS.TS — Clés par langue")
print("=" * 60)
print(f"  FR : {fr_keys} clés")
print(f"  EN : {en_keys} clés")
print(f"  AR : {ar_keys} clés")

# Vérifier les clés manquantes EN et AR vs FR
fr_keys_set = set(re.findall(r"'([\w.]+)'\s*:", fr_section))
en_keys_set = set(re.findall(r"'([\w.]+)'\s*:", en_section))
ar_keys_set = set(re.findall(r"'([\w.]+)'\s*:", ar_section))

missing_en = fr_keys_set - en_keys_set
missing_ar = fr_keys_set - ar_keys_set

print(f"\n  Clés EN manquantes vs FR : {len(missing_en)}")
if missing_en:
    for k in sorted(missing_en)[:20]:
        print(f"    ⚠ {k}")
    if len(missing_en) > 20:
        print(f"    ... et {len(missing_en)-20} autres")

print(f"\n  Clés AR manquantes vs FR : {len(missing_ar)}")
if missing_ar:
    for k in sorted(missing_ar)[:20]:
        print(f"    ⚠ {k}")
    if len(missing_ar) > 20:
        print(f"    ... et {len(missing_ar)-20} autres")

# -------------------------------------------------------------------
# 2. Scanner les .tsx pour chaînes françaises hardcodées
# -------------------------------------------------------------------
print("\n" + "=" * 60)
print("FICHIERS TSX — Chaînes françaises encore hardcodées")
print("=" * 60)

# Patterns qui indiquent du texte français hardcodé en JSX
# On cherche des chaînes entre guillemets ou en JSX qui contiennent
# des mots français courants avec accents ou des patterns typiques
FRENCH_PATTERNS = [
    # Chaînes JSX texte direct (entre > et <, ou dans des attributs)
    # Des mots français caractéristiques
    r'(?<![/\*])\b(Bienvenue|Connexion|Inscription|Recherche|Paramètres|Profil|Accueil|Retour|Suivant|Précédent|Annuler|Confirmer|Enregistrer|Supprimer|Modifier|Ajouter|Créer|Valider|Fermer|Ouvrir|Afficher|Masquer|Chargement|Erreur|Succès|Attention|Information|Description|Titre|Nom|Prénom|Email|Téléphone|Adresse|Pays|Ville|Date|Heure|Heure|Type|Statut|Catégorie|Secteur|Thème|Niveau|Score|Quota|Badge|Accès|Compte|Mot de passe|Déconnexion)\b',
    # Attributs placeholder, title, label avec du français
    r'placeholder=["\'`][^"\'`]*[àâäéèêëîïôùûüÿç][^"\'`]*["\'`]',
    r'title=["\'`][^"\'`]*[àâäéèêëîïôùûüÿç][^"\'`]*["\'`]',
    r'label=["\'`][^"\'`]*[àâäéèêëîïôùûüÿç][^"\'`]*["\'`]',
    # Texte JSX direct avec accents (entre > et </)
    r'>\s*[A-ZÀÂÄÉÈÊËÎÏÔÙÛÜŸÇ][^<{]*[àâäéèêëîïôùûüÿç][^<{]*\s*<',
    # Strings avec accents dans du JSX
    r'["\'`][^"\'`\n]{3,}[àâäéèêëîïôùûüÿç][^"\'`\n]{0,60}["\'`]',
]

# Fichiers à ignorer (déjà traités ou non-UI)
IGNORE_DIRS = {
    "store", "__tests__", "test", ".venv", "node_modules",
    "migrations", "scripts", "data"
}
IGNORE_FILES = {
    "translations.ts",
    "i18n.ts",
}

# Extensions à scanner
SCAN_EXTS = {".tsx", ".ts"}

# Regex pour détecter les accents français (hors commentaires et t('...'))
# On détecte les chaînes avec caractères accentués français qui ne sont PAS
# déjà dans un appel t('...') ou getCms(...)
ACCENT_PATTERN = re.compile(r'[àâäéèêëîïôùûüÿçÀÂÄÉÈÊËÎÏÔÙÛÜŸÇ]')
T_CALL_PATTERN = re.compile(r"\bt\s*\(['\"][\w.]+['\"]")
GETCS_PATTERN = re.compile(r"getCms\s*\(")
COMMENT_PATTERN = re.compile(r'^\s*(//|/\*|\*)')
IMPORT_PATTERN = re.compile(r'^import ')
CONSOLE_PATTERN = re.compile(r'console\.')

results = {}  # file -> list of (lineno, line)

for tsx_file in ROOT.rglob("*.tsx"):
    # Ignorer certains dossiers
    parts = set(tsx_file.parts)
    if parts & IGNORE_DIRS:
        continue
    if tsx_file.name in IGNORE_FILES:
        continue
    
    try:
        lines = tsx_file.read_text(encoding="utf-8", errors="replace").splitlines()
    except Exception:
        continue
    
    hardcoded_lines = []
    for i, line in enumerate(lines, 1):
        # Ignorer commentaires, imports, console.log
        stripped = line.strip()
        if COMMENT_PATTERN.match(stripped):
            continue
        if IMPORT_PATTERN.match(stripped):
            continue
        if CONSOLE_PATTERN.search(line):
            continue
        # Ignorer les lignes qui n'ont que des appels t() ou getCms()
        if not ACCENT_PATTERN.search(line):
            continue
        # Ignorer si c'est dans un t('...') existant
        if T_CALL_PATTERN.search(line):
            # La ligne CONTIENT un t() — ok si tous les accents sont dans t()
            # On simplifie : on la marque si elle a des accents EN DEHORS de t()
            # Supprimer les t('...') et getCms(...) pour voir ce qui reste
            cleaned = re.sub(r"\bt\s*\(['\"][\w.]+['\"][^)]*\)", "", line)
            cleaned = re.sub(r"getCms\s*\([^)]+\)", "", cleaned)
            if not ACCENT_PATTERN.search(cleaned):
                continue
        # Ignorer les lignes de données (arrays de données métier)
        if re.search(r"availableObjectives|availableCompetencies|availableThematics|availableSectors|availableCountries", line):
            continue
        # Ignorer les lignes dans les fichiers de données/constantes
        if "const available" in line.lower() or "value:" in line.lower():
            continue
            
        hardcoded_lines.append((i, stripped[:120]))
    
    if hardcoded_lines:
        rel = str(tsx_file.relative_to(ROOT))
        results[rel] = hardcoded_lines

# Afficher les résultats groupés par fichier
total_hardcoded = sum(len(v) for v in results.values())
print(f"\n  Fichiers avec chaînes hardcodées : {len(results)}")
print(f"  Lignes hardcodées estimées      : {total_hardcoded}")

print("\n  Par fichier (top 30 par nombre de lignes) :")
sorted_results = sorted(results.items(), key=lambda x: len(x[1]), reverse=True)
for fpath, lines in sorted_results[:30]:
    print(f"\n  📄 {fpath} ({len(lines)} lignes)")
    for lineno, text in lines[:5]:
        print(f"      L{lineno}: {text}")
    if len(lines) > 5:
        print(f"      ... +{len(lines)-5} autres lignes")

# -------------------------------------------------------------------
# 3. Calculer le pourcentage global
# -------------------------------------------------------------------
print("\n" + "=" * 60)
print("RÉCAPITULATIF — Taux de traduction")
print("=" * 60)

# Compter les fichiers tsx total
all_tsx = [f for f in ROOT.rglob("*.tsx") if not any(d in f.parts for d in IGNORE_DIRS)]
total_tsx = len(all_tsx)
translated_tsx = total_tsx - len(results)

# Compter les utilisations de t() dans tout le code
t_usage_count = 0
for tsx_file in ROOT.rglob("*.tsx"):
    if any(d in tsx_file.parts for d in IGNORE_DIRS):
        continue
    try:
        text = tsx_file.read_text(encoding="utf-8", errors="replace")
        t_usage_count += len(T_CALL_PATTERN.findall(text))
    except Exception:
        pass

print(f"\n  Fichiers TSX total            : {total_tsx}")
print(f"  Fichiers sans hardcode        : {translated_tsx} ({100*translated_tsx//total_tsx}%)")
print(f"  Fichiers avec hardcode restant: {len(results)} ({100*len(results)//total_tsx}%)")
print(f"\n  Appels t() dans tout le code  : {t_usage_count}")
print(f"\n  Clés disponibles :")
print(f"    FR : {fr_keys} clés (référence)")
pct_en = 100 * en_keys // fr_keys if fr_keys else 0
pct_ar = 100 * ar_keys // fr_keys if fr_keys else 0
print(f"    EN : {en_keys} clés ({pct_en}% vs FR)")
print(f"    AR : {ar_keys} clés ({pct_ar}% vs FR)")
print()
