-- Table pour stocker les templates d'emails personnalisables
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  subject VARCHAR(500) NOT NULL,
  html_content TEXT NOT NULL,
  text_content TEXT,
  variables JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Index pour recherche rapide par clé
CREATE INDEX idx_email_templates_key ON email_templates(template_key);
CREATE INDEX idx_email_templates_active ON email_templates(is_active);

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_email_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at
CREATE TRIGGER trigger_update_email_templates_updated_at
  BEFORE UPDATE ON email_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_email_templates_updated_at();

-- RLS Policies
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- Admin peut tout faire
CREATE POLICY "Admin can manage email templates"
  ON email_templates
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Tout le monde peut lire les templates actifs (pour l'Edge Function)
CREATE POLICY "Anyone can read active email templates"
  ON email_templates
  FOR SELECT
  USING (is_active = true);

-- Insertion des templates par défaut
INSERT INTO email_templates (template_key, name, description, subject, html_content, text_content, variables) VALUES
(
  'visitor_welcome_free',
  'Bienvenue Visiteur Gratuit',
  'Email de bienvenue pour les visiteurs avec pass gratuit',
  '🎉 Bienvenue à SIB 2026 - Pass Gratuit Confirmé',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenue à SIB 2026</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Bienvenue à SIB 2026</h1>
    <p style="color: #e8f5e9; margin: 10px 0 0 0; font-size: 16px;">Pass Gratuit confirmé</p>
  </div>

  <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="font-size: 18px; margin-top: 0;">Bonjour <strong>{{name}}</strong>,</p>

    <p style="font-size: 16px;">
      Félicitations ! Votre inscription gratuite au <strong>Salon International du Bâtiment (SIB) 2026</strong> a été confirmée avec succès.
    </p>

    <div style="background: white; border-left: 4px solid #22c55e; padding: 20px; margin: 25px 0; border-radius: 5px;">
      <h3 style="margin-top: 0; color: #16a34a;">✅ Votre Pass Gratuit inclut :</h3>
      <ul style="margin: 10px 0; padding-left: 20px;">
        <li>Accès au salon SIB 2026</li>
        <li>Badge QR sécurisé d''entrée</li>
        <li>Accès aux zones publiques et hall d''exposition</li>
        <li>Participation aux conférences publiques</li>
      </ul>
    </div>

    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 25px 0; border-radius: 5px;">
      <h3 style="margin-top: 0; color: #d97706;">📅 Informations du salon</h3>
      <p style="margin: 5px 0;"><strong>Dates :</strong> 15-18 Avril 2026</p>
      <p style="margin: 5px 0;"><strong>Lieu :</strong> Parc des Expositions de Casablanca, Maroc</p>
      <p style="margin: 5px 0;"><strong>Horaires :</strong> 9h00 - 18h00</p>
    </div>

    <div style="background: #e0f2fe; border-left: 4px solid #0ea5e9; padding: 20px; margin: 25px 0; border-radius: 5px;">
      <h3 style="margin-top: 0; color: #0369a1;">📞 Besoin d''aide ?</h3>
      <p style="margin: 5px 0;">Email : <a href="mailto:contact@sib2026.com" style="color: #0ea5e9;">contact@sib2026.com</a></p>
      <p style="margin: 5px 0;">Téléphone : +212 5 22 XX XX XX</p>
    </div>

    <p style="text-align: center; color: #666; font-size: 14px; margin-top: 30px;">
      Nous avons hâte de vous accueillir au SIB 2026 !<br>
      L''équipe SIB
    </p>
  </div>
</body>
</html>',
  'Bonjour {{name}},

Félicitations ! Votre inscription gratuite au Salon International du Bâtiment (SIB) 2026 a été confirmée avec succès.

VOTRE PASS GRATUIT INCLUT :
- Accès au salon SIB 2026
- Badge QR sécurisé d''entrée
- Accès aux zones publiques et hall d''exposition
- Participation aux conférences publiques

INFORMATIONS DU SALON :
Dates : 15-18 Avril 2026
Lieu : Parc des Expositions de Casablanca, Maroc
Horaires : 9h00 - 18h00

Nous avons hâte de vous accueillir au SIB 2026 !
L''équipe SIB',
  '["name", "email", "level"]'::jsonb
),
(
  'visitor_welcome_vip',
  'Bienvenue Visiteur VIP',
  'Email de bienvenue pour les visiteurs VIP avec demande de paiement',
  '👑 Compte VIP créé - Finaliser le paiement - SIB 2026',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Compte VIP créé</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">👑 Compte VIP Premium Créé</h1>
    <p style="color: #fef3c7; margin: 10px 0 0 0; font-size: 16px;">Finalisez votre paiement pour activer votre accès</p>
  </div>

  <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="font-size: 18px; margin-top: 0;">Bonjour <strong>{{name}}</strong>,</p>

    <p style="font-size: 16px;">
      Votre compte <strong>Pass VIP Premium</strong> pour SIB 2026 a été créé avec succès ! 🎉
    </p>

    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 25px 0; border-radius: 5px;">
      <h3 style="margin-top: 0; color: #d97706;">⚠️ Action requise : Finaliser le paiement</h3>
      <p style="margin: 10px 0;">
        Pour activer votre accès VIP et profiter de tous les avantages premium, veuillez finaliser le paiement de <strong>700 EUR</strong>.
      </p>
    </div>

    <p style="text-align: center; color: #666; font-size: 14px; margin-top: 30px;">
      Merci d''avoir choisi le Pass VIP Premium !<br>
      L''équipe SIB
    </p>
  </div>
</body>
</html>',
  'Bonjour {{name}},

Votre compte Pass VIP Premium pour SIB 2026 a été créé avec succès !

ACTION REQUISE : FINALISER LE PAIEMENT
Pour activer votre accès VIP, veuillez finaliser le paiement de 700 EUR.

Merci d''avoir choisi le Pass VIP Premium !
L''équipe SIB',
  '["name", "email", "level"]'::jsonb
);

COMMENT ON TABLE email_templates IS 'Templates d''emails personnalisables par les administrateurs';
COMMENT ON COLUMN email_templates.template_key IS 'Clé unique pour identifier le template (ex: visitor_welcome_free)';
COMMENT ON COLUMN email_templates.variables IS 'Liste des variables disponibles pour ce template (ex: ["name", "email", "level"])';
