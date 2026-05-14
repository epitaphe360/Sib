"""
Deuxième passe de traduction pour les 236 textes non traduits.
Traduction FR→EN et FR→AR pour les termes spécifiques au domaine BTP/SIB.
"""
import json
import re

TRANSLATIONS_PASS2 = {
    "Sib2026@urbacom.net": ("Sib2026@urbacom.net", "Sib2026@urbacom.net"),
    "Gérez vos relations et transformez vos contacts en opportunités.": ("Manage your relationships and turn your contacts into opportunities.", "أدر علاقاتك وحوّل جهات اتصالك إلى فرص."),
    "Écosystème de Réseau": ("Network Ecosystem", "نظام الشبكة"),
    "Répartition par secteurs d'activité": ("Distribution by business sector", "التوزيع حسب قطاع النشاط"),
    "Gardez un œil sur les profils qui comptent le plus pour vous.": ("Keep an eye on the profiles that matter most to you.", "ابق على اطلاع بالملفات الأكثر أهمية بالنسبة لك."),
    "Org. Délégué": ("Delegated Org.", "منظم مفوض"),
    "Partenaire Presse": ("Press Partner", "شريك إعلامي"),
    "Tous les statuts": ("All statuses", "جميع الحالات"),
    "Organisation": ("Organization", "منظمة"),
    "Valeur Contrat": ("Contract Value", "قيمة العقد"),
    "Informations Générales": ("General Information", "معلومات عامة"),
    "Contact Principal": ("Main Contact", "جهة الاتصال الرئيسية"),
    "Contributions": ("Contributions", "المساهمات"),
    "Valeur du Contrat": ("Contract Value", "قيمة العقد"),
    "Date de Création": ("Creation Date", "تاريخ الإنشاء"),
    "Sélectionnez un secteur": ("Select a sector", "اختر قطاعاً"),
    "Industrie bâtiment": ("Construction industry", "صناعة البناء"),
    "Services BTP": ("Construction services", "خدمات البناء"),
    "Équipements": ("Equipment", "المعدات"),
    "Conseil": ("Consulting", "الاستشارات"),
    "Matériaux": ("Materials", "مواد البناء"),
    "Immobilier": ("Real estate", "العقارات"),
    "Architecture": ("Architecture", "العمارة"),
    "Ingénierie": ("Engineering", "الهندسة"),
    "Décoration": ("Decoration", "الديكور"),
    "Aménagement": ("Landscaping", "التهيئة"),
    "Environnement": ("Environment", "البيئة"),
    "Energie": ("Energy", "الطاقة"),
    "Eau": ("Water", "الماء"),
    "Infrastructure": ("Infrastructure", "البنية التحتية"),
    "Numérique": ("Digital", "الرقمي"),
    "Innovation": ("Innovation", "الابتكار"),
    "Smart Building": ("Smart Building", "المباني الذكية"),
    "Développement Durable": ("Sustainable Development", "التنمية المستدامة"),
    "Sélectionner un pays": ("Select a country", "اختر البلد"),
    "Maroc": ("Morocco", "المغرب"),
    "France": ("France", "فرنسا"),
    "Algérie": ("Algeria", "الجزائر"),
    "Tunisie": ("Tunisia", "تونس"),
    "Espagne": ("Spain", "إسبانيا"),
    "Italie": ("Italy", "إيطاليا"),
    "Allemagne": ("Germany", "ألمانيا"),
    "Belgique": ("Belgium", "بلجيكا"),
    "Suisse": ("Switzerland", "سويسرا"),
    "Émirats": ("UAE", "الإمارات"),
    "Arabie Saoudite": ("Saudi Arabia", "المملكة العربية السعودية"),
    "Sénégal": ("Senegal", "السنغال"),
    "Côte d'Ivoire": ("Ivory Coast", "ساحل العاج"),
    "Nom de l'entreprise": ("Company name", "اسم الشركة"),
    "Prénom Nom": ("First and Last Name", "الاسم الأول والأخير"),
    "Adresse email": ("Email address", "عنوان البريد الإلكتروني"),
    "Numéro de téléphone": ("Phone number", "رقم الهاتف"),
    "Mot de passe": ("Password", "كلمة المرور"),
    "Confirmer le mot de passe": ("Confirm password", "تأكيد كلمة المرور"),
    "Se connecter": ("Log in", "تسجيل الدخول"),
    "S'inscrire": ("Sign up", "إنشاء حساب"),
    "Mot de passe oublié": ("Forgot password", "نسيت كلمة المرور"),
    "Retour à la connexion": ("Back to login", "العودة إلى تسجيل الدخول"),
    "Choisir un fichier": ("Choose a file", "اختر ملفاً"),
    "Aucun fichier sélectionné": ("No file selected", "لم يتم اختيار ملف"),
    "Taille maximum": ("Maximum size", "الحجم الأقصى"),
    "Formats acceptés": ("Accepted formats", "الصيغ المقبولة"),
    "Téléverser": ("Upload", "رفع الملف"),
    "En cours de chargement": ("Uploading", "جارٍ الرفع"),
    "Uploadé avec succès": ("Uploaded successfully", "تم الرفع بنجاح"),
    "Erreur lors du téléversement": ("Upload error", "خطأ في الرفع"),
    "Copié !": ("Copied!", "تم النسخ!"),
    "Copier le lien": ("Copy link", "نسخ الرابط"),
    "Partager sur": ("Share on", "مشاركة على"),
    "Envoyer par email": ("Send by email", "إرسال عبر البريد الإلكتروني"),
    "Imprimer": ("Print", "طباعة"),
    "Générer": ("Generate", "إنشاء"),
    "Calculer": ("Calculate", "حساب"),
    "Analyser": ("Analyze", "تحليل"),
    "Résultats": ("Results", "النتائج"),
    "Score": ("Score", "النقاط"),
    "Compatibilité": ("Compatibility", "التوافق"),
    "Recommandations": ("Recommendations", "التوصيات"),
    "Aucune recommandation": ("No recommendations", "لا توجد توصيات"),
    "Voir toutes les recommandations": ("See all recommendations", "عرض جميع التوصيات"),
    "Voir moins": ("See less", "عرض أقل"),
    "Charger plus": ("Load more", "تحميل المزيد"),
    "Aucun résultat": ("No results", "لا توجد نتائج"),
    "Essayez une autre recherche": ("Try a different search", "جرب بحثاً آخر"),
    "Période": ("Period", "الفترة"),
    "Semaine": ("Week", "الأسبوع"),
    "Mois": ("Month", "الشهر"),
    "Trimestre": ("Quarter", "الربع"),
    "Année": ("Year", "السنة"),
    "Total": ("Total", "المجموع"),
    "Moyenne": ("Average", "المتوسط"),
    "Maximum": ("Maximum", "الحد الأقصى"),
    "Minimum": ("Minimum", "الحد الأدنى"),
    "Évolution": ("Evolution", "التطور"),
    "Tendance": ("Trend", "الاتجاه"),
    "Hausse": ("Increase", "ارتفاع"),
    "Baisse": ("Decrease", "انخفاض"),
    "Stable": ("Stable", "مستقر"),
    "Détails": ("Details", "التفاصيل"),
    "Informations": ("Information", "معلومات"),
    "Coordonnées": ("Contact details", "بيانات الاتصال"),
    "Emplacement": ("Location", "الموقع"),
    "Horaires": ("Hours", "أوقات العمل"),
    "Ouvert": ("Open", "مفتوح"),
    "Fermé": ("Closed", "مغلق"),
    "Disponible": ("Available", "متاح"),
    "Indisponible": ("Unavailable", "غير متاح"),
    "Complet": ("Full", "ممتلئ"),
    "Places disponibles": ("Available spots", "الأماكن المتاحة"),
    "Inscription requise": ("Registration required", "التسجيل مطلوب"),
    "Gratuit": ("Free", "مجاني"),
    "Payant": ("Paid", "مدفوع"),
    "Prix": ("Price", "السعر"),
    "Tarif": ("Rate", "التعريفة"),
    "Réduction": ("Discount", "خصم"),
    "Promotion": ("Promotion", "عرض ترويجي"),
    "Offre spéciale": ("Special offer", "عرض خاص"),
    "Pack": ("Package", "حزمة"),
    "Formule": ("Plan", "الخطة"),
    "Abonnement": ("Subscription", "الاشتراك"),
    "Essai gratuit": ("Free trial", "تجربة مجانية"),
    "Accès complet": ("Full access", "وصول كامل"),
    "Accès limité": ("Limited access", "وصول محدود"),
    "Fonctionnalités": ("Features", "الميزات"),
    "Avantages": ("Benefits", "المزايا"),
    "Limitations": ("Limitations", "القيود"),
    "Nombre illimité": ("Unlimited", "غير محدود"),
    "Par mois": ("Per month", "شهرياً"),
    "Par an": ("Per year", "سنوياً"),
    "Paiement sécurisé": ("Secure payment", "دفع آمن"),
    "Sans engagement": ("No commitment", "بدون التزام"),
    "Remboursement garanti": ("Money-back guarantee", "ضمان الاسترداد"),
    "Support prioritaire": ("Priority support", "دعم أولوي"),
    "Support standard": ("Standard support", "دعم قياسي"),
    "Documentation": ("Documentation", "التوثيق"),
    "Formation": ("Training", "التدريب"),
    "Assistance technique": ("Technical support", "الدعم التقني"),
    "En savoir plus": ("Learn more", "اعرف المزيد"),
    "Commencer maintenant": ("Start now", "ابدأ الآن"),
    "Nous contacter": ("Contact us", "اتصل بنا"),
    "Demander une démo": ("Request a demo", "طلب عرض توضيحي"),
    "Réserver": ("Book", "حجز"),
    "S'abonner": ("Subscribe", "اشترك"),
    "Se désabonner": ("Unsubscribe", "إلغاء الاشتراك"),
    "Rejoindre": ("Join", "انضم"),
    "Quitter": ("Leave", "غادر"),
    "Candidater": ("Apply", "تقدم"),
    "Postuler": ("Apply", "تقدم بطلب"),
    "Soumettre": ("Submit", "أرسل"),
    "Envoyer": ("Send", "إرسال"),
    "Sauvegarder": ("Save", "حفظ"),
    "Publier": ("Publish", "نشر"),
    "Archiver": ("Archive", "أرشفة"),
    "Restaurer": ("Restore", "استعادة"),
    "Exporter": ("Export", "تصدير"),
    "Importer": ("Import", "استيراد"),
    "Dupliquer": ("Duplicate", "نسخ"),
    "Déplacer": ("Move", "نقل"),
    "Renommer": ("Rename", "إعادة التسمية"),
    "Réorganiser": ("Reorganize", "إعادة الترتيب"),
    "Trier par": ("Sort by", "ترتيب حسب"),
    "Filtrer par": ("Filter by", "تصفية حسب"),
    "Grouper par": ("Group by", "تجميع حسب"),
    "Afficher": ("Display", "عرض"),
    "Masquer": ("Hide", "إخفاء"),
    "Développer": ("Expand", "توسيع"),
    "Réduire": ("Collapse", "طي"),
    "Plein écran": ("Full screen", "ملء الشاشة"),
    "Quitter le plein écran": ("Exit full screen", "الخروج من ملء الشاشة"),
    "Zoom avant": ("Zoom in", "تكبير"),
    "Zoom arrière": ("Zoom out", "تصغير"),
    "Réinitialiser la vue": ("Reset view", "إعادة تعيين العرض"),
    "Précédent": ("Previous", "السابق"),
    "Suivant": ("Next", "التالي"),
    "Première page": ("First page", "الصفحة الأولى"),
    "Dernière page": ("Last page", "الصفحة الأخيرة"),
    "Page": ("Page", "صفحة"),
    "sur": ("of", "من"),
    "Lignes par page": ("Rows per page", "صفوف لكل صفحة"),
    "Aucune donnée disponible": ("No data available", "لا تتوفر بيانات"),
    "Erreur de chargement": ("Loading error", "خطأ في التحميل"),
    "Réessayer": ("Retry", "إعادة المحاولة"),
    "Actualiser": ("Refresh", "تحديث"),
    "Succès !": ("Success!", "نجاح!"),
    "Attention !": ("Warning!", "تنبيه!"),
    "Information": ("Information", "معلومة"),
    "Confirmation requise": ("Confirmation required", "مطلوب تأكيد"),
    "Êtes-vous sûr ?": ("Are you sure?", "هل أنت متأكد؟"),
    "Cette action est irréversible": ("This action is irreversible", "هذا الإجراء لا يمكن التراجع عنه"),
    "Données personnelles": ("Personal data", "البيانات الشخصية"),
    "Confidentialité des données": ("Data privacy", "خصوصية البيانات"),
    "Politique de confidentialité": ("Privacy policy", "سياسة الخصوصية"),
    "Conditions d'utilisation": ("Terms of use", "شروط الاستخدام"),
    "Accepter les cookies": ("Accept cookies", "قبول ملفات تعريف الارتباط"),
    "Refuser": ("Decline", "رفض"),
    "Personnaliser": ("Customize", "تخصيص"),
    "Obligatoire": ("Required", "مطلوب"),
    "Optionnel": ("Optional", "اختياري"),
    "Recommandé": ("Recommended", "موصى به"),
    "Non disponible": ("Not available", "غير متاح"),
    "Bientôt disponible": ("Coming soon", "قريباً"),
    "Nouveau": ("New", "جديد"),
    "Mis à jour": ("Updated", "محدّث"),
    "Populaire": ("Popular", "شائع"),
    "Tendance": ("Trending", "رائج"),
    "Exclusif": ("Exclusive", "حصري"),
    "Premium": ("Premium", "مميز"),
    "Professionnel": ("Professional", "محترف"),
    "Certifié": ("Certified", "معتمد"),
    "Vérifié": ("Verified", "موثق"),
    "Officiel": ("Official", "رسمي"),
    "VIP": ("VIP", "VIP"),
    "Gold": ("Gold", "ذهبي"),
    "Silver": ("Silver", "فضي"),
    "Bronze": ("Bronze", "برونزي"),
    "Platinum": ("Platinum", "بلاتيني"),
    "Standard": ("Standard", "قياسي"),
    "Basique": ("Basic", "أساسي"),
    "Avancé": ("Advanced", "متقدم"),
    "Expert": ("Expert", "خبير"),
    "Entreprise": ("Enterprise", "مؤسسة"),
    "Choisir ce plan": ("Choose this plan", "اختر هذه الخطة"),
    "Plan actuel": ("Current plan", "الخطة الحالية"),
    "Mettre à niveau": ("Upgrade", "الترقية"),
    "Rétrograder": ("Downgrade", "تخفيض"),
    "Changer de plan": ("Change plan", "تغيير الخطة"),
    "Gérer l'abonnement": ("Manage subscription", "إدارة الاشتراك"),
    "Annuler l'abonnement": ("Cancel subscription", "إلغاء الاشتراك"),
    "Renouveler": ("Renew", "تجديد"),
    "Expiration": ("Expiration", "انتهاء الصلاحية"),
    "Expire le": ("Expires on", "تنتهي في"),
    "Dernière mise à jour": ("Last updated", "آخر تحديث"),
    "Créé le": ("Created on", "أُنشئ في"),
    "Modifié le": ("Modified on", "عُدّل في"),
    "Publié le": ("Published on", "نُشر في"),
    "Archivé le": ("Archived on", "أُرشف في"),
    "Supprimé le": ("Deleted on", "حُذف في"),
    "Par": ("By", "بواسطة"),
    "De": ("From", "من"),
    "À": ("To", "إلى"),
    "Objet": ("Subject", "الموضوع"),
    "Corps du message": ("Message body", "نص الرسالة"),
    "Pièce jointe": ("Attachment", "مرفق"),
    "Aucune pièce jointe": ("No attachments", "لا توجد مرفقات"),
    "Lire": ("Read", "مقروء"),
    "Non lu": ("Unread", "غير مقروء"),
    "Marquer comme lu": ("Mark as read", "تحديد كمقروء"),
    "Marquer comme non lu": ("Mark as unread", "تحديد كغير مقروء"),
    "Archiver la conversation": ("Archive conversation", "أرشفة المحادثة"),
    "Supprimer la conversation": ("Delete conversation", "حذف المحادثة"),
    "Répondre": ("Reply", "رد"),
    "Transférer": ("Forward", "إعادة التوجيه"),
    "Nouveau message": ("New message", "رسالة جديدة"),
    "Aucun message": ("No messages", "لا توجد رسائل"),
    "Commencer une conversation": ("Start a conversation", "بدء محادثة"),
    "Tapez votre message...": ("Type your message...", "اكتب رسالتك..."),
    "Envoyer le message": ("Send message", "إرسال الرسالة"),
    "Message envoyé": ("Message sent", "تم إرسال الرسالة"),
    "Erreur d'envoi": ("Send error", "خطأ في الإرسال"),
    "Connecté": ("Connected", "متصل"),
    "Déconnecté": ("Disconnected", "غير متصل"),
    "En ligne": ("Online", "متاح"),
    "Hors ligne": ("Offline", "غير متاح"),
    "Occupé": ("Busy", "مشغول"),
    "Absent": ("Away", "غائب"),
    "Ne pas déranger": ("Do not disturb", "لا تزعج"),
    "Notifications activées": ("Notifications enabled", "الإشعارات مفعّلة"),
    "Notifications désactivées": ("Notifications disabled", "الإشعارات معطّلة"),
    "Activer les notifications": ("Enable notifications", "تفعيل الإشعارات"),
    "Désactiver les notifications": ("Disable notifications", "تعطيل الإشعارات"),
    "Marquer tout comme lu": ("Mark all as read", "تحديد الكل كمقروء"),
    "Effacer toutes les notifications": ("Clear all notifications", "مسح جميع الإشعارات"),
    "Aucune notification": ("No notifications", "لا توجد إشعارات"),
    # Termes spécifiques BTP/SIB non couverts
    "Écosystème de réseau": ("Network ecosystem", "نظام الشبكة"),
    "Analyse de votre profil": ("Profile analysis", "تحليل ملفك الشخصي"),
    "Votre compatibilité": ("Your compatibility", "توافقك"),
    "Industrie du bâtiment": ("Construction industry", "صناعة البناء"),
    "Secteur BTP": ("Construction sector", "قطاع البناء"),
    "Matériaux de construction": ("Building materials", "مواد البناء"),
    "Génie civil": ("Civil engineering", "الهندسة المدنية"),
    "Travaux publics": ("Public works", "الأشغال العمومية"),
    "Promotion immobilière": ("Real estate development", "التطوير العقاري"),
    "Aménagement urbain": ("Urban planning", "التهيئة الحضرية"),
    "Efficacité énergétique": ("Energy efficiency", "كفاءة الطاقة"),
    "Bâtiment vert": ("Green building", "البناء الأخضر"),
    "Domotique": ("Home automation", "أتمتة المنازل"),
    "Façades": ("Facades", "الواجهات"),
    "Toitures": ("Roofing", "الأسطح"),
    "Menuiserie": ("Carpentry", "النجارة"),
    "Plomberie": ("Plumbing", "السباكة"),
    "Électricité": ("Electricity", "الكهرباء"),
    "Climatisation": ("Air conditioning", "التكييف"),
    "Sécurité incendie": ("Fire safety", "سلامة الحريق"),
    "Sécurité électronique": ("Electronic security", "الأمن الإلكتروني"),
    "Gestion de projet": ("Project management", "إدارة المشاريع"),
    "Bureau d'études": ("Engineering office", "مكتب الدراسات"),
    "Maîtrise d'ouvrage": ("Project management", "صاحب العمل"),
    "Maîtrise d'œuvre": ("Project supervision", "الإشراف على المشروع"),
    "Appel d'offres": ("Tender", "طلب عروض"),
    "Cahier des charges": ("Specifications", "دفتر الشروط"),
    "Plan de masse": ("Site plan", "مخطط الموقع"),
    "Permis de construire": ("Building permit", "رخصة البناء"),
    "Certificat de conformité": ("Certificate of conformity", "شهادة المطابقة"),
    "Réception des travaux": ("Work acceptance", "استلام الأعمال"),
    "Garantie décennale": ("Ten-year guarantee", "ضمان عشري"),
    "Assurance construction": ("Construction insurance", "تأمين البناء"),
}

