-- =====================================================================
-- SEED DEMO : Partenaires BTP pour le Salon International du Bâtiment
-- Date       : 2026-04-28
-- Thème      : Matériaux, Construction, Financement Immobilier, BTP
-- Niveaux    : platinium · gold · silver · institutional
-- =====================================================================
-- Mots de passe demo : Partner2026!
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ─────────────────────────────────────────────────────────────────────
-- 0. DÉSACTIVER LES TRIGGERS QUI BLOQUENT LES SEEDS ADMIN
--    (auth.uid() est NULL en SQL Editor → is_admin = FALSE → trigger bloque)
--    On les réactive à la fin du script.
-- ─────────────────────────────────────────────────────────────────────
ALTER TABLE public.partner_profiles DISABLE TRIGGER USER;
ALTER TABLE public.partners         DISABLE TRIGGER USER;

-- ─────────────────────────────────────────────────────────────────────
-- 1. AUTH.USERS  (nécessaire avant public.users)
-- ─────────────────────────────────────────────────────────────────────
DO $$
DECLARE
  v_pwd text := crypt('Partner2026!', gen_salt('bf'));
  v_partners RECORD;
BEGIN
  FOR v_partners IN
    SELECT * FROM (VALUES
      ('00000000-0000-0000-0000-000000000020', 'lafarge-holcim@sib2026.ma'),
      ('00000000-0000-0000-0000-000000000021', 'saint-gobain@sib2026.ma'),
      ('00000000-0000-0000-0000-000000000022', 'vinci-construction@sib2026.ma'),
      ('00000000-0000-0000-0000-000000000023', 'addoha-groupe@sib2026.ma'),
      ('00000000-0000-0000-0000-000000000024', 'cih-bank@sib2026.ma'),
      ('00000000-0000-0000-0000-000000000025', 'knauf-maroc@sib2026.ma'),
      ('00000000-0000-0000-0000-000000000026', 'sonasid@sib2026.ma'),
      ('00000000-0000-0000-0000-000000000027', 'technal-maroc@sib2026.ma'),
      ('00000000-0000-0000-0000-000000000028', 'bmce-bank@sib2026.ma'),
      ('00000000-0000-0000-0000-000000000029', 'isover-maroc@sib2026.ma')
    ) AS t(id, email)
  LOOP
    -- Supprimer les doublons email/id en conflict
    DELETE FROM public.users WHERE email = v_partners.email AND id <> v_partners.id::uuid;
    DELETE FROM auth.users  WHERE email = v_partners.email AND id <> v_partners.id::uuid;

    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = v_partners.id::uuid) THEN
      INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, aud, role)
      VALUES (
        v_partners.id::uuid,
        v_partners.email,
        v_pwd,
        NOW(), NOW(), NOW(),
        'authenticated', 'authenticated'
      );
    END IF;
  END LOOP;
END $$;

-- ─────────────────────────────────────────────────────────────────────
-- 2. PUBLIC.USERS
-- ─────────────────────────────────────────────────────────────────────
INSERT INTO public.users (id, email, name, type, status, profile, created_at)
VALUES
  (
    '00000000-0000-0000-0000-000000000020',
    'lafarge-holcim@sib2026.ma',
    'LafargeHolcim Maroc',
    'partner', 'active',
    '{"company": "LafargeHolcim Maroc", "tier": "platinium", "avatar": "https://ui-avatars.com/api/?name=LafargeHolcim&background=1B4332&color=E7D192&size=200"}',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000021',
    'saint-gobain@sib2026.ma',
    'Saint-Gobain Maroc',
    'partner', 'active',
    '{"company": "Saint-Gobain Maroc", "tier": "platinium", "avatar": "https://ui-avatars.com/api/?name=Saint-Gobain&background=1B4332&color=E7D192&size=200"}',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000022',
    'vinci-construction@sib2026.ma',
    'Vinci Construction Maroc',
    'partner', 'active',
    '{"company": "Vinci Construction Maroc", "tier": "platinium", "avatar": "https://ui-avatars.com/api/?name=Vinci+Construction&background=1B4332&color=E7D192&size=200"}',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000023',
    'addoha-groupe@sib2026.ma',
    'Groupe Addoha',
    'partner', 'active',
    '{"company": "Groupe Addoha", "tier": "gold", "avatar": "https://ui-avatars.com/api/?name=Groupe+Addoha&background=C9A84C&color=fff&size=200"}',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000024',
    'cih-bank@sib2026.ma',
    'CIH Bank',
    'partner', 'active',
    '{"company": "CIH Bank", "tier": "gold", "avatar": "https://ui-avatars.com/api/?name=CIH+Bank&background=C9A84C&color=fff&size=200"}',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000025',
    'knauf-maroc@sib2026.ma',
    'Knauf Maroc',
    'partner', 'active',
    '{"company": "Knauf Maroc", "tier": "gold", "avatar": "https://ui-avatars.com/api/?name=Knauf+Maroc&background=C9A84C&color=fff&size=200"}',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000026',
    'sonasid@sib2026.ma',
    'Sonasid',
    'partner', 'active',
    '{"company": "Sonasid", "tier": "silver", "avatar": "https://ui-avatars.com/api/?name=Sonasid&background=888&color=fff&size=200"}',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000027',
    'technal-maroc@sib2026.ma',
    'Technal Maroc',
    'partner', 'active',
    '{"company": "Technal Maroc", "tier": "silver", "avatar": "https://ui-avatars.com/api/?name=Technal+Maroc&background=888&color=fff&size=200"}',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000028',
    'bmce-bank@sib2026.ma',
    'BMCE Bank of Africa',
    'partner', 'active',
    '{"company": "BMCE Bank of Africa", "tier": "gold", "avatar": "https://ui-avatars.com/api/?name=BMCE+Bank&background=C9A84C&color=fff&size=200"}',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000029',
    'isover-maroc@sib2026.ma',
    'Isover Saint-Gobain',
    'partner', 'active',
    '{"company": "Isover Saint-Gobain", "tier": "silver", "avatar": "https://ui-avatars.com/api/?name=Isover&background=888&color=fff&size=200"}',
    NOW()
  )
