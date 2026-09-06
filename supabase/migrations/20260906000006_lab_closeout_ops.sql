-- Close remaining plan items: first admin, invites, inbound RPC, storage RLS.

CREATE TABLE IF NOT EXISTS lab.member_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES lab.organizations (id),
  email text NOT NULL,
  role lab.member_role NOT NULL,
  invited_by uuid REFERENCES auth.users (id),
  accepted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, email)
);

ALTER TABLE lab.member_invites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS member_invites_iso ON lab.member_invites;
CREATE POLICY member_invites_iso ON lab.member_invites
  FOR ALL USING (lab.can_access_org(organization_id))
  WITH CHECK (lab.can_access_org(organization_id));

GRANT SELECT, INSERT, UPDATE ON lab.member_invites TO authenticated;

CREATE OR REPLACE FUNCTION lab.claim_first_admin()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = lab, public
AS $$
DECLARE
  org uuid;
  uid uuid := auth.uid();
  mail text;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;
  IF EXISTS (
    SELECT 1 FROM lab.organization_members
    WHERE role = 'SUPER_ADMIN' AND deleted_at IS NULL
  ) THEN
    RETURN NULL;
  END IF;
  SELECT id INTO org FROM lab.organizations WHERE slug = 'elitech' AND deleted_at IS NULL;
  IF org IS NULL THEN
    RAISE EXCEPTION 'org elitech missing';
  END IF;
  SELECT email INTO mail FROM auth.users WHERE id = uid;
  INSERT INTO lab.profiles (id, email) VALUES (uid, COALESCE(mail, ''))
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
  INSERT INTO lab.organization_members (organization_id, user_id, role)
  VALUES (org, uid, 'SUPER_ADMIN')
  ON CONFLICT (organization_id, user_id) DO UPDATE SET role = 'SUPER_ADMIN', deleted_at = NULL;
  RETURN org;
END;
$$;

CREATE OR REPLACE FUNCTION lab.accept_invite()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = lab, public
AS $$
DECLARE
  uid uuid := auth.uid();
  mail text;
  inv lab.member_invites;
BEGIN
  IF uid IS NULL THEN
    RETURN NULL;
  END IF;
  SELECT email INTO mail FROM auth.users WHERE id = uid;
  IF mail IS NULL THEN
    RETURN NULL;
  END IF;
  SELECT * INTO inv FROM lab.member_invites
  WHERE lower(email) = lower(mail) AND accepted_at IS NULL
  ORDER BY created_at ASC LIMIT 1;
  IF inv.id IS NULL THEN
    RETURN NULL;
  END IF;
  INSERT INTO lab.profiles (id, email) VALUES (uid, mail)
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
  INSERT INTO lab.organization_members (organization_id, user_id, role)
  VALUES (inv.organization_id, uid, inv.role)
  ON CONFLICT (organization_id, user_id) DO UPDATE SET role = EXCLUDED.role, deleted_at = NULL;
  UPDATE lab.member_invites SET accepted_at = now() WHERE id = inv.id;
  RETURN inv.organization_id;
END;
$$;

CREATE OR REPLACE FUNCTION lab.process_inbound_email(
  p_org_slug text,
  p_message_id text,
  p_subject text,
  p_body text
)
RETURNS lab.email_classification
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = lab, public
AS $$
DECLARE
  org uuid;
  kind lab.email_classification := 'OTHER';
  txt text := lower(concat_ws(' ', p_subject, p_body));
BEGIN
  SELECT id INTO org FROM lab.organizations WHERE slug = p_org_slug AND is_active AND deleted_at IS NULL;
  IF org IS NULL THEN
    RAISE EXCEPTION 'org not found';
  END IF;
  IF txt ~ 'purchase order|bon de commande|bdc|bc[- ]*[0-9]' THEN
    kind := 'PURCHASE_ORDER';
  ELSIF txt ~ 'quote|devis|rfq' THEN
    kind := 'QUOTE_REPLY';
  ELSIF txt ~ 'report|rapport|certificate' THEN
    kind := 'REPORT';
  END IF;
  INSERT INTO lab.processed_emails (organization_id, message_id, classification)
  VALUES (org, p_message_id, kind)
  ON CONFLICT (organization_id, message_id) DO NOTHING;
  RETURN kind;
END;
$$;

GRANT EXECUTE ON FUNCTION lab.claim_first_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION lab.accept_invite() TO authenticated;
GRANT EXECUTE ON FUNCTION lab.process_inbound_email(text, text, text, text) TO service_role;

DROP POLICY IF EXISTS lab_objects_select ON storage.objects;
DROP POLICY IF EXISTS lab_objects_insert ON storage.objects;
DROP POLICY IF EXISTS lab_objects_update ON storage.objects;

CREATE POLICY lab_objects_select ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id LIKE 'lab-%'
    AND lab.can_access_org((split_part(name, '/', 1))::uuid)
  );

CREATE POLICY lab_objects_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id LIKE 'lab-%'
    AND lab.can_access_org((split_part(name, '/', 1))::uuid)
    AND octet_length(name) < 512
  );

CREATE POLICY lab_objects_update ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id LIKE 'lab-%'
    AND lab.can_access_org((split_part(name, '/', 1))::uuid)
  );
