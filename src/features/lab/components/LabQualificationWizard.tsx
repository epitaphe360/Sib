import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { LabBtn, LabField, LabPublicFrame, labInputClass } from './LabUi';
import { LAB_ROUTES } from '../routes';
import { labSchema } from '../services/labClient';
import { useLabSessionStore } from '../store/labSessionStore';
import { extractRequestFromEmail } from '../lib/extractRequest';
import {
  CANAL_PREFERENCES, CIVILITES, CLIENT_TYPES, CONDITIONNEMENTS, DIAL_CODES,
  DOCUMENT_TYPES, ETATS_PHYSIQUES, FONCTION_EXAMPLES, LANGUE_PREFERENCES,
  MODES_ENVOI, OBJECTIFS_ANALYTIQUES, ORIGINES, PRELEVEMENT_PAR, QUALIFICATION_STEPS,
  SAMPLE_TYPE_CODES, TRI_ETATS, UNITES_QUANTITE, URGENCES,
  datesAreConditional, familiesForType, searchProducts, seedCatalogRows,
  type SampleProductRow,
} from '../lib/qualificationCatalog';
import {
  applyExistingClient, applyExtracted, canAdvance, clearDraftStorage,
  emptyDraft, identifyMissing, loadDraftFromStorage, newSampleLine,
  saveDraftToStorage, toSubmitPayload, type QualificationDraft,
} from '../lib/qualificationDraft';
import { assertLabFile, uploadLabFile } from '../lib/labStorage';

const ORG_SLUG = 'elitech';

function Select({
  value, onChange, children,
}: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <select className={labInputClass()} value={value} onChange={(e) => onChange(e.target.value)}>
      {children}
    </select>
  );
}

