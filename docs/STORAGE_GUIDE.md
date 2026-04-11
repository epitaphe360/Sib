# Guide d'utilisation du système de stockage d'images

Ce document explique comment utiliser le système de stockage d'images dans le projet SiPorts.

## Table des matières

1. [Introduction](#introduction)
2. [Service de stockage](#service-de-stockage)
3. [Composants d'interface utilisateur](#composants-d'interface-utilisateur)
4. [Hook personnalisé](#hook-personnalisé)
5. [Exemples d'utilisation](#exemples-d'utilisation)
6. [Structure des buckets](#structure-des-buckets)
7. [Gestion des permissions](#gestion-des-permissions)
8. [Bonnes pratiques](#bonnes-pratiques)

## Introduction

Le système de stockage d'images permet de gérer l'upload, le stockage et la récupération d'images et d'autres fichiers dans l'application SiPorts. Il utilise Supabase Storage comme backend de stockage et offre une interface simple pour manipuler les fichiers.

## Service de stockage

Le service de stockage (`StorageService`) est le cœur du système. Il offre les fonctionnalités suivantes :

- Upload d'images individuelles
- Upload de plusieurs images en même temps
- Suppression d'images
- Création et vérification de buckets
- Listage des fichiers
- Récupération de métadonnées
- Déplacement de fichiers

### Exemple d'utilisation du service

```typescript
import { StorageService } from '../services/storage/storageService';

// Télécharger une image
const imageUrl = await StorageService.uploadImage(
  file, // instance de File
  'exhibitors', // nom du bucket
  'exhibitor-123' // dossier optionnel
);

// Supprimer une image
await StorageService.deleteImage(imageUrl, 'exhibitors');

// Lister les fichiers
const files = await StorageService.listFiles('exhibitors', 'exhibitor-123');
```

## Composants d'interface utilisateur

Trois composants sont disponibles pour faciliter l'intégration dans l'interface utilisateur :

### ImageUploader

Composant pour télécharger une seule image, avec prévisualisation et fonctionnalités de suppression.

```tsx
import { ImageUploader } from '../components/ui/upload';

<ImageUploader
  initialImageUrl={logo}
  onImageUploaded={setLogo}
  bucket="exhibitors"
  folder={exhibitorId}
  aspectRatio="square"
  maxSizeMB={2}
/>
```

### MultiImageUploader

Composant pour télécharger et gérer plusieurs images, avec fonctionnalité de réorganisation par glisser-déposer.

```tsx
import { MultiImageUploader } from '../components/ui/upload';

<MultiImageUploader
  initialImages={product.images}
  onImagesUploaded={setImages}
  bucket="products"
  folder={`${exhibitorId}/${productId}`}
  maxImages={8}
  minImages={1}
/>
```

### MediaManager

Interface complète de gestion de médias avec fonctionnalités de recherche, filtrage, suppression et sélection.

```tsx
import { MediaManager } from '../components/ui/upload';

<MediaManager
  bucket="media"
  onSelect={handleImageSelect}
  showUploadButton={true}
  maxSelections={1}
  allowDelete={true}
  allowFolderCreation={true}
/>
```

## Hook personnalisé

Le hook `useStorage` facilite l'utilisation du service de stockage dans les composants React :

```tsx
import { useStorage } from '../hooks/storage/useStorage';

function MyComponent() {
  const { 
    uploadFile, 
    uploadFiles, 
    deleteFile, 
    listFiles, 
    loading, 
    error, 
    progress 
  } = useStorage({
    bucket: 'products',
    folder: 'product-123',
    maxSizeMB: 5
  });

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    try {
      const url = await uploadFile(file);
      console.log('Image téléchargée :', url);
    } catch (err) {
      console.error('Erreur :', err);
    }
  };

  return (
    <div>
      {loading && <div>Chargement... {progress}%</div>}
      {error && <div>Erreur : {error}</div>}
      <input type="file" onChange={handleFileChange} />
    </div>
  );
}
```

## Exemples d'utilisation

### Profil exposant avec logo

```tsx
import { ImageUploader } from '../components/ui/upload';

function ExhibitorProfileForm({ exhibitor }) {
  const [logo, setLogo] = useState(exhibitor.logo || '');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateExhibitor({ ...formData, logo });
      showSuccessMessage();
    } catch (err) {
      showErrorMessage(err);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label>Logo de l'entreprise</label>
        <ImageUploader
          initialImageUrl={logo}
          onImageUploaded={setLogo}
          bucket="exhibitors"
          folder={exhibitor.id}
          aspectRatio="square"
        />
      </div>
      {/* Autres champs du formulaire */}
      <button type="submit">Enregistrer</button>
    </form>
  );
}
```

### Galerie de produit avec plusieurs images

```tsx
import { MultiImageUploader } from '../components/ui/upload';

function ProductForm({ product, exhibitorId }) {
  const [images, setImages] = useState(product?.images || []);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (product) {
        await updateProduct(product.id, { ...formData, images });
      } else {
        await createProduct({ ...formData, images });
      }
      showSuccessMessage();
    } catch (err) {
      showErrorMessage(err);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Autres champs du formulaire */}
      <div className="mb-4">
        <label>Images du produit</label>
        <MultiImageUploader
          initialImages={images}
          onImagesUploaded={setImages}
          bucket="products"
          folder={`${exhibitorId}/${product?.id || 'new'}`}
          maxImages={8}
        />
      </div>
      <button type="submit">Enregistrer</button>
    </form>
  );
}
```

### Gestionnaire de médias administrateur

```tsx
import AdminMediaManager from '../components/admin/media/AdminMediaManager';

function AdminPage() {
  const [selectedImage, setSelectedImage] = useState(null);
  
  return (
    <div>
      <h1>Gestion des médias</h1>
      
      {selectedImage && (
        <div>
          <h2>Image sélectionnée</h2>
          <img src={selectedImage} alt="Selected" width={200} />
          <button onClick={() => navigator.clipboard.writeText(selectedImage)}>
            Copier l'URL
          </button>
        </div>
      )}
      
      <AdminMediaManager
        onImageSelect={setSelectedImage}
        title="Gestionnaire de médias"
        showUploadButton={true}
      />
    </div>
  );
}
```

## Structure des buckets

Le système utilise les buckets suivants pour organiser les fichiers :

- `images` : Bucket général pour les images diverses
- `exhibitors` : Logos et images des exposants (structure: `/{exhibitorId}/...`)
- `products` : Images des produits (structure: `/{exhibitorId}/{productId}/...`)
- `minisite-galleries` : Images des galeries des mini-sites (structure: `/{exhibitorId}/...`)
- `events` : Images des événements (structure: `/{eventId}/...`)
- `news` : Images des actualités (structure: `/{newsId}/...`)
- `media` : Bucket général pour l'interface d'administration

## Gestion des permissions

Par défaut, tous les buckets sont créés en mode public, ce qui signifie que les fichiers sont accessibles via leurs URLs publiques. Pour la production, vous devriez configurer des politiques de sécurité (RLS) dans Supabase pour limiter l'accès aux fichiers.

## Bonnes pratiques

1. **Toujours utiliser des dossiers structurés** : Organisez vos fichiers en suivant une structure logique (ex: `/{type}/{id}/...`).

2. **Limiter la taille des fichiers** : Utilisez le paramètre `maxSizeMB` pour limiter la taille des fichiers téléchargés.

3. **Nettoyer les fichiers inutilisés** : Supprimez les fichiers qui ne sont plus utilisés pour économiser de l'espace.

4. **Utiliser des UUID pour les noms de fichiers** : Le service génère automatiquement des noms de fichiers uniques avec UUID pour éviter les collisions.

5. **Sécuriser les buckets en production** : Configurez des politiques RLS pour contrôler qui peut télécharger/supprimer des fichiers.

6. **Préférer les composants d'interface** : Utilisez les composants fournis plutôt que d'appeler directement le service pour une meilleure expérience utilisateur.

7. **Gérer les erreurs** : Implémentez une gestion appropriée des erreurs pour informer les utilisateurs en cas de problème.
