-- Fix RLS policies for conversations table
-- Error: "new row violates row-level security policy for table conversations" (code 42501)
-- Root cause: INSERT policy was missing for conversations

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Allow authenticated participants to read conversations they belong to
DROP POLICY IF EXISTS "Participants can read conversations" ON conversations;
CREATE POLICY "Participants can read conversations"
  ON conversations
  FOR SELECT
  TO authenticated
  USING (
    auth.uid()::text = ANY(participants::text[])
  );

-- Allow authenticated users to create conversations they are part of
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
CREATE POLICY "Users can create conversations"
  ON conversations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid()::text = created_by::text
    AND auth.uid()::text = ANY(participants::text[])
    AND array_length(participants, 1) >= 2
  );

-- Allow participants to update conversations (e.g. last_message_at)
DROP POLICY IF EXISTS "Participants can update conversations" ON conversations;
CREATE POLICY "Participants can update conversations"
  ON conversations
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = ANY(participants::text[]))
  WITH CHECK (auth.uid()::text = ANY(participants::text[]));

-- Allow admins to manage all conversations
DROP POLICY IF EXISTS "Admins can manage all conversations" ON conversations;
CREATE POLICY "Admins can manage all conversations"
  ON conversations
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.type = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.type = 'admin'
    )
  );
