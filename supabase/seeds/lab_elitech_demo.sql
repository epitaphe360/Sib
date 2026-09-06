-- Elitech Lab DEV demo — org data only (no passwords).
-- Idempotent. Tagged DEM-SEED- / DEV-SEED- / FAC-SEED- / [LAB_SEED].
-- Apply after schema lab + migration 20260906000007. See docs/LAB_SEED.md.

INSERT INTO lab.organizations (name, slug, email, city, country)
VALUES ('Elitech Holding', 'elitech', 'zineb@laboratoire.ma', 'Casablanca', 'MA')
ON CONFLICT (slug) DO NOTHING;

DO $$
DECLARE
  org uuid;
BEGIN
  SELECT id INTO org FROM lab.organizations WHERE slug = 'elitech' AND deleted_at IS NULL;
  IF org IS NULL THEN
    RAISE EXCEPTION 'org elitech missing';
  END IF;

  DELETE FROM lab.client_payments
  WHERE invoice_id IN (SELECT id FROM lab.client_invoices WHERE organization_id = org AND invoice_number LIKE 'FAC-SEED-%');
  DELETE FROM lab.supplier_payments
  WHERE invoice_id IN (SELECT id FROM lab.supplier_invoices WHERE organization_id = org AND invoice_number LIKE 'FF-SEED-%');
  DELETE FROM lab.quote_survey_responses
  WHERE quote_id IN (SELECT id FROM lab.quotes WHERE organization_id = org AND quote_number LIKE 'DEV-SEED-%');
  DELETE FROM lab.result_reviews
  WHERE result_id IN (
    SELECT id FROM lab.analysis_results WHERE organization_id = org
      AND request_id IN (SELECT id FROM lab.client_requests WHERE organization_id = org AND dossier_number LIKE 'DEM-SEED-%')
  );
  DELETE FROM lab.result_versions
  WHERE result_id IN (
    SELECT id FROM lab.analysis_results WHERE organization_id = org
      AND request_id IN (SELECT id FROM lab.client_requests WHERE organization_id = org AND dossier_number LIKE 'DEM-SEED-%')
  );
  DELETE FROM lab.analysis_results
  WHERE organization_id = org
    AND request_id IN (SELECT id FROM lab.client_requests WHERE organization_id = org AND dossier_number LIKE 'DEM-SEED-%');
  DELETE FROM lab.sample_events
  WHERE sample_id IN (SELECT id FROM lab.samples WHERE organization_id = org AND code LIKE 'ECH-00090%');
  DELETE FROM lab.analysis_orders
  WHERE organization_id = org
    AND request_id IN (SELECT id FROM lab.client_requests WHERE organization_id = org AND dossier_number LIKE 'DEM-SEED-%');
  DELETE FROM lab.supplier_deadlines
  WHERE organization_id = org
    AND request_id IN (SELECT id FROM lab.client_requests WHERE organization_id = org AND dossier_number LIKE 'DEM-SEED-%');
  DELETE FROM lab.samples WHERE organization_id = org AND code LIKE 'ECH-00090%';
  DELETE FROM lab.purchase_orders
  WHERE organization_id = org AND (reference LIKE 'BDC-SEED-%'
    OR request_id IN (SELECT id FROM lab.client_requests WHERE organization_id = org AND dossier_number LIKE 'DEM-SEED-%'));
  DELETE FROM lab.quote_items
  WHERE quote_id IN (SELECT id FROM lab.quotes WHERE organization_id = org AND quote_number LIKE 'DEV-SEED-%');
  DELETE FROM lab.quotes WHERE organization_id = org AND quote_number LIKE 'DEV-SEED-%';
  DELETE FROM lab.supplier_responses
  WHERE consultation_item_id IN (
    SELECT i.id FROM lab.supplier_consultation_items i
    JOIN lab.supplier_consultations c ON c.id = i.consultation_id
    JOIN lab.client_requests r ON r.id = c.request_id
    WHERE r.dossier_number LIKE 'DEM-SEED-%'
  );
  DELETE FROM lab.supplier_consultation_items
  WHERE consultation_id IN (
    SELECT c.id FROM lab.supplier_consultations c
    JOIN lab.client_requests r ON r.id = c.request_id
    WHERE r.dossier_number LIKE 'DEM-SEED-%'
  );
  DELETE FROM lab.supplier_selection
  WHERE request_id IN (SELECT id FROM lab.client_requests WHERE organization_id = org AND dossier_number LIKE 'DEM-SEED-%');
  DELETE FROM lab.supplier_consultations
  WHERE request_id IN (SELECT id FROM lab.client_requests WHERE organization_id = org AND dossier_number LIKE 'DEM-SEED-%');
  DELETE FROM lab.request_items
  WHERE request_id IN (SELECT id FROM lab.client_requests WHERE organization_id = org AND dossier_number LIKE 'DEM-SEED-%');
  DELETE FROM lab.reports
  WHERE request_id IN (SELECT id FROM lab.client_requests WHERE organization_id = org AND dossier_number LIKE 'DEM-SEED-%');
  DELETE FROM lab.client_invoices WHERE organization_id = org AND invoice_number LIKE 'FAC-SEED-%';
  DELETE FROM lab.supplier_invoices WHERE organization_id = org AND invoice_number LIKE 'FF-SEED-%';
  DELETE FROM lab.tasks WHERE organization_id = org AND title LIKE '[LAB_SEED]%';
  DELETE FROM lab.email_messages WHERE organization_id = org AND subject LIKE '[LAB_SEED]%';
  DELETE FROM lab.notifications WHERE organization_id = org AND title LIKE '[LAB_SEED]%';
  DELETE FROM lab.audit_logs WHERE organization_id = org AND action LIKE 'seed.%';
  IF to_regclass('lab.client_calls') IS NOT NULL THEN
    DELETE FROM lab.client_calls WHERE organization_id = org AND subject LIKE '[LAB_SEED]%';
  END IF;
  DELETE FROM lab.client_requests WHERE organization_id = org AND dossier_number LIKE 'DEM-SEED-%';
