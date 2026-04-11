// Script SQL pour créer les tables manquantes dans Supabase SQL Editor

-- Table pour stocker les favoris des utilisateurs
CREATE TABLE IF NOT EXISTS public.user_favorites (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  favorite_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, favorite_user_id)
);

-- Ajouter les politiques RLS pour user_favorites
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

-- Politique: les utilisateurs peuvent voir leurs propres favoris
CREATE POLICY "Utilisateurs peuvent voir leurs favoris"
  ON public.user_favorites
  FOR SELECT
  USING (auth.uid() = user_id);

-- Politique: les utilisateurs peuvent ajouter des favoris
CREATE POLICY "Utilisateurs peuvent ajouter des favoris"
  ON public.user_favorites
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Politique: les utilisateurs peuvent supprimer leurs favoris
CREATE POLICY "Utilisateurs peuvent supprimer leurs favoris"
  ON public.user_favorites
  FOR DELETE
  USING (auth.uid() = user_id);

-- Table pour stocker les connexions entre utilisateurs
CREATE TABLE IF NOT EXISTS public.connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  addressee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (requester_id, addressee_id)
);

-- Ajouter les politiques RLS pour connections
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;

-- Politique: les utilisateurs peuvent voir leurs connexions
CREATE POLICY "Utilisateurs peuvent voir leurs connexions"
  ON public.connections
  FOR SELECT
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- Politique: les utilisateurs peuvent créer des demandes de connexion
CREATE POLICY "Utilisateurs peuvent créer des demandes de connexion"
  ON public.connections
  FOR INSERT
  WITH CHECK (auth.uid() = requester_id);

-- Politique: les utilisateurs peuvent mettre à jour les connexions qui les concernent
CREATE POLICY "Utilisateurs peuvent mettre à jour leurs connexions"
  ON public.connections
  FOR UPDATE
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- Politique: les utilisateurs peuvent supprimer leurs connexions
CREATE POLICY "Utilisateurs peuvent supprimer leurs connexions"
  ON public.connections
  FOR DELETE
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON public.user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_connections_requester_id ON public.connections(requester_id);
CREATE INDEX IF NOT EXISTS idx_connections_addressee_id ON public.connections(addressee_id);
CREATE INDEX IF NOT EXISTS idx_connections_status ON public.connections(status);

-- Accorder les privilèges d'accès au rôle authentifié
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_favorites TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.connections TO authenticated;

-- Accorder les privilèges d'accès au rôle anon pour les requêtes publiques
GRANT SELECT ON public.connections TO anon;

-- Fonction et trigger pour mettre à jour les champs updated_at automatiquement
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger pour connections
DROP TRIGGER IF EXISTS connections_updated_at ON public.connections;
CREATE TRIGGER connections_updated_at
BEFORE UPDATE ON public.connections
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
