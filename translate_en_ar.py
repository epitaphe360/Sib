"""
Traduit les 378 clés FR → EN et AR dans translations.ts.
Utilise un dictionnaire de traduction basé sur les valeurs françaises connues.
"""
import json
import re

# Dictionnaire FR → (EN, AR)
# Construit manuellement pour les termes UI courants de cette application
TRANSLATIONS = {
    # Networking
    "Propulsé par l'IA SIB": ("Powered by SIB AI", "مدعوم بالذكاء الاصطناعي SIB"),
    "Réseautage": ("Networking", "التواصل"),
    "Intelligent": ("Intelligent", "ذكي"),
    "L'écosystème SIB à votre service": ("The SIB ecosystem at your service", "نظام SIB في خدمتك"),
    "Conditions Générales": ("Terms & Conditions", "الشروط العامة"),
    "Confidentialité": ("Privacy", "الخصوصية"),
    "Mentions Légales": ("Legal Notice", "الإشعارات القانونية"),
    "Votre Activité": ("Your Activity", "نشاطك"),
    "Aperçu de vos interactions récentes": ("Overview of your recent interactions", "نظرة عامة على تفاعلاتك الأخيرة"),
    "Quotas Quotidiens": ("Daily Quotas", "الحصص اليومية"),
    "Matching avancé non généré": ("Advanced matching not generated", "لم يتم إنشاء المطابقة المتقدمة"),
    "Cliquez pour lancer l'analyse IA et afficher vos recommandations.": ("Click to launch AI analysis and view your recommendations.", "انقر لبدء تحليل الذكاء الاصطناعي وعرض توصياتك."),
    "Networking Score": ("Networking Score", "نقاط التواصل"),
    "Votre influence sur le salon": ("Your influence at the fair", "تأثيرك في المعرض"),
    "Points": ("Points", "النقاط"),
    "Profil complété": ("Profile completed", "الملف الشخصي مكتمل"),
    "Engagement": ("Engagement", "التفاعل"),
    "Analyse de votre profil par l'IA...": ("AI analysis of your profile...", "تحليل الذكاء الاصطناعي لملفك الشخصي..."),
    "Oups ! Quelque chose s'est mal passé": ("Oops! Something went wrong", "عذراً! حدث خطأ ما"),
    "Activez votre Réseau IA": ("Activate your AI Network", "قم بتفعيل شبكتك بالذكاء الاصطناعي"),
    "Améliorez votre matching": ("Improve your matching", "حسّن مطابقتك"),
    "Basé sur votre profil et vos intérêts": ("Based on your profile and interests", "بناءً على ملفك الشخصي واهتماماتك"),
    "Aucune description renseignée pour cette entreprise.": ("No description provided for this company.", "لا يوجد وصف لهذه الشركة."),
    "Explorateur de Réseau": ("Network Explorer", "مستكشف الشبكة"),
    "Trouvez les partenaires stratégiques parmi des milliers de profils vérifiés.": ("Find strategic partners among thousands of verified profiles.", "ابحث عن شركاء استراتيجيين من بين آلاف الملفات الموثقة."),
    "Tous les secteurs": ("All sectors", "جميع القطاعات"),
    "Bâtiment": ("Construction", "البناء"),
    "Logistique": ("Logistics", "اللوجستيك"),
    "Transport": ("Transport", "النقل"),
    "Technologie": ("Technology", "التكنولوجيا"),
    "Finance": ("Finance", "المالية"),
    "Toutes entreprises": ("All companies", "جميع الشركات"),
    "Exposant": ("Exhibitor", "عارض"),
    "Partenaire": ("Partner", "شريك"),
    "Toutes régions": ("All regions", "جميع المناطق"),
    "Europe": ("Europe", "أوروبا"),
    "Afrique": ("Africa", "أفريقيا"),
    "Asie": ("Asia", "آسيا"),
    "Amérique": ("America", "أمريكا"),
    "Aucune description renseignée.": ("No description provided.", "لا يوجد وصف."),
    "Aucun résultat trouvé": ("No results found", "لم يتم العثور على نتائج"),
    "Mon Réseau Business": ("My Business Network", "شبكة أعمالي"),
    "Actifs": ("Active", "نشط"),
    "En attente": ("Pending", "قيد الانتظار"),
    "Favoris": ("Favorites", "المفضلة"),
    "Votre réseau est encore vide": ("Your network is still empty", "شبكتك لا تزال فارغة"),
    "Chargement...": ("Loading...", "جارٍ التحميل..."),
    "Analyse Prédictive": ("Predictive Analysis", "التحليل التنبؤي"),
    "Stratégiques": ("Strategic", "استراتيجي"),
    "Qualité des Matches": ("Match Quality", "جودة التطابق"),
    "TOP 5%": ("TOP 5%", "أعلى 5%"),
    "Croissance": ("Growth", "النمو"),
    "Activité Hebdo": ("Weekly Activity", "النشاط الأسبوعي"),
    "Synthèse de l'IA": ("AI Summary", "ملخص الذكاء الاصطناعي"),
    "Aucune recommandation pour le moment": ("No recommendations at the moment", "لا توجد توصيات حالياً"),
    "Mes Favoris": ("My Favorites", "مفضلتي"),
    "Aucun favori enregistré": ("No favorites saved", "لا توجد مفضلات محفوظة"),
    "Aucun créneau disponible pour le moment": ("No time slots available at the moment", "لا تتوفر مواعيد حالياً"),
    "Veuillez réessayer plus tard ou contacter l'exposant": ("Please try again later or contact the exhibitor", "يرجى المحاولة لاحقاً أو الاتصال بالعارض"),
    # Admin Partners
    "Actif": ("Active", "نشط"),
    "Inactif": ("Inactive", "غير نشط"),
    "Gestion des Sponsors": ("Sponsors Management", "إدارة الرعاة"),
    "Total Sponsors": ("Total Sponsors", "إجمالي الرعاة"),
    "Sponsors Officiels": ("Official Sponsors", "الرعاة الرسميون"),
    "Valeur Totale": ("Total Value", "القيمة الإجمالية"),
    "En Attente": ("Pending", "قيد الانتظار"),
    "Tous les types": ("All types", "جميع الأنواع"),
    "Organisateur": ("Organizer", "منظم"),
    "Co-Organisateur": ("Co-Organizer", "شريك منظم"),
    "Partenaire Officiel": ("Official Partner", "شريك رسمي"),
    "Sponsor": ("Sponsor", "راعٍ"),
    "Tous statuts": ("All statuses", "جميع الحالات"),
    "Nom de la société": ("Company name", "اسم الشركة"),
    "Type de partenariat": ("Partnership type", "نوع الشراكة"),
    "Niveau": ("Level", "المستوى"),
    "Montant": ("Amount", "المبلغ"),
    "Actions": ("Actions", "الإجراءات"),
    "Modifier": ("Edit", "تعديل"),
    "Supprimer": ("Delete", "حذف"),
    "Aucun sponsor trouvé": ("No sponsors found", "لم يتم العثور على رعاة"),
    "Nouveau Sponsor": ("New Sponsor", "راعٍ جديد"),
    # ExhibitorCreationSimulator
    "Simulateur de Création Exposant": ("Exhibitor Creation Simulator", "محاكي إنشاء العارض"),
    "Créer un exposant": ("Create an exhibitor", "إنشاء عارض"),
    "Nom de la société": ("Company name", "اسم الشركة"),
    "Email": ("Email", "البريد الإلكتروني"),
    "Secteur": ("Sector", "القطاع"),
    "Pays": ("Country", "البلد"),
    "Description": ("Description", "الوصف"),
    "Créer": ("Create", "إنشاء"),
    "Annuler": ("Cancel", "إلغاء"),
    "Succès": ("Success", "نجاح"),
    "Erreur": ("Error", "خطأ"),
    # UserManagement
    "Gestion des Utilisateurs": ("User Management", "إدارة المستخدمين"),
    "Rechercher un utilisateur": ("Search for a user", "البحث عن مستخدم"),
    "Tous les rôles": ("All roles", "جميع الأدوار"),
    "Admin": ("Admin", "مدير"),
    "Visiteur": ("Visitor", "زائر"),
    "Exposant": ("Exhibitor", "عارض"),
    "Nombre d'utilisateurs": ("Number of users", "عدد المستخدمين"),
    "Aucun utilisateur trouvé": ("No users found", "لم يتم العثور على مستخدمين"),
    "Voir le profil": ("View profile", "عرض الملف الشخصي"),
    "Désactiver": ("Disable", "تعطيل"),
    "Activer": ("Enable", "تفعيل"),
    "Rôle": ("Role", "الدور"),
    "Statut": ("Status", "الحالة"),
    "Date d'inscription": ("Registration date", "تاريخ التسجيل"),
    # ExhibitorDetail
    "Produits": ("Products", "المنتجات"),
    "Contacts": ("Contacts", "جهات الاتصال"),
    "À propos": ("About", "حول"),
    "Voir plus": ("See more", "عرض المزيد"),
    "Voir moins": ("See less", "عرض أقل"),
    "Localisation": ("Location", "الموقع"),
    "Site web": ("Website", "الموقع الإلكتروني"),
    "Téléphone": ("Phone", "الهاتف"),
    "Aucun produit disponible": ("No products available", "لا تتوفر منتجات"),
    "Aucun contact disponible": ("No contacts available", "لا تتوفر جهات اتصال"),
    "Prendre rendez-vous": ("Book a meeting", "حجز اجتماع"),
    "Envoyer un message": ("Send a message", "إرسال رسالة"),
    "Ajouter aux favoris": ("Add to favorites", "إضافة إلى المفضلة"),
    # MediaLibrary
    "Médiathèque": ("Media Library", "مكتبة الوسائط"),
    "Filtrer par type": ("Filter by type", "التصفية حسب النوع"),
    "Images": ("Images", "الصور"),
    "Vidéos": ("Videos", "مقاطع الفيديو"),
    "Documents": ("Documents", "المستندات"),
    "Télécharger": ("Download", "تنزيل"),
    "Aucun média trouvé": ("No media found", "لم يتم العثور على وسائط"),
    "Glissez vos fichiers ici": ("Drag your files here", "اسحب ملفاتك هنا"),
    "Parcourir": ("Browse", "تصفح"),
    "Taille": ("Size", "الحجم"),
    "Type": ("Type", "النوع"),
    "Date": ("Date", "التاريخ"),
    # VIPVisitors
    "Visiteurs VIP": ("VIP Visitors", "الزوار VIP"),
    "Paiement": ("Payment", "الدفع"),
    "Confirmé": ("Confirmed", "مؤكد"),
    "En cours": ("In progress", "جارٍ"),
    "Remboursé": ("Refunded", "مسترجع"),
    "Montant payé": ("Amount paid", "المبلغ المدفوع"),
    "Référence": ("Reference", "المرجع"),
    "Détails Transaction": ("Transaction Details", "تفاصيل المعاملة"),
    "Aucun visiteur VIP": ("No VIP visitors", "لا يوجد زوار VIP"),
    # PartnerDetail
    "Vue d'ensemble": ("Overview", "نظرة عامة"),
    "Projets": ("Projects", "المشاريع"),
    "Analyser avec l'IA": ("Analyze with AI", "التحليل بالذكاء الاصطناعي"),
    "Mettre à jour": ("Update", "تحديث"),
    "Partager": ("Share", "مشاركة"),
    "Contacter": ("Contact", "التواصل"),
    "Secteur d'activité": ("Business sector", "قطاع النشاط"),
    "Chiffre d'affaires": ("Revenue", "رقم الأعمال"),
    "Employés": ("Employees", "الموظفون"),
    "Fondé en": ("Founded in", "تأسست في"),
    # ExhibitorSubscription
    "Packs d'Exposition": ("Exhibition Packages", "حزم المعرض"),
    "Choisir ce pack": ("Choose this package", "اختر هذه الحزمة"),
    "Recommandé": ("Recommended", "موصى به"),
    "Inclus": ("Included", "مضمّن"),
    "Non inclus": ("Not included", "غير مضمّن"),
    "Surface": ("Area", "المساحة"),
    "Badges": ("Badges", "الشارات"),
    "Catalogue": ("Catalogue", "الكتالوج"),
    # PartnerProfileEdit
    "Modifier le profil": ("Edit profile", "تعديل الملف الشخصي"),
    "Enregistrer": ("Save", "حفظ"),
    "Logo": ("Logo", "الشعار"),
    "Bannière": ("Banner", "اللافتة"),
    "Réseaux sociaux": ("Social networks", "شبكات التواصل الاجتماعي"),
    "LinkedIn": ("LinkedIn", "لينكدإن"),
    "Twitter": ("Twitter", "تويتر"),
    "Facebook": ("Facebook", "فيسبوك"),
    "Instagram": ("Instagram", "إنستغرام"),
    # EventsAdmin
    "Gestion des Événements": ("Events Management", "إدارة الفعاليات"),
    "Ajouter un événement": ("Add an event", "إضافة فعالية"),
    "Publié": ("Published", "منشور"),
    "Brouillon": ("Draft", "مسودة"),
    "Archivé": ("Archived", "مؤرشف"),
    "Participants": ("Participants", "المشاركون"),
    "Lieu": ("Venue", "المكان"),
    "Organisateur": ("Organizer", "المنظم"),
    "Aucun événement": ("No events", "لا توجد فعاليات"),
    # Communs
    "Fermer": ("Close", "إغلاق"),
    "Retour": ("Back", "رجوع"),
    "Suivant": ("Next", "التالي"),
    "Précédent": ("Previous", "السابق"),
    "Confirmer": ("Confirm", "تأكيد"),
    "Chargement": ("Loading", "جارٍ التحميل"),
    "Actif": ("Active", "نشط"),
    "Inactif": ("Inactive", "غير نشط"),
    "Oui": ("Yes", "نعم"),
    "Non": ("No", "لا"),
    "Tous": ("All", "الكل"),
    "Aucun": ("None", "لا شيء"),
    "Nom": ("Name", "الاسم"),
    "Prénom": ("First name", "الاسم الأول"),
    "Entreprise": ("Company", "الشركة"),
    "Ville": ("City", "المدينة"),
    "Adresse": ("Address", "العنوان"),
    "Rechercher": ("Search", "بحث"),
    "Filtrer": ("Filter", "تصفية"),
    "Exporter": ("Export", "تصدير"),
    "Importer": ("Import", "استيراد"),
    "Rafraîchir": ("Refresh", "تحديث"),
    "Réinitialiser": ("Reset", "إعادة تعيين"),
    "Voir": ("View", "عرض"),
    "Éditer": ("Edit", "تعديل"),
    "Nouveau": ("New", "جديد"),
    "Ajouter": ("Add", "إضافة"),
    "Créer": ("Create", "إنشاء"),
    "Sauvegarder": ("Save", "حفظ"),
    "Publier": ("Publish", "نشر"),
    "Archiver": ("Archive", "أرشفة"),
    "Désactiver": ("Disable", "تعطيل"),
    "Activer": ("Activate", "تفعيل"),
    "Partager": ("Share", "مشاركة"),
    "Télécharger": ("Download", "تنزيل"),
    "Mettre à jour": ("Update", "تحديث"),
    "Enregistrer": ("Save", "حفظ"),
    "Valider": ("Validate", "التحقق"),
    "Connexion": ("Connection", "الاتصال"),
    "Déconnexion": ("Logout", "تسجيل الخروج"),
    "Inscription": ("Registration", "التسجيل"),
    "Profil": ("Profile", "الملف الشخصي"),
    "Tableau de bord": ("Dashboard", "لوحة التحكم"),
    "Paramètres": ("Settings", "الإعدادات"),
    "Notifications": ("Notifications", "الإشعارات"),
    "Messages": ("Messages", "الرسائل"),
    "Événements": ("Events", "الفعاليات"),
    "Produits": ("Products", "المنتجات"),
    "Partenaires": ("Partners", "الشركاء"),
    "Exposants": ("Exhibitors", "العارضون"),
    "Visiteurs": ("Visitors", "الزوار"),
    "Administrateurs": ("Administrators", "المديرون"),
    "Statistiques": ("Statistics", "الإحصاءات"),
    "Rapports": ("Reports", "التقارير"),
    "Configuration": ("Configuration", "الإعداد"),
    "Aide": ("Help", "مساعدة"),
    "Contact": ("Contact", "التواصل"),
    "À propos": ("About", "حول"),
    "Accueil": ("Home", "الرئيسية"),
    "Programme": ("Program", "البرنامج"),
    "Planning": ("Schedule", "الجدول الزمني"),
    "Agenda": ("Agenda", "الأجندة"),
    "Conférence": ("Conference", "المؤتمر"),
    "Atelier": ("Workshop", "ورشة عمل"),
    "Réunion": ("Meeting", "اجتماع"),
    "Rendez-vous": ("Appointment", "موعد"),
    "Badge": ("Badge", "الشارة"),
    "Stand": ("Stand", "الجناح"),
    "Hall": ("Hall", "القاعة"),
    "Pavillon": ("Pavilion", "الجناح"),
}

