/**
 * Corrige le type du compte service clientèle: 'security' -> 'service_client'
 * afin qu'il atterrisse sur l'espace dédié (lookup / inscription / impression badge)
 * plutôt que sur le scanner d'accès (réservé à la sécurité).
 *
 * Usage: node scripts/fix-service-client-type.mjs
 */
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../.env') });

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('❌ VITE_SUPABASE_URL / VITE_SUPABASE_SERVICE_ROLE_KEY manquants dans .env');
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
const EMAIL = 'service-clientele@sib.com';

async function main() {
  const { data: list, error: listErr } = await supabase.auth.admin.listUsers();
  if (listErr) throw listErr;
  const authUser = list?.users?.find((u) => u.email === EMAIL);
  if (!authUser) {
    console.error(`❌ Compte ${EMAIL} introuvable.`);
    process.exit(1);
  }

  const { error: updErr } = await supabase
    .from('users')
    .update({ type: 'service_client', updated_at: new Date().toISOString() })
    .eq('id', authUser.id);

  if (updErr) {
    console.error('❌ Mise à jour échouée:', updErr.message);
    if (updErr.message.includes('invalid input value for enum')) {
      console.error("   ℹ️  L'enum user_type ne contient pas 'service_client'. Appliquez la migration qui l'ajoute.");
    }
    process.exit(1);
  }

  const { data: check } = await supabase.from('users').select('email, type').eq('id', authUser.id).single();
  console.log(`✅ ${check.email} -> type = ${check.type}`);
  console.log('   Le compte atterrira désormais sur /(service-client)/(tabs).');
}

main().catch((e) => { console.error('❌', e.message || e); process.exit(1); });
