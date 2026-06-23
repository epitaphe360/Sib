-- Migration: Simplification des niveaux d'abonnement visiteur
-- Date: 2025-12-04
-- Description: Passage de 4 niveaux (free, basic, premium, vip) à 2 niveaux (free, premium à 700€)
-- Le nouveau niveau premium offre tous les avantages de l'ancien VIP

-- ============================================
-- ÉTAPE 1: Mise à jour de la table visitor_levels
-- ============================================

-- Supprimer les anciens niveaux basic et vip
DELETE FROM public.visitor_levels WHERE level IN ('basic', 'vip');

-- Mettre à jour le quota premium pour illimité (9999)
UPDATE public.visitor_levels
SET quota = 9999
WHERE level = 'premium';

-- S'assurer que le niveau free existe avec quota 0
INSERT INTO public.visitor_levels (level, quota)
VALUES ('free', 0)
ON CONFLICT (level) DO UPDATE SET quota = 0;

-- ============================================
-- ÉTAPE 2: Migration des utilisateurs existants
-- ============================================

-- Migrer les utilisateurs "basic" vers "free"
-- (ils devront repayer pour obtenir le premium)
UPDATE public.users
SET visitor_level = 'free'
WHERE visitor_level = 'basic';

-- Migrer les utilisateurs "vip" vers "premium"
-- (ils gardent leurs avantages)
UPDATE public.users
SET visitor_level = 'premium'
WHERE visitor_level = 'vip';

-- ============================================
-- ÉTAPE 3: Nettoyage des données obsolètes
-- ============================================

-- Optionnel: Supprimer les anciennes transactions liées aux niveaux supprimés
-- (Commenté pour conserver l'historique)
-- DELETE FROM public.payment_transactions WHERE visitor_level IN ('basic', 'vip');

-- ============================================
-- ÉTAPE 4: Vérification
-- ============================================

-- Afficher les niveaux restants
SELECT * FROM public.visitor_levels ORDER BY quota;

-- Afficher la distribution des utilisateurs par niveau
SELECT visitor_level, COUNT(*) as count
FROM public.users
WHERE visitor_level IS NOT NULL
GROUP BY visitor_level
ORDER BY count DESC;

-- ============================================
-- RÉSULTAT ATTENDU
-- ============================================
-- visitor_levels devrait contenir:
--   - free: quota 0
--   - premium: quota 9999
--
-- Tous les utilisateurs devraient avoir visitor_level = 'free' ou 'premium'
