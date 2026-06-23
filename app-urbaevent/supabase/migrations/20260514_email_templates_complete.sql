-- ============================================================
-- Templates email manquants — SIB 2026
-- Migration: 20260514_email_templates_complete.sql
-- Ajoute : exposant, partenaire/sponsor, RDV, location matériel,
--          location chapiteau, réinitialisation MDP
-- ============================================================

INSERT INTO public.email_templates
  (template_key, name, description, subject, html_content, text_content, variables)
VALUES

-- ──────────────────────────────────────────────────────────────
-- 1. EXPOSANT — inscription reçue (en attente de validation)
-- ──────────────────────────────────────────────────────────────
(
  'exhibitor_welcome',
  'Bienvenue Exposant — Inscription reçue',
  'Email envoyé dès qu''un exposant soumet son inscription, avant validation admin',
  '🏗️ Inscription Exposant reçue — SIB 2026',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px;">
  <div style="background:linear-gradient(135deg,#0B1C3D 0%,#1e3a5f 100%);padding:35px;text-align:center;border-radius:10px 10px 0 0;">
    <div style="font-size:40px;margin-bottom:10px;">🏗️</div>
    <h1 style="color:white;margin:0;font-size:26px;">Inscription Exposant reçue</h1>
    <p style="color:#C9A84C;margin:8px 0 0;font-size:15px;">Salon International du Bâtiment 2026</p>
  </div>
  <div style="background:#f9fafb;padding:30px;border-radius:0 0 10px 10px;">
    <p style="font-size:17px;margin-top:0;">Bonjour <strong>{{company_name}}</strong>,</p>
    <p>Nous avons bien reçu votre demande d''inscription en tant qu''<strong>exposant</strong> au <strong>Salon International du Bâtiment SIB 2026</strong>.</p>
    <div style="background:white;border-left:4px solid #C9A84C;padding:20px;margin:25px 0;border-radius:5px;">
      <h3 style="margin-top:0;color:#0B1C3D;">📋 Récapitulatif de votre demande</h3>
      <p style="margin:5px 0;"><strong>Société :</strong> {{company_name}}</p>
      <p style="margin:5px 0;"><strong>Contact :</strong> {{contact_name}}</p>
      <p style="margin:5px 0;"><strong>Email :</strong> {{email}}</p>
      <p style="margin:5px 0;"><strong>Secteur :</strong> {{sector}}</p>
    </div>
    <div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:20px;margin:25px 0;border-radius:5px;">
      <h3 style="margin-top:0;color:#d97706;">⏳ Prochaine étape</h3>
      <p style="margin:0;">Notre équipe examine votre dossier sous <strong>48–72 heures ouvrables</strong>. Vous recevrez un email de confirmation dès que votre compte est validé.</p>
    </div>
    <div style="background:#e0f2fe;border-left:4px solid #0ea5e9;padding:20px;margin:25px 0;border-radius:5px;">
      <h3 style="margin-top:0;color:#0369a1;">📅 Dates SIB 2026</h3>
      <p style="margin:5px 0;"><strong>Dates :</strong> 25–29 novembre 2026</p>
      <p style="margin:5px 0;"><strong>Lieu :</strong> Parc des Expositions, Casablanca</p>
    </div>
    <p style="text-align:center;color:#666;font-size:13px;margin-top:30px;">
      Pour toute question : <a href="mailto:exposants@sib.ma" style="color:#0B1C3D;">exposants@sib.ma</a><br>
      L''équipe SIB 2026
    </p>
  </div>
</body>
</html>',
  'Bonjour {{company_name}},

Nous avons bien reçu votre demande d''inscription en tant qu''exposant au SIB 2026.

RÉCAPITULATIF :
- Société : {{company_name}}
- Contact : {{contact_name}}
- Email : {{email}}
- Secteur : {{sector}}

Notre équipe examine votre dossier sous 48–72 heures ouvrables.

Dates SIB 2026 : 25–29 novembre 2026 — Parc des Expositions, Casablanca

Pour toute question : exposants@sib.ma
L''équipe SIB 2026',
  '["company_name","contact_name","email","sector"]'::jsonb
),