END $$;

INSERT INTO lab.pricing_rules (organization_id, name, margin_percent, is_active)
SELECT id, 'default', 30, true FROM lab.organizations WHERE slug = 'elitech'
AND NOT EXISTS (
  SELECT 1 FROM lab.pricing_rules pr
  WHERE pr.organization_id = lab.organizations.id AND pr.name = 'default' AND pr.deleted_at IS NULL
);

INSERT INTO lab.settings (organization_id)
SELECT id FROM lab.organizations WHERE slug = 'elitech'
ON CONFLICT (organization_id) DO NOTHING;

INSERT INTO lab.clients (id, organization_id, company_name, email, phone, city, country, notes)
SELECT 'a0c1e001-0001-4000-8000-000000000001', id, 'Atlas Oils', 'qualite@atlas-oils.ma', '522000001', 'Casablanca', 'MA', '[LAB_SEED]'
FROM lab.organizations WHERE slug = 'elitech'
ON CONFLICT (id) DO UPDATE SET company_name = EXCLUDED.company_name, notes = EXCLUDED.notes;

INSERT INTO lab.clients (id, organization_id, company_name, email, phone, city, country, notes)
SELECT 'a0c1e001-0001-4000-8000-000000000002', id, 'Oasis Food', 'labo@oasis-food.ma', '522000002', 'Marrakech', 'MA', '[LAB_SEED]'
FROM lab.organizations WHERE slug = 'elitech'
ON CONFLICT (id) DO UPDATE SET company_name = EXCLUDED.company_name;

INSERT INTO lab.clients (id, organization_id, company_name, email, phone, city, country, notes)
SELECT 'a0c1e001-0001-4000-8000-000000000003', id, 'Coopérative Souss', 'contact@coop-souss.ma', '528000003', 'Agadir', 'MA', '[LAB_SEED]'
FROM lab.organizations WHERE slug = 'elitech'
ON CONFLICT (id) DO UPDATE SET company_name = EXCLUDED.company_name;

INSERT INTO lab.analyses (id, organization_id, code, name, kind, is_internal)
SELECT v.id, o.id, v.code, v.name, v.kind::lab.analysis_kind, v.internal
FROM lab.organizations o
JOIN (VALUES
  ('a0a10001-0002-4000-8000-000000000001'::uuid, 'PH', 'pH', 'PHYSICO_CHIMIQUE', true),
  ('a0a10001-0002-4000-8000-000000000002'::uuid, 'HUM', 'Humidité', 'PHYSICO_CHIMIQUE', true),
  ('a0a10001-0002-4000-8000-000000000003'::uuid, 'MICRO', 'Microbiologie alimentaire', 'MICROBIOLOGIQUE', false),
  ('a0a10001-0002-4000-8000-000000000004'::uuid, 'METAUX', 'Métaux lourds', 'PHYSICO_CHIMIQUE', false),
  ('a0a10001-0002-4000-8000-000000000005'::uuid, 'PESTI', 'Pesticides', 'PHYSICO_CHIMIQUE', false)
) AS v(id, code, name, kind, internal) ON true
WHERE o.slug = 'elitech'
ON CONFLICT (organization_id, code) DO UPDATE SET name = EXCLUDED.name, kind = EXCLUDED.kind;

INSERT INTO lab.suppliers (id, organization_id, name, city, country, email, contact_name, specialties, accreditations, quality_score, delay_score, price_score, is_active)
SELECT v.id, o.id, v.name, v.city, v.country, v.email, v.contact, v.spec, v.accr, v.q, v.d, v.p, true
FROM lab.organizations o
JOIN (VALUES
  ('a0510001-0003-4000-8000-000000000001'::uuid, 'EuroLab', 'Lyon', 'FR', 'rfq@eurolab.example', 'Claire Dupont', ARRAY['physico','metals'], ARRAY['ISO 17025'], 4.6, 4.2, 3.8),
  ('a0510001-0003-4000-8000-000000000002'::uuid, 'Maghreb Analyse', 'Casablanca', 'MA', 'quotes@maghreb-analyse.example', 'Karim Benali', ARRAY['micro','physico'], ARRAY['ISO 17025'], 4.4, 4.5, 4.4),
  ('a0510001-0003-4000-8000-000000000003'::uuid, 'Iberia Test', 'Madrid', 'ES', 'offers@iberiatest.example', 'Elena Ruiz', ARRAY['pesticides','metals'], ARRAY['ISO 17025'], 4.1, 3.9, 4.0)
) AS v(id, name, city, country, email, contact, spec, accr, q, d, p) ON true
WHERE o.slug = 'elitech'
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, is_active = true;

INSERT INTO lab.client_requests (
  id, organization_id, dossier_number, client_id, company_name, contact_name, email, phone,
  product_name, matrix, sample_count, accreditation_required, notes, analysis_kind, status, created_at
)
SELECT v.id, o.id, v.dossier, v.client, v.company, v.contact, v.email, v.phone,
  v.product, v.matrix, v.samples, v.accr, v.notes, v.kind::lab.analysis_kind, v.status::lab.dossier_status,
  now() - (v.days || ' days')::interval
