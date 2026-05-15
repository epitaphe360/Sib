-- Fix: politiques RLS chapiteau utilisaient `role = 'admin'`
-- au lieu de `type = 'admin'` (colonne réelle dans public.users)
-- Conséquence : tout UPDATE/INSERT/DELETE admin échouait silencieusement.

-- ── chapiteau_items ─────────────────────────────────────────

DROP POLICY IF EXISTS "chapiteau_items_admin_all" ON public.chapiteau_items;

CREATE POLICY "chapiteau_items_admin_all"
  ON public.chapiteau_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND type = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND type = 'admin'
    )
  );

-- ── chapiteau_orders ─────────────────────────────────────────

DROP POLICY IF EXISTS "chapiteau_orders_select_own" ON public.chapiteau_orders;

CREATE POLICY "chapiteau_orders_select_own"
  ON public.chapiteau_orders FOR SELECT
  USING (
    customer_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND type = 'admin'
    )
  );

DROP POLICY IF EXISTS "chapiteau_orders_update_own_or_admin" ON public.chapiteau_orders;

CREATE POLICY "chapiteau_orders_update_own_or_admin"
  ON public.chapiteau_orders FOR UPDATE
  USING (
    customer_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND type = 'admin'
    )
  );

-- Politique DELETE admin (manquait dans la migration originale)
DROP POLICY IF EXISTS "chapiteau_orders_admin_delete" ON public.chapiteau_orders;

CREATE POLICY "chapiteau_orders_admin_delete"
  ON public.chapiteau_orders FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND type = 'admin'
    )
  );
