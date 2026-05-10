"""
Génère et insère toutes les clés manquantes dans src/store/translations.ts
pour les 4 blocs de langues (fr, en, ar, es).
"""
import re

# ─────────────────────────────────────────────
# Dictionnaire de traduction mot par mot
# (fr, en, ar, es)
# ─────────────────────────────────────────────
W = {
    # Actions
    'add': ("Ajouter", "Add", "إضافة", "Agregar"),
    'edit': ("Modifier", "Edit", "تعديل", "Editar"),
    'delete': ("Supprimer", "Delete", "حذف", "Eliminar"),
    'save': ("Sauvegarder", "Save", "حفظ", "Guardar"),
    'saved': ("Sauvegardé", "Saved", "تم الحفظ", "Guardado"),
    'saving': ("Sauvegarde…", "Saving…", "جارٍ الحفظ…", "Guardando…"),
    'load': ("Charger", "Load", "تحميل", "Cargar"),
    'loading': ("Chargement…", "Loading…", "جارٍ التحميل…", "Cargando…"),
    'create': ("Créer", "Create", "إنشاء", "Crear"),
    'creating': ("Création…", "Creating…", "جارٍ الإنشاء…", "Creando…"),
    'created': ("Créé", "Created", "تم الإنشاء", "Creado"),
    'update': ("Mettre à jour", "Update", "تحديث", "Actualizar"),
    'updated': ("Mis à jour", "Updated", "تم التحديث", "Actualizado"),
    'updating': ("Mise à jour…", "Updating…", "جارٍ التحديث…", "Actualizando…"),
    'cancel': ("Annuler", "Cancel", "إلغاء", "Cancelar"),
    'confirm': ("Confirmer", "Confirm", "تأكيد", "Confirmar"),
    'back': ("Retour", "Back", "رجوع", "Volver"),
    'close': ("Fermer", "Close", "إغلاق", "Cerrar"),
    'open': ("Ouvrir", "Open", "فتح", "Abrir"),
    'view': ("Voir", "View", "عرض", "Ver"),
    'show': ("Afficher", "Show", "إظهار", "Mostrar"),
    'hide': ("Masquer", "Hide", "إخفاء", "Ocultar"),
    'preview': ("Aperçu", "Preview", "معاينة", "Vista previa"),
    'search': ("Rechercher", "Search", "بحث", "Buscar"),
    'filter': ("Filtrer", "Filter", "تصفية", "Filtrar"),
    'sort': ("Trier", "Sort", "ترتيب", "Ordenar"),
    'export': ("Exporter", "Export", "تصدير", "Exportar"),
    'import': ("Importer", "Import", "استيراد", "Importar"),
    'send': ("Envoyer", "Send", "إرسال", "Enviar"),
    'sent': ("Envoyé", "Sent", "أُرسل", "Enviado"),
    'receive': ("Recevoir", "Receive", "استقبال", "Recibir"),
    'submit': ("Soumettre", "Submit", "إرسال", "Enviar"),
    'approve': ("Approuver", "Approve", "موافقة", "Aprobar"),
    'approved': ("Approuvé", "Approved", "موافق عليه", "Aprobado"),
    'reject': ("Rejeter", "Reject", "رفض", "Rechazar"),
    'rejected': ("Rejeté", "Rejected", "مرفوض", "Rechazado"),
    'publish': ("Publier", "Publish", "نشر", "Publicar"),
    'published': ("Publié", "Published", "منشور", "Publicado"),
    'unpublish': ("Dépublier", "Unpublish", "إلغاء النشر", "Despublicar"),
    'activate': ("Activer", "Activate", "تفعيل", "Activar"),
    'deactivate': ("Désactiver", "Deactivate", "إيقاف", "Desactivar"),
    'enable': ("Activer", "Enable", "تفعيل", "Habilitar"),
    'disable': ("Désactiver", "Disable", "تعطيل", "Deshabilitar"),
    'start': ("Démarrer", "Start", "بدء", "Iniciar"),
    'started': ("Démarré", "Started", "بدأ", "Iniciado"),
    'stop': ("Arrêter", "Stop", "إيقاف", "Detener"),
    'stopped': ("Arrêté", "Stopped", "توقف", "Detenido"),
    'reset': ("Réinitialiser", "Reset", "إعادة تعيين", "Restablecer"),
    'refresh': ("Actualiser", "Refresh", "تحديث", "Actualizar"),
    'copy': ("Copier", "Copy", "نسخ", "Copiar"),
    'copied': ("Copié", "Copied", "تم النسخ", "Copiado"),
    'paste': ("Coller", "Paste", "لصق", "Pegar"),
    'upload': ("Téléverser", "Upload", "رفع", "Subir"),
    'uploaded': ("Téléversé", "Uploaded", "تم الرفع", "Subido"),
    'uploading': ("Téléversement…", "Uploading…", "جارٍ الرفع…", "Subiendo…"),
    'download': ("Télécharger", "Download", "تنزيل", "Descargar"),
    'select': ("Sélectionner", "Select", "اختيار", "Seleccionar"),
    'deselect': ("Désélectionner", "Deselect", "إلغاء التحديد", "Deseleccionar"),
    'next': ("Suivant", "Next", "التالي", "Siguiente"),
    'previous': ("Précédent", "Previous", "السابق", "Anterior"),
    'finish': ("Terminer", "Finish", "إنهاء", "Terminar"),
    'complete': ("Compléter", "Complete", "اكتمال", "Completar"),
    'assign': ("Assigner", "Assign", "تعيين", "Asignar"),
    'unassign': ("Désassigner", "Unassign", "إلغاء التعيين", "Desasignar"),
    'invite': ("Inviter", "Invite", "دعوة", "Invitar"),
    'withdraw': ("Retirer", "Withdraw", "سحب", "Retirar"),
    'validate': ("Valider", "Validate", "التحقق", "Validar"),
    'generate': ("Générer", "Generate", "توليد", "Generar"),
    'scan': ("Scanner", "Scan", "مسح", "Escanear"),
    'scanned': ("Scanné", "Scanned", "تم المسح", "Escaneado"),
    'check': ("Vérifier", "Check", "التحقق", "Verificar"),
    'checkin': ("Enregistrement", "Check-in", "تسجيل الدخول", "Registro"),
    'checkout': ("Paiement", "Checkout", "الدفع", "Pago"),
    'schedule': ("Planifier", "Schedule", "جدولة", "Programar"),
    'reschedule': ("Replanifier", "Reschedule", "إعادة جدولة", "Reprogramar"),
    'book': ("Réserver", "Book", "حجز", "Reservar"),
    'booked': ("Réservé", "Booked", "محجوز", "Reservado"),
    'register': ("S'inscrire", "Register", "تسجيل", "Registrarse"),
    'registered': ("Inscrit", "Registered", "مسجل", "Registrado"),
    'login': ("Connexion", "Login", "تسجيل الدخول", "Iniciar sesión"),
    'logout': ("Déconnexion", "Logout", "تسجيل الخروج", "Cerrar sesión"),
    'buy': ("Acheter", "Buy", "شراء", "Comprar"),
    'pay': ("Payer", "Pay", "دفع", "Pagar"),
    'paid': ("Payé", "Paid", "مدفوع", "Pagado"),
    'transfer': ("Transfert", "Transfer", "نقل", "Transferir"),
    'transferred': ("Transféré", "Transferred", "تم النقل", "Transferido"),
    # Entities
    'badge': ("Badge", "Badge", "الشارة", "Distintivo"),
    'dashboard': ("tableau de bord", "Dashboard", "لوحة التحكم", "Panel"),
    'email': ("E-mail", "Email", "البريد الإلكتروني", "Correo electrónico"),
    'user': ("Utilisateur", "User", "مستخدم", "Usuario"),
    'users': ("Utilisateurs", "Users", "المستخدمون", "Usuarios"),
    'admin': ("Administrateur", "Admin", "المسؤول", "Administrador"),
    'event': ("Événement", "Event", "حدث", "Evento"),
    'events': ("Événements", "Events", "الأحداث", "Eventos"),
    'session': ("Session", "Session", "الجلسة", "Sesión"),
    'sessions': ("Sessions", "Sessions", "الجلسات", "Sesiones"),
    'partner': ("Partenaire", "Partner", "الشريك", "Socio"),
    'partners': ("Partenaires", "Partners", "الشركاء", "Socios"),
    'exhibitor': ("Exposant", "Exhibitor", "العارض", "Expositor"),
    'exhibitors': ("Exposants", "Exhibitors", "العارضون", "Expositores"),
    'visitor': ("Visiteur", "Visitor", "الزائر", "Visitante"),
    'visitors': ("Visiteurs", "Visitors", "الزوار", "Visitantes"),
    'speaker': ("Intervenant", "Speaker", "المتحدث", "Ponente"),
    'speakers': ("Intervenants", "Speakers", "المتحدثون", "Ponentes"),
    'media': ("Média", "Media", "الإعلام", "Medios"),
    'salon': ("Salon", "Fair", "المعرض", "Salón"),
    'salon_': ("Salon", "Fair", "المعرض", "Salón"),
    'press': ("Presse", "Press", "الصحافة", "Prensa"),
    'team': ("Équipe", "Team", "الفريق", "Equipo"),
    'staff': ("Personnel", "Staff", "الموظفون", "Personal"),
    'member': ("Membre", "Member", "العضو", "Miembro"),
    'members': ("Membres", "Members", "الأعضاء", "Miembros"),
    'product': ("Produit", "Product", "المنتج", "Producto"),
    'products': ("Produits", "Products", "المنتجات", "Productos"),
    'catalog': ("Catalogue", "Catalog", "الكتالوج", "Catálogo"),
    'category': ("Catégorie", "Category", "الفئة", "Categoría"),
    'categories': ("Catégories", "Categories", "الفئات", "Categorías"),
    'tag': ("Tag", "Tag", "وسم", "Etiqueta"),
    'tags': ("Tags", "Tags", "الوسوم", "Etiquetas"),
    'image': ("Image", "Image", "صورة", "Imagen"),
    'images': ("Images", "Images", "الصور", "Imágenes"),
    'video': ("Vidéo", "Video", "فيديو", "Video"),
    'videos': ("Vidéos", "Videos", "مقاطع الفيديو", "Videos"),
    'file': ("Fichier", "File", "ملف", "Archivo"),
    'files': ("Fichiers", "Files", "الملفات", "Archivos"),
    'document': ("Document", "Document", "وثيقة", "Documento"),
    'link': ("Lien", "Link", "رابط", "Enlace"),
    'url': ("URL", "URL", "الرابط", "URL"),
    'message': ("Message", "Message", "رسالة", "Mensaje"),
    'messages': ("Messages", "Messages", "الرسائل", "Mensajes"),
    'chat': ("Chat", "Chat", "دردشة", "Chat"),
    'notification': ("Notification", "Notification", "إشعار", "Notificación"),
    'notifications': ("Notifications", "Notifications", "الإشعارات", "Notificaciones"),
    'invitation': ("Invitation", "Invitation", "دعوة", "Invitación"),
    'invitations': ("Invitations", "Invitations", "الدعوات", "Invitaciones"),
    'appointment': ("Rendez-vous", "Appointment", "موعد", "Cita"),
    'appointments': ("Rendez-vous", "Appointments", "المواعيد", "Citas"),
    'meeting': ("Réunion", "Meeting", "اجتماع", "Reunión"),
    'meetings': ("Réunions", "Meetings", "الاجتماعات", "Reuniones"),
    'form': ("Formulaire", "Form", "النموذج", "Formulario"),
    'field': ("Champ", "Field", "حقل", "Campo"),
    'fields': ("Champs", "Fields", "الحقول", "Campos"),
    'table': ("Tableau", "Table", "جدول", "Tabla"),
    'column': ("Colonne", "Column", "عمود", "Columna"),
    'row': ("Ligne", "Row", "صف", "Fila"),
    'list': ("Liste", "List", "قائمة", "Lista"),
    'grid': ("Grille", "Grid", "شبكة", "Cuadrícula"),
    'page': ("Page", "Page", "صفحة", "Página"),
    'pages': ("Pages", "Pages", "الصفحات", "Páginas"),
    'section': ("Section", "Section", "قسم", "Sección"),
    'subsection': ("Sous-section", "Subsection", "قسم فرعي", "Subsección"),
    'block': ("Bloc", "Block", "كتلة", "Bloque"),
    'card': ("Carte", "Card", "بطاقة", "Tarjeta"),
    'panel': ("Panneau", "Panel", "لوحة", "Panel"),
    'modal': ("Modal", "Modal", "نافذة", "Modal"),
    'tooltip': ("Infobulle", "Tooltip", "تلميح", "Información"),
    'menu': ("Menu", "Menu", "قائمة", "Menú"),
    'tab': ("Onglet", "Tab", "تبويب", "Pestaña"),
    'tabs': ("Onglets", "Tabs", "التبويبات", "Pestañas"),
    'step': ("Étape", "Step", "خطوة", "Paso"),
    'steps': ("Étapes", "Steps", "الخطوات", "Pasos"),
    'profile': ("Profil", "Profile", "الملف الشخصي", "Perfil"),
    'account': ("Compte", "Account", "الحساب", "Cuenta"),
    'password': ("Mot de passe", "Password", "كلمة المرور", "Contraseña"),
    'settings': ("Paramètres", "Settings", "الإعدادات", "Configuración"),
    'config': ("Configuration", "Config", "الإعداد", "Configuración"),
    'configuration': ("Configuration", "Configuration", "الإعداد", "Configuración"),
    'option': ("Option", "Option", "خيار", "Opción"),
    'options': ("Options", "Options", "الخيارات", "Opciones"),
    'permission': ("Permission", "Permission", "إذن", "Permiso"),
    'permissions': ("Permissions", "Permissions", "الصلاحيات", "Permisos"),
    'role': ("Rôle", "Role", "الدور", "Rol"),
    'roles': ("Rôles", "Roles", "الأدوار", "Roles"),
    'status': ("Statut", "Status", "الحالة", "Estado"),
    'type': ("Type", "Type", "النوع", "Tipo"),
    'name': ("Nom", "Name", "الاسم", "Nombre"),
    'firstname': ("Prénom", "First Name", "الاسم الأول", "Nombre"),
    'lastname': ("Nom de famille", "Last Name", "اسم العائلة", "Apellido"),
    'company': ("Société", "Company", "الشركة", "Empresa"),
    'contact': ("Contact", "Contact", "الاتصال", "Contacto"),
    'phone': ("Téléphone", "Phone", "الهاتف", "Teléfono"),
    'address': ("Adresse", "Address", "العنوان", "Dirección"),
    'city': ("Ville", "City", "المدينة", "Ciudad"),
    'country': ("Pays", "Country", "البلد", "País"),
    'date': ("Date", "Date", "التاريخ", "Fecha"),
    'time': ("Heure", "Time", "الوقت", "Hora"),
    'duration': ("Durée", "Duration", "المدة", "Duración"),
    'price': ("Prix", "Price", "السعر", "Precio"),
    'amount': ("Montant", "Amount", "المبلغ", "Importe"),
    'currency': ("Devise", "Currency", "العملة", "Moneda"),
    'description': ("Description", "Description", "الوصف", "Descripción"),
    'content': ("Contenu", "Content", "المحتوى", "Contenido"),
    'title': ("Titre", "Title", "العنوان", "Título"),
    'subtitle': ("Sous-titre", "Subtitle", "العنوان الفرعي", "Subtítulo"),
    'note': ("Note", "Note", "ملاحظة", "Nota"),
    'notes': ("Notes", "Notes", "الملاحظات", "Notas"),
    'comment': ("Commentaire", "Comment", "تعليق", "Comentario"),
    'comments': ("Commentaires", "Comments", "التعليقات", "Comentarios"),
    'reason': ("Raison", "Reason", "السبب", "Razón"),
    'result': ("Résultat", "Result", "النتيجة", "Resultado"),
    'results': ("Résultats", "Results", "النتائج", "Resultados"),
    'report': ("Rapport", "Report", "التقرير", "Informe"),
    'analytics': ("Analytiques", "Analytics", "التحليلات", "Análisis"),
    'metrics': ("Métriques", "Metrics", "المقاييس", "Métricas"),
    'stats': ("Statistiques", "Stats", "الإحصائيات", "Estadísticas"),
    'count': ("Nombre", "Count", "العدد", "Cantidad"),
    'total': ("Total", "Total", "المجموع", "Total"),
    'summary': ("Résumé", "Summary", "الملخص", "Resumen"),
    'overview': ("Vue d'ensemble", "Overview", "نظرة عامة", "Resumen"),
    'details': ("Détails", "Details", "التفاصيل", "Detalles"),
    'info': ("Informations", "Info", "معلومات", "Información"),
    'help': ("Aide", "Help", "مساعدة", "Ayuda"),
    'support': ("Support", "Support", "الدعم", "Soporte"),
    'error': ("Erreur", "Error", "خطأ", "Error"),
    'success': ("Succès", "Success", "نجاح", "Éxito"),
    'warning': ("Avertissement", "Warning", "تحذير", "Advertencia"),
    'danger': ("Danger", "Danger", "خطر", "Peligro"),
    'active': ("Actif", "Active", "نشط", "Activo"),
    'inactive': ("Inactif", "Inactive", "غير نشط", "Inactivo"),
    'pending': ("En attente", "Pending", "قيد الانتظار", "Pendiente"),
    'processing': ("En cours", "Processing", "جارٍ المعالجة", "Procesando"),
    'completed': ("Terminé", "Completed", "مكتمل", "Completado"),
    'cancelled': ("Annulé", "Cancelled", "ملغى", "Cancelado"),
    'expired': ("Expiré", "Expired", "منتهي الصلاحية", "Caducado"),
    'new': ("Nouveau", "New", "جديد", "Nuevo"),
    'old': ("Ancien", "Old", "قديم", "Antiguo"),
    'all': ("Tous", "All", "الكل", "Todos"),
    'none': ("Aucun", "None", "لا شيء", "Ninguno"),
    'empty': ("Vide", "Empty", "فارغ", "Vacío"),
    'default': ("Par défaut", "Default", "افتراضي", "Predeterminado"),
    'required': ("Requis", "Required", "مطلوب", "Requerido"),
    'optional': ("Optionnel", "Optional", "اختياري", "Opcional"),
    'public': ("Public", "Public", "عام", "Público"),
    'private': ("Privé", "Private", "خاص", "Privado"),
    'global': ("Global", "Global", "عالمي", "Global"),
    'local': ("Local", "Local", "محلي", "Local"),
    'online': ("En ligne", "Online", "عبر الإنترنت", "En línea"),
    'offline': ("Hors ligne", "Offline", "غير متصل", "Sin conexión"),
    'live': ("En direct", "Live", "مباشر", "En vivo"),
    'network': ("Réseau", "Network", "شبكة", "Red"),
    'map': ("Plan", "Map", "خريطة", "Mapa"),
    'hall': ("Hall", "Hall", "قاعة", "Pabellón"),
    'stand': ("Stand", "Stand", "الجناح", "Stand"),
    'booth': ("Stand", "Booth", "الجناح", "Puesto"),
    'floor': ("Étage", "Floor", "الطابق", "Piso"),
    'space': ("Espace", "Space", "المساحة", "Espacio"),
    'zone': ("Zone", "Zone", "منطقة", "Zona"),
    'area': ("Zone", "Area", "المنطقة", "Área"),
    'location': ("Emplacement", "Location", "الموقع", "Ubicación"),
    'address_': ("Adresse", "Address", "العنوان", "Dirección"),
    # Common suffixes
    'title': ("Titre", "Title", "العنوان", "Título"),
    'subtitle': ("Sous-titre", "Subtitle", "العنوان الفرعي", "Subtítulo"),
    'label': ("Libellé", "Label", "التسمية", "Etiqueta"),
    'ph': ("Placeholder", "Placeholder", "نص توضيحي", "Marcador"),
    'btn': ("Bouton", "Button", "زر", "Botón"),
    'hint': ("Conseil", "Hint", "تلميح", "Sugerencia"),
    'ok': ("OK", "OK", "موافق", "OK"),
    'yes': ("Oui", "Yes", "نعم", "Sí"),
    'no': ("Non", "No", "لا", "No"),
    # Subject-specific
    'journalist': ("Journaliste", "Journalist", "صحفي", "Periodista"),
    'host': ("Animateur", "Host", "المضيف", "Presentador"),
    'guest': ("Invité", "Guest", "ضيف", "Invitado"),
    'audience': ("Audience", "Audience", "الجمهور", "Audiencia"),
    'stream': ("Diffusion", "Stream", "بث", "Transmisión"),
    'webinar': ("Webinaire", "Webinar", "ندوة عبر الإنترنت", "Seminario web"),
    'podcast': ("Podcast", "Podcast", "بودكاست", "Podcast"),
    'capsule': ("Capsule", "Capsule", "كبسولة", "Cápsula"),
    'library': ("Bibliothèque", "Library", "المكتبة", "Biblioteca"),
    'template': ("Modèle", "Template", "قالب", "Plantilla"),
    'templates': ("Modèles", "Templates", "القوالب", "Plantillas"),
    'smtp': ("SMTP", "SMTP", "SMTP", "SMTP"),
    'api': ("API", "API", "واجهة برمجية", "API"),
    'key': ("Clé", "Key", "مفتاح", "Clave"),
    'token': ("Jeton", "Token", "رمز", "Token"),
    'database': ("Base de données", "Database", "قاعدة البيانات", "Base de datos"),
    'table': ("Table", "Table", "الجدول", "Tabla"),
    'sql': ("SQL", "SQL", "SQL", "SQL"),
    'server': ("Serveur", "Server", "الخادم", "Servidor"),
    'client': ("Client", "Client", "العميل", "Cliente"),
    'request': ("Demande", "Request", "طلب", "Solicitud"),
    'response': ("Réponse", "Response", "استجابة", "Respuesta"),
    'log': ("Journal", "Log", "سجل", "Registro"),
    'logs': ("Journaux", "Logs", "السجلات", "Registros"),
    'access': ("Accès", "Access", "الوصول", "Acceso"),
    'code': ("Code", "Code", "رمز", "Código"),
    'qr': ("QR", "QR", "QR", "QR"),
    'scan': ("Scan", "Scan", "مسح", "Escaneo"),
    'scans': ("Scans", "Scans", "عمليات المسح", "Escaneos"),
    'checkin': ("Enregistrement", "Check-in", "تسجيل الدخول", "Registro"),
    'registration': ("Inscription", "Registration", "التسجيل", "Inscripción"),
    'subscription': ("Abonnement", "Subscription", "الاشتراك", "Suscripción"),
    'payment': ("Paiement", "Payment", "الدفع", "Pago"),
    'order': ("Commande", "Order", "طلب", "Pedido"),
    'invoice': ("Facture", "Invoice", "فاتورة", "Factura"),
    'receipt': ("Reçu", "Receipt", "إيصال", "Recibo"),
    'rental': ("Location", "Rental", "إيجار", "Alquiler"),
    'package': ("Forfait", "Package", "حزمة", "Paquete"),
    'plan': ("Plan", "Plan", "الخطة", "Plan"),
    'offer': ("Offre", "Offer", "عرض", "Oferta"),
    'discount': ("Remise", "Discount", "خصم", "Descuento"),
    'promo': ("Promo", "Promo", "ترويج", "Promo"),
    'satisfaction': ("Satisfaction", "Satisfaction", "الرضا", "Satisfacción"),
    'feedback': ("Retour", "Feedback", "تغذية راجعة", "Comentarios"),
    'survey': ("Sondage", "Survey", "استطلاع", "Encuesta"),
    'question': ("Question", "Question", "السؤال", "Pregunta"),
    'answer': ("Réponse", "Answer", "الإجابة", "Respuesta"),
    'rating': ("Note", "Rating", "التقييم", "Puntuación"),
    'review': ("Avis", "Review", "مراجعة", "Reseña"),
    'moderation': ("Modération", "Moderation", "الإشراف", "Moderación"),
    'networking': ("Réseautage", "Networking", "التواصل", "Networking"),
    'matching': ("Matching", "Matching", "المطابقة", "Emparejamiento"),
    'chatbot': ("Chatbot", "Chatbot", "روبوت المحادثة", "Chatbot"),
    'bot': ("Bot", "Bot", "بوت", "Bot"),
    'ai': ("IA", "AI", "الذكاء الاصطناعي", "IA"),
    'transfer': ("Transfert", "Transfer", "نقل", "Transferencia"),
    'collab': ("Collaborateur", "Collaborator", "المتعاون", "Colaborador"),
    'collabs': ("Collaborateurs", "Collaborators", "المتعاونون", "Colaboradores"),
    'passport': ("Passeport", "Passport", "جواز السفر", "Pasaporte"),
    'minisite': ("Minisite", "Minisite", "الموقع المصغر", "Minisite"),
    'hallmap': ("Plan du hall", "Hall Map", "خريطة القاعة", "Mapa del pabellón"),
    'checkin': ("Check-in", "Check-in", "تسجيل الحضور", "Check-in"),
    'rentalSuccess': ("Location confirmée", "Rental Confirmed", "تأكيد الإيجار", "Alquiler confirmado"),
    'demo': ("Démonstration", "Demo", "عرض توضيحي", "Demostración"),
    'chatbot': ("Chatbot", "Chatbot", "روبوت الدردشة", "Chatbot"),
    'first': ("Premier", "First", "الأول", "Primero"),
    'second': ("Deuxième", "Second", "الثاني", "Segundo"),
    'third': ("Troisième", "Third", "الثالث", "Tercero"),
    'number': ("Numéro", "Number", "رقم", "Número"),
    'no': ("N°", "No.", "رقم", "Nº"),
    'col': ("Col.", "Col.", "العمود", "Col."),
    'msg': ("Message", "Message", "رسالة", "Mensaje"),
    'ph': ("Saisir…", "Enter…", "أدخل…", "Ingrese…"),
    'placeholder': ("Saisir…", "Enter…", "أدخل…", "Ingrese…"),
    'open': ("Ouvert", "Open", "مفتوح", "Abierto"),
    'closed': ("Fermé", "Closed", "مغلق", "Cerrado"),
    'processing': ("En cours", "Processing", "جارٍ", "Procesando"),
    'on': ("Activé", "On", "مفعّل", "Activado"),
    'off': ("Désactivé", "Off", "معطّل", "Desactivado"),
    'air': ("Antenne", "Air", "الهواء", "Antena"),
    'on_air': ("En direct", "On Air", "على الهواء", "En vivo"),
    'views': ("Vues", "Views", "مشاهدات", "Vistas"),
    'viewers': ("Spectateurs", "Viewers", "المشاهدون", "Espectadores"),
    'scheduled': ("Programmé", "Scheduled", "مجدول", "Programado"),
    'realtime': ("Temps réel", "Real-time", "الوقت الحقيقي", "Tiempo real"),
    'auto': ("Automatique", "Auto", "تلقائي", "Automático"),
    'manual': ("Manuel", "Manual", "يدوي", "Manual"),
    'drag': ("Glisser", "Drag", "اسحب", "Arrastrar"),
    'drop': ("Déposer", "Drop", "أفلت", "Soltar"),
    'format': ("Format", "Format", "التنسيق", "Formato"),
    'formats': ("Formats", "Formats", "التنسيقات", "Formatos"),
    'size': ("Taille", "Size", "الحجم", "Tamaño"),
    'color': ("Couleur", "Color", "اللون", "Color"),
    'font': ("Police", "Font", "الخط", "Fuente"),
    'logo': ("Logo", "Logo", "الشعار", "Logo"),
    'banner': ("Bannière", "Banner", "البانر", "Banner"),
    'cover': ("Couverture", "Cover", "الغلاف", "Portada"),
    'background': ("Arrière-plan", "Background", "الخلفية", "Fondo"),
    'preview': ("Aperçu", "Preview", "معاينة", "Vista previa"),
    'realtime': ("Temps réel", "Real-time", "الوقت الحقيقي", "Tiempo real"),
    'html': ("HTML", "HTML", "HTML", "HTML"),
    'text': ("Texte", "Text", "النص", "Texto"),
    'subject': ("Sujet", "Subject", "الموضوع", "Asunto"),
    'body': ("Corps", "Body", "النص", "Cuerpo"),
    'signature': ("Signature", "Signature", "التوقيع", "Firma"),
    'attachment': ("Pièce jointe", "Attachment", "المرفق", "Adjunto"),
    'attachments': ("Pièces jointes", "Attachments", "المرفقات", "Adjuntos"),
    'purpose': ("Objet", "Purpose", "الغرض", "Propósito"),
    'witness': ("Témoin", "Witness", "الشاهد", "Testigo"),
    'profile': ("Profil", "Profile", "الملف الشخصي", "Perfil"),
    'press': ("Presse", "Press", "الصحافة", "Prensa"),
    'journalist': ("Journaliste", "Journalist", "الصحفي", "Periodista"),
    'journalists': ("Journalistes", "Journalists", "الصحفيون", "Periodistas"),
    'media_partner': ("Partenaire média", "Media Partner", "شريك إعلامي", "Socio mediático"),
    'accreditation': ("Accréditation", "Accreditation", "الاعتماد", "Acreditación"),
    'badge_auto': ("Badge automatique", "Auto Badge", "شارة تلقائية", "Distintivo automático"),
    'session_reg': ("Inscription session", "Session Registration", "تسجيل الجلسة", "Registro de sesión"),
    'invite': ("Inviter", "Invite", "دعوة", "Invitar"),
    'resend': ("Renvoyer", "Resend", "إعادة الإرسال", "Reenviar"),
    'expire': ("Expirer", "Expire", "انتهاء الصلاحية", "Caducar"),
    'pending_': ("En attente", "Pending", "قيد الانتظار", "Pendiente"),
    'approved_': ("Approuvé", "Approved", "موافق عليه", "Aprobado"),
    'rejected_': ("Rejeté", "Rejected", "مرفوض", "Rechazado"),
    'not': ("Non", "Not", "غير", "No"),
    'found': ("Trouvé", "Found", "موجود", "Encontrado"),
    'created': ("Créé", "Created", "تم الإنشاء", "Creado"),
    'deleted': ("Supprimé", "Deleted", "محذوف", "Eliminado"),
    'updated': ("Mis à jour", "Updated", "محدّث", "Actualizado"),
    'list': ("Liste", "List", "قائمة", "Lista"),
    'add_first': ("Ajouter le premier", "Add First", "أضف الأول", "Agregar primero"),
    'no_results': ("Aucun résultat", "No results", "لا توجد نتائج", "Sin resultados"),
    'confirm_delete': ("Confirmer la suppression", "Confirm Delete", "تأكيد الحذف", "Confirmar eliminación"),
    'calls': ("Appels", "Calls", "المكالمات", "Llamadas"),
    'trends': ("Tendances", "Trends", "الاتجاهات", "Tendencias"),
    'all_processed': ("Tout traité", "All Processed", "تم معالجة الكل", "Todo procesado"),
    'none_pending': ("Aucun en attente", "None Pending", "لا يوجد معلق", "Ninguno pendiente"),
    'none_active': ("Aucun actif", "None Active", "لا يوجد نشط", "Ninguno activo"),
    'irreversible': ("Irréversible", "Irreversible", "لا رجعة فيه", "Irreversible"),
    'completion': ("Complétion", "Completion", "الاكتمال", "Finalización"),
    'global_completion': ("Complétion globale", "Global Completion", "الاكتمال الكلي", "Finalización global"),
    'reg': ("Inscription", "Registration", "التسجيل", "Registro"),
    'reg_opened': ("Inscriptions ouvertes", "Registration Open", "التسجيل مفتوح", "Inscripción abierta"),
    'reg_closed': ("Inscriptions fermées", "Registration Closed", "التسجيل مغلق", "Inscripción cerrada"),
    'control': ("Contrôle", "Control", "التحكم", "Control"),
    'how': ("Comment", "How", "كيف", "Cómo"),
    'how_to': ("Comment faire", "How To", "كيفية", "Cómo hacer"),
    'missing': ("Manquant", "Missing", "مفقود", "Faltante"),
    'first_use': ("Première utilisation", "First Use", "الاستخدام الأول", "Primer uso"),
    'open_link': ("Ouvrir le lien", "Open Link", "فتح الرابط", "Abrir enlace"),
    'sing': ("(sing.)", "(sing.)", "(مف.)", "(sing.)"),
    'belongs_to': ("Appartient à", "Belongs To", "ينتمي إلى", "Pertenece a"),
    'search_ph': ("Rechercher…", "Search…", "بحث…", "Buscar…"),
    'update_btn': ("Mettre à jour", "Update", "تحديث", "Actualizar"),
    'add_journalist': ("Ajouter journaliste", "Add Journalist", "إضافة صحفي", "Agregar periodista"),
    'see_html': ("Voir HTML", "View HTML", "عرض HTML", "Ver HTML"),
    'see_text': ("Voir texte", "View Text", "عرض النص", "Ver texto"),
    'select_to_edit': ("Sélectionner pour modifier", "Select to Edit", "اختر للتعديل", "Seleccionar para editar"),
    'approval': ("Approbation", "Approval", "الموافقة", "Aprobación"),
    'none_active_hint': ("Aucun direct actif pour le moment", "No active stream at the moment", "لا يوجد بث نشط حالياً", "No hay transmisión activa"),
    'reg_realtime': ("Inscriptions en temps réel", "Real-time Registrations", "التسجيلات في الوقت الحقيقي", "Inscripciones en tiempo real"),
    'reg_exhibitors': ("Inscriptions exposants", "Exhibitor Registrations", "تسجيلات العارضين", "Inscripciones de expositores"),
    'reg_partners': ("Inscriptions partenaires", "Partner Registrations", "تسجيلات الشركاء", "Inscripciones de socios"),
    'reg_control_title': ("Contrôle des inscriptions", "Registration Control", "التحكم في التسجيل", "Control de inscripciones"),
    'reg_control_subtitle': ("Ouvrir/fermer les inscriptions", "Open/close registrations", "فتح/إغلاق التسجيلات", "Abrir/cerrar inscripciones"),
    'test_db': ("Tester la base de données", "Test Database", "اختبار قاعدة البيانات", "Probar base de datos"),
    'test_email': ("Tester l'e-mail", "Test Email", "اختبار البريد الإلكتروني", "Probar correo"),
    'smtp_ok': ("SMTP configuré", "SMTP Configured", "SMTP مُعدّ", "SMTP configurado"),
    'smtp_missing': ("SMTP manquant", "SMTP Missing", "SMTP مفقود", "SMTP faltante"),
    'db_ok': ("Base de données OK", "Database OK", "قاعدة البيانات OK", "Base de datos OK"),
    'no_table': ("Table inexistante", "Table Not Found", "الجدول غير موجود", "Tabla no encontrada"),
    'no_table_sql': ("SQL pour créer la table", "SQL to Create Table", "SQL لإنشاء الجدول", "SQL para crear tabla"),
    'nothing_to_save': ("Rien à sauvegarder", "Nothing to Save", "لا شيء للحفظ", "Nada que guardar"),
    'section_saved': ("Section sauvegardée", "Section Saved", "تم حفظ القسم", "Sección guardada"),
    'field_configured': ("Champ configuré", "Field Configured", "الحقل مُعدّ", "Campo configurado"),
    'field_required': ("Champ requis", "Field Required", "الحقل مطلوب", "Campo requerido"),
    'required_fields': ("Champs requis", "Required Fields", "الحقول المطلوبة", "Campos requeridos"),
    'missing_required': ("Champs requis manquants", "Missing Required Fields", "حقول مطلوبة مفقودة", "Campos requeridos faltantes"),
    'api_calls_24h': ("Appels API (24h)", "API Calls (24h)", "استدعاءات API (24h)", "Llamadas API (24h)"),
}

