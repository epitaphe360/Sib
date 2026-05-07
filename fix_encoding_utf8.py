path = 'src/pages/exhibitor/ExhibitorScansPage.tsx'
raw = open(path, 'rb').read()

# Décoder en cp1252 (Windows-1252) puis réécrire en UTF-8
text = raw.decode('cp1252')
open(path, 'w', encoding='utf-8').write(text)

# Vérification : aucun byte non-ASCII ne devrait causer de problème maintenant
import re
raw2 = open(path, 'rb').read()
# Vérifier que le fichier est maintenant valide UTF-8
try:
    raw2.decode('utf-8')
    print('OK: fichier valide UTF-8')
except UnicodeDecodeError as e:
    print(f'ERREUR: {e}')

# Vérifier les mots clés corrigés
content = open(path, 'r', encoding='utf-8').read()
for word in ['Société', 'Téléphone', 'Scanné par', 'En-tête', 'Récupérer', 'Propriétaire', 'décroissant']:
    if word in content:
        print(f'  OK: "{word}" présent')
    else:
        print(f'  MANQUANT: "{word}"')
