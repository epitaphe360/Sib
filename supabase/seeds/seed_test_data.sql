-- ========================================
-- DONNÉES DE TEST SIB 2026
-- ========================================
-- Créer des comptes de test pour chaque type de dashboard
-- Password pour tous les comptes: Test@123456
-- ========================================
-- IMPORTANT: Ce fichier nécessite que TOUTES les migrations soient appliquées avant exécution
-- Exécuter: supabase db push
-- ========================================

-- Temporarily disable triggers that might cause errors during seed
-- These triggers try to auto-generate badges but reference tables that might not exist
DO $$
BEGIN
  -- Disable badge auto-generation triggers if they exist
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_auto_generate_badge_on_insert') THEN
    ALTER TABLE users DISABLE TRIGGER trigger_auto_generate_badge_on_insert;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_auto_generate_badge_on_update') THEN
    ALTER TABLE users DISABLE TRIGGER trigger_auto_generate_badge_on_update;
  END IF;

  RAISE NOTICE 'Triggers temporairement désactivés pour le seed';
END $$;

-- Nettoyer les données de test existantes (seulement les emails de test)
-- Utiliser DO block pour gérer les tables qui n'existent pas encore
DO $$
BEGIN
  -- Nettoyer leads si la table existe
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'leads') THEN
    DELETE FROM leads WHERE scanner_id IN (
      SELECT id FROM users WHERE email LIKE '%@test.sib2026.ma'
    );
  END IF;

  -- Nettoyer quota_usage si la table existe
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'quota_usage') THEN
    DELETE FROM quota_usage WHERE user_id IN (
      SELECT id FROM users WHERE email LIKE '%@test.sib2026.ma'
    );
  END IF;

  -- Nettoyer user_upgrades si la table existe
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_upgrades') THEN
    DELETE FROM user_upgrades WHERE user_id IN (
      SELECT id FROM users WHERE email LIKE '%@test.sib2026.ma'
    );
  END IF;

  -- Nettoyer user_badges si la table existe
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_badges') THEN
    DELETE FROM user_badges WHERE user_id IN (
      SELECT id FROM users WHERE email LIKE '%@test.sib2026.ma'
    );
  END IF;

  -- Nettoyer exhibitor_profiles
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'exhibitor_profiles') THEN
    DELETE FROM exhibitor_profiles WHERE user_id IN (
      SELECT id FROM users WHERE email LIKE '%@test.sib2026.ma'
    );
  END IF;

  -- Nettoyer partner_profiles
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'partner_profiles') THEN
    DELETE FROM partner_profiles WHERE user_id IN (
      SELECT id FROM users WHERE email LIKE '%@test.sib2026.ma'
    );
  END IF;

  -- Nettoyer visitor_profiles
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'visitor_profiles') THEN
    DELETE FROM visitor_profiles WHERE user_id IN (
      SELECT id FROM users WHERE email LIKE '%@test.sib2026.ma'
    );
  END IF;

  -- Nettoyer users
  DELETE FROM users WHERE email LIKE '%@test.sib2026.ma';

  RAISE NOTICE 'Nettoyage des données de test terminé';
END $$;

-- ========================================
-- 1. VISITEURS (2 comptes: FREE + VIP)
-- ========================================

-- Visiteur FREE (0 rendez-vous, badge only)
INSERT INTO users (
  id,
  email,
  name,
  type,
  visitor_level,
  created_at
) VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'visitor-free@test.sib2026.ma',
  'Jean Dupont',
  'visitor',
  'free',
  now()
);

INSERT INTO visitor_profiles (
  user_id,
  first_name,
  last_name,
  company,
  position,
  phone,
  country,
  visitor_type,
  pass_type,
  created_at
) VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Jean',
  'Dupont',
  'Tech Solutions Inc',
  'Directeur Technique',
  '+33612345678',
  'France',
  'company',
  'free',
  now()
);

-- Visiteur VIP (10 rendez-vous actifs)
INSERT INTO users (
  id,
  email,
  name,
  type,
  visitor_level,
  created_at
) VALUES (
  'a0000000-0000-0000-0000-000000000002',
  'visitor-vip@test.sib2026.ma',
  'Marie Martin',
  'visitor',
  'premium',
  now()
);

INSERT INTO visitor_profiles (
  user_id,
  first_name,
  last_name,
  company,
  position,
  phone,
  country,
  visitor_type,
  pass_type,
  created_at
) VALUES (
  'a0000000-0000-0000-0000-000000000002',
  'Marie',
  'Martin',
  'Global Maritime Group',
  'CEO',
  '+33687654321',
  'France',
  'company',
  'vip',
  now()
);

