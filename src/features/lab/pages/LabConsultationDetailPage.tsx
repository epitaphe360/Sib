import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { useLabSessionStore } from '../store/labSessionStore';
import { labSchema } from '../services/labClient';
import { rankOffers, type SupplierOffer } from '../lib/compareOffers';
import { canTransition } from '../lib/status';

interface ItemRow {
  id: string;
  token: string;
  supplier_id: string;
  suppliers: { name: string } | { name: string }[] | null;
  supplier_responses: Array<{
    id: string;
    amount: number;
    currency: string;
    turnaround_days: number;
    accreditation: string | null;
  }>;
}

export default function LabConsultationDetailPage() {
  const { id } = useParams();
  const orgId = useLabSessionStore((s) => s.activeOrg?.id);
  const userId = useLabSessionStore((s) => s.userId);
  const [items, setItems] = useState<ItemRow[]>([]);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [accreditationRequired, setAccreditationRequired] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orgId || !id) return;
    (async () => {
      const consult = await labSchema()
        .from('supplier_consultations')
        .select('id,request_id')
        .eq('id', id)
        .eq('organization_id', orgId)
        .maybeSingle();
      if (consult.error || !consult.data) { setError(consult.error?.message ?? 'Introuvable'); return; }
      setRequestId(consult.data.request_id);
      const req = await labSchema()
        .from('client_requests')
        .select('status,accreditation_required')
        .eq('id', consult.data.request_id)
        .maybeSingle();
      setStatus((req.data?.status as string) ?? null);
      setAccreditationRequired(!!req.data?.accreditation_required);
      const { data, error: iErr } = await labSchema()
        .from('supplier_consultation_items')
        .select('id,token,supplier_id,suppliers(name),supplier_responses(id,amount,currency,turnaround_days,accreditation)')
        .eq('consultation_id', id)
        .eq('organization_id', orgId);
      if (iErr) setError(iErr.message);
      else setItems((data ?? []) as unknown as ItemRow[]);
    })();
  }, [orgId, id]);

  const offers: SupplierOffer[] = useMemo(() => items.flatMap((item) => {
    const nameRaw = item.suppliers;
    const name = Array.isArray(nameRaw) ? nameRaw[0]?.name : nameRaw?.name;
    return (item.supplier_responses ?? []).map((r) => ({
      id: r.id,
      supplierId: item.supplier_id,
      supplierName: name ?? 'Fournisseur',
      amount: Number(r.amount),
      currency: r.currency,
      turnaroundDays: r.turnaround_days,
      accreditation: r.accreditation,
    }));
  }), [items]);

  const ranked = rankOffers(offers, { accreditationRequired });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#0b1f3a]">Comparaison</h1>
        <p className="text-sm text-slate-500">Critères : prix puis délai. L’IA recommande, la validation reste humaine.</p>
      </div>
      {message && <p className="text-sm text-green-700">{message}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-2">Rang</th>
              <th className="px-4 py-2">Fournisseur</th>
              <th className="px-4 py-2">Prix</th>
              <th className="px-4 py-2">Délai</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((o) => (
              <tr key={o.id} className="border-t border-slate-100">
                <td className="px-4 py-2">{o.rank}{o.recommended ? ' · reco' : ''}</td>
                <td className="px-4 py-2">{o.supplierName}</td>
                <td className="px-4 py-2">{o.amount} {o.currency}</td>
                <td className="px-4 py-2">{o.turnaroundDays} j</td>
                <td className="px-4 py-2">
                  <Button
                    type="button"
                    onClick={async () => {
                      if (!orgId || !requestId || !id) return;
                      const { error: sErr } = await labSchema().from('supplier_selection').insert({
                        organization_id: orgId,
                        request_id: requestId,
                        consultation_id: id,
                        selected_supplier_id: o.supplierId,
                        selected_by: userId,
                        reason: 'Choix humain après comparaison',
                        comparison_snapshot: { ranked },
                      });
                      if (sErr) { setError(sErr.message); return; }
                      if (status && canTransition(status as never, 'SUPPLIER_SELECTED')) {
                        await labSchema().from('client_requests').update({ status: 'SUPPLIER_SELECTED' }).eq('id', requestId);
                      }
                      setMessage(`Sélection enregistrée : ${o.supplierName}`);
                    }}
                  >
                    Valider
                  </Button>
                </td>
              </tr>
            ))}
            {ranked.length === 0 && (
              <tr><td className="px-4 py-8 text-slate-400" colSpan={5}>Aucune offre. Lien public : /lab/supplier-offer/:token</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <ul className="text-xs text-slate-500 space-y-1">
        {items.map((item) => (
          <li key={item.id}>Lien offre : /lab/supplier-offer/{item.token}</li>
        ))}
      </ul>
    </div>
  );
}
