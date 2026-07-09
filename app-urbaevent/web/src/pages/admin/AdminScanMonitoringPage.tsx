import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  LogIn,
  Users,
  RefreshCw,
  Shield,
  Store,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ROUTES } from '../../lib/routes';
import { useTranslation } from '../../hooks/useTranslation';
import {
  ADMIN_SALON_FILTERS,
  ADMIN_SCAN_PORTALS,
  fetchAdminScanList,
  fetchAdminScanStats,
  formatScanStatNumber,
  type AdminScanCategory,
  type AdminScanListItem,
  type AdminScanStats,
} from '../../services/adminScanStats';

const PORTAL_CONFIG: Record<
  AdminScanCategory,
  { icon: typeof Shield; statKey: keyof AdminScanStats; accent: string }
> = {
  controller: { icon: Shield, statKey: 'controllerScans', accent: '#6B21A8' },
  entry: { icon: LogIn, statKey: 'uniqueEntrants', accent: '#10B981' },
  networking: { icon: Users, statKey: 'networkingScans', accent: '#4598D1' },
  stand: { icon: Store, statKey: 'standScans', accent: '#F39200' },
};

function formatScanTime(iso: string): string {
  return new Date(iso).toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export default function AdminScanMonitoringPage() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<AdminScanStats | null>(null);
  const [activePortal, setActivePortal] = useState<AdminScanCategory>('controller');
  const [items, setItems] = useState<AdminScanListItem[]>([]);
  const [salonFilter, setSalonFilter] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const salonFilterLabel = useMemo(() => {
    if (!salonFilter) return t('admin.scan_monitoring.all_salons');
    return ADMIN_SALON_FILTERS.find((s) => s.id === salonFilter)?.code ?? salonFilter.toUpperCase();
  }, [salonFilter, t]);

  const load = useCallback(async () => {
    try {
      const [s, list] = await Promise.all([
        fetchAdminScanStats(salonFilter),
        fetchAdminScanList(activePortal, 150, salonFilter),
      ]);
      setStats(s);
      setItems(list);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('common.error'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [salonFilter, activePortal, t]);

  useEffect(() => {
    setLoading(true);
    void load();
  }, [load]);

  const statValue = (portal: AdminScanCategory) => {
    if (!stats) return '—';
    const cfg = PORTAL_CONFIG[portal];
    if (portal === 'entry') return formatScanStatNumber(stats.uniqueEntrants);
    return formatScanStatNumber(stats[cfg.statKey] ?? 0);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Link
              to={ROUTES.ADMIN_DASHBOARD}
              className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('admin.dashboard')}
            </Link>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setRefreshing(true);
              void load();
            }}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {t('common.refresh')}
          </Button>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('admin.scan_monitoring.title')}
          </h1>
          <p className="text-sm text-gray-500 mt-1">{t('admin.scan_monitoring.subtitle')}</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <button
            type="button"
            onClick={() => setSalonFilter(undefined)}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
              !salonFilter
                ? 'bg-[#1B3A5C] text-white border-[#1B3A5C]'
                : 'bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-700 text-gray-600'
            }`}
          >
            {t('admin.scan_monitoring.all_salons')}
          </button>
          {ADMIN_SALON_FILTERS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSalonFilter(s.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                salonFilter === s.id
                  ? 'bg-[#1B3A5C] text-white border-[#1B3A5C]'
                  : 'bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-700 text-gray-600'
              }`}
            >
              {s.code}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {ADMIN_SCAN_PORTALS.map((portal) => {
            const cfg = PORTAL_CONFIG[portal];
            const Icon = cfg.icon;
            const active = activePortal === portal;
            return (
              <motion.button
                key={portal}
                type="button"
                onClick={() => setActivePortal(portal)}
                whileTap={{ scale: 0.98 }}
                className={`text-left rounded-xl border p-4 bg-white dark:bg-neutral-900 transition-shadow ${
                  active ? 'ring-2 shadow-md' : 'border-gray-200 dark:border-neutral-700'
                }`}
                style={active ? { borderColor: cfg.accent, ringColor: cfg.accent } : undefined}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center mb-2"
                  style={{ backgroundColor: `${cfg.accent}18` }}
                >
                  <Icon className="h-5 w-5" style={{ color: cfg.accent }} />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{statValue(portal)}</div>
                <div className="text-xs font-medium text-gray-500 mt-1">
                  {t(`admin.scan_monitoring.portal.${portal}`)}
                </div>
                {portal === 'entry' && stats ? (
                  <div className="text-[10px] text-gray-400 mt-1">
                    {t('admin.scan_monitoring.entry_sub', {
                      total: formatScanStatNumber(stats.entryScans),
                      denied: formatScanStatNumber(stats.deniedScans),
                    })}
                  </div>
                ) : null}
              </motion.button>
            );
          })}
        </div>

        <Card className="p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                {t('admin.scan_monitoring.list_heading', {
                  portal: t(`admin.scan_monitoring.portal.${activePortal}`),
                  salon: salonFilterLabel,
                })}
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                {t(`admin.scan_monitoring.portal_hint.${activePortal}`)}
              </p>
            </div>
            <Badge variant="outline">{items.length} {t('admin.scan_monitoring.rows')}</Badge>
          </div>

          {loading ? (
            <p className="text-sm text-gray-400 py-8 text-center">{t('common.loading')}</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">{t('admin.scan_monitoring.empty')}</p>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-neutral-800">
              {items.map((item) => (
                <div key={item.id} className="py-3 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div className="min-w-0">
                    <p
                      className={`font-medium text-sm ${
                        item.valid === false ? 'text-red-600' : 'text-gray-900 dark:text-white'
                      }`}
                    >
                      {item.valid === false ? '✗ ' : item.valid === true ? '✓ ' : ''}
                      {item.primaryLabel}
                    </p>
                    {item.secondaryLabel ? (
                      <p className="text-xs text-[#1B3A5C] dark:text-sky-300 mt-0.5">{item.secondaryLabel}</p>
                    ) : null}
                    <p className="text-xs text-gray-400 mt-1">
                      {[item.salonName, item.meta].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  <time className="text-xs text-gray-400 whitespace-nowrap shrink-0">
                    {formatScanTime(item.scannedAt)}
                  </time>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
