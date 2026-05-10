-- ============================================================================
-- MIGRATION: Module Facturation SIB 2026
-- Date: 2026-05-09
-- Description: Tables invoices et invoice_lines pour le module de facturation
--              Supporte les 3 profils: Visiteur VIP, Exposant, Partenaire
-- ============================================================================

BEGIN;

-- Séquence pour numéros de facture incrémentaux
CREATE SEQUENCE IF NOT EXISTS public.invoice_number_seq
  START WITH 1 INCREMENT BY 1 MINVALUE 1 NO MAXVALUE CACHE 1;

-- ============================================================================
-- TABLE: invoices
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.invoices (
  id                      uuid        PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Numéro facture unique auto-généré: SIB-2026-00001
  invoice_number          text        UNIQUE NOT NULL
                                      DEFAULT ('SIB-2026-' || LPAD(nextval('public.invoice_number_seq')::text, 5, '0')),

  -- Titulaire
  user_id                 uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  user_type               text        NOT NULL CHECK (user_type IN ('visitor', 'exhibitor', 'partner')),
  user_email              text        NOT NULL,
  user_name               text,

  -- Lien facultatif vers le paiement source
  payment_transaction_id  uuid        REFERENCES public.payment_transactions(id) ON DELETE SET NULL,
  payment_request_id      uuid        REFERENCES public.payment_requests(id) ON DELETE SET NULL,

  -- Statut
  status                  text        NOT NULL DEFAULT 'issued'
                                      CHECK (status IN ('issued', 'cancelled')),

  -- Montants
  amount_ht               numeric(10,2) NOT NULL,
  vat_rate                numeric(5,2)  NOT NULL DEFAULT 0.00,
  vat_amount              numeric(10,2) NOT NULL DEFAULT 0.00,
  amount_ttc              numeric(10,2) NOT NULL,
  currency                text          NOT NULL DEFAULT 'EUR',

  -- Méta
  notes                   text,
  issued_at               timestamptz DEFAULT now(),
  created_at              timestamptz DEFAULT now()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_invoices_user_id              ON public.invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_user_type            ON public.invoices(user_type);
CREATE INDEX IF NOT EXISTS idx_invoices_status               ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at           ON public.invoices(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_payment_transaction  ON public.invoices(payment_transaction_id);
CREATE INDEX IF NOT EXISTS idx_invoices_payment_request      ON public.invoices(payment_request_id);

-- ============================================================================
-- TABLE: invoice_lines
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.invoice_lines (
  id            uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id    uuid          NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  description   text          NOT NULL,
  quantity      numeric(10,2) NOT NULL DEFAULT 1,
  unit_price    numeric(10,2) NOT NULL,
  line_total    numeric(10,2) NOT NULL,
  sort_order    int           NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_invoice_lines_invoice_id ON public.invoice_lines(invoice_id);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE public.invoices     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_lines ENABLE ROW LEVEL SECURITY;

-- invoices: utilisateur voit ses propres factures
DROP POLICY IF EXISTS "Users can view own invoices" ON public.invoices;
CREATE POLICY "Users can view own invoices" ON public.invoices
  FOR SELECT USING (auth.uid() = user_id);

-- invoices: admins gèrent tout
DROP POLICY IF EXISTS "Admins can manage all invoices" ON public.invoices;
CREATE POLICY "Admins can manage all invoices" ON public.invoices
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

-- invoice_lines: utilisateur voit ses propres lignes (via invoice)
DROP POLICY IF EXISTS "Users can view own invoice lines" ON public.invoice_lines;
CREATE POLICY "Users can view own invoice lines" ON public.invoice_lines
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.invoices i
      WHERE i.id = invoice_lines.invoice_id AND i.user_id = auth.uid()
    )
  );

-- invoice_lines: admins gèrent tout
DROP POLICY IF EXISTS "Admins can manage all invoice lines" ON public.invoice_lines;
CREATE POLICY "Admins can manage all invoice lines" ON public.invoice_lines
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

COMMIT;