FROM lab.organizations o
JOIN (VALUES
  ('a0d00001-0010-4000-8000-000000000001'::uuid, 'DEM-SEED-01', 'a0c1e001-0001-4000-8000-000000000001'::uuid, 'Atlas Oils', 'Sara Benali', 'sara@atlas-oils.ma', '661000001', 'Huile d’olive', 'huile', 2, false, '[LAB_SEED] formulaire public', 'PHYSICO_CHIMIQUE', 'NEW_REQUEST', 1),
  ('a0d00001-0010-4000-8000-000000000002'::uuid, 'DEM-SEED-02', 'a0c1e001-0001-4000-8000-000000000002'::uuid, 'Oasis Food', 'Noura Kadiri', 'noura@oasis-food.ma', '661000002', 'Eau minérale', 'eau', 3, true, '[LAB_SEED] qualification Zineb', 'MICROBIOLOGIQUE', 'QUALIFICATION', 3),
  ('a0d00001-0010-4000-8000-000000000003'::uuid, 'DEM-SEED-03', 'a0c1e001-0001-4000-8000-000000000003'::uuid, 'Coopérative Souss', 'Hassan Idrissi', 'hassan@coop-souss.ma', '661000003', 'Conserves de tomates', 'conserves', 4, true, '[LAB_SEED] consultation Top 3 EN', 'PHYSICO_CHIMIQUE', 'WAITING_SUPPLIER_QUOTES', 6),
  ('a0d00001-0010-4000-8000-000000000004'::uuid, 'DEM-SEED-04', 'a0c1e001-0001-4000-8000-000000000001'::uuid, 'Atlas Oils', 'Sara Benali', 'sara@atlas-oils.ma', '661000001', 'Farine de blé', 'farine', 2, false, '[LAB_SEED] interne FR, devis brouillon', 'PHYSICO_CHIMIQUE', 'CLIENT_QUOTE_DRAFT', 8),
  ('a0d00001-0010-4000-8000-000000000005'::uuid, 'DEM-SEED-05', 'a0c1e001-0001-4000-8000-000000000002'::uuid, 'Oasis Food', 'Noura Kadiri', 'noura@oasis-food.ma', '661000002', 'Miel toutes fleurs', 'miel', 2, false, '[LAB_SEED] devis envoyé, relance due', 'MICROBIOLOGIQUE', 'CLIENT_QUOTE_SENT', 12),
  ('a0d00001-0010-4000-8000-000000000006'::uuid, 'DEM-SEED-06', 'a0c1e001-0001-4000-8000-000000000003'::uuid, 'Coopérative Souss', 'Hassan Idrissi', 'hassan@coop-souss.ma', '661000003', 'Dattes Medjool', 'dattes', 5, true, '[LAB_SEED] BDC accepté, attente échantillons', 'PHYSICO_CHIMIQUE', 'WAITING_SAMPLES', 15),
  ('a0d00001-0010-4000-8000-000000000007'::uuid, 'DEM-SEED-07', 'a0c1e001-0001-4000-8000-000000000001'::uuid, 'Atlas Oils', 'Sara Benali', 'sara@atlas-oils.ma', '661000001', 'Huile d’argan', 'huile', 2, true, '[LAB_SEED] ECH-000901-2026-HUILE-D-ARGAN', 'PHYSICO_CHIMIQUE', 'SAMPLES_CODED', 18),
  ('a0d00001-0010-4000-8000-000000000008'::uuid, 'DEM-SEED-08', 'a0c1e001-0001-4000-8000-000000000002'::uuid, 'Oasis Food', 'Noura Kadiri', 'noura@oasis-food.ma', '661000002', 'Lait UHT', 'lait', 3, true, '[LAB_SEED] analyse en cours, délai dépassé', 'MICROBIOLOGIQUE', 'ANALYSIS_IN_PROGRESS', 22),
  ('a0d00001-0010-4000-8000-000000000009'::uuid, 'DEM-SEED-09', 'a0c1e001-0001-4000-8000-000000000003'::uuid, 'Coopérative Souss', 'Hassan Idrissi', 'hassan@coop-souss.ma', '661000003', 'Jus d’orange', 'jus', 2, false, '[LAB_SEED] triple contrôle, attente Zineb', 'PHYSICO_CHIMIQUE', 'FINAL_REVIEW', 25),
  ('a0d00001-0010-4000-8000-00000000000a'::uuid, 'DEM-SEED-10', 'a0c1e001-0001-4000-8000-000000000001'::uuid, 'Atlas Oils', 'Sara Benali', 'sara@atlas-oils.ma', '661000001', 'Thon à l’huile', 'conserve', 2, true, '[LAB_SEED] rapport envoyé', 'PHYSICO_CHIMIQUE', 'REPORT_SENT', 32),
  ('a0d00001-0010-4000-8000-00000000000b'::uuid, 'DEM-SEED-11', 'a0c1e001-0001-4000-8000-000000000002'::uuid, 'Oasis Food', 'Noura Kadiri', 'noura@oasis-food.ma', '661000002', 'Safran', 'épice', 1, true, '[LAB_SEED] facture partielle', 'MICROBIOLOGIQUE', 'INVOICED', 40),
  ('a0d00001-0010-4000-8000-00000000000c'::uuid, 'DEM-SEED-12', 'a0c1e001-0001-4000-8000-000000000003'::uuid, 'Coopérative Souss', 'Hassan Idrissi', 'hassan@coop-souss.ma', '661000003', 'Amlou', 'pâte', 2, false, '[LAB_SEED] clos + payé', 'MIXTE', 'CLOSED', 50)
) AS v(id, dossier, client, company, contact, email, phone, product, matrix, samples, accr, notes, kind, status, days) ON true
WHERE o.slug = 'elitech'
ON CONFLICT (organization_id, dossier_number) DO UPDATE
  SET status = EXCLUDED.status, notes = EXCLUDED.notes, analysis_kind = EXCLUDED.analysis_kind;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'lab' AND table_name = 'client_requests' AND column_name = 'execution_channel'
  ) THEN
    UPDATE lab.client_requests SET execution_channel = CASE dossier_number
      WHEN 'DEM-SEED-04' THEN 'INTERNAL'
      ELSE 'SUBCONTRACTED'
    END, origin = 'FORM'
    WHERE dossier_number LIKE 'DEM-SEED-%';
  END IF;
