import { describe, expect, it } from 'vitest';
import { familiesForType, searchProducts, seedCatalogRows } from '@/features/lab/lib/qualificationCatalog';
import {
  applyExistingClient,
  applyExtracted,
  canAdvance,
  emptyDraft,
  identifyMissing,
  isParticulier,
  normalizePhoneDigits,
  toSubmitPayload,
  wouldOverwriteLocked,
} from '@/features/lab/lib/qualificationDraft';
import { extractRequestFromEmail } from '@/features/lab/lib/extractRequest';

function filledClient(overrides: Partial<ReturnType<typeof emptyDraft>> = {}) {
  return {
    ...emptyDraft(),
    societe: 'Atlas Oils',
    prenom: 'Sara',
    nom: 'Benali',
    email: 'sara@atlas.ma',
    telephone: '661234567',
    type_echantillon: 'alimentaire',
    famille_produit: 'Huiles',
    produit_exact: 'huile d’olive',
    nombre_echantillons: 2,
    objectif_analytique: 'controle_qualite',
    analyses_souhaitees: 'pH, acidité',
    prelevement_par: 'client',
    urgence: 'normal',
    ...overrides,
  };
}

describe('lab qualification document 27', () => {
  it('does not require company for a particulier but requires first and last name', () => {
    expect(isParticulier('particulier')).toBe(true);
    const draft = filledClient({ type_client: 'particulier', societe: '', prenom: 'A', nom: '' });
    const gaps = identifyMissing(draft);
    expect(gaps.some((g) => g.code === 'societe' && g.severity === 'blocking')).toBe(false);
    expect(gaps.some((g) => g.code === 'prenom' && g.severity === 'blocking')).toBe(true);
    expect(gaps.some((g) => g.code === 'nom' && g.severity === 'blocking')).toBe(true);
  });

  it('never blocks the request for a missing ICE', () => {
    const draft = filledClient({ ice: '' });
    expect(canAdvance(draft, 1)).toBe(true);
    expect(identifyMissing(draft).some((g) => g.code === 'ice' && g.severity === 'before_quote')).toBe(true);
    expect(identifyMissing(draft).some((g) => g.code === 'ice' && g.severity === 'blocking')).toBe(false);
  });

  it('requires sample type, product and integer count > 0', () => {
    const emptySample = filledClient({ type_echantillon: '', produit_exact: '', nom_commercial: '', famille_produit: '', nombre_echantillons: 0 });
    expect(canAdvance(emptySample, 2)).toBe(false);
    expect(canAdvance(filledClient(), 2)).toBe(true);
  });

  it('requires individual samples when they are not identical', () => {
    const draft = filledClient({ echantillons_identiques: false, echantillons: [] });
    expect(canAdvance(draft, 2)).toBe(false);
    const withLine = filledClient({
      echantillons_identiques: false,
      echantillons: [{ id: '1', label: 'Échantillon 1', produit_exact: 'beurre', numero_lot: 'L1', quantite: '100', unite: 'g' }],
    });
    expect(canAdvance(withLine, 2)).toBe(true);
  });

  it('requires origin country for imported products', () => {
    const draft = filledClient({ origine_produit: 'import', pays_origine: '' });
    expect(canAdvance(draft, 2)).toBe(false);
  });

  it('allows unknown analyses instead of inventing them', () => {
    const draft = filledClient({ analyses_souhaitees: '', analyses_inconnues: true, objectif_analytique: 'controle_qualite' });
    expect(canAdvance(draft, 3)).toBe(true);
    expect(toSubmitPayload(draft).analyses).toEqual(['À qualifier par le laboratoire']);
  });

  it('normalizes phone digits and maps payload for the dossier', () => {
    expect(normalizePhoneDigits('06 12 34 56 78', '+212')).toBe('612345678');
    const payload = toSubmitPayload(filledClient({ ice: '' }));
    expect(payload.company_name).toBe('Atlas Oils');
    expect(payload.phone).toBe('661234567');
    expect(payload.accreditation_required).toBe(false);
    expect(payload.qualification.ice).toBe('');
  });

  it('warns before overwriting a locked client field', () => {
    const locked = applyExistingClient(emptyDraft(), { company_name: 'Atlas Oils', email: 'sara@atlas.ma', ice: '001' });
    expect(wouldOverwriteLocked(locked, 'societe', 'Autre')).toBe(true);
    expect(wouldOverwriteLocked(locked, 'societe', 'Atlas Oils')).toBe(false);
  });

  it('feeds food families and searchable products from the catalog seed', () => {
    expect(familiesForType('alimentaire')).toContain('Produits laitiers');
    const hits = searchProducts(seedCatalogRows().products, 'beur', 'alimentaire', 'Produits laitiers');
    expect(hits.some((p) => p.name === 'beurre')).toBe(true);
  });

  it('extracts e-mail with rules-v1 and never invents analyses', () => {
    const extracted = extractRequestFromEmail('Bonjour, merci de me rappeler.');
    expect(extracted.source).toBe('rules-v1');
    expect(extracted.analyses).toBeUndefined();
    expect(extracted.missing).toContain('analyses');
    const next = applyExtracted(emptyDraft(), extracted);
    expect(next.analyses_souhaitees).toBe('');
  });
});
