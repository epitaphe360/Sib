"""
Corrige ExhibitorManagementPage.tsx et d'autres fichiers avec vrais objets orphelins.
Ces fichiers n'ont PAS été traités par fix_orphans_all.py (script crashé avant).
"""
import re
import os

def normalize(content):
    return content.replace('\r\r\n', '\n').replace('\r\n', '\n')

def fix_orphan_in_file(filepath, context_before, orphan_first_line, console_text):
    """
    Insère console_text avant orphan_first_line dans filepath.
    La fermeture }); devient }); (inchangée car elle fermait déjà le console.log)
    Mais on doit la changer en }); si elle était }); avec un ) en trop... 
    En fait, si le code original était:
    
    some_code;
    [MANQUE: console.log('...', {]
    orphan_prop1,
    orphan_prop2: val
    });  ← ferme le console.log et son {
    
    Alors on doit juste insérer la ligne console.log.
    """
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    normalized = normalize(content)
    
    # Trouver le début de l'objet orphelin
    idx = normalized.find(orphan_first_line)
    if idx < 0:
        print(f'MANQUE: {orphan_first_line!r} dans {filepath}')
        return False
    
    # Insérer la ligne console.log avant
    indent = len(orphan_first_line) - len(orphan_first_line.lstrip())
    console_line = ' ' * max(0, indent - 2) + console_text + '\n'
    
    updated = normalized[:idx] + console_line + normalized[idx:]
    
    with open(filepath, 'w', encoding='utf-8', newline='\n') as f:
        f.write(updated)
    print(f'OK: {filepath}')
    return True

# Trouver tous les vrais orphelins restants (non traités par fix_orphans_all.py)
# Stratégie: chercher les lignes qui sont des propriétés d'objet mais dont
# la ligne précédente se termine par ";" (fin d'instruction), pas par "{"

def find_true_orphans(filepath):
    """Trouve les vrais objets orphelins (après ; pas après {)."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    normalized = normalize(content)
    lines = normalized.split('\n')
    
    orphans = []
    for i in range(1, len(lines)):
        line = lines[i]
        stripped = line.strip()
        
        # Propriété d'objet: key: value, (pas de = avant :)
        if not re.match(r'^\w+:\s+\S', stripped):
            continue
        if stripped.startswith(('type ', 'interface ', 'const ', 'let ', 'var ')):
            continue
        if any(c in stripped for c in ['<', '>', '=>', '==', '!=']):
            continue
        
        # La ligne précédente finit par ; ?
        prev_j = i - 1
        while prev_j >= 0 and lines[prev_j].strip() == '':
            prev_j -= 1
        
        if prev_j < 0:
            continue
        prev = lines[prev_j].strip()
        
        if prev.endswith(';'):
            # Vérifier que c'est bien un objet orphelin (les lignes suivantes aussi)
            # et qu'il y a bien un }); plus bas
            j = i + 1
            while j < len(lines) and (lines[j].strip() == '' or re.match(r'^\w+', lines[j].strip())):
                j += 1
            if j < len(lines) and re.match(r'^\s*\}\);', lines[j]):
                orphans.append((i, line, lines[prev_j]))
    
    return orphans

# Chercher dans tous les fichiers
print("Recherche des vrais objets orphelins restants...")
for root, dirs, files in os.walk('src'):
    dirs[:] = [d for d in dirs if d not in ['node_modules', '.git', 'dist']]
    for fname in files:
        if not fname.endswith(('.ts', '.tsx')):
            continue
        filepath = os.path.join(root, fname)
        try:
            orphans = find_true_orphans(filepath)
            if orphans:
                print(f"\n{filepath}:")
                for i, line, prev in orphans:
                    print(f"  Ligne {i+1}: {line.strip()!r}")
                    print(f"  Précédent: {prev!r}")
        except Exception as e:
            pass  # Ignorer les erreurs d'encodage

# Correction spécifique de ExhibitorManagementPage.tsx
print("\n--- Corrections spécifiques ---")
fix_orphan_in_file(
    'src/pages/admin/ExhibitorManagementPage.tsx',
    'const { data: { session } }',
    '          hasSession: !!session,',
    "console.log('Session info:', {"
)
