import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ROUTES } from '../../lib/routes';
import { CmsAdminHub } from '../../components/dashboard/admin/CmsAdminHub';

export default function ContentManagementPage() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="max-w-container mx-auto px-6 lg:px-8 pt-6 pb-10">
        <Link
          to={ROUTES.ADMIN_DASHBOARD}
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour au Tableau de Bord
        </Link>
        <CmsAdminHub />
      </div>
    </div>
  );
}
