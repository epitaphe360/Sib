# 🔒 RLS (Row Level Security) Policies - SIPORT V3

**Date:** 27 janvier 2026
**Status:** Documentation des policies requises

---

## 📋 TABLE DES MATIÈRES

1. [Users Table](#users-table)
2. [Profiles Table](#profiles-table)
3. [Conversations Table](#conversations-table)
4. [Messages Table](#messages-table)
5. [Appointments Table](#appointments-table)
6. [Events Table](#events-table)
7. [Notifications Table](#notifications-table)
8. [Activity Logs Table](#activity-logs-table)
9. [Access Logs Table](#access-logs-table)
10. [Mini Sites Table](#mini-sites-table)

---

## Users Table

### Policy: users_select_own
**Opération:** SELECT
**Description:** Les utilisateurs peuvent voir leur propre profil

```sql
CREATE POLICY "users_select_own" ON users
  FOR SELECT
  USING (auth.uid() = id);
```

### Policy: users_select_admin
**Opération:** SELECT
**Description:** Les admins peuvent voir tous les utilisateurs

```sql
CREATE POLICY "users_select_admin" ON users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.type = 'admin'
    )
  );
```

### Policy: users_select_public
**Opération:** SELECT
**Description:** Tous les utilisateurs authentifiés peuvent voir les profils publics (liste exposants/partenaires)

```sql
CREATE POLICY "users_select_public" ON users
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND (type IN ('exhibitor', 'partner') OR status = 'active')
  );
```

### Policy: users_update_own
**Opération:** UPDATE
**Description:** Les utilisateurs peuvent modifier leur propre profil

```sql
CREATE POLICY "users_update_own" ON users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
```

### Policy: users_update_admin
**Opération:** UPDATE
**Description:** Les admins peuvent modifier n'importe quel utilisateur

```sql
CREATE POLICY "users_update_admin" ON users
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.type = 'admin'
    )
  );
```

### Policy: users_insert_admin
**Opération:** INSERT
**Description:** Seuls les admins peuvent créer des utilisateurs

```sql
CREATE POLICY "users_insert_admin" ON users
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.type = 'admin'
    )
  );
```

---

## Profiles Table

### Policy: profiles_select_own
**Opération:** SELECT
**Description:** Les utilisateurs peuvent voir leur propre profil détaillé

```sql
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT
  USING (auth.uid() = user_id);
```

### Policy: profiles_select_public
**Opération:** SELECT
**Description:** Tous peuvent voir les profils publics

```sql
CREATE POLICY "profiles_select_public" ON profiles
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND is_public = true
  );
```

### Policy: profiles_update_own
**Opération:** UPDATE
**Description:** Les utilisateurs peuvent modifier leur propre profil

```sql
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

---

## Conversations Table

### Policy: conversations_select_participant
**Opération:** SELECT
**Description:** Les utilisateurs peuvent voir les conversations dont ils sont participants

```sql
CREATE POLICY "conversations_select_participant" ON conversations
  FOR SELECT
  USING (auth.uid() = ANY(participants));
```

### Policy: conversations_insert_authenticated
**Opération:** INSERT
**Description:** Les utilisateurs authentifiés peuvent créer des conversations

```sql
CREATE POLICY "conversations_insert_authenticated" ON conversations
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND auth.uid() = ANY(participants)
  );
```

### Policy: conversations_update_participant
**Opération:** UPDATE
**Description:** Les participants peuvent mettre à jour la conversation

```sql
CREATE POLICY "conversations_update_participant" ON conversations
  FOR UPDATE
  USING (auth.uid() = ANY(participants))
  WITH CHECK (auth.uid() = ANY(participants));
```

---

## Messages Table

### Policy: messages_select_participant
**Opération:** SELECT
**Description:** Les utilisateurs peuvent voir les messages des conversations dont ils sont participants

```sql
CREATE POLICY "messages_select_participant" ON messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND auth.uid() = ANY(conversations.participants)
    )
  );
```

### Policy: messages_insert_participant
**Opération:** INSERT
**Description:** Les participants peuvent envoyer des messages dans leurs conversations

```sql
CREATE POLICY "messages_insert_participant" ON messages
  FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND auth.uid() = ANY(conversations.participants)
    )
  );
```

### Policy: messages_update_own
**Opération:** UPDATE
**Description:** Les utilisateurs peuvent marquer leurs propres messages comme lus

```sql
CREATE POLICY "messages_update_own" ON messages
  FOR UPDATE
  USING (auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = receiver_id);
```

---

## Appointments Table

### Policy: appointments_select_involved
**Opération:** SELECT
**Description:** Les utilisateurs peuvent voir les RDV où ils sont involvés

```sql
CREATE POLICY "appointments_select_involved" ON appointments
  FOR SELECT
  USING (
    auth.uid() = requester_id
    OR auth.uid() = recipient_id
  );
```

### Policy: appointments_insert_requester
**Opération:** INSERT
**Description:** Les utilisateurs peuvent créer des RDV où ils sont demandeurs

```sql
CREATE POLICY "appointments_insert_requester" ON appointments
  FOR INSERT
  WITH CHECK (auth.uid() = requester_id);
```

### Policy: appointments_update_involved
**Opération:** UPDATE
**Description:** Les personnes impliquées peuvent mettre à jour le RDV

```sql
CREATE POLICY "appointments_update_involved" ON appointments
  FOR UPDATE
  USING (
    auth.uid() = requester_id
    OR auth.uid() = recipient_id
  )
  WITH CHECK (
    auth.uid() = requester_id
    OR auth.uid() = recipient_id
  );
```

### Policy: appointments_delete_own
**Opération:** DELETE
**Description:** Le demandeur peut annuler le RDV

```sql
CREATE POLICY "appointments_delete_own" ON appointments
  FOR DELETE
  USING (auth.uid() = requester_id);
```

---

## Events Table

### Policy: events_select_all
**Opération:** SELECT
**Description:** Tous les utilisateurs authentifiés peuvent voir les événements

```sql
CREATE POLICY "events_select_all" ON events
  FOR SELECT
  USING (auth.uid() IS NOT NULL);
```

### Policy: events_insert_admin
**Opération:** INSERT
**Description:** Seuls les admins peuvent créer des événements

```sql
CREATE POLICY "events_insert_admin" ON events
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.type = 'admin'
    )
  );
```

### Policy: events_update_admin
**Opération:** UPDATE
**Description:** Seuls les admins peuvent modifier des événements

```sql
CREATE POLICY "events_update_admin" ON events
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.type = 'admin'
    )
  );
```

### Policy: events_delete_admin
**Opération:** DELETE
**Description:** Seuls les admins peuvent supprimer des événements

```sql
CREATE POLICY "events_delete_admin" ON events
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.type = 'admin'
    )
  );