END $$;

INSERT INTO lab.request_items (id, organization_id, request_id, analysis_id, analysis_name, is_internal)
SELECT v.id, o.id, v.req, v.ana, v.name, v.internal
FROM lab.organizations o
JOIN (VALUES
  ('a0110001-0011-4000-8000-000000000001'::uuid, 'a0d00001-0010-4000-8000-000000000001'::uuid, 'a0a10001-0002-4000-8000-000000000001'::uuid, 'pH', true),
  ('a0110001-0011-4000-8000-000000000002'::uuid, 'a0d00001-0010-4000-8000-000000000003'::uuid, 'a0a10001-0002-4000-8000-000000000004'::uuid, 'Métaux lourds', false),
  ('a0110001-0011-4000-8000-000000000003'::uuid, 'a0d00001-0010-4000-8000-000000000005'::uuid, 'a0a10001-0002-4000-8000-000000000003'::uuid, 'Microbiologie alimentaire', false),
  ('a0110001-0011-4000-8000-000000000004'::uuid, 'a0d00001-0010-4000-8000-000000000008'::uuid, 'a0a10001-0002-4000-8000-000000000003'::uuid, 'Microbiologie alimentaire', false),
  ('a0110001-0011-4000-8000-000000000005'::uuid, 'a0d00001-0010-4000-8000-000000000009'::uuid, 'a0a10001-0002-4000-8000-000000000005'::uuid, 'Pesticides', false)
) AS v(id, req, ana, name, internal) ON true
WHERE o.slug = 'elitech'
ON CONFLICT (id) DO NOTHING;

INSERT INTO lab.supplier_consultations (id, organization_id, request_id, language, recipient_mode, created_at)
SELECT 'a0c00001-0012-4000-8000-000000000001', o.id, 'a0d00001-0010-4000-8000-000000000003', 'en', 'TOP_3', now() - interval '5 days'
FROM lab.organizations o WHERE o.slug = 'elitech'
ON CONFLICT (id) DO NOTHING;

INSERT INTO lab.supplier_consultation_items (id, organization_id, consultation_id, supplier_id)
SELECT v.id, o.id, 'a0c00001-0012-4000-8000-000000000001', v.sup
FROM lab.organizations o
JOIN (VALUES
  ('a0c00001-0013-4000-8000-000000000001'::uuid, 'a0510001-0003-4000-8000-000000000001'::uuid),
  ('a0c00001-0013-4000-8000-000000000002'::uuid, 'a0510001-0003-4000-8000-000000000002'::uuid),
  ('a0c00001-0013-4000-8000-000000000003'::uuid, 'a0510001-0003-4000-8000-000000000003'::uuid)
) AS v(id, sup) ON true
WHERE o.slug = 'elitech'
ON CONFLICT (id) DO NOTHING;

INSERT INTO lab.supplier_responses (id, organization_id, consultation_item_id, amount, currency, turnaround_days, accreditation, method)
SELECT v.id, o.id, v.item, v.amount, 'EUR', v.days, 'ISO 17025', 'ICP-MS'
FROM lab.organizations o
JOIN (VALUES
  ('a0c00001-0014-4000-8000-000000000001'::uuid, 'a0c00001-0013-4000-8000-000000000001'::uuid, 2400, 7),
  ('a0c00001-0014-4000-8000-000000000002'::uuid, 'a0c00001-0013-4000-8000-000000000002'::uuid, 2100, 5),
  ('a0c00001-0014-4000-8000-000000000003'::uuid, 'a0c00001-0013-4000-8000-000000000003'::uuid, 2600, 6)
) AS v(id, item, amount, days) ON true
WHERE o.slug = 'elitech'
ON CONFLICT (id) DO NOTHING;

INSERT INTO lab.quotes (
  id, organization_id, request_id, client_id, quote_number, amount, currency, turnaround_days,
  status, sent_at, followup_due_at, followup_sent_at, created_at
)
SELECT v.id, o.id, v.req, v.client, v.num, v.amount, 'MAD', v.days, v.status,
  v.sent, v.due, v.fup, v.created
