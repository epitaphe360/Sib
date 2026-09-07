/** DEV-only Elitech seed catalog. Passwords live in docs/LAB_SEED.md, never here. */

export const LAB_SEED_ORG_SLUG = 'elitech';

export const LAB_SEED_ACCOUNTS = [
  { email: 'admin@elitech.dev', role: 'SUPER_ADMIN' as const, fullName: 'Admin Elitech', kind: 'admin' as const },
  { email: 'zineb@elitech.dev', role: 'RESPONSABLE_VALIDATION' as const, fullName: 'Madame Zineb', kind: 'zineb' as const },
  { email: 'tech@elitech.dev', role: 'RESPONSABLE_TECHNIQUE' as const, fullName: 'Responsable technique', kind: 'tech' as const },
  { email: 'client@elitech.dev', role: 'CLIENT' as const, fullName: 'Client Atlas Oils', kind: 'client' as const },
] as const;

export const LAB_SEED_DOSSIERS = [
  { dossier: 'DEM-SEED-01', status: 'NEW_REQUEST', kind: 'PHYSICO_CHIMIQUE', company: 'Atlas Oils' },
  { dossier: 'DEM-SEED-02', status: 'QUALIFICATION', kind: 'MICROBIOLOGIQUE', company: 'Oasis Food' },
  { dossier: 'DEM-SEED-03', status: 'WAITING_SUPPLIER_QUOTES', kind: 'PHYSICO_CHIMIQUE', company: 'Coopérative Souss' },
  { dossier: 'DEM-SEED-04', status: 'CLIENT_QUOTE_DRAFT', kind: 'PHYSICO_CHIMIQUE', company: 'Atlas Oils' },
  { dossier: 'DEM-SEED-05', status: 'CLIENT_QUOTE_SENT', kind: 'MICROBIOLOGIQUE', company: 'Oasis Food' },
  { dossier: 'DEM-SEED-06', status: 'WAITING_SAMPLES', kind: 'PHYSICO_CHIMIQUE', company: 'Coopérative Souss' },
  { dossier: 'DEM-SEED-07', status: 'SAMPLES_CODED', kind: 'PHYSICO_CHIMIQUE', company: 'Atlas Oils' },
  { dossier: 'DEM-SEED-08', status: 'ANALYSIS_IN_PROGRESS', kind: 'MICROBIOLOGIQUE', company: 'Oasis Food' },
  { dossier: 'DEM-SEED-09', status: 'FINAL_REVIEW', kind: 'PHYSICO_CHIMIQUE', company: 'Coopérative Souss' },
  { dossier: 'DEM-SEED-10', status: 'REPORT_SENT', kind: 'PHYSICO_CHIMIQUE', company: 'Atlas Oils' },
  { dossier: 'DEM-SEED-11', status: 'INVOICED', kind: 'MICROBIOLOGIQUE', company: 'Oasis Food' },
  { dossier: 'DEM-SEED-12', status: 'CLOSED', kind: 'MIXTE', company: 'Coopérative Souss' },
] as const;

export const LAB_SEED_SAMPLE_CODES = [
  'ECH-000901-2026-HUILE-D-ARGAN',
  'ECH-000902-2026-LAIT',
  'ECH-000903-2026-JUS-ORANGE',
  'ECH-000904-2026-THON',
  'ECH-000905-2026-SAFRAN',
  'ECH-000906-2026-AMLOU',
] as const;

export function seedAccountEmails(): string[] {
  return LAB_SEED_ACCOUNTS.map((a) => a.email);
}

export function expectedSeedRequestCount(): number {
  return LAB_SEED_DOSSIERS.length;
}
