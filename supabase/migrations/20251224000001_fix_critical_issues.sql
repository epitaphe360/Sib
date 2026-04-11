/*
  # Fix Critical Issues - Complete Migration

  1. Creates `connections` table for networking
  2. Updates `book_appointment_atomic` to return all required fields
  3. Creates `cancel_appointment_atomic` function
  4. Creates `user_favorites` table (compatible with existing code)
  5. Creates `daily_quotas` table for tracking user usage
  6. Adds seed data for demo exhibitors
*/

-- =====================================================
-- 1. CONNECTIONS TABLE (for networking)
-- =====================================================
-- Drop the existing table if it has incompatible structure
DROP TABLE IF EXISTS connections CASCADE;

CREATE TABLE connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  addressee_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'blocked')),
  message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(requester_id, addressee_id)
);

ALTER TABLE connections ENABLE ROW LEVEL SECURITY;

-- Users can view their own connections (sent or received)
DROP POLICY IF EXISTS "Users can view own connections" ON connections;
CREATE POLICY "Users can view own connections" ON connections
  FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- Users can create connections (send requests)
DROP POLICY IF EXISTS "Users can create connections" ON connections;
CREATE POLICY "Users can create connections" ON connections
  FOR INSERT WITH CHECK (auth.uid() = requester_id);

-- Users can update connections they are part of
DROP POLICY IF EXISTS "Users can update own connections" ON connections;
CREATE POLICY "Users can update own connections" ON connections
  FOR UPDATE USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- Users can delete their own connection requests
DROP POLICY IF EXISTS "Users can delete own connections" ON connections;
CREATE POLICY "Users can delete own connections" ON connections
  FOR DELETE USING (auth.uid() = requester_id);

CREATE INDEX IF NOT EXISTS idx_connections_requester_id ON connections(requester_id);
CREATE INDEX IF NOT EXISTS idx_connections_addressee_id ON connections(addressee_id);
CREATE INDEX IF NOT EXISTS idx_connections_status ON connections(status);

-- =====================================================
-- 2. USER_FAVORITES TABLE (compatible with existing code)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  entity_type text NOT NULL DEFAULT 'user' CHECK (entity_type IN ('user', 'exhibitor', 'partner', 'event', 'product')),
  entity_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, entity_type, entity_id)
);

ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own favorites" ON user_favorites;
CREATE POLICY "Users can view own favorites" ON user_favorites
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own favorites" ON user_favorites;
CREATE POLICY "Users can manage own favorites" ON user_favorites
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_entity ON user_favorites(entity_type, entity_id);

-- =====================================================
-- 3. DAILY_QUOTAS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS daily_quotas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  quota_date date NOT NULL DEFAULT CURRENT_DATE,
  connections_used integer DEFAULT 0,
  messages_used integer DEFAULT 0,
  meetings_used integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, quota_date)
);

ALTER TABLE daily_quotas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own quotas" ON daily_quotas;
CREATE POLICY "Users can view own quotas" ON daily_quotas
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own quotas" ON daily_quotas;
CREATE POLICY "Users can manage own quotas" ON daily_quotas
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_daily_quotas_user_date ON daily_quotas(user_id, quota_date);

-- =====================================================
-- 4. UPDATE book_appointment_atomic FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION book_appointment_atomic(
  p_time_slot_id UUID,
  p_visitor_id UUID,
  p_exhibitor_id UUID,
  p_notes TEXT DEFAULT NULL,
  p_meeting_type meeting_type DEFAULT 'in-person'
) RETURNS JSONB AS $$
DECLARE
  v_current_bookings INTEGER;
  v_max_bookings INTEGER;
  v_appointment_id UUID;
  v_new_current_bookings INTEGER;
  v_available BOOLEAN;
