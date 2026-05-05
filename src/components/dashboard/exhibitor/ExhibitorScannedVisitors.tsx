import React, { useEffect, useState, useCallback } from 'react';
import { QrCode, Download, RefreshCw, Search, User, Calendar, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useAuthStore } from '../../../store/authStore';
import { toast } from 'sonner';

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
}

function exportToExcel(rows: ScannedVisitor[], exhibitorName: string) {
  const headers = ['Nom visiteur', 'Email', 'Société', 'Téléphone', 'Type badge', 'Scanné par', 'Date/Heure', 'Lieu'];
  const data = rows.map(r => [
    r.visitor_name || '',
    r.visitor_email || '',
    r.visitor_company || '',
    r.visitor_phone || '',
    r.badge_type || '',
    r.scanned_by_name || r.scanned_by || '',
    r.scanned_at ? new Date(r.scanned_at).toLocaleString('fr-FR') : '',
    r.location || '',
  ]);

  // Construire un CSV (compatible Excel avec BOM UTF-8)
  const BOM = '\uFEFF';
  const separator = ';';
  const csvContent =
    BOM +
    [headers, ...data]
      .map(row => row.map(cell => `"${String(cell).replaceAll('"', '""')}"`).join(separator))
      .join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const date = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = `visiteurs_scannés_${exhibitorName.replaceAll(' ', '_')}_${date}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function badgeColor(type: string): string {
  if (type === 'vip') return 'bg-yellow-100 text-yellow-800';
  if (type === 'press') return 'bg-purple-100 text-purple-800';
  if (type === 'exhibitor') return 'bg-blue-100 text-blue-800';
  return 'bg-gray-100 text-gray-700';
}

function ScanSubtitle({ isExpanded, count }: Readonly<{ isExpanded: boolean; count: number }>) {
  const plural = count === 1 ? '' : 's';
  const text = isExpanded
    ? `${count} scan${plural} — moi & mon équipe`
    : 'Voir les QR codes collectés par vous et votre équipe';
  return <p className="text-xs text-gray-500">{text}</p>;
}

function ScanRow({ scan }: Readonly<{ scan: ScannedVisitor }>) {
  const dateStr = scan.scanned_at
    ? new Date(scan.scanned_at).toLocaleString('fr-FR', {
        day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
      })
    : '—';
  const scannerLabel = scan.scanned_by_name
    ?? (scan.scanned_by ? `${scan.scanned_by.slice(0, 8)}…` : '—');

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="py-3 pr-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
            <User className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{scan.visitor_name ?? 'Inconnu'}</p>
            {scan.visitor_email && (
              <p className="text-xs text-gray-500 truncate max-w-[180px]">{scan.visitor_email}</p>
            )}
            {scan.visitor_phone && (
              <p className="text-xs text-gray-500">{scan.visitor_phone}</p>
            )}
          </div>
        </div>
      </td>
      <td className="py-3 pr-4 hidden sm:table-cell">
        <span className="text-gray-700">{scan.visitor_company ?? '—'}</span>
      </td>
      <td className="py-3 pr-4 hidden md:table-cell">
        <div className="flex items-center gap-1 text-gray-600">
          <User className="h-3 w-3" />
          <span>{scannerLabel}</span>
        </div>
      </td>
      <td className="py-3 pr-4 hidden md:table-cell">
        <div className="flex items-center gap-1 text-gray-600">
          <Calendar className="h-3 w-3" />
          <span>{dateStr}</span>
        </div>
      </td>
      <td className="py-3 pr-4 hidden lg:table-cell">
        {scan.location ? (
          <div className="flex items-center gap-1 text-gray-600">
            <MapPin className="h-3 w-3" />
            <span>{scan.location}</span>
          </div>
        ) : (
          <span className="text-gray-400">—</span>
        )}
      </td>
      <td className="py-3">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${badgeColor(scan.badge_type)}`}>
          {scan.badge_type || 'visiteur'}
        </span>
      </td>
    </tr>
  );
}

interface ScansContentProps {
  isLoading: boolean;
  filtered: ScannedVisitor[];
  totalCount: number;
  searchActive: boolean;
  searchQuery: string;
}

function ScansContent({ isLoading, filtered, totalCount, searchActive, searchQuery }: Readonly<ScansContentProps>) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }
  if (filtered.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <QrCode className="h-10 w-10 mx-auto mb-3 opacity-30" />
        <p className="font-medium">
          {searchActive ? 'Aucun résultat pour cette recherche' : 'Aucun visiteur scanné pour le moment'}
        </p>
        {searchActive ? null : (
          <p className="text-xs mt-1">Utilisez le scanner QR pour commencer à collecter des leads</p>
        )}
      </div>
    );
  }
  const plural = filtered.length === 1 ? '' : 's';
  const suffix = searchQuery ? ` sur ${totalCount}` : '';
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
            <th className="pb-3 font-medium">Visiteur</th>
            <th className="pb-3 font-medium hidden sm:table-cell">Société</th>
            <th className="pb-3 font-medium hidden md:table-cell">Scanné par</th>
            <th className="pb-3 font-medium hidden md:table-cell">Date</th>
            <th className="pb-3 font-medium hidden lg:table-cell">Lieu</th>
            <th className="pb-3 font-medium">Badge</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {filtered.map(scan => <ScanRow key={scan.id} scan={scan} />)}
        </tbody>
      </table>
      <p className="text-xs text-gray-400 mt-3 text-right">
        {filtered.length} résultat{plural}{suffix}
      </p>
    </div>
  );
}

