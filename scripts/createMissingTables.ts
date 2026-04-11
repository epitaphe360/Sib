import { createClient } from '@supabase/supabase-js';

// Configuration Supabase depuis les variables d'environnement
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  console.error('Vérifiez VITE_SUPABASE_URL et VITE_SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createMissingTables() {
  console.log('� Création des tables manquantes dans Supabase...');

  const tables = [
    {
      name: 'partners',
      sql: `
        CREATE TABLE IF NOT EXISTS partners (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id uuid REFERENCES users(id) ON DELETE CASCADE,
          company_name text NOT NULL,
          partner_type text NOT NULL DEFAULT 'bronze',
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
          benefits jsonb DEFAULT '[]',
          created_at timestamptz DEFAULT now(),
          updated_at timestamptz DEFAULT now()
        );
      `
    },
    {
      name: 'conversations',
      sql: `
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
      `
    },
    {
      name: 'messages',
      sql: `
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
      `
    },
    {
      name: 'message_attachments',
      sql: `
        CREATE TABLE IF NOT EXISTS message_attachments (
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
      `
    },
    {
      name: 'event_registrations',
      sql: `
        CREATE TABLE IF NOT EXISTS event_registrations (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          event_id uuid REFERENCES events(id) ON DELETE CASCADE,
          user_id uuid REFERENCES users(id) ON DELETE CASCADE,
          registration_type text DEFAULT 'attendee',
          status text DEFAULT 'registered',
          registration_date timestamptz DEFAULT now(),
          attended_at timestamptz,
          notes text,
          special_requirements text,
          created_at timestamptz DEFAULT now(),
          updated_at timestamptz DEFAULT now(),
          UNIQUE(event_id, user_id)
        );
      `
    },
    {
      name: 'networking_recommendations',
      sql: `
        CREATE TABLE IF NOT EXISTS networking_recommendations (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id uuid REFERENCES users(id) ON DELETE CASCADE,
          recommended_user_id uuid REFERENCES users(id) ON DELETE CASCADE,
          recommendation_type text NOT NULL,
          score decimal(3,2) NOT NULL CHECK (score >= 0 AND score <= 1),
          reasons text[] DEFAULT '{}',
          category text NOT NULL,
          viewed boolean DEFAULT false,
          contacted boolean DEFAULT false,
          mutual_connections integer DEFAULT 0,
          expires_at timestamptz DEFAULT (now() + interval '30 days'),
          created_at timestamptz DEFAULT now(),
          UNIQUE(user_id, recommended_user_id, recommendation_type)
        );
      `
    },
    {
      name: 'analytics',
      sql: `
        CREATE TABLE IF NOT EXISTS analytics (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id uuid REFERENCES users(id) ON DELETE CASCADE,
          event_type text NOT NULL,
          event_data jsonb DEFAULT '{}',
          session_id text,
          user_agent text,
          ip_address inet,
          referrer text,
          created_at timestamptz DEFAULT now()
        );
      `
    },
    {
      name: 'activities',
      sql: `
        CREATE TABLE IF NOT EXISTS activities (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id uuid REFERENCES users(id) ON DELETE CASCADE,
          activity_type text NOT NULL,
          description text NOT NULL,
          related_user_id uuid REFERENCES users(id),
          related_entity_type text,
          related_entity_id uuid,
          metadata jsonb DEFAULT '{}',
          is_public boolean DEFAULT true,
          created_at timestamptz DEFAULT now()
        );
      `
    }
  ];

  for (const table of tables) {
    try {
      console.log(`📋 Création de la table ${table.name}...`);

      // Utiliser rpc pour exécuter du SQL
      const { error } = await supabase.rpc('exec_sql', {
        sql: table.sql
      });

      if (error) {
        // Si rpc n'existe pas, essayer une approche différente
        console.log(`⚠️ RPC non disponible, tentative alternative pour ${table.name}...`);

        // On peut essayer d'insérer une ligne factice pour créer la table implicitement
        // Mais c'est plus complexe, donc on passe pour l'instant
        console.log(`⏭️ Table ${table.name} peut nécessiter une création manuelle`);
      } else {
        console.log(`✅ Table ${table.name} créée avec succès`);
      }
    } catch (error) {
      console.error(`❌ Erreur lors de la création de ${table.name}:`, error.message);
    }
  }

  // Activer RLS sur toutes les tables
  console.log('🔒 Activation de RLS sur toutes les tables...');
  const rlsTables = ['partners', 'conversations', 'messages', 'message_attachments', 'event_registrations', 'networking_recommendations', 'analytics', 'activities'];

  for (const tableName of rlsTables) {
    try {
      const { error: _ } = await supabase.rpc('exec_sql', {
        sql: `ALTER TABLE ${tableName} ENABLE ROW LEVEL SECURITY;`
      });

      if (!_) {
        console.log(`✅ RLS activé sur ${tableName}`);
      }
    } catch {
      console.log(`⚠️ Impossible d'activer RLS sur ${tableName} automatiquement`);
    }
  }

  console.log('🎉 Processus de création des tables terminé !');
  console.log('📝 Note: Certaines tables peuvent nécessiter une configuration manuelle des politiques RLS dans Supabase Dashboard');
}

// Exécuter le script
createMissingTables().catch(console.error);
