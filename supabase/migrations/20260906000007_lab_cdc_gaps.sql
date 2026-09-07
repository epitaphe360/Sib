-- CDC gaps: execution channel, quote versions, calls, regulatory catalog.

ALTER TABLE lab.client_requests
  ADD COLUMN IF NOT EXISTS execution_channel text,
  ADD COLUMN IF NOT EXISTS origin text NOT NULL DEFAULT 'FORM';

ALTER TABLE lab.quotes
  ADD COLUMN IF NOT EXISTS version integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS parent_quote_id uuid REFERENCES lab.quotes (id),
  ADD COLUMN IF NOT EXISTS supplier_amount numeric(12,2),
  ADD COLUMN IF NOT EXISTS margin_percent numeric(6,3),
  ADD COLUMN IF NOT EXISTS competitiveness_flag text;

CREATE TABLE IF NOT EXISTS lab.client_calls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES lab.organizations (id),
  request_id uuid REFERENCES lab.client_requests (id),
  client_id uuid REFERENCES lab.clients (id),
  company_name text NOT NULL,
  contact_name text,
  phone text,
  subject text NOT NULL,
  outcome text NOT NULL DEFAULT 'INFO',
  notes text,
  status text NOT NULL DEFAULT 'OUVERT',
  called_at timestamptz NOT NULL DEFAULT now(),
  follow_up_at timestamptz,
  created_by uuid REFERENCES auth.users (id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE TABLE IF NOT EXISTS lab.regulatory_texts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES lab.organizations (id),
  catalog_id text,
  parameter text,
  matrix text,
  title text,
  text_title text,
  reference text NOT NULL,
  kind text,
  created_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE TABLE IF NOT EXISTS lab.regulatory_proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES lab.organizations (id),
  product_name text NOT NULL,
  matrix text,
  parameter text NOT NULL,
  kind text NOT NULL,
  text_title text NOT NULL,
  reference text NOT NULL,
  applicability text,
  status text NOT NULL DEFAULT 'A_VALIDER',
  validated_by uuid REFERENCES auth.users (id),
  validated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_lab_client_calls_org ON lab.client_calls (organization_id);
CREATE INDEX IF NOT EXISTS idx_lab_reg_prop_org ON lab.regulatory_proposals (organization_id);

ALTER TABLE lab.client_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab.regulatory_texts ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab.regulatory_proposals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS client_calls_iso ON lab.client_calls;
CREATE POLICY client_calls_iso ON lab.client_calls
  FOR ALL USING (lab.can_access_org(organization_id))
  WITH CHECK (lab.can_access_org(organization_id));

DROP POLICY IF EXISTS regulatory_texts_iso ON lab.regulatory_texts;
CREATE POLICY regulatory_texts_iso ON lab.regulatory_texts
  FOR ALL USING (organization_id IS NULL OR lab.can_access_org(organization_id))
  WITH CHECK (organization_id IS NULL OR lab.can_access_org(organization_id));

DROP POLICY IF EXISTS regulatory_proposals_iso ON lab.regulatory_proposals;
CREATE POLICY regulatory_proposals_iso ON lab.regulatory_proposals
  FOR ALL USING (lab.can_access_org(organization_id))
  WITH CHECK (lab.can_access_org(organization_id));

GRANT SELECT, INSERT, UPDATE ON lab.client_calls TO authenticated;
GRANT SELECT, INSERT, UPDATE ON lab.regulatory_texts TO authenticated;
GRANT SELECT, INSERT, UPDATE ON lab.regulatory_proposals TO authenticated;
GRANT SELECT ON lab.regulatory_texts TO anon;
