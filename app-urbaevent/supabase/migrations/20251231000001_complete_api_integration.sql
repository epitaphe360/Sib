-- ============================================================================
-- MIGRATION: Complete API Integration
-- Date: 2025-12-31
-- Description: Création de toutes les tables et fonctions manquantes pour
--              une intégration complète de l'API
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. TABLE: payment_transactions
-- Description: Historique complet des transactions de paiement
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,

  -- Stripe fields
  stripe_session_id text,
  stripe_payment_intent text,
  stripe_customer_id text,

  -- PayPal fields
  paypal_order_id text,
  paypal_capture_id text,

  -- CMI fields
  cmi_order_id text,
  cmi_transaction_id text,
  cmi_auth_code text,

  -- Common fields
  amount bigint NOT NULL, -- montant en centimes
  currency text NOT NULL DEFAULT 'eur',
  visitor_level text NOT NULL,
  payment_method text NOT NULL CHECK (payment_method IN ('stripe', 'paypal', 'cmi', 'bank_transfer')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded', 'cancelled')),

  -- Metadata
  error_message text,
  metadata jsonb DEFAULT '{}'::jsonb,

  -- Refund info
  refunded_at timestamptz,
  refund_amount bigint,
  refund_reason text,

  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON public.payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON public.payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_payment_method ON public.payment_transactions(payment_method);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_created_at ON public.payment_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_stripe_session ON public.payment_transactions(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_paypal_order ON public.payment_transactions(paypal_order_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_cmi_order ON public.payment_transactions(cmi_order_id);

-- RLS
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own transactions" ON public.payment_transactions;
CREATE POLICY "Users can view own transactions" ON public.payment_transactions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all transactions" ON public.payment_transactions;
CREATE POLICY "Admins can view all transactions" ON public.payment_transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND (users.type = 'admin' OR users.role = 'admin')
    )
  );

DROP POLICY IF EXISTS "System can insert transactions" ON public.payment_transactions;
CREATE POLICY "System can insert transactions" ON public.payment_transactions
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "System can update transactions" ON public.payment_transactions;
CREATE POLICY "System can update transactions" ON public.payment_transactions
  FOR UPDATE USING (true);

-- ============================================================================
-- 2. TABLE: audit_logs
-- Description: Logs d'audit pour la conformité et la sécurité
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  actor_id uuid REFERENCES public.users(id) ON DELETE SET NULL, -- Qui a fait l'action (admin, etc.)

  -- Action details
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,

  -- Change tracking
  old_values jsonb,
  new_values jsonb,
  changes jsonb, -- Diff between old and new

  -- Context
  ip_address inet,
  user_agent text,
  request_id text,
  session_id text,

  -- Severity
  severity text DEFAULT 'info' CHECK (severity IN ('debug', 'info', 'warning', 'error', 'critical')),

  -- Metadata
  metadata jsonb DEFAULT '{}'::jsonb,

  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON public.audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON public.audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_id ON public.audit_logs(entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_severity ON public.audit_logs(severity);

-- RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own audit logs" ON public.audit_logs;
CREATE POLICY "Users can view own audit logs" ON public.audit_logs
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all audit logs" ON public.audit_logs;
CREATE POLICY "Admins can view all audit logs" ON public.audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND (users.type = 'admin' OR users.role = 'admin')
    )
  );

DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;
CREATE POLICY "System can insert audit logs" ON public.audit_logs
  FOR INSERT WITH CHECK (true);

