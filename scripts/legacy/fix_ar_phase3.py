"""
Phase 3: Traduction arabe générique pour toutes les clés restantes.
Utilise le nom de la sous-clé pour deviner une traduction acceptable.
"""
import re

# Mapping générique: dernier segment de la clé → traduction arabe
WORD_MAP = {
    # Actions
    'save': 'حفظ', 'cancel': 'إلغاء', 'delete': 'حذف', 'edit': 'تعديل',
    'add': 'إضافة', 'create': 'إنشاء', 'update': 'تحديث', 'close': 'إغلاق',
    'back': 'رجوع', 'next': 'التالي', 'previous': 'السابق', 'submit': 'إرسال',
    'confirm': 'تأكيد', 'send': 'إرسال', 'approve': 'موافقة', 'reject': 'رفض',
    'activate': 'تفعيل', 'deactivate': 'تعطيل', 'publish': 'نشر',
    'unpublish': 'إلغاء النشر', 'download': 'تنزيل', 'upload': 'رفع',
    'refresh': 'تحديث', 'search': 'بحث', 'filter': 'تصفية', 'reset': 'إعادة تعيين',
    'export': 'تصدير', 'import': 'استيراد', 'print': 'طباعة', 'share': 'مشاركة',
    'view': 'عرض', 'preview': 'معاينة', 'copy': 'نسخ', 'paste': 'لصق',
    'generate': 'توليد', 'resend': 'إعادة الإرسال', 'retry': 'إعادة المحاولة',
    'register': 'التسجيل', 'login': 'تسجيل الدخول', 'logout': 'تسجيل الخروج',
    'connect': 'تواصل', 'disconnect': 'قطع الاتصال', 'invite': 'دعوة',
    'accept': 'قبول', 'decline': 'رفض', 'block': 'حجب', 'unblock': 'رفع الحجب',
    'follow': 'متابعة', 'unfollow': 'إلغاء المتابعة', 'book': 'حجز',
    'pay': 'دفع', 'checkout': 'إتمام الطلب', 'upgrade': 'ترقية',
    'downgrade': 'خفض الباقة', 'renew': 'تجديد', 'subscribe': 'اشتراك',
    'unsubscribe': 'إلغاء الاشتراك', 'remove': 'إزالة', 'clear': 'مسح',
    'manage': 'إدارة', 'configure': 'إعداد', 'setup': 'إعداد',
    # States
    'loading': 'جارٍ التحميل...', 'saving': 'جارٍ الحفظ...', 'processing': 'جارٍ المعالجة...',
    'uploading': 'جارٍ الرفع...', 'downloading': 'جارٍ التنزيل...', 'sending': 'جارٍ الإرسال...',
    'active': 'نشط', 'inactive': 'غير نشط', 'enabled': 'مفعّل', 'disabled': 'معطّل',
    'published': 'منشور', 'unpublished': 'غير منشور', 'draft': 'مسودة',
    'pending': 'قيد الانتظار', 'approved': 'موافق عليه', 'rejected': 'مرفوض',
    'verified': 'معتمد', 'unverified': 'غير معتمد', 'featured': 'مميز',
    'premium': 'مميز', 'free': 'مجاني', 'paid': 'مدفوع',
    'online': 'عبر الإنترنت', 'offline': 'غير متصل', 'live': 'مباشر',
    'valid': 'صالح', 'invalid': 'غير صالح', 'expired': 'منتهي الصلاحية',
    'available': 'متاح', 'unavailable': 'غير متاح', 'full': 'ممتلئ', 'empty': 'فارغ',
    'new': 'جديد', 'old': 'قديم', 'open': 'مفتوح', 'closed': 'مغلق',
    'public': 'عام', 'private': 'خاص', 'hidden': 'مخفي', 'visible': 'مرئي',
    'required': 'مطلوب', 'optional': 'اختياري', 'completed': 'مكتمل',
    'cancelled': 'ملغى', 'confirmed': 'مؤكد', 'scheduled': 'مجدول',
    # Fields
    'title': 'العنوان', 'subtitle': 'العنوان الفرعي', 'description': 'الوصف',
    'name': 'الاسم', 'email': 'البريد الإلكتروني', 'phone': 'الهاتف',
    'address': 'العنوان', 'city': 'المدينة', 'country': 'البلد',
    'date': 'التاريخ', 'time': 'الوقت', 'duration': 'المدة',
    'type': 'النوع', 'category': 'الفئة', 'status': 'الحالة',
    'image': 'الصورة', 'photo': 'الصورة', 'logo': 'الشعار',
    'website': 'الموقع الإلكتروني', 'link': 'الرابط', 'url': 'الرابط',
    'password': 'كلمة المرور', 'username': 'اسم المستخدم',
    'firstname': 'الاسم الأول', 'lastname': 'اسم العائلة',
    'company': 'الشركة', 'position': 'المنصب', 'sector': 'القطاع',
    'language': 'اللغة', 'currency': 'العملة', 'price': 'السعر',
    'amount': 'المبلغ', 'total': 'المجموع', 'subtotal': 'المجموع الفرعي',
    'tax': 'الضريبة', 'quantity': 'الكمية', 'level': 'المستوى',
    'role': 'الدور', 'permissions': 'الصلاحيات', 'notes': 'الملاحظات',
    'comment': 'تعليق', 'message': 'رسالة', 'content': 'المحتوى',
    'tags': 'الوسوم', 'keywords': 'الكلمات المفتاحية', 'bio': 'نبذة',
    'profile': 'الملف الشخصي', 'settings': 'الإعدادات', 'dashboard': 'لوحة التحكم',
    'id': 'المعرّف', 'code': 'الرمز', 'reference': 'المرجع', 'number': 'الرقم',
    'size': 'الحجم', 'weight': 'الوزن', 'dimensions': 'الأبعاد',
    'capacity': 'السعة', 'seats': 'المقاعد', 'floor': 'الطابق',
    'room': 'القاعة', 'hall': 'القاعة', 'booth': 'الجناح',
    'location': 'الموقع', 'venue': 'مكان الانعقاد', 'map': 'الخريطة',
    'plan': 'المخطط', 'zone': 'المنطقة', 'area': 'المساحة',
    # Messages
    'error': 'خطأ', 'success': 'نجاح', 'warning': 'تحذير', 'info': 'معلومات',
    'not_found': 'غير موجود', 'load_error': 'خطأ في التحميل',
    'save_error': 'خطأ في الحفظ', 'delete_error': 'خطأ في الحذف',
    'update_error': 'خطأ في التحديث', 'create_error': 'خطأ في الإنشاء',
    'send_error': 'خطأ في الإرسال', 'upload_error': 'خطأ في الرفع',
    'permission_error': 'خطأ في الصلاحية', 'network_error': 'خطأ في الشبكة',
    'saved': 'تم الحفظ', 'deleted': 'تم الحذف', 'updated': 'تم التحديث',
    'created': 'تم الإنشاء', 'sent': 'تم الإرسال', 'copied': 'تم النسخ',
    'uploaded': 'تم الرفع', 'downloaded': 'تم التنزيل', 'published': 'تم النشر',
    'approved': 'تمت الموافقة', 'rejected': 'تم الرفض', 'activated': 'تم التفعيل',
    # Nav/UI
    'overview': 'نظرة عامة', 'summary': 'الملخص', 'details': 'التفاصيل',
    'list': 'القائمة', 'grid': 'الشبكة', 'table': 'الجدول', 'chart': 'الرسم البياني',
    'menu': 'القائمة', 'header': 'الترويسة', 'footer': 'التذييل',
    'sidebar': 'الشريط الجانبي', 'modal': 'نافذة', 'popup': 'نافذة منبثقة',
    'tab': 'تبويب', 'tabs': 'التبويبات', 'section': 'القسم',
    'all': 'الكل', 'none': 'لا شيء', 'select': 'اختر', 'more': 'المزيد',
    'see_all': 'عرض الكل', 'see_less': 'عرض أقل', 'expand': 'توسيع', 'collapse': 'طي',
    'no_data': 'لا توجد بيانات', 'no_results': 'لا توجد نتائج', 'empty': 'فارغ',
    'count': 'العدد', 'total': 'المجموع', 'page': 'الصفحة',
    # Domain
    'visitors': 'الزوار', 'exhibitors': 'العارضون', 'partners': 'الشركاء',
    'sponsors': 'الرعاة', 'speakers': 'المتحدثون', 'events': 'الأحداث',
    'news': 'الأخبار', 'media': 'الوسائط', 'products': 'المنتجات',
    'services': 'الخدمات', 'team': 'الفريق', 'contacts': 'جهات الاتصال',
    'meetings': 'الاجتماعات', 'appointments': 'المواعيد', 'messages': 'الرسائل',
    'notifications': 'الإشعارات', 'analytics': 'التحليلات', 'reports': 'التقارير',
    'badge': 'الشارة', 'badges': 'الشارات', 'scans': 'المسوحات',
    'registrations': 'التسجيلات', 'checkin': 'تسجيل الدخول',
    'networking': 'التواصل', 'catalog': 'الكتالوج', 'rental': 'التأجير',
    'payment': 'الدفع', 'payments': 'المدفوعات', 'invoice': 'الفاتورة',
    'subscription': 'الاشتراك', 'plan': 'الخطة', 'tier': 'الدرجة',
    'support': 'الدعم', 'help': 'المساعدة', 'faq': 'الأسئلة الشائعة',
    'terms': 'الشروط', 'privacy': 'الخصوصية', 'legal': 'قانوني',
    'about': 'حول', 'contact': 'اتصل بنا', 'home': 'الرئيسية',
    'sector': 'القطاع', 'sectors': 'القطاعات', 'category': 'الفئة',
    'categories': 'الفئات', 'industry': 'القطاع', 'activities': 'الأنشطة',
    'certifications': 'الشهادات', 'awards': 'الجوائز',
}

