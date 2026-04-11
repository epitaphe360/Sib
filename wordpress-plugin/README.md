# 🎨 SIPORTS Articles & Médias - Plugin Elementor Pro

## 📋 Vue d'ensemble

Ce plugin permet d'**afficher les articles ET les médias SIPORTS** (webinaires, podcasts, capsules, etc.) sur n'importe quel site WordPress avec **Elementor Pro** via des shortcodes et des widgets dédiés.

---

## ✨ Fonctionnalités

### Articles
- ✅ **Shortcode WordPress** : `[article id="uuid"]`
- ✅ **Widget Elementor Pro** : Glisser-déposer dans l'éditeur
- ✅ **API REST** : Récupération des articles depuis Supabase
- ✅ **Cache intelligent** : 1 heure de cache automatique
- ✅ **3 layouts** : Full, Compact, Minimal
- ✅ **Options d'affichage** : Image, extrait, contenu, tags, meta

### Médias (NOUVEAU)
- ✅ **Shortcode WordPress** : `[media id="uuid"]`
- ✅ **Widget Elementor Pro** : Widget dédié pour les médias
- ✅ **6 types de médias** : Webinaires, Podcasts, Capsules, Live Studio, Best Moments, Testimonials
- ✅ **Players intégrés** : Vidéo HTML5 et Audio HTML5
- ✅ **Statistiques** : Vues, likes, partages
- ✅ **Lecture automatique** : Option autoplay
- ✅ **Badges colorés** : Badge par type de média

### Commun
- ✅ **Responsive** : Mobile, tablette, desktop
- ✅ **Dark mode** : Support automatique
- ✅ **SEO optimisé** : Balises sémantiques

---

## 📦 Installation

### Étape 1 : Télécharger le plugin

1. Téléchargez le dossier `wordpress-plugin`
2. Renommez-le en `siports-articles-shortcode`
3. Zippez le dossier complet

### Étape 2 : Installer sur WordPress

1. Connectez-vous à votre **admin WordPress**
2. Allez dans **Extensions** → **Ajouter**
3. Cliquez sur **Téléverser une extension**
4. Sélectionnez le fichier ZIP
5. Cliquez sur **Installer maintenant**
6. Cliquez sur **Activer**

### Étape 3 : Vérifier l'installation

1. Allez dans **Réglages** → **SIPORTS Articles**
2. Vérifiez que l'API est accessible
3. Si Elementor Pro est installé, vous verrez une confirmation

---

## 🚀 Utilisation

### Méthode 1 : Shortcodes WordPress

#### 📝 Shortcode Article

**Usage basique**
```php
[article id="00000000-0000-0000-0000-000000000401"]
```

**Avec options**
```php
[article 
  id="00000000-0000-0000-0000-000000000401" 
  layout="compact" 
  show_image="yes" 
  show_excerpt="yes" 
  show_content="yes" 
  show_tags="yes" 
  show_meta="yes"
]
```

**Options disponibles**

| Option | Valeurs | Défaut | Description |
|--------|---------|--------|-------------|
| `id` | UUID | *requis* | ID de l'article depuis le Dashboard Marketing |
| `layout` | full, compact, minimal | full | Type d'affichage |
| `show_image` | yes, no | yes | Afficher l'image à la une |
| `show_excerpt` | yes, no | yes | Afficher l'extrait |
| `show_content` | yes, no | yes | Afficher le contenu complet |
| `show_tags` | yes, no | yes | Afficher les tags |
| `show_meta` | yes, no | yes | Afficher auteur et date |

---

#### 🎥 Shortcode Média (NOUVEAU)

**Usage basique**
```php
[media id="00000000-0000-0000-0000-000000000501"]
```

**Avec options**
```php
[media 
  id="00000000-0000-0000-0000-000000000501" 
  layout="full" 
  show_thumbnail="yes" 
  show_description="yes" 
  show_tags="yes" 
  show_stats="yes"
  autoplay="no"
]
```

**Options disponibles**

