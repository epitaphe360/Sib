-- Migration: Ajouter support pour partenaires et VIP visitors à time_slots
-- Cette migration ajoute une colonne user_id optionnelle et relâche la contrainte sur exhibitor_id

ALTER TABLE time_slots
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- Ajouter un index pour user_id
CREATE INDEX IF NOT EXISTS idx_time_slots_user_id ON time_slots(user_id);

-- Vérifier que au moins l'un des deux (exhibitor_id OU user_id) est défini
ALTER TABLE time_slots
DROP CONSTRAINT IF EXISTS check_slot_owner;

ALTER TABLE time_slots
ADD CONSTRAINT check_slot_owner CHECK (
  (exhibitor_id IS NOT NULL AND user_id IS NULL)
  OR (exhibitor_id IS NULL AND user_id IS NOT NULL)
);

-- Vérifier que exhibitor_id est maintenant NULLABLE (pour permettre l'utilisation de user_id seul)
ALTER TABLE time_slots
ALTER COLUMN exhibitor_id DROP NOT NULL;

-- Mettre à jour les RLS policies pour accepter les deux types
DROP POLICY IF EXISTS "Anyone can view available time slots" ON time_slots;
DROP POLICY IF EXISTS "Partners can manage their own slots" ON time_slots;
DROP POLICY IF EXISTS "Exhibitors can manage their own slots" ON time_slots;
DROP POLICY IF EXISTS "Admins can manage all slots" ON time_slots;

-- Politique de SELECT pour tous
CREATE POLICY "Anyone can view available time slots"
  ON time_slots FOR SELECT
  USING (available = true OR auth.uid() IN (
    SELECT id FROM users WHERE user_type = 'admin'
  ));

-- Politique pour les propriétaires (exhibitors, partners, or VIP visitors)
CREATE POLICY "Users can manage their own slots"
  ON time_slots FOR ALL
  USING (
    -- Propriétaire exhibitor
    exhibitor_id IN (
      SELECT id FROM exhibitors
      WHERE user_id = auth.uid()
    )
    -- Propriétaire user_id (partner ou VIP visitor)
    OR user_id = auth.uid()
    -- Admin
    OR EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND user_type = 'admin'
    )
  )
  WITH CHECK (
    exhibitor_id IN (
      SELECT id FROM exhibitors
      WHERE user_id = auth.uid()
    )
    OR user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND user_type = 'admin'
    )
  );

-- Politique pour admins
CREATE POLICY "Admins can manage all time slots"
  ON time_slots FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND user_type = 'admin'
    )
  );
