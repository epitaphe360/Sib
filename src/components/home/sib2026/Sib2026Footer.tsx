import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Mail, Phone, MapPin, Linkedin, Facebook, Instagram, Youtube } from 'lucide-react';
import { ROUTES } from '../../../lib/routes';
import { useTranslation } from '../../../hooks/useTranslation';
import { SIB2026, getPremiumHomeBase } from './tokens';

export const Sib2026Footer: React.FC = () => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const homeBase = getPremiumHomeBase(pathname);
  const year = new Date().getFullYear();

  const columns = [
    {
      title: t('mockup.footer.quick'),
      links: [
        { label: t('mockup.nav.about'), href: ROUTES.PRESENTATION },
        { label: t('mockup.nav.exhibit'), href: ROUTES.EXHIBITOR_SUBSCRIPTION },
        { label: t('mockup.nav.visit'), href: `${homeBase}#visiter` },
        { label: t('mockup.nav.program'), href: ROUTES.EVENTS },
      ],
    },
    {
      title: t('mockup.footer.info'),
      links: [
        { label: t('mockup.footer.venue'), href: ROUTES.VENUE },
        { label: t('mockup.footer.accommodation'), href: ROUTES.ACCOMMODATION },
        { label: t('mockup.footer.contact'), href: ROUTES.CONTACT },
        { label: t('mockup.footer.faq'), href: ROUTES.SUPPORT },
      ],
    },
    {
      title: t('mockup.footer.download'),
      links: [
        { label: t('mockup.footer.brochure'), href: ROUTES.TELECHARGEMENTS },
        { label: t('mockup.footer.plan'), href: ROUTES.HALL_MAP },
        { label: t('mockup.footer.press'), href: ROUTES.NEWS },
      ],
    },
  ];

  const socials = [
    { Icon: Linkedin,  href: 'https://www.linkedin.com/company/sib-event', label: 'LinkedIn' },
    { Icon: Facebook,  href: 'https://www.facebook.com/sibevent',          label: 'Facebook' },
    { Icon: Instagram, href: 'https://www.instagram.com/sibevent',         label: 'Instagram' },
    { Icon: Youtube,   href: 'https://www.youtube.com/@sibevent',          label: 'YouTube' },
  ];

  return (
    <footer style={{ backgroundColor: SIB2026.navy }} className="text-white">
      <div className="max-w-[1280px] mx-auto px-6 sm:px-10 lg:px-12 py-14 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          <div className="lg:col-span-3">
            <Link to={ROUTES.HOME}>
              <img src="/logo-sib2026.png" alt="SIB 40 Ans" className="h-14 w-auto brightness-0 invert" />
            </Link>
            <p className="mt-5 text-[11px] leading-relaxed text-white/50 max-w-xs">{t('mockup.footer.tagline')}</p>
          </div>

          {columns.map((col) => (
            <div key={col.title} className="lg:col-span-2">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.18em] mb-4 text-white/90">{col.title}</h3>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link to={l.href} className="text-[11px] text-white/55 hover:text-white transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="lg:col-span-3 sm:col-span-2">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.18em] mb-4 text-white/90">
              {t('mockup.footer.contact_title')}
            </h3>
            <ul className="space-y-2.5 text-[11px] text-white/55 mb-6">
              <li className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 shrink-0" style={{ color: SIB2026.orange }} />
                contact@sib2026.ma
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 shrink-0" style={{ color: SIB2026.orange }} />
                +212 5 23 00 00 00
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" style={{ color: SIB2026.orange }} />
                El Jadida, Maroc
              </li>
            </ul>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] mb-3">{t('mockup.footer.follow')}</p>
            <div className="flex gap-2">
              {socials.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="h-9 w-9 rounded-full border border-white/25 flex items-center justify-center text-white/80 hover:border-white/50 transition-colors"
                >
                  <Icon className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <p className="text-[10px] text-white/35 pt-8 text-center">
          © {year} SIB — {t('mockup.footer.rights')}
        </p>
      </div>
    </footer>
  );
};
