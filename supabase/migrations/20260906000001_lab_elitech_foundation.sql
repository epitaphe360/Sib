-- Elitech Lab foundation — isolated schema (do not touch SIB public tables)

CREATE SCHEMA IF NOT EXISTS lab;

GRANT USAGE ON SCHEMA lab TO anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

DO $$ BEGIN
  CREATE TYPE lab.member_role AS ENUM (
    'SUPER_ADMIN',
    'DIRECTION',
    'RESPONSABLE_VALIDATION',
    'RESPONSABLE_TECHNIQUE',
    'ASSISTANTE',
    'TECHNICIEN',
    'FINANCE',
    'UTILISATEUR_STANDARD',
    'CLIENT'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE lab.dossier_status AS ENUM (
    'NEW_REQUEST',
    'QUALIFICATION',
    'WAITING_SUPPLIER_QUOTES',
    'SUPPLIER_SELECTED',
    'CLIENT_QUOTE_DRAFT',
    'CLIENT_QUOTE_SENT',
    'WAITING_CLIENT_RESPONSE',
    'PURCHASE_ORDER_RECEIVED',
    'WAITING_SAMPLES',
    'SAMPLES_RECEIVED',
    'SAMPLES_CODED',
    'SENT_TO_SUPPLIER',
    'ANALYSIS_IN_PROGRESS',
    'RESULTS_RECEIVED',
    'AI_REVIEW',
    'TECHNICAL_REVIEW',
    'FINAL_REVIEW',
    'CORRECTION_REQUESTED',
    'APPROVED',
    'REPORT_GENERATION',
    'REPORT_SENT',
    'INVOICED',
    'CLOSED'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE lab.analysis_kind AS ENUM (
    'PHYSICO_CHIMIQUE',
    'MICROBIOLOGIQUE',
    'MIXTE'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE lab.task_status AS ENUM (
    'NOUVELLE',
    'EN_COURS',
    'EN_ATTENTE',
    'A_VALIDER',
    'TERMINEE'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE lab.invoice_status AS ENUM (
    'EN_ATTENTE',
    'PARTIELLEMENT_PAYEE',
    'PAYEE',
    'IMPAYEE'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE lab.email_classification AS ENUM (
    'PURCHASE_ORDER',
    'QUOTE_REPLY',
    'REPORT',
    'OTHER'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION lab.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- Core tables
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS lab.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  email text,
  phone text,
  country_code text NOT NULL DEFAULT '+212',
  city text,
  country text NOT NULL DEFAULT 'MA',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE TABLE IF NOT EXISTS lab.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  phone text,
  mfa_ready boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE TABLE IF NOT EXISTS lab.organization_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES lab.organizations (id),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  role lab.member_role NOT NULL,
  client_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE (organization_id, user_id)
);

CREATE OR REPLACE FUNCTION lab.user_org_ids()
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = lab, public
AS $$
  SELECT organization_id
  FROM lab.organization_members
  WHERE user_id = auth.uid()
    AND deleted_at IS NULL;
$$;

CREATE OR REPLACE FUNCTION lab.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = lab, public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM lab.organization_members
    WHERE user_id = auth.uid()
      AND role = 'SUPER_ADMIN'
      AND deleted_at IS NULL
  );
$$;

CREATE OR REPLACE FUNCTION lab.has_lab_role(p_org uuid, p_roles lab.member_role[])
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = lab, public
AS $$
  SELECT lab.is_super_admin()
    OR EXISTS (
      SELECT 1
      FROM lab.organization_members
      WHERE user_id = auth.uid()
        AND organization_id = p_org
        AND role = ANY (p_roles)
        AND deleted_at IS NULL
    );
$$;

CREATE OR REPLACE FUNCTION lab.can_access_org(p_org uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = lab, public
AS $$
  SELECT lab.is_super_admin()
    OR p_org IN (SELECT lab.user_org_ids());
$$;

CREATE OR REPLACE FUNCTION lab.client_id_for(p_org uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = lab, public
AS $$
  SELECT client_id
  FROM lab.organization_members
  WHERE user_id = auth.uid()
    AND organization_id = p_org
    AND role = 'CLIENT'
    AND deleted_at IS NULL
  LIMIT 1;
$$;

CREATE TABLE IF NOT EXISTS lab.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES lab.organizations (id),
  company_name text NOT NULL,
  email text,
  phone text,
  city text,
  country text DEFAULT 'MA',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

ALTER TABLE lab.organization_members
  ADD CONSTRAINT organization_members_client_fk
  FOREIGN KEY (client_id) REFERENCES lab.clients (id);

CREATE TABLE IF NOT EXISTS lab.client_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES lab.organizations (id),
  client_id uuid NOT NULL REFERENCES lab.clients (id),
  full_name text NOT NULL,
  email text,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE TABLE IF NOT EXISTS lab.analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES lab.organizations (id),
  code text NOT NULL,
  name text NOT NULL,
  kind lab.analysis_kind NOT NULL,
  is_internal boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE (organization_id, code)
);

CREATE TABLE IF NOT EXISTS lab.client_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES lab.organizations (id),
  dossier_number text NOT NULL,
  client_id uuid REFERENCES lab.clients (id),
  company_name text NOT NULL,
  contact_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  country_code text NOT NULL DEFAULT '+212',
  product_name text NOT NULL,
  matrix text,
  sample_type text,
  sample_count integer NOT NULL DEFAULT 1 CHECK (sample_count > 0),
  urgency text,
  deadline date,
  accreditation_required boolean NOT NULL DEFAULT false,
  notes text,
  analysis_kind lab.analysis_kind,
  status lab.dossier_status NOT NULL DEFAULT 'NEW_REQUEST',
  created_by uuid REFERENCES auth.users (id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE (organization_id, dossier_number)
);

CREATE TABLE IF NOT EXISTS lab.request_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES lab.organizations (id),
  request_id uuid NOT NULL REFERENCES lab.client_requests (id),
  analysis_id uuid REFERENCES lab.analyses (id),
  analysis_name text NOT NULL,
  is_internal boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE TABLE IF NOT EXISTS lab.suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES lab.organizations (id),
  name text NOT NULL,
  address text,
  city text,
  country text,
  email text,
  phone text,
  contact_name text,
  specialties text[] NOT NULL DEFAULT '{}',
  accreditations text[] NOT NULL DEFAULT '{}',
  quality_score numeric(4,2),
  delay_score numeric(4,2),
  price_score numeric(4,2),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE TABLE IF NOT EXISTS lab.supplier_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES lab.organizations (id),
  supplier_id uuid NOT NULL REFERENCES lab.suppliers (id),
  full_name text NOT NULL,
  email text,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE TABLE IF NOT EXISTS lab.supplier_capabilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES lab.organizations (id),
  supplier_id uuid NOT NULL REFERENCES lab.suppliers (id),
  analysis_id uuid REFERENCES lab.analyses (id),
  method text,
  accreditation text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE TABLE IF NOT EXISTS lab.supplier_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES lab.organizations (id),
  supplier_id uuid NOT NULL REFERENCES lab.suppliers (id),
  analysis_id uuid REFERENCES lab.analyses (id),
  amount numeric(12,2) NOT NULL CHECK (amount >= 0),
  currency text NOT NULL DEFAULT 'MAD',
  valid_from date NOT NULL DEFAULT CURRENT_DATE,
  valid_to date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lab.supplier_consultations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES lab.organizations (id),
  request_id uuid NOT NULL REFERENCES lab.client_requests (id),
  language text NOT NULL DEFAULT 'en',
  recipient_mode text NOT NULL DEFAULT 'TOP_3',
  created_by uuid REFERENCES auth.users (id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE TABLE IF NOT EXISTS lab.supplier_consultation_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES lab.organizations (id),
  consultation_id uuid NOT NULL REFERENCES lab.supplier_consultations (id),
  supplier_id uuid NOT NULL REFERENCES lab.suppliers (id),
  token uuid NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE TABLE IF NOT EXISTS lab.supplier_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES lab.organizations (id),
  consultation_item_id uuid NOT NULL REFERENCES lab.supplier_consultation_items (id),
  amount numeric(12,2) NOT NULL CHECK (amount >= 0),
  currency text NOT NULL DEFAULT 'EUR',
  pricing_type text NOT NULL DEFAULT 'unit',
  turnaround_days integer NOT NULL CHECK (turnaround_days > 0),
  method text,
  accreditation text,
  quantity numeric(12,2),
  conditions text,
  valid_until date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lab.supplier_selection (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES lab.organizations (id),
  request_id uuid NOT NULL REFERENCES lab.client_requests (id),
  consultation_id uuid REFERENCES lab.supplier_consultations (id),
  selected_supplier_id uuid NOT NULL REFERENCES lab.suppliers (id),
  selected_by uuid REFERENCES auth.users (id),
  selected_at timestamptz NOT NULL DEFAULT now(),
  reason text,
  comparison_snapshot jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lab.pricing_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES lab.organizations (id),
  name text NOT NULL DEFAULT 'default',
  margin_percent numeric(6,3) NOT NULL CHECK (margin_percent >= 0 AND margin_percent <= 100),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE TABLE IF NOT EXISTS lab.quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES lab.organizations (id),
  request_id uuid NOT NULL REFERENCES lab.client_requests (id),
  client_id uuid REFERENCES lab.clients (id),
  quote_number text NOT NULL,
  amount numeric(12,2) NOT NULL CHECK (amount >= 0),
  currency text NOT NULL DEFAULT 'MAD',
  turnaround_days integer,
  valid_until date,
  conditions text,
  status text NOT NULL DEFAULT 'draft',
  validated_by uuid REFERENCES auth.users (id),
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE (organization_id, quote_number)
);

CREATE TABLE IF NOT EXISTS lab.quote_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES lab.organizations (id),
  quote_id uuid NOT NULL REFERENCES lab.quotes (id),
  analysis_name text NOT NULL,
  supplier_amount numeric(12,2) NOT NULL DEFAULT 0,
  client_amount numeric(12,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lab.purchase_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES lab.organizations (id),
  request_id uuid NOT NULL REFERENCES lab.client_requests (id),
  quote_id uuid REFERENCES lab.quotes (id),
  client_id uuid REFERENCES lab.clients (id),
  reference text,
  amount numeric(12,2),
  review_status text NOT NULL DEFAULT 'pending',
  review_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE TABLE IF NOT EXISTS lab.samples (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES lab.organizations (id),
  request_id uuid NOT NULL REFERENCES lab.client_requests (id),
  quote_id uuid REFERENCES lab.quotes (id),
  purchase_order_id uuid REFERENCES lab.purchase_orders (id),
  client_id uuid REFERENCES lab.clients (id),
  supplier_id uuid REFERENCES lab.suppliers (id),
  code text NOT NULL,
  product_name text NOT NULL,
  received_at timestamptz,
  carrier text,
  received_by text,
  condition_notes text,
  temperature numeric(6,2),
  quantity integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE (organization_id, code)
);

CREATE TABLE IF NOT EXISTS lab.sample_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES lab.organizations (id),
  sample_id uuid NOT NULL REFERENCES lab.samples (id),
  event_type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lab.analysis_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES lab.organizations (id),
  request_id uuid NOT NULL REFERENCES lab.client_requests (id),
  supplier_id uuid REFERENCES lab.suppliers (id),
  sample_id uuid REFERENCES lab.samples (id),
  expected_date date,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE TABLE IF NOT EXISTS lab.analysis_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES lab.organizations (id),
  request_id uuid NOT NULL REFERENCES lab.client_requests (id),
  sample_id uuid REFERENCES lab.samples (id),
  supplier_id uuid REFERENCES lab.suppliers (id),
  analysis_name text NOT NULL,
  value text,
  unit text,
  method text,
  uncertainty text,
  accreditation text,
  received_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE TABLE IF NOT EXISTS lab.result_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES lab.organizations (id),
  result_id uuid NOT NULL REFERENCES lab.analysis_results (id),
  version_number integer NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (result_id, version_number)
);

CREATE TABLE IF NOT EXISTS lab.result_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES lab.organizations (id),
  result_id uuid NOT NULL REFERENCES lab.analysis_results (id),
  level text NOT NULL,
  decision text NOT NULL,
  comment text,
  reviewer_id uuid REFERENCES auth.users (id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lab.report_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES lab.organizations (id),
  analysis_kind lab.analysis_kind NOT NULL,
  name text NOT NULL,
  storage_path text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE TABLE IF NOT EXISTS lab.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES lab.organizations (id),
  request_id uuid NOT NULL REFERENCES lab.client_requests (id),
  template_id uuid REFERENCES lab.report_templates (id),
  storage_path text,
  sent_at timestamptz,
  recipient text,
  delivery_status text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE TABLE IF NOT EXISTS lab.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES lab.organizations (id),
  assigned_to uuid REFERENCES auth.users (id),
  created_by uuid REFERENCES auth.users (id),
  priority text NOT NULL DEFAULT 'normal',
  status lab.task_status NOT NULL DEFAULT 'NOUVELLE',
  due_date date,
  entity_type text,
  entity_id uuid,
  title text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE TABLE IF NOT EXISTS lab.client_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES lab.organizations (id),
  client_id uuid REFERENCES lab.clients (id),
  request_id uuid REFERENCES lab.client_requests (id),
  invoice_number text NOT NULL,
  invoice_date date NOT NULL DEFAULT CURRENT_DATE,
  amount_total numeric(12,2) NOT NULL CHECK (amount_total >= 0),
  due_date date,
  status lab.invoice_status NOT NULL DEFAULT 'EN_ATTENTE',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE (organization_id, invoice_number)
);

CREATE TABLE IF NOT EXISTS lab.client_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES lab.organizations (id),
  invoice_id uuid NOT NULL REFERENCES lab.client_invoices (id),
  amount numeric(12,2) NOT NULL CHECK (amount > 0),
  paid_at date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lab.supplier_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES lab.organizations (id),
  supplier_id uuid NOT NULL REFERENCES lab.suppliers (id),
  invoice_number text NOT NULL,
  amount_total numeric(12,2) NOT NULL CHECK (amount_total >= 0),
  due_date date,
  status lab.invoice_status NOT NULL DEFAULT 'EN_ATTENTE',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE TABLE IF NOT EXISTS lab.supplier_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES lab.organizations (id),
  invoice_id uuid NOT NULL REFERENCES lab.supplier_invoices (id),
  amount numeric(12,2) NOT NULL CHECK (amount > 0),
  paid_at date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lab.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES lab.organizations (id),
  user_id uuid REFERENCES auth.users (id),
  title text NOT NULL,
  body text,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lab.email_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES lab.organizations (id),
  template_key text NOT NULL,
  recipient text NOT NULL,
  subject text NOT NULL,
  status text NOT NULL DEFAULT 'queued',
  provider text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lab.processed_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES lab.organizations (id),
  message_id text NOT NULL,
  processed_at timestamptz NOT NULL DEFAULT now(),
  classification lab.email_classification,
  related_entity_id uuid,
  UNIQUE (organization_id, message_id)
);

CREATE TABLE IF NOT EXISTS lab.files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES lab.organizations (id),
  bucket text NOT NULL,
  path text NOT NULL,
  mime_type text,
  size_bytes integer,
  entity_type text,
  entity_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lab.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES lab.organizations (id),
  user_id uuid REFERENCES auth.users (id),
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  old_value jsonb,
  new_value jsonb,
  ip inet,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lab.settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES lab.organizations (id) UNIQUE,
  penalty_percent_per_day numeric(6,3) NOT NULL DEFAULT 1 CHECK (penalty_percent_per_day >= 0),
  quote_followup_days integer NOT NULL DEFAULT 3,
  document_retention_days integer NOT NULL DEFAULT 365,
  sample_code_pattern text NOT NULL DEFAULT 'ECH-{seq}-{year}-{product}',
  otp_ttl_minutes integer NOT NULL DEFAULT 10,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lab.supplier_deadlines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES lab.organizations (id),
  request_id uuid NOT NULL REFERENCES lab.client_requests (id),
  supplier_id uuid NOT NULL REFERENCES lab.suppliers (id),
  expected_date date NOT NULL,
  actual_date date,
  delay_days integer,
  penalty_rate numeric(6,3),
  penalty_amount numeric(12,2),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_lab_members_user ON lab.organization_members (user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_lab_members_org ON lab.organization_members (organization_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_lab_clients_org ON lab.clients (organization_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_lab_requests_org_status ON lab.client_requests (organization_id, status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_lab_quotes_org ON lab.quotes (organization_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_lab_samples_org ON lab.samples (organization_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_lab_results_org ON lab.analysis_results (organization_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_lab_invoices_org ON lab.client_invoices (organization_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_lab_audit_org ON lab.audit_logs (organization_id, created_at DESC);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'organizations','profiles','organization_members','clients','client_contacts',
    'analyses','client_requests','request_items','suppliers','supplier_contacts',
    'supplier_capabilities','supplier_consultations','quotes','samples',
    'analysis_results','report_templates','reports','tasks','client_invoices',
    'supplier_invoices','settings','pricing_rules'
  ]
  LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS set_updated_at ON lab.%I; CREATE TRIGGER set_updated_at BEFORE UPDATE ON lab.%I FOR EACH ROW EXECUTE FUNCTION lab.set_updated_at();',
      t, t
    );
  END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- Sequences / dossier + quote numbers
-- ---------------------------------------------------------------------------

CREATE SEQUENCE IF NOT EXISTS lab.dossier_seq;
CREATE SEQUENCE IF NOT EXISTS lab.quote_seq;
CREATE SEQUENCE IF NOT EXISTS lab.sample_seq;

CREATE OR REPLACE FUNCTION lab.next_dossier_number()
RETURNS text
LANGUAGE sql
AS $$
  SELECT 'DOS-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('lab.dossier_seq')::text, 6, '0');
$$;

CREATE OR REPLACE FUNCTION lab.next_quote_number()
RETURNS text
LANGUAGE sql
AS $$
  SELECT 'DEV-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('lab.quote_seq')::text, 6, '0');
$$;

-- ---------------------------------------------------------------------------
-- Public request RPC
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION lab.submit_public_request(
  p_org_slug text,
  p_company_name text,
  p_contact_name text,
  p_email text,
  p_phone text,
  p_country_code text,
  p_product_name text,
  p_matrix text,
  p_sample_type text,
  p_sample_count integer,
  p_urgency text,
  p_deadline date,
  p_accreditation_required boolean,
  p_notes text,
  p_analyses text[]
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = lab, public
AS $$
DECLARE
  v_org uuid;
  v_id uuid;
  v_name text;
BEGIN
  IF p_phone IS NULL OR p_phone !~ '^[0-9]{8,15}$' THEN
    RAISE EXCEPTION 'invalid_phone';
  END IF;
  IF p_email IS NULL OR p_email !~* '^[^@]+@[^@]+\.[^@]+$' THEN
    RAISE EXCEPTION 'invalid_email';
  END IF;
  IF p_sample_count IS NULL OR p_sample_count < 1 THEN
    RAISE EXCEPTION 'invalid_sample_count';
  END IF;

  SELECT id INTO v_org
  FROM lab.organizations
  WHERE slug = p_org_slug AND is_active AND deleted_at IS NULL;

  IF v_org IS NULL THEN
    RAISE EXCEPTION 'unknown_organization';
  END IF;

  INSERT INTO lab.client_requests (
    organization_id, dossier_number, company_name, contact_name, email, phone,
    country_code, product_name, matrix, sample_type, sample_count, urgency,
    deadline, accreditation_required, notes, status
  ) VALUES (
    v_org, lab.next_dossier_number(), p_company_name, p_contact_name, p_email, p_phone,
    COALESCE(p_country_code, '+212'), p_product_name, p_matrix, p_sample_type,
    p_sample_count, p_urgency, p_deadline, COALESCE(p_accreditation_required, false),
    p_notes, 'NEW_REQUEST'
  ) RETURNING id INTO v_id;

  IF p_analyses IS NOT NULL THEN
    FOREACH v_name IN ARRAY p_analyses LOOP
      IF length(trim(v_name)) > 0 THEN
        INSERT INTO lab.request_items (organization_id, request_id, analysis_name)
        VALUES (v_org, v_id, trim(v_name));
      END IF;
    END LOOP;
  END IF;

  INSERT INTO lab.audit_logs (organization_id, action, entity_type, entity_id, new_value)
  VALUES (v_org, 'request.create', 'client_requests', v_id, jsonb_build_object('email', p_email));

  RETURN v_id;
END;
$$;

GRANT EXECUTE ON FUNCTION lab.submit_public_request(
  text, text, text, text, text, text, text, text, text, integer, text, date, boolean, text, text[]
) TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'organizations','profiles','organization_members','clients','client_contacts',
    'analyses','client_requests','request_items','suppliers','supplier_contacts',
    'supplier_capabilities','supplier_prices','supplier_consultations',
    'supplier_consultation_items','supplier_responses','supplier_selection',
    'pricing_rules','quotes','quote_items','purchase_orders','samples',
    'sample_events','analysis_orders','analysis_results','result_versions',
    'result_reviews','report_templates','reports','tasks','client_invoices',
    'client_payments','supplier_invoices','supplier_payments','notifications',
    'email_messages','processed_emails','files','audit_logs','settings',
    'supplier_deadlines'
  ]
  LOOP
    EXECUTE format('ALTER TABLE lab.%I ENABLE ROW LEVEL SECURITY;', t);
  END LOOP;
END $$;

CREATE POLICY org_select ON lab.organizations
  FOR SELECT USING (is_active OR lab.can_access_org(id));

CREATE POLICY org_write ON lab.organizations
  FOR ALL USING (lab.is_super_admin())
  WITH CHECK (lab.is_super_admin());

CREATE POLICY profiles_self ON lab.profiles
  FOR SELECT USING (id = auth.uid() OR lab.is_super_admin());

CREATE POLICY profiles_update_self ON lab.profiles
  FOR UPDATE USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY profiles_insert_self ON lab.profiles
  FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY members_select ON lab.organization_members
  FOR SELECT USING (user_id = auth.uid() OR lab.can_access_org(organization_id));

CREATE POLICY members_write ON lab.organization_members
  FOR ALL USING (lab.has_lab_role(organization_id, ARRAY['SUPER_ADMIN','DIRECTION']::lab.member_role[]))
  WITH CHECK (lab.has_lab_role(organization_id, ARRAY['SUPER_ADMIN','DIRECTION']::lab.member_role[]));

-- Generic org isolation for staff tables
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'clients','client_contacts','analyses','request_items','suppliers',
    'supplier_contacts','supplier_capabilities','supplier_prices',
    'supplier_consultations','supplier_consultation_items','supplier_responses',
    'supplier_selection','pricing_rules','quote_items','purchase_orders',
    'samples','sample_events','analysis_orders','analysis_results',
    'result_versions','result_reviews','report_templates','reports','tasks',
    'client_invoices','client_payments','supplier_invoices','supplier_payments',
    'notifications','email_messages','processed_emails','files','settings',
    'supplier_deadlines'
  ]
  LOOP
    EXECUTE format(
      'CREATE POLICY %I_iso ON lab.%I FOR ALL USING (lab.can_access_org(organization_id)) WITH CHECK (lab.can_access_org(organization_id));',
      t, t
    );
  END LOOP;
END $$;

CREATE POLICY requests_staff ON lab.client_requests
  FOR ALL USING (
    lab.can_access_org(organization_id)
    AND (
      lab.client_id_for(organization_id) IS NULL
      OR client_id = lab.client_id_for(organization_id)
      OR email = (SELECT email FROM lab.profiles WHERE id = auth.uid())
    )
  )
  WITH CHECK (lab.can_access_org(organization_id));

CREATE POLICY quotes_staff ON lab.quotes
  FOR ALL USING (
    lab.can_access_org(organization_id)
    AND (
      lab.client_id_for(organization_id) IS NULL
      OR client_id = lab.client_id_for(organization_id)
    )
  )
  WITH CHECK (lab.can_access_org(organization_id));

CREATE POLICY audit_select ON lab.audit_logs
  FOR SELECT USING (lab.can_access_org(organization_id) OR lab.is_super_admin());

CREATE POLICY audit_insert ON lab.audit_logs
  FOR INSERT WITH CHECK (lab.can_access_org(organization_id) OR organization_id IS NULL);

GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA lab TO authenticated;
GRANT SELECT ON lab.organizations TO anon;
GRANT INSERT ON lab.audit_logs TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA lab TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- Storage buckets (private)
-- ---------------------------------------------------------------------------

INSERT INTO storage.buckets (id, name, public)
VALUES
  ('lab-client-documents', 'lab-client-documents', false),
  ('lab-supplier-documents', 'lab-supplier-documents', false),
  ('lab-purchase-orders', 'lab-purchase-orders', false),
  ('lab-samples', 'lab-samples', false),
  ('lab-results', 'lab-results', false),
  ('lab-reports', 'lab-reports', false),
  ('lab-invoices', 'lab-invoices', false)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Seed Elitech
-- ---------------------------------------------------------------------------

INSERT INTO lab.organizations (name, slug, email, city, country)
VALUES ('Elitech Holding', 'elitech', 'zineb@laboratoire.ma', 'Casablanca', 'MA')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO lab.pricing_rules (organization_id, name, margin_percent, is_active)
SELECT id, 'default', 30, true FROM lab.organizations WHERE slug = 'elitech'
AND NOT EXISTS (
  SELECT 1 FROM lab.pricing_rules pr
  WHERE pr.organization_id = lab.organizations.id AND pr.name = 'default'
);

INSERT INTO lab.settings (organization_id)
SELECT id FROM lab.organizations WHERE slug = 'elitech'
ON CONFLICT (organization_id) DO NOTHING;

INSERT INTO lab.report_templates (organization_id, analysis_kind, name)
SELECT id, 'PHYSICO_CHIMIQUE', 'Rapport physico-chimique'
FROM lab.organizations WHERE slug = 'elitech'
AND NOT EXISTS (
  SELECT 1 FROM lab.report_templates t
  WHERE t.organization_id = lab.organizations.id AND t.analysis_kind = 'PHYSICO_CHIMIQUE'
);

INSERT INTO lab.report_templates (organization_id, analysis_kind, name)
SELECT id, 'MICROBIOLOGIQUE', 'Rapport microbiologique'
FROM lab.organizations WHERE slug = 'elitech'
AND NOT EXISTS (
  SELECT 1 FROM lab.report_templates t
  WHERE t.organization_id = lab.organizations.id AND t.analysis_kind = 'MICROBIOLOGIQUE'
);
