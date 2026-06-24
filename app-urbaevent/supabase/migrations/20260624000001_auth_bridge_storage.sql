-- Bucket public pour la page pont auth mobile (liens email HTTPS cliquables)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'auth-bridge',
  'auth-bridge',
  true,
  1048576,
  ARRAY['text/html', 'text/plain']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Public read auth bridge" ON storage.objects;
CREATE POLICY "Public read auth bridge"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'auth-bridge');

DROP POLICY IF EXISTS "Service role manage auth bridge" ON storage.objects;
CREATE POLICY "Service role manage auth bridge"
  ON storage.objects FOR ALL
  TO service_role
  USING (bucket_id = 'auth-bridge')
  WITH CHECK (bucket_id = 'auth-bridge');
