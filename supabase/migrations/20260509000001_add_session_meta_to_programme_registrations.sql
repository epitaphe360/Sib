-- Migration: Ajouter métadonnées de session à programme_registrations
-- Date: 2026-05-09
-- Description: Stocke le titre, l'heure et la date de la session lors de l'inscription
--   pour permettre l'affichage dans le calendrier personnel sans dépendre du store.

ALTER TABLE public.programme_registrations
  ADD COLUMN IF NOT EXISTS session_title       text,
  ADD COLUMN IF NOT EXISTS session_time        text,
  ADD COLUMN IF NOT EXISTS session_date        text,
  ADD COLUMN IF NOT EXISTS session_description text;
