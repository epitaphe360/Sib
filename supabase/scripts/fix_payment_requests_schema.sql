
-- Ajout des colonnes manquantes pour le suivi des validations de paiement
ALTER TABLE public.payment_requests
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS validated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS validated_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS validation_notes TEXT;

-- Mettre à jour approved_at pour les paiements déjà validés si NULL
UPDATE public.payment_requests
SET approved_at = updated_at
WHERE status = 'approved' AND approved_at IS NULL;

-- Mettre à jour rejected_at pour les paiements rejetés si NULL
UPDATE public.payment_requests
SET rejected_at = updated_at
WHERE status = 'rejected' AND rejected_at IS NULL;