-- ============================================================================
-- 3. TABLE: two_factor_auth
-- Description: Configuration 2FA pour chaque utilisateur
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.two_factor_auth (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,

  -- TOTP
  totp_secret text,
  totp_enabled boolean DEFAULT false,
  totp_verified_at timestamptz,

  -- SMS
  sms_phone text,
  sms_enabled boolean DEFAULT false,
  sms_verified_at timestamptz,

  -- Email
  email_enabled boolean DEFAULT false,
  email_verified_at timestamptz,

  -- Backup codes
  backup_codes text[], -- Array of hashed backup codes
  backup_codes_generated_at timestamptz,

  -- Recovery
  recovery_email text,
  recovery_phone text,

  -- Metadata
  last_used_at timestamptz,
  failed_attempts integer DEFAULT 0,
  locked_until timestamptz,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_two_factor_auth_user_id ON public.two_factor_auth(user_id);

-- RLS
ALTER TABLE public.two_factor_auth ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own 2FA" ON public.two_factor_auth;
CREATE POLICY "Users can view own 2FA" ON public.two_factor_auth
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own 2FA" ON public.two_factor_auth;
CREATE POLICY "Users can manage own 2FA" ON public.two_factor_auth
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- 4. TABLE: push_subscriptions
-- Description: Abonnements pour les notifications push (Web Push API)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,

  -- Push subscription details (Web Push API format)
  endpoint text NOT NULL,
  keys jsonb NOT NULL, -- {p256dh: string, auth: string}

  -- Device info
  device_type text DEFAULT 'web' CHECK (device_type IN ('web', 'ios', 'android')),
  device_name text,
  browser text,
  os text,

  -- Status
  is_active boolean DEFAULT true,
  last_used_at timestamptz DEFAULT now(),

  created_at timestamptz DEFAULT now(),

  UNIQUE(user_id, endpoint)
);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON public.push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_is_active ON public.push_subscriptions(is_active);

-- RLS
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.push_subscriptions;
CREATE POLICY "Users can view own subscriptions" ON public.push_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own subscriptions" ON public.push_subscriptions;
CREATE POLICY "Users can manage own subscriptions" ON public.push_subscriptions
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- 5. TABLE: notification_preferences
-- Description: Préférences de notifications par utilisateur
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,

  -- Email notifications
  email_notifications_enabled boolean DEFAULT true,
  email_digest_frequency text DEFAULT 'daily' CHECK (email_digest_frequency IN ('realtime', 'daily', 'weekly', 'never')),

  -- Push notifications
  push_notifications_enabled boolean DEFAULT true,

  -- SMS notifications
  sms_notifications_enabled boolean DEFAULT false,

  -- Notification types
  notify_appointments boolean DEFAULT true,
  notify_messages boolean DEFAULT true,
  notify_events boolean DEFAULT true,
  notify_networking boolean DEFAULT true,
  notify_promotions boolean DEFAULT false,
  notify_system boolean DEFAULT true,

  -- Quiet hours
  quiet_hours_enabled boolean DEFAULT false,
  quiet_hours_start time,
  quiet_hours_end time,
  quiet_hours_timezone text DEFAULT 'UTC',

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON public.notification_preferences(user_id);

-- RLS
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own preferences" ON public.notification_preferences;
CREATE POLICY "Users can view own preferences" ON public.notification_preferences
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own preferences" ON public.notification_preferences;
CREATE POLICY "Users can manage own preferences" ON public.notification_preferences
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- 6. TABLE: search_index
-- Description: Index de recherche full-text pour tous les contenus
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.search_index (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Entity reference
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,

  -- Search fields
  title text NOT NULL,
  content text,
  keywords text[],

  -- Full-text search
  search_vector tsvector,

  -- Metadata
  metadata jsonb DEFAULT '{}'::jsonb,

  -- Boost/Ranking
  boost_score numeric(5,2) DEFAULT 1.0,

  -- Status
  is_active boolean DEFAULT true,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  UNIQUE(entity_type, entity_id)
);

