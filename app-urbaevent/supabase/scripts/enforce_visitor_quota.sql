-- Enforce visitor appointment quotas at DB level
-- This trigger prevents inserting or updating an appointment to 'confirmed' when the visitor already
-- has reached the allowed number of confirmed appointments for their visitor_level.

CREATE OR REPLACE FUNCTION public.check_visitor_quota()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_level text;
  v_quota int := 0;
  confirmed_count int := 0;
BEGIN
  -- Only enforce when status becomes 'confirmed'
  IF (TG_OP = 'INSERT' AND NEW.status = 'confirmed') OR
     (TG_OP = 'UPDATE' AND NEW.status = 'confirmed' AND (OLD.status IS DISTINCT FROM 'confirmed')) THEN

    SELECT visitor_level INTO v_level FROM public.users WHERE id = NEW.visitor_id;
    IF v_level IS NULL OR v_level = '' THEN
      v_level := 'free';
    END IF;

    -- Map quotas (should match frontend config)
    v_quota := CASE v_level
      WHEN 'free' THEN 0
      WHEN 'basic' THEN 2
      WHEN 'premium' THEN 5
      WHEN 'vip' THEN 9999
      ELSE 0
    END;

    SELECT COUNT(*) INTO confirmed_count FROM public.appointments
      WHERE visitor_id = NEW.visitor_id AND status = 'confirmed';

    IF confirmed_count >= v_quota THEN
      RAISE EXCEPTION 'Quota RDV atteint pour votre niveau (%).', v_level;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Attach trigger to appointments table for INSERT and UPDATE
DROP TRIGGER IF EXISTS trigger_check_visitor_quota ON public.appointments;
CREATE TRIGGER trigger_check_visitor_quota
  BEFORE INSERT OR UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.check_visitor_quota();
