import { Sparkles, Calendar, Award, Network } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '../../ui/Button';
import { LevelBadge } from '../../common/QuotaWidget';
import { MoroccanPattern } from '../../ui/MoroccanDecor';
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
      <div className="bg-gradient-to-r from-SIB-primary via-SIB-secondary to-SIB-accent rounded-2xl shadow-2xl p-8 mb-6 relative overflow-hidden">
        <MoroccanPattern className="opacity-15" color="white" scale={0.8} />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
              <Sparkles className="h-10 w-10 text-SIB-gold" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">{t('visitor.visitor_area')}</h1>
              <p className="text-blue-100">
                {t('visitor.welcome_message', { name: user.name, level: userLevel.toUpperCase() })} 🌟
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <Link to={ROUTES.BADGE}>
              <Button variant="outline" size="md" className="border-white/40 text-white hover:bg-white/10 hover:border-white/60 backdrop-blur-sm">
                🎫 {t('visitor.my_virtual_badge')}
              </Button>
            </Link>
            <div className="hidden md:flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
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

        <div className="relative mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20" data-testid="quota-rdv-card">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white/80 text-sm mb-1">{t('visitor.appointments_remaining')}</div>
                <div className="text-2xl font-bold text-white">
                  {remaining}/{getVisitorQuota(userLevel)}
                  <span className="sr-only" data-testid="quota-info">Quota {getVisitorQuota(userLevel)} {t('visitor.b2b_appointments')}</span>
                </div>
                {(userLevel === 'premium' || userLevel === 'vip') && getVisitorQuota(userLevel) === 10 && (
                  <div className="text-xs text-yellow-300 mt-1">✓ 10 {t('visitor.b2b_appointments')} Premium</div>
                )}
              </div>
              <Calendar className="h-8 w-8 text-white/60" />
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white/80 text-sm mb-1">{t('common.events')}</div>
                <div className="text-2xl font-bold text-white">{registeredEventsCount}</div>
              </div>
              <Award className="h-8 w-8 text-white/60" />
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white/80 text-sm mb-1">{t('common.connections')}</div>
                <div className="text-2xl font-bold text-white">{connectionsRequested}</div>
              </div>
              <Network className="h-8 w-8 text-white/60" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
