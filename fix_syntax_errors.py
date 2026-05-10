"""
Corrige les erreurs de syntaxe dans les fichiers TSX/TS:
Des objets littéraux orphelins (sans console.log() ou autre fonction les entourant)
"""

fixes = [
    # ProfileMatchingPage.tsx - avec les doubles \n (issue \r\r\n)
    {
        'file': 'src/pages/ProfileMatchingPage.tsx',
        'old': 'if (currentUser?.profile) {\n\n          sectors: currentUser.profile.sectors?.length,\n\n          bio: currentUser.profile.bio?.substring(0, 50)\n\n        });',
        'new': 'if (currentUser?.profile) {\n        console.log(\'Profile synced:\', {\n          sectors: currentUser.profile.sectors?.length,\n          bio: currentUser.profile.bio?.substring(0, 50)\n        });'
    },
]

def fix_file(filepath, old, new):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    # Normaliser les fins de ligne
    normalized = content.replace('\r\r\n', '\n').replace('\r\n', '\n')
    if old in normalized:
        updated = normalized.replace(old, new, 1)
        with open(filepath, 'w', encoding='utf-8', newline='\n') as f:
            f.write(updated)
        print(f'Corrigé: {filepath}')
        return True
    else:
        # Chercher le pattern approximatif pour débug
        key = 'if (currentUser?.profile)'
        idx = normalized.find(key)
        if idx >= 0:
            ctx = normalized[idx:idx+300]
            print(f'Pattern exact non trouvé dans {filepath}')
            print(f'Contexte trouvé:\n{repr(ctx[:200])}')
        else:
            print(f'Clé de recherche non trouvée dans {filepath}')
        return False

for fix in fixes:
    fix_file(fix['file'], fix['old'], fix['new'])
