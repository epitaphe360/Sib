/**
 * AdminConfigPage – Gestion centralisée des APIs et paramètres de l'application
 * Permet à l'administrateur de configurer toutes les clés API depuis le dashboard
 */
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Settings, Database, Mail, Key, Globe, CreditCard, Bell,
  CheckCircle, XCircle, Eye, EyeOff, Save, RefreshCw,
  AlertTriangle, Server, Shield, Smartphone, ChevronDown,
  ChevronUp, Copy, Check, Loader2, Info, ExternalLink
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { Button } from '../../components/ui/Button';

// ─── Types ──────────────────────────────────────────────────────────────────

interface ConfigField {
  key: string;
  label: string;
  placeholder: string;
  type: 'text' | 'password' | 'url' | 'number' | 'email';
  required: boolean;
  hint?: string;
  docUrl?: string;
}

interface ConfigStep {
  step: number;
  title: string;
  detail: string;
  url?: string;
}

interface ConfigSection {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  description: string;
  howToGet?: ConfigStep[];
  fields: ConfigField[];
}

interface AppConfig {
  [key: string]: string;
}

// ─── Sections de configuration ───────────────────────────────────────────────

const CONFIG_SECTIONS: ConfigSection[] = [
  {
    id: 'general',
    label: 'Général',
    icon: Settings,
    color: '#C9A84C',
    description: 'Informations générales de l\'application et contacts',
    howToGet: [
      { step: 1, title: 'APP_URL', detail: 'C\'est l\'adresse de votre site en production. Ex : https://www.sib2026.ma — vous la choisissez lors de la configuration de votre domaine.' },
      { step: 2, title: 'FRONTEND_URL', detail: 'Allez sur vercel.com → votre projet → onglet "Domains". Copiez l\'URL générée (ex: sib-2026.vercel.app).', url: 'https://vercel.com/dashboard' },
      { step: 3, title: 'CONTACT_EMAIL / ADMIN_EMAIL', detail: 'Saisissez simplement l\'adresse email de l\'équipe SIB qui recevra les notifications et formulaires de contact.' },
    ],
    fields: [
      { key: 'APP_NAME', label: 'Nom de l\'application', placeholder: 'SIB 2026', type: 'text', required: true },
      { key: 'APP_URL', label: 'URL Application (production)', placeholder: 'https://www.sib2026.ma', type: 'url', required: true },
      { key: 'FRONTEND_URL', label: 'URL Frontend (Vercel)', placeholder: 'https://sib-2026.vercel.app', type: 'url', required: true },
      { key: 'CONTACT_EMAIL', label: 'Email de contact principal', placeholder: 'Sib2026@urbacom.net', type: 'email', required: true },
      { key: 'ADMIN_EMAIL', label: 'Email administrateur', placeholder: 'admin@sib2026.ma', type: 'email', required: true },
    ],
  },
  {
    id: 'supabase',
    label: 'Supabase (Base de données)',
    icon: Database,
    color: '#3ECF8E',
    description: 'Connexion à la base de données PostgreSQL via Supabase',
    howToGet: [
      { step: 1, title: 'Ouvrir Supabase', detail: 'Allez sur app.supabase.com et connectez-vous à votre compte.', url: 'https://app.supabase.com' },
      { step: 2, title: 'Sélectionner votre projet', detail: 'Cliquez sur le projet "SIB 2026" dans la liste de vos projets.' },
      { step: 3, title: 'Accéder aux clés API', detail: 'Dans le menu gauche, cliquez sur "Project Settings" (⚙️) → onglet "API". Vous y verrez : l\'URL du projet, la clé anon (publique) et la clé service_role (privée).', url: 'https://app.supabase.com/project/_/settings/api' },
      { step: 4, title: 'Copier les valeurs', detail: 'URL du projet → champ VITE_SUPABASE_URL | anon public → champ VITE_SUPABASE_ANON_KEY | service_role → champ SUPABASE_SERVICE_ROLE_KEY (⚠️ ne jamais exposer cette clé côté client).' },
    ],
    fields: [
      { key: 'VITE_SUPABASE_URL', label: 'URL Supabase', placeholder: 'https://xxxx.supabase.co', type: 'url', required: true, docUrl: 'https://app.supabase.com/project/_/settings/api', hint: 'Exemple : https://sbyizudifmqakzxjlndr.supabase.co' },
      { key: 'VITE_SUPABASE_ANON_KEY', label: 'Clé Anon (publique)', placeholder: 'eyJhbGc...', type: 'password', required: true, hint: 'Commence par eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... — clé publique sans risque côté client' },
      { key: 'SUPABASE_SERVICE_ROLE_KEY', label: 'Clé Service Role (privée)', placeholder: 'eyJhbGc...', type: 'password', required: true, hint: '⚠️ Clé secrète à mettre UNIQUEMENT dans Railway (variables env serveur), jamais dans le frontend' },
    ],
  },
  {
    id: 'smtp',
    label: 'Email SMTP',
    icon: Mail,
    color: '#3B82F6',
    description: 'Serveur d\'envoi d\'emails (bienvenue, notifications, confirmations)',
    howToGet: [
      { step: 1, title: 'Choisir un fournisseur email', detail: 'Option A — Gmail (gratuit) : utilisez l\'email contact@sib2026.ma ou un Gmail dédié. Option B — OVH (si vous avez un domaine sib2026.ma chez OVH). Option C — Resend.com (recommandé, 100 emails/jour gratuit).' },
      { step: 2, title: 'Gmail — Créer un App Password', detail: 'Allez sur myaccount.google.com → Sécurité → Validation en 2 étapes (activer si pas encore fait) → "Mots de passe des applications" → Générer. Copiez les 16 caractères affichés.', url: 'https://myaccount.google.com/apppasswords' },
      { step: 3, title: 'OVH — Récupérer les paramètres', detail: 'Dans votre espace OVH → Email Pro ou MX Plan → votre compte email → "Configuration" → vous trouverez : serveur SMTP (ex: ssl0.ovh.net), port 587, login = adresse email, mdp = votre mot de passe email.', url: 'https://www.ovhcloud.com/fr/emails/' },
      { step: 4, title: 'Remplir les champs', detail: 'Gmail → Host: smtp.gmail.com, Port: 587, User: votre@gmail.com, Pass: le App Password (16 caractères). OVH → Host: ssl0.ovh.net, Port: 587, User: contact@sib2026.ma, Pass: mot de passe email.' },
    ],
    fields: [
      { key: 'SMTP_HOST', label: 'Serveur SMTP', placeholder: 'smtp.gmail.com', type: 'text', required: true, hint: 'Gmail: smtp.gmail.com | OVH: ssl0.ovh.net | Outlook: smtp.office365.com' },
      { key: 'SMTP_PORT', label: 'Port SMTP', placeholder: '587', type: 'number', required: true, hint: '587 = TLS (recommandé) | 465 = SSL | 25 = non sécurisé (déconseillé)' },
      { key: 'SMTP_USER', label: 'Email expéditeur', placeholder: 'contact@sib2026.ma', type: 'email', required: true, hint: 'L\'adresse email utilisée pour envoyer (doit correspondre au compte SMTP)' },
      { key: 'SMTP_PASS', label: 'Mot de passe / App Password', placeholder: 'xxxx xxxx xxxx xxxx', type: 'password', required: true, hint: 'Gmail: générer un App Password (pas votre mot de passe Gmail normal !)', docUrl: 'https://myaccount.google.com/apppasswords' },
      { key: 'SMTP_FROM_NAME', label: 'Nom expéditeur affiché', placeholder: 'SIB 2026', type: 'text', required: false, hint: 'Ce nom apparaît dans la boîte de réception du destinataire ex: "SIB 2026 <contact@sib2026.ma>"' },
    ],
  },
  {
    id: 'firebase',
    label: 'Firebase (Auth Google)',
    icon: Smartphone,
    color: '#FFCA28',
    description: 'Authentification Google OAuth et notifications push (FCM)',
    howToGet: [
      { step: 1, title: 'Ouvrir Firebase Console', detail: 'Allez sur console.firebase.google.com et connectez-vous avec votre compte Google.', url: 'https://console.firebase.google.com' },
      { step: 2, title: 'Sélectionner votre projet', detail: 'Cliquez sur le projet SIB 2026 dans la liste. Si aucun projet, cliquez "Ajouter un projet" et suivez les étapes.' },
      { step: 3, title: 'Accéder à la configuration Web', detail: 'Dans le menu gauche, cliquez sur l\'icône ⚙️ (Paramètres du projet) → onglet "Général" → faites défiler vers le bas jusqu\'à "Vos applications" → cliquez sur votre app Web (icône </>) → vous verrez le bloc "firebaseConfig".' },
      { step: 4, title: 'Copier chaque valeur', detail: 'apiKey → VITE_FIREBASE_API_KEY | authDomain → VITE_FIREBASE_AUTH_DOMAIN | projectId → VITE_FIREBASE_PROJECT_ID | storageBucket → VITE_FIREBASE_STORAGE_BUCKET | messagingSenderId → VITE_FIREBASE_MESSAGING_SENDER_ID | appId → VITE_FIREBASE_APP_ID' },
      { step: 5, title: 'Activer l\'auth Google', detail: 'Dans Firebase, menu "Authentication" → onglet "Sign-in method" → cliquer "Google" → activer et configurer votre email de support.' },
    ],
    fields: [
      { key: 'VITE_FIREBASE_API_KEY', label: 'API Key', placeholder: 'AIzaSy...', type: 'password', required: true, docUrl: 'https://console.firebase.google.com', hint: 'Commence toujours par "AIzaSy" — visible dans Paramètres projet → Vos applications → Web' },
      { key: 'VITE_FIREBASE_AUTH_DOMAIN', label: 'Auth Domain', placeholder: 'monprojet.firebaseapp.com', type: 'text', required: true, hint: 'Format : votre-projet-id.firebaseapp.com' },
      { key: 'VITE_FIREBASE_PROJECT_ID', label: 'Project ID', placeholder: 'sib-2026', type: 'text', required: true, hint: 'L\'identifiant unique de votre projet Firebase (visible aussi dans l\'URL de la console)' },
      { key: 'VITE_FIREBASE_STORAGE_BUCKET', label: 'Storage Bucket', placeholder: 'monprojet.appspot.com', type: 'text', required: false, hint: 'Format : votre-projet-id.appspot.com' },
      { key: 'VITE_FIREBASE_MESSAGING_SENDER_ID', label: 'Messaging Sender ID', placeholder: '123456789012', type: 'text', required: false, hint: 'Nombre de 12 chiffres — utilisé pour les notifications push FCM' },
      { key: 'VITE_FIREBASE_APP_ID', label: 'App ID', placeholder: '1:123456789:web:abc123', type: 'password', required: true, hint: 'Format : 1:SENDER_ID:web:HASH — visible dans Paramètres projet → Vos applications' },
    ],
  },
  {
    id: 'payments',
    label: 'Paiements',
    icon: CreditCard,
    color: '#8B5CF6',
    description: 'Stripe, PayPal et configurations de paiement',
    howToGet: [
      { step: 1, title: 'Stripe — Créer un compte', detail: 'Allez sur stripe.com → "Commencer" → créez votre compte avec l\'email SIB. Remplissez les informations d\'entreprise pour activer les paiements réels.', url: 'https://stripe.com' },
      { step: 2, title: 'Stripe — Récupérer les clés', detail: 'Dans le dashboard Stripe → menu gauche "Développeurs" → "Clés API". Vous verrez : Clé publiable (pk_live_...) et Clé secrète (sk_live_...). En test, elles commencent par pk_test_ et sk_test_.', url: 'https://dashboard.stripe.com/apikeys' },
      { step: 3, title: 'Stripe — Webhook Secret', detail: 'Dans Stripe → "Développeurs" → "Webhooks" → "Ajouter un endpoint" → saisissez votre URL (ex: https://votre-railway.app/api/webhook/stripe) → sélectionnez les événements → après création, cliquez sur le webhook → "Révéler" pour voir le whsec_...', url: 'https://dashboard.stripe.com/webhooks' },
      { step: 4, title: 'PayPal — Créer une application', detail: 'Allez sur developer.paypal.com → "My Apps & Credentials" → "Create App" → nommez-la "SIB 2026" → copiez le Client ID et Client Secret de l\'onglet "Live".', url: 'https://developer.paypal.com/dashboard/applications/live' },
    ],
    fields: [
      { key: 'VITE_STRIPE_PUBLISHABLE_KEY', label: 'Stripe Clé Publique', placeholder: 'pk_live_...', type: 'password', required: false, hint: 'Commence par pk_live_ (production) ou pk_test_ (test) — utilisée côté frontend', docUrl: 'https://dashboard.stripe.com/apikeys' },
      { key: 'STRIPE_SECRET_KEY', label: 'Stripe Clé Secrète (serveur)', placeholder: 'sk_live_...', type: 'password', required: false, hint: '⚠️ Commence par sk_live_ — à mettre UNIQUEMENT dans Railway (jamais dans le code frontend)', docUrl: 'https://dashboard.stripe.com/apikeys' },
      { key: 'STRIPE_WEBHOOK_SECRET', label: 'Stripe Webhook Secret', placeholder: 'whsec_...', type: 'password', required: false, hint: 'Commence par whsec_ — obtenu dans Stripe → Développeurs → Webhooks → votre endpoint', docUrl: 'https://dashboard.stripe.com/webhooks' },
      { key: 'PAYPAL_CLIENT_ID', label: 'PayPal Client ID', placeholder: 'AaBbCc...', type: 'password', required: false, hint: 'Visible dans developer.paypal.com → My Apps → votre app → onglet "Live"', docUrl: 'https://developer.paypal.com/dashboard/applications/live' },
      { key: 'PAYPAL_CLIENT_SECRET', label: 'PayPal Client Secret', placeholder: 'EeFfGg...', type: 'password', required: false, hint: 'Cliquez "Show" à côté du Client Secret dans votre app PayPal' },
      { key: 'VIP_PRICE_EUR', label: 'Prix Pass VIP (EUR)', placeholder: '700', type: 'number', required: false, hint: 'Montant en euros affiché aux visiteurs pour l\'upgrade VIP' },
    ],
  },
  {
    id: 'resend',
    label: 'Resend (Emails alternatif)',
    icon: Bell,
    color: '#EC4899',
    description: 'Alternative à SMTP — API Resend pour Supabase Edge Functions',
    howToGet: [
      { step: 1, title: 'Créer un compte Resend', detail: 'Allez sur resend.com → "Get Started" → créez un compte gratuit (100 emails/jour inclus, pas de CB requise).', url: 'https://resend.com' },
      { step: 2, title: 'Vérifier votre domaine (optionnel mais recommandé)', detail: 'Dans Resend → "Domains" → "Add Domain" → saisissez sib2026.ma → suivez les instructions pour ajouter les enregistrements DNS chez votre registrar (OVH, Gandi...). Cela améliore la délivrabilité.' },
      { step: 3, title: 'Créer une clé API', detail: 'Dans Resend → "API Keys" → "Create API Key" → nommez-la "SIB Production" → copiez la clé re_... affichée (elle ne sera plus visible ensuite).', url: 'https://resend.com/api-keys' },
      { step: 4, title: 'Configurer l\'email expéditeur', detail: 'Si votre domaine est vérifié, utilisez noreply@sib2026.ma. Sinon, utilisez onboarding@resend.dev (email de test fourni par Resend).' },
    ],
    fields: [
      { key: 'RESEND_API_KEY', label: 'Resend API Key', placeholder: 're_...', type: 'password', required: false, hint: 'Commence par re_ — obtenu dans Resend → API Keys → Create API Key. Gratuit jusqu\'à 100 emails/jour.', docUrl: 'https://resend.com/api-keys' },
      { key: 'RESEND_FROM_EMAIL', label: 'Email expéditeur Resend', placeholder: 'noreply@sib2026.ma', type: 'email', required: false, hint: 'Doit être sur un domaine vérifié dans Resend, sinon utilisez onboarding@resend.dev pour les tests' },
    ],
  },
  {
    id: 'security',
    label: 'Sécurité',
    icon: Shield,
    color: '#EF4444',
    description: 'reCAPTCHA, JWT et paramètres de sécurité',
    howToGet: [
      { step: 1, title: 'reCAPTCHA — Créer des clés', detail: 'Allez sur google.com/recaptcha/admin → "+" pour créer → choisissez "reCAPTCHA v3" → saisissez vos domaines (sib2026.ma, localhost) → acceptez les conditions → vous obtenez une Site Key (publique) et une Secret Key (privée).', url: 'https://www.google.com/recaptcha/admin/create' },
      { step: 2, title: 'reCAPTCHA — Où mettre les clés', detail: 'Site Key (commence par 6Lc...) → champ VITE_RECAPTCHA_SITE_KEY (côté frontend). Secret Key → champ RECAPTCHA_SECRET_KEY (côté serveur Railway uniquement).' },
      { step: 3, title: 'JWT Secret — Générer une clé', detail: 'Ouvrez un terminal et tapez : openssl rand -base64 64 — copiez le résultat. Ou utilisez un générateur en ligne de confiance. Doit faire au moins 32 caractères aléatoires.' },
    ],
    fields: [
      { key: 'VITE_RECAPTCHA_SITE_KEY', label: 'reCAPTCHA Site Key (publique)', placeholder: '6Lc...', type: 'text', required: false, docUrl: 'https://www.google.com/recaptcha/admin', hint: 'Commence par 6Lc — clé publique utilisée dans les formulaires du site' },
      { key: 'RECAPTCHA_SECRET_KEY', label: 'reCAPTCHA Secret Key (serveur)', placeholder: '6Lc...', type: 'password', required: false, hint: '⚠️ Clé privée — à mettre uniquement dans les variables d\'environnement Railway' },
      { key: 'JWT_SECRET', label: 'JWT Secret (optionnel)', placeholder: 'un-secret-aleatoire-tres-long', type: 'password', required: false, hint: 'Générer dans un terminal : openssl rand -base64 64 (minimum 32 caractères aléatoires)' },
      { key: 'SESSION_TIMEOUT_MINUTES', label: 'Timeout session (minutes)', placeholder: '60', type: 'number', required: false, hint: 'Durée avant déconnexion automatique d\'un utilisateur inactif. Ex: 60 = 1 heure' },
    ],
  },
  {
    id: 'server',
    label: 'Serveur (Railway)',
    icon: Server,
    color: '#06B6D4',
    description: 'Configuration du serveur Express.js déployé sur Railway',
    howToGet: [
      { step: 1, title: 'Créer un projet Railway', detail: 'Allez sur railway.app → "New Project" → "Deploy from GitHub repo" → sélectionnez votre dépôt SIB. Railway détectera automatiquement Node.js.', url: 'https://railway.app' },
      { step: 2, title: 'Récupérer l\'URL Railway', detail: 'Dans Railway → votre projet → votre service → onglet "Settings" → section "Domains" → cliquez "Generate Domain" ou ajoutez votre domaine personnalisé. Copiez l\'URL générée (ex: sib-production.up.railway.app).' },
      { step: 3, title: 'Configurer les variables d\'environnement Railway', detail: 'Dans Railway → votre service → onglet "Variables" → ajoutez chaque clé (SMTP_PASS, SUPABASE_SERVICE_ROLE_KEY, STRIPE_SECRET_KEY, etc.). Ces variables sont chiffrées et sécurisées.', url: 'https://railway.app' },
      { step: 4, title: 'CORS — Quels domaines ajouter', detail: 'Listez tous les domaines qui peuvent appeler votre API, séparés par des virgules : https://sib2026.ma,https://www.sib2026.ma,https://sib-2026.vercel.app,http://localhost:5173' },
    ],
    fields: [
      { key: 'PORT', label: 'Port serveur', placeholder: '5000', type: 'number', required: false, hint: 'Railway utilise le port 5000 en production. En développement local, c\'est 3000. Railway injecte aussi $PORT automatiquement.' },
      { key: 'NODE_ENV', label: 'Environnement', placeholder: 'production', type: 'text', required: true, hint: 'Valeur exacte : "production" (déployé) ou "development" (local). Active le HTTPS redirect en prod.' },
      { key: 'RAILWAY_URL', label: 'URL Railway (API backend)', placeholder: 'https://sib-production.up.railway.app', type: 'url', required: false, hint: 'L\'URL publique de votre service Railway — visible dans Settings → Domains du service' },
      { key: 'CORS_ORIGIN', label: 'Origines CORS autorisées', placeholder: 'https://sib2026.ma,https://www.sib2026.ma', type: 'text', required: false, hint: 'Domaines autorisés à appeler l\'API, séparés par des virgules. Inclure Vercel + domaine production + localhost pour le dev.' },
    ],
  },
];