-- ──────────────────────────────────────────────────────────────
-- 2. EXPOSANT — compte validé par l'admin
-- ──────────────────────────────────────────────────────────────
(
  'exhibitor_validated',
  'Exposant — Compte validé',
  'Email envoyé quand l''admin valide le compte d''un exposant',
  '✅ Votre compte Exposant est activé — SIB 2026',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px;">
  <div style="background:linear-gradient(135deg,#0B1C3D 0%,#1e3a5f 100%);padding:35px;text-align:center;border-radius:10px 10px 0 0;">
    <div style="font-size:40px;margin-bottom:10px;">✅</div>
    <h1 style="color:white;margin:0;font-size:26px;">Compte Exposant activé !</h1>
    <p style="color:#C9A84C;margin:8px 0 0;font-size:15px;">Salon International du Bâtiment 2026</p>
  </div>
  <div style="background:#f9fafb;padding:30px;border-radius:0 0 10px 10px;">
    <p style="font-size:17px;margin-top:0;">Félicitations <strong>{{company_name}}</strong> !</p>
    <p>Votre compte exposant au <strong>SIB 2026</strong> a été <strong style="color:#16a34a;">validé et activé</strong> par notre équipe.</p>
    <div style="background:white;border-left:4px solid #22c55e;padding:20px;margin:25px 0;border-radius:5px;">
      <h3 style="margin-top:0;color:#16a34a;">🎉 Vous avez maintenant accès à</h3>
      <ul style="margin:10px 0;padding-left:20px;">
        <li>Votre espace exposant personnel</li>
        <li>Création et gestion de votre mini-site</li>
        <li>Catalogue produits & services</li>
        <li>Prise de rendez-vous avec les visiteurs</li>
        <li>Module de networking</li>
        <li>Location de matériel & chapiteaux</li>
      </ul>
    </div>
    <div style="text-align:center;margin:30px 0;">
      <a href="{{dashboard_url}}" style="background:linear-gradient(135deg,#C9A84C,#b8963e);color:#0B1C3D;padding:14px 32px;border-radius:25px;text-decoration:none;font-weight:bold;font-size:15px;display:inline-block;">
        Accéder à mon espace exposant →
      </a>
    </div>
    <div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:20px;margin:25px 0;border-radius:5px;">
      <h3 style="margin-top:0;color:#d97706;">📅 SIB 2026 — 25–29 novembre 2026</h3>
      <p style="margin:5px 0;">Parc des Expositions de Casablanca, Maroc</p>
    </div>
    <p style="text-align:center;color:#666;font-size:13px;margin-top:30px;">
      Support exposants : <a href="mailto:exposants@sib.ma" style="color:#0B1C3D;">exposants@sib.ma</a><br>
      L''équipe SIB 2026
    </p>
  </div>
</body>
</html>',
  'Félicitations {{company_name}} !

Votre compte exposant au SIB 2026 a été validé et activé.

Vous avez maintenant accès à :
- Votre espace exposant personnel
- Création de mini-site
- Catalogue produits & services
- Prise de rendez-vous
- Location de matériel & chapiteaux

Accéder à votre espace : {{dashboard_url}}

SIB 2026 — 25–29 novembre 2026, Casablanca

exposants@sib.ma — L''équipe SIB 2026',
  '["company_name","contact_name","email","dashboard_url"]'::jsonb
),