ON CONFLICT (id) DO UPDATE SET
  email        = EXCLUDED.email,
  name         = EXCLUDED.name,
  type         = EXCLUDED.type,
  status       = EXCLUDED.status,
  profile      = EXCLUDED.profile;

-- ─────────────────────────────────────────────────────────────────────
-- 3. PARTNER_PROFILES  (table profil étendu)
-- ─────────────────────────────────────────────────────────────────────
ALTER TABLE public.partner_profiles ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT NOW();

INSERT INTO public.partner_profiles
  (id, user_id, company_name, contact_name, contact_email, contact_phone,
   description, logo_url, website, country, partnership_level, created_at)
VALUES
  -- 1 · LafargeHolcim Maroc — Platinium
  (
    '00000000-0000-0000-0000-000000000120',
    '00000000-0000-0000-0000-000000000020',
    'LafargeHolcim Maroc',
    'Karim El Fassi',
    'k.elfassi@lafargeholcim.ma',
    '+212 522 95 80 00',
    'LafargeHolcim Maroc est le leader du secteur des matériaux de construction au Maroc. Producteur de ciments, bétons et granulats, le groupe accompagne les grands chantiers d''infrastructure et d''habitat à travers tout le Royaume. Partenaire Platinium du SIB 2026, LafargeHolcim expose ses innovations béton bas-carbone et ses solutions Ready Mix.',
    'https://ui-avatars.com/api/?name=LafargeHolcim&background=1B4332&color=E7D192&size=200',
    'https://www.lafargeholcim.ma',
    'Maroc',
    'platinium',
    NOW()
  ),
  -- 2 · Saint-Gobain Maroc — Platinium
  (
    '00000000-0000-0000-0000-000000000121',
    '00000000-0000-0000-0000-000000000021',
    'Saint-Gobain Maroc',
    'Nadia Benjelloun',
    'n.benjelloun@saint-gobain.ma',
    '+212 522 36 20 00',
    'Saint-Gobain Maroc conçoit et distribue des matériaux de haute performance pour la construction durable. De l''isolation thermique (Isover) au vitrage (SGG), en passant par les plaques de plâtre (Placo) et les mortiers (Weber), Saint-Gobain couvre l''ensemble des besoins du bâtiment. Partenaire Platinium SIB 2026.',
    'https://ui-avatars.com/api/?name=Saint-Gobain&background=1B4332&color=E7D192&size=200',
    'https://www.saint-gobain.ma',
    'Maroc',
    'platinium',
    NOW()
  ),
  -- 3 · Vinci Construction Maroc — Platinium
  (
    '00000000-0000-0000-0000-000000000122',
    '00000000-0000-0000-0000-000000000022',
    'Vinci Construction Maroc',
    'Youssef Alaoui',
    'y.alaoui@vinci-construction.ma',
    '+212 537 70 30 00',
    'Vinci Construction Maroc est l''un des principaux acteurs du BTP au Maroc. Le groupe réalise des projets d''envergure nationale : autoroutes, barrages, bâtiments publics, hôpitaux et logements. Fort d''une expérience de plus de 30 ans sur le marché marocain, Vinci intègre les dernières technologies de construction durable et de digitalisation du chantier.',
    'https://ui-avatars.com/api/?name=Vinci&background=1B4332&color=E7D192&size=200',
    'https://www.vinci-construction.com/ma',
    'Maroc',
    'platinium',
    NOW()
  ),
  -- 4 · Groupe Addoha — Gold
  (
    '00000000-0000-0000-0000-000000000123',
    '00000000-0000-0000-0000-000000000023',
    'Groupe Addoha',
    'Fatima Zahra Kettani',
    'fz.kettani@groupeaddoha.com',
    '+212 522 97 00 10',
    'Premier groupe de promotion immobilière au Maroc et en Afrique, Addoha développe des projets résidentiels (logements économiques, moyen et haut standing) et des programmes mixtes dans plus de 10 pays africains. Au SIB 2026, le groupe présente ses derniers projets de smart buildings et ses programmes de logement durable à destination des MRE et des primo-accédants.',
    'https://ui-avatars.com/api/?name=Addoha&background=C9A84C&color=fff&size=200',
    'https://www.groupeaddoha.com',
    'Maroc',
    'gold',
    NOW()
  ),
  -- 5 · CIH Bank — Gold
  (
    '00000000-0000-0000-0000-000000000124',
    '00000000-0000-0000-0000-000000000024',
    'CIH Bank',
    'Omar Benaissa',
    'o.benaissa@cih.co.ma',
    '+212 522 46 44 40',
    'CIH Bank est la banque de référence du financement de l''immobilier au Maroc. Elle propose des crédits habitat compétitifs, des solutions de financement des promoteurs et des produits d''épargne dédiés à l''acquisition immobilière. Partenaire officiel Gold du SIB 2026, CIH Bank anime un espace conseil dédié aux visiteurs professionnels et particuliers.',
    'https://ui-avatars.com/api/?name=CIH+Bank&background=C9A84C&color=fff&size=200',
    'https://www.cih.co.ma',
    'Maroc',
    'gold',
    NOW()
  ),
  -- 6 · Knauf Maroc — Gold
  (
    '00000000-0000-0000-0000-000000000125',
    '00000000-0000-0000-0000-000000000025',
    'Knauf Maroc',
    'Rachid Bennani',
    'r.bennani@knauf.ma',
    '+212 522 67 50 00',
    'Knauf Maroc est filiale du groupe familial allemand Knauf, spécialiste mondial des systèmes de construction à base de plâtre et de produits de construction secs. La gamme Knauf Maroc comprend des plaques de plâtre, des enduits de finition, des systèmes de cloisons et de plafonds ainsi que des solutions d''isolation thermique et acoustique adaptées au climat marocain.',
    'https://ui-avatars.com/api/?name=Knauf&background=C9A84C&color=fff&size=200',
    'https://www.knauf.ma',
    'Maroc',
    'gold',
    NOW()
  ),
  -- 7 · Sonasid — Silver
  (
    '00000000-0000-0000-0000-000000000126',
    '00000000-0000-0000-0000-000000000026',
    'Sonasid',
    'Amal Tahiri',
    'a.tahiri@sonasid.ma',
    '+212 537 63 20 00',
    'Sonasid est le premier producteur d''acier de construction au Maroc. L''entreprise fabrique des ronds à béton, des barres d''armature et des fil machine utilisés dans tous les grands projets de BTP du Royaume. Avec une capacité de production de plus de 800 000 tonnes par an, Sonasid est un acteur incontournable de la chaîne de valeur du bâtiment.',
    'https://ui-avatars.com/api/?name=Sonasid&background=888&color=fff&size=200',
    'https://www.sonasid.ma',
    'Maroc',
    'silver',
    NOW()
  ),
  -- 8 · Technal Maroc — Silver
  (
    '00000000-0000-0000-0000-000000000127',
    '00000000-0000-0000-0000-000000000027',
    'Technal Maroc',
    'Samir Chraibi',
    's.chraibi@technal.ma',
    '+212 522 59 86 00',
    'Technal Maroc est spécialiste des systèmes de menuiserie aluminium à haute performance thermique. La gamme comprend des fenêtres, portes, façades et vérandas destinées au marché résidentiel et tertiaire. Les systèmes Technal répondent aux exigences de la RTCM (Réglementation Thermique de la Construction au Maroc) et aux certifications énergétiques internationales.',
    'https://ui-avatars.com/api/?name=Technal&background=888&color=fff&size=200',
    'https://www.technal.com/ma',
    'Maroc',
    'silver',
    NOW()
  ),
  -- 9 · BMCE Bank of Africa — Gold
  (
    '00000000-0000-0000-0000-000000000128',
    '00000000-0000-0000-0000-000000000028',
    'BMCE Bank of Africa',
    'Leila Amrani',
    'l.amrani@bmcebank.ma',
    '+212 522 20 04 04',
    'BMCE Bank of Africa est l''une des principales banques marocaines et africaines. Dans le secteur immobilier, elle accompagne aussi bien les promoteurs (financement de programmes) que les particuliers (crédits habitat, Fogarim, Foprolos). Partenaire Gold du SIB 2026, BMCE Bank of Africa présente ses nouvelles offres de financement green pour l''habitat durable.',
    'https://ui-avatars.com/api/?name=BMCE+Bank&background=C9A84C&color=fff&size=200',
    'https://www.bmcebank.ma',
    'Maroc',
    'gold',
    NOW()
  ),
  -- 10 · Isover Saint-Gobain — Silver
  (
    '00000000-0000-0000-0000-000000000129',
    '00000000-0000-0000-0000-000000000029',
    'Isover Saint-Gobain',
    'Hamid Lahlou',
    'h.lahlou@isover.ma',
    '+212 522 36 21 00',
    'Isover est la marque mondiale d''isolation de Saint-Gobain. Au Maroc, Isover propose des solutions d''isolation en laine de verre pour les toitures, les combles, les murs et les planchers. Face aux enjeux de confort thermique et d''efficacité énergétique dans la construction marocaine, Isover joue un rôle clé dans l''adoption de la RTCM et des normes LEED/HQE.',
    'https://ui-avatars.com/api/?name=Isover&background=888&color=fff&size=200',
    'https://www.isover.ma',
    'Maroc',
    'silver',
    NOW()
  )