-- Historique upgrade VIP (seulement si la table existe)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_upgrades') THEN
    INSERT INTO user_upgrades (
      user_id,
      user_type,
      previous_level,
      new_level,
      payment_amount,
      payment_currency,
      payment_method,
      payment_transaction_id,
      upgraded_at
    ) VALUES (
      'a0000000-0000-0000-0000-000000000002',
      'visitor',
      'free',
      'premium',
      700,
      'EUR',
      'stripe',
      'test_ch_visitor_vip_001',
      now()
    );
  END IF;
END $$;

-- Quota usage pour VIP (3 RDV utilisés sur 10)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'quota_usage') THEN
    INSERT INTO quota_usage (
      user_id,
      quota_type,
      current_usage,
      period,
      reset_at
    ) VALUES (
      'a0000000-0000-0000-0000-000000000002',
      'appointments',
      3,
      'lifetime',
      NULL
    );
  END IF;
END $$;

-- ========================================
-- 2. PARTENAIRES (4 comptes: Museum, Silver, Gold, Platinium)
-- ========================================

-- Partner Museum ($20k)
INSERT INTO users (
  id,
  email,
  name,
  type,
  partner_tier,
  created_at
) VALUES (
  'a0000000-0000-0000-0000-000000000003',
  'partner-museum@test.sib2026.ma',
  'Pierre Leclerc',
  'partner',
  'museum',
  now()
);

INSERT INTO partner_profiles (
  user_id,
  company_name,
  contact_name,
  contact_email,
  contact_phone,
  description,
  logo_url,
  website,
  country,
  partnership_level,
  created_at
) VALUES (
  'a0000000-0000-0000-0000-000000000003',
  'Maritime Museum Foundation',
  'Pierre Leclerc',
  'contact@museumfoundation.org',
  '+33145678901',
  'Fondation dédiée à la préservation du patrimoine maritime mondial',
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%238b5cf6" width="200" height="200"/%3E%3Ctext fill="%23fff" font-family="Arial" font-size="20" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EMuseum%3C/text%3E%3C/svg%3E',
  'https://museumfoundation.org',
  'France',
  'museum',
  now()
);

-- Quota Museum (5 RDV sur 20)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'quota_usage') THEN
    INSERT INTO quota_usage (
      user_id,
      quota_type,
      current_usage,
      period,
      reset_at
    ) VALUES (
      'a0000000-0000-0000-0000-000000000003',
      'appointments',
      5,
      'monthly',
      date_trunc('month', now()) + interval '1 month'
    );
  END IF;
END $$;

-- Partner Silver ($48k)
INSERT INTO users (
  id,
  email,
  name,
  type,
  partner_tier,
  created_at
) VALUES (
  'a0000000-0000-0000-0000-000000000004',
  'partner-silver@test.sib2026.ma',
  'Ahmed Benali',
  'partner',
  'silver',
  now()
);

INSERT INTO partner_profiles (
  user_id,
  company_name,
  contact_name,
  contact_email,
  contact_phone,
  description,
  logo_url,
  website,
  country,
  partnership_level,
  created_at
) VALUES (
  'a0000000-0000-0000-0000-000000000004',
  'Port Tech Solutions',
  'Ahmed Benali',
  'contact@porttechsolutions.ma',
  '+212661234567',
  'Solutions technologiques pour ports et terminaux maritimes',
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23c0c0c0" width="200" height="200"/%3E%3Ctext fill="%23fff" font-family="Arial" font-size="20" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ESilver%3C/text%3E%3C/svg%3E',
  'https://porttechsolutions.ma',
  'Morocco',
  'silver',
  now()
);

-- Quota Silver (15 RDV sur 50)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'quota_usage') THEN
    INSERT INTO quota_usage (
      user_id,
      quota_type,
      current_usage,
      period,
      reset_at
    ) VALUES (
      'a0000000-0000-0000-0000-000000000004',
      'appointments',
      15,
      'monthly',
      date_trunc('month', now()) + interval '1 month'
    );
  END IF;
END $$;

-- Partner Gold ($68k)
INSERT INTO users (
  id,
  email,
  name,
  type,
  partner_tier,
  created_at
) VALUES (
  'a0000000-0000-0000-0000-000000000005',
  'partner-gold@test.sib2026.ma',
  'Carlos Rodriguez',
  'partner',
  'gold',
  now()
);

