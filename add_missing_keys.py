content = open('src/store/translations.ts', 'r', encoding='utf-8').read()

replacements = [
    # === FR admin ===
    ("'admin.new_modules': 'Nouveaux Modules',",
     "'admin.new_modules': 'Nouveaux Modules',\n    'admin.invitations': 'Invitations',\n    'admin.invitation_letters': \"Lettres d'invitation\",\n    'admin.push_notifications': 'Notifications Push',\n    'admin.send_alerts': 'Envoyer des alertes',"),

    # === EN admin ===
    ("'admin.new_modules': 'New Modules',",
     "'admin.new_modules': 'New Modules',\n    'admin.invitations': 'Invitations',\n    'admin.invitation_letters': 'Invitation Letters',\n    'admin.push_notifications': 'Push Notifications',\n    'admin.send_alerts': 'Send Alerts',"),

    # === AR admin ===
    ("'admin.new_modules': '\u0648\u062d\u062f\u0627\u062a \u062c\u062f\u064a\u062f\u0629',",
     "'admin.new_modules': '\u0648\u062d\u062f\u0627\u062a \u062c\u062f\u064a\u062f\u0629',\n    'admin.invitations': '\u0627\u0644\u062f\u0639\u0648\u0627\u062a',\n    'admin.invitation_letters': '\u062e\u0637\u0627\u0628\u0627\u062a \u0627\u0644\u062f\u0639\u0648\u0629',\n    'admin.push_notifications': '\u0625\u0634\u0639\u0627\u0631\u0627\u062a \u0627\u0644\u062f\u0641\u0639',\n    'admin.send_alerts': '\u0625\u0631\u0633\u0627\u0644 \u062a\u0646\u0628\u064a\u0647\u0627\u062a',"),

    # === FR partenaires (insert after sponsors.annuaire_desc) ===
    ("'sponsors.annuaire_desc': 'Catalogue des partenaires et sponsors officiels',",
     "'sponsors.annuaire_desc': 'Catalogue des partenaires et sponsors officiels',\n    'partenaires.devenir': 'Devenir Partenaire',\n    'partenaires.devenir_desc': 'Opportunit\u00e9s de partenariat et sponsoring',\n    'partenaires.annuaire': 'Annuaire Partenaires',\n    'partenaires.annuaire_desc': 'Consultez nos partenaires officiels',\n    'partenaires.media_partner': 'Partenaire M\u00e9dia',\n    'partenaires.media_partner_desc': 'Rejoignez notre r\u00e9seau m\u00e9dia',"),

    # === EN partenaires ===
    ("'sponsors.annuaire_desc': 'Official partners and sponsors catalogue',",
     "'sponsors.annuaire_desc': 'Official partners and sponsors catalogue',\n    'partenaires.devenir': 'Become a Partner',\n    'partenaires.devenir_desc': 'Partnership and sponsorship opportunities',\n    'partenaires.annuaire': 'Partners Directory',\n    'partenaires.annuaire_desc': 'Browse our official partners',\n    'partenaires.media_partner': 'Media Partner',\n    'partenaires.media_partner_desc': 'Join our media network',"),

    # === AR partenaires ===
    ("'sponsors.annuaire_desc': '\u0643\u062a\u0627\u0644\u0648\u062c \u0627\u0644\u0634\u0631\u0643\u0627\u0621 \u0648\u0627\u0644\u0631\u0639\u0627\u0629 \u0627\u0644\u0631\u0633\u0645\u064a\u064a\u0646',",
     "'sponsors.annuaire_desc': '\u0643\u062a\u0627\u0644\u0648\u062c \u0627\u0644\u0634\u0631\u0643\u0627\u0621 \u0648\u0627\u0644\u0631\u0639\u0627\u0629 \u0627\u0644\u0631\u0633\u0645\u064a\u064a\u0646',\n    'partenaires.devenir': '\u0643\u0646 \u0634\u0631\u064a\u0643\u0627\u064b',\n    'partenaires.devenir_desc': '\u0641\u0631\u0635 \u0627\u0644\u0634\u0631\u0627\u0643\u0629 \u0648\u0627\u0644\u0631\u0639\u0627\u064a\u0629',\n    'partenaires.annuaire': '\u062f\u0644\u064a\u0644 \u0627\u0644\u0634\u0631\u0643\u0627\u0621',\n    'partenaires.annuaire_desc': '\u062a\u0635\u0641\u062d \u0634\u0631\u0643\u0627\u0626\u0646\u0627 \u0627\u0644\u0631\u0633\u0645\u064a\u064a\u0646',\n    'partenaires.media_partner': '\u0634\u0631\u064a\u0643 \u0625\u0639\u0644\u0627\u0645\u064a',\n    'partenaires.media_partner_desc': '\u0627\u0646\u0636\u0645 \u0625\u0644\u0649 \u0634\u0628\u0643\u062a\u0646\u0627 \u0627\u0644\u0625\u0639\u0644\u0627\u0645\u064a\u0629',"),
]

for old, new in replacements:
    if old in content:
        content = content.replace(old, new, 1)
        print(f'OK: {old[:60]}')
    else:
        print(f'MISSING: {old[:70]}')

open('src/store/translations.ts', 'w', encoding='utf-8').write(content)
print('Done')
