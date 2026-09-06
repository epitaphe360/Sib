import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { useLabSessionStore } from '../store/labSessionStore';
import { labSchema } from '../services/labClient';
import { LAB_ROUTES } from '../routes';
import type { DossierStatus } from '../types';

const KPI: { key: DossierStatus | 'all'; label: string; to: string }[] = [
  { key: 'NEW_REQUEST', label: 'Demandes nouvelles', to: LAB_ROUTES.ADMIN_REQUESTS },
  { key: 'CLIENT_QUOTE_SENT', label: 'Devis envoyés', to: LAB_ROUTES.ADMIN_QUOTES },
  { key: 'WAITING_SAMPLES', label: 'Attente échantillons', to: LAB_ROUTES.ADMIN_SAMPLES },
  { key: 'ANALYSIS_IN_PROGRESS', label: 'Analyses en cours', to: LAB_ROUTES.ADMIN_RESULTS },
];

export default function LabDashboardPage() {
  const orgId = useLabSessionStore((s) => s.activeOrg?.id);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orgId) return;
    let cancelled = false;
    (async () => {
      try {
        const { data, error: qErr } = await labSchema()
          .from('client_requests')
          .select('status')
          .eq('organization_id', orgId)
          .is('deleted_at', null);
        if (qErr) throw qErr;
        if (cancelled) return;
        const next: Record<string, number> = { all: data?.length ?? 0 };
        for (const row of data ?? []) {
          const status = row.status as string;
          next[status] = (next[status] ?? 0) + 1;
        }
        setCounts(next);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Chargement impossible');
      }
    })();
    return () => { cancelled = true; };
  }, [orgId]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#0b1f3a]">Pilotage</h1>
        <p className="text-sm text-slate-500">Vue synthétique — drill-down par statut.</p>
      </div>
      {error && <p className="text-sm text-amber-700">{error}</p>}
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {KPI.map((item) => (
          <Link key={item.key} to={item.to}>
            <Card hover className="bg-white">
              <p className="text-sm text-slate-500">{item.label}</p>
              <p className="mt-2 text-3xl font-semibold text-[#0b1f3a]">{counts[item.key] ?? 0}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