INSERT INTO partner_profiles (
  user_id,
  company_name,
  contact_name,
  contact_email,
  contact_phone,
  description,
  logo_url,
  website,
  country,
  partnership_level,
  created_at
) VALUES (
  'a0000000-0000-0000-0000-000000000005',
  'Global Shipping Alliance',
  'Carlos Rodriguez',
  'contact@globalshipping.com',
  '+34912345678',
  'Alliance internationale de compagnies maritimes et portuaires',
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ffd700" width="200" height="200"/%3E%3Ctext fill="%23fff" font-family="Arial" font-size="20" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EGold%3C/text%3E%3C/svg%3E',
  'https://globalshipping.com',
  'Spain',
  'gold',
  now()
);

-- Quota Gold (45 RDV sur 100)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'quota_usage') THEN
    INSERT INTO quota_usage (
      user_id,
      quota_type,
      current_usage,
      period,
      reset_at
    ) VALUES (
      'a0000000-0000-0000-0000-000000000005',
      'appointments',
      45,
      'monthly',
      date_trunc('month', now()) + interval '1 month'
    );
  END IF;
END $$;

-- Partner Platinium ($98k - Illimité)
INSERT INTO users (
  id,
  email,
  name,
  type,
  partner_tier,
  created_at
) VALUES (
  'a0000000-0000-0000-0000-000000000006',
  'partner-platinium@test.sib2026.ma',
  'Henrik Nielsen',
  'partner',
  'platinium',
  now()
);

INSERT INTO partner_profiles (
  user_id,
  company_name,
  contact_name,
  contact_email,
  contact_phone,
  description,
  logo_url,
  website,
  country,
  partnership_level,
  created_at
) VALUES (
  'a0000000-0000-0000-0000-000000000006',
  'Maersk International',
  'Henrik Nielsen',
  'contact@maersk.com',
  '+4533633333',
  'Leader mondial du transport maritime et de la logistique',
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23e5e4e2" width="200" height="200"/%3E%3Ctext fill="%23333" font-family="Arial" font-size="18" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EPlatinum%3C/text%3E%3C/svg%3E',
  'https://maersk.com',
  'Denmark',
  'platinium',
  now()
);

-- Quota Platinium (250 RDV - Illimité)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'quota_usage') THEN
    INSERT INTO quota_usage (
      user_id,
      quota_type,
      current_usage,
      period,
      reset_at
    ) VALUES (
      'a0000000-0000-0000-0000-000000000006',
      'appointments',
      250,
      'monthly',
      date_trunc('month', now()) + interval '1 month'
    );
  END IF;
END $$;

-- ========================================
-- 3. EXPOSANTS (4 comptes: 9m², 18m², 36m², 54m²+)
-- ========================================

-- Exposant 9m² Basic
INSERT INTO users (
  id,
  email,
  name,
  type,
  created_at
) VALUES (
  'a0000000-0000-0000-0000-000000000007',
  'exhibitor-9m@test.sib2026.ma',
  'Thomas Dubois',
  'exhibitor',
  now()
);

INSERT INTO exhibitor_profiles (
  user_id,
  company_name,
  first_name,
  last_name,
  email,
  phone,
  description,
  logo_url,
  website,
  country,
  sector,
  category,
  stand_number,
  stand_area,
  created_at
) VALUES (
  'a0000000-0000-0000-0000-000000000007',
  'StartUp Port Innovations',
  'Thomas',
  'Dubois',
  'contact@startupportinno.com',
  '+33678901234',
  'Startup innovante en solutions IoT pour ports intelligents',
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%233b82f6" width="200" height="200"/%3E%3Ctext fill="%23fff" font-family="Arial" font-size="20" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3E9m%C2%B2%3C/text%3E%3C/svg%3E',
  'https://startupportinno.com',
  'France',
  'Technology',
  'startup',
  'A1-001',
  9.0,
  now()
);

-- Quota 9m² (7 RDV sur 15)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'quota_usage') THEN
    INSERT INTO quota_usage (
      user_id,
      quota_type,
      current_usage,
      period,
      reset_at
    ) VALUES (
      'a0000000-0000-0000-0000-000000000007',
      'appointments',
      7,
      'lifetime',
      NULL
    );
  END IF;
END $$;

-- Exposant 18m² Standard
INSERT INTO users (
  id,
  email,
  name,
  type,
  created_at
) VALUES (
  'a0000000-0000-0000-0000-000000000008',
  'exhibitor-18m@test.sib2026.ma',
  'Sophie Lefebvre',
  'exhibitor',
  now()
);

