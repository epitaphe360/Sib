/* Minimal metrics server for development
   Usage: set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, METRICS_SECRET and run:
     node server/metrics-server.js
*/

const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const PORT = process.env.PORT || 4001;
const NODE_ENV = process.env.NODE_ENV || 'development';
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const METRICS_SECRET = process.env.METRICS_SECRET || process.env.VITE_METRICS_SECRET;

// Validate Supabase configuration
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ FATAL: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in environment');
  process.exit(1);
}

// Validate METRICS_SECRET
if (!METRICS_SECRET || METRICS_SECRET === 'dev-secret' || METRICS_SECRET.length < 32) {
  if (NODE_ENV === 'production') {
    console.error('❌ FATAL: METRICS_SECRET must be set in production');
    console.error('   METRICS_SECRET must be at least 32 characters long');
    console.error('   Generate with: openssl rand -hex 32');
    console.error('   NEVER use "dev-secret" in production!');
    process.exit(1);
  }
  console.warn('⚠️  WARNING: METRICS_SECRET not set or using default "dev-secret"');
  console.warn('   Generate a secure key with: openssl rand -hex 32');
}

const EFFECTIVE_SECRET = METRICS_SECRET || crypto.randomBytes(32).toString('hex');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const app = express();
app.use(express.json({ limit: '1mb' }));

app.get('/metrics', async (req, res) => {
  // Use Authorization header instead of query parameter for security
  const authHeader = req.headers.authorization || req.headers['x-metrics-secret'];
  const secret = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;

  if (secret !== EFFECTIVE_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const [
      usersResult,
      activeUsersResult,
      exhibitorsResult,
      partnersResult,
      visitorsResult,
      eventsResult,
      pendingValidationsResult,
      activeContractsResult,
      contentModerationsResult
    ] = await Promise.all([
      supabase.from('users').select('id', { count: 'exact', head: true }),
      supabase.from('users').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('exhibitors').select('id', { count: 'exact', head: true }).eq('verified', true),
      supabase.from('users').select('id', { count: 'exact', head: true }).eq('type', 'partner'),
      supabase.from('users').select('id', { count: 'exact', head: true }).eq('type', 'visitor'),
      supabase.from('events').select('id', { count: 'exact', head: true }),
      supabase.from('exhibitors').select('id', { count: 'exact', head: true }).eq('verified', false),
      supabase.from('exhibitors').select('id', { count: 'exact', head: true }).eq('featured', true),
      supabase.from('mini_sites').select('id', { count: 'exact', head: true }).eq('published', false)
    ]);

    const metrics = {
      totalUsers: usersResult.count || 0,
      activeUsers: activeUsersResult.count || 0,
      totalExhibitors: exhibitorsResult.count || 0,
      totalPartners: partnersResult.count || 0,
      totalVisitors: visitorsResult.count || 0,
      totalEvents: eventsResult.count || 0,
      pendingValidations: pendingValidationsResult.count || 0,
      activeContracts: activeContractsResult.count || 0,
      contentModerations: contentModerationsResult.count || 0
    };

    res.json({ metrics });
  } catch (err) {
    console.error('Error fetching metrics:', err);
    res.status(500).json({ error: 'Error fetching metrics' });
  }
});

app.listen(PORT, () => {
  console.log(`Metrics server listening on http://localhost:${PORT}`);
});
