-- Migration: Restreindre la modification du niveau de sponsoring aux administrateurs uniquement
-- Created: 2026-01-01
-- Description: Empêche les partenaires de modifier leur propre niveau de sponsoring (partnership_level)
--              Seuls les administrateurs peuvent modifier ce champ critique

-- ============================================
-- 1. PARTNER_PROFILES: Restrictions RLS
-- ============================================

-- Activer RLS sur la table si ce n'est pas déjà fait
ALTER TABLE public.partner_profiles ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Partners can update their own profile" ON public.partner_profiles;
DROP POLICY IF EXISTS "Partners can update own profile" ON public.partner_profiles;
DROP POLICY IF EXISTS "Partners can update profile except partnership_level" ON public.partner_profiles;
DROP POLICY IF EXISTS "Admins can update all partner profile fields" ON public.partner_profiles;

-- Politique de lecture pour les partenaires
CREATE POLICY "Partners can view own profile"
  ON public.partner_profiles
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() 
    OR EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND type = 'admin'
    )
  );

-- Politique: Les partenaires peuvent mettre à jour leur profil (le trigger bloquera partnership_level)
CREATE POLICY "Partners can update own profile"
  ON public.partner_profiles
  FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid() 
    AND EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND type = 'partner'
    )
  );

-- Politique: Les administrateurs peuvent tout faire
CREATE POLICY "Admins can manage all partner profiles"
  ON public.partner_profiles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND type = 'admin'
    )
  );

-- ============================================
-- 2. PARTNERS: Restrictions RLS
-- ============================================

-- Vérifier si la table partners existe et ajouter des restrictions similaires
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'partners' AND table_schema = 'public') THEN
    
    -- Activer RLS
    EXECUTE 'ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY';
    
    -- Supprimer les anciennes politiques
    EXECUTE 'DROP POLICY IF EXISTS "Partners can update own data" ON public.partners';
    EXECUTE 'DROP POLICY IF EXISTS "Partners can update except sponsorship_level" ON public.partners';
    
    -- Politique: Les partenaires peuvent mettre à jour leurs données
    -- Le trigger bloquera la modification de sponsorship_level
    EXECUTE '
      CREATE POLICY "Partners can update own partner data"
        ON public.partners
        FOR UPDATE
        TO authenticated
        USING (
          user_id = auth.uid()
        )
    ';
    
    RAISE NOTICE 'Politique RLS appliquée à la table partners';
  END IF;
END $$;

-- ============================================
-- 3. COMMENTAIRES POUR DOCUMENTATION
-- ============================================

COMMENT ON COLUMN public.partner_profiles.partnership_level IS 
  'Niveau de partenariat (museum, silver, gold, platinium). RÉSERVÉ AUX ADMINISTRATEURS - les partenaires ne peuvent pas modifier ce champ.';

-- ============================================
-- 4. FONCTION DE VALIDATION (optionnelle)
-- ============================================

-- Créer une fonction de validation pour bloquer les tentatives de modification
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
  
  -- Si l'utilisateur n'est pas admin et tente de modifier partnership_level/sponsorship_level
  IF NOT is_admin THEN
    -- Pour partner_profiles
    IF TG_TABLE_NAME = 'partner_profiles' AND 
       OLD.partnership_level IS DISTINCT FROM NEW.partnership_level THEN
      RAISE EXCEPTION 'Seuls les administrateurs peuvent modifier le niveau de partenariat'
        USING HINT = 'Contactez un administrateur pour modifier votre niveau de sponsoring';
    END IF;
    
    -- Pour partners
    IF TG_TABLE_NAME = 'partners' AND 
       OLD.sponsorship_level IS DISTINCT FROM NEW.sponsorship_level THEN
      RAISE EXCEPTION 'Seuls les administrateurs peuvent modifier le niveau de sponsoring'
        USING HINT = 'Contactez un administrateur pour modifier votre niveau de sponsoring';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Appliquer le trigger sur partner_profiles
DROP TRIGGER IF EXISTS enforce_partnership_level_admin_only ON public.partner_profiles;
CREATE TRIGGER enforce_partnership_level_admin_only
  BEFORE UPDATE ON public.partner_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_partner_level_modification();

-- Appliquer le trigger sur partners si elle existe
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'partners' AND table_schema = 'public') THEN
    EXECUTE '
      DROP TRIGGER IF EXISTS enforce_sponsorship_level_admin_only ON public.partners;
      CREATE TRIGGER enforce_sponsorship_level_admin_only
        BEFORE UPDATE ON public.partners
        FOR EACH ROW
        EXECUTE FUNCTION public.prevent_partner_level_modification()
    ';
    RAISE NOTICE 'Trigger appliqué à la table partners';
  END IF;
END $$;
