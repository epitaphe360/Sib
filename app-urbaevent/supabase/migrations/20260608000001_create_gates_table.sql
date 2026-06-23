-- ============================================================
-- Table gates — portails d'accès physiques SIB 2026
-- ============================================================
CREATE TABLE IF NOT EXISTS gates (
  id         text PRIMARY KEY,
  name       text NOT NULL,
  zone       text NOT NULL DEFAULT 'public',
  location   text,
  active     boolean NOT NULL DEFAULT true,
  salon_id   uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gates_zone ON gates(zone);

-- FK vers salons (conditionnelle)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'salons'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'gates' AND constraint_name = 'fk_gates_salon_id'
  ) THEN
    ALTER TABLE gates
      ADD CONSTRAINT fk_gates_salon_id
      FOREIGN KEY (salon_id) REFERENCES salons(id) ON DELETE CASCADE;
  END IF;
END;
$$;

ALTER TABLE gates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lecture gates publique pour agents authentifiés" ON gates;
CREATE POLICY "gates_authenticated_read"
  ON gates FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Politique admin (conditionnelle)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'gates' AND policyname = 'gates_admin'
  ) THEN
    CREATE POLICY "gates_admin"
      ON gates FOR ALL
      USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND type = 'admin'));
  END IF;
END;
$$;

-- Données initiales
INSERT INTO gates (id, name, zone, location, active) VALUES
  ('gate_main',      'Entrée principale',   'public',          'Hall A — Accueil principal',      true),
  ('gate_north',     'Entrée Nord',         'public',          'Hall B — Façade nord',             true),
  ('gate_south',     'Entrée Sud',          'public',          'Hall C — Façade sud',              true),
  ('gate_vip',       'Entrée VIP',          'vip_lounge',      'Hall D — Salon VIP',               true),
  ('gate_exhibit',   'Accès exposants',     'exhibition_hall', 'Hall E — Zone exposition',         true),
  ('gate_backstage', 'Backstage',           'backstage',       'Accès réservé organisation/staff', true)
ON CONFLICT (id) DO UPDATE SET
  name       = EXCLUDED.name,
  zone       = EXCLUDED.zone,
  location   = EXCLUDED.location,
  active     = EXCLUDED.active,
  updated_at = now();
