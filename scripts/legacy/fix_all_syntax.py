"""
Corrige toutes les erreurs de syntaxe connues dans les fichiers TS/TSX.
Pattern: objet littéral orphelin (console.log manquant avant l'objet).
"""

def fix_file(filepath, old, new):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    normalized = content.replace('\r\r\n', '\n').replace('\r\n', '\n')
    if old in normalized:
        updated = normalized.replace(old, new, 1)
        with open(filepath, 'w', encoding='utf-8', newline='\n') as f:
            f.write(updated)
        print(f'OK: {filepath}')
        return True
    else:
        print(f'MANQUE: {filepath} - pattern non trouvé')
        return False

fixes = [
    # authStore.ts - déjà corrigé dans ce fichier mais vérifier
    # RegisterPage.tsx - ligne 326 (déjà corrigé) 
    # RegisterPage.tsx - ligne 1328 (onClick handler)
    {
        'file': 'src/components/auth/RegisterPage.tsx',
        'old': 'onClick={() => {\n            isSubmitting,\n            currentStep,\n            errorsCount: Object.keys(errors).length,\n            errors,\n            formData: watch()\n          });',
        'new': 'onClick={() => {\n          console.log(\'Submit attempt:\', {\n            isSubmitting,\n            currentStep,\n            errorsCount: Object.keys(errors).length,\n            errors,\n            formData: watch()\n          });'
    },
]

for fix in fixes:
    fix_file(fix['file'], fix['old'], fix['new'])

# Trouver tous les patterns suspects dans src/**/*.ts src/**/*.tsx
import os
import re

print('\nRecherche de patterns orphelins dans tous les fichiers TS/TSX...')
suspect_files = []

for root, dirs, files in os.walk('src'):
    # Ignorer node_modules si présent
    dirs[:] = [d for d in dirs if d not in ['node_modules', '.git', 'dist']]
    for fname in files:
        if fname.endswith(('.ts', '.tsx')):
            filepath = os.path.join(root, fname)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            normalized = content.replace('\r\r\n', '\n').replace('\r\n', '\n')
            lines = normalized.split('\n')
            
            for i, line in enumerate(lines):
                # Pattern: ligne "{" suivie directement d'une propriété d'objet orpheline
                stripped = line.strip()
                # Une ligne "key: value," ou "key: value" (pas de fonction)
                # après une ligne qui termine par "{"
                if i > 0 and re.match(r'^(\w+):\s+.+$', stripped):
                    prev = lines[i-1].strip()
                    prev2 = lines[i-2].strip() if i > 1 else ''
                    # Si la ligne précédente ou avant est une accolade non précédée de console.log/debug
                    if prev in ('{', '') and prev2.endswith('{'):
                        # Vérifier que ce n'est pas du JSX (pas de <>)
                        if not any(c in stripped for c in ['<', '>', '/>', '?', '=']):
                            suspect_files.append((filepath, i+1, line))

if suspect_files:
    print(f'\n{len(suspect_files)} lignes suspectes trouvées:')
    for f, linenum, line in suspect_files[:20]:
        print(f'  {f}:{linenum}: {line.strip()}')
else:
    print('Aucun pattern suspect trouvé!')