-- ──────────────────────────────────────────────────────────────
-- 3. EXPOSANT — dossier refusé
-- ──────────────────────────────────────────────────────────────
(
  'exhibitor_rejected',
  'Exposant — Dossier refusé',
  'Email envoyé quand l''admin refuse le dossier d''un exposant',
  '❌ Votre dossier Exposant — SIB 2026',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px;">
  <div style="background:linear-gradient(135deg,#0B1C3D 0%,#1e3a5f 100%);padding:35px;text-align:center;border-radius:10px 10px 0 0;">
    <h1 style="color:white;margin:0;font-size:26px;">Mise à jour de votre dossier</h1>
    <p style="color:#C9A84C;margin:8px 0 0;font-size:15px;">Salon International du Bâtiment 2026</p>
  </div>
  <div style="background:#f9fafb;padding:30px;border-radius:0 0 10px 10px;">
    <p style="font-size:17px;margin-top:0;">Bonjour <strong>{{company_name}}</strong>,</p>
    <p>Après examen de votre dossier d''inscription en tant qu''exposant au SIB 2026, nous ne sommes malheureusement pas en mesure de donner suite à votre candidature pour le moment.</p>
    <div style="background:white;border-left:4px solid #ef4444;padding:20px;margin:25px 0;border-radius:5px;">
      <h3 style="margin-top:0;color:#dc2626;">📋 Motif</h3>
      <p style="margin:0;">{{rejection_reason}}</p>
    </div>
    <p>Nous vous encourageons à nous contacter pour plus d''informations ou pour soumettre un dossier complémentaire.</p>
    <p style="text-align:center;color:#666;font-size:13px;margin-top:30px;">
      Contact : <a href="mailto:exposants@sib.ma" style="color:#0B1C3D;">exposants@sib.ma</a><br>
      L''équipe SIB 2026
    </p>
  </div>
</body>
</html>',
  'Bonjour {{company_name}},

Suite à l''examen de votre dossier, nous ne pouvons pas donner suite à votre candidature.

Motif : {{rejection_reason}}

Pour plus d''informations : exposants@sib.ma
L''équipe SIB 2026',
  '["company_name","contact_name","email","rejection_reason"]'::jsonb
),

-- ──────────────────────────────────────────────────────────────
-- 4. PARTENAIRE / SPONSOR — inscription reçue
-- ──────────────────────────────────────────────────────────────
(
  'partner_welcome',
  'Bienvenue Partenaire/Sponsor — Inscription reçue',
  'Email envoyé dès qu''un partenaire ou sponsor soumet son inscription',
  '🤝 Demande de Partenariat reçue — SIB 2026',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px;">
  <div style="background:linear-gradient(135deg,#0B1C3D 0%,#1e3a5f 100%);padding:35px;text-align:center;border-radius:10px 10px 0 0;">
    <div style="font-size:40px;margin-bottom:10px;">🤝</div>
    <h1 style="color:white;margin:0;font-size:26px;">Demande de Partenariat reçue</h1>
    <p style="color:#C9A84C;margin:8px 0 0;font-size:15px;">Salon International du Bâtiment 2026</p>
  </div>
  <div style="background:#f9fafb;padding:30px;border-radius:0 0 10px 10px;">
    <p style="font-size:17px;margin-top:0;">Bonjour <strong>{{company_name}}</strong>,</p>
    <p>Nous avons bien reçu votre demande de <strong>{{partnership_type}}</strong> pour le <strong>Salon International du Bâtiment SIB 2026</strong>. Merci de votre intérêt !</p>
    <div style="background:white;border-left:4px solid #C9A84C;padding:20px;margin:25px 0;border-radius:5px;">
      <h3 style="margin-top:0;color:#0B1C3D;">📋 Récapitulatif</h3>
      <p style="margin:5px 0;"><strong>Société :</strong> {{company_name}}</p>
      <p style="margin:5px 0;"><strong>Contact :</strong> {{contact_name}}</p>
      <p style="margin:5px 0;"><strong>Type :</strong> {{partnership_type}}</p>
      <p style="margin:5px 0;"><strong>Email :</strong> {{email}}</p>
    </div>
    <div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:20px;margin:25px 0;border-radius:5px;">
      <h3 style="margin-top:0;color:#d97706;">⏳ Prochaine étape</h3>
      <p style="margin:0;">Votre dossier est en cours d''examen. Un chargé de partenariat vous contactera sous <strong>48–72 heures</strong> pour discuter des modalités.</p>
    </div>
    <p style="text-align:center;color:#666;font-size:13px;margin-top:30px;">
      Partenariats : <a href="mailto:partenaires@sib.ma" style="color:#0B1C3D;">partenaires@sib.ma</a><br>
      L''équipe SIB 2026
    </p>
  </div>
</body>
</html>',
  'Bonjour {{company_name}},

Nous avons bien reçu votre demande de {{partnership_type}} pour SIB 2026.

RÉCAPITULATIF :
- Société : {{company_name}}
- Contact : {{contact_name}}
- Type : {{partnership_type}}

Un chargé de partenariat vous contactera sous 48–72 heures.

partenaires@sib.ma — L''équipe SIB 2026',
  '["company_name","contact_name","email","partnership_type"]'::jsonb
),

