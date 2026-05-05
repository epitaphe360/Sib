-- Création des buckets Supabase Storage nécessaires
-- À exécuter dans Supabase Dashboard > SQL Editor

-- Bucket "media" : images articles, articles de location, contenu CMS
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  true,
  5242880,   -- 5 Mo
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- Politique de lecture publique (images affichées côté visiteur)
DROP POLICY IF EXISTS "media_public_read" ON storage.objects;
CREATE POLICY "media_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'media');

-- Politique d'upload réservée aux admins
DROP POLICY IF EXISTS "media_admin_insert" ON storage.objects;
CREATE POLICY "media_admin_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'media'
    AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND type = 'admin')
  );

DROP POLICY IF EXISTS "media_admin_update" ON storage.objects;
CREATE POLICY "media_admin_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'media'
    AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND type = 'admin')
  );

DROP POLICY IF EXISTS "media_admin_delete" ON storage.objects;
CREATE POLICY "media_admin_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'media'
    AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND type = 'admin')
  );
