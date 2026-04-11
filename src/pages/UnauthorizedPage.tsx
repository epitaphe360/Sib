import { Link } from 'react-router-dom';
import { ROUTES } from '../lib/routes';
import { useTranslation } from '../hooks/useTranslation';

export default function UnauthorizedPage() {
  const { t } = useTranslation();
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
      <h1 className="text-3xl font-bold mb-2">{t('common.error_401')}</h1>
      <p className="text-gray-600 mb-6">{t('common.error_401_desc')}</p>
      <Link to={ROUTES.LOGIN} className="text-blue-600 hover:underline">{t('auth.go_login')}</Link>
    </div>
  );
}


