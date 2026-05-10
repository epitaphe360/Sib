"""
Corrige les erreurs de syntaxe d'objets orphelins dans les fichiers TS/TSX.
Approche: trouver le pattern "onClick ou autre {" suivi de propriétés d'objet
sans console.log ou appel de fonction.
"""
import re
import os

def normalize(content):
    return content.replace('\r\r\n', '\n').replace('\r\n', '\n')

def find_and_fix_orphaned_objects(filepath):
    """Trouve et corrige les objets orphelins dans un fichier."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    normalized = normalize(content)
    
    # Pattern: une ligne qui finit par { (ou ?: {), suivie de propriétés, suivie de });
    # sans qu'il y ait un console.log ou appel de fonction entre le { et les propriétés
    
    # Chercher le pattern spécifique: 
    # ligne X: ...{
    # ligne X+1: (vide ou indented)
    # ligne X+2: key: value, (propriété orpheline)
    # ...
    # ligne Y: }); ou });
    
    lines = normalized.split('\n')
    changes = []
    
    i = 0
    while i < len(lines):
        line = lines[i]
        
        # Une ligne qui se termine par { (pas JSX, pas une définition d'objet const)
        if line.rstrip().endswith('{') and not line.strip().startswith('//'):
            # Chercher si les lignes suivantes sont des propriétés orphelines
            j = i + 1
            # Sauter les lignes vides
            while j < len(lines) and lines[j].strip() == '':
                j += 1
            
            if j < len(lines):
                next_line = lines[j].strip()
                
                # Vérifier si c'est une propriété orpheline (key: value)
                # Une propriété valide: `word: expr,` mais pas TypeScript type annotation dans interface
                m = re.match(r'^(\w+):\s+(.+?)(?:,\s*)?$', next_line)
                if m and ':' in next_line:
                    prop_name = m.group(1)
                    prop_val = m.group(2)
                    
                    # Exclure: interfaces TypeScript (name: Type), JSX props, const declarations
                    current_line_stripped = line.strip()
                    
                    # Chercher si c'est dans un contexte de callback/event handler
                    is_callback = (
                        'onClick={() => {' in line or
                        'onChange={() => {' in line or 
                        'onSubmit={() => {' in line or
                        '() => {' in line or
                        '=> {' in line
                    )
                    
                    # Chercher la fermeture correspondante
                    depth = 1
                    k = i + 1
                    while k < len(lines) and depth > 0:
                        ln = lines[k]
                        depth += ln.count('{') - ln.count('}')
                        k += 1
                    
                    # Vérifier si la ligne qui ferme est `});`
                    close_line = lines[k-1].strip() if k > 0 else ''
        
        i += 1
    
    return False  # Pas de changements

# Chercher par grep les fichiers qui ont ce pattern
import subprocess

# Trouver tous les fichiers TS/TSX contenant la propriété errorsCount ou patterns similaires
print("Recherche des fichiers avec objets orphelins...")
for root, dirs, files in os.walk('src'):
    dirs[:] = [d for d in dirs if d not in ['node_modules', '.git', 'dist']]
    for fname in files:
        if not fname.endswith(('.ts', '.tsx')):
            continue
        filepath = os.path.join(root, fname)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        normalized = normalize(content)
        lines = normalized.split('\n')
        
        # Chercher un pattern spécifique: ligne avec { suivi de prop orpheline
        # On cherche: une ligne X finissant par { (dans un contexte non-interface/non-const)
        # suivi d'une ligne avec un : mais pas de {, puis une ligne });
        for i in range(len(lines)-3):
            line = lines[i].rstrip()
            if not line.endswith('{'):
                continue
            if line.strip().startswith(('interface', 'type ', 'const ', 'let ', 'var ')):
                continue
            if '//' in lines[i]:
                continue
            
            # Trouver la prochaine ligne non-vide
            j = i + 1
            while j < len(lines) and lines[j].strip() == '':
                j += 1
            
            if j >= len(lines):
                continue
                
            next_stripped = lines[j].strip()
            
            # Pattern d'une propriété d'objet (avec valeur après :)
            m = re.match(r'^(\w+):\s+\S', next_stripped)
            if not m:
                continue
            
            # Exclure les cas TypeScript normaux
            prop = m.group(1)
            
            # La ligne avant doit être une expression (callback, condition, etc.)
            line_stripped = line.strip()
            
            # Contextes suspects: if (...) {, () => {, etc.
            if any(x in line_stripped for x in ['if (', '() => {', '=> {', 'else {']):
                # Chercher la fermeture
                close_j = j + 1
                while close_j < len(lines) and lines[close_j].strip() not in ('});', '})', '});'): 
                    close_j += 1
                    if close_j - j > 15:  # Trop loin
                        break
                
                if close_j < len(lines) and lines[close_j].strip().startswith('}'):
                    print(f"SUSPECT {filepath}:{i+1}: {line_stripped!r}")
                    print(f"  -> {next_stripped!r}")
                    print(f"  -> ...close: {lines[close_j].strip()!r}")
                    print()
