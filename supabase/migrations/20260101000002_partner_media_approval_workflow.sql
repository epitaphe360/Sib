-- Migration: Workflow de validation des médias partenaires
-- Created: 2026-01-01
-- Description: Ajoute un système d'approbation admin pour les médias créés par les partenaires

BEGIN;

-- ============================================
-- 1. MODIFIER LA TABLE media_contents
-- ============================================

-- Ajouter un champ pour identifier le créateur (admin vs partenaire)
ALTER TABLE public.media_contents 
  ADD COLUMN IF NOT EXISTS created_by_type text DEFAULT 'admin' CHECK (created_by_type IN ('admin', 'partner', 'exhibitor')),
  ADD COLUMN IF NOT EXISTS created_by_id uuid,
  ADD COLUMN IF NOT EXISTS approved_by_admin_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS rejection_reason text;

-- Modifier le CHECK constraint du statut pour inclure les nouveaux statuts
ALTER TABLE public.media_contents 
  DROP CONSTRAINT IF EXISTS media_contents_status_check;

ALTER TABLE public.media_contents 
  ADD CONSTRAINT media_contents_status_check 
  CHECK (status IN ('draft', 'pending_approval', 'approved', 'published', 'rejected', 'archived'));

-- Commentaires pour documentation
COMMENT ON COLUMN public.media_contents.status IS 
  'Statut du média: draft (brouillon), pending_approval (en attente de validation admin), approved (validé), published (publié), rejected (rejeté), archived (archivé)';

COMMENT ON COLUMN public.media_contents.created_by_type IS 
  'Type de créateur: admin (équipe SIPORT), partner (partenaire sponsor), exhibitor (exposant)';

COMMENT ON COLUMN public.media_contents.created_by_id IS 
  'ID du créateur (référence users.id)';

COMMENT ON COLUMN public.media_contents.approved_by_admin_id IS 
  'ID de l''administrateur qui a approuvé le média';

COMMENT ON COLUMN public.media_contents.rejection_reason IS 
  'Raison du rejet si le média est rejeté par un admin';

-- ============================================
-- 2. FONCTION TRIGGER POUR AUTO-APPROVAL ADMIN
-- ============================================

-- Les médias créés par les admins sont automatiquement approuvés
CREATE OR REPLACE FUNCTION public.auto_approve_admin_media()
RETURNS TRIGGER AS $$
BEGIN
  -- Si créé par un admin, approuver automatiquement
  IF NEW.created_by_type = 'admin' AND NEW.status = 'draft' THEN
    NEW.status := 'approved';
    NEW.approved_by_admin_id := NEW.created_by_id;
    NEW.approved_at := now();
  END IF;
  
  -- Si créé par un partenaire, mettre en pending_approval
  IF NEW.created_by_type = 'partner' AND NEW.status = 'draft' THEN
    NEW.status := 'pending_approval';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Appliquer le trigger
DROP TRIGGER IF EXISTS trigger_auto_approve_media ON public.media_contents;
CREATE TRIGGER trigger_auto_approve_media
  BEFORE INSERT ON public.media_contents
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_approve_admin_media();

-- ============================================
-- 3. POLITIQUES RLS
-- ============================================

-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Public can view published media" ON public.media_contents;
DROP POLICY IF EXISTS "Partners can create media" ON public.media_contents;
DROP POLICY IF EXISTS "Partners can view own media" ON public.media_contents;
DROP POLICY IF EXISTS "Admins can manage all media" ON public.media_contents;

-- Activer RLS
ALTER TABLE public.media_contents ENABLE ROW LEVEL SECURITY;

-- Politique 1: Lecture publique des médias approuvés/publiés
CREATE POLICY "Public can view approved media"
  ON public.media_contents
  FOR SELECT
  TO public
  USING (status IN ('approved', 'published'));

-- Politique 2: Les partenaires peuvent créer des médias
CREATE POLICY "Partners can create media"
  ON public.media_contents
  FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by_type = 'partner'
    AND created_by_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND type = 'partner'
    )
  );

