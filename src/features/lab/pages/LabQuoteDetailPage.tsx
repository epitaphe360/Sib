import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useLabSessionStore } from '../store/labSessionStore';
import { labSchema } from '../services/labClient';

export default function LabQuoteDetailPage() {
  const { id } = useParams();
  const orgId = useLabSessionStore((s) => s.activeOrg?.id);
  const [row, setRow] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orgId || !id) return;
    (async () => {
      const { data, error: qErr } = await labSchema()
        .from('quotes')
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
    <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-2">
      <h1 className="text-xl font-semibold text-[#0b1f3a]">{String(row.quote_number)}</h1>
      <p className="text-sm text-slate-600">{String(row.amount)} {String(row.currency)} · {String(row.status)}</p>
      {row.survey_token && (
        <p className="text-xs text-slate-500">Sondage client : /lab/quote-survey/{String(row.survey_token)}</p>
      )}
    </div>
  );
}