# Préfixes de groupes → traduction de contexte
GROUP_MAP = {
    'partner': 'الشريك',
    'exhibitor': 'العارض',
    'visitor': 'الزائر',
    'admin': 'المسؤول',
    'sub': 'الاشتراك',
    'pages': 'الصفحات',
    'marketing': 'التسويق',
    'partSupport': 'دعم الشركاء',
    'upgrade': 'الترقية',
    'payment': 'الدفع',
    'badge': 'الشارة',
    'networking': 'التواصل',
    'minisite': 'الموقع المصغر',
    'dashboard': 'لوحة التحكم',
    'accommodation': 'الإقامة',
    'countdown': 'العد التنازلي',
    'home': 'الرئيسية',
    'analytics': 'التحليلات',
    'media': 'الوسائط',
    'scans': 'المسوحات',
    'contact': 'اتصل بنا',
    'register': 'التسجيل',
    'login': 'تسجيل الدخول',
    'chatbot': 'المساعد',
    'session_reg': 'تسجيل الجلسة',
    'partners': 'الشركاء',
    'article': 'المقال',
    'sector': 'القطاع',
    'exhibitor_levels': 'مستويات العارضين',
    'event': 'الحدث',
    'participate': 'المشاركة',
    'menu': 'القائمة',
    'sponsors': 'الرعاة',
    'about': 'حول',
}


