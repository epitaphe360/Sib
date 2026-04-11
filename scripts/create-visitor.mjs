import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load .env then .env.local (if present)
dotenv.config();
dotenv.config({ path: '.env.local', override: true });

const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
let serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '').trim();
// Remove accidental surrounding quotes
if ((serviceKey.startsWith('"') && serviceKey.endsWith('"')) || (serviceKey.startsWith("'") && serviceKey.endsWith("'"))) {
  serviceKey = serviceKey.slice(1, -1).trim();
}

if (!url || !serviceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment');
  process.exit(1);
}

console.log('Supabase target:', url);
console.log('Service key length:', serviceKey ? serviceKey.length : 0);

// Decode JWT payload to check claims and potential project ref mismatch
function decodeJwtPayload(token) {
  try {
    const [, payloadB64url] = token.split('.');
    if (!payloadB64url) return null;
    const b64 = payloadB64url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
    const json = Buffer.from(padded, 'base64').toString('utf8');
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
}

const payload = decodeJwtPayload(serviceKey);
if (payload) {
  const subdomain = url.replace(/^https?:\/\//, '').split('.')[0];
  console.log('Service key JWT payload role:', payload.role);
  if (payload.ref) console.log('Service key project ref:', payload.ref, '(URL ref:', subdomain + ')');
  if (payload.project_id) console.log('Service key project_id:', payload.project_id);
  if (payload.ref && payload.ref !== subdomain) {
    console.warn('WARNING: Service key ref does not match URL project ref. This key likely belongs to a different project.');
  }
} else {
  console.warn('Could not decode service key payload (non-JWT or malformed).');
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const visitor = {
  email: process.env.VISITOR_EMAIL || 'visitor.real@siports.com',
  name: process.env.VISITOR_NAME || 'Real Visitor',
  type: 'visitor',
  profile: {
    firstName: 'Real',
    lastName: 'Visitor',
    company: 'Visitor Co.',
    position: 'Attendee',
    country: 'Morocco',
    bio: 'Created via script',
    interests: ['Networking'],
    objectives: ['Meet exhibitors']
  }
};

async function main() {
  try {
    // Upsert by email to avoid duplicates
    const { data, error } = await supabase
      .from('users')
      .upsert({
        email: visitor.email,
        name: visitor.name,
        type: visitor.type,
        profile: visitor.profile
      }, { onConflict: 'email' })
      .select('*')
      .single();

    if (error) throw error;
    console.log('Created/updated user:', data);
  } catch (e) {
    console.error('Failed to create visitor:', e);
    process.exit(1);
  }
}

main();
