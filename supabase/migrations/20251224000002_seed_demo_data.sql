/*
  # Seed Demo Data for Presentation
  
  This migration populates all tables with realistic demo data:
  - Users (admin, exhibitors, partners, visitors)
  - Exhibitors & Partners profiles
  - Visitor profiles
  - Events
  - News articles
  - Appointments & Time slots
  - Connections
  - Messages
  - Pavilions
*/

-- Recréer les tables de profils avec la bonne structure (nécessaires pour le trigger)
DROP TABLE IF EXISTS public.exhibitor_profiles CASCADE;
CREATE TABLE public.exhibitor_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  company_name text,
  first_name text,
  last_name text,
  email text,
  phone text,
  description text,
  logo_url text,
  website text,
  country text,
  sector text,
  category text,
  stand_number text,
  stand_area numeric DEFAULT 9.0 CHECK (stand_area > 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_exhibitor_profiles_user_id ON public.exhibitor_profiles(user_id);

DROP TABLE IF EXISTS public.partner_profiles CASCADE;
CREATE TABLE public.partner_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  company_name text,
  contact_name text,
  contact_email text,
  contact_phone text,
  description text,
  logo_url text,
  website text,
  country text,
  partnership_level text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_partner_profiles_user_id ON public.partner_profiles(user_id);

DROP TABLE IF EXISTS public.visitor_profiles CASCADE;
CREATE TABLE public.visitor_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  first_name text,
  last_name text,
  company text,
  position text,
  phone text,
  country text,
  visitor_type text,
  pass_type text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_visitor_profiles_user_id ON public.visitor_profiles(user_id);

-- Ajouter la colonne stand_number à exhibitors si elle n'existe pas
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'exhibitors' 
    AND column_name = 'stand_number'
  ) THEN
    ALTER TABLE public.exhibitors ADD COLUMN stand_number text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'exhibitors' 
    AND column_name = 'featured'
  ) THEN
    ALTER TABLE public.exhibitors ADD COLUMN featured boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'exhibitors' 
    AND column_name = 'verified'
  ) THEN
    ALTER TABLE public.exhibitors ADD COLUMN verified boolean DEFAULT false;
  END IF;

  -- S'assurer que la table partners a les bonnes colonnes
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'partners') THEN
    -- Ajouter company_name si name existe (renommer ou ajouter)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'company_name') THEN
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'name') THEN
        ALTER TABLE public.partners RENAME COLUMN name TO company_name;
      ELSE
        ALTER TABLE public.partners ADD COLUMN company_name text;
      END IF;
    END IF;

    -- Ajouter partner_type si type existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'partner_type') THEN
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'type') THEN
        ALTER TABLE public.partners RENAME COLUMN type TO partner_type;
      ELSE
        ALTER TABLE public.partners ADD COLUMN partner_type text;
      END IF;
    END IF;

    -- Ajouter partnership_level si sponsorship_level existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'partnership_level') THEN
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'sponsorship_level') THEN
        ALTER TABLE public.partners RENAME COLUMN sponsorship_level TO partnership_level;
      ELSE
        ALTER TABLE public.partners ADD COLUMN partnership_level text;
      END IF;
    END IF;

    -- Ajouter user_id si manquant
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'user_id') THEN
      ALTER TABLE public.partners ADD COLUMN user_id uuid REFERENCES public.users(id);
    END IF;

    -- Ajouter contact_info si manquant
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'contact_info') THEN
      ALTER TABLE public.partners ADD COLUMN contact_info jsonb DEFAULT '{}';
    END IF;
  END IF;
END $$;

-- Créer la table pavilions si elle n'existe pas
CREATE TABLE IF NOT EXISTS pavilions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE,
  description text NOT NULL,
  color text DEFAULT '#3b82f6',
  icon text DEFAULT 'Anchor',
  order_index integer DEFAULT 0,
  featured boolean DEFAULT false,
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Créer le type event_type si il n'existe pas
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'event_type') THEN
    CREATE TYPE event_type AS ENUM ('conference', 'workshop', 'networking', 'exhibition');
  END IF;
END $$;

-- Note: ALTER TYPE ADD VALUE ne peut pas être utilisé dans la même transaction
-- Les valeurs doivent déjà exister dans l'enum ou on utilise des valeurs texte

-- Créer la table events si elle n'existe pas
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  event_type event_type NOT NULL DEFAULT 'conference',
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  location text,
  pavilion_id uuid,
  organizer_id uuid REFERENCES users(id),
  capacity integer,
  registered integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  image_url text,
  registration_url text,
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Ajouter la colonne event_type à events si elle n'existe pas
DO $$ 
BEGIN
  -- event_type
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'event_type') THEN
    ALTER TABLE public.events ADD COLUMN event_type text DEFAULT 'conference';
  END IF;
  -- start_date
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'start_date') THEN
    ALTER TABLE public.events ADD COLUMN start_date timestamptz DEFAULT now();
  END IF;
  -- end_date
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'end_date') THEN
    ALTER TABLE public.events ADD COLUMN end_date timestamptz DEFAULT now();
  END IF;
  -- location
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'location') THEN
    ALTER TABLE public.events ADD COLUMN location text;
  END IF;
  -- pavilion_id
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'pavilion_id') THEN
    ALTER TABLE public.events ADD COLUMN pavilion_id uuid;
  END IF;
  -- organizer_id
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'organizer_id') THEN
    ALTER TABLE public.events ADD COLUMN organizer_id uuid;
  END IF;
  -- capacity
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'capacity') THEN
    ALTER TABLE public.events ADD COLUMN capacity integer;
  END IF;
  -- registered
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'registered') THEN
    ALTER TABLE public.events ADD COLUMN registered integer DEFAULT 0;
  END IF;
  -- is_featured
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'is_featured') THEN
    ALTER TABLE public.events ADD COLUMN is_featured boolean DEFAULT false;
  END IF;
END $$;

-- =====================================================
-- 1. INSERT DEMO USERS
-- =====================================================

-- Ensure pgcrypto is enabled for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Insert into auth.users first to satisfy foreign key constraints
-- Using DO block to avoid unique constraint violations
DO $$
DECLARE
  v_user_id uuid;
  v_email text;
  v_password text := 'Admin123!';
  v_users RECORD;
BEGIN
  -- Clean up dependent tables to avoid foreign key violations during user cleanup
  -- We do this because deleting from auth.users triggers deletion in public.users
  DELETE FROM daily_quotas;
  DELETE FROM user_favorites;
  DELETE FROM products;
  DELETE FROM mini_sites;
  DELETE FROM news_articles;
  DELETE FROM events;
  DELETE FROM appointments;
  DELETE FROM messages;
  DELETE FROM conversations;
  DELETE FROM connections;
  DELETE FROM exhibitors;
  DELETE FROM exhibitor_profiles;
  DELETE FROM partner_profiles;
  DELETE FROM visitor_profiles;
  DELETE FROM notifications;
  DELETE FROM registration_requests;

  -- Define the users we want to ensure exist
  FOR v_users IN 
    SELECT * FROM (VALUES 
      ('00000000-0000-0000-0000-000000000001', 'admin.siports@siports.com'),
      ('00000000-0000-0000-0000-000000000002', 'exhibitor-54m@test.siport.com'),
      ('00000000-0000-0000-0000-000000000003', 'exhibitor-36m@test.siport.com'),
      ('00000000-0000-0000-0000-000000000004', 'exhibitor-18m@test.siport.com'),
      ('00000000-0000-0000-0000-000000000017', 'exhibitor-9m@test.siport.com'),
      ('00000000-0000-0000-0000-000000000005', 'partner-gold@test.siport.com'),
      ('00000000-0000-0000-0000-000000000006', 'partner-silver@test.siport.com'),
      ('00000000-0000-0000-0000-000000000011', 'partner-platinium@test.siport.com'),
      ('00000000-0000-0000-0000-000000000012', 'partner-museum@test.siport.com'),
      ('00000000-0000-0000-0000-000000000013', 'partner-porttech@test.siport.com'),
      ('00000000-0000-0000-0000-000000000014', 'partner-oceanfreight@test.siport.com'),
      ('00000000-0000-0000-0000-000000000015', 'partner-coastal@test.siport.com'),
      ('00000000-0000-0000-0000-000000000007', 'visitor-vip@test.siport.com'),
      ('00000000-0000-0000-0000-000000000008', 'visitor-premium@test.siport.com'),
      ('00000000-0000-0000-0000-000000000009', 'visitor-basic@test.siport.com'),
      ('00000000-0000-0000-0000-000000000010', 'visitor-free@test.siport.com')
    ) AS t(id, email)
  LOOP
    v_user_id := v_users.id::uuid;
    v_email := v_users.email;

    -- 1. Remove any user that has this email but a different ID
    -- We delete from public.users first to avoid constraint issues
    DELETE FROM public.users WHERE email = v_email AND id <> v_user_id;
    DELETE FROM auth.users WHERE email = v_email AND id <> v_user_id;
    
    -- 2. Remove any user that has this ID but a different email
    DELETE FROM public.users WHERE id = v_user_id AND email <> v_email;
    DELETE FROM auth.users WHERE id = v_user_id AND email <> v_email;

    -- 3. Insert if not exists
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = v_user_id) THEN
      INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, aud, role)
      VALUES (v_user_id, v_email, crypt(v_password, gen_salt('bf')), NOW(), NOW(), NOW(), 'authenticated', 'authenticated');
    END IF;
  END LOOP;
END $$;

