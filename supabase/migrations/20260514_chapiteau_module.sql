-- ============================================================
-- MODULE 4 — Location de Chapiteaux
-- Migration: 20260514_chapiteau_module.sql
-- ============================================================

-- ───────────────────────────────────────────────────────────
-- Table: chapiteau_items (catalogue)
-- ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.chapiteau_items (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  description     text,
  size_label      text NOT NULL DEFAULT '',     -- ex: "3×3m", "5×5m", "10×10m"
  surface_m2      numeric(8,2),                 -- surface en m²
  price_per_day   numeric(10,2) NOT NULL DEFAULT 0,
  currency        text NOT NULL DEFAULT 'MAD',
  includes_installation boolean NOT NULL DEFAULT true,
  stock_total     int NOT NULL DEFAULT 1,
  stock_available int NOT NULL DEFAULT 1,
  image_url       text,
  is_active       boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT chk_chapiteau_price   CHECK (price_per_day >= 0),
  CONSTRAINT chk_chapiteau_stock   CHECK (stock_available >= 0 AND stock_total >= 0)
);

-- ───────────────────────────────────────────────────────────
-- Table: chapiteau_orders (réservations)
-- ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.chapiteau_orders (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id          uuid NOT NULL REFERENCES public.chapiteau_items(id) ON DELETE RESTRICT,
  customer_id      uuid NOT NULL,               -- exposant.id ou partner.id
  customer_type    text NOT NULL DEFAULT 'exhibitor',
  customer_email   text,
  quantity         int NOT NULL DEFAULT 1,
  rental_start     date NOT NULL,
  rental_end       date NOT NULL,
  total_days       int GENERATED ALWAYS AS
                     ((rental_end - rental_start) + 1) STORED,
  unit_price       numeric(10,2) NOT NULL DEFAULT 0,
  total_amount     numeric(10,2) NOT NULL DEFAULT 0,
  currency         text NOT NULL DEFAULT 'MAD',
  payment_method   text,
  payment_status   text NOT NULL DEFAULT 'pending',
  payment_ref      text,
  paid_at          timestamptz,
  status           text NOT NULL DEFAULT 'pending',
  notes            text,
  invoice_number   text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT chk_chap_order_dates   CHECK (rental_end >= rental_start),
  CONSTRAINT chk_chap_order_qty     CHECK (quantity >= 1),
  CONSTRAINT chk_chap_cust_type     CHECK (customer_type IN ('exhibitor','partner')),
  CONSTRAINT chk_chap_pay_status    CHECK (payment_status IN ('pending','paid','failed','refunded')),
  CONSTRAINT chk_chap_status        CHECK (status IN ('pending','confirmed','delivered','returned','cancelled'))
);

-- ───────────────────────────────────────────────────────────
-- Trigger: updated_at automatique
-- ───────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_chapiteau_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_chapiteau_items_updated_at
  BEFORE UPDATE ON public.chapiteau_items
  FOR EACH ROW EXECUTE FUNCTION update_chapiteau_updated_at();

CREATE TRIGGER trg_chapiteau_orders_updated_at
  BEFORE UPDATE ON public.chapiteau_orders
  FOR EACH ROW EXECUTE FUNCTION update_chapiteau_updated_at();

-- ───────────────────────────────────────────────────────────
-- Trigger: gestion du stock sur commande
-- ───────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION trg_chapiteau_stock()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  -- Décrémenter stock quand commande confirmée
  IF TG_OP = 'UPDATE' AND NEW.status = 'confirmed' AND OLD.status <> 'confirmed' THEN
    UPDATE public.chapiteau_items
    SET stock_available = stock_available - NEW.quantity
    WHERE id = NEW.item_id;
  END IF;

  -- Restaurer stock quand annulée ou retournée
  IF TG_OP = 'UPDATE'
     AND NEW.status IN ('cancelled','returned')
     AND OLD.status NOT IN ('cancelled','returned') THEN
    UPDATE public.chapiteau_items
    SET stock_available = LEAST(stock_total, stock_available + NEW.quantity)
    WHERE id = NEW.item_id;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_chapiteau_order_stock
  AFTER UPDATE ON public.chapiteau_orders
  FOR EACH ROW EXECUTE FUNCTION trg_chapiteau_stock();

-- ───────────────────────────────────────────────────────────
-- RLS
-- ───────────────────────────────────────────────────────────
ALTER TABLE public.chapiteau_items  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapiteau_orders ENABLE ROW LEVEL SECURITY;

-- chapiteau_items : lecture publique des articles actifs, écriture admin
CREATE POLICY "chapiteau_items_select_active"
  ON public.chapiteau_items FOR SELECT
  USING (is_active = true);

CREATE POLICY "chapiteau_items_admin_all"
  ON public.chapiteau_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- chapiteau_orders : lecture par le propriétaire ou admin
CREATE POLICY "chapiteau_orders_select_own"
  ON public.chapiteau_orders FOR SELECT
  USING (
    customer_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "chapiteau_orders_insert_auth"
  ON public.chapiteau_orders FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "chapiteau_orders_update_own_or_admin"
  ON public.chapiteau_orders FOR UPDATE
  USING (
    customer_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ───────────────────────────────────────────────────────────
-- Données de démonstration
-- ───────────────────────────────────────────────────────────
INSERT INTO public.chapiteau_items (name, description, size_label, surface_m2, price_per_day, currency, includes_installation, stock_total, stock_available, is_active) VALUES
  ('Chapiteau 3×3m',   'Chapiteau aluminium avec bâches latérales amovibles. Idéal pour petits stands ou points de vente. Structure robuste, montage rapide.',  '3×3m',   9,    1200, 'MAD', true, 15, 15, true),
  ('Chapiteau 5×5m',   'Chapiteau semi-professionnel, idéal pour les exposants individuels. Bâches imperméables, système de tension réglable.',                '5×5m',   25,   2500, 'MAD', true,  8,  8, true),
  ('Chapiteau 10×10m', 'Chapiteau professionnel grande surface. Parfait pour zones d''animation ou stands collectifs. Comprend l''installation et la dépose.', '10×10m', 100,  5000, 'MAD', true,  5,  5, true),
  ('Chapiteau 10×20m', 'Chapiteau de grande envergure pour événements VIP, conférences ou espaces de réception premium.',                                     '10×20m', 200,  9500, 'MAD', true,  3,  3, true),
  ('Chapiteau 20×40m', 'Chapiteau géant pour grands rassemblements, salons ou villages exposition. Éclairage intérieur inclus.',                              '20×40m', 800, 18000, 'MAD', true,  2,  2, true)
ON CONFLICT DO NOTHING;
