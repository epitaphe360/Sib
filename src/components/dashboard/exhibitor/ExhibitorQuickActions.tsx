import { Zap, Sparkles, Globe, Palette, User, QrCode, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from '../../../hooks/useTranslation';
import { ROUTES } from '../../../lib/routes';

interface ExhibitorQuickActionsProps {
  onOpenScrapper: () => void;
  onOpenQR: () => void;
}

export function ExhibitorQuickActions({ onOpenScrapper, onOpenQR }: ExhibitorQuickActionsProps) {
  const { t } = useTranslation();

  const actions = [
    {
      title: t('exhibitor.quick_actions.create_minisite_ai'),
      description: t('exhibitor.quick_actions.create_minisite_ai_desc'),
      Icon: Sparkles,
      action: onOpenScrapper,
    },
    {
      title: t('exhibitor.quick_actions.networking_ai'),
      description: t('exhibitor.quick_actions.networking_ai_desc'),
      Icon: Globe,
      link: ROUTES.NETWORKING,
    },
    {
      title: t('exhibitor.quick_actions.edit_minisite'),
      description: t('exhibitor.quick_actions.edit_minisite_desc'),
      Icon: Palette,
      link: ROUTES.MINISITE_EDITOR,
    },
    {
      title: t('exhibitor.quick_actions.profile'),
      description: t('exhibitor.quick_actions.profile_desc'),
      Icon: User,
      link: ROUTES.PROFILE,
    },
    {
      title: t('exhibitor.quick_actions.qr_code'),
      description: t('exhibitor.quick_actions.qr_code_desc'),
      Icon: QrCode,
      action: onOpenQR,
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sib border border-sib-gray-100 overflow-hidden mb-8">
      {/* Header navy */}
      <div className="bg-[#0F2034] px-6 py-4 flex items-center gap-3">
        <Zap className="h-4 w-4 text-[#C9A84C]" />
        <span className="text-white font-semibold text-sm">{t('exhibitor.quick_actions_title')}</span>
      </div>

      {/* Grille */}
      <div className="p-5 bg-sib-bg">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {actions.map((action, index) => {
            const inner = (
              <motion.div
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-start gap-4 p-4 bg-white rounded-xl border-2 border-sib-gray-100 hover:border-[#C9A84C]/50 hover:shadow-sib transition-all cursor-pointer group"
              >
                <div className="flex-shrink-0 p-3 rounded-xl bg-[#1B365D]/8 group-hover:bg-[#C9A84C]/15 transition-colors">
                  <action.Icon className="h-6 w-6 text-[#1B365D] group-hover:text-[#A88830] transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-[#0F2034] group-hover:text-[#1B365D] transition-colors leading-tight mb-1">
                    {action.title}
                  </div>
                  <div className="text-xs text-sib-gray-400 leading-relaxed">{action.description}</div>
                </div>
                <ArrowRight className="flex-shrink-0 h-4 w-4 text-sib-gray-300 group-hover:text-[#C9A84C] opacity-0 group-hover:opacity-100 transition-all mt-1" />
              </motion.div>
            );

            return (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
              >
                {action.link ? (
                  <Link to={action.link} className="block">{inner}</Link>
                ) : (
                  <button onClick={action.action} className="w-full text-left">{inner}</button>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}


