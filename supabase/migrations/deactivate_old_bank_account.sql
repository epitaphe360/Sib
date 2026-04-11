-- ============================================
-- DÉSACTIVER L'ANCIEN COMPTE BANCAIRE
-- ============================================
-- Ce script désactive l'ancien compte Banque Internationale du Maroc
-- et garde uniquement le nouveau compte LINECO EVENTS / Attijariwafa bank actif

-- Désactiver tous les anciens comptes sauf Attijariwafa bank
UPDATE public.bank_transfer_info
SET is_active = false
WHERE bank_name != 'Attijariwafa bank'
  AND is_active = true;

-- Vérifier que seul le bon compte est actif
SELECT 
  id,
  bank_name,
  account_holder,
  iban,
  bic_swift,
  is_active,
  created_at
FROM public.bank_transfer_info
ORDER BY created_at DESC;

-- ============================================
-- RÉSULTAT ATTENDU
-- ============================================
-- Seul le compte LINECO EVENTS / Attijariwafa bank doit être actif (is_active = true)
-- L'ancien compte SIPORTS EVENT SARL / Banque Internationale doit être inactif (is_active = false)
