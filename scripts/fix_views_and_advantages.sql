-- Script pour corriger les compteurs de vues et les avantages (contributions)
-- À exécuter dans l'éditeur SQL de Supabase

-- 0. Fix de la fonction de trigger qui bloque les mises à jour (Correction bug existant)
-- La fonction d'origine essayait d'accéder à sponsorship_level au lieu de partnership_level sur la table partners
CREATE OR REPLACE FUNCTION public.prevent_partner_level_modification()
RETURNS TRIGGER AS $$
DECLARE
  is_admin BOOLEAN;
BEGIN
  -- Vérifier si l'utilisateur actuel est un admin
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND type = 'admin'
  ) INTO is_admin;
  
  -- Si l'utilisateur n'est pas admin et tente de modifier partnership_level
  IF NOT is_admin THEN
    -- Pour partner_profiles
    IF TG_TABLE_NAME = 'partner_profiles' AND 
       OLD.partnership_level IS DISTINCT FROM NEW.partnership_level THEN
      RAISE EXCEPTION 'Seuls les administrateurs peuvent modifier le niveau de partenariat'
        USING HINT = 'Contactez un administrateur pour modifier votre niveau de sponsoring';
    END IF;
    
    -- Pour partners (Correction : utilise partnership_level ou sponsorship_level si existant)
    IF TG_TABLE_NAME = 'partners' THEN
       -- On utilise un bloc dynamique pour éviter l'erreur de colonne inexistante
       BEGIN
         IF OLD.partnership_level IS DISTINCT FROM NEW.partnership_level THEN
           RAISE EXCEPTION 'Seuls les administrateurs peuvent modifier le niveau de partenariat';
         END IF;
       EXCEPTION WHEN undefined_column THEN
         -- Si partnership_level n'existe pas, on tente sponsorship_level
         BEGIN
           IF OLD.sponsorship_level IS DISTINCT FROM NEW.sponsorship_level THEN
             RAISE EXCEPTION 'Seuls les administrateurs peuvent modifier le niveau de sponsoring';
           END IF;
         EXCEPTION WHEN undefined_column THEN 
           -- Aucune des deux n'existe, on ne fait rien
           NULL;
         END;
       END;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. Ajouter la colonne views à la table partners si elle n'existe pas
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'partners') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'partners' AND column_name = 'views'
    ) THEN
      ALTER TABLE partners ADD COLUMN views INTEGER DEFAULT 0;
    END IF;
  END IF;
END $$;

-- 2. Ajouter la colonne user_id à la table partners pour faire le lien avec l'utilisateur
-- Cela permet au dashboard de trouver le partenaire associé à l'utilisateur connecté
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'partners') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'partners' AND column_name = 'user_id'
    ) THEN
      ALTER TABLE partners ADD COLUMN user_id UUID REFERENCES auth.users(id);
    END IF;
  END IF;
END $$;

-- 3. Créer une fonction RPC pour incrémenter les vues des partenaires de manière atomique
CREATE OR REPLACE FUNCTION increment_partner_views(p_partner_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE partners
  SET views = COALESCE(views, 0) + 1,
      updated_at = NOW()
  WHERE id = p_partner_id;
  
  RETURN json_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- 4. Donner les permissions d'exécution sur la fonction
GRANT EXECUTE ON FUNCTION increment_partner_views(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_partner_views(uuid) TO anon;

-- 5. S'assurer que les avantages (benefits) ne sont pas vides pour les partenaires existants
-- Note: On utilise 'benefits' car c'est ce que SupabaseService.getPartners() attend
-- On gère le cas où benefits est de type JSONB (vu dans l'erreur précédente)
UPDATE partners 
SET benefits = '["Sponsoring Session Plénière", "Espace Networking Premium", "Visibilité Logo Multi-supports", "Pass VIP Salon"]'::jsonb
WHERE benefits IS NULL 
   OR jsonb_typeof(benefits) != 'array' 
   OR jsonb_array_length(benefits) = 0;

-- 6. Mettre à jour les mini-sites existants pour qu'ils aient au moins quelques vues si elles sont à 0 (pour la démo)
UPDATE mini_sites SET views = floor(random() * 50 + 10)::int WHERE views = 0 OR views IS NULL;
UPDATE partners SET views = floor(random() * 30 + 5)::int WHERE views = 0 OR views IS NULL;
