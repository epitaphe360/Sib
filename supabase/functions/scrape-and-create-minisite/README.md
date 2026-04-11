# Edge Function: scrape-and-create-minisite

## Description
Cette Edge Function permet de créer automatiquement un mini-site pour un exposant en scrapant son site web existant.

## Fonctionnalités
- ✅ **Headers CORS complets** : Gère correctement les requêtes cross-origin depuis Railway et autres domaines
- 🌐 **Scraping web** : Extrait automatiquement titre, description et contenu du site web
- 🏗️ **Création automatique** : Crée ou met à jour le mini-site dans la base de données
- 🔒 **Sécurisé** : Utilise le service role key pour les opérations privilégiées

## Déploiement

### Prérequis
- Supabase CLI installé : `npm install -g supabase`
- Compte Supabase avec accès au projet

### 1. Se connecter à Supabase
```bash
supabase login
```

### 2. Lier le projet
```bash
supabase link --project-ref sbyizudifmqakzxjlndr
```

### 3. Déployer la fonction
```bash
supabase functions deploy scrape-and-create-minisite
```

### 4. Vérifier le déploiement
```bash
supabase functions list
```

## Utilisation

### Depuis le frontend (déjà implémenté)
```typescript
const { data, error } = await supabase.functions.invoke('scrape-and-create-minisite', {
  body: {
    userId: 'user-id-here',
    websiteUrl: 'https://example.com'
  }
});
```

### Test avec curl
```bash
curl -X POST \
  https://sbyizudifmqakzxjlndr.supabase.co/functions/v1/scrape-and-create-minisite \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "your-user-id",
    "websiteUrl": "https://example.com"
  }'
```

## Headers CORS
La fonction gère automatiquement les headers CORS :
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS`
- `Access-Control-Allow-Headers: authorization, x-client-info, apikey, content-type, x-requested-with`
- `Access-Control-Max-Age: 86400`

## Gestion des erreurs
- **400** : userId ou websiteUrl manquant
- **500** : Erreur lors du scraping ou de la création du mini-site

## Logs
Les logs sont visibles dans le dashboard Supabase :
```
Dashboard > Edge Functions > scrape-and-create-minisite > Logs
```

## Sécurité
- ✅ Validation des paramètres d'entrée
- ✅ Utilisation du service role key (accès complet à la DB)
- ✅ Gestion des erreurs avec messages détaillés
- ✅ User-Agent personnalisé pour le scraping

## Structure de la réponse

### Succès (200)
```json
{
  "success": true,
  "miniSite": {
    "id": "minisite-id",
    "exhibitor_id": "exhibitor-id",
    "hero_title": "Titre extrait",
    "hero_subtitle": "Description extraite",
    ...
  },
  "message": "Mini-site créé avec succès"
}
```

### Erreur (400/500)
```json
{
  "error": "Message d'erreur",
  "details": "Détails supplémentaires"
}
```

## Notes
- La fonction extrait automatiquement les balises `<title>`, `<meta description>` et `<h1>` du site web
- Si un mini-site existe déjà pour l'exposant, il sera mis à jour au lieu d'être dupliqué
- Le scraping respecte les bonnes pratiques avec un User-Agent personnalisé
