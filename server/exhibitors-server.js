/* Minimal exhibitors server for public access
   Usage: set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, EXHIBITORS_SECRET and run:
     node server/exhibitors-server.js
*/

const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
const crypto = require('crypto');

const PORT = process.env.EXHIBITORS_PORT || 4002;
const NODE_ENV = process.env.NODE_ENV || 'development';
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const EXHIBITORS_SECRET = process.env.EXHIBITORS_SECRET || process.env.VITE_EXHIBITORS_SECRET;

// Validate Supabase configuration
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ FATAL: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in environment');
  process.exit(1);
}

// Validate EXHIBITORS_SECRET
if (!EXHIBITORS_SECRET || EXHIBITORS_SECRET === 'dev-secret' || EXHIBITORS_SECRET.length < 32) {
  if (NODE_ENV === 'production') {
    console.error('❌ FATAL: EXHIBITORS_SECRET must be set in production');
    console.error('   EXHIBITORS_SECRET must be at least 32 characters long');
    console.error('   Generate with: openssl rand -hex 32');
    console.error('   NEVER use "dev-secret" in production!');
    process.exit(1);
  }
  console.warn('⚠️  WARNING: EXHIBITORS_SECRET not set or using default "dev-secret"');
  console.warn('   Generate a secure key with: openssl rand -hex 32');
}

const EFFECTIVE_SECRET = EXHIBITORS_SECRET || crypto.randomBytes(32).toString('hex');

// CORS Configuration
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:5000', 'http://localhost:3000'];

if (NODE_ENV === 'production' && !process.env.ALLOWED_ORIGINS) {
  console.error('❌ FATAL: ALLOWED_ORIGINS environment variable is required in production');
  console.error('   Example: ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const app = express();
app.use(cors({
  origin: ALLOWED_ORIGINS,
  credentials: true,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-exhibitors-secret'],
}));
app.use(express.json({ limit: '1mb' }));

app.get('/exhibitors', async (req, res) => {
  // Use Authorization header instead of query parameter for security
  const authHeader = req.headers.authorization || req.headers['x-exhibitors-secret'];
  const secret = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;

  if (secret !== EFFECTIVE_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { data: exhibitors, error } = await supabase
      .from('exhibitors')
      .select('*, user:users(*), products(*), mini_site:mini_sites(*)')
      .eq('verified', true); // Only show verified exhibitors

    if (error) {
      throw error;
    }

    res.json({ exhibitors });
  } catch (err) {
    console.error('Error fetching exhibitors:', err);
    res.status(500).json({ error: 'Error fetching exhibitors' });
  }
});

app.listen(PORT, () => {
  console.log(`Exhibitors server listening on http://localhost:${PORT}`);
});
