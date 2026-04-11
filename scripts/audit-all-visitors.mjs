import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://eqjoqgpbxhsfgcovipgu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo'
);

async function findAllVisitors() {
  console.log('🔍 Tous les visiteurs et leurs rendez-vous:\n');

  // Récupérer tous les visiteurs
  const { data: allVisitors } = await supabase
    .from('users')
    .select('id, name, email, visitor_level, type')
    .eq('type', 'visitor')
    .order('created_at', { ascending: false });

  console.log(`Total visiteurs: ${allVisitors.length}\n`);

  // Pour chaque visiteur, compter les rendez-vous
  for (const visitor of allVisitors) {
    const { data: appointments } = await supabase
      .from('appointments')
      .select('status')
      .eq('visitor_id', visitor.id);

    const total = appointments.length;
    const confirmed = appointments.filter(a => a.status === 'confirmed').length;
    const pending = appointments.filter(a => a.status === 'pending').length;
    const completed = appointments.filter(a => a.status === 'completed').length;

    const quotaMap = { free: 0, premium: 10, vip: 10 };
    const quota = quotaMap[visitor.visitor_level] || 0;

    // Déterminer la violation
    let violation = '';
    if (visitor.visitor_level === 'free' && total > 0) {
      violation = ' ❌ VIOLATION: FREE avec RDV!';
    } else if (confirmed >= quota && quota > 0) {
      violation = ' ⚠️  QUOTA DÉPASSÉ';
    }

    console.log(`${visitor.name} (${visitor.visitor_level})`);
    console.log(`  Email: ${visitor.email}`);
    console.log(`  RDV: ${total} (conf:${confirmed}, pend:${pending}, compl:${completed}) | Quota: ${quota}${violation}`);
    console.log('');
  }
}

findAllVisitors().catch(console.error);