-- ──────────────────────────────────────────────────────────────
-- 5. PARTENAIRE — compte validé
-- ──────────────────────────────────────────────────────────────
(
  'partner_validated',
  'Partenaire — Compte validé',
  'Email envoyé quand l''admin valide le compte d''un partenaire ou sponsor',
  '✅ Votre partenariat SIB 2026 est confirmé !',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px;">
  <div style="background:linear-gradient(135deg,#0B1C3D 0%,#1e3a5f 100%);padding:35px;text-align:center;border-radius:10px 10px 0 0;">
    <div style="font-size:40px;margin-bottom:10px;">🌟</div>
    <h1 style="color:white;margin:0;font-size:26px;">Partenariat confirmé !</h1>
    <p style="color:#C9A84C;margin:8px 0 0;font-size:15px;">Salon International du Bâtiment 2026</p>
  </div>
  <div style="background:#f9fafb;padding:30px;border-radius:0 0 10px 10px;">
    <p style="font-size:17px;margin-top:0;">Félicitations <strong>{{company_name}}</strong> !</p>
    <p>Votre partenariat <strong>{{partnership_level}}</strong> avec le <strong>SIB 2026</strong> est officiellement confirmé.</p>
    <div style="background:white;border-left:4px solid #C9A84C;padding:20px;margin:25px 0;border-radius:5px;">
      <h3 style="margin-top:0;color:#0B1C3D;">🎯 Vos avantages partenaire</h3>
      <ul style="margin:10px 0;padding-left:20px;">
        <li>Visibilité premium sur la plateforme SIB</li>
        <li>Espace partenaire dédié sur le salon</li>
        <li>Accès aux leads et contacts exposants</li>
        <li>Diffusion de vos contenus médias</li>
        <li>Invitations VIP et networking prioritaire</li>
      </ul>
    </div>
    <div style="text-align:center;margin:30px 0;">
      <a href="{{dashboard_url}}" style="background:linear-gradient(135deg,#C9A84C,#b8963e);color:#0B1C3D;padding:14px 32px;border-radius:25px;text-decoration:none;font-weight:bold;font-size:15px;display:inline-block;">
        Accéder à mon espace partenaire →
      </a>
    </div>
    <p style="text-align:center;color:#666;font-size:13px;margin-top:30px;">
      partenaires@sib.ma — L''équipe SIB 2026
    </p>
  </div>
</body>
</html>',
  'Félicitations {{company_name}} !

Votre partenariat {{partnership_level}} avec SIB 2026 est officiellement confirmé.

Accéder à votre espace : {{dashboard_url}}

partenaires@sib.ma — L''équipe SIB 2026',
  '["company_name","contact_name","email","partnership_level","dashboard_url"]'::jsonb
),

-- ──────────────────────────────────────────────────────────────
-- 6. PARTENAIRE — dossier refusé
-- ──────────────────────────────────────────────────────────────
(
  'partner_rejected',
  'Partenaire — Dossier refusé',
  'Email envoyé quand l''admin refuse le dossier d''un partenaire',
  'Mise à jour de votre dossier Partenaire — SIB 2026',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px;">
  <div style="background:linear-gradient(135deg,#0B1C3D 0%,#1e3a5f 100%);padding:35px;text-align:center;border-radius:10px 10px 0 0;">
    <h1 style="color:white;margin:0;font-size:26px;">Mise à jour de votre dossier</h1>
    <p style="color:#C9A84C;margin:8px 0 0;">SIB 2026</p>
  </div>
  <div style="background:#f9fafb;padding:30px;border-radius:0 0 10px 10px;">
    <p style="font-size:17px;margin-top:0;">Bonjour <strong>{{company_name}}</strong>,</p>
    <p>Après examen de votre dossier de partenariat, nous ne sommes pas en mesure de donner suite à cette demande.</p>
    <div style="background:white;border-left:4px solid #ef4444;padding:20px;margin:25px 0;border-radius:5px;">
      <h3 style="margin-top:0;color:#dc2626;">Motif</h3>
      <p style="margin:0;">{{rejection_reason}}</p>
    </div>
    <p>N''hésitez pas à nous contacter pour explorer d''autres formes de collaboration.</p>
    <p style="text-align:center;color:#666;font-size:13px;margin-top:30px;">
      partenaires@sib.ma — L''équipe SIB 2026
    </p>
  </div>
</body>
</html>',
  'Bonjour {{company_name}},

Après examen de votre dossier, nous ne pouvons pas donner suite.
Motif : {{rejection_reason}}

partenaires@sib.ma — L''équipe SIB 2026',
  '["company_name","contact_name","email","rejection_reason"]'::jsonb
),

