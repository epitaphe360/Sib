import { useEffect, useState } from 'react';
import { LabBtn, LabCard, LabField, LabPage, labControlClass } from '../components/LabUi';
import { useLabSessionStore } from '../store/labSessionStore';
import { labSchema } from '../services/labClient';
import { SAMPLE_TYPE_CODES } from '../lib/qualificationCatalog';

export default function LabSampleCatalogPage() {
  const orgId = useLabSessionStore((s) => s.activeOrg?.id);
  const [products, setProducts] = useState<{ id: string; name: string; category_code: string; subcategory_label: string | null }[]>([]);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('alimentaire');
  const [family, setFamily] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const { data } = await labSchema().from('sample_products').select('id,name,category_code,subcategory_label').is('deleted_at', null).order('name').limit(200);
    setProducts((data ?? []) as typeof products);
  }
  useEffect(() => { void load(); }, [orgId]);

  return (
    <LabPage
      kicker="Référentiel"
      title="Catalogue échantillons"
      subtitle="Catégories, familles et produits configurables. Le formulaire public lit cette liste (fallback seed si vide)."
    >
      {error && <p className="text-sm text-red-700">{error}</p>}
      <LabCard>
        <form
          className="grid gap-3 sm:grid-cols-4"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!orgId || name.trim().length < 2) return;
            const { error: iErr } = await labSchema().from('sample_products').insert({
              organization_id: orgId,
              category_code: category,
              subcategory_label: family || null,
              name: name.trim(),
            });
            if (iErr) { setError(iErr.message); return; }
            setName('');
            await load();
          }}
        >
          <LabField label="Catégorie" tone="light">
            <select className={labControlClass()} value={category} onChange={(e) => setCategory(e.target.value)}>
              {SAMPLE_TYPE_CODES.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
            </select>
          </LabField>
          <LabField label="Famille" tone="light">
            <input className={labControlClass()} value={family} onChange={(e) => setFamily(e.target.value)} />
          </LabField>
          <LabField label="Produit exact" tone="light">
            <input className={labControlClass()} value={name} onChange={(e) => setName(e.target.value)} />
          </LabField>
          <div className="flex items-end">
            <LabBtn type="submit">Ajouter</LabBtn>
          </div>
        </form>
      </LabCard>
      <LabCard padding="none">
        <ul className="divide-y divide-[#e6dcc8]">
          {products.map((p) => (
            <li key={p.id} className="flex items-center justify-between px-4 py-2 text-sm text-[#0B1F33]">
              <span>{p.name} · {p.category_code}{p.subcategory_label ? ` / ${p.subcategory_label}` : ''}</span>
            </li>
          ))}
          {products.length === 0 && <li className="px-4 py-6 text-sm text-[#3d4f63]">Catalogue global (seed) — ajoutez des produits org ici.</li>}
        </ul>
      </LabCard>
    </LabPage>
  );
}
