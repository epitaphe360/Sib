import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sbyizudifmqakzxjlndr.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createPartnerPlatinum() {
  console.log('🔄 Création/Mise à jour du compte partner-platinum...\n');

  const email = 'partner-platinum@test.siport.com';
  const password = 'Demo2026!';

  try {
    // 1. Vérifier si le compte Auth existe déjà
    console.log('1️⃣ Vérification du compte Auth...');
    const { data: authList } = await supabaseAdmin.auth.admin.listUsers();
    const existingAuthUser = authList?.users?.find(u => u.email === email);

    let authUserId;

    if (existingAuthUser) {
      console.log('✅ Compte Auth existe déjà:', existingAuthUser.id);
      authUserId = existingAuthUser.id;
      
      // Mettre à jour le mot de passe
      await supabaseAdmin.auth.admin.updateUserById(authUserId, { password });
      console.log('✅ Mot de passe mis à jour');
    } else {
      // Créer le compte Auth
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true,
        user_metadata: {
          role: 'partner'
        }
      });

      if (authError) {
        console.error('❌ Erreur création Auth:', authError.message);
        return;
      }

      authUserId = authUser.user.id;
      console.log('✅ Compte Auth créé:', authUserId);
    }

    // 2. Créer le profil utilisateur dans users
    console.log('\n2️⃣ Création du profil utilisateur...');
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authUserId,
        email: email,
        role: 'partner',
        type: 'partner',
        name: 'Partenaire Platinium Demo',
        partner_tier: 'platinium',
        status: 'active',
        is_active: true,
        email_verified: true,
        profile: {
          bio: 'Partenaire Platinium - Niveau Premium avec tous les avantages exclusifs',
          company: 'Platinium Corp International',
          country: 'FR',
          sectors: ['Services portuaires', 'Logistique', 'Technologies maritimes'],
          interests: ['Innovation portuaire', 'Technologies vertes', 'Transformation digitale'],
          objectives: ['Partenariat stratégique', 'Présenter mes innovations'],
          companySize: '500+',
          description: 'Partenaire platinium premium du salon SIPORTS 2026',
          collaborationTypes: ['Partenariat stratégique', 'Partenariat technologique', 'Partenariat commercial']
        }
      })
      .select()
      .single();

    if (userError) {
      console.error('❌ Erreur création utilisateur:', userError.message);
      return;
    }

    console.log('✅ Profil utilisateur créé:', userData.id);

    // 3. Créer le profil partenaire dans la table partners
    console.log('\n3️⃣ Création du profil partenaire...');
    const { data: partnerData, error: partnerError } = await supabaseAdmin
      .from('partners')
      .insert({
        user_id: userData.id,
        company_name: 'Platinium Corp International',
        tier: 'platinium',
        description: 'Partenaire stratégique de niveau Platinium avec accès premium à tous les services du salon',
        logo_url: 'https://placehold.co/200x100/9333EA/FFF?text=Platinium',
        website: 'https://platiniumcorp-international.com',
        contact_email: email,
        contact_phone: '+33140000004',
        benefits: [
          'Stand personnalisé premium 100m²',
          'Visibilité maximale sur tous les supports',
          'Conférences et ateliers illimités',
          'Networking prioritaire VIP',
          'Support dédié 24/7',
          'Accès backstage',
          'Sessions privées avec décideurs'
        ],
        status: 'active'
      })
      .select()
      .single();

    if (partnerError) {
      console.log('⚠️ Profil partenaire:', partnerError.message);
    } else {
      console.log('✅ Profil partenaire créé:', partnerData.id);
    }

    console.log('\n✅ Compte partner-platinum@test.siport.com créé avec succès !');
    console.log('📧 Email:', email);
    console.log('🔑 Mot de passe: Demo2026!');
    console.log('🎖️ Tier: Platinium');

  } catch (err) {
    console.error('❌ Erreur:', err.message);
  }
}

createPartnerPlatinum();
