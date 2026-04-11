import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = 'https://eqjoqgpbxhsfgcovipgu.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Vérifier un email spécifique (récent)
const testEmail = process.argv[2] || 'partner.e2e';

async function checkAuthUsers() {
  console.log('\n=== VÉRIFICATION DES UTILISATEURS SUPABASE AUTH ===\n');
  
  try {
    // Lister tous les utilisateurs
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
    
    if (error) {
      console.error('❌ Erreur:', error.message);
      return;
    }
    
    console.log(`Total utilisateurs dans Auth: ${users.length}\n`);
    
    // Filtrer les utilisateurs récents ou correspondant au pattern
    const recentUsers = users
      .filter(u => u.email?.includes(testEmail) || 
                   new Date(u.created_at).getTime() > Date.now() - 3600000) // dernière heure
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    console.log(`Utilisateurs trouvés (${testEmail} ou < 1h): ${recentUsers.length}\n`);
    
    for (const user of recentUsers.slice(0, 10)) {
      console.log('─'.repeat(60));
      console.log(`📧 Email: ${user.email}`);
      console.log(`🆔 ID: ${user.id}`);
      console.log(`📅 Créé: ${user.created_at}`);
      console.log(`✅ Email confirmé: ${user.email_confirmed_at ? 'OUI (' + user.email_confirmed_at + ')' : 'NON ❌'}`);
      console.log(`🔐 Confirmé: ${user.confirmed_at || 'N/A'}`);
      console.log(`🚫 Banni: ${user.banned_until || 'Non'}`);
      
      // Vérifier si l'utilisateur existe dans la table users
      const { data: userProfile, error: profileError } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      
      if (profileError) {
        console.log(`⚠️ Erreur profil: ${profileError.message}`);
      } else if (userProfile) {
        console.log(`👤 Profil users: OUI (type: ${userProfile.type}, status: ${userProfile.status})`);
      } else {
        console.log(`👤 Profil users: NON ❌ (pas d'entrée dans la table users)`);
      }
      
      // Vérifier partner si c'est un partner
      const { data: partnerProfile } = await supabaseAdmin
        .from('partners')
        .select('id, company_name, partnership_level')
        .eq('auth_id', user.id)
        .maybeSingle();
      
      if (partnerProfile) {
        console.log(`🏢 Profil partner: OUI (${partnerProfile.company_name})`);
      }
    }
    
    console.log('\n' + '─'.repeat(60));
    console.log('\n=== FIN VÉRIFICATION ===\n');
    
  } catch (error) {
    console.error('❌ Erreur globale:', error);
  }
}

checkAuthUsers();
