# 🔄 Synchronisation Automatique SIPORTS ↔ WordPress

## Comment ça fonctionne

Le plugin SIPORTS WordPress récupère automatiquement les médias depuis votre base de données Supabase. Les contenus sont synchronisés de deux manières :

### 1. Synchronisation par Cache (Par défaut)
- **Délai** : 5 minutes
- **Fonctionnement** : Le plugin garde en cache les données pendant 5 minutes, puis les rafraîchit automatiquement
- **Avantage** : Aucune configuration requise

### 2. Synchronisation Instantanée (Webhook)
- **Délai** : Immédiat
- **Fonctionnement** : Supabase notifie WordPress à chaque ajout/modification de média
- **Configuration requise** : Oui (voir ci-dessous)

---

## Configuration du Webhook Supabase

Pour une synchronisation instantanée, configurez un webhook dans Supabase :

### Étape 1 : Accéder aux Webhooks
1. Allez sur [Supabase Dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet
3. Allez dans **Database** → **Webhooks**

### Étape 2 : Créer le Webhook
Cliquez sur **"Create a new webhook"** et configurez :

| Paramètre | Valeur |
|-----------|--------|
| **Name** | `wordpress_media_sync` |
| **Table** | `media_contents` |
| **Events** | ✅ INSERT, ✅ UPDATE, ✅ DELETE |
| **Type** | HTTP Request |
| **Method** | POST |
| **URL** | `https://votre-site.com/wp-json/siports/v1/sync` |

### Étape 3 : Ajouter les Headers HTTP
Dans la section **HTTP Headers**, ajoutez :

```
X-Webhook-Secret: siports_webhook_2024
```

### Étape 4 : Tester
1. Ajoutez un nouveau média dans l'application SIPORTS
2. Vérifiez que le contenu apparaît immédiatement sur WordPress

---

## Shortcodes Disponibles

### Liste de Médias
```html
[media_list type="webinar" limit="6" columns="3"]
```

**Options :**
- `type` : webinar, podcast, capsule_inside, live_studio, best_moments, testimonial
- `limit` : Nombre de médias (défaut: 10)
- `columns` : Colonnes de la grille (défaut: 3)
- `layout` : grid ou list (défaut: grid)

### Média Unique
```html
[media id="uuid-du-media"]
```

### Article
```html
[article id="uuid-de-larticle"]
```

---

## Page Admin WordPress

Accédez à **Réglages** → **SIPORTS Articles** pour :
- ✅ Voir le statut de la synchronisation
- 🔄 Rafraîchir manuellement le cache
- 🧪 Tester la connexion API
- 📋 Copier l'URL du webhook

---

## Dépannage

### Les médias ne s'affichent pas
1. Allez dans **Réglages** → **SIPORTS Articles**
2. Cliquez sur **"Tester l'API"**
3. Si l'erreur persiste, cliquez sur **"Rafraîchir maintenant"**

### Le webhook ne fonctionne pas
1. Vérifiez que l'URL du webhook est correcte
2. Vérifiez que le header `X-Webhook-Secret` est bien configuré
3. Testez l'URL : `https://votre-site.com/wp-json/siports/v1/status`

---

## Support

Pour toute question, contactez l'équipe SIPORTS à support@siportevent.com
