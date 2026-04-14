# Configuration SMTP pour les Edge Functions

## Variables d'environnement à configurer dans Supabase

Pour que les emails fonctionnent, vous devez ajouter ces variables d'environnement dans **Supabase Dashboard** :

### Étapes :

1. Allez sur [Supabase Dashboard](https://supabase.com/dashboard/project/sbyizudifmqakzxjlndr)
2. Cliquez sur **Settings** (⚙️) dans le menu latéral gauche
3. Cliquez sur **Edge Functions**
4. Faites défiler jusqu'à **Manage secrets**
5. Ajoutez les variables suivantes :

### Variables SMTP :

```bash
SMTP_HOST=mail.sib2026.ma
SMTP_PORT=587
SMTP_USERNAME=contact@sib2026.ma
SMTP_PASSWORD=S!P0RT@9083
```

### Variables optionnelles :

```bash
PUBLIC_SITE_URL=https://sib2026.com
SENDER_EMAIL=contact@sib2026.ma
```

## Déploiement des Edge Functions

Après avoir configuré les variables d'environnement, déployez les Edge Functions mises à jour :

```powershell
# Déployer send-visitor-welcome-email
supabase functions deploy send-visitor-welcome-email

# Déployer send-template-email
supabase functions deploy send-template-email
```

## Test des Edge Functions

### Test send-visitor-welcome-email :

```powershell
supabase functions invoke send-visitor-welcome-email --data '{
  "email": "test@example.com",
  "name": "Test User",
  "level": "free",
  "userId": "test-123"
}'
```

### Test send-template-email :

```powershell
supabase functions invoke send-template-email --data '{
  "to": "test@example.com",
  "subject": "Test Email",
  "html": "<h1>Test</h1><p>Ceci est un email de test.</p>"
}'
```

## Logs

Pour voir les logs des Edge Functions :

```powershell
# Logs en temps réel
supabase functions logs send-visitor-welcome-email --follow

# Derniers logs
supabase functions logs send-template-email
```

## Configuration SMTP alternative (SSL au lieu de TLS)

Si le port 587 (TLS) ne fonctionne pas, vous pouvez essayer le port 465 (SSL) :

```bash
SMTP_PORT=465
```

Et modifier le code des Edge Functions pour utiliser `client.connect()` au lieu de `client.connectTLS()`.

## Troubleshooting

### Email non reçu ?

1. Vérifiez les logs Edge Functions : `supabase functions logs send-visitor-welcome-email`
2. Vérifiez que les variables d'environnement sont bien configurées dans Supabase
3. Testez la connexion SMTP avec telnet :
   ```powershell
   telnet mail.sib2026.ma 587
   ```
4. Vérifiez les spams dans la boîte de réception

### Erreur SMTP 535 (Authentication failed) ?

- Vérifiez que le mot de passe est correct
- Vérifiez que l'authentification SMTP est activée pour le compte email

### Erreur de connexion ?

- Vérifiez que le port 587 ou 465 n'est pas bloqué par un firewall
- Essayez de passer de TLS (587) à SSL (465)

## Références

- [Supabase Edge Functions Documentation](https://supabase.com/docs/guides/functions)
- [Deno SMTP Module](https://deno.land/x/smtp@v0.7.0)