-- Admin user
INSERT INTO users (id, email, name, type, status, profile, created_at)
VALUES 
  (
    '00000000-0000-0000-0000-000000000001',
    'admin.siports@siports.com',
    'Admin SIPORTS',
    'admin',
    'active',
    '{"role": "administrator", "avatar": "https://ui-avatars.com/api/?name=Admin+SIPORTS"}',
    NOW()
  )
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  type = EXCLUDED.type,
  status = EXCLUDED.status,
  profile = EXCLUDED.profile;

-- Exhibitor users
INSERT INTO users (id, email, name, type, status, profile, created_at)
VALUES 
  (
    '00000000-0000-0000-0000-000000000002',
    'exhibitor-54m@test.siport.com',
    'ABB Marine & Ports',
    'exhibitor',
    'active',
    '{"company": "ABB Marine & Ports", "sector": "Technologie", "tier": "54m2", "avatar": "https://ui-avatars.com/api/?name=ABB+Marine"}',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    'exhibitor-36m@test.siport.com',
    'Advanced Port Systems',
    'exhibitor',
    'active',
    '{"company": "Advanced Port Systems", "sector": "Automation", "tier": "36m2", "avatar": "https://ui-avatars.com/api/?name=Advanced+Port"}',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000004',
    'exhibitor-18m@test.siport.com',
    'Maritime Equipment Co',
    'exhibitor',
    'active',
    '{"company": "Maritime Equipment Co", "sector": "Equipment", "tier": "18m2", "avatar": "https://ui-avatars.com/api/?name=Maritime+Equip"}',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000017',
    'exhibitor-9m@test.siport.com',
    'StartUp Port Innovations',
    'exhibitor',
    'active',
    '{"company": "StartUp Port Innovations", "sector": "IoT", "tier": "9m2", "avatar": "https://ui-avatars.com/api/?name=StartUp+Port"}',
    NOW()
  )
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  type = EXCLUDED.type,
  status = EXCLUDED.status,
  profile = EXCLUDED.profile;

-- Partner users
INSERT INTO users (id, email, name, type, status, profile, created_at)
VALUES 
  (
    '00000000-0000-0000-0000-000000000005',
    'partner-gold@test.siport.com',
    'Gold Partner Industries',
    'partner',
    'active',
    '{"company": "Gold Partner Industries", "tier": "gold", "avatar": "https://ui-avatars.com/api/?name=Gold+Partner"}',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000006',
    'partner-silver@test.siport.com',
    'Silver Tech Group',
    'partner',
    'active',
    '{"company": "Silver Tech Group", "tier": "silver", "avatar": "https://ui-avatars.com/api/?name=Silver+Tech"}',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000011',
    'partner-platinium@test.siport.com',
    'Platinium Global Corp',
    'partner',
    'active',
    '{"company": "Platinium Global Corp", "tier": "platinium", "avatar": "https://ui-avatars.com/api/?name=Platinium+Global"}',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000012',
    'partner-museum@test.siport.com',
    'Museum Heritage',
    'partner',
    'active',
    '{"company": "Museum Heritage", "tier": "museum", "avatar": "https://ui-avatars.com/api/?name=Museum+Heritage"}',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000013',
    'partner-porttech@test.siport.com',
    'Port Tech Systems',
    'partner',
    'active',
    '{"company": "Port Tech Systems", "tier": "platinium", "avatar": "https://ui-avatars.com/api/?name=Port+Tech"}',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000014',
    'partner-oceanfreight@test.siport.com',
    'Ocean Freight Services',
    'partner',
    'active',
    '{"company": "Ocean Freight Services", "tier": "gold", "avatar": "https://ui-avatars.com/api/?name=Ocean+Freight"}',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000015',
    'partner-coastal@test.siport.com',
    'Coastal Shipping Co',
    'partner',
    'active',
    '{"company": "Coastal Shipping Co", "tier": "silver", "avatar": "https://ui-avatars.com/api/?name=Coastal+Shipping"}',
    NOW()
  )
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  type = EXCLUDED.type,
  status = EXCLUDED.status,
  profile = EXCLUDED.profile;

-- Visitor users
INSERT INTO users (id, email, name, type, visitor_level, status, profile, created_at)
VALUES 
  (
    '00000000-0000-0000-0000-000000000007',
    'visitor-vip@test.siport.com',
    'Jean Dupont',
    'visitor',
    'vip',
    'active',
    '{"firstName": "Jean", "lastName": "Dupont", "company": "Dupont Consulting", "avatar": "https://ui-avatars.com/api/?name=Jean+Dupont"}',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000008',
    'visitor-premium@test.siport.com',
    'Marie Martin',
    'visitor',
    'premium',
    'active',
    '{"firstName": "Marie", "lastName": "Martin", "company": "Martin & Associés", "avatar": "https://ui-avatars.com/api/?name=Marie+Martin"}',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000009',
    'visitor-basic@test.siport.com',
    'Pierre Dubois',
    'visitor',
    'basic',
    'active',
    '{"firstName": "Pierre", "lastName": "Dubois", "avatar": "https://ui-avatars.com/api/?name=Pierre+Dubois"}',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000010',
    'visitor-free@test.siport.com',
    'Sophie Bernard',
    'visitor',
    'free',
    'active',
    '{"firstName": "Sophie", "lastName": "Bernard", "avatar": "https://ui-avatars.com/api/?name=Sophie+Bernard"}',
    NOW()
  )
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  type = EXCLUDED.type,
  visitor_level = EXCLUDED.visitor_level,
  status = EXCLUDED.status,
  profile = EXCLUDED.profile;

-- =====================================================
-- 1.5 INSERT REGISTRATION REQUESTS (PENDING)
-- =====================================================
INSERT INTO registration_requests (id, user_type, email, first_name, last_name, company_name, position, phone, status, created_at)
VALUES
  (
    '00000000-0000-0000-0000-000000000901',
    'exhibitor',
    'pending-exhibitor@example.com',
    'Jean',
    'Enattente',
    'Future Port Tech',
    'CTO',
    '+33600000001',
    'pending',
    NOW() - INTERVAL '1 day'
  ),
  (
    '00000000-0000-0000-0000-000000000902',
    'partner',
    'pending-partner@example.com',
    'Alice',
    'Demande',
    'Global Logistics Partner',
    'Directrice',
    '+33600000002',
    'pending',
    NOW() - INTERVAL '2 hours'
  ),
  (
    '00000000-0000-0000-0000-000000000903',
    'exhibitor',
    'new-expo@example.com',
    'Marc',
    'Nouveau',
    'EcoShipping Solutions',
    'CEO',
    '+33600000003',
    'pending',
    NOW() - INTERVAL '5 hours'
  ),
  (
    '00000000-0000-0000-0000-000000000904',
    'visitor',
    'vip-request@example.com',
    'Sophie',
    'Vip',
    'Luxe Events',
    'Manager',
    '+33600000004',
    'pending',
    NOW() - INTERVAL '10 minutes'
  ),
  (
    '00000000-0000-0000-0000-000000000905',
    'exhibitor',
    'maritime-tech@example.com',
    'Thomas',
    'Marine',
    'Maritime Tech',
    'Sales',
    '+33600000005',
    'pending',
    NOW() - INTERVAL '3 days'
  )
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 2. INSERT EXHIBITOR PROFILES
-- =====================================================
INSERT INTO exhibitors (id, user_id, company_name, category, sector, description, website, logo_url, stand_number, featured, verified, created_at)
VALUES
  (
    '00000000-0000-0000-0000-000000000102',
    '00000000-0000-0000-0000-000000000002',
    'ABB Marine & Ports',
    'port-industry',
    'Technology',
    'Leader mondial en automatisation et électrification marine. Nous fournissons des solutions de pointe pour les ports et les navires.',
    'https://abb.com',
    'https://ui-avatars.com/api/?name=ABB+Marine&size=200',
    'D4-050',
    true,
    true,
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000103',
    '00000000-0000-0000-0000-000000000003',
    'Advanced Port Systems',
    'port-operations',
    'Automation',
    'Systèmes automatisés et IA pour optimisation portuaire. Spécialiste des terminaux à conteneurs intelligents.',
    'https://advancedportsys.cn',
    'https://ui-avatars.com/api/?name=Advanced+Port&size=200',
    'C3-027',
    true,
    true,
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000104',
    '00000000-0000-0000-0000-000000000004',
    'Maritime Equipment Co',
    'port-industry',
    'Equipment',
    'Fabricant d''équipements maritimes et portuaires de qualité. Grues, chariots cavaliers et solutions de manutention.',
    'https://maritimeequip.fr',
    'https://ui-avatars.com/api/?name=Maritime+Equip&size=200',
    'B2-015',
    true,
    true,
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000117',
    '00000000-0000-0000-0000-000000000017',
    'StartUp Port Innovations',
    'port-industry',
    'IoT',
    'Startup innovante en solutions IoT pour ports intelligents. Capteurs connectés et analyse de données en temps réel.',
    'https://startupportinno.com',
    'https://ui-avatars.com/api/?name=StartUp+Port&size=200',
    'A1-001',
    true,
    true,
    NOW()
  )
ON CONFLICT (id) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  category = EXCLUDED.category,
  sector = EXCLUDED.sector,
  description = EXCLUDED.description,
  website = EXCLUDED.website,
  logo_url = EXCLUDED.logo_url,
  stand_number = EXCLUDED.stand_number,
  featured = EXCLUDED.featured,
  verified = EXCLUDED.verified;