| Option | Valeurs | Défaut | Description |
|--------|---------|--------|-------------|
| `id` | UUID | *requis* | ID du média depuis le Dashboard Marketing |
| `layout` | full, compact, minimal | full | Type d'affichage |
| `show_thumbnail` | yes, no | yes | Afficher la vignette |
| `show_description` | yes, no | yes | Afficher la description |
| `show_tags` | yes, no | yes | Afficher les tags |
| `show_stats` | yes, no | yes | Afficher les statistiques (vues/likes/partages) |
| `autoplay` | yes, no | no | Démarrer automatiquement le média |

**Types de médias supportés :**

| Type | Badge | Description | Player |
|------|-------|-------------|--------|
| webinar | 🎥 Webinaire | Webinaires sponsorisés en replay | Vidéo HTML5 |
| podcast | 🎙️ Podcast | SIPORT Talks - Épisodes audio | Audio HTML5 |
| capsule_inside | 📹 Capsule Inside | Capsules vidéo Inside SIPORT | Vidéo HTML5 |
| live_studio | 🔴 Live Studio | Meet The Leaders - Interviews | Vidéo HTML5 |
| best_moments | ⭐ Best Moments | Meilleurs moments du salon | Vidéo HTML5 |
| testimonial | 💬 Témoignage | Témoignages vidéo | Vidéo HTML5 |

---

### Méthode 2 : Widgets Elementor Pro

#### 📝 Widget "SIPORTS Article"

1. **Ouvrir une page** avec Elementor
2. **Chercher** "SIPORTS Article" dans les widgets
3. **Glisser-déposer** le widget sur la page
4. **Configurer** :
   - Entrez l'**ID de l'article**
   - Choisissez le **layout**
   - Activez/désactivez les options d'affichage
5. **Personnaliser le style** :
   - Couleur du titre
   - Taille du titre
   - Bordures
   - Ombres
6. **Publier** la page

#### 🎥 Widget "SIPORTS Média" (NOUVEAU)

1. **Ouvrir une page** avec Elementor
2. **Chercher** "SIPORTS Média" dans les widgets
3. **Glisser-déposer** le widget sur la page
4. **Configurer** :
   - Entrez l'**ID du média**
   - Choisissez le **layout**
   - Activez/désactivez les options (vignette, description, stats)
   - Activez la **lecture automatique** si besoin
5. **Personnaliser le style** :
   - Couleur du titre et description
   - Rayon de bordure
   - Ombre de la boîte
6. **Publier** la page

#### Exemple de configuration :

```
┌────────────────────────────────────┐
│ Widget : SIPORTS Article           │
├────────────────────────────────────┤
│ Contenu                            │
│ • ID de l'article: abc-123-...     │
│ • Mise en page: Complète           │
├────────────────────────────────────┤
│ Options d'affichage                │
│ ☑ Afficher l'image                 │
│ ☑ Afficher l'extrait               │
│ ☑ Afficher le contenu              │
│ ☑ Afficher les tags                │
│ ☑ Afficher auteur et date          │
├────────────────────────────────────┤
│ Style                              │
│ • Couleur du titre: #111827        │
│ • Taille du titre: 30px            │
│ • Bordure: 1px solid #E5E7EB       │
│ • Ombre: Oui                       │
└────────────────────────────────────┘
```

---

## 🎨 Layouts disponibles

### 1. **Full** (Complet)
```
┌──────────────────────────────────┐
│ [────── Image à la une ──────]   │
│                                  │
│ 📁 Catégorie  ✅ Publié          │
│                                  │
│ 🗒️ Titre de l'article            │
│                                  │
│ Extrait de l'article avec un     │
│ résumé court et accrocheur...    │
│                                  │
│ Contenu complet de l'article     │
│ avec tous les détails...         │
│                                  │
│ 🏷️ tag1  tag2  tag3              │
│                                  │
│ 👤 Auteur  📅 30 déc. 2025       │
└──────────────────────────────────┘
```

