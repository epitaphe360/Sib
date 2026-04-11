/*
  # Create chat system

  1. New Tables
    - `conversations`
      - `id` (uuid, primary key)
      - `participants` (uuid array)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    - `messages`
      - `id` (uuid, primary key)
      - `conversation_id` (uuid, foreign key to conversations)
      - `sender_id` (uuid, foreign key to users)
      - `content` (text)
      - `type` (message_type enum)
      - `timestamp` (timestamp)
      - `read` (boolean)
      - `attachments` (jsonb, optional)
  2. Security
    - Enable RLS on both tables
    - Add policies for conversation participants
*/

-- Create message_type enum
CREATE TYPE message_type AS ENUM ('text', 'file', 'system');

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participants uuid[] NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL,
  type message_type DEFAULT 'text'::message_type,
  timestamp timestamptz DEFAULT now(),
  read boolean DEFAULT false,
  attachments jsonb
);

-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Conversations policies
CREATE POLICY "Users can read own conversations"
  ON conversations
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = ANY(participants::text[]));

CREATE POLICY "Users can create conversations"
  ON conversations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = ANY(participants::text[]));

-- Messages policies
CREATE POLICY "Users can read messages from own conversations"
  ON messages
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM conversations
    WHERE conversations.id = messages.conversation_id 
    AND auth.uid()::text = ANY(conversations.participants::text[])
  ));

CREATE POLICY "Users can send messages to own conversations"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid()::text = sender_id::text AND
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id 
      AND auth.uid()::text = ANY(conversations.participants::text[])
    )
  );

-- Create trigger for conversations updated_at
CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();