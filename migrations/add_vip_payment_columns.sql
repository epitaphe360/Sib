-- Migration : Ajouter les colonnes de paiement VIP à la table users
-- À exécuter dans Supabase Dashboard → SQL Editor

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS pass_type        TEXT    DEFAULT 'standard' CHECK (pass_type IN ('standard', 'vip')),
  ADD COLUMN IF NOT EXISTS payment_method   TEXT,
  ADD COLUMN IF NOT EXISTS payment_order_id TEXT,
  ADD COLUMN IF NOT EXISTS payment_date     TIMESTAMPTZ;

-- Index pour les lookups par orderId
CREATE INDEX IF NOT EXISTS idx_users_payment_order_id ON users (payment_order_id);

-- Commentaires
COMMENT ON COLUMN users.pass_type        IS 'standard | vip — activé après paiement confirmé';
COMMENT ON COLUMN users.payment_method   IS 'paypal | cmi | apple_pay';
COMMENT ON COLUMN users.payment_order_id IS 'ID de commande PayPal / CMI pour traçabilité';
COMMENT ON COLUMN users.payment_date     IS 'Date d''activation du Pass VIP';
