-- Quote send / follow-up + public supplier offer RPC

ALTER TABLE lab.quotes
  ADD COLUMN IF NOT EXISTS followup_due_at timestamptz,
  ADD COLUMN IF NOT EXISTS followup_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS survey_token uuid UNIQUE DEFAULT gen_random_uuid();

CREATE TABLE IF NOT EXISTS lab.quote_survey_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES lab.organizations (id),
  quote_id uuid NOT NULL REFERENCES lab.quotes (id),
  received boolean NOT NULL,
  price_ok boolean NOT NULL,
  delay_ok boolean NOT NULL,
  price_too_high boolean NOT NULL,
  comment text,
  creates_price_alert boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lab_quote_survey_org ON lab.quote_survey_responses (organization_id);

ALTER TABLE lab.quote_survey_responses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS quote_survey_iso ON lab.quote_survey_responses;
CREATE POLICY quote_survey_iso ON lab.quote_survey_responses
  FOR ALL USING (lab.can_access_org(organization_id))
  WITH CHECK (lab.can_access_org(organization_id));

GRANT SELECT, INSERT ON lab.quote_survey_responses TO authenticated;

CREATE OR REPLACE FUNCTION lab.get_consultation_invite(p_token uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = lab, public
AS $$
DECLARE
  v_row jsonb;
BEGIN
  SELECT jsonb_build_object(
    'token', i.token,
    'supplier_name', s.name,
    'request_id', c.request_id,
    'language', c.language
  )
  INTO v_row
  FROM lab.supplier_consultation_items i
  JOIN lab.supplier_consultations c ON c.id = i.consultation_id
  JOIN lab.suppliers s ON s.id = i.supplier_id
  WHERE i.token = p_token AND i.deleted_at IS NULL;

  IF v_row IS NULL THEN
    RAISE EXCEPTION 'invalid_token';
  END IF;
  RETURN v_row;
END;
$$;

CREATE OR REPLACE FUNCTION lab.submit_supplier_offer(
  p_token uuid,
  p_amount numeric,
  p_currency text,
  p_pricing_type text,
  p_turnaround_days integer,
  p_method text,
  p_accreditation text,
  p_quantity numeric,
  p_conditions text,
  p_valid_until date,
  p_notes text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = lab, public
AS $$
DECLARE
  v_item lab.supplier_consultation_items%ROWTYPE;
  v_id uuid;
BEGIN
  IF p_amount IS NULL OR p_amount < 0 THEN
    RAISE EXCEPTION 'invalid_amount';
  END IF;
  IF p_turnaround_days IS NULL OR p_turnaround_days < 1 THEN
    RAISE EXCEPTION 'invalid_delay';
  END IF;

  SELECT * INTO v_item
  FROM lab.supplier_consultation_items
  WHERE token = p_token AND deleted_at IS NULL;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'invalid_token';
  END IF;

  INSERT INTO lab.supplier_responses (
    organization_id, consultation_item_id, amount, currency, pricing_type,
    turnaround_days, method, accreditation, quantity, conditions, valid_until, notes
  ) VALUES (
    v_item.organization_id, v_item.id, p_amount, COALESCE(p_currency, 'EUR'),
    COALESCE(p_pricing_type, 'unit'), p_turnaround_days, p_method, p_accreditation,
    p_quantity, p_conditions, p_valid_until, p_notes
  ) RETURNING id INTO v_id;

  INSERT INTO lab.audit_logs (organization_id, action, entity_type, entity_id, new_value)
  VALUES (
    v_item.organization_id, 'supplier_offer.create', 'supplier_responses', v_id,
    jsonb_build_object('amount', p_amount, 'currency', p_currency)
  );

  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION lab.submit_quote_survey(
  p_token uuid,
  p_received boolean,
  p_price_ok boolean,
  p_delay_ok boolean,
  p_price_too_high boolean,
  p_comment text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = lab, public
AS $$
DECLARE
  v_quote lab.quotes%ROWTYPE;
  v_id uuid;
  v_alert boolean;
BEGIN
  SELECT * INTO v_quote FROM lab.quotes WHERE survey_token = p_token AND deleted_at IS NULL;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'invalid_token';
  END IF;

  v_alert := COALESCE(p_price_too_high, false) OR COALESCE(p_price_ok, true) = false;

  INSERT INTO lab.quote_survey_responses (
    organization_id, quote_id, received, price_ok, delay_ok, price_too_high, comment, creates_price_alert
  ) VALUES (
    v_quote.organization_id, v_quote.id, COALESCE(p_received, false), COALESCE(p_price_ok, true),
    COALESCE(p_delay_ok, true), COALESCE(p_price_too_high, false), p_comment, v_alert
  ) RETURNING id INTO v_id;

  IF v_alert THEN
    INSERT INTO lab.notifications (organization_id, title, body)
    VALUES (
      v_quote.organization_id,
      'Alerte prix devis',
      'Le client indique un prix trop élevé pour ' || v_quote.quote_number || '. Aucun changement automatique.'
    );
  END IF;

  RETURN v_id;
END;
$$;

GRANT EXECUTE ON FUNCTION lab.get_consultation_invite(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION lab.submit_supplier_offer(uuid, numeric, text, text, integer, text, text, numeric, text, date, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION lab.submit_quote_survey(uuid, boolean, boolean, boolean, boolean, text) TO anon, authenticated;
