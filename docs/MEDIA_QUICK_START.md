# 🎬 Guide de Démarrage Rapide - Fonctionnalités Médias

## 📦 Ce qui a été créé

Voici tous les fichiers créés pour intégrer les fonctionnalités médias dans votre application SIB :

### 1. Documentation
- ✅ `docs/MEDIA_FEATURES_INTEGRATION.md` - Guide complet d'intégration
- ✅ `docs/MEDIA_IMPLEMENTATION_PLAN.md` - Plan d'action détaillé
- ✅ Ce fichier - Guide de démarrage rapide

### 2. Base de Données
- ✅ `supabase/migrations/20250220000000_add_media_features.sql` - Migration principale
- ✅ `supabase/migrations/20250220000001_seed_media_data.sql` - Données d'exemple

### 3. Types & Services
- ✅ `src/types/media.ts` - Types TypeScript
- ✅ `src/services/mediaService.ts` - Service de gestion des médias

### 4. Composants
- ✅ `src/components/media/VideoPlayer.tsx` - Player vidéo personnalisé
- ✅ `src/components/media/MediaCard.tsx` - Card média réutilisable

### 5. Pages
- ✅ `src/pages/media/WebinarsPage.tsx` - Page des webinaires

### 6. Routes
- ✅ Routes médias ajoutées dans `src/lib/routes.ts`

---

## 🚀 Mise en Place (5 minutes)

### Étape 1 : Appliquer les migrations Supabase

#### Option A : Via l'interface Supabase (Recommandé)

1. **Connectez-vous à votre projet Supabase**
   - Allez sur https://app.supabase.com
   - Sélectionnez votre projet SIB

2. **Ouvrez l'éditeur SQL**
   - Cliquez sur "SQL Editor" dans le menu de gauche
   - Cliquez sur "New query"

3. **Copiez le contenu de la migration**
   ```bash
   # Copiez le contenu de ce fichier :
   supabase/migrations/20250220000000_add_media_features.sql
   ```

4. **Exécutez la migration**
   - Collez le SQL dans l'éditeur
   - Cliquez sur "Run"
   - Vérifiez qu'il n'y a pas d'erreurs

5. **Ajoutez les données d'exemple (optionnel)**
   ```bash
   # Copiez le contenu de :
   supabase/migrations/20250220000001_seed_media_data.sql
   ```

#### Option B : Via la CLI Supabase

```bash
# Si vous avez Supabase CLI installé
cd supabase
supabase db push
```

### Étape 2 : Créer les buckets de stockage

1. **Dans Supabase Dashboard**
   - Allez dans "Storage"
   - Créez un nouveau bucket : `media-contents`
   - Configurez comme "Public"
   - Créez un autre bucket : `media-thumbnails`
   - Configurez comme "Public"

2. **Ou via SQL**
   ```sql
   -- Créer les buckets
   INSERT INTO storage.buckets (id, name, public)
   VALUES 
     ('media-contents', 'media-contents', true),
     ('media-thumbnails', 'media-thumbnails', true);
   ```

### Étape 3 : Ajouter les routes dans votre App.tsx

Ouvrez `src/App.tsx` et ajoutez les nouvelles routes :

```typescript
import WebinarsPage from './pages/media/WebinarsPage';
// ... autres imports

// Dans votre Router, ajoutez :
<Route path={ROUTES.WEBINARS} element={<WebinarsPage />} />
// Ajoutez d'autres routes au fur et à mesure
```

### Étape 4 : Ajouter un lien dans la navigation

Ajoutez un lien vers les médias dans votre menu principal :

```typescript
// Dans votre composant de navigation
<Link to={ROUTES.WEBINARS}>
  <Play className="h-5 w-5" />
  <span>Médias</span>
</Link>
```

---

## ✅ Vérification de l'Installation

### 1. Vérifier les tables

```sql
-- Dans Supabase SQL Editor
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'media%';

-- Devrait retourner :
-- media_contents
-- media_interactions
-- media_playlists
-- live_events
```

### 2. Vérifier les données d'exemple

```sql
SELECT type, title, status, views_count 
FROM media_contents 
ORDER BY published_at DESC;

-- Devrait retourner plusieurs médias de test
```

### 3. Tester l'application

1. Démarrez votre application :
   ```bash
   npm run dev
   ```

2. Naviguez vers : `http://localhost:5173/media/webinars`

3. Vous devriez voir la page des webinaires avec les données d'exemple

---

## 🎯 Prochaines Étapes Recommandées

### Immédiat (Jour 1)
1. ✅ **Testez la page webinaires** que nous avons créée
2. **Créez la page des podcasts** (similaire à WebinarsPage)
3. **Ajoutez le composant AudioPlayer**

### Court terme (Semaine 1)
4. **Créez les pages de détail** pour chaque type de média
5. **Implémentez l'interface admin** pour créer des médias
6. **Intégrez l'upload vidéo/audio**

### Moyen terme (Semaine 2-3)
7. **Ajoutez les autres pages** (Capsules, Live Studio, etc.)
8. **Configurez le streaming live**
9. **Implémentez les analytics**

---

## 📝 Exemples d'Utilisation

### 1. Créer un nouveau webinaire (Admin)

