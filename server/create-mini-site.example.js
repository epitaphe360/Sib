// Exemple d'endpoint serveur pour créer un mini-site en utilisant la clé de service Supabase (service_role)
// NE JAMAIS committer une vraie clé service dans le code public.

// Dépendances : npm i express node-fetch @supabase/supabase-js

const express = require('express');
const bodyParser = require('body-parser');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(bodyParser.json());

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // mise en variable d'env

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Configure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

app.post('/create-mini-site', async (req, res) => {
  try {
    const { company, description, logoUrl, products, socials, documents } = req.body;

    // Créer un exhibitor minimal (ou utiliser un existant si tu as une clé pour lier)
    const { data: ex, error: exErr } = await supabaseAdmin
      .from('exhibitors')
      .insert([{ company_name: company || 'Sans nom', description, logo_url: logoUrl, contact_info: {} }])
      .select()
      .single();
    if (exErr) throw exErr;

    const sections = [
      { type: 'hero', content: { company, description, logo: logoUrl } },
      { type: 'products', content: { products } },
      { type: 'socials', content: { socials } },
      { type: 'documents', content: { documents } },
    ];

    const { data: ms, error: msErr } = await supabaseAdmin
      .from('mini_sites')
      .insert([
        { exhibitor_id: ex.id, theme: 'default', custom_colors: {}, sections, published: false, views: 0, last_updated: new Date().toISOString(), created_at: new Date().toISOString() }
      ])
      .select();
    if (msErr) throw msErr;

    res.json({ success: true, miniSite: ms });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message || String(err) });
  }
});

app.listen(4000, () => console.log('Example create-mini-site server listening on 4000'));
