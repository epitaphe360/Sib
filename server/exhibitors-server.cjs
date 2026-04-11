/* Minimal exhibitors server for public access
   Usage: set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, EXHIBITORS_SECRET and run:
     npm run exhibitors-server
*/

// Charge les variables d'environnement depuis .env.local et .env à la racine, de manière robuste
const path = require('path');
try { require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') }); } catch (_) {}
try { require('dotenv').config({ path: path.resolve(__dirname, '../.env') }); } catch (_) {}

const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');

// Align default port with frontend fallback (see useExhibitorStore)
function parsePort(val, fallback) {
  const n = parseInt(String(val ?? ''), 10);
  return Number.isFinite(n) && n > 0 && n < 65536 ? n : fallback;
}
const DEFAULT_PORT = parsePort(process.env.EXHIBITORS_PORT, 4002);
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const EXHIBITORS_SECRET = process.env.EXHIBITORS_SECRET || process.env.VITE_EXHIBITORS_SECRET || 'dev-secret';

const HAS_SUPABASE_CREDS = Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
if (!HAS_SUPABASE_CREDS) {
  console.warn('[exhibitors-server] SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY not set. Server will start but return 503 until configured.');
}

const supabase = HAS_SUPABASE_CREDS ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) : null;
const app = express();
app.use(cors()); // Enable CORS for all routes
app.use(express.json());

app.get('/exhibitors', async (req, res) => {
  const secret = req.headers['x-exhibitors-secret'] || req.query.secret;
  if (secret !== EXHIBITORS_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    if (!HAS_SUPABASE_CREDS || !supabase) {
      return res.status(503).json({ error: 'Supabase not configured on server' });
    }
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

// Health route and config introspection (safe subset)
app.get('/health', (_req, res) => res.json({ ok: true }));
app.get('/config', (_req, res) => {
  res.json({
    ok: true,
    port: DEFAULT_PORT,
    supabaseConfigured: HAS_SUPABASE_CREDS,
    supabaseUrlHost: SUPABASE_URL ? new URL(SUPABASE_URL).host : null
  });
});

// Helper to start server with fallback if port is busy
function start(port, attemptsLeft = 15) {
  const server = app.listen(port, () => {
    console.log(`Exhibitors server listening on http://localhost:${port}`);
    if (!HAS_SUPABASE_CREDS) {
      console.warn('[exhibitors-server] Supabase not configured. /exhibitors will return 503 until SUPABASE_URL and SERVICE_ROLE_KEY are set.');
    }
  });
  server.on('error', (err) => {
    const code = err && err.code;
    if ((code === 'EADDRINUSE' || code === 'EACCES') && attemptsLeft > 0) {
      const nextPort = (Number(port) || 4002) + 1;
      console.warn(`Port ${port} unavailable (${code}). Trying ${nextPort}...`);
      start(nextPort, attemptsLeft - 1);
    } else {
      console.error('Failed to start exhibitors server:', err);
      process.exit(1);
    }
  });
}

start(DEFAULT_PORT || 4002);