-- =====================================================
-- 2b. INSERT INTO exhibitor_profiles (pour la compatibilité)
-- =====================================================
INSERT INTO exhibitor_profiles (user_id, company_name, description, logo_url, website, sector, category, stand_number, stand_area, created_at)
VALUES
  ('00000000-0000-0000-0000-000000000002', 'ABB Marine & Ports', 'Leader mondial en automatisation et électrification marine.', 'https://ui-avatars.com/api/?name=ABB+Marine&size=200', 'https://abb.com', 'Technology', 'major_brand', 'D4-050', 60.0, NOW()),
  ('00000000-0000-0000-0000-000000000003', 'Advanced Port Systems', 'Systèmes automatisés et IA pour optimisation portuaire.', 'https://ui-avatars.com/api/?name=Advanced+Port&size=200', 'https://advancedportsys.cn', 'Automation', 'automation', 'C3-027', 36.0, NOW()),
  ('00000000-0000-0000-0000-000000000004', 'Maritime Equipment Co', 'Fabricant d''équipements maritimes et portuaires de qualité.', 'https://ui-avatars.com/api/?name=Maritime+Equip&size=200', 'https://maritimeequip.fr', 'Equipment', 'equipment', 'B2-015', 18.0, NOW()),
  ('00000000-0000-0000-0000-000000000017', 'StartUp Port Innovations', 'Startup innovante en solutions IoT pour ports intelligents.', 'https://ui-avatars.com/api/?name=StartUp+Port&size=200', 'https://startupportinno.com', 'IoT', 'startup', 'A1-001', 9.0, NOW())
ON CONFLICT (user_id) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  description = EXCLUDED.description,
  stand_number = EXCLUDED.stand_number;

-- =====================================================
-- 3. INSERT PARTNER PROFILES (dans partner_profiles)
-- =====================================================
INSERT INTO partner_profiles (id, user_id, company_name, contact_name, contact_email, description, website, logo_url, country, partnership_level, created_at)
VALUES
  (
    '00000000-0000-0000-0000-000000000105',
    '00000000-0000-0000-0000-000000000005',
    'Gold Partner Industries',
    'Marie Laurent',
    'contact@gold-partner.example.com',
    'Partenaire stratégique majeur offrant des services premium et un accompagnement personnalisé. Sponsor principal de l''événement SIPORTS 2025.',
    'https://gold-partner.example.com',
    'https://ui-avatars.com/api/?name=Gold+Partner&size=200',
    'France',
    'gold',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000106',
    '00000000-0000-0000-0000-000000000006',
    'Silver Tech Group',
    'Pierre Martin',
    'info@silver-tech.example.com',
    'Expert en solutions technologiques pour événements professionnels. Support technique et innovation digitale.',
    'https://silver-tech.example.com',
    'https://ui-avatars.com/api/?name=Silver+Tech&size=200',
    'France',
    'silver',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000107',
    '00000000-0000-0000-0000-000000000011',
    'Platinium Global Corp',
    'Sarah Connor',
    'contact@platinium-global.example.com',
    'Leader mondial de l''industrie, partenaire exclusif Platinium. Innovation et excellence.',
    'https://platinium-global.example.com',
    'https://ui-avatars.com/api/?name=Platinium+Global&size=200',
    'USA',
    'platinium',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000108',
    '00000000-0000-0000-0000-000000000012',
    'Museum Heritage',
    'Jean-Pierre Archives',
    'contact@museum-heritage.example.com',
    'Préservation du patrimoine maritime et portuaire. Partenaire culturel.',
    'https://museum-heritage.example.com',
    'https://ui-avatars.com/api/?name=Museum+Heritage&size=200',
    'France',
    'museum',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000109',
    '00000000-0000-0000-0000-000000000013',
    'Port Tech Systems',
    'Alex Tech',
    'contact@porttech.example.com',
    'Solutions logistiques avancées pour les ports modernes.',
    'https://porttech.example.com',
    'https://ui-avatars.com/api/?name=Port+Tech&size=200',
    'France',
    'platinium',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000110',
    '00000000-0000-0000-0000-000000000014',
    'Ocean Freight Services',
    'Sarah Ocean',
    'contact@oceanfreight.example.com',
    'Services de fret maritime et gestion de conteneurs.',
    'https://oceanfreight.example.com',
    'https://ui-avatars.com/api/?name=Ocean+Freight&size=200',
    'France',
    'gold',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000111',
    '00000000-0000-0000-0000-000000000015',
    'Coastal Shipping Co',
    'Marc Coast',
    'contact@coastal.example.com',
    'Transport maritime côtier et logistique régionale.',
    'https://coastal.example.com',
    'https://ui-avatars.com/api/?name=Coastal+Shipping&size=200',
    'France',
    'silver',
    NOW()
  )
ON CONFLICT (id) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  contact_name = EXCLUDED.contact_name,
  contact_email = EXCLUDED.contact_email,
  description = EXCLUDED.description,
  website = EXCLUDED.website,
  logo_url = EXCLUDED.logo_url,
  partnership_level = EXCLUDED.partnership_level;

-- =====================================================
-- 3b. INSERT INTO partners (pour la compatibilité UI)
-- =====================================================
INSERT INTO partners (id, user_id, company_name, partner_type, sector, description, logo_url, website, verified, featured, partnership_level, created_at)
VALUES
  (
    '00000000-0000-0000-0000-000000000105',
    '00000000-0000-0000-0000-000000000005',
    'Global Shipping Alliance',
    'strategic',
    'Logistique',
    'Alliance mondiale de compagnies de transport maritime offrant des services premium et un accompagnement personnalisé.',
    'https://ui-avatars.com/api/?name=Global+Shipping&size=200',
    'https://global-shipping.example.com',
    true,
    true,
    'gold',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000106',
    '00000000-0000-0000-0000-000000000006',
    'Silver Tech Group',
    'technology',
    'Technologie',
    'Expert en solutions technologiques pour événements professionnels.',
    'https://ui-avatars.com/api/?name=Silver+Tech&size=200',
    'https://silver-tech.example.com',
    true,
    true,
    'silver',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000107',
    '00000000-0000-0000-0000-000000000011',
    'Platinium Global Corp',
    'strategic',
    'Industrie',
    'Leader mondial de l''industrie, partenaire exclusif Platinium.',
    'https://ui-avatars.com/api/?name=Platinium+Global&size=200',
    'https://platinium-global.example.com',
    true,
    true,
    'platinium',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000108',
    '00000000-0000-0000-0000-000000000012',
    'Museum Heritage',
    'institutional',
    'Culture',
    'Institution culturelle partenaire pour la promotion du patrimoine maritime.',
    'https://ui-avatars.com/api/?name=Museum+Heritage&size=200',
    'https://museum.example.com',
    true,
    true,
    'museum',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000109',
    '00000000-0000-0000-0000-000000000013',
    'Port Tech Systems',
    'technology',
    'Exploitation & Gestion',
    'Solutions logistiques avancées pour les ports modernes.',
    'https://ui-avatars.com/api/?name=Port+Tech&size=200',
    'https://porttech.example.com',
    true,
    true,
    'platinium',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000110',
    '00000000-0000-0000-0000-000000000014',
    'Ocean Freight Services',
    'logistics',
    'Exploitation & Gestion',
    'Services de fret maritime et gestion de conteneurs.',
    'https://ui-avatars.com/api/?name=Ocean+Freight&size=200',
    'https://oceanfreight.example.com',
    true,
    true,
    'gold',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000111',
    '00000000-0000-0000-0000-000000000015',
    'Coastal Shipping Co',
    'logistics',
    'Industrie Portuaire',
    'Transport maritime côtier et logistique régionale.',
    'https://ui-avatars.com/api/?name=Coastal+Shipping&size=200',
    'https://coastal.example.com',
    true,
    true,
    'silver',
    NOW()
  )
ON CONFLICT (id) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  partner_type = EXCLUDED.partner_type,
  sector = EXCLUDED.sector,
  description = EXCLUDED.description,
  logo_url = EXCLUDED.logo_url,
  website = EXCLUDED.website,
  verified = EXCLUDED.verified,
  featured = EXCLUDED.featured,
  partnership_level = EXCLUDED.partnership_level;

-- =====================================================
-- 4. INSERT VISITOR PROFILES
-- =====================================================
INSERT INTO visitor_profiles (user_id, first_name, last_name, company, position, phone, country, visitor_type, pass_type, created_at)
VALUES
  (
    '00000000-0000-0000-0000-000000000007',
    'Jean',
    'Dupont',
    'Dupont Consulting',
    'Directeur Innovation',
    '+33612345678',
    'France',
    'professional',
    'vip',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000008',
    'Marie',
    'Martin',
    'Martin & Associés',
    'Chef de Projet',
    '+33612345679',
    'France',
    'professional',
    'standard',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000009',
    'Pierre',
    'Dubois',
    NULL,
    'Entrepreneur',
    '+33612345680',
    'France',
    'entrepreneur',
    'standard',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000010',
    'Sophie',
    'Bernard',
    NULL,
    'Étudiante',
    '+33612345681',
    'France',
    'student',
    'student',
    NOW()
  )
