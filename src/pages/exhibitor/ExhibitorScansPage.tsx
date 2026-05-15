import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  QrCode, Download, RefreshCw, Search, User,
  Calendar, MapPin, ArrowLeft, ScanLine, ChevronDown, ChevronUp,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { ROUTES } from '../../lib/routes';
import { useTranslation } from '../../hooks/useTranslation';

// --- Types -------------------------------------------------------------------

interface ScannedVisitor {
  id: string;
  visitor_id: string;
  scanned_by: string;
  scanned_at: string;
  location: string | null;
  badge_type: string;
  visitor_name: string | null;
  visitor_email: string | null;
  visitor_company: string | null;
  visitor_phone: string | null;
  scanned_by_name: string | null;
  scanned_by_id: string;
}

interface CollaboratorGroup {
  scanned_by_id: string;
  scanned_by_name: string;
  isOwner: boolean;
  scans: ScannedVisitor[];
}

// --- Utilitaires -------------------------------------------------------------

function badgeColor(type: string): string {
  if (type === 'vip') return 'bg-yellow-100 text-yellow-800';
  if (type === 'press') return 'bg-purple-100 text-purple-800';
  if (type === 'exhibitor') return 'bg-indigo-100 text-indigo-800';
  return 'bg-gray-100 text-gray-700';
}

function avatarInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0] ?? '')
    .join('')
    .toUpperCase();
}

const AVATAR_COLORS = [
  'bg-indigo-500', 'bg-emerald-500', 'bg-violet-500',
  'bg-rose-500', 'bg-amber-500', 'bg-cyan-500',
  'bg-indigo-500', 'bg-pink-500',
];

function avatarColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + (id.codePointAt(i) ?? 0)) & 0xffffffff;
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function exportCsv(rows: ScannedVisitor[], exhibitorName: string, scannerName?: string) {
  const headers = ['Nom visiteur', 'Email', 'Société', 'Téléphone', 'Type badge', 'Scanné par', 'Date/Heure', 'Lieu'];
  const sep = ';';
  const BOM = '\uFEFF';
  const csvContent =
    BOM +
    [headers, ...rows.map(r => [
      r.visitor_name ?? '',
      r.visitor_email ?? '',
      r.visitor_company ?? '',
      r.visitor_phone ?? '',
      r.badge_type ?? '',
      r.scanned_by_name ?? r.scanned_by ?? '',
      r.scanned_at ? new Date(r.scanned_at).toLocaleString('fr-FR') : '',
      r.location ?? '',
    ])]
      .map(row => row.map(cell => `"${String(cell).replaceAll('"', '""')}"`).join(sep))
      .join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeName = exhibitorName.replaceAll(' ', '_');
  const safeSuffix = scannerName ? `_${scannerName.replaceAll(' ', '_')}` : '';
  a.download = `scans_${safeName}${safeSuffix}_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// --- Ligne de tableau ---------------------------------------------------------

function ScanRowItem({ scan }: Readonly<{ scan: ScannedVisitor }>) {
  const { t } = useTranslation();
  const dateStr = scan.scanned_at
    ? new Date(scan.scanned_at).toLocaleString('fr-FR', {
        day: '2-digit', month: '2-digit', year: '2-digit',
        hour: '2-digit', minute: '2-digit',
      })
    : '—';

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
            <User className="h-4 w-4 text-indigo-500" />
          </div>
          <div>
            <p className="font-semibold text-sm text-gray-900">{scan.visitor_name ?? t('scans.unknown')}</p>
            {scan.visitor_email && (
              <p className="text-xs text-gray-500 truncate max-w-[180px]">{scan.visitor_email}</p>
            )}
            {scan.visitor_phone && (
              <p className="text-xs text-gray-400">{scan.visitor_phone}</p>
            )}
          </div>
        </div>
      </td>
      <td className="py-3 px-4 hidden sm:table-cell text-sm text-gray-700">
        {scan.visitor_company ?? '—'}
      </td>
      <td className="py-3 px-4 hidden md:table-cell">
        <div className="flex items-center gap-1.5 text-sm text-gray-600">
          <Calendar className="h-3.5 w-3.5 shrink-0" />
          <span>{dateStr}</span>
        </div>
      </td>
      <td className="py-3 px-4 hidden lg:table-cell">
        {scan.location ? (
          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span>{scan.location}</span>
          </div>
        ) : (
          <span className="text-gray-400 text-sm">—</span>
        )}
      </td>
      <td className="py-3 px-4">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${badgeColor(scan.badge_type)}`}>
          {scan.badge_type || 'visiteur'}
        </span>
      </td>
    </tr>
  );
}

// --- Section par collaborateur ------------------------------------------------

interface CollaboratorSectionProps {
  group: CollaboratorGroup;
  search: string;
  exhibitorName: string;
  defaultOpen: boolean;
}

