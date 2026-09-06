import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLabSessionStore } from '../store/labSessionStore';
import { labSchema } from '../services/labClient';
import type { LabClientRequest } from '../types';

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
        .select('id,organization_id,dossier_number,company_name,contact_name,email,phone,product_name,matrix,sample_type,sample_count,accreditation_required,notes,analysis_kind,status,created_at')
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

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-[#0b1f3a]">Demandes</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-2">Dossier</th>
              <th className="px-4 py-2">Client</th>
              <th className="px-4 py-2">Produit</th>
              <th className="px-4 py-2">Statut</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-slate-100">
                <td className="px-4 py-2">
                  <Link className="text-cyan-700" to={`/lab/admin/requests/${row.id}`}>{row.dossier_number}</Link>
                </td>
                <td className="px-4 py-2">{row.company_name}</td>
                <td className="px-4 py-2">{row.product_name}</td>
                <td className="px-4 py-2">{row.status}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td className="px-4 py-8 text-slate-400" colSpan={4}>Aucune demande</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
