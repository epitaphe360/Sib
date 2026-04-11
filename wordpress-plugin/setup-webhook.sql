-- ============================================================
-- Script SQL pour configurer les webhooks automatiques
-- Exécutez ce script dans Supabase SQL Editor
-- ============================================================

-- Note: Les webhooks Supabase sont configurés via l'interface Dashboard
-- Ce fichier est pour référence uniquement

-- ============================================================
-- OPTION 1: Configuration via Dashboard (RECOMMANDÉ)
-- ============================================================
-- 1. Allez dans Database → Webhooks
-- 2. Créez un webhook avec ces paramètres:
--    - Name: wordpress_media_sync
--    - Table: media_contents
--    - Events: INSERT, UPDATE, DELETE
--    - URL: https://votre-site.com/wp-json/siports/v1/sync
--    - Headers: X-Webhook-Secret: siports_webhook_2024

-- ============================================================
-- OPTION 2: Fonction Edge pour notification
-- ============================================================
-- Si vous préférez utiliser Edge Functions:

/*
-- Créer une Edge Function dans Supabase:
-- Fichier: supabase/functions/notify-wordpress/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  const { record, type, table } = await req.json()
  
  const wordpressUrl = Deno.env.get('WORDPRESS_WEBHOOK_URL') || 'https://votre-site.com/wp-json/siports/v1/sync'
  const webhookSecret = Deno.env.get('WORDPRESS_WEBHOOK_SECRET') || 'siports_webhook_2024'
  
  try {
    const response = await fetch(wordpressUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Secret': webhookSecret
      },
      body: JSON.stringify({ record, type, table })
    })
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})
*/

-- ============================================================
-- OPTION 3: Trigger PostgreSQL avec pg_net (Avancé)
-- ============================================================
-- Nécessite l'extension pg_net activée

-- Activer pg_net si pas déjà fait
-- CREATE EXTENSION IF NOT EXISTS pg_net;

/*
-- Fonction de notification
CREATE OR REPLACE FUNCTION notify_wordpress_on_media_change()
RETURNS TRIGGER AS $$
DECLARE
  payload JSON;
  wordpress_url TEXT := 'https://votre-site.com/wp-json/siports/v1/sync';
BEGIN
  -- Construire le payload
  payload := json_build_object(
    'table', TG_TABLE_NAME,
    'type', TG_OP,
    'record', CASE 
      WHEN TG_OP = 'DELETE' THEN row_to_json(OLD)
      ELSE row_to_json(NEW)
    END
  );
  
  -- Envoyer la requête HTTP
  PERFORM net.http_post(
    url := wordpress_url,
    headers := '{"Content-Type": "application/json", "X-Webhook-Secret": "siports_webhook_2024"}'::jsonb,
    body := payload::text
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger
DROP TRIGGER IF EXISTS media_wordpress_sync ON media_contents;
CREATE TRIGGER media_wordpress_sync
AFTER INSERT OR UPDATE OR DELETE ON media_contents
FOR EACH ROW
EXECUTE FUNCTION notify_wordpress_on_media_change();

-- Faire de même pour la table articles si nécessaire
DROP TRIGGER IF EXISTS articles_wordpress_sync ON articles;
CREATE TRIGGER articles_wordpress_sync
AFTER INSERT OR UPDATE OR DELETE ON articles
FOR EACH ROW
EXECUTE FUNCTION notify_wordpress_on_media_change();
*/

-- ============================================================
-- Vérification des médias existants
-- ============================================================

-- Voir tous les médias publiés
SELECT id, title, type, status, created_at
FROM media_contents
WHERE status = 'published'
ORDER BY created_at DESC
LIMIT 20;

-- Compter les médias par type
SELECT type, COUNT(*) as count
FROM media_contents
WHERE status = 'published'
GROUP BY type
ORDER BY count DESC;
