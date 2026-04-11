-- ============================================================
-- FIX: Politiques RLS manquantes sur la table conversations
-- Symptôme: "Aucune conversation" même après avoir cliqué
--           "Envoyer un message" sur un profil exposant
-- Cause: Seule la politique SELECT était définie. INSERT et
--        UPDATE étaient absentes → création silencieusement bloquée
-- ============================================================

-- 1. INSERT: un utilisateur authentifié peut créer une conversation
--    dans laquelle il est lui-même participant
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
  CREATE POLICY "Users can create conversations"
    ON conversations
    FOR INSERT
    TO authenticated
    WITH CHECK (
      auth.uid()::text = ANY(participants::text[])
    );
END $$;

-- 2. UPDATE: un participant peut mettre à jour la conversation
--    (last_message_at, updated_at, etc.)
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can update own conversations" ON conversations;
  CREATE POLICY "Users can update own conversations"
    ON conversations
    FOR UPDATE
    TO authenticated
    USING (
      auth.uid()::text = ANY(participants::text[])
    )
    WITH CHECK (
      auth.uid()::text = ANY(participants::text[])
    );
END $$;

-- 3. (Bonus) Si un INSERT sur messages échoue aussi : politique INSERT
--    déjà définie dans fix_chat_schema.sql, mais on la recrée par sécurité
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can send messages" ON messages;
  CREATE POLICY "Users can send messages"
    ON messages
    FOR INSERT
    TO authenticated
    WITH CHECK (
      auth.uid() = sender_id
    );
END $$;

-- Vérification finale
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('conversations', 'messages')
ORDER BY tablename, cmd;
