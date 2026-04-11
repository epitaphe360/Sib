import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://eqjoqgpbxhsfgcovipgu.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixDemoExhibitor() {
  const userId = '68b95250-3400-41a3-bdaf-ba1eddc82dad';
  
  console.log('🔍 Vérification de l\'utilisateur demo.exhibitor...');
  
  // 1. Vérifier l'utilisateur
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (userError || !user) {
    console.error('❌ Utilisateur introuvable:', userError);
    return;
  }
  
  console.log('✅ Utilisateur trouvé:', {
    id: user.id,
    email: user.email,
    type: user.type,
    role: user.role,
    status: user.status
  });
  
  // 2. Vérifier si un exhibitor existe
  const { data: exhibitor, error: exhError } = await supabase
    .from('exhibitors')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  
  if (exhibitor) {
    console.log('✅ Exhibitor existe déjà:', {
      id: exhibitor.id,
      company: exhibitor.company,
      sector: exhibitor.sector
    });
    return;
  }
  
  console.log('⚠️ Aucun exhibitor trouvé, création...');
  
  // 3. Créer l'exhibitor
  const { data: newExhibitor, error: createError } = await supabase
    .from('exhibitors')
    .insert({
      user_id: userId,
      company: user.profile?.company || 'Demo Company',
      sector: user.profile?.sector || 'Technology',
      description: 'Compte de démonstration pour les exposants',
      contact_email: user.email,
      booth_number: 'A-101',
      stand_area: 18, // Standard level
      level: 'standard_18'
    })
    .select()
    .single();
  
  if (createError) {
    console.error('❌ Erreur création exhibitor:', createError);
    return;
  }
  
  console.log('✅ Exhibitor créé:', {
    id: newExhibitor.id,
    company: newExhibitor.company,
    sector: newExhibitor.sector,
    level: newExhibitor.level
  });
}

fixDemoExhibitor()
  .then(() => console.log('\n✅ Terminé'))
  .catch(err => console.error('\n❌ Erreur:', err))
  .finally(() => process.exit(0));