BEGIN
  -- Lock the time_slot row for update to prevent concurrent access
  SELECT current_bookings, max_bookings
  INTO v_current_bookings, v_max_bookings
  FROM time_slots
  WHERE id = p_time_slot_id
  FOR UPDATE;

  -- Check if time slot exists
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Créneau horaire introuvable'
    );
  END IF;

  -- Check availability
  IF v_current_bookings >= v_max_bookings THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Ce créneau est complet'
    );
  END IF;

  -- Check if visitor already has an appointment for this slot
  IF EXISTS (
    SELECT 1 FROM appointments
    WHERE time_slot_id = p_time_slot_id
    AND visitor_id = p_visitor_id
    AND status != 'cancelled'
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Vous avez déjà réservé ce créneau'
    );
  END IF;

  -- Insert appointment avec statut PENDING (demande visiteur)
  -- L'exposant/partenaire devra confirmer le RDV ensuite
  INSERT INTO appointments (
    time_slot_id,
    visitor_id,
    exhibitor_id,
    notes,
    status,
    meeting_type,
    created_at
  ) VALUES (
    p_time_slot_id,
    p_visitor_id,
    p_exhibitor_id,
    p_notes,
    'pending',  -- Statut initial: en attente de confirmation exposant/partenaire
    p_meeting_type,
    NOW()
  )
  RETURNING id INTO v_appointment_id;

  -- Calculate new values
  v_new_current_bookings := v_current_bookings + 1;
  v_available := v_new_current_bookings < v_max_bookings;

  -- Increment current_bookings and update availability
  UPDATE time_slots
  SET
    current_bookings = v_new_current_bookings,
    available = v_available,
    updated_at = NOW()
  WHERE id = p_time_slot_id;

  -- Return success with all required data
  RETURN jsonb_build_object(
    'success', true,
    'appointment_id', v_appointment_id,
    'current_bookings', v_new_current_bookings,
    'available', v_available
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 5. CREATE cancel_appointment_atomic FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION cancel_appointment_atomic(
  p_appointment_id UUID,
  p_user_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_appointment RECORD;
  v_new_current_bookings INTEGER;
BEGIN
  -- Get and lock the appointment
  SELECT a.*, ts.current_bookings, ts.max_bookings
  INTO v_appointment
  FROM appointments a
  LEFT JOIN time_slots ts ON ts.id = a.time_slot_id
  WHERE a.id = p_appointment_id
  FOR UPDATE;

  -- Check if appointment exists
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Rendez-vous introuvable'
    );
  END IF;

  -- Check if user is authorized (visitor or exhibitor)
  IF v_appointment.visitor_id != p_user_id AND v_appointment.exhibitor_id != p_user_id THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Non autorisé à annuler ce rendez-vous'
    );
  END IF;

  -- Check if already cancelled
  IF v_appointment.status = 'cancelled' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Ce rendez-vous est déjà annulé'
    );
  END IF;

  -- Update appointment status
  UPDATE appointments
  SET
    status = 'cancelled',
    updated_at = NOW()
  WHERE id = p_appointment_id;

  -- Decrement time slot bookings if applicable
  IF v_appointment.time_slot_id IS NOT NULL THEN
    v_new_current_bookings := GREATEST(0, COALESCE(v_appointment.current_bookings, 1) - 1);

    UPDATE time_slots
    SET
      current_bookings = v_new_current_bookings,
      available = true,
      updated_at = NOW()
    WHERE id = v_appointment.time_slot_id;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Rendez-vous annulé avec succès'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 6. GET DAILY QUOTAS FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION get_daily_quotas(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_quotas RECORD;