ON CONFLICT (user_id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  company = EXCLUDED.company,
  position = EXCLUDED.position;

-- =====================================================
-- 5. INSERT PAVILIONS
-- =====================================================
INSERT INTO pavilions (id, name, slug, description, color, icon, order_index, featured, created_at)
VALUES
  (
    '00000000-0000-0000-0000-000000000201',
    'Pavillon Innovation',
    'innovation',
    'Espace dédié aux technologies innovantes et startups du futur',
    '#3b82f6',
    'Zap',
    1,
    true,
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000202',
    'Pavillon Agritech',
    'agritech',
    'Solutions agricoles intelligentes et développement durable',
    '#10b981',
    'Sprout',
    2,
    false,
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000203',
    'Pavillon Luxe & Mode',
    'luxe-mode',
    'Haute couture et accessoires de luxe',
    '#ec4899',
    'Sparkles',
    3,
    false,
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 6. INSERT EVENTS
-- =====================================================
INSERT INTO events (id, title, description, type, category, event_date, start_time, end_time, start_date, end_date, location, pavilion_id, organizer_id, capacity, registered, is_featured, created_at)
VALUES
  (
    '00000000-0000-0000-0000-000000000301',
    'Conférence Innovation 2025',
    'Les dernières tendances en matière d''innovation technologique et digitale. Intervenants internationaux et sessions de networking.',
    'conference',
    'Innovation',
    CURRENT_DATE + INTERVAL '2 days',
    '09:00:00',
    '13:00:00',
    NOW() + INTERVAL '2 days',
    NOW() + INTERVAL '2 days' + INTERVAL '4 hours',
    'Salle Plenière A',
    '00000000-0000-0000-0000-000000000201',
    '00000000-0000-0000-0000-000000000001',
    200,
    87,
    true,
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000302',
    'Atelier Agriculture Durable',
    'Workshop pratique sur les techniques d''agriculture de précision et l''utilisation de l''IoT dans les exploitations.',
    'conference',
    'Agriculture',
    CURRENT_DATE + INTERVAL '3 days',
    '14:00:00',
    '17:00:00',
    NOW() + INTERVAL '3 days',
    NOW() + INTERVAL '3 days' + INTERVAL '3 hours',
    'Salle Workshop B1',
    '00000000-0000-0000-0000-000000000202',
    '00000000-0000-0000-0000-000000000001',
    50,
    32,
    false,
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000303',
    'Défilé Mode & Innovation',
    'Présentation exclusive des collections 2025 avec intégration de technologies wearables.',
    'conference',
    'Mode',
    CURRENT_DATE + INTERVAL '5 days',
    '10:00:00',
    '12:00:00',
    NOW() + INTERVAL '5 days',
    NOW() + INTERVAL '5 days' + INTERVAL '2 hours',
    'Podium Principal',
    '00000000-0000-0000-0000-000000000203',
    '00000000-0000-0000-0000-000000000001',
    300,
    156,
    true,
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000304',
    'Networking Business Leaders',
    'Session de networking exclusif pour dirigeants et décideurs. Cocktail et échanges professionnels.',
    'conference',
    'Business',
    CURRENT_DATE + INTERVAL '4 days',
    '18:00:00',
    '21:00:00',
    NOW() + INTERVAL '4 days',
    NOW() + INTERVAL '4 days' + INTERVAL '3 hours',
    'Salon VIP',
    NULL,
    '00000000-0000-0000-0000-000000000001',
    100,
    67,
    true,
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 7. INSERT NEWS ARTICLES
-- =====================================================

-- Ensure news_articles table exists and has correct columns
CREATE TABLE IF NOT EXISTS news_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
    -- Add columns if they don't exist
    BEGIN
        ALTER TABLE news_articles ADD COLUMN excerpt TEXT;
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE news_articles ADD COLUMN author_id UUID REFERENCES auth.users(id);
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE news_articles ADD COLUMN author TEXT;
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE news_articles ADD COLUMN published BOOLEAN DEFAULT false;
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE news_articles ADD COLUMN category TEXT;
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE news_articles ADD COLUMN tags TEXT[];
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE news_articles ADD COLUMN image_url TEXT;
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE news_articles ADD COLUMN published_at TIMESTAMPTZ;
    EXCEPTION WHEN duplicate_column THEN NULL; END;
END $$;

INSERT INTO news_articles (id, title, content, excerpt, author_id, author, published, published_at, category, tags, image_url, created_at)
VALUES
  (
    '00000000-0000-0000-0000-000000000401',
    'SIPORTS 2025 : Record d''affluence attendu',
    'Le salon SIPORTS 2025 s''annonce comme l''édition la plus importante de son histoire avec plus de 500 exposants confirmés et 50 000 visiteurs attendus. Cette année, l''accent est mis sur l''innovation durable et les technologies vertes...',
    'Le salon SIPORTS 2025 bat tous les records avec 500 exposants et 50 000 visiteurs attendus.',
    (SELECT id FROM users WHERE email = 'admin@siports.com' LIMIT 1),
    'Admin SIPORTS',
    true,
    NOW() - INTERVAL '2 days',
    'Événement',
    ARRAY['SIPORTS', 'Salon', 'Innovation'],
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    NOW() - INTERVAL '2 days'
  ),
  (
    '00000000-0000-0000-0000-000000000402',
    'TechExpo Solutions dévoile sa nouvelle plateforme VR',
    'L''exposant TechExpo Solutions présentera en exclusivité sa nouvelle plateforme de réalité virtuelle destinée aux salons professionnels. Une révolution dans l''expérience visiteur...',
    'TechExpo Solutions lance une plateforme VR révolutionnaire pour les salons.',
    (SELECT id FROM users WHERE email = 'admin@siports.com' LIMIT 1),
    'Admin SIPORTS',
    true,
    NOW() - INTERVAL '5 days',
    'Technologie',
    ARRAY['Innovation', 'Réalité Virtuelle', 'TechExpo'],
    'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=800',
    NOW() - INTERVAL '5 days'
  ),
  (
    '00000000-0000-0000-0000-000000000403',
    'Agriculture de demain : Les innovations d''AgriInnov',
    'AgriInnov présente ses dernières solutions IoT pour l''agriculture de précision. Des capteurs intelligents et des systèmes d''irrigation automatisés qui réduisent la consommation d''eau de 40%...',
    'AgriInnov révolutionne l''agriculture avec des solutions IoT innovantes.',
    (SELECT id FROM users WHERE email = 'admin@siports.com' LIMIT 1),
    'Admin SIPORTS',
    true,
    NOW() - INTERVAL '1 day',
    'Agriculture',
    ARRAY['AgriTech', 'Innovation', 'Développement Durable'],
    'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800',
    NOW() - INTERVAL '1 day'
  ),
  (
    '00000000-0000-0000-0000-000000000404',
    'ModeDesign Paris : La haute couture rencontre la tech',
    'La maison ModeDesign Paris fusionne tradition et innovation avec sa nouvelle collection intégrant des textiles intelligents et des accessoires connectés...',
    'ModeDesign Paris présente une collection alliant haute couture et technologies.',
    (SELECT id FROM users WHERE email = 'admin@siports.com' LIMIT 1),
    'Admin SIPORTS',
    true,
    NOW() - INTERVAL '3 days',
    'Mode',
    ARRAY['Mode', 'Innovation', 'Luxe'],
    'https://images.unsplash.com/photo-1558769132-cb1aea1f1c77?w=800',
    NOW() - INTERVAL '3 days'
  )
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 8. INSERT TIME SLOTS (Plus de créneaux pour calendriers)
-- =====================================================

-- Ensure time_slots table exists
CREATE TABLE IF NOT EXISTS time_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exhibitor_id UUID REFERENCES exhibitors(id),
  slot_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
    BEGIN
        ALTER TABLE time_slots ADD COLUMN exhibitor_id UUID REFERENCES exhibitors(id);
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE time_slots ADD COLUMN slot_date DATE;
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE time_slots ADD COLUMN start_time TIME;
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE time_slots ADD COLUMN end_time TIME;
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE time_slots ADD COLUMN duration INTEGER;
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE time_slots ADD COLUMN type TEXT;
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE time_slots ADD COLUMN max_bookings INTEGER DEFAULT 1;
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE time_slots ADD COLUMN current_bookings INTEGER DEFAULT 0;
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE time_slots ADD COLUMN available BOOLEAN DEFAULT true;
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE time_slots ADD COLUMN location TEXT;
    EXCEPTION WHEN duplicate_column THEN NULL; END;
END $$;

INSERT INTO time_slots (id, exhibitor_id, slot_date, start_time, end_time, duration, type, max_bookings, current_bookings, available, location, created_at)
VALUES
  -- TechExpo Solutions - Aujourd'hui
  (
    '00000000-0000-0000-0000-000000000501',
    '00000000-0000-0000-0000-000000000102',
    CURRENT_DATE,
    '09:00:00',
    '09:30:00',
    30,
    'in-person',
    3,
    2,
    true,
    'Stand A12 - Hall Innovation',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000502',
    '00000000-0000-0000-0000-000000000102',
    CURRENT_DATE,
    '10:00:00',
    '10:30:00',
    30,
    'in-person',
    3,
    1,
    true,
    'Stand A12 - Hall Innovation',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000503',
    '00000000-0000-0000-0000-000000000102',
    CURRENT_DATE,
    '14:00:00',
    '14:30:00',
    30,
    'virtual',
    5,
    3,
    true,
    'Salle VR - Démo en ligne',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000508',
    '00000000-0000-0000-0000-000000000102',
    CURRENT_DATE,
    '15:00:00',
    '15:30:00',
    30,
    'in-person',
    3,
    0,
    true,
    'Stand A12 - Hall Innovation',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000509',
    '00000000-0000-0000-0000-000000000102',
    CURRENT_DATE,
    '16:00:00',
    '16:30:00',
    30,
    'virtual',
    5,
    1,
    true,
    'Salle VR - Démo en ligne',
    NOW()
  ),
  -- TechExpo Solutions - Demain
  (
    '00000000-0000-0000-0000-000000000510',
    '00000000-0000-0000-0000-000000000102',
    CURRENT_DATE + INTERVAL '1 day',
    '09:00:00',
    '09:30:00',
    30,
    'in-person',
    3,
    1,
    true,
    'Stand A12 - Hall Innovation',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000511',
    '00000000-0000-0000-0000-000000000102',
    CURRENT_DATE + INTERVAL '1 day',
    '11:00:00',
    '11:30:00',
    30,
    'in-person',
    3,
    0,
    true,
    'Stand A12 - Hall Innovation',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000512',
    '00000000-0000-0000-0000-000000000102',
    CURRENT_DATE + INTERVAL '1 day',
    '14:00:00',
    '14:30:00',
    30,
    'virtual',
    5,
    1,
    true,
    'Salle VR - Démo en ligne',
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- APPOINTMENTS (Rendez-vous)
-- =====================================================

-- Ensure appointments table exists
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exhibitor_id UUID REFERENCES exhibitors(id),
  visitor_id UUID REFERENCES visitor_profiles(id),
  time_slot_id UUID REFERENCES time_slots(id),
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
    BEGIN
        ALTER TABLE appointments ADD COLUMN exhibitor_id UUID REFERENCES exhibitors(id);
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE appointments ADD COLUMN visitor_id UUID REFERENCES visitor_profiles(id);
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE appointments ADD COLUMN time_slot_id UUID REFERENCES time_slots(id);
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE appointments ADD COLUMN status TEXT DEFAULT 'pending';
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE appointments ADD COLUMN notes TEXT;
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE appointments ADD COLUMN meeting_type TEXT;
    EXCEPTION WHEN duplicate_column THEN NULL; END;
END $$;

-- Disable trigger to allow seeding data that might violate quotas (e.g. free user with confirmed appointment)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_check_visitor_quota') THEN
    ALTER TABLE public.appointments DISABLE TRIGGER trigger_check_visitor_quota;
  END IF;
END $$;

-- 8.5. INSERT MORE TIME SLOTS (AgriInnov & ModeDesign)
-- =====================================================
INSERT INTO time_slots (id, exhibitor_id, slot_date, start_time, end_time, duration, type, max_bookings, current_bookings, available, location, created_at)
VALUES
  -- AgriInnov - Aujourd'hui
  (
    '00000000-0000-0000-0000-000000000504',
    '00000000-0000-0000-0000-000000000103',
    CURRENT_DATE,
    '11:00:00',
    '11:30:00',
    30,
    'in-person',
    2,
    0,
    true,
    'Stand B07 - Hall Agritech',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000513',
    '00000000-0000-0000-0000-000000000103',
    CURRENT_DATE,
    '14:00:00',
    '14:30:00',
    30,
    'in-person',
    2,
    1,
    true,
    'Stand B07 - Hall Agritech',
    NOW()
  ),
  -- AgriInnov - Demain
  (
    '00000000-0000-0000-0000-000000000505',
    '00000000-0000-0000-0000-000000000103',
    CURRENT_DATE + INTERVAL '1 day',
    '10:00:00',
    '10:30:00',
    30,
    'in-person',
    2,
    1,
    true,
    'Stand B07 - Hall Agritech',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000515',
    '00000000-0000-0000-0000-000000000103',
    CURRENT_DATE + INTERVAL '1 day',
    '14:00:00',
    '14:30:00',
    30,
    'virtual',
    3,
    0,
    true,
    'Présentation IoT en ligne',
    NOW()
  ),
  -- ModeDesign Paris - Aujourd'hui
  (
    '00000000-0000-0000-0000-000000000506',
    '00000000-0000-0000-0000-000000000104',
    CURRENT_DATE,
    '10:00:00',
    '10:45:00',
    45,
    'in-person',
    1,
    1,
    false,
    'Showroom C12 - Luxe',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000516',
    '00000000-0000-0000-0000-000000000104',
    CURRENT_DATE,
    '11:30:00',
    '12:15:00',
    45,
    'in-person',
    1,
    0,
    true,
    'Showroom C12 - Luxe',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000517',
    '00000000-0000-0000-0000-000000000104',
    CURRENT_DATE,
    '15:00:00',
    '15:45:00',
    45,
    'in-person',
    1,
    1,
    false,
    'Showroom C12 - Luxe',
    NOW()
  ),
  -- ModeDesign Paris - Demain
  (
    '00000000-0000-0000-0000-000000000507',
    '00000000-0000-0000-0000-000000000104',
    CURRENT_DATE + INTERVAL '1 day',
    '13:00:00',
    '13:45:00',
    45,
    'in-person',
    1,
    0,
    true,
    'Showroom C12 - Luxe',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000518',
    '00000000-0000-0000-0000-000000000104',
    CURRENT_DATE + INTERVAL '1 day',
    '16:00:00',
    '16:45:00',
    45,
    'in-person',
    1,
    0,
    true,
    'Showroom C12 - Luxe',
    NOW()
  ),
  -- Créneaux pour dans 2 jours
  (
    '00000000-0000-0000-0000-000000000519',
    '00000000-0000-0000-0000-000000000102',
    CURRENT_DATE + INTERVAL '2 days',
    '10:00:00',
    '10:30:00',
    30,
    'in-person',
    3,
    0,
    true,
    'Stand A12 - Hall Innovation',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000520',
    '00000000-0000-0000-0000-000000000103',
    CURRENT_DATE + INTERVAL '2 days',
    '11:00:00',
    '11:30:00',
    30,
    'in-person',
    2,
    0,
    true,
    'Stand B07 - Hall Agritech',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000521',
    '00000000-0000-0000-0000-000000000104',
    CURRENT_DATE + INTERVAL '2 days',
    '14:00:00',
    '14:45:00',
    45,
    'in-person',
    1,
    0,
    true,
    'Showroom C12 - Luxe',
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO appointments (id, exhibitor_id, visitor_id, time_slot_id, status, notes, meeting_type, created_at)
VALUES
  -- Rendez-vous AUJOURD''HUI pour Jean Dupont (VIP Visitor)
  (
    '00000000-0000-0000-0000-000000000601',
    '00000000-0000-0000-0000-000000000102',
    '00000000-0000-0000-0000-000000000007',
    '00000000-0000-0000-0000-000000000501',
    'confirmed',
    'Intéressé par la solution VR pour notre prochain salon. Discussion approfondie prévue.',
    'in-person',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000610',
    '00000000-0000-0000-0000-000000000102',
    '00000000-0000-0000-0000-000000000007',
    '00000000-0000-0000-0000-000000000502',
    'confirmed',
    'Suite de notre discussion sur l''implémentation VR',
    'in-person',
    NOW()
  ),
  -- Rendez-vous AUJOURD'HUI pour Marie Martin (Premium Visitor)
  (
    '00000000-0000-0000-0000-000000000602',
    '00000000-0000-0000-0000-000000000102',
    '00000000-0000-0000-0000-000000000008',
    '00000000-0000-0000-0000-000000000503',
    'confirmed',
    'Démo de la plateforme VR complète avec cas d''usage agricole',
    'virtual',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000603',
    '00000000-0000-0000-0000-000000000103',
    '00000000-0000-0000-0000-000000000008',
    '00000000-0000-0000-0000-000000000504',
    'confirmed',
    'Discussion sur les solutions IoT pour exploitation agricole - capteurs et automatisation',
    'in-person',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000611',
    '00000000-0000-0000-0000-000000000103',
    '00000000-0000-0000-0000-000000000008',
    '00000000-0000-0000-0000-000000000513',
    'confirmed',
    'Démonstration des capteurs IoT en conditions réelles',
    'in-person',
    NOW()
  ),
  -- Rendez-vous AUJOURD'HUI pour Pierre Dubois (Basic Visitor)
  (
    '00000000-0000-0000-0000-000000000604',
    '00000000-0000-0000-0000-000000000104',
    '00000000-0000-0000-0000-000000000009',
    '00000000-0000-0000-0000-000000000506',
    'confirmed',
    'Présentation collection exclusive automne-hiver 2025',
    'in-person',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000612',
    '00000000-0000-0000-0000-000000000104',
    '00000000-0000-0000-0000-000000000009',
    '00000000-0000-0000-0000-000000000517',
    'confirmed',
    'Suite - Sélection de pièces sur-mesure',
    'in-person',
    NOW()
  ),
  -- Rendez-vous AUJOURD'HUI pour Sophie Bernard (Free Visitor)
  (
    '00000000-0000-0000-0000-000000000613',
    '00000000-0000-0000-0000-000000000102',
    '00000000-0000-0000-0000-000000000010',
    '00000000-0000-0000-0000-000000000509',
    'confirmed',
    'Découverte des technologies VR pour étudiants',
    'virtual',
    NOW()
  ),
  -- Rendez-vous DEMAIN pour Jean Dupont
  (
    '00000000-0000-0000-0000-000000000614',
    '00000000-0000-0000-0000-000000000102',
    '00000000-0000-0000-0000-000000000007',
    '00000000-0000-0000-0000-000000000510',
    'confirmed',
    'Point final sur le projet VR - prise de décision',
    'in-person',
    NOW()
  ),
  -- Rendez-vous DEMAIN pour Marie Martin
  (
    '00000000-0000-0000-0000-000000000615',
    '00000000-0000-0000-0000-000000000103',
    '00000000-0000-0000-0000-000000000008',
    '00000000-0000-0000-0000-000000000505',
    'confirmed',
    'Analyse des données IoT collectées - rapport personnalisé',
    'in-person',
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000616',
    '00000000-0000-0000-0000-000000000102',
    '00000000-0000-0000-0000-000000000008',
    '00000000-0000-0000-0000-000000000512',
    'pending',
    'Webinaire complet sur la transformation digitale',
    'virtual',
    NOW()
  ),
  -- Rendez-vous DEMAIN pour Pierre Dubois
  (
    '00000000-0000-0000-0000-000000000617',
    '00000000-0000-0000-0000-000000000104',
    '00000000-0000-0000-0000-000000000009',
    '00000000-0000-0000-0000-000000000507',
    'pending',
    'Essayage final et validation commande',
    'in-person',
    NOW()
  ),
  -- Rendez-vous passé (hier) - pour historique
  (
    '00000000-0000-0000-0000-000000000605',
    '00000000-0000-0000-0000-000000000102',
    '00000000-0000-0000-0000-000000000009',
    NULL,
    'completed',
    'Première prise de contact - très intéressant',
    'in-person',
    NOW() - INTERVAL '1 day'
  ),
  (
    '00000000-0000-0000-0000-000000000606',
    '00000000-0000-0000-0000-000000000103',
    '00000000-0000-0000-0000-000000000007',
    NULL,
    'completed',
    'Présentation des solutions AgriInnov - excellente session',
    'in-person',
    NOW() - INTERVAL '2 days'
  ),
  -- Rendez-vous annulé
  (
    '00000000-0000-0000-0000-000000000607',
    '00000000-0000-0000-0000-000000000104',
    '00000000-0000-0000-0000-000000000010',
    NULL,
    'cancelled',
    'Annulé à la demande du visiteur',
    'in-person',
    NOW() - INTERVAL '1 day'
  )
ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_check_visitor_quota') THEN
    ALTER TABLE public.appointments ENABLE TRIGGER trigger_check_visitor_quota;
  END IF;
END $$;

-- =====================================================
-- 8.5. INSERT MORE TIME SLOTS (AgriInnov & ModeDesign) - MOVED UP BEFORE APPOINTMENTS
-- =====================================================
-- (Moved to ensure FK constraints are satisfied)


-- =====================================================
-- 10. INSERT CONNECTIONS (Visibles dans calendriers via rendez-vous)
-- =====================================================

-- Ensure connections table exists
CREATE TABLE IF NOT EXISTS connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id UUID REFERENCES auth.users(id),
  addressee_id UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
    BEGIN
        ALTER TABLE connections ADD COLUMN requester_id UUID REFERENCES auth.users(id);
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE connections ADD COLUMN addressee_id UUID REFERENCES auth.users(id);
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE connections ADD COLUMN status TEXT DEFAULT 'pending';
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE connections ADD COLUMN message TEXT;
    EXCEPTION WHEN duplicate_column THEN NULL; END;
END $$;

INSERT INTO connections (id, requester_id, addressee_id, status, message, created_at)
VALUES
  -- Jean Dupont (VIP) connecté avec Marie Martin (Premium)
  (
    '00000000-0000-0000-0000-000000000701',
    '00000000-0000-0000-0000-000000000007',
    '00000000-0000-0000-0000-000000000008',
    'accepted',
    'Ravi de vous rencontrer au salon. Échangeons sur nos projets communs en innovation.',
    NOW() - INTERVAL '1 day'
  ),
  -- Jean Dupont connecté avec TechExpo (Exposant)
  (
    '00000000-0000-0000-0000-000000000702',
    '00000000-0000-0000-0000-000000000007',
    '00000000-0000-0000-0000-000000000002',
    'accepted',
    'Très intéressé par vos solutions technologiques VR. Discussion approfondie nécessaire.',
    NOW() - INTERVAL '2 days'
  ),
  -- Marie Martin connectée avec AgriInnov (Exposant)
  (
    '00000000-0000-0000-0000-000000000703',
    '00000000-0000-0000-0000-000000000008',
    '00000000-0000-0000-0000-000000000003',
    'accepted',
    'Vos solutions IoT correspondent parfaitement à nos besoins en agriculture durable.',
    NOW() - INTERVAL '3 days'
  ),
  -- Pierre Dubois connecté avec ModeDesign (Exposant)
  (
    '00000000-0000-0000-0000-000000000704',
    '00000000-0000-0000-0000-000000000009',
    '00000000-0000-0000-0000-000000000004',
    'accepted',
    'Collaboration potentielle dans le domaine de la mode innovante.',
    NOW() - INTERVAL '1 day'
  ),
  -- Sophie Bernard connectée avec Jean Dupont (Networking)
  (
    '00000000-0000-0000-0000-000000000705',
    '00000000-0000-0000-0000-000000000010',
    '00000000-0000-0000-0000-000000000007',
    'accepted',
    'Networking étudiant-professionnel. Merci pour vos conseils!',
    NOW() - INTERVAL '2 days'
  ),
  -- Marie Martin connectée avec Pierre Dubois
  (
    '00000000-0000-0000-0000-000000000706',
    '00000000-0000-0000-0000-000000000008',
    '00000000-0000-0000-0000-000000000009',
    'accepted',
    'Intérêts communs en innovation et design durable',
    NOW() - INTERVAL '1 day'
  ),
  -- Jean Dupont connecté avec AgriInnov
  (
    '00000000-0000-0000-0000-000000000707',
    '00000000-0000-0000-0000-000000000007',
    '00000000-0000-0000-0000-000000000003',
    'accepted',
    'Exploration de synergies entre technologie et agriculture',
    NOW() - INTERVAL '4 days'
  ),
  -- Sophie Bernard connectée avec TechExpo
  (
    '00000000-0000-0000-0000-000000000708',
    '00000000-0000-0000-0000-000000000010',
    '00000000-0000-0000-0000-000000000002',
    'accepted',
    'Opportunité de stage - merci pour votre accueil!',
    NOW() - INTERVAL '1 day'
  ),
  -- Pierre Dubois connecté avec Jean Dupont
  (
    '00000000-0000-0000-0000-000000000709',
    '00000000-0000-0000-0000-000000000009',
    '00000000-0000-0000-0000-000000000007',
    'pending',
    'J''aimerais échanger sur votre expérience en consulting',
    NOW()
  ),
  -- Marie Martin connectée avec Gold Partner
  (
    '00000000-0000-0000-0000-000000000710',
    '00000000-0000-0000-0000-000000000008',
    '00000000-0000-0000-0000-000000000005',
    'accepted',
    'Partenariat stratégique pour projets agricoles innovants',
    NOW() - INTERVAL '5 days'
  ),
  -- Exposants connectés entre eux
  (
    '00000000-0000-0000-0000-000000000711',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000003',
    'accepted',
    'Collaboration TechExpo x AgriInnov - solutions VR pour agriculture',
    NOW() - INTERVAL '6 days'
  ),
  (
    '00000000-0000-0000-0000-000000000712',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000004',
    'accepted',
    'Innovation mode & tech - projet wearables',
    NOW() - INTERVAL '4 days'
  ),
  -- Partenaires et exposants
  (
    '00000000-0000-0000-0000-000000000713',
    '00000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000002',
    'accepted',
    'Gold Partner sponsoring TechExpo Solutions',
    NOW() - INTERVAL '10 days'
  ),
  (
    '00000000-0000-0000-0000-000000000714',
    '00000000-0000-0000-0000-000000000006',
    '00000000-0000-0000-0000-000000000003',
    'accepted',
    'Support technique Silver Tech pour AgriInnov',
    NOW() - INTERVAL '7 days'
  ),
  -- Connexions en attente
  (
    '00000000-0000-0000-0000-000000000715',
    '00000000-0000-0000-0000-000000000010',
    '00000000-0000-0000-0000-000000000004',
    'pending',
    'Étudiante intéressée par le secteur de la mode',
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 11. INSERT CONVERSATIONS
-- =====================================================

-- Ensure conversations table exists
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT DEFAULT 'direct',
  participants UUID[],
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
    BEGIN
        ALTER TABLE conversations ADD COLUMN type TEXT DEFAULT 'direct';
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE conversations ADD COLUMN participants UUID[];
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE conversations ADD COLUMN created_by UUID REFERENCES auth.users(id);
    EXCEPTION WHEN duplicate_column THEN NULL; END;
END $$;

INSERT INTO conversations (id, type, participants, created_by, created_at)
VALUES
  (
    '00000000-0000-0000-0000-000000000801',
    'direct',
    ARRAY['00000000-0000-0000-0000-000000000007'::uuid, '00000000-0000-0000-0000-000000000008'::uuid],
    '00000000-0000-0000-0000-000000000007',
    NOW() - INTERVAL '2 days'
  ),
  (
    '00000000-0000-0000-0000-000000000802',
    'direct',
    ARRAY['00000000-0000-0000-0000-000000000007'::uuid, '00000000-0000-0000-0000-000000000002'::uuid],
    '00000000-0000-0000-0000-000000000007',
    NOW() - INTERVAL '1 day'
  ),
  (
    '00000000-0000-0000-0000-000000000803',
    'direct',
    ARRAY['00000000-0000-0000-0000-000000000008'::uuid, '00000000-0000-0000-0000-000000000003'::uuid],
    '00000000-0000-0000-0000-000000000008',
    NOW() - INTERVAL '3 hours'
  )
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 12. INSERT MESSAGES
-- =====================================================

-- Ensure messages table exists
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id),
  sender_id UUID REFERENCES auth.users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

DO $$
BEGIN
    BEGIN
        ALTER TABLE messages ADD COLUMN conversation_id UUID REFERENCES conversations(id);
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE messages ADD COLUMN sender_id UUID REFERENCES auth.users(id);
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE messages ADD COLUMN content TEXT;
    EXCEPTION WHEN duplicate_column THEN NULL; END;
END $$;

INSERT INTO messages (id, conversation_id, sender_id, content, created_at)
VALUES
  (
    '00000000-0000-0000-0000-000000000901',
    '00000000-0000-0000-0000-000000000801',
    '00000000-0000-0000-0000-000000000007',
    'Bonjour Marie, ravi de vous avoir rencontrée au salon !',
    NOW() - INTERVAL '2 days'
  ),
  (
    '00000000-0000-0000-0000-000000000902',
    '00000000-0000-0000-0000-000000000801',
    '00000000-0000-0000-0000-000000000008',
    'Bonjour Jean, moi de même. Votre présentation était très intéressante.',
    NOW() - INTERVAL '2 days' + INTERVAL '15 minutes'
  ),
  (
    '00000000-0000-0000-0000-000000000903',
    '00000000-0000-0000-0000-000000000801',
    '00000000-0000-0000-0000-000000000007',
    'Merci ! On pourrait organiser une réunion la semaine prochaine ?',
    NOW() - INTERVAL '2 days' + INTERVAL '30 minutes'
  ),
  (
    '00000000-0000-0000-0000-000000000904',
    '00000000-0000-0000-0000-000000000802',
    '00000000-0000-0000-0000-000000000007',
    'Bonjour, je suis intéressé par votre solution VR.',
    NOW() - INTERVAL '1 day'
  ),
  (
    '00000000-0000-0000-0000-000000000905',
    '00000000-0000-0000-0000-000000000802',
    '00000000-0000-0000-0000-000000000002',
    'Bonjour ! Nous serions ravis de vous faire une démonstration. Êtes-vous disponible demain ?',
    NOW() - INTERVAL '1 day' + INTERVAL '2 hours'
  ),
  (
    '00000000-0000-0000-0000-000000000906',
    '00000000-0000-0000-0000-000000000803',
    '00000000-0000-0000-0000-000000000008',
    'Bonjour AgriInnov, vos solutions IoT m''intéressent beaucoup.',
    NOW() - INTERVAL '3 hours'
  ),
  (
    '00000000-0000-0000-0000-000000000907',
    '00000000-0000-0000-0000-000000000803',
    '00000000-0000-0000-0000-000000000003',
    'Merci pour votre intérêt ! Nous avons plusieurs solutions adaptées à différents types d''exploitations.',
    NOW() - INTERVAL '2 hours'
  )
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 13. INSERT USER FAVORITES
-- =====================================================

-- Ensure user_favorites table exists with correct constraints
DROP TABLE IF EXISTS user_favorites CASCADE;
CREATE TABLE user_favorites (
  user_id UUID REFERENCES auth.users(id),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, entity_type, entity_id)
);

INSERT INTO user_favorites (user_id, entity_type, entity_id, created_at)
VALUES
  ('00000000-0000-0000-0000-000000000007', 'exhibitor', '00000000-0000-0000-0000-000000000102', NOW()),
  ('00000000-0000-0000-0000-000000000007', 'exhibitor', '00000000-0000-0000-0000-000000000103', NOW()),
  ('00000000-0000-0000-0000-000000000007', 'event', '00000000-0000-0000-0000-000000000301', NOW()),
  ('00000000-0000-0000-0000-000000000008', 'exhibitor', '00000000-0000-0000-0000-000000000103', NOW()),
  ('00000000-0000-0000-0000-000000000008', 'event', '00000000-0000-0000-0000-000000000302', NOW()),
  ('00000000-0000-0000-0000-000000000009', 'exhibitor', '00000000-0000-0000-0000-000000000104', NOW()),
  ('00000000-0000-0000-0000-000000000009', 'event', '00000000-0000-0000-0000-000000000303', NOW())
ON CONFLICT (user_id, entity_type, entity_id) DO NOTHING;

-- =====================================================
-- 14. INSERT DAILY QUOTAS
-- =====================================================

-- Ensure daily_quotas table exists with correct constraints
DROP TABLE IF EXISTS daily_quotas CASCADE;
CREATE TABLE daily_quotas (
  user_id UUID REFERENCES auth.users(id),
  quota_date DATE NOT NULL,
  connections_used INTEGER DEFAULT 0,
  messages_used INTEGER DEFAULT 0,
  meetings_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, quota_date)
);

INSERT INTO daily_quotas (user_id, quota_date, connections_used, messages_used, meetings_used, created_at)
VALUES
  ('00000000-0000-0000-0000-000000000007', CURRENT_DATE, 2, 5, 1, NOW()),
  ('00000000-0000-0000-0000-000000000008', CURRENT_DATE, 1, 3, 2, NOW()),
  ('00000000-0000-0000-0000-000000000009', CURRENT_DATE, 1, 1, 1, NOW()),
  ('00000000-0000-0000-0000-000000000010', CURRENT_DATE, 0, 0, 0, NOW())
ON CONFLICT (user_id, quota_date) DO UPDATE SET
  connections_used = EXCLUDED.connections_used,
  messages_used = EXCLUDED.messages_used,
  meetings_used = EXCLUDED.meetings_used;

-- =====================================================
-- 15. INSERT MINI-SITES (Pages exposants avec sections hero, about, contact)
-- =====================================================

-- Ensure mini_sites table exists
CREATE TABLE IF NOT EXISTS mini_sites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exhibitor_id UUID REFERENCES exhibitors(id),
  theme TEXT DEFAULT 'modern',
  custom_colors JSONB,
  sections JSONB,
  published BOOLEAN DEFAULT false,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
    BEGIN
        ALTER TABLE mini_sites ADD COLUMN exhibitor_id UUID REFERENCES exhibitors(id);
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE mini_sites ADD COLUMN theme TEXT DEFAULT 'modern';
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE mini_sites ADD COLUMN custom_colors JSONB;
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE mini_sites ADD COLUMN sections JSONB;
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE mini_sites ADD COLUMN published BOOLEAN DEFAULT false;
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE mini_sites ADD COLUMN views INTEGER DEFAULT 0;
    EXCEPTION WHEN duplicate_column THEN NULL; END;
END $$;

INSERT INTO mini_sites (id, exhibitor_id, theme, custom_colors, sections, published, views, created_at)
VALUES
  -- ABB Marine & Ports Mini-Site
  (
    '00000000-0000-0000-0000-000000001001',
    '00000000-0000-0000-0000-000000000102',
    'modern',
    '{"primary": "#ff0000", "secondary": "#333333", "accent": "#666666"}',
    '[
      {"type": "hero", "title": "ABB Marine & Ports", "subtitle": "L''avenir de la navigation est électrique, numérique et connecté", "image": "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=1200", "cta_text": "Découvrir nos solutions", "cta_link": "#products"},
      {"type": "about", "title": "À propos de nous", "content": "ABB Marine & Ports est le leader mondial en automatisation et électrification marine. Nous fournissons des solutions de pointe pour les ports et les navires, permettant une exploitation plus efficace et durable.", "image": "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800"},
      {"type": "contact", "title": "Contactez-nous", "email": "contact@abb.com", "phone": "+46 10 242 4000", "address": "Affolternstrasse 44, 8050 Zurich, Suisse", "form_enabled": true}
    ]',
    true,
    2500,
    NOW()
  ),
  -- Advanced Port Systems Mini-Site
  (
    '00000000-0000-0000-0000-000000001002',
    '00000000-0000-0000-0000-000000000103',
    'nature',
    '{"primary": "#1e40af", "secondary": "#3b82f6", "accent": "#4ade80"}',
    '[
      {"type": "hero", "title": "Advanced Port Systems", "subtitle": "Optimisation portuaire par l''IA", "image": "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200", "cta_text": "Explorer nos solutions", "cta_link": "#products"},
      {"type": "about", "title": "Notre mission", "content": "Advanced Port Systems développe des systèmes automatisés et des solutions d''IA pour l''optimisation des terminaux portuaires. Nos technologies permettent d''augmenter la productivité de 30%.", "image": "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800"},
      {"type": "contact", "title": "Nous contacter", "email": "contact@advancedportsys.cn", "phone": "+86 138 0013 8000", "address": "Tech Park, Shanghai, Chine", "form_enabled": true}
    ]',
    true,
    1200,
    NOW()
  ),
  -- Maritime Equipment Co Mini-Site
  (
    '00000000-0000-0000-0000-000000001003',
    '00000000-0000-0000-0000-000000000104',
    'elegant',
    '{"primary": "#16a34a", "secondary": "#22c55e", "accent": "#a78bfa"}',
    '[
      {"type": "hero", "title": "Maritime Equipment Co", "subtitle": "L''excellence en équipement portuaire", "image": "https://images.unsplash.com/photo-1558769132-cb1aea1f1c77?w=1200", "cta_text": "Voir le catalogue", "cta_link": "#products"},
      {"type": "about", "title": "Notre maison", "content": "Maritime Equipment Co est un fabricant français d''équipements maritimes et portuaires de haute qualité. Nous équipons les plus grands ports mondiaux depuis plus de 50 ans.", "image": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800"},
      {"type": "contact", "title": "Demander un devis", "email": "contact@maritimeequip.fr", "phone": "+33 6 56 78 90 12", "address": "Zone Portuaire, Marseille, France", "form_enabled": true}
    ]',
    true,
    800,
    NOW()
  ),
  -- StartUp Port Innovations Mini-Site
  (
    '00000000-0000-0000-0000-000000001004',
    '00000000-0000-0000-0000-000000000117',
    'modern',
    '{"primary": "#0ea5e9", "secondary": "#0f172a", "accent": "#f59e0b"}',
    '[
      {"type": "hero", "title": "StartUp Port Innovations", "subtitle": "L''IoT au service de la performance portuaire", "image": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200", "cta_text": "Découvrir nos capteurs", "cta_link": "#products"},
      {"type": "about", "title": "Innovation IoT", "content": "Nous transformons les ports traditionnels en ports intelligents grâce à nos capteurs IoT brevetés et notre plateforme d''analyse prédictive.", "image": "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800"},
      {"type": "contact", "title": "Rejoignez la révolution", "email": "hello@startupportinno.com", "phone": "+33 7 89 01 23 45", "address": "Station F, Paris, France", "form_enabled": true}
    ]',
    false,
    450,
    NOW()
  )
ON CONFLICT (id) DO UPDATE SET
  theme = EXCLUDED.theme,
  custom_colors = EXCLUDED.custom_colors,
  sections = EXCLUDED.sections,
  published = EXCLUDED.published,
  views = EXCLUDED.views;

-- =====================================================
-- 16. INSERT PRODUCTS (Produits des exposants)
-- =====================================================

-- Ensure products table exists
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exhibitor_id UUID REFERENCES exhibitors(id),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  images TEXT[],
  price NUMERIC,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
    BEGIN
        ALTER TABLE products ADD COLUMN exhibitor_id UUID REFERENCES exhibitors(id);
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE products ADD COLUMN name TEXT;
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE products ADD COLUMN description TEXT;
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE products ADD COLUMN category TEXT;
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE products ADD COLUMN images TEXT[];
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE products ADD COLUMN price NUMERIC;
    EXCEPTION WHEN duplicate_column THEN NULL; END;

    BEGIN
        ALTER TABLE products ADD COLUMN featured BOOLEAN DEFAULT false;
    EXCEPTION WHEN duplicate_column THEN NULL; END;
END $$;

INSERT INTO products (id, exhibitor_id, name, description, category, images, price, featured, created_at)
VALUES
  -- ABB Marine & Ports Products
  (
    '00000000-0000-0000-0000-000000002001',
    '00000000-0000-0000-0000-000000000102',
    'Azipod® Propulsion',
    'Système de propulsion électrique révolutionnaire pour navires, offrant une manœuvrabilité exceptionnelle et une efficacité énergétique accrue.',
    'Propulsion',
    ARRAY['https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=600'],
    NULL,
    true,
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000002002',
    '00000000-0000-0000-0000-000000000102',
    'Shore-to-Ship Power',
    'Solution d''alimentation électrique à quai permettant aux navires de couper leurs moteurs auxiliaires au port, réduisant les émissions.',
    'Énergie',
    ARRAY['https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600'],
    NULL,
    true,
    NOW()
  ),
  -- Advanced Port Systems Products
  (
    '00000000-0000-0000-0000-000000002004',
    '00000000-0000-0000-0000-000000000103',
    'Smart Terminal AI',
    'Système d''IA pour la gestion optimisée des terminaux à conteneurs. Planification automatique des grues et des véhicules.',
    'Logiciel',
    ARRAY['https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=600'],
    NULL,
    true,
    NOW()
  ),
  -- Maritime Equipment Co Products
  (
    '00000000-0000-0000-0000-000000002007',
    '00000000-0000-0000-0000-000000000104',
    'Heavy Lift Crane X1',
    'Grue portuaire haute performance pour charges lourdes. Capacité de levage de 100 tonnes avec précision millimétrique.',
    'Équipement',
    ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600'],
    NULL,
    true,
    NOW()
  ),
  -- StartUp Port Innovations Products
  (
    '00000000-0000-0000-0000-000000002010',
    '00000000-0000-0000-0000-000000000117',
    'Smart Sensor Node V2',
    'Capteur IoT multi-paramètres pour le suivi en temps réel des conditions environnementales et structurelles des quais.',
    'IoT',
    ARRAY['https://images.unsplash.com/photo-1518770660439-4636190af475?w=600'],
    NULL,
    true,
    NOW()
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  images = EXCLUDED.images,
  price = EXCLUDED.price,
  featured = EXCLUDED.featured;

-- =====================================================
-- BULK DATA FOR METRICS (300+ Exhibitors, 6000+ Visitors)
-- =====================================================
DO $$
DECLARE
  i INTEGER;
  v_user_id UUID;
  v_countries TEXT[] := ARRAY['France', 'Belgique', 'Suisse', 'Canada', 'Maroc', 'Sénégal', 'Côte d''Ivoire', 'Tunisie', 'Algérie', 'Luxembourg', 'Monaco', 'Liban', 'Vietnam', 'Maurice', 'Madagascar', 'Gabon', 'Congo', 'Togo', 'Bénin', 'Guinée', 'Mali', 'Niger', 'Burkina Faso', 'Tchad', 'Centrafrique', 'Djibouti', 'Comores', 'Seychelles', 'Vanuatu', 'Haïti', 'Sainte-Lucie', 'Dominique', 'Grenade', 'Saint-Vincent', 'Antigua', 'Saint-Kitts', 'Maurice', 'Seychelles', 'Vanuatu', 'Haïti'];
  v_categories TEXT[] := ARRAY['institutional', 'port-industry', 'port-operations', 'academic'];
BEGIN
  -- Insert 300 Exhibitors
  FOR i IN 1..300 LOOP
    v_user_id := gen_random_uuid();
    
    INSERT INTO public.users (id, email, name, type, status, created_at)
    VALUES (v_user_id, 'exhibitor-bulk-' || i || '@demo.siport.com', 'Exposant ' || i, 'exhibitor', 'active', NOW() - (i || ' minutes')::interval);
    
    INSERT INTO public.exhibitors (id, user_id, company_name, category, sector, description, verified, created_at)
    VALUES (gen_random_uuid(), v_user_id, 'Company ' || i, v_categories[(i % 4) + 1]::exhibitor_category, 'Secteur ' || (i % 5 + 1), 'Description de l''exposant ' || i, true, NOW() - (i || ' minutes')::interval);
    
    INSERT INTO public.exhibitor_profiles (id, user_id, company_name, country, sector, created_at)
    VALUES (gen_random_uuid(), v_user_id, 'Company ' || i, v_countries[(i % 40) + 1], 'Secteur ' || (i % 5 + 1), NOW() - (i || ' minutes')::interval);
  END LOOP;

  -- Insert 6000 Visitors
  FOR i IN 1..6000 LOOP
    v_user_id := gen_random_uuid();
    
    INSERT INTO public.users (id, email, name, type, status, created_at)
    VALUES (v_user_id, 'visitor-bulk-' || i || '@demo.siport.com', 'Visiteur ' || i, 'visitor', 'active', NOW() - (i || ' seconds')::interval);
    
    INSERT INTO public.visitor_profiles (id, user_id, first_name, last_name, country, created_at)
    VALUES (gen_random_uuid(), v_user_id, 'Visiteur', i::text, v_countries[(i % 40) + 1], NOW() - (i || ' seconds')::interval);
  END LOOP;

  -- Insert 30 Events
  FOR i IN 1..30 LOOP
    INSERT INTO public.events (id, title, description, event_type, type, category, event_date, start_time, end_time, start_date, end_date, location, created_at)
    VALUES (gen_random_uuid(), 'Conférence ' || i, 'Description de la conférence ' || i, 'conference', 'conference', 'Innovation', NOW() + (i || ' hours')::interval, '09:00:00', '10:00:00', NOW() + (i || ' hours')::interval, NOW() + (i + 1 || ' hours')::interval, 'Salle ' || (i % 5 + 1), NOW());
  END LOOP;
END $$;

-- =====================================================
-- FINAL COMMENTS
-- =====================================================
COMMENT ON COLUMN users.visitor_level IS 'Visitor subscription level: free, basic, premium, vip';
COMMENT ON TABLE exhibitors IS 'Exhibitor company profiles and information';
COMMENT ON TABLE partners IS 'Partner company profiles with tier levels';
COMMENT ON TABLE visitor_profiles IS 'Detailed visitor profile information';
COMMENT ON TABLE events IS 'Salon events, conferences, and workshops';
COMMENT ON TABLE news_articles IS 'News articles and announcements';
COMMENT ON TABLE appointments IS 'Scheduled appointments between visitors and exhibitors';
COMMENT ON TABLE connections IS 'Professional connections and networking requests';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Demo data successfully seeded for presentation!';
  RAISE NOTICE 'Created: 10 users (1 admin, 3 exhibitors, 2 partners, 4 visitors)';
  RAISE NOTICE 'Created: 3 exhibitor profiles, 2 partner profiles, 4 visitor profiles';
  RAISE NOTICE 'Created: 3 pavilions, 4 events, 4 news articles';
  RAISE NOTICE 'Created: 22 time slots (today + tomorrow + day after)';
  RAISE NOTICE 'Created: 15 appointments (confirmed, pending, completed, cancelled)';
  RAISE NOTICE 'Created: 15 professional connections (exposants, visiteurs, partenaires)';
  RAISE NOTICE 'Created: 3 conversations, 7 messages, favorites, quotas';
  RAISE NOTICE 'Created: 3 mini-sites complets avec sections (hero, about, contact)';
  RAISE NOTICE 'Created: 9 produits de démonstration (3 par exposant)';
  RAISE NOTICE '';
  RAISE NOTICE '📅 CALENDRIERS REMPLIS:';
  RAISE NOTICE '  - Jean Dupont (VIP): 3 RDV aujourd''hui, 1 demain';
  RAISE NOTICE '  - Marie Martin (Premium): 3 RDV aujourd''hui, 2 demain';
  RAISE NOTICE '  - Pierre Dubois (Basic): 2 RDV aujourd''hui, 1 demain';
  RAISE NOTICE '  - Sophie Bernard (Free): 1 RDV aujourd''hui';
  RAISE NOTICE '  - TechExpo Solutions: 8 créneaux disponibles';
  RAISE NOTICE '  - AgriInnov: 6 créneaux disponibles';
  RAISE NOTICE '  - ModeDesign Paris: 6 créneaux disponibles';
  RAISE NOTICE '';
  RAISE NOTICE '🌐 MINI-SITES EXPOSANTS:';
  RAISE NOTICE '  - TechExpo Solutions: /minisite/00000000-0000-0000-0000-000000000102';
  RAISE NOTICE '  - AgriInnov: /minisite/00000000-0000-0000-0000-000000000103';
  RAISE NOTICE '  - ModeDesign Paris: /minisite/00000000-0000-0000-0000-000000000104';
  RAISE NOTICE '';
  RAISE NOTICE '🤝 CONNEXIONS PROFESSIONNELLES:';
  RAISE NOTICE '  - 12 connexions acceptées (visibles dans tous les calendriers)';
  RAISE NOTICE '  - 3 connexions en attente';
  RAISE NOTICE '  - Réseau complet entre exposants, visiteurs et partenaires';
END $$;
