-- Contacts démo pour Mes scans / fiche contact (APK visiteur@sib.com)
-- Crée connexions + leads stand + profils enrichis (compatible RPC get_networking_contact_profiles)

DO $$
DECLARE
  v_visitor   uuid;
  v_exhibitor uuid;
  v_partner   uuid;
  v_rec       record;
  v_i         int := 0;
  v_statuses  text[] := ARRAY['accepted', 'pending', 'accepted', 'pending', 'accepted'];
  v_salon_id  text := 'sib';
  v_salon_name text := 'SIB 2026 · El Jadida';
BEGIN
  -- Visiteur APK (quick-login) ou comptes démo alternatifs
  SELECT u.id INTO v_visitor
  FROM auth.users u
  WHERE lower(u.email) IN (
    'visiteur@sib.com',
    'demo.visitor@sib.com',
    'visitor-free@test.sib2026.ma',
    'visiteur@sib2026.test'
  )
  ORDER BY CASE lower(u.email)
    WHEN 'visiteur@sib.com' THEN 1
    WHEN 'demo.visitor@sib.com' THEN 2
    ELSE 3
  END
  LIMIT 1;

  IF v_visitor IS NULL THEN
    RAISE NOTICE 'seed_visitor_demo_contacts: aucun visiteur démo — ignoré';
    RETURN;
  END IF;

  SELECT id INTO v_exhibitor FROM auth.users WHERE lower(email) = 'exposant@sib.com' LIMIT 1;
  SELECT id INTO v_partner   FROM auth.users WHERE lower(email) = 'partenaire@sib.com' LIMIT 1;

  -- Profil visiteur
  INSERT INTO public.users (id, email, name, type, visitor_level, status, profile)
  SELECT u.id, lower(u.email), 'Youssef Alami', 'visitor', 'free', 'active',
    jsonb_build_object(
      'company', 'Alami BTP & Rénovation',
      'job_title', 'Ingénieur travaux',
      'phone', '+212600112233'
    )
  FROM auth.users u WHERE u.id = v_visitor
  ON CONFLICT (id) DO UPDATE SET
    name = COALESCE(NULLIF(public.users.name, ''), EXCLUDED.name),
    type = COALESCE(public.users.type, EXCLUDED.type),
    visitor_level = COALESCE(public.users.visitor_level, EXCLUDED.visitor_level),
    status = COALESCE(public.users.status, EXCLUDED.status),
    profile = COALESCE(public.users.profile, '{}'::jsonb) || EXCLUDED.profile;

  -- Exposant principal
  IF v_exhibitor IS NOT NULL THEN
    INSERT INTO public.users (id, email, name, type, status, profile)
    SELECT u.id, lower(u.email), 'Hassan Benjelloun', 'exhibitor', 'active',
      jsonb_build_object(
        'company', 'BatiTech Maroc',
        'job_title', 'Directeur commercial',
        'phone', '+212655443322'
      )
    FROM auth.users u WHERE u.id = v_exhibitor
    ON CONFLICT (id) DO UPDATE SET
      name = COALESCE(NULLIF(public.users.name, ''), EXCLUDED.name),
      profile = COALESCE(public.users.profile, '{}'::jsonb) || EXCLUDED.profile;

    INSERT INTO public.exhibitors (
      user_id, company_name, category, sector, description,
      stand_number, hall_number, is_published, verified, featured
    )
    SELECT
      v_exhibitor,
      'BatiTech Maroc',
      'materials',
      'Bâtiment & Travaux Publics',
      'Solutions isolation thermique et façades ventilées pour le BTP marocain.',
      'A-12', 'Hall 1', true, true, true
    WHERE NOT EXISTS (SELECT 1 FROM public.exhibitors e WHERE e.user_id = v_exhibitor);

    UPDATE public.exhibitors SET
      company_name = 'BatiTech Maroc',
      sector = 'Bâtiment & Travaux Publics',
      stand_number = 'A-12',
      hall_number = 'Hall 1',
      is_published = true,
      verified = true
    WHERE user_id = v_exhibitor;

    INSERT INTO public.connections (requester_id, addressee_id, status, message, salon_id, salon_name, created_at)
    VALUES (
      v_visitor, v_exhibitor, 'accepted',
      'Rencontré au stand A-12 — projet isolation Rabat',
      v_salon_id, v_salon_name, now() - interval '2 days'
    )
    ON CONFLICT (requester_id, addressee_id) DO UPDATE SET
      status = 'accepted',
      salon_id = COALESCE(public.connections.salon_id, EXCLUDED.salon_id),
      salon_name = COALESCE(public.connections.salon_name, EXCLUDED.salon_name);

    INSERT INTO public.exhibitor_leads (exhibitor_user_id, visitor_user_id, salon_id, salon_name, scanned_at)
    SELECT v_exhibitor, v_visitor, v_salon_id, v_salon_name, now() - interval '3 hours'
    WHERE NOT EXISTS (
      SELECT 1 FROM public.exhibitor_leads el
      WHERE el.exhibitor_user_id = v_exhibitor AND el.visitor_user_id = v_visitor
    );
  END IF;

  -- Partenaire
  IF v_partner IS NOT NULL THEN
    INSERT INTO public.users (id, email, name, type, status, profile)
    SELECT u.id, lower(u.email), 'Nadia Berrada', 'partner', 'active',
      jsonb_build_object(
        'company', 'Urbacom Partenaires',
        'job_title', 'Responsable partenariats',
        'phone', '+212677889900'
      )
    FROM auth.users u WHERE u.id = v_partner
    ON CONFLICT (id) DO UPDATE SET
      name = COALESCE(NULLIF(public.users.name, ''), EXCLUDED.name),
      profile = COALESCE(public.users.profile, '{}'::jsonb) || EXCLUDED.profile;

    INSERT INTO public.connections (requester_id, addressee_id, status, message, salon_id, salon_name, created_at)
    VALUES (
      v_visitor, v_partner, 'pending',
      'Intéressé par votre programme partenaires SIB 2026',
      v_salon_id, v_salon_name, now() - interval '1 day'
    )
    ON CONFLICT (requester_id, addressee_id) DO UPDATE SET
      salon_id = COALESCE(public.connections.salon_id, EXCLUDED.salon_id),
      salon_name = COALESCE(public.connections.salon_name, EXCLUDED.salon_name);
  END IF;

  -- Contacts démo supplémentaires (créés par scripts/seed-apk-demo-contacts.mjs)
  FOR v_rec IN
    SELECT u.id, lower(u.email) AS email
    FROM auth.users u
    WHERE lower(u.email) IN (
      'demo.contact1@sib.com',
      'demo.contact2@sib.com',
      'demo.contact3@sib.com'
    )
  LOOP
    IF v_rec.id = v_visitor THEN CONTINUE; END IF;

    IF v_rec.email = 'demo.contact1@sib.com' THEN
      INSERT INTO public.users (id, email, name, type, visitor_level, status, profile)
      VALUES (v_rec.id, v_rec.email, 'Fatima El Amrani', 'visitor', 'premium', 'active',
        '{"company":"Atlas Construction","job_title":"Chef de projet","phone":"+212612345678"}'::jsonb)
      ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, profile = EXCLUDED.profile;
    ELSIF v_rec.email = 'demo.contact2@sib.com' THEN
      INSERT INTO public.users (id, email, name, type, status, profile)
      VALUES (v_rec.id, v_rec.email, 'Karim Tazi', 'exhibitor', 'active',
        '{"company":"EcoBati Solutions","job_title":"CEO","phone":"+212698765432"}'::jsonb)
      ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, profile = EXCLUDED.profile;

      INSERT INTO public.exhibitors (
        user_id, company_name, category, sector, description,
        stand_number, hall_number, is_published, verified
      )
      SELECT v_rec.id, 'EcoBati Solutions', 'materials', 'Matériaux écologiques',
        'Exposant démo SIB 2026', 'B-07', 'Hall 2', true, true
      WHERE NOT EXISTS (SELECT 1 FROM public.exhibitors e WHERE e.user_id = v_rec.id);

      UPDATE public.exhibitors SET
        company_name = 'EcoBati Solutions',
        stand_number = 'B-07',
        hall_number = 'Hall 2',
        is_published = true,
        verified = true
      WHERE user_id = v_rec.id;
    ELSIF v_rec.email = 'demo.contact3@sib.com' THEN
      INSERT INTO public.users (id, email, name, type, status, profile)
      VALUES (v_rec.id, v_rec.email, 'Sofia Laurent', 'partner', 'active',
        '{"company":"MedBuild Partners","job_title":"Directrice développement","phone":"+212611223344"}'::jsonb)
      ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, profile = EXCLUDED.profile;
    END IF;

    INSERT INTO public.connections (requester_id, addressee_id, status, message, salon_id, salon_name, created_at)
    VALUES (
      v_visitor, v_rec.id,
      CASE v_rec.email
        WHEN 'demo.contact1@sib.com' THEN 'accepted'
        WHEN 'demo.contact2@sib.com' THEN 'accepted'
        ELSE 'pending'
      END,
      'Contact démo SIB 2026',
      v_salon_id, v_salon_name,
      now() - (v_i || ' hours')::interval
    )
    ON CONFLICT (requester_id, addressee_id) DO UPDATE SET
      status = EXCLUDED.status,
      salon_id = COALESCE(public.connections.salon_id, EXCLUDED.salon_id),
      salon_name = COALESCE(public.connections.salon_name, EXCLUDED.salon_name);

    IF v_rec.email = 'demo.contact2@sib.com' THEN
      INSERT INTO public.exhibitor_leads (exhibitor_user_id, visitor_user_id, salon_id, salon_name, scanned_at)
      SELECT v_rec.id, v_visitor, v_salon_id, v_salon_name, now() - interval '5 hours'
      WHERE NOT EXISTS (
        SELECT 1 FROM public.exhibitor_leads el
        WHERE el.exhibitor_user_id = v_rec.id AND el.visitor_user_id = v_visitor
      );
    END IF;

    v_i := v_i + 1;
  END LOOP;

  -- Connexions additionnelles avec autres comptes actifs (max 5)
  v_i := 0;
  FOR v_rec IN
    SELECT u.id, u.type, u.name, u.email
    FROM public.users u
    WHERE u.id <> v_visitor
      AND u.id IS NOT NULL
      AND u.type IN ('exhibitor', 'partner', 'visitor')
      AND COALESCE(u.status, 'active') IN ('active', 'confirmed')
      AND u.id NOT IN (
        SELECT addressee_id FROM public.connections WHERE requester_id = v_visitor
        UNION
        SELECT requester_id FROM public.connections WHERE addressee_id = v_visitor
      )
    ORDER BY u.updated_at DESC NULLS LAST, u.created_at DESC
    LIMIT 5
  LOOP
    v_i := v_i + 1;
    INSERT INTO public.connections (requester_id, addressee_id, status, message, salon_id, salon_name, created_at)
    VALUES (
      v_rec.id, v_visitor,
      v_statuses[1 + ((v_i - 1) % array_length(v_statuses, 1))],
      'Networking SIB 2026',
      v_salon_id, v_salon_name,
      now() - (v_i || ' days')::interval
    )
    ON CONFLICT (requester_id, addressee_id) DO UPDATE SET
      salon_id = COALESCE(public.connections.salon_id, EXCLUDED.salon_id),
      salon_name = COALESCE(public.connections.salon_name, EXCLUDED.salon_name);

    UPDATE public.users SET profile = COALESCE(profile, '{}'::jsonb) || jsonb_build_object(
      'company', COALESCE(profile->>'company', CASE v_rec.type
        WHEN 'exhibitor' THEN 'Entreprise exposant ' || v_i
        WHEN 'partner' THEN 'Partenaire SIB ' || v_i
        ELSE 'Visiteur pro ' || v_i
      END),
      'job_title', COALESCE(profile->>'job_title', 'Contact BTP'),
      'phone', COALESCE(profile->>'phone', '+212600000' || lpad(v_i::text, 3, '0'))
    )
    WHERE id = v_rec.id AND (profile IS NULL OR profile = '{}'::jsonb OR profile->>'company' IS NULL);
  END LOOP;

  RAISE NOTICE 'seed_visitor_demo_contacts: OK pour visiteur %', v_visitor;
END $$;
