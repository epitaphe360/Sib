import { useState, type ComponentType } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Building2, Send, Beaker, FlaskConical,
  FileCheck, Receipt, Settings, LogOut, Shield, ClipboardList, KeyRound, Inbox, Phone, Scale, Menu, X,
  Users, ListTodo, Wallet, Contact, ChevronDown,
} from 'lucide-react';
import { useLabSessionStore } from '../store/labSessionStore';
import { LAB_ROUTES } from '../routes';
import { can, type LabPermission } from '../rbac';
import { LAB_THEME } from '../theme/tokens';
import type { LabRole } from '../types';

interface NavItem {
  to: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  perm: LabPermission;
}

const WORK: NavItem[] = [
  { to: LAB_ROUTES.ADMIN_DASHBOARD, label: 'File d’attente', icon: LayoutDashboard, perm: 'dashboard.view' },
  { to: LAB_ROUTES.ADMIN_REQUESTS, label: 'Dossiers', icon: FileText, perm: 'requests.read' },
];

const SECONDARY: NavItem[] = [
  { to: LAB_ROUTES.ADMIN_INVOICES, label: 'Finance', icon: Receipt, perm: 'invoices.read' },
  { to: LAB_ROUTES.ADMIN_INBOX, label: 'Courrier', icon: Inbox, perm: 'settings.write' },
  { to: LAB_ROUTES.ADMIN_SETTINGS, label: 'Réglages', icon: Settings, perm: 'settings.write' },
  { to: LAB_ROUTES.ADMIN_SAMPLE_CATALOG, label: 'Catalogue ECH', icon: Beaker, perm: 'settings.write' },
];

const MORE: NavItem[] = [
  { to: LAB_ROUTES.ADMIN_CALLS, label: 'Appels', icon: Phone, perm: 'requests.read' },
  { to: LAB_ROUTES.ADMIN_REGULATORY, label: 'Réglementation', icon: Scale, perm: 'regulatory.write' },
  { to: LAB_ROUTES.ADMIN_SUPPLIERS, label: 'Fournisseurs', icon: Building2, perm: 'suppliers.read' },
  { to: LAB_ROUTES.ADMIN_CONSULTATIONS, label: 'Consultations', icon: Send, perm: 'consultations.write' },
  { to: LAB_ROUTES.ADMIN_QUOTES, label: 'Devis', icon: FileCheck, perm: 'quotes.write' },
  { to: LAB_ROUTES.ADMIN_ORDERS, label: 'BDC', icon: ClipboardList, perm: 'quotes.write' },
  { to: LAB_ROUTES.ADMIN_SAMPLES, label: 'Échantillons', icon: Beaker, perm: 'samples.write' },
  { to: LAB_ROUTES.ADMIN_ANALYSES, label: 'Sous-traitance', icon: Send, perm: 'samples.write' },
  { to: LAB_ROUTES.ADMIN_RESULTS, label: 'Résultats', icon: FlaskConical, perm: 'results.review.technical' },
  { to: LAB_ROUTES.ADMIN_VALIDATIONS, label: 'Validations', icon: FileCheck, perm: 'results.review.technical' },
  { to: LAB_ROUTES.ADMIN_REPORTS, label: 'Rapports', icon: FileText, perm: 'reports.write' },
  { to: LAB_ROUTES.ADMIN_TASKS, label: 'Tâches', icon: ListTodo, perm: 'dashboard.view' },
  { to: LAB_ROUTES.ADMIN_CLIENTS, label: 'Clients', icon: Contact, perm: 'requests.read' },
  { to: LAB_ROUTES.ADMIN_USERS, label: 'Utilisateurs', icon: Users, perm: 'users.write' },
  { to: LAB_ROUTES.ADMIN_PAYMENTS, label: 'Paiements', icon: Wallet, perm: 'invoices.read' },
  { to: LAB_ROUTES.ADMIN_SUPPLIER_INVOICES, label: 'Factures ST', icon: Receipt, perm: 'invoices.read' },
  { to: LAB_ROUTES.ADMIN_DEADLINES, label: 'Délais', icon: ClipboardList, perm: 'samples.write' },
  { to: LAB_ROUTES.ADMIN_EMAILS, label: 'E-mails', icon: Send, perm: 'settings.write' },
  { to: LAB_ROUTES.ADMIN_MFA, label: 'MFA', icon: KeyRound, perm: 'dashboard.view' },
  { to: LAB_ROUTES.ADMIN_AUDIT, label: 'Audit', icon: Shield, perm: 'audit.read' },
  { to: LAB_ROUTES.ADMIN_BACKUPS, label: 'Sauvegardes', icon: Shield, perm: 'audit.read' },
];