FROM lab.organizations o
JOIN (VALUES
  ('a0900001-0020-4000-8000-000000000004'::uuid, 'a0d00001-0010-4000-8000-000000000004'::uuid, 'a0c1e001-0001-4000-8000-000000000001'::uuid, 'DEV-SEED-04', 1950::numeric, 8, 'draft', NULL::timestamptz, NULL::timestamptz, NULL::timestamptz, now() - interval '7 days'),
  ('a0900001-0020-4000-8000-000000000005'::uuid, 'a0d00001-0010-4000-8000-000000000005'::uuid, 'a0c1e001-0001-4000-8000-000000000002'::uuid, 'DEV-SEED-05', 3900, 10, 'sent', now() - interval '8 days', now() - interval '5 days', NULL, now() - interval '8 days'),
  ('a0900001-0020-4000-8000-000000000006'::uuid, 'a0d00001-0010-4000-8000-000000000006'::uuid, 'a0c1e001-0001-4000-8000-000000000003'::uuid, 'DEV-SEED-06', 2730, 12, 'accepted', now() - interval '14 days', now() - interval '11 days', now() - interval '11 days', now() - interval '14 days'),
  ('a0900001-0020-4000-8000-000000000007'::uuid, 'a0d00001-0010-4000-8000-000000000007'::uuid, 'a0c1e001-0001-4000-8000-000000000001'::uuid, 'DEV-SEED-07', 3380, 9, 'accepted', now() - interval '17 days', now() - interval '14 days', now() - interval '14 days', now() - interval '17 days'),
  ('a0900001-0020-4000-8000-000000000008'::uuid, 'a0d00001-0010-4000-8000-000000000008'::uuid, 'a0c1e001-0001-4000-8000-000000000002'::uuid, 'DEV-SEED-08', 4160, 7, 'accepted', now() - interval '21 days', now() - interval '18 days', now() - interval '18 days', now() - interval '21 days'),
  ('a0900001-0020-4000-8000-000000000009'::uuid, 'a0d00001-0010-4000-8000-000000000009'::uuid, 'a0c1e001-0001-4000-8000-000000000003'::uuid, 'DEV-SEED-09', 2210, 6, 'accepted', now() - interval '24 days', now() - interval '21 days', now() - interval '21 days', now() - interval '24 days'),
  ('a0900001-0020-4000-8000-00000000000a'::uuid, 'a0d00001-0010-4000-8000-00000000000a'::uuid, 'a0c1e001-0001-4000-8000-000000000001'::uuid, 'DEV-SEED-10', 2990, 8, 'accepted', now() - interval '31 days', now() - interval '28 days', now() - interval '28 days', now() - interval '31 days'),
  ('a0900001-0020-4000-8000-00000000000b'::uuid, 'a0d00001-0010-4000-8000-00000000000b'::uuid, 'a0c1e001-0001-4000-8000-000000000002'::uuid, 'DEV-SEED-11', 2600, 11, 'accepted', now() - interval '39 days', now() - interval '36 days', now() - interval '36 days', now() - interval '39 days'),
  ('a0900001-0020-4000-8000-00000000000c'::uuid, 'a0d00001-0010-4000-8000-00000000000c'::uuid, 'a0c1e001-0001-4000-8000-000000000003'::uuid, 'DEV-SEED-12', 1800, 5, 'accepted', now() - interval '48 days', now() - interval '45 days', now() - interval '45 days', now() - interval '48 days')
) AS v(id, req, client, num, amount, days, status, sent, due, fup, created) ON true
WHERE o.slug = 'elitech'
ON CONFLICT (organization_id, quote_number) DO UPDATE
  SET amount = EXCLUDED.amount, status = EXCLUDED.status, sent_at = EXCLUDED.sent_at, followup_due_at = EXCLUDED.followup_due_at;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'lab' AND table_name = 'quotes' AND column_name = 'supplier_amount'
  ) THEN
    UPDATE lab.quotes SET supplier_amount = round(amount / 1.30, 2), margin_percent = 30, version = 1
    WHERE quote_number LIKE 'DEV-SEED-%';
  END IF;
END $$;

INSERT INTO lab.quote_items (id, organization_id, quote_id, analysis_name, supplier_amount, client_amount)
SELECT v.id, o.id, v.qid, v.name, v.sup, v.cli
FROM lab.organizations o
JOIN (VALUES
  ('a0901001-0021-4000-8000-000000000005'::uuid, 'a0900001-0020-4000-8000-000000000005'::uuid, 'Microbiologie', 3000::numeric, 3900::numeric),
  ('a0901001-0021-4000-8000-000000000006'::uuid, 'a0900001-0020-4000-8000-000000000006'::uuid, 'Métaux lourds', 2100, 2730)
) AS v(id, qid, name, sup, cli) ON true
WHERE o.slug = 'elitech'
ON CONFLICT (id) DO NOTHING;