// ─── Composant guide étapes ───────────────────────────────────────────────────

function HowToGuide({ steps, color }: { steps: ConfigStep[]; color: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-4 rounded-xl overflow-hidden" style={{ border: `1px solid ${color}25` }}>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left transition-colors hover:bg-white/3"
        style={{ background: `${color}10` }}
      >
        <span className="flex items-center gap-2 text-sm font-semibold" style={{ color }}>
          <Info className="h-4 w-4" />
          Comment trouver ces informations ?
        </span>
        {open ? <ChevronUp className="h-4 w-4" style={{ color }} /> : <ChevronDown className="h-4 w-4" style={{ color }} />}
      </button>
      {open && (
        <div className="px-4 py-4 space-y-3" style={{ background: 'rgba(0,0,0,0.2)' }}>
          {steps.map(s => (
            <div key={s.step} className="flex gap-3">
              <div
                className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mt-0.5"
                style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}
              >
                {s.step}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-white/80">{s.title}</span>
                  {s.url && (
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full transition-colors"
                      style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}
                    >
                      <ExternalLink className="h-3 w-3" /> Ouvrir le lien
                    </a>
                  )}
                </div>
                <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  {s.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Composant champ de saisie ────────────────────────────────────────────────

function ConfigInput({
  field,
  value,
  onChange,
}: {
  field: ConfigField;
  value: string;
  onChange: (key: string, value: string) => void;
}) {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  const isPassword = field.type === 'password';
  const inputType = isPassword && !visible ? 'password' : (field.type === 'number' ? 'number' : 'text');

  const handleCopy = () => {
    if (value) {
      navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-white/80 flex items-center gap-1.5">
          {field.label}
          {field.required && <span className="text-red-400 text-xs">*</span>}
          {field.docUrl && (
            <a href={field.docUrl} target="_blank" rel="noopener noreferrer"
              className="text-[#C9A84C]/60 hover:text-[#C9A84C] transition-colors">
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </label>
        {value && (
          <span className="flex items-center gap-1 text-xs text-green-400">
            <CheckCircle className="h-3 w-3" /> Configuré
          </span>
        )}
        {!value && field.required && (
          <span className="flex items-center gap-1 text-xs text-red-400">
            <XCircle className="h-3 w-3" /> Requis
          </span>
        )}
      </div>

      <div className="relative flex items-center">
        <input
          type={inputType}
          value={value || ''}
          onChange={e => onChange(field.key, e.target.value)}
          placeholder={field.placeholder}
          className="w-full px-3 py-2.5 pr-16 text-sm bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/25 focus:outline-none focus:border-[#C9A84C]/50 focus:bg-white/8 transition-all"
        />
        <div className="absolute right-2 flex items-center gap-1">
          {isPassword && (
            <button type="button" onClick={() => setVisible(v => !v)}
              className="p-1 text-white/30 hover:text-white/70 transition-colors">
              {visible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          )}
          <button type="button" onClick={handleCopy}
            className="p-1 text-white/30 hover:text-white/70 transition-colors">
            {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {field.hint && (
        <p className="text-xs text-white/30 flex items-start gap-1">
          <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
          {field.hint}
        </p>
      )}
    </div>
  );
}

// ─── Composant section ────────────────────────────────────────────────────────

function ConfigSectionCard({
  section,
  values,
  onChange,
  onSave,
  saving,
}: {
  section: ConfigSection;
  values: AppConfig;
  onChange: (key: string, value: string) => void;
  onSave: (sectionId: string) => void;
  saving: string | null;
}) {
  const [expanded, setExpanded] = useState(true);
  const Icon = section.icon;

  const totalFields = section.fields.length;
  const configuredFields = section.fields.filter(f => values[f.key]).length;
  const requiredFields = section.fields.filter(f => f.required);
  const missingRequired = requiredFields.filter(f => !values[f.key]).length;
  const isComplete = missingRequired === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      {/* Header section */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between p-5 hover:bg-white/2 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl" style={{ background: `${section.color}18`, border: `1px solid ${section.color}30` }}>
            <Icon className="h-5 w-5" style={{ color: section.color }} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">{section.label}</h3>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{section.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Progress pill */}
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${isComplete ? 'bg-green-500/15 text-green-400' : missingRequired > 0 ? 'bg-red-500/15 text-red-400' : 'bg-yellow-500/15 text-yellow-400'}`}>
              {isComplete
                ? <><CheckCircle className="h-3 w-3" /> Complet</>
                : <><XCircle className="h-3 w-3" /> {missingRequired} requis manquant{missingRequired > 1 ? 's' : ''}</>
              }
            </div>
            <span className="text-xs text-white/30">{configuredFields}/{totalFields}</span>
          </div>
          {expanded ? <ChevronUp className="h-4 w-4 text-white/40" /> : <ChevronDown className="h-4 w-4 text-white/40" />}
        </div>
      </button>

      {/* Fields */}
      {expanded && (
        <div className="px-5 pb-5 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>          {/* Guide étapes */}
          {section.howToGet && section.howToGet.length > 0 && (
            <HowToGuide steps={section.howToGet} color={section.color} />
          )}          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            {section.fields.map(field => (
              <ConfigInput
                key={field.key}
                field={field}
                value={values[field.key] || ''}
                onChange={onChange}
              />
            ))}
          </div>

          <div className="flex justify-end mt-5">
            <Button
              onClick={() => onSave(section.id)}
              disabled={saving === section.id}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-xl text-[#0F2034]"
              style={{ background: '#C9A84C' }}
            >
              {saving === section.id
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Enregistrement...</>
                : <><Save className="h-4 w-4" /> Sauvegarder {section.label}</>
              }
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function AdminConfigPage() {
  const [config, setConfig] = useState<AppConfig>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [testingEmail, setTestingEmail] = useState(false);
  const [testingDb, setTestingDb] = useState(false);

  // Charger la config depuis Supabase
  const loadConfig = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('key, value');

      if (error) {
        // Table peut ne pas exister encore
        if (error.code === '42P01') {
          toast.info('La table app_settings n\'existe pas encore. Elle sera créée lors du premier enregistrement.');
        }
        setConfig({});
        return;
      }

      const configMap: AppConfig = {};
      (data || []).forEach(({ key, value }: { key: string; value: string }) => {
        configMap[key] = value;
      });
      setConfig(configMap);
    } catch {
      toast.error('Erreur lors du chargement de la configuration');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const handleChange = (key: string, value: string) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async (sectionId: string) => {
    setSaving(sectionId);
    const section = CONFIG_SECTIONS.find(s => s.id === sectionId);
    if (!section) return;

    try {
      const upserts = section.fields
        .filter(f => config[f.key] !== undefined)
        .map(f => ({ key: f.key, value: config[f.key] || '', updated_at: new Date().toISOString() }));

      if (upserts.length === 0) {
        toast.info('Aucune valeur à enregistrer');
        return;
      }

      // Tentative d'upsert
      const { error } = await supabase
        .from('app_settings')
        .upsert(upserts, { onConflict: 'key' });

      if (error) {
        if (error.code === '42P01') {
          toast.error('La table app_settings n\'existe pas. Exécutez la migration SQL d\'abord.', { duration: 6000 });
        } else {
          throw error;
        }
        return;
      }

      toast.success(`✅ Section "${section.label}" sauvegardée avec succès`);
    } catch (err: unknown) {
      toast.error(`Erreur: ${err instanceof Error ? err.message : 'Inconnue'}`);
    } finally {
      setSaving(null);
    }
  };

  const handleTestEmail = async () => {
    setTestingEmail(true);
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      if (data.email === 'configured') {
        toast.success('✅ SMTP configuré et opérationnel');
      } else {
        toast.warning('⚠️ SMTP non configuré (SMTP_PASS manquant sur le serveur)');
      }
    } catch {
      toast.error('❌ Impossible de contacter le serveur API');
    } finally {
      setTestingEmail(false);
    }
  };

  const handleTestDb = async () => {
    setTestingDb(true);
    try {
      const { error } = await supabase.from('users').select('id').limit(1);
      if (error) throw error;
      toast.success('✅ Connexion Supabase opérationnelle');
    } catch (err: unknown) {
      toast.error(`❌ Erreur Supabase: ${err instanceof Error ? err.message : 'Connexion échouée'}`);
    } finally {
      setTestingDb(false);
    }
  };

  // Calculer le score de complétion global
  const allRequired = CONFIG_SECTIONS.flatMap(s => s.fields.filter(f => f.required));
  const configuredRequired = allRequired.filter(f => config[f.key]);
  const completionPct = allRequired.length > 0
    ? Math.round((configuredRequired.length / allRequired.length) * 100)
    : 0;

  return (
    <div
      className="min-h-screen"
      style={{ background: 'radial-gradient(ellipse at 50% -5%, #0f2240 0%, #07101e 55%, #04080f 100%)' }}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-xl" style={{ background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.3)' }}>
                  <Key className="h-6 w-6" style={{ color: '#C9A84C' }} />
                </div>
                <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'var(--font-heading, serif)' }}>
                  Configuration Centralisée
                </h1>
              </div>
              <p className="text-white/40 text-sm ml-14">
                Gérez toutes les clés API et paramètres de l'application depuis un seul endroit
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 ml-14 flex-wrap">
              <button
                onClick={handleTestDb}
                disabled={testingDb}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white/70 hover:text-white transition-colors"
                style={{ background: 'rgba(62,207,142,0.1)', border: '1px solid rgba(62,207,142,0.2)' }}
              >
                {testingDb ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4 text-[#3ECF8E]" />}
                Tester Supabase
              </button>
              <button
                onClick={handleTestEmail}
                disabled={testingEmail}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white/70 hover:text-white transition-colors"
                style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}
              >
                {testingEmail ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4 text-blue-400" />}
                Tester Email
              </button>
              <button
                onClick={loadConfig}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white/50 hover:text-white/80 transition-colors"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Actualiser
              </button>
            </div>
          </div>

          {/* Barre de progression globale */}
          <div className="mt-6 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white/70">Complétion globale</span>
              <span className="text-sm font-bold" style={{ color: completionPct === 100 ? '#3ECF8E' : completionPct >= 60 ? '#C9A84C' : '#EF4444' }}>
                {completionPct}%
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completionPct}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-2 rounded-full transition-all"
                style={{
                  background: completionPct === 100
                    ? 'linear-gradient(to right, #3ECF8E, #22c55e)'
                    : completionPct >= 60
                    ? 'linear-gradient(to right, #C9A84C, #f59e0b)'
                    : 'linear-gradient(to right, #EF4444, #f97316)',
                }}
              />
            </div>
            <p className="text-xs text-white/30 mt-2">
              {configuredRequired.length} / {allRequired.length} champs obligatoires configurés
            </p>
          </div>

          {/* Avertissement champs sensibles */}
          <div className="mt-4 flex items-start gap-3 p-4 rounded-xl"
            style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)' }}>
            <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: '#C9A84C' }} />
            <div className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
              <strong className="text-[#C9A84C]">Important :</strong> Les clés secrètes (Service Role, SMTP Password, Stripe Secret) sont enregistrées
              dans la table <code className="bg-white/10 px-1 py-0.5 rounded text-white/70">app_settings</code> de Supabase (chiffrée par RLS).
              Pour une sécurité maximale en production, utilisez également les variables d'environnement Railway.
            </div>
          </div>
        </motion.div>

        {/* Sections */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-[#C9A84C] mb-4" />
            <p className="text-white/40">Chargement de la configuration...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {CONFIG_SECTIONS.map((section, i) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <ConfigSectionCard
                  section={section}
                  values={config}
                  onChange={handleChange}
                  onSave={handleSave}
                  saving={saving}
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* Note migration SQL */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 p-5 rounded-2xl"
          style={{ background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.2)' }}
        >
          <div className="flex items-start gap-3">
            <Globe className="h-5 w-5 mt-0.5 flex-shrink-0 text-cyan-400" />
            <div>
              <h4 className="text-sm font-semibold text-white mb-1">Première utilisation ? Créer la table app_settings</h4>
              <p className="text-xs text-white/40 mb-3">
                Exécutez ce SQL dans votre Supabase Dashboard → SQL Editor :
              </p>
              <pre className="text-xs bg-black/40 p-3 rounded-lg text-cyan-300 overflow-x-auto whitespace-pre-wrap">
{`CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin only" ON app_settings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND type = 'admin')
  );`}
              </pre>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
