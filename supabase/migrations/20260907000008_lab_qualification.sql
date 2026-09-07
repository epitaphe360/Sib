-- Document 27: qualification wizard (client / sample / need / logistics / recap)

ALTER TABLE lab.clients
  ADD COLUMN IF NOT EXISTS client_code text,
  ADD COLUMN IF NOT EXISTS client_type text,
  ADD COLUMN IF NOT EXISTS ice text,
  ADD COLUMN IF NOT EXISTS if_fiscal text,
  ADD COLUMN IF NOT EXISTS rc text,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS postal_code text,
  ADD COLUMN IF NOT EXISTS contact_name text,
  ADD COLUMN IF NOT EXISTS country_code text DEFAULT '+212';

ALTER TABLE lab.client_requests
  ADD COLUMN IF NOT EXISTS qualification jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS ice_status text;

CREATE TABLE IF NOT EXISTS lab.sample_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES lab.organizations (id),
  code text NOT NULL,
  label text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE (organization_id, code)
);

CREATE TABLE IF NOT EXISTS lab.sample_subcategories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES lab.organizations (id),
  category_code text NOT NULL,
  label text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE TABLE IF NOT EXISTS lab.sample_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES lab.organizations (id),
  category_code text NOT NULL,
  subcategory_label text,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE TABLE IF NOT EXISTS lab.request_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES lab.organizations (id),
  user_id uuid REFERENCES auth.users (id),
  email text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lab_sample_products_name ON lab.sample_products (lower(name));
CREATE INDEX IF NOT EXISTS idx_lab_clients_search ON lab.clients (lower(company_name), lower(coalesce(email, '')), phone);
CREATE UNIQUE INDEX IF NOT EXISTS idx_lab_request_drafts_user ON lab.request_drafts (user_id) WHERE user_id IS NOT NULL;

INSERT INTO lab.sample_categories (organization_id, code, label, sort_order)
SELECT NULL, v.code, v.label, v.sort_order
FROM (VALUES
  ('alimentaire', 'Produit alimentaire', 1),
  ('eau', 'Eau', 2),
  ('sol', 'Sol', 3),
  ('boue', 'Boue', 4),
  ('air', 'Air', 5),
  ('cosmetique', 'Produit cosmétique', 6),
  ('hygiene', 'Produit d’hygiène', 7),
  ('aliment_animaux', 'Aliment pour animaux', 8),
  ('matiere_premiere', 'Matière première', 9),
  ('emballage', 'Emballage / matériau', 10),
  ('surface', 'Surface / écouvillon', 11),
  ('industriel', 'Produit industriel', 12),
  ('environnement', 'Environnement', 13),
  ('autre', 'Autre', 14)
) AS v(code, label, sort_order)
WHERE NOT EXISTS (
  SELECT 1 FROM lab.sample_categories c WHERE c.organization_id IS NULL AND c.code = v.code
);

INSERT INTO lab.sample_subcategories (organization_id, category_code, label, sort_order)
SELECT NULL, v.category_code, v.label, v.sort_order
FROM (VALUES
  ('alimentaire', 'Produits laitiers', 1),
  ('alimentaire', 'Viandes', 2),
  ('alimentaire', 'Charcuterie', 3),
  ('alimentaire', 'Volaille', 4),
  ('alimentaire', 'Produits de la pêche', 5),
  ('alimentaire', 'Fruits', 6),
  ('alimentaire', 'Légumes', 7),
  ('alimentaire', 'Céréales', 8),
  ('alimentaire', 'Farines', 9),
  ('alimentaire', 'Huiles', 10),
  ('alimentaire', 'Épices', 11),
  ('alimentaire', 'Boissons', 12),
  ('alimentaire', 'Jus', 13),
  ('alimentaire', 'Conserves', 14),
  ('alimentaire', 'Biscuits', 15),
  ('alimentaire', 'Confiserie', 16),
  ('alimentaire', 'Miel', 17),
  ('alimentaire', 'Œufs', 18),
  ('alimentaire', 'Produits surgelés', 19),
  ('alimentaire', 'Aliments animaux', 20),
  ('alimentaire', 'Autre', 21)
) AS v(category_code, label, sort_order)
WHERE NOT EXISTS (
  SELECT 1 FROM lab.sample_subcategories s
  WHERE s.organization_id IS NULL AND s.category_code = v.category_code AND s.label = v.label
);