export default function LabQualificationWizard() {
  const userId = useLabSessionStore((s) => s.userId);
  const email = useLabSessionStore((s) => s.email);
  const orgId = useLabSessionStore((s) => s.activeOrg?.id);
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<QualificationDraft>(() => loadDraftFromStorage() ?? emptyDraft());
  const [rawEmail, setRawEmail] = useState('');
  const [extractNote, setExtractNote] = useState<string | null>(null);
  const [clientQuery, setClientQuery] = useState('');
  const [clientHits, setClientHits] = useState<{ id: string; company_name: string; email: string | null; ice: string | null }[]>([]);
  const [products, setProducts] = useState<SampleProductRow[]>(seedCatalogRows().products);
  const [productQuery, setProductQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ id: string; dossier_number: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [showEmail, setShowEmail] = useState(false);
  const [attempted, setAttempted] = useState(false);

  const patch = (partial: Partial<QualificationDraft>) => {
    setDraft((d) => {
      const next = { ...d, ...partial };
      saveDraftToStorage(next);
      return next;
    });
    setDraftSaved(false);
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await labSchema().from('sample_products').select('id,category_code,subcategory_label,name').is('deleted_at', null);
        if (!cancelled && data?.length) setProducts(data as SampleProductRow[]);
      } catch {
        /* fallback seed */
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!draft.client_existant || clientQuery.trim().length < 3) {
      setClientHits([]);
      return;
    }
    const t = window.setTimeout(async () => {
      const { data } = await labSchema().rpc('match_existing_client', { p_org_slug: ORG_SLUG, p_query: clientQuery.trim() });
      setClientHits((data ?? []) as typeof clientHits);
    }, 280);
    return () => window.clearTimeout(t);
  }, [clientQuery, draft.client_existant]);

  const families = familiesForType(draft.type_echantillon);
  const suggestions = useMemo(
    () => searchProducts(products, productQuery || draft.produit_exact, draft.type_echantillon, draft.famille_produit),
    [products, productQuery, draft.produit_exact, draft.type_echantillon, draft.famille_produit],
  );
  const blocking = identifyMissing(draft).filter((g) => g.severity === 'blocking' && g.step === step);
  const allGaps = identifyMissing(draft);
  const modifiedLocked = Object.keys(draft.lockedFromClient).filter((key) => {
    const k = key as keyof QualificationDraft;
    return String(draft[k] ?? '') !== String(draft.lockedFromClient[k] ?? '');
  });
  const nextOk = canAdvance(draft, step);
  const err = (code: string) => (attempted ? blocking.find((g) => g.code === code)?.label : undefined);

  async function persistDraft() {
    saveDraftToStorage(draft);
    if (userId) {
      const { data: existing } = await labSchema().from('request_drafts').select('id').eq('user_id', userId).maybeSingle();
      if (existing?.id) {
        await labSchema().from('request_drafts').update({ payload: draft, email, updated_at: new Date().toISOString() }).eq('id', existing.id);
      } else {
        await labSchema().from('request_drafts').insert({ user_id: userId, email, organization_id: orgId ?? null, payload: draft });
      }
    }
    setDraftSaved(true);
  }

  async function submit() {
    if (!canAdvance(draft, 5) && allGaps.some((g) => g.severity === 'blocking')) {
      setError('Complétez les champs obligatoires avant l’envoi.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const payload = { ...toSubmitPayload(draft), origin: 'FORM' };
      let data: { id: string; dossier_number?: string } | null = null;
      const qualified = await labSchema().rpc('submit_qualified_request', {
        p_org_slug: ORG_SLUG,
        p_payload: payload,
      });
      if (qualified.error) {
        const fallback = await labSchema().rpc('submit_public_request', {
          p_org_slug: ORG_SLUG,
          p_company_name: payload.company_name,
          p_contact_name: payload.contact_name,
          p_email: payload.email,
          p_phone: payload.phone,
          p_country_code: payload.country_code,
          p_product_name: payload.product_name,
          p_matrix: payload.matrix,
          p_sample_type: payload.sample_type,
          p_sample_count: payload.sample_count,
          p_urgency: payload.urgency,
          p_deadline: payload.deadline,
          p_accreditation_required: payload.accreditation_required,
          p_notes: payload.notes,
          p_analyses: payload.analyses,
        });
        if (fallback.error) throw qualified.error;
        data = { id: String(fallback.data), dossier_number: String(fallback.data) };
      } else {
        data = qualified.data as { id: string; dossier_number: string };
      }
      const result = data;
      if (!result?.id) throw new Error('Envoi impossible');
      if (orgId && files.length) {
        for (const file of files) {
          try {
            assertLabFile(file);
            await uploadLabFile({
              organizationId: orgId,
              bucket: 'lab-client-documents',
              file,
              entityType: 'client_requests',
              entityId: result.id,
            });
          } catch {
            /* noms déjà dans qualification */
          }
        }
      }
      clearDraftStorage();
      setDone(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Envoi impossible');
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <LabPublicFrame>
        <div className="mx-auto max-w-lg py-16">
          <div className="lab-glass rounded-3xl p-8 text-center">
            <p className="text-[11px] uppercase tracking-[0.24em] text-cyan-300">Dossier créé</p>
            <h1 className="lab-display mt-3 text-4xl text-white">{done.dossier_number}</h1>
            <p className="mt-4 text-sm text-white/70">
              Conservez cette référence. L’espace client s’ouvre avec un code OTP envoyé par e-mail (10 min).
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link to={LAB_ROUTES.CLIENT_LOGIN}><LabBtn tone="gold">Espace client</LabBtn></Link>
              <Link to={LAB_ROUTES.ROOT}><LabBtn tone="ghost">Retour au portail</LabBtn></Link>
            </div>
          </div>
        </div>
      </LabPublicFrame>
    );
  }

  return (
    <LabPublicFrame>
      <div className="mx-auto max-w-5xl space-y-5 py-4">
        <header className="space-y-3">
          <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-300">Qualification de demande</p>
          <h1 className="lab-display text-4xl text-white sm:text-5xl">Demande d’analyse</h1>
          <p className="max-w-2xl text-sm text-white/70">
            Cinq étapes pour transformer une demande parfois vague en fiche exploitable. L’IA ne fait que préremplir — jamais inventer une analyse ou une norme.
          </p>
          <p className="text-sm font-medium text-cyan-200">Étape {step} sur 5 · {QUALIFICATION_STEPS[step - 1]?.short}</p>
          <div className="lab-qualify-rail" aria-label="Progression">
            {QUALIFICATION_STEPS.map((s) => (
              <button
                key={s.n}
                type="button"
                data-state={s.n === step ? 'current' : s.n < step ? 'done' : 'todo'}
                onClick={() => s.n <= step && setStep(s.n)}
              >
                {s.n} {s.short}
              </button>
            ))}
          </div>
        </header>

        {modifiedLocked.length > 0 && (
          <p className="rounded-xl border border-amber-300/40 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
            Vous modifiez des données du fichier client ({modifiedLocked.join(', ')}). Elles ne seront pas écrasées dans le référentiel sans validation du laboratoire.
          </p>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_0.78fr]">
          <form
            className="lab-glass space-y-4 rounded-3xl p-5 sm:p-6"
            onSubmit={(e) => {
              e.preventDefault();
              if (step < 5) {
                if (!nextOk) {
                  setAttempted(true);
                  return;
                }
                setAttempted(false);
                setStep(step + 1);
                return;
              }
              void submit();
            }}
          >
            <p className="lab-display text-2xl text-white">{QUALIFICATION_STEPS[step - 1]?.title}</p>

            {step === 1 && (
              <div className="space-y-4">
                <LabField label="Type de client">
                  <Select value={draft.type_client} onChange={(v) => patch({ type_client: v })}>
                    {CLIENT_TYPES.map((t) => <option key={t.value} value={t.value} className="text-slate-900">{t.label}</option>)}
                  </Select>
                </LabField>
                <label className="flex min-h-11 items-center gap-2 text-sm text-white/80">
                  <input type="checkbox" checked={draft.client_existant} onChange={(e) => patch({ client_existant: e.target.checked })} />
                  Je suis déjà client
                </label>
                {draft.client_existant && (
                  <LabField label="Rechercher par société, téléphone, email ou code client">
                    <input className={labInputClass()} value={clientQuery} onChange={(e) => setClientQuery(e.target.value)} placeholder="Atlas, 661234567, code…" />
                    {clientHits.length > 0 && (
                      <ul className="mt-2 divide-y divide-white/10 rounded-xl border border-white/15">
                        {clientHits.map((hit) => (
                          <li key={hit.id}>
                            <button
                              type="button"
                              className="w-full px-3 py-2 text-left text-sm text-white hover:bg-white/5"
                              onClick={() => {
                                setDraft((d) => applyExistingClient(d, hit));
                                setClientHits([]);
                              }}
                            >
                              {hit.company_name} · {hit.email ?? 'sans e-mail'}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </LabField>
                )}
                {draft.type_client !== 'particulier' && (
                  <>
                    <LabField label="Société" error={err('societe')}>
                      <input className={labInputClass()} value={draft.societe} onChange={(e) => patch({ societe: e.target.value })} />
                    </LabField>
                    <LabField label="Raison sociale (si différente)">
                      <input className={labInputClass()} value={draft.raison_sociale} onChange={(e) => patch({ raison_sociale: e.target.value })} />
                    </LabField>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <LabField label="ICE">
                        <input className={labInputClass()} value={draft.ice} onChange={(e) => patch({ ice: e.target.value })} />
                      </LabField>
                      <LabField label="IF">
                        <input className={labInputClass()} value={draft.if_fiscal} onChange={(e) => patch({ if_fiscal: e.target.value })} />
                      </LabField>
                      <LabField label="RC">
                        <input className={labInputClass()} value={draft.rc} onChange={(e) => patch({ rc: e.target.value })} />
                      </LabField>
                    </div>
                    {!draft.ice.trim() && (
                      <p className="text-xs text-amber-200">ICE à compléter avant facturation — la demande n’est pas bloquée.</p>
                    )}
                  </>
                )}
                <LabField label="Adresse">
                  <input className={labInputClass()} value={draft.adresse} onChange={(e) => patch({ adresse: e.target.value })} />
                </LabField>
                <div className="grid gap-3 sm:grid-cols-3">
                  <LabField label="Ville">
                    <input className={labInputClass()} value={draft.ville} onChange={(e) => patch({ ville: e.target.value })} />
                  </LabField>
                  <LabField label="Code postal">
                    <input className={labInputClass()} value={draft.code_postal} onChange={(e) => patch({ code_postal: e.target.value })} />
                  </LabField>
                  <LabField label="Pays">
                    <input className={labInputClass()} value={draft.pays} onChange={(e) => patch({ pays: e.target.value })} />
                  </LabField>
                </div>
                <div className="grid gap-3 sm:grid-cols-4">
                  <LabField label="Civilité">
                    <Select value={draft.civilite} onChange={(v) => patch({ civilite: v })}>
                      {CIVILITES.map((c) => <option key={c.value} value={c.value} className="text-slate-900">{c.label}</option>)}
                    </Select>
                  </LabField>
                  <LabField label="Prénom" error={err('prenom')}>
                    <input className={labInputClass()} value={draft.prenom} onChange={(e) => patch({ prenom: e.target.value })} />
                  </LabField>
                  <LabField label="Nom" error={err('nom') || err('contact')}>
                    <input className={labInputClass()} value={draft.nom} onChange={(e) => patch({ nom: e.target.value })} />
                  </LabField>
                  <LabField label="Fonction">
                    <input className={labInputClass()} list="lab-fonctions" value={draft.fonction} onChange={(e) => patch({ fonction: e.target.value })} />
                    <datalist id="lab-fonctions">{FONCTION_EXAMPLES.map((f) => <option key={f} value={f} />)}</datalist>
                  </LabField>
                </div>
                <LabField label="Email" error={err('email')}>
                  <input className={labInputClass()} type="email" value={draft.email} onChange={(e) => patch({ email: e.target.value })} />
                </LabField>
                <div className="grid grid-cols-3 gap-2">
                  <LabField label="Indicatif">
                    <Select value={draft.indicatif} onChange={(v) => patch({ indicatif: v })}>
                      {DIAL_CODES.map((c) => <option key={c} value={c} className="text-slate-900">{c}</option>)}
                    </Select>
                  </LabField>
                  <div className="col-span-2">
                    <LabField label="Téléphone" error={err('telephone')}>
                      <input className={labInputClass()} inputMode="numeric" placeholder="612345678" value={draft.telephone} onChange={(e) => patch({ telephone: e.target.value })} />
                    </LabField>
                  </div>
                </div>
                <LabField label="Téléphone secondaire">
                  <input className={labInputClass()} inputMode="numeric" value={draft.telephone_secondaire} onChange={(e) => patch({ telephone_secondaire: e.target.value })} />
                </LabField>
                <div className="grid gap-3 sm:grid-cols-2">
                  <LabField label="Canal préféré">
                    <Select value={draft.canal_preference} onChange={(v) => patch({ canal_preference: v })}>
                      {CANAL_PREFERENCES.map((c) => <option key={c.value} value={c.value} className="text-slate-900">{c.label}</option>)}
                    </Select>
                  </LabField>
                  <LabField label="Langue">
                    <Select value={draft.langue_preference} onChange={(v) => patch({ langue_preference: v })}>
                      {LANGUE_PREFERENCES.map((c) => <option key={c.value} value={c.value} className="text-slate-900">{c.label}</option>)}
                    </Select>
                  </LabField>
                </div>
                <label className="flex min-h-11 items-center gap-2 text-sm text-white/80">
                  <input type="checkbox" checked={draft.autre_destinataire_devis} onChange={(e) => patch({ autre_destinataire_devis: e.target.checked })} />
                  Une autre personne doit recevoir le devis
                </label>
                {draft.autre_destinataire_devis && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <LabField label="Nom destinataire" error={err('devis_nom')}>
                      <input className={labInputClass()} value={draft.destinataire_devis.nom} onChange={(e) => patch({ destinataire_devis: { ...draft.destinataire_devis, nom: e.target.value } })} />
                    </LabField>
                    <LabField label="Fonction">
                      <input className={labInputClass()} value={draft.destinataire_devis.fonction} onChange={(e) => patch({ destinataire_devis: { ...draft.destinataire_devis, fonction: e.target.value } })} />
                    </LabField>
                    <LabField label="Email" error={err('devis_email')}>
                      <input className={labInputClass()} value={draft.destinataire_devis.email} onChange={(e) => patch({ destinataire_devis: { ...draft.destinataire_devis, email: e.target.value } })} />
                    </LabField>
                    <LabField label="Téléphone">
                      <input className={labInputClass()} value={draft.destinataire_devis.telephone} onChange={(e) => patch({ destinataire_devis: { ...draft.destinataire_devis, telephone: e.target.value } })} />
                    </LabField>
                  </div>
                )}
                <label className="flex min-h-11 items-center gap-2 text-sm text-white/80">
                  <input type="checkbox" checked={draft.facturation_differente} onChange={(e) => patch({ facturation_differente: e.target.checked })} />
                  Informations de facturation différentes
                </label>
                {draft.facturation_differente && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <LabField label="Société facturation">
                      <input className={labInputClass()} value={draft.facturation.societe} onChange={(e) => patch({ facturation: { ...draft.facturation, societe: e.target.value } })} />
                    </LabField>
                    <LabField label="ICE facturation">
                      <input className={labInputClass()} value={draft.facturation.ice} onChange={(e) => patch({ facturation: { ...draft.facturation, ice: e.target.value } })} />
                    </LabField>
                    <LabField label="Adresse">
                      <input className={labInputClass()} value={draft.facturation.adresse} onChange={(e) => patch({ facturation: { ...draft.facturation, adresse: e.target.value } })} />
                    </LabField>
                    <LabField label="Email facturation">
                      <input className={labInputClass()} value={draft.facturation.email} onChange={(e) => patch({ facturation: { ...draft.facturation, email: e.target.value } })} />
                    </LabField>
                    <LabField label="Contact facturation">
                      <input className={labInputClass()} value={draft.facturation.contact} onChange={(e) => patch({ facturation: { ...draft.facturation, contact: e.target.value } })} />
                    </LabField>
                  </div>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <LabField label="Type d’échantillon" error={err('type_echantillon')}>
                  <Select value={draft.type_echantillon} onChange={(v) => patch({ type_echantillon: v, famille_produit: '' })}>
                    <option value="" className="text-slate-900">Choisir…</option>
                    {SAMPLE_TYPE_CODES.map((t) => <option key={t.code} value={t.code} className="text-slate-900">{t.label}</option>)}
                  </Select>
                </LabField>
                {draft.type_echantillon && (
                  <LabField label="Famille / sous-catégorie">
                    <Select value={draft.famille_produit} onChange={(v) => patch({ famille_produit: v })}>
                      <option value="" className="text-slate-900">Choisir…</option>
                      {families.map((f) => <option key={f} value={f} className="text-slate-900">{f}</option>)}
                    </Select>
                  </LabField>
                )}
                <LabField label="Produit exact" error={err('produit')}>
                  <input
                    className={labInputClass()}
                    value={draft.produit_exact}
                    onChange={(e) => {
                      setProductQuery(e.target.value);
                      patch({ produit_exact: e.target.value });
                    }}
                    placeholder="beurre, mozzarella…"
                  />
                  {suggestions.length > 0 && (productQuery || draft.produit_exact) && (
                    <ul className="mt-2 max-h-40 overflow-auto rounded-xl border border-white/15">
                      {suggestions.map((p) => (
                        <li key={`${p.category_code}-${p.name}`}>
                          <button type="button" className="w-full px-3 py-2 text-left text-sm text-white hover:bg-white/5" onClick={() => { patch({ produit_exact: p.name, famille_produit: p.subcategory_label, type_echantillon: p.category_code }); setProductQuery(''); }}>
                            {p.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </LabField>
                <div className="grid gap-3 sm:grid-cols-2">
                  <LabField label="Nom commercial">
                    <input className={labInputClass()} value={draft.nom_commercial} onChange={(e) => patch({ nom_commercial: e.target.value })} />
                  </LabField>
                  <LabField label="Marque">
                    <input className={labInputClass()} value={draft.marque} onChange={(e) => patch({ marque: e.target.value })} />
                  </LabField>
                  <LabField label="Référence produit">
                    <input className={labInputClass()} value={draft.reference_produit} onChange={(e) => patch({ reference_produit: e.target.value })} />
                  </LabField>
                  <LabField label="N° de lot">
                    <input className={labInputClass()} value={draft.numero_lot} onChange={(e) => patch({ numero_lot: e.target.value })} />
                  </LabField>
                </div>
                {datesAreConditional(draft.type_echantillon) && (
                  <div className="grid gap-3 sm:grid-cols-3">
                    <LabField label="Date de fabrication">
                      <input className={labInputClass()} type="date" value={draft.date_fabrication} onChange={(e) => patch({ date_fabrication: e.target.value })} />
                    </LabField>
                    <LabField label="DDM">
                      <input className={labInputClass()} type="date" value={draft.ddm} onChange={(e) => patch({ ddm: e.target.value })} />
                    </LabField>
                    <LabField label="DLC">
                      <input className={labInputClass()} type="date" value={draft.dlc} onChange={(e) => patch({ dlc: e.target.value })} />
                    </LabField>
                  </div>
                )}
                <div className="grid gap-3 sm:grid-cols-2">
                  <LabField label="Origine">
                    <Select value={draft.origine_produit} onChange={(v) => patch({ origine_produit: v })}>
                      {ORIGINES.map((o) => <option key={o.value} value={o.value} className="text-slate-900">{o.label}</option>)}
                    </Select>
                  </LabField>
                  {draft.origine_produit === 'import' && (
                    <LabField label="Pays d’origine" error={err('pays_origine')}>
                      <input className={labInputClass()} value={draft.pays_origine} onChange={(e) => patch({ pays_origine: e.target.value })} />
                    </LabField>
                  )}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <LabField label="Température">
                    <input className={labInputClass()} value={draft.temperature_produit} onChange={(e) => patch({ temperature_produit: e.target.value })} placeholder="ex. +4 °C" />
                  </LabField>
                  <LabField label="État physique">
                    <Select value={draft.etat_physique} onChange={(v) => patch({ etat_physique: v })}>
                      <option value="" className="text-slate-900">—</option>
                      {ETATS_PHYSIQUES.map((e) => <option key={e} value={e} className="text-slate-900">{e}</option>)}
                    </Select>
                  </LabField>
                  <LabField label="Conditionnement">
                    <Select value={draft.conditionnement} onChange={(v) => patch({ conditionnement: v })}>
                      <option value="" className="text-slate-900">—</option>
                      {CONDITIONNEMENTS.map((e) => <option key={e} value={e} className="text-slate-900">{e}</option>)}
                    </Select>
                  </LabField>
                  <div className="grid grid-cols-2 gap-2">
                    <LabField label="Quantité">
                      <input className={labInputClass()} value={draft.quantite_par_echantillon} onChange={(e) => patch({ quantite_par_echantillon: e.target.value })} />
                    </LabField>
                    <LabField label="Unité">
                      <Select value={draft.unite_quantite} onChange={(v) => patch({ unite_quantite: v })}>
                        {UNITES_QUANTITE.map((u) => <option key={u} value={u} className="text-slate-900">{u}</option>)}
                      </Select>
                    </LabField>
                  </div>
                </div>
                <LabField label="Nombre d’échantillons" error={err('nombre_echantillons')}>
                  <input className={labInputClass()} type="number" min={1} value={draft.nombre_echantillons} onChange={(e) => patch({ nombre_echantillons: Number(e.target.value) })} />
                </LabField>
                <label className="flex min-h-11 items-center gap-2 text-sm text-white/80">
                  <input
                    type="checkbox"
                    checked={draft.echantillons_identiques}
                    onChange={(e) => {
                      const identical = e.target.checked;
                      patch({
                        echantillons_identiques: identical,
                        echantillons: identical ? [] : (draft.echantillons.length ? draft.echantillons : [newSampleLine(1)]),
                      });
                    }}
                  />
                  Les échantillons sont-ils identiques ?
                </label>
                {!draft.echantillons_identiques && (
                  <div className="space-y-3">
                    {draft.echantillons.map((line, i) => (
                      <div key={line.id} className="rounded-2xl border border-white/15 p-3">
                        <p className="mb-2 text-[11px] uppercase tracking-[0.16em] text-amber-200">{line.label || `Échantillon ${i + 1}`}</p>
                        <div className="grid gap-2 sm:grid-cols-2">
                          <input className={labInputClass()} placeholder="Produit" value={line.produit_exact} onChange={(e) => {
                            const next = [...draft.echantillons];
                            next[i] = { ...line, produit_exact: e.target.value };
                            patch({ echantillons: next });
                          }} />
                          <input className={labInputClass()} placeholder="Lot" value={line.numero_lot} onChange={(e) => {
                            const next = [...draft.echantillons];
                            next[i] = { ...line, numero_lot: e.target.value };
                            patch({ echantillons: next });
                          }} />
                        </div>
                      </div>
                    ))}
                    <LabBtn tone="ghost" onClick={() => patch({ echantillons: [...draft.echantillons, newSampleLine(draft.echantillons.length + 1)] })}>
                      Ajouter un échantillon
                    </LabBtn>
                  </div>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <LabField label="Objectif analytique" error={err('objectif')}>
                  <Select value={draft.objectif_analytique} onChange={(v) => patch({ objectif_analytique: v })}>
                    <option value="" className="text-slate-900">Choisir…</option>
                    {OBJECTIFS_ANALYTIQUES.map((o) => <option key={o.value} value={o.value} className="text-slate-900">{o.label}</option>)}
                  </Select>
                </LabField>
                <label className="flex min-h-11 items-center gap-2 text-sm text-white/80">
                  <input type="checkbox" checked={draft.analyses_inconnues} onChange={(e) => patch({ analyses_inconnues: e.target.checked })} />
                  Je ne sais pas quelles analyses demander
                </label>
                {!draft.analyses_inconnues && (
                  <LabField label="Analyses souhaitées" error={err('analyses')}>
                    <textarea className={`${labInputClass()} h-24 py-3`} value={draft.analyses_souhaitees} onChange={(e) => patch({ analyses_souhaitees: e.target.value })} placeholder="pH, métaux lourds… (telles que citées, sans invention)" />
                  </LabField>
                )}
                <LabField label="Conformité réglementaire demandée ?">
                  <Select value={draft.conformite_reglementaire} onChange={(v) => patch({ conformite_reglementaire: v })}>
                    {TRI_ETATS.map((t) => <option key={t.value} value={t.value} className="text-slate-900">{t.label}</option>)}
                  </Select>
                </LabField>
                {draft.conformite_reglementaire === 'oui' && (
                  <LabField label="Textes / normes cités par le client (jamais inventés)">
                    <input className={labInputClass()} value={draft.textes_mentionnes} onChange={(e) => patch({ textes_mentionnes: e.target.value })} />
                  </LabField>
                )}
                <LabField label="Accréditation nécessaire ?">
                  <Select value={draft.accreditation_requise} onChange={(v) => patch({ accreditation_requise: v })}>
                    {TRI_ETATS.map((t) => <option key={t.value} value={t.value} className="text-slate-900">{t.label}</option>)}
                  </Select>
                </LabField>
                {draft.accreditation_requise === 'oui' && (
                  <LabField label="Organisme / référentiel (si le client le cite)">
                    <input className={labInputClass()} value={draft.organisme_accreditation} onChange={(e) => patch({ organisme_accreditation: e.target.value })} placeholder="ISO 17025, COFRAC…" />
                  </LabField>
                )}
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <LabField label="Prélèvement" error={err('prelevement')}>
                  <Select value={draft.prelevement_par} onChange={(v) => patch({ prelevement_par: v })}>
                    <option value="" className="text-slate-900">Choisir…</option>
                    {PRELEVEMENT_PAR.map((p) => <option key={p.value} value={p.value} className="text-slate-900">{p.label}</option>)}
                  </Select>
                </LabField>
                <div className="grid gap-3 sm:grid-cols-2">
                  <LabField label="Date de prélèvement">
                    <input className={labInputClass()} type="date" value={draft.date_prelevement} onChange={(e) => patch({ date_prelevement: e.target.value })} />
                  </LabField>
                  <LabField label="Lieu">
                    <input className={labInputClass()} value={draft.lieu_prelevement} onChange={(e) => patch({ lieu_prelevement: e.target.value })} />
                  </LabField>
                </div>
                <LabField label="Mode d’envoi">
                  <Select value={draft.mode_envoi} onChange={(v) => patch({ mode_envoi: v })}>
                    <option value="" className="text-slate-900">—</option>
                    {MODES_ENVOI.map((m) => <option key={m.value} value={m.value} className="text-slate-900">{m.label}</option>)}
                  </Select>
                </LabField>
                <label className="flex min-h-11 items-center gap-2 text-sm text-white/80">
                  <input type="checkbox" checked={draft.chaine_froid} onChange={(e) => patch({ chaine_froid: e.target.checked })} />
                  Chaîne du froid requise
                </label>
                <LabField label="Délai">
                  <Select value={draft.urgence} onChange={(v) => patch({ urgence: v })}>
                    {URGENCES.map((u) => <option key={u.value} value={u.value} className="text-slate-900">{u.label}</option>)}
                  </Select>
                </LabField>
                <LabField label="Date souhaitée des résultats">
                  <input className={labInputClass()} type="date" value={draft.date_souhaitee} onChange={(e) => patch({ date_souhaitee: e.target.value })} />
                </LabField>
                <LabField label="Commentaires logistique">
                  <textarea className={`${labInputClass()} h-20 py-3`} value={draft.commentaires_logistique} onChange={(e) => patch({ commentaires_logistique: e.target.value })} />
                </LabField>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-4">
                <p className="text-sm text-white/70">Cochez les documents joints. L’envoi crée le dossier et notifie le laboratoire.</p>
                <div className="space-y-2">
                  {DOCUMENT_TYPES.map((d) => (
                    <label key={d.value} className="flex min-h-11 items-center gap-2 text-sm text-white/80">
                      <input
                        type="checkbox"
                        checked={draft.document_types.includes(d.value)}
                        onChange={(e) => {
                          const next = e.target.checked
                            ? [...draft.document_types, d.value]
                            : draft.document_types.filter((x) => x !== d.value);
                          patch({ document_types: next });
                        }}
                      />
                      {d.label}
                    </label>
                  ))}
                </div>
                <LabField label="Notes / pièces">
                  <textarea className={`${labInputClass()} h-20 py-3`} value={draft.notes_documents} onChange={(e) => patch({ notes_documents: e.target.value })} />
                </LabField>
                <LabField label="Fichiers (PDF, image, xlsx)">
                  <input
                    className="block w-full text-sm text-white/80"
                    type="file"
                    multiple
                    onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
                  />
                </LabField>
                <dl className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/85">
                  <div><dt className="text-[11px] uppercase tracking-[0.16em] text-cyan-300">Client</dt><dd>{draft.societe || `${draft.prenom} ${draft.nom}`} · {draft.email}</dd></div>
                  <div><dt className="text-[11px] uppercase tracking-[0.16em] text-cyan-300">Échantillon</dt><dd>{draft.produit_exact || draft.nom_commercial} · {draft.nombre_echantillons} échantillon(s)</dd></div>
                  <div><dt className="text-[11px] uppercase tracking-[0.16em] text-cyan-300">Analyses</dt><dd>{draft.analyses_inconnues ? 'À qualifier par le laboratoire' : draft.analyses_souhaitees || '—'}</dd></div>
                </dl>
                {allGaps.length > 0 && (
                  <div className="rounded-xl border border-amber-300/30 bg-amber-400/10 p-3 text-sm text-amber-100">
                    <p className="font-semibold">Informations manquantes</p>
                    <ul className="mt-1 list-disc pl-4">
                      {allGaps.map((g) => (
                        <li key={g.code}>{g.label}{g.severity === 'before_quote' ? ' (avant devis / facture)' : ''}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {attempted && blocking.length > 0 && step < 5 && (
              <ul className="space-y-1 text-sm text-rose-200">
                {blocking.map((g) => <li key={g.code}>{g.label}</li>)}
              </ul>
            )}
            {error && <p className="text-sm text-rose-300">{error}</p>}

            <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-2">
                {step > 1 && <LabBtn tone="ghost" onClick={() => { setAttempted(false); setStep(step - 1); }}>Retour</LabBtn>}
                <LabBtn tone="cyan" onClick={() => void persistDraft()}>{draftSaved ? 'Brouillon enregistré' : 'Enregistrer le brouillon'}</LabBtn>
              </div>
              {step < 5 ? (
                <LabBtn type="submit" disabled={!nextOk}>Continuer</LabBtn>
              ) : (
                <LabBtn type="submit" disabled={busy || allGaps.some((g) => g.severity === 'blocking')}>
                  {busy ? 'Envoi…' : 'Envoyer la demande'}
                </LabBtn>
              )}
            </div>
          </form>

          <aside className="lab-glass space-y-3 rounded-3xl p-5 sm:p-6">
            <button type="button" className="text-left" onClick={() => setShowEmail((v) => !v)}>
              <p className="text-[10px] uppercase tracking-[0.22em] text-amber-200">Canal de secours</p>
              <h2 className="lab-display text-2xl text-white">Coller un e-mail libre</h2>
            </button>
            {(showEmail || step === 1) && (
              <>
                <p className="text-xs text-white/55">Aide rules-v1 — pré-remplit, signale les manquants. Jamais un traitement aval sur le brut. Pas de GPT.</p>
                <textarea className={`${labInputClass()} h-36 py-3`} value={rawEmail} onChange={(e) => setRawEmail(e.target.value)} placeholder="Coller le message du client…" />
                <LabBtn
                  tone="cyan"
                  onClick={() => {
                    const extracted = extractRequestFromEmail(rawEmail);
                    setDraft((d) => applyExtracted(d, extracted));
                    setExtractNote(
                      extracted.missing.length
                        ? `Prérempli (rules-v1). Manquant : ${extracted.missing.join(', ')}.`
                        : 'Prérempli (rules-v1). Aucun champ clé manquant.',
                    );
                  }}
                >
                  Extraire vers le formulaire
                </LabBtn>
                {extractNote && <p className="text-xs text-amber-200">{extractNote}</p>}
              </>
            )}
          </aside>
        </div>
      </div>
    </LabPublicFrame>
  );
}
