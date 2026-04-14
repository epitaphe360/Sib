import React, { useState, useCallback, useEffect, memo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu, X, User, LogOut, ChevronDown, Grid3X3,
  QrCode, Home, Building2, LayoutDashboard, Bell
} from 'lucide-react';
import { ROUTES } from '../../lib/routes';
import useAuthStore from '../../store/authStore';

/** Couleur associée à chaque salon */
const SALON_COLORS: Record<string, string> = {
  '/': '#4598D1',
  '/salon/sir': '#EB9A44',
  '/salon/sip': '#4CAF50',
  '/salon/btp': '#D32F2F',
  '/salon/sie': '#2E7D32',
};

const SALON_NAMES: Record<string, string> = {
  '/': 'SIB 2026',
  '/salon/sir': 'SIR 2026',
  '/salon/sip': 'SIP 2027',
  '/salon/btp': 'BTP 2026',
  '/salon/sie': 'SIE 2027',
};

function useSalonContext() {
  const location = useLocation();
  const color = SALON_COLORS[location.pathname] ?? '#4598D1';
  const salonName = SALON_NAMES[location.pathname];
  const isOnSalonList = location.pathname === '/salons';
  return { color, salonName, isOnSalonList, path: location.pathname };
}

export const UrbaEventNav: React.FC = memo(() => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { color, salonName, isOnSalonList } = useSalonContext();

  // Close everything on route change
  useEffect(() => {
    setMenuOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const toggleMenu = useCallback(() => setMenuOpen(p => !p), []);
  const toggleProfile = useCallback(() => setProfileOpen(p => !p), []);
  const handleLogout = useCallback(async () => {
    await logout();
    setProfileOpen(false);
    navigate(ROUTES.SALON_SELECTION);
  }, [logout, navigate]);

  const getDashboardRoute = () => {
    if (!user) return ROUTES.LOGIN;
    switch (user.type) {
      case 'admin': return ROUTES.ADMIN_DASHBOARD;
      case 'exhibitor': return ROUTES.EXHIBITOR_DASHBOARD;
      case 'partner': return ROUTES.PARTNER_DASHBOARD;
      default: return ROUTES.VISITOR_DASHBOARD;
    }
  };

  const navLinks = [
    { label: 'Salons', href: ROUTES.SALON_SELECTION, icon: Grid3X3 },
    { label: 'SIB 2026', href: ROUTES.HOME, icon: Home },
    { label: 'Exposants', href: ROUTES.EXHIBITORS, icon: Building2 },
    { label: 'Événements', href: ROUTES.EVENTS, icon: Bell },
  ];

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-[200] bg-white/95 backdrop-blur-xl border-b shadow-sm transition-all duration-300"
        style={{ borderColor: `${color}30` }}
      >
        {/* Top accent bar */}
        <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, #4598D1, ${color}, #EB9A44)` }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">

            {/* Left: Logo */}
            <Link to={ROUTES.SALON_SELECTION} className="flex items-center gap-2.5 flex-shrink-0">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm"
                style={{ background: `linear-gradient(135deg, #4598D1, ${color})` }}
              >
                <Grid3X3 className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
              </div>
              <div className="hidden xs:block">
                <span className="text-base font-black tracking-tight text-[#333333]">Urba</span>
                <span className="text-base font-black tracking-tight" style={{ color }}>Event</span>
              </div>
              {salonName && !isOnSalonList && (
                <div className="hidden sm:flex items-center gap-1.5">
                  <span className="text-gray-300">|</span>
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: `${color}15`, color }}
                  >
                    {salonName}
                  </span>
                </div>
              )}
            </Link>

            {/* Center: Desktop nav links */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map(link => {
                const isActive = location.pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-150"
                    style={
                      isActive
                        ? { backgroundColor: `${color}15`, color }
                        : { color: '#647483' }
                    }
                  >
                    <link.icon className="w-3.5 h-3.5" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right: Auth / Profile */}
            <div className="flex items-center gap-2">
              {isAuthenticated && user ? (
                <>
                  {/* Dashboard shortcut – desktop */}
                  <Link
                    to={getDashboardRoute()}
                    className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-[#647483] hover:text-[#333333] hover:bg-gray-100 transition-all"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span className="hidden lg:inline">Dashboard</span>
                  </Link>

                  {/* QR Badge shortcut */}
                  <Link
                    to={ROUTES.BADGE}
                    className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all"
                    style={{ backgroundColor: `${color}10`, color }}
                    title="Mon E-Badge"
                  >
                    <QrCode className="w-4 h-4" />
                    <span className="hidden lg:inline">Mon Badge</span>
                  </Link>

                  {/* Avatar + dropdown */}
                  <div className="relative">
                    <button
                      onClick={toggleProfile}
                      className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border hover:shadow-md transition-all duration-200"
                      style={{ borderColor: `${color}40` }}
                      aria-expanded={profileOpen}
                    >
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ background: `linear-gradient(135deg, #4598D1, ${color})` }}
                      >
                        {(user.profile?.firstName?.[0] ?? user.name?.[0] ?? 'U').toUpperCase()}
                      </div>
                      <span className="hidden sm:inline text-sm font-semibold text-[#333333] max-w-[100px] truncate">
                        {user.profile?.firstName ?? user.name?.split(' ')[0] ?? 'Utilisateur'}
                      </span>
                      <ChevronDown
                        className="w-3.5 h-3.5 text-[#647483] transition-transform"
                        style={{ transform: profileOpen ? 'rotate(180deg)' : 'none' }}
                      />
                    </button>

                    {/* Profile dropdown */}
                    {profileOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-20">
                          {/* User info */}
                          <div className="px-4 py-3 border-b border-gray-50">
                            <p className="text-sm font-bold text-[#333333] truncate">
                              {user.profile?.firstName} {user.profile?.lastName}
                            </p>
                            <p className="text-xs text-[#647483] truncate">{user.email}</p>
                            <span
                              className="inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full capitalize"
                              style={{ backgroundColor: `${color}15`, color }}
                            >
                              {user.type === 'visitor'
                                ? `Visiteur ${user.visitor_level ?? 'Standard'}`
                                : user.type}
                            </span>
                          </div>

                          <div className="p-1.5 space-y-0.5">
                            <Link
                              to={getDashboardRoute()}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#333333] hover:bg-gray-50 font-medium transition-colors"
                            >
                              <LayoutDashboard className="w-4 h-4 text-[#647483]" />
                              Mon tableau de bord
                            </Link>
                            <Link
                              to={ROUTES.BADGE}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#333333] hover:bg-gray-50 font-medium transition-colors"
                            >
                              <QrCode className="w-4 h-4 text-[#647483]" />
                              Mon E-Badge
                            </Link>
                            <Link
                              to={ROUTES.PROFILE}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#333333] hover:bg-gray-50 font-medium transition-colors"
                            >
                              <User className="w-4 h-4 text-[#647483]" />
                              Mon profil
                            </Link>
                          </div>

                          <div className="p-1.5 border-t border-gray-50">
                            <button
                              onClick={handleLogout}
                              className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-[#F44336] hover:bg-red-50 font-medium transition-colors"
                            >
                              <LogOut className="w-4 h-4" />
                              Se déconnecter
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to={ROUTES.LOGIN}
                    className="hidden sm:inline-flex px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all duration-200"
                    style={{ borderColor: color, color }}
                  >
                    Se connecter
                  </Link>
                  <Link
                    to={ROUTES.REGISTER}
                    className="inline-flex px-4 py-2 rounded-full text-sm font-bold text-white transition-all duration-200 hover:opacity-90 shadow-sm"
                    style={{ backgroundColor: color }}
                  >
                    S'inscrire
                  </Link>
                </>
              )}

              {/* Mobile hamburger */}
              <button
                onClick={toggleMenu}
                className="lg:hidden p-2 rounded-xl border border-gray-200 text-[#333333] hover:bg-gray-50 transition-colors ml-1"
                aria-label="Menu"
              >
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── MOBILE MENU OVERLAY ── */}
      {menuOpen && (
        <div className="fixed inset-0 z-[199] lg:hidden" onClick={closeMenu}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="absolute top-0 right-0 bottom-0 w-72 max-w-[85vw] bg-white shadow-2xl flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Mobile header */}
            <div
              className="flex items-center justify-between px-5 py-4 border-b"
              style={{ borderColor: `${color}30` }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, #4598D1, ${color})` }}
                >
                  <Grid3X3 className="w-4 h-4 text-white" />
                </div>
                <span className="font-black text-[#333333]">
                  Urba<span style={{ color }}>Event</span>
                </span>
              </div>
              <button onClick={closeMenu} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5 text-[#647483]" />
              </button>
            </div>

            {/* Mobile user info (if connected) */}
            {isAuthenticated && user && (
              <div className="mx-4 mt-4 p-4 rounded-xl" style={{ backgroundColor: `${color}10` }}>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ background: `linear-gradient(135deg, #4598D1, ${color})` }}
                  >
                    {(user.profile?.firstName?.[0] ?? 'U').toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-[#333333]">
                      {user.profile?.firstName} {user.profile?.lastName}
                    </p>
                    <p className="text-xs text-[#647483]">{user.email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Mobile nav links */}
            <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
              {navLinks.map(link => {
                const isActive = location.pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all"
                    style={
                      isActive
                        ? { backgroundColor: `${color}15`, color }
                        : { color: '#333333' }
                    }
                  >
                    <link.icon className="w-4.5 h-4.5" />
                    {link.label}
                  </Link>
                );
              })}

              {isAuthenticated && (
                <>
                  <div className="pt-3 pb-1">
                    <p className="text-[10px] font-black text-[#647483] uppercase tracking-widest px-4">Mon espace</p>
                  </div>
                  <Link
                    to={getDashboardRoute()}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-[#333333] hover:bg-gray-50 transition-colors"
                  >
                    <LayoutDashboard className="w-4.5 h-4.5 text-[#647483]" />
                    Tableau de bord
                  </Link>
                  <Link
                    to={ROUTES.BADGE}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all"
                    style={{ backgroundColor: `${color}10`, color }}
                  >
                    <QrCode className="w-4.5 h-4.5" />
                    Mon E-Badge QR
                  </Link>
                  <Link
                    to={ROUTES.PROFILE}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-[#333333] hover:bg-gray-50 transition-colors"
                  >
                    <User className="w-4.5 h-4.5 text-[#647483]" />
                    Mon profil
                  </Link>
                </>
              )}
            </nav>

            {/* Mobile footer actions */}
            <div className="border-t border-gray-100 p-4 space-y-2">
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold text-[#F44336] border-2 border-red-100 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Se déconnecter
                </button>
              ) : (
                <>
                  <Link
                    to={ROUTES.REGISTER}
                    className="flex items-center justify-center w-full py-3 rounded-full text-sm font-bold text-white shadow-sm"
                    style={{ backgroundColor: color }}
                  >
                    Créer mon compte
                  </Link>
                  <Link
                    to={ROUTES.LOGIN}
                    className="flex items-center justify-center w-full py-3 rounded-full text-sm font-bold border-2 transition-colors"
                    style={{ borderColor: color, color }}
                  >
                    Se connecter
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );

  function closeMenu() { setMenuOpen(false); }
});

export default UrbaEventNav;
