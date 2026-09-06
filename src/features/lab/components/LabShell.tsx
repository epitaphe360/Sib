import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Building2, Send, Beaker, FlaskConical,
  FileCheck, Receipt, Settings, LogOut, Shield, ClipboardList, KeyRound, Inbox, Phone, Scale, Menu, X,
  Users, ListTodo, Wallet, Contact,
} from 'lucide-react';
import { useLabSessionStore } from '../store/labSessionStore';
import { LAB_ROUTES } from '../routes';
import { can } from '../rbac';
import { LAB_THEME } from '../theme/tokens';

const NAV = [
  { to: LAB_ROUTES.ADMIN_DASHBOARD, label: 'Dashboard', icon: LayoutDashboard, perm: 'dashboard.view' as const },
  { to: LAB_ROUTES.ADMIN_REQUESTS, label: 'Demandes', icon: FileText, perm: 'requests.read' as const },
  { to: LAB_ROUTES.ADMIN_CALLS, label: 'Appels', icon: Phone, perm: 'requests.read' as const },
  { to: LAB_ROUTES.ADMIN_REGULATORY, label: 'Réglementation', icon: Scale, perm: 'regulatory.write' as const },
  { to: LAB_ROUTES.ADMIN_SUPPLIERS, label: 'Fournisseurs', icon: Building2, perm: 'suppliers.read' as const },
  { to: LAB_ROUTES.ADMIN_CONSULTATIONS, label: 'Consultations', icon: Send, perm: 'consultations.write' as const },
  { to: LAB_ROUTES.ADMIN_QUOTES, label: 'Devis', icon: FileCheck, perm: 'quotes.write' as const },
  { to: LAB_ROUTES.ADMIN_ORDERS, label: 'BDC', icon: ClipboardList, perm: 'quotes.write' as const },
  { to: LAB_ROUTES.ADMIN_SAMPLES, label: 'Échantillons', icon: Beaker, perm: 'samples.write' as const },
  { to: LAB_ROUTES.ADMIN_ANALYSES, label: 'Sous-traitance', icon: Send, perm: 'samples.write' as const },
  { to: LAB_ROUTES.ADMIN_RESULTS, label: 'Résultats', icon: FlaskConical, perm: 'results.review.technical' as const },
  { to: LAB_ROUTES.ADMIN_VALIDATIONS, label: 'Validations', icon: FileCheck, perm: 'results.review.technical' as const },
  { to: LAB_ROUTES.ADMIN_REPORTS, label: 'Rapports', icon: FileText, perm: 'reports.write' as const },
  { to: LAB_ROUTES.ADMIN_TASKS, label: 'Tâches', icon: ListTodo, perm: 'dashboard.view' as const },
  { to: LAB_ROUTES.ADMIN_CLIENTS, label: 'Clients', icon: Contact, perm: 'requests.read' as const },
  { to: LAB_ROUTES.ADMIN_USERS, label: 'Utilisateurs', icon: Users, perm: 'users.write' as const },
  { to: LAB_ROUTES.ADMIN_INVOICES, label: 'Factures', icon: Receipt, perm: 'invoices.read' as const },
  { to: LAB_ROUTES.ADMIN_PAYMENTS, label: 'Paiements', icon: Wallet, perm: 'invoices.read' as const },
  { to: LAB_ROUTES.ADMIN_SUPPLIER_INVOICES, label: 'Fourn. factures', icon: Receipt, perm: 'invoices.read' as const },
  { to: LAB_ROUTES.ADMIN_DEADLINES, label: 'Délais', icon: ClipboardList, perm: 'samples.write' as const },
  { to: LAB_ROUTES.ADMIN_EMAILS, label: 'E-mails', icon: Send, perm: 'settings.write' as const },
  { to: LAB_ROUTES.ADMIN_INBOX, label: 'Inbox', icon: Inbox, perm: 'settings.write' as const },
  { to: LAB_ROUTES.ADMIN_MFA, label: 'MFA', icon: KeyRound, perm: 'dashboard.view' as const },
  { to: LAB_ROUTES.ADMIN_SETTINGS, label: 'Réglages', icon: Settings, perm: 'settings.write' as const },
  { to: LAB_ROUTES.ADMIN_AUDIT, label: 'Audit', icon: Shield, perm: 'audit.read' as const },
  { to: LAB_ROUTES.ADMIN_BACKUPS, label: 'Sauvegardes', icon: Shield, perm: 'audit.read' as const },
];

