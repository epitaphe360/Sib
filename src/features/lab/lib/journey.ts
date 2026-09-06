import type { DossierStatus } from '../types';

export interface LabJourneyStep {
  n: number;
  title: string;
  summary: string;
  actor: string;
  statuses: DossierStatus[];
}

/** 12 steps of the official infographic — product path, not marketing copy. */
export const LAB_JOURNEY: LabJourneyStep[] = [
  {
    n: 1,
    title: 'Demande client standardisée',
    summary: 'Formulaire structuré. E-mail libre → extraction rules-v1, jamais source opérationnelle.',
    actor: 'Client + aide IA',
    statuses: ['NEW_REQUEST'],
  },
  {
    n: 2,
    title: 'Qualification',
    summary: 'Interne (FR) ou sous-traité (EN). Dossier maître unique, type d’analyse.',
    actor: 'Madame Zineb',
    statuses: ['QUALIFICATION'],
  },
  {
    n: 3,
    title: 'Consultation sous-traitants',
    summary: 'Top 3 / 5, prix · délai · accréditation. Choix humain. Marge cible ~30 %.',
    actor: 'Application + Zineb',
    statuses: ['WAITING_SUPPLIER_QUOTES', 'SUPPLIER_SELECTED'],
  },
  {
    n: 4,
    title: 'Suivi devis + bon de commande',
    summary: 'Envoi après validation Zineb. Relance 3–4 j + sondage. Contrôle BDC. Attente échantillons.',
    actor: 'Application + client',
    statuses: [
      'CLIENT_QUOTE_DRAFT',
      'CLIENT_QUOTE_SENT',
      'WAITING_CLIENT_RESPONSE',
      'PURCHASE_ORDER_RECEIVED',
      'WAITING_SAMPLES',
    ],
  },
  {
    n: 5,
    title: 'Réception et codification',
    summary: 'Confirmation physique. Code ECH-seq-année-produit. Registre Supabase.',
    actor: 'Technicien + Zineb',
    statuses: ['SAMPLES_RECEIVED', 'SAMPLES_CODED'],
  },
  {
    n: 6,
    title: 'Lancement analyses',
    summary: 'Dossier envoyé au sous-traitant. Échéance contractuelle. Pénalité paramétrable.',
    actor: 'Sous-traitant',
    statuses: ['SENT_TO_SUPPLIER', 'ANALYSIS_IN_PROGRESS'],
  },
  {
    n: 7,
    title: 'Résultats + triple contrôle',
    summary: 'Aide IA → responsable technique → Madame Zineb. Refus = correction 6 h + pénalités.',
    actor: 'IA + RT + Zineb',
    statuses: ['RESULTS_RECEIVED', 'AI_REVIEW', 'TECHNICAL_REVIEW', 'FINAL_REVIEW', 'CORRECTION_REQUESTED'],
  },
  {
    n: 8,
    title: 'Rapport final',
    summary: 'Gabarit physico-chimique ou microbiologique. PDF versionné, envoi client.',
    actor: 'Application',
    statuses: ['APPROVED', 'REPORT_GENERATION', 'REPORT_SENT'],
  },
  {
    n: 9,
    title: 'Portail client sécurisé',
    summary: 'E-mail + OTP 10 min. Devis, rapports, suivi. Accès 1 an.',
    actor: 'Client',
    statuses: [],
  },
  {
    n: 10,
    title: 'Dashboard administrateur',
    summary: 'KPI, avancement, tâches à faire / en attente / en retard / à valider.',
    actor: 'Direction',
    statuses: [],
  },
  {
    n: 11,
    title: 'Facturation et règlements',
    summary: 'Factures clients et fournisseurs. Payé / en attente / retard. Marge suivie.',
    actor: 'Finance',
    statuses: ['INVOICED'],
  },
  {
    n: 12,
    title: 'Archivage et sécurité',
    summary: 'Audit, backup hebdo Drive (si jeton), restauration testée. Vercel + Supabase + Resend.',
    actor: 'Système',
    statuses: ['CLOSED'],
  },
];

export function journeyStepForStatus(status: DossierStatus | string | null | undefined): number {
  if (!status) return 1;
  const hit = LAB_JOURNEY.find((step) => step.statuses.includes(status as DossierStatus));
  return hit?.n ?? 1;
}

export function journeyState(step: number, current: number): 'done' | 'current' | 'upcoming' {
  if (step < current) return 'done';
  if (step === current) return 'current';
  return 'upcoming';
}

export function countByJourney(statusCounts: Record<string, number>): Record<number, number> {
  const out: Record<number, number> = {};
  for (const step of LAB_JOURNEY) {
    out[step.n] = step.statuses.reduce((sum, s) => sum + (statusCounts[s] ?? 0), 0);
  }
  return out;
}
