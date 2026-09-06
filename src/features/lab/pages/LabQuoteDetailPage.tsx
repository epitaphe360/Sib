import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useLabSessionStore } from '../store/labSessionStore';
import { labSchema } from '../services/labClient';
import { LabFileField } from '../components/LabFileField';
import { applyMargin } from '../lib/pricing';
import { proposedMarginPercent } from '../lib/competitiveness';
import { confirmLabAction, LabAlert, LabCard, LabPage } from '../components/LabUi';

export default function LabQuoteDetailPage() {
  const { id } = useParams();
  const orgId = useLabSessionStore((s) => s.activeOrg?.id);
  const [row, setRow] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [target, setTarget] = useState('');

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

  const supplierAmount = Number(row.supplier_amount ?? 0);
  const version = Number(row.version ?? 1);

  return (
    <LabPage kicker="Devis" title={String(row.quote_number)} subtitle={`${row.amount} ${row.currency} · ${row.status} · v${version}`}>
      {message && <LabAlert>{message}</LabAlert>}
      {error && <LabAlert tone="err">{error}</LabAlert>}
      {row.survey_token && (
        <p className="text-xs text-slate-500">Sondage client : /lab/quote-survey/{String(row.survey_token)}</p>
      )}
      {orgId && (
        <LabFileField organizationId={orgId} bucket="lab-client-documents" entityType="quote" entityId={String(row.id)} label="Pièce jointe devis" />
      )}
      <LabCard className="space-y-3">
        <p className="text-sm font-medium">Compétitivité — nouvelle version (jamais auto)</p>
        <p className="text-xs text-slate-500">Si le prix client est trop élevé : réduire la marge ou renégocier. Historique conservé.</p>
        <Input type="number" step="0.01" placeholder="Prix client cible" value={target} onChange={(e) => setTarget(e.target.value)} />
        <Button
          type="button"
          variant="secondary"
          onClick={async () => {
            if (!orgId || !id) return;
            const nextClient = Number(target);
            if (!supplierAmount || !Number.isFinite(nextClient)) { setError('Montant fournisseur et cible requis'); return; }
            const nextMargin = proposedMarginPercent(supplierAmount, nextClient);
            if (!confirmLabAction(`Créer la version ${version + 1} à ${nextClient} (marge ${nextMargin} %) ?`)) return;
            const { error: iErr } = await labSchema().from('quotes').insert({
              organization_id: orgId,
              request_id: row.request_id,
              quote_number: `${String(row.quote_number)}-v${version + 1}`,
              amount: applyMargin(supplierAmount, nextMargin),
              supplier_amount: supplierAmount,
              margin_percent: nextMargin,
              version: version + 1,
              parent_quote_id: id,
              turnaround_days: row.turnaround_days,
              conditions: `Version ${version + 1} — ajustement marge humain`,
              status: 'draft',
            });
            if (iErr) { setError(iErr.message); return; }
            setMessage(`Version ${version + 1} créée — marge proposée ${nextMargin} %`);
          }}
        >
          Créer une nouvelle version
        </Button>
      </LabCard>
    </LabPage>
  );
}
