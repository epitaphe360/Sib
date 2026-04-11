import express from 'express';
import bodyParser from 'body-parser';
import { execFile, execFileSync } from 'child_process';
import path from 'path';
import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import fs from 'fs';

const app = express();
app.use(bodyParser.json());

// Configuration du système de logs
const LOG_DIR = path.resolve(process.cwd(), 'server', 'ai-agent', 'logs');
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Fonction de logging
function log(level, message, data = {}) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    ...data
  };
  
  // Log dans la console
  console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`, data);
  
  // Log dans un fichier
  const logFile = path.join(LOG_DIR, `${new Date().toISOString().split('T')[0]}.log`);
  fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n', 'utf8');
  
  // Log dans Supabase si configuré
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const supabase = createClient(
        process.env.SUPABASE_URL, 
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        { auth: { persistSession: false } }
      );
      
      supabase.from('scraping_logs').insert([{
        level,
        message,
        data: JSON.stringify(data),
        created_at: timestamp
      }]).then(({ error }) => {
        if (error) console.warn('Failed to log to Supabase:', error.message);
      });
    } catch (e) {
      // Ignore si Supabase n'est pas disponible
    }
  }
}

// Expose a server-side helper that other server processes can call via globalThis.__runLocalAiCliFallback
globalThis.__runLocalAiCliFallback = async function (websiteUrl) {
  try {
    const scriptPath = path.resolve(process.cwd(), 'scripts', 'ai_generate_minisite.mjs');
    const stdout = execFileSync(process.execPath, [scriptPath, websiteUrl], { encoding: 'utf8', timeout: 30000 });
    if (!stdout) return null;
    try {
      return JSON.parse(stdout);
    } catch (e) {
      log('warn', 'Global CLI fallback produced invalid JSON', { error: e.message, stdout });
      return null;
    }
  } catch (err) {
    log('error', 'Global CLI fallback error', { error: err?.message || err });
    return null;
  }
};

// Simple CORS + API key protection middleware
app.use((req, res, next) => {
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:3000').split(',');
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-ai-agent-key');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS, GET');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// Endpoint de health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
});

// Endpoint de statistiques
app.get('/stats', (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const logFile = path.join(LOG_DIR, `${today}.log`);
    
    if (!fs.existsSync(logFile)) {
      return res.json({ total: 0, success: 0, errors: 0 });
    }
    
    const logs = fs.readFileSync(logFile, 'utf8')
      .split('\n')
      .filter(Boolean)
      .map(line => JSON.parse(line));
    
    const stats = {
      total: logs.filter(l => l.message === 'Scraping request received').length,
      success: logs.filter(l => l.message === 'Scraping completed successfully').length,
      errors: logs.filter(l => l.level === 'error').length,
      avgDuration: 0
    };
    
    const durations = logs
      .filter(l => l.data && l.data.duration)
      .map(l => l.data.duration);
    
    if (durations.length > 0) {
      stats.avgDuration = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);
    }
    
    res.json(stats);
  } catch (error) {
    log('error', 'Failed to get stats', { error: error.message });
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

app.post('/generate', async (req, res) => {
  const startTime = Date.now();
  const requestId = crypto.randomBytes(8).toString('hex');
  
  // Authentication
  const requiredKey = process.env.AI_AGENT_KEY || null;
  if (requiredKey) {
    const incoming = req.headers['x-ai-agent-key'] || req.headers['x-ai-agent-key'.toLowerCase()];
    if (!incoming || String(incoming) !== String(requiredKey)) {
      log('warn', 'Unauthorized request', { requestId, ip: req.ip });
      return res.status(401).json({ error: 'unauthorized' });
    }
  }
  
  const { url } = req.body || {};
  if (!url) {
    log('warn', 'Missing URL parameter', { requestId });
    return res.status(400).json({ error: 'url required' });
  }

  log('info', 'Scraping request received', { requestId, url, ip: req.ip });

  const scriptPath = path.resolve(process.cwd(), 'scripts', 'ai_generate_minisite.mjs');
  
  execFile(process.execPath, [scriptPath, url], { timeout: 30000 }, async (err, stdout, stderr) => {
    if (err) {
      const duration = Date.now() - startTime;
      log('error', 'Scraping failed', { 
        requestId, 
        url, 
        error: err.message, 
        stderr,
        duration 
      });
      return res.status(500).json({ 
        error: 'agent failed', 
        detail: stderr || err.message,
        requestId 
      });
    }
    
    try {
      let payload = JSON.parse(stdout);

      // Optional enrichment via external Groq-like API
      const groqKey = process.env.GROQ_API_KEY;
      const groqUrl = process.env.GROQ_API_URL;
      if (groqKey && groqUrl) {
        try {
          log('info', 'Attempting Groq enrichment', { requestId });
          const r = await fetch(groqUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${groqKey}`
            },
            body: JSON.stringify({ url, payload })
          });
          if (r.ok) {
            const enriched = await r.json();
            payload = enriched.payload || enriched;
            log('info', 'Groq enrichment successful', { requestId });
          } else {
            log('warn', 'Groq enrichment failed', { requestId, status: r.status });
          }
        } catch (e) {
          log('warn', 'Groq enrichment error', { requestId, error: e?.message });
        }
      }

      // Optional OpenAI enrichment
      const OPENAI_KEY = process.env.OPENAI_API_KEY;
      if (OPENAI_KEY) {
        try {
          log('info', 'Attempting OpenAI enrichment', { requestId });
          const systemPrompt = `You are a helpful assistant that transforms a scraped mini-site payload into a richer JSON payload suitable for the application's mini_sites model. Return only valid JSON. Preserve keys you don't change.`;
          const userPrompt = `Input payload:\n${JSON.stringify(payload, null, 2)}\n\nReturn a JSON object that may add or replace a top-level "sections" array (each section must have a title and content) and may enrich product descriptions. Keep keys: company, logo, description, products, contacts, sections.`;

          const openaiResp = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${OPENAI_KEY}`
            },
            body: JSON.stringify({
              model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
              ],
              temperature: 0.7,
              max_tokens: 800
            })
          });

          if (openaiResp.ok) {
            const j = await openaiResp.json();
            const text = j.choices?.[0]?.message?.content;
            if (text) {
              try {
                const enriched = JSON.parse(text);
                payload = Object.assign({}, payload, enriched);
                log('info', 'OpenAI enrichment successful', { requestId });
              } catch (e) {
                log('warn', 'OpenAI returned non-JSON', { requestId });
              }
            }
          } else {
            log('warn', 'OpenAI enrichment failed', { requestId, status: openaiResp.status });
          }
        } catch (e) {
          log('warn', 'OpenAI enrichment error', { requestId, error: e?.message });
        }
      }

      // Optional image upload to Supabase Storage
      const SUPABASE_URL = process.env.SUPABASE_URL;
      const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
      const SUPABASE_BUCKET = process.env.SUPABASE_BUCKET || 'mini-sites';
      
      if (SUPABASE_URL && SUPABASE_KEY) {
        try {
          log('info', 'Attempting image upload to Supabase', { requestId });
          const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });

          const isImageUrl = (u) => typeof u === 'string' && /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i.test(u);

          const downloaded = new Map();
          let uploadedCount = 0;
          
          async function replaceImages(obj) {
            if (!obj || typeof obj !== 'object') return obj;
            if (Array.isArray(obj)) {
              for (let i = 0; i < obj.length; i++) {
                obj[i] = await replaceImages(obj[i]);
              }
              return obj;
            }
            for (const k of Object.keys(obj)) {
              const v = obj[k];
              if (typeof v === 'string' && isImageUrl(v)) {
                const remote = v;
                if (downloaded.has(remote)) {
                  obj[k] = downloaded.get(remote);
                  continue;
                }
                try {
                  const r = await fetch(remote, { timeout: 20000 });
                  if (!r.ok) throw new Error('failed to download image ' + r.status);
                  const buffer = await r.buffer();
                  const extMatch = remote.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
                  const ext = extMatch ? extMatch[1] : 'jpg';
                  const hash = crypto.createHash('sha1').update(remote).digest('hex').slice(0, 12);
                  const filename = `${Date.now()}-${hash}.${ext}`;
                  const destPath = `mini-sites/${filename}`;
                  const up = await supabase.storage.from(SUPABASE_BUCKET).upload(destPath, buffer, { 
                    contentType: r.headers.get('content-type') || `image/${ext}`, 
                    upsert: true 
                  });
                  if (up.error) {
                    log('warn', 'Supabase upload error', { requestId, error: up.error.message });
                    obj[k] = remote;
                    downloaded.set(remote, remote);
                  } else {
                    const pub = supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(destPath);
                    const publicUrl = pub?.data?.publicUrl || remote;
                    obj[k] = publicUrl;
                    downloaded.set(remote, publicUrl);
                    uploadedCount++;
                  }
                } catch (e) {
                  log('warn', 'Image download/upload error', { requestId, error: e?.message, url: remote });
                  obj[k] = v;
                }
              } else if (typeof v === 'object' && v !== null) {
                obj[k] = await replaceImages(v);
              }
            }
            return obj;
          }

          payload = await replaceImages(payload);
          log('info', 'Image upload complete', { requestId, uploadedCount });
        } catch (e) {
          log('warn', 'Supabase image upload error', { requestId, error: e?.message });
        }
      }

      const duration = Date.now() - startTime;
      log('info', 'Scraping completed successfully', { 
        requestId, 
        url, 
        duration,
        productsFound: payload.stats?.productsFound || 0,
        imagesFound: payload.stats?.imagesFound || 0
      });
      
      return res.json(payload);
    } catch (e) {
      const duration = Date.now() - startTime;
      log('error', 'Invalid agent output', { requestId, error: e.message, duration });
      return res.status(500).json({ 
        error: 'invalid agent output', 
        detail: stdout,
        requestId 
      });
    }
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  log('info', 'AI agent server started', { port: PORT });
  console.log(`AI agent listening on http://localhost:${PORT}`);
});
