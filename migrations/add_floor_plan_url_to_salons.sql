-- Migration : Ajouter l'URL du plan du salon
-- À exécuter dans Supabase Dashboard → SQL Editor

ALTER TABLE salons ADD COLUMN IF NOT EXISTS floor_plan_url TEXT;

COMMENT ON COLUMN salons.floor_plan_url IS 'URL publique vers le PDF ou image du plan du salon (Supabase Storage ou lien externe)';
