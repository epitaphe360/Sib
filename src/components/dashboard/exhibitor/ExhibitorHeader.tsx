import { Link } from 'react-router-dom';
import { Building2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { LevelBadge } from '../../common/QuotaWidget';
import { useTranslation } from '../../../hooks/useTranslation';
import { DEFAULT_SALON_CONFIG } from '../../../config/salonInfo';
import { ROUTES } from '../../../lib/routes';
import type { User } from '../../../types';

interface ExhibitorHeaderProps {
  user: User | null;
  isPublished: boolean | null;
  isTogglingPublish: boolean;
  exhibitorLevel: string;
  onTogglePublish: () => void;
}

export function ExhibitorHeader({
  user,
  isPublished,
  isTogglingPublish,
  exhibitorLevel,
  onTogglePublish,
}: ExhibitorHeaderProps) {
  const { t } = useTranslation();

  return (
    <>
      {/* Gradient header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-[#0F2034] rounded-2xl shadow-sib-xl mx-4 mt-4 mb-6 relative overflow-hidden"
      >
        {/* Ligne gold */}
        <div className="h-1 w-full bg-gradient-to-r from-[#C9A84C] via-[#E8C96A] to-[#C9A84C]" />

        <div className="relative max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-4 w-full md:w-auto">
              <div className="bg-[#C9A84C]/15 border border-[#C9A84C]/30 p-4 rounded-xl">
                <Building2 className="h-10 w-10 text-[#C9A84C]" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">{t('exhibitor.my_booth')}</h1>
                <p className="text-slate-300">
                  {t('dashboard.welcome')} {user?.profile?.firstName || 'Exposant'},{' '}
                  {t('exhibitor.booth_location')} ✨
                </p>
                <div className="mt-3 flex items-center space-x-3 flex-wrap gap-y-2">
                  <Badge variant="info" size="md" className="bg-white/10 text-white border-white/20">
                    {user?.profile?.company || 'Entreprise'}
                  </Badge>
                  <Badge variant="success" size="md" className="bg-[#2D6A4F]/30 text-[#4ade80] border-[#2D6A4F]/40">
                    {t('admin.verified')} ✓
                  </Badge>
                  <button
                    onClick={onTogglePublish}
                    disabled={isTogglingPublish}
                    className={`px-4 py-2 rounded-lg font-bold text-sm transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                      isPublished
                        ? 'bg-green-500/30 text-green-100 border-2 border-green-400/40 hover:bg-green-500/40'
                        : 'bg-amber-500/30 text-amber-100 border-2 border-amber-400/40 hover:bg-amber-500/40'
                    }`}
                  >
                    {isTogglingPublish
                      ? t('exhibitor.header.changing')
                      : isPublished
                      ? t('exhibitor.header.published_status')
                      : t('exhibitor.header.hidden_status')}
                  </button>
                </div>
              </div>
            </div>

            <div className="hidden md:flex flex-col items-end space-y-3 text-right">
              <LevelBadge level={exhibitorLevel} type="exhibitor" size="lg" />
              <div className="text-right">
                <div className="text-2xl font-bold text-white">
                  {new Date().toLocaleDateString('fr-FR')}
                </div>
                <div className="text-sm text-[#C9A84C]">
                  {DEFAULT_SALON_CONFIG.name} - {DEFAULT_SALON_CONFIG.location.city}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick-access buttons */}
      <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-end gap-3">
        <Link to={ROUTES.BADGE}>
          <Button variant="outline" size="lg" className="border-2 border-[#1B365D] text-[#1B365D] hover:bg-[#1B365D] hover:text-white">
            {t('exhibitor.header.virtual_badge')}
          </Button>
        </Link>
        <Link to={ROUTES.MINISITE_CREATION}>
          <Button variant="default" size="lg" className="bg-[#1B365D] hover:bg-[#0F2034] text-white">
            {t('exhibitor.header.create_edit_minisite')}
          </Button>
        </Link>
      </div>
    </>
  );
}
