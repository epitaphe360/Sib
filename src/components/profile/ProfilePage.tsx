import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../lib/routes';
import { useTranslation } from '../../hooks/useTranslation';
import {
  User,
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Edit,
  Save,
  X,
  Camera,
  Linkedin,
  Target,
  Award,
  Calendar,
  Eye,
  ArrowLeft,
  Sparkles,
  ArrowRight,
  Lock,
  Shield,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import useAuthStore from '../../store/authStore';
import { motion } from 'framer-motion';
import { MoroccanPattern } from '../ui/MoroccanDecor';
import { supabase, isSupabaseReady } from '../../lib/supabase';

export default function ProfilePage() {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { user, updateProfile, isLoading } = useAuthStore();
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [profileStats, setProfileStats] = useState({ connections: 0, appointments: 0, messages: 0 });
  const [passwordData, setPasswordData] = useState({ current: '', newPassword: '', confirm: '' });

  // Charger les vraies statistiques depuis Supabase
  useEffect(() => {
    const loadStats = async () => {
      if (!user?.id || !isSupabaseReady() || !supabase) {return;}
      try {
        const [connectionsRes, appointmentsRes, messagesRes] = await Promise.all([
          supabase
            .from('connections')
            .select('id', { count: 'exact', head: true })
            .or(`user_id.eq.${user.id},connected_user_id.eq.${user.id}`),
          supabase
            .from('appointments')
            .select('id', { count: 'exact', head: true })
            .or(`visitor_id.eq.${user.id},exhibitor_id.eq.${user.id}`),
          supabase
            .from('messages')
            .select('id', { count: 'exact', head: true })
            .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        ]);
        setProfileStats({
          connections: connectionsRes.count ?? 0,
          appointments: appointmentsRes.count ?? 0,
          messages: messagesRes.count ?? 0
        });
      } catch (err) {
        console.error('Erreur chargement stats profil:', err);
      }
    };
    loadStats();
  }, [user?.id]);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleChangePassword = async () => {
    setPasswordError(null);
    setPasswordSuccess(false);

    if (!passwordData.newPassword || !passwordData.confirm) {
      setPasswordError(t('security.fields_required'));
      return;
    }
    if (passwordData.newPassword.length < 8) {
      setPasswordError(t('security.password_too_short'));
      return;
    }
    if (passwordData.newPassword !== passwordData.confirm) {
      setPasswordError(t('security.passwords_mismatch'));
      return;
    }

    setPasswordLoading(true);
    try {
      if (!isSupabaseReady() || !supabase) {
        setPasswordError('Supabase non configuré');
        setPasswordLoading(false);
        return;
      }

      // Vérifier le mot de passe actuel en re-signant
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: passwordData.current
      });
      if (signInError) {
        setPasswordError(t('security.current_password_wrong'));
        setPasswordLoading(false);
        return;
      }

      // Mettre à jour le mot de passe
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (updateError) {
        setPasswordError(updateError.message);
      } else {
        setPasswordSuccess(true);
        setPasswordData({ current: '', newPassword: '', confirm: '' });
        toast.success(t('security.password_changed'));
      }
    } catch (err: unknown) {
      setPasswordError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setPasswordLoading(false);
    }
  };

  const [formData, setFormData] = useState({
    firstName: user?.profile.firstName || '',
    lastName: user?.profile.lastName || '',
    company: user?.profile.company || '',
    position: user?.profile.position || '',
    phone: user?.profile.phone || '',
    country: user?.profile.country || '',
    linkedin: user?.profile.linkedin || '',
    website: user?.profile.website || '',
    bio: user?.profile.bio || '',
    interests: user?.profile.interests || [],
    objectives: user?.profile.objectives || []
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
      firstName: user?.profile.firstName || '',
      lastName: user?.profile.lastName || '',
      company: user?.profile.company || '',
      position: user?.profile.position || '',
      phone: user?.profile.phone || '',
      country: user?.profile.country || '',
      linkedin: user?.profile.linkedin || '',
      website: user?.profile.website || '',
      bio: user?.profile.bio || '',
      interests: user?.profile.interests || [],
      objectives: user?.profile.objectives || []
    });
    setIsEditing(false);
  };

  const availableInterests = [
    'Bâtiment Operations',
    'Digital Transformation',
    'Sustainability',
    'Building Technology',
    'Logistics',
    'Infrastructure',
    'Innovation',
    'Training & Education'
  ];

  const availableObjectives = [
    'Find new partners',
    'Showcase innovations',
    'Network with industry leaders',
    'Explore new markets',
    'Learn best practices',
    'Attend conferences',
    'Meet investors'
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Accès non autorisé
          </h3>
          <p className="text-gray-600">
            Veuillez vous connecter pour accéder à votre profil
          </p>
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
            <Link to={ROUTES.DASHBOARD}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour au Tableau de Bord
              </Button>
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Mon Profil
            </h1>
            <p className="text-gray-600">
              Gérez vos informations personnelles et professionnelles
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <Card className="text-center border-t-4 border-t-SIB-gold">
              <div className="relative">
                <div className="h-32 bg-gradient-to-r from-SIB-primary via-SIB-secondary to-SIB-accent rounded-t-lg relative overflow-hidden">
                   <MoroccanPattern className="opacity-10" color="white" scale={0.5} />
                </div>
                <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                  <div className="relative">
                    <div className="h-24 w-24 bg-white rounded-full flex items-center justify-center shadow-lg">
                      <User className="h-12 w-12 text-gray-400" />
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        ref={fileInputRef}
                        onChange={(e) => {
                          const file = (e.target as HTMLInputElement).files?.[0];
                          if (file) {
                            toast.success(`Photo sélectionnée : ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                        title={t('profile.change_photo')}
                        style={{ zIndex: 2 }}
                      >
                        <Camera className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-16 pb-6 px-6">
                <h2 className="text-xl font-bold text-gray-900 mb-1">
                  {user.profile.firstName} {user.profile.lastName}
                </h2>
                <p className="text-gray-600 mb-2">{user.profile.position}</p>
                <p className="text-sm text-gray-500 mb-4">{user.profile.company}</p>

                <div className="flex items-center justify-center space-x-2 mb-4">
                  <Badge variant="info" size="sm">
                    {user.type === 'exhibitor' ? 'Exposant' :
                     user.type === 'partner' ? 'Partenaire' :
                     user.type === 'admin' ? 'Administrateur' : 'Visiteur'}
                  </Badge>
                  {profileStats.connections > 0 && (
                    <Badge variant="success" size="sm">
                      <Eye className="h-3 w-3 mr-1" />
                      {profileStats.connections} connexions
                    </Badge>
                  )}
                </div>

                <div className="space-y-2">
                  {user.profile.linkedin && (
                    <a
                      href={user.profile.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center space-x-2 text-blue-600 hover:text-blue-700"
                    >
                      <Linkedin className="h-4 w-4" />
                      <span className="text-sm">LinkedIn</span>
                    </a>
                  )}

                  {user.profile.website && (
                    <a
                      href={user.profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center space-x-2 text-blue-600 hover:text-blue-700"
                    >
                      <Globe className="h-4 w-4" />
                      <span className="text-sm">Site web</span>
                    </a>
                  )}
                </div>
              </div>
            </Card>

            {/* Quick Stats */}
            <Card className="mt-6">
              <div className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Statistiques</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Connexions</span>
                    <span className="font-semibold text-gray-900">{profileStats.connections}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Rendez-vous</span>
                    <span className="font-semibold text-gray-900">{profileStats.appointments}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Messages</span>
                    <span className="font-semibold text-gray-900">{profileStats.messages}</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Matching Profile CTA */}
            <Card className="mt-6 bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  <h3 className="font-semibold text-purple-900">Matching IA</h3>
                </div>
                <p className="text-sm text-purple-700 mb-4">
                  Complétez votre profil de matching pour obtenir des recommandations personnalisées
                </p>
                <Link to={ROUTES.PROFILE_MATCHING}>
                  <Button
                    variant="default"
                    size="sm"
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Configurer mon matching
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </Card>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Personal Information */}
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Informations personnelles
                  </h3>
                  {!isEditing ? (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Modifier
                    </Button>
                  ) : (
                    <div className="flex space-x-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleCancel}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Annuler
                      </Button>
                      <Button
                        size="sm"
                        variant="default"
                        onClick={handleSave}
                        disabled={isLoading}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Sauvegarder
                      </Button>
                    </div>
                  )}
                </div>

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
                      <p className="text-gray-900">{user.profile.firstName}</p>
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
                      <p className="text-gray-900">{user.profile.lastName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <p className="text-gray-900">{user.email}</p>
                    </div>
                    {isEditing && (
                      <p className="text-xs text-gray-400 mt-1">
                        L'email ne peut pas être modifié ici. Contactez un administrateur pour changer d'adresse email.
                      </p>
                    )}
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
                        <p className="text-gray-900">{user.profile.phone}</p>
                      </div>
                    )}
                  </div>

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
                        <p className="text-gray-900">{user.profile.company}</p>
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
                      <p className="text-gray-900">{user.profile.position}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pays
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ex: MA, FR, ES..."
                      />
                    ) : (
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <p className="text-gray-900">{user.profile.country || 'Non renseigné'}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      LinkedIn
                    </label>
                    {isEditing ? (
                      <input
                        type="url"
                        value={formData.linkedin}
                        onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Linkedin className="h-4 w-4 text-gray-400" />
                        <p className="text-gray-900">{user.profile.linkedin || 'Non renseigné'}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Biographie
                  </label>
                  {isEditing ? (
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={t('profile.about_placeholder')}
                    />
                  ) : (
                    <p className="text-gray-900">{user.profile.bio || 'Aucune biographie renseignée'}</p>
                  )}
                </div>
              </div>
            </Card>

            {/* Interests */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  <Target className="h-5 w-5 inline mr-2" />
                  Centres d'intérêt
                </h3>

                {isEditing ? (
                  <div className="space-y-2">
                    {availableInterests.map((interest) => (
                      <label key={interest} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.interests.includes(interest)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                interests: [...formData.interests, interest]
                              });
                            } else {
                              setFormData({
                                ...formData,
                                interests: formData.interests.filter(i => i !== interest)
                              });
                            }
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">{interest}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {user?.profile?.interests?.map((interest) => (
                      <Badge key={interest} variant="info" size="sm">
                        {interest}
                      </Badge>
                    ))}
                    {(!user?.profile?.interests || user.profile.interests.length === 0) && (
                      <p className="text-gray-500 text-sm">Aucun centre d'intérêt renseigné</p>
                    )}
                  </div>
                )}
              </div>
            </Card>

            {/* Objectives */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  <Award className="h-5 w-5 inline mr-2" />
                  Objectifs SIB 2026
                </h3>

                {isEditing ? (
                  <div className="space-y-2">
                    {availableObjectives.map((objective) => (
                      <label key={objective} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.objectives.includes(objective)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                objectives: [...formData.objectives, objective]
                              });
                            } else {
                              setFormData({
                                ...formData,
                                objectives: formData.objectives.filter(o => o !== objective)
                              });
                            }
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">{objective}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {user?.profile?.objectives?.map((objective) => (
                      <div key={objective} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        <span className="text-sm text-gray-700">{objective}</span>
                      </div>
                    ))}
                    {(!user?.profile?.objectives || user.profile.objectives.length === 0) && (
                      <p className="text-gray-500 text-sm">Aucun objectif renseigné</p>
                    )}
                  </div>
                )}
              </div>
            </Card>

            {/* Security - Change Password */}
            <Card className="border-l-4 border-l-amber-500">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  <Shield className="h-5 w-5 inline mr-2 text-amber-600" />
                  {t('security.change_password')}
                </h3>
                <p className="text-sm text-gray-500 mb-6">{t('security.change_password_desc')}</p>

                {passwordSuccess && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
                    <CheckCircle className="h-5 w-5" />
                    <span className="text-sm font-medium">{t('security.password_changed')}</span>
                  </div>
                )}

                {passwordError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                    <AlertTriangle className="h-5 w-5" />
                    <span className="text-sm font-medium">{passwordError}</span>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Lock className="h-4 w-4 inline mr-1" />
                      {t('security.current_password')}
                    </label>
                    <input
                      type="password"
                      value={passwordData.current}
                      onChange={(e) => { setPasswordData({ ...passwordData, current: e.target.value }); setPasswordError(null); setPasswordSuccess(false); }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="••••••••"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Lock className="h-4 w-4 inline mr-1" />
                      {t('security.new_password')}
                    </label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => { setPasswordData({ ...passwordData, newPassword: e.target.value }); setPasswordError(null); setPasswordSuccess(false); }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder={t('security.new_password_placeholder')}
                    />
                    <p className="text-xs text-gray-400 mt-1">{t('security.password_requirements')}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Lock className="h-4 w-4 inline mr-1" />
                      {t('security.confirm_password')}
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirm}
                      onChange={(e) => { setPasswordData({ ...passwordData, confirm: e.target.value }); setPasswordError(null); setPasswordSuccess(false); }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder={t('security.confirm_password_placeholder')}
                    />
                  </div>

                  <Button
                    variant="default"
                    onClick={handleChangePassword}
                    disabled={passwordLoading || !passwordData.current || !passwordData.newPassword || !passwordData.confirm}
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    {passwordLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                        {t('common.loading')}
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        {t('security.change_password_btn')}
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            </Card>

            {/* Account Information */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  <Calendar className="h-5 w-5 inline mr-2" />
                  Informations du compte
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date d'inscription
                    </label>
                    <p className="text-gray-900">
                      {new Date(user.createdAt).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dernière mise à jour
                    </label>
                    <p className="text-gray-900">
                      {new Date(user.updatedAt).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type de compte
                    </label>
                    <Badge variant="info">
                      {user.type === 'exhibitor' ? 'Exposant' :
                       user.type === 'partner' ? 'Partenaire' :
                       user.type === 'admin' ? 'Administrateur' : 'Visiteur'}
                    </Badge>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Statut
                    </label>
                    <Badge variant="success">Compte validé</Badge>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