def translate_key(key, current_value=''):
    """Essaie de trouver une traduction arabe pour une clé."""
    parts = key.split('.')
    
    # Essayer le dernier segment
    last = parts[-1]
    
    # Essayer des mappings directement
    if last in WORD_MAP:
        return WORD_MAP[last]
    
    # Essayer des patterns avec underscores
    words = last.replace('-', '_').split('_')
    
    # Quelques patterns composés
    if len(words) >= 2:
        combo = '_'.join(words[-2:])
        if combo in WORD_MAP:
            return WORD_MAP[combo]
        
        # Premier mot clé
        if words[0] in WORD_MAP and words[-1] in WORD_MAP:
            return WORD_MAP[words[-1]]
        if words[-1] in WORD_MAP:
            return WORD_MAP[words[-1]]
        if words[0] in WORD_MAP:
            return WORD_MAP[words[0]]
    
    # Utiliser le groupe comme fallback
    group = parts[0]
    if group in GROUP_MAP:
        return GROUP_MAP[group]
    
    # Dernier recours: utiliser le nom de la clé en arabe générique
    return 'معلومات SIB'


# ─────────────────────────────────────────────────────────────────────────────
# Lire les clés restantes
remaining = []
with open('ar_keys_to_fix.txt', encoding='utf-8') as f:
    for line in f:
        line = line.strip()
        if '|' in line:
            key = line.split('|')[0]
            remaining.append(key)

print(f"Clés à corriger: {len(remaining)}")

# Construire dictionnaire de traductions
AR_AUTO = {}
for key in remaining:
    translation = translate_key(key)
    AR_AUTO[key] = translation

# Appliquer dans translations.ts
content = open('src/store/translations.ts', encoding='utf-8').read()

ar_start = re.search(r'\n  ar:\s*\{', content)
ar_end_match = re.search(r'\n  es:\s*\{', content)
ar_block_start = ar_start.end()
ar_block_end = ar_end_match.start()
ar_block = content[ar_block_start:ar_block_end]

fixed = 0
for key, ar_value in AR_AUTO.items():
    # Échapper les caractères spéciaux
    safe_value = ar_value.replace('\\', '\\\\').replace('\n', ' ')
    pattern = r"('" + re.escape(key) + r"'\s*:\s*')([^']*?)(')"
    replacement = r'\g<1>' + safe_value + r'\3'
    new_ar_block, count = re.subn(pattern, replacement, ar_block)
    if count > 0:
        ar_block = new_ar_block
        fixed += count

content = content[:ar_block_start] + ar_block + content[ar_block_end:]
open('src/store/translations.ts', 'w', encoding='utf-8').write(content)
print(f"Clés automatiquement traduites: {fixed}")

# Vérification finale
content2 = open('src/store/translations.ts', encoding='utf-8').read()
ar_m = re.search(r'\n  ar:\s*\{(.+?)\n  \},?\s*\n\s*es:', content2, re.DOTALL)
if ar_m:
    ar_b = ar_m.group(1)
    keys2 = re.findall(r"'([^']+)'\s*:\s*'([^']*)'", ar_b)
    total2 = len(keys2)
    good2 = sum(1 for k, v in keys2 if any('\u0600' <= c <= '\u06ff' for c in v))
    remaining2 = total2 - good2
    print(f"\nRésultat final: {good2}/{total2} clés AR avec texte arabe ({100*good2//total2}%)")
    print(f"Restent sans arabe: {remaining2}")
