-- Table de configuration dynamique des champs du formulaire catalogue
-- Permet aux admins de modifier labels, placeholders, required, visible

CREATE TABLE IF NOT EXISTS public.catalogue_form_fields (
  field_key   text     PRIMARY KEY,
  step        smallint NOT NULL,
  label       text     NOT NULL,
  placeholder text     NOT NULL DEFAULT '',
  field_type  text     NOT NULL DEFAULT 'text', -- text|email|tel|url|textarea|select|upload
  required    boolean  NOT NULL DEFAULT false,
  visible     boolean  NOT NULL DEFAULT true,
  sort_order  smallint NOT NULL DEFAULT 0,
  options     jsonb    DEFAULT NULL  -- tableau de strings pour les <select>
);

ALTER TABLE public.catalogue_form_fields ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_form_fields"   ON public.catalogue_form_fields;
DROP POLICY IF EXISTS "admin_manage_form_fields"  ON public.catalogue_form_fields;

-- Tout le monde peut lire (nécessaire pour la page formulaire publique)
CREATE POLICY "public_read_form_fields" ON public.catalogue_form_fields
  FOR SELECT USING (true);

-- Seul l'admin peut modifier
CREATE POLICY "admin_manage_form_fields" ON public.catalogue_form_fields
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.type = 'admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.type = 'admin'
  ));

-- ─── Seed : tous les champs du formulaire ────────────────────────────────────
INSERT INTO public.catalogue_form_fields
  (field_key, step, label, placeholder, field_type, required, visible, sort_order, options)
VALUES
  -- Étape 1 — Identification
  ('logo_url',    1, 'Logo de l''entreprise',            '',                               'upload',   false, true, 10, NULL),
  ('company_name',1, 'Raison sociale',                   'Nom officiel de l''entreprise',  'text',     true,  true, 20, NULL),
  ('sector',      1, 'Secteur d''activité',              '',                               'select',   false, true, 30,
    '["Bâtiment & Gros Œuvre","Matériaux de Construction","Menuiserie & Boiserie","Carrelage & Revêtements","Plomberie & Sanitaires","Climatisation & Ventilation","Électricité & Domotique","Peintures & Finitions","Isolation & Étanchéité","Équipements Industriels","Quincaillerie & Outillage","Architecture & Design","Immobilier & Promotion","Services & Ingénierie","Autre"]'::jsonb),
  ('stand_number',1, 'N° Stand',                         'Ex : 17-A',                      'text',     false, true, 40, NULL),
  ('hall',        1, 'Hall / Pavillon',                   '',                               'select',   false, true, 50,
    '["A","B","C","D","E","Plein air"]'::jsonb),
  ('country_flag',1, 'Nationalité (code ISO 2 lettres)',  'MA  FR  IT…',                    'text',     false, true, 60, NULL),

  -- Étape 2 — Coordonnées
  ('address',     2, 'Adresse',                           'Zone Industrielle, Rue, N°…',    'text',     false, true, 10, NULL),
  ('zip_code',    2, 'Code postal',                       '20000',                           'text',     false, true, 20, NULL),
  ('city',        2, 'Ville',                             'Casablanca',                      'text',     false, true, 30, NULL),
  ('country',     2, 'Pays',                              'Maroc',                           'text',     false, true, 40, NULL),
  ('phone',       2, 'Téléphone',                         '+212 5 22 00 00 00',              'tel',      true,  true, 50, NULL),
  ('fax',         2, 'Fax',                               '+212 5 22 00 00 01',              'tel',      false, true, 60, NULL),
  ('gsm',         2, 'GSM / Mobile',                      '+212 6 00 00 00 00',              'tel',      false, true, 70, NULL),
  ('email',       2, 'Email',                             'contact@entreprise.ma',            'email',    true,  true, 80, NULL),
  ('website',     2, 'Site web',                          'https://www.entreprise.ma',       'url',      false, true, 90, NULL),

  -- Étape 3 — Représentant
  ('contact_name',         3, 'Nom & Prénom',     'Mme / M. Prénom NOM',   'text',   true,  true, 10, NULL),
  ('contact_title',        3, 'Titre / Fonction',  '',                       'select', true,  true, 20,
    '["Directeur Général","PDG","DGA","Directeur Commercial","Directeur Technique","Responsable Export","Chef de Projet","Manager","Autre"]'::jsonb),
  ('contact_direct_phone', 3, 'Tél. direct',       '+212 6 …',               'tel',    false, true, 30, NULL),
  ('contact_direct_email', 3, 'Email direct',       'nom@entreprise.ma',      'email',  false, true, 40, NULL),

  -- Étape 4 — Activité
  ('activity_description',    4, 'Description de l''activité',         'Décrivez l''activité principale de votre entreprise…',  'textarea', true,  true, 10, NULL),
  ('products_services',       4, 'Produits / Services exposés au SIB', 'Liste des produits ou services présentés au SIB 2026…', 'textarea', false, true, 20, NULL),
  ('brands_represented',      4, 'Marques représentées',                'MARQUE A, MARQUE B, MARQUE C',                          'text',     false, true, 30, NULL),
  ('products_origin_country', 4, 'Pays d''origine des produits',        'Maroc, France, Italie…',                                'text',     false, true, 40, NULL),

  -- Étape 5 — Réseaux sociaux
  ('facebook_url',  5, 'Facebook',     'https://facebook.com/…',          'url', false, true, 10, NULL),
  ('instagram_url', 5, 'Instagram',    'https://instagram.com/…',         'url', false, true, 20, NULL),
  ('linkedin_url',  5, 'LinkedIn',     'https://linkedin.com/company/…',  'url', false, true, 30, NULL),
  ('twitter_url',   5, 'X / Twitter',  'https://x.com/…',                 'url', false, true, 40, NULL),
  ('youtube_url',   5, 'YouTube',      'https://youtube.com/@…',          'url', false, true, 50, NULL)
ON CONFLICT (field_key) DO NOTHING;