```

---

## Notifications Table

### Policy: notifications_select_own
**Opération:** SELECT
**Description:** Les utilisateurs peuvent voir leurs propres notifications

```sql
CREATE POLICY "notifications_select_own" ON notifications
  FOR SELECT
  USING (auth.uid() = user_id);
```

### Policy: notifications_insert_system
**Opération:** INSERT
**Description:** Le système peut créer des notifications pour tout le monde

```sql
CREATE POLICY "notifications_insert_system" ON notifications
  FOR INSERT
  WITH CHECK (true); -- Service role only
```

### Policy: notifications_update_own
**Opération:** UPDATE
**Description:** Les utilisateurs peuvent marquer leurs notifications comme lues

```sql
CREATE POLICY "notifications_update_own" ON notifications
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### Policy: notifications_delete_own
**Opération:** DELETE
**Description:** Les utilisateurs peuvent supprimer leurs propres notifications

```sql
CREATE POLICY "notifications_delete_own" ON notifications
  FOR DELETE
  USING (auth.uid() = user_id);
```

---

## Activity Logs Table

### Policy: activity_logs_select_own
**Opération:** SELECT
**Description:** Les utilisateurs peuvent voir leurs propres logs d'activité

```sql
CREATE POLICY "activity_logs_select_own" ON activity_logs
  FOR SELECT
  USING (auth.uid() = user_id);
```

### Policy: activity_logs_select_admin
**Opération:** SELECT
**Description:** Les admins peuvent voir tous les logs

```sql
CREATE POLICY "activity_logs_select_admin" ON activity_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.type = 'admin'
    )
  );
```

### Policy: activity_logs_insert_own
**Opération:** INSERT
**Description:** Les utilisateurs peuvent créer leurs propres logs

```sql
CREATE POLICY "activity_logs_insert_own" ON activity_logs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

---

## Access Logs Table

### Policy: access_logs_select_admin
**Opération:** SELECT
**Description:** Seuls les admins et la sécurité peuvent voir les logs d'accès

```sql
CREATE POLICY "access_logs_select_admin" ON access_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.type IN ('admin', 'security')
    )
  );
