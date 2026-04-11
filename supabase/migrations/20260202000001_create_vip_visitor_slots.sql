-- Table pour les créneaux de disponibilité des visiteurs VIP
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
CREATE POLICY "Anyone can view available VIP visitor slots"
  ON visitor_vip_time_slots FOR SELECT
  USING (available = true);

-- Les visiteurs VIP peuvent voir et gérer leurs propres créneaux
CREATE POLICY "VIP visitors can manage their own slots"
  ON visitor_vip_time_slots FOR ALL
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND user_type = 'admin'
    )
  );

-- Les admins peuvent tout gérer
CREATE POLICY "Admins can manage all VIP visitor slots"
  ON visitor_vip_time_slots FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND user_type = 'admin'
    )
  );