INSERT INTO lab.sample_products (organization_id, category_code, subcategory_label, name)
SELECT NULL, v.category_code, v.subcategory_label, v.name
FROM (VALUES
  ('alimentaire', 'Produits laitiers', 'beurre'),
  ('alimentaire', 'Produits laitiers', 'mozzarella'),
  ('alimentaire', 'Produits laitiers', 'fromage fondu'),
  ('alimentaire', 'Produits laitiers', 'lait'),
  ('alimentaire', 'Produits de la pêche', 'saumon fumé'),
  ('alimentaire', 'Conserves', 'thon en conserve'),
  ('alimentaire', 'Farines', 'farine de blé'),
  ('alimentaire', 'Huiles', 'huile d’olive'),
  ('alimentaire', 'Épices', 'paprika'),
  ('alimentaire', 'Jus', 'jus d’orange'),
  ('alimentaire', 'Huiles', 'huile d’argan'),
  ('alimentaire', 'Miel', 'miel')
) AS v(category_code, subcategory_label, name)
WHERE NOT EXISTS (
  SELECT 1 FROM lab.sample_products p
  WHERE p.organization_id IS NULL AND p.category_code = v.category_code AND lower(p.name) = lower(v.name)
);

ALTER TABLE lab.sample_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab.sample_subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab.sample_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab.request_drafts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS sample_categories_read ON lab.sample_categories;
CREATE POLICY sample_categories_read ON lab.sample_categories
  FOR SELECT USING (organization_id IS NULL OR lab.can_access_org(organization_id));

DROP POLICY IF EXISTS sample_categories_write ON lab.sample_categories;
CREATE POLICY sample_categories_write ON lab.sample_categories
  FOR ALL USING (lab.can_access_org(organization_id))
  WITH CHECK (lab.can_access_org(organization_id));

DROP POLICY IF EXISTS sample_subcategories_read ON lab.sample_subcategories;
CREATE POLICY sample_subcategories_read ON lab.sample_subcategories
  FOR SELECT USING (organization_id IS NULL OR lab.can_access_org(organization_id));

DROP POLICY IF EXISTS sample_subcategories_write ON lab.sample_subcategories;
CREATE POLICY sample_subcategories_write ON lab.sample_subcategories
  FOR ALL USING (lab.can_access_org(organization_id))
  WITH CHECK (lab.can_access_org(organization_id));

DROP POLICY IF EXISTS sample_products_read ON lab.sample_products;
CREATE POLICY sample_products_read ON lab.sample_products
  FOR SELECT USING (organization_id IS NULL OR lab.can_access_org(organization_id));

DROP POLICY IF EXISTS sample_products_write ON lab.sample_products;
CREATE POLICY sample_products_write ON lab.sample_products
  FOR ALL USING (lab.can_access_org(organization_id))
  WITH CHECK (lab.can_access_org(organization_id));

DROP POLICY IF EXISTS request_drafts_own ON lab.request_drafts;
CREATE POLICY request_drafts_own ON lab.request_drafts
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

GRANT SELECT ON lab.sample_categories TO anon, authenticated;
GRANT SELECT ON lab.sample_subcategories TO anon, authenticated;
GRANT SELECT ON lab.sample_products TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON lab.sample_categories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON lab.sample_subcategories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON lab.sample_products TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON lab.request_drafts TO authenticated;