def fix_encoding(text):
    """Tente de corriger l'encodage mal affiché (latin1 interprété comme utf8)."""
    try:
        return text.encode('latin1').decode('utf8')
    except:
        return text

def find_translation(fr_text, translations):
    """Cherche la traduction d'un texte français."""
    # Essai direct
    if fr_text in translations:
        return translations[fr_text]
    
    # Essai après correction d'encodage
    fixed = fix_encoding(fr_text)
    if fixed in translations:
        return translations[fixed]
    
    # Essai en ignorant la casse
    for k, v in translations.items():
        if k.lower() == fr_text.lower() or k.lower() == fixed.lower():
            return v
    
    return None

def main():
    # Lire les nouvelles clés
    with open('new_translation_keys.json', 'r', encoding='utf-8') as f:
        new_keys = json.load(f)
    
    print(f"Clés à traduire: {len(new_keys)}")
    
    # Lire le fichier translations.ts
    with open('src/store/translations.ts', 'r', encoding='utf-8') as f:
        content = f.read()
    
    translated = 0
    not_translated = []
    
    for key, fr_text in new_keys.items():
        result = find_translation(fr_text, TRANSLATIONS)
        fixed_fr = fix_encoding(fr_text)
        
        if result:
            en_text, ar_text = result
            translated += 1
        else:
            # Fallback intelligent basé sur les patterns
            en_text = generate_en_fallback(fixed_fr)
            ar_text = generate_ar_fallback(fixed_fr)
            not_translated.append((key, fixed_fr))
        
        # Remplacer dans EN section: chercher la clé avec la valeur FR et la remplacer par EN
        # La clé existe déjà dans le fichier avec la valeur FR (insérée par le script précédent)
        # On doit trouver la version EN (après la section EN) et la remplacer
        
        # Échapper pour regex
        escaped_key = re.escape(key)
        escaped_fr = re.escape(fr_text)
        escaped_fixed_fr = re.escape(fixed_fr)
        en_escaped = en_text.replace("'", "\\'")
        ar_escaped = ar_text.replace("'", "\\'")
        
        # Remplacer dans la section EN (entre en: { et ar: {)
        # et dans la section AR (entre ar: { et la fin)
        # Pour l'instant, on va juste mettre à jour toutes les occurrences de cette clé
        # en cherchant le pattern dans chaque section
    
    print(f"Traduits via dictionnaire: {translated}")
    print(f"Non traduits (fallback): {len(not_translated)}")
    
    # Stratégie: reconstruire les sections EN et AR avec les bonnes valeurs
    # Trouver les positions des sections
    lines = content.split('\n')
    
    # Identifier les lignes de début de section
    section_starts = {}
    for i, line in enumerate(lines):
        stripped = line.strip()
        if stripped in ('fr: {', 'en: {', 'ar: {', 'es: {'):
            lang = stripped.split(':')[0].strip()
            section_starts[lang] = i
    
    print(f"Sections trouvées: {list(section_starts.keys())}")
    
    # Pour chaque clé dans new_keys, mettre à jour la valeur EN et AR
    updated = 0
    new_lines = lines[:]
    
    # On va parcourir et corriger les valeurs EN et AR
    current_lang = None
    for i, line in enumerate(new_lines):
        stripped = line.strip()
        # Détecter changement de section
        if stripped in ('fr: {', 'en: {', 'ar: {', 'es: {'):
            current_lang = stripped.split(':')[0].strip()
            continue
        
        if current_lang in ('en', 'ar'):
            # Chercher si cette ligne correspond à une clé new_keys
            m = re.match(r"\s*'([^']+)':\s*'(.*)',?\s*$", line)
            if m:
                key = m.group(1)
                current_val = m.group(2)
                
                if key in new_keys:
                    fr_text = new_keys[key]
                    result = find_translation(fr_text, TRANSLATIONS)
                    
                    if result:
                        en_text, ar_text = result
                        target_text = en_text if current_lang == 'en' else ar_text
                    else:
                        fixed_fr = fix_encoding(fr_text)
                        target_text = generate_en_fallback(fixed_fr) if current_lang == 'en' else generate_ar_fallback(fixed_fr)
                    
                    if target_text != current_val:
                        escaped = target_text.replace("'", "\\'")
                        # Préserver l'indentation
                        indent = len(line) - len(line.lstrip())
                        # Vérifier si la ligne a une virgule
                        suffix = ',' if line.rstrip().endswith(',') else ''
                        new_lines[i] = ' ' * indent + f"'{key}': '{escaped}'{suffix}"
                        updated += 1
    
    print(f"Lignes mises à jour: {updated}")
    
    new_content = '\n'.join(new_lines)
    with open('src/store/translations.ts', 'w', encoding='utf-8', newline='\n') as f:
        f.write(new_content)
    print("translations.ts mis à jour avec traductions EN et AR")
    
    if not_translated[:20]:
        print(f"\nPremiers textes sans traduction directe:")
        for key, text in not_translated[:20]:
            print(f"  '{text}'")

def generate_en_fallback(fr_text):
    """Génère une traduction EN de fallback."""
    # Quelques remplacements simples
    replacements = {
        'é': 'e', 'è': 'e', 'ê': 'e', 'ë': 'e',
        'à': 'a', 'â': 'a', 'ä': 'a',
        'î': 'i', 'ï': 'i',
        'ô': 'o', 'ö': 'o',
        'ù': 'u', 'û': 'u', 'ü': 'u',
        'ç': 'c', 'ñ': 'n',
        'œ': 'oe', 'æ': 'ae',
    }
    # Retourner le texte français tel quel comme fallback EN
    # (mieux que rien, et sera corrigé manuellement après)
    return fr_text

def generate_ar_fallback(fr_text):
    """Génère une traduction AR de fallback (texte FR jusqu'à traduction manuelle)."""
    return fr_text  # Placeholder

if __name__ == '__main__':
    main()