```typescript
import { MediaService } from '../services/mediaService';

const createWebinar = async () => {
  const webinar = await MediaService.createMedia({
    type: 'webinar',
    title: 'Mon Webinaire',
    description: 'Description...',
    video_url: 'https://...',
    thumbnail_url: 'https://...',
    duration: 3600,
    speakers: [
      {
        name: 'Jean Dupont',
        title: 'CEO',
        company: 'MaCompagnie'
      }
    ],
    tags: ['innovation', 'port'],
    category: 'Technologie',
    status: 'published',
    sponsor_partner_id: 'partner-uuid'
  });
  
  console.log('Webinaire créé:', webinar);
};
```

### 2. Enregistrer une vue

```typescript
import { MediaService } from '../services/mediaService';

const recordView = async (userId: string, mediaId: string) => {
  await MediaService.recordInteraction({
    user_id: userId,
    media_content_id: mediaId,
    action: 'view',
    watch_time: 1800, // 30 minutes
    completed: false,
    metadata: {}
  });
};
```

### 3. Récupérer les webinaires

```typescript
import { MediaService } from '../services/mediaService';

const loadWebinars = async () => {
  const webinars = await MediaService.getMediaByType('webinar', {
    status: 'published',
    orderBy: 'published_at',
    order: 'desc',
    limit: 10
  });
  
  console.log('Webinaires:', webinars);
};
```

---

## 🔧 Personnalisation

### Changer les couleurs

Dans `WebinarsPage.tsx`, modifiez les classes Tailwind :

```typescript
// Actuel : bleu/violet
className="bg-gradient-to-r from-blue-600 to-purple-600"

// Alternative : orange/rouge
className="bg-gradient-to-r from-orange-600 to-red-600"

// Alternative : vert/bleu
className="bg-gradient-to-r from-green-600 to-blue-600"
```

### Modifier le nombre de cartes par ligne

```typescript
// Actuel : 3 colonnes sur grand écran
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"

// 4 colonnes sur très grand écran
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"

// 2 colonnes maximum
className="grid grid-cols-1 lg:grid-cols-2 gap-6"
```

---

## 🐛 Dépannage

### Problème : "Table media_contents does not exist"

**Solution :** La migration n'a pas été exécutée
```bash
# Vérifiez que vous avez bien exécuté :
supabase/migrations/20250220000000_add_media_features.sql
```

### Problème : "Permission denied for table media_contents"

**Solution :** Les RLS policies ne sont pas activées
```sql
-- Vérifiez les policies :
SELECT * FROM pg_policies WHERE tablename = 'media_contents';
```

### Problème : Vidéo ne se charge pas

**Solution :** 
1. Vérifiez l'URL de la vidéo
2. Assurez-vous que le CORS est configuré
3. Testez avec une vidéo de démo :
   ```typescript
   video_url: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4'
   ```

### Problème : Les données d'exemple ne s'affichent pas

**Solution :**
```sql
-- Vérifiez les données :
SELECT * FROM media_contents WHERE status = 'published';

-- Vérifiez les policies :
SELECT * FROM media_contents; -- Doit fonctionner même sans auth
```

---

## 📚 Ressources Utiles

### Documentation
- [Supabase Storage](https://supabase.com/docs/guides/storage)
- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [React Player](https://www.npmjs.com/package/react-player) (alternative)

### Services de Streaming Vidéo
- [Cloudflare Stream](https://www.cloudflare.com/products/cloudflare-stream/) - Recommandé
- [Mux](https://mux.com/) - Alternative
- [YouTube API](https://developers.google.com/youtube/v3) - Gratuit

### Outils
- [FFmpeg](https://ffmpeg.org/) - Conversion vidéo
- [HandBrake](https://handbrake.fr/) - Compression vidéo GUI
- [Audacity](https://www.audacityteam.org/) - Édition audio

---

## 💡 Conseils Pro

### 1. Optimisation Vidéo

Pour de meilleures performances :
- **Résolution :** 1080p maximum (720p recommandé)
- **Format :** MP4 (H.264)
- **Bitrate :** 2-5 Mbps
- **Audio :** AAC, 128 kbps

### 2. Thumbnails

Créez des miniatures attractives :
- **Dimension :** 1280x720 pixels (16:9)
- **Format :** JPEG ou WebP
- **Poids :** < 200 KB
- **Texte :** Titre visible et accrocheur

### 3. SEO

Optimisez pour le référencement :
- Remplissez `seo_title`, `seo_description`, `seo_keywords`
- Utilisez des descriptions riches
- Ajoutez des transcripts pour l'accessibilité

### 4. Analytics

Trackez les bonnes métriques :
- Taux de complétion
- Temps de visionnage moyen
- Taux d'engagement
- Sources de trafic

---

## 🎉 C'est Prêt !

Vous avez maintenant :
- ✅ Base de données configurée
- ✅ Services prêts à l'emploi
- ✅ Composants réutilisables
- ✅ Page webinaires fonctionnelle
- ✅ Données d'exemple pour tester

**Prochaine étape :** Choisissez une fonctionnalité à implémenter et lancez-vous !

---

## 🆘 Besoin d'Aide ?

Si vous rencontrez un problème ou souhaitez ajouter une fonctionnalité :

1. **Podcasts** → "Crée la page des podcasts SIB Talks"
2. **Admin** → "Crée l'interface admin pour gérer les médias"
3. **Upload** → "Implémente l'upload vidéo avec Supabase Storage"
4. **Live** → "Crée le système de streaming en direct"
5. **Analytics** → "Ajoute les statistiques détaillées"

Dites-moi ce que vous voulez faire en premier ! 🚀
