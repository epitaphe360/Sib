// create-mini-site.js
// Endpoint Express pour créer un mini-site en utilisant la clé de service Supabase.
// Usage: définir SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans l'environnement.

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PORT = process.env.PORT || 4000;
const NODE_ENV = process.env.NODE_ENV || 'development';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
  process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// SECURITY: Strict CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// SECURITY: Reduced payload size from 10mb to 1mb
app.use(bodyParser.json({ limit: '1mb' }));

// Authentication middleware
async function authenticate(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized - Token required' });
  }

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: 'Unauthorized - Invalid token' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized - Authentication failed' });
  }
}

// Rate limiting
const rateLimitMap = new Map();
function rateLimit(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + 60000 });
    return next();
  }
  const data = rateLimitMap.get(ip);
  if (now > data.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + 60000 });
    return next();
  }
  if (data.count >= 10) { // 10 mini-sites per minute max
    return res.status(429).json({ error: 'Too many requests' });
  }
  data.count++;
  next();
}

// Input validation middleware
function validateMiniSiteInput(req, res, next) {
  const { company, description, logoUrl, products, socials, documents, exhibitorId } = req.body;

  if (!company && !exhibitorId) {
    return res.status(400).json({ error: 'company or exhibitorId required' });
  }

  // Validate company name
  if (company && (typeof company !== 'string' || company.length > 200)) {
    return res.status(400).json({ error: 'Invalid company name' });
  }

  // Validate description
  if (description && (typeof description !== 'string' || description.length > 5000)) {
    return res.status(400).json({ error: 'Description too long (max 5000 chars)' });
  }

  // Validate URL format
  if (logoUrl && typeof logoUrl === 'string') {
    try {
      const url = new URL(logoUrl);
      if (!['http:', 'https:'].includes(url.protocol)) {
        return res.status(400).json({ error: 'Invalid logo URL protocol' });
      }
    } catch {
      return res.status(400).json({ error: 'Invalid logo URL format' });
    }
  }

  // Validate products array
  if (products && (!Array.isArray(products) || products.length > 100)) {
    return res.status(400).json({ error: 'Invalid products array' });
  }

  next();
}

app.post('/create-mini-site', authenticate, rateLimit, validateMiniSiteInput, async (req, res) => {
  try {
    const { company, description, logoUrl, products, socials, documents, exhibitorId, userId } = req.body;
    if (!company && !exhibitorId) {
      return res.status(400).json({ success: false, error: 'company or exhibitorId required' });
    }

    let finalExhibitorId = exhibitorId || null;

    if (!finalExhibitorId) {
      // Create exhibitor (service role can do this regardless of RLS)
      const exhibitorInsert = {
        company_name: company || 'Sans nom',
        description: description || null,
        logo_url: logoUrl || null,
        contact_info: {},
      };
      if (userId) exhibitorInsert.user_id = userId;

      const { data: exData, error: exErr } = await supabaseAdmin
        .from('exhibitors')
        .insert([exhibitorInsert])
        .select()
        .single();

      if (exErr) throw exErr;
      finalExhibitorId = exData.id;
    }

    const sections = [
      { type: 'hero', content: { title: company, subtitle: description, backgroundImage: logoUrl } },
      { type: 'products', content: { products } },
      { type: 'socials', content: { socials } },
      { type: 'documents', content: { documents } },
    ];

    const miniSiteInsert = {
      exhibitor_id: finalExhibitorId,
      theme: 'default',
      custom_colors: {
        primary: '#1e40af',
        secondary: '#3b82f6',
        accent: '#60a5fa',
        fontFamily: 'Inter'
      },
      sections,
      published: false,
      views: 0,
      last_updated: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    const { data: msData, error: msErr } = await supabaseAdmin
      .from('mini_sites')
      .insert([miniSiteInsert])
      .select()
      .single();

    if (msErr) throw msErr;

    return res.json({ success: true, miniSite: msData, exhibitorId: finalExhibitorId });
  } catch (err) {
    console.error('create-mini-site error:', err);
    return res.status(500).json({ success: false, error: (err && err.message) || String(err) });
  }
});

app.listen(PORT, () => console.log(`create-mini-site server listening on ${PORT}`));