INSERT INTO lab.purchase_orders (id, organization_id, request_id, quote_id, client_id, reference, amount, review_status, client_name)
SELECT v.id, o.id, v.req, v.qid, v.client, v.ref, v.amount, v.st, v.cname
FROM lab.organizations o
JOIN (VALUES
  ('a0b00001-0030-4000-8000-000000000006'::uuid, 'a0d00001-0010-4000-8000-000000000006'::uuid, 'a0900001-0020-4000-8000-000000000006'::uuid, 'a0c1e001-0001-4000-8000-000000000003'::uuid, 'BDC-SEED-06', 2730::numeric, 'accepted', 'Coopérative Souss'),
  ('a0b00001-0030-4000-8000-000000000007'::uuid, 'a0d00001-0010-4000-8000-000000000007'::uuid, 'a0900001-0020-4000-8000-000000000007'::uuid, 'a0c1e001-0001-4000-8000-000000000001'::uuid, 'BDC-SEED-07', 3380, 'accepted', 'Atlas Oils'),
  ('a0b00001-0030-4000-8000-000000000008'::uuid, 'a0d00001-0010-4000-8000-000000000008'::uuid, 'a0900001-0020-4000-8000-000000000008'::uuid, 'a0c1e001-0001-4000-8000-000000000002'::uuid, 'BDC-SEED-08', 4160, 'accepted', 'Oasis Food'),
  ('a0b00001-0030-4000-8000-000000000009'::uuid, 'a0d00001-0010-4000-8000-000000000009'::uuid, 'a0900001-0020-4000-8000-000000000009'::uuid, 'a0c1e001-0001-4000-8000-000000000003'::uuid, 'BDC-SEED-09', 2210, 'accepted', 'Coopérative Souss'),
  ('a0b00001-0030-4000-8000-00000000000a'::uuid, 'a0d00001-0010-4000-8000-00000000000a'::uuid, 'a0900001-0020-4000-8000-00000000000a'::uuid, 'a0c1e001-0001-4000-8000-000000000001'::uuid, 'BDC-SEED-10', 2990, 'accepted', 'Atlas Oils'),
  ('a0b00001-0030-4000-8000-00000000000b'::uuid, 'a0d00001-0010-4000-8000-00000000000b'::uuid, 'a0900001-0020-4000-8000-00000000000b'::uuid, 'a0c1e001-0001-4000-8000-000000000002'::uuid, 'BDC-SEED-11', 2600, 'accepted', 'Oasis Food'),
  ('a0b00001-0030-4000-8000-00000000000c'::uuid, 'a0d00001-0010-4000-8000-00000000000c'::uuid, 'a0900001-0020-4000-8000-00000000000c'::uuid, 'a0c1e001-0001-4000-8000-000000000003'::uuid, 'BDC-SEED-12', 1800, 'accepted', 'Coopérative Souss')
) AS v(id, req, qid, client, ref, amount, st, cname) ON true
WHERE o.slug = 'elitech'
ON CONFLICT (id) DO UPDATE SET review_status = EXCLUDED.review_status, amount = EXCLUDED.amount;

INSERT INTO lab.samples (id, organization_id, request_id, quote_id, purchase_order_id, client_id, supplier_id, code, product_name, received_at, received_by, quantity)
SELECT v.id, o.id, v.req, v.qid, v.po, v.client, 'a0510001-0003-4000-8000-000000000002', v.code, v.product, v.recv, 'Technicien seed', 1
FROM lab.organizations o
JOIN (VALUES
  ('a0e00001-0040-4000-8000-000000000007'::uuid, 'a0d00001-0010-4000-8000-000000000007'::uuid, 'a0900001-0020-4000-8000-000000000007'::uuid, 'a0b00001-0030-4000-8000-000000000007'::uuid, 'a0c1e001-0001-4000-8000-000000000001'::uuid, 'ECH-000901-2026-HUILE-D-ARGAN', 'Huile d’argan', now() - interval '16 days'),
  ('a0e00001-0040-4000-8000-000000000008'::uuid, 'a0d00001-0010-4000-8000-000000000008'::uuid, 'a0900001-0020-4000-8000-000000000008'::uuid, 'a0b00001-0030-4000-8000-000000000008'::uuid, 'a0c1e001-0001-4000-8000-000000000002'::uuid, 'ECH-000902-2026-LAIT', 'Lait UHT', now() - interval '20 days'),
  ('a0e00001-0040-4000-8000-000000000009'::uuid, 'a0d00001-0010-4000-8000-000000000009'::uuid, 'a0900001-0020-4000-8000-000000000009'::uuid, 'a0b00001-0030-4000-8000-000000000009'::uuid, 'a0c1e001-0001-4000-8000-000000000003'::uuid, 'ECH-000903-2026-JUS-ORANGE', 'Jus d’orange', now() - interval '23 days'),
  ('a0e00001-0040-4000-8000-00000000000a'::uuid, 'a0d00001-0010-4000-8000-00000000000a'::uuid, 'a0900001-0020-4000-8000-00000000000a'::uuid, 'a0b00001-0030-4000-8000-00000000000a'::uuid, 'a0c1e001-0001-4000-8000-000000000001'::uuid, 'ECH-000904-2026-THON', 'Thon à l’huile', now() - interval '30 days'),
  ('a0e00001-0040-4000-8000-00000000000b'::uuid, 'a0d00001-0010-4000-8000-00000000000b'::uuid, 'a0900001-0020-4000-8000-00000000000b'::uuid, 'a0b00001-0030-4000-8000-00000000000b'::uuid, 'a0c1e001-0001-4000-8000-000000000002'::uuid, 'ECH-000905-2026-SAFRAN', 'Safran', now() - interval '38 days'),
  ('a0e00001-0040-4000-8000-00000000000c'::uuid, 'a0d00001-0010-4000-8000-00000000000c'::uuid, 'a0900001-0020-4000-8000-00000000000c'::uuid, 'a0b00001-0030-4000-8000-00000000000c'::uuid, 'a0c1e001-0001-4000-8000-000000000003'::uuid, 'ECH-000906-2026-AMLOU', 'Amlou', now() - interval '47 days')
) AS v(id, req, qid, po, client, code, product, recv) ON true
WHERE o.slug = 'elitech'
ON CONFLICT (organization_id, code) DO UPDATE SET received_at = EXCLUDED.received_at;

