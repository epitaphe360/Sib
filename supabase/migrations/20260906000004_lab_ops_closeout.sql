ALTER TABLE lab.analysis_orders
  ADD COLUMN IF NOT EXISTS po_number text,
  ADD COLUMN IF NOT EXISTS language text NOT NULL DEFAULT 'en';

ALTER TABLE lab.analysis_results
  ADD COLUMN IF NOT EXISTS ai_summary text,
  ADD COLUMN IF NOT EXISTS correction_due_at timestamptz;

ALTER TABLE lab.settings
  ADD COLUMN IF NOT EXISTS correction_hours integer NOT NULL DEFAULT 6;

CREATE TABLE IF NOT EXISTS lab.backup_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES lab.organizations (id),
  kind text NOT NULL DEFAULT 'weekly_drive',
  status text NOT NULL DEFAULT 'planned',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE lab.backup_runs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS backup_runs_iso ON lab.backup_runs;
CREATE POLICY backup_runs_iso ON lab.backup_runs
  FOR ALL USING (lab.can_access_org(organization_id))
  WITH CHECK (lab.can_access_org(organization_id));

GRANT SELECT, INSERT, UPDATE ON lab.backup_runs TO authenticated;

CREATE SEQUENCE IF NOT EXISTS lab.invoice_seq;
CREATE SEQUENCE IF NOT EXISTS lab.supplier_po_seq;

CREATE OR REPLACE FUNCTION lab.next_invoice_number()
RETURNS text LANGUAGE sql AS $$
  SELECT 'FAC-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('lab.invoice_seq')::text, 6, '0');
$$;

CREATE OR REPLACE FUNCTION lab.next_supplier_po()
RETURNS text LANGUAGE sql AS $$
  SELECT 'PO-SUP-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('lab.supplier_po_seq')::text, 6, '0');
$$;

GRANT USAGE, SELECT ON SEQUENCE lab.invoice_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE lab.supplier_po_seq TO authenticated;
GRANT EXECUTE ON FUNCTION lab.next_invoice_number() TO authenticated;
GRANT EXECUTE ON FUNCTION lab.next_supplier_po() TO authenticated;
