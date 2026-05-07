import re

REPL = '\ufffd'

# Corrections manuelles basées sur le contexte français
WORD_FIXES = [
    # Remplacements les plus courants en français
    (r'prot\ufffcger', 'protéger'),
    # Patterns: remplace U+FFFD suivi/précédé de contexte connu
]

def fix_french_ufffd(text):
    """Remplace les U+FFFD dans du texte français par les bons caractères."""
    # Approche: remplacer U+FFFD par é par défaut dans les mots français courants
    # puis traiter les cas spéciaux
    
    # On utilise une liste de mots connus corrompus → corrects
    known = {
        # PartnerTierGuard
        'prot\ufffcger': 'protéger',  # non, c'est \ufffd
        'prot\ufffdger': 'protéger',
        'sup\ufffdrieur': 'supérieur',
        'V\ufffdrifier': 'Vérifier',
        'connect\ufffd': 'connecté',
        'acc\ufffdder': 'accéder',
        'pr\ufffdservation': 'préservation',
        'acc\ufffds': 'accès',
        'Acc\ufffds': 'Accès',
        'v\ufffdrifie': 'vérifie',
        'abonnement actif n\ufffdcessaire': 'abonnement actif nécessaire',
        'n\ufffdcessaire': 'nécessaire',
        'D\ufffdsolé': 'Désolé',
        'd\ufffdsolé': 'désolé',
        'r\ufffdserv\ufffd': 'réservé',
        'Niveau minimum requis': 'Niveau minimum requis',
        'r\ufffdservés': 'réservés',
        'sp\ufffdcial': 'spécial',
        
        # PresentationPage
        'Minist\ufffdre MUAT': 'Ministère MUAT',
        'Minist\ufffdre': 'Ministère',
        'Am\ufffdnagement': 'Aménagement',
        'D\ufffdveloppement': 'Développement',
        'D\ufffdveloppement des Investissements': 'Développement des Investissements',
        'Marocaine de D\ufffdveloppement': 'Marocaine de Développement',
        'strat\ufffdgique': 'stratégique',
        'l\ufffdgislative': 'législative',
        'r\ufffdglementaire': 'réglementaire',
        'S\ufffdcurit\ufffd': 'Sécurité',
        's\ufffdcurit\ufffd': 'sécurité',
        'sp\ufffdcialement': 'spécialement',
        'sp\ufffdcialisé': 'spécialisé',
        'num\ufffdrique': 'numérique',
        'energ\ufffdtique': 'énergétique',
        'op\ufffdrationnels': 'opérationnels',
        '\ufffdcosyst\ufffdme': 'écosystème',
        '\ufffdcosyst\ufffddme': 'écosystème',
        '\ufffdnergies': 'énergies',
        '\ufffdcologie': 'écologie',
        'pr\ufffdsident': 'président',
        'Pr\ufffdsident': 'Président',
        'g\ufffdnie': 'génie',
        'G\ufffdnie': 'Génie',
        'r\ufffdnovation': 'rénovation',
        'R\ufffdnovation': 'Rénovation',
        'm\ufffdtropole': 'métropole',
        'r\ufffdgionale': 'régionale',
        'int\ufffdgration': 'intégration',
        'pr\ufffdservation': 'préservation',
        'g\ufffdn\ufffdration': 'génération',
        'conf\ufffdrence': 'conférence',
        'conf\ufffdrence': 'conférence',
        'f\ufffdvrier': 'février',
        'minist\ufffdre': 'ministère',
        'r\ufffdglementaires': 'réglementaires',
        'Energi\ufffdtique': 'Énergétique',
        'particuli\ufffdr': 'particulièr',
        'mobilit\ufffd': 'mobilité',
        'propri\ufffdtaire': 'propriétaire',
        
        # VisitorBankTransfer
        'G\ufffdn\ufffdrer': 'Générer',
        'g\ufffdnérer': 'générer',
        'r\ufffdférence': 'référence',
        'la r\ufffdf\ufffdrence': 'la référence',
        'r\ufffdférences': 'références',
        'Sauvegarder la r\ufffdférence': 'Sauvegarder la référence',
        'r\ufffdférence de votre virement': 'référence de votre virement',
        'G\ufffodn\ufffoder': 'Générer',
        'ref\ufffdrence': 'référence',
        'r\ufffdference': 'référence',
        'la r\ufffdference': 'la référence',
        'Veuillez renseigner la r\ufffdférence': 'Veuillez renseigner la référence',
        'paiement r\ufffdussi': 'paiement réussi',
        'r\ufffdussi': 'réussi',
        'D\ufffdtails': 'Détails',
        'd\ufffdtails': 'détails',
        'r\ufffdalis\ufffd': 'réalisé',
        'r\ufffdalis\ufffdé': 'réalisé',
        'montant d\ufffd': 'montant dû',
        'G\ufffodn\ufffd': 'Généré',
    }
    
    for wrong, right in known.items():
        text = text.replace(wrong, right)
    
    return text


files = [
    'src/components/guards/PartnerTierGuard.tsx',
    'src/pages/public/PresentationPage.tsx',
    'src/pages/visitor/VisitorBankTransferPage.tsx',
    'scripts/createMissingTables.ts',
]

for path in files:
    content = open(path, 'r', encoding='utf-8').read()
    original_count = content.count('\ufffd')
    
    fixed = fix_french_ufffd(content)
    remaining = fixed.count('\ufffd')
    
    open(path, 'w', encoding='utf-8').write(fixed)
    print(f'{path}: {original_count} → {remaining} U+FFFD restants')
    
    if remaining > 0:
        # Afficher les contextes restants
        for m in re.finditer(r'.{0,30}\ufffd.{0,30}', fixed):
            print(f'  RESTE: {repr(m.group())}')