function CollaboratorSection({ group, search, exhibitorName, defaultOpen }: Readonly<CollaboratorSectionProps>) {
  const [open, setOpen] = useState(defaultOpen);
  const { t } = useTranslation();

  const filtered = group.scans.filter(s => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (s.visitor_name?.toLowerCase().includes(q) ?? false) ||
      (s.visitor_email?.toLowerCase().includes(q) ?? false) ||
      (s.visitor_company?.toLowerCase().includes(q) ?? false)
    );
  });

  const uniqueVisitors = new Set(group.scans.map(s => s.visitor_id).filter(Boolean)).size;
  const initials = avatarInitials(group.scanned_by_name);
  const color = avatarColor(group.scanned_by_id);
  const totalLabel = `${group.scans.length} ${group.scans.length === 1 ? t('scans.scan_singular') : t('scans.scan_plural')}`;
  const uniqueLabel = `${uniqueVisitors} ${uniqueVisitors === 1 ? t('scans.unique_visitor_singular') : t('scans.unique_visitor_plural')}`;

  function handleExport(e: React.MouseEvent) {
    e.stopPropagation();
    if (group.scans.length === 0) { toast.error(t('scans.no_data')); return; }
    exportCsv(group.scans, exhibitorName, group.scanned_by_name);
    toast.success(`${group.scans.length} ${t('scans.exported')}`);
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* En-tête collaborateur */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
            {initials || <User className="h-4 w-4" />}
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <p className="font-bold text-gray-900 text-sm">{group.scanned_by_name}</p>
              {group.isOwner && (
                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">{t('scans.you')}</span>
              )}
            </div>
            <p className="text-xs text-gray-500">{totalLabel} · {uniqueLabel}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            {t('scans.export')}
          </button>
          {open ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
        </div>
      </button>

      {/* Tableau */}
      {open && (
        <div className="border-t border-gray-100">
          {filtered.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <QrCode className="h-8 w-8 mx-auto mb-2 opacity-20" />
              <p className="text-sm">{search ? t('scans.no_search_results') : t('scans.no_scans')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-400 bg-gray-50 border-b border-gray-100">
                    <th className="py-2.5 px-4 font-medium">{t('scans.col_visitor')}</th>
                    <th className="py-2.5 px-4 font-medium hidden sm:table-cell">{t('scans.col_company')}</th>
                    <th className="py-2.5 px-4 font-medium hidden md:table-cell">{t('scans.col_date')}</th>
                    <th className="py-2.5 px-4 font-medium hidden lg:table-cell">{t('scans.col_location')}</th>
                    <th className="py-2.5 px-4 font-medium">{t('scans.col_badge')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(scan => <ScanRowItem key={scan.id} scan={scan} />)}
                </tbody>
              </table>
              <p className="text-xs text-gray-400 px-4 py-2.5 text-right">
                {filtered.length} {filtered.length === 1 ? t('scans.result_singular') : t('scans.result_plural')}
                {search ? ` ${t('scans.on')} ${group.scans.length}` : ''}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// --- Page principale ----------------------------------------------------------

export default function ExhibitorScansPage() {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const [groups, setGroups] = useState<CollaboratorGroup[]>([]);
  const [allScans, setAllScans] = useState<ScannedVisitor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchScans = useCallback(async () => {
    if (!supabase || !user?.id) return;
    setIsLoading(true);
    try {
      // Récupérer les collaborateurs actifs de l'exposant (stand_collaborators)
      const { data: collabData } = await supabase
        .from('stand_collaborators')
        .select('auth_user_id')
        .eq('owner_id', user.id)
        .eq('status', 'active')
        .not('auth_user_id', 'is', null);

      const collabIds = (collabData ?? [])
        .map((c: { auth_user_id: string | null }) => c.auth_user_id)
        .filter((id): id is string => Boolean(id));

      const allScannerIds = [user.id, ...collabIds];

      const { data: scanData, error } = await supabase
        .from('badge_scans')
        .select('id, visitor_id, scanned_by, scanned_at, location, badge_type')
        .in('scanned_by', allScannerIds)
        .order('scanned_at', { ascending: false });

      if (error) throw error;
      if (!scanData || scanData.length === 0) {
        setGroups([]);
        setAllScans([]);
        return;
      }

      const visitorIds = [...new Set(
        scanData.map((s: { visitor_id: string }) => s.visitor_id).filter(Boolean)
      )];
      const scannerIds = [...new Set(
        scanData.map((s: { scanned_by: string }) => s.scanned_by).filter(Boolean)
      )];

      type UserRow = { id: string; name?: string; email?: string; profile?: { company?: string; organization?: string; phone?: string } };
      type ScannerRow = { id: string; name?: string };

      const [visitorsRes, scannersRes] = await Promise.all([
        visitorIds.length > 0
          ? supabase.from('users').select('id, name, email, profile').in('id', visitorIds)
          : Promise.resolve({ data: [] as UserRow[] }),
        scannerIds.length > 0
          ? supabase.from('users').select('id, name').in('id', scannerIds)
          : Promise.resolve({ data: [] as ScannerRow[] }),
      ]);

      const visitorMap = new Map((visitorsRes.data ?? []).map((v: UserRow) => [v.id, v]));
      const scannerMap = new Map((scannersRes.data ?? []).map((s: ScannerRow) => [s.id, s]));

      type RawScan = { id: string; visitor_id: string; scanned_by: string; scanned_at: string; location: string | null; badge_type: string };
      const enriched: ScannedVisitor[] = scanData.map((s: RawScan) => {
        const v = visitorMap.get(s.visitor_id);
        const sc = scannerMap.get(s.scanned_by);
        return {
          ...s,
          scanned_by_id: s.scanned_by,
          visitor_name: v?.name ?? null,
          visitor_email: v?.email ?? null,
          visitor_company: v?.profile?.company ?? v?.profile?.organization ?? null,
          visitor_phone: v?.profile?.phone ?? null,
          scanned_by_name: sc?.name ?? null,
        };
      });

      setAllScans(enriched);

      // Grouper par collaborateur
      const groupMap = new Map<string, CollaboratorGroup>();
      for (const scan of enriched) {
        const existing = groupMap.get(scan.scanned_by_id);
        if (existing) {
          existing.scans.push(scan);
        } else {
          groupMap.set(scan.scanned_by_id, {
            scanned_by_id: scan.scanned_by_id,
            scanned_by_name: scan.scanned_by_name ?? `Collaborateur (${scan.scanned_by_id.slice(0, 6)})`,
            isOwner: scan.scanned_by_id === user.id,
            scans: [scan],
          });
        }
      }

      // Propriétaire en premier, puis tri décroissant par nombre de scans
      const sorted = [...groupMap.values()].sort((a, b) => {
        if (a.isOwner) return -1;
        if (b.isOwner) return 1;
        return b.scans.length - a.scans.length;
      });

      setGroups(sorted);
    } catch {
      toast.error(t('scans.load_error'));
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { fetchScans(); }, [fetchScans]);

  const exhibitorName = (user?.profile as { company?: string } | undefined)?.company ?? user?.name ?? 'exposant';
  const totalUnique = new Set(allScans.map(s => s.visitor_id).filter(Boolean)).size;
  const totalToday = allScans.filter(s =>
    s.scanned_at && new Date(s.scanned_at).toDateString() === new Date().toDateString()
  ).length;
  const totalVip = allScans.filter(s => s.badge_type === 'vip').length;

  const stats = [
    { label: t('scans.total_scans'), value: allScans.length, color: 'text-indigo-600' },
    { label: t('scans.unique_visitors'), value: totalUnique, color: 'text-emerald-600' },
    { label: t('scans.today'), value: totalToday, color: 'text-amber-600' },
    { label: t('scans.vip'), value: totalVip, color: 'text-purple-600' },
  ];

  function handleExportAll() {
    if (allScans.length === 0) { toast.error(t('scans.no_data_export')); return; }
    exportCsv(allScans, exhibitorName);
    toast.success(`${allScans.length} ${t('scans.lines_exported')}`);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* En-tête page */}
      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-16 sm:top-20 xl:top-28 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to={ROUTES.EXHIBITOR_DASHBOARD}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Link>
            <span className="text-gray-300">/</span>
            <div className="flex items-center gap-2">
              <ScanLine className="h-5 w-5 text-indigo-600" />
              <h1 className="text-lg font-bold text-gray-900">{t('scans.title')}</h1>
            </div>
          </div>
          <button
            type="button"
            onClick={handleExportAll}
            disabled={allScans.length === 0}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">{t('scans.export_all')}</span>
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats globales */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {stats.map(stat => (
            <div key={stat.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
              <p className={`text-2xl font-bold ${stat.color}`}>
                {isLoading ? '—' : stat.value}
              </p>
              <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Barre de recherche globale */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={t('scans.search_placeholder')}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            />
          </div>
          <button
            type="button"
            onClick={() => { fetchScans(); }}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-colors shadow-sm"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{t('common.refresh')}</span>
          </button>
        </div>

        {/* Contenu */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-white rounded-2xl border border-gray-100 animate-pulse" />
            ))}
          </div>
        )}
        {!isLoading && groups.length === 0 && (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 text-center py-20 text-gray-400">
            <Users className="h-14 w-14 mx-auto mb-4 opacity-20" />
            <p className="font-medium text-gray-500 text-base">{t('scans.no_scans_title')}</p>
            <p className="text-sm mt-2 max-w-xs mx-auto text-gray-400">
              {t('scans.no_scans_desc')}
            </p>
          </div>
        )}
        {!isLoading && groups.length > 0 && (
          <div className="space-y-4">
            {groups.map((group, index) => (
              <CollaboratorSection
                key={group.scanned_by_id}
                group={group}
                search={search}
                exhibitorName={exhibitorName}
                defaultOpen={index === 0}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

