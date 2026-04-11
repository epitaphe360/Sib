// Script Node.js pour importer les exposants mock dans Supabase
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { randomUUID } from 'crypto';
dotenv.config();

// Support both SUPABASE_* and VITE_SUPABASE_* keys (project uses VITE_ prefix)
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error('Configurez SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY (ou VITE_SUPABASE_*) dans .env');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Copie des données mock
const mockExhibitors = [
  {
    id: '1',
    user_id: '1',
    company_name: 'Port Solutions Inc.',
    category: 'port-operations',
    sector: 'Port Management',
    description: 'Leading provider of integrated port management solutions, specializing in digital transformation and operational efficiency.',
    logo_url: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=200',
    website: 'https://portsolutions.com',
    verified: true,
    featured: true,
    contact_info: {
      email: 'contact@portsolutions.com',
      phone: '+33123456789',
      address: '456 Port Street',
      city: 'Le Havre',
      country: 'France'
    }
  },
  {
    id: '2',
    user_id: '2',
    company_name: 'Maritime Tech Solutions',
    category: 'port-industry',
    sector: 'Equipment Manufacturing',
    description: 'Innovative manufacturer of port equipment and automation systems for modern maritime facilities.',
    logo_url: 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=200',
    website: 'https://maritimetech.com',
    verified: true,
    featured: false,
    contact_info: {
      email: 'contact@maritimetech.com',
      phone: '+33123456789',
      address: '123 Industrial Zone',
      city: 'Marseille',
      country: 'France'
    }
  },
  {
    id: '3',
    user_id: '3',
    company_name: 'Global Port Authority',
    category: 'institutional',
    sector: 'Government',
    description: 'International organization promoting sustainable port development and maritime cooperation.',
    logo_url: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=200',
    website: 'https://globalportauthority.org',
    verified: true,
    featured: true,
    contact_info: {
      email: 'contact@globalportauthority.org',
      phone: '+33123456789',
      address: '789 Government Plaza',
      city: 'Paris',
      country: 'France'
    }
  },
  {
    id: '4',
    user_id: '4',
    company_name: 'EcoPort Technologies',
    category: 'port-operations',
    sector: 'Green Technology',
    description: 'Pionnier des solutions portuaires durables et des technologies vertes pour la transition énergétique des ports.',
    logo_url: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=200',
    website: 'https://ecoport-tech.com',
    verified: true,
    featured: true,
    contact_info: {
      email: 'contact@ecoport-tech.com',
      phone: '+33123456789',
      address: '321 Green Tech Park',
      city: 'Lyon',
      country: 'France'
    }
  }
];

async function importExhibitors() {
  for (const exhibitor of mockExhibitors) {
    // Normalize IDs: ensure UUID format for user_id and exhibitor id
    const isUuid = (s) => typeof s === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
    if (!isUuid(exhibitor.user_id)) {
      const newUid = randomUUID();
      console.log(`Generated user UUID for imported exhibitor ${exhibitor.company_name}: ${newUid}`);
      exhibitor.user_id = newUid;
    }
    if (!isUuid(exhibitor.id)) {
      const newExhId = randomUUID();
      console.log(`Generated exhibitor UUID for imported exhibitor ${exhibitor.company_name}: ${newExhId}`);
      exhibitor.id = newExhId;
    }
    // Ensure a user exists for this exhibitor.
    // Strategy: if exhibitor provides an email, try to find an existing user by email.
    // If found, use that user's id; if not, create a new user with exhibitor.user_id.
    const email = exhibitor.contact_info?.email || null;
    try {
      if (email) {
        const { data: existingByEmail, error: lookupErr } = await supabase
          .from('users')
          .select('id')
          .eq('email', email)
          .maybeSingle();
        if (lookupErr) {
          console.warn('Warning looking up user by email', lookupErr.message || lookupErr);
        }
        if (existingByEmail && existingByEmail.id) {
          exhibitor.user_id = existingByEmail.id;
          console.log('Using existing user id for', exhibitor.company_name, exhibitor.user_id);
        } else {
          // Create a new user record with the exhibitor.user_id
          const userRecord = {
            id: exhibitor.user_id,
            email,
            name: exhibitor.company_name,
            type: 'exhibitor',
            profile: {}
          };
          const { error: insertErr } = await supabase.from('users').insert(userRecord);
          if (insertErr) {
            // Handle race: another process may have created user with the same email.
            console.warn('Insert user error, attempting to recover by re-looking up email', insertErr.message || insertErr);
            const { data: recovered, error: recoveredErr } = await supabase
              .from('users')
              .select('id')
              .eq('email', email)
              .maybeSingle();
            if (recovered && recovered.id) {
              exhibitor.user_id = recovered.id;
              console.log('Recovered existing user id after insert conflict for', exhibitor.company_name, exhibitor.user_id);
            } else {
              console.warn('Unable to recover user after insert error for', exhibitor.company_name, insertErr.message || insertErr);
            }
          } else {
            console.log('Created user for', exhibitor.company_name, exhibitor.user_id);
          }
        }
      } else {
        // No email: ensure a user row exists by upserting by id
        const { error: upsertErr } = await supabase.from('users').upsert(
          { id: exhibitor.user_id, name: exhibitor.company_name, type: 'exhibitor', profile: {} },
          { onConflict: 'id' }
        );
        if (upsertErr) {
          console.warn('Upsert user by id warning for', exhibitor.company_name, upsertErr.message || upsertErr);
        } else {
          console.log('Ensured user (by id) for', exhibitor.company_name);
        }
      }
    } catch (uErr) {
      console.error('Erreur lors de la gestion utilisateur:', uErr?.message || uErr);
    }
    // Conversion des dates pour miniSite si présent
    if (exhibitor.miniSite && exhibitor.miniSite.lastUpdated instanceof Date) {
      exhibitor.miniSite.lastUpdated = exhibitor.miniSite.lastUpdated.toISOString();
    }
    // Insérer l'exposant
    const { error: exhibitorError } = await supabase
      .from('exhibitors')
      .upsert(exhibitor, { onConflict: 'id' });
    if (exhibitorError) {
      console.error('Erreur lors de l\'insertion exposant:', exhibitorError);
    }
  }
  console.log('✅ Import terminé. Les exposants mock sont maintenant des données réelles.');
}

importExhibitors().catch(console.error);

// Assurez-vous d'avoir installé les dépendances nécessaires avec npm
// npm install @supabase/supabase-js dotenv
