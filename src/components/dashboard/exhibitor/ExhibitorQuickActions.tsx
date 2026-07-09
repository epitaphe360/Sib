import {
  Zap, Palette, QrCode, Users, Package, FileText, BadgeCheck, CalendarDays,
  Network, Brain, Megaphone, Tent, ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from '../../../hooks/useTranslation';
import { ROUTES } from '../../../lib/routes';

interface ExhibitorQuickActionsProps {
  onOpenQR: () => void;
  onOpenScrapper?: () => void;
}

interface ActionItem {
  title: string;
  description: string;
  Icon: typeof Palette;
  link?: string;
  action?: () => void;
  highlight?: boolean;
}

interface ActionSection {
  id: string;
  label: string;
  color: string;
  items: ActionItem[];
}

function SectionTitle({ label, color }: { label: string; color: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span
        className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 text-xs font-bold"
        style={{ background: `${color}18`, border: `1px solid ${color}30`, color }}
      >
        •
      </span>
      <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color, letterSpacing: '0.12em' }}>
        {label}
      </h3>
      <div className="h-px flex-1 ml-1" style={{ background: `linear-gradient(to right, ${color}30, transparent)` }} />
    </div>
  );
}

function ActionTile({ item, color }: { item: ActionItem; color: string }) {
  const inner = (
    <motion.div
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.97 }}
      className={`flex items-start gap-3 p-4 rounded-xl border transition-all cursor-pointer group h-full ${
        item.highlight
          ? 'bg-gradient-to-br from-[#1B365D]/5 to-[#F39200]/10 border-[#F39200]/40 hover:border-[#F39200]/70'
          : 'bg-white border-sib-gray-100 hover:border-[#F39200]/50'
      }`}
    >
      <div
        className="flex-shrink-0 p-2.5 rounded-xl transition-colors"
        style={{ background: `${color}14`, border: `1px solid ${color}25` }}
      >
        <item.Icon className="h-5 w-5" style={{ color: item.highlight ? '#F39200' : color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm text-[#0F2034] leading-tight mb-0.5">{item.title}</div>
        <div className="text-xs text-sib-gray-400 leading-relaxed">{item.description}</div>
      </div>
      <ArrowRight className="flex-shrink-0 h-4 w-4 text-sib-gray-300 group-hover:text-[#F39200] opacity-0 group-hover:opacity-100 transition-all mt-0.5" />
    </motion.div>
  );

  if (item.link) {
    return <Link to={item.link} className="block h-full">{inner}</Link>;
  }
  return (
    <button type="button" onClick={item.action} className="w-full text-left h-full">
      {inner}
    </button>
  );
}

export function ExhibitorQuickActions({ onOpenQR, onOpenScrapper }: Readonly<ExhibitorQuickActionsProps>) {
  const { t } = useTranslation();

  const sections: ActionSection[] = [
    {
      id: 'stand',
      label: t('exhibitor.actions.section_stand'),
      color: '#1B365D',
      items: [
        ...(onOpenScrapper
          ? [{
              title: t('exhibitor.quick_actions.create_minisite_ai'),
              description: t('exhibitor.quick_actions.create_minisite_ai_desc'),
              Icon: Palette,
              action: onOpenScrapper,
              highlight: true,
            }]
          : []),
        {
          title: t('exhibitor.quick_actions.edit_minisite'),
          description: t('exhibitor.quick_actions.edit_minisite_desc'),
          Icon: Palette,
          link: ROUTES.MINISITE_EDITOR,
        },
        {
          title: t('exhibitor.header.create_edit_minisite'),
          description: t('exhibitor.actions.create_minisite_desc'),
          Icon: Palette,
          link: ROUTES.MINISITE_CREATION,
        },
        {
          title: t('exhibitor.actions.my_profile'),
          description: t('exhibitor.actions.my_profile_desc'),
          Icon: Users,
          link: ROUTES.EXHIBITOR_PROFILE,
        },
      ],
    },
    {
      id: 'badge',
      label: t('exhibitor.actions.section_badge'),
      color: '#F39200',
      items: [
        {
          title: t('exhibitor.actions.my_badge'),
          description: t('exhibitor.actions.my_badge_desc'),
          Icon: BadgeCheck,
          link: ROUTES.BADGE,
          highlight: true,
        },
        {
          title: t('exhibitor.quick_actions.qr_code'),
          description: t('exhibitor.quick_actions.qr_code_desc'),
          Icon: QrCode,
          action: onOpenQR,
        },
        {
          title: t('exhibitor.actions.team'),
          description: t('exhibitor.actions.team_desc'),
          Icon: Users,
          link: ROUTES.EXHIBITOR_TEAM,
        },
      ],
    },
    {
      id: 'networking',
      label: t('exhibitor.actions.section_networking'),
      color: '#6366f1',
      items: [
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
        },
        {
          title: t('exhibitor.actions.scanned_visitors'),
          description: t('exhibitor.actions.scanned_visitors_desc'),
          Icon: QrCode,
          link: ROUTES.EXHIBITOR_SCANS,
        },
      ],
    },
    {
      id: 'services',
      label: t('exhibitor.actions.section_services'),
      color: '#0ea5e9',
      items: [
        {
          title: t('exhibitor.actions.rental'),
          description: t('exhibitor.actions.rental_desc'),
          Icon: Package,
          link: ROUTES.RENTAL_CATALOG,
        },
        {
          title: t('exhibitor.actions.chapiteau'),
          description: t('exhibitor.actions.chapiteau_desc'),
          Icon: Tent,
          link: ROUTES.EXHIBITOR_CHAPITEAU,
        },
        {
          title: t('exhibitor.actions.advertising'),
          description: t('exhibitor.actions.advertising_desc'),
          Icon: Megaphone,
          link: ROUTES.EXHIBITOR_ADVERTISING,
        },
        {
          title: t('exhibitor.actions.invitation'),
          description: t('exhibitor.actions.invitation_desc'),
          Icon: FileText,
          link: ROUTES.EXHIBITOR_INVITATION_LETTER,
        },
        {
          title: t('exhibitor.actions.invoices'),
          description: t('exhibitor.actions.invoices_desc'),
          Icon: FileText,
          link: ROUTES.EXHIBITOR_INVOICES,
        },
      ],
    },
    {
      id: 'events',
      label: t('exhibitor.actions.section_events'),
      color: '#10b981',
      items: [
        {
          title: t('exhibitor.actions.programme'),
          description: t('exhibitor.actions.programme_desc'),
          Icon: CalendarDays,
          link: ROUTES.EVENTS,
          highlight: true,
        },
      ],
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sib border border-sib-gray-100 overflow-hidden mb-8">
      <div className="bg-[#0F2034] px-6 py-4 flex items-center gap-3">
        <Zap className="h-4 w-4 text-[#F39200]" />
        <span className="text-white font-semibold text-sm">{t('exhibitor.actions.navigation_title')}</span>
      </div>

      <div className="p-6 sm:p-8 space-y-8 bg-sib-bg">
        {sections.map((section) => (
          <div key={section.id}>
            <SectionTitle label={section.label} color={section.color} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {section.items.map((item) => (
                <ActionTile key={item.title} item={item} color={section.color} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
