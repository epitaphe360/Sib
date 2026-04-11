-- Script SQL pour créer les tables de mise en réseau (networking)
-- À exécuter dans l'éditeur SQL de Supabase

-- Table pour les connexions entre utilisateurs
CREATE TABLE IF NOT EXISTS public.connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    addressee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected', 'blocked')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(requester_id, addressee_id)
);

-- Table pour les favoris des utilisateurs
CREATE TABLE IF NOT EXISTS public.user_favorites (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    favorite_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, favorite_user_id)
);

-- Table pour les recommandations de mise en réseau
CREATE TABLE IF NOT EXISTS public.networking_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    recommended_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    recommendation_type TEXT NOT NULL,
    score NUMERIC(5,2) NOT NULL,
    reasons TEXT[] NOT NULL,
    category TEXT NOT NULL,
    viewed BOOLEAN DEFAULT FALSE,
    contacted BOOLEAN DEFAULT FALSE,
    mutual_connections INTEGER DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ajout des politiques RLS (Row Level Security)

-- Politiques pour connections
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Les utilisateurs peuvent voir leurs propres connexions"
ON public.connections
FOR SELECT
USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

CREATE POLICY "Les utilisateurs peuvent créer leurs propres demandes de connexion"
ON public.connections
FOR INSERT
WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Les utilisateurs peuvent mettre à jour leurs propres connexions"
ON public.connections
FOR UPDATE
USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- Politiques pour user_favorites
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Les utilisateurs peuvent voir leurs propres favoris"
ON public.user_favorites
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent ajouter leurs propres favoris"
ON public.user_favorites
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent supprimer leurs propres favoris"
ON public.user_favorites
FOR DELETE
USING (auth.uid() = user_id);

-- Politiques pour networking_recommendations
ALTER TABLE public.networking_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Les utilisateurs peuvent voir leurs propres recommandations"
ON public.networking_recommendations
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Les administrateurs peuvent gérer toutes les recommandations"
ON public.networking_recommendations
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid() AND users.type = 'admin'
  )
);

-- Création d'index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_connections_requester_id ON public.connections(requester_id);
CREATE INDEX IF NOT EXISTS idx_connections_addressee_id ON public.connections(addressee_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON public.user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_networking_recommendations_user_id ON public.networking_recommendations(user_id);

-- Fonction de déclencheur (trigger) pour mettre à jour le timestamp updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ajout du déclencheur aux tables appropriées
DROP TRIGGER IF EXISTS set_connections_updated_at ON public.connections;
CREATE TRIGGER set_connections_updated_at
BEFORE UPDATE ON public.connections
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_networking_recommendations_updated_at ON public.networking_recommendations;
CREATE TRIGGER set_networking_recommendations_updated_at
BEFORE UPDATE ON public.networking_recommendations
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();