function NavGroup({
  items,
  role,
  onNavigate,
}: {
  items: NavItem[];
  role: LabRole | null;
  onNavigate: () => void;
}) {
  return (
    <>
      {items.filter((item) => can(role, item.perm)).map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          className={({ isActive }) =>
            `lab-nav-link flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm ${
              isActive ? 'text-[#071422]' : 'text-slate-200 hover:bg-white/5'
            }`
          }
          style={({ isActive }) => (isActive ? { background: LAB_THEME.gold } : undefined)}
        >
          <item.icon className="h-4 w-4" />
          {item.label}
        </NavLink>
      ))}
    </>
  );
}

export function LabShell() {
  const { activeOrg, role, email, logout } = useLabSessionStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [more, setMore] = useState(false);

  return (
    <div className="lab-root lab-app-light min-h-screen flex">
      {open && (
        <button type="button" className="fixed inset-0 z-30 bg-black/40 lg:hidden" aria-label="Fermer" onClick={() => setOpen(false)} />
      )}
      <aside className={`lab-on-dark fixed inset-y-0 left-0 z-40 w-64 shrink-0 flex-col text-white lg:static lg:flex ${open ? 'flex' : 'hidden lg:flex'}`} style={{ background: LAB_THEME.navyMid }}>
        <div className="px-5 py-6">
          <p className="text-[10px] uppercase tracking-[0.28em] text-cyan-300">{LAB_THEME.brand}</p>
          <p className="lab-display mt-1 truncate text-xl text-white">{activeOrg?.name ?? 'Laboratoire'}</p>
          <div className="lab-gold-line mt-4" />
        </div>
        <nav className="flex-1 overflow-y-auto px-3 pb-4">
          <p className="lab-nav-label">Travail</p>
          <div className="space-y-1">
            <NavGroup items={WORK} role={role} onNavigate={() => setOpen(false)} />
          </div>
          <p className="lab-nav-label">Secondaire</p>
          <div className="space-y-1">
            <NavGroup items={SECONDARY} role={role} onNavigate={() => setOpen(false)} />
          </div>
          <button
            type="button"
            className="mt-3 flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-[#f0d78c]"
            onClick={() => setMore((v) => !v)}
            aria-expanded={more}
          >
            Référentiels
            <ChevronDown className={`h-4 w-4 transition ${more ? 'rotate-180' : ''}`} />
          </button>
          {more && (
            <div className="space-y-1">
              <NavGroup items={MORE} role={role} onNavigate={() => setOpen(false)} />
            </div>
          )}
        </nav>
        <button
          type="button"
          onClick={async () => {
            await logout();
            navigate(LAB_ROUTES.LOGIN);
          }}
          className="m-3 flex min-h-11 items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/5"
        >
          <LogOut className="h-4 w-4" />
          Déconnexion
        </button>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-[#c9bea8] bg-[#fffdf8]/95 px-3 backdrop-blur sm:px-6">
          <button type="button" className="rounded-lg p-2 text-[#0B1F33] lg:hidden" onClick={() => setOpen(true)} aria-label="Menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#3d4f63]">{role?.replaceAll('_', ' ')}</p>
          <p className="truncate text-sm font-medium text-[#0B1F33]">{email}</p>
        </header>
        <main className="flex-1">
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
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-3 px-3 sm:px-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-cyan-300">Portail client · 12 mois</p>
            <p className="lab-display text-lg text-white">{activeOrg?.name ?? 'Espace client'}</p>
          </div>
          <div className="flex items-center gap-4 text-sm text-white/85">
            <span className="max-w-[160px] truncate">{email}</span>
            <button type="button" onClick={async () => { await logout(); navigate(LAB_ROUTES.CLIENT_LOGIN); }}>
              Sortir
            </button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-5xl gap-3 overflow-x-auto px-3 pb-3 text-sm text-cyan-100 sm:px-4">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={({ isActive }) => (isActive ? 'shrink-0 text-white underline decoration-amber-300' : 'shrink-0 text-cyan-100')}>
              {l.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-5xl p-3 sm:p-6">
        <Outlet />
      </main>
    </div>
  );
}
