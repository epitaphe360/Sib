-- Script SQL pour créer les tables et insérer les créneaux pour partenaires et VIP visitors
-- À exécuter dans Supabase SQL Editor

-- ============================================
-- 1. Créer la table pour VIP visitors (si pas existe)
-- ============================================

CREATE TABLE IF NOT EXISTS visitor_vip_time_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  slot_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration INTEGER DEFAULT 60,
  type TEXT DEFAULT 'hybrid',
  max_bookings INTEGER DEFAULT 2,
  current_bookings INTEGER DEFAULT 0,
  available BOOLEAN DEFAULT true,
  location TEXT DEFAULT 'Stand/Visio',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_visitor_vip_slots_user_id ON visitor_vip_time_slots(user_id);
CREATE INDEX IF NOT EXISTS idx_visitor_vip_slots_date ON visitor_vip_time_slots(slot_date);
CREATE INDEX IF NOT EXISTS idx_visitor_vip_slots_available ON visitor_vip_time_slots(available);

-- RLS policies
ALTER TABLE visitor_vip_time_slots ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs authentifiés peuvent voir les créneaux disponibles
CREATE POLICY IF NOT EXISTS "Anyone can view available VIP visitor slots"
  ON visitor_vip_time_slots FOR SELECT
  USING (available = true);

-- Les visiteurs VIP peuvent voir et gérer leurs propres créneaux
CREATE POLICY IF NOT EXISTS "VIP visitors can manage their own slots"
  ON visitor_vip_time_slots FOR ALL
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND user_type = 'admin'
    )
  );

-- ============================================
-- 2. Insérer les créneaux pour les partenaires
-- ============================================

-- Insérer les créneaux pour partenaires (3 jours x 3 créneaux = 9 par partenaire)
INSERT INTO partner_time_slots (id, partner_id, slot_date, start_time, end_time, duration, type, max_bookings, current_bookings, available, location)
SELECT
  gen_random_uuid(),
  p.id,
  d.day::date,
  t.start_time::time,
  t.end_time::time,
  90,
  'virtual',
  2,
  0,
  true,
  'Visioconference'
FROM
  partners p
CROSS JOIN (
  SELECT '2026-04-01' AS day
  UNION ALL SELECT '2026-04-02'
  UNION ALL SELECT '2026-04-03'
) d
CROSS JOIN (
  SELECT '09:00:00' AS start_time, '10:30:00' AS end_time
  UNION ALL SELECT '11:00:00', '12:30:00'
  UNION ALL SELECT '14:00:00', '15:30:00'
) t
WHERE NOT EXISTS (
  SELECT 1 FROM partner_time_slots
  WHERE partner_id = p.id
  AND slot_date = d.day::date
  AND start_time = t.start_time::time
)
ON CONFLICT DO NOTHING;

-- ============================================
-- 3. Insérer les créneaux pour les VIP visitors
-- ============================================

-- Insérer les créneaux pour VIP visitors (3 jours x 3 créneaux = 9 par visiteur)
INSERT INTO visitor_vip_time_slots (id, user_id, slot_date, start_time, end_time, duration, type, max_bookings, current_bookings, available, location)
SELECT
  gen_random_uuid(),
  u.id,
  d.day::date,
  t.start_time::time,
  t.end_time::time,
  90,
  'hybrid',
  2,
  0,
  true,
  'Stand/Visio'
FROM
  users u
CROSS JOIN (
  SELECT '2026-04-01' AS day
  UNION ALL SELECT '2026-04-02'
  UNION ALL SELECT '2026-04-03'
) d
CROSS JOIN (
  SELECT '09:00:00' AS start_time, '10:30:00' AS end_time
  UNION ALL SELECT '11:00:00', '12:30:00'
  UNION ALL SELECT '14:00:00', '15:30:00'
) t
WHERE u.visitor_level = 'vip'
AND NOT EXISTS (
  SELECT 1 FROM visitor_vip_time_slots
  WHERE user_id = u.id
  AND slot_date = d.day::date
  AND start_time = t.start_time::time
)
ON CONFLICT DO NOTHING;

-- ============================================
-- 4. Vérifier le résultat
-- ============================================

SELECT 
  'Exhibitors (time_slots)' AS type,
  COUNT(*) AS count
FROM time_slots
UNION ALL
SELECT 
  'Partners (partner_time_slots)',
  COUNT(*)
FROM partner_time_slots
UNION ALL
SELECT 
  'VIP Visitors (visitor_vip_time_slots)',
  COUNT(*)
FROM visitor_vip_time_slots;
