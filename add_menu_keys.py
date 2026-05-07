#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Ajoute les clés de traduction pour les nouveaux éléments de menu."""

import re

with open('src/store/translations.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# ═══════════════════════════════════════════════
# FR — après salon.telechargements_desc
# ═══════════════════════════════════════════════
fr_salon_anchor = "  'salon.telechargements_desc': 'Documents, brochures et ressources',"
fr_salon_new = """  'salon.telechargements_desc': 'Documents, brochures et ressources',
  'salon.actualites': 'Actualités',
  'salon.actualites_desc': 'Dernières nouvelles et annonces du salon',
  'salon.pavilions': 'Pavillons',
  'salon.pavilions_desc': 'Découvrez les pavillons et halls d\\'exposition',
  'salon.plan': 'Plan du Salon',
  'salon.plan_desc': 'Carte interactive et accès aux halls',"""

content = content.replace(fr_salon_anchor, fr_salon_new, 1)

# FR — après visiter.vip_desc
fr_visiter_anchor = "  'visiter.vip_desc': 'Accès privilégié et avantages premium',"
fr_visiter_new = """  'visiter.vip_desc': 'Accès privilégié et avantages premium',
  'visiter.hebergement': 'Hébergement',
  'visiter.hebergement_desc': 'Hôtels partenaires et solutions d\\'hébergement',
  'visiter.speakers': 'Conférenciers',
  'visiter.speakers_desc': 'Experts et intervenants du programme',
  'visiter.plan': 'Plan du Salon',
  'visiter.plan_desc': 'Carte interactive et plan d\\'accès',"""

content = content.replace(fr_visiter_anchor, fr_visiter_new, 1)

# FR — après exposer.annuaire_desc
fr_exposer_anchor = "  'exposer.annuaire_desc': 'Catalogue complet des exposants SIB',"
fr_exposer_new = """  'exposer.annuaire_desc': 'Catalogue complet des exposants SIB',
  'exposer.location': 'Location de Matériel',
  'exposer.location_desc': 'Mobilier, équipements et accessoires pour votre stand',"""

content = content.replace(fr_exposer_anchor, fr_exposer_new, 1)

# ═══════════════════════════════════════════════
# EN — après salon.telechargements_desc
# ═══════════════════════════════════════════════
en_salon_anchor = "  'salon.telechargements_desc': 'Documents, brochures and resources',"
en_salon_new = """  'salon.telechargements_desc': 'Documents, brochures and resources',
  'salon.actualites': 'News',
  'salon.actualites_desc': 'Latest news and announcements from the show',
  'salon.pavilions': 'Pavilions',
  'salon.pavilions_desc': 'Discover the exhibition pavilions and halls',
  'salon.plan': 'Venue Map',
  'salon.plan_desc': 'Interactive map and access to halls',"""

content = content.replace(en_salon_anchor, en_salon_new, 1)

# EN — après visiter.vip_desc
en_visiter_anchor = "  'visiter.vip_desc': 'Privileged access and premium benefits',"
en_visiter_new = """  'visiter.vip_desc': 'Privileged access and premium benefits',
  'visiter.hebergement': 'Accommodation',
  'visiter.hebergement_desc': 'Partner hotels and accommodation solutions',
  'visiter.speakers': 'Speakers',
  'visiter.speakers_desc': 'Experts and speakers of the programme',
  'visiter.plan': 'Venue Map',
  'visiter.plan_desc': 'Interactive map and access plan',"""

content = content.replace(en_visiter_anchor, en_visiter_new, 1)

# EN — après exposer.annuaire_desc
en_exposer_anchor = "  'exposer.annuaire_desc': 'Complete SIB exhibitor catalogue',"
en_exposer_new = """  'exposer.annuaire_desc': 'Complete SIB exhibitor catalogue',
  'exposer.location': 'Equipment Rental',
  'exposer.location_desc': 'Furniture, equipment and accessories for your stand',"""

content = content.replace(en_exposer_anchor, en_exposer_new, 1)

# ═══════════════════════════════════════════════
# AR — après salon.telechargements_desc
# ═══════════════════════════════════════════════
ar_salon_anchor = "  'salon.telechargements_desc': 'الوثائق والكتيبات والموارد',"
ar_salon_new = """  'salon.telechargements_desc': 'الوثائق والكتيبات والموارد',
  'salon.actualites': 'الأخبار',
  'salon.actualites_desc': 'آخر الأخبار والإعلانات من المعرض',
  'salon.pavilions': 'الأجنحة',
  'salon.pavilions_desc': 'اكتشف أجنحة وقاعات المعرض',
  'salon.plan': 'خريطة المعرض',
  'salon.plan_desc': 'خريطة تفاعلية والوصول إلى القاعات',"""

content = content.replace(ar_salon_anchor, ar_salon_new, 1)

# AR — après visiter.vip_desc
ar_visiter_anchor = "  'visiter.vip_desc': 'وصول متميز ومزايا حصرية',"
ar_visiter_new = """  'visiter.vip_desc': 'وصول متميز ومزايا حصرية',
  'visiter.hebergement': 'الإقامة',
  'visiter.hebergement_desc': 'فنادق شريكة وحلول الإقامة',
  'visiter.speakers': 'المتحدثون',
  'visiter.speakers_desc': 'الخبراء والمتحدثون في البرنامج',
  'visiter.plan': 'خريطة المعرض',
  'visiter.plan_desc': 'خريطة تفاعلية وخطة الوصول',"""

content = content.replace(ar_visiter_anchor, ar_visiter_new, 1)

# AR — après exposer.annuaire_desc
ar_exposer_anchor = "  'exposer.annuaire_desc': 'الكتالوج الكامل لعارضي SIB',"
ar_exposer_new = """  'exposer.annuaire_desc': 'الكتالوج الكامل لعارضي SIB',
  'exposer.location': 'تأجير المعدات',
  'exposer.location_desc': 'أثاث ومعدات وملحقات لجناحك',"""

content = content.replace(ar_exposer_anchor, ar_exposer_new, 1)

with open('src/store/translations.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Clés de traduction ajoutées avec succès !")

# Vérification
checks = [
    "salon.actualites", "salon.pavilions", "salon.plan",
    "visiter.hebergement", "visiter.speakers", "visiter.plan",
    "exposer.location",
]
for key in checks:
    count = content.count(f"'{key}'")
    print(f"  '{key}' → {count} occurrences (attendu: 3)")