BEGIN
  -- Get or create today's quotas
  INSERT INTO daily_quotas (user_id, quota_date)
  VALUES (p_user_id, CURRENT_DATE)
  ON CONFLICT (user_id, quota_date) DO NOTHING;

  SELECT connections_used, messages_used, meetings_used
  INTO v_quotas
  FROM daily_quotas
  WHERE user_id = p_user_id AND quota_date = CURRENT_DATE;

  RETURN jsonb_build_object(
    'connections', COALESCE(v_quotas.connections_used, 0),
    'messages', COALESCE(v_quotas.messages_used, 0),
    'meetings', COALESCE(v_quotas.meetings_used, 0)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 7. INCREMENT QUOTA FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION increment_daily_quota(
  p_user_id UUID,
  p_quota_type TEXT
) RETURNS JSONB AS $$
DECLARE
  v_column_name TEXT;
BEGIN
  -- Validate quota type
  IF p_quota_type NOT IN ('connections', 'messages', 'meetings') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid quota type');
  END IF;

  v_column_name := p_quota_type || '_used';

  -- Insert or update quota
  INSERT INTO daily_quotas (user_id, quota_date)
  VALUES (p_user_id, CURRENT_DATE)
  ON CONFLICT (user_id, quota_date) DO NOTHING;

  -- Increment the appropriate column
  EXECUTE format(
    'UPDATE daily_quotas SET %I = %I + 1, updated_at = NOW() WHERE user_id = $1 AND quota_date = CURRENT_DATE',
    v_column_name, v_column_name
  ) USING p_user_id;

  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 8. ENSURE TIME_SLOTS HAS REQUIRED COLUMNS
-- =====================================================
DO $$
BEGIN
  -- Add current_bookings if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'time_slots' AND column_name = 'current_bookings') THEN
    ALTER TABLE time_slots ADD COLUMN current_bookings integer DEFAULT 0;
  END IF;

  -- Add max_bookings if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'time_slots' AND column_name = 'max_bookings') THEN
    ALTER TABLE time_slots ADD COLUMN max_bookings integer DEFAULT 1;
  END IF;

  -- Add available if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'time_slots' AND column_name = 'available') THEN
    ALTER TABLE time_slots ADD COLUMN available boolean DEFAULT true;
  END IF;

  -- Add updated_at if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'time_slots' AND column_name = 'updated_at') THEN
    ALTER TABLE time_slots ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- =====================================================
-- 9. ENSURE APPOINTMENTS HAS REQUIRED COLUMNS
-- =====================================================
DO $$
BEGIN
  -- Add notes if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'appointments' AND column_name = 'notes') THEN
    ALTER TABLE appointments ADD COLUMN notes text;
  END IF;

  -- Add meeting_type if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'appointments' AND column_name = 'meeting_type') THEN
    ALTER TABLE appointments ADD COLUMN meeting_type text DEFAULT 'in-person';
  END IF;

  -- Add updated_at if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'appointments' AND column_name = 'updated_at') THEN
    ALTER TABLE appointments ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- =====================================================
-- 10. MEDIA_CONTENTS TABLE + DEMO DATA
-- =====================================================

CREATE TABLE IF NOT EXISTS media_contents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('webinar', 'capsule_inside', 'podcast', 'live_studio', 'best_moments', 'testimonial')),
  title text NOT NULL,
  description text,
  thumbnail_url text,
  video_url text,
  audio_url text,
  duration integer, -- en secondes
  published_at timestamptz,
  status text DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),

  -- Métriques
  views_count integer DEFAULT 0,
  likes_count integer DEFAULT 0,
  shares_count integer DEFAULT 0,

  -- Sponsor/Participants
  sponsor_partner_id uuid,
  featured_exhibitors uuid[] DEFAULT '{}',
  speakers jsonb DEFAULT '[]',

  -- Contenu
  transcript text,
  tags text[] DEFAULT '{}',
  category text,

  -- SEO
  seo_title text,
  seo_description text,
  seo_keywords text[] DEFAULT '{}',

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE media_contents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view published media" ON media_contents;
CREATE POLICY "Anyone can view published media" ON media_contents
  FOR SELECT USING (status = 'published' OR auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admin can manage media" ON media_contents;
CREATE POLICY "Admin can manage media" ON media_contents
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.type = 'admin')
  );

CREATE INDEX IF NOT EXISTS idx_media_contents_type ON media_contents(type);
CREATE INDEX IF NOT EXISTS idx_media_contents_status ON media_contents(status);
CREATE INDEX IF NOT EXISTS idx_media_contents_published ON media_contents(published_at);