INSERT INTO lab.analysis_orders (id, organization_id, request_id, supplier_id, sample_id, expected_date, sent_at)
SELECT v.id, o.id, v.req, 'a0510001-0003-4000-8000-000000000002', v.sample, v.exp, v.sent
FROM lab.organizations o
JOIN (VALUES
  ('a0f00001-0050-4000-8000-000000000008'::uuid, 'a0d00001-0010-4000-8000-000000000008'::uuid, 'a0e00001-0040-4000-8000-000000000008'::uuid, (current_date - 4), now() - interval '19 days'),
  ('a0f00001-0050-4000-8000-000000000009'::uuid, 'a0d00001-0010-4000-8000-000000000009'::uuid, 'a0e00001-0040-4000-8000-000000000009'::uuid, (current_date - 1), now() - interval '22 days')
) AS v(id, req, sample, exp, sent) ON true
WHERE o.slug = 'elitech'
ON CONFLICT (id) DO NOTHING;

INSERT INTO lab.supplier_deadlines (id, organization_id, request_id, supplier_id, expected_date, actual_date, delay_days, penalty_rate, penalty_amount)
SELECT v.id, o.id, v.req, 'a0510001-0003-4000-8000-000000000002', v.exp, v.act, v.delay, 1, v.pen
FROM lab.organizations o
JOIN (VALUES
  ('a0f10001-0051-4000-8000-000000000008'::uuid, 'a0d00001-0010-4000-8000-000000000008'::uuid, current_date - 4, NULL::date, 4, 41.60::numeric),
  ('a0f10001-0051-4000-8000-00000000000a'::uuid, 'a0d00001-0010-4000-8000-00000000000a'::uuid, current_date - 20, current_date - 18, 0, 0)
) AS v(id, req, exp, act, delay, pen) ON true
WHERE o.slug = 'elitech'
ON CONFLICT (id) DO UPDATE SET expected_date = EXCLUDED.expected_date, penalty_amount = EXCLUDED.penalty_amount;

INSERT INTO lab.analysis_results (id, organization_id, request_id, sample_id, supplier_id, analysis_name, value, unit, method, accreditation, received_at)
SELECT v.id, o.id, v.req, v.sample, 'a0510001-0003-4000-8000-000000000002', v.name, v.val, v.unit, 'ISO', 'ISO 17025', now() - interval '2 days'
FROM lab.organizations o
JOIN (VALUES
  ('a0f20001-0052-4000-8000-000000000009'::uuid, 'a0d00001-0010-4000-8000-000000000009'::uuid, 'a0e00001-0040-4000-8000-000000000009'::uuid, 'Pesticides', '0.01', 'mg/kg'),
  ('a0f20001-0052-4000-8000-00000000000a'::uuid, 'a0d00001-0010-4000-8000-00000000000a'::uuid, 'a0e00001-0040-4000-8000-00000000000a'::uuid, 'Métaux lourds', '0.04', 'mg/kg')
) AS v(id, req, sample, name, val, unit) ON true
WHERE o.slug = 'elitech'
ON CONFLICT (id) DO NOTHING;

INSERT INTO lab.result_reviews (id, organization_id, result_id, level, decision, comment)
SELECT v.id, o.id, v.res, v.level, v.dec, v.com
FROM lab.organizations o
JOIN (VALUES
  ('a0f30001-0053-4000-8000-000000000001'::uuid, 'a0f20001-0052-4000-8000-000000000009'::uuid, 'ai', 'accept', '[LAB_SEED] aide IA'),
  ('a0f30001-0053-4000-8000-000000000002'::uuid, 'a0f20001-0052-4000-8000-000000000009'::uuid, 'technical', 'accept', '[LAB_SEED] RT ok, attente Zineb'),
  ('a0f30001-0053-4000-8000-000000000003'::uuid, 'a0f20001-0052-4000-8000-00000000000a'::uuid, 'ai', 'accept', '[LAB_SEED]'),
  ('a0f30001-0053-4000-8000-000000000004'::uuid, 'a0f20001-0052-4000-8000-00000000000a'::uuid, 'technical', 'accept', '[LAB_SEED]'),
  ('a0f30001-0053-4000-8000-000000000005'::uuid, 'a0f20001-0052-4000-8000-00000000000a'::uuid, 'final', 'accept', '[LAB_SEED] Zineb')
) AS v(id, res, level, dec, com) ON true
WHERE o.slug = 'elitech'
ON CONFLICT (id) DO NOTHING;

INSERT INTO lab.reports (id, organization_id, request_id, sent_at, recipient, delivery_status)
SELECT 'a0f40001-0054-4000-8000-00000000000a', o.id, 'a0d00001-0010-4000-8000-00000000000a', now() - interval '10 days', 'sara@atlas-oils.ma', 'sent'
FROM lab.organizations o WHERE o.slug = 'elitech'
ON CONFLICT (id) DO NOTHING;

INSERT INTO lab.client_invoices (id, organization_id, client_id, request_id, invoice_number, invoice_date, amount_total, due_date, status)
SELECT v.id, o.id, v.client, v.req, v.num, v.dt, v.amount, v.due, v.st::lab.invoice_status
FROM lab.organizations o
JOIN (VALUES
  ('a0f50001-0060-4000-8000-00000000000b'::uuid, 'a0c1e001-0001-4000-8000-000000000002'::uuid, 'a0d00001-0010-4000-8000-00000000000b'::uuid, 'FAC-SEED-11', current_date - 8, 2600::numeric, current_date + 10, 'PARTIELLEMENT_PAYEE'),
  ('a0f50001-0060-4000-8000-00000000000c'::uuid, 'a0c1e001-0001-4000-8000-000000000003'::uuid, 'a0d00001-0010-4000-8000-00000000000c'::uuid, 'FAC-SEED-12', current_date - 20, 1800, current_date - 5, 'PAYEE')
) AS v(id, client, req, num, dt, amount, due, st) ON true
WHERE o.slug = 'elitech'
ON CONFLICT (organization_id, invoice_number) DO UPDATE SET status = EXCLUDED.status, amount_total = EXCLUDED.amount_total;

