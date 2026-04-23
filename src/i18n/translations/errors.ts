/**
 * Traductions pour les messages d'erreur système
 */

export const errorsTranslations = {
  fr: {
    // Erreurs HTTP
    'error.400': 'Requête invalide',
    'error.401': 'Non autorisé - Veuillez vous connecter',
    'error.403': 'Accès refusé',
    'error.404': 'Page non trouvée',
    'error.408': 'Délai d\'attente dépassé',
    'error.409': 'Conflit de données',
    'error.429': 'Trop de requêtes - Veuillez patienter',
    'error.500': 'Erreur serveur interne',
    'error.502': 'Passerelle incorrecte',
    'error.503': 'Service temporairement indisponible',
    'error.504': 'Délai d\'attente de la passerelle',

    // Erreurs réseau
    'error.network.offline': 'Vous êtes hors ligne',
    'error.network.timeout': 'La connexion a expiré',
    'error.network.connection': 'Erreur de connexion',
    'error.network.dns': 'Impossible de résoudre le nom de domaine',

    // Erreurs d'authentification
    'error.auth.invalid_credentials': 'Identifiants incorrects',
    'error.auth.session_expired': 'Session expirée - Reconnectez-vous',
    'error.auth.unauthorized': 'Accès non autorisé',
    'error.auth.token_invalid': 'Jeton d\'authentification invalide',
    'error.auth.token_expired': 'Jeton d\'authentification expiré',
    'error.auth.account_locked': 'Compte verrouillé',
    'error.auth.account_disabled': 'Compte désactivé',
    'error.auth.too_many_attempts': 'Trop de tentatives - Réessayez plus tard',

    // Erreurs de validation
    'error.validation.required': 'Champs requis manquants',
    'error.validation.invalid_email': 'Email invalide',
    'error.validation.invalid_phone': 'Numéro de téléphone invalide',
    'error.validation.invalid_format': 'Format de données invalide',
    'error.validation.duplicate': 'Cette valeur existe déjà',

    // Erreurs de fichier
    'error.file.too_large': 'Fichier trop volumineux',
    'error.file.invalid_type': 'Type de fichier non supporté',
    'error.file.upload_failed': 'Échec du téléversement',
    'error.file.corrupted': 'Fichier corrompu',
    'error.file.not_found': 'Fichier non trouvé',

    // Erreurs de base de données
    'error.database.connection': 'Erreur de connexion à la base de données',
    'error.database.query': 'Erreur lors de la requête',
    'error.database.constraint': 'Violation de contrainte',
    'error.database.duplicate': 'Enregistrement en double',

    // Erreurs de données
    'error.data.not_found': 'Données non trouvées',
    'error.data.invalid': 'Données invalides',
    'error.data.corrupted': 'Données corrompues',
    'error.data.missing': 'Données manquantes',

    // Erreurs de permission
    'error.permission.denied': 'Permission refusée',
    'error.permission.insufficient': 'Permissions insuffisantes',
    'error.permission.role_required': 'Rôle requis : {{role}}',

    // Erreurs métier
    'error.appointment.quota_exceeded': 'Quota de rendez-vous dépassé',
    'error.appointment.slot_taken': 'Créneau déjà réservé',
    'error.appointment.past_date': 'Impossible de réserver dans le passé',
    'error.event.full': 'Événement complet',
    'error.event.registration_closed': 'Inscriptions fermées',
    'error.payment.failed': 'Paiement échoué',
    'error.payment.cancelled': 'Paiement annulé',

    // Messages génériques
    'error.generic': 'Une erreur est survenue',
    'error.unknown': 'Erreur inconnue',
    'error.try_again': 'Veuillez réessayer',
    'error.contact_support': 'Contactez le support si le problème persiste',

    // Erreurs de chargement spécifiques
    'error.loading.exhibitor': 'Erreur lors du chargement de l\'exposant',
    'error.loading.partner': 'Erreur lors du chargement du partenaire',
    'error.loading.partners': 'Erreur lors du chargement des partenaires',
    'error.loading.event': 'Erreur chargement événement',
    'error.loading.events': 'Erreur lors du chargement des événements',
    'error.loading.exhibitors': 'Erreur lors du chargement des exposants',
    'error.loading.user': 'Erreur lors du chargement de l\'utilisateur',
    'error.loading.users': 'Erreur lors du chargement des utilisateurs',
    'error.loading.media': 'Erreur chargement médias',
    'error.loading.medias': 'Erreur lors du chargement des médias',
    'error.loading.podcasts': 'Erreur chargement podcasts',
    'error.loading.testimonials': 'Erreur chargement témoignages',
    'error.loading.interviews': 'Erreur chargement interviews',
    'error.loading.capsule': 'Erreur lors du chargement de la capsule',
    'error.loading.episode': 'Erreur lors du chargement de l\' épisode',
    'error.loading.webinar': 'Erreur lors du chargement du webinaire',
    'error.loading.live_studio': 'Erreur lors du chargement du Live Studio',
    'error.loading.testimonial': 'Erreur lors du chargement du témoignage',
    'error.loading.request': 'Erreur lors du chargement de la demande',
    'error.loading.connections': 'Erreur chargement connexions',
    'error.loading.stats': 'Erreur chargement stats',
    'error.loading.payment_request': 'Erreur recuperation payment_request',
    'error.loading.templates': 'Erreur chargement templates',

    // Erreurs de création
    'error.create.auth': 'Erreur création auth',
    'error.create.user': 'Erreur lors de la création de l\'utilisateur',
    'error.create.notification': 'Erreur création notification admin',
    'error.create.request': 'Erreur lors de la création de la demande',

    // Erreurs d\'envoi/upload
    'error.upload.file': 'Erreur upload',
    'error.upload.proof': 'Erreur lors de l\'envoi du justificatif',
    'error.upload.media': 'Erreur upload',

    // Erreurs de suppression
    'error.delete.item': 'Erreur suppression',

    // Erreurs de sauvegarde
    'error.save.template': 'Erreur sauvegarde',
    'error.save.item': 'Erreur lors de l\'enregistrement',

    // Erreurs diverses
    'error.search': 'Erreur lors de la recherche',
    'error.generation': 'Erreur lors de la génération',
    'error.auto_generation': 'Erreur auto-generation',
    'error.action': 'Erreur lors de l\'action',
    'error.group_action': 'Erreur lors de l\'action groupée',
    'error.acceptance': 'Erreur lors de l\'acceptation',
    'error.refusal': 'Erreur lors du refus',
    'error.cancellation': 'Erreur lors de l\'annulation',
    'error.update_data': 'Erreur upgrade données',
    'error.recommendation': 'Erreur generateRecommendations',

    // Erreurs caméra/scanner
    'error.camera': 'Erreur caméra',
    'error.scanner.start': 'Erreur démarrage scanner',
    'error.scanner.stop': 'Erreur arrêt scanner',
    'error.scanner.processing': 'Erreur traitement scan',
    'error.scanner.validation': 'Erreur validation badge',
    'error.scanner.lead': 'Erreur enregistrement lead',

    // Erreurs impression
    'error.print': 'Erreur impression',

    // Actions d'erreur
    'error.action.retry': 'Réessayer',
    'error.action.reload': 'Recharger',
    'error.action.go_back': 'Retour',
    'error.action.go_home': 'Accueil',
    'error.action.contact': 'Contacter le support',
  },
  en: {
    // HTTP errors
    'error.400': 'Bad request',
    'error.401': 'Unauthorized - Please log in',
    'error.403': 'Access denied',
    'error.404': 'Page not found',
    'error.408': 'Request timeout',
    'error.409': 'Data conflict',
    'error.429': 'Too many requests - Please wait',
    'error.500': 'Internal server error',
    'error.502': 'Bad gateway',
    'error.503': 'Service temporarily unavailable',
    'error.504': 'Gateway timeout',

    // Network errors
    'error.network.offline': 'You are offline',
    'error.network.timeout': 'Connection timed out',
    'error.network.connection': 'Connection error',
    'error.network.dns': 'Unable to resolve domain name',

    // Authentication errors
    'error.auth.invalid_credentials': 'Invalid credentials',
    'error.auth.session_expired': 'Session expired - Please log in again',
    'error.auth.unauthorized': 'Unauthorized access',
    'error.auth.token_invalid': 'Invalid authentication token',
    'error.auth.token_expired': 'Authentication token expired',
    'error.auth.account_locked': 'Account locked',
    'error.auth.account_disabled': 'Account disabled',
    'error.auth.too_many_attempts': 'Too many attempts - Try again later',

    // Validation errors
    'error.validation.required': 'Missing required fields',
    'error.validation.invalid_email': 'Invalid email',
    'error.validation.invalid_phone': 'Invalid phone number',
    'error.validation.invalid_format': 'Invalid data format',
    'error.validation.duplicate': 'This value already exists',

    // File errors
    'error.file.too_large': 'File too large',
    'error.file.invalid_type': 'Unsupported file type',
    'error.file.upload_failed': 'Upload failed',
    'error.file.corrupted': 'Corrupted file',
    'error.file.not_found': 'File not found',

    // Database errors
    'error.database.connection': 'Database connection error',
    'error.database.query': 'Query error',
    'error.database.constraint': 'Constraint violation',
    'error.database.duplicate': 'Duplicate record',

    // Data errors
    'error.data.not_found': 'Data not found',
    'error.data.invalid': 'Invalid data',
    'error.data.corrupted': 'Corrupted data',
    'error.data.missing': 'Missing data',

    // Permission errors
    'error.permission.denied': 'Permission denied',
    'error.permission.insufficient': 'Insufficient permissions',
    'error.permission.role_required': 'Role required: {{role}}',

    // Business errors
    'error.appointment.quota_exceeded': 'Appointment quota exceeded',
    'error.appointment.slot_taken': 'Slot already booked',
    'error.appointment.past_date': 'Cannot book in the past',
    'error.event.full': 'Event full',
    'error.event.registration_closed': 'Registration closed',
    'error.payment.failed': 'Payment failed',
    'error.payment.cancelled': 'Payment cancelled',

    // Generic messages
    'error.generic': 'An error occurred',
    'error.unknown': 'Unknown error',
    'error.try_again': 'Please try again',
    'error.contact_support': 'Contact support if the problem persists',

    // Specific loading errors
    'error.loading.exhibitor': 'Error loading exhibitor',
    'error.loading.partner': 'Error loading partner',
    'error.loading.partners': 'Error loading partners',
    'error.loading.event': 'Error loading event',
    'error.loading.events': 'Error loading events',
    'error.loading.exhibitors': 'Error loading exhibitors',
    'error.loading.user': 'Error loading user',
    'error.loading.users': 'Error loading users',
    'error.loading.media': 'Error loading media',
    'error.loading.medias': 'Error loading medias',
    'error.loading.podcasts': 'Error loading podcasts',
    'error.loading.testimonials': 'Error loading testimonials',
    'error.loading.interviews': 'Error loading interviews',
    'error.loading.capsule': 'Error loading capsule',
    'error.loading.episode': 'Error loading episode',
    'error.loading.webinar': 'Error loading webinar',
    'error.loading.live_studio': 'Error loading Live Studio',
    'error.loading.testimonial': 'Error loading testimonial',
    'error.loading.request': 'Error loading request',
    'error.loading.connections': 'Error loading connections',
    'error.loading.stats': 'Error loading stats',
    'error.loading.payment_request': 'Error retrieving payment_request',
    'error.loading.templates': 'Error loading templates',

    // Creation errors
    'error.create.auth': 'Auth creation error',
    'error.create.user': 'Error creating user',
    'error.create.notification': 'Error creating admin notification',
    'error.create.request': 'Error creating request',

    // Send/upload errors
    'error.upload.file': 'Upload error',
    'error.upload.proof': 'Error sending proof',
    'error.upload.media': 'Upload error',

    // Deletion errors
    'error.delete.item': 'Deletion error',

    // Save errors
    'error.save.template': 'Save error',
    'error.save.item': 'Error saving',

    // Miscellaneous errors
    'error.search': 'Error during search',
    'error.generation': 'Error during generation',
    'error.auto_generation': 'Auto-generation error',
    'error.action': 'Error during action',
    'error.group_action': 'Error during group action',
    'error.acceptance': 'Error during acceptance',
    'error.refusal': 'Error during refusal',
    'error.cancellation': 'Error during cancellation',
    'error.update_data': 'Data upgrade error',
    'error.recommendation': 'generateRecommendations error',

    // Camera/scanner errors
    'error.camera': 'Camera error',
    'error.scanner.start': 'Scanner start error',
    'error.scanner.stop': 'Scanner stop error',
    'error.scanner.processing': 'Scan processing error',
    'error.scanner.validation': 'Badge validation error',
    'error.scanner.lead': 'Lead recording error',

    // Print errors
    'error.print': 'Print error',

    // Error actions
    'error.action.retry': 'Retry',
    'error.action.reload': 'Reload',
    'error.action.go_back': 'Go back',
    'error.action.go_home': 'Home',
    'error.action.contact': 'Contact support',
  },
  ar: {
    'error.400': 'طلب سيء',
    'error.401': 'غير مصرح - يرجى تسجيل الدخول',
    'error.403': 'تم رفض الوصول',
    'error.404': 'الصفحة غير موجودة',
    'error.408': 'انتهت صلاحية الطلب',
    'error.409': 'تضارب البيانات',
    'error.429': 'عدد الطلبات كبير جدًا - يرجى الانتظار',
    'error.500': 'خطأ في الخادم الداخلي',
    'error.502': 'بوابة سيئة',
    'error.503': 'الخدمة غير متاحة مؤقتًا',
    'error.504': 'انتهت صلاحية البوابة',
    'error.network.offline': 'أنت غير متصل بالإنترنت',
    'error.network.timeout': 'انتهت صلاحية الاتصال',
    'error.network.connection': 'خطأ في الاتصال',
    'error.network.dns': 'غير قادر على حل اسم النطاق',
    'error.auth.invalid_credentials': 'بيانات اعتماد غير صحيحة',
    'error.auth.session_expired': 'انتهت صلاحية الجلسة - يرجى تسجيل الدخول مجددًا',
    'error.auth.unauthorized': 'وصول غير مصرح',
    'error.auth.token_invalid': 'رمز المصادقة غير صالح',
    'error.auth.token_expired': 'انتهت صلاحية رمز المصادقة',
    'error.auth.account_locked': 'الحساب مقفل',
    'error.auth.account_disabled': 'الحساب معطّل',
    'error.auth.too_many_attempts': 'عدد المحاولات كبير جدًا - حاول لاحقًا',
    'error.validation.required': 'الحقول المطلوبة مفقودة',
    'error.validation.invalid_email': 'بريد إلكتروني غير صالح',
    'error.validation.invalid_phone': 'رقم هاتف غير صالح',
    'error.validation.invalid_format': 'صيغة بيانات غير صالحة',
    'error.validation.duplicate': 'هذه القيمة موجودة بالفعل',
    'error.file.too_large': 'الملف كبير جدًا',
    'error.file.invalid_type': 'نوع ملف غير مدعوم',
    'error.file.upload_failed': 'فشل التحميل',
    'error.file.corrupted': 'ملف تالف',
    'error.file.not_found': 'الملف غير موجود',
    'error.database.connection': 'خطأ في الاتصال بقاعدة البيانات',
    'error.database.query': 'خطأ في الاستعلام',
    'error.database.constraint': 'انتهاك القيد',
    'error.database.duplicate': 'سجل مكرر',
    'error.data.not_found': 'البيانات غير موجودة',
    'error.data.invalid': 'بيانات غير صالحة',
    'error.data.corrupted': 'بيانات تالفة',
    'error.data.missing': 'بيانات مفقودة',
    'error.permission.denied': 'تم رفض الإذن',
    'error.permission.insufficient': 'إذن غير كافي',
    'error.permission.role_required': 'دور مطلوب: {{role}}',
    'error.appointment.quota_exceeded': 'تم تجاوز حصة المواعيد',
    'error.appointment.slot_taken': 'الفتحة محجوزة بالفعل',
    'error.appointment.past_date': 'لا يمكن الحجز في الماضي',
    'error.event.full': 'الحدث ممتلئ',
    'error.event.registration_closed': 'التسجيل مغلق',
    'error.payment.failed': 'فشل الدفع',
    'error.payment.cancelled': 'تم إلغاء الدفع',
    'error.generic': 'حدث خطأ',
    'error.unknown': 'خطأ غير معروف',
    'error.try_again': 'يرجى المحاولة مجددًا',
    'error.contact_support': 'اتصل بالدعم إذا استمرت المشكلة',
    'error.loading.exhibitor': 'خطأ في تحميل العارض',
    'error.loading.partner': 'خطأ في تحميل الشريك',
    'error.loading.partners': 'خطأ في تحميل الشركاء',
    'error.loading.event': 'خطأ في تحميل الحدث',
    'error.loading.events': 'خطأ في تحميل الأحداث',
    'error.loading.exhibitors': 'خطأ في تحميل العارضين',
    'error.loading.user': 'خطأ في تحميل المستخدم',
    'error.loading.users': 'خطأ في تحميل المستخدمين',
    'error.loading.media': 'خطأ في تحميل الوسائط',
    'error.loading.medias': 'خطأ في تحميل الوسائط',
    'error.loading.podcasts': 'خطأ في تحميل البودكاست',
    'error.loading.testimonials': 'خطأ في تحميل الشهادات',
    'error.loading.interviews': 'خطأ في تحميل المقابلات',
    'error.loading.capsule': 'خطأ في تحميل الكبسولة',
    'error.loading.episode': 'خطأ في تحميل الحلقة',
    'error.loading.webinar': 'خطأ في تحميل الندوة عبر الويب',
    'error.loading.live_studio': 'خطأ في تحميل Live Studio',
    'error.loading.testimonial': 'خطأ في تحميل الشهادة',
    'error.loading.request': 'خطأ في تحميل الطلب',
    'error.loading.connections': 'خطأ في تحميل الاتصالات',
    'error.loading.stats': 'خطأ في تحميل الإحصائيات',
    'error.loading.payment_request': 'خطأ في استرجاع طلب الدفع',
    'error.loading.templates': 'خطأ في تحميل القوالب',
    'error.create.auth': 'خطأ إنشاء المصادقة',
    'error.create.user': 'خطأ في إنشاء المستخدم',
    'error.create.notification': 'خطأ في إنشاء إشعار المسؤول',
    'error.create.request': 'خطأ في إنشاء الطلب',
    'error.upload.file': 'خطأ في التحميل',
    'error.upload.proof': 'خطأ في إرسال الإثبات',
    'error.upload.media': 'خطأ في التحميل',
    'error.delete.item': 'خطأ في الحذف',
    'error.save.template': 'خطأ في الحفظ',
    'error.save.item': 'خطأ في الحفظ',
    'error.search': 'خطأ في البحث',
    'error.generation': 'خطأ في الإنشاء',
    'error.auto_generation': 'خطأ في الإنشاء التلقائي',
    'error.action': 'خطأ في الإجراء',
    'error.group_action': 'خطأ في الإجراء الجماعي',
    'error.acceptance': 'خطأ في القبول',
    'error.refusal': 'خطأ في الرفض',
    'error.cancellation': 'خطأ في الإلغاء',
    'error.update_data': 'خطأ في تحديث البيانات',
    'error.recommendation': 'خطأ في التوصيات',
    'error.camera': 'خطأ في الكاميرا',
    'error.scanner.start': 'خطأ في بدء الماسح',
    'error.scanner.stop': 'خطأ في إيقاف الماسح',
    'error.scanner.processing': 'خطأ في معالجة المسح',
    'error.scanner.validation': 'خطأ في التحقق من البطاقة',
    'error.scanner.lead': 'خطأ في تسجيل العميل المحتمل',
    'error.print': 'خطأ في الطباعة',
    'error.action.retry': 'إعادة المحاولة',
    'error.action.reload': 'إعادة التحميل',
    'error.action.go_back': 'العودة',
    'error.action.go_home': 'الصفحة الرئيسية',
    'error.action.contact': 'اتصل بالدعم',
  },
};