-- Politique 3: Les partenaires peuvent voir leurs propres médias
CREATE POLICY "Partners can view own media"
  ON public.media_contents
  FOR SELECT
  TO authenticated
  USING (
    created_by_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND type = 'admin'
    )
  );

-- Politique 4: Les partenaires peuvent mettre à jour leurs médias en draft/pending
CREATE POLICY "Partners can update own pending media"
  ON public.media_contents
  FOR UPDATE
  TO authenticated
  USING (
    created_by_id = auth.uid()
    AND status IN ('draft', 'pending_approval', 'rejected')
  )
  WITH CHECK (
    created_by_id = auth.uid()
    AND status IN ('draft', 'pending_approval')
  );

-- Politique 5: Les admins peuvent tout faire
CREATE POLICY "Admins can manage all media"
  ON public.media_contents
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND type = 'admin'
    )
  );

-- ============================================
-- 4. INDEX POUR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_media_contents_status ON public.media_contents(status);
CREATE INDEX IF NOT EXISTS idx_media_contents_created_by ON public.media_contents(created_by_type, created_by_id);
CREATE INDEX IF NOT EXISTS idx_media_contents_pending ON public.media_contents(status) WHERE status = 'pending_approval';

-- ============================================
-- 5. VUE POUR LES MÉDIAS EN ATTENTE
-- ============================================

CREATE OR REPLACE VIEW public.pending_partner_media AS
SELECT 
  mc.*,
  u.name as creator_name,
  u.email as creator_email,
  pp.company_name as partner_company
FROM public.media_contents mc
LEFT JOIN public.users u ON mc.created_by_id = u.id
LEFT JOIN public.partner_profiles pp ON mc.created_by_id = pp.user_id
WHERE mc.status = 'pending_approval'
  AND mc.created_by_type = 'partner'
ORDER BY mc.created_at DESC;

-- Permissions sur la vue
GRANT SELECT ON public.pending_partner_media TO authenticated;

-- ============================================
-- 6. FONCTION POUR APPROUVER UN MÉDIA
-- ============================================

CREATE OR REPLACE FUNCTION public.approve_partner_media(
  media_id uuid,
  admin_id uuid
)
RETURNS jsonb AS $$
DECLARE
  result jsonb;
  is_admin boolean;
BEGIN
  -- Vérifier que l'utilisateur est admin
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = admin_id AND type = 'admin'
  ) INTO is_admin;
  
  IF NOT is_admin THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Seuls les administrateurs peuvent approuver des médias'
    );
  END IF;
  
  -- Approuver le média
  UPDATE public.media_contents
  SET 
    status = 'approved',
    approved_by_admin_id = admin_id,
    approved_at = now(),
    rejection_reason = NULL
  WHERE id = media_id
    AND status = 'pending_approval';
  
  IF FOUND THEN
    RETURN jsonb_build_object(
      'success', true,
      'message', 'Média approuvé avec succès'
    );
  ELSE
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Média non trouvé ou déjà traité'
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 7. FONCTION POUR REJETER UN MÉDIA
-- ============================================

CREATE OR REPLACE FUNCTION public.reject_partner_media(
  media_id uuid,
  admin_id uuid,
  reason text
)
RETURNS jsonb AS $$
DECLARE
  result jsonb;
  is_admin boolean;
BEGIN
  -- Vérifier que l'utilisateur est admin
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = admin_id AND type = 'admin'
  ) INTO is_admin;
  
  IF NOT is_admin THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Seuls les administrateurs peuvent rejeter des médias'
    );
  END IF;
  
  -- Rejeter le média
  UPDATE public.media_contents
  SET 
    status = 'rejected',
    rejection_reason = reason,
    updated_at = now()
  WHERE id = media_id
    AND status = 'pending_approval';
  
  IF FOUND THEN
    RETURN jsonb_build_object(
      'success', true,
      'message', 'Média rejeté'
    );
  ELSE
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Média non trouvé ou déjà traité'
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;