CREATE INDEX IF NOT EXISTS idx_search_index_entity ON public.search_index(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_search_index_vector ON public.search_index USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_search_index_keywords ON public.search_index USING GIN(keywords);
CREATE INDEX IF NOT EXISTS idx_search_index_is_active ON public.search_index(is_active);

-- RLS
ALTER TABLE public.search_index ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can search" ON public.search_index;
CREATE POLICY "Anyone can search" ON public.search_index
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "System can manage search index" ON public.search_index;
CREATE POLICY "System can manage search index" ON public.search_index
  FOR ALL USING (true);

-- ============================================================================
-- 7. TABLE: api_keys
-- Description: Clés API pour l'accès programmatique
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,

  -- API Key
  key_hash text NOT NULL UNIQUE, -- Hash de la clé API
  key_prefix text NOT NULL, -- Préfixe visible (ex: "sk_live_abc...")

  -- Permissions
  name text NOT NULL,
  scopes text[] DEFAULT '{}', -- Ex: ['read:events', 'write:appointments']

  -- Rate limiting
  rate_limit_per_minute integer DEFAULT 60,
  rate_limit_per_hour integer DEFAULT 1000,

  -- Status
  is_active boolean DEFAULT true,
  expires_at timestamptz,
  last_used_at timestamptz,

  -- Usage stats
  total_requests bigint DEFAULT 0,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON public.api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON public.api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_is_active ON public.api_keys(is_active);

-- RLS
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own API keys" ON public.api_keys;
CREATE POLICY "Users can view own API keys" ON public.api_keys
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own API keys" ON public.api_keys;
CREATE POLICY "Users can manage own API keys" ON public.api_keys
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- 8. TABLE: rate_limits
-- Description: Suivi du rate limiting par utilisateur/IP
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identifier
  identifier text NOT NULL, -- user_id, api_key, ou IP address
  identifier_type text NOT NULL CHECK (identifier_type IN ('user', 'api_key', 'ip')),

  -- Endpoint/Resource
  resource text NOT NULL, -- Ex: "POST /api/appointments"

  -- Counts
  requests_count integer DEFAULT 0,
  window_start timestamptz DEFAULT now(),
  window_duration interval DEFAULT '1 minute',

  -- Limits
  max_requests integer DEFAULT 60,

  -- Status
  is_blocked boolean DEFAULT false,
  blocked_until timestamptz,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  UNIQUE(identifier, resource, window_start)
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier ON public.rate_limits(identifier, identifier_type);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window_start ON public.rate_limits(window_start);
CREATE INDEX IF NOT EXISTS idx_rate_limits_is_blocked ON public.rate_limits(is_blocked);

-- RLS
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "System can manage rate limits" ON public.rate_limits;
CREATE POLICY "System can manage rate limits" ON public.rate_limits
  FOR ALL USING (true);

-- ============================================================================
-- 9. TABLE: feature_flags
-- Description: Feature flags pour activer/désactiver des fonctionnalités
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.feature_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Flag details
  key text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,

  -- Status
  is_enabled boolean DEFAULT false,

  -- Rollout
  rollout_percentage integer DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
  enabled_for_users uuid[], -- Liste d'utilisateurs spécifiques
  enabled_for_roles text[], -- Liste de rôles

  -- Metadata
  metadata jsonb DEFAULT '{}'::jsonb,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_feature_flags_key ON public.feature_flags(key);
CREATE INDEX IF NOT EXISTS idx_feature_flags_is_enabled ON public.feature_flags(is_enabled);

-- RLS
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read feature flags" ON public.feature_flags;
CREATE POLICY "Anyone can read feature flags" ON public.feature_flags
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage feature flags" ON public.feature_flags;
CREATE POLICY "Admins can manage feature flags" ON public.feature_flags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND (users.type = 'admin' OR users.role = 'admin')
    )
  );

-- ============================================================================
-- 10. FUNCTIONS
-- ============================================================================

