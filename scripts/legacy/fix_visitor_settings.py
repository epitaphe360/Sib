"""Fix VisitorProfileSettings.tsx - add useTranslation and translate all strings."""

REPLACEMENTS = [
    # Add useTranslation import
    (
        b"import useAuthStore from '../../store/authStore';",
        b"import useAuthStore from '../../store/authStore';\nimport { useTranslation } from '../../hooks/useTranslation';"
    ),
    # Add const { t } = useTranslation() after existing state declarations
    (
        b"  const [meetingsUsed, setMeetingsUsed] = useState(0);",
        b"  const [meetingsUsed, setMeetingsUsed] = useState(0);\n  const { t } = useTranslation();"
    ),
    # Loading state
    (
        b"          <h3 className=\"text-lg font-medium text-gray-900 mb-2\">\r\n            Chargement du profil\r\n          </h3>\r\n          <p className=\"text-gray-600\">\r\n            Veuillez patienter...\r\n          </p>",
        b"          <h3 className=\"text-lg font-medium text-gray-900 mb-2\">\r\n            {t('visitor_settings.loading')}\r\n          </h3>\r\n          <p className=\"text-gray-600\">\r\n            {t('visitor_settings.loading_wait')}\r\n          </p>"
    ),
    # Profile creating state
    (
        b"          <h3 className=\"text-lg font-medium text-gray-900 mb-2\">\r\n            Profil en cours de cr\xc3\xa9ation\r\n          </h3>\r\n          <p className=\"text-gray-600 mb-4\">\r\n            Votre profil est en cours d'initialisation. Veuillez rafra\xc3\xaechir la page dans quelques instants.\r\n          </p>\r\n          <Button onClick={() => window.location.reload()}>\r\n            Rafra\xc3\xaechir la page\r\n          </Button>",
        b"          <h3 className=\"text-lg font-medium text-gray-900 mb-2\">\r\n            {t('visitor_settings.profile_creating')}\r\n          </h3>\r\n          <p className=\"text-gray-600 mb-4\">\r\n            {t('visitor_settings.profile_creating_desc')}\r\n          </p>\r\n          <Button onClick={() => window.location.reload()}>\r\n            {t('visitor_settings.refresh')}\r\n          </Button>"
    ),
    # Back button
    (
        b"              Retour au Tableau de Bord Visiteur",
        b"              {t('visitor_settings.back')}"
    ),
    # Page title
    (
        b"            <h1 className=\"text-3xl font-bold text-gray-900 mb-2\">\r\n              Param\xc3\xa8tres du Profil Visiteur\r\n            </h1>\r\n            <p className=\"text-gray-600\">\r\n              Personnalisez votre profil et vos pr\xc3\xa9f\xc3\xa9rences pour optimiser votre exp\xc3\xa9rience SIB\r\n            </p>",
        b"            <h1 className=\"text-3xl font-bold text-gray-900 mb-2\">\r\n              {t('visitor_settings.title')}\r\n            </h1>\r\n            <p className=\"text-gray-600\">\r\n              {t('visitor_settings.subtitle')}\r\n            </p>"
    ),
    # Nav items
    (
        b"                    { id: 'profile', label: 'Profil Personnel', icon: User },\r\n                    { id: 'quotas', label: 'Mes Quotas', icon: Award },\r\n                    { id: 'interests', label: 'Int\xc3\xa9r\xc3\xaats & Objectifs', icon: Target },\r\n                    { id: 'notifications', label: 'Notifications', icon: Bell },\r\n                    { id: 'privacy', label: 'Confidentialit\xc3\xa9', icon: Shield }",
        b"                    { id: 'profile', label: t('visitor_settings.nav_profile'), icon: User },\r\n                    { id: 'quotas', label: t('visitor_settings.nav_quotas'), icon: Award },\r\n                    { id: 'interests', label: t('visitor_settings.nav_interests'), icon: Target },\r\n                    { id: 'notifications', label: t('visitor_settings.nav_notifications'), icon: Bell },\r\n                    { id: 'privacy', label: t('visitor_settings.nav_privacy'), icon: Shield }"
    ),
    # Informations Personnelles
    (
        b"                      Informations Personnelles",
        b"                      {t('visitor_settings.personal_info')}"
    ),
    # Modifier button
    (
        b"                          Modifier",
        b"                          {t('visitor_settings.edit')}"
    ),
    # Annuler button
    (
        b"                            Annuler",
        b"                            {t('visitor_settings.cancel')}"
    ),
    # Sauvegarder button
    (
        b"                            Sauvegarder",
        b"                            {t('visitor_settings.save')}"
    ),
    # Type de visiteur label
    (
        b"                        Type de visiteur",
        b"                        {t('visitor_settings.visitor_type')}"
    ),
    # Particulier
    (
        b"                          <span className=\"text-sm text-gray-700\">Particulier</span>",
        b"                          <span className=\"text-sm text-gray-700\">{t('visitor_settings.individual')}</span>"
    ),
    # Travailleur autonome
    (
        b"                          <span className=\"text-sm text-gray-700\">Travailleur autonome</span>",
        b"                          <span className=\"text-sm text-gray-700\">{t('visitor_settings.freelancer_type')}</span>"
    ),
    # Entreprise
    (
        b"                          <span className=\"text-sm text-gray-700\">Entreprise</span>",
        b"                          <span className=\"text-sm text-gray-700\">{t('visitor_settings.company_type')}</span>"
    ),
    # Photo de profil title
    (
        b"                        <h4 className=\"font-medium text-gray-900\">Photo de profil</h4>\r\n                        <p className=\"text-sm text-gray-600\">\r\n                          Ajoutez une photo pour personnaliser votre profil\r\n                        </p>",
        b"                        <h4 className=\"font-medium text-gray-900\">{t('visitor_settings.photo_title')}</h4>\r\n                        <p className=\"text-sm text-gray-600\">\r\n                          {t('visitor_settings.photo_hint')}\r\n                        </p>"
    ),
    # Prénom label
    (
        b"                          Pr\xc3\xa9nom",
        b"                          {t('visitor_settings.first_name')}"
    ),
    # Nom label
    (
        b"                          Nom\r\n                        </label>",
        b"                          {t('visitor_settings.last_name')}\r\n                        </label>"
    ),
    # Entreprise field label
    (
        b"                              Entreprise\r\n                            </label>",
        b"                              {t('visitor_settings.company_label')}\r\n                            </label>"
    ),
    # Poste label
    (
        b"                              Poste",
        b"                              {t('visitor_settings.position')}"
    ),
    # Statut professionnel label
    (
        b"                              Statut professionnel",
        b"                              {t('visitor_settings.professional_status')}"
    ),
    # placeholder Consultant
    (
        b"placeholder=\"Ex: Consultant ind\xc3\xa9pendant\"",
        b"placeholder={t('visitor_settings.status_placeholder')}"
    ),
    # Non spécifié for professionalStatus
    (
        b"<p className=\"text-gray-900\">{visitorProfile.professionalStatus || 'Non sp\xc3\xa9cifi\xc3\xa9'}</p>",
        b"<p className=\"text-gray-900\">{visitorProfile.professionalStatus || t('visitor_settings.not_specified')}</p>"
    ),
    # Secteur d'activité label
    (
        b"                              Secteur d'activit\xc3\xa9",
        b"                              {t('visitor_settings.business_sector')}"
    ),
    # placeholder consulting construction
    (
        b"placeholder=\"Ex: Consulting construction\"",
        b"placeholder={t('visitor_settings.sector_placeholder')}"
    ),
    # Non spécifié for businessSector
    (
        b"<p className=\"text-gray-900\">{visitorProfile.businessSector || 'Non sp\xc3\xa9cifi\xc3\xa9'}</p>",
        b"<p className=\"text-gray-900\">{visitorProfile.businessSector || t('visitor_settings.not_specified')}</p>"
    ),
    # Email label
    (
        b"                          Email\r\n                        </label>",
        b"                          {t('visitor_settings.email')}\r\n                        </label>"
    ),
    # Téléphone label
    (
        b"                          T\xc3\xa9l\xc3\xa9phone",
        b"                          {t('visitor_settings.phone')}"
    ),
    # Pays label
    (
        b"                          Pays",
        b"                          {t('visitor_settings.country')}"
    ),
    # Niveau Visiteur
    (
        b"                          Niveau Visiteur",
        b"                          {t('visitor_settings.visitor_level')}"
    ),
    # Passer au Pass VIP button (upgrade)
    (
        b"                            Passer au Pass VIP\r\n                          </Button>",
        b"                            {t('visitor_settings.vip_upgrade_btn')}\r\n                          </Button>"
    ),
    # Mes Quotas Visiteur
    (
        b"                        <h3 className=\"text-lg font-semibold text-gray-900 mb-2\">\r\n                          Mes Quotas Visiteur\r\n                        </h3>\r\n                        <p className=\"text-sm text-gray-600\">\r\n                          Consultez vos limites et votre utilisation actuelle\r\n                        </p>",
        b"                        <h3 className=\"text-lg font-semibold text-gray-900 mb-2\">\r\n                          {t('visitor_settings.my_quotas_title')}\r\n                        </h3>\r\n                        <p className=\"text-sm text-gray-600\">\r\n                          {t('visitor_settings.my_quotas_desc')}\r\n                        </p>"
    ),
    # QuotaWidget label B2B
    (
        b'label="Rendez-vous B2B"',
        b"label={t('visitor_settings.quota_b2b')}"
    ),
    # Passez au Pass VIP title
    (
        b"                              <h4 className=\"font-medium text-gray-900 mb-1\">\r\n                                Passez au Pass VIP\r\n                              </h4>",
        b"                              <h4 className=\"font-medium text-gray-900 mb-1\">\r\n                                {t('visitor_settings.upgrade_title')}\r\n                              </h4>"
    ),
    # D\xc3\xa9bloquez description
    (
        b"                              <p className=\"text-sm text-gray-600 mb-3\">\r\n                                D\xc3\xa9bloquez 10 rendez-vous B2B et profitez de tous les avantages du salon\r\n                              </p>",
        b"                              <p className=\"text-sm text-gray-600 mb-3\">\r\n                                {t('visitor_settings.upgrade_desc')}\r\n                              </p>"
    ),
    # Upgrader maintenant button
    (
        b"                                Upgrader maintenant",
        b"                                {t('visitor_settings.upgrade_btn')}"
    ),
    # Pass VIP Actif
    (
        b"                              <h4 className=\"font-medium text-gray-900\">Pass VIP Actif</h4>\r\n                              <p className=\"text-sm text-gray-600\">\r\n                                Vous b\xc3\xa9n\xc3\xa9ficiez de 10 rendez-vous B2B et de tous les avantages premium\r\n                              </p>",
        b"                              <h4 className=\"font-medium text-gray-900\">{t('visitor_settings.vip_active')}</h4>\r\n                              <p className=\"text-sm text-gray-600\">\r\n                                {t('visitor_settings.vip_active_desc')}\r\n                              </p>"
    ),
    # Secteurs d'Intérêt
    (
        b"                      Secteurs d'Int\xc3\xa9r\xc3\xaat",
        b"                      {t('visitor_settings.sectors_title')}"
    ),
    # Objectifs de Visite
    (
        b"                      Objectifs de Visite",
        b"                      {t('visitor_settings.objectives_title')}"
    ),
    # Compétences & Expertises
    (
        b"                      Comp\xc3\xa9tences & Expertises",
        b"                      {t('visitor_settings.competencies_title')}"
    ),
    # Thématiques d'Intérêt
    (
        b"                      Th\xc3\xa9matiques d'Int\xc3\xa9r\xc3\xaat",
        b"                      {t('visitor_settings.thematics_title')}"
    ),
    # Préférences de Notification
    (
        b"                      Pr\xc3\xa9f\xc3\xa9rences de Notification",
        b"                      {t('visitor_settings.notifications_title')}"
    ),
    # Notifications Email
    (
        b"                          <h4 className=\"font-medium text-gray-900\">Notifications Email</h4>\r\n                          <p className=\"text-sm text-gray-600\">Recevez les notifications par email</p>",
        b"                          <h4 className=\"font-medium text-gray-900\">{t('visitor_settings.notif_email')}</h4>\r\n                          <p className=\"text-sm text-gray-600\">{t('visitor_settings.notif_email_desc')}</p>"
    ),
    # Notifications Push
    (
        b"                          <h4 className=\"font-medium text-gray-900\">Notifications Push</h4>\r\n                          <p className=\"text-sm text-gray-600\">Notifications sur votre appareil</p>",
        b"                          <h4 className=\"font-medium text-gray-900\">{t('visitor_settings.notif_push')}</h4>\r\n                          <p className=\"text-sm text-gray-600\">{t('visitor_settings.notif_push_desc')}</p>"
    ),
    # Notifications In-App
    (
        b"                          <h4 className=\"font-medium text-gray-900\">Notifications In-App</h4>\r\n                          <p className=\"text-sm text-gray-600\">Notifications dans l'application</p>",
        b"                          <h4 className=\"font-medium text-gray-900\">{t('visitor_settings.notif_inapp')}</h4>\r\n                          <p className=\"text-sm text-gray-600\">{t('visitor_settings.notif_inapp_desc')}</p>"
    ),
    # Paramètres de Confidentialité
    (
        b"                      Param\xc3\xa8tres de Confidentialit\xc3\xa9",
        b"                      {t('visitor_settings.privacy_title')}"
    ),
    # Visibilité du Profil
    (
        b"                        Visibilit\xc3\xa9 du Profil",
        b"                        {t('visitor_settings.visibility_title')}"
    ),
    # Public - Visible par tous
    (
        b"                            <span className=\"text-sm text-gray-700\">Public - Visible par tous les participants</span>",
        b"                            <span className=\"text-sm text-gray-700\">{t('visitor_settings.visibility_public')}</span>"
    ),
    # Connexions uniquement
    (
        b"                            <span className=\"text-sm text-gray-700\">Connexions uniquement - Visible par mes connexions</span>",
        b"                            <span className=\"text-sm text-gray-700\">{t('visitor_settings.visibility_connections')}</span>"
    ),
    # Privé
    (
        b"                            <span className=\"text-sm text-gray-700\">Priv\xc3\xa9 - Non visible dans les recherches</span>",
        b"                            <span className=\"text-sm text-gray-700\">{t('visitor_settings.visibility_private')}</span>"
    ),
    # Partage des Données
    (
        b"                        Partage des Donn\xc3\xa9es",
        b"                        {t('visitor_settings.data_sharing_title')}"
    ),
    # Permettre aux exposants
    (
        b"                            <span className=\"text-sm text-gray-700\">Permettre aux exposants de me contacter</span>",
        b"                            <span className=\"text-sm text-gray-700\">{t('visitor_settings.allow_exhibitors')}</span>"
    ),
    # Inclure dans les recommandations IA
    (
        b"                            <span className=\"text-sm text-gray-700\">Inclure dans les recommandations IA</span>",
        b"                            <span className=\"text-sm text-gray-700\">{t('visitor_settings.include_recommendations')}</span>"
    ),
    # Conformité RGPD
    (
        b"                        Conformit\xc3\xa9 RGPD",
        b"                        {t('visitor_settings.rgpd_title')}"
    ),
    # RGPD description
    (
        b"                        <p className=\"text-sm text-gray-600 mb-4\">\r\n                          Vos donn\xc3\xa9es sont prot\xc3\xa9g\xc3\xa9es selon le R\xc3\xa8glement G\xc3\xa9n\xc3\xa9ral sur la Protection des Donn\xc3\xa9es (RGPD).\r\n                        </p>",
        b"                        <p className=\"text-sm text-gray-600 mb-4\">\r\n                          {t('visitor_settings.rgpd_desc')}\r\n                        </p>"
    ),
    # Télécharger mes données button
    (
        b"                          T\xc3\xa9l\xc3\xa9charger mes donn\xc3\xa9es",
        b"                          {t('visitor_settings.download_data')}"
    ),
    # Supprimer mon compte button
    (
        b"                          Supprimer mon compte",
        b"                          {t('visitor_settings.delete_account')}"
    ),
]

def fix_visitor_settings():
    path = 'src/components/visitor/VisitorProfileSettings.tsx'
    with open(path, 'rb') as f:
        content = f.read()
    
    original_size = len(content)
    replaced = 0
    not_found = []
    
    for old, new in REPLACEMENTS:
        if old in content:
            content = content.replace(old, new, 1)
            replaced += 1
        else:
            not_found.append(repr(old[:60]))
    
    print(f'Replaced: {replaced}/{len(REPLACEMENTS)}')
    if not_found:
        print('NOT FOUND:')
        for nf in not_found:
            print(' ', nf)
    
    with open(path, 'wb') as f:
        f.write(content)
    print(f'Done. Size: {original_size} -> {len(content)}')

fix_visitor_settings()
