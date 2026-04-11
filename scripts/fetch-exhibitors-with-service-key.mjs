#!/usr/bin/env node
// Récupère les exposants depuis Supabase en utilisant une clef service_role (server-side only).
// Usage: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in environment, puis run: node scripts/fetch-exhibitors-with-service-key.mjs

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('Erreur: définissez SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY en variables d\'environnement.');
  console.error('Exemple PowerShell: $env:SUPABASE_URL="https://..."; $env:SUPABASE_SERVICE_ROLE_KEY="sbp_..."; node scripts/fetch-exhibitors-with-service-key.mjs');
  process.exit(1);
}

const endpoint = `${url.replace(/\/$/, '')}/rest/v1/exhibitors?select=id,user_id,company_name,category,sector,description,logo_url,website,verified,featured,contact_info&limit=20`;

(async () => {
  try {
    const res = await fetch(endpoint, {
      method: 'GET',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        Accept: 'application/json'
      }
    });

    const text = await res.text();

    if (!res.ok) {
      console.error('Requête échouée: ', res.status, res.statusText);
      try { console.error('Détails:', JSON.parse(text)); } catch { console.error(text); }
      process.exit(1);
    }

    let data;
    try { data = JSON.parse(text); } catch (e) { data = text; }
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Erreur réseau ou erreur inattendue:', err.message || err);
    process.exit(1);
  }
})();
