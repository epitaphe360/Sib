-- Restaure la politique INSERT sur payment_requests (supprimée par 20260611000002).
-- Sans elle, les visiteurs ne peuvent pas créer de demande de paiement VIP.

DROP POLICY IF EXISTS "Users can create their own payment requests" ON public.payment_requests;

CREATE POLICY "Users can create their own payment requests"
  ON public.payment_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
