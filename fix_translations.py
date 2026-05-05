#!/usr/bin/env python3
"""
Fixe translations.ts :
1. Supprime les doublons dans les sections FR et EN
2. Ajoute les 57 clés manquantes dans FR et EN
"""
import re

with open('src/store/translations.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# === ÉTAPE 1: Supprimer les doublons ===
def deduplicate_section(section_text):
    """Supprime les clés dupliquées en gardant la première occurrence."""
    seen = set()
    result_lines = []
    for line in section_text.split('\n'):
        m = re.match(r"^\s*'([^']+)'\s*:", line)
        if m:
            key = m.group(1)
            if key in seen:
                # Supprimer la ligne dupliquée (et éventuellement une virgule en trop)
                continue
            seen.add(key)
        result_lines.append(line)
    return '\n'.join(result_lines)

# Trouver les bornes précises
fr_start = content.find('\n  fr: {')
en_start = content.find('\n  en: {')
file_end = len(content)

prefix = content[:fr_start]
fr_section = content[fr_start:en_start]
en_section = content[en_start:file_end]

# Dédupliquer
fr_clean = deduplicate_section(fr_section)
en_clean = deduplicate_section(en_section)

# Vérification
fr_keys_before = len(re.findall(r"'[^']+'\s*:", fr_section))
fr_keys_after = len(re.findall(r"'[^']+'\s*:", fr_clean))
en_keys_before = len(re.findall(r"'[^']+'\s*:", en_section))
en_keys_after = len(re.findall(r"'[^']+'\s*:", en_clean))

print(f"FR: {fr_keys_before} → {fr_keys_after} clés (supprimé {fr_keys_before - fr_keys_after} doublons)")
print(f"EN: {en_keys_before} → {en_keys_after} clés (supprimé {en_keys_before - en_keys_after} doublons)")

# === ÉTAPE 2: Ajouter les 57 clés manquantes ===
# Clés manquantes avec leurs traductions FR et EN
missing_keys = {
    # actions
    'actions.cancel_request': ('Annuler la demande', 'Cancel request'),
    # appointments
    'appointments.meeting_with': ('Réunion avec {{name}}', 'Meeting with {{name}}'),
    # common
    'common.contact': ('Contact', 'Contact'),
    'common.delete_confirm': ('Êtes-vous sûr de vouloir supprimer ?', 'Are you sure you want to delete?'),
    'common.published_articles': ('Articles publiés', 'Published articles'),
    'common.reading_time': ('{{minutes}} min de lecture', '{{minutes}} min read'),
    'common.requestAudit': ('Demander un audit', 'Request an audit'),
    'common.selected': ('{{count}} sélectionné(s)', '{{count}} selected'),
    # countdown
    'countdown.opening_description': ('Compte à rebours jusqu\'à l\'ouverture du salon', 'Countdown to the fair opening'),
    'countdown.share_text': ('Partagez cet événement', 'Share this event'),
    # errors
    'errors.contact_support_resolve': ('Contactez le support pour résoudre ce problème', 'Contact support to resolve this issue'),
    'errors.unknown_user_type': ('Type d\'utilisateur inconnu', 'Unknown user type'),
    # form
    'form.error.max_items': ('Maximum {{max}} éléments autorisés', 'Maximum {{max}} items allowed'),
    # home
    'home.featured_exhibitors_badge': ('Exposants en vedette', 'Featured exhibitors'),
    'home.featured_partners_badge': ('Partenaires en vedette', 'Featured partners'),
    'home.no_exhibitors_yet': ('Aucun exposant pour le moment', 'No exhibitors yet'),
    # minisite
    'minisite.preview.more_products': ('Voir plus de produits', 'View more products'),
    # networking
    'networking.error.quota_reached_limit': ('Quota de connexions atteint', 'Connection quota reached'),
    'networking.search.results_found': ('{{count}} résultat(s) trouvé(s)', '{{count}} result(s) found'),
    'networking.success.request_sent': ('Demande de connexion envoyée', 'Connection request sent'),
    # partner
    'partner.access_ai_matching': ('Accéder au matching IA', 'Access AI matching'),
    'partner.access_networking': ('Accéder au networking', 'Access networking'),
    'partner.activity.subtitle': ('Votre activité récente sur la plateforme', 'Your recent activity on the platform'),
    'partner.advanced_networking': ('Networking avancé', 'Advanced networking'),
    'partner.advanced_networking_desc': ('Élargissez votre réseau professionnel', 'Expand your professional network'),
    'partner.ai_matching': ('Matching IA', 'AI matching'),
    'partner.ai_matching_desc': ('Trouvez les meilleures opportunités grâce à l\'IA', 'Find the best opportunities with AI'),
    'partner.back_to_dashboard': ('Retour au tableau de bord', 'Back to dashboard'),
    'partner.events.subtitle': ('Événements auxquels vous participez', 'Events you are participating in'),
    'partner.no_recent_activity': ('Aucune activité récente', 'No recent activity'),
    'partner.pending_requests': ('Demandes en attente', 'Pending requests'),
    # payment
    'payment.upgradeError': ('Erreur lors de la mise à niveau', 'Upgrade error'),
    'payment.upgradeSuccess': ('Mise à niveau réussie', 'Upgrade successful'),
    # quota
    'quota.remaining': ('{{count}} quota restant', '{{count}} quota remaining'),
    'quota.remaining_plural': ('{{count}} quotas restants', '{{count}} quotas remaining'),
    # upload
    'upload.file_not_image': ('Le fichier sélectionné n\'est pas une image', 'The selected file is not an image'),
    'upload.image_too_large': ('L\'image dépasse la taille maximale autorisée', 'The image exceeds the maximum allowed size'),
    'upload.images_count': ('{{count}} image(s)', '{{count}} image(s)'),
    'upload.max_images_error': ('Maximum {{max}} images autorisées', 'Maximum {{max}} images allowed'),
    # visitor
    'visitor.access_ai_matching': ('Accéder au matching IA', 'Access AI matching'),
    'visitor.ai_matching_desc': ('Trouvez des contacts pertinents grâce à l\'IA', 'Find relevant contacts with AI'),
    'visitor.ai_matching_title': ('Matching IA', 'AI matching'),
    'visitor.awaiting_confirmation': ('En attente de confirmation', 'Awaiting confirmation'),
    'visitor.pending_requests': ('Demandes en attente', 'Pending requests'),
    'visitor.quota_reached': ('Quota atteint', 'Quota reached'),
    'visitor.sector.architecture': ('Architecture', 'Architecture'),
    'visitor.sector.construction': ('Construction', 'Construction'),
    'visitor.sector.electric': ('Électricité', 'Electrical'),
    'visitor.sector.equipment': ('Équipement', 'Equipment'),
    'visitor.sector.hvac': ('CVC / Climatisation', 'HVAC / Air conditioning'),
    'visitor.sector.interior': ('Aménagement intérieur', 'Interior design'),
    'visitor.sector.landscaping': ('Paysagisme', 'Landscaping'),
    'visitor.sector.plumbing': ('Plomberie', 'Plumbing'),
    'visitor.sector.real_estate': ('Immobilier', 'Real estate'),
    'visitor.sector.renovation': ('Rénovation', 'Renovation'),
    'visitor.sector.security': ('Sécurité', 'Security'),
    'visitor.sector.smart_home': ('Domotique', 'Smart home'),
    'visitor.sector.sustainability': ('Développement durable', 'Sustainability'),
    'visitor.sector.technology': ('Technologie', 'Technology'),
    'visitor.sector.transport': ('Transport', 'Transport'),
    'visitor.sector.utilities': ('Services publics', 'Utilities'),
    'visitor.sector.wood': ('Bois / Menuiserie', 'Wood / Carpentry'),
    'visitor.sector.other': ('Autre', 'Other'),
}

# Trouver la fin de la section FR (avant "en: {")
# Insérer les clés manquantes juste avant la fin de la section FR
fr_insert_marker = '\n  },'
en_insert_marker = '\n});'

# Construire les lignes à insérer
fr_additions = '\n'
en_additions = '\n'
for key, (fr_val, en_val) in missing_keys.items():
    # Vérifier si déjà présent
    fr_existing = re.findall(rf"'{re.escape(key)}'\s*:", fr_clean)
    en_existing = re.findall(rf"'{re.escape(key)}'\s*:", en_clean)
    
    if not fr_existing:
        fr_additions += f"    '{key}': '{fr_val}',\n"
    if not en_existing:
        en_additions += f"    '{key}': '{en_val}',\n"

print(f"\nClés FR à ajouter: {fr_additions.count('key:') if 'key:' in fr_additions else fr_additions.count(chr(39))//2}")
print(f"Clés EN à ajouter: {en_additions.count('key:') if 'key:' in en_additions else en_additions.count(chr(39))//2}")

# Insérer dans les sections
# Pour FR: trouver le dernier '},\n\n  en:' et insérer avant
insert_point_fr = fr_clean.rfind('\n  },')
if insert_point_fr != -1:
    fr_clean = fr_clean[:insert_point_fr] + fr_additions + fr_clean[insert_point_fr:]

# Pour EN: trouver la fin et insérer avant
insert_point_en = en_clean.rfind('\n});')
if insert_point_en != -1:
    en_clean = en_clean[:insert_point_en] + en_additions + en_clean[insert_point_en:]

# Reconstituer le fichier
new_content = prefix + fr_clean + en_clean

# Vérification finale
fr_keys_final = len(set(re.findall(r"'([^']+)'\s*:", fr_clean[:en_start-fr_start])))
en_keys_final = len(set(re.findall(r"'([^']+)'\s*:", en_clean)))

print(f"\n=== RÉSULTAT FINAL ===")
print(f"FR: {fr_keys_final} clés uniques")
print(f"EN: {en_keys_final} clés uniques")

with open('src/store/translations.ts', 'w', encoding='utf-8') as f:
    f.write(new_content)

print(f"\n✅ Fichier translations.ts mis à jour")
