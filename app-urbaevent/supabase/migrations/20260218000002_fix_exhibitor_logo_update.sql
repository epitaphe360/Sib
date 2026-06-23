-- Migration: Fixer les policies RLS pour permettre aux exposants de mettre à jour leur logo
-- Created: 2026-02-18
-- Description: Crée les tables nécessaires et configure les policies RLS pour permettre la mise à jour des profils exposants

-- ============================================
-- 0. CRÉATION DE LA TABLE SI NÉCESSAIRE
-- ============================================

-- Créer la table exhibitor_profiles si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.exhibitor_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
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

-- Créer les index si nécessaires
CREATE INDEX IF NOT EXISTS idx_exhibitor_profiles_user_id ON public.exhibitor_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_exhibitor_profiles_stand_area ON public.exhibitor_profiles(stand_area);

-- ============================================
-- 1. EXHIBITOR_PROFILES TABLE: Fix RLS Policies
-- ============================================

-- Activer RLS sur la table si ce n'est pas déjà fait
ALTER TABLE public.exhibitor_profiles ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes policies (si elles existent)
DROP POLICY IF EXISTS "Exhibitors can update own profile" ON public.exhibitor_profiles;
DROP POLICY IF EXISTS "Exhibitors can view own profile" ON public.exhibitor_profiles;
DROP POLICY IF EXISTS "Exhibitors can insert own profile" ON public.exhibitor_profiles;
DROP POLICY IF EXISTS "Exhibitors can read own data" ON public.exhibitor_profiles;
DROP POLICY IF EXISTS "Exhibitors can update own data" ON public.exhibitor_profiles;
DROP POLICY IF EXISTS "Public can read approved exhibitors" ON public.exhibitor_profiles;

-- Policy: Les exposants peuvent lire leur propre profil
CREATE POLICY "Exhibitors can view own profile"
  ON public.exhibitor_profiles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Policy: Les exposants peuvent mettre à jour leur profil (incluant logo_url)
CREATE POLICY "Exhibitors can update own profile"
  ON public.exhibitor_profiles
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Policy: Insertion pour les nouveaux profils
CREATE POLICY "Exhibitors can insert own profile"
  ON public.exhibitor_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Policy: Public peut lire tous les profils exposants (pour le catalogue)
CREATE POLICY "Public can read exhibitor profiles"
  ON public.exhibitor_profiles
  FOR SELECT
  TO public
  USING (true);

-- ============================================
-- 2. STORAGE: Fix RLS Policies pour les logos
-- ============================================

-- Créer le bucket exhibitor-logos s'il n'existe pas
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'exhibitor-logos',
  'exhibitor-logos',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'];

-- Supprimer les anciennes policies du storage
DROP POLICY IF EXISTS "Public can read exhibitor logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload exhibitor logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update exhibitor logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete exhibitor logos" ON storage.objects;

-- Politique de lecture publique pour les logos
CREATE POLICY "Public can read exhibitor logos"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'exhibitor-logos');

-- Politique pour uploader des logos (utilisateurs authentifiés)
CREATE POLICY "Authenticated users can upload exhibitor logos"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'exhibitor-logos');

-- Politique pour mettre à jour les logos
CREATE POLICY "Authenticated users can update exhibitor logos"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'exhibitor-logos')
  WITH CHECK (bucket_id = 'exhibitor-logos');

-- Politique pour supprimer les logos
CREATE POLICY "Authenticated users can delete exhibitor logos"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'exhibitor-logos');

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
WHERE tablename = 'exhibitor_profiles'
ORDER BY tablename, policyname;

-- Vérifier que le bucket existe
SELECT id, name, public FROM storage.buckets WHERE id = 'exhibitor-logos';
