import { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../lib/routes';
import {
  Users,
  ArrowLeft,
  Save,
  AlertCircle,
  Mail,
  Building2,
  Shield,
  Crown,
  User as UserIcon
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { apiService } from '../../services/apiService';

interface FormErrors {
  email?: string;
  name?: string;
  password?: string;
  type?: string;
  general?: string;
}

export default function CreateUserPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [userData, setUserData] = useState({
    email: '',
    name: '',
    password: '',
    type: '',
    status: 'active',
    company: '',
    phone: '',
    profile: {
      firstName: '',
      lastName: '',
      company: '',
      phone: ''
    }
  });

  const userTypes = [
    { value: 'visitor', label: 'Visiteur', icon: UserIcon },
    { value: 'exhibitor', label: 'Exposant', icon: Building2 },
    { value: 'partner', label: 'Partenaire', icon: Crown },
    { value: 'admin', label: 'Administrateur', icon: Shield }
  ];

  const handleChange = (field: string, value: string | boolean | undefined) => {
    setUserData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};
    
    if (!userData.email.trim()) {
      newErrors.email = 'L\'email est requis.';
    } else if (!validateEmail(userData.email)) {
      newErrors.email = 'Format d\'email invalide.';
    }
    
    if (!userData.name.trim()) {
      newErrors.name = 'Le nom est requis.';
    }
    
    if (!userData.password.trim()) {
      newErrors.password = 'Le mot de passe est requis.';
    } else if (userData.password.length < 8) {
      newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères.';
    }
    
    if (!userData.type) {
      newErrors.type = 'Le type d\'utilisateur est requis.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      // Prepare profile data
      const [firstName, ...lastNameParts] = userData.name.split(' ');
      const lastName = lastNameParts.join(' ');

      const finalUserData = {
        email: userData.email,
        password: userData.password,
        type: userData.type,
        status: userData.status,
        name: userData.name,
        profile: {
          firstName: firstName || userData.name,
          lastName: lastName || '',
          company: userData.company,
          phone: userData.phone
        }
      };

      await apiService.create('users', finalUserData);
      navigate(ROUTES.ADMIN_USERS);
    } catch (error: unknown) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      setErrors({ 
        general: error instanceof Error ? error.message : String(error) || 'Une erreur est survenue. Veuillez réessayer.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link to={ROUTES.ADMIN_USERS}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Créer un Utilisateur</h1>
              <p className="text-gray-600 mt-2">
                Ajoutez un nouveau compte utilisateur au système SIB
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.general && (
            <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center">
              <AlertCircle className="h-5 w-5 mr-3" />
              <span>{errors.general}</span>
            </div>
          )}

          {/* Informations de base */}
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Users className="h-5 w-5 mr-2 text-blue-600" />
                Informations de Base
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom Complet *
                  </label>
                  <input
                    type="text"
                    required
                    value={userData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className={`w-full px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 ${errors.name ? 'focus:ring-red-500' : 'focus:ring-blue-500'}`}
                    placeholder="Ex: Jean Dupont"
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={userData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      className={`w-full pl-10 pr-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 ${errors.email ? 'focus:ring-red-500' : 'focus:ring-blue-500'}`}
                      placeholder="exemple@email.com"
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mot de Passe *
                  </label>
                  <input
                    type="password"
                    required
                    value={userData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    className={`w-full px-3 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 ${errors.password ? 'focus:ring-red-500' : 'focus:ring-blue-500'}`}
                    placeholder="Minimum 8 caractères"
                  />
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type d'Utilisateur *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {userTypes.map(type => {
                      const Icon = type.icon;
                      return (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => handleChange('type', type.value)}
                          className={`p-4 border-2 rounded-lg flex items-center space-x-3 transition-all ${
                            userData.type === type.value
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Icon className={`h-5 w-5 ${userData.type === type.value ? 'text-blue-600' : 'text-gray-400'}`} />
                          <span className={`font-medium ${userData.type === type.value ? 'text-blue-900' : 'text-gray-700'}`}>
                            {type.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type}</p>}
                </div>
              </div>
            </div>
          </Card>

          {/* Informations complémentaires */}
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Building2 className="h-5 w-5 mr-2 text-indigo-600" />
                Informations Complémentaires
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Entreprise
                  </label>
                  <input
                    type="text"
                    value={userData.company}
                    onChange={(e) => handleChange('company', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nom de l'entreprise"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={userData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+33 6 12 34 56 78"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Statut
                </label>
                <select
                  value={userData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Actif</option>
                  <option value="inactive">Inactif</option>
                  <option value="pending">En attente</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <Link to={ROUTES.ADMIN_USERS}>
              <Button variant="outline" type="button">
                Annuler
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Création en cours...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Créer l'Utilisateur
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}




