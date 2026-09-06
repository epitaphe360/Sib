import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLabSessionStore } from '../store/labSessionStore';
import { labSchema } from '../services/labClient';
import { LAB_ROUTES } from '../routes';

interface SampleRow {
  id: string;
  code: string;
  product_name: string;
  received_at: string | null;
  received_by: string | null;
}

export default function LabSamplesPage() {
  const orgId = useLabSessionStore((s) => s.activeOrg?.id);
  const [rows, setRows] = useState<SampleRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orgId) return;
    (async () => {
      const { data, error: qErr } = await labSchema()
        .from('samples')
        .select('id,code,product_name,received_at,received_by')
        .eq('organization_id', orgId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(100);
      if (qErr) setError(qErr.message);
      else setRows((data ?? []) as SampleRow[]);
    })();
  }, [orgId]);

  return (
    <div className="space-y-4">
      <h1 className="font-serif text-3xl font-semibold text-[#071422]">Échantillons</h1>
      <p className="text-sm text-slate-500">Étape 5 — registre Supabase, code unique.</p>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr><th className="px-4 py-2">Code</th><th className="px-4 py-2">Produit</th><th className="px-4 py-2">Réception</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-slate-100">
                <td className="px-4 py-2">
                  <Link className="text-cyan-700" to={LAB_ROUTES.ADMIN_SAMPLE.replace(':id', r.id)}>{r.code}</Link>
                </td>
                <td className="px-4 py-2">{r.product_name}</td>
                <td className="px-4 py-2">{r.received_at ? new Date(r.received_at).toLocaleString('fr-MA') : '—'}</td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td className="px-4 py-8 text-slate-400" colSpan={3}>Aucun échantillon</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
