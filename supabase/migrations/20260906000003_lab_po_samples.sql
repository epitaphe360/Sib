ALTER TABLE lab.purchase_orders
  ADD COLUMN IF NOT EXISTS client_name text,
  ADD COLUMN IF NOT EXISTS analyses text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS mismatch_details jsonb NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS correction_sent_at timestamptz;

ALTER TABLE lab.samples
  ADD COLUMN IF NOT EXISTS observation text;

CREATE OR REPLACE FUNCTION lab.next_sample_codes(
  p_org uuid,
  p_product text,
  p_count integer,
  p_pattern text DEFAULT 'ECH-{seq}-{year}-{product}'
)
RETURNS text[]
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = lab, public
AS $$
DECLARE
  v_codes text[] := '{}';
  v_i integer;
  v_seq bigint;
  v_product text;
  v_code text;
  v_year text := to_char(now(), 'YYYY');
BEGIN
  IF NOT lab.can_access_org(p_org) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  IF p_count IS NULL OR p_count < 1 OR p_count > 200 THEN
    RAISE EXCEPTION 'invalid_count';
  END IF;

  v_product := upper(regexp_replace(coalesce(p_product, 'PRODUIT'), '[^A-Za-z0-9]+', '-', 'g'));
  v_product := trim(both '-' from v_product);
  IF v_product = '' THEN
    v_product := 'PRODUIT';
  END IF;
  v_product := left(v_product, 24);

  FOR v_i IN 1..p_count LOOP
    v_seq := nextval('lab.sample_seq');
    v_code := replace(replace(replace(coalesce(p_pattern, 'ECH-{seq}-{year}-{product}'),
      '{seq}', lpad(v_seq::text, 6, '0')),
      '{year}', v_year),
      '{product}', v_product);
    v_codes := array_append(v_codes, v_code);
  END LOOP;

  RETURN v_codes;
END;
$$;

GRANT EXECUTE ON FUNCTION lab.next_sample_codes(uuid, text, integer, text) TO authenticated;
