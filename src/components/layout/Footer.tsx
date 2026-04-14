import React, { memo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { ROUTES } from '../../lib/routes';
import useAuthStore from '../../store/authStore';
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Youtube, Grid3X3 } from 'lucide-react';

const URBA_ROUTES = ['/salons', '/salon/sir', '/salon/sip', '/salon/btp', '/salon/sie'];

export const Footer: React.FC = memo(() => {
  const currentYear = new Date().getFullYear();
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const location = useLocation();
  const isFreeVisitor = user?.type === 'visitor' && (user?.visitor_level === 'free' || !user?.visitor_level);
  const isUrbaRoute = URBA_ROUTES.some(r => location.pathname.startsWith(r));

  /* ── UrbaEvent footer ───────────────────────────────────── */
  if (isUrbaRoute) {
    return (
      <footer className="bg-[#0D2137] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-white/10">

            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <Link to={ROUTES.SALON_SELECTION} className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl bg-[#4598D1] flex items-center justify-center">
                  <Grid3X3 className="w-4.5 h-4.5 text-white" />
                </div>
                <span className="text-xl font-black">Urba<span className="text-[#4598D1]">Event</span></span>
              </Link>
              <p className="text-white/50 text-sm leading-relaxed mb-5">
                La plateforme digitale officielle des salons professionnels Urbacom au Maroc.
              </p>
              <div className="flex gap-2">
                {[Facebook, Twitter, Linkedin, Youtube].map((Icon, i) => (
                  <a key={i} href="#" className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all">
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Salons */}
            <div>
              <h3 className="text-[10px] font-black text-[#4598D1] uppercase tracking-[0.3em] mb-5">Salons</h3>
              <ul className="space-y-3">
                {[
                  { label: 'SIB — Bâtiment', href: ROUTES.HOME },
                  { label: 'SIR — Immobilier', href: ROUTES.SALON_SIR },
                  { label: 'SIP — Promotion', href: ROUTES.SALON_SIP },
                  { label: 'BTP — Travaux Publics', href: ROUTES.SALON_BTP },
                  { label: 'SIE — Environnement', href: ROUTES.SALON_SIE },
                ].map(link => (
                  <li key={link.label}>
                    <Link to={link.href} className="text-white/50 hover:text-white text-sm font-semibold transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Compte */}
            <div>
              <h3 className="text-[10px] font-black text-[#4598D1] uppercase tracking-[0.3em] mb-5">Mon compte</h3>
              <ul className="space-y-3">
                {[
                  { label: 'S\'inscrire', href: ROUTES.REGISTER },
                  { label: 'Se connecter', href: ROUTES.LOGIN },
                  { label: 'Mon E-Badge', href: ROUTES.BADGE },
                  { label: 'Mon profil', href: ROUTES.PROFILE },
                  { label: 'Dashboard', href: ROUTES.DASHBOARD },
                ].map(link => (
                  <li key={link.label}>
                    <Link to={link.href} className="text-white/50 hover:text-white text-sm font-semibold transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-[10px] font-black text-[#4598D1] uppercase tracking-[0.3em] mb-5">Contact</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#4598D1] mt-0.5 flex-shrink-0" />
                  <span className="text-white/50 text-xs leading-relaxed">19, rue Badr Assayab<br />Casablanca – Maroc</span>
                </div>
                <a href="mailto:contact@urbaevent.ma" className="flex items-center gap-3 text-white/50 hover:text-white text-xs transition-colors">
                  <Mail className="w-4 h-4 text-[#4598D1] flex-shrink-0" />
                  contact@urbaevent.ma
                </a>
                <a href="tel:+212668385228" className="flex items-center gap-3 text-white/50 hover:text-white text-xs transition-colors">
                  <Phone className="w-4 h-4 text-[#4598D1] flex-shrink-0" />
                  +212 6 68 38 52 28
                </a>
              </div>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-white/30 text-[10px] font-black uppercase tracking-widest">
              © {currentYear} Urbacom — UrbaEvent. Tous droits réservés.
            </p>
            <div className="flex items-center gap-6">
              {[
                { label: 'Confidentialité', href: ROUTES.PRIVACY },
                { label: 'CGU', href: ROUTES.TERMS },
                { label: 'Cookies', href: ROUTES.COOKIES },
              ].map(l => (
                <Link key={l.label} to={l.href} className="text-white/30 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors">
                  {l.label}
                </Link>
              ))}
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 rounded-full border border-white/10">
                <div className="w-1.5 h-1.5 rounded-full bg-[#4CAF50] animate-pulse" />
                <span className="text-[9px] font-black text-[#4CAF50] uppercase tracking-wide">En ligne</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  /* ── SIB footer (existant, inchangé) ───────────────────── */
  return (
    <footer className="bg-slate-950 text-white relative overflow-hidden font-sans border-t border-slate-900">
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[300px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 pb-16 border-b border-white/5">

          <div className="lg:col-span-4">
            <Link to={ROUTES.HOME} className="inline-flex items-center mb-8">
              <img src="/logo-sib2026.png" alt="SIB — Salon International du Bâtiment" className="h-16 w-auto object-contain" />
            </Link>
            <div className="flex gap-3">
              {[Facebook, Twitter, Linkedin, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 hover:border-blue-500/50 transition-all group">
                  <Icon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-8">{t('footer.navigation')}</h3>
            <ul className="space-y-4">
              {[
                { label: t('footer.nav_home'), href: ROUTES.HOME },
                { label: t('footer.nav_exhibitors_catalog'), href: ROUTES.EXHIBITORS },
                ...(isFreeVisitor ? [] : [{ label: t('footer.nav_networking'), href: ROUTES.NETWORKING }]),
                { label: t('footer.nav_conferences'), href: ROUTES.EVENTS },
                { label: t('footer.nav_news'), href: ROUTES.NEWS },
              ].map(link => (
                <li key={link.label}>
                  <Link to={link.href} className="text-slate-500 hover:text-white font-bold text-sm tracking-tight transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-8">{t('footer.media_platform')}</h3>
            <ul className="space-y-4">
              {[
                { label: t('media.webinars'), href: ROUTES.WEBINARS },
                { label: t('media.podcasts'), href: ROUTES.PODCASTS },
                { label: t('media.capsules'), href: ROUTES.CAPSULES_INSIDE },
                { label: t('media.live_studio'), href: ROUTES.LIVE_STUDIO },
                { label: t('media.library'), href: ROUTES.MEDIA_LIBRARY },
              ].map(link => (
                <li key={link.label}>
                  <Link to={link.href} className="text-slate-500 hover:text-white font-bold text-sm tracking-tight transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-4">
            <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-8">{t('footer.strategic_contact')}</h3>
            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 space-y-6">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 shrink-0 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <div className="text-sm font-black text-white uppercase tracking-wider">LINECO EVENTS</div>
                  <div className="text-[11px] font-bold text-slate-500">19, rue Badr Assayab – 1er étage n°2</div>
                  <div className="text-[11px] font-bold text-slate-500">Casablanca – Maroc</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 shrink-0 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center">
                  <Mail className="h-5 w-5 text-emerald-400" />
                </div>
                <a href="mailto:contact@sibevent.com" className="text-sm font-bold text-slate-300 hover:text-white hover:underline transition-all">contact@sibevent.com</a>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 shrink-0 bg-slate-500/10 border border-slate-500/20 rounded-xl flex items-center justify-center">
                  <Phone className="h-5 w-5 text-slate-400" />
                </div>
                <a href="tel:+212668385228" className="text-sm font-bold text-slate-300 hover:text-white hover:underline transition-all">+212 6 68 38 52 28</a>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">
            © {currentYear} SIB GLOBAL SYMPOSIUM. {t('footer.all_rights').toUpperCase()}.
          </div>
          <div className="flex items-center gap-8">
            <Link to={ROUTES.PRIVACY} className="text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors">{t('footer.privacy')}</Link>
            <Link to={ROUTES.TERMS} className="text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors">{t('footer.legal')}</Link>
            <Link to={ROUTES.COOKIES} className="text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors">Cookies</Link>
            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[9px] font-black text-emerald-500 uppercase">System Active</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
});
