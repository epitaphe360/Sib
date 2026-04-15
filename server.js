/**
 * Production server with CORS support for Railway deployment
 * Includes email sending via SMTP (nodemailer)
 */
import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import fs from 'fs';

import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Use port 3000 in development, 5000 in production
const PORT = process.env.PORT || (process.env.NODE_ENV === 'production' ? 5000 : 3000);

// JSON body parser for API endpoints
app.use(express.json());

// Force HTTPS redirect + redirect bare domain to www (Railway SSL is on www only)
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    const host = req.headers.host;
    const proto = req.headers['x-forwarded-proto'] || 'http';
    
    // Redirect bare domain → www (SSL cert handling)
    if (host === 'sib2026.ma') {
      return res.redirect(301, `https://www.sib2026.ma${req.url}`);
    }
    // Redirect HTTP → HTTPS
    if (proto === 'http') {
      return res.redirect(301, `https://${host}${req.url}`);
    }
  }
  next();
});

// CORS middleware - Whitelist specific origins only
const allowedOrigins = [
  'http://localhost:5173', // Development
  'http://localhost:3000', // Development
  'http://localhost:9323', // Development Vite
  'https://sib2026.ma', // Production
  'https://www.sib2026.ma', // Production with www
  'https://app.sib2026.ma', // App subdomain
  // Vercel frontend URLs
  'https://sib.vercel.app',
  'https://sib-2026.vercel.app',
  // Railway deployment URL (auto-assigned)
];

app.use((req, res, next) => {
  const origin = req.headers.origin;

  // Check if origin is in whitelist
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
  }

  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Client-Info, Apikey');
  res.header('Access-Control-Max-Age', '86400');

  // Handle preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
});

// Security headers
app.use((req, res, next) => {
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  res.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  next();
});

// ============================================
// EMAIL CONFIGURATION (SMTP)
// ============================================
const smtpConfig = {
  host: process.env.SMTP_HOST || 'mail.sib2026.ma',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER || 'contact@sib2026.ma',
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false // Accept self-signed certificate from mail.sib2026.ma
  }
};

// Create reusable transporter (only if SMTP_PASS is configured)
let transporter = null;
if (process.env.SMTP_PASS) {
  transporter = nodemailer.createTransport(smtpConfig);
  console.log('📧 SMTP transporter configured for:', smtpConfig.host);
} else {
  console.warn('⚠️ SMTP_PASS not set - email sending disabled');
}

/**
 * API: Send Email
 * POST /api/send-email
 */