-- Insert demo media content
INSERT INTO media_contents (type, title, description, thumbnail_url, duration, status, views_count, likes_count, speakers, tags, category, published_at)
VALUES
  -- Webinaires
  ('webinar', 'L''avenir des ports intelligents au Maroc',
   'Découvrez les tendances et innovations qui transforment l''industrie portuaire marocaine. Un webinaire animé par des experts du secteur.',
   'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800',
   3600, 'published', 1250, 89,
   '[{"name": "Karim Bennani", "title": "CEO", "company": "PortTech Maroc"}, {"name": "Sara Amrani", "title": "Directrice Innovation", "company": "Marsa Maroc"}]'::jsonb,
   ARRAY['port', 'digital', 'innovation'], 'Technologie', NOW() - INTERVAL '7 days'),

  ('webinar', 'Infrastructures portuaires: normes et qualité',
   'Analyse approfondie des normes internationales pour les infrastructures portuaires et leur application au Maroc.',
   'https://images.unsplash.com/photo-1494412519320-aa613dfb7738?w=800',
   2700, 'published', 890, 67,
   '[{"name": "Mohamed Larbi", "title": "Expert Qualité", "company": "IANOR"}]'::jsonb,
   ARRAY['équipement', 'qualité', 'normes'], 'Réglementation', NOW() - INTERVAL '14 days'),

  ('webinar', 'Financement des projets portuaires',
   'Comment financer votre projet portuaire ? Subventions, investisseurs, PPP - toutes les options expliquées.',
   'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800',
   2400, 'published', 720, 45,
   '[{"name": "Amine Djebbar", "title": "Consultant Finance", "company": "Port Invest"}]'::jsonb,
   ARRAY['finance', 'investissement', 'startup'], 'Finance', NOW() - INTERVAL '21 days'),

  -- Podcasts
  ('podcast', 'SIPORT Talks #1: L''écosystème portuaire marocain',
   'Premier épisode de notre podcast dédié à l''industrie des ports. Invité spécial: le président de l''Autorité Portuaire.',
   'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800',
   1800, 'published', 2100, 156,
   '[{"name": "Farid Bensalem", "title": "Journaliste Maritime", "company": "SIPORTS"}]'::jsonb,
   ARRAY['podcast', 'interview', 'port'], 'Interview', NOW() - INTERVAL '5 days'),

  ('podcast', 'SIPORT Talks #2: Femmes et Secteur Maritime',
   'Focus sur les femmes dans le secteur maritime marocain. Défis, opportunités et success stories.',
   'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800',
   2100, 'published', 1850, 203,
   '[{"name": "Yasmine Khelifi", "title": "Capitaine", "company": "Marine Nationale"}]'::jsonb,
   ARRAY['femmes', 'port', 'égalité'], 'Société', NOW() - INTERVAL '12 days'),

  -- Capsules Inside
  ('capsule_inside', 'Inside SIPORT: Coulisses du salon',
   'Découvrez les coulisses de l''organisation du plus grand salon portuaire du Maroc.',
   'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800',
   300, 'published', 3500, 245,
   '[]'::jsonb,
   ARRAY['coulisses', 'organisation', 'salon'], 'Behind The Scenes', NOW() - INTERVAL '3 days'),

  ('capsule_inside', 'Inside SIPORT: Préparation des stands',
   'Comment les exposants préparent leurs stands pour impressionner les visiteurs.',
   'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800',
   240, 'published', 2800, 178,
   '[]'::jsonb,
   ARRAY['stands', 'exposants', 'préparation'], 'Behind The Scenes', NOW() - INTERVAL '2 days'),

  -- Live Studio
  ('live_studio', 'Meet The Leaders: Interview CEO PortTech',
   'Interview exclusive avec le CEO de PortTech DZ sur l''avenir de la technologie dans les ports.',
   'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
   1200, 'published', 1560, 98,
   '[{"name": "Karim Benzarti", "title": "CEO", "company": "PortTech DZ"}]'::jsonb,
   ARRAY['interview', 'leader', 'technologie'], 'Leadership', NOW() - INTERVAL '8 days'),

  -- Best Moments
  ('best_moments', 'SIPORTS 2025: Les moments forts',
   'Revivez les meilleurs moments de l''édition 2025 du salon SIPORTS.',
   'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
   420, 'published', 4200, 312,
   '[]'::jsonb,
   ARRAY['highlights', 'salon', '2025'], 'Événement', NOW() - INTERVAL '1 day'),

  -- Testimonials
  ('testimonial', 'Témoignage: Exposant satisfait',
   'Ahmed Kaci, exposant depuis 3 éditions, partage son expérience au salon SIPORTS.',
   'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
   180, 'published', 980, 67,
   '[{"name": "Ahmed Kaci", "title": "Directeur Commercial", "company": "Équipements Portuaires Pro"}]'::jsonb,
   ARRAY['témoignage', 'exposant', 'satisfaction'], 'Témoignage', NOW() - INTERVAL '10 days'),

  ('testimonial', 'Témoignage: Visiteur VIP',
   'Retour d''expérience d''un visiteur VIP sur les avantages du pass premium.',
   'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800',
   150, 'published', 750, 45,
   '[{"name": "Mehdi Belkacem", "title": "Acheteur", "company": "Groupe Portuaire Oran"}]'::jsonb,
   ARRAY['témoignage', 'visiteur', 'VIP'], 'Témoignage', NOW() - INTERVAL '6 days')

