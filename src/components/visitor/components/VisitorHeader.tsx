import { Sparkles, Calendar, Award, Network } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '../../ui/Button';
import { LevelBadge } from '../../common/QuotaWidget';
import { useTranslation } from '../../../hooks/useTranslation';
import { ROUTES } from '../../../lib/routes';
import { getVisitorQuota } from '../../../config/quotas';
import type { User } from '../../../types';

interface VisitorHeaderProps {
  user: User;
  userLevel: string;
  remaining: number;
  registeredEventsCount: number;
  connectionsRequested: number;
}

export function VisitorHeader({
  user,
  userLevel,
  remaining,
  registeredEventsCount,
  connectionsRequested,
}: VisitorHeaderProps) {
  const { t } = useTranslation();
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-8"
    >
      <div className="rounded-2xl shadow-2xl mb-6 overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-[#C9A84C] via-[#E8C96A] to-[#C9A84C]" />
        <div className="bg-[#0F2034] p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="bg-[#C9A84C]/15 backdrop-blur-sm p-4 rounded-xl border border-[#C9A84C]/30">
                <Sparkles className="h-10 w-10 text-[#C9A84C]" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">{t('visitor.visitor_area')}</h1>
                <p className="text-slate-300">
                  {t('visitor.welcome_message', { name: user.name, level: userLevel.toUpperCase() })}
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
              <Link to={ROUTES.VISITOR_VISA_LETTER}>
                <Button variant="outline" size="md" className="border-[#C9A84C]/40 text-[#C9A84C] hover:bg-[#C9A84C]/10">
                  Lettre de Visa
                </Button>
              </Link>
              <Link to={ROUTES.BADGE}>
                <Button variant="outline" size="md" className="border-[#C9A84C]/40 text-[#C9A84C] hover:bg-[#C9A84C]/10">
                  {t('visitor.my_virtual_badge')}
                </Button>
              </Link>
              <div className="hidden md:flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-lg">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-white text-sm font-medium">{t('visitor.connected')}</span>
              </div>
              <div className="flex justify-end">
                <LevelBadge level={userLevel} type="visitor" size="lg" />
              </div>
              {(userLevel === 'premium' || userLevel === 'vip') && (
                <span className="sr-only" data-testid="vip-badge">VIP Premium Badge Active</span>
              )}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/8 rounded-lg p-4 border border-white/15" data-testid="quota-rdv-card">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white/70 text-sm mb-1">{t('visitor.appointments_remaining')}</div>
                  <div className="text-2xl font-bold text-white">
                    {remaining}/{getVisitorQuota(userLevel)}
                    <span className="sr-only" data-testid="quota-info">Quota {getVisitorQuota(userLevel)} {t('visitor.b2b_appointments')}</span>
                  </div>
                  {(userLevel === 'premium' || userLevel === 'vip') && getVisitorQuota(userLevel) === 10 && (
                    <div className="text-xs text-[#C9A84C] mt-1">✓ 10 {t('visitor.b2b_appointments')} Premium</div>
                  )}
                </div>
                <Calendar className="h-8 w-8 text-white/50" />
              </div>
            </div>
            <div className="bg-white/8 rounded-lg p-4 border border-white/15">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white/70 text-sm mb-1">{t('common.events')}</div>
                  <div className="text-2xl font-bold text-white">{registeredEventsCount}</div>
                </div>
                <Award className="h-8 w-8 text-white/50" />
              </div>
            </div>
            <div className="bg-white/8 rounded-lg p-4 border border-white/15">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white/70 text-sm mb-1">{t('common.connections')}</div>
                  <div className="text-2xl font-bold text-white">{connectionsRequested}</div>
                </div>
                <Network className="h-8 w-8 text-white/50" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