```

### Policy: access_logs_insert_system
**Opération:** INSERT
**Description:** Le système peut créer des logs d'accès

```sql
CREATE POLICY "access_logs_insert_system" ON access_logs
  FOR INSERT
  WITH CHECK (true); -- Service role only
```

---

## Mini Sites Table

### Policy: mini_sites_select_public
**Opération:** SELECT
**Description:** Tous peuvent voir les mini-sites publiés

```sql
CREATE POLICY "mini_sites_select_public" ON mini_sites
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND status = 'published'
  );
```

### Policy: mini_sites_select_owner
**Opération:** SELECT
**Description:** Les propriétaires peuvent voir leur mini-site (même non publié)

```sql
CREATE POLICY "mini_sites_select_owner" ON mini_sites
  FOR SELECT
  USING (auth.uid() = user_id);
```

### Policy: mini_sites_insert_owner
**Opération:** INSERT
**Description:** Les utilisateurs peuvent créer leur propre mini-site

```sql
CREATE POLICY "mini_sites_insert_owner" ON mini_sites
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### Policy: mini_sites_update_owner
**Opération:** UPDATE
**Description:** Les propriétaires peuvent modifier leur mini-site

```sql
CREATE POLICY "mini_sites_update_owner" ON mini_sites
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### Policy: mini_sites_update_admin
**Opération:** UPDATE
**Description:** Les admins peuvent modérer les mini-sites

```sql
CREATE POLICY "mini_sites_update_admin" ON mini_sites
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.type = 'admin'
    )
  );
```

---

## 🚀 DÉPLOIEMENT DES POLICIES

### 1. Activer RLS sur toutes les tables

```sql
-- Activer RLS sur toutes les tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE mini_sites ENABLE ROW LEVEL SECURITY;
```

### 2. Supprimer les anciennes policies (si nécessaire)

```sql
-- Supprimer toutes les policies existantes pour une table
DROP POLICY IF EXISTS "old_policy_name" ON users;
```

### 3. Créer les nouvelles policies

Copiez-collez les policies ci-dessus dans l'éditeur SQL de Supabase Dashboard.

### 4. Tester les policies

```sql
-- Tester avec un utilisateur spécifique
SET request.jwt.claims.sub = 'user-id-here';

-- Vérifier qu'on peut seulement voir nos propres données
SELECT * FROM users WHERE id = 'user-id-here'; -- ✅ Should work
SELECT * FROM users WHERE id = 'other-user-id'; -- ❌ Should fail
```

---

## 📝 NOTES IMPORTANTES

### Service Role vs Authenticated Role

- **Service Role**: Bypass toutes les RLS policies (utilisé par Edge Functions)
- **Authenticated Role**: Soumis aux RLS policies (utilisé par le frontend)

### Bypass RLS pour Edge Functions

Dans les Edge Functions, utilisez `supabaseServiceRole` pour bypass RLS:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseServiceRole = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, // Service role key
  { auth: { persistSession: false } }
);

// Cette requête bypass les RLS policies
const { data } = await supabaseServiceRole
  .from('users')
  .select('*');
```

### Performance RLS

Les RLS policies peuvent impacter les performances. Pour optimiser:

1. **Indexer les colonnes** utilisées dans les policies
2. **Utiliser EXISTS** au lieu de sous-requêtes complexes
3. **Tester avec EXPLAIN ANALYZE** pour voir le plan d'exécution

```sql
-- Indexer les colonnes fréquemment utilisées
CREATE INDEX idx_conversations_participants ON conversations USING GIN (participants);
CREATE INDEX idx_messages_conversation_id ON messages (conversation_id);
CREATE INDEX idx_appointments_requester ON appointments (requester_id);
CREATE INDEX idx_appointments_recipient ON appointments (recipient_id);
```

---

## ✅ CHECKLIST VALIDATION

Avant de déployer en production:

- [ ] Toutes les tables ont RLS activé
- [ ] Policies testées pour chaque rôle (visitor, exhibitor, partner, admin)
- [ ] Aucune fuite de données sensibles
- [ ] Les Edge Functions utilisent Service Role Key
- [ ] Le frontend utilise Anon Key
- [ ] Index créés sur colonnes critiques
- [ ] Tests de performance effectués
- [ ] Documentation à jour

---

**🔐 Sécurité avant tout !**

*Généré le 27 janvier 2026*
