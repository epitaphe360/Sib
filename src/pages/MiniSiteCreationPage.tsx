import MiniSiteWizard from '../components/minisite/MiniSiteWizard';
import { ROUTES } from '../lib/routes';
import { Card } from '../components/ui/Card';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';

export default function MiniSiteCreationPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12">
      <Card className="w-full max-w-2xl mx-auto p-8">
        <h1 className="text-2xl font-bold mb-6 text-center text-blue-900">{t('minisite.create.title')}</h1>
  <MiniSiteWizard onSuccess={() => navigate(ROUTES.EXHIBITOR_DASHBOARD)} />
      </Card>
    </div>
  );
}


