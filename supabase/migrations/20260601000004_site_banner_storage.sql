-- Stockage des bannières site (UrbaEvent, logo ministère, etc.)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'images',
  'images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Public read site banner files" ON storage.objects;
CREATE POLICY "Public read site banner files"
  ON storage.objects
  FOR SELECT
  TO public
  USING (
    bucket_id = 'images'
    AND (storage.foldername(name))[1] = 'banners'
  );

DROP POLICY IF EXISTS "Admins upload site banner files" ON storage.objects;
CREATE POLICY "Admins upload site banner files"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'images'
    AND (storage.foldername(name))[1] = 'banners'
    AND EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.type = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins update site banner files" ON storage.objects;
CREATE POLICY "Admins update site banner files"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'images'
    AND (storage.foldername(name))[1] = 'banners'
    AND EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.type = 'admin'
    )
  )
  WITH CHECK (
    bucket_id = 'images'
    AND (storage.foldername(name))[1] = 'banners'
    AND EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.type = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins delete site banner files" ON storage.objects;
CREATE POLICY "Admins delete site banner files"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'images'
    AND (storage.foldername(name))[1] = 'banners'
    AND EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.type = 'admin'
    )
  );
