import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Variables d\'environnement manquantes');
  process.exit(1);
}

// Identifiants de connexion pour chaque profil
const credentials = [
  {
    email: 'contact@mtl.gov.ma',
    password: 'MTL2026!',
    name: 'MTL - Ministère du Transport',
    type: 'partner'
  },
  {
    email: 'contact@mee.gov.ma',
    password: 'MEE2026!',
    name: 'MEE - Ministère de l\'Équipement',
    type: 'partner'
  },
  {
    email: 'info@irmqatar.com',
    password: 'IRM2026!',
    name: 'IRM Energy & Technology Services',
    type: 'exhibitor'
  },
  {
    email: 'info@igus.fr',
    password: 'IGUS2026!',
    name: 'igus GmbH',
    type: 'exhibitor'
  },
  {
    email: 'info@aqua-modules.com',
    password: 'AQUA2026!',
    name: 'Aqua Modules International',
    type: 'exhibitor'
  }
];

async function createAuthUser(credential) {
  try {
    // Créer l'utilisateur dans auth.users via Admin API
    const response = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': SUPABASE_SERVICE_ROLE_KEY
      },
      body: JSON.stringify({
        email: credential.email,
        password: credential.password,
        email_confirm: true, // Confirmer l'email automatiquement
        user_metadata: {
          name: credential.name,
          type: credential.type
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      // Si l'utilisateur existe déjà, on le met à jour
      if (data.msg?.includes('already registered') || data.message?.includes('already registered')) {
        console.log(`⚠️  ${credential.name}: Compte existant, mise à jour du mot de passe...`);
        return await updateAuthUserPassword(credential);
      }
      throw new Error(data.message || data.msg || 'Erreur création utilisateur');
    }

    console.log(`✅ ${credential.name}: Compte créé`);
    return { success: true, data };
  } catch (error) {
    console.error(`❌ ${credential.name}: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function updateAuthUserPassword(credential) {
  try {
    // Récupérer l'utilisateur par email
    const userResponse = await fetch(
      `${SUPABASE_URL}/auth/v1/admin/users?email=${encodeURIComponent(credential.email)}`,
      {
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'apikey': SUPABASE_SERVICE_ROLE_KEY
        }
      }
    );

    const users = await userResponse.json();
    if (!users || users.length === 0) {
      throw new Error('Utilisateur non trouvé');
    }

    const userId = users[0].id;

    // Mettre à jour le mot de passe
    const updateResponse = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': SUPABASE_SERVICE_ROLE_KEY
      },
      body: JSON.stringify({
        password: credential.password,
        email_confirm: true,
        user_metadata: {
          name: credential.name,
          type: credential.type
        }
      })
    });

    const updateData = await updateResponse.json();

    if (!updateResponse.ok) {
      throw new Error(updateData.message || updateData.msg || 'Erreur mise à jour');
    }

    console.log(`✅ ${credential.name}: Mot de passe mis à jour`);
    return { success: true, data: updateData };
  } catch (error) {
    console.error(`❌ ${credential.name}: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('🔐 Création des identifiants de connexion...\n');

  const results = {
    success: 0,
    failed: 0
  };

  for (const credential of credentials) {
    const result = await createAuthUser(credential);
    if (result.success) {
      results.success++;
    } else {
      results.failed++;
    }
  }

  console.log('\n📊 RÉSUMÉ:');
  console.log(`✅ Comptes créés/mis à jour: ${results.success}`);
  console.log(`❌ Échecs: ${results.failed}`);

  if (results.success > 0) {
    console.log('\n🔑 IDENTIFIANTS DE CONNEXION:\n');
    console.log('=' .repeat(60));
    credentials.forEach(cred => {
      console.log(`\n📧 ${cred.name}`);
      console.log(`   Type: ${cred.type === 'partner' ? 'Partenaire' : 'Exposant'}`);
      console.log(`   Email: ${cred.email}`);
      console.log(`   Mot de passe: ${cred.password}`);
    });
    console.log('\n' + '='.repeat(60));
    console.log('\n💡 Ces identifiants peuvent être utilisés pour se connecter à l\'application.');
  }
}

main().catch(console.error);
