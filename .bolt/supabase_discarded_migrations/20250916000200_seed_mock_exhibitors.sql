-- Idempotent seed: Create a few mock exhibitors and matching users if they do not already exist
-- Safe to run multiple times. Uses gen_random_uuid() where needed (pgcrypto available in Supabase).

BEGIN;

DO $$
DECLARE
  dataset JSONB;
  elem JSONB;
  v_user_id UUID;
  v_exhibitor_id UUID;
BEGIN
  -- If there are already exhibitors, skip seeding (safe guard)
  IF (SELECT COUNT(*) FROM public.exhibitors) > 0 THEN
    RAISE NOTICE 'Skipping seed: exhibitors table already contains rows.';
    RETURN;
  END IF;

  -- Define mock dataset
  dataset := '[
    {
      "company_name": "Port Solutions Inc.",
      "email": "contact@portsolutions.com",
      "category": "port-operations",
      "sector": "Port Management",
      "description": "Leading provider of integrated port management solutions.",
      "logo_url": "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg",
      "website": "https://portsolutions.com",
      "verified": true,
      "featured": true,
      "contact_info": { "email": "contact@portsolutions.com", "phone": "+33123456789", "city": "Le Havre", "country": "France" }
    },
    {
      "company_name": "Maritime Tech Solutions",
      "email": "contact@maritimetech.com",
      "category": "port-industry",
      "sector": "Equipment Manufacturing",
      "description": "Innovative manufacturer of port equipment and automation systems.",
      "logo_url": "https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg",
      "website": "https://maritimetech.com",
      "verified": true,
      "featured": false,
      "contact_info": { "email": "contact@maritimetech.com", "phone": "+33123456789", "city": "Marseille", "country": "France" }
    },
    {
      "company_name": "Global Port Authority",
      "email": "contact@globalportauthority.org",
      "category": "institutional",
      "sector": "Government",
      "description": "International organization promoting sustainable port development.",
      "logo_url": "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg",
      "website": "https://globalportauthority.org",
      "verified": true,
      "featured": true,
      "contact_info": { "email": "contact@globalportauthority.org", "phone": "+33123456789", "city": "Paris", "country": "France" }
    }
  ]'::jsonb;

  FOR elem IN SELECT * FROM jsonb_array_elements(dataset) LOOP

    -- Ensure a user exists for the exhibitor email. If no email present, generate a new user id.
    IF (elem->>'email') IS NOT NULL THEN
      SELECT id INTO v_user_id FROM public.users WHERE email = (elem->>'email') LIMIT 1;
      IF v_user_id IS NULL THEN
        INSERT INTO public.users (id, email, name, type, profile, created_at, updated_at)
        VALUES (gen_random_uuid(), elem->>'email', elem->>'company_name', 'exhibitor', '{}'::jsonb, now(), now())
        RETURNING id INTO v_user_id;
      END IF;
    ELSE
      v_user_id := gen_random_uuid();
      INSERT INTO public.users (id, email, name, type, profile, created_at, updated_at)
      VALUES (v_user_id, NULL, elem->>'company_name', 'exhibitor', '{}'::jsonb, now(), now())
      ON CONFLICT (id) DO NOTHING;
    END IF;

    -- Insert exhibitor if not exists (by user_id + company_name guard)
    SELECT id INTO v_exhibitor_id FROM public.exhibitors WHERE user_id = v_user_id LIMIT 1;
    IF v_exhibitor_id IS NULL THEN
      INSERT INTO public.exhibitors (id, user_id, company_name, category, sector, description, logo_url, website, verified, featured, contact_info, created_at, updated_at)
      VALUES (
        gen_random_uuid(),
        v_user_id,
        elem->>'company_name',
        (elem->>'category')::exhibitor_category,
        elem->>'sector',
        elem->>'description',
        elem->>'logo_url',
        elem->>'website',
        (elem->>'verified')::boolean,
        (elem->>'featured')::boolean,
        COALESCE(elem->'contact_info','{}'::jsonb),
        now(), now()
      );
    END IF;

  END LOOP;
END$$;

COMMIT;

-- Notes:
--  - Run this file in Supabase SQL editor if you want a quick demo dataset without using the Node importer.
--  - This script is intentionally guarded: it skips seeding when exhibitor rows already exist.
