-- ============================================================
-- MODULE 3 : Location de Matériel
-- Admin gère le stock, exposants/sponsors louent et paient
-- ============================================================

-- Catalogue des articles à louer
CREATE TABLE IF NOT EXISTS public.rental_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  description     TEXT,
  category        TEXT NOT NULL CHECK (category IN ('mobilier', 'audiovisuel', 'decoration', 'structure', 'autre')),
  unit            TEXT NOT NULL DEFAULT 'unité', -- 'unité', 'jour', 'm²'
  price_per_day   DECIMAL(10,2) NOT NULL DEFAULT 0,
  currency        TEXT NOT NULL DEFAULT 'MAD',
  stock_total     INTEGER NOT NULL DEFAULT 0,
  stock_available INTEGER NOT NULL DEFAULT 0,
  image_url       TEXT,
  is_active       BOOLEAN DEFAULT TRUE,
  created_by      UUID REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Commandes de location
CREATE TABLE IF NOT EXISTS public.rental_orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id         UUID NOT NULL REFERENCES public.rental_items(id) ON DELETE RESTRICT,
  customer_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_type   TEXT NOT NULL CHECK (customer_type IN ('exhibitor', 'partner')),
  exhibitor_id    UUID REFERENCES public.exhibitors(id) ON DELETE CASCADE,
  partner_id      UUID REFERENCES public.partners(id)  ON DELETE CASCADE,

  quantity        INTEGER NOT NULL DEFAULT 1,
  rental_start    DATE NOT NULL,
  rental_end      DATE NOT NULL,
  total_days      INTEGER GENERATED ALWAYS AS (rental_end - rental_start + 1) STORED,
  unit_price      DECIMAL(10,2) NOT NULL,
  total_amount    DECIMAL(10,2) NOT NULL,
  currency        TEXT NOT NULL DEFAULT 'MAD',

  -- Paiement
  payment_method  TEXT CHECK (payment_method IN ('cmi', 'paypal', 'bank_transfer', 'on_site')),
  payment_status  TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_ref     TEXT,
  paid_at         TIMESTAMPTZ,

  -- Statut commande
  status          TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'delivered', 'returned')),
  confirmation_sent BOOLEAN DEFAULT FALSE,
  notes           TEXT,

  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_rental_items_category   ON public.rental_items(category);
CREATE INDEX IF NOT EXISTS idx_rental_items_active     ON public.rental_items(is_active);
CREATE INDEX IF NOT EXISTS idx_rental_orders_customer  ON public.rental_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_rental_orders_item      ON public.rental_orders(item_id);
CREATE INDEX IF NOT EXISTS idx_rental_orders_status    ON public.rental_orders(status);

-- RLS
ALTER TABLE public.rental_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rental_orders ENABLE ROW LEVEL SECURITY;

-- Articles : lecture publique pour les connectés, écriture admin seule
DROP POLICY IF EXISTS "read_active_rental_items" ON public.rental_items;
CREATE POLICY "read_active_rental_items" ON public.rental_items
  FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS "admin_manage_rental_items" ON public.rental_items;
CREATE POLICY "admin_manage_rental_items" ON public.rental_items
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND type = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND type = 'admin'));

-- Commandes
DROP POLICY IF EXISTS "customer_own_orders" ON public.rental_orders;
CREATE POLICY "customer_own_orders" ON public.rental_orders
  USING (customer_id = auth.uid())
  WITH CHECK (customer_id = auth.uid());

DROP POLICY IF EXISTS "admin_all_orders" ON public.rental_orders;
CREATE POLICY "admin_all_orders" ON public.rental_orders
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND type = 'admin'));

-- Trigger stock décrémentation automatique
CREATE OR REPLACE FUNCTION decrement_rental_stock()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'confirmed' AND OLD.status = 'pending' THEN
    UPDATE public.rental_items
    SET stock_available = stock_available - NEW.quantity
    WHERE id = NEW.item_id AND stock_available >= NEW.quantity;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Stock insuffisant pour cet article';
    END IF;
  END IF;
  IF NEW.status IN ('cancelled', 'returned') AND OLD.status = 'confirmed' THEN
    UPDATE public.rental_items
    SET stock_available = stock_available + NEW.quantity
    WHERE id = NEW.item_id;
  END IF;
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_rental_stock ON public.rental_orders;
CREATE TRIGGER trg_rental_stock
  BEFORE UPDATE ON public.rental_orders
  FOR EACH ROW EXECUTE FUNCTION decrement_rental_stock();

-- Trigger updated_at rental_items
CREATE OR REPLACE FUNCTION update_rental_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_rental_items_updated_at ON public.rental_items;
CREATE TRIGGER trg_rental_items_updated_at
  BEFORE UPDATE ON public.rental_items
  FOR EACH ROW EXECUTE FUNCTION update_rental_items_updated_at();

-- Données de démonstration (articles types)
INSERT INTO public.rental_items (name, description, category, unit, price_per_day, currency, stock_total, stock_available) VALUES
  ('Table rectangulaire 180cm', 'Table en bois stratifié, capacité 8 personnes', 'mobilier', 'unité', 150, 'MAD', 50, 50),
  ('Chaise pliante', 'Chaise pliante standard, assise rembourrée', 'mobilier', 'unité', 30, 'MAD', 200, 200),
  ('Écran TV 55"', 'Écran plat Samsung 4K, pied inclus', 'audiovisuel', 'unité', 500, 'MAD', 20, 20),
  ('Écran TV 75"', 'Écran plat grand format avec pied télescopique', 'audiovisuel', 'unité', 800, 'MAD', 10, 10),
  ('Chapiteau 3x3m', 'Chapiteau aluminium avec bâches latérales', 'structure', 'unité', 1200, 'MAD', 15, 15),
  ('Comptoir d''accueil', 'Comptoir modulaire blanc avec étagère', 'mobilier', 'unité', 350, 'MAD', 25, 25),
  ('Éclairage LED spot', 'Spot orientable LED 30W, pied inclus', 'decoration', 'unité', 120, 'MAD', 60, 60),
  ('Plante décorative', 'Composition végétale artificielle haute 1.5m', 'decoration', 'unité', 80, 'MAD', 40, 40),
  ('Vidéoprojecteur', 'Projecteur Full HD 3200 lumens + écran 150"', 'audiovisuel', 'unité', 700, 'MAD', 8, 8),
  ('Réfrigérateur bar', 'Mini-bar 50L pour stands', 'autre', 'unité', 200, 'MAD', 12, 12)
ON CONFLICT DO NOTHING;
