-- Migration: ajouter la colonne `status` à la table `users`
-- Résout les triggers/migrations qui référencent `NEW.status` (erreur 42703)

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';

-- Index pour accélérer les recherches par statut et les filtres d'administration
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);

-- Notes:
-- - Valeur par défaut 'active' pour ne pas bloquer l'accès des comptes existants.
-- - Si vous préférez que les comptes existants soient 'pending', exécutez:
--     UPDATE public.users SET status = 'pending' WHERE status IS NULL;
