-- Ajoute le champ visitor_level à la table users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS visitor_level text;
-- Optionnel : index pour les recherches rapides
CREATE INDEX IF NOT EXISTS idx_users_visitor_level ON public.users(visitor_level);
