import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { ROUTES } from '../../lib/routes';
import useAuthStore from '../../store/authStore';
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Youtube } from 'lucide-react';

const SOCIAL_LINKS = [
  { label: 'Facebook',    href: 'https://www.facebook.com/sibevent',         icon: Facebook },
  { label: 'X (Twitter)', href: 'https://x.com/sibevent',                    icon: Twitter },
  { label: 'LinkedIn',    href: 'https://www.linkedin.com/company/sib-event', icon: Linkedin },
  { label: 'YouTube',     href: 'https://www.youtube.com/@sibevent',         icon: Youtube },
] as const;

/**
 * SIB 2026 — Footer unifié
 * Un seul footer pour toutes les routes.
 * Fond neutral-900, typographie sobre, contact en colonne claire.
 */
export const Footer: React.FC = memo(() => {
  const currentYear = new Date().getFullYear();
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const isFreeVisitor = user?.type === 'visitor' && (user?.visitor_level === 'free' || !user?.visitor_level);

  const navColumns = [
    {
      title: t('footer.navigation'),
      links: [
        { label: t('footer.nav_home'),               href: ROUTES.HOME },
        { label: t('footer.nav_exhibitors_catalog'), href: ROUTES.EXHIBITORS },
        ...(isFreeVisitor ? [] : [{ label: t('footer.nav_networking'), href: ROUTES.NETWORKING }]),
        { label: t('footer.nav_conferences'),        href: ROUTES.EVENTS },
        { label: t('footer.nav_news'),               href: ROUTES.NEWS },
      ],
    },
    {
      title: t('footer.media_platform'),
      links: [
        { label: t('media.webinars'),    href: ROUTES.WEBINARS },
        { label: t('media.podcasts'),    href: ROUTES.PODCASTS },
        { label: t('media.capsules'),    href: ROUTES.CAPSULES_INSIDE },
        { label: t('media.live_studio'), href: ROUTES.LIVE_STUDIO },
        { label: t('media.library'),     href: ROUTES.MEDIA_LIBRARY },
      ],
    },
  ];

  return (
    <footer className="relative bg-neutral-900 text-neutral-200 overflow-hidden">
      {/* Motif zellige filigrane très subtil */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #C9A961 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative z-10 max-w-container mx-auto px-6 lg:px-8 pt-20 pb-10">
        {/* Grid principale */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12 pb-14 border-b border-neutral-800">
          {/* Brand */}
          <div className="md:col-span-4">
            <Link to={ROUTES.HOME} className="inline-flex items-center mb-6 group">
              <img
                src="/logo-sib2026.png"
                alt="SIB — Salon International du Bâtiment"
                className="h-14 w-auto object-contain brightness-0 invert transition-transform duration-300 group-hover:scale-[1.02]"
              />
            </Link>
            <p className="text-sm leading-relaxed text-neutral-400 mb-6 max-w-sm">
              {t('footer.tagline') || 'La plateforme officielle du Salon International du Bâtiment — El Jadida, Maroc.'}
            </p>
            <div className="flex gap-2">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="h-10 w-10 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-primary-600 hover:border-primary-600 transition-all duration-300"
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Colonnes navigation */}
          {navColumns.map((col) => (
            <div key={col.title} className="md:col-span-2">
              <h3 className="text-[11px] font-semibold text-accent-500 uppercase tracking-[0.2em] mb-5">
                {col.title}
              </h3>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-neutral-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact */}
          <div className="md:col-span-4">
            <h3 className="text-[11px] font-semibold text-accent-500 uppercase tracking-[0.2em] mb-5">
              {t('footer.strategic_contact') || 'Contact'}
            </h3>
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 shrink-0 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-accent-500" />
                </div>
                <div className="text-neutral-400 leading-relaxed">
                  <div className="font-medium text-neutral-200">URBACOM</div>
                  63, Imm B, Rés LE YACHT, Bd de la Corniche<br />
                  7ème étage N°185, Casablanca 20510
                </div>
              </div>
              <a
                href="mailto:Sib2026@urbacom.net"
                className="flex items-center gap-3 text-neutral-400 hover:text-white transition-colors"
              >
                <div className="h-9 w-9 shrink-0 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center">
                  <Mail className="h-4 w-4 text-accent-500" />
                </div>
                <span>Sib2026@urbacom.net</span>
              </a>
              <a
                href="tel:+212688500500"
                className="flex items-center gap-3 text-neutral-400 hover:text-white transition-colors"
              >
                <div className="h-9 w-9 shrink-0 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center">
                  <Phone className="h-4 w-4 text-accent-500" />
                </div>
                <span>+212 6 88 50 05 00</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bas de page */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-5">
          <p className="text-xs text-neutral-500">
            © {currentYear} SIB — Salon International du Bâtiment. {t('footer.all_rights') || 'Tous droits réservés'}.
          </p>
          <div className="flex items-center gap-6">
            <Link to={ROUTES.PRIVACY} className="text-xs text-neutral-500 hover:text-white transition-colors">
              {t('footer.privacy') || 'Confidentialité'}
            </Link>
            <Link to={ROUTES.TERMS} className="text-xs text-neutral-500 hover:text-white transition-colors">
              {t('footer.legal') || 'Mentions légales'}
            </Link>
            <Link to={ROUTES.COOKIES} className="text-xs text-neutral-500 hover:text-white transition-colors">
              Cookies
            </Link>
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-neutral-800 border border-neutral-700">
              <span className="h-1.5 w-1.5 rounded-full bg-success-500 animate-pulse" />
              <span className="text-[10px] font-medium text-success-500 uppercase tracking-wider">En ligne</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = 'Footer';