-- Fonction pour mettre à jour le search_vector automatiquement
CREATE OR REPLACE FUNCTION update_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('french', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('french', coalesce(NEW.content, '')), 'B') ||
    setweight(to_tsvector('french', coalesce(array_to_string(NEW.keywords, ' '), '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_search_index_vector ON public.search_index;
CREATE TRIGGER update_search_index_vector
  BEFORE INSERT OR UPDATE ON public.search_index
  FOR EACH ROW
  EXECUTE FUNCTION update_search_vector();

-- Fonction de recherche full-text
CREATE OR REPLACE FUNCTION search_content(
  search_query text,
  entity_types text[] DEFAULT NULL,
  limit_results integer DEFAULT 20
)
RETURNS TABLE (
  id uuid,
  entity_type text,
  entity_id uuid,
  title text,
  content text,
  rank real
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    si.id,
    si.entity_type,
    si.entity_id,
    si.title,
    si.content,
    ts_rank(si.search_vector, websearch_to_tsquery('french', search_query)) AS rank
  FROM public.search_index si
  WHERE si.is_active = true
    AND (entity_types IS NULL OR si.entity_type = ANY(entity_types))
    AND si.search_vector @@ websearch_to_tsquery('french', search_query)
  ORDER BY rank DESC, si.boost_score DESC
  LIMIT limit_results;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour logger les actions d'audit
CREATE OR REPLACE FUNCTION log_audit(
  p_user_id uuid,
  p_actor_id uuid,
  p_action text,
  p_entity_type text,
  p_entity_id uuid,
  p_old_values jsonb DEFAULT NULL,
  p_new_values jsonb DEFAULT NULL,
  p_ip_address inet DEFAULT NULL,
  p_user_agent text DEFAULT NULL,
  p_severity text DEFAULT 'info'
)
RETURNS uuid AS $$
DECLARE
  v_log_id uuid;
  v_changes jsonb;
BEGIN
  -- Calculate diff between old and new values
  IF p_old_values IS NOT NULL AND p_new_values IS NOT NULL THEN
    SELECT jsonb_object_agg(key, value)
    INTO v_changes
    FROM jsonb_each(p_new_values)
    WHERE value IS DISTINCT FROM p_old_values->key;
  END IF;

  INSERT INTO public.audit_logs (
    user_id,
    actor_id,
    action,
    entity_type,
    entity_id,
    old_values,
    new_values,
    changes,
    ip_address,
    user_agent,
    severity
  ) VALUES (
    p_user_id,
    p_actor_id,
    p_action,
    p_entity_type,
    p_entity_id,
    p_old_values,
    p_new_values,
    v_changes,
    p_ip_address,
    p_user_agent,
    p_severity
  )
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour incrémenter le compteur de rate limit
CREATE OR REPLACE FUNCTION increment_rate_limit(
  p_identifier text,
  p_identifier_type text,
  p_resource text,
  p_max_requests integer DEFAULT 60,
  p_window_duration interval DEFAULT '1 minute'
)
RETURNS boolean AS $$
DECLARE
  v_current_count integer;
  v_is_blocked boolean;
BEGIN
  -- Clean old windows
  DELETE FROM public.rate_limits
  WHERE identifier = p_identifier
    AND resource = p_resource
    AND window_start < now() - window_duration;

  -- Get or create rate limit record
  INSERT INTO public.rate_limits (
    identifier,
    identifier_type,
    resource,
    requests_count,
    window_start,
    window_duration,
    max_requests
  ) VALUES (
    p_identifier,
    p_identifier_type,
    p_resource,
    1,
    now(),
    p_window_duration,
    p_max_requests
  )
  ON CONFLICT (identifier, resource, window_start)
  DO UPDATE SET
    requests_count = rate_limits.requests_count + 1,
    updated_at = now()
  RETURNING requests_count, is_blocked
  INTO v_current_count, v_is_blocked;

  -- Check if limit exceeded
  IF v_current_count > p_max_requests THEN
    UPDATE public.rate_limits
    SET is_blocked = true,
        blocked_until = now() + p_window_duration
    WHERE identifier = p_identifier
      AND resource = p_resource
      AND window_start = (
        SELECT window_start FROM public.rate_limits
        WHERE identifier = p_identifier AND resource = p_resource
        ORDER BY window_start DESC
        LIMIT 1
      );
    RETURN false;
  END IF;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour vérifier si un feature flag est activé
CREATE OR REPLACE FUNCTION is_feature_enabled(
  p_flag_key text,
  p_user_id uuid DEFAULT NULL
)
RETURNS boolean AS $$
DECLARE
  v_flag record;
  v_user_role text;
BEGIN
  SELECT * INTO v_flag
  FROM public.feature_flags
  WHERE key = p_flag_key;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Check if globally enabled
  IF v_flag.is_enabled = true AND v_flag.rollout_percentage = 100 THEN
    RETURN true;
  END IF;

  -- Check if user-specific
  IF p_user_id IS NOT NULL THEN
    IF p_user_id = ANY(v_flag.enabled_for_users) THEN
      RETURN true;
    END IF;

    -- Check role-based
    SELECT type INTO v_user_role
    FROM public.users
    WHERE id = p_user_id;

    IF v_user_role = ANY(v_flag.enabled_for_roles) THEN
      RETURN true;
    END IF;

    -- Check rollout percentage (deterministic based on user ID)
    IF v_flag.rollout_percentage > 0 THEN
      IF (hashtext(p_user_id::text) % 100) < v_flag.rollout_percentage THEN
        RETURN true;
      END IF;
    END IF;
  END IF;

  RETURN false;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 11. TRIGGERS
-- ============================================================================

-- Trigger pour mettre à jour updated_at sur les tables
CREATE OR REPLACE FUNCTION update_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_payment_transactions_timestamp ON public.payment_transactions;
CREATE TRIGGER update_payment_transactions_timestamp
  BEFORE UPDATE ON public.payment_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_timestamp();

DROP TRIGGER IF EXISTS update_two_factor_auth_timestamp ON public.two_factor_auth;
CREATE TRIGGER update_two_factor_auth_timestamp
  BEFORE UPDATE ON public.two_factor_auth
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_timestamp();

DROP TRIGGER IF EXISTS update_notification_preferences_timestamp ON public.notification_preferences;
CREATE TRIGGER update_notification_preferences_timestamp
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_timestamp();

DROP TRIGGER IF EXISTS update_search_index_timestamp ON public.search_index;
CREATE TRIGGER update_search_index_timestamp
  BEFORE UPDATE ON public.search_index
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_timestamp();

DROP TRIGGER IF EXISTS update_api_keys_timestamp ON public.api_keys;
CREATE TRIGGER update_api_keys_timestamp
  BEFORE UPDATE ON public.api_keys
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_timestamp();

DROP TRIGGER IF EXISTS update_feature_flags_timestamp ON public.feature_flags;
CREATE TRIGGER update_feature_flags_timestamp
  BEFORE UPDATE ON public.feature_flags
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_timestamp();

-- ============================================================================
-- 12. SEED DEFAULT DATA
-- ============================================================================

-- Insert default feature flags
INSERT INTO public.feature_flags (key, name, description, is_enabled, rollout_percentage)
VALUES
  ('networking_ai', 'AI-Powered Networking', 'Recommandations de networking basées sur l''IA', true, 100),
  ('advanced_analytics', 'Advanced Analytics', 'Analytics avancées pour les exposants', true, 100),
  ('live_streaming', 'Live Streaming', 'Streaming en direct des événements', true, 100),
  ('mobile_app', 'Mobile App', 'Application mobile native', false, 0),
  ('payment_installments', 'Payment Installments', 'Paiement en plusieurs fois', false, 50)
ON CONFLICT (key) DO NOTHING;

COMMIT;

-- ============================================================================
-- NOTES D'UTILISATION
-- ============================================================================

-- Recherche full-text:
-- SELECT * FROM search_content('innovation maritime', ARRAY['exhibitor', 'event']);

-- Log audit:
-- SELECT log_audit(
--   '<user_id>', '<actor_id>', 'update', 'user', '<entity_id>',
--   '{"email": "old@example.com"}'::jsonb,
--   '{"email": "new@example.com"}'::jsonb,
--   '192.168.1.1'::inet,
--   'Mozilla/5.0...',
--   'info'
-- );

-- Check rate limit:
-- SELECT increment_rate_limit('<user_id>', 'user', 'POST /api/appointments', 60, '1 minute');

-- Check feature flag:
-- SELECT is_feature_enabled('networking_ai', '<user_id>');