-- ──────────────────────────────────────────────────────────────
-- 7. RENDEZ-VOUS — confirmation
-- ──────────────────────────────────────────────────────────────
(
  'appointment_confirmation',
  'Rendez-vous — Confirmation',
  'Email envoyé lors de la confirmation d''un rendez-vous B2B',
  '📅 Rendez-vous confirmé — SIB 2026',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px;">
  <div style="background:linear-gradient(135deg,#0B1C3D 0%,#1e3a5f 100%);padding:35px;text-align:center;border-radius:10px 10px 0 0;">
    <div style="font-size:40px;margin-bottom:10px;">📅</div>
    <h1 style="color:white;margin:0;font-size:26px;">Rendez-vous confirmé</h1>
    <p style="color:#C9A84C;margin:8px 0 0;">SIB 2026 — Networking B2B</p>
  </div>
  <div style="background:#f9fafb;padding:30px;border-radius:0 0 10px 10px;">
    <p style="font-size:17px;margin-top:0;">Bonjour <strong>{{name}}</strong>,</p>
    <p>Votre rendez-vous au <strong>SIB 2026</strong> est confirmé.</p>
    <div style="background:white;border:2px solid #C9A84C;padding:20px;margin:25px 0;border-radius:10px;">
      <h3 style="margin-top:0;color:#0B1C3D;text-align:center;">📋 Détails du rendez-vous</h3>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:8px 0;color:#666;width:40%;">Avec :</td><td style="padding:8px 0;font-weight:bold;">{{other_party_name}}</td></tr>
        <tr><td style="padding:8px 0;color:#666;">Date :</td><td style="padding:8px 0;font-weight:bold;">{{appointment_date}}</td></tr>
        <tr><td style="padding:8px 0;color:#666;">Heure :</td><td style="padding:8px 0;font-weight:bold;">{{appointment_time}}</td></tr>
        <tr><td style="padding:8px 0;color:#666;">Lieu :</td><td style="padding:8px 0;font-weight:bold;">{{location}}</td></tr>
        <tr><td style="padding:8px 0;color:#666;">Objet :</td><td style="padding:8px 0;">{{meeting_subject}}</td></tr>
      </table>
    </div>
    <div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:15px;margin:20px 0;border-radius:5px;">
      <p style="margin:0;font-size:13px;">💡 Ajoutez ce rendez-vous à votre agenda depuis votre espace personnel SIB.</p>
    </div>
    <p style="text-align:center;color:#666;font-size:13px;margin-top:30px;">
      contact@sib.ma — L''équipe SIB 2026
    </p>
  </div>
</body>
</html>',
  'Bonjour {{name}},

Votre rendez-vous SIB 2026 est confirmé.

Avec : {{other_party_name}}
Date : {{appointment_date}}
Heure : {{appointment_time}}
Lieu : {{location}}
Objet : {{meeting_subject}}

contact@sib.ma — L''équipe SIB 2026',
  '["name","email","other_party_name","appointment_date","appointment_time","location","meeting_subject"]'::jsonb
),