ON CONFLICT DO NOTHING;

-- =====================================================
-- 11. GRANT PERMISSIONS
-- =====================================================
GRANT EXECUTE ON FUNCTION book_appointment_atomic TO authenticated;
GRANT EXECUTE ON FUNCTION cancel_appointment_atomic TO authenticated;
GRANT EXECUTE ON FUNCTION get_daily_quotas TO authenticated;
GRANT EXECUTE ON FUNCTION increment_daily_quota TO authenticated;

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE connections IS 'User networking connections with status tracking';
COMMENT ON TABLE user_favorites IS 'User favorites for various entity types';
COMMENT ON TABLE daily_quotas IS 'Daily usage quotas for networking features';
COMMENT ON FUNCTION book_appointment_atomic IS 'Atomically books an appointment with status=pending (requires exhibitor confirmation)';
COMMENT ON FUNCTION cancel_appointment_atomic IS 'Atomically cancels an appointment and frees the slot';
COMMENT ON FUNCTION get_daily_quotas IS 'Gets current daily quota usage for a user';
COMMENT ON FUNCTION increment_daily_quota IS 'Increments a specific daily quota counter';

-- Workflow documentation
COMMENT ON COLUMN appointments.status IS 'Appointment workflow: pending (visitor request) → confirmed (exhibitor accepts) → completed/cancelled';

-- =====================================================
-- APPOINTMENT WORKFLOW DOCUMENTATION
-- =====================================================
/*
  FLUX DE PRISE DE RENDEZ-VOUS:
  
  1. DEMANDE (Visiteur):
     - Le visiteur sélectionne un créneau disponible
     - Appel de book_appointment_atomic()
     - Création du RDV avec status='pending'
     - Le créneau reste disponible mais affiche "X RÉSERVÉ(S)"
  
  2. CONFIRMATION (Exposant):
     - L'exposant voit la demande dans son dashboard
     - Il peut ACCEPTER ou REFUSER
     - Si accepté: UPDATE appointments SET status='confirmed'
     - Notification envoyée au visiteur
     - Calendriers mis à jour (exposant + visiteur)
  
  3. AFFICHAGE:
     - Calendrier personnel exposant: tous les RDV (pending + confirmed)
     - Calendrier personnel visiteur: tous les RDV (pending + confirmed)
     - Calendrier de disponibilité: affiche "X RÉSERVÉ(S)" ou "COMPLET"
  
  4. ANNULATION:
     - Visiteur ou exposant peut annuler via cancel_appointment_atomic()
     - Le créneau est libéré (currentBookings décrémenté)
     - Status devient 'cancelled'
*/