# ─────────────────────────────────────────────
# Dictionnaire de phrases complètes par clé
# Pour les cas complexes ou ambigus
# ─────────────────────────────────────────────
PHRASES = {}

def gen_phrase(key: str, lang_idx: int) -> str:
    """Génère une phrase de traduction à partir d'une clé."""
    # Retirer le préfixe (avant le premier point)
    suffix = key.split('.', 1)[-1] if '.' in key else key
    
    # Essayer la clé complète dans le dictionnaire de phrases
    if key in PHRASES:
        return PHRASES[key][lang_idx]
    
    # Essayer le suffix dans le dictionnaire W
    if suffix in W:
        return W[suffix][lang_idx]
    
    # Construire à partir des mots
    words = re.split(r'[_\-]', suffix)
    
    # Langues
    if lang_idx == 0:  # FR
        parts = []
        for w in words:
            if w in W:
                parts.append(W[w][0])
            else:
                parts.append(w.capitalize())
        return ' '.join(parts)
    elif lang_idx == 1:  # EN
        parts = []
        for w in words:
            if w in W:
                parts.append(W[w][1])
            else:
                parts.append(w.capitalize())
        return ' '.join(parts)
    elif lang_idx == 2:  # AR
        parts = []
        for w in words:
            if w in W:
                parts.append(W[w][2])
            else:
                parts.append(w.capitalize())
        return ' '.join(parts)
    else:  # ES
        parts = []
        for w in words:
            if w in W:
                parts.append(W[w][3])
            else:
                parts.append(w.capitalize())
        return ' '.join(parts)


