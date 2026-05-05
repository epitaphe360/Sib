-- ============================================================
-- Migration : Contraintes DB manquantes + RLS critiques
-- Date      : 2026-05-02
-- Priorité  : HAUTE — à appliquer avant la mise en production
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. Normalisation des valeurs type/visitor_level hors-norme
--    (données de démo ou legacy pouvant bloquer le CHECK)
-- ─────────────────────────────────────────────────────────────

-- Les comptes démo ont parfois type='vip' ou type='free' :
-- les ramener à type='visitor' avec le bon visitor_level
UPDATE users
  SET visitor_level = type,     -- conserver 'vip' ou 'free' dans visitor_level
      type          = 'visitor'
WHERE type IN ('vip', 'free', 'premium');

-- Anciens types inconnus → 'visitor' par défaut (audit manuel recommandé)
UPDATE users
  SET type = 'visitor'
WHERE type NOT IN ('exhibitor', 'partner', 'visitor', 'admin', 'security', 'marketing', 'media_partner');

-- ─────────────────────────────────────────────────────────────
-- 2. Contraintes CHECK sur les colonnes enum
-- ─────────────────────────────────────────────────────────────

-- Type utilisateur (liste complète issue de src/types/index.ts)
DO $$ BEGIN
  ALTER TABLE users ADD CONSTRAINT users_type_check
    CHECK (type IN ('exhibitor', 'partner', 'visitor', 'admin', 'security', 'marketing', 'media_partner'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Niveau visiteur
DO $$ BEGIN
  ALTER TABLE users ADD CONSTRAINT users_visitor_level_check
    CHECK (visitor_level IS NULL OR visitor_level IN ('free', 'premium', 'vip'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─────────────────────────────────────────────────────────────
-- 2. Clé étrangère exhibitors → users
-- ─────────────────────────────────────────────────────────────
DO $$ BEGIN
  ALTER TABLE exhibitors ADD CONSTRAINT exhibitors_user_id_fk
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─────────────────────────────────────────────────────────────
-- 3. Contraintes UNIQUE
-- ─────────────────────────────────────────────────────────────

-- Un seul badge par utilisateur
DO $$ BEGIN
  ALTER TABLE user_badges ADD CONSTRAINT user_badges_user_id_unique UNIQUE (user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Pas de double-booking sur un créneau
DO $$ BEGIN
  ALTER TABLE appointments ADD CONSTRAINT appointments_slot_visitor_unique
    UNIQUE (visitor_id, time_slot_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─────────────────────────────────────────────────────────────
-- 4. Index de performance manquants
-- ─────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_users_type ON users(type);
CREATE INDEX IF NOT EXISTS idx_users_email_lower ON users(LOWER(email));
CREATE INDEX IF NOT EXISTS idx_appointments_exhibitor_status ON appointments(exhibitor_id, status);
CREATE INDEX IF NOT EXISTS idx_time_slots_exhibitor_date ON time_slots(exhibitor_id, slot_date);

-- ─────────────────────────────────────────────────────────────
-- 5. RLS manquantes : payment_requests
-- ─────────────────────────────────────────────────────────────
ALTER TABLE payment_requests ENABLE ROW LEVEL SECURITY;

-- Propriétaire peut lire ses propres demandes
DROP POLICY IF EXISTS "payment_requests_select_own" ON payment_requests;
CREATE POLICY "payment_requests_select_own" ON payment_requests
  FOR SELECT USING (user_id = auth.uid());

-- Propriétaire peut créer une demande
DROP POLICY IF EXISTS "payment_requests_insert_own" ON payment_requests;
CREATE POLICY "payment_requests_insert_own" ON payment_requests
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Seuls les admins peuvent modifier (approve/reject)
DROP POLICY IF EXISTS "payment_requests_update_admin" ON payment_requests;
CREATE POLICY "payment_requests_update_admin" ON payment_requests
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND type = 'admin')
  );

-- ─────────────────────────────────────────────────────────────
-- 6. RLS manquantes : time_slots
-- ─────────────────────────────────────────────────────────────
ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;

-- Lecture publique des créneaux disponibles
DROP POLICY IF EXISTS "time_slots_select_all" ON time_slots;
CREATE POLICY "time_slots_select_all" ON time_slots
  FOR SELECT USING (true);

-- Exposant peut créer ses propres créneaux
DROP POLICY IF EXISTS "time_slots_insert_own" ON time_slots;
CREATE POLICY "time_slots_insert_own" ON time_slots
  FOR INSERT WITH CHECK (
    exhibitor_id IN (
      SELECT id FROM exhibitors WHERE user_id = auth.uid()
    )
  );

-- Exposant peut modifier/supprimer ses propres créneaux
DROP POLICY IF EXISTS "time_slots_update_own" ON time_slots;
CREATE POLICY "time_slots_update_own" ON time_slots
  FOR UPDATE USING (
    exhibitor_id IN (
      SELECT id FROM exhibitors WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "time_slots_delete_own" ON time_slots;
CREATE POLICY "time_slots_delete_own" ON time_slots
  FOR DELETE USING (
    exhibitor_id IN (
      SELECT id FROM exhibitors WHERE user_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────────────────────────
-- 7. Fonction RPC : paiement atomique (correction C6)
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION approve_visitor_payment(
  p_user_id    uuid,
  p_payment_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Les deux UPDATE dans une seule transaction — pas de corruption possible
  UPDATE users
    SET visitor_level = 'premium'
    WHERE id = p_user_id;

  UPDATE payment_requests
    SET status = 'approved',
        updated_at = now()
    WHERE id = p_payment_id
      AND user_id = p_user_id;

  -- Si aucune ligne de paiement mise à jour → rollback automatique
  IF NOT FOUND THEN
    RAISE EXCEPTION 'payment_request % not found for user %', p_payment_id, p_user_id;
  END IF;
END;
$$;

-- Restreindre l'exécution aux utilisateurs authentifiés avec rôle admin côté app
REVOKE ALL ON FUNCTION approve_visitor_payment FROM PUBLIC;
GRANT EXECUTE ON FUNCTION approve_visitor_payment TO service_role;
