/**
 * Script pour créer un compte partenaire de test directement dans Supabase
 * Utilisé par les tests E2E pour éviter le problème de confirmation d'email
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://sbyizudifmqakzxjlndr.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createTestPartner(email, password, partnerData) {
  try {
    console.log(`\n🔧 Création du compte partenaire: ${email}`);
    
    // 1. Créer l'utilisateur dans Auth avec email confirmé
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // ✅ Email confirmé automatiquement
      user_metadata: {
        name: `${partnerData.firstName} ${partnerData.lastName}`,
        company: partnerData.companyName
      }
    });

    if (authError) {
      console.error('❌ Erreur création Auth:', authError);
      throw authError;
    }

    console.log('✅ Utilisateur Auth créé:', authData.user.id);

    // 2. Créer le profil dans users
    const { data: userProfile, error: userError } = await supabase
      .from('users')
      .insert([{
        id: authData.user.id,
        email,
        name: `${partnerData.firstName} ${partnerData.lastName}`,
        type: 'partner',
        status: 'pending_payment', // ✅ Status pending_payment
        profile: {
          firstName: partnerData.firstName,
          lastName: partnerData.lastName,
          company: partnerData.companyName,
          position: partnerData.position,
          phone: partnerData.phone,
          website: partnerData.website,
          description: partnerData.description
        }
      }])
      .select()
      .single();

    if (userError) {
      console.error('❌ Erreur création profil:', userError);
      // Supprimer l'utilisateur Auth si échec
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw userError;
    }

    console.log('✅ Profil utilisateur créé');

    // 3. Créer le profil partenaire
    const { data: partnerProfile, error: partnerError } = await supabase
      .from('partners')
      .insert([{
        id: authData.user.id,
        user_id: authData.user.id,
        company_name: partnerData.companyName,
        contact_name: `${partnerData.firstName} ${partnerData.lastName}`,
        contact_email: email,
        contact_phone: partnerData.phone,
        website: partnerData.website,
        description: partnerData.description,
        status: 'pending',
        sectors: ['Logistique et Transport'],
        partnership_type: 'logistics',
        country: 'France'
      }])
      .select()
      .single();

    if (partnerError) {
      console.error('❌ Erreur création profil partenaire:', partnerError);
      // Nettoyage en cas d'erreur
      await supabase.from('users').delete().eq('id', authData.user.id);
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw partnerError;
    }

    console.log('✅ Profil partenaire créé');

    console.log('\n✅ COMPTE CRÉÉ AVEC SUCCÈS !');
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);
    console.log('🆔 User ID:', authData.user.id);
    console.log('📊 Status: pending_payment');
    console.log('✅ Email confirmé: OUI\n');

    return {
      success: true,
      userId: authData.user.id,
      email,
      status: 'pending_payment'
    };

  } catch (error) {
    console.error('\n❌ ÉCHEC DE CRÉATION:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Récupérer les paramètres depuis les arguments ou variables d'environnement
const email = process.argv[2] || process.env.TEST_EMAIL;
const password = process.argv[3] || process.env.TEST_PASSWORD || 'TestPassword123!';

const partnerData = {
  companyName: process.env.TEST_COMPANY || 'Test Maritime Company SARL',
  firstName: process.env.TEST_FIRST_NAME || 'Jean',
  lastName: process.env.TEST_LAST_NAME || 'Dupont',
  position: process.env.TEST_POSITION || 'Directeur Général',
  phone: process.env.TEST_PHONE || '+33612345678',
  website: process.env.TEST_WEBSITE || 'https://test-maritime.com',
  description: process.env.TEST_DESCRIPTION || 'Entreprise spécialisée dans le transport maritime international avec plus de 15 ans d\'expérience.'
};

if (!email) {
  console.error('❌ Email requis !');
  console.log('Usage: node scripts/create-test-partner.js email@example.com [password]');
  process.exit(1);
}

createTestPartner(email, password, partnerData)
  .then(result => {
    process.exit(result.success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Erreur:', error);
    process.exit(1);
  });
