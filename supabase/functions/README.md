# Supabase Edge Functions - SIPORTS 2026

## Nouvelles fonctions visiteur

### 1. `generate-visitor-badge`

Génère un badge QR sécurisé pour les visiteurs (Free et VIP).

**Endpoint**: POST `/functions/v1/generate-visitor-badge`

**Paramètres**:
```json
{
  "userId": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "level": "free" | "vip",
  "includePhoto": false,
  "photoUrl": "https://..." // Optionnel, requis pour VIP
}
```

**Réponse**:
```json
{
  "success": true,
  "badge": {
    "id": "uuid",
    "user_id": "uuid",
    "qr_data": "{...}",
    "badge_type": "visitor_free" | "visitor_premium",
    "current_token": "jwt_token",
    "token_expires_at": "2027-04-15T00:00:00Z",
    "photo_url": "https://...",
    "is_active": true
  },
  "qrContent": "{...}",
  "message": "Badge free/vip généré avec succès"
}
```

**Fonctionnalités**:
- Génération JWT sécurisé avec HMAC-SHA256
- Nonce anti-replay unique
- Expiration 1 an
- Zones d'accès différenciées Free vs VIP
- Création ou mise à jour badge existant
- Stockage dans table `digital_badges`

### 2. `send-visitor-welcome-email`

Envoie un email de bienvenue personnalisé selon le niveau du visiteur.

**Endpoint**: POST `/functions/v1/send-visitor-welcome-email`

**Paramètres**:
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "level": "free" | "vip",
  "userId": "uuid"
}
```

**Réponse**:
```json
{
  "success": true,
  "message": "Email envoyé avec succès à user@example.com",
  "emailId": "resend_email_id"
}
```

**Fonctionnalités**:
- Templates HTML/Text différenciés Free vs VIP
- **Email Free**: Badge + infos salon + upgrade VIP
- **Email VIP**: Instructions paiement + avantages premium
- Service: Resend API (configurer `RESEND_API_KEY`)
- Fallback gracieux si API key manquante (dev mode)

## Variables d'environnement requises

### Pour `generate-visitor-badge`:
- `SUPABASE_URL` (automatique)
- `SUPABASE_SERVICE_ROLE_KEY` (automatique)
- `JWT_SECRET` (optionnel, défaut fourni)

### Pour `send-visitor-welcome-email`:
- `RESEND_API_KEY` (requis en production)
- `PUBLIC_SITE_URL` (optionnel, pour liens dans emails)

## Configuration Resend

1. Créer un compte sur [resend.com](https://resend.com)
2. Ajouter et vérifier votre domaine `siports2026.com`
3. Générer une API key
4. Dans Supabase Dashboard > Edge Functions > Secrets:
   ```bash
   RESEND_API_KEY=re_xxxxxxxxxxxxx
   PUBLIC_SITE_URL=https://siports2026.com
   ```

## Déploiement

```bash
# Déployer les deux fonctions
supabase functions deploy generate-visitor-badge
supabase functions deploy send-visitor-welcome-email

# Ou déployer toutes les fonctions
supabase functions deploy
```

## Test local

```bash
# Démarrer Supabase local
supabase start

# Tester generate-visitor-badge
curl -i --location --request POST 'http://localhost:54321/functions/v1/generate-visitor-badge' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"userId":"uuid","email":"test@test.com","name":"Test User","level":"free"}'

# Tester send-visitor-welcome-email
curl -i --location --request POST 'http://localhost:54321/functions/v1/send-visitor-welcome-email' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"email":"test@test.com","name":"Test User","level":"free","userId":"uuid"}'
```

## Workflow d'inscription

### Visiteur Gratuit
1. Utilisateur remplit formulaire `/visitor/register/free`
2. Création compte Supabase Auth (password temporaire)
3. Insertion dans table `users` avec `visitor_level='free'`
4. **Appel** `generate-visitor-badge` → badge QR créé
5. **Appel** `send-visitor-welcome-email` → email envoyé
6. Logout automatique
7. Redirection vers home

### Visiteur VIP
1. Utilisateur remplit formulaire `/visitor/register/vip` + **photo**
2. Upload photo vers Storage (`visitor-photos/`)
3. Création compte Supabase Auth (password réel)
4. Insertion dans table `users` avec `visitor_level='vip'` + `status='pending_payment'`
5. Création `payment_request`
6. **Appel** `send-visitor-welcome-email` → email instructions paiement
7. Logout automatique
8. Redirection vers page paiement
9. *Après paiement validé*: `generate-visitor-badge` appelé + email badge envoyé

## Sécurité

- JWT avec HMAC-SHA256
- Nonce unique anti-replay
- CORS configuré
- Service role key pour accès DB
- Validation inputs
- Gestion d'erreurs complète
- Logs détaillés

## Tables DB requises

```sql
-- digital_badges
CREATE TABLE digital_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  qr_data TEXT NOT NULL,
  badge_type TEXT NOT NULL,
  current_token TEXT NOT NULL,
  token_expires_at TIMESTAMPTZ,
  last_rotation_at TIMESTAMPTZ,
  rotation_interval_seconds INT DEFAULT 30,
  photo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- payment_requests
CREATE TABLE payment_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  payment_method TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Support

Pour toute question concernant ces edge functions :
- Email : dev@siports2026.com
- Documentation Supabase : https://supabase.com/docs/guides/functions
