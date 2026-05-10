"""
Corrige tous les objets orphelins dans les fichiers TS/TSX du projet.
Pattern: une instruction se termine (;) ou une ligne finit par {
suivi de propriétés d'objet sans console.log, fermé par });

Ce script normalise d'abord les fins de ligne \\r\\r\\n → \\n.
"""
import re
import os

def normalize(content):
    return content.replace('\r\r\n', '\n').replace('\r\n', '\n')

def fix_orphaned_objects_in_file(filepath):
    """
    Cherche et corrige les objets littéraux orphelins.
    Retourne le nombre de corrections faites.
    """
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    normalized = normalize(content)
    lines = normalized.split('\n')
    fixed = 0
    
    # Nouvelle liste de lignes (modifiable)
    new_lines = list(lines)
    
    # Trouver les indices où ); apparaît tout seul sur une ligne
    # précédé de lignes qui ressemblent à des propriétés d'objet
    i = 0
    while i < len(new_lines):
        line = new_lines[i]
        stripped = line.strip()
        
        # Chercher une ligne avec `});` ou `});` seule
        if stripped in ('});', '  });', '    });') or re.match(r'^\s+\}\);$', line):
            # Remonter pour trouver le début de l'objet orphelin
            close_indent = len(line) - len(line.lstrip())
            
            # Trouver la ligne '{' correspondante en remontant
            j = i - 1
            # Sauter les lignes vides
            while j >= 0 and new_lines[j].strip() == '':
                j -= 1
            
            # Vérifier si les lignes au-dessus ressemblent à des propriétés d'objet
            # (shorthand ou key: value)
            props_end = j
            
            while j >= 0:
                ln = new_lines[j].strip()
                if ln == '':
                    j -= 1
                    continue
                # Est-ce une propriété d'objet?
                is_prop = (
                    re.match(r'^\w+,$', ln) or  # shorthand: prop,
                    re.match(r'^\w+:\s+.+,?$', ln) or  # key: value
                    re.match(r'^\w+$', ln)  # shorthand dernière (sans virgule)
                )
                if not is_prop:
                    break
                j -= 1
            
            props_start = j + 1  # Première ligne de propriété (ignorer les vides)
            # Sauter les vides au début
            while props_start <= props_end and new_lines[props_start].strip() == '':
                props_start += 1
            
            if props_start > props_end:
                i += 1
                continue
            
            # La ligne avant les propriétés
            prev_j = props_start - 1
            while prev_j >= 0 and new_lines[prev_j].strip() == '':
                prev_j -= 1
            
            if prev_j < 0:
                i += 1
                continue
            
            prev_line = new_lines[prev_j]
            prev_stripped = prev_line.strip()
            
            # Est-ce que la ligne précédente se termine par { ou ; ?
            # (indiquant que le console.log({ a été supprimé)
            is_orphan = (
                prev_stripped.endswith('{') or  # callback ou bloc if
                prev_stripped.endswith(';') or  # fin d'instruction
                prev_stripped.endswith(')')     # fin d'appel de fonction
            )
            
            if not is_orphan:
                i += 1
                continue
            
            # Vérifier que ce n'est pas déjà un objet valide (après const x = {)
            if re.match(r'^(const|let|var|return)\s+', prev_stripped):
                i += 1
                continue
            
            # Calculer l'indentation de l'objet
            first_prop_line = new_lines[props_start]
            obj_indent = len(first_prop_line) - len(first_prop_line.lstrip())
            console_indent = ' ' * max(0, obj_indent - 2)
            prop_indent = ' ' * obj_indent
            
            # Insérer console.log('debug:', { avant les propriétés
            # et corriger la fermeture });
            
            # Construire la ligne console.log
            console_line = f"{console_indent}console.log('debug:', {{"
            
            # Trouver la ligne de fermeture originale (avec ses espaces)
            close_line = new_lines[i]
            close_parts = re.match(r'^(\s*)\}\);(.*)$', close_line)
            if not close_parts:
                i += 1
                continue
            
            new_close = f"{console_indent}}}));"
            
            # Insérer la ligne console.log avant props_start
            # Mais d'abord, insérer APRÈS la ligne précédente (prev_j) si elle finit par {
            # ou AVANT props_start si elle finit par ; ou )
            
            # Trouver le premier indice réel de propriété (sans blancs)
            insert_at = props_start
            
            # Supprimer les lignes vides avant les propriétés  
            # Insérer la ligne console.log
            new_lines.insert(insert_at, console_line)
            # Décaler i car on a inséré une ligne avant i
            i += 1
            
            # Corriger la ligne de fermeture (maintenant à i+1 car on a inséré)
            # La fermeture est à la position i (après l'insertion)
            new_lines[i] = f"{console_indent}}});"
            
            fixed += 1
            print(f"  Ligne {i}: corrigé objet orphelin dans {filepath}")
        
        i += 1
    
    if fixed > 0:
        with open(filepath, 'w', encoding='utf-8', newline='\n') as f:
            f.write('\n'.join(new_lines))
    
    return fixed

# Traiter tous les fichiers TS/TSX
total_fixed = 0
for root, dirs, files in os.walk('src'):
    dirs[:] = [d for d in dirs if d not in ['node_modules', '.git', 'dist']]
    for fname in files:
        if not fname.endswith(('.ts', '.tsx')):
            continue
        filepath = os.path.join(root, fname)
        fixed = fix_orphaned_objects_in_file(filepath)
        if fixed > 0:
            total_fixed += fixed
            print(f"Corrigé {fixed} objet(s) dans: {filepath}")

print(f"\nTotal: {total_fixed} corrections")
