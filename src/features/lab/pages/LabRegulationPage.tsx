import { useMemo, useState } from 'react';
import { useLabSessionStore } from '../store/labSessionStore';
import { labSchema } from '../services/labClient';
import { parseProductList, proposeRegulatedAnalyses, REGULATORY_CATALOG } from '../lib/regulationCatalog';

export default function LabRegulationPage() {
  const { activeOrg, userId } = useLabSessionStore();
  const orgId = activeOrg?.id;
  const [raw, setRaw] = useState('');
  const [validated, setValidated] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const products = useMemo(() => parseProductList(raw), [raw]);
  const proposals = useMemo(
    () => products.flatMap((product) => proposeRegulatedAnalyses(product)),
    [products],
  );

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <p className="text-[10px] uppercase tracking-[0.22em] text-cyan-700">CDC §4 · jamais sans texte</p>
        <h1 className="lab-display text-3xl text-[#0b1f3a]">Appels d’offres / réglementation</h1>
        <p className="text-sm text-slate-500">
          Import CSV/texte. Chaque paramètre porte un texte marocain et une référence.
          Validation humaine obligatoire avant usage commercial.
        </p>
      </div>
      <textarea
        className="h-40 w-full rounded-2xl border px-3 py-2 text-sm"
        placeholder={"produit\nHuile d’olive\nEau minérale"}
        value={raw}
        onChange={(e) => { setRaw(e.target.value); setValidated(false); }}
      />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={validated} onChange={(e) => setValidated(e.target.checked)} />
        Je valide ces propositions avant usage commercial
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {message && <p className="text-sm text-emerald-700">{message}</p>}
      <div className="overflow-x-auto rounded-2xl border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-2">Produit</th>
              <th className="px-4 py-2">Paramètre</th>
              <th className="px-4 py-2">Texte</th>
              <th className="px-4 py-2">Référence</th>
            </tr>
          </thead>
          <tbody>
            {proposals.map((p, i) => (
              <tr key={`${p.product}-${p.parameter}-${i}`} className="border-t">
                <td className="px-4 py-2">{p.product}</td>
                <td className="px-4 py-2 font-medium">{p.parameter}</td>
                <td className="px-4 py-2">{p.textTitle}</td>
                <td className="px-4 py-2">{p.reference}</td>
              </tr>
            ))}
            {proposals.length === 0 && (
              <tr><td className="px-4 py-8 text-slate-400" colSpan={4}>Aucun matching. Catalogue : {REGULATORY_CATALOG.length} textes identifiés.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <button
        type="button"
        className="rounded-lg bg-[#0b1f3a] px-4 py-2 text-sm text-white disabled:opacity-40"
        disabled={!validated || !orgId || proposals.length === 0}
        onClick={async () => {
          if (!orgId) return;
          const { error: iErr } = await labSchema().from('regulatory_proposals').insert(
            proposals.map((p) => ({
              organization_id: orgId,
              product_name: p.product,
              parameter: p.parameter,
              text_title: p.textTitle,
              reference: p.reference,
              kind: p.kind,
              validated_by: userId,
              validated_at: new Date().toISOString(),
            })),
          );
          if (iErr) { setError(iErr.message); return; }
          setMessage(`${proposals.length} propositions validées`);
        }}
      >
        Enregistrer les propositions validées
      </button>
    </div>
  );
}
