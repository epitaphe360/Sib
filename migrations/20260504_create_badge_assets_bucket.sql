-- Bucket "badge-assets" : images uploadées depuis AdminBadgeConfigPage
-- Illustrations téléphone, logos badge A4 bifold SIB 2026
-- À exécuter dans Supabase Dashboard > SQL Editor

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'badge-assets',
  'badge-assets',
  true,
  5242880,   -- 5 Mo
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- Lecture publique (images affichées sur le badge imprimé)
DROP POLICY IF EXISTS "badge_assets_public_read" ON storage.objects;
CREATE POLICY "badge_assets_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'badge-assets');

-- Upload réservé aux admins
DROP POLICY IF EXISTS "badge_assets_admin_insert" ON storage.objects;
CREATE POLICY "badge_assets_admin_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'badge-assets'
    AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND type = 'admin')
  );

DROP POLICY IF EXISTS "badge_assets_admin_update" ON storage.objects;
CREATE POLICY "badge_assets_admin_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'badge-assets'
    AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND type = 'admin')
  );

DROP POLICY IF EXISTS "badge_assets_admin_delete" ON storage.objects;
CREATE POLICY "badge_assets_admin_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'badge-assets'
    AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND type = 'admin')
  );
