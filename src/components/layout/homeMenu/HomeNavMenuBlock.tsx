import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { getDefaultHomePageVariant, getHomeRouteForVariant } from '../../../config/homeVariants';
import { useTranslation } from '../../../hooks/useTranslation';
import { useHomeMenuItems } from './useHomeMenuItems';
import { HomeNavDropdown } from './HomeNavDropdown';
import { HomeMenuSalonGridPanel } from './HomeMenuSalonGridPanel';
import type { HomeMenuVariantId } from '../../../config/homeNavMenu';

interface HomeNavMenuBlockProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  /** Desktop dropdown */
  desktop?: boolean;
  variant?: HomeMenuVariantId;
}

/** Bouton Accueil + panneau desktop */
export const HomeNavMenuBlockDesktop: React.FC<HomeNavMenuBlockProps> = ({
  isOpen,
  onOpen,
  onClose,
  variant,
}) => {
  const { t } = useTranslation();
  const items = useHomeMenuItems();

  return (
    <div
      className="relative"
      onMouseEnter={onOpen}
      onMouseLeave={onClose}
    >
      <Link
        to={getHomeRouteForVariant(getDefaultHomePageVariant())}
        className="relative px-1 xl:px-2.5 py-2 text-xs xl:text-[13px] font-medium tracking-tight text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white transition-all flex items-center gap-0.5 group whitespace-nowrap"
      >
        <span>{t('nav.home')}</span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        <span className="absolute bottom-0 left-5 right-5 h-[2px] bg-primary-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
      </Link>
      {isOpen && (
        <div
          className="absolute left-0 top-full z-[250] pt-1"
          onMouseEnter={onOpen}
          onMouseLeave={onClose}
        >
          <HomeNavDropdown items={items} onNavigate={onClose} variant={variant} />
        </div>
      )}
    </div>
  );
};

/** Liste mobile — même grille que le panneau desktop */
export const HomeNavMenuBlockMobile: React.FC<{ onNavigate: () => void }> = ({ onNavigate }) => {
  const items = useHomeMenuItems();

  return (
    <div className="border-b border-neutral-200 dark:border-neutral-800 pb-3 mb-2">
      <HomeMenuSalonGridPanel items={items} onNavigate={onNavigate} compact />
    </div>
  );
};

export default HomeNavMenuBlockDesktop;
