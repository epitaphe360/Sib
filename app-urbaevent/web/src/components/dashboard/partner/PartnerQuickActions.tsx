import { Zap, User, Network, Brain, FileText, BadgeCheck, BarChart2, Headphones, ArrowRight, QrCode } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ROUTES } from '../../../lib/routes';

interface PartnerQuickActionsProps {
  onOpenBadge?: () => void;
  onOpenQR?: () => void;
}

export function PartnerQuickActions({ onOpenBadge, onOpenQR }: Readonly<PartnerQuickActionsProps>) {
  const actions = [
    {
      title: 'Mon Profil',
      description: 'Modifier votre profil partenaire',
      Icon: User,
      link: ROUTES.PARTNER_PROFILE_EDIT,
    },
    {
      title: 'Networking B2B',
      description: 'Rencontrez des exposants et visiteurs',
      Icon: Network,
      link: ROUTES.NETWORKING,
      highlight: true,
    },
    {
      title: 'Matching IA',
      description: 'Connexions intelligentes personnalisées',
      Icon: Brain,
      link: ROUTES.ADVANCED_MATCHING,
      highlight: true,
    },
    {
      title: 'Mes Leads',
      description: 'Contacts et prospects qualifiés',
      Icon: FileText,
      link: ROUTES.PARTNER_LEADS,
    },
    {
      title: 'Mon Badge',
      description: 'Affichez et imprimez votre badge SIB 2026',
      Icon: BadgeCheck,
      action: onOpenBadge,
    },
    {
      title: 'QR Code',
      description: 'Scannez des visiteurs sur le stand',
      Icon: QrCode,
      action: onOpenQR,
    },
    {
      title: 'Mes Médias',
      description: 'Gérer vos contenus média',
      Icon: BarChart2,
      link: ROUTES.PARTNER_MEDIA,
    },
    {
      title: 'Support',
      description: 'Assistance et accompagnement',
      Icon: Headphones,
      link: ROUTES.PARTNER_SUPPORT_PAGE,
    },
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2.5 bg-[#1B365D] rounded-xl shadow-md">
          <Zap className="h-5 w-5 text-[#F39200]" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Actions rapides</h2>
          <p className="text-sm text-gray-500">Accédez directement à vos outils</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {actions.map((action, i) => {
          const inner = (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`group relative flex flex-col gap-2 p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer h-full ${
                action.highlight
                  ? 'bg-gradient-to-br from-[#1B365D]/5 to-[#F39200]/10 border-[#F39200]/30 hover:border-[#F39200] hover:shadow-lg'
                  : 'bg-white border-gray-100 hover:border-[#1B365D]/30 hover:shadow-md'
              }`}
            >
              <div className={`p-2 rounded-xl w-fit ${action.highlight ? 'bg-[#F39200]/20' : 'bg-gray-100 group-hover:bg-[#1B365D]/10'} transition-colors`}>
                <action.Icon className={`h-5 w-5 ${action.highlight ? 'text-[#F39200]' : 'text-[#1B365D]'}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-900 leading-tight">{action.title}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-tight">{action.description}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-[#1B365D] group-hover:translate-x-0.5 transition-all absolute bottom-3 right-3" />
            </motion.div>
          );

          if (action.action) {
            return (
              <button key={action.title} onClick={action.action} className="text-left h-full">
                {inner}
              </button>
            );
          }
          return (
            <Link key={action.title} to={action.link as string} className="h-full">
              {inner}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
