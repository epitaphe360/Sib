-- ================================================================
-- MODULE 5 — Vente d'Espaces Publicitaires SIB 2026
-- ================================================================

-- ─── Table des types d'espaces publicitaires (catalogue admin) ──────────────
CREATE TABLE IF NOT EXISTS public.ad_space_types (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name              text NOT NULL,
  description       text NOT NULL DEFAULT '',
  category          text NOT NULL DEFAULT 'autre',
  -- catégories : banner-app | email | push | featured | physique | conference | autre
  audience          text NOT NULL DEFAULT '',  -- ex: "~2 000 visiteurs inscrits"
  price             numeric(10,2) NOT NULL DEFAULT 0,
  currency          text NOT NULL DEFAULT 'MAD',
  duration_days     int NOT NULL DEFAULT 5,    -- durée par défaut = durée du salon
  stock_total       int NOT NULL DEFAULT 10,
  stock_available   int NOT NULL DEFAULT 10,
  image_url         text,
  is_active         boolean NOT NULL DEFAULT true,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- ─── Table des réservations d'espaces publicitaires ─────────────────────────
CREATE TABLE IF NOT EXISTS public.ad_bookings (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id          uuid NOT NULL REFERENCES public.ad_space_types(id) ON DELETE RESTRICT,
  customer_id       uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  customer_type     text NOT NULL CHECK (customer_type IN ('exhibitor', 'partner')),
  -- Dénormalisation pour l'affichage admin (non sensible)
  customer_email    text,
  customer_name     text,
  -- Détails de la commande
  quantity          int NOT NULL DEFAULT 1,
  start_date        date,
  end_date          date,
  total_amount      numeric(10,2) NOT NULL DEFAULT 0,
  currency          text NOT NULL DEFAULT 'MAD',
  -- Paiement
  payment_method    text CHECK (payment_method IN ('paypal', 'cmi')),
  payment_status    text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_ref       text,
  invoice_number    text,
  paid_at           timestamptz,
  -- Workflow admin
  status            text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'active', 'rejected', 'expired', 'cancelled')),
  admin_notes       text,
  approved_at       timestamptz,
  activated_at      timestamptz,
  -- Snapshot de l'espace au moment de la réservation
  space_snapshot    jsonb,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- ─── Index ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS ad_bookings_customer_idx   ON public.ad_bookings (customer_id);
CREATE INDEX IF NOT EXISTS ad_bookings_space_idx      ON public.ad_bookings (space_id);
CREATE INDEX IF NOT EXISTS ad_bookings_status_idx     ON public.ad_bookings (status);
CREATE INDEX IF NOT EXISTS ad_space_types_active_idx  ON public.ad_space_types (is_active);

-- ─── RLS ─────────────────────────────────────────────────────────────────────
ALTER TABLE public.ad_space_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_bookings    ENABLE ROW LEVEL SECURITY;

-- ad_space_types : lecture publique des espaces actifs
CREATE POLICY "public_read_active_ad_spaces"
  ON public.ad_space_types FOR SELECT
  USING (is_active = true);

-- ad_space_types : admin peut tout faire
CREATE POLICY "admin_all_ad_space_types"
  ON public.ad_space_types FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND type = 'admin')
  );

-- ad_bookings : un utilisateur peut voir ses propres réservations
CREATE POLICY "own_bookings_select"
  ON public.ad_bookings FOR SELECT
  USING (customer_id = auth.uid());

-- ad_bookings : un utilisateur authentifié peut créer une réservation pour lui-même
CREATE POLICY "own_bookings_insert"
  ON public.ad_bookings FOR INSERT
  WITH CHECK (customer_id = auth.uid());

-- ad_bookings : admin peut tout faire
CREATE POLICY "admin_all_ad_bookings"
  ON public.ad_bookings FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND type = 'admin')
  );

-- ─── Trigger updated_at ─────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER ad_space_types_updated_at
  BEFORE UPDATE ON public.ad_space_types
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER ad_bookings_updated_at
  BEFORE UPDATE ON public.ad_bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ─── Seed — 6 espaces publicitaires par défaut ──────────────────────────────
INSERT INTO public.ad_space_types (name, description, category, audience, price, currency, duration_days, stock_total, stock_available, is_active)
VALUES
  (
    'Bannière Homepage',
    'Grande bannière visible par tous les visiteurs sur la page d''accueil de l''application SIB 2026. Position haute, fort taux de clics.',
    'banner-app',
    '~5 000 visiteurs / jour pendant le salon',
    3500.00, 'MAD', 5, 6, 6, true
  ),
  (
    'Encart Email Marketing',
    'Votre logo et message intégré dans l''email envoyé à tous les visiteurs inscrits. Envoi J-3 avant l''ouverture du salon.',
    'email',
    '~3 500 emails envoyés aux visiteurs inscrits',
    2500.00, 'MAD', 1, 8, 8, true
  ),
  (
    'Notification Push Visiteurs',
    'Message push envoyé à tous les visiteurs ayant activé les notifications. Visibilité immédiate sur mobile.',
    'push',
    '~1 800 utilisateurs mobile',
    1800.00, 'MAD', 1, 5, 5, true
  ),
  (
    'Mise en Avant Listing Exposants',
    'Votre fiche exposant apparaît en tête de liste avec badge "À la une". Boostez votre visibilité dans le répertoire.',
    'featured',
    'Tous les visiteurs parcourant le répertoire',
    1200.00, 'MAD', 5, 10, 10, true
  ),
  (
    'Espace Physique — Roll-up Entrée',
    'Emplacement roll-up ou kakémono (2×1m) positionné à l''entrée principale du salon. Fourniture non incluse.',
    'physique',
    'Tous les visiteurs entrant dans le salon',
    4000.00, 'MAD', 5, 4, 4, true
  ),
  (
    'Sponsoring Conférence',
    'Votre logo affiché sur l''écran principal lors d''une session conférence. Mention orale par le modérateur. 1 slot par session.',
    'conference',
    'Audience de la conférence sponsorisée',
    5000.00, 'MAD', 1, 8, 8, true
  )
ON CONFLICT DO NOTHING;