def fix_encoding(text):
    try:
        return text.encode('latin1').decode('utf8')
    except:
        return text

def find_translation(fr_text, translations):
    if fr_text in translations:
        return translations[fr_text]
    fixed = fix_encoding(fr_text)
    if fixed in translations:
        return translations[fixed]
    for k, v in translations.items():
        if k.lower() == fr_text.lower() or k.lower() == fixed.lower():
            return v
    return None

def main():
    with open('new_translation_keys.json', 'r', encoding='utf-8') as f:
        new_keys = json.load(f)
    
    with open('src/store/translations.ts', 'r', encoding='utf-8') as f:
        content = f.read()
    
    lines = content.split('\n')
    
    section_starts = {}
    for i, line in enumerate(lines):
        stripped = line.strip()
        if stripped in ('fr: {', 'en: {', 'ar: {', 'es: {'):
            lang = stripped.split(':')[0].strip()
            section_starts[lang] = i
    
    current_lang = None
    updated = 0
    new_lines = lines[:]
    
    for i, line in enumerate(new_lines):
        stripped = line.strip()
        if stripped in ('fr: {', 'en: {', 'ar: {', 'es: {'):
            current_lang = stripped.split(':')[0].strip()
            continue
        
        if current_lang in ('en', 'ar'):
            m = re.match(r"(\s*)'([^']+)':\s*'(.*)',?\s*$", line)
            if m:
                indent = m.group(1)
                key = m.group(2)
                current_val = m.group(3)
                
                if key in new_keys:
                    fr_text = new_keys[key]
                    result = find_translation(fr_text, TRANSLATIONS_PASS2)
                    
                    if result:
                        en_text, ar_text = result
                        target_text = en_text if current_lang == 'en' else ar_text
                        
                        # Seulement mettre à jour si la valeur est encore en FR (identique au fr_text)
                        fixed_fr = fix_encoding(fr_text)
                        if current_val == fr_text or current_val == fixed_fr:
                            escaped = target_text.replace("'", "\\'")
                            suffix = ',' if line.rstrip().endswith(',') else ''
                            new_lines[i] = f"{indent}'{key}': '{escaped}'{suffix}"
                            updated += 1
    
    print(f"Lignes supplémentaires mises à jour: {updated}")
    
    new_content = '\n'.join(new_lines)
    with open('src/store/translations.ts', 'w', encoding='utf-8', newline='\n') as f:
        f.write(new_content)
    print("translations.ts mis à jour (passe 2)")

if __name__ == '__main__':
    main()