INSERT INTO exhibitor_profiles (
  user_id,
  company_name,
  first_name,
  last_name,
  email,
  phone,
  description,
  logo_url,
  website,
  country,
  sector,
  category,
  stand_number,
  stand_area,
  created_at
) VALUES (
  'a0000000-0000-0000-0000-000000000008',
  'Maritime Equipment Co',
  'Sophie',
  'Lefebvre',
  'contact@maritimeequip.fr',
  '+33656789012',
  'Fabricant d''équipements maritimes et portuaires de qualité',
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%2310b981" width="200" height="200"/%3E%3Ctext fill="%23fff" font-family="Arial" font-size="20" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3E18m²%3C/text%3E%3C/svg%3E',
  'https://maritimeequip.fr',
  'France',
  'Equipment',
  'equipment',
  'B2-015',
  18.0,
  now()
);

-- Quota 18m² (22 RDV sur 40)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'quota_usage') THEN
    INSERT INTO quota_usage (
      user_id,
      quota_type,
      current_usage,
      period,
      reset_at
    ) VALUES (
      'a0000000-0000-0000-0000-000000000008',
      'appointments',
      22,
      'lifetime',
      NULL
    );
  END IF;
END $$;

-- Exposant 36m² Premium
INSERT INTO users (
  id,
  email,
  name,
  type,
  created_at
) VALUES (
  'a0000000-0000-0000-0000-000000000009',
  'exhibitor-36m@test.sib2026.ma',
  'David Chen',
  'exhibitor',
  now()
);

INSERT INTO exhibitor_profiles (
  user_id,
  company_name,
  first_name,
  last_name,
  email,
  phone,
  description,
  logo_url,
  website,
  country,
  sector,
  category,
  stand_number,
  stand_area,
  created_at
) VALUES (
  'a0000000-0000-0000-0000-000000000009',
  'Advanced Port Systems',
  'David',
  'Chen',
  'contact@advancedportsys.cn',
  '+8613800138000',
  'Systèmes automatisés et IA pour optimisation portuaire',
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23f59e0b" width="200" height="200"/%3E%3Ctext fill="%23fff" font-family="Arial" font-size="20" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3E36m²%3C/text%3E%3C/svg%3E',
  'https://advancedportsys.cn',
  'China',
  'Technology',
  'automation',
  'C3-027',
  36.0,
  now()
);

-- Quota 36m² (58 RDV sur 100)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'quota_usage') THEN
    INSERT INTO quota_usage (
      user_id,
      quota_type,
      current_usage,
      period,
      reset_at
    ) VALUES (
      'a0000000-0000-0000-0000-000000000009',
      'appointments',
      58,
      'lifetime',
      NULL
    );
  END IF;
END $$;

-- Exposant 54m²+ Elite (Illimité)
INSERT INTO users (
  id,
  email,
  name,
  type,
  created_at
) VALUES (
  'a0000000-0000-0000-0000-000000000010',
  'exhibitor-54m@test.sib2026.ma',
  'Lars Svensson',
  'exhibitor',
  now()
);

INSERT INTO exhibitor_profiles (
  user_id,
  company_name,
  first_name,
  last_name,
  email,
  phone,
  description,
  logo_url,
  website,
  country,
  sector,
  category,
  stand_number,
  stand_area,
  created_at
) VALUES (
  'a0000000-0000-0000-0000-000000000010',
  'ABB Marine & Ports',
  'Lars',
  'Svensson',
  'contact@abb.com',
  '+46102424000',
  'Leader mondial en automatisation et électrification marine',
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ef4444" width="200" height="200"/%3E%3Ctext fill="%23fff" font-family="Arial" font-size="20" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3E60m²%3C/text%3E%3C/svg%3E',
  'https://abb.com',
  'Sweden',
  'Technology',
  'major_brand',
  'D4-050',
  60.0,
  now()
);

-- Quota 54m²+ (350 RDV - Illimité)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'quota_usage') THEN
    INSERT INTO quota_usage (
      user_id,
      quota_type,
      current_usage,
      period,
      reset_at
    ) VALUES (
      'a0000000-0000-0000-0000-000000000010',
      'appointments',
      350,
      'lifetime',
      NULL
    );
  END IF;
END $$;

-- ========================================
-- 4. BADGES POUR TOUS LES COMPTES
-- ========================================

-- Les badges seront auto-générés par le trigger après insertion des users
-- Si le trigger n'est pas activé, créer manuellement les badges ici

-- ========================================
-- RÉSUMÉ DES COMPTES CRÉÉS
-- ========================================

-- Re-enable triggers that were disabled at the start
DO $$
BEGIN
  -- Re-enable badge auto-generation triggers if they exist
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_auto_generate_badge_on_insert') THEN
    ALTER TABLE users ENABLE TRIGGER trigger_auto_generate_badge_on_insert;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_auto_generate_badge_on_update') THEN
    ALTER TABLE users ENABLE TRIGGER trigger_auto_generate_badge_on_update;
  END IF;

  RAISE NOTICE 'Triggers ré-activés';
