import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLabSessionStore } from '../store/labSessionStore';
import { labSchema } from '../services/labClient';
import { LAB_ROUTES } from '../routes';

interface Row {
  id: string;
  created_at: string;
  recipient_mode: string;
  request_id: string;
}

export default function LabConsultationsPage() {
  const orgId = useLabSessionStore((s) => s.activeOrg?.id);
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orgId) return;
    (async () => {
      const { data, error: qErr } = await labSchema()
        .from('supplier_consultations')
        .select('id,created_at,recipient_mode,request_id')
        .eq('organization_id', orgId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(50);
      if (qErr) setError(qErr.message);
      else setRows((data ?? []) as Row[]);
    })();
  }, [orgId]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-[#0b1f3a]">Consultations</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr><th className="px-4 py-2">Date</th><th className="px-4 py-2">Mode</th><th className="px-4 py-2">Dossier</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-slate-100">
                <td className="px-4 py-2">
                  <Link className="text-cyan-700" to={LAB_ROUTES.ADMIN_CONSULTATION.replace(':id', r.id)}>
                    {new Date(r.created_at).toLocaleString('fr-MA')}
                  </Link>
                </td>
                <td className="px-4 py-2">{r.recipient_mode}</td>
                <td className="px-4 py-2">
                  <Link className="text-cyan-700" to={LAB_ROUTES.ADMIN_REQUEST.replace(':id', r.request_id)}>ouvrir</Link>
                </td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td className="px-4 py-8 text-slate-400" colSpan={3}>Aucune consultation</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
