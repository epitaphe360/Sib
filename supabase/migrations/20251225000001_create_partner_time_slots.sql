-- Table pour les créneaux de disponibilité des partenaires
CREATE TABLE IF NOT EXISTS partner_time_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  slot_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration INTEGER DEFAULT 60,
  type TEXT DEFAULT 'virtual',
  max_bookings INTEGER DEFAULT 1,
  current_bookings INTEGER DEFAULT 0,
  available BOOLEAN DEFAULT true,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_partner_time_slots_partner_id ON partner_time_slots(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_time_slots_date ON partner_time_slots(slot_date);
CREATE INDEX IF NOT EXISTS idx_partner_time_slots_available ON partner_time_slots(available);

-- RLS policies
ALTER TABLE partner_time_slots ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs authentifiés peuvent voir les créneaux disponibles
CREATE POLICY "Anyone can view available partner slots"
  ON partner_time_slots FOR SELECT
  USING (available = true);

-- Les partenaires peuvent gérer leurs propres créneaux
CREATE POLICY "Partners can manage their own slots"
  ON partner_time_slots FOR ALL
  USING (
    partner_id IN (
      SELECT id FROM partners 
      WHERE user_id = auth.uid()
    )
  );

-- Les admins peuvent tout gérer
CREATE POLICY "Admins can manage all partner slots"
  ON partner_time_slots FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND user_type = 'admin'
    )
  );
