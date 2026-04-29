-- Migration: Fonction RPC sécurisée pour créer un profil utilisateur après signUp
-- Date: 2026-04-28
-- Problème: après auth.signUp(), si email_confirmation est activé, la session
--           est null → auth.uid() = null → RLS INSERT bloque l'insertion.
-- Solution: fonction SECURITY DEFINER accessible à anon + authenticated.
-- Sécurité: ON CONFLICT (id) DO NOTHING empêche l'écrasement d'un profil existant.
--           La vérification préalable de l'email dans public.users (côté client)
--           empêche les doublons. On n'interroge PAS auth.users car Supabase renvoie
--           un faux UUID quand email_confirmation est actif + email déjà connu
--           (protection anti-énumération d'emails).

CREATE OR REPLACE FUNCTION public.register_new_user(
  p_id           uuid,
  p_email        text,
  p_name         text,
  p_type         text,
  p_visitor_level text DEFAULT NULL,
  p_status       text DEFAULT 'active',
  p_profile      jsonb DEFAULT '{}'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validation basique des paramètres obligatoires
  IF p_id IS NULL OR p_email IS NULL OR trim(p_email) = '' THEN
    RAISE EXCEPTION 'register_new_user: p_id et p_email sont obligatoires';
  END IF;

  IF p_type NOT IN ('visitor', 'exhibitor', 'partner', 'admin') THEN
    RAISE EXCEPTION 'register_new_user: type invalide "%"', p_type;
  END IF;

  -- Insertion avec ON CONFLICT DO NOTHING pour éviter tout écrasement
  INSERT INTO public.users (id, email, name, type, visitor_level, status, profile)
  VALUES (p_id, lower(trim(p_email)), p_name, p_type, p_visitor_level, p_status, COALESCE(p_profile, '{}'))
  ON CONFLICT (id) DO NOTHING;
END;
$$;

-- Accès pour les appels non authentifiés (juste après signUp sans session)
GRANT EXECUTE ON FUNCTION public.register_new_user TO anon;
GRANT EXECUTE ON FUNCTION public.register_new_user TO authenticated;

COMMENT ON FUNCTION public.register_new_user IS
  'Crée le profil public.users après auth.signUp(). '
  'SECURITY DEFINER pour contourner RLS quand la session email n''est pas encore active. '
  'ON CONFLICT DO NOTHING empêche tout écrasement de profil existant.';
