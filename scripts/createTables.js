import https from 'https';
import { URL } from 'url';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Charger les variables d'environnement depuis .env
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = {};

    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim();
        if (value.startsWith('"') && value.endsWith('"')) {
          envVars[key.trim()] = value.slice(1, -1);
        } else {
          envVars[key.trim()] = value;
        }
      }
    });

    return envVars;
  }
  return {};
}

const envVars = loadEnv();

// Configuration depuis les variables d'environnement
const SUPABASE_URL = envVars.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = envVars.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = envVars.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  console.error('Vérifiez VITE_SUPABASE_URL et VITE_SUPABASE_SERVICE_ROLE_KEY dans .env');
  process.exit(1);
}

console.log('🚀 Création des tables manquantes dans Supabase...');
console.log('📍 URL Supabase:', SUPABASE_URL);

// Fonction pour exécuter une requête SQL via l'API REST
function executeSQL(sql) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`);
    const postData = JSON.stringify({ sql });

    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY,
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (res.statusCode === 200) {
            resolve(response);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// SQL pour créer toutes les tables
const createTablesSQL = `
-- ========================================
-- TABLES MANQUANTES POUR SIPORTS
-- ========================================

-- 1. PARTNERS TABLE
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

-- 2. CONVERSATIONS TABLE
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

-- 3. MESSAGES TABLE
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

-- 4. MESSAGE ATTACHMENTS TABLE
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

-- 5. EVENT REGISTRATIONS TABLE
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

-- 6. NETWORKING RECOMMENDATIONS TABLE
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

-- 7. ANALYTICS TABLE
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

-- 8. ACTIVITIES TABLE
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

-- ========================================
-- ACTIVER RLS SUR TOUTES LES TABLES
-- ========================================

ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE networking_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- ========================================
-- INDEXES POUR LES PERFORMANCES
-- ========================================

CREATE INDEX IF NOT EXISTS idx_partners_user_id ON partners(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON conversations USING GIN(participants);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_networking_recommendations_user_id ON networking_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
`;

// Fonction principale
async function main() {
  try {
    console.log('📋 Exécution du SQL pour créer les tables...');

    const result = await executeSQL(createTablesSQL);

    console.log('✅ SQL exécuté avec succès !');
    console.log('📊 Résultat:', result);

    console.log('\n🎉 Toutes les tables manquantes ont été créées !');
    console.log('\n📝 Prochaines étapes recommandées :');
    console.log('1. Vérifier les tables dans votre dashboard Supabase');
    console.log('2. Configurer les politiques RLS si nécessaire');
    console.log('3. Tester les nouvelles fonctionnalités dans l\'application');

  } catch (error) {
    console.error('❌ Erreur lors de la création des tables:', error.message);

    console.log('\n🔧 Alternatives :');
    console.log('1. Copiez le SQL ci-dessus et exécutez-le manuellement dans l\'éditeur SQL de Supabase');
    console.log('2. Ou utilisez le dashboard Supabase pour créer les tables via l\'interface');

    process.exit(1);
  }
}

main();
