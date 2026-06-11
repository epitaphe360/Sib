import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Home } from 'lucide-react';
import { getDefaultHomePageVariant, getHomeRouteForVariant } from '../../../config/homeVariants';
import { useTranslation } from '../../../hooks/useTranslation';
import { useHomeMenuItems } from './useHomeMenuItems';
import { HomeNavDropdown } from './HomeNavDropdown';
import { HomePagesNavPanel } from './HomePagesNavPanel';
import { HomeMenuSalonGridPanel } from './HomeMenuSalonGridPanel';
import { SIB2026 } from '../../home/sib2026/tokens';
import type { HomeMenuVariantId } from '../../../config/homeNavMenu';

interface HomeNavMenuBlockProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  /** Desktop dropdown */
  desktop?: boolean;
  variant?: HomeMenuVariantId;
  /** Header transparent Figma (P1–P8) */
  premium?: boolean;
  /** Lien Accueil / variante courante (nav classique uniquement) */
  homeTo?: string;
}

/** Bouton Accueil + panneau desktop */
export const HomeNavMenuBlockDesktop: React.FC<HomeNavMenuBlockProps> = ({
  isOpen,
  onOpen,
  onClose,
  variant,
  premium = false,
  homeTo,
}) => {
  const { t } = useTranslation();
  const items = useHomeMenuItems();
  const homeHref = homeTo ?? getHomeRouteForVariant(getDefaultHomePageVariant());

  const premiumTriggerClass =
    'px-2 xl:px-3 py-2 text-[11px] xl:text-xs font-semibold uppercase tracking-[0.08em] transition-colors flex items-center gap-1 whitespace-nowrap cursor-pointer select-none';
  const premiumTriggerState = isOpen
    ? 'text-white'
    : 'text-white/90 hover:text-white';

  const togglePremiumMenu = () => {
    if (isOpen) onClose();
    else onOpen();
  };

  return (
    <div
      className="relative shrink-0"
      onMouseEnter={onOpen}
      onMouseLeave={onClose}
    >
      {premium ? (
        <button
          type="button"
          aria-expanded={isOpen}
          aria-haspopup="true"
          aria-label={t('nav.home')}
          onClick={togglePremiumMenu}
          className={`${premiumTriggerClass} ${premiumTriggerState}`}
          style={isOpen ? { boxShadow: `inset 0 -2px 0 ${SIB2026.orange}` } : undefined}
        >
          <span>{t('nav.home')}</span>
          <ChevronDown
            className={`h-3.5 w-3.5 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            style={{ color: isOpen ? SIB2026.orange : 'currentColor' }}
            strokeWidth={2.5}
          />
        </button>
      ) : (
        <Link
          to={homeHref}
          className="relative px-1 xl:px-2.5 py-2 text-xs xl:text-[13px] font-medium tracking-tight text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white transition-all flex items-center gap-0.5 group whitespace-nowrap"
        >
          <span>{t('nav.home')}</span>
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          <span className="absolute bottom-0 left-5 right-5 h-[2px] bg-primary-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
        </Link>
      )}

      {isOpen && (
        <div
          className={`absolute top-full z-[500] ${premium ? 'left-0 pt-2' : 'left-0 pt-1'}`}
          onMouseEnter={onOpen}
          onMouseLeave={onClose}
        >
          {/* Pont invisible — évite la fermeture entre le bouton et le panneau */}
          <div className="absolute left-0 right-0 -top-2 h-2" aria-hidden />
          <HomeNavDropdown items={items} onNavigate={onClose} variant={variant} />
        </div>
      )}
    </div>
  );
};

/** Liste mobile — même grille que le panneau desktop */
export const HomeNavMenuBlockMobile: React.FC<{ onNavigate: () => void; premium?: boolean }> = ({
  onNavigate,
  premium = false,
}) => {
  const { t } = useTranslation();
  const items = useHomeMenuItems();

  return (
    <div
      className={
        premium
          ? 'border-b border-white/15 pb-3 mb-2'
          : 'border-b border-neutral-200 dark:border-neutral-800 pb-3 mb-2'
      }
    >
      <HomePagesNavPanel onNavigate={onNavigate} compact />
      {!premium && (
        <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-800">
          <p className="px-4 pb-2 text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            {t('nav.home_menu.subtitle_pages')}
          </p>
          <HomeMenuSalonGridPanel items={items} onNavigate={onNavigate} compact />
        </div>
      )}
    </div>
  );
};

export default HomeNavMenuBlockDesktop;
