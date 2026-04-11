import { Zap, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card } from '../../ui/Card';
import { useTranslation } from '../../../hooks/useTranslation';
import { ROUTES } from '../../../lib/routes';

interface QuickAction {
  title: string;
  description: string;
  icon: string;
  action?: () => void;
  link?: string;
}

interface ExhibitorQuickActionsProps {
  onOpenScrapper: () => void;
  onOpenQR: () => void;
}

export function ExhibitorQuickActions({ onOpenScrapper, onOpenQR }: ExhibitorQuickActionsProps) {
  const { t } = useTranslation();

  const actions: QuickAction[] = [
    {
      title: t('exhibitor.quick_actions.create_minisite_ai'),
      description: t('exhibitor.quick_actions.create_minisite_ai_desc'),
      icon: '✨',
      action: onOpenScrapper,
    },
    {
      title: t('exhibitor.quick_actions.networking_ai'),
      description: t('exhibitor.quick_actions.networking_ai_desc'),
      icon: '🤖',
      link: ROUTES.NETWORKING,
    },
    {
      title: t('exhibitor.quick_actions.edit_minisite'),
      description: t('exhibitor.quick_actions.edit_minisite_desc'),
      icon: '🎨',
      link: ROUTES.MINISITE_EDITOR,
    },
    {
      title: t('exhibitor.quick_actions.profile'),
      description: t('exhibitor.quick_actions.profile_desc'),
      icon: '👤',
      link: ROUTES.PROFILE,
    },
    {
      title: t('exhibitor.quick_actions.qr_code'),
      description: t('exhibitor.quick_actions.qr_code_desc'),
      icon: '📱',
      action: onOpenQR,
    },
  ];

  return (
    <Card className="p-0 overflow-hidden border-none shadow-2xl bg-white mb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 p-8 text-white relative">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}
        />
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-inner">
              <Zap className="h-8 w-8 text-blue-400" />
            </div>
            <div>
              <h3 className="text-2xl font-black tracking-tight text-white mb-1">
                {t('exhibitor.quick_actions_title')}
              </h3>
              <div className="flex items-center space-x-2 text-blue-200/80">
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                <p className="text-sm font-medium">{t('exhibitor.quick_actions_subtitle')}</p>
              </div>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-2 bg-white/5 backdrop-blur-md rounded-xl px-4 py-2 border border-white/10">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-xs font-bold text-blue-200 uppercase tracking-wider">{t('common.premium')}</span>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="p-6 bg-gradient-to-br from-slate-50 via-blue-50/50 to-purple-50/50">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {actions.map((action, index) => {
            const inner = (
              <div className="relative bg-white hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 rounded-2xl p-5 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-blue-400/50 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
                <div className="relative flex items-start space-x-4">
                  <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-blue-500/20 to-purple-500/20 group-hover:from-blue-500/30 group-hover:to-purple-500/30 rounded-xl flex items-center justify-center transition-all duration-300 shadow-md">
                    <span className="text-3xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">{action.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-black text-gray-900 group-hover:text-blue-600 transition-colors duration-300 mb-1.5 leading-tight text-base">{action.title}</div>
                    <div className="text-xs text-gray-600 group-hover:text-gray-800 leading-relaxed break-words">{action.description}</div>
                  </div>
                  <ArrowRight className="flex-shrink-0 h-5 w-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-2 transition-all duration-300 mt-1" />
                </div>
              </div>
            );

            return (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.03, y: -4 }}
                whileTap={{ scale: 0.98 }}
                className="group"
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
    </Card>
  );
}