interface ExhibitorScannedVisitorsProps {
  isExpanded?: boolean;
  onToggle?: () => void;
}

export function ExhibitorScannedVisitors({ isExpanded: expandedProp, onToggle }: Readonly<ExhibitorScannedVisitorsProps> = {}) {
  const { user } = useAuthStore();
  const [scans, setScans] = useState<ScannedVisitor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [internalExpanded, setInternalExpanded] = useState(false);
  const isExpanded = expandedProp ?? internalExpanded;
  const handleToggle = onToggle ?? (() => setInternalExpanded(v => !v));

  const fetchScans = useCallback(async () => {
    if (!supabase || !user?.id) return;
    setIsLoading(true);
    try {
      // Récupérer l'exhibitor_id lié à cet utilisateur
      const { data: exhibitor } = await supabase
        .from('exhibitors')
        .select('id, team_members')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!exhibitor) { setIsLoading(false); return; }

      // Construire la liste des IDs autorisés (exposant + collaborateurs)
      const teamIds: string[] = (exhibitor.team_members || [])
        .map((m: any) => m.user_id || m.id)
        .filter(Boolean);
      const allScannerIds = [user.id, ...teamIds];

      // Récupérer les scans
      const { data: scanData, error } = await supabase
        .from('badge_scans')
        .select('id, visitor_id, scanned_by, scanned_at, location, badge_type')
        .in('scanned_by', allScannerIds)
        .order('scanned_at', { ascending: false });

      if (error) throw error;
      if (!scanData || scanData.length === 0) { setScans([]); setIsLoading(false); return; }

      // Récupérer les infos visiteurs
      const visitorIds = [...new Set(scanData.map((s: any) => s.visitor_id).filter(Boolean))];
      const scannerIds = [...new Set(scanData.map((s: any) => s.scanned_by).filter(Boolean))];

      const [visitorsRes, scannersRes] = await Promise.all([
        visitorIds.length > 0
          ? supabase.from('users').select('id, name, email, profile').in('id', visitorIds)
          : Promise.resolve({ data: [] }),
        scannerIds.length > 0
          ? supabase.from('users').select('id, name').in('id', scannerIds)
          : Promise.resolve({ data: [] }),
      ]);

      const visitorMap = new Map((visitorsRes.data || []).map((v: any) => [v.id, v]));
      const scannerMap = new Map((scannersRes.data || []).map((s: any) => [s.id, s]));

      const enriched: ScannedVisitor[] = scanData.map((s: any) => {
        const v = visitorMap.get(s.visitor_id);
        const sc = scannerMap.get(s.scanned_by);
        return {
          ...s,
          visitor_name: v?.name || null,
          visitor_email: v?.email || null,
          visitor_company: v?.profile?.company || v?.profile?.organization || null,
          visitor_phone: v?.profile?.phone || null,
          scanned_by_name: sc?.name || null,
        };
      });

      setScans(enriched);
    } catch (err: any) {
      console.error('Erreur chargement scans:', err);
      toast.error('Impossible de charger les visiteurs scannés');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (isExpanded) fetchScans();
  }, [isExpanded, fetchScans]);

  const filtered = scans.filter(s => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.visitor_name?.toLowerCase().includes(q) ||
      s.visitor_email?.toLowerCase().includes(q) ||
      s.visitor_company?.toLowerCase().includes(q) ||
      s.scanned_by_name?.toLowerCase().includes(q)
    );
  });

  const exhibitorName = user?.profile?.company || user?.name || 'exposant';

  return (
    <section id="scanned-visitors-section" className="mb-8">
      <button
        onClick={handleToggle}
        className="w-full flex items-center justify-between bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-4 hover:shadow-md transition-shadow"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-xl">
            <QrCode className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-left">
            <p className="font-bold text-gray-900">Visiteurs scannés</p>
            <ScanSubtitle isExpanded={isExpanded} count={scans.length} />
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-gray-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-400" />
        )}
      </button>

      {isExpanded && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 border-t-0 rounded-t-none px-6 py-5">
          {/* Barre d'outils */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom, email, société..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => fetchScans()}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
            <button
              onClick={() => {
                if (filtered.length === 0) { toast.error('Aucune donnée à exporter'); return; }
                exportToExcel(filtered, exhibitorName);
                toast.success(`${filtered.length} ligne(s) exportée(s)`);
              }}
              disabled={filtered.length === 0}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              <Download className="h-4 w-4" />
              Exporter Excel
            </button>
          </div>

          {/* Contenu */}
          <ScansContent
            isLoading={isLoading}
            filtered={filtered}
            totalCount={scans.length}
            searchActive={search.length > 0}
            searchQuery={search}
          />
        </div>
      )}
    </section>
  );
}
