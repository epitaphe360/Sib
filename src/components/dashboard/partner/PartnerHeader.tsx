import { motion } from 'framer-motion';
import { Award, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { MoroccanPattern } from '../../ui/MoroccanDecor';
import { useTranslation } from '../../../hooks/useTranslation';
import { ROUTES } from '../../../lib/routes';
import type { User } from '../../../types';

interface PartnerHeaderProps {
  user: User;
  partnerTier: string;
  isPublished: boolean | null;
  isTogglingPublish: boolean;
  onTogglePublish: () => void;
}

export function PartnerHeader({ user, partnerTier, isPublished, isTogglingPublish, onTogglePublish }: PartnerHeaderProps) {
  const { t } = useTranslation();
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-gradient-to-r from-indigo-700 via-indigo-800 to-purple-800 rounded-2xl shadow-2xl mx-4 mt-4 mb-6 relative overflow-hidden"
    >
      <MoroccanPattern className="opacity-10" color="white" scale={0.8} />
      <div className="relative max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-4 w-full md:w-auto">
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
              <Award className="h-10 w-10 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap mb-2">
                <h1 className="text-2xl font-bold text-white">{t('partner.dashboard_title')}</h1>
                <Badge className="bg-white/20 text-white border-white/30 font-bold">
                  {t('partner.tier_label')} {partnerTier.toUpperCase()}
                </Badge>
                <button
                  onClick={onTogglePublish}
                  disabled={isTogglingPublish}
                  className={`px-4 py-2 rounded-lg font-bold text-sm transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                    isPublished
                      ? 'bg-green-500/30 text-green-100 border-2 border-green-400/40 hover:bg-green-500/40'
                      : 'bg-amber-500/30 text-amber-100 border-2 border-amber-400/40 hover:bg-amber-500/40'
                  }`}
                >
                  {isTogglingPublish ? t('exhibitor.header.changing') : isPublished ? t('exhibitor.header.published_status') : t('exhibitor.header.hidden_status')}
                </button>
              </div>
              <p className="text-indigo-100 text-sm">{t('partner.hero_subtitle')}</p>
              <p className="text-indigo-200 text-sm">{user?.profile?.company || ''}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to={ROUTES.BADGE}>
              <Button variant="outline" size="lg" className="border-2 border-white/30 text-white hover:bg-white/10">
                🎫 {t('partner.virtual_badge')}
              </Button>
            </Link>
            <Link to={ROUTES.PARTNER_ANALYTICS}>
              <Button size="lg" className="bg-white text-indigo-700 hover:bg-indigo-50 font-bold">
                <BarChart3 className="h-4 w-4 mr-2" />
                {t('partner.roi_performance')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
