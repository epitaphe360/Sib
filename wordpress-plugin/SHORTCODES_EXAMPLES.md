# 📋 Exemples de Shortcodes SIPORTS

Guide complet avec exemples pratiques pour utiliser tous les shortcodes disponibles.

---

## 🎥 Shortcode `[media_list]` - Afficher une liste de médias

### Usage de base

```php
[media_list]
```
Affiche les 10 derniers médias (tous types confondus)

---

### Afficher tous les webinaires

```php
[media_list type="webinar" limit="6"]
```

**Résultat** : 6 derniers webinaires en grille de 3 colonnes

---

### Afficher tous les podcasts

```php
[media_list type="podcast" limit="9" columns="3"]
```

**Résultat** : 9 podcasts en grille de 3 colonnes

---

### Afficher toutes les capsules Inside

```php
[media_list type="capsule_inside" limit="8" columns="4"]
```

**Résultat** : 8 capsules en grille de 4 colonnes

---

### Afficher les Live Studio

```php
[media_list type="live_studio" limit="6"]
```

**Résultat** : 6 interviews Live Studio

---

### Afficher les Best Moments

```php
[media_list type="best_moments" limit="4" columns="2"]
```

**Résultat** : 4 meilleurs moments en 2 colonnes

---

### Afficher les témoignages

```php
[media_list type="testimonial" limit="6" show_stats="yes"]
```

**Résultat** : 6 témoignages avec statistiques (vues, likes)

---

### Options complètes

```php
[media_list 
    type="webinar"
    category="Partenaires" 
    limit="12" 
    layout="grid" 
    columns="3"
    show_thumbnail="yes"
    show_description="yes"
    show_stats="yes"
]
```

---

## 🎬 Shortcode `[media]` - Afficher UN média

### Webinaire avec lecture automatique

```php
[media id="abc-123" autoplay="yes" show_stats="yes"]
```

### Podcast en mode compact

```php
[media id="def-456" layout="compact" show_description="no"]
```

### Capsule vidéo minimale

```php
[media id="ghi-789" layout="minimal" show_thumbnail="no"]
```

---

## 📝 Shortcode `[article]` - Afficher UN article

### Article complet

```php
[article id="article-001" show_content="yes"]
```

### Article compact

```php
[article id="article-002" layout="compact" show_image="no"]
```

---

## 🎨 Exemples de Pages Complètes

### Page "Nos Webinaires"

```html
<h1>🎥 Découvrez nos webinaires SIPORT</h1>
<p>Retrouvez tous nos webinaires en replay</p>

<!-- Webinaire principal -->
[media id="webinar-featured" layout="full" autoplay="no"]

<h2>Autres webinaires</h2>
[media_list type="webinar" limit="9" columns="3"]
```

---

### Page "Podcasts SIPORT Talks"

```html
<h1>🎙️ Podcasts SIPORT Talks</h1>
<p>Écoutez nos interviews et débats</p>

[media_list type="podcast" limit="12" columns="3" show_stats="yes"]
```

---

### Page "Capsules Inside"

```html
<h1>📹 Capsules Inside SIPORT</h1>
<p>Plongez au cœur de l'événement</p>

[media_list type="capsule_inside" limit="8" columns="4" show_description="no"]
```

---

### Page "Meet The Leaders"

```html
<h1>🔴 Live Studio - Meet The Leaders</h1>
<p>Interviews exclusives avec les leaders</p>

[media_list type="live_studio" limit="6" columns="2"]
```

---

### Page "Meilleurs Moments"

```html
<h1>⭐ Best Moments du Salon</h1>
<p>Revivez les temps forts</p>

[media_list type="best_moments" limit="8" columns="4" show_stats="yes"]
```

---

### Page "Témoignages"

```html
<h1>💬 Témoignages des Exposants</h1>
<p>Ils témoignent de leur expérience</p>

[media_list type="testimonial" limit="9" columns="3"]
```

---

### Page "Bibliothèque Multimédia Complète"

```html
<h1>📚 Bibliothèque Multimédia</h1>
<p>Tous nos contenus en un seul endroit</p>

<h2>🎥 Webinaires</h2>
[media_list type="webinar" limit="3" columns="3"]

<h2>🎙️ Podcasts</h2>
[media_list type="podcast" limit="3" columns="3"]

<h2>📹 Capsules Inside</h2>
[media_list type="capsule_inside" limit="3" columns="3"]

<h2>🔴 Live Studio</h2>
[media_list type="live_studio" limit="3" columns="3"]

<h2>⭐ Best Moments</h2>
[media_list type="best_moments" limit="3" columns="3"]

<h2>💬 Témoignages</h2>
[media_list type="testimonial" limit="3" columns="3"]
```

---

### Page "Actualités & Ressources"