CREATE OR REPLACE FUNCTION lab.match_existing_client(p_org_slug text, p_query text)
RETURNS TABLE (
  id uuid,
  company_name text,
  ice text,
  if_fiscal text,
  address text,
  city text,
  country text,
  contact_name text,
  phone text,
  email text,
  client_code text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = lab, public
AS $$
DECLARE
  v_org uuid;
  v_q text;
  v_digits text;
BEGIN
  v_q := trim(p_query);
  IF v_q IS NULL OR length(v_q) < 3 THEN
    RETURN;
  END IF;
  v_digits := regexp_replace(v_q, '\D', '', 'g');

  SELECT o.id INTO v_org
  FROM lab.organizations o
  WHERE o.slug = p_org_slug AND o.is_active AND o.deleted_at IS NULL;

  IF v_org IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    c.id, c.company_name, c.ice, c.if_fiscal, c.address, c.city, c.country,
    c.contact_name, c.phone, c.email, c.client_code
  FROM lab.clients c
  WHERE c.organization_id = v_org
    AND c.deleted_at IS NULL
    AND (
      c.company_name ILIKE '%' || v_q || '%'
      OR coalesce(c.email, '') ILIKE '%' || v_q || '%'
      OR coalesce(c.client_code, '') ILIKE '%' || v_q || '%'
      OR (length(v_digits) >= 6 AND regexp_replace(coalesce(c.phone, ''), '\D', '', 'g') LIKE '%' || v_digits || '%')
    )
  ORDER BY c.company_name
  LIMIT 8;
END;
$$;

GRANT EXECUTE ON FUNCTION lab.match_existing_client(text, text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION lab.submit_qualified_request(p_org_slug text, p_payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = lab, public
AS $$
DECLARE
  v_org uuid;
  v_id uuid;
  v_number text;
  v_phone text;
  v_email text;
  v_company text;
  v_contact text;
  v_count integer;
  v_name text;
  v_item jsonb;
BEGIN
  v_phone := regexp_replace(coalesce(p_payload->>'phone', ''), '\D', '', 'g');
  v_email := lower(trim(coalesce(p_payload->>'email', '')));
  v_company := trim(coalesce(p_payload->>'company_name', ''));
  v_contact := trim(coalesce(p_payload->>'contact_name', ''));
  v_count := coalesce((p_payload->>'sample_count')::integer, 1);

  IF v_phone !~ '^[0-9]{8,15}$' THEN
    RAISE EXCEPTION 'invalid_phone';
  END IF;
  IF v_email !~* '^[^@]+@[^@]+\.[^@]+$' THEN
    RAISE EXCEPTION 'invalid_email';
  END IF;
  IF length(v_company) < 2 OR length(v_contact) < 2 THEN
    RAISE EXCEPTION 'invalid_client';
  END IF;
  IF v_count < 1 THEN
    RAISE EXCEPTION 'invalid_sample_count';
  END IF;

  SELECT id INTO v_org
  FROM lab.organizations
  WHERE slug = p_org_slug AND is_active AND deleted_at IS NULL;

  IF v_org IS NULL THEN
    RAISE EXCEPTION 'unknown_organization';
  END IF;

  v_number := lab.next_dossier_number();

  INSERT INTO lab.client_requests (
    organization_id, dossier_number, company_name, contact_name, email, phone,
    country_code, product_name, matrix, sample_type, sample_count, urgency,
    deadline, accreditation_required, notes, status, origin, qualification, ice_status
  ) VALUES (
    v_org,
    v_number,
    v_company,
    v_contact,
    v_email,
    v_phone,
    coalesce(p_payload->>'country_code', '+212'),
    coalesce(nullif(trim(p_payload->>'product_name'), ''), 'À préciser'),
    nullif(p_payload->>'matrix', ''),
    nullif(p_payload->>'sample_type', ''),
    v_count,
    nullif(p_payload->>'urgency', ''),
    nullif(p_payload->>'deadline', '')::date,
    coalesce((p_payload->>'accreditation_required')::boolean, false),
    nullif(p_payload->>'notes', ''),
    'NEW_REQUEST',
    coalesce(p_payload->>'origin', 'FORM'),
    coalesce(p_payload->'qualification', '{}'::jsonb),
    CASE
      WHEN coalesce(p_payload#>>'{qualification,ice}', '') = '' THEN 'A_COMPLETER_AVANT_FACTURATION'
      ELSE 'FOURNI'
    END
  ) RETURNING id INTO v_id;

  IF jsonb_typeof(p_payload->'analyses') = 'array' THEN
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_payload->'analyses')
    LOOP
      v_name := trim(v_item #>> '{}');
      IF length(v_name) > 0 THEN
        INSERT INTO lab.request_items (organization_id, request_id, analysis_name)
        VALUES (v_org, v_id, v_name);
      END IF;
    END LOOP;
  END IF;

  INSERT INTO lab.audit_logs (organization_id, action, entity_type, entity_id, new_value)
  VALUES (v_org, 'request.create', 'client_requests', v_id, jsonb_build_object('email', v_email, 'dossier', v_number));

  INSERT INTO lab.notifications (organization_id, title, body)
  VALUES (
    v_org,
    'Nouvelle demande ' || v_number,
    v_company || ' · ' || coalesce(p_payload->>'product_name', '') || ' — à qualifier avant devis.'
  );

  INSERT INTO lab.email_messages (organization_id, template_key, recipient, subject, status, provider)
  SELECT v_org, 'new_request', o.email, 'Nouvelle demande ' || v_number, 'queued', 'resend'
  FROM lab.organizations o
  WHERE o.id = v_org AND o.email IS NOT NULL AND length(o.email) > 3;

  RETURN jsonb_build_object('id', v_id, 'dossier_number', v_number);
END;
$$;

GRANT EXECUTE ON FUNCTION lab.submit_qualified_request(text, jsonb) TO anon, authenticated;
