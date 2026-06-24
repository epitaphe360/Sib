-- Vérification email collaborateur (contourne RLS — contrainte UNIQUE globale sur email)
CREATE OR REPLACE FUNCTION public.resolve_stand_collaborator_email(
  p_email text,
  p_owner_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.stand_collaborators%ROWTYPE;
BEGIN
  SELECT * INTO v_row
  FROM public.stand_collaborators
  WHERE lower(email) = lower(trim(p_email))
  LIMIT 1;

  IF v_row.id IS NULL THEN
    RETURN jsonb_build_object('found', false);
  END IF;

  RETURN jsonb_build_object(
    'found', true,
    'id', v_row.id,
    'owner_id', v_row.owner_id,
    'status', v_row.status,
    'same_owner', v_row.owner_id = p_owner_id
  );
END;
$$;

REVOKE ALL ON FUNCTION public.resolve_stand_collaborator_email(text, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.resolve_stand_collaborator_email(text, uuid) TO authenticated, service_role;
