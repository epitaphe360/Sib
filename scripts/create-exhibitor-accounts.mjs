import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://eqjoqgpbxhsfgcovipgu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo'
);

async function main() {
  // 1. Récupérer les 32 exposants
  const { data: exhibitors, error } = await supabase
    .from('exhibitors')
    .select('id, company_name, contact_info, website, sector, category, description')
    .order('company_name');

  if (error) { console.error('Erreur:', error.message); return; }
  console.log(`📋 ${exhibitors.length} exposants trouvés\n`);

  let created = 0, skipped = 0, errors = 0;

  for (const ex of exhibitors) {
    const email = ex.contact_info?.email;
    if (!email) {
      console.log(`⚠️  ${ex.company_name} - pas d'email, skip`);
      skipped++;
      continue;
    }

    // Mot de passe standardisé: Siport2026! + initiales
    const slug = ex.company_name.replace(/[^a-zA-Z]/g, '').substring(0, 4);
    const password = `Siport2026!${slug}`;

    console.log(`🔄 ${ex.company_name} (${email})...`);

    try {
      // Vérifier si un auth user existe déjà avec cet email
      const { data: authUsers } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
      const existingAuth = authUsers?.users?.find(u => u.email === email);

      let userId;

      if (existingAuth) {
        console.log(`   ↪ Auth existant (${existingAuth.id}), réutilisation`);
        userId = existingAuth.id;
        // Mettre à jour le mot de passe
        await supabase.auth.admin.updateUserById(userId, { password });
      } else {
        // Créer le compte auth avec l'ID de l'exhibitor pour lier les deux
        const { data: newUser, error: authError } = await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: {
            name: ex.company_name,
            type: 'exhibitor',
            company_name: ex.company_name
          }
        });

        if (authError) {
          console.error(`   ❌ Auth error: ${authError.message}`);
          errors++;
          continue;
        }
        userId = newUser.user.id;
      }

      // Vérifier/Créer l'entrée dans public.users
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (existing) {
        // Mettre à jour pour s'assurer du bon type
        await supabase.from('users').update({
          type: 'exhibitor',
          status: 'active',
          updated_at: new Date().toISOString()
        }).eq('id', existing.id);
        console.log(`   ↪ public.users existant, mis à jour`);
      } else {
        const { error: insertError } = await supabase.from('users').insert({
          id: userId,
          email,
          name: ex.company_name,
          type: 'exhibitor',
          status: 'active',
          profile: {
            firstName: ex.company_name,
            lastName: '',
            companyName: ex.company_name,
            company: ex.company_name,
            sector: ex.sector || '',
            category: ex.category || 'port-industry',
            description: ex.description?.substring(0, 200) || '',
            website: ex.website || '',
            phone: ex.contact_info?.phone || '',
            country: ex.contact_info?.country || 'Maroc'
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

        if (insertError) {
          console.error(`   ❌ Insert public.users error: ${insertError.message}`);
          errors++;
          continue;
        }
      }

      // Mettre à jour le user_id dans exhibitors pour lier au compte
      await supabase.from('exhibitors').update({ user_id: userId }).eq('id', ex.id);

      console.log(`   ✅ Compte créé (${userId.substring(0, 8)}...)`);
      created++;

    } catch (err) {
      console.error(`   ❌ Exception: ${err.message}`);
      errors++;
    }
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`✅ Créés/Mis à jour: ${created}`);
  console.log(`⚠️  Ignorés: ${skipped}`);
  console.log(`❌ Erreurs: ${errors}`);
  console.log(`${'='.repeat(50)}`);

  // Résumé final: lister tous les comptes avec emails/mots de passe
  console.log(`\n📋 IDENTIFIANTS DE CONNEXION:`);
  console.log(`${'='.repeat(60)}`);
  for (const ex of exhibitors) {
    const email = ex.contact_info?.email;
    if (!email) continue;
    const slug = ex.company_name.replace(/[^a-zA-Z]/g, '').substring(0, 4);
    const password = `Siport2026!${slug}`;
    console.log(`${ex.company_name.padEnd(25)} | ${email.padEnd(35)} | ${password}`);
  }
}

main().catch(console.error);
