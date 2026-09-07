# Workflows — Elitech Lab

Statuts centralisés : `src/features/lab/lib/status.ts` + enum SQL `lab.dossier_status`.

## Dossier (happy path)

NEW_REQUEST → QUALIFICATION → WAITING_SUPPLIER_QUOTES → SUPPLIER_SELECTED → CLIENT_QUOTE_DRAFT → CLIENT_QUOTE_SENT → WAITING_CLIENT_RESPONSE → PURCHASE_ORDER_RECEIVED → WAITING_SAMPLES → SAMPLES_RECEIVED → SAMPLES_CODED → SENT_TO_SUPPLIER → ANALYSIS_IN_PROGRESS → RESULTS_RECEIVED → AI_REVIEW → TECHNICAL_REVIEW → FINAL_REVIEW → APPROVED → REPORT_GENERATION → REPORT_SENT → INVOICED → CLOSED

Branches : CORRECTION_REQUESTED (depuis TECHNICAL_REVIEW / FINAL_REVIEW).

## Parcours 12 étapes (UI + statuts)

Voir `src/features/lab/lib/journey.ts` et `docs/LAB_AUDIT.md`.

## Checkpoint 1 (implémenté)

1. Client (ou public) soumet une demande (`/lab/request-form`).
2. Admin voit la demande (`/lab/admin/requests`).
3. Qualification : type d’analyse + analyses internes / sous-traitées.
4. Consultation fournisseur (anglais, destinataires choisis).
5. Devis client : prix fournisseur × règle `pricing_rules` (défaut 30 %).

## Règles métier

- Interne = FR · sous-traitants = EN.
- Jamais de choix fournisseur automatique définitif.
- Jamais de changement de prix auto après « trop cher ».
- Analyses ne commencent qu’après échantillons reçus.
- IA = aide, jamais validation technique finale.
- Soft-delete + `audit_logs` sur actions critiques.