### 2. **Compact** (Horizontal)
```
┌─────────────────────────────────────┐
│ [Image]  📁 Catégorie  ✅ Publié    │
│  200px   🗒️ Titre de l'article      │
│          Extrait court...           │
│          🏷️ tag1 tag2               │
│          👤 Auteur  📅 Date         │
└─────────────────────────────────────┘
```

### 3. **Minimal** (Simple)
```
┌──────────────────────────────────┐
│ [──── Image réduite ────]        │
│                                  │
│ 🗒️ Titre de l'article            │
│                                  │
│ Extrait court...                 │
│                                  │
│ 👤 Auteur  📅 Date               │
└──────────────────────────────────┘
```

---

## 🔧 Configuration avancée

### Vider le cache

1. Allez dans **Réglages** → **SIPORTS Articles**
2. Cliquez sur **🗑️ Vider le cache**
3. Tous les articles seront rechargés depuis l'API

### Personnaliser les styles CSS

Éditez le fichier `css/siports-articles.css` :

```css
/* Personnaliser la couleur du titre */
.siports-article-title {
    color: #votre-couleur;
}

/* Personnaliser la bordure */
.siports-article {
    border: 2px solid #votre-couleur;
}
```

### Modifier le temps de cache

Dans `siports-articles-shortcode.php`, ligne 15 :

```php
// Changer de 3600 (1h) à 1800 (30min)
define('SIPORTS_CACHE_TIME', 1800);
```

---

## 📊 API REST

### Endpoints disponibles

#### 1. Récupérer un article
```
GET https://siportv3.up.railway.app/api/articles/{id}
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "id": "00000000-0000-0000-0000-000000000401",
    "title": "SIPORTS 2025 : Record d'affluence",
    "content": "<p>Le salon...</p>",
    "excerpt": "Le salon SIPORTS 2025...",
    "author": "Admin SIPORTS",
    "category": "Événement",
    "tags": ["SIPORTS", "Salon", "Innovation"],
    "image_url": "https://...",
    "published_at": "2025-12-28T10:00:00Z",
    "created_at": "2025-12-28T10:00:00Z"
  }
}
```

#### 2. Lister les articles
```
GET https://siportv3.up.railway.app/api/articles?limit=10&offset=0
```

**Paramètres :**
- `limit` : Nombre d'articles (défaut: 10)
- `offset` : Pagination (défaut: 0)
- `category` : Filtrer par catégorie
- `search` : Recherche par titre

**Réponse :**
```json
{
  "success": true,
  "data": [
    { /* article 1 */ },
    { /* article 2 */ }
  ],
  "pagination": {
    "total": 25,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

---

## 🎯 Exemples pratiques

### Exemple 1 : Page d'actualités

```php
<!-- Dans Elementor ou votre éditeur WordPress -->
<div class="actualites-grid">
    <h1>Actualités SIPORTS</h1>
    
    [article id="00000000-0000-0000-0000-000000000401" layout="full"]
    [article id="00000000-0000-0000-0000-000000000402" layout="compact"]
    [article id="00000000-0000-0000-0000-000000000403" layout="minimal"]
</div>
```

### Exemple 2 : Homepage avec featured article

```php
<!-- Section Hero -->
<section class="hero">
    <h1>Bienvenue à SIPORTS 2025</h1>
    [article id="article-vedette-uuid" layout="full" show_tags="no"]
</section>
```

### Exemple 3 : Sidebar avec articles compacts

```php
<!-- Widget Sidebar -->
<aside class="sidebar">
    <h3>Dernières actualités</h3>
    [article id="uuid-1" layout="minimal" show_content="no"]
    [article id="uuid-2" layout="minimal" show_content="no"]
    [article id="uuid-3" layout="minimal" show_content="no"]