-- ──────────────────────────────────────────────────────────────
-- 8. RENDEZ-VOUS — rappel (J-1)
-- ──────────────────────────────────────────────────────────────
(
  'appointment_reminder',
  'Rendez-vous — Rappel J-1',
  'Email de rappel envoyé la veille d''un rendez-vous B2B',
  '⏰ Rappel : Rendez-vous demain — SIB 2026',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px;">
  <div style="background:linear-gradient(135deg,#0B1C3D 0%,#1e3a5f 100%);padding:35px;text-align:center;border-radius:10px 10px 0 0;">
    <div style="font-size:40px;margin-bottom:10px;">⏰</div>
    <h1 style="color:white;margin:0;font-size:26px;">Rappel — Rendez-vous demain</h1>
    <p style="color:#C9A84C;margin:8px 0 0;">SIB 2026</p>
  </div>
  <div style="background:#f9fafb;padding:30px;border-radius:0 0 10px 10px;">
    <p style="font-size:17px;margin-top:0;">Bonjour <strong>{{name}}</strong>,</p>
    <p>Rappel : vous avez un rendez-vous <strong>demain</strong> au SIB 2026.</p>
    <div style="background:white;border:2px solid #C9A84C;padding:20px;margin:25px 0;border-radius:10px;">
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:8px 0;color:#666;width:40%;">Avec :</td><td style="padding:8px 0;font-weight:bold;">{{other_party_name}}</td></tr>
        <tr><td style="padding:8px 0;color:#666;">Heure :</td><td style="padding:8px 0;font-weight:bold;">{{appointment_time}}</td></tr>
        <tr><td style="padding:8px 0;color:#666;">Lieu :</td><td style="padding:8px 0;font-weight:bold;">{{location}}</td></tr>
      </table>
    </div>
    <p style="text-align:center;color:#666;font-size:13px;margin-top:30px;">
      contact@sib.ma — L''équipe SIB 2026
    </p>
  </div>
</body>
</html>',
  'Bonjour {{name}},

Rappel : rendez-vous demain au SIB 2026.
Avec : {{other_party_name}}
Heure : {{appointment_time}}
Lieu : {{location}}

contact@sib.ma — L''équipe SIB 2026',
  '["name","email","other_party_name","appointment_date","appointment_time","location"]'::jsonb
),

-- ──────────────────────────────────────────────────────────────
-- 9. LOCATION MATÉRIEL — confirmation commande
-- ──────────────────────────────────────────────────────────────
(
  'rental_order_confirmation',
  'Location Matériel — Confirmation commande',
  'Email envoyé après confirmation du paiement d''une commande de location de matériel',
  '🛠️ Commande location matériel confirmée — SIB 2026',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px;">
  <div style="background:linear-gradient(135deg,#0B1C3D 0%,#1e3a5f 100%);padding:35px;text-align:center;border-radius:10px 10px 0 0;">
    <div style="font-size:40px;margin-bottom:10px;">🛠️</div>
    <h1 style="color:white;margin:0;font-size:26px;">Location Matériel confirmée</h1>
    <p style="color:#C9A84C;margin:8px 0 0;">SIB 2026</p>
  </div>
  <div style="background:#f9fafb;padding:30px;border-radius:0 0 10px 10px;">
    <p style="font-size:17px;margin-top:0;">Bonjour <strong>{{customer_name}}</strong>,</p>
    <p>Votre commande de location de matériel pour le <strong>SIB 2026</strong> est confirmée.</p>
    <div style="background:white;border-left:4px solid #C9A84C;padding:20px;margin:25px 0;border-radius:5px;">
      <h3 style="margin-top:0;color:#0B1C3D;">📦 Récapitulatif commande</h3>
      <p style="margin:5px 0;"><strong>N° Facture :</strong> {{invoice_number}}</p>
      <p style="margin:5px 0;"><strong>Articles :</strong> {{items_summary}}</p>
      <p style="margin:5px 0;"><strong>Période :</strong> {{rental_start}} au {{rental_end}}</p>
      <p style="margin:5px 0;"><strong>Montant TTC :</strong> {{total_ttc}} MAD</p>
      <p style="margin:5px 0;"><strong>Paiement :</strong> {{payment_method}}</p>
    </div>
    <div style="background:#e0f2fe;border-left:4px solid #0ea5e9;padding:15px;margin:20px 0;border-radius:5px;">
      <p style="margin:0;font-size:13px;">📋 Votre facture est disponible dans votre espace personnel.</p>
    </div>
    <p style="text-align:center;color:#666;font-size:13px;margin-top:30px;">
      location@sib.ma — L''équipe SIB 2026
    </p>
  </div>
</body>
</html>',
  'Bonjour {{customer_name}},

Votre commande de location matériel SIB 2026 est confirmée.

N° Facture : {{invoice_number}}
Articles : {{items_summary}}
Période : {{rental_start}} au {{rental_end}}
Montant TTC : {{total_ttc}} MAD
Paiement : {{payment_method}}

location@sib.ma — L''équipe SIB 2026',
  '["customer_name","email","invoice_number","items_summary","rental_start","rental_end","total_ttc","payment_method"]'::jsonb
),