def escape(s: str) -> str:
    """Échappe les apostrophes pour TypeScript."""
    return s.replace("'", "\\'")


# ─────────────────────────────────────────────
# Lire les clés manquantes
# ─────────────────────────────────────────────
missing_keys = [l.strip() for l in open('missing_keys_store.txt', encoding='utf-8') if l.strip()]
print(f"Clés à ajouter: {len(missing_keys)}")

# ─────────────────────────────────────────────
# Générer les blocs de traduction pour chaque langue
# ─────────────────────────────────────────────
lang_names = ['fr', 'en', 'ar', 'es']
lang_labels = ['Français', 'English', 'Arabic', 'Español']

blocks = {}
for li, lang in enumerate(lang_names):
    lines = []
    for key in missing_keys:
        val = gen_phrase(key, li)
        lines.append(f"    '{key}': '{escape(val)}',")
    blocks[lang] = '\n'.join(lines)

# ─────────────────────────────────────────────
# Insérer dans translations.ts
# Trouver la fin de chaque bloc de langue
# Stratégie : insérer juste avant la fermeture } de chaque bloc
# ─────────────────────────────────────────────
content = open('src/store/translations.ts', encoding='utf-8').read()

# Trouver les marqueurs de fin de chaque bloc de langue
# Le fichier a la structure:
# fr: { ... },
# en: { ... },
# ar: { ... },
# es: { ... }
# On cherche la dernière clé de chaque bloc

