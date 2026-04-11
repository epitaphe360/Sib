import { Calendar, TrendingUp, Edit, LayoutDashboard } from 'lucide-react';
import { useTranslation } from '../../../hooks/useTranslation';

type Tab = 'overview' | 'profile' | 'networking' | 'analytics';

interface PartnerTabNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export function PartnerTabNav({ activeTab, onTabChange }: PartnerTabNavProps) {
  const { t } = useTranslation();
  const tabs = [
    { id: 'overview' as Tab, label: t('partner.tabs.overview'), icon: LayoutDashboard },
    { id: 'profile' as Tab, label: t('partner.tabs.profile'), icon: Edit },
    { id: 'networking' as Tab, label: t('partner.tabs.networking'), icon: Calendar },
    { id: 'analytics' as Tab, label: t('partner.tabs.analytics'), icon: TrendingUp },
  ];
  return (
    <div className="bg-white p-1.5 rounded-2xl shadow-md border border-gray-100 mb-8 flex flex-col md:flex-row gap-1 w-full">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex items-center justify-center md:justify-start gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-200 flex-1 ${
            activeTab === tab.id
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? 'text-white' : 'text-slate-400'}`} />
          {tab.label}
        </button>
      ))}
    </div>
  );
}