-- ──────────────────────────────────────────────────────────────
-- 10. LOCATION CHAPITEAU — confirmation commande
-- ──────────────────────────────────────────────────────────────
(
  'chapiteau_order_confirmation',
  'Location Chapiteau — Confirmation commande',
  'Email envoyé après confirmation du paiement d''une commande de location de chapiteau',
  '⛺ Location Chapiteau confirmée — SIB 2026',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px;">
  <div style="background:linear-gradient(135deg,#0B1C3D 0%,#1e3a5f 100%);padding:35px;text-align:center;border-radius:10px 10px 0 0;">
    <div style="font-size:40px;margin-bottom:10px;">⛺</div>
    <h1 style="color:white;margin:0;font-size:26px;">Location Chapiteau confirmée</h1>
    <p style="color:#C9A84C;margin:8px 0 0;">SIB 2026 — Installation incluse</p>
  </div>
  <div style="background:#f9fafb;padding:30px;border-radius:0 0 10px 10px;">
    <p style="font-size:17px;margin-top:0;">Bonjour <strong>{{customer_name}}</strong>,</p>
    <p>Votre commande de location de chapiteau pour le <strong>SIB 2026</strong> est confirmée. Notre équipe technique prendra contact avec vous pour coordonner l''installation.</p>
    <div style="background:white;border-left:4px solid #C9A84C;padding:20px;margin:25px 0;border-radius:5px;">
      <h3 style="margin-top:0;color:#0B1C3D;">⛺ Récapitulatif commande</h3>
      <p style="margin:5px 0;"><strong>N° Facture :</strong> {{invoice_number}}</p>
      <p style="margin:5px 0;"><strong>Chapiteau :</strong> {{items_summary}}</p>
      <p style="margin:5px 0;"><strong>Période :</strong> {{rental_start}} au {{rental_end}}</p>
      <p style="margin:5px 0;"><strong>Montant TTC :</strong> {{total_ttc}} MAD</p>
      <p style="margin:5px 0;"><strong>Paiement :</strong> {{payment_method}}</p>
    </div>
    <div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:15px;margin:20px 0;border-radius:5px;">
      <h3 style="margin-top:0;color:#d97706;font-size:14px;">✅ Installation incluse</h3>
      <p style="margin:0;font-size:13px;">Montage avant le 25 novembre, démontage après le 29 novembre 2026. Notre équipe vous contactera pour confirmer les horaires.</p>
    </div>
    <p style="text-align:center;color:#666;font-size:13px;margin-top:30px;">
      chapiteau@sib.ma — L''équipe SIB 2026
    </p>
  </div>
</body>
</html>',
  'Bonjour {{customer_name}},

Votre location de chapiteau SIB 2026 est confirmée.

N° Facture : {{invoice_number}}
Chapiteau : {{items_summary}}
Période : {{rental_start}} au {{rental_end}}
Montant TTC : {{total_ttc}} MAD
Installation incluse — notre équipe vous contactera.

chapiteau@sib.ma — L''équipe SIB 2026',
  '["customer_name","email","invoice_number","items_summary","rental_start","rental_end","total_ttc","payment_method"]'::jsonb
),