END $$;

-- Afficher le résumé
DO $$
BEGIN
  RAISE NOTICE '
========================================
✅ COMPTES DE TEST CRÉÉS AVEC SUCCÈS
========================================

📧 VISITEURS:
  - visitor-free@test.sib2026.ma (FREE - 0 RDV)
  - visitor-vip@test.sib2026.ma (VIP - 10 RDV, 3 utilisés)

🤝 PARTENAIRES:
  - partner-museum@test.sib2026.ma (Museum $20k - 20 RDV, 5 utilisés)
  - partner-silver@test.sib2026.ma (Silver $48k - 50 RDV, 15 utilisés)
  - partner-gold@test.sib2026.ma (Gold $68k - 100 RDV, 45 utilisés)
  - partner-platinium@test.sib2026.ma (Platinium $98k - Illimité, 250 utilisés)

🏢 EXPOSANTS:
  - exhibitor-9m@test.sib2026.ma (9m² Basic - 15 RDV, 7 utilisés)
  - exhibitor-18m@test.sib2026.ma (18m² Standard - 40 RDV, 22 utilisés)
  - exhibitor-36m@test.sib2026.ma (36m² Premium - 100 RDV, 58 utilisés)
  - exhibitor-54m@test.sib2026.ma (60m² Elite - Illimité, 350 utilisés)

🔑 Mot de passe pour tous: Test@123456

========================================
';
END $$;

-- ========================================
-- 5. MINI-SITES AVEC CONTENU COMPLET
-- ========================================

-- Mini-site pour exposant 9m² (StartUp Port Innovations)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'mini_sites') THEN
    INSERT INTO mini_sites (
      id,
      exhibitor_id,
      theme,
      custom_colors,
      sections,
      published,
      views,
      last_updated
    ) VALUES (
      'a0000000-0000-0000-0000-000000000107',
      'a0000000-0000-0000-0000-000000000007',
      'modern',
      jsonb_build_object(
        'primaryColor', '#3b82f6',
        'secondaryColor', '#1e40af',
        'accentColor', '#60a5fa',
        'fontFamily', 'Inter'
      ),
      jsonb_build_array(
        jsonb_build_object(
          'type', 'hero',
          'content', jsonb_build_object(
            'title', 'Solutions IoT pour Ports Intelligents',
            'subtitle', 'Transformez votre port avec nos technologies de pointe',
            'ctaText', 'Découvrir nos solutions',
            'ctaLink', '#products',
            'backgroundImage', 'https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=1920&q=80'
          )
        ),
        jsonb_build_object(
          'type', 'about',
          'content', jsonb_build_object(
            'title', 'Innovation & Excellence',
            'description', 'StartUp Port Innovations révolutionne la gestion portuaire avec des solutions IoT avancées. Notre expertise combine capteurs intelligents, IA et analytics pour optimiser vos opérations.',
            'features', jsonb_build_array(
              'Solutions IoT sur mesure',
              'Analytics en temps réel',
              'Interface intuitive',
              'Support 24/7'
            ),
            'stats', jsonb_build_array(
              jsonb_build_object('number', '50+', 'label', 'Ports équipés'),
              jsonb_build_object('number', '1000+', 'label', 'Capteurs déployés'),
              jsonb_build_object('number', '99.9%', 'label', 'Uptime garanti'),
              jsonb_build_object('number', '24/7', 'label', 'Support technique')
            ),
            'images', jsonb_build_array(
              'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80',
              'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80'
            )
          )
        )
      ),
      true,
      245,
      now()
    );
  END IF;
END $$;

