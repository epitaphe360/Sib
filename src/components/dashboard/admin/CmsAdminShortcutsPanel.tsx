import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Calendar, Users, Newspaper, Mic2, BadgeCheck, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../../lib/routes';

const LINKS = [
  { href: '/admin/events', label: 'Programme / Événements', icon: Calendar, desc: 'Conférences, axes, sessions SIB Talks' },
  { href: '/admin/news', label: 'Actualités', icon: Newspaper, desc: 'Articles news web + APK' },
  { href: '/admin/speakers', label: 'Intervenants', icon: Mic2, desc: 'Page /speakers' },
  { href: '/admin/exhibitors', label: 'Exposants', icon: Users, desc: 'Annuaire et fiches exposants' },
  { href: '/admin/badge-config', label: 'Configuration badge', icon: BadgeCheck, desc: 'Badge A4 + QR (web & APK)' },
  { href: '/admin/salons', label: 'Salons UrbaEvent', icon: Settings, desc: 'Dates, activation salons APK' },
  { href: ROUTES.METRICS, label: 'Métriques détaillées', icon: ExternalLink, desc: 'Statistiques admin' },
];

export function CmsAdminShortcutsPanel() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-sm"
    >
      <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-1">
        Autres contenus éditables (admin)
      </h2>
      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-5">
        Contenus gérés hors section CMS du dashboard — liens directs vers les modules admin.
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {LINKS.map(({ href, label, icon: Icon, desc }) => (
          <Link
            key={href}
            to={href}
            className="flex items-start gap-3 rounded-xl border border-neutral-200 dark:border-neutral-700 p-4 hover:border-primary-400 hover:bg-primary-50/50 dark:hover:bg-primary-950/20 transition-colors"
          >
            <div className="rounded-lg bg-primary-100 dark:bg-primary-900/40 p-2">
              <Icon className="h-4 w-4 text-primary-700 dark:text-primary-300" />
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-900 dark:text-white">{label}</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </motion.section>
  );
}
