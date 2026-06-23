import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ContentManagement from '../../components/admin/ContentManagement';
import { ROUTES } from '../../lib/routes';
import { useTranslation } from '../../hooks/useTranslation';

export default function ContentManagementPage() {
  const { t } = useTranslation();
  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Link to={ROUTES.ADMIN_DASHBOARD} className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour au Tableau de Bord
        </Link>
      </div>
      <ContentManagement />
    </div>
  );
}



