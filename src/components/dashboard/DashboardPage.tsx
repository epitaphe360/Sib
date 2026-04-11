import { memo } from 'react';
import useAuthStore from '../../store/authStore';
import AdminDashboard from './AdminDashboard';
import ExhibitorDashboard from './ExhibitorDashboard';
import PartnerDashboard from './PartnerDashboard';
import VisitorDashboard from '../visitor/VisitorDashboard';
import { useTranslation } from '../../hooks/useTranslation';

// OPTIMIZATION: Memoized DashboardPage to prevent re-renders
export default memo(function DashboardPage() {
  const { user } = useAuthStore();
  const { t } = useTranslation();

  // Vérification de l'authentification
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {t('common.error_401')}
          </h1>
          <p className="text-gray-600">
            {t('common.error_401_desc')}
          </p>
        </div>
      </div>
    );
  }

  // Debug: Afficher le type d'utilisateur pour vérification (dev uniquement)
  // Bloc de debug supprimé

  // Redirection vers le tableau de bord spécifique selon le type d'utilisateur
  switch (user.type) {
    case 'admin':
      return <AdminDashboard />;
    case 'exhibitor':
      return <ExhibitorDashboard />;
    case 'partner':
      return <PartnerDashboard />;
    case 'visitor':
      return <VisitorDashboard />;
    default:
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {t('errors.unknown_user_type', { type: user.type })}
            </h1>
            <p className="text-gray-600">
              {t('errors.contact_support_resolve', { email: user.email })}
            </p>
          </div>
        </div>
      );
  }
});