```html
<h1>📰 Actualités & Ressources</h1>

<section>
    <h2>Derniers Articles</h2>
    [article id="article-1" layout="full" show_content="yes"]
    [article id="article-2" layout="compact"]
    [article id="article-3" layout="compact"]
</section>

<section>
    <h2>Derniers Webinaires</h2>
    [media_list type="webinar" limit="3" columns="3"]
</section>

<section>
    <h2>Derniers Podcasts</h2>
    [media_list type="podcast" limit="3" columns="3"]
</section>
```

---

## ⚙️ Tableau des Options

### Options `[media_list]`

| Option | Valeurs | Défaut | Description |
|--------|---------|--------|-------------|
| `type` | webinar, podcast, capsule_inside, live_studio, best_moments, testimonial | *(tous)* | Type de média |
| `category` | Texte libre | *(toutes)* | Catégorie |
| `limit` | Nombre | 10 | Nombre de médias |
| `layout` | grid, list | grid | Type d'affichage |
| `columns` | 2, 3, 4 | 3 | Nombre de colonnes (mode grid) |
| `show_thumbnail` | yes, no | yes | Afficher la vignette |
| `show_description` | yes, no | yes | Afficher la description |
| `show_stats` | yes, no | no | Afficher les stats (vues, likes) |

### Options `[media]`

| Option | Valeurs | Défaut | Description |
|--------|---------|--------|-------------|
| `id` | UUID | *requis* | ID du média |
| `layout` | full, compact, minimal | full | Type d'affichage |
| `show_thumbnail` | yes, no | yes | Afficher la vignette |
| `show_description` | yes, no | yes | Afficher la description |
| `show_tags` | yes, no | yes | Afficher les tags |
| `show_stats` | yes, no | yes | Afficher les stats |
| `autoplay` | yes, no | no | Lecture automatique |

### Options `[article]`

| Option | Valeurs | Défaut | Description |
|--------|---------|--------|-------------|
| `id` | UUID | *requis* | ID de l'article |
| `layout` | full, compact, minimal | full | Type d'affichage |
| `show_image` | yes, no | yes | Afficher l'image |
| `show_excerpt` | yes, no | yes | Afficher l'extrait |
| `show_content` | yes, no | yes | Afficher le contenu |
| `show_tags` | yes, no | yes | Afficher les tags |
| `show_meta` | yes, no | yes | Afficher auteur/date |

---

## 🎯 Cas d'Usage Pratiques

### Homepage avec contenu mixte

```php
<!-- Hero avec article vedette -->
[article id="featured-article" layout="full" show_content="yes"]

<!-- Derniers webinaires -->
<h2>🎥 Webinaires Récents</h2>
[media_list type="webinar" limit="3" columns="3"]

<!-- Derniers podcasts -->
<h2>🎙️ Podcasts</h2>
[media_list type="podcast" limit="3" columns="3"]
```

### Sidebar avec témoignages

```php
<aside class="sidebar">
    <h3>💬 Ce qu'ils disent</h3>
    [media_list type="testimonial" limit="2" columns="1" layout="list" show_description="no"]
</aside>
```

### Page catégorie "Innovation"

```php
<h1>Innovation 2025</h1>

<h2>Articles Innovation</h2>
[article id="innovation-1" layout="compact"]
[article id="innovation-2" layout="compact"]

<h2>Webinaires Innovation</h2>
[media_list type="webinar" category="Innovation" limit="6"]
```

---

## 🚀 Bonnes Pratiques

### ✅ À FAIRE

- Limiter le nombre de médias à 12 maximum par page
- Utiliser `columns="3"` pour un affichage équilibré desktop
- Activer `show_stats="yes"` pour valoriser les contenus populaires
- Utiliser `layout="compact"` dans les sidebars
- Mettre en cache les pages avec beaucoup de shortcodes

### ❌ À ÉVITER

- Ne pas mettre plus de 20 médias sur une page (performance)
- Ne pas utiliser `autoplay="yes"` sur plusieurs médias
- Éviter `columns="4"` sur mobile (utilise automatiquement 1 colonne)
- Ne pas mélanger trop de types de shortcodes sur une même page

---

## 🔧 Dépannage

### Aucun média ne s'affiche

1. Vérifiez que les médias sont **publiés** dans le Dashboard Marketing
2. Vérifiez l'orthographe du `type` (webinar, podcast, etc.)
3. Videz le cache WordPress (Extensions > SIPORTS > Vider le cache)

### Les colonnes ne s'affichent pas correctement

- Sur mobile, le layout s'adapte automatiquement en 1 ou 2 colonnes
- Vérifiez que votre thème ne surcharge pas les styles CSS

### Les statistiques sont à zéro

- Les statistiques proviennent de la base de données SIPORTS
- Elles se mettent à jour en temps réel

---

✨ **Développé avec ❤️ par l'équipe SIPORTS**