ON CONFLICT (id) DO UPDATE SET
  company_name      = EXCLUDED.company_name,
  contact_name      = EXCLUDED.contact_name,
  contact_email     = EXCLUDED.contact_email,
  contact_phone     = EXCLUDED.contact_phone,
  description       = EXCLUDED.description,
  logo_url          = EXCLUDED.logo_url,
  website           = EXCLUDED.website,
  country           = EXCLUDED.country,
  partnership_level = EXCLUDED.partnership_level;

-- ─────────────────────────────────────────────────────────────────────
-- 4. PARTNERS  (table UI publique — lecture par les visiteurs)
-- ─────────────────────────────────────────────────────────────────────
INSERT INTO public.partners
  (id, user_id, company_name, partner_type, sector, category, description,
   logo_url, website, country, verified, featured, partnership_level,
   contributions, established_year, employees, is_published, created_at)
VALUES
  -- 1 · LafargeHolcim Maroc — Platinium
  (
    '00000000-0000-0000-0000-000000000120',
    '00000000-0000-0000-0000-000000000020',
    'LafargeHolcim Maroc',
    'industrial',
    'Matériaux de Construction',
    'cimenterie',
    'Leader des matériaux de construction au Maroc. Ciments, bétons prêts à l''emploi et granulats pour tous les projets du BTP.',
    'https://ui-avatars.com/api/?name=LafargeHolcim&background=1B4332&color=E7D192&size=200',
    'https://www.lafargeholcim.ma',
    'Maroc',
    true, true,
    'platinium',
    ARRAY['Sponsor principal SIB 2026', 'Béton bas-carbone', 'Innovation Ready Mix', 'Formation professionnelle BTP'],
    1927, '3 000+',
    true,
    NOW()
  ),
  -- 2 · Saint-Gobain Maroc — Platinium
  (
    '00000000-0000-0000-0000-000000000121',
    '00000000-0000-0000-0000-000000000021',
    'Saint-Gobain Maroc',
    'industrial',
    'Isolation & Vitrage',
    'materiaux',
    'Matériaux haute performance pour la construction durable : vitrage SGG, isolation Isover, plaques Placo, mortiers Weber.',
    'https://ui-avatars.com/api/?name=Saint-Gobain&background=1B4332&color=E7D192&size=200',
    'https://www.saint-gobain.ma',
    'Maroc',
    true, true,
    'platinium',
    ARRAY['Vitrage architectural', 'Solutions RTCM', 'Systèmes d''isolation thermique', 'Placo & cloisons'],
    1965, '1 200+',
    true,
    NOW()
  ),
  -- 3 · Vinci Construction Maroc — Platinium
  (
    '00000000-0000-0000-0000-000000000122',
    '00000000-0000-0000-0000-000000000022',
    'Vinci Construction Maroc',
    'contractor',
    'BTP & Génie Civil',
    'construction',
    'Grand acteur du BTP marocain : bâtiments, infrastructures, travaux de génie civil. Construction durable et digitalisation du chantier.',
    'https://ui-avatars.com/api/?name=Vinci&background=1B4332&color=E7D192&size=200',
    'https://www.vinci-construction.com/ma',
    'Maroc',
    true, true,
    'platinium',
    ARRAY['BIM & Chantier connecté', 'Construction bas-carbone', 'Formation aux métiers du BTP', 'Génie civil & infrastructures'],
    1990, '5 000+',
    true,
    NOW()
  ),
  -- 4 · Groupe Addoha — Gold
  (
    '00000000-0000-0000-0000-000000000123',
    '00000000-0000-0000-0000-000000000023',
    'Groupe Addoha',
    'developer',
    'Promotion Immobilière',
    'promoteur',
    'Premier promoteur immobilier marocain et africain. Logements économiques, moyen et haut standing, smart buildings.',
    'https://ui-avatars.com/api/?name=Addoha&background=C9A84C&color=fff&size=200',
    'https://www.groupeaddoha.com',
    'Maroc',
    true, true,
    'gold',
    ARRAY['Logement MRE', 'Smart buildings', 'Habitat durable', 'Expansion Afrique'],
    1988, '10 000+',
    true,
    NOW()
  ),
  -- 5 · CIH Bank — Gold
  (
    '00000000-0000-0000-0000-000000000124',
    '00000000-0000-0000-0000-000000000024',
    'CIH Bank',
    'financial',
    'Banque & Financement Immobilier',
    'banque',
    'Banque de référence du crédit habitat au Maroc. Crédits promoteurs, Fogarim, Foprolos, épargne logement.',
    'https://ui-avatars.com/api/?name=CIH+Bank&background=C9A84C&color=fff&size=200',
    'https://www.cih.co.ma',
    'Maroc',
    true, true,
    'gold',
    ARRAY['Crédit habitat compétitif', 'Financement promoteurs', 'Fogarim & Foprolos', 'Espace conseil SIB'],
    1920, '2 500+',
    true,
    NOW()
  ),
  -- 6 · Knauf Maroc — Gold
  (
    '00000000-0000-0000-0000-000000000125',
    '00000000-0000-0000-0000-000000000025',
    'Knauf Maroc',
    'industrial',
    'Plâtre & Construction Sèche',
    'materiaux',
    'Spécialiste des systèmes de construction à base de plâtre : plaques, enduits, cloisons, plafonds, isolation intérieure.',
    'https://ui-avatars.com/api/?name=Knauf&background=C9A84C&color=fff&size=200',
    'https://www.knauf.ma',
    'Maroc',
    true, true,
    'gold',
    ARRAY['Plaques de plâtre', 'Enduits de finition', 'Systèmes cloisons', 'Isolation acoustique'],
    2008, '400+',
    true,
    NOW()
  ),
  -- 7 · Sonasid — Silver
  (
    '00000000-0000-0000-0000-000000000126',
    '00000000-0000-0000-0000-000000000026',
    'Sonasid',
    'industrial',
    'Sidérurgie & Acier',
    'metallurgie',
    'Premier producteur marocain d''acier de construction. Ronds à béton et barres d''armature pour tous les chantiers.',
    'https://ui-avatars.com/api/?name=Sonasid&background=888&color=fff&size=200',
    'https://www.sonasid.ma',
    'Maroc',
    true, false,
    'silver',
    ARRAY['Ronds à béton', 'Barres d''armature', 'Fil machine', 'Certification NM'],
    1974, '1 500+',
    true,
    NOW()
  ),
  -- 8 · Technal Maroc — Silver
  (
    '00000000-0000-0000-0000-000000000127',
    '00000000-0000-0000-0000-000000000027',
    'Technal Maroc',
    'industrial',
    'Menuiserie Aluminium',
    'menuiserie',
    'Systèmes de menuiserie aluminium haute performance thermique : fenêtres, portes, façades, vérandas, conformes RTCM.',
    'https://ui-avatars.com/api/?name=Technal&background=888&color=fff&size=200',
    'https://www.technal.com/ma',
    'Maroc',
    true, false,
    'silver',
    ARRAY['Fenêtres RTCM', 'Façades rideau', 'Certifications thermiques', 'Formation poseurs'],
    2003, '250+',
    true,
    NOW()
  ),
  -- 9 · BMCE Bank of Africa — Gold
  (
    '00000000-0000-0000-0000-000000000128',
    '00000000-0000-0000-0000-000000000028',
    'BMCE Bank of Africa',
    'financial',
    'Banque & Financement',
    'banque',
    'Grande banque marocaine et africaine. Financement immobilier vert, crédits habitat, accompagnement des promoteurs.',
    'https://ui-avatars.com/api/?name=BMCE+Bank&background=C9A84C&color=fff&size=200',
    'https://www.bmcebank.ma',
    'Maroc',
    true, true,
    'gold',
    ARRAY['Green Mortgage', 'Financement promoteurs', 'Crédit habitat MRE', 'Expansion panafricaine'],
    1959, '6 000+',
    true,
    NOW()
  ),
  -- 10 · Isover Saint-Gobain — Silver
  (
    '00000000-0000-0000-0000-000000000129',
    '00000000-0000-0000-0000-000000000029',
    'Isover Saint-Gobain',
    'industrial',
    'Isolation Thermique & Acoustique',
    'isolation',
    'Solutions d''isolation en laine de verre pour toitures, combles, murs et planchers. Conformité RTCM et certifications LEED/HQE.',
    'https://ui-avatars.com/api/?name=Isover&background=888&color=fff&size=200',
    'https://www.isover.ma',
    'Maroc',
    true, false,
    'silver',
    ARRAY['Isolation laine de verre', 'Conformité RTCM', 'Certif. LEED/HQE', 'Économies d''énergie'],
    1975, '300+',
    true,
    NOW()
  )
