-- ============================================================
-- Correctif : policies rental_order_payments
-- Corrige role = 'admin' → type = 'admin'
-- À exécuter si la table a déjà été créée avec l'ancienne migration
-- ============================================================

DROP POLICY IF EXISTS "Clients voient leurs propres paiements" ON public.rental_order_payments;
DROP POLICY IF EXISTS "Clients créent leurs paiements" ON public.rental_order_payments;
DROP POLICY IF EXISTS "Clients mettent à jour leurs paiements en attente" ON public.rental_order_payments;
DROP POLICY IF EXISTS "Admins gèrent tous les paiements" ON public.rental_order_payments;

CREATE POLICY "Clients voient leurs propres paiements"
  ON public.rental_order_payments FOR SELECT
  USING (customer_id = auth.uid());

CREATE POLICY "Clients créent leurs paiements"
  ON public.rental_order_payments FOR INSERT
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Clients mettent à jour leurs paiements en attente"
  ON public.rental_order_payments FOR UPDATE
  USING (customer_id = auth.uid() AND payment_status = 'pending');

CREATE POLICY "Admins gèrent tous les paiements"
  ON public.rental_order_payments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND type = 'admin'
    )
  );
