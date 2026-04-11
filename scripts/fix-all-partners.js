import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://eqjoqgpbxhsfgcovipgu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo'
);

const partnerAccounts = [
  { email: 'partner-silver@test.siport.com', name: 'Silver Maritime Services', tier: 'silver' },
  { email: 'partner-gold@test.siport.com', name: 'Gold Shipping Corp', tier: 'gold' },
  { email: 'partner-platinium@test.siport.com', name: 'Platinium Port Authority', tier: 'platinium' },
  { email: 'partner-museum@test.siport.com', name: 'Musée Maritime National', tier: 'museum' },
  { email: 'partner-coastal@test.siport.com', name: 'Coastal Logistics', tier: 'silver' },
  { email: 'partner-oceanfreight@test.siport.com', name: 'Ocean Freight International', tier: 'gold' },
  { email: 'partner-porttech@test.siport.com', name: 'PortTech Solutions', tier: 'platinium' }
];

async function main() {
  console.log('=== Correction de tous les comptes partenaires ===\n');
  
  // Récupérer tous les utilisateurs auth
  const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
  
  if (authError) {
    console.error('Erreur auth:', authError.message);
    return;
  }
  
  for (const partner of partnerAccounts) {
    console.log(`\n--- ${partner.email} ---`);
    
    // Trouver l'utilisateur auth
    const authUser = authData.users.find(u => u.email === partner.email);
    
    if (!authUser) {
      console.log('❌ Pas trouvé dans auth.users');
      continue;
    }
    
    console.log(`Auth ID: ${authUser.id}`);
    
    // Réinitialiser le mot de passe
    const { error: pwdError } = await supabase.auth.admin.updateUserById(authUser.id, {
      password: 'Test@123456',
      email_confirm: true
    });
    
    if (pwdError) {
      console.log('❌ Erreur mot de passe:', pwdError.message);
    } else {
      console.log('✅ Mot de passe réinitialisé');
    }
    
    // Supprimer les anciens enregistrements avec cet email
    await supabase.from('users').delete().eq('email', partner.email);
    
    // Créer le bon enregistrement
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        id: authUser.id,
        email: partner.email,
        name: partner.name,
        type: 'partner',
        partner_tier: partner.tier,
        role: 'partner',
        status: 'active',
        is_active: true,
        email_verified: true,
        profile: {
          company: partner.name,
          description: `Partenaire ${partner.tier} du salon SIPORTS 2026`
        }
      });
    
    if (insertError) {
      console.log('❌ Erreur profil:', insertError.message);
    } else {
      console.log('✅ Profil créé');
    }
  }
  
  console.log('\n\n=== RÉSUMÉ ===');
  console.log('Tous les comptes partenaires ont été corrigés.');
  console.log('Mot de passe commun: Test@123456\n');
  
  partnerAccounts.forEach(p => {
    console.log(`📧 ${p.email} (${p.tier})`);
  });
}

main().catch(console.error);
