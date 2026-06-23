-- Migration: Correction de la fonction d'approbation des paiements partenaires
-- Date: 2025-01-03
-- Description: Mise à jour de approve_payment_request() pour gérer correctement les partenaires

-- ============================================
-- FONCTION: Approuver une demande de paiement partenaire
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
  v_user_type text;
BEGIN
  -- Récupérer les infos de la demande
  SELECT user_id, requested_level
  INTO v_user_id, v_requested_level
  FROM public.payment_requests
  WHERE id = request_id AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment request not found or already processed';
  END IF;

  -- Récupérer le type d'utilisateur
  SELECT type
  INTO v_user_type
  FROM public.users
  WHERE id = v_user_id;

  -- Mettre à jour la demande
  UPDATE public.payment_requests
  SET
    status = 'approved',
    validated_by = admin_id,
    validated_at = now(),
    validation_notes = notes
  WHERE id = request_id;

  -- Mettre à jour l'utilisateur selon son type
  IF v_user_type = 'partner' THEN
    -- Pour les partenaires : mettre à jour partner_tier et activer le compte
    UPDATE public.users
    SET
      partner_tier = v_requested_level,
      status = 'active'
    WHERE id = v_user_id;

    -- Créer une notification pour le partenaire
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
      v_user_id,
      'Paiement approuvé !',
      'Votre paiement a été validé. Votre compte partenaire ' || v_requested_level || ' est maintenant actif !',
      'success'
    );
  ELSE
    -- Pour les visiteurs : mettre à jour visitor_level
    UPDATE public.users
    SET visitor_level = v_requested_level
    WHERE id = v_user_id;

    -- Créer une notification pour le visiteur
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
      v_user_id,
      'Paiement approuvé !',
      'Votre paiement a été validé. Vous avez maintenant accès au Pass Premium VIP avec tous les avantages illimités !',
      'success'
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.approve_payment_request IS 'Approuve une demande de paiement et met à jour le niveau utilisateur (partner_tier pour partenaires, visitor_level pour visiteurs)';
