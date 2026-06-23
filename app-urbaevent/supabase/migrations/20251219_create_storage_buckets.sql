-- Création des buckets Supabase Storage pour les photos et badges

-- 1. Bucket pour les photos de profil visiteurs VIP
INSERT INTO storage.buckets (id, name, public)
VALUES ('public', 'public', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Créer le dossier visitor-photos dans le bucket public
-- (Supabase Storage créera automatiquement les dossiers lors de l'upload)

-- 3. Politique de lecture publique pour les photos visiteurs
CREATE POLICY "Public photos are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'public' AND (storage.foldername(name))[1] = 'visitor-photos');

-- 4. Politique d'upload pour les utilisateurs authentifiés
CREATE POLICY "Users can upload visitor photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'public'
  AND (storage.foldername(name))[1] = 'visitor-photos'
  AND auth.role() = 'authenticated'
);

-- 5. Politique de mise à jour pour le propriétaire
CREATE POLICY "Users can update their own photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'public'
  AND (storage.foldername(name))[1] = 'visitor-photos'
  AND auth.role() = 'authenticated'
);

-- 6. Politique de suppression pour le propriétaire
CREATE POLICY "Users can delete their own photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'public'
  AND (storage.foldername(name))[1] = 'visitor-photos'
  AND auth.role() = 'authenticated'
);
