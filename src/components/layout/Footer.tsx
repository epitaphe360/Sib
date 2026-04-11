import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { ROUTES } from '../../lib/routes';
import useAuthStore from '../../store/authStore';
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Linkedin,
  Youtube
} from 'lucide-react';
import { MoroccanPattern } from '../ui/MoroccanDecor';

// OPTIMIZATION: Memoized Footer component to prevent unnecessary re-renders
export const Footer: React.FC = memo(() => {
  const currentYear = new Date().getFullYear();
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const isFreeVisitor = user?.type === 'visitor' && (user?.visitor_level === 'free' || !user?.visitor_level);

  return (
    <footer className="bg-slate-950 text-white relative overflow-hidden font-sans border-t border-slate-900">

      {/* Background Pattern Premium */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[300px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 pb-16 border-b border-white/5">
          
          {/* Brand Identity */}
          <div className="lg:col-span-4">
            <Link to={ROUTES.HOME} className="inline-flex items-center mb-8">
              <img
                src="/logo-fond-bleu.jpg"
                alt="SIB - Salon International du B�timent"
                className="h-16 w-auto object-contain"
              />
            </Link>
            
            {/* Social Luxe */}
            <div className="flex gap-3">
              {[
                { icon: Facebook, label: 'Facebook' },
                { icon: Twitter, label: 'Twitter' },
                { icon: Linkedin, label: 'Linkedin' },
                { icon: Youtube, label: 'Youtube' }
              ].map((social) => (
                <a
                  key={social.label}
                  href="#"
                  className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 hover:border-blue-500/50 transition-all group"
                  title={social.label}
                >
                  <social.icon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Links Grouped */}
          <div className="lg:col-span-2">
            <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-8">{t('footer.navigation')}</h3>
            <ul className="space-y-4">
              {[
                { label: t('footer.nav_home'), href: ROUTES.HOME },
                { label: t('footer.nav_exhibitors_catalog'), href: ROUTES.EXHIBITORS },
                ...(isFreeVisitor ? [] : [{ label: t('footer.nav_networking'), href: ROUTES.NETWORKING }]),
                { label: t('footer.nav_conferences'), href: ROUTES.EVENTS },
                { label: t('footer.nav_news'), href: ROUTES.NEWS }
              ].map((link) => (
                <li key={link.label}>
                  <Link to={link.href} className="text-slate-500 hover:text-white font-bold text-sm tracking-tight transition-colors">
                    {link.label}
                  </Link>
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
                { label: t('media.library'), href: ROUTES.MEDIA_LIBRARY }
              ].map((link) => (
                <li key={link.label}>
                  <Link to={link.href} className="text-slate-500 hover:text-white font-bold text-sm tracking-tight transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Presence Luxe */}
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
                <a href="mailto:contact@sib2026.ma" className="text-sm font-bold text-slate-300 hover:text-white hover:underline transition-all">
                  contact@sib2026.ma
                </a>
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