ON CONFLICT (id) DO UPDATE SET
  company_name      = EXCLUDED.company_name,
  partner_type      = EXCLUDED.partner_type,
  sector            = EXCLUDED.sector,
  category          = EXCLUDED.category,
  description       = EXCLUDED.description,
  logo_url          = EXCLUDED.logo_url,
  website           = EXCLUDED.website,
  country           = EXCLUDED.country,
  verified          = EXCLUDED.verified,
  featured          = EXCLUDED.featured,
  partnership_level = EXCLUDED.partnership_level,
  contributions     = EXCLUDED.contributions,
  established_year  = EXCLUDED.established_year,
  employees         = EXCLUDED.employees,
  is_published      = true;

-- ─────────────────────────────────────────────────────────────────────
-- 5. PARTENAIRES OFFICIELS / INSTITUTIONNELS (home page FeaturedPartners)
--    Ces partenaires sont déjà insérés dans 20260411000002_insert_official_partners.sql
--    Ce bloc est un UPSERT de mise à jour pour garantir les bons partner_type
--    utilisés par FeaturedPartners.tsx → normalizePartnerTier()
-- ─────────────────────────────────────────────────────────────────────

-- S'assurer que les colonnes existent
ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS mission text;
ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS vision text;
ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS values jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS expertise jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS key_figures jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS social_media jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS certifications jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS established_year integer;
ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS employees text;
ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS country text DEFAULT 'Maroc';
ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS contact_info jsonb DEFAULT '{}';
ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS is_published boolean DEFAULT true;
ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS category text;
ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS partnership_level text;
ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS contributions text[];
ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS featured boolean DEFAULT false;
ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS verified boolean DEFAULT false;
ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT NOW();

