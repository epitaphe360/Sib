-- ============================================================
-- Migration: rental_order_payments
-- Regroupe les paiements TVA inclus pour les commandes de location
-- ============================================================

CREATE TABLE IF NOT EXISTS rental_order_payments (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number    text UNIQUE NOT NULL,
  customer_id       uuid REFERENCES users(id) ON DELETE SET NULL,
  entity_type       text NOT NULL,          -- 'exhibitor' | 'partner'
  entity_id         uuid,
  subtotal_ht       numeric(12,2) NOT NULL,
  tva_rate          numeric(5,4)  NOT NULL DEFAULT 0.20,
  tva_amount        numeric(12,2) NOT NULL,
  total_ttc         numeric(12,2) NOT NULL,
  currency          text NOT NULL DEFAULT 'MAD',
  rental_start      date,
  rental_end        date,
  payment_method    text,                   -- 'paypal' | 'cmi'
  payment_status    text NOT NULL DEFAULT 'pending', -- 'pending' | 'completed' | 'failed'
  payment_ref       text,                   -- ID transaction PayPal / CMI
  items_snapshot    jsonb,                  -- snapshot du panier au moment du paiement
  paid_at           timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now()
);

-- Index pour accès rapide par client
CREATE INDEX IF NOT EXISTS idx_rental_order_payments_customer
  ON rental_order_payments (customer_id);

CREATE INDEX IF NOT EXISTS idx_rental_order_payments_status
  ON rental_order_payments (payment_status);

-- RLS
ALTER TABLE rental_order_payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Clients voient leurs propres paiements" ON rental_order_payments;
CREATE POLICY "Clients voient leurs propres paiements"
  ON rental_order_payments FOR SELECT
  USING (customer_id = auth.uid());

DROP POLICY IF EXISTS "Clients créent leurs paiements" ON rental_order_payments;
CREATE POLICY "Clients créent leurs paiements"
  ON rental_order_payments FOR INSERT
  WITH CHECK (customer_id = auth.uid());

DROP POLICY IF EXISTS "Clients mettent à jour leurs paiements en attente" ON rental_order_payments;
CREATE POLICY "Clients mettent à jour leurs paiements en attente"
  ON rental_order_payments FOR UPDATE
  USING (customer_id = auth.uid() AND payment_status = 'pending');

DROP POLICY IF EXISTS "Admins gèrent tous les paiements" ON rental_order_payments;
CREATE POLICY "Admins gèrent tous les paiements"
  ON rental_order_payments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND type = 'admin'
    )
  );
