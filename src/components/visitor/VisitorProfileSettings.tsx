import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../lib/routes';
import {
  User,
  Building2,
  Mail,
  Phone,
  MapPin,
  Edit,
  Save,
  X,
  Camera,
  Target,
  Award,
  Bell,
  Shield,
  ArrowLeft,
  Calendar,
  CheckCircle
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useVisitorStore } from '../../store/visitorStore';
import { motion } from 'framer-motion';
import { LevelBadge, QuotaWidget } from '../common/QuotaWidget';
import { getVisitorQuota } from '../../config/quotas';
import useAuthStore from '../../store/authStore';
import { supabase, isSupabaseReady } from '../../lib/supabase';

export default function VisitorProfileSettings() {
  const { visitorProfile, updateProfile, updateNotificationPreferences, isLoading, fetchVisitorData } = useVisitorStore();
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [activeSection, setActiveSection] = useState<'profile' | 'interests' | 'notifications' | 'privacy' | 'quotas'>('profile');
  const [meetingsUsed, setMeetingsUsed] = useState(0);

  // Charger les données du visiteur au montage du composant
  useEffect(() => {
    if (user && !visitorProfile) {
      fetchVisitorData();
    }
  }, [user, visitorProfile, fetchVisitorData]);

  // Charger l'utilisation du quota depuis daily_quotas
  useEffect(() => {
    const loadQuota = async () => {
      if (!isSupabaseReady() || !supabase || !user?.id) return;
      try {
        const today = new Date().toISOString().split('T')[0];
        const { data } = await supabase
          .from('daily_quotas')
          .select('meetings_used')
          .eq('user_id', user.id)
          .eq('quota_date', today)
          .maybeSingle();
        if (data) setMeetingsUsed(data.meetings_used ?? 0);
      } catch {
        // Quiet fail — quota stays at 0
      }
    };
    loadQuota();
  }, [user?.id]);

  const [formData, setFormData] = useState({
    firstName: visitorProfile?.firstName || '',
    lastName: visitorProfile?.lastName || '',
    visitorType: visitorProfile?.visitorType || 'individual',
    company: visitorProfile?.company || '',
    position: visitorProfile?.position || '',
    professionalStatus: visitorProfile?.professionalStatus || '',
    businessSector: visitorProfile?.businessSector || '',
    phone: visitorProfile?.phone || '',
    country: visitorProfile?.country || '',
    sectorsOfInterest: visitorProfile?.sectorsOfInterest || [],
    visitObjectives: visitorProfile?.visitObjectives || [],
    competencies: visitorProfile?.competencies || [],
    thematicInterests: visitorProfile?.thematicInterests || []
  });

  const handleSave = async () => {
    try {
      await updateProfile(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: visitorProfile?.firstName || '',
      lastName: visitorProfile?.lastName || '',
      visitorType: visitorProfile?.visitorType || 'individual',
      company: visitorProfile?.company || '',
      position: visitorProfile?.position || '',
      professionalStatus: visitorProfile?.professionalStatus || '',
      businessSector: visitorProfile?.businessSector || '',
      phone: visitorProfile?.phone || '',
      country: visitorProfile?.country || '',
      sectorsOfInterest: visitorProfile?.sectorsOfInterest || [],
      visitObjectives: visitorProfile?.visitObjectives || [],
      competencies: visitorProfile?.competencies || [],
      thematicInterests: visitorProfile?.thematicInterests || []
    });
    setIsEditing(false);
  };

  const availableSectors = [
    'Port Operations',
    'Digital Transformation',
    'Sustainability',
    'Building Technology',
    'Logistics',
    'Infrastructure',
    'Equipment Manufacturing',
    'Consulting',
    'Research & Development',
    'Government & Regulation'
  ];

  const availableObjectives = [
    'Recherche de fournisseurs',
    'Veille technologique',
    'Opportunités de partenariat',
    'Formation continue',
    'Opportunités d\'emploi',
    'Investissements',
    'Benchmarking',
    'Networking professionnel'
  ];

  const availableCompetencies = [
    'Gestion de projet bâtiment',
    'Analyse de performance',
    'Consulting stratégique',
    'Transformation digitale',
    'Gestion des opérations',
    'Développement durable',
    'Innovation technologique',
    'Relations internationales'
  ];

  const availableThematics = [
    'Technologies BTP',
    'Énergies renouvelables',
    'Logistique bâtiment',
    'Innovation digitale',
    'Défense navale',
    'Automatisation',
    'Intelligence artificielle',
    'BIM & PropTech'
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Chargement du profil
          </h3>
          <p className="text-gray-600">
            Veuillez patienter...
          </p>
        </div>
      </div>
    );
  }

  if (!visitorProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Profil en cours de création
          </h3>
          <p className="text-gray-600 mb-4">
            Votre profil est en cours d'initialisation. Veuillez rafraîchir la page dans quelques instants.
          </p>
          <Button onClick={() => window.location.reload()}>
            Rafraîchir la page
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          {/* Bouton de retour */}
          <div className="mb-4">
            <Link to={ROUTES.VISITOR_DASHBOARD}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour au Tableau de Bord Visiteur
              </Button>
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Paramètres du Profil Visiteur
            </h1>
            <p className="text-gray-600">
              Personnalisez votre profil et vos préférences pour optimiser votre expérience SIB
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Navigation Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <div className="p-4">
                <nav className="space-y-2">
                  {[
                    { id: 'profile', label: 'Profil Personnel', icon: User },
                    { id: 'quotas', label: 'Mes Quotas', icon: Award },
                    { id: 'interests', label: 'Intérêts & Objectifs', icon: Target },
                    { id: 'notifications', label: 'Notifications', icon: Bell },
                    { id: 'privacy', label: 'Confidentialité', icon: Shield }
                  ].map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id as 'profile' | 'interests' | 'notifications' | 'privacy' | 'quotas')}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeSection === section.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <section.icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{section.label}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Profil Personnel */}
            {activeSection === 'profile' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Card>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Informations Personnelles
                      </h3>
                      {!isEditing ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsEditing(true)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Modifier
                        </Button>
                      ) : (
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCancel}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Annuler
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleSave}
                            disabled={isLoading}
                          >
                            <Save className="h-4 w-4 mr-2" />
                            Sauvegarder
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Type de Visiteur */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Type de visiteur
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="visitorType"
                            value="individual"
                            checked={formData.visitorType === 'individual'}
                            onChange={(e) => setFormData({ ...formData, visitorType: e.target.value as 'individual' | 'freelancer' | 'company' })}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                            aria-label="Particulier"
                          />
                          <span className="text-sm text-gray-700">Particulier</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="visitorType"
                            value="freelancer"
                            checked={formData.visitorType === 'freelancer'}
                            onChange={(e) => setFormData({ ...formData, visitorType: e.target.value as 'individual' | 'freelancer' | 'company' })}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                            aria-label="Travailleur autonome"
                          />
                          <span className="text-sm text-gray-700">Travailleur autonome</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="visitorType"
                            value="company"
                            checked={formData.visitorType === 'company'}
                            onChange={(e) => setFormData({ ...formData, visitorType: e.target.value as 'individual' | 'freelancer' | 'company' })}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                            aria-label="Entreprise"
                          />
                          <span className="text-sm text-gray-700">Entreprise</span>
                        </label>
                      </div>
                    </div>

                    {/* Photo de Profil */}
                    <div className="flex items-center space-x-6 mb-8">
                      <div className="relative">
                        <div className="h-20 w-20 bg-gray-300 rounded-full flex items-center justify-center">
                          {visitorProfile.avatar ? (
                            <img
                              src={visitorProfile.avatar}
                              alt="Profile"
                              className="h-20 w-20 rounded-full object-cover"
                            />
                          ) : (
                            <User className="h-10 w-10 text-gray-600" />
                          )}
                        </div>
                        <button aria-label="Upload photo" className="absolute bottom-0 right-0 bg-blue-600 text-white p-1.5 rounded-full shadow-lg hover:bg-blue-700 transition-colors">
                          <Camera className="h-3 w-3" />
                        </button>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900">Photo de profil</h4>
                        <p className="text-sm text-gray-600">
                          Ajoutez une photo pour personnaliser votre profil
                        </p>
                      </div>
                    </div>

                    {/* Informations de Base */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Prénom
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <p className="text-gray-900">{visitorProfile.firstName}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nom
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <p className="text-gray-900">{visitorProfile.lastName}</p>
                        )}
                      </div>

                      {/* Champs conditionnels selon le type de visiteur */}
                      {formData.visitorType === 'company' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Entreprise
                            </label>
                            {isEditing ? (
                              <input
                                type="text"
                                value={formData.company}
                                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            ) : (
                              <div className="flex items-center space-x-2">
                                <Building2 className="h-4 w-4 text-gray-400" />
                                <p className="text-gray-900">{visitorProfile.company}</p>
                              </div>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Poste
                            </label>
                            {isEditing ? (
                              <input
                                type="text"
                                value={formData.position}
                                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            ) : (
                              <p className="text-gray-900">{visitorProfile.position}</p>
                            )}
                          </div>
                        </>
                      )}

                      {formData.visitorType === 'freelancer' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Statut professionnel
                            </label>
                            {isEditing ? (
                              <input
                                type="text"
                                value={formData.professionalStatus}
                                onChange={(e) => setFormData({ ...formData, professionalStatus: e.target.value })}
                                placeholder="Ex: Consultant indépendant"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            ) : (
                              <p className="text-gray-900">{visitorProfile.professionalStatus || 'Non spécifié'}</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Secteur d'activité
                            </label>
                            {isEditing ? (
                              <input
                                type="text"
                                value={formData.businessSector}
                                onChange={(e) => setFormData({ ...formData, businessSector: e.target.value })}
                                placeholder="Ex: Consulting construction"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            ) : (
                              <p className="text-gray-900">{visitorProfile.businessSector || 'Non spécifié'}</p>
                            )}
                          </div>
                        </>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <p className="text-gray-900">{visitorProfile.email}</p>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Téléphone
                        </label>
                        {isEditing ? (
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <p className="text-gray-900">{visitorProfile.phone}</p>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Pays
                        </label>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <p className="text-gray-900">{visitorProfile.country}</p>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Niveau Visiteur
                        </label>
                        <LevelBadge
                          level={user?.visitor_level || 'free'}
                          type="visitor"
                          size="md"
                        />
                        {user?.visitor_level === 'free' && (
                          <Link to={ROUTES.VISITOR_UPGRADE} className="block mt-2">
                            <Button variant="outline" size="sm">
                              Passer au Pass VIP
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Mes Quotas */}
            {activeSection === 'quotas' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Card>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Mes Quotas Visiteur
                        </h3>
                        <p className="text-sm text-gray-600">
                          Consultez vos limites et votre utilisation actuelle
                        </p>
                      </div>
                      <LevelBadge
                        level={user?.visitor_level || 'free'}
                        type="visitor"
                        size="lg"
                      />
                    </div>

                    <div className="space-y-4">
                      {/* Quota Rendez-vous B2B */}
                      <QuotaWidget
                        label="Rendez-vous B2B"
                        current={meetingsUsed}
                        limit={getVisitorQuota(user?.visitor_level || 'free')}
                        icon={<Calendar className="h-4 w-4 text-gray-400" />}
                        showUpgrade={user?.visitor_level === 'free'}
                        upgradeLink={ROUTES.VISITOR_UPGRADE}
                      />

                      {user?.visitor_level === 'free' && (
                        <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-start space-x-3">
                            <Award className="h-5 w-5 text-yellow-600 mt-0.5" />
                            <div>
                              <h4 className="font-medium text-gray-900 mb-1">
                                Passez au Pass VIP
                              </h4>
                              <p className="text-sm text-gray-600 mb-3">
                                Débloquez 10 rendez-vous B2B et profitez de tous les avantages du salon
                              </p>
                              <Link to={ROUTES.VISITOR_UPGRADE}>
                                <Button size="sm" className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
                                  Upgrader maintenant
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      )}

                      {user?.visitor_level === 'premium' && (
                        <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <div>
                              <h4 className="font-medium text-gray-900">Pass VIP Actif</h4>
                              <p className="text-sm text-gray-600">
                                Vous bénéficiez de 10 rendez-vous B2B et de tous les avantages premium
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Intérêts & Objectifs */}
            {activeSection === 'interests' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* Secteurs d'Intérêt */}
                <Card>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      <Target className="h-5 w-5 inline mr-2" />
                      Secteurs d'Intérêt
                    </h3>

                    {isEditing ? (
                      <div className="grid grid-cols-2 gap-2">
                        {availableSectors.map((sector) => (
                          <label key={sector} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={formData.sectorsOfInterest.includes(sector)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData({
                                    ...formData,
                                    sectorsOfInterest: [...formData.sectorsOfInterest, sector]
                                  });
                                } else {
                                  setFormData({
                                    ...formData,
                                    sectorsOfInterest: formData.sectorsOfInterest.filter(s => s !== sector)
                                  });
                                }
                              }}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              aria-label={sector}
                            />
                            <span className="text-sm text-gray-700">{sector}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {visitorProfile.sectorsOfInterest.map((sector) => (
                          <Badge key={sector} variant="info" size="sm">
                            {sector}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>

                {/* Objectifs de Visite */}
                <Card>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      <Award className="h-5 w-5 inline mr-2" />
                      Objectifs de Visite
                    </h3>

                    {isEditing ? (
                      <div className="grid grid-cols-1 gap-2">
                        {availableObjectives.map((objective) => (
                          <label key={objective} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={formData.visitObjectives.includes(objective)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData({
                                    ...formData,
                                    visitObjectives: [...formData.visitObjectives, objective]
                                  });
                                } else {
                                  setFormData({
                                    ...formData,
                                    visitObjectives: formData.visitObjectives.filter(o => o !== objective)
                                  });
                                }
                              }}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              aria-label={objective}
                            />
                            <span className="text-sm text-gray-700">{objective}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {visitorProfile.visitObjectives.map((objective) => (
                          <div key={objective} className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            <span className="text-sm text-gray-700">{objective}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>

                {/* Compétences */}
                <Card>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Compétences & Expertises
                    </h3>

                    {isEditing ? (
                      <div className="grid grid-cols-1 gap-2">
                        {availableCompetencies.map((competency) => (
                          <label key={competency} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={formData.competencies.includes(competency)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData({
                                    ...formData,
                                    competencies: [...formData.competencies, competency]
                                  });
                                } else {
                                  setFormData({
                                    ...formData,
                                    competencies: formData.competencies.filter(c => c !== competency)
                                  });
                                }
                              }}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              aria-label={competency}
                            />
                            <span className="text-sm text-gray-700">{competency}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {visitorProfile.competencies.map((competency) => (
                          <Badge key={competency} variant="success" size="sm">
                            {competency}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>

                {/* Thématiques d'Intérêt */}
                <Card>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Thématiques d'Intérêt
                    </h3>

                    {isEditing ? (
                      <div className="grid grid-cols-2 gap-2">
                        {availableThematics.map((thematic) => (
                          <label key={thematic} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={formData.thematicInterests.includes(thematic)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData({
                                    ...formData,
                                    thematicInterests: [...formData.thematicInterests, thematic]
                                  });
                                } else {
                                  setFormData({
                                    ...formData,
                                    thematicInterests: formData.thematicInterests.filter(t => t !== thematic)
                                  });
                                }
                              }}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              aria-label={thematic}
                            />
                            <span className="text-sm text-gray-700">{thematic}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {visitorProfile.thematicInterests.map((thematic) => (
                          <Badge key={thematic} variant="warning" size="sm">
                            {thematic}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Notifications */}
            {activeSection === 'notifications' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Card>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">
                      <Bell className="h-5 w-5 inline mr-2" />
                      Préférences de Notification
                    </h3>

                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">Notifications Email</h4>
                          <p className="text-sm text-gray-600">Recevez les notifications par email</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={visitorProfile.notificationPreferences.email}
                            onChange={(e) => updateNotificationPreferences({ email: e.target.checked })}
                            className="sr-only peer"
                            aria-label="Notifications Email"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">Notifications Push</h4>
                          <p className="text-sm text-gray-600">Notifications sur votre appareil</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={visitorProfile.notificationPreferences.push}
                            onChange={(e) => updateNotificationPreferences({ push: e.target.checked })}
                            className="sr-only peer"
                            aria-label="Notifications Push"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">Notifications In-App</h4>
                          <p className="text-sm text-gray-600">Notifications dans l'application</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={visitorProfile.notificationPreferences.inApp}
                            onChange={(e) => updateNotificationPreferences({ inApp: e.target.checked })}
                            className="sr-only peer"
                            aria-label="Notifications In-App"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Confidentialité */}
            {activeSection === 'privacy' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Card>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">
                      <Shield className="h-5 w-5 inline mr-2" />
                      Paramètres de Confidentialité
                    </h3>

                    <div className="space-y-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">
                          Visibilité du Profil
                        </h4>
                        <div className="space-y-3">
                          <label className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name="profileVisibility"
                              value="public"
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                              aria-label="Public - Visible par tous les participants"
                            />
                            <span className="text-sm text-gray-700">Public - Visible par tous les participants</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name="profileVisibility"
                              value="connections"
                              defaultChecked
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                              aria-label="Connexions uniquement - Visible par mes connexions"
                            />
                            <span className="text-sm text-gray-700">Connexions uniquement - Visible par mes connexions</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name="profileVisibility"
                              value="private"
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                              aria-label="Privé - Non visible dans les recherches"
                            />
                            <span className="text-sm text-gray-700">Privé - Non visible dans les recherches</span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">
                          Partage des Données
                        </h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Permettre aux exposants de me contacter</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" defaultChecked className="sr-only peer" aria-label="Permettre aux exposants de me contacter" />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Inclure dans les recommandations IA</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" defaultChecked className="sr-only peer" aria-label="Inclure dans les recommandations IA" />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-200">
                        <h4 className="font-medium text-gray-900 mb-3">
                          Conformité RGPD
                        </h4>
                        <p className="text-sm text-gray-600 mb-4">
                          Vos données sont protégées selon le Règlement Général sur la Protection des Données (RGPD).
                        </p>
                        <div className="flex space-x-3">
                          <Button variant="outline" size="sm">
                            Télécharger mes données
                          </Button>
                          <Button variant="outline" size="sm">
                            Supprimer mon compte
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};