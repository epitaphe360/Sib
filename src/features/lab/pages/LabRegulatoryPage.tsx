import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useLabSessionStore } from '../store/labSessionStore';
import { labSchema } from '../services/labClient';
import { parseProductListCsv, proposeRegulatedAnalyses, REGULATORY_TEXTS } from '../lib/regulatoryCatalog';
import { confirmLabAction, LabAlert, LabBadge, LabCard, LabEmpty, LabPage, LabTable, LabTh } from '../components/LabUi';
import { can } from '../rbac';

interface ProposalRow {
  id: string;
  product_name: string;
  parameter: string;
  text_title: string;
  reference: string;
  status: string;
}

export default function LabRegulatoryPage() {
  const { activeOrg, userId, role } = useLabSessionStore();
  const orgId = activeOrg?.id;
  const [csv, setCsv] = useState('produit;matrice\nHuile d’olive;alimentaire\nEau minérale;eau potable');
  const [rows, setRows] = useState<ProposalRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    if (!orgId) return;
    const { data, error: qErr } = await labSchema()
      .from('regulatory_proposals')
      .select('id,product_name,parameter,text_title,reference,status')
      .eq('organization_id', orgId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(120);
    if (qErr) setError(qErr.message);
    else setRows((data ?? []) as ProposalRow[]);
  }
  useEffect(() => { void load(); }, [orgId]);

  return (
    <LabPage
      kicker="Chapitre 4"
      title="Appels d’offres & réglementation"
      subtitle="Uniquement les analyses citées par un texte marocain identifié. Aucune « pratique courante » n’est présentée comme obligation."
    >
      {message && <LabAlert>{message}</LabAlert>}
      {error && <LabAlert tone="err">{error}</LabAlert>}

      <LabCard>
        <p className="text-sm font-medium text-[#071422]">Textes du catalogue</p>
        <ul className="mt-3 space-y-2 text-sm text-slate-600">
          {REGULATORY_TEXTS.map((t) => (
            <li key={t.id}>
              <span className="font-medium text-[#0b1f3a]">{t.title}</span>
              <span className="block text-xs text-slate-500">{t.reference}</span>
            </li>
          ))}
        </ul>
      </LabCard>

      <LabCard className="space-y-3">
        <p className="text-sm font-medium">Importer une liste de produits (CSV / Excel exporté)</p>
        <textarea
          className="min-h-[120px] w-full rounded-xl border border-[#e8e2d4] p-3 text-sm"
          value={csv}
          onChange={(e) => setCsv(e.target.value)}
        />
        <Button
          type="button"
          disabled={!can(role, 'regulatory.write')}
          onClick={async () => {
            if (!orgId) return;
            const products = parseProductListCsv(csv);
            if (!products.length) { setError('Aucun produit lisible'); return; }
            const inserts = products.flatMap((p) => {
              const proposals = proposeRegulatedAnalyses(p.product, p.matrix);
              return proposals.map((pr) => ({
                organization_id: orgId,
                product_name: p.product,
                matrix: p.matrix ?? null,
                parameter: pr.parameter,
                kind: pr.kind,
                text_title: pr.textTitle,
                reference: pr.reference,
                applicability: pr.applicability,
                status: 'A_VALIDER',
              }));
            });
            if (!inserts.length) {
              setMessage('Aucun texte applicable dans le catalogue pour ces produits — aucune obligation inventée.');
              return;
            }
            const { error: iErr } = await labSchema().from('regulatory_proposals').insert(inserts);
            if (iErr) { setError(iErr.message); return; }
            setMessage(`${inserts.length} propositions à valider (paramètres nommés + références).`);
            await load();
          }}
        >
          Proposer les analyses réglementées
        </Button>
      </LabCard>

      <LabTable>
        <thead className="bg-[#f7f4ee]">
          <tr>
            <LabTh>Produit</LabTh>
            <LabTh>Paramètre</LabTh>
            <LabTh>Texte</LabTh>
            <LabTh>Statut</LabTh>
            <LabTh></LabTh>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t border-[#f0eadb]">
              <td className="px-4 py-3">{r.product_name}</td>
              <td className="px-4 py-3 font-medium">{r.parameter}</td>
              <td className="px-4 py-3 text-xs text-slate-500">
                {r.text_title}
                <span className="mt-1 block">{r.reference}</span>
              </td>
              <td className="px-4 py-3">
                <LabBadge tone={r.status === 'VALIDEE' ? 'green' : 'amber'}>{r.status}</LabBadge>
              </td>
              <td className="px-4 py-3">
                {r.status !== 'VALIDEE' && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={async () => {
                      if (!confirmLabAction('Valider cette proposition réglementaire pour un usage commercial ?')) return;
                      const { error: uErr } = await labSchema().from('regulatory_proposals').update({
                        status: 'VALIDEE',
                        validated_by: userId,
                        validated_at: new Date().toISOString(),
                      }).eq('id', r.id);
                      if (uErr) { setError(uErr.message); return; }
                      await load();
                    }}
                  >
                    Valider
                  </Button>
                )}
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={5}><LabEmpty>Aucune proposition — importer une liste.</LabEmpty></td></tr>
          )}
        </tbody>
      </LabTable>
    </LabPage>
  );
}
