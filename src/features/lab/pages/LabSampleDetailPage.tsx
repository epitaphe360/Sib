import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useLabSessionStore } from '../store/labSessionStore';
import { labSchema } from '../services/labClient';
import { LabFileField } from '../components/LabFileField';

export default function LabSampleDetailPage() {
  const { id } = useParams();
  const orgId = useLabSessionStore((s) => s.activeOrg?.id);
  const [row, setRow] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orgId || !id) return;
    (async () => {
      const { data, error: qErr } = await labSchema()
        .from('samples')
        .select('*')
        .eq('id', id)
        .eq('organization_id', orgId)
        .maybeSingle();
      if (qErr) setError(qErr.message);
      else setRow(data);
    })();
  }, [orgId, id]);

  if (!row) return <p className="text-sm text-slate-500">{error ?? 'Chargement…'}</p>;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-2 max-w-xl">
      <p className="text-xs uppercase tracking-wide text-cyan-700">Profil échantillon</p>
      <h1 className="text-2xl font-semibold text-[#0b1f3a]">{String(row.code)}</h1>
      <p className="text-sm text-slate-600">{String(row.product_name)}</p>
      <dl className="grid grid-cols-2 gap-2 text-sm pt-4">
        <dt className="text-slate-500">Réception</dt>
        <dd>{row.received_at ? new Date(String(row.received_at)).toLocaleString('fr-MA') : '—'}</dd>
        <dt className="text-slate-500">Transporteur</dt>
        <dd>{String(row.carrier ?? '—')}</dd>
        <dt className="text-slate-500">Réceptionnaire</dt>
        <dd>{String(row.received_by ?? '—')}</dd>
        <dt className="text-slate-500">État</dt>
        <dd>{String(row.condition_notes ?? '—')}</dd>
        <dt className="text-slate-500">Température</dt>
        <dd>{row.temperature != null ? `${row.temperature} °C` : '—'}</dd>
      </dl>
      {orgId && (
        <LabFileField organizationId={orgId} bucket="lab-samples" entityType="sample" entityId={String(row.id)} label="Fichier échantillon (URL signée)" />
      )}
    </div>
  );
}
