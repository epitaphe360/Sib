# Database — schéma `lab`

Toutes les tables : `id uuid`, `created_at`, `updated_at`, `organization_id` (sauf `profiles` / `organizations`), `deleted_at` si soft-delete.

## Enums

- `lab.member_role` — SUPER_ADMIN, DIRECTION, RESPONSABLE_VALIDATION, RESPONSABLE_TECHNIQUE, ASSISTANTE, TECHNICIEN, FINANCE, UTILISATEUR_STANDARD, CLIENT
- `lab.dossier_status` — machine à états (voir `src/features/lab/lib/status.ts`)
- `lab.analysis_kind` — PHYSICO_CHIMIQUE, MICROBIOLOGIQUE, MIXTE
- `lab.task_status` — NOUVELLE, EN_COURS, EN_ATTENTE, A_VALIDER, TERMINEE
- `lab.invoice_status` — EN_ATTENTE, PARTIELLEMENT_PAYEE, PAYEE, IMPAYEE
- `lab.email_classification` — PURCHASE_ORDER, QUOTE_REPLY, REPORT, OTHER

## Tables checkpoint 1

`organizations` · `profiles` · `organization_members` · `clients` · `client_contacts` · `client_requests` · `request_items` · `analyses` · `suppliers` · `supplier_capabilities` · `supplier_prices` · `supplier_consultations` · `supplier_consultation_items` · `supplier_responses` · `supplier_selection` · `pricing_rules` · `quotes` · `quote_items` · `purchase_orders` · `samples` · `sample_events` · `analysis_results` · `result_reviews` · `report_templates` · `reports` · `tasks` · `client_invoices` · `client_payments` · `supplier_invoices` · `supplier_payments` · `notifications` · `email_messages` · `processed_emails` · `files` · `audit_logs` · `settings`

## Helpers RLS

- `lab.user_org_ids()` — orgs du `auth.uid()`
- `lab.is_super_admin()`
- `lab.has_lab_role(org_id, roles[])`
- `lab.submit_public_request(...)` — insert anon validé
- `lab.set_updated_at()`

## Storage (privé)

`lab-client-documents` · `lab-supplier-documents` · `lab-purchase-orders` · `lab-samples` · `lab-results` · `lab-reports` · `lab-invoices`

Accès : signed URLs uniquement (policies storage org-scoped, phase suivante).

## Indexes

`(organization_id)` sur chaque table métier · uniques métier (`quotes.quote_number`, `samples.code`, `processed_emails.message_id`).