INSERT INTO public.partners
  (id, user_id, company_name, partner_type, sector, category, description,
   logo_url, website, country, verified, featured, partnership_level,
   mission, vision, values, expertise, key_figures, social_media,
   established_year, employees, contact_info, is_published, created_at, updated_at)
VALUES

  -- 1 · Ministère de l'Habitat — Organisateur principal
  (
    '10000000-0000-0000-0000-000000000001',
    NULL,
    'Ministère de l''Aménagement du Territoire National, de l''Urbanisme, de l''Habitat et de la Politique de la Ville',
    'government',   -- normalizePartnerTier: 'government' → 'organizer' (priorité 1)
    'Urbanisme & Habitat',
    'gouvernement',
    'Le Ministère chargé de l''Urbanisme et de l''Habitat est responsable de la conception et de la mise en œuvre des politiques nationales en matière d''aménagement du territoire, d''urbanisme, de logement et de développement urbain durable. À la tête du salon SIB 2026, il incarne l''engagement de l''État marocain pour un habitat inclusif, durable et de qualité.',
    '/logo-ministere.png',
    'https://www.mhpv.gov.ma',
    'Maroc', true, true,
    'organizer',
    'Élaborer et mettre en œuvre une politique nationale intégrée en matière d''aménagement du territoire, d''urbanisme, de logement et de politique de la ville.',
    'Un Maroc dont les villes et les territoires sont des espaces de vie harmonieux, durables et attractifs.',
    '["Équité territoriale", "Durabilité", "Innovation urbaine", "Participation citoyenne", "Qualité architecturale"]'::jsonb,
    '["Politique du logement", "Planification urbaine", "Réhabilitation des quartiers", "Villes durables", "Habitat social"]'::jsonb,
    '[{"label": "Unités de logement/an", "value": "100 000+", "icon": "Home"}, {"label": "Villes couvertes", "value": "200+", "icon": "MapPin"}, {"label": "Budget (MMDH)", "value": "8+", "icon": "TrendingUp"}, {"label": "Programmes actifs", "value": "15+", "icon": "Building"}]'::jsonb,
    '{"website": "https://www.mhpv.gov.ma", "facebook": "https://www.facebook.com/muat.gov.ma"}'::jsonb,
    1956, '5 000+',
    '{"email": "contact@mhpv.gov.ma", "phone": "+212 5 37 21 17 00", "address": "Avenue Ibn Sina, Agdal, Rabat, Maroc"}'::jsonb,
    true, NOW(), NOW()
  ),

  -- 2 · AMDIE — Co-organisateur / Sponsor Officiel
  (
    '10000000-0000-0000-0000-000000000002',
    NULL,
    'AMDIE — Agence Marocaine de Développement des Investissements et des Exportations',
    'official_sponsor',  -- normalizePartnerTier: 'official_sponsor' → 'official_sponsor' (priorité 3)
    'Investissement & Commerce International',
    'agence-nationale',
    'L''AMDIE est l''organisme national chargé de promouvoir les investissements nationaux et étrangers ainsi que le développement des exportations marocaines. Créée en 2017 par la fusion de l''AMDI, Maroc Export et l''OFEC, elle constitue un guichet unique pour les investisseurs et pilote la marque stratégique «Morocco Now». Partenaire incontournable du SIB 2026 pour attirer les investissements dans le secteur de la construction et du BTP.',
    '/logos/amdie.png',
    'https://www.amdie.gov.ma',
    'Maroc', true, true,
    'official_sponsor',
    'Promouvoir le Maroc comme destination d''investissement de premier rang et accompagner les entreprises marocaines à l''international.',
    'Faire du Maroc un pôle d''attractivité mondial pour l''investissement et un champion des exportations africaines.',
    '["Innovation", "Efficacité", "Transparence", "Partenariat public-privé", "Compétitivité"]'::jsonb,
    '["Promotion des investissements étrangers", "Développement des exportations", "Organisation de foires et expositions", "Accompagnement des investisseurs"]'::jsonb,
    '[{"label": "Projets approuvés 2025 (MMDH)", "value": "110+", "icon": "TrendingUp"}, {"label": "Actions de promotion", "value": "55+", "icon": "Globe"}, {"label": "Pays couverts", "value": "80+", "icon": "MapPin"}, {"label": "Emplois générés", "value": "50 000+", "icon": "Users"}]'::jsonb,
    '{"linkedin": "https://www.linkedin.com/company/amdie", "twitter": "https://twitter.com/AMDIE_MA", "facebook": "https://www.facebook.com/amdie.gov.ma"}'::jsonb,
    2017, '200-500',
    '{"email": "info@amdie.gov.ma", "phone": "+212 5 22 77 47 00", "address": "Tour Hassan II, Casablanca, Maroc"}'::jsonb,
    true, NOW(), NOW()
  ),

  -- 3 · FMC — Co-organisateur
  (
    '10000000-0000-0000-0000-000000000003',
    NULL,
    'FMC — Fédération des Industries des Matériaux de Construction',
    'co_organizer',  -- normalizePartnerTier: 'co_organizer' → 'co_organizer' (priorité 2)
    'Matériaux de Construction',
    'federation',
    'La FMC représente l''ensemble des industries productrices de matériaux de construction au Maroc : ciment, béton, céramique, plâtre, briques, verre, acier et autres matériaux de second œuvre. Elle joue un rôle clé dans la structuration de la filière, la promotion de l''innovation et le dialogue avec les pouvoirs publics. Partenaire co-organisateur du SIB 2026.',
    '/logos/fmc.png',
    'https://fmc.ma',
    'Maroc', true, true,
    'co_organizer',
    'Fédérer, représenter et défendre les intérêts des industries marocaines des matériaux de construction.',
    'Positionner l''industrie marocaine des matériaux de construction comme un acteur de référence à l''échelle africaine.',
    '["Qualité", "Innovation", "Durabilité", "Solidarité professionnelle", "Performance industrielle"]'::jsonb,
    '["Ciment et béton", "Céramique et carrelage", "Acier de construction", "Verre architectural", "Isolation thermique et acoustique", "Normalisation et certification"]'::jsonb,
    '[{"label": "Entreprises membres", "value": "150+", "icon": "Building"}, {"label": "CA annuel (MMDH)", "value": "40+", "icon": "TrendingUp"}, {"label": "Emplois directs", "value": "60 000+", "icon": "Users"}, {"label": "Capacité ciment (Mt/an)", "value": "20+", "icon": "Package"}]'::jsonb,
    '{"linkedin": "https://www.linkedin.com/company/fmc-maroc", "facebook": "https://www.facebook.com/fmc.maroc"}'::jsonb,
    1990, '100-200',
    '{"email": "contact@fmc.ma", "phone": "+212 5 22 24 90 00", "address": "Casablanca, Maroc"}'::jsonb,
    true, NOW(), NOW()
  ),

  -- 4 · FNBTP — Co-organisateur
  (
    '10000000-0000-0000-0000-000000000004',
    NULL,
    'FNBTP — Fédération Nationale du Bâtiment et des Travaux Publics',
    'co_organizer',  -- normalizePartnerTier: 'co_organizer' → 'co_organizer' (priorité 2)
    'BTP',
    'federation',
    'La FNBTP est l''organisation professionnelle centrale des entreprises marocaines du Bâtiment et des Travaux Publics. Forte de plus de quatre décennies d''existence, elle représente des milliers d''entreprises auprès des autorités publiques. Avec une contribution de 6,2 % du PIB national et 1,2 million d''emplois, le secteur BTP est l''un des piliers de l''économie marocaine. Partenaire co-organisateur du SIB 2026.',
    '/logos/fnbtp.png',
    'https://fnbtp.ma',
    'Maroc', true, true,
    'co_organizer',
    'Représenter, défendre et promouvoir les entreprises du BTP marocain, favoriser un environnement réglementaire propice à leur développement.',
    'Un secteur du BTP marocain compétitif, innovant et durable, reconnu à l''échelle africaine et internationale.',
    '["Éthique professionnelle", "Équité", "Qualité", "Performance", "Formation continue", "Innovation"]'::jsonb,
    '["Bâtiment résidentiel et commercial", "Travaux publics et infrastructure", "Génie civil", "Qualification des entreprises", "Formation professionnelle BTP"]'::jsonb,
    '[{"label": "% du PIB national", "value": "6,2 %", "icon": "TrendingUp"}, {"label": "Emplois générés", "value": "1,2 M", "icon": "Users"}, {"label": "% de la FBCF", "value": "55 %", "icon": "BarChart"}, {"label": "Croissance sectorielle", "value": "6,7 %", "icon": "ArrowUp"}]'::jsonb,
    '{"linkedin": "https://www.linkedin.com/company/fnbtp", "twitter": "https://x.com/fnbtp", "facebook": "https://facebook.com/FNBTP", "youtube": "https://youtube.com/@FNBTP_Maroc"}'::jsonb,
    1978, '100-200',
    '{"email": "contact@fnbtp.ma", "phone": "+212 5 22 27 42 49", "address": "Rabat, Maroc"}'::jsonb,
    true, NOW(), NOW()
  ),

  -- 5 · LAP — Sponsor Officiel
  (
    '10000000-0000-0000-0000-000000000005',
    NULL,
    'LAP',
    'official_sponsor',  -- normalizePartnerTier: 'official_sponsor' → 'official_sponsor' (priorité 3)
    'Solutions Techniques & Équipements',
    'fournisseur',
    'LAP est un acteur spécialisé dans la fourniture de solutions techniques pour le bâtiment et l''industrie. Expert en équipements électriques, alimentation en énergie et solutions de connexion pour les professionnels du BTP et de l''aménagement, LAP est sponsor officiel du SIB 2026 et contribue à l''excellence technique du salon.',
    '/logos/lap.png',
    'https://lap.ma',
    'Maroc', true, true,
    'official_sponsor',
    'Fournir aux professionnels du bâtiment des solutions techniques innovantes, fiables et performantes.',
    'Être la référence marocaine des solutions techniques pour la construction.',
    '["Fiabilité", "Innovation technique", "Qualité", "Service client", "Durabilité"]'::jsonb,
    '["Équipements électriques", "Solutions d''alimentation", "Matériel de connexion", "Solutions pour le bâtiment"]'::jsonb,
    '[{"label": "Années d''expérience", "value": "20+", "icon": "Calendar"}, {"label": "Références clients", "value": "500+", "icon": "Users"}, {"label": "Produits au catalogue", "value": "10 000+", "icon": "Package"}, {"label": "Régions couvertes", "value": "12", "icon": "MapPin"}]'::jsonb,
    '{"linkedin": "https://www.linkedin.com/company/lap-maroc"}'::jsonb,
    2000, '50-200',
    '{"email": "contact@lap.ma", "phone": "+212 5 22 00 00 00", "address": "Casablanca, Maroc"}'::jsonb,
    true, NOW(), NOW()
  ),

  -- 6 · URBACOM — Organisateur Délégué
  (
    '10000000-0000-0000-0000-000000000006',
    NULL,
    'URBACOM — Communication & Événementiel',
    'delegated_organizer',  -- normalizePartnerTier: 'delegated_organizer' → 'delegated_organizer' (priorité 4)
    'Communication & Événementiel',
    'agence',
    'URBACOM est une agence spécialisée dans l''organisation d''événements professionnels et la communication corporate. Forte d''une expertise reconnue dans les secteurs de l''immobilier, de la construction et de l''urbanisme, URBACOM est l''organisateur délégué du Salon International du Bâtiment 2026. Elle assure la conception, la coordination opérationnelle et la promotion du SIB depuis 2006.',
    '/logos/urbacom.png',
    'https://urbacom.ma',
    'Maroc', true, true,
    'delegated_organizer',
    'Concevoir et exécuter des événements professionnels à haute valeur ajoutée qui créent des opportunités d''affaires réelles pour les acteurs de la construction.',
    'Être l''agence événementielle de référence au Maroc pour les salons professionnels du BTP et de l''habitat.',
    '["Excellence", "Créativité", "Professionnalisme", "Réseau", "Écoute client", "Engagement"]'::jsonb,
    '["Organisation de salons professionnels", "Événementiel corporate", "Communication B2B", "Marketing sectoriel BTP/Immobilier", "Relations presse et médias"]'::jsonb,
    '[{"label": "Événements organisés", "value": "50+", "icon": "Calendar"}, {"label": "Exposants mobilisés", "value": "2 000+", "icon": "Building"}, {"label": "Visiteurs professionnels", "value": "100 000+", "icon": "Users"}, {"label": "Éditions SIB", "value": "10+", "icon": "Award"}]'::jsonb,
    '{"linkedin": "https://www.linkedin.com/company/urbacom", "facebook": "https://www.facebook.com/urbacom.ma", "instagram": "https://www.instagram.com/urbacom_maroc"}'::jsonb,
    2005, '10-50',
    '{"email": "contact@urbacom.ma", "phone": "+212 6 61 00 00 00", "address": "Casablanca, Maroc"}'::jsonb,
    true, NOW(), NOW()
  )

