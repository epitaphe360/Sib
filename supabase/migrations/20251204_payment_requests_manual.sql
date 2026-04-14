-- Migration: Système de paiement par virement bancaire avec validation manuelle
-- Date: 2025-12-04
-- Description: Remplacement de Stripe par un système de demandes de paiement validées manuellement

-- ============================================
-- CRÉATION TABLE payment_requests
-- ============================================

CREATE TABLE IF NOT EXISTS public.payment_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  requested_level text NOT NULL CHECK (requested_level IN ('premium', 'silver', 'gold', 'platinium', 'museum')),
  amount numeric NOT NULL DEFAULT 700.00,
  currency text NOT NULL DEFAULT 'EUR',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  payment_method text NOT NULL DEFAULT 'bank_transfer',

  -- Informations de virement
  transfer_reference text,
  transfer_date timestamp with time zone,
  transfer_proof_url text, -- URL du justificatif de paiement uploadé

  -- Validation admin
  validated_by uuid REFERENCES public.users(id),
  validated_at timestamp with time zone,
  validation_notes text,

  -- Métadonnées
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Mise à jour de la contrainte si la table existe déjà
DO $$ 
BEGIN 
    ALTER TABLE public.payment_requests 
    DROP CONSTRAINT IF EXISTS payment_requests_requested_level_check;
    
    ALTER TABLE public.payment_requests 
    ADD CONSTRAINT payment_requests_requested_level_check 
    CHECK (requested_level IN ('premium', 'silver', 'gold', 'platinium', 'museum'));
EXCEPTION 
    WHEN undefined_table THEN 
        NULL; 
END $$;

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_payment_requests_user_id ON public.payment_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_requests_status ON public.payment_requests(status);
CREATE INDEX IF NOT EXISTS idx_payment_requests_created_at ON public.payment_requests(created_at DESC);

-- ============================================
-- TRIGGER pour updated_at
-- ============================================

CREATE OR REPLACE FUNCTION public.update_payment_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_payment_requests_updated_at ON public.payment_requests;
CREATE TRIGGER trigger_payment_requests_updated_at
  BEFORE UPDATE ON public.payment_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_payment_requests_updated_at();

-- ============================================
-- RLS (Row Level Security)
-- ============================================

ALTER TABLE public.payment_requests ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs peuvent voir leurs propres demandes
DROP POLICY IF EXISTS "Users can view their own payment requests" ON public.payment_requests;
CREATE POLICY "Users can view their own payment requests"
  ON public.payment_requests
  FOR SELECT
  USING (auth.uid() = user_id);

-- Les utilisateurs peuvent créer leurs propres demandes
DROP POLICY IF EXISTS "Users can create their own payment requests" ON public.payment_requests;
CREATE POLICY "Users can create their own payment requests"
  ON public.payment_requests
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Les admins peuvent tout voir et modifier
DROP POLICY IF EXISTS "Admins can view all payment requests" ON public.payment_requests;
CREATE POLICY "Admins can view all payment requests"
  ON public.payment_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND type = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update payment requests" ON public.payment_requests;
CREATE POLICY "Admins can update payment requests"
  ON public.payment_requests
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND type = 'admin'
    )
  );

-- ============================================
-- FONCTION: Approuver une demande de paiement
-- ============================================

DROP FUNCTION IF EXISTS public.approve_payment_request(uuid, uuid, text);

CREATE OR REPLACE FUNCTION public.approve_payment_request(
  request_id uuid,
  admin_id uuid,
  notes text DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  v_user_id uuid;
  v_requested_level text;
BEGIN
  -- Récupérer les infos de la demande
  SELECT user_id, requested_level
  INTO v_user_id, v_requested_level
  FROM public.payment_requests
  WHERE id = request_id AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment request not found or already processed';
  END IF;

  -- Mettre à jour la demande
  UPDATE public.payment_requests
  SET
    status = 'approved',
    validated_by = admin_id,
    validated_at = now(),
    validation_notes = notes
  WHERE id = request_id;

  -- Mettre à jour le niveau de l'utilisateur
  UPDATE public.users
  SET visitor_level = v_requested_level
  WHERE id = v_user_id;

  -- Créer une notification pour l'utilisateur
  INSERT INTO public.notifications (user_id, title, message, type)
  VALUES (
    v_user_id,
    'Paiement approuvé !',
    'Votre paiement a été validé. Vous avez maintenant accès au Pass Premium VIP avec tous les avantages illimités !',
    'success'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FONCTION: Rejeter une demande de paiement
-- ============================================

DROP FUNCTION IF EXISTS public.reject_payment_request(uuid, uuid, text);

CREATE OR REPLACE FUNCTION public.reject_payment_request(
  request_id uuid,
  admin_id uuid,
  notes text DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Récupérer l'user_id
  SELECT user_id
  INTO v_user_id
  FROM public.payment_requests
  WHERE id = request_id AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment request not found or already processed';
  END IF;

  -- Mettre à jour la demande
  UPDATE public.payment_requests
  SET
    status = 'rejected',
    validated_by = admin_id,
    validated_at = now(),
    validation_notes = notes
  WHERE id = request_id;

  -- Créer une notification pour l'utilisateur
  INSERT INTO public.notifications (user_id, title, message, type)
  VALUES (
    v_user_id,
    'Paiement refusé',
    COALESCE(notes, 'Votre demande de paiement n''a pas pu être validée. Veuillez nous contacter pour plus d''informations.'),
    'error'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- DONNÉES DE CONFIGURATION BANCAIRE
-- ============================================

-- Table pour stocker les informations bancaires (pour affichage aux utilisateurs)
CREATE TABLE IF NOT EXISTS public.bank_transfer_info (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_name text NOT NULL,
  account_holder text NOT NULL,
  iban text NOT NULL,
  bic_swift text,
  reference_format text NOT NULL DEFAULT 'SIB-PREMIUM-{USER_ID}',
  instructions text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Insérer les informations bancaires par défaut
INSERT INTO public.bank_transfer_info (bank_name, account_holder, iban, bic_swift, instructions)
VALUES (
  'Attijariwafa bank',
  'LINECO EVENTS',
  'MA64 007 780 000413200000498 25',
  'BCMAMAMC',
  'Merci d''effectuer le virement avec la référence indiquée. Domiciliation: CASA MY IDRISS 1ER. Une fois le paiement effectué, téléchargez votre justificatif sur votre espace personnel. La validation peut prendre 24-48h.'
)
ON CONFLICT DO NOTHING;

-- ============================================
-- VÉRIFICATIONS
-- ============================================

-- Vérifier la structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'payment_requests'
ORDER BY ordinal_position;

SELECT * FROM public.bank_transfer_info;
