-- Migration pour corriger les quotas visiteurs selon le cahier des charges
-- FREE: 0 RDV | VIP/PREMIUM: 10 RDV

-- 1. Vérifier et ajouter TOUTES les colonnes manquantes si nécessaire
DO $$ 
BEGIN
  -- Ajouter la colonne name si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='visitor_levels' AND column_name='name') THEN
    ALTER TABLE visitor_levels ADD COLUMN name text;
  END IF;
  
  -- Ajouter la colonne description si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='visitor_levels' AND column_name='description') THEN
    ALTER TABLE visitor_levels ADD COLUMN description text;
  END IF;
  
  -- Ajouter la colonne price_monthly si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='visitor_levels' AND column_name='price_monthly') THEN
    ALTER TABLE visitor_levels ADD COLUMN price_monthly numeric DEFAULT 0;
  END IF;
  
  -- Ajouter la colonne price_annual si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='visitor_levels' AND column_name='price_annual') THEN
    ALTER TABLE visitor_levels ADD COLUMN price_annual numeric DEFAULT 0;
  END IF;
  
  -- Ajouter la colonne features si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='visitor_levels' AND column_name='features') THEN
    ALTER TABLE visitor_levels ADD COLUMN features jsonb DEFAULT '{}';
  END IF;
  
  -- Ajouter la colonne quotas si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='visitor_levels' AND column_name='quotas') THEN
    ALTER TABLE visitor_levels ADD COLUMN quotas jsonb DEFAULT '{}';
  END IF;
  
  -- Ajouter la colonne display_order si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='visitor_levels' AND column_name='display_order') THEN
    ALTER TABLE visitor_levels ADD COLUMN display_order integer DEFAULT 0;
  END IF;
END $$;

-- 2. Mettre à jour les quotas pour le niveau FREE (0 rendez-vous)
UPDATE visitor_levels
SET 
  features = '{"appointments": 0, "connections": 10, "minisite_views": true, "chat": true}'::jsonb,
  quotas = '{"appointments": 0, "connections_per_day": 10, "favorites": 20}'::jsonb
WHERE level = 'free';

-- 3. Mettre à jour les quotas pour le niveau VIP (10 rendez-vous)
UPDATE visitor_levels
SET 
  name = 'Pass VIP Premium',
  description = 'Accès VIP avec 10 rendez-vous B2B et tous les avantages premium - 700€ TTC',
  price_monthly = 700.00,
  price_annual = 700.00,
  features = '{"appointments": 10, "connections": 9999, "minisite_views": true, "chat": true, "priority_support": true, "concierge": true, "private_lounge": true}'::jsonb,
  quotas = '{"appointments": 10, "connections_per_day": 9999, "favorites": 9999}'::jsonb,
  display_order = 2
WHERE level = 'vip';

-- 4. Mettre à jour PREMIUM pour être un alias de VIP (10 rendez-vous)
UPDATE visitor_levels
SET 
  name = 'Pass VIP Premium (alias)',
  description = 'Alias pour le Pass VIP Premium - 700€ TTC',
  price_monthly = 700.00,
  price_annual = 700.00,
  features = '{"appointments": 10, "connections": 9999, "minisite_views": true, "chat": true, "priority_support": true, "concierge": true, "private_lounge": true}'::jsonb,
  quotas = '{"appointments": 10, "connections_per_day": 9999, "favorites": 9999}'::jsonb,
  display_order = 3
WHERE level = 'premium';

-- 5. Vérification des valeurs (commentaire pour référence)
-- SELECT level, name, (quotas->>'appointments')::int as rdv_quota 
-- FROM visitor_levels 
-- ORDER BY display_order;
-- 
-- Résultat attendu:
-- free     | Pass Gratuit              | 0
-- vip      | Pass VIP Premium          | 10
-- premium  | Pass VIP Premium (alias)  | 10
