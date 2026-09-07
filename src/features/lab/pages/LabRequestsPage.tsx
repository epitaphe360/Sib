import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLabSessionStore } from '../store/labSessionStore';
import { labSchema } from '../services/labClient';
import type { LabClientRequest } from '../types';
import { LabEmpty, LabPage } from '../components/LabUi';
import {
  LAB_CASE_PHASES,
  dossierPhaseForStatus,
  nextActionForStatus,
  requestWizardHref,
  statusLabelFr,
} from '../lib/dossierPhases';

export default function LabRequestsPage() {
  const orgId = useLabSessionStore((s) => s.activeOrg?.id);
  const [rows, setRows] = useState<LabClientRequest[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orgId) return;
    let cancelled = false;
    (async () => {
      const { data, error: qErr } = await labSchema()
        .from('client_requests')
        .select('id,organization_id,dossier_number,company_name,contact_name,email,phone,product_name,matrix,sample_type,sample_count,accreditation_required,notes,analysis_kind,status,created_at,execution_channel')
        .eq('organization_id', orgId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(50);
      if (cancelled) return;
      if (qErr) setError(qErr.message);
      else setRows((data ?? []) as LabClientRequest[]);
    })();
    return () => { cancelled = true; };
  }, [orgId]);

  const grouped = useMemo(() => {
    const map = new Map<number, LabClientRequest[]>();
    for (const row of rows) {
      const phase = dossierPhaseForStatus(row.status);
      const list = map.get(phase) ?? [];
      list.push(row);
      map.set(phase, list);
    }
    return LAB_CASE_PHASES
      .map((phase) => ({ phase, rows: map.get(phase.n) ?? [] }))
      .filter((g) => g.rows.length > 0);
  }, [rows]);

  return (
    <LabPage
      kicker="Dossiers"
      title="Tous les dossiers"
      subtitle="Groupés par phase. Clic = wizard à la phase courante."
    >
      {error && <p className="text-sm font-medium text-red-700">{error}</p>}
      <div className="lab-editorial mx-0 space-y-8">
        {grouped.map(({ phase, rows: list }) => (
          <section key={phase.n}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6b4e0b]">
              Phase {phase.n} · {phase.title}
            </p>
            {list.map((row) => (
              <Link key={row.id} to={requestWizardHref(row.id)} className="lab-queue-card">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0e5f73]">{row.dossier_number}</p>
                <p className="lab-display mt-1 text-2xl text-[#0B1F33]">{row.company_name}</p>
                <p className="text-sm text-[#3d4f63]">{row.product_name} · {statusLabelFr(row.status)}</p>
                <p className="mt-2 text-sm text-[#0B1F33]">{nextActionForStatus(row.status, row.execution_channel)}</p>
              </Link>
            ))}
          </section>
        ))}
        {rows.length === 0 && <LabEmpty>Aucun dossier</LabEmpty>}
      </div>
    </LabPage>
  );
}
