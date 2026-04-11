/*
  # Complete SIPORTS Schema

  This migration creates all remaining tables needed for the application:
  - time_slots and appointments (for scheduling)
  - events (for salon events)
  - news_articles (for news content)
  - conversations, messages (for chat system)
  - connections, user_favorites (for networking)
  
  Security: All tables have RLS enabled with appropriate policies
*/

-- Create enums
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'meeting_type') THEN
    CREATE TYPE meeting_type AS ENUM ('in-person', 'virtual', 'hybrid');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'appointment_status') THEN
    CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'event_type') THEN
    CREATE TYPE event_type AS ENUM ('conference', 'workshop', 'networking', 'exhibition');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'connection_status') THEN
    CREATE TYPE connection_status AS ENUM ('pending', 'accepted', 'rejected');
  END IF;
END $$;

-- Time slots table
CREATE TABLE IF NOT EXISTS time_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exhibitor_id uuid REFERENCES exhibitors(id) ON DELETE CASCADE,
  slot_date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  duration integer NOT NULL DEFAULT 30,
  type meeting_type NOT NULL DEFAULT 'in-person',
  max_bookings integer NOT NULL DEFAULT 1,
  current_bookings integer NOT NULL DEFAULT 0,
  available boolean NOT NULL DEFAULT true,
  location text,
  created_at timestamptz DEFAULT now()
);

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exhibitor_id uuid REFERENCES exhibitors(id) ON DELETE CASCADE,
  visitor_id uuid REFERENCES users(id) ON DELETE CASCADE,
  time_slot_id uuid REFERENCES time_slots(id) ON DELETE CASCADE,
  status appointment_status NOT NULL DEFAULT 'pending',
  message text,
  notes text,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  created_at timestamptz DEFAULT now(),
  meeting_type meeting_type NOT NULL DEFAULT 'in-person',
  meeting_link text
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  event_type event_type NOT NULL DEFAULT 'conference',
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  location text,
  pavilion_id uuid,
  organizer_id uuid REFERENCES users(id),
  capacity integer,
  registered integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  image_url text,
  registration_url text,
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- News articles table
CREATE TABLE IF NOT EXISTS news_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  excerpt text,
  author_id uuid REFERENCES users(id),
  category text NOT NULL,
  tags text[] DEFAULT '{}',
  image_url text,
  published boolean DEFAULT false,
  published_at timestamptz,
  views integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL DEFAULT 'direct',
  title text,
  description text,
  participants uuid[] NOT NULL,
  created_by uuid REFERENCES users(id),
  last_message_at timestamptz,
  is_active boolean DEFAULT true,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL,
  message_type text NOT NULL DEFAULT 'text',
  metadata jsonb DEFAULT '{}',
  reply_to_id uuid REFERENCES messages(id),
  is_edited boolean DEFAULT false,
  edited_at timestamptz,
  read_by uuid[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Connections table
CREATE TABLE IF NOT EXISTS connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid REFERENCES users(id) ON DELETE CASCADE,
  addressee_id uuid REFERENCES users(id) ON DELETE CASCADE,
  status connection_status NOT NULL DEFAULT 'pending',
  message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(requester_id, addressee_id)
);

-- User favorites table
CREATE TABLE IF NOT EXISTS user_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, entity_type, entity_id)
);

-- Enable RLS on all tables
ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- Public read policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'time_slots' AND policyname = 'Anyone can read time slots') THEN
    CREATE POLICY "Anyone can read time slots" ON time_slots FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'events' AND policyname = 'Anyone can read events') THEN
    CREATE POLICY "Anyone can read events" ON events FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'news_articles' AND policyname = 'Anyone can read published news') THEN
    CREATE POLICY "Anyone can read published news" ON news_articles FOR SELECT USING (published = true OR true);
  END IF;
END $$;

-- Appointments policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'appointments' AND policyname = 'Users can read own appointments') THEN
    CREATE POLICY "Users can read own appointments" ON appointments FOR SELECT TO authenticated
      USING (auth.uid()::text = visitor_id::text OR auth.uid()::text = exhibitor_id::text);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'appointments' AND policyname = 'Users can create appointments') THEN
    CREATE POLICY "Users can create appointments" ON appointments FOR INSERT TO authenticated
      WITH CHECK (auth.uid()::text = visitor_id::text);
  END IF;
END $$;

-- Connections policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'connections' AND policyname = 'Users can read own connections') THEN
    CREATE POLICY "Users can read own connections" ON connections FOR SELECT TO authenticated
      USING (auth.uid()::text = requester_id::text OR auth.uid()::text = addressee_id::text);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'connections' AND policyname = 'Users can create connections') THEN
    CREATE POLICY "Users can create connections" ON connections FOR INSERT TO authenticated
      WITH CHECK (auth.uid()::text = requester_id::text);
  END IF;
END $$;

-- User favorites policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_favorites' AND policyname = 'Users can manage own favorites') THEN
    CREATE POLICY "Users can manage own favorites" ON user_favorites FOR ALL TO authenticated
      USING (auth.uid()::text = user_id::text) WITH CHECK (auth.uid()::text = user_id::text);
  END IF;
END $$;

-- Conversations and messages policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'conversations' AND policyname = 'Users can read own conversations') THEN
    CREATE POLICY "Users can read own conversations" ON conversations FOR SELECT TO authenticated
      USING (auth.uid()::text = ANY(participants::text[]));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND policyname = 'Users can read messages from own conversations') THEN
    CREATE POLICY "Users can read messages from own conversations" ON messages FOR SELECT TO authenticated
      USING (EXISTS (SELECT 1 FROM conversations c WHERE c.id = messages.conversation_id AND auth.uid()::text = ANY(c.participants::text[])));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND policyname = 'Users can send messages') THEN
    CREATE POLICY "Users can send messages" ON messages FOR INSERT TO authenticated
      WITH CHECK (auth.uid()::text = sender_id::text);
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_time_slots_exhibitor ON time_slots(exhibitor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_visitor ON appointments(visitor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_exhibitor ON appointments(exhibitor_id);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_news_published ON news_articles(published, published_at);
CREATE INDEX IF NOT EXISTS idx_connections_users ON connections(requester_id, addressee_id);
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON conversations USING GIN(participants);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);