-- Mini-site pour exposant 18m² (Maritime Equipment Co)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'mini_sites') THEN
    INSERT INTO mini_sites (
      id,
      exhibitor_id,
      theme,
      custom_colors,
      sections,
      published,
      views,
      last_updated
    ) VALUES (
      'a0000000-0000-0000-0000-000000000108',
      'a0000000-0000-0000-0000-000000000008',
      'elegant',
      jsonb_build_object(
        'primaryColor', '#10b981',
        'secondaryColor', '#059669',
        'accentColor', '#34d399',
        'fontFamily', 'Inter'
      ),
      jsonb_build_array(
        jsonb_build_object(
          'type', 'hero',
          'content', jsonb_build_object(
            'title', 'Équipements Maritimes de Qualité Premium',
            'subtitle', 'Excellence française depuis 1995 - Fabricant certifié ISO 9001',
            'ctaText', 'Voir notre catalogue',
            'ctaLink', '#products',
            'backgroundImage', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1920&q=80'
          )
        ),
        jsonb_build_object(
          'type', 'about',
          'content', jsonb_build_object(
            'title', 'Expertise & Fiabilité',
            'description', 'Leader européen en équipements maritimes et portuaires, nous proposons une gamme complète de solutions certifiées pour tous types de navires et installations portuaires.',
            'features', jsonb_build_array(
              'Certification ISO 9001',
              'Garantie 5 ans',
              'Stock permanent',
              'Livraison rapide'
            ),
            'stats', jsonb_build_array(
              jsonb_build_object('number', '30+', 'label', 'Ans d''expérience'),
              jsonb_build_object('number', '500+', 'label', 'Clients satisfaits'),
              jsonb_build_object('number', '2000+', 'label', 'Produits disponibles'),
              jsonb_build_object('number', '98%', 'label', 'Taux satisfaction')
            ),
            'images', jsonb_build_array(
              'https://images.unsplash.com/photo-1565008576549-57569a49371d?w=800&q=80',
              'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80'
            )
          )
        )
      ),
      true,
      387,
      now()
    );
  END IF;
END $$;

-- Mini-site pour exposant 36m² (Advanced Port Systems)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'mini_sites') THEN
    INSERT INTO mini_sites (
      id,
      exhibitor_id,
      theme,
      custom_colors,
      sections,
      published,
      views,
      last_updated
    ) VALUES (
      'a0000000-0000-0000-0000-000000000109',
      'a0000000-0000-0000-0000-000000000009',
      'professional',
      jsonb_build_object(
        'primaryColor', '#f59e0b',
        'secondaryColor', '#d97706',
        'accentColor', '#fbbf24',
        'fontFamily', 'Inter'
      ),
      jsonb_build_array(
        jsonb_build_object(
          'type', 'hero',
          'content', jsonb_build_object(
            'title', 'Systèmes Automatisés & IA pour Ports',
            'subtitle', 'Optimisation portuaire de nouvelle génération avec intelligence artificielle',
            'ctaText', 'Demander une démo',
            'ctaLink', '#contact',
            'backgroundImage', 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1920&q=80'
          )
        ),
        jsonb_build_object(
          'type', 'about',
          'content', jsonb_build_object(
            'title', 'Technologie de Pointe',
            'description', 'Advanced Port Systems combine IA, robotique et automation pour créer les ports du futur. Nos solutions augmentent la productivité jusqu''à 40% tout en réduisant les coûts opérationnels.',
            'features', jsonb_build_array(
              'IA & Machine Learning',
              'Automatisation complète',
              'Intégration système',
              'ROI sous 18 mois'
            ),
            'stats', jsonb_build_array(
              jsonb_build_object('number', '15+', 'label', 'Ports automatisés'),
              jsonb_build_object('number', '40%', 'label', 'Gain productivité'),
              jsonb_build_object('number', '60%', 'label', 'Réduction erreurs'),
              jsonb_build_object('number', '$2M+', 'label', 'Économies moyennes')
            ),
            'images', jsonb_build_array(
              'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80',
              'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80'
            )
          )
        )
      ),
      true,
      523,
      now()
    );
  END IF;
END $$;

-- ========================================
-- 6. PRODUITS ET SOLUTIONS
-- ========================================

