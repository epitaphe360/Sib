"""
Trouve et corrige toutes les erreurs de type "objet littéral orphelin"
(console.log supprimé mais l'objet entre {} est resté).
Pattern: ligne avec { suivi de lignes key: value sans console.log(
"""
import re
import os
import glob

def find_dangling_objects(filepath):
    """Cherche les patterns d'objets orphelins dans un fichier."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Normaliser les fins de ligne pour l'analyse
    normalized = content.replace('\r\r\n', '\n').replace('\r\n', '\n')
    
    issues = []
    lines = normalized.split('\n')
    
    i = 0
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()
        
        # Pattern: ligne qui se termine par "); sans être précédée d'une ouverture propre
        # Plus précisément: chercher des suites comme:
        # if (...) {
        #   key: value,   <-- orphelin
        #   key2: value
        # });
        
        # Chercher des lignes "key: value" qui sont précédées par une ligne { sans appel de fonction
        if stripped and not stripped.startswith('//') and not stripped.startswith('*'):
            # Pattern: propriété d'objet orpheline (ex: "  key: value,")
            m = re.match(r'\s+(\w+):\s+.+,?\s*$', line)
            if m and i > 0:
                prev = lines[i-1].strip() if i > 0 else ''
                prev_prev = lines[i-2].strip() if i > 1 else ''
                
                # Si la ligne précédente est une accolade { non précédée d'une fonction
                if prev == '{' or prev.endswith(') {') or prev.endswith('?.profile) {'):
                    # Vérifier si ce n'est pas du JSX ou un objet normal
                    # C'est suspect si la ligne précédente n'est pas une déclaration de fonction
                    pass  # Trop de faux positifs
        i += 1
    
    return issues

def fix_file_known_pattern(filepath, old_pattern, new_pattern):
    """Corrige un pattern connu dans un fichier."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    normalized = content.replace('\r\r\n', '\n').replace('\r\n', '\n')
    if old_pattern in normalized:
        updated = normalized.replace(old_pattern, new_pattern, 1)
        with open(filepath, 'w', encoding='utf-8', newline='\n') as f:
            f.write(updated)
        return True
    return False

# Lancer le build pour trouver toutes les erreurs
import subprocess
result = subprocess.run(
    ['npx', 'vite', 'build'],
    capture_output=True, text=True, cwd='.',
    shell=True
)
output = result.stdout + result.stderr
print(output[-3000:])