app.post('/api/send-email', async (req, res) => {
  if (!transporter) {
    return res.status(503).json({
      success: false,
      error: 'Email service not configured (SMTP_PASS missing)'
    });
  }

  try {
    const { to, subject, html, text, replyTo } = req.body;

    // Validation
    if (!to || !subject || (!html && !text)) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: to, subject, and html or text'
      });
    }

    const mailOptions = {
      from: `"SIB 2026" <${process.env.SMTP_USER || 'contact@sib2026.ma'}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
      replyTo: replyTo || process.env.SMTP_USER,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log('✅ Email sent:', { to, subject, messageId: info.messageId });

    res.json({
      success: true,
      messageId: info.messageId,
      message: 'Email sent successfully'
    });
  } catch (error) {
    console.error('❌ Email error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to send email'
    });
  }
});

/**
 * API: Contact Form
 * POST /api/contact
 */
app.post('/api/contact', async (req, res) => {
  if (!transporter) {
    return res.status(503).json({
      success: false,
      error: 'Email service not configured'
    });
  }

  try {
    const { firstName, lastName, email, company, subject, message } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const subjectLabels = {
      exhibitor: 'Devenir exposant',
      visitor: 'S\'inscrire comme visiteur',
      partnership: 'Partenariat',
      support: 'Support technique',
      other: 'Autre'
    };

    const subjectLabel = subjectLabels[subject] || subject;

    // Email to admin
    const adminEmail = {
      from: `"SIB 2026" <${process.env.SMTP_USER}>`,
      to: process.env.ADMIN_EMAIL || 'contact@sib2026.ma',
      replyTo: email,
      subject: `[Contact SIB] ${subjectLabel} - ${firstName} ${lastName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 20px; text-align: center;">
            <h1>Nouveau message de contact</h1>
          </div>
          <div style="padding: 20px; background: #f9fafb;">
            <p><strong>Nom:</strong> ${firstName} ${lastName}</p>
            <p><strong>Email:</strong> ${email}</p>
            ${company ? `<p><strong>Entreprise:</strong> ${company}</p>` : ''}
            <p><strong>Sujet:</strong> ${subjectLabel}</p>
            <div style="background: white; padding: 15px; border-left: 4px solid #3b82f6; margin-top: 15px;">
              <p><strong>Message:</strong></p>
              <p style="white-space: pre-wrap;">${message}</p>
            </div>
          </div>
        </div>
      `,
    };

    // Confirmation email to user
    const userEmail = {
      from: `"SIB 2026" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'SIB 2026 - Votre message a bien été reçu',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 20px; text-align: center;">
            <h1>✅ Message bien reçu !</h1>
          </div>
          <div style="padding: 20px; background: #f9fafb;">
            <p>Bonjour ${firstName},</p>
            <p>Nous avons bien reçu votre message concernant : <strong>${subjectLabel}</strong></p>
            <p>Notre équipe vous répondra dans les <strong>24 à 48 heures ouvrées</strong>.</p>
            <div style="background: white; padding: 15px; border-left: 4px solid #3b82f6; margin-top: 15px;">
              <p><strong>Votre message:</strong></p>
              <p style="white-space: pre-wrap;">${message}</p>
            </div>
            <p style="margin-top: 20px;">Cordialement,<br><strong>L'équipe SIB 2026</strong></p>
          </div>
        </div>
      `,
    };

    // Send both emails
    await Promise.all([
      transporter.sendMail(adminEmail),
      transporter.sendMail(userEmail),
    ]);

    console.log('✅ Contact emails sent:', { from: email, subject: subjectLabel });

    res.json({
      success: true,
      message: 'Message envoyé avec succès'
    });
  } catch (error) {
    console.error('❌ Contact form error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'envoi du message'
    });
  }
});

/**
 * API: Send Visitor Welcome Email
 * POST /api/send-visitor-welcome-email
 */
app.post('/api/send-visitor-welcome-email', async (req, res) => {
  if (!transporter) {
    return res.status(503).json({
      success: false,
      error: 'Email service not configured (SMTP_PASS missing)'
    });
  }

  try {
    const { email, name, level, userId, includePaymentInstructions } = req.body;

    if (!email || !name) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: email, name'
      });
    }

    const isVIP = level === 'premium' || level === 'vip';
    const levelLabel = isVIP ? 'VIP / Premium' : 'Gratuit';

    const appUrl = process.env.APP_URL || 'https://www.sibevent.com';
    const contactEmail = process.env.CONTACT_EMAIL || 'Sib2026@urbacom.net';

    // Build HTML template
    const html = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 640px; margin: 0 auto; background: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #0ea5e9 100%); padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">🎉 Bienvenue au SIB 2026</h1>
          <p style="color: #bfdbfe; margin: 10px 0 0; font-size: 16px;">Salon International du Bâtiment</p>
        </div>

        <!-- Body -->
        <div style="padding: 30px; background: #f8fafc; border-left: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0;">
          <p style="font-size: 18px; color: #1e293b;">Bonjour <strong>${name}</strong>,</p>
          <p style="font-size: 16px; color: #475569; line-height: 1.6;">
            Votre inscription en tant que <strong>Visiteur ${levelLabel}</strong> a été confirmée avec succès !
          </p>

          <!-- Badge Info -->
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h2 style="color: #1e3a5f; margin: 0 0 15px; font-size: 18px;">📋 Récapitulatif</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #64748b;">Email</td><td style="padding: 8px 0; color: #1e293b; font-weight: 600;">${email}</td></tr>
              <tr><td style="padding: 8px 0; color: #64748b;">Niveau</td><td style="padding: 8px 0; color: #1e293b; font-weight: 600;">${levelLabel}</td></tr>
              <tr><td style="padding: 8px 0; color: #64748b;">Statut</td><td style="padding: 8px 0; color: #16a34a; font-weight: 600;">✅ Confirmé</td></tr>
            </table>
          </div>

          ${isVIP && includePaymentInstructions ? `
          <!-- Payment Instructions -->
          <div style="background: #fffbeb; border: 1px solid #fbbf24; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #92400e; margin: 0 0 10px;">💳 Instructions de paiement</h3>
            <p style="color: #78350f; margin: 0; line-height: 1.6;">
              Pour activer votre badge VIP, veuillez procéder au paiement depuis votre tableau de bord.
              Vous pouvez payer par virement bancaire ou via notre plateforme sécurisée.
            </p>
          </div>
          ` : ''}

          <!-- Event Details -->
          <div style="background: #eff6ff; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #1e40af; margin: 0 0 10px;">📅 Informations du salon</h3>
            <p style="color: #1e3a5f; margin: 5px 0;"><strong>Dates :</strong> 25 - 29 Novembre 2026</p>
            <p style="color: #1e3a5f; margin: 5px 0;"><strong>Lieu :</strong> Parc d'Exposition Mohammed VI, El Jadida, Maroc</p>
            <p style="color: #1e3a5f; margin: 5px 0;"><strong>Horaires :</strong> 09h00 - 18h00</p>
          </div>

          <!-- CTA Button -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="${appUrl}/visitor/dashboard" 
               style="display: inline-block; background: linear-gradient(135deg, #2563eb, #0ea5e9); color: #ffffff; padding: 14px 40px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 16px;">
              Accéder à mon tableau de bord
            </a>
          </div>

          <p style="font-size: 14px; color: #94a3b8; text-align: center;">
            Conservez cet email comme confirmation de votre inscription.
          </p>
        </div>

        <!-- Footer -->
        <div style="background: #1e293b; padding: 20px 30px; text-align: center; border-radius: 0 0 8px 8px;">
          <p style="color: #94a3b8; margin: 0; font-size: 13px;">
            © 2026 SIB - Salon International du Bâtiment
          </p>
          <p style="color: #64748b; margin: 5px 0 0; font-size: 12px;">
            Contact : ${contactEmail} | ${appUrl.replace(/^https?:\/\//, '')}
          </p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: `"SIB 2026" <${process.env.SMTP_USER || 'contact@sib2026.ma'}>`,
      to: email,
      subject: isVIP
        ? '🎫 SIB 2026 - Inscription VIP confirmée'
        : '🎉 SIB 2026 - Inscription visiteur confirmée',
      html,
      text: `Bienvenue au SIB 2026, ${name} !\n\nVotre inscription en tant que Visiteur ${levelLabel} a été confirmée.\n\nDates : 25-29 Novembre 2026\nLieu : Parc d'Exposition Mohammed VI, El Jadida, Maroc\n\nAccédez à votre tableau de bord : ${appUrl}/visitor/dashboard\n\nCordialement,\nL'équipe SIB 2026`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent:', { to: email, level, messageId: info.messageId });

    res.json({
      success: true,
      messageId: info.messageId,
      message: 'Welcome email sent successfully'
    });
  } catch (error) {
    console.error('❌ Welcome email error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to send welcome email'
    });
  }
});

/**
 * API: Health check
 * GET /api/health
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    email: transporter ? 'configured' : 'disabled',
    timestamp: new Date().toISOString()
  });
});

// ============================================
// ADMIN API: Delete exhibitor (bypasses RLS)
// ============================================

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

console.log('🔧 [INIT] SUPABASE_URL:', SUPABASE_URL ? 'OK' : 'MANQUANT');
console.log('🔧 [INIT] SERVICE_ROLE_KEY:', SUPABASE_SERVICE_ROLE_KEY ? 'OK' : 'MANQUANT');

const supabaseAdmin = (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
  : null;

console.log('🔧 [INIT] supabaseAdmin:', supabaseAdmin ? 'CRÉÉ ✅' : 'NULL ❌');

/**
 * API: Delete Exhibitor (admin only)
 * DELETE /api/admin/exhibitors/:id
 */
app.delete('/api/admin/exhibitors/:id', async (req, res) => {
  console.log('\n🗑️ ========== DELETE EXHIBITOR REQUEST ==========');
  console.log('📍 Params:', req.params);
  console.log('📍 Headers Authorization:', req.headers.authorization ? 'Bearer ***' + req.headers.authorization.slice(-10) : 'MANQUANT');
  console.log('📍 Supabase Admin configuré:', !!supabaseAdmin);
  console.log('📍 SUPABASE_URL:', process.env.SUPABASE_URL ? 'OK' : 'MANQUANT');
  console.log('📍 SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'OK (' + process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 10) + '...)' : 'MANQUANT');

  if (!supabaseAdmin) {
    console.error('❌ supabaseAdmin est null - variables env manquantes');
    return res.status(503).json({ success: false, error: 'Service admin non configuré - vérifier SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY' });
  }

  try {
    const { id } = req.params;
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      console.error('❌ Pas de header Authorization');
      return res.status(401).json({ success: false, error: 'Non autorisé - header Authorization manquant' });
    }

    // Vérifier le token JWT de l'utilisateur
    const token = authHeader.replace('Bearer ', '');
    console.log('🔑 Vérification token JWT...');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      console.error('❌ Token invalide:', authError?.message || 'user null');
      return res.status(401).json({ success: false, error: `Token invalide: ${authError?.message || 'user null'}` });
    }
    console.log('✅ Utilisateur authentifié:', { userId: user.id, email: user.email });

    // Vérifier que l'utilisateur est admin
    console.log('🔍 Vérification rôle admin...');
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('type, email')
      .eq('id', user.id)
      .single();

    console.log('👤 Données utilisateur:', { userData, userError: userError?.message });

    if (userData?.type !== 'admin') {
      console.error('❌ Utilisateur non admin:', userData?.type);
      return res.status(403).json({ success: false, error: `Accès refusé - type=${userData?.type}, admin requis` });
    }
    console.log('✅ Admin confirmé:', userData.email);

    // Chercher l'exposant dans 'exhibitors' par id ou user_id
    console.log('🔍 Recherche exposant dans exhibitors, id:', id);

    const { data: exById } = await supabaseAdmin
      .from('exhibitors')
      .select('id, user_id, company_name')
      .or(`id.eq.${id},user_id.eq.${id}`)
      .maybeSingle();

    if (!exById) {
      console.error('❌ Exposant non trouvé dans exhibitors:', id);
      return res.status(404).json({ success: false, error: `Exposant non trouvé (id: ${id})` });
    }

    const exhibitorTableId = exById.id;
    const authUserId = exById.user_id || id;
    const companyName = exById.company_name || 'inconnu';

    // Supprimer le profil exposant
    const { error: deleteError } = await supabaseAdmin
      .from('exhibitors')
      .delete()
      .eq('id', exhibitorTableId);

    if (deleteError) {
      console.error('❌ Erreur delete exhibitors:', deleteError.message);
      return res.status(500).json({ success: false, error: deleteError.message });
    }

    // Supprimer le compte auth (ignorer si déjà absent)
    try {
      await supabaseAdmin.auth.admin.deleteUser(authUserId);
      console.log('✅ Compte auth supprimé:', authUserId);
    } catch (authErr) {
      console.warn('⚠️ Compte auth non supprimé (peut-être déjà absent):', authErr.message);
    }

    console.log(`✅ Exposant "${companyName}" supprimé avec succès par admin ${user.email}`);
    console.log('🗑️ ========== FIN DELETE EXHIBITOR ==========\n');
    res.json({ success: true, deleted: [{ id: exhibitorTableId, company_name: companyName }] });
  } catch (error) {
    console.error('❌ Erreur inattendue:', error.message, error.stack);
    res.status(500).json({ success: false, error: error.message, stack: error.stack });
  }
});

// ============================================
// FRONTEND HANDLING
// Railway = backend API only. Frontend is on Vercel.
// Non-API requests get redirected to the Vercel frontend.
// ============================================
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://sib-2026.vercel.app';

// Catch-all: redirect non-API requests to Vercel frontend
app.get('{*path}', (req, res) => {
  // If someone hits Railway directly (not an API route), redirect to Vercel
  if (process.env.NODE_ENV === 'production') {
    res.redirect(302, `${FRONTEND_URL}${req.originalUrl}`);
  } else {
    // In dev, still serve static files if dist/ exists
    const indexPath = path.join(__dirname, 'dist', 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(200).json({ 
        status: 'API server running',
        message: 'Frontend is served by Vercel in production',
        api: '/api/health'
      });
    }
  }
});

// Error handler to prevent connection resets
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);
  res.status(500).send('Internal Server Error');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 API Server running on port ${PORT}`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'https://sib-2026.vercel.app'}`);
  console.log(`📧 Email API: ${transporter ? 'enabled' : 'disabled (set SMTP_PASS)'}`);
});
