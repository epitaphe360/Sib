-- Migration: mise à jour RLS badge_scans pour inclure les collaborateurs de l'équipe exposant.
-- Un owner peut lire les scans de ses collaborateurs actifs (stand_collaborators),
-- et un collaborateur peut lire les scans de l'owner et des autres membres de son équipe.

-- Supprimer l'ancienne policy SELECT restrictive (owner uniquement)
DROP POLICY IF EXISTS "Exposant voit ses scans" ON public.badge_scans;

-- Nouvelle policy multi-membres :
CREATE POLICY "Exposant voit ses scans"
  ON public.badge_scans FOR SELECT
  USING (
    -- Mes propres scans
    scanned_by = auth.uid()

    -- Owner → scans de ses collaborateurs actifs
    OR scanned_by IN (
      SELECT auth_user_id FROM public.stand_collaborators
      WHERE owner_id = auth.uid()
        AND auth_user_id IS NOT NULL
        AND status = 'active'
    )

    -- Collaborateur → scans de l'owner de son équipe
    OR scanned_by IN (
      SELECT owner_id FROM public.stand_collaborators
      WHERE auth_user_id = auth.uid()
        AND status = 'active'
    )

    -- Collaborateur → scans des autres collaborateurs de la même équipe
    OR scanned_by IN (
      SELECT sc2.auth_user_id
      FROM public.stand_collaborators sc2
      INNER JOIN public.stand_collaborators sc1 ON sc1.owner_id = sc2.owner_id
      WHERE sc1.auth_user_id = auth.uid()
        AND sc1.status = 'active'
        AND sc2.auth_user_id IS NOT NULL
        AND sc2.status = 'active'
    )
  );
