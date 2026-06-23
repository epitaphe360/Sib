/**
 * SessionRegistrationsPage
 * Page admin — vue complète de toutes les inscriptions au programme.
 * Permet de voir par session, exporter, et gérer les accès.
 */
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Users, CalendarDays, Download, Search, RefreshCw,
  ChevronDown, UserCheck, Filter, BarChart3
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useProgrammeStore } from '../../store/programmeStore';
import { PageHero } from '../../components/ui/PageHero';
import { ROUTES } from '../../lib/routes';
import { useTranslation } from '../../hooks/useTranslation';

interface RegistrationRow {
  id: string;
  sessionId: string;
  sessionTitle: string;
  sessionTime: string;
  dayLabel: string;
  userId: string;
  userName: string;
  userEmail: string;
  userType: string;
  userCompany?: string;
  registrationType: string;
  registeredAt: string;
  isCheckedIn: boolean;
}

const typeColors: Record<string, string> = {
  exhibitor: 'bg-emerald-100 text-emerald-700',
  partner:   'bg-amber-100 text-amber-700',
  visitor:   'bg-indigo-100 text-indigo-700',
  attendee:  'bg-gray-100 text-gray-600',
};

export default function SessionRegistrationsPage() {
  const { t } = useTranslation();
  const { days } = useProgrammeStore();
  const [rows, setRows] = useState<RegistrationRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterSession, setFilterSession] = useState('');
  const [filterType, setFilterType] = useState('');

  const allSessions = days.flatMap(day =>
    day.sessions
      .filter(s => s.type !== 'pause')
      .map(s => ({ ...s, dayLabel: day.dayLabel }))
  );

  const load = useCallback(async () => {
    if (!supabase) { return; }
    setIsLoading(true);

    const { data: registrations } = await supabase
      .from('programme_registrations')
      .select('id, session_id, user_id, registration_type, registered_at, status')
      .eq('status', 'confirmed')
      .order('registered_at', { ascending: false });

    if (!registrations || registrations.length === 0) {
      setRows([]);
      setIsLoading(false);
      return;
    }

    const userIds = [...new Set(registrations.map((r: { user_id: string }) => r.user_id))];
    const sessionIds = [...new Set(registrations.map((r: { session_id: string }) => r.session_id))];

    const [{ data: usersData }, { data: checkinsData }] = await Promise.all([
      supabase.from('users').select('id, name, email, type, profile').in('id', userIds),
      supabase.from('session_checkins').select('session_id, user_id').in('session_id', sessionIds).in('user_id', userIds),
    ]);

    const checkinSet = new Set<string>(
      (checkinsData ?? []).map((c: { session_id: string; user_id: string }) => `${c.session_id}::${c.user_id}`)
    );

    const result: RegistrationRow[] = registrations.map((reg: {
      id: string; session_id: string; user_id: string;
      registration_type: string; registered_at: string;
    }) => {
      const u = (usersData ?? []).find((x: { id: string }) => x.id === reg.user_id);
      const sessionInfo = allSessions.find(s => s.id === reg.session_id);
      return {
        id: reg.id,
        sessionId: reg.session_id,
        sessionTitle: sessionInfo?.title ?? `Session ${reg.session_id}`,
        sessionTime: sessionInfo?.time ?? '',
        dayLabel: sessionInfo?.dayLabel ?? '',
        userId: reg.user_id,
        userName: (u?.name as string) ?? 'Inconnu',
        userEmail: (u?.email as string) ?? '',
        userType: (u?.type as string) ?? 'visitor',
        userCompany: (u?.profile as { company?: string } | null)?.company,
        registrationType: reg.registration_type,
        registeredAt: reg.registered_at,
        isCheckedIn: checkinSet.has(`${reg.session_id}::${reg.user_id}`),
      };
    });

    setRows(result);
    setIsLoading(false);
  }, [allSessions]);

  useEffect(() => { load(); }, [load]);

  const filtered = rows.filter(r => {
    if (filterSession && r.sessionId !== filterSession) { return false; }
    if (filterType && r.userType !== filterType) { return false; }
    if (search) {
      const q = search.toLowerCase();
      if (!r.userName.toLowerCase().includes(q) &&
          !r.userEmail.toLowerCase().includes(q) &&
          !(r.userCompany ?? '').toLowerCase().includes(q) &&
          !r.sessionTitle.toLowerCase().includes(q)) { return false; }
    }
    return true;
  });

  const totalCheckedIn = rows.filter(r => r.isCheckedIn).length;

  const handleExportCSV = () => {
    const header = t('session_reg.csv_header');
    const csvRows = filtered.map(r => [
      `"${r.sessionTitle}"`,
      r.sessionTime,
      r.dayLabel,
      `"${r.userName}"`,
      r.userEmail,
      `"${r.userCompany ?? ''}"`,
      r.userType,
      new Date(r.registeredAt).toLocaleDateString('fr-FR'),
      r.isCheckedIn ? 'Oui' : 'Non',
    ].join(','));
    const csv = [header, ...csvRows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inscriptions-programme-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHero
        badge={<span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white/20 text-white px-3 py-1 rounded-full">{t('session_reg.admin_badge')}</span>}
        title={t('session_reg.page_title')}
        subtitle={t('session_reg.page_subtitle')}
        py="py-12 md:py-16"
        noWave
      />

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
                      { label: t('session_reg.stat_total'), value: rows.length, icon: <Users className="h-5 w-5 text-indigo-500" />, bg: 'bg-indigo-50' },
            { label: t('session_reg.stat_sessions'), value: new Set(rows.map(r => r.sessionId)).size, icon: <CalendarDays className="h-5 w-5 text-blue-500" />, bg: 'bg-blue-50' },
            { label: t('session_reg.stat_present'), value: totalCheckedIn, icon: <UserCheck className="h-5 w-5 text-emerald-500" />, bg: 'bg-emerald-50' },
            { label: t('session_reg.stat_rate'), value: rows.length > 0 ? `${Math.round((totalCheckedIn / rows.length) * 100)}%` : '0%', icon: <BarChart3 className="h-5 w-5 text-amber-500" />, bg: 'bg-amber-50' },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center gap-3">
              <div className={`p-2.5 ${stat.bg} rounded-xl`}>{stat.icon}</div>
              <div>
                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters + actions */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <div className="flex flex-wrap gap-3 items-center">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={t('session_reg.search_ph')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Session filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={filterSession}
                onChange={(e) => setFilterSession(e.target.value)}
                className="pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="">{t('session_reg.all_sessions')}</option>
                {allSessions.map(s => (
                  <option key={s.id} value={s.id}>{s.title}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
            </div>

            {/* Type filter */}
            <div className="relative">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 pr-8 text-sm border border-gray-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="">{t('session_reg.all_types')}</option>
                <option value="exhibitor">{t('session_reg.exhibitors')}</option>
                <option value="partner">{t('session_reg.partners')}</option>
                <option value="visitor">{t('session_reg.visitors')}</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
            </div>

            {/* Actions */}
            <button
              onClick={load}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 text-gray-500 ${isLoading ? 'animate-spin' : ''}`} />
              {t('session_reg.refresh')}
            </button>

            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              {t('session_reg.export_csv')}
            </button>

            <Link
              to={ROUTES.ADMIN_SESSION_CHECKIN}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
            >
              <UserCheck className="h-4 w-4" />
              {t('session_reg.scan_qr')}
            </Link>
          </div>
          <p className="mt-3 text-xs text-gray-400">{t('session_reg.results_count', { count: filtered.length })}</p>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          {isLoading ? (
            <div className="py-16 text-center">
              <div className="animate-spin h-8 w-8 border-b-2 border-indigo-600 rounded-full mx-auto mb-3" />
              <p className="text-sm text-gray-400">{t('session_reg.loading')}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <Users className="h-10 w-10 text-gray-200 mx-auto mb-3" />
              <p className="text-sm text-gray-400">{t('session_reg.no_results')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('session_reg.col_participant')}</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('session_reg.col_session')}</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('session_reg.col_type')}</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('session_reg.col_registered_at')}</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('session_reg.col_presence')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((r, i) => (
                    <motion.tr
                      key={r.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(i * 0.02, 0.4) }}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-gray-900 leading-tight">{r.userName}</p>
                        {r.userCompany && <p className="text-xs text-gray-400">{r.userCompany}</p>}
                        <p className="text-[11px] text-gray-300">{r.userEmail}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-gray-800 leading-tight line-clamp-1">{r.sessionTitle}</p>
                        <p className="text-xs text-gray-400">{r.dayLabel} · {r.sessionTime}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${typeColors[r.userType] ?? 'bg-gray-100 text-gray-500'}`}>
                          {r.userType}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-gray-500">
                        {new Date(r.registeredAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-4 py-3.5">
                        {r.isCheckedIn ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold">
                            <UserCheck className="h-3 w-3" />
                              {t('session_reg.badge_present')}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-400 rounded-full text-[10px] font-bold">
                              {t('session_reg.badge_absent')}
                          </span>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
