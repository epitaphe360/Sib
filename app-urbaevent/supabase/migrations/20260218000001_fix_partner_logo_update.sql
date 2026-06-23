-- Migration: Fixer les policies RLS pour permettre aux partenaires de mettre à jour leur logo
-- Created: 2026-02-18
-- Description: Crée les tables nécessaires et configure les policies RLS pour permettre la mise à jour des profils partenaires

-- ============================================
-- 0. CRÉATION DES TABLES SI NÉCESSAIRES
-- ============================================

-- Créer la table partner_profiles si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.partner_profiles (
  user_id uuid PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  company_name text,
  contact_name text,
  contact_email text,
  contact_phone text,
  description text,
  logo_url text,
  website text,
  country text,
  partnership_level text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Créer les index si nécessaires
CREATE INDEX IF NOT EXISTS idx_partner_profiles_user_id ON public.partner_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_partner_profiles_partnership_level ON public.partner_profiles(partnership_level);

-- ============================================
-- 1. PARTNER_PROFILES TABLE: Fix RLS Policies
-- ============================================

-- Activer RLS sur la table si ce n'est pas déjà fait
ALTER TABLE public.partner_profiles ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes policies (si elles existent)
DROP POLICY IF EXISTS "Partners can update own profile" ON public.partner_profiles;
DROP POLICY IF EXISTS "Partners can view own profile" ON public.partner_profiles;
DROP POLICY IF EXISTS "Admins can manage partner profiles" ON public.partner_profiles;
DROP POLICY IF EXISTS "Partners can update their own profile" ON public.partner_profiles;
DROP POLICY IF EXISTS "Admins can manage all partner profiles" ON public.partner_profiles;
DROP POLICY IF EXISTS "Partners can insert own profile" ON public.partner_profiles;

-- Policy: Les partenaires peuvent lire leur propre profil
CREATE POLICY "Partners can view own profile"
  ON public.partner_profiles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Policy: Les partenaires peuvent mettre à jour leur profil (incluant logo_url)
CREATE POLICY "Partners can update own profile"
  ON public.partner_profiles
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Policy: Insertion pour les nouveaux profils
CREATE POLICY "Partners can insert own profile"
  ON public.partner_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- ============================================
-- 2. STORAGE: Fix RLS Policies pour les logos
-- ============================================

-- Créer le bucket partner-logos s'il n'existe pas
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'partner-logos',
  'partner-logos',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'];

-- Supprimer les anciennes policies du storage
DROP POLICY IF EXISTS "Public can read partner logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload partner logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update partner logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete partner logos" ON storage.objects;

-- Politique de lecture publique pour les logos
CREATE POLICY "Public can read partner logos"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'partner-logos');

-- Politique pour uploader des logos (utilisateurs authentifiés)
CREATE POLICY "Authenticated users can upload partner logos"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'partner-logos');

-- Politique pour mettre à jour les logos
CREATE POLICY "Authenticated users can update partner logos"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'partner-logos')
  WITH CHECK (bucket_id = 'partner-logos');

-- Politique pour supprimer les logos
CREATE POLICY "Authenticated users can delete partner logos"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'partner-logos');

-- ============================================
-- 3. VERIFICATION
-- ============================================

-- Vérifier que les policies sont créées
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'partner_profiles'
ORDER BY tablename, policyname;

-- Vérifier que le bucket existe
SELECT id, name, public FROM storage.buckets WHERE id = 'partner-logos';
