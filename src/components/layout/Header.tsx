import React, { useState, useCallback, useEffect, memo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  User,
  Calendar,
  MessageCircle,
  Bell,
  Video,
  Mic,
  Play,
} from 'lucide-react';
import { ROUTES } from '../../lib/routes';
import { Button } from '../ui/Button';
import useAuthStore from '../../store/authStore';
import { useMediaVisibilityStore } from '../../store/mediaVisibilityStore';
import { LanguageSelector } from '../ui/LanguageSelector';
import { ThemeToggle } from '../ui/ThemeToggle';
import { useTranslation } from '../../hooks/useTranslation';
import { MoroccanPattern } from '../ui/MoroccanDecor';
import { isAuthInitialized } from '../../lib/initAuth';

// OPTIMIZATION: Memoized Header component to prevent unnecessary re-renders
export const Header: React.FC = memo(() => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSalonMenuOpen, setIsSalonMenuOpen] = useState(false);
  const [isExposerMenuOpen, setIsExposerMenuOpen] = useState(false);
  const [isVisiterMenuOpen, setIsVisiterMenuOpen] = useState(false);
  const [isPartenairesMenuOpen, setIsPartenairesMenuOpen] = useState(false);
  const [isMediaMenuOpen, setIsMediaMenuOpen] = useState(false);
  const { user, isAuthenticated, isLoading, logout } = useAuthStore();
  const { t } = useTranslation();
  const location = useLocation();

  // ✅ CRITICAL: Ne pas afficher "Se connecter" pendant l'initialisation
  const authReady = isAuthInitialized() && !isLoading;

  // ✅ Fermer TOUS les menus au changement de route (résout le bug menu ouvert sur mobile)
  useEffect(() => {
    setIsMenuOpen(false);
    setIsProfileOpen(false);
    setIsSalonMenuOpen(false);
    setIsExposerMenuOpen(false);
    setIsVisiterMenuOpen(false);
    setIsPartenairesMenuOpen(false);
    setIsMediaMenuOpen(false);
  }, [location.pathname]);

  // ✅ Fermer le menu mobile quand on clique en dehors (overlay)
  // ✅ Bloquer le scroll du body quand le menu mobile est ouvert
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen]);

  // OPTIMIZATION: Memoized callbacks to prevent re-creating functions on every render
  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev);
    setIsProfileOpen(false);
  }, []);
  const toggleProfile = useCallback(() => {
    setIsProfileOpen(prev => !prev);
    setIsMenuOpen(false);
  }, []);
  const toggleSalonMenu = useCallback(() => setIsSalonMenuOpen(prev => !prev), []);
  const toggleExposerMenu = useCallback(() => setIsExposerMenuOpen(prev => !prev), []);
  const toggleVisiterMenu = useCallback(() => setIsVisiterMenuOpen(prev => !prev), []);
  const togglePartenairesMenu = useCallback(() => setIsPartenairesMenuOpen(prev => !prev), []);
  const toggleMediaMenu = useCallback(() => setIsMediaMenuOpen(prev => !prev), []);
  const closeMenu = useCallback(() => setIsMenuOpen(false), []);
  const closeProfile = useCallback(() => setIsProfileOpen(false), []);

  const handleLogout = useCallback(() => {
    logout();
    setIsProfileOpen(false);
  }, [logout]);

  const isFreeVisitor = user?.type === 'visitor' && (user?.visitor_level === 'free' || !user?.visitor_level);

  // ══════════════════════════════════════════════
  // MENU : LE SALON
  // ══════════════════════════════════════════════
  const salonMenuItems = [
    { name: t('salon.presentation'), href: ROUTES.PRESENTATION, description: t('salon.presentation_desc') },
    { name: t('salon.nouveautes'), href: ROUTES.NOUVEAUTES, description: t('salon.nouveautes_desc') },
    { name: t('salon.secteurs'), href: ROUTES.SECTEURS, description: t('salon.secteurs_desc') },
    { name: t('salon.editions'), href: ROUTES.EDITIONS, description: t('salon.editions_desc') },
    { name: t('salon.telechargements'), href: ROUTES.TELECHARGEMENTS, description: t('salon.telechargements_desc') },
  ];

  // ══════════════════════════════════════════════
  // MENU : EXPOSER
  // ══════════════════════════════════════════════
  const exposerMenuItems = [
    { name: t('exposer.pourquoi'), href: ROUTES.POURQUOI_EXPOSER, description: t('exposer.pourquoi_desc') },
    { name: t('exposer.espaces'), href: ROUTES.ESPACES_SIB, description: t('exposer.espaces_desc') },
    { name: t('exposer.reserver'), href: ROUTES.EXHIBITOR_SUBSCRIPTION, description: t('exposer.reserver_desc') },
    { name: t('exposer.annuaire'), href: ROUTES.EXHIBITORS, description: t('exposer.annuaire_desc') },
  ];

  // ══════════════════════════════════════════════
  // MENU : VISITER
  // ══════════════════════════════════════════════
  const visiterMenuItems = [
    { name: t('visiter.pourquoi'), href: ROUTES.POURQUOI_VISITER, description: t('visiter.pourquoi_desc') },
    { name: t('visiter.infos'), href: ROUTES.INFOS_PRATIQUES, description: t('visiter.infos_desc') },
    { name: t('visiter.badge'), href: ROUTES.REGISTER_VISITOR, description: t('visiter.badge_desc') },
    { name: t('visiter.vip'), href: ROUTES.VISITOR_VIP_REGISTRATION, description: t('visiter.vip_desc') },
  ];

  // ══════════════════════════════════════════════
  // MENU : PARTENAIRES
  // ══════════════════════════════════════════════
  const partenairesMenuItems = [
    { name: t('partenaires.devenir'), href: ROUTES.PARTNER_SUBSCRIPTION, description: t('partenaires.devenir_desc') },
    { name: t('partenaires.annuaire'), href: ROUTES.PARTNERS, description: t('partenaires.annuaire_desc') },
  ];

  // ══════════════════════════════════════════════
  // MENU : MÉDIAS (conditionnel)
  // ══════════════════════════════════════════════

  const { mediaVisible } = useMediaVisibilityStore();

  const mediaMenuItems = mediaVisible ? [
    { name: t('media.webinars'), href: ROUTES.WEBINARS, description: t('media.webinars_desc'), icon: Video },
    { name: t('media.podcasts'), href: ROUTES.PODCASTS, description: t('media.podcasts_desc'), icon: Mic },
    { name: t('media.capsules'), href: ROUTES.CAPSULES_INSIDE, description: t('media.capsules_desc'), icon: Play },
    { name: t('media.live_studio'), href: ROUTES.LIVE_STUDIO, description: t('media.live_studio_desc'), icon: Video },
    { name: t('media.best_moments'), href: ROUTES.BEST_MOMENTS, description: t('media.best_moments_desc'), icon: Play },
    { name: t('media.testimonials'), href: ROUTES.TESTIMONIALS, description: t('media.testimonials_desc'), icon: Video },
    { name: t('media.library'), href: ROUTES.MEDIA_LIBRARY, description: t('media.library_desc'), icon: Play },
  ] : [];
  return (
    <header className="fixed top-0 left-0 right-0 z-[200] transition-all duration-500 bg-white/90 sm:bg-white/75 backdrop-blur-xl border-b border-slate-200/60 shadow-[0_8px_26px_-18px_rgba(15,35,64,0.5)]" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
      {/* Pattern Zellige Subtil en fond */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #0f172a 1px, transparent 0)', backgroundSize: '16px 16px' }}></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex justify-between items-center h-16 sm:h-20 xl:h-28">
          
          {/* Logo Premium */}
          <Link to={ROUTES.HOME} className="flex-shrink-0 flex items-center group">
            <div className="relative">
              <div className="absolute -inset-2 bg-blue-500/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative w-auto flex items-center">
                <img
                  src="/logo-sib2026.png"
                  alt="SIB - Salon International du Bâtiment"
                  className="h-14 sm:h-18 xl:h-24 w-auto object-contain"
                />
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-0 xl:gap-0.5 flex-1 justify-center">

            {/* Le Salon ▼ */}
            <div className="relative" onMouseEnter={() => setIsSalonMenuOpen(true)} onMouseLeave={() => setIsSalonMenuOpen(false)}>
              <button className="relative px-1 xl:px-2.5 py-2 text-[10px] xl:text-xs font-semibold uppercase tracking-normal xl:tracking-wide text-slate-600 hover:text-slate-900 transition-all flex items-center gap-1 group whitespace-nowrap">
                <span>{t('nav.le_salon')}</span>
                <span className="absolute bottom-0 left-5 right-5 h-[2px] bg-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </button>
              {isSalonMenuOpen && (
                <div className="absolute left-0 mt-0 w-72 bg-white rounded-lg shadow-2xl border border-slate-200 py-2 z-[250]">
                  {salonMenuItems.map((item) => (
                    <Link key={item.name} to={item.href} className="flex items-start px-4 py-3 hover:bg-slate-50 transition-colors">
                      <div>
                        <div className="font-semibold text-slate-900">{item.name}</div>
                        <div className="text-xs text-slate-500">{item.description}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Exposer ▼ */}
            <div className="relative" onMouseEnter={() => setIsExposerMenuOpen(true)} onMouseLeave={() => setIsExposerMenuOpen(false)}>
              <button className="relative px-1 xl:px-2.5 py-2 text-[10px] xl:text-xs font-semibold uppercase tracking-normal xl:tracking-wide text-slate-600 hover:text-slate-900 transition-all flex items-center gap-1 group whitespace-nowrap">
                <span>{t('nav.exposer')}</span>
                <span className="absolute bottom-0 left-5 right-5 h-[2px] bg-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </button>
              {isExposerMenuOpen && (
                <div className="absolute left-0 mt-0 w-72 bg-white rounded-lg shadow-2xl border border-slate-200 py-2 z-[250]">
                  {exposerMenuItems.map((item) => (
                    <Link key={item.name} to={item.href} className="flex items-start px-4 py-3 hover:bg-slate-50 transition-colors">
                      <div>
                        <div className="font-semibold text-slate-900">{item.name}</div>
                        <div className="text-xs text-slate-500">{item.description}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Visiter ▼ */}
            <div className="relative" onMouseEnter={() => setIsVisiterMenuOpen(true)} onMouseLeave={() => setIsVisiterMenuOpen(false)}>
              <button className="relative px-1 xl:px-2.5 py-2 text-[10px] xl:text-xs font-semibold uppercase tracking-normal xl:tracking-wide text-slate-600 hover:text-slate-900 transition-all flex items-center gap-1 group whitespace-nowrap">
                <span>{t('nav.visiter')}</span>
                <span className="absolute bottom-0 left-5 right-5 h-[2px] bg-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </button>
              {isVisiterMenuOpen && (
                <div className="absolute left-0 mt-0 w-72 bg-white rounded-lg shadow-2xl border border-slate-200 py-2 z-[250]">
                  {visiterMenuItems.map((item) => (
                    <Link key={item.name} to={item.href} className="flex items-start px-4 py-3 hover:bg-slate-50 transition-colors">
                      <div>
                        <div className="font-semibold text-slate-900">{item.name}</div>
                        <div className="text-xs text-slate-500">{item.description}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Partenaires ▼ */}
            <div className="relative" onMouseEnter={() => setIsPartenairesMenuOpen(true)} onMouseLeave={() => setIsPartenairesMenuOpen(false)}>
              <button className="relative px-1 xl:px-2.5 py-2 text-[10px] xl:text-xs font-semibold uppercase tracking-normal xl:tracking-wide text-slate-600 hover:text-slate-900 transition-all flex items-center gap-1 group whitespace-nowrap">
                <span>{t('nav.partners')}</span>
                <span className="absolute bottom-0 left-5 right-5 h-[2px] bg-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </button>
              {isPartenairesMenuOpen && (
                <div className="absolute left-0 mt-0 w-72 bg-white rounded-lg shadow-2xl border border-slate-200 py-2 z-[250]">
                  {partenairesMenuItems.map((item) => (
                    <Link key={item.name} to={item.href} className="flex items-start px-4 py-3 hover:bg-slate-50 transition-colors">
                      <div>
                        <div className="font-semibold text-slate-900">{item.name}</div>
                        <div className="text-xs text-slate-500">{item.description}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="w-[1px] h-5 bg-slate-200 mx-0.5 xl:mx-1" />

            {/* Programme (lien direct) */}
            <Link
              to={ROUTES.EVENTS}
              className="relative px-1 xl:px-2.5 py-2 text-[10px] xl:text-xs font-semibold uppercase tracking-normal xl:tracking-wide text-slate-600 hover:text-slate-900 transition-all group whitespace-nowrap"
            >
              {t('nav.programme')}
              <span className="absolute bottom-0 left-5 right-5 h-[2px] bg-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
            </Link>

            {/* Réseautage (lien direct) */}
            <Link
              to={ROUTES.NETWORKING}
              className="relative px-1 xl:px-2.5 py-2 text-[10px] xl:text-xs font-semibold uppercase tracking-normal xl:tracking-wide text-slate-600 hover:text-slate-900 transition-all group whitespace-nowrap"
            >
              {t('nav.networking')}
              <span className="absolute bottom-0 left-5 right-5 h-[2px] bg-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
            </Link>

            {/* Médias ▼ (conditionnel) */}
            {mediaVisible && (
            <div className="relative" onMouseEnter={() => setIsMediaMenuOpen(true)} onMouseLeave={() => setIsMediaMenuOpen(false)}>
              <button className="relative px-1 xl:px-2.5 py-2 text-[10px] xl:text-xs font-semibold uppercase tracking-normal xl:tracking-wide text-slate-600 hover:text-slate-900 transition-all flex items-center gap-1 group whitespace-nowrap">
                <Video className="w-3 h-3 xl:w-3.5 xl:h-3.5 text-blue-500" />
                <span>{t('media.menu_title')}</span>
                <span className="absolute bottom-0 left-5 right-5 h-[2px] bg-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </button>
              {isMediaMenuOpen && (
                <div className="absolute left-0 mt-0 w-64 bg-white rounded-lg shadow-2xl border border-slate-200 py-2 z-[250]">
                  {mediaMenuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link key={item.name} to={item.href} className="flex items-start px-4 py-3 hover:bg-slate-50 transition-colors group">
                        <Icon className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0 text-slate-400 group-hover:text-blue-600" />
                        <div>
                          <div className="font-semibold text-slate-900">{item.name}</div>
                          <div className="text-xs text-slate-500">{item.description}</div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
            )}

            {/* Contact */}
            <Link
              to="/contact"
              className="px-1 xl:px-2.5 py-2 text-[10px] xl:text-xs font-semibold uppercase tracking-normal xl:tracking-wide text-slate-600 hover:text-slate-900 transition-all flex items-center gap-1 group whitespace-nowrap"
            >
              <span>{t('nav.contact')}</span>
              <span className="absolute bottom-0 left-5 right-5 h-[2px] bg-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
            </Link>
          </nav>

          {/* Actions & Profile Luxe */}
          <div className="flex-shrink-0 flex items-center space-x-1 xl:space-x-3">
            <div className="hidden xl:flex items-center gap-3">
               <LanguageSelector />
               <ThemeToggle />
            </div>

            {isAuthenticated ? (
              <>
              {/* Notifications - masqué sur mobile */}
              <button data-testid="notifications-button" className="hidden sm:flex p-1.5 min-w-[36px] min-h-[36px] items-center justify-center text-gray-400 hover:text-gray-600 transition-colors relative">
                <Bell className="h-5 w-5" />
                </button>

                {/* Messages - masqué sur mobile */}
                <Link 
                  to={ROUTES.MESSAGES} 
                  className="hidden sm:flex p-1.5 min-w-[36px] min-h-[36px] items-center justify-center text-gray-400 hover:text-gray-600 transition-colors relative"
                >
                  <MessageCircle className="h-5 w-5" />
                </Link>

                {/* Calendar - masqué sur mobile */}
                <Link aria-label="Calendar" 
                  to={ROUTES.APPOINTMENTS} 
                  className="hidden sm:flex p-1.5 min-w-[36px] min-h-[36px] items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Calendar className="h-5 w-5" />
                </Link>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={toggleProfile}
                    data-testid="user-menu"
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <span className="hidden md:block text-sm font-medium text-gray-700">
                      {user?.profile?.firstName || t('nav.my_account')}
                    </span>
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-[250]">
                      {/* Menu Admin */}
                      {user?.type === 'admin' && (
                        <>
                          <Link
                            to={ROUTES.PROFILE}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={closeProfile}
                          >
                            {t('nav.admin_profile')}
                          </Link>
                          <Link
                            to={ROUTES.DASHBOARD}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={closeProfile}
                          >
                            {t('nav.admin_dashboard')}
                          </Link>
                          <Link
                            to={ROUTES.ADMIN_PAYMENT_VALIDATION}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={closeProfile}
                          >
                            {t('nav.payment_validation')}
                          </Link>
                          <Link
                            to={ROUTES.METRICS}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={closeProfile}
                          >
                            {t('nav.metrics')}
                          </Link>
                          <Link
                            to="/security/scanner"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={closeProfile}
                          >
                            🔍 {t('nav.qr_scanner')}
                          </Link>
                          <Link
                            to="/badge/print-station"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={closeProfile}
                          >
                            🖨️ {t('nav.badge_print')}
                          </Link>
                          <Link
                            to="/badge/digital"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={closeProfile}
                          >
                            🎫 {t('nav.digital_badge')}
                          </Link>
                          <hr className="my-1" />
                          <div className="px-4 py-2 text-xs text-red-600 font-medium">
                            {t('nav.admin_zone')}
                          </div>
                        </>
                      )}

                      {/* Menu Exposant */}
                      {user?.type === 'exhibitor' && (
                        <>
                          <Link
                            to={ROUTES.PROFILE}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={closeProfile}
                          >
                            {t('nav.my_profile')}
                          </Link>
                          <Link
                            to={ROUTES.DASHBOARD}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={closeProfile}
                          >
                            {t('nav.exhibitor_dashboard')}
                          </Link>
                          <Link
                            to={ROUTES.NETWORKING}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={closeProfile}
                          >
                            {t('nav.b2b_networking')}
                          </Link>
                          <Link
                            to={ROUTES.ADVANCED_MATCHING}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-1"
                            onClick={closeProfile}
                          >
                            🤖 Matching IA Avancé
                          </Link>
                          <Link
                            to={ROUTES.MINISITE_EDITOR}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={closeProfile}
                          >
                            {t('nav.minisite_editor')}
                          </Link>
                          <Link
                            to={ROUTES.CALENDAR}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={closeProfile}
                          >
                            {t('nav.my_slots')}
                          </Link>
                          <Link
                            to={ROUTES.CHAT}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={closeProfile}
                          >
                            {t('nav.messages')}
                          </Link>
                          <Link
                            to="/badge/digital"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={closeProfile}
                          >
                            🎫 {t('nav.digital_badge')}
                          </Link>
                        </>
                      )}

                      {/* Menu Partenaire */}
                      {user?.type === 'partner' && (
                        <>
                          <Link
                            to={ROUTES.PROFILE}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={closeProfile}
                          >
                            {t('nav.my_profile')}
                          </Link>
                          <Link
                            to={ROUTES.DASHBOARD}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={closeProfile}
                          >
                            {t('nav.partner_dashboard')}
                          </Link>
                          <Link
                            to={ROUTES.NETWORKING}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={closeProfile}
                          >
                            {t('nav.vip_networking')}
                          </Link>
                          <Link
                            to="/partner/payment-selection"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={closeProfile}
                          >
                            💳 {t('nav.partner_subscription')}
                          </Link>
                          <Link
                            to="/badge/digital"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={closeProfile}
                          >
                            🎫 {t('nav.digital_badge')}
                          </Link>
                        </>
                      )}

                      {/* Menu Visiteur */}
                      {user?.type === 'visitor' && (
                        <>
                          <Link
                            to={ROUTES.PROFILE}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={closeProfile}
                          >
                            {t('nav.my_profile')}
                          </Link>
                          <Link
                            to={ROUTES.VISITOR_DASHBOARD}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={closeProfile}
                          >
                            {t('nav.visitor_dashboard')}
                          </Link>
                          <Link
                            to={ROUTES.VISITOR_SETTINGS}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={closeProfile}
                          >
                            {t('nav.visitor_settings')}
                          </Link>
                          <Link
                            to={ROUTES.APPOINTMENTS}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={closeProfile}
                          >
                            {t('nav.my_appointments')}
                          </Link>
                          {!isFreeVisitor && (
                            <Link
                              to={ROUTES.ADVANCED_MATCHING}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={closeProfile}
                            >
                              🤖 Matching IA Avancé
                            </Link>
                          )}
                          <Link
                            to="/badge/digital"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={closeProfile}
                          >
                            🎫 {t('nav.digital_badge')}
                          </Link>
                        </>
                      )}

                      <hr className="my-1" />
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        {t('nav.logout')}
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : !authReady ? (
              // ✅ CRITICAL: Afficher un loader pendant l'initialisation de l'authentification
              <div className="flex items-center space-x-3">
                <div className="animate-pulse flex items-center space-x-2">
                  <div className="h-8 w-24 bg-gray-200 rounded"></div>
                  <div className="h-8 w-28 bg-gray-200 rounded"></div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to={ROUTES.LOGIN}>
                  <Button variant="outline" size="sm" className="border-sib-primary text-sib-primary hover:bg-sib-primary hover:text-white">
                    {t('nav.login')}
                  </Button>
                </Link>
                <Link to={ROUTES.VISITOR_SUBSCRIPTION}>
                  <Button size="sm" className="bg-sib-primary hover:bg-sib-dark text-white">
                    {t('nav.register')}
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={toggleMenu}
              className="lg:hidden p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-400 hover:text-gray-600"
              aria-label="Menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Overlay sombre pour fermer le menu en tapant dehors */}
        {isMenuOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-[210] lg:hidden"
            onClick={closeMenu}
            aria-hidden="true"
          />
        )}

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 py-4 max-h-[calc(100vh-4rem)] overflow-y-auto overscroll-contain bg-white relative z-[220]" style={{ WebkitOverflowScrolling: 'touch' }}>
            <div className="space-y-2 pb-6">
              {/* Language & Theme on mobile */}
              <div className="flex items-center gap-3 px-3 py-2 lg:hidden">
                <LanguageSelector />
                <ThemeToggle />
              </div>

              {/* Raccourcis rapides mobile (quand authentifié) */}
              {isAuthenticated && (
                <div className="flex items-center gap-2 px-3 py-2 sm:hidden border-b border-gray-200 pb-3">
                  <Link to={ROUTES.MESSAGES} onClick={closeMenu} className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-700">
                    <MessageCircle className="h-4 w-4" />
                    <span>{t('nav.messages')}</span>
                  </Link>
                  <Link to={ROUTES.APPOINTMENTS} onClick={closeMenu} className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-700">
                    <Calendar className="h-4 w-4" />
                    <span>{t('nav.calendar')}</span>
                  </Link>
                  <button onClick={closeMenu} className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-700 relative">
                    <Bell className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* ══ Le Salon ══ */}
              <div className="border-b border-gray-200 pb-2">
                <button onClick={toggleSalonMenu} className="w-full flex justify-between items-center px-3 py-3 min-h-[44px] text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('nav.le_salon')}
                  <span className={`transition-transform ${isSalonMenuOpen ? 'rotate-180' : ''}`}>▾</span>
                </button>
                {isSalonMenuOpen && salonMenuItems.map((item) => (
                  <Link key={item.name} to={item.href} className="block px-5 py-3 min-h-[44px] text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors" onClick={closeMenu}>
                    <div>{item.name}</div>
                    <div className="text-xs text-gray-500">{item.description}</div>
                  </Link>
                ))}
              </div>

              {/* ══ Exposer ══ */}
              <div className="border-b border-gray-200 pb-2">
                <button onClick={toggleExposerMenu} className="w-full flex justify-between items-center px-3 py-3 min-h-[44px] text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('nav.exposer')}
                  <span className={`transition-transform ${isExposerMenuOpen ? 'rotate-180' : ''}`}>▾</span>
                </button>
                {isExposerMenuOpen && exposerMenuItems.map((item) => (
                  <Link key={item.name} to={item.href} className="block px-5 py-3 min-h-[44px] text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors" onClick={closeMenu}>
                    <div>{item.name}</div>
                    <div className="text-xs text-gray-500">{item.description}</div>
                  </Link>
                ))}
              </div>

              {/* ══ Visiter ══ */}
              <div className="border-b border-gray-200 pb-2">
                <button onClick={toggleVisiterMenu} className="w-full flex justify-between items-center px-3 py-3 min-h-[44px] text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('nav.visiter')}
                  <span className={`transition-transform ${isVisiterMenuOpen ? 'rotate-180' : ''}`}>▾</span>
                </button>
                {isVisiterMenuOpen && visiterMenuItems.map((item) => (
                  <Link key={item.name} to={item.href} className="block px-5 py-3 min-h-[44px] text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors" onClick={closeMenu}>
                    <div>{item.name}</div>
                    <div className="text-xs text-gray-500">{item.description}</div>
                  </Link>
                ))}
              </div>

              {/* ══ Partenaires ══ */}
              <div className="border-b border-gray-200 pb-2">
                <button onClick={togglePartenairesMenu} className="w-full flex justify-between items-center px-3 py-3 min-h-[44px] text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('nav.partners')}
                  <span className={`transition-transform ${isPartenairesMenuOpen ? 'rotate-180' : ''}`}>▾</span>
                </button>
                {isPartenairesMenuOpen && partenairesMenuItems.map((item) => (
                  <Link key={item.name} to={item.href} className="block px-5 py-3 min-h-[44px] text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors" onClick={closeMenu}>
                    <div>{item.name}</div>
                    <div className="text-xs text-gray-500">{item.description}</div>
                  </Link>
                ))}
              </div>

              {/* ══ Programme (lien direct) ══ */}
              <Link
                to={ROUTES.EVENTS}
                className="block px-3 py-3 min-h-[44px] text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors font-medium"
                onClick={closeMenu}
              >
                {t('nav.programme')}
              </Link>

              {/* ══ Réseautage (lien direct) ══ */}
              <Link
                to={ROUTES.NETWORKING}
                className="block px-3 py-3 min-h-[44px] text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors font-medium"
                onClick={closeMenu}
              >
                {t('nav.networking')}
              </Link>

              {/* ══ Médias ══ */}
              {mediaVisible && mediaMenuItems.length > 0 && (
              <div className="border-t border-gray-200 pt-2">
                <button onClick={toggleMediaMenu} className="w-full flex justify-between items-center px-3 py-3 min-h-[44px] text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <span className="flex items-center"><Video className="w-4 h-4 mr-2" />{t('media.menu_title')}</span>
                  <span className={`transition-transform ${isMediaMenuOpen ? 'rotate-180' : ''}`}>▾</span>
                </button>
                {isMediaMenuOpen && mediaMenuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link key={item.name} to={item.href} className="flex items-start px-5 py-3 min-h-[44px] text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors" onClick={closeMenu}>
                      <Icon className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <div>{item.name}</div>
                        <div className="text-xs text-gray-500">{item.description}</div>
                      </div>
                    </Link>
                  );
                })}
              </div>
              )}

              {/* ══ Contact ══ */}
              <div className="border-t border-gray-200 pt-2 mt-2">
                <Link
                  to={ROUTES.CONTACT}
                  className="block px-3 py-3 min-h-[44px] text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors font-medium"
                  onClick={closeMenu}
                >
                  {t('nav.contact')}
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
});