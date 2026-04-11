/*
  # Add missing tables for complete SIPORTS functionality

  1. New Tables
    - `partners` - Dedicated table for partners (different from exhibitors)
    - `conversations` - Chat conversations management
    - `messages` - Individual chat messages
    - `message_attachments` - File attachments for messages
    - `event_registrations` - Event registration tracking
    - `networking_recommendations` - AI-powered networking recommendations
    - `analytics` - Detailed analytics and metrics
    - `activities` - User activity tracking

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for each user type
*/

-- Drop existing tables if they exist with wrong structure
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS analytics CASCADE;
DROP TABLE IF EXISTS networking_recommendations CASCADE;
DROP TABLE IF EXISTS event_registrations CASCADE;
DROP TABLE IF EXISTS message_attachments CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS partners CASCADE;

-- Create partners table (separate from exhibitors)
CREATE TABLE partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  partner_type text NOT NULL, -- 'gold', 'silver', 'bronze', 'media', 'technical'
  sector text NOT NULL,
  description text NOT NULL,
  logo_url text,
  website text,
  verified boolean DEFAULT false,
  featured boolean DEFAULT false,
  contact_info jsonb DEFAULT '{}',
  partnership_level text DEFAULT 'bronze',
  contract_value numeric,
  contract_start_date date,
  contract_end_date date,
  benefits jsonb DEFAULT '[]', -- Array of partnership benefits
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create conversations table for chat system
CREATE TABLE conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL DEFAULT 'direct', -- 'direct', 'group', 'support'
  title text, -- For group chats
  description text,
  participants uuid[] NOT NULL, -- Array of user IDs
  created_by uuid REFERENCES users(id),
  last_message_at timestamptz,
  is_active boolean DEFAULT true,
  metadata jsonb DEFAULT '{}', -- Additional conversation data
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create messages table
CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL,
  message_type text NOT NULL DEFAULT 'text', -- 'text', 'file', 'system', 'image'
  metadata jsonb DEFAULT '{}', -- For additional message data
  reply_to_id uuid REFERENCES messages(id), -- For threaded replies
  is_edited boolean DEFAULT false,
  edited_at timestamptz,
  read_by uuid[] DEFAULT '{}', -- Array of user IDs who read the message
  created_at timestamptz DEFAULT now()
);

-- Create message_attachments table
CREATE TABLE message_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid REFERENCES messages(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_type text NOT NULL,
  file_size integer NOT NULL,
  mime_type text,
  uploaded_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now()
);

-- Create event_registrations table
CREATE TABLE event_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  registration_type text DEFAULT 'attendee', -- 'attendee', 'speaker', 'organizer'
  status text DEFAULT 'registered', -- 'registered', 'confirmed', 'cancelled', 'attended'
  registration_date timestamptz DEFAULT now(),
  attended_at timestamptz,
  notes text,
  special_requirements text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  -- Ensure unique registration per user per event
  UNIQUE(event_id, user_id)
);

-- Create networking_recommendations table
CREATE TABLE networking_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  recommended_user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  recommendation_type text NOT NULL, -- 'compatibility', 'sector', 'geographic', 'mutual_contacts'
  score decimal(3,2) NOT NULL CHECK (score >= 0 AND score <= 1),
  reasons text[] DEFAULT '{}',
  category text NOT NULL,
  viewed boolean DEFAULT false,
  contacted boolean DEFAULT false,
  mutual_connections integer DEFAULT 0,
  expires_at timestamptz DEFAULT (now() + interval '30 days'),
  created_at timestamptz DEFAULT now(),

  -- Ensure unique recommendation per user pair
  UNIQUE(user_id, recommended_user_id, recommendation_type)
);

-- Create analytics table for detailed metrics
CREATE TABLE analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  event_type text NOT NULL, -- 'profile_view', 'message_sent', 'appointment_booked', etc.
  event_data jsonb DEFAULT '{}',
  session_id text,
  user_agent text,
  ip_address inet,
  referrer text,
  created_at timestamptz DEFAULT now()
);

-- Create activities table for user activity tracking
CREATE TABLE activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  activity_type text NOT NULL, -- 'profile_view', 'message', 'appointment', 'connection', 'download'
  description text NOT NULL,
  related_user_id uuid REFERENCES users(id), -- User involved in the activity
  related_entity_type text, -- 'user', 'exhibitor', 'event', 'product', etc.
  related_entity_id uuid,
  metadata jsonb DEFAULT '{}',
  is_public boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE networking_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- ========================================
-- PARTNERS POLICIES
-- ========================================

CREATE POLICY "Anyone can read verified partners"
  ON partners
  FOR SELECT
  TO authenticated
  USING (verified = true);

CREATE POLICY "Partners can manage own data"
  ON partners
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = partners.user_id
      AND auth.uid()::text = u.id::text
    )
  );

CREATE POLICY "Admins can manage all partners"
  ON partners
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND type = 'admin'
    )
  );

-- ========================================
-- CONVERSATIONS POLICIES
-- ========================================

CREATE POLICY "Users can read conversations they participate in"
  ON conversations
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = ANY(participants::text[]));

CREATE POLICY "Users can create conversations"
  ON conversations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = created_by::text);

CREATE POLICY "Conversation participants can update conversations"
  ON conversations
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = ANY(participants::text[]));

-- ========================================
-- MESSAGES POLICIES
-- ========================================

CREATE POLICY "Users can read messages from conversations they participate in"
  ON messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND auth.uid()::text = ANY(c.participants::text[])
    )
  );

