import type { ExtractedRequest } from './extractRequest';
import {
  CLIENT_TYPES,
  QUALIFICATION_STEPS,
  datesAreConditional,
} from './qualificationCatalog';

export const DRAFT_STORAGE_KEY = 'lab-qualification-draft-v1';

export interface QuoteRecipient {
  nom: string;
  fonction: string;
  email: string;
  telephone: string;
}

export interface BillingInfo {
  societe: string;
  adresse: string;
  ice: string;
  email: string;
  contact: string;
}

export interface SampleLine {
  id: string;
  label: string;
  produit_exact: string;
  numero_lot: string;
  quantite: string;
  unite: string;
}

export interface QualificationDraft {
  type_client: string;
  client_existant: boolean;
  client_id: string;
  client_code: string;
  societe: string;
  raison_sociale: string;
  ice: string;
  if_fiscal: string;
  rc: string;
  adresse: string;
  ville: string;
  code_postal: string;
  pays: string;
  civilite: string;
  prenom: string;
  nom: string;
  fonction: string;
  email: string;
  indicatif: string;
  telephone: string;
  telephone_secondaire: string;
  canal_preference: string;
  langue_preference: string;
  autre_destinataire_devis: boolean;
  destinataire_devis: QuoteRecipient;
  facturation_differente: boolean;
  facturation: BillingInfo;
  type_echantillon: string;
  famille_produit: string;
  produit_exact: string;
  nom_commercial: string;
  marque: string;
  reference_produit: string;
  numero_lot: string;
  date_fabrication: string;
  ddm: string;
  dlc: string;
  origine_produit: string;
  pays_origine: string;
  temperature_produit: string;
  etat_physique: string;
  conditionnement: string;
  quantite_par_echantillon: string;
  unite_quantite: string;
  nombre_echantillons: number;
  echantillons_identiques: boolean;
  echantillons: SampleLine[];
  objectif_analytique: string;
  analyses_souhaitees: string;
  analyses_inconnues: boolean;
  conformite_reglementaire: string;
  textes_mentionnes: string;
  accreditation_requise: string;
  organisme_accreditation: string;
  prelevement_par: string;
  date_prelevement: string;
  lieu_prelevement: string;
  mode_envoi: string;
  chaine_froid: boolean;
  urgence: string;
  date_souhaitee: string;
  commentaires_logistique: string;
  document_types: string[];
  notes_documents: string;
  lockedFromClient: Partial<Record<keyof QualificationDraft, string>>;
}

export type GapSeverity = 'blocking' | 'before_quote' | 'optional';

export interface QualificationGap {
  step: number;
  code: string;
  label: string;
  severity: GapSeverity;
}

export function emptyDraft(): QualificationDraft {
  return {
    type_client: 'entreprise',
    client_existant: false,
    client_id: '',
    client_code: '',
    societe: '',
    raison_sociale: '',
    ice: '',
    if_fiscal: '',
    rc: '',
    adresse: '',
    ville: '',
    code_postal: '',
    pays: 'Maroc',
    civilite: 'M',
    prenom: '',
    nom: '',
    fonction: '',
    email: '',
    indicatif: '+212',
    telephone: '',
    telephone_secondaire: '',
    canal_preference: 'email',
    langue_preference: 'fr',
    autre_destinataire_devis: false,
    destinataire_devis: { nom: '', fonction: '', email: '', telephone: '' },
    facturation_differente: false,
    facturation: { societe: '', adresse: '', ice: '', email: '', contact: '' },
    type_echantillon: '',
    famille_produit: '',
    produit_exact: '',
    nom_commercial: '',
    marque: '',
    reference_produit: '',
    numero_lot: '',
    date_fabrication: '',
    ddm: '',
    dlc: '',
    origine_produit: 'maroc',
    pays_origine: '',
    temperature_produit: '',
    etat_physique: '',
    conditionnement: '',
    quantite_par_echantillon: '',
    unite_quantite: 'g',
    nombre_echantillons: 1,
    echantillons_identiques: true,
    echantillons: [],
    objectif_analytique: '',
    analyses_souhaitees: '',
    analyses_inconnues: false,
    conformite_reglementaire: 'inconnu',
    textes_mentionnes: '',
    accreditation_requise: 'inconnu',
    organisme_accreditation: '',
    prelevement_par: '',
    date_prelevement: '',
    lieu_prelevement: '',
    mode_envoi: '',
    chaine_froid: false,
    urgence: 'normal',
    date_souhaitee: '',
    commentaires_logistique: '',
    document_types: [],
    notes_documents: '',
    lockedFromClient: {},
  };
}

export function isParticulier(type: string): boolean {
  return type === 'particulier';
}

