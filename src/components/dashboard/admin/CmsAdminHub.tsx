import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3, Globe, Smartphone, LayoutGrid, Home, FileJson, Images, Megaphone, Puzzle,
} from 'lucide-react';
import { WebContentCoveragePanel } from './WebContentCoveragePanel';
import { SiteTextContentPanel } from './SiteTextContentPanel';
import { SiteImagesPanel } from './SiteImagesPanel';
import { PageContentAdminPanel } from './PageContentAdminPanel';
import { MobileAppContentPanel } from './MobileAppContentPanel';
import { CmsAdminShortcutsPanel } from './CmsAdminShortcutsPanel';
import { BannerManagementPanel } from './BannerManagementPanel';
import { VisitorPricingPanel } from './VisitorPricingPanel';

type MainTab = 'overview' | 'web' | 'mobile' | 'modules';
type WebSection = 'home' | 'pages' | 'media' | 'promo';

const MAIN_TABS: { id: MainTab; label: string; icon: typeof Globe; hint: string }[] = [
  { id: 'overview', label: 'Vue d’ensemble', icon: BarChart3, hint: 'Couverture CMS' },
  { id: 'web', label: 'Site web', icon: Globe, hint: 'SIB 2026 & UrbaEvent' },
  { id: 'mobile', label: 'Application mobile', icon: Smartphone, hint: 'APK UrbaEvent' },
  { id: 'modules', label: 'Modules admin', icon: Puzzle, hint: 'Événements, exposants…' },
];

const WEB_SECTIONS: { id: WebSection; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Accueil SIB 2026', icon: Home },
  { id: 'pages', label: 'Pages vitrine', icon: FileJson },
  { id: 'media', label: 'Photos du site', icon: Images },
  { id: 'promo', label: 'Bannières & tarifs', icon: Megaphone },
];

export function CmsAdminHub() {
  const [mainTab, setMainTab] = useState<MainTab>('web');
  const [webSection, setWebSection] = useState<WebSection>('home');

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-10 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-900/50 overflow-hidden shadow-sm"
    >
      {/* En-tête hub */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-6 py-5">
        <div className="flex items-center gap-2 mb-1">
          <LayoutGrid className="h-5 w-5 text-primary-600" />
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
            Gestion du contenu
          </h2>
        </div>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-3xl">
          Modifiez le site web SIB 2026, les pages UrbaEvent et l’application mobile depuis un seul espace organisé.
        </p>

        {/* Onglets principaux */}
        <div className="flex flex-wrap gap-2 mt-5">
          {MAIN_TABS.map(({ id, label, icon: Icon, hint }) => (
            <button
              key={id}
              type="button"
              onClick={() => setMainTab(id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                mainTab === id
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{label}</span>
              <span className={`hidden sm:inline text-xs font-normal ${mainTab === id ? 'text-white/80' : 'text-neutral-500'}`}>
                · {hint}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-6">
        {mainTab === 'overview' && (
          <div className="space-y-4">
            <p className="text-xs text-neutral-500 dark:text-neutral-400 px-1">
              Indicateurs de remplissage — objectif 100 % avant livraison.
            </p>
            <WebContentCoveragePanel embedded />
          </div>
        )}

        {mainTab === 'web' && (
          <>
            <div className="flex flex-wrap gap-2 pb-2 border-b border-neutral-200/80 dark:border-neutral-800">
              {WEB_SECTIONS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setWebSection(id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    webSection === id
                      ? 'bg-white dark:bg-neutral-800 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800 shadow-sm'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              ))}
            </div>

            {webSection === 'home' && (
              <div className="space-y-6">
                <div className="rounded-xl border border-primary-200/60 dark:border-primary-900/40 bg-primary-50/50 dark:bg-primary-950/20 px-4 py-3 text-sm text-primary-900 dark:text-primary-100">
                  <strong>Accueil SIB 2026 (v4)</strong> — textes multilingues FR/EN/AR et photos de la maquette iframe.
                </div>
                <SiteTextContentPanel embedded />
                <SiteImagesPanel embedded defaultCategory="sib2026" />
              </div>
            )}

            {webSection === 'pages' && (
              <div className="space-y-4">
                <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3 text-sm text-neutral-600 dark:text-neutral-400">
                  Contenu JSON par page publique — vitrine SIB, contact, footer et salons UrbaEvent.
                </div>
                <PageContentAdminPanel embedded />
              </div>
            )}

            {webSection === 'media' && (
              <div className="space-y-4">
                <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3 text-sm text-neutral-600 dark:text-neutral-400">
                  Toutes les photos du site : accueil v4, variantes home, page 40 ans, Femmes &amp; Hommes.
                </div>
                <SiteImagesPanel embedded />
              </div>
            )}

            {webSection === 'promo' && (
              <div className="space-y-6">
                <BannerManagementPanel embedded />
                <VisitorPricingPanel embedded />
              </div>
            )}
          </>
        )}

        {mainTab === 'mobile' && (
          <div className="space-y-4">
            <div className="rounded-xl border border-emerald-200/60 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20 px-4 py-3 text-sm text-emerald-900 dark:text-emerald-100">
              <strong>APK UrbaEvent</strong> — hero, stats, photos salons, paiement VIP.
              Après modification d’une photo, tirez vers le bas sur l’accueil de l’app pour actualiser.
            </div>
            <MobileAppContentPanel embedded />
          </div>
        )}

        {mainTab === 'modules' && (
          <div className="space-y-4">
            <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3 text-sm text-neutral-600 dark:text-neutral-400">
              Contenus structurés gérés dans des écrans admin dédiés (événements, actualités, exposants, badge…).
            </div>
            <CmsAdminShortcutsPanel embedded />
          </div>
        )}
      </div>
    </motion.section>
  );
}