CREATE POLICY "Users can send messages to conversations they participate in"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid()::text = sender_id::text AND
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND auth.uid()::text = ANY(c.participants::text[])
    )
  );

CREATE POLICY "Users can update their own messages"
  ON messages
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = sender_id::text);

-- ========================================
-- MESSAGE ATTACHMENTS POLICIES
-- ========================================

CREATE POLICY "Users can read attachments from their conversations"
  ON message_attachments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM messages m
      JOIN conversations c ON c.id = m.conversation_id
      WHERE m.id = message_attachments.message_id
      AND auth.uid()::text = ANY(c.participants::text[])
    )
  );

CREATE POLICY "Users can upload attachments to their messages"
  ON message_attachments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = uploaded_by::text);

-- ========================================
-- EVENT REGISTRATIONS POLICIES
-- ========================================

CREATE POLICY "Users can read their own registrations"
  ON event_registrations
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create registrations for themselves"
  ON event_registrations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own registrations"
  ON event_registrations
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Admins can manage all registrations"
  ON event_registrations
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND type = 'admin'
    )
  );

-- ========================================
-- NETWORKING RECOMMENDATIONS POLICIES
-- ========================================

CREATE POLICY "Users can read their own recommendations"
  ON networking_recommendations
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "System can create recommendations"
  ON networking_recommendations
  FOR INSERT
  TO authenticated
  WITH CHECK (true); -- Allow service role or admin to create

CREATE POLICY "Users can update their recommendation interactions"
  ON networking_recommendations
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = user_id::text);

-- ========================================
-- ANALYTICS POLICIES
-- ========================================

CREATE POLICY "Users can read their own analytics"
  ON analytics
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "System can create analytics events"
  ON analytics
  FOR INSERT
  TO authenticated
  WITH CHECK (true); -- Allow service role to create

CREATE POLICY "Admins can read all analytics"
  ON analytics
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND type = 'admin'
    )
  );

-- ========================================
-- ACTIVITIES POLICIES
-- ========================================

CREATE POLICY "Users can read their own activities"
  ON activities
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can read public activities of others"
  ON activities
  FOR SELECT
  TO authenticated
  USING (is_public = true);

CREATE POLICY "System can create activities"
  ON activities
  FOR INSERT
  TO authenticated
  WITH CHECK (true); -- Allow service role to create

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

-- Partners indexes
CREATE INDEX idx_partners_user_id ON partners(user_id);
CREATE INDEX idx_partners_verified ON partners(verified);
CREATE INDEX idx_partners_partner_type ON partners(partner_type);

-- Conversations indexes
CREATE INDEX idx_conversations_participants ON conversations USING GIN(participants);
CREATE INDEX idx_conversations_last_message_at ON conversations(last_message_at);
CREATE INDEX idx_conversations_type ON conversations(type);

-- Messages indexes
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_messages_read_by ON messages USING GIN(read_by);

-- Message attachments indexes
CREATE INDEX idx_message_attachments_message_id ON message_attachments(message_id);

-- Event registrations indexes
CREATE INDEX idx_event_registrations_event_id ON event_registrations(event_id);
CREATE INDEX idx_event_registrations_user_id ON event_registrations(user_id);
CREATE INDEX idx_event_registrations_status ON event_registrations(status);

-- Networking recommendations indexes
CREATE INDEX idx_networking_recommendations_user_id ON networking_recommendations(user_id);
CREATE INDEX idx_networking_recommendations_score ON networking_recommendations(score);
CREATE INDEX idx_networking_recommendations_expires_at ON networking_recommendations(expires_at);

-- Analytics indexes
CREATE INDEX idx_analytics_user_id ON analytics(user_id);
CREATE INDEX idx_analytics_event_type ON analytics(event_type);
CREATE INDEX idx_analytics_created_at ON analytics(created_at);

-- Activities indexes
CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_type ON activities(activity_type);
CREATE INDEX idx_activities_created_at ON activities(created_at);

-- ========================================
-- TRIGGERS FOR UPDATED_AT
-- ========================================

CREATE TRIGGER update_partners_updated_at
  BEFORE UPDATE ON partners
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_registrations_updated_at
  BEFORE UPDATE ON event_registrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- FUNCTIONS FOR CONVERSATIONS
-- ========================================

-- Function to update conversation last_message_at when a message is added
CREATE OR REPLACE FUNCTION update_conversation_last_message_at()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET last_message_at = NEW.created_at,
      updated_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_conversation_last_message_at
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_last_message_at();

-- ========================================
-- FUNCTIONS FOR EVENT REGISTRATIONS
-- ========================================

-- Function to update event registered count when registration is added/removed
CREATE OR REPLACE FUNCTION update_event_registered_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status IN ('registered', 'confirmed') THEN
    UPDATE events SET registered = registered + 1 WHERE id = NEW.event_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' AND OLD.status IN ('registered', 'confirmed') THEN
    UPDATE events SET registered = GREATEST(registered - 1, 0) WHERE id = OLD.event_id;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Handle status changes
    IF OLD.status IN ('registered', 'confirmed') AND NEW.status NOT IN ('registered', 'confirmed') THEN
      UPDATE events SET registered = GREATEST(registered - 1, 0) WHERE id = NEW.event_id;
    ELSIF OLD.status NOT IN ('registered', 'confirmed') AND NEW.status IN ('registered', 'confirmed') THEN
      UPDATE events SET registered = registered + 1 WHERE id = NEW.event_id;
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_event_registered_count
  AFTER INSERT OR UPDATE OR DELETE ON event_registrations
  FOR EACH ROW
  EXECUTE FUNCTION update_event_registered_count();
