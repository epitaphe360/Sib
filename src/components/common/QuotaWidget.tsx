import { useMemo } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Progress } from '../ui/Progress';
import { Badge } from '../ui/Badge';
import { AlertCircle, CheckCircle, Crown, TrendingUp } from 'lucide-react';
import { Card } from '../ui/Card';

interface QuotaWidgetProps {
  label: string;
  current: number;
  limit: number;
  icon?: React.ReactNode;
  showUpgrade?: boolean;
  upgradeLink?: string;
  type?: 'default' | 'success' | 'warning' | 'error';
}

export function QuotaWidget({
  label,
  current,
  limit,
  icon,
  showUpgrade = false,
  upgradeLink,
  type = 'default'
}: QuotaWidgetProps) {
  const { t } = useTranslation();
  const isUnlimited = limit === 999999 || limit === -1;
  const percentage = isUnlimited ? 0 : Math.min((current / limit) * 100, 100);
  const remaining = isUnlimited ? Infinity : Math.max(0, limit - current);

  const status = useMemo(() => {
    if (isUnlimited) {return 'unlimited';}
    if (percentage >= 100) {return 'exceeded';}
    if (percentage >= 80) {return 'warning';}
    if (percentage >= 50) {return 'moderate';}
    return 'good';
  }, [percentage, isUnlimited]);

  const getStatusColor = () => {
    switch (status) {
      case 'unlimited': return 'text-purple-600';
      case 'exceeded': return 'text-red-600';
      case 'warning': return 'text-orange-600';
      case 'moderate': return 'text-yellow-600';
      default: return 'text-green-600';
    }
  };

  const getProgressColor = () => {
    switch (status) {
      case 'unlimited': return 'bg-purple-500';
      case 'exceeded': return 'bg-red-500';
      case 'warning': return 'bg-orange-500';
      case 'moderate': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  const getStatusIcon = () => {
    if (isUnlimited) {return <Crown className="h-4 w-4 text-purple-600" />;}
    if (status === 'exceeded') {return <AlertCircle className="h-4 w-4 text-red-600" />;}
    if (status === 'warning') {return <AlertCircle className="h-4 w-4 text-orange-600" />;}
    return <CheckCircle className="h-4 w-4 text-green-600" />;
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {icon}
          <span className="text-sm font-medium text-gray-700">{label}</span>
        </div>
        {getStatusIcon()}
      </div>

      {!isUnlimited && (
        <div className="space-y-1">
          <Progress value={percentage} className={getProgressColor()} />
          <div className="flex items-center justify-between text-xs">
            <span className={getStatusColor()}>
              {current} / {limit}
            </span>
            <span className="text-gray-500">
              {remaining === Infinity
                ? t('quota.remaining_unlimited')
                : remaining > 1
                  ? t('quota.remaining_plural', { count: remaining })
                  : t('quota.remaining', { count: remaining })
              }
            </span>
          </div>
        </div>
      )}

      {isUnlimited && (
        <div className="flex items-center space-x-1 text-xs text-purple-600">
          <Crown className="h-3 w-3" />
          <span className="font-medium">{t('quota.unlimited')}</span>
        </div>
      )}

      {showUpgrade && status === 'exceeded' && upgradeLink && (
        <a href={upgradeLink} className="block">
          <div className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-700 cursor-pointer">
            <TrendingUp className="h-3 w-3" />
            <span>{t('quota.upgrade_for_more')}</span>
          </div>
        </a>
      )}
    </div>
  );
}

interface LevelBadgeProps {
  level: string;
  type: 'visitor' | 'partner' | 'exhibitor';
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function LevelBadge({ level, type, showIcon = true, size = 'md' }: LevelBadgeProps) {
  const { t } = useTranslation();

  const getConfig = () => {
    if (type === 'visitor') {
      return level === 'premium' || level === 'vip'
        ? { label: 'VIP Pass', color: 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white', icon: '👑' }
        : { label: 'FREE Pass', color: 'bg-gray-500 text-white', icon: '🎫' };
    }

    if (type === 'partner') {
      const configs: Record<string, any> = {
        organizer: { label: 'Organisateurs', color: 'bg-gradient-to-r from-yellow-600 to-yellow-800 text-white', icon: '🏛️' },
        co_organizer: { label: 'Co-organisateurs', color: 'bg-gradient-to-r from-amber-600 to-amber-800 text-white', icon: '🤝' },
        official_sponsor: { label: 'Sponsor Officiel', color: 'bg-gradient-to-r from-blue-600 to-blue-800 text-white', icon: '⭐' },
        delegated_organizer: { label: 'Organisateur Délégué', color: 'bg-gradient-to-r from-green-600 to-green-800 text-white', icon: '📋' },
        partner: { label: 'Nos Partenaires', color: 'bg-gradient-to-r from-purple-600 to-purple-800 text-white', icon: '🌐' },
        press_partner: { label: 'Nos Partenaires Presse', color: 'bg-gradient-to-r from-red-600 to-red-800 text-white', icon: '📰' }
      };
      return configs[level] || configs.partner;
    }

    if (type === 'exhibitor') {
      const configs: Record<string, any> = {
        basic_9: { label: t('exhibitor_levels.basic_9'), color: 'bg-gradient-to-r from-slate-400 to-slate-600 text-white', icon: '🏢' },
        standard_18: { label: t('exhibitor_levels.standard_18'), color: 'bg-gradient-to-r from-blue-400 to-blue-600 text-white', icon: '🏪' },
        premium_36: { label: t('exhibitor_levels.premium_36'), color: 'bg-gradient-to-r from-orange-400 to-orange-600 text-white', icon: '🏬' },
        elite_54plus: { label: t('exhibitor_levels.elite_54plus'), color: 'bg-gradient-to-r from-purple-500 to-purple-700 text-white', icon: '🏛️' }
      };
      return configs[level] || configs.basic_9;
    }

    return { label: level, color: 'bg-gray-500 text-white', icon: '🎫' };
  };

  const config = getConfig();
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <div
      className={`inline-flex items-center space-x-1 rounded-full font-semibold ${config.color} ${sizeClasses[size]}`}
      data-testid="level-badge"
      data-level={level}
      data-type={type}
    >
      {showIcon && <span>{config.icon}</span>}
      <span>{config.label}</span>
    </div>
  );
}

interface QuotaSummaryCardProps {
  title: string;
  level: string;
  type: 'visitor' | 'partner' | 'exhibitor';
  quotas: Array<{
    label: string;
    current: number;
    limit: number;
    icon?: React.ReactNode;
  }>;
  upgradeLink?: string;
}

export function QuotaSummaryCard({ title, level, type, quotas, upgradeLink }: QuotaSummaryCardProps) {
  const allQuotasOk = quotas.every(q => q.limit === 999999 || q.current < q.limit);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <LevelBadge level={level} type={type} />
      </div>

      <div className="space-y-4">
        {quotas.map((quota) => (
          <QuotaWidget
            key={quota.label}
            label={quota.label}
            current={quota.current}
            limit={quota.limit}
            icon={quota.icon}
            showUpgrade={!allQuotasOk}
            upgradeLink={upgradeLink}
          />
        ))}
      </div>

      {!allQuotasOk && upgradeLink && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <a href={upgradeLink} className="block">
            <button className="w-full py-2 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all flex items-center justify-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Upgrader mon niveau</span>
            </button>
          </a>
        </div>
      )}
    </Card>
  );
}
