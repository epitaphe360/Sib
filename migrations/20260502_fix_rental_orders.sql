-- Fix: ajouter customer_email à rental_orders, rendre customer_id nullable (admin peut créer une commande pour un email externe),
-- et assouplir la contrainte customer_type
-- À exécuter dans Supabase Dashboard > SQL Editor

-- 1. Ajouter la colonne customer_email si elle n'existe pas encore
ALTER TABLE public.rental_orders
  ADD COLUMN IF NOT EXISTS customer_email TEXT;

-- 2. Rendre customer_id nullable (l'admin peut créer des commandes pour des clients externes sans compte)
ALTER TABLE public.rental_orders
  ALTER COLUMN customer_id DROP NOT NULL;

-- 2. Remplir customer_email depuis public.users pour les lignes existantes
UPDATE public.rental_orders ro
SET customer_email = u.email
FROM public.users u
WHERE ro.customer_id = u.id
  AND ro.customer_email IS NULL;

-- 3. Assouplir la contrainte customer_type pour accepter visitor et autre
ALTER TABLE public.rental_orders
  DROP CONSTRAINT IF EXISTS rental_orders_customer_type_check;

ALTER TABLE public.rental_orders
  ADD CONSTRAINT rental_orders_customer_type_check
  CHECK (customer_type IN ('exhibitor', 'partner', 'visitor', 'autre'));
