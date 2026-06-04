import { memo } from 'react';
import useAuthStore from '../../store/authStore';
import AdminDashboard from './AdminDashboard';
import ExhibitorDashboard from './ExhibitorDashboard';
import PartnerDashboard from './PartnerDashboard';
import VisitorDashboard from '../visitor/VisitorDashboard';
import { useTranslation } from '../../hooks/useTranslation';

const FallbackCard: React.FC<{ title: string; description: string }> = ({ title, description }) => (
  <div className="min-h-screen flex items-center justify-center px-6 bg-white dark:bg-neutral-950">
    <div className="text-center max-w-xl rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-8 shadow-sm">
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2 tracking-tight">
        {title}
      </h1>
      <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
        {description}
      </p>
    </div>
  </div>
);

export default memo(function DashboardPage() {
  const { user } = useAuthStore();
  const { t } = useTranslation();

  if (!user) {
    return <FallbackCard title={t('common.error_401')} description={t('common.error_401_desc')} />;
  }

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
        <FallbackCard
          title={t('errors.unknown_user_type', { type: user.type })}
          description={t('errors.contact_support_resolve', { email: user.email })}
        />
      );
  }
});
