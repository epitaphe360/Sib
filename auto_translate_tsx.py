"""
Script de traduction automatique des textes hardcodés dans les fichiers TSX.
Remplace les textes JSX hardcodés par des appels t('key', 'fallback').
"""
import re
import os
import json
from pathlib import Path

# Mapping fichier → préfixe de clé
FILE_PREFIXES = {
    'NetworkingPage.tsx': 'networking',
    'PartnersPage.tsx': 'admin_partners',
    'ExhibitorCreationSimulator.tsx': 'exhibitor_sim',
    'UserManagementPage.tsx': 'user_mgmt',
    'ExhibitorDetailPage.tsx': 'exhibitor_detail',
    'MediaLibraryPage.tsx': 'media_lib',
    'VIPVisitorsPage.tsx': 'vip_visitors',
    'PartnerDetailPage.tsx': 'partner_detail_page',
    'ExhibitorSubscriptionPage.tsx': 'exhibitor_sub',
    'PartnerProfileEditPage.tsx': 'partner_edit',
    'EventsPage.tsx': 'events_admin',
}

def make_key(prefix, text):
    """Génère une clé de traduction depuis un texte."""
    # Normaliser: minuscules, supprimer accents basiques, remplacer espaces
    key = text.strip().lower()
    # Supprimer les caractères spéciaux, garder lettres+espaces
    key = re.sub(r"[àáâãä]", "a", key)
    key = re.sub(r"[éèêë]", "e", key)
    key = re.sub(r"[îï]", "i", key)
    key = re.sub(r"[ôö]", "o", key)
    key = re.sub(r"[ùûü]", "u", key)
    key = re.sub(r"[ç]", "c", key)
    key = re.sub(r"[^a-z0-9\s_]", "", key)
    key = re.sub(r"\s+", "_", key.strip())
    key = key[:40]  # Max 40 chars
    return f"{prefix}.{key}" if key else None

