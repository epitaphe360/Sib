import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLabSessionStore } from '../store/labSessionStore';
import { labSchema } from '../services/labClient';
import type { LabClientRequest } from '../types';
import { LabBadge, LabEmpty, LabPage, LabTable, LabTh } from '../components/LabUi';
import { journeyStepForStatus } from '../lib/journey';

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
    <LabPage kicker="Étapes 1–2" title="Demandes" subtitle="Dossier maître unique. Qualification interne FR / sous-traitance EN.">
      {error && <p className="text-sm text-red-600">{error}</p>}
      <LabTable>
        <thead className="bg-[#f7f4ee]">
          <tr>
            <LabTh>Dossier</LabTh>
            <LabTh>Client</LabTh>
            <LabTh>Produit</LabTh>
            <LabTh>Étape</LabTh>
            <LabTh>Statut</LabTh>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-t border-[#f0eadb]">
              <td className="px-4 py-3">
                <Link className="font-medium text-cyan-800" to={`/lab/admin/requests/${row.id}`}>{row.dossier_number}</Link>
              </td>
              <td className="px-4 py-3">{row.company_name}</td>
              <td className="px-4 py-3">{row.product_name}</td>
              <td className="px-4 py-3">{journeyStepForStatus(row.status) || '—'}</td>
              <td className="px-4 py-3"><LabBadge tone="gold">{row.status}</LabBadge></td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={5}><LabEmpty>Aucune demande</LabEmpty></td></tr>
          )}
        </tbody>
      </LabTable>
    </LabPage>
  );
}
