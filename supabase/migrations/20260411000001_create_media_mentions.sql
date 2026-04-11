-- Migration: Créer la table media_mentions pour le suivi de couverture médiatique des partenaires
-- Date: 2026-04-11

BEGIN;

CREATE TABLE IF NOT EXISTS public.media_mentions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid REFERENCES public.partners(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('tv', 'press', 'social', 'upcoming')),

  -- Champs communs
  title text NOT NULL,
  description text,
  mention_date date,
  reach text,
  sentiment text CHECK (sentiment IN ('very_positive', 'positive', 'neutral', 'negative')),
  status text DEFAULT 'published' CHECK (status IN ('published', 'scheduled', 'confirmed', 'in_preparation', 'draft')),
  url text,

  -- TV spécifique
  duration text,

  -- Presse spécifique
  outlet text,
  headline text,
  excerpt text,

  -- Social spécifique
  platform text,
  content text,
  engagement text,

  -- Evenements a venir
  media text,
  topic text,

  -- Métadonnées
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index pour les requêtes par partenaire
CREATE INDEX IF NOT EXISTS media_mentions_partner_id_idx ON public.media_mentions(partner_id);
CREATE INDEX IF NOT EXISTS media_mentions_type_idx ON public.media_mentions(type);

-- RLS
ALTER TABLE public.media_mentions ENABLE ROW LEVEL SECURITY;

-- Trigger updated_at
DROP TRIGGER IF EXISTS update_media_mentions_updated_at_trigger ON public.media_mentions;
CREATE TRIGGER update_media_mentions_updated_at_trigger
  BEFORE UPDATE ON public.media_mentions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Les partenaires peuvent voir leurs propres mentions
DROP POLICY IF EXISTS "partners_read_own_mentions" ON public.media_mentions;
CREATE POLICY "partners_read_own_mentions" ON public.media_mentions
  FOR SELECT USING (
    partner_id IN (
      SELECT id FROM partners WHERE user_id = auth.uid()
    )
  );

-- Les admins voient tout
DROP POLICY IF EXISTS "admins_all_mentions" ON public.media_mentions;
CREATE POLICY "admins_all_mentions" ON public.media_mentions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND type = 'admin')
  );

-- Les partenaires peuvent insérer leurs propres mentions
DROP POLICY IF EXISTS "partners_insert_own_mentions" ON public.media_mentions;
CREATE POLICY "partners_insert_own_mentions" ON public.media_mentions
  FOR INSERT WITH CHECK (
    partner_id IN (
      SELECT id FROM partners WHERE user_id = auth.uid()
    )
  );

-- Les partenaires peuvent mettre à jour leurs propres mentions
DROP POLICY IF EXISTS "partners_update_own_mentions" ON public.media_mentions;
CREATE POLICY "partners_update_own_mentions" ON public.media_mentions
  FOR UPDATE USING (
    partner_id IN (
      SELECT id FROM partners WHERE user_id = auth.uid()
    )
  );

COMMIT;