</aside>
```

### Exemple 4 : Grid avec Elementor

Dans Elementor :
1. Créez une **Section** avec 3 colonnes
2. Dans chaque colonne, ajoutez le widget **SIPORTS Article**
3. Configurez chaque article avec layout="compact"
4. Résultat : Grille responsive de 3 articles

---

## 🐛 Dépannage

### Erreur : "Article non trouvé"

**Causes possibles :**
- ❌ L'ID de l'article est incorrect
- ❌ L'article n'est pas publié
- ❌ L'article a été supprimé

**Solution :**
1. Vérifiez l'ID dans le Dashboard Marketing
2. Assurez-vous que l'article est publié (✅)
3. Copiez-collez le shortcode exact

---

### L'article ne s'affiche pas

**Vérifications :**
1. Le plugin est-il activé ? ✅
2. L'API est-elle accessible ? (Test : https://siportv3.up.railway.app/api/articles)
3. Le cache est-il vidé ? (Réglages → SIPORTS Articles → Vider le cache)
4. Y a-t-il des erreurs JavaScript ? (Console du navigateur)

---

### Problème de style CSS

**Solution :**
1. Videz le cache de WordPress
2. Videz le cache d'Elementor (Elementor → Outils → Régénérer CSS)
3. Videz le cache du navigateur (Ctrl+F5)
4. Vérifiez que `siports-articles.css` est bien chargé

---

### Le widget Elementor n'apparaît pas

**Causes :**
- ❌ Elementor Pro n'est pas installé
- ❌ Version incompatible d'Elementor

**Solution :**
1. Installez Elementor Pro (version 3.0+)
2. Désactivez puis réactivez le plugin SIPORTS
3. Videz le cache

---

## 📈 Performance

### Optimisation du cache

Le plugin utilise le système de **transients WordPress** :
- ✅ Cache automatique de 1 heure
- ✅ Cache indépendant par article
- ✅ Invalidation manuelle possible
- ✅ Pas de surcharge serveur

### Optimisation des images

Les images sont chargées avec :
- ✅ `loading="lazy"` (lazy loading natif)
- ✅ Responsive (s'adapte à la taille de l'écran)
- ✅ Compression automatique

---

## 🔒 Sécurité

### Mesures de sécurité

- ✅ **Échappement des données** : `esc_html()`, `esc_attr()`, `esc_url()`
- ✅ **Sanitization** : `wp_kses_post()` pour le HTML
- ✅ **CORS** : Headers sécurisés sur l'API
- ✅ **Cache** : Pas de données sensibles en cache
- ✅ **Validation** : Vérification des IDs et paramètres

---

## 📱 Support mobile

### Breakpoints

- **Desktop** : > 768px - Layout complet
- **Tablette** : 481-768px - Layout adapté
- **Mobile** : < 480px - Layout vertical

### Tests recommandés

Testez sur :
- ✅ iPhone (Safari iOS)
- ✅ Android (Chrome)
- ✅ iPad (Safari)
- ✅ Desktop (Chrome, Firefox, Safari)

---

## 🌍 Compatibilité

### WordPress
- ✅ Version 5.8+
- ✅ PHP 7.4+
- ✅ MySQL 5.6+

### Elementor
- ✅ Elementor 3.0+
- ✅ Elementor Pro 3.0+

### Thèmes
- ✅ Compatible avec tous les thèmes WordPress
- ✅ Compatible avec GeneratePress, Astra, OceanWP, etc.

---

## 📞 Support

### Obtenir de l'aide

- 📧 **Email** : support@siportevent.com
- 💬 **Discord** : Canal #support-wordpress
- 📚 **Documentation** : https://siportevent.com/docs

### Signaler un bug

Envoyez un email avec :
1. Version de WordPress
2. Version d'Elementor
3. Shortcode utilisé
4. Message d'erreur (capture d'écran)
5. URL de la page concernée

---

## 🔄 Mises à jour

### Changelog

**Version 1.0.0** (30 décembre 2025)
- ✅ Release initiale
- ✅ Shortcode WordPress
- ✅ Widget Elementor Pro
- ✅ API REST
- ✅ 3 layouts (full, compact, minimal)
- ✅ Cache intelligent
- ✅ Responsive design
- ✅ Dark mode

---

## 📜 Licence

Ce plugin est propriétaire de **SIPORTS** et réservé à un usage interne.

---

**Dernière mise à jour :** 30 décembre 2025  
**Auteur :** Équipe Technique SIPORTS  
**Version :** 1.0.0
