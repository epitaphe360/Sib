-- ========================================
-- Fix Chat Schema - Add Missing Columns (SAFE VERSION)
-- ========================================
-- Date: 2024-12-18
-- Purpose: Fix schema mismatch between code expectations and database
-- Issue: Code expects receiver_id and read_at columns that don't exist
-- Solution: Add these columns while keeping read_by array for group chats
-- ========================================

-- ========================================
-- 1. ADD MISSING COLUMNS TO MESSAGES TABLE
-- ========================================

-- Add receiver_id column (for direct 1-1 messages)
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS receiver_id uuid REFERENCES users(id) ON DELETE CASCADE;

-- Add read_at column (timestamp when message was read)
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS read_at timestamptz;

-- ========================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- ========================================

CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(receiver_id, read_at)
  WHERE read_at IS NULL;

-- ========================================
-- 3. UPDATE EXISTING DATA (SAFELY)
-- ========================================

-- For existing messages, try to infer receiver_id from conversations
-- In a direct conversation (2 participants), receiver is the other person
DO $$
BEGIN
  UPDATE messages m
  SET receiver_id = (
    SELECT
      CASE
        WHEN array_length(c.participants, 1) = 2 THEN
          (SELECT unnest(c.participants)
           WHERE unnest(c.participants) != m.sender_id
           LIMIT 1)
        ELSE NULL
      END
    FROM conversations c
    WHERE c.id = m.conversation_id
  )
  WHERE m.receiver_id IS NULL AND m.conversation_id IS NOT NULL;
END $$;

-- For messages that have been read (in read_by array), set read_at
-- Use created_at + 1 minute as approximate read time if we don't have exact timestamp
DO $$
BEGIN
  UPDATE messages m
  SET read_at = m.created_at + INTERVAL '1 minute'
  WHERE
    m.read_at IS NULL
    AND m.receiver_id = ANY(m.read_by)
    AND m.receiver_id IS NOT NULL;
END $$;

-- ========================================
-- 4. UPDATE RLS POLICIES (SAFELY)
-- ========================================

-- Drop old policies that might conflict
DROP POLICY IF EXISTS "Users can read messages from own conversations" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can read their messages (sender or receiver)" ON messages;
DROP POLICY IF EXISTS "Users can update their received messages (mark as read)" ON messages;

-- New comprehensive policies (with existence checks)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'messages'
    AND policyname = 'Users can read their messages (sender or receiver)'
  ) THEN
    CREATE POLICY "Users can read their messages (sender or receiver)"
      ON messages FOR SELECT
      USING (
        auth.uid() = sender_id
        OR auth.uid() = receiver_id
        OR auth.uid() = ANY(
          SELECT unnest(participants)
          FROM conversations
          WHERE id = messages.conversation_id
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'messages'
    AND policyname = 'Users can send messages'
  ) THEN
    CREATE POLICY "Users can send messages"
      ON messages FOR INSERT
      WITH CHECK (
        auth.uid() = sender_id
        AND (
          receiver_id IS NULL
          OR auth.uid() IN (
            SELECT unnest(participants)
            FROM conversations
            WHERE id = conversation_id
          )
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'messages'
    AND policyname = 'Users can update their received messages (mark as read)'
  ) THEN
    CREATE POLICY "Users can update their received messages (mark as read)"
      ON messages FOR UPDATE
      USING (auth.uid() = receiver_id)
      WITH CHECK (auth.uid() = receiver_id);
  END IF;
END $$;

-- ========================================
-- 5. HELPER FUNCTIONS FOR CHAT
-- ========================================

-- Function to mark message as read
CREATE OR REPLACE FUNCTION mark_message_as_read(p_message_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE messages
  SET
    read_at = now(),
    read_by = array_append(
      COALESCE(read_by, ARRAY[]::uuid[]),
      auth.uid()
    )
  WHERE
    id = p_message_id
    AND receiver_id = auth.uid()
    AND read_at IS NULL;
END;
$$;

-- Function to mark all messages in conversation as read
CREATE OR REPLACE FUNCTION mark_conversation_as_read(p_conversation_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count integer;
BEGIN
  UPDATE messages
  SET
    read_at = now(),
    read_by = array_append(
      COALESCE(read_by, ARRAY[]::uuid[]),
      auth.uid()
    )
  WHERE
    conversation_id = p_conversation_id
    AND receiver_id = auth.uid()
    AND read_at IS NULL;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- Function to get unread message count for user
CREATE OR REPLACE FUNCTION get_unread_message_count(p_user_id uuid DEFAULT NULL)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_count integer;
BEGIN
  v_user_id := COALESCE(p_user_id, auth.uid());

  SELECT COUNT(*)::integer INTO v_count
  FROM messages
  WHERE receiver_id = v_user_id AND read_at IS NULL;

  RETURN v_count;
END;
$$;

-- Function to send direct message (helper)
CREATE OR REPLACE FUNCTION send_direct_message(
  p_receiver_id uuid,
  p_content text,
  p_message_type text DEFAULT 'text'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_conversation_id uuid;
  v_message_id uuid;
  v_sender_id uuid;
BEGIN
  v_sender_id := auth.uid();

  -- Find or create conversation between sender and receiver
  SELECT id INTO v_conversation_id
  FROM conversations
  WHERE
    type = 'direct'
    AND participants @> ARRAY[v_sender_id, p_receiver_id]
    AND participants <@ ARRAY[v_sender_id, p_receiver_id]
  LIMIT 1;

  -- Create conversation if doesn't exist
  IF v_conversation_id IS NULL THEN
    INSERT INTO conversations (type, participants, created_by)
    VALUES ('direct', ARRAY[v_sender_id, p_receiver_id], v_sender_id)
    RETURNING id INTO v_conversation_id;
  END IF;

  -- Insert message
  INSERT INTO messages (
    conversation_id,
    sender_id,
    receiver_id,
    content,
    message_type
  )
  VALUES (
    v_conversation_id,
    v_sender_id,
    p_receiver_id,
    p_content,
    p_message_type
  )
  RETURNING id INTO v_message_id;

  -- Update conversation last_message_at
  UPDATE conversations
  SET last_message_at = now()
  WHERE id = v_conversation_id;

  RETURN v_message_id;
END;
$$;

-- ========================================
-- 6. TRIGGERS
-- ========================================

-- Auto-add sender to read_by array when they send message
CREATE OR REPLACE FUNCTION auto_mark_sender_as_read()
RETURNS TRIGGER AS $$
BEGIN
  NEW.read_by := array_append(COALESCE(NEW.read_by, ARRAY[]::uuid[]), NEW.sender_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS auto_mark_sender_as_read_trigger ON messages;
CREATE TRIGGER auto_mark_sender_as_read_trigger
  BEFORE INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION auto_mark_sender_as_read();

-- ========================================
-- COMMENTS
-- ========================================

COMMENT ON COLUMN messages.receiver_id IS 'Direct recipient of message (for 1-1 chats)';
COMMENT ON COLUMN messages.read_at IS 'Timestamp when message was first read by receiver';
COMMENT ON COLUMN messages.read_by IS 'Array of user IDs who have read this message (for group chats)';

-- ========================================
-- END OF MIGRATION
-- ========================================