export function normalizePhoneDigits(raw: string, indicatif = '+212'): string {
  let digits = raw.replace(/\D/g, '');
  const cc = indicatif.replace(/\D/g, '');
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (digits.startsWith(cc)) digits = digits.slice(cc.length);
  if (digits.startsWith('0')) digits = digits.slice(1);
  return digits;
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function contactName(draft: QualificationDraft): string {
  const full = `${draft.prenom} ${draft.nom}`.trim();
  return full || `${draft.civilite} ${draft.nom}`.trim();
}

export function productLabel(draft: QualificationDraft): string {
  return draft.produit_exact.trim()
    || draft.nom_commercial.trim()
    || draft.famille_produit.trim()
    || draft.type_echantillon.trim();
}

export function wouldOverwriteLocked(
  draft: QualificationDraft,
  field: keyof QualificationDraft,
  next: string,
): boolean {
  const original = draft.lockedFromClient[field];
  if (!original) return false;
  const current = String(draft[field] ?? '');
  return current === original && next !== original;
}

export function applyExistingClient(
  draft: QualificationDraft,
  client: {
    id?: string;
    company_name?: string | null;
    ice?: string | null;
    if_fiscal?: string | null;
    address?: string | null;
    city?: string | null;
    country?: string | null;
    contact_name?: string | null;
    phone?: string | null;
    email?: string | null;
    client_code?: string | null;
  },
): QualificationDraft {
  const next = { ...draft };
  const lock: QualificationDraft['lockedFromClient'] = {};
  const set = (field: keyof QualificationDraft, value?: string | null) => {
    if (!value) return;
    (next as Record<string, unknown>)[field] = value;
    lock[field] = value;
  };
  next.client_id = client.id ?? '';
  next.client_existant = true;
  set('societe', client.company_name);
  set('ice', client.ice);
  set('if_fiscal', client.if_fiscal);
  set('adresse', client.address);
  set('ville', client.city);
  set('pays', client.country || 'Maroc');
  if (client.contact_name) {
    const parts = client.contact_name.trim().split(/\s+/);
    next.prenom = parts[0] ?? '';
    next.nom = parts.slice(1).join(' ');
    lock.prenom = next.prenom;
    lock.nom = next.nom;
  }
  set('telephone', client.phone ? normalizePhoneDigits(client.phone, next.indicatif) : '');
  set('email', client.email);
  set('client_code', client.client_code);
  next.lockedFromClient = lock;
  return next;
}

export function applyExtracted(draft: QualificationDraft, extracted: ExtractedRequest): QualificationDraft {
  const next = { ...draft };
  if (extracted.company_name) next.societe = extracted.company_name;
  if (extracted.contact_name) {
    const parts = extracted.contact_name.trim().split(/\s+/);
    next.prenom = parts[0] ?? next.prenom;
    next.nom = parts.slice(1).join(' ') || next.nom;
  }
  if (extracted.email) next.email = extracted.email;
  if (extracted.country_code) next.indicatif = extracted.country_code;
  if (extracted.phone) next.telephone = normalizePhoneDigits(extracted.phone, next.indicatif);
  if (extracted.product_name) next.produit_exact = extracted.product_name;
  if (extracted.analyses) next.analyses_souhaitees = extracted.analyses;
  if (extracted.sample_count) next.nombre_echantillons = extracted.sample_count;
  return next;
}

export function gapsForStep(draft: QualificationDraft, step: number): QualificationGap[] {
  const gaps: QualificationGap[] = [];
  const push = (code: string, label: string, severity: GapSeverity, at: number) => {
    if (at === step) gaps.push({ step: at, code, label, severity });
  };

  if (step === 1) {
    if (!isParticulier(draft.type_client) && draft.societe.trim().length < 2) {
      push('societe', 'La société est obligatoire (sauf particulier).', 'blocking', 1);
    }
    if (isParticulier(draft.type_client)) {
      if (draft.prenom.trim().length < 2) push('prenom', 'Le prénom est obligatoire pour un particulier.', 'blocking', 1);
      if (draft.nom.trim().length < 2) push('nom', 'Le nom est obligatoire pour un particulier.', 'blocking', 1);
    } else if (`${draft.prenom} ${draft.nom}`.trim().length < 2) {
      push('contact', 'Le contact (prénom et nom) est obligatoire.', 'blocking', 1);
    }
    if (!isValidEmail(draft.email)) push('email', 'Indiquez un e-mail valide.', 'blocking', 1);
    const phone = normalizePhoneDigits(draft.telephone, draft.indicatif);
    if (!/^[0-9]{8,15}$/.test(phone)) push('telephone', 'Téléphone : chiffres uniquement (8 à 15).', 'blocking', 1);
    if (draft.autre_destinataire_devis) {
      if (draft.destinataire_devis.nom.trim().length < 2) {
        push('devis_nom', 'Nom du destinataire du devis requis.', 'blocking', 1);
      }
      if (!isValidEmail(draft.destinataire_devis.email)) {
        push('devis_email', 'E-mail du destinataire du devis invalide.', 'blocking', 1);
      }
    }
    if (!isParticulier(draft.type_client) && !draft.ice.trim()) {
      push('ice', 'ICE à compléter avant facturation.', 'before_quote', 1);
    }
    if (!draft.adresse.trim()) push('adresse', 'Adresse utile avant devis.', 'before_quote', 1);
  }

  if (step === 2) {
    if (!draft.type_echantillon) push('type_echantillon', 'Choisissez le type d’échantillon.', 'blocking', 2);
    if (!Number.isInteger(draft.nombre_echantillons) || draft.nombre_echantillons < 1) {
      push('nombre_echantillons', 'Le nombre d’échantillons doit être un entier > 0.', 'blocking', 2);
    }
    if (productLabel(draft).length < 2) {
      push('produit', 'Précisez le produit exact (ou le nom commercial).', 'blocking', 2);
    }
    if (draft.origine_produit === 'import' && draft.pays_origine.trim().length < 2) {
      push('pays_origine', 'Indiquez le pays d’origine pour un produit importé.', 'blocking', 2);
    }
    if (!draft.echantillons_identiques) {
      if (draft.echantillons.length < 1) {
        push('echantillons', 'Ajoutez au moins un échantillon individuel.', 'blocking', 2);
      } else {
        draft.echantillons.forEach((line, i) => {
          if (line.produit_exact.trim().length < 2) {
            push(`ech_${i}`, `Échantillon ${i + 1} : produit requis.`, 'blocking', 2);
          }
        });
      }
    }
    if (datesAreConditional(draft.type_echantillon) && !draft.dlc && !draft.ddm && !draft.date_fabrication) {
      push('dates', 'Date de fabrication, DDM ou DLC utile pour cette matrice.', 'optional', 2);
    }
  }

  if (step === 3) {
    if (!draft.objectif_analytique) {
      push('objectif', 'Indiquez l’objectif analytique.', 'blocking', 3);
    }
    if (!draft.analyses_inconnues && draft.analyses_souhaitees.trim().length < 2) {
      push('analyses', 'Listez les analyses ou cochez « je ne sais pas ».', 'blocking', 3);
    }
    if (draft.conformite_reglementaire === 'oui' && !draft.textes_mentionnes.trim()) {
      push('textes', 'Norme ou texte cité par le client (jamais inventé).', 'optional', 3);
    }
    if (draft.accreditation_requise === 'inconnu') {
      push('accreditation', 'Accréditation à confirmer par le laboratoire.', 'before_quote', 3);
    }
  }

  if (step === 4) {
    if (!draft.prelevement_par) push('prelevement', 'Qui prélève l’échantillon ?', 'blocking', 4);
    if (!draft.urgence) push('urgence', 'Indiquez le délai souhaité.', 'blocking', 4);
  }

  return gaps;
}

export function identifyMissing(draft: QualificationDraft): QualificationGap[] {
  return [1, 2, 3, 4, 5].flatMap((step) => gapsForStep(draft, step));
}

export function canAdvance(draft: QualificationDraft, step: number): boolean {
  return gapsForStep(draft, step).every((g) => g.severity !== 'blocking');
}

export function stepTitle(step: number): string {
  return QUALIFICATION_STEPS.find((s) => s.n === step)?.title ?? '';
}

export function clientTypeLabel(value: string): string {
  return CLIENT_TYPES.find((t) => t.value === value)?.label ?? value;
}

export function analysesList(draft: QualificationDraft): string[] {
  if (draft.analyses_inconnues) return ['À qualifier par le laboratoire'];
  return draft.analyses_souhaitees.split(/[,;\n]/).map((s) => s.trim()).filter(Boolean);
}

export function toSubmitPayload(draft: QualificationDraft) {
  const phone = normalizePhoneDigits(draft.telephone, draft.indicatif);
  const { lockedFromClient: _lock, ...qualification } = draft;
  return {
    company_name: isParticulier(draft.type_client) ? (contactName(draft) || 'Particulier') : draft.societe.trim(),
    contact_name: contactName(draft),
    email: draft.email.trim().toLowerCase(),
    phone,
    country_code: draft.indicatif,
    product_name: productLabel(draft),
    matrix: draft.type_echantillon || null,
    sample_type: draft.famille_produit || draft.etat_physique || null,
    sample_count: draft.nombre_echantillons,
    urgency: draft.urgence || null,
    deadline: draft.date_souhaitee || null,
    accreditation_required: draft.accreditation_requise === 'oui',
    notes: [
      draft.notes_documents,
      draft.commentaires_logistique,
      draft.analyses_inconnues ? 'Analyses à qualifier (client ne sait pas).' : '',
    ].filter(Boolean).join('\n') || null,
    analyses: analysesList(draft),
    qualification,
  };
}

export function loadDraftFromStorage(): QualificationDraft | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    return { ...emptyDraft(), ...JSON.parse(raw) as Partial<QualificationDraft> };
  } catch {
    return null;
  }
}

export function saveDraftToStorage(draft: QualificationDraft) {
  if (typeof localStorage === 'undefined') return;
  const { lockedFromClient: _lock, ...rest } = draft;
  localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(rest));
}

export function clearDraftStorage() {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(DRAFT_STORAGE_KEY);
}

export function newSampleLine(index: number): SampleLine {
  return {
    id: `s-${index}-${Math.random().toString(36).slice(2, 8)}`,
    label: `Échantillon ${index}`,
    produit_exact: '',
    numero_lot: '',
    quantite: '',
    unite: 'g',
  };
}
