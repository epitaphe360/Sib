import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Building2, Send, Beaker, FlaskConical,
  FileCheck, Receipt, Settings, LogOut, Shield, ClipboardList,
} from 'lucide-react';
import { useLabSessionStore } from '../store/labSessionStore';
import { LAB_ROUTES } from '../routes';
import { can } from '../rbac';

const NAV = [
  { to: LAB_ROUTES.ADMIN_DASHBOARD, label: 'Dashboard', icon: LayoutDashboard, perm: 'dashboard.view' as const },
  { to: LAB_ROUTES.ADMIN_REQUESTS, label: 'Demandes', icon: FileText, perm: 'requests.read' as const },
  { to: LAB_ROUTES.ADMIN_SUPPLIERS, label: 'Fournisseurs', icon: Building2, perm: 'suppliers.read' as const },
  { to: LAB_ROUTES.ADMIN_CONSULTATIONS, label: 'Consultations', icon: Send, perm: 'consultations.write' as const },
  { to: LAB_ROUTES.ADMIN_QUOTES, label: 'Devis', icon: FileCheck, perm: 'quotes.write' as const },
  { to: LAB_ROUTES.ADMIN_ORDERS, label: 'BDC', icon: ClipboardList, perm: 'quotes.write' as const },
  { to: LAB_ROUTES.ADMIN_SAMPLES, label: 'Échantillons', icon: Beaker, perm: 'samples.write' as const },
  { to: LAB_ROUTES.ADMIN_ANALYSES, label: 'Sous-traitance', icon: Send, perm: 'samples.write' as const },
  { to: LAB_ROUTES.ADMIN_RESULTS, label: 'Résultats', icon: FlaskConical, perm: 'results.review.technical' as const },
  { to: LAB_ROUTES.ADMIN_VALIDATIONS, label: 'Validations', icon: FileCheck, perm: 'results.review.technical' as const },
  { to: LAB_ROUTES.ADMIN_REPORTS, label: 'Rapports', icon: FileText, perm: 'reports.write' as const },
  { to: LAB_ROUTES.ADMIN_INVOICES, label: 'Factures', icon: Receipt, perm: 'invoices.read' as const },
  { to: LAB_ROUTES.ADMIN_SUPPLIER_INVOICES, label: 'Fourn. factures', icon: Receipt, perm: 'invoices.read' as const },
  { to: LAB_ROUTES.ADMIN_DEADLINES, label: 'Délais', icon: ClipboardList, perm: 'samples.write' as const },
  { to: LAB_ROUTES.ADMIN_EMAILS, label: 'E-mails', icon: Send, perm: 'settings.write' as const },
  { to: LAB_ROUTES.ADMIN_SETTINGS, label: 'Réglages', icon: Settings, perm: 'settings.write' as const },
  { to: LAB_ROUTES.ADMIN_AUDIT, label: 'Audit', icon: Shield, perm: 'audit.read' as const },
];

export function LabShell() {
  const { activeOrg, role, email, logout } = useLabSessionStore();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      <aside className="w-64 shrink-0 bg-[#0b1f3a] text-white flex flex-col">
        <div className="px-5 py-6 border-b border-white/10">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Elitech Lab</p>
          <p className="mt-1 font-semibold truncate">{activeOrg?.name ?? 'Laboratoire'}</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV.filter((item) => can(role, item.perm)).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm ${
                  isActive ? 'bg-cyan-500/20 text-cyan-200' : 'text-slate-200 hover:bg-white/5'
                }`
              }
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
        <header className="h-14 border-b border-slate-200 bg-white px-6 flex items-center justify-between">
          <p className="text-sm text-slate-500">{role?.replaceAll('_', ' ')}</p>
          <p className="text-sm text-slate-700 truncate">{email}</p>
        </header>
        <main className="flex-1 p-6">
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
    <div className="min-h-screen bg-slate-50">
      <header className="bg-[#0b1f3a] text-white">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <p className="font-medium">{activeOrg?.name ?? 'Espace client'}</p>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-slate-300 truncate max-w-[160px]">{email}</span>
            <button type="button" onClick={async () => { await logout(); navigate(LAB_ROUTES.CLIENT_LOGIN); }}>
              Sortir
            </button>
          </div>
        </div>
        <nav className="max-w-5xl mx-auto px-4 pb-3 flex gap-4 text-sm text-cyan-100">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={({ isActive }) => (isActive ? 'text-white underline' : '')}>
              {l.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="max-w-5xl mx-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