-- ──────────────────────────────────────────────────────────────
-- 11. RÉINITIALISATION MOT DE PASSE
-- ──────────────────────────────────────────────────────────────
(
  'password_reset',
  'Réinitialisation mot de passe',
  'Email envoyé lors d''une demande de réinitialisation de mot de passe',
  '🔐 Réinitialisation de votre mot de passe — SIB 2026',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px;">
  <div style="background:linear-gradient(135deg,#0B1C3D 0%,#1e3a5f 100%);padding:35px;text-align:center;border-radius:10px 10px 0 0;">
    <div style="font-size:40px;margin-bottom:10px;">🔐</div>
    <h1 style="color:white;margin:0;font-size:26px;">Réinitialisation mot de passe</h1>
    <p style="color:#C9A84C;margin:8px 0 0;">SIB 2026</p>
  </div>
  <div style="background:#f9fafb;padding:30px;border-radius:0 0 10px 10px;">
    <p style="font-size:17px;margin-top:0;">Bonjour <strong>{{name}}</strong>,</p>
    <p>Vous avez demandé la réinitialisation de votre mot de passe pour votre compte SIB 2026.</p>
    <div style="text-align:center;margin:30px 0;">
      <a href="{{reset_url}}" style="background:linear-gradient(135deg,#C9A84C,#b8963e);color:#0B1C3D;padding:14px 32px;border-radius:25px;text-decoration:none;font-weight:bold;font-size:15px;display:inline-block;">
        Réinitialiser mon mot de passe →
      </a>
    </div>
    <div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:15px;margin:20px 0;border-radius:5px;">
      <p style="margin:0;font-size:13px;">⚠️ Ce lien est valable <strong>1 heure</strong>. Si vous n''avez pas demandé cette réinitialisation, ignorez cet email.</p>
    </div>
    <p style="text-align:center;color:#666;font-size:13px;margin-top:30px;">
      contact@sib.ma — L''équipe SIB 2026
    </p>
  </div>
</body>
</html>',
  'Bonjour {{name}},

Vous avez demandé la réinitialisation de votre mot de passe SIB 2026.

Lien de réinitialisation : {{reset_url}}

Ce lien est valable 1 heure. Si vous n''avez pas fait cette demande, ignorez cet email.

contact@sib.ma — L''équipe SIB 2026',
  '["name","email","reset_url"]'::jsonb
),

-- ──────────────────────────────────────────────────────────────
-- 12. VISITEUR — paiement VIP validé
-- ──────────────────────────────────────────────────────────────
(
  'visitor_vip_confirmed',
  'Visiteur VIP — Paiement confirmé',
  'Email envoyé quand le paiement VIP d''un visiteur est validé par l''admin',
  '👑 Votre accès VIP est activé — SIB 2026',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px;">
  <div style="background:linear-gradient(135deg,#f59e0b 0%,#d97706 100%);padding:35px;text-align:center;border-radius:10px 10px 0 0;">
    <div style="font-size:40px;margin-bottom:10px;">👑</div>
    <h1 style="color:white;margin:0;font-size:26px;">Accès VIP Premium activé !</h1>
    <p style="color:#fef3c7;margin:8px 0 0;">SIB 2026</p>
  </div>
  <div style="background:#f9fafb;padding:30px;border-radius:0 0 10px 10px;">
    <p style="font-size:17px;margin-top:0;">Félicitations <strong>{{name}}</strong> !</p>
    <p>Votre paiement a été validé. Votre <strong>Pass VIP Premium</strong> pour le SIB 2026 est maintenant actif.</p>
    <div style="background:white;border-left:4px solid #f59e0b;padding:20px;margin:25px 0;border-radius:5px;">
      <h3 style="margin-top:0;color:#d97706;">⭐ Vos avantages VIP</h3>
      <ul style="margin:10px 0;padding-left:20px;">
        <li>Accès prioritaire à toutes les zones</li>
        <li>Lounge VIP exclusif</li>
        <li>Conférences premium & ateliers</li>
        <li>Networking avec les décideurs</li>
        <li>Badge VIP numérique</li>
        <li>Accès aux sessions privées</li>
      </ul>
    </div>
    <div style="text-align:center;margin:30px 0;">
      <a href="{{dashboard_url}}" style="background:linear-gradient(135deg,#f59e0b,#d97706);color:white;padding:14px 32px;border-radius:25px;text-decoration:none;font-weight:bold;font-size:15px;display:inline-block;">
        Accéder à mon espace VIP →
      </a>
    </div>
    <p style="text-align:center;color:#666;font-size:13px;margin-top:30px;">
      vip@sib.ma — L''équipe SIB 2026
    </p>
  </div>
</body>
</html>',
  'Félicitations {{name}} !

Votre Pass VIP Premium SIB 2026 est activé.

Vos avantages : accès prioritaire, lounge VIP, conférences premium, networking décideurs.

Accéder à votre espace : {{dashboard_url}}

vip@sib.ma — L''équipe SIB 2026',
  '["name","email","dashboard_url","payment_ref"]'::jsonb
)

ON CONFLICT (template_key) DO NOTHING;
