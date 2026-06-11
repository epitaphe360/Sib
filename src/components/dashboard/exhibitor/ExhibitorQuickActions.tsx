import { Zap, Palette, User, QrCode, ArrowRight, Network, Brain, Users, Package, FileText, BadgeCheck, CalendarDays } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from '../../../hooks/useTranslation';
import { ROUTES } from '../../../lib/routes';

interface ExhibitorQuickActionsProps {
  onOpenQR: () => void;
  onOpenBadge?: () => void;
}

export function ExhibitorQuickActions({ onOpenQR, onOpenBadge }: Readonly<ExhibitorQuickActionsProps>) {
  const { t } = useTranslation();

  const actions = [
    {
      title: t('exhibitor.quick_actions.edit_minisite'),
      description: t('exhibitor.quick_actions.edit_minisite_desc'),
      Icon: Palette,
      link: ROUTES.MINISITE_EDITOR,
    },
    {
      title: t('exhibitor.quick_actions.advanced_networking'),
      description: t('exhibitor.quick_actions.advanced_networking_desc'),
      Icon: Network,
      link: ROUTES.NETWORKING,
      highlight: true,
    },
    {
      title: t('exhibitor.quick_actions.ai_matching'),
      description: t('exhibitor.quick_actions.ai_matching_desc'),
      Icon: Brain,
      link: ROUTES.ADVANCED_MATCHING,
      highlight: true,
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
    // ── Nouveaux modules SIB 2026 ──
    {
      title: 'Mon Équipe Stand',
      description: 'Gérez vos collaborateurs et leurs badges',
      Icon: Users,
      link: ROUTES.EXHIBITOR_TEAM,
      highlight: true,
    },
    {
      title: 'Mon Badge',
      description: 'Affichez et imprimez votre badge SIB 2026',
      Icon: BadgeCheck,
      action: onOpenBadge ?? onOpenQR,
    },
    {
      title: 'Location Matériel',
      description: 'Mobilier, audiovisuel, structure pour votre stand',
      Icon: Package,
      link: ROUTES.EXHIBITOR_RENTAL,
    },
    {
      title: 'Lettre d\'Invitation',
      description: 'Demandez une lettre pour vos visiteurs étrangers',
      Icon: FileText,
      link: ROUTES.EXHIBITOR_INVITATION_LETTER,
    },
    {
      title: 'Programme & Séminaires',
      description: 'Inscrivez-vous aux conférences et séminaires SIB 2026',
      Icon: CalendarDays,
      link: ROUTES.EVENTS,
      highlight: true,
    },
    {
      title: 'Visiteurs Scannés',
      description: 'Consultez et exportez les QR codes collectés par votre équipe',
      Icon: QrCode,
      link: ROUTES.EXHIBITOR_SCANS,
      highlight: true,
    },
    {
      title: 'Éditer mon Profil',
      description: 'Mettez à jour les informations de votre entreprise',
      Icon: User,
      link: ROUTES.EXHIBITOR_PROFILE,
    },
    {
      title: 'Mes Factures',
      description: 'Consultez et téléchargez vos factures SIB 2026',
      Icon: FileText,
      link: ROUTES.EXHIBITOR_INVOICES,
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sib border border-sib-gray-100 overflow-hidden mb-8">
      {/* Header navy */}
      <div className="bg-[#0F2034] px-6 py-4 flex items-center gap-3">
        <Zap className="h-4 w-4 text-[#F39200]" />
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
                className={`flex items-start gap-4 p-4 rounded-xl border-2 hover:shadow-sib transition-all cursor-pointer group ${
                  (action as any).highlight
                    ? 'bg-gradient-to-br from-[#1B365D]/5 to-[#F39200]/10 border-[#F39200]/40 hover:border-[#F39200]/70'
                    : 'bg-white border-sib-gray-100 hover:border-[#F39200]/50'
                }`}
              >
                <div className={`flex-shrink-0 p-3 rounded-xl transition-colors ${
                  (action as any).highlight
                    ? 'bg-[#F39200]/20 group-hover:bg-[#F39200]/30'
                    : 'bg-[#1B365D]/8 group-hover:bg-[#F39200]/15'
                }`}>
                  <action.Icon className={`h-6 w-6 transition-colors ${
                    (action as any).highlight ? 'text-[#F39200]' : 'text-[#1B365D] group-hover:text-[#A88830]'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-[#0F2034] group-hover:text-[#1B365D] transition-colors leading-tight mb-1">
                    {action.title}
                  </div>
                  <div className="text-xs text-sib-gray-400 leading-relaxed">{action.description}</div>
                </div>
                <ArrowRight className="flex-shrink-0 h-4 w-4 text-sib-gray-300 group-hover:text-[#F39200] opacity-0 group-hover:opacity-100 transition-all mt-1" />
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


