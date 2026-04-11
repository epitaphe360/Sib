import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Charger les variables d'environnement
dotenv.config({ path: join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const fixFunction = `
CREATE OR REPLACE FUNCTION book_appointment_atomic(
  p_time_slot_id UUID,
  p_visitor_id UUID,
  p_exhibitor_id UUID,
  p_notes TEXT DEFAULT NULL,
  p_meeting_type meeting_type DEFAULT 'in-person'
) RETURNS JSONB AS $$
DECLARE
  v_current_bookings INTEGER;
  v_max_bookings INTEGER;
  v_appointment_id UUID;
  v_new_current_bookings INTEGER;
  v_available BOOLEAN;
BEGIN
  -- Lock the time_slot row for update to prevent concurrent access
  SELECT current_bookings, max_bookings
  INTO v_current_bookings, v_max_bookings
  FROM time_slots
  WHERE id = p_time_slot_id
  FOR UPDATE;

  -- Check if time slot exists
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Créneau horaire introuvable'
    );
  END IF;

  -- Check availability
  IF v_current_bookings >= v_max_bookings THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Ce créneau est complet'
    );
  END IF;

  -- Check if visitor already has an appointment for this slot
  IF EXISTS (
    SELECT 1 FROM appointments
    WHERE time_slot_id = p_time_slot_id
    AND visitor_id = p_visitor_id
    AND status != 'cancelled'
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Vous avez déjà réservé ce créneau'
    );
  END IF;

  -- Insert appointment avec statut PENDING (demande visiteur)
  -- L'exposant/partenaire devra confirmer le RDV ensuite
  INSERT INTO appointments (
    time_slot_id,
    visitor_id,
    exhibitor_id,
    notes,
    status,
    meeting_type,
    created_at
  ) VALUES (
    p_time_slot_id,
    p_visitor_id,
    p_exhibitor_id,
    p_notes,
    'pending',
    p_meeting_type,
    NOW()
  )
  RETURNING id INTO v_appointment_id;

  -- Calculate new values
  v_new_current_bookings := v_current_bookings + 1;
  v_available := v_new_current_bookings < v_max_bookings;

  -- Increment current_bookings and update availability
  UPDATE time_slots
  SET
    current_bookings = v_new_current_bookings,
    available = v_available,
    updated_at = NOW()
  WHERE id = p_time_slot_id;

  -- Return success with all required data
  RETURN jsonb_build_object(
    'success', true,
    'appointment_id', v_appointment_id,
    'current_bookings', v_new_current_bookings,
    'available', v_available
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
`;

console.log('🔧 Correction de la fonction book_appointment_atomic...');

const { error } = await supabase.rpc('exec_sql', { query: fixFunction }).catch(() => {
  // Si exec_sql n'existe pas, on tente directement via l'API REST
  return fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseServiceKey,
      'Authorization': `Bearer ${supabaseServiceKey}`,
    },
    body: JSON.stringify({ query: fixFunction })
  }).then(r => r.json());
});

if (error) {
  console.error('❌ Erreur:', error);
  console.log('\n📝 Veuillez exécuter manuellement dans le SQL Editor de Supabase:');
  console.log('\n' + fixFunction);
} else {
  console.log('✅ Fonction corrigée avec succès!');
}
