import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { ROUTES } from '../../lib/routes';
import { useTranslation } from '../../hooks/useTranslation';
import { HomePagesNavPanel } from './homeMenu/HomePagesNavPanel';
import { SIB2026 } from '../home/sib2026/tokens';

interface PremiumSib2026NavProps {
  homeBase: string;
  isMenuOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

/**
 * Navigation Figma P1–P8 : ACCUEIL (sous-menu) + liens maquette.
 * Barre navy semi-opaque pour lisibilité sur le hero clair.
 */
export const PremiumSib2026DesktopNav: React.FC<PremiumSib2026NavProps> = ({
  homeBase,
  isMenuOpen,
  onOpen,
  onClose,
}) => {
  const { t } = useTranslation();

  const navLinks = [
    { name: t('mockup.nav.about'), href: '/about' },
    { name: t('mockup.nav.exhibit'), href: ROUTES.EXHIBITOR_SUBSCRIPTION },
    { name: t('mockup.nav.visit'), href: `${homeBase}#visiter` },
    { name: t('mockup.nav.program'), href: ROUTES.EVENTS },
    { name: t('mockup.nav.international'), href: ROUTES.PAVILIONS },
    { name: t('mockup.nav.info'), href: ROUTES.ACCOMMODATION },
  ];

  const linkClass =
    'px-2 xl:px-3 py-2 text-[11px] xl:text-xs font-semibold uppercase tracking-[0.08em] text-white hover:text-white/100 transition-colors whitespace-nowrap';

  return (
    <div
      className="relative inline-flex items-center gap-0 xl:gap-0.5 rounded-md border border-white/15 px-1 py-0.5 shadow-lg"
      style={{ backgroundColor: 'rgba(0, 21, 48, 0.88)' }}
      onMouseLeave={onClose}
    >
      <div className="relative">
        <button
          type="button"
          aria-expanded={isMenuOpen}
          aria-haspopup="true"
          aria-label="Accueil — choisir une page d'accueil (P1 à P8)"
          onClick={() => (isMenuOpen ? onClose() : onOpen())}
          className={`${linkClass} inline-flex items-center gap-1 cursor-pointer border-0 bg-transparent`}
          style={
            isMenuOpen
              ? { boxShadow: `inset 0 -2px 0 ${SIB2026.orange}`, color: '#fff' }
              : { color: '#fff' }
          }
        >
          <span className="whitespace-nowrap">ACCUEIL</span>
          <ChevronDown
            className={`h-3.5 w-3.5 shrink-0 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`}
            style={{ color: isMenuOpen ? SIB2026.orange : '#fff' }}
            strokeWidth={2.5}
            aria-hidden
          />
        </button>

        {isMenuOpen && (
          <div className="absolute left-0 top-full z-[600] pt-2">
            <HomePagesNavPanel onNavigate={onClose} />
          </div>
        )}
      </div>

      {navLinks.map((item) => (
        <Link key={item.href} to={item.href} className={linkClass}>
          {item.name}
        </Link>
      ))}
    </div>
  );
};

export default PremiumSib2026DesktopNav;