def process_file(filepath, prefix, new_keys):
    """Traite un fichier TSX et remplace les textes hardcodés."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    # Pattern 1: Texte JSX simple entre balises: >Texte français<
    # Ne match que si le texte contient des lettres accentuées ou est clairement français
    # et n'est pas déjà dans un t()
    def replace_jsx_text(m):
        full = m.group(0)
        text = m.group(1).strip()
        
        # Ignorer si trop court, pas de lettre, ou déjà une expression JS
        if len(text) < 3:
            return full
        if not re.search(r'[A-ZÀ-Öa-zà-ö]', text):
            return full
        # Ignorer si contient { ou } (expressions JS dans le texte)
        if '{' in text or '}' in text:
            return full
        # Ignorer si c'est juste un nombre ou email
        if re.match(r'^[\d\s@./:%+-]+$', text):
            return full
        # Ignorer les URL
        if 'http' in text or 'www.' in text:
            return full
        
        key = make_key(prefix, text)
        if not key:
            return full
        
        # Éviter les doublons de clé
        base_key = key
        counter = 1
        while key in new_keys and new_keys[key] != text:
            key = f"{base_key}_{counter}"
            counter += 1
        
        new_keys[key] = text
        
        # Reconstruire avec t()
        # Échapper les apostrophes dans le fallback
        escaped = text.replace("'", "\\'")
        return f">{{{f't(\'{key}\', \'{escaped}\')'}}}<"
    
    # Matcher le texte entre > et < (texte JSX pur)
    # Exclure les lignes avec t( déjà présent
    lines = content.split('\n')
    new_lines = []
    changed = 0
    
    for line in lines:
        # Ne pas toucher les lignes qui ont déjà t(
        if "t('" in line or 't("' in line or 't(`' in line:
            new_lines.append(line)
            continue
        # Ne pas toucher les commentaires
        if line.strip().startswith('//') or line.strip().startswith('*'):
            new_lines.append(line)
            continue
        # Ne pas toucher les imports et les strings de traduction
        if 'import ' in line or 'translations' in line.lower():
            new_lines.append(line)
            continue
        
        # Remplacer les textes JSX entre > et <
        new_line = re.sub(
            r'>([A-ZÀ-Öa-zà-ö][^<>{}\n]{2,})<',
            replace_jsx_text,
            line
        )
        
        if new_line != line:
            changed += 1
        new_lines.append(new_line)
    
    new_content = '\n'.join(new_lines)
    
    if new_content != original:
        with open(filepath, 'w', encoding='utf-8', newline='\n') as f:
            f.write(new_content)
        print(f"  ✓ {os.path.basename(filepath)}: {changed} lignes modifiées, {len(new_keys)} clés")
    
    return changed

def main():
    src_dir = Path('src')
    new_keys = {}
    total_changed = 0
    
    # Fichiers à traiter (sans les pages légales)
    targets = [
        'src/pages/NetworkingPage.tsx',
        'src/pages/admin/PartnersPage.tsx',
        'src/components/admin/ExhibitorCreationSimulator.tsx',
        'src/pages/UserManagementPage.tsx',
        'src/pages/ExhibitorDetailPage.tsx',
        'src/components/exhibitor/ExhibitorDetailPage.tsx',
        'src/pages/media/MediaLibraryPage.tsx',
        'src/pages/admin/VIPVisitorsPage.tsx',
        'src/pages/PartnerDetailPage.tsx',
        'src/pages/ExhibitorSubscriptionPage.tsx',
        'src/pages/partners/PartnerProfileEditPage.tsx',
        'src/pages/admin/EventsPage.tsx',
    ]
    
    for target in targets:
        filepath = Path(target)
        if not filepath.exists():
            print(f"  ⚠ Fichier non trouvé: {target}")
            continue
        
        # Trouver le préfixe
        filename = filepath.name
        prefix = FILE_PREFIXES.get(filename, filepath.stem.lower().replace('page', '').strip('_'))
        
        file_keys = {}
        changed = process_file(filepath, prefix, file_keys)
        new_keys.update(file_keys)
        total_changed += changed
    
    print(f"\nTotal: {total_changed} lignes modifiées, {len(new_keys)} nouvelles clés")
    
    # Sauvegarder les clés dans un fichier JSON pour vérification
    with open('new_translation_keys.json', 'w', encoding='utf-8') as f:
        json.dump(new_keys, f, ensure_ascii=False, indent=2)
    print(f"Clés sauvegardées dans new_translation_keys.json")
    
    # Générer le bloc à insérer dans translations.ts
    generate_translation_patch(new_keys)

def generate_translation_patch(new_keys):
    """Génère les lignes à ajouter dans translations.ts pour fr, en, ar."""
    if not new_keys:
        print("Aucune nouvelle clé à ajouter.")
        return
    
    # Lire le fichier translations.ts
    with open('src/store/translations.ts', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Vérifier quelles clés existent déjà
    existing_keys = set(re.findall(r"'([^']+)':", content))
    
    truly_new = {k: v for k, v in new_keys.items() if k not in existing_keys}
    print(f"\nClés vraiment nouvelles (pas encore dans translations.ts): {len(truly_new)}")
    
    if not truly_new:
        return
    
    # Générer les lignes FR (valeurs originales françaises)
    fr_lines = []
    en_lines = []
    ar_lines = []
    
    for key, fr_text in truly_new.items():
        escaped_fr = fr_text.replace("'", "\\'")
        fr_lines.append(f"    '{key}': '{escaped_fr}',")
        en_lines.append(f"    '{key}': '{escaped_fr}',")  # EN = FR par défaut
        ar_lines.append(f"    '{key}': '{escaped_fr}',")  # AR = FR par défaut (placeholder)
    
    # Insérer dans chaque section
    # Trouver la fin de la section FR (avant 'en: {')
    sections = [
        ('fr', r"(\n  en:\s*\{)"),
        ('en', r"(\n  ar:\s*\{)"),
        ('ar', r"(\n  es:\s*\{|\n\};\s*$)"),
    ]
    
    new_content = content
    for lang, end_pattern in sections:
        lines_to_add = fr_lines if lang == 'fr' else (en_lines if lang == 'en' else ar_lines)
        insert_text = '\n' + '\n'.join(lines_to_add)
        new_content = re.sub(end_pattern, insert_text + r'\1', new_content, count=1)
    
    with open('src/store/translations.ts', 'w', encoding='utf-8', newline='\n') as f:
        f.write(new_content)
    
    print(f"translations.ts mis à jour avec {len(truly_new)} nouvelles clés (FR/EN/AR)")

if __name__ == '__main__':
    main()