export function LabShell() {
  const { activeOrg, role, email, logout } = useLabSessionStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <div className="lab-root lab-app-light min-h-screen flex">
      {open && (
        <button type="button" className="fixed inset-0 z-30 bg-black/40 lg:hidden" aria-label="Fermer" onClick={() => setOpen(false)} />
      )}
      <aside className={`lab-on-dark fixed inset-y-0 left-0 z-40 w-64 shrink-0 flex-col text-white lg:static lg:flex ${open ? 'flex' : 'hidden lg:flex'}`} style={{ background: LAB_THEME.navyMid }}>
        <div className="px-5 py-6 border-b border-white/10">
          <p className="text-[10px] uppercase tracking-[0.28em] text-cyan-300">{LAB_THEME.brand}</p>
          <p className="lab-display mt-1 text-xl truncate text-white">{activeOrg?.name ?? 'Laboratoire'}</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV.filter((item) => can(role, item.perm)).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm ${
                  isActive ? 'text-[#071422]' : 'text-slate-200 hover:bg-white/5'
                }`
              }
              style={({ isActive }) => (isActive ? { background: LAB_THEME.gold } : undefined)}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <button
          type="button"
          onClick={async () => {
            await logout();
            navigate(LAB_ROUTES.LOGIN);
          }}
          className="m-3 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/5"
        >
          <LogOut className="h-4 w-4" />
          Déconnexion
        </button>
      </aside>
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-14 border-b border-[#c9bea8] bg-[#fffdf8]/95 px-3 sm:px-6 flex items-center justify-between backdrop-blur">
          <button type="button" className="rounded-lg p-2 text-[#0B1F33] lg:hidden" onClick={() => setOpen(true)} aria-label="Menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#3d4f63]">{role?.replaceAll('_', ' ')}</p>
          <p className="text-sm font-medium text-[#0B1F33] truncate">{email}</p>
        </header>
        <main className="flex-1 p-3 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function LabClientShell() {
  const { email, logout, activeOrg } = useLabSessionStore();
  const navigate = useNavigate();
  const links = [
    { to: LAB_ROUTES.CLIENT_DASHBOARD, label: 'Tableau de bord' },
    { to: LAB_ROUTES.CLIENT_REQUESTS, label: 'Demandes' },
    { to: LAB_ROUTES.CLIENT_QUOTES, label: 'Devis' },
    { to: LAB_ROUTES.CLIENT_REPORTS, label: 'Rapports' },
    { to: LAB_ROUTES.CLIENT_INVOICES, label: 'Factures' },
  ];

  return (
    <div className="lab-root lab-app-light min-h-screen">
      <header className="lab-on-dark bg-[#0b1f3a] text-white">
        <div className="max-w-5xl mx-auto px-3 sm:px-4 h-16 flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-cyan-300">Portail client · 12 mois</p>
            <p className="lab-display text-lg text-white">{activeOrg?.name ?? 'Espace client'}</p>
          </div>
          <div className="flex items-center gap-4 text-sm text-white/85">
            <span className="truncate max-w-[160px]">{email}</span>
            <button type="button" onClick={async () => { await logout(); navigate(LAB_ROUTES.CLIENT_LOGIN); }}>
              Sortir
            </button>
          </div>
        </div>
        <nav className="max-w-5xl mx-auto px-3 sm:px-4 pb-3 flex gap-3 overflow-x-auto text-sm text-cyan-100">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={({ isActive }) => (isActive ? 'shrink-0 text-white underline decoration-amber-300' : 'shrink-0 text-cyan-100')}>
              {l.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="max-w-5xl mx-auto p-3 sm:p-6">
        <Outlet />
      </main>
    </div>
  );
}
