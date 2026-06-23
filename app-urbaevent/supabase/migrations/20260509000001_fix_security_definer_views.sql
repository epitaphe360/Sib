-- Fix: Security Definer Views (Supabase Advisor CRITICAL)
-- Ces vues étaient créées sans security_invoker, ce qui leur permettait
-- de contourner le RLS en s'exécutant avec les droits du créateur (postgres).
-- La correction ajoute security_invoker = true pour que les vues respectent
-- les politiques RLS de l'utilisateur appelant.

ALTER VIEW public.active_users_with_profiles SET (security_invoker = true);
ALTER VIEW public.active_badges_summary SET (security_invoker = true);
ALTER VIEW public.upcoming_events SET (security_invoker = true);
ALTER VIEW public.user_connections_view SET (security_invoker = true);