def find_block_end(content: str, lang: str, next_lang: str = None) -> int:
    """
    Trouve la position de fin du bloc de langue (juste avant le },) 
    """
    if next_lang:
        # Trouver la position du prochain bloc de langue
        next_match = re.search(r'\n\s+' + next_lang + r':\s*\{', content)
        if next_match:
            # Trouver le dernier }, avant ce marqueur
            segment = content[:next_match.start()]
            # Trouver la dernière ligne de clé dans ce segment
            last_key = list(re.finditer(r"'[a-zA-Z0-9_.]+'\s*:", segment))
            if last_key:
                last = last_key[-1]
                # Trouver la fin de cette ligne
                eol = content.find('\n', last.start())
                return eol
    else:
        # Dernier bloc - trouver la dernière clé avant la fermeture finale
        last_key = list(re.finditer(r"'[a-zA-Z0-9_.]+'\s*:", content))
        if last_key:
            last = last_key[-1]
            eol = content.find('\n', last.start())
            return eol
    return -1

# Insérer en ordre inverse pour ne pas décaler les positions
insertions = []

# Bloc fr - se termine avant en:
fr_end = find_block_end(content, 'fr', 'en')
if fr_end > 0:
    insertions.append((fr_end, blocks['fr']))

# Bloc en - se termine avant ar:
en_end = find_block_end(content, 'en', 'ar')
if en_end > 0:
    insertions.append((en_end, blocks['en']))

# Bloc ar - se termine avant es:
ar_end = find_block_end(content, 'ar', 'es')
if ar_end > 0:
    insertions.append((ar_end, blocks['ar']))

# Bloc es - dernier bloc
es_end = find_block_end(content, 'es', None)
if es_end > 0:
    insertions.append((es_end, blocks['es']))

print(f"Points d'insertion: fr={insertions[0][0]}, en={insertions[1][0]}, ar={insertions[2][0]}, es={insertions[3][0]}")

# Insérer en ordre décroissant
insertions.sort(key=lambda x: x[0], reverse=True)
result = content
for pos, block in insertions:
    result = result[:pos] + '\n' + block + result[pos:]

open('src/store/translations.ts', 'w', encoding='utf-8').write(result)
print("Terminé ! Clés insérées dans les 4 blocs de langues.")

# Vérification
content2 = open('src/store/translations.ts', encoding='utf-8').read()
count = 0
for key in missing_keys[:5]:
    if f"'{key}'" in content2:
        count += 1
        print(f"  ✓ {key}")
print(f"Vérification: {count}/5 clés confirmées")