ON CONFLICT (id) DO UPDATE SET
  company_name      = EXCLUDED.company_name,
  partner_type      = EXCLUDED.partner_type,
  sector            = EXCLUDED.sector,
  category          = EXCLUDED.category,
  description       = EXCLUDED.description,
  logo_url          = EXCLUDED.logo_url,
  website           = EXCLUDED.website,
  verified          = EXCLUDED.verified,
  featured          = EXCLUDED.featured,
  partnership_level = EXCLUDED.partnership_level,
  mission           = EXCLUDED.mission,
  vision            = EXCLUDED.vision,
  values            = EXCLUDED.values,
  expertise         = EXCLUDED.expertise,
  key_figures       = EXCLUDED.key_figures,
  social_media      = EXCLUDED.social_media,
  established_year  = EXCLUDED.established_year,
  employees         = EXCLUDED.employees,
  contact_info      = EXCLUDED.contact_info,
  is_published      = EXCLUDED.is_published,
  updated_at        = NOW();

-- ─────────────────────────────────────────────────────────────────────
-- 6. RÉACTIVER LES TRIGGERS
-- ─────────────────────────────────────────────────────────────────────
ALTER TABLE public.partner_profiles ENABLE TRIGGER USER;
ALTER TABLE public.partners         ENABLE TRIGGER USER;

-- ─────────────────────────────────────────────────────────────────────
-- FIN — Résumé
-- ─────────────────────────────────────────────────────────────────────
-- INSTITUTIONNELS / PAGE HOME (Partenaires Officiels) :
--   organizer (priorité 1)          : Ministère de l'Habitat
--   co_organizer (priorité 2)       : FMC · FNBTP
--   official_sponsor (priorité 3)   : AMDIE · LAP
--   delegated_organizer (priorité 4): URBACOM
--
-- INDUSTRIELS / COMMERCIAUX BTP (nouveaux) :
--   PLATINIUM : LafargeHolcim Maroc · Saint-Gobain Maroc · Vinci Construction Maroc
--   GOLD      : Groupe Addoha · CIH Bank · Knauf Maroc · BMCE Bank of Africa
--   SILVER    : Sonasid · Technal Maroc · Isover Saint-Gobain
--
-- Connexion demo partenaires industriels : <email> / Partner2026!
-- ─────────────────────────────────────────────────────────────────────
