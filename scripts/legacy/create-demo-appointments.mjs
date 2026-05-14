import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// ID de l'entrée exhibitors de Gold Batiment Alliance (FK vers exhibitors table)
const EXHIBITOR_ID = '6d2e9d3e-42c4-4c7c-a5ad-a200cc0910da';

// Visiteurs qui demandent des RDV (exposants demo)
const visitors = [
  { id: 'b4a12ab2-db14-407c-b965-e4eb69918e93', name: 'Grand Chantier Expo', msg: 'Nous aimerions explorer des opportunites de collaboration sur le marche marocain.', status: 'pending' },
  { id: '23740f72-5876-4ef6-bce2-3c77882e772c', name: 'Atlas Build Systems', msg: 'Interesses par vos solutions de financement pour nos projets de construction.', status: 'pending' },
  { id: 'efe5066a-e95e-4cbe-a943-2729ba2bb8e9', name: 'Beton Tech Solutions', msg: 'Nous cherchons a rencontrer vos equipes pour nos innovations beton.', status: 'confirmed' },
];

// Recuperer les time_slots existants
const { data: slots, error: slotsError } = await supabase
  .from('time_slots')
  .select('id, start_time, exhibitor_id')
  .eq('exhibitor_id', EXHIBITOR_ID)
  .eq('available', true)
  .limit(10);

if (slotsError) {
  console.error('Erreur time_slots:', JSON.stringify(slotsError, null, 2));
  process.exit(1);
}

console.log('Time slots disponibles:', slots?.length);

// Prendre des slots differents (eviter le premier deja utilise pour le test)
const slotsToUse = slots?.slice(1) || [];

if (slotsToUse.length < visitors.length) {
  console.error('Pas assez de créneaux. Trouves:', slotsToUse.length, '/ besoin:', visitors.length);
  process.exit(1);
}

const appointments = visitors.map((v, i) => ({
  exhibitor_id: EXHIBITOR_ID,
  visitor_id: v.id,
  time_slot_id: slotsToUse[i].id,
  status: v.status,
  message: v.msg,
  meeting_type: 'in-person',
  created_at: new Date(Date.now() - i * 3600000).toISOString(),
}));

const { data, error } = await supabase.from('appointments').insert(appointments).select('id, exhibitor_id, visitor_id, status');
if (error) {
  console.error('ERREUR insertion:', JSON.stringify(error, null, 2));
} else {
  console.log('SUCCESS - Rendez-vous crees:', JSON.stringify(data, null, 2));
}

// Vérifier le total
const { count } = await supabase.from('appointments').select('*', { count: 'exact', head: true });
console.log('Total appointments en DB:', count);