INSERT INTO lab.client_payments (id, organization_id, invoice_id, amount, paid_at)
SELECT v.id, o.id, v.inv, v.amount, v.paid
FROM lab.organizations o
JOIN (VALUES
  ('a0f60001-0061-4000-8000-000000000001'::uuid, 'a0f50001-0060-4000-8000-00000000000b'::uuid, 800::numeric, current_date - 3),
  ('a0f60001-0061-4000-8000-000000000002'::uuid, 'a0f50001-0060-4000-8000-00000000000c'::uuid, 1800, current_date - 12)
) AS v(id, inv, amount, paid) ON true
WHERE o.slug = 'elitech'
ON CONFLICT (id) DO NOTHING;

INSERT INTO lab.supplier_invoices (id, organization_id, supplier_id, invoice_number, amount_total, due_date, status)
SELECT 'a0f70001-0062-4000-8000-000000000001', o.id, 'a0510001-0003-4000-8000-000000000002', 'FF-SEED-01', 2000, current_date + 15, 'EN_ATTENTE'::lab.invoice_status
FROM lab.organizations o WHERE o.slug = 'elitech'
ON CONFLICT (id) DO NOTHING;

INSERT INTO lab.tasks (id, organization_id, priority, status, due_date, entity_type, title)
SELECT v.id, o.id, v.prio, v.st::lab.task_status, v.due, v.ent, v.title
FROM lab.organizations o
JOIN (VALUES
  ('a0f80001-0070-4000-8000-000000000001'::uuid, 'high', 'EN_COURS', current_date - 2, 'quotes', '[LAB_SEED] Relancer devis miel DEV-SEED-05'),
  ('a0f80001-0070-4000-8000-000000000002'::uuid, 'normal', 'NOUVELLE', current_date + 1, 'requests', '[LAB_SEED] Qualifier eau Oasis DEM-SEED-02'),
  ('a0f80001-0070-4000-8000-000000000003'::uuid, 'high', 'A_VALIDER', current_date, 'results', '[LAB_SEED] Validation Zineb jus DEM-SEED-09'),
  ('a0f80001-0070-4000-8000-000000000004'::uuid, 'normal', 'EN_ATTENTE', current_date - 1, 'samples', '[LAB_SEED] Relancer échantillons dattes BDC-SEED-06')
) AS v(id, prio, st, due, ent, title) ON true
WHERE o.slug = 'elitech'
ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status, due_date = EXCLUDED.due_date;

INSERT INTO lab.email_messages (id, organization_id, template_key, recipient, subject, body, status, provider)
SELECT v.id, o.id, v.tpl, v.rcp, v.subj, v.body, v.st, 'resend'
FROM lab.organizations o
JOIN (VALUES
  ('a0f90001-0080-4000-8000-000000000001'::uuid, 'client_quote', 'noura@oasis-food.ma', '[LAB_SEED] Devis DEV-SEED-05', 'Votre devis miel', 'sent'),
  ('a0f90001-0080-4000-8000-000000000002'::uuid, 'quote_followup', 'noura@oasis-food.ma', '[LAB_SEED] Relance DEV-SEED-05', 'Relance 3-4 j due', 'queued'),
  ('a0f90001-0080-4000-8000-000000000003'::uuid, 'supplier_consultation', 'rfq@eurolab.example', '[LAB_SEED] RFQ tomates', 'Please quote', 'sent'),
  ('a0f90001-0080-4000-8000-000000000004'::uuid, 'report_ready', 'sara@atlas-oils.ma', '[LAB_SEED] Rapport thon', 'Rapport disponible', 'sent')
) AS v(id, tpl, rcp, subj, body, st) ON true
WHERE o.slug = 'elitech'
ON CONFLICT (id) DO NOTHING;

INSERT INTO lab.notifications (id, organization_id, title, body)
SELECT 'a0fa0001-0090-4000-8000-000000000001', o.id, '[LAB_SEED] Relance devis', 'DEV-SEED-05 en retard de relance'
FROM lab.organizations o WHERE o.slug = 'elitech'
ON CONFLICT (id) DO NOTHING;

INSERT INTO lab.audit_logs (organization_id, action, entity_type, entity_id, new_value)
SELECT o.id, 'seed.elitech_demo', 'organizations', o.id, jsonb_build_object('dossiers', 12, 'tag', 'LAB_SEED')
FROM lab.organizations o WHERE o.slug = 'elitech';

DO $$
BEGIN
  IF to_regclass('lab.client_calls') IS NOT NULL THEN
    INSERT INTO lab.client_calls (id, organization_id, request_id, client_id, company_name, contact_name, phone, subject, outcome, status, called_at, follow_up_at)
    SELECT 'a0fb0001-00a0-4000-8000-000000000001', o.id, 'a0d00001-0010-4000-8000-000000000005',
      'a0c1e001-0001-4000-8000-000000000002', 'Oasis Food', 'Noura Kadiri', '661000002',
      '[LAB_SEED] Relance devis miel', 'SUIVI', 'OUVERT', now() - interval '4 days', now() - interval '1 day'
    FROM lab.organizations o WHERE o.slug = 'elitech'
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;