-- Produits pour StartUp Port Innovations (9m²)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'products') THEN
    INSERT INTO products (
      id,
      exhibitor_id,
      name,
      description,
      category,
      price,
      images,
      features,
      specifications,
      featured
    ) VALUES
    (
      'prod-0000-0000-0000-000000000001',
      'a0000000-0000-0000-0000-000000000007',
      'SmartPort Sensors Network',
      'Réseau de capteurs IoT pour monitoring en temps réel des opérations portuaires. Surveillance température, humidité, mouvement, pression.',
      'IoT & Capteurs',
      '€15,000',
      ARRAY['https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80', 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&q=80'],
      ARRAY['100 capteurs sans fil', 'Autonomie 5 ans', 'Portée 5km', 'API REST complète', 'Dashboard web inclus'],
      jsonb_build_object(
        'Connectivité', 'LoRaWAN / NB-IoT',
        'Alimentation', 'Batterie lithium 5 ans',
        'Température', '-40°C à +85°C',
        'Certification', 'IP68 - Étanche'
      ),
      true
    ),
    (
      'prod-0000-0000-0000-000000000002',
      'a0000000-0000-0000-0000-000000000007',
      'PortAI Analytics Platform',
      'Plateforme d''analyse prédictive avec IA pour optimiser flux de containers, prévenir pannes et maximiser efficacité.',
      'Logiciel & IA',
      '€8,500/mois',
      ARRAY['https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80'],
      ARRAY['Prédictions en temps réel', 'Alertes intelligentes', 'Rapports automatisés', 'Intégration ERP', 'Support ML personnalisé'],
      jsonb_build_object(
        'Déploiement', 'Cloud / On-premise',
        'Intégrations', 'API REST, Webhooks',
        'Support', '24/7 - Multilingue',
        'Formation', 'Incluse (2 jours)'
      ),
      true
    ),
    (
      'prod-0000-0000-0000-000000000003',
      'a0000000-0000-0000-0000-000000000007',
      'Dock Management System',
      'Système complet de gestion des quais avec planification automatique, suivi en temps réel et optimisation des emplacements.',
      'Gestion & Planification',
      '€12,000',
      ARRAY['https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=80', 'https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=600&q=80'],
      ARRAY['Planification IA', 'Tracking GPS', 'Notifications SMS', 'Interface tactile', 'Rapports KPI'],
      jsonb_build_object(
        'Utilisateurs', 'Illimité',
        'Quais gérés', 'Jusqu''à 50',
        'Mobile', 'iOS / Android',
        'Langue', 'FR/EN/ES/CN'
      ),
      false
    );
  END IF;
END $$;

-- Produits pour Maritime Equipment Co (18m²)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'products') THEN
    INSERT INTO products (
      id,
      exhibitor_id,
      name,
      description,
      category,
      price,
      images,
      features,
      specifications,
      featured
    ) VALUES
    (
      'prod-0000-0000-0000-000000000004',
      'a0000000-0000-0000-0000-000000000008',
      'Heavy Duty Marine Winch 50T',
      'Treuil maritime industriel 50 tonnes, certification Lloyd''s Register. Construction acier inoxydable 316L pour environnements extrêmes.',
      'Équipements de levage',
      '€45,000',
      ARRAY['https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&q=80', 'https://images.unsplash.com/photo-1565008576549-57569a49371d?w=600&q=80'],
      ARRAY['Capacité 50 tonnes', 'Câble acier 500m', 'Moteur hydraulique', 'Certification Lloyd''s', 'Garantie 5 ans'],
      jsonb_build_object(
        'Capacité', '50,000 kg',
        'Vitesse', '15 m/min',
        'Alimentation', 'Hydraulique 350 bar',
        'Matériau', 'Inox 316L'
      ),
      true
    ),
    (
      'prod-0000-0000-0000-000000000005',
      'a0000000-0000-0000-0000-000000000008',
      'Port Bollard Series PRO',
      'Bollard d''amarrage professionnel en fonte ductile, résistance 100T. Installation sur quai béton ou acier.',
      'Amarrage & Sécurité',
      '€3,200',
      ARRAY['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&q=80', 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&q=80'],
      ARRAY['Résistance 100T', 'Fonte ductile GGG50', 'Revêtement époxy', 'Installation facile', 'Maintenance nulle'],
      jsonb_build_object(
        'Résistance', '100 tonnes',
        'Hauteur', '800 mm',
        'Poids', '450 kg',
        'Norme', 'EN 795:2012'
      ),
      true
    ),
    (
      'prod-0000-0000-0000-000000000006',
      'a0000000-0000-0000-0000-000000000008',
      'LED Navigation Light System',
      'Système d''éclairage LED pour navigation maritime. Conforme COLREG, autonomie 10 ans, visibilité 10 miles nautiques.',
      'Signalisation & Éclairage',
      '€8,900',
      ARRAY['https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=600&q=80', 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&q=80'],
      ARRAY['LED haute intensité', 'Autonomie 10 ans', 'Visibilité 10 NM', 'COLREG compliant', 'Solaire + batterie'],
      jsonb_build_object(
        'Portée', '10 miles nautiques',
        'Alimentation', 'Solaire 80W + Li-Ion',
        'Flash', 'Personnalisable',
        'Certification', 'IALA / COLREG'
      ),
      false
    ),
    (
      'prod-0000-0000-0000-000000000007',
      'a0000000-0000-0000-0000-000000000008',
      'Hydraulic Crane 20T',
      'Grue hydraulique portuaire 20T, flèche télescopique 25m. Commande radio sans fil, système anti-collision intégré.',
      'Équipements de levage',
      '€125,000',
      ARRAY['https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=600&q=80', 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=600&q=80'],
      ARRAY['Capacité 20 tonnes', 'Flèche 25m', 'Commande radio', 'Anti-collision', 'Formation incluse'],
      jsonb_build_object(
        'Capacité', '20,000 kg',
        'Portée max', '25 mètres',
        'Rotation', '360° continu',
        'Vitesse levage', '8 m/min'
      ),
      true
    );
  END IF;
END $$;

-- Produits pour Advanced Port Systems (36m²)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'products') THEN
    INSERT INTO products (
      id,
      exhibitor_id,
      name,
      description,
      category,
      price,
      images,
      features,
      specifications,
      featured
    ) VALUES
    (
      'prod-0000-0000-0000-000000000008',
      'a0000000-0000-0000-0000-000000000009',
      'AI Container Tracking System',
      'Système de tracking intelligent avec vision par ordinateur et IA pour identification automatique, localisation et suivi en temps réel de tous les containers.',
      'Automation & IA',
      '€280,000',
      ARRAY['https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&q=80', 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&q=80'],
      ARRAY['Vision IA avancée', 'OCR automatique', 'Tracking GPS/RFID', 'Prédiction disponibilité', 'Tableau de bord temps réel'],
      jsonb_build_object(
        'Capacité', 'Illimité',
        'Précision OCR', '99.8%',
        'Temps réponse', '< 100ms',
        'Cloud', 'AWS / Azure / GCP'
      ),
      true
    ),
    (
      'prod-0000-0000-0000-000000000009',
      'a0000000-0000-0000-0000-000000000009',
      'Automated Stacking Crane (ASC)',
      'Grue de gerbage automatisée avec navigation autonome, système anti-collision 3D et optimisation IA des emplacements.',
      'Robotique Portuaire',
      '€1,200,000',
      ARRAY['https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=600&q=80', 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=600&q=80'],
      ARRAY['Navigation autonome', 'Anti-collision 3D', 'IA optimisation', 'Zéro émission', 'Productivité +45%'],
      jsonb_build_object(
        'Capacité levage', '65 tonnes',
        'Hauteur empilage', '6 containers',
        'Vitesse', '180 m/min',
        'Alimentation', 'Électrique 400V'
      ),
      true
    ),
    (
      'prod-0000-0000-0000-000000000010',
      'a0000000-0000-0000-0000-000000000009',
      'Port Operations Control Center',
      'Centre de contrôle unifié avec mur d''écrans, logiciel de supervision temps réel, IA prédictive et gestion automatisée de l''ensemble des opérations.',
      'Système de contrôle',
      '€450,000',
      ARRAY['https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80'],
      ARRAY['Mur écrans 12x4K', 'Supervision temps réel', 'IA prédictive', 'Intégration complète', 'Formation intensive'],
      jsonb_build_object(
        'Écrans', '12x 55" 4K',
        'Postes opérateurs', '8 postes ergonomiques',
        'Redondance', 'Système N+1',
        'Support', '24/7 avec astreinte'
      ),
      true
    ),
    (
      'prod-0000-0000-0000-000000000011',
      'a0000000-0000-0000-0000-000000000009',
      'Smart Gate OCR System',
      'Portique intelligent avec reconnaissance automatique plaques containers, pesage dynamique et contrôle conformité en moins de 20 secondes.',
      'Contrôle d''accès',
      '€95,000',
      ARRAY['https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80', 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&q=80'],
      ARRAY['OCR 360° containers', 'Pesage dynamique', 'Caméras 4K thermiques', 'RFID / Bluetooth', 'Passage < 20 secondes'],
      jsonb_build_object(
        'Débit', '200 camions/heure',
        'Précision OCR', '99.9%',
        'Caméras', '8x 4K + 2x thermiques',
        'Intégration', 'TOS / ERP / Douanes'
      ),
      false
    );
  END IF;
END $$;

-- ========================================
-- RÉSUMÉ DES DONNÉES AJOUTÉES
-- ========================================

DO $$
BEGIN
  RAISE NOTICE '
========================================
✅ DONNÉES COMPLÈTES AJOUTÉES
========================================

🏢 MINI-SITES CONFIGURÉS (3):
  - StartUp Port Innovations (9m²) - 245 vues
  - Maritime Equipment Co (18m²) - 387 vues  
  - Advanced Port Systems (36m²) - 523 vues

📦 PRODUITS AJOUTÉS (12):
  - StartUp: 3 solutions IoT & IA
  - Maritime Equipment: 4 équipements industriels
  - Advanced Port: 4 systèmes automatisés

✨ Contenu inclus:
  - Sections Hero avec CTA
  - Sections About avec features & stats
  - Produits avec images, specs, prix
  - Thèmes personnalisés par exposant

========================================
';
END $$;