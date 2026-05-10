filepath = r'c:\Users\samye\OneDrive\Desktop\devellopement\SIB\Sib\src\store\translations.ts'
with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

fr_salons = """    'admin.salons_title': 'Gestion des salons',
    'admin.salons_subtitle': 'Créez et gérez les éditions du salon',
    'admin.salons_new': 'Nouveau salon',
    'admin.salons_active': 'Salons actifs',
    'admin.salons_default': 'Salon par défaut',
    'admin.salons_empty': 'Aucun salon créé',
    'admin.salons_load_error': 'Erreur de chargement : ',
    'admin.salons_upload_error': 'Erreur upload : ',
    'admin.salons_name_slug_required': 'Le nom et le slug sont obligatoires.',
    'admin.salons_updated': 'Salon mis à jour.',
    'admin.salons_created': 'Salon créé.',
    'admin.salons_toggled': 'Salon mis à jour :',
    'admin.salons_activated': 'activé',
    'admin.salons_deactivated': 'désactivé',
    'admin.salons_set_default': 'défini par défaut',
    'admin.salons_unset_default': 'retiré du défaut',
    'admin.salons_delete_confirm': 'Supprimer le salon "{name}" ? Cette action est irréversible.',
    'admin.salons_deleted': 'Salon supprimé.',
    'admin.salons_modal_edit': 'Modifier le salon',
    'admin.salons_modal_create': 'Créer un salon',
    'admin.salons_location': 'Lieu',
"""

# Find all lines with 'admin.settings': 'Paramètres', that don't already have salons after them
targets_to_fix = []
for i, line in enumerate(lines):
    if "'admin.settings': 'Paramètres'," in line:
        # Check if salons already present in next 5 lines
        snippet = ''.join(lines[i:i+5])
        if 'admin.salons_title' not in snippet:
            targets_to_fix.append(i)
            print(f'Will insert after line {i+1}')

# Insert in reverse order to preserve line numbers
for idx in sorted(targets_to_fix, reverse=True):
    lines.insert(idx + 1, fr_salons)

with open(filepath, 'w', encoding='utf-8') as f:
    f.writelines(lines)

print(f'Done. Fixed {len(targets_to_fix)} blocks.')
