import { motion } from 'framer-motion';
import { Award, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
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
      className="rounded-2xl shadow-2xl mx-4 mt-4 mb-6 overflow-hidden"
    >
      <div className="h-1 w-full bg-gradient-to-r from-[#C9A84C] via-[#E8C96A] to-[#C9A84C]" />
      <div className="bg-[#0F2034] px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-4 w-full md:w-auto">
            <div className="bg-[#C9A84C]/15 backdrop-blur-sm p-4 rounded-xl border border-[#C9A84C]/30">
              <Award className="h-10 w-10 text-[#C9A84C]" />
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
              <p className="text-slate-300 text-sm">{t('partner.hero_subtitle')}</p>
              <p className="text-slate-400 text-sm">{user?.profile?.company || ''}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to={ROUTES.BADGE}>
              <Button variant="outline" size="lg" className="border-[#C9A84C]/40 text-[#C9A84C] hover:bg-[#C9A84C]/10">
                {t('partner.virtual_badge')}
              </Button>
            </Link>
            <Link to={ROUTES.PARTNER_ANALYTICS}>
              <Button size="lg" className="bg-[#C9A84C] text-[#0F2034] hover:bg-[#A88830] font-bold">